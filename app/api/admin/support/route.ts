import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { AccountStatus, ContactSubmission, Role, User } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const [
      pendingUsers,
      suspendedUsers,
      contactSubmissions,
      students,
      advisors,
    ] = await Promise.all([
      User.find({ status: AccountStatus.PENDING_VERIFICATION })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("firstName lastName email createdAt"),
      User.find({ status: AccountStatus.SUSPENDED })
        .sort({ updatedAt: -1 })
        .limit(8)
        .select("firstName lastName email updatedAt"),
      ContactSubmission.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .select(
          "name email type message quoteCategory quoteText emailDelivered isRead createdAt",
        )
        .lean(),
      User.countDocuments({ role: Role.STUDENT }),
      User.countDocuments({ role: Role.ADVISOR }),
    ]);

    const userTickets = [
      ...pendingUsers.map((user) => ({
        id: `pending-${user._id.toString()}`,
        issue: "Email verification pending",
        priority: "MEDIUM",
        owner: `${user.firstName} ${user.lastName}`,
        email: user.email,
        details: "User has not completed email verification yet.",
        openedAt: user.createdAt,
        status: "OPEN",
      })),
      ...suspendedUsers.map((user) => ({
        id: `suspended-${user._id.toString()}`,
        issue: "Suspended account review",
        priority: "HIGH",
        owner: `${user.firstName} ${user.lastName}`,
        email: user.email,
        details: "Account needs admin review before reactivation.",
        openedAt: user.updatedAt,
        status: "ESCALATED",
      })),
    ];

    const contactTickets = contactSubmissions.map((submission) => {
      const isQuote = submission.type === "get-quote";
      const quoteTheme = submission.quoteCategory
        ? submission.quoteCategory.replace(/-/g, " ")
        : "general motivation";
      return {
        id: `contact-${submission._id.toString()}`,
        issue: isQuote ? "Motivational quote request" : "Say Hi message",
        priority: isQuote ? "LOW" : "MEDIUM",
        owner: submission.name,
        email: submission.email,
        details: isQuote
          ? `Theme: ${quoteTheme}. Email delivered: ${submission.emailDelivered ? "Yes" : "No"}. ${submission.quoteText ? `Quote: ${submission.quoteText}` : submission.message}`
          : submission.message,
        openedAt: submission.createdAt,
        status: submission.isRead ? "REVIEWED" : "OPEN",
      };
    });

    const tickets = [...userTickets, ...contactTickets]
      .sort((a, b) => (a.openedAt > b.openedAt ? -1 : 1))
      .slice(0, 30);

    return NextResponse.json(
      {
        metrics: {
          openTickets: tickets.length,
          highPriority: tickets.filter((ticket) => ticket.priority === "HIGH")
            .length,
          mediumPriority: tickets.filter(
            (ticket) => ticket.priority === "MEDIUM",
          ).length,
          serviceCoverage: students + advisors,
        },
        items: tickets,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Support GET]", error);
    return NextResponse.json(
      { error: "Failed to load support queue" },
      { status: 500 },
    );
  }
}
