interface AdminComposeData {
  subject: string;
  message: string;
}

export function adminCompose({
  subject,
  message,
}: AdminComposeData): { subject: string; html: string } {
  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="font-size:14px;line-height:1.7;color:#333333;white-space:pre-wrap;">${message}</div>
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;">
      <p style="margin:0;font-size:12px;color:#999;">
        Goats Heritage™ | <a href="https://www.goatsheritage.com" style="color:#C8A84E;text-decoration:none;">goatsheritage.com</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}
