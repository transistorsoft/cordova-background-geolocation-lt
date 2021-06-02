# Capacitor Setup

-----------------------------------------------------------------
### :new: :stop_sign: *Capacitor* version now available! See [__`capacitor-background-geolocation`__](https://github.com/transistorsoft/capacitor-background-geolocation) :stop_sign: :new:
-----------------------------------------------------------------

```
npm install cordova-background-geolocation-lt
npx cap sync
```
:information_source: Append optional `#version` tag (eg: `#3.6.3`) to url above (See [Releases](../../../releases))

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

## [Configure `cordova-plugin-background-fetch`](https://github.com/transistorsoft/cordova-plugin-background-fetch/blob/master/docs/INSTALL_CAPACITOR.md#ios-setup)

The BackgroundGeolocation SDK makes use internally on __`cordova-plugin-background-fetch`__.  Regardless of whether you instend to implement the BackgroundFetch Javascript API in your app, you **must** perform the [Background Fetch iOS Setup](https://github.com/transistorsoft/cordova-plugin-background-fetch/blob/master/docs/INSTALL_CAPACITOR.md#ios-setup) at __`cordova-plugin-background-fetch`__.


# Android

## `app/build.gradle`

Add the following code to your `build.gradle (Module: app)`:

```diff
apply plugin: 'com.android.application'

+def background_geolocation = "../../node_modules/cordova-background-geolocation-lt/src/android"
+apply from: "$background_geolocation/app.gradle"

android {
    .
    .
    .
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
+           proguardFiles "$background_geolocation/proguard-rules.pro"
        }
    }
}
```

## AndroidManifest.xml (License Configuration)

If you've **not** [purchased a license](https://www.transistorsoft.com/shop/products/cordova-background-geolocation#plans), **ignore this step** &mdash; the plugin is fully functional in *DEBUG* builds so you can try before you [buy](https://www.transistorsoft.com/shop/products/cordova-background-geolocation#plans).

```diff
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.your.app">

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
