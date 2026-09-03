import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { getInstagramBusinessAccount, getLongLivedToken } from "./instagram";

const INITIAL_CREDITS = 50;

// A Instagram Basic Display API foi descontinuada pela Meta; o login para a
// Instagram Graph API (contas Business/Creator) passa pelo OAuth do Facebook.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "instagram",
      name: "Instagram",
      type: "oauth",
      authorization: {
        url: "https://www.facebook.com/v21.0/dialog/oauth",
        params: {
          scope:
            "instagram_basic,instagram_manage_comments,pages_show_list,business_management",
        },
      },
      token: "https://graph.facebook.com/v21.0/oauth/access_token",
      userinfo: {
        url: "https://graph.facebook.com/v21.0/me",
        params: { fields: "id,name" },
      },
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      profile(profile: { id: string; name?: string }) {
        return {
          id: profile.id,
          name: profile.name ?? null,
          email: null,
          image: null,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "instagram" || !account.access_token) {
        return true;
      }

      try {
        const longLived = await getLongLivedToken(account.access_token);
        const igAccount = await getInstagramBusinessAccount(
          longLived.access_token
        );

        if (igAccount) {
          await prisma.instagramAccount.upsert({
            where: { igUserId: igAccount.igUserId },
            create: {
              userId: user.id,
              igUserId: igAccount.igUserId,
              username: igAccount.username,
              accessToken: longLived.access_token,
              tokenExpiresAt: new Date(Date.now() + longLived.expires_in * 1000),
            },
            update: {
              userId: user.id,
              username: igAccount.username,
              accessToken: longLived.access_token,
              tokenExpiresAt: new Date(Date.now() + longLived.expires_in * 1000),
            },
          });
        }

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
