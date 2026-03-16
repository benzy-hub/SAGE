"use client";

import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminAuditLog } from "@/hooks/use-admin";

interface AuditRow {
  id: string;
  category: string;
  action: string;
  actor: string;
  occurredAt: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export default function AdminAuditLogPage() {
  const { data, isLoading, error } = useAdminAuditLog();

  return (
    <AdminDataView<AuditRow>
      title="Audit Log"
      summary="Review operational and security events with actor attribution, severity levels, and event chronology."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={data?.metrics}
      items={data?.items ?? []}
      columns={[
        { key: "category", label: "Category", render: (row) => row.category },
        { key: "action", label: "Action", render: (row) => row.action },
        { key: "actor", label: "Actor", render: (row) => row.actor },
        { key: "severity", label: "Severity", render: (row) => row.severity },
        {
          key: "occurredAt",
          label: "Occurred",
          render: (row) => new Date(row.occurredAt).toLocaleString(),
        },
      ]}
      emptyTitle="No audit events"
      emptyMessage="Audit entries will populate as administrative and user actions occur."
    />
  );
}
