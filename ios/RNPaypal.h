
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#import "BraintreePaypal.h"

@interface RNPaypal : NSObject <RCTBridgeModule>

@end
  