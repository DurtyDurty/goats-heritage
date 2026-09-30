import { createAdminClient } from "@/lib/supabase/admin";

const GRAPH = "https://graph.instagram.com";
const API_VERSION = "v25.0";
export const TOKEN_SETTING_KEY = "instagram_access_token";

export interface InstagramPost {
  id: string;
  caption: string | null;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

/**
 * The long-lived token. A refreshed copy stored in site_settings wins over the
 * env var, so the cron-refreshed token survives without a redeploy. Falls back
 * to INSTAGRAM_ACCESS_TOKEN when the table is missing or empty.
 */
export async function getInstagramToken(): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", TOKEN_SETTING_KEY)
      .maybeSingle();
    if (data?.value) return data.value;
  } catch {
    // table not created yet; use env
  }
  return process.env.INSTAGRAM_ACCESS_TOKEN || null;
}

export async function saveInstagramToken(token: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: TOKEN_SETTING_KEY, value: token, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** Latest posts from the connected account. Cached for an hour; empty on any failure. */
export async function fetchInstagramPosts(limit = 8): Promise<InstagramPost[]> {
  const token = await getInstagramToken();
  if (!token) return [];

  const url = new URL(`${GRAPH}/${API_VERSION}/me/media`);
  url.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("Instagram media fetch failed:", res.status, await res.text());
      return [];
    }
    const json = await res.json();
    return (json.data || []).filter((p: InstagramPost) => p.media_url || p.thumbnail_url);
  } catch (err) {
    console.error("Instagram media fetch error:", err);
    return [];
  }
}

/** Extends a long-lived token by another 60 days. Must be called before it expires. */
export async function refreshInstagramToken(): Promise<{ token: string; expiresInDays: number }> {
  const current = await getInstagramToken();
  if (!current) throw new Error("No Instagram token configured");

  const url = new URL(`${GRAPH}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", current);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(json.error?.message || `Refresh failed with status ${res.status}`);
  }

  await saveInstagramToken(json.access_token);
  return { token: json.access_token, expiresInDays: Math.round((json.expires_in || 0) / 86400) };
}
