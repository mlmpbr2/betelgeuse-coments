import type { SentimentLabel } from "./sentiment";

export type CommentInput = {
  commentId: string;
  text: string;
};

export type GeminiSentimentResult = {
  commentId: string;
  sentiment: SentimentLabel;
  score: number; // -1 a 1
};

const MODEL = "gemini-3.6-flash";
const BATCH_SIZE = 20;
const TIMEOUT_MS = 10_000;
const VALID_SENTIMENTS: readonly SentimentLabel[] = [
  "positivo",
  "neutro",
  "negativo",
];

function buildPrompt(comments: CommentInput[]): string {
  return [
    "Voce e um analisador de sentimento de comentarios do Instagram em portugues.",
    "Analise os comentarios abaixo e responda APENAS com um array JSON valido,",
    "sem markdown e sem explicacoes.",
    "Cada elemento deve ter exatamente esta forma:",
    '{"commentId": "<id>", "sentiment": "positivo"|"neutro"|"negativo", "score": <numero de -1 a 1>}',
    "Regras:",
    '- "sentiment" deve ser exatamente uma das tres palavras acima;',
    '- "score" vai de -1 (muito negativo) a 1 (muito positivo), 0 e neutro;',
    "- considere contexto, ironia e emojis;",
    "- inclua TODOS os comentarios, sem inventar ids.",
    "",
    "Comentarios:",
    JSON.stringify(comments),
  ].join("\n");
}

function parseJsonArray(text: string): unknown[] {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed: unknown = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("resposta da Gemini nao e um array JSON");
  }
  return parsed;
}

async function analyzeBatch(
  comments: CommentInput[],
  apiKey: string
): Promise<GeminiSentimentResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(comments) }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" },
        }),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      throw new Error(`Gemini API: HTTP ${res.status}`);
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      throw new Error("Gemini API: resposta vazia");
    }

    const inputIds = new Set(comments.map((c) => c.commentId));
    return parseJsonArray(text).map((item): GeminiSentimentResult => {
      const r = item as Record<string, unknown>;
      const commentId = String(r.commentId ?? "");
      const sentiment = r.sentiment as SentimentLabel;
      const score = Number(r.score);
      if (!inputIds.has(commentId)) {
        throw new Error(`Gemini API: commentId inesperado (${commentId})`);
      }
      if (!VALID_SENTIMENTS.includes(sentiment)) {
        throw new Error(`Gemini API: sentiment invalido (${String(r.sentiment)})`);
      }
      if (!Number.isFinite(score)) {
        throw new Error("Gemini API: score invalido");
      }
      return { commentId, sentiment, score: Math.max(-1, Math.min(1, score)) };
    });
  } finally {
    clearTimeout(timeout);
  }
}

// Analisa em lotes de ate 20 comentarios por chamada.
// Lanca excecao em qualquer falha (timeout, HTTP, JSON invalido ou incompleto)
// para que o chamador aplique o fallback do lexico local.
export async function analyzeSentimentGemini(
  comments: CommentInput[]
): Promise<GeminiSentimentResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY nao configurada");
  }

  const results: GeminiSentimentResult[] = [];
  for (let i = 0; i < comments.length; i += BATCH_SIZE) {
    results.push(...(await analyzeBatch(comments.slice(i, i + BATCH_SIZE), apiKey)));
  }
  return results;
}
