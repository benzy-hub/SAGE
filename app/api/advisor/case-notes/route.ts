import { NextRequest, NextResponse } from "next/server";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  AdvisorStudentConnection,
  CaseNote,
  ConnectionStatus,
  Role,
  User,
} from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const studentId = String(
      req.nextUrl.searchParams.get("studentId") ?? "",
    ).trim();

    const query = {
      advisorId: guard.userId,
      ...(studentId ? { studentId } : {}),
    };

    const notes = await CaseNote.find(query)
      .sort({ updatedAt: -1 })
      .limit(200)
      .select("advisorId studentId title content tags createdAt updatedAt");

    const studentIds = Array.from(
      new Set(notes.map((note) => note.studentId.toString())),
    );
    const students = await User.find({
      _id: { $in: studentIds },
      role: Role.STUDENT,
    }).select("_id firstName lastName email");
    const studentMap = new Map(students.map((s) => [s._id.toString(), s]));

    const items = notes.map((note) => {
      const student = studentMap.get(note.studentId.toString());
      return {
        id: note._id.toString(),
        title: note.title,
        content: note.content,
        tags: note.tags ?? [],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        student: student
          ? {
              id: student._id.toString(),
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
            }
          : null,
      };
    });

    return NextResponse.json(
      {
        metrics: {
          totalNotes: items.length,
          studentsCovered: new Set(
            items.map((item) => item.student?.id).filter(Boolean),
          ).size,
        },
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Advisor Case Notes GET]", error);
    return NextResponse.json(
      { error: "Failed to load case notes" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const studentId = String(body?.studentId ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const content = String(body?.content ?? "").trim();
    const tags = Array.isArray(body?.tags)
      ? body.tags
          .filter((tag: unknown) => typeof tag === "string")
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0)
      : [];

    if (!studentId || !title || !content) {
      return NextResponse.json(
        { error: "Student, title and content are required" },
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
        { error: "You can only create notes for accepted advisees" },
        { status: 403 },
      );
    }

    const created = await CaseNote.create({
      advisorId: guard.userId,
      studentId,
      title,
      content,
      tags,
    });

    return NextResponse.json(
      { success: true, noteId: created._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Advisor Case Notes POST]", error);
    return NextResponse.json(
      { error: "Failed to create case note" },
      { status: 500 },
    );
  }
}
