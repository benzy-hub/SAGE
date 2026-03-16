import { NextRequest, NextResponse } from "next/server";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import {
  AdvisorStudentConnection,
  Appointment,
  AppointmentStatus,
  ConnectionStatus,
  Role,
  StudentProfile,
} from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireRoleUser(req, [Role.STUDENT]);
    if ("response" in guard) return guard.response;

    const [profile, connections, appointments] = await Promise.all([
      StudentProfile.findOne({ userId: guard.userId }).select(
        "studentId college department level year",
      ),
      AdvisorStudentConnection.find({ studentId: guard.userId }).select(
        "status",
      ),
      Appointment.find({ studentId: guard.userId }).select(
        "status scheduledFor",
      ),
    ]);

    const currentYear = Math.max(1, Number(profile?.year ?? 1));
    const programDuration = Number(
      profile?.level?.startsWith("5")
        ? 5
        : profile?.level?.startsWith("6")
          ? 6
          : 4,
    );

    const completionRate = Math.min(
      100,
      Math.round((currentYear / Math.max(1, programDuration)) * 100),
    );

    const acceptedConnections = connections.filter(
      (connection) => connection.status === ConnectionStatus.ACCEPTED,
    ).length;

    const upcomingAppointments = appointments.filter(
      (appointment) =>
        appointment.status !== AppointmentStatus.CANCELLED &&
        new Date(appointment.scheduledFor).getTime() > Date.now(),
    ).length;

    const completedAppointments = appointments.filter(
      (appointment) => appointment.status === AppointmentStatus.COMPLETED,
    ).length;

    const milestones = [
      {
        id: "profile",
        title: "Profile mapped",
        status: profile ? "DONE" : "PENDING",
      },
      {
        id: "connection",
        title: "Advisor connected",
        status: acceptedConnections > 0 ? "DONE" : "PENDING",
      },
      {
        id: "appointments",
        title: "Completed at least one advising session",
        status: completedAppointments > 0 ? "DONE" : "PENDING",
      },
      {
        id: "progress",
        title: `Progress year ${currentYear}/${programDuration}`,
        status: "DONE",
      },
    ];

    return NextResponse.json(
      {
        metrics: {
          completionRate,
          currentYear,
          programDuration,
          advisorConnections: acceptedConnections,
          upcomingAppointments,
          completedAppointments,
        },
        milestones,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Student Progress GET]", error);
    return NextResponse.json(
      { error: "Failed to load progress" },
      { status: 500 },
    );
  }
}
