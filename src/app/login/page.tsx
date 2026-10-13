import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginButton } from "@/components/auth/LoginButton";
import { LegalFooter } from "@/components/LegalFooter";
import { HtmlLang } from "@/components/HtmlLang";
import { getDictionary, parseLang } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { lang?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  const lang = parseLang(searchParams.lang);

  if (session?.user) {
    redirect(lang === "en" ? "/dashboard?lang=en" : "/dashboard");
  }

  const t = getDictionary(lang);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <HtmlLang lang={lang} />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Betelgeuse Coments</CardTitle>
          <CardDescription>{t.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <LoginButton lang={lang} />
          <p className="text-center text-xs text-muted-foreground">
            {t.loginFirstAccess}
          </p>
        </CardContent>
      </Card>

      <LegalFooter lang={lang} />
    </main>
  );
}
