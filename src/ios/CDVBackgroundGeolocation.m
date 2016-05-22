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

@synthesize syncCallbackId, syncTaskId, locationListeners, geofenceListeners, motionChangeListeners, currentPositionListeners, httpListeners, heartbeatListeners, scheduleListeners;

- (void)pluginInitialize
{
    bgGeo = [[TSLocationManager alloc] init];
    bgGeo.viewController = self.viewController;
    // New style:  Use blocks instead of NSNotificationCenter
    bgGeo.locationChangedBlock  = [self createLocationChangedHandler];
    bgGeo.motionChangedBlock    = [self createMotionChangedHandler];
    bgGeo.heartbeatBlock        = [self createHeartbeatHandler];
    bgGeo.geofenceBlock         = [self createGeofenceHandler];
    bgGeo.syncCompleteBlock     = [self createSyncCompleteHandler];
    bgGeo.httpResponseBlock     = [self createHttpResponseHandler];
    bgGeo.errorBlock            = [self createErrorHandler];
    bgGeo.scheduleBlock         = [self createScheduleHandler];
    
    locationListeners   = [NSMutableArray new];
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
    //self.locationCallbackId = command.callbackId;
    [self.locationListeners addObject:command.callbackId];
    
    config = [command.arguments objectAtIndex:0];
    NSDictionary *state = [bgGeo configure:config];
    
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:state];
    
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) setConfig:(CDVInvokedUrlCommand*)command
{
    NSDictionary *cfg  = [command.arguments objectAtIndex:0];
    
    [self.commandDelegate runInBackground:^{
        [bgGeo setConfig:cfg];
        CDVPluginResult* result = nil;
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
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
    [self.commandDelegate runInBackground:^{
        [bgGeo start];
        dispatch_sync(dispatch_get_main_queue(), ^{
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: true];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
    
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

- (void) startSchedule:(CDVInvokedUrlCommand*)command
{
    [bgGeo startSchedule];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: false];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) stopSchedule:(CDVInvokedUrlCommand*)command
{
    [bgGeo stopSchedule];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: false];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}


- (void) getOdometer:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble: [bgGeo getOdometer]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) resetOdometer:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        [bgGeo resetOdometer];
    }];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
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
    [self.commandDelegate runInBackground:^{
        NSDictionary *params = @{
            @"locations": [bgGeo getLocations],
            @"taskId": @([bgGeo createBackgroundTask])
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        dispatch_sync(dispatch_get_main_queue(), ^{
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
    
}

- (void) clearDatabase:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        BOOL success = [bgGeo clearDatabase];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus: (success) ? CDVCommandStatus_OK : CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
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

    [self.commandDelegate runInBackground:^{
        NSArray* locations = [bgGeo sync];
        if (locations == nil) {
            syncCallbackId  = nil;
            [bgGeo stopBackgroundTask:syncTaskId];
            syncTaskId      = UIBackgroundTaskInvalid;
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Sync failed.  Is there a network connection or previous sync-task pending?"];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }
    }];
}

- (void) addLocationListener:(CDVInvokedUrlCommand*) command
{
    [self.locationListeners addObject:command.callbackId];
}

- (void) addHttpListener:(CDVInvokedUrlCommand*)command
{
    if (httpListeners == nil) {
        httpListeners = [[NSMutableArray alloc] init];
    }
    [httpListeners addObject:command.callbackId];
}

- (void) addMotionChangeListener:(CDVInvokedUrlCommand*)command
{
    if (motionChangeListeners == nil) {
        motionChangeListeners = [[NSMutableArray alloc] init];
    }
    [motionChangeListeners addObject:command.callbackId];
}

- (void) addHeartbeatListener:(CDVInvokedUrlCommand*)command
{
    if (heartbeatListeners == nil) {
        heartbeatListeners = [[NSMutableArray alloc] init];
    }
    [heartbeatListeners addObject:command.callbackId];
}

- (void) addScheduleListener:(CDVInvokedUrlCommand*)command
{
    if (scheduleListeners == nil) {
        scheduleListeners = [[NSMutableArray alloc] init];
    }
    [scheduleListeners addObject:command.callbackId];
}

- (void) addGeofence:(CDVInvokedUrlCommand*)command
{
    NSDictionary *cfg  = [command.arguments objectAtIndex:0];
    NSString *notifyOnExit = [cfg objectForKey:@"notifyOnExit"];
    NSString *notifyOnEntry = [cfg objectForKey:@"notifyOnEntry"];

    [self.commandDelegate runInBackground:^{
        [bgGeo addGeofence:[cfg objectForKey:@"identifier"] 
            radius:[[cfg objectForKey:@"radius"] doubleValue] 
            latitude:[[cfg objectForKey:@"latitude"] doubleValue] 
            longitude:[[cfg objectForKey:@"longitude"] doubleValue]
            notifyOnEntry: (notifyOnEntry) ? [notifyOnEntry boolValue] : NO
            notifyOnExit: (notifyOnExit) ? [notifyOnExit boolValue] : NO
        ];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

        dispatch_sync(dispatch_get_main_queue(), ^{
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) addGeofences:(CDVInvokedUrlCommand*)command
{
    NSArray *geofences  = [command.arguments objectAtIndex:0];
    
    [self.commandDelegate runInBackground:^{
        [bgGeo addGeofences:geofences];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

        dispatch_sync(dispatch_get_main_queue(), ^{
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) removeGeofence:(CDVInvokedUrlCommand*)command
{
    NSString *identifier  = [command.arguments objectAtIndex:0];
    
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *result;
        if ([bgGeo removeGeofence:identifier]) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Failed to locate geofence"];
        }
        dispatch_sync(dispatch_get_main_queue(), ^{
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) removeGeofences:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *result;
        if ([bgGeo removeGeofences]) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Failed to remove geofences"];
        }
        dispatch_sync(dispatch_get_main_queue(), ^{
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) getGeofences:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
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
        dispatch_sync(dispatch_get_main_queue(), ^{
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) onGeofence:(CDVInvokedUrlCommand*)command
{
    if (geofenceListeners == nil) {
        geofenceListeners = [[NSMutableArray alloc] init];
    }
    [geofenceListeners addObject:command.callbackId];
}

- (void) getCurrentPosition:(CDVInvokedUrlCommand*)command
{
    NSDictionary *options  = [command.arguments objectAtIndex:0];
    if (currentPositionListeners == nil) {
        currentPositionListeners = [[NSMutableArray alloc] init];
    }
    [currentPositionListeners addObject:command.callbackId];

    [self.commandDelegate runInBackground:^{
        [bgGeo updateCurrentPosition:options];
    }];
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

-(void) beginBackgroundTask:(CDVInvokedUrlCommand*)command
{
    UIBackgroundTaskIdentifier taskId = [bgGeo createBackgroundTask];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt: (int)taskId];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void) insertLocation:(CDVInvokedUrlCommand*)command
{
    NSDictionary *params = [command.arguments objectAtIndex: 0];
    [self.commandDelegate runInBackground:^{
        BOOL success = [bgGeo insertLocation: params];
        CDVPluginResult* result;
        if (success) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        }
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

-(void) getCount:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        int count = [bgGeo getCount];
        CDVPluginResult* result;
        if (count >= 0) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt: count];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        }
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

-(void) getLog:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[bgGeo getLog]];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];    
}

-(void) emailLog:(CDVInvokedUrlCommand*)command
{
    NSString *email = [command.arguments objectAtIndex:0];
    [bgGeo emailLog:email];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * location handler from BackgroundGeolocation
 */
-(void (^)(CLLocation *location, enum tsLocationType, BOOL isMoving)) createLocationChangedHandler {
    return ^(CLLocation *location, enum tsLocationType type, BOOL isMoving) {
                
        NSDictionary *locationData = [bgGeo locationToDictionary:location type:type];
        
        [self.commandDelegate runInBackground:^{
            NSDictionary *params = @{@"location": locationData, @"taskId": @([bgGeo createBackgroundTask])};
            CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
            [result setKeepCallbackAsBool:YES];
            
            for (NSString *callbackId in self.locationListeners) {
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }
        }];
        
        if (type != TS_LOCATION_TYPE_SAMPLE && [self.currentPositionListeners count]) {
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
    };
}

-(void (^)(CLLocation *location, BOOL moving)) createMotionChangedHandler {
    return ^(CLLocation *location, BOOL moving) {
        if (![self.motionChangeListeners count]) {
            return;
        }
        NSDictionary *locationData  = [bgGeo locationToDictionary:location];

        for (NSString *callbackId in self.motionChangeListeners) {
            NSDictionary *params = @{
                @"isMoving": @(moving),
                @"location": locationData,
                @"taskId": @([bgGeo createBackgroundTask])
            };
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate runInBackground:^{
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }];
        }
    };
}

-(void (^)(CLCircularRegion *region, CLLocation *location, NSString *action)) createGeofenceHandler {
    return ^(CLCircularRegion *region, CLLocation *location, NSString *action) {
        if (![self.geofenceListeners count]) {
            return;
        }
        for (NSString *callbackId in self.geofenceListeners) {
            NSDictionary *params = @{
                @"identifier": region.identifier,
                @"action": action,
                @"location": [bgGeo locationToDictionary:location],
                @"taskId": @([bgGeo createBackgroundTask])
            };
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate runInBackground:^{
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }];       
        }
    };
}

-(void (^)(int shakeCount, NSString* motionType, CLLocation *location)) createHeartbeatHandler {
    return ^(int shakeCount, NSString* motionType, CLLocation *location) {

        NSDictionary *params = @{
            @"shakes": @(shakeCount),
            @"motionType": motionType,
            @"location": [bgGeo locationToDictionary:location]
        };

        for (NSString *callbackId in self.heartbeatListeners) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate runInBackground:^{
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }];
        }
    };
}

/*
- (void) onSyncComplete:(NSNotification*)notification
{
*/
-(void (^)(NSArray *locations)) createSyncCompleteHandler {
    return ^(NSArray *locations) {
        if (syncCallbackId == nil) {
            return;
        }
        NSDictionary *params = @{
            @"locations": locations,
            @"taskId": @(syncTaskId)
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [self.commandDelegate sendPluginResult:result callbackId:syncCallbackId];
        
        // Ready for another sync task.
        syncCallbackId  = nil;
        syncTaskId      = UIBackgroundTaskInvalid;
    };
}

-(void (^)(NSInteger statusCode, NSDictionary *requestData, NSData *responseData, NSError *error)) createHttpResponseHandler {
    return ^(NSInteger statusCode, NSDictionary *requestData, NSData *responseData, NSError *error) {
        BOOL success = (statusCode >= 200 && statusCode <= 204);
        NSDictionary *response  = @{@"status":@(statusCode), @"responseText":[[NSString alloc]initWithData:responseData encoding:NSUTF8StringEncoding]};
        for (NSString *callbackId in httpListeners) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:(success) ? CDVCommandStatus_OK : CDVCommandStatus_ERROR messageAsDictionary:response];
            [result setKeepCallbackAsBool:YES];
            [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        }
    };
}

/*- (void) onLocationManagerError:(NSNotification*)notification
{
*/
-(void (^)(NSString *type, NSError *error)) createErrorHandler {
    return ^(NSString *type, NSError *error) {
        NSLog(@" - onLocationManagerError: %@", error);

        if ([type isEqualToString:@"location"]) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
            if ([self.currentPositionListeners count]) {
                [result setKeepCallbackAsBool:NO];
                for (NSString *callbackId in self.currentPositionListeners) {
                    [self.commandDelegate sendPluginResult:result callbackId:callbackId];
                }
                [currentPositionListeners removeAllObjects];
            }

            [result setKeepCallbackAsBool:YES];
            
            for (NSString *callbackId in self.locationListeners) {
                [self.commandDelegate sendPluginResult:result callbackId:callbackId];
            }
        }
    };
}

-(void (^)(TSSchedule *schedule)) createScheduleHandler {
    return ^(TSSchedule *schedule) {
        NSLog(@" - CDVBackgroundGeolocation captured Schedule event: %@", schedule);
        NSDictionary *state = [bgGeo getState];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:state];
        [result setKeepCallbackAsBool:YES];
        for (NSString *callbackId in self.scheduleListeners) {
            [self.commandDelegate sendPluginResult:result callbackId:callbackId];
        }
    };
}

- (void)runInMain:(void (^)())block
{
    dispatch_async(dispatch_get_main_queue(), block);
}
/**
 * If you don't stopMonitoring when application terminates, the app will be awoken still when a
 * new location arrives, essentially monitoring the user's location even when they've killed the app.
 * Might be desirable in certain apps.
 */
- (void)applicationWillTerminate:(UIApplication *)application {
}

@end
