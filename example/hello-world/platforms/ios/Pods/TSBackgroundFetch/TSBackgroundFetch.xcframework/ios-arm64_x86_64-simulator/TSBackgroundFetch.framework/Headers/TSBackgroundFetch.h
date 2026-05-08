//
//  TSBackgroundFetch.h
//  TSBackgroundFetch
//
//  Created by Christopher Scott on 2016-08-02.
//  Copyright © 2016 Christopher Scott. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <BackgroundTasks/BackgroundTasks.h>

#import <TSBackgroundFetch/TSBGTask.h>
#import <TSBackgroundFetch/TSBGAppRefreshSubscriber.h>

NS_ASSUME_NONNULL_BEGIN

@interface TSBackgroundFetch : NSObject

@property (nonatomic) BOOL stopOnTerminate;
@property (readonly) BOOL configured;
@property (readonly) BOOL active;
@property (readonly) NSString *fetchTaskId;
@property (nonatomic, copy, nullable) void (^completionHandler)(UIBackgroundFetchResult);
@property (nonatomic) UIBackgroundTaskIdentifier backgroundTask;

+ (TSBackgroundFetch *)sharedInstance;

-(void) didFinishLaunching;
-(void) registerAppRefreshTask;
-(void) registerBGProcessingTask:(NSString*)identifier;

-(void) configure:(NSTimeInterval)delay callback:(void(^)(UIBackgroundRefreshStatus status))callback;

-(nullable NSError*) scheduleProcessingTaskWithIdentifier:(NSString*)identifier type:(NSInteger)type delay:(NSTimeInterval)delay periodic:(BOOL)periodic callback:(void (^)(NSString* taskId, BOOL timeout))callback;

-(nullable NSError*) scheduleProcessingTaskWithIdentifier:(NSString*)identifier type:(NSInteger)type delay:(NSTimeInterval)delay periodic:(BOOL)periodic requiresExternalPower:(BOOL)requiresExternalPower requiresNetworkConnectivity:(BOOL)requiresNetworkConnectivity callback:(void (^)(NSString* taskId, BOOL timeout))callback;

-(void) addListener:(NSString*)componentName callback:(void (^)(NSString* componentName))callback;
-(void) addListener:(NSString*)componentName callback:(void (^)(NSString* componentName))callback timeout:(nullable void (^)(NSString* componentName))timeout;
-(void) removeListener:(NSString*)componentName;
-(BOOL) hasListener:(NSString*)componentName;

-(nullable NSError*) start:(nullable NSString*)identifier;
-(void) stop:(nullable NSString*)identifier;
-(void) finish:(nullable NSString*)tag;
-(void) status:(void(^)(UIBackgroundRefreshStatus status))callback;

// @deprecated API
-(void) performFetchWithCompletionHandler:(void (^)(UIBackgroundFetchResult))handler applicationState:(UIApplicationState)state;
@end

NS_ASSUME_NONNULL_END
