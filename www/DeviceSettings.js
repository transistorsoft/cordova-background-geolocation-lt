var MODULE_NAME = "BackgroundGeolocation";
var exec = require("cordova/exec");

var resolveSettingsRequest = function(resolve, request) {
	if (request.lastSeenAt > 0) {
		request.lastSeenAt = new Date(request.lastSeenAt);
	}
	resolve(request)
}

module.exports = {
	isIgnoringBatteryOptimizations: function() {
		return new Promise(function(resolve, reject) {
      var success = function(isIgnoring) { resolve(isIgnoring) }
      var failure = function(error) { reject(error) }
      exec(success, failure, MODULE_NAME, 'isIgnoringBatteryOptimizations', []);
    });
	},
	showIgnoreBatteryOptimizations: function() {
		return new Promise(function(resolve, reject) {
			var args = {
				action: "IGNORE_BATTERY_OPTIMIZATIONS"
			};
      var success = function(request) { resolveSettingsRequest(resolve, request); };
      var failure = function(error) { reject(error) }
      exec(success, failure, MODULE_NAME, 'requestSettings', [args]);
    });
	},
	showPowerManager: function() {
		return new Promise(function(resolve, reject) {
			var args = {
				action: "POWER_MANAGER"
			};
      var success = function(request) { resolveSettingsRequest(resolve, request); };
      var failure = function(error) { reject(error) }
      exec(success, failure, MODULE_NAME, 'requestSettings', [args]);
    });
	},
	show: function(request) {
		return new Promise(function(resolve, reject) {
			var args = {
				action: request.action
			};
      var success = function(success) { resolve(success) }
      var failure = function(error) { reject(error) }
      exec(success, failure, MODULE_NAME, 'showSettings', [args]);
    });
	}
}