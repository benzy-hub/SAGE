// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, PasswordResetToken, initializeModels } from "@/lib/db/models";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import {
  normalizeEmail,
  generateResetToken,
  hashToken,
  getResetTokenExpiryTime,
} from "@/lib/auth/utils";
import { sendPasswordResetEmail } from "@/lib/email/brevo";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email } = validation.data;
    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account with that email exists, you will receive a password reset link.",
        },
        { status: 200 },
      );
    }

    // Delete old reset tokens
    await PasswordResetToken.deleteMany({ userId: user._id.toString() });

    // Generate reset token
    const rawToken = generateResetToken();
    const hashedTokenValue = hashToken(rawToken);
    const expiresAt = getResetTokenExpiryTime();

    const resetToken = new PasswordResetToken({
      userId: user._id,
      token: hashedTokenValue,
      expiresAt,
    });

    await resetToken.save();

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${rawToken}`;

    // Send email
    try {
      await sendPasswordResetEmail({
        email: normalizedEmail,
        firstName: user.firstName,
        resetLink,
      });
    } catch (emailError) {
      console.error("[Email] Failed to send reset link:", emailError);

      return NextResponse.json(
        {
          success: true,
          message:
            "If an account with that email exists, you will receive a password reset link.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset link sent to your email",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset" },
      { status: 500 },
    );
  }
}
