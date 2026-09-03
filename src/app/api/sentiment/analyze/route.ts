import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComments } from "@/lib/instagram";
import { analyzeSentiment } from "@/lib/sentiment";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const postId = body?.postId as string | undefined;
  if (!postId) {
    return NextResponse.json(
      { error: "postId e obrigatorio" },
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

  let comments;
  try {
    comments = await getComments(postId, igAccount.accessToken);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar comentarios";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Ignora comentarios ja analisados para nao cobrar credito duas vezes
  const existing = await prisma.commentAnalysis.findMany({
    where: { igAccountId: igAccount.id, commentId: { in: comments.map((c) => c.id) } },
    select: { commentId: true },
  });
  const existingIds = new Set(existing.map((e) => e.commentId));
  const newComments = comments.filter((c) => !existingIds.has(c.id));

  if (newComments.length === 0) {
    return NextResponse.json({ analyzed: 0, results: [], balance: null });
  }

  const credit = await prisma.credit.findUnique({
    where: { userId: session.user.id },
  });
  const balance = credit?.balance ?? 0;
  if (balance < newComments.length) {
    return NextResponse.json(
      {
        error: `Creditos insuficientes: ${newComments.length} necessarios, ${balance} disponiveis`,
      },
      { status: 402 }
    );
  }

  const results = newComments.map((comment) => {
    const { sentiment, score } = analyzeSentiment(comment.text ?? "");
    return {
      commentId: comment.id,
      postId,
      igAccountId: igAccount.id,
      author: comment.username ?? null,
      text: comment.text ?? "",
      sentiment,
      score,
      hidden: comment.hidden ?? false,
    };
  });

  await prisma.$transaction([
    prisma.commentAnalysis.createMany({ data: results }),
    prisma.credit.update({
      where: { userId: session.user.id },
      data: { balance: { decrement: results.length } },
    }),
  ]);

  return NextResponse.json({
    analyzed: results.length,
    results,
    balance: balance - results.length,
  });
}
