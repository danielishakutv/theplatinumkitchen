// Public surface of the profiles module. Do NOT deep-import from this module.
export {
  ProfileError,
  PROFILE_ERROR_STATUS,
  type ProfileErrorCode,
} from "./errors";
export {
  updateProfileSchema,
  changePasswordSchema,
  requestEmailChangeSchema,
  confirmEmailChangeSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type RequestEmailChangeInput,
  type ConfirmEmailChangeInput,
} from "./validation";
export type { Profile, EmailChangeIssued } from "./types";
export {
  getProfile,
  updateProfile,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
} from "./service";
export { emailChangeTokens } from "./schema";
