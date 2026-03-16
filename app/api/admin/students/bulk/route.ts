import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  AccountStatus,
  CollegeCatalog,
  DepartmentCatalog,
  Role,
  StudentProfile,
  User,
  initializeModels,
} from "@/lib/db/models";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth/utils";

export interface BulkStudentRow {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId: string;
  college: string;
  department: string;
  program?: string;
  level: string;
  year?: number;
}

export interface BulkStudentResult {
  index: number;
  email: string;
  studentId: string;
  success: boolean;
  error?: string;
  id?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const rows: unknown[] = Array.isArray(body?.students) ? body.students : [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No student records provided" },
        { status: 400 },
      );
    }

    if (rows.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 students per bulk import" },
        { status: 400 },
      );
    }

    // Pre-load all colleges and departments for validation (avoid N+1)
    const [allColleges, allDepartments] = await Promise.all([
      CollegeCatalog.find({}).select("name levels"),
      DepartmentCatalog.find({}).select("college name levels"),
    ]);

    const collegeMap = new Map(
      allColleges.map((c) => [c.name.toLowerCase(), c]),
    );
    const deptMap = new Map(
      allDepartments.map((d) => [
        `${d.college.toLowerCase()}||${d.name.toLowerCase()}`,
        d,
      ]),
    );

    const results: BulkStudentResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i] as Record<string, unknown>;

      const firstName = String(raw?.firstName ?? "").trim();
      const lastName = String(raw?.lastName ?? "").trim();
      const email = String(raw?.email ?? "")
        .trim()
        .toLowerCase();
      const password = String(raw?.password ?? "").trim();
      const studentId = String(raw?.studentId ?? "")
        .trim()
        .toUpperCase();
      const college = String(raw?.college ?? "").trim();
      const department = String(raw?.department ?? "").trim();
      const program = String(raw?.program ?? department).trim();
      const level = String(raw?.level ?? "").trim();
      const year = Math.max(1, Number(raw?.year ?? 1));

      // --- field validation ---
      if (!firstName || !lastName) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "First and last name are required",
        });
        continue;
      }
      if (!email || !email.includes("@")) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "Valid email is required",
        });
        continue;
      }
      if (!password || password.length < 8) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "Password must be at least 8 characters",
        });
        continue;
      }
      if (!studentId) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "Student ID (matric) is required",
        });
        continue;
      }
      if (!college || !department || !level) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "College, department, and level are required",
        });
        continue;
      }

      // --- catalog validation ---
      const collegeRecord = collegeMap.get(college.toLowerCase());
      if (!collegeRecord) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: `Invalid college: ${college}`,
        });
        continue;
      }

      const deptRecord = deptMap.get(
        `${college.toLowerCase()}||${department.toLowerCase()}`,
      );
      if (!deptRecord) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: `Invalid department "${department}" for college "${college}"`,
        });
        continue;
      }

      const allowedLevels =
        deptRecord.levels.length > 0 ? deptRecord.levels : collegeRecord.levels;
      if (allowedLevels.length > 0 && !allowedLevels.includes(level)) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: `Invalid level "${level}" for department "${department}"`,
        });
        continue;
      }

      // --- uniqueness check ---
      const [existingEmail, existingMatric] = await Promise.all([
        User.findOne({ email }).select("_id"),
        StudentProfile.findOne({ studentId }).select("_id"),
      ]);

      if (existingEmail) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "Email already exists",
        });
        continue;
      }
      if (existingMatric) {
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "Matric (student ID) already exists",
        });
        continue;
      }

      // --- create ---
      try {
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

        await StudentProfile.create({
          userId: createdUser._id,
          studentId,
          college,
          department,
          program: program || department,
          level,
          year: Number.isFinite(year) ? Math.max(1, year) : 1,
        });

        results.push({
          index: i,
          email,
          studentId,
          success: true,
          id: createdUser._id.toString(),
        });
      } catch (createErr) {
        console.error(`[Bulk Students] Row ${i} create error:`, createErr);
        results.push({
          index: i,
          email,
          studentId,
          success: false,
          error: "Failed to create record",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        success: true,
        total: rows.length,
        created: successCount,
        failed: failureCount,
        results,
      },
      { status: 207 },
    );
  } catch (error) {
    console.error("[Admin Students Bulk POST]", error);
    return NextResponse.json({ error: "Bulk import failed" }, { status: 500 });
  }
}
