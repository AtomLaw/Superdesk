define([ 
	'gizmo/superdesk', 
	config.guiJs('superdesk/user', 'models/person'),
	config.guiJs('livedesk', 'models/author'),
	config.guiJs('livedesk', 'models/type'),
	],
function(Gizmo, Person)
{
    // Post
	return Gizmo.Model.extend
	({
	    defaults: 
	    {
	        AuthorPerson: Person,
	        Author: Gizmo.Register.Author,
	        Type: Gizmo.Register.Type
	    },
	    insertExcludes: [ 'AuthorPerson' ],
	      
		url: new Gizmo.Url('/Post'),
		
		orderSync: function(id, before)
		{
			var reorderHref = this.href+'/Post/'+id+'/Reorder?before='+before;
//			console.log(reorderHref);
			var
				self = this,
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(reorderHref).update();
			return ret;
		},
		removeSync: function()
		{
			var removeHref = this.href;
			if(this.href.indexOf('LiveDesk/Blog') !== -1 ) {
				removeHref = removeHref.replace(/LiveDesk\/Blog\/[\d]+/,'Data')
			}
			var
				self = this,
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(removeHref).remove().done(function() {
                    self.triggerHandler('delete');
                    self._uniq && self._uniq.remove(self.hash());
				});
			return ret;
		},
		publishSync: function()
		{
			var publishHref = this.href+'/Publish';
			var
				self = this,
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(publishHref).insert({},{headers: { 'X-Filter': 'CId, Order, IsPublished'}}).done(function(data){
					self._parse(data);
					self.Class.triggerHandler('publish', self);
				});
			return ret;
		},
		unpublishSync: function()
		{
			var publishHref = this.href+'/Unpublish';
			var
				self = this,
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(publishHref).insert({},{headers: { 'X-Filter': 'CId, Order'}}).done(function(data){
					delete self.data["PublishedOn"];
					self.triggerHandler('unpublish');
					self._parse(data);
					self.Class.triggerHandler('unpublish', self);
				});
			return ret;
		},
		hide: function(status)
		{
			var self = this,
				hideHref = this.href + '/Hide',
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(hideHref).insert({},{headers: { 'X-Filter': ''}}).done(function(){
					//self.triggerHandler('update',{});
				});
			return ret;
		},
		unhide: function(status)
		{
			var self = this,
				hideHref = this.href + '/Unhide',
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(hideHref).insert({},{headers: { 'X-Filter': ''}}).done(function(){
					//self.triggerHandler('update',{});
				});
			return ret;
		},
		changeStatus: function(status)
		{
			var self = this,
				verificationHref = this.href.replace(/LiveDesk\/Blog\/(\d+)\/Post\/(\d+)/,'Data/PostVerification/$2'),
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(verificationHref).update({ "Status": status },{headers: { 'X-Filter': ''}}).done(function(){
					self._parse({ PostVerification: { Status: { Key: status }}});
					self.triggerHandler('update',{});
				});
			return ret;
		},
		changeChecker: function(checker)
		{
			var self = this,
				verificationHref = this.href.replace(/LiveDesk\/Blog\/(\d+)\/Post\/(\d+)/,'Data/PostVerification/$2'),
				dataAdapter = function(){ return self.syncAdapter.request.apply(self.syncAdapter, arguments); },
                ret = dataAdapter(verificationHref).update({ "Checker": checker.Id },{headers: { 'X-Filter': ''}}).done(function(){
					self._parse({ PostVerification: { Checker: checker }});
					self.triggerHandler('update',{});
				});
			return ret;
		}
	}, { register: 'Post' } );
});