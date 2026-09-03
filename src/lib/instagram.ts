const GRAPH_API = "https://graph.facebook.com/v21.0";

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

export async function getLongLivedToken(
  shortLivedToken: string
): Promise<LongLivedToken> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.FACEBOOK_CLIENT_ID ?? "",
    client_secret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
    fb_exchange_token: shortLivedToken,
  });
  return graphFetch<LongLivedToken>(
    `${GRAPH_API}/oauth/access_token?${params.toString()}`
  );
}

export type InstagramBusinessAccount = {
  igUserId: string;
  username: string | null;
};

// Descobre a conta Instagram Business vinculada a uma Pagina do Facebook do usuario
export async function getInstagramBusinessAccount(
  accessToken: string
): Promise<InstagramBusinessAccount | null> {
  const pages = await graphFetch<{
    data?: Array<{
      id: string;
      instagram_business_account?: { id: string };
    }>;
  }>(
    `${GRAPH_API}/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
  );

  const igId = pages.data?.find((p) => p.instagram_business_account)
    ?.instagram_business_account?.id;
  if (!igId) return null;

  const igProfile = await graphFetch<{ username?: string }>(
    `${GRAPH_API}/${igId}?fields=username&access_token=${accessToken}`
  );

  return { igUserId: igId, username: igProfile.username ?? null };
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
