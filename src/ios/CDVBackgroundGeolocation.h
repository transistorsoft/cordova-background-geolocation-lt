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
@property (nonatomic, strong) NSString* locationCallbackId;
@property (nonatomic, strong) NSMutableArray* currentPositionListeners;
@property (nonatomic, strong) NSMutableArray* geofenceListeners;
@property (nonatomic, strong) NSMutableArray* motionChangeListeners;
@property (nonatomic, strong) NSMutableArray* httpListeners;

- (void) configure:(CDVInvokedUrlCommand*)command;
- (void) start:(CDVInvokedUrlCommand*)command;
- (void) stop:(CDVInvokedUrlCommand*)command;
- (void) finish:(CDVInvokedUrlCommand*)command;
- (void) error:(CDVInvokedUrlCommand*)command;
- (void) changePace:(CDVInvokedUrlCommand*)command;
- (void) setConfig:(CDVInvokedUrlCommand*)command;
- (void) addMotionChangeListener:(CDVInvokedUrlCommand*)command;
- (void) getStationaryLocation:(CDVInvokedUrlCommand *)command;
- (void) getLocations:(CDVInvokedUrlCommand *)command;
- (void) sync:(CDVInvokedUrlCommand *)command;
- (void) addHttpListener:(CDVInvokedUrlCommand *)command;
- (void) getOdometer:(CDVInvokedUrlCommand *)command;
- (void) resetOdometer:(CDVInvokedUrlCommand *)command;
- (void) addGeofence:(CDVInvokedUrlCommand *)command;
- (void) removeGeofence:(CDVInvokedUrlCommand *)command;
- (void) getGeofences:(CDVInvokedUrlCommand *)command;
- (void) onGeofence:(CDVInvokedUrlCommand *)command;
- (void) getCurrentPosition:(CDVInvokedUrlCommand *)command;
- (void) clearDatabase:(CDVInvokedUrlCommand *) command;
- (void) playSound:(CDVInvokedUrlCommand *)command;
@end


