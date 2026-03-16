import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { initializeModels, AdvisorAvailability, Role } from "@/lib/db/models";
import { requireRoleUser } from "@/app/api/_utils/role-auth";

// GET - advisor fetches their own availability slots
export async function GET(req: NextRequest) {
  const guard = await requireRoleUser(req, [Role.ADVISOR]);
  if ("response" in guard) return guard.response;

  await connectDB();
  initializeModels();

  const slots = await AdvisorAvailability.find({
    advisorId: guard.userId,
  })
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  return NextResponse.json({ slots });
}

// POST - advisor creates an availability slot
export async function POST(req: NextRequest) {
  const guard = await requireRoleUser(req, [Role.ADVISOR]);
  if ("response" in guard) return guard.response;

  await connectDB();
  initializeModels();

  const body = (await req.json().catch(() => ({}))) as {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isRecurring?: boolean;
    specificDate?: string;
  };

  const {
    dayOfWeek,
    startTime,
    endTime,
    isRecurring = true,
    specificDate,
  } = body;

  if (!startTime || !endTime) {
    return NextResponse.json(
      { error: "startTime and endTime are required" },
      { status: 400 },
    );
  }

  if (isRecurring && (dayOfWeek === undefined || dayOfWeek === null)) {
    return NextResponse.json(
      { error: "dayOfWeek is required for recurring slots" },
      { status: 400 },
    );
  }

  if (!isRecurring && !specificDate) {
    return NextResponse.json(
      { error: "specificDate is required for one-off slots" },
      { status: 400 },
    );
  }

  if (startTime >= endTime) {
    return NextResponse.json(
      { error: "startTime must be before endTime" },
      { status: 400 },
    );
  }

  const slot = await AdvisorAvailability.create({
    advisorId: guard.userId,
    dayOfWeek: isRecurring ? dayOfWeek : undefined,
    startTime,
    endTime,
    isRecurring,
    specificDate: specificDate ? new Date(specificDate) : undefined,
    isBooked: false,
  });

  return NextResponse.json({ slot }, { status: 201 });
}

// DELETE - advisor deletes an availability slot
export async function DELETE(req: NextRequest) {
  const guard = await requireRoleUser(req, [Role.ADVISOR]);
  if ("response" in guard) return guard.response;

  await connectDB();
  initializeModels();

  const { searchParams } = new URL(req.url);
  const slotId = searchParams.get("slotId");

  if (!slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400 });
  }

  const slot = await AdvisorAvailability.findOne({
    _id: slotId,
    advisorId: guard.userId,
  });

  if (!slot) {
    return NextResponse.json(
      { error: "Slot not found or not yours" },
      { status: 404 },
    );
  }

  if (slot.isBooked) {
    return NextResponse.json(
      { error: "Cannot delete a booked slot" },
      { status: 400 },
    );
  }

  await slot.deleteOne();

  return NextResponse.json({ ok: true });
}
