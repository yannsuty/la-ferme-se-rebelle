#!/usr/bin/env node
/**
 * Script de build Vercel : migrations BDD puis build Next.js.
 */
import { execSync } from "node:child_process";

const PRODUCTION_AUTH_URL = "https://la-ferme-se-rebelle.vercel.app";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

function isProductionDeploy() {
  const authUrl = process.env.AUTH_URL?.replace(/\/$/, "");
  if (authUrl) {
    return authUrl === PRODUCTION_AUTH_URL;
  }
  return false;
}

function shouldRunSeed() {
  if (process.env.RUN_DB_SEED === "true") return true;
  // Dev / staging : réappliquer le seed idempotent à chaque déploiement
  // pour garantir comptes démo + adhésions multi-fermes après migration.
  return !isProductionDeploy() && !!process.env.DIRECT_URL;
}

console.log("=== Build La Ferme se Rebelle ===");

run("npx prisma generate");

if (process.env.DIRECT_URL) {
  run("npx prisma migrate deploy");
  console.log("✓ Migrations appliquées");
} else {
  console.warn("⚠ DIRECT_URL absent — migrations ignorées au build");
}

if (shouldRunSeed()) {
  console.log("→ Seed automatique (environnement non-production)");
  run("npx tsx prisma/seed.ts");
  console.log("✓ Seed exécuté");
}

run("npx next build");
console.log("\n✓ Build terminé");
