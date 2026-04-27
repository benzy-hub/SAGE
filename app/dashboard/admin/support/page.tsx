"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminSupport } from "@/hooks/use-admin";
import { CheckCircle, MessageSquare, AlertCircle } from "lucide-react";

interface SupportRow {
  id: string;
  issue: string;
  priority: string;
  owner: string;
  email: string;
  details?: string;
  openedAt: string;
  status: string;
}

export default function AdminSupportPage() {
  const { data, isLoading, error, refetch } = useAdminSupport();
  const [selectedTicket, setSelectedTicket] = useState<SupportRow | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleResolve = async (ticket: SupportRow) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: responseText,
          status: "RESOLVED",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to resolve ticket");

      toast.success("Ticket resolved and response sent");
      setSelectedTicket(null);
      setResponseText("");
      refetch?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resolve ticket",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminDataView<SupportRow>
        title="Support & Escalations"
        summary="Monitor account reviews, Say Hi messages, and motivational quote requests from one support queue."
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        metrics={data?.metrics}
        items={data?.items ?? []}
        columns={[
          { key: "issue", label: "Issue", render: (row) => row.issue },
          {
            key: "priority",
            label: "Priority",
            render: (row) => (
              <span
                className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                  row.priority === "HIGH"
                    ? "bg-red-100 text-red-700"
                    : row.priority === "MEDIUM"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                {row.priority}
              </span>
            ),
          },
          { key: "owner", label: "Owner", render: (row) => row.owner },
          { key: "email", label: "Email", render: (row) => row.email },
          {
            key: "details",
            label: "Details",
            render: (row) => (
              <span className="text-sm text-muted-foreground line-clamp-2">
                {row.details ?? "—"}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                  row.status === "RESOLVED"
                    ? "bg-green-100 text-green-700"
                    : row.status === "ESCALATED"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {row.status === "RESOLVED" && (
                  <CheckCircle className="w-3 h-3" />
                )}
                {row.status}
              </span>
            ),
          },
          {
            key: "openedAt",
            label: "Opened",
            render: (row) => new Date(row.openedAt).toLocaleString(),
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <Button
                size="sm"
                variant="outline"
                disabled={row.status === "RESOLVED"}
                onClick={() => setSelectedTicket(row)}
                className="flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {row.status === "RESOLVED" ? "Resolved" : "Respond"}
              </Button>
            ),
          },
        ]}
        emptyTitle="No support items"
        emptyMessage="Support queue items appear when users need review or when visitors submit Say Hi messages and quote requests."
      />

      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicket(null);
            setResponseText("");
          }
        }}
      >
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Resolve Support Ticket
            </DialogTitle>
            <DialogDescription>
              Send a professional response to resolve this support request.
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-secondary p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Issue
                    </p>
                    <p className="mt-1 font-medium">{selectedTicket.issue}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Priority
                    </p>
                    <span
                      className={`inline-flex mt-1 px-2 py-1 rounded text-xs font-semibold ${
                        selectedTicket.priority === "HIGH"
                          ? "bg-red-100 text-red-700"
                          : selectedTicket.priority === "MEDIUM"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      From
                    </p>
                    <p className="mt-1 font-medium">{selectedTicket.owner}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">
                      Email
                    </p>
                    <p className="mt-1 font-medium text-sm break-all">
                      {selectedTicket.email}
                    </p>
                  </div>
                </div>

                {selectedTicket.details && (
                  <div className="mt-4 pt-4 border-t border-foreground/10">
                    <p className="text-xs text-muted-foreground font-medium uppercase mb-2">
                      Request Details
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedTicket.details}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  Your Response (will be sent via email)
                </label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write a professional response addressing the customer's request..."
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  A confirmation email will be sent to {selectedTicket.email}{" "}
                  with your response and ticket will be marked as resolved.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTicket(null);
                setResponseText("");
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedTicket && handleResolve(selectedTicket)}
              disabled={submitting || !responseText.trim()}
            >
              {submitting ? "Resolving..." : "Resolve & Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
