'''
Created on Jan 12, 2013

@package: livedesk
@copyright: 2012 Sourcefabric o.p.s.
@license: http://www.gnu.org/licenses/gpl-3.0.txt
@author: Gabriel Nistor

The filter used to check if the authenticated user has access to a requested blog.
'''

from ally.api.config import service, call, GET
from livedesk.api.blog import Blog
from security.acl.api.filter import IsAllowed, IAclFilter
from security.api.domain_security import aliasFilter
from superdesk.security.api.filter_authenticated import Authenticated

# --------------------------------------------------------------------

@aliasFilter
class HasBlog(IsAllowed):
    '''
    It is allowed for blog.
    '''
    
# --------------------------------------------------------------------

@service
class IBlogFilterService(IAclFilter):
    '''
    Provides the service that checks if the authenticated user has access to a requested blog.
    '''
    
    @call(method=GET)
    def isAllowed(self, adminId:Authenticated.Id, blogId:Blog.Id) -> HasBlog.HasAccess:
        '''
        @see: IAclFilter.isAllowed
        '''
