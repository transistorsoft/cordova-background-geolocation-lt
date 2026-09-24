// Lazy bridge to Cordova's window.BackgroundGeolocation.
// The real implementation is loaded by Cordova's plugin system via <clobbers> in plugin.xml.
// This module exists for Ionic/Angular users who import from the npm package.
//
// The enum objects (LogLevel, DesiredAccuracy, ...) are constants, so they are served from www/Enums.js
// directly:  they are defined even before Cordova has loaded its plugins, eg: in a config object built at
// module scope.
var Enums = require('../www/Enums');

module.exports = new Proxy({}, {
  get: function(_, prop) {
    if (prop === 'default') return module.exports;
    if (prop === '__esModule') return true;
    if (Object.prototype.hasOwnProperty.call(Enums, prop)) return Enums[prop];
    var plugin = window.BackgroundGeolocation;
    if (!plugin) return undefined;
    var value = plugin[prop];
    return (typeof value === 'function') ? value.bind(plugin) : value;
  }
});
