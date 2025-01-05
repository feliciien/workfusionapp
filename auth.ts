import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import JiraProvider from "@/lib/jira-provider"
import { NextAuthOptions } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified
        };
      },
    }),
    JiraProvider({
      clientId: process.env.JIRA_CLIENT_ID ?? "",
      clientSecret: process.env.JIRA_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log("Sign in attempt:", { user, account, profile });
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        if (session?.user && token?.sub) {
          session.user.id = token.sub;
        }
        return session;
      } catch (error) {
        console.error("Session error:", error);
        return session;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log("Redirect attempt:", { url, baseUrl });
        // Always allow callback URLs
        if (url.startsWith('/api/auth/callback')) {
          return url;
        }
        // After successful authentication, redirect to dashboard
        if (url.includes('/auth/signin')) {
          return `${baseUrl}/dashboard`;
        }
        // Allow relative URLs
        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }
        // Allow same-origin URLs
        if (url.startsWith(baseUrl)) {
          return url;
        }
        return baseUrl;
      } catch (error) {
        console.error("Redirect error:", error);
        return baseUrl;
      }
    },
  },
  events: {
    async signIn(message) {
      console.log("Sign in success:", message);
    },
    async signOut(message) {
      console.log("Sign out:", message);
    },
    async createUser(message) {
      console.log("User created:", message);
    },
    async linkAccount(message) {
      console.log("Account linked:", message);
    },
    async session(message) {
      console.log("Session updated:", message);
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
