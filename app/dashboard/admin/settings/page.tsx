"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Link2,
  LogOut,
  Mail,
  Save,
  Settings2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAdminSettings, useSaveAdminSettings } from "@/hooks/use-admin";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useAdminSettings();
  const saveSettings = useSaveAdminSettings();
  const [loggingOut, setLoggingOut] = useState(false);

  const allowRegistrationRef = useRef<HTMLInputElement>(null);
  const maintenanceModeRef = useRef<HTMLInputElement>(null);
  const supportEmailRef = useRef<HTMLInputElement>(null);
  const defaultStudentYearRef = useRef<HTMLInputElement>(null);
  const maxMessageLengthRef = useRef<HTMLInputElement>(null);
  const notifyAdminsOnNewUserRef = useRef<HTMLInputElement>(null);

  const item = data?.item;
  const integrations = item?.integrations ?? [];

  const submit = () => {
    saveSettings.mutate({
      allowRegistration:
        allowRegistrationRef.current?.checked ??
        Boolean(item?.allowRegistration),
      maintenanceMode:
        maintenanceModeRef.current?.checked ?? Boolean(item?.maintenanceMode),
      supportEmail:
        supportEmailRef.current?.value?.trim() ||
        String(item?.supportEmail ?? "support@sage.local"),
      defaultStudentYear: Number(
        defaultStudentYearRef.current?.value ?? item?.defaultStudentYear ?? 1,
      ),
      maxMessageLength: Number(
        maxMessageLengthRef.current?.value ?? item?.maxMessageLength ?? 2000,
      ),
      notifyAdminsOnNewUser:
        notifyAdminsOnNewUserRef.current?.checked ??
        Boolean(item?.notifyAdminsOnNewUser),
    });
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
              Admin Settings
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-card-foreground">
              Platform controls in a cleaner mobile command view.
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Update platform defaults, monitor verified connections, and keep
              account actions within reach without a desktop-heavy layout.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-3">
            <Settings2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load settings"}
        </div>
      ) : null}

      <div className="grid xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] gap-4">
        <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-secondary p-2.5">
              <Wrench className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Platform defaults
              </h2>
              <p className="text-sm text-muted-foreground">
                These controls affect registration, messaging, and daily ops.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">
                Allow registration
              </span>
              <input
                ref={allowRegistrationRef}
                type="checkbox"
                defaultChecked={Boolean(item?.allowRegistration)}
                className="h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">
                Maintenance mode
              </span>
              <input
                ref={maintenanceModeRef}
                type="checkbox"
                defaultChecked={Boolean(item?.maintenanceMode)}
                className="h-4 w-4"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Support email
              </span>
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-foreground/10 bg-secondary/60 px-4">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  ref={supportEmailRef}
                  defaultValue={item?.supportEmail ?? "support@sage.local"}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Default year
                </span>
                <input
                  ref={defaultStudentYearRef}
                  type="number"
                  min={1}
                  max={8}
                  defaultValue={item?.defaultStudentYear ?? 1}
                  className="h-12 w-full rounded-2xl border border-foreground/10 bg-secondary/60 px-4 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Max message
                </span>
                <input
                  ref={maxMessageLengthRef}
                  type="number"
                  min={100}
                  max={5000}
                  defaultValue={item?.maxMessageLength ?? 2000}
                  className="h-12 w-full rounded-2xl border border-foreground/10 bg-secondary/60 px-4 text-sm outline-none"
                />
              </label>
            </div>

            <label className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
              <span className="font-medium text-foreground">
                Notify admins on new user
              </span>
              <input
                ref={notifyAdminsOnNewUserRef}
                type="checkbox"
                defaultChecked={Boolean(item?.notifyAdminsOnNewUser)}
                className="h-4 w-4"
              />
            </label>
          </div>

          <Button
            onClick={submit}
            disabled={saveSettings.isPending || isLoading}
            className="mt-4 h-12 w-full rounded-2xl bg-foreground text-background hover:bg-primary"
          >
            <Save className="mr-2 h-4 w-4" />
            {saveSettings.isPending ? "Saving..." : "Save settings"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-secondary p-2.5">
                <Link2 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Verified connections
                </h2>
                <p className="text-sm text-muted-foreground">
                  Only the integrations backed by real platform use are shown
                  here.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="rounded-2xl bg-secondary/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {integration.name}
                    </p>
                    <span className="text-xs font-semibold text-foreground">
                      {typeof integration.successRate === "number"
                        ? `${integration.successRate}%`
                        : integration.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {integration.status} · {integration.note}
                  </p>
                </div>
              ))}
              {integrations.length === 0 ? (
                <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
                  No verified integrations configured.
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-foreground/10 bg-background p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Admin safeguards
            </h2>
            <div className="mt-3 space-y-2">
              {[
                {
                  icon: Bell,
                  title: "Operational alerts",
                  subtitle: "Important admin notifications remain enabled.",
                },
                {
                  icon: ShieldCheck,
                  title: "Session security",
                  subtitle: "Admin access stays protected and audited.",
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
