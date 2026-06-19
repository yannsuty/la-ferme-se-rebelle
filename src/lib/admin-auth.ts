import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireSystemAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }

  if (!session.isSystemAdmin) {
    return {
      error: NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }),
    };
  }

  return { session };
}
