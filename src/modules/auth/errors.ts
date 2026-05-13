export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "INVALID_INPUT"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "TOKEN_USED"
  | "ACCOUNT_DISABLED"
  | "RATE_LIMITED";

export class AuthError extends Error {
  constructor(
    public readonly code: AuthErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "AuthError";
  }
}

export const AUTH_ERROR_STATUS: Record<AuthErrorCode, number> = {
  INVALID_CREDENTIALS: 401,
  EMAIL_TAKEN: 409,
  WEAK_PASSWORD: 422,
  INVALID_INPUT: 422,
  TOKEN_INVALID: 400,
  TOKEN_EXPIRED: 410,
  TOKEN_USED: 410,
  ACCOUNT_DISABLED: 403,
  RATE_LIMITED: 429,
};
