import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authSecret } from "@/lib/auth-secret";

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Auth authorize rejected: missing credentials");
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user || !user.is_active) {
          console.log("Auth authorize rejected: user missing or inactive", {
            email,
            foundUser: !!user,
            isActive: user?.is_active ?? null,
          });
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          console.log("Auth authorize rejected: invalid password", { email });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date() }
        });

        console.log("Auth authorize success", {
          email,
          userId: user.id,
          role: user.role,
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log("Auth jwt issued", {
          tokenId: token.id,
          role: token.role,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      console.log("Auth session resolved", {
        hasSessionUser: !!session.user,
        sessionUserId: session.user?.id ?? null,
        tokenId: (token.id as string | undefined) ?? null,
      });

      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
};
