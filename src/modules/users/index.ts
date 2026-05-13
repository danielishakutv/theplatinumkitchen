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
  setUserActive,
  setUserRole,
  verifyCredentials,
  recordLogin,
} from "./service";
export { users, userRoleEnum, type UserRow, type NewUserRow } from "./schema";
// `staffUsers` is intentionally NOT re-exported — it's a seed source only.
