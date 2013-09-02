'''
Created on Aug 30, 2013

@author: chupy
'''

from ally.container import app
from ally.container.support import entityFor
from superdesk.security.api.user_rbac import IUserRbacService
from superdesk.user.api.user import IUserService, User, QUser
import logging
from ally.support.util import firstOf
from security.api.right import IRightService, QRight, Right
from security.api.right_type import RightType, IRightTypeService
from security.rbac.api.role import IRoleService, Role
from security.rbac.api.role_rbac import IRoleRbacService
from acl.api.group import IGroupService, Group
    
# --------------------------------------------------------------------

log = logging.getLogger(__name__)

# TODO: GAbriel: remove sample data
@app.populate(app.DEVEL)
def populateGroupSamples():
    groupService = entityFor(IGroupService)
    assert isinstance(groupService, IGroupService)
    
    try: groupService.getById('Anonymous')
    except:
        group = Group()
        group.Name = 'Anonymous'
        group.IsAnonymous = True
        groupService.insert(group)
    
#    print('Security/RightType/*/Right')
#    groupService.addAcl('Anonymous', 4271904924)
#    groupService.addCompensate('Anonymous', 4271904924, 492295508)
    
#    print('HR/Person/*')
#    groupService.addAcl('Anonymous', 1141975490)
#    groupService.addCompensate('Anonymous', 1141975490, 1317217404)

# TODO: GAbriel: remove sample data
@app.populate(app.DEVEL)
def populateSamples():
    userService = entityFor(IUserService)
    assert isinstance(userService, IUserService)
    rightTypeService = entityFor(IRightTypeService)
    assert isinstance(rightTypeService, IRightTypeService)
    roleService = entityFor(IRoleService)
    assert isinstance(roleService, IRoleService)
    roleRbacService = entityFor(IRoleRbacService)
    assert isinstance(roleRbacService, IRoleRbacService)
    rightService = entityFor(IRightService)
    assert isinstance(rightService, IRightService)
    userRbacService = entityFor(IUserRbacService)
    assert isinstance(userRbacService, IUserRbacService)
    
    try: user1Id = firstOf(userService.getAll(q=QUser(name='User1')))
    except:
        user = User()
        user.Name = 'User1'
        user.Password = 'a'
        user.Type = 'standard'
        user1Id = userService.insert(user)
        
    try: user2Id = firstOf(userService.getAll(q=QUser(name='User2')))
    except:
        user = User()
        user.Name = 'User2'
        user.Password = 'a'
        user.Type = 'standard'
        user2Id = userService.insert(user)
        
    try: roleService.getById('Role1')
    except:
        role = Role()
        role.Name = 'Role1'
        roleService.insert(role)
        
    try: roleService.getById('Role2')
    except:
        role = Role()
        role.Name = 'Role2'
        roleService.insert(role)
        
    try: rightTypeService.getById('Sample')
    except:
        rightType = RightType()
        rightType.Name = 'Sample'
        rightTypeService.insert(rightType)
        
    try: right1Id = firstOf(rightService.getAll(q=QRight(name='Right1')))
    except:
        right = Right()
        right.Name = 'Right1'
        right.Type = 'Sample'
        right1Id = rightService.insert(right)
        
    try: right2Id = firstOf(rightService.getAll(q=QRight(name='Right2')))
    except:
        right = Right()
        right.Name = 'Right2'
        right.Type = 'Sample'
        right2Id = rightService.insert(right)
    
    
    roleRbacService.addRole('Role1', 'Role2')
    roleRbacService.addRight('Role2', right1Id)
    roleRbacService.addRight('Role2', right2Id)
    
    userRbacService.addRole(user1Id, 'Role1')
    userRbacService.addRight(user2Id, right1Id)
    
    # userRbacService.remRole(user1Id, 'Role1')
    roleRbacService.remRight('Role2', right1Id)
    
    print('HR/User/*/Role')
    rightService.addAcl(right2Id, 1408549725)
    rightService.registerFilter(right2Id, 1408549725, 'authenticated')
    rightService.addCompensate(right2Id, 1408549725, 445639920)
    rightService.addAcl(right2Id, 445639920)
    
#    print('HR/User/*/Role/*')
#    rightService.addAcl(right2Id, 3552952149)
#    rightService.registerFilter(right2Id, 3552952149, 'authenticated')
#    rightService.registerFilter(right2Id, 3552952149, 'test')
#    rightService.addCompensate(right2Id, 3552952149, 3661375719)
#    rightService.addAcl(right2Id, 3661375719)
