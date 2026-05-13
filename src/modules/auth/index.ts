// Public surface of the auth module. Do NOT deep-import from this module.
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
