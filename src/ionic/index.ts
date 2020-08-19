const plugin = function() {
	return (<any>window).BackgroundGeolocation;
}

export default class BackgroundGeolocation {

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
    let bgGeo = plugin();
    return bgGeo.ready.apply(bgGeo, arguments);
  }
  static configure() {
    let bgGeo = plugin();
    return bgGeo.configure.apply(bgGeo, arguments);
  }
  static reset() {
    let bgGeo = plugin();
    return bgGeo.reset.apply(bgGeo, arguments);
  }

  static onLocation(success: Function, failure: Function) {
    let bgGeo = plugin();
    bgGeo.onLocation.apply(bgGeo, arguments);
  }
  static onMotionChange(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onMotionChange.apply(bgGeo, arguments);
  }
  static onHttp(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onHttp.apply(bgGeo, arguments);
  }
  static onHeartbeat(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onHeartbeat.apply(bgGeo, arguments);
  }
  static onProviderChange(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onProviderChange.apply(bgGeo, arguments);
  }
  static onActivityChange(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onActivityChange.apply(bgGeo, arguments);
  }
  static onGeofence(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onGeofence.apply(bgGeo, arguments);
  }
  static onGeofencesChange(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onGeofencesChange.apply(bgGeo, arguments);
  }
  static onSchedule(callback: Function) {
    let bgGeo = plugin();
    bgGeo.onSchedule.apply(bgGeo, arguments);
  }
  static onEnabledChange(callback:Function) {
    let bgGeo = plugin();
    bgGeo.onEnabledChange.apply(bgGeo, arguments);
  }
  static onConnectivityChange(callback:Function) {
    let bgGeo = plugin();
    bgGeo.onConnectivityChange.apply(bgGeo, arguments);
  }
  static onPowerSaveChange(callback:Function) {
    let bgGeo = plugin();
    bgGeo.onPowerSaveChange.apply(bgGeo, arguments);
  }
  static onNotificationAction(callback:Function) {
    let bgGeo = plugin();
    bgGeo.onNotificationAction.apply(bgGeo, arguments);
  }
  static onAuthorization(callback:Function) {
    let bgGeo = plugin();
    bgGeo.onAuthorization.apply(bgGeo, arguments);
  }
  static on() {
    let bgGeo = plugin();
    return bgGeo.on.apply(bgGeo, arguments);
  }
  static un() {
    let bgGeo = plugin();
    return bgGeo.un.apply(bgGeo, arguments);
  }
  static removeListener() {
    let bgGeo = plugin();
    return bgGeo.removeListener.apply(bgGeo, arguments);
  }
  static removeListeners() {
    let bgGeo = plugin();
    return bgGeo.removeListeners.apply(bgGeo, arguments);
  }
  static getState() {
    let bgGeo = plugin();
    return bgGeo.getState.apply(bgGeo, arguments);
  }
  static start() {
    let bgGeo = plugin();
    return bgGeo.start.apply(bgGeo, arguments);
  }
  static stop() {
    let bgGeo = plugin();
    return bgGeo.stop.apply(bgGeo, arguments);
  }
  static startSchedule() {
    let bgGeo = plugin();
    return bgGeo.startSchedule.apply(bgGeo, arguments);
  }
  static stopSchedule() {
    let bgGeo = plugin();
    return bgGeo.stopSchedule.apply(bgGeo, arguments);
  }
  static startGeofences() {
    let bgGeo = plugin();
    return bgGeo.startGeofences.apply(bgGeo, arguments);
  }
  static startBackgroundTask() {
    let bgGeo = plugin();
    return bgGeo.startBackgroundTask.apply(bgGeo, arguments);
  }
  // TODO rename native method -> #stopBackgroundTask
  static stopBackgroundTask() {
    let bgGeo = plugin();
    return bgGeo.stopBackgroundTask.apply(bgGeo, arguments);
  }
  // @deprecated.
  static finish() {
    return BackgroundGeolocation.stopBackgroundTask();
  }
  static changePace() {
    let bgGeo = plugin();
    return bgGeo.changePace.apply(bgGeo, arguments);
  }
  static setConfig() {
    let bgGeo = plugin();
    return bgGeo.setConfig.apply(bgGeo, arguments);
  }
  static getLocations() {
    let bgGeo = plugin();
    return bgGeo.getLocations.apply(bgGeo, arguments);
  }
  static getCount() {
    let bgGeo = plugin();
    return bgGeo.getCount.apply(bgGeo, arguments);
  }
  static destroyLocations() {
    let bgGeo = plugin();
    return bgGeo.destroyLocations.apply(bgGeo, arguments);
  }
  static destroyLocation(uuid:string) {
    let bgGeo = plugin();
    return bgGeo.destroyLocation(uuid);
  }
  static insertLocation() {
    let bgGeo = plugin();
    return bgGeo.insertLocation.apply(bgGeo, arguments);
  }
  static sync() {
    let bgGeo = plugin();
    return bgGeo.sync.apply(bgGeo, arguments);
  }
  static getOdometer() {
    let bgGeo = plugin();
    return bgGeo.getOdometer.apply(bgGeo, arguments);
  }
  static resetOdometer() {
    let bgGeo = plugin();
    return bgGeo.resetOdometer.apply(bgGeo, arguments);
  }
  static setOdometer() {
    let bgGeo = plugin();
    return bgGeo.setOdometer.apply(bgGeo, arguments);
  }
  static addGeofence() {
    let bgGeo = plugin();
    return bgGeo.addGeofence.apply(bgGeo, arguments);
  }
  static removeGeofence() {
    let bgGeo = plugin();
    return bgGeo.removeGeofence.apply(bgGeo, arguments);
  }
  static addGeofences() {
    let bgGeo = plugin();
    return bgGeo.addGeofences.apply(bgGeo, arguments);
  }
  static removeGeofences() {
    let bgGeo = plugin();
    return bgGeo.removeGeofences.apply(bgGeo, arguments);
  }
  static getGeofences() {
    let bgGeo = plugin();
    return bgGeo.getGeofences.apply(bgGeo, arguments);
  }
  static getGeofence() {
    let bgGeo = plugin();
    return bgGeo.getGeofence.apply(bgGeo, arguments);
  }
  static geofenceExists() {
    let bgGeo = plugin();
    return bgGeo.geofenceExists.apply(bgGeo, arguments);
  }
  static getCurrentPosition() {
    let bgGeo = plugin();
    return bgGeo.getCurrentPosition.apply(bgGeo, arguments);
  }
  static watchPosition() {
    let bgGeo = plugin();
    return bgGeo.watchPosition.apply(bgGeo, arguments);
  }
  static stopWatchPosition() {
    let bgGeo = plugin();
    return bgGeo.stopWatchPosition.apply(bgGeo, arguments);
  }
  static registerHeadlessTask() {
    let bgGeo = plugin();
    return bgGeo.registerHeadlessTask.apply(bgGeo, arguments);
  }
  static setLogLevel() {
    let bgGeo = plugin();
    return bgGeo.setLogLevel.apply(bgGeo, arguments);
  }
  static getLog() {
    let bgGeo = plugin();
    return bgGeo.getLog.apply(bgGeo, arguments);
  }
  static destroyLog() {
    let bgGeo = plugin();
    return bgGeo.destroyLog.apply(bgGeo, arguments);
  }
  static emailLog() {
    let bgGeo = plugin();
    return bgGeo.emailLog.apply(bgGeo, arguments);
  }
  static isPowerSaveMode() {
    let bgGeo = plugin();
    return bgGeo.isPowerSaveMode.apply(bgGeo, arguments);
  }
  static getSensors() {
    let bgGeo = plugin();
    return bgGeo.getSensors.apply(bgGeo, arguments);
  }
  static getDeviceInfo() {
    let bgGeo = plugin();
    return bgGeo.getDeviceInfo.apply(bgGeo, arguments);
  }
  static playSound() {
    let bgGeo = plugin();
    return bgGeo.playSound.apply(bgGeo, arguments);
  }
  static transistorTrackerParams() {
    let bgGeo = plugin();
    return bgGeo.transistorTrackerParams.apply(bgGeo, arguments);
  }
  static findOrCreateTransistorAuthorizationToken(orgname:string, username:string, host?:string) {
    let bgGeo = plugin();
    return bgGeo.findOrCreateTransistorAuthorizationToken.apply(bgGeo, arguments);
  }
  static destroyTransistorAuthorizationToken(host:string) {
    let bgGeo = plugin();
    return bgGeo.destroyTransistorAuthorizationToken.apply(bgGeo, arguments);
  }
  static getProviderState() {
    let bgGeo = plugin();
    return bgGeo.getProviderState.apply(bgGeo, arguments);
  }
  static requestPermission() {
    let bgGeo = plugin();
    return bgGeo.requestPermission.apply(bgGeo, arguments);
  }
  static requestTemporaryFullAccuracy() {
    let bgGeo = plugin();
    return bgGeo.requestTemporaryFullAccuracy.apply(bgGeo, arguments);
  }
}