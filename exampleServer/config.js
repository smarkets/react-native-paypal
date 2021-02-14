const braintree = require("braintree");

const config = {
  environment: braintree.Environment.Sandbox, // or braintree.Environment.Production
  merchantId: "useYourMerchantId",
  publicKey: "useYourPublicKey",
  privateKey: "useYourPrivateKey"
}

module.exports = config
