// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, EmailVerificationToken, Role, AccountStatus, initializeModels } from "@/lib/db/models";
import { signupSchema } from "@/lib/auth/validation";
import { hashPassword, generatePin, getPinExpiryTime, normalizeEmail } from "@/lib/auth/utils";
import { sendWelcomeEmail, sendVerificationPin } from "@/lib/email/brevo";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { email, firstName, lastName, password, role } = validation.data;
    const normalizedEmail = normalizeEmail(email);

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered. Please sign in or use a different email." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = new User({
      email: normalizedEmail,
      firstName,
      lastName,
      password: hashedPassword,
      role: role as Role,
      status: AccountStatus.PENDING_VERIFICATION,
      isEmailVerified: false,
    });

    await user.save();

    // Generate verification PIN
    const pin = generatePin();
    const expiresAt = getPinExpiryTime();

    const verificationToken = new EmailVerificationToken({
      userId: user._id,
      pin,
      expiresAt,
      attempts: 0,
    });

    await verificationToken.save();

    // Send emails
    try {
      await sendWelcomeEmail({
        email: normalizedEmail,
        firstName,
        role,
      });

      await sendVerificationPin({
        email: normalizedEmail,
        firstName,
        pin,
      });
    } catch (emailError) {
      console.error("[Email] Failed to send registration emails:", emailError);
      // Continue even if emails fail
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created! Check your email for verification code.",
        userId: user._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
