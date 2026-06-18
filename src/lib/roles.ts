export type Role = "OWNER" | "EMPLOYEE";

export function isOwner(role: Role): boolean {
  return role === "OWNER";
}

export function roleLabel(role: Role): string {
  return role === "OWNER" ? "Patron" : "Employé";
}
