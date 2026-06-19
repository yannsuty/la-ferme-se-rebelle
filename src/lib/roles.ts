export type Role = "OWNER" | "MANAGER" | "EMPLOYEE";

export function isOwner(role: Role): boolean {
  return role === "OWNER";
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "OWNER":
      return "Patron";
    case "MANAGER":
      return "Gérant";
    case "EMPLOYEE":
      return "Employé";
  }
}
