import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Singleton table — only one row, id=1. The page service upserts it on
// first read so consumers never have to worry about an empty state.
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),

  // Identity
  restaurantName: text("restaurant_name").notNull().default("Platinum Kitchen"),
  tagline: text("tagline").notNull().default(""),

  // Contact
  phone: text("phone").notNull().default(""),
  // wa.me requires intl format without "+" or spaces (e.g. 2348000000000).
  whatsappPhone: text("whatsapp_phone").notNull().default(""),
  email: text("email").notNull().default(""),

  // Address
  addressStreet: text("address_street").notNull().default(""),
  addressArea: text("address_area").notNull().default(""),
  addressCity: text("address_city").notNull().default("Abuja"),
  addressState: text("address_state").notNull().default("FCT"),
  // Plain-text hours summary for now (e.g. "Mon–Sat 11:00 – 22:00").
  // A structured per-day schema can replace this later if needed.
  hoursSummary: text("hours_summary").notNull().default(""),
  hoursToday: text("hours_today").notNull().default(""),

  // Homepage hero
  heroBadge: text("hero_badge").notNull().default(""),
  heroHeadline: text("hero_headline").notNull().default(""),
  heroHeadlineAccent: text("hero_headline_accent").notNull().default(""),
  heroSubheadline: text("hero_subheadline").notNull().default(""),
  heroImageUrl: text("hero_image_url").notNull().default(""),

  // Story section
  storyHeading: text("story_heading").notNull().default(""),
  storyBody: text("story_body").notNull().default(""),
  storyImageUrl: text("story_image_url").notNull().default(""),

  // Social
  instagramUrl: text("instagram_url").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  twitterUrl: text("twitter_url").notNull().default(""),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export type SettingsRow = typeof settings.$inferSelect;
export type NewSettingsRow = typeof settings.$inferInsert;
