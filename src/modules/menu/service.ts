import "server-only";

import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  menuAddonGroups,
  menuAddonOptions,
  menuCategories,
  menuItemAddons,
  menuItems,
  type MenuItemRow,
} from "./schema";
import {
  createAddonGroupSchema,
  createAddonOptionSchema,
  createCategorySchema,
  createItemSchema,
  updateAddonGroupSchema,
  updateAddonOptionSchema,
  updateCategorySchema,
  updateItemSchema,
  type CreateAddonGroupInput,
  type CreateAddonOptionInput,
  type CreateCategoryInput,
  type CreateItemInput,
  type UpdateAddonGroupInput,
  type UpdateAddonOptionInput,
  type UpdateCategoryInput,
  type UpdateItemInput,
} from "./validation";
import {
  MenuServiceError,
  type AddonGroup,
  type MenuCategory,
  type MenuItem,
  type MenuItemTag,
} from "./types";
import { requirePermission, type ActorLike } from "@/modules/users/permissions";

function rowToItem(row: MenuItemRow, addonGroups: AddonGroup[]): MenuItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.imageUrl,
    category: row.categorySlug,
    tags: (row.tags as MenuItemTag[]) ?? [],
    prepMinutes: row.prepMinutes,
    available: row.available,
    notesEnabled: row.notesEnabled,
    notesPlaceholder: row.notesPlaceholder,
    addonGroups,
  };
}

async function loadAddonsForItems(
  itemIds: string[],
): Promise<Map<string, AddonGroup[]>> {
  const result = new Map<string, AddonGroup[]>();
  if (itemIds.length === 0) return result;

  // Junction rows: which groups apply to which items, in order.
  const junctions = await db
    .select()
    .from(menuItemAddons)
    .where(inArray(menuItemAddons.itemId, itemIds))
    .orderBy(asc(menuItemAddons.sortOrder));

  if (junctions.length === 0) {
    for (const id of itemIds) result.set(id, []);
    return result;
  }

  const groupIds = Array.from(new Set(junctions.map((j) => j.groupId)));
  const [groups, options] = await Promise.all([
    db.select().from(menuAddonGroups).where(inArray(menuAddonGroups.id, groupIds)),
    db
      .select()
      .from(menuAddonOptions)
      .where(inArray(menuAddonOptions.groupId, groupIds))
      .orderBy(asc(menuAddonOptions.sortOrder)),
  ]);

  const optionsByGroup = new Map<string, AddonGroup["options"]>();
  for (const o of options) {
    if (!optionsByGroup.has(o.groupId)) optionsByGroup.set(o.groupId, []);
    optionsByGroup.get(o.groupId)!.push({ id: o.id, name: o.name, priceDelta: o.priceDelta });
  }

  const groupsById = new Map<string, AddonGroup>();
  for (const g of groups) {
    groupsById.set(g.id, {
      id: g.id,
      label: g.label,
      kind: g.kind,
      required: g.required,
      min: g.minSelections ?? undefined,
      max: g.maxSelections ?? undefined,
      options: optionsByGroup.get(g.id) ?? [],
    });
  }

  for (const id of itemIds) result.set(id, []);
  for (const j of junctions) {
    const group = groupsById.get(j.groupId);
    if (group) result.get(j.itemId)!.push(group);
  }
  return result;
}

export async function listCategories(): Promise<MenuCategory[]> {
  const rows = await db
    .select()
    .from(menuCategories)
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name));
  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    sortOrder: r.sortOrder,
  }));
}

export async function listItems(): Promise<MenuItem[]> {
  const rows = await db
    .select()
    .from(menuItems)
    .orderBy(asc(menuItems.categorySlug), asc(menuItems.sortOrder), asc(menuItems.name));
  const addons = await loadAddonsForItems(rows.map((r) => r.id));
  return rows.map((r) => rowToItem(r, addons.get(r.id) ?? []));
}

export async function listAddonGroups(): Promise<AddonGroup[]> {
  const groups = await db.select().from(menuAddonGroups).orderBy(asc(menuAddonGroups.id));
  if (groups.length === 0) return [];
  const options = await db
    .select()
    .from(menuAddonOptions)
    .orderBy(asc(menuAddonOptions.sortOrder));
  const optionsByGroup = new Map<string, AddonGroup["options"]>();
  for (const o of options) {
    if (!optionsByGroup.has(o.groupId)) optionsByGroup.set(o.groupId, []);
    optionsByGroup
      .get(o.groupId)!
      .push({ id: o.id, name: o.name, priceDelta: o.priceDelta });
  }
  return groups.map((g) => ({
    id: g.id,
    label: g.label,
    kind: g.kind,
    required: g.required,
    min: g.minSelections ?? undefined,
    max: g.maxSelections ?? undefined,
    options: optionsByGroup.get(g.id) ?? [],
  }));
}

export async function findItemBySlug(slug: string): Promise<MenuItem | null> {
  const [row] = await db.select().from(menuItems).where(eq(menuItems.slug, slug)).limit(1);
  if (!row) return null;
  const addons = await loadAddonsForItems([row.id]);
  return rowToItem(row, addons.get(row.id) ?? []);
}

export async function findItemById(id: string): Promise<MenuItem | null> {
  const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!row) return null;
  const addons = await loadAddonsForItems([row.id]);
  return rowToItem(row, addons.get(row.id) ?? []);
}

async function attachAddons(itemId: string, addonGroupIds: string[]): Promise<void> {
  await db.delete(menuItemAddons).where(eq(menuItemAddons.itemId, itemId));
  if (addonGroupIds.length === 0) return;
  await db.insert(menuItemAddons).values(
    addonGroupIds.map((groupId, idx) => ({
      itemId,
      groupId,
      sortOrder: idx,
    })),
  );
}

export async function createItem(
  actor: ActorLike,
  input: CreateItemInput,
): Promise<MenuItem> {
  requirePermission(actor, "menu:write");
  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const [category] = await db
    .select({ slug: menuCategories.slug })
    .from(menuCategories)
    .where(eq(menuCategories.slug, data.categorySlug))
    .limit(1);
  if (!category) throw new MenuServiceError("MENU_CATEGORY_NOT_FOUND");

  const existing = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.slug, data.slug))
    .limit(1);
  if (existing.length > 0) throw new MenuServiceError("MENU_SLUG_TAKEN");

  const [row] = await db
    .insert(menuItems)
    .values({
      slug: data.slug,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      categorySlug: data.categorySlug,
      tags: data.tags,
      prepMinutes: data.prepMinutes,
      available: data.available,
      notesEnabled: data.notesEnabled,
      notesPlaceholder: data.notesPlaceholder,
      sortOrder: data.sortOrder,
    })
    .returning();

  await attachAddons(row.id, data.addonGroupIds);
  const addons = await loadAddonsForItems([row.id]);
  return rowToItem(row, addons.get(row.id) ?? []);
}

export async function updateItem(
  actor: ActorLike,
  id: string,
  input: UpdateItemInput,
): Promise<MenuItem> {
  requirePermission(actor, "menu:write");
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const [existing] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!existing) throw new MenuServiceError("MENU_NOT_FOUND");

  if (data.slug && data.slug !== existing.slug) {
    const conflict = await db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(eq(menuItems.slug, data.slug))
      .limit(1);
    if (conflict.length > 0) throw new MenuServiceError("MENU_SLUG_TAKEN");
  }

  if (data.categorySlug && data.categorySlug !== existing.categorySlug) {
    const [category] = await db
      .select({ slug: menuCategories.slug })
      .from(menuCategories)
      .where(eq(menuCategories.slug, data.categorySlug))
      .limit(1);
    if (!category) throw new MenuServiceError("MENU_CATEGORY_NOT_FOUND");
  }

  const patch: Partial<typeof menuItems.$inferInsert> = {};
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.name !== undefined) patch.name = data.name;
  if (data.description !== undefined) patch.description = data.description;
  if (data.price !== undefined) patch.price = data.price;
  if (data.imageUrl !== undefined) patch.imageUrl = data.imageUrl;
  if (data.categorySlug !== undefined) patch.categorySlug = data.categorySlug;
  if (data.tags !== undefined) patch.tags = data.tags;
  if (data.prepMinutes !== undefined) patch.prepMinutes = data.prepMinutes;
  if (data.available !== undefined) patch.available = data.available;
  if (data.notesEnabled !== undefined) patch.notesEnabled = data.notesEnabled;
  if (data.notesPlaceholder !== undefined) patch.notesPlaceholder = data.notesPlaceholder;
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder;

  if (Object.keys(patch).length > 0) {
    await db.update(menuItems).set(patch).where(eq(menuItems.id, id));
  }
  if (data.addonGroupIds !== undefined) {
    await attachAddons(id, data.addonGroupIds);
  }

  const [updated] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  const addons = await loadAddonsForItems([id]);
  return rowToItem(updated, addons.get(id) ?? []);
}

export async function deleteItem(actor: ActorLike, id: string): Promise<void> {
  requirePermission(actor, "menu:delete");
  const [existing] = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(eq(menuItems.id, id))
    .limit(1);
  if (!existing) throw new MenuServiceError("MENU_NOT_FOUND");
  await db.delete(menuItems).where(eq(menuItems.id, id));
}

export async function toggleItemAvailable(
  actor: ActorLike,
  id: string,
): Promise<MenuItem> {
  requirePermission(actor, "menu:write");
  const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!row) throw new MenuServiceError("MENU_NOT_FOUND");
  await db
    .update(menuItems)
    .set({ available: !row.available })
    .where(eq(menuItems.id, id));
  const result = await findItemById(id);
  return result!;
}

// Category CRUD --------------------------------------------------------------

export async function createCategory(
  actor: ActorLike,
  input: CreateCategoryInput,
): Promise<MenuCategory> {
  requirePermission(actor, "menu:write");
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const existing = await db
    .select({ slug: menuCategories.slug })
    .from(menuCategories)
    .where(eq(menuCategories.slug, data.slug))
    .limit(1);
  if (existing.length > 0) throw new MenuServiceError("MENU_CATEGORY_SLUG_TAKEN");

  await db.insert(menuCategories).values({
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    sortOrder: data.sortOrder,
  });

  return {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    sortOrder: data.sortOrder,
  };
}

export async function updateCategory(
  actor: ActorLike,
  slug: string,
  input: UpdateCategoryInput,
): Promise<void> {
  requirePermission(actor, "menu:write");
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const [existing] = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.slug, slug))
    .limit(1);
  if (!existing) throw new MenuServiceError("MENU_CATEGORY_NOT_FOUND");

  const patch: Partial<typeof menuCategories.$inferInsert> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.tagline !== undefined) patch.tagline = data.tagline;
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder;

  if (Object.keys(patch).length > 0) {
    await db.update(menuCategories).set(patch).where(eq(menuCategories.slug, slug));
  }
}

export async function deleteCategory(actor: ActorLike, slug: string): Promise<void> {
  requirePermission(actor, "menu:delete");
  const [existing] = await db
    .select({ slug: menuCategories.slug })
    .from(menuCategories)
    .where(eq(menuCategories.slug, slug))
    .limit(1);
  if (!existing) throw new MenuServiceError("MENU_CATEGORY_NOT_FOUND");

  // Block delete if any items still reference this category — fail fast with
  // a clear error rather than letting the FK throw at the DB level.
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(menuItems)
    .where(eq(menuItems.categorySlug, slug));
  if ((n ?? 0) > 0) {
    throw new MenuServiceError(
      "MENU_CATEGORY_HAS_ITEMS",
      `Move ${n} dish${n === 1 ? "" : "es"} to another category first.`,
    );
  }

  await db.delete(menuCategories).where(eq(menuCategories.slug, slug));
}

export async function findCategoryBySlug(slug: string): Promise<MenuCategory | null> {
  const [row] = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.slug, slug))
    .limit(1);
  if (!row) return null;
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    sortOrder: row.sortOrder,
  };
}

export async function countItemsByCategory(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      slug: menuItems.categorySlug,
      n: sql<number>`count(*)::int`,
    })
    .from(menuItems)
    .groupBy(menuItems.categorySlug);
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.slug, r.n);
  return map;
}

// Addon group + option CRUD --------------------------------------------------

export async function createAddonGroup(
  actor: ActorLike,
  input: CreateAddonGroupInput,
): Promise<AddonGroup> {
  requirePermission(actor, "menu:write");
  const parsed = createAddonGroupSchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const existing = await db
    .select({ id: menuAddonGroups.id })
    .from(menuAddonGroups)
    .where(eq(menuAddonGroups.id, data.id))
    .limit(1);
  if (existing.length > 0) throw new MenuServiceError("MENU_ADDON_GROUP_ID_TAKEN");

  await db.insert(menuAddonGroups).values({
    id: data.id,
    label: data.label,
    kind: data.kind,
    required: data.required,
    minSelections: data.minSelections,
    maxSelections: data.maxSelections,
  });

  return {
    id: data.id,
    label: data.label,
    kind: data.kind,
    required: data.required,
    min: data.minSelections,
    max: data.maxSelections,
    options: [],
  };
}

export async function updateAddonGroup(
  actor: ActorLike,
  id: string,
  input: UpdateAddonGroupInput,
): Promise<void> {
  requirePermission(actor, "menu:write");
  const parsed = updateAddonGroupSchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const [existing] = await db
    .select()
    .from(menuAddonGroups)
    .where(eq(menuAddonGroups.id, id))
    .limit(1);
  if (!existing) throw new MenuServiceError("MENU_ADDON_GROUP_NOT_FOUND");

  const patch: Partial<typeof menuAddonGroups.$inferInsert> = {};
  if (data.label !== undefined) patch.label = data.label;
  if (data.kind !== undefined) patch.kind = data.kind;
  if (data.required !== undefined) patch.required = data.required;
  if (data.minSelections !== undefined) patch.minSelections = data.minSelections;
  if (data.maxSelections !== undefined) patch.maxSelections = data.maxSelections;

  if (Object.keys(patch).length > 0) {
    await db.update(menuAddonGroups).set(patch).where(eq(menuAddonGroups.id, id));
  }
}

export async function deleteAddonGroup(actor: ActorLike, id: string): Promise<void> {
  requirePermission(actor, "menu:delete");
  const [existing] = await db
    .select({ id: menuAddonGroups.id })
    .from(menuAddonGroups)
    .where(eq(menuAddonGroups.id, id))
    .limit(1);
  if (!existing) throw new MenuServiceError("MENU_ADDON_GROUP_NOT_FOUND");
  // Postgres cascades the delete to options + item junctions via FK ON DELETE
  // CASCADE, so removing the group cleanly detaches it from every item.
  await db.delete(menuAddonGroups).where(eq(menuAddonGroups.id, id));
}

export async function createAddonOption(
  actor: ActorLike,
  input: CreateAddonOptionInput,
): Promise<void> {
  requirePermission(actor, "menu:write");
  const parsed = createAddonOptionSchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const [group] = await db
    .select({ id: menuAddonGroups.id })
    .from(menuAddonGroups)
    .where(eq(menuAddonGroups.id, data.groupId))
    .limit(1);
  if (!group) throw new MenuServiceError("MENU_ADDON_GROUP_NOT_FOUND");

  const existing = await db
    .select({ id: menuAddonOptions.id })
    .from(menuAddonOptions)
    .where(eq(menuAddonOptions.id, data.id))
    .limit(1);
  if (existing.length > 0) throw new MenuServiceError("MENU_ADDON_OPTION_ID_TAKEN");

  // Place the new option at the end of the group's option list.
  const siblings = await db
    .select({ id: menuAddonOptions.id })
    .from(menuAddonOptions)
    .where(eq(menuAddonOptions.groupId, data.groupId));
  const sortOrder = siblings.length;

  await db.insert(menuAddonOptions).values({
    id: data.id,
    groupId: data.groupId,
    name: data.name,
    priceDelta: data.priceDelta,
    sortOrder,
  });
}

export async function updateAddonOption(
  actor: ActorLike,
  id: string,
  input: UpdateAddonOptionInput,
): Promise<void> {
  requirePermission(actor, "menu:write");
  const parsed = updateAddonOptionSchema.safeParse(input);
  if (!parsed.success) throw new MenuServiceError("MENU_INVALID_INPUT", parsed.error.message);
  const data = parsed.data;

  const [existing] = await db
    .select()
    .from(menuAddonOptions)
    .where(eq(menuAddonOptions.id, id))
    .limit(1);
  if (!existing) throw new MenuServiceError("MENU_ADDON_OPTION_NOT_FOUND");

  const patch: Partial<typeof menuAddonOptions.$inferInsert> = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.priceDelta !== undefined) patch.priceDelta = data.priceDelta;
  if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder;

  if (Object.keys(patch).length > 0) {
    await db.update(menuAddonOptions).set(patch).where(eq(menuAddonOptions.id, id));
  }
}

export async function deleteAddonOption(actor: ActorLike, id: string): Promise<void> {
  requirePermission(actor, "menu:delete");
  const [existing] = await db
    .select({ id: menuAddonOptions.id })
    .from(menuAddonOptions)
    .where(eq(menuAddonOptions.id, id))
    .limit(1);
  if (!existing) throw new MenuServiceError("MENU_ADDON_OPTION_NOT_FOUND");
  await db.delete(menuAddonOptions).where(eq(menuAddonOptions.id, id));
}

// Seed-time upsert helpers live in ./upserts (no "server-only" import) so the
// seed script can run under tsx outside the Next bundle. Re-exported here in
// case anyone in server-land wants them.
export {
  upsertCategory,
  upsertAddonGroup,
  upsertAddonOption,
  upsertItem,
  countItems,
} from "./upserts";
