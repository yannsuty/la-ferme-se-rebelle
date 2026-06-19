# Matrice de droits — La Ferme se Rebelle

> Dernière mise à jour : 2025-06-19

Référence unique des autorisations. Le code source de vérité est `src/lib/permissions.ts`.

## Rôles

| Rôle technique | Libellé UI | Périmètre |
|----------------|------------|-----------|
| *(flag `isSystemAdmin`)* | Administrateur système | Plateforme entière |
| `OWNER` | Patron | Par ferme (`farm_memberships`) |
| `MANAGER` | Gérant | Par ferme (`farm_memberships`) |
| `EMPLOYEE` | Employé | Par ferme (`farm_memberships`) |

Un utilisateur peut avoir des rôles différents sur plusieurs fermes.

## Matrice des permissions

| Action / ressource | Admin système | Patron | Gérant | Employé |
|--------------------|:-------------:|:------:|:------:|:-------:|
| Connexion sans adhésion ferme | ✓ | ✗ | ✗ | ✗ |
| Créer une ferme + compte gérant initial | ✓ | ✗ | ✗ | ✗ |
| Activer / désactiver une ferme | ✓ | ✗ | ✗ | ✗ |
| Réinitialiser la base (staging) | ✓ | ✗ | ✗ | ✗ |
| Tableau de bord, carte, tâches, applications | ✓* | ✓ | ✓ | ✓ |
| Consulter les parcelles (GET) | ✓* | ✓ | ✓ | ✓ |
| Gérer les parcelles (POST/PATCH/DELETE) | ✓* | ✓ | ✓ | ✗ |
| Gérer les membres (liste, création, modification) | ✓* | ✓ | ✓ | ✗ |
| Attribuer le rôle Patron | ✓* | ✓ | ✗ | ✗ |
| Attribuer le rôle Gérant | ✓* | ✓ | ✓ | ✗ |
| Attribuer le rôle Employé | ✓* | ✓ | ✓ | ✗ |
| Modifier / retirer un Patron | ✓* | ✓ | ✗ | ✗ |
| Modifier / retirer un Gérant ou Employé | ✓* | ✓ | ✓ | ✗ |
| Définir les sorties après traite | ✓* | ✓ | ✓ | ✓ |

\* L'administrateur système n'a pas de contournement automatique des routes ferme : il doit disposer d'une adhésion active à la ferme concernée.

## Création de ferme

Lors de la création d'une ferme par l'administrateur système (`POST /api/admin/farms`), un **compte gérant initial** est obligatoire :

- nom, email et mot de passe du futur gérant ;
- rôle attribué automatiquement : `MANAGER` ;
- si l'email existe déjà globalement, l'utilisateur existant est rattaché à la nouvelle ferme (le mot de passe fourni est ignoré).

## Implémentation

| Fichier | Rôle |
|---------|------|
| `src/lib/permissions.ts` | Fonctions `canAccessFarmAdmin`, `canManageUsers`, `canAssignRole`, etc. |
| `src/lib/auth.config.ts` | Middleware : accès `/f/{slug}/admin/*` |
| `src/lib/farm-auth.ts` | `requireFarmAuth(farmSlug, allowedRoles?)` sur les API |
| Pages et composants | Filtrage navigation (`app-nav`, mosaïque applications) |

## Documents liés

- [Cas d'usage](../use-cases/USE_CASES.md)
- [Architecture — sécurité](../architecture/ARCHITECTURE.md#sécurité)
- [Base de données — enum Role](../database/DATABASE.md#enums)
