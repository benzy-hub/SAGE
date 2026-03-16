import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  Account,
  AccountStatus,
  AdvisorStudentConnection,
  ChatMessage,
  EmailVerificationToken,
  PasswordResetToken,
  Role,
  Session,
  StudentProfile,
  User,
} from "@/lib/db/models";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { userId } = await context.params;
    const body = await req.json();
    const existing = await User.findById(userId);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const nextStatusRaw = String(body?.status ?? "").toUpperCase();
    if (nextStatusRaw) {
      if (
        !Object.values(AccountStatus).includes(nextStatusRaw as AccountStatus)
      ) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      existing.status = nextStatusRaw as AccountStatus;
    }

    const nextRoleRaw = String(body?.role ?? "").toUpperCase();
    if (nextRoleRaw) {
      if (!Object.values(Role).includes(nextRoleRaw as Role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      existing.role = nextRoleRaw as Role;
    }

    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();

    if (firstName) existing.firstName = firstName;
    if (lastName) existing.lastName = lastName;

    if (email && email !== existing.email) {
      const conflict = await User.findOne({ email }).select("_id");
      if (conflict) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 },
        );
      }
      existing.email = email;
    }

    await existing.save();

    if (existing.role !== Role.STUDENT) {
      await StudentProfile.deleteOne({ userId: existing._id });
    }

    if (existing.role === Role.STUDENT && body?.studentId) {
      await StudentProfile.findOneAndUpdate(
        { userId: existing._id },
        {
          studentId: String(body.studentId).trim().toUpperCase(),
          college: String(body?.college ?? "").trim(),
          department: String(body?.department ?? "").trim(),
          program: String(body?.program ?? "").trim(),
          level: String(body?.level ?? "").trim(),
          year: Math.max(1, Number(body?.year ?? 1)),
        },
        { upsert: true, new: true },
      );
    }

    const updated = await User.findById(userId).select(
      "firstName lastName email role status isEmailVerified",
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        item: {
          id: updated._id.toString(),
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          role: updated.role,
          status: updated.status,
          isEmailVerified: updated.isEmailVerified,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Users PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { userId } = await context.params;

    await Promise.all([
      StudentProfile.deleteOne({ userId }),
      AdvisorStudentConnection.deleteMany({
        $or: [
          { advisorId: userId },
          { studentId: userId },
          { requestedBy: userId },
        ],
      }),
      ChatMessage.deleteMany({
        $or: [{ senderId: userId }, { recipientId: userId }],
      }),
      Session.deleteMany({ userId }),
      Account.deleteMany({ userId }),
      PasswordResetToken.deleteMany({ userId }),
      EmailVerificationToken.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Admin Users DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
