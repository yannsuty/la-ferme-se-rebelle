# Architecture — La Ferme se Rebelle

> Dernière mise à jour : 2025-06-18

## Vue d'ensemble

Application PWA de gestion d'une ferme laitière. Première version centrée sur les vaches laitières, extensible à d'autres élevages.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| PWA | `@ducanh2912/next-pwa`, manifest, icônes |
| Cartographie | Leaflet, react-leaflet, tuiles OpenStreetMap |
| API | Next.js Route Handlers (`/api/*`) |
| Auth | NextAuth.js v5, JWT, rôles OWNER / EMPLOYEE |
| ORM | Prisma 7 |
| Base de données | PostgreSQL (Neon) |
| Hébergement | Vercel |
| Tests | Vitest (unitaires), Playwright (e2e) |

## Structure des dossiers

```
src/
├── app/                    # Pages et routes API (App Router)
│   ├── admin/              # Administration (patron)
│   ├── api/                # REST : users, pastures, grazing
│   ├── carte/              # Carte pâtures + sorties traite
│   └── connexion/          # Page de login
├── components/             # UI réutilisable
├── lib/                    # Auth, Prisma, validations, geo
└── generated/prisma/       # Client Prisma généré
prisma/
├── schema.prisma           # Modèle de données
├── migrations/             # Migrations SQL
└── seed.ts                 # Données de démo
docs/                       # Documentation projet
e2e/                        # Tests Playwright
```

## Flux principaux

### Authentification

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant PWA as PWA Next.js
  participant Auth as NextAuth
  participant DB as PostgreSQL

  U->>PWA: Email + mot de passe
  PWA->>Auth: Credentials provider
  Auth->>DB: Vérifier user + bcrypt
  Auth-->>PWA: JWT (rôle inclus)
  PWA-->>U: Redirection tableau de bord
```

### Sortie après traite

```mermaid
flowchart TD
  A[Employé ou Patron] --> B[Page Carte]
  B --> C[Sélection parcelle sur carte]
  C --> D[Choix session Matin / Soir]
  D --> E[POST /api/grazing]
  E --> F[(grazing_assignments)]
  F --> B
```

## Déploiement

### Variables d'environnement (Vercel)

- `DATABASE_URL` — URL poolée Neon (`-pooler`) pour l'application
- `DIRECT_URL` — URL directe pour migrations Prisma CLI
- `AUTH_SECRET` — secret JWT (32+ octets aléatoires)
- `AUTH_URL` — URL publique de l'app

### Pipeline build

1. `prisma generate`
2. `prisma migrate deploy`
3. `next build`

## Sécurité

- Mots de passe hashés (bcrypt, 12 rounds)
- Middleware protège toutes les routes sauf `/connexion`
- Routes `/admin/*` réservées au rôle `OWNER`
- Validation Zod sur toutes les entrées API

## Évolutions prévues

- Éditeur de polygones sur carte (création parcelles)
- Multi-fermes / multi-espèces
- Mode hors-ligne avancé (sync IndexedDB)
- Notifications push pour rappels de traite
