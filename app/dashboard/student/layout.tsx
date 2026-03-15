import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { studentNavItems } from "@/components/dashboard/dashboard-navigation";
import { connectDB } from "@/lib/db";
import { Role, User, initializeModels } from "@/lib/db/models";

export default async function StudentLayout({
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
  if (user.role !== Role.STUDENT) redirect("/dashboard");

  return (
    // Keep messages in mobile tabs for quick chat access.
    <DashboardShell
      role="STUDENT"
      title="Student Dashboard"
      description="Stay on top of advising appointments, academic priorities, and next best actions from a clean workspace designed for everyday progress."
      subtitle="Built to feel simple on mobile, clear on desktop, and consistent across your full student journey."
      navItems={studentNavItems}
      mobileNavItems={[
        studentNavItems[0],
        studentNavItems[2],
        studentNavItems[5],
        studentNavItems[6],
      ]}
      currentUser={{
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: "STUDENT",
        about:
          "You can track progress, prepare for appointments, and follow your advising plan without losing momentum.",
      }}
    >
      {children}
    </DashboardShell>
  );
}
