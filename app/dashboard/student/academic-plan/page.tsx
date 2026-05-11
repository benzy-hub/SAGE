"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface GeneratedPlanItem {
  id: string;
  level: string;
  year: number;
  title: string;
  status: "DONE" | "IN_PROGRESS" | "UPCOMING";
  focus: string;
}

interface PlanItem {
  id: string;
  title: string;
  term: string;
  targetDate: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  notes: string;
  advisorGuidance: string;
  createdByRole: "STUDENT" | "ADVISOR" | "ADMIN";
}

interface PlanData {
  metrics: {
    totalMilestones: number;
    completedMilestones: number;
    completionRate: number;
    customPlanItems: number;
  };
  profile?: {
    studentId: string;
    college: string;
    department: string;
    program: string;
    level: string;
    year: number;
  };
  recommendations: string[];
  generatedItems: GeneratedPlanItem[];
  items: PlanItem[];
}

const STATUS_CLASS: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-700 border border-gray-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",
  DONE: "bg-green-50 text-green-700 border border-green-200",
  UPCOMING: "bg-slate-100 text-slate-700 border border-slate-200",
};

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function StudentAcademicPlanPage() {
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [term, setTerm] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/student/academic-plan", {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to load academic plan");
      }
      setData(payload as PlanData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load academic plan",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setTitle("");
    setTerm("");
    setTargetDate("");
    setStatus("TODO");
    setNotes("");
    setEditingId("");
  };

  const startEdit = (item: PlanItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setTerm(item.term);
    setTargetDate(item.targetDate ? item.targetDate.slice(0, 10) : "");
    setStatus(item.status);
    setNotes(item.notes ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitForm = async () => {
    if (!title.trim() || !term.trim()) {
      setError("Title and term are required");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      term: term.trim(),
      targetDate: targetDate ? `${targetDate}T00:00:00.000Z` : "",
      status,
      notes: notes.trim(),
    };

    try {
      const response = await fetch(
        editingId
          ? `/api/student/academic-plan/${editingId}`
          : "/api/student/academic-plan",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to save plan item");
      }

      toast.success(editingId ? "Plan item updated" : "Plan item created");
      resetForm();
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save plan item",
      );
      setError(err instanceof Error ? err.message : "Failed to save plan item");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm("Delete this plan item? This cannot be undone.")) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/student/academic-plan/${itemId}`, {
        method: "DELETE",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to delete plan item");
      }
      toast.success("Plan item deleted");
      if (editingId === itemId) {
        resetForm();
      }
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete plan item",
      );
      setError(
        err instanceof Error ? err.message : "Failed to delete plan item",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-5">
      <div>
        <div className="sage-section-chip inline-flex">
          <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
            Academic Plan
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
          Build and manage your own academic roadmap with full create, update,
          and delete support.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-3 gap-3">
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">Milestones</p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.totalMilestones ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">Completed</p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.completedMilestones ?? 0}
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">Completion</p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.completionRate ?? 0}%
          </p>
        </article>
        <article className="bg-background border-2 border-foreground rounded-xl p-3">
          <p className="text-xs text-muted-foreground uppercase">
            Custom plans
          </p>
          <p className="text-2xl font-bold mt-1">
            {data?.metrics.customPlanItems ?? 0}
          </p>
        </article>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-4">
        <div className="rounded-2xl border-2 border-foreground bg-background p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            {editingId ? "Edit custom plan item" : "Create custom plan item"}
          </p>
          <div className="grid md:grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Complete SIWES application"
            className="h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
          />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="e.g. 2026 / Semester 1"
            className="h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
          />
          <input
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            type="date"
            className="h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
          />
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "TODO" | "IN_PROGRESS" | "DONE")
            }
            className="h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
          </div>
          <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Notes, blockers, required documents, or advisor follow-up"
          className="w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm resize-none"
          />
          <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || !title.trim() || !term.trim()}
            onClick={() => void submitForm()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-primary disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Add item"}
          </button>
          {editingId ? (
            <button
              type="button"
              disabled={saving}
              onClick={resetForm}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-foreground/20 px-4 text-sm font-medium"
            >
              Cancel edit
            </button>
          ) : null}
          </div>
        </div>

        <div className="space-y-4">
          {data?.profile ? (
            <div className="rounded-2xl border-2 border-foreground bg-background p-4 text-sm text-foreground grid sm:grid-cols-2 gap-2">
          <p>
            <span className="text-muted-foreground">Matric:</span>{" "}
            {data.profile.studentId}
          </p>
          <p>
            <span className="text-muted-foreground">College:</span>{" "}
            {data.profile.college}
          </p>
          <p>
            <span className="text-muted-foreground">Department:</span>{" "}
            {data.profile.department}
          </p>
          <p>
            <span className="text-muted-foreground">Program:</span>{" "}
            {data.profile.program}
          </p>
          <p>
            <span className="text-muted-foreground">Level:</span>{" "}
            {data.profile.level}
          </p>
          <p>
            <span className="text-muted-foreground">Year:</span>{" "}
            {data.profile.year}
          </p>
            </div>
          ) : null}

          <div className="rounded-2xl border-2 border-foreground bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Smart guidance</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              {(data?.recommendations ?? []).map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-background divide-y divide-foreground/10">
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            Generated roadmap milestones
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Automatically generated from your department structure.
          </p>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading roadmap...
          </div>
        ) : (data?.generatedItems.length ?? 0) === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No generated roadmap milestones yet.
          </div>
        ) : (
          data?.generatedItems.map((item) => (
            <article
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
            >
              <div className="w-34 shrink-0">
                <p className="text-xs uppercase text-muted-foreground">
                  {item.level} level
                </p>
                <p className="text-sm font-semibold">Year {item.year}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.focus}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </article>
          ))
        )}
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-background divide-y divide-foreground/10">
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            Custom plan items (CRUD)
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your own milestones and keep them updated over time.
          </p>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading plan...
          </div>
        ) : (data?.items.length ?? 0) === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No custom plan items yet. Add your first action from the form above.
          </div>
        ) : (
          data?.items.map((item) => (
            <article
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
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
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={item.status} />
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-foreground/20 px-3 text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void deleteItem(item.id)}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-destructive/35 px-3 text-xs font-medium text-destructive"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
