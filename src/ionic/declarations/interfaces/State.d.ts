/// <reference path="./Config.d.ts" />

declare module "cordova-background-geolocation-lt" {
  interface State extends Config {
    enabled: boolean;
    schedulerEnabled: boolean;
    trackingMode: TrackingMode;
    odometer: number;
  }
}
