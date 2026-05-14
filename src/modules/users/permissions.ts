import type { UserRole } from "./types";

export type Permission =
  | "users:read"
  | "users:write"
  | "menu:read"
  | "menu:write"
  | "menu:delete"
  | "orders:read"
  | "orders:write"
  | "orders:cancel"
  | "orders:delete"
  | "kitchen:advance"
  | "invoices:read"
  | "invoices:mark_paid"
  | "settings:read"
  | "settings:write";

const ROLE_PERMS: Record<UserRole, Set<Permission>> = {
  super_admin: new Set<Permission>([
    "users:read",
    "users:write",
    "menu:read",
    "menu:write",
    "menu:delete",
    "orders:read",
    "orders:write",
    "orders:cancel",
    "orders:delete",
    "kitchen:advance",
    "invoices:read",
    "invoices:mark_paid",
    "settings:read",
    "settings:write",
  ]),
  manager: new Set<Permission>([
    "users:read",
    "menu:read",
    "menu:write",
    "menu:delete",
    "orders:read",
    "orders:write",
    "orders:cancel",
    "orders:delete",
    "kitchen:advance",
    "invoices:read",
    "invoices:mark_paid",
    "settings:read",
  ]),
  cashier: new Set<Permission>([
    "menu:read",
    "orders:read",
    "orders:write",
    "invoices:read",
    "invoices:mark_paid",
  ]),
  kitchen: new Set<Permission>(["menu:read", "orders:read", "kitchen:advance"]),
  rider: new Set<Permission>(["orders:read"]),
  customer: new Set<Permission>([]),
};

export interface ActorLike {
  role: UserRole;
}

export function can(actor: ActorLike | null | undefined, action: Permission): boolean {
  if (!actor) return false;
  return ROLE_PERMS[actor.role]?.has(action) ?? false;
}

export function requirePermission(
  actor: ActorLike | null | undefined,
  action: Permission,
): asserts actor is ActorLike {
  if (!can(actor, action)) {
    throw new PermissionError(action);
  }
}

export class PermissionError extends Error {
  constructor(public readonly action: Permission) {
    super(`Forbidden: missing permission '${action}'`);
    this.name = "PermissionError";
  }
}

export const ROLE_BADGE_TONE: Record<UserRole, string> = {
  super_admin: "bg-emerald-100 text-emerald-800",
  manager: "bg-blue-100 text-blue-800",
  cashier: "bg-amber-100 text-amber-800",
  kitchen: "bg-purple-100 text-purple-800",
  rider: "bg-pink-100 text-pink-800",
  customer: "bg-platinum-100 text-platinum-700",
};
