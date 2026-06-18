import { auth } from "@/lib/auth";

export default auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.png|.*\\.svg|sw.js|workbox-.*).*)",
  ],
};
