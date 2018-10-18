declare module "cordova-background-geolocation-lt" {
  /**
  * The event-object provided to [[BackgroundGeolocation.onHeartbeat]]
  *
  * @example
  * ```typescript
  * BackgroundGeolocation.onHeartbeat(heartbeatEvent => {
  *   console.log('[heartbeat] ', heartbeatEvent);
  * });
  * ```
  */
  interface HeartbeatEvent {
    location: Location;
  }
}
