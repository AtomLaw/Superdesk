define([
	'jquery',
	'gizmo/view-events',
	'views/post',
	'dispatcher'
], function($, Gizmo, PostViewDef) {
	return function(){
		var PostView = PostViewDef(),
			PostsView = Gizmo.View.extend({
			events: {},
			_flags: {
        autoRender: true
				//addAllPending: false
			},
			_config: {
				timeInterval: 10000,
				data: {
					thumbSize: 'medium'
        },
				collection: {
					xfilter: 'PublishedOn, DeletedOn, Order, Id,' +
								   'CId, Content, CreatedOn, Type, '+
								   'AuthorName, Author.Source.Name, Author.Source.Id, Author.Source.IsModifiable,' +
								   'IsModified, AuthorImage,' +
								   'AuthorPerson.EMail, AuthorPerson.FirstName, AuthorPerson.LastName, AuthorPerson.Id,' +
								   'Meta, IsPublished, Creator.FullName'
				}
			},
			pendingAutoupdates: [],
			init: function() {
				var self = this;
        self._views = {
          fullSize: [],
          text:     []
        }
				$.each(self._config.collection, function(key, value) {
					if($.isArray(value))
						self.collection[key].apply(self.collection, value);
					else
						self.collection[key](value);
				});
				self.collection
					.on('read readauto', self.render, self)
					.on('addings', self.addAll, self)
					.on('addingsauto',self.addingsAuto, self)
          //.on('removeingsauto', self.removeAllAutoupdate, self)
					.auto()
					.autosync({ data: self._config.data });
			},
      removeOne: function(view) {
        var
          self = this,
          pos = self._views[view.type].indexOf(view),
          pos2 = self.collection._list.indexOf(view.model);
        if(pos !== -1 ) {
          self.collection._stats.total--;
          self._views[view.type].splice(pos,1);
          if(pos2 !== -1)
            self.collection._list.splice(pos2,1);
        }
        self.triggerHandler('remove',[view.model]);
        return self;
      },

			addOne: function(model) {
				var view = new PostView({model: model, _parent: this});
        model.postView = view;
        view.type = model.isTextLike() ? 'text' : 'fullSize';
				return this.orderOne(view);
			},

			/*!
			 * Order given view in timeline
			 * returns the given view.
			 */
      orderOne: function(view) {
				var pos = this._views[view.type].indexOf(view);
				/*!
				 * View property order need to be set here
				 *   because could be multiple updates and
				 *   orderOne only works for one update.
				 */
				view.order = parseFloat(view.model.get('Order'));
				/*!
				 * If the view isn't in the _views vector
				 *   add it.
				 */
				if ( pos === -1 ) {
					this._views[view.type].push(view);
				}
				/*!
				 * Sort the _view vector ascendent by view property order.
				 */
				this._views[view.type].sort(function(a,b){
					return a.order - b.order;
				});
				/*!
				 * Search it again in find the new position.
				 */
				pos = this._views[view.type].indexOf(view);
				if( pos === 0 ){
          var selector = '[data-gimme="' + view.type + '.posts.slider"]';
          this.el.children(selector).prepend(view.el);
        } else {
          view.el.insertAfter(this._views[view.type][pos - 1].el)
        }
				return view;
			},

			addingsAuto: function(evt, data) {
				var self = this;
				if(data.length) {
					self.pendingAutoupdates = self.pendingAutoupdates.concat(data);
				}
				self.addAllAutoupdate(evt);
			},
			addAllPending: function(evt) {
				var self = this;
        if(self.pendingAutoupdates.length){
				//if(!self._flags.addAllPending && self.pendingAutoupdates.length) {
					//self._flags.addAllPending = true;
					//self._parent.hideNewPosts();
					for(var i = 0, count = this.pendingAutoupdates.length; i < count; i++) {
						this.addOne(this.pendingAutoupdates[i]);
					}
					$.dispatcher.triggerHandler('posts-view.added-pending',self);
          self.triggerHandler('addingsauto',[self.pendingAutoupdates]);
					self.pendingAutoupdates = [];
				}
				//self._flags.addAllPending = false;
			},

			addAllAutoupdate: function(evt) {
				var self = this;
				if(self._flags.autoRender) {
					self.addAllPending(evt);
					$.dispatcher.triggerHandler('posts-view.added-auto',self);
        }
        //else {
					//self._parent.showNewPosts(self.pendingAutoupdates.length);
				//}
			},

			addAll: function(evt, data) {
				var i, self = this;
				self.triggerHandler('addings',[data]);
				for(i = 0, count = data.length; i < count; i++) {
					this.addOne(data[i]);
				}
				if(data.length)
					$.dispatcher.triggerHandler('posts-view.addAll',self);
			},

			render: function(evt, data) {
				var self = this;
				self.collection.triggerHandler('rendered');
				self.addAll(evt, data);
				$.dispatcher.triggerHandler('posts-view.rendered',self);
			}
		});
		//$.dispatcher.triggerHandler('posts-view.class',PostsView);
		return PostsView;
	}
});
