"use server";

import {
  AuthError,
  AUTH_ERROR_STATUS,
  resetPassword,
  type AuthErrorCode,
} from "@/modules/auth";

export interface ResetPasswordResult {
  ok: boolean;
  error?: string;
}

const FRIENDLY: Partial<Record<AuthErrorCode, string>> = {
  TOKEN_INVALID: "This reset link is invalid. Request a new one.",
  TOKEN_EXPIRED: "This reset link has expired. Request a new one.",
  TOKEN_USED: "This reset link has already been used.",
  WEAK_PASSWORD: "Password must be at least 8 characters.",
  INVALID_INPUT: "That doesn't look right. Check your password and try again.",
};

export async function resetPasswordAction(
  formData: FormData,
): Promise<ResetPasswordResult> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { ok: false, error: "Reset link is missing its token." };
  if (password !== confirm) {
    return { ok: false, error: "Passwords don't match." };
  }

  try {
    await resetPassword({ token, password });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        ok: false,
        error: FRIENDLY[err.code] ?? "Reset failed. Try again.",
      };
    }
    console.error("[reset-password] unexpected error", err);
    void AUTH_ERROR_STATUS; // referenced for type completeness
    return { ok: false, error: "Something went wrong. Try again." };
  }
}
