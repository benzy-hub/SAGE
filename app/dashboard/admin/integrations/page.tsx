"use client";

import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminIntegrations } from "@/hooks/use-admin";

interface IntegrationRow {
  id: string;
  name: string;
  status: string;
  lastSyncAt: string;
  successRate: number;
}

export default function AdminIntegrationsPage() {
  const { data, isLoading, error } = useAdminIntegrations();

  return (
    <AdminDataView<IntegrationRow>
      title="Integrations & API"
      summary="Monitor third-party integration reliability, synchronization freshness, and platform connector health."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={data?.metrics}
      items={data?.items ?? []}
      columns={[
        { key: "name", label: "Integration", render: (row) => row.name },
        { key: "status", label: "Status", render: (row) => row.status },
        {
          key: "lastSyncAt",
          label: "Last Sync",
          render: (row) => new Date(row.lastSyncAt).toLocaleString(),
        },
        {
          key: "successRate",
          label: "Success Rate",
          render: (row) => `${row.successRate}%`,
        },
      ]}
      emptyTitle="No integrations configured"
      emptyMessage="Integration connectors will appear once registry records are provisioned."
    />
  );
}
