/**
* cordova-background-geolocation
* Copyright (c) 2015, Transistor Software (9224-2932 Quebec Inc)
* All rights reserved.
* sales@transistorsoft.com
* http://transistorsoft.com
* @see LICENSE
*/
var MODULE_NAME = "BackgroundGeolocation";
var exec = require("cordova/exec");

// Plugin callback registry.
var CALLBACK_REGEXP = new RegExp("^" + MODULE_NAME + ".*");

var cordovaCallbacks = [];

// Validate provided config for #ready, #setConfig
var validateConfig = function(config) {
  // Detect obsolete notification* fields and re-map to Notification instance.
  if (
    (config.notificationPriority) ||
    (config.notificationText) ||
    (config.notificationTitle) ||
    (config.notificationChannelName) ||
    (config.notificationColor) ||
    (config.notificationSmallIcon) ||
    (config.notificationLargeIcon)
  ) {
    console.warn('[BackgroundGeolocation] WARNING: Config.notification* fields (eg: notificationText) are all deprecated in favor of notification: {title: "My Title", text: "My Text"}  See docs for "Notification" class');

    config.notification = {
      text: config.notificationText,
      title: config.notificationTitle,
      color: config.notificationColor,
      channelName: config.notificationChannelName,
      smallIcon: config.notificationSmallIcon,
      largeIcon: config.notificationLargeIcon,
      priority: config.notificationPriority
    };
  }
  return config;
};

/**
* Register a single Cordova Callback
*/
function registerCordovaCallback(userSuccess, mySuccess) {
    var callbacks = window.cordova.callbacks;
    var re = new RegExp(MODULE_NAME);
    for (var callbackId in callbacks) {
        if (CALLBACK_REGEXP.test(callbackId)) {
            var callback = callbacks[callbackId];
            if (callback.success === mySuccess) {
                cordovaCallbacks.push({
                    callbackId: callbackId,
                    success: userSuccess
                });
                break;
            }
        }
    }
}
/**
* Remove a single plugin CordovaCallback
*/
function removeCordovaCallback(callback) {
    for (var n=0,len=cordovaCallbacks.length;n<len;n++) {
        var cordovaCallback = cordovaCallbacks[n];
        if (cordovaCallback.success === callback) {
            var callbackId = cordovaCallback.callbackId;
            if (typeof(window.cordova.callbacks[callbackId]) === 'object') {
                // Destroy Cordova callback.
                delete window.cordova.callbacks[callbackId];
                // Destroy internal reference
                cordovaCallbacks.splice(n, 1);
                return callbackId;
            } else {
                var error = '#un ' + event + ' failed to locate cordova callback';
                console.warn(error);
                return null;
            }
            break;
        }
    }
}

/**
* Remove all plugin Cordova callbacks
*/
function removeCordovaCallbacks() {
    var callbacks = window.cordova.callbacks;
    for (var callbackId in callbacks) {
        if (callbacks.hasOwnProperty(callbackId) && CALLBACK_REGEXP.test(callbackId)) {
            delete callbacks[callbackId];
        }
    }
}

/**
* Instantiate Date instance from String timestamp
* @param {Array} rs Array of location {}
*/
function setTimestamp(rs) {
    // Transform timestamp to Date instance.
    if (typeof(rs) === 'object') {
        for (var n=0,len=rs.length;n<len;n++) {
            if (rs[n].timestamp) {
                rs[n].timestamp = new Date(rs[n].timestamp);
            }
        }
    }
    return rs;
}

// Re-usable emptyFn
var emptyFn = function(){};

module.exports = {
    /**
    * If this is not the first-boot, configure using already persisted config.  Ignores defaultConfig.
    * If this IS the first boot, #ready acts like tradition #configure method, resetting the config
    * to default and applying supplied #defaultConfig.
    * @param {Object} defaultConfig
    */
    ready: function(defaultConfig) {
        return new Promise(function(resolve, reject) {
            defaultConfig = defaultConfig || {};
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'ready', [validateConfig(defaultConfig)]);
        });
    },
    /**
    * @private {Error} error
    */
    configure: function(config) {
        return new Promise(function(resolve, reject) {
            config = config || {};
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'configure', [validateConfig(config)]);
        });
    },
    /**
    * @private Reset config options to default
    */
    reset: function(defaultConfig) {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            var args = (defaultConfig !== undefined) ? [validateConfig(defaultConfig)] : [{}];
            exec(success, failure, MODULE_NAME, 'reset', args);
        });
    },
    requestPermission: function() {
        return new Promise(function(resolve, reject) {
            var success = function(status) { resolve(status) }
            var failure = function(status) { reject(status) }
            exec(success, failure, MODULE_NAME, 'requestPermission', []);
        });
    },
    getProviderState: function(success, failure) {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getProviderState', []);
        });
    },

    /**
    * @alias #addListener
    */
    on: function() {
        return this.addListener.apply(this, arguments);
    },
    /**
    * add event listener
    */
    addListener: function(event, success, fail) {
        if (typeof(success) !== 'function') {
            throw MODULE_NAME + "#on " + event + " requires a success callback";
        }
        fail = fail || emptyFn;
        switch (event) {
            case 'location':
                return this.onLocation(success, fail);
            case 'http':
                return this.onHttp(success, fail);
            case 'geofence':
                return this.onGeofence(success, fail);
            case 'motionchange':
                return this.onMotionChange(success, fail);
            case 'heartbeat':
                return this.onHeartbeat(success, fail);
            case 'schedule':
                return this.onSchedule(success, fail);
            case 'activitychange':
                return this.onActivityChange(success, fail);
            case 'providerchange':
                return this.onProviderChange(success, fail);
            case 'geofenceschange':
                return this.onGeofencesChange(success, fail);
            case 'powersavechange':
                return this.onPowerSaveChange(success, fail);
            case 'connectivitychange':
                return this.onConnectivityChange(success, fail);
            case 'enabledchange':
                return this.onEnabledChange(success, fail);
            case 'notificationaction':
                return this.onNotificationAction(success, fail);
        }
    },

    /**
    * remove event-listener
    */
    removeListener: function(event, handler) {
        // Compose remove-listener method name, eg:  "removeLocationListener"
        return new Promise(function(resolve, reject) {
            var callbackId = removeCordovaCallback(handler);
            if (callbackId) {
                var success = function()        { resolve() }
                var failure = function(error)   { reject(error) }
                exec(success, failure, MODULE_NAME, 'removeListener', [event, callbackId]);
            } else {
                var error = MODULE_NAME + '#removeListener ' + event + ' failed to locate cordova callback';
                console.warn(error);
                reject(error);
            }
        });
    },
    /**
    * Remove all event-listeners
    */
    removeListeners: function() {
        return new Promise(function(resolve, reject) {
            var success = function(response) {
                removeCordovaCallbacks();
                resolve();
            }
            var failure = function(error)   { reject(error) };
            exec(success, failure, MODULE_NAME, 'removeListeners', []);
        });
    },
    /**
    * Event handlers
    */
    onLocation: function(success, failure) {
        var mySuccess = function(location) {
            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }
            success(location);
        }
        exec(mySuccess, failure, MODULE_NAME, 'addLocationListener', []);
        registerCordovaCallback(success, mySuccess);
    },
    onMotionChange: function(success, failure) {
        var mySuccess = function(params) {
            // Transform timestamp to Date instance.
            if (params.location.timestamp) {
                params.location.timestamp = new Date(params.location.timestamp);
            }
            success(params);
        };
        exec(mySuccess, failure, MODULE_NAME, 'addMotionChangeListener', []);
        registerCordovaCallback(success, mySuccess);
    },
    onActivityChange: function(success) {
        exec(success, emptyFn, MODULE_NAME, 'addActivityChangeListener', []);
        registerCordovaCallback(success, success);
    },
    onProviderChange: function(success) {
        exec(success, emptyFn, MODULE_NAME, 'addProviderChangeListener', []);
        registerCordovaCallback(success, success);
    },
    onGeofence: function(success, failure) {
        exec(success, failure || emptyFn, MODULE_NAME, 'addGeofenceListener', []);
        registerCordovaCallback(success, success);
    },
    onGeofencesChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addGeofencesChangeListener', []);
        registerCordovaCallback(success, success);
    },
    onHttp: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addHttpListener', []);
        registerCordovaCallback(success, success);
    },
    onPowerSaveChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addPowerSaveChangeListener', []);
        registerCordovaCallback(success, success);
    },
    onConnectivityChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addConnectivityChangeListener', []);
        registerCordovaCallback(success, success);
    },
    onEnabledChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addEnabledChangeListener', []);
        registerCordovaCallback(success, success);
    },
    onHeartbeat: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addHeartbeatListener', []);
        registerCordovaCallback(success, success);
    },
    onSchedule: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addScheduleListener', []);
        registerCordovaCallback(success, success);
    },
    onNotificationAction: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addNotificationActionListener', []);
    },
    getState: function() {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getState', []);
        });
    },
    start: function() {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'start', [])
        });
    },
    stop: function() {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) };
            var failure = function(error) { reject(error); };
            exec(success, failure, MODULE_NAME, 'stop', []);
        });
    },
    startSchedule: function() {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'startSchedule', []);
        });
    },
    stopSchedule: function() {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'stopSchedule', []);
        });
    },
    startGeofences: function() {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'startGeofences', []);
        });
    },
    startBackgroundTask: function() {
        return new Promise(function(resolve, reject) {
            var success = function(taskId) { resolve(taskId) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'startBackgroundTask', []);
        });
    },
    stopBackgroundTask: function(taskId) {
        return new Promise(function(resolve, reject) {
            if ((typeof(taskId) !== 'number') || taskId === 0) {
                return reject('INVALID_TASK_ID: ' + taskId);
            }
            var success = function() { resolve() }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'finish', [taskId]);
        });
    },
    // @deprecated
    finish: function(taskId) {
        return this.stopBackgroundTask(taskId);
    },
    changePace: function(isMoving) {
        return new Promise(function(resolve, reject) {
            var success = function(isMoving) { resolve(isMoving) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'changePace', [isMoving]);
        });
    },
    setConfig: function(config) {
        return new Promise(function(resolve, reject) {
            var success = function(state) { resolve(state) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'setConfig', [validateConfig(config)]);
        });
    },
    getLocations: function() {
        return new Promise(function(resolve, reject) {
            var success = function(params) {
                resolve(setTimestamp(params.locations));
            }
            var failure = function(error) { reject(error); }
            exec(success, failure, MODULE_NAME, 'getLocations', []);
        });
    },
    getCount: function(success, failure) {
        return new Promise(function(resolve, reject) {
            var success = function(count) { resolve(count) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getCount', []);
        });
    },
    // @deprecated
    clearDatabase: function(success, failure) {
        this.destroyLocations(success, failure);
    },
    destroyLocations: function(success, failure) {
        return new Promise(function(resolve, reject) {
            var success = function() { resolve(); }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'destroyLocations', []);
        });
    },
    insertLocation: function(location) {
        return new Promise(function(resolve, reject) {
            location = location || {};
            var coords = location.coords || {};
            if (!coords.latitude && !coords.longitude) {
                return reject("BackgroundGeolocation#insertLocation location must contain coords.latitude & coords.longitude");
            }
            var success = function(location) { resolve(location) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'insertLocation', [location]);
        });
    },
    /**
    * Signal native plugin to sync locations queue to HTTP
    */
    sync: function() {
        return new Promise(function(resolve, reject) {
            var success = function(params) {
                resolve(setTimestamp(params.locations));
            }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'sync', []);
        });
    },
    /**
    * Fetch current odometer value
    */
    getOdometer: function() {
        return new Promise(function(resolve, reject) {
            var success = function(value) { resolve(value) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getOdometer', []);
        });
    },
    setOdometer: function(value, success, failure) {
        return new Promise(function(resolve, reject) {
            var success = function(location) { resolve(location) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'setOdometer', [value]);
        });
    },

    /**
    * add geofence
    */
    addGeofence: function(config) {
        return new Promise(function(resolve, reject) {
            config = config || {};
            var success = function() { resolve() }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'addGeofence', [config]);
        });
    },
    /**
    * add a list of geofences
    */
    addGeofences: function(geofences) {
        return new Promise(function(resolve, reject) {
            geofences = geofences || [];
            if (!geofences.length) {
                return reject('No geofences provided')
            }
            var success = function() { resolve() }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'addGeofences', [geofences]);
        });
    },
    /**
    * Remove all geofences
    */
    removeGeofences: function(identifiers) {
        identifiers = identifiers || [];
        return new Promise(function(resolve, reject) {
            var success = function() { resolve() }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'removeGeofences', [identifiers]);
        });
    },
    /**
    * remove a geofence
    * @param {String} identifier
    */
    removeGeofence: function(identifier) {
        return new Promise(function(resolve, reject) {
            if (!identifier) {
                return reject("#removeGeofence requires an 'identifier'");
            }
            var success = function() { resolve() }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'removeGeofence', [identifier]);
        });
    },

    /**
    * Fetch a list of all monitored geofences
    */
    getGeofences: function() {
        return new Promise(function(resolve, reject) {
            var success = function(rs) { resolve(rs) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getGeofences', []);
        });
    },
    /**
    * Fetch the current position
    */
    getCurrentPosition: function(options) {
        return new Promise(function(resolve, reject) {
            var success = function(location) {
                // Transform timestamp to Date instance.
                if (location.timestamp) {
                    location.timestamp = new Date(location.timestamp);
                }
                resolve(location);
            }
            var failure = function(error) { reject(error) }
            options = options || {};
            exec(success, failure, MODULE_NAME, 'getCurrentPosition', [options]);
        });
    },

    watchPosition: function(success, failure, options) {
        var mySuccess = function(location) {
            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }
            success(location);
        }
        failure = failure || emptyFn;
        options = options || {};
        exec(mySuccess, failure, MODULE_NAME, 'watchPosition', [options]);
    },
    stopWatchPosition: function() {
        return new Promise(function(resolve, reject) {
            var success = function(watchCallbacks) {
                var callbacks = window.cordova.callbacks;
                for (var n=0,len=watchCallbacks.length;n<len;n++) {
                    var callbackId = watchCallbacks[n];
                    if (callbacks[callbackId]) {
                        delete callbacks[callbackId];
                    } else {
                        console.warn(MODULE_NAME + '#stopWatchPosition failed to locate callbackId: ', callbackId);
                    }
                }
                resolve();
            };
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'stopWatchPosition', []);
        })
    },
    setLogLevel: function(logLevel) {
        return new Promise(function(resolve, reject) {
            var config = {logLevel: logLevel};
            var success = function() { resolve() }
            var failure = function() { reject() }
            exec(success, failure, MODULE_NAME, 'setConfig', [config]);
        });
    },
    getLog: function() {
        return new Promise(function(resolve, reject) {
            var success = function(log) { resolve(log) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getLog', []);
        });
    },
    destroyLog: function() {
        return new Promise(function(resolve, reject) {
            var success = function() { resolve() }
            var failure = function(error) { reject(error) };
            exec(success, failure, MODULE_NAME, 'destroyLog', []);
        });
    },
    emailLog: function(email) {
        return new Promise(function(resolve, reject) {
            var success = function() { resolve() }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'emailLog', [email]);
        });
    },
    isPowerSaveMode: function() {
        return new Promise(function(resolve, reject) {
            var success = function(value) { resolve(value) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'isPowerSaveMode', []);
        });
    },
    playSound: function(soundId) {
        return new Promise(function(resolve, reject) {
            var success = function() { resolve() };
            var failure = function(error) { reject(error) };
            exec(success, failure, MODULE_NAME, 'playSound', [soundId]);
        });
    },
    log: function(level, msg) {
        return new Promise(function(resolve, reject) {
            var success = function() { resolve() };
            var failure = function(error) { reject(error) }
            exec(emptyFn, emptyFn, MODULE_NAME, 'log', [level, msg]);
        });
    },
    /**
    * Fetch list of available sensors: accelerometer, gyroscope, magnetometer
    */
    getSensors: function() {
        return new Promise(function(resolve, reject) {
            var success = function(sensors) { resolve(sensors) };
            var failure = function(error) { reject(error) };
            exec(success, failure, MODULE_NAME, 'getSensors', []);
        });
    }
};

