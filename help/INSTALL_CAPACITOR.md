# Capacitor Setup

```
npm install cordova-background-geolocation-lt
npx cap sync
```

# iOS

## Configure Background Capabilities

With `YourApp.xcworkspace` open in XCode, add the following **Background Modes Capabilities**:

- [x] Location updates
- [x] Background fetch
- [x] Audio (**optional for debug-mode sound FX**)

![](https://dl.dropbox.com/s/c3vm8x0wgrfn9f4/ios-setup-background-modes.png?dl=1)

## Info.plist

Edit **`Info.plist`**.  Add the following items (Set **Value** as desired):

| Key | Type | Value |
|-----|-------|-------------|
| *Privacy - Location Always and When in Use Usage Description* | `String` | *CHANGEME: Location required in background* |
| *Privacy - Location When in Use Usage Description* | `String` | *CHANGEME: Location required when app is in use* |
| *Privacy - Motion Usage Description* | `String` | *CHANGEME: Motion permission helps detect when device in in-motion* |

![](https://dl.dropbox.com/s/9non3j83jj0rimu/ios-setup-plist-strings.png?dl=1)

### `AppDelegate.swift`

The Background Geolocation SDK is integrated with the [iOS Background Fetch API](https://developer.apple.com/documentation/uikit/core_app/managing_your_app_s_life_cycle/preparing_your_app_to_run_in_the_background/updating_your_app_with_background_app_refresh).

In Your **`AppDelegate.swift`**, add the following code (just the **`+green`** lines):

```diff
import UIKit
import Capacitor
+import TSBackgroundFetch

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Override point for customization after application launch.
    return true
  }

+ //Added for cordova-plugin-background-fetch
+ func application(_ application: UIApplication, performFetchWithCompletionHandler completionHandler:@escaping (UIBackgroundFetchResult) -> Void) {
+   NSLog("AppDelegate received fetch event");
+   let fetchManager = TSBackgroundFetch.sharedInstance();
+   fetchManager?.perform(completionHandler: completionHandler, applicationState: application.applicationState);
+ }
  .
  .
  .
}
```

# Android

## AndroidManifest.xml (License Configuration)

If you've **not** [purchased a license](https://www.transistorsoft.com/shop/products/react-native-background-geolocation#plans), **ignore this step** &mdash; the plugin is fully functional in *DEBUG* builds so you can try before you [buy](https://www.transistorsoft.com/shop/products/react-native-background-geolocation#plans).

```diff
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.transistorsoft.backgroundgeolocation.react">

  <application
    android:name=".MainApplication"
    android:allowBackup="true"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:theme="@style/AppTheme">

    <!-- background-geolocation licence -->
+   <meta-data android:name="com.transistorsoft.locationmanager.license" android:value="YOUR_LICENCE_KEY_HERE" />
    .
    .
    .
  </application>
</manifest>

```


## Proguard Config

If you've enabled **`minifyEnabled = true`** in your `app/build.gradle`, be sure to add the following items to your `proguard-rules.pro`:

### :open_file_folder: `proguard-rules.pro` (`android/app/proguard-rules.pro`)

```proguard
-keepnames class com.transistorsoft.cordova.bggeo.CDVBackgroundGeolocation

# BackgroundGeolocation lib tslocationmanager.aar is *already* proguarded
-keep class com.transistorsoft.** { *; }
-dontwarn com.transistorsoft.**

# BackgroundGeolocation (EventBus)
-keepclassmembers class * extends de.greenrobot.event.util.ThrowableFailureEvent {
    <init>(java.lang.Throwable);
}
-keepattributes *Annotation*
-keepclassmembers class ** {
    @org.greenrobot.eventbus.Subscribe <methods>;
}
-keep enum org.greenrobot.eventbus.ThreadMode { *; }
-keepclassmembers class * extends org.greenrobot.eventbus.util.ThrowableFailureEvent {
    <init>(java.lang.Throwable);
}

# logback
-keep class ch.qos.** { *; }
-keep class org.slf4j.** { *; }
-dontwarn ch.qos.logback.core.net.*

# OkHttp3
-dontwarn okio.**
```