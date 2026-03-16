import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import {
  AccountStatus,
  AdvisorStudentConnection,
  ConnectionStatus,
  Role,
  User,
  initializeModels,
} from "@/lib/db/models";
import { connectDB } from "@/lib/db";

async function getCurrentUser(req: NextRequest) {
  await connectDB();
  initializeModels();

  const authToken = req.cookies.get("auth_token")?.value;
  if (!authToken) return null;

  return User.findById(authToken).select("_id role firstName lastName email");
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (![Role.ADVISOR, Role.STUDENT].includes(currentUser.role)) {
      return NextResponse.json(
        {
          connectedContacts: [],
          incomingRequests: [],
          outgoingRequests: [],
          availableAdvisors: [],
        },
        { status: 200 },
      );
    }

    if (currentUser.role === Role.STUDENT) {
      const [connected, outgoingPending, incomingPending, availableAdvisors] =
        await Promise.all([
          AdvisorStudentConnection.find({
            studentId: currentUser._id,
            status: ConnectionStatus.ACCEPTED,
          }).select("_id advisorId"),
          AdvisorStudentConnection.find({
            studentId: currentUser._id,
            status: ConnectionStatus.PENDING,
            requestedBy: currentUser._id,
          }).select("_id advisorId"),
          AdvisorStudentConnection.find({
            studentId: currentUser._id,
            status: ConnectionStatus.PENDING,
            requestedBy: { $ne: currentUser._id },
          }).select("_id advisorId"),
          User.find({
            role: Role.ADVISOR,
            isEmailVerified: true,
            status: AccountStatus.ACTIVE,
          }).select("_id firstName lastName email role"),
        ]);

      const advisorIds = Array.from(
        new Set(
          [...connected, ...outgoingPending, ...incomingPending].map((item) =>
            item.advisorId.toString(),
          ),
        ),
      );

      const advisorUsers = await User.find({ _id: { $in: advisorIds } }).select(
        "_id firstName lastName email role",
      );

      const advisorMap = new Map(
        advisorUsers.map((advisor) => [advisor._id.toString(), advisor]),
      );

      const blockedAdvisorIds = new Set(
        [...connected, ...outgoingPending, ...incomingPending].map((item) =>
          item.advisorId.toString(),
        ),
      );

      return NextResponse.json(
        {
          connectedContacts: connected
            .map((item) => {
              const advisor = advisorMap.get(item.advisorId.toString());
              if (!advisor) return null;
              return {
                id: advisor._id.toString(),
                firstName: advisor.firstName,
                lastName: advisor.lastName,
                email: advisor.email,
                role: advisor.role,
                connectionId: item._id.toString(),
              };
            })
            .filter(Boolean),
          outgoingRequests: outgoingPending
            .map((item) => {
              const advisor = advisorMap.get(item.advisorId.toString());
              if (!advisor) return null;
              return {
                id: item._id.toString(),
                target: {
                  id: advisor._id.toString(),
                  firstName: advisor.firstName,
                  lastName: advisor.lastName,
                  email: advisor.email,
                  role: advisor.role,
                },
              };
            })
            .filter(Boolean),
          incomingRequests: incomingPending
            .map((item) => {
              const advisor = advisorMap.get(item.advisorId.toString());
              if (!advisor) return null;
              return {
                id: item._id.toString(),
                from: {
                  id: advisor._id.toString(),
                  firstName: advisor.firstName,
                  lastName: advisor.lastName,
                  email: advisor.email,
                  role: advisor.role,
                },
              };
            })
            .filter(Boolean),
          availableAdvisors: availableAdvisors
            .filter((advisor) => !blockedAdvisorIds.has(advisor._id.toString()))
            .map((advisor) => ({
              id: advisor._id.toString(),
              firstName: advisor.firstName,
              lastName: advisor.lastName,
              email: advisor.email,
              role: advisor.role,
            })),
        },
        { status: 200 },
      );
    }

    const [connected, incomingPending, outgoingPending] = await Promise.all([
      AdvisorStudentConnection.find({
        advisorId: currentUser._id,
        status: ConnectionStatus.ACCEPTED,
      }).select("_id studentId"),
      AdvisorStudentConnection.find({
        advisorId: currentUser._id,
        status: ConnectionStatus.PENDING,
        requestedBy: { $ne: currentUser._id },
      }).select("_id studentId"),
      AdvisorStudentConnection.find({
        advisorId: currentUser._id,
        status: ConnectionStatus.PENDING,
        requestedBy: currentUser._id,
      }).select("_id studentId"),
    ]);

    const studentIds = Array.from(
      new Set(
        [...connected, ...incomingPending, ...outgoingPending].map((item) =>
          item.studentId.toString(),
        ),
      ),
    );

    const studentUsers = await User.find({ _id: { $in: studentIds } }).select(
      "_id firstName lastName email role",
    );

    const studentMap = new Map(
      studentUsers.map((student) => [student._id.toString(), student]),
    );

    return NextResponse.json(
      {
        connectedContacts: connected
          .map((item) => {
            const student = studentMap.get(item.studentId.toString());
            if (!student) return null;
            return {
              id: student._id.toString(),
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
              role: student.role,
              connectionId: item._id.toString(),
            };
          })
          .filter(Boolean),
        incomingRequests: incomingPending
          .map((item) => {
            const student = studentMap.get(item.studentId.toString());
            if (!student) return null;
            return {
              id: item._id.toString(),
              from: {
                id: student._id.toString(),
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                role: student.role,
              },
            };
          })
          .filter(Boolean),
        outgoingRequests: outgoingPending
          .map((item) => {
            const student = studentMap.get(item.studentId.toString());
            if (!student) return null;
            return {
              id: item._id.toString(),
              target: {
                id: student._id.toString(),
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                role: student.role,
              },
            };
          })
          .filter(Boolean),
        availableAdvisors: [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Connections GET]", error);
    return NextResponse.json(
      { error: "Failed to load connections" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (![Role.ADVISOR, Role.STUDENT].includes(currentUser.role)) {
      return NextResponse.json(
        { error: "Connections are available for advisors and students only" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const targetId = body?.targetId;

    if (!targetId || !Types.ObjectId.isValid(targetId)) {
      return NextResponse.json(
        { error: "targetId is required" },
        { status: 400 },
      );
    }

    const targetUser = await User.findById(targetId).select(
      "_id role status isEmailVerified",
    );
    if (
      !targetUser ||
      targetUser._id.toString() === currentUser._id.toString()
    ) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }

    if (currentUser.role === targetUser.role) {
      return NextResponse.json(
        { error: "Connections must be between advisor and student" },
        { status: 400 },
      );
    }

    if (
      targetUser.status !== AccountStatus.ACTIVE ||
      !targetUser.isEmailVerified
    ) {
      return NextResponse.json(
        { error: "Target account is not available for connections" },
        { status: 409 },
      );
    }

    const advisorId =
      currentUser.role === Role.ADVISOR ? currentUser._id : targetUser._id;
    const studentId =
      currentUser.role === Role.STUDENT ? currentUser._id : targetUser._id;

    const existing = await AdvisorStudentConnection.findOne({
      advisorId,
      studentId,
    });

    if (existing?.status === ConnectionStatus.ACCEPTED) {
      return NextResponse.json(
        {
          success: true,
          alreadyConnected: true,
          connectionId: existing._id.toString(),
        },
        { status: 200 },
      );
    }

    if (existing?.status === ConnectionStatus.PENDING) {
      return NextResponse.json(
        { success: true, pending: true, connectionId: existing._id.toString() },
        { status: 200 },
      );
    }

    let connection;
    if (existing?.status === ConnectionStatus.REJECTED) {
      existing.status = ConnectionStatus.PENDING;
      existing.requestedBy = currentUser._id;
      existing.acceptedAt = undefined;
      await existing.save();
      connection = existing;
    } else {
      connection = await AdvisorStudentConnection.create({
        advisorId,
        studentId,
        requestedBy: currentUser._id,
        status: ConnectionStatus.PENDING,
      });
    }

    if (globalThis.__io) {
      globalThis.__io
        .to(`user:${advisorId.toString()}`)
        .emit("connection:updated", {
          connectionId: connection._id.toString(),
        });
      globalThis.__io
        .to(`user:${studentId.toString()}`)
        .emit("connection:updated", {
          connectionId: connection._id.toString(),
        });
    }

    return NextResponse.json(
      { success: true, pending: true, connectionId: connection._id.toString() },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Connections POST]", error);
    return NextResponse.json(
      { error: "Failed to create connection request" },
      { status: 500 },
    );
  }
}
