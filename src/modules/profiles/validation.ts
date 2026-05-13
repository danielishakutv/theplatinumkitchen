import { z } from "zod";

const nameField = z.string().trim().min(1).max(120);
const emailField = z.string().trim().toLowerCase().email().max(254);
const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);
// Avatar accepts a URL string or null (to clear). Empty/undefined = no change.
const avatarField = z.union([z.string().url().max(500), z.null()]);

export const updateProfileSchema = z
  .object({
    name: nameField.optional(),
    avatarUrl: avatarField.optional(),
  })
  .refine((v) => v.name !== undefined || v.avatarUrl !== undefined, {
    message: "Provide at least one field to update",
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordField,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const requestEmailChangeSchema = z.object({
  newEmail: emailField,
  currentPassword: z.string().min(1),
});
export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;

export const confirmEmailChangeSchema = z.object({
  token: z.string().min(20).max(200),
});
export type ConfirmEmailChangeInput = z.infer<typeof confirmEmailChangeSchema>;
