
package com.smarkets.paypal;

import android.app.Activity;
import android.content.Intent;

import androidx.fragment.app.FragmentActivity;
import com.braintreepayments.api.BraintreeFragment;
import com.braintreepayments.api.DataCollector;
import com.braintreepayments.api.PayPal;
import com.braintreepayments.api.exceptions.ErrorWithResponse;
import com.braintreepayments.api.exceptions.InvalidArgumentException;
import com.braintreepayments.api.interfaces.BraintreeCancelListener;
import com.braintreepayments.api.interfaces.BraintreeErrorListener;
import com.braintreepayments.api.interfaces.BraintreeResponseListener;
import com.braintreepayments.api.interfaces.PaymentMethodNonceCreatedListener;
import com.braintreepayments.api.models.PayPalAccountNonce;
import com.braintreepayments.api.models.PayPalRequest;
import com.braintreepayments.api.models.PaymentMethodNonce;
import com.braintreepayments.api.models.PostalAddress;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

public class RNPaypalModule extends ReactContextBaseJavaModule implements ActivityEventListener {

  private static final String TAG = "RNPaypal";
  private Promise promise;

  public RNPaypalModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void requestOneTimePayment(
      String token,
      ReadableMap options,
      Promise promise) {
    this.promise = promise;
    BraintreeFragment braintreeFragment = null;
    try {
      braintreeFragment = initializeBraintreeFragment(token);
    } catch (Exception e) {
      promise.reject("braintree_sdk_setup_failed", e);
      return;
    }

    PayPalRequest request = new PayPalRequest(options.getString("amount"))
        .intent(PayPalRequest.INTENT_AUTHORIZE);

    if (options.hasKey("offerPayLater"))
        request.offerPayLater(options.getBoolean("offerPayLater"));
    if (options.hasKey("currency"))
        request.currencyCode(options.getString("currency"));
    if (options.hasKey("displayName"))
        request.displayName(options.getString("displayName"));
    if (options.hasKey("localeCode"))
        request.localeCode(options.getString("localeCode"));
    if (options.hasKey("shippingAddressRequired"))
        request.shippingAddressRequired(options.getBoolean("shippingAddressRequired"));

    if (options.hasKey("userAction") &&
        PayPalRequest.USER_ACTION_COMMIT.equals(options.getString("userAction")))
      request.userAction(PayPalRequest.USER_ACTION_COMMIT);

    if (options.hasKey("intent")) {
      String intent = options.getString("intent");
      switch (intent) {
        case PayPalRequest.INTENT_SALE:
          request.intent(PayPalRequest.INTENT_SALE);
          break;
        case PayPalRequest.INTENT_ORDER:
          request.intent(PayPalRequest.INTENT_ORDER);
      }
    }

    PayPal.requestOneTimePayment(braintreeFragment, request);
  }

  protected WritableMap postalAddressToMap(PostalAddress address) {
    WritableMap result = Arguments.createMap();
    result.putString("recipientName", address.getRecipientName());
    result.putString("streetAddress", address.getStreetAddress());
    result.putString("extendedAddress", address.getExtendedAddress());
    result.putString("locality", address.getLocality());
    result.putString("countryCodeAlpha2", address.getCountryCodeAlpha2());
    result.putString("postalCode", address.getPostalCode());
    result.putString("region", address.getRegion());
    return result;
  }

  protected BraintreeFragment initializeBraintreeFragment(
      String token) throws InvalidArgumentException {
    FragmentActivity activity = (FragmentActivity) getCurrentActivity();

    if (activity == null) {
      promise.reject("creation_error", "Something went wrong");
      return null;
    }

    BraintreeFragment braintreeFragment = BraintreeFragment.newInstance(activity, token);
    braintreeFragment.addListener(new BraintreeCancelListener() {
      @Override
      public void onCancel(int requestCode) {
        promise.reject("user_cancellation", "User cancelled one time payment");
      }
    });
    braintreeFragment.addListener(new PaymentMethodNonceCreatedListener() {
      @Override
      public void onPaymentMethodNonceCreated(PaymentMethodNonce paymentMethodNonce) {
        WritableMap result = Arguments.createMap();
        result.putString("nonce", paymentMethodNonce.getNonce());
        if (paymentMethodNonce instanceof PayPalAccountNonce) {
          PayPalAccountNonce payPalAccountNonce = (PayPalAccountNonce)paymentMethodNonce;
          // Access additional information
          result.putString("payerId", payPalAccountNonce.getPayerId());
          result.putString("email", payPalAccountNonce.getEmail());
          result.putString("firstName", payPalAccountNonce.getFirstName());
          result.putString("lastName", payPalAccountNonce.getLastName());
          result.putString("phone", payPalAccountNonce.getPhone());
          result.putMap("billingAddress", postalAddressToMap(payPalAccountNonce.getBillingAddress()));
          result.putMap("shippingAddress", postalAddressToMap(payPalAccountNonce.getShippingAddress()));
        }

        promise.resolve(result);
      }
    });
    braintreeFragment.addListener(new BraintreeErrorListener() {
      @Override
      public void onError(Exception error) {
        if (error instanceof ErrorWithResponse) {
          ErrorWithResponse errorWithResponse = (ErrorWithResponse) error;
          promise.reject("request_one_time_payment_error", errorWithResponse.getErrorResponse());
        }
      }
    });

    return braintreeFragment;
  }

  @ReactMethod
  public void requestBillingAgreement(
          String token,
          ReadableMap options,
          Promise promise
  ) {
    this.promise = promise;
    BraintreeFragment braintreeFragment = null;

    try {
      if (!options.hasKey("billingAgreementDescription")) throw new Exception("billingAgreementDescription prop is required");

      braintreeFragment = initializeBraintreeFragment(token);
    } catch (Exception e) {
      promise.reject("braintree_sdk_setup_failed", e);
      return;
    }

    PayPalRequest request = new PayPalRequest()
        .billingAgreementDescription(options.getString("billingAgreementDescription"));

    if (options.hasKey("currency"))
      request.currencyCode(options.getString("currency"));
    if (options.hasKey("localeCode"))
      request.localeCode(options.getString("localeCode"));

    PayPal.requestBillingAgreement(braintreeFragment, request);
  }

  @ReactMethod
  public void requestDeviceData(
          final String token,
          final Promise promise
  ) {
    this.promise = promise;
    BraintreeFragment braintreeFragment = null;

    try {
      braintreeFragment = initializeBraintreeFragment(token);
    } catch (Exception e) {
      promise.reject("braintree_sdk_setup_failed", e);
      return;
    }

    DataCollector.collectDeviceData(braintreeFragment, new BraintreeResponseListener<String>() {
      @Override
      public void onResponse(String deviceData) {
        WritableMap result = Arguments.createMap();
        result.putString("deviceData", deviceData);
        promise.resolve(result);
      }
    });
  }

  @Override
  public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent data) {

  }

  public void onNewIntent(Intent intent){}
}
