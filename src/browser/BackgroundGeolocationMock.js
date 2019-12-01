var cordovaProxy = require('cordova/exec/proxy');

var PLUGIN_NAME = 'BackgroundGeolocation';

var EVENTS = {
	location: "location",
	motionchange: "motionchange",
	activitychange: "activitychange",
	http: "http",
	geofence: "geofence",
	geofenceschange: "geofenceschange",
	enabledchange: "enabledchange",
	providerchange: "providerchange",
	heartbeat: "heartbeat",
	schedule: "schedule",
	connectivitychange: "connectivitychange",
	powersavechange: "powersavechange",
	notificationaction: "notificationaction"
};

var DEFAULT_STATE = {
	activityRecognitionInterval: 10000,
	allowIdenticalLocations: false,
	autoSync: true,
	autoSyncThreshold: 0,
	batchSync: false,
	debug: true,
	deferTime: 0,
	desiredAccuracy: -2,
	desiredOdometerAccuracy: 100,
	didLaunchInBackground: false,
	disableElasticity: false,
	disableLocationAuthorizationAlert: false,
	disableMotionActivityUpdates: false,
	disableStopDetection: false,
	distanceFilter: 10,
	elasticityMultiplier: 1,
	enableHeadless: false,
	enableTimestampMeta: false,
	enabled: false,
	extras: {},
	fastestLocationUpdateInterval: -1,
	forceReloadOnBoot: false,
	forceReloadOnGeofence: false,
	forceReloadOnHeartbeat: false,
	forceReloadOnLocationChange: false,
	forceReloadOnMotionChange: false,
	forceReloadOnSchedule: false,
	foregroundService: true,
	geofenceInitialTriggerEntry: true,
	geofenceModeHighAccuracy: true,
	geofenceProximityRadius: 1000,
	geofenceTemplate: "",
	headers: {},
	headlessJobService: "com.transistorsoft.cordova.bggeo.BackgroundGeolocationHeadlessTask",
	heartbeatInterval: -1,
	httpRootProperty: "location",
	httpTimeout: 60000,
	isFirstBoot: false,
	isMoving: false,
	locationAuthorizationRequest: "Always",
	locationTemplate: "",
	locationTimeout: 60,
	locationUpdateInterval: 5000,
	locationsOrderDirection: "ASC",
	logLevel: 5,
	logMaxDays: 3,
	maxBatchSize: -1,
	maxDaysToPersist: 14,
	maxRecordsToPersist: -1,
	method: "POST",
	minimumActivityRecognitionConfidence: 75,
	notification: {layout: "default", title: "The text", text: "asdfasdf", color: "", channelName: "TSLocationManager"},
	odometer: 0,
	preventSuspend: false,
	params: {},
	persist: true,
	persistMode: 2,
	schedule: [],
	scheduleUseAlarmManager: true,
	schedulerEnabled: false,
	speedJumpFilter: 300,
	startOnBoot: false,
	stationaryRadius: 25,
	stopAfterElapsedMinutes: 0,
	stopOnStationary: false,
	stopOnTerminate: true,
	stopTimeout: 5,
	trackingMode: 1,
	triggerActivities: "in_vehicle, on_bicycle, on_foot, running, walking",
	url: "",
	useSignificantChangesOnly: false
};
var _state = Object.assign({}, DEFAULT_STATE);

var DEVICE_SENSORS = {
	accelerometer: false,
	gyroscope: false,
	magnetometer: false,
	significant_motion: false
};

var DEVICE_INFO = {
    platform: 'browser',
    model: 'Unknown',
    manufacturer: 'Unknown',
    version: '-1',
    framework: 'cordova'
};

var PROVIDER_STATE = {
	gps: false,
	network: true,
	status: 3,
	enabled: true
};

var DEFAULT_LOCATION = {
  "is_moving": false,
  "uuid": "0f4043be-f65d-4c6c-b7e4-5d17dc75b2e5",
  "timestamp": "2019-08-28T17:24:15.146Z",
  "odometer": 7062702.5,
  "coords": {
    "latitude": 45.519262,
    "longitude": -73.6169577,
    "accuracy": 18.3,
    "speed": -1,
    "heading": -1,
    "altitude": 42.8
  },
  "activity": {
    "type": "still",
    "confidence": 100
  },
  "battery": {
    "is_charging": true,
    "level": 1
  },
  "extras": {}
};

var LISTENERS = {};

/**
* add event listener
*/
function addListener(event, success, failure) {
	if (!LISTENERS[event]) {
		LISTENERS[event] = [];
	}
	LISTENERS[event].push(success);
}

function fireEvent(name, event) {
	var listeners = LISTENERS[name] || [];
	for (var n=0,len=listeners.length;n<len; n++) {
		listeners[n](event, {
			keepCallback: true
		});
	}
}

function buildLocation(options) {
	options = options || {};
	var location = Object.assign({}, DEFAULT_LOCATION);
	Object.assign(location, options);

	location.timestamp = (new Date()).toISOString();
	location.is_moving = _state.isMoving;
	location.odometer = _state.odometer;
	location.uuid = uuid();
	return location;
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function loadState() {
	var state = window.localStorage.getItem(PLUGIN_NAME + ':state');
	if (state != null) {
		_state = JSON.parse(state);
	} else {
		_state = Object.assign({}, DEFAULT_STATE);
	}
}

function setState(params) {
	Object.assign(_state, params);
	saveState();
}

function saveState() {
	window.localStorage.setItem(PLUGIN_NAME + ':state', JSON.stringify(_state));
}

var BrowserInterface = {
    /**
    * If this is not the first-boot, configure using already persisted config.  Ignores defaultConfig.
    * If this IS the first boot, #ready acts like tradition #configure method, resetting the config
    * to default and applying supplied #defaultConfig.
    * @param {Object} defaultConfig
    */
    ready: function(success, failure, opts) {
        var config = opts[0];
    	loadState();
    	Object.assign(_state, config);
    	success(_state);

        if (_state.enabled) {
    		BrowserInterface.start(success, failure, opts);
    	} else {
    		saveState();
    	}
    },
    /**
    * @private {Error} error
    */
    configure: function() {
        BrowserInterface.ready.apply(this, arguments);
    },
    /**
    * @private Reset config options to default
    */
    reset: function(success, failure, opts) {
    	_state = Object.assign({}, DEFAULT_STATE);
    	saveState();
        success(_state);
    },
    requestPermission: function(success, failure, opts) {
        success(PROVIDER_STATE);
    },
    getProviderState: function(success, failure, opts) {
        success(PROVIDER_STATE);
    },

    addLocationListener: function(success, failure, opts) {
    	addListener(EVENTS.location, success, failure);
	},
	addMotionChangeListener: function(success, failure, opts) {
		addListener(EVENTS.motionchange, success, failure);
	},
	addHeartbeatListener: function(success, failure, opts) {
		addListener(EVENTS.heartbeat, success, failure);
	},
	addGeofenceListener: function(success, failure, opts) {
		addListener(EVENTS.geofence, success, failure);
	},
	addActivityChangeListener: function(success, failure, opts) {
		addListener(EVENTS.activitychange, success, failure);
	},
	addProviderChangeListener: function(success, failure, opts) {
		addListener(EVENTS.providerchange, success, failure);
	},
	addGeofencesChangeListener: function(success, failure, opts) {
		addListener(EVENTS.geofenceschange, success, failure);
	},
	addScheduleListener: function(success, failure, opts) {
		addListener(EVENTS.schedule, success, failure);
	},
	addHttpListener: function(success, failure, opts) {
		addListener(EVENTS.http, success, failure);
	},
	addPowerSaveChangeListener: function(success, failure, opts) {
		addListener(EVENTS.powersavechange, success, failure);
	},
	addConnectivityChangeListener: function(success, failure, opts) {
		addListener(EVENTS.connectivitychange, success, failure);
	},
	addEnabledChangeListener: function(success, failure, opts) {
		addListener(EVENTS.enabledchange, success, failure);
	},
	addNotificationActionListener: function(success, failure, opts) {
		addListener(EVENTS.notification, success, failure);
	},
    /**
    * remove event-listener
    */
    removeListener: function(success, failure, opts) {
        success();
    },
    /**
    * Remove all event-listeners
    */
    removeListeners: function(success, failure, opts) {
    	LISTENERS = {};
        success();
    },

    getState: function(success, failure, opts) {
        success(_state);
    },
    start: function(success, failure, opts) {
    	setState({
    		enabled: true,
    		trackingMode: 1
		});

    	success(_state);

    	fireEvent(EVENTS.activitychange, {
    		activity: 'still',
    		confidence: 100
    	});

        fireEvent(EVENTS.location, buildLocation({
    		sample: true
    	}));

        var location = buildLocation({event: EVENTS.motionchange});

        fireEvent(EVENTS.location, location);

        fireEvent(EVENTS.motionchange, {
        	isMoving: _state.isMoving,
        	location: location
        });

        fireEvent(EVENTS.enabledchange, true);
        fireEvent(EVENTS.connectivitychange, {
        	connected: true
        });
        fireEvent(EVENTS.providerchange, PROVIDER_STATE);
    },
    stop: function(success, failure, opts) {
    	setState({
    		enabled: false
		});

        success(_state);
        fireEvent(EVENTS.enabledchange, false);
    },
    startSchedule: function(success, failure, opts) {
        success(_state);
    },
    stopSchedule: function(success, failure, opts) {
        success(_state);
    },
    startGeofences: function(success, failure, opts) {
    	setState({
    		enabled: true,
    		trackingMode: 0
		});
        success(_state);
        fireEvent(EVENTS.enabledchange, true);
    },
    startBackgroundTask: function(success, failure, opts) {
        success(1);
    },
    stopBackgroundTask: function(success, failure, opts) {
        success();
    },
    // @deprecated
    finish: function(success, failure, opts) {
        success();
    },
    changePace: function(success, failure, opts) {
        var isMoving = opts[0];
    	setState({
    		isMoving: isMoving
		});
        success(opts);

        var location = buildLocation({event: EVENTS.motionchange});

        fireEvent(EVENTS.location, location);
        fireEvent(EVENTS.motionchange, {
        	isMoving: _state.isMoving,
        	location: location
        });
    },
    setConfig: function(success, failure, opts) {
        var config = opts[0];
    	setState(config);
        success(_state);
    },
    getLocations: function(success, failure, opts) {
        success([]);
    },
    getCount: function(success, failure, opts) {
        success(0);
    },
    // @deprecated
    clearDatabase: function(success, failure, opts) {
        success();
    },
    destroyLocations: function(success, failure, opts) {
        success();
    },
    insertLocation: function(success, failure, opts) {
        var params = opts[0];
        success(params);
    },
    /**
    * Signal native plugin to sync locations queue to HTTP
    */
    sync: function(success, failure, opts) {
        success(0);
    },
    /**
    * Fetch current odometer value
    */
    getOdometer: function(success, failure, opts) {
        success(0.0);
    },
    setOdometer: function(success, failure, opts) {
        var odometer = opts[0];
    	setState({
    		odometer: odometer
		});
        success(_state.odometer);
    },

    /**
    * add geofence
    */
    addGeofence: function(success, failure, opts) {
        var params = opts[0];
        success(params);
    },
    /**
    * add a list of geofences
    */
    addGeofences: function(success, failure, opts) {
        var params = opts[0];
        success(params);
    },
    /**
    * Remove all geofences
    */
    removeGeofences: function(success, failure, opts) {
        success();
    },
    /**
    * remove a geofence
    * @param {String} identifier
    */
    removeGeofence: function(success, failure, opts) {
        success();
    },

    /**
    * Fetch a list of all monitored geofences
    */
    getGeofences: function(success, failure, opts) {
        success([]);
    },
    /**
    * Fetch the current position
    */
    getCurrentPosition: function(success, failure, opts) {
    	fireEvent(EVENTS.location, buildLocation({
    		sample: true
    	}));

    	var location = buildLocation();
    	fireEvent(EVENTS.location, location);
        success(location);
    },

    watchPosition: function(success, failure, opts) {
        success(buildLocation());
    },
    stopWatchPosition: function(success, failure, opts) {
        success();
    },
    setLogLevel: function(success, failure, opts) {
        success();
    },
    getLog: function(success, failure, opts) {
        success("NO LOGS IN BROWSER");
    },
    destroyLog: function(success, failure, opts) {
        success(true);
    },
    emailLog: function(success, failure, opts) {
        success(true);
    },
    isPowerSaveMode: function(success, failure, opts) {
        success(false);
    },
    playSound: function(success, failure, opts) {
        success();
    },
    log: function(success, failure, opts) {
        success(true);
    },
    /**
    * Fetch list of available sensors: accelerometer, gyroscope, magnetometer
    */
    getSensors: function(success, failure, opts) {
        success(DEVICE_SENSORS);
    },
    getDeviceInfo: function() {
        return new Promise(function(resolve, reject) {
            resolve(DEVICE_INFO);
        });
    }
};

cordovaProxy.add(PLUGIN_NAME, BrowserInterface);


