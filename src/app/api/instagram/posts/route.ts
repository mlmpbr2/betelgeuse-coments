import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPosts } from "@/lib/instagram";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const igAccount = await prisma.instagramAccount.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  if (!igAccount) {
    return NextResponse.json(
      { error: "Nenhuma conta Instagram vinculada" },
      { status: 404 }
    );
  }

  try {
    const posts = await getPosts(igAccount.igUserId, igAccount.accessToken);
    return NextResponse.json({ posts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar posts";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
