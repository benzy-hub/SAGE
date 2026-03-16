"use client";

import { useEffect, useState } from "react";

interface InsightsData {
  metrics: {
    totalAdvisees: number;
    pendingRequests: number;
    totalAppointments: number;
    completedAppointments: number;
    caseNotes: number;
    messagesSent: number;
  };
  trend: Array<{
    month: string;
    appointments: number;
    completed: number;
    notes: number;
  }>;
}

export default function AdvisorInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/advisor/insights", {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load insights");
        }
        setData(payload as InsightsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load insights",
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
            Insights
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
          Performance and workload trends for your advising activity.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs uppercase text-muted-foreground">Advisees</p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.totalAdvisees ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Pending requests
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.pendingRequests ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Appointments
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.totalAppointments ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Completed sessions
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.completedAppointments ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs uppercase text-muted-foreground">Case notes</p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.caseNotes ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Messages sent
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.messagesSent ?? 0}
          </p>
        </article>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-foreground bg-background">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading trends...
          </div>
        ) : (data?.trend.length ?? 0) === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No trend data yet.
          </div>
        ) : (
          <table className="w-full min-w-160">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Month
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Appointments
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Completed
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.trend.map((row) => (
                <tr
                  key={row.month}
                  className="border-b border-foreground/10 last:border-none"
                >
                  <td className="px-4 py-3 text-sm text-foreground">
                    {row.month}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {row.appointments}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {row.completed}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
