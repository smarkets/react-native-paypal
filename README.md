# react-native-paypal

[![npm version](https://img.shields.io/npm/v/react-native-paypal.svg)](https://www.npmjs.com/package/react-native-paypal)
![npm](https://img.shields.io/npm/dm/react-native-paypal.svg)
[![GitHub license](https://img.shields.io/github/license/smarkets/react-native-paypal.svg)](https://github.com/smarkets/react-native-paypal/blob/master/LICENSE)


React Native library that implements PayPal [Checkout](https://developers.braintreepayments.com/guides/paypal/checkout-with-paypal/) flow using purely native code.

![Demo](https://smrkts.co/2yqrDKT)

## Getting started

`$ npm install react-native-paypal --save` or `$ yarn install react-native-paypal`

### Mostly automatic installation

1. `$ react-native link react-native-paypal`. Check the result, if iOS and/or Android project files are unchanged, do the steps described in Manual installation. 
1. [Android] Add `implementation "com.braintreepayments.api:braintree:2.17.0"` in `android/app/build.gradle`.
1. [iOS] Add `pod 'Braintree'` to your Podfile and run `pod install`. If you want, you can specify a version, e.g. `pod 'Braintree', '~> 4.19.0'`.
1. [iOS] Register a URL scheme in Xcode (**must** always start with your Bundle Identifier and end in `.payments` - e.g. `your.app.id.payments`). See details [here](https://developers.braintreepayments.com/guides/paypal/client-side/ios/v4#register-a-url-type).
1. [iOS] Edit your `AppDelegate.m` as follows:
    ```objc
    #import "RNPaypal.h"

    - (BOOL)application:(UIApplication *)application 
      didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
    {
      [[RNPaypal sharedInstance] configure];
    }

    - (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
      sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
    {
      return [[RNPaypal sharedInstance] application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
    }
    
    ```

At this point you should be able to build both Android and iOS.

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
1. Go to `node_modules` ➜ `react-native-paypal` and add `RNPaypal.xcodeproj`
1. In XCode, in the project navigator, select your project. Add `libRNPaypal.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.smarkets.paypal.RNPaypalPackage;` to the imports at the top of the file
  - Add `new RNPaypalPackage()` to the list returned by the `getPackages()` method
1. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-paypal'
  	project(':react-native-paypal').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-paypal/android')
  	```
1. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      implementation project(':react-native-paypal')
  	```


## Usage

First you need to get a valid token from your server. Refer to [this](https://developers.braintreepayments.com/start/hello-client/ios/v3#get-a-client-token).

Then you can execute the following code, for example reacting to a button press.

```javascript
import { requestOneTimePayment } from 'react-native-paypal';

const {
	nonce,
	payerId,
	email,
	firstName,
	lastName,
	phone
} = await requestOneTimePayment(
  token,
  {
    amount: '5', // required
    // any PayPal supported currency (see here: https://developer.paypal.com/docs/integration/direct/rest/currency-codes/#paypal-account-payments)
    currency: 'GBP',
    // any PayPal supported locale (see here: https://braintree.github.io/braintree_ios/Classes/BTPayPalRequest.html#/c:objc(cs)BTPayPalRequest(py)localeCode)
    localeCode: 'en_GB', 
    shippingAddressRequired: false,
    userAction: 'commit', // display 'Pay Now' on the PayPal review page
    // one of 'authorize', 'sale', 'order'. defaults to 'authorize'. see details here: https://developer.paypal.com/docs/api/payments/v1/#payment-create-request-body
    intent: 'authorize', 
  }
);
```
