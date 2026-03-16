import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  AccountStatus,
  CollegeCatalog,
  DepartmentCatalog,
  Role,
  StudentProfile,
  User,
} from "@/lib/db/models";
import { hashPassword } from "@/lib/auth/utils";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const profiles = await StudentProfile.find({})
      .sort({ updatedAt: -1 })
      .select(
        "userId studentId college department program level year updatedAt",
      );

    const userIds = profiles.map((profile) => profile.userId);
    const users = await User.find({
      _id: { $in: userIds },
      role: Role.STUDENT,
    }).select("_id firstName lastName email status createdAt");

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const items = profiles
      .map((profile) => {
        const user = userMap.get(profile.userId.toString());
        if (!user) return null;
        return {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          status: user.status,
          studentId: profile.studentId,
          college: profile.college ?? "",
          department: profile.department ?? "",
          program: profile.program ?? "",
          level: profile.level ?? "",
          year: Number(profile.year ?? 1),
          createdAt: user.createdAt,
          updatedAt: profile.updatedAt,
        };
      })
      .filter((item) => item !== null);

    const uniqueColleges = new Set(
      items.map((item) => item.college).filter(Boolean),
    );
    const uniqueDepartments = new Set(
      items.map((item) => item.department).filter(Boolean),
    );
    const uniqueLevels = new Set(
      items.map((item) => item.level).filter(Boolean),
    );

    return NextResponse.json(
      {
        metrics: {
          totalStudents: items.length,
          totalColleges: uniqueColleges.size,
          totalDepartments: uniqueDepartments.size,
          levelCoverage: uniqueLevels.size,
        },
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Students GET]", error);
    return NextResponse.json(
      { error: "Failed to load students" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "").trim();
    const studentId = String(body?.studentId ?? "")
      .trim()
      .toUpperCase();
    const college = String(body?.college ?? "").trim();
    const department = String(body?.department ?? "").trim();
    const program = String(body?.program ?? "").trim();
    const level = String(body?.level ?? "").trim();
    const year = Number(body?.year ?? 1);

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !studentId ||
      !college ||
      !department ||
      !level
    ) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const [existingEmail, existingMatric] = await Promise.all([
      User.findOne({ email }).select("_id"),
      StudentProfile.findOne({ studentId }).select("_id"),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    if (existingMatric) {
      return NextResponse.json(
        { error: "Matric already exists" },
        { status: 409 },
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

    const allowedLevels =
      departmentRecord.levels.length > 0
        ? departmentRecord.levels
        : collegeRecord.levels;

    if (allowedLevels.length > 0 && !allowedLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid level for selected department" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: Role.STUDENT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
    });

    const createdProfile = await StudentProfile.create({
      userId: createdUser._id,
      studentId,
      college,
      department,
      program: program || department,
      level,
      year: Number.isFinite(year) ? Math.max(1, year) : 1,
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: createdUser._id.toString(),
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          status: createdUser.status,
          studentId: createdProfile.studentId,
          college: createdProfile.college,
          department: createdProfile.department,
          program: createdProfile.program,
          level: createdProfile.level,
          year: createdProfile.year,
          createdAt: createdUser.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Admin Students POST]", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
