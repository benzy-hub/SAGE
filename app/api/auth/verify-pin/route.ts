// app/api/auth/verify-pin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  User,
  EmailVerificationToken,
  initializeModels,
  AccountStatus,
  Role,
} from "@/lib/db/models";
import { verifyPinSchema } from "@/lib/auth/validation";
import { normalizeEmail } from "@/lib/auth/utils";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const body = await req.json();
    const { email, pin } = body;

    if (!email || !pin) {
      return NextResponse.json(
        { error: "Email and PIN are required" },
        { status: 400 },
      );
    }

    const validation = verifyPinSchema.safeParse({ pin });
    if (!validation.success) {
      return NextResponse.json(
        { error: "PIN must be 6 digits" },
        { status: 400 },
      );
    }

    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find verification token
    const verificationToken = await EmailVerificationToken.findOne({
      userId: user._id.toString(),
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "No verification request found. Please sign up again." },
        { status: 400 },
      );
    }

    // Check if token expired
    if (verificationToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Verification code expired. Request a new one." },
        { status: 410 },
      );
    }

    // Check attempts
    if (verificationToken.attempts >= verificationToken.maxAttempts) {
      return NextResponse.json(
        {
          error: "Too many failed attempts. Request a new code.",
          attemptsRemaining: 0,
        },
        { status: 429 },
      );
    }

    // Verify PIN
    if (verificationToken.pin !== pin) {
      verificationToken.attempts++;
      await verificationToken.save();

      return NextResponse.json(
        {
          error: "Invalid PIN",
          attemptsRemaining: Math.max(
            0,
            verificationToken.maxAttempts - verificationToken.attempts,
          ),
        },
        { status: 401 },
      );
    }

    // PIN is correct - mark email as verified
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    // Advisors who self-registered require admin approval before they can log in
    const pendingApproval = user.role === Role.ADVISOR;
    user.status = pendingApproval
      ? AccountStatus.PENDING_APPROVAL
      : AccountStatus.ACTIVE;
    await user.save();

    // Delete verification token
    await EmailVerificationToken.deleteOne({ _id: verificationToken._id });

    return NextResponse.json(
      {
        success: true,
        pendingApproval,
        message: pendingApproval
          ? "Email verified. Your advisor account is pending admin approval."
          : "Email verified successfully",
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[VerifyPin] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify PIN. Please try again." },
      { status: 500 },
    );
  }
}
