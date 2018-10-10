
package com.smarkets.paypal;

import android.app.Activity;
import android.content.Intent;

import com.braintreepayments.api.BraintreeFragment;
import com.braintreepayments.api.PayPal;
import com.braintreepayments.api.exceptions.ErrorWithResponse;
import com.braintreepayments.api.interfaces.BraintreeCancelListener;
import com.braintreepayments.api.interfaces.BraintreeErrorListener;
import com.braintreepayments.api.interfaces.PaymentMethodNonceCreatedListener;
import com.braintreepayments.api.models.PayPalAccountNonce;
import com.braintreepayments.api.models.PayPalRequest;
import com.braintreepayments.api.models.PaymentMethodNonce;
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

  private BraintreeFragment mBraintreeFragment;

  private Promise promise;

  public RNPaypalModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return TAG;
  }

  @ReactMethod
  public void setup(final String token, final String urlscheme, final Promise promise) {
    try {
      this.mBraintreeFragment = BraintreeFragment.newInstance(getCurrentActivity(), token);
      this.mBraintreeFragment.addListener(new BraintreeCancelListener() {
        @Override
        public void onCancel(int requestCode) {
          promise.reject("user_cancellation", "User cancelled one time payment");
        }
      });
      this.mBraintreeFragment.addListener(new PaymentMethodNonceCreatedListener() {
        @Override
        public void onPaymentMethodNonceCreated(PaymentMethodNonce paymentMethodNonce) {
          nonceCallback(paymentMethodNonce);
        }
      });
      this.mBraintreeFragment.addListener(new BraintreeErrorListener() {
        @Override
        public void onError(Exception error) {
          if (error instanceof ErrorWithResponse) {
            ErrorWithResponse errorWithResponse = (ErrorWithResponse) error;
            promise.reject("request_one_time_payment_error", errorWithResponse.getErrorResponse());
          }
        }
      });
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("braintree_sdk_setup_failed", e);
    }
  }

  @ReactMethod
  public void requestOneTimePayment(final ReadableMap options, final Promise promise) {
    this.promise = promise;

    PayPalRequest request = new PayPalRequest(options.getString("amount"))
        .intent(PayPalRequest.INTENT_AUTHORIZE);

    if (options.hasKey("currencyCode"))
        request.currencyCode(options.getString("currencyCode"));
    if (options.hasKey("localeCode"))
        request.localeCode(options.getString("localeCode"));
    if (options.hasKey("shippingAddressRequired"))
        request.shippingAddressRequired(options.getBoolean("shippingAddressRequired"));

    if (options.hasKey("userAction") &&
        PayPalRequest.USER_ACTION_COMMIT.equals(options.getString("userAction")))
      request.userAction(PayPalRequest.USER_ACTION_COMMIT);

    PayPal.requestOneTimePayment(mBraintreeFragment, request);
  }

  public void nonceCallback(PaymentMethodNonce paymentMethodNonce) {
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
    }

    this.promise.resolve(result);
  }

  @Override
  public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent data) {

  }

  public void onNewIntent(Intent intent){}
}