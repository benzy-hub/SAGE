import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function StudentProgressPage() {
  return (
    <RolePageComingSoon
      title="Progress Tracking"
      summary="See how you are advancing through your academic journey with clear indicators, milestones, and support opportunities."
      outcomes={[
        "Progress indicators for goals, milestones, and academic standing.",
        "Clear visibility into completed and upcoming requirements.",
        "Signals that highlight where support may be needed.",
        "A motivating dashboard for consistent academic follow-through.",
      ]}
      implementationPlan={[
        "Build progress cards and milestone timeline views.",
        "Add academic standing, completion, and risk indicators.",
        "Show advisor-linked next actions and support recommendations.",
        "Support progress exports and shareable advising summaries.",
      ]}
    />
  );
}
