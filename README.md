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

### Erreur 404 sur Vercel (`NOT_FOUND`)

Si `/api/health` ou toute autre URL renvoie `404 NOT_FOUND` avec `x-vercel-error: NOT_FOUND`, **l'application n'est pas déployée sur ce domaine** (problème Vercel, pas de code).

**Vérifications dans Vercel :**

1. **Settings → General → Framework Preset** = `Next.js`
2. **Settings → Git → Production Branch** = `main`
3. **Deployments** → dernier build `main` **Ready** → **Promote to Production**
4. **Settings → Domains** : `la-ferme-se-rebelle.vercel.app` doit apparaître
5. **Settings → Deployment Protection** : désactiver la protection sur **Production** (sinon 401 sur les URLs de preview)

**Test après correction :**
```
https://la-ferme-se-rebelle.vercel.app/api/health
→ {"app":"ok","database":"ok"} ou {"database":"error"} (503)
```

Un `database: "error"` = app déployée mais BDD à configurer (pas une 404).

## Documentation

- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Cas d'usage](docs/use-cases/USE_CASES.md)
- [Base de données](docs/database/DATABASE.md)
- [Récap tests](docs/tests/RECAP_TESTS.md)

## Règles Cursor

- `.cursor/rules/testing.mdc` — tests unitaires 80 %, Playwright, récap
- `.cursor/rules/documentation.mdc` — docs use cases, architecture, BDD
