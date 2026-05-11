"use client";

import Link from "next/link";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle,
  FileText,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  useAdminOverview,
  useAdminSettings,
  useAdminSupport,
} from "@/hooks/use-admin";
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
  const { data: settingsData, isLoading: settingsLoading } = useAdminSettings();
  const { data: supportData, isLoading: supportLoading } = useAdminSupport();
  const integrationItems = settingsData?.item?.integrations ?? [];
  const connectedIntegrations = integrationItems.filter(
    (item) => item.status === "CONNECTED",
  ).length;

  const adminHighlights = [
    {
      label: "Platform health",
      value: `${data?.metrics?.activeRate ?? 0}%`,
      note: "Overall service quality",
    },
    {
      label: "Open support",
      value: `${supportData?.metrics?.openTickets ?? 0}`,
      note: "Tickets awaiting response",
    },
    {
      label: "Connected integrations",
      value: `${connectedIntegrations}`,
      note: "Verified platform connectors",
    },
  ];

  return (
    <>
      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div className="max-w-3xl">
            <div className="sage-section-chip inline-flex">
              <span className="inline-flex items-center gap-2 text-xl sm:text-2xl font-medium text-primary-foreground">
                <ShieldCheck className="w-5 h-5" />
                Admin Command Center
              </span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Keep operations, governance, and platform quality in one clear
              control surface.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Monitor user activity, support escalations, and academic
              operations from a dashboard designed to stay readable, fast, and
              professional at every screen size.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Operational oversight
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <Zap className="w-3.5 h-3.5 text-primary" />
                Connector visibility
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Export-ready audit trail
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/admin/support"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary"
          >
            Review support queue
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/admin/audit-log"
            className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Open audit log
          </Link>
        </div>
      </section>

      <AdminDataView
        title="Admin Overview"
        summary="A focused operational surface for governance, support health, user activity, and platform-level visibility."
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
        emptyTitle="No users found"
        emptyMessage="Users will appear here once activity starts."
      />

      {/* Settings & Support Grid */}
      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Settings Card */}
        <div className="bg-background border-2 border-foreground rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Settings & Connections
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Platform defaults and verified service links
              </p>
            </div>
            <Link
              href="/dashboard/admin/settings"
              className="text-sm font-medium text-primary hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!settingsLoading && settingsData?.item ? (
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  Support Email
                </p>
                <p className="text-sm font-bold text-foreground mt-1 break-all">
                  {settingsData.item.supportEmail}
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  Registration
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {settingsData.item.allowRegistration ? "On" : "Off"}
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  Maintenance
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {settingsData.item.maintenanceMode ? "On" : "Off"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {integrationItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {item.status === "CONNECTED" ? (
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.note}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs font-semibold text-foreground">
                    {item.successRate}%
                  </p>
                </div>
              </div>
            ))}
            {!settingsLoading && integrationItems.length === 0 ? (
              <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground">
                No verified third-party services are configured.
              </div>
            ) : null}
          </div>
        </div>

        {/* Support & Escalations Card */}
        <div className="bg-background border-2 border-foreground rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Support & Escalations
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Active support queue
              </p>
            </div>
            <Link
              href="/dashboard/admin/support"
              className="text-sm font-medium text-primary hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!supportLoading && supportData?.metrics ? (
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  Open Tickets
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {supportData.metrics.openTickets ?? 0}
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {supportData.metrics.highPriority ?? 0}
                </p>
              </div>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground font-medium">
                  Service Coverage
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {supportData.metrics.serviceCoverage ?? 0}
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {supportData?.items?.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.issue}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.owner}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      item.priority === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "MEDIUM"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
          Operations Workspace
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Every module is connected to live admin APIs through shared data
          patterns, giving you a single place to manage platform operations.
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
