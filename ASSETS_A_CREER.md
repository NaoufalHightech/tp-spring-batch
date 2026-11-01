# Schémas à créer

> Généré avec `PPT_PLAN.md` par `pptx/plan_tools/gen_plan.py`.

**Stratégie (décision validée) : tout en formes natives PowerPoint**, comme le PPT d'origine. Pas d'image, pas de Manim. Chaque schéma est dessiné par `pptx/generate_pptx.py` avec `python-pptx` : rectangles arrondis, ovales, connecteurs fléchés, tableaux, texte. Palette : celle du PPT d'origine (`1D3B2A`, `10211A`, `EEF5EF`, `2E7D4F`, `6DB33F`, `E9A23B`, `D4503F`, `3F7CAC`, `8A63D2`).

Outils déjà écrits dans le script : `add_box`, `add_arrow`, `add_line`, `add_schema`, `add_entity` (entité d'un schéma entité-relation), `add_sequence` (diagramme de séquence), `add_cards`, `add_table`, `add_callouts`.

## 1. Schémas S01 à S38

S02 et S33 sont **retirés** (décision validée). Reste **36 schémas**, dont **3 réalisés** (Module 1) : **33 à créer**.

| Id | Module | Schéma | État | Description visuelle (formes, couleurs, disposition) | Diapositive(s) du plan |
|---|---|---|---|---|---|
| S01 | 1 | ERD des 6 tables BATCH_* avec les colonnes `version` | **réalisé** (Module 1, diapo n°26) | six entités (bandeau coloré + corps clair) sur 2 rangées de 3 ; flèches 1 → * ; colonnes `version` en rouge | n°26 |
| S03 | 1 | Séquence du verrouillage optimiste (serveurs A et B) | **réalisé** (Module 1, diapo n°28) | diagramme de séquence : 3 participants (bleu, vert, violet), lignes de vie en pointillés, messages fléchés ; retour vert (1 ligne) et rouge (0 ligne) | n°28 |
| S04 | 1 | La nuit interrompue : crash à 3 h 12 et reprise | **réalisé** (Module 1, diapo n°12) | 4 boîtes en ligne reliées par des flèches : 2 h 00 (vert), crash 3 h 12 (rouge), orphelin (orange), reprise (vert) | n°12 |
| S05 | 2 | Tasklet contre chunk | à faire (Module 2) | deux cartes côte à côte : à gauche une boîte verte « une action » ; à droite une boucle de 3 boîtes bleues lire → traiter → écrire avec flèche de retour | n°37 |
| S06 | 2/4 | Singleton contre proxy `@StepScope` (mémoire JVM) | à faire (Modules 2 et 4) | gauche : une grande boîte rouge « singleton » à compteur ; droite : une boîte `forest` « proxy » (permanente) reliée par des flèches pointillées à 3 boîtes bleue / verte / lime (instances éphémères) | n°47, n°106 |
| S07 | 2 | Double comptage de `CountingTasklet` (100 puis « 200 ») | à faire (Module 2) | 3 boîtes bleues « lancement 1, 2, 3 » en ligne ; au-dessus, compteur : 100 → « 200 » en rouge | n°48 |
| S08 | 3 | Frise des transactions : commit = lignes + position | à faire (Module 3) | 3 rectangles verts (chunks) côte à côte ; sous chacun, un petit rectangle lime « position » ; le chunk 3 en rouge avec ovale « crash » | n°69 |
| S09 | 3 | Cycle de vie d'`ItemStream` | à faire (Module 3) | 5 boîtes en ligne : open → read ×N → update → commit → close ; boucle de retour autour des 3 centrales ; vert et orange | n°68 |
| S10 | 3 | Curseur contre pagination, `fetchSize` et streaming PostgreSQL | à faire (Module 3) | deux panneaux : curseur (base bleue → 3 petits paquets lime `fetchSize` → JVM verte) et pagination (3 requêtes séparées) ; en bas, 4 ovales verts / rouges pour les conditions PostgreSQL | n°73, n°74 |
| S11 | 3B | Carte mentale des readers | à faire (Module 3B) | ovale central vert « Readers » + 6 ovales satellites reliés par des traits (fichier, base, Spring Data, service, personnalisé, disparus en `forest`) | n°82 |
| S12 | 3B | Rupture de contrôle (ACC / OP / `peek`) | à faire (Module 3B) | colonne de 5 rectangles ACC / OP / OP / ACC / OP (bleu et vert) → flèche → deux cartes « Account » regroupées ; flèche orange `peek` | n°85 |
| S13 | 3B | Restart de `MultiResourceItemReader` | à faire (Module 3B) | deux lignes de temps : lancement 1 (fichiers 1 à 3, verts) puis restart (fichier 4 ajouté en rouge) ; en dessous, version « répertoire par exécution » en vert | n°93 |
| S14 | 4 | Les trois flèches du processor | à faire (Module 4) | boîte orange « processor » au centre ; trois flèches sortantes : vers le chunk (vert), vers la corbeille `null` (`forest`), vers le rollback (rouge) avec compteurs | n°97 |
| S15 | 4 | Le bug du double comptage | à faire (Module 4) : priorité 1 | trois boîtes bleues (lancements) alimentant une boîte rouge « singleton » à compteur 135,50 → 271,00 → 406,50 ; à droite, `@StepScope` : trois instances vertes à 135,50 | n°103 |
| S16 | 4 | Rejeu du chunk : total du processor faux, `SUM` SQL juste | à faire (Module 4) | rangée de petits carrés (chunk), l'élément 37 rouge ; flèche de rollback puis rejeu vert ; deux totaux : « processor » rouge (faux) et « SUM SQL » vert (juste) | n°110 |
| S17 | 4 | Les trois solutions comparées | à faire (Module 4) | tableau à 3 colonnes colorées (vert, bleu, rouge pour le reset manuel) avec 4 critères et ovales verts / rouges | n°109 |
| S18 | 5 | `BatchStatus` et `ExitStatus` en deux voies | à faire (Module 5) | deux rails horizontaux : `BatchStatus` (bleu : STARTED → COMPLETED) et `ExitStatus` (orange : COMPLETED_WITH_REJECTS) reliés par une flèche | n°120 |
| S19 | 5 | Machine à états du job | à faire (Module 5) : priorité | étapes (boîtes bleues), décision (ovale orange), fins (vert, rouge) ; flèches étiquetées par motif ; chemin rouge pointillé « Next state not found » | n°128 |
| S20 | 5 | `Split` : threads et barrière | à faire (Module 5) | un step → deux branches (flux 1 bleu, flux 2 vert) sur deux lignes → barrière rouge verticale → step final | n°131 |
| S21 | 5 | Jauge du pool de connexions | à faire (Module 5) | rectangle « pool de connexions » divisé en 5 cases ; 2 flux × 3 connexions + repository : cases orange et rouges, pool saturé | n°132 |
| S22 | 6 | Skip, retry, restart : tableau et arbre de décision | à faire (Module 6) | arbre de décision : ovale « d'où vient l'erreur ? » → 3 branches → boîtes skip (orange), retry (bleue), restart (verte) | n°137 |
| S23 | 6 | Chronologie crash puis restart | à faire (Module 6) : priorité | 34 chunks verts (condensés) puis un chunk 35 rouge (crash à 3 450) ; flèche verte de reprise à la 3 401e ligne | n°147 |
| S24 | 6 | Rollback et rejeu avec pause exponentielle | à faire (Module 6) | rangée de 100 carrés, le 37e rouge ; rollback ; ovale orange « pause 200 / 400 / 800 ms » ; rejeu vert | n°145 |
| S25 | 6 | Arrêt gracieux contre `kill -9` | à faire (Module 6) | deux frises : haut vert (SIGTERM → hook → chunk fini → STOPPED), bas rouge (kill -9 → STARTED orphelin) | n°150 |
| S26 | 7 | Arbre de choix des approches de mise à l'échelle | à faire (Module 7) | ovale « goulot ? » → trois boîtes : I/O (partitionnement, vert), traitement (remote chunking, bleu), attente (multithread, orange) | n°159 |
| S27 | 7 | Deux situations du multi-instance | à faire (Module 7) | deux colonnes : éviter les doublons (2 serveurs → un vert, un rouge) ; se partager le travail (2 serveurs → 2 moitiés) | n°160 |
| S28 | 7 | Deux instances et `SKIP LOCKED` | à faire (Module 7) : priorité | colonne de 8 cases : bleues (réservées par A), vertes (par B), grises (verrouillées, sautées) ; deux flèches A et B | n°175 |
| S29 | 7 | Plages de partitionnement sans chevauchement | à faire (Module 7) | barre 1 à 10 000 en 4 couleurs sans chevauchement ; dessous, cas fautif avec zone de recouvrement rouge | n°171 |
| S30 | 7 | Livraison en double et `OptimisticLockingFailureException` | à faire (Module 7) | un message → deux workers → même StepExecution ; la 2e écriture en rouge (exception) | n°177 |
| S31 | 7 | Quel reader est thread-safe ? | à faire (Module 7) | tableau de 5 lignes de readers avec ovales verts / rouges (thread-safe ou non) | n°163 |
| S32 | 7 | Débit contre nombre de threads | à faire (Module 7) | axes en traits ; courbe en 6 segments qui plafonne ; plateau en rouge | n°178 |
| S34 | 8 | Les trois piliers | à faire (Module 8) | trois cartes (tests vert, monitoring bleu, déploiement orange) avec 2 ou 3 boîtes chacune | n°183 |
| S35 | 8 | Récapitulatif : les 8 modules et leur piège phare | à faire (Module 8) | grille 2 × 4 de cartes numérotées, une par module, avec le piège phare | n°205 |
| S36 | 8 | Machine à états Kubernetes d'un batch | à faire (Module 8) : priorité | CronJob → Job → Pod ; sorties code 0 / ≠ 0 ; `restartPolicy` (OnFailure, Never), compteur `backoffLimit`, `activeDeadlineSeconds` en rouge | n°199 |
| S37 | 8 | Événements JFR sur le déroulé d'un chunk et d'un partitionnement | à faire (Module 8) | rangée chunk (read, process, write, transaction) en boîtes lime et orange ; 11 ovales d'événements placés au-dessus ; split / aggregate pour les partitions | n°192 |
| S38 | 8 | Pull contre push des métriques | à faire (Module 8) | ligne de temps 0 à 60 s ; bloc vert « job 20 s » ; deux traits rouges de scrape à 30 s qui le ratent ; flèche verte de push à la fin | n°191 |

## 2. Schémas officiels à insérer (titres vérifiés)

Ce sont des **images** de la documentation officielle : leur insertion reste **manuelle**. Le script place une légende « Schéma officiel à insérer » sur les diapositives concernées.

| Titre officiel | Page | Où l'insérer |
|---|---|---|
| « Spring Batch Layered Architecture » | Spring Batch Architecture | Module 1, « Architecture en trois couches » |
| « Partitioned Process » | Spring Batch Architecture | Module 7, « Partitions : le même step… » |
| « Job Hierarchy With Steps » | The Domain Language of Batch | Module 1, « Job, JobInstance, JobExecution » |
| « Job Parameters » | The Domain Language of Batch | Module 1, « JobInstance = Job + paramètres identifiants » |
| « Batch Stereotypes » | The Domain Language of Batch | Module 4 (rôle du processor) — à rapprocher de S14 |
| « Job Hierarchy » | The Domain Language of Batch | Module 1 (variante sans les steps) |

## 3. Schémas du PPT d'origine

Le PPT d'origine **ne contient aucune image** (0 balise `p:pic`, dossier média vide) : tous ses schémas sont déjà des formes natives (voir `pptx/assets/EXTRACTION.md`). Ils sont **redessinés** avec les mêmes outils, au fil des modules.

| Diapositive d'origine | Schéma | Traitement |
|---|---|---|
| n°4, 9, 12, 13, 14 | lire-traiter-écrire, cinq stratégies, trois couches, schéma de référence, hiérarchie du job | **redessinés** (Module 1) |
| n°27, 28, 29, 38, 39, 40, 41, 58 | tasklet/chunk, chunk, algorithme, flux, decider, split, partitions, double comptage | **à redessiner** dans les modules concernés (M2, M3, M5, M7, M4) |
