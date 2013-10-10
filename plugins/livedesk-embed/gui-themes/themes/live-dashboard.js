define([
  'plugins/live-dashboard-sliders',
  'plugins/dashboard-twitter-widgets',
	'css!theme/liveblog',
  'css!theme/jquery.bxslider',
  'tmpl!theme/container'
], function(){
	return {
		//enviroments: [ 'mobile', 'desktop', 'quirks' ],
    plugins: ['dashboard-twitter-widgets', 'live-dashboard-sliders']
	}
});
