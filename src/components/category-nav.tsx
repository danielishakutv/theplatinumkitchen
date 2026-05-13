"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/modules/menu";

export function CategoryNav({ categories }: { categories: MenuCategory[] }) {
  const [active, setActive] = useState(categories[0]?.slug);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const headerOffset = 200;
    const targets = categories
      .map((c) => document.getElementById(c.slug))
      .filter((el): el is HTMLElement => Boolean(el));

    const onScroll = () => {
      const y = window.scrollY + headerOffset;
      let current = categories[0]?.slug;
      for (const el of targets) {
        if (el.offsetTop <= y) current = el.id as typeof current;
      }
      if (current !== undefined) setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories]);

  return (
    <div className="sticky top-16 z-30 -mx-4 bg-background/85 backdrop-blur-md sm:-mx-6 lg:-mx-8">
      <div className="border-b border-platinum-200/70">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8 scrollbar-hide">
          <nav className="flex min-w-max items-center gap-1 py-3">
            {categories.map((c) => {
              const isActive = active === c.slug;
              return (
                <a
                  key={c.slug}
                  href={`#${c.slug}`}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {c.name}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
