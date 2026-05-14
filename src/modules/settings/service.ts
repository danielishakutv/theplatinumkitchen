import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requirePermission, type ActorLike } from "@/modules/users/permissions";
import { settings, type SettingsRow } from "./schema";
import { updateSettingsSchema, type UpdateSettingsInput } from "./validation";
import { SettingsError, type Settings } from "./types";

const DEFAULTS: Omit<Settings, "updatedAt"> = {
  restaurantName: "Platinum Kitchen",
  tagline: "A quiet revolution of Nigerian flavour",
  phone: "",
  whatsappPhone: "",
  email: "",
  addressStreet: "",
  addressArea: "",
  addressCity: "Abuja",
  addressState: "FCT",
  hoursSummary: "",
  hoursToday: "",
  heroBadge: "Now serving across Abuja",
  heroHeadline: "A quiet revolution",
  heroHeadlineAccent: "of Nigerian flavour.",
  heroSubheadline:
    "Heritage recipes prepared with patience, plated with care, and delivered to your door — six days a week.",
  heroImageUrl: "",
  storyHeading: "We took our time, and you'll taste it.",
  storyBody:
    "Platinum Kitchen began as a Sunday tradition in a small Abuja flat — a single pot of jollof, a few aunties, and the kind of arguments only the right pepper can settle.\n\nToday we serve across the city, but the rules haven't changed: the stock is made from scratch, the chicken is grilled over real charcoal, and nothing leaves the kitchen if it doesn't taste like home.",
  storyImageUrl: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankTransferNote:
    "Use your order number as the transfer reference, then send proof to our WhatsApp.",
  instagramUrl: "",
  facebookUrl: "",
  twitterUrl: "",
};

function rowToSettings(row: SettingsRow): Settings {
  return {
    restaurantName: row.restaurantName,
    tagline: row.tagline,
    phone: row.phone,
    whatsappPhone: row.whatsappPhone,
    email: row.email,
    addressStreet: row.addressStreet,
    addressArea: row.addressArea,
    addressCity: row.addressCity,
    addressState: row.addressState,
    hoursSummary: row.hoursSummary,
    hoursToday: row.hoursToday,
    heroBadge: row.heroBadge,
    heroHeadline: row.heroHeadline,
    heroHeadlineAccent: row.heroHeadlineAccent,
    heroSubheadline: row.heroSubheadline,
    heroImageUrl: row.heroImageUrl,
    storyHeading: row.storyHeading,
    storyBody: row.storyBody,
    storyImageUrl: row.storyImageUrl,
    bankName: row.bankName,
    bankAccountName: row.bankAccountName,
    bankAccountNumber: row.bankAccountNumber,
    bankTransferNote: row.bankTransferNote,
    instagramUrl: row.instagramUrl,
    facebookUrl: row.facebookUrl,
    twitterUrl: row.twitterUrl,
    updatedAt: row.updatedAt.toISOString(),
  };
}

// Returns the singleton row, inserting defaults on first read so the rest
// of the app never has to deal with a null state.
export async function getSettings(): Promise<Settings> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 1))
    .limit(1);
  if (row) return rowToSettings(row);

  const [inserted] = await db
    .insert(settings)
    .values({ id: 1, ...DEFAULTS })
    .onConflictDoNothing()
    .returning();

  if (inserted) return rowToSettings(inserted);

  // Race: another request inserted concurrently. Re-read.
  const [refreshed] = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 1))
    .limit(1);
  if (!refreshed) {
    throw new SettingsError(
      "SETTINGS_INVALID_INPUT",
      "Could not load settings.",
    );
  }
  return rowToSettings(refreshed);
}

export async function updateSettings(
  actor: ActorLike,
  input: UpdateSettingsInput,
): Promise<Settings> {
  requirePermission(actor, "settings:write");
  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) {
    throw new SettingsError("SETTINGS_INVALID_INPUT", parsed.error.message);
  }
  const data = parsed.data;

  await db
    .insert(settings)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({
      target: settings.id,
      set: data,
    });

  return getSettings();
}
