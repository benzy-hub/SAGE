import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import { Role, StudentAcademicPlanItem } from "@/lib/db/models";

type PlanStatus = "TODO" | "IN_PROGRESS" | "DONE";

function normalizeStatus(raw: unknown): PlanStatus {
  const value = String(raw ?? "TODO").toUpperCase();
  if (value === "IN_PROGRESS") return "IN_PROGRESS";
  if (value === "DONE") return "DONE";
  return "TODO";
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT]);
    if ("response" in guard) return guard.response;

    const { itemId } = await context.params;
    if (!Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }

    const item = await StudentAcademicPlanItem.findOne({
      _id: itemId,
      studentId: guard.userId,
    });

    if (!item) {
      return NextResponse.json(
        { error: "Plan item not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const titleProvided = body?.title !== undefined;
    const termProvided = body?.term !== undefined;
    const statusProvided = body?.status !== undefined;
    const notesProvided = body?.notes !== undefined;
    const targetDateProvided = body?.targetDate !== undefined;
    const guidanceProvided = body?.advisorGuidance !== undefined;

    if (titleProvided) {
      const title = String(body?.title ?? "").trim();
      if (!title) {
        return NextResponse.json(
          { error: "title cannot be empty" },
          { status: 400 },
        );
      }
      item.title = title;
    }

    if (termProvided) {
      const term = String(body?.term ?? "").trim();
      if (!term) {
        return NextResponse.json(
          { error: "term cannot be empty" },
          { status: 400 },
        );
      }
      item.term = term;
    }

    if (statusProvided) {
      item.status = normalizeStatus(body?.status);
    }

    if (notesProvided) {
      item.notes = String(body?.notes ?? "").trim();
    }

    if (guidanceProvided) {
      item.advisorGuidance = String(body?.advisorGuidance ?? "").trim();
    }

    if (targetDateProvided) {
      const raw = String(body?.targetDate ?? "").trim();
      if (!raw) {
        item.targetDate = undefined;
      } else {
        const parsed = new Date(raw);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "Invalid targetDate" },
            { status: 400 },
          );
        }
        item.targetDate = parsed;
      }
    }

    await item.save();

    return NextResponse.json(
      {
        success: true,
        item: {
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
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Student Academic Plan PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update academic plan item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT]);
    if ("response" in guard) return guard.response;

    const { itemId } = await context.params;
    if (!Types.ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });
    }

    const deleted = await StudentAcademicPlanItem.findOneAndDelete({
      _id: itemId,
      studentId: guard.userId,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Plan item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Student Academic Plan DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete academic plan item" },
      { status: 500 },
    );
  }
}
