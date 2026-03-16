import { NextRequest, NextResponse } from "next/server";
import { parsePagination, requireAdmin } from "@/app/api/admin/_utils";
import {
  AccountStatus,
  AdvisorStudentConnection,
  ConnectionStatus,
  Role,
  User,
} from "@/lib/db/models";
import { hashPassword } from "@/lib/auth/utils";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { page, limit, skip } = parsePagination(req, 12);
    const search = (req.nextUrl.searchParams.get("search") ?? "").trim();

    const baseQuery = {
      role: Role.ADVISOR,
      ...(search
        ? {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const [advisors, total, activeAdvisors] = await Promise.all([
      User.find(baseQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("firstName lastName email status createdAt"),
      User.countDocuments(baseQuery),
      User.countDocuments({ role: Role.ADVISOR, status: AccountStatus.ACTIVE }),
    ]);

    const advisorIds = advisors.map((advisor) => advisor._id);

    const [acceptedCounts, pendingCounts] = await Promise.all([
      AdvisorStudentConnection.aggregate([
        {
          $match: {
            advisorId: { $in: advisorIds },
            status: ConnectionStatus.ACCEPTED,
          },
        },
        { $group: { _id: "$advisorId", count: { $sum: 1 } } },
      ]),
      AdvisorStudentConnection.aggregate([
        {
          $match: {
            advisorId: { $in: advisorIds },
            status: ConnectionStatus.PENDING,
          },
        },
        { $group: { _id: "$advisorId", count: { $sum: 1 } } },
      ]),
    ]);

    const acceptedMap = new Map(
      acceptedCounts.map((row) => [row._id.toString(), row.count]),
    );
    const pendingMap = new Map(
      pendingCounts.map((row) => [row._id.toString(), row.count]),
    );

    return NextResponse.json(
      {
        metrics: {
          totalAdvisors: total,
          activeAdvisors,
          utilizationRate:
            total === 0 ? 0 : Math.round((activeAdvisors / total) * 100),
        },
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        items: advisors.map((advisor) => {
          const advisorId = advisor._id.toString();
          const activeAdvisees = Number(acceptedMap.get(advisorId) ?? 0);
          const pendingRequests = Number(pendingMap.get(advisorId) ?? 0);
          return {
            id: advisorId,
            firstName: advisor.firstName,
            lastName: advisor.lastName,
            email: advisor.email,
            status: advisor.status,
            createdAt: advisor.createdAt,
            activeAdvisees,
            pendingRequests,
          };
        }),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Advisors GET]", error);
    return NextResponse.json(
      { error: "Failed to load advisors" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "").trim();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const created = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: Role.ADVISOR,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: created._id.toString(),
          firstName: created.firstName,
          lastName: created.lastName,
          email: created.email,
          status: created.status,
          createdAt: created.createdAt,
          activeAdvisees: 0,
          pendingRequests: 0,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Admin Advisors POST]", error);
    return NextResponse.json(
      { error: "Failed to create advisor" },
      { status: 500 },
    );
  }
}
