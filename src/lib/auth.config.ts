import type { NextAuthConfig } from "next-auth";

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
      const isPublic =
        pathname.startsWith("/connexion") || pathname.startsWith("/api/auth");

      if (!isLoggedIn && !isPublic) return false;
      if (isLoggedIn && pathname === "/connexion") {
        return Response.redirect(new URL("/tableau-de-bord", nextUrl));
      }
      if (pathname.startsWith("/admin") && auth?.user?.role !== "OWNER") {
        return Response.redirect(new URL("/tableau-de-bord", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "OWNER" | "EMPLOYEE";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
