"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export interface SignInResult {
  ok: boolean;
  error?: string;
}

export async function signInAction(formData: FormData): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password to continue." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: from || "/admin",
    });
    // signIn throws NEXT_REDIRECT on success — unreachable.
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { ok: false, error: "Email or password is incorrect." };
      }
      return { ok: false, error: "Sign-in failed. Please try again." };
    }
    // Re-throw NEXT_REDIRECT and other framework errors.
    throw error;
  }
}
