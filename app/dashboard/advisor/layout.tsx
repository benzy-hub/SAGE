import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { advisorNavItems } from "@/components/dashboard/dashboard-navigation";
import { connectDB } from "@/lib/db";
import { Role, User, initializeModels } from "@/lib/db/models";

export default async function AdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectDB();
  initializeModels();

  const authToken = (await cookies()).get("auth_token")?.value;
  if (!authToken) redirect("/auth/login");

  const user = await User.findById(authToken);
  if (!user) redirect("/auth/login");
  if (user.role !== Role.ADVISOR) redirect("/dashboard");

  return (
    // Keep messages in mobile tabs for quick chat access.
    <DashboardShell
      role="ADVISOR"
      title="Advisor Dashboard"
      description="Manage advisee success, scheduling, and communications from a responsive workspace built for fast academic support workflows."
      subtitle="Everything you need to guide students clearly, consistently, and professionally."
      navItems={advisorNavItems}
      mobileNavItems={[
        advisorNavItems[0],
        advisorNavItems[1],
        advisorNavItems[2],
        advisorNavItems[4],
        advisorNavItems[5],
      ]}
      currentUser={{
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: "ADVISOR",
        about:
          "You can manage student sessions, communicate next steps, and keep advising follow-through consistent across channels.",
      }}
    >
      {children}
    </DashboardShell>
  );
}
