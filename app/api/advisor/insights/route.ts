import { NextRequest, NextResponse } from "next/server";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  AdvisorStudentConnection,
  Appointment,
  AppointmentStatus,
  CaseNote,
  ChatMessage,
  ConnectionStatus,
  Role,
} from "@/lib/db/models";

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const [connections, appointments, notes, outboundMessages] =
      await Promise.all([
        AdvisorStudentConnection.find({ advisorId: guard.userId }).select(
          "status updatedAt",
        ),
        Appointment.find({ advisorId: guard.userId }).select(
          "status scheduledFor createdAt",
        ),
        CaseNote.find({ advisorId: guard.userId }).select("createdAt"),
        ChatMessage.countDocuments({ senderId: guard.userId }),
      ]);

    const trendMap = new Map<
      string,
      { appointments: number; completed: number; notes: number }
    >();

    for (const appointment of appointments) {
      const key = monthKey(appointment.scheduledFor ?? appointment.createdAt);
      if (!trendMap.has(key)) {
        trendMap.set(key, { appointments: 0, completed: 0, notes: 0 });
      }
      const row = trendMap.get(key);
      if (!row) continue;
      row.appointments += 1;
      if (appointment.status === AppointmentStatus.COMPLETED) {
        row.completed += 1;
      }
    }

    for (const note of notes) {
      const key = monthKey(note.createdAt);
      if (!trendMap.has(key)) {
        trendMap.set(key, { appointments: 0, completed: 0, notes: 0 });
      }
      const row = trendMap.get(key);
      if (!row) continue;
      row.notes += 1;
    }

    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, row]) => ({ month, ...row }));

    const accepted = connections.filter(
      (connection) => connection.status === ConnectionStatus.ACCEPTED,
    ).length;
    const pending = connections.filter(
      (connection) => connection.status === ConnectionStatus.PENDING,
    ).length;

    return NextResponse.json(
      {
        metrics: {
          totalAdvisees: accepted,
          pendingRequests: pending,
          totalAppointments: appointments.length,
          completedAppointments: appointments.filter(
            (appointment) => appointment.status === AppointmentStatus.COMPLETED,
          ).length,
          caseNotes: notes.length,
          messagesSent: outboundMessages,
        },
        trend,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Advisor Insights GET]", error);
    return NextResponse.json(
      { error: "Failed to load advisor insights" },
      { status: 500 },
    );
  }
}
