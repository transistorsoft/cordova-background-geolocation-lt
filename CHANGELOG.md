
# Change Log

## [3.0.7] - 2019-06-17
- [Fixed] iOS & Android:  Odometer issues:  clear odometer reference location on `#stop`, `#startGeofences`.
- [Fixed] Odometer issues: Android must persist its odometer reference location since the foreground-service is no longer long-lived and the app may be terminated between motionchange events.
- [Fixed] Return `Service.START_REDELIVER_INTENT` from `HeartbeatService` to prevent `null` Intent being delivered to `HeartbeatService`, causing a crash.
- [Added] Implement Android [LocationSettingsRequest](https://developer.android.com/training/location/change-location-settings#get-settings).  Determines if device settings is currently configured according to the plugin's desired-settings (eg: gps enabled, location-services enabled).  If the device settings differs, an automatic dialog will perform the required settings changes automatically when user clicks [OK].
- [Fixed] Android `triggerActivities` was not implemented refactor of `3.x`.

## [3.0.6] - 2019-06-04
- [Fixed] Android `destroyLocations` callback was being executed in background-thread.
- [Fixed] When Android geofence API receives a `GEOFENCE_NOT_AVAILABLE` error (can occur if Wifi is disabled), geofences must be re-registered.
- [Fixed] Android `Config.disableStopDetection` was not implemented.
- [Added] Add new Android Config options `scheduleUseAlarmManager` for forcing scheduler to use `AlarmManager` insead of `JobService` for more precise scheduling.

## [3.0.5] &mdash; 2019-05-14
--------------------------------------------------------------------
### :warning: Breaking Changes

### Android License Configuration

The Android license configuration mechanism of the plugin using `--variable LICENSE` is one of the biggest recurring support requests received.  From now on, Android `license_key` will be configured using a `<config-file />` block in your `config.xml` file (See updated README [Configuring the plugin](./README.md#large_blue_diamond-configuring-the-plugin)):

With this change, your license key will **never be deleted** when you remove the plugin and you'll never have to resort to the Wiki *License Validation Failure*.

- Open `config.xml`:  Add the following *namespace* attribute to the top-level `<widget>` element:

```diff
<widget
  id="com.foo.bar"
  version="1.0.0"
  xmlns="http://www.w3.org/ns/widgets"
+ xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:cdv="http://cordova.apache.org/ns/1.0">
```

- Within the `<platform name="android">` container, add the `license_key` key using a `<config-file />` element:

```xml
<platform name="android">
      <!-- background-geolocation -->
      <config-file parent="/manifest/application" target="app/src/main/AndroidManifest.xml">
          <meta-data
            android:name="com.transistorsoft.locationmanager.license_key"
            android:value="YOUR_LICENSE_KEY_HERE" />
      </config-file>
      <!-- /background-geolocation -->
</platform>
```

:warning: On older version of Cordova, If you **change your license key** after building android, you might receive an error:
```diff
BUILD FAILED in 1s

-Element meta-data#com.transistorsoft.locationmanager.license at AndroidManifest.xml duplicated
-with element declared at AndroidManifest.xml duplicated with element declared at AndroidManifest.xml
```

Simply remove and re-add the android platform:

```
$ cordova platform remove android
$ cordova platform add android
```

### iOS Location Authorization Strings

The iOS *Location Authorization Strings* have been migrated to the same `<config-file> />` mechanism.  The following plugin config `--variable` have been removed:
- `LOCATION_ALWAYS_AND_WHEN_IN_USE_USAGE_DESCRIPTION`
- `LOCATION_ALWAYS_USAGE_DESCRIPTION`
- `LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION`
- `MOTION_USAGE_DESCRIPTION`

You can now manage these strings in `config.xml` using the following `<config-file />` elements:

```xml
<platform name="ios">
    <!-- background-geolocation -->
    <config-file parent="NSLocationAlwaysAndWhenInUseUsageDescription" target="*-Info.plist">
        <string>[CHANGEME] Background location tracking is required for our app so we can...</string>
    </config-file>
    <config-file parent="NSLocationAlwaysUsageDescription" target="*-Info.plist">
        <string>[CHANGEME pre-iOS11.  No longer used with iOS 12] Background location tracking is required for our app so we can...</string>
    </config-file>
    <config-file parent="NSLocationWhenInUseUsageDescription" target="*-Info.plist">
        <string>[CHANGEME].  Background location tracking is required for our app so we can...</string>
    </config-file>
    <config-file parent="NSMotionUsageDescription" target="*-Info.plist">
        <string>[CHANGEME] Device motion updates help determine when the device is stationary so the app can save power by turning off location-updates</string>
    </config-file>
    <!-- /background-geolocation -->
</platform>
```

--------------------------------------------------------------------

## [3.0.4] - 2019-05-10
- [Changed] Rollback `android-permissions` version back to `0.1.8`.  It relies on `support-annotations@28`.  This isn't a problem if one simply upgrades their `targetSdkVersion` but the support calls aren't worth the hassle, since the latest version doesn't offer anything the plugin needs.

## [3.0.3] - 2019-05-08
- [Fixed] iOS: changing `pauseslocationUpdatesAutomatically` was not being applied.
- [Changed] `reset` parameter provided to `#ready` has now been default to `true`.  This causes too many support issues for people using the plugin the first time.
- [Fixed] Android threading issue where 2 distinct `SingleLocationRequest` were issued the same id.  This could result in the foreground service quickly starting/stopping until `locationTimeout` expired.
- [Fixed] Android issue where geofences could fail to query for new geofences-in-proximity after a restart.
- [Fixed] Android issues re-booting device with location-services disabled or location-authorization revoked.
- [Added] Implement support for [Custom Android Notification Layouts](/../../wiki/Android-Custom-Notification-Layout).
- [Fixed] Android bug where service repeatedly starts/stops after rebooting the device with plugin in *moving* state.
- [Fixed] Android headless `heartbeat` events were failing (incorrect `Context` was supplied to the event).

## [3.0.1] - 2019-04-17
- [Fixed] Typescript API missing methods `getProviderState`, `requestPermission`.
- [Added] Expose plugin config `--variable` `OKHTTP_VERSION`.  People are reporting conflicts with `cordova-plugin-advanced-http`, which also imports `okhttp`.

## [3.0.0] - 2019-04-10

## [3.0.0-rc.4] - 2019-03-31
- [Fixed] Android: Another `NullPointerException` with `Bundle#getExtras`.

## [3.0.0-rc.3] - 2019-03-29

- [Fixed] Android `NullPointerException` with `Bundle#getExtras`.
- [Fixed] Android not persisting `providerchange` location when location-services re-enabled.

## [3.0.0-rc.2] - 2019-03-27

- [Fixed] An Android foreground-service is launched on first install and fails to stop.

------------------------------------------------------------------------------
### :warning: Breaking Changes

#### [Changed] The license format has changed.  New `3.0.0` licenses are now available for customers in the [product dashboard](https://www.transistorsoft.com/shop/customers).
![](https://dl.dropbox.com/s/3ohnvl9go4mi30t/Screenshot%202019-03-26%2023.07.46.png?dl=1)

- For versions `< 3.0.0`, use *old* license keys.
- For versions `>= 3.0.0`, use *new* license keys.
------------------------------------------------------------------------------

### Fixes
- [Fixed] Logic bugs in MotionActivity triggering between *stationary* / *moving* states.

### New Features

- [Added] Android implementation for `useSignificantChangesOnly` Config option.  Will request Android locations **without the persistent foreground service**.  You will receive location updates only a few times per hour:

#### `useSignificantChangesOnly: true`:
![](https://dl.dropboxusercontent.com/s/wdl9e156myv5b34/useSignificantChangesOnly.png?dl=1)

#### `useSignificantChangesOnly: false`:
![](https://dl.dropboxusercontent.com/s/hcxby3sujqanv9q/useSignificantChangesOnly-false.png?dl=1)

- [Added] Android now implements a "stationary geofence", just like iOS.  It currently acts as a secondary triggering mechanism along with the current motion-activity API.  You will hear the "zap" sound effect when it triggers.  This also has the fortunate consequence of allowing mock-location apps (eg: Lockito) of being able to trigger tracking automatically.

- [Added] The SDK detects mock locations and skips trigging the `stopTimeout` system, improving location simulation workflow.
- [Added] Android-only Config option `geofenceModeHighAccuracy` for more control over geofence triggering responsiveness.  Runs a foreground-service during geofences-only mode (`#startGeofences`).  This will, of course, consume more power.
```dart
await BackgroundGeolocation.ready({
  geofenceModeHighAccuracy: true,
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
  locationUpdateInterval: 5000,
  distanceFilter: 50
));

BackgroundGeolocation.startGeofences();
```

#### `geofenceModeHighAccuracy: false` (Default)

- Transition events are delayed in favour of lower power consumption.

![](https://dl.dropboxusercontent.com/s/6nxbuersjcdqa8b/geofenceModeHighAccuracy-false.png?dl=1)

#### `geofenceModeHighAccuracy: true`

- Transition events are nearly instantaneous at the cost of higher power consumption.

![](https://dl.dropbox.com/s/w53hqn7f7n1ug1o/geofenceModeHighAccuracy-true.png?dl=1)

- [Added] Android implementation of `startBackgroundTask` / `stopBackgroundTask`.
```dart
  int taskId = await BackgroundGeolocation.startBackgroundTask();

  // Do any work you like -- it's guaranteed to run, regardless of background/terminated.
  // Your task has exactly 30s to do work before the service auto-stops itself.

  getDataFromServer('https://foo.bar.com').then((result) => {
    // Be sure to always signal completion of your taskId.
    BackgroundGeolocation.stopBackgroundTask(taskId);
  }).catch((error) => {
    // Be sure to always signal completion of your taskId.
    BackgroundGeolocation.stopBackgroundTask(taskId);
  });
```
Logging for Android background-tasks looks like this (when you see an hourglass, a foreground-service is active)
```
 [BackgroundTaskManager onStartJob] ⏳ startBackgroundTask: 6
 .
 .
 .
 [BackgroundTaskManager$Task stop] ⏳ stopBackgroundTask: 6
```
- [Added] New custom Android debug sound FX.  See the [Config.debug](https://transistorsoft.github.io/cordova-background-geolocation/interfaces/_cordova_background_geolocation_.config.html#debug) for a new decription of iOS / Android sound FX **including a media player to play each.**
![](https://dl.dropbox.com/s/zomejlm9egm1ujl/Screenshot%202019-03-26%2023.10.50.png?dl=1)

:warning: These debug sound FX consume about **1.4MB** in the plugin's `tslocationmanager.aar`.  These assets can easily be stripped in your `release` builds by adding the following gradle task to your `app/build.gradle` (I'm working on an automated solution within the context of the plugin's `build.gradle`; so far, no luck).  [Big thanks](https://github.com/transistorsoft/react-native-background-geolocation-android/issues/667#issuecomment-475928108) to @mikehardy.
```gradle
/**
 * Purge Background Geolocation debug sounds from release build.
 */
def purgeBackgroundGeolocationDebugResources(applicationVariants) {
    applicationVariants.all { variant ->
        if (variant.buildType.name == 'release') {
            variant.mergeResources.doLast {
                delete(fileTree(dir: variant.mergeResources.outputDir, includes: ['raw_tslocationmanager*']))

            }
        }
    }
}

android {
    //Remove debug sounds from BackgroundGeolocation plugin
    purgeBackgroundGeolocationDebugResources(applicationVariants)

    compileSdkVersion rootProject.ext.compileSdkVersion
    .
    .
    .
}
```

### Removed
- [Changed] Removed Android config option **`activityRecognitionInterval`** and **`minimumActivityRecognitionConfidence`**.  The addition of the new "stationary geofence" for Android should alleviate issues with poor devices failing to initiate tracking.  The Android SDK now uses the more modern [ActivityTransistionClient](https://medium.com/life360-engineering/beta-testing-googles-new-activity-transition-api-c9c418d4b553) API which is a higher level wrapper for the traditional [ActivityReconitionClient](https://developers.google.com/android/reference/com/google/android/gms/location/ActivityRecognitionClient).  `AcitvityTransitionClient` does not accept a polling `interval`, thus `actiivtyRecognitionInterval` is now unused.  Also, `ActivityTransitionClient` emits similar `on_foot`, `in_vehicle` events but no longer provides a `confidence`, thus `confidence` is now reported always as `100`.  If you've been implementing your own custom triggering logic based upon `confidence`, it's now pointless.  The `ActivityTransitionClient` will open doors for new features based upon transitions between activity states.

```
╔═════════════════════════════════════════════
║ Motion Transition Result
╠═════════════════════════════════════════════
╟─ 🔴  EXIT: walking
╟─ 🎾  ENTER: still
╚═════════════════════════════════════════════
```

### Maintenance
- [Changed] Update `android-permissions` dependency to `0.1.8`.

## [3.0.0-beta.5] - 2019-03-20
- [Fixed] Logic bugs in MotionActivity triggering between *stationary* / *moving* states.
- [Added] Android-only Config option `geofenceModeHighAccuracy` for more control over geofence triggering accuracy.  Runs a foreground-service during geofences-only mode (`#startGeofences`).
- [Added] Android implementation for `useSignificantChangesOnly` Config option.  Will request Android locations **without the persistent foreground service**.  You will receive location updates only a few times per hour.
- [Changed] Update `android-permissions` dependency to `0.1.8`.

## [3.0.0-beta.4] - 2019-03-02
- [Fixed] Android bug in Config dirty-fields mechanism.

## [3.0.0-beta.3] - 2019-03-02
- [Changed] Improve trackingMode state-changes between location -> geofences-only.
- [Changed] Improvements to geofences-only tracking.
- [Changed] Improvements to stationary-geofence monitoring, detecting mock locations to prevent stopTimeout triggering.

## [3.0.0-beta.2] - 2019-02-28
- [Changed] Tweaking stationary region monitoring.
- [Changed] Tweaking bad vendor detection to force stopTimeout timer when device is stationary for long periods and motion api hasn't respon
ded.

## [3.0.0-beta.1] - 2019-02-27
- [Changed] Major refactor of Android Service architecture.  The SDK no longer requires a foreground-service active at all times.  The foreground-service (and cooresponding persistent notification) will only be active while the SDK is in the *moving* state.  No breaking dart api changes.
- [Changed] Improved Android debug notifications.
- [Added] Added new Config options `persistMode` for specifying exactly which events get persisted: location | geofence | all | none.
- [Added] Experimental Android-only Config option `speedJumpFilter (default 300 meters/second)` for detecting location anomalies.  The plugin will measure the distance and apparent speed of the current location relative to last location.  If the apparent speed is > `speedJumpFilter`, the location will be ignored.  Some users, particularly in Australia, curiously, have had locations suddenly jump hundreds of kilometers away, into the ocean.
- [Changed] iOS and Android will not perform odometer updates when the calculated distance is less than the average accuracy of the current and previous location.  This is to prevent small odometer changes when the device is lingering around the same position.
- [Added] New `DeviceSettings` API for redirecting user to Android Settings screens, including vendor-specific screens (eg: Huawei, OnePlus, Xiaomi, etc).  This is an attempt to help direct the user to appropriate device-settings screens for poor Android vendors as detailed in the site [Don't kill my app](https://dontkillmyapp.com/).
- [Added] `schedule` can now be configured to optionally execute geofences-only mode (ie: `#startGeofences`) per schedule entry.  See `schedule` docs.
- [Changed] Upgrade to Gradle `implementation` mechanism instead of deprecated `compile`.
- [Changed] Android Service: Return `START_STICKY` instead of `START_REDELIVER_INTENT`.
- [Changed] Android: `setShowBadge(false)` on Android `NotificationChannel`.  Some users reporting that Android shows a badge-count on app icon when service is started / stopped.
- [Fixed] Android `extras` provided to `watchPosition` were not being appended to location data.
- [Fixed] Android NPE in `watchPosition`
- [Added] Added method `getProviderState` for querying current state of location-services.
- [Added] Added method `requestPermission` for manually requesting location-permission (`#start`, `#getCurrentPosition`, `#watchPosition` etc, will already automatically request permission.
- [Changed] Upgrade Android logger dependency to latest version (`logback`).
- [Fixed] Prevent Android foreground-service from auto-starting when location permission is revoked via Settings screen.
- [Fixed] NPE in Android HTTP Service when manual sync is called.  Probably a threading issue with multiple sync operations executed simultaneously.

## [2.14.2] 2018-11-22
- [Fixed] Typescript definitions not loading with Ionic 4.  Requires `"types":"./src/ionic/index.d.ts"` in `package.json`.

## [2.14.1] 2018-11-20
- [Added] Android SDK 28 requires new permission to use foreground-service.
- [Fixed] Do not calculate odometer with geofence events.  Android geofence event's location timestamp does not correspond with the actual time the geofence fires since Android is performing some heuristics in the background to ensure the potential geofence event is not a false positive.  The actual geofence event can fire some minutes in the future (ie: the location timestamp will be some minutues in the past).  Using geofence location in odometer calculations will corrupt the odometer value.
- [Fixed] Android could not dynamically update the `locationTemplate` / `geofenceTemplate` without `#stop` and application restart.
- [Fixed] Android `startGeofences` after revoking & re-granting permission would fail to launch the plugin's Service.
- [Fixed] iOS HTTP crash when using `batchSync: true`.  At application boot, there was a threading issue if the server returned an HTTP error, multiple instances of the HTTP service could run, causing a crash.

## [2.14.0] 2018-10-29
- [Fixed] Android `NullPointerException` on `WatchPositionCallback` with `watchPosition`.

## [2.14.0-beta.2] 2018-10-23
- [Breaking] Change signature of `#getCurrentPosition` method:  Options `{}` is now first argument rather than last:
- [iOS] Catch `NSInvalidArgumentException` when decoding `TSConfig`.

## [2.14.0-beta.1] 2018-10-19

- [Added] Implement Typescript API.  No more `let bgGeo = (<any>window).BackgroundGeolocation`!

```typescript
// Import the SDK in addition to any desired interfaces:
import BackgroundGeolocation, {
  State,
  Config,
  Location,
  LocationError,
  Geofence,
  HttpEvent,
  MotionActivityEvent,
  ProviderChangeEvent,
  MotionChangeEvent,
  GeofenceEvent,
  GeofencesChangeEvent,
  HeartbeatEvent,
  ConnectivityChangeEvent
} from "cordova-background-geolocation";

```

- [Added] Refactor documentation.  Now auto-generated from Typescript api with [Typedoc](https://typedoc.org/) and served from https://transistorsoft.github.io/cordova-background-geolocation
- [Added] With the new Typescript API, it's necessary to add dedicated listener-methods for each method (in order for code-assist to work).
```javascript
// Old:  No code-assist for event-signature with new Typescript API
BackgroundGeolocation.on('location', (location) => {}, (error) => {});
// New:  use dedicated listener-method #onLocation
BackgroundGeolocation.onLocation((location) => {}, (error) => {});
// And every other event:
BackgroundGeolocation.onMotionChange(callback);
BackgroundGeolocation.onMotionProviderChange(callback);
BackgroundGeolocation.onActivityChange(callback);
BackgroundGeolocation.onHttp(callback);
BackgroundGeolocation.onGeofence(callback);
BackgroundGeolocation.onGeofencesChange(callback);
BackgroundGeolocation.onSchedule(callback);
BackgroundGeolocation.onConnectivityChange(callback);
BackgroundGeolocation.onPowerSaveChange(callback);
BackgroundGeolocation.onEnabledChange(callback);
```
- [Breaking] Change event-signature of `enabledchange` event to return simple `boolean` instead of `{enabled: true}`:  It was pointless to return an `{}` for this event.
```javascript
// Old
BackgroundGeolocation.onEnabledChange((enabledChangeEvent) => {
  console.log('[enabledchange] -' enabledChangeEvent.enabled);
})
// New
BackgroundGeolocation.onEnabledChange((enabled) => {
  console.log('[enabledchange] -' enabled);
})
```
- [Breaking] Changed event-signature of `http` event.  There is no more `failure` callback -- HTTP failures will be provided to your single `callback`.
```
// Old
BackgroundGeolocation.on('http', (response) => {
  console.log('[http] success -', response);
}, (response) => {
  console.log('[http] FAILURE -', response);
})

// New
BackgroundGeolocation.onHttp((response) => {
  if (response.success) {
  	console.log('[http] success -', response);
  } else {
  	console.log('[http] FAILURE -', response);
  }
})
```

## [2.13.2] - 2018-10-01
- [Fixed] iOS was missing Firebase adapter hook for persisting geofences.
- [Changed] Android headless events are now posted with using `EventBus` instead of `JobScheduler`.  Events posted via Android `JobScheduler` are subject to time-slicing by the OS so events could arrive late.

## [2.13.1] - 2018-08-29
- [Fixed] iOS scheduler not being initialized in `#ready` after reboot.

## [2.13.0]
- [Added] New Android config-option `notificationChannelName` for configuring the notification-channel required by the foreground-service notification.  See *Settings->Apps & Notificaitions->Your App->App Notifications*.
- [Added] Support for new [Firebase Adapter](https://github.com/transistorsoft/cordova-background-geolocation-firebase)
- [Added] iOS support for HTTP method `PATCH` (Android already supports it).
- [Fixed] Android was not using `httpTimeout` with latest `okhttp3`.
- [Fixed] Android issue not firing `providerchange` on boot when configured with `stopOnTerminate: true`
- [Fixed] Android `headlessJobService` class could fail to be applied when upgrading from previous version.  Ensure always applied.
- [Fixed] Android `httpTimeout` was not being applied to new `okhttp3.Client#connectionTimeout`
- [Fixed] iOS `preventSuspend` was not working with `useSignificantChangesOnly`
- [Changed] iOS disable encryption on SQLite database file when "Data Protection" capability is enabled with `NSFileProtectionNone` so that plugin can continue to insert records while device is locked.

## [2.12.2] - 2018-05-25
- [Changed] Reduce required `cordova` version from `8.0.0` to `7.1.0`.
- [Fixed] iOS issue when plugin is booted in background in geofences-only mode, could engage location-tracking mode.
- [Fixed] Android `getCurrentPosition` was not respecting `persist: true` when executed in geofences-only mode.

## [2.12.1] - 2018-05-17
- [Fixed] iOS geofence exit was being ignored in a specific case where (1) geofence was configured with `notifyOnDwell: true` AND (2) the app was booted in the background *due to* a geofence exit event.

## [2.12.0] - 2018-05-16
- [Added] `cordova-android@7.0.0` support.  Cordova 8 is now required.  This is the same library versions for both iOS and Android as used in `2.11.0`.

## [2.11.0] - 2018-05-11
- [Fixed] Android bug where plugin could fail to translate iOS desiredAccuracy value to Android value, resulting in incorrect `desiredAccuracy` value for Android, probably defaulting to `DESIRED_ACCURACY_LOWEST`.
- [Fixed] iOS was not persiting odometer.
- [Fixed] iOS geofence exit event not being executed due to a condition where a stationary event occurs while geofence exit events are awaiting their location to be returned.

## [2.11.0-beta.3] - 2018-04-19
- [Added] iOS config `disableLocationAuthorizationAlert` for disabling automatic location-authorization alert when location-services are disabled or user changes toggles location access (eg: `Always` -> `WhenInUse`).
- [Fixed] Fixed issue executing `#getCurrentPosition` from Headless mode while plugin is current disabled.
- [Added] Add new iOS `locationAuthorizationRequest: "Any"` for allowing the plugin to operate in either `Always` or `WhenInUse` without being spammed by location-authorization dialog.

## [2.11.0-beta.1] - 2018-03-23
- [Fixed] iOS `stopAfterElapsedMinutes` was not being evaluated during `heartbeat` event.
- [Changed] Re-structure Android lib `tslocationmanager.aar` as a Maven repo.
- [Added] Added new initialization method `#ready`, desigend to replace `#configure` (which is now deprectated).  The new `#ready` method operates in the same manner as `#configure` with a crucial difference -- the plugin will only apply the supplied configuration `{}` at the first launch of your app &mdash; thereafter, it will automatically load the last-known config from persistent storage.
- [Added] Add new method `#reset` for resetting the plugin configuration to documented defaults.
- [Added] Refactor Javascript API to use Promises.  Only `#watchPosition` and adding event-listeners with `#on` will not use promises.
- [Fixed] iOS issue not turning of "keepAlive" system when `#stop` method is executed while stop-detection system is engaged.
- [Added] Android will fire `providerchange` event after the result of user location-authorization (accept/deny).  The result will be available in the `status` key of the event-object.
- [Changed] Refactor native configuration system for both iOS and Android with more traditional Obj-c / Java API.
- [Changed] Create improved Obj-c / Java APIs for location-requests (`#getCurrentPosition`, `#watchPosition`) and geofencing.
- [Added] Added new event `connectivitychange` for detecting network connectivity state-changes.
- [Added] Added new event `enabledchange`, fired with the plugin enabled state changes.  Executing `#start` / `#stop` will cause this event to fire.  This is primarily designed for use with `stopAfterElapsedMinutes`.

## [2.10.1] - 2018-02-04
- [Fixed] Android `enableHeadless: true`:  The plugin cannot include a default `BackgroundGeolocationHeadlessTask.java` with a `<source-file />` element, since adding plugin and platform on initial install places the `<resource-file />`  from application's `plugin.xml` first, causing the `cordova plugin add` to complain about an existing file `BackgroundGeolocationHeadlessTask.java`.  Have to not place the default source-file and use refelction instead.  This is unfortunate since removing the plugin won't remove the user's custom BackgroundGeolocationHeadlessTask.java from the src tree, causing compilation errors.  Simply removing / re-adding the android platform will solve this issue.

## [2.10.0] - 2018-02-03
- [Fixed] Guard usage of `powersavechange` event for iOS < 9
- [Added] Android permissions are now handled completely within `tslocationmanager` library rather than within Cordova Activity.
- [Fixed] iOS `emailLog` issues:  sanity check existence of email client, ensure we have reference to topMost `UIViewController`.
- [Added] New Android "Headless" mechanism allowing you provide a simple custom Java class to receive all events from the plugin when your app is terminated (with `stopOnTerminate: false`).  The headless mechanism is enabled with new `@config {Boolean} enableHeadless`.  See the Wiki "Headless Mode" for details.
- [Fixed] iOS `getCurrentPosition` was applying entire options `{}` as `extras`.
- [Fixed] iOS `watchPosition` / `getCurrentPosition` `@option persist` was being ignored when plugin was disabled (ie: `#stop`ped).
- [Fixed] Implement Android `JobScheduler` API for scheduler (where API_LEVEL) allows it.  Will fallback to existing `AlarmManager` implementation where API_LEVEL doesn't allow `JobScheduler`.  This fixes issues scheduler issues with strict new Android 8 background-operation rules.
- [Added] Added new Android `@config {Boolean} allowIdenticalLocations [false]` for overriding the default behaviour of ignoring locations which are identical to the last location.

## [2.9.1] - 2017-11-12
- [Fixed] Rare issue with iOS where **rapidly** toggling executing `start` with `changePace(true)` in the callback followed by `stop`, over and over again, would lock up the main thread.
- [Changed] Android `GEOFENCE_INITIAL_TRIGGER_DWELL` defaulted to `true`.
- [Fixed] `Proguard-Rules` were not ignoring the new `LogFileProvider` used for `#emailLog` method.
- [Fixed] Android issue on some device where callback to `#configure` would not be executed in certain cases.

## [2.9.0] - 2017-11-10
- [Fixed] Android NPE on `Settings.getForegroundService()` when using `foregroundService: false`
- [Fixed] Android 8 error with `emailLog`.  Crash due to `SecurityException` when writing the log-file.  Fixed by implementing `FileProvider` (storage permissions no longer necessary).
- [Fixed] iOS bug when providing non-string `#header` values.  Ensure casted to String.
- [Changed] Android minimum required play-services version is `11.2.0` (required for new `play-services` APis.  Anything less and plugin will crash.
- [Changed] Update Android to use new [`FusedLocationProviderClient`](https://developers.google.com/android/reference/com/google/android/gms/location/FusedLocationProviderClient) instead of now-deprectated `FusedLocationProviderAPI`.  It's the same underlying play-services location API -- just with a much simpler, less error-prone interface to implement.
- [Fixed] On Android, when `changePace(true)` is executed while device is currently `still` (and remains `still`), `stopTimeout` timer would never initiate until device movement is detected.
- [Fixed] iOS manual `#sync` was not executing *any* callback if database was empty.
- [Added] Expose Android variable `APPCOMPAT_VERSION` allowing customization of the plugin's required dependency `com.android.support:appcompat-v7` (default `27.0.0`).  This dependency is required for Android 8 API support.
- [Added] Implement new Android 8 `NotificationChannel` which is now required for displaying the `foregroundService` notification.
- [Added] New Android `<variable name="GOOGLE_API_VERSION" />` in `config.xml`.  This new `<variable />` is only possible to use in Cordova version `>= 7.1.0`.  This new variable helps to solve the old problem when multiple plugins require `play-services` of a different version, causing build failures.  The `GOOGLE_API_VERSION` allows you to configure the `play-services-location` version to align with the version used by other plugins (eg: `cordova-plugin-googlemaps`, `phonegap-plugin-push`, etc).
- [Added] Android foreground-service notification now uses `id: 9942585`.  If you wish to interact with the foreground-service notification in native code, this is the `id`.
- [Fixed] iOS not always firing location `failure` callback.
- [Fixed] iOS was not forcing an HTTP flush on `motionchange` event when `autoSyncThreshold` was used.
- [Fixed] iOS Add sanity-check for Settings `boolean` type.  It was possible to corrupt the Settings when a `boolean`-type setting was provided with a non-boolean value (eg: `{}`, `[]`).
- [Fixed] Android `getState` could cause an NPE if executed before `#configure`.
- [Fixed] Work around iOS 11 bug with `CLLocationManager#stopMonitoringSignificantLocationChanges` (SLC):  When this method is called upon *any* single `CLLocationManager` instance, it would cause *all* instances to `#stopMonitoringSignificantLocationChanges`.  This caused problems with Scheduler evaluation, since SLC is required to periodically evaluate the schedule.

## [2.8.5] - 2017-09-25
- [Added] Build for iOS 11, XCode 9.
- [Added] Implement new `powersavechange` event in addition to `isPowerSaveMode` method for determining if OS "Power saving" mode is enabled.
- [Added] New config `elasticityMultiplier` for controlling the scale of `distanceFilter` elasticity calculation.
- [Fixed] Android bug not firing `schedule` Javascript listeners
- [Fixed] Android crash `onGooglePlayServicesConnectError` when Google Play Services needs to be updated on device.

## [2.8.4] - 2017-09-15
- [Changed] Refactor Android `onDestroy` mechanism attempting to solve nagging and un-reproducible null pointer exceptions.
- [Fixed] Fixed bug not where `stopAfterElapsedMinutes` is not evaluated when executing `#getCurrentPosition`.
- [Fixed] Modifications for Android O.  For now, `foregroundService: true` will be enforced when running on Android O (api 26).

## [2.8.3] - 2017-08-28
- [Fixed] Android `stopOnTerminate` was not setting the `enabled` value to `false` when terminated.  This caused the plugin to automatically `#start` the first time the app was booted (it would work correctly every boot thereafter).
- [Changed] iOS `motionchange` position will be fetch by `CLLocationManager#startUpdatingLocation` rather than `#requestLocation`, since `#requestLocation` cannot keep the app alive in the background.  This could cause the app to be suspended when `motionchange` position was requested due to a background-fetch event.
- [Changed] Change Android HTTP layer to use more modern library `OkHttp3` instead of `Volley`.  Some users reported weird issues with some devices on some servers.  `OkHttp` seems to have solved it for them.  `OkHttp` is a much simpler library to use than `Volley`
- [Changed] `play-services-location` dependency pinned to `:11.+` instead of `:+` in order to prevent build-issues with plugin's using Google's `fcm`.  I've created a new plugin to solve Google API conflicts (eg: `play-services`): [`cordova-google-api-version`](https://github.com/transistorsoft/cordova-google-api-version)

## [2.8.2] - 2017-08-21
- [Changed] Reference latest `cordova-plugin-background-fetch` version `5.0.0`
- [Added] Javascript API to plugin's logging system.
- [Fixed] Minor issue with iOS flush where multiple threads might create multiple background-tasks, leaving some unfinished.

## [2.8.0] - 2017-08-15
- [Changed] Refactor iOS/Android core library event-subscription API.
- [Changed] Removed `taskId` supplied to all event-callbacks.  You no longer have to call `bgGeo.finish(taskId)` in your event-callbacks (though the method will still operate as a `noop` for backwards compatibility).  You will now be responsible for creating your own iOS background-tasks using the method `#startBackgroundTask` when performing long-running tasks in your event-callbacks.
- [Added] iOS and Android now support ability to remove single event-listeners with method `#un`

## [2.7.6] - 2017-07-27
- [Changed] Remove dependency `cordova-plugin-dialogs`.  It's not required.
- [Changed] Improve iOS/Android acquisition of `motionchange` location to ensure a recent location is fetched.
- [Changed] Implement `#getSensors` method for both iOS & Android.  Returns an object indicating the presense of *accelerometer*, *gyroscope* and *magnetometer*.  If any of these sensors are missing, the motion-detection system for that device will poor.
- [Changed] The `activitychange` success callback method signature has been changed from `{String} activityName` -> `{Object}` containing both `activityName` as well as `confidence`.  This event only used to fire after the `activityName` changed (eg: `on_foot` -> `in_vehicle`), regardless of `confidence`.  This event will now fire for *any* change in activity, including `confidence` changes.
- [Changed] iOS `emailLog` will gzip the attached log file.
- [Added] Implement new Android config `notificationPriority` for controlling the behaviour of the `foregroundService` notification and notification-bar icon.
- [Fixed] Android was creating a foreground notification even when `foregroundService: false`
- [Changed] Tweak iOS Location Authorization to not show locationAuthorizationAlert if user initially denies location permission.
- [Fixed] Android:  Remove isMoving condition from geofence proximity evaluator.
- [Fixed] iOS 11 fix:  Added new location-authorization string `NSLocationAlwaysAndWhenInUseUsageDescription`.  iOS 11 now requires location-authorization popup to allow user to select either `Always` or `WhenInUse`.

## [2.7.4] - 2017-07-10
- [Fixed] Android & iOS will ensure old location samples are ignored with `getCurrentPosition`
- [Fixed] Android `providerchange` event would continue to persist a providerchange location even when plugin was disabled for the case where location-services is disabled by user.
- [Fixed] Don't mutate iOS `url` to lowercase.  Just lowercase the comparison when checking for `301` redirects.
- [Changed] Android will attempt up to 5 motionchange samples instead of 3.
- [Changed] Android foregroundService notification priority set to `PRIORITY_MIN` so that notification doesn't always appear on top.
- [Fixed] Android plugin was not nullifying the odometer reference location when `#stop` method is executed, resulting in erroneous odometer calculations if plugin was stopped, moved some distance then started again.
- [Added] Android plugin will detect presense of Sensors `ACCELEROMETER`, `GYROSCOPE`, `MAGNETOMETER` and `SIGNIFICANT_MOTION`.  If any of these sensors are missing, the Android `ActivityRecognitionAPI` is considered non-optimal and plugin will add extra intelligence to assist determining when device is moving.
- [Fixed] Bug in broadcast event `GEOFENCE` not being fired when `MainActivity` is terminated (only applies to those using a `BroadcastReceiver`).
- [Fixed] Android scheduler issue when device is rebooted and plugin is currently within a scheduled ON period (fails to start)
- [Fixed] (Android) Fix error calling `stopWatchPosition` before `#configure` callback has executed.  Also add support for executing `#getCurrentPosition` before `#configure` callback has fired.
- [Added] (Android) Listen to LocationResult while stopTimeout is engaged and perform manual motion-detection by checking if location distance from stoppedAtLocation is > stationaryRadius
- [Fixed] Bug in literal schedule parsing for both iOS and Android
- [Fixed] Bug in Android scheduler after app terminated.  Configured schedules were not having their `onTime` and `offTime` zeroed, resulting in incorrect time comparison.

## [2.7.3] - 2017-06-15
- [Fixed] Bug in Android scheduler after app terminated.  Configured schedules were not having their `SECOND` and `MILLISECOND` zeroed resulting in incorrect time comparison.

## [2.7.2] - 2017-06-14
- [Added] New config `stopOnStationary` for both iOS and Android.  Allows you to automatically `#stop` tracking when the `stopTimeout` timer elapses.
- [Added] Support for configuring the "Large Icon" (`notificationLargeIcon`) on Android `foregroundService` notification.  `notificationIcon` has now been aliased -> `notificationSmallIcon`.
- [Fixed] iOS timing issue when fetching `motionchange` position after initial `#start` -- since the significant-location-changes API (SLC) is engaged in the `#stop` method and eagerly returns a location ASAP, that first SLC location could sometimes be several minutes old and come from cell-tower triangulation (ie: ~1000m accuracy).  The plugin could mistakenly capture this location as the `motionchange` location instead of waiting for the highest possible accuracy location that was requested.  SLC API will be engaged only after the `motionchange` location has been received.
- [Fixed] On Android, when adding a *massive* number of geofences (ie: *thousands*), it can take several minutes to perform all `INSERT` queries.  There was a threading issue which could cause the main-thread to be blocked while waiting for the database lock from the geofence queries to be released, resulting in an ANR (app isn't responding) warning.
- [Changed] Changing the Android foreground-service notification is now supported (you no longer need to `#stop` / `#start` the plugin for changes to take effect).
- [Fixed] Improved Android handling of simultaneous `#getCurrentPosition`, `#start`, `#configure` requests when location-services are not yet authorized by the user (the plugin will buffer all these requests and execute them in order once location-services are authorized).
- [Added] New config option `httpTimeout` (milliseconds) for configuring the timeout where the plugin will give up on sending an HTTP request.
- [Fixed] When iOS engages the `stopTimeout` timer, the OS will pause background-execution if there's no work being performed, in spite of `startBackgroundTask`, preventing the `stopTimeout` timer from running.  iOS will now keep location updates running at minimum accuracy during `stopTimeout` to prevent this.
- [Fixed] Ensure iOS background "location" capability is enabled before asking `CLLocationManager` to `setBackgroundLocationEnabled`.
- [Added] Implement ability to provide literal dates to schedule (eg: `2017-06-01 09:00-17:00`)
- [Added] When Android motion-activity handler detects `stopTimeout` has expired, it will initiate a `motionchange` without waiting for the `stopTimeout` timer to expire (there were cases where the `stopTimeout` timer could be delayed from firing due likely to vendor-based battery-saving software)
- [Fixed] Android `emailLog` method was using old `adb logcat` method of fetching logs rather than fetching from `#getLog`

## [2.7.1] - 2017-05-12
- [Fixed] iOS has a new hook to execute an HTTP flush when network reachability is detected.  However, it was not checking if `autoSync: true` or state of `autoSyncThreshold`.

## [2.7.0] - 2017-05-08
- [Added] When iOS detects a network connection with `autoSync: true`, an HTTP flush will be initiated.
- [Fixed] Improve switching between tracking-mode location and geofence.  It's not necessary to call `#stop` before executing `#start` / `#startGeofences`.
- [Fixed] iOS issue with `cordova-plugin-cocoalumberjack` dependency issue with Cordova 7.0:  plugin version (should be `~0.0.2`, not `^0.0.2`)
- [Fixed] iOS `maximumAge` with `getCurrentPosition` wasn't clearing the callbacks when current-location-age was `<= maximumAge`
- [Fixed] iOS when `#stop` is executed, nullify the odometer reference location.
- [Fixed] iOS issue with `preventSuspend: true`:  When a `motionchange` event with `is_moving: false` occurred, the event was incorrectly set to `heartbeat` instead of `motionchange`.
- [Fixed] Android null pointer exception when using `startOnBoot: true, forceReloadOnBoot: true`:  there was a case where last known location failed to return a location.  The lib will check for null location in this case.
- [Changed] iOS minimum version is now `8.4`.  Plugin will log an error when used on versions of iOS that don't implement the method `CLLocationManager#requestLocation`
- [Fixed] iOS bug executing `#setConfig` multiple times too quickly can crash the plugin when multiple threads attempt to modify an `NSMutableDictionary`
- [Fixed] Android was rounding `battery_level` to 1 decimal place
- [Fixed] iOS geofences-only mode was not using significant-location-change events to evaluate geofences within proximity.
- [Changed] iOS now uses `CLLocationManager requestLocation` to request the `motionchange` position, rather than counting samples.  This is a more robust way to get a single location
- [Fixed] iOS crash when providing `null` values in `Object` config options (ie: `#extras`, `#params`, `#headers`, etc)
- [Added] New config param `locationsOrderDirection [ASC|DESC]` for controlling the order that locations are selected from the database (and syned to your server)
- [Added] iOS now supports geofence `DWELL` with `loiteringDelay` with my own custom implementation, just as Android does natively.
- [Fixed] iOS was creating `backgroundTask` in `location` listener even if no listeners were registered, resulting in growing list of background-tasks which would eventually be `FORCE KILLED`.

## [2.6.0] - 2017-03-10
- [Fixed] iOS bug when composing geofence data for peristence.  Sometimes it appended a `location.geofence.location` due to a shared `NSDictionary`
- [Fixed] Android issue with applying default settings the first time an app boots.  If you execute `#getState` before `#configure` is called, `#getState` would return an empty `{}`.
- [Changed] The licensing model of Android now enforces license only for **release** builds.  If an invalid license is configured while runningin **debug** mode, a Toast warning will appear **"BackgroundGeolocation is running in evaluation mode."**, but the plugin *will* work.
- [Fixed] iOS bug with HTTP `401` handling.
- [Added] The Android plugin now broadcasts all its events using the Android `BroadcastReceiver` mechanism.  You're free to implement your own native Android handler to receive and react to these events as you wish.

## [2.5.3] - 2017-03-01
- [Changed] Refactor Android settings-management.  Plugin will always load previously known state as soon as plugin comes alive.  `#configure` will reset all settings to default before applying supplied `{Config}`.
- [Fixed] Android database migration issue when upgrading from a very old version missed `geofences` table migration.

## [2.5.1] - 2017-02-26
- [Changed] Refactor iOS settings-management.  Plugin will always load previously known state as soon as plugin comes alive.  `#configure` will reset all settings to default before applying supplied `{Config}`.
- [Fixed] iOS Schedule evaluation edge-case when a current-schedule is referenced but expired: When evaulating, always check if current-schedule is expired; query for next if so.
- [Fixed] GeofenceManager edge-case:  GeofenceManager should not receive current location when plugin is disabled (eg: executing `#getCurrentPosition` when plugin is disabled).
- [Fixed] `geofence` event not passing configured geofence `#extras`.
- [Changed] Removed `taskId` from `geofence` event callback.  This change is backwards compatible.  If you want to do a long-running task, create your own `bgTask` with `#startBackgroundTask` (the plan is to remove `taskId` from **all** callbacks. Eg:

```javascript
bgGeo.on('geofence', function(geofence) {  // <-- taskId no longer provided!
  // Start your own bgTask:
  bgGeo.startBackgroundTask(function(taskId) {
    performLongRunningTask(function() {
      bgGeo.finish(taskId);
    });
  });
});
```

## [2.5.0] - 2017-02-22
- [Fixed] iOS geofence identifiers containing ":" character were split and only the last chunk returned.  The plugin itself prefixes all geofences it creates with the string `TSGeofenceManager:` and the string-splitter was too naive.  Uses a `RegExp` replace to clear the plugin's internal prefix.
- [Changed] Refactored API Documentation
- [Added] HTTP JSON template features.  See [HTTP Features](./docs/http.md).  You can now template your entire JSON request data sent to the server by the plugin's HTTP layer.

## [2.4.0] - 2017-02-08
- [Changed] **BREAKING** I've *finally* figured out how to configure a number of key variables required by the plugin within your `config.xml` file, namely the `NSLocationAlwaysUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSMotionUsageDescription`.  The plugin now requires a `<plugin />` config within your `config.xml`.  **BREAKING:** With the introduction of this new config mechanism, I decided to use this also for the Android `license` config.  You will no longer provide the `<parameter name="cordova-background-geolocation-license" />`.  See the [README](https://github.com/transistorsoft/cordova-background-geolocation/tree/config-xml-variables#configuring-the-plugin) for details.

```xml
<widget id="com.your.company.app.id">
  <plugin name="cordova-background-geolocation" spec="^2.4.0">
    <variable name="LOCATION_ALWAYS_USAGE_DESCRIPTION" value="Background location-tracking is required" />
    <variable name="LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION" value="Background location-tracking is required" />
    <variable name="MOTION_USAGE_DESCRIPTION" value="Using the accelerometer increases battery-efficiency by intelligently toggling location-tracking only when the device is detected to be moving" />
  </plugin>
```
- [Fixed] Migrate Android `providerchange` mechanism out of the `Service` (which only runs when the plugin is `#start`ed) to a place where it will be monitored all the time, regardless if the plugin is enabled or not.
- [Fixed] Catch `IllegalStateException` reported when using `#getLog`
- [Changed] With new Android "Doze-mode", override "idle" on `stopTimeout` and `schedule` alarms
- [Changed] Tweak iOS accelerometer-only motion-detection system.
- [Fixed] Location-authorization alert being popped up after a `suspend` event because the plugin always attempts to ensure it has a stationary-region here.  Simply check current authorization-status is not == `Denied`.
- [Fixed] iOS Location Authorization alert is shown multiple time.  Also discovered a bug where the `providerchange` `enabled` value was calculated based upon hard-coded `Always` where it should have compared to the configured `locationAuthorizationRequest`.
- [Added] If plugin's `#stop` method is called, the Location Authorization Alert will be hidden (if currently visible).

## [2.3.0] - 2017-01-09
- [Fixed] Locale issue when formatting Floats.  Some locale use "," as decimal separator.  Force Locale -> US when performing rounding.  Proper locale will be applied during the JSON encoding.
- [Added] Ability to provide optional arbitrary meta-data `extras` on geofences.
- [Changed] Location parameters `heading`, `accuracy`, `odometer`, `speed`, `altitude`, `altitudeAccuracy` are now fixed at 2 decimal places.
- [Fixed] Bug reported with `EventBus already registered` error.  Found a few cases where `EventBus.isRegistered` was not being used.
- [Added] Android will attempt to auto-sync on heartbeat events.
- [Changed] permission `android.hardware.location.gps" **android:required="false"**`
- [Added] Implement `IntentFilter` to capture `MY_PACKAGE_REPLACED`, broadcast when user upgrades the app.  If you've configured `startOnBoot: true, stopOnTerminate: false` and optionally `foreceRelaodOnBoot: true`, the plugin will automatically restart when user upgrades the app.
- [Changed] When adding a geofence (either `#addGeofence` or `#addGeofences`), if a geofence already exists with the provided `identifier`, the plugin will first destroy the existing one before creating the new one.
- [Changed] When iOS Scheduler is engaged and a scheduled OFF event occurs, the plugin will continue to monitor significant-changes, since background-fetch events alone cannot be counted on.  This will guarantee the plugin evaluates the schedule each time the device moves ~ 1km.  This will have little impact on power consumption, since these sig.change events will not be persisted or `POST`ed, nor will they even be provided to Javascript.
- [Changed] Android Scheduler will `setExact` Alarm triggers (only works for API `>= KITKAT` or if OEM's OS doesn't override it (ie: Samsung)).
- [Fixed] iOS Scheduler was not listening to `BackgroundFetch` events while plugin was disabled, preventing schedule evaluation from fetch-events (user would have to open the app for scheduler to evaluate).
- [Fixed] `stopWatchPostion` callbacks not being called.
- [Fixed] Use more precise Alarm mechanism for `stopTimeout`
- [Fixed] Improve odometer accuracy.  Introduce `desiredOdometerAccuracy` for setting a threshold of location accuracy for calculating odometer.  Any location having `accuracy > desiredOdometerAccuracy` will not be used for odometer calculation.
- [Fixed] When configured with a schedule, the Schedule parser wasn't ordering the schedule entries by start-time.
- [Fixed] Had a report of null-pointer exception when processing an HTTP error response.  I could not reproduce the issue but find a case where accessing a `String` could produce a NPE.
- [Changed] Add ability to set odometer to any arbitrary value.  Before, odometer could only be reset to `0` via `resetOdometer`.  The plugin now uses `setOdometer(Float, successFn, failureFn`.  `resetOdometer` is now just an alias for `setOdometer(0)`.  `setOdometer` will now internally perform a `#getCurrentPosition`, so it can know the exact location where the odometer was set at.  As a result, using `#setOdometer` is exactly like performing a `#getCurrentPosition` and the `success` / `failure` callbacks use the same method-signature, where the `success` callback is provided the `location`.
- [Added] Added ability to create your own arbitrary **background tasks** with new `#startBackgroundTask` method.  Some of the plugin's methods receive a `taskId` which you've had to call `bgGeo.finish(taskId)` upon.  These automatically created `taskId` will soon be removed.  It will be **up to you** to create your own as desired, when you need to perform any long-running task in any of the plugin's callbacks.  `#finish` operates in the same manner as before.

## [2.2.0] - 2016-11-21
- [Fixed] Bug with Android geofences not posting `event: geofence` and the actual `geofence` data was missing (The data sent to Javascript callback was ok, just the data sent to HTTP.
- [Fixed] Logic bug in `TSGeofenceManager`; was not performing geospatial query when changing state from **MOVING -> STATIONARY**.
- [Added] Geofences-only mode for both iOS and Android **BETA**.  Start geofences-only mode with method `#startGeofences`.
- [Changed] Add some intelligence to iOS motion-detection system:  Use a Timer of `activityRecognitionInterval` seconds before engaging location-services after motion is detected.  This helps to reduce false-positives, particularly when using `preventSuspend` while walking around one's house or office.
- [Changed] Add more intelligence to iOS motion-detection system:  The plugin will be **eager** to engage the stop-detection, as soon as it detects `still`, regardless of confidence.  When the plugin is currently in the **moving** state and detects `still`, it will engage a timer of `activityRecognitionInterval` milliseconds -- when this timer expires and the motion-detector still reports `still`, the stop-detection system will be engaged.  If any *moving* type activity occurs during this time, the timer will be cancelled.
- [Fixed] Bug in Android Scheduler, failing to `startOnBoot`.
- [Added] `#removeListeners` method.  Removes all listeners registered with plugin via `#on` method.
- [Changed] With `preventSuspend: true`, the plugin will no longer immediately engage location-services as soon as it sees a "moving"-type motion-activity:  it will now calculate if the current position is beyond stationary geofence. This helps reduce false-positives engaging location-services while simply walking around one's home or office.
- [Fixed] iOS `batchSync`: When only 1 record in batch, iOS fails to pack the records in a JSON `location: []`, appending to a `location: {}` instead.
- [Fixed] Android was only handling the first geofence event when multiple geofences fire simultaneously.
- [Changed] The plugin will ignore `autoSyncThreshold` when a `motionchange` event occurs.
- [Fixed] Fixed ui-blocking issue when plugin boots with locations in its database with `autoSync: true`.  Found a case where the plugin was executing HTTP Service on the UI thread.
- [Fixed] Return current `state {Object}` in callback to `setConfig`
- [Fixed] iOS Scheduler puked when provided with a `null` or `[]` schedule.
- [Changed] iOS Scheduler behaviour changed to match Android, where `#stopSchedule` does **not** execute `#stop` on the plugin itself.
- [Fixed] FMDB [has issues](https://github.com/ccgus/fmdb/pull/180) binding array arguments (eg: DELETE FROM locations WHERE id IN(?)).  Solution is to simply compose the query string with concatenation.  Sanitization isn't required here anyway, since the ids come directly from my own query.
- [Changed] Extract `CococaLumberjack` static-libary from compiled binary TSLocationManager.  It causes problems if other libs also use this dependency.  Extracted CocoaLumberjack to its own distinct plugin `cordova-plugin-cocoalumberjack`, which background-geolocation installs as a dependency.  This change should be completely transparent.
- [Changed] Introduce database-logging for Android with [logback-android](https://github.com/tony19/logback-android).  Same API as iOS
- [Fixed] iOS geofencing issue where multiple geofences trigger simultaneously, only the last geofence event would be transmitted to the client and persisted to database.
- [Fixed] Remove iOS motion-activity-based filtering of locations.  If a location was recorded while the motion-recognition system said the device was `still`, the location was ignored.
- [Changed] Implemented ability for iOS to trigger a geofence `ENTER` event immediately when device is already inside the geofence (Android has always done this).  This behaviour can be controlled with the new config `@param {Boolean} geofenceInitialTriggerEntry [true]`.  This behaviour defaults to `true`.
- [Changed] Android will filter-out received locations detected to be same-as-last by comparing `latitude`, `longitude`, `speed` & `bearing`.
- [Fixed] Bug in `stopDetectionDelay` logic
- [Fixed] Geofencing transistion event logging wouldn't occur when configured for `debug: false`
- [Fixed] Bug in Android geofencing
- [Changed] Refactor iOS Logging system to use popular CocoaLumberjack library.  iOS logs are now stored in the database!  By default, logs are stored for 3 days, but is configurable with `logMaxDays`.  Logs can now be filtered by logLevel:

| logLevel | Label |
|---|---|
|`0`|`LOG_LEVEL_OFF`|
|`1`|`LOG_LEVEL_ERROR`|
|`2`|`LOG_LEVEL_WARNING`|
|`3`|`LOG_LEVEL_INFO`|
|`4`|`LOG_LEVEL_DEBUG`|
|`5`|`LOG_LEVEL_VERBOSE`|

`#getLog`, `#emailLog` operate in the same manner as before.
- [Fixed] If user declines "Motion Activity" permission, plugin failed to detect this authorization failure and fallback to the accelerometer-based motion-detection system.
- [Changed] Refactored Geolocation system.  The plugin is no longer bound by native platform limits on number of geofences which can be monitored (iOS: 20; Android: 100).  You may now monitor infinite geofences.  The plugin now stores geofences in its SQLite db and performs a geospatial query, activating only those geofences in proximity of the device (@config #geofenceProximityRadius, @event `geofenceschange`).  See the new [Geofencing Guide](./docs/geofencing.md)

## [2.0.13] - 2016-09-25
- [Fixed] Bug in prevent-suspend where background-fetch operation, when booting app in background, left plugin in preventSuspend mode when not configured to do so

## [2.0.12] - 2016-09-25
- [Fixed] Bug in prevent-suspend where background-fetch operation caused plugin to be left in preventSuspend mode when not configured to do do

## [2.0.11] - 2016-09-22
- [Fixed] Bug in prevent-suspend where the plugin failed to re-start its prevent-suspend timer if no MotionActivity event occurred during that interval.  Prevent-suspend system should now operate completely independently of MotionDetector.
- [Fixed] `#stop` method wasn't calling `stopMonitoringSignificantChanges`, resulting in location-services icon failing to toggle OFF.  Fixes issue #908

## [2.10.0] - 2016-09-22
- [Fixed] Issue where iOS crashes when configured with null url.
- [Added] `#watchPosition`, `#stopWatchPosition` mechanism for both iOS & Android
- [Changed] Refactored iOS motion-detection system.  Improved iOS motion-triggering when using `CMMotionActivityManager` (ie: when not using `disableMotionActivityUpdates: true`).  iOS can now trigger out of stationary-mode just like android, where it sees a 'moving-type' motion-activity (eg: 'on_foot', 'in_vehicle', etc).  Note: this will still occur only when your app isn't suspended (eg: app is in foreground, `preventSuspend: true`, or `#watchPosition` is engaged).
- [Changed] Refactored iOS "prevent suspend" system to be more robust.
- [Fixed] iOS locations sent to Javascript client had a different `uuid` than the one persisted to database (and synced to server).
-[Added] new iOS 10 .plist required key for accelerometer updates `NSMmotionUsageDescription` to `config.xml`
- [Added] New required android permission `<uses-feature android:name="android.hardware.location.gps" />`.

## [2.0.9] - 2016-08-17
- [Fixed] Issue #804, null pointer exeception on mGoogleApiClient
- [Fixed] Issue #806.  PlayServices connect error event was fired before listeners arrive; Dialog to fix problem was never shown.
- [Changed] Removed `app-compat` from Gradle dependencies.
- [Changed] Fire http error callback when HTTP request is not 200ish (ie: 200, 201, 204).  Fixes issue #819.  Contradicts #774.
- [Changed] Remove `play-services:app-compat-v7` from Gradle dependencies
- [Fixed] Android heartbeat location wasn't having its meta-data updated (ie: `event: 'heartbeat', battery:<current-data>, uuid: <new uuid>`)
- [Changed] Reduce Android `minimumActivityRecognitionConfidence` default from `80` to `75` (issue #825)
- [Changed] Android will ask for location-permission when `#configure` is executed, rather than waiting for `#start`.
- [Changeed] Android will catch `java.lang.SecurityException` when attempting to request location-updates without "Location Permission"
- [Fixed] `removeGeofences` was removing stationary-region.  This would prevent stationary-exit if called while device is in stationary-mode

## [2.0.7] - 2016-08-08
- [Fixed] Fixed parse error in Scheduler.

## [2.0.6] - 2016-08-06
- [Changed] Implement latest `cordova-plugin-background-fetch` dependency v4.0.0.
- [Changed] Execute HTTP sync on background-fetch event

## [2.0.5] - 2016-08-01
- [Fixed] Android `addGeofences` error
- [Fixed] iOS setting `method` not being respected (was always doing `POST`).  Issue #770

## [2.0.4] - 2016-07-28
- [Changed] Disable start-detection system when no accelerometer detected (ie: running in Simulator)
- [Changed] Improve iOS location-authorization system.  Show an alert if user changes location-authorization state (eg: 'Always' -> 'When in use') or disables location-services.  Alert directs user to [Settings] screen.  Add new config param `#locationAuthorizationAlert`, allowing you to configure all the text-strings on Alert popup.
- [Fixed] Incorrect Android binary uploaded in previous version

## [2.0.3] - 2016-07-27
- Disable start-detection system when no accelerometer detected (ie: running in Simulator)

## [2.0.2] - 2016-07-26
- Fix bugs with Android

## [2.0.1] - 2016-07-23
- Fix bugs with Android

## [2.0.0] - 2016-07.22
- Implement new event `providerchange` allowing you to listen to Location-services change events (eg: user turns off GPS, user turns off location services).  Whenever a `providerchange` event occurs, the plugin will automatically fetch the current position and persist the location adding the event: "providerchange" as well as append the provider state-object to the location.
- [Added] New event `activitychange` for listening to changes from the Activit Recognition system.  See **Events** section in API docs for details.  Fixes issue #703.
- [Added] new `#event` type `heartbeat` added to `location` params (`#is_heartbeat` is **@deprecated**).
- [Changed] `Scheduler` will use `Locale.US` in its Calendar operations, such that the days-of-week correspond to Sunday=1..Saturday=7.  Fixes issue #659
- [Changed] Refactor odometer calculation for both iOS and Android.  No longer filters out locations based upon average location accuracy of previous 10 locations; instead, it will only use the current location for odometer calculation if it has accuracy < 100.
- [Fixed] When enabling iOS battery-state monitoring, use setter method `setBatteryMonitoringEnabled` rather than setting property.  This seems to have changed with latest iOS
- [Added] Implement the new `#getCurrentPosition` options `#samples` and `#desiredAccuracy` for iOS.

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
