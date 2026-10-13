import Link from "next/link";
import { getDictionary, type Lang } from "@/lib/i18n";

export function LegalFooter({ lang = "pt" }: { lang?: Lang }) {
  const t = getDictionary(lang);

  return (
    <footer className="py-6 text-center text-xs text-muted-foreground">
      <Link href="/privacy" className="hover:underline">
        {t.footerPrivacy}
      </Link>
      {" · "}
      <Link href="/terms" className="hover:underline">
        {t.footerTerms}
      </Link>
      {" · "}
      <Link href="/exclusao-de-dados" className="hover:underline">
        {t.footerDeletion}
      </Link>
    </footer>
  );
}
