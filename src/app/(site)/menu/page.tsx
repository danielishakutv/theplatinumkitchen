import { listCategories, listItems } from "@/modules/menu";
import { MenuItemCard } from "@/components/menu-item-card";
import { CategoryNav } from "@/components/category-nav";

export const metadata = {
  title: "Menu",
  description:
    "The full Platinum Kitchen menu — signature dishes, soups, grills, and more. Build your order with confidence.",
};

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
        <CategoryNav categories={categories} />
      </div>

      <div className="mt-10 space-y-16">
        {categories.map((cat) => {
          const dishes = items.filter((i) => i.category === cat.slug);
          if (dishes.length === 0) return null;
          return (
            <section
              key={cat.slug}
              id={cat.slug}
              className="scroll-mt-32"
            >
              <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-platinum-200 pb-4">
                <div>
                  <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.tagline}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {dishes.length} dishes
                </span>
              </header>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {dishes.map((dish) => (
                  <MenuItemCard key={dish.id} item={dish} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
