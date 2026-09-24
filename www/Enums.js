/**
* The enum objects of @transistorsoft/background-geolocation-types, eg: BackgroundGeolocation.LogLevel.Verbose.
*
* The TypeScript definitions (src/index.d.ts) declare these as runtime values, but a Cordova js-module can only
* require the plugin's own js-modules, not an npm package, so the values are copied here.  test/enums.test.js
* fails when they drift from the installed types package.
*
* Loaded twice:  by Cordova, as a js-module of www/BackgroundGeolocation.js, and by a bundler, through
* src/index.js, which serves them before Cordova has loaded its plugins.
*/

module.exports = {
    // Declared on the BackgroundGeolocation interface.
    LogLevel: {Off: 0, Error: 1, Warning: 2, Info: 3, Debug: 4, Verbose: 5},
    DesiredAccuracy: {Navigation: -2, High: -1, Medium: 10, Low: 100, VeryLow: 1000, Lowest: 3000},
    PersistMode: {All: 2, Location: 1, Geofence: -1, None: 0},
    AuthorizationStrategy: {Jwt: 'jwt', Sas: 'sas'},
    LocationFilterPolicy: {PassThrough: 0, Adjust: 1, Conservative: 2},
    KalmanProfile: {Default: 0, Aggressive: 1, Conservative: 2},
    HttpMethod: {Post: 'POST', Put: 'PUT', Patch: 'PATCH'},
    TriggerActivity: {
        Walking: 'walking',
        OnFoot: 'on_foot',
        Running: 'running',
        OnBicycle: 'on_bicycle',
        InVehicle: 'in_vehicle'
    },
    NotificationPriority: {Default: 0, High: 1, Low: -1, Max: 2, Min: -2},
    Event: {
        Boot: 'boot',
        Terminate: 'terminate',
        Location: 'location',
        MotionChange: 'motionchange',
        ActivityChange: 'activitychange',
        LocationFilter: 'locationfilter',
        Geofence: 'geofence',
        GeofencesChange: 'geofenceschange',
        Http: 'http',
        Heartbeat: 'heartbeat',
        ProviderChange: 'providerchange',
        Schedule: 'schedule',
        Notification: 'notification',
        Authorization: 'authorization',
        ConnectivityChange: 'connectivitychange',
        EnabledChange: 'enabledchange',
        PowerSaveChange: 'powersavechange'
    },
    LocationRequest: {Always: 'Always', WhenInUse: 'WhenInUse', Any: 'Any'},
    AccuracyAuthorization: {Full: 0, Reduced: 1},
    AuthorizationStatus: {NotDetermined: 0, Restricted: 1, Denied: 2, Always: 3, WhenInUse: 4, DeniedAlways: 5},
    Permission: {Location: 'location', Motion: 'motion'},
    ActivityType: {Other: 1, AutomotiveNavigation: 2, Fitness: 3, OtherNavigation: 4, Airborne: 5},

    // Exported by the types package only (a named import).
    MotionActivityType: {
        Still: 'still',
        Walking: 'walking',
        OnFoot: 'on_foot',
        Running: 'running',
        OnBicycle: 'on_bicycle',
        InVehicle: 'in_vehicle',
        Unknown: 'unknown'
    },
    TrackingMode: {Geofences: 0, Location: 1},
    LogLevelName: {Debug: 'debug', Notice: 'notice', Info: 'info', Warn: 'warn', Error: 'error'},
    GeofenceAction: {Enter: 'ENTER', Exit: 'EXIT', Dwell: 'DWELL'},
    LocationError: {
        LocationUnknown: 0,
        PermissionDenied: 1,
        NetworkError: 2,
        BackgroundWhenInUse: 3,
        Timeout: 408,
        Cancelled: 499
    },
    LocationFilterReason: {
        LowAccuracy: 'low-accuracy',
        ImpliedSpeed: 'implied-speed',
        OutlierCapped: 'outlier-capped',
        GeofenceSpuriousExit: 'geofence-spurious-exit',
        GeofenceDuplicateEnter: 'geofence-duplicate-enter'
    },
    SQLQueryOrder: {Asc: 1, Desc: -1}
};
