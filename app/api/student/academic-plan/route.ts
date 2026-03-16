import { NextRequest, NextResponse } from "next/server";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  DepartmentCatalog,
  Role,
  StudentAcademicPlanItem,
  StudentProfile,
} from "@/lib/db/models";

type PlanStatus = "TODO" | "IN_PROGRESS" | "DONE";

function normalizeStatus(raw: unknown): PlanStatus {
  const value = String(raw ?? "TODO").toUpperCase();
  if (value === "IN_PROGRESS") return "IN_PROGRESS";
  if (value === "DONE") return "DONE";
  return "TODO";
}

function createRecommendations(completionRate: number, planItems: number) {
  const tips: string[] = [];
  if (planItems === 0) {
    tips.push("Create your first plan item for this semester.");
  }
  if (completionRate < 40) {
    tips.push("Prioritize one high-impact milestone this week.");
    tips.push("Schedule an advisor check-in to de-risk your next term.");
  } else if (completionRate < 70) {
    tips.push("Move one TODO item to IN_PROGRESS before the week ends.");
    tips.push("Review your target dates and remove unrealistic deadlines.");
  } else {
    tips.push("You are progressing well — plan internship/career milestones.");
  }
  return tips;
}

export async function GET(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT]);
    if ("response" in guard) return guard.response;

    const profile = await StudentProfile.findOne({
      userId: guard.userId,
    }).select("studentId college department program level year");

    if (!profile) {
      return NextResponse.json(
        {
          metrics: {
            totalMilestones: 0,
            completedMilestones: 0,
            completionRate: 0,
            customPlanItems: 0,
          },
          recommendations: [
            "Complete your student profile to unlock plan tools.",
          ],
          generatedItems: [],
          items: [],
        },
        { status: 200 },
      );
    }

    const departmentCatalog = await DepartmentCatalog.findOne({
      college: profile.college,
      name: profile.department,
    }).select("levels");

    const levels =
      departmentCatalog?.levels && departmentCatalog.levels.length > 0
        ? departmentCatalog.levels
        : ["100", "200", "300", "400"];

    const completed = Number(profile.level?.slice(0, 1) ?? profile.year ?? 1);

    const items = levels.map((level, index) => {
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

    const completedMilestones = items.filter(
      (item) => item.status === "DONE",
    ).length;

    const customItems = await StudentAcademicPlanItem.find({
      studentId: guard.userId,
    })
      .sort({ targetDate: 1, createdAt: -1 })
      .select(
        "_id title term targetDate status notes advisorGuidance createdByRole createdAt updatedAt",
      );

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

    const doneCustom = normalizedCustomItems.filter(
      (item) => item.status === "DONE",
    ).length;
    const totalMilestones = items.length + normalizedCustomItems.length;
    const totalDone = completedMilestones + doneCustom;
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
        generatedItems: items,
        items: normalizedCustomItems,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Student Academic Plan GET]", error);
    return NextResponse.json(
      { error: "Failed to load academic plan" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT]);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const term = String(body?.term ?? "").trim();
    const notes = String(body?.notes ?? "").trim();
    const advisorGuidance = String(body?.advisorGuidance ?? "").trim();
    const status = normalizeStatus(body?.status);
    const targetDateRaw = String(body?.targetDate ?? "").trim();

    if (!title || !term) {
      return NextResponse.json(
        { error: "title and term are required" },
        { status: 400 },
      );
    }

    const targetDate = targetDateRaw ? new Date(targetDateRaw) : undefined;
    if (targetDateRaw && Number.isNaN(targetDate?.getTime())) {
      return NextResponse.json(
        { error: "Invalid targetDate" },
        { status: 400 },
      );
    }

    const created = await StudentAcademicPlanItem.create({
      studentId: guard.userId,
      createdByRole: Role.STUDENT,
      title,
      term,
      targetDate,
      status,
      notes,
      advisorGuidance,
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: created._id.toString(),
          title: created.title,
          term: created.term,
          targetDate: created.targetDate ?? null,
          status: created.status,
          notes: created.notes ?? "",
          advisorGuidance: created.advisorGuidance ?? "",
          createdByRole: created.createdByRole,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Student Academic Plan POST]", error);
    return NextResponse.json(
      { error: "Failed to create academic plan item" },
      { status: 500 },
    );
  }
}
