# Example Server

## Instructions
1) Setup config file (config.js)

```
{
  environment: braintree.Environment.Sandbox,
  merchantId: "useYourMerchantId",
  publicKey: "useYourPublicKey",
  privateKey: "useYourPrivateKey"
}
```

First pick your env (Sandbox or Prod) and go to corresponding site https://www.braintreegateway.com or https://sandbox.braintreegateway.com/

Press the gear on the top right and select "API".  Under "API Keys" generate a new key if one hasn't been created, otherwise click "View" under "private keys".  In the dropdown select "Node" and you will get the exact payload

2) Run `yarn` in `exampleServer` directory

3) Run `yarn start` in `exampleServer` directory
   
4) Point your app to the following endpoints:
* `http://127.0.0.1:3000/token` - for client token
* `http://127.0.0.1:3000/pay` - for payment.  Payload should be nonce (nonce from package flow), device data (device data from package flow), and amount
```
{
   amount, // Amount to deposit.  Needs to match amount sent to requestOneTimePayment
   nonce, // Returned from requestOneTimePayment
   deviceData // (optional) Returned from requestDeviceData
}
```
