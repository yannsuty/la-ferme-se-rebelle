import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Role } from "@/lib/roles";

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }

  return { session };
}
