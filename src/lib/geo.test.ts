import { describe, expect, it } from "vitest";
import {
  formatParcelType,
  formatSessionLabel,
  geoJsonToLeafletLatLngs,
  getPolygonCenter,
  leafletLatLngsToGeoJson,
  todayIsoDate,
} from "./geo";

const samplePolygon = {
  type: "Polygon" as const,
  coordinates: [
    [
      [2.0, 47.0],
      [2.2, 47.0],
      [2.2, 47.2],
      [2.0, 47.2],
      [2.0, 47.0],
    ],
  ],
};

describe("geo utilities", () => {
  it("devrait convertir GeoJSON en coordonnées Leaflet", () => {
    const latLngs = geoJsonToLeafletLatLngs(samplePolygon);
    expect(latLngs[0]).toEqual([47.0, 2.0]);
  });

  it("devrait convertir des coordonnées Leaflet en GeoJSON", () => {
    const latLngs: [number, number][] = [
      [47.0, 2.0],
      [47.0, 2.2],
      [47.2, 2.2],
      [47.2, 2.0],
    ];
    const geometry = leafletLatLngsToGeoJson(latLngs);
    expect(geometry.type).toBe("Polygon");
    expect(geometry.coordinates[0][0]).toEqual([2.0, 47.0]);
    expect(geometry.coordinates[0].at(-1)).toEqual([2.0, 47.0]);
  });

  it("devrait rejeter un polygone avec moins de 3 points", () => {
    expect(() =>
      leafletLatLngsToGeoJson([
        [47.0, 2.0],
        [47.1, 2.1],
      ]),
    ).toThrow("au moins 3 points");
  });

  it("devrait calculer le centre d'un polygone", () => {
    const center = getPolygonCenter(samplePolygon);
    expect(center[0]).toBeCloseTo(47.08, 1);
    expect(center[1]).toBeCloseTo(2.08, 1);
  });

  it("devrait formater les sessions de traite", () => {
    expect(formatSessionLabel("MORNING")).toBe("Traite du matin");
    expect(formatSessionLabel("EVENING")).toBe("Traite du soir");
  });

  it("devrait formater les types de parcelle", () => {
    expect(formatParcelType("PASTURE")).toBe("Pâture");
    expect(formatParcelType("FIELD")).toBe("Champ");
  });

  it("devrait retourner la date du jour au format ISO", () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
