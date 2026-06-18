import { describe, expect, it } from "vitest";
import { isMobileNavActive } from "./mobile-nav";

describe("isMobileNavActive", () => {
  const farmSlug = "ferme-rebelle";

  it("devrait activer le tableau de bord sur la route par défaut", () => {
    expect(
      isMobileNavActive(
        "/f/ferme-rebelle/tableau-de-bord",
        farmSlug,
        "/tableau-de-bord",
      ),
    ).toBe(true);
  });

  it("devrait activer la carte sur la route carte", () => {
    expect(
      isMobileNavActive("/f/ferme-rebelle/carte", farmSlug, "/carte"),
    ).toBe(true);
  });

  it("devrait activer les tâches sur la route taches", () => {
    expect(
      isMobileNavActive("/f/ferme-rebelle/taches", farmSlug, "/taches"),
    ).toBe(true);
  });

  it("devrait activer les applications sur la route applications", () => {
    expect(
      isMobileNavActive(
        "/f/ferme-rebelle/applications",
        farmSlug,
        "/applications",
      ),
    ).toBe(true);
  });

  it("ne devrait pas activer la carte sur le tableau de bord", () => {
    expect(
      isMobileNavActive(
        "/f/ferme-rebelle/tableau-de-bord",
        farmSlug,
        "/carte",
      ),
    ).toBe(false);
  });
});
