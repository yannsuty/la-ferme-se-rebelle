"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AppGridIcon,
  DashboardIcon,
  MapIcon,
  TaskListIcon,
} from "@/components/icons/nav-icons";
import { farmPath, parseFarmSlug } from "@/lib/farm-path";
import { isMobileNavActive, MOBILE_NAV_ITEMS } from "@/lib/mobile-nav";

const ICONS = {
  "/taches": TaskListIcon,
  "/tableau-de-bord": DashboardIcon,
  "/carte": MapIcon,
  "/applications": AppGridIcon,
} as const;

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const farmSlug = parseFarmSlug(pathname);

  if (!session || !farmSlug) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-900/30 bg-emerald-950 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navigation principale"
      data-testid="bottom-nav"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {MOBILE_NAV_ITEMS.map((item) => {
          const href = farmPath(farmSlug, item.path);
          const active = isMobileNavActive(pathname, farmSlug, item.path);
          const Icon = ICONS[item.path];

          return (
            <Link
              key={item.path}
              href={href}
              data-testid={item.testId}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 px-2 py-2.5 text-xs transition ${
                active
                  ? "text-emerald-300"
                  : "text-emerald-100/70 hover:text-emerald-100"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
