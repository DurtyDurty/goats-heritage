export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { refreshInstagramToken } from "@/lib/instagram";

// Runs weekly (see vercel.json). Long-lived Instagram tokens expire after 60 days,
// so refreshing every week keeps the homepage feed alive without manual steps.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { expiresInDays } = await refreshInstagramToken();
    return NextResponse.json({ refreshed: true, expiresInDays });
  } catch (err: any) {
    console.error("Instagram token refresh failed:", err);
    return NextResponse.json({ refreshed: false, error: err.message }, { status: 500 });
  }
}
