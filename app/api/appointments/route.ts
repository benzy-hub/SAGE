import { NextRequest, NextResponse } from "next/server";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  AccountStatus,
  AdvisorAvailability,
  AdvisorStudentConnection,
  Appointment,
  AppointmentStatus,
  ConnectionStatus,
  Role,
  User,
  initializeModels,
} from "@/lib/db/models";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT, Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const query =
      guard.role === Role.STUDENT
        ? { studentId: guard.userId }
        : { advisorId: guard.userId };

    const rows = await Appointment.find(query)
      .sort({ scheduledFor: 1 })
      .limit(200)
      .select(
        "advisorId studentId scheduledFor agenda notes status requestedBy",
      );

    const ids = new Set<string>();
    for (const row of rows) {
      ids.add(row.advisorId.toString());
      ids.add(row.studentId.toString());
    }

    const users = await User.find({ _id: { $in: Array.from(ids) } }).select(
      "_id firstName lastName email role status",
    );
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const items = rows.map((row) => {
      const advisor = userMap.get(row.advisorId.toString());
      const student = userMap.get(row.studentId.toString());
      return {
        id: row._id.toString(),
        advisor: advisor
          ? {
              id: advisor._id.toString(),
              firstName: advisor.firstName,
              lastName: advisor.lastName,
              email: advisor.email,
              status: advisor.status,
            }
          : null,
        student: student
          ? {
              id: student._id.toString(),
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              status: student.status,
            }
          : null,
        requestedBy: row.requestedBy.toString(),
        scheduledFor: row.scheduledFor,
        agenda: row.agenda ?? "",
        notes: row.notes ?? "",
        status: row.status,
      };
    });

    const now = new Date();

    return NextResponse.json(
      {
        metrics: {
          total: items.length,
          upcoming: items.filter((item) => new Date(item.scheduledFor) > now)
            .length,
          requested: items.filter(
            (item) => item.status === AppointmentStatus.REQUESTED,
          ).length,
          confirmed: items.filter(
            (item) => item.status === AppointmentStatus.CONFIRMED,
          ).length,
          completed: items.filter(
            (item) => item.status === AppointmentStatus.COMPLETED,
          ).length,
        },
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Appointments GET]", error);
    return NextResponse.json(
      { error: "Failed to load appointments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT, Role.ADVISOR]);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const targetUserId = String(body?.targetUserId ?? "").trim();
    const slotId = String(body?.slotId ?? "").trim();
    const agenda = String(body?.agenda ?? "").trim();

    // If slotId provided, derive scheduledFor from the slot
    let scheduledFor: Date;

    if (slotId) {
      await connectDB();
      initializeModels();
      const slot = await AdvisorAvailability.findById(slotId);
      if (!slot || slot.isBooked) {
        return NextResponse.json(
          { error: "Slot not available" },
          { status: 409 },
        );
      }
      // Compute the next occurrence of this slot's day/time
      const [sh, sm] = slot.startTime.split(":").map(Number);
      if (slot.isRecurring) {
        const now = new Date();
        const dayDiff = (slot.dayOfWeek! - now.getDay() + 7) % 7 || 7;
        const next = new Date(now);
        next.setDate(next.getDate() + dayDiff);
        next.setHours(sh, sm, 0, 0);
        scheduledFor = next;
      } else if (slot.specificDate) {
        scheduledFor = new Date(slot.specificDate);
        scheduledFor.setHours(sh, sm, 0, 0);
      } else {
        return NextResponse.json(
          { error: "Invalid slot configuration" },
          { status: 400 },
        );
      }
    } else {
      scheduledFor = new Date(String(body?.scheduledFor ?? ""));
    }

    if (!targetUserId || Number.isNaN(scheduledFor.getTime())) {
      return NextResponse.json(
        { error: "Valid target user and date are required" },
        { status: 400 },
      );
    }

    if (!slotId && scheduledFor.getTime() <= Date.now() + 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Appointment must be scheduled in the future" },
        { status: 400 },
      );
    }

    const target = await User.findById(targetUserId).select(
      "_id role status isEmailVerified",
    );
    if (!target) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 },
      );
    }

    if (
      target.status !== AccountStatus.ACTIVE ||
      !target.isEmailVerified ||
      target.role === guard.role
    ) {
      return NextResponse.json(
        { error: "Target user is unavailable for appointments" },
        { status: 409 },
      );
    }

    const advisorId =
      guard.role === Role.ADVISOR ? guard.userId : target._id.toString();
    const studentId =
      guard.role === Role.STUDENT ? guard.userId : target._id.toString();

    const connection = await AdvisorStudentConnection.findOne({
      advisorId,
      studentId,
      status: ConnectionStatus.ACCEPTED,
    }).select("_id");

    if (!connection) {
      return NextResponse.json(
        { error: "Accepted advisor-student connection required" },
        { status: 403 },
      );
    }

    const created = await Appointment.create({
      advisorId,
      studentId,
      requestedBy: guard.userId,
      scheduledFor,
      agenda,
      status:
        guard.role === Role.STUDENT
          ? AppointmentStatus.REQUESTED
          : AppointmentStatus.CONFIRMED,
    });

    // Mark slot as booked if slotId was provided
    if (slotId) {
      await AdvisorAvailability.findByIdAndUpdate(slotId, {
        isBooked: true,
        bookedBy: guard.userId,
      });
    }

    return NextResponse.json(
      { success: true, appointmentId: created._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Appointments POST]", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}
