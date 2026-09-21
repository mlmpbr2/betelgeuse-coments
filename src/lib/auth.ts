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
          let tokens: Record<string, unknown>;
          try {
            tokens = JSON.parse(text);
          } catch {
            tokens = Object.fromEntries(new URLSearchParams(text));
          }
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
    async signIn({ user, account, profile }) {
      if (account?.provider !== "instagram" || !account.access_token) {
        return true;
      }

      try {
        const longLived = await getLongLivedToken(account.access_token);
        const igProfile = profile as InstagramProfile | undefined;
        const igUserId = igProfile?.user_id ?? user.id;
        const username = igProfile?.username ?? null;
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
        console.error("Erro no signIn (upsert Instagram/Credit):", error);
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};