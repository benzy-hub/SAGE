"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Advisee {
  id: string;
  firstName: string;
  lastName: string;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export default function AdvisorCaseNotesPage() {
  const [advisees, setAdvisees] = useState<Advisee[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [adviseesResponse, notesResponse] = await Promise.all([
        fetch("/api/advisor/advisees", { cache: "no-store" }),
        fetch("/api/advisor/case-notes", { cache: "no-store" }),
      ]);

      const adviseesPayload = await adviseesResponse.json();
      const notesPayload = await notesResponse.json();

      if (!adviseesResponse.ok) {
        throw new Error(adviseesPayload?.error ?? "Failed to load advisees");
      }

      if (!notesResponse.ok) {
        throw new Error(notesPayload?.error ?? "Failed to load case notes");
      }

      setAdvisees((adviseesPayload?.items ?? []) as Advisee[]);
      setNotes((notesPayload?.items ?? []) as NoteItem[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load case notes",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-5">
      <div>
        <div className="sage-section-chip inline-flex">
          <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
            Case Notes
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
          Capture and manage advisor notes tied to accepted advisees.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border-2 border-foreground bg-background p-4 space-y-2">
        <p className="text-sm font-semibold">Create case note</p>
        <select
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-foreground/20 text-sm"
        >
          <option value="">Select advisee</option>
          {advisees.map((advisee) => (
            <option key={advisee.id} value={advisee.id}>
              {advisee.firstName} {advisee.lastName}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Note title"
          className="w-full h-10 px-3 rounded-lg border border-foreground/20 text-sm"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Note content"
          rows={3}
          className="w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm resize-none"
        />
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Tags (comma separated)"
          className="w-full h-10 px-3 rounded-lg border border-foreground/20 text-sm"
        />
        <Button
          disabled={saving || !studentId || !title.trim() || !content.trim()}
          onClick={() => {
            setSaving(true);
            setError("");
            void fetch("/api/advisor/case-notes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentId,
                title,
                content,
                tags: tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              }),
            })
              .then(async (response) => {
                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(
                    payload?.error ?? "Failed to create case note",
                  );
                }
                setStudentId("");
                setTitle("");
                setContent("");
                setTags("");
                await load();
              })
              .catch((err: unknown) => {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to create case note",
                );
              })
              .finally(() => setSaving(false));
          }}
        >
          {saving ? "Saving..." : "Create note"}
        </Button>
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-background divide-y divide-foreground/10">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No case notes yet.
          </div>
        ) : (
          notes.map((note) => (
            <article key={note.id} className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {note.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.student
                      ? `${note.student.firstName} ${note.student.lastName}`
                      : "Unknown student"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>

              <textarea
                defaultValue={note.content}
                rows={3}
                className="w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm resize-none"
                onBlur={(event) => {
                  const nextContent = event.target.value.trim();
                  if (nextContent !== note.content) {
                    void fetch(`/api/advisor/case-notes/${note.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content: nextContent }),
                    }).then(() => load());
                  }
                }}
              />

              <div className="flex flex-wrap items-center gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={`${note.id}-${tag}`}
                    className="inline-flex rounded-full border border-foreground/20 px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setError("");
                  void fetch(`/api/advisor/case-notes/${note.id}`, {
                    method: "DELETE",
                  })
                    .then(async (response) => {
                      const payload = await response.json().catch(() => ({}));
                      if (!response.ok) {
                        throw new Error(
                          payload?.error ?? "Failed to delete case note",
                        );
                      }
                      await load();
                    })
                    .catch((err: unknown) => {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Failed to delete case note",
                      );
                    });
                }}
              >
                Delete note
              </Button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
