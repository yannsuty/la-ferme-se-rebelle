import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AppGridIcon,
  DashboardIcon,
  FarmSwitchIcon,
  MapIcon,
  TaskListIcon,
} from "@/components/icons/nav-icons";
import { auth } from "@/lib/auth";
import { getFarmAccess } from "@/lib/farm-auth";
import { farmPath } from "@/lib/farm-path";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ farmSlug: string }>;
};

const APPS = [
  {
    href: (slug: string) => farmPath(slug),
    label: "Tableau de bord",
    description: "Vue d'ensemble de la ferme",
    icon: DashboardIcon,
    ownerOnly: false,
    testId: "app-tile-dashboard",
  },
  {
    href: (slug: string) => farmPath(slug, "/carte"),
    label: "Carte des pâtures",
    description: "Parcelles et sorties après traite",
    icon: MapIcon,
    ownerOnly: false,
    testId: "app-tile-carte",
  },
  {
    href: (slug: string) => farmPath(slug, "/taches"),
    label: "Liste de tâches",
    description: "Travaux à planifier et suivre",
    icon: TaskListIcon,
    ownerOnly: false,
    testId: "app-tile-taches",
  },
  {
    href: (slug: string) => farmPath(slug, "/admin/utilisateurs"),
    label: "Utilisateurs",
    description: "Comptes et accès de l'équipe",
    icon: AppGridIcon,
    ownerOnly: true,
    testId: "app-tile-users",
  },
  {
    href: (slug: string) => farmPath(slug, "/admin/patures"),
    label: "Gérer les parcelles",
    description: "Création et édition des pâtures",
    icon: MapIcon,
    ownerOnly: true,
    testId: "app-tile-patures",
  },
] as const;

export default async function ApplicationsPage({ params }: PageProps) {
  const { farmSlug } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const access = await getFarmAccess(farmSlug, session.user.id);
  if (!access) notFound();

  const isOwner = access.membership.role === "OWNER";
  const visibleApps = APPS.filter((app) => !app.ownerOnly || isOwner);
  const hasMultipleFarms = session.farms.length > 1;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-emerald-700/80">
          {access.farm.name}
        </p>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-emerald-800/80">
          Accédez rapidement à toutes les sections de l'application.
        </p>
      </header>

      <div
        className="grid gap-4 sm:grid-cols-2"
        data-testid="app-mosaic"
      >
        {visibleApps.map((app) => {
          const Icon = app.icon;
          return (
            <Link
              key={app.testId}
              href={app.href(farmSlug)}
              data-testid={app.testId}
              className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-white p-4 transition hover:border-emerald-400 hover:shadow-sm"
            >
              <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-semibold text-emerald-950">
                  {app.label}
                </span>
                <span className="mt-1 block text-sm text-emerald-800/80">
                  {app.description}
                </span>
              </span>
            </Link>
          );
        })}
        {hasMultipleFarms && (
          <Link
            href="/fermes"
            data-testid="farm-switcher"
            className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-white p-4 transition hover:border-emerald-400 hover:shadow-sm"
          >
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <FarmSwitchIcon className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold text-emerald-950">
                Changer de ferme
              </span>
              <span className="mt-1 block text-sm text-emerald-800/80">
                Sélectionner une autre exploitation
              </span>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
