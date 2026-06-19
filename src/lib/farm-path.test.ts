import { describe, expect, it } from "vitest";
import { farmApiPath, farmPath, parseFarmSlug } from "./farm-path";

describe("farmPath", () => {
  it("devrait construire un chemin de ferme", () => {
    expect(farmPath("ferme-rebelle", "/carte")).toBe("/f/ferme-rebelle/carte");
  });

  it("devrait utiliser le tableau de bord par défaut", () => {
    expect(farmPath("ferme-rebelle")).toBe("/f/ferme-rebelle/tableau-de-bord");
  });
});

describe("farmApiPath", () => {
  it("devrait construire un chemin API de ferme", () => {
    expect(farmApiPath("ferme-rebelle", "/pastures")).toBe(
      "/api/f/ferme-rebelle/pastures",
    );
  });
});

describe("parseFarmSlug", () => {
  it("devrait extraire le slug depuis l'URL", () => {
    expect(parseFarmSlug("/f/ferme-rebelle/carte")).toBe("ferme-rebelle");
  });

  it("devrait retourner null hors contexte ferme", () => {
    expect(parseFarmSlug("/connexion")).toBeNull();
  });
});
