import { AdminPageComingSoon } from "@/components/dashboard/admin/admin-page-coming-soon";

export default function AdminNotificationsPage() {
  return (
    <AdminPageComingSoon
      title="Notifications & Campaigns"
      summary="Design and deliver targeted communications for students and advisors through announcements, reminders, and lifecycle campaigns."
      outcomes={[
        "Send segmented announcements by role, level, or department.",
        "Schedule reminders for appointments, verification, and deadlines.",
        "Track delivery, open, and engagement metrics per campaign.",
        "Maintain reusable message templates with governance controls.",
      ]}
      implementationPlan={[
        "Build campaign composer with audience filters and preview.",
        "Integrate email/in-app channels with retry-safe delivery queues.",
        "Add delivery analytics with timeline and per-channel performance.",
        "Implement template library with approval and version history.",
      ]}
    />
  );
}
