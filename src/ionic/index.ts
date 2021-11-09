const plugin = function() {
	return (<any>window).BackgroundGeolocation;
}

const Events:any = {
  BOOT               : "boot",
  TERMINATE          : "terminate",
  LOCATION           : "location",
  HTTP               : "http",
  MOTIONCHANGE       : "motionchange",
  PROVIDERCHANGE     : "providerchange",
  HEARTBEAT          : "heartbeat",
  ACTIVITYCHANGE     : "activitychange",
  GEOFENCE           : "geofence",
  GEOFENCESCHANGE    : "geofenceschange",
  SCHEDULE           : "schedule",
  CONNECTIVITYCHANGE : "connectivitychange",
  ENABLEDCHANGE      : "enabledchange",
  POWERSAVECHANGE    : "powersavechange",
  NOTIFICATIONACTION : "notificationaction",
  AUTHORIZATION      : "authorization",
};


export default class BackgroundGeolocation {
  static get EVENT_BOOT()                  { return Events.BOOT; }
  static get EVENT_TERMINATE()             { return Events.TERMINATE; }
  static get EVENT_LOCATION()              { return Events.LOCATION; }
  static get EVENT_MOTIONCHANGE()          { return Events.MOTIONCHANGE; }
  static get EVENT_HTTP()                  { return Events.HTTP; }
  static get EVENT_HEARTBEAT()             { return Events.HEARTBEAT; }
  static get EVENT_PROVIDERCHANGE()        { return Events.PROVIDERCHANGE; }
  static get EVENT_ACTIVITYCHANGE()        { return Events.ACTIVITYCHANGE; }
  static get EVENT_GEOFENCE()              { return Events.GEOFENCE; }
  static get EVENT_GEOFENCESCHANGE()       { return Events.GEOFENCESCHANGE; }
  static get EVENT_ENABLEDCHANGE()         { return Events.ENABLEDCHANGE; }
  static get EVENT_CONNECTIVITYCHANGE()    { return Events.CONNECTIVITYCHANGE; }
  static get EVENT_SCHEDULE()              { return Events.SCHEDULE; }
  static get EVENT_POWERSAVECHANGE()       { return Events.POWERSAVECHANGE; }
  static get EVENT_NOTIFICATIONACTION()    { return Events.NOTIFICATIONACTION; }
  static get EVENT_AUTHORIZATION()         { return Events.AUTHORIZATION; }

  static get LOG_LEVEL_OFF() { return plugin().LOG_LEVEL_OFF; }
  static get LOG_LEVEL_ERROR() { return plugin().LOG_LEVEL_ERROR; }
  static get LOG_LEVEL_WARNING() { return plugin().LOG_LEVEL_WARNING; }
  static get LOG_LEVEL_INFO() { return plugin().LOG_LEVEL_INFO; }
  static get LOG_LEVEL_DEBUG() { return plugin().LOG_LEVEL_DEBUG; }
  static get LOG_LEVEL_VERBOSE() { return plugin().LOG_LEVEL_VERBOSE; }

  static get DESIRED_ACCURACY_NAVIGATION() { return plugin().DESIRED_ACCURACY_NAVIGATION; }
  static get DESIRED_ACCURACY_HIGH() { return plugin().DESIRED_ACCURACY_HIGH; }
  static get DESIRED_ACCURACY_MEDIUM() { return plugin().DESIRED_ACCURACY_MEDIUM; }
  static get DESIRED_ACCURACY_LOW() { return plugin().DESIRED_ACCURACY_LOW; }
  static get DESIRED_ACCURACY_VERY_LOW() { return plugin().DESIRED_ACCURACY_VERY_LOW; }
  static get DESIRED_ACCURACY_THREE_KILOMETER() { return plugin().DESIRED_ACCURACY_THREE_KILOMETER; }

  static get AUTHORIZATION_STATUS_NOT_DETERMINED() { return plugin().AUTHORIZATION_STATUS_NOT_DETERMINED; }
  static get AUTHORIZATION_STATUS_RESTRICTED() { return plugin().AUTHORIZATION_STATUS_RESTRICTED; }
  static get AUTHORIZATION_STATUS_DENIED() { return plugin().AUTHORIZATION_STATUS_DENIED; }
  static get AUTHORIZATION_STATUS_ALWAYS() { return plugin().AUTHORIZATION_STATUS_ALWAYS; }
  static get AUTHORIZATION_STATUS_WHEN_IN_USE() { return plugin().AUTHORIZATION_STATUS_WHEN_IN_USE; }

  static get NOTIFICATION_PRIORITY_DEFAULT() { return plugin().NOTIFICATION_PRIORITY_DEFAULT; }
  static get NOTIFICATION_PRIORITY_HIGH() { return plugin().NOTIFICATION_PRIORITY_HIGH; }
  static get NOTIFICATION_PRIORITY_LOW() { return plugin().NOTIFICATION_PRIORITY_LOW; }
  static get NOTIFICATION_PRIORITY_MAX() { return plugin().NOTIFICATION_PRIORITY_MAX; }
  static get NOTIFICATION_PRIORITY_MIN() { return plugin().NOTIFICATION_PRIORITY_MIN; }

  static get ACTIVITY_TYPE_OTHER() { return plugin().ACTIVITY_TYPE_OTHER; }
  static get ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION() { return plugin().ACTIVITY_TYPE_AUTOMOTIVE_NAVIGATION; }
  static get ACTIVITY_TYPE_FITNESS() { return plugin().ACTIVITY_TYPE_FITNESS; }
  static get ACTIVITY_TYPE_OTHER_NAVIGATION() { return plugin().ACTIVITY_TYPE_OTHER_NAVIGATION; }

  static get PERSIST_MODE_ALL()       { return plugin().PERSIST_MODE_ALL; }
  static get PERSIST_MODE_LOCATION()  { return plugin().PERSIST_MODE_LOCATION; }
  static get PERSIST_MODE_GEOFENCE()  { return plugin().PERSIST_MODE_GEOFENCE; }
  static get PERSIST_MODE_NONE()      { return plugin().PERSIST_MODE_NONE; }

  static get ACCURACY_AUTHORIZATION_FULL() { return plugin().ACCURACY_AUTHORIZATION_FULL; }
  static get ACCURACY_AUTHORIZATION_REDUCED() { return plugin().ACCURACY_AUTHORIZATION_REDUCED; }

  static get logger() { return plugin().logger; }

  static get deviceSettings() { return plugin().deviceSettings; }

  static ready(config:any, success?:Function, failure?:Function) {
    const bgGeo = plugin();
    return bgGeo.ready.apply(bgGeo, arguments);
  }
  static configure() {
    const bgGeo = plugin();
    return bgGeo.configure.apply(bgGeo, arguments);
  }
  static reset() {
    const bgGeo = plugin();
    return bgGeo.reset.apply(bgGeo, arguments);
  }

  static onLocation(success: Function, failure: Function) {
    const bgGeo = plugin();
    return bgGeo.onLocation.apply(bgGeo, arguments);
  }
  static onMotionChange(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onMotionChange.apply(bgGeo, arguments);
  }
  static onHttp(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onHttp.apply(bgGeo, arguments);
  }
  static onHeartbeat(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onHeartbeat.apply(bgGeo, arguments);
  }
  static onProviderChange(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onProviderChange.apply(bgGeo, arguments);
  }
  static onActivityChange(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onActivityChange.apply(bgGeo, arguments);
  }
  static onGeofence(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onGeofence.apply(bgGeo, arguments);
  }
  static onGeofencesChange(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onGeofencesChange.apply(bgGeo, arguments);
  }
  static onSchedule(callback: Function) {
    const bgGeo = plugin();
    return bgGeo.onSchedule.apply(bgGeo, arguments);
  }
  static onEnabledChange(callback:Function) {
    const bgGeo = plugin();
    return bgGeo.onEnabledChange.apply(bgGeo, arguments);
  }
  static onConnectivityChange(callback:Function) {
    const bgGeo = plugin();
    return bgGeo.onConnectivityChange.apply(bgGeo, arguments);
  }
  static onPowerSaveChange(callback:Function) {
    const bgGeo = plugin();
    return bgGeo.onPowerSaveChange.apply(bgGeo, arguments);
  }
  static onNotificationAction(callback:Function) {
    const bgGeo = plugin();
    return bgGeo.onNotificationAction.apply(bgGeo, arguments);
  }
  static onAuthorization(callback:Function) {
    const bgGeo = plugin();
    return bgGeo.onAuthorization.apply(bgGeo, arguments);
  }
  static on() {
    const bgGeo = plugin();
    return bgGeo.on.apply(bgGeo, arguments);
  }
  static un() {
    const bgGeo = plugin();
    return bgGeo.un.apply(bgGeo, arguments);
  }
  static removeListener() {
    const bgGeo = plugin();
    return bgGeo.removeListener.apply(bgGeo, arguments);
  }
  static removeListeners() {
    const bgGeo = plugin();
    return bgGeo.removeListeners.apply(bgGeo, arguments);
  }
  static getState() {
    const bgGeo = plugin();
    return bgGeo.getState.apply(bgGeo, arguments);
  }
  static start() {
    const bgGeo = plugin();
    return bgGeo.start.apply(bgGeo, arguments);
  }
  static stop() {
    const bgGeo = plugin();
    return bgGeo.stop.apply(bgGeo, arguments);
  }
  static startSchedule() {
    const bgGeo = plugin();
    return bgGeo.startSchedule.apply(bgGeo, arguments);
  }
  static stopSchedule() {
    const bgGeo = plugin();
    return bgGeo.stopSchedule.apply(bgGeo, arguments);
  }
  static startGeofences() {
    const bgGeo = plugin();
    return bgGeo.startGeofences.apply(bgGeo, arguments);
  }
  static startBackgroundTask() {
    const bgGeo = plugin();
    return bgGeo.startBackgroundTask.apply(bgGeo, arguments);
  }
  // TODO rename native method -> #stopBackgroundTask
  static stopBackgroundTask() {
    const bgGeo = plugin();
    return bgGeo.stopBackgroundTask.apply(bgGeo, arguments);
  }
  // @deprecated.
  static finish() {
    return BackgroundGeolocation.stopBackgroundTask();
  }
  static changePace() {
    const bgGeo = plugin();
    return bgGeo.changePace.apply(bgGeo, arguments);
  }
  static setConfig() {
    const bgGeo = plugin();
    return bgGeo.setConfig.apply(bgGeo, arguments);
  }
  static getLocations() {
    const bgGeo = plugin();
    return bgGeo.getLocations.apply(bgGeo, arguments);
  }
  static getCount() {
    const bgGeo = plugin();
    return bgGeo.getCount.apply(bgGeo, arguments);
  }
  static destroyLocations() {
    const bgGeo = plugin();
    return bgGeo.destroyLocations.apply(bgGeo, arguments);
  }
  static destroyLocation(uuid:string) {
    const bgGeo = plugin();
    return bgGeo.destroyLocation(uuid);
  }
  static insertLocation() {
    const bgGeo = plugin();
    return bgGeo.insertLocation.apply(bgGeo, arguments);
  }
  static sync() {
    const bgGeo = plugin();
    return bgGeo.sync.apply(bgGeo, arguments);
  }
  static getOdometer() {
    const bgGeo = plugin();
    return bgGeo.getOdometer.apply(bgGeo, arguments);
  }
  static resetOdometer() {
    const bgGeo = plugin();
    return bgGeo.resetOdometer.apply(bgGeo, arguments);
  }
  static setOdometer() {
    const bgGeo = plugin();
    return bgGeo.setOdometer.apply(bgGeo, arguments);
  }
  static addGeofence() {
    const bgGeo = plugin();
    return bgGeo.addGeofence.apply(bgGeo, arguments);
  }
  static removeGeofence() {
    const bgGeo = plugin();
    return bgGeo.removeGeofence.apply(bgGeo, arguments);
  }
  static addGeofences() {
    const bgGeo = plugin();
    return bgGeo.addGeofences.apply(bgGeo, arguments);
  }
  static removeGeofences() {
    const bgGeo = plugin();
    return bgGeo.removeGeofences.apply(bgGeo, arguments);
  }
  static getGeofences() {
    const bgGeo = plugin();
    return bgGeo.getGeofences.apply(bgGeo, arguments);
  }
  static getGeofence() {
    const bgGeo = plugin();
    return bgGeo.getGeofence.apply(bgGeo, arguments);
  }
  static geofenceExists() {
    const bgGeo = plugin();
    return bgGeo.geofenceExists.apply(bgGeo, arguments);
  }
  static getCurrentPosition() {
    const bgGeo = plugin();
    return bgGeo.getCurrentPosition.apply(bgGeo, arguments);
  }
  static watchPosition() {
    const bgGeo = plugin();
    return bgGeo.watchPosition.apply(bgGeo, arguments);
  }
  static stopWatchPosition() {
    const bgGeo = plugin();
    return bgGeo.stopWatchPosition.apply(bgGeo, arguments);
  }
  static registerHeadlessTask() {
    const bgGeo = plugin();
    return bgGeo.registerHeadlessTask.apply(bgGeo, arguments);
  }
  static setLogLevel() {
    const bgGeo = plugin();
    return bgGeo.setLogLevel.apply(bgGeo, arguments);
  }
  static getLog() {
    const bgGeo = plugin();
    return bgGeo.getLog.apply(bgGeo, arguments);
  }
  static destroyLog() {
    const bgGeo = plugin();
    return bgGeo.destroyLog.apply(bgGeo, arguments);
  }
  static emailLog() {
    const bgGeo = plugin();
    return bgGeo.emailLog.apply(bgGeo, arguments);
  }
  static isPowerSaveMode() {
    const bgGeo = plugin();
    return bgGeo.isPowerSaveMode.apply(bgGeo, arguments);
  }
  static getSensors() {
    const bgGeo = plugin();
    return bgGeo.getSensors.apply(bgGeo, arguments);
  }
  static getDeviceInfo() {
    const bgGeo = plugin();
    return bgGeo.getDeviceInfo.apply(bgGeo, arguments);
  }
  static playSound() {
    const bgGeo = plugin();
    return bgGeo.playSound.apply(bgGeo, arguments);
  }
  static transistorTrackerParams() {
    const bgGeo = plugin();
    return bgGeo.transistorTrackerParams.apply(bgGeo, arguments);
  }
  static findOrCreateTransistorAuthorizationToken(orgname:string, username:string, host?:string) {
    const bgGeo = plugin();
    return bgGeo.findOrCreateTransistorAuthorizationToken.apply(bgGeo, arguments);
  }
  static destroyTransistorAuthorizationToken(host:string) {
    const bgGeo = plugin();
    return bgGeo.destroyTransistorAuthorizationToken.apply(bgGeo, arguments);
  }
  static getProviderState() {
    const bgGeo = plugin();
    return bgGeo.getProviderState.apply(bgGeo, arguments);
  }
  static requestPermission() {
    const bgGeo = plugin();
    return bgGeo.requestPermission.apply(bgGeo, arguments);
  }
  static requestTemporaryFullAccuracy() {
    const bgGeo = plugin();
    return bgGeo.requestTemporaryFullAccuracy.apply(bgGeo, arguments);
  }
}