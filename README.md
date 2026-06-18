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

### Variables d'environnement obligatoires

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL poolée Neon (`-pooler`) |
| `DIRECT_URL` | URL directe Neon (migrations) |
| `AUTH_SECRET` | Secret JWT (32+ octets aléatoires) |
| `AUTH_URL` | URL publique de l'app (ex. `https://la-ferme-se-rebelle.vercel.app`) |

### Script de setup au build

Le build Vercel exécute automatiquement `scripts/vercel-build.mjs` :

1. `prisma generate`
2. `prisma migrate deploy` (si `DATABASE_URL` / `DIRECT_URL` présentes)
3. `next build`

Pour lancer le **seed** automatiquement au premier déploiement, ajoutez :

```
RUN_DB_SEED=true
```

(puis retirez-la après le premier déploiement réussi)

### Vérifier que l'app fonctionne

Après déploiement, testez :

```
https://votre-app.vercel.app/api/health
```

Réponse attendue : `{"app":"ok","database":"ok",...}`

Page de connexion : `https://votre-app.vercel.app/connexion`

### Erreur 404 sur Vercel

Si vous voyez `404 NOT_FOUND` :

1. **Vercel → Deployments** : vérifiez que le dernier déploiement de `main` est **Ready** (vert)
2. Cliquez sur **⋯ → Promote to Production** si besoin
3. **Settings → Git** : branche de production = `main`
4. **Settings → Domains** : le domaine `*.vercel.app` doit pointer vers la prod
5. Vérifiez les logs de build : échec de migration = redeploy après avoir configuré `DIRECT_URL`

Le seed et les migrations **ne s'exécutent pas au runtime** — uniquement pendant le build Vercel (ou manuellement en local).

## Documentation

- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Cas d'usage](docs/use-cases/USE_CASES.md)
- [Base de données](docs/database/DATABASE.md)
- [Récap tests](docs/tests/RECAP_TESTS.md)

## Règles Cursor

- `.cursor/rules/testing.mdc` — tests unitaires 80 %, Playwright, récap
- `.cursor/rules/documentation.mdc` — docs use cases, architecture, BDD
