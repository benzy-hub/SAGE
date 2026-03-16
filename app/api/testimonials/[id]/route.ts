import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { initializeModels, Testimonial, Role } from "@/lib/db/models";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import { Types } from "mongoose";

// PATCH - author edits their own testimonial
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRoleUser(req, [Role.STUDENT, Role.ADVISOR]);
  if ("response" in guard) return guard.response;

  const { id } = await params;
  await connectDB();
  initializeModels();

  const testimonial = await Testimonial.findOne({
    _id: new Types.ObjectId(id),
    authorId: new Types.ObjectId(guard.userId),
  });

  if (!testimonial) {
    return NextResponse.json(
      { error: "Testimonial not found" },
      { status: 404 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    quote?: string;
    rating?: number;
    authorTitle?: string;
  };

  if (body.quote !== undefined) testimonial.quote = body.quote.trim();
  if (body.rating !== undefined) testimonial.rating = body.rating;
  if (body.authorTitle !== undefined)
    testimonial.authorTitle = body.authorTitle.trim();

  // Reset approval on edit
  testimonial.isApproved = false;
  testimonial.isPublished = false;

  await testimonial.save();

  return NextResponse.json({ testimonial });
}

// DELETE - author deletes their own testimonial
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRoleUser(req, [
    Role.STUDENT,
    Role.ADVISOR,
    Role.ADMIN,
  ]);
  if ("response" in guard) return guard.response;

  const { id } = await params;
  await connectDB();
  initializeModels();

  const query =
    guard.role === Role.ADMIN
      ? { _id: new Types.ObjectId(id) }
      : {
          _id: new Types.ObjectId(id),
          authorId: new Types.ObjectId(guard.userId),
        };

  const deleted = await Testimonial.findOneAndDelete(query);

  if (!deleted) {
    return NextResponse.json(
      { error: "Testimonial not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
