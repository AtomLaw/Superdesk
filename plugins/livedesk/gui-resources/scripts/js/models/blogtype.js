define([
	'gizmo/superdesk',
	config.guiJs('livedesk', 'models/posts')
], function( Gizmo )
{
    return Gizmo.Model.extend({
    	url: new Gizmo.Url('LiveDesk/BlogType'),
    	defaults: { 
    		PostPosts: Gizmo.Register.Posts
    	},
    	addSync: function(data){
    		var self = this,
    			ret = self.xfilter('Id,PostPosts').set(data).sync();
    		ret.done(function(data){
                self._parseHash(data);
    			self.Class.triggerHandler('add', self);
    		});
    		return ret;
    	}
	}, { register: 'BlogType' });
});