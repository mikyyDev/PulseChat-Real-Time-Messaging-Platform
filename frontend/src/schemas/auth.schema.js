import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 72;
export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 254;

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(EMAIL_MAX_LENGTH, `Email must be under ${EMAIL_MAX_LENGTH} characters`)
  .pipe(z.email("Please enter a valid email address"));

const nameField = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .pipe(
    z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(
        NAME_MAX_LENGTH,
        `Full name must be under ${NAME_MAX_LENGTH} characters`,
      ),
  );

const newPasswordField = z
  .string()
  .min(1, "Password is required")
  .pipe(
    z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `Password must be under ${PASSWORD_MAX_LENGTH} characters`,
      )
      .refine(
        (value) => value.trim().length > 0,
        "Password cannot be only spaces",
      ),
  );

// Login validation schema
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

// Sign up validation schema
export const signupSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
