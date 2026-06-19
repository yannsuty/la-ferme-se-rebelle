<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Rôles et permissions

- Matrice de droits : `docs/permissions/MATRICE_DROITS.md`
- Implémentation : `src/lib/permissions.ts`
- Règle Cursor : `.cursor/rules/permissions.mdc`

Rôles par ferme : `OWNER` (Patron), `MANAGER` (Gérant), `EMPLOYEE` (Employé). Rôle global : `isSystemAdmin`.
