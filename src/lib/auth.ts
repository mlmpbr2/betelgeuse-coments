import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { getLongLivedToken } from "./instagram";

const INITIAL_CREDITS = 50;

type InstagramProfile = {
  id: string;
  name?: string;
  email?: string;
  picture?: { data?: { url?: string } };
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
        url: "https://www.facebook.com/v21.0/dialog/oauth",
        params: {
          scope: "email public_profile pages_show_list pages_read_engagement instagram_business_basic instagram_business_manage_comments"
        }
      },
      token: {
        url: "https://graph.facebook.com/v21.0/oauth/access_token"
      },
      userinfo: {
        url: "https://graph.facebook.com/v21.0/me",
        params: { fields: "id,name,email,picture" }
      },
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      profile(profile: InstagramProfile) {
        return {
          id: profile.id,
          name: profile.name ?? null,
          email: profile.email ?? null,
          image: profile.picture?.data?.url ?? null,
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
        const igUserId = igProfile?.id ?? user.id;
        const username = igProfile?.name ?? null;
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