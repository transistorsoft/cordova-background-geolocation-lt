declare module "cordova-background-geolocation-lt" {
	interface WatchPositionRequest {
    interval?: number;
    desiredAccuracy?: number;
    persist?: boolean;
    extras?: Object;
    timeout?: number;
  }
}
