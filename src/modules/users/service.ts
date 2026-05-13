import "server-only";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, type UserRow, type NewUserRow } from "./schema";
import type { StaffUser, UserRole } from "./types";
import { can, requirePermission, type ActorLike } from "./permissions";

const BCRYPT_ROUNDS = 12;

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
