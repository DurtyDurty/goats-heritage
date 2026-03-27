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
          <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;color:#333;font-family:Arial,sans-serif;font-size:14px;">
            ${item.name}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;color:#333;font-family:Arial,sans-serif;font-size:14px;text-align:center;">
            ${item.qty}
          </td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;color:#333;font-family:Arial,sans-serif;font-size:14px;text-align:right;">
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
<body style="margin:0;padding:0;background-color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td style="padding:0 0 20px;text-align:center;">
              <img src="https://www.goatsheritage.com/images/logo.png" alt="Goats Heritage" style="display:block;margin:0 auto 20px;height:60px;width:auto;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 0 32px;">
              <h2 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:22px;color:#333;">Order Confirmed</h2>
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
                Hey ${customerName},
              </p>
              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
                Thank you for your order. We're getting it ready for you.
              </p>
              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
                Order Number: <strong>${orderNumber}</strong>
              </p>

              <!-- Items Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-collapse:collapse;border:1px solid #e5e5e5;">
                <tr style="background-color:#f5f5f5;">
                  <th style="padding:10px 12px;text-align:left;border-bottom:1px solid #e5e5e5;color:#333;font-family:Arial,sans-serif;font-size:13px;font-weight:600;">Item</th>
                  <th style="padding:10px 12px;text-align:center;border-bottom:1px solid #e5e5e5;color:#333;font-family:Arial,sans-serif;font-size:13px;font-weight:600;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;border-bottom:1px solid #e5e5e5;color:#333;font-family:Arial,sans-serif;font-size:13px;font-weight:600;">Price</th>
                </tr>
                ${itemRows}
              </table>

              <!-- Total -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#333;">Total</td>
                  <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#333;text-align:right;">$${(total / 100).toFixed(2)}</td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;color:#666;font-weight:600;">Shipping Address</p>
              <p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.7;">
                ${shippingAddress}
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td>
                    <a href="${siteUrl}/account/orders" target="_blank" style="display:inline-block;padding:12px 24px;background:#C8A84E;color:#000;font-family:Arial,sans-serif;font-weight:bold;text-decoration:none;border-radius:6px;font-size:14px;">View Order</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;border-top:1px solid #e5e5e5;text-align:center;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#999;">
                <a href="https://www.goatsheritage.com" style="color:#C8A84E;text-decoration:none;">Goats Heritage&#8482; | goatsheritage.com</a>
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#999;">
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
