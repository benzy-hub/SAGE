import { BadgeCheck, Layers, Target } from "lucide-react";

interface AdminPageComingSoonProps {
  title: string;
  summary: string;
  outcomes: string[];
  implementationPlan: string[];
}

export function AdminPageComingSoon({
  title,
  summary,
  outcomes,
  implementationPlan,
}: AdminPageComingSoonProps) {
  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
        <div className="sage-section-chip self-start">
          <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
            {title}
          </span>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          {summary}
        </p>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="bg-background border-2 border-foreground rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            What this page will deliver
          </h2>
          <ul className="mt-3 space-y-2 text-sm sm:text-base text-muted-foreground">
            {outcomes.map((item) => (
              <li key={item} className="inline-flex items-start gap-2">
                <BadgeCheck className="w-4 h-4 mt-1 text-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-background border-2 border-foreground rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground inline-flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Implementation roadmap
          </h2>
          <ol className="mt-3 space-y-2 text-sm sm:text-base text-muted-foreground list-decimal pl-5">
            {implementationPlan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-5 bg-background border-2 border-dashed border-foreground/30 rounded-2xl p-4 sm:p-5">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Status:</strong> Structured and
          planned. This module is intentionally scaffolded with a user-centered
          roadmap so implementation can proceed with consistent UX and
          measurable outcomes.
        </p>
      </div>
    </section>
  );
}
