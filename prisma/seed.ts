import "dotenv/config";
import { hashPassword } from "../src/lib/password";
import { prisma } from "../src/lib/prisma";

const demoPastures = [
  {
    name: "Pâture Nord",
    type: "PASTURE" as const,
    description: "Pâture principale au nord de l'étable",
    color: "#22c55e",
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [2.0001, 47.0001],
          [2.0015, 47.0001],
          [2.0015, 47.0010],
          [2.0001, 47.0010],
          [2.0001, 47.0001],
        ],
      ],
    },
  },
  {
    name: "Pâture Sud",
    type: "PASTURE" as const,
    description: "Pâture ombragée",
    color: "#16a34a",
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [2.0001, 46.9990],
          [2.0015, 46.9990],
          [2.0015, 46.9998],
          [2.0001, 46.9998],
          [2.0001, 46.9990],
        ],
      ],
    },
  },
  {
    name: "Champ Est",
    type: "FIELD" as const,
    description: "Champ de regroupement après traite du soir",
    color: "#eab308",
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [2.0020, 47.0000],
          [2.0030, 47.0000],
          [2.0030, 47.0008],
          [2.0020, 47.0008],
          [2.0020, 47.0000],
        ],
      ],
    },
  },
];

async function main() {
  const ownerPassword = await hashPassword("patron1234");
  const employeePassword = await hashPassword("employe1234");

  await prisma.user.upsert({
    where: { email: "patron@ferme.local" },
    update: {},
    create: {
      email: "patron@ferme.local",
      name: "Jean Patron",
      role: "OWNER",
      passwordHash: ownerPassword,
    },
  });

  await prisma.user.upsert({
    where: { email: "employe@ferme.local" },
    update: {},
    create: {
      email: "employe@ferme.local",
      name: "Marie Employée",
      role: "EMPLOYEE",
      passwordHash: employeePassword,
    },
  });

  for (const pasture of demoPastures) {
    const existing = await prisma.pasture.findFirst({
      where: { name: pasture.name },
    });
    if (!existing) {
      await prisma.pasture.create({ data: pasture });
    }
  }

  console.log("Seed terminé :");
  console.log("  Patron  → patron@ferme.local / patron1234");
  console.log("  Employé → employe@ferme.local / employe1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
