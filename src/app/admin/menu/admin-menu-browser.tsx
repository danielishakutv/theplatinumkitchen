"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActorLike } from "@/modules/users/permissions";
import type { MenuCategory, MenuItem } from "@/modules/menu";
import { RowActions } from "./row-actions";

interface Props {
  categories: MenuCategory[];
  items: MenuItem[];
  actor: ActorLike;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function AdminMenuBrowser({ categories, items, actor }: Props) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const q = normalize(deferred.trim());

  const filtered = useMemo(() => {
    if (q.length === 0) return null;
    return items.filter((i) => {
      return (
        normalize(i.name).includes(q) ||
        normalize(i.description).includes(q) ||
        normalize(i.slug).includes(q) ||
        normalize(i.category).includes(q) ||
        (i.tags ?? []).some((t) => normalize(t).includes(q))
      );
    });
  }, [items, q]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-2xl border border-platinum-200 bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, description, slug, category, or tag…"
            className="h-10 rounded-full border-platinum-200 bg-platinum-50 pl-10 pr-11"
            aria-label="Search the menu"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {filtered ? (
        <FilteredList items={filtered} query={deferred} actor={actor} />
      ) : (
        <CategorizedList categories={categories} items={items} actor={actor} />
      )}
    </div>
  );
}

function FilteredList({
  items,
  query,
  actor,
}: {
  items: MenuItem[];
  query: string;
  actor: ActorLike;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-platinum-300 bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No dishes match &ldquo;{query}&rdquo;.
        </p>
      </div>
    );
  }
  return (
    <section className="overflow-hidden rounded-3xl border border-platinum-200 bg-card">
      <header className="flex items-center justify-between border-b border-platinum-200 bg-platinum-50/40 px-4 py-3 sm:px-6">
        <h2 className="font-display text-base font-medium">
          {items.length} match{items.length === 1 ? "" : "es"}
        </h2>
      </header>
      <ul className="divide-y divide-platinum-200">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} actor={actor} />
        ))}
      </ul>
    </section>
  );
}

function CategorizedList({
  categories,
  items,
  actor,
}: {
  categories: MenuCategory[];
  items: MenuItem[];
  actor: ActorLike;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {categories.map((cat) => {
        const dishes = items.filter((i) => i.category === cat.slug);
        if (dishes.length === 0) return null;
        return (
          <section
            key={cat.slug}
            className="overflow-hidden rounded-3xl border border-platinum-200 bg-card"
          >
            <header className="flex items-center justify-between border-b border-platinum-200 bg-platinum-50/40 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-medium sm:text-xl">
                  {cat.name}
                </h2>
                <p className="truncate text-xs text-muted-foreground">{cat.tagline}</p>
              </div>
              <span className="shrink-0 rounded-full bg-card px-2.5 py-0.5 text-xs font-medium tabular-nums">
                {dishes.length}
              </span>
            </header>
            <ul className="divide-y divide-platinum-200">
              {dishes.map((item) => (
                <ItemRow key={item.id} item={item} actor={actor} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ItemRow({ item, actor }: { item: MenuItem; actor: ActorLike }) {
  const variations = item.addonGroups?.length ?? 0;
  return (
    <li
      className={cn(
        "px-4 py-4 sm:px-6",
        !item.available && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
        {/* Thumbnail — comfortably larger on phone for a more legible row */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-platinum-100 ring-1 ring-platinum-200 sm:h-14 sm:w-14 sm:rounded-lg">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Info column — name and price share the first line; the rest stacks
           cleanly underneath. */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate font-medium leading-tight">{item.name}</p>
            <p className="shrink-0 text-sm font-semibold tabular-nums">
              {formatNaira(item.price)}
            </p>
          </div>

          {item.description ? (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {item.description}
            </p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {item.tags?.includes("chef's-pick") ? (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Pick
              </span>
            ) : null}
            {!item.available ? (
              <span className="rounded-full bg-platinum-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sold out
              </span>
            ) : null}
            {variations > 0 ? (
              <span className="text-[11px] text-muted-foreground">
                {variations} variation{variations === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
        </div>

        {/* Desktop / tablet: compact inline toolbar on the right */}
        <div className="hidden self-center sm:flex">
          <RowActions item={item} actor={actor} variant="inline" />
        </div>
      </div>

      {/* Phone: actions move to their own row, labelled pill buttons with
         comfortable touch targets. */}
      <div className="mt-3 sm:hidden">
        <RowActions item={item} actor={actor} variant="mobile" />
      </div>
    </li>
  );
}
