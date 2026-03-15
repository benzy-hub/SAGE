import { AdminPageComingSoon } from "@/components/dashboard/admin/admin-page-coming-soon";

export default function AdminReportsPage() {
  return (
    <AdminPageComingSoon
      title="Analytics & Reports"
      summary="Transform platform activity into actionable insights through role-based analytics, trend monitoring, and scheduled exports."
      outcomes={[
        "Institution-level KPIs for advising impact and student engagement.",
        "Comparative reports by faculty, level, and advisor teams.",
        "Automated weekly/monthly digest exports.",
        "Decision-ready dashboards for leadership meetings.",
      ]}
      implementationPlan={[
        "Create KPI widgets with time range and segmentation controls.",
        "Add visual trend charts for advising outcomes.",
        "Implement report export formats (CSV/PDF).",
        "Enable scheduled report delivery and subscriptions.",
      ]}
    />
  );
}
