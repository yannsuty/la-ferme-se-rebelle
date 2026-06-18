#!/usr/bin/env node
/**
 * Génère docs/tests/RECAP_TESTS.md à partir des résultats Vitest et Playwright.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs/tests");
const recapPath = path.join(docsDir, "RECAP_TESTS.md");
const coverageSummaryPath = path.join(root, "coverage/coverage-summary.json");

mkdirSync(docsDir, { recursive: true });

let unitExit = 0;
let e2eExit = 0;
let unitOutput = "";
let e2eOutput = "";

try {
  unitOutput = execSync("npm run test:coverage -- --run 2>&1", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
} catch (error) {
  unitExit = 1;
  unitOutput = String((error as { stdout?: string; stderr?: string }).stdout ?? error);
}

try {
  e2eOutput = execSync("npm run test:e2e 2>&1", {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
} catch (error) {
  e2eExit = 1;
  e2eOutput = String((error as { stdout?: string; stderr?: string }).stdout ?? error);
}

const date = new Date().toISOString().slice(0, 10);
let coverageTable = "| Module | Lignes | Branches | Fonctions |\n|--------|--------|----------|-----------|\n";

if (existsSync(coverageSummaryPath)) {
  const summary = JSON.parse(readFileSync(coverageSummaryPath, "utf8")) as Record<
    string,
    { lines: { pct: number }; branches: { pct: number }; functions: { pct: number } }
  >;
  for (const [key, value] of Object.entries(summary)) {
    if (key === "total") continue;
    const moduleName = key.replace(`${root}/`, "").replace(/^src\//, "");
    coverageTable += `| ${moduleName} | ${value.lines.pct}% | ${value.branches.pct}% | ${value.functions.pct}% |\n`;
  }
  const total = summary.total;
  if (total) {
    coverageTable += `| **TOTAL** | **${total.lines.pct}%** | **${total.branches.pct}%** | **${total.functions.pct}%** |\n`;
  }
}

const content = `# Récapitulatif des tests — ${date}

## Synthèse

| Type | Statut |
|------|--------|
| Tests unitaires (Vitest) | ${unitExit === 0 ? "✅ Passés" : "❌ Échecs"} |
| Tests fonctionnels (Playwright) | ${e2eExit === 0 ? "✅ Passés" : "❌ Échecs"} |
| Seuil couverture | 80 % (lignes, branches, fonctions, statements) |

## Tests unitaires

Suites principales :
- \`src/lib/validations.test.ts\` — schémas Zod (auth, parcelles, affectations)
- \`src/lib/geo.test.ts\` — utilitaires carte et formatage
- \`src/lib/password.test.ts\` — hachage bcrypt
- \`src/lib/auth.test.ts\` — rôles

\`\`\`
${unitOutput.slice(-2000)}
\`\`\`

## Tests fonctionnels (Playwright)

Scénarios dans \`e2e/auth-and-map.spec.ts\` :
- Connexion patron / employé
- Refus identifiants invalides
- Page gestion utilisateurs (patron)
- Carte des pâtures et panneau sortie après traite

\`\`\`
${e2eOutput.slice(-2000)}
\`\`\`

## Couverture par module

${coverageTable}

## Commandes exécutées

- \`npm run test:coverage\`
- \`npm run test:e2e\`

## Notes

- Les tests e2e nécessitent une base Neon migrée et seedée (\`npx prisma migrate deploy && npx tsx prisma/seed.ts\`).
- Régénérer ce fichier : \`npm run test:report\`
`;

writeFileSync(recapPath, content, "utf8");
console.log(`Récap généré : ${recapPath}`);

if (unitExit !== 0 || e2eExit !== 0) {
  process.exit(1);
}
