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

var TransistorAuthorizationToken = require('./TransistorAuthorizationToken');

// Plugin callback registry.
var CALLBACK_REGEXP = new RegExp("^" + MODULE_NAME + ".*");

var cordovaCallbacks = [];

// Cached copy of DeviceInfo
var deviceInfo = null;

var Events = {
    LOCATION: 'location',
    HTTP: 'http',
    MOTIONCHANGE: 'motionchange',
    LOCATIONFILTER: 'locationfilter',
    PROVIDERCHANGE: 'providerchange',
    HEARTBEAT: 'heartbeat',
    ACTIVITYCHANGE: 'activitychange',
    GEOFENCE: 'geofence',
    GEOFENCESCHANGE: 'geofenceschange',
    SCHEDULE: 'schedule',
    CONNECTIVITYCHANGE: 'connectivitychange',
    ENABLEDCHANGE: 'enabledchange',
    POWERSAVECHANGE: 'powersavechange',
    NOTIFICATIONACTION: 'notificationaction',
    AUTHORIZATION: 'authorization'
};

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
  config = TransistorAuthorizationToken.applyIf(config);
  return config;
};

/**
* Find which Cordova callbackId the exec() we just issued was given, and track it.
* Ids already tracked are skipped: two subscriptions to the same event can share one handler
* function, and the older registration is still in window.cordova.callbacks (keepCallback).
*/
function registerCordovaCallback(event, userSuccess, mySuccess) {
    var callbacks = window.cordova.callbacks;
    for (var callbackId in callbacks) {
        if (CALLBACK_REGEXP.test(callbackId)) {
            var callback = callbacks[callbackId];
            if ((callback.success === mySuccess) && !isRegistered(callbackId)) {
                cordovaCallbacks.push({
                    callbackId: callbackId,
                    event: event,
                    success: userSuccess
                });
                return callbackId;
            }
        }
    }
}

function isRegistered(callbackId) {
    for (var n=0,len=cordovaCallbacks.length;n<len;n++) {
        if (cordovaCallbacks[n].callbackId === callbackId) {
            return true;
        }
    }
    return false;
}

/**
* Remove one plugin CordovaCallback by its callbackId.  Returns true when it was still registered.
*/
function removeCordovaCallbackById(callbackId) {
    var found = false;
    for (var n=cordovaCallbacks.length-1;n>=0;n--) {
        if (cordovaCallbacks[n].callbackId === callbackId) {
            cordovaCallbacks.splice(n, 1);
            found = true;
        }
    }
    if (found) {
        // Destroy Cordova callback.
        delete window.cordova.callbacks[callbackId];
    }
    return found;
}

/**
* Remove a single plugin CordovaCallback by handler, for the deprecated #removeListener.
* Prefers the given event, since the same handler can be registered for several events.
* Returns the removed registration, whose own event must be the one sent to the native side:
* iOS looks its listener up by event-name and the caller's spelling of it can differ.
*/
function removeCordovaCallback(event, handler) {
    var registration = findRegistration(event, handler);
    if (!registration) {
        // Fall back to the first registration of this handler, whatever its event.
        registration = findRegistration(null, handler);
    }
    if (!registration) {
        return null;
    }
    removeCordovaCallbackById(registration.callbackId);
    return registration;
}

function findRegistration(event, handler) {
    for (var n=0,len=cordovaCallbacks.length;n<len;n++) {
        var cordovaCallback = cordovaCallbacks[n];
        if (cordovaCallback.success !== handler) continue;
        if (event && (cordovaCallback.event !== event)) continue;
        return cordovaCallback;
    }
    return null;
}

/**
* The canonical name of an event, eg: "Location" -> "location".  Unknown events are returned as-given.
*/
function canonicalEvent(event) {
    return Events[String(event).toUpperCase()] || event;
}

/**
 * Object returned from BackgroundGeolocation.addListener for removing an event-listener.
 */
function createSubscription(event, callbackId, handler) {
    return {
        remove: function() {
            // Remove exactly this subscription.  Matching by handler cannot do that: one function can
            // be the handler of several subscriptions.
            if (callbackId) {
                if (removeCordovaCallbackById(callbackId)) {
                    exec(emptyFn, emptyFn, MODULE_NAME, 'removeListener', [event, callbackId]);
                }
                return;
            }
            // The registration was never tracked (see #registerCordovaCallback).  Fall back to the handler.
            var registration = removeCordovaCallback(event, handler);
            if (registration) {
                exec(emptyFn, emptyFn, MODULE_NAME, 'removeListener', [registration.event, registration.callbackId]);
            }
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
    Events: Events,
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
    requestTemporaryFullAccuracy: function(purpose) {
        return new Promise(function(resolve, reject) {
            var success = function(accuracyAuthorization) { resolve(accuracyAuthorization) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'requestTemporaryFullAccuracy', [purpose]);
        })
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
        if (!Events[event.toUpperCase()]) {
            throw MODULE_NAME + ".addListener:  Unknown event: " + event;
        }
        // The event is validated case-insensitively; dispatch on the canonical name, so that eg "Location" works.
        event = canonicalEvent(event);
        fail = fail || emptyFn;

        var callbackId;
        switch (event) {
            case Events.LOCATION:
                callbackId = this.onLocation(success, fail);
                break;
            case Events.HTTP:
                callbackId = this.onHttp(success, fail);
                break;
            case Events.GEOFENCE:
                callbackId = this.onGeofence(success, fail);
                break;
            case Events.MOTIONCHANGE:
                callbackId = this.onMotionChange(success, fail);
                break;
            case Events.LOCATIONFILTER:
                callbackId = this.onLocationFilter(success, fail);
                break;
            case Events.HEARTBEAT:
                callbackId = this.onHeartbeat(success, fail);
                break;
            case Events.SCHEDULE:
                callbackId = this.onSchedule(success, fail);
                break;
            case Events.ACTIVITYCHANGE:
                callbackId = this.onActivityChange(success, fail);
                break;
            case Events.PROVIDERCHANGE:
                callbackId = this.onProviderChange(success, fail);
                break;
            case Events.GEOFENCESCHANGE:
                callbackId = this.onGeofencesChange(success, fail);
                break;
            case Events.POWERSAVECHANGE:
                callbackId = this.onPowerSaveChange(success, fail);
                break;
            case Events.CONNECTIVITYCHANGE:
                callbackId = this.onConnectivityChange(success, fail);
                break;
            case Events.ENABLEDCHANGE:
                callbackId = this.onEnabledChange(success, fail);
                break;
            case Events.NOTIFICATIONACTION:
                callbackId = this.onNotificationAction(success, fail);
                break;
            case Events.AUTHORIZATION:
                callbackId = this.onAuthorization(success, fail);
                break;
        }
        return createSubscription(event, callbackId, success);
    },

    /**
    * remove event-listener
    */
    removeListener: function(event, handler) {
        console.warn('BackgroundGeolocation.removeListener is deprecated.  Event-listener methods (eg: onLocation) now return a subscription instance.  Call subscription.remove() on the returned subscription instead.  Eg:\nconst subscription = BackgroundGeolocation.onLocation(myLocationHandler)\n...\nsubscription.remove()');
        // Compose remove-listener method name, eg:  "removeLocationListener"
        var registration = removeCordovaCallback(canonicalEvent(event), handler);
        return new Promise(function(resolve, reject) {
            if (registration) {
                var success = function()        { resolve() }
                var failure = function(error)   { reject(error) }
                // The registration's own event, not the caller's: iOS removes by event-name.
                exec(success, failure, MODULE_NAME, 'removeListener', [registration.event, registration.callbackId]);
            } else {
                resolve();
            }
        });
    },
    /**
    * Remove all event-listeners
    */
    removeListeners: function() {
        // Detach the current registrations synchronously.  Doing it when the native call comes back would
        // also destroy listeners added in the meantime -- they belong to the caller, not to this removal.
        var registrations = cordovaCallbacks.splice(0);
        for (var n=0,len=registrations.length;n<len;n++) {
            // Destroy Cordova callback.
            delete window.cordova.callbacks[registrations[n].callbackId];
        }
        return new Promise(function(resolve, reject) {
            var success = function(response) { resolve() }
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
        return registerCordovaCallback(Events.LOCATION, success, mySuccess);
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
        return registerCordovaCallback(Events.MOTIONCHANGE, success, mySuccess);
    },
    onLocationFilter: function(success, failure) {
        var mySuccess = function(params) {
            // Transform timestamp to Date instance.
            if (params.location.timestamp) {
                params.location.timestamp = new Date(params.location.timestamp);
            }
            success(params);
        };
        exec(mySuccess, failure, MODULE_NAME, 'addLocationFilterListener', []);
        return registerCordovaCallback(Events.LOCATIONFILTER, success, mySuccess);
    },
    onActivityChange: function(success) {
        exec(success, emptyFn, MODULE_NAME, 'addActivityChangeListener', []);
        return registerCordovaCallback(Events.ACTIVITYCHANGE, success, success);
    },
    onProviderChange: function(success) {
        exec(success, emptyFn, MODULE_NAME, 'addProviderChangeListener', []);
        return registerCordovaCallback(Events.PROVIDERCHANGE, success, success);
    },
    onGeofence: function(success, failure) {
        exec(success, failure || emptyFn, MODULE_NAME, 'addGeofenceListener', []);
        return registerCordovaCallback(Events.GEOFENCE, success, success);
    },
    onGeofencesChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addGeofencesChangeListener', []);
        return registerCordovaCallback(Events.GEOFENCESCHANGE, success, success);
    },
    onHttp: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addHttpListener', []);
        return registerCordovaCallback(Events.HTTP, success, success);
    },
    onPowerSaveChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addPowerSaveChangeListener', []);
        return registerCordovaCallback(Events.POWERSAVECHANGE, success, success);
    },
    onConnectivityChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addConnectivityChangeListener', []);
        return registerCordovaCallback(Events.CONNECTIVITYCHANGE, success, success);
    },
    onEnabledChange: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addEnabledChangeListener', []);
        return registerCordovaCallback(Events.ENABLEDCHANGE, success, success);
    },
    onHeartbeat: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addHeartbeatListener', []);
        return registerCordovaCallback(Events.HEARTBEAT, success, success);
    },
    onSchedule: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addScheduleListener', []);
        return registerCordovaCallback(Events.SCHEDULE, success, success);
    },
    onNotificationAction: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addNotificationActionListener', []);
        return registerCordovaCallback(Events.NOTIFICATIONACTION, success, success);
    },
    onAuthorization: function(success, failure) {
        exec(success, failure, MODULE_NAME, 'addAuthorizationListener', []);
        return registerCordovaCallback(Events.AUTHORIZATION, success, success);
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
    getLocations: function(query) {
        return new Promise(function(resolve, reject) {
            var success = function(params) {
                resolve(setTimestamp(params.locations));
            }
            var failure = function(error) { reject(error); }
            exec(success, failure, MODULE_NAME, 'getLocations', [query]);
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
            var success = function() { resolve(true); }   // (WO-028) every mutator resolves true, like React Native and Flutter
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'destroyLocations', []);
        });
    },
    destroyLocation: function(uuid) {
        return new Promise(function(resolve, reject) {
            var success = function() { resolve(true); }   // (WO-028)
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'destroyLocation', [uuid]);
        });
    },
    insertLocation: function(location) {
        return new Promise(function(resolve, reject) {
            location = location || {};
            var coords = location.coords || {};
            if (coords.latitude == null || coords.longitude == null) {
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
            var success = function() { resolve(true) }   // (WO-028)
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
            var success = function() { resolve(true) }   // (WO-028)
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
            var success = function() { resolve(true) }   // (WO-028)
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
            var success = function() { resolve(true) }   // (WO-028)
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
    * Fetch a list of all monitored geofences
    */
    getGeofence: function(identifier) {
        return new Promise(function(resolve, reject) {
            if ((typeof(identifier) !== 'string') || (identifier.length == 0)) {
                reject("Invalid identifer: " + identifier);
                return;
            }
            var success = function(rs) { resolve(rs) }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getGeofence', [identifier]);
        });
    },

    /**
    * Fetch a list of all monitored geofences
    */
    geofenceExists: function(identifier) {
        return new Promise(function(resolve, reject) {
            if ((typeof(identifier) !== 'string') || (identifier.length == 0)) {
                reject(false);
                return;
            }
            var success = function(rs) { resolve(rs) }
            var failure = function(error) { reject(false) }
            exec(success, failure, MODULE_NAME, 'geofenceExists', [identifier]);
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

    watchPosition: function(options, success, failure) {
        // (WO-034) Options first, matching the declared signature.
        var self = this;
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
        // (WO-034) The Subscription the types declare.  #stopWatchPosition takes no watch id and
        // stops EVERY watch, so remove() means "stop watching", not "stop this watch" — the only
        // honest shape available here; per-watch teardown is a native change (cf. WO-021).
        return {
            remove: function() { return self.stopWatchPosition(); }
        };
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
    },
    getDeviceInfo: function() {
        return new Promise(function(resolve, reject) {
            if (deviceInfo != null) {
                return resolve(deviceInfo);
            }
            var success = function(result) {
                // Cache DeviceInfo
                deviceInfo = result;
                resolve(result);
            }
            var failure = function(error) { reject(error) }
            exec(success, failure, MODULE_NAME, 'getDeviceInfo', []);
        });
    }
};

