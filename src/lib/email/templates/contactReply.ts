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
<body style="margin:0;padding:20px;font-family:Arial,sans-serif;background:#ffffff;">
  <div style="max-width:600px;margin:0 auto;">
    <img src="https://www.goatsheritage.com/images/logo.png" alt="Goats Heritage" style="display:block;margin:0 auto 20px;height:60px;width:auto;" />
    <p style="margin:0 0 16px;font-size:14px;color:#333;">Hi ${customerName},</p>
    <p style="margin:0 0 16px;font-size:14px;color:#333;">Thank you for reaching out. Here is our response:</p>
    <div style="font-size:14px;line-height:1.7;color:#333;white-space:pre-wrap;">${replyMessage}</div>
    <div style="margin-top:24px;padding:12px 16px;background:#f5f5f5;border-left:3px solid #C8A84E;border-radius:4px;">
      <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Your original message:</p>
      <p style="margin:0;font-size:13px;color:#666;white-space:pre-wrap;">${originalMessage}</p>
    </div>
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
