import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import {
  AdvisorStudentConnection,
  ChatMessage,
  ConnectionStatus,
  Role,
  User,
  initializeModels,
} from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    initializeModels();

    const authToken = req.cookies.get("auth_token")?.value;
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(authToken).select("_id role");
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (![Role.ADVISOR, Role.STUDENT].includes(currentUser.role)) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const body = await req.json();
    const senderId = body?.senderId;

    if (!senderId || !Types.ObjectId.isValid(senderId)) {
      return NextResponse.json(
        { error: "senderId is required" },
        { status: 400 },
      );
    }

    const sender = await User.findById(senderId).select("_id role");
    if (!sender || sender.role === currentUser.role) {
      return NextResponse.json({ error: "Invalid sender" }, { status: 400 });
    }

    const advisorId =
      currentUser.role === Role.ADVISOR ? currentUser._id : sender._id;
    const studentId =
      currentUser.role === Role.STUDENT ? currentUser._id : sender._id;

    const connection = await AdvisorStudentConnection.findOne({
      advisorId,
      studentId,
      status: ConnectionStatus.ACCEPTED,
    }).select("_id");

    if (!connection) {
      return NextResponse.json(
        { error: "Connection required before messaging" },
        { status: 403 },
      );
    }

    await ChatMessage.updateMany(
      {
        senderId,
        recipientId: currentUser._id,
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      },
    );

    if (globalThis.__io) {
      globalThis.__io.to(`user:${sender._id.toString()}`).emit("message:read", {
        fromUserId: currentUser._id.toString(),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Messages Mark Read POST]", error);
    return NextResponse.json(
      { error: "Failed to update read state" },
      { status: 500 },
    );
  }
}
