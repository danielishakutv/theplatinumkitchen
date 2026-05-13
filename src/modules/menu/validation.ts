import { z } from "zod";

const slugField = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and dashes");

export const tagField = z.enum([
  "spicy",
  "chef's-pick",
  "new",
  "vegan",
  "vegetarian",
  "gluten-free",
]);

export const createItemSchema = z.object({
  slug: slugField,
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  price: z.number().int().nonnegative().max(10_000_000),
  imageUrl: z
    .union([z.string().url().max(500), z.literal("")])
    .default(""),
  categorySlug: z.string().trim().min(1).max(100),
  tags: z.array(tagField).max(10).default([]),
  prepMinutes: z.number().int().min(1).max(600).default(20),
  available: z.boolean().default(true),
  notesEnabled: z.boolean().default(true),
  notesPlaceholder: z.string().trim().max(200).default(""),
  sortOrder: z.number().int().default(0),
  addonGroupIds: z.array(z.string().min(1).max(100)).max(10).default([]),
});
export type CreateItemInput = z.infer<typeof createItemSchema>;

// Override addonGroupIds explicitly so it stays `undefined` when callers
// don't provide it. (The create schema applies `.default([])`, which would
// otherwise turn an absent field into an empty array on update and silently
// clear every attached addon group.)
export const updateItemSchema = createItemSchema.partial().extend({
  slug: slugField.optional(),
  addonGroupIds: z.array(z.string().min(1).max(100)).max(10).optional(),
});
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// Addon groups + options ------------------------------------------------------
const idSlugField = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ID must be lowercase letters, numbers, and dashes");

export const createAddonGroupSchema = z
  .object({
    id: idSlugField,
    label: z.string().trim().min(1).max(120),
    kind: z.enum(["single", "multiple"]),
    required: z.boolean().default(false),
    minSelections: z.number().int().min(0).max(100).optional(),
    maxSelections: z.number().int().min(1).max(100).optional(),
  })
  .refine(
    (v) =>
      v.minSelections === undefined ||
      v.maxSelections === undefined ||
      v.minSelections <= v.maxSelections,
    { message: "Min selections can't exceed max selections" },
  );
export type CreateAddonGroupInput = z.infer<typeof createAddonGroupSchema>;

export const updateAddonGroupSchema = z
  .object({
    label: z.string().trim().min(1).max(120).optional(),
    kind: z.enum(["single", "multiple"]).optional(),
    required: z.boolean().optional(),
    minSelections: z.number().int().min(0).max(100).nullable().optional(),
    maxSelections: z.number().int().min(1).max(100).nullable().optional(),
  })
  .refine(
    (v) => {
      const min = v.minSelections;
      const max = v.maxSelections;
      if (min === undefined || max === undefined) return true;
      if (min === null || max === null) return true;
      return min <= max;
    },
    { message: "Min selections can't exceed max selections" },
  );
export type UpdateAddonGroupInput = z.infer<typeof updateAddonGroupSchema>;

export const createAddonOptionSchema = z.object({
  id: idSlugField,
  groupId: idSlugField,
  name: z.string().trim().min(1).max(120),
  priceDelta: z.number().int().min(-10_000_000).max(10_000_000).default(0),
});
export type CreateAddonOptionInput = z.infer<typeof createAddonOptionSchema>;

export const updateAddonOptionSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  priceDelta: z.number().int().min(-10_000_000).max(10_000_000).optional(),
  sortOrder: z.number().int().optional(),
});
export type UpdateAddonOptionInput = z.infer<typeof updateAddonOptionSchema>;

// Categories ----------------------------------------------------------------
export const createCategorySchema = z.object({
  slug: slugField,
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).default(""),
  sortOrder: z.number().int().min(0).max(10_000).default(0),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  tagline: z.string().trim().max(200).optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
