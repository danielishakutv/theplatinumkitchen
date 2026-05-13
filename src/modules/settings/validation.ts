import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const optionalUrl = z
  .union([z.string().url().max(500), z.literal("")])
  .default("");

// All fields optional on update — caller patches what changed.
export const updateSettingsSchema = z.object({
  restaurantName: text(120).optional(),
  tagline: text(200).optional(),

  phone: text(40).optional(),
  whatsappPhone: text(40).optional(),
  email: z
    .union([z.string().trim().toLowerCase().email().max(254), z.literal("")])
    .optional(),

  addressStreet: text(200).optional(),
  addressArea: text(120).optional(),
  addressCity: text(120).optional(),
  addressState: text(120).optional(),
  hoursSummary: text(200).optional(),
  hoursToday: text(120).optional(),

  heroBadge: text(120).optional(),
  heroHeadline: text(200).optional(),
  heroHeadlineAccent: text(200).optional(),
  heroSubheadline: text(500).optional(),
  heroImageUrl: optionalUrl.optional(),

  storyHeading: text(200).optional(),
  storyBody: text(2000).optional(),
  storyImageUrl: optionalUrl.optional(),

  instagramUrl: optionalUrl.optional(),
  facebookUrl: optionalUrl.optional(),
  twitterUrl: optionalUrl.optional(),
});
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
