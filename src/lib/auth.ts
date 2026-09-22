import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { getLongLivedToken } from "./instagram";

const INITIAL_CREDITS = 50;

type InstagramProfile = {
  user_id: string;
  username?: string;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      checks: ["none"],
      authorization: {
        url: "https://www.instagram.com/oauth/authorize",
        params: {
          scope: "instagram_business_basic instagram_business_manage_comments"
        }
      },
      token: {
        url: "https://api.instagram.com/oauth/access_token",
        async request(context) {
          const { provider, params } = context;
          const tokenUrl =
            typeof provider.token === "string"
              ? provider.token
              : (provider.token?.url as string);
          const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: provider.clientId as string,
              client_secret: provider.clientSecret as string,
              grant_type: "authorization_code",
              redirect_uri: provider.callbackUrl,
              code: params.code as string,
            }),
          });
          const text = await res.text();
          if (!res.ok) throw new Error(`token exchange: HTTP ${res.status} - ${text}`);
          // a resposta pode vir JSON ou form-encoded; tente os dois
          let raw: Record<string, unknown>;
          try {
            raw = JSON.parse(text);
          } catch {
            raw = Object.fromEntries(new URLSearchParams(text));
          }
          // O adapter gravaria todos os campos da resposta (user_id, permissions...)
          // na tabela Account, que nao possui essas colunas (adapter_error_linkAccount).
          // Manter apenas o que o adapter suporta.
          const tokens: Record<string, unknown> = {
            access_token: raw.access_token,
          };
          if (raw.expires_in) tokens.expires_in = raw.expires_in;
          return { tokens };
        },
      },
      userinfo: {
        url: "https://graph.instagram.com/v21.0/me",
        params: { fields: "user_id,username" }
      },
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      profile(profile: InstagramProfile) {
        return {
          id: profile.user_id,
          name: profile.username ?? null,
          email: null,
          image: null,
        };
      },
    },
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  // Os upserts NAO podem ficar no callback signIn: o next-auth v4 o executa
  // ANTES de persistir o usuario (core/routes/callback.js), e nesse ponto
  // user.id ainda e o user_id numerico do Instagram -> FK P2003.
  // No event signIn o usuario ja foi gravado pelo adapter, entao user.id
  // e o ID do Prisma.
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "instagram" || !account.access_token) {
        return;
      }

      try {
        const longLived = await getLongLivedToken(account.access_token);
        // `profile` e o objeto mapeado pelo profile() do provider:
        // id = user_id numerico do Instagram, name = username.
        const mapped = profile as { id?: unknown; name?: unknown } | undefined;
        const igUserId = String(mapped?.id ?? user.id);
        const username = typeof mapped?.name === "string" ? mapped.name : null;
        const tokenExpiresAt = new Date(
          Date.now() + (longLived.expires_in ?? 0) * 1000
        );

        await prisma.instagramAccount.upsert({
          where: { igUserId },
          create: {
            userId: user.id,
            igUserId,
            username,
            accessToken: longLived.access_token,
            tokenExpiresAt,
          },
          update: {
            userId: user.id,
            username,
            accessToken: longLived.access_token,
            tokenExpiresAt,
          },
        });

        await prisma.credit.upsert({
          where: { userId: user.id },
          create: { userId: user.id, balance: INITIAL_CREDITS },
          update: {},
        });
      } catch (error) {
        console.error("Erro no event signIn (upsert Instagram/Credit):", error);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};