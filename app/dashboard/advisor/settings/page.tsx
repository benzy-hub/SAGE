import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function AdvisorSettingsPage() {
  return (
    <RolePageComingSoon
      title="Advisor Settings"
      summary="Manage your profile, availability, communication preferences, and workspace behavior from one clean settings experience."
      outcomes={[
        "Availability windows and booking preferences in one place.",
        "Notification controls tuned to real advising workflows.",
        "Professional profile details for student-facing trust and clarity.",
        "Workspace preferences that stay consistent across devices.",
      ]}
      implementationPlan={[
        "Build profile and availability settings forms.",
        "Add notification and booking preference controls.",
        "Support timezone, reminders, and mobile-friendly preference sync.",
        "Persist settings cleanly across advisor dashboard modules.",
      ]}
    />
  );
}
