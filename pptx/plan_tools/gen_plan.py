# -*- coding: utf-8 -*-
"""Génère PPT_PLAN.md à partir de données (inventaire + plan par module) et contrôle leur cohérence."""
import re, sys, os, collections

# ---------------------------------------------------------------- 1. INVENTAIRE (69 diapositives d'origine)
G,M,R,S = "garder","mettre à jour","remplacer","supprimer"
INV = {
 1:("Spring Batch",M,"sous-titre « Spring Boot 3 · Spring Batch 5 » : passer à Boot 4.1.2 · Spring Batch 6.0.6"),
 2:("Plan du cours",R,"9 modules et 2 parcours (Essentiel / Complet) au lieu de 8 parties"),
 3:("1 · Pourquoi le batch",R,"séparateur : nouvelle structure en 9 modules"),
 4:("Le batch : lire, traiter, écrire",G,"concept stable, sans code"),
 5:("Les besoins techniques d'un traitement de masse",G,"concept stable"),
 6:("Cas d'usage métier",G,"concept stable"),
 7:("Cas d'usage techniques",G,"concept stable"),
 8:("Principes d'un bon batch",G,"concept stable (alimente le Top 10)"),
 9:("Stratégies de traitement, du plus simple au plus complexe",G,"concept stable ; ouvre le Module 1"),
 10:("Verrouillage logique et partitionnement",G,"concept stable ; déplacée vers le Module 7 (verrouillage et partitionnement)"),
 11:("2 · Architecture et vocabulaire",R,"séparateur : nouvelle structure"),
 12:("Architecture en trois couches",G,"déjà alignée v6 (JobLauncher / JobOperator)"),
 13:("Le schéma de référence",M,"montrer JobOperator comme lanceur principal et JobRepository qui étend JobExplorer"),
 14:("Job, JobInstance, JobExecution",G,"concept stable ; compléter par le schéma officiel « Job Hierarchy With Steps »"),
 15:("JobInstance = Job + paramètres identifiants",G,"concept stable (exemple de dates)"),
 16:("Step et StepExecution",G,"concept stable"),
 17:("ExecutionContext et JobRepository",M,"REVUE §7.3 : « au minimum H2 » → PostgreSQL ; ajouter les colonnes `version`"),
 18:("Historique des versions",M,"ajouter la ligne 6.x (Spring 7, Boot 4, Java 17 minimum) ; retirer H2"),
 19:("3 · Démarrer",R,"séparateur : nouvelle structure"),
 20:("Le projet : dépendances Maven",R,"starter-batch-jdbc + PostgreSQL, Boot 4.1.2, Java 25 (M1 §2.1)"),
 21:("Configurer le JobRepository",R,"@EnableJdbcJobRepository + PostgreSQL au lieu de @BatchDataSource H2 (M1 §2.2-2.3)"),
 22:("Premier job : la Tasklet",M,"paquets Spring Batch 6 ; classe explicite (M2 §2.1)"),
 23:("Configurer le Step et le Job",M,"noms `FirstJobConfig` / `HelloJobConfig`, imports v6"),
 24:("Lancer un job",M,"`jobLauncher.run(...)` → `JobOperator.start(...)` ; paramètres identifiants / non identifiants"),
 25:("Variante : la configuration XML",S,"hors périmètre des 9 modules ; namespace déprécié (suppression prévue en v7) ; annexe possible"),
 26:("4 · Tasklet et chunk",R,"séparateur : nouvelle structure"),
 27:("Tasklet ou chunk ?",G,"concept stable"),
 28:("Le chunk : lire un par un, écrire par blocs",G,"concept stable"),
 29:("L'algorithme du chunk et ses interfaces",G,"pseudo-code et interfaces inchangés"),
 30:("Un step orienté chunk (TP)",R,"`chunk(5, batchTxManager)` déprécié pour suppression → `chunk(n)` + `.transactionManager(tx)` (M3 §2.6)"),
 31:("Le reader CSV (FlatFileItemReader)",M,"cas bancaire : `linesToSkip`, `RecordFieldSetMapper`, `name` obligatoire (M3 §2.3)"),
 32:("Lire et écrire : les formats",M,"Jackson 3, `MongoPagingItemReader`, readers JPA ; plus de reader Hibernate (M3B §1.2)"),
 33:("Paramètres du job et scopes",M,"`runDate` identifiant + `inputFile` non identifiant (M3 §2.3)"),
 34:("Processors : transformer, filtrer, composer",G,"interface inchangée (les imports n'apparaissent pas sur la diapositive)"),
 35:("Valider les données",M,"`BeanValidatingItemProcessor`, `setFilter(true)`, record annoté, starter-validation (M4 §2.1)"),
 36:("Base de données : reader et writer JDBC",M,"PostgreSQL, curseur et auto-commit, pagination à clé unique, `ON CONFLICT` (M3 §2.5, M3B §2.3)"),
 37:("5 · Flux et parallélisme",R,"séparateur : nouvelle structure"),
 38:("Enchaîner les steps : séquence et conditions",M,"noms du fil rouge (`loadBankStep`, `bankReportStep`)"),
 39:("Le decider : aiguiller selon un résultat",M,"exemple bancaire `RejectsDecider` ; pas de `@StepScope` (M5 §2.3)"),
 40:("Flows en parallèle (split)",M,"REVUE §7.3 : `SimpleAsyncTaskExecutor` illimité → pool borné et nommé"),
 41:("Partitions : le même step, des plages différentes",M,"REVUE §7.3 : `from`/`to` → `minId`/`maxId`, `IdRangePartitioner`, exécuteur explicite (M7 §2.3)"),
 42:("6 · Fiabilité et tests",R,"séparateur : nouvelle structure"),
 43:("Skip : ignorer certaines erreurs",M,"REVUE §7.3 : `chunk(5, batchTxManager)` → `chunk(n)` ; `skipListener`, `SkipPolicy` (M6 §2.1)"),
 44:("Retry : retenter les erreurs transitoires",R,"REVUE §7.3 : `backOffPolicy` supprimé ; `RetryPolicy.builder()` de Spring Framework 7 ; « trois tentatives au total » à mesurer (M6 §2.2)"),
 45:("Restart : reprendre là où ça s'est arrêté",M,"REVUE §7.3 : code de démonstration ; `restart(id)` et restart implicite (M6 §2.4)"),
 46:("Tester un job et un step",R,"REVUE §7.3 : `JobLauncherTestUtils.launchJob` déprécié → `JobOperatorTestUtils.startJob` (M8 §2.1)"),
 47:("Composants personnalisés, logs et patterns",M,"reader délégué (`ItemStream`), `AbstractItemCountingItemStreamItemReader`, journaux structurés (M3B §2.2-2.4, M8 §2.4)"),
 48:("Lancer et superviser",M,"ajouter Kubernetes, `CommandLineJobOperator`, Data Flow avec avertissement Boot 4 (M8 §1.4-1.5)"),
 49:("7 · Démo du formateur",R,"séparateur : le cas bancaire traverse maintenant les modules 3 à 8"),
 50:("Le cas : des transactions bancaires",M,"nouveau CSV, PostgreSQL au lieu de H2 (M3 §2.1)"),
 51:("L'objet métier et le repository",R,"entité JPA + `Date` → records `RawTransaction` / `BankTransaction` (M3 §2.2)"),
 52:("Configurer le job et son step",R,"`@EnableBatchProcessing` écarté ; `chunk(n)` ; paramètres (M3 §2.6)"),
 53:("Le reader : un fichier plat",R,"remplacé par le reader du Module 3 (M3 §2.3)"),
 54:("Le processor et le writer",R,"`SimpleDateFormat` par appel → `DateTimeFormatter` ; `JdbcBatchItemWriter` (M3 §2.4-2.5, M4 §2.2)"),
 55:("Lancer le job par une API REST",R,"`GET /startJob` synchrone → `POST` asynchrone `202 Accepted` (M2 §2.4)"),
 56:("Résultat : exécuté et vérifié",R,"valeurs de la démo d'origine (937,15 / 4 700) → valeurs du nouveau CSV (M3 §5, M8 §2.2)"),
 57:("Enchaîner deux processors : le composite",M,"`new CompositeItemProcessor<>(a, b)` ; arrêt de la chaîne sur `null` (M4 §2.3)"),
 58:("Le piège : relancer double les totaux",M,"tableau 135,50 → 271,00 → 406,50 et solutions `@StepScope` / `ExecutionContext` (M4 §2.4-3.4)"),
 59:("Ce qui a changé depuis la démo d'origine",R,"migration 4 → 5 : remplacée par « Ce qui change dans Spring Batch 6 » (M1 §1.4, M8 §1.2)"),
 60:("8 · Bonnes pratiques et versions",R,"séparateur : nouvelle structure"),
 61:("Bonnes pratiques (1/2)",M,"retirer `@EnableBatchProcessing (Boot 3)` ; ajouter paramètres `runDate` / `inputFile` ; renvoyer aux Top 10"),
 62:("Bonnes pratiques (2/2)",M,"aligner sur les Top 10 (skip borné, `startLimit`, tests de contenu)"),
 63:("Pièges constatés dans le dépôt du TP",S,"propre aux TP d'origine ; remplacé par les Top 10 de chaque module"),
 64:("Spring Batch 6 : les nouveautés",R,"REVUE §7.3 : `StoppableStep`, SEDA… non couverts ; remplacée par M1 §1.4 et M8 §1.2 (liste vérifiée dans les jars)"),
 65:("Impact sur notre TP (Spring Batch 5 → 6)",M,"devient l'annexe « Migrer de Spring Batch 5 à 6 »"),
 66:("Questions d'entretien",M,"ajouter les questions des modules 4 à 8 (double comptage, `SKIP LOCKED`, restart…)"),
 67:("Le TP fil rouge : 14 étapes",R,"le nouveau TP (Boot 4 / Batch 6 / PostgreSQL) viendra en dernier"),
 68:("Ce qu'il faut retenir",R,"récapitulatif des 8 modules (M8 §1.6)"),
 69:("À toi de jouer",M,"liens vers `README.md`, `tp/tpProd` et le nouveau TP"),
}
DIVIDERS = {3,11,19,26,37,42,49,60}   # remplacés collectivement par les séparateurs de modules

# ---------------------------------------------------------------- 2. PLAN (module -> sous-vidéo -> diapositives)
# type : section / schéma / code / tableau / texte / récapitulatif
# source : « PPT n°X » (reprise), « PPT n°X (màj) », « remplace PPT n°X + Mx §y », « Mx §y », « nouveau Sxx », « Doc officielle « … » »
O = "Doc officielle"
PLAN = [
 ("1","Fondations et environnement de production","Essentiel",46,[
  ("—",[("Module 1 · Fondations et environnement de production","section","nouveau (gabarit PPT n°3)")]),
  ("1.1 Pourquoi un batch de production ?",[
    ("Le batch : lire, traiter, écrire","schéma","PPT n°4"),
    ("Les besoins techniques d'un traitement de masse","tableau","PPT n°5"),
    ("Cas d'usage métier","tableau","PPT n°6"),
    ("Cas d'usage techniques","tableau","PPT n°7"),
    ("Principes d'un bon batch","tableau","PPT n°8"),
    ("Stratégies de traitement : du plus simple au plus complexe","schéma","PPT n°9"),
    ("Trois questions de production : trace, verrou, reprise","tableau","M1 §1.1"),
    ("La nuit interrompue : crash à 3 h 12, reprise au matin","schéma","M1 §4.1 · nouveau S04")]),
  ("1.2 Le vocabulaire en un schéma",[
    ("Job, JobInstance, JobExecution","schéma","PPT n°14 · Doc officielle « Job Hierarchy With Steps »"),
    ("JobInstance = Job + paramètres identifiants","schéma","PPT n°15 · Doc officielle « Job Parameters »"),
    ("Step et StepExecution","schéma","PPT n°16"),
    ("ExecutionContext et JobRepository","schéma","PPT n°17 (màj)"),
    ("Architecture en trois couches","schéma","PPT n°12 · Doc officielle « Spring Batch Layered Architecture »"),
    ("Le schéma de référence : JobOperator, Job, Step, JobRepository","schéma","PPT n°13 (màj)"),
    ("Historique des versions : de 1.x à 6.x","tableau","PPT n°18 (màj)"),
    ("Ce qui change dans Spring Batch 6","tableau","M1 §1.4")]),
  ("1.3 Le projet : Boot 4, Batch 6, PostgreSQL",[
    ("Dépendances Maven : Boot 4.1.2, Spring Batch 6.0.6, PostgreSQL","code","remplace PPT n°20 + M1 §2.1"),
    ("application.properties : base, lancement automatique, schéma","code","remplace PPT n°21 + M1 §2.2"),
    ("`@EnableJdbcJobRepository` ligne par ligne","code","remplace PPT n°21 + M1 §2.3")]),
  ("1.4 Votre premier job et son lancement",[
    ("Un premier job : tasklet, step, job","code","M1 §2.4"),
    ("Lancer le job par une API : record et `switch`","code","M1 §2.5")]),
  ("1.5 Sous le capot : les tables, les versions, l'isolation",[
    ("Ce que le JobRepository écrit : 6 tables, 3 séquences","schéma","M1 §3.1 · nouveau S01"),
    ("Comment un lancement est vérifié","schéma","M1 §3.2"),
    ("Le verrouillage optimiste, pas à pas","schéma","M1 §3.3 · nouveau S03"),
    ("Ce qu'il faut savoir sur le verrouillage optimiste","texte","M1 §3.4"),
    ("Pourquoi le JobRepository est un singleton sans danger","texte","M1 §3.5"),
    ("Deux serveurs, un seul traitement ; l'audit","tableau","M1 §4.2-4.3")]),
  ("1.6 Top 10 des pièges",[
    ("Top 10 des pièges (1/2)","tableau","M1 §5"),
    ("Top 10 des pièges (2/2)","tableau","M1 §5"),
    ("Exercices du Module 1","texte","M1 §7")]),
 ]),
 ("2","Premier job et cycle de vie","Essentiel",45,[
  ("—",[("Module 2 · Premier job et cycle de vie","section","nouveau (gabarit PPT n°11)")]),
  ("2.1 Flashback et les deux modèles de step",[
    ("Flashback Module 1 : repository, instance, opérateur","récapitulatif","M2 §1.1"),
    ("Tasklet ou chunk ?","schéma","PPT n°27 · nouveau S05"),
    ("Qui lance quoi, et quand ?","schéma","M2 §1.3")]),
  ("2.2 La tasklet, classe explicite",[
    ("Premier job : la tasklet","code","PPT n°22 (màj) · M2 §2.1"),
    ("`@StepScope` et `#{jobParameters[...]}`","code","M2 §2.1")]),
  ("2.3 Le step et le job avec les builders 6",[
    ("Configurer le Step et le Job","code","PPT n°23 (màj) · M2 §2.2"),
    ("`HelloJobConfig` remplace `FirstJobConfig`","texte","M2 §2.2")]),
  ("2.4 Lancer avec `JobOperator`, puis sans bloquer",[
    ("Lancer un job : `JobOperator.start`","code","PPT n°24 (màj) · M2 §2.3"),
    ("Une API de lancement qui ne bloque pas (202 Accepted, threads virtuels)","code","remplace PPT n°55 + M2 §2.4"),
    ("`JobLauncher` et `JobOperator`, synchrone ou asynchrone","tableau","M2 §3.4")]),
  ("2.5 Cycle de vie des beans, singleton et proxy",[
    ("Le cycle de vie d'un bean Spring en 8 étapes","schéma","M2 §3.1"),
    ("Singleton contre proxy `@StepScope` : la mémoire de la JVM","schéma","M2 §3.2 · nouveau S06"),
    ("Le piège du singleton : 100 puis « 200 »","schéma","M2 §3.3 · nouveau S07")]),
  ("2.6 Le démarrage Boot et le Top 10",[
    ("Ce que Spring Boot fait au démarrage","texte","M2 §3.5, §1.4"),
    ("Top 10 des pièges (1/2)","tableau","M2 §5"),
    ("Top 10 des pièges (2/2)","tableau","M2 §5"),
    ("Exercices du Module 2","texte","M2 §7")]),
 ]),
 ("3","Le chunk : lire, traiter, écrire","Essentiel",55,[
  ("—",[("Module 3 · Le chunk","section","nouveau (gabarit PPT n°26)")]),
  ("3.1 De la tasklet au chunk",[
    ("Le chunk : lire un par un, écrire par blocs","schéma","PPT n°28"),
    ("L'algorithme du chunk et ses interfaces","schéma","PPT n°29"),
    ("Flashback Module 1 : l'`ExecutionContext`","récapitulatif","M3 §1.3"),
    ("Ce qui change en Spring Batch 6 : `chunk(n)` et `chunk(n, tx)` déprécié","tableau","M3 §1.4")]),
  ("3.2 Les données : fichier, table, records",[
    ("Le cas : des transactions bancaires","code","PPT n°50 (màj) · M3 §2.1"),
    ("Les objets métier : deux records","code","remplace PPT n°51 + M3 §2.2")]),
  ("3.3 Le reader de fichier plat",[
    ("Le reader CSV : `FlatFileItemReader`","code","PPT n°31 (màj) · remplace PPT n°53 + M3 §2.3"),
    ("Paramètres du job et scopes : `runDate` et `inputFile`","code","PPT n°33 (màj) · M3 §2.3"),
    ("Lire et écrire : les formats","tableau","PPT n°32 (màj)")]),
  ("3.4 Le processor et le filtrage",[
    ("Le processor : transformer et filtrer","code","remplace PPT n°54 + M3 §2.4"),
    ("Pourquoi `return null` filtre l'élément","schéma","M3 §3.4")]),
  ("3.5 Le writer PostgreSQL et le step",[
    ("Le writer PostgreSQL : `JdbcBatchItemWriter` et `ON CONFLICT`","code","PPT n°36 (màj) · M3 §2.5"),
    ("Le step : `chunk(100)` et `.transactionManager(tx)`","code","remplace PPT n°30, 52 + M3 §2.6"),
    ("Résultat attendu : `COMPLETED`, 4 lignes, total 2 486,25","tableau","remplace PPT n°56 + M3 §5")]),
  ("3.6 Sous le capot : `ItemStream`, `ExecutionContext`, transaction",[
    ("`ItemStream` : `open`, `update`, `close`","schéma","M3 §3.1 · nouveau S09"),
    ("La position de lecture sauvegardée avec les données","schéma","M3 §3.2 · nouveau S08"),
    ("Le réglage `saveState`","texte","M3 §3.2"),
    ("Qui détient la transaction","schéma","M3 §3.3"),
    ("Le coût de la taille du chunk","tableau","M3 §3.6")]),
  ("3.7 Top 10 des pièges et test correct",[
    ("Curseur ou pagination ; rappel : qu'est-ce qu'un curseur ?","schéma","M3 §3.5 · nouveau S10"),
    ("Les 4 conditions du streaming PostgreSQL","tableau","M3 §3.5 · nouveau S10"),
    ("Top 10 des pièges (1/2)","tableau","M3 §5"),
    ("Top 10 des pièges (2/2)","tableau","M3 §5"),
    ("Le test de contenu, pas le nombre de lignes","code","M3 §5"),
    ("Transition vers le Module 3B ou le Module 4 ; exercices","texte","M3 §6-7")]),
 ]),
 ("3B","Le catalogue des readers","Complet : Optionnel / Avancé",40,[
  ("—",[("Module 3B · Le catalogue des readers (optionnel)","section","nouveau (gabarit PPT n°26)")]),
  ("3B.1 Le catalogue des readers (et ce qui a disparu)",[
    ("Un reader, un contrat simple","texte","M3B §1.1"),
    ("Ce qui a changé depuis le livre : Hibernate, Mongo, paquets","tableau","M3B §1.2"),
    ("Le catalogue des readers par source","tableau","M3B §1.3 · nouveau S11")]),
  ("3B.2 Fichiers à plusieurs formats",[
    ("Un fichier, deux formats de ligne : `PatternMatchingCompositeLineMapper`","code","M3B §2.1")]),
  ("3B.3 Un compte et ses opérations : la rupture de contrôle",[
    ("Regrouper un compte et ses opérations : `peek`","code","M3B §2.2"),
    ("La rupture de contrôle, pas à pas","schéma","M3B §3.1 · nouveau S12"),
    ("`saveState(false)` et le reader enveloppant","texte","M3B §3.1")]),
  ("3B.4 Lire PostgreSQL par pages",[
    ("`JdbcPagingItemReader` et clé de tri unique","code","M3B §2.3"),
    ("Curseur ou pages : connexion et threads","tableau","M3B §3.3"),
    ("XML et JSON : un fragment, pas l'arbre","texte","M3B §3.2")]),
  ("3B.5 Reader personnalisé, entrées vides, erreurs",[
    ("Un reader personnalisé qui sait reprendre","code","PPT n°47 (màj) · M3B §2.4"),
    ("Échouer quand il n'y a aucune donnée","code","M3B §2.5"),
    ("Ignorer des erreurs : aperçu (détail au Module 6)","code","M3B §2.6"),
    ("Plusieurs fichiers : aucune protection au restart","schéma","M3B §3.4 · nouveau S13"),
    ("Top 10 des pièges","tableau","M3B §5"),
    ("Exercices ; transition vers le Module 4","texte","M3B §7")]),
 ]),
 ("4","Processors, scopes et proxys","Essentiel",60,[
  ("—",[("Module 4 · Processors, scopes et proxys","section","nouveau (gabarit PPT n°26)")]),
  ("4.1 Le rôle du processor : transformer, filtrer, rejeter",[
    ("Processors : transformer, filtrer, composer","schéma","PPT n°34 · nouveau S14"),
    ("Flashbacks : `return null` (Module 3), singleton (Module 2)","récapitulatif","M4 §1.2-1.3")]),
  ("4.2 Valider avec Bean Validation",[
    ("Valider les données","code","PPT n°35 (màj) · M4 §2.1")]),
  ("4.3 Transformer et enchaîner (composite)",[
    ("Le processor de transformation : sans état","code","M4 §2.2"),
    ("Enchaîner deux processors : le composite","code","PPT n°57 (màj) · M4 §2.3")]),
  ("4.4 Le processor à état et le bug du double comptage",[
    ("Le processor qui a un état : le piège","code","M4 §2.4"),
    ("Le bug du double comptage : 135,50 → 271,00 → 406,50","schéma","PPT n°58 (màj) · M4 §3.3 · nouveau S15"),
    ("Le test qui révèle le bug : deux lancements","code","M4 §2.5")]),
  ("4.5 Sous le capot : cycle de vie, proxy CGLIB, mémoire JVM",[
    ("Le cycle de vie du bean, appliqué au processor","schéma","M4 §3.1"),
    ("`@StepScope` : un proxy qui crée l'objet à la demande","schéma","M4 §3.2 · nouveau S06"),
    ("Les limites d'un proxy CGLIB : `final`, records, appels internes","tableau","M4 §3.7")]),
  ("4.6 Les trois solutions et leurs limites",[
    ("Solution 1 : pas d'état, l'`ExecutionContext`","code","M4 §3.4"),
    ("Les trois solutions comparées","tableau","M4 §3.4 · nouveau S17"),
    ("Même en `@StepScope`, le total peut être faux : le rejeu du chunk","schéma","M4 §3.6 · nouveau S16")]),
  ("4.7 `SimpleDateFormat`, tests et Top 10",[
    ("`SimpleDateFormat` partagé : un bug de concurrence","texte","M4 §3.5"),
    ("Le test qui ne vérifie pas la donnée","code","M4 §5.1"),
    ("Top 10 des pièges (1/2)","tableau","M4 §5"),
    ("Top 10 des pièges (2/2)","tableau","M4 §5"),
    ("Exercices du Module 4","texte","M4 §7")]),
 ]),
 ("5","Flux et orchestration","Essentiel",55,[
  ("—",[("Module 5 · Flux et orchestration","section","nouveau (gabarit PPT n°37)")]),
  ("5.1 Du pipeline au graphe",[
    ("Du pipeline au graphe","schéma","M5 §1.1"),
    ("Enchaîner les steps : séquence et conditions","code","PPT n°38 (màj)"),
    ("Flashbacks : statuts en base, singletons, `TaskExecutor`","récapitulatif","M5 §1.5")]),
  ("5.2 `BatchStatus` contre `ExitStatus`",[
    ("`BatchStatus` et `ExitStatus` : la distinction cruciale","schéma","M5 §1.3 · nouveau S18"),
    ("Poser un code de sortie personnalisé","code","M5 §2.2"),
    ("Comment l'`ExitStatus` est déduit quand on n'y touche pas","texte","M5 §3.2")]),
  ("5.3 Un flux conditionnel, ligne par ligne",[
    ("Un job avec un flux conditionnel","code","M5 §2.1"),
    ("Le step d'alerte à l'équipe financière","code","M5 §2.1"),
    ("Qui décide de l'échec du job ? `.end()` ou `.fail()`","texte","M5 §3.4")]),
  ("5.4 Le decider",[
    ("Le decider : aiguiller selon un résultat","code","PPT n°39 (màj) · M5 §2.3"),
    ("Pourquoi un decider n'est pas `@StepScope`","texte","M5 §3.3")]),
  ("5.5 Sous le capot : la machine à états",[
    ("La machine à états du job","schéma","M5 §3.1 · nouveau S19"),
    ("Les erreurs de configuration : « Next state not found »","tableau","M5 §3.1")]),
  ("5.6 Le `Split` et les threads",[
    ("Flows en parallèle (split)","code","PPT n°40 (màj) · M5 §2.4"),
    ("Les threads du `Split` et la barrière","schéma","M5 §3.5 · nouveau S20"),
    ("Pool de threads, pool de connexions","schéma","M5 §3.5 · nouveau S21")]),
  ("5.7 Tester les chemins et Top 10",[
    ("Top 10 des pièges (1/2)","tableau","M5 §5"),
    ("Top 10 des pièges (2/2)","tableau","M5 §5"),
    ("Exercices du Module 5","texte","M5 §7")]),
 ]),
 ("6","Fiabilité : skip, retry, restart, arrêt gracieux","Essentiel",60,[
  ("—",[("Module 6 · Fiabilité","section","nouveau (gabarit PPT n°42)")]),
  ("6.1 Trois problèmes, trois outils",[
    ("Skip, retry, restart : trois problèmes, trois outils","tableau","M6 §1.1 · nouveau S22"),
    ("Ce qui change dans Spring Batch 6 : retry de Spring Framework 7","tableau","M6 §1.2"),
    ("Flashbacks : position sauvegardée, rejeu, statut","récapitulatif","M6 §1.3")]),
  ("6.2 Skip : ignorer et consigner",[
    ("Skip : ignorer certaines erreurs","code","PPT n°43 (màj) · M6 §2.1"),
    ("Le listener de rejets : numéro de ligne et texte brut","code","M6 §2.1"),
    ("Une règle de skip sur mesure : `SkipPolicy`","code","M6 §2.1")]),
  ("6.3 Retry : la nouvelle politique de Spring Framework 7",[
    ("Retry : retenter les erreurs transitoires","code","remplace PPT n°44 + M6 §2.2"),
    ("Combiner skip et retry","code","M6 §2.3")]),
  ("6.4 Sous le capot : rollback et rejeu du chunk",[
    ("Rollback, pause, rejeu : ce qui se passe dans la transaction","schéma","M6 §3.2 · nouveau S24")]),
  ("6.5 Restart : comment Spring Batch sait où reprendre",[
    ("Restart : reprendre là où ça s'est arrêté","code","PPT n°45 (màj) · M6 §2.4"),
    ("De l'instance au contexte : où est la position","schéma","M6 §3.1 · nouveau S23"),
    ("Restart implicite et conditions de reprise","texte","M6 §2.4, §3.1")]),
  ("6.6 L'arrêt gracieux et l'exécution orpheline",[
    ("`JobExecutionShutdownHook`","code","M6 §2.5"),
    ("SIGTERM jusqu'à `STOPPED` ; `kill -9` et l'exécution orpheline","schéma","M6 §3.3-3.4 · nouveau S25")]),
  ("6.7 Top 10 et tests de fiabilité",[
    ("Top 10 des pièges (1/2)","tableau","M6 §5"),
    ("Top 10 des pièges (2/2)","tableau","M6 §5"),
    ("Les trois tests de fiabilité","code","M6 §5"),
    ("Exercices du Module 6","texte","M6 §7")]),
 ]),
 ("7","Mise à l'échelle et multi-instance","Complet : Optionnel / Avancé",70,[
  ("—",[("Module 7 · Mise à l'échelle et multi-instance (optionnel)","section","nouveau (gabarit PPT n°37)")]),
  ("7.1 Mesurer avant d'optimiser ; pourquoi passer à l'échelle",[
    ("Mesurer avant d'optimiser : CPU, mémoire, JFR","texte","M7 §1.1"),
    ("Verrouillage logique et partitionnement","tableau","PPT n°10"),
    ("Quand passer à l'échelle : volume, SLA, disponibilité","tableau","M7 §1.2")]),
  ("7.2 Le panorama des approches ; deux serveurs, deux problèmes",[
    ("Le panorama : un serveur, plusieurs serveurs","schéma","M7 §1.3 · nouveau S26"),
    ("Éviter les doublons ou se partager le travail ?","schéma","M7 §1.4 · nouveau S27"),
    ("Flashbacks : repository partagé, singleton, `Split`","récapitulatif","M7 §1.5")]),
  ("7.3 Le step multithread et ses limites",[
    ("Un step multithread","code","M7 §2.1"),
    ("Quels readers sont thread-safe ?","tableau","M7 §3.4 · nouveau S31")]),
  ("7.4 `AsyncItemProcessor` et flux parallèles",[
    ("`AsyncItemProcessor` et `AsyncItemWriter`","code","M7 §2.2")]),
  ("7.5 Le partitionnement local, ligne par ligne",[
    ("Partitions : le même step, des plages différentes","schéma","PPT n°41 (màj) · Doc officielle « Partitioned Process »"),
    ("Le découpage : `IdRangePartitioner`","code","M7 §2.3"),
    ("Le step ouvrier et le step maître","code","M7 §2.3"),
    ("Du `Partitioner` aux `StepExecution` des workers","schéma","M7 §3.2"),
    ("Le rôle du `TaskExecutor` dans le partitionnement","texte","M7 §3.5")]),
  ("7.6 Partitionnement, restart et chevauchement",[
    ("Partitionnement et reprise","schéma","M7 §3.3"),
    ("Plages sans chevauchement : le test","code","M7 §5.1 · nouveau S29")]),
  ("7.7 Distribué et remote chunking (théorie)",[
    ("Partitionnement distribué : manager, workers, messages","schéma","M7 §2.4"),
    ("Remote chunking : le maître lit, les workers traitent","schéma","M7 §2.4")]),
  ("7.8 Multi-instance : `SKIP LOCKED` et bail",[
    ("La table de travail et la réservation avec bail","code","M7 §2.5"),
    ("Deux instances et `SKIP LOCKED`","schéma","M7 §3.6 · nouveau S28")]),
  ("7.9 Concurrence sur le `JobRepository` et Top 10",[
    ("La concurrence sur le JobRepository : trois mécanismes","tableau","M7 §3.1"),
    ("Livraison en double : `OptimisticLockingFailureException`","schéma","M7 §3.1 · nouveau S30"),
    ("Débit contre nombre de threads","schéma","M7 §1.1 · nouveau S32"),
    ("Top 10 des pièges (1/2)","tableau","M7 §5"),
    ("Top 10 des pièges (2/2)","tableau","M7 §5"),
    ("Exercices du Module 7","texte","M7 §7")]),
 ]),
 ("8","Production : tests, monitoring, déploiement, cloud","Complet : Optionnel / Avancé",73,[
  ("—",[("Module 8 · Production (optionnel)","section","nouveau (gabarit PPT n°60)")]),
  ("8.1 Les trois piliers et le récapitulatif de la version 6",[
    ("Les trois piliers : tests, monitoring, déploiement","schéma","M8 §1.1 · nouveau S34"),
    ("Spring Batch 6 : ce qui change, module par module","tableau","remplace PPT n°64, 59 + M8 §1.2"),
    ]),
  ("8.2 Tester un job et un step",[
    ("Tester un job et un step : `JobOperatorTestUtils`","code","remplace PPT n°46 + M8 §2.1"),
    ("Tester un composant `@StepScope`","code","M8 §2.1"),
    ("Comment `@SpringBatchTest` fonctionne","texte","M8 §3.1")]),
  ("8.3 Le test de contenu : le piège récurrent",[
    ("Les valeurs, un total, les exclusions, deux lancements","code","M8 §2.2")]),
  ("8.4 Les métriques : celles du framework et les vôtres",[
    ("Les métriques de Spring Batch avec Micrometer","tableau","M8 §2.3"),
    ("Des compteurs et des timers métier","code","M8 §2.3"),
    ("Pull ou push : un job de 20 secondes","schéma","M8 §2.3 · nouveau S38")]),
  ("8.5 JFR et journaux structurés",[
    ("Les événements JFR de Spring Batch","schéma","M8 §3.2 · nouveau S37"),
    ("Des journaux structurés : MDC et paires clé-valeur","code","M8 §2.4")]),
  ("8.6 Un batch cloud native : les douze facteurs",[
    ("Les douze facteurs appliqués au batch","tableau","M8 §1.3")]),
  ("8.7 Lancer sans bloquer en production",[
    ("Exécuteur applicatif ou `TaskExecutorJobOperator`","tableau","M8 §2.7"),
    ("Configuration d'un lanceur asynchrone","code","M8 §2.7")]),
  ("8.8 Kubernetes : `Job`, `CronJob`, reprise",[
    ("`Job` ou `CronJob` ?","tableau","M8 §1.5"),
    ("Un `CronJob` ligne par ligne","code","M8 §2.5"),
    ("Comment Kubernetes gère un batch","schéma","M8 §3.5 · nouveau S36"),
    ("Lancer et superviser","schéma","PPT n°48 (màj)")]),
  ("8.9 Spring Cloud Data Flow et Spring Cloud Task",[
    ("Quand utiliser Data Flow et Spring Cloud Task ?","tableau","M8 §1.4"),
    ("Enregistrer, définir, lancer, superviser","code","M8 §2.6")]),
  ("8.10 Top 10 et bilan de la formation",[
    ("Top 10 des pièges (1/2)","tableau","M8 §5"),
    ("Top 10 des pièges (2/2)","tableau","M8 §5"),
    ("Les sept modules en une page","récapitulatif","M8 §1.6 · nouveau S35"),
    ("Bonnes pratiques (1/2)","tableau","PPT n°61 (màj)"),
    ("Bonnes pratiques (2/2)","tableau","PPT n°62 (màj)"),
    ("Questions d'entretien","tableau","PPT n°66 (màj)"),
    ("Exercices du Module 8","texte","M8 §7")]),
 ]),
]

FRONT = [
 ("Spring Batch : de la Tasklet au Remote Chunking","section","PPT n°1 (màj)"),
 ("Plan de la formation : 9 modules, 2 parcours","tableau","remplace PPT n°2 + README.md"),
 ("Comment suivre cette formation : Essentiel et Complet","schéma","nouveau (README.md)"),
]
BACK = [
 ("Ce qu'il faut retenir","récapitulatif","remplace PPT n°68 + M8 §1.6"),
 ("Annexe : migrer de Spring Batch 5 à 6","tableau","PPT n°65 (màj)"),
 ("Le TP fil rouge (nouvelle pile)","texte","remplace PPT n°67 : nouveau TP à venir"),
 ("À toi de jouer","texte","PPT n°69 (màj)"),
]

CUSTOM = {  # id: (module, titre, priorité VISUELS ou —, description)
 "S01":("1","ERD des 6 tables BATCH_* avec les colonnes `version`","#12","entité-relation annoté PostgreSQL ; `version` en évidence"),
 "S03":("1","Séquence du verrouillage optimiste (serveurs A et B)","#5","`UPDATE … WHERE version = ?` : 1 ligne puis 0 ligne ; version en rouge"),
 "S04":("1","La nuit interrompue : crash à 3 h 12 et reprise","—","frise temporelle (cas d'usage M1 §4.1)"),
 "S05":("2","Tasklet contre chunk","—","deux colonnes : une action, une boucle lire-traiter-écrire"),
 "S06":("2/4","Singleton contre proxy `@StepScope` (mémoire JVM)","#2","proxy permanent gris, instances éphémères bleu et vert ; animé en 4 temps"),
 "S07":("2","Double comptage de `CountingTasklet` (100 puis « 200 »)","—","chronologie courte ; annonce S15"),
 "S08":("3","Frise des transactions : commit = lignes + position","#3","3 chunks ; crash avant le commit du 3e"),
 "S09":("3","Cycle de vie d'`ItemStream`","#8","`open` → (`read` ×N, `update`, commit) ×chunks → `close`"),
 "S10":("3","Curseur contre pagination, `fetchSize` et streaming PostgreSQL","#9","redessiné (le schéma du livre n'est pas réutilisable) ; 4 conditions en pastilles"),
 "S11":("3B","Carte mentale des readers","#14","par source ; ce qui a disparu en grisé"),
 "S12":("3B","Rupture de contrôle (ACC / OP / `peek`)","#10","compte regroupé en un seul élément"),
 "S13":("3B","Restart de `MultiResourceItemReader`","#10","fichier ajouté entre deux lancements ; contre-exemple du répertoire par exécution"),
 "S14":("4","Les trois flèches du processor","#13","transformer / filtrer / rejeter avec les compteurs de `batch_step_execution`"),
 "S15":("4","Le bug du double comptage","#1","⭐ priorité n°1 ; un singleton, trois lancements, 135,50 → 271,00 → 406,50"),
 "S16":("4","Rejeu du chunk : total du processor faux, `SUM` SQL juste","#7","élément traité deux fois après un retry"),
 "S17":("4","Les trois solutions comparées","—","matrice colorée"),
 "S18":("5","`BatchStatus` et `ExitStatus` en deux voies","#11","rail technique / rail d'aiguillage ; `COMPLETED_WITH_REJECTS`"),
 "S19":("5","Machine à états du job","#4","⭐ états, transitions étiquetées, « Next state not found » en rouge"),
 "S20":("5","`Split` : threads et barrière","#6","thread 1 bleu, thread 2 vert, barrière rouge"),
 "S21":("5","Jauge du pool de connexions","#6","2 flux × 3 connexions + JobRepository"),
 "S22":("6","Skip, retry, restart : tableau et arbre de décision","—","reprend le style des diapositives 43 à 45"),
 "S23":("6","Chronologie crash puis restart","—","⭐ chunk 34 validé, crash à la ligne 3 450, reprise à la 3 401e"),
 "S24":("6","Rollback et rejeu avec pause exponentielle","—","élément 37 en rouge, rollback, pause, rejeu en vert"),
 "S25":("6","Arrêt gracieux contre `kill -9`","—","deux lignes de temps : `STOPPED` propre / `STARTED` orphelin"),
 "S26":("7","Arbre de choix des approches de mise à l'échelle","—","goulot : I/O, traitement, attente"),
 "S27":("7","Deux situations du multi-instance","—","éviter les doublons contre se partager le travail"),
 "S28":("7","Deux instances et `SKIP LOCKED`","—","⭐ lignes réservées par A (bleu), B (vert), verrouillées sautées (gris)"),
 "S29":("7","Plages de partitionnement sans chevauchement","—","4 couleurs ; cas fautif en rouge"),
 "S30":("7","Livraison en double et `OptimisticLockingFailureException`","—","deux workers sur la même partition"),
 "S31":("7","Quel reader est thread-safe ?","—","tableau en pastilles vertes et rouges"),
 "S32":("7","Débit contre nombre de threads","—","courbe qui plafonne quand l'I/O sature"),
 "S34":("8","Les trois piliers","—","tests / monitoring / déploiement"),
 "S35":("8","Récapitulatif : les 8 modules et leur piège phare","—","carte de la formation"),
 "S36":("8","Machine à états Kubernetes d'un batch","—","⭐ `restartPolicy`, `backoffLimit`, `activeDeadlineSeconds`"),
 "S37":("8","Événements JFR sur le déroulé d'un chunk et d'un partitionnement","—","11 événements placés sur le schéma"),
 "S38":("8","Pull contre push des métriques","—","job de 20 secondes, scrape de 30 secondes"),
}
# (S02 est intégré à une diapositive existante ; on le range dans la liste mais il n'a pas de diapositive propre)

OFFICIAL = [  # titre officiel vérifié, page de documentation, diapositives du plan
 ("Spring Batch Layered Architecture","Spring Batch Architecture","Module 1, « Architecture en trois couches »"),
 ("Partitioned Process","Spring Batch Architecture","Module 7, « Partitions : le même step… »"),
 ("Job Hierarchy With Steps","The Domain Language of Batch","Module 1, « Job, JobInstance, JobExecution »"),
 ("Job Parameters","The Domain Language of Batch","Module 1, « JobInstance = Job + paramètres identifiants »"),
 ("Batch Stereotypes","The Domain Language of Batch","Module 4 (rôle du processor) — à rapprocher de S14"),
 ("Job Hierarchy","The Domain Language of Batch","Module 1 (variante sans les steps)"),
]

# ---------------------------------------------------------------- 3. CONTRÔLES D'INTÉGRITÉ
def parse_sources(src):
    reuse   = {int(n) for n in re.findall(r'(?<!remplace )PPT n°(\d+)(?! \(màj\))(?!\s*,)',src) if True}
    return reuse
refs = collections.defaultdict(lambda: {"as_is":set(),"maj":set(),"remplace":set()})
slides = []   # (module, subvideo, titre, type, source)
for t,ty,src in FRONT: slides.append(("0","—",t,ty,src))
for mid,mtitle,parc,minutes,svs in PLAN:
    for sv,rows in svs:
        for t,ty,src in rows: slides.append((mid,sv,t,ty,src))
for t,ty,src in BACK: slides.append(("9","—",t,ty,src))

for mod,sv,t,ty,src in slides:
    for m in re.finditer(r'remplace PPT n°([\d, n°]+?)(?= \+|\s*·|\s*:|$)',src):
        for n in re.findall(r'\d+',m.group(1)): refs[int(n)]["remplace"].add((mod,t))
    for m in re.finditer(r'PPT n°(\d+)( \(màj\))?',src):
        pre=src[max(0,m.start()-9):m.start()]
        if 'remplace ' in pre: continue
        (refs[int(m.group(1))]["maj"] if m.group(2) else refs[int(m.group(1))]["as_is"]).add((mod,t))

errors=[]
for n,(title,status,why) in INV.items():
    r=refs.get(n,{"as_is":set(),"maj":set(),"remplace":set()})
    if n in DIVIDERS:
        continue
    if status==G and not r["as_is"]: errors.append(f"n°{n} garder : absente du plan telle quelle")
    if status==M and not r["maj"]:   errors.append(f"n°{n} mettre à jour : aucune reprise « (màj) »")
    if status==R and not r["remplace"]: errors.append(f"n°{n} remplacer : aucune diapositive « remplace PPT n°{n} »")
    if status==S and (r["as_is"] or r["maj"] or r["remplace"]): errors.append(f"n°{n} supprimer : pourtant citée")
    if status==G and (r["maj"]): errors.append(f"n°{n} garder mais citée (màj)")
    if status==M and r["as_is"]: errors.append(f"n°{n} mettre à jour mais reprise telle quelle")
used_custom=set(re.findall(r'S\d\d',' '.join(s[4] for s in slides)))
missing_custom=[k for k in CUSTOM if k not in used_custom]
unknown_custom=[k for k in used_custom if k not in CUSTOM]
for k in unknown_custom: errors.append(f"schéma {k} cité mais non défini")
for k in missing_custom: errors.append(f"schéma {k} défini mais jamais cité")
if errors:
    print("ERREURS D'INTÉGRITÉ:"); [print(" -",e) for e in errors]; sys.exit(1)
print("intégrité OK:",len(slides),"diapositives")

# ---------------------------------------------------------------- 4. RENDU MARKDOWN
def kind(src):
    if src.startswith("nouveau"): return "nouveau"
    if "(màj)" in src: return "reprise màj"
    if "remplace PPT" in src: return "remplace"
    if re.search(r'PPT n°',src): return "reprise"
    return "conversion"
def esc(s): return s.replace("|","\\|")

out=[]
A=out.append
A("# Plan du PPT final (Phase 1)\n")
A("> **Statut :** plan **validé**. Les décisions sont en §7. La production du PPT se fait module par module avec `pptx/generate_pptx.py` (Module 1 en premier).")
A("> **Sources :** `MODULE_1.md` à `MODULE_8.md` (+ `MODULE_3B_READERS.md`), `support/modules/VISUELS.md`, `REVUE_CROISEE.md` §7.3, `pptx/Spring_Batch_cours_complet.pptx` (69 diapositives, Spring Batch 5.1).")
A("> **Format :** table `N° | Sous-vidéo | Titre | Type | Source` par module (§1).\n")

# bilan rapide
cnt_status=collections.Counter(v[1] for v in INV.values())
tot=len(slides); by_kind=collections.Counter(kind(s[4]) for s in slides)
A("## 0. Synthèse\n")
A("| | |")
A("|---|---|")
A(f"| Diapositives du PPT d'origine | **69** : {cnt_status[G]} à garder · {cnt_status[M]} à mettre à jour · {cnt_status[R]} à remplacer · {cnt_status[S]} à supprimer |")
A(f"| Diapositives du **nouveau PPT** | **{tot}** (parcours Essentiel : **{sum(1 for s in slides if s[0] in ('0','1','2','3','4','5','6','9'))}**, parcours Complet : **{tot}**) |")
A(f"| Origine des diapositives du nouveau PPT | {by_kind['reprise']} reprises telles quelles · {by_kind['reprise màj']} reprises mises à jour · {by_kind['remplace']} nouvelles qui remplacent une ancienne · {by_kind['conversion']} converties depuis un module · {by_kind['nouveau']} nouvelles (séparateurs, introduction) |")
A(f"| Schémas personnalisés à créer | **{len(CUSTOM)}** (S01 à S38 sauf S02 et S33, retirés ; voir §4) ; 6 schémas officiels à insérer (§5) |")
A("| Diapositives sans équivalent dans l'original | tout ce qui concerne : verrouillage optimiste, `@EnableJdbcJobRepository`, `SKIP LOCKED`, remote chunking, Micrometer, JFR, Kubernetes |")
A("")
A("## 1. Conventions\n")
A("**Format proposé pour chaque module** (une table par module ; la colonne « Sous-vidéo » donne le découpage de production) :\n")
A("| N° | Sous-vidéo | Titre de la diapositive | Type | Source |")
A("|---|---|---|---|---|\n")
A("**Types** : `section` (séparateur de module, avec le badge de parcours) · `schéma` · `code` (construit ligne par ligne en Phase 2) · `tableau` · `texte` · `récapitulatif`. Le type `section` est ajouté aux cinq types demandés.\n")
A("**Sources** :\n")
A("| Notation | Signification |")
A("|---|---|")
A("| `PPT n°X` | diapositive d'origine **reprise telle quelle** |")
A("| `PPT n°X (màj)` | diapositive d'origine **reprise et mise à jour** (code, noms, texte) |")
A("| `remplace PPT n°X + Mx §y` | **nouvelle** diapositive, construite depuis le module, qui remplace la n°X |")
A("| `Mx §y` | diapositive **convertie depuis un module** (sans équivalent dans l'original) |")
A("| `Doc officielle « … »` | schéma officiel de la documentation Spring Batch à insérer (titre vérifié) |")
A("| `nouveau Sxx` | schéma personnalisé à créer (§4) |")
A("")
A("**Règles de construction du nouveau PPT**\n")
A("1. **Un séparateur par module**, avec le badge **Essentiel** ou **Optionnel / Avancé** (modules 3B, 7, 8) et la durée visée.")
A("2. **Un bloc de diapositives par sous-vidéo** : les sous-vidéos des modules (5 à 10 min) sont le découpage de production.")
A("3. **Chaque module se termine** par le Top 10 en deux diapositives (5 pièges chacune) puis les exercices ; les modules 3 et 3B ont en plus la transition de lecture.")
A("4. **Les notes de l'orateur** reprennent le texte du module (section correspondante) : le script vidéo n'est pas à réécrire.")
A("5. **Le code** est issu des modules (Spring Batch 6.0.6) ; toute diapositive à code d'origine périmé est dans l'inventaire (§2). Les sections marquées **(Théorique)** dans les modules portent un badge « non exécuté ».")
A("6. **Pied de page** : « Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16 · Java 25 ».")
A("7. **Une diapositive = une idée.** Un tableau de plus de 6 lignes est coupé (les Top 10 le sont déjà).\n")

A("## 2. Inventaire du PPT d'origine (69 diapositives)\n")
A("`garder` : reprise telle quelle · `mettre à jour` : reprise avec modification · `remplacer` : refaite depuis un module · `supprimer` : absente du nouveau PPT.\n")
A("| N° | Titre | Statut | Raison |")
A("|---|---|---|---|")
for n,(title,status,why) in INV.items():
    A(f"| {n} | {esc(title)} | **{status}** | {esc(why)} |")
A("")
A(f"**Bilan :** {cnt_status[G]} à garder · {cnt_status[M]} à mettre à jour · {cnt_status[R]} à remplacer (dont les 8 séparateurs) · {cnt_status[S]} à supprimer.")
A("Les huit séparateurs (n°3, 11, 19, 26, 37, 42, 49, 60) sont remplacés par les neuf séparateurs de modules. Les deux diapositives supprimées sont la n°25 (XML, déprécié ; annexe possible) et la n°63 (pièges propres aux TP d'origine, remplacés par les Top 10).\n")
A("**Diapositives « au code périmé » citées en `REVUE_CROISEE.md` §7.3** : 43, 44, 45, 46, 41, 40, 64, 17 → traitées ci-dessus (44, 46 et 64 sont **remplacées** ; 43, 45, 41, 40 et 17 **mises à jour**). Les diapositives 12 à 16, non relues en détail dans la revue, l'ont été ici : 12, 14, 15, 16 restent ; 13 est mise à jour.\n")

A("## 3. Plan détaillé du nouveau PPT\n")
A("Ordre de lecture : M1 → M2 → M3 → **M3B** → M4 → M5 → M6 → M7 → M8 (voir `README.md`).\n")
n=0
def table(rows):
    global n
    A("| N° | Titre de la diapositive | Type | Source |")
    A("|---|---|---|---|")
    for t,ty,src in rows:
        n+=1; A(f"| {n} | {esc(t)} | {ty} | {esc(src)} |")
    A("")
A("### Ouverture\n"); table(FRONT)
per_module={}
for mid,mtitle,parc,minutes,svs in PLAN:
    start=n
    A(f"### Module {mid} · {mtitle}\n")
    A(f"*Parcours : {parc} · durée visée : {minutes} min · {sum(len(r) for _,r in svs)} diapositives*\n")
    A("Sous-vidéos : " + " · ".join(f"**{sv.split()[0]}** {sv.split(' ',1)[1]}" for sv,_ in svs if sv!="—") + "\n")
    A("| N° | Sous-vidéo | Titre de la diapositive | Type | Source |")
    A("|---|---|---|---|---|")
    for sv,rows in svs:
        code = "—" if sv=="—" else sv.split()[0]
        for t,ty,src in rows:
            n+=1; A(f"| {n} | {code} | {esc(t)} | {ty} | {esc(src)} |")
    A("")
    per_module[mid]=(start+1,n,n-start,parc,minutes)
A("### Clôture et annexes\n"); table(BACK)

A("## 4. Schémas personnalisés à créer\n")
A("La colonne « Prio. » renvoie à la priorité de `VISUELS.md` §3 ; ⭐ = schéma jugé prioritaire dans les modules.\n")
A("| Id | Module | Schéma | Prio. | Description | Diapositive(s) du plan |")
A("|---|---|---|---|---|---|")
pos={}
k=0
for s in [("0","—",t,ty,src) for t,ty,src in FRONT]: pass
idx=0
for mod,sv,t,ty,src in slides:
    idx+=1
    for sid in re.findall(r'S\d\d',src): pos.setdefault(sid,[]).append(idx)
for sid,(mod,t,prio,desc) in CUSTOM.items():
    where=", ".join(f"n°{x}" for x in pos.get(sid,[])) or "—"
    A(f"| {sid} | {mod} | {esc(t)} | {prio} | {esc(desc)} | {where} |")
A("")
A("## 5. Schémas officiels à insérer\n")
A("Titres **vérifiés** (extrait de documentation fourni). Les autres schémas officiels cités dans les modules restent « à confirmer » (le site de documentation n'est pas accessible depuis l'environnement de rédaction).\n")
A("| Titre officiel | Page | Où l'insérer |")
A("|---|---|---|")
for t,p,w in OFFICIAL: A(f"| « {t} » | {p} | {w} |")
A("")
A("## 6. Bilan chiffré par module\n")
A("| Module | Diapositives | Plage de numéros | Durée visée | Min par diapositive | Parcours |")
A("|---|---|---|---|---|---|")
for mid,mtitle,parc,minutes,svs in PLAN:
    a,b,c,_,_=per_module[mid]
    A(f"| {mid} · {mtitle} | {c} | {a}–{b} | {minutes} min | {minutes/c:.1f} | {parc} |")
A(f"| Ouverture et clôture | {len(FRONT)+len(BACK)} | | | | |")
ess=len(FRONT)+len(BACK)+sum(per_module[m][2] for m in ('1','2','3','4','5','6'))
A(f"| **Total** | **{tot}** | 1–{tot} | 504 min | {504/tot:.1f} | Essentiel : {ess} diapositives · Complet : {tot} |")
A("")
A("**Intégrité (contrôle automatique) :** chaque diapositive d'origine marquée « garder », « mettre à jour » ou « remplacer » figure dans le nouveau plan avec la notation correspondante ; aucune diapositive « supprimer » n'y figure ; chaque schéma `Sxx` cité est défini et chaque schéma défini est cité au moins une fois.\n")
A("## 7. Décisions validées\n")
A("| # | Point | Décision |")
A("|---|---|---|")
A("| 1 | Volume du nouveau PPT | **validé** : support de cours dense (≈ 25 diapositives par heure) |")
A("| 2 | Diapositive n°25 (XML) | **supprimée** (configuration XML dépréciée, suppression prévue en v7) |")
A("| 3 | Diapositive n°10 (verrouillage logique) | **déplacée vers le Module 7** (concept multi-instance) |")
A("| 4 | TP fil rouge | **un seul emplacement**, en clôture |")
A("| 5 | Module 1 dense (31 diapositives) | **validé** : module d'introduction |")
A("| 6 | Schémas S02 et S33 | **retirés** (orphelins, non nécessaires) ; la diapositive « Trois questions de production » reste, sans schéma dédié |")
A("| 7 | Titres de schémas officiels « à confirmer » | **validé** : vérification à l'insertion |")
A("")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','PPT_PLAN.md'),'w').write("\n".join(out))

VISUAL = {  # S -> (état, description visuelle : formes, couleurs, disposition ; couleurs = palette du PPT d'origine)
 "S01":("**réalisé** (Module 1, diapo n°26)","six entités (bandeau coloré + corps clair) sur 2 rangées de 3 ; flèches 1 → * ; colonnes `version` en rouge"),
 "S03":("**réalisé** (Module 1, diapo n°28)","diagramme de séquence : 3 participants (bleu, vert, violet), lignes de vie en pointillés, messages fléchés ; retour vert (1 ligne) et rouge (0 ligne)"),
 "S04":("**réalisé** (Module 1, diapo n°12)","4 boîtes en ligne reliées par des flèches : 2 h 00 (vert), crash 3 h 12 (rouge), orphelin (orange), reprise (vert)"),
 "S05":("à faire (Module 2)","deux cartes côte à côte : à gauche une boîte verte « une action » ; à droite une boucle de 3 boîtes bleues lire → traiter → écrire avec flèche de retour"),
 "S06":("à faire (Modules 2 et 4)","gauche : une grande boîte rouge « singleton » à compteur ; droite : une boîte `forest` « proxy » (permanente) reliée par des flèches pointillées à 3 boîtes bleue / verte / lime (instances éphémères)"),
 "S07":("à faire (Module 2)","3 boîtes bleues « lancement 1, 2, 3 » en ligne ; au-dessus, compteur : 100 → « 200 » en rouge"),
 "S08":("à faire (Module 3)","3 rectangles verts (chunks) côte à côte ; sous chacun, un petit rectangle lime « position » ; le chunk 3 en rouge avec ovale « crash »"),
 "S09":("à faire (Module 3)","5 boîtes en ligne : open → read ×N → update → commit → close ; boucle de retour autour des 3 centrales ; vert et orange"),
 "S10":("à faire (Module 3)","deux panneaux : curseur (base bleue → 3 petits paquets lime `fetchSize` → JVM verte) et pagination (3 requêtes séparées) ; en bas, 4 ovales verts / rouges pour les conditions PostgreSQL"),
 "S11":("à faire (Module 3B)","ovale central vert « Readers » + 6 ovales satellites reliés par des traits (fichier, base, Spring Data, service, personnalisé, disparus en `forest`)"),
 "S12":("à faire (Module 3B)","colonne de 5 rectangles ACC / OP / OP / ACC / OP (bleu et vert) → flèche → deux cartes « Account » regroupées ; flèche orange `peek`"),
 "S13":("à faire (Module 3B)","deux lignes de temps : lancement 1 (fichiers 1 à 3, verts) puis restart (fichier 4 ajouté en rouge) ; en dessous, version « répertoire par exécution » en vert"),
 "S14":("à faire (Module 4)","boîte orange « processor » au centre ; trois flèches sortantes : vers le chunk (vert), vers la corbeille `null` (`forest`), vers le rollback (rouge) avec compteurs"),
 "S15":("à faire (Module 4) : priorité 1","trois boîtes bleues (lancements) alimentant une boîte rouge « singleton » à compteur 135,50 → 271,00 → 406,50 ; à droite, `@StepScope` : trois instances vertes à 135,50"),
 "S16":("à faire (Module 4)","rangée de petits carrés (chunk), l'élément 37 rouge ; flèche de rollback puis rejeu vert ; deux totaux : « processor » rouge (faux) et « SUM SQL » vert (juste)"),
 "S17":("à faire (Module 4)","tableau à 3 colonnes colorées (vert, bleu, rouge pour le reset manuel) avec 4 critères et ovales verts / rouges"),
 "S18":("à faire (Module 5)","deux rails horizontaux : `BatchStatus` (bleu : STARTED → COMPLETED) et `ExitStatus` (orange : COMPLETED_WITH_REJECTS) reliés par une flèche"),
 "S19":("à faire (Module 5) : priorité","étapes (boîtes bleues), décision (ovale orange), fins (vert, rouge) ; flèches étiquetées par motif ; chemin rouge pointillé « Next state not found »"),
 "S20":("à faire (Module 5)","un step → deux branches (flux 1 bleu, flux 2 vert) sur deux lignes → barrière rouge verticale → step final"),
 "S21":("à faire (Module 5)","rectangle « pool de connexions » divisé en 5 cases ; 2 flux × 3 connexions + repository : cases orange et rouges, pool saturé"),
 "S22":("à faire (Module 6)","arbre de décision : ovale « d'où vient l'erreur ? » → 3 branches → boîtes skip (orange), retry (bleue), restart (verte)"),
 "S23":("à faire (Module 6) : priorité","34 chunks verts (condensés) puis un chunk 35 rouge (crash à 3 450) ; flèche verte de reprise à la 3 401e ligne"),
 "S24":("à faire (Module 6)","rangée de 100 carrés, le 37e rouge ; rollback ; ovale orange « pause 200 / 400 / 800 ms » ; rejeu vert"),
 "S25":("à faire (Module 6)","deux frises : haut vert (SIGTERM → hook → chunk fini → STOPPED), bas rouge (kill -9 → STARTED orphelin)"),
 "S26":("à faire (Module 7)","ovale « goulot ? » → trois boîtes : I/O (partitionnement, vert), traitement (remote chunking, bleu), attente (multithread, orange)"),
 "S27":("à faire (Module 7)","deux colonnes : éviter les doublons (2 serveurs → un vert, un rouge) ; se partager le travail (2 serveurs → 2 moitiés)"),
 "S28":("à faire (Module 7) : priorité","colonne de 8 cases : bleues (réservées par A), vertes (par B), grises (verrouillées, sautées) ; deux flèches A et B"),
 "S29":("à faire (Module 7)","barre 1 à 10 000 en 4 couleurs sans chevauchement ; dessous, cas fautif avec zone de recouvrement rouge"),
 "S30":("à faire (Module 7)","un message → deux workers → même StepExecution ; la 2e écriture en rouge (exception)"),
 "S31":("à faire (Module 7)","tableau de 5 lignes de readers avec ovales verts / rouges (thread-safe ou non)"),
 "S32":("à faire (Module 7)","axes en traits ; courbe en 6 segments qui plafonne ; plateau en rouge"),
 "S34":("à faire (Module 8)","trois cartes (tests vert, monitoring bleu, déploiement orange) avec 2 ou 3 boîtes chacune"),
 "S35":("à faire (Module 8)","grille 2 × 4 de cartes numérotées, une par module, avec le piège phare"),
 "S36":("à faire (Module 8) : priorité","CronJob → Job → Pod ; sorties code 0 / ≠ 0 ; `restartPolicy` (OnFailure, Never), compteur `backoffLimit`, `activeDeadlineSeconds` en rouge"),
 "S37":("à faire (Module 8)","rangée chunk (read, process, write, transaction) en boîtes lime et orange ; 11 ovales d'événements placés au-dessus ; split / aggregate pour les partitions"),
 "S38":("à faire (Module 8)","ligne de temps 0 à 60 s ; bloc vert « job 20 s » ; deux traits rouges de scrape à 30 s qui le ratent ; flèche verte de push à la fin"),
}
B=[]; Bp=B.append
Bp("# Schémas à créer\n")
Bp("> Généré avec `PPT_PLAN.md` par `pptx/plan_tools/gen_plan.py`.\n")
Bp("**Stratégie (décision validée) : tout en formes natives PowerPoint**, comme le PPT d'origine. Pas d'image, pas de Manim. Chaque schéma est dessiné par `pptx/generate_pptx.py` avec `python-pptx` : rectangles arrondis, ovales, connecteurs fléchés, tableaux, texte. Palette : celle du PPT d'origine (`1D3B2A`, `10211A`, `EEF5EF`, `2E7D4F`, `6DB33F`, `E9A23B`, `D4503F`, `3F7CAC`, `8A63D2`).\n")
Bp("Outils déjà écrits dans le script : `add_box`, `add_arrow`, `add_line`, `add_schema`, `add_entity` (entité d'un schéma entité-relation), `add_sequence` (diagramme de séquence), `add_cards`, `add_table`, `add_callouts`.\n")
Bp("## 1. Schémas S01 à S38\n")
Bp("S02 et S33 sont **retirés** (décision validée). Reste **36 schémas**, dont **3 réalisés** (Module 1) : **33 à créer**.\n")
Bp("| Id | Module | Schéma | État | Description visuelle (formes, couleurs, disposition) | Diapositive(s) du plan |")
Bp("|---|---|---|---|---|---|")
for sid,(mod,t,prio,desc) in CUSTOM.items():
    et,vis=VISUAL[sid]
    where=", ".join(f"n°{x}" for x in pos.get(sid,[]))
    Bp(f"| {sid} | {mod} | {esc(t)} | {et} | {esc(vis)} | {where} |")
Bp("")
Bp("## 2. Schémas officiels à insérer (titres vérifiés)\n")
Bp("Ce sont des **images** de la documentation officielle : leur insertion reste **manuelle**. Le script place une légende « Schéma officiel à insérer » sur les diapositives concernées.\n")
Bp("| Titre officiel | Page | Où l'insérer |")
Bp("|---|---|---|")
for t,pg,w in OFFICIAL: Bp(f"| « {t} » | {pg} | {w} |")
Bp("")
Bp("## 3. Schémas du PPT d'origine\n")
Bp("Le PPT d'origine **ne contient aucune image** (0 balise `p:pic`, dossier média vide) : tous ses schémas sont déjà des formes natives (voir `pptx/assets/EXTRACTION.md`). Ils sont **redessinés** avec les mêmes outils, au fil des modules.\n")
Bp("| Diapositive d'origine | Schéma | Traitement |")
Bp("|---|---|---|")
Bp("| n°4, 9, 12, 13, 14 | lire-traiter-écrire, cinq stratégies, trois couches, schéma de référence, hiérarchie du job | **redessinés** (Module 1) |")
Bp("| n°27, 28, 29, 38, 39, 40, 41, 58 | tasklet/chunk, chunk, algorithme, flux, decider, split, partitions, double comptage | **à redessiner** dans les modules concernés (M2, M3, M5, M7, M4) |")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','ASSETS_A_CREER.md'),'w').write("\n".join(B)+"\n")
print("PPT_PLAN.md écrit :",len(slides),"diapositives;",collections.Counter(v[1] for v in INV.values()))
for mid,(a,b,c,p,mi) in per_module.items(): print(mid,c,f"{mi/c:.1f} min/diapo")
