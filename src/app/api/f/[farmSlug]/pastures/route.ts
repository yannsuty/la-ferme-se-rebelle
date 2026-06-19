import { NextResponse } from "next/server";
import { requireFarmAuth } from "@/lib/farm-auth";
import { prisma } from "@/lib/prisma";
import { pastureSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ farmSlug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { farmSlug } = await params;
  const authResult = await requireFarmAuth(farmSlug);
  if (authResult.error) return authResult.error;

  const pastures = await prisma.pasture.findMany({
    where: { farmId: authResult.access.farm.id, active: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(pastures);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { farmSlug } = await params;
  const authResult = await requireFarmAuth(farmSlug, ["OWNER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = pastureSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const pasture = await prisma.pasture.create({
    data: {
      farmId: authResult.access.farm.id,
      name: parsed.data.name,
      type: parsed.data.type,
      description: parsed.data.description,
      geometry: parsed.data.geometry,
      color: parsed.data.color ?? "#22c55e",
    },
  });

  return NextResponse.json(pasture, { status: 201 });
}
