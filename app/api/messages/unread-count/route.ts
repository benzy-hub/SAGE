import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ChatMessage, Role, User, initializeModels } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const authToken = req.cookies.get("auth_token")?.value;
    if (!authToken) {
      return NextResponse.json({ unreadCount: 0 }, { status: 200 });
    }

    const currentUser = await User.findById(authToken).select("_id role");
    if (
      !currentUser ||
      ![Role.ADVISOR, Role.STUDENT].includes(currentUser.role)
    ) {
      return NextResponse.json({ unreadCount: 0 }, { status: 200 });
    }

    const unreadCount = await ChatMessage.countDocuments({
      recipientId: currentUser._id,
      readAt: null,
    });

    return NextResponse.json({ unreadCount }, { status: 200 });
  } catch (error) {
    console.error("[Messages Unread Count GET]", error);
    return NextResponse.json({ unreadCount: 0 }, { status: 200 });
  }
}
