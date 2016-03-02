// TODO: validate schema with joi

var Path = require('path');

exports.handler = function (route, options) {
	function handler(request, reply) {
		var selectedTheme = request.app.theme;
        if(options.overrideTheme){
            selectedTheme = options.overrideTheme;
        }
		
		var model = {
			theme: selectedTheme,
			themeJson: JSON.stringify(selectedTheme)
		};
		var settings = {
			relativeTo: options.relativeTo,
			path: options.path,
			layout: options.layout			
		};
		return reply.view(options.template, model, settings);
	}
	
	return handler;
};
