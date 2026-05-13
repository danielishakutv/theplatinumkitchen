import "dotenv/config";
import { categories, items } from "./data";
import {
  countItems,
  upsertAddonGroup,
  upsertAddonOption,
  upsertCategory,
  upsertItem,
} from "./upserts";
import type { AddonGroup } from "./types";

async function main() {
  console.log("Seeding menu…");

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await upsertCategory({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      sortOrder: i,
    });
    console.log(`  category: ${c.slug}`);
  }

  // Walk items to discover all addon groups + options referenced. Dedup by id.
  const groupsById = new Map<string, AddonGroup>();
  for (const item of items) {
    for (const g of item.addonGroups ?? []) {
      if (!groupsById.has(g.id)) groupsById.set(g.id, g);
    }
  }

  for (const g of groupsById.values()) {
    await upsertAddonGroup({
      id: g.id,
      label: g.label,
      kind: g.kind,
      required: g.required,
      minSelections: g.min,
      maxSelections: g.max,
    });
    for (let i = 0; i < g.options.length; i++) {
      const o = g.options[i];
      await upsertAddonOption({
        id: o.id,
        groupId: g.id,
        name: o.name,
        priceDelta: o.priceDelta,
        sortOrder: i,
      });
    }
    console.log(`  addon group: ${g.id} (${g.options.length} options)`);
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await upsertItem({
      slug: item.slug,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      categorySlug: item.category,
      tags: item.tags ?? [],
      prepMinutes: item.prepMinutes,
      available: item.available,
      sortOrder: i,
      addonGroupIds: (item.addonGroups ?? []).map((g) => g.id),
    });
    console.log(`  item: ${item.slug}`);
  }

  const total = await countItems();
  console.log(`\nDone. ${total} items in the menu.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
