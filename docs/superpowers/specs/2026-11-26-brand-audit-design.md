# Skill `brand-audit` : conception

Date : 2026-11-26. Statut : à valider.

## Intention

Faire le travail d'audit qu'un directeur artistique mène au début d'un projet d'identité : regarder le marché avant de dessiner. La skill répond à une seule question, dont tout le reste découle :

> Quels codes faut-il garder pour être compris par ce marché, et lesquels peut-on rompre pour s'en distinguer ?

Elle comble un manque que `brand-kit` reconnaît dans son propre `SKILL.md` : il n'y a pas d'audit de catégorie, donc personne ne vérifie si la différence choisie est le papier peint du secteur.

## Objectifs

- Constituer un panel : concurrents directs, indirects (y compris le substitut non numérique), marques aspirationnelles hors secteur.
- Relever les codes du secteur sur preuves : typologies de logos, symboles, couleurs, typographies, imagerie, mise en page, ton des titres.
- Classer chaque code dominant : code de lisibilité, cliché, ou rupture risquée.
- Repérer les territoires saturés et les territoires ouverts, puis proposer des pistes de différenciation argumentées.
- Deux lecteurs servis par une seule source de données : les agents (skills suivantes) et une personne (Guillaume ou un client).
- Deux modes, flash et deep, qui écrivent les mêmes fichiers dans le même schéma, pour qu'un audit flash soit approfondi et non refait.

## Hors périmètre

- Dessiner la marque. L'audit propose des territoires, `brand-kit` décide.
- Audit stratégique : prix, parts de marché, SEO, positionnement produit. Seul le visuel et le verbal de surface sont audités.
- Veille continue. L'audit est une photographie datée.

## Ce qui en ferait un échec

- Un audit écrit de mémoire : "la santé, c'est bleu" sans une capture pour le prouver. Toute affirmation renvoie à une preuve dans `evidence/`.
- Un "territoire libre" déjà occupé par une marque absente du panel.
- Des opportunités qui valent pour n'importe quel secteur.
- Un document que personne ne rouvre parce qu'il ne dit pas quoi faire.

## Approches envisagées

**A. Agents de recherche.** Des sous-agents cherchent sur le web et rédigent une synthèse. Rapide à construire. Le résultat est une opinion invérifiable, et un modèle qui résume un secteur retombe sur les idées reçues du secteur, c'est-à-dire l'inverse de ce qu'on demande.

**B. Mesure pure.** Des scripts capturent et mesurent, des statistiques produisent le résultat, le modèle ne fait que commenter. Solide pour les couleurs et les typos. Aveugle à ce qui compte le plus dans un audit visuel (symboles, imagerie, impression d'ensemble) et fragile dès qu'un site bloque les robots.

**C. Le mur et la grille de codage (retenue).** C'est la méthode d'un DA, outillée. Des scripts collectent les preuves et les épinglent côte à côte. Des sous-agents regardent chaque marque et la codent sur une grille à vocabulaire fermé, ce qui rend les observations comptables. Les fréquences sont calculées, pas estimées. Le jugement n'intervient qu'à la fin, sur des chiffres et des planches, puis il est contesté par un sous-agent sceptique.

C est retenue parce qu'elle sépare trois choses que A confond : ce qui est mesuré, ce qui est observé, ce qui est jugé. Chaque ligne de l'audit porte l'une de ces trois étiquettes.

## Le pipeline

Six étapes. L'agent principal tient le rôle du DA et orchestre. Le travail mécanique est fait par des scripts, le regard par des sous-agents.

### 1. Cadrer

Entrées : ce que fait le produit en une phrase, pour qui, sur quel marché géographique, les concurrents déjà connus. Dans un dépôt, lire le projet d'abord. Le cadrage est écrit dans `audit.json`, pour que `brand-kit` le reprenne ensuite au lieu de reposer les mêmes questions. Si une marque existe déjà (refonte, ou `brand/tokens.json` présent), elle est capturée et codée comme les autres avec le rôle `self`, et placée sur la cartographie. Deux questions au plus, aucune en mode flash si le contexte suffit.

### 2. Constituer le panel

Sous-agents de recherche en parallèle, un par rôle :

- **Directs** : même offre, même public, même marché.
- **Indirects** : autre offre pour le même besoin, dont le substitut non numérique.
- **Leaders internationaux** de la catégorie, absents du marché local : ils montrent vers où la catégorie se déplace.
- **Aspirationnels hors secteur** : choisis sur un critère explicite et non au goût. Soit ils servent le même public ailleurs, soit ils ont résolu la même tension (par exemple inspirer confiance sans paraître institutionnel).

Chaque marque entre dans `panel.json` avec son rôle, la raison de sa présence, son URL et un niveau de confiance. En deep, le panel est montré à l'utilisateur pour une correction unique avant la capture. C'est le seul point d'arrêt.

Si les connecteurs Similarweb ou Ahrefs sont disponibles, ils servent à trouver les concurrents par audience. Sinon la recherche web suffit. Aucun n'est requis.

### 3. Capturer (script, Chromium)

Pour chaque marque, `capture.mjs` visite le site et enregistre :

- des captures : haut de page bureau, page entière, mobile ;
- des mesures tirées du rendu réel : couleurs pondérées par surface, couleur d'accent (portée par les éléments interactifs), familles et graisses de caractères, corps et interlettrage du titre principal, rayons des boutons, mode clair ou sombre, part d'image, de vidéo et d'illustration ;
- le logo : SVG ou image de l'en-tête, favicon, icône tactile.

Essai fait pendant la conception sur un site d'assurance santé : couleurs, typo propriétaire et corps du titre sont sortis correctement. Deux limites constatées, à traiter dans la skill : certains sites renvoient une page anti-robot (403), et la détection du logo par sélecteur se trompe parfois. D'où une chaîne de repli, dans l'ordre : capture Mobbin de la marque, kit presse ou image trouvée par recherche, fiche App Store. Une marque capturée par repli est marquée `capture: partial` et ses mesures sont exclues des statistiques de couleur et de typo.

En deep s'ajoutent deux pages intérieures par marque (produit, tarifs) et, si le produit est une application, l'icône et les captures de la fiche App Store.

### 4. Élargir avec les bibliothèques

Le panel dit ce que font les concurrents. Les bibliothèques disent ce que fait le secteur au sens large, et ce qui se fait de mieux.

- **Logosystem** : pages par industrie (`/logos/health-and-wellness`, `/logos/fintech`, etc.). Chaque logo y porte des étiquettes de type, de forme, de style et de couleur, plus un lien vers l'étude de cas de l'agence. C'est une grille de codage déjà remplie : on peut compter, sur l'échantillon d'une industrie, la part de wordmarks, de bleus, de cœurs.
- **Logoinspo** : classé par type et par couleur, pas par industrie. Sert de référence de typologies hors secteur, pour la partie aspirationnelle.
- **Mobbin** : par le serveur MCP déjà utilisé par `brand-kit`, sections et écrans de la catégorie, pour les conventions de page d'accueil au-delà du panel.

Deux précautions écrites dans la skill. Ces bibliothèques sont sélectionnées par des designers : elles montrent le haut du panier, pas le marché. L'audit les présente donc à part du panel et ne mélange pas leurs fréquences. Et l'usage reste celui d'une consultation de référence : volume faible, source citée, images gardées en interne. Le `robots.txt` de Logosystem autorise la référence et interdit l'entraînement.

### 5. Coder (sous-agents avec vision)

Chaque marque est codée sur une grille à vocabulaire fermé, livrée avec la skill (`references/codebook.md`) :

| Dimension | Exemples de valeurs |
|---|---|
| Type de logo | wordmark, monogramme ou lettermark, pictorial mark, abstract mark, combination mark, emblème, mascotte |
| Nature du symbole (combination mark seulement) | lettermark, pictorial, abstract, mascotte |
| Sujet du symbole | cœur, croix, feuille, forme géométrique, lettre, aucun |
| Casse et dessin du nom | bas de casse, capitales, géométrique, humaniste, serif |
| Couleur | famille de teinte dominante, saturation, nombre de teintes, fond clair ou sombre |
| Typographie | classe du titre, classe du texte, contraste de graisse |
| Imagerie | portrait souriant, interface produit, 3D, illustration plate, aucune |
| Mise en page | héros centré, scindé, dense, aéré |
| Promesse du titre | bénéfice, mécanisme, manifeste, preuve chiffrée |

Le type de logo suit les sept catégories usuelles, une seule valeur par marque, codée sur le logo principal (celui de l'en-tête du site). Comme la plupart des marques ont un symbole accompagné du nom, "combination mark" seul écraserait la statistique : un second champ précise donc la nature de son symbole. Si une marque emploie aussi son symbole seul (icône d'application, favicon), c'est noté à part dans `symbol_used_alone`.

Les valeurs mesurées à l'étape 3 pré-remplissent la grille. Le sous-agent regarde les captures, complète les champs d'observation et peut ajouter une valeur `autre: …` quand la grille ne suffit pas. Les `autre` récurrents sont le signal d'un code propre au secteur, à nommer.

Un sous-agent code quatre ou cinq marques. En deep, les champs de jugement sont codés deux fois par des sous-agents distincts et les désaccords sont tranchés par l'agent principal, capture à l'appui.

Un script assemble ensuite les planches : mur de logos, bandes de palettes triées par teinte, spécimens typographiques, mur de pages d'accueil. L'agent principal les regarde, parce qu'une convention ne se voit que côte à côte.

### 6. Synthétiser

**Fréquences (calculées par `aggregate.mjs`).** Par dimension : part de chaque valeur dans le panel direct. Au-dessus de 60 %, la valeur est une convention. Sous 15 %, elle est rare. Les seuils sont dans le fichier de données et se règlent.

**Classement des conventions (jugement, règle explicite).** Une convention à 60 % laisse jusqu'à 40 % de marques qui font autrement. La question n'est donc pas "quelqu'un la rompt-il" mais "qui". Au moment du panel, chaque marque directe ou leader reçoit un champ `established` (vrai ou faux) avec sa justification : ancienneté, taille, notoriété constatée par la recherche. Le test de l'exception se fait sur ces marques-là :

- Une marque `established` rompt la convention et reste identifiée comme du secteur : la convention est un **cliché**. On peut la rompre, la preuve existe.
- Aucune marque `established` ne la rompt et elle porte une information utile au public (lisibilité, confiance réglementaire, reconnaissance du type de produit) : c'est un **code de lisibilité**. À garder.
- Aucune marque `established` ne la rompt et elle ne porte rien : **rupture risquée**. C'est soit la meilleure opportunité, soit un piège. L'audit le dit et cherche ce qu'en ont fait les secteurs voisins.

Le classement est un jugement de l'agent principal, écrit avec la marque et la capture qui le justifient.

**Cartographie.** Deux axes tirés des données : les deux dimensions codées qui séparent le mieux les marques du panel, et non des axes fixés d'avance. Les amas sont les territoires saturés. Les zones vides sont des candidates, chacune vérifiée : vide parce qu'inexplorée, ou vide parce que ça ne marche pas.

**Opportunités.** Trois à cinq territoires de différenciation. Chacun s'écrit sous la même forme : les codes de lisibilité gardés, les clichés rompus, ce qui est importé de quelle marque aspirationnelle, les preuves, le risque. Classés.

**Contre-enquête (deep).** Un sous-agent sceptique reçoit chaque opportunité avec pour seule consigne de la faire tomber : chercher la marque qui l'occupe déjà et que le panel a manquée. Ce qui tombe est retiré, ce qui tient porte la mention de ce qui a été cherché. Deep ajoute aussi les refontes récentes du secteur, pour ne pas se différencier vers l'endroit où tout le monde arrive.

## Les deux modes

| | Flash | Deep |
|---|---|---|
| Durée visée | environ 5 minutes | 20 à 30 minutes |
| Panel | 10 marques : 8 directs et 2 aspirationnelles | 20 à 30 : directs, indirects, leaders, aspirationnelles |
| Questions | aucune si le contexte suffit | 2 au plus, plus la validation du panel |
| Capture | page d'accueil | accueil, 2 pages intérieures, App Store |
| Bibliothèques | Logosystem, une page industrie | Logosystem, Logoinspo, Mobbin |
| Codage | un passage | double codage des champs de jugement |
| Synthèse | fréquences, 2 hypothèses d'opportunité | cartographie, 3 à 5 opportunités, contre-enquête, tendances |
| Sous-agents | 2 ou 3 | une dizaine, en parallèle |
| Statut écrit | `mode: flash`, hypothèses | `mode: deep`, positions vérifiées |

Sur 8 marques un pourcentage ne veut rien dire. `audit.json` enregistre toujours le compte et la base (`5 sur 8`), et la part en plus. En flash les seuils s'appliquent en comptes (convention à partir de 5 sur 8, rare à 1 sur 8) et tout classement est écrit comme hypothèse. Le schéma est le même dans les deux modes.

Les durées sont des cibles à mesurer pendant les essais, pas des promesses. Reprise : un deep lancé sur un audit flash existant garde le panel et les preuves, et complète.

## Sorties

Tout est écrit dans `brand/audit/` :

```
brand/audit/
├── audit.json       source unique : panel, mesures, codes, fréquences, classement, opportunités, provenance
├── AUDIT.md         pour les agents : court, numéroté, vérifiable
├── landscape.html   pour les personnes : la planche d'audit, autonome
└── evidence/        captures, logos, planches, une fiche par marque
```

- **`AUDIT.md`** : codes à garder, clichés à éviter, territoires ouverts classés, concurrent de référence pour le swap test, paires de captures prêtes pour les duels. En anglais, comme `BRAND.md`, parce qu'il est lu par des agents.
- **`landscape.html`** : dans la langue de l'utilisateur. Il référence `evidence/` par liens relatifs : c'est le dossier `brand/audit/` qui se partage, pas le fichier seul. Les images sont réduites et converties en WebP (cible : moins de 15 Mo pour un audit deep). Mur de logos, palettes, typos, mur de pages d'accueil, cartographie, planche des clichés, opportunités, méthode et limites. Généré depuis `audit.json` par un script et un gabarit livrés avec la skill.
- **Provenance** : chaque constat est `measured`, `observed` ou `judged`, et pointe vers sa preuve. La page d'ouverture dit ce que l'audit ne couvre pas et sa date.

Les captures et logos de tiers restent un matériau de travail interne. `landscape.html` n'est pas déployé publiquement et la skill le dit.

## Lien avec `brand-kit`

Changements limités, dans `brand-kit` :

- Le test "le dossier `brand/` existe" devient "`brand/tokens.json` existe", sinon un audit préalable ferait croire qu'un kit est déjà là.
- Si `brand/audit/AUDIT.md` existe, `brand-kit` le lit au démarrage, dans ses deux modes. Il ne lance jamais l'audit lui-même. Quatre usages :
  - le cadrage de l'audit remplace les deux questions de l'acte 1 quand il y répond ;
  - le tournoi garde ses duels Mobbin, dont les paires doivent être éloignées, ce qu'un panel de concurrents n'est pas. L'audit ajoute un ou deux **duels de catégorie** : le site le plus typique du secteur face au plus déviant, tous deux désignés dans `AUDIT.md`. Ils mesurent une seule chose, si l'utilisateur veut être dans la catégorie ou à côté ;
  - le swap test utilise le concurrent de référence nommé ;
  - la liste "Not:" de `BRAND.md` part des clichés.
- La mention "pas d'audit de catégorie" de la page d'accueil du kit n'apparaît plus quand un audit deep existe.

`brand-audit` reste utilisable seule, sans `brand-kit`, par exemple avant une refonte.

## Outils et dépendances

- Requis : recherche web, un navigateur pilotable (Chromium et Playwright), la lecture d'images, des sous-agents si disponibles. Sans sous-agents, les mêmes étapes s'exécutent en série.
- Optionnels : Mobbin (MCP), Similarweb, Ahrefs. Leur absence dégrade, n'empêche pas.
- Aucune clé d'API requise. Un service comme Brandfetch a été écarté pour le premier jet : il demande une clé et ne couvre que le logo et la palette, que la capture donne déjà.

## Structure de la skill

```
skills/brand-audit/
├── SKILL.md
├── references/
│   ├── panel.md       constituer le panel, critères par rôle
│   ├── capture.md     capture, mesures, chaîne de repli
│   ├── codebook.md    la grille de codage
│   ├── synthesis.md   seuils, test de l'exception, cartographie, opportunités
│   └── sources.md     bibliothèques, ce qu'on y prend, précautions
└── assets/
    ├── capture.mjs
    ├── aggregate.mjs
    ├── sheets.mjs
    ├── landscape.html
    ├── audit.example.json
    └── AUDIT.example.md
```

Les prompts des sous-agents (recherche, codage, sceptique) sont dans les références correspondantes.

## Vérification

La skill est essayée de bout en bout sur un secteur réel, en flash puis en deep. Critères : toute affirmation de `AUDIT.md` a sa preuve, les fréquences sont recalculables depuis `audit.json`, `landscape.html` s'ouvre sans réseau, les durées sont relevées et reportées dans le tableau des modes.

## Laissé au constructeur

Le schéma détaillé de `audit.json`, les valeurs complètes de la grille, les heuristiques de détection du logo et de la couleur d'accent, le dessin de `landscape.html`, le texte des prompts.

## Choix faits sans demander

À vérifier à la lecture :

1. Sortie dans `brand/audit/`, avec la retouche correspondante de `brand-kit`.
2. `AUDIT.md` en anglais, planche dans la langue de l'utilisateur.
3. Seuils de 60 % et 15 %.
4. Un seul point d'arrêt en deep : la validation du panel.
5. Aucun service payant dans le premier jet.
6. `established` par marque comme base du test de l'exception.
7. Flash à 10 marques, seuils en comptes.
8. Duels de catégorie ajoutés au tournoi, sans remplacer les duels Mobbin.
9. `brand-kit` consomme l'audit et ne le lance pas.

## Questions ouvertes

1. `evidence/` est-il versionné dans le dépôt ? Proposition : oui, parce que les sessions cloud repartent d'un clone et que les duels en ont besoin, avec un avertissement si le dépôt est public.
2. Secteur d'essai. Proposition : l'assurance santé, déjà sondée pendant la conception.
