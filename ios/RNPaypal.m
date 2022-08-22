
#import "RNPaypal.h"

@implementation RNPaypal {
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

// see https://github.com/facebook/react-native/blob/v0.57.1/React/Base/RCTBridgeModule.h
+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(
    requestOneTimePayment:(NSString *)clientToken
    options:(NSDictionary*)options
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        BTAPIClient* braintreeClient = [[BTAPIClient alloc] initWithAuthorization:clientToken];
        if (braintreeClient == nil) {
            NSError *error = [NSError errorWithDomain:@"RNPayPal" code:1 userInfo:nil];
            reject(@"braintree_sdk_setup_failed", @"Could not initialize Braintree SDK", error);
            return;
        }

        BTPayPalDriver *payPalDriver = [[BTPayPalDriver alloc] initWithAPIClient:braintreeClient];
        payPalDriver.viewControllerPresentingDelegate = self;
        payPalDriver.appSwitchDelegate = self;

        BTPayPalRequest *request= [[BTPayPalRequest alloc] initWithAmount:options[@"amount"]];
        BOOL offerPayLater = [options[@"offerPayLater"] boolValue];
        if (offerPayLater) request.offerPayLater = offerPayLater;
        NSString* currency = options[@"currency"];
        if (currency) request.currencyCode = currency;
        NSString* displayName = options[@"displayName"];
        if (displayName) request.displayName = displayName;
        NSString* localeCode = options[@"localeCode"];
        if (localeCode) request.localeCode = localeCode;
        BOOL shippingAddressRequired = [options[@"shippingAddressRequired"] boolValue];
        if (shippingAddressRequired) request.shippingAddressRequired = shippingAddressRequired;
        NSString* userAction = options[@"userAction"];
        if (userAction && [@"commit" isEqualToString:userAction]) request.userAction = BTPayPalRequestUserActionCommit;
        NSString* intent = options[@"intent"];
        if (intent) {
            if ([@"sale" isEqualToString:intent])
                request.intent = BTPayPalRequestIntentSale;
            else if ([@"order" isEqualToString:intent])
                request.intent = BTPayPalRequestIntentOrder;
        }

        [payPalDriver requestOneTimePayment:request completion:^(BTPayPalAccountNonce * _Nullable tokenizedPayPalAccount, NSError * _Nullable error) {
            if (tokenizedPayPalAccount) {
                NSDictionary* result = @{
                    @"nonce" : (tokenizedPayPalAccount.nonce ?: [NSNull null]),
                    @"payerId" : (tokenizedPayPalAccount.payerId ?: [NSNull null]),
                    @"email" : (tokenizedPayPalAccount.email ?: [NSNull null]),
                    @"firstName" : (tokenizedPayPalAccount.firstName ?: [NSNull null]),
                    @"lastName" : (tokenizedPayPalAccount.lastName ?: [NSNull null]),
                    @"phone" : (tokenizedPayPalAccount.phone ?: [NSNull null]),
                    @"billingAddress": @{
                        @"recipientName" : (tokenizedPayPalAccount.billingAddress.recipientName ?: [NSNull null]),
                        @"streetAddress" : (tokenizedPayPalAccount.billingAddress.streetAddress ?: [NSNull null]),
                        @"extendedAddress" : (tokenizedPayPalAccount.billingAddress.extendedAddress ?: [NSNull null]),
                        @"locality" : (tokenizedPayPalAccount.billingAddress.locality ?: [NSNull null]),
                        @"countryCodeAlpha2" : (tokenizedPayPalAccount.billingAddress.countryCodeAlpha2 ?: [NSNull null]),
                        @"postalCode" : (tokenizedPayPalAccount.billingAddress.postalCode ?: [NSNull null]),
                        @"region" : (tokenizedPayPalAccount.billingAddress.region ?: [NSNull null]),
                    },
                    @"shippingAddress": @{
                        @"recipientName" : (tokenizedPayPalAccount.shippingAddress.recipientName ?: [NSNull null]),
                        @"streetAddress" : (tokenizedPayPalAccount.shippingAddress.streetAddress ?: [NSNull null]),
                        @"extendedAddress" : (tokenizedPayPalAccount.shippingAddress.extendedAddress ?: [NSNull null]),
                        @"locality" : (tokenizedPayPalAccount.shippingAddress.locality ?: [NSNull null]),
                        @"countryCodeAlpha2" : (tokenizedPayPalAccount.shippingAddress.countryCodeAlpha2 ?: [NSNull null]),
                        @"postalCode" : (tokenizedPayPalAccount.shippingAddress.postalCode ?: [NSNull null]),
                        @"region" : (tokenizedPayPalAccount.shippingAddress.region ?: [NSNull null]),
                    },
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

RCT_EXPORT_METHOD(
    requestDeviceData:(NSString *)clientToken
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        BTAPIClient* braintreeClient = [[BTAPIClient alloc] initWithAuthorization:clientToken];
        if (braintreeClient == nil) {
            NSError *error = [NSError errorWithDomain:@"RNPayPal" code:1 userInfo:nil];
            reject(@"braintree_sdk_setup_failed", @"Could not initialize Braintree SDK", error);
            return;
        }

        BTDataCollector *dataCollector = [[BTDataCollector alloc] initWithAPIClient:braintreeClient];
        dataCollector.delegate = self;
        [dataCollector collectCardFraudData:^(NSString * _Nonnull deviceData) {
            NSDictionary* result = @{
                @"deviceData" : deviceData,
            };
            resolve(result);
        }];
    });
}



RCT_EXPORT_METHOD(
    requestBillingAgreement:(NSString *)clientToken
    options:(NSDictionary*)options
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        BTAPIClient* braintreeClient = [[BTAPIClient alloc] initWithAuthorization:clientToken];
        if (braintreeClient == nil) {
            NSError *error = [NSError errorWithDomain:@"RNPayPal" code:1 userInfo:nil];
            reject(@"braintree_sdk_setup_failed", @"Could not initialize Braintree SDK", error);
            return;
        }

        if (options[@"billingAgreementDescription"] == nil) {
            NSError *error = [NSError errorWithDomain:@"RNPayPal" code:1 userInfo:nil];
            reject(@"braintree_sdk_setup_failed", @"billingAgreementDescription prop is required", error);
            return;
        }

        BTPayPalDriver *payPalDriver = [[BTPayPalDriver alloc] initWithAPIClient:braintreeClient];
        payPalDriver.viewControllerPresentingDelegate = self;
        payPalDriver.appSwitchDelegate = self;

        BTPayPalRequest *request = [[BTPayPalRequest alloc] initWithAmount:options[@"billingAgreementDescription"]];
        NSString* currency = options[@"currency"];
        if (currency) request.currencyCode = currency;
        NSString* localeCode = options[@"localeCode"];
        if (localeCode) request.localeCode = localeCode;

        [payPalDriver requestBillingAgreement:request completion:^(BTPayPalAccountNonce * _Nullable tokenizedPayPalAccount, NSError * _Nullable error) {
            if (tokenizedPayPalAccount) {
                NSDictionary* result = @{
                    @"nonce" : (tokenizedPayPalAccount.nonce ?: [NSNull null]),
                    @"payerId" : (tokenizedPayPalAccount.payerId ?: [NSNull null]),
                    @"email" : (tokenizedPayPalAccount.email ?: [NSNull null]),
                    @"firstName" : (tokenizedPayPalAccount.firstName ?: [NSNull null]),
                    @"lastName" : (tokenizedPayPalAccount.lastName ?: [NSNull null]),
                    @"phone" : (tokenizedPayPalAccount.phone ?: [NSNull null]),
                    @"billingAddress": @{
                        @"recipientName" : (tokenizedPayPalAccount.billingAddress.recipientName ?: [NSNull null]),
                        @"streetAddress" : (tokenizedPayPalAccount.billingAddress.streetAddress ?: [NSNull null]),
                        @"extendedAddress" : (tokenizedPayPalAccount.billingAddress.extendedAddress ?: [NSNull null]),
                        @"locality" : (tokenizedPayPalAccount.billingAddress.locality ?: [NSNull null]),
                        @"countryCodeAlpha2" : (tokenizedPayPalAccount.billingAddress.countryCodeAlpha2 ?: [NSNull null]),
                        @"postalCode" : (tokenizedPayPalAccount.billingAddress.postalCode ?: [NSNull null]),
                        @"region" : (tokenizedPayPalAccount.billingAddress.region ?: [NSNull null]),
                    },
                    @"shippingAddress": @{
                        @"recipientName" : (tokenizedPayPalAccount.shippingAddress.recipientName ?: [NSNull null]),
                        @"streetAddress" : (tokenizedPayPalAccount.shippingAddress.streetAddress ?: [NSNull null]),
                        @"extendedAddress" : (tokenizedPayPalAccount.shippingAddress.extendedAddress ?: [NSNull null]),
                        @"locality" : (tokenizedPayPalAccount.shippingAddress.locality ?: [NSNull null]),
                        @"countryCodeAlpha2" : (tokenizedPayPalAccount.shippingAddress.countryCodeAlpha2 ?: [NSNull null]),
                        @"postalCode" : (tokenizedPayPalAccount.shippingAddress.postalCode ?: [NSNull null]),
                        @"region" : (tokenizedPayPalAccount.shippingAddress.region ?: [NSNull null]),
                    },
                };

                resolve(result);
                return;
            } else if (error) {
                reject(@"request_billing_agreement_error", @"Error requesting billing agreement", error);
                return;
            } else {
                NSError* e = [NSError errorWithDomain:@"RNPayPal" code:2 userInfo:nil];
                reject(@"user_cancellation", @"User cancelled billing agreement request", e);
            }
        }];
    });
}


- (BOOL)application:(UIApplication *)application
    openURL:(NSURL *)url
    sourceApplication:(NSString *)sourceApplication
    annotation:(id)annotation
{
    if ([url.scheme localizedCaseInsensitiveCompare:URLScheme] == NSOrderedSame) {
        return [BTAppSwitch handleOpenURL:url sourceApplication:sourceApplication];
    }
    return NO;
}

- (BOOL)application:(UIApplication *)application
    openURL:(NSURL *)url
    options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    if ([url.scheme localizedCaseInsensitiveCompare:URLScheme] == NSOrderedSame) {
        return [BTAppSwitch handleOpenURL:url options:options];
    }
    return NO;
}

- (void)configure {
    NSString *bundleIdentifier = [[NSBundle mainBundle] bundleIdentifier];
    NSString *urlscheme = [NSString stringWithFormat:@"%@.payments", bundleIdentifier];
    URLScheme = urlscheme;
    [BTAppSwitch setReturnURLScheme:urlscheme];
}

- (void)paymentDriver:(__unused id)driver requestsPresentationOfViewController:(UIViewController *)viewController {
    [self presentViewController:viewController animated:YES completion:nil];
}

- (void)paymentDriver:(__unused id)driver requestsDismissalOfViewController:(UIViewController *)viewController {
    [viewController dismissViewControllerAnimated:YES completion:nil];
}

@end
