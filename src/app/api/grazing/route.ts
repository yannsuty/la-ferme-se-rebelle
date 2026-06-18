import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { grazingAssignmentSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const assignments = await prisma.grazingAssignment.findMany({
    where: date ? { date: new Date(date) } : undefined,
    include: {
      pasture: true,
      assignedBy: { select: { id: true, name: true } },
    },
    orderBy: [{ date: "desc" }, { session: "asc" }],
  });

  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  const authResult = await requireAuth();
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
    where: { id: parsed.data.pastureId, active: true },
  });

  if (!pasture) {
    return NextResponse.json({ error: "Parcelle introuvable" }, { status: 404 });
  }

  const assignment = await prisma.grazingAssignment.upsert({
    where: {
      date_session: {
        date: new Date(parsed.data.date),
        session: parsed.data.session,
      },
    },
    create: {
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
