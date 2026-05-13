"use server";

import { auth } from "@/lib/auth";
import { confirmEmailChange, ProfileError, type ProfileErrorCode } from "@/modules/profiles";

export interface VerifyEmailResult {
  ok: boolean;
  newEmail?: string;
  error?: string;
}

const FRIENDLY: Partial<Record<ProfileErrorCode, string>> = {
  TOKEN_INVALID: "This verification link is invalid.",
  TOKEN_EXPIRED: "This verification link has expired. Request a new one from your profile.",
  TOKEN_USED: "This verification link has already been used.",
  EMAIL_TAKEN: "That email is now in use by another account. Pick a different one from your profile.",
};

export async function verifyEmailAction(token: string): Promise<VerifyEmailResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in first." };
  }
  if (!token) {
    return { ok: false, error: "Missing verification token." };
  }

  try {
    const { newEmail } = await confirmEmailChange({ token });
    return { ok: true, newEmail };
  } catch (err) {
    if (err instanceof ProfileError) {
      return { ok: false, error: FRIENDLY[err.code] ?? "Verification failed." };
    }
    console.error("[verify-email] unexpected error", err);
    return { ok: false, error: "Something went wrong." };
  }
}
