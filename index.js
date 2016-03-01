// TODO: validate schema with joi

var _ = require('lodash'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    Theme = require('./theme');

var settings = {
    configFilePath: '**/*.theme.json',
    keyStrategy: 'uri',
    themeHeaderKey: 'THEME'
};

var internals = {
    strategies: {
        uri: getThemeKeyFromUri,
        header: getThemeKeyFromHeader
    },
    themes: {},
    defaultThemeKey: '_default_theme_key'
};

/**
 * Register the plugin with Hapi
 */
function register(server, options, next) {
    _.extend(settings, options);
    
    // gather up our themes
    loadThemes();
    
    // check if consumer supplied there own theme function
    // or a string specifying a prebuilt function
    var getThemeStrategy;
    if (typeof (settings.keyStrategy) === 'string') {
        getThemeStrategy = internals.strategies[settings.keyStrategy];
    }
    else if(typeof (settings.keyStrategy) === 'function'){
        getThemeStrategy = settings.keyStrategy;
    }

    // for every request, resolve the theme from the strategy determined above
    // and set a global app property called "theme" we can later use
    server.ext('onRequest', function (request, reply) {
        request.app.theme = resolveTheme(getThemeStrategy(request));
        return reply.continue();
    });
    
    // register a new handler
    server.handler('theme', Theme.handler);

    return next();
}

/**
 * Returns the theme key from a header named "THEME"
 */
function getThemeKeyFromHeader(request) {
    return request.headers[settings.themeHeaderKey];
}

/**
 * Returns the theme key from the url following the format 
 * {protocol}://{host}/{theme}/{path*} and rewrites the url without the theme
 */
function getThemeKeyFromUri(request) {
    // parse url and look for theme key (if supplied)
    var parts = request.url.path.split('/');
            
    // lookup in theme key store or use the default theme
    var themeKey = parts[1];
    if (internals.themes[themeKey]) {
        // rewrite url excluding the theme key
        parts.splice(1, 1);
        request.setUrl(parts.join('/') || '/', true);
    }
    return themeKey;
}

/**
 * Constructs theme information from .theme.config files
 */
function loadThemes() {
    glob(settings.configFilePath, function (err, files) {
        if (!files || files.length === 0) {
            console.warn('[themes] no theme configuration files found.');
        }

        files.forEach(function (file) {

            fs.readFile(path.resolve(file), function (err, data) {
                if (err) {
                    throw err;
                }

                var themeConfig = JSON.parse(data);
                internals.themes[themeConfig.key] = themeConfig;
                
                // cache the default theme as well, so the lookup is faster onRequest
                if(themeConfig.isDefault === true){
                    internals.themes[internals.defaultThemeKey] = themeConfig;
                }
            });
        });

        console.log('[themes] ' + files.length + ' themes loaded.');
    });
}

/**
 * Resolve the theme by key name, else return the default theme
 */
function resolveTheme(key) {
    var theme;
    if (key) {
        theme = internals.themes[key];
    }
    if (!theme) {
        theme = internals.themes[internals.defaultThemeKey];
    }
    return theme;
}

// module exports
exports.register = register;
exports.register.attributes = {
    pkg: require('./package.json')
};