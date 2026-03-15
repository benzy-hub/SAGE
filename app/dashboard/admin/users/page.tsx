import { AdminPageComingSoon } from "@/components/dashboard/admin/admin-page-coming-soon";

export default function AdminUsersPage() {
  return (
    <AdminPageComingSoon
      title="User Management"
      summary="Manage the full lifecycle of student and advisor accounts with a secure, searchable, and audit-friendly interface."
      outcomes={[
        "Search, filter, and segment users by role, status, and activity.",
        "Suspend, activate, or verify accounts with clear system feedback.",
        "View complete user profile timelines and engagement summaries.",
        "Bulk actions for onboarding campaigns and data clean-up.",
      ]}
      implementationPlan={[
        "Build role-aware user table with pagination and advanced filters.",
        "Add account action workflows (activate/suspend/verify/reset).",
        "Introduce activity timeline and last-login diagnostics.",
        "Add bulk operations with confirmation and rollback-safe guards.",
      ]}
    />
  );
}
