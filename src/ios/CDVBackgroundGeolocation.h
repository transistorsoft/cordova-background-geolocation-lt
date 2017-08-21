//
//  CDVBackgroundGeoLocation.h
//
//  Created by Chris Scott <chris@transistorsoft.com>
//

#import <Cordova/CDVPlugin.h>
#import <TSLocationManager/TSLocationManager.h>

@interface CDVBackgroundGeolocation : CDVPlugin

@property (nonatomic, strong) NSString* syncCallbackId;
@property (nonatomic) UIBackgroundTaskIdentifier syncTaskId;

- (void) configure:(CDVInvokedUrlCommand*)command;
- (void) removeListener:(CDVInvokedUrlCommand*)command;
- (void) removeListeners:(CDVInvokedUrlCommand*)command;
- (void) start:(CDVInvokedUrlCommand*)command;
- (void) stop:(CDVInvokedUrlCommand*)command;
- (void) startSchedule:(CDVInvokedUrlCommand*)command;
- (void) stopSchedule:(CDVInvokedUrlCommand*)command;
- (void) startGeofences:(CDVInvokedUrlCommand*)command;
- (void) startBackgroundTask:(CDVInvokedUrlCommand*)command;
- (void) finish:(CDVInvokedUrlCommand*)command;
- (void) error:(CDVInvokedUrlCommand*)command;
- (void) changePace:(CDVInvokedUrlCommand*)command;
- (void) setConfig:(CDVInvokedUrlCommand*)command;
- (void) addLocationListener:(CDVInvokedUrlCommand *)command;
- (void) addHttpListener:(CDVInvokedUrlCommand *)command;
- (void) addMotionChangeListener:(CDVInvokedUrlCommand*)command;
- (void) addActivityChangeListener:(CDVInvokedUrlCommand*)command;
- (void) addProviderChangeListener:(CDVInvokedUrlCommand*)command;
- (void) addGeofencesChangeListener:(CDVInvokedUrlCommand*)command;
- (void) addGeofenceListener:(CDVInvokedUrlCommand *)command;
- (void) addHeartbeatListener:(CDVInvokedUrlCommand*)command;
- (void) getStationaryLocation:(CDVInvokedUrlCommand *)command;
- (void) getLocations:(CDVInvokedUrlCommand *)command;
- (void) sync:(CDVInvokedUrlCommand *)command;
- (void) getOdometer:(CDVInvokedUrlCommand *)command;
- (void) addGeofence:(CDVInvokedUrlCommand *)command;
- (void) addGeofences:(CDVInvokedUrlCommand *)command;
- (void) removeGeofence:(CDVInvokedUrlCommand *)command;
- (void) addScheduleListener:(CDVInvokedUrlCommand *)command;
- (void) getGeofences:(CDVInvokedUrlCommand *)command;
- (void) getCurrentPosition:(CDVInvokedUrlCommand *)command;
- (void) watchPosition:(CDVInvokedUrlCommand *)command;
- (void) stopWatchPosition:(CDVInvokedUrlCommand *)command;
- (void) clearDatabase:(CDVInvokedUrlCommand *) command;
- (void) destroyLocations:(CDVInvokedUrlCommand *) command;
- (void) insertLocation:(CDVInvokedUrlCommand *) command;
- (void) getCount:(CDVInvokedUrlCommand *) command;
- (void) getLog:(CDVInvokedUrlCommand *) command;
- (void) destroyLog:(CDVInvokedUrlCommand *) command;
- (void) setLogLevel:(CDVInvokedUrlCommand *) command;
- (void) emailLog:(CDVInvokedUrlCommand*) command;
- (void) playSound:(CDVInvokedUrlCommand *)command;
- (void) log:(CDVInvokedUrlCommand*)command;
@end


