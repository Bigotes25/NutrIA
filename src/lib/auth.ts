import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authSecret } from "@/lib/auth-secret";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleAuthEnabled = Boolean(googleClientId && googleClientSecret);

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    ...(googleAuthEnabled
      ? [
          GoogleProvider({
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          }),
        ]
      : []),
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

        if (!user.password_hash) {
          console.log("Auth authorize rejected: user has no local password", { email });
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
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();

      if (!email) {
        console.log("Google sign-in rejected: missing email");
        return false;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: {
            select: { id: true, name: true },
          },
        },
      });

      if (existingUser && !existingUser.is_active) {
        console.log("Google sign-in rejected: inactive user", { email, userId: existingUser.id });
        return false;
      }

      const displayName = user.name?.trim() || email.split("@")[0];

      if (!existingUser) {
        const password_hash = await bcrypt.hash(`${crypto.randomUUID()}-${Date.now()}`, 10);

        const createdUser = await prisma.user.create({
          data: {
            email,
            password_hash,
            role: "USER",
            last_login_at: new Date(),
            profile: {
              create: {
                name: displayName,
              },
            },
          },
        });

        console.log("Google sign-in created user", {
          email,
          userId: createdUser.id,
        });

        return true;
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          last_login_at: new Date(),
          ...(existingUser.profile
            ? {}
            : {
                profile: {
                  create: {
                    name: displayName,
                  },
                },
              }),
        },
      });

      console.log("Google sign-in linked existing user", {
        email,
        userId: existingUser.id,
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log("Auth jwt issued", {
          tokenId: token.id,
          role: token.role,
        });
      }

      if ((!token.id || !token.role) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true, role: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          console.log("Auth jwt hydrated from db", {
            tokenId: token.id,
            role: token.role,
          });
        }
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
