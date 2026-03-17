import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions = {

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: {
              provider_providerId: {
                provider: "google",
                providerId: account.providerAccountId,
              },
            },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                name: user.name || "User",
                email: user.email || "",
                provider: "google",
                providerId: account.providerAccountId,
                role: "CUSTOMER",
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Gagal verifikasi/buat user:", error);
          return false;
        }
      }
      return false;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account }: any) {
      if (account) {
        const dbUser = await prisma.user.findUnique({
          where: {
            provider_providerId: {
              provider: "google",
              providerId: account.providerAccountId,
            },
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
