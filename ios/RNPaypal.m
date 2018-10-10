
#import "RNPaypal.h"

@implementation RNPaypal {
    bool runCallback;
}

static NSString *URLScheme;

+ (instancetype)sharedInstance {
    static RNPaypal *_sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _sharedInstance = [[RNPaypal alloc] init];
    });
    return _sharedInstance;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(setup:(NSString *)clientToken
                  urlscheme:(NSString*)urlscheme
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    URLScheme = urlscheme;
    [BTAppSwitch setReturnURLScheme:urlscheme];
    self.braintreeClient = [[BTAPIClient alloc] initWithAuthorization:clientToken];
    if (self.braintreeClient == nil) {
        NSError *error = [NSError errorWithDomain:@"RNPayPal" code:1 userInfo:nil];
        reject(@"braintree_sdk_setup_failed", @"Could not initialize Braintree SDK", error);
        return;
    }
    resolve(nil);
}

RCT_EXPORT_METHOD(requestOneTimePayment:(NSDictionary*)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        
        BTPayPalDriver *payPalDriver = [[BTPayPalDriver alloc] initWithAPIClient:self.braintreeClient];
        payPalDriver.viewControllerPresentingDelegate = self;
        
        BTPayPalRequest *request= [[BTPayPalRequest alloc] initWithAmount:options[@"amount"]];
        NSString* currency = options[@"currency"];
        if (currency) request.currencyCode = currency;
        NSString* localeCode = options[@"localeCode"];
        if (localeCode) request.localeCode = localeCode;
        BOOL shippingAddressRequired = options[@"shippingAddressRequired"];
        if (shippingAddressRequired) request.shippingAddressRequired = shippingAddressRequired;
        NSString* userAction = options[@"userAction"];
        if (userAction && [@"commit" isEqualToString:userAction]) request.userAction = BTPayPalRequestUserActionCommit;
        
        [payPalDriver requestOneTimePayment:request completion:^(BTPayPalAccountNonce * _Nullable tokenizedPayPalAccount, NSError * _Nullable error) {
            if (tokenizedPayPalAccount) {
                NSDictionary* result = @{
                                         @"nonce" : (tokenizedPayPalAccount.nonce ?: [NSNull null]),
                                         @"payerId" : (tokenizedPayPalAccount.payerId  ?: [NSNull null]),
                                         @"email" : (tokenizedPayPalAccount.email  ?: [NSNull null]),
                                         @"firstName" : (tokenizedPayPalAccount.firstName  ?: [NSNull null]),
                                         @"lastName" : (tokenizedPayPalAccount.lastName  ?: [NSNull null]),
                                         @"phone" : (tokenizedPayPalAccount.phone  ?: [NSNull null]),
                                         };
                
                resolve(result);
                return;
            } else if (error) {
                reject(@"request_one_time_payment_error", @"Error requesting one time payment", error);
                return;
            } else {
                NSError* e = [NSError errorWithDomain:@"RNPayPal" code:2 userInfo:nil];
                reject(@"user_cancellation", @"User cancelled one time payment", e);
            }
        }];
    });
}

@end
