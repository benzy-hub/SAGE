"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId: string | null;
  college: string | null;
  department: string | null;
  level: string | null;
  year: number | null;
}

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/me/profile", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Failed to load profile");
      }
      const item = payload?.item as Profile;
      setProfile(item);
      setForm({
        firstName: item.firstName ?? "",
        lastName: item.lastName ?? "",
        email: item.email ?? "",
        phone: item.phone ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
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
            Student Settings
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
          Manage your profile details used across advising, appointments, and
          messaging.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border-2 border-foreground bg-background p-4 space-y-3">
          <h2 className="text-sm font-semibold">Profile</h2>
          <input
            value={form.firstName}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                firstName: event.target.value,
              }))
            }
            placeholder="First name"
            className="w-full h-10 rounded-lg border border-foreground/20 px-3 text-sm"
          />
          <input
            value={form.lastName}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                lastName: event.target.value,
              }))
            }
            placeholder="Last name"
            className="w-full h-10 rounded-lg border border-foreground/20 px-3 text-sm"
          />
          <input
            value={form.email}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                email: event.target.value,
              }))
            }
            placeholder="Email"
            className="w-full h-10 rounded-lg border border-foreground/20 px-3 text-sm"
          />
          <input
            value={form.phone}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                phone: event.target.value,
              }))
            }
            placeholder="Phone"
            className="w-full h-10 rounded-lg border border-foreground/20 px-3 text-sm"
          />

          <Button
            disabled={saving || loading}
            onClick={() => {
              setSaving(true);
              setError("");
              setMessage("");
              void fetch("/api/me/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              })
                .then(async (response) => {
                  const payload = await response.json().catch(() => ({}));
                  if (!response.ok) {
                    throw new Error(
                      payload?.error ?? "Failed to save settings",
                    );
                  }
                  setMessage("Profile updated successfully.");
                  await load();
                })
                .catch((err: unknown) => {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Failed to save settings",
                  );
                })
                .finally(() => setSaving(false));
            }}
          >
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </div>

        <div className="rounded-2xl border-2 border-foreground bg-background p-4 space-y-2 text-sm">
          <h2 className="text-sm font-semibold">Academic summary</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading profile...</p>
          ) : (
            <>
              <p>
                <span className="text-muted-foreground">Matric:</span>{" "}
                {profile?.studentId ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">College:</span>{" "}
                {profile?.college ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Department:</span>{" "}
                {profile?.department ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Level:</span>{" "}
                {profile?.level ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Year:</span>{" "}
                {profile?.year ?? "—"}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
