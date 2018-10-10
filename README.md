# react-native-paypal

React Native library that implements PayPal [Checkout](https://developers.braintreepayments.com/guides/paypal/checkout-with-paypal/) flow using purely native code.

## Getting started

`$ npm install react-native-paypal --save`

### Mostly automatic installation

1. `$ react-native link react-native-paypal`. Check the result, if iOS and/or Android project files are unchanged, do the steps described in Manual installation. 
2. [iOS] Add `pod 'Braintree'` to your Podfile and run `pod install`. If you want, you can specify a version, e.g. `pod 'Braintree', '~> 4.19.0'`.
3. [Android] Add `implementation "com.braintreepayments.api:braintree:2.17.0"` in `android/app/build.gradle`.

At this point you should be able to build both Android and iOS.

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-paypal` and add `RNPaypal.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libRNPaypal.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`

#### Android

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.smarkets.RNPaypalPackage;` to the imports at the top of the file
  - Add `new RNPaypalPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-paypal'
  	project(':react-native-paypal').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-paypal/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      implementation project(':react-native-paypal')
  	```


## Usage

First you need to get a valid token from your server. Refer to [this](https://developers.braintreepayments.com/start/hello-client/ios/v3#get-a-client-token).

Then you can execute the following code, for example reacting to a button press.

```javascript
import { setup, requestOneTimePayment } from 'react-native-paypal';

await setup(token);
const {
	nonce,
	payerId,
	email,
	firstName,
	lastName,
	phone
} = await requestOneTimePayment({
	amount: '5', // required
	currency: 'GBP', // any PayPal supported currency (see here: https://developer.paypal.com/docs/integration/direct/rest/currency-codes/#paypal-account-payments)
	localeCode: 'en_GB', // any PayPal supported locale (see here: https://braintree.github.io/braintree_ios/Classes/BTPayPalRequest.html#/c:objc(cs)BTPayPalRequest(py)localeCode)
	shippingAddressRequired: false,
	userAction: 'commit', // display 'Pay Now' on the PayPal review page
});
```

