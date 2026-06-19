import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getFarmAccess } from "@/lib/farm-auth";
import { auth } from "@/lib/auth";
import type { PastureInput } from "@/lib/validations";
import { canManagePastures } from "@/lib/permissions";
import { PasturesManager } from "@/components/admin/pastures-manager";
import type { PastureData } from "@/components/map/pasture-map";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ farmSlug: string }>;
};

export default async function AdminPasturesPage({ params }: PageProps) {
  const { farmSlug } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const access = await getFarmAccess(farmSlug, session.user.id);
  if (!access || !canManagePastures(access.membership.role)) notFound();

  const pastures = await prisma.pasture.findMany({
    where: { farmId: access.farm.id, active: true },
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
        <p className="text-sm uppercase tracking-wide text-emerald-700/80">
          {access.farm.name}
        </p>
        <h1 className="text-3xl font-bold">Parcelles</h1>
      </header>
      <PasturesManager farmSlug={farmSlug} initialPastures={pastureData} />
    </div>
  );
}
