export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  return NextResponse.json({
    hasUser: !!user,
    userId: user?.id || null,
    email: user?.email || null,
    error: error?.message || null,
  });
}
