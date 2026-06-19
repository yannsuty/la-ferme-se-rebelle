"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { PowerIcon } from "@/components/icons/nav-icons";

const LINKS = [
  { href: "/admin/fermes", label: "Fermes" },
  { href: "/admin/systeme", label: "Système" },
];

export function AdminNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.isSystemAdmin) return null;

  return (
    <header className="border-b border-emerald-900/20 bg-emerald-950 text-emerald-50">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <p className="shrink-0 truncate font-semibold">Administration système</p>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
          {LINKS.map((link) => {
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
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link href="/fermes" className="text-sm text-emerald-200 hover:underline">
            Mes fermes
          </Link>
          <span className="max-w-28 truncate text-sm sm:max-w-none">{session.user.name}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/connexion" })}
            className="rounded p-1.5 text-emerald-100 transition hover:bg-emerald-900"
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
