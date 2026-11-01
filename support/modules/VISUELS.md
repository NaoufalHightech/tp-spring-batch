# Visuels de la formation : méthode et inventaire

> Document de production (PPT et vidéo). Il consolide les sections « Références visuelles » de chaque module.

## 1. La méthode (à appliquer à tous les modules)

À la fin de **chaque grande section** (Concept, Sous le capot), une sous-section **« Références visuelles »** donne trois choses :

1. **Schéma officiel** de la documentation Spring Batch : page et titre du schéma. Étiquette `✔ vérifié` quand le titre figure dans l'extrait de
   documentation officielle fourni, `◻ à confirmer` quand seule la page est connue (le titre exact est à contrôler avant d'insérer l'image).
2. **Schéma ASCII à garder** pour le script vidéo (narration au fil du texte).
3. **Schéma personnalisé** à créer pour le PPT : surtout ce que la documentation ne montre pas (bugs, pièges, séquences PostgreSQL).

Règles :
- Ne jamais citer un nom de schéma officiel qu'on n'a pas vu ; marquer `◻ à confirmer`.
- Les schémas du livre de M. Minella ne sont **pas réutilisables tels quels** (droits de l'éditeur) : on s'en inspire et on **redessine**.
- Les schémas du PDF du formateur (`docs/spring_batch.pdf`) relèvent de son auteur : à utiliser avec son accord.

## 2. Schémas officiels déjà identifiés (✔ titres vérifiés)

| Titre du schéma | Page de documentation | Modules concernés |
|---|---|---|
| Spring Batch Layered Architecture | Spring Batch Architecture | 1 |
| Partitioned Process | Spring Batch Architecture | 7 (partitionnement) |
| Batch Stereotypes | The Domain Language of Batch | 1, 4 |
| Job Hierarchy | The Domain Language of Batch | 1 |
| Job Hierarchy With Steps | The Domain Language of Batch | 1, 2, 3 |
| Job Parameters | The Domain Language of Batch | 1, 2 |

À repérer sur place (titres à confirmer) : *Configuring a Step → Chunk-oriented Processing* (M2, M3), *Configuring a Job → Controlling Step Flow* (M5),
*Scaling and Parallel Processing* (M5, M7), schéma des métadonnées (annexe *Meta-Data Schema*) (M1).

> Le site `docs.spring.io` n'est pas accessible depuis l'environnement de rédaction : la relève des titres exacts reste à faire de ton côté.

## 3. Schémas personnalisés à créer, par priorité

| Prio | Schéma | Module | Section |
|---|---|---|---|
| ⭐ 1 | **Le bug du double comptage** : singleton unique, compteur 135,50 → 271,00 → 406,50 ; face à `@StepScope` (instances éphémères) | 4 | §3.2-3.3 |
| ⭐ 2 | **Singleton contre proxy**, mémoire JVM animée en 4 temps | 2 / 4 | §3.2 |
| ⭐ 3 | **Frise des transactions** : commit = lignes écrites + position sauvegardée ; crash avant le 3e commit | 3 | §3.2 |
| ⭐ 4 | **Machine à états du job** (états, transitions, « Next state not found » en rouge) | 5 | §3.1 |
| 5 | Diagramme de séquence du **verrouillage optimiste** (A et B, `WHERE version = ?`) | 1 | §3.3 |
| 6 | **Split** : threads (bleu/vert), barrière (rouge), saturation du pool de connexions | 5 | §3.5 |
| 7 | **Rejeu du chunk** : un élément traité deux fois, total du processor faux, `SUM` SQL juste | 4 | §3.6 |
| 8 | Cycle de vie `ItemStream` (`open` / `update` / `close`) | 3 | §3.1 |
| 9 | Curseur contre pagination, redessinés ; 4 conditions du streaming PostgreSQL | 3 | §3.5 |
| 10 | Rupture de contrôle (ACC / OP / `peek`) ; restart de `MultiResourceItemReader` | 3B | §3 |
| 11 | `BatchStatus` et `ExitStatus` en deux voies | 5 | §1.3 |
| 12 | ERD des 6 tables `BATCH_*` avec les colonnes `version` | 1 | §1 |
| 13 | Trois flèches du processor (transformer / filtrer / rejeter) avec les compteurs | 4 | §1 |
| 14 | Carte mentale des readers | 3B | §1 |

## 4. Anticipation pour les modules suivants

| Module | Officiel (à confirmer sur place) | À créer |
|---|---|---|
| 6 · Fiabilité | schémas de *Configuring a Step* sur skip/retry (à repérer) | le **mode « scan »** du chunk après un échec d'écriture ; chronologie **crash puis restart** (position lue dans `batch_step_execution_context`) ; arbre de décision skip / retry / abandon ; **graceful shutdown** (`stop` puis `STOPPED`, reprise) |
| 7 · Multi-instance | ✔ « Partitioned Process » ; pages *Scaling and Parallel Processing* (partitionnement, remote chunking) | `SKIP LOCKED` : deux instances et leurs lignes réservées ; partitionnement local contre distribué ; comparaison **remote chunking / remote partitioning** |
| 8 · Production | schémas Micrometer/observabilité de la doc (à repérer) | architecture **Kubernetes** (job fini, `CronJob`) ; chaîne scheduler → API → `JobOperator` asynchrone ; migration **5 → 6** (avant / après) |

## 5. Correspondance avec les diapositives du PPT du cours

Le PPT `pptx/Spring_Batch_cours_complet.pptx` (69 diapositives) contient déjà des schémas en blocs colorés et flèches. Convention d'écriture dans les modules :
`> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive « … » (n°…) du PPT du cours.`

| Module | Diapositives réutilisables (titre, n°) |
|---|---|
| 1 | « Architecture en trois couches » (12), « Le schéma de référence » (13), « Job, JobInstance, JobExecution » (14), « JobInstance = Job + paramètres identifiants » (15), « Step et StepExecution » (16), « ExecutionContext et JobRepository » (17) |
| 2 | « Premier job : la Tasklet » (22), « Configurer le Step et le Job » (23), « Lancer un job » (24), « Tasklet ou chunk ? » (27) |
| 3 | « Le chunk : lire un par un, écrire par blocs » (28), « L'algorithme du chunk et ses interfaces » (29), « Le reader CSV (FlatFileItemReader) » (31), « Base de données : reader et writer JDBC » (36) |
| 3B | « Lire et écrire : les formats » (32) |
| 4 | « Processors : transformer, filtrer, composer » (34), « Valider les données » (35), « Enchaîner deux processors : le composite » (57), « Le piège : relancer double les totaux » (58) |
| 5 | « Enchaîner les steps : séquence et conditions » (38), « Le decider : aiguiller selon un résultat » (39), « Flows en parallèle (split) » (40) |
| 6 | « Skip : ignorer certaines erreurs » (43), « Retry : retenter les erreurs transitoires » (44), « Restart : reprendre là où ça s'est arrêté » (45), « ExecutionContext et JobRepository » (17) |
| 7 | « Partitions : le même step, des plages différentes » (41) |

> Le PPT a été construit sur **Spring Batch 5.1 / Boot 3.2.4** : ses schémas sont réutilisables, mais **le code affiché doit être remplacé** par celui des modules
> (Spring Batch 6.0.6 : `chunk(n)` sans gestionnaire de transactions en argument, `retryPolicy(...)`, paquets `core.job.*` et `infrastructure.item.*`).
