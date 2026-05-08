cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-background-geolocation-lt.BackgroundGeolocation",
      "file": "plugins/cordova-background-geolocation-lt/www/BackgroundGeolocation.js",
      "pluginId": "cordova-background-geolocation-lt",
      "clobbers": [
        "window.BackgroundGeolocation"
      ]
    },
    {
      "id": "cordova-background-geolocation-lt.API",
      "file": "plugins/cordova-background-geolocation-lt/www/API.js",
      "pluginId": "cordova-background-geolocation-lt"
    },
    {
      "id": "cordova-background-geolocation-lt.DeviceSettings",
      "file": "plugins/cordova-background-geolocation-lt/www/DeviceSettings.js",
      "pluginId": "cordova-background-geolocation-lt"
    },
    {
      "id": "cordova-background-geolocation-lt.Logger",
      "file": "plugins/cordova-background-geolocation-lt/www/Logger.js",
      "pluginId": "cordova-background-geolocation-lt"
    },
    {
      "id": "cordova-background-geolocation-lt.TransistorAuthorizationToken",
      "file": "plugins/cordova-background-geolocation-lt/www/TransistorAuthorizationToken.js",
      "pluginId": "cordova-background-geolocation-lt"
    }
  ];
  module.exports.metadata = {
    "cordova-background-geolocation-lt": "5.0.0"
  };
});