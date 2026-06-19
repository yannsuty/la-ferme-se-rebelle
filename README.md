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

> Guide complet : **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

### Environnements

| Environnement | Branche Git | URL |
|---------------|-------------|-----|
| **Production** | `main` | https://la-ferme-se-rebelle.vercel.app |
| **Staging** | `staging` | https://la-ferme-se-rebelle-staging.vercel.app |
| **Dev** | `develop` | https://la-ferme-se-rebelle-dev.vercel.app |

Chaque environnement correspond à un **projet Vercel dédié**. La branche indiquée doit être configurée comme **Production Branch** dans les paramètres Git du projet.

Flux Git recommandé : branches de feature → `develop` → `staging` → `main`.

### Diagnostic en 10 secondes

```bash
# Remplacer BASE par l'URL de l'environnement testé
curl https://BASE/health.json          # statique, sans BDD
curl https://BASE/api/health           # teste aussi la BDD
```

Exemple production :

```bash
curl https://la-ferme-se-rebelle.vercel.app/health.json
curl https://la-ferme-se-rebelle.vercel.app/api/health
```

- **404** sur les deux → domaine Vercel non assigné (voir guide)
- **401** → protection Vercel active (Settings → Deployment Protection)
- **200** sur `/health.json` → l'app est déployée ✓

### Variables d'environnement obligatoires

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL poolée Neon (`-pooler`) |
| `DIRECT_URL` | URL directe Neon (migrations) |
| `AUTH_SECRET` | Secret JWT (32+ octets aléatoires) |
| `AUTH_URL` | URL publique de l'environnement (voir tableau ci-dessus) |

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

**Vérifications dans Vercel (par projet) :**

1. **Settings → General → Framework Preset** = `Next.js`
2. **Settings → Git → Production Branch** = branche de l'environnement (`main`, `staging` ou `develop`)
3. **Deployments** → dernier build de la branche **Ready** → **Promote to Production**
4. **Settings → Domains** : le domaine de l'environnement doit apparaître (voir tableau)
5. **Settings → Deployment Protection** : désactiver la protection sur **Production** (sinon 401)

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
