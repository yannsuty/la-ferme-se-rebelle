# La Ferme se Rebelle — Gestion laitière PWA

Application web progressive (PWA) pour gérer une ferme de vaches laitières : comptes employés/patrons, carte des pâtures et sorties après traite.

## Stack

- **Next.js 16** (App Router) — déploiement **Vercel**
- **PostgreSQL** sur **Neon** via **Prisma**
- **NextAuth.js** — authentification par rôles (Patron / Employé)
- **Leaflet** — carte des pâtures et champs
- **Vitest** + **Playwright** — tests unitaires et fonctionnels

## Démarrage rapide

```bash
cp .env.example .env
# Renseigner DATABASE_URL (Neon) et AUTH_SECRET

npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Comptes de démo (après seed) :
- Patron : `patron@ferme.local` / `patron1234`
- Employé : `employe@ferme.local` / `employe1234`

## Fonctionnalités

1. **Comptes** — connexion, rôles Patron/Employé, gestion des utilisateurs (patron)
2. **Carte** — visualisation des pâtures/champs, affectation sortie matin/soir après traite

## Tests

```bash
npm run test              # unitaires
npm run test:coverage     # couverture ≥ 80 %
npm run test:e2e          # Playwright
npm run test:report       # génère docs/tests/RECAP_TESTS.md
```

## Déploiement Vercel

1. Créer un projet Neon et copier `DATABASE_URL`
2. Variables Vercel : `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`
3. Build : `prisma generate && prisma migrate deploy && next build`

## Documentation

- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Cas d'usage](docs/use-cases/USE_CASES.md)
- [Base de données](docs/database/DATABASE.md)
- [Récap tests](docs/tests/RECAP_TESTS.md)

## Règles Cursor

- `.cursor/rules/testing.mdc` — tests unitaires 80 %, Playwright, récap
- `.cursor/rules/documentation.mdc` — docs use cases, architecture, BDD
