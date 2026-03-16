import { NextRequest, NextResponse } from "next/server";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  AdvisorStudentConnection,
  ConnectionStatus,
  Role,
  StudentProfile,
  User,
} from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const search = (req.nextUrl.searchParams.get("search") ?? "")
      .trim()
      .toLowerCase();

    const [accepted, pending] = await Promise.all([
      AdvisorStudentConnection.find({
        advisorId: guard.userId,
        status: ConnectionStatus.ACCEPTED,
      })
        .sort({ updatedAt: -1 })
        .select("studentId updatedAt"),
      AdvisorStudentConnection.countDocuments({
        advisorId: guard.userId,
        status: ConnectionStatus.PENDING,
      }),
    ]);

    const studentIds = accepted.map((row) => row.studentId);

    const [profiles, students] = await Promise.all([
      StudentProfile.find({ userId: { $in: studentIds } }).select(
        "userId studentId college department program level year",
      ),
      User.find({ _id: { $in: studentIds }, role: Role.STUDENT }).select(
        "_id firstName lastName email status",
      ),
    ]);

    const profileMap = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );

    const items = students
      .map((student) => {
        const profile = profileMap.get(student._id.toString());
        return {
          id: student._id.toString(),
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          status: student.status,
          studentId: profile?.studentId ?? "—",
          college: profile?.college ?? "—",
          department: profile?.department ?? "—",
          program: profile?.program ?? "—",
          level: profile?.level ?? "—",
          year: Number(profile?.year ?? 1),
        };
      })
      .filter((item) => {
        if (!search) return true;
        return (
          `${item.firstName} ${item.lastName}`.toLowerCase().includes(search) ||
          item.email.toLowerCase().includes(search) ||
          item.studentId.toLowerCase().includes(search) ||
          item.department.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => a.firstName.localeCompare(b.firstName));

    return NextResponse.json(
      {
        metrics: {
          totalAdvisees: items.length,
          pendingRequests: pending,
          departments: new Set(items.map((item) => item.department)).size,
          activeStudents: items.filter((item) => item.status === "ACTIVE")
            .length,
        },
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Advisor Advisees GET]", error);
    return NextResponse.json(
      { error: "Failed to load advisees" },
      { status: 500 },
    );
  }
}
