
#import "RNPaypal.h"

@implementation RNPaypal {
    bool runCallback;
}

static NSString *URLScheme;

+ (instancetype)sharedInstance {
    static RCTBraintree *_sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[RCTBraintree alloc] init];
    });
    return _sharedInstance;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(setup:(NSString *)clientToken urlscheme:(NSString*)urlscheme resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    URLScheme = urlscheme;
    [BTAppSwitch setReturnURLScheme:urlscheme];
    self.braintreeClient = [[BTAPIClient alloc] initWithAuthorization:clientToken];
    if (self.braintreeClient == nil) {
        reject();
    }
    else {
        resolve();
    }
}

@end
  