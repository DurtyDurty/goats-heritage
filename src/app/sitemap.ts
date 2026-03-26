import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE_URL = "https://goatsheritage.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/membership`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Dynamic product routes
  const { data: products } = await supabase
    .from("products")
    .select("slug, category, updated_at")
    .eq("is_active", true);

  const productRoutes: MetadataRoute.Sitemap = (products || []).map(
    (product) => ({
      url: `${BASE_URL}/shop/${product.category}/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Dynamic event routes
  const { data: events } = await supabase
    .from("events")
    .select("id, updated_at");

  const eventRoutes: MetadataRoute.Sitemap = (events || []).map((event) => ({
    url: `${BASE_URL}/events/${event.id}`,
    lastModified: new Date(event.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...eventRoutes];
}
