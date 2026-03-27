const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface ShippingUpdateData {
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
}

export function shippingUpdate({
  orderNumber,
  trackingNumber,
  customerName,
}: ShippingUpdateData): { subject: string; html: string } {
  const subject = "Your Order Has Shipped | Goats Heritage";

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
              <img src="${siteUrl}/images/logo.png" alt="Goats Heritage" height="80" style="display:block;margin:0 auto 16px auto;height:80px;width:auto;" />
              <h1 style="margin: 0; font-family: sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #C8A84E;">GOATS HERITAGE</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-family: sans-serif; font-size: 22px; color: #FFFFFF;">Your Order Has Shipped</h2>
              <p style="margin: 0 0 8px; font-family: sans-serif; font-size: 15px; color: #A3A3A3;">
                Hey ${customerName},
              </p>
              <p style="margin: 0 0 24px; font-family: sans-serif; font-size: 15px; color: #A3A3A3;">
                Great news — your order is on its way!
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #0A0A0A; border-radius: 6px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px; font-family: sans-serif; font-size: 12px; color: #C8A84E; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                    <p style="margin: 0 0 20px; font-family: sans-serif; font-size: 16px; color: #FFFFFF; font-weight: 600;">${orderNumber}</p>
                    <p style="margin: 0 0 12px; font-family: sans-serif; font-size: 12px; color: #C8A84E; text-transform: uppercase; letter-spacing: 1px;">Tracking Number</p>
                    <p style="margin: 0; font-family: sans-serif; font-size: 16px; color: #FFFFFF; font-weight: 600;">${trackingNumber}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                <tr>
                  <td style="border-radius: 6px; background-color: #C8A84E;">
                    <a href="${siteUrl}/account/orders" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: sans-serif; font-size: 14px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 0.5px;">Track Your Order</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3; text-align: center;">
                Estimated delivery: 3–7 business days
              </p>
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
