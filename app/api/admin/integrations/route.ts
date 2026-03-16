import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const items = [
      {
        id: "email-provider",
        name: "Email provider",
        status: "CONNECTED",
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 18),
        successRate: 99,
      },
      {
        id: "calendar-sync",
        name: "Calendar sync",
        status: "DEGRADED",
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 46),
        successRate: 92,
      },
      {
        id: "analytics-export",
        name: "Analytics export",
        status: "CONNECTED",
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 8),
        successRate: 97,
      },
      {
        id: "backup-pipeline",
        name: "Backup pipeline",
        status: "CONNECTED",
        lastSyncAt: new Date(Date.now() - 1000 * 60 * 3),
        successRate: 100,
      },
    ];

    const connected = items.filter(
      (item) => item.status === "CONNECTED",
    ).length;

    return NextResponse.json(
      {
        metrics: {
          totalIntegrations: items.length,
          connected,
          healthScore: Math.round(
            items.reduce((sum, item) => sum + item.successRate, 0) /
              items.length,
          ),
        },
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Integrations GET]", error);
    return NextResponse.json(
      { error: "Failed to load integrations" },
      { status: 500 },
    );
  }
}
