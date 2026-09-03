import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setCommentHidden } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const commentId = body?.commentId as string | undefined;
  const hidden = body?.hidden as boolean | undefined;
  if (!commentId || typeof hidden !== "boolean") {
    return NextResponse.json(
      { error: "commentId e hidden (boolean) sao obrigatorios" },
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
    await setCommentHidden(commentId, igAccount.accessToken, hidden);
    await prisma.commentAnalysis.updateMany({
      where: { commentId, igAccountId: igAccount.id },
      data: { hidden },
    });
    return NextResponse.json({ success: true, commentId, hidden });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao ocultar comentario";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
