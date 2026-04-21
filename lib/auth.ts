import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const SUPER_ADMIN_EMAILS = [
  "nawwafzayyan27@gmail.com",
  "nawwafzayyanmusyafa@mail.ugm.ac.id",
];

function isSuperAdminEmail(email: string) {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

function normalizeEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase();
}

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
          const normalizedEmail = normalizeEmail(user.email);
          const shouldBeSuperAdmin = isSuperAdminEmail(normalizedEmail);

          const existingByProvider = await prisma.user.findUnique({
            where: {
              provider_providerId: {
                provider: "google",
                providerId: account.providerAccountId,
              },
            },
          });

          const existingByEmail = !existingByProvider && normalizedEmail
            ? await prisma.user.findFirst({
              where: {
                email: {
                  equals: normalizedEmail,
                  mode: "insensitive",
                },
              },
            })
            : null;

          const existingUser = existingByProvider ?? existingByEmail;

          if (!existingUser) {
            await prisma.user.create({
              data: {
                name: user.name || "User",
                email: normalizedEmail,
                provider: "google",
                providerId: account.providerAccountId,
                role: shouldBeSuperAdmin ? "SUPERADMIN" : "CUSTOMER",
              },
            });
          } else {
            const shouldUpdateRole = shouldBeSuperAdmin && existingUser.role !== "SUPERADMIN";
            const shouldUpdateName = Boolean(user.name && user.name !== existingUser.name);
            const shouldUpdateEmail = Boolean(normalizedEmail && normalizedEmail !== existingUser.email);
            const shouldUpdateProvider =
              existingUser.provider !== "google" || existingUser.providerId !== account.providerAccountId;

            if (shouldUpdateRole || shouldUpdateName || shouldUpdateEmail || shouldUpdateProvider) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  ...(shouldUpdateRole ? { role: "SUPERADMIN" } : {}),
                  ...(shouldUpdateName ? { name: user.name } : {}),
                  ...(shouldUpdateEmail ? { email: normalizedEmail } : {}),
                  ...(shouldUpdateProvider ? {
                    provider: "google",
                    providerId: account.providerAccountId,
                  } : {}),
                },
              });
            }
          }

          await prisma.user.updateMany({
            where: {
              OR: SUPER_ADMIN_EMAILS.map((email) => ({
                email: {
                  equals: email,
                  mode: "insensitive",
                },
              })),
            },
            data: {
              role: "SUPERADMIN",
            },
          });

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
      const dbUser =
        typeof token.email === "string"
          ? await prisma.user.findFirst({
            where: {
              email: {
                equals: normalizeEmail(token.email),
                mode: "insensitive",
              },
            },
          })
          : account
            ? await prisma.user.findUnique({
              where: {
                provider_providerId: {
                  provider: "google",
                  providerId: account.providerAccountId,
                },
              },
            })
            : null;

      if (dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
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
