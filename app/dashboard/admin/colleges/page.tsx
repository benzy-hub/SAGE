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
  useCreateCollege,
  useDeleteCollege,
  useUpdateCollege,
} from "@/hooks/use-admin";

interface CollegeRow {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  departmentCount: number;
  managed?: boolean;
}

export default function AdminCollegesPage() {
  const { data, isLoading, error } = useAdminColleges();
  const createCollege = useCreateCollege();
  const updateCollege = useUpdateCollege();
  const deleteCollege = useDeleteCollege();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeRow | null>(null);
  const [deletingCollege, setDeletingCollege] = useState<CollegeRow | null>(
    null,
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const filteredItems = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.code.toLowerCase().includes(normalized);
      return matchesSearch;
    });
  }, [items, search]);

  const filteredMetrics = useMemo(() => {
    const totalStudents = filteredItems.reduce(
      (sum, item) => sum + item.studentCount,
      0,
    );
    const totalDepartments = filteredItems.reduce(
      (sum, item) => sum + item.departmentCount,
      0,
    );

    return {
      totalColleges: filteredItems.length,
      totalStudents,
      totalDepartments,
      averageStudentsPerCollege:
        filteredItems.length === 0
          ? 0
          : Math.round(totalStudents / filteredItems.length),
    };
  }, [filteredItems]);

  return (
    <>
      <AdminDataView<CollegeRow>
        title="Colleges"
        summary="Monitor student distribution and academic level coverage across all colleges with live client-side filtering."
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        metrics={filteredMetrics}
        items={filteredItems}
        tableTourId="admin-colleges-table"
        columns={[
          { key: "name", label: "College", render: (row) => row.name },
          { key: "code", label: "Code", render: (row) => row.code },
          {
            key: "studentCount",
            label: "Students",
            render: (row) => row.studentCount,
          },
          {
            key: "departmentCount",
            label: "Departments",
            render: (row) => row.departmentCount,
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateCollege.isPending || createCollege.isPending}
                  onClick={() => {
                    if (!row.managed) {
                      createCollege.mutate({
                        name: row.name,
                        code: row.code,
                      });
                      return;
                    }
                    setEditingCollege(row);
                  }}
                >
                  {row.managed ? "Edit" : "Enable CRUD"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteCollege.isPending || !row.managed}
                  onClick={() => setDeletingCollege(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        emptyTitle="No colleges found"
        emptyMessage="Student profile college data will appear here after records are available."
        actions={
          <div
            className="bg-background border-2 border-foreground rounded-2xl p-3 sm:p-4 w-full lg:w-105 space-y-3"
            data-tour="admin-colleges-filters"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search college or code"
              className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
            />
            <div
              className="pt-2 border-t border-foreground/10"
              data-tour="admin-colleges-create"
            >
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    Create college
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create college</DialogTitle>
                    <DialogDescription>
                      Add a managed college record for complete CRUD control.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="College name"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.toUpperCase())
                      }
                      placeholder="Code"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={
                        createCollege.isPending || !name.trim() || !code.trim()
                      }
                      onClick={() => {
                        createCollege.mutate(
                          {
                            name: name.trim(),
                            code: code.trim(),
                          },
                          {
                            onSuccess: () => {
                              setName("");
                              setCode("");
                              setCreateOpen(false);
                            },
                          },
                        );
                      }}
                    >
                      {createCollege.isPending ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />

      <Dialog
        open={Boolean(editingCollege)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCollege(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit college</DialogTitle>
            <DialogDescription>
              Update college details and linked student metadata safely.
            </DialogDescription>
          </DialogHeader>
          {editingCollege ? (
            <div className="space-y-2">
              <input
                value={editingCollege.name}
                onChange={(event) =>
                  setEditingCollege((prev) =>
                    prev ? { ...prev, name: event.target.value } : prev,
                  )
                }
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <input
                value={editingCollege.code}
                onChange={(event) =>
                  setEditingCollege((prev) =>
                    prev
                      ? { ...prev, code: event.target.value.toUpperCase() }
                      : prev,
                  )
                }
                className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button
              disabled={!editingCollege || updateCollege.isPending}
              onClick={() => {
                if (!editingCollege) return;
                updateCollege.mutate(
                  {
                    id: editingCollege.id,
                    name: editingCollege.name.trim(),
                    code: editingCollege.code.trim(),
                  },
                  {
                    onSuccess: () => {
                      setEditingCollege(null);
                    },
                  },
                );
              }}
            >
              {updateCollege.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingCollege)}
        onOpenChange={(open) => {
          if (!open) setDeletingCollege(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete college</DialogTitle>
            <DialogDescription>
              This removes managed college metadata and unsets matching
              student/department links.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCollege(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deletingCollege || deleteCollege.isPending}
              onClick={() => {
                if (!deletingCollege) return;
                deleteCollege.mutate(deletingCollege.id, {
                  onSuccess: () => setDeletingCollege(null),
                });
              }}
            >
              {deleteCollege.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
