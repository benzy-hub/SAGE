"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ChevronDown,
  Users,
  Star,
} from "lucide-react";

interface AdviseeOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AppointmentItem {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  scheduledFor: string;
  agenda: string;
  notes: string;
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
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

interface RatingItem {
  studentName: string;
  rating: number;
  review?: string;
  createdAt: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
        />
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

export default function AdvisorAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<
    "appointments" | "availability" | "ratings"
  >("appointments");

  // Appointments state
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [advisees, setAdvisees] = useState<AdviseeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [studentFilterId, setStudentFilterId] = useState("");
  const [requestStudentId, setRequestStudentId] = useState("");
  const [requestDateTime, setRequestDateTime] = useState("");
  const [requestAgenda, setRequestAgenda] = useState("");
  const [requesting, setRequesting] = useState(false);

  // Availability state
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newDayOfWeek, setNewDayOfWeek] = useState("1");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:00");
  const [isRecurring, setIsRecurring] = useState(true);
  const [specificDate, setSpecificDate] = useState("");
  const [addingSlot, setAddingSlot] = useState(false);

  // Ratings state
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [ratingsAvg, setRatingsAvg] = useState(0);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [myAdvisorId, setMyAdvisorId] = useState("");

  // ── Load functions ────────────────────────────────────────────────────────

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const [apptRes, advRes] = await Promise.all([
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/advisor/advisees", { cache: "no-store" }),
      ]);
      const apptData = await apptRes.json();
      const advData = await advRes.json();
      if (!apptRes.ok)
        throw new Error(apptData?.error ?? "Failed to load appointments");
      if (!advRes.ok)
        throw new Error(advData?.error ?? "Failed to load advisees");

      // Extract advisor id from first appointment or fetch from /api/auth/me
      const myId = apptData?.items?.[0]?.advisor?.id ?? "";
      if (myId) setMyAdvisorId(myId);

      setAppointments((apptData?.items ?? []) as AppointmentItem[]);
      setAdvisees(
        ((advData?.items ?? []) as AdviseeOption[]).sort((a, b) =>
          a.firstName.localeCompare(b.firstName),
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await fetch("/api/advisor/availability");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load slots");
      setSlots((data?.slots ?? []) as AvailabilitySlot[]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load slots");
    } finally {
      setSlotsLoading(false);
    }
  };

  const loadRatings = async (advisorId: string) => {
    if (!advisorId) return;
    setRatingsLoading(true);
    try {
      const res = await fetch(`/api/advisor-ratings?advisorId=${advisorId}`);
      const data = await res.json();
      setRatings((data?.ratings ?? []) as RatingItem[]);
      setRatingsAvg(data?.average ?? 0);
    } catch {
      // silent
    } finally {
      setRatingsLoading(false);
    }
  };

  useEffect(() => {
    const nextStudentId = new URLSearchParams(window.location.search).get(
      "studentId",
    );
    setStudentFilterId(nextStudentId ?? "");
    setRequestStudentId(nextStudentId ?? "");
    void loadAppointments();
    void loadSlots();
  }, []);

  // Load own ID for ratings
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        const id = d?.user?.id ?? "";
        if (id) {
          setMyAdvisorId(id);
          void loadRatings(id);
        }
      })
      .catch(() => {});
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const createAdvisorAppointment = async () => {
    if (!requestStudentId || !requestDateTime) {
      setError("Select a student and date/time");
      return;
    }
    setRequesting(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: requestStudentId,
          scheduledFor: requestDateTime,
          agenda: requestAgenda,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error ?? "Failed to create appointment");
      setRequestDateTime("");
      setRequestAgenda("");
      toast.success("Appointment created successfully");
      await loadAppointments();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create appointment",
      );
      setError(
        err instanceof Error ? err.message : "Failed to create appointment",
      );
    } finally {
      setRequesting(false);
    }
  };

  const updateAppointment = async (
    id: string,
    payload: { status?: string; notes?: string },
  ) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(body?.error ?? "Failed to update appointment");
      toast.success("Appointment updated");
      await loadAppointments();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update appointment",
      );
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusyId("");
    }
  };

  const addSlot = async () => {
    if (!newStartTime || !newEndTime) return;
    if (newStartTime >= newEndTime) {
      toast.error("Start time must be before end time");
      return;
    }
    if (!isRecurring && !specificDate) {
      toast.error("Pick a specific date for one-off slots");
      return;
    }
    setAddingSlot(true);
    try {
      const res = await fetch("/api/advisor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: isRecurring ? Number(newDayOfWeek) : undefined,
          startTime: newStartTime,
          endTime: newEndTime,
          isRecurring,
          specificDate: !isRecurring ? specificDate : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to add slot");
      toast.success("Availability slot added");
      await loadSlots();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add slot");
    } finally {
      setAddingSlot(false);
    }
  };

  const deleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/advisor/availability?slotId=${slotId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Failed to delete slot");
      toast.success("Slot removed");
      await loadSlots();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete slot");
    }
  };

  const visibleItems = appointments.filter((a) =>
    studentFilterId ? a.student?.id === studentFilterId : true,
  );

  const metrics = {
    total: appointments.length,
    upcoming: appointments.filter(
      (a) => a.status !== "CANCELLED" && new Date(a.scheduledFor) > new Date(),
    ).length,
    requested: appointments.filter((a) => a.status === "REQUESTED").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <div className="sage-section-chip inline-flex">
          <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
            Appointments
          </span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage sessions, set your availability, and view student ratings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background border-2 border-foreground rounded-xl p-1 w-fit overflow-x-auto">
        {(
          [
            { key: "appointments", label: "Sessions", icon: Calendar },
            { key: "availability", label: "Availability", icon: Clock },
            { key: "ratings", label: "My Ratings", icon: Star },
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

      {/* ── Sessions Tab ──────────────────────────────────────────────────────── */}
      {activeTab === "appointments" && (
        <div className="space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Total", value: metrics.total },
              { label: "Upcoming", value: metrics.upcoming },
              { label: "Requested", value: metrics.requested },
              { label: "Confirmed", value: metrics.confirmed },
              { label: "Completed", value: metrics.completed },
            ].map(({ label, value }) => (
              <article
                key={label}
                className="bg-background border-2 border-foreground rounded-xl p-3"
              >
                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                  {label}
                </p>
                <p className="text-2xl font-bold mt-1">{value}</p>
              </article>
            ))}
          </div>

          {/* Create appointment */}
          <div className="bg-background border-2 border-foreground rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Create appointment</p>
            </div>
            {advisees.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No advisees yet. Accept connection requests from{" "}
                <Link
                  href="/dashboard/advisor/messages"
                  className="text-primary font-medium hover:underline"
                >
                  Messages
                </Link>{" "}
                first.
              </p>
            ) : (
              <>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="relative">
                    <select
                      value={requestStudentId}
                      onChange={(e) => setRequestStudentId(e.target.value)}
                      className="w-full h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm appearance-none pr-8"
                    >
                      <option value="">Select advisee</option>
                      {advisees.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                  <input
                    value={requestDateTime}
                    onChange={(e) => setRequestDateTime(e.target.value)}
                    type="datetime-local"
                    min={new Date(Date.now() + 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)}
                    className="h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
                  />
                  <Button
                    disabled={
                      requesting || !requestStudentId || !requestDateTime
                    }
                    onClick={() => void createAdvisorAppointment()}
                  >
                    {requesting ? "Creating…" : "Create Session"}
                  </Button>
                </div>
                <textarea
                  value={requestAgenda}
                  onChange={(e) => setRequestAgenda(e.target.value)}
                  rows={2}
                  placeholder="Session agenda (optional)"
                  className="w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm resize-none"
                />
              </>
            )}
          </div>

          {/* Filter */}
          {advisees.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-muted-foreground">
                Filter by advisee:
              </label>
              <div className="relative">
                <select
                  value={studentFilterId}
                  onChange={(e) => setStudentFilterId(e.target.value)}
                  className="h-8 rounded-lg border border-foreground/20 bg-background px-3 text-xs appearance-none pr-8"
                >
                  <option value="">All advisees</option>
                  {advisees.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Appointments list */}
          <div className="rounded-2xl border-2 border-foreground bg-background divide-y divide-foreground/10">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No appointments found
                </p>
              </div>
            ) : (
              visibleItems.map((appt, idx) => (
                <article key={appt.id} className="p-4 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-muted-foreground bg-secondary rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">
                          {appt.student
                            ? `${appt.student.firstName} ${appt.student.lastName}`
                            : "Unknown student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appt.student?.email}
                        </p>
                        <p className="text-sm text-foreground mt-1 font-medium">
                          {new Date(appt.scheduledFor).toLocaleDateString(
                            "en-GB",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}{" "}
                          at{" "}
                          {new Date(appt.scheduledFor).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {daysUntil(appt.scheduledFor) && (
                          <p className="text-xs text-primary font-medium mt-0.5">
                            {daysUntil(appt.scheduledFor)}
                          </p>
                        )}
                        {appt.agenda && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Agenda: {appt.agenda}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  <textarea
                    defaultValue={appt.notes}
                    rows={2}
                    placeholder="Session notes…"
                    className="w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm resize-none"
                    onBlur={(e) => {
                      const notes = e.target.value.trim();
                      if (notes !== (appt.notes ?? "")) {
                        void updateAppointment(appt.id, { notes });
                      }
                    }}
                  />

                  <div className="flex flex-wrap gap-2">
                    {appt.student && (
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          href={`/dashboard/advisor/messages?contactId=${encodeURIComponent(appt.student.id)}`}
                        >
                          Chat Student
                        </Link>
                      </Button>
                    )}
                    {appt.status === "REQUESTED" && (
                      <Button
                        size="sm"
                        disabled={busyId === appt.id}
                        onClick={() =>
                          void updateAppointment(appt.id, {
                            status: "CONFIRMED",
                          })
                        }
                      >
                        Confirm
                      </Button>
                    )}
                    {appt.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        disabled={busyId === appt.id}
                        onClick={() =>
                          void updateAppointment(appt.id, {
                            status: "COMPLETED",
                          })
                        }
                      >
                        Mark Completed
                      </Button>
                    )}
                    {(appt.status === "REQUESTED" ||
                      appt.status === "CONFIRMED") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30"
                        disabled={busyId === appt.id}
                        onClick={() =>
                          void updateAppointment(appt.id, {
                            status: "CANCELLED",
                          })
                        }
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Availability Tab ──────────────────────────────────────────────────── */}
      {activeTab === "availability" && (
        <div className="space-y-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Add availability slot</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Students can only book sessions during your set availability
              windows.
            </p>

            {/* Recurring vs one-off */}
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(true)}
                  className="accent-primary"
                />
                <span className="text-sm">Recurring (weekly)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isRecurring}
                  onChange={() => setIsRecurring(false)}
                  className="accent-primary"
                />
                <span className="text-sm">One-off (specific date)</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {isRecurring ? (
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Day
                  </label>
                  <select
                    value={newDayOfWeek}
                    onChange={(e) => setNewDayOfWeek(e.target.value)}
                    className="w-full h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm appearance-none pr-8"
                  >
                    {DAY_NAMES.map((day, idx) => (
                      <option key={idx} value={idx}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 bottom-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Start time
                </label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  End time
                </label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full h-10 rounded-lg border border-foreground/20 bg-background px-3 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="w-full"
                  disabled={addingSlot}
                  onClick={addSlot}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {addingSlot ? "Adding…" : "Add Slot"}
                </Button>
              </div>
            </div>
          </div>

          {/* Slots list */}
          <div className="bg-background border-2 border-foreground rounded-2xl overflow-hidden">
            <div className="border-b-2 border-foreground px-4 py-3 bg-secondary">
              <p className="text-sm font-semibold">
                Your availability ({slots.length} slot
                {slots.length !== 1 ? "s" : ""})
              </p>
            </div>
            {slotsLoading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : slots.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No availability slots set yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add slots above so students can book sessions with you.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-foreground/10">
                {slots.map((slot, idx) => (
                  <div
                    key={slot._id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono w-5">
                        {idx + 1}
                      </span>
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">
                          {slot.isRecurring && slot.dayOfWeek !== undefined
                            ? `Every ${DAY_NAMES[slot.dayOfWeek]}`
                            : slot.specificDate
                              ? new Date(slot.specificDate).toLocaleDateString(
                                  "en-GB",
                                  {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )
                              : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot.startTime} – {slot.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {slot.isBooked ? (
                        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          Booked
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                          Available
                        </span>
                      )}
                      <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                        {slot.isRecurring ? "Recurring" : "One-off"}
                      </span>
                      {!slot.isBooked && (
                        <button
                          onClick={() => void deleteSlot(slot._id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                          title="Remove slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Ratings Tab ───────────────────────────────────────────────────────── */}
      {activeTab === "ratings" && (
        <div className="space-y-4">
          {/* Summary */}
          {ratings.length > 0 && (
            <div className="bg-background border-2 border-foreground rounded-2xl p-5 flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{ratingsAvg.toFixed(1)}</p>
                <StarDisplay value={Math.round(ratingsAvg)} />
                <p className="text-xs text-muted-foreground mt-1">
                  {ratings.length} review{ratings.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.filter((r) => r.rating === star).length;
                  const pct =
                    ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-right">{star}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {ratingsLoading ? (
            <div className="p-8 text-center">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : ratings.length === 0 ? (
            <div className="text-center py-10">
              <Star className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No ratings yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Students can rate sessions after they&apos;re completed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ratings.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-background border-2 border-foreground rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {r.studentName[0]}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">{r.studentName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarDisplay value={r.rating} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  {r.review && (
                    <p className="text-sm text-muted-foreground leading-relaxed pl-10">
                      &ldquo;{r.review}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
