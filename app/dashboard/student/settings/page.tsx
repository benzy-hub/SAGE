import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function StudentSettingsPage() {
  return (
    <RolePageComingSoon
      title="Student Settings"
      summary="Control profile details, notification preferences, and dashboard behavior with a simple settings experience that follows you across devices."
      outcomes={[
        "Manage account details and profile preferences clearly.",
        "Tune reminders and communication channels to your routine.",
        "Keep workspace behavior consistent on web and mobile layouts.",
        "Improve trust by making account controls easy to understand.",
      ]}
      implementationPlan={[
        "Build editable account and profile settings panels.",
        "Add notification preferences with mobile-friendly controls.",
        "Support password, security, and communication settings.",
        "Persist preferences consistently across student dashboard modules.",
      ]}
    />
  );
}
