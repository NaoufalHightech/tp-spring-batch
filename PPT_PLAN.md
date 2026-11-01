# Plan du PPT final (Phase 1)

> **Statut :** plan à valider avant la Phase 2 (animations). Aucune diapositive n'est encore produite.
> **Sources :** `MODULE_1.md` à `MODULE_8.md` (+ `MODULE_3B_READERS.md`), `support/modules/VISUELS.md`, `REVUE_CROISEE.md` §7.3, `pptx/Spring_Batch_cours_complet.pptx` (69 diapositives, Spring Batch 5.1).
> **Remarque sur le format :** la consigne « Format proposé pour chaque module : » était coupée dans le message ; le format ci-dessous est donc **une proposition** (§1). Il se corrige sans refaire le plan.

## 0. Synthèse

| | |
|---|---|
| Diapositives du PPT d'origine | **69** : 15 à garder · 28 à mettre à jour · 24 à remplacer · 2 à supprimer |
| Diapositives du **nouveau PPT** | **214** (parcours Essentiel : **141**, parcours Complet : **214**) |
| Origine des diapositives du nouveau PPT | 15 reprises telles quelles · 28 reprises mises à jour · 14 nouvelles qui remplacent une ancienne · 147 converties depuis un module · 10 nouvelles (séparateurs, introduction) |
| Schémas personnalisés à créer | **38** (S01 à S38, voir §4) ; 6 schémas officiels à insérer (§5) |
| Diapositives sans équivalent dans l'original | tout ce qui concerne : verrouillage optimiste, `@EnableJdbcJobRepository`, `SKIP LOCKED`, remote chunking, Micrometer, JFR, Kubernetes |

## 1. Conventions

**Format proposé pour chaque module** (une table par module ; la colonne « Sous-vidéo » donne le découpage de production) :

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|

**Types** : `section` (séparateur de module, avec le badge de parcours) · `schéma` · `code` (construit ligne par ligne en Phase 2) · `tableau` · `texte` · `récapitulatif`. Le type `section` est ajouté aux cinq types demandés.

**Sources** :

| Notation | Signification |
|---|---|
| `PPT n°X` | diapositive d'origine **reprise telle quelle** |
| `PPT n°X (màj)` | diapositive d'origine **reprise et mise à jour** (code, noms, texte) |
| `remplace PPT n°X + Mx §y` | **nouvelle** diapositive, construite depuis le module, qui remplace la n°X |
| `Mx §y` | diapositive **convertie depuis un module** (sans équivalent dans l'original) |
| `Doc officielle « … »` | schéma officiel de la documentation Spring Batch à insérer (titre vérifié) |
| `nouveau Sxx` | schéma personnalisé à créer (§4) |

**Règles de construction du nouveau PPT**

1. **Un séparateur par module**, avec le badge **Essentiel** ou **Optionnel / Avancé** (modules 3B, 7, 8) et la durée visée.
2. **Un bloc de diapositives par sous-vidéo** : les sous-vidéos des modules (5 à 10 min) sont le découpage de production.
3. **Chaque module se termine** par le Top 10 en deux diapositives (5 pièges chacune) puis les exercices ; les modules 3 et 3B ont en plus la transition de lecture.
4. **Les notes de l'orateur** reprennent le texte du module (section correspondante) : le script vidéo n'est pas à réécrire.
5. **Le code** est issu des modules (Spring Batch 6.0.6) ; toute diapositive à code d'origine périmé est dans l'inventaire (§2). Les sections marquées **(Théorique)** dans les modules portent un badge « non exécuté ».
6. **Pied de page** : « Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16 · Java 25 ».
7. **Une diapositive = une idée.** Un tableau de plus de 6 lignes est coupé (les Top 10 le sont déjà).

## 2. Inventaire du PPT d'origine (69 diapositives)

`garder` : reprise telle quelle · `mettre à jour` : reprise avec modification · `remplacer` : refaite depuis un module · `supprimer` : absente du nouveau PPT.

| N° | Titre | Statut | Raison |
|---|---|---|---|
| 1 | Spring Batch | **mettre à jour** | sous-titre « Spring Boot 3 · Spring Batch 5 » : passer à Boot 4.1.2 · Spring Batch 6.0.6 |
| 2 | Plan du cours | **remplacer** | 9 modules et 2 parcours (Essentiel / Complet) au lieu de 8 parties |
| 3 | 1 · Pourquoi le batch | **remplacer** | séparateur : nouvelle structure en 9 modules |
| 4 | Le batch : lire, traiter, écrire | **garder** | concept stable, sans code |
| 5 | Les besoins techniques d'un traitement de masse | **garder** | concept stable |
| 6 | Cas d'usage métier | **garder** | concept stable |
| 7 | Cas d'usage techniques | **garder** | concept stable |
| 8 | Principes d'un bon batch | **garder** | concept stable (alimente le Top 10) |
| 9 | Stratégies de traitement, du plus simple au plus complexe | **garder** | concept stable ; ouvre le Module 1 |
| 10 | Verrouillage logique et partitionnement | **garder** | concept stable ; déplacée vers le Module 7 (verrouillage et partitionnement) |
| 11 | 2 · Architecture et vocabulaire | **remplacer** | séparateur : nouvelle structure |
| 12 | Architecture en trois couches | **garder** | déjà alignée v6 (JobLauncher / JobOperator) |
| 13 | Le schéma de référence | **mettre à jour** | montrer JobOperator comme lanceur principal et JobRepository qui étend JobExplorer |
| 14 | Job, JobInstance, JobExecution | **garder** | concept stable ; compléter par le schéma officiel « Job Hierarchy With Steps » |
| 15 | JobInstance = Job + paramètres identifiants | **garder** | concept stable (exemple de dates) |
| 16 | Step et StepExecution | **garder** | concept stable |
| 17 | ExecutionContext et JobRepository | **mettre à jour** | REVUE §7.3 : « au minimum H2 » → PostgreSQL ; ajouter les colonnes `version` |
| 18 | Historique des versions | **mettre à jour** | ajouter la ligne 6.x (Spring 7, Boot 4, Java 17 minimum) ; retirer H2 |
| 19 | 3 · Démarrer | **remplacer** | séparateur : nouvelle structure |
| 20 | Le projet : dépendances Maven | **remplacer** | starter-batch-jdbc + PostgreSQL, Boot 4.1.2, Java 25 (M1 §2.1) |
| 21 | Configurer le JobRepository | **remplacer** | @EnableJdbcJobRepository + PostgreSQL au lieu de @BatchDataSource H2 (M1 §2.2-2.3) |
| 22 | Premier job : la Tasklet | **mettre à jour** | paquets Spring Batch 6 ; classe explicite (M2 §2.1) |
| 23 | Configurer le Step et le Job | **mettre à jour** | noms `FirstJobConfig` / `HelloJobConfig`, imports v6 |
| 24 | Lancer un job | **mettre à jour** | `jobLauncher.run(...)` → `JobOperator.start(...)` ; paramètres identifiants / non identifiants |
| 25 | Variante : la configuration XML | **supprimer** | hors périmètre des 9 modules ; namespace déprécié (suppression prévue en v7) ; annexe possible |
| 26 | 4 · Tasklet et chunk | **remplacer** | séparateur : nouvelle structure |
| 27 | Tasklet ou chunk ? | **garder** | concept stable |
| 28 | Le chunk : lire un par un, écrire par blocs | **garder** | concept stable |
| 29 | L'algorithme du chunk et ses interfaces | **garder** | pseudo-code et interfaces inchangés |
| 30 | Un step orienté chunk (TP) | **remplacer** | `chunk(5, batchTxManager)` déprécié pour suppression → `chunk(n)` + `.transactionManager(tx)` (M3 §2.6) |
| 31 | Le reader CSV (FlatFileItemReader) | **mettre à jour** | cas bancaire : `linesToSkip`, `RecordFieldSetMapper`, `name` obligatoire (M3 §2.3) |
| 32 | Lire et écrire : les formats | **mettre à jour** | Jackson 3, `MongoPagingItemReader`, readers JPA ; plus de reader Hibernate (M3B §1.2) |
| 33 | Paramètres du job et scopes | **mettre à jour** | `runDate` identifiant + `inputFile` non identifiant (M3 §2.3) |
| 34 | Processors : transformer, filtrer, composer | **garder** | interface inchangée (les imports n'apparaissent pas sur la diapositive) |
| 35 | Valider les données | **mettre à jour** | `BeanValidatingItemProcessor`, `setFilter(true)`, record annoté, starter-validation (M4 §2.1) |
| 36 | Base de données : reader et writer JDBC | **mettre à jour** | PostgreSQL, curseur et auto-commit, pagination à clé unique, `ON CONFLICT` (M3 §2.5, M3B §2.3) |
| 37 | 5 · Flux et parallélisme | **remplacer** | séparateur : nouvelle structure |
| 38 | Enchaîner les steps : séquence et conditions | **mettre à jour** | noms du fil rouge (`loadBankStep`, `bankReportStep`) |
| 39 | Le decider : aiguiller selon un résultat | **mettre à jour** | exemple bancaire `RejectsDecider` ; pas de `@StepScope` (M5 §2.3) |
| 40 | Flows en parallèle (split) | **mettre à jour** | REVUE §7.3 : `SimpleAsyncTaskExecutor` illimité → pool borné et nommé |
| 41 | Partitions : le même step, des plages différentes | **mettre à jour** | REVUE §7.3 : `from`/`to` → `minId`/`maxId`, `IdRangePartitioner`, exécuteur explicite (M7 §2.3) |
| 42 | 6 · Fiabilité et tests | **remplacer** | séparateur : nouvelle structure |
| 43 | Skip : ignorer certaines erreurs | **mettre à jour** | REVUE §7.3 : `chunk(5, batchTxManager)` → `chunk(n)` ; `skipListener`, `SkipPolicy` (M6 §2.1) |
| 44 | Retry : retenter les erreurs transitoires | **remplacer** | REVUE §7.3 : `backOffPolicy` supprimé ; `RetryPolicy.builder()` de Spring Framework 7 ; « trois tentatives au total » à mesurer (M6 §2.2) |
| 45 | Restart : reprendre là où ça s'est arrêté | **mettre à jour** | REVUE §7.3 : code de démonstration ; `restart(id)` et restart implicite (M6 §2.4) |
| 46 | Tester un job et un step | **remplacer** | REVUE §7.3 : `JobLauncherTestUtils.launchJob` déprécié → `JobOperatorTestUtils.startJob` (M8 §2.1) |
| 47 | Composants personnalisés, logs et patterns | **mettre à jour** | reader délégué (`ItemStream`), `AbstractItemCountingItemStreamItemReader`, journaux structurés (M3B §2.2-2.4, M8 §2.4) |
| 48 | Lancer et superviser | **mettre à jour** | ajouter Kubernetes, `CommandLineJobOperator`, Data Flow avec avertissement Boot 4 (M8 §1.4-1.5) |
| 49 | 7 · Démo du formateur | **remplacer** | séparateur : le cas bancaire traverse maintenant les modules 3 à 8 |
| 50 | Le cas : des transactions bancaires | **mettre à jour** | nouveau CSV, PostgreSQL au lieu de H2 (M3 §2.1) |
| 51 | L'objet métier et le repository | **remplacer** | entité JPA + `Date` → records `RawTransaction` / `BankTransaction` (M3 §2.2) |
| 52 | Configurer le job et son step | **remplacer** | `@EnableBatchProcessing` écarté ; `chunk(n)` ; paramètres (M3 §2.6) |
| 53 | Le reader : un fichier plat | **remplacer** | remplacé par le reader du Module 3 (M3 §2.3) |
| 54 | Le processor et le writer | **remplacer** | `SimpleDateFormat` par appel → `DateTimeFormatter` ; `JdbcBatchItemWriter` (M3 §2.4-2.5, M4 §2.2) |
| 55 | Lancer le job par une API REST | **remplacer** | `GET /startJob` synchrone → `POST` asynchrone `202 Accepted` (M2 §2.4) |
| 56 | Résultat : exécuté et vérifié | **remplacer** | valeurs de la démo d'origine (937,15 / 4 700) → valeurs du nouveau CSV (M3 §5, M8 §2.2) |
| 57 | Enchaîner deux processors : le composite | **mettre à jour** | `new CompositeItemProcessor<>(a, b)` ; arrêt de la chaîne sur `null` (M4 §2.3) |
| 58 | Le piège : relancer double les totaux | **mettre à jour** | tableau 135,50 → 271,00 → 406,50 et solutions `@StepScope` / `ExecutionContext` (M4 §2.4-3.4) |
| 59 | Ce qui a changé depuis la démo d'origine | **remplacer** | migration 4 → 5 : remplacée par « Ce qui change dans Spring Batch 6 » (M1 §1.4, M8 §1.2) |
| 60 | 8 · Bonnes pratiques et versions | **remplacer** | séparateur : nouvelle structure |
| 61 | Bonnes pratiques (1/2) | **mettre à jour** | retirer `@EnableBatchProcessing (Boot 3)` ; ajouter paramètres `runDate` / `inputFile` ; renvoyer aux Top 10 |
| 62 | Bonnes pratiques (2/2) | **mettre à jour** | aligner sur les Top 10 (skip borné, `startLimit`, tests de contenu) |
| 63 | Pièges constatés dans le dépôt du TP | **supprimer** | propre aux TP d'origine ; remplacé par les Top 10 de chaque module |
| 64 | Spring Batch 6 : les nouveautés | **remplacer** | REVUE §7.3 : `StoppableStep`, SEDA… non couverts ; remplacée par M1 §1.4 et M8 §1.2 (liste vérifiée dans les jars) |
| 65 | Impact sur notre TP (Spring Batch 5 → 6) | **mettre à jour** | devient l'annexe « Migrer de Spring Batch 5 à 6 » |
| 66 | Questions d'entretien | **mettre à jour** | ajouter les questions des modules 4 à 8 (double comptage, `SKIP LOCKED`, restart…) |
| 67 | Le TP fil rouge : 14 étapes | **remplacer** | le nouveau TP (Boot 4 / Batch 6 / PostgreSQL) viendra en dernier |
| 68 | Ce qu'il faut retenir | **remplacer** | récapitulatif des 8 modules (M8 §1.6) |
| 69 | À toi de jouer | **mettre à jour** | liens vers `README.md`, `tp/tpProd` et le nouveau TP |

**Bilan :** 15 à garder · 28 à mettre à jour · 24 à remplacer (dont les 8 séparateurs) · 2 à supprimer.
Les huit séparateurs (n°3, 11, 19, 26, 37, 42, 49, 60) sont remplacés par les neuf séparateurs de modules. Les deux diapositives supprimées sont la n°25 (XML, déprécié ; annexe possible) et la n°63 (pièges propres aux TP d'origine, remplacés par les Top 10).

**Diapositives « au code périmé » citées en `REVUE_CROISEE.md` §7.3** : 43, 44, 45, 46, 41, 40, 64, 17 → traitées ci-dessus (44, 46 et 64 sont **remplacées** ; 43, 45, 41, 40 et 17 **mises à jour**). Les diapositives 12 à 16, non relues en détail dans la revue, l'ont été ici : 12, 14, 15, 16 restent ; 13 est mise à jour.

## 3. Plan détaillé du nouveau PPT

Ordre de lecture : M1 → M2 → M3 → **M3B** → M4 → M5 → M6 → M7 → M8 (voir `README.md`).

### Ouverture

| N° | Titre de la diapositive | Type | Source |
|---|---|---|---|
| 1 | Spring Batch : de la Tasklet au Remote Chunking | section | PPT n°1 (màj) |
| 2 | Plan de la formation : 9 modules, 2 parcours | tableau | remplace PPT n°2 + README.md |
| 3 | Comment suivre cette formation : Essentiel et Complet | schéma | nouveau (README.md) |

### Module 1 · Fondations et environnement de production

*Parcours : Essentiel · durée visée : 46 min · 31 diapositives*

Sous-vidéos : **1.1** Pourquoi un batch de production ? · **1.2** Le vocabulaire en un schéma · **1.3** Le projet : Boot 4, Batch 6, PostgreSQL · **1.4** Votre premier job et son lancement · **1.5** Sous le capot : les tables, les versions, l'isolation · **1.6** Top 10 des pièges

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 4 | — | Module 1 · Fondations et environnement de production | section | nouveau (gabarit PPT n°3) |
| 5 | 1.1 | Le batch : lire, traiter, écrire | schéma | PPT n°4 |
| 6 | 1.1 | Les besoins techniques d'un traitement de masse | tableau | PPT n°5 |
| 7 | 1.1 | Cas d'usage métier | tableau | PPT n°6 |
| 8 | 1.1 | Cas d'usage techniques | tableau | PPT n°7 |
| 9 | 1.1 | Principes d'un bon batch | tableau | PPT n°8 |
| 10 | 1.1 | Stratégies de traitement : du plus simple au plus complexe | schéma | PPT n°9 |
| 11 | 1.1 | Trois questions de production : trace, verrou, reprise | tableau | M1 §1.1 · nouveau S02 |
| 12 | 1.1 | La nuit interrompue : crash à 3 h 12, reprise au matin | schéma | M1 §4.1 · nouveau S04 |
| 13 | 1.2 | Job, JobInstance, JobExecution | schéma | PPT n°14 · Doc officielle « Job Hierarchy With Steps » |
| 14 | 1.2 | JobInstance = Job + paramètres identifiants | schéma | PPT n°15 · Doc officielle « Job Parameters » |
| 15 | 1.2 | Step et StepExecution | schéma | PPT n°16 |
| 16 | 1.2 | ExecutionContext et JobRepository | schéma | PPT n°17 (màj) |
| 17 | 1.2 | Architecture en trois couches | schéma | PPT n°12 · Doc officielle « Spring Batch Layered Architecture » |
| 18 | 1.2 | Le schéma de référence : JobOperator, Job, Step, JobRepository | schéma | PPT n°13 (màj) |
| 19 | 1.2 | Historique des versions : de 1.x à 6.x | tableau | PPT n°18 (màj) |
| 20 | 1.2 | Ce qui change dans Spring Batch 6 | tableau | M1 §1.4 |
| 21 | 1.3 | Dépendances Maven : Boot 4.1.2, Spring Batch 6.0.6, PostgreSQL | code | remplace PPT n°20 + M1 §2.1 |
| 22 | 1.3 | application.properties : base, lancement automatique, schéma | code | remplace PPT n°21 + M1 §2.2 |
| 23 | 1.3 | `@EnableJdbcJobRepository` ligne par ligne | code | remplace PPT n°21 + M1 §2.3 |
| 24 | 1.4 | Un premier job : tasklet, step, job | code | M1 §2.4 |
| 25 | 1.4 | Lancer le job par une API : record et `switch` | code | M1 §2.5 |
| 26 | 1.5 | Ce que le JobRepository écrit : 6 tables, 3 séquences | schéma | M1 §3.1 · nouveau S01 |
| 27 | 1.5 | Comment un lancement est vérifié | schéma | M1 §3.2 |
| 28 | 1.5 | Le verrouillage optimiste, pas à pas | schéma | M1 §3.3 · nouveau S03 |
| 29 | 1.5 | Ce qu'il faut savoir sur le verrouillage optimiste | texte | M1 §3.4 |
| 30 | 1.5 | Pourquoi le JobRepository est un singleton sans danger | texte | M1 §3.5 |
| 31 | 1.5 | Deux serveurs, un seul traitement ; l'audit | tableau | M1 §4.2-4.3 |
| 32 | 1.6 | Top 10 des pièges (1/2) | tableau | M1 §5 |
| 33 | 1.6 | Top 10 des pièges (2/2) | tableau | M1 §5 |
| 34 | 1.6 | Exercices du Module 1 | texte | M1 §7 |

### Module 2 · Premier job et cycle de vie

*Parcours : Essentiel · durée visée : 45 min · 18 diapositives*

Sous-vidéos : **2.1** Flashback et les deux modèles de step · **2.2** La tasklet, classe explicite · **2.3** Le step et le job avec les builders 6 · **2.4** Lancer avec `JobOperator`, puis sans bloquer · **2.5** Cycle de vie des beans, singleton et proxy · **2.6** Le démarrage Boot et le Top 10

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 35 | — | Module 2 · Premier job et cycle de vie | section | nouveau (gabarit PPT n°11) |
| 36 | 2.1 | Flashback Module 1 : repository, instance, opérateur | récapitulatif | M2 §1.1 |
| 37 | 2.1 | Tasklet ou chunk ? | schéma | PPT n°27 · nouveau S05 |
| 38 | 2.1 | Qui lance quoi, et quand ? | schéma | M2 §1.3 |
| 39 | 2.2 | Premier job : la tasklet | code | PPT n°22 (màj) · M2 §2.1 |
| 40 | 2.2 | `@StepScope` et `#{jobParameters[...]}` | code | M2 §2.1 |
| 41 | 2.3 | Configurer le Step et le Job | code | PPT n°23 (màj) · M2 §2.2 |
| 42 | 2.3 | `HelloJobConfig` remplace `FirstJobConfig` | texte | M2 §2.2 |
| 43 | 2.4 | Lancer un job : `JobOperator.start` | code | PPT n°24 (màj) · M2 §2.3 |
| 44 | 2.4 | Une API de lancement qui ne bloque pas (202 Accepted, threads virtuels) | code | remplace PPT n°55 + M2 §2.4 |
| 45 | 2.4 | `JobLauncher` et `JobOperator`, synchrone ou asynchrone | tableau | M2 §3.4 |
| 46 | 2.5 | Le cycle de vie d'un bean Spring en 8 étapes | schéma | M2 §3.1 |
| 47 | 2.5 | Singleton contre proxy `@StepScope` : la mémoire de la JVM | schéma | M2 §3.2 · nouveau S06 |
| 48 | 2.5 | Le piège du singleton : 100 puis « 200 » | schéma | M2 §3.3 · nouveau S07 |
| 49 | 2.6 | Ce que Spring Boot fait au démarrage | texte | M2 §3.5, §1.4 |
| 50 | 2.6 | Top 10 des pièges (1/2) | tableau | M2 §5 |
| 51 | 2.6 | Top 10 des pièges (2/2) | tableau | M2 §5 |
| 52 | 2.6 | Exercices du Module 2 | texte | M2 §7 |

### Module 3 · Le chunk : lire, traiter, écrire

*Parcours : Essentiel · durée visée : 55 min · 26 diapositives*

Sous-vidéos : **3.1** De la tasklet au chunk · **3.2** Les données : fichier, table, records · **3.3** Le reader de fichier plat · **3.4** Le processor et le filtrage · **3.5** Le writer PostgreSQL et le step · **3.6** Sous le capot : `ItemStream`, `ExecutionContext`, transaction · **3.7** Top 10 des pièges et test correct

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 53 | — | Module 3 · Le chunk | section | nouveau (gabarit PPT n°26) |
| 54 | 3.1 | Le chunk : lire un par un, écrire par blocs | schéma | PPT n°28 |
| 55 | 3.1 | L'algorithme du chunk et ses interfaces | schéma | PPT n°29 |
| 56 | 3.1 | Flashback Module 1 : l'`ExecutionContext` | récapitulatif | M3 §1.3 |
| 57 | 3.1 | Ce qui change en Spring Batch 6 : `chunk(n)` et `chunk(n, tx)` déprécié | tableau | M3 §1.4 |
| 58 | 3.2 | Le cas : des transactions bancaires | code | PPT n°50 (màj) · M3 §2.1 |
| 59 | 3.2 | Les objets métier : deux records | code | remplace PPT n°51 + M3 §2.2 |
| 60 | 3.3 | Le reader CSV : `FlatFileItemReader` | code | PPT n°31 (màj) · remplace PPT n°53 + M3 §2.3 |
| 61 | 3.3 | Paramètres du job et scopes : `runDate` et `inputFile` | code | PPT n°33 (màj) · M3 §2.3 |
| 62 | 3.3 | Lire et écrire : les formats | tableau | PPT n°32 (màj) |
| 63 | 3.4 | Le processor : transformer et filtrer | code | remplace PPT n°54 + M3 §2.4 |
| 64 | 3.4 | Pourquoi `return null` filtre l'élément | schéma | M3 §3.4 |
| 65 | 3.5 | Le writer PostgreSQL : `JdbcBatchItemWriter` et `ON CONFLICT` | code | PPT n°36 (màj) · M3 §2.5 |
| 66 | 3.5 | Le step : `chunk(100)` et `.transactionManager(tx)` | code | remplace PPT n°30, 52 + M3 §2.6 |
| 67 | 3.5 | Résultat attendu : `COMPLETED`, 4 lignes, total 2 486,25 | tableau | remplace PPT n°56 + M3 §5 |
| 68 | 3.6 | `ItemStream` : `open`, `update`, `close` | schéma | M3 §3.1 · nouveau S09 |
| 69 | 3.6 | La position de lecture sauvegardée avec les données | schéma | M3 §3.2 · nouveau S08 |
| 70 | 3.6 | Le réglage `saveState` | texte | M3 §3.2 |
| 71 | 3.6 | Qui détient la transaction | schéma | M3 §3.3 |
| 72 | 3.6 | Le coût de la taille du chunk | tableau | M3 §3.6 |
| 73 | 3.7 | Curseur ou pagination ; rappel : qu'est-ce qu'un curseur ? | schéma | M3 §3.5 · nouveau S10 |
| 74 | 3.7 | Les 4 conditions du streaming PostgreSQL | tableau | M3 §3.5 · nouveau S10 |
| 75 | 3.7 | Top 10 des pièges (1/2) | tableau | M3 §5 |
| 76 | 3.7 | Top 10 des pièges (2/2) | tableau | M3 §5 |
| 77 | 3.7 | Le test de contenu, pas le nombre de lignes | code | M3 §5 |
| 78 | 3.7 | Transition vers le Module 3B ou le Module 4 ; exercices | texte | M3 §6-7 |

### Module 3B · Le catalogue des readers

*Parcours : Complet : Optionnel / Avancé · durée visée : 40 min · 17 diapositives*

Sous-vidéos : **3B.1** Le catalogue des readers (et ce qui a disparu) · **3B.2** Fichiers à plusieurs formats · **3B.3** Un compte et ses opérations : la rupture de contrôle · **3B.4** Lire PostgreSQL par pages · **3B.5** Reader personnalisé, entrées vides, erreurs

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 79 | — | Module 3B · Le catalogue des readers (optionnel) | section | nouveau (gabarit PPT n°26) |
| 80 | 3B.1 | Un reader, un contrat simple | texte | M3B §1.1 |
| 81 | 3B.1 | Ce qui a changé depuis le livre : Hibernate, Mongo, paquets | tableau | M3B §1.2 |
| 82 | 3B.1 | Le catalogue des readers par source | tableau | M3B §1.3 · nouveau S11 |
| 83 | 3B.2 | Un fichier, deux formats de ligne : `PatternMatchingCompositeLineMapper` | code | M3B §2.1 |
| 84 | 3B.3 | Regrouper un compte et ses opérations : `peek` | code | M3B §2.2 |
| 85 | 3B.3 | La rupture de contrôle, pas à pas | schéma | M3B §3.1 · nouveau S12 |
| 86 | 3B.3 | `saveState(false)` et le reader enveloppant | texte | M3B §3.1 |
| 87 | 3B.4 | `JdbcPagingItemReader` et clé de tri unique | code | M3B §2.3 |
| 88 | 3B.4 | Curseur ou pages : connexion et threads | tableau | M3B §3.3 |
| 89 | 3B.4 | XML et JSON : un fragment, pas l'arbre | texte | M3B §3.2 |
| 90 | 3B.5 | Un reader personnalisé qui sait reprendre | code | PPT n°47 (màj) · M3B §2.4 |
| 91 | 3B.5 | Échouer quand il n'y a aucune donnée | code | M3B §2.5 |
| 92 | 3B.5 | Ignorer des erreurs : aperçu (détail au Module 6) | code | M3B §2.6 |
| 93 | 3B.5 | Plusieurs fichiers : aucune protection au restart | schéma | M3B §3.4 · nouveau S13 |
| 94 | 3B.5 | Top 10 des pièges | tableau | M3B §5 |
| 95 | 3B.5 | Exercices ; transition vers le Module 4 | texte | M3B §7 |

### Module 4 · Processors, scopes et proxys

*Parcours : Essentiel · durée visée : 60 min · 20 diapositives*

Sous-vidéos : **4.1** Le rôle du processor : transformer, filtrer, rejeter · **4.2** Valider avec Bean Validation · **4.3** Transformer et enchaîner (composite) · **4.4** Le processor à état et le bug du double comptage · **4.5** Sous le capot : cycle de vie, proxy CGLIB, mémoire JVM · **4.6** Les trois solutions et leurs limites · **4.7** `SimpleDateFormat`, tests et Top 10

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 96 | — | Module 4 · Processors, scopes et proxys | section | nouveau (gabarit PPT n°26) |
| 97 | 4.1 | Processors : transformer, filtrer, composer | schéma | PPT n°34 · nouveau S14 |
| 98 | 4.1 | Flashbacks : `return null` (Module 3), singleton (Module 2) | récapitulatif | M4 §1.2-1.3 |
| 99 | 4.2 | Valider les données | code | PPT n°35 (màj) · M4 §2.1 |
| 100 | 4.3 | Le processor de transformation : sans état | code | M4 §2.2 |
| 101 | 4.3 | Enchaîner deux processors : le composite | code | PPT n°57 (màj) · M4 §2.3 |
| 102 | 4.4 | Le processor qui a un état : le piège | code | M4 §2.4 |
| 103 | 4.4 | Le bug du double comptage : 135,50 → 271,00 → 406,50 | schéma | PPT n°58 (màj) · M4 §3.3 · nouveau S15 |
| 104 | 4.4 | Le test qui révèle le bug : deux lancements | code | M4 §2.5 |
| 105 | 4.5 | Le cycle de vie du bean, appliqué au processor | schéma | M4 §3.1 |
| 106 | 4.5 | `@StepScope` : un proxy qui crée l'objet à la demande | schéma | M4 §3.2 · nouveau S06 |
| 107 | 4.5 | Les limites d'un proxy CGLIB : `final`, records, appels internes | tableau | M4 §3.7 |
| 108 | 4.6 | Solution 1 : pas d'état, l'`ExecutionContext` | code | M4 §3.4 |
| 109 | 4.6 | Les trois solutions comparées | tableau | M4 §3.4 · nouveau S17 |
| 110 | 4.6 | Même en `@StepScope`, le total peut être faux : le rejeu du chunk | schéma | M4 §3.6 · nouveau S16 |
| 111 | 4.7 | `SimpleDateFormat` partagé : un bug de concurrence | texte | M4 §3.5 |
| 112 | 4.7 | Le test qui ne vérifie pas la donnée | code | M4 §5.1 |
| 113 | 4.7 | Top 10 des pièges (1/2) | tableau | M4 §5 |
| 114 | 4.7 | Top 10 des pièges (2/2) | tableau | M4 §5 |
| 115 | 4.7 | Exercices du Module 4 | texte | M4 §7 |

### Module 5 · Flux et orchestration

*Parcours : Essentiel · durée visée : 55 min · 20 diapositives*

Sous-vidéos : **5.1** Du pipeline au graphe · **5.2** `BatchStatus` contre `ExitStatus` · **5.3** Un flux conditionnel, ligne par ligne · **5.4** Le decider · **5.5** Sous le capot : la machine à états · **5.6** Le `Split` et les threads · **5.7** Tester les chemins et Top 10

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 116 | — | Module 5 · Flux et orchestration | section | nouveau (gabarit PPT n°37) |
| 117 | 5.1 | Du pipeline au graphe | schéma | M5 §1.1 |
| 118 | 5.1 | Enchaîner les steps : séquence et conditions | code | PPT n°38 (màj) |
| 119 | 5.1 | Flashbacks : statuts en base, singletons, `TaskExecutor` | récapitulatif | M5 §1.5 |
| 120 | 5.2 | `BatchStatus` et `ExitStatus` : la distinction cruciale | schéma | M5 §1.3 · nouveau S18 |
| 121 | 5.2 | Poser un code de sortie personnalisé | code | M5 §2.2 |
| 122 | 5.2 | Comment l'`ExitStatus` est déduit quand on n'y touche pas | texte | M5 §3.2 |
| 123 | 5.3 | Un job avec un flux conditionnel | code | M5 §2.1 |
| 124 | 5.3 | Le step d'alerte à l'équipe financière | code | M5 §2.1 |
| 125 | 5.3 | Qui décide de l'échec du job ? `.end()` ou `.fail()` | texte | M5 §3.4 |
| 126 | 5.4 | Le decider : aiguiller selon un résultat | code | PPT n°39 (màj) · M5 §2.3 |
| 127 | 5.4 | Pourquoi un decider n'est pas `@StepScope` | texte | M5 §3.3 |
| 128 | 5.5 | La machine à états du job | schéma | M5 §3.1 · nouveau S19 |
| 129 | 5.5 | Les erreurs de configuration : « Next state not found » | tableau | M5 §3.1 |
| 130 | 5.6 | Flows en parallèle (split) | code | PPT n°40 (màj) · M5 §2.4 |
| 131 | 5.6 | Les threads du `Split` et la barrière | schéma | M5 §3.5 · nouveau S20 |
| 132 | 5.6 | Pool de threads, pool de connexions | schéma | M5 §3.5 · nouveau S21 |
| 133 | 5.7 | Top 10 des pièges (1/2) | tableau | M5 §5 |
| 134 | 5.7 | Top 10 des pièges (2/2) | tableau | M5 §5 |
| 135 | 5.7 | Exercices du Module 5 | texte | M5 §7 |

### Module 6 · Fiabilité : skip, retry, restart, arrêt gracieux

*Parcours : Essentiel · durée visée : 60 min · 19 diapositives*

Sous-vidéos : **6.1** Trois problèmes, trois outils · **6.2** Skip : ignorer et consigner · **6.3** Retry : la nouvelle politique de Spring Framework 7 · **6.4** Sous le capot : rollback et rejeu du chunk · **6.5** Restart : comment Spring Batch sait où reprendre · **6.6** L'arrêt gracieux et l'exécution orpheline · **6.7** Top 10 et tests de fiabilité

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 136 | — | Module 6 · Fiabilité | section | nouveau (gabarit PPT n°42) |
| 137 | 6.1 | Skip, retry, restart : trois problèmes, trois outils | tableau | M6 §1.1 · nouveau S22 |
| 138 | 6.1 | Ce qui change dans Spring Batch 6 : retry de Spring Framework 7 | tableau | M6 §1.2 |
| 139 | 6.1 | Flashbacks : position sauvegardée, rejeu, statut | récapitulatif | M6 §1.3 |
| 140 | 6.2 | Skip : ignorer certaines erreurs | code | PPT n°43 (màj) · M6 §2.1 |
| 141 | 6.2 | Le listener de rejets : numéro de ligne et texte brut | code | M6 §2.1 |
| 142 | 6.2 | Une règle de skip sur mesure : `SkipPolicy` | code | M6 §2.1 |
| 143 | 6.3 | Retry : retenter les erreurs transitoires | code | remplace PPT n°44 + M6 §2.2 |
| 144 | 6.3 | Combiner skip et retry | code | M6 §2.3 |
| 145 | 6.4 | Rollback, pause, rejeu : ce qui se passe dans la transaction | schéma | M6 §3.2 · nouveau S24 |
| 146 | 6.5 | Restart : reprendre là où ça s'est arrêté | code | PPT n°45 (màj) · M6 §2.4 |
| 147 | 6.5 | De l'instance au contexte : où est la position | schéma | M6 §3.1 · nouveau S23 |
| 148 | 6.5 | Restart implicite et conditions de reprise | texte | M6 §2.4, §3.1 |
| 149 | 6.6 | `JobExecutionShutdownHook` | code | M6 §2.5 |
| 150 | 6.6 | SIGTERM jusqu'à `STOPPED` ; `kill -9` et l'exécution orpheline | schéma | M6 §3.3-3.4 · nouveau S25 |
| 151 | 6.7 | Top 10 des pièges (1/2) | tableau | M6 §5 |
| 152 | 6.7 | Top 10 des pièges (2/2) | tableau | M6 §5 |
| 153 | 6.7 | Les trois tests de fiabilité | code | M6 §5 |
| 154 | 6.7 | Exercices du Module 6 | texte | M6 §7 |

### Module 7 · Mise à l'échelle et multi-instance

*Parcours : Complet : Optionnel / Avancé · durée visée : 70 min · 27 diapositives*

Sous-vidéos : **7.1** Mesurer avant d'optimiser ; pourquoi passer à l'échelle · **7.2** Le panorama des approches ; deux serveurs, deux problèmes · **7.3** Le step multithread et ses limites · **7.4** `AsyncItemProcessor` et flux parallèles · **7.5** Le partitionnement local, ligne par ligne · **7.6** Partitionnement, restart et chevauchement · **7.7** Distribué et remote chunking (théorie) · **7.8** Multi-instance : `SKIP LOCKED` et bail · **7.9** Concurrence sur le `JobRepository` et Top 10

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 155 | — | Module 7 · Mise à l'échelle et multi-instance (optionnel) | section | nouveau (gabarit PPT n°37) |
| 156 | 7.1 | Mesurer avant d'optimiser : CPU, mémoire, JFR | texte | M7 §1.1 |
| 157 | 7.1 | Verrouillage logique et partitionnement | tableau | PPT n°10 |
| 158 | 7.1 | Quand passer à l'échelle : volume, SLA, disponibilité | tableau | M7 §1.2 |
| 159 | 7.2 | Le panorama : un serveur, plusieurs serveurs | schéma | M7 §1.3 · nouveau S26 |
| 160 | 7.2 | Éviter les doublons ou se partager le travail ? | schéma | M7 §1.4 · nouveau S27 |
| 161 | 7.2 | Flashbacks : repository partagé, singleton, `Split` | récapitulatif | M7 §1.5 |
| 162 | 7.3 | Un step multithread | code | M7 §2.1 |
| 163 | 7.3 | Quels readers sont thread-safe ? | tableau | M7 §3.4 · nouveau S31 |
| 164 | 7.4 | `AsyncItemProcessor` et `AsyncItemWriter` | code | M7 §2.2 |
| 165 | 7.5 | Partitions : le même step, des plages différentes | schéma | PPT n°41 (màj) · Doc officielle « Partitioned Process » |
| 166 | 7.5 | Le découpage : `IdRangePartitioner` | code | M7 §2.3 |
| 167 | 7.5 | Le step ouvrier et le step maître | code | M7 §2.3 |
| 168 | 7.5 | Du `Partitioner` aux `StepExecution` des workers | schéma | M7 §3.2 |
| 169 | 7.5 | Le rôle du `TaskExecutor` dans le partitionnement | texte | M7 §3.5 |
| 170 | 7.6 | Partitionnement et reprise | schéma | M7 §3.3 |
| 171 | 7.6 | Plages sans chevauchement : le test | code | M7 §5.1 · nouveau S29 |
| 172 | 7.7 | Partitionnement distribué : manager, workers, messages | schéma | M7 §2.4 |
| 173 | 7.7 | Remote chunking : le maître lit, les workers traitent | schéma | M7 §2.4 |
| 174 | 7.8 | La table de travail et la réservation avec bail | code | M7 §2.5 |
| 175 | 7.8 | Deux instances et `SKIP LOCKED` | schéma | M7 §3.6 · nouveau S28 |
| 176 | 7.9 | La concurrence sur le JobRepository : trois mécanismes | tableau | M7 §3.1 |
| 177 | 7.9 | Livraison en double : `OptimisticLockingFailureException` | schéma | M7 §3.1 · nouveau S30 |
| 178 | 7.9 | Débit contre nombre de threads | schéma | M7 §1.1 · nouveau S32 |
| 179 | 7.9 | Top 10 des pièges (1/2) | tableau | M7 §5 |
| 180 | 7.9 | Top 10 des pièges (2/2) | tableau | M7 §5 |
| 181 | 7.9 | Exercices du Module 7 | texte | M7 §7 |

### Module 8 · Production : tests, monitoring, déploiement, cloud

*Parcours : Complet : Optionnel / Avancé · durée visée : 73 min · 29 diapositives*

Sous-vidéos : **8.1** Les trois piliers et le récapitulatif de la version 6 · **8.2** Tester un job et un step · **8.3** Le test de contenu : le piège récurrent · **8.4** Les métriques : celles du framework et les vôtres · **8.5** JFR et journaux structurés · **8.6** Un batch cloud native : les douze facteurs · **8.7** Lancer sans bloquer en production · **8.8** Kubernetes : `Job`, `CronJob`, reprise · **8.9** Spring Cloud Data Flow et Spring Cloud Task · **8.10** Top 10 et bilan de la formation

| N° | Sous-vidéo | Titre de la diapositive | Type | Source |
|---|---|---|---|---|
| 182 | — | Module 8 · Production (optionnel) | section | nouveau (gabarit PPT n°60) |
| 183 | 8.1 | Les trois piliers : tests, monitoring, déploiement | schéma | M8 §1.1 · nouveau S34 |
| 184 | 8.1 | Spring Batch 6 : ce qui change, module par module | tableau | remplace PPT n°64, 59 + M8 §1.2 |
| 185 | 8.1 | La nuit d'un batch : CronJob, pod, job, métriques, alerte | schéma | M8 §1.1 · nouveau S33 |
| 186 | 8.2 | Tester un job et un step : `JobOperatorTestUtils` | code | remplace PPT n°46 + M8 §2.1 |
| 187 | 8.2 | Tester un composant `@StepScope` | code | M8 §2.1 |
| 188 | 8.2 | Comment `@SpringBatchTest` fonctionne | texte | M8 §3.1 |
| 189 | 8.3 | Les valeurs, un total, les exclusions, deux lancements | code | M8 §2.2 |
| 190 | 8.4 | Les métriques de Spring Batch avec Micrometer | tableau | M8 §2.3 |
| 191 | 8.4 | Des compteurs et des timers métier | code | M8 §2.3 |
| 192 | 8.4 | Pull ou push : un job de 20 secondes | schéma | M8 §2.3 · nouveau S38 |
| 193 | 8.5 | Les événements JFR de Spring Batch | schéma | M8 §3.2 · nouveau S37 |
| 194 | 8.5 | Des journaux structurés : MDC et paires clé-valeur | code | M8 §2.4 |
| 195 | 8.6 | Les douze facteurs appliqués au batch | tableau | M8 §1.3 |
| 196 | 8.7 | Exécuteur applicatif ou `TaskExecutorJobOperator` | tableau | M8 §2.7 |
| 197 | 8.7 | Configuration d'un lanceur asynchrone | code | M8 §2.7 |
| 198 | 8.8 | `Job` ou `CronJob` ? | tableau | M8 §1.5 |
| 199 | 8.8 | Un `CronJob` ligne par ligne | code | M8 §2.5 |
| 200 | 8.8 | Comment Kubernetes gère un batch | schéma | M8 §3.5 · nouveau S36 |
| 201 | 8.8 | Lancer et superviser | schéma | PPT n°48 (màj) |
| 202 | 8.9 | Quand utiliser Data Flow et Spring Cloud Task ? | tableau | M8 §1.4 |
| 203 | 8.9 | Enregistrer, définir, lancer, superviser | code | M8 §2.6 |
| 204 | 8.10 | Top 10 des pièges (1/2) | tableau | M8 §5 |
| 205 | 8.10 | Top 10 des pièges (2/2) | tableau | M8 §5 |
| 206 | 8.10 | Les sept modules en une page | récapitulatif | M8 §1.6 · nouveau S35 |
| 207 | 8.10 | Bonnes pratiques (1/2) | tableau | PPT n°61 (màj) |
| 208 | 8.10 | Bonnes pratiques (2/2) | tableau | PPT n°62 (màj) |
| 209 | 8.10 | Questions d'entretien | tableau | PPT n°66 (màj) |
| 210 | 8.10 | Exercices du Module 8 | texte | M8 §7 |

### Clôture et annexes

| N° | Titre de la diapositive | Type | Source |
|---|---|---|---|
| 211 | Ce qu'il faut retenir | récapitulatif | remplace PPT n°68 + M8 §1.6 |
| 212 | Annexe : migrer de Spring Batch 5 à 6 | tableau | PPT n°65 (màj) |
| 213 | Le TP fil rouge (nouvelle pile) | texte | remplace PPT n°67 : nouveau TP à venir |
| 214 | À toi de jouer | texte | PPT n°69 (màj) |

## 4. Schémas personnalisés à créer

La colonne « Prio. » renvoie à la priorité de `VISUELS.md` §3 ; ⭐ = schéma jugé prioritaire dans les modules.

| Id | Module | Schéma | Prio. | Description | Diapositive(s) du plan |
|---|---|---|---|---|---|
| S01 | 1 | ERD des 6 tables BATCH_* avec les colonnes `version` | #12 | entité-relation annoté PostgreSQL ; `version` en évidence | n°26 |
| S02 | 1 | Les trois questions de production | — | tableau en 3 icônes (intégré à la diapositive « Trois questions ») | n°11 |
| S03 | 1 | Séquence du verrouillage optimiste (serveurs A et B) | #5 | `UPDATE … WHERE version = ?` : 1 ligne puis 0 ligne ; version en rouge | n°28 |
| S04 | 1 | La nuit interrompue : crash à 3 h 12 et reprise | — | frise temporelle (cas d'usage M1 §4.1) | n°12 |
| S05 | 2 | Tasklet contre chunk | — | deux colonnes : une action, une boucle lire-traiter-écrire | n°37 |
| S06 | 2/4 | Singleton contre proxy `@StepScope` (mémoire JVM) | #2 | proxy permanent gris, instances éphémères bleu et vert ; animé en 4 temps | n°47, n°106 |
| S07 | 2 | Double comptage de `CountingTasklet` (100 puis « 200 ») | — | chronologie courte ; annonce S15 | n°48 |
| S08 | 3 | Frise des transactions : commit = lignes + position | #3 | 3 chunks ; crash avant le commit du 3e | n°69 |
| S09 | 3 | Cycle de vie d'`ItemStream` | #8 | `open` → (`read` ×N, `update`, commit) ×chunks → `close` | n°68 |
| S10 | 3 | Curseur contre pagination, `fetchSize` et streaming PostgreSQL | #9 | redessiné (le schéma du livre n'est pas réutilisable) ; 4 conditions en pastilles | n°73, n°74 |
| S11 | 3B | Carte mentale des readers | #14 | par source ; ce qui a disparu en grisé | n°82 |
| S12 | 3B | Rupture de contrôle (ACC / OP / `peek`) | #10 | compte regroupé en un seul élément | n°85 |
| S13 | 3B | Restart de `MultiResourceItemReader` | #10 | fichier ajouté entre deux lancements ; contre-exemple du répertoire par exécution | n°93 |
| S14 | 4 | Les trois flèches du processor | #13 | transformer / filtrer / rejeter avec les compteurs de `batch_step_execution` | n°97 |
| S15 | 4 | Le bug du double comptage | #1 | ⭐ priorité n°1 ; un singleton, trois lancements, 135,50 → 271,00 → 406,50 | n°103 |
| S16 | 4 | Rejeu du chunk : total du processor faux, `SUM` SQL juste | #7 | élément traité deux fois après un retry | n°110 |
| S17 | 4 | Les trois solutions comparées | — | matrice colorée | n°109 |
| S18 | 5 | `BatchStatus` et `ExitStatus` en deux voies | #11 | rail technique / rail d'aiguillage ; `COMPLETED_WITH_REJECTS` | n°120 |
| S19 | 5 | Machine à états du job | #4 | ⭐ états, transitions étiquetées, « Next state not found » en rouge | n°128 |
| S20 | 5 | `Split` : threads et barrière | #6 | thread 1 bleu, thread 2 vert, barrière rouge | n°131 |
| S21 | 5 | Jauge du pool de connexions | #6 | 2 flux × 3 connexions + JobRepository | n°132 |
| S22 | 6 | Skip, retry, restart : tableau et arbre de décision | — | reprend le style des diapositives 43 à 45 | n°137 |
| S23 | 6 | Chronologie crash puis restart | — | ⭐ chunk 34 validé, crash à la ligne 3 450, reprise à la 3 401e | n°147 |
| S24 | 6 | Rollback et rejeu avec pause exponentielle | — | élément 37 en rouge, rollback, pause, rejeu en vert | n°145 |
| S25 | 6 | Arrêt gracieux contre `kill -9` | — | deux lignes de temps : `STOPPED` propre / `STARTED` orphelin | n°150 |
| S26 | 7 | Arbre de choix des approches de mise à l'échelle | — | goulot : I/O, traitement, attente | n°159 |
| S27 | 7 | Deux situations du multi-instance | — | éviter les doublons contre se partager le travail | n°160 |
| S28 | 7 | Deux instances et `SKIP LOCKED` | — | ⭐ lignes réservées par A (bleu), B (vert), verrouillées sautées (gris) | n°175 |
| S29 | 7 | Plages de partitionnement sans chevauchement | — | 4 couleurs ; cas fautif en rouge | n°171 |
| S30 | 7 | Livraison en double et `OptimisticLockingFailureException` | — | deux workers sur la même partition | n°177 |
| S31 | 7 | Quel reader est thread-safe ? | — | tableau en pastilles vertes et rouges | n°163 |
| S32 | 7 | Débit contre nombre de threads | — | courbe qui plafonne quand l'I/O sature | n°178 |
| S33 | 8 | Frise de la nuit d'un batch | — | CronJob → pod → job → métriques → alerte, modules 1 à 7 placés | n°185 |
| S34 | 8 | Les trois piliers | — | tests / monitoring / déploiement | n°183 |
| S35 | 8 | Récapitulatif : les 8 modules et leur piège phare | — | carte de la formation | n°206 |
| S36 | 8 | Machine à états Kubernetes d'un batch | — | ⭐ `restartPolicy`, `backoffLimit`, `activeDeadlineSeconds` | n°200 |
| S37 | 8 | Événements JFR sur le déroulé d'un chunk et d'un partitionnement | — | 11 événements placés sur le schéma | n°193 |
| S38 | 8 | Pull contre push des métriques | — | job de 20 secondes, scrape de 30 secondes | n°192 |

## 5. Schémas officiels à insérer

Titres **vérifiés** (extrait de documentation fourni). Les autres schémas officiels cités dans les modules restent « à confirmer » (le site de documentation n'est pas accessible depuis l'environnement de rédaction).

| Titre officiel | Page | Où l'insérer |
|---|---|---|
| « Spring Batch Layered Architecture » | Spring Batch Architecture | Module 1, « Architecture en trois couches » |
| « Partitioned Process » | Spring Batch Architecture | Module 7, « Partitions : le même step… » |
| « Job Hierarchy With Steps » | The Domain Language of Batch | Module 1, « Job, JobInstance, JobExecution » |
| « Job Parameters » | The Domain Language of Batch | Module 1, « JobInstance = Job + paramètres identifiants » |
| « Batch Stereotypes » | The Domain Language of Batch | Module 4 (rôle du processor) — à rapprocher de S14 |
| « Job Hierarchy » | The Domain Language of Batch | Module 1 (variante sans les steps) |

## 6. Bilan chiffré par module

| Module | Diapositives | Plage de numéros | Durée visée | Min par diapositive | Parcours |
|---|---|---|---|---|---|
| 1 · Fondations et environnement de production | 31 | 4–34 | 46 min | 1.5 | Essentiel |
| 2 · Premier job et cycle de vie | 18 | 35–52 | 45 min | 2.5 | Essentiel |
| 3 · Le chunk : lire, traiter, écrire | 26 | 53–78 | 55 min | 2.1 | Essentiel |
| 3B · Le catalogue des readers | 17 | 79–95 | 40 min | 2.4 | Complet : Optionnel / Avancé |
| 4 · Processors, scopes et proxys | 20 | 96–115 | 60 min | 3.0 | Essentiel |
| 5 · Flux et orchestration | 20 | 116–135 | 55 min | 2.8 | Essentiel |
| 6 · Fiabilité : skip, retry, restart, arrêt gracieux | 19 | 136–154 | 60 min | 3.2 | Essentiel |
| 7 · Mise à l'échelle et multi-instance | 27 | 155–181 | 70 min | 2.6 | Complet : Optionnel / Avancé |
| 8 · Production : tests, monitoring, déploiement, cloud | 29 | 182–210 | 73 min | 2.5 | Complet : Optionnel / Avancé |
| Ouverture et clôture | 7 | | | | |
| **Total** | **214** | 1–214 | 504 min | 2.4 | Essentiel : 141 diapositives · Complet : 214 |

**Intégrité (contrôle automatique) :** chaque diapositive d'origine marquée « garder », « mettre à jour » ou « remplacer » figure dans le nouveau plan avec la notation correspondante ; aucune diapositive « supprimer » n'y figure ; chaque schéma `Sxx` cité est défini et chaque schéma défini est cité au moins une fois.

## 7. Points ouverts pour validation

| # | Question | Proposition |
|---|---|---|
| 1 | **Volume** : le nouveau PPT compte 214 diapositives (≈ 2.4 min chacune), contre 69 pour l'original. Convient-il ? | oui : les modules sont de 40 à 73 min, avec code construit ligne par ligne |
| 2 | **Format du plan** : message coupé ; le format de §1 convient-il ? | à confirmer ; ajouter une colonne « Animation (Phase 2) » si besoin |
| 3 | **Diapositive n°25 (XML)** : supprimer ou annexe ? | supprimer ; une annexe XML peut venir après le TP |
| 4 | **Diapositive n°10** (verrouillage logique) : Module 7 plutôt que Module 1 ? | Module 7 (verrouillage et partitionnement) |
| 5 | **Séparateurs** : un par module, avec le badge de parcours ? | oui |
| 6 | **Schémas officiels « à confirmer »** : qui relève les titres exacts sur la documentation en ligne ? | l'équipe, avant la Phase 2 |
| 7 | **Le nouveau TP** (dernier) : les diapositives de TP sont-elles à prévoir dans ce PPT ? | un seul emplacement réservé en clôture |
