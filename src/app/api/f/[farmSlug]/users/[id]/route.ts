import { NextResponse } from "next/server";
import { requireFarmAuth } from "@/lib/farm-auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/password";

type RouteParams = { params: Promise<{ farmSlug: string; id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { farmSlug, id } = await params;
  const authResult = await requireFarmAuth(farmSlug, ["OWNER"]);
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const membership = await prisma.farmMembership.findFirst({
    where: {
      farmId: authResult.access.farm.id,
      userId: id,
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  if (parsed.data.name) {
    await prisma.user.update({
      where: { id },
      data: { name: parsed.data.name },
    });
  }

  if (parsed.data.password) {
    await prisma.user.update({
      where: { id },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    });
  }

  const updatedMembership = await prisma.farmMembership.update({
    where: { id: membership.id },
    data: {
      role: parsed.data.role,
      active: parsed.data.active,
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  return NextResponse.json({
    id: updatedMembership.user.id,
    membershipId: updatedMembership.id,
    email: updatedMembership.user.email,
    name: parsed.data.name ?? updatedMembership.user.name,
    role: updatedMembership.role,
    active: updatedMembership.active,
  });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { farmSlug, id } = await params;
  const authResult = await requireFarmAuth(farmSlug, ["OWNER"]);
  if (authResult.error) return authResult.error;

  if (authResult.session!.user.id === id) {
    return NextResponse.json(
      { error: "Impossible de retirer votre propre accès" },
      { status: 400 },
    );
  }

  const membership = await prisma.farmMembership.findFirst({
    where: {
      farmId: authResult.access.farm.id,
      userId: id,
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
  }

  await prisma.farmMembership.update({
    where: { id: membership.id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
