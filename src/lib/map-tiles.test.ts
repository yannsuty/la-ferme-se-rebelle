import { describe, expect, it } from "vitest";
import { BASEMAP_LABELS, MAP_TILES } from "./map-tiles";

describe("map-tiles", () => {
  it("devrait exposer une tuile plan et une tuile satellite", () => {
    expect(MAP_TILES.plan.url).toContain("openstreetmap");
    expect(MAP_TILES.satellite.url).toContain("World_Imagery");
  });

  it("devrait fournir des libellés en français", () => {
    expect(BASEMAP_LABELS.plan).toBe("Plan");
    expect(BASEMAP_LABELS.satellite).toBe("Satellite");
  });
});
