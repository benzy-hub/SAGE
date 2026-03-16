"use client";

import { useState } from "react";
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
  useAdminUsers,
  useCreateAdminUser,
  useDeleteUser,
  useUpdateUserStatus,
} from "@/hooks/use-admin";
import { useAdminStore } from "@/stores/admin-store";

interface AdminUserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  studentId: string | null;
  college: string | null;
  department: string | null;
  level: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const {
    search,
    roleFilter,
    statusFilter,
    page,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setPage,
    resetUserFilters,
  } = useAdminStore();

  const { data, isLoading, error } = useAdminUsers({
    page,
    search,
    role: roleFilter,
    status: statusFilter,
  });

  const updateStatus = useUpdateUserStatus();
  const createAdmin = useCreateAdminUser();
  const deleteUser = useDeleteUser();

  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);

  return (
    <>
      <AdminDataView<AdminUserRow>
        title="User Management"
        summary="Search, filter, and manage user lifecycle states with auditable mutations and instant feedback."
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        metrics={{
          totalUsers: data?.total ?? 0,
          currentPage: data?.page ?? 1,
          totalPages: data?.totalPages ?? 1,
        }}
        clientPagination={false}
        tableTourId="admin-users-table"
        items={data?.items ?? []}
        columns={[
          {
            key: "name",
            label: "Name",
            render: (row) => `${row.firstName} ${row.lastName}`,
          },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "role", label: "Role", render: (row) => row.role },
          { key: "status", label: "Status", render: (row) => row.status },
          {
            key: "matric",
            label: "Matric",
            render: (row) => row.studentId ?? "—",
          },
          {
            key: "college",
            label: "College",
            render: (row) => row.college ?? "—",
          },
          {
            key: "department",
            label: "Department",
            render: (row) => row.department ?? "—",
          },
          {
            key: "level",
            label: "Level",
            render: (row) => row.level ?? "—",
          },
          {
            key: "joined",
            label: "Joined",
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({ userId: row.id, status: "ACTIVE" })
                  }
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({ userId: row.id, status: "SUSPENDED" })
                  }
                >
                  Suspend
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteUser.isPending}
                  onClick={() => setDeleteTarget(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        emptyTitle="No users found"
        emptyMessage="Adjust filters to broaden results or wait for new registrations."
        actions={
          <div
            className="bg-background border-2 border-foreground rounded-2xl p-3 sm:p-4 w-full lg:w-105 space-y-3"
            data-tour="admin-users-filters"
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as typeof roleFilter)
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All roles</option>
                <option value="STUDENT">Students</option>
                <option value="ADVISOR">Advisors</option>
                <option value="ADMIN">Admins</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as typeof statusFilter)
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ALL">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={resetUserFilters}>
                Reset filters
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={(data?.page ?? 1) <= 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={(data?.page ?? 1) >= (data?.totalPages ?? 1)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
            <div
              className="pt-2 border-t border-foreground/10"
              data-tour="admin-users-create"
            >
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    Create admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create admin account</DialogTitle>
                    <DialogDescription>
                      Create a privileged account with a temporary password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={adminFirstName}
                        onChange={(event) =>
                          setAdminFirstName(event.target.value)
                        }
                        placeholder="First name"
                        className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                      />
                      <input
                        value={adminLastName}
                        onChange={(event) =>
                          setAdminLastName(event.target.value)
                        }
                        placeholder="Last name"
                        className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                      />
                    </div>
                    <input
                      value={adminEmail}
                      onChange={(event) => setAdminEmail(event.target.value)}
                      placeholder="Admin email"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={adminPassword}
                      onChange={(event) => setAdminPassword(event.target.value)}
                      type="password"
                      placeholder="Temporary password (min 8)"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={
                        createAdmin.isPending ||
                        !adminFirstName.trim() ||
                        !adminLastName.trim() ||
                        !adminEmail.trim() ||
                        adminPassword.trim().length < 8
                      }
                      onClick={() => {
                        createAdmin.mutate(
                          {
                            firstName: adminFirstName.trim(),
                            lastName: adminLastName.trim(),
                            email: adminEmail.trim(),
                            password: adminPassword,
                          },
                          {
                            onSuccess: () => {
                              setAdminFirstName("");
                              setAdminLastName("");
                              setAdminEmail("");
                              setAdminPassword("");
                              setCreateOpen(false);
                            },
                          },
                        );
                      }}
                    >
                      {createAdmin.isPending ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This permanently removes user account data and linked records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteTarget || deleteUser.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteUser.mutate(deleteTarget.id, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
