const GRAPH_API = "https://graph.instagram.com/v21.0";

type GraphError = {
  error?: { message?: string; type?: string; code?: number };
};

async function graphFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = (await res.json()) as T & GraphError;
  if (!res.ok || body.error) {
    throw new Error(
      body.error?.message ?? `Instagram Graph API: HTTP ${res.status}`
    );
  }
  return body;
}

export type LongLivedToken = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

// Instagram Login (fluxo novo da Meta): troca o token curto por um long-lived (60 dias)
export async function getLongLivedToken(
  shortLivedToken: string
): Promise<LongLivedToken> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    access_token: shortLivedToken,
  });
  return graphFetch<LongLivedToken>(
    `${GRAPH_API}/access_token?${params.toString()}`
  );
}

export type InstagramPost = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
};

export async function getPosts(
  igUserId: string,
  accessToken: string
): Promise<InstagramPost[]> {
  const data = await graphFetch<{ data?: InstagramPost[] }>(
    `${GRAPH_API}/${igUserId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=50&access_token=${accessToken}`
  );
  return data.data ?? [];
}

export type InstagramComment = {
  id: string;
  text?: string;
  username?: string;
  timestamp?: string;
  hidden?: boolean;
};

export async function getComments(
  mediaId: string,
  accessToken: string
): Promise<InstagramComment[]> {
  const data = await graphFetch<{ data?: InstagramComment[] }>(
    `${GRAPH_API}/${mediaId}/comments?fields=id,text,username,timestamp,hidden&limit=100&access_token=${accessToken}`
  );
  return data.data ?? [];
}

export async function setCommentHidden(
  commentId: string,
  accessToken: string,
  hidden: boolean
): Promise<void> {
  const params = new URLSearchParams({
    is_hidden: String(hidden),
    access_token: accessToken,
  });
  await graphFetch<{ success?: boolean }>(
    `${GRAPH_API}/${commentId}?${params.toString()}`,
    { method: "POST" }
  );
}

export async function replyToComment(
  commentId: string,
  accessToken: string,
  message: string
): Promise<{ id: string }> {
  const params = new URLSearchParams({
    message,
    access_token: accessToken,
  });
  return graphFetch<{ id: string }>(
    `${GRAPH_API}/${commentId}/replies?${params.toString()}`,
    { method: "POST" }
  );
}
