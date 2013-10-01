'''
Created on Sep 24, 2013

@package: Ally-Py
@copyright: 2013 Sourcefabric o.p.s.
@license: http://www.gnu.org/licenses/gpl-3.0.txt
@author: Mugur Rus
'''

from os import makedirs
from os.path import dirname, join
from build_common import copyPackage, buildEgg
from shutil import copy

# --------------------------------------------------------------------

def buildAllyPyPackages(allyPyDir, buildDir):
    '''
    '''
    ignorePaths = ('__pycache__', '*.egg-info', 'setup.cfg', 'setup.py', '*.ant', 'MANIFEST.in')

    relocatePaths = ('gui-resources',)

    components = ('ally', 'ally-api', 'ally-core', 'ally-core-http', 'ally-core-sqlalchemy',
                  'ally-http', 'ally-http-asyncore-server', 'ally-http-mongrel2-server',
                  'ally-plugin', 'service-cdm', 'service-gateway', 'service-gateway-recaptcha')

    plugins = ('administration', 'gateway', 'gateway_captcha', 'gui-action', 'gui-core',
               'internationalization', 'security', 'security-rbac', 'support-acl',
               'support-cdm', 'support-sqlalchemy')

    makedirs(buildDir, exist_ok=True)

    for package in components:
        packageDir = join(allyPyDir, 'components', package)
        copyPackage(packageDir, buildDir, ignorePaths)

    for package in plugins:
        packageDir = join(allyPyDir, 'plugins', package)
        copyPackage(packageDir, buildDir, ignorePaths, relocatePaths)

    copy(join(dirname(__file__), 'setup-allypy', 'setup.py'), buildDir)
    copy(join(dirname(__file__), 'setup-allypy', 'setup.cfg'), buildDir)

    copyPackage(join(dirname(__file__), 'gui-core'), buildDir, (), ())

    buildEgg(buildDir)

# --------------------------------------------------------------------

if __name__ == '__main__':
    buildDir = join(dirname(__file__), 'build-allypy')
    allyPyDir = join(dirname(__file__), '..', '..')
    buildAllyPyPackages(allyPyDir, buildDir)
