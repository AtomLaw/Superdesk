define([
	// 'jquery/tmpl',
	// 'plugins/scroll-pagination',
	// 'tmpl!theme/item/base',
	// 'tmpl!theme/item/posttype/normal',
	// 'tmpl!theme/item/posttype/image',
	// 'tmpl!theme/item/posttype/wrapup',
	// 'tmpl!theme/item/posttype/quote',
	// 'tmpl!theme/item/posttype/link',
	// 'tmpl!theme/item/posttype/advertisement',	
	// 'tmpl!theme/item/source/advertisement',
	// 'tmpl!theme/item/source/google',
	// 'tmpl!theme/item/source/google/web',
	// 'tmpl!theme/item/source/google/news',
	// 'tmpl!theme/item/source/google/images',
	// 'tmpl!theme/item/source/twitter',
	// 'tmpl!theme/item/source/facebook',
	// 'tmpl!theme/item/source/youtube',
	// 'tmpl!theme/item/source/flickr',
	// 'tmpl!theme/item/source/comments',
	// 'tmpl!theme/item/source/soundcloud',
	// 'tmpl!theme/item/source/instagram',
	// 'tmpl!theme/item/source/sms',
	'css!theme/liveblog'
], function(){
	// function loadCss(url) {
	// 	var link = document.createElement("link");
	// 	link.type = "text/css";
	// 	link.rel = "stylesheet";
	// 	link.href = url;
	// 	document.getElementsByTagName("head")[0].appendChild(link);
	// }
	// loadCss(require.toUrl('theme/liveblog.css'));//,
	return {
		//enviroments: [ 'mobile', 'desktop', 'quirks' ],
		plugins: [ 'scroll', 'pagination' ]
	}
});