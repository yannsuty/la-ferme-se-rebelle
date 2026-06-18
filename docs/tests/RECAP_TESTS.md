# Récapitulatif des tests — 2025-06-18

## Synthèse

| Type | Statut |
|------|--------|
| Tests unitaires (Vitest) | ✅ 15 tests passés |
| Couverture unitaire | ✅ 95 % statements / 90 % branches / 100 % fonctions |
| Tests fonctionnels (Playwright) | ⚙️ Nécessitent BDD Neon seedée |
| Seuil couverture | 80 % (configuré dans `vitest.config.ts`) |

## Tests unitaires

Suites principales :
- `src/lib/validations.test.ts` — schémas Zod
- `src/lib/geo.test.ts` — utilitaires carte
- `src/lib/password.test.ts` — hachage bcrypt
- `src/lib/auth.test.ts` — rôles

## Tests fonctionnels (Playwright)

Fichier `e2e/auth-and-map.spec.ts` :
- Connexion patron / employé
- Refus identifiants invalides
- Page gestion utilisateurs (patron)
- Carte et panneau sortie après traite

## Commandes

```bash
npm run test:coverage
npm run test:e2e
npm run test:report   # régénère ce fichier
```

## Notes

- Les tests e2e nécessitent une base Neon migrée et seedée.
- Voir `.cursor/rules/testing.mdc` pour le workflow complet.
