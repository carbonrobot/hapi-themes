var themes = require('../../lib/helpers.js');

describe('themes', function(){
	
	var themeFactory;
	
	beforeEach(function(){
		var options = {
			
		};
		themeFactory = themes.ThemeFactory(options);
	});
	
	it('should return the default slash', function(){
		var request = {
			url: {
				path: '/'
			}
		};
		themeFactory.getTheme(request);
		expect(request.url.path).toBe('/');	
	});
	
});