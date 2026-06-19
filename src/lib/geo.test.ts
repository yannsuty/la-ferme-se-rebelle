import { describe, expect, it } from "vitest";
import {
  escapeHtml,
  formatParcelType,
  formatSessionLabel,
  geoJsonToLeafletLatLngs,
  getPolygonCenter,
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

  it("devrait échapper les caractères HTML", () => {
    expect(escapeHtml('<script>"&"</script>')).toBe(
      "&lt;script&gt;&quot;&amp;&quot;&lt;/script&gt;",
    );
  });
});
