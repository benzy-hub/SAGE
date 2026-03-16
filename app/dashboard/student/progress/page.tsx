"use client";

import { useEffect, useState } from "react";

interface ProgressData {
  metrics: {
    completionRate: number;
    currentYear: number;
    programDuration: number;
    advisorConnections: number;
    upcomingAppointments: number;
    completedAppointments: number;
  };
  milestones: Array<{
    id: string;
    title: string;
    status: "DONE" | "PENDING";
  }>;
}

export default function StudentProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/student/progress", {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load progress");
        }
        setData(payload as ProgressData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load progress",
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-5">
      <div>
        <div className="sage-section-chip inline-flex">
          <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
            Progress Tracking
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
          Monitor your academic momentum and milestone completion in one place.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">Completion</p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.completionRate ?? 0}%
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">
            Current year
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.currentYear ?? 0}/
            {data?.metrics.programDuration ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">
            Advisor links
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.advisorConnections ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">
            Upcoming sessions
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.upcomingAppointments ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">
            Completed sessions
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.completedAppointments ?? 0}
          </p>
        </article>
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-background divide-y divide-foreground/10">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading milestones...
          </div>
        ) : (data?.milestones.length ?? 0) === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No milestones yet.
          </div>
        ) : (
          data?.milestones.map((milestone) => (
            <article
              key={milestone.id}
              className="p-4 flex items-center justify-between gap-3"
            >
              <p className="text-sm text-foreground">{milestone.title}</p>
              <span className="inline-flex items-center justify-center rounded-full border border-foreground/20 px-3 py-1 text-xs font-medium">
                {milestone.status}
              </span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
