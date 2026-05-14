"use server";

import { AuthError as NextAuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { AuthError, registerCustomer } from "@/modules/auth";

export interface SignUpResult {
  ok: boolean;
  error?: string;
}

export async function signUpAction(formData: FormData): Promise<SignUpResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { ok: false, error: "Fill in your name, email and password." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  try {
    await registerCustomer({ name, email, password });
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.code === "EMAIL_TAKEN") {
        return {
          ok: false,
          error: "An account with that email already exists. Try signing in.",
        };
      }
      return { ok: false, error: "Couldn't create your account. Check your details." };
    }
    console.error("[sign-up] unexpected error", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/account",
    });
    // signIn throws NEXT_REDIRECT on success — unreachable.
    return { ok: true };
  } catch (err) {
    if (err instanceof NextAuthError) {
      // Account was created but auto sign-in failed — send them to sign in.
      return {
        ok: false,
        error: "Account created — please sign in to continue.",
      };
    }
    // Re-throw NEXT_REDIRECT and other framework errors.
    throw err;
  }
}
