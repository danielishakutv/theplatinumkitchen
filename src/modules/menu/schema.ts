import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const addonGroupKindEnum = pgEnum("addon_group_kind", ["single", "multiple"]);

export const menuCategories = pgTable("menu_categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  categorySlug: text("category_slug")
    .notNull()
    .references(() => menuCategories.slug, { onDelete: "restrict" }),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  prepMinutes: integer("prep_minutes").notNull().default(20),
  available: boolean("available").notNull().default(true),
  // Whether the customer sees a "Notes for the kitchen" textarea on this
  // dish's detail dialog. Off for items where notes don't apply (e.g. drinks).
  notesEnabled: boolean("notes_enabled").notNull().default(true),
  // Optional placeholder shown inside the notes textarea. Empty falls back to
  // a generic line.
  notesPlaceholder: text("notes_placeholder").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

// Addon groups are reusable across multiple items (e.g. one "protein" group
// shared by jollof + fried rice + ofada). Stored with stable string IDs so
// the seed and admin UI can refer to them by name.
export const menuAddonGroups = pgTable("menu_addon_groups", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  kind: addonGroupKindEnum("kind").notNull(),
  required: boolean("required").notNull().default(false),
  minSelections: integer("min_selections"),
  maxSelections: integer("max_selections"),
});

export const menuAddonOptions = pgTable("menu_addon_options", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => menuAddonGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priceDelta: integer("price_delta").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Junction table: which addon groups apply to which items, with ordering.
export const menuItemAddons = pgTable(
  "menu_item_addons",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => menuItems.id, { onDelete: "cascade" }),
    groupId: text("group_id")
      .notNull()
      .references(() => menuAddonGroups.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.itemId, t.groupId] })],
);

export type MenuCategoryRow = typeof menuCategories.$inferSelect;
export type NewMenuCategoryRow = typeof menuCategories.$inferInsert;
export type MenuItemRow = typeof menuItems.$inferSelect;
export type NewMenuItemRow = typeof menuItems.$inferInsert;
export type MenuAddonGroupRow = typeof menuAddonGroups.$inferSelect;
export type MenuAddonOptionRow = typeof menuAddonOptions.$inferSelect;
