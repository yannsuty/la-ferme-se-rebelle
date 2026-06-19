import { NextResponse } from "next/server";
import { requireFarmAuth } from "@/lib/farm-auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/password";
import { FARM_ADMIN_ROLES, canAssignRole } from "@/lib/permissions";

type RouteParams = { params: Promise<{ farmSlug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { farmSlug } = await params;
  const authResult = await requireFarmAuth(farmSlug, FARM_ADMIN_ROLES);
  if (authResult.error) return authResult.error;

  const members = await prisma.farmMembership.findMany({
    where: { farmId: authResult.access.farm.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    members.map((member) => ({
      id: member.user.id,
      membershipId: member.id,
      email: member.user.email,
      name: member.user.name,
      role: member.role,
      active: member.active,
    })),
  );
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

  if (
    !canAssignRole(authResult.access.membership.role, parsed.data.role)
  ) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas attribuer ce rôle" },
      { status: 403 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { farmId: authResult.access.farm.id },
      },
    },
  });

  if (existingUser?.memberships.length) {
    return NextResponse.json(
      { error: "Cet utilisateur appartient déjà à cette ferme" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const member = await prisma.$transaction(async (tx) => {
    const user =
      existingUser ??
      (await tx.user.create({
        data: {
          email,
          name: parsed.data.name,
          passwordHash,
        },
      }));

    const membership = await tx.farmMembership.create({
      data: {
        userId: user.id,
        farmId: authResult.access.farm.id,
        role: parsed.data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return membership;
  });

  return NextResponse.json(
    {
      id: member.user.id,
      membershipId: member.id,
      email: member.user.email,
      name: member.user.name,
      role: member.role,
      active: member.active,
    },
    { status: 201 },
  );
}
