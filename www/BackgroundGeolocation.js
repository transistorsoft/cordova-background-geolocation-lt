/**
* cordova-background-geolocation
* Copyright (c) 2015, Transistor Software (9224-2932 Quebec Inc)
* All rights reserved.
* sales@transistorsoft.com
* http://transistorsoft.com
* @see LICENSE
*/
var exec = require("cordova/exec");
var MODULE_NAME = "BackgroundGeolocation";

/**
* Client log method
*/
function log(level, msg) {
    var method = 'anonymous';
    /** Doesn't work in strict mode
    var caller = arguments.callee.caller.caller;
    if (caller) {
        method = caller.name;
    }
    */
    exec(function() {},
        function() {},
        MODULE_NAME,
        'log',
        [level, msg]
    );
}

module.exports = {
    LOG_LEVEL_OFF: 0,
    LOG_LEVEL_ERROR: 1,
    LOG_LEVEL_WARNING: 2,
    LOG_LEVEL_INFO: 3,
    LOG_LEVEL_DEBUG: 4,
    LOG_LEVEL_VERBOSE: 5,

    DESIRED_ACCURACY_HIGH: 0,
    DESIRED_ACCURACY_MEDIUM: 10,
    DESIRED_ACCURACY_LOW: 100,
    DESIRED_ACCURACY_VERY_LOW: 1000,

    AUTHORIZATION_STATUS_NOT_DETERMINED: 0,
    AUTHORIZATION_STATUS_RESTRICTED: 1,
    AUTHORIZATION_STATUS_DENIED: 2,
    AUTHORIZATION_STATUS_ALWAYS: 3,
    AUTHORIZATION_STATUS_WHEN_IN_USE: 4,

    NOTIFICATION_PRIORITY_DEFAULT: 0,
    NOTIFICATION_PRIORITY_HIGH: 1,
    NOTIFICATION_PRIORITY_LOW: -1,
    NOTIFICATION_PRIORITY_MAX: 2,
    NOTIFICATION_PRIORITY_MIN: -2,

    /**
    * @property {Object} stationaryLocation
    */
    stationaryLocation: null,
    /**
    * @property {Object} config
    */
    config: {},
    cordovaCallbacks: [],

    /**
    * @private {Error} error
    */
    configure: function(config, success, failure) {
        // Check for new method signature.
        if (typeof(config) === 'function') {
            console.warn('Warning: The method signature for BackgroundGeolocation#configure has changed!  Instead of providing the location-callback, error-callback to this method, you should now use the dedicated #onLocation method to provide these callabcks.  The #success, #failure callbacks provided to #configure will now fire to signal when the plugin is ready or failed to configure.  Please see the new documentation for #configure method and modify your code to respect the new signature ASAP.');
            this.onLocation(config, success);
            config  = failure || {};
            success = function() {};
            failure = function() {};
        }
        config = config || {};
        this.config = config;

        exec(success || function() {},
             failure || function() {},
             MODULE_NAME,
             'configure',
             [config]
        );
    },
    /**
    * add event listener
    */
    addListener: function(event, success, fail) {
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
        }
    },
    /**
    * @alias #addListener
    */
    on: function() {
        this.addListener.apply(this, arguments);    
    },
    /**
    * remove event-listener
    */
    removeListener: function(event, callback, success, failure) {
        // Compose remove-listener method name, eg:  "removeLocationListener"
        var cordovaCallback;
        for (var n=0,len=this.cordovaCallbacks.length;n<len;n++) {
            cordovaCallback = this.cordovaCallbacks[n];
            if (cordovaCallback.success === callback) {
                var callbackId = cordovaCallback.callbackId;
                if (typeof(window.cordova.callbacks[callbackId]) === 'object') {
                    // Destroy Cordova callback.
                    delete window.cordova.callbacks[callbackId];
                    // Destroy internal reference
                    this.cordovaCallbacks.splice(n, 1);

                    exec(success || function() {},
                         failure || function() {},
                         MODULE_NAME,
                         'removeListener',
                         [event, callbackId]
                    );
                } else {
                    console.warn('#un ' + event + ' failed to locate cordova callback');
                }
                break;
            }
        }
    },
    /**
    * @alias #removeListener
    */
    un: function() {
        this.removeListener.apply(this, arguments);
    },
    /**
    * Remove all event-listeners
    */
    removeListeners: function(success, failure) {
        success = success || function(){};
        failure = failure || function(){};
        var re = /^BackgroundGeolocation.*/;
        var mySuccess = function(response) {
            var callbacks = window.cordova.callbacks;
            for (var callbackId in callbacks) {
                if (callbacks.hasOwnProperty(callbackId) && callbackId.match(re)) {
                    delete callbacks[callbackId];
                }
            }
            success(response);
        }
        exec(mySuccess,
             failure,
             MODULE_NAME,
             'removeListeners',
             []
        );
    },
    getState: function(success, failure) {
        exec(success || function() {},
             failure || function() {},
             MODULE_NAME,
             'getState',
             []
        );
    },
    start: function(success, failure, config) {
        exec(success || function() {},
             failure || function() {},
             MODULE_NAME,
             'start',
             []);
    },
    stop: function(success, failure, config) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'stop',
            []);
    },
    startSchedule: function(success, failure) {
        exec(success || function() {},
             failure || function() {},
             MODULE_NAME,
             'startSchedule',
             []);
    },
    stopSchedule: function(success, failure) {
        exec(success || function() {},
             failure || function() {},
             MODULE_NAME,
             'stopSchedule',
             []);
    },
    startGeofences: function(success, failure) {
        exec(success || function() {},
             failure || function() {},
             MODULE_NAME,
             'startGeofences',
             []);
    },
    startBackgroundTask: function(callback) {
        if (typeof(callback) !== 'function') {
            throw "startBackgroundTask must be provided with a callbackFn to receive the returned #taskId";
        }
        exec(callback,
            function() {},
            MODULE_NAME,
            'startBackgroundTask',
            []);
    },
    finish: function(taskId, success, failure) {
        if ((typeof(taskId) !== 'number') || taskId === 0) {
            return;
        }
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'finish',
            [taskId]);
    },
    error: function(taskId, message) {
        if (typeof(taskId) !== 'number') {
            throw "BackgroundGeolocation#error must now be provided with a taskId as 1st param, eg: bgGeo.finish(taskId).  taskId is provided by 2nd param in callback";
        }
        exec(function() {},
            function() {},
            MODULE_NAME,
            'error',
            [taskId, message]);
    },
    changePace: function(isMoving, success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'changePace',
            [isMoving]);
    },
    setConfig: function(config, success, failure) {
        if (typeof(config) === 'function') {
            console.warn('The signature for #setConfig has changed:  You now provide the {} as the 1st parameter.  ie: setConfig(config, success, failure');
            var _config = failure, _success = config, _failure = success;
            config  = _config;
            success = _success;
            failure = _failure;
        }
        this._apply(this.config, config);
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'setConfig',
            [config]);
    },
    isPowerSaveMode: function(success, failure) {
        exec(success||function(){},
            failure || function() {},
            MODULE_NAME,
            'isPowerSaveMode',
            []);
    },
    /**
    * Returns current stationaryLocation if available.  null if not
    */
    getStationaryLocation: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'getStationaryLocation',
            []);
    },
    onLocation: function(success, failure) {
        if (typeof(success) !== 'function') {
            throw "A callback must be provided";
        }
        var mySuccess = function(location) {
            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }            
            success(location);
        }

        exec(mySuccess,
             failure || function() {},
             MODULE_NAME,
             'addLocationListener',
             []
        );
        this._registerCallback(success, mySuccess);
    },
    /**
    * Add a movement-state-change listener.  Whenever the devices enters "stationary" or "moving" mode, your #success callback will be executed with #location param containing #radius of region
    * @param {Function} success
    * @param {Function} failure [optional] NOT IMPLEMENTED
    */
    onMotionChange: function(success, failure) {
        var me = this;
        success = success || function() {};
        var callback = function(params) {
            var isMoving    = params.isMoving;
            var location    = params.location;

            if (!isMoving) {
                me.stationaryLocation = location;
            }

            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }
            success(isMoving, location);
        };
        exec(callback,
            failure || function() {},
            MODULE_NAME,
            'addMotionChangeListener',
            []);
        this._registerCallback(success, callback);
    },
    onActivityChange: function(success) {
        success = success || function() {}
        exec(success,
            function() {},
            MODULE_NAME,
            'addActivityChangeListener',
            []);
        this._registerCallback(success, success);
    },
    onProviderChange: function(success) {
        success = success || function() {};
        exec(success,
            function() {},
            MODULE_NAME,
            'addProviderChangeListener',
            []);
        this._registerCallback(success, success);
    },
    onGeofencesChange: function(success) {
        success = success || function() {}
        exec(success,
            function() {},
            MODULE_NAME,
            'addGeofencesChangeListener',
            []);
        this._registerCallback(success, success);
    },
    onPowerSaveChange: function(success) {
        success = success || function() {};
        exec(success,
            function() {},
            MODULE_NAME,
            'addPowerSaveChangeListener',
            []);
        this._registerCallback(success, success);
    },
    onHeartbeat: function(success, failure) {
        success = success || function() {}
        exec(success,
            failure || function() {},
            MODULE_NAME,
            'addHeartbeatListener',
            []);
        this._registerCallback(success, success);
    },
    onSchedule: function(success, failure) {
        success || function() {}
        exec(success,
            failure || function() {},
            MODULE_NAME,
            'addScheduleListener',
            []);
        this._registerCallback(success, success);
    },
    getLocations: function(success, failure) {
        if (typeof(success) !== 'function') {
            throw "BackgroundGeolocation#getLocations requires a success callback";
        }
        var me = this;
        var mySuccess = function(params) {
            var locations   = me._setTimestamp(params.locations);
            success(locations);
        }
        exec(mySuccess,
            failure || function() {},
            MODULE_NAME,
            'getLocations',
            []);
    },
    getCount: function(success, failure) {
        exec(success||function(){},
            failure || function() {},
            MODULE_NAME,
            'getCount',
            []);
    },
    // @deprecated
    clearDatabase: function(success, failure) {
        this.destroyLocations(success, failure);
    },
    destroyLocations: function(success, failure) {
        exec(success||function(){},
            failure || function() {},
            MODULE_NAME,
            'destroyLocations',
            []);
    },
    insertLocation: function(location, success, failure) {
        location = location || {};
        var coords = location.coords || {};
        if (!coords.latitude && !coords.longitude) {
            throw "BackgroundGeolocation#insertLocation location must contain coords.latitude & coords.longitude";
        }
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'insertLocation',
            [location]);
    },
    /**
    * Signal native plugin to sync locations queue to HTTP
    */
    sync: function(success, failure) {
        if (typeof(success) !== 'function') {
            throw "BackgroundGeolocation#sync requires a success callback";
        }
        var me = this;
        var mySuccess = function(params) {
            var locations   = me._setTimestamp(params.locations);
            success(locations);
        }
        exec(mySuccess,
            failure || function() {},
            MODULE_NAME,
            'sync',
            []);
    },
    onHttp: function(success, failure) {
        success = success || function() {};
        exec(success,
            failure || function() {},
            MODULE_NAME,
            'addHttpListener',
            []);
        this._registerCallback(success, success);
    },
    onLog: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'addLogListener',
            []);
    },
    /**
    * Fetch current odometer value
    */
    getOdometer: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'getOdometer',
            []);
    },
    /**
    * Reset Odometer to 0
    */
    resetOdometer: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'setOdometer',
            [0]);
    },
    setOdometer: function(value, success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'setOdometer',
            [value]);
    },

    /**
    * add geofence
    */
    addGeofence: function(config, success, failure) {
        config = config || {};
        if (!config.identifier) {
            throw "#addGeofence requires an 'identifier'";
        }
        if (!(config.latitude && config.longitude)) {
            throw "#addGeofence requires a #latitude and #longitude";
        }
        if (!config.radius) {
            throw "#addGeofence requires a #radius";
        }
        if ( (typeof(config.notifyOnEntry) === 'undefined') && (typeof(config.notifyOnExit) === 'undefined') ) {
            throw "#addGeofence requires at least notifyOnEntry {Boolean} and/or #notifyOnExit {Boolean}";
        }
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'addGeofence',
            [config]);
    },
    /**
    * add a list of geofences
    */
    addGeofences: function(geofences, success, failure) {
        geofences = geofences || [];
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'addGeofences',
            [geofences]);
    },
    /**
    * Remove all geofences
    */
    removeGeofences: function(identifiers, success, failure) {
        if (arguments.length === 0) {
            identifiers = [];
            success = function() {};
            failure = function() {};
        } else if (typeof(identifiers) === 'function') {
            failure = success;
            success = identifiers;
            identifiers = [];
        }
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'removeGeofences',
            [identifiers]);
    },
    /**
    * remove a geofence
    * @param {String} identifier
    */
    removeGeofence: function(identifier, success, failure) {
        if (!identifier) {
            throw "#removeGeofence requires an 'identifier'";
        }
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'removeGeofence',
            [identifier]);
    },
    onGeofence: function(success, failure) {
        if (!typeof(success) === 'function') {
            throw "#onGeofence requires a success callback";
        }
        exec(success,
            failure || function() {},
            MODULE_NAME,
            'addGeofenceListener',
            []);
        this._registerCallback(success, success);
    },
    /**
    * Fetch a list of all monitored geofences
    */
    getGeofences: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'getGeofences',
            []);
    },
    /**
    * Fetch the current position
    */
    getCurrentPosition: function(success, failure, options) {
        options = options || {};
        success = success || function() {};
        var mySuccess = function(location) {
            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }
            success(location);
        }
        exec(mySuccess || function() {},
            failure || function() {},
            MODULE_NAME,
            'getCurrentPosition',
            [options]);
    },
    watchPosition: function(success, failure, options) {
        var me = this;
        options = options || {};
        success = success || function(location) {};
        var mySuccess = function(location) {
            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }
            success(location);
        }
        exec(mySuccess || function() {},
            failure || function() {},
            MODULE_NAME,
            'watchPosition',
            [options]);
    },
    stopWatchPosition: function(success, failure, options) {
        var success = success || function() {};
        var failure = failure || function() {};

        var mySuccess = function(watchCallbacks) {
            var callbacks = window.cordova.callbacks;
            for (var n=0,len=watchCallbacks.length;n<len;n++) {
                var callbackId = watchCallbacks[n];
                if (callbacks[callbackId]) {
                    delete callbacks[callbackId];
                } else {
                    console.warn(MODULE_NAME + '#stopWatchPosition failed to locate callbackId: ', callbackId);
                }
            }
            success();
        };
        exec(mySuccess,
            failure,
            MODULE_NAME,
            'stopWatchPosition',
        []);
    },
    setLogLevel: function(logLevel, success, failure) {
       var success = success || function() {};
       var failure = failure || function() {};
       exec(success,
            failure,
            MODULE_NAME,
            'setLogLevel',
            [logLevel]);
    },
    getLog: function(success, failure) {
        var success = success || function() {};
        var failure = failure || function() {};
        exec(success,
            failure,
            MODULE_NAME,
            'getLog',
            []);
    },
    destroyLog: function(success, failure) {
        var success = success || function() {};
        var failure = failure || function() {};
        exec(success,
            failure,
            MODULE_NAME,
            'destroyLog',
            []);
    },
    emailLog: function(email, success, failure) {
        var success = success || function() {};
        var failure = failure || function() {};
        exec(success,
            failure,
            MODULE_NAME,
            'emailLog',
            [email]);
    },

    logger: {
        error: function(msg) {
            log('error', msg);
        },
        warn: function(msg) {
            log('warn', msg);
        },
        debug: function(msg) {
            log('debug', msg);
        },
        info: function(msg) {
            log('info', msg);
        },        
        notice: function(msg) {
            log('notice', msg);
        },        
        header: function(msg) {
            log('header', msg);
        },
        on: function(msg) {
            log('on', msg);
        },
        off: function(msg) {
            log('off', msg);
        },
        ok: function(msg) {
            log('ok', msg);
        }
    },


    /**
    * Fetch list of available sensors: accelerometer, gyroscope, magnetometer
    */
    getSensors: function(success, failure) {
        var success = success || function() {};
        var failure = failure || function() {};
        exec(success,
            failure,
            MODULE_NAME,
            'getSensors',
            []);
    },
    /**
    * Play a system sound.  This is totally experimental.
    * iOS http://iphonedevwiki.net/index.php/AudioServices
    * Android:
    */
    playSound: function(soundId) {
        var success = function() {};
        var failure = function() {};
        exec(success,
            failure,
            MODULE_NAME,
            'playSound',
            [soundId]);
    },

    _setTimestamp: function(rs) {
        // Transform timestamp to Date instance.
        if (typeof(rs) === 'object') {
            for (var n=0,len=rs.length;n<len;n++) {
                if (rs[n].timestamp) { 
                    rs[n].timestamp = new Date(rs[n].timestamp);
                }
            }
        }
        return rs;
    },
    _runBackgroundTask: function(taskId, callback) {
        var me = this;
        try {
            callback.call(this);
        } catch(e) {
            console.log("*************************************************************************************");
            console.error("BackgroundGeolocation caught a Javascript Exception in your application code");
            console.log(" while running in a background thread.  Auto-finishing background-task:", taskId);
            console.log(" to prevent application crash");
            console.log("*************************************************************************************");
            console.log("STACK:\n", e.stack);
            console.error(e);

            // And finally, here's our raison d'etre:  catching the error in order to ensure background-task is completed.
            this.error(taskId, e.message);
        }
    },
    _apply: function(destination, source) {
        source = source || {};
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    },
    _registerCallback: function(userSuccess, mySuccess) {
        var callbacks = window.cordova.callbacks;
        var re = new RegExp(MODULE_NAME);
        for (var callbackId in callbacks) {
            if (callbackId.match(re)) {
                var callback = callbacks[callbackId];
                if (callback.success === mySuccess) {
                    this.cordovaCallbacks.push({
                        callbackId: callbackId,
                        success: userSuccess
                    });
                    break;
                }
            }
        }
    }
};
