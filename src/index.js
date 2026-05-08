// Lazy bridge to Cordova's window.BackgroundGeolocation.
// The real implementation is loaded by Cordova's plugin system via <clobbers> in plugin.xml.
// This module exists for Ionic/Angular users who import from the npm package.
module.exports = new Proxy({}, {
  get: function(_, prop) {
    if (prop === 'default') return module.exports;
    if (prop === '__esModule') return true;
    var plugin = window.BackgroundGeolocation;
    if (!plugin) return undefined;
    var value = plugin[prop];
    return (typeof value === 'function') ? value.bind(plugin) : value;
  }
});
