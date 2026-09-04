import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { getLongLivedToken } from "./instagram";

const INITIAL_CREDITS = 50;

type InstagramProfile = {
  user_id: string;
  username?: string;
  name?: string;
  account_type?: string;
};

// Fluxo "Instagram API with Instagram Login" (padrao da Meta desde jul/2024):
// o token ja pertence diretamente a conta profissional do Instagram
// (Business ou Creator) — nao ha Pagina do Facebook no fluxo.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://www.instagram.com/oauth/authorize",
        params: {
          scope: "instagram_business_basic,instagram_business_manage_comments",
        },
      },
      token: "https://api.instagram.com/oauth/access_token",
      userinfo: {
        url: "https://graph.instagram.com/v21.0/me",
        params: { fields: "user_id,username,name,account_type" },
      },
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      profile(profile: InstagramProfile) {
        return {
          id: profile.user_id,
          name: profile.name ?? profile.username ?? null,
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

        // Credito inicial para usuarios novos
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
