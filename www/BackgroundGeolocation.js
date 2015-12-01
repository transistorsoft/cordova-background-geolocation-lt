/**
* cordova-background-geolocation
* Copyright (c) 2015, Transistor Software (9224-2932 Quebec Inc)
* All rights reserved.
* sales@transistorsoft.com
* http://transistorsoft.com
* @see LICENSE
*/
var exec = require("cordova/exec");
module.exports = {
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
            case 'http':
                return this.onHttp(success, fail);
            case 'geofence':
                return this.onGeofence(success, fail);
            case 'motionchange':
                return this.onMotionChange(success, fail);
        }
    },

    /**
    * @private {Error} error
    */
    configure: function(success, failure, config) {
        var me = this;
        config = config || {};
        this.config = config;
        success = success || function(location, taskId) {
            me.finish(taskId);
        };
        
        var mySuccess = function(params) {
            var location    = params.location || params;
            var taskId      = params.taskId || 'task-id-undefined';
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
             'BackgroundGeolocation',
             'configure',
             [config]
        );
    },
    getState: function(success, failure) {
        exec(success || function() {},
             failure || function() {},
             'BackgroundGeolocation',
             'getState',
             []
        );
    },
    start: function(success, failure, config) {
        exec(success || function() {},
             failure || function() {},
             'BackgroundGeolocation',
             'start',
             []);
    },
    stop: function(success, failure, config) {
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'stop',
            []);
    },
    beginBackgroundTask: function(callback) {
        if (typeof(callback) !== 'function') {
            throw "beginBackgroundTask must be provided with a callbackFn to receive the returned #taskId";
        }
        exec(callback,
            function() {},
            'BackgroundGeolocation',
            'beginBackgroundTask',
            []);
    },
    finish: function(taskId, success, failure) {
        if (!taskId) {
            throw "BackgroundGeolocation#finish must now be provided with a taskId as 1st param, eg: bgGeo.finish(taskId).  taskId is provided by 2nd param in callback";
        }
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'finish',
            [taskId]);
    },
    error: function(taskId, message) {
        if (!taskId) {
            throw "BackgroundGeolocation#error must now be provided with a taskId as 1st param, eg: bgGeo.finish(taskId).  taskId is provided by 2nd param in callback";
        }
        exec(function() {},
            function() {},
            'BackgroundGeolocation',
            'error',
            [taskId, message]);
    },
    changePace: function(isMoving, success, failure) {
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'changePace',
            [isMoving]);
    },
    /**
    * @param {Integer} stationaryRadius
    * @param {Integer} desiredAccuracy
    * @param {Integer} distanceFilter
    * @param {Integer} timeout
    */
    setConfig: function(success, failure, config) {
        this._apply(this.config, config);
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'setConfig',
            [config]);
    },
    /**
    * Returns current stationaryLocation if available.  null if not
    */
    getStationaryLocation: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'getStationaryLocation',
            []);
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
            var taskId      = params.taskId || 'task-id-undefined';
            
            if (!isMoving) {
                me.stationaryLocation = location;
            }

            me._runBackgroundTask(taskId, function() {
                success.call(me, isMoving, location, taskId);
            }, failure);
        };
        exec(callback,
            failure || function() {},
            'BackgroundGeolocation',
            'addMotionChangeListener',
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
            'BackgroundGeolocation',
            'getLocations',
            []);
    },
    clearDatabase: function(success, failure) {
        exec(success||function(){},
            failure || function() {},
            'BackgroundGeolocation',
            'clearDatabase',
            []);  
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
            'BackgroundGeolocation',
            'sync',
            []);
    },
    onHttp: function(success, failure) {
      exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'addHttpListener',
            []);
    },
    /**
    * Fetch current odometer value
    */
    getOdometer: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'getOdometer',
            []);
    },
    /**
    * Reset Odometer to 0
    */
    resetOdometer: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'resetOdometer',
            []);
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
        if ( (typeof(config.notifyOnEnter) === 'undefined') && (typeof(config.notifyOnExit) === 'undefined') ) {
            throw "#addGeofence requires at least notifyOnEnter {Boolean} and/or #notifyOnExit {Boolean}";
        }
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
            'addGeofence',
            [config]);
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
            'BackgroundGeolocation',
            'removeGeofence',
            [identifier]);
    },
    onGeofence: function(success, failure) {
        if (!typeof(success) === 'function') {
            throw "#onGeofence requires a success callback";
        }
        var me = this;
        var mySuccess = function(params) {
            var taskId = params.taskId || 'task-id-undefined';
            delete(params.taskId);

            me._runBackgroundTask(taskId, function() {
                success.call(me, params, taskId);
            }, failure);
        };
        exec(mySuccess,
            failure || function() {},
            'BackgroundGeolocation',
            'onGeofence',
            []);
    },
    /**
    * Fetch a list of all monitored geofences
    */
    getGeofences: function(success, failure) {
        exec(success || function() {},
            failure || function() {},
            'BackgroundGeolocation',
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
            var taskId      = params.taskId || 'task-id-undefined';
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
            'BackgroundGeolocation',
            'getCurrentPosition',
            [options]);
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
            'BackgroundGeolocation',
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
