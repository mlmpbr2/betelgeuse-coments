import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { PermissionBadges } from "@/components/dashboard/PermissionBadges";
import { PostsTable } from "@/components/dashboard/PostsTable";
import { LegalFooter } from "@/components/LegalFooter";
import { HtmlLang } from "@/components/HtmlLang";
import { Separator } from "@/components/ui/separator";
import { getDictionary, parseLang } from "@/lib/i18n";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { lang?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const lang = parseLang(searchParams.lang);
  const t = getDictionary(lang);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <HtmlLang lang={lang} />
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {t.dashboardGreeting(session.user.name ?? t.defaultUserName)}
        </p>
      </header>

      <PermissionBadges lang={lang} />

      <MetricCards userId={session.user.id} lang={lang} />

      <Separator />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">{t.recentPosts}</h2>
        <PostsTable lang={lang} />
      </section>

      <LegalFooter lang={lang} />
    </main>
  );
}
