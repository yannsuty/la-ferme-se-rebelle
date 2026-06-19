import { describe, expect, it } from "vitest";
import { slugifyFarmName } from "./slug";

describe("slugifyFarmName", () => {
  it("devrait convertir un nom en slug", () => {
    expect(slugifyFarmName("La Ferme se Rebelle")).toBe("la-ferme-se-rebelle");
  });

  it("devrait retirer les accents", () => {
    expect(slugifyFarmName("Étable du Pré")).toBe("etable-du-pre");
  });

  it("devrait gérer les caractères spéciaux", () => {
    expect(slugifyFarmName("Ferme #1 — Test!")).toBe("ferme-1-test");
  });
});

describe("uniqueFarmSlug", () => {
  it("devrait ajouter un suffixe si le slug existe", async () => {
    const { uniqueFarmSlug } = await import("./slug");
    const taken = new Set(["ma-ferme"]);

    const slug = await uniqueFarmSlug("Ma Ferme", async (candidate) =>
      taken.has(candidate),
    );

    expect(slug).toBe("ma-ferme-2");
  });
});
