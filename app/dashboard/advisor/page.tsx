import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, MessageSquare, Users } from "lucide-react";
import { connectDB } from "@/lib/db";
import {
  AccountStatus,
  AdvisorStudentConnection,
  Appointment,
  AppointmentStatus,
  ConnectionStatus,
  StudentProfile,
  Role,
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

export default async function AdvisorDashboardPage() {
  await connectDB();
  initializeModels();

  const authToken = (await cookies()).get("auth_token")?.value;
  if (!authToken) redirect("/auth/login");

  const user = await User.findById(authToken);
  if (!user) redirect("/auth/login");
  if (user.role !== Role.ADVISOR) redirect("/dashboard");

  const [
    activeStudents,
    adviseeConnections,
    upcomingAppointments,
    pendingAppointmentRequests,
  ] = await Promise.all([
    User.countDocuments({ role: Role.STUDENT, status: AccountStatus.ACTIVE }),
    AdvisorStudentConnection.find({
      advisorId: user._id,
      status: ConnectionStatus.ACCEPTED,
    })
      .sort({ updatedAt: -1 })
      .select("studentId"),
    Appointment.countDocuments({
      advisorId: user._id,
      status: { $in: [AppointmentStatus.CONFIRMED] },
      scheduledFor: { $gt: new Date() },
    }),
    Appointment.countDocuments({
      advisorId: user._id,
      status: AppointmentStatus.REQUESTED,
    }),
  ]);

  const adviseeIds = adviseeConnections.map((item) => item.studentId);

  const [nextRequestedAppointment, nextConfirmedAppointment] =
    await Promise.all([
      Appointment.findOne({
        advisorId: user._id,
        status: AppointmentStatus.REQUESTED,
      })
        .sort({ createdAt: -1 })
        .populate("studentId", "_id firstName lastName")
        .select("studentId scheduledFor agenda createdAt")
        .lean(),
      Appointment.findOne({
        advisorId: user._id,
        status: AppointmentStatus.CONFIRMED,
        scheduledFor: { $gt: new Date() },
      })
        .sort({ scheduledFor: 1 })
        .populate("studentId", "_id firstName lastName")
        .select("studentId scheduledFor agenda")
        .lean(),
    ]);

  const nextRequestedStudent =
    nextRequestedAppointment &&
    typeof nextRequestedAppointment.studentId === "object"
      ? (nextRequestedAppointment.studentId as unknown as {
          _id: string;
          firstName: string;
          lastName: string;
        })
      : null;

  const nextConfirmedStudent =
    nextConfirmedAppointment &&
    typeof nextConfirmedAppointment.studentId === "object"
      ? (nextConfirmedAppointment.studentId as unknown as {
          _id: string;
          firstName: string;
          lastName: string;
        })
      : null;

  const [adviseeProfiles, adviseeUsers] = await Promise.all([
    StudentProfile.find({ userId: { $in: adviseeIds } }).select(
      "userId college department level year studentId",
    ),
    User.find({ _id: { $in: adviseeIds } }).select(
      "_id firstName lastName email",
    ),
  ]);

  const adviseeUserMap = new Map(
    adviseeUsers.map((student) => [student._id.toString(), student]),
  );

  const profileRows = adviseeProfiles
    .map((profile) => {
      const student = adviseeUserMap.get(profile.userId.toString());
      if (!student) return null;
      return {
        id: profile.userId.toString(),
        fullName: `${student.firstName} ${student.lastName}`,
        email: student.email,
        studentId: profile.studentId,
        college: profile.college ?? "—",
        department: profile.department ?? "—",
        level: profile.level ?? (profile.year ? `${profile.year * 100}` : "—"),
      };
    })
    .filter((item) => item !== null)
    .slice(0, 8);

  const quickLinks = [
    {
      title: "Review advisee roster",
      summary:
        "Open student profiles, identify priority cases, and prepare follow-up actions.",
      href: "/dashboard/advisor/advisees",
    },
    {
      title: "Organize appointments",
      summary:
        "Keep schedule blocks, session readiness, and rescheduling in one flow.",
      href: "/dashboard/advisor/appointments",
    },
    {
      title: "Capture case notes",
      summary:
        "Document conversations, action items, and advising continuity professionally.",
      href: "/dashboard/advisor/case-notes",
    },
    {
      title: "Check engagement insights",
      summary:
        "Look for at-risk patterns and student follow-through opportunities.",
      href: "/dashboard/advisor/insights",
    },
  ];

  return (
    <>
      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
          <div className="max-w-3xl">
            <div className="sage-section-chip inline-flex">
              <span className="inline-flex items-center gap-2 text-xl sm:text-2xl font-medium text-primary-foreground">
                <Users className="w-5 h-5" />
                Advisor Command Center
              </span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Manage students, sessions, and follow-ups with a calm and clear
              workflow.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Your dashboard keeps advising work, scheduled sessions, and
              student communication aligned so you can move from review to
              action without friction.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <Users className="w-3.5 h-3.5 text-primary" />
                Follow-up ready
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                Scheduling ready
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Student communication
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 xl:grid-cols-1 gap-3 w-full xl:w-[20rem]">
            <article className="rounded-2xl border-2 border-foreground/15 bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Advisees in view
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {adviseeConnections.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connected students
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
                Confirmed meetings ahead
              </p>
            </article>
            <article className="rounded-2xl border-2 border-foreground/15 bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Pending requests
              </p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {pendingAppointmentRequests}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Needs review or action
              </p>
            </article>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/advisor/appointments"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary"
          >
            Manage sessions
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/advisor/messages"
            className="inline-flex items-center gap-2 rounded-xl border border-foreground/15 bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Open messages
          </Link>
        </div>
      </section>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">My advisees</p>
            <p className="text-3xl font-bold mt-2">
              {adviseeConnections.length}
            </p>
            <Link
              href="/dashboard/advisor/advisees"
              className="text-xs text-primary font-medium hover:underline mt-1 block"
            >
              View all →
            </Link>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Upcoming sessions</p>
            <p className="text-3xl font-bold mt-2">{upcomingAppointments}</p>
            {upcomingAppointments > 0 ? (
              <Link
                href="/dashboard/advisor/appointments"
                className="text-xs text-primary font-medium hover:underline mt-1 block"
              >
                View schedule →
              </Link>
            ) : null}
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Pending requests</p>
            <p className="text-3xl font-bold mt-2">
              {pendingAppointmentRequests}
            </p>
            {pendingAppointmentRequests > 0 ? (
              <Link
                href="/dashboard/advisor/appointments"
                className="text-xs text-destructive font-medium hover:underline mt-1 block"
              >
                Review now →
              </Link>
            ) : null}
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Platform students</p>
            <p className="text-3xl font-bold mt-2">{activeStudents}</p>
          </div>
        </div>

        <div className="mt-4 grid lg:grid-cols-2 gap-3">
          <article className="rounded-2xl border-2 border-amber-300/60 bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-wide text-amber-700 font-semibold">
              Pending appointment request
            </p>
            {nextRequestedAppointment && nextRequestedStudent ? (
              <>
                <p className="mt-1 text-sm text-foreground">
                  {nextRequestedStudent.firstName}{" "}
                  {nextRequestedStudent.lastName} requested a session.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scheduled for{" "}
                  {new Date(
                    nextRequestedAppointment.scheduledFor,
                  ).toLocaleString()}
                  .
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/advisor/appointments"
                    className="inline-flex items-center rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-primary"
                  >
                    Review request
                  </Link>
                  <Link
                    href={`/dashboard/advisor/messages?contactId=${encodeURIComponent(nextRequestedStudent._id)}`}
                    className="inline-flex items-center rounded-lg border border-foreground/20 bg-white px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Message student
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                No pending requests right now.
              </p>
            )}
          </article>

          <article className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
            <p className="text-xs uppercase tracking-wide text-primary font-semibold">
              Next confirmed session
            </p>
            {nextConfirmedAppointment && nextConfirmedStudent ? (
              <>
                <p className="mt-1 text-sm text-foreground">
                  {nextConfirmedStudent.firstName}{" "}
                  {nextConfirmedStudent.lastName} ·{" "}
                  {getSessionCountdownLabel(
                    new Date(nextConfirmedAppointment.scheduledFor),
                  )}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(
                    nextConfirmedAppointment.scheduledFor,
                  ).toLocaleString()}
                </p>
                {nextConfirmedAppointment.agenda ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Agenda: {nextConfirmedAppointment.agenda}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href="/dashboard/advisor/appointments"
                    className="inline-flex items-center rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
                  >
                    Open schedule
                  </Link>
                  <Link
                    href={`/dashboard/advisor/messages?contactId=${encodeURIComponent(nextConfirmedStudent._id)}`}
                    className="inline-flex items-center rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-primary"
                  >
                    Chat student
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                No confirmed sessions yet. Confirm a request to lock in your
                next session.
              </p>
            )}
          </article>
        </div>

        <div className="mt-5 grid xl:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-foreground">
              Today at a glance
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Welcome back, {user.firstName}. This advisor workspace is designed
              to keep student follow-up, scheduling, and communication aligned
              in one place.
            </p>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border-2 border-foreground/15 bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">
                  Focus today
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Review priority advisees, confirm session preparation, and
                  close open follow-ups.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-foreground/15 bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">
                  Recommended flow
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start with appointments, move to case notes, then use insights
                  to spot who needs outreach.
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
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Your advisor tools are optimized for both desktop review and
              mobile follow-up so the workflow stays responsive wherever you
              work.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Advisee profile snapshot
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          College, department, level, and matric information for your currently
          accepted advisees, presented in a clean table for fast review.
        </p>

        <div
          data-tour="advisor-advisee-table"
          className="mt-5 overflow-x-auto rounded-2xl border-2 border-foreground bg-background"
        >
          {profileRows.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No accepted advisees yet.
            </div>
          ) : (
            <table className="w-full min-w-215">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    S/N
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Matric
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    College
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {profileRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-foreground/10 last:border-none"
                  >
                    <td className="px-4 py-3 text-sm text-muted-foreground font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {row.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {row.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {row.studentId}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {row.college}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {row.department}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {row.level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Advisor workspace modules
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Open the tools that support student guidance, communication, and
          follow-through.
        </p>

        <div className="mt-5 grid md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-5">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-tour={`advisor-module-${item.href.split("/").pop()}`}
              className="group bg-background border-2 border-foreground rounded-2xl p-5 hover:-translate-y-0.5 transition-all"
            >
              <p className="text-base font-semibold text-foreground">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {item.summary}
              </p>
              <p className="mt-4 text-sm font-medium text-foreground group-hover:text-primary">
                Open module
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
