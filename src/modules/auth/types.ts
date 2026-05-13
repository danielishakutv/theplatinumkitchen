import type { UserRole } from "@/modules/users";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface PasswordResetIssued {
  // In dev with no email transport, the raw token / link is returned so the
  // caller can log it. In production this MUST be undefined and the token
  // must only reach the user via email.
  devToken?: string;
}
