import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { PermissionBadges } from "@/components/dashboard/PermissionBadges";
import { PostsTable } from "@/components/dashboard/PostsTable";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Ola, {session.user.name ?? "usuario"}. Acompanhe seus comentarios e
          creditos.
        </p>
      </header>

      <PermissionBadges />

      <MetricCards userId={session.user.id} />

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Posts recentes</h2>
        <PostsTable />
      </section>
    </main>
  );
}
