import { NextResponse } from "next/server";
import { requireFarmAuth } from "@/lib/farm-auth";
import { prisma } from "@/lib/prisma";
import { grazingAssignmentSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ farmSlug: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { farmSlug } = await params;
  const authResult = await requireFarmAuth(farmSlug);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const assignments = await prisma.grazingAssignment.findMany({
    where: {
      farmId: authResult.access.farm.id,
      ...(date ? { date: new Date(date) } : {}),
    },
    include: {
      pasture: true,
      assignedBy: { select: { id: true, name: true } },
    },
    orderBy: [{ date: "desc" }, { session: "asc" }],
  });

  return NextResponse.json(assignments);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { farmSlug } = await params;
  const authResult = await requireFarmAuth(farmSlug);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = grazingAssignmentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const pasture = await prisma.pasture.findFirst({
    where: {
      id: parsed.data.pastureId,
      farmId: authResult.access.farm.id,
      active: true,
    },
  });

  if (!pasture) {
    return NextResponse.json({ error: "Parcelle introuvable" }, { status: 404 });
  }

  const assignment = await prisma.grazingAssignment.upsert({
    where: {
      farmId_date_session: {
        farmId: authResult.access.farm.id,
        date: new Date(parsed.data.date),
        session: parsed.data.session,
      },
    },
    create: {
      farmId: authResult.access.farm.id,
      date: new Date(parsed.data.date),
      session: parsed.data.session,
      pastureId: parsed.data.pastureId,
      assignedById: authResult.session!.user.id,
      notes: parsed.data.notes,
    },
    update: {
      pastureId: parsed.data.pastureId,
      assignedById: authResult.session!.user.id,
      notes: parsed.data.notes,
    },
    include: {
      pasture: true,
      assignedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(assignment);
}
