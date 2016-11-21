# API Documentation

## Geolocation Options

The following **Options** can all be provided to the plugin's `#configure` method:

```Javascript
bgGeo.configure({
    desiredAccuracy: 0,
    distanceFilter: 50,
    .
    .
    .
}, success, fail);

// Use #setConfig if you need to change options after you've executed #configure

bgGeo.setConfig({
    desiredAccuracy: 10,
    distanceFilter: 10
}, function() {
    console.log('set config success');
}, function() {
    console.log('failed to setConfig');
});

```

| Option | Type | Opt/Required | Default | Note |
|---|---|---|---|---|
| [`desiredAccuracy`](#param-integer-desiredaccuracy-0-10-100-1000-in-meters) | `Integer` | Required | 0 | Specify the desired-accuracy of the geolocation system with 1 of 4 values, `0`, `10`, `100`, `1000` where `0` means **HIGHEST POWER, HIGHEST ACCURACY** and `1000` means **LOWEST POWER, LOWEST ACCURACY** |
| [`distanceFilter`](#param-integer-distancefilter) | `Integer` | Required | `10`| The minimum distance (measured in meters) a device must move horizontally before an update event is generated. @see Apple docs. However, #distanceFilter is elastically auto-calculated by the plugin: When speed increases, #distanceFilter increases; when speed decreases, so does distanceFilter (disabled with `disableElasticity: true`) |
| [`locationUpdateInterval`](#param-integer-millis-locationupdateinterval) | `Integer` | Required (**Android**)| `1000`| Set the desired interval for active location updates, in milliseconds.  The location client will actively try to obtain location updates for your application at this interval, so it has a direct influence on the amount of power used by your application. Choose your interval wisely.  This interval is inexact. You may not receive updates at all (if no location sources are available), or you may receive them slower than requested. You may also receive them faster than requested (if other applications are requesting location at a faster interval).  Applications with only the coarse location permission may have their interval silently throttled. |
| [`fastestLocationUpdateInterval`](#param-integer-millis-fastestlocationupdateinterval) | `Integer` | Optional (**Android**)| `10000` | Explicitly set the fastest interval for location updates, in milliseconds.  This controls the fastest rate at which your application will receive location updates, which might be faster than #locationUpdateInterval in some situations (for example, if other applications are triggering location updates).  This allows your application to passively acquire locations at a rate faster than it actively acquires locations, saving power.  Unlike #locationUpdateInterval, this parameter is exact. Your application will never receive updates faster than this value.  If you don't call this method, a fastest interval will be set to 30000 (30s).  An interval of 0 is allowed, but not recommended, since location updates may be extremely fast on future implementations.  If #fastestLocationUpdateInterval is set slower than #locationUpdateInterval, then your effective fastest interval is #locationUpdateInterval. |
| [`stopAfterElapsedMinutes`](#param-integer-stopafterelapsedminutes) | `Integer`  |  Optional | `0`  | The plugin can optionally auto-stop monitoring location when some number of minutes elapse after being the #start method was called. |
| [`stationaryRadius`](#param-integer-stationaryradius-meters) | `Integer`  |  Required | `25`  |When stopped, the minimum distance the device must move beyond the stationary location for aggressive background-tracking to engage.  Note, since the plugin uses iOS significant-changes API, the plugin cannot detect the exact moment the device moves out of the stationary-radius. In normal conditions, it can take as much as 3 city-blocks to 1/2 km before staionary-region exit is detected.  **WARNING:** It's a really **BAD** idea to set this any lower than `20` because you'll mess up the "stop-detection" system.  The stop-detection system uses `stationaryRadius` to determine when the device is stopped:  anything lower than `20` will cause false positives and prevent "stop-detection" from occuring.  You will **not** get any better results with iOS stationary-exit with a `stationaryRadius: 0` vs `stationaryRadius: 200`.  **DO NOT SET** `stationaryRadius < 20`, **NO, NO, NO**. |
| [`useSignificantChangesOnly`](#param-boolean-usesignificantchangesonly-false) | `Boolean` | Optional (**iOS**)| `false` | Defaults to `false`.  Set `true` in order to disable constant background-tracking and use only the iOS [Significant Changes API](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/index.html#//apple_ref/occ/instm/CLLocationManager/startMonitoringSignificantLocationChanges).  If Apple has denied your application due to background-tracking, this can be a solution.  **NOTE** The Significant Changes API will report a location only when a significant change from the last location has occurred.  Many of the configuration parameters **will be ignored**, such as `#distanceFilter`, `#stationaryRadius`, `#activityType`, etc. |
| [`deferTime`](#param-integer-defertime) | `Integer` | Optional (**Android**)| `0` | Sets the maximum wait time in milliseconds for location updates.  If you pass a value at least 2x larger than the interval specified with `locationUpdateInterval`, then location delivery may be delayed and multiple locations can be delivered at once. Locations are determined at the `locationUpdateInterval` rate, but can be delivered in batch after the interval you set in this method. This can consume less battery and give more accurate locations, depending on the device's hardware capabilities. You should set this value to be as large as possible for your needs if you don't need immediate location delivery. |
| [`pausesLocationUpdatesAutomatically`](#param-boolean-pauseslocationupdatesautomatically-true) | `Boolean` | Optional (**iOS**)| `true` | The default behaviour of the plugin is to turn off location-services automatically when the device is detected to be stationary.  When set to `false`, location-services will **never** be turned off (and `disableStopDetection` will automatically be set to `true`) -- it's your responsibility to turn them off when you no longer need to track the device.  This feature should **not** generally be used.  `preventSuspend` will no longer work either.| 
| [`locationAuthorizationRequest`](#param-boolean-locationauthorizationrequest-always) | `Always`,`WhenInUse` | Optional (**iOS**)| `Always` | The desired iOS location-authorization request, either `Always` or `WhenInUse`.  You'll have to edit the corresponding key in your app's `Info.plist`, `NSLocationAlwaysUsageDescription` or `NSWhenInUseUsageDescription`.  `WhenInUse` will display a **blue bar** at top-of-screen informing user that location-services are on. |
| [`locationAuthorizationAlert`](#param-object-locationauthorizationalert) | `{}` | Optional (**iOS**)| `{}` | When you configure the plugin location-authorization `Always` or `WhenInUse` and the user changes the value in the app's location-services settings or disabled location-services, the plugin will display an Alert directing the user to the **Settings** screen.  This config allows you to configure all the Strings for that Alert popup. |

## Activity Recognition Options

| Option | Type | Opt/Required | Default | Note |
|---|---|---|---|---|
| [`activityRecognitionInterval`](#param-integer-millis-10000-activityrecognitioninterval) | `Integer` | Required | `10000` | The desired time between activity detections. Larger values will result in fewer activity detections while improving battery life. A value of 0 will result in activity detections at the fastest possible rate. |
| [`stopTimeout`](#param-integer-minutes-stoptimeout) | `Integer` | Required | `5 minutes` | The number of miutes to wait before turning off the GPS after the ActivityRecognition System (ARS) detects the device is `STILL` (**Android:** defaults to 0, no timeout, **iOS:** defaults to 5min).  If you don't set a value, the plugin is eager to turn off the GPS ASAP.  An example use-case for this configuration is to delay GPS OFF while in a car waiting at a traffic light.  **WARNING** Setting a value > 15 min is **not** recommended, particularly for Android.|
| [`minimumActivityRecognitionConfidence`](#param-integer-millis-minimumactivityrecognitionconfidence) | `Integer` | Optional (**Android**)| `80` | Each activity-recognition-result returned by the API is tagged with a "confidence" level expressed as a %.  You can set your desired confidence to trigger a state-change.  Defaults to `80`.|
| [`stopDetectionDelay`](#param-integer-minutes-stopdetectiondelay-0) | `Integer` | Optional (**iOS**)| 0 | Allows the stop-detection system to be delayed from activating.  When the stop-detection system is engaged, the GPS is off and only the accelerometer is monitored.  Stop-detection will only engage if this timer expires.  The timer is cancelled if any movement is detected before expiration | 
| [`activityType`](#param-string-activitytype-automotivenavigation-othernavigation-fitness-other) | `String` | Required (**iOS**)| `Other` | Presumably, this affects ios GPS algorithm.  See [Apple docs](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html#//apple_ref/occ/instp/CLLocationManager/activityType) for more information | Set the desired interval for active location updates, in milliseconds. |
| [`disableMotionActivityUpdates`](#param-boolean-disablemotionactivityupdates-false) | `Boolean` | Optional (**iOS**)| 0 | Disable iOS motion-activity updates (eg: "walking", "in_vehicle").  This feature requires a device having the **M7** co-processor (ie: iPhone 5s and up).  **NOTE** This feature will ask the user for "Health updates".  If you do not wish to ask the user for the "Health updates", set this option to `false`; However, you will no longer recieve activity data in the recorded locations. | 
| [`disableStopDetection`](#param-boolean-disablestopdetection-false) | `Boolean` | Optional | `false` | Disable iOS accelerometer-based **Stop-detection System**.  When disabled, the plugin will use the default iOS behaviour of automatically turning off location-services when the device has stopped for exactly 15 minutes.  When disabled, you will no longer have control over `stopTimeout`| 

## Geofencing Options
| Option | Type | Opt/Required | Default | Note |
|---|---|---|---|---|
| [`geofenceProximityRadius`](#param-integer-meters-geofenceproximityradius-1000) | `Integer`  |  Optional | `1000`  | When using Geofences, the plugin activates only thoses in proximity (the maximim geofences allowed to be simultaneously monitored is limited by the platform, where **iOS** allows only 20 and **Android**.  However, the plugin allows you to create as many geofences as you wish (thousands even).  It stores these in its database and uses spatial queries to determine which **20** or **100** geofences to activate. |
| [`geofenceInitialTriggerEntry`](#param-boolean-geofenceinitialtriggerentry-true) | `Boolean` | Optional | `true` | Defaults to `true`.  Set `false` to disable triggering a geofence immediately if device is already inside it.|

## HTTP / Persistence Options

| Option | Type | Opt/Required | Default | Note |
|---|---|---|---|---|
| [`url`](#param-string-url-undefined) | `String` | Optional | `null` | Your server url where you wish to HTTP POST recorded-locations to |
| [`params`](#param-object-params) | `Object` | Optional | `null` | Optional HTTP params sent along in HTTP request to above `#url` |
| [`extras`](#param-object-extras) | `Object` | Optional | | Optional `null` to attach to each recorded location |
| [`headers`](#param-object-headers) | `Object` | Optional | `null` | Optional HTTP headers sent along in HTTP request to above `#url` |
| [`method`](#param-string-method-post) | `String` | Optional | `POST` | The HTTP method.  Defaults to `POST`.  Some servers require `PUT`.|
| [`autoSync`](#param-string-autosync-true) | `Boolean` | Optional | `true` | If you've enabeld HTTP feature by configuring an `#url`, the plugin will attempt to HTTP POST each location to your server **as it is recorded**.  If you set `autoSync: false`, it's up to you to **manually** execute the `#sync` method to initate the HTTP POST (**NOTE** The plugin will continue to persist **every** recorded location in the SQLite database until you execute `#sync`). |
| [`autoSyncThreshold`](#param-integer-autosyncthreshold-0) | `Integer` | Optional | `0` | The minimum number of persisted records to trigger an `autoSync` action. |
| [`batchSync`](#param-string-batchsync-false) | `Boolean` | Optional | `false` | Default is `false`.  If you've enabled HTTP feature by configuring an `#url`, `batchSync: true` will POST all the locations currently stored in native SQLite datbase to your server in a single HTTP POST request.  With `batchSync: false`, an HTTP POST request will be initiated for **each** location in database. |
| [`maxBatchSize`](#param-integer-maxbatchsize-undefined) | `Integer` | Optional | `-1` | If you've enabled HTTP feature by configuring an `#url` and `batchSync: true`, this parameter will limit the number of records attached to each batch.  If the current number of records exceeds the `maxBatchSize`, multiple HTTP requests will be generated until the location queue is empty. |
| [`maxDaysToPersist`](#param-integer-maxdaystopersist-1) | `Integer` | Optional | `1` |  Maximum number of days to store a geolocation in plugin's SQLite database when your server fails to respond with `HTTP 200 OK`.  The plugin will continue attempting to sync with your server until `maxDaysToPersist` when it will give up and remove the location from the database. |
| [`maxRecordsToPersist`](#param-integer-maxrecordstopersist--1) | `Integer` | Optional | `-1` |  Maximum number of records to persist in plugin's SQLite database.  Defaults to `-1` (no limit)|

## Application Options

| Option | Type | Opt/Required | Default | Note |
|---|---|---|---|---|
| [`debug`](#param-boolean-debug-false) | `Boolean` | Optional | `false` | When enabled, the plugin will emit sounds for life-cycle events of background-geolocation!  **NOTE iOS**:  In addition, you must manually enable the *Audio and Airplay* background mode in *Background Capabilities* to hear these debugging sounds. |
| [`logLevel`](#param-integer-loglevel-5) | `Integer` | Optional | `LOG_LEVEL_VERBOSE` | Filters the logs by `logLevel`: `LOG_LEVEL_OFF`, `LOG_LEVEL_ERROR`, `LOG_LEVEL_WARNING`, `LOG_LEVEL_INFO`, `LOG_LEVEL_DEBUG`, `LOG_LEVEL_VERBOSE` |
| [`logMaxDays`](#param-integer-logmaxdays-3) | `Integer` | Optional | `3` | Maximum days to persist a log-entry in database. |
| [`stopOnTerminate`](#param-boolean-stoponterminate-true) | `Boolean` | Optional | `true` | Enable this in order to force a stop() when the application is terminated |
| [`startOnBoot`](#param-boolean-startonboot-false) | `Boolean` | Optional | `false` | Set to `true` to enable background-tracking after the device reboots. |
| [`preventSuspend`](#param-boolean-preventsuspend-false) | `Boolean` | Optional **iOS** | `false` | Enable this to prevent **iOS** from suspending.  Must be used in conjunction with a `heartbeatInterval`.  **WARNING**: `preventSuspend` should only be used in **very** specific use-cases and should typically **not** be used as it will have a **very serious impact on battery performance.** |
| [`heartbeatInterval`](#param-integer-heartbeatinterval-undefined) | `Integer(seconds)` | Optional | `undefined` | Causes a `heartbeat` event to fire each `heartbeatInterval` seconds.  For **iOS**, this must be used in conjunction with `preventSuspend: true`.  **NOTE** The `heartbeat` event will only fire when the device is in the **STATIONARY** state -- it will not fire when the device is moving.|
| [`foregroundService`](#param-boolean-foregroundservice-false) | `Boolean` | Optional **Android** | `false` | Make the Android service [run in the foreground](http://developer.android.com/intl/ru/reference/android/app/Service.html#startForeground(int, android.app.Notification)), supplying the ongoing notification to be shown to the user while in this state.  Running as a foreground-service makes the tracking-service **much** more inmmune to OS killing it due to memory/battery pressure.  By default services are background, meaning that if the system needs to kill them to reclaim more memory (such as to display a large page in a web browser).  @see `notificationTitle`, `notificationText` & `notificationColor`|
| [`notificationTitle`](#param-string-notificationtitle-app-name) | `String` | Optional **Android** | App name | When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.  Defaults to the application name|
| [`notificationText`](#param-string-notificationtext-location-service-activated) | `String` | Optional **Android** | Location service activated | When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.|
| [`notificationColor`](#param-string-notificationcolor-null) | `String` | Optional **Android** | null | When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.  Supported formats are: `#RRGGBB` `#AARRGGBB` or one of the following names: 'red', 'blue', 'green', 'black', 'white', 'gray', 'cyan', 'magenta', 'yellow', 'lightgray', 'darkgray', 'grey', 'lightgrey', 'darkgrey', 'aqua', 'fuchsia', 'lime', 'maroon', 'navy', 'olive', 'purple', 'silver', 'teal'.|
| [`notificationIcon`](#param-string-notificationicon-app-icon) | `String` | Optional **Android** | `app icon` | When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.  This allows you customize that icon.  Defaults to your application icon.|
| [`schedule`](#param-array-schedule-undefined) | `Array` | Optional | `undefined` | Defines a schedule to automatically start/stop tracking at configured times |
## Events

Event-listeners can be attached using the following methods, or alternatively using the `#on` method, supplying the **Event Name** in the following table. `#on` accepts both a `successFn` and `failureFn`.

The `#on` method does not accept an `{}` -- you **must** specify each listener with a distinct call to `#on`:

```Javascript
bgGeo.onLocation(onLocation, onLocationError);
// or use the #on method:
bgGeo.on("location", onLocation, onLocationError);

```

| Method | Event Name | Notes
|---|---|---|
| [`onLocation`](#onlocationsuccessfn-failurefn) | `location` | Fired whenever a new location is recorded or an error occurs |
| [`onMotionChange`](#onmotionchangecallbackfn-failurefn) | `motionchange` | Fired when the device changes stationary / moving state. |
| [`onActivityChange`](#onactivitychangecallbackfn-failurefn) | `activitychange` | Fired when the activity-recognition system detects a *change* in detected-activity (`still, on_foot, in_vehicle, on_bicycle, running`)|
| [`onProviderChange`](#onproviderchangecallbackfn-failurefn) | `providerchange` | Fired when the state of device's **Location Services** changes|
| [`onGeofence`](#ongeofencecallbackfn) | `geofence` | Fired when a geofence crossing event occurs |
| [`onGeofencesChange`](#geofenceschange-callbackfn) | `geofenceschange` | Fired when the lists of monitored geofences changed.| 
| [`onHttp`](#onhttpsuccessfn-failurefn) | `http` | Fired after a successful HTTP response. `response` object is provided with `status` and `responseText`|
| [`onHeartbeat`](#onheartbeatsuccessfn-failurefn) | `heartbeat` | Fired each `heartbeatInterval` while the plugin is in the **stationary** state with (iOS requires `preventSuspend: true` in addition).  Your callback will be provided with a `params {}` containing the parameters `shakes {Integer}`, `motionType {String}` and current location object `location {Object}` |
| [`onSchedule`](#onschedulesuccessfn-failurefn) | `schedule` | Fired when a schedule event occurs.  Your `callbackFn` will be provided with the current `state` Object. | 

## Methods

| Method Name | Arguments | Notes
|---|---|---|
| [`configure`](#configureconfig-success-failure) | `{config}`, `successFn`, `failureFn` | Configures the plugin's parameters (@see following Config section for accepted config params. The `success` callback will be executed after the plugin has successfully configured and provided with the current `state` object. |
| [`removeListeners`](#removelisteners-successfn-failurefn) | `none` | Remove all events-listeners registered with `#on` method |
| [`setConfig`](#setconfigconfig-successfn-failurefn) | `{config}`, `successFn`, `failureFn` | Re-configure the plugin with new values |
| [`start`](#startsuccessfn-failurefn) | `callbackFn`| Enable location tracking.  Supplied `callbackFn` will be executed when tracking is successfully engaged.  This is the plugin's power **ON** button.  The plugin will initially start into its **stationary** state, fetching an initial location before turning off location services.  Android will be monitoring its **Activity Recognition System** while iOS will create a stationary geofence around the current location. |
| [`stop`](#stopsuccessfn-failurefn) | `callbackFn` | Disable location tracking.  Supplied `callbackFn` will be executed when tracking is successfully halted.  This is the plugin's power **OFF** button. |
| [`startSchedule`](#startchedulecallbackfn) | `callbackFn` | If a `schedule` was configured, this method will initiate that schedule.  The plugin will automatically be started or stopped according to the configured `schedule`.    Supplied `callbackFn` will be executed once the Scheduler has parsed and initiated your `schedule` |
| [`stopSchedule`](#stopschedulecallbackfn) | `callbackFn` | This method will stop the Scheduler service.  Your `callbackFn` will be executed after the Scheduler has stopped |
| [`startGeofences`](#startgeofencescallbackfn) | `callbackFn` | Engages the geofences-only `trackingMode`.  In this mode, no active location-tracking will occur -- only geofences will be monitored|
| [`getState`](#getstatesuccessfn) | `callbackFn` | Fetch the current-state of the plugin, including `enabled`, `isMoving`, as well as all other config params |
| [`getCurrentPosition`](#getcurrentpositionsuccessfn-failurefn-options) | `successFn`, `failureFn`, `{options}` | Retrieves the current position. This method instructs the native code to fetch exactly one location using maximum power & accuracy. |
| [`watchPosition`](#watchpositionsuccessfn-failurefn-options) | `successFn`, `failureFn`, `{options}` | Start a stream of continuous location-updates.  The native code will persist the fetched location to its SQLite database just as any other location in addition to POSTing to your configured `#url` (if you've enabled the HTTP features).|
| [`stopWatchPosition`](#stopwatchpositionsuccessfn-failurefn-options) | `successFn`, `failureFn`, `{options}` | Halt `watchPosition` updates. |
| [`changePace`](#changepaceenabled-successfn-failurefn) | `isMoving` | Initiate or cancel immediate background tracking. When set to true, the plugin will begin aggressively tracking the devices Geolocation, bypassing stationary monitoring. If you were making a "Jogging" application, this would be your [Start Workout] button to immediately begin GPS tracking. Send false to disable aggressive GPS monitoring and return to stationary-monitoring mode. |
| [`getLocations`](#getlocationscallbackfn-failurefn) | `callbackFn` | Fetch all the locations currently stored in native plugin's SQLite database. Your callbackFn`` will receive an `Array` of locations in the 1st parameter |
| [`getCount`](#getcountcallbackfn-failurefn) | `callbackFn` | Fetches count of SQLite locations table `SELECT count(*) from locations` |
| [`clearDatabase`](#destroylocationscallbackfn-failurefn) | `callbackFn` | **DEPRECATED** use `#destroyLocations` |
| [`destroyLocations`](#destroylocationscallbackfn-failurefn) | `callbackFn` | Delete all records in plugin's SQLite database |
| [`sync`](#synccallbackfn-failurefn) | - | If the plugin is configured for HTTP with an `#url` and `#autoSync: false`, this method will initiate POSTing the locations currently stored in the native SQLite database to your configured `#url`|
| [`getOdometer`](#getodometercallbackfn-failurefn) | `callbackFn` | The plugin constantly tracks distance travelled. The supplied callback will be executed and provided with a `distance` as the 1st parameter.|
| [`resetOdometer`](#resetodometercallbackfn-failurefn) | `callbackFn` | Reset the **odometer** to `0`.  The plugin never automatically resets the odometer -- this is **up to you** |
| [`playSound`](#playsoundsoundid) | `soundId` | Here's a fun one.  The plugin can play a number of OS system sounds for each platform.  For [IOS](http://iphonedevwiki.net/index.php/AudioServices) and [Android](http://developer.android.com/reference/android/media/ToneGenerator.html).  I offer this API as-is, it's up to you to figure out how this works. |
| [`addGeofence`](#addgeofenceconfig-callbackfn-failurefn) | `{config}` | Adds a geofence to be monitored by the native plugin. Monitoring of a geofence is halted after a crossing occurs.|
| [`addGeofences`](#addgeofencesgeofences-callbackfn-failurefn) | `{geofences}` | Adds a list geofences to be monitored by the native plugin. Monitoring of a geofence is halted after a crossing occurs.|
| [`removeGeofence`](#removegeofenceidentifier-callbackfn-failurefn) | `identifier` | Removes a geofence identified by the provided `identifier` |
| [`removeGeofences`](#removegeofences-callbackfn-failurefn) |  | Removes all geofences |
| [`getGeofences`](#getgeofencescallbackfn-failurefn) | `callbackFn` | Fetch the list of monitored geofences. Your callbackFn will be provided with an Array of geofences. If there are no geofences being monitored, you'll receive an empty `Array []`.|
| [`setLogLevel`](#setloglevelcallbackfn) | `calbackFn` | Set the Log filter:  `LOG_LEVEL_OFF`, `LOG_LEVEL_ERROR`, `LOG_LEVEL_WARNING`, `LOG_LEVEL_INFO`, `LOG_LEVEL_DEBUG`, `LOG_LEVEL_VERBOSE`|
| [`getLog`](#getlogcallbackfn) | `calbackFn` | Fetch the entire contents of the current log database as a `String`.|
| [`destroyLog`](#destroylogcallbackfnfailurefn) | `calbackFn`,`failureFn` | Destroy the contents of the Log database. |
| [`emailLog`](#emaillogemail-callbackfn) | `email`, `callbackFn` | Fetch the entire contents of the current circular log and email it to a recipient using the device's native email client.|

# Geolocation Options

## Common Options

####`@param {Integer} desiredAccuracy [0, 10, 100, 1000] in meters`

Specify the desired-accuracy of the geolocation system with 1 of 4 values, ```0, 10, 100, 1000``` where ```0``` means HIGHEST POWER, HIGHEST ACCURACY and ```1000``` means LOWEST POWER, LOWEST ACCURACY

- [Android](https://developer.android.com/reference/com/google/android/gms/location/LocationRequest.html#PRIORITY_BALANCED_POWER_ACCURACY)
- [iOS](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/index.html#//apple_ref/occ/instp/CLLocationManager/desiredAccuracy) 

####`@param {Integer} distanceFilter`

The minimum distance (measured in meters) a device must move horizontally before an update event is generated.  @see [Apple docs](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html#//apple_ref/occ/instp/CLLocationManager/distanceFilter).  However, #distanceFilter is elastically auto-calculated by the plugin:  When speed increases, #distanceFilter increases;  when speed decreases, so does distanceFilter.

distanceFilter is calculated as the square of speed-rounded-to-nearest-5 and adding configured #distanceFilter.

  `(round(speed, 5))^2 + distanceFilter`

For example, at biking speed of 7.7 m/s with a configured distanceFilter of 30m:

  `=> round(7.7, 5)^2 + 30`
  `=> (10)^2 + 30`
  `=> 100 + 30`
  `=> 130`

A gps location will be recorded each time the device moves 130m.

At highway speed of 30 m/s with distanceFilter: 30,

  `=> round(30, 5)^2 + 30`
  `=> (30)^2 + 30`
  `=> 900 + 30`
  `=> 930`

A gps location will be recorded every 930m

Note the following real example of background-geolocation on highway 101 towards San Francisco as the driver slows down as he runs into slower traffic (geolocations become compressed as distanceFilter decreases)

![distanceFilter at highway speed](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/distance-filter-highway.png)

Compare now background-geolocation in the scope of a city.  In this image, the left-hand track is from a cab-ride, while the right-hand track is walking speed.

![distanceFilter at city scale](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/distance-filter-city.png)

####`@param {Boolean} disableElasticity [false]`

Defaults to ```false```.  Set ```true``` to disable automatic speed-based ```#distanceFilter``` elasticity.  eg:  When device is moving at highway speeds, locations are returned at ~ 1 / km.

####`@param {Integer} stopAfterElapsedMinutes`

The plugin can optionally auto-stop monitoring location when some number of minutes elapse after being the #start method was called.

## iOS Options

####`@param {Integer} stationaryRadius (meters)`

When stopped, the minimum distance the device must move beyond the stationary location for aggressive background-tracking to engage.  Note, since the plugin uses iOS significant-changes API, the plugin cannot detect the exact moment the device moves out of the stationary-radius. In normal conditions, it can take as much as 3 city-blocks to 1/2 km before staionary-region exit is detected.

**WARNING:** It's a really **BAD** idea to set this any lower than `20` because you'll mess up the "stop-detection" system.  The stop-detection system uses `stationaryRadius` to determine when the device is stopped:  anything lower than `20` will cause false positives and prevent "stop-detection" from occuring.  You will **not** get any better results with iOS stationary-exit with a `stationaryRadius: 0` vs `stationaryRadius: 200`.  **DO NOT SET** `stationaryRadius < 20`, **NO, NO, NO**.

####`@param {Boolean} useSignificantChangesOnly [false]`

Defaults to `false`.  Set `true` in order to disable constant background-tracking and use only the iOS [Significant Changes API](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/index.html#//apple_ref/occ/instm/CLLocationManager/startMonitoringSignificantLocationChanges).  If Apple has denied your application due to background-tracking, this can be a solution.  **NOTE** The Significant Changes API will report a location only when a significant change from the last location has occurred.  Many of the configuration parameters **will be ignored**, such as `#distanceFilter`, `#stationaryRadius`, `#activityType`, etc.

####`@param {Boolean} disableMotionActivityUpdates [false]`

Set `true` to isable iOS `CMMotionActivity` updates (eg: "walking", "in_vehicle").  This feature requires a device having the **M7** co-processor (ie: iPhone 5s and up).  **NOTE** This feature will ask the user for "Health updates".  If you do not wish to ask the user for the "Health updates", set this option to `false`; However, you will no longer recieve activity data in the recorded locations.

####`@param {Boolean} pausesLocationUpdatesAutomatically [true]`

The default behaviour of the plugin is to turn **off** location-services *automatically* when the device is detected to be stationary.  When set to `false`, location-services will **never** be turned off (and `disableStopDetection` will automatically be set to `true`) -- it's your responsibility to turn them off when you no longer need to track the device.  This feature should **not** generally be used.  `preventSuspend` will no longer work either.

####`@param {String} locationAuthorizationRequest [Always]`

The desired iOS location-authorization request, either `Always` or `WhenInUse`.  Defaults to `Always`.  You'll have to edit the corresponding key in your app's `Info.plist`, `NSLocationAlwaysUsageDescription` or `NSWhenInUseUsageDescription`.  `WhenInUse` will display a **blue bar** at top-of-screen informing user that location-services are on.

####`@param {Object} locationAuthorizationAlert`
When you configure the plugin location-authorization `Always` or `WhenInUse` and the user changes the value in the app's location-services settings or disabled location-services, the plugin will display an Alert directing the user to the **Settings** screen.  This config allows you to configure all the Strings for that Alert popup and accepts an `{Object}` containing the following keys:

######@param {String} titleWhenOff [Location services are off] 
The title of the alert if user changes, for example, the location-request to `WhenInUse` when you requested `Always`.
######@param {String} titleWhenNotEnabled [Background location is not enabled] 
The title of the alert when user disables location-services or changes the authorization request to `Never`
######@param {String} instructions [To use background location, you must enable '{locationAuthorizationRequest}' in the Location Services settings]
The body text of the alert.
######@param {String} cancelButton [Cancel]
######@param {String} settingsButton [Settings]

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/docs-locationAuthorizationAlert.jpg)

```Javascript
bgGeo.configure({
  locationAuthorizationAlert: {
    titleWhenNotEnabled: "Yo, location-services not enabled",
    titleWhenOff: "Yo, location-services OFF",
    instructions: "You must enable 'Always' in location-services, buddy",
    cancelButton: "Cancel",
    settingsButton: "Settings"
  }
})
```

## Android Options

####`@param {Integer millis} locationUpdateInterval`

Set the desired interval for active location updates, in milliseconds.

The location client will actively try to obtain location updates for your application at this interval, so it has a direct influence on the amount of power used by your application. Choose your interval wisely.

This interval is inexact. You may not receive updates at all (if no location sources are available), or you may receive them slower than requested. You may also receive them faster than requested (if other applications are requesting location at a faster interval). 

Applications with only the coarse location permission may have their interval silently throttled.

####`@param {Integer millis} fastestLocationUpdateInterval`

Explicitly set the fastest interval for location updates, in milliseconds.

This controls the fastest rate at which your application will receive location updates, which might be faster than ```#locationUpdateInterval``` in some situations (for example, if other applications are triggering location updates).

This allows your application to passively acquire locations at a rate faster than it actively acquires locations, saving power.

Unlike ```#locationUpdateInterval```, this parameter is exact. Your application will never receive updates faster than this value.

If you don't call this method, a fastest interval will be set to **30000 (30s)**. 

An interval of 0 is allowed, but not recommended, since location updates may be extremely fast on future implementations.

If ```#fastestLocationUpdateInterval``` is set slower than ```#locationUpdateInterval```, then your effective fastest interval is ```#locationUpdateInterval```.

========
An interval of 0 is allowed, but not recommended, since location updates may be extremely fast on future implementations.

####`@param {Integer} deferTime`

Defaults to `0` (no defer).  Sets the maximum wait time in milliseconds for location updates.  If you pass a value at least 2x larger than the interval specified with `locationUpdateInterval`, then location delivery may be delayed and multiple locations can be delivered at once. Locations are determined at the `locationUpdateInterval` rate, but can be delivered in batch after the interval you set in this method. This can consume less battery and give more accurate locations, depending on the device's hardware capabilities. You should set this value to be as large as possible for your needs if you don't need immediate location delivery.

####`@param {String} triggerActivities`

These are the comma-delimited list of [activity-names](https://developers.google.com/android/reference/com/google/android/gms/location/DetectedActivity) returned by the `ActivityRecognition` API which will trigger a state-change from **stationary** to **moving**.  By default, this list is set to all five **moving-states**:  `"in_vehicle, on_bicycle, on_foot, running, walking"`.  If you wish, you could configure the plugin to only engage **moving-mode** for vehicles by providing only `"in_vehicle"`.

# Activity Recognition Options

## Common Options

####`@param {Integer millis} [10000] activityRecognitionInterval`

Defaults to `10000` (10 seconds).  The desired time between activity detections. Larger values will result in fewer activity detections while improving battery life. A value of 0 will result in activity detections at the fastest possible rate.

####`@param {Integer millis} minimumActivityRecognitionConfidence` 

Each activity-recognition-result returned by the API is tagged with a "confidence" level expressed as a %.  You can set your desired confidence to trigger a state-change.  Defaults to `80`.

####`@param {Integer minutes} stopTimeout`

The number of miutes to wait before turning off the GPS after the ActivityRecognition System (ARS) detects the device is `STILL` (**Android:** defaults to 0, no timeout, **iOS:** defaults to 5min).  If you don't set a value, the plugin is eager to turn off the GPS ASAP.  An example use-case for this configuration is to delay GPS OFF while in a car waiting at a traffic light.  **WARNING** Setting a value > 15 min is **not** recommended, particularly for Android.

####`@param {Boolean} disableStopDetection [false]`

For iOS, disables the accelerometer-based **Stop-detection System**.  When disabled, the plugin will use the default iOS behaviour of automatically turning off location-services when the device has stopped for exactly 15 minutes.  When disabled, you will no longer have control over `stopTimeout`.  

For Android, location-services **will never turn OFF** if you set this to `true`!  It will be purely up to you or the user to execute `#changePace(false)` or `#stop` to turn off location-services.

**iOS Stop-detection timing**.  
![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/ios-stop-detection-timing.png)

## iOS Options

####`@param {String} activityType [AutomotiveNavigation, OtherNavigation, Fitness, Other]`

Presumably, this affects ios GPS algorithm.  See [Apple docs](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html#//apple_ref/occ/instp/CLLocationManager/activityType) for more information

####`@param {Integer minutes} stopDetectionDelay [0]` 

Allows the stop-detection system to be delayed from activating.  When the stop-detection system is engaged, the GPS is off and only the accelerometer is monitored.  Stop-detection will only engage if this timer expires.  The timer is cancelled if any movement is detected before expiration.  If a value of `0` is specified, the stop-detection system will engage as soon as the device is detected to be stationary.

####`@param {Boolan} disableMotionActivityUpdates [false]`

Prevent iOS Motion Activity updates.  If you're seeing your app request permission to see "Fitness Data", this is why.  The **iOS** plugin will no longer record `activity` data in the recorded locations.

# Geofencing Options

####`@param {Integer meters} geofenceProximityRadius [1000]`

Defaults to `1000` meters.  **@see** releated event [`geofenceschange`](#geofenceschange).  When using Geofences, the plugin activates only thoses in proximity (the maximim geofences allowed to be simultaneously monitored is limited by the platform, where **iOS** allows only 20 and **Android**.  However, the plugin allows you to create as many geofences as you wish (thousands even).  It stores these in its database and uses spatial queries to determine which **20** or **100** geofences to activate.

[View animation of this behaviour](https://dl.dropboxusercontent.com/u/2319755/background-geolocation/images/background-geolocation-infinite-geofencing.gif)

![](https://dl.dropboxusercontent.com/u/2319755/background-geolocation/images/geofenceProximityRadius_iphone6_spacegrey_portrait.png)

####`@param {Boolean} geofenceInitialTriggerEntry [true]`

Defaults to `true`.  Set `false` to disable triggering a geofence immediately if device is already inside it.

# HTTP / Persistence Options

####`@param {String} url [undefined]`

Your server url where you wish to HTTP POST location data to.

####`@param {String} method [POST]`

The HTTP method to use when creating an HTTP request to your configured `#url`.  Defaults to `POST`.  Valid values are `POST`, `PUT` and `OPTIONS`.

####`@param {String} batchSync [false]`

Default is ```false```.  If you've enabled HTTP feature by configuring an ```#url```, ```batchSync: true``` will POST all the locations currently stored in native SQLite datbase to your server in a single HTTP POST request.  With ```batchSync: false```, an HTTP POST request will be initiated for **each** location in database.

####`@param {Integer} maxBatchSize [undefined]`

If you've enabled HTTP feature by configuring an `#url` with `batchSync: true`, this parameter will limit the number of records attached to **each** batch request.  If the current number of records exceeds the `maxBatchSize`, multiple HTTP requests will be generated until the location queue is empty.

####`@param {String} autoSync [true]`

Default is `true`.  If you've enabeld HTTP feature by configuring an `#url`, the plugin will attempt to HTTP POST each location to your server **as it is recorded**.  If you set `autoSync: false`, it's up to you to **manually** execute the `#sync` method to initate the HTTP POST (**NOTE** The plugin will continue to persist **every** recorded location in the SQLite database until you execute `#sync`).

####`@param {Integer} autoSyncThreshold [0]`

The minimum number of persisted records to trigger an `autoSync` action.  If you configure a value greater-than **`0`**, the plugin will wait until that many locations are recorded before executing HTTP requests to your server through your configured `#url`.

####`@param {Object} params`

Optional HTTP params sent along in HTTP request to above `#url`.

####`@param {Object} headers`

Optional HTTP params sent along in HTTP request to above `#url`.

####`@param {Object} extras`

Optional arbitrary key/value `{}` to attach to each recorded location

Eg: Every recorded location will have the following `extras` appended:
```Javascript
bgGeo.configure({
    .
    .
    .
    extras: {route_id: 1234}
}, success, fail);
```

####`@param {Integer} maxDaysToPersist [1]`

Maximum number of days to store a geolocation in plugin's SQLite database when your server fails to respond with ```HTTP 200 OK```.  The plugin will continue attempting to sync with your server until ```maxDaysToPersist``` when it will give up and remove the location from the database.

####`@param {Integer} maxRecordsToPersist [-1]`

Maximum number of records to persist in plugin's SQLite database.  Default `-1` means **no limit**.

# Application Options

## Common Options

####`@param {Boolean} debug [false]`

When enabled, the plugin will emit sounds for life-cycle events of background-geolocation!  **NOTE iOS**:  In addition, you must manually enable the *Audio and Airplay* background mode in *Background Capabilities* to hear these [debugging sounds](../../../wiki/Debug-Sounds).  See the ../../../wiki [Debug Sounds](wiki/Debug-Sounds) for a detailed description of these sounds.

####`@param {Integer} logLevel [5]`

Set the log-filter `logLevel`.  Defaults to `5` (verbose).  @see [`getLog`](#getlogcallbackfn) / [`emailLog`](#emaillogemail-callbackfn).

| logLevel | Label |
|---|---|
|`0`|`LOG_LEVEL_OFF`|
|`1`|`LOG_LEVEL_ERROR`|
|`2`|`LOG_LEVEL_WARNING`|
|`3`|`LOG_LEVEL_INFO`|
|`4`|`LOG_LEVEL_DEBUG`|
|`5`|`LOG_LEVEL_VERBOSE`|

These log-levels are defined as **constants** on the `BackgroundGeolocation` object:

```Javascript
bgGeo.configure({
  logLevel: bgGeo.LOG_LEVEL_WARNING
});
```

####`@param {Integer} logMaxDays [3]`

Maximum number of days to persist a log-entry in database.  Defaults to `3` days.

####`@param {Boolean} stopOnTerminate [true]`
Enable this in order to force a stop() when the application terminated (e.g. on iOS, double-tap home button, swipe away the app).  On Android, ```stopOnTerminate: false``` will cause the plugin to operate as a headless background-service (in this case, you should configure an #url in order for the background-service to send the location to your server)

####`@param {Boolean} startOnBoot [false]`

Set to `true` to enable background-tracking after the device reboots.

**iOS** 
iOS cannot immediately engage tracking after a device reboot since it requires either a "significant-change" event or geofence exit before iOS will awaken your app.  One can also use the [background-fetch plugin](https://github.com/christocracy/cordova-plugin-background-fetch) to *at least* awaken your app within 15 min of being rebooted.
**Android**
Unless you configure the plugin to `forceReload` (ie: boot your app), you should configure the plugin's HTTP features so it can POST to your server in "headless" mode.

####`@param {Integer} heartbeatInterval [undefined]`

Causes a `heartbeat` event to fire each `heartbeatInterval` seconds.  For **iOS**, this must be used in conjunction with `preventSuspend: true`.  **NOTE** The `heartbeat` event will only fire when the device is in the **STATIONARY** state -- it will not fire when the device is moving.

```Javascript
bgGeo.onHeartbeat(function(params) {
    var lastKnownLocation = params.location;
    console.log('- heartbeat: ', lastKnownLocation);
    // Or you could request a new location
    bgGeo.getCurrentPosition(function(location, taskId) {
        console.log('- current position: ', location);
        bgGeo.finish(taskId);
    });
});
```

####`@param {Array} schedule [undefined]`

Provides an automated schedule for the plugin to start/stop tracking at pre-defined times.  The format is cron-like:

```Javascript
  "{DAY(s)} {START_TIME}-{END_TIME}"
```

The `START_TIME`, `END_TIME` are in **24h format**.  The `DAY` param corresponds to the `Locale.US`, such that Sunday=1; Saturday=7).  You may configure a single day (eg: `1`), a comma-separated list-of-days (eg: `2,4,6`) or a range (eg: `2-6`), eg:

```Javascript
bgGeo.configure({
  .
  .
  .
  schedule: [
    '1 17:30-21:00',   // Sunday: 5:30pm-9:00pm
    '2-6 9:00-17:00',  // Mon-Fri: 9:00am to 5:00pm
    '2,4,6 20:00-00:00',// Mon, Web, Fri: 8pm to midnight (next day)
    '7 10:00-19:00'    // Sun: 10am-7pm
  ]
}, function(state) {
    // Start the Scheduler
    bgGeo.startSchedule(function() {
        console.info('- Scheduler started');
    });
});

// Listen to "schedule" events:
bgGeo.on('schedule', function(state) {
  console.log('- Schedule event, enabled:', state.enabled);
  
  if (state.enabled) {
    // tracking started!
  } else {
    // tracking stopped
  }
});

// Later when you want to stop the Scheduler (eg: user logout)
bgGeo.stopSchedule(function() {
  console.info('- Scheduler stopped');
});

// Or modify the schedule with usual #setConfig method
bgGeo.setConfig({
  schedule: [
    '1-7 9:00-10:00',
    '1-7 11:00-12:00',
    '1-7 13:00-14:00',
    '1-7 15:00-16:00',
    '1-7 17:00-18:00',
    '2,4,6 19:00-22:00'
  ]
});
```

## iOS Options

####`@param {Boolean} preventSuspend [false]`

Enable this to prevent **iOS** from suspending after location-services have been switch off.  Must be used in conjunction with a `heartbeatInterval`.  **WARNING**: `preventSuspend` should **only** be used in **very** specific use-cases and should typically **not** be used as it will have a **very serious impact on battery performance.**

## Android Options

####`@param {Boolean} forceReloadOnMotionChange [false]`

If the user closes the application while the background-tracking has been started,  location-tracking will continue on if `stopOnTerminate: false`.  You may choose to force the foreground application to reload (since this is where your Javascript runs).  `forceReloadOnMotionChange: true` will reload the app only when a state-change occurs from **stationary -> moving** or vice-versa. (**WARNING** possibly disruptive to user).

####`@param {Boolean} forceReloadOnLocationChange [false]`

If the user closes the application while the background-tracking has been started,  location-tracking will continue on if `stopOnTerminate: false`.  You may choose to force the foreground application to reload (since this is where your Javascript runs).  `forceReloadOnLocationChange: true` will reload the app when a new location is recorded.

####`@param {Boolean} forceReloadOnGeofence [false]`

If the user closes the application while the background-tracking has been started,  location-tracking will continue on if `stopOnTerminate: false`.  You may choose to force the foreground application to reload (since this is where your Javascript runs).  `forceReloadOnGeolocation: true` will reload the app only when a geofence crossing event has occurred.

####`@param {Boolean} forceReloadOnHeartbeat [false]`

If the closes the app with a configured `heartbeatInterval`, `forceReloadOnHeartbeat: true` will cause the foreground application (where your Javascript lives) to reload at the next `heartbeatInterval`.

####`@param {Boolean} forceReloadOnBoot [false]`

If the user reboots the device, setting `forceReloadOnBoot: true` will cause the foreground application (where your Javascript lives) to reload after the device is rebooted.  This option should be used in conjunction with `forceReloadOnLocationChange: true` or `forceReloadOnMotionChange: true`.

####`@param {Boolean} foregroundService [false]`

Make the Android service [run in the foreground](http://developer.android.com/intl/ru/reference/android/app/Service.html#foregroundService(int, android.app.Notification)), supplying the ongoing notification to be shown to the user while in this state.  Running as a foreground-service makes the tracking-service **much** more inmmune to OS killing it due to memory/battery pressure.  By default services are background, meaning that if the system needs to kill them to reclaim more memory (such as to display a large page in a web browser).  @see `notificationTitle`, `notificationText` & `notificatinoColor`

####`@param {String} notificationTitle [App name]`

When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.  This will configure the **title** of that notification.  Defaults to the application name.

####`@param {String} notificationText [Location service activated]`

When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.  This will configure the **text** of that notification.  Defaults to "Location service activated".

####`@param {String} notificationColor [null]`

When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.  This will configure the **color** of the notification icon (API >= 21).Supported formats are: `#RRGGBB` `#AARRGGBB` or one of the following names: 'red', 'blue', 'green', 'black', 'white', 'gray', 'cyan', 'magenta', 'yellow', 'lightgray', 'darkgray', 'grey', 'lightgrey', 'darkgrey', 'aqua', 'fuchsia', 'lime', 'maroon', 'navy', 'olive', 'purple', 'silver', 'teal'.

####`@param {String} notificationIcon [app icon]`

When running the service with `foregroundService: true`, Android requires a persistent notification in the Notification Bar.  This allows you customize that icon.  Defaults to your application icon.  **NOTE** You must specify the `type` of resource you wish to use in following for `{type}/icon_name`, eg:
- `notificationIcon: "drawable/my_custom_notification_icon"`
- `notificationIcon: "mipmap/my_custom_notification_icon"`

# Events

####`onLocation(successFn, failureFn)`
Your `successFn` will be called with the following signature whenever a new location is recorded:

######@param {Object} location The Location data (@see Wiki for [Location Data Schema](../../../wiki/Location-Data-Schema))
######@param {Integer} taskId The taskId used to send to bgGeo.finish(taskId) in order to signal completion of your callbackFn

```Javascript
bgGeo.onLocation(function(location, taskId) {
    
    var coords      = location.coords,
        timestamp   = location.timestamp
        latitude    = coords.latitude,
        longitude   = coords.longitude,
        speed       = coords.speed;

    console.log("A location has arrived:", timestamp, latitude, longitude, speed);
    
    // The plugin runs your callback in a background-thread:  
    // you MUST signal to the native plugin when your callback is finished so it can halt the thread.
    // IF YOU DON'T, iOS WILL KILL YOUR APP
    bgGeo.finish(taskId);
}, function(errorCode) {
    console.warn("- Location error: ", errorCode);
});
```

If an error occurs while fetching the location, the `failureFn` will be executed with an `Integer` [Error Code](../../../wiki/Location-Error-Codes) as the first argument.  Ie:

| Code | Error |
|-------|-----|
| 0 | Location unknown |
| 1 | Location permission denied |
| 2 | Network error |
| 408 | Location timeout |

####`onMotionChange(callbackFn, failureFn)`
Your `callbackFn` will be executed each time the device has changed-state between **MOVING** or **STATIONARY**.  The `callbackFn` will be provided with a Boolean `isMoving` as the 1st parameter, `Location` object as the 2st param, with the usual params (```latitude, longitude, accuracy, speed, bearing, altitude```), in addition to a ```taskId``` used to signal that your callback is finished.

######@param {Boolean} isMoving `false` if entered **STATIONARY** mode; `true` if entered **MOVING** mode.
######@param {Object} location The location at the state-change.
######@param {Integer} taskId The taskId used to send to bgGeo.finish(taskId) in order to signal completion of your callbackFn

```Javascript
bgGeo.onMotionChange(function(isMoving, location, taskId) {
    if (isMoving) {
        console.log('Device has just started MOVING', location);
    } else {
        console.log('Device has just STOPPED', location);
    }
    bgGeo.finish(taskId);
})

```

####`onActivityChange(callbackFn, failureFn)`
Your `callbackFn` will be executed each time the activity-recognition system detects a *change* in detected-activity (`still, on_foot, in_vehicle, on_bicycle, running`).

######@param {String still|on_foot|in_vehicle|on_bicycle|running|unknown} activityName 

```Javascript
bgGeo.onActivityChange(function(activityName) {
    console.log('- Activity changed: ', activityName);
});
```

####`onProviderChange(callbackFn, failureFn)`
Your `callbackFn` fill be executed when a change in the state of the device's **Location Services** has been detected.  eg: "GPS ON", "Wifi only".  Your `callbackFn` will be provided with an `{Object} provider` containing the following properties

######@param {Boolean} enabled Whether location-services is enabled
######@param {Boolean} gps Whether gps is enabled
######@param {Boolean} network Whether wifi geolocation is enabled.

```Javascript
bgGeo.on('providerchange', function(provider) {
    console.log('- Provider Change: ', provider);
    console.log('  enabled: ', provider.enabled);
    console.log('  gps: ', provider.gps);
    console.log('  network: ', provider.network);
});
```

####`onGeofence(callbackFn)`
Adds a geofence event-listener.  Your supplied callback will be called when any monitored geofence crossing occurs.  The `callbackFn` will be provided the following parameters:

######@param {Object} params.  This object contains 2 keys: `@param {String} identifier`, `@param {String} action [ENTER|EXIT]` and `@param {Object} location`.
######@param {Integer} taskId The background taskId which you must send back to the native plugin via `bgGeo.finish(taskId)` in order to signal that your callback is complete.

```Javascript
bgGeo.onGeofence(function(params, taskId) {
    try {
        var location = params.location;
        var identifier = params.identifier;
        var action = params.action;
        
        console.log('A geofence has been crossed: ', identifier);
        console.log('ENTER or EXIT?: ', action);
        console.log('location: ', JSON.stringify(location));
    } catch(e) {
        console.error('An error occurred in my application code', e);
    }
    // The plugin runs your callback in a background-thread:  
    // you MUST signal to the native plugin when your callback is finished so it can halt the thread.
    // IF YOU DON'T, iOS WILL KILL YOUR APP
    bgGeo.finish(taskId);
});
```

####`onGeofencesChange(callbackFn)`

Fired when the list of monitored-geofences changed.  For more information, see [Geofencing](./geofencing.md).  The Background Geolocation contains powerful geofencing features that allow you to monitor any number of circular geofences you wish (thousands even), in spite of limits imposed by the native platform APIs (**20 for iOS; 100 for Android**).

The plugin achieves this by storing your geofences in its database, using a [geospatial query](https://en.wikipedia.org/wiki/Spatial_query) to determine those geofences in proximity (@see config [geofenceProximityRadius](#param-integer-meters-geofenceproximityradius-1000)), activating only those geofences closest to the device's current location (according to limit imposed by the corresponding platform).

When the device is determined to be moving, the plugin periodically queries for geofences in proximity (eg. every minute) using the latest recorded location.  This geospatial query is **very fast**, even with tens-of-thousands geofences in the database.

It's when this list of monitored geofences *changes*, the plugin will fire the `geofenceschange` event.

######@param {Array} on The list of geofences just activated.
######@param {Array off The list of geofences just de-activated

```Javascript
bgGeo.on('geofenceschange', function(event) {
  var on = event.on;   //<-- new geofences activiated.
  var off = event.off; //<-- geofences that were de-activated.

  // Create map circles
  for (var n=0,len=on.length;n<len;n++) {
    var geofence = on[n];
    createGeofenceMarker(geofence)
  }

  // Remove map circles
  for (var n=0,len=off.length;n<len;n++) {
    var identifier = off[n];
    removeGeofenceMarker(identifier);
  }
});
```

This `event` object provides only the *changed* geofences, those which just activated or de-activated.

When **all** geofences have been removed, the event object will provide an empty-array `[]` for both `#on` and `#off` keys, ie:
```Javascript
{
    on: [{}, {}, ...],  // <-- Entire geofence objects {}
    off: ['identifier_foo', 'identifier_bar']  <-- just the identifiers
}
```

```Javascript
bgGeo.on('geofenceschange', function(event) {
  console.log("geofenceschange fired! ", event);
});

// calling remove geofences will cause the `geofenceschange` event to fire
bgGeo.removeGeofences();

=> geofenceschange fired! {on: [], off: []}

```

####`onHttp(successFn, failureFn)`

The `successFn` will be executed for each successful HTTP request where the response-code is one of `200`, `201` or `204`.  `failureFn` will be executed for all other HTTP response codes.  The `successFn` and `failureFn` will be provided a single `response {Object}` parameter with the following properties:

######@param {Integer} status.  The HTTP status
######@param {String} responseText The HTTP response as text.

Example:
```Javascript
bgGeo.onHttp(function(response) {
    var status = response.status;
    var responseText = response.responseText;
    var res = JSON.parse(responseText);  // <-- if your server returns JSON

    console.log("- HTTP success", status, res);

}, function(response) {
    var status = response.status;
    var responseText = response.responseText;
    console.log("- HTTP failure: ", status, responseText);
})
```

####`onHeartbeat(successFn, failureFn)`

The `successFn` will be executed for each `heartbeatInterval` while the device is in **stationary** state (**iOS** requires `{preventSuspend: true}` as well).  The `successFn` will be provided a single `params {Object}` parameter with the following properties:

######@param {Integer} shakes (iOS only).  A measure of the device movement.  Shakes is a measure of accelerometer data crossing over a threshold where the device is decided to be moving.  The higher the shakes, the more the device is moving.  When shakes is **0**, the device is completely still.
######@param {String} motionType.  The current motion-type `still, on_foot, running, on_bicycle, in_vehicle, shaking, unknown`
######@param {Object} location.  When the plugin detects `shakes > 0` (iOS only), it will always request a new high-accuracy location in order to determine if the device has moved beyond `stationaryRadius` and if the location has `speed > 0`.  This fresh location will be provided to your `successFn`.  If `shakes == 0`, the current **stationary location** will be provided.  Android will simply return the "last known location"

Example:
```Javascript
bgGeo.onHeartbeat(function(params) {
    console.log('- hearbeat');

    var shakes = params.shakes;
    var location = params.location;

    // Attach some arbitrary data to the location extras.
    location.extras = {
        foo: 'bar',
        shakes: shakes
    };

    // You can manually insert a location if you wish.
    bgGeo.insertLocation(location, function() {
        console.log('- inserted location during heartbeat');
    });

    // OR you could request a new location:
    bgGeo.getCurrentPosition(function(location, taskId) {
        console.log('- current location: ', location);
        bgGeo.finish(taskId);
    });
}, function(response) {
    var status = response.status;
    var responseText = response.responseText;
    console.log("- HTTP failure: ", status, responseText);
})
```

####`onSchedule(successFn, failureFn)`

The `successFn` will be executed for each time a `schedule` event occurs.  Your `successFn` will be provided with the current `state` object (@see `#getState`).  `state.enabled` will reflect the state according to your configured `schedule`.

######@param {Object} State

Example:
```Javascript
bgGeo.onSchedule(function(state) {
    console.log('- A schedule event fired: ', state.enabled);
    console.log('- Current state: ', state);
})
```

# Methods

####`configure(config, success, failure)`

Configures the plugin's parameters.  The `success` callback will be executed after the plugin has successfully configured.  The `success` callback will be provided with the current `state` Object as the 1st parameter.

```Javascript
bgGeo.configure({
  desiredAccuracy: 0,
  distanceFilter: 50,
  stationaryRadius: 25,
  locationUpdateInterval: 1000,
  foregroundService: true
}, function(state) {
    console.log("Background Geolocation started.  Current state: ", state.enabled);
}, function(error) {
    console.warn("Background Geolocation failed to configure");
})
```

####`removeListeners(successFn, failureFn)`

Remove all event-listeners registered with `#on` method.  You're free to add more listeners again after executing `#removeListeners`.

```Javascript
bgGeo.on('location', function(location, taskId) {
  console.log('- Location', location);
  bgGeo.finish(taskId);
})
.
.
.
bgGeo.removeListeners();

bgGeo.on('location', function(location, taskId) {
  console.log('- Location listener added again: ', location);
  bgGeo.finish(taskId);
});
```

####`setConfig(config, successFn, failureFn)`
Re-configure plugin's configuration parameters.

```Javascript
bgGeo.setConfig({
    desiredAccuracy: 10,
    distanceFilter: 100
}, function(){
    console.log("- setConfig success");
}, function(){
    console.warn("- Failed to setConfig");
});
```

####`start(successFn, failureFn)`

Enable location tracking.  Supplied `callbackFn` will be executed when tracking is successfully engaged.  This is the plugin's power **ON** button.  The plugin will initially start into its **stationary** state, fetching an initial location before turning off location services.  Android will be monitoring its **Activity Recognition System** while iOS will create a stationary geofence around the current location.  **NOTE** If you've configured a `schedule`, this method will override that schedule and engage tracking immediately.

```Javascript
bgGeo.start()
```

####`stop(successFn, failureFn)`

Disable location tracking.  Supplied `callbackFn` will be executed when tracking is successfully halted.  This is the plugin's power **OFF** button.  **NOTE** If you've configured a `schedule`, this method will cease that schedule as well.

```Javascript
bgGeo.stop();
```

####`startSchedule(callbackFn)`

If a `schedule` was configured, this method will initiate that schedule.  The plugin will automatically be started or stopped according to the configured `schedule`.  

```Javascript
bgGeo.startSchedule(function() {
    console.log('- Scheduler started');
});
```

####`stopSchedule(callbackFn)`

This method will stop the Scheduler service.

```Javascript
bgGeo.stopSchedule(function() {
    console.log('- Scheduler stopped');
});
```

####`startGeofences(callbackFn)`

Engages the geofences-only `trackingMode`.  In this mode, no active location-tracking will occur -- only geofences will be monitored.  To stop monitoring "geofences" `trackingMode`, simply use the usual `#stop` method.  The `state` object now contains the new key `trackingMode [location|geofence]`.

```Javascript

bgGeo.configure(config, function(state) {
    // Add some geofences.
    bgGeo.addGeofences([
        notifyOnExit: true,
        radius: 200,
        identifier: 'ZONE_OF_INTEREST',
        latitude: 37.234232,
        longitude: 42.234234 
    ]);

    if (!state.enabled) {
        bgGeo.startGeofences(function(state) {
            console.log('- Geofence-only monitoring started', state.trackingMode);
        });
    }
});

// Listen to geofences
bgGeo.onGeofence(function(params, taskId) {
    if (params.identifier == 'ZONE_OF_INTEREST') {
        // If you wish, you can choose to engage location-tracking mode when a 
        // particular geofence event occurs.
        bgGeo.start();
    }
    bgGeo.finish();
});
```

####`getState(successFn)`

Fetch the current-state of the plugin, including all configuration parameters.

```Javascript
bgGeo.getState(function(state) {
  console.log(JSON.stringify(state));
});

{
  "stopOnTerminate": true,
  "disableMotionActivityUpdates": false,
  "params": {
    "device": {
      "manufacturer": "Apple",
       "available": true,
       "platform": "iOS",
       "cordova": "3.9.1",
       "uuid": "61CA53C7-BC4B-44D3-991B-E9021AE7F8EE",
       "model": "iPhone8,1",
       "version": "9.0.2"
    }
  },
  "url": "http://192.168.11.120:8080/locations",
  "desiredAccuracy": 0,
  "stopDetectionDelay": 0,
  "activityRecognitionInterval": 10000,
  "distanceFilter": 50,
  "activityType": 2,
  "useSignificantChangesOnly": false,
  "autoSync": false,
  "isMoving": false,
  "maxDaysToPersist": 1,
  "stopTimeout": 2,
  "enabled": false,
  "debug": true,
  "batchSync": false,
  "headers": {},
  "disableElasticity": false,
  "stationaryRadius": 20
}
```

####`getCurrentPosition(successFn, failureFn, options)`
Retrieves the current position.  This method instructs the native code to fetch exactly one location using maximum power & accuracy.  The native code will persist the fetched location to its SQLite database just as any other location in addition to POSTing to your configured `#url` (if you've enabled the HTTP features).  In addition to your supplied `callbackFn`, the plugin will also execute the `callback` provided to `#configure`.

If an error occurs while fetching the location, the `failureFn` will be executed with an `Integer` [Error Code](../../../wiki/Location-Error-Codes) as the first argument.

#### Options

######@param {Integer} timeout [30]
An optional location-timeout.  If the timeout expires before a location is retrieved, the `failureFn` will be executed.
######@param {Integer millis} maximumAge [0]
Accept the last-recorded-location if no older than supplied value in milliseconds.
######@param {Boolean} persist [true]
Defaults to `true`.  Set `false` to disable persisting the retrieved location in the plugin's SQLite database.
######@param {Integer} samples [3]
Sets the maximum number of location-samples to fetch.  The plugin will return the location having the best accuracy to your `successFn`.  Defaults to `3`.  Only the final location will be persisted.
######@param {Integer} desiredAccuracy [stationaryRadius]
Sets the desired accuracy of location you're attempting to fetch.  When a location having `accuracy <= desiredAccuracy` is retrieved, the plugin will stop sampling and immediately return that location.  Defaults to your configured `stationaryRadius`.
######@param {Object} extras
Optional extra-data to attach to the location.  These `extras {Object}` will be merged to the recorded `location` and persisted / POSTed to your server (if you've configured the HTTP Layer).

#### Callback

######@param {Object} location The Location data
######@param {Integer} taskId The taskId used to send to bgGeo.finish(taskId) in order to signal completion of your callbackFn

```Javascript
bgGeo.getCurrentPosition(function(location, taskId) {
    // This location is already persisted to plugin’s SQLite db.  
    // If you’ve configured #autoSync: true, the HTTP POST has already started.

    console.log(“- Current position received: “, location);
    bgGeo.finish(taskId);
}, function(errorCode) {
    alert('An location error occurred: ' + errorCode);
}, {
  timeout: 30,      // 30 second timeout to fetch location
  maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
  desiredAccuracy: 10,  // Try to fetch a location with an accuracy of `10` meters.
  samples: 3,       // How many location samples to attempt.
  extras: {         // [Optional] Attach your own custom `metaData` to this location.  This metaData will be persisted to SQLite and POSTed to your server
    foo: "bar"  
  }
});

```

If a location failed to be retrieved, you `failureFn` will be executed with an error-code parameter

| Error | Reason | Code |
|---|---|---|
| kCLErrorLocationUnknown | Could not fetch location | 0 |
| kCLErrorDenied | The user disabled location-services in Settings | 1 |
| kCLErrorNetwork | Network error | 2 |
| kCLErrorHeadingFailure | - | 3 |
| kCLErrorRegionMonitoringDenied | User disabled region-monitoring in Settings | 4 |
| kCLErrorRegionMonitoringFailure | Installed in a device with no region-monitoring capability | 5 |
| kCLErrorRegionMonitoringSetupDelayed | - | 6 |
| kCLErrorRegionMonitoringResponseDelayed | - | 7 |
| kCLErrorDeferredFailed | - | 11 |
| kCLErrorDeferredNotUpdatingLocation | - | 12 |
| kCLErrorDeferredAccuracyTooLow | - | 13 |
| kCLErrorDeferredDistanceFiltered | - | 14 |
| kCLErrorDeferredCanceled | - | 15 |

Eg:

```Javascript
bgGeo.getCurrentPosition(succesFn, function(errorCode) {
    switch (errorCode) {
        case 0:
            alert('Failed to retrieve location');
            break;
        case 1:
            alert('You must enable location services in Settings');
            break;

    }
})
```

####`watchPosition(successFn, failureFn, options)`
Start a stream of continuous location-updates.  The native code will persist the fetched location to its SQLite database just as any other location in addition to POSTing to your configured `#url` (if you've enabled the HTTP features).

**iOS** 
- `watchPosition` will continue to run in the background, preventing iOS from suspending your application.  Take care to listen to `suspend` event and call `#stopWatchPosition` if you don't want your app to keep running (TODO make this configurable).
- There is no `bgTask` provided to the callback.

#### Options
######@param {Integer millis} `[1000]` Location update interval
######@param {Integer} `[0]` desiredAccuracy
######@param {Boolean} `[true]` persist 
######@param {Object} `[undefined]` extras Optional extras to append to each location

#### Callback

######@param {Object} location The Location data

```Javascript
bgGeo.watchPosition(function(location) {
    console.log(“- Watch position: “, location);
}, function(errorCode) {
    alert('An location error occurred: ' + errorCode);
}, {
    interval: 5000,    // <-- retrieve a location every 5s.
    persist: false,    // <-- default is true
});

```

####`stopWatchPosition(successFn, failureFn)`

Halt `watchPosition` updates.  **NOTE** Due to the nature of Cordova callbacks, your `failureFn` provided to `#watchPosition` will be executed with a code of `-1` when you execute. `#stopWatchPosition` -- this is **normal**.  This simply provides a signal to Cordova that it can delete the `callback`, preventing a memory leak.

```Javascript
bgGeo.stopWatchPosition();  // <-- callbacks are optional
```

####`changePace(enabled, successFn, failureFn)`
Initiate or cancel immediate background tracking.  When set to ```true```, the plugin will begin aggressively tracking the devices Geolocation, bypassing stationary monitoring.  If you were making a "Jogging" application, this would be your [Start Workout] button to immediately begin GPS tracking.  Send ```false``` to disable aggressive GPS monitoring and return to stationary-monitoring mode.

```
bgGeo.changePace(true);  // <-- Aggressive GPS monitoring immediately engaged.
bgGeo.changePace(false); // <-- Disable aggressive GPS monitoring.  Engages stationary-mode.
```

####`addGeofence(config, callbackFn, failureFn)`
Adds a geofence to be monitored by the native plugin.  The `config` object accepts the following params.  See [Geofencing](./geofencing.md) for more information.

**Note**: when adding a list-of-geofences, it's about **10* faster** to use `[addGeofences](#addgeofencesgeofences-callbackfn-failurefn)` instead.

######@config {String} identifier The name of your geofence, eg: "Home", "Office"
######@config {Float} radius The radius (meters) of the geofence.  In practice, you should make this >= 100 meters.
######@config {Float} latitude Latitude of the center-point of the circular geofence.
######@config {Float} longitude Longitude of the center-point of the circular geofence.
######@config {Boolean} notifyOnExit Whether to listen to EXIT events
######@config {Boolean} notifyOnEntry Whether to listen to ENTER events
######@config {Boolean} notifyOnDwell (**Android only**) Whether to listen to DWELL events
######@config {Integer milliseconds} loiteringDelay (**Android only**) When `notifyOnDwell` is `true`, the delay before DWELL event is fired after entering a geofence (@see [Creating and Monitoring Geofences](https://developer.android.com/training/location/geofencing.html))

```Javascript
bgGeo.addGeofence({
    identifier: "Home",
    radius: 150,
    latitude: 45.51921926,
    longitude: -73.61678581,
    notifyOnEntry: true,
    notifyOnExit: false,
    notifyOnDwell: true,
    loiteringDelay: 30000   // <-- 30 seconds
}, function() {
    console.log("Successfully added geofence");
}, function(error) {
    console.warn("Failed to add geofence", error);
});
```

####`addGeofences(geofences, callbackFn, failureFn)`
Adds a list of geofences to be monitored by the native plugin.  Monitoring of a geofence is halted after a crossing occurs.  The `geofences` param is an `Array` of geofence Objects `{}` with the following params:

######@config {String} identifier The name of your geofence, eg: "Home", "Office"
######@config {Float} radius The radius (meters) of the geofence.  In practice, you should make this >= 100 meters.
######@config {Float} latitude Latitude of the center-point of the circular geofence.
######@config {Float} longitude Longitude of the center-point of the circular geofence.
######@config {Boolean} notifyOnExit Whether to listen to EXIT events
######@config {Boolean} notifyOnEntry Whether to listen to ENTER events
######@config {Boolean} notifyOnDwell (Android only) Whether to listen to DWELL events
######@config {Integer milliseconds} loiteringDelay (Android only) When `notifyOnDwell` is `true`, the delay before DWELL event is fired after entering a geofence.

```Javascript
bgGeo.addGeofences([{
    identifier: "Home",
    radius: 150,
    latitude: 45.51921926,
    longitude: -73.61678581,
    notifyOnEntry: true,
    notifyOnExit: false,
    notifyOnDwell: true,
    loiteringDelay: 30000   // <-- 30 seconds
}], function() {
    console.log("Successfully added geofence");
}, function(error) {
    console.warn("Failed to add geofence", error);
});
```

####`removeGeofence(identifier, callbackFn, failureFn)`
Removes a geofence having the given `{String} identifier`.

######@config {String} identifier The name of your geofence, eg: "Home", "Office"
######@config {Function} callbackFn successfully removed geofence.
######@config {Function} failureFn failed to remove geofence

```Javascript
bgGeo.removeGeofence("Home", function() {
    console.log("Successfully removed geofence");
}, function(error) {
    console.warn("Failed to remove geofence", error);
});
```

####`removeGeofences(callbackFn, failureFn)`
Removes all geofences.

######@config {Function} callbackFn successfully removed geofences.
######@config {Function} failureFn failed to remove geofences

```Javascript
bgGeo.removeGeofences(function() {
    console.log("Successfully removed alll geofences");
}, function(error) {
    console.warn("Failed to remove geofence", error);
});
```

####`getGeofences(callbackFn, failureFn)`

Fetch the list of monitored geofences.  Your `callbackFn` will be provided with an `Array` of geofences.  If there are no geofences being monitored, you'll receive an empty Array `[]`.

```Javascript
bgGeo.getGeofences(function(geofences) {
    for (var n=0,len=geofences.length;n<len;n++) {
        console.log("Geofence: ", geofence.identifier, geofence.radius, geofence.latitude, geofence.longitude);
    }
}, function(error) {
    console.warn("Failed to fetch geofences from server");
});
```

####`getLocations(callbackFn, failureFn)`
Fetch all the locations currently stored in native plugin's SQLite database.  Your ```callbackFn`` will receive an ```Array``` of locations in the 1st parameter.  Eg:

The `callbackFn` will be executed with following params:

######@param {Array} locations.  The list of locations stored in SQLite database.
######@param {Integer} taskId The background taskId which you must send back to the native plugin via `bgGeo.finish(taskId)` in order to signal the end of your background thread.


```Javascript
    bgGeo.getLocations(function(locations, taskId) {
        try {
            console.log("locations: ", locations);
        } catch(e) {
            console.error("An error occurred in my application code");
        }
        bgGeo.finish(taskId);
    });
```

####`getCount(callbackFn, failureFn)`
Fetches count of SQLite locations table `SELECT count(*) from locations`.  The `callbackFn` will be executed with count as the only parameter.

######@param {Integer} count

```Javascript
    bgGeo.getCount(function(count) {
        console.log('- count: ', count);
    });
```

####`insertLocation(params, callbackFn, failureFn)`
Manually insert a location into the native plugin's SQLite database.  Your ```callbackFn`` will be executed if the operation was successful.  The inserted location's schema must match this plugin's published [Location Data Schema](wiki/Location-Data-Schema).  The plugin will have no problem inserting a location retrieved from the plugin itself.

######@param {Object} params.  The location params/object matching the [Location Data Schema](wiki/Location-Data-Schema).

```Javascript
    bgGeo.insertLocation({
        "uuid": "f8424926-ff3e-46f3-bd48-2ec788c9e761", // <-- required
        "coords": {                                     // <-- required
            "latitude": 45.5192746,
            "longitude": -73.616909,
            "accuracy": 22.531999588012695,
            "speed": 0,
            "heading": 0,
            "altitude": 0
        },
        "timestamp": "2016-02-10T22:25:54.905Z"         // <-- required
    }, function() {
        console.log('- Inserted location success');
    }, function(error) {
        console.warn('- Failed to insert location: ', error);
    });

    // insertLocation can easily consume any location which it returned.  Note that #getCurrentPosition ALWAYS persists so this example
    // will manually persist a 2nd version of the same location.  The purpose here is to show that the plugin can consume any location object which it generated.
    bgGeo.getCurrentPosition(function(location, taskId) {
        location.extras = {foo: 'bar'}; // <-- add some arbitrary extras-data

        // Insert it.
        bgGeo.insertLocation(location, function() {
            bgGeo.finish(taskId);
        });
    });
```

####`clearDatabase(callbackFn, failureFn)`
**DEPRECATED**.  Use `#destroyLocations`.

####`destroyLocations(callbackFn, failureFn)`
Remove all records in plugin's SQLite database.

```Javascript
    bgGeo.destroyLocations(function() {
      console.log('- cleared database'); 
    });
```

####`sync(callbackFn, failureFn)`

If the plugin is configured for HTTP with an ```#url``` and ```#autoSync: false```, this method will initiate POSTing the locations currently stored in the native SQLite database to your configured ```#url```.  All records in the database will be DELETED.  If you configured ```batchSync: true```, all the locations will be sent to your server in a single HTTP POST request, otherwise the plugin will create execute an HTTP post for **each** location in the database (REST-style).  Your ```callbackFn``` will be executed and provided with an Array of all the locations from the SQLite database.  If you configured the plugin for HTTP (by configuring an `#url`, your `callbackFn` will be executed after the HTTP request(s) have completed.  If the plugin failed to sync to your server (possibly because of no network connection), the ```failureFn``` will be called with an ```errorMessage```.  If you are **not** using the HTTP features, ```sync``` is the only way to clear the native SQLite datbase.  Eg:

Your callback will be provided with the following params

######@param {Array} locations.  The list of locations stored in SQLite database.
######@param {Integer} taskId The background taskId which you must send back to the native plugin via `bgGeo.finish(taskId)` in order to signal the end of your background thread.

```Javascript
    bgGeo.sync(function(locations, taskId) {
        try {
            // Here are all the locations from the database.  The database is now EMPTY.
            console.log('synced locations: ', locations);
        } catch(e) {
            console.error('An error occurred in my application code', e);
        }

        // Be sure to call finish(taskId) in order to signal the end of the background-thread.
        bgGeo.finish(taskId);
    }, function(errorMessage) {
        console.warn('Sync FAILURE: ', errorMessage);
    });

```

####`getOdometer(callbackFn, failureFn)`

The plugin constantly tracks distance travelled.  To fetch the current **odometer** reading:

```Javascript
    bgGeo.getOdometer(function(distance) {
        console.log("Distance travelled: ", distance);
    });
```

####`resetOdometer(callbackFn, failureFn)`

Reset the **odometer** to zero.  The plugin never automatically resets the odometer so it's up to you to reset it as desired.

####`playSound(soundId)`

Here's a fun one.  The plugin can play a number of OS system sounds for each platform.  For [IOS](http://iphonedevwiki.net/index.php/AudioServices) and [Android](http://developer.android.com/reference/android/media/ToneGenerator.html).  I offer this API as-is, it's up to you to figure out how this works.

```Javascript
    // A soundId iOS recognizes
    bgGeo.playSound(1303);
    
    // An Android soundId
    bgGeo.playSound(90);
```

####`setLogLevel(callbackFn)`

Set the log filter `logLevel`
| logLevel | Label |
|---|---|
|`0`|`LOG_LEVEL_OFF`|
|`1`|`LOG_LEVEL_ERROR`|
|`2`|`LOG_LEVEL_WARNING`|
|`3`|`LOG_LEVEL_INFO`|
|`4`|`LOG_LEVEL_DEBUG`|
|`5`|`LOG_LEVEL_VERBOSE`|

```Javascript
    bgGeo.setLogLevel(bgGeo.LOG_LEVEL_VERBOSE, function() {
        console.log("Changed logLevel success");
    });
```

####`getLog(callbackFn)`

Fetches the entire contents of the current circular-log and return it as a String.

```Javascript
    bgGeo.getLog(function(log) {
        console.log(log);
    });
```

####`destroyLog(callbackFn, failureFn)`

Destory the entire contents of Log database.

```Javascript
    bgGeo.destroyLog(function() {
        console.log('- Destroyed log');
    }, function() {
        console.log('- Destroy log failure');
    });
```

####`emailLog(email, callbackFn)`

Fetch the entire contents of the current circular log and email it to a recipient using the device's native email client.

```Javascript
    bgGeo.emailLog("foo@bar.com");
```

**Android:**  

1. The following permissions are required in your `AndroidManifest.xml` in order to attach the `.log` file to the email:

```xml
<manifest>
  <application>
  ...
  </application>

  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
</manifest>
```

2. Grant "Storage" permission `Settings->Apps->[Your App]->Permissions: (o) Storage`

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/Screenshot_20160218-183345.png)
