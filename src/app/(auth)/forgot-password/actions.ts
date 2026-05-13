"use server";

import { AuthError, requestPasswordReset } from "@/modules/auth";

export interface ForgotPasswordResult {
  ok: boolean;
  error?: string;
}

export async function forgotPasswordAction(
  formData: FormData,
): Promise<ForgotPasswordResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Enter your email to continue." };

  try {
    await requestPasswordReset({ email });
    // Service always returns the same shape regardless of whether the email
    // is registered, so we don't leak account existence here either.
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "We couldn't process that. Try again." };
    }
    console.error("[forgot-password] unexpected error", err);
    return { ok: false, error: "Something went wrong. Try again." };
  }
}
