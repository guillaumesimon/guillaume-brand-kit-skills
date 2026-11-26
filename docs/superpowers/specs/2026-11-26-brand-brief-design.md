# Skill `brand-brief` : conception

Date : 2026-11-26. Statut : à valider.

## Intention

Faire le premier travail d'un directeur artistique sur un projet d'identité : comprendre l'entreprise avant de parler d'esthétique. La skill interroge le fondateur ou les responsables de la marque et en tire un brief de marque. C'est la skill numéro 1 du process, avant `brand-audit` (regarder le marché) et `brand-kit` (dessiner la marque).

Elle répond à une question :

> Qu'est-ce que cette marque doit dire, à qui, et qu'est-ce qu'elle ne doit jamais devenir ?

Le constat de départ est celui du dépôt : presque personne ne sait décrire la marque qu'il veut, mais tout le monde sait dire ce qu'il aime et ce qu'il n'aime pas quand on le lui montre. La session alterne donc des questions courtes, le plus souvent fermées, et des planches où l'on juge du visuel.

## Objectifs

Couvrir les neuf sujets d'un brief de découverte :

1. le produit, sa proposition de valeur, sa raison d'être ;
2. les audiences cibles, avec une audience principale forcée ;
3. le positionnement et le cadre de comparaison ;
4. les ambitions (horizon, échelle, ce que la marque doit pouvoir porter dans trois ans) ;
5. les valeurs, sous forme de limites et de sacrifices réels ;
6. la personnalité ;
7. les émotions que la marque doit provoquer ;
8. les goûts, références et aversions du client ;
9. les contraintes et les contextes d'usage futurs du logo.

Deux lecteurs, une seule source : les agents (`BRIEF.md`, lu par `brand-audit` et `brand-kit`) et les personnes (`brief.html`, que le fondateur relit, corrige et fait circuler).

## Hors périmètre

- Auditer la concurrence : c'est `brand-audit`. Le brief note seulement ce que le fondateur cite spontanément.
- Dessiner quoi que ce soit : ni palette, ni typographie, ni logo. Le brief enregistre des goûts et des refus, pas des décisions de design.
- Valider auprès de clients. Tout vient du fondateur, et le brief le dit.

## Ce qui en ferait un échec

- Un brief en adjectifs : « moderne, simple, digne de confiance ». Vrai de tous les concurrents, n'instruit rien.
- Un questionnaire : douze questions ouvertes à la suite, des réponses d'une ligne.
- Des planches où l'on juge une différence qui n'existe que dans une légende.
- Des réponses de politesse prises pour des choix : aucun refus enregistré.
- Un champ inventé pour remplir une case. Un champ vide est une information.
- Une interface qui demande plus d'effort que le chat.

## Approches envisagées

**A. Tout dans le chat.** Planches affichées, images numérotées, réponses tapées (« 2, 5, 7 oui, 3 jamais »). Marche partout. Mais `AskUserQuestion` plafonne à quatre options, et taper des numéros en regardant une autre fenêtre casse le rythme. La réponse la plus utile, « j'aime mais pas pour nous », devient une phrase à rédiger.

**B. Une application d'entretien complète.** Tout l'entretien dans une page web, questions comprises. Fluide, mais l'agent ne peut plus refuser une réponse générique ni adapter la question suivante : on retombe sur un formulaire.

**C. Le chat pour parler, des planches cliquables pour regarder (retenue).** Les questions restent dans le chat, où l'agent relance et adapte. Chaque moment visuel est une planche où l'on clique. Les votes reviennent à l'agent sans que l'utilisateur ait rien à taper.

C est retenue (choix de Guillaume, sur ma recommandation) parce qu'elle garde l'adaptation de l'entretien et rend le jugement visuel aussi peu coûteux qu'un clic.

## Déroulé de la session

Environ 25 à 30 minutes. Sept temps, alternés. Jamais deux temps de parole de suite sans une planche entre les deux. Une question par tour.

| | Temps | Forme | Ce qu'on en tire |
|---|---|---|---|
| 0 | Préparer | aucun tour | lire le dépôt, le site, les documents fournis ; préremplir |
| 1 | Parler : le produit | 2 à 3 questions | produit, dernier client, ce qu'on utilise à la place, raison d'être |
| 2 | Regarder : battle de marques connues | planche de duels | personnalité, attitude |
| 3 | Parler : audience, cadre, ambition | 3 questions fermées | audience principale, comparaison choisie, horizon |
| 4 | Regarder : le mur | planche de 10 à 12 images | goûts, aversions, « j'aime mais pas pour nous » |
| 5 | Parler : limites et émotions | 2 à 3 questions | valeurs par l'exemple, émotion visée et émotion interdite |
| 6 | Regarder : logos | duels puis mur court | type de signe, appétit pour le risque |
| 7 | Parler : contraintes et usages | 2 questions fermées à choix multiples | contextes du logo, existant à garder, délais |
| 8 | Relire | 1 tour | synthèse en mots simples, annulation libre, un refus obligatoire |

Dès la fin du temps 1, l'agent lance les éclaireurs en arrière-plan : les planches des temps 2, 4 et 6 se préparent pendant que l'entretien continue. Les temps 4 et 6 sont recomposés à partir des votes précédents.

### Les règles de l'entretien

Reprises de `brand-kit/references/discovery.md`, qui reste la référence :

- Ne jamais demander l'abstraction. « Quelles sont vos valeurs ? » est interdit ; « raconte la dernière fois que tu as refusé de l'argent » est la question.
- Refuser la première réponse générique (liste noire : intégrité, innovation, premium, moderne, simple, tout le monde) et demander le moment où elle a coûté quelque chose.
- Garder le verbatim, mot pour mot.
- Chaque champ porte sa provenance : `stated` (dit), `chosen` (choisi sur une planche), `inferred` (déduit), `assumed` (supposé, à vérifier).

Et trois règles propres à cette skill :

- **Fermer les questions en proposant des hypothèses, pas des catégories.** L'agent écrit trois ou quatre réponses possibles à partir de ce qu'il a lu et entendu, propres à ce projet, et demande laquelle est la plus proche. L'option « autre » existe toujours. Une hypothèse fausse corrigée vaut mieux qu'une question ouverte.
- **Ancrer chaque option dans une marque que le fondateur connaît.** Pas « rassurant ou stimulant ? » mais « le client sort de chez vous comme d'un rendez-vous chez Doctolib, ou comme d'un magasin Decathlon ? ». Les ancres sont choisies pour le marché et la génération du fondateur ; `references/anchors.md` donne la méthode et des paires de départ.
- **Jamais nommer l'axe testé**, ni pendant ni après une planche.

## Les planches

Un seul gabarit, `assets/board.html`, deux formes :

**Duel.** Deux images côte à côte, une paire à la fois, plein écran. Trois boutons : celle de gauche, celle de droite, aucune des deux. Pour les battles de marques connues, un quatrième : je ne connais pas. Six à huit paires s'enchaînent sans retour au chat ; un compteur indique où l'on en est. Raccourcis clavier : flèches gauche et droite, espace pour aucune.

**Mur.** Dix à douze images en grille. Trois états par image, un clic pour passer de l'un à l'autre : pour nous ; j'aime, pas pour nous ; jamais. Une image non touchée compte comme sans avis. Un champ libre facultatif en bas : « un mot sur ce que tu as écarté ? ».

Sous chaque image, le nom de la marque en petit, rien d'autre. Aucune légende, aucun axe. Le gabarit est en noir et blanc, sans chrome.

### Comment les votes reviennent

`assets/board.mjs` fait trois choses :

- `node board.mjs serve <round.json>` : sert la planche en local, attend le clic sur « Terminé », écrit les votes dans le fichier de la manche, les affiche et s'arrête. Lancé en arrière-plan, sa fin réveille l'agent : l'utilisateur n'a rien à écrire dans le chat.
- `node board.mjs build <round.json>` : écrit la même planche en un seul fichier, images incluses, pour les contextes sans serveur local (session cloud, fichier envoyé, artefact). À la fin, la planche affiche un code court à copier dans le chat.
- `node board.mjs decode <round.json> "<code>"` : relit ce code et écrit les votes.

L'agent choisit la première voie qui marche : serveur local et volet navigateur, sinon fichier unique et code collé, sinon images numérotées et réponse dans le chat. Les trois écrivent le même format de votes.

### D'où viennent les images

Des éclaireurs, un sous-agent par planche. Chacun reçoit le cadrage, ce qui a déjà été dit et choisi, et la consigne de la planche. Il rend une liste d'éléments : marque, type (site, logo, emballage, campagne, écran d'application), source, adresse de l'image ou de la page, et ce que l'élément teste (jamais affiché).

Sources, dans l'ordre : le connecteur Mobbin s'il est là (sections de sites, écrans), les kits de presse et pages de marque, une capture de la page par Playwright. `assets/fetch.mjs` télécharge ou capture chaque élément dans `evidence/`. Un élément qui ne se charge pas est retiré, pas remplacé par une description.

**L'agent regarde chaque image avant qu'une planche parte.** Le prototype l'a montré : sur douze pages d'accueil capturées, deux étaient un écran anti-robot, une une page de maintenance, deux portaient un bandeau de cookies ou de région. Une image de ce genre fait juger autre chose que la marque. Elle est recapturée autrement (bandeau fermé, autre page, image de presse) ou retirée.

Règles de composition, reprises de `tournament.md` : des paires éloignées sur tout, même type d'objet des deux côtés, et sur le mur des mondes larges, pas dix variantes du même. La battle de marques connues utilise des marques hors de la catégorie du client, pour qu'il juge une attitude et non un concurrent.

## Ce que la skill écrit

```
brand/brief/
├── brief.json         la source unique : réponses, verbatim, provenance, manches et votes
├── BRIEF.md           pour les agents, généré depuis brief.json
├── brief.html         pour les personnes ; brief.single.html pour l'envoyer
└── evidence/          les images montrées, une sous-chemise par manche
```

`brief.json` contient : `meta`, `framing` (produit, raison d'être, à la place de quoi), `audiences` (une principale, les autres), `positioning` (cadre hérité, cadre voulu, différence, preuve ou son absence), `ambition`, `values` (chacune avec l'exemple qui la prouve), `personality` (traits opérables : plus X que Y, jamais Z), `emotions` (visée, interdite), `taste` (pour nous, attirant mais pas pour nous, jamais, et ce que l'agent en lit), `references` (marques citées, aimées, redoutées), `constraints`, `logo_contexts`, `verbatim`, `rounds` (éléments montrés et votes), `open_questions`, `limits`, et deux blocs de passage de relais, `for_brand_audit` et `for_brand_kit`.

`BRIEF.md` est en anglais, comme `AUDIT.md` et `BRAND.md` ; les citations restent dans la langue du fondateur. `brief.html` suit la langue de la conversation, parce que c'est le fondateur qui le relit et le valide (appel de ma part ; l'audit, lui, est en anglais par défaut).

`brief.html` montre : la synthèse en une page, chaque section avec ses citations et sa provenance, les trois murs de goût (pour nous, attirant mais pas pour nous, jamais) avec les vraies images, les usages du logo, ce qui reste ouvert, et ce que le brief n'est pas.

### Le contrôle

`assets/check.mjs` refuse un brief quand : une des neuf sections manque sans être déclarée vide avec sa raison ; il n'y a pas d'audience principale ; aucune valeur n'a d'exemple ; aucun refus n'est enregistré ; un mot de la liste noire figure dans un champ sans exemple à côté ; un champ `assumed` n'apparaît pas dans `open_questions` ; aucun contexte de logo n'est renseigné ; `BRIEF.md` diffère de ce que les données génèrent.

## Raccord avec les autres skills

- `brand-audit`, étape 1 : si `brand/brief/BRIEF.md` existe, le cadrage en vient et les questions ne sont pas reposées. Le bloc `for_brand_audit` donne les concurrents cités et les marques aspirationnelles nommées par le fondateur, à valider comme les autres.
- `brand-kit`, avant de commencer : lit `BRIEF.md` comme il lit `AUDIT.md`. Le cadrage n'est pas redemandé ; le tournoi part des goûts déjà relevés et ne dépense des duels que sur ce qui reste ouvert ; la liste « jamais » alimente les refus.
- Le `README.md` présente quatre skills, dans l'ordre du process.
- `brand-brief` ne lance aucune autre skill. Il dit que le brief est prêt et s'arrête.

## Fichiers de la skill

```
skills/brand-brief/
├── SKILL.md
├── references/
│   ├── interview.md     les sept temps, les questions, les relances, lire une réponse
│   ├── boards.md        composer un duel et un mur, consigne des éclaireurs, lire les votes
│   ├── anchors.md       ancrer une question dans des marques connues : méthode et paires
│   └── brief.md         le schéma de brief.json, les deux sorties, le contrôle
├── assets/
│   ├── board.html       le gabarit de planche
│   ├── board.mjs        serve, build, decode
│   ├── fetch.mjs        télécharge ou capture les images d'une manche
│   ├── render.mjs       brief.html et brief.single.html
│   ├── brief.template.html
│   ├── brief.mjs        BRIEF.md
│   ├── check.mjs        le contrôle
│   ├── lib/             schéma, navigateur
│   ├── brief.example.json, BRIEF.example.md   un exemple à la profondeur attendue
└── tests/               node --test
```

Node 22, aucune dépendance obligatoire. Playwright sert seulement à capturer une page quand il n'y a pas d'image directe.

## Laissé au constructeur

- Le format exact du code court des votes.
- Le détail visuel de la planche et du rapport, dans la ligne noir et blanc de `landscape.html`.
- Le nombre exact de paires et d'images par manche, dans les fourchettes données.
- Les paires de départ de `anchors.md`.
