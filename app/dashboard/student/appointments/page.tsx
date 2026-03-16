"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  Calendar,
  UserPlus,
  MessageSquare,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

interface AdvisorContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AvailabilitySlot {
  _id: string;
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
  isBooked: boolean;
}

interface AppointmentItem {
  id: string;
  advisor: AdvisorContact | null;
  scheduledFor: string;
  agenda: string;
  notes: string;
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  requestedBy: string;
}

interface AvailableAdvisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "bg-amber-50 text-amber-700 border border-amber-200",
  CONFIRMED: "bg-green-50 text-green-700 border border-green-200",
  COMPLETED: "bg-blue-50 text-blue-700 border border-blue-200",
  CANCELLED: "bg-gray-100 text-gray-500 border border-gray-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"
      }`}
    >
      {status}
    </span>
  );
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function daysUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "";
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default function StudentAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<"appointments" | "find" | "rate">(
    "appointments",
  );

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [connectedAdvisors, setConnectedAdvisors] = useState<AdvisorContact[]>(
    [],
  );
  const [availableAdvisors, setAvailableAdvisors] = useState<
    AvailableAdvisor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmCancelId, setConfirmCancelId] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  // Booking state
  const [advisorId, setAdvisorId] = useState("");
  const [advisorSlots, setAdvisorSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [manualDateTime, setManualDateTime] = useState("");
  const [agenda, setAgenda] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Find advisor state
  const [requestingAdvisorId, setRequestingAdvisorId] = useState("");

  // Rating state
  const [ratingApptId, setRatingApptId] = useState("");
  const [ratingAdvisorId, setRatingAdvisorId] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingReview, setRatingReview] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [submittedRatings, setSubmittedRatings] = useState<Set<string>>(
    new Set(),
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [apptRes, connRes] = await Promise.all([
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/connections", { cache: "no-store" }),
      ]);
      const apptData = await apptRes.json();
      const connData = await connRes.json();
      if (!apptRes.ok)
        throw new Error(apptData?.error ?? "Failed to load appointments");
      if (!connRes.ok)
        throw new Error(connData?.error ?? "Failed to load connections");
      setAppointments((apptData?.items ?? []) as AppointmentItem[]);
      setConnectedAdvisors(
        ((connData?.connectedContacts ?? []) as AdvisorContact[]).sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        ),
      );
      setAvailableAdvisors(
        ((connData?.availableAdvisors ?? []) as AvailableAdvisor[]).sort(
          (a, b) => a.firstName.localeCompare(b.firstName),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!advisorId) {
      setAdvisorSlots([]);
      setSelectedSlotId("");
      return;
    }
    setSlotsLoading(true);
    fetch(`/api/advisor/${advisorId}/slots`)
      .then((r) => r.json())
      .then((d) => setAdvisorSlots((d?.slots ?? []) as AvailabilitySlot[]))
      .catch(() => setAdvisorSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [advisorId]);

  const upcoming = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.status !== "CANCELLED" &&
          new Date(a.scheduledFor).getTime() > Date.now(),
      ),
    [appointments],
  );

  const completedUnrated = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === "COMPLETED" && !submittedRatings.has(a.id),
      ),
    [appointments, submittedRatings],
  );

  const chatHref = (id: string) =>
    `/dashboard/student/messages?contactId=${encodeURIComponent(id)}`;

  const formatSlotLabel = (slot: AvailabilitySlot) => {
    if (slot.isRecurring && slot.dayOfWeek !== undefined) {
      return `Every ${DAY_NAMES[slot.dayOfWeek]} · ${slot.startTime} – ${slot.endTime}`;
    }
    if (slot.specificDate) {
      return `${new Date(slot.specificDate).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })} · ${slot.startTime} – ${slot.endTime}`;
    }
    return `${slot.startTime} – ${slot.endTime}`;
  };

  const submitBooking = async () => {
    if (!advisorId) return;
    if (!selectedSlotId && !manualDateTime) {
      toast.error("Pick a time slot or enter a date/time");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, string> = { targetUserId: advisorId, agenda };
      if (selectedSlotId) body.slotId = selectedSlotId;
      else body.scheduledFor = manualDateTime;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error ?? "Failed to request appointment");
      setAdvisorId("");
      setSelectedSlotId("");
      setManualDateTime("");
      setAgenda("");
      toast.success("Appointment request submitted successfully");
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to request appointment",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to cancel");
      toast.success("Appointment cancelled");
      setConfirmCancelId("");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    }
  };

  const requestAdvisor = async (targetAdvisorId: string) => {
    setRequestingAdvisorId(targetAdvisorId);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetAdvisorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to send request");
      toast.success("Connection request sent! Waiting for advisor acceptance.");
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send request",
      );
    } finally {
      setRequestingAdvisorId("");
    }
  };

  const submitRating = async () => {
    if (!ratingApptId || !ratingAdvisorId || !ratingValue) return;
    setRatingSubmitting(true);
    try {
      const res = await fetch("/api/advisor-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisorId: ratingAdvisorId,
          appointmentId: ratingApptId,
          rating: ratingValue,
          review: ratingReview,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to submit rating");
      toast.success("Rating submitted — thank you for your feedback!");
      setSubmittedRatings((prev) => new Set([...prev, ratingApptId]));
      setRatingApptId("");
      setRatingAdvisorId("");
      setRatingValue(5);
      setRatingReview("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit rating",
      );
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-8 flex items-center justify-center min-h-60">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading appointments…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="sage-section-chip inline-flex">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Appointments
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Book sessions, find your advisor, and rate your experience.
          </p>
        </div>
        {completedUnrated.length > 0 && (
          <button
            onClick={() => setActiveTab("rate")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {completedUnrated.length} session
            {completedUnrated.length > 1 ? "s" : ""} to rate
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background border-2 border-foreground rounded-xl p-1 w-fit overflow-x-auto">
        {(
          [
            { key: "appointments", label: "My Appointments", icon: Calendar },
            { key: "find", label: "Find Advisor", icon: UserPlus },
            { key: "rate", label: "Rate Advisor", icon: Star },
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {/* ── Appointments Tab ─────────────────────────────────────────────────── */}
      {activeTab === "appointments" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: appointments.length },
              { label: "Upcoming", value: upcoming.length },
              {
                label: "Completed",
                value: appointments.filter((a) => a.status === "COMPLETED")
                  .length,
              },
              {
                label: "Cancelled",
                value: appointments.filter((a) => a.status === "CANCELLED")
                  .length,
              },
            ].map(({ label, value }) => (
              <article
                key={label}
                className="bg-background border-2 border-foreground rounded-xl p-3"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </article>
            ))}
          </div>

          {/* Book Session */}
          <div
            ref={formRef}
            className="bg-background border-2 border-foreground rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Book a session</p>
            </div>

            {connectedAdvisors.length === 0 ? (
              <div className="rounded-xl border border-dashed border-foreground/20 px-4 py-4 text-sm text-muted-foreground text-center space-y-2">
                <p>No accepted advisor yet.</p>
                <button
                  onClick={() => setActiveTab("find")}
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Find and request an advisor →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Select Advisor
                  </label>
                  <div className="relative">
                    <select
                      value={advisorId}
                      onChange={(e) => {
                        setAdvisorId(e.target.value);
                        setSelectedSlotId("");
                        setManualDateTime("");
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm appearance-none pr-8"
                    >
                      <option value="">Choose an advisor…</option>
                      {connectedAdvisors.map((adv) => (
                        <option key={adv.id} value={adv.id}>
                          {adv.firstName} {adv.lastName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {advisorId && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Available Time Slots
                    </label>
                    {slotsLoading ? (
                      <p className="text-xs text-muted-foreground py-2">
                        Loading available slots…
                      </p>
                    ) : advisorSlots.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {advisorSlots.map((slot) => (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() => {
                              setSelectedSlotId(slot._id);
                              setManualDateTime("");
                            }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                              selectedSlotId === slot._id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-foreground/15 bg-background hover:border-primary/40"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {formatSlotLabel(slot)}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedSlotId("")}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left ${
                            !selectedSlotId
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-foreground/15 bg-background hover:border-primary/40"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          Custom date & time
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-700">
                        This advisor hasn&apos;t set availability slots yet —
                        pick a custom time below.
                      </div>
                    )}
                  </div>
                )}

                {advisorId && !selectedSlotId && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Preferred Date & Time
                    </label>
                    <input
                      value={manualDateTime}
                      onChange={(e) => setManualDateTime(e.target.value)}
                      type="datetime-local"
                      min={new Date(Date.now() + 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 16)}
                      className="w-full h-10 px-3 rounded-lg border border-foreground/20 bg-background text-sm"
                    />
                  </div>
                )}

                {advisorId && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      Session Agenda (optional)
                    </label>
                    <textarea
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      rows={3}
                      placeholder="Topics to discuss, questions you want answered…"
                      className="w-full rounded-lg border border-foreground/20 bg-background text-sm px-3 py-2 resize-none"
                    />
                  </div>
                )}

                {advisorId && (
                  <Button
                    className="w-full"
                    disabled={
                      submitting || (!selectedSlotId && !manualDateTime)
                    }
                    onClick={submitBooking}
                  >
                    {submitting ? "Submitting…" : "Submit Appointment Request"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Advisor quick-access cards */}
          {connectedAdvisors.length > 0 && (
            <div className="rounded-2xl border-2 border-foreground bg-background p-4 space-y-3">
              <p className="text-sm font-semibold">Your Advisors</p>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {connectedAdvisors.map((advisor) => (
                  <article
                    key={advisor.id}
                    className="rounded-xl border border-foreground/15 p-3 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">
                          {advisor.firstName[0]}
                          {advisor.lastName[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {advisor.firstName} {advisor.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {advisor.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAdvisorId(advisor.id);
                          formRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }}
                      >
                        Book Session
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={chatHref(advisor.id)}>
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Chat
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Appointments table */}
          {appointments.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-foreground/15 p-8 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No appointments yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Book a session with your advisor above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border-2 border-foreground bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground bg-secondary">
                    <th className="text-left p-3 font-semibold w-10">#</th>
                    <th className="text-left p-3 font-semibold">Advisor</th>
                    <th className="text-left p-3 font-semibold">Date & Time</th>
                    <th className="text-left p-3 font-semibold">Agenda</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-right p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt, idx) => (
                    <tr
                      key={appt.id}
                      className="border-b border-foreground/10 last:border-0 hover:bg-secondary/50 transition-colors"
                    >
                      <td className="p-3 text-muted-foreground">{idx + 1}</td>
                      <td className="p-3">
                        {appt.advisor ? (
                          <div>
                            <p className="font-medium">
                              {appt.advisor.firstName} {appt.advisor.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {appt.advisor.email}
                            </p>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground">
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-medium">
                          {new Date(appt.scheduledFor).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appt.scheduledFor).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                          {daysUntil(appt.scheduledFor) ? (
                            <span className="ml-1 text-primary font-medium">
                              · {daysUntil(appt.scheduledFor)}
                            </span>
                          ) : null}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="max-w-xs truncate text-muted-foreground text-xs">
                          {appt.agenda || "—"}
                        </p>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {appt.status === "COMPLETED" &&
                            appt.advisor &&
                            !submittedRatings.has(appt.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                onClick={() => {
                                  setRatingApptId(appt.id);
                                  setRatingAdvisorId(appt.advisor!.id);
                                  setActiveTab("rate");
                                }}
                              >
                                <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
                                Rate
                              </Button>
                            )}
                          {(appt.status === "REQUESTED" ||
                            appt.status === "CONFIRMED") &&
                            (confirmCancelId === appt.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    void cancelAppointment(appt.id)
                                  }
                                >
                                  Confirm Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setConfirmCancelId("")}
                                >
                                  Keep
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30"
                                onClick={() => setConfirmCancelId(appt.id)}
                              >
                                Cancel
                              </Button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Find Advisor Tab ─────────────────────────────────────────────────── */}
      {activeTab === "find" && (
        <div className="space-y-4">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Request an Advisor</p>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Send a connection request to any advisor below. Once accepted, you
              can book sessions and chat with them.
            </p>

            {availableAdvisors.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium">
                  You&apos;re connected with all available advisors!
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Switch to the Appointments tab to book a session.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {availableAdvisors.map((advisor) => (
                  <article
                    key={advisor.id}
                    className="rounded-xl border border-foreground/15 bg-background p-4 space-y-4 hover:border-foreground/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary-foreground">
                          {advisor.firstName[0]}
                          {advisor.lastName[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {advisor.firstName} {advisor.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {advisor.email}
                        </p>
                        <p className="text-xs text-primary font-medium mt-0.5">
                          Academic Advisor
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={requestingAdvisorId === advisor.id}
                      onClick={() => void requestAdvisor(advisor.id)}
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      {requestingAdvisorId === advisor.id
                        ? "Sending…"
                        : "Request as My Advisor"}
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-foreground/10 bg-background p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">How it works:</span>{" "}
              Your request is sent to the advisor for approval. Once they
              accept, you&apos;ll appear in their advisee list and can book
              sessions.
            </p>
          </div>
        </div>
      )}

      {/* ── Rate Advisor Tab ─────────────────────────────────────────────────── */}
      {activeTab === "rate" && (
        <div className="space-y-4">
          {completedUnrated.length === 0 && !ratingApptId ? (
            <div className="text-center py-10">
              <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No sessions to rate yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ratings appear here once your advisor marks a session as
                completed.
              </p>
            </div>
          ) : (
            completedUnrated.map((appt) => (
              <div
                key={appt.id}
                className={`bg-background border-2 rounded-2xl p-5 space-y-4 transition-all ${
                  ratingApptId === appt.id
                    ? "border-primary shadow-sm"
                    : "border-foreground"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">
                      Session with {appt.advisor?.firstName}{" "}
                      {appt.advisor?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(appt.scheduledFor).toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    {appt.agenda && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        &ldquo;{appt.agenda}&rdquo;
                      </p>
                    )}
                  </div>
                  <StatusBadge status={appt.status} />
                </div>

                {ratingApptId === appt.id ? (
                  <div className="space-y-4 border-t border-foreground/10 pt-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Your Rating
                      </p>
                      <StarRating
                        value={ratingValue}
                        onChange={setRatingValue}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {ratingValue === 5
                          ? "Excellent"
                          : ratingValue === 4
                            ? "Very Good"
                            : ratingValue === 3
                              ? "Good"
                              : ratingValue === 2
                                ? "Fair"
                                : "Poor"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                        Review (optional)
                      </label>
                      <textarea
                        value={ratingReview}
                        onChange={(e) => setRatingReview(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Share your experience with this advisor…"
                        className="w-full rounded-lg border border-foreground/20 bg-background text-sm px-3 py-2 resize-none"
                      />
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {ratingReview.length}/500
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={ratingSubmitting || !ratingValue}
                        onClick={submitRating}
                      >
                        {ratingSubmitting ? "Submitting…" : "Submit Rating"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRatingApptId("");
                          setRatingAdvisorId("");
                          setRatingValue(5);
                          setRatingReview("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setRatingApptId(appt.id);
                      setRatingAdvisorId(appt.advisor?.id ?? "");
                      setRatingValue(5);
                      setRatingReview("");
                    }}
                  >
                    <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Rate this session
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
