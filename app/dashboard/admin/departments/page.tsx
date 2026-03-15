import { AdminPageComingSoon } from "@/components/dashboard/admin/admin-page-coming-soon";

export default function AdminDepartmentsPage() {
  return (
    <AdminPageComingSoon
      title="Departments & Programs"
      summary="Structure faculties, departments, and academic programs so advising workflows align with institutional hierarchy and ownership."
      outcomes={[
        "Centralized management of faculties, departments, and major programs.",
        "Assign default advisor pools by academic unit and intake year.",
        "Control visibility rules for students, advisors, and coordinators.",
        "Keep institutional structure synchronized for reporting accuracy.",
      ]}
      implementationPlan={[
        "Create department/program models and admin CRUD flows.",
        "Add advisor assignment rules and program-level capacity settings.",
        "Introduce import/export support for institutional structure updates.",
        "Connect departments to analytics and filtering across all modules.",
      ]}
    />
  );
}
