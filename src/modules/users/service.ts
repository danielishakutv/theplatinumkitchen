import "server-only";

import { and, eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, type UserRow, type NewUserRow } from "./schema";
import type { StaffUser, UserRole } from "./types";
import { can, requirePermission, type ActorLike } from "./permissions";

const BCRYPT_ROUNDS = 12;

export type UserServiceErrorCode =
  | "USER_NOT_FOUND"
  | "USER_EMAIL_TAKEN"
  | "USER_LAST_SUPER_ADMIN";

export class UserServiceError extends Error {
  constructor(
    public readonly code: UserServiceErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "UserServiceError";
  }
}

function rowToStaff(row: UserRow): StaffUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as UserRole,
    avatarUrl: row.avatarUrl ?? undefined,
    active: row.active,
    joinedAt: row.joinedAt.toISOString(),
  };
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function listStaff(actor: ActorLike): Promise<StaffUser[]> {
  requirePermission(actor, "users:read");
  const rows = await db.select().from(users).orderBy(users.joinedAt);
  return rows
    .filter((r) => r.role !== "customer")
    .map(rowToStaff);
}

interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  avatarUrl?: string;
  active?: boolean;
}

export async function createUser(
  actor: ActorLike,
  input: CreateUserInput,
): Promise<StaffUser> {
  requirePermission(actor, "users:write");
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const insert: NewUserRow = {
    email: input.email.toLowerCase(),
    name: input.name,
    role: input.role,
    passwordHash,
    avatarUrl: input.avatarUrl,
    active: input.active ?? true,
  };
  const [row] = await db.insert(users).values(insert).returning();
  return rowToStaff(row);
}

export async function setUserActive(
  actor: ActorLike,
  id: string,
  active: boolean,
): Promise<void> {
  requirePermission(actor, "users:write");
  await db.update(users).set({ active }).where(eq(users.id, id));
}

export async function setUserRole(
  actor: ActorLike,
  id: string,
  role: UserRole,
): Promise<void> {
  requirePermission(actor, "users:write");
  await db.update(users).set({ role }).where(eq(users.id, id));
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
  avatarUrl?: string;
  // When provided, resets the password to this value. Omit/empty to keep the
  // existing hash.
  password?: string;
}

export async function updateUser(
  actor: ActorLike,
  id: string,
  input: UpdateUserInput,
): Promise<StaffUser> {
  requirePermission(actor, "users:write");
  const existing = await findById(id);
  if (!existing) {
    throw new UserServiceError("USER_NOT_FOUND", "That user doesn't exist.");
  }

  const updates: Partial<NewUserRow> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.email !== undefined) {
    const email = input.email.toLowerCase();
    if (email !== existing.email) {
      const dup = await findByEmail(email);
      if (dup && dup.id !== id) {
        throw new UserServiceError(
          "USER_EMAIL_TAKEN",
          "That email is already in use.",
        );
      }
      updates.email = email;
    }
  }
  if (input.role !== undefined) updates.role = input.role;
  if (input.active !== undefined) updates.active = input.active;
  if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl;
  if (input.password) {
    updates.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  if (Object.keys(updates).length === 0) return rowToStaff(existing);

  const [row] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  return rowToStaff(row);
}

// Hard-deletes a user. The schema's FK cascades clean up notifications +
// auth tokens; orders.userId is set to null (the customer-snapshot fields on
// the order row keep the contact info, so nothing is lost). No table
// currently tracks "created_by" for a staff user, so there's nothing to
// reassign at this point — if such fields are added later, wire the
// reassignment here.
export async function deleteUser(actor: ActorLike, id: string): Promise<void> {
  requirePermission(actor, "users:write");
  const existing = await findById(id);
  if (!existing) {
    throw new UserServiceError("USER_NOT_FOUND", "That user doesn't exist.");
  }
  // Don't allow removing the last active super admin — that would lock
  // everyone out of high-privilege actions.
  if (existing.role === "super_admin") {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.role, "super_admin"), eq(users.active, true)));
    if ((row?.n ?? 0) <= 1) {
      throw new UserServiceError(
        "USER_LAST_SUPER_ADMIN",
        "Can't delete the last active super admin.",
      );
    }
  }
  await db.delete(users).where(eq(users.id, id));
}

export async function recordLogin(id: string): Promise<void> {
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, id));
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<UserRow | null> {
  const row = await findByEmail(email);
  if (!row || !row.active) return null;
  const ok = await bcrypt.compare(password, row.passwordHash);
  return ok ? row : null;
}

export { can, requirePermission };
