import "server-only";

import { and, eq, isNull, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, type UserRow } from "@/modules/users/schema";
import type { UserRole } from "@/modules/users";
import { passwordResetTokens } from "./schema";
import { generateToken, hashToken, tokenExpiry } from "./tokens";
import { sendPasswordResetEmail } from "@/modules/notifications";
import { appUrl } from "@/lib/url";
import {
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignUpInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./validation";
import { AuthError } from "./errors";
import type { PublicUser, PasswordResetIssued } from "./types";

const BCRYPT_ROUNDS = 12;
const RESET_TTL_MINUTES = 60;

function toPublic(row: UserRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    avatarUrl: row.avatarUrl ?? undefined,
  };
}

export async function registerCustomer(
  input: SignUpInput,
): Promise<PublicUser> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) throw new AuthError("INVALID_INPUT", parsed.error.message);

  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) throw new AuthError("EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const [row] = await db
    .insert(users)
    .values({
      email,
      name,
      role: "customer",
      passwordHash,
      active: true,
    })
    .returning();

  return toPublic(row);
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<PasswordResetIssued> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) throw new AuthError("INVALID_INPUT", parsed.error.message);

  const { email } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success-shaped response — never leak whether the email exists.
  if (!user || !user.active) {
    return {};
  }

  const token = generateToken();
  const tokenHashValue = hashToken(token);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: tokenHashValue,
    expiresAt: tokenExpiry(RESET_TTL_MINUTES),
  });

  const resetUrl = appUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  const result = await sendPasswordResetEmail({
    to: email,
    resetUrl,
    ttlMinutes: RESET_TTL_MINUTES,
  });

  // When Resend isn't configured (dev), the notifications module logs to
  // console and returns delivered=false. Surface the raw token so a developer
  // can copy/paste it locally without needing email transport.
  if (!result.delivered && process.env.NODE_ENV !== "production") {
    return { devToken: token };
  }
  return {};
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) throw new AuthError("INVALID_INPUT", parsed.error.message);

  const { token, password } = parsed.data;
  const tokenHashValue = hashToken(token);

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHashValue),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    // Tell apart the failure modes for the API consumer.
    const [stale] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHashValue))
      .limit(1);
    if (!stale) throw new AuthError("TOKEN_INVALID");
    if (stale.usedAt) throw new AuthError("TOKEN_USED");
    throw new AuthError("TOKEN_EXPIRED");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, row.userId));
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, row.id));
  });
}

export async function getPublicUserById(id: string): Promise<PublicUser | null> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ? toPublic(row) : null;
}
