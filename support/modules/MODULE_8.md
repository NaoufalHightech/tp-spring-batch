# Module 8 · Production : tests, monitoring, déploiement et cloud

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Complet : **Optionnel / Avancé**. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 65 à 70 min, en 9 sous-vidéos de 5 à 9 min (voir la fin).
> **Prérequis :** tous les modules précédents : ce dernier module les rassemble.
> Projet de référence : `tp/tpProd`.
>
> **Légende :** les parties marquées **(Théorique)** donnent le code ou la configuration à partir des classes de Spring Batch 6.0.6 et de la documentation des outils, mais n'ont pas été exécutées.
> Les lignes `🖼️ [RÉFÉRENCE PPT]` renvoient aux diapositives du PPT du cours.
>
> **Source :** chapitre 12 (« Cloud Native Batch ») de *The Definitive Guide to Spring Batch*, M. T. Minella, **reformulé et adapté** ; les exemples (Spring Cloud Config, Eureka, Hystrix) y datent de Spring Batch 4 et ne sont pas repris tels quels.

---

## 1. Le concept

### 1.1 Les trois piliers de la production

Un job qui « fonctionne » n'est pas un job **exploitable**. Trois piliers le rendent exploitable :

| Pilier | Question à laquelle il répond | Outils de ce module |
|---|---|---|
| **Tests** | « Ce que je livre fait-il ce que je crois ? » | `@SpringBatchTest`, `JobOperatorTestUtils`, tests de **contenu** |
| **Monitoring** | « Que s'est-il passé cette nuit, et suis-je prévenu quand ça tourne mal ? » | Micrometer, JFR, journaux structurés, alertes |
| **Déploiement** | « Où et comment ça s'exécute, redémarre, s'arrête ? » | Kubernetes (`Job`, `CronJob`), Spring Cloud Data Flow |

> 🖼️ [RÉFÉRENCE PPT] : Utiliser les diapositives **« Tester un job et un step »** (n°46), **« Composants personnalisés, logs et patterns »** (n°47) et **« Lancer et superviser »** (n°48).

### 1.2 Spring Batch 6 : le récapitulatif des nouveautés

Ce que la formation a relevé dans les jars **6.0.6** :

| Nouveauté | Module | Remarque |
|---|---|---|
| Paquets déplacés (`core.job.*`, `infrastructure.item.*`) | 1 | tout import copié d'une version 4/5 est faux |
| `JobOperator` étend `JobLauncher` ; `start`, `restart`, `stop`, `abandon`, `recover` | 1, 2, 6 | `TaskExecutorJobOperator` pour un lancement asynchrone |
| `@EnableJdbcJobRepository` | 1 | dépôt de métadonnées JDBC déclaré par annotation |
| `ChunkOrientedStep` : `chunk(n)` ; **`chunk(n, tx)` déprécié pour suppression** | 3 | le gestionnaire de transactions se donne par `.transactionManager(tx)` |
| Retry de **Spring Framework 7** (`RetryPolicy.builder()`), plus Spring Retry | 6 | `backOffPolicy(...)` supprimé du builder |
| `JobExecutionShutdownHook` | 6 | arrêt gracieux à la réception d'un signal |
| `taskExecutor(...)` attend un `AsyncTaskExecutor` ; partitionnement « Manager » | 7 | « Master » n'existe plus |
| **Événements JFR** natifs | 8 | §3.2 |
| **Métriques et observations Micrometer** | 8 | §2.3 |
| **`JobOperatorTestUtils`** ; **`JobLauncherTestUtils` déprécié pour suppression** | 8 | §2.1 |

> 🖼️ [RÉFÉRENCE PPT] : Utiliser les diapositives **« Spring Batch 6 : les nouveautés »** (n°64) et **« Impact sur notre TP (Spring Batch 5 → 6) »** (n°65). Le code qu'elles affichent est à aligner sur ce récapitulatif.

### 1.3 Une application « cloud native » : les douze facteurs appliqués au batch

Le chapitre 12 du livre rappelle les **douze facteurs** (une méthode pour des applications adaptées au cloud). Pour un batch :

| Facteur | Ce que cela signifie pour un job | Module |
|---|---|---|
| **Config** dans l'environnement | URL, utilisateur, secrets viennent de variables d'environnement, pas du jar | 1 |
| **Services externes** attachés | la base PostgreSQL est une ressource configurée, pas codée | 1 |
| **Processus sans état** | l'état vit dans le `JobRepository` ; un job échoué sur un nœud peut reprendre sur un autre | 1, 6 |
| **Concurrence** par les processus | on monte en charge par instances, pas seulement par threads | 7 |
| **Jetable** (démarrage rapide, arrêt gracieux) | SIGTERM sans perte ; relancement sans surprise | 6 |
| **Parité** dev / prod | tester sur **PostgreSQL**, pas sur une base en mémoire | 8 |
| **Journaux** en flux | tout sur la sortie standard, collectés ailleurs | 8 |
| **Tâches d'administration** ponctuelles | un batch est souvent *lui-même* cette tâche | 8 |

### 1.4 Quand utiliser Spring Cloud Data Flow et Spring Cloud Task ?

- **Spring Cloud Task** donne à une application qui **se termine** (un batch) un **référentiel de tâches** : début, fin, code de sortie, paramètres, erreur. On l'active avec `@EnableTask`.
- **Spring Cloud Data Flow** est un **serveur d'orchestration** : on y **enregistre** des applications, on **définit** des tâches, on les **lance**, on les **planifie**, on les **supervise** dans un tableau de bord (onglets Tâches, Jobs, exécutions).

| Votre contexte | Choix |
|---|---|
| 1 à 5 jobs, une plateforme Kubernetes | **`CronJob` Kubernetes** + métriques ; pas besoin de Data Flow |
| Beaucoup de jobs, besoin d'un **tableau de bord central**, d'audit, de lancement par des non-développeurs | **Spring Cloud Data Flow** |
| Lancement dynamique de workers pour un partitionnement (Module 7) | Spring Cloud Task (`DeployerPartitionHandler`) |

> **Compatibilité avec Spring Boot 4 : à vérifier** pour Spring Cloud Task et Spring Cloud Data Flow avant tout choix : leurs versions suivent un calendrier distinct de celui de Spring Boot.

### 1.5 Kubernetes : un `Job` ou un `CronJob` ?

| | `Job` | `CronJob` |
|---|---|---|
| Rôle | exécuter **une fois** un traitement jusqu'à son succès | créer des `Job` **selon un horaire** |
| Quand | traitement ponctuel, migration, déclenchement par un outil | traitement **récurrent** (nuit, fin de mois) |
| Réglages clés | `backoffLimit`, `activeDeadlineSeconds`, `ttlSecondsAfterFinished`, `restartPolicy` | `schedule`, `timeZone`, **`concurrencyPolicy`**, `startingDeadlineSeconds`, historiques |

Un batch ne se déploie **jamais** comme un `Deployment` (qui redémarre un processus terminé, même réussi) : c'est un traitement **fini**.

### 1.6 Flashback : les sept modules en une page

| Module | À retenir | Piège phare |
|---|---|---|
| **1** · Fondations | `JobInstance = Job + paramètres identifiants` ; le `JobRepository` en PostgreSQL rend tout reprenable et verrouillable | isolation de création abaissée |
| **2** · Premier job | singleton, proxy `@StepScope`, `JobOperator`, `spring.batch.job.enabled` | job long lancé dans la requête HTTP |
| **3** · Chunk | un chunk = une transaction ; la position est sauvegardée **avec** les données | `OutOfMemoryError`, curseur sans auto-commit désactivé |
| **4** · Processors | processor sans état ; `return null` filtre | **double comptage** du singleton |
| **5** · Flux | `BatchStatus` ≠ `ExitStatus` ; decider ; `Split` | `ExitStatus` non aiguillé |
| **6** · Fiabilité | skip (donnée), retry (transitoire), restart (crash), arrêt gracieux | skip silencieux |
| **7** · Échelle | mesurer avant d'optimiser ; partitionnement ; `SKIP LOCKED` | plages qui se chevauchent |
| **8** · Production | tests de **contenu**, métriques, journaux, Kubernetes | **test vert avec des données fausses** |

---

### Références visuelles (§1 Concept)

> Légende : « ✔ vérifié » = titre relevé dans l'extrait de documentation officielle fourni ; « ◻ à confirmer » = page citée, titre à contrôler avant d'insérer l'image.

**1. Schéma officiel de la documentation Spring Batch**
- ◻ à confirmer : page *What's New in Spring Batch 6* (synthèse des nouveautés) ; pages Spring Cloud Data Flow (« Spring Cloud Data Flow architecture » dans le livre, à retrouver dans la documentation officielle de Data Flow).
- Pour Kubernetes : documentation officielle de Kubernetes (page *Jobs* et *CronJob*), schémas à vérifier sur place.

**2. Schéma ASCII à garder (script vidéo)**
- §1.1 : les trois piliers ; §1.6 : le tableau de récapitulation.

**3. Schéma personnalisé à créer pour le PPT**
- **⭐ Frise de la nuit d'un batch** : CronJob → pod → job → métriques → alerte, avec les Modules 1 à 7 placés sur le trajet.
- **Les trois piliers** (tests, monitoring, déploiement) en trois colonnes.
- **Récapitulatif de la formation** : une carte des 8 modules avec le piège phare de chacun.

---

## 2. Le code, ligne par ligne

### 2.1 Tester le job complet et un step isolé

> En 6.0.6, **`JobLauncherTestUtils` est déprécié pour suppression** ; son remplaçant, `JobOperatorTestUtils`, offre `startJob(...)` et `startStep(...)` et le prolonge. On enseigne la nouvelle classe.

```java
@SpringBootTest                                                                     // 1
@SpringBatchTest                                                                    // 2
class BankJobIT {

  @Autowired JobOperatorTestUtils jobTestUtils;                                     // 3
  @Autowired Job bankJob;
  @Autowired JdbcTemplate jdbc;

  @BeforeEach
  void prepare() {
    jobTestUtils.setJob(bankJob);                                                   // 4
    jdbc.update("DELETE FROM bank_transaction");                                    // 5
  }

  @Test
  void le_job_charge_les_bonnes_donnees() throws Exception {
    var params = jobTestUtils.getUniqueJobParametersBuilder()                       // 6
        .addString("inputFile", "src/test/resources/transactions.csv")
        .toJobParameters();

    JobExecution execution = jobTestUtils.startJob(params);                         // 7

    assertThat(execution.getStatus()).isEqualTo(BatchStatus.COMPLETED);             // 8
    StepExecution step = execution.getStepExecutions().iterator().next();
    assertThat(step.getReadCount()).isEqualTo(5);                                   // 9
    assertThat(step.getFilterCount()).isEqualTo(1);
    assertThat(step.getWriteCount()).isEqualTo(4);
  }
}
```

1. Contexte Spring complet, branché sur **PostgreSQL** (parité avec la production, §3.1).
2. `@SpringBatchTest` active les utilitaires de test de Spring Batch et la prise en charge des beans `@StepScope` et `@JobScope` dans les tests.
3. L'utilitaire qui lance un job ou un step.
4. Avec plusieurs jobs dans le contexte, on désigne explicitement celui à tester.
5. **Un état de départ connu** : un test qui dépend du test précédent est un test faux.
6. Des paramètres **uniques** : chaque test crée une nouvelle `JobInstance` (Module 1) et ne bute pas sur « déjà terminée ».
7. Lance le job **et attend** sa fin.
8. Le statut technique du job.
9. Les **compteurs** de la `StepExecution` : lus 5, filtrés 1, écrits 4 (Module 3).

**Tester un seul step**, sans rejouer tout le job :

```java
@Test
void le_step_de_chargement_isole() throws Exception {
  JobExecution execution = jobTestUtils.startStep("loadBankStep");                 // 1
  assertThat(execution.getStatus()).isEqualTo(BatchStatus.COMPLETED);
}
```

1. Exécute **uniquement** ce step : on diagnostique plus vite, et on évite d'attendre les steps voisins.

**Tester un composant `@StepScope`** (par exemple le reader) hors d'un job :

```java
StepExecution stepExecution = MetaDataInstanceFactory.createStepExecution(            // 1
    new JobParametersBuilder().addString("inputFile", "src/test/resources/transactions.csv").toJobParameters());

List<RawTransaction> rows = StepScopeTestUtils.doInStepScope(stepExecution, () -> {   // 2
  bankCsvReader.open(new ExecutionContext());
  var all = new ArrayList<RawTransaction>();
  for (RawTransaction row; (row = bankCsvReader.read()) != null; ) all.add(row);
  bankCsvReader.close();
  return all;
});
assertThat(rows).hasSize(5);
```

1. Fabrique une `StepExecution` factice portant les paramètres.
2. Exécute le code **dans un scope « step » actif** : sans cela, `#{jobParameters[...]}` n'est pas résolu (Module 2).

### 2.2 Le test de contenu : vérifier les **valeurs**, pas le nombre de lignes

C'est le piège n°9, récurrent depuis le Module 3. Un test qui ne vérifie que `COMPLETED` et `count = 4` reste vert avec une base remplie de données fausses.

```java
@Test
void les_valeurs_en_base_sont_exactes() throws Exception {
  jobTestUtils.startJob(uniqueParamsFor("transactions.csv"));

  // 1. le contenu d'une ligne précise, champ par champ
  Map<String, Object> first = jdbc.queryForMap(
      "SELECT account_number, transaction_date, transaction_type, amount FROM bank_transaction WHERE id = 1");
  assertThat(first.get("account_number")).isEqualTo("FR7612345");
  assertThat(((Timestamp) first.get("transaction_date")).toLocalDateTime())
      .isEqualTo(LocalDateTime.of(2026, 10, 1, 9, 15));                             // la date est CONVERTIE
  assertThat((BigDecimal) first.get("amount")).isEqualByComparingTo("120.50");

  // 2. un total calculé : une colonne oubliée le ferait échouer
  assertThat(jdbc.queryForObject("SELECT SUM(amount) FROM bank_transaction", BigDecimal.class))
      .isEqualByComparingTo("2486.25");

  // 3. la ligne filtrée n'est PAS en base
  assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM bank_transaction WHERE id = 4", Integer.class)).isZero();
}

@Test
void deux_lancements_ne_doublent_pas_les_totaux() throws Exception {                // Module 4
  jobTestUtils.startJob(uniqueParamsFor("transactions.csv"));
  var first = analytics.compute();
  jobTestUtils.startJob(uniqueParamsFor("transactions.csv"));
  assertThat(analytics.compute()).isEqualTo(first);
}
```

La grille d'un bon test de job : **statut**, **compteurs** (lus, filtrés, écrits, ignorés), **valeurs** d'au moins une ligne complète, **un total**, **les exclusions**, et **deux lancements**.

### 2.3 Les métriques avec Micrometer

**Ce que Spring Batch publie déjà** (noms relevés dans le jar 6.0.6) :

| Métrique / observation | Contenu |
|---|---|
| `spring.batch.job` | durée d'un job |
| `spring.batch.job.launch.count` | nombre de lancements |
| `spring.batch.step` | durée d'un step |
| `spring.batch.item.read` / `spring.batch.item.process` | durée de lecture / de traitement par élément |
| `spring.batch.chunk.write` | durée d'écriture d'un chunk |

Les étiquettes (*tags*) portent le nom du job, du step, son statut (`spring.batch.job.name`, `spring.batch.step.name`, `spring.batch.step.status`, …). **Pour les activer**, on donne le registre d'observations aux builders (ils offrent tous `observationRegistry(...)`) :

```java
@Bean
Job bankJob(JobRepository jobRepository, Step loadBankStep, ObservationRegistry observationRegistry) {
  return new JobBuilder("bankJob", jobRepository)
      .observationRegistry(observationRegistry)                                      // 1
      .start(loadBankStep)
      .build();
}
```

1. Avec `spring-boot-starter-actuator` dans le projet, Spring Boot fournit le `ObservationRegistry` ; il est branché sur les systèmes de métriques (Prometheus, OTLP…). Le même mécanisme alimente le **traçage distribué**.

**Des métriques métier**, que le framework ne connaît pas :

```java
@Component
public class BankMetricsListener implements StepExecutionListener {

  private final MeterRegistry registry;                                              // 1

  public BankMetricsListener(MeterRegistry registry) { this.registry = registry; }

  @Override
  public ExitStatus afterStep(StepExecution stepExecution) {
    String step = stepExecution.getStepName();

    Counter.builder("bank.transactions.rejected")                                    // 2
        .tag("step", step)
        .description("Lignes filtrées ou ignorées")
        .register(registry)
        .increment(stepExecution.getFilterCount() + stepExecution.getSkipCount());   // 3

    Timer.builder("bank.load.duration")                                              // 4
        .tag("step", step)
        .register(registry)
        .record(BatchMetrics.calculateDuration(stepExecution.getStartTime(), stepExecution.getEndTime())); // 5

    return stepExecution.getExitStatus();                                            // 6
  }
}
```

1. Le registre Micrometer, fourni par Spring Boot.
2. Un **compteur** : une valeur qui ne fait que croître (lignes rejetées).
3. On y ajoute les lignes filtrées et ignorées de ce step.
4. Un **timer** : une durée, avec nombre, somme et maximum.
5. `BatchMetrics.calculateDuration(début, fin)` (classe de Spring Batch) calcule la durée.
6. Un listener `afterStep` **retourne** le code de sortie : on rend celui qui existe, inchangé (Module 5).

**Les alertes qui comptent**, plus que les graphiques :

| Alerte | Signal |
|---|---|
| **Le job n'a pas réussi à l'heure attendue** | absence de `spring.batch.job` réussi avant 6 h |
| Un job a **échoué** | `spring.batch.job.status = FAILED` |
| **Durée anormale** | `spring.batch.job` p95 > 2× la normale |
| **Trop de rejets** | `bank.transactions.rejected` / lus > seuil |

> **Un batch est de courte durée.** Si Prometheus **interroge** (pull) le pod toutes les 30 secondes, un job de 20 secondes **disparaît avant d'être lu**. Il faut **pousser** les métriques (passerelle *Pushgateway*, ou export OTLP) ou les lire dans le référentiel (`batch_job_execution`).

### 2.4 Des journaux structurés

```java
@Component
public class StructuredLoggingListener implements JobExecutionListener {

  private static final Logger log = LoggerFactory.getLogger(StructuredLoggingListener.class);

  @Override
  public void beforeJob(JobExecution jobExecution) {
    MDC.put("jobName", jobExecution.getJobInstance().getJobName());                   // 1
    MDC.put("jobExecutionId", String.valueOf(jobExecution.getId()));
    log.atInfo().addKeyValue("params", jobExecution.getJobParameters().toString())    // 2
       .log("job démarré");
  }

  @Override
  public void afterJob(JobExecution jobExecution) {
    for (StepExecution step : jobExecution.getStepExecutions()) {
      log.atInfo()                                                                    // 3
         .addKeyValue("step", step.getStepName())
         .addKeyValue("read", step.getReadCount())
         .addKeyValue("write", step.getWriteCount())
         .addKeyValue("filtered", step.getFilterCount())
         .addKeyValue("skipped", step.getSkipCount())
         .log("step terminé");
    }
    log.atInfo().addKeyValue("status", jobExecution.getStatus().name()).log("job terminé");
    MDC.clear();                                                                      // 4
  }
}
```

1. Le **MDC** attache des champs à **chaque** ligne de journal du thread courant : on retrouve toutes les lignes d'une exécution par son identifiant.
2. L'API fluide de SLF4J 2 ajoute des **paires clé-valeur** : elles deviennent des champs, pas du texte à analyser.
3. Un **récapitulatif par step** : les compteurs du framework, déjà prêts.
4. On nettoie, pour ne pas polluer le thread suivant.

Dans `application.properties`, `logging.structured.format.console=ecs` (ou `logstash`) produit du **JSON** sur la sortie standard : prêt pour l'agrégation.
**Limite :** le MDC est **propre au thread** ; dans un step multithread ou partitionné (Module 7), les threads secondaires **n'héritent pas** de ces champs.

### 2.5 Déployer sur Kubernetes **(Théorique)**

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: bank-load
spec:
  schedule: "0 2 * * *"                    # 1  tous les jours à 2 h
  timeZone: "Europe/Paris"                 # 2
  concurrencyPolicy: Forbid                # 3
  startingDeadlineSeconds: 600             # 4
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      backoffLimit: 2                      # 5
      activeDeadlineSeconds: 7200          # 6
      ttlSecondsAfterFinished: 86400       # 7
      template:
        spec:
          restartPolicy: OnFailure         # 8
          terminationGracePeriodSeconds: 120   # 9
          containers:
            - name: bank-load
              image: registry.example.com/bank-load:1.0.0
              env:
                - name: DB_URL
                  valueFrom: { secretKeyRef: { name: bank-db, key: url } }         # 10
                - name: DB_USER
                  valueFrom: { secretKeyRef: { name: bank-db, key: user } }
                - name: DB_PASSWORD
                  valueFrom: { secretKeyRef: { name: bank-db, key: password } }
                - name: SPRING_MAIN_WEBAPPLICATIONTYPE
                  value: "none"                                                    # 11
                - name: SPRING_BATCH_JOB_ENABLED
                  value: "true"                                                    # 12
                - name: SPRING_BATCH_JOB_NAME
                  value: "bankJob"                                                 # 13
```

1. Horaire au format cron.
2. Le fuseau : sans lui, l'horaire est interprété dans celui du cluster.
3. **`Forbid`** : si l'exécution précédente tourne encore, **on n'en lance pas une deuxième** (les valeurs possibles sont `Allow`, `Forbid`, `Replace`). Avec `Allow`, deux exécutions simultanées sont possibles (Module 7, piège du doublon).
4. Si le déclenchement est manqué de plus de 10 minutes (cluster indisponible), il est sauté.
5. **Nombre de tentatives** avant de déclarer le `Job` en échec.
6. **Durée maximale** : au-delà de 2 h, Kubernetes arrête le pod et marque le job en échec, quel que soit le nombre de tentatives restantes. Protège d'un traitement qui ne finit jamais.
7. Nettoyage automatique des pods terminés après 24 h.
8. **`OnFailure`** : en cas d'échec, le **conteneur** est relancé dans le **même** pod. Autre valeur autorisée : `Never` (un **nouveau pod** à chaque tentative). Pour un `Job`, `Always` est **refusé**.
9. Le délai accordé à l'arrêt gracieux (Module 6) : **supérieur à la durée d'un chunk**.
10. Les secrets viennent de l'environnement (facteur *Config*) et jamais de l'image.
11. Un batch **n'embarque pas de serveur web** : sinon le processus ne se termine pas et le `Job` n'est jamais « terminé » (piège n°6).
12. **Le lancement automatique est réactivé ici.** Le Module 2 le désactive (`spring.batch.job.enabled=false`) pour lancer les jobs par une API ; un `Job` Kubernetes, lui, **doit** démarrer le traitement dès le démarrage du conteneur. Sans cette variable, le conteneur démarre, ne fait rien et se termine avec le code 0 : le `Job` est « réussi » sans avoir rien traité.
13. Le nom du job à lancer, puisque l'application en contient plusieurs.

> **Deux manières de déclencher un batch.** (a) **Par un conteneur dédié** (ce manifeste) : le pod exécute le job puis disparaît. (b) **Par une API** (Module 2) : un `CronJob` appelle `POST /jobs/...` sur une application qui reste vivante. La première est la plus simple pour un traitement de nuit ; la seconde convient quand l'application sert aussi d'autres usages.

**Code de sortie.** Kubernetes décide d'une nouvelle tentative **d'après le code de sortie du processus**. Spring Boot fournit un générateur de code de sortie pour les jobs (`JobExecutionExitCodeGenerator`) : un job en échec doit provoquer un code **non nul**.

**La reprise est automatique grâce au `JobRepository`.** Après un échec, la nouvelle tentative relance l'application **avec les mêmes paramètres** : le job reprend l'instance échouée là où elle s'était arrêtée (Modules 1, 3, 6). La documentation indique que `start(...)` appelé avec les mêmes paramètres sur une instance `FAILED` effectue un **restart implicite** (et `restart(executionId)` reste disponible pour être explicite) : *à tester sur votre version*.

### 2.6 Spring Cloud Data Flow **(Théorique)**

Les étapes, d'après le chapitre 12 du livre (commandes du *shell* Data Flow, à vérifier sur la version retenue) :

1. Rendre l'application **compatible** : dépendance `spring-cloud-starter-task` et annotation `@EnableTask` sur la classe principale.
2. **Enregistrer** l'application (nom, type `task`, adresse du jar ou de l'image) : `app register --name fileImport --type task --uri ...`.
3. **Définir** une tâche : `task create myFileImport --definition "fileImport"`.
4. **Lancer** : `task launch myFileImport` (à la demande, planifié, ou déclenché par un flux).
5. **Superviser** dans le tableau de bord : les onglets *Tasks / Executions* (référentiel de tâches) et *Jobs* (référentiel Spring Batch : jobs, steps, contextes).

Deux bases de données entrent en jeu : celle du **serveur Data Flow** (ses propres définitions et exécutions) et celle du **`JobRepository`** de votre batch ; pour que l'onglet *Jobs* fonctionne, **le serveur doit lire le même `JobRepository`** que le batch (piège n°4).

---

## 3. Plongée « sous le capot »

### 3.1 Comment `@SpringBatchTest` et `JobOperatorTestUtils` fonctionnent

`@SpringBatchTest` enregistre, dans le contexte de test, les **utilitaires** (lancement d'un job ou d'un step, nettoyage des métadonnées) et les **écouteurs** qui ouvrent un scope « step » ou « job » autour des tests : c'est pourquoi un `@StepScope` peut y être résolu. `startJob(params)` appelle `JobOperator.start(job, params)` : **c'est le vrai chemin de production**, avec ses transactions et ses écritures dans le `JobRepository`.
Conséquences :
- les tests **écrivent dans PostgreSQL** (métadonnées *et* données) : chaque test doit **nettoyer** son état ;
- la **parité** avec la production compte : un test sur une base en mémoire ne voit ni le comportement du curseur PostgreSQL (Module 3), ni les verrous (Module 7) ; on utilise une base PostgreSQL de CI (ou Testcontainers, qui exige Docker) ;
- des paramètres **uniques** (`getUniqueJobParametersBuilder`) évitent « instance déjà terminée » entre deux tests.

### 3.2 JFR : le profilage intégré à Spring Batch

**Java Flight Recorder (JFR)** enregistre des événements dans la JVM, avec un surcoût très faible. Spring Batch 6.0.6 **émet ses propres événements JFR**, dans le paquet `org.springframework.batch.core.observability.jfr.events` :

| Événement | Ce qu'il mesure |
|---|---|
| `JobLaunchEvent`, `JobExecutionEvent` | lancement et exécution d'un job |
| `StepExecutionEvent`, `TaskletExecutionEvent` | exécution d'un step, d'une tasklet |
| `ItemReadEvent`, `ItemProcessEvent`, `ChunkWriteEvent` | lecture, traitement, écriture |
| `ChunkTransactionEvent` | la transaction d'un chunk |
| `ChunkScanEvent` | le « scan » élément par élément après un échec (Module 6) |
| `PartitionSplitEvent`, `PartitionAggregateEvent` | découpage et agrégation d'un partitionnement (Module 7) |

Ils sont classés dans des catégories de la forme *Spring Batch / Job*, *Spring Batch / Step / Chunk*… Pour les utiliser :

```bash
java -XX:StartFlightRecording=filename=bank.jfr,settings=profile -jar app.jar   # enregistrer
jfr summary bank.jfr                                                             # événements et volumes
jfr print --categories "Spring Batch*" bank.jfr                                  # les événements du batch
```

Le fichier s'ouvre aussi dans **JDK Mission Control**. Ce que l'on y lit : **où est le temps** (lecture, traitement, écriture, transaction), combien de **rejeux** (scans), la **durée de chaque partition**. C'est la mesure que le Module 7 exige *avant* d'optimiser, **sans modifier le code**.

### 3.3 Micrometer et l'observation

Spring Batch s'appuie sur l'**API d'observation** de Micrometer : une observation est une mesure **nommée et étiquetée** autour d'une opération (un job, un step, un chunk). Selon la configuration, la même observation produit :
- une **métrique** (durée, compteur) ;
- une **trace** (un segment dans un traçage distribué) ;
- un **journal**.
Le framework utilise des *timers*, des *compteurs* et des *chronomètres de longue durée* (utiles pour un job **en cours**) ; vous ajoutez vos propres mesures de la même façon (§2.3).

### 3.4 Le rôle de Spring Cloud Data Flow, de Spring Cloud Task et de Kubernetes

```
  Data Flow (serveur) ──lance──▶ plateforme (Kubernetes / CloudFoundry / local)
        │                                   │
        │ lit                               ▼
        ▼                          votre application (Spring Cloud Task + Spring Batch)
   référentiel de tâches  ◀──écrit──┤
   référentiel de jobs    ◀──écrit──┘   (le JobRepository, Module 1)
```

Data Flow **n'exécute pas** vos jobs ; il **demande à la plateforme** de les lancer, et **lit** les référentiels pour les afficher. Kubernetes, lui, fait tourner le pod et applique ses politiques de reprise.

### 3.5 Comment Kubernetes gère un batch

```
  CronJob (à l'heure)  ──crée──▶  Job  ──crée──▶  Pod
                                    │               │
                                    │      code de sortie du conteneur
                                    │               ├─ 0         → Pod terminé, Job réussi
                                    │               └─ ≠ 0       → restartPolicy ?
                                    │                     ├─ OnFailure : le CONTENEUR redémarre (même pod)
                                    │                     └─ Never     : un NOUVEAU pod
                                    │          chaque échec compte vers backoffLimit
                                    │          (délais croissants entre tentatives)
                                    └─ activeDeadlineSeconds dépassé → pod arrêté, Job en échec (DeadlineExceeded)
```

- **`restartPolicy`** : `OnFailure` ou `Never` pour un `Job`. Dans les deux cas, **c'est le `JobRepository` qui rend la nouvelle tentative utile** : sans lui, on rejouerait tout depuis le début.
- **`backoffLimit`** : plafond des échecs. Atteint, le `Job` passe en échec définitif.
- **`activeDeadlineSeconds`** : plafond de **durée totale**, prioritaire sur `backoffLimit`.
- **SIGTERM** (mise à jour, déplacement du pod) : le hook d'arrêt gracieux (Module 6) arrête le job proprement ; le pod suivant reprend.
- **`concurrencyPolicy`** du `CronJob` : décide si deux exécutions peuvent se chevaucher.

Le **`JobRepository` en PostgreSQL** est ce qui rend le pod **jetable** : il peut disparaître à tout moment, un autre pod reprend l'état (facteur « processus sans état »).

---

### Références visuelles (§3 Sous le capot)

**1. Schéma officiel de la documentation Spring Batch**
- ◻ à confirmer : la documentation de Spring Batch sur la **surveillance et les métriques** (Micrometer) et celle de Kubernetes (*Jobs*, *CronJob*).

**2. Schéma ASCII à garder (script vidéo)**
- §3.4 : Data Flow / plateforme / référentiels ; §3.5 : le circuit du code de sortie dans Kubernetes.

**3. Schéma personnalisé à créer pour le PPT**
- **⭐ Machine à états Kubernetes d'un batch** : `restartPolicy`, `backoffLimit`, `activeDeadlineSeconds`, avec le JobRepository qui conserve la position.
- **Les événements JFR** placés sur le déroulé d'un chunk (lecture, traitement, écriture, transaction) et d'un partitionnement.
- **Pull contre push** des métriques pour un job de 20 secondes.

---

## 4. Cas d'usage

### 4.1 La nuit ordinaire

Un `CronJob` démarre à 2 h. Le pod charge 5 millions de lignes, publie ses métriques, écrit un récapitulatif en JSON, se termine avec le code 0. À 6 h, aucune alerte : l'absence d'alerte **est** le résultat, parce que la règle « un succès doit exister avant 6 h » est surveillée.

### 4.2 La nuit où le serveur redémarre

À 3 h, Kubernetes déplace le pod : SIGTERM, arrêt gracieux, job `STOPPED`. Le pod suivant reprend avec les mêmes paramètres : chargement terminé à 4 h au lieu de 3 h 40, **sans perte ni doublon**. Le tableau de bord indique deux exécutions pour une instance.

### 4.3 L'enquête du lendemain

« Le job a pris deux fois plus de temps hier. » On ouvre l'enregistrement JFR : les temps de lecture sont normaux, mais l'**écriture** a doublé et il y a eu 12 **scans** (rejeux élément par élément) : une série de lignes en conflit a fait échouer les écritures groupées. On corrige à la source, on ne parallélise pas.

---

## 5. Pièges : le Top 10

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| **1** | **Test vert avec des données fausses** (piège n°9, récurrent) | `COMPLETED` et `count = 4` : la base contient des dates fausses et des montants à zéro | assertions sur les **valeurs**, un **total**, les **exclusions**, **deux lancements** (§2.2) |
| **2** | **Aucun monitoring** : ni métriques, ni alertes | l'échec est découvert par un utilisateur, à 9 h | métriques, alerte « pas de succès avant l'heure », alerte sur `FAILED` (§2.3) |
| **3** | **Un batch déployé comme un `Deployment`**, ou un `Job` mal réglé : pas de `activeDeadlineSeconds`, `backoffLimit` trop haut | le processus **redémarre après chaque fin**, même réussie ; ou boucle d'échecs pendant des heures | `Job`/`CronJob` avec `backoffLimit` et `activeDeadlineSeconds` bornés ; `restartPolicy` : `OnFailure` ou `Never` |
| **4** | **Spring Cloud Data Flow mal configuré** : serveur sans base de données dédiée, ou ne lisant pas le `JobRepository` du batch | métadonnées du serveur perdues au redémarrage ; onglet *Jobs* vide | une base **persistante** pour le serveur ; le serveur pointe sur **le même** `JobRepository` |
| 5 | Métriques **tirées** (pull) d'un pod de 20 secondes | le job a **disparu** avant d'être lu | Pushgateway, export OTLP ou lecture du référentiel |
| 6 | Application avec **serveur web** lancée comme `Job` Kubernetes | le processus ne se termine jamais : le `Job` n'est jamais « terminé » | `spring.main.web-application-type=none` pour le déploiement en `Job` |
| 7 | **Secrets dans l'image ou le dépôt** | fuite d'identifiants | `Secret` Kubernetes, variables d'environnement |
| 8 | `CronJob` avec `concurrencyPolicy: Allow` | deux exécutions du même lot en parallèle (Module 7) | `Forbid`, et le `JobRepository` comme seconde protection |
| 9 | `terminationGracePeriodSeconds` plus court qu'un chunk (Module 6) | pod tué en plein chunk : exécution orpheline | délai supérieur à la durée d'un chunk, hook d'arrêt |
| 10 | Tester sur une base **en mémoire** ; journaux non structurés ; MDC attendu dans des threads secondaires | des défauts propres à PostgreSQL apparaissent seulement en production ; journaux inexploitables | tests sur PostgreSQL ; JSON sur la sortie standard ; MDC propagé explicitement |

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 8.1 | Les trois piliers et le récapitulatif de la version 6 | 7 min | §1.1-1.2 |
| 8.2 | Tester un job et un step | 8 min | §2.1, §3.1 |
| 8.3 | Le test de contenu : le piège n°9 pour de bon | 7 min | §2.2 |
| 8.4 | Les métriques : celles du framework et les vôtres | 8 min | §2.3, §3.3 |
| 8.5 | JFR et journaux structurés | 8 min | §2.4, §3.2 |
| 8.6 | Un batch cloud native : les douze facteurs | 6 min | §1.3 |
| 8.7 | Kubernetes : `Job`, `CronJob`, reprise | 9 min | §1.5, §2.5, §3.5 |
| 8.8 | Spring Cloud Data Flow et Spring Cloud Task | 6 min | §1.4, §2.6, §3.4 |
| 8.9 | Top 10 et bilan de la formation | 8 min | §1.6, §5 |
| | **Total** | **≈ 67 min** | |

## 7. Exercices

1. **Le test vert.** Un processor oublie de convertir la date (il met `LocalDateTime.now()`). Quel test reste vert ? Écrivez l'assertion qui le détecte.
2. **Kubernetes.** Un `CronJob` a `backoffLimit: 6`, `restartPolicy: OnFailure` et pas d'`activeDeadlineSeconds`. Le job échoue à chaque fois pour une erreur de configuration. Que se passe-t-il pendant la nuit ? Quels deux réglages corrigent le problème ?
3. **Métriques.** Un job dure 20 secondes et Prometheus l'interroge toutes les 30 secondes. Que voit-on ? Proposez deux solutions.
4. **JFR.** Un job est deux fois plus lent qu'hier. Quels événements JFR consultez-vous en premier, et que concluez-vous d'un grand nombre de `ChunkScanEvent` ?

## 8. Bilan de la formation

| Module | Titre | Durée visée |
|---|---|---|
| 1 | Fondations et environnement de production | ≈ 46 min |
| 2 | Premier job et cycle de vie | ≈ 45 min |
| 3 | Le chunk | ≈ 55 min |
| 3B | Le catalogue des readers | ≈ 40 min |
| 4 | Processors, scopes et proxys | ≈ 60 min |
| 5 | Flux et orchestration | ≈ 55 min |
| 6 | Fiabilité | ≈ 60 min |
| 7 | Mise à l'échelle et multi-instance | ≈ 70 min |
| 8 | Production | ≈ 67 min |
| | **Total « Complet »** | **498 min ≈ 8 h 18** |
| | dont **« Essentiel »** (modules 1 à 6) | **321 min ≈ 5 h 21** |
