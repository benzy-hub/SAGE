import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  AccountStatus,
  AdvisorStudentConnection,
  ChatMessage,
  CollegeCatalog,
  DepartmentCatalog,
  Role,
  Session,
  StudentProfile,
  User,
} from "@/lib/db/models";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { studentId } = await context.params;
    const body = await req.json();

    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const status = String(body?.status ?? "")
      .trim()
      .toUpperCase();
    const matric = String(body?.studentId ?? "")
      .trim()
      .toUpperCase();
    const college = String(body?.college ?? "").trim();
    const department = String(body?.department ?? "").trim();
    const program = String(body?.program ?? "").trim();
    const level = String(body?.level ?? "").trim();
    const year = Number(body?.year ?? 1);

    const user = await User.findById(studentId);
    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (user.role !== Role.STUDENT) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const profile = await StudentProfile.findOne({ userId: user._id });
    if (!profile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 },
      );
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email }).select("_id");
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 },
        );
      }
      user.email = email;
    }

    if (matric && matric !== profile.studentId) {
      const existingMatric = await StudentProfile.findOne({
        studentId: matric,
      }).select("_id");
      if (existingMatric) {
        return NextResponse.json(
          { error: "Matric already exists" },
          { status: 409 },
        );
      }
      profile.studentId = matric;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (status) {
      if (!Object.values(AccountStatus).includes(status as AccountStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      user.status = status as typeof user.status;
    }

    if (!college || !department || !level) {
      return NextResponse.json(
        { error: "College, department and level are required" },
        { status: 400 },
      );
    }

    const [collegeRecord, departmentRecord] = await Promise.all([
      CollegeCatalog.findOne({ name: college }).select("levels"),
      DepartmentCatalog.findOne({ college, name: department }).select("levels"),
    ]);

    if (!collegeRecord) {
      return NextResponse.json({ error: "Invalid college" }, { status: 400 });
    }

    if (!departmentRecord) {
      return NextResponse.json(
        { error: "Invalid department for selected college" },
        { status: 400 },
      );
    }

    const allowedLevels = Array.isArray(departmentRecord.levels)
      ? departmentRecord.levels
      : [];

    if (allowedLevels.length > 0 && !allowedLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid level for selected department" },
        { status: 400 },
      );
    }

    profile.college = college;
    profile.department = department;
    profile.program = program || department;
    profile.level = level;
    profile.year = Number.isFinite(year) ? Math.max(1, year) : 1;

    await Promise.all([user.save(), profile.save()]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Admin Student PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { studentId } = await context.params;

    const student = await User.findById(studentId).select("_id role");
    if (!student || student.role !== Role.STUDENT) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await Promise.all([
      StudentProfile.deleteOne({ userId: studentId }),
      AdvisorStudentConnection.deleteMany({ studentId }),
      ChatMessage.deleteMany({
        $or: [{ senderId: studentId }, { recipientId: studentId }],
      }),
      Session.deleteMany({ userId: studentId }),
      User.deleteOne({ _id: studentId }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Admin Student DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
