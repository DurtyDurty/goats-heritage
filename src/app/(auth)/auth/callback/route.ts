import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Check if profile has date_of_birth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Update profile name from signup metadata if not set
    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("date_of_birth")
      .eq("id", user.id)
      .single();

    if (!profile?.date_of_birth) {
      return NextResponse.redirect(`${origin}/auth/verify-age`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
