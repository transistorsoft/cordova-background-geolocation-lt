//
//  TSBGAppRefreshSubscriber.h
//  TSBackgroundFetch
//
//  Created by Christopher Scott on 2020-02-07.
//  Copyright © 2020 Christopher Scott. All rights reserved.
//
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <BackgroundTasks/BackgroundTasks.h>

NS_ASSUME_NONNULL_BEGIN

@interface TSBGAppRefreshSubscriber : NSObject

+(void)load;
+(NSMutableDictionary *)subscribers;
+(void) add:(TSBGAppRefreshSubscriber*)tsTask;
+(void) remove:(TSBGAppRefreshSubscriber*)tsTask;
+(nullable TSBGAppRefreshSubscriber*) get:(NSString*)identifier;
+(void) execute;
+(BOOL) onTimeout;

+(void)registerTaskScheduler API_AVAILABLE(ios(13));
+(BOOL)useTaskScheduler;

@property (nonatomic) NSString* identifier;
@property (nonatomic, copy, nullable) void (^callback) (NSString*);
@property (nonatomic, copy, nullable) void (^timeout) (NSString*);
@property (nonatomic, readonly) BOOL enabled;
@property (nonatomic, readonly) BOOL executed;
@property (nonatomic, readonly) BOOL finished;

-(instancetype) initWithIdentifier:(NSString*)identifier callback:(void (^)(NSString* taskId))callback timeout:(nullable void (^)(NSString* taskId))timeout;
-(void) execute;
-(void) onTimeout;
-(void) finish;
-(void) destroy;

@end

NS_ASSUME_NONNULL_END
