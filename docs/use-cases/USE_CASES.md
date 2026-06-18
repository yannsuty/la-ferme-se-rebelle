# Cas d'usage — La Ferme se Rebelle

> Dernière mise à jour : 2025-06-18

## UC-01 — Connexion à l'application

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Employé |
| Préconditions | Compte actif créé par un patron |
| Déclencheur | L'utilisateur ouvre l'application |
| Scénario principal | 1. L'utilisateur accède à `/connexion`. 2. Il saisit email et mot de passe. 3. Le système vérifie les identifiants. 4. L'utilisateur est redirigé vers le tableau de bord. |
| Scénario alternatif | Identifiants incorrects → message d'erreur, pas de session |
| Postconditions | Session JWT active avec rôle |
| Règles métier | Compte inactif = connexion refusée |

## UC-02 — Créer un compte employé ou patron

| Champ | Valeur |
|-------|--------|
| Acteur | Patron |
| Préconditions | Session patron active |
| Déclencheur | Le patron accède à « Utilisateurs » |
| Scénario principal | 1. Le patron remplit nom, email, mot de passe, rôle. 2. Le système valide et crée le compte. 3. Le nouveau compte apparaît dans la liste. |
| Scénario alternatif | Email déjà utilisé → erreur 409 |
| Postconditions | Nouvel utilisateur en base, `active = true` |
| Règles métier | Seul un patron peut créer des comptes ; mot de passe ≥ 8 caractères |

## UC-03 — Désactiver un compte

| Champ | Valeur |
|-------|--------|
| Acteur | Patron |
| Préconditions | Session patron, compte cible existant |
| Déclencheur | Clic « Désactiver » sur un utilisateur |
| Scénario principal | 1. Le patron désactive un compte. 2. `active` passe à `false`. 3. L'utilisateur ne peut plus se connecter. |
| Scénario alternatif | Tentative de désactiver son propre compte → refusé |
| Postconditions | Compte inactif conservé en historique |
| Règles métier | Pas de suppression physique |

## UC-04 — Consulter la carte des pâtures

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Employé |
| Préconditions | Session active, parcelles enregistrées |
| Déclencheur | Accès à « Carte des pâtures » |
| Scénario principal | 1. La carte Leaflet affiche les polygones. 2. Les parcelles affectées du jour sont mises en évidence. 3. L'utilisateur peut cliquer une parcelle pour la sélectionner. |
| Postconditions | Parcelle sélectionnée en mémoire client |
| Règles métier | Tuiles OSM ; géométrie stockée en GeoJSON |

## UC-05 — Définir la sortie après traite du matin

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Employé |
| Préconditions | Parcelle sélectionnée, date du jour |
| Déclencheur | Clic « Enregistrer la sortie » avec session Matin |
| Scénario principal | 1. L'utilisateur choisit la date et « Traite du matin ». 2. Il sélectionne une parcelle. 3. Le système enregistre ou met à jour l'affectation unique (date + matin). 4. Confirmation affichée. |
| Scénario alternatif | Aucune parcelle sélectionnée → message d'avertissement |
| Postconditions | Une seule affectation par date + session |
| Règles métier | Contrainte unique `(date, session)` |

## UC-06 — Définir la sortie après traite du soir

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Employé |
| Préconditions | Idem UC-05 |
| Déclencheur | Session « Traite du soir » + enregistrement |
| Scénario principal | Même flux que UC-05 avec `session = EVENING` |
| Postconditions | Affectation soir distincte de celle du matin |
| Règles métier | Matin et soir sont indépendants le même jour |

## UC-07 — Consulter le tableau de bord

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Employé |
| Préconditions | Session active |
| Déclencheur | Connexion ou navigation accueil |
| Scénario principal | 1. Affichage du nombre de parcelles actives. 2. Nombre de sorties définies aujourd'hui. 3. Rôle de l'utilisateur. 4. Liens rapides vers carte et admin (patron). |
| Postconditions | Vue à jour des indicateurs du jour |
