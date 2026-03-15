import { AdminPageComingSoon } from "@/components/dashboard/admin/admin-page-coming-soon";

export default function AdminSettingsPage() {
  return (
    <AdminPageComingSoon
      title="Platform Settings"
      summary="Configure system-wide defaults, policy controls, and operational preferences that shape the advising experience."
      outcomes={[
        "Policy controls for onboarding, verification, and user permissions.",
        "Notification templates and communication preferences.",
        "Role matrix for permission governance.",
        "Safe configuration updates with approval checkpoints.",
      ]}
      implementationPlan={[
        "Build modular settings sections with validation guards.",
        "Add role-permission editor with change preview.",
        "Create template management for emails and alerts.",
        "Track configuration history with reversible changes.",
      ]}
    />
  );
}
