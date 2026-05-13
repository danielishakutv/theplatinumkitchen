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
