import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createFarmSchema } from "@/lib/validations";
import { uniqueFarmSlug } from "@/lib/slug";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const authResult = await requireSystemAdmin();
  if (authResult.error) return authResult.error;

  const farms = await prisma.farm.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { memberships: true, pastures: true },
      },
    },
  });

  return NextResponse.json(
    farms.map((farm) => ({
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      active: farm.active,
      memberCount: farm._count.memberships,
      pastureCount: farm._count.pastures,
      createdAt: farm.createdAt.toISOString(),
    })),
  );
}

export async function POST(request: Request) {
  const authResult = await requireSystemAdmin();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createFarmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const slug =
    parsed.data.slug ??
    (await uniqueFarmSlug(parsed.data.name, async (candidate) => {
      const existing = await prisma.farm.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    }));

  if (parsed.data.slug) {
    const existing = await prisma.farm.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });
    }
  }

  const email = parsed.data.manager.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  const passwordHash = existingUser
    ? null
    : await hashPassword(parsed.data.manager.password);

  const farm = await prisma.$transaction(async (tx) => {
    const createdFarm = await tx.farm.create({
      data: {
        name: parsed.data.name,
        slug,
      },
    });

    const user =
      existingUser ??
      (await tx.user.create({
        data: {
          email,
          name: parsed.data.manager.name,
          passwordHash: passwordHash!,
        },
      }));

    const existingMembership = await tx.farmMembership.findUnique({
      where: {
        userId_farmId: {
          userId: user.id,
          farmId: createdFarm.id,
        },
      },
    });

    if (existingMembership) {
      throw new Error("MEMBER_EXISTS");
    }

    await tx.farmMembership.create({
      data: {
        userId: user.id,
        farmId: createdFarm.id,
        role: "MANAGER",
      },
    });

    return createdFarm;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "MEMBER_EXISTS") {
      return null;
    }
    throw error;
  });

  if (!farm) {
    return NextResponse.json(
      { error: "Cet utilisateur appartient déjà à cette ferme" },
      { status: 409 },
    );
  }

  return NextResponse.json(
    {
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      active: farm.active,
      memberCount: 1,
      pastureCount: 0,
      createdAt: farm.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
