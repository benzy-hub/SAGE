"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Advisee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  studentId: string;
  college: string;
  department: string;
  program: string;
  level: string;
  year: number;
}

interface AdviseeData {
  metrics: {
    totalAdvisees: number;
    pendingRequests: number;
    departments: number;
    activeStudents: number;
  };
  items: Advisee[];
}

export default function AdvisorAdviseesPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AdviseeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (search = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/advisor/advisees?search=${encodeURIComponent(search)}`,
        { cache: "no-store" },
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to load advisees");
      }
      setData(payload as AdviseeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load advisees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="sage-section-chip inline-flex">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Advisee Management
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
            Track accepted advisees and identify where outreach is needed.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search advisees"
            className="w-full lg:w-80 h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
          />
          <button
            type="button"
            onClick={() => void load(query)}
            className="h-10 px-4 rounded-lg border border-foreground/20 bg-background text-sm font-medium"
          >
            Search
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <p className="text-xs uppercase text-muted-foreground">Departments</p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.departments ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs uppercase text-muted-foreground">
            Active students
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.activeStudents ?? 0}
          </p>
        </article>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-foreground bg-background">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading advisees...
          </div>
        ) : (data?.items.length ?? 0) === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No advisees found.
          </div>
        ) : (
          <table className="w-full min-w-210">
            <thead>
              <tr className="border-b border-foreground/10">
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  S/N
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Matric
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Program
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs uppercase text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-foreground/10 last:border-none"
                >
                  <td className="px-4 py-3 text-sm text-muted-foreground font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <p className="font-medium text-foreground">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-muted-foreground">{student.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {student.studentId}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {student.department}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {student.program}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {student.level}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {student.status}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          window.location.assign(
                            `/dashboard/advisor/appointments?studentId=${encodeURIComponent(student.id)}`,
                          )
                        }
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-foreground/20 px-3 text-xs font-medium"
                      >
                        Appointments
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.location.assign(
                            `/dashboard/advisor/case-notes?studentId=${encodeURIComponent(student.id)}`,
                          )
                        }
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-foreground/20 px-3 text-xs font-medium"
                      >
                        Notes
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          window.location.assign(
                            `/dashboard/advisor/academic-plan?studentId=${encodeURIComponent(student.id)}`,
                          )
                        }
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-foreground/20 px-3 text-xs font-medium"
                      >
                        Plan
                      </button>
                      <Link
                        href={`/dashboard/advisor/messages?contactId=${encodeURIComponent(student.id)}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
                      >
                        Chat
                      </Link>
                    </div>
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
