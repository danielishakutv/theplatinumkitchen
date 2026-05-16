import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://theplatinumkitchen.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't waste crawl budget on admin, auth, API, or per-customer pages.
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/account",
          "/account/",
          "/checkout",
          "/checkout/",
          "/order/",
          "/invoice/",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/offline",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
