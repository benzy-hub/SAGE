import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import {
  AccountStatus,
  Appointment,
  AppointmentStatus,
  AdvisorStudentConnection,
  ConnectionStatus,
  Role,
  StudentProfile,
  User,
  initializeModels,
} from "@/lib/db/models";

function getSessionCountdownLabel(dateValue: Date): string {
  const diffMs = dateValue.getTime() - Date.now();
  if (diffMs <= 0) return "Starting soon";
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) return `In ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `In ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays} days`;
}

export default async function StudentDashboardPage() {
  await connectDB();
  initializeModels();

  const authToken = (await cookies()).get("auth_token")?.value;
  if (!authToken) redirect("/auth/login");

  const user = await User.findById(authToken);
  if (!user) redirect("/auth/login");
  if (user.role !== Role.STUDENT) redirect("/dashboard");

  const [activeAdvisors, profile, upcomingAppointments, connectedAdvisors] =
    await Promise.all([
      User.countDocuments({ role: Role.ADVISOR, status: AccountStatus.ACTIVE }),
      StudentProfile.findOne({ userId: user._id }).select(
        "studentId college department program level year",
      ),
      Appointment.countDocuments({
        studentId: user._id,
        status: {
          $in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED],
        },
        scheduledFor: { $gt: new Date() },
      }),
      AdvisorStudentConnection.countDocuments({
        studentId: user._id,
        status: ConnectionStatus.ACCEPTED,
      }),
    ]);

  const nextAppointment = await Appointment.findOne({
    studentId: user._id,
    status: { $in: [AppointmentStatus.REQUESTED, AppointmentStatus.CONFIRMED] },
    scheduledFor: { $gt: new Date() },
  })
    .sort({ scheduledFor: 1 })
    .populate("advisorId", "_id firstName lastName")
    .select("advisorId scheduledFor status agenda")
    .lean();

  const nextAdvisor =
    nextAppointment && typeof nextAppointment.advisorId === "object"
      ? (nextAppointment.advisorId as unknown as {
          _id: string;
          firstName: string;
          lastName: string;
        })
      : null;

  const studentQuickLinks = [
    {
      title: "Plan your next semester",
      summary:
        "Open your academic roadmap and keep course decisions aligned with your goals.",
      href: "/dashboard/student/academic-plan",
    },
    {
      title: "Manage appointments",
      summary:
        "Book or review advising sessions and prepare before each conversation.",
      href: "/dashboard/student/appointments",
    },
    {
      title: "Track progress",
      summary:
        "See milestones, next steps, and the areas that need attention first.",
      href: "/dashboard/student/progress",
    },
  ];

  return (
    <>
      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div className="max-w-3xl">
            <div className="sage-section-chip inline-flex">
              <span className="inline-flex items-center gap-2 text-xl sm:text-2xl font-medium text-primary-foreground">
                <BookOpen className="w-5 h-5" />
                Student Command Center
              </span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Keep your academic plan, sessions, and progress aligned in one
              calm workspace.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              This dashboard keeps planning, support, and advisor communication
              connected so your next move is always visible and easy to act on.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Mobile friendly
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                Appointment ready
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Progress tracked
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 xl:grid-cols-1 gap-3 w-full xl:w-[20rem]">
            <article className="rounded-2xl border-2 border-foreground/15 bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Active advisors
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {activeAdvisors}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Available across the platform
              </p>
            </article>
            <article className="rounded-2xl border-2 border-foreground/15 bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                My advisors
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {connectedAdvisors}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Directly connected to you
              </p>
            </article>
            <article className="rounded-2xl border-2 border-foreground/15 bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Upcoming sessions
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {upcomingAppointments}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Booked or awaiting confirmation
              </p>
            </article>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/student/appointments"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary"
          >
            Manage appointments
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/student/academic-plan"
            className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Review academic plan
          </Link>
        </div>
      </section>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Active advisors</p>
            <p className="text-3xl font-bold mt-2">{activeAdvisors}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">My advisors</p>
            <p className="text-3xl font-bold mt-2">{connectedAdvisors}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Upcoming sessions</p>
            <p className="text-3xl font-bold mt-2">{upcomingAppointments}</p>
            {upcomingAppointments > 0 ? (
              <Link
                href="/dashboard/student/appointments"
                className="text-xs text-primary font-medium hover:underline mt-1 block"
              >
                View appointments →
              </Link>
            ) : null}
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Matric number</p>
            <p className="text-xl font-bold mt-2">
              {profile?.studentId ?? "—"}
            </p>
          </div>
        </div>

        {nextAppointment ? (
          <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                  Next advising reminder ·{" "}
                  {getSessionCountdownLabel(
                    new Date(nextAppointment.scheduledFor),
                  )}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {nextAdvisor
                    ? `Session with ${nextAdvisor.firstName} ${nextAdvisor.lastName}`
                    : "Session with your advisor"}{" "}
                  on {new Date(nextAppointment.scheduledFor).toLocaleString()}.
                </p>
                {nextAppointment.agenda ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Agenda: {nextAppointment.agenda}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/dashboard/student/appointments"
                  className="inline-flex items-center rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Open appointments
                </Link>
                {nextAdvisor ? (
                  <Link
                    href={`/dashboard/student/messages?contactId=${encodeURIComponent(nextAdvisor._id)}`}
                    className="inline-flex items-center rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-primary"
                  >
                    Message advisor
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-foreground/20 bg-background p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">
              You have no upcoming sessions. Book one now to keep your progress
              on track.
            </p>
            <Link
              href="/dashboard/student/appointments"
              className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Book an appointment →
            </Link>
          </div>
        )}

        <div className="mt-5 grid xl:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Your next best actions
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Welcome back, {user.firstName}. Your workspace is structured to
              help you move from planning to action without getting lost between
              appointments, goals, and support resources.
            </p>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border-2 border-foreground/15 bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">
                  Start here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Review your academic plan, check upcoming appointments, and
                  make sure your next advising step is clear.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-foreground/15 bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">
                  Designed for mobile
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Use the bottom navigation on smaller screens to move through
                  the dashboard like a polished mobile app.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-foreground rounded-2xl p-5 sm:p-6">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">College:</span>{" "}
                {profile?.college ?? "Not set"}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Department:</span>{" "}
                {profile?.department ?? "Not set"}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Level:</span>{" "}
                {profile?.level ??
                  (profile?.year ? `${profile.year * 100}` : "Not set")}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Your dashboard keeps planning, support, and advisor communication
              connected so your next move is always visible.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Student workspace modules
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Navigate your roadmap, appointments, and support tools from one clear
          experience.
        </p>

        <div className="mt-5 grid md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-5">
          {studentQuickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-tour={`student-module-${item.href.split("/").pop()}`}
              className="group bg-background border-2 border-foreground rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <p className="text-base font-semibold text-foreground">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {item.summary}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-primary">
                Open module
                <ArrowRight className="w-4 h-4" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
