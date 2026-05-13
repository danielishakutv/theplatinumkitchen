// Public surface of the auth module. Server-only — client components must
// import types only, or deep-import values from leaves like
// @/modules/auth/errors, @/modules/auth/validation, @/modules/auth/tokens.
import "server-only";

export { AuthError, AUTH_ERROR_STATUS, type AuthErrorCode } from "./errors";
export {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type SignUpInput,
  type SignInInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "./validation";
export type { PublicUser, PasswordResetIssued } from "./types";
export {
  registerCustomer,
  requestPasswordReset,
  resetPassword,
  getPublicUserById,
} from "./service";
export { passwordResetTokens } from "./schema";
// Token helpers — re-exported so peer modules (e.g. profiles email change)
// can reuse the same scheme without deep-importing.
export { generateToken, hashToken, tokenExpiry } from "./tokens";
