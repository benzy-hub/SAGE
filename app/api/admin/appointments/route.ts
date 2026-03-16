import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  Appointment,
  AppointmentStatus,
  ChatMessage,
  Role,
  User,
} from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const [appointments, totalMessages, activeAdvisors] = await Promise.all([
      Appointment.find({})
        .sort({ scheduledFor: -1, updatedAt: -1 })
        .limit(200)
        .select(
          "advisorId studentId requestedBy scheduledFor agenda notes status updatedAt createdAt",
        ),
      ChatMessage.countDocuments({}),
      User.countDocuments({ role: Role.ADVISOR }),
    ]);

    const userIds = new Set<string>();
    for (const item of appointments) {
      userIds.add(item.advisorId.toString());
      userIds.add(item.studentId.toString());
      userIds.add(item.requestedBy.toString());
    }

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select(
      "firstName lastName email role",
    );
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const items = appointments.map((item) => {
      const advisor = userMap.get(item.advisorId.toString());
      const student = userMap.get(item.studentId.toString());
      const requester = userMap.get(item.requestedBy.toString());
      return {
        id: item._id.toString(),
        advisorName: advisor
          ? `${advisor.firstName} ${advisor.lastName}`
          : "Unknown advisor",
        advisorEmail: advisor?.email ?? "",
        studentName: student
          ? `${student.firstName} ${student.lastName}`
          : "Unknown student",
        studentEmail: student?.email ?? "",
        requestedBy: requester?.role === Role.ADVISOR ? "Advisor" : "Student",
        scheduledFor: item.scheduledFor,
        agenda: item.agenda ?? "",
        notes: item.notes ?? "",
        status: item.status,
        channel: "Virtual",
        updatedAt: item.updatedAt ?? item.createdAt,
      };
    });

    const metrics = {
      totalTracked: items.length,
      requested: items.filter(
        (item) => item.status === AppointmentStatus.REQUESTED,
      ).length,
      confirmed: items.filter(
        (item) => item.status === AppointmentStatus.CONFIRMED,
      ).length,
      completed: items.filter(
        (item) => item.status === AppointmentStatus.COMPLETED,
      ).length,
      cancelled: items.filter(
        (item) => item.status === AppointmentStatus.CANCELLED,
      ).length,
      activeAdvisors,
      totalMessages,
    };

    return NextResponse.json({ metrics, items }, { status: 200 });
  } catch (error) {
    console.error("[Admin Appointments GET]", error);
    return NextResponse.json(
      { error: "Failed to load appointments" },
      { status: 500 },
    );
  }
}
