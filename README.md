hapi-themes
-------------

This plugin will add a view handler to Hapi.js routes to serve themeable content.

Content can be themed by url (default), http header, or a custom function.

## Usage

Each theme is stored in a theme file, loaded with glob pathing, and configured like any other plugin.

```js
var themes = {
	register: require('hapi-themes'),
	options: {
		configFilePath: '**/*.theme.json'
	}
};

server.register([themes], function(err){
    // ...
    server.start(function(err){
        // ...    
    });
});
```

Specify the view handler for a route.

```js
server.route({
    method: 'GET',
    path: '/',
    handler: {
        theme: {
            template: 'index',
            layout: 'default',
            relativeTo: Path.join(__dirname, 'server/views')
        }
    }
});
```

By default, the handler will read the "theme" key from the url by taking the first url segment after the domain. For example, if your app has the following url:

```
http://www.foobar.com/batman/account
```

The theme key would be `batman` and the theme file that will be loaded is `batman.json`.

### Example Theme File

Theme files can contain any information you want, but must at least maintain `key` and `isDefault` properties.

```json
{
    "key": "batman",
    "isDefault": true,
    "brandName": "Batman Crimefighting",
    "logo": "logo-batman-134x23.png",
    "logoAltText": "Batman (TM)"
}
```

When loaded by the theme key, this theme file is injected as a js object into the view and can be used by the templating engine.

```
// using mustache templating engine
<link rel="icon" type="image/png" href="public/assets/css/themes/{{theme.key}}/img/{{theme.favicon}}" />
<title>{{theme.brandName}}</title>
<link rel="stylesheet" type="text/css" href="public/assets/css/themes/{{theme.key}}/styles.css" />
```

### Using an http header as the theme key

If you want to use an http header as the theme key, you can set the following options.

```js
var themes = {
	register: require('hapi-themes'),
	options: {
		configFilePath: '**/*.theme.json',
        defaultThemeKey: 'HEADER_THEME_KEY',
        keyStrategy: 'header'
	}
};
```

### Using a custom function for theme resolution

You can also specify a custom function that should return a string equivalent to the name of the theme file to load. The keyStrategy takes the Hapi.js request object as its parameter and must return a string.

```js
var themes = {
	register: require('hapi-themes'),
	options: {
		configFilePath: '**/*.theme.json',
        keyStrategy: function(request){
            return 'batman';
        }
	}
};
```