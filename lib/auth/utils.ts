// lib/auth/utils.ts
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ─────────────────────────────────────────────
// PIN Generation and Verification
// ─────────────────────────────────────────────

export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getPinExpiryTime(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10); // 10 minutes validity
  return now;
}

// ─────────────────────────────────────────────
// Password Hashing and Verification
// ─────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─────────────────────────────────────────────
// Reset Token Generation and Hashing
// ─────────────────────────────────────────────

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getResetTokenExpiryTime(): Date {
  const now = new Date();
  now.setHours(now.getHours() + 1); // 1 hour validity
  return now;
}

// ─────────────────────────────────────────────
// Name Validation
// ─────────────────────────────────────────────

export function isValidName(name: string): boolean {
  // Allow letters, spaces, hyphens, and apostrophes only
  return /^[a-zA-Z\s'-]{2,50}$/.test(name.trim());
}

// ─────────────────────────────────────────────
// Email Normalization
// ─────────────────────────────────────────────

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ─────────────────────────────────────────────
// Rate Limiting Helpers
// ─────────────────────────────────────────────

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS_MAX: 5,
  LOGIN_ATTEMPT_WINDOW_MINUTES: 15,
  LOGIN_LOCKOUT_MINUTES: 15,
  PIN_ATTEMPTS_MAX: 5,
  PIN_GENERATION_COOLDOWN_SECONDS: 30,
  PASSWORD_RESET_ATTEMPTS_MAX: 3,
  PASSWORD_RESET_WINDOW_HOURS: 1,
};

export function getLoginAttemptLockoutTime(lockedUntil: Date): number {
  const now = new Date();
  const diffMs = lockedUntil.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / 1000)); // Return seconds remaining
}

// ─────────────────────────────────────────────
// Email Verification Status Check
// ─────────────────────────────────────────────

export interface EmailVerificationStatus {
  isVerified: boolean;
  canRetry: boolean;
  attemptsRemaining: number;
  expiresIn: number; // milliseconds
}

export function getVerificationStatus(
  attempts: number,
  maxAttempts: number,
  expiresAt: Date
): EmailVerificationStatus {
  const now = new Date();
  const expiresIn = expiresAt.getTime() - now.getTime();

  return {
    isVerified: false,
    canRetry: attempts < maxAttempts && expiresIn > 0,
    attemptsRemaining: Math.max(0, maxAttempts - attempts),
    expiresIn: Math.max(0, expiresIn),
  };
}
