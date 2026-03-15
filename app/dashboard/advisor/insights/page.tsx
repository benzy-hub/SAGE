import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function AdvisorInsightsPage() {
  return (
    <RolePageComingSoon
      title="Insights"
      summary="See advising performance, student engagement, and risk trends in one place so you can focus time where it matters most."
      outcomes={[
        "Advisor workload visibility and support-demand patterns.",
        "Student risk and engagement signals highlighted early.",
        "Meeting volume, outcomes, and follow-through summaries.",
        "Actionable trends that help improve advising quality over time.",
      ]}
      implementationPlan={[
        "Create advisor KPI cards and role-specific charts.",
        "Highlight students needing attention using engagement thresholds.",
        "Add trend views for session outcomes and outreach effectiveness.",
        "Support exportable insights for department-level review.",
      ]}
    />
  );
}
