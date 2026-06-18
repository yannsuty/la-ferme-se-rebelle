import { farmPath } from "@/lib/farm-path";

export const MOBILE_NAV_ITEMS = [
  { path: "/taches", label: "Tâches", testId: "nav-taches" },
  { path: "/tableau-de-bord", label: "Tableau", testId: "nav-dashboard" },
  { path: "/carte", label: "Carte", testId: "nav-carte" },
  { path: "/applications", label: "Apps", testId: "nav-apps" },
] as const;

export function isMobileNavActive(
  pathname: string,
  farmSlug: string,
  path: string,
): boolean {
  const href = farmPath(farmSlug, path);

  if (path === "/tableau-de-bord") {
    return pathname === href || pathname === farmPath(farmSlug);
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
