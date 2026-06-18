import { prisma } from "@/lib/prisma";
import type { PastureInput } from "@/lib/validations";

export const dynamic = "force-dynamic";

export default async function AdminPasturesPage() {
  const pastures = await prisma.pasture.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">Parcelles</h1>
        <p className="text-emerald-800/80">
          Liste des pâtures et champs enregistrés (édition avancée à venir).
        </p>
      </header>
      <ul className="space-y-2" data-testid="pastures-list">
        {pastures.map((pasture) => {
          const geometry = pasture.geometry as PastureInput["geometry"];
          const pointCount = geometry.coordinates[0]?.length ?? 0;
          return (
            <li
              key={pasture.id}
              className="rounded-xl border border-emerald-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-block h-4 w-4 rounded"
                  style={{ backgroundColor: pasture.color }}
                />
                <div>
                  <p className="font-medium">{pasture.name}</p>
                  <p className="text-sm text-emerald-800/70">
                    {pasture.type === "PASTURE" ? "Pâture" : "Champ"} — {pointCount}{" "}
                    points
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
