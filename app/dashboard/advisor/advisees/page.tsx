import { RolePageComingSoon } from "@/components/dashboard/role/role-page-coming-soon";

export default function AdvisorAdviseesPage() {
  return (
    <RolePageComingSoon
      title="Advisee Management"
      summary="Track every student in your care with a focused workspace for status reviews, outreach, milestones, and intervention follow-up."
      outcomes={[
        "Segment advisees by risk, year level, and latest advising activity.",
        "Review student snapshots with history, blockers, and next steps.",
        "Prioritize outreach lists for follow-up and intervention campaigns.",
        "Keep advising continuity visible across every student interaction.",
      ]}
      implementationPlan={[
        "Build advisee roster table with search, filters, and saved views.",
        "Add per-student snapshot panels with goals and advising timeline.",
        "Support tags, alerts, and follow-up reminders for outreach management.",
        "Link advisee records to appointments, notes, and communication history.",
      ]}
    />
  );
}
