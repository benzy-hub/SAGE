import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User, initializeModels, Role } from "@/lib/db/models";
import { AdminSidebarShell } from "@/components/dashboard/admin/admin-sidebar-shell";

export default async function AdminLayout({
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
  if (user.role !== Role.ADMIN) redirect("/dashboard");

  return (
    <AdminSidebarShell
      currentUser={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: "ADMIN",
      }}
    >
      {children}
    </AdminSidebarShell>
  );
}
