"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Resource = {
  id: string;
  title: string;
  category: "Academic" | "Career" | "Wellbeing" | "Finance";
  description: string;
  action: string;
  href: string;
};

const defaultResources: Resource[] = [
  {
    id: "academic-advising",
    title: "Academic Advising Office",
    category: "Academic",
    description: "Book support sessions for course planning and registrations.",
    action: "Book advising session",
    href: "/dashboard/student/appointments",
  },
  {
    id: "study-skills",
    title: "Study Skills Hub",
    category: "Academic",
    description: "Improve time management, revision strategy, and exam prep.",
    action: "View learning guides",
    href: "/dashboard/student/academic-plan",
  },
  {
    id: "career-centre",
    title: "Career Centre",
    category: "Career",
    description: "CV review, internship coaching, and placement opportunities.",
    action: "Open career support",
    href: "/dashboard/student/messages",
  },
  {
    id: "wellbeing-centre",
    title: "Wellbeing & Counseling",
    category: "Wellbeing",
    description: "Confidential student mental health and wellbeing support.",
    action: "Contact counselor",
    href: "/dashboard/student/messages",
  },
  {
    id: "financial-aid",
    title: "Financial Aid Desk",
    category: "Finance",
    description: "Support for bursaries, grants, and tuition payment plans.",
    action: "Request financial support",
    href: "/dashboard/student/messages",
  },
];

export default function StudentResourcesPage() {
  const [completionRate, setCompletionRate] = useState<number>(75);
  const [advisorConnections, setAdvisorConnections] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/student/progress", {
          cache: "no-store",
        });
        const payload = await response.json();
        if (response.ok) {
          setCompletionRate(Number(payload?.metrics?.completionRate ?? 0));
          setAdvisorConnections(
            Number(payload?.metrics?.advisorConnections ?? 0),
          );
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const recommendations = useMemo(() => {
    const list: string[] = [];
    if (advisorConnections === 0) {
      list.push("Connect with an advisor to unlock personalized guidance.");
    }
    if (completionRate < 40) {
      list.push(
        "Use Study Skills Hub this week to strengthen learning routines.",
      );
    }
    if (completionRate >= 40 && completionRate < 70) {
      list.push("Schedule a mid-term check-in with your advisor.");
    }
    if (completionRate >= 70) {
      list.push("Engage Career Centre for internship and final-year planning.");
    }
    if (list.length === 0) {
      list.push("Keep consistency with monthly advising and progress reviews.");
    }
    return list;
  }, [advisorConnections, completionRate]);

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-5">
      <div>
        <div className="sage-section-chip inline-flex">
          <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
            Resources & Support
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
          Curated support resources and recommendations based on your advising
          progress.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <article className="rounded-2xl border-2 border-foreground bg-background p-4">
          <p className="text-xs text-muted-foreground uppercase">
            Progress-based tips
          </p>
          {loading ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Loading recommendations...
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm text-foreground list-disc list-inside">
              {recommendations.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          )}
        </article>
        <article className="rounded-2xl border-2 border-foreground bg-background p-4">
          <p className="text-xs text-muted-foreground uppercase">
            Student status
          </p>
          <p className="mt-2 text-sm text-foreground">
            Completion rate:{" "}
            <span className="font-semibold">{completionRate}%</span>
          </p>
          <p className="mt-1 text-sm text-foreground">
            Advisor connections:{" "}
            <span className="font-semibold">{advisorConnections}</span>
          </p>
          {loading ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Syncing latest student metrics...
            </p>
          ) : null}
        </article>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {defaultResources.map((resource) => (
          <article
            key={resource.id}
            className="rounded-2xl border-2 border-foreground bg-background p-4"
          >
            <p className="text-xs uppercase text-muted-foreground">
              {resource.category}
            </p>
            <h3 className="text-base font-semibold mt-1 text-foreground">
              {resource.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {resource.description}
            </p>
            <Link
              href={resource.href}
              className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {resource.action}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
