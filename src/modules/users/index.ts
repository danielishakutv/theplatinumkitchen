// Server-only module barrel. Client components must NOT value-import from
// `@/modules/users` — the bundler would drag in service.ts (bcrypt, db,
// postgres / node:tls / etc.). Type imports are fine (TypeScript erases them).
// For values, deep-import from the leaf: @/modules/users/permissions,
// @/modules/users/types, etc. See [[feedback_client_imports]].
import "server-only";

export type { StaffUser, UserRole } from "./types";
export { ROLE_LABEL } from "./types";
export {
  can,
  requirePermission,
  PermissionError,
  ROLE_BADGE_TONE,
  type Permission,
  type ActorLike,
} from "./permissions";
export {
  findById,
  findByEmail,
  listStaff,
  createUser,
  updateUser,
  deleteUser,
  setUserActive,
  setUserRole,
  verifyCredentials,
  recordLogin,
  UserServiceError,
  type UserServiceErrorCode,
} from "./service";
export { users, userRoleEnum, type UserRow, type NewUserRow } from "./schema";
// `staffUsers` is intentionally NOT re-exported — it's a seed source only.
