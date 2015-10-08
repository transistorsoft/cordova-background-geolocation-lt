////
//  CDVBackgroundGeolocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//
#import "CDVBackgroundGeolocation.h"

@implementation CDVBackgroundGeolocation {
    TSLocationManager *bgGeo;
    NSDictionary *config;
}

@synthesize syncCallbackId, syncTaskId, locationCallbackId, geofenceListeners, stationaryRegionListeners, motionChangeListeners, currentPositionListeners;

- (void)pluginInitialize
{
    bgGeo = [[TSLocationManager alloc] init];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onLocationChanged:) name:@"TSLocationManager.location" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onLocationTimeout:) name:@"TSLocationManager.locationtimeout" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onMotionChange:) name:@"TSLocationManager.motionchange" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onEnterGeofence:) name:@"TSLocationManager.geofence" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onSyncComplete:) name:@"TSLocationManager.sync" object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onLocationManagerError:) name:@"TSLocationManager.error" object:nil];
}

/**
 * configure plugin
 * @param {String} token
 * @param {String} url
 * @param {Number} stationaryRadius
 * @param {Number} distanceFilter
 */
- (void) configure:(CDVInvokedUrlCommand*)command
{
    self.locationCallbackId = command.callbackId;
    
    config = [command.arguments objectAtIndex:0];

    [bgGeo configure:config];
}

- (void) setConfig:(CDVInvokedUrlCommand*)command
{
    NSDictionary *cfg  = [command.arguments objectAtIndex:0];
    [bgGeo setConfig:cfg];
    
    CDVPluginResult* result = nil;
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) getState:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[bgGeo getState]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Turn on background geolocation
 */
- (void) start:(CDVInvokedUrlCommand*)command
{
    [bgGeo start];

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: true];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}
/**
 * Turn it off
 */
- (void) stop:(CDVInvokedUrlCommand*)command
{
    [bgGeo stop];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: false];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}
- (void) getOdometer:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble: bgGeo.odometer];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}
- (void) resetOdometer:(CDVInvokedUrlCommand*)command
{
    bgGeo.odometer = 0;
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Change pace to moving/stopped
 * @param {Boolean} isMoving
 */
- (void) changePace:(CDVInvokedUrlCommand *)command
{
    BOOL moving = [[command.arguments objectAtIndex: 0] boolValue];
    [bgGeo changePace:moving];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: moving];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * location handler from BackgroundGeolocation
 */
- (void)onLocationChanged:(NSNotification*)notification {
    CLLocation *location = [notification.userInfo objectForKey:@"location"];
    
    NSDictionary *locationData = [bgGeo locationToDictionary:location];
    NSDictionary *params = @{
        @"location": locationData,
        @"taskId": @([bgGeo createBackgroundTask])
    };
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
    [result setKeepCallbackAsBool:YES];

    [self.commandDelegate runInBackground:^{
        [self.commandDelegate sendPluginResult:result callbackId:self.locationCallbackId];
    }];

    if ([self.currentPositionListeners count]) {
        for (NSString *callbackId in self.currentPositionListeners) {
            NSDictionary *params = @{
                @"location": locationData,
                @"taskId": @([bgGeo createBackgroundTask])
            };
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
            [result setKeepCallbackAsBool:NO];
            [self.commandDelegate runInBackground:^{
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }];       
        }
        [self.currentPositionListeners removeAllObjects];
    }
}

- (void)onLocationTimeout:(NSNotification*)notification {
    if ([self.currentPositionListeners count]) {
        for (NSString *callbackId in self.currentPositionListeners) {
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"timeout"];
            [result setKeepCallbackAsBool:NO];
            [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        }
        [self.currentPositionListeners removeAllObjects];
    }
}

- (void) onMotionChange:(NSNotification*)notification
{
    if (![self.stationaryRegionListeners count] && ![self.motionChangeListeners count]) {
        return;
    }
    BOOL isMoving               = [[notification.userInfo objectForKey:@"isMoving"] boolValue];
    CLLocation *location        = [notification.userInfo objectForKey:@"location"];
    NSDictionary *locationData  = [bgGeo locationToDictionary:location];

    // @deprecated stationaryRegionListeners in favour of dual-function motionChangeListeners
    if (!isMoving) {
        for (NSString *callbackId in self.stationaryRegionListeners) {
            NSLog(@"- CALLBACK: %@", callbackId);
            NSDictionary *params = @{
                @"isMoving": @(isMoving),
                @"location": locationData,
                @"taskId": @([bgGeo createBackgroundTask])
            };
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate runInBackground:^{
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }];
        }
    }
    for (NSString *callbackId in self.motionChangeListeners) {
        NSDictionary *params = @{
            @"isMoving": @(isMoving),
            @"location": locationData,
            @"taskId": @([bgGeo createBackgroundTask])
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [self.commandDelegate runInBackground:^{
            [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        }];
    }
}

- (void) onEnterGeofence:(NSNotification*)notification
{
    if (![self.geofenceListeners count]) {
        return;
    }
    NSLog(@"- onEnterGeofence: %@", notification.userInfo);
    
    CLCircularRegion *region = [notification.userInfo objectForKey:@"geofence"];
    CLLocation *location     = [notification.userInfo objectForKey:@"location"];

    for (NSString *callbackId in self.geofenceListeners) {
        NSDictionary *params = @{
            @"identifier": region.identifier,
            @"action": [notification.userInfo objectForKey:@"action"],
            @"location": [bgGeo locationToDictionary:location],
            @"taskId": @([bgGeo createBackgroundTask])
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [self.commandDelegate runInBackground:^{
            [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        }];       
    }
}

- (void) onSyncComplete:(NSNotification*)notification
{
    if (syncCallbackId == nil) {
        return;
    }
    NSDictionary *params = @{
        @"locations": [notification.userInfo objectForKey:@"locations"],
        @"taskId": @(syncTaskId)
    };
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
    [self.commandDelegate sendPluginResult:result callbackId:syncCallbackId];
    
    // Ready for another sync task.
    syncCallbackId  = nil;
    syncTaskId      = UIBackgroundTaskInvalid;
}

/**
 * Fetches current stationaryLocation
 */
- (void) getStationaryLocation:(CDVInvokedUrlCommand *)command
{
    NSDictionary* location = [bgGeo getStationaryLocation];
    
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:location];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Fetches current stationaryLocation
 */
- (void) getLocations:(CDVInvokedUrlCommand *)command
{   
    NSDictionary *params = @{
        @"locations": [bgGeo getLocations],
        @"taskId": @([bgGeo createBackgroundTask])
    };
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Fetches current stationaryLocation
 */
- (void) sync:(CDVInvokedUrlCommand *)command
{
    if (syncCallbackId != nil) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"A sync action is already in progress."];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    // Important to set these before we execute #sync since this fires a *very fast* async NSNotification event!
    syncCallbackId  = command.callbackId;
    syncTaskId      = [bgGeo createBackgroundTask];

    NSArray* locations = [bgGeo sync];
    if (locations == nil) {
        syncCallbackId  = nil;
        syncTaskId      = UIBackgroundTaskInvalid;
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Sync failed.  Is there a network connection?"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void) addStationaryRegionListener:(CDVInvokedUrlCommand*)command
{
    if (self.stationaryRegionListeners == nil) {
        self.stationaryRegionListeners = [[NSMutableArray alloc] init];
    }
    [self.stationaryRegionListeners addObject:command.callbackId];
}

- (void) addMotionChangeListener:(CDVInvokedUrlCommand*)command
{
    if (self.motionChangeListeners == nil) {
        self.motionChangeListeners = [[NSMutableArray alloc] init];
    }
    [self.motionChangeListeners addObject:command.callbackId];
}

- (void) addGeofence:(CDVInvokedUrlCommand*)command
{
    NSDictionary *cfg  = [command.arguments objectAtIndex:0];
    NSString *notifyOnExit = [cfg objectForKey:@"notifyOnExit"];
    NSString *notifyOnEntry = [cfg objectForKey:@"notifyOnEntry"];

    [bgGeo addGeofence:[cfg objectForKey:@"identifier"] 
        radius:[[cfg objectForKey:@"radius"] doubleValue] 
        latitude:[[cfg objectForKey:@"latitude"] doubleValue] 
        longitude:[[cfg objectForKey:@"longitude"] doubleValue]
        notifyOnEntry: (notifyOnEntry) ? [notifyOnEntry boolValue] : NO
        notifyOnExit: (notifyOnExit) ? [notifyOnExit boolValue] : NO
    ];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) removeGeofence:(CDVInvokedUrlCommand*)command
{
    NSString *identifier  = [command.arguments objectAtIndex:0];
    CDVPluginResult *result;
    if ([bgGeo removeGeofence:identifier]) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Failed to locate geofence"];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) getGeofences:(CDVInvokedUrlCommand*)command
{
    NSMutableArray *rs = [[NSMutableArray alloc] init];
    for (CLCircularRegion *geofence in [bgGeo getGeofences]) {
        [rs addObject:@{
            @"identifier":geofence.identifier,
            @"radius": @(geofence.radius),
            @"latitude": @(geofence.center.latitude),
            @"longitude": @(geofence.center.longitude)
        }];
    }
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:rs];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) onGeofence:(CDVInvokedUrlCommand*)command
{
    if (self.geofenceListeners == nil) {
        self.geofenceListeners = [[NSMutableArray alloc] init];
    }
    [self.geofenceListeners addObject:command.callbackId];
}

- (void) getCurrentPosition:(CDVInvokedUrlCommand*)command
{
    NSDictionary *options  = [command.arguments objectAtIndex:0];
    if (self.currentPositionListeners == nil) {
        self.currentPositionListeners = [[NSMutableArray alloc] init];
    }
    [self.currentPositionListeners addObject:command.callbackId];
    [bgGeo updateCurrentPosition:options];
}

- (void) playSound:(CDVInvokedUrlCommand*)command
{
    SystemSoundID soundId = [[command.arguments objectAtIndex:0] intValue];
    [bgGeo playSound: soundId];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Called by js to signify the end of a background-geolocation event
 */
-(void) finish:(CDVInvokedUrlCommand*)command
{
    UIBackgroundTaskIdentifier taskId = [[command.arguments objectAtIndex: 0] integerValue];
    [bgGeo stopBackgroundTask:taskId];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

/**
 * Called by js to signal a caught exception from application code.
 */
-(void) error:(CDVInvokedUrlCommand*)command
{
    UIBackgroundTaskIdentifier taskId = [[command.arguments objectAtIndex: 0] integerValue];
    NSString *error = [command.arguments objectAtIndex:1];
    [bgGeo error:taskId message:error];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

- (void) onLocationManagerError:(NSNotification*)notification
{
    NSLog(@" - onLocationManagerError: %@", notification.userInfo);

    NSString *errorType = [notification.userInfo objectForKey:@"type"];
    if ([errorType isEqualToString:@"location"]) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:[[notification.userInfo objectForKey:@"code"] intValue]];
        if ([self.currentPositionListeners count]) {
            [result setKeepCallbackAsBool:NO];
            for (NSString *callbackId in self.currentPositionListeners) {
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }
            [self.currentPositionListeners removeAllObjects];
        }

        [result setKeepCallbackAsBool:YES];
        [self.commandDelegate sendPluginResult:result callbackId:locationCallbackId];
    }
}

/**
 * If you don't stopMonitoring when application terminates, the app will be awoken still when a
 * new location arrives, essentially monitoring the user's location even when they've killed the app.
 * Might be desirable in certain apps.
 */
- (void)applicationWillTerminate:(UIApplication *)application {
}

@end
