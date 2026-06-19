import { NextResponse } from "next/server";
import { requireFarmAuth } from "@/lib/farm-auth";
import { prisma } from "@/lib/prisma";
import { pastureSchema } from "@/lib/validations";
import { FARM_ADMIN_ROLES } from "@/lib/permissions";

type RouteParams = { params: Promise<{ farmSlug: string; id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { farmSlug, id } = await params;
  const authResult = await requireFarmAuth(farmSlug, FARM_ADMIN_ROLES);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = pastureSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.pasture.findFirst({
    where: { id, farmId: authResult.access.farm.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Parcelle introuvable" }, { status: 404 });
  }

  const pasture = await prisma.pasture.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(pasture);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { farmSlug, id } = await params;
  const authResult = await requireFarmAuth(farmSlug, FARM_ADMIN_ROLES);
  if (authResult.error) return authResult.error;

  const existing = await prisma.pasture.findFirst({
    where: { id, farmId: authResult.access.farm.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Parcelle introuvable" }, { status: 404 });
  }

  await prisma.pasture.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
