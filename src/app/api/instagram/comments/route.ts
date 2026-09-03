import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComments } from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) {
    return NextResponse.json(
      { error: "Parametro postId obrigatorio" },
      { status: 400 }
    );
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
    const comments = await getComments(postId, igAccount.accessToken);
    return NextResponse.json({ comments });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar comentarios";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
