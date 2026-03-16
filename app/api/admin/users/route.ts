import { NextRequest, NextResponse } from "next/server";
import { parsePagination, requireAdmin } from "@/app/api/admin/_utils";
import { AccountStatus, Role, StudentProfile, User } from "@/lib/db/models";
import { hashPassword } from "@/lib/auth/utils";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { page, limit, skip } = parsePagination(req, 15);
    const search = (req.nextUrl.searchParams.get("search") ?? "").trim();
    const role = (req.nextUrl.searchParams.get("role") ?? "ALL").toUpperCase();
    const status = (
      req.nextUrl.searchParams.get("status") ?? "ALL"
    ).toUpperCase();

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (Object.values(Role).includes(role as Role)) {
      query.role = role;
    }

    if (Object.values(AccountStatus).includes(status as AccountStatus)) {
      query.status = status;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "firstName lastName email role status isEmailVerified createdAt lastLoginAt",
        ),
      User.countDocuments(query),
    ]);

    const studentUserIds = users
      .filter((user) => user.role === Role.STUDENT)
      .map((user) => user._id);

    const profiles = await StudentProfile.find({
      userId: { $in: studentUserIds },
    }).select("userId studentId college department program level year");

    const profileMap = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );

    return NextResponse.json(
      {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        items: users.map((user) => ({
          ...(profileMap.has(user._id.toString())
            ? {
                studentId:
                  profileMap.get(user._id.toString())?.studentId ?? null,
                college: profileMap.get(user._id.toString())?.college ?? null,
                department:
                  profileMap.get(user._id.toString())?.department ?? null,
                program: profileMap.get(user._id.toString())?.program ?? null,
                level: profileMap.get(user._id.toString())?.level ?? null,
                year: profileMap.get(user._id.toString())?.year ?? null,
              }
            : {
                studentId: null,
                college: null,
                department: null,
                program: null,
                level: null,
                year: null,
              }),
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt ?? null,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Users GET]", error);
    return NextResponse.json(
      { error: "Failed to load users" },
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
    const role = String(body?.role ?? "").toUpperCase() as Role;
    const status = String(
      body?.status ?? AccountStatus.ACTIVE,
    ).toUpperCase() as AccountStatus;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!Object.values(AccountStatus).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

    const createdUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      status,
      isEmailVerified: true,
    });

    if (role === Role.STUDENT) {
      const studentId = String(body?.studentId ?? "")
        .trim()
        .toUpperCase();
      if (!studentId) {
        await User.deleteOne({ _id: createdUser._id });
        return NextResponse.json(
          { error: "Student matric is required" },
          { status: 400 },
        );
      }

      const existingMatric = await StudentProfile.findOne({ studentId }).select(
        "_id",
      );
      if (existingMatric) {
        await User.deleteOne({ _id: createdUser._id });
        return NextResponse.json(
          { error: "Student matric already exists" },
          { status: 409 },
        );
      }

      await StudentProfile.create({
        userId: createdUser._id,
        studentId,
        college: String(body?.college ?? "").trim(),
        department: String(body?.department ?? "").trim(),
        program: String(body?.program ?? "").trim(),
        level: String(body?.level ?? "").trim(),
        year: Math.max(1, Number(body?.year ?? 1)),
      });
    }

    return NextResponse.json(
      {
        success: true,
        item: {
          id: createdUser._id.toString(),
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          role: createdUser.role,
          status: createdUser.status,
          createdAt: createdUser.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Admin Users POST]", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
