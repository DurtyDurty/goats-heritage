const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface OrderConfirmationData {
  orderNumber: string;
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  customerName: string;
}

export function orderConfirmation({
  orderNumber,
  items,
  total,
  shippingAddress,
  customerName,
}: OrderConfirmationData): { subject: string; html: string } {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #2A2A2A; color: #FFFFFF; font-family: sans-serif; font-size: 14px;">
            ${item.name}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #2A2A2A; color: #A3A3A3; font-family: sans-serif; font-size: 14px; text-align: center;">
            ${item.qty}
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #2A2A2A; color: #FFFFFF; font-family: sans-serif; font-size: 14px; text-align: right;">
            $${(item.price / 100).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  const subject = "Order Confirmed | Goats Heritage";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #141414; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-bottom: 1px solid #2A2A2A;">
              <img src="https://goats-heritage.vercel.app/images/logo.webp" alt="Goats Heritage" height="80" style="display:block;margin:0 auto 16px auto;height:80px;width:auto;" />
              <h1 style="margin: 0; font-family: sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #C8A84E;">GOATS HERITAGE</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-family: sans-serif; font-size: 22px; color: #FFFFFF;">Order Confirmed</h2>
              <p style="margin: 0 0 8px; font-family: sans-serif; font-size: 15px; color: #A3A3A3;">
                Hey ${customerName},
              </p>
              <p style="margin: 0 0 24px; font-family: sans-serif; font-size: 15px; color: #A3A3A3;">
                Thank you for your order. We're getting it ready for you.
              </p>
              <p style="margin: 0 0 24px; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">
                Order Number: <strong style="color: #FFFFFF;">${orderNumber}</strong>
              </p>

              <!-- Items Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <th style="padding: 12px 16px; text-align: left; border-bottom: 2px solid #C8A84E; color: #C8A84E; font-family: sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                  <th style="padding: 12px 16px; text-align: center; border-bottom: 2px solid #C8A84E; color: #C8A84E; font-family: sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                  <th style="padding: 12px 16px; text-align: right; border-bottom: 2px solid #C8A84E; color: #C8A84E; font-family: sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                </tr>
                ${itemRows}
              </table>

              <!-- Total -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; font-family: sans-serif; font-size: 16px; font-weight: 700; color: #FFFFFF;">Total</td>
                  <td style="padding: 12px 16px; font-family: sans-serif; font-size: 16px; font-weight: 700; color: #C8A84E; text-align: right;">$${(total / 100).toFixed(2)}</td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <p style="margin: 0 0 4px; font-family: sans-serif; font-size: 12px; color: #C8A84E; text-transform: uppercase; letter-spacing: 1px;">Shipping Address</p>
              <p style="margin: 0 0 32px; font-family: sans-serif; font-size: 14px; color: #A3A3A3; line-height: 1.5;">
                ${shippingAddress}
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background-color: #C8A84E;">
                    <a href="${siteUrl}/account/orders" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: sans-serif; font-size: 14px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 0.5px;">View Order</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #2A2A2A; text-align: center;">
              <p style="margin: 0 0 8px; font-family: sans-serif; font-size: 11px; color: #A3A3A3;">
                This product is derived from tobacco. Nicotine is an addictive chemical.
              </p>
              <p style="margin: 0; font-family: sans-serif; font-size: 11px; color: #A3A3A3;">
                &copy; ${new Date().getFullYear()} Goats Heritage. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
