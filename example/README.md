# Example Applications

Two example apps are provided, targeting iOS and Android via Cordova.

---

## [`hello-world`](./hello-world)

A minimal getting-started app using plain Cordova (no framework). It demonstrates the essential plugin lifecycle with as little surrounding code as possible. Start here if you are new to the plugin.

**Features:**
- Plugin configuration with `ready()`
- Enable / disable tracking
- Display incoming locations
- Request location permission

---

## [`ionic`](./ionic)

A full-featured Ionic/Angular demo app used internally for QA and as a reference implementation. It connects to the [Transistor GPS Tracking Server](https://tracker.transistorsoft.com) so you can watch your device on a live map in a browser.

**Features:**
- Live tracking display with current position, speed, accuracy, and odometer
- Toggle tracking on/off with motion-state indicator (play/pause)
- GPS provider status and activity recognition display
- `getCurrentPosition` action
- Transistor server registration and authorization token management

---

## Demo Server

When the Ionic app launches it will ask you to register an **organization** and **username**. The example app posts your tracking data to Transistor Software's demo server at:

**[https://tracker.transistorsoft.com](https://tracker.transistorsoft.com)**

View your results live on a map by navigating to:

```
https://tracker.transistorsoft.com/<your-organization>
```

> [!NOTE]
> The demo server is for testing purposes only. Use any organization name — it acts as a namespace to group your devices.

![](https://raw.githubusercontent.com/transistorsoft/assets/master/images/tracker.transistorsoft.com.png)

---

## Getting Started

These examples live inside the plugin repo and reference the plugin via `file:../..`. A normal `npm install` would try to recursively copy the entire repo into `node_modules` — including the examples themselves.

The included setup script handles this by packing the plugin into a tarball (which respects `.npmignore` and excludes `example/`), installing it via `cordova plugin add`, then restoring the `file:../..` link for ongoing development.

**Run from within the example directory:**

```bash
cd hello-world   # or: cd ionic
npm run setup
```

This only needs to be done once. After setup, build and run normally:

```bash
# hello-world
cordova run android
cordova run ios

# ionic
ionic cordova run android
ionic cordova run ios
```
