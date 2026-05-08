#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <CoreData/CoreData.h>
#import <CoreLocation/CoreLocation.h>
#import <AudioToolbox/AudioToolbox.h>

#import <TSLocationManager/TSConfig.h>
#import <TSLocationManager/TSConfigModule.h>
#import <TSLocationManager/TSHttpConfig.h>
#import <TSLocationManager/TSAuthorizationConfig.h>
#import <TSLocationManager/TSGeolocationConfig.h>
#import <TSLocationManager/TSGeolocationConfig.h>
#import <TSLocationManager/TSLocationFilterConfig.h>
#import <TSLocationManager/TSLocationFilterPolicy.h>
#import <TSLocationManager/TSKalmanProfile.h>
#import <TSLocationManager/TSPersistenceConfig.h>
#import <TSLocationManager/TSActivityConfig.h>
#import <TSLocationManager/TSAppConfig.h>
#import <TSLocationManager/TSOdometer.h>
#import <TSLocationManager/TSLMActionNames.h>
#import <TSLocationManager/TSGeofenceManager.h>
#import <TSLocationManager/TSGeofence.h>
#import <TSLocationManager/TSHttpService.h>
#import <TSLocationManager/TSEventNames.h>
#import <TSLocationManager/TSHttpErrorCodes.h>
#import <TSLocationManager/TSSchedule.h>
#import <TSLocationManager/TSActivityChangeEvent.h>
#import <TSLocationManager/TSProviderChangeEvent.h>
#import <TSLocationManager/TSLocationEvent.h>
#import <TSLocationManager/TSLocationStreamEvent.h>
#import <TSLocationManager/TSHttpEvent.h>
#import <TSLocationManager/TSHeartbeatEvent.h>
#import <TSLocationManager/TSScheduleEvent.h>
#import <TSLocationManager/TSGeofencesChangeEvent.h>
#import <TSLocationManager/TSPowerSaveChangeEvent.h>
#import <TSLocationManager/TSConnectivityChangeEvent.h>
#import <TSLocationManager/TSEnabledChangeEvent.h>
#import <TSLocationManager/TSGeofenceEvent.h>
#import <TSLocationManager/TSAuthorizationEvent.h>
#import <TSLocationManager/TSCurrentPositionRequest.h>
#import <TSLocationManager/TSWatchPositionRequest.h>
#import <TSLocationManager/TSLocationErrors.h>
#import <TSLocationManager/LogQuery.h>
#import <TSLocationManager/TSDeviceInfo.h>
#import <TSLocationManager/TSTimerService.h>
#import <TSLocationManager/TSJSON.h>
#import <TSLocationManager/TransistorAuthorizationToken.h>
#import <TSLocationManager/TSLogLevel.h>
#import <TSLocationManager/TSTrackingMode.h>
#import <TSLocationManager/TSPersistMode.h>

NS_ASSUME_NONNULL_BEGIN

FOUNDATION_EXPORT double TSLocationManagerVersionNumber;
FOUNDATION_EXPORT const unsigned char TSLocationManagerVersionString[];
FOUNDATION_EXPORT NSString* TSLocationManagerVersion;

/**
 The main API interface.
 */
NS_SWIFT_NAME(BackgroundGeolocation)
@interface TSLocationManager : NSObject


#pragma mark - Properties

// Flags
@property (atomic, readonly) BOOL enabled;
/// :nodoc:


# pragma mark - Services

/// The application's `ViewController` instance.  Used for presenting dialogs.
@property (nonatomic) UIViewController* viewController;

/// configChangeBufferTimer
@property (nonatomic, strong) TSTimerService *configChangeBufferTimer;

/// [Optional] User-supplied block to render location-data for SQLite database / Firebase adapter INSERT.
@property (copy) NSDictionary* (^beforeInsertBlock) (NSDictionary *data);

/// Returns the API's singleton instance.
+ (TSLocationManager *)sharedInstance;

#pragma mark - Event Listener Methods

/**
 * <!-- doc-id: BackgroundGeolocation.onLocation -->
 */
- (NSString*) onLocation:(void(^)(TSLocationEvent* location))success failure:(void(^)(NSError*))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.onHttp -->
 */
- (NSString*) onHttp:(void(^)(TSHttpEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onGeofence -->
 */
- (NSString*) onGeofence:(void(^)(TSGeofenceEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onHeartbeat -->
 */
- (NSString*) onHeartbeat:(void(^)(TSHeartbeatEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onMotionChange -->
 */
- (NSString*) onMotionChange:(void(^)(TSLocationEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onActivityChange -->
 */
- (NSString*) onActivityChange:(void(^)(TSActivityChangeEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onProviderChange -->
 */
- (NSString*) onProviderChange:(void(^)(TSProviderChangeEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onGeofencesChange -->
 */
- (NSString*) onGeofencesChange:(void(^)(TSGeofencesChangeEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onSchedule -->
 */
- (NSString*) onSchedule:(void(^)(TSScheduleEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onPowerSaveChange -->
 */
- (NSString*) onPowerSaveChange:(void(^)(TSPowerSaveChangeEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onConnectivityChange -->
 */
- (NSString*) onConnectivityChange:(void(^)(TSConnectivityChangeEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onEnabledChange -->
 */
- (NSString*) onEnabledChange:(void(^)(TSEnabledChangeEvent* event))success;
/**
 * <!-- doc-id: BackgroundGeolocation.onAuthorization -->
 */
- (NSString*) onAuthorization:(void(^)(TSAuthorizationEvent*))callback;
/**
 * <!-- doc-id: BackgroundGeolocation.removeListener -->
 */
- (void) removeListener:(NSString*)event callback:(void(^)(id))callback;
- (void) removeListener:(NSString*)event token:(NSString*)token;
- (void) removeListeners:(NSString*)event;
- (void) removeListenersForEvent:(NSString*)event;
/**
 * <!-- doc-id: BackgroundGeolocation.removeListeners -->
 */
- (void) removeListeners;

#pragma mark - Core API Methods

/**
 * <!-- doc-id: BackgroundGeolocation.ready -->
 */
- (void) ready;
/**
 * <!-- doc-id: BackgroundGeolocation.start -->
 */
- (void) start;
/**
 * <!-- doc-id: BackgroundGeolocation.stop -->
 */
- (void) stop;
/**
 * <!-- doc-id: BackgroundGeolocation.startSchedule -->
 */
- (void) startSchedule;
/**
 * <!-- doc-id: BackgroundGeolocation.stopSchedule -->
 */
- (void) stopSchedule;
/**
 * <!-- doc-id: BackgroundGeolocation.startGeofences -->
 */
- (void) startGeofences;
/**
 * <!-- doc-id: BackgroundGeolocation.getState -->
 */
- (NSMutableDictionary*) getState;

#pragma mark - Geolocation Methods

/**
 * <!-- doc-id: BackgroundGeolocation.changePace -->
 */
- (void) changePace:(BOOL)value;
/**
 * <!-- doc-id: BackgroundGeolocation.getCurrentPosition -->
 */
- (void) getCurrentPosition:(TSCurrentPositionRequest*)request;
/**
 * <!-- doc-id: BackgroundGeolocation.setOdometer -->
 */
- (void) setOdometer:(CLLocationDistance)odometer request:(TSCurrentPositionRequest*)request;
- (CLLocationDistance)getOdometer;

typedef NSInteger TSLocationWatchId;
/**
 * <!-- doc-id: BackgroundGeolocation.watchPosition -->
 */
- (TSLocationWatchId) watchPosition:(TSWatchPositionRequest*)request;
/**
 * <!-- doc-id: BackgroundGeolocation.stopWatchPosition -->
 */
- (void) stopWatchPosition:(TSLocationWatchId)watchId;

- (NSDictionary*) getStationaryLocation;
/**
 * <!-- doc-id: BackgroundGeolocation.getProviderState -->
 */
- (TSProviderChangeEvent*) getProviderState;
/**
 * <!-- doc-id: BackgroundGeolocation.requestPermission -->
 */
- (void) requestPermission:(void(^)(NSNumber *status))success failure:(void(^)(NSNumber *status))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.requestTemporaryFullAccuracy -->
 */
- (void) requestTemporaryFullAccuracy:(NSString*)purpose success:(void(^)(NSInteger))success failure:(void(^)(NSError*))failure;

#pragma mark - HTTP & Persistence Methods

/**
 * <!-- doc-id: BackgroundGeolocation.sync -->
 */
- (void) sync:(void(^)(NSArray* locations))success failure:(void(^)(NSError* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.getLocations -->
 */
- (void) getLocations:(void(^)(NSArray* locations))success failure:(void(^)(NSString* error))failure;
- (BOOL) clearDatabase;
/**
 * <!-- doc-id: BackgroundGeolocation.destroyLocations -->
 */
- (BOOL) destroyLocations;
/**
 * <!-- doc-id: BackgroundGeolocation.destroyLocations -->
 */
- (void) destroyLocations:(void(^)(void))success failure:(void(^)(NSString* error))failure;
// TODO docs
- (void) destroyLocation:(NSString*)uuid;
// TODO docs
- (void) destroyLocation:(NSString*)uuid success:(void(^)(void))success failure:(void(^)(NSString* error))failure;
- (void) insertLocation:(NSDictionary*)params success:(void(^)(NSString* uuid))success failure:(void(^)(NSString* error))failure;
- (void) persistLocation:(NSDictionary*)location;
/**
 * <!-- doc-id: BackgroundGeolocation.getCount -->
 */
- (int) getCount;

#pragma mark - Application Methods

- (UIBackgroundTaskIdentifier) createBackgroundTask;
/**
 * <!-- doc-id: BackgroundGeolocation.stopBackgroundTask -->
 */
- (void) stopBackgroundTask:(UIBackgroundTaskIdentifier)taskId;
/**
 * <!-- doc-id: BackgroundGeolocation.isPowerSaveMode -->
 */
- (BOOL) isPowerSaveMode;

#pragma mark - Logging & Debug Methods

/**
 * <!-- doc-id: BackgroundGeolocation.getLog -->
 */
- (void) getLog:(void(^)(NSString* log))success failure:(void(^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.getLog -->
 */
- (void) getLog:(LogQuery*)query success:(void(^)(NSString* log))success failure:(void(^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.emailLog -->
 */
- (void) emailLog:(NSString*)email success:(void(^)(void))success failure:(void(^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.emailLog -->
 */
- (void) emailLog:(NSString*)email query:(LogQuery*)query success:(void(^)(void))success failure:(void(^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.uploadLog -->
 */
- (void) uploadLog:(NSString*)url query:(LogQuery*)query success:(void(^)(void))success failure:(void(^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.destroyLog -->
 */
- (BOOL) destroyLog;

- (void) setLogLevel:(TSLogLevel)level;
- (void) playSound:(SystemSoundID)soundId;
- (void) error:(UIBackgroundTaskIdentifier)taskId message:(NSString*)message;
- (void) log:(NSString*)level message:(NSString*)message;
#pragma mark - Geofencing Methods

/**
 * <!-- doc-id: BackgroundGeolocation.addGeofence -->
 */
- (void) addGeofence:(TSGeofence*)geofence success:(void (^)(void))success failure:(void (^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.addGeofences -->
 */
- (void) addGeofences:(NSArray*)geofences success:(void (^)(void))success failure:(void (^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.removeGeofence -->
 */
- (void) removeGeofence:(NSString*)identifier success:(void (^)(void))success failure:(void (^)(NSString* error))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.removeGeofences -->
 */
- (void) removeGeofences:(NSArray*)identifiers success:(void (^)(void))success failure:(void (^)(NSString* error))failure;;
/**
 * <!-- doc-id: BackgroundGeolocation.removeGeofences -->
 */
- (void) removeGeofences;
/**
 * <!-- doc-id: BackgroundGeolocation.getGeofences -->
 */
- (NSArray*) getGeofences;
/**
 * <!-- doc-id: BackgroundGeolocation.getGeofences -->
 */
- (void) getGeofences:(void (^)(NSArray*))success failure:(void (^)(NSString*))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.getGeofence -->
 */
- (void) getGeofence:(NSString*)identifier success:(void (^)(TSGeofence*))success failure:(void (^)(NSString*))failure;
/**
 * <!-- doc-id: BackgroundGeolocation.geofenceExists -->
 */
- (void) geofenceExists:(NSString*)identifier callback:(void (^)(BOOL))callback;

#pragma mark - Sensor Methods
/**
 * <!-- doc-id: BackgroundGeolocation.isMotionHardwareAvailable -->
 */
-(BOOL) isMotionHardwareAvailable;
/**
 * <!-- doc-id: BackgroundGeolocation.isDeviceMotionAvailable -->
 */
-(BOOL) isDeviceMotionAvailable;
/**
 * <!-- doc-id: BackgroundGeolocation.isAccelerometerAvailable -->
 */
-(BOOL) isAccelerometerAvailable;
/**
 * <!-- doc-id: BackgroundGeolocation.isGyroAvailable -->
 */
-(BOOL) isGyroAvailable;
/**
 * <!-- doc-id: BackgroundGeolocation.isMagnetometerAvailable -->
 */
-(BOOL) isMagnetometerAvailable;

@end

NS_ASSUME_NONNULL_END
