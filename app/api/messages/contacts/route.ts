import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  AdvisorStudentConnection,
  ChatMessage,
  ConnectionStatus,
  Role,
  User,
  initializeModels,
} from "@/lib/db/models";

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ contacts: [] }, { status: 200 });
    }

    const acceptedConnections =
      currentUser.role === Role.ADVISOR
        ? await AdvisorStudentConnection.find({
            advisorId: currentUser._id,
            status: ConnectionStatus.ACCEPTED,
          }).select("studentId")
        : await AdvisorStudentConnection.find({
            studentId: currentUser._id,
            status: ConnectionStatus.ACCEPTED,
          }).select("advisorId");

    const contactIds =
      currentUser.role === Role.ADVISOR
        ? acceptedConnections.map((item) => item.studentId)
        : acceptedConnections.map((item) => item.advisorId);

    const contacts = await User.find({ _id: { $in: contactIds } })
      .sort({ firstName: 1, lastName: 1 })
      .select("_id firstName lastName email role");

    const unreadCountsRaw = await ChatMessage.aggregate([
      {
        $match: {
          recipientId: currentUser._id,
          senderId: { $in: contactIds },
          readAt: null,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = new Map(
      unreadCountsRaw.map(
        (item: { _id: { toString: () => string }; count: number }) => [
          item._id.toString(),
          item.count,
        ],
      ),
    );

    return NextResponse.json(
      {
        contacts: contacts.map((contact) => ({
          id: contact._id.toString(),
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          role: contact.role,
          unreadCount: unreadMap.get(contact._id.toString()) ?? 0,
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Messages Contacts GET]", error);
    return NextResponse.json(
      { error: "Failed to load contacts" },
      { status: 500 },
    );
  }
}
