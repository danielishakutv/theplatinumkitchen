import "server-only";

import { randomBytes, createHash } from "node:crypto";

const TOKEN_BYTES = 32;

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenExpiry(minutes = 60): Date {
  return new Date(Date.now() + minutes * 60_000);
}
