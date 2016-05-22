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
@property (nonatomic, strong) NSMutableArray* locationListeners;
@property (nonatomic, strong) NSMutableArray* currentPositionListeners;
@property (nonatomic, strong) NSMutableArray* geofenceListeners;
@property (nonatomic, strong) NSMutableArray* motionChangeListeners;
@property (nonatomic, strong) NSMutableArray* httpListeners;
@property (nonatomic, strong) NSMutableArray* heartbeatListeners;
@property (nonatomic, strong) NSMutableArray* scheduleListeners;

- (void) configure:(CDVInvokedUrlCommand*)command;
- (void) start:(CDVInvokedUrlCommand*)command;
- (void) stop:(CDVInvokedUrlCommand*)command;
- (void) startSchedule:(CDVInvokedUrlCommand*)command;
- (void) stopSchedule:(CDVInvokedUrlCommand*)command;
- (void) finish:(CDVInvokedUrlCommand*)command;
- (void) error:(CDVInvokedUrlCommand*)command;
- (void) changePace:(CDVInvokedUrlCommand*)command;
- (void) setConfig:(CDVInvokedUrlCommand*)command;
- (void) addMotionChangeListener:(CDVInvokedUrlCommand*)command;
- (void) addHeartbeatListener:(CDVInvokedUrlCommand*)command;
- (void) getStationaryLocation:(CDVInvokedUrlCommand *)command;
- (void) getLocations:(CDVInvokedUrlCommand *)command;
- (void) sync:(CDVInvokedUrlCommand *)command;
- (void) addLocationListener:(CDVInvokedUrlCommand *)command;
- (void) addHttpListener:(CDVInvokedUrlCommand *)command;
- (void) getOdometer:(CDVInvokedUrlCommand *)command;
- (void) resetOdometer:(CDVInvokedUrlCommand *)command;
- (void) addGeofence:(CDVInvokedUrlCommand *)command;
- (void) addGeofences:(CDVInvokedUrlCommand *)command;
- (void) removeGeofence:(CDVInvokedUrlCommand *)command;
- (void) addScheduleListener:(CDVInvokedUrlCommand *)command;
- (void) getGeofences:(CDVInvokedUrlCommand *)command;
- (void) onGeofence:(CDVInvokedUrlCommand *)command;
- (void) getCurrentPosition:(CDVInvokedUrlCommand *)command;
- (void) clearDatabase:(CDVInvokedUrlCommand *) command;
- (void) insertLocation:(CDVInvokedUrlCommand *) command;
- (void) getCount:(CDVInvokedUrlCommand *) command;
- (void) getLog:(CDVInvokedUrlCommand *) command;
- (void) emailLog:(CDVInvokedUrlCommand*) command;
- (void) playSound:(CDVInvokedUrlCommand *)command;
@end


