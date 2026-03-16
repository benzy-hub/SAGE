import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { initializeModels, Testimonial, Role, User } from "@/lib/db/models";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import { Types } from "mongoose";

// GET - public list of approved/published testimonials
export async function GET(req: NextRequest) {
  await connectDB();
  initializeModels();

  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");

  // If authenticated, check if "mine=true"
  if (mine === "true") {
    // Must be authenticated to see own unreviewed testimonials
    const guard = await requireRoleUser(req, [Role.STUDENT, Role.ADVISOR]);
    if ("response" in guard) return guard.response;
    const testimonials = await Testimonial.find({
      authorId: new Types.ObjectId(guard.userId),
    })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ testimonials });
  }

  // Public: only approved + published
  const testimonials = await Testimonial.find({
    isApproved: true,
    isPublished: true,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json({ testimonials });
}

// POST - student or advisor creates a testimonial
export async function POST(req: NextRequest) {
  const guard = await requireRoleUser(req, [Role.STUDENT, Role.ADVISOR]);
  if ("response" in guard) return guard.response;

  await connectDB();
  initializeModels();

  const body = (await req.json().catch(() => ({}))) as {
    quote?: string;
    rating?: number;
    authorTitle?: string;
  };

  const { quote, rating = 5, authorTitle } = body;

  if (!quote?.trim()) {
    return NextResponse.json({ error: "Quote is required" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 },
    );
  }

  const author = await User.findById(guard.userId).select(
    "firstName lastName role",
  );
  if (!author) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const testimonial = await Testimonial.create({
    authorId: guard.userId,
    authorRole: author.role,
    authorName: `${author.firstName} ${author.lastName}`,
    authorTitle:
      authorTitle?.trim() ||
      (author.role === Role.ADVISOR ? "Academic Advisor" : "Student"),
    quote: quote.trim(),
    rating,
    isApproved: false, // admin approves
    isPublished: false,
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
