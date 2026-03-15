import { connectDB } from "@/lib/db";
import { User, initializeModels, Role, AccountStatus } from "@/lib/db/models";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  await connectDB();
  initializeModels();

  const [totalUsers, activeStudents, activeAdvisors, pendingVerification] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: Role.STUDENT, status: AccountStatus.ACTIVE }),
      User.countDocuments({ role: Role.ADVISOR, status: AccountStatus.ACTIVE }),
      User.countDocuments({ status: AccountStatus.PENDING_VERIFICATION }),
    ]);

  const recentlyJoined = await User.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("firstName lastName email role status createdAt");

  const activeUsers = activeStudents + activeAdvisors;
  const activationRate =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

  const quickAccessModules = [
    {
      title: "User Operations",
      summary:
        "Review user lifecycle, verification state, and account interventions.",
      href: "/dashboard/admin/users",
    },
    {
      title: "Advisor Capacity",
      summary:
        "Monitor advisor availability, assignments, and distribution across departments.",
      href: "/dashboard/admin/advisors",
    },
    {
      title: "Scheduling Quality",
      summary:
        "Track appointment throughput, cancellation trends, and turnaround times.",
      href: "/dashboard/admin/appointments",
    },
    {
      title: "Communication Center",
      summary:
        "Configure broadcast updates and role-based notification strategies.",
      href: "/dashboard/admin/notifications",
    },
  ];

  return (
    <>
      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
          <div className="sage-section-chip self-start">
            <span className="text-xl sm:text-2xl font-medium text-primary-foreground">
              Admin Overview
            </span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            A centralized control center for platform health, user growth, and
            operational performance. Start here for a quick understanding of
            what needs attention today.
          </p>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-bold mt-2">{totalUsers}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Active Students</p>
            <p className="text-3xl font-bold mt-2">{activeStudents}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Active Advisors</p>
            <p className="text-3xl font-bold mt-2">{activeAdvisors}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">
              Pending Verification
            </p>
            <p className="text-3xl font-bold mt-2">{pendingVerification}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Activation Rate</p>
            <p className="text-3xl font-bold mt-2">{activationRate}%</p>
          </div>
        </div>
      </section>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Recent Accounts</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Latest users who joined the platform.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-170 bg-background border-2 border-foreground rounded-2xl overflow-hidden">
            <thead>
              <tr className="border-b-2 border-foreground/10 text-left">
                <th className="px-4 py-3 text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-sm font-semibold">Role</th>
                <th className="px-4 py-3 text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-sm font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentlyJoined.map((user) => (
                <tr
                  key={user._id.toString()}
                  className="border-b border-foreground/10 last:border-none"
                >
                  <td className="px-4 py-3 text-sm">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm">{user.role}</td>
                  <td className="px-4 py-3 text-sm">{user.status}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Operations Workspace
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          High-impact modules designed for daily admin workflows and decision
          making.
        </p>

        <div className="mt-5 grid md:grid-cols-2 2xl:grid-cols-4 gap-4 sm:gap-5">
          {quickAccessModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group bg-background border-2 border-foreground rounded-2xl p-5 hover:-translate-y-0.5 transition-all"
            >
              <p className="text-base font-semibold text-foreground">
                {module.title}
              </p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {module.summary}
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
