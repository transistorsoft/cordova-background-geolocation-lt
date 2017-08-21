////
//  CDVBackgroundGeolocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//
#import "CDVBackgroundGeolocation.h"

@implementation CDVBackgroundGeolocation {
    TSLocationManager *bgGeo;
    NSDictionary *config;
    
    NSMutableDictionary *callbacks;
    NSMutableArray *watchPositionCallbacks;
}

@synthesize syncCallbackId, syncTaskId;

- (void)pluginInitialize
{
    bgGeo = [TSLocationManager sharedInstance];
    bgGeo.viewController = self.viewController;
    callbacks = [NSMutableDictionary new];
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
    config = [command.arguments objectAtIndex:0];
    NSDictionary *state = [bgGeo configure:config];
    
    CDVPluginResult *result;
    if (state != nil) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:state];
    } else {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) removeListeners:(CDVInvokedUrlCommand*) command
{
    [self.commandDelegate runInBackground:^{
        [bgGeo removeListeners];
    }];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) setConfig:(CDVInvokedUrlCommand*)command
{
    NSDictionary *cfg  = [command.arguments objectAtIndex:0];
    
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [self.commandDelegate runInBackground:^{
        NSDictionary *state = [bgGeo setConfig:cfg];
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:state];
        dispatch_sync(dispatch_get_main_queue(), ^{
           [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
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
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [self.commandDelegate runInBackground:^{
        [bgGeo start];
        NSDictionary *state = [bgGeo getState];
        dispatch_sync(dispatch_get_main_queue(), ^{
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:state];
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}
/**
 * Turn it off
 */
- (void) stop:(CDVInvokedUrlCommand*)command
{
    [bgGeo stop];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[bgGeo getState]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) startSchedule:(CDVInvokedUrlCommand*)command
{
    [bgGeo startSchedule];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[bgGeo getState]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) stopSchedule:(CDVInvokedUrlCommand*)command
{
    [bgGeo stopSchedule];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[bgGeo getState]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) startGeofences:(CDVInvokedUrlCommand*)command
{
    [bgGeo startGeofences];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[bgGeo getState]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) getOdometer:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble: [bgGeo getOdometer]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) setOdometer:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    double value  = [[command.arguments objectAtIndex:0] doubleValue];
    
    [bgGeo setOdometer:value success:^(TSLocation* location) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[location toDictionary]];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
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
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo getLocations:^(NSArray* locations) {
        NSDictionary *params = @{@"locations": locations};
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}
/**
 * @deprecated
 */
- (void) clearDatabase:(CDVInvokedUrlCommand*)command
{
    [self destroyLocations:command];
}

- (void) destroyLocations:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo destroyLocations:^{
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

/**
 * Fetches current stationaryLocation
 */
- (void) sync:(CDVInvokedUrlCommand *)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    
    [bgGeo sync:^(NSArray* records) {
        NSDictionary *params = @{@"locations": records};
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError* error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) removeListener:(CDVInvokedUrlCommand *)command
{
    NSString *event = [command.arguments objectAtIndex:0];
    NSString *callbackId = [command.arguments objectAtIndex:1];
    
    @synchronized(callbacks) {
        id callback = [callbacks objectForKey:callbackId];

        [bgGeo un:event callback:callback];
        
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        
    }
}

- (void) addLocationListener:(CDVInvokedUrlCommand*) command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    
    void(^success)(TSLocation*) = ^void(TSLocation* tsLocation) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[tsLocation toDictionary]];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    void(^failure)(NSError*) = ^void(NSError* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:success];
    [bgGeo onLocation:success failure:failure];
}

- (void) addHttpListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSHttpEvent*) = ^void(TSHttpEvent* response) {
        NSDictionary *params = @{
            @"status": @(response.statusCode),
            @"responseText":response.responseText
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:(response.isSuccess) ? CDVCommandStatus_OK : CDVCommandStatus_ERROR messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onHttp:callback];
}

- (void) addMotionChangeListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    
    void(^callback)(TSLocation*) = ^void(TSLocation* tsLocation) {
        NSDictionary *params = @{
            @"isMoving": @(tsLocation.isMoving),
            @"location": [tsLocation toDictionary]
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onMotionChange:callback];
}

- (void) addHeartbeatListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    
    void(^callback)(TSHeartbeatEvent*) = ^void(TSHeartbeatEvent* event) {
        NSDictionary *params = @{
            @"location": [event.location toDictionary],
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onHeartbeat:callback];
}

- (void) addActivityChangeListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSActivityChangeEvent*) = ^void(TSActivityChangeEvent* activity) {
        NSDictionary *params = @{
            @"activity": activity.activity,
            @"confidence": @(activity.confidence)
        };
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onActivityChange:callback];
}

- (void) addProviderChangeListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSProviderChangeEvent*) = ^void(TSProviderChangeEvent* event) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[event toDictionary]];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onProviderChange:callback];
}

- (void) addGeofencesChangeListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSGeofencesChangeEvent*) = ^void(TSGeofencesChangeEvent* event) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[event toDictionary]];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onGeofencesChange:callback];            
}

- (void) addGeofenceListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSGeofenceEvent*) = ^void(TSGeofenceEvent* event) {
        NSMutableDictionary *params = [[event toDictionary] mutableCopy];
        [params setObject:[event.location toDictionary] forKey:@"location"];
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onGeofence:callback];
}


- (void) addScheduleListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSScheduleEvent*) = ^void(TSScheduleEvent* event) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:event.state];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [bgGeo onSchedule:callback];
}

- (void) addGeofence:(CDVInvokedUrlCommand*)command
{
    NSDictionary *params  = [command.arguments objectAtIndex:0];
    
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo addGeofence:params success:^{
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) addGeofences:(CDVInvokedUrlCommand*)command
{
    NSArray *geofences  = [command.arguments objectAtIndex:0];
    
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo addGeofences:geofences success:^{
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) removeGeofence:(CDVInvokedUrlCommand*)command
{
    NSString *identifier  = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo removeGeofence:identifier success:^{
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) removeGeofences:(CDVInvokedUrlCommand*)command
{
    NSArray *identifiers = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo removeGeofences:identifiers success:^{
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) getGeofences:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo getGeofences:^(NSArray *geofences) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:geofences];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) getCurrentPosition:(CDVInvokedUrlCommand*)command
{
    NSDictionary *options  = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    
    [bgGeo getCurrentPosition:options success:^(TSLocation* location) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[location toDictionary]];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) watchPosition:(CDVInvokedUrlCommand*)command
{
    NSDictionary *options  = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak delegate = self.commandDelegate;
    
    if (!watchPositionCallbacks) {
        watchPositionCallbacks = [NSMutableArray new];
    }
    [watchPositionCallbacks addObject:command.callbackId];
    
    [self.commandDelegate runInBackground:^{
        [bgGeo watchPosition:options success:^(TSLocation* location) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[location toDictionary]];
            [result setKeepCallbackAsBool:YES];
            [delegate sendPluginResult:result callbackId:command.callbackId];
        } failure:^(NSError* error) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
            [delegate sendPluginResult:result callbackId:command.callbackId];
        }];
    }];
}
- (void) stopWatchPosition:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        [bgGeo stopWatchPosition];
    }];
    // Ensure an initialized Array
    if (!watchPositionCallbacks) {
        watchPositionCallbacks = [NSMutableArray new];
    }
    // Send list of watchPositionCallbacks to remove on client
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:watchPositionCallbacks] callbackId:command.callbackId];
    // Now safe to clear.
    [watchPositionCallbacks removeAllObjects];
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
-(void) startBackgroundTask:(CDVInvokedUrlCommand*)command
{
    UIBackgroundTaskIdentifier taskId = [bgGeo createBackgroundTask];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:(int)taskId] callbackId:command.callbackId];
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
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    NSDictionary *params = [command.arguments objectAtIndex: 0];
    
    [bgGeo insertLocation:params success:^(NSString* uuid){
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:uuid];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

-(void) getCount:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [self.commandDelegate runInBackground:^{
        int count = [bgGeo getCount];
        CDVPluginResult* result;
        if (count >= 0) {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt: count];
        } else {
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        }
        dispatch_sync(dispatch_get_main_queue(), ^{
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

-(void) getLog:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo getLog:^(NSString* log){
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:log];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

-(void) destroyLog:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [self.commandDelegate runInBackground:^{
        CDVPluginResult *result = ([bgGeo destroyLog]) ? [CDVPluginResult resultWithStatus:CDVCommandStatus_OK] : [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        dispatch_sync(dispatch_get_main_queue(), ^{
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) setLogLevel:(CDVInvokedUrlCommand *) command
{
    NSInteger logLevel = [[command.arguments objectAtIndex:0] integerValue];
    [bgGeo setLogLevel:logLevel];CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    
}
-(void) emailLog:(CDVInvokedUrlCommand*)command
{
    NSString *email = [command.arguments objectAtIndex:0];
    
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo emailLog:email success:^{
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [commandDelegate sendPluginResult:result callbackId: command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) log:(CDVInvokedUrlCommand*)command
{
    NSString *level = [command.arguments objectAtIndex:0];
    NSString *msg = [command.arguments objectAtIndex:1];
    
    [bgGeo log:level message:msg];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}


-(void) getSensors:(CDVInvokedUrlCommand*)command
{
    NSDictionary *sensors = @{
                              @"platform": @"ios",
                              @"accelerometer": @([bgGeo isAccelerometerAvailable]),
                              @"gyroscope": @([bgGeo isGyroAvailable]),
                              @"magnetometer": @([bgGeo isMagnetometerAvailable]),
                              @"motion_hardware": @([bgGeo isMotionHardwareAvailable])
                              };
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:sensors];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void) registerCallback:(NSString*)callbackId callback:(void(^)(id))callback
{
    @synchronized (callbacks) {
        [callbacks setObject:callback forKey:callbackId];
    }
}

/**
 * If you don't stopMonitoring when application terminates, the app will be awoken still when a
 * new location arrives, essentially monitoring the user's location even when they've killed the app.
 * Might be desirable in certain apps.
 */
- (void)applicationWillTerminate:(UIApplication *)application {
    bgGeo = nil;
}

@end
