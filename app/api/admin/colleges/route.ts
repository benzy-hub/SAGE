import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import {
  CollegeCatalog,
  DepartmentCatalog,
  StudentProfile,
} from "@/lib/db/models";

function deriveCollegeCode(collegeName: string) {
  const letters = collegeName
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return letters.slice(0, 6);
}

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const [grouped, catalogEntries] = await Promise.all([
      StudentProfile.aggregate([
        {
          $group: {
            _id: "$college",
            studentCount: { $sum: 1 },
            departments: { $addToSet: "$department" },
            levels: { $addToSet: "$level" },
            avgYear: { $avg: "$year" },
          },
        },
        { $sort: { studentCount: -1 } },
      ]),
      CollegeCatalog.find({}).sort({ name: 1 }).select("name code levels"),
    ]);

    const groupedMap = new Map(
      grouped
        .filter(
          (row) => typeof row._id === "string" && row._id.trim().length > 0,
        )
        .map((row) => [row._id.trim(), row]),
    );

    const names = new Set<string>();
    for (const row of grouped) {
      if (typeof row?._id === "string" && row._id.trim()) {
        names.add(row._id.trim());
      }
    }
    for (const entry of catalogEntries) {
      if (entry.name?.trim()) names.add(entry.name.trim());
    }

    const items = Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const groupedRow = groupedMap.get(name);
        const catalog = catalogEntries.find((entry) => entry.name === name);

        const levelsFromProfiles = Array.isArray(groupedRow?.levels)
          ? groupedRow.levels
              .filter((item: unknown) => typeof item === "string")
              .map((item: string) => item.trim())
              .filter((item: string) => item.length > 0)
          : [];

        const levelsFromCatalog = Array.isArray(catalog?.levels)
          ? catalog.levels
              .filter((item) => typeof item === "string")
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [];

        const levels = Array.from(
          new Set([...levelsFromCatalog, ...levelsFromProfiles]),
        ).sort();

        const departments = Array.isArray(groupedRow?.departments)
          ? groupedRow.departments
              .filter((item: unknown) => typeof item === "string")
              .map((item: string) => item.trim())
              .filter((item: string) => item.length > 0)
          : [];

        return {
          id: catalog?._id.toString() ?? name,
          name,
          code: catalog?.code ?? deriveCollegeCode(name),
          studentCount: Number(groupedRow?.studentCount ?? 0),
          departmentCount: departments.length,
          levels,
          avgYear: Math.max(1, Math.round(Number(groupedRow?.avgYear ?? 1))),
          managed: Boolean(catalog),
        };
      });

    const totalStudents = items.reduce(
      (sum, item) => sum + item.studentCount,
      0,
    );

    return NextResponse.json(
      {
        metrics: {
          totalColleges: items.length,
          totalStudents,
          averageStudentsPerCollege:
            items.length === 0 ? 0 : Math.round(totalStudents / items.length),
        },
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Colleges GET]", error);
    return NextResponse.json(
      { error: "Failed to load colleges" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const code = String(body?.code ?? "")
      .trim()
      .toUpperCase();
    const levels: string[] = Array.isArray(body?.levels)
      ? body.levels
          .filter((value: unknown) => typeof value === "string")
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 0)
      : [];
    const normalizedLevels: string[] = Array.from(
      new Set<string>(levels),
    ).sort();

    if (!name || !code) {
      return NextResponse.json(
        { error: "College name and code are required" },
        { status: 400 },
      );
    }

    const exists = await CollegeCatalog.findOne({
      $or: [{ name }, { code }],
    }).select("_id");
    if (exists) {
      return NextResponse.json(
        { error: "College already exists" },
        { status: 409 },
      );
    }

    const created = await CollegeCatalog.create({
      name,
      code,
      levels: normalizedLevels,
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: created._id.toString(),
          name: created.name,
          code: created.code,
          levels: created.levels,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Admin Colleges POST]", error);
    return NextResponse.json(
      { error: "Failed to create college" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const id = String(body?.id ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const code = String(body?.code ?? "")
      .trim()
      .toUpperCase();
    const levels: string[] = Array.isArray(body?.levels)
      ? body.levels
          .filter((value: unknown) => typeof value === "string")
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 0)
      : [];
    const normalizedLevels: string[] = Array.from(
      new Set<string>(levels),
    ).sort();

    if (!id || !name || !code) {
      return NextResponse.json(
        { error: "College id, name and code are required" },
        { status: 400 },
      );
    }

    const current = await CollegeCatalog.findById(id);
    if (!current) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const conflict = await CollegeCatalog.findOne({
      _id: { $ne: current._id },
      $or: [{ name }, { code }],
    }).select("_id");
    if (conflict) {
      return NextResponse.json(
        { error: "College name or code already in use" },
        { status: 409 },
      );
    }

    const previousName = current.name;

    current.name = name;
    current.code = code;
    current.levels = normalizedLevels;
    await current.save();

    if (previousName !== name) {
      await Promise.all([
        StudentProfile.updateMany(
          { college: previousName },
          { $set: { college: name } },
        ),
        DepartmentCatalog.updateMany(
          { college: previousName },
          { $set: { college: name } },
        ),
      ]);
    }

    return NextResponse.json(
      {
        success: true,
        item: {
          id: current._id.toString(),
          name: current.name,
          code: current.code,
          levels: current.levels,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Colleges PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update college" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const id = String(body?.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "College id is required" },
        { status: 400 },
      );
    }

    const college = await CollegeCatalog.findById(id);
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    await Promise.all([
      CollegeCatalog.deleteOne({ _id: college._id }),
      DepartmentCatalog.deleteMany({ college: college.name }),
      StudentProfile.updateMany(
        { college: college.name },
        { $set: { college: "" } },
      ),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Admin Colleges DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete college" },
      { status: 500 },
    );
  }
}
