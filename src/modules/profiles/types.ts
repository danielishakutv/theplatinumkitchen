import type { UserRole } from "@/modules/users";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  joinedAt: string;
  lastLoginAt: string | null;
}

export interface EmailChangeIssued {
  // Only present in non-production — raw token for dev console use.
  devToken?: string;
}
