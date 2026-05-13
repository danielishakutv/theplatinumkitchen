// Upsert helpers used by the seed script. Kept in a separate file (no
// "server-only" import) so the seed can be run from tsx outside of Next's
// build context. The service.ts re-exports these as `_internal` for any
// non-seed callers that already live in server land.

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  menuAddonGroups,
  menuAddonOptions,
  menuCategories,
  menuItemAddons,
  menuItems,
} from "./schema";

export async function upsertCategory(input: {
  slug: string;
  name: string;
  tagline: string;
  sortOrder: number;
}): Promise<void> {
  await db
    .insert(menuCategories)
    .values(input)
    .onConflictDoUpdate({
      target: menuCategories.slug,
      set: { name: input.name, tagline: input.tagline, sortOrder: input.sortOrder },
    });
}

export async function upsertAddonGroup(input: {
  id: string;
  label: string;
  kind: "single" | "multiple";
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
}): Promise<void> {
  await db
    .insert(menuAddonGroups)
    .values({
      id: input.id,
      label: input.label,
      kind: input.kind,
      required: input.required,
      minSelections: input.minSelections,
      maxSelections: input.maxSelections,
    })
    .onConflictDoUpdate({
      target: menuAddonGroups.id,
      set: {
        label: input.label,
        kind: input.kind,
        required: input.required,
        minSelections: input.minSelections,
        maxSelections: input.maxSelections,
      },
    });
}

export async function upsertAddonOption(input: {
  id: string;
  groupId: string;
  name: string;
  priceDelta: number;
  sortOrder: number;
}): Promise<void> {
  await db
    .insert(menuAddonOptions)
    .values(input)
    .onConflictDoUpdate({
      target: menuAddonOptions.id,
      set: {
        name: input.name,
        priceDelta: input.priceDelta,
        sortOrder: input.sortOrder,
      },
    });
}

export async function upsertItem(input: {
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categorySlug: string;
  tags: string[];
  prepMinutes: number;
  available: boolean;
  sortOrder: number;
  addonGroupIds: string[];
}): Promise<void> {
  const [row] = await db
    .insert(menuItems)
    .values({
      slug: input.slug,
      name: input.name,
      description: input.description,
      price: input.price,
      imageUrl: input.imageUrl,
      categorySlug: input.categorySlug,
      tags: input.tags,
      prepMinutes: input.prepMinutes,
      available: input.available,
      sortOrder: input.sortOrder,
    })
    .onConflictDoUpdate({
      target: menuItems.slug,
      set: {
        name: input.name,
        description: input.description,
        price: input.price,
        imageUrl: input.imageUrl,
        categorySlug: input.categorySlug,
        tags: input.tags,
        prepMinutes: input.prepMinutes,
        available: input.available,
        sortOrder: input.sortOrder,
      },
    })
    .returning({ id: menuItems.id });
  await db.delete(menuItemAddons).where(eq(menuItemAddons.itemId, row.id));
  if (input.addonGroupIds.length > 0) {
    await db.insert(menuItemAddons).values(
      input.addonGroupIds.map((groupId, idx) => ({
        itemId: row.id,
        groupId,
        sortOrder: idx,
      })),
    );
  }
}

export async function countItems(): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(menuItems);
  return row?.n ?? 0;
}
