import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import {
  AdvisorStudentConnection,
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
    if (
      !currentUser ||
      ![Role.ADVISOR, Role.STUDENT].includes(currentUser.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const connectionId = body?.connectionId;
    const action = body?.action;

    if (!connectionId || !Types.ObjectId.isValid(connectionId)) {
      return NextResponse.json(
        { error: "connectionId is required" },
        { status: 400 },
      );
    }

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "action must be accept or reject" },
        { status: 400 },
      );
    }

    const connection = await AdvisorStudentConnection.findById(
      connectionId,
    ).select("_id advisorId studentId requestedBy status");

    if (!connection || connection.status !== ConnectionStatus.PENDING) {
      return NextResponse.json(
        { error: "Connection request not found" },
        { status: 404 },
      );
    }

    const requestedByCurrent =
      connection.requestedBy.toString() === currentUser._id.toString();
    if (requestedByCurrent) {
      return NextResponse.json(
        { error: "Requester cannot respond to own request" },
        { status: 403 },
      );
    }

    if (
      currentUser._id.toString() !== connection.advisorId.toString() &&
      currentUser._id.toString() !== connection.studentId.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    connection.status =
      action === "accept"
        ? ConnectionStatus.ACCEPTED
        : ConnectionStatus.REJECTED;
    connection.acceptedAt = action === "accept" ? new Date() : undefined;
    await connection.save();

    if (globalThis.__io) {
      globalThis.__io
        .to(`user:${connection.advisorId.toString()}`)
        .emit("connection:updated", {
          connectionId: connection._id.toString(),
        });
      globalThis.__io
        .to(`user:${connection.studentId.toString()}`)
        .emit("connection:updated", {
          connectionId: connection._id.toString(),
        });
    }

    return NextResponse.json(
      { success: true, status: connection.status },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Connections Respond POST]", error);
    return NextResponse.json(
      { error: "Failed to respond to request" },
      { status: 500 },
    );
  }
}
