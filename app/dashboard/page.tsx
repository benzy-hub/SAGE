import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User, initializeModels, Role } from "@/lib/db/models";

export default async function DashboardEntryPage() {
  await connectDB();
  initializeModels();

  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) {
    redirect("/auth/login");
  }

  const user = await User.findById(authToken);

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === Role.ADMIN) {
    redirect("/dashboard/admin");
  }

  if (user.role === Role.ADVISOR) {
    redirect("/dashboard/advisor");
  }

  redirect("/dashboard/student");
}
