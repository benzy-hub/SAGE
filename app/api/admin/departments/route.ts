import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/admin/_utils";
import { DepartmentCatalog, Role, StudentProfile, User } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const [grouped, catalogEntries] = await Promise.all([
      StudentProfile.aggregate([
        {
          $group: {
            _id: {
              college: "$college",
              department: "$department",
            },
            studentCount: { $sum: 1 },
            programs: { $addToSet: "$program" },
            levels: { $addToSet: "$level" },
            avgYear: { $avg: "$year" },
          },
        },
        { $sort: { studentCount: -1 } },
      ]),
      DepartmentCatalog.find({})
        .sort({ college: 1, name: 1 })
        .select("college name levels"),
    ]);

    const groupedMap = new Map<string, Record<string, unknown>>(
      grouped
        .filter(
          (row) =>
            typeof row?._id?.department === "string" &&
            row._id.department.trim().length > 0,
        )
        .map((row) => {
          const college = String(row?._id?.college ?? "").trim();
          const department = String(row._id.department).trim();
          return [
            `${college}::${department}`,
            row as Record<string, unknown>,
          ] as const;
        }),
    );

    const keys = new Set<string>();
    for (const row of grouped) {
      if (
        typeof row?._id?.department === "string" &&
        row._id.department.trim()
      ) {
        keys.add(
          `${String(row?._id?.college ?? "").trim()}::${row._id.department.trim()}`,
        );
      }
    }
    for (const entry of catalogEntries) {
      keys.add(`${entry.college.trim()}::${entry.name.trim()}`);
    }
    const totalAdvisors = await User.countDocuments({ role: Role.ADVISOR });

    const departments = Array.from(keys)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => {
        const [college, name] = key.split("::");
        const groupedRow = groupedMap.get(key);
        const catalog = catalogEntries.find(
          (entry) => entry.college === college && entry.name === name,
        );

        const profileLevels = Array.isArray(groupedRow?.levels)
          ? groupedRow.levels
              .filter((level: unknown) => typeof level === "string")
              .map((level: string) => level.trim())
              .filter((level: string) => level.length > 0)
          : [];

        const catalogLevels = Array.isArray(catalog?.levels)
          ? catalog.levels
              .filter((level) => typeof level === "string")
              .map((level) => level.trim())
              .filter((level) => level.length > 0)
          : [];

        const levels = Array.from(
          new Set([...profileLevels, ...catalogLevels]),
        ).sort();

        return {
          id: catalog?._id.toString() ?? key,
          college,
          name,
          studentCount: Number(groupedRow?.studentCount ?? 0),
          programCount: Array.isArray(groupedRow?.programs)
            ? groupedRow.programs.filter(
                (program: unknown) =>
                  typeof program === "string" && program.trim().length > 0,
              ).length
            : 0,
          levels,
          avgYear: Math.max(1, Math.round(Number(groupedRow?.avgYear ?? 1))),
          advisorSlots: Math.max(
            1,
            Math.ceil(Number(groupedRow?.studentCount ?? 0) / 15),
          ),
          managed: Boolean(catalog),
        };
      });

    const totalStudents = departments.reduce(
      (sum, item) => sum + item.studentCount,
      0,
    );

    return NextResponse.json(
      {
        metrics: {
          totalDepartments: departments.length,
          totalStudents,
          totalColleges: new Set(departments.map((item) => item.college)).size,
          totalAdvisors,
          averageStudentsPerDepartment:
            departments.length === 0
              ? 0
              : Math.round(totalStudents / departments.length),
        },
        items: departments,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Departments GET]", error);
    return NextResponse.json(
      { error: "Failed to load departments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireAdmin(req);
    if ("response" in guard) return guard.response;

    const body = await req.json();
    const college = String(body?.college ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const levels: string[] = Array.isArray(body?.levels)
      ? body.levels
          .filter((value: unknown) => typeof value === "string")
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 0)
      : [];
    const normalizedLevels: string[] = Array.from(
      new Set<string>(levels),
    ).sort();

    if (!college || !name) {
      return NextResponse.json(
        { error: "College and department name are required" },
        { status: 400 },
      );
    }

    const exists = await DepartmentCatalog.findOne({ college, name }).select(
      "_id",
    );
    if (exists) {
      return NextResponse.json(
        { error: "Department already exists for this college" },
        { status: 409 },
      );
    }

    const created = await DepartmentCatalog.create({
      college,
      name,
      levels: normalizedLevels,
    });

    return NextResponse.json(
      {
        success: true,
        item: {
          id: created._id.toString(),
          college: created.college,
          name: created.name,
          levels: created.levels,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Admin Departments POST]", error);
    return NextResponse.json(
      { error: "Failed to create department" },
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
    const college = String(body?.college ?? "").trim();
    const name = String(body?.name ?? "").trim();
    const levels: string[] = Array.isArray(body?.levels)
      ? body.levels
          .filter((value: unknown) => typeof value === "string")
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 0)
      : [];
    const normalizedLevels: string[] = Array.from(
      new Set<string>(levels),
    ).sort();

    if (!id || !college || !name) {
      return NextResponse.json(
        { error: "Department id, college and name are required" },
        { status: 400 },
      );
    }

    const current = await DepartmentCatalog.findById(id);
    if (!current) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 },
      );
    }

    const conflict = await DepartmentCatalog.findOne({
      _id: { $ne: current._id },
      college,
      name,
    }).select("_id");
    if (conflict) {
      return NextResponse.json(
        { error: "Department already exists for this college" },
        { status: 409 },
      );
    }

    const previousCollege = current.college;
    const previousName = current.name;

    current.college = college;
    current.name = name;
    current.levels = normalizedLevels;
    await current.save();

    if (previousCollege !== college || previousName !== name) {
      await StudentProfile.updateMany(
        { college: previousCollege, department: previousName },
        { $set: { college, department: name } },
      );
    }

    return NextResponse.json(
      {
        success: true,
        item: {
          id: current._id.toString(),
          college: current.college,
          name: current.name,
          levels: current.levels,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[Admin Departments PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update department" },
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
        { error: "Department id is required" },
        { status: 400 },
      );
    }

    const department = await DepartmentCatalog.findById(id);
    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 },
      );
    }

    await Promise.all([
      DepartmentCatalog.deleteOne({ _id: department._id }),
      StudentProfile.updateMany(
        { college: department.college, department: department.name },
        { $set: { department: "" } },
      ),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Admin Departments DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 },
    );
  }
}
