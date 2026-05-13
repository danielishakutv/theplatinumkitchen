import Link from "next/link";
import { FolderTree, Plus, Settings2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { listCategories, listItems } from "@/modules/menu";
import { AdminMenuBrowser } from "./admin-menu-browser";

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

      <AdminMenuBrowser categories={categories} items={items} actor={user} />
    </div>
  );
}
