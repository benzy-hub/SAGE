import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  AccountStatus,
  Account,
  AdvisorStudentConnection,
  ChatMessage,
  PasswordResetToken,
  Role,
  Session,
  User,
} from "@/lib/db/models";
import { sendEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ advisorId: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { advisorId } = await context.params;
    const body = await req.json();

    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const status = String(body?.status ?? "")
      .trim()
      .toUpperCase();

    const advisor = await User.findById(advisorId);
    if (!advisor) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    if (advisor.role !== Role.ADVISOR) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    const prevStatus = advisor.status;
    if (email && email !== advisor.email) {
      const existing = await User.findOne({ email }).select("_id");
      if (existing) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 },
        );
      }
      advisor.email = email;
    }

    if (firstName) advisor.firstName = firstName;
    if (lastName) advisor.lastName = lastName;
    if (status) {
      if (!Object.values(AccountStatus).includes(status as AccountStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      advisor.status = status as typeof advisor.status;
    }

    await advisor.save();

    // Send approval email when admin activates a previously-pending advisor
    if (
      status === AccountStatus.ACTIVE &&
      prevStatus === AccountStatus.PENDING_APPROVAL
    ) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://sageadvisor.app";
      try {
        await sendEmail({
          to: advisor.email,
          subject: "Your SAGE Advisor Account Has Been Approved",
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
              <h2 style="color:#111">Welcome to SAGE, ${advisor.firstName}!</h2>
              <p>Great news — your advisor account has been reviewed and <strong>approved</strong> by an administrator.</p>
              <p>You can now sign in and start managing student advisees.</p>
              <p style="margin:24px 0;">
                <a href="${appUrl}/auth/login"
                   style="background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                  Sign In to SAGE
                </a>
              </p>
              <p style="color:#888;font-size:13px;">If you did not create a SAGE advisor account, please ignore this email.</p>
            </div>
          `,
          text: `Hi ${advisor.firstName}, your SAGE advisor account has been approved. Sign in at ${appUrl}/auth/login`,
        });
      } catch (emailErr) {
        console.error("[Advisor Approve] Failed to send approval email:", emailErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Admin Advisor PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update advisor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ advisorId: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { advisorId } = await context.params;

    const advisor = await User.findById(advisorId).select("_id role");
    if (!advisor || advisor.role !== Role.ADVISOR) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    await Promise.all([
      AdvisorStudentConnection.deleteMany({ advisorId }),
      ChatMessage.deleteMany({
        $or: [{ senderId: advisorId }, { recipientId: advisorId }],
      }),
      Session.deleteMany({ userId: advisorId }),
      Account.deleteMany({ userId: advisorId }),
      PasswordResetToken.deleteMany({ userId: advisorId }),
      User.deleteOne({ _id: advisorId }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Admin Advisor DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete advisor" },
      { status: 500 },
    );
  }
}
