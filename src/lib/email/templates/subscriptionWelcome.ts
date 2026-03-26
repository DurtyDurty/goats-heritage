const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface SubscriptionWelcomeData {
  customerName: string;
  tier: string;
}

export function subscriptionWelcome({
  customerName,
  tier,
}: SubscriptionWelcomeData): { subject: string; html: string } {
  const subject = "Welcome to the Club | Goats Heritage";

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
              <img src="https://goats-heritage.vercel.app/images/logo.png" alt="Goats Heritage" height="80" style="display:block;margin:0 auto 16px auto;height:80px;width:auto;" />
              <h1 style="margin: 0; font-family: sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #C8A84E;">GOATS HERITAGE</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-family: sans-serif; font-size: 22px; color: #FFFFFF;">Welcome to the Club</h2>
              <p style="margin: 0 0 8px; font-family: sans-serif; font-size: 15px; color: #A3A3A3;">
                Hey ${customerName},
              </p>
              <p style="margin: 0 0 24px; font-family: sans-serif; font-size: 15px; color: #A3A3A3;">
                You're officially part of the Goats Heritage family. Your <strong style="color: #FFFFFF;">${tier}</strong> membership is now active.
              </p>

              <p style="margin: 0 0 12px; font-family: sans-serif; font-size: 14px; color: #FFFFFF; font-weight: 600;">Here's what to expect:</p>
              <p style="margin: 0 0 8px; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">
                Your curated Heritage Box will be shipped at the start of each billing cycle, packed with premium selections handpicked for you.
              </p>

              <p style="margin: 24px 0 12px; font-family: sans-serif; font-size: 14px; color: #C8A84E; font-weight: 600;">Member Perks</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">&#x2022; Exclusive member-only products</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">&#x2022; Early access to new releases</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">&#x2022; Member discounts on all orders</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">&#x2022; Free shipping on every box</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background-color: #C8A84E;">
                    <a href="${siteUrl}/account/membership" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: sans-serif; font-size: 14px; font-weight: 700; color: #0A0A0A; text-decoration: none; letter-spacing: 0.5px;">Explore Member Perks</a>
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
