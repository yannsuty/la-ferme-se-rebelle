"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  { href: "/tableau-de-bord", label: "Tableau de bord" },
  { href: "/carte", label: "Carte des pâtures" },
  { href: "/admin/utilisateurs", label: "Utilisateurs", ownerOnly: true },
  { href: "/admin/patures", label: "Gérer les parcelles", ownerOnly: true },
];

export function AppNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isOwner = session?.user?.role === "OWNER";

  if (!session) return null;

  return (
    <header className="border-b border-emerald-900/20 bg-emerald-950 text-emerald-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-300/80">
            La Ferme se Rebelle
          </p>
          <p className="font-semibold">Gestion laitière</p>
        </div>
        <nav className="flex flex-wrap gap-2">
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
        <div className="flex items-center gap-3 text-sm">
          <span data-testid="user-name">{session.user.name}</span>
          <span className="rounded bg-emerald-800 px-2 py-0.5 text-xs uppercase">
            {session.user.role === "OWNER" ? "Patron" : "Employé"}
          </span>
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
