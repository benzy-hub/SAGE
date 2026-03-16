import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { Role, User } from "@/lib/db/models";

function monthKey(input: Date) {
  return `${input.getFullYear()}-${String(input.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("role createdAt status");

    const trendMap = new Map<
      string,
      { students: number; advisors: number; admins: number }
    >();

    for (const user of users) {
      const key = monthKey(user.createdAt);
      if (!trendMap.has(key)) {
        trendMap.set(key, { students: 0, advisors: 0, admins: 0 });
      }
      const row = trendMap.get(key)!;
      if (user.role === Role.STUDENT) row.students += 1;
      if (user.role === Role.ADVISOR) row.advisors += 1;
      if (user.role === Role.ADMIN) row.admins += 1;
    }

    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-12)
      .map(([month, row]) => ({
        month,
        ...row,
        total: row.students + row.advisors + row.admins,
      }));

    const kpis = {
      totalUsers: users.length,
      activeRate:
        users.length === 0
          ? 0
          : Math.round(
              (users.filter((user) => user.status === "ACTIVE").length /
                users.length) *
                100,
            ),
      reportingWindowMonths: trend.length,
      latestMonthTotal: trend.length ? trend[trend.length - 1].total : 0,
    };

    return NextResponse.json({ kpis, trend }, { status: 200 });
  } catch (error) {
    console.error("[Admin Reports GET]", error);
    return NextResponse.json(
      { error: "Failed to load reports" },
      { status: 500 },
    );
  }
}
