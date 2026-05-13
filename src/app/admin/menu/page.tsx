import Image from "next/image";
import { auth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { listAddonGroups, listCategories, listItems } from "@/modules/menu";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ItemFormDialog } from "./item-form-dialog";
import { RowActions } from "./row-actions";

export const metadata = {
  title: "Menu",
};

export default async function AdminMenuPage() {
  const session = await auth();
  const user = session!.user; // layout already enforced auth
  const [categories, items, addonGroups] = await Promise.all([
    listCategories(),
    listItems(),
    listAddonGroups(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} dishes across {categories.length} categories
          </p>
        </div>
        <ItemFormDialog categories={categories} addonGroups={addonGroups} />
      </header>

      <div className="rounded-2xl border border-platinum-200 bg-card p-3">
        <Input
          placeholder="Search the menu…"
          className="h-10 rounded-full border-platinum-200 bg-platinum-50"
        />
      </div>

      <div className="space-y-8">
        {categories.map((cat) => {
          const dishes = items.filter((i) => i.category === cat.slug);
          if (dishes.length === 0) return null;
          return (
            <section
              key={cat.slug}
              className="overflow-hidden rounded-3xl border border-platinum-200 bg-card"
            >
              <header className="flex items-center justify-between border-b border-platinum-200 bg-platinum-50/40 px-6 py-4">
                <div>
                  <h2 className="font-display text-xl font-medium">{cat.name}</h2>
                  <p className="text-xs text-muted-foreground">{cat.tagline}</p>
                </div>
                <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-medium tabular-nums">
                  {dishes.length}
                </span>
              </header>
              <ul className="divide-y divide-platinum-200">
                {dishes.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4",
                      !item.available && "opacity-60",
                    )}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
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
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{item.name}</p>
                        {item.tags?.includes("chef's-pick") ? (
                          <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                            Pick
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                      <p className="mt-1 text-xs font-medium tabular-nums text-foreground/80">
                        {formatNaira(item.price)}
                      </p>
                    </div>
                    <RowActions
                      item={item}
                      categories={categories}
                      addonGroups={addonGroups}
                      actor={user}
                    />
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
