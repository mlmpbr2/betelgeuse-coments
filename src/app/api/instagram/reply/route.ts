import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { replyToComment } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const commentId = body?.commentId as string | undefined;
  const message = body?.message as string | undefined;
  if (!commentId || !message?.trim()) {
    return NextResponse.json(
      { error: "commentId e message sao obrigatorios" },
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
    const reply = await replyToComment(
      commentId,
      igAccount.accessToken,
      message.trim()
    );
    await prisma.commentAnalysis.updateMany({
      where: { commentId, igAccountId: igAccount.id },
      data: { repliedAt: new Date() },
    });
    return NextResponse.json({ success: true, commentId, replyId: reply.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao responder comentario";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
