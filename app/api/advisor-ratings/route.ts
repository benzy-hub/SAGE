import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  initializeModels,
  AdvisorRating,
  Appointment,
  AppointmentStatus,
  Role,
  User,
} from "@/lib/db/models";
import { requireRoleUser } from "@/app/api/_utils/role-auth";
import { Types } from "mongoose";

// GET - fetch ratings for an advisor (public via ?advisorId=, or authenticated)
export async function GET(req: NextRequest) {
  await connectDB();
  initializeModels();

  const { searchParams } = new URL(req.url);
  const advisorId = searchParams.get("advisorId");

  if (!advisorId) {
    return NextResponse.json(
      { error: "advisorId is required" },
      { status: 400 },
    );
  }

  const ratings = await AdvisorRating.find({ advisorId })
    .sort({ createdAt: -1 })
    .lean();

  // Fetch student names for display
  const studentIds = ratings.map((r) => r.studentId);
  const students = await User.find({ _id: { $in: studentIds } })
    .select("firstName lastName")
    .lean();
  const studentMap = new Map(
    students.map((s) => [s._id.toString(), `${s.firstName} ${s.lastName}`]),
  );

  const enriched = ratings.map((r) => ({
    ...r,
    studentName: studentMap.get(r.studentId.toString()) ?? "Anonymous",
  }));

  const avg =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  return NextResponse.json({
    ratings: enriched,
    average: Math.round(avg * 10) / 10,
    count: ratings.length,
  });
}

// POST - student rates an advisor after a COMPLETED appointment
export async function POST(req: NextRequest) {
  const guard = await requireRoleUser(req, [Role.STUDENT]);
  if ("response" in guard) return guard.response;

  await connectDB();
  initializeModels();

  const body = (await req.json().catch(() => ({}))) as {
    advisorId?: string;
    appointmentId?: string;
    rating?: number;
    review?: string;
  };

  const { advisorId, appointmentId, rating, review } = body;

  if (!advisorId || !appointmentId || !rating) {
    return NextResponse.json(
      { error: "advisorId, appointmentId, and rating are required" },
      { status: 400 },
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 },
    );
  }

  // Verify the appointment exists, is COMPLETED, and belongs to this student
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    studentId: guard.userId,
    advisorId,
    status: AppointmentStatus.COMPLETED,
  });

  if (!appointment) {
    return NextResponse.json(
      { error: "No completed appointment found for this advisor" },
      { status: 404 },
    );
  }

  // Upsert - one rating per appointment
  const ratingDoc = await AdvisorRating.findOneAndUpdate(
    {
      advisorId: new Types.ObjectId(advisorId),
      studentId: new Types.ObjectId(guard.userId),
      appointmentId: appointment._id,
    },
    {
      $set: {
        rating,
        review: review?.trim() ?? "",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );

  return NextResponse.json({ rating: ratingDoc }, { status: 201 });
}
