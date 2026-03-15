// app/api/auth/resend-pin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  User,
  EmailVerificationToken,
  initializeModels,
} from "@/lib/db/models";
import {
  normalizeEmail,
  generatePin,
  getPinExpiryTime,
} from "@/lib/auth/utils";
import { sendVerificationPin } from "@/lib/email/brevo";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If already verified, return success
    if (user.isEmailVerified) {
      return NextResponse.json(
        { success: true, message: "Email already verified" },
        { status: 200 },
      );
    }

    // Delete old verification token
    await EmailVerificationToken.deleteOne({ userId: user._id.toString() });

    // Generate new PIN
    const pin = generatePin();
    const expiresAt = getPinExpiryTime();

    const verificationToken = new EmailVerificationToken({
      userId: user._id,
      pin,
      expiresAt,
      attempts: 0,
    });

    await verificationToken.save();

    // Send email
    try {
      await sendVerificationPin({
        email: normalizedEmail,
        firstName: user.firstName,
        pin,
      });
    } catch (emailError) {
      console.error("[Email] Failed to send verification PIN:", emailError);
      return NextResponse.json(
        {
          success: true,
          message: "A new verification code was generated.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent to your email",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ResendPin] Error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 },
    );
  }
}
