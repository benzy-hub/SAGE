import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Role, User, initializeModels } from "@/lib/db/models";

export type RoleGuardResult =
  | {
      userId: string;
      role: Role;
      firstName: string;
      lastName: string;
      email: string;
    }
  | { response: NextResponse };

export async function requireRoleUser(
  req: NextRequest,
  roles: Role[],
): Promise<RoleGuardResult> {
  await connectDB();
  initializeModels();

  const authToken = req.cookies.get("auth_token")?.value;
  if (!authToken) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await User.findById(authToken).select(
    "_id role firstName lastName email",
  );
  if (!user) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!roles.includes(user.role)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    userId: user._id.toString(),
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
}
