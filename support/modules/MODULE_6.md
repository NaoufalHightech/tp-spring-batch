# Module 6 · Fiabilité : skip, retry, restart, arrêt gracieux

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Essentiel. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 55 à 60 min, en 7 sous-vidéos de 6 à 10 min (voir la fin).
> **Prérequis :** Module 1 (`JobRepository`, statuts), Module 3 (`ExecutionContext`, `ItemStream`), Module 4 (rejeu du chunk).
> Projet de référence : `tp/tpProd`.
>
> **Convention de ce module :** les lignes `🖼️ [RÉFÉRENCE PPT]` renvoient aux diapositives du PPT du cours (`pptx/Spring_Batch_cours_complet.pptx`).
> Ce PPT a été produit sur **Spring Batch 5.1** : ses **schémas** (blocs, flèches) sont réutilisables, mais le **code** affiché sur les diapositives 43, 44 et 45
> (`chunk(5, batchTxManager)`, `backOffPolicy(...)`) est à **remplacer** par celui de ce module (§2).

---

## 1. Le concept

### 1.1 Trois problèmes, trois outils

Un lot de nuit rencontre trois sortes d'ennuis. Chacun a **son** réflexe :

| Problème | Exemple | Outil | Réflexe |
|---|---|---|---|
| Une **donnée** est mauvaise | ligne du CSV mal formée, montant illisible | **Skip** | ignorer **cette** ligne, la **consigner**, continuer |
| Une **ressource** est momentanément indisponible | verrou en base, délai réseau, panne de 2 secondes | **Retry** | **réessayer** après une courte pause |
| Le **processus** s'arrête | crash serveur, redémarrage, arrêt demandé | **Restart** | **reprendre** au dernier point validé |

```
            erreur
              │
   ┌──────────┴───────────┐
   │ vient de la donnée ? │── oui ──▶ SKIP  (la relancer ne changera rien : la ligne est fausse)
   └──────────┬───────────┘
              │ non
   ┌──────────┴───────────┐
   │ transitoire ?        │── oui ──▶ RETRY (dans quelques secondes, ça passera)
   │ (réseau, verrou)     │
   └──────────┬───────────┘
              │ non (bug, panne durable, arrêt)
              ▼
         ÉCHEC du step ──▶ RESTART après correction
```

> 🖼️ [RÉFÉRENCE PPT] : Utiliser les diapositives **« Skip : ignorer certaines erreurs »** (n°43), **« Retry : retenter les erreurs transitoires »** (n°44) et
> **« Restart : reprendre là où ça s'est arrêté »** (n°45) pour les blocs et flèches ; le code affiché est à remplacer (Spring Batch 5.1).

### 1.2 Ce qui change dans Spring Batch 6

Vérifié dans les jars 6.0.6 / Spring Framework 7.0 :

- Le step fault-tolerant se construit **sur le builder de chunk** : `chunk(n)` → `.faultTolerant()` → `.skip(...)`, `.skipLimit(...)`, `.retry(...)`, `.retryLimit(...)`.
- Le **retry** n'est plus fourni par la bibliothèque *Spring Retry* : il s'appuie sur **`org.springframework.core.retry`**, dans Spring Framework 7.
  `RetryPolicy` se construit avec `RetryPolicy.builder()` (`maxRetries`, `delay`, `multiplier`, `jitter`, `maxDelay`, `includes`, `excludes`, `timeout`) et se branche par **`retryPolicy(...)`**.
  Les anciens `backOffPolicy(...)` et `ExponentialBackOffPolicy` du livre et du PPT n'existent plus sur le builder.
- **`JobOperator`** regroupe `restart`, `stop`, `abandon` et `recover` (Module 1).
- **`JobExecutionShutdownHook`** (paquet `org.springframework.batch.core.launch.support`) : un `Thread` à enregistrer comme *shutdown hook* de la JVM, qui **demande l'arrêt** du job quand le processus reçoit un signal d'arrêt.

### 1.3 Flashbacks

- **Module 3.** La position de lecture est sauvegardée dans l'`ExecutionContext` **à chaque commit**, dans la **même transaction** que les données. C'est ce qui permet le restart sans perte ni doublon (§3.1).
- **Module 4.** Un chunk **rejoué** (retry) rappelle le processor : un total accumulé dans le processor compte l'élément deux fois. Le retry rend ce piège **inévitable** si le processor a des effets de bord (§3.2, piège n°7).
- **Module 1.** Le statut du dernier `JobExecution` (`batch_job_execution`) décide si un restart est **permis** (§3.4).

---

### Références visuelles (§1 Concept)

> Légende : « ✔ vérifié » = titre relevé dans l'extrait de documentation officielle fourni ; « ◻ à confirmer » = page citée, titre à contrôler avant d'insérer l'image.

**1. Schéma officiel de la documentation Spring Batch**
- ◻ à confirmer : page *Configuring a Step*, sections *Controlling Step Execution* / *Configuring Skip Logic* / *Configuring Retry Logic* : repérer les schémas de la page.

**2. Schéma ASCII à garder (script vidéo)**
- §1.1 : l'arbre de décision « donnée / transitoire / autre » (il sert de fil conducteur de tout le module).

**3. Schéma personnalisé à créer pour le PPT**
- Reprendre le style des diapositives 43 à 45 pour un **tableau Skip / Retry / Restart** unique, avec l'arbre de décision en 3 couleurs.

---

## 2. Le code, ligne par ligne

### 2.1 Skip : ignorer une ligne mauvaise, et la consigner

```java
@Bean
Step loadBankStep(JobRepository jobRepository, PlatformTransactionManager tx,
                  FlatFileItemReader<RawTransaction> bankCsvReader,
                  CompositeItemProcessor<RawTransaction, BankTransaction> bankProcessor,
                  JdbcBatchItemWriter<BankTransaction> bankDbWriter,
                  RejectedLineLogger rejectedLineLogger) {

  return new StepBuilder("loadBankStep", jobRepository)
      .<RawTransaction, BankTransaction>chunk(100)                          // 1
      .transactionManager(tx)
      .reader(bankCsvReader).processor(bankProcessor).writer(bankDbWriter)
      .stream(bankCsvReader)
      .faultTolerant()                                                      // 2
      .skip(FlatFileParseException.class)                                   // 3
      .skip(ValidationException.class)                                      // 4
      .skipLimit(10)                                                        // 5
      .skipListener(rejectedLineLogger)                                     // 6
      .build();
}
```

1. Le chunk de 100, comme au Module 3.
2. **`faultTolerant()`** active la gestion d'erreurs : sans cet appel, **tout** `.skip(...)` ou `.retry(...)` est ignoré et la première exception fait échouer le step.
3. Les lignes **mal formées** du fichier (`FlatFileParseException`) sont ignorables.
4. Les éléments **invalides** (Module 4, `ValidationException`) le sont aussi.
5. **Plafond** : à la 11e erreur ignorée, le step échoue. Au-delà d'un seuil, ce n'est plus une ligne mauvaise, c'est un fichier mauvais.
6. Un **listener de skip** : appelé à chaque élément ignoré, c'est lui qui laisse une trace (ci-dessous).

```java
@Component
public class RejectedLineLogger implements SkipListener<RawTransaction, BankTransaction> {

  private static final Logger log = LoggerFactory.getLogger(RejectedLineLogger.class);

  @Override
  public void onSkipInRead(Throwable t) {                                   // 1
    if (t instanceof FlatFileParseException e) {                            // 2
      log.warn("Ligne {} rejetée ({}) : [{}]", e.getLineNumber(), e.getMessage(), e.getInput());  // 3
    } else {
      log.warn("Lecture ignorée : {}", t.toString());
    }
  }

  @Override
  public void onSkipInProcess(RawTransaction item, Throwable t) {           // 4
    log.warn("Élément {} rejeté par le processor : {}", item.id(), t.getMessage());
  }

  @Override
  public void onSkipInWrite(BankTransaction item, Throwable t) {            // 5
    log.warn("Élément {} rejeté à l'écriture : {}", item.id(), t.getMessage());
  }
}
```

1. Trois méthodes, une par étape où une erreur peut être ignorée : lecture, traitement, écriture.
2. *Pattern matching* : si c'est une erreur de format de fichier, on a de quoi être précis.
3. `getLineNumber()` et `getInput()` donnent **le numéro et le texte brut** de la ligne : de quoi écrire un rapport de rejets exploitable.
4. En lecture, on n'a **pas** d'élément (la lecture a échoué) ; en traitement, on a l'élément d'entrée.
5. En écriture, on a l'élément de sortie.

### 2.2 Retry : réessayer une erreur transitoire

```java
RetryPolicy transientRetry = RetryPolicy.builder()
    .maxRetries(3)                                                          // 1
    .delay(Duration.ofMillis(200))                                          // 2
    .multiplier(2.0)                                                        // 3
    .maxDelay(Duration.ofSeconds(2))                                        // 4
    .jitter(Duration.ofMillis(50))                                          // 5
    .includes(TransientDataAccessException.class, SocketTimeoutException.class)  // 6
    .build();

return new StepBuilder("loadBankStep", jobRepository)
    .<RawTransaction, BankTransaction>chunk(100)
    .transactionManager(tx)
    .reader(bankCsvReader).processor(bankProcessor).writer(bankDbWriter)
    .faultTolerant()
    .retryPolicy(transientRetry)                                            // 7
    .build();
```

1. Nombre de **nouvelles tentatives**. *(Mesurer, § exercice 3 : la tentative initiale est-elle comptée ? ne pas le supposer.)*
2. Pause avant la première nouvelle tentative : 200 ms.
3. **Progression exponentielle** : 200 ms, 400 ms, 800 ms…
4. Plafond de la pause : jamais plus de 2 s.
5. Un peu d'**aléa** pour que plusieurs jobs ne réessaient pas tous à la même milliseconde (évite l'effet de troupeau).
6. **Seules les erreurs transitoires** sont retentées : un échec de verrou ou de délai, **pas** un `NullPointerException` (§5, piège n°2).
7. La politique se branche sur le step fault-tolerant.

Forme courte, quand aucune pause n'est nécessaire :

```java
.faultTolerant().retry(TransientDataAccessException.class).retryLimit(3)
```

### 2.3 Combiner skip et retry

```java
.faultTolerant()
.retryPolicy(transientRetry)                                                // d'abord on réessaie
.skip(DataIntegrityViolationException.class).skipLimit(10)                  // puis on ignore si ça persiste
```

Lecture : une erreur à la fois **retentable** et **ignorable** est d'abord retentée ; **si les tentatives sont épuisées**, l'élément est ignoré (et consigné). Une erreur ignorable mais non retentable est ignorée tout de suite.

### 2.4 Restart : reprendre un job échoué

```java
@Service
public class BankRestartService {

  private final JobOperator jobOperator;
  private final JobRepository jobRepository;

  public BankRestartService(JobOperator jobOperator, JobRepository jobRepository) {
    this.jobOperator = jobOperator;
    this.jobRepository = jobRepository;
  }

  public long restartFor(String runDate) throws Exception {
    var params = new JobParametersBuilder().addString("runDate", runDate).toJobParameters();  // 1
    JobExecution last = jobRepository.getLastJobExecution("bankJob", params);                  // 2
    if (last == null) {
      throw new IllegalArgumentException("Aucune exécution pour " + runDate);
    }
    return switch (last.getStatus()) {                                                         // 3
      case FAILED, STOPPED -> jobOperator.restart(last.getId());                               // 4
      case COMPLETED -> throw new IllegalStateException("Déjà terminé : rien à reprendre");
      default -> throw new IllegalStateException("Non reprenable (statut " + last.getStatus() + ")");
    };
  }
}
```

1. **Les mêmes paramètres** identifiants : c'est ce qui désigne **la même `JobInstance`** (Module 1). Avec d'autres paramètres, ce serait une **nouvelle** instance, donc un nouveau lot, pas une reprise.
2. On retrouve la dernière exécution de cette instance, dans PostgreSQL.
3. `switch` sur l'énumération `BatchStatus` : le comportement est **explicite** pour chaque statut.
4. Seuls **`FAILED`** et **`STOPPED`** autorisent un restart. `restart(long)` crée une **nouvelle `JobExecution`** de la même instance et retourne son identifiant.

> **Restart implicite.** La documentation indique aussi qu'un `jobOperator.start(job, params)` appelé avec les **mêmes** paramètres sur une instance `FAILED` effectue **lui-même** le restart. `restart(executionId)` reste la façon **explicite** (et la plus lisible dans un service de reprise). *À tester sur votre version.*

Réglages utiles :

```java
new StepBuilder("loadBankStep", jobRepository)
    .startLimit(3)                    // 3 démarrages maximum pour ce step (puis erreur)
    .allowStartIfComplete(true)       // rejouer ce step même s'il a déjà réussi (ex. nettoyage)
```

et `JobBuilder(...).preventRestart()` pour déclarer un job **non reprenable**.

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Restart : reprendre là où ça s'est arrêté »** (n°45) pour le principe, et **« ExecutionContext et JobRepository »** (n°17)
> pour la sauvegarde de position. Remplacer le code de la diapositive 45 (qui force `STOPPED` dans un listener pour la démonstration).

### 2.5 L'arrêt gracieux : `JobExecutionShutdownHook`

Objectif : quand l'orchestrateur envoie **SIGTERM** (mise à jour du serveur, `docker stop`, suppression d'un pod), le job doit **finir le chunk en cours puis s'arrêter proprement**, au lieu d'être coupé au milieu d'une transaction.

```java
@Component
public class GracefulShutdownListener implements JobExecutionListener {

  private final ObjectProvider<JobOperator> jobOperator;                    // 1
  private final Map<Long, Thread> hooks = new ConcurrentHashMap<>();        // 2

  public GracefulShutdownListener(ObjectProvider<JobOperator> jobOperator) {
    this.jobOperator = jobOperator;
  }

  @Override
  public void beforeJob(JobExecution jobExecution) {                        // 3
    var hook = new JobExecutionShutdownHook(jobExecution, jobOperator.getObject());  // 4
    Runtime.getRuntime().addShutdownHook(hook);                             // 5
    hooks.put(jobExecution.getId(), hook);
  }

  @Override
  public void afterJob(JobExecution jobExecution) {                         // 6
    Thread hook = hooks.remove(jobExecution.getId());
    if (hook != null) {
      try { Runtime.getRuntime().removeShutdownHook(hook); }                // 7
      catch (IllegalStateException alreadyShuttingDown) { /* la JVM s'arrête déjà */ }
    }
  }
}
```

1. Le `JobOperator` est injecté **à la demande** (`ObjectProvider`) par précaution : le listener est référencé par le job, et un `JobOperator` peut lui-même dépendre de la définition des jobs ; l'injection tardive évite un cycle de dépendances.
2. Un listener est un **singleton** : il peut surveiller **plusieurs exécutions en parallèle**. Il garde donc **une association par exécution** (clé : identifiant de l'exécution), jamais un champ unique (Module 4).
3. `beforeJob` : l'exécution existe, elle a un identifiant.
4. Le hook est un `Thread` qui connaît l'exécution à arrêter et l'opérateur qui sait l'arrêter.
5. Enregistrement auprès de la JVM : le hook s'exécute quand le processus reçoit un signal d'arrêt.
6. `afterJob` : le job est terminé, le hook devient inutile.
7. On le **retire** pour ne pas accumuler de hooks. Si la JVM est déjà en train de s'arrêter, le retrait est refusé : on ignore.

**Ce que fait le hook** (vérifié sur le code de la classe) : à la réception du signal, il journalise « Received JVM shutdown signal », puis appelle **`jobOperator.stop(jobExecution)`**. Il **demande** l'arrêt ; il **n'attend pas** que le job soit arrêté. Si l'exécution n'est plus en cours, il avertit ; en cas d'autre erreur, il lève une `RuntimeException`.

Le listener se branche sur le job : `new JobBuilder(...).listener(gracefulShutdownListener)`.

> **À prévoir côté exploitation.** Le hook ne fait que *demander* l'arrêt ; le job s'arrête à la fin du chunk en cours (§3.3). Le délai accordé par l'orchestrateur
> (`terminationGracePeriodSeconds` sous Kubernetes, `--time` de `docker stop`) doit donc être **supérieur à la durée d'un chunk**. Sinon la JVM est tuée avant la fin et l'on retombe dans le cas du crash (§3.4).

---

## 3. Plongée « sous le capot »

### 3.1 Comment Spring Batch sait où reprendre

Tout repose sur les tables du Module 1 et sur la sauvegarde du Module 3 :

```
  batch_job_instance       1 ligne   (bankJob + runDate=2026-10-01)         ← identité du lot
        │
        ├─ batch_job_execution   n°1  FAILED   (crash à 03:12)             ← tentative 1
        │       └─ batch_step_execution (loadBankStep) FAILED, commit_count=34
        │             └─ batch_step_execution_context : {"bankCsvReader.read.count": 3400}
        │
        └─ batch_job_execution   n°2  (créée par restart)                  ← tentative 2
                └─ batch_step_execution (loadBankStep) STARTED
                      └─ open(contexte restauré) → le reader saute 3400 lignes, reprend à la 3401e
```

Au `restart` :

1. Le dépôt crée une **nouvelle `JobExecution`** rattachée à **la même `JobInstance`**.
2. Pour chaque step, il examine la **dernière** `StepExecution` : un step `COMPLETED` est **sauté** (sauf `allowStartIfComplete`), un step `FAILED` ou `STOPPED` est **rejoué**.
3. Pour ce step, le contexte de la dernière exécution est **relu** dans `batch_step_execution_context`.
4. `ItemStream.open(contexte)` (Module 3) restaure la position : le reader reprend **là où le dernier commit l'avait laissé**.

Pourquoi sans perte ni doublon ? Parce que, à chaque commit (Module 3, §3.2), **les lignes écrites et la position sont validées dans la même transaction**. Au crash, il n'existe que deux états possibles : le chunk est entièrement validé (lignes **et** position), ou il ne l'est pas du tout.

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« ExecutionContext et JobRepository »** (n°17) et **« Step et StepExecution »** (n°16) pour l'enchaînement instance → exécutions → contexte.

**Conditions pour que ça marche :**
- le reader **sauvegarde son état** (nom défini, `saveState` non désactivé) ;
- les paramètres identifiants sont **identiques** ;
- le reader est **rejouable** (un fichier ne doit pas avoir été remplacé entre-temps) ;
- l'écriture est **dans la même base** que le `JobRepository`, ou **idempotente** (`ON CONFLICT DO UPDATE`, Module 3).

### 3.2 Ce qui se passe dans la transaction quand un chunk échoue puis qu'on retente

```
début du chunk (transaction T1)
   lire 100 éléments, traiter...
   élément n°37 : exception transitoire (verrou)
ROLLBACK de T1                      ← les 36 éléments déjà traités sont ANNULÉS, rien n'est écrit
pause (200 ms, puis 400 ms, ...)    ← back-off
début de la tentative suivante (transaction T2)
   le chunk est REJOUÉ en entier (les 100 éléments sont retraités depuis le début)
   si ça passe : écriture des 100, sauvegarde de la position, COMMIT
   sinon : retour à ROLLBACK, jusqu'à épuisement de la politique
épuisement :
   - exception ignorable (skip)  → l'élément fautif est écarté, le reste est traité
   - sinon                        → le step ÉCHOUE (FAILED), restart possible plus tard
```

Trois conséquences à retenir :
1. **Le rollback annule le chunk entier**, pas seulement l'élément fautif. Plus le chunk est grand, plus le rejeu coûte.
2. **Les 36 premiers éléments sont retraités** : tout ce qu'ils ont fait **en dehors de la transaction** (appel d'API, e-mail) est **répété** (Module 4, piège n°7), et tout compteur en mémoire les compte **deux fois**.
3. Quand l'**écriture** échoue et qu'un skip est possible, Spring Batch **rejoue le chunk élément par élément** (mode « scan ») pour **isoler** l'élément fautif ; c'est exact mais plus lent : 100 petites transactions au lieu d'une.
   *(Avec Spring Batch 5.1, un processor qui échoue deux fois par élément sur 3 éléments est appelé 11 fois, avec 6 rollbacks. L'exercice 3 permet de le reproduire sur la 6.0.6.)*

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« L'algorithme du chunk et ses interfaces »** (n°29), complétée d'un cadre rouge « rollback + rejeu » (schéma à ajouter).

### 3.3 Comment l'arrêt gracieux arrête un job

```
SIGTERM ─▶ JVM lance les shutdown hooks ─▶ JobExecutionShutdownHook.run()
                                                   │ jobOperator.stop(jobExecution)
                                                   ▼
                              l'exécution est marquée « arrêt demandé » (terminateOnly)
                                                   │
   chunk en cours ............ continue, valide son commit (lignes + position)
                                                   │
                       avant le chunk suivant : la politique d'interruption du step
                       constate la demande ──▶ JobInterruptedException
                                                   ▼
                       StepExecution = STOPPED, JobExecution = STOPPED, ExecutionContext sauvegardé
                                                   │
                                          JVM s'arrête, proprement
```

Deux points :
- l'arrêt est **coopératif** : il a lieu **entre deux chunks**. Un chunk de 100 000 éléments retarde l'arrêt d'autant (c'est une raison de plus de borner la taille du chunk, Module 3) ;
- le statut final est **`STOPPED`** (et non `FAILED`) : **restart** autorisé, sans rien corriger.

### 3.4 Quand l'arrêt n'est pas gracieux : l'exécution orpheline

Un `kill -9`, un `OutOfMemoryError`, une coupure de courant : **aucun hook ne s'exécute**. Le chunk en cours est annulé par PostgreSQL (la transaction n'a pas été validée), ce qui est sain ; mais le dépôt n'a **pas été mis à jour** : la `JobExecution` reste en statut **`STARTED`** pour toujours.
Conséquence : un `restart` est refusé, car le dépôt croit que le job tourne encore (c'est le piège n°7 du Module 1 sous un autre angle). Il faut d'abord **déclarer l'exécution orpheline** : `jobOperator.recover(...)` (la remet dans un état reprenable) ou `jobOperator.abandon(...)` (la ferme définitivement).
**Avant de le faire, vérifier qu'aucune JVM n'exécute plus ce job** : forcer la reprise d'un job qui tourne encore produirait deux exécutions simultanées.

---

### Références visuelles (§3 Sous le capot)

**1. Schéma officiel de la documentation Spring Batch**
- ✔ vérifié : « Job Hierarchy With Steps » (page *The Domain Language of Batch*) pour l'arbre instance → exécutions → steps du §3.1.

**2. Schéma ASCII à garder (script vidéo)**
- §3.1 : l'arbre des tables avec le contexte restauré.
- §3.2 : le déroulé rollback / pause / rejeu.
- §3.3 : la chaîne SIGTERM → hook → `terminateOnly` → `STOPPED`.

**3. Schéma personnalisé à créer pour le PPT**
- **⭐ Chronologie crash puis restart** : chunk 34 validé, crash à la ligne 3 450, restart qui reprend à la 3 401e (les 50 lignes non validées sont rejouées).
- **Rollback et rejeu** : le chunk de 100 avec l'élément 37 en rouge, rollback, pause exponentielle, rejeu en vert.
- **Arrêt gracieux contre `kill -9`** : deux lignes de temps côte à côte (`STOPPED` propre / `STARTED` orphelin).
- Arbre de décision skip / retry / abandon en couleurs.

---

## 4. Cas d'usage

### 4.1 La nuit du serveur qui redémarre

À 3 h 12, une mise à jour du système envoie SIGTERM. Le hook demande l'arrêt, le chunk en cours se termine, le job passe en `STOPPED`. Au matin, `restartFor("2026-10-01")` reprend à la ligne 3 401 : **aucune ligne perdue ni doublonnée**, une demi-heure de traitement conservée.

### 4.2 Le fichier d'un partenaire contient trois lignes cassées

Sur 2 millions de lignes, trois ont un montant illisible. Avec un skip (plafond à 10) et un listener qui écrit le numéro de ligne et le texte brut, le lot **va au bout**, et le rapport de rejets part au partenaire le lendemain. Sans skip : le lot échoue à 1 h du matin, le fichier est renvoyé à 9 h, le traitement est repoussé d'une journée.

### 4.3 La base qui hoquette

Un verrou de quelques secondes sur la table de référence fait échouer un chunk. Avec un retry exponentiel (200 ms, 400 ms, 800 ms), la deuxième tentative passe : personne n'a rien vu, hormis une ligne de journal. Sans retry, le lot échoue pour une cause qui avait disparu avant même qu'on la lise.

---

## 5. Pièges : le Top 10

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| **1** | **Skip silencieux** (aucun listener, aucun log) | des lignes disparaissent **sans trace** ; inacceptable quand il s'agit d'argent ; on ne s'en aperçoit qu'à la réconciliation | `SkipListener` qui consigne **numéro de ligne, texte brut, cause** ; compter `skip_count` et **alerter** au-delà d'un seuil |
| **2** | **Retry sur une exception non transitoire** (`NullPointerException`, `IllegalArgumentException`) | on réessaie un bug **3 fois pour rien** et on rallonge le temps avant l'échec ; pire, on masque une régression | `includes(...)` limité aux erreurs **transitoires** (verrou, délai) ; un bug doit **échouer vite** |
| **3** | **Restart d'un job dont le statut n'est pas `FAILED` (ou `STOPPED`)** | `COMPLETED` : `JobInstanceAlreadyCompleteException` ; `STARTED` : refusé (le dépôt croit qu'il tourne) ; mauvais paramètres : **nouvelle** instance, pas une reprise | lire le statut avant (§2.4) ; mêmes paramètres identifiants ; `recover`/`abandon` pour une exécution orpheline (§3.4) |
| 4 | `skipLimit` trop haut (ou illimité) | un fichier **totalement mauvais** passe pour « quelques erreurs » et le lot « réussit » | plafond bas, **alerte** sur le taux de rejets |
| 5 | `.skip(...)` / `.retry(...)` **sans `faultTolerant()`** | les règles sont **ignorées** : la première exception fait échouer le step | `faultTolerant()` d'abord |
| 6 | Skip en **écriture** sans y penser | le chunk est rejoué élément par élément (mode « scan ») : le débit chute | valider **en amont** (Module 4) pour que l'écriture n'échoue pas |
| 7 | Retry avec **effets de bord** ou **totaux** dans le processor | e-mail envoyé deux fois, compteur doublé après rejeu (Module 4, §3.6) | processor **pur** ; écritures idempotentes ; agrégats par `SUM` SQL |
| 8 | Retry **sans pause** ni plafond | on martèle une base déjà en difficulté (« effet de troupeau ») | `delay` + `multiplier` + `jitter` + `maxDelay` |
| 9 | Reader **non reprenable** : pas de `name`, `saveState` désactivé, ou fichier remplacé entre-temps | le restart repart de **zéro**, ou lit un autre fichier | nom unique, `saveState` actif ; fichier **figé** par répertoire d'exécution (Module 3B) |
| 10 | **Arrêt non gracieux** : pas de hook, ou `terminationGracePeriod` plus court qu'un chunk | JVM tuée au milieu : exécution **orpheline** (`STARTED`), restart refusé | hook + délai d'arrêt supérieur à la durée d'un chunk ; procédure `recover` documentée |

**Comment tester la fiabilité.** Trois tests qu'un job de production doit avoir :
1. **Skip** : un fichier contenant 2 lignes mauvaises → job `COMPLETED`, `skip_count = 2`, deux lignes dans le rapport de rejets.
2. **Retry** : un processor qui échoue deux fois puis réussit → job `COMPLETED` ; compter les appels du processor **et** vérifier qu'aucun total n'est compté deux fois.
3. **Restart** : un writer qui échoue au 350e élément → `FAILED`, puis relance avec les **mêmes** paramètres → `COMPLETED`, et `SELECT COUNT(*)` égal au nombre de lignes du fichier : ni plus (doublons), ni moins (pertes).

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 6.1 | Trois problèmes, trois outils | 7 min | §1 |
| 6.2 | Skip : ignorer et consigner | 9 min | §2.1, piège n°1 |
| 6.3 | Retry : la nouvelle politique de Spring Framework 7 | 9 min | §2.2-2.3, §1.2 |
| 6.4 | Sous le capot : rollback et rejeu du chunk | 9 min | §3.2 |
| 6.5 | Restart : comment Spring Batch sait où reprendre | 10 min | §2.4, §3.1 |
| 6.6 | L'arrêt gracieux et l'exécution orpheline | 9 min | §2.5, §3.3-3.4 |
| 6.7 | Top 10 et tests de fiabilité | 7 min | §5 |
| | **Total** | **≈ 60 min** | |

## 7. Exercices

1. **Choisir l'outil.** Pour chacun, skip, retry ou restart ? (a) un montant « 12,5x » dans le CSV ; (b) `CannotAcquireLockException` pendant l'écriture ; (c) le serveur redémarre à 3 h ; (d) un `NullPointerException` dans votre processor.
2. **Le restart.** Un job a écrit 3 400 lignes et échoue à la 3 450e. Quelle position est sauvegardée ? Combien de lignes sont rejouées au restart ? Que se passe-t-il si vous relancez avec un `runDate` différent ?
3. **Mesurer.** Écrivez un processor qui compte ses appels et échoue systématiquement. Avec `RetryPolicy.builder().maxRetries(3)`, combien d'appels voyez-vous pour **un** élément ? Concluez : la tentative initiale est-elle comptée dans `maxRetries` ?
4. **Arrêt.** Un chunk dure 40 s, `terminationGracePeriodSeconds` vaut 30. Que se passe-t-il quand le pod reçoit SIGTERM ? Quel statut a la `JobExecution` ensuite, et que faut-il faire avant de relancer ?
