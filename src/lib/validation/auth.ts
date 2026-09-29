import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address, like name@example.com."));

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Keep your name under 100 characters."),
  email: emailField,
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Use 72 characters or fewer."),
});

export const logInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
});