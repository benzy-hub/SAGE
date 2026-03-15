import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function StudentResourcesPage() {
  return (
    <RolePageComingSoon
      title="Resources & Support"
      summary="Find the right campus services, guides, and next-step resources without searching across disconnected systems."
      outcomes={[
        "Curated support resources based on student needs and context.",
        "Quick access to academic, financial, and wellbeing services.",
        "Guided recommendations after appointments or advisor actions.",
        "A more supportive and discoverable student experience.",
      ]}
      implementationPlan={[
        "Create categorized resource hub with search and filtering.",
        "Add personalized recommendations based on student context.",
        "Connect resources to advising plans and progress triggers.",
        "Track engagement so support content can improve over time.",
      ]}
    />
  );
}
