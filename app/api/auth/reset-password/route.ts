// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, PasswordResetToken, initializeModels } from "@/lib/db/models";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { hashPassword, hashToken } from "@/lib/auth/utils";
import { sendPasswordResetSuccessEmail } from "@/lib/email/brevo";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 },
      );
    }

    const { token, password } = validation.data;
    const hashedToken = hashToken(token);

    // Find reset token
    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
    }).populate("userId");

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    // Check if token expired
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 410 },
      );
    }

    // Check if already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: "This reset link has already been used" },
        { status: 400 },
      );
    }

    // Update user password
    const user = await User.findById(resetToken.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.password = await hashPassword(password);
    await user.save();

    // Mark token as used
    resetToken.usedAt = new Date();
    await resetToken.save();

    // Send success email
    try {
      await sendPasswordResetSuccessEmail({
        email: user.email,
        firstName: user.firstName,
      });
    } catch (emailError) {
      console.error("[Email] Failed to send reset success:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[ResetPassword] Error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}
