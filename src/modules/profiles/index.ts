// Public surface of the profiles module. Server-only — client components
// must import types only, or deep-import values from leaves like
// @/modules/profiles/errors, @/modules/profiles/validation.
import "server-only";

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
