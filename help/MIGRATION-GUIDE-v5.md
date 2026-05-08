# 🚀 Migration Guide: Flat Config → Compound Config

> [!IMPORTANT]
> **Version:** 5.0.0 — Applies to `cordova-background-geolocation-lt` v5.0.0 and above


## 📢 Overview

Version 5 introduces two important changes:

1. A new **JWT-based License Key** format that encodes add-on product entitlements (eg: [`polygon-geofencing`](https://shop.transistorsoft.com/collections/frontpage/products/polygon-geofencing), `firebase`) — separate add-on keys are no longer required.
2. A new **Compound Config** format that replaces the legacy "flat" config structure.

This guide explains both changes and how to migrate your app.

## 🔑 New License Key Format

### Overview

Version 5 uses a new **JWT-based license key** format. Your existing (legacy) license keys will **not** work with v5.

> [!IMPORTANT]
> Previous versions of the SDK did not require a license key on iOS. **v5 requires a license key on both iOS and Android.** See [Setup](https://docs.transistorsoft.com/cordova/setup/) for license key configuration details.

> [!NOTE]
> Add-on products (eg: [`polygon-geofencing`](https://shop.transistorsoft.com/collections/frontpage/products/polygon-geofencing), `firebase`) are now **encoded as entitlements** inside the JWT key itself. You no longer need separate license keys for add-on products.

### Getting Your New License Key

1. Log in to the [Transistor Software Customer Dashboard](https://www.transistorsoft.com/shop/customers).
2. Navigate to your product purchase.
3. You will find **two license tabs**:
   - **Legacy** — your old license key (for `cordova-background-geolocation-lt` v4 and below)
   - **New** — your new JWT license key (required for `cordova-background-geolocation-lt` v5+)
4. Copy the key from the **"New"** tab.

### Applying Your License Key

Both license keys are configured in your project's `config.xml`.

__[iOS]__ Add your JWT license key using a `<config-file>` element inside `<platform name="ios">`:

:open_file_folder: `config.xml`
```xml
<platform name="ios">
    <config-file parent="TSLocationManagerLicense" target="*-Info.plist">
        <string>YOUR_JWT_LICENSE_KEY</string>
    </config-file>
</platform>
```

__[Android]__ First, ensure the `xmlns:android` namespace is declared on your root `<widget>` element:

```diff
<widget
  id="com.foo.bar"
  version="1.0.0"
  xmlns="http://www.w3.org/ns/widgets"
+ xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:cdv="http://cordova.apache.org/ns/1.0">
```

Then add your JWT license key using a `<config-file>` element inside `<platform name="android">`:

:open_file_folder: `config.xml`
```xml
<platform name="android">
    <config-file parent="/manifest/application" target="app/src/main/AndroidManifest.xml">
        <meta-data
            android:name="com.transistorsoft.locationmanager.license"
            android:value="YOUR_JWT_LICENSE_KEY" />
    </config-file>
</platform>
```

> [!WARNING]
> If you previously configured a separate license key for [`polygon-geofencing`](https://shop.transistorsoft.com/collections/frontpage/products/polygon-geofencing), `firebase`, or any other add-on product, **remove it**. Add-on entitlements are now bundled into your single bgGeo JWT license key.


## ⚙️ Compatibility

The legacy **flat config** style remains fully supported for backward compatibility.
You can continue using your existing flat configuration if you prefer, though new features may only appear in the compound structure.

> [!TIP]
> New apps and major refactors should migrate to the compound config to stay aligned with the native SDKs and shared type system.


## ⏩ Why Compound Config?

- **Clarity:** Groups related settings together (geolocation, HTTP, logging, app lifecycle, etc).
- **Extensibility:** Easier to add new config domains without polluting the top-level.
- **Consistency:** Aligns with native SDKs and shared TypeScript types across platforms.
- **Tooling:** Better IntelliSense / autocomplete when using [`@transistorsoft/background-geolocation-types`](https://github.com/transistorsoft/background-geolocation-types).


## 🏗️ Old vs. New Config Structure

### Before (Flat Config)

```ts
import BackgroundGeolocation from 'cordova-background-geolocation-lt';

BackgroundGeolocation.ready({
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  distanceFilter: 50,
  stopOnTerminate: false,
  startOnBoot: true,
  url: 'https://my.server.com/locations',
  headers: { Authorization: 'Bearer TOKEN' },
  logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  debug: true,
});
```

### After (Compound Config)

```ts
import BackgroundGeolocation from 'cordova-background-geolocation-lt';

BackgroundGeolocation.ready({
  geolocation: {
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 50,
  },
  app: {
    stopOnTerminate: false,
    startOnBoot: true,
  },
  http: {
    url: 'https://my.server.com/locations',
    headers: { Authorization: 'Bearer TOKEN' },
  },
  logger: {
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
    debug: true,
  },
});
```

## 🗺️ Mapping Table: Flat → Compound

| Flat Key                | Compound Group | Compound Property         |
|-------------------------|---------------|--------------------------|
| `desiredAccuracy`       | `geolocation` | `desiredAccuracy`        |
| `distanceFilter`        | `geolocation` | `distanceFilter`         |
| `stopOnTerminate`       | `app`         | `stopOnTerminate`        |
| `startOnBoot`           | `app`         | `startOnBoot`            |
| `url`                   | `http`        | `url`                    |
| `headers`               | `http`        | `headers`                |
| `logLevel`              | `logger`      | `logLevel`               |
| `debug`                 | `logger`      | `debug`                  |
| ...                     | ...           | ...                      |

> See the [full mapping table](#full-mapping-table) below for all properties.


## 🧑‍💻 Migration Steps

1. **Update your dependency:**
   Ensure you are using `cordova-background-geolocation-lt` v5.0.0 or later.

   ```bash
   cordova plugin remove cordova-background-geolocation-lt
   cordova plugin add cordova-background-geolocation-lt
   ```

2. **Update your license key:**
   Log in to the [Customer Dashboard](https://www.transistorsoft.com/shop/customers), select the **"New"** license tab for your purchase, and copy your new JWT key. Remove any separate add-on license keys — they are no longer used. See steps 3 and 4 below for where to apply the key on each platform.

3. __[iOS]__ Add your JWT license key to `config.xml` inside `<platform name="ios">`. See [Setup](https://docs.transistorsoft.com/cordova/setup/) for full details:

:open_file_folder: `config.xml`
```xml
<platform name="ios">
    <config-file parent="TSLocationManagerLicense" target="*-Info.plist">
        <string>YOUR_JWT_LICENSE_KEY</string>
    </config-file>
</platform>
```

4. __[Android]__ Add your JWT license key to `config.xml` inside `<platform name="android">` and remove any legacy Huawei HMS or private Maven repository references. See [Setup](https://docs.transistorsoft.com/cordova/setup/) for full details.

:open_file_folder: `config.xml`
```xml
<platform name="android">
    <config-file parent="/manifest/application" target="app/src/main/AndroidManifest.xml">
        <meta-data
            android:name="com.transistorsoft.locationmanager.license"
            android:value="YOUR_JWT_LICENSE_KEY" />
    </config-file>
</platform>
```

> [!NOTE]
> v5 resolves the native SDK from Maven Central. If your `config.xml` previously included references to Huawei HMS (`HMS_LOCATION_VERSION`) or OkHttp (`OKHTTP_VERSION`) plugin variables, they are no longer used and can be removed.

5. **Group related options:**
   - Move geolocation-related keys into `geolocation: {}`
   - Move HTTP-related keys into `http: {}`
   - Move logging/debug keys into `logger: {}`
   - Move app lifecycle keys into `app: {}`
   - Move activity-recognition keys into `activity: {}`
   - Move persistence keys into `persistence: {}`

6. **Replace flat keys:**
   - Instead of passing all options in a single flat object, pass them inside the relevant compound config group.
   - Remove any duplicate or conflicting flat keys.

7. **Check for breaking changes:**
   - Some keys may have been renamed, moved, or refactored.
   - See [Breaking Changes](#breaking-changes) below.


## 📝 Example Migration

### Flat Config (Old)
```ts
BackgroundGeolocation.ready({
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  distanceFilter: 10,
  stopOnTerminate: false,
  startOnBoot: true,
  url: 'https://my.server.com/locations',
  headers: { Authorization: 'Bearer TOKEN' },
  logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
  debug: true,
  autoSync: true,
  batchSync: false,
});
```

### Compound Config (New)
```ts
BackgroundGeolocation.ready({
  geolocation: {
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    distanceFilter: 10,
  },
  app: {
    stopOnTerminate: false,
    startOnBoot: true,
  },
  http: {
    url: 'https://my.server.com/locations',
    headers: { Authorization: 'Bearer TOKEN' },
    autoSync: true,
    batchSync: false,
  },
  logger: {
    logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
    debug: true,
  },
});
```


## 🧩 Compound Config Groups

| Group         | TypeScript Interface | Description                                 |
|---------------|---------------------|---------------------------------------------|
| `geolocation` | `GeoConfig`         | Location and geofencing options             |
| `app`         | `AppConfig`         | App lifecycle and scheduling                |
| `http`        | `HttpConfig`        | HTTP sync, batching, headers, etc.          |
| `logger`      | `LoggerConfig`      | Debug, log-level, log retention             |
| `activity`    | `ActivityConfig`    | Activity recognition, stop detection        |
| `persistence` | `PersistenceConfig` | Data storage, max days, max records         |

Each group is a separate TypeScript interface. See API docs for details.


## 🛠️ Full Mapping Table

| Flat Key                                  | Compound Group   | Compound Property                      | Notes                                 |
|--------------------------------------------|------------------|----------------------------------------|---------------------------------------|
| `desiredAccuracy`                          | `geolocation`    | `desiredAccuracy`                      |                                       |
| `distanceFilter`                           | `geolocation`    | `distanceFilter`                       |                                       |
| `stationaryRadius`                         | `geolocation`    | `stationaryRadius`                     |                                       |
| `stopTimeout`                              | `geolocation`    | `stopTimeout`                          |                                       |
| `stopAfterElapsedMinutes`                  | `geolocation`    | `stopAfterElapsedMinutes`              |                                       |
| `geofenceProximityRadius`                  | `geolocation`    | `geofenceProximityRadius`              |                                       |
| `geofenceInitialTriggerEntry`              | `geolocation`    | `geofenceInitialTriggerEntry`          |                                       |
| `geofenceModeHighAccuracy`                 | `geolocation`    | `geofenceModeHighAccuracy`             |                                       |
| `pausesLocationUpdatesAutomatically`       | `geolocation`    | `pausesLocationUpdatesAutomatically`   | iOS only                              |
| `showsBackgroundLocationIndicator`         | `geolocation`    | `showsBackgroundLocationIndicator`     | iOS only                              |
| `activityType`                             | `geolocation`    | `activityType`                         | iOS only                              |
| `locationAuthorizationAlert`               | `geolocation`    | `locationAuthorizationAlert`           | iOS only                              |
| `maxMonitoredGeofences`                    | `geolocation`    | `maxMonitoredGeofences`                |                                       |
| `locationFilter`                           | `geolocation`    | `filter`                               | Advanced filtering                    |
| `stopOnTerminate`                          | `app`            | `stopOnTerminate`                      |                                       |
| `startOnBoot`                              | `app`            | `startOnBoot`                          |                                       |
| `enableHeadless`                           | `app`            | `enableHeadless`                       | Android only                          |
| `heartbeatInterval`                        | `app`            | `heartbeatInterval`                    |                                       |
| `schedule`                                 | `app`            | `schedule`                             |                                       |
| `scheduleUseAlarmManager`                  | `app`            | `scheduleUseAlarmManager`              | Android only                          |
| `notification`                             | `app`            | `notification`                         | Android only                          |
| `backgroundPermissionRationale`            | `app`            | `backgroundPermissionRationale`        | Android only                          |
| `preventSuspend`                           | `app`            | `preventSuspend`                       | iOS only                              |
| `url`                                      | `http`           | `url`                                  |                                       |
| `autoSync`                                 | `http`           | `autoSync`                             |                                       |
| `autoSyncThreshold`                        | `http`           | `autoSyncThreshold`                    |                                       |
| `disableAutoSyncOnCellular`                | `http`           | `disableAutoSyncOnCellular`            |                                       |
| `batchSync`                                | `http`           | `batchSync`                            |                                       |
| `maxBatchSize`                             | `http`           | `maxBatchSize`                         |                                       |
| `method`                                   | `http`           | `method`                               |                                       |
| `params`                                   | `http`           | `params`                               |                                       |
| `headers`                                  | `http`           | `headers`                              |                                       |
| `httpRootProperty`                         | `http`           | `rootProperty`                         |                                       |
| `httpTimeout`                              | `http`           | `timeout`                              |                                       |
| `debug`                                    | `logger`         | `debug`                                |                                       |
| `logLevel`                                 | `logger`         | `logLevel`                             |                                       |
| `logMaxDays`                               | `logger`         | `logMaxDays`                           |                                       |
| `activityRecognitionInterval`              | `activity`       | `activityRecognitionInterval`          | Android only                          |
| `minimumActivityRecognitionConfidence`     | `activity`       | `minimumActivityRecognitionConfidence` | Android only                          |
| `disableStopDetection`                     | `activity`       | `disableStopDetection`                 |                                       |
| `stopOnStationary`                         | `activity`       | `stopOnStationary`                     |                                       |
| `motionTriggerDelay`                       | `activity`       | `motionTriggerDelay`                   | Android only                          |
| `triggerActivities`                        | `activity`       | `triggerActivities`                    | Android only                          |
| `disableMotionActivityUpdates`             | `activity`       | `disableMotionActivityUpdates`         | iOS only                              |
| `stopDetectionDelay`                       | `activity`       | `stopDetectionDelay`                   | iOS only                              |
| `persistMode`                              | `persistence`    | `persistMode`                          |                                       |
| `maxDaysToPersist`                         | `persistence`    | `maxDaysToPersist`                     |                                       |
| `maxRecordsToPersist`                      | `persistence`    | `maxRecordsToPersist`                  |                                       |
| `locationsOrderDirection`                  | `persistence`    | `locationsOrderDirection`              |                                       |

> Not all legacy keys are shown above. See API docs for full details.


## ⚠️ Breaking Changes

- **iOS now requires a license key:**
  - Previous versions only required a license key on Android. v5 requires a valid JWT license key on **both iOS and Android**. See [Setup](https://docs.transistorsoft.com/cordova/setup/).
- **Legacy license keys no longer work:**
  - v4 and older license keys are not accepted by v5. You must obtain a new JWT key from the **"Licenses (New)"** tab in the [Customer Dashboard](https://www.transistorsoft.com/shop/customers).
- **Separate add-on license keys are no longer accepted:**
  - Remove any separate add-on license keys (eg: `polygon-geofencing`, `firebase`) from your `config.xml`. Add-on entitlements are now bundled into the bgGeo JWT key.
- **Removed plugin variables:**
  - `OKHTTP_VERSION` — OkHttp is now bundled in the native SDK.
  - `HMS_LOCATION_VERSION` — Huawei HMS support was removed in v4.18.0.
- **Native SDK via Maven Central:**
  - The Android native SDK is now resolved from Maven Central instead of embedded local binaries. If you had custom Maven repository entries for the plugin, they can be removed.
- **Some keys have moved to new groups:**
  - E.g., `debug` is now in the `logger` group.
- **`httpRootProperty` renamed to `rootProperty`** within the `http` group.
- **`httpTimeout` renamed to `timeout`** within the `http` group.
- **`locationFilter` renamed to `filter`** within the `geolocation` group.
- **Legacy flat config remains supported but deprecated:**
  - Using the legacy flat config will show warnings at runtime, but will **not** result in an error. Migration to the new grouped config is recommended for future compatibility.


## 🧪 Testing Your Migration

1. **Run your app after migration.**
2. **Check for errors or warnings** about missing or misplaced config keys.
3. **Review logs** to ensure config is applied as expected.
4. **Consult the API docs** for each config group if unsure.


## 🆘 Need Help?

- See the [API Reference](https://docs.transistorsoft.com/cordova/BackgroundGeolocation/) for each config interface.
- Ask questions on [GitHub Discussions](https://github.com/transistorsoft/cordova-background-geolocation-lt/discussions) or [open an issue](https://github.com/transistorsoft/cordova-background-geolocation-lt/issues).


## 📚 Resources

- [Full API Reference](https://docs.transistorsoft.com/cordova/BackgroundGeolocation/)
- [GitHub Project](https://github.com/transistorsoft/cordova-background-geolocation-lt)
- [Changelog](CHANGELOG.md)
