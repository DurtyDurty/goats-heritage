const AuthorizeNet = require("authorizenet");
const ApiContracts = AuthorizeNet.APIContracts;
const ApiControllers = AuthorizeNet.APIControllers;

import { getMerchantAuth, isProduction } from "./client";

function getEnvironment() {
  return isProduction()
    ? AuthorizeNet.Constants.endpoint.production
    : AuthorizeNet.Constants.endpoint.sandbox;
}

// ─── 1. Create Transaction ───────────────────────────────────────────────────

interface TransactionInput {
  amountInDollars: number;
  opaqueData: { dataDescriptor: string; dataValue: string };
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  customerInfo: { firstName: string; lastName: string; email: string };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  invoiceNumber: string;
}

export function createTransaction(
  input: TransactionInput
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const merchantAuth = getMerchantAuth();

  // Opaque data (from Accept.js tokenization)
  const opaqueDataType = new ApiContracts.OpaqueDataType();
  opaqueDataType.setDataDescriptor(input.opaqueData.dataDescriptor);
  opaqueDataType.setDataValue(input.opaqueData.dataValue);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setOpaqueData(opaqueDataType);

  // Line items
  const lineItems: any[] = [];
  for (const item of input.items) {
    const lineItem = new ApiContracts.LineItemType();
    lineItem.setItemId(lineItems.length.toString());
    lineItem.setName(item.name.substring(0, 31));
    lineItem.setQuantity(item.quantity.toString());
    lineItem.setUnitPrice(item.unitPrice.toFixed(2));
    lineItems.push(lineItem);
  }

  const lineItemsList = new ApiContracts.ArrayOfLineItem();
  lineItemsList.setLineItem(lineItems);

  // Order
  const orderType = new ApiContracts.OrderType();
  orderType.setInvoiceNumber(input.invoiceNumber);
  orderType.setDescription("Goats Heritage Order");

  // Bill-to
  const billTo = new ApiContracts.CustomerAddressType();
  billTo.setFirstName(input.customerInfo.firstName);
  billTo.setLastName(input.customerInfo.lastName);
  billTo.setEmail(input.customerInfo.email);

  // Ship-to
  const shipTo = new ApiContracts.CustomerAddressType();
  shipTo.setFirstName(input.shippingAddress.firstName);
  shipTo.setLastName(input.shippingAddress.lastName);
  shipTo.setAddress(input.shippingAddress.address);
  shipTo.setCity(input.shippingAddress.city);
  shipTo.setState(input.shippingAddress.state);
  shipTo.setZip(input.shippingAddress.zip);
  shipTo.setPhoneNumber(input.shippingAddress.phone);

  // Transaction request
  const transactionRequest = new ApiContracts.TransactionRequestType();
  transactionRequest.setTransactionType(
    ApiContracts.TransactionTypeEnum.AUTH_CAPTURE_TRANSACTION
  );
  transactionRequest.setAmount(input.amountInDollars.toFixed(2));
  transactionRequest.setPayment(paymentType);
  transactionRequest.setLineItems(lineItemsList);
  transactionRequest.setOrder(orderType);
  transactionRequest.setBillTo(billTo);
  transactionRequest.setShipTo(shipTo);

  const createRequest = new ApiContracts.CreateTransactionRequest();
  createRequest.setMerchantAuthentication(merchantAuth);
  createRequest.setTransactionRequest(transactionRequest);

  const ctrl = new ApiControllers.CreateTransactionController(
    createRequest.getJSON()
  );
  ctrl.setEnvironment(getEnvironment());

  return new Promise((resolve) => {
    ctrl.execute(function () {
      const response = ctrl.getResponse();
      const result = new ApiContracts.CreateTransactionResponse(response);

      if (
        result.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        const txResponse = result.getTransactionResponse();
        if (txResponse && txResponse.getMessages()) {
          resolve({
            success: true,
            transactionId: txResponse.getTransId(),
          });
        } else {
          const errors = txResponse?.getErrors?.();
          const errorText = errors
            ? errors.getError()[0].getErrorText()
            : "Transaction failed";
          resolve({ success: false, error: errorText });
        }
      } else {
        const txResponse = result.getTransactionResponse();
        let errorText = "Transaction failed";
        if (txResponse && txResponse.getErrors()) {
          errorText = txResponse.getErrors().getError()[0].getErrorText();
        } else if (result.getMessages()) {
          errorText = result
            .getMessages()
            .getMessage()[0]
            .getText();
        }
        resolve({ success: false, error: errorText });
      }
    });
  });
}

// ─── 2. Create Subscription ─────────────────────────────────────────────────

interface SubscriptionInput {
  name: string;
  intervalLength: number;
  intervalUnit: string;
  startDate: string;
  totalOccurrences?: number;
  amount: number;
  opaqueData: { dataDescriptor: string; dataValue: string };
  customerInfo: { firstName: string; lastName: string; email: string };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
}

export function createSubscription(
  input: SubscriptionInput
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  const merchantAuth = getMerchantAuth();

  // Interval
  const interval = new ApiContracts.PaymentScheduleType.Interval();
  interval.setLength(input.intervalLength);
  interval.setUnit(
    input.intervalUnit === "months"
      ? ApiContracts.ARBSubscriptionUnitEnum.MONTHS
      : ApiContracts.ARBSubscriptionUnitEnum.DAYS
  );

  // Payment schedule
  const paymentSchedule = new ApiContracts.PaymentScheduleType();
  paymentSchedule.setInterval(interval);
  paymentSchedule.setStartDate(input.startDate);
  paymentSchedule.setTotalOccurrences(input.totalOccurrences ?? 9999);

  // Opaque data payment
  const opaqueDataType = new ApiContracts.OpaqueDataType();
  opaqueDataType.setDataDescriptor(input.opaqueData.dataDescriptor);
  opaqueDataType.setDataValue(input.opaqueData.dataValue);

  const paymentType = new ApiContracts.PaymentType();
  paymentType.setOpaqueData(opaqueDataType);

  // Bill-to
  const billTo = new ApiContracts.CustomerAddressType();
  billTo.setFirstName(input.customerInfo.firstName);
  billTo.setLastName(input.customerInfo.lastName);

  // Subscription
  const subscription = new ApiContracts.ARBSubscriptionType();
  subscription.setName(input.name);
  subscription.setPaymentSchedule(paymentSchedule);
  subscription.setAmount(input.amount.toFixed(2));
  subscription.setPayment(paymentType);
  subscription.setBillTo(billTo);

  const createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
  createRequest.setMerchantAuthentication(merchantAuth);
  createRequest.setSubscription(subscription);

  const ctrl = new ApiControllers.ARBCreateSubscriptionController(
    createRequest.getJSON()
  );
  ctrl.setEnvironment(getEnvironment());

  return new Promise((resolve) => {
    ctrl.execute(function () {
      const response = ctrl.getResponse();
      const result = new ApiContracts.ARBCreateSubscriptionResponse(response);

      if (
        result.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        resolve({
          success: true,
          subscriptionId: result.getSubscriptionId(),
        });
      } else {
        const errorText = result
          .getMessages()
          .getMessage()[0]
          .getText();
        resolve({ success: false, error: errorText });
      }
    });
  });
}

// ─── 3. Cancel Subscription ─────────────────────────────────────────────────

export function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  const merchantAuth = getMerchantAuth();

  const cancelRequest = new ApiContracts.ARBCancelSubscriptionRequest();
  cancelRequest.setMerchantAuthentication(merchantAuth);
  cancelRequest.setSubscriptionId(subscriptionId);

  const ctrl = new ApiControllers.ARBCancelSubscriptionController(
    cancelRequest.getJSON()
  );
  ctrl.setEnvironment(getEnvironment());

  return new Promise((resolve) => {
    ctrl.execute(function () {
      const response = ctrl.getResponse();
      const result = new ApiContracts.ARBCancelSubscriptionResponse(response);

      if (
        result.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        resolve({ success: true });
      } else {
        const errorText = result
          .getMessages()
          .getMessage()[0]
          .getText();
        resolve({ success: false, error: errorText });
      }
    });
  });
}

// ─── 4. Get Subscription Status ─────────────────────────────────────────────

export function getSubscriptionStatus(
  subscriptionId: string
): Promise<{ status?: string; error?: string }> {
  const merchantAuth = getMerchantAuth();

  const statusRequest = new ApiContracts.ARBGetSubscriptionStatusRequest();
  statusRequest.setMerchantAuthentication(merchantAuth);
  statusRequest.setSubscriptionId(subscriptionId);

  const ctrl = new ApiControllers.ARBGetSubscriptionStatusController(
    statusRequest.getJSON()
  );
  ctrl.setEnvironment(getEnvironment());

  return new Promise((resolve) => {
    ctrl.execute(function () {
      const response = ctrl.getResponse();
      const result = new ApiContracts.ARBGetSubscriptionStatusResponse(
        response
      );

      if (
        result.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        resolve({ status: result.getStatus() });
      } else {
        const errorText = result
          .getMessages()
          .getMessage()[0]
          .getText();
        resolve({ error: errorText });
      }
    });
  });
}

// ─── 5. Get Transaction Details ─────────────────────────────────────────────

export function getTransactionDetails(
  transactionId: string
): Promise<{ transactionDetails?: any; error?: string }> {
  const merchantAuth = getMerchantAuth();

  const detailsRequest = new ApiContracts.GetTransactionDetailsRequest();
  detailsRequest.setMerchantAuthentication(merchantAuth);
  detailsRequest.setTransId(transactionId);

  const ctrl = new ApiControllers.GetTransactionDetailsController(
    detailsRequest.getJSON()
  );
  ctrl.setEnvironment(getEnvironment());

  return new Promise((resolve) => {
    ctrl.execute(function () {
      const response = ctrl.getResponse();
      const result = new ApiContracts.GetTransactionDetailsResponse(response);

      if (
        result.getMessages().getResultCode() ===
        ApiContracts.MessageTypeEnum.OK
      ) {
        resolve({ transactionDetails: result.getTransaction() });
      } else {
        const errorText = result
          .getMessages()
          .getMessage()[0]
          .getText();
        resolve({ error: errorText });
      }
    });
  });
}
