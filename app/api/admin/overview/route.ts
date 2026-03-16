import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  AccountStatus,
  AdvisorStudentConnection,
  ChatMessage,
  ConnectionStatus,
  Role,
  StudentProfile,
  User,
} from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const [
      totalUsers,
      totalStudents,
      totalAdvisors,
      totalAdmins,
      pendingVerification,
      suspendedUsers,
      totalConnections,
      acceptedConnections,
      totalMessages,
      profilesWithDepartment,
      recentlyJoined,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: Role.STUDENT }),
      User.countDocuments({ role: Role.ADVISOR }),
      User.countDocuments({ role: Role.ADMIN }),
      User.countDocuments({ status: AccountStatus.PENDING_VERIFICATION }),
      User.countDocuments({ status: AccountStatus.SUSPENDED }),
      AdvisorStudentConnection.countDocuments({}),
      AdvisorStudentConnection.countDocuments({
        status: ConnectionStatus.ACCEPTED,
      }),
      ChatMessage.countDocuments({}),
      StudentProfile.countDocuments({
        department: {
          $nin: [null, ""],
        },
      }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("firstName lastName email role status createdAt"),
    ]);

    const activationRate =
      totalUsers === 0
        ? 0
        : Math.round(
            ((totalUsers - pendingVerification - suspendedUsers) / totalUsers) *
              100,
          );

    return NextResponse.json(
      {
        metrics: {
          totalUsers,
          totalStudents,
          totalAdvisors,
          totalAdmins,
          pendingVerification,
          suspendedUsers,
          totalConnections,
          acceptedConnections,
          totalMessages,
          profilesWithDepartment,
          activationRate,
        },
        recentUsers: recentlyJoined.map((user) => ({
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Overview GET]", error);
    return NextResponse.json(
      { error: "Failed to load admin overview" },
      { status: 500 },
    );
  }
}
