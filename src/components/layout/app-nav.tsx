"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { farmPath, parseFarmSlug } from "@/lib/farm-path";
import { roleLabel } from "@/lib/roles";

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const farmSlug = parseFarmSlug(pathname);
  const currentFarm = session?.farms.find((farm) => farm.slug === farmSlug);
  const isOwner = currentFarm?.role === "OWNER";

  if (!session) return null;

  const links = farmSlug
    ? [
        { href: farmPath(farmSlug), label: "Tableau de bord" },
        { href: farmPath(farmSlug, "/carte"), label: "Carte des pâtures" },
        {
          href: farmPath(farmSlug, "/admin/utilisateurs"),
          label: "Utilisateurs",
          ownerOnly: true,
        },
        {
          href: farmPath(farmSlug, "/admin/patures"),
          label: "Gérer les parcelles",
          ownerOnly: true,
        },
      ]
    : [];

  return (
    <header className="border-b border-emerald-900/20 bg-emerald-950 text-emerald-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-300/80">
            La Ferme se Rebelle
          </p>
          <p className="font-semibold">
            {currentFarm?.name ?? "Gestion laitière"}
          </p>
        </div>
        {links.length > 0 && (
          <nav className="hidden flex-wrap gap-2 md:flex">
            {links
              .filter((link) => !link.ownerOnly || isOwner)
              .map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      active
                        ? "bg-emerald-500 text-white"
                        : "text-emerald-100 hover:bg-emerald-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {session.farms.length > 1 && (
            <Link
              href="/fermes"
              className="rounded border border-emerald-700 px-2 py-1 hover:bg-emerald-900"
              data-testid="farm-switcher"
            >
              Changer de ferme
            </Link>
          )}
          <span data-testid="user-name">{session.user.name}</span>
          {currentFarm && (
            <span className="rounded bg-emerald-800 px-2 py-0.5 text-xs uppercase">
              {roleLabel(currentFarm.role)}
            </span>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/connexion" })}
            className="rounded border border-emerald-700 px-2 py-1 hover:bg-emerald-900"
            data-testid="logout-button"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
