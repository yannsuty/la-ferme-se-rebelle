import { NextResponse } from "next/server";
import { requireFarmAuth } from "@/lib/farm-auth";
import { addFarmMember, listFarmMembers } from "@/lib/farm-members";
import { createUserSchema } from "@/lib/validations";
import { FARM_ADMIN_ROLES, canAssignRole } from "@/lib/permissions";

type RouteParams = { params: Promise<{ farmSlug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { farmSlug } = await params;
  const authResult = await requireFarmAuth(farmSlug, FARM_ADMIN_ROLES);
  if (authResult.error) return authResult.error;

  const members = await listFarmMembers(authResult.access.farm.id);
  return NextResponse.json(members);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { farmSlug } = await params;
  const authResult = await requireFarmAuth(farmSlug, FARM_ADMIN_ROLES);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!canAssignRole(authResult.access.membership.role, parsed.data.role)) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas attribuer ce rôle" },
      { status: 403 },
    );
  }

  const result = await addFarmMember(authResult.access.farm.id, parsed.data);

  if (result === "already_member") {
    return NextResponse.json(
      { error: "Cet utilisateur appartient déjà à cette ferme" },
      { status: 409 },
    );
  }

  return NextResponse.json(result, { status: 201 });
}
