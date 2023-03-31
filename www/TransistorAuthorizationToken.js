var MODULE_NAME = "BackgroundGeolocation";
var DEFAULT_URL = 'https://tracker.transistorsoft.com';
var DUMMY_TOKEN = 'DUMMY_TOKEN';
var LOCATIONS_PATH = '/api/locations';
var REFRESH_TOKEN_PATH = '/api/refresh_token';
var REFRESH_PAYLOAD = {
	refresh_token: '{refreshToken}'
}

var exec = require("cordova/exec");

module.exports = {
	findOrCreate: function(orgname, username, url) {
		url = url || DEFAULT_URL;
		return new Promise(function(resolve, reject) {
			var success = function(token) {
				// Configure Transistor url and refreshPayload.  Flutter is so much nice for this stuff.
				token.url = url;
				resolve(token)
			};
			var failure = function(error) {
				console.warn('[TransistorAuthorizationToken findOrCreate] ERROR: ', error);
				// Return a dummy token on error.  this is a weird thing to do but it probably failed due to no network connection to demo server.
				// Once app will request the token once again after restarting one's app.
				if (error.status == '403') {
					reject(error);
					return;
				}
				resolve({
					accessToken: DUMMY_TOKEN,
					refreshToken: DUMMY_TOKEN,
					expires: -1,
					url:url
				});
			}
			exec(success, failure, MODULE_NAME, 'getTransistorToken', [orgname, username, url]);
		});
	},

	destroy: function(url) {
		url = url || DEFAULT_URL;
		return new Promise(function(resolve, reject) {
			var success = function(token) { resolve(token) }
			var failure = function(error) { reject(error) }
			exec(success, failure, MODULE_NAME, 'destroyTransistorToken', [url]);
		});
  	},

  	applyIf: function(config) {
  		if (!config.transistorAuthorizationToken) return config;

	  	var token = config.transistorAuthorizationToken;
	  	delete config.transistorAuthorizationToken;

	  	config.url = token.url + LOCATIONS_PATH;
	  	config.authorization = {
	  		strategy: 'JWT',
	  		accessToken: token.accessToken,
	  		refreshToken: token.refreshToken,
	  		refreshUrl: token.url + REFRESH_TOKEN_PATH,
	  		refreshPayload: REFRESH_PAYLOAD,
	  		expires: token.expires
	  	}
  		return config;
  	}
}