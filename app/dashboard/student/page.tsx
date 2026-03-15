import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { AccountStatus, Role, User, initializeModels } from "@/lib/db/models";

export default async function StudentDashboardPage() {
  await connectDB();
  initializeModels();

  const authToken = (await cookies()).get("auth_token")?.value;
  if (!authToken) redirect("/auth/login");

  const user = await User.findById(authToken);
  if (!user) redirect("/auth/login");
  if (user.role !== Role.STUDENT) redirect("/dashboard");

  const [activeAdvisors, activeStudents] = await Promise.all([
    User.countDocuments({ role: Role.ADVISOR, status: AccountStatus.ACTIVE }),
    User.countDocuments({ role: Role.STUDENT, status: AccountStatus.ACTIVE }),
  ]);

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
    {
      title: "Explore resources",
      summary:
        "Find support services and guidance that fit your current needs.",
      href: "/dashboard/student/resources",
    },
  ];

  return (
    <>
      <section className="bg-secondary border-2 border-foreground rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Active advisors</p>
            <p className="text-3xl font-bold mt-2">{activeAdvisors}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Active students</p>
            <p className="text-3xl font-bold mt-2">{activeStudents}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Account status</p>
            <p className="text-3xl font-bold mt-2">{user.status}</p>
          </div>
          <div className="bg-background border-2 border-foreground rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="text-xl font-bold mt-2">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

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
