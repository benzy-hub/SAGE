"use client";

import { AdminDataView } from "@/components/dashboard/admin/admin-data-view";
import { useAdminAppointments } from "@/hooks/use-admin";

interface AppointmentRow {
  id: string;
  advisorName: string;
  advisorEmail: string;
  studentName: string;
  studentEmail: string;
  requestedBy: string;
  scheduledFor: string;
  agenda: string;
  notes: string;
  status: string;
  channel: string;
  updatedAt: string;
}

export default function AdminAppointmentsPage() {
  const { data, isLoading, error } = useAdminAppointments();

  return (
    <AdminDataView<AppointmentRow>
      title="Appointment Governance"
      summary="Track every real appointment across students and advisors, including who requested it, the meeting agenda, notes, and final status."
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      metrics={data?.metrics}
      items={data?.items ?? []}
      columns={[
        {
          key: "advisorName",
          label: "Advisor",
          render: (row) => row.advisorName,
        },
        {
          key: "studentName",
          label: "Student",
          render: (row) => (
            <div>
              <p>{row.studentName}</p>
              <p className="text-xs text-muted-foreground">
                {row.studentEmail}
              </p>
            </div>
          ),
        },
        {
          key: "scheduledFor",
          label: "Scheduled For",
          render: (row) => new Date(row.scheduledFor).toLocaleString(),
        },
        {
          key: "requestedBy",
          label: "Requested By",
          render: (row) => row.requestedBy,
        },
        {
          key: "status",
          label: "Status",
          render: (row) => {
            const cls: Record<string, string> = {
              REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
              CONFIRMED: "bg-green-50 text-green-700 border-green-200",
              COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
              CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
            };
            return (
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  cls[row.status] ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {row.status}
              </span>
            );
          },
        },
        {
          key: "agenda",
          label: "Agenda",
          render: (row) => row.agenda || "—",
        },
        {
          key: "notes",
          label: "Notes",
          render: (row) => row.notes || "—",
        },
        {
          key: "updatedAt",
          label: "Last Updated",
          render: (row) => new Date(row.updatedAt).toLocaleString(),
        },
      ]}
      emptyTitle="No appointment records"
      emptyMessage="Appointment governance data will appear when advisor-student connections become active."
    />
  );
}
