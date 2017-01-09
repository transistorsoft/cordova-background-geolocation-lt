
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

    /**
    * @property {Object} stationaryLocation
    */
    stationaryLocation: null,
    /**
    * @property {Object} config
    */
    config: {},
    on: function(event, success, fail) {
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
        }
    },

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
        if (typeof(taskId) !== 'number') {
            throw "BackgroundGeolocation#finish must now be provided with a taskId as 1st param, eg: bgGeo.finish(taskId).  taskId is provided by 2nd param in callback";
        }
        if (taskId === 0) {
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

        var me = this;
        var mySuccess = function(params) {
            var location    = params.location || params;
            var taskId      = params.taskId || 0;
            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }
            me._runBackgroundTask(taskId, function() {
                success.call(this, location, taskId);
            });
        }
        exec(mySuccess,
             failure || function() {},
             MODULE_NAME,
             'addLocationListener',
             []
        );
    },
    /**
    * Add a movement-state-change listener.  Whenever the devices enters "stationary" or "moving" mode, your #success callback will be executed with #location param containing #radius of region
    * @param {Function} success
    * @param {Function} failure [optional] NOT IMPLEMENTED
    */
    onMotionChange: function(success, failure) {
        var me = this;
        success = success || function(isMoving, location, taskId) {
            me.finish(taskId);
        };
        var callback = function(params) {
            var isMoving    = params.isMoving;
            var location    = params.location;
            var taskId      = params.taskId || 0;

            if (!isMoving) {
                me.stationaryLocation = location;
            }

            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }

            me._runBackgroundTask(taskId, function() {
                success.call(me, isMoving, location, taskId);
            }, failure);
        };
        exec(callback,
            failure || function() {},
            MODULE_NAME,
            'addMotionChangeListener',
            []);
    },
    onActivityChange: function(success) {
        exec(success || function() {},
            function() {},
            MODULE_NAME,
            'addActivityChangeListener',
            []);
    },
    onProviderChange: function(success) {
        exec(success || function() {},
            function() {},
            MODULE_NAME,
            'addProviderChangeListener',
            []);
    },
    onGeofencesChange: function(success) {
        exec(success || function() {},
            function() {},
            MODULE_NAME,
            'addListener',
            ['geofenceschange']);
    },
    onHeartbeat: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'addHeartbeatListener',
            []);
    },
    onSchedule: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'addScheduleListener',
            []);
    },
    getLocations: function(success, failure) {
        if (typeof(success) !== 'function') {
            throw "BackgroundGeolocation#getLocations requires a success callback";
        }
        var me = this;
        var mySuccess = function(params) {
            var taskId      = params.taskId;
            var locations   = me._setTimestamp(params.locations);
            me._runBackgroundTask(taskId, function() {
                success.call(me, locations, taskId);
            });
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
            var taskId      = params.taskId;

            me._runBackgroundTask(taskId, function() {
                success.call(me, locations, taskId);
            });
        }
        exec(mySuccess,
            failure || function() {},
            MODULE_NAME,
            'sync',
            []);
    },
    onHttp: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            MODULE_NAME,
            'addHttpListener',
            []);
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
        var me = this;
        var mySuccess = function(params) {
            var taskId = params.taskId || 0;
            delete(params.taskId);

            me._runBackgroundTask(taskId, function() {
                success.call(me, params, taskId);
            }, failure);
        };
        exec(mySuccess,
            failure || function() {},
            MODULE_NAME,
            'onGeofence',
            []);
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
        var me = this;
        options = options || {};
        success = success || function(location, taskId) {
            me.finish(taskId);
        };
        var mySuccess = function(params) {
            var location    = params.location || params;
            var taskId      = params.taskId || 0;
            // Transform timestamp to Date instance.
            if (location.timestamp) {
                location.timestamp = new Date(location.timestamp);
            }
            me._runBackgroundTask(taskId, function() {
                success.call(this, location, taskId);
            });
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
                rs[n].timestamp = new Date(rs[n].timestamp);
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
    }
};

