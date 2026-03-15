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

async function getAuthUser(req: NextRequest) {
  await connectDB();
  initializeModels();

  const authToken = req.cookies.get("auth_token")?.value;
  if (!authToken) return null;

  const user = await User.findById(authToken).select(
    "_id role firstName lastName email",
  );
  return user;
}

function canMessageRole(role: string) {
  return role === Role.ADVISOR || role === Role.STUDENT;
}

async function hasAcceptedConnection(
  userA: { _id: Types.ObjectId; role: string },
  userB: { _id: Types.ObjectId; role: string },
) {
  if (userA.role === userB.role) return false;

  const advisorId = userA.role === Role.ADVISOR ? userA._id : userB._id;
  const studentId = userA.role === Role.STUDENT ? userA._id : userB._id;

  const connection = await AdvisorStudentConnection.findOne({
    advisorId,
    studentId,
    status: ConnectionStatus.ACCEPTED,
  }).select("_id");

  return Boolean(connection);
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canMessageRole(currentUser.role)) {
      return NextResponse.json(
        { error: "Messaging is available for advisors and students only" },
        { status: 403 },
      );
    }

    const recipientId = req.nextUrl.searchParams.get("recipientId");
    if (!recipientId || !Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const recipient = await User.findById(recipientId).select("_id role");
    if (
      !recipient ||
      !canMessageRole(recipient.role) ||
      recipient.role === currentUser.role
    ) {
      return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
    }

    const connected = await hasAcceptedConnection(currentUser, recipient);
    if (!connected) {
      return NextResponse.json(
        { error: "Connection required before messaging" },
        { status: 403 },
      );
    }

    const messages = await ChatMessage.find({
      $or: [
        { senderId: currentUser._id, recipientId: recipient._id },
        { senderId: recipient._id, recipientId: currentUser._id },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(500)
      .select("senderId recipientId content readAt createdAt");

    return NextResponse.json(
      {
        messages: messages.map((message) => ({
          id: message._id.toString(),
          senderId: message.senderId.toString(),
          recipientId: message.recipientId.toString(),
          content: message.content,
          readAt: message.readAt ?? null,
          createdAt: message.createdAt,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Messages GET]", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getAuthUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canMessageRole(currentUser.role)) {
      return NextResponse.json(
        { error: "Messaging is available for advisors and students only" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const recipientId = body?.recipientId;
    const content = String(body?.content ?? "").trim();

    if (!recipientId || !Types.ObjectId.isValid(recipientId)) {
      return NextResponse.json(
        { error: "Recipient is required" },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 },
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long" },
        { status: 400 },
      );
    }

    const recipient = await User.findById(recipientId).select("_id role");
    if (
      !recipient ||
      !canMessageRole(recipient.role) ||
      recipient.role === currentUser.role
    ) {
      return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
    }

    const connected = await hasAcceptedConnection(currentUser, recipient);
    if (!connected) {
      return NextResponse.json(
        { error: "Connection required before messaging" },
        { status: 403 },
      );
    }

    const message = await ChatMessage.create({
      senderId: currentUser._id,
      recipientId: recipient._id,
      content,
    });

    const payload = {
      id: message._id.toString(),
      senderId: message.senderId.toString(),
      recipientId: message.recipientId.toString(),
      content: message.content,
      readAt: null,
      createdAt: message.createdAt,
    };

    if (globalThis.__io) {
      globalThis.__io
        .to(`user:${recipient._id.toString()}`)
        .emit("message:new", payload);
      globalThis.__io
        .to(`user:${currentUser._id.toString()}`)
        .emit("message:new", payload);
    }

    return NextResponse.json(
      {
        success: true,
        message: payload,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Messages POST]", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
