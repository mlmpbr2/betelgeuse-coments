"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { getDictionary, type Lang } from "@/lib/i18n";

export function LoginButton({ lang = "pt" }: { lang?: Lang }) {
  const t = getDictionary(lang);
  // Preserva o idioma apos o redirect do OAuth (callbackUrl same-origin)
  const callbackUrl = lang === "en" ? "/dashboard?lang=en" : "/dashboard";

  return (
    <Button size="lg" onClick={() => signIn("instagram", { callbackUrl })}>
      {t.loginButton}
    </Button>
  );
}
