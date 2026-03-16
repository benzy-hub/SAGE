import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
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
      "No custom plan items found. Encourage advisor and student to define concrete milestones.",
    );
  }
  if (completionRate < 40) {
    tips.push(
      "This student may require intervention and higher advising frequency.",
    );
  } else if (completionRate < 70) {
    tips.push(
      "Progress is moderate. Recommend closer follow-up on timeline-sensitive items.",
    );
  } else {
    tips.push(
      "Progress is strong. Promote career and graduation readiness milestones.",
    );
  }
  return tips;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { studentId } = await context.params;
    if (!Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
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
    console.error("[Admin Student Academic Plan GET]", error);
    return NextResponse.json(
      { error: "Failed to load student academic plan" },
      { status: 500 },
    );
  }
}
