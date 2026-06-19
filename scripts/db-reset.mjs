#!/usr/bin/env node
/**
 * Réinitialisation complète : purge + migrations + seed.
 */
import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

console.log("=== Réinitialisation base de données ===");

run("tsx scripts/db-purge.ts");

if (process.env.DIRECT_URL || process.env.DATABASE_URL) {
  run("npx prisma migrate deploy");
  console.log("✓ Migrations appliquées");
} else {
  console.warn("⚠ Aucune URL BDD — migrations ignorées");
}

run("npx tsx prisma/seed.ts");
console.log("\n✓ Réinitialisation terminée (purge + migrate + seed)");
