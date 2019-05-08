var plugin = function () {
    return window.BackgroundGeolocation;
};
var BackgroundGeolocation = /** @class */ (function () {
    function BackgroundGeolocation() {
    }
    Object.defineProperty(BackgroundGeolocation, "LOG_LEVEL_OFF", {
        get: function () { return plugin().LOG_LEVEL_OFF; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "LOG_LEVEL_ERROR", {
        get: function () { return plugin().LOG_LEVEL_ERROR; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "LOG_LEVEL_WARNING", {
        get: function () { return plugin().LOG_LEVEL_WARNING; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "LOG_LEVEL_INFO", {
        get: function () { return plugin().LOG_LEVEL_INFO; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "LOG_LEVEL_DEBUG", {
        get: function () { return plugin().LOG_LEVEL_DEBUG; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "LOG_LEVEL_VERBOSE", {
        get: function () { return plugin().LOG_LEVEL_VERBOSE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "DESIRED_ACCURACY_NAVIGATION", {
        get: function () { return plugin().DESIRED_ACCURACY_NAVIGATION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "DESIRED_ACCURACY_HIGH", {
        get: function () { return plugin().DESIRED_ACCURACY_HIGH; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "DESIRED_ACCURACY_MEDIUM", {
        get: function () { return plugin().DESIRED_ACCURACY_MEDIUM; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "DESIRED_ACCURACY_LOW", {
        get: function () { return plugin().DESIRED_ACCURACY_LOW; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "DESIRED_ACCURACY_VERY_LOW", {
        get: function () { return plugin().DESIRED_ACCURACY_VERY_LOW; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "DESIRED_ACCURACY_THREE_KILOMETER", {
        get: function () { return plugin().DESIRED_ACCURACY_THREE_KILOMETER; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "AUTHORIZATION_STATUS_NOT_DETERMINED", {
        get: function () { return plugin().AUTHORIZATION_STATUS_NOT_DETERMINED; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "AUTHORIZATION_STATUS_RESTRICTED", {
        get: function () { return plugin().AUTHORIZATION_STATUS_RESTRICTED; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "AUTHORIZATION_STATUS_DENIED", {
        get: function () { return plugin().AUTHORIZATION_STATUS_DENIED; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "AUTHORIZATION_STATUS_ALWAYS", {
        get: function () { return plugin().AUTHORIZATION_STATUS_ALWAYS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "AUTHORIZATION_STATUS_WHEN_IN_USE", {
        get: function () { return plugin().AUTHORIZATION_STATUS_WHEN_IN_USE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "NOTIFICATION_PRIORITY_DEFAULT", {
        get: function () { return plugin().NOTIFICATION_PRIORITY_DEFAULT; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "NOTIFICATION_PRIORITY_HIGH", {
        get: function () { return plugin().NOTIFICATION_PRIORITY_HIGH; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "NOTIFICATION_PRIORITY_LOW", {
        get: function () { return plugin().NOTIFICATION_PRIORITY_LOW; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "NOTIFICATION_PRIORITY_MAX", {
        get: function () { return plugin().NOTIFICATION_PRIORITY_MAX; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "NOTIFICATION_PRIORITY_MIN", {
        get: function () { return plugin().NOTIFICATION_PRIORITY_MIN; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "ACTIVITY_TYPE_OTHER", {
        get: function () { return plugin().ACTIVITY_TYPE_OTHER; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION", {
        get: function () { return plugin().ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "ACTIVITY_TYPE_FITNESS", {
        get: function () { return plugin().ACTIVITY_TYPE_FITNESS; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "ACTIVITY_TYPE_OTHER_NAVIGATION", {
        get: function () { return plugin().ACTIVITY_TYPE_OTHER_NAVIGATION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "PERSIST_MODE_ALL", {
        get: function () { return plugin().PERSIST_MODE_ALL; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "PERSIST_MODE_LOCATION", {
        get: function () { return plugin().PERSIST_MODE_LOCATION; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "PERSIST_MODE_GEOFENCE", {
        get: function () { return plugin().PERSIST_MODE_GEOFENCE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "PERSIST_MODE_NONE", {
        get: function () { return plugin().PERSIST_MODE_NONE; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "logger", {
        get: function () { return plugin().logger; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundGeolocation, "deviceSettings", {
        get: function () { return plugin().deviceSettings; },
        enumerable: true,
        configurable: true
    });
    BackgroundGeolocation.ready = function (config, success, failure) {
        var bgGeo = plugin();
        return bgGeo.ready.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.configure = function () {
        var bgGeo = plugin();
        return bgGeo.configure.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.reset = function () {
        var bgGeo = plugin();
        return bgGeo.reset.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onLocation = function (success, failure) {
        var bgGeo = plugin();
        bgGeo.onLocation.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onMotionChange = function (callback) {
        var bgGeo = plugin();
        bgGeo.onMotionChange.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onHttp = function (callback) {
        var bgGeo = plugin();
        bgGeo.onHttp.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onHeartbeat = function (callback) {
        var bgGeo = plugin();
        bgGeo.onHeartbeat.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onProviderChange = function (callback) {
        var bgGeo = plugin();
        bgGeo.onProviderChange.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onActivityChange = function (callback) {
        var bgGeo = plugin();
        bgGeo.onActivityChange.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onGeofence = function (callback) {
        var bgGeo = plugin();
        bgGeo.onGeofence.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onGeofencesChange = function (callback) {
        var bgGeo = plugin();
        bgGeo.onGeofencesChange.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onSchedule = function (callback) {
        var bgGeo = plugin();
        bgGeo.onSchedule.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onEnabledChange = function (callback) {
        var bgGeo = plugin();
        bgGeo.onEnabledChange.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onConnectivityChange = function (callback) {
        var bgGeo = plugin();
        bgGeo.onConnectivityChange.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onPowerSaveChange = function (callback) {
        var bgGeo = plugin();
        bgGeo.onPowerSaveChange.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.onNotificationAction = function (callback) {
        var bgGeo = plugin();
        bgGeo.onNotificationAction.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.on = function () {
        var bgGeo = plugin();
        return bgGeo.on.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.un = function () {
        var bgGeo = plugin();
        return bgGeo.un.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.removeListener = function () {
        var bgGeo = plugin();
        return bgGeo.removeListener.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.removeListeners = function () {
        var bgGeo = plugin();
        return bgGeo.removeListeners.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getState = function () {
        var bgGeo = plugin();
        return bgGeo.getState.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.start = function () {
        var bgGeo = plugin();
        return bgGeo.start.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.stop = function () {
        var bgGeo = plugin();
        return bgGeo.stop.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.startSchedule = function () {
        var bgGeo = plugin();
        return bgGeo.startSchedule.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.stopSchedule = function () {
        var bgGeo = plugin();
        return bgGeo.stopSchedule.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.startGeofences = function () {
        var bgGeo = plugin();
        return bgGeo.startGeofences.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.startBackgroundTask = function () {
        var bgGeo = plugin();
        return bgGeo.startBackgroundTask.apply(bgGeo, arguments);
    };
    // TODO rename native method -> #stopBackgroundTask
    BackgroundGeolocation.stopBackgroundTask = function () {
        var bgGeo = plugin();
        return bgGeo.stopBackgroundTask.apply(bgGeo, arguments);
    };
    // @deprecated.
    BackgroundGeolocation.finish = function () {
        return BackgroundGeolocation.stopBackgroundTask();
    };
    BackgroundGeolocation.changePace = function () {
        var bgGeo = plugin();
        return bgGeo.changePace.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.setConfig = function () {
        var bgGeo = plugin();
        return bgGeo.setConfig.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getLocations = function () {
        var bgGeo = plugin();
        return bgGeo.getLocations.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getCount = function () {
        var bgGeo = plugin();
        return bgGeo.getCount.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.destroyLocations = function () {
        var bgGeo = plugin();
        return bgGeo.destroyLocations.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.insertLocation = function () {
        var bgGeo = plugin();
        return bgGeo.insertLocation.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.sync = function () {
        var bgGeo = plugin();
        return bgGeo.sync.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getOdometer = function () {
        var bgGeo = plugin();
        return bgGeo.getOdometer.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.resetOdometer = function () {
        var bgGeo = plugin();
        return bgGeo.resetOdometer.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.setOdometer = function () {
        var bgGeo = plugin();
        return bgGeo.setOdometer.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.addGeofence = function () {
        var bgGeo = plugin();
        return bgGeo.addGeofence.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.removeGeofence = function () {
        var bgGeo = plugin();
        return bgGeo.removeGeofence.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.addGeofences = function () {
        var bgGeo = plugin();
        return bgGeo.addGeofences.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.removeGeofences = function () {
        var bgGeo = plugin();
        return bgGeo.removeGeofences.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getGeofences = function () {
        var bgGeo = plugin();
        return bgGeo.getGeofences.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getCurrentPosition = function () {
        var bgGeo = plugin();
        return bgGeo.getCurrentPosition.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.watchPosition = function () {
        var bgGeo = plugin();
        return bgGeo.watchPosition.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.stopWatchPosition = function () {
        var bgGeo = plugin();
        return bgGeo.stopWatchPosition.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.registerHeadlessTask = function () {
        var bgGeo = plugin();
        return bgGeo.registerHeadlessTask.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.setLogLevel = function () {
        var bgGeo = plugin();
        return bgGeo.setLogLevel.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getLog = function () {
        var bgGeo = plugin();
        return bgGeo.getLog.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.destroyLog = function () {
        var bgGeo = plugin();
        return bgGeo.destroyLog.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.emailLog = function () {
        var bgGeo = plugin();
        return bgGeo.emailLog.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.isPowerSaveMode = function () {
        var bgGeo = plugin();
        return bgGeo.isPowerSaveMode.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getSensors = function () {
        var bgGeo = plugin();
        return bgGeo.getSensors.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.playSound = function () {
        var bgGeo = plugin();
        return bgGeo.playSound.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.transistorTrackerParams = function () {
        var bgGeo = plugin();
        return bgGeo.transistorTrackerParams.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.getProviderState = function () {
        var bgGeo = plugin();
        return bgGeo.getProviderState.apply(bgGeo, arguments);
    };
    BackgroundGeolocation.requestPermission = function () {
        var bgGeo = plugin();
        return bgGeo.requestPermission.apply(bgGeo, arguments);
    };
    return BackgroundGeolocation;
}());
export default BackgroundGeolocation;
