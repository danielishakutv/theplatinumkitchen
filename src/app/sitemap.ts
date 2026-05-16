import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://theplatinumkitchen.com";

// Only the public marketing pages get indexed. Individual menu items open in a
// dialog rather than at /menu/<slug>, so they have no canonical URL of their
// own — listing them here would just feed crawlers 404s.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
