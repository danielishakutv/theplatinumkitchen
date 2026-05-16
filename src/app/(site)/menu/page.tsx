import { listCategories, listItems } from "@/modules/menu";
import { MenuBrowser } from "@/components/menu-browser";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "The full Platinum Kitchen menu — signatures, rice & grains, soups & swallow, grills, suya, small chops, and more. Order Nigerian food delivered across Abuja.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Platinum Kitchen Menu",
    description:
      "Browse the full menu — signature jollof, suya, soups, small chops, and more. Built dish by dish, by hand.",
    url: "/menu",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platinum Kitchen Menu",
    description:
      "Browse the full menu — signature jollof, suya, soups, small chops, and more.",
  },
};

// Reads from the database, so we render on demand instead of at build time
// (when DATABASE_URL isn't available inside the Docker build context).
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [categories, items] = await Promise.all([listCategories(), listItems()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          The full menu
        </span>
        <h1 className="text-balance mt-3 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Built dish by dish, by hand.
        </h1>
        <p className="text-balance mt-4 text-muted-foreground">
          Tap any dish to customise — choose your protein, set the spice, add
          extras. We&apos;ll have it ready in roughly the time it takes to choose.
        </p>
      </div>

      <div className="mt-8">
        <MenuBrowser categories={categories} items={items} />
      </div>
    </div>
  );
}
