#!/usr/bin/env node
/**
 * Script de build Vercel : migrations BDD puis build Next.js.
 */
import { execSync } from "node:child_process";

const PRODUCTION_AUTH_URL = "https://la-ferme-se-rebelle.vercel.app";
const DEVELOP_AUTH_URL = "https://la-ferme-se-rebelle-dev.vercel.app";

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

function normalizeAuthUrl() {
  return process.env.AUTH_URL?.replace(/\/$/, "");
}

function isProductionDeploy() {
  const authUrl = normalizeAuthUrl();
  if (authUrl) {
    return authUrl === PRODUCTION_AUTH_URL;
  }
  return false;
}

function isDevelopDeploy() {
  return normalizeAuthUrl() === DEVELOP_AUTH_URL;
}

function shouldRunSeed() {
  if (process.env.RUN_DB_SEED === "true") return true;
  // Dev / staging : réappliquer le seed idempotent à chaque déploiement
  return !isProductionDeploy() && !!process.env.DIRECT_URL;
}

function shouldPurgeBeforeSeed() {
  if (!process.env.DIRECT_URL) return false;
  if (process.env.RUN_DB_PURGE === "false") return false;
  if (process.env.RUN_DB_PURGE === "true") return true;
  // Develop : reset complet automatique à chaque déploiement
  return isDevelopDeploy();
}

console.log("=== Build La Ferme se Rebelle ===");

run("npx prisma generate");

if (process.env.DIRECT_URL) {
  run("npx prisma migrate deploy");
  console.log("✓ Migrations appliquées");
} else {
  console.warn("⚠ DIRECT_URL absent — migrations ignorées au build");
}

if (shouldPurgeBeforeSeed()) {
  const reason = isDevelopDeploy()
    ? "auto-reset develop"
    : "RUN_DB_PURGE=true";
  console.log(`→ Purge avant seed (${reason})`);
  run("tsx scripts/db-purge.ts");
}

if (shouldRunSeed()) {
  if (isProductionDeploy()) {
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 16) {
      console.warn("⚠ Production : ADMIN_PASSWORD absent ou trop court — seed admin ignoré");
    } else {
      console.log("→ Seed admin production (RUN_DB_SEED=true)");
      run("npx tsx prisma/seed.ts");
      console.log("✓ Seed admin exécuté");
    }
  } else {
    console.log("→ Seed automatique (environnement non-production)");
    run("npx tsx prisma/seed.ts");
    console.log("✓ Seed exécuté");
  }
}

run("npx next build");
console.log("\n✓ Build terminé");
