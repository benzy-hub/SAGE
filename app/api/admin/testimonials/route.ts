import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { initializeModels, Testimonial } from "@/lib/db/models";
import { requireAdmin } from "@/app/api/admin/_utils";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if ("response" in guard) return guard.response;

  await connectDB();
  initializeModels();

  const testimonials = await Testimonial.find({})
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ testimonials });
}
