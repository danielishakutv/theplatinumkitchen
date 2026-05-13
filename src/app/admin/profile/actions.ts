"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  ProfileError,
  changePassword,
  requestEmailChange,
  updateProfile,
  type ProfileErrorCode,
} from "@/modules/profiles";

interface ActionResult {
  ok: boolean;
  error?: string;
}

const FRIENDLY: Partial<Record<ProfileErrorCode, string>> = {
  PROFILE_NOT_FOUND: "Your account couldn't be found. Please sign in again.",
  INVALID_INPUT: "Those details don't look right. Check them and try again.",
  INVALID_PASSWORD: "Your current password is incorrect.",
  WEAK_PASSWORD: "Password must be at least 8 characters.",
  EMAIL_TAKEN: "That email is already in use by another account.",
  EMAIL_UNCHANGED: "That's already your current email.",
};

async function requireSession(): Promise<{ userId: string } | ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };
  return { userId: session.user.id };
}

function toError(err: unknown, fallback = "Something went wrong."): ActionResult {
  if (err instanceof ProfileError) {
    return { ok: false, error: FRIENDLY[err.code] ?? fallback };
  }
  console.error("[admin/profile] unexpected error", err);
  return { ok: false, error: fallback };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  if ("ok" in session) return session;

  const name = String(formData.get("name") ?? "").trim();
  const avatarRaw = String(formData.get("avatarUrl") ?? "").trim();

  try {
    await updateProfile(session.userId, {
      name: name || undefined,
      avatarUrl: avatarRaw === "" ? null : avatarRaw,
    });
    revalidatePath("/admin/profile");
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  if ("ok" in session) return session;

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (newPassword !== confirm) {
    return { ok: false, error: "New passwords don't match." };
  }

  try {
    await changePassword(session.userId, { currentPassword, newPassword });
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

interface EmailChangeResult extends ActionResult {
  devToken?: string;
}

export async function requestEmailChangeAction(
  formData: FormData,
): Promise<EmailChangeResult> {
  const session = await requireSession();
  if ("ok" in session) return session;

  const newEmail = String(formData.get("newEmail") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  try {
    const issued = await requestEmailChange(session.userId, { newEmail, currentPassword });
    return { ok: true, devToken: issued.devToken };
  } catch (err) {
    return toError(err);
  }
}
