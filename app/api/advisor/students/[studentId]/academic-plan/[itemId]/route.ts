import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  AdvisorStudentConnection,
  ConnectionStatus,
  Role,
  StudentAcademicPlanItem,
} from "@/lib/db/models";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ studentId: string; itemId: string }> },
) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const { studentId, itemId } = await context.params;
    if (!Types.ObjectId.isValid(studentId) || !Types.ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { error: "Invalid studentId or itemId" },
        { status: 400 },
      );
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

    const body = await req.json();
    const advisorGuidance = String(body?.advisorGuidance ?? "").trim();

    const item = await StudentAcademicPlanItem.findOne({
      _id: itemId,
      studentId,
    });

    if (!item) {
      return NextResponse.json(
        { error: "Plan item not found" },
        { status: 404 },
      );
    }

    item.advisorGuidance = advisorGuidance;
    await item.save();

    return NextResponse.json(
      {
        success: true,
        item: {
          id: item._id.toString(),
          advisorGuidance: item.advisorGuidance ?? "",
          updatedAt: item.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Advisor Student Academic Plan PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update advisor guidance" },
      { status: 500 },
    );
  }
}
