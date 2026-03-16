import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { Role, User } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const [students, advisors, admins] = await Promise.all([
      User.countDocuments({ role: Role.STUDENT }),
      User.countDocuments({ role: Role.ADVISOR }),
      User.countDocuments({ role: Role.ADMIN }),
    ]);

    const templates = [
      {
        id: "appointment-reminder",
        title: "Appointment reminder",
        audience: "Students and advisors",
        channel: "Email and in-app",
      },
      {
        id: "verification-followup",
        title: "Verification follow-up",
        audience: "Pending users",
        channel: "Email",
      },
      {
        id: "system-update",
        title: "System update",
        audience: "All users",
        channel: "In-app",
      },
    ];

    return NextResponse.json(
      {
        metrics: {
          eligibleRecipients: students + advisors + admins,
          students,
          advisors,
          admins,
          templates: templates.length,
        },
        templates,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Notifications GET]", error);
    return NextResponse.json(
      { error: "Failed to load notifications data" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const message = String(body?.message ?? "").trim();
    const audience = String(body?.audience ?? "ALL").toUpperCase();

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 },
      );
    }

    if (title.length > 120 || message.length > 1500) {
      return NextResponse.json(
        { error: "Message payload is too long" },
        { status: 400 },
      );
    }

    const allowedAudiences = ["ALL", "STUDENT", "ADVISOR", "ADMIN"];
    if (!allowedAudiences.includes(audience)) {
      return NextResponse.json({ error: "Invalid audience" }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        dispatch: {
          id: `${Date.now()}`,
          title,
          message,
          audience,
          sentBy: guard.adminName,
          createdAt: new Date(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Admin Notifications POST]", error);
    return NextResponse.json(
      { error: "Failed to dispatch notification" },
      { status: 500 },
    );
  }
}
