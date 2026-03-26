import { resend } from "./client";
import { orderConfirmation } from "./templates/orderConfirmation";
import { shippingUpdate } from "./templates/shippingUpdate";
import { subscriptionWelcome } from "./templates/subscriptionWelcome";
import { subscriptionRenewal } from "./templates/subscriptionRenewal";
import { paymentFailed } from "./templates/paymentFailed";

const FROM = "Goats Heritage <orders@goatsheritage.com>";

export async function sendOrderConfirmation(
  to: string,
  data: Parameters<typeof orderConfirmation>[0]
) {
  try {
    const { subject, html } = orderConfirmation(data);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}

export async function sendShippingUpdate(
  to: string,
  data: Parameters<typeof shippingUpdate>[0]
) {
  try {
    const { subject, html } = shippingUpdate(data);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Failed to send shipping update email:", error);
  }
}

export async function sendSubscriptionWelcome(
  to: string,
  data: Parameters<typeof subscriptionWelcome>[0]
) {
  try {
    const { subject, html } = subscriptionWelcome(data);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Failed to send subscription welcome email:", error);
  }
}

export async function sendSubscriptionRenewal(
  to: string,
  data: Parameters<typeof subscriptionRenewal>[0]
) {
  try {
    const { subject, html } = subscriptionRenewal(data);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Failed to send subscription renewal email:", error);
  }
}

export async function sendPaymentFailed(
  to: string,
  data: Parameters<typeof paymentFailed>[0]
) {
  try {
    const { subject, html } = paymentFailed(data);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Failed to send payment failed email:", error);
  }
}
