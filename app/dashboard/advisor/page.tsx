import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { AccountStatus, Role, User, initializeModels } from "@/lib/db/models";

export default async function AdvisorDashboardPage() {
  await connectDB();
  initializeModels();

  const authToken = (await cookies()).get("auth_token")?.value;
  if (!authToken) redirect("/auth/login");

  const user = await User.findById(authToken);
  if (!user) redirect("/auth/login");
  if (user.role !== Role.ADVISOR) redirect("/dashboard");

  const [activeStudents, pendingVerification, totalAdvisors] =
    await Promise.all([
      User.countDocuments({ role: Role.STUDENT, status: AccountStatus.ACTIVE }),
      User.countDocuments({ status: AccountStatus.PENDING_VERIFICATION }),
      User.countDocuments({ role: Role.ADVISOR, status: AccountStatus.ACTIVE }),
    ]);

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
      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Active students</p>
            <p className="text-3xl font-bold mt-2">{activeStudents}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Advisor team online</p>
            <p className="text-3xl font-bold mt-2">{totalAdvisors}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">
              Pending verifications
            </p>
            <p className="text-3xl font-bold mt-2">{pendingVerification}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Workspace status</p>
            <p className="text-3xl font-bold mt-2">Ready</p>
          </div>
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
