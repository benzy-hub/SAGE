"use client";

import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminSupport } from "@/hooks/use-admin";

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
  const { data, isLoading, error } = useAdminSupport();

  return (
    <AdminDataView<SupportRow>
      title="Support & Escalations"
      summary="Monitor account reviews, Say Hi messages, and motivational quote requests from one support queue."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={data?.metrics}
      items={data?.items ?? []}
      columns={[
        { key: "issue", label: "Issue", render: (row) => row.issue },
        { key: "priority", label: "Priority", render: (row) => row.priority },
        { key: "owner", label: "Owner", render: (row) => row.owner },
        { key: "email", label: "Email", render: (row) => row.email },
        {
          key: "details",
          label: "Details",
          render: (row) => row.details ?? "—",
        },
        { key: "status", label: "Status", render: (row) => row.status },
        {
          key: "openedAt",
          label: "Opened",
          render: (row) => new Date(row.openedAt).toLocaleString(),
        },
      ]}
      emptyTitle="No support items"
      emptyMessage="Support queue items appear when users need review or when visitors submit Say Hi messages and quote requests."
    />
  );
}
