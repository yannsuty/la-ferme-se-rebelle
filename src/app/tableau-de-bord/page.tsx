import { auth } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayIsoDate } from "@/lib/geo";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const today = todayIsoDate();

  const [pastureCount, todayAssignments] = await Promise.all([
    prisma.pasture.count({ where: { active: true } }),
    prisma.grazingAssignment.findMany({
      where: { date: new Date(today) },
      include: { pasture: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-emerald-800/80">
          Bienvenue, {session?.user.name}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-sm text-emerald-700">Parcelles actives</p>
          <p className="text-3xl font-bold" data-testid="pasture-count">
            {pastureCount}
          </p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-sm text-emerald-700">Sorties du jour</p>
          <p className="text-3xl font-bold" data-testid="assignment-count">
            {todayAssignments.length}
          </p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-sm text-emerald-700">Votre rôle</p>
          <p className="text-xl font-semibold">
            {session?.user.role === "OWNER" ? "Patron" : "Employé"}
          </p>
        </article>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/carte"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Voir la carte des pâtures
        </Link>
        {session?.user.role === "OWNER" && (
          <Link
            href="/admin/utilisateurs"
            className="rounded-lg border border-emerald-300 px-4 py-2 hover:bg-emerald-100"
          >
            Gérer les comptes
          </Link>
        )}
      </div>
    </div>
  );
}
