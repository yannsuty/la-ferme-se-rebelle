import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { purgeDatabase } from "@/lib/db-purge";
import { canResetDatabase } from "@/lib/env";
import { seedDatabase } from "@/lib/seed-database";
import { databaseResetSchema } from "@/lib/validations";

export async function POST(request: Request) {
  if (!canResetDatabase()) {
    return NextResponse.json(
      { error: "Réinitialisation interdite en production" },
      { status: 403 },
    );
  }

  const authResult = await requireSystemAdmin();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = databaseResetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Confirmation requise : saisir exactement "REINITIALISER"',
      },
      { status: 400 },
    );
  }

  const resetSecret = process.env.DB_RESET_SECRET;
  if (resetSecret) {
    const provided = request.headers.get("x-db-reset-secret");
    if (provided !== resetSecret) {
      return NextResponse.json({ error: "Secret de réinitialisation invalide" }, { status: 403 });
    }
  }

  await purgeDatabase();
  await seedDatabase();

  return NextResponse.json({
    ok: true,
    message: "Base réinitialisée : purge et seed appliqués",
  });
}
