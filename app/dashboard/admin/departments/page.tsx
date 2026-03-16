"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAdminColleges,
  useAdminDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  useUpdateDepartment,
} from "@/hooks/use-admin";

interface DepartmentRow {
  id: string;
  college: string;
  name: string;
  studentCount: number;
  programCount: number;
  levels: string[];
  avgYear: number;
  advisorSlots: number;
  managed?: boolean;
}

export default function AdminDepartmentsPage() {
  const { data, isLoading, error } = useAdminDepartments();
  const { data: collegesData } = useAdminColleges();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const [search, setSearch] = useState("");
  const [college, setCollege] = useState("ALL");
  const [level, setLevel] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentRow | null>(null);
  const [deletingDepartment, setDeletingDepartment] =
    useState<DepartmentRow | null>(null);
  const [newCollege, setNewCollege] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newLevels, setNewLevels] = useState("");

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const collegeCatalogOptions = useMemo(
    () =>
      Array.from(
        new Set((collegesData?.items ?? []).map((item) => item.name)),
      ).sort(),
    [collegesData?.items],
  );

  const collegeOptions = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.college).filter((value) => value)),
      ).sort(),
    [items],
  );

  const levelOptions = useMemo(
    () =>
      Array.from(
        new Set(items.flatMap((item) => item.levels).filter((value) => value)),
      ).sort(),
    [items],
  );

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.college.toLowerCase().includes(normalized);
      const matchesCollege = college === "ALL" || item.college === college;
      const matchesLevel = level === "ALL" || item.levels.includes(level);
      return matchesSearch && matchesCollege && matchesLevel;
    });
  }, [items, search, college, level]);

  const filteredMetrics = useMemo(() => {
    const totalStudents = filteredItems.reduce(
      (sum, item) => sum + item.studentCount,
      0,
    );
    return {
      totalDepartments: filteredItems.length,
      totalStudents,
      averageStudentsPerDepartment:
        filteredItems.length === 0
          ? 0
          : Math.round(totalStudents / filteredItems.length),
      activeFilters:
        Number(search.trim().length > 0) +
        Number(college !== "ALL") +
        Number(level !== "ALL"),
    };
  }, [filteredItems, search, college, level]);

  return (
    <>
      <AdminDataView<DepartmentRow>
        title="Departments & Programs"
        summary="Review departmental demand, program distribution, and advisor capacity targets from current student profile data."
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        metrics={filteredMetrics}
        items={filteredItems}
        tableTourId="admin-departments-table"
        columns={[
          { key: "college", label: "College", render: (row) => row.college },
          { key: "name", label: "Department", render: (row) => row.name },
          {
            key: "studentCount",
            label: "Students",
            render: (row) => row.studentCount,
          },
          {
            key: "programCount",
            label: "Programs",
            render: (row) => row.programCount,
          },
          {
            key: "levels",
            label: "Levels",
            render: (row) => (row.levels.length ? row.levels.join(", ") : "—"),
          },
          {
            key: "avgYear",
            label: "Average Year",
            render: (row) => row.avgYear,
          },
          {
            key: "advisorSlots",
            label: "Recommended Advisor Slots",
            render: (row) => row.advisorSlots,
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    updateDepartment.isPending || createDepartment.isPending
                  }
                  onClick={() => {
                    if (!row.managed) {
                      createDepartment.mutate({
                        college: row.college,
                        name: row.name,
                        levels: row.levels,
                      });
                      return;
                    }
                    setEditingDepartment(row);
                  }}
                >
                  {row.managed ? "Edit" : "Enable CRUD"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteDepartment.isPending || !row.managed}
                  onClick={() => setDeletingDepartment(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        emptyTitle="No department data found"
        emptyMessage="Department records will populate after student profiles include department metadata."
        actions={
          <div
            className="bg-background border-2 border-foreground rounded-2xl p-3 sm:p-4 w-full lg:w-105 space-y-3"
            data-tour="admin-departments-filters"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search department or college"
              className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={college}
                onChange={(event) => setCollege(event.target.value)}
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All colleges</option>
                {collegeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All levels</option>
                {levelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="pt-2 border-t border-foreground/10"
              data-tour="admin-departments-create"
            >
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    Create department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create department</DialogTitle>
                    <DialogDescription>
                      Add managed department metadata and level coverage.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <select
                      value={newCollege}
                      onChange={(event) => setNewCollege(event.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    >
                      <option value="">Select college</option>
                      {collegeCatalogOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      value={newDepartment}
                      onChange={(event) => setNewDepartment(event.target.value)}
                      placeholder="Department"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={newLevels}
                      onChange={(event) => setNewLevels(event.target.value)}
                      placeholder="Levels (comma separated)"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={
                        createDepartment.isPending ||
                        !newCollege.trim() ||
                        !newDepartment.trim()
                      }
                      onClick={() => {
                        createDepartment.mutate(
                          {
                            college: newCollege,
                            name: newDepartment.trim(),
                            levels: newLevels
                              .split(",")
                              .map((entry) => entry.trim())
                              .filter(Boolean),
                          },
                          {
                            onSuccess: () => {
                              setNewCollege("");
                              setNewDepartment("");
                              setNewLevels("");
                              setCreateOpen(false);
                            },
                          },
                        );
                      }}
                    >
                      {createDepartment.isPending ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />

      <Dialog
        open={Boolean(editingDepartment)}
        onOpenChange={(open) => {
          if (!open) setEditingDepartment(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit department</DialogTitle>
            <DialogDescription>
              Update department metadata and synchronize linked student records.
            </DialogDescription>
          </DialogHeader>
          {editingDepartment ? (
            <div className="space-y-2">
              <select
                value={editingDepartment.college}
                onChange={(event) =>
                  setEditingDepartment((prev) =>
                    prev ? { ...prev, college: event.target.value } : prev,
                  )
                }
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                {collegeCatalogOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                value={editingDepartment.name}
                onChange={(event) =>
                  setEditingDepartment((prev) =>
                    prev ? { ...prev, name: event.target.value } : prev,
                  )
                }
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <input
                value={editingDepartment.levels.join(", ")}
                onChange={(event) =>
                  setEditingDepartment((prev) =>
                    prev
                      ? {
                          ...prev,
                          levels: event.target.value
                            .split(",")
                            .map((entry) => entry.trim())
                            .filter(Boolean),
                        }
                      : prev,
                  )
                }
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              disabled={!editingDepartment || updateDepartment.isPending}
              onClick={() => {
                if (!editingDepartment) return;
                updateDepartment.mutate(
                  {
                    id: editingDepartment.id,
                    college: editingDepartment.college,
                    name: editingDepartment.name.trim(),
                    levels: editingDepartment.levels,
                  },
                  {
                    onSuccess: () => setEditingDepartment(null),
                  },
                );
              }}
            >
              {updateDepartment.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingDepartment)}
        onOpenChange={(open) => {
          if (!open) setDeletingDepartment(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete department</DialogTitle>
            <DialogDescription>
              This removes managed metadata and clears matching student
              department values.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingDepartment(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deletingDepartment || deleteDepartment.isPending}
              onClick={() => {
                if (!deletingDepartment) return;
                deleteDepartment.mutate(deletingDepartment.id, {
                  onSuccess: () => setDeletingDepartment(null),
                });
              }}
            >
              {deleteDepartment.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
