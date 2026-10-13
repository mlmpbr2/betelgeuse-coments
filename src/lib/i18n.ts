export type Lang = "pt" | "en";

export function parseLang(value: string | string[] | undefined): Lang {
  return value === "en" ? "en" : "pt";
}

const dictionaries = {
  pt: {
    loginDescription:
      "Analise o sentimento dos comentarios do seu Instagram e gerencie interacoes em um so lugar.",
    loginFirstAccess:
      "Primeiro acesso? Abra instagram.com em outra aba e faça login antes de entrar. Se o Instagram não te trouxer de volta automaticamente, clique em Entrar novamente.",
    loginButton: "Entrar com Instagram",
    dashboardGreeting: (name: string) =>
      `Ola, ${name}. Acompanhe seus comentarios e creditos.`,
    defaultUserName: "usuario",
    recentPosts: "Posts recentes",
    creditsAvailable: "Creditos disponiveis",
    analyzedCommentsMetric: "Comentarios analisados",
    hiddenNegatives: "Negativos ocultados",
    appPermissions: "Permissoes do app:",
    permissionHintBasic: "Acesso ao perfil e midia da conta Instagram",
    permissionHintComments: "Moderacao de comentarios: ler, ocultar e responder",
    footerPrivacy: "Privacidade",
    footerTerms: "Termos de Uso",
    footerDeletion: "Exclusão de Dados",
    thCaption: "Legenda",
    thDate: "Data",
    thLikes: "Curtidas",
    thComments: "Comentarios",
    thActions: "Acoes",
    analyze: "Analisar",
    analyzing: "Analisando...",
    analyzedCommentsTitle: (postId: string) =>
      `Comentarios analisados — post ${postId}`,
    thAuthor: "Autor",
    thComment: "Comentario",
    thSentiment: "Sentimento",
    instagramUser: "Usuario do Instagram",
    noCaption: "(sem legenda)",
    hiddenBadge: "oculto",
    hide: "Ocultar",
    unhide: "Exibir",
    reply: "Responder",
    replyDialogTitle: "Responder comentario",
    replyPlaceholder: "Escreva sua resposta...",
    cancel: "Cancelar",
    send: "Enviar",
    sending: "Enviando...",
    errorTitle: "Erro",
    errorLoadPosts: "Erro ao carregar posts",
    errorAnalyze: "Erro ao analisar",
    errorReply: "Erro ao responder",
    errorVisibility: "Erro ao alterar visibilidade",
    sentimentLabels: {
      positivo: "positivo",
      neutro: "neutro",
      negativo: "negativo",
    },
  },
  en: {
    loginDescription:
      "Analyze the sentiment of your Instagram comments and manage interactions in one place.",
    loginFirstAccess:
      "First time? Open instagram.com in another tab and log in before signing in. If Instagram does not bring you back automatically, click Sign in again.",
    loginButton: "Sign in with Instagram",
    dashboardGreeting: (name: string) =>
      `Hi, ${name}. Track your comments and credits.`,
    defaultUserName: "user",
    recentPosts: "Recent posts",
    creditsAvailable: "Available credits",
    analyzedCommentsMetric: "Analyzed comments",
    hiddenNegatives: "Hidden negatives",
    appPermissions: "App permissions:",
    permissionHintBasic: "Access to the Instagram account profile and media",
    permissionHintComments: "Comment moderation: read, hide and reply",
    footerPrivacy: "Privacy",
    footerTerms: "Terms of Use",
    footerDeletion: "Data Deletion",
    thCaption: "Caption",
    thDate: "Date",
    thLikes: "Likes",
    thComments: "Comments",
    thActions: "Actions",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    analyzedCommentsTitle: (postId: string) =>
      `Analyzed comments — post ${postId}`,
    thAuthor: "Author",
    thComment: "Comment",
    thSentiment: "Sentiment",
    instagramUser: "Instagram user",
    noCaption: "(no caption)",
    hiddenBadge: "hidden",
    hide: "Hide",
    unhide: "Unhide",
    reply: "Reply",
    replyDialogTitle: "Reply to comment",
    replyPlaceholder: "Type your reply...",
    cancel: "Cancel",
    send: "Send",
    sending: "Sending...",
    errorTitle: "Error",
    errorLoadPosts: "Failed to load posts",
    errorAnalyze: "Failed to analyze",
    errorReply: "Failed to send reply",
    errorVisibility: "Failed to change visibility",
    sentimentLabels: {
      positivo: "positive",
      neutro: "neutral",
      negativo: "negative",
    },
  },
};

export type Dictionary = (typeof dictionaries)["pt"];

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}
