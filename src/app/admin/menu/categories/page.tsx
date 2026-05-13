import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { countItemsByCategory, listCategories } from "@/modules/menu";
import { Button } from "@/components/ui/button";
import { CategoryRowActions } from "./category-row-actions";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const session = await auth();
  const user = session!.user;
  const [categories, counts] = await Promise.all([
    listCategories(),
    countItemsByCategory(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/admin/menu"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to menu
          </Link>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            How dishes are grouped on the public menu and admin list.
          </p>
        </div>
        <Button asChild className="h-10 gap-1.5 rounded-full">
          <Link href="/admin/menu/categories/new">
            <Plus className="h-4 w-4" /> New category
          </Link>
        </Button>
      </header>

      {categories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-platinum-300 bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No categories yet. Tap &quot;New category&quot; to create the first one.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-3xl border border-platinum-200 bg-card">
          {categories.map((cat) => {
            const count = counts.get(cat.slug) ?? 0;
            return (
              <li
                key={cat.slug}
                className="flex flex-wrap items-center gap-3 border-b border-platinum-200 px-4 py-3.5 last:border-b-0 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{cat.name}</p>
                    <span className="rounded-full bg-platinum-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {count} dish{count === 1 ? "" : "es"}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                    <code className="rounded bg-platinum-50 px-1.5 py-0.5">
                      {cat.slug}
                    </code>
                    {cat.tagline ? <span className="ml-2">{cat.tagline}</span> : null}
                  </p>
                </div>
                <CategoryRowActions
                  slug={cat.slug}
                  name={cat.name}
                  itemCount={count}
                  actor={user}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
