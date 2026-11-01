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

