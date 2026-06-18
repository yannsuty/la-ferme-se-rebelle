#!/usr/bin/env node
/**
 * Script de build Vercel : migrations BDD puis build Next.js.
 */
import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

console.log("=== Build La Ferme se Rebelle ===");

run("npx prisma generate");

if (process.env.DIRECT_URL) {
  run("npx prisma migrate deploy");
  console.log("✓ Migrations appliquées");
} else {
  console.warn("⚠ DIRECT_URL absent — migrations ignorées au build");
}

if (process.env.RUN_DB_SEED === "true") {
  run("npx tsx prisma/seed.ts");
  console.log("✓ Seed exécuté");
}

run("npx next build");
console.log("\n✓ Build terminé");
