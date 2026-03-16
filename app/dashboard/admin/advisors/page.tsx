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
  useAdminAdvisors,
  useCreateAdvisor,
  useDeleteAdvisor,
  useUpdateAdvisor,
} from "@/hooks/use-admin";

const PENDING_APPROVAL = "PENDING_APPROVAL";

interface AdvisorRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  activeAdvisees: number;
  pendingRequests: number;
  createdAt: string;
}

export default function AdminAdvisorsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<AdvisorRow | null>(null);
  const [deleteAdvisorRow, setDeleteAdvisorRow] = useState<AdvisorRow | null>(
    null,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data, isLoading, error } = useAdminAdvisors(search);
  const createAdvisor = useCreateAdvisor();
  const updateAdvisor = useUpdateAdvisor();
  const deleteAdvisor = useDeleteAdvisor();

  const pendingCount = (data?.items ?? []).filter(
    (a) => a.status === PENDING_APPROVAL,
  ).length;

  return (
    <>
      <AdminDataView<AdvisorRow>
        title="Advisor Operations"
        summary="Monitor advisor capacity, request load, and utilization to keep guidance service levels consistent."
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        metrics={data?.metrics}
        items={data?.items ?? []}
        tableTourId="admin-advisors-table"
        columns={[
          {
            key: "name",
            label: "Advisor",
            render: (row) => `${row.firstName} ${row.lastName}`,
          },
          { key: "email", label: "Email", render: (row) => row.email },
          { key: "status", label: "Status", render: (row) => row.status },
          {
            key: "activeAdvisees",
            label: "Active Advisees",
            render: (row) => row.activeAdvisees,
          },
          {
            key: "pendingRequests",
            label: "Pending Requests",
            render: (row) => row.pendingRequests,
          },
          {
            key: "createdAt",
            label: "Joined",
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-1.5">
                {row.status === PENDING_APPROVAL && (
                  <Button
                    size="sm"
                    variant="default"
                    disabled={updateAdvisor.isPending}
                    onClick={() =>
                      updateAdvisor.mutate({
                        advisorId: row.id,
                        status: "ACTIVE",
                      })
                    }
                  >
                    Approve
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateAdvisor.isPending}
                  onClick={() => setEditingAdvisor(row)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteAdvisor.isPending}
                  onClick={() => setDeleteAdvisorRow(row)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        emptyTitle="No advisors found"
        emptyMessage="Try adjusting search parameters to find advisor records."
        actions={
          <div
            className="bg-background border-2 border-foreground rounded-2xl p-3 sm:p-4 w-full lg:w-105 space-y-2"
            data-tour="admin-advisors-filters"
          >
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {pendingCount}
                </span>
                advisor{pendingCount !== 1 ? "s" : ""} pending approval
              </div>
            )}
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search advisor"
              className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
            />
            <div
              className="pt-2 border-t border-foreground/10"
              data-tour="admin-advisors-create"
            >
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    Create advisor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create advisor</DialogTitle>
                    <DialogDescription>
                      Create an advisor account with a temporary password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="First name"
                        className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                      />
                      <input
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="Last name"
                        className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                      />
                    </div>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Advisor email"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      placeholder="Temporary password (min 8)"
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={
                        createAdvisor.isPending ||
                        !firstName.trim() ||
                        !lastName.trim() ||
                        !email.trim() ||
                        password.trim().length < 8
                      }
                      onClick={() => {
                        createAdvisor.mutate(
                          {
                            firstName: firstName.trim(),
                            lastName: lastName.trim(),
                            email: email.trim(),
                            password,
                          },
                          {
                            onSuccess: () => {
                              setFirstName("");
                              setLastName("");
                              setEmail("");
                              setPassword("");
                              setCreateOpen(false);
                            },
                          },
                        );
                      }}
                    >
                      {createAdvisor.isPending ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        }
      />

      <Dialog
        open={Boolean(editingAdvisor)}
        onOpenChange={(open) => {
          if (!open) setEditingAdvisor(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit advisor</DialogTitle>
            <DialogDescription>
              Update advisor identity and status.
            </DialogDescription>
          </DialogHeader>
          {editingAdvisor ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={editingAdvisor.firstName}
                  onChange={(event) =>
                    setEditingAdvisor((prev) =>
                      prev ? { ...prev, firstName: event.target.value } : prev,
                    )
                  }
                  className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                />
                <input
                  value={editingAdvisor.lastName}
                  onChange={(event) =>
                    setEditingAdvisor((prev) =>
                      prev ? { ...prev, lastName: event.target.value } : prev,
                    )
                  }
                  className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                />
              </div>
              <input
                value={editingAdvisor.email}
                onChange={(event) =>
                  setEditingAdvisor((prev) =>
                    prev ? { ...prev, email: event.target.value } : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              />
              <select
                value={editingAdvisor.status}
                onChange={(event) =>
                  setEditingAdvisor((prev) =>
                    prev ? { ...prev, status: event.target.value } : prev,
                  )
                }
                className="h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                <option value="PENDING_VERIFICATION">
                  PENDING_VERIFICATION
                </option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              disabled={!editingAdvisor || updateAdvisor.isPending}
              onClick={() => {
                if (!editingAdvisor) return;
                updateAdvisor.mutate(
                  {
                    advisorId: editingAdvisor.id,
                    firstName: editingAdvisor.firstName.trim(),
                    lastName: editingAdvisor.lastName.trim(),
                    email: editingAdvisor.email.trim(),
                    status: editingAdvisor.status,
                  },
                  {
                    onSuccess: () => setEditingAdvisor(null),
                  },
                );
              }}
            >
              {updateAdvisor.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteAdvisorRow)}
        onOpenChange={(open) => {
          if (!open) setDeleteAdvisorRow(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete advisor</DialogTitle>
            <DialogDescription>
              This action permanently removes the advisor account and links.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAdvisorRow(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteAdvisorRow || deleteAdvisor.isPending}
              onClick={() => {
                if (!deleteAdvisorRow) return;
                deleteAdvisor.mutate(deleteAdvisorRow.id, {
                  onSuccess: () => setDeleteAdvisorRow(null),
                });
              }}
            >
              {deleteAdvisor.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
