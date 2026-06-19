import { FarmsManager } from "@/components/admin/farms-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFarmsPage() {
  const farms = await prisma.farm.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { memberships: true, pastures: true },
      },
    },
  });

  const initialFarms = farms.map((farm) => ({
    id: farm.id,
    name: farm.name,
    slug: farm.slug,
    active: farm.active,
    memberCount: farm._count.memberships,
    pastureCount: farm._count.pastures,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Gestion des fermes</h1>
        <p className="text-emerald-800/80">
          Créez et gérez les exploitations disponibles dans l&apos;application.
        </p>
      </header>
      <FarmsManager initialFarms={initialFarms} />
    </div>
  );
}
