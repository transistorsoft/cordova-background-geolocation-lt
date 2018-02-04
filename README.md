Cordova Background Geolocation &middot; [![npm](https://img.shields.io/npm/dm/cordova-background-geolocation-lt.svg)]() [![npm](https://img.shields.io/npm/v/cordova-background-geolocation-lt.svg)]()
===========================================================================

[![](https://dl.dropboxusercontent.com/s/nm4s5ltlug63vv8/logo-150-print.png?dl=1)](https://www.transistorsoft.com)

-------------------------------------------------------------------------------

The *most* sophisticated background **location-tracking & geofencing** module with battery-conscious motion-detection intelligence for **iOS** and **Android**.

The plugin's [Philosophy of Operation](../../wiki/Philosophy-of-Operation) is to use **motion-detection** APIs (using accelerometer, gyroscope and magnetometer) to detect when the device is *moving* and *stationary*.  

- When the device is detected to be **moving**, the plugin will *automatically* start recording a location according to the configured `distanceFilter` (meters).  

- When the device is detected be **stationary**, the plugin will automatically turn off location-services to conserve energy.

Also available for [React Native](https://github.com/transistorsoft/react-native-background-geolocation), [NativeScript](https://github.com/transistorsoft/nativescript-background-geolocation-lt) and pure native apps.

-----------------------------------------------------------------------------

The **[Android plugin](http://www.transistorsoft.com/shop/products/cordova-background-geolocation)** requires [purchasing a license](http://www.transistorsoft.com/shop/products/cordova-background-geolocation).  However, it *will* work for **DEBUG** builds.  It will **not** work with **RELEASE** builds [without purchasing a license](http://www.transistorsoft.com/shop/products/cordova-background-geolocation).

(2018) This plugin is supported **full-time** and field-tested **daily** since 2013.

-----------------------------------------------------------------------------

![Home](https://dl.dropboxusercontent.com/s/wa43w1n3xhkjn0i/home-framed-350.png?dl=1)
![Settings](https://dl.dropboxusercontent.com/s/8oad228siog49kt/settings-framed-350.png?dl=1)


# Contents
- ### :books: [API Documentation](./docs/README.md)
  - :wrench: [Configuration Options](./docs/README.md#wrench-configuration-options-1)
  - :zap: [Events](./docs/README.md#zap-events-1)
  - :small_blue_diamond: [Methods](./docs/README.md#large_blue_diamond-methods)
- ### [Installing the Plugin](#large_blue_diamond-installing-the-plugin)
- ### [Android SDK Setup](#large_blue_diamond-android-sdk)
- ### [Configuring the Plugin](#large_blue_diamond-configuring-the-plugin)
- ### [Using the plugin](#large_blue_diamond-using-the-plugin)
- ### [Debugging](../../wiki/Debugging)
- ### [Example](#large_blue_diamond-example)
- ### [Sample Application](#large_blue_diamond-advanced-sample-application)
- ### [Testing Server](#large_blue_diamond-simple-testing-server)
 
## :large_blue_diamond: Installing the plugin ##

#### From npm 

```bash
$ cordova plugin add cordova-background-geolocation-lt
```

#### Phonegap Build

```xml
  <plugin name="cordova-background-geolocation-lt" source="npm">

  </plugin>
```

#### From master (latest, greatest.)

```
$ cordova plugin add https://github.com/transistorsoft/cordova-background-geolocation-lt.git
```

## :large_blue_diamond: Android SDK

If building from your local machine (as you should be), ensure you have the following items installed or updated in Android SDK Manager
#### SDK Tools
![](https://dl.dropboxusercontent.com/s/qdscbas4krc27c4/android-sdk-tools.png?dl=1)
#### SDK Platforms
![](https://dl.dropboxusercontent.com/s/qetghugog00puz2/android-sdk-platforms.png?dl=1)


## :large_blue_diamond: Configuring the plugin

After adding the plugin, your `config.xml` will contain the following block, containing a number of `<variable />` for you to configure (eg: `LICENSE`):

```xml
<widget id="com.your.company.app.id">
  <plugin name="cordova-background-geolocation-lt">
    <variable name="LICENSE" value="YOUR_LICENSE_KEY" />
    <variable name="GOOGLE_API_VERSION" value="11.6.0" />
    <variable name="APPCOMPAT_VERSION" value="26.1.0" />
    <variable name="LOCATION_ALWAYS_AND_WHEN_IN_USE_USAGE_DESCRIPTION" value="Always use is required for background location tracking" />
    <variable name="LOCATION_ALWAYS_USAGE_DESCRIPTION" value="Background location-tracking is required" />
    <variable name="LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION" value="Background location-tracking is required" />
    <variable name="MOTION_USAGE_DESCRIPTION" value="Using the accelerometer increases battery-efficiency by intelligently toggling location-tracking only when the device is detected to be moving" />
  </plugin>
  .
  .
  .
</widget>
```

To configure these `<variable />`, you simply re-add the plugin, providing desired `--variable` to the `cordova plugin add` command.  You can combine multiple `--variable` together in *one* command or execute `cordova plugin add` *successivly*.

```
$ cordova plugin add cordova-background-geolocation-lt --variable VARIABLE_NAME=value

$ cordova platform remove android
$ cordova platform add android
```

:exclamation: To apply changes to these `<variable />`, you **must** remove/re-add the cordova platform(s)

#### Configuring Multiple Variables at Once

Use the `\` character followed by [`ENTER`] in console to configure multiple variables with one command:

```bash
$ cordova plugin add cordova-background-geolocation-lt \
  --variable LICENSE=your_key_here \
  --variable GOOGLE_API_VERSION=11.6.0 \
  --variable APPCOMPAT_VERSION=27.0.0 \
  --variable MOTION_USAGE_DESCRIPTION="My motion usage description"

$ cordova platform remove android
$ cordova platform add android

$ cordova platform remove ios
$ cordova platform add ios
```

#### Or each variable separately

```bash
$ cordova plugin add cordova-background-geolocation-lt --variable MOTION_USAGE_DESCRIPTION="My Motion Usage Description"

$ cordova plugin add cordova-background-geolocation-lt --variable LOCATION_ALWAYS_AND_WHEN_IN_USE_USAGE_DESCRIPTION="My Usage Description"

$ cordova platform remove ios
$ cordova platform add ios
```

#### After editing variables, ALWAYS REMOVE / RE-ADD PLATFORM

```bash
$ cordova platform remove android
$ cordova platform add android

$ cordova platform remove ios
$ cordova platform add ios

```

#### Configuring your LICENSE key

After generating your Android license-key in the [Product Dashboard](http://www.transistorsoft.com/shop/customers), Configure the `LICENSE` variable:

```bash
$ cordova plugin add cordova-background-geolocation-lt --variable LICENSE=your_key_here

// Remove / re-add the Android platform
$ cordova platform remove android
$ cordova platform add android
```

#### Configuring `play-services` Version

Many other plugins require Google Play Services and/or Firebase libraries.  This is a common source of Android build-failures, since the `play-services` library version must be aligned to the same version for **all** plugins.  For example, when one plugin imports version `11.0.1` and another one imports `11.2.0`, a gradle build failure will occur.  Use the `GOOGLE_API_VERSION` to align the required `play-services` version with other plugins.

:warning: The plugin requires a minimum version of **`11.2.0`**.

```bash
$ cordova plugin add cordova-background-geolocation-lt --variable GOOGLE_API_VERSION=11.2.0
$ cordova platform remove android
$ cordova platform add android
```

#### Configuring for `useSignificantChangesOnly`

For those using `useSignificantChangesOnly: true`, possibly because Apple *denied* your use of the background `location` capability, you can disable background `location` by providing the `BACKGROUND_MODE_LOCATION` `<variable />` with an empty-string:

```bash
$ cordova plugin add cordova-background-geolocation-lt --variable BACKGROUND_MODE_LOCATION=""

$ cordova platform remove ios
$ cordova platform add ios
```


## Configuration Variables

### Android

##### `@variable LICENSE [""]`
Your Android license key generated from [Product Dashboard](http://www.transistorsoft.com/shop/customers)

##### `@variable GOOGLE_API_VERSION ["11.6.0"]`
Sets the desired version of `play-services-location` dependency.  Many other plugins require `play-services` dependencies, (eg: `cordova-plugin-googlemaps`, `phonegap-plugin-push`):  If the version of `play-services` and/or `firebase` is not aligned to the **same** version for **ALL** plugins, your build **will fail**.

##### `@variable APPCOMPAT_VERSION ["27.0.0"]`
Sets the desired version of `com.google.android.appcompat-v7` dependency.  Many other plugins can require a different version of `appcompat-v7` dependeny:  If the version of `appcompat-v7` is not aligned to the **same** version for **ALL** plugins, your build **will fail**.  `BackgroundGeolocation` requires a minimum version of `26.1.0` due to its support for Android 8.

### iOS

##### `@variable LOCATION_ALWAYS_AND_WHEN_IN_USE_USAGE_DESCRIPTION ["Background location-tracking is required"]`

Customize the message displayed to the user when `AlwaysAndWhenInUse` location authorization is requested.  This variable is added to your iOS `.plist` in the `NSLocationAlwaysAndWhenInUseUsageDescription` key.

##### `@variable LOCATION_ALWAYS_USAGE_DESCRIPTION ["Background location-tracking is required"]`

**(deprecated in iOS 11.0)** Customize the message displayed to the user when `Always` location authorization is requested.  This variable is added to your iOS `.plist` in the `NSLocationAlwaysUsageDescription` key.

##### `@variable LOCATION_WHEN_IN_USE_USAGE_DESCRIPTION ["Background location-tracking is required"`

Customize the message displayed to the user when `WhenInUse` location authorization is requested.  This variable is added to your iOS `.plist` in the `NSLocationWhenInUseUsageDescription` key.

##### `@variable MOTION_USAGE_DESCRIPTION ["Using the accelerometer increases battery-efficiency by..."`

Customize the message displayed to the user when "Motion & Fitness" permission is requested.  The plugin is **highly** optimized to use iOS `CMMotionActivityManager` API for intelligently toggling location-services only when the plugin is detected to be moving.

##### `@variable BACKGROUND_MODE_LOCATION ["&lt;string&gt;location&lt;/string&gt;"]`
Adds the iOS background-mode `location` to your iOS `.plist` file.  This is the default behaviour.  To disable this, (ie: for those using `useSignificantChangesOnly`), provide an empty-string:

```xml
  <variable name="BACKGROUND_MODE_LOCATION" value="" />
```

:warning: If you *do* want the default behaviour of background-location updates, simply **IGNORE** this variable -- Do **NOT** even provide it.  If you *do* provide it, you must provide the full escaped XML value of `&lt;string&gt;location&lt;/string&gt;` (the default value when not provided), not just `location`.


## :large_blue_diamond: Using the Plugin

The plugin creates the object **`window.BackgroundGeolocation`**.  See [API Documentation](docs) for details

### Ionic 2+ and Typescript

[Sample Implementation](https://gist.github.com/christocracy/2abf5587cc12b83e15aa12958de7a7d2)

```javascript
platform.ready().then(() => {
  let bgGeo = (<any>window).BackgroundGeolocation;
});

```

### `#configure` the Plugin
There are **three** simple steps to using `BackgroundGeolocation`:

1. Listen to events
2. `#configure` the plugin
3. `#start` the plugin

```javascript
// 1.  Listen to events
bgGeo.on('location', onLocation, onLocationFailure);
bgGeo.on('motionchange', onMotionChange);
bgGeo.on('providerchange', onProviderChange);

// 2. Configure the plugin.  
bgGeo.configure({
  desiredAccuracy: 0,   // <-- Config params
  distanceFilter: 50
}, function(state) {    // <-- Current state provided to #configure callback
  // 3.  Start tracking
  console.log('BackgroundGeolocation is configured and ready to use');
  if (!state.enabled) {
    bgGeo.start(function() {
      console.log('- BackgroundGeolocation tracking started');
    });
  }
});
// NOTE:  Do NOT execute any API methods until the callback to #configure
// method above executes!
// For example, do not do this here:
// bgGeo.getCurrentPosition()   // <-- NO!
// bgGeo.getState();            // <-- NO!
```

:warning: Do not execute *any* API method (aside from `#getState` or adding event-listeners with `#on`) *before* the `callbackFn` to the `#configure` method fires, as noted above.

## :large_blue_diamond: Example

See [here](https://gist.github.com/christocracy/2abf5587cc12b83e15aa12958de7a7d2#file-backgroundgeolocation-ionic2-js) for an Ionic 3 example.

```javascript

////
// As with all Cordova plugins, you must configure within an #deviceready callback.
//
function onDeviceReady() {
    // Get a reference to the plugin.
    var bgGeo = window.BackgroundGeolocation;

    //This callback will be executed every time a geolocation is recorded in the background.
    var callbackFn = function(location) {
        var coords = location.coords;
        var lat    = coords.latitude;
        var lng    = coords.longitude;
        console.log('- Location: ', JSON.stringify(location));        
    };

    // This callback will be executed if a location-error occurs.  Eg: this will be called if user disables location-services.
    var failureFn = function(errorCode) {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
    }

    // Listen to location events & errors.
    bgGeo.on('location', callbackFn, failureFn);
    // Fired whenever state changes from moving->stationary or vice-versa.
    bgGeo.on('motionchange', function(isMoving) {
      console.log('- onMotionChange: ', isMoving);
    });
    // Fired whenever a geofence transition occurs.
    bgGeo.on('geofence', function(geofence) {
      console.log('- onGeofence: ', geofence.identifier, geofence.location);
    });
    // Fired whenever an HTTP response is received from your server.
    bgGeo.on('http', function(response) {
      console.log('http success: ', response.responseText);
    }, function(response) {
      console.log('http failure: ', response.status);
    });

    // BackgroundGeoLocation is highly configurable.
    bgGeo.configure({
        // Geolocation config
        desiredAccuracy: 0,
        distanceFilter: 10,
        stationaryRadius: 25,
        // Activity Recognition config
        activityRecognitionInterval: 10000,
        stopTimeout: 5,
        // Application config
        debug: true,  // <-- Debug sounds & notifications.
        stopOnTerminate: false,
        startOnBoot: true,
        // HTTP / SQLite config
        url: "http://your.server.com/locations",
        method: "POST",
        autoSync: true,
        maxDaysToPersist: 3,
        headers: {  // <-- Optional HTTP headers
            "X-FOO": "bar"
        },
        params: {   // <-- Optional HTTP params
            "auth_token": "maybe_your_server_authenticates_via_token_YES?"
        }
    }, function(state) {
        // This callback is executed when the plugin is ready to use.
        console.log("BackgroundGeolocation ready: ", state);
        if (!state.enabled) {
            bgGeo.start();
        }
    });

    // The plugin is typically toggled with some button on your UI.
    function onToggleEnabled(value) {
        if (value) {
            bgGeo.start();
        } else {
            bgGeo.stop();
        }
    }
}

```


## :large_blue_diamond: [Advanced Sample Application](https://github.com/christocracy/cordova-background-geolocation-SampleApp)

A fully-featured [SampleApp](https://github.com/christocracy/cordova-background-geolocation-SampleApp) is available in its own public repo.  After first cloning that repo, follow the installation instructions in the **README** there.  This SampleApp includes a settings-screen allowing you to quickly experiment with all the different settings available for each platform.

If you're using XCode, boot the SampleApp in the iOS Simulator and enable ```Debug->Location->Freeway Drive```.

![](https://dl.dropboxusercontent.com/s/grvak7dbfmbe89l/simulate-location.png?dl=1)

## :large_blue_diamond: Simple Testing Server

A simple Node-based [web-application](https://github.com/transistorsoft/background-geolocation-console) with SQLite database is available for field-testing and performance analysis.  If you're familiar with Node, you can have this server up-and-running in about **one minute**.

![](https://dl.dropboxusercontent.com/s/px5rzz7wybkv8fs/background-geolocation-console-map.png?dl=1)

![](https://dl.dropboxusercontent.com/s/tiy5b2oivt0np2y/background-geolocation-console-grid.png?dl=1)


# Licence

```
cordova-background-geolocation
Copyright (c) 2018, Transistor Software (9224-2932 Quebec Inc)
All rights reserved.
sales@transistorsoft.com
http://transistorsoft.com
```

1. Preamble:  This Agreement governs the relationship between YOU OR THE ORGANIZATION ON WHOSE BEHALF YOU ARE ENTERING INTO THIS AGREEMENT (hereinafter: Licensee) and Transistor Software, a LICENSOR AFFILIATION whose principal place of business is Montreal, Quebec, Canada (Hereinafter: Licensor). This Agreement sets the terms, rights, restrictions and obligations on using [{software}] (hereinafter: The Software) created and owned by Licensor, as detailed herein

2. License Grant: Licensor hereby grants Licensee a Personal, Non-assignable &amp; non-transferable, Commercial, Royalty free, Including the rights to create but not distribute derivative works, Non-exclusive license, all with accordance with the terms set forth and other legal restrictions set forth in 3rd party software used while running Software.

	2.1 Limited: Licensee may use Software for the purpose of:
		- Running Software on Licensee's Website[s] and Server[s];
		- Allowing 3rd Parties to run Software on Licensee's Website[s] and Server[s];
		- Publishing Software&rsquo;s output to Licensee and 3rd Parties;
		- Distribute verbatim copies of Software's output (including compiled binaries);
		- Modify Software to suit Licensee&rsquo;s needs and specifications.

	2.2 Binary Restricted: Licensee may sublicense Software as a part of a larger work containing more than Software, distributed solely in Object or Binary form under a personal, non-sublicensable, limited license. Such redistribution shall be limited to unlimited codebases.</li><li>

	2.3 Non Assignable &amp; Non-Transferable: Licensee may not assign or transfer his rights and duties under this license.

	2.4 Commercial, Royalty Free: Licensee may use Software for any purpose, including paid-services, without any royalties

	2.5 Including the Right to Create Derivative Works: </strong>Licensee may create derivative works based on Software, including amending Software&rsquo;s source code, modifying it, integrating it into a larger work or removing portions of Software, as long as no distribution of the derivative works is made.

3. Term & Termination:  The Term of this license shall be until terminated. Licensor may terminate this Agreement, including Licensee's license in the case where Licensee : 

	3.1 became insolvent or otherwise entered into any liquidation process; or

	3.2 exported The Software to any jurisdiction where licensor may not enforce his rights under this agreements in; or

	3.3 Licensee was in breach of any of this license's terms and conditions and such breach was not cured, immediately upon notification; or

	3.4 Licensee in breach of any of the terms of clause 2 to this license; or

	3.5 Licensee otherwise entered into any arrangement which caused Licensor to be unable to enforce his rights under this License.

4. Payment: In consideration of the License granted under clause 2, Licensee shall pay Licensor a FEE, via Credit-Card, PayPal or any other mean which Licensor may deem adequate. Failure to perform payment shall construe as material breach of this Agreement.

5. Upgrades, Updates and Fixes: Licensor may provide Licensee, from time to time, with Upgrades,  Updates or Fixes, as detailed herein and according to his sole discretion. Licensee hereby warrants to keep The Software up-to-date and install all relevant updates and fixes, and may, at his sole discretion, purchase upgrades, according to the rates set by Licensor. Licensor shall provide any update or Fix free of charge; however, nothing in this Agreement shall require Licensor to provide Updates or Fixes.

	5.1 Upgrades: for the purpose of this license, an Upgrade  shall be a material amendment in The Software, which contains new features   and or major performance improvements and shall be marked as a new version number. For example, should Licensee purchase The Software under   version 1.X.X, an upgrade shall commence under number 2.0.0.

	5.2 Updates: for the purpose of this license, an update shall be a minor amendment   in The Software, which may contain new features or minor improvements and   shall be marked as a new sub-version number. For example, should   Licensee purchase The Software under version 1.1.X, an upgrade shall   commence under number 1.2.0.

	5.3 Fix: for the purpose of this license, a fix shall be a minor amendment in   The Software, intended to remove bugs or alter minor features which impair   the The Software's functionality. A fix shall be marked as a new   sub-sub-version number. For example, should Licensee purchase Software   under version 1.1.1, an upgrade shall commence under number 1.1.2.

6. Support: Software is provided under an AS-IS basis and without any support, updates or maintenance. Nothing in this Agreement shall require Licensor to provide Licensee with support or fixes to any bug, failure, mis-performance or other defect in The Software.

	6.1 Bug Notification: Licensee may provide Licensor of details regarding any bug, defect or   failure in The Software promptly and with no delay from such event;  Licensee  shall comply with Licensor's request for information regarding  bugs,  defects or failures and furnish him with information,  screenshots and  try to reproduce such bugs, defects or failures.

	6.2 Feature Request: Licensee may request additional features in Software, provided, however, that (i) Licensee shall waive any claim or right in such feature should feature be developed by Licensor; (ii) Licensee shall be prohibited from developing the feature, or disclose such feature   request, or feature, to any 3rd party directly competing with Licensor or any 3rd party which may be, following the development of such feature, in direct competition with Licensor; (iii) Licensee warrants that feature does not infringe any 3rd party patent, trademark, trade-secret or any other intellectual property right; and (iv) Licensee developed, envisioned or created the feature solely by himself.

7. Liability: To the extent permitted under Law, The Software is provided under an   AS-IS basis. Licensor shall never, and without any limit, be liable for   any damage, cost, expense or any other payment incurred by Licensee as a   result of Software&rsquo;s actions, failure, bugs and/or any other  interaction  between The Software &nbsp;and Licensee&rsquo;s end-equipment, computers,  other  software or any 3rd party, end-equipment, computer or  services. Moreover, Licensor shall never be liable for any defect in  source code  written by Licensee when relying on The Software or using The Software&rsquo;s source  code.

8. Warranty: 

	8.1 Intellectual Property:  Licensor   hereby warrants that The Software does not violate or infringe any 3rd   party claims in regards to intellectual property, patents and/or   trademarks and that to the best of its knowledge no legal action has   been taken against it for any infringement or violation of any 3rd party   intellectual property rights.

	8.2 No-Warranty: The Software is provided without any warranty; Licensor hereby disclaims   any warranty that The Software shall be error free, without defects or code   which may cause damage to Licensee&rsquo;s computers or to Licensee, and  that  Software shall be functional. Licensee shall be solely liable to  any  damage, defect or loss incurred as a result of operating software  and  undertake the risks contained in running The Software on License&rsquo;s  Server[s]  and Website[s].

	8.3 Prior Inspection:  Licensee hereby states that he inspected The Software thoroughly and found   it satisfactory and adequate to his needs, that it does not interfere   with his regular operation and that it does meet the standards and  scope  of his computer systems and architecture. Licensee found that  The Software  interacts with his development, website and server environment  and that  it does not infringe any of End User License Agreement of any  software  Licensee may use in performing his services. Licensee hereby  waives any  claims regarding The Software's incompatibility, performance,  results and  features, and warrants that he inspected the The Software.</p>

9. No Refunds:  Licensee warrants that he inspected The Software according to clause 7(c)   and that it is adequate to his needs. Accordingly, as The Software is   intangible goods, Licensee shall not be, ever, entitled to any refund,   rebate, compensation or restitution for any reason whatsoever, even if   The Software contains material flaws.

10. Indemnification:  Licensee hereby warrants to hold Licensor harmless and indemnify Licensor for any lawsuit brought against it in regards to Licensee&rsquo;s use   of The Software in means that violate, breach or otherwise circumvent this   license, Licensor's intellectual property rights or Licensor's title  in  The Software. Licensor shall promptly notify Licensee in case of such  legal  action and request Licensee's consent prior to any settlement in relation to such lawsuit or claim.

11. Governing Law, Jurisdiction:  Licensee hereby agrees not to initiate class-action lawsuits against Licensor in relation to this license and to compensate Licensor for any legal fees, cost or attorney fees should any claim brought by Licensee against Licensor be denied, in part or in full.

