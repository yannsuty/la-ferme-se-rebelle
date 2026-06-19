"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { PowerIcon } from "@/components/icons/nav-icons";
import { farmPath, parseFarmSlug } from "@/lib/farm-path";
import { canAccessFarmAdmin } from "@/lib/permissions";
import type { Role } from "@/lib/roles";

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const farmSlug = parseFarmSlug(pathname);
  const currentFarm = session?.farms.find((farm) => farm.slug === farmSlug);
  const canAdmin = currentFarm ? canAccessFarmAdmin(currentFarm.role as Role) : false;

  if (!session || pathname.startsWith("/admin")) return null;

  const links = farmSlug
    ? [
        { href: farmPath(farmSlug), label: "Tableau de bord" },
        { href: farmPath(farmSlug, "/carte"), label: "Carte des pâtures" },
        {
          href: farmPath(farmSlug, "/admin/utilisateurs"),
          label: "Utilisateurs",
          adminOnly: true,
        },
        {
          href: farmPath(farmSlug, "/admin/patures"),
          label: "Gérer les parcelles",
          adminOnly: true,
        },
      ]
    : [];

  return (
    <header className="border-b border-emerald-900/20 bg-emerald-950 text-emerald-50">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <p className="shrink-0 truncate font-semibold">
          {currentFarm?.name ?? "Gestion laitière"}
        </p>
        {links.length > 0 && (
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
            {links
              .filter((link) => !link.adminOnly || canAdmin)
              .map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`shrink-0 rounded-full px-3 py-1 text-sm transition ${
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
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="max-w-28 truncate text-sm sm:max-w-none" data-testid="user-name">
            {session.user.name}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/connexion" })}
            className="rounded p-1.5 text-emerald-100 transition hover:bg-emerald-900"
            data-testid="logout-button"
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <PowerIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
