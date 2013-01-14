define(['gizmo/superdesk', 
    config.guiJs('livedesk', 'models/post')
], function( Gizmo, Post ) {

    return Gizmo.Collection.extend({ 
		model: Gizmo.Register.Post,
        pendingPosts: [],
        init: function() {
            this.pendingPosts = [];
        },
		insertSync: function() {
            
            this.desynced = false;
            if( !(model instanceof Model) ) model = this.modelDataBuild(new this.model(model));
            this._list.push(model);
            model.hash();
            model.sync(this.href);
            return model;
		},
        feedPending: function(format, deep) {
            var ret = [],
                pos,
                post;
            for( var i = 0, count = this.pendingPosts.length; i < count; i++ ){
                post = this.pendingPosts[i];
                pos = this._list.indexOf(post);
                if( pos === -1 )
                    ret.push(post);
            }
            return ret;
        },
        removePending: function(model) {
            var self = this,
                pos = self._list.indexOf(model),
                ppos = self.pendingPosts.indexOf(model);
            if( pos !== -1 ) {
                self._list.splice(pos,1);
                self.pendingPosts.push(model);
            }
            if( ppos !== -1 )
                self.pendingPosts.splice(ppos,1);

        },
        savePending: function(href){
            var ret = [], ppost;
            for( var i in this.pendingPosts ) {
                ppost = this.pendingPosts[i];
                if(ppost._new) {
                   ppost.href = href;
                   this.insert(ppost);
                } else {
                    ppost.sync();
                }
            }
            this.pendingPosts = [];
            this.triggerHandler('addingspending');
            return ret;            
        },
        addPending: function(model) {
            this.desynced = false;
            var found = false,
                post;
            for( var i = 0, count = this.pendingPosts.length; i < count; i++ ){
                post = this.pendingPosts[i];
                if( post === model) {
                    found = true;
                    break;
                } 
            }
            if(!found)
                this.pendingPosts.push(model);
            this.triggerHandler('updatepending',[[model]]);
        }	
	}, { register: 'Posts' });
});