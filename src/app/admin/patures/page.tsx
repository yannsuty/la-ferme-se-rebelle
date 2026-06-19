import { prisma } from "@/lib/prisma";
import type { PastureInput } from "@/lib/validations";
import { PasturesManager } from "@/components/admin/pastures-manager";
import type { PastureData } from "@/components/map/pasture-map";

export const dynamic = "force-dynamic";

export default async function AdminPasturesPage() {
  const pastures = await prisma.pasture.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const pastureData: PastureData[] = pastures.map((pasture) => ({
    id: pasture.id,
    name: pasture.name,
    type: pasture.type,
    description: pasture.description,
    geometry: pasture.geometry as PastureInput["geometry"],
    color: pasture.color,
  }));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Parcelles</h1>
      </header>
      <PasturesManager initialPastures={pastureData} />
    </div>
  );
}
