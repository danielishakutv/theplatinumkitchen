export type ProfileErrorCode =
  | "PROFILE_NOT_FOUND"
  | "INVALID_INPUT"
  | "INVALID_PASSWORD"
  | "WEAK_PASSWORD"
  | "EMAIL_TAKEN"
  | "EMAIL_UNCHANGED"
  | "TOKEN_INVALID"
  | "TOKEN_EXPIRED"
  | "TOKEN_USED";

export class ProfileError extends Error {
  constructor(
    public readonly code: ProfileErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ProfileError";
  }
}

export const PROFILE_ERROR_STATUS: Record<ProfileErrorCode, number> = {
  PROFILE_NOT_FOUND: 404,
  INVALID_INPUT: 422,
  INVALID_PASSWORD: 401,
  WEAK_PASSWORD: 422,
  EMAIL_TAKEN: 409,
  EMAIL_UNCHANGED: 422,
  TOKEN_INVALID: 400,
  TOKEN_EXPIRED: 410,
  TOKEN_USED: 410,
};
