import { compare } from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { convexMutation, convexQuery } from "@/lib/server/convex";
import { getServerEnv } from "@/lib/env";

function buildProviders() {
  const env = getServerEnv();
  const providers = [] as NextAuthOptions["providers"];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      })
    );
  }

  providers.push(
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existing = await convexQuery<{
          authId: string;
          userId: string;
          email: string;
          username: string;
          avatarUrl?: string;
          passwordHash: string;
        } | null>("users:getCredentialsByEmail", {
          email: credentials.email,
        });

        if (!existing) return null;

        const valid = await compare(credentials.password, existing.passwordHash);
        if (!valid) return null;

        return {
          id: existing.authId,
          email: existing.email,
          name: existing.username,
          image: existing.avatarUrl,
        };
      },
    })
  );

  return providers;
}

function oauthAuthId(provider: string, providerAccountId: string) {
  return `oauth:${provider}:${providerAccountId}`;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: getServerEnv().NEXTAUTH_SECRET,
  providers: buildProviders(),
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return true;

      const isCredentials = account.provider === "credentials";
      const authId = isCredentials
        ? user.id
        : oauthAuthId(account.provider, account.providerAccountId);

      await convexMutation("users:upsertOAuthUser", {
        authId,
        email: user.email,
        username:
          user.name ||
          user.email?.split("@")[0] ||
          `user_${Math.random().toString(36).slice(2, 8)}`,
        avatarUrl: user.image,
      });

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "credentials") {
          token.authId = user.id;
        } else if (account?.provider && account.providerAccountId) {
          token.authId = oauthAuthId(account.provider, account.providerAccountId);
        }
      }

      if (token.authId) {
        const dbUser = await convexQuery<{
          id: string;
          authId: string;
          username: string;
          email?: string;
          avatarUrl?: string;
        } | null>("users:getByAuthId", {
          authId: token.authId,
        });

        if (dbUser) {
          token.name = dbUser.username;
          token.email = dbUser.email;
          token.picture = dbUser.avatarUrl;
          token.userId = dbUser.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.authId = (token.authId as string) || undefined;
        session.user.id = (token.userId as string) || undefined;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
