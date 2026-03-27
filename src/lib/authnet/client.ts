const AuthorizeNet = require("authorizenet");
const ApiContracts = AuthorizeNet.APIContracts;

export function getMerchantAuth() {
  const merchantAuth = new ApiContracts.MerchantAuthenticationType();
  merchantAuth.setName(process.env.AUTHNET_API_LOGIN_ID!);
  merchantAuth.setTransactionKey(process.env.AUTHNET_TRANSACTION_KEY!);
  return merchantAuth;
}

export function isProduction() {
  return process.env.AUTHNET_ENVIRONMENT === "production";
}

export { ApiContracts, AuthorizeNet };
