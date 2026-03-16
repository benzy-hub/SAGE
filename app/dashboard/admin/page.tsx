"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAdminOverview } from "@/hooks/use-admin";
import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";

const quickAccessModules = [
  {
    title: "User Operations",
    summary:
      "Manage role assignments, account verification, and status transitions.",
    href: "/dashboard/admin/users",
  },
  {
    title: "Advisor Capacity",
    summary: "Track advisor utilization and pending request load in one panel.",
    href: "/dashboard/admin/advisors",
  },
  {
    title: "Scheduling Quality",
    summary:
      "Inspect appointment outcomes and identify cancellation pressure points.",
    href: "/dashboard/admin/appointments",
  },
  {
    title: "Communications",
    summary: "Compose role-based campaigns and validate target reach quickly.",
    href: "/dashboard/admin/notifications",
  },
];

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminOverview();

  return (
    <>
      <AdminDataView
        title="Admin Overview"
        summary="A real-time control surface for growth, engagement, and governance quality across the full platform."
        loading={isLoading}
        error={error instanceof Error ? error.message : undefined}
        metrics={data?.metrics}
        items={data?.recentUsers ?? []}
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
            key: "createdAt",
            label: "Joined",
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
          },
        ]}
        emptyTitle="No recent users"
        emptyMessage="User registrations will appear here once activity starts."
      />

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
          Operations Workspace
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Every module is now live and connected to admin APIs through React
          Query and shared state management.
        </p>

        <div className="mt-5 grid md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-5">
          {quickAccessModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              data-tour={`admin-module-${module.href.split("/").pop()}`}
              className="group bg-background border-2 border-foreground rounded-2xl p-5 hover:-translate-y-0.5 transition-all"
            >
              <p className="text-base font-semibold text-foreground">
                {module.title}
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {module.summary}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-primary">
                Open module
                <ArrowRight className="w-4 h-4" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
