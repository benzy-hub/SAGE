// lib/auth/validation.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// Signup Validation
// ─────────────────────────────────────────────

export const signupSchema = z
  .object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .transform((val) => val.trim()),
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters")
      .transform((val) => val.trim()),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters")
      .transform((val) => val.trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "ADVISOR"], {
      message: "Please select a valid role",
    }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

// ─────────────────────────────────────────────
// Login Validation
// ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .transform((val) => val.trim()),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─────────────────────────────────────────────
// Forgot Password Validation
// ─────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .transform((val) => val.trim()),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ─────────────────────────────────────────────
// PIN Verification Validation
// ─────────────────────────────────────────────

export const verifyPinSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{6}$/, "PIN must be 6 digits")
    .transform((val) => val.trim()),
});

export type VerifyPinInput = z.infer<typeof verifyPinSchema>;

// ─────────────────────────────────────────────
// Reset Password Validation
// ─────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Invalid reset token"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
