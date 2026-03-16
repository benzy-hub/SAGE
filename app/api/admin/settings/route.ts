import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { PlatformSetting } from "@/lib/db/models";

const SETTINGS_KEY = "platform-settings";

const defaultSettings = {
  allowRegistration: true,
  maintenanceMode: false,
  supportEmail: "support@sage.local",
  defaultStudentYear: 1,
  maxMessageLength: 2000,
  notifyAdminsOnNewUser: true,
};

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const existing = await PlatformSetting.findOne({
      key: SETTINGS_KEY,
    }).select("key value updatedAt");

    if (!existing) {
      const created = await PlatformSetting.create({
        key: SETTINGS_KEY,
        value: defaultSettings,
      });
      return NextResponse.json(
        {
          item: {
            key: created.key,
            ...created.value,
            updatedAt: created.updatedAt,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        item: {
          key: existing.key,
          ...(existing.value ?? defaultSettings),
          updatedAt: existing.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Settings GET]", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();

    const nextSettings = {
      allowRegistration: Boolean(body?.allowRegistration),
      maintenanceMode: Boolean(body?.maintenanceMode),
      supportEmail: String(body?.supportEmail ?? "").trim(),
      defaultStudentYear: Number(body?.defaultStudentYear ?? 1),
      maxMessageLength: Number(body?.maxMessageLength ?? 2000),
      notifyAdminsOnNewUser: Boolean(body?.notifyAdminsOnNewUser),
    };

    if (
      !nextSettings.supportEmail ||
      !nextSettings.supportEmail.includes("@")
    ) {
      return NextResponse.json(
        { error: "A valid support email is required" },
        { status: 400 },
      );
    }

    if (
      nextSettings.defaultStudentYear < 1 ||
      nextSettings.defaultStudentYear > 8
    ) {
      return NextResponse.json(
        { error: "Default student year must be between 1 and 8" },
        { status: 400 },
      );
    }

    if (
      nextSettings.maxMessageLength < 100 ||
      nextSettings.maxMessageLength > 5000
    ) {
      return NextResponse.json(
        { error: "Max message length must be between 100 and 5000" },
        { status: 400 },
      );
    }

    const updated = await PlatformSetting.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        key: SETTINGS_KEY,
        value: nextSettings,
        updatedBy: guard.adminId,
      },
      { new: true, upsert: true },
    ).select("key value updatedAt");

    return NextResponse.json(
      {
        success: true,
        item: {
          key: updated.key,
          ...(updated.value ?? defaultSettings),
          updatedAt: updated.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Settings PATCH]", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
