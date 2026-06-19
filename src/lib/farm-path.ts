export function farmPath(farmSlug: string, subpath = "/tableau-de-bord"): string {
  const normalized = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `/f/${farmSlug}${normalized}`;
}

export function farmApiPath(farmSlug: string, subpath: string): string {
  const normalized = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `/api/f/${farmSlug}${normalized}`;
}

export function parseFarmSlug(pathname: string): string | null {
  const match = pathname.match(/^\/f\/([^/]+)/);
  return match?.[1] ?? null;
}
