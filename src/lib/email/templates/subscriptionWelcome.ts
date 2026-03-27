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
<body style="margin:0;padding:0;background-color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo -->
          <tr>
            <td style="padding:0 0 20px;text-align:center;">
              <div style="display:block;margin:0 auto 20px;width:80px;height:80px;border-radius:50%;background:#0A0A0A;padding:10px;text-align:center;"><img src="https://www.goatsheritage.com/images/logo.png" alt="Goats Heritage" style="height:60px;width:auto;display:inline-block;" /></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 0 32px;">
              <h2 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:22px;color:#333;">Welcome to the Club</h2>
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
                Hey ${customerName},
              </p>
              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
                You're officially part of the Goats Heritage family. Your <strong>${tier}</strong> membership is now active.
              </p>

              <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#333;font-weight:600;">Here's what to expect:</p>
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
                Your curated Heritage Box will be shipped at the start of each billing cycle, packed with premium selections handpicked for you.
              </p>

              <p style="margin:24px 0 12px;font-family:Arial,sans-serif;font-size:14px;color:#333;font-weight:600;">Member Perks</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">&#x2022; Exclusive member-only products</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">&#x2022; Early access to new releases</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">&#x2022; Member discounts on all orders</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">&#x2022; Free shipping on every box</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td>
                    <a href="${siteUrl}/account/membership" target="_blank" style="display:inline-block;padding:12px 24px;background:#C8A84E;color:#000;font-family:Arial,sans-serif;font-weight:bold;text-decoration:none;border-radius:6px;font-size:14px;">Explore Member Perks</a>
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
