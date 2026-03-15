import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function StudentAppointmentsPage() {
  return (
    <RolePageComingSoon
      title="Appointments"
      summary="Book, review, and prepare for advising sessions from a mobile-friendly scheduling experience that keeps every next step visible."
      outcomes={[
        "Book and manage upcoming advising sessions with confidence.",
        "See appointment details, reminders, and preparation notes clearly.",
        "Handle reschedules and cancellations without losing context.",
        "Stay aligned with advisor expectations before each meeting.",
      ]}
      implementationPlan={[
        "Create student booking flow with advisor availability.",
        "Add agenda, reminder, and preparation details to each session.",
        "Support reschedule/cancel workflows with system feedback.",
        "Connect appointments to notes, recommendations, and messages.",
      ]}
    />
  );
}
