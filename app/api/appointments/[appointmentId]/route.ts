import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import { Appointment, AppointmentStatus, Role } from "@/lib/db/models";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT, Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const { appointmentId } = await context.params;
    if (!Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { error: "Invalid appointment id" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 },
      );
    }

    const isAdvisor = appointment.advisorId.toString() === guard.userId;
    const isStudent = appointment.studentId.toString() === guard.userId;
    if (!isAdvisor && !isStudent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const nextStatus = String(body?.status ?? "")
      .trim()
      .toUpperCase();
    const nextAgenda = String(body?.agenda ?? "").trim();
    const nextNotes = String(body?.notes ?? "").trim();
    const nextScheduledForRaw = String(body?.scheduledFor ?? "").trim();
    const agendaProvided = Object.prototype.hasOwnProperty.call(body, "agenda");
    const notesProvided = Object.prototype.hasOwnProperty.call(body, "notes");

    if (nextStatus) {
      if (
        !Object.values(AppointmentStatus).includes(
          nextStatus as AppointmentStatus,
        )
      ) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const status = nextStatus as AppointmentStatus;
      if (isStudent && ![AppointmentStatus.CANCELLED].includes(status)) {
        return NextResponse.json(
          { error: "Students can only cancel appointments" },
          { status: 403 },
        );
      }

      if (
        isAdvisor &&
        ![
          AppointmentStatus.CONFIRMED,
          AppointmentStatus.COMPLETED,
          AppointmentStatus.CANCELLED,
        ].includes(status)
      ) {
        return NextResponse.json(
          { error: "Advisors can confirm, complete, or cancel appointments" },
          { status: 403 },
        );
      }

      appointment.status = status;
    }

    if (isAdvisor && nextScheduledForRaw) {
      const nextScheduledFor = new Date(nextScheduledForRaw);
      if (Number.isNaN(nextScheduledFor.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduled date" },
          { status: 400 },
        );
      }
      appointment.scheduledFor = nextScheduledFor;
    }

    if (agendaProvided) appointment.agenda = nextAgenda;
    if (isAdvisor && notesProvided) appointment.notes = nextNotes;

    await appointment.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Appointments PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 },
    );
  }
}
