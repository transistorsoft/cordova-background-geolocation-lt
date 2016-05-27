
# Change Log

## [Unreleased]

## [1.6.2] - 2016-05-27
- [Changed] `Scheduler` will use `Locale.US` in its Calendar operations, such that the days-of-week correspond to Sunday=1..Saturday=7.
- [Fixed] **iOS** Added `event [motionchange|geofence]` to location-data returned to `onLocation` event. 
- [Changed] Refactor odometer calculation for both iOS and Android.  No longer filters out locations based upon average location accuracy of previous 10 locations; instead, it will only use the current location for odometer calculation if it has accuracy < 100.
- [Fixed] Missing iOS setting `locationAuthorizationRequest` after Settings service refactor

## [1.6.1] - 2016-05-22
- [Changed] Refactor iOS motion-detection system.  When not set to `disableMotionActivityUpdates` (default), the  plugin will not activate the accelerometer and will rely instead purely upon updates from the **M7** chip.  When `disableMotionActivityUpdates` **is** set to `false`, the pure acceleromoeter based activity-detection has been improved to give more accurate results of the detected activity (ie: `on_foot, walking, stationary`)
- [Added] Implement new Scheduling feature
- [Fixed] Bugs in iOS option `useSignificantChangesOnly`
- [Changed] Refactor HTTP Layer for both iOS and Android to stop spamming server when it returns an error (used to keep iterating through the entire queue).  It will now stop syncing as soon as server returns an error (good for throttling servers).
- [Added] Migrate iOS settings-management to new Settings service
- [Fixed] bugs in Scheduler
- [Added] Better BackgroundFetch plugin integration.  Background-fetch will retrieve the location-state when a fetch event fires.  This can help to trigger stationary-exit since bg-fetch typically fires about every 15min.
- [Added] Improved functionality with `stopOnTerminate: false`.  Ensure a stationary-geofence is created when plugin is closed while in **moving** state; this seems to improve the time it takes to trigger the iOS app awake after terminate.  When plugin *is* rebooted in background due to geofence-exit, the plugin will briefly sample the accelerometer to see if device is currently moving.

## [1.5.1] - 2016-04-12
- [Added] ios logic to handle being launched in the background (by a background-fetch event, for example).  When launched in the background, iOS will essentially do a `changePace(true)` upon itself and let the stop-detection system determine engage stationary-mode as detected.
- [Changed] ios halt stop-detection distance was using `distanceFilter`; changed to use `stationaryRadius`.  This effects users using the accelerometer-based stop-detection system:  after stop is detected, the device must move `stationaryRadius` meters away from location where stop was detected.
- [Changed] When `maxRecordsToPersist == 0`, don't persist any record.
- [Added] Implement `startOnBoot` param for iOS.  iOS always ignored `startOnBoot`.  If you set `startOnBoot: false` now, iOS will not begin tracking when launched in background after device is rebooted (eg: from a background-fetch event, geofence exit or significant-change event)
- [Changed] Modified the method signature of `#configure`.  The config `{}` will now be the 1st param and the `callbackFn` will now signal successful configuration.  The `locationCallback` and `locationErrorCallback` must now be provided with a separate event-listener `#onLocation`.
- [Added] Imported Android demo code so that users can test the Android plugin using the SampleApp `bundle ID` and `license`

## [1.5.0] - 2016-04-04
- [Fixed] ios `stopOnTerminate` was defaulting to `false`.  Docs say default is `true`.
- [Fixed] ios `useSignificantChangesOnly` was broken.
- [Added] Add odometer to ios location JSON schema
- [Added] ios Log network reachability flags on connection-type changes.
- [Added] `maxRecordsToPersist`
in plugin's SQLite database.
- [Added] API methods `#addGeofences` (for adding a list-of-geofences), `#removeGeofences`
- [Changed] The plugin will no longer delete geofences when `#stop` is called; it will merely stop monitoring them.  When the plugin is `#start`ed again, it will start monitoringt any geofences it holds in memory.  To completely delete geofences, use new method `#removeGeofences`.
- [Fixed] iOS battery `is_charging` was rendering as `1/0` instead of boolean `true/false`
- 
## [1.4.1] - 2016-03-20
- [Fixed] iOS Issue with timers not running on main-thread.
- [Fixed] iOS Issue with acquriring stationary-location on a stale location.  Ensure the selected stationary-location is no older than 1s.
- [Fixed] iOS Removed some log messages appearing when `{debug: false}`

## [1.4.0] - 2016-03-08

## [1.3.0]

- [Changed] Upgrade `emailLog` method to attach log as email-attachment rather than rendering to email-body.  The result of `#getState` is now rendered to the 

##0.6.4

- Tweak stop-detection system.  add `#stopDetectionDelay`

## 0.6.3
- Introduce accelerometer-base stop-detection for ios.
- `@config {Boolean} useSignificantChangesOnly`
- When a geofence event occurs, the associated location will have geolocation meta-data attached to the associated location.  Find it in the POST data.  See Wiki Location Data Schema for details.
