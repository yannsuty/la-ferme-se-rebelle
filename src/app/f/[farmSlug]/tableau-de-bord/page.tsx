import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayIsoDate } from "@/lib/geo";
import { getFarmAccess } from "@/lib/farm-auth";
import { auth } from "@/lib/auth";
import { farmPath } from "@/lib/farm-path";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ farmSlug: string }>;
};

export default async function DashboardPage({ params }: PageProps) {
  const { farmSlug } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const access = await getFarmAccess(farmSlug, session.user.id);
  if (!access) notFound();

  const today = todayIsoDate();

  const [pastureCount, todayAssignments] = await Promise.all([
    prisma.pasture.count({
      where: { farmId: access.farm.id, active: true },
    }),
    prisma.grazingAssignment.findMany({
      where: { farmId: access.farm.id, date: new Date(today) },
      include: { pasture: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-emerald-700/80">
          {access.farm.name}
        </p>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-emerald-800/80">
          Bienvenue, {session.user.name}
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
          <p className="text-xl font-semibold" data-testid="farm-role">
            {access.membership.role === "OWNER" ? "Patron" : "Employé"}
          </p>
        </article>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={farmPath(farmSlug, "/carte")}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Voir la carte des pâtures
        </Link>
        {access.membership.role === "OWNER" && (
          <Link
            href={farmPath(farmSlug, "/admin/utilisateurs")}
            className="rounded-lg border border-emerald-300 px-4 py-2 hover:bg-emerald-100"
          >
            Gérer les comptes
          </Link>
        )}
      </div>
    </div>
  );
}
