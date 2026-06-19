import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { Role } from "@/lib/roles";

export type FarmAccess = {
  farm: {
    id: string;
    name: string;
    slug: string;
  };
  membership: {
    id: string;
    role: Role;
    active: boolean;
  };
};

export async function getFarmAccess(
  farmSlug: string,
  userId: string,
): Promise<FarmAccess | null> {
  const membership = await prisma.farmMembership.findFirst({
    where: {
      userId,
      active: true,
      user: { active: true },
      farm: { slug: farmSlug, active: true },
    },
    include: {
      farm: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!membership) return null;

  return {
    farm: membership.farm,
    membership: {
      id: membership.id,
      role: membership.role,
      active: membership.active,
    },
  };
}

export async function requireFarmAuth(
  farmSlug: string,
  allowedRoles?: Role[],
) {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
    };
  }

  const access = await getFarmAccess(farmSlug, session.user.id);

  if (!access) {
    return {
      error: NextResponse.json({ error: "Ferme inaccessible" }, { status: 403 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(access.membership.role)) {
    return {
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
    };
  }

  return { session, access };
}
