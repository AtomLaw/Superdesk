'''
Created on Jan 12, 2012

@package: Newscoop
@copyright: 2011 Sourcefabric o.p.s.
@license: http://www.gnu.org/licenses/gpl-3.0.txt
@author: Gabriel Nistor

Provides support functions for the container.
'''

from ..support.util_sys import callerLocals, callerGlobals
from ._impl.aop_container import AOPClasses, AOPResources
from ._impl.entity_handler import Wiring, WireConfig
from ._impl.ioc_setup import ConfigError, register, SetupConfig, SetupEntity, \
    setupsOf, setupFirstOf
from ._impl.support_setup import CreateEntity, SetupError, SetupEntityProxy, \
    SetupEntityWire, Assembly, CallEntity
from .aop import classesIn
from copy import deepcopy
from functools import partial
from inspect import isclass, ismodule
from _abcoll import Callable

# --------------------------------------------------------------------
# Functions available in setup modules.

def createEntitySetup(api, *impl, formatter=lambda group, clazz: group + '.' + clazz.__name__, setupModule=None):
    '''
    Creates entity setup functions for the provided API classes. The name of the setup functions that will be generated
    are formed based on the provided formatter.
    To create a setup function a class from the impl classes has to inherit at least one of the api classes then it will
    create a setup function based on the api class that will create an instance of the impl class. If a impl class
    inherits multiple api classes than for each one of the api class a setup function is generated, all setup function
    will provide the same impl instance.
    
    @param api: string|class|AOPClasses|tuple(string|class|AOPClasses)|list(string|class|AOPClasses)
        The classes to be considered as the APIs for the setup functions.
    @param impl: arguments(string|class|AOPClasses)
        The classes to be considered the implementations for the APIs.
    @param formatter: Callable
        The formatter to use in creating the entity setup function name, the Callable will take two arguments, first is
        the group where the setup function is defined and second the class for wich the setup is created. 
    @param setupModule: module|None
        If the setup module is not provided than the calling module will be considered.
    '''
    assert isinstance(formatter, Callable), 'Invalid formatter %s' % formatter
    if setupModule:
        assert ismodule(setupModule), 'Invalid setup module %s' % setupModule
        registry = setupModule.__dict__
        group = setupModule.__name__
    else:
        registry = callerLocals()
        if '__name__' not in registry:
            raise SetupError('The create entity call needs to be made directly from the module')
        group = registry['__name__']
    apis = _classes(api if isinstance(api, (tuple, list)) else [api])
    wireClasses = []
    for clazz in _classes(impl):
        apiClasses = [apiClass for apiClass in apis if issubclass(clazz, apiClass)]
        if apiClasses:
            wireClasses.append(clazz)
            create = CreateEntity(clazz)
            for apiClass in apiClasses:
                register(SetupEntity(create, type=clazz, name=formatter(group, apiClass), group=group), registry)
    wireEntities(*wireClasses, setupModule=setupModule)

def wireEntities(*classes, setupModule=None):
    '''
    Creates entity wiring setups for the provided classes. The wiring setups consists of configurations found in the
    provided classes that will be published in the setup module.
    
    @param classes: arguments(string|class|AOPClasses)
        The classes to be wired.
    @param setupModule: module|None
        If the setup module is not provided than the calling module will be considered.
    '''
    def processConfig(clazz, wconfig):
        assert isclass(clazz), 'Invalid class %s' % clazz
        assert isinstance(wconfig, WireConfig), 'Invalid wire configuration %s' % wconfig
        value = clazz.__dict__.get(wconfig.name, None)
        if value and not isclass(value): return deepcopy(value)
        if wconfig.hasValue: return deepcopy(wconfig.value)
        raise ConfigError('A configuration value is required for %r in class %r' % (wconfig.name, clazz.__name__))
    if setupModule:
        assert ismodule(setupModule), 'Invalid setup module %s' % setupModule
        registry = setupModule.__dict__
        group = setupModule.__name__
    else:
        registry = callerLocals()
        if '__name__' not in registry:
            raise SetupError('The create wiring call needs to be made directly from the module')
        group = registry['__name__']
    wirings = {}
    for clazz in _classes(classes):
        wiring = Wiring.wiringOf(clazz)
        if wiring:
            wirings[clazz] = wiring
            assert isinstance(wiring, Wiring)
            for wconfig in wiring.configurations:
                assert isinstance(wconfig, WireConfig)
                name = SetupEntityWire.nameFor(group, clazz, wconfig)
                for setup in setupsOf(registry, SetupConfig):
                    assert isinstance(setup, SetupConfig)
                    if setup.name == name: break
                else:
                    configCall = partial(processConfig, clazz, wconfig)
                    configCall.__doc__ = wconfig.description
                    register(SetupConfig(configCall, type=wconfig.type, name=name, group=group), registry)
    if wirings:
        wire = setupFirstOf(registry, SetupEntityWire)
        if wire:
            assert isinstance(wire, SetupEntityWire)
            wire.update(wirings)
        else: register(SetupEntityWire(group, wirings), registry)
    
def bindToEntities(*classes, listeners=None, setupModule=None):
    '''
    Creates entity implementation proxies for the provided entities classes found in the provided module.
    
    @param classes: arguments(string|class|AOPClasses)
        The classes to be proxied.
    @param listeners: None|Callable|list[Callable]|tuple(Callable)
        The listeners to be invoked when a proxy is created.
    @param setupModule: module|None
        If the setup module is not provided than the calling module will be considered.
    '''
    if not listeners: listeners = []
    elif not isinstance(listeners, (list, tuple)): listeners = [listeners]
    assert isinstance(listeners, (list, tuple)), 'Invalid listeners %s' % listeners
    if setupModule:
        assert ismodule(setupModule), 'Invalid setup module %s' % setupModule
        registry = setupModule.__dict__
        group = setupModule.__name__
    else:
        registry = callerLocals()
        if '__name__' not in registry:
            raise SetupError('The create proxy call needs to be made directly from the module')
        group = registry['__name__']
    register(SetupEntityProxy(group, _classes(classes), listeners), registry)

# --------------------------------------------------------------------
# Functions available in setup functions calls.

def entities():
    '''
    !Attention this function only available from within a setup functions!
    Provides all the entities references found in the current assembly wrapped in a AOP class.
    
    @return: AOP
        The resource AOP.
    '''
    return AOPResources({name:name for name, call in Assembly.current().calls.items() if isinstance(call, CallEntity)})

def entitiesLocal():
    '''
    !Attention this function only available from within a setup functions!
    Provides all the entities references for the module from where the call is made found in the current assembly.
    
    @return: AOP
        The resource AOP.
    '''
    registry = callerGlobals()
    if '__name__' not in registry:
        raise SetupError('The create call needs to be made from a module function')
    rsc = AOPResources({name:name for name, call in Assembly.current().calls.items() if isinstance(call, CallEntity)})
    rsc.filter(registry['__name__'] + '.**')
    return rsc

def entityFor(clazz):
    '''
    !Attention this function only available from within a setup functions!
    Provides the entity for the provided class (only if the setup function exposes a return type that is either the
    provided class or a super class) found in the current assembly.
    
    @param clazz: class
        The class to find the entity for.
    @return: object
        The instance for the provided class.
    @raise SetupError: In case there is no entity for the required class or there are to many.
    '''
    assert isclass(clazz), 'Invalid class %s' % clazz
    entities = [name for name, call in Assembly.current().calls.items()
                if isinstance(call, CallEntity) and call.type and (call.type == clazz or issubclass(call.type, clazz))]
    if not entities:
        raise SetupError('There is no entity setup function having a return type of class or subclass %s' % clazz)
    if len(entities) > 1:
        raise SetupError('To many entities setup functions %r having a return type of class or subclass %s' % 
                         (', '.join(entities), clazz))
    return Assembly.process(entities[0])

# --------------------------------------------------------------------

def _classes(classes):
    '''
    Provides the classes from the list of provided class references.
    
    @param classes: list(class|AOPClasses)|tuple(class|AOPClasses)
        The classes or class reference to pull the classes from.
    @return: list[class]
        the list of classes obtained.
    '''
    assert isinstance(classes, (list, tuple)), 'Invalid classes %s' % classes
    clazzes = []
    for clazz in classes:
        if isinstance(clazz, str):
            clazzes.extend(classesIn(clazz).asList())
        elif isclass(clazz): clazzes.append(clazz)
        elif isinstance(clazz, AOPClasses):
            assert isinstance(clazz, AOPClasses)
            clazzes.extend(clazz.asList())
        else: raise SetupError('Cannot use class %s' % clazz)
    return clazzes