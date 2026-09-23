"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Post = {
  id: string;
  caption?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
};

type Analysis = {
  commentId: string;
  author: string | null;
  text: string;
  sentiment: "positivo" | "neutro" | "negativo";
  score: number;
  hidden: boolean;
};

const SENTIMENT_STYLE: Record<
  Analysis["sentiment"],
  { variant: "default" | "secondary" | "destructive"; className?: string }
> = {
  positivo: {
    variant: "default",
    className: "bg-emerald-600 text-white hover:bg-emerald-600",
  },
  neutro: { variant: "secondary" },
  negativo: { variant: "destructive" },
};

export function PostsTable() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzingPostId, setAnalyzingPostId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, Analysis[]>>({});
  const [replyTarget, setReplyTarget] = useState<Analysis | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/instagram/posts")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erro ao carregar posts");
        setPosts(data.posts);
      })
      .catch((err) => setError(err.message));
  }, []);

  const analyzePost = useCallback(async (postId: string) => {
    setAnalyzingPostId(postId);
    setError(null);
    try {
      const res = await fetch("/api/sentiment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao analisar");

      if (data.analyzed === 0) {
        // Ja analisado antes: recarrega comentarios e usa analises existentes
        setAnalyses((prev) => ({ ...prev, [postId]: prev[postId] ?? [] }));
        router.refresh();
        return;
      }
      setAnalyses((prev) => ({ ...prev, [postId]: data.results }));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar");
    } finally {
      setAnalyzingPostId(null);
    }
  }, []);

  const toggleHidden = useCallback(
    async (postId: string, analysis: Analysis) => {
      const hidden = !analysis.hidden;
      const res = await fetch("/api/instagram/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: analysis.commentId, hidden }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao alterar visibilidade");
        return;
      }
      setAnalyses((prev) => ({
        ...prev,
        [postId]: prev[postId].map((a) =>
          a.commentId === analysis.commentId ? { ...a, hidden } : a
        ),
      }));
      router.refresh();
    },
    [router]
  );

  const sendReply = useCallback(async () => {
    if (!replyTarget || !replyMessage.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/instagram/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: replyTarget.commentId,
          message: replyMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao responder");
      setReplyTarget(null);
      setReplyMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao responder");
    } finally {
      setSending(false);
    }
  }, [replyTarget, replyMessage]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!posts) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Legenda</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Curtidas</TableHead>
            <TableHead className="text-right">Comentarios</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="max-w-xs truncate">
                {post.permalink ? (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {post.caption ?? "(sem legenda)"}
                  </a>
                ) : (
                  post.caption ?? "(sem legenda)"
                )}
              </TableCell>
              <TableCell>
                {post.timestamp
                  ? format(new Date(post.timestamp), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })
                  : "-"}
              </TableCell>
              <TableCell className="text-right">{post.like_count ?? 0}</TableCell>
              <TableCell className="text-right">
                {post.comments_count ?? 0}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={analyzingPostId === post.id}
                  onClick={() => analyzePost(post.id)}
                >
                  {analyzingPostId === post.id ? "Analisando..." : "Analisar"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {Object.entries(analyses).map(([postId, items]) =>
        items.length === 0 ? null : (
          <div key={postId} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Comentarios analisados — post {postId}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Autor</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Sentimento</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.commentId}>
                    <TableCell>
                      {item.author?.trim()
                        ? item.author
                        : "Usuario do Instagram"}
                    </TableCell>
                    <TableCell className="max-w-md">{item.text}</TableCell>
                    <TableCell>
                      <Badge
                        variant={SENTIMENT_STYLE[item.sentiment].variant}
                        className={SENTIMENT_STYLE[item.sentiment].className}
                      >
                        {item.sentiment}
                      </Badge>
                      {item.hidden && (
                        <Badge variant="outline" className="ml-2">
                          oculto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleHidden(postId, item)}
                      >
                        {item.hidden ? "Exibir" : "Ocultar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReplyTarget(item)}
                      >
                        Responder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}

      <Dialog
        open={replyTarget !== null}
        onOpenChange={(open) => !open && setReplyTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder comentario</DialogTitle>
            <DialogDescription>
              {replyTarget?.author?.trim()
                ? replyTarget.author
                : "Usuario do Instagram"}
              : {replyTarget?.text}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Escreva sua resposta..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplyTarget(null)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button onClick={sendReply} disabled={sending || !replyMessage.trim()}>
              {sending ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
