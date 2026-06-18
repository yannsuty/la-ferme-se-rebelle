#!/usr/bin/env node
/**
 * Script de build Vercel : migrations BDD puis build Next.js.
 * Nécessite DATABASE_URL et DIRECT_URL configurées sur Vercel.
 */
import { execSync } from "node:child_process";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

const hasDatabase =
  process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log("=== Build La Ferme se Rebelle ===");

run("npx prisma generate");

if (hasDatabase) {
  try {
    run("npx prisma migrate deploy");
    console.log("✓ Migrations appliquées");
  } catch (error) {
    console.error("⚠ Échec des migrations — vérifiez DIRECT_URL");
    throw error;
  }

  if (process.env.RUN_DB_SEED === "true") {
    try {
      run("npx tsx prisma/seed.ts");
      console.log("✓ Seed exécuté");
    } catch (error) {
      console.error("⚠ Échec du seed");
      throw error;
    }
  }
} else {
  console.warn(
    "⚠ DATABASE_URL / DIRECT_URL absentes — migrations ignorées",
  );
}

run("npx next build");
console.log("\n✓ Build terminé");
