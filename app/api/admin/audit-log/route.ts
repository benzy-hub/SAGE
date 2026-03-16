import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  AdvisorStudentConnection,
  ChatMessage,
  Role,
  User,
} from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const [recentUsers, recentConnections, recentMessages] = await Promise.all([
      User.find({})
        .sort({ updatedAt: -1 })
        .limit(20)
        .select("firstName lastName role status updatedAt"),
      AdvisorStudentConnection.find({})
        .sort({ updatedAt: -1 })
        .limit(20)
        .select("status advisorId studentId updatedAt"),
      ChatMessage.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .select("senderId recipientId createdAt"),
    ]);

    const events = [
      ...recentUsers.map((item) => ({
        id: `user-${item._id.toString()}`,
        category: "USER",
        action: `User status reviewed (${item.status})`,
        actor: `${item.firstName} ${item.lastName}`,
        occurredAt: item.updatedAt,
        severity: item.role === Role.ADMIN ? "HIGH" : "MEDIUM",
      })),
      ...recentConnections.map((item) => ({
        id: `connection-${item._id.toString()}`,
        category: "CONNECTION",
        action: `Connection state changed (${item.status})`,
        actor: `Advisor ${item.advisorId.toString().slice(-6)}`,
        occurredAt: item.updatedAt,
        severity: "LOW",
      })),
      ...recentMessages.map((item) => ({
        id: `message-${item._id.toString()}`,
        category: "MESSAGE",
        action: "Message exchanged",
        actor: `Sender ${item.senderId.toString().slice(-6)}`,
        occurredAt: item.createdAt,
        severity: "LOW",
      })),
    ]
      .sort((a, b) => (a.occurredAt > b.occurredAt ? -1 : 1))
      .slice(0, 50);

    return NextResponse.json(
      {
        metrics: {
          totalEvents: events.length,
          highSeverity: events.filter((event) => event.severity === "HIGH")
            .length,
          mediumSeverity: events.filter((event) => event.severity === "MEDIUM")
            .length,
          lowSeverity: events.filter((event) => event.severity === "LOW")
            .length,
        },
        items: events,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Audit GET]", error);
    return NextResponse.json(
      { error: "Failed to load audit events" },
      { status: 500 },
    );
  }
}
