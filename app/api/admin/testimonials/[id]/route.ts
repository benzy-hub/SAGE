import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { initializeModels, Testimonial } from "@/lib/db/models";
import { requireAdmin } from "@/app/api/admin/_utils";
import { Types } from "mongoose";

// PATCH - admin approves/publishes a testimonial
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(req);
  if ("response" in guard) return guard.response;

  const { id } = await params;
  await connectDB();
  initializeModels();

  const body = (await req.json().catch(() => ({}))) as {
    isApproved?: boolean;
    isPublished?: boolean;
  };

  const testimonial = await Testimonial.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: { ...body, updatedAt: new Date() } },
    { new: true },
  );

  if (!testimonial) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ testimonial });
}
