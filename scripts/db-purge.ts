import "dotenv/config";
import { purgeDatabase } from "../src/lib/db-purge";

async function main() {
  console.log("→ Purge de la base de données…");
  await purgeDatabase();
  console.log("✓ Purge terminée");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../src/lib/prisma");
    await prisma.$disconnect();
  });
