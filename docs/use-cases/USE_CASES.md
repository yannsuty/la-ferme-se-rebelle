# Cas d'usage — La Ferme se Rebelle

> Dernière mise à jour : 2025-06-19

## UC-01 — Connexion à l'application

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant, Employé |
| Préconditions | Compte actif avec adhésion à au moins une ferme |
| Déclencheur | L'utilisateur ouvre l'application |
| Scénario principal | 1. L'utilisateur accède à `/connexion`. 2. Il saisit email et mot de passe. 3. Le système vérifie les identifiants. 4. L'utilisateur est redirigé vers le sélecteur de fermes ou le tableau de bord. |
| Scénario alternatif | Identifiants incorrects → message d'erreur, pas de session |
| Postconditions | Session JWT active avec rôles par ferme |
| Règles métier | Compte inactif = connexion refusée |

## UC-02 — Créer un compte membre (employé, gérant ou patron)

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant |
| Préconditions | Session active avec droit de gestion des membres |
| Déclencheur | L'acteur accède à « Utilisateurs » |
| Scénario principal | 1. L'acteur remplit nom, email, mot de passe, rôle. 2. Le système valide et crée le compte ou rattache un utilisateur existant. 3. Le nouveau membre apparaît dans la liste. |
| Scénario alternatif | Email déjà membre de la ferme → erreur 409 ; gérant tente de créer un patron → erreur 403 |
| Postconditions | Nouvel utilisateur ou nouvelle adhésion en base, `active = true` |
| Règles métier | Patron : tous les rôles ; Gérant : gérant et employé uniquement ; mot de passe ≥ 8 caractères |

## UC-03 — Désactiver un compte

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant |
| Préconditions | Session active, membre cible existant |
| Déclencheur | Clic « Retirer » sur un membre |
| Scénario principal | 1. L'acteur désactive un membre. 2. `active` passe à `false` sur l'adhésion. 3. L'utilisateur ne peut plus accéder à cette ferme. |
| Scénario alternatif | Tentative de retirer son propre accès → refusé ; gérant tente de retirer un patron → refusé |
| Postconditions | Adhésion inactive conservée en historique |
| Règles métier | Pas de suppression physique |

## UC-04 — Consulter la carte des pâtures

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant, Employé |
| Préconditions | Session active, parcelles enregistrées |
| Déclencheur | Accès à « Carte des pâtures » |
| Scénario principal | 1. La carte Leaflet affiche les polygones. 2. Les parcelles affectées du jour sont mises en évidence. 3. L'utilisateur peut cliquer une parcelle pour la sélectionner. |
| Postconditions | Parcelle sélectionnée en mémoire client |
| Règles métier | Tuiles OSM ; géométrie stockée en GeoJSON |

## UC-05 — Définir la sortie après traite du matin

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant, Employé |
| Préconditions | Parcelle sélectionnée, date du jour |
| Déclencheur | Clic « Enregistrer la sortie » avec session Matin |
| Scénario principal | 1. L'utilisateur choisit la date et « Traite du matin ». 2. Il sélectionne une parcelle. 3. Le système enregistre ou met à jour l'affectation unique (date + matin). 4. Confirmation affichée. |
| Scénario alternatif | Aucune parcelle sélectionnée → message d'avertissement |
| Postconditions | Une seule affectation par date + session |
| Règles métier | Contrainte unique `(date, session)` |

## UC-06 — Définir la sortie après traite du soir

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant, Employé |
| Préconditions | Idem UC-05 |
| Déclencheur | Session « Traite du soir » + enregistrement |
| Scénario principal | Même flux que UC-05 avec `session = EVENING` |
| Postconditions | Affectation soir distincte de celle du matin |
| Règles métier | Matin et soir sont indépendants le même jour |

## UC-07 — Consulter le tableau de bord

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant, Employé |
| Préconditions | Session active |
| Déclencheur | Connexion ou navigation accueil |
| Scénario principal | 1. Affichage du nombre de parcelles actives. 2. Nombre de sorties définies aujourd'hui. 3. Rôle de l'utilisateur. 4. Liens rapides vers carte et admin (patron/gérant). |
| Postconditions | Vue à jour des indicateurs du jour |

## UC-08 — Créer une ferme avec compte gérant

| Champ | Valeur |
|-------|--------|
| Acteur | Administrateur système |
| Préconditions | Session admin système active |
| Déclencheur | Accès à `/admin/fermes` et soumission du formulaire |
| Scénario principal | 1. L'admin saisit le nom de la ferme (slug optionnel). 2. Il saisit nom, email et mot de passe du gérant initial. 3. Le système crée la ferme et l'adhésion `MANAGER`. 4. La ferme apparaît avec 1 membre. |
| Scénario alternatif | Slug déjà utilisé → erreur 409 ; email existant → rattachement sans recréer l'utilisateur |
| Postconditions | Ferme active, gérant opérationnel |
| Règles métier | Compte gérant obligatoire à la création |

## UC-10 — Ajouter un membre à une ferme existante (admin système)

| Champ | Valeur |
|-------|--------|
| Acteur | Administrateur système |
| Préconditions | Ferme existante, session admin active |
| Déclencheur | Clic « Membres » sur une ferme dans `/admin/fermes` |
| Scénario principal | 1. L'admin ouvre le panneau membres. 2. Il saisit nom, email, mot de passe et rôle. 3. Le système crée ou rattache l'utilisateur. 4. Le membre apparaît dans la liste. |
| Scénario alternatif | Email déjà membre de la ferme → erreur 409 |
| Postconditions | Nouvelle adhésion active |
| Règles métier | Tous les rôles attribuables par l'admin système |

## UC-09 — Gérer les parcelles

| Champ | Valeur |
|-------|--------|
| Acteur | Patron, Gérant |
| Préconditions | Session avec droit `canManagePastures` |
| Déclencheur | Accès à « Gérer les parcelles » |
| Scénario principal | 1. L'acteur consulte la liste des parcelles. 2. Il peut créer ou modifier via l'API (éditeur carte à venir). |
| Scénario alternatif | Employé tente d'accéder → redirection ou 403 |
| Postconditions | Parcelles à jour pour la ferme |

Voir aussi : [Matrice de droits](../permissions/MATRICE_DROITS.md)
