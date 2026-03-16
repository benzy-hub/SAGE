import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Role, StudentProfile, User, initializeModels } from "@/lib/db/models";

async function getCurrentUser(req: NextRequest) {
  await connectDB();
  initializeModels();

  const authToken = req.cookies.get("auth_token")?.value;
  if (!authToken) return null;

  const user = await User.findById(authToken).select(
    "_id firstName lastName email role status",
  );
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile =
      user.role === Role.STUDENT
        ? await StudentProfile.findOne({ userId: user._id }).select(
            "studentId college department program level year phone",
          )
        : null;

    return NextResponse.json(
      {
        item: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
          phone: profile?.phone ?? "",
          studentId: profile?.studentId ?? null,
          college: profile?.college ?? null,
          department: profile?.department ?? null,
          level: profile?.level ?? null,
          year: profile?.year ?? null,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Me Profile GET]", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const phone = String(body?.phone ?? "").trim();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name and email are required" },
        { status: 400 },
      );
    }

    if (email !== user.email) {
      const exists = await User.findOne({ email }).select("_id");
      if (exists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 },
        );
      }
      user.email = email;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();

    if (user.role === Role.STUDENT) {
      await StudentProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: { phone } },
        { upsert: true },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Me Profile PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
