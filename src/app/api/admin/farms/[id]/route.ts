import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { updateFarmSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const authResult = await requireSystemAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateFarmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.farm.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const farm = await prisma.farm.update({
    where: { id },
    data: parsed.data,
    include: {
      _count: {
        select: { memberships: true, pastures: true },
      },
    },
  });

  return NextResponse.json({
    id: farm.id,
    name: farm.name,
    slug: farm.slug,
    active: farm.active,
    memberCount: farm._count.memberships,
    pastureCount: farm._count.pastures,
    createdAt: farm.createdAt.toISOString(),
  });
}
