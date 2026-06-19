import { describe, expect, it } from "vitest";
import {
  canAccessFarmAdmin,
  canAssignRole,
  canManagePastures,
  canManageUsers,
  canModifyMember,
} from "./permissions";

describe("permissions", () => {
  it("devrait autoriser patron et gérant sur l'admin ferme", () => {
    expect(canAccessFarmAdmin("OWNER")).toBe(true);
    expect(canAccessFarmAdmin("MANAGER")).toBe(true);
    expect(canAccessFarmAdmin("EMPLOYEE")).toBe(false);
  });

  it("devrait limiter l'attribution de rôles pour un gérant", () => {
    expect(canAssignRole("OWNER", "OWNER")).toBe(true);
    expect(canAssignRole("MANAGER", "OWNER")).toBe(false);
    expect(canAssignRole("MANAGER", "MANAGER")).toBe(true);
    expect(canAssignRole("MANAGER", "EMPLOYEE")).toBe(true);
    expect(canAssignRole("EMPLOYEE", "EMPLOYEE")).toBe(false);
  });

  it("devrait empêcher un gérant de modifier un patron", () => {
    expect(canModifyMember("OWNER", "OWNER")).toBe(true);
    expect(canModifyMember("MANAGER", "OWNER")).toBe(false);
    expect(canModifyMember("MANAGER", "EMPLOYEE")).toBe(true);
  });

  it("devrait aligner gestion utilisateurs et parcelles", () => {
    expect(canManageUsers("MANAGER")).toBe(canManagePastures("MANAGER"));
    expect(canManageUsers("EMPLOYEE")).toBe(false);
  });
});
