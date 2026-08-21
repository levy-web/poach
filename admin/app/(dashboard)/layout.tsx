import { redirect } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { getCurrentUser } from "@/lib/dal";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  if (!user || !user.is_staff) {
    redirect("/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
