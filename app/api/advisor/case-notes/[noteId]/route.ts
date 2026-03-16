import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import { CaseNote, Role } from "@/lib/db/models";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ noteId: string }> },
) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const { noteId } = await context.params;
    if (!Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid note id" }, { status: 400 });
    }

    const note = await CaseNote.findById(noteId);
    if (!note || note.advisorId.toString() !== guard.userId) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const content = String(body?.content ?? "").trim();
    const tags = Array.isArray(body?.tags)
      ? body.tags
          .filter((tag: unknown) => typeof tag === "string")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0)
      : [];

    if (title) note.title = title;
    if (content) note.content = content;
    note.tags = tags;

    await note.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Advisor Case Note PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update case note" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ noteId: string }> },
) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const { noteId } = await context.params;
    if (!Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid note id" }, { status: 400 });
    }

    await CaseNote.deleteOne({ _id: noteId, advisorId: guard.userId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Advisor Case Note DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete case note" },
      { status: 500 },
    );
  }
}
