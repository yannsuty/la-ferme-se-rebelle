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

/** Convertit des positions Leaflet [lat, lng] en polygone GeoJSON [lng, lat]. */
export function leafletLatLngsToGeoJson(
  positions: [number, number][],
): GeoPolygon {
  if (positions.length < 3) {
    throw new Error("Un polygone doit contenir au moins 3 points");
  }

  const coordinates = positions.map(
    ([lat, lng]) => [lng, lat] as [number, number],
  );
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    coordinates.push([first[0], first[1]]);
  }

  return { type: "Polygon", coordinates: [coordinates] };
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
