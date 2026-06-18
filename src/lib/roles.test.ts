import { describe, expect, it } from "vitest";
import { isOwner, roleLabel } from "./roles";

describe("roles", () => {
  it("devrait identifier un patron", () => {
    expect(isOwner("OWNER")).toBe(true);
  });

  it("devrait exclure un employé", () => {
    expect(isOwner("EMPLOYEE")).toBe(false);
  });

  it("devrait formater les libellés de rôle", () => {
    expect(roleLabel("OWNER")).toBe("Patron");
    expect(roleLabel("EMPLOYEE")).toBe("Employé");
  });
});
