import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createFarmSchema } from "@/lib/validations";
import { uniqueFarmSlug } from "@/lib/slug";

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

  const farm = await prisma.farm.create({
    data: {
      name: parsed.data.name,
      slug,
    },
  });

  return NextResponse.json(
    {
      id: farm.id,
      name: farm.name,
      slug: farm.slug,
      active: farm.active,
      memberCount: 0,
      pastureCount: 0,
      createdAt: farm.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
