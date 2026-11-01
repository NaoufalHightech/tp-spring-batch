# Schémas à créer

> Généré avec `PPT_PLAN.md` par `pptx/plan_tools/gen_plan.py`.

**Stratégie (décision validée) : tout en formes natives PowerPoint**, comme le PPT d'origine. Pas d'image, pas de Manim. Chaque schéma est dessiné par `pptx/generate_pptx.py` avec `python-pptx` : rectangles arrondis, ovales, connecteurs fléchés, tableaux, texte. Palette : celle du PPT d'origine (`1D3B2A`, `10211A`, `EEF5EF`, `2E7D4F`, `6DB33F`, `E9A23B`, `D4503F`, `3F7CAC`, `8A63D2`).

Outils déjà écrits dans le script : `add_box`, `add_arrow`, `add_line`, `add_schema`, `add_entity` (entité d'un schéma entité-relation), `add_sequence` (diagramme de séquence), `add_cards`, `add_table`, `add_callouts`.

## État de validation

| Point | État |
|---|---|
| Script compilé | oui |
| Script exécuté (`python pptx/generate_pptx.py 1`) | **oui**, 31 diapositives, rendu PDF par LibreOffice (Caladea / Liberation Mono, métriques de Cambria / Courier New) |
| Polices | Cambria (titres et texte), Courier New (code) : alignées sur l'original ; tous les caractères non ASCII du code (é, É, è, À, ·, …) existent en Courier New |
| Débordements constatés | **3 défauts réels, corrigés** (2ᵉ rendu) : diapos n°24 (appels 2 et 3 se touchent), n°26 (étiquette « 1 » sous la pointe de flèche), n°27 (mots longs coupés en boîte). Hauteurs de contenu réparties sur 17 diapositives. Audit : `pptx/build/review_m1/` |
| Titres officiels confirmés | **6 / 39** (6 schémas officiels vérifiés sur 39 références : 6 officiels + 33 schémas personnalisés) |
| Titres à confirmer | **33 / 39** : les 33 schémas personnalisés S05 à S38, dont les titres sont **figés** (décision validée). Les 4 titres officiels *Chunk-oriented Processing*, *Controlling Step Flow*, *Scaling and Parallel Processing*, *Meta-Data Schema* sont **reportés** en fin de projet (titres provisoires conservés). |
| Descriptions des 33 schémas | **rédigées** (§1 bis) |
| Module 2 | non démarré (attend la validation visuelle du Module 1) |

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

## 1 bis. Descriptions détaillées des 33 schémas à créer

Titres **figés** (décision validée). Zone de dessin : x de 0,6 à 12,73 po, y de 1,55 à 6,3 po (le titre est au-dessus, le pied de page à 7,1 po). Tailles de texte : 1re ligne d'une boîte 15 à 17 pt, lignes secondaires 11 à 13 pt, noms longs 10 pt. Couleurs de sens fixe, comme dans le Module 1 : **vert** = nominal / réussi, **rouge** = erreur / crash / piège, **orange** = attention / décision / état intermédiaire, **bleu** = source, entrée, lecture, **violet** = écriture ou parallélisme, **`forest`** = rebut, structure, proxy. Les outils sont ceux du script : `add_box`, `add_arrow`, `add_line`, `add_schema`, `add_table`, `add_cards`, `add_entity`, `add_sequence`.

### Module 2

**S05 · Tasklet contre chunk** (n°37). Deux cartes côte à côte (`add_cards`, 2 colonnes, hauteur 3,2 po). Gauche, verte « Tasklet » : une boîte verte « une action » (2,8 × 1,2 po) avec le texte « une transaction, tout ou rien ». Droite, bleue « Chunk » : trois boîtes bleues en ligne « lire », « traiter », « écrire », une flèche de retour courbe (trois segments `add_line` pointillés) de « écrire » vers « lire » étiquetée « × N, 1 transaction par lot ». Légende en bas : « tâche unique ou traitement de masse ? ».

**S06 · Singleton contre proxy `@StepScope`** (n°47, n°106). Deux panneaux séparés par une ligne verticale en `forest`. Gauche « Singleton » : une grande boîte rouge (4,6 × 2,4 po) « un seul objet, un compteur » avec trois flèches entrantes de boîtes bleues « lancement 1, 2, 3 ». Droite « Proxy `@StepScope` » : une boîte `forest` « proxy (permanent) » en haut, trois flèches **pointillées** vers trois boîtes en dessous, bleue, verte, lime « instance du lancement 1, 2, 3 » (éphémères). Légende : « un objet pour tous » contre « un objet par lancement ».

**S07 · Double comptage de `CountingTasklet`** (n°48). Trois boîtes bleues « lancement 1 », « lancement 2 », « lancement 3 » en ligne (y = 4,6). Au-dessus d'elles, une boîte rouge large « singleton : total » reliée aux trois par des flèches. Une rangée de trois valeurs en gras au-dessus : « 100 » (vert), « 200 » (rouge), « 300 » (rouge) avec la mention « attendu : 100 à chaque fois ».

### Module 3

**S08 · Frise des transactions : commit = lignes + position** (n°69). Trois rectangles verts (chunk 1, 2, 3) de 3,6 × 1,2 po, joints par des flèches. Sous chacun, un petit rectangle lime « position 100 », « position 200 » et, pour le 3ᵉ, un rectangle rouge « pas de commit ». Sur le chunk 3, un ovale rouge « crash » (1,3 × 0,6 po). Flèche verte de reprise à droite : « reprise après la position 200 ».

**S09 · Cycle de vie d'`ItemStream`** (n°68). Cinq boîtes en ligne : `open` (vert), `read` ×N (bleu), `update` (orange), `commit` (vert), `close` (vert). Une flèche de retour (trois segments) englobe `read`, `update` et `commit` avec l'étiquette « à chaque chunk ». Sous `update`, une boîte `forest` « `ExecutionContext` » reliée par une flèche pointillée ; sous `open`, une flèche « relit la position ».

**S10 · Curseur contre pagination, `fetchSize` et streaming PostgreSQL** (n°73, n°74). Deux panneaux de 5,9 po. Gauche « Curseur » : cylindre bleu « base » → trois petits paquets lime « fetchSize = 100 » → boîte verte « JVM, un élément à la fois ». Droite « Pagination » : trois flèches séparées « requête page 1, 2, 3 » vers la même base. Bande du bas : quatre ovales « autocommit désactivé », « fetchSize > 0 », « résultat en avant seul », « une seule requête » (verts, un rouge si absent).

### Module 3B

**S11 · Carte mentale des readers** (n°82). Ovale central vert « Readers » (2,4 × 1,2 po) au milieu ; six ovales satellites reliés par `add_line` : « fichier » (bleu), « base » (bleu), « Spring Data » (violet), « service » (orange), « personnalisé » (orange), « disparus en 6 » (`forest`). Les satellites sont répartis à 60° (haut, bas, côtés).

**S12 · Rupture de contrôle (ACC / OP / `peek`)** (n°85). À gauche, une colonne de cinq rectangles de 2,2 × 0,6 po : ACC, OP, OP, ACC, OP (ACC en bleu, OP en vert). Flèche large au centre « regroupement ». À droite, deux cartes « Account 1 » et « Account 2 » contenant les OP. Une flèche orange « `peek` » pointe le premier élément de la colonne suivante.

**S13 · Restart de `MultiResourceItemReader`** (n°93). Deux lignes de temps horizontales. Ligne 1 « lancement 1 » : trois boîtes vertes « fichier 1, 2, 3 ». Ligne 2 « restart » : les mêmes trois boîtes grisées plus une boîte rouge « fichier 4 (ajouté) » avec ovale « décalage ». Bas : version « un répertoire par exécution » en vert.

### Module 4

**S14 · Les trois flèches du processor** (n°97). Boîte orange « processor » au centre (2,6 × 1,4 po). Trois flèches partent vers la droite : vers une boîte verte « chunk (écrire) », vers une boîte `forest` « corbeille : `null` = filtré », vers une boîte rouge « rollback : exception ». Chaque flèche porte son compteur (`filterCount`, `writeCount`, `rollbackCount`).

**S15 · Le bug du double comptage** (n°103, priorité 1). Gauche : trois boîtes bleues « lancement 1, 2, 3 » alimentent une boîte rouge « singleton » dont le compteur passe de « 135,50 » à « 271,00 » puis « 406,50 » (trois états empilés). Droite « `@StepScope` » : trois instances vertes, chacune « 135,50 ». Ligne séparatrice verticale ; titres de panneaux en gras.

**S16 · Rejeu du chunk : total du processor faux, `SUM` SQL juste** (n°110). Rangée de huit petits carrés bleus (chunk), le 5ᵉ en rouge « 37 ». Flèche courbe de rollback puis seconde rangée verte (rejeu). En bas, deux cartes : « total du processor » (rouge, valeur fausse) et « `SUM` SQL » (verte, valeur juste).

**S17 · Les trois solutions comparées** (n°109). Tableau de 4 lignes de critères et 3 colonnes colorées (vert `@StepScope`, bleu `ExecutionContext`, rouge reset manuel), cellules avec ovales verts (✔) ou rouges (✘). Utilise `add_table` avec fond de cellule explicite.

### Module 5

**S18 · `BatchStatus` et `ExitStatus` en deux voies** (n°120). Deux rails horizontaux. Rail haut bleu « `BatchStatus` » : STARTED → COMPLETED. Rail bas orange « `ExitStatus` » : COMPLETED → COMPLETED_WITH_REJECTS. Flèche verticale pointillée entre les deux : « le code de sortie décide du flux ».

**S19 · Machine à états du job** (n°128, priorité). Boîtes bleues « step1 », « step2 », « step3 » ; ovale orange « decider » ; fins vertes « COMPLETED » et rouge « FAILED ». Flèches étiquetées par motif (`on("COMPLETED")`, `on("*")`). Chemin rouge pointillé étiqueté « Next state not found » vers une boîte rouge.

**S20 · `Split` : threads et barrière** (n°131). Une boîte « step départ » (verte) se sépare en deux branches : flux 1 (bleu, 3 boîtes) et flux 2 (vert, 2 boîtes) sur deux lignes. Barrière rouge verticale (0,15 × 3 po) étiquetée « attend les deux ». Boîte « step final » à droite.

**S21 · Jauge du pool de connexions** (n°132). Rectangle « pool de connexions » (10 × 1 po) divisé en cinq cases. Cases : flux 1 (bleu × 2), flux 2 (vert × 2), repository (orange). Un ovale rouge « saturé » ; sous les cases, un exemple chiffré « pool = 5 : 2 flux × 3 connexions + 1 repository = 7 > 5 ».

### Module 6

**S22 · Skip, retry, restart : arbre de décision** (n°137). Ovale orange « d'où vient l'erreur ? » en haut. Trois branches : « donnée invalide » → boîte orange « skip » ; « panne passagère » → boîte bleue « retry » ; « arrêt du job » → boîte verte « restart ». Sous chaque boîte, une ligne de rappel (`skipLimit`, `RetryPolicy`, `JobOperator.restart`).

**S23 · Chronologie crash puis restart** (n°147, priorité). Une frise de 34 petits carrés verts condensés (un seul rectangle vert hachuré « chunks 1 à 34 ») puis un carré rouge « chunk 35 : crash à 3 450 ». Flèche verte de reprise « reprend à la 3 401ᵉ ligne » partant du dernier commit.

**S24 · Rollback et rejeu avec pause exponentielle** (n°145). Rangée de dix carrés (représentant 100), le 4ᵉ rouge « 37 ». Flèche de rollback (retour) vers un ovale orange « pause 200 / 400 / 800 ms », puis rejeu en vert. Étiquette « une transaction par tentative ».

**S25 · Arrêt gracieux contre `kill -9`** (n°150). Deux frises. Haut vert : SIGTERM → hook → chunk fini → STOPPED. Bas rouge : `kill -9` → processus tué → STARTED orphelin → `abandon`. Les deux frises sont séparées par un trait `forest`.

### Module 7

**S26 · Arbre de choix des approches de mise à l'échelle** (n°159). Ovale orange « où est le goulot ? ». Trois boîtes : « I/O » → partitionnement (vert) ; « traitement » → remote chunking (bleu) ; « attente » → multithread (orange). Chaque boîte porte une phrase d'usage.

**S27 · Deux situations du multi-instance** (n°160). Deux colonnes. Gauche « éviter les doublons » : deux serveurs, l'un vert (exécute), l'un rouge (refusé). Droite « se partager le travail » : deux serveurs, chacun une moitié (bleue, verte).

**S28 · Deux instances et `SKIP LOCKED`** (n°175, priorité). Colonne de huit cases (0,9 × 0,45 po) : trois bleues (réservées par A), trois vertes (par B), deux grises (verrouillées, sautées). Deux flèches « A » (bleue) et « B » (verte). En-tête : `SELECT … FOR UPDATE SKIP LOCKED`.

**S29 · Plages de partitionnement sans chevauchement** (n°171). Barre horizontale 1 à 10 000 découpée en quatre couleurs. Dessous, cas fautif : deux plages avec zone de recouvrement rouge hachurée, légende « lignes traitées deux fois ».

**S30 · Livraison en double et `OptimisticLockingFailureException`** (n°177). Un message (boîte bleue) → deux workers (verts) → même StepExecution (boîte violette). La 2ᵉ flèche est rouge et pointillée, étiquetée `OptimisticLockingFailureException`.

**S31 · Quel reader est thread-safe ?** (n°163). Tableau de 5 lignes (readers) et 3 colonnes : reader, thread-safe, remède. Ovales verts (`JdbcPagingItemReader`) ou rouges (`FlatFileItemReader`, `JdbcCursorItemReader`).

**S32 · Débit contre nombre de threads** (n°178). Deux axes (`add_line`), courbe en six segments qui monte puis plafonne. Plateau coloré en rouge ; annotation « le pool de connexions limite ».

### Module 8

**S34 · Les trois piliers** (n°183). Trois cartes (tests vert, monitoring bleu, déploiement orange), chacune avec deux ou trois boîtes : tests (`JobOperatorTestUtils`, Testcontainers), monitoring (Micrometer, JFR), déploiement (Kubernetes, Data Flow).

**S35 · Récapitulatif : les 8 modules et leur piège phare** (n°205). Grille 2 × 4 de cartes numérotées 1 à 8 ; chaque carte : titre du module et piège phare en rouge. Les modules optionnels sont en pointillés.

**S36 · Machine à états Kubernetes d'un batch** (n°199, priorité). `CronJob` → `Job` → `Pod` ; sorties « code 0 » (vert) et « code ≠ 0 » (rouge). `restartPolicy` (OnFailure, Never), compteur `backoffLimit` et `activeDeadlineSeconds` en rouge. Légende : un `Job` sans `restartPolicy` est rejeté.

**S37 · Événements JFR sur le déroulé d'un chunk et d'un partitionnement** (n°192). Rangée « chunk » : read, process, write, transaction (boîtes lime et orange). Onze ovales d'événements au-dessus, reliés par des traits fins. Sous la rangée, un bloc « split / aggregate » pour les partitions.

**S38 · Pull contre push des métriques** (n°191). Ligne de temps de 0 à 60 s ; bloc vert « job de 20 s » ; deux traits rouges de scrape à 30 s et 60 s qui le ratent ; flèche verte de push à 20 s.


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
