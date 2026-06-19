import { describe, expect, it } from "vitest";
import {
  createUserSchema,
  createFarmSchema,
  databaseResetSchema,
  grazingAssignmentSchema,
  loginSchema,
  pastureSchema,
} from "./validations";

describe("loginSchema", () => {
  it("devrait valider des identifiants corrects", () => {
    const result = loginSchema.safeParse({
      email: "patron@ferme.local",
      password: "patron1234",
    });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un email invalide", () => {
    const result = loginSchema.safeParse({
      email: "pas-un-email",
      password: "patron1234",
    });
    expect(result.success).toBe(false);
  });
});

describe("createUserSchema", () => {
  it("devrait valider la création d'un employé", () => {
    const result = createUserSchema.safeParse({
      email: "nouveau@ferme.local",
      password: "motdepasse",
      name: "Paul",
      role: "EMPLOYEE",
    });
    expect(result.success).toBe(true);
  });
});

describe("pastureSchema", () => {
  it("devrait valider un polygone GeoJSON", () => {
    const result = pastureSchema.safeParse({
      name: "Pâture Test",
      type: "PASTURE",
      geometry: {
        type: "Polygon",
        coordinates: [[[2.0, 47.0], [2.1, 47.0], [2.1, 47.1], [2.0, 47.1], [2.0, 47.0]]],
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("grazingAssignmentSchema", () => {
  it("devrait valider une affectation de traite du matin", () => {
    const result = grazingAssignmentSchema.safeParse({
      date: "2025-06-18",
      session: "MORNING",
      pastureId: "clxyz123",
    });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter une date invalide", () => {
    const result = grazingAssignmentSchema.safeParse({
      date: "18-06-2025",
      session: "EVENING",
      pastureId: "clxyz123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createFarmSchema", () => {
  it("devrait valider une ferme avec nom seul", () => {
    const result = createFarmSchema.safeParse({ name: "Ma Ferme" });
    expect(result.success).toBe(true);
  });

  it("devrait rejeter un slug invalide", () => {
    const result = createFarmSchema.safeParse({
      name: "Ma Ferme",
      slug: "Slug Invalide",
    });
    expect(result.success).toBe(false);
  });
});

describe("databaseResetSchema", () => {
  it("devrait exiger la confirmation exacte", () => {
    const ok = databaseResetSchema.safeParse({ confirmation: "REINITIALISER" });
    const ko = databaseResetSchema.safeParse({ confirmation: "reset" });
    expect(ok.success).toBe(true);
    expect(ko.success).toBe(false);
  });
});
