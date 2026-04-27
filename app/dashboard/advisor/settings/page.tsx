"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  ChevronRight,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function AdvisorSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

  const handleSave = () => {
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
          throw new Error(payload?.error ?? "Failed to save settings");
        }
        setMessage("Profile updated successfully.");
        await load();
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to save settings",
        );
      })
      .finally(() => setSaving(false));
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully");
      router.replace("/auth/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <section className="w-full space-y-4 pb-6">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Advisor Settings
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-card-foreground">
              A cleaner workspace for advising operations.
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Manage your professional profile, review role details, and keep
              account actions close at hand in a compact app-style layout.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-3">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {message}
        </div>
      ) : null}

      <div className="grid xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] gap-4">
        <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-secondary p-2.5">
              <UserRound className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Advisor profile
              </h2>
              <p className="text-sm text-muted-foreground">
                Keep your contact details consistent across advisee workflows.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                First name
              </span>
              <input
                value={form.firstName}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    firstName: event.target.value,
                  }))
                }
                placeholder="First name"
                className="h-12 w-full rounded-2xl border border-foreground/10 bg-secondary/60 px-4 text-sm outline-none transition focus:border-foreground/30 focus:bg-background"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Last name
              </span>
              <input
                value={form.lastName}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Last name"
                className="h-12 w-full rounded-2xl border border-foreground/10 bg-secondary/60 px-4 text-sm outline-none transition focus:border-foreground/30 focus:bg-background"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email address
              </span>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-foreground/10 bg-secondary/60 px-4">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  value={form.email}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Email"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>
          </div>

          <Button
            disabled={saving || loading}
            onClick={handleSave}
            className="mt-4 h-12 w-full rounded-2xl bg-foreground text-background hover:bg-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-secondary p-2.5">
                <Briefcase className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Role summary
                </h2>
                <p className="text-sm text-muted-foreground">
                  A quick account snapshot built for small screens.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: "Role", value: profile?.role ?? "ADVISOR" },
                {
                  label: "Full name",
                  value:
                    `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() ||
                    "—",
                },
                { label: "Email", value: profile?.email ?? "—" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="max-w-[55%] truncate text-sm font-medium text-foreground">
                    {loading ? "Loading..." : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Workspace defaults
            </h2>
            <div className="mt-3 space-y-2">
              {[
                {
                  icon: Bell,
                  title: "Session notifications",
                  subtitle: "Request and schedule alerts remain enabled.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure access",
                  subtitle:
                    "Your advisor workspace stays protected per session.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-3"
                  >
                    <div className="rounded-xl bg-background p-2">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        disabled={loggingOut}
        className="h-12 w-full rounded-2xl border-2 border-foreground/15 bg-background text-foreground hover:bg-secondary"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {loggingOut ? "Signing out..." : "Logout"}
      </Button>
    </section>
  );
}
