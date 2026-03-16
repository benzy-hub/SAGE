import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Role, User, initializeModels } from "@/lib/db/models";

export type AdminGuardResult =
  | { adminId: string; adminName: string }
  | { response: NextResponse };

export async function requireAdmin(
  req: NextRequest,
): Promise<AdminGuardResult> {
  await connectDB();
  initializeModels();

  const authToken = req.cookies.get("auth_token")?.value;
  if (!authToken) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const admin = await User.findById(authToken).select(
    "_id role firstName lastName",
  );
  if (!admin) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (admin.role !== Role.ADMIN) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    adminId: admin._id.toString(),
    adminName: `${admin.firstName} ${admin.lastName}`,
  };
}

export function parsePagination(req: NextRequest, fallbackLimit = 20) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(
    100,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? fallbackLimit)),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
