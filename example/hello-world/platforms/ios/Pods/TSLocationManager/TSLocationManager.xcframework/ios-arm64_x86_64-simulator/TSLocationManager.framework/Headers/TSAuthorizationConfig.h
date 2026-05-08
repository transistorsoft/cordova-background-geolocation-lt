//
//  TSAuthorizationConfig.h
//  TSLocationManager
//
//  Created by Christopher Scott on 2025-09-09.
//  Copyright © 2025 Christopher Scott. All rights reserved.

/**
 * Configuration for the SDK's built-in HTTP Authorization / token-refresh workflow.
 *
 * The SDK will apply an Authorization header to each HTTP request based upon `strategy` + `accessToken`.
 * When a request receives `401 Unauthorized` and a `refreshUrl` is configured, the SDK may attempt to
 * refresh credentials by POSTing `refreshPayload` (x-www-form-urlencoded) to `refreshUrl`, then retrying
 * the original request with the new token.
 *
 * IMPORTANT:
 * - `refreshPayload` and `refreshHeaders` are dictionary-valued properties and are hydrated through
 *   `TSConfigModuleBase`'s automated `updateWithDictionary:` pipeline (via `propertySpecs`).
 * - `refreshPayload` values may contain template placeholders like `{refreshToken}` which will be
 *   replaced at runtime with the current `refreshToken` value.
 */
#import <Foundation/Foundation.h>
#import "TSConfigModuleBase.h"

NS_ASSUME_NONNULL_BEGIN

@interface TSAuthorizationConfig : TSConfigModuleBase
/// Authorization strategy.  Currently supported values include:
/// - "JWT": Sends `Authorization: Bearer <accessToken>`.
/// - "SAS": Sends `Authorization: <accessToken>` (no Bearer prefix).
@property (nonatomic, copy, nullable) NSString *strategy;

/// The current access token used to authorize HTTP requests.
///
/// For `strategy == "JWT"`, this token is sent as a Bearer token.
@property (nonatomic, copy, nullable) NSString *accessToken;

/// The refresh token used when requesting a new access token from `refreshUrl`.
@property (nonatomic, copy, nullable) NSString *refreshToken;

/// Payload posted to `refreshUrl` when refreshing credentials.
///
/// The payload is encoded as strict `application/x-www-form-urlencoded` key/value fields.
/// Values may include the placeholder `{refreshToken}`, which will be replaced at runtime.
///
/// Example (AWS Cognito):
/// {
///   "refresh_token": "{refreshToken}",
///   "grant_type": "refresh_token",
///   "client_id": "<client-id>"
/// }
@property (nonatomic, copy, nullable) NSDictionary<NSString*, id> *refreshPayload;

/// Headers applied only to the token-refresh request (the POST to `refreshUrl`).
///
/// Values may include the placeholder `{accessToken}` (e.g. `Authorization: Bearer {accessToken}`).
@property (nonatomic, copy, nullable) NSDictionary<NSString*, NSString*> *refreshHeaders;

/// URL of the auth-server endpoint used to refresh credentials.
@property (nonatomic, copy, nullable) NSString *refreshUrl;

/// Token expiration interval (seconds).  When set, the SDK uses this to determine when credentials
/// should be considered expired and eligible for refresh.
@property (nonatomic) NSTimeInterval expires;

/// Applies the authorization header to a request.
///
/// This method is invoked by the SDK's HTTP pipeline (TSHttpService) just before sending requests.
///
/// NOTE: This does *not* perform token refresh.  Token refresh is handled by TSAuthorization.
-(void) apply:(NSMutableURLRequest*)request;


@end

NS_ASSUME_NONNULL_END

