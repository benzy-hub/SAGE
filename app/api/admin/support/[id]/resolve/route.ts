import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { ContactSubmission } from "@/lib/db/models";
import { sendEmail } from "@/lib/email/brevo";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const { id } = await params;

    const { response, status } = await req.json();

    if (!response || typeof response !== "string") {
      return NextResponse.json(
        { error: "Response text is required" },
        { status: 400 },
      );
    }

    // Find the submission (support ticket)
    const submission = await ContactSubmission.findById(id).lean();
    if (!submission) {
      return NextResponse.json(
        { error: "Support ticket not found" },
        { status: 404 },
      );
    }

    // Send response email
    await sendEmail({
      to: submission.email,
      subject: `Re: ${submission.type === "get-quote" ? "Motivational Quote Request" : "Say Hi Message"} - SAGE Support Response`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px 0; font-size: 18px;">Thank you for reaching out!</h2>
            <p style="margin: 0; font-size: 14px; color: #666;">We've reviewed your request and have a response for you.</p>
          </div>
          
          <div style="background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Our Response:</h3>
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${response}</p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #666;">
            <p style="margin: 0 0 8px 0;">This ticket has been marked as resolved. If you need further assistance, please don't hesitate to contact us.</p>
            <p style="margin: 0;">Best regards,<br>SAGE Support Team</p>
          </div>
        </div>
      `,
      text: `Thank you for reaching out!\n\nWe've reviewed your request and have a response for you.\n\nOur Response:\n${response}\n\nThis ticket has been marked as resolved. If you need further assistance, please don't hesitate to contact us.\n\nBest regards,\nSAGE Support Team`,
    });

    // Mark as resolved/read
    await ContactSubmission.findByIdAndUpdate(id, {
      isRead: true,
      status: status ?? "RESOLVED",
      resolvedAt: new Date(),
      resolutionNote: response,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Support ticket resolved and response sent",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Support Resolve POST]", error);
    return NextResponse.json(
      { error: "Failed to resolve support ticket" },
      { status: 500 },
    );
  }
}
