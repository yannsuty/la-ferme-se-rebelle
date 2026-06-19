import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_PASSWORD_NON_PROD,
  getAdminEmail,
  getProductionAdminPassword,
  isProductionApp,
} from "@/lib/env";

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

const collinePastures = [
  {
    name: "Plateau",
    type: "PASTURE" as const,
    description: "Pâture en hauteur",
    color: "#84cc16",
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [2.0100, 47.0100],
          [2.0110, 47.0100],
          [2.0110, 47.0108],
          [2.0100, 47.0108],
          [2.0100, 47.0100],
        ],
      ],
    },
  },
];

async function seedSystemAdmin() {
  const email = getAdminEmail().toLowerCase();
  const password = isProductionApp()
    ? getProductionAdminPassword()
    : ADMIN_PASSWORD_NON_PROD;

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Administrateur système",
      passwordHash,
      active: true,
      isSystemAdmin: true,
    },
    create: {
      email,
      name: "Administrateur système",
      passwordHash,
      isSystemAdmin: true,
    },
  });
}

async function seedDemoData() {
  const ownerPassword = await hashPassword("patron1234");
  const managerPassword = await hashPassword("gerant1234");
  const employeePassword = await hashPassword("employe1234");

  const rebelle = await prisma.farm.upsert({
    where: { slug: "ferme-rebelle" },
    update: {},
    create: {
      name: "La Ferme se Rebelle",
      slug: "ferme-rebelle",
    },
  });

  const colline = await prisma.farm.upsert({
    where: { slug: "ferme-des-collines" },
    update: {},
    create: {
      name: "Ferme des Collines",
      slug: "ferme-des-collines",
    },
  });

  const patron = await prisma.user.upsert({
    where: { email: "patron@ferme.local" },
    update: {
      name: "Jean Patron",
      passwordHash: ownerPassword,
      active: true,
    },
    create: {
      email: "patron@ferme.local",
      name: "Jean Patron",
      passwordHash: ownerPassword,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "gerant@ferme.local" },
    update: {
      name: "Paul Gérant",
      passwordHash: managerPassword,
      active: true,
    },
    create: {
      email: "gerant@ferme.local",
      name: "Paul Gérant",
      passwordHash: managerPassword,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employe@ferme.local" },
    update: {
      name: "Marie Employée",
      passwordHash: employeePassword,
      active: true,
    },
    create: {
      email: "employe@ferme.local",
      name: "Marie Employée",
      passwordHash: employeePassword,
    },
  });

  const memberships = [
    { userId: patron.id, farmId: rebelle.id, role: "OWNER" as const },
    { userId: patron.id, farmId: colline.id, role: "OWNER" as const },
    { userId: manager.id, farmId: rebelle.id, role: "MANAGER" as const },
    { userId: employee.id, farmId: rebelle.id, role: "EMPLOYEE" as const },
    { userId: employee.id, farmId: colline.id, role: "EMPLOYEE" as const },
  ];

  for (const membership of memberships) {
    await prisma.farmMembership.upsert({
      where: {
        userId_farmId: {
          userId: membership.userId,
          farmId: membership.farmId,
        },
      },
      update: {
        role: membership.role,
        active: true,
      },
      create: membership,
    });
  }

  for (const pasture of demoPastures) {
    const existing = await prisma.pasture.findFirst({
      where: { farmId: rebelle.id, name: pasture.name },
    });
    if (!existing) {
      await prisma.pasture.create({
        data: { ...pasture, farmId: rebelle.id },
      });
    }
  }

  for (const pasture of collinePastures) {
    const existing = await prisma.pasture.findFirst({
      where: { farmId: colline.id, name: pasture.name },
    });
    if (!existing) {
      await prisma.pasture.create({
        data: { ...pasture, farmId: colline.id },
      });
    }
  }
}

export async function seedDatabase(): Promise<void> {
  await seedSystemAdmin();

  if (!isProductionApp()) {
    await seedDemoData();
  }
}
