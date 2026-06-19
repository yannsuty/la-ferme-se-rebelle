import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { addFarmMember, listFarmMembers } from "@/lib/farm-members";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations";

type RouteParams = { params: Promise<{ id: string }> };

async function getFarmOr404(id: string) {
  const farm = await prisma.farm.findUnique({ where: { id } });
  if (!farm) return null;
  return farm;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const authResult = await requireSystemAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const farm = await getFarmOr404(id);
  if (!farm) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const members = await listFarmMembers(farm.id);
  return NextResponse.json(members);
}

export async function POST(request: Request, { params }: RouteParams) {
  const authResult = await requireSystemAdmin();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const farm = await getFarmOr404(id);
  if (!farm) {
    return NextResponse.json({ error: "Ferme introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await addFarmMember(farm.id, parsed.data);

  if (result === "already_member") {
    return NextResponse.json(
      { error: "Cet utilisateur appartient déjà à cette ferme" },
      { status: 409 },
    );
  }

  return NextResponse.json(result, { status: 201 });
}
