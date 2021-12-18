
#import <React/RCTBridgeModule.h>

#import "BraintreeCore.h"
#import "BraintreePayPal.h"
#import "BTDataCollector.h"

@interface RNPaypal : UIViewController <RCTBridgeModule, BTAppSwitchDelegate, BTViewControllerPresentingDelegate, BTDataCollectorDelegate>

+ (instancetype)sharedInstance;

- (void)configure;
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation;
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options;

@end
