import type { Role } from "@/lib/roles";

export const FARM_ROLES: Role[] = ["OWNER", "MANAGER", "EMPLOYEE"];

export const FARM_ADMIN_ROLES: Role[] = ["OWNER", "MANAGER"];

export function canAccessFarmAdmin(role: Role): boolean {
  return FARM_ADMIN_ROLES.includes(role);
}

export function canManagePastures(role: Role): boolean {
  return canAccessFarmAdmin(role);
}

export function canManageUsers(role: Role): boolean {
  return canAccessFarmAdmin(role);
}

export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === "OWNER") return true;
  if (actorRole === "MANAGER") {
    return targetRole === "EMPLOYEE" || targetRole === "MANAGER";
  }
  return false;
}

export function canModifyMember(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === "OWNER") return true;
  if (actorRole === "MANAGER") return targetRole !== "OWNER";
  return false;
}
