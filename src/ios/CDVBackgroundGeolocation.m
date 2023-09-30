////
//  CDVBackgroundGeolocation
//
//  Created by Chris Scott <chris@transistorsoft.com> on 2013-06-15
//
#import "CDVBackgroundGeolocation.h"

@implementation CDVBackgroundGeolocation {
    BOOL ready;
    NSMutableDictionary *callbacks;
    NSMutableArray *watchPositionCallbacks;
}

@synthesize syncCallbackId, syncTaskId;

- (void)pluginInitialize
{
    ready = NO;
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    NSDictionary *params = [command.arguments objectAtIndex:0];
    TSConfig *config = [TSConfig sharedInstance];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo configure:params];

    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) ready:(CDVInvokedUrlCommand*) command
{
    TSConfig *config = [TSConfig sharedInstance];
    NSDictionary *params = [command.arguments objectAtIndex:0];
    BOOL reset = (params[@"reset"]) ? [params[@"reset"] boolValue] : YES;
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];

    if (ready) {
        if (reset) {
            [bgGeo log:@"warn" message:@"#ready already called.  Redirecting to #setConfig"];
            [self setConfig:command];
        } else {
            [bgGeo log:@"warn" message:@"#ready already called.  Ignored"];
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }
        return;
    }

    ready = YES;

    if (config.isFirstBoot) {
        [config updateWithDictionary:params];
    } else {
        if (reset) {
            [config reset:YES];
            [config updateWithDictionary:params];
        } else if ([params objectForKey:@"authorization"]) {
            [config updateWithBlock:^(TSConfigBuilder *builder) {
                builder.authorization = [TSAuthorization createWithDictionary:[params objectForKey:@"authorization"]];
            }];
        }
    }
    [bgGeo ready];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) reset:(CDVInvokedUrlCommand*) command
{
    TSConfig *config = [TSConfig sharedInstance];
    if ([command.arguments count]) {
        NSDictionary *params = [command.arguments objectAtIndex:0];
        [config reset:YES];
        [config updateWithDictionary:params];
    } else {
        [config reset];
    }

    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) removeListeners:(CDVInvokedUrlCommand*) command
{
    [self.commandDelegate runInBackground:^{
        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
        TSConfig *config = [TSConfig sharedInstance];
        [config updateWithDictionary:cfg];
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
        dispatch_sync(dispatch_get_main_queue(), ^{
           [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) getState:(CDVInvokedUrlCommand*)command
{
    TSConfig *config = [TSConfig sharedInstance];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Turn on background geolocation
 */
- (void) start:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [self.commandDelegate runInBackground:^{
        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
        [bgGeo start];
        TSConfig *config = [TSConfig sharedInstance];
        NSDictionary *state = [config toDictionary];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo stop];
    TSConfig *config = [TSConfig sharedInstance];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) startSchedule:(CDVInvokedUrlCommand*)command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo startSchedule];
    TSConfig *config = [TSConfig sharedInstance];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) stopSchedule:(CDVInvokedUrlCommand*)command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo stopSchedule];
    TSConfig *config = [TSConfig sharedInstance];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) startGeofences:(CDVInvokedUrlCommand*)command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo startGeofences];
    TSConfig *config = [TSConfig sharedInstance];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[config toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) getOdometer:(CDVInvokedUrlCommand*)command
{
    TSConfig *config = [TSConfig sharedInstance];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDouble: config.odometer];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) setOdometer:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    double value  = [[command.arguments objectAtIndex:0] doubleValue];

    TSCurrentPositionRequest *request = [[TSCurrentPositionRequest alloc] initWithSuccess:^(TSLocation *location) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[location toDictionary]];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo setOdometer:value request:request];
}

/**
 * Fetches current stationaryLocation
 */
- (void) getStationaryLocation:(CDVInvokedUrlCommand *)command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo getLocations:^(NSArray* locations) {
        NSDictionary *params = @{@"locations": locations};
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo destroyLocations:^{
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) destroyLocation:(CDVInvokedUrlCommand*)command
{
    NSString *uuid  = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];

    [bgGeo destroyLocation:uuid success:^{
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo onLocation:success failure:failure];
}

- (void) addHttpListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSHttpEvent*) = ^void(TSHttpEvent* response) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[response toDictionary]];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo onSchedule:callback];
}

- (void) addPowerSaveChangeListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSPowerSaveChangeEvent*) = ^void(TSPowerSaveChangeEvent* event) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:event.isPowerSaveMode];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo onPowerSaveChange:callback];
}

- (void) addConnectivityChangeListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSConnectivityChangeEvent*) = ^void(TSConnectivityChangeEvent* event) {
        NSDictionary *params = @{@"connected":@(event.hasConnection)};
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:params];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo onConnectivityChange:callback];
}

- (void) addEnabledChangeListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSEnabledChangeEvent*) = ^void(TSEnabledChangeEvent* event) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:event.enabled];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo onEnabledChange:callback];
}

- (void) addAuthorizationListener:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    void(^callback)(TSAuthorizationEvent*) = ^void(TSAuthorizationEvent* event) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[event toDictionary]];
        [result setKeepCallbackAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    };
    [self registerCallback:command.callbackId callback:callback];
    [[TSHttpService sharedInstance] onAuthorization:callback];
}

- (void) addNotificationActionListener:(CDVInvokedUrlCommand*)command
{
    // No iOS implementation
}

- (void) addGeofence:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [self.commandDelegate runInBackground:^{
        NSDictionary *params  = [command.arguments objectAtIndex:0];
        TSGeofence *geofence = [self buildGeofence:params];
        if (!geofence) {
            NSString *error = [NSString stringWithFormat:@"Invalid geofence data: %@", params];
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
            return;
        }
        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
        [bgGeo addGeofence:geofence success:^{
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        } failure:^(NSString* error) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }];
    }];
}

- (void) addGeofences:(CDVInvokedUrlCommand*)command
{
    NSArray *data  = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [self.commandDelegate runInBackground:^{
        // Build Array of TSGeofence
        NSMutableArray *geofences = [NSMutableArray new];
        for (NSDictionary *params in data) {
            TSGeofence *geofence = [self buildGeofence:params];
            if (geofence != nil) {
                [geofences addObject:geofence];
            } else {
                NSString *error = [NSString stringWithFormat:@"Invalid geofence data: %@", params];
                CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
                [commandDelegate sendPluginResult:result callbackId:command.callbackId];
                return;
            }
        }

        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
        [bgGeo addGeofences:geofences success:^{
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        } failure:^(NSString *error) {
            CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        }];
    }];
}

-(TSGeofence*) buildGeofence:(NSDictionary*)params {
    
    if (!params[@"identifier"] || (!params[@"vertices"] && (!params[@"radius"] || !params[@"latitude"] || !params[@"longitude"]))) {
        return nil;
    }
    
    return [[TSGeofence alloc] initWithIdentifier: params[@"identifier"]
                                           radius: [params[@"radius"] doubleValue]
                                         latitude: [params[@"latitude"] doubleValue]
                                        longitude: [params[@"longitude"] doubleValue]
                                    notifyOnEntry: (params[@"notifyOnEntry"]) ? [params[@"notifyOnEntry"] boolValue]  : NO
                                     notifyOnExit: (params[@"notifyOnExit"])  ? [params[@"notifyOnExit"] boolValue] : NO
                                    notifyOnDwell: (params[@"notifyOnDwell"]) ? [params[@"notifyOnDwell"] boolValue] : NO
                                   loiteringDelay: (params[@"loiteringDelay"]) ? [params[@"loiteringDelay"] doubleValue] : 0
                                           extras: params[@"extras"]
                                         vertices: params[@"vertices"]];
}
- (void) removeGeofence:(CDVInvokedUrlCommand*)command
{
    NSString *identifier  = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo getGeofences:^(NSArray *geofences) {
        NSMutableArray *rs = [NSMutableArray new];
        for (TSGeofence *geofence in geofences) {
            [rs addObject:[geofence toDictionary]];
        }
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:rs];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) getGeofence:(CDVInvokedUrlCommand*)command
{
    NSString *identifier = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo getGeofence:identifier success:^(TSGeofence *geofence) {
        CDVPluginResult *result = [CDVPluginResult
                                   resultWithStatus:CDVCommandStatus_OK
                                   messageAsDictionary:[geofence toDictionary]];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSString *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) geofenceExists:(CDVInvokedUrlCommand*)command
{
    NSString *identifier = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo geofenceExists:identifier callback:^(BOOL exists) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:exists];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) getCurrentPosition:(CDVInvokedUrlCommand*)command
{
    NSDictionary *options  = [command.arguments objectAtIndex:0];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;

    TSCurrentPositionRequest *request = [[TSCurrentPositionRequest alloc] initWithSuccess:^(TSLocation *location) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[location toDictionary]];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];

    if (options[@"timeout"]) {
        request.timeout = [options[@"timeout"] doubleValue];
    }
    if (options[@"maximumAge"]) {
        request.maximumAge = [options[@"maximumAge"] doubleValue];
    }
    if (options[@"persist"]) {
        request.persist = [options[@"persist"] boolValue];
    }
    if (options[@"samples"]) {
        request.samples = [options[@"samples"] intValue];
    }
    if (options[@"desiredAccuracy"]) {
        request.desiredAccuracy = [options[@"desiredAccuracy"] doubleValue];
    }
    if (options[@"extras"]) {
        request.extras = options[@"extras"];
    }
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo getCurrentPosition:request];
}

- (void) watchPosition:(CDVInvokedUrlCommand*)command
{
    NSDictionary *options  = [command.arguments objectAtIndex:0];

    if (!watchPositionCallbacks) {
        watchPositionCallbacks = [NSMutableArray new];
    }
    [watchPositionCallbacks addObject:command.callbackId];

    __typeof(self.commandDelegate) __weak delegate = self.commandDelegate;

    TSWatchPositionRequest *request = [[TSWatchPositionRequest alloc] initWithSuccess:^(TSLocation *location) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[location toDictionary]];
        [result setKeepCallbackAsBool:YES];
        [delegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError *error) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt:(int)error.code];
        [delegate sendPluginResult:result callbackId:command.callbackId];
    }];

    if (options[@"interval"]) {
        request.interval = [options[@"interval"] doubleValue];
    }
    if (options[@"desiredAccuracy"]) {
        request.desiredAccuracy = [options[@"desiredAccuracy"] doubleValue];
    }
    if (options[@"persist"]) {
        request.persist = [options[@"persist"] boolValue];
    }
    if (options[@"extras"]) {
        request.extras = options[@"extras"];
    }
    if (options[@"timeout"]) {
        request.timeout = [options[@"timeout"] doubleValue];
    }
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo watchPosition:request];
}
- (void) stopWatchPosition:(CDVInvokedUrlCommand*)command
{
    [self.commandDelegate runInBackground:^{
        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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

- (void) getTransistorToken:(CDVInvokedUrlCommand *)command {
    NSString *orgname = [command.arguments objectAtIndex:0];
    NSString *username = [command.arguments objectAtIndex:1];
    NSString *url = [command.arguments objectAtIndex:2];

    [TransistorAuthorizationToken findOrCreateWithOrg:orgname
                                             username:username
                                                 url:url
                                            framework:@"cordova"
                                              success:^(TransistorAuthorizationToken *token) {
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[token toDictionary]];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError *error) {
        NSDictionary *response = @{@"status": @(error.code), @"message":error.localizedDescription};
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:response];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) destroyTransistorToken:(CDVInvokedUrlCommand *)command {
    NSString *url = [command.arguments objectAtIndex:0];
    [TransistorAuthorizationToken destroyWithUrl:url];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) playSound:(CDVInvokedUrlCommand*)command
{
    SystemSoundID soundId = [[command.arguments objectAtIndex:0] intValue];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo playSound: soundId];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Called by js to signify the end of a background-geolocation event
 */
-(void) startBackgroundTask:(CDVInvokedUrlCommand*)command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    UIBackgroundTaskIdentifier taskId = [bgGeo createBackgroundTask];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:(int)taskId] callbackId:command.callbackId];
}

/**
 * Called by js to signify the end of a background-geolocation event
 */
-(void) finish:(CDVInvokedUrlCommand*)command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    UIBackgroundTaskIdentifier taskId = [[command.arguments objectAtIndex: 0] integerValue];
    [bgGeo stopBackgroundTask:taskId];

    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt: (int)taskId];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

/**
 * Called by js to signal a caught exception from application code.
 */
-(void) error:(CDVInvokedUrlCommand*)command
{
    UIBackgroundTaskIdentifier taskId = [[command.arguments objectAtIndex: 0] integerValue];
    NSString *error = [command.arguments objectAtIndex:1];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo changePace:moving];
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool: moving];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(void) insertLocation:(CDVInvokedUrlCommand*)command
{
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    NSDictionary *params = [command.arguments objectAtIndex: 0];

    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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
    NSDictionary *params = [command.arguments objectAtIndex:0];
    LogQuery *query = [[LogQuery alloc] initWithDictionary:params];

    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo getLog:query success:^(NSString* log){
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
        TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
        CDVPluginResult *result = ([bgGeo destroyLog]) ? [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:YES] : [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"UNKNOWN_ERROR"];
        dispatch_sync(dispatch_get_main_queue(), ^{
            [commandDelegate sendPluginResult:result callbackId:command.callbackId];
        });
    }];
}

- (void) setLogLevel:(CDVInvokedUrlCommand *) command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    NSInteger logLevel = [[command.arguments objectAtIndex:0] integerValue];
    [bgGeo setLogLevel:logLevel];CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];

}
-(void) emailLog:(CDVInvokedUrlCommand*)command
{
    NSString *email = [command.arguments objectAtIndex:0];
    NSDictionary *params = [command.arguments objectAtIndex:1];
    LogQuery *query = [[LogQuery alloc] initWithDictionary:params];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo emailLog:email query:query success:^{
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:YES];
        [commandDelegate sendPluginResult:result callbackId: command.callbackId];
    } failure:^(NSString* error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error];
        [commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

-(void) uploadLog:(CDVInvokedUrlCommand*)command
{
    NSString *url = [command.arguments objectAtIndex:0];
    NSDictionary *params = [command.arguments objectAtIndex:1];

    LogQuery *query = [[LogQuery alloc] initWithDictionary:params];

    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    __typeof(self.commandDelegate) __weak commandDelegate = self.commandDelegate;
    [bgGeo uploadLog:url query:query success:^{
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:YES];
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

    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo log:level message:msg];
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}


-(void) getSensors:(CDVInvokedUrlCommand*)command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
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

- (void) getDeviceInfo:(CDVInvokedUrlCommand*)command {
    NSDictionary *deviceInfo = [[TSDeviceInfo sharedInstance] toDictionary:@"cordova"];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:deviceInfo];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) isPowerSaveMode:(CDVInvokedUrlCommand *) command
{
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    BOOL isPowerSaveMode = [bgGeo isPowerSaveMode];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isPowerSaveMode];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) isIgnoringBatteryOptimizations:(CDVInvokedUrlCommand *) command
{
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:NO];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) requestSettings:(CDVInvokedUrlCommand *) command
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No iOS Implementation"];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) showSettings:(CDVInvokedUrlCommand *) command
{
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No iOS Implementation"];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) getProviderState:(CDVInvokedUrlCommand *) command {
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    TSProviderChangeEvent *event = [bgGeo getProviderState];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:[event toDictionary]];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) requestPermission:(CDVInvokedUrlCommand *) command {
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo requestPermission:^(NSNumber *status) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt: [status intValue]];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSNumber *status) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsInt: [status intValue]];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) requestTemporaryFullAccuracy:(CDVInvokedUrlCommand *) command {
    NSString *purpose = [command.arguments objectAtIndex:0];
    TSLocationManager *bgGeo = [TSLocationManager sharedInstance];
    [bgGeo requestTemporaryFullAccuracy:purpose success:^(NSInteger accuracyAuthorization) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:accuracyAuthorization];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    } failure:^(NSError *error) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:error.userInfo[@"NSDebugDescription"]];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void) registerCallback:(NSString*)callbackId callback:(void(^)(id))callback
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

}

@end
