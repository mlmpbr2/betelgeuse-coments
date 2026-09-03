export type SentimentLabel = "positivo" | "neutro" | "negativo";

export type SentimentResult = {
  sentiment: SentimentLabel;
  score: number; // -1 (muito negativo) a 1 (muito positivo)
};

const POSITIVE_WORDS = [
  "amo", "amei", "adoro", "adorei", "otimo", "otima", "excelente", "perfeito",
  "perfeita", "maravilhoso", "maravilhosa", "incrivel", "fantastico",
  "fantastico", "bom", "boa", "lindo", "linda", "top", "show", "parabens",
  "obrigado", "obrigada", "gratidao", "sucesso", "recomendo", "melhor",
  "demais", "sensacional", "espetacular", "legal", "bacana", "curti",
  "gostei", "feliz", "ansioso", "ansiosa", "quero", "preciso", "aprovado",
];

const NEGATIVE_WORDS = [
  "odio", "odeio", "horrivel", "pessimo", "pessima", "ruim", "lixo", "porcaria",
  "fraude", "golpe", "golpista", "enganacao", "enganoso", "mentira",
  "mentiroso", "ladrao", "roubo", "roubaram", "reclame", "reclamacao",
  "absurdo", "absurda", "ridiculo", "ridicula", "nojento", "nojenta",
  "arrependido", "arrependida", "decepcao", "decepcionado", "decepcionada",
  "nunca", "jamais", "cancelar", "cancelado", "devolver", "devolucao",
  "propaganda", "spam", "chato", "chata", "demora", "demorou", "pior",
];

const NEGATIONS = ["nao", "nunca", "jamais", "nem", "sem"];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function analyzeSentiment(text: string): SentimentResult {
  const tokens = tokenize(text);
  if (tokens.length === 0) {
    return { sentiment: "neutro", score: 0 };
  }

  let raw = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let value = 0;
    if (POSITIVE_WORDS.includes(token)) value = 1;
    else if (NEGATIVE_WORDS.includes(token)) value = -1;

    // Negacao simples: palavra anterior negativa inverte o sinal
    if (value !== 0 && i > 0 && NEGATIONS.includes(tokens[i - 1])) {
      value = -value;
    }
    raw += value;
  }

  const score = Math.max(-1, Math.min(1, raw / Math.sqrt(tokens.length)));
  const sentiment: SentimentLabel =
    score > 0.05 ? "positivo" : score < -0.05 ? "negativo" : "neutro";

  return { sentiment, score };
}
