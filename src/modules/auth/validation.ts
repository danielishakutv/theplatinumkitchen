import { z } from "zod";

const emailField = z.string().trim().toLowerCase().email().max(254);
const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);
const nameField = z.string().trim().min(1).max(120);

export const signUpSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordField,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
