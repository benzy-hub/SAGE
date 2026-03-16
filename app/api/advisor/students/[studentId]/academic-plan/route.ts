import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  AdvisorStudentConnection,
  ConnectionStatus,
  DepartmentCatalog,
  Role,
  StudentAcademicPlanItem,
  StudentProfile,
  User,
} from "@/lib/db/models";

function createRecommendations(completionRate: number, planItems: number) {
  const tips: string[] = [];
  if (planItems === 0) {
    tips.push(
      "Student has no custom plan items yet. Recommend adding 2-3 measurable actions.",
    );
  }
  if (completionRate < 40) {
    tips.push(
      "Escalate advising frequency and define one short-term recovery milestone.",
    );
  } else if (completionRate < 70) {
    tips.push(
      "Review deadlines and push one in-progress task to done this week.",
    );
  } else {
    tips.push(
      "Student is progressing well. Shift focus to career readiness milestones.",
    );
  }
  return tips;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const { studentId } = await context.params;
    if (!Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
    }

    const connection = await AdvisorStudentConnection.findOne({
      advisorId: guard.userId,
      studentId,
      status: ConnectionStatus.ACCEPTED,
    }).select("_id");

    if (!connection) {
      return NextResponse.json(
        { error: "Student not in your advisees" },
        { status: 403 },
      );
    }

    const [student, profile, departmentCatalog, customItems] =
      await Promise.all([
        User.findById(studentId).select("_id firstName lastName email role"),
        StudentProfile.findOne({ userId: studentId }).select(
          "studentId college department program level year",
        ),
        StudentProfile.findOne({ userId: studentId })
          .select("college department")
          .then((p) =>
            p
              ? DepartmentCatalog.findOne({
                  college: p.college,
                  name: p.department,
                }).select("levels")
              : null,
          ),
        StudentAcademicPlanItem.find({ studentId })
          .sort({ targetDate: 1, createdAt: -1 })
          .select(
            "_id title term targetDate status notes advisorGuidance createdByRole createdAt updatedAt",
          ),
      ]);

    if (!student || student.role !== Role.STUDENT || !profile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 },
      );
    }

    const levels =
      departmentCatalog?.levels && departmentCatalog.levels.length > 0
        ? departmentCatalog.levels
        : ["100", "200", "300", "400"];

    const completed = Number(profile.level?.slice(0, 1) ?? profile.year ?? 1);

    const generatedItems = levels.map((level, index) => {
      const year = Math.max(1, Math.round(Number(level) / 100) || index + 1);
      const isDone = year < completed;
      const isCurrent = year === completed;
      return {
        id: `${profile.studentId}-${level}`,
        level,
        year,
        title: `Academic Year ${year}`,
        status: isDone ? "DONE" : isCurrent ? "IN_PROGRESS" : "UPCOMING",
        focus: isCurrent
          ? "Maintain momentum with advisor-guided actions"
          : "Prepare requirements and milestones",
      };
    });

    const normalizedCustomItems = customItems.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      term: item.term,
      targetDate: item.targetDate ?? null,
      status: item.status,
      notes: item.notes ?? "",
      advisorGuidance: item.advisorGuidance ?? "",
      createdByRole: item.createdByRole,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const doneGenerated = generatedItems.filter(
      (item) => item.status === "DONE",
    ).length;
    const doneCustom = normalizedCustomItems.filter(
      (item) => item.status === "DONE",
    ).length;
    const totalMilestones =
      generatedItems.length + normalizedCustomItems.length;
    const totalDone = doneGenerated + doneCustom;
    const completionRate =
      totalMilestones === 0
        ? 0
        : Math.round((totalDone / totalMilestones) * 100);

    return NextResponse.json(
      {
        metrics: {
          totalMilestones,
          completedMilestones: totalDone,
          completionRate,
          customPlanItems: normalizedCustomItems.length,
        },
        student: {
          id: student._id.toString(),
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        },
        profile: {
          studentId: profile.studentId,
          college: profile.college,
          department: profile.department,
          program: profile.program,
          level: profile.level,
          year: profile.year,
        },
        recommendations: createRecommendations(
          completionRate,
          normalizedCustomItems.length,
        ),
        generatedItems,
        items: normalizedCustomItems,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Advisor Student Academic Plan GET]", error);
    return NextResponse.json(
      { error: "Failed to load student academic plan" },
      { status: 500 },
    );
  }
}
