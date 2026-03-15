import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function AdvisorAppointmentsPage() {
  return (
    <RolePageComingSoon
      title="Appointments"
      summary="Coordinate advising sessions with a schedule that supports availability planning, session preparation, and post-meeting follow-through."
      outcomes={[
        "Daily and weekly views for advising workload management.",
        "Student-ready preparation details before each session begins.",
        "Cancellation, reschedule, and no-show tracking with visibility.",
        "Session outcomes tied directly to notes and action items.",
      ]}
      implementationPlan={[
        "Create responsive calendar and agenda views for advisors.",
        "Add appointment status workflows and meeting preparation cards.",
        "Support reschedule and follow-up actions from the same workflow.",
        "Connect appointments with notes, reminders, and messaging threads.",
      ]}
    />
  );
}
