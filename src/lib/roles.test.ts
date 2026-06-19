import { describe, expect, it } from "vitest";
import { isOwner, roleLabel } from "./roles";

describe("roles", () => {
  it("devrait identifier le patron", () => {
    expect(isOwner("OWNER")).toBe(true);
  });

  it("devrait exclure gérant et employé du statut patron", () => {
    expect(isOwner("MANAGER")).toBe(false);
    expect(isOwner("EMPLOYEE")).toBe(false);
  });

  it("devrait retourner les libellés français", () => {
    expect(roleLabel("OWNER")).toBe("Patron");
    expect(roleLabel("MANAGER")).toBe("Gérant");
    expect(roleLabel("EMPLOYEE")).toBe("Employé");
  });
});
