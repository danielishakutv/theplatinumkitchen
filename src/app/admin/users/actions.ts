"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  PermissionError,
  UserServiceError,
  createUser,
  deleteUser,
  setUserActive,
  updateUser,
} from "@/modules/users";
import type { UserRole } from "@/modules/users/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireUser() {
  const session = await auth();
  return session?.user ?? null;
}

function toError(err: unknown): ActionResult {
  if (err instanceof UserServiceError) {
    return { ok: false, error: err.message || "Operation failed." };
  }
  if (err instanceof PermissionError) {
    return { ok: false, error: "You don't have permission for that." };
  }
  // Drizzle/postgres unique-constraint error on email.
  if (
    err instanceof Error &&
    /duplicate key|unique constraint/i.test(err.message)
  ) {
    return { ok: false, error: "That email is already in use." };
  }
  console.error("[admin/users] unexpected", err);
  return { ok: false, error: "Something went wrong." };
}

function revalidateUsers() {
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export interface CreateUserActionInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
}

export async function createUserAction(
  input: CreateUserActionInput,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  if (!input.name.trim() || !input.email.trim()) {
    return { ok: false, error: "Name and email are required." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  try {
    await createUser(user, {
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      role: input.role,
      active: input.active,
    });
    revalidateUsers();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export interface UpdateUserActionInput {
  name?: string;
  email?: string;
  role?: UserRole;
  active?: boolean;
  // Empty/omitted = keep current password; otherwise must be 8+ characters.
  password?: string;
}

export async function updateUserAction(
  id: string,
  input: UpdateUserActionInput,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  if (input.password !== undefined && input.password.length > 0 && input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  try {
    await updateUser(user, id, {
      ...input,
      // Treat empty password string as "don't change."
      password: input.password ? input.password : undefined,
    });
    revalidateUsers();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function setUserActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await setUserActive(user, id, active);
    revalidateUsers();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  if (user.id === id) {
    return { ok: false, error: "You can't delete your own account." };
  }
  try {
    await deleteUser(user, id);
    revalidateUsers();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
