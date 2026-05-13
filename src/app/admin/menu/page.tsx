import Image from "next/image";
import Link from "next/link";
import { FolderTree, Plus, Settings2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listCategories, listItems } from "@/modules/menu";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RowActions } from "./row-actions";

export const metadata = { title: "Menu" };

export default async function AdminMenuPage() {
  const session = await auth();
  const user = session!.user;
  const [categories, items] = await Promise.all([listCategories(), listItems()]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Menu
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} dish{items.length === 1 ? "" : "es"} across{" "}
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 gap-1.5 rounded-full">
            <Link href="/admin/menu/categories">
              <FolderTree className="h-4 w-4" /> Categories
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-10 gap-1.5 rounded-full">
            <Link href="/admin/menu/addons">
              <Settings2 className="h-4 w-4" /> Variations
            </Link>
          </Button>
          <Button asChild className="h-10 gap-1.5 rounded-full">
            <Link href="/admin/menu/items/new">
              <Plus className="h-4 w-4" /> New dish
            </Link>
          </Button>
        </div>
      </header>

      <div className="rounded-2xl border border-platinum-200 bg-card p-3">
        <Input
          placeholder="Search the menu…"
          className="h-10 rounded-full border-platinum-200 bg-platinum-50"
        />
      </div>

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
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4",
                      !item.available && "opacity-60",
                    )}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-platinum-100 sm:h-14 sm:w-14">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{item.name}</p>
                        {item.tags?.includes("chef's-pick") ? (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                            Pick
                          </span>
                        ) : null}
                        {!item.available ? (
                          <span className="rounded-full bg-platinum-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            Sold out
                          </span>
                        ) : null}
                      </div>
                      <p className="hidden truncate text-xs text-muted-foreground sm:block">
                        {item.description}
                      </p>
                      <p className="mt-0.5 text-xs font-medium tabular-nums text-foreground/80">
                        {formatNaira(item.price)}
                        {(item.addonGroups?.length ?? 0) > 0 ? (
                          <span className="ml-2 text-muted-foreground">
                            · {item.addonGroups!.length} variation
                            {item.addonGroups!.length === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <RowActions item={item} actor={user} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
