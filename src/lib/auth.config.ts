import type { NextAuthConfig } from "next-auth";
import { farmPath, parseFarmSlug } from "@/lib/farm-path";

function readIsSystemAdmin(auth: { isSystemAdmin?: boolean; user?: { isSystemAdmin?: boolean } } | null): boolean {
  return auth?.user?.isSystemAdmin ?? auth?.isSystemAdmin ?? false;
}

export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isAuthRoute = pathname.startsWith("/api/auth");
      const isPublicPage = pathname === "/connexion";
      const farmSlug = parseFarmSlug(pathname);
      const isSystemAdmin = readIsSystemAdmin(auth);
      const isGlobalAdminRoute = pathname.startsWith("/admin");
      const isGlobalAdminApi = pathname.startsWith("/api/admin");

      if (pathname.startsWith("/api/") && !isAuthRoute && !isGlobalAdminApi) {
        return true;
      }

      if (!isLoggedIn && !isPublicPage && !isAuthRoute) {
        return false;
      }

      if (isLoggedIn && pathname === "/connexion") {
        const destination = isSystemAdmin ? "/admin/fermes" : "/fermes";
        return Response.redirect(new URL(destination, nextUrl));
      }

      if (isGlobalAdminRoute || isGlobalAdminApi) {
        if (!isLoggedIn) {
          return false;
        }
        if (isGlobalAdminRoute && !isSystemAdmin) {
          return Response.redirect(new URL("/fermes", nextUrl));
        }
        return true;
      }

      if (farmSlug) {
        const farms = auth?.farms ?? [];
        const membership = farms.find((farm) => farm.slug === farmSlug);

        if (!membership) {
          return Response.redirect(new URL("/fermes", nextUrl));
        }

        if (pathname.includes("/admin") && membership.role !== "OWNER") {
          return Response.redirect(
            new URL(farmPath(farmSlug, "/tableau-de-bord"), nextUrl),
          );
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.farms = user.farms;
        token.isSystemAdmin = user.isSystemAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSystemAdmin = (token.isSystemAdmin as boolean) ?? false;
      }
      session.farms = (token.farms as typeof session.farms) ?? [];
      session.isSystemAdmin = (token.isSystemAdmin as boolean) ?? false;
      return session;
    },
  },
} satisfies NextAuthConfig;
