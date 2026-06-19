import { prisma } from "@/lib/prisma";

/** Supprime toutes les données applicatives (conserve le schéma). */
export async function purgeDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.grazingAssignment.deleteMany(),
    prisma.farmMembership.deleteMany(),
    prisma.pasture.deleteMany(),
    prisma.farm.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
