import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GrazingPanel } from "@/components/map/grazing-panel";
import { todayIsoDate } from "@/lib/geo";
import { getFarmAccess } from "@/lib/farm-auth";
import { auth } from "@/lib/auth";
import type { PastureInput } from "@/lib/validations";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ farmSlug: string }>;
};

export default async function CartePage({ params }: PageProps) {
  const { farmSlug } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const access = await getFarmAccess(farmSlug, session.user.id);
  if (!access) notFound();

  const today = todayIsoDate();

  const [pastures, assignments] = await Promise.all([
    prisma.pasture.findMany({
      where: { farmId: access.farm.id, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.grazingAssignment.findMany({
      where: { farmId: access.farm.id, date: new Date(today) },
      include: {
        pasture: true,
        assignedBy: { select: { id: true, name: true } },
      },
    }),
  ]);

  const serializedPastures = pastures.map((p) => ({
    ...p,
    geometry: p.geometry as PastureInput["geometry"],
  }));

  const serializedAssignments = assignments.map((a) => ({
    ...a,
    date: a.date.toISOString(),
    pasture: {
      ...a.pasture,
      geometry: a.pasture.geometry as PastureInput["geometry"],
    },
  }));

  return (
    <GrazingPanel
      farmSlug={farmSlug}
      pastures={serializedPastures}
      initialAssignments={serializedAssignments}
    />
  );
}
