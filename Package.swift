// swift-tools-version:5.9
import PackageDescription

// The Swift package cordova-ios 8 and later builds, because plugin.xml declares
// <platform name="ios" package="swift">. Older cordova-ios ignores this file and uses the
// <source-file>/<header-file> and the TSLocationManager <pod> in plugin.xml. (WO-195)
let package = Package(
    name: "cordova-background-geolocation-lt",
    platforms: [.iOS(.v15)],
    products: [
        // cordova-ios links .product(name: <plugin id>, package: <plugin id>), so this name must equal the plugin id. (WO-195)
        .library(name: "cordova-background-geolocation-lt", targets: ["CDVBackgroundGeolocation"])
    ],
    dependencies: [
        // cordova-ios rewrites this line to a local path at `cordova plugin add` with a greedy
        // regex; keep it alone on its own line. (WO-195)
        .package(url: "https://github.com/apache/cordova-ios.git", from: "8.0.0"),
        // The twin of plugin.xml's TSLocationManager <pod spec>: change both together. TSBackgroundFetch
        // comes through the BackgroundGeolocation product, which re-exports it; src/ios does not import it. (WO-195)
        .package(url: "https://github.com/transistorsoft/native-background-geolocation.git", .upToNextMinor(from: "4.9.0"))
    ],
    targets: [
        .target(
            name: "CDVBackgroundGeolocation",
            dependencies: [
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "BackgroundGeolocation", package: "native-background-geolocation")
            ],
            path: "src/ios",
            // SwiftPM rejects a C-family target with no include/ directory. (WO-195)
            publicHeadersPath: ".",
            // What TSLocationManager.podspec links; the native package declares none. (WO-195)
            linkerSettings: [
                .linkedLibrary("z"),
                .linkedLibrary("sqlite3"),
                .linkedLibrary("c++")
            ]
        )
    ]
)
