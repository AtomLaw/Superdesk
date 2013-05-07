'''
Created on April 26, 2013

@package: livedesk
@copyright: 2013 Sourcefabric o.p.s.
@license: http://www.gnu.org/licenses/gpl-3.0.txt
@author: Mugur Rus

API implementation for liveblog sync.
'''

from livedesk.api.blog_sync import IBlogSyncService, QBlogSync, BlogSync
from sql_alchemy.impl.entity import EntityServiceAlchemy
from ally.container.support import setup
from livedesk.meta.blog_sync import BlogSyncMapped
from sqlalchemy.sql.functions import current_timestamp

# --------------------------------------------------------------------

@setup(IBlogSyncService, name='blogSyncService')
class BlogSyncService(EntityServiceAlchemy, IBlogSyncService):
    '''
    Implementation for @see IBlogSyncService
    '''

    def __init__(self):
        '''
        Construct the blog sync service.
        '''
        EntityServiceAlchemy.__init__(self, BlogSyncMapped, QBlogSync)

    def insert(self, blogSync):
        '''
        @see IBlogSyncService.insert
        '''
        assert isinstance(blogSync, BlogSync), 'Invalid blog sync %s' % blogSync

        if blogSync.Auto and blogSync.SyncStart is None:
            blogSync.SyncStart = current_timestamp()
        return super().insert(blogSync)

    def update(self, blogSync):
        '''
        @see IBlogSyncService.update
        '''
        assert isinstance(blogSync, BlogSync), 'Invalid blog sync %s' % blogSync

        blogSyncDb = self.getById(blogSync.Id)

        if blogSync.Auto and not blogSyncDb.Auto and blogSync.SyncStart is None:
            blogSync.SyncStart = current_timestamp()
        return super().update(blogSync)
