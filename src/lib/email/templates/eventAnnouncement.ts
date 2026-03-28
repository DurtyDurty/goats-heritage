const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface EventAnnouncementData {
  title: string;
  eventDate: string;
  location: string | null;
  description: string | null;
}

export function eventAnnouncement({
  title,
  eventDate,
  location,
  description,
}: EventAnnouncementData): { subject: string; html: string } {
  const subject = `${title} | Goats Heritage Event`;

  const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(eventDate).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

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
              <h2 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:22px;color:#333;">You're Invited</h2>
              <h1 style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:28px;color:#0A0A0A;">${title}</h1>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f9f9f9;border-radius:8px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#666;">
                      <strong style="color:#333;">Date:</strong> ${formattedDate}
                    </p>
                    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:14px;color:#666;">
                      <strong style="color:#333;">Time:</strong> ${formattedTime}
                    </p>
                    ${location ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#666;"><strong style="color:#333;">Location:</strong> ${location}</p>` : ""}
                  </td>
                </tr>
              </table>

              ${description ? `<p style="margin:0 0 32px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">${description}</p>` : ""}

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td>
                    <a href="${siteUrl}/events" target="_blank" style="display:inline-block;padding:12px 24px;background:#C8A84E;color:#000;font-family:Arial,sans-serif;font-weight:bold;text-decoration:none;border-radius:6px;font-size:14px;">Learn More</a>
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
