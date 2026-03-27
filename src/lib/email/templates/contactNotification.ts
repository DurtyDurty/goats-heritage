const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface ContactNotificationData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function contactNotification({
  name,
  email,
  subject,
  message,
}: ContactNotificationData): { subject: string; html: string } {
  return {
    subject: `New Contact: ${subject}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0A0A; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #141414; border: 1px solid #262626; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center;">
              <h1 style="margin: 0; font-family: sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #C8A84E;">
                GOATS HERITAGE&trade;
              </h1>
              <div style="margin-top: 16px; height: 1px; background-color: #C8A84E;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <h2 style="margin: 0 0 20px; font-family: sans-serif; font-size: 20px; color: #FFFFFF;">
                New Contact Message
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">From:</td>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #FFFFFF;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">Email:</td>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #FFFFFF;">
                    <a href="mailto:${email}" style="color: #C8A84E; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #A3A3A3;">Subject:</td>
                  <td style="padding: 8px 0; font-family: sans-serif; font-size: 14px; color: #FFFFFF;">${subject}</td>
                </tr>
              </table>
              <div style="padding: 16px; background-color: #0A0A0A; border: 1px solid #262626; border-radius: 8px;">
                <p style="margin: 0; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #FFFFFF; white-space: pre-wrap;">${message}</p>
              </div>
              <div style="margin-top: 24px; text-align: center;">
                <a href="${siteUrl}/admin/inbox" style="display: inline-block; padding: 12px 32px; background-color: #C8A84E; color: #0A0A0A; font-family: sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                  View in Inbox
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #262626; text-align: center;">
              <p style="margin: 0; font-family: sans-serif; font-size: 12px; color: #A3A3A3;">
                &copy; ${new Date().getFullYear()} Goats Heritage&trade;. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; font-family: sans-serif; font-size: 11px; color: #666;">
                You must be 21 years or older to purchase tobacco products.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}
