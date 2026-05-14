import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "Admin",
  description: "Platinum Kitchen staff console.",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  // Middleware already gates /admin, but check here too — a customer who
  // somehow reaches the console must not see it. Per-action permission
  // checks in the service layer are the third line of defence.
  if (!session?.user || session.user.role === "customer") {
    redirect("/sign-in?from=/admin");
  }

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
