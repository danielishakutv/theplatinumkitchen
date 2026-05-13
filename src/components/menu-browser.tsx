"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { MenuItemCard } from "@/components/menu-item-card";
import { CategoryNav } from "@/components/category-nav";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuCategory, MenuItem } from "@/modules/menu";

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

interface Scored {
  item: MenuItem;
  score: number;
}

function scoreItem(item: MenuItem, q: string): number {
  const name = normalize(item.name);
  const desc = normalize(item.description);
  const tags = (item.tags ?? []).map((t) => normalize(t));

  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (tags.some((t) => t === q)) return 50;
  if (tags.some((t) => t.includes(q))) return 40;
  if (desc.includes(q)) return 20;
  return 0;
}

export function MenuBrowser({ categories, items }: Props) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const q = normalize(deferredQuery.trim());

  const matches = useMemo<Scored[]>(() => {
    if (q.length === 0) return [];
    return items
      .map((item) => ({ item, score: scoreItem(item, q) }))
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [items, q]);

  const suggestions = matches.slice(0, 6);
  const isSearching = q.length > 0;

  return (
    <div className="space-y-8">
      {/* Search bar — sticky-ish at the top of the menu page. */}
      <div className="sticky top-16 z-20 -mx-4 border-b border-platinum-200/60 bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="relative mx-auto max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search dishes — try “jollof”, “suya”, “spicy”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-full border-platinum-200 bg-card pl-11 pr-11 text-base shadow-sm"
            aria-label="Search the menu"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          {/* Live suggestions dropdown (top 6) — only renders while typing. */}
          {isSearching && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-platinum-200 bg-card shadow-xl shadow-platinum-300/30">
              <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {matches.length} match{matches.length === 1 ? "" : "es"}
              </p>
              <ul className="max-h-80 divide-y divide-platinum-100 overflow-y-auto">
                {suggestions.map(({ item }) => (
                  <li key={item.id}>
                    <a
                      href={`#item-${item.slug}`}
                      onClick={() => setQuery("")}
                      className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-platinum-50"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-foreground/80">
                        {formatNaira(item.price)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {/* Category nav stays put when not searching. */}
      {!isSearching ? <CategoryNav categories={categories} /> : null}

      {isSearching ? (
        <SearchResults matches={matches.map((m) => m.item)} query={deferredQuery} />
      ) : (
        <CategorizedView categories={categories} items={items} />
      )}
    </div>
  );
}

function SearchResults({ matches, query }: { matches: MenuItem[]; query: string }) {
  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="font-display text-2xl font-medium leading-tight">
          No dishes match &ldquo;{query}&rdquo;
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different word, or clear the search to browse by category.
        </p>
      </div>
    );
  }
  return (
    <section>
      <header className="mb-6 border-b border-platinum-200 pb-4">
        <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
          {matches.length} dish{matches.length === 1 ? "" : "es"} matching &ldquo;{query}&rdquo;
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sorted by best match.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((dish) => (
          <MenuItemCard key={dish.id} item={dish} />
        ))}
      </div>
    </section>
  );
}

function CategorizedView({
  categories,
  items,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
}) {
  return (
    <div className="space-y-16">
      {categories.map((cat) => {
        const dishes = items.filter((i) => i.category === cat.slug);
        if (dishes.length === 0) return null;
        return (
          <section key={cat.slug} id={cat.slug} className="scroll-mt-32">
            <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-platinum-200 pb-4">
              <div>
                <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                  {cat.name}
                </h2>
                {cat.tagline ? (
                  <p className="mt-1 text-sm text-muted-foreground">{cat.tagline}</p>
                ) : null}
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {dishes.length} dish{dishes.length === 1 ? "" : "es"}
              </span>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {dishes.map((dish) => (
                <div key={dish.id} id={`item-${dish.slug}`} className={cn("scroll-mt-40")}>
                  <MenuItemCard item={dish} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
