import "server-only";

import { and, eq, isNull, gt, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, type UserRow } from "@/modules/users/schema";
import type { UserRole } from "@/modules/users";
import { generateToken, hashToken, tokenExpiry } from "@/modules/auth";
import { sendEmailChangeVerification } from "@/modules/notifications";
import { appUrl } from "@/lib/url";
import { emailChangeTokens } from "./schema";
import {
  updateProfileSchema,
  changePasswordSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type RequestEmailChangeInput,
  type ConfirmEmailChangeInput,
} from "./validation";
import { ProfileError } from "./errors";
import type { Profile, EmailChangeIssued } from "./types";

const BCRYPT_ROUNDS = 12;
const EMAIL_TOKEN_TTL_MINUTES = 60;

function rowToProfile(row: UserRow): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    avatarUrl: row.avatarUrl,
    joinedAt: row.joinedAt.toISOString(),
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
  };
}

async function loadUser(userId: string): Promise<UserRow> {
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!row) throw new ProfileError("PROFILE_NOT_FOUND");
  return row;
}

export async function getProfile(userId: string): Promise<Profile> {
  const row = await loadUser(userId);
  return rowToProfile(row);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) throw new ProfileError("INVALID_INPUT", parsed.error.message);

  // Guarantee the user exists before mutating.
  await loadUser(userId);

  const patch: Partial<Pick<UserRow, "name" | "avatarUrl">> = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.avatarUrl !== undefined) patch.avatarUrl = parsed.data.avatarUrl;

  const [row] = await db
    .update(users)
    .set(patch)
    .where(eq(users.id, userId))
    .returning();

  return rowToProfile(row);
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<void> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) throw new ProfileError("INVALID_INPUT", parsed.error.message);

  const row = await loadUser(userId);
  const currentOk = await bcrypt.compare(parsed.data.currentPassword, row.passwordHash);
  if (!currentOk) throw new ProfileError("INVALID_PASSWORD");

  // Don't bother re-hashing if the new password equals the old one — but also
  // don't error: it's a no-op the caller doesn't need to know about.
  const sameAsOld = await bcrypt.compare(parsed.data.newPassword, row.passwordHash);
  if (sameAsOld) return;

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_ROUNDS);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function requestEmailChange(
  userId: string,
  input: RequestEmailChangeInput,
): Promise<EmailChangeIssued> {
  const parsed = requestEmailChangeSchema.safeParse(input);
  if (!parsed.success) throw new ProfileError("INVALID_INPUT", parsed.error.message);

  const { newEmail, currentPassword } = parsed.data;
  const row = await loadUser(userId);

  const currentOk = await bcrypt.compare(currentPassword, row.passwordHash);
  if (!currentOk) throw new ProfileError("INVALID_PASSWORD");

  if (newEmail === row.email) throw new ProfileError("EMAIL_UNCHANGED");

  // Email must be free against every OTHER user.
  const conflict = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, newEmail), ne(users.id, userId)))
    .limit(1);
  if (conflict.length > 0) throw new ProfileError("EMAIL_TAKEN");

  const token = generateToken();
  const tokenHashValue = hashToken(token);
  await db.insert(emailChangeTokens).values({
    userId,
    newEmail,
    tokenHash: tokenHashValue,
    expiresAt: tokenExpiry(EMAIL_TOKEN_TTL_MINUTES),
  });

  const verifyUrl = appUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  const result = await sendEmailChangeVerification({
    to: newEmail,
    verifyUrl,
    ttlMinutes: EMAIL_TOKEN_TTL_MINUTES,
  });

  if (!result.delivered && process.env.NODE_ENV !== "production") {
    return { devToken: token };
  }
  return {};
}

export async function confirmEmailChange(
  input: ConfirmEmailChangeInput,
): Promise<{ newEmail: string }> {
  const parsed = confirmEmailChangeSchema.safeParse(input);
  if (!parsed.success) throw new ProfileError("INVALID_INPUT", parsed.error.message);

  const tokenHashValue = hashToken(parsed.data.token);

  const [tokenRow] = await db
    .select()
    .from(emailChangeTokens)
    .where(
      and(
        eq(emailChangeTokens.tokenHash, tokenHashValue),
        isNull(emailChangeTokens.usedAt),
        gt(emailChangeTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!tokenRow) {
    const [stale] = await db
      .select()
      .from(emailChangeTokens)
      .where(eq(emailChangeTokens.tokenHash, tokenHashValue))
      .limit(1);
    if (!stale) throw new ProfileError("TOKEN_INVALID");
    if (stale.usedAt) throw new ProfileError("TOKEN_USED");
    throw new ProfileError("TOKEN_EXPIRED");
  }

  // Re-check uniqueness — another user may have grabbed this email between
  // request and confirm.
  const conflict = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, tokenRow.newEmail), ne(users.id, tokenRow.userId)))
    .limit(1);
  if (conflict.length > 0) throw new ProfileError("EMAIL_TAKEN");

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ email: tokenRow.newEmail })
      .where(eq(users.id, tokenRow.userId));
    await tx
      .update(emailChangeTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailChangeTokens.id, tokenRow.id));
  });

  return { newEmail: tokenRow.newEmail };
}
