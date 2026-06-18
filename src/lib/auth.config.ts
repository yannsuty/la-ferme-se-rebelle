import type { NextAuthConfig } from "next-auth";
import { farmPath, parseFarmSlug } from "@/lib/farm-path";

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

      if (pathname.startsWith("/api/") && !isAuthRoute) {
        return true;
      }

      if (!isLoggedIn && !isPublicPage && !isAuthRoute) {
        return false;
      }

      if (isLoggedIn && pathname === "/connexion") {
        return Response.redirect(new URL("/fermes", nextUrl));
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      session.farms = (token.farms as typeof session.farms) ?? [];
      return session;
    },
  },
} satisfies NextAuthConfig;
