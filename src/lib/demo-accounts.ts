export const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@test.local", password: "admin12345678" },
  { role: "Patron", email: "patron@ferme.local", password: "patron1234" },
  { role: "Gérant", email: "gerant@ferme.local", password: "gerant1234" },
  { role: "Employé", email: "employe@ferme.local", password: "employe1234" },
] as const;

export const PRODUCTION_ADMIN_LABEL = "Admin système (production)";
