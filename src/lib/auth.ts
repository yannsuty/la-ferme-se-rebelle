import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/roles";
import { isProductionApp } from "@/lib/env";

export type FarmMembershipSummary = {
  id: string;
  slug: string;
  name: string;
  role: Role;
};

declare module "next-auth" {
  interface User {
    farms: FarmMembershipSummary[];
    isSystemAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      isSystemAdmin: boolean;
    };
    farms: FarmMembershipSummary[];
    isSystemAdmin: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    farms: FarmMembershipSummary[];
    isSystemAdmin: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: {
            memberships: {
              where: {
                active: true,
                farm: { active: true },
              },
              include: {
                farm: {
                  select: { id: true, slug: true, name: true },
                },
              },
            },
          },
        });

        if (!user || !user.active) {
          if (!isProductionApp()) {
            console.warn("[auth] Connexion refusée", {
              email: parsed.data.email.toLowerCase(),
              userFound: Boolean(user),
              userActive: user?.active ?? false,
            });
          }
          return null;
        }

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) {
          if (!isProductionApp()) {
            console.warn("[auth] Mot de passe incorrect", {
              email: parsed.data.email.toLowerCase(),
            });
          }
          return null;
        }

        const farms = user.memberships.map((membership) => ({
          id: membership.farm.id,
          slug: membership.farm.slug,
          name: membership.farm.name,
          role: membership.role,
        }));

        if (!user.isSystemAdmin && farms.length === 0) {
          if (!isProductionApp()) {
            console.warn("[auth] Aucune ferme accessible", {
              email: parsed.data.email.toLowerCase(),
            });
          }
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          farms,
          isSystemAdmin: user.isSystemAdmin,
        };
      },
    }),
  ],
});
