requirejs.config({
	paths: { 
		'providers': config.gui('livedesk/scripts/js/providers'), 
		'livedesk/models': config.gui('lib/livedesk/scripts/js/models'), 
		'livedesk/collections': config.gui('lib/livedesk/scripts/js/collections/') 
} });
define
([
  'jquery', 'jquery/superdesk',
  'gizmo/superdesk',
  'gizmo/superdesk/action',
  config.guiJs('livedesk', 'models/blog'),
  config.guiJs('livedesk', 'router'),
  'router',

  'jquery/tmpl', 'jquery/rest',
  'tmpl!livedesk>submenu'
], function($, superdesk, Gizmo, Action, Blog, LiveBlogRouter, router)
{
    var Blogs = Gizmo.Collection.extend({model: Blog, href: new Gizmo.Url(localStorage.getItem('superdesk.login.selfHref')+'/Blog') }), 
        b = Gizmo.Auth(new Blogs());
    
    var SubmenuView = Gizmo.View.extend
    ({
        init: function()
        {
            this.model.on('read update', this.render, this);
            this.model.on('insert', this.refresh, this);

            new LiveBlogRouter();
            router.start();
        },

        refresh: function()
        {
            this.model.href = localStorage.getItem('superdesk.login.selfHref')+'/Blog';
            this.model._list = [];
            this.model.xfilter('Title, Id').sync();
        },

        render: function()
        {
            
            $(this.menu).on('click', '#submenu-liveblogs-create', function(event)
            {
                Action.get('modules.livedesk.add')
                .done(function(action)
                {
                    superdesk.showLoader();
                    action.get('Script') &&
                        require([action.get('Script').href], function(AddApp){ addApp = new AddApp(); });
                }); 
                event.preventDefault();
            });

            var self = this;

            /*!
             * apply template and go to selected blog if any
             */
            this.menu.tmpl('livedesk>submenu', {Blogs: this.model.feed()}, function()
            {
                // hide create if no right
                Action.get('modules.livedesk.add').fail(function(){ $('#submenu-liveblogs-create', self.menu).hide(); });
            }); 
        }
    });
    
    var subMenu = new SubmenuView({model: b});
    return {
        init: function(submenu, menu)
        { 
            subMenu.menu = $(submenu);
            subMenu.refresh();
            return subMenu; 
        }
    };
});
