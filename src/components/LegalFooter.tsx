import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="py-6 text-center text-xs text-muted-foreground">
      <Link href="/privacy" className="hover:underline">
        Privacidade
      </Link>
      {" · "}
      <Link href="/terms" className="hover:underline">
        Termos de Uso
      </Link>
      {" · "}
      <Link href="/exclusao-de-dados" className="hover:underline">
        Exclusão de Dados
      </Link>
    </footer>
  );
}
