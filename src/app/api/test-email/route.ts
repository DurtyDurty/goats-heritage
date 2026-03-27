export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { resend } from "@/lib/email/client";

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Goats Heritage <contact@goatsheritage.com>",
      to: "nestor.cuevassoto@yahoo.com",
      subject: "Your site works bro 🐐",
      html: `
        <div style="background:#0A0A0A;padding:40px 20px;font-family:Arial,sans-serif;">
          <div style="max-width:500px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:12px;padding:32px;text-align:center;">
            <h2 style="color:#C8A84E;font-size:18px;letter-spacing:0.1em;margin:0;">GOATS HERITAGE™</h2>
            <div style="width:48px;height:1px;background:#C8A84E;margin:16px auto;opacity:0.4;"></div>
            <h1 style="color:#F5F5F5;font-size:24px;margin:16px 0;">Your site works bro 🐐</h1>
            <p style="color:#A3A3A3;font-size:14px;line-height:1.6;">
              Goats Heritage is live and the email system is working.
              Heritage in every draw.
            </p>
            <a href="https://www.goatsheritage.com" style="display:inline-block;margin:24px 0;padding:12px 32px;background:#C8A84E;color:#000;font-weight:bold;text-decoration:none;border-radius:8px;">Visit the Site</a>
            <div style="margin-top:24px;padding-top:16px;border-top:1px solid #262626;">
              <p style="color:#A3A3A3;font-size:11px;opacity:0.6;">★ Proud Veteran-Owned Business ★</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
