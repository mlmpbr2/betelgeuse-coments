"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/i18n";

export function HtmlLang({ lang }: { lang: Lang }) {
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  }, [lang]);
  return null;
}
