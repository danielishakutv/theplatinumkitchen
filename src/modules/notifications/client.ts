import "server-only";

import { Resend } from "resend";

let cached: Resend | null | undefined;

// Returns null when Resend is not configured — callers should fall back to
// console logging so dev (no API key) keeps working without crashing.
export function getResendClient(): Resend | null {
  if (cached !== undefined) return cached;
  const key = process.env.RESEND_API_KEY;
  cached = key ? new Resend(key) : null;
  return cached;
}

export function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ?? "Platinum Kitchen <noreply@theplatinumkitchen.com>"
  );
}

export function isConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
