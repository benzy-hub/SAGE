"use client";

import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminReports } from "@/hooks/use-admin";

interface TrendRow {
  month: string;
  students: number;
  advisors: number;
  admins: number;
  total: number;
}

export default function AdminReportsPage() {
  const { data, isLoading, error } = useAdminReports();

  return (
    <AdminDataView<TrendRow>
      title="Analytics & Reports"
      summary="Track monthly user growth by role and monitor active-rate performance for governance reporting."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={data?.kpis}
      items={data?.trend ?? []}
      columns={[
        { key: "month", label: "Month", render: (row) => row.month },
        { key: "students", label: "Students", render: (row) => row.students },
        { key: "advisors", label: "Advisors", render: (row) => row.advisors },
        { key: "admins", label: "Admins", render: (row) => row.admins },
        { key: "total", label: "Total", render: (row) => row.total },
      ]}
      emptyTitle="No report trend data"
      emptyMessage="User activity trend data will appear when account records exist."
    />
  );
}
