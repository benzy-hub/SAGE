// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, initializeModels, AccountStatus } from "@/lib/db/models";
import { loginSchema } from "@/lib/auth/validation";
import { verifyPassword, normalizeEmail, RATE_LIMITS } from "@/lib/auth/utils";

// In-memory rate limiting (for production, use Redis)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = normalizeEmail(email);

    // Check rate limiting
    const now = Date.now();
    const attempt = loginAttempts.get(normalizedEmail);

    if (attempt && attempt.resetTime > now) {
      if (attempt.count >= RATE_LIMITS.LOGIN_ATTEMPTS_MAX) {
        const remainingSeconds = Math.ceil((attempt.resetTime - now) / 1000);
        return NextResponse.json(
          {
            error: `Too many failed attempts. Try again in ${remainingSeconds} seconds.`,
            attemptsRemaining: 0,
          },
          { status: 429 }
        );
      }
    } else {
      loginAttempts.delete(normalizedEmail);
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      // Record failed attempt
      loginAttempts.set(normalizedEmail, {
        count: 1,
        resetTime: now + RATE_LIMITS.LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000,
      });

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email before signing in",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // Check account status
    if (user.status !== AccountStatus.ACTIVE) {
      return NextResponse.json(
        { error: "Your account is not active. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      // Record failed attempt
      const currentAttempt = loginAttempts.get(normalizedEmail) || {
        count: 0,
        resetTime: now + RATE_LIMITS.LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000,
      };
      currentAttempt.count++;
      loginAttempts.set(normalizedEmail, currentAttempt);

      return NextResponse.json(
        {
          error: "Invalid email or password",
          attemptsRemaining: Math.max(
            0,
            RATE_LIMITS.LOGIN_ATTEMPTS_MAX - currentAttempt.count
          ),
        },
        { status: 401 }
      );
    }

    // Clear rate limiting on successful login
    loginAttempts.delete(normalizedEmail);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create session (in real app, use NextAuth or similar)
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set secure session cookie (example - implement proper session handling)
    response.cookies.set("auth_token", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("[Login] Error:", error);
    return NextResponse.json(
      { error: "Failed to sign in. Please try again." },
      { status: 500 }
    );
  }
}
