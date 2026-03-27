const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface ContactReplyData {
  customerName: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
}

export function contactReply({
  customerName,
  originalSubject,
  originalMessage,
  replyMessage,
}: ContactReplyData): { subject: string; html: string } {
  return {
    subject: `Re: ${originalSubject}`,
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
              <p style="margin: 0 0 20px; font-family: sans-serif; font-size: 16px; color: #FFFFFF;">
                Hi ${customerName},
              </p>
              <p style="margin: 0 0 24px; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #FFFFFF;">
                Thank you for reaching out. Here is our response to your inquiry:
              </p>
              <div style="padding: 16px; background-color: #0A0A0A; border: 1px solid #262626; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #FFFFFF; white-space: pre-wrap;">${replyMessage}</p>
              </div>
              <div style="padding: 16px; background-color: #0A0A0A; border-left: 3px solid #262626; border-radius: 4px;">
                <p style="margin: 0 0 8px; font-family: sans-serif; font-size: 12px; color: #A3A3A3; text-transform: uppercase; letter-spacing: 1px;">
                  Your original message:
                </p>
                <p style="margin: 0; font-family: sans-serif; font-size: 13px; line-height: 1.5; color: #A3A3A3; white-space: pre-wrap;">${originalMessage}</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #262626; text-align: center;">
              <p style="margin: 0 0 8px; font-family: sans-serif; font-size: 13px; color: #A3A3A3;">
                Need more help? Reply to this email or visit
                <a href="${siteUrl}/contact" style="color: #C8A84E; text-decoration: none;">our contact page</a>.
              </p>
              <p style="margin: 16px 0 0; font-family: sans-serif; font-size: 12px; color: #A3A3A3;">
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
