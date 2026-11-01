# Module 2 · Premier job et cycle de vie

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Durée vidéo visée :** 42 à 48 min, en 6 sous-vidéos de 5 à 9 min (voir la fin).
> **Prérequis :** Module 1 (JobRepository, JobInstance, paramètres identifiants).
> Projet de référence : `tp/tpProd`.

---

## 1. Le concept

### 1.1 Flashback sur le Module 1

Trois idées du Module 1 servent ici à chaque ligne :

- Le **`JobRepository`** écrit dans PostgreSQL chaque début et fin de job et de step. C'est lui qui rend un lancement refusable ou reprenable.
- Une **`JobInstance`** est un job appliqué à des **paramètres identifiants**. Mêmes paramètres, même instance : si elle est terminée, on ne la rejoue pas.
- **`JobOperator`** étend `JobLauncher` et offre `start`, `restart`, `stop`, `abandon`.

Ce module répond à la question suivante : **comment écrire le premier vrai job, et comment le lancer sans surprise ?**

### 1.2 Les deux modèles d'un step

Un step fait l'une de deux choses :

| Modèle | Quand | Interface |
|---|---|---|
| **Tasklet** | une action unique : nettoyer une table, déplacer un fichier, appeler un service | `Tasklet` |
| **Chunk** | lire, traiter, écrire un grand nombre d'éléments par paquets (Module 3) | `ItemReader` / `ItemProcessor` / `ItemWriter` |

Une tasklet s'exécute **dans une transaction**. Si elle retourne `RepeatStatus.CONTINUABLE`, Spring Batch la rappelle dans une **nouvelle** transaction ; avec `FINISHED`, le step est terminé.

### 1.3 Qui lance quoi, et quand ?

```
  déclencheur            lanceur                 job
┌─────────────┐      ┌──────────────┐      ┌───────────────┐
│ ligne de    │      │              │      │ Job           │
│ commande,   │ ───▶ │ JobOperator  │ ───▶ │  └─ Step(s)   │ ──▶ JobRepository ──▶ PostgreSQL
│ REST,       │      │ (JobLauncher)│      └───────────────┘
│ scheduler   │      └──────────────┘
└─────────────┘
```

Le déclencheur n'est **pas** Spring Batch : un batch n'est pas un planificateur (cron, Quartz, Kubernetes `CronJob`…). Spring Batch exécute et enregistre ; quelqu'un d'autre décide de l'heure.

### 1.4 Le lancement automatique de Spring Boot

Par défaut, Spring Boot lance **tous les jobs déclarés** au démarrage de l'application, une seule fois, sans paramètre. C'est pratique pour un `Hello World`, dangereux pour une application qui expose une API ou plusieurs jobs. La propriété `spring.batch.job.enabled=false` désactive ce comportement ; `spring.batch.job.name=nomDuJob` en sélectionne un seul.

---

## 2. Le code, ligne par ligne

### 2.1 La tasklet, en classe explicite

On écrit cette fois une **classe**, et non une lambda : elle a un nom, des dépendances injectées, et se teste seule.

```java
package tp.prod.hello;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.step.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.infrastructure.repeat.RepeatStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component                                                                       // 1
@StepScope                                                                       // 2
public class PrintMessageTasklet implements Tasklet {                            // 3

  private static final Logger log = LoggerFactory.getLogger(PrintMessageTasklet.class); // 4

  private final String runDate;                                                  // 5

  public PrintMessageTasklet(@Value("#{jobParameters['runDate']}") String runDate) {  // 6
    this.runDate = runDate;
  }

  @Override
  public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) { // 7
    log.info("Traitement du {} (step {})", runDate,
        contribution.getStepExecution().getStepName());                          // 8
    return RepeatStatus.FINISHED;                                                // 9
  }
}
```

1. `@Component` : Spring détecte la classe au démarrage et en crée un bean. Sans cela, il faudrait la déclarer avec `@Bean`.
2. `@StepScope` : le bean n'est **pas** créé au démarrage de l'application, mais **à chaque exécution du step**. C'est ce qui permet la ligne 6. Voir la plongée §3.2.
3. `implements Tasklet` : l'interface n'a qu'une méthode, `execute`.
4. Le journal : en batch, les logs sont souvent la seule interface visible.
5. Un champ `final` : la valeur est fixée à la construction et ne change plus pendant l'exécution.
6. `#{jobParameters['runDate']}` est une expression SpEL évaluée **au moment où le step démarre**, quand les paramètres du lancement sont connus. Au démarrage de l'application, ils n'existent pas encore : sans `@StepScope`, l'expression échoue.
7. `execute` reçoit la **contribution** du step (compteurs, accès à la `StepExecution`) et le contexte du chunk.
8. `getStepExecution()` donne accès au nom du step, aux compteurs et à l'`ExecutionContext`.
9. `FINISHED` : fin du step. `CONTINUABLE` rappellerait `execute` dans une nouvelle transaction.

### 2.2 Le step et le job avec les builders de la version 6

```java
package tp.prod.hello;

import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration                                                                   // 1
public class HelloJobConfig {

  @Bean                                                                          // 2
  Step printMessageStep(JobRepository jobRepository,                             // 3
                        PlatformTransactionManager transactionManager,           // 4
                        PrintMessageTasklet tasklet) {                           // 5
    return new StepBuilder("printMessageStep", jobRepository)                    // 6
        .tasklet(tasklet, transactionManager)                                    // 7
        .build();                                                                // 8
  }

  @Bean
  Job helloJob(JobRepository jobRepository, Step printMessageStep) {             // 9
    return new JobBuilder("helloJob", jobRepository)                             // 10
        .start(printMessageStep)                                                 // 11
        .build();                                                                // 12
  }
}
```

1. Classe de configuration : ses méthodes `@Bean` fabriquent des objets gérés par Spring.
2. Chaque méthode `@Bean` produit un bean, **singleton par défaut**. Le `Step` et le `Job` sont des descriptions immuables : un singleton convient.
3. Le `JobRepository` du Module 1 est injecté par type.
4. Le gestionnaire de transactions qui encadrera la tasklet.
5. La tasklet est injectée : c'est un **proxy** (voir §3.2), pas l'objet réel.
6. `StepBuilder(nom, jobRepository)` : en version 6, on n'utilise plus d'usine (`StepBuilderFactory`) ; on construit le builder directement.
7. `.tasklet(tasklet, transactionManager)` : rattache l'action au step, avec la transaction qui l'entoure.
8. `.build()` produit le `Step`.
9. Spring injecte le `Step` du bean précédent, **par son nom de méthode** quand plusieurs `Step` existent.
10. `JobBuilder(nom, jobRepository)` : le nom est celui stocké dans `batch_job_instance`.
11. `.start(...)` désigne le premier step. On enchaînera ensuite avec `.next(...)` (Module 5).
12. `.build()` produit le `Job`.

### 2.3 Le lancement par `JobOperator`

```java
package tp.prod.hello;

import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.stereotype.Service;

@Service                                                                         // 1
public class HelloJobService {

  private final JobOperator jobOperator;                                         // 2
  private final Job helloJob;

  public HelloJobService(JobOperator jobOperator, Job helloJob) {                // 3
    this.jobOperator = jobOperator;
    this.helloJob = helloJob;
  }

  public JobExecution run(String runDate) throws Exception {                     // 4
    JobParameters params = new JobParametersBuilder()                            // 5
        .addString("runDate", runDate)                                           // 6
        .toJobParameters();                                                      // 7
    return jobOperator.start(helloJob, params);                                  // 8
  }
}
```

1. `@Service` : bean de la couche métier, singleton, **sans état** (aucun champ modifiable).
2. Les dépendances sont des champs `final` : l'objet est complet dès sa construction.
3. Injection par constructeur : la forme recommandée (pas de `@Autowired` sur champ).
4. `Exception` large pour la lisibilité ; en production on traite séparément `JobExecutionAlreadyRunningException` et `JobInstanceAlreadyCompleteException`.
5. `JobParametersBuilder` fabrique des paramètres **typés**.
6. `runDate` est identifiant par défaut : il définit la `JobInstance` (flashback Module 1).
7. `toJobParameters()` fige l'objet.
8. `start(Job, JobParameters)` lance, **attend la fin** et renvoie la `JobExecution` terminée : appel **synchrone**.

### 2.4 Une API de lancement qui ne bloque pas

Pour un job de plusieurs minutes, l'appel du §2.3 bloquerait la requête HTTP. On rend la main tout de suite et on consulte l'état plus tard.

```java
public record StartRequest(String runDate) { }                                   // 1
public record StartResponse(String runDate, String statusUrl) { }                // 2

@RestController
class HelloJobController {

  private final HelloJobService service;
  private final JobRepository jobRepository;
  private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor(); // 3

  HelloJobController(HelloJobService service, JobRepository jobRepository) {
    this.service = service;
    this.jobRepository = jobRepository;
  }

  @PostMapping("/jobs/hello")                                                    // 4
  ResponseEntity<StartResponse> start(@RequestBody StartRequest req) {
    executor.submit(() -> {                                                      // 5
      try { service.run(req.runDate()); }
      catch (Exception e) { /* à journaliser : le lancement a échoué */ }
    });
    return ResponseEntity.accepted()                                             // 6
        .body(new StartResponse(req.runDate(), "/jobs/hello/" + req.runDate()));
  }

  @GetMapping("/jobs/hello/{runDate}")                                           // 7
  String status(@PathVariable String runDate) {
    var params = new JobParametersBuilder().addString("runDate", runDate).toJobParameters();
    var last = jobRepository.getLastJobExecution("helloJob", params);            // 8
    return switch (last) {                                                       // 9
      case null -> "INCONNU";
      default -> last.getStatus().name();
    };
  }
}
```

1. `record` : classe de données immuable, sans code répétitif. Convient à une requête.
2. Idem pour la réponse : on rend l'adresse où consulter l'état.
3. Un exécuteur de **threads virtuels** (Java 21+) : un thread par lancement, très peu coûteux. Il remplace avantageusement un pool fixe pour des tâches qui attendent beaucoup.
4. **POST** : lancer un job change l'état du système ; un GET doit pouvoir être rejoué sans effet.
5. Le lancement part sur un autre thread ; le thread HTTP est libéré immédiatement.
6. `202 Accepted` : « j'ai bien reçu la demande, le traitement n'est pas terminé ».
7. Un GET en lecture seule pour suivre l'exécution.
8. `getLastJobExecution(nom, paramètres)` interroge le dépôt (donc PostgreSQL) : le suivi survit à un redémarrage.
9. Pattern matching du `switch` avec `case null` : traite explicitement l'absence d'exécution.

> Variante : en version 6, un lanceur peut lui-même être asynchrone si on lui fournit un `TaskExecutor` (classe `TaskExecutorJobOperator`). On y revient au Module 8 avec le choix du nombre de threads.

### 2.5 La configuration de démarrage

```properties
spring.batch.job.enabled=false
```

Sans cette ligne, Spring Boot lancerait `helloJob` seul à chaque démarrage, sans `runDate`, et l'échec serait journalisé avant même que l'API ne réponde.

---

## 3. Plongée « sous le capot »

### 3.1 Le cycle de vie d'un bean Spring

```
 1. instanciation          new PrintMessageTasklet(...)
 2. injection              dépendances par constructeur / setters
 3. callbacks « Aware »    BeanNameAware, ApplicationContextAware…
 4. BeanPostProcessor.postProcessBeforeInitialization
 5. initialisation         @PostConstruct, afterPropertiesSet, initMethod
 6. BeanPostProcessor.postProcessAfterInitialization   ◀── c'est ici que les PROXYS sont créés
 7. bean prêt              utilisé par l'application
 8. destruction            @PreDestroy, destroy() à l'arrêt du contexte
```

Deux conséquences pratiques :

- Ce que vous recevez par injection est parfois **un proxy** (étape 6), pas l'objet que vous avez écrit. C'est le cas pour `@StepScope`, `@Transactional`, `@Async`.
- Une action qui dépend des **paramètres du lancement** ne peut pas se faire à l'étape 2 d'un singleton : à ce moment-là, aucun lancement n'a encore eu lieu.

### 3.2 Singleton, `@StepScope` et proxy : ce que fait Spring

**Par défaut, un bean est un singleton** : un seul objet pour toute l'application, créé au démarrage, partagé par tous les appelants et tous les threads, détruit à l'arrêt. Tout champ modifiable est donc un **état partagé**.

Avec `@StepScope`, Spring change de stratégie :

1. Au démarrage, il ne crée **pas** la tasklet. Il crée à la place un **proxy** (CGLIB, une sous-classe générée) qui prend la place du bean dans tous les points d'injection.
2. Quand le step démarre, le proxy demande au contexte « step » d'instancier la vraie tasklet. À ce moment, l'expression `#{jobParameters['runDate']}` peut être résolue : les paramètres du lancement existent.
3. Chaque appel de méthode sur le proxy est **délégué** à l'instance de l'exécution courante.
4. À la fin du step, l'instance est **détruite**. L'exécution suivante en aura une neuve.

En mémoire JVM :

```
SINGLETON                            @StepScope
┌────────────────┐                   ┌─────────────┐        ┌───────────────┐
│ une instance   │ ◀─ tous les       │ proxy       │ ─────▶ │ instance #1   │  ◀ exécution 1 (détruite ensuite)
│ pour toujours  │    lancements     │ (vit toujours)        ├───────────────┤
└────────────────┘                   └─────────────┘ ─────▶ │ instance #2   │  ◀ exécution 2
                                                            └───────────────┘
```

### 3.3 Le piège du singleton : la démonstration

Soit une tasklet **non** `@StepScope`, avec un champ modifiable :

```java
@Component
public class CountingTasklet implements Tasklet {
  private int processed = 0;                                   // état partagé entre TOUS les lancements

  @Override
  public RepeatStatus execute(StepContribution c, ChunkContext ctx) {
    processed += 100;                                          // supposons 100 éléments par lancement
    log.info("Total traité : {}", processed);
    return RepeatStatus.FINISHED;
  }
}
```

Dans une application qui reste vivante (API REST, planificateur interne), le singleton survit entre deux lancements :

| Lancement | Éléments réellement traités | Affiché |
|---|---|---|
| 1er | 100 | `Total traité : 100` |
| 2e (même JVM) | 100 | `Total traité : 200` ← **faux** |

Le rapport « double » alors que rien n'a été traité en plus. C'est le **bug du double comptage** : silencieux, aucune exception, une seule ligne d'erreur dans un rapport lu trois semaines plus tard.

Trois parades, par ordre de préférence :

1. **Pas d'état** dans les composants partagés : le compteur vit dans la `StepExecution` (`contribution.incrementWriteCount(...)`) ou dans l'`ExecutionContext`.
2. `@StepScope` : le composant est neuf à chaque exécution du step.
3. Réinitialiser explicitement l'état au début de chaque exécution (fragile : on l'oublie).

*(Le Module 4 reprend ce sujet avec les processeurs, qui portent souvent un état.)*

### 3.4 `JobLauncher` et `JobOperator`, synchrone ou asynchrone

`JobOperator` hérite de `JobLauncher` : on peut lui appeler `run(...)` ou `start(...)`. Le comportement par défaut est **synchrone** : l'appel retourne une fois le job terminé. Pour un lancement asynchrone, deux approches :

| Approche | Principe | Quand |
|---|---|---|
| Exécuteur applicatif (§2.4) | on soumet l'appel à un `ExecutorService` | simple, sous votre contrôle |
| Lanceur avec `TaskExecutor` (`TaskExecutorJobOperator`) | le lanceur crée lui-même le thread | uniformiser tous les lancements |

Dans les deux cas : l'appelant reçoit la main **avant** la fin ; la `JobExecution` retournée est alors dans l'état `STARTING`/`STARTED`, pas `COMPLETED`. Il faut ensuite **interroger** le dépôt, ce qui est exactement ce que fait le `GET` du §2.4.

### 3.5 Ce que Spring Boot fait au démarrage

Quand `spring.batch.job.enabled` vaut `true` (valeur par défaut), un composant de démarrage de Spring Boot parcourt les jobs du contexte et les lance, **sans paramètre** (ou avec ceux de la ligne de commande). Cela se produit **après** la construction complète du contexte, mais **avant** que votre application ne soit considérée comme prête à servir. Si le job est long, l'application paraît « bloquée au démarrage ».

---

## 4. Cas d'usage

### 4.1 L'import du matin déclenché par un planificateur

Un `CronJob` Kubernetes appelle `POST /jobs/hello` chaque jour à 2 h avec `runDate` du jour. L'API répond `202` aussitôt, le job tourne, et le tableau de bord appelle `GET /jobs/hello/{runDate}`. Si le planificateur déclenche par erreur deux fois : le second appel échoue proprement (`JobInstanceAlreadyCompleteException` ou `JobExecutionAlreadyRunningException`, Module 1).

### 4.2 Le job à la demande d'un utilisateur

Un gestionnaire demande depuis une interface web « recalcule les soldes du mois ». La requête ne peut pas attendre vingt minutes : lancement asynchrone, retour immédiat, suivi par interrogation.

### 4.3 Le job d'initialisation

Un job qui charge un référentiel **une seule fois** à l'installation peut, lui, profiter du lancement automatique (`enabled=true` avec `spring.batch.job.name`) : c'est l'un des rares cas où le comportement par défaut est voulu.

---

## 5. Pièges : le Top 10

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| 1 | Oublier `spring.batch.job.enabled=false` | tous les jobs partent au démarrage, sans paramètre | désactiver, lancer explicitement |
| 2 | Lancer un job long de façon synchrone dans une requête HTTP | requête bloquée, délai dépassé, client qui relance | `202 Accepted` + suivi par interrogation (§2.4) |
| 3 | Champ modifiable dans un singleton (tasklet, processeur, writer) | **double comptage** entre lancements successifs | composant sans état, ou `@StepScope` |
| 4 | `#{jobParameters[...]}` sans `@StepScope` | échec au démarrage du contexte : paramètres inexistants | `@StepScope` (ou `@JobScope`) sur le bean |
| 5 | Appeler une méthode `@StepScope` depuis la même classe | l'appel interne contourne le proxy : mauvaise instance | injecter le bean depuis l'extérieur |
| 6 | Tasklet qui retourne `null` au lieu de `RepeatStatus` | exception à l'exécution | toujours `FINISHED` ou `CONTINUABLE` |
| 7 | Tasklet `CONTINUABLE` sans condition d'arrêt | boucle infinie, une transaction par tour | condition de sortie testée à chaque appel |
| 8 | Lancer avec un `GET` | un robot, un navigateur ou un préchargement relance le job | **POST** |
| 9 | Engloutir l'exception d'un lancement asynchrone | échec invisible : personne ne le sait | journaliser, alerter, et lire l'état dans le dépôt |
| 10 | Paramètre horodaté en paramètre **identifiant** | chaque relance est une nouvelle instance : la reprise est impossible (flashback Module 1) | paramètre métier stable ; horodatage non identifiant |

**Bug silencieux typique :** un test unitaire qui lance le job une seule fois passe toujours. Le double comptage n'apparaît qu'au **deuxième** lancement dans la **même** JVM. Tout test de job qui garde un état doit lancer le job au moins deux fois.

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 2.1 | Flashback et les deux modèles de step | 6 min | §1.1-1.2 |
| 2.2 | La tasklet, classe explicite | 8 min | §2.1 |
| 2.3 | Le step et le job avec les builders 6 | 7 min | §2.2 |
| 2.4 | Lancer avec `JobOperator`, puis sans bloquer | 9 min | §2.3-2.4, §3.4 |
| 2.5 | Cycle de vie des beans, singleton et proxy | 9 min | §3.1-3.3, démonstration du double comptage |
| 2.6 | Le démarrage Boot et le Top 10 | 6 min | §1.4, §3.5, §5 |
| | **Total** | **≈ 45 min** | |

## 7. Exercices

1. **Singleton.** La classe `CountingTasklet` du §3.3 est lancée trois fois de suite dans la même JVM avec 100 éléments à chaque fois. Qu'affiche-t-elle au troisième lancement ? Proposez deux corrections.
2. **Paramètres.** Pourquoi `#{jobParameters['runDate']}` provoque-t-il une erreur sur un bean singleton, et pas sur un bean `@StepScope` ?
3. **Lancement.** Une collègue vous dit : « J'ai mis `jobOperator.start(...)` dans mon contrôleur, mais la requête dure 20 minutes ». Expliquez ce qui se passe et comment le corriger.
