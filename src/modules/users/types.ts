export type UserRole =
  | "super_admin"
  | "manager"
  | "cashier"
  | "kitchen"
  | "rider"
  | "customer";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
  joinedAt: string;
}

export const ROLE_LABEL: Record<UserRole, string> = {
  super_admin: "Super admin",
  manager: "Manager",
  cashier: "Cashier",
  kitchen: "Kitchen",
  rider: "Rider",
  customer: "Customer",
};
