import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginButton } from "@/components/auth/LoginButton";
import { LegalFooter } from "@/components/LegalFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Betelgeuse Coments</CardTitle>
          <CardDescription>
            Analise o sentimento dos comentarios do seu Instagram e gerencie
            interacoes em um so lugar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <LoginButton />
          <p className="text-center text-xs text-muted-foreground">
            Primeiro acesso? Abra instagram.com em outra aba e faça login
            antes de entrar. Se o Instagram não te trouxer de volta
            automaticamente, clique em Entrar novamente.
          </p>
        </CardContent>
      </Card>

      <LegalFooter />
    </main>
  );
}
