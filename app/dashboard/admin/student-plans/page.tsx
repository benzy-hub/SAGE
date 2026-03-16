"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface PlanPayload {
  metrics: {
    totalMilestones: number;
    completedMilestones: number;
    completionRate: number;
    customPlanItems: number;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  profile: {
    studentId: string;
    college: string;
    department: string;
    program: string;
    level: string;
    year: number;
  };
  recommendations: string[];
  generatedItems: Array<{
    id: string;
    level: string;
    year: number;
    title: string;
    status: "DONE" | "IN_PROGRESS" | "UPCOMING";
    focus: string;
  }>;
  items: Array<{
    id: string;
    title: string;
    term: string;
    targetDate: string | null;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    notes: string;
    advisorGuidance: string;
    createdByRole: "STUDENT" | "ADVISOR" | "ADMIN";
  }>;
}

const STATUS_CLASS: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-700 border border-gray-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",
  DONE: "bg-green-50 text-green-700 border border-green-200",
  UPCOMING: "bg-slate-100 text-slate-700 border border-slate-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default function AdminStudentPlansPage() {
  const [data, setData] = useState<PlanPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const studentId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("studentId") ?? "";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!studentId) {
        setError("Missing studentId");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/admin/students/${encodeURIComponent(studentId)}/academic-plan`,
          { cache: "no-store" },
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load student plan");
        }
        setData(payload as PlanPayload);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load student plan",
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [studentId]);

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="sage-section-chip inline-flex">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Student Academic Plan Oversight
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
            Admin visibility into student roadmap progress, completion health,
            and advisor guidance quality.
          </p>
        </div>
        <Link
          href="/dashboard/admin/students"
          className="inline-flex items-center rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm font-medium"
        >
          Back to students
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border-2 border-foreground bg-background p-6 text-sm text-muted-foreground">
          Loading student plan...
        </div>
      ) : data ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <article className="bg-background border-2 border-foreground rounded-xl p-3">
              <p className="text-xs uppercase text-muted-foreground">Student</p>
              <p className="text-sm font-semibold mt-1">
                {data.student.firstName} {data.student.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.student.email}
              </p>
            </article>
            <article className="bg-background border-2 border-foreground rounded-xl p-3">
              <p className="text-xs uppercase text-muted-foreground">
                Completion
              </p>
              <p className="text-2xl font-bold mt-1">
                {data.metrics.completionRate}%
              </p>
            </article>
            <article className="bg-background border-2 border-foreground rounded-xl p-3">
              <p className="text-xs uppercase text-muted-foreground">
                Custom items
              </p>
              <p className="text-2xl font-bold mt-1">
                {data.metrics.customPlanItems}
              </p>
            </article>
            <article className="bg-background border-2 border-foreground rounded-xl p-3">
              <p className="text-xs uppercase text-muted-foreground">
                Department
              </p>
              <p className="text-sm font-semibold mt-1">
                {data.profile.department}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data.profile.level}
              </p>
            </article>
          </div>

          <div className="rounded-2xl border-2 border-foreground bg-background p-4">
            <p className="text-sm font-semibold text-foreground">
              System recommendations
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {data.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-foreground bg-background divide-y divide-foreground/10">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Custom plan items
              </p>
            </div>
            {data.items.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No custom plan items added yet.
              </div>
            ) : (
              data.items.map((item) => (
                <article
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="w-40 shrink-0">
                    <p className="text-xs uppercase text-muted-foreground">
                      {item.term}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.targetDate
                        ? new Date(item.targetDate).toLocaleDateString()
                        : "No target date"}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    {item.notes ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.notes}
                      </p>
                    ) : null}
                    {item.advisorGuidance ? (
                      <p className="text-xs text-primary mt-1">
                        Advisor guidance: {item.advisorGuidance}
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge status={item.status} />
                </article>
              ))
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
