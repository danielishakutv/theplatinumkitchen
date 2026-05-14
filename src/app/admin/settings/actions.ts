"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  SettingsError,
  updateSettings,
  type UpdateSettingsInput,
} from "@/modules/settings";
import { PermissionError } from "@/modules/users";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireUser() {
  const session = await auth();
  return session?.user ?? null;
}

function toError(err: unknown): ActionResult {
  if (err instanceof SettingsError) {
    return { ok: false, error: err.message || "Update failed." };
  }
  if (err instanceof PermissionError) {
    return { ok: false, error: "You don't have permission for that." };
  }
  console.error("[admin/settings] unexpected", err);
  return { ok: false, error: "Something went wrong." };
}

function field(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function saveSettingsAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const input: UpdateSettingsInput = {
    restaurantName: field(formData.get("restaurantName")),
    tagline: field(formData.get("tagline")),
    phone: field(formData.get("phone")),
    whatsappPhone: field(formData.get("whatsappPhone")),
    email: field(formData.get("email")),
    orderNotifyEmails: field(formData.get("orderNotifyEmails")),
    addressStreet: field(formData.get("addressStreet")),
    addressArea: field(formData.get("addressArea")),
    addressCity: field(formData.get("addressCity")),
    addressState: field(formData.get("addressState")),
    hoursSummary: field(formData.get("hoursSummary")),
    hoursToday: field(formData.get("hoursToday")),
    heroBadge: field(formData.get("heroBadge")),
    heroHeadline: field(formData.get("heroHeadline")),
    heroHeadlineAccent: field(formData.get("heroHeadlineAccent")),
    heroSubheadline: field(formData.get("heroSubheadline")),
    heroImageUrl: field(formData.get("heroImageUrl")),
    storyHeading: field(formData.get("storyHeading")),
    storyBody: field(formData.get("storyBody")),
    storyImageUrl: field(formData.get("storyImageUrl")),
    bankName: field(formData.get("bankName")),
    bankAccountName: field(formData.get("bankAccountName")),
    bankAccountNumber: field(formData.get("bankAccountNumber")),
    bankTransferNote: field(formData.get("bankTransferNote")),
    instagramUrl: field(formData.get("instagramUrl")),
    facebookUrl: field(formData.get("facebookUrl")),
    twitterUrl: field(formData.get("twitterUrl")),
  };

  try {
    await updateSettings(user, input);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/menu");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
