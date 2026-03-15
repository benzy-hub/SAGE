import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function StudentAcademicPlanPage() {
  return (
    <RolePageComingSoon
      title="Academic Plan"
      summary="Turn advising guidance into a visible academic roadmap with milestones, requirements, and clear next-term planning."
      outcomes={[
        "A clean semester-by-semester academic roadmap.",
        "Program requirement visibility and completion tracking.",
        "Recommended next actions after advising sessions.",
        "Better preparation for registration and milestone decisions.",
      ]}
      implementationPlan={[
        "Build student roadmap view with semester groupings.",
        "Add requirement tracking and completion indicators.",
        "Connect advisor recommendations to academic plan actions.",
        "Support plan adjustments and approval-ready workflows.",
      ]}
    />
  );
}
