import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, initializeModels } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const authToken = req.cookies.get("auth_token")?.value;

    if (!authToken) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const user = await User.findById(authToken);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Auth Me] Error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Failed to fetch session" },
      { status: 500 },
    );
  }
}
