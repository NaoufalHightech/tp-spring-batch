# Cours Spring Batch

> Synthèse construite à partir de `docs/spring_batch.pdf` (cours de D. Defrance) et du code du dépôt
> (`tp/tpSpringBatchSolution`). Versions de référence : **Java 17, Spring Boot 3.2.4, Spring Batch 5.x**.
> Le TP fil rouge qui applique ce cours est dans [`TP_FIL_ROUGE.md`](TP_FIL_ROUGE.md).

---

## 1. Pourquoi des traitements batch ?

Un *batch* est la **répétition d'un traitement sur un grand ensemble de données**, en tâche de fond.
Même à l'ère du temps réel (Kafka…), on en a besoin pour : transférer ou resynchroniser des données,
migrer des formats, vérifier la cohérence, produire des extractions et statistiques, faire des sauvegardes.

Besoins techniques :

| Besoin | Conséquence |
|---|---|
| Aucune IHM | application console, pas de partie web |
| Performance | traitement **par blocs**, parallélisme possible |
| Supervision | savoir ce qui a été fait, ce qui reste, si ça s'est bien passé |
| Fiabilité | **reprise** d'un lot en échec, transaction par lot |
| Déclenchement | un batch n'est pas un *scheduler* ; un scheduler (Quartz, cron…) le lance |

## 2. Architecture de Spring Batch

Spring Batch est une extension de Spring Framework spécialisée dans le batch. Trois couches :

```
┌──────────────────────────────────────────────┐
│ Application      → NOTRE code (jobs, steps…) │
├──────────────────────────────────────────────┤
│ Batch Core       → Job, Step, JobLauncher,   │
│                    JobRepository…            │
├──────────────────────────────────────────────┤
│ Batch Infrastructure → ItemReader/Writer,    │
│                    fichiers, BDD, transactions│
└──────────────────────────────────────────────┘
```

Apports : configuration en Java (historiquement XML), écriture par gros blocs, **suivi persistant**
du déroulement, support de nombreux supports (CSV/plats, XML, JSON, JDBC…).

### 2.1 Le modèle « chunk » : lecture unitaire, écriture par bloc

```java
List items = new ArrayList();
for (int i = 0; i < commitInterval; i++) {
    items.add(itemReader.read());      // 1 élément à la fois
}                                      // (+ processor.process(item) pour chacun)
itemWriter.write(items);               // écriture groupée, dans UNE transaction
```

```java
public interface ItemReader<T>  { T read() throws Exception; }
public interface ItemWriter<T>  { void write(Chunk<? extends T> items) throws Exception; } // Chunk en v5 (List avant)
public interface ItemProcessor<I,O> { O process(I item) throws Exception; }                // null = élément filtré
```

Une transaction = un chunk. Si l'écriture du chunk échoue, **tout le chunk est annulé** (rollback) :
c'est la base de la fiabilité.

### 2.2 Vocabulaire

| Élément | Rôle |
|---|---|
| `Job` | Tâche batch complète (un enchaînement de steps) |
| `Step` | Étape d'un job. Deux types : **tasklet** ou **chunk** |
| `Tasklet` | Action unique (hello world, procédure stockée, ménage de fichiers…) |
| `ItemReader / ItemProcessor / ItemWriter` | Lire / transformer (ou filtrer) / écrire |
| `JobLauncher` | Lanceur de job |
| `JobRepository` | Référentiel de suivi (tables `BATCH_*`) |
| `ExecutionContext` | « sac de propriétés » persisté, sert à passer des données et à **redémarrer** |

### 2.3 Job, JobInstance, JobExecution

```
Job                  = le type de tâche (code/config)           ex : fromCsvToXmlJob
 └─ JobInstance      = Job + JobParameters identifiants          ex : fromCsvToXmlJob + inputFilePath=a.csv
     └─ JobExecution = une tentative réelle d'exécution          1 instance → 1..n exécutions (restart)
         └─ StepExecution = exécution d'un step
```

* Deux `JobInstance` doivent différer par **au moins un `JobParameter`**. D'où le paramètre
  `timeStampOfJobInstance = System.currentTimeMillis()` ajouté partout dans le TP.
* `JobExecution` : `status` (`BatchStatus` : STARTED, COMPLETED, FAILED, STOPPED…), `ExitStatus`
  (code retourné à l'appelant, ex. `"COMPLETED"`), `startTime`, `endTime`, `ExecutionContext`.
* `StepExecution` ajoute des **compteurs** : `readCount`, `writeCount`, `commitCount`, `rollbackCount`,
  `filterCount`, `readSkipCount`, `processSkipCount`, `writeSkipCount`.

> ⚠️ **BatchStatus ≠ ExitStatus.** Le `BatchStatus` pilote le **redémarrage** ; l'`ExitStatus` pilote
> l'**aiguillage** (flows conditionnels).

#### Schéma de référence (documentation officielle)

Un `JobOperator` pilote un `Job` ; un `Job` a 1..* `Step` ; chaque `Step` a exactement **un** `ItemReader`, un `ItemProcessor` optionnel
et **un** `ItemWriter` ; `JobOperator`, `Job` et `Step` lisent/écrivent leurs métadonnées dans le `JobRepository`.

#### Exemple EndOfDay (JobInstance, paramètres, exécutions)

* `Job` EndOfDay → *une* `JobInstance` **par date** (job + paramètre identifiant `schedule.date`) → *plusieurs* `JobExecution` (tentatives).
* Relancer le 01-01 après un échec : **même instance, nouvelle exécution**. Seule une exécution `COMPLETED` ferme l'instance.

| JOB_EXEC_ID | JOB_INST_ID | paramètre | STATUS |
|---|---|---|---|
| 1 | 1 | 2017-01-01 | FAILED |
| 2 | 1 | 2017-01-01 (relance) | COMPLETED |
| 3 | 2 | 2017-01-02 | COMPLETED |

Relancer une instance **déjà en cours** lève `JobExecutionAlreadyRunningException`. Chaque `Step` a sa `StepExecution` (rattachée à une `JobExecution`),
avec compteurs et `ExecutionContext` (ex. `{piece.count=40321}` dans `BATCH_STEP_EXECUTION_CONTEXT`) : c'est ce qui permet de reprendre où l'on s'est arrêté.
Il existe un `ExecutionContext` par `JobExecution` (sauvegardé entre les steps) et un par `StepExecution` (sauvegardé à chaque commit) ; les entrées doivent être sérialisables.

### 2.4 Historique

| Version | Apport |
|---|---|
| 1.x (2008) | configuration XML |
| 2.x | NoSQL, configuration Java |
| 3.x / 4.x | Spring 4/5, Java 8, JSR-352 |
| **5.x** | **Spring 6, Java 17 minimum, Jakarta EE** ; fin des `MapJobRepository` |

En v5, le `JobRepository` **exige une base de données** (au minimum H2 en mémoire).

### 2.5 Architecture en couches (vue d'ensemble)

```
┌────────────────────────────────────────────┐
│ Application : jobs et code des développeurs │ ← notre code (readers, processors, config)
├────────────────────────────────────────────┤
│ Batch Core : Job, Step, JobLauncher/Operator │ ← lancer et contrôler un job
├────────────────────────────────────────────┤
│ Batch Infrastructure : ItemReader/Writer,   │ ← briques communes, RetryTemplate
│ RetryTemplate…                              │   (utilisées par l'application ET par le cœur)
└────────────────────────────────────────────┘
```

`JobOperator` est le point d'entrée de la version 6 ; le dépôt (Spring Batch 5.1) utilise `JobLauncher`.

### 2.6 Principes généraux d'un bon batch (documentation officielle)

| Principe | Pourquoi | Ce que ça évite |
|---|---|---|
| Minimiser les E/S (faire un maximum en mémoire, analyser le SQL) | première source de coût | relire à chaque transaction, scans inutiles, `WHERE` sans clé |
| Ne pas faire les choses deux fois (incrémenter les totaux au fil de l'eau) | un total recalculé relit tout | un second passage complet |
| Toujours supposer le pire sur les données (validation, totaux de contrôle, ligne de fin) | une donnée non contrôlée est suspecte | un fichier tronqué accepté comme complet |
| Tester la charge tôt, avec des volumes réalistes | un batch grossit avec le temps | découvrir la limite en production |
| Sauvegarder aussi les fichiers, et tester la restauration | les fichiers plats sont oubliés | un batch dépendant de fichiers perdus |
| Rester simple, données et traitement proches, briques communes avec l'en ligne | complexité = risque | des batchs monolithiques ingérables |

### 2.7 Stratégies de traitement

* **Briques standard** : conversion, validation, extraction, extraction/mise à jour, traitement et mise à jour, mise en forme de sortie ; utilitaires : tri, répartition, fusion.
* **Sources d'entrée** : base de données, fichier, messages.
* **Stratégies (du plus simple au plus complexe)** : traitement normal en fenêtre batch → batch concurrent avec l'en ligne → jobs en parallèle → **partitionnement** → combinaison.
  Même dans le cas simple, prévoir des **points de validation et la reprise** (un unique commit final est douloureux à faire évoluer).
* **Verrouillage logique** : *optimiste* (horodatage relu dans le `WHERE` de l'`UPDATE`, peu de conflits) plutôt pour l'en ligne ; *pessimiste* (drapeau/verrou à la lecture) plutôt pour le batch ; **même schéma pour toutes les applications** qui touchent la donnée.
* **Partitionnement** (même job, plusieurs instances, chacune sur sa part, puis fusion). Approches : parts égales, colonne clé, vues, indicateur de traitement, extraction vers fichiers, colonne de hachage. À **valider avant lancement** : partitions couvrant toute la plage, sans trou, chacune limitée à ses données ; décider du sort des autres partitions si l'une échoue ; prévoir attente/retry en cas d'interblocage.

## 3. Mise en place du projet

### 3.1 Dépendances (Spring Boot, recommandé)

```xml
<dependency>spring-boot-starter-batch</dependency>
<dependency>com.h2database:h2 (runtime)</dependency>       <!-- JobRepository -->
<dependency>spring-boot-starter-test (test)</dependency>
<dependency>spring-batch-test (test)</dependency>
<!-- XML : spring-oxm + xstream + jakarta.xml.bind-api + jaxb-runtime -->
<!-- JSON : jackson-databind -->
```

Sans Spring Boot : `spring-context`, `spring-jdbc`, `spring-batch-core`, `jakarta.annotation-api`
et `@EnableBatchProcessing` + déclaration explicite de `JobRepository` / `JobLauncher`.

### 3.2 Configuration du JobRepository

`application.properties` :

```properties
spring.batch.jdbc.initialize-schema=always     # crée les tables BATCH_* au 1er démarrage
spring.datasource.url=jdbc:h2:~/jobRepositoryDb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.batch.job.enabled=false                  # on lance nous-mêmes les jobs
```

Avec Spring Boot, `JobRepository`, `JobLauncher`, `DataSource` et `PlatformTransactionManager`
sont **auto-configurés**. Règle d'or : si l'application a plusieurs `DataSource`, celle de Spring Batch
doit être `@Primary` + `@BatchDataSource` (voir `AutomaticSpringBootBatchJobRepositoryConfig`).
Les autres bases (ex. `productdb`) sont des datasources **secondaires**, repérées par `@Qualifier`.

## 4. Définir et lancer un job

### 4.1 Tasklet + step + job (Java)

```java
public class PrintMessageTasklet implements Tasklet {
    public RepeatStatus execute(StepContribution c, ChunkContext ctx) {
        System.out.println(message);
        return RepeatStatus.FINISHED;          // CONTINUABLE = rappeler la tasklet
    }
}

Step step = new StepBuilder("simplePrintMessageStep", jobRepository)
        .tasklet(tasklet, transactionManager).build();

Job job = new JobBuilder("myHelloWorldJob", jobRepository).start(step).build();
```

### 4.2 Step orienté chunk

```java
new StepBuilder("stepCsvToConsole", jobRepository)
    .<Product, Product>chunk(5, transactionManager)   // taille du chunk = commit interval
    .reader(reader).processor(processor).writer(writer)
    .build();
```

### 4.3 Lancement

* **Ligne de commande** : un `CommandLineRunner` récupère le job par son nom dans l'`ApplicationContext`
  et appelle `jobLauncher.run(job, jobParameters)`.
* **Test JUnit** : `@SpringBatchTest` + `JobLauncherTestUtils` (§ 9).
* **Planifié / supervisé** : scheduler (Quartz, cron), ou Spring Cloud Data Flow (§ 11).

### 4.4 Configuration XML (variante)

Le même job peut être déclaré en XML (`<job>`, `<step>`, `<tasklet>`, `<chunk>`) puis importé avec
`@ImportResource`. Le dépôt montre les deux styles, activés par le profil Spring `xmlJobConfig`.

## 5. Lire et écrire des fichiers

| Format | Reader | Writer |
|---|---|---|
| CSV / texte | `FlatFileItemReader` (+ `DelimitedLineTokenizer`, `BeanWrapperFieldSetMapper`) | `FlatFileItemWriter` (+ `FlatFileHeaderCallback`) |
| Positions fixes | `FlatFileItemReader` + `FixedLengthTokenizer` | idem |
| Format hybride | `LineMapper` personnalisé (ex. `ProductWithDetailsLineMapper`) | — |
| JSON | `JsonItemReader` | `JsonFileItemWriter` + `JacksonJsonObjectMarshaller` |
| XML | `StaxEventItemReader` + `Jaxb2Marshaller` | `StaxEventItemWriter` |
| JDBC | `JdbcCursorItemReader`, `JdbcPagingItemReader` | `JdbcBatchItemWriter` |

Exemple fidèle au dépôt (`MyCsvFileProductReaderConfig`) :

```java
new FlatFileItemReaderBuilder<Product>()
    .name("productCsvFileReader")
    .resource(new FileSystemResource(inputFilePath))
    .linesToSkip(1)                       // ligne d'en-tête
    .delimited().delimiter(";")
    .names("id","main_category","label","price","time_stamp","features")
    .targetType(Product.class)
    .build();
```

## 6. Paramètres et scopes

Un job reçoit des `JobParameters` (`addString`, `addLong`, `addDouble`…). Pour les injecter dans les beans :

```java
@Bean @JobScope                       // ou @StepScope
FlatFileItemReader<Product> reader(@Value("#{jobParameters['inputFilePath']}") String path) { … }
```

* `@StepScope` / `@JobScope` : le bean est **créé au démarrage du step/job** (late binding), ce qui rend
  possible `#{jobParameters[...]}`, `#{stepExecution}`, `#{stepExecutionContext[...]}`.
* Les `JobParameters` identifiants définissent la `JobInstance` → relancer avec les mêmes paramètres
  sur une instance déjà `COMPLETED` est refusé.
* Un `JobParametersValidator` peut valider la présence/les formats.

## 7. Processeurs : transformer, filtrer, composer

* `process()` retourne l'objet transformé, **ou `null` pour filtrer** (compté dans `filterCount`).
* Enchaînement de plusieurs processeurs : `CompositeItemProcessor`.
* Un processeur `@StepScope` peut lire des paramètres et écrire dans le `ExecutionContext` du step
  (c'est ainsi que le TP compte les produits modifiés).

## 8. Flux entre steps (« flow »)

```java
// séquentiel
job.start(step1).next(step2).next(step3)

// conditionnel sur ExitStatus
job.start(step1).on("FAILED").to(stepErreur)
   .from(step1).on("*").to(step2).end()

// conditionnel via un decider (logique Java arbitraire)
job.start(step1).next(decider)
   .on("COMPLETED_WITH_MANY_UPDATED").to(stepMany)
   .from(decider).on("COMPLETED").to(stepFew)
   .end()
```

`JobExecutionDecider.decide(jobExecution, stepExecution)` retourne un `FlowExecutionStatus` libre
(chaîne de texte) qui sert d'aiguillage. Autres outils : `StepExecutionListener.afterStep()` pour
modifier l'`ExitStatus`, `stop()`, `fail()`, `end()`.

### 8.1 Exécution parallèle par partitions

Principe *manager / workers* :

```
managerStep ──► Partitioner.partition(gridSize)
                 └─ Map<nom, ExecutionContext>  (from/to par partition)
                        │
        ┌───────────────┼───────────────┐
   workerStep #1    workerStep #2   …   (un thread chacun, via TaskExecutor)
   reader @StepScope lit #{stepExecutionContext[from]} … [to]
```

Le `Partitioner` découpe le travail (ex. plages d'`id`), chaque worker reçoit son `ExecutionContext`.
Attention : les readers doivent être **thread-safe** ou propres à chaque partition
(`JdbcPagingItemReader` + `@StepScope`, pas un `JdbcCursorItemReader` partagé).

## 9. Tests

```java
@SpringBatchTest
@SpringBootTest(classes = MyTestConfig.class)
class TestMyJob {
    @Autowired JobLauncherTestUtils utils;
    @Autowired Job job;
    @Test void ok() throws Exception {
        utils.setJob(job);
        JobExecution exec = utils.launchJob(params);
        assertEquals("COMPLETED", exec.getExitStatus().getExitCode());
    }
}
```

* `@SpringBatchTest` fournit `JobLauncherTestUtils` et `JobRepositoryTestUtils`.
* On teste un **job complet** (`launchJob`) ou un **step isolé** (`launchStep("nomDuStep")`).
* Le dépôt factorise tout dans `AbstractBasicTestJobHelper` / `AbstractBasicActiveTestJob` : paramètres
  par défaut, nettoyage (`removeJobExecutions`), comparaison fichier généré vs fichier attendu
  (`data/expected_output`), hook `postJobCheckings()`.

## 10. Gestion des erreurs

### 10.1 Skip — ignorer certaines erreurs

```java
.faultTolerant().skipLimit(5).skip(ItemReaderException.class)
.listener(new MySkippedErrorsListener())      // SkipListener : onSkipInRead / Process / Write
```

Les lignes illisibles (ex. `LINE_WITH_ERROR` → `FlatFileParseException`, sous-classe de
`ItemReaderException`) sont ignorées et tracées, le job continue tant que `skipLimit` n'est pas dépassé.

### 10.2 Retry — retenter

`.faultTolerant().retryLimit(3).retry(MyProcessException.class)` + `backOffPolicy` :
pour les erreurs **transitoires** (réseau, verrou BDD). Depuis Spring Batch 2.2 le retry vient de la
bibliothèque **Spring Retry**. Par défaut : `NoBackOffPolicy` (aucune pause) ; `ExponentialBackOffPolicy`
espace les tentatives ; un `RetryListener` est facultatif.

**Constaté en exécution** (`tp/tpComplements`, Spring Batch 5.1) : avec un processeur qui échoue 2 fois par
élément, le job se termine `COMPLETED` mais le processeur est appelé **11 fois pour 3 éléments** et le step
compte **6 rollbacks** : chaque échec annule le chunk, qui est **rejoué en entier**. Avec 5 échecs par
élément et `retryLimit(3)`, le job finit `FAILED` après 3 appels. Sans `faultTolerant()`, le premier échec
suffit à faire échouer le step. Le « bug en configuration Java » signalé dans le PDF ne s'est **pas**
reproduit ici avec `.retryLimit(3).retry(...)`.

### 10.3 Restart — reprendre un job échoué

Conditions pour qu'un redémarrage soit possible :

1. demande **explicite** (`jobOperator.restart(executionId)` ou relance avec les mêmes `JobParameters`) ;
2. le `BatchStatus` du step est **`FAILED` ou `STOPPED`** (pas l'`ExitStatus` !).

Réglages utiles : `startLimit(n)` (nombre max de démarrages), `allowStartIfComplete(true)`
(rejouer un step déjà réussi), job non restartable (`preventRestart()`).
Les readers/writers **`ItemStream`** (fichiers, JDBC cursor…) enregistrent leur position dans le
`ExecutionContext` (table `BATCH_STEP_EXECUTION_CONTEXT`) : au restart, la lecture reprend **là où elle
s'était arrêtée**.

Le dépôt simule un arrêt avec `MyStoppedForRestartExecutionListener`, qui force
`stepExecution.setStatus(BatchStatus.STOPPED)` dans `afterStep`.

## 11. Composants personnalisés, lancement et supervision

* **Reader personnalisé** : générer un jeu de données (`ProductWithDetailsGeneratorReader` +
  `DataSetGeneratorJobConfig`). Si le reader garde un état, implémenter `ItemStream`.
* **Writer personnalisé** : `SimpleObjectWriter` (affichage console), ou écriture vers plusieurs cibles.
* **Lancement** : scheduler (Quartz/cron/`@Scheduled`) ou **Spring Cloud Data Flow**.
* **Monitoring** : tables `BATCH_JOB_INSTANCE / BATCH_JOB_EXECUTION / BATCH_STEP_EXECUTION…`,
  consoles H2, Spring Cloud Data Flow (tableaux de bord, historique, relance).
* **Logging** : `log4j2`/`logback`, listeners de job/step pour tracer début, fin, compteurs.
* **Patterns batch** : chunk idempotent, reprise, partitionnement, fichiers d'erreurs/rejets,
  séparation lecture/transformation/écriture.

## 12. Aide-mémoire

| Je veux… | J'utilise… |
|---|---|
| une action unique | `Tasklet` |
| traiter beaucoup d'enregistrements | step `chunk(n)` + reader/processor/writer |
| un fichier d'entrée/sortie variable | `@JobScope`/`@StepScope` + `jobParameters` |
| filtrer un élément | `process()` retourne `null` |
| aiguiller selon un résultat | `JobExecutionDecider` ou `on("…").to(…)` |
| ignorer des lignes en erreur | `faultTolerant().skip(...).skipLimit(n)` |
| reprendre après plantage | `BatchStatus` FAILED/STOPPED + `startLimit` + `ItemStream` |
| aller plus vite | partitions (`Partitioner` + `TaskExecutor`) |
| tester | `@SpringBatchTest` + `JobLauncherTestUtils` |

---

## 13. Nouveautés de Spring Batch 6 (documentation officielle, non exécutée ici)

Dépendances : Spring Framework 7.0, Spring Integration 7.0, Spring Data 4.0, Spring LDAP/AMQP/Kafka 4.0, Micrometer 1.16.
Notre dépôt est en **Spring Boot 3.2.4 / Spring Batch 5.1.x** : tout ce qui suit est à planifier, pas à appliquer tel quel.

| Nouveauté v6 | Ce que ça change | Impact sur notre TP |
|---|---|---|
| Infrastructure simplifiée | `JobRepository` étend `JobExplorer` ; `JobOperator` étend `JobLauncher` ; `JobRegistry` et gestionnaire de transaction optionnels | `JobLauncher` → `JobOperator` |
| Annotations | `@EnableBatchProcessing` (attributs communs) + `@EnableJdbcJobRepository` / `@EnableMongoJobRepository` ; `DefaultBatchConfiguration` « sans ressource » (`ResourcelessJobRepository`, plus d'H2 obligatoire) | la règle « pas d'`@EnableBatchProcessing` » vaut pour Batch 5 + Boot 3 |
| `ChunkOrientedStep` (stable) | remplace `TaskletStep`/`ChunkOrientedTasklet` ; retry basé sur Spring Framework 7 (plus Spring Retry) ; skip via `SkipPolicy` | `.faultTolerant().skipLimit(5).skip(...)` à migrer |
| Nouveau modèle de concurrence | producteur-consommateur, file bornée ; local chunking, remote step, SEDA (Spring Integration) | partitions toujours valables |
| Exploitation | `CommandLineJobOperator`, `JobOperator.recover`, `StoppableStep`, arrêt en douceur, événements JFR | plus de correction SQL manuelle |
| Dépréciations | namespace XML `batch:…` (suppression prévue en 7.0), `modular = true`, JUnit 4, Jackson 2 | profil `xmlJobConfig`, `jackson-databind` |
| Autres | annotations JSpecify, Jackson 3, configuration par lambdas (`.delimited(config -> …)`) | — |

Voir le guide de migration officiel avant toute montée de version.

---

## 14. Compléments du cours du formateur (exécutés dans `tp/tpComplements`)

### 14.1 Fichier à positions fixes
`FlatFileItemReaderBuilder.fixedLength().columns(new Range(1,34), …).names(…)`. Les bornes sont **1-based
et inclusives**. Piège constaté : en mode strict (par défaut) une ligne **plus longue** que la dernière
colonne (« false » après une colonne calée sur « true ») ou **plus courte** déclenche
`IncorrectLineLengthException` ; on règle avec `.strict(false)` ou on cale la dernière colonne sur le cas le plus long.

### 14.2 Format hybride
Deux cas du cours :
- **lignes de types différents** (en-tête, détail…) : `PatternMatchingCompositeLineMapper` avec un tokenizer
  et un `FieldSetMapper` par motif (`"H*"`, `"D*"`) ;
- **colonne qui se décompose** : un `LineMapper` personnalisé tokenise la ligne avec `;`, puis applique un
  `FixedLengthTokenizer` au numéro de sécurité sociale (15 chiffres) et un `DelimitedLineTokenizer("!")` à l'adresse.

### 14.3 Valider les paramètres et comprendre les instances
`new DefaultJobParametersValidator(requis, optionnels)` posé avec `.validator(...)` : un paramètre requis
absent fait refuser le lancement. Relancer avec **les mêmes** paramètres un job déjà `COMPLETED` lève
`JobInstanceAlreadyCompleteException` ; ajouter un paramètre qui change (`timeStampOfJobInstance`) crée une nouvelle instance.

### 14.4 Filtrer et composer
Un processeur qui retourne `null` **filtre** l'élément (`filterCount`, pas une erreur). `CompositeItemProcessor`
enchaîne les processeurs. Exemple exécuté : 3 lus, 1 filtré, 2 écrits.

### 14.5 Composants personnalisés et patterns
- Reader qui **délègue** à un sous-reader : implémenter `ItemStreamReader`, ouvrir/fermer le sous-reader dans
  `open`/`close` (le step appelle ce cycle de vie) ; idem pour un writer.
- Writer en **deux tables** : `GeneratedKeyHolder` récupère la clé auto-incrémentée de la 1re insertion pour la 2e.
- En Spring Batch 5, `write(Chunk<? extends T>)` remplace `write(List<…>)` de la version 4.

### 14.6 Logging
Un listener (`JobExecutionListener` + `StepExecutionListener`) et slf4j tracent début, fin, compteurs lus/écrits/filtrés
à chaque exécution : c'est la base du suivi quand il n'y a ni interface ni utilisateur.

### 14.7 Lancement et supervision (résumé du cours, **non exécuté**)
Un job se lance par un **scheduler** (Quartz, cron) ou par **Spring Cloud Data Flow** (qui enregistre
l'application, la lance et affiche l'historique). Une application Spring Batch n'a que la responsabilité de
démarrer le job en console et de produire des logs ; la supervision est externe.
