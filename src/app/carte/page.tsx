import { prisma } from "@/lib/prisma";
import { GrazingPanel } from "@/components/map/grazing-panel";
import { todayIsoDate } from "@/lib/geo";
import type { PastureInput } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function CartePage() {
  const today = todayIsoDate();

  const [pastures, assignments] = await Promise.all([
    prisma.pasture.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.grazingAssignment.findMany({
      where: { date: new Date(today) },
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
      pastures={serializedPastures}
      initialAssignments={serializedAssignments}
    />
  );
}
