/**
* cordova-background-geolocation
* Copyright (c) 2015, Transistor Software (9224-2932 Quebec Inc)
* All rights reserved.
* sales@transistorsoft.com
* http://transistorsoft.com
* @see LICENSE
*/

var API = require('./API');
var DeviceSettings = require('./DeviceSettings');

var emptyFn = function() {};

module.exports = {
    LOG_LEVEL_OFF: 0,
    LOG_LEVEL_ERROR: 1,
    LOG_LEVEL_WARNING: 2,
    LOG_LEVEL_INFO: 3,
    LOG_LEVEL_DEBUG: 4,
    LOG_LEVEL_VERBOSE: 5,

    // For #desiredAccuracy
    DESIRED_ACCURACY_NAVIGATION: -2,
    DESIRED_ACCURACY_HIGH: -1,
    DESIRED_ACCURACY_MEDIUM: 10,
    DESIRED_ACCURACY_LOW: 100,
    DESIRED_ACCURACY_VERY_LOW: 1000,
    DESIRED_ACCURACY_THREE_KILOMETER: 3000,

    // For providerchange event
    AUTHORIZATION_STATUS_NOT_DETERMINED: 0,
    AUTHORIZATION_STATUS_RESTRICTED: 1,
    AUTHORIZATION_STATUS_DENIED: 2,
    AUTHORIZATION_STATUS_ALWAYS: 3,
    AUTHORIZATION_STATUS_WHEN_IN_USE: 4,

    // For android #notificationPriority
    NOTIFICATION_PRIORITY_DEFAULT: 0,
    NOTIFICATION_PRIORITY_HIGH: 1,
    NOTIFICATION_PRIORITY_LOW: -1,
    NOTIFICATION_PRIORITY_MAX: 2,
    NOTIFICATION_PRIORITY_MIN: -2,

    // For iOS #activityType
    ACTIVITY_TYPE_OTHER: 1,
    ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION: 2,
    ACTIVITY_TYPE_FITNESS: 3,
    ACTIVITY_TYPE_OTHER_NAVIGATION: 4,

    // For persistMode
    PERSIST_MODE_ALL: 2,
    PERSIST_MODE_LOCATION: 1,
    PERSIST_MODE_GEOFENCE: -1,
    PERSIST_MODE_NONE: 0,

    deviceSettings: DeviceSettings,

    ready: function(defaultConfig, success, failure) {
        if (arguments.length <= 1) {
            return API.ready(defaultConfig||{});
        } else {
            API.ready(defaultConfig).then(success).catch(failure);
        }
    },
    configure: function(config, success, failure) {
        config = config || {};
        if (arguments.length == 1) {
            return API.configure(config);
        } else {
            API.configure(config).then(success).catch(failure);
        }
    },
    reset: function(config, success, failure) {
        if ((typeof(config) === 'function') ||  (typeof(success) === 'function')) {
            if (typeof(config) === 'function') {
                success = config;
                config = undefined;
            }
            API.reset(config).then(success).catch(failure);
        } else {
            return API.reset(config);
        }
    },
    requestPermission: function(success, failure) {
        if (!arguments.length) {
            return API.requestPermission();
        } else {
            API.requestPermission().then(success).catch(failure);
        }
    },
    getProviderState: function(success, failure) {
        if (!arguments.length) {
            return API.getProviderState();
        } else {
            API.getProviderState().then(success).catch(failure);
        }
    },
    onLocation: function(success, failure) {
        this.on('location', success, failure);
    },

    onMotionChange: function(callback) {
        this.on('motionchange', callback);
    },

    onHttp: function(callback) {
        this.on('http', callback);
    },

    onHeartbeat: function(callback) {
        this.on('heartbeat', callback);
    },

    onProviderChange: function(callback) {
        this.on('providerchange', callback);
    },

    onActivityChange: function(callback) {
        this.on('activitychange', callback);
    },

    onGeofence: function(callback) {
        this.on('geofence', callback);
    },

    onGeofencesChange: function(callback) {
        this.on('geofenceschange', callback);
    },

    onSchedule: function(callback) {
        this.on('schedule', callback);
    },

    onEnabledChange: function(callback) {
        this.on('enabledchange', callback);
    },

    onConnectivityChange: function(callback) {
        this.on('connectivitychange', callback);
    },

    onPowerSaveChange: function(callback) {
        this.on('powersavechange', callback);
    },

    onNotificationAction: function(callback) {
        this.on('notificationaction', callback);
    },

    on: function(event, success, failure) {
        if (typeof(success) !== 'function') {
            throw "BackgroundGeolocation event '" + event + "' was not provided with a success callback.  If you're attempting to use Promise API to add an event-listener, that won't work, since a Promise can only evaluate once.";
        }
        failure = failure || emptyFn;
        API.addListener(event, success, failure);
    },
    /**
    * @alias #removeListener
    */
    un: function() {
        return this.removeListener.apply(this, arguments);
    },
    removeListener: function(event, handler, success, failure) {
        if (arguments.length == 2) {
            return API.removeListener(event, handler);
        } else {
            API.removeListener(event, handler).then(success).catch(failure);
        }
    },
    removeListeners: function(success, failure) {
        if (!arguments.length) {
            return API.removeListeners();
        } else {
            API.removeListeners().then(success).catch(failure);
        }
    },
    getState: function(success, failure) {
        if (!arguments.length) {
            return API.getState();
        } else {
            API.getState().then(success).catch(failure);
        }
    },
    start: function(success, failure) {
        if (!arguments.length) {
            return API.start();
        } else {
            API.start().then(success).catch(failure);
        }
    },
    stop: function(success, failure) {
        if (!arguments.length) {
            return API.stop();
        } else {
            API.stop().then(success).catch(failure);
        }
    },
    startSchedule: function(success, failure) {
        if (!arguments.length) {
            return API.startSchedule();
        } else {
            API.startSchedule().then(success).catch(failure);
        }
    },
    stopSchedule: function(success, failure) {
        if (!arguments.length) {
            return API.stopSchedule();
        } else {
            API.stopSchedule().then(success).catch(failure);
        }
    },
    startGeofences: function(success, failure) {
        if (!arguments.length) {
            return API.startGeofences();
        } else {
            API.startGeofences().then(success).catch(failure);
        }
    },
    startBackgroundTask: function(success, failure) {
        if (!arguments.length) {
            return API.startBackgroundTask();
        } else {
            API.startBackgroundTask().then(success).catch(failure);
        }
    },
    stopBackgroundTask: function(taskId, success, failure) {
        if (arguments.length == 1) {
            return API.stopBackgroundTask(taskId);
        } else {
            API.stopBackgroundTask(taskId).then(success).catch(failure);
        }
    },
    finish: function(taskId, success, failure) {
        return this.stopBackgroundTask.apply(this, arguments);
    },
    changePace: function(isMoving, success, failure) {
        if (arguments.length == 1) {
            return API.changePace(isMoving);
        } else {
            API.changePace(isMoving).then(success).catch(failure);
        }
    },
    setConfig: function(config, success, failure) {
        if (arguments.length == 1) {
            return API.setConfig(config);
        } else {
            API.setConfig(config).then(success).catch(failure);
        }
    },
    getLocations: function(success, failure) {
        if (!arguments.length) {
            return API.getLocations();
        } else {
            API.getLocations().then(success).catch(failure);
        }
    },
    getCount: function(success, failure) {
        if (!arguments.length) {
            return API.getCount();
        } else {
            API.getCount().then(success).catch(failure);
        }
    },
    destroyLocations: function(success, failure) {
        if (!arguments.length) {
            return API.destroyLocations();
        } else {
            API.destroyLocations().then(success).catch(failure);
        }
    },
    // @deprecated
    clearDatabase: function() {
        return this.destroyLocations.apply(this, arguments);
    },
    insertLocation: function(location, success, failure) {
        if (arguments.length == 1) {
            return API.insertLocation(location);
        } else {
            API.insertLocation(location).then(success).catch(failure);
        }
    },
    sync: function(success, failure) {
        if (!arguments.length) {
            return API.sync();
        } else{
            API.sync().then(success).catch(failure);
        }
    },
    getOdometer: function(success, failure) {
        if (!arguments.length) {
            return API.getOdometer();
        } else {
            API.getOdometer().then(success).catch(failure);
        }
    },
    resetOdometer: function(success, failure) {
        if (!arguments.length) {
            return API.setOdometer(0);
        } else {
            API.setOdometer(0).then(success).catch(failure);
        }
    },
    setOdometer: function(value, success, failure) {
        if (arguments.length == 1) {
            return API.setOdometer(value);
        } else {
            API.setOdometer(value).then(success).catch(failure);
        }
    },
    addGeofence: function(config, success, failure) {
        if (arguments.length == 1) {
            return API.addGeofence(config);
        } else {
            API.addGeofence(config).then(success).catch(failure);
        }
    },
    removeGeofence: function(identifier, success, failure) {
        if (arguments.length == 1) {
            return API.removeGeofence(identifier);
        } else {
            API.removeGeofence(identifier).then(success).catch(failure);
        }
    },
    addGeofences: function(geofences, success, failure) {
        if (arguments.length == 1) {
            return API.addGeofences(geofences);
        } else {
            API.addGeofences(geofences).then(success).catch(failure);
        }
    },
    /**
    * 1. removeGeofences() <-- Promise
    * 2. removeGeofences(['foo'])  <-- Promise
    *
    * 3. removeGeofences(success, [failure])
    * 4. removeGeofences(['foo'], success, [failure])
    */
    removeGeofences: function(identifiers, success, failure) {
        if ( (arguments.length <= 1) && (typeof(identifiers) !== 'function') )  {
            return API.removeGeofences(identifiers);
        } else {
            if (typeof(identifiers) === 'function') {
                // 3. -> removeGeofences(success, failure?)
                failure = success || emptyFn;
                success = identifiers;
                identifiers = [];
            }
            API.removeGeofences(identifiers).then(success).catch(failure);
        }
    },
    getGeofences: function(success, failure) {
        if (!arguments.length) {
            return API.getGeofences();
        } else {
            API.getGeofences().then(success).catch(failure);
        }
    },
    getCurrentPosition: function(options, success, failure) {
        if (typeof (options) === 'function') {
            throw "#getCurrentPosition requires options {} as first argument";
        }
        if (typeof(success) === 'function') {
            options = options || {};
            API.getCurrentPosition(options).then(success).catch(failure);
        } else {
            return API.getCurrentPosition.apply(API, arguments);
        }
    },
    watchPosition: function(success, failure, options) {
        if (typeof(success) === 'function') {
            API.watchPosition.apply(API, arguments);
        } else {
            throw "BackgroundGeolocation#watchPosition does not support Promise API, since Promises cannot resolve multiple times.  The #watchPosition callback *will* be run multiple times.  Use the #watchPosition(success, failure, options) API.";
        }
    },
    stopWatchPosition: function(success, failure) {
        if (!arguments.length) {
            return API.stopWatchPosition();
        } else {
            API.stopWatchPosition().then(success).catch(failure);
        }
    },
    registerHeadlessTask: function(callback) {
        console.warn('[BackgroundGeolocation registerHeadlessTask] -- Cordova has no Javascript mechanism for registering Headless-tasks.  See Wiki https://github.com/transistorsoft/cordova-background-geolocation-lt/wiki/Android-Headless-Mode');
    },
    setLogLevel: function(logLevel, success, failure) {
        if (arguments.length == 1) {
            return API.setLogLevel(logLevel);
        } else {
            API.setLogLevel(logLevel).then(success).catch(failure);
        }
    },
    getLog: function(success, failure) {
        if (!arguments.length) {
            return API.getLog();
        } else {
            API.getLog().then(success).catch(failure);
        }
    },
    destroyLog: function(success, failure) {
        if (!arguments.length) {
            return API.destroyLog();
        } else {
            API.destroyLog().then(success).catch(failure);
        }
    },
    emailLog: function(email, success, failure) {
        if (arguments.length == 1) {
            return API.emailLog(email);
        } else {
            API.emailLog(email).then(success).catch(failure);
        }
    },
    isPowerSaveMode: function(success, failure) {
        if (!arguments.length) {
            return API.isPowerSaveMode();
        } else {
            API.isPowerSaveMode().then(success).catch(failure);
        }
    },
    getSensors: function(success, failure) {
        if (!arguments.length) {
            return API.getSensors();
        } else {
            API.getSensors().then(success).catch(failure);
        }
    },
    /**
    * Play a system sound.  This is totally experimental.
    * iOS http://iphonedevwiki.net/index.php/AudioServices
    * Android:
    */
    playSound: function(soundId) {
        return API.playSound(soundId);
    },
    logger: {
        error: function(msg) {
            return API.log('error', msg);
        },
        warn: function(msg) {
            return API.log('warn', msg);
        },
        debug: function(msg) {
            return API.log('debug', msg);
        },
        info: function(msg) {
            return API.log('info', msg);
        },
        notice: function(msg) {
            return API.log('notice', msg);
        },
        header: function(msg) {
            return API.log('header', msg);
        },
        on: function(msg) {
            return API.log('on', msg);
        },
        off: function(msg) {
            return API.log('off', msg);
        },
        ok: function(msg) {
            return API.log('ok', msg);
        }
    },
    /**
    * Returns a #params object suitable for recognition by tracker.transistorsoft.com
    * @param {Device} cordova-plugin-device instance
    * @return {Object}
    */
    transistorTrackerParams: function(device) {
        if (typeof(device) === undefined) { throw "An instance of cordova-plugin-device must be provided"; }
        if (typeof(device.model) === undefined) { throw "Invalid instance of cordova-plugin-device"; }
        return {
            device: {
                model: device.model,
                platform: device.platform,
                uuid: device.model.replace(/[\s\.,]/g, '-'),
                version: device.version,
                manufacturer: device.manufacturer,
                framework: 'Cordova'
            }
        };
    },
    test: function(delay) {
        test(this, delay);
    }
};

var test = function(bgGeo, delay) {
    delay = delay || 250;

    var methods = [
        ['reset', {debug: true, logLevel: 5}],
        ['setConfig', {distanceFilter: 50}],
        ['setLogLevel', 5],
        ['getLog', null],
        ['emailLog', 'foo@bar.com'],
        ['on', 'location'],
        ['ready', {}],
        ['configure', {debug: true, logLevel: 5, schedule: ['1-7 00:00-23:59']}],
        ['getState', null],
        ['startSchedule', null],
        ['stopSchedule', null],
        ['startGeofences', null],
        ['stop', null],
        ['start', null],
        ['startBackgroundTask', null],
        ['finish', 0],
        ['changePace', true],
        ['getLocations', null],
        ['insertLocation', {}],
        ['sync', null],
        ['getOdometer', null],
        ['setOdometer', 0],
        ['resetOdometer'],
        ['addGeofence', {identifier: 'test-geofence-1', radius: 100, latitude: 0, longitude:0, notifyOnEntry:true}],
        ['addGeofences', [{identifier: 'test-geofence-2', radius: 100, latitude: 0, longitude:0, notifyOnEntry:true}, {identifier: 'test-geofence-3', radius: 100, latitude: 0, longitude:0, notifyOnEntry:true}]],
        ['getGeofences', null],
        ['removeGeofence', 'test-geofence-1'],
        ['removeGeofences', null],
        ['getCurrentPosition', {}],
        ['watchPosition', {}],
        ['stopWatchPosition', null],
        ['isPowerSaveMode', null],
        ['getSensors', null],
        ['playSound', 1509],
        ['destroyLocations', null],
        ['clearDatabase', null],
        ['destroyLog', null],
        ['removeListeners', null]
    ];

    var createCallback = function(type, method, params) {
        return function(result) {
            console.log('- ' + method + '(' + params + ') - ' + type + ': ', result);
        }
    }
    var executeMethod = function(record) {
        console.log('* Execute method: ', record)
        var method = '' + record[0];
        var params = record[1];

        var success = createCallback('success', method, params);
        var failure = createCallback('failure', method, params);

        // Execute Standard API
        try {
            console.log('- Standard API: ' + method);
            if (params == null) {
                bgGeo[method](success, failure);
            } else {
                // Adjust params for different signatures.
                switch (method) {
                    case 'watchPosition':
                    case 'getCurrentPosition':
                        bgGeo[method](success, failure, params);
                        break;
                    default:
                        bgGeo[method](params, success, failure);
                        break;
                }
            }
        } catch (e) {
            console.warn(e);
        }
        // Execute Promise API
        setTimeout(function() {
            console.log('- Promise API: ' + method);
            try {
                if (params == null) {
                    bgGeo[method]().then(success).catch(failure);
                } else {
                    bgGeo[method](params).then(success).catch(failure);
                }
            } catch (e) {
                console.warn(e);
            }
        }, 10);
    }
    // Begin fetching methods.
    var intervalId = setInterval(function() {
        var record = methods.shift();
        if (!record || !methods.length) {
            clearInterval(intervalId);
            console.log('*** TEST COMPLETE ***');
            return;
        }
        executeMethod(record);
    }, delay);
}

