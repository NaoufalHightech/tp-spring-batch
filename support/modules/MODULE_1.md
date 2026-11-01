# Module 1 · Fondations et environnement de production

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Durée vidéo visée :** 40 à 45 min, en 5 sous-vidéos de 5 à 9 min (voir la fin).
> **Statut du code :** `[Code fourni - Théorique / Non testé en local par l'IA]`.
> Une seule réserve : avant la consigne d'arrêt, une première version de ce code a été exécutée une fois
> (4 tests verts sur 5, détail en §3.4). Cela n'engage pas le reste : à vous de l'exécuter et de me faire un retour.
> Projet de référence : `tp/tpProd`.

---

## 1. Le concept

### 1.1 Pourquoi un batch a besoin d'un « environnement de production »

Un job qui tourne bien sur un poste de développeur ne dit rien de sa tenue en production. Trois questions décident :

| Question | Ce qui répond |
|---|---|
| Que s'est-il passé cette nuit, et où le job s'est-il arrêté ? | les **métadonnées** stockées par le `JobRepository` |
| Deux serveurs peuvent-ils lancer le même job en même temps ? | le **verrouillage** fondé sur ces mêmes métadonnées |
| Peut-on reprendre sans tout rejouer ni doubler les données ? | l'**état** de chaque step (`ExecutionContext`) |

Les trois réponses reposent sur une base de données **durable et partagée** : c'est le rôle de PostgreSQL ici.
Une base en mémoire (H2) convient aux tests, jamais à la production : elle disparaît avec le processus.

### 1.2 Le vocabulaire (à connaître avant tout code)

```
Job ───────────── la recette (nom + liste de steps)
 └─ JobInstance ── la recette appliquée à des paramètres identifiants (ex. runDate=2026-11-01)
     └─ JobExecution ─ une tentative d'exécution (peut échouer, puis être reprise)
         └─ StepExecution ─ une tentative d'un step (compteurs lus / écrits / filtrés, état)
             └─ ExecutionContext ─ la « sauvegarde de partie » du step (ex. ligne 12 000 atteinte)
```

Règle d'or : **JobInstance = Job + JobParameters identifiants.** Deux lancements avec les mêmes paramètres
identifiants désignent la **même** instance ; si elle est déjà terminée avec succès, Spring Batch refuse de la rejouer.

### 1.3 Les trois couches

```
┌───────────────────────────────────────────────┐
│ Application     NOTRE code : jobs, steps…     │
├───────────────────────────────────────────────┤
│ Batch Core      Job, Step, JobOperator,       │
│                 JobRepository                 │
├───────────────────────────────────────────────┤
│ Infrastructure  ItemReader / ItemWriter,      │
│                 fichiers, transactions        │
└───────────────────────────────────────────────┘
```

### 1.4 Ce qui a changé dans Spring Batch 6 (Boot 4)

Constaté en inspectant les dépendances et les classes de la 6.0.6 :

- Boot 4.1.2 embarque **Spring Batch 6.0.6** via `spring-boot-starter-batch-jdbc`.
- **Les paquets ont bougé** : `org.springframework.batch.core.job.Job`, `…core.job.parameters.JobParameters`,
  `…core.step.Step`, et les readers/writers dans `org.springframework.batch.infrastructure.item.*`.
  Tout import copié d'un tutoriel Spring Batch 4/5 est faux.
- **`JobOperator` étend `JobLauncher`** et offre `start(Job, JobParameters)`, `restart`, `stop`, `abandon`, `recover`.
- **`JobRepository` étend `JobExplorer`** : lecture et écriture des métadonnées passent par une seule interface.
- **`@EnableJdbcJobRepository`** déclare le dépôt JDBC (attributs : `dataSourceRef`, `transactionManagerRef`,
  `tablePrefix`, `isolationLevelForCreate`, `databaseType`, `validateTransactionState`, etc.).

---

## 2. Le code, ligne par ligne

### 2.1 `pom.xml` (extrait)

`[Code fourni - Théorique / Non testé en local par l'IA]`

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>4.1.2</version>                                     <!-- 1 -->
</parent>
<properties><java.version>25</java.version></properties>       <!-- 2 -->
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch-jdbc</artifactId>    <!-- 3 -->
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>                        <!-- 4 -->
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch-jdbc-test</artifactId> <!-- 5 -->
    <scope>test</scope>
  </dependency>
</dependencies>
```

1. Le parent Boot fixe toutes les versions compatibles : on n'écrit **aucune** version de Spring Batch à la main.
2. Compile en Java 25 (le JDK doit être le 25).
3. Starter qui apporte Spring Batch **et** le support JDBC pour persister les métadonnées.
4. Pilote PostgreSQL, nécessaire uniquement à l'exécution (`runtime`).
5. Outils de test (`JobOperatorTestUtils`, etc.) : jamais dans l'application livrée.

### 2.2 `application.properties`

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/batchdb}  # 1
spring.datasource.username=${DB_USER:batch}                                # 2
spring.datasource.password=${DB_PASSWORD}                                  # 3
spring.batch.job.enabled=false                                             # 4
spring.batch.jdbc.initialize-schema=never                                  # 5
```

1. Syntaxe `${VARIABLE:valeur_par_défaut}` : en production, l'URL vient de l'environnement, pas du dépôt Git.
2. Idem pour l'utilisateur : un compte **dédié** au batch, sans droits d'administration.
3. **Aucun défaut** pour le mot de passe : il ne doit jamais figurer dans le code.
4. Empêche Boot de lancer tous les jobs au démarrage ; on les lance explicitement (voir §2.5).
5. `never` en production : le schéma est créé par un outil de migration (Flyway/Liquibase) versionné, pas
   par l'application. `always` est acceptable **en développement** seulement (c'était le réglage de mon projet de test).

### 2.3 `BatchInfraConfig` : le dépôt PostgreSQL

`[Code fourni - Théorique / Non testé en local par l'IA]`

```java
@Configuration                                                 // 1
@EnableJdbcJobRepository(                                      // 2
    dataSourceRef = "dataSource",                              // 3
    transactionManagerRef = "transactionManager",              // 4
    tablePrefix = "BATCH_")                                    // 5
public class BatchInfraConfig { }                              // 6
```

1. Classe de configuration Spring : ses annotations sont lues au démarrage du contexte.
2. Déclare un `JobRepository` **JDBC** (Spring Batch 6 ; remplace la configuration manuelle de l'ère 4/5).
3. Nom du bean `DataSource` à utiliser : celui que Boot crée à partir des propriétés ci-dessus.
4. Nom du `PlatformTransactionManager` qui encadre l'écriture des métadonnées.
5. Préfixe des tables. Utile pour héberger plusieurs applications dans un même schéma (`APP1_JOB_INSTANCE`…).
6. Aucune méthode : l'annotation suffit.

> **Isolation de création : on ne la change pas.** `isolationLevelForCreate` vaut **SERIALIZABLE par défaut**
> (documentation Spring Batch). Mon premier jet de test posait `READ_COMMITTED` : c'était une erreur, voir le piège n°3.

### 2.4 Un premier job : tasklet, step, job

`[Code fourni - Théorique / Non testé en local par l'IA]`

```java
@Configuration
public class HelloJobConfig {

  private static final Logger log = LoggerFactory.getLogger(HelloJobConfig.class);   // 1

  @Bean
  Tasklet helloTasklet() {                                                           // 2
    return (contribution, chunkContext) -> {                                         // 3
      log.info("Bonjour depuis {}", contribution.getStepExecution().getStepName());  // 4
      return RepeatStatus.FINISHED;                                                  // 5
    };
  }

  @Bean
  Step helloStep(JobRepository repo, PlatformTransactionManager tx, Tasklet helloTasklet) {  // 6
    return new StepBuilder("helloStep", repo)                                        // 7
        .tasklet(helloTasklet, tx)                                                   // 8
        .build();                                                                    // 9
  }

  @Bean
  Job helloJob(JobRepository repo, Step helloStep) {                                 // 10
    return new JobBuilder("helloJob", repo)                                          // 11
        .start(helloStep)                                                            // 12
        .build();                                                                    // 13
  }
}
```

1. Journal slf4j : en batch, les logs sont souvent la seule interface.
2. Un `Tasklet` est une action unique, exposée comme bean pour être testable seul.
3. Lambda : `Tasklet` n'a qu'une méthode (`execute`), c'est une interface fonctionnelle.
4. Le `StepContribution` donne accès à la `StepExecution` en cours (nom, compteurs).
5. `FINISHED` : le step est terminé. `CONTINUABLE` relancerait la tasklet dans une nouvelle transaction.
6. Spring injecte le `JobRepository` du §2.3 et le gestionnaire de transactions.
7. Le **nom du step** est la clé sous laquelle ses exécutions sont enregistrées.
8. La tasklet s'exécute dans **une transaction** gérée par `tx`.
9. `build()` produit le `Step` immuable.
10. Les paramètres du bean sont résolus par injection : pas de `new`.
11. Le **nom du job** (`helloJob`) identifie la recette dans `BATCH_JOB_INSTANCE`.
12. `start(...)` désigne le premier step.
13. `build()` produit le `Job`.

### 2.5 Lancer le job par une API : record et pattern matching

`[Code fourni - Théorique / Non testé en local par l'IA]`

```java
public record RunRequest(String runDate) { }                                   // 1

public record RunResult(long executionId, String status) {                    // 2
  static RunResult of(JobExecution ex) {
    return new RunResult(ex.getId(), switch (ex.getStatus()) {                // 3
      case COMPLETED -> "TERMINÉ";
      case FAILED, STOPPED -> "À REPRENDRE";
      default -> ex.getStatus().name();
    });
  }
}

@RestController
class RunController {
  private final JobOperator jobOperator; private final Job helloJob;
  RunController(JobOperator jobOperator, Job helloJob) { this.jobOperator = jobOperator; this.helloJob = helloJob; }

  @PostMapping("/jobs/hello")                                                  // 4
  RunResult run(@RequestBody RunRequest req) throws Exception {
    var params = new JobParametersBuilder()                                    // 5
        .addString("runDate", req.runDate())                                   // 6
        .toJobParameters();
    return RunResult.of(jobOperator.start(helloJob, params));                  // 7
  }
}
```

1. Un **record** (Java 16+) : porteur de données immuable, sans getters à écrire. Idéal pour une requête REST.
2. Même idée pour la réponse.
3. `switch` en **expression** sur l'énumération `BatchStatus` : le compilateur vérifie que tous les cas sont couverts
   (ici via `default`). Plus sûr qu'une cascade de `if`.
4. **POST**, pas GET : lancer un job modifie l'état (un GET doit pouvoir être rejoué sans effet, par un navigateur ou un robot).
5. `JobParametersBuilder` : fabrique des paramètres typés.
6. `runDate` est un paramètre **identifiant** : c'est lui qui définit la `JobInstance`.
7. `JobOperator.start(Job, JobParameters)` lance de façon synchrone et renvoie la `JobExecution` terminée.
   Pour un job long, on utilisera un exécuteur asynchrone (Module 8) : sinon la requête HTTP reste bloquée.

*(Dépendance `spring-boot-starter-web` à ajouter pour cet extrait.)*

---

## 3. Plongée « sous le capot »

### 3.1 Ce que le `JobRepository` écrit réellement

Le schéma créé dans PostgreSQL (observé lors de mon exécution) : **6 tables** et **3 séquences**.

| Table | Une ligne par… | Contient surtout |
|---|---|---|
| `batch_job_instance` | job + paramètres identifiants | nom du job, clé de hachage des paramètres |
| `batch_job_execution` | tentative de job | statut, code de sortie, début/fin, **`version`** |
| `batch_job_execution_params` | paramètre d'une exécution | nom, type, valeur, `identifying` |
| `batch_job_execution_context` | exécution de job | contexte sérialisé du job |
| `batch_step_execution` | tentative de step | compteurs lu/écrit/filtré/rollback, statut, **`version`** |
| `batch_step_execution_context` | exécution de step | la « sauvegarde de partie » du step |
| *séquences* `batch_job_instance_seq`, `batch_job_execution_seq`, `batch_step_execution_seq` | | identifiants générés |

Chaque transition (démarrage, fin de chunk, fin de step…) est **écrite en base immédiatement** : si le serveur
est coupé, la base connaît le dernier point confirmé. C'est ce qui rend la reprise possible.

### 3.2 Comment un lancement est vérifié

Au lancement, le dépôt :

1. cherche la `JobInstance` correspondant au nom et aux paramètres identifiants (via la clé de hachage) ;
2. si elle existe et qu'une exécution est **en cours**, lève `JobExecutionAlreadyRunningException` ;
3. si elle existe et est **terminée avec succès**, lève `JobInstanceAlreadyCompleteException` ;
4. sinon, crée une nouvelle `JobExecution`.

Ces lectures puis cette création **ne forment pas une opération atomique** par nature : deux serveurs pourraient
passer l'étape 1 en même temps. C'est la raison d'être de `isolationLevelForCreate = SERIALIZABLE` : la
création est exécutée sous l'isolation la plus stricte de PostgreSQL, qui fait **échouer l'une des deux
transactions concurrentes** (erreur de sérialisation, SQLSTATE `40001`). Le perdant reçoit une exception :
c'est le comportement voulu, le lancement doit alors être retenté ou abandonné.

### 3.3 Le verrouillage optimiste, pas à pas

Les lignes `batch_job_execution` et `batch_step_execution` portent une colonne **`version`**. Principe :

```
Serveur A lit  l'exécution 42 : version = 3
Serveur B lit  l'exécution 42 : version = 3
A écrit :  UPDATE … SET …, version = 4  WHERE id = 42 AND version = 3   → 1 ligne modifiée  ✔
B écrit :  UPDATE … SET …, version = 4  WHERE id = 42 AND version = 3   → 0 ligne modifiée  ✘
           → OptimisticLockingFailureException
```

Aucun verrou de base n'est tenu pendant la lecture (d'où « optimiste » : on parie sur l'absence de conflit
et on le détecte à l'écriture). Avantage : pas de blocage. Coût : le perdant doit gérer l'échec.

Vu dans le code de la classe `JdbcJobExecutionDao` (inspection du bytecode de la 6.0.6) : la mise à jour
exécute un `UPDATE … WHERE … AND VERSION = ?` ; si aucune ligne n'est touchée, elle lève
`OptimisticLockingFailureException` ; sinon elle incrémente la version en mémoire.

### 3.4 Ce que j'ai observé, et la correction que cela impose

Exécution unique (JDK 25, Boot 4.1.2, Batch 6.0.6, PostgreSQL 16.15) :

| Test | Résultat |
|---|---|
| le schéma `BATCH_*` est créé dans PostgreSQL | **vert** (6 tables, 3 séquences) |
| un job laisse ses traces (statut `COMPLETED/COMPLETED`, 1 step, 1 paramètre) | **vert** |
| mêmes paramètres relancés → `JobInstanceAlreadyCompleteException` ; autre `runDate` → autre instance | **vert** |
| 2e lancement pendant que le 1er tourne → `JobExecutionAlreadyRunningException` | **vert** |
| 2 copies périmées de la même exécution : la 2e `update` lève `OptimisticLockingFailureException` | **rouge** : aucune exception |

**Interprétation du test rouge (hypothèse à confirmer par vous).** Dans `JdbcJobExecutionDao`, j'ai relevé une
méthode qui compare la `VERSION` en base à celle de l'objet en mémoire ; si elles diffèrent, elle **recopie la
version de la base** (et ne fait que monter le statut, jamais le baisser). Cette synchronisation existe pour
qu'un ordre d'arrêt posé depuis un autre processus ne soit pas écrasé. Si le dépôt l'appelle avant chaque
`update(JobExecution)`, la copie « B » est rafraîchie juste avant l'écriture, donc l'`UPDATE` réussit et **aucune
exception n'est levée**. Mon test supposait donc à tort que « copie périmée = échec ». Je n'ai pas confirmé que
le dépôt appelle bien cette synchronisation avant chaque `update` ; le test correct doit viser une vraie course
(deux écritures qui s'entrecroisent) ou le niveau `StepExecution`. **Ne retenez pas** « la 2e écriture échoue
toujours » : retenez que le verrouillage optimiste **existe** (colonne `version`, clause `WHERE`, exception) mais
qu'il est **atténué par la synchronisation du statut**.

> Conséquence pour le test livré : `verrouillage_optimiste_sur_la_ligne_d_execution` doit être désactivé
> (`@Disabled`) ou réécrit avant d'être publié. Il est désactivé dans `tp/tpProd`.

### 3.5 Pourquoi le `JobRepository` est un singleton sans danger

Le `JobRepository` est un bean **singleton** (une seule instance pour toute l'application). Cela ne pose aucun
problème car il est **sans état métier** : il ne conserve rien entre deux appels, tout l'état vit en base.
Retenez l'opposition qui sera au cœur du Module 4 : *un singleton sans état est sûr ; un singleton qui garde un
total ou un compteur en mémoire ne l'est pas.*

---

## 4. Cas d'usage

### 4.1 Le traitement de nuit interrompu

Un job de rapprochement bancaire démarre à 2 h 00. À 3 h 12, le serveur redémarre (mise à jour du système).
Au matin :

- la base PostgreSQL indique une exécution restée à l'état `STARTED` mais dont le processus n'existe plus ;
- on la déclare `FAILED` (ou on l'abandonne) via `JobOperator.abandon(...)` / `recover(...)`, puis on **relance** : le
  step reprend à la dernière position confirmée (`ExecutionContext`) au lieu de repartir de zéro (Module 6).

Sans `JobRepository` persistant, ce scénario signifie : « on rejoue 10 Go depuis le début et on espère ne pas
écrire deux fois les mêmes lignes ».

### 4.2 Deux serveurs, un seul traitement

Deux instances de l'application tournent derrière un répartiteur. Une tâche planifiée déclenche `helloJob` sur
les deux à 2 h 00 avec le même `runDate`. Grâce à la vérification de §3.2 et à l'isolation de création, **une**
exécution démarre ; l'autre échoue proprement. Sans cela : deux traitements concurrents, données en double.

### 4.3 L'audit

« Quel a été le résultat du job d'hier, combien de lignes ont été écrites, combien rejetées ? » : la réponse est
une requête SQL sur `batch_step_execution` (`read_count`, `write_count`, `filter_count`, `skip_count`), sans
rien ajouter à l'application.

---

## 5. Pièges : le Top 10 (avec flashbacks)

> Module 1 : pas de flashback vers un module précédent. Le « flashback » de ce module est une **annonce** :
> chaque piège indique le module qui l'approfondit.

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| 1 | `initialize-schema=always` en production | l'application crée/modifie des tables au démarrage ; droits excessifs | `never` + Flyway/Liquibase |
| 2 | `JobRepository` en mémoire (H2) en production | aucune reprise après redémarrage, aucune trace | PostgreSQL persistant |
| 3 | Abaisser `isolationLevelForCreate` pour « éviter les erreurs de sérialisation » | **deux lancements concurrents possibles** : on a supprimé la protection | garder SERIALIZABLE, **gérer** l'erreur (nouvelle tentative, alerte) |
| 4 | Relancer avec les mêmes paramètres | `JobInstanceAlreadyCompleteException` | un paramètre identifiant qui change (date métier) ou `startNextInstance` |
| 5 | Mettre l'horodatage courant en paramètre identifiant « pour que ça marche » | chaque relance est une **nouvelle** instance : plus de reprise possible | paramètre métier stable (`runDate`) ; horodatage en paramètre **non identifiant** |
| 6 | `spring.batch.job.enabled` laissé à `true` | tous les jobs partent au démarrage de l'application | `false` + lancement explicite (Module 8) |
| 7 | Exécution restée `STARTED` après un crash | le job refuse de repartir (`AlreadyRunning`) | `abandon` / `recover` après vérification que rien ne tourne vraiment |
| 8 | Ne jamais purger les `BATCH_*` | tables énormes, requêtes lentes | purge planifiée (par date de fin) |
| 9 | Imports copiés de Spring Batch 4/5 | erreurs de compilation (`core.Job` → `core.job.Job`) | utiliser les paquets 6.x (§1.4) |
| 10 | Lancer un job long dans la requête HTTP | requête bloquée, délai dépassé | exécuteur asynchrone (Module 8) |

**Bug silencieux typique :** un test qui passe sur H2 parce que le comportement de verrouillage n'existe pas
(ou est trivial) en mémoire. Tout test de **concurrence ou de reprise** doit tourner sur PostgreSQL.

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 1.1 | Pourquoi un batch de production ? | 6 min | §1.1, cas d'usage 4.1 |
| 1.2 | Le vocabulaire en un schéma | 7 min | §1.2-1.3, JobInstance = Job + paramètres |
| 1.3 | Le projet : Boot 4, Batch 6, PostgreSQL | 9 min | §2.1-2.3, `@EnableJdbcJobRepository` ligne par ligne |
| 1.4 | Votre premier job et son lancement | 9 min | §2.4-2.5 |
| 1.5 | Sous le capot : les tables, les versions, l'isolation | 9 min | §3 |
| 1.6 | Top 10 des pièges | 6 min | §5 |
| | **Total** | **≈ 46 min** | |

## 7. Ce qu'il reste à faire de votre côté

1. Exécuter `tp/tpProd` sur PostgreSQL (`mvn test`) et me renvoyer le résultat.
2. Réécrire le test de verrouillage optimiste (course réelle ou niveau `StepExecution`) : voir §3.4.
3. Confirmer l'effet de `SERIALIZABLE` sur deux lancements réellement simultanés (deux JVM).
