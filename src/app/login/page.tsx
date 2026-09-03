import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginButton } from "@/components/auth/LoginButton";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Betelgeuse Coments</CardTitle>
          <CardDescription>
            Analise o sentimento dos comentarios do seu Instagram e gerencie
            interacoes em um so lugar.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <LoginButton />
        </CardContent>
      </Card>
    </main>
  );
}
