from ally.container import ioc, support
from ally.internationalization import NC_
from acl.right_action import RightAction
from gui.action.api.action import Action
from ..acl import gui
from ..gui_action import defaults
from ..gui_action.service import addAction

# -------------------------------------------------------------------

support.listenToEntities(Action, listeners=addAction)
support.loadAllEntities(Action)

# -------------------------------------------------------------------

@ioc.entity
def configAction() -> Action:
    return Action('config', Parent=defaults.menuAction(), Label=NC_('menu', 'Configure'))

@ioc.entity
def configView() -> RightAction:
    return gui.actionRight(NC_('security', 'Configure menu view'), NC_('security', 'Allows access to configure menu.'))

@gui.setup
def registerConfigView():
    r = configView()
    r.addActions(configAction())
