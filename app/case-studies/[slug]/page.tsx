import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Users,
  MessageSquare,
  CalendarCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseStudy {
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  outcomes: string[];
}

const caseStudies: Record<string, CaseStudy> = {
  "client-engagement-platform": {
    title: "Client Engagement Platform",
    industry: "Large higher-education advisory unit",
    challenge:
      "The institution struggled with fragmented communication, missed follow-ups, and inconsistent student engagement across multiple advisory teams.",
    solution:
      "SAGE unified appointments, messaging, case notes, and follow-up workflows into a single platform, giving every advisor a live picture of each student's journey.",
    outcomes: [
      "40% increase in student satisfaction scores",
      "Faster advisor response times across the board",
      "Improved follow-up consistency after every session",
      "Clearer accountability with shared activity records",
    ],
  },
  "progress-tracking-system": {
    title: "Progress Tracking System",
    industry: "Fast-growing student success office",
    challenge:
      "Advisors had no shared way to detect students who were falling behind until the problem became serious.",
    solution:
      "We implemented SAGE dashboards, session notes, and recurring check-ins so advisors could identify risk earlier and intervene before issues escalated.",
    outcomes: [
      "25% improvement in academic success rates",
      "Earlier identification of at-risk students",
      "More consistent note-taking and action tracking",
      "Stronger advisor-student continuity from semester to semester",
    ],
  },
  "multi-location-coordination": {
    title: "Multi-Location Coordination",
    industry: "Institution with distributed advisory teams",
    challenge:
      "Different campuses and departments were using separate systems, making coordination and reporting slow and error-prone.",
    solution:
      "SAGE brought every team into one environment, with unified appointment workflows, secure messaging, and centralised reporting across locations.",
    outcomes: [
      "35% improvement in advisor productivity",
      "Consistent student experience across locations",
      "Central visibility for administrators and department leads",
      "Less duplication of effort and fewer scheduling conflicts",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(caseStudies).map((slug) => ({ slug }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudies[slug];
  if (!study) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/#use-cases"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Case Studies
        </Link>
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 max-w-6xl">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center px-4 py-1.5 bg-primary rounded-lg mb-5">
            <span className="text-sm font-medium text-primary-foreground">
              Case Study
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {study.title}
          </h1>
          <p className="text-primary font-medium mb-3">{study.industry}</p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {study.solution}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-10">
          <div className="bg-secondary border-2 border-foreground rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">The challenge</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {study.challenge}
            </p>

            <h2 className="text-xl font-semibold mb-4">How SAGE helped</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: CalendarCheck2,
                  title: "Structured scheduling",
                  body: "Students book only into real advisor availability, reducing missed meetings and manual coordination.",
                },
                {
                  icon: MessageSquare,
                  title: "Direct communication",
                  body: "Secure messaging keeps every conversation linked to the student relationship and easy to revisit.",
                },
                {
                  icon: Users,
                  title: "Relationship management",
                  body: "Advisors maintain a clear picture of every student they support across sessions and semesters.",
                },
                {
                  icon: BarChart3,
                  title: "Actionable visibility",
                  body: "Reporting and dashboards reveal outcomes, bottlenecks, and where further support is needed most.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-background rounded-2xl border border-foreground/10 p-4"
                >
                  <item.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-foreground rounded-[2rem] p-6 sm:p-8 text-background">
            <h2 className="text-xl font-semibold mb-5">Outcomes delivered</h2>
            <div className="space-y-4">
              {study.outcomes.map((outcome) => (
                <div
                  key={outcome}
                  className="rounded-2xl bg-background/5 border border-background/10 p-4"
                >
                  <p className="text-sm leading-relaxed">{outcome}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-background/10">
              <p className="text-sm text-background/70 mb-4">
                Want similar results for your institution or advising team?
              </p>
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/#contact">Request a consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
