import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { initializeModels, AdvisorAvailability } from "@/lib/db/models";

// GET /api/advisor/[advisorId]/slots - public available slots for an advisor
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ advisorId: string }> },
) {
  const { advisorId } = await params;

  await connectDB();
  initializeModels();

  const slots = await AdvisorAvailability.find({
    advisorId,
    isBooked: false,
  })
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  return NextResponse.json({ slots });
}
