import { AppShell } from "@/components/layout/AppShell";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}
