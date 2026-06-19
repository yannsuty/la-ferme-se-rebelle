import type { PastureInput } from "@/lib/validations";

export type GeoPolygon = PastureInput["geometry"];

export function getPolygonCenter(geometry: GeoPolygon): [number, number] {
  const ring = geometry.coordinates[0];
  if (!ring || ring.length === 0) return [0, 0];

  const sum = ring.reduce(
    (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat] as [number, number],
    [0, 0] as [number, number],
  );

  return [sum[1] / ring.length, sum[0] / ring.length];
}

export function geoJsonToLeafletLatLngs(
  geometry: GeoPolygon,
): [number, number][] {
  return geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatSessionLabel(session: "MORNING" | "EVENING"): string {
  return session === "MORNING" ? "Traite du matin" : "Traite du soir";
}

export function formatParcelType(type: "PASTURE" | "FIELD"): string {
  return type === "PASTURE" ? "Pâture" : "Champ";
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
