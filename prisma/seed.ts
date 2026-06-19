import "dotenv/config";
import { seedDatabase } from "../src/lib/seed-database";

async function main() {
  console.log("Seed terminé :");
  await seedDatabase();
  console.log("  ✓ Données applicatives à jour");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
