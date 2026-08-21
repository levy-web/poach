import AdminShell from "@/components/AdminShell";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return <AdminShell>{children}</AdminShell>;
}
