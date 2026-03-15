import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function AdvisorCaseNotesPage() {
  return (
    <RolePageComingSoon
      title="Case Notes"
      summary="Capture structured advising notes that make follow-up easier, preserve context, and improve handoffs across long student journeys."
      outcomes={[
        "Consistent note templates for academic, behavioral, and support topics.",
        "Secure documentation with quick access to student context.",
        "Action items and follow-ups attached to each advising interaction.",
        "Cleaner longitudinal records for escalations and continuity.",
      ]}
      implementationPlan={[
        "Build note editor with structured templates and privacy controls.",
        "Support note history, edits, and advisor attribution.",
        "Add follow-up tasks and due dates directly from notes.",
        "Connect notes to advisees, appointments, and analytics signals.",
      ]}
    />
  );
}
