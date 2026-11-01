# Module 5 · Flux et orchestration

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Essentiel. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 50 à 55 min, en 7 sous-vidéos de 5 à 9 min (voir la fin).
> **Prérequis :** Module 1 (`JobRepository`, statuts en base), Module 2 (singletons, scopes), Module 4 (état partagé).
> Projet de référence : `tp/tpProd`.

---

## 1. Le concept

### 1.1 De la ligne droite au graphe

Jusqu'ici, un job était une suite : step A, puis step B. Un vrai traitement de nuit se **ramifie** :

```
                    ┌──────────────────┐
                    │  loadBankStep    │  charger le fichier
                    └────────┬─────────┘
                             │ (quelle est l'issue ?)
        ┌────────────────────┼─────────────────────┐
        ▼                    ▼                     ▼
   COMPLETED            COMPLETED avec          FAILED
        │               trop de rejets              │
        ▼                    │                      ▼
 ┌────────────────┐          ▼               ┌────────────┐
 │ bankReportStep │    ┌────────────┐        │ alertStep  │
 └────────────────┘    │ alertStep  │        └────────────┘
                       └────────────┘
```

`bankReportStep` produit le rapport de rapprochement ; `alertStep` **prévient l'équipe financière**.

Un job est un **graphe d'états** (des steps, des décisions, des groupes parallèles) relié par des **transitions**.

### 1.2 Enchaînement simple ou flux conditionnel

| | Enchaînement simple | Flux conditionnel |
|---|---|---|
| Écriture | `.start(a).next(b).next(c)` | `.start(a).on("COMPLETED").to(b).from(a).on("FAILED").to(c)` |
| Comportement | si `a` échoue, **le job s'arrête** | on choisit la suite **selon l'issue** de `a` |
| Quand | traitement linéaire | alertes, chemins d'erreur, branches métier |

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Enchaîner les steps : séquence et conditions »** (n°38) du PPT du cours.

### 1.3 `BatchStatus` et `ExitStatus` : la distinction cruciale

Ce sont **deux notions différentes**, souvent confondues :

| | `BatchStatus` | `ExitStatus` |
|---|---|---|
| Nature | **énumération fixe** : `STARTING`, `STARTED`, `STOPPING`, `STOPPED`, `FAILED`, `COMPLETED`, `ABANDONED`… | **texte libre** (un code) |
| Qui le décide | **le framework** | **vous**, si vous le souhaitez ; sinon le framework le déduit |
| Sert à | l'état technique et la **reprise** (Module 6) | **aiguiller** le flux et informer l'extérieur (code de retour) |
| Valeurs courantes | — | `COMPLETED`, `FAILED`, `STOPPED`, `NOOP`, ou votre code (`COMPLETED_WITH_REJECTS`) |

**Le point à retenir :** les transitions `.on("…")` comparent le **code de l'`ExitStatus`**, pas le `BatchStatus`. Par défaut les deux
coïncident (un step réussi a `ExitStatus` `COMPLETED`), ce qui entretient la confusion. Dès que vous posez un code personnalisé, ils divergent.

### 1.4 Les trois outils d'orchestration

1. **Les transitions** (`on`, `to`, `from`, `end`, `fail`, `stopAndRestart`) : aiguiller selon l'`ExitStatus` d'un step.
2. **Le `JobExecutionDecider`** : une **décision** pure, sans traitement, qui lit l'état et renvoie un code. Il sert quand l'`ExitStatus` seul ne suffit pas (par exemple « combien de lignes rejetées ? »).
3. **Le `Split`** : lancer plusieurs flux **en parallèle**, puis attendre qu'ils soient tous terminés.

### 1.5 Flashback

- **Module 1.** Chaque step terminé écrit son statut et son code de sortie dans `batch_step_execution` (`status`, `exit_code`). La reprise s'appuie sur ces
  lignes : un flux conditionnel ne change rien à ce principe, **chaque** step exécuté laisse sa trace.
- **Module 2.** Les beans `Step`, `Flow` et `Job` sont des **singletons** sans état : ils décrivent le graphe. L'exécution, elle, vit dans les `JobExecution`/`StepExecution`.
  Le `TaskExecutor` que nous allons introduire est aussi un **bean singleton** : un seul pool de threads pour toute l'application.

### Références visuelles (§1 Concept)

> Légende : « ✔ vérifié » = titre relevé dans l'extrait de documentation officielle fourni ; « ◻ à confirmer » = page citée, titre exact du schéma à contrôler sur la page avant d'insérer l'image.

**1. Schéma officiel de la documentation Spring Batch**
- ◻ à confirmer : page *Configuring a Job*, section *Controlling Step Flow* (flux conditionnels, `on`/`to`/`from`) : repérer les schémas de flux de la page. Remarque : l'exemple « Job State Machine » de l'URL `…/step/chunk-oriented-processing.html` n'est pas vérifié ; cette page traite du chunk, pas de la machine à états du job.

**2. Schéma ASCII à garder (script vidéo)**
- §1.1 : le graphe `loadBankStep` → `bankReportStep` / `alertStep` : **à garder dans le PPT**.
- §1.3 : le tableau `BatchStatus` / `ExitStatus`.

**3. Schéma personnalisé à créer pour le PPT**
- **Deux voies parallèles** `BatchStatus` (rail technique, géré par le framework) et `ExitStatus` (rail d'aiguillage, texte libre), avec le cas `COMPLETED` / `COMPLETED_WITH_REJECTS`.

---

## 2. Le code, ligne par ligne

### 2.1 Un job avec un flux conditionnel

```java
@Bean
Job bankFlowJob(JobRepository jobRepository,
                Step loadBankStep, Step bankReportStep, Step alertStep) {
  return new JobBuilder("bankFlowJob", jobRepository)                       // 1
      .start(loadBankStep)                                                      // 2
        .on("COMPLETED").to(bankReportStep)                                     // 3
      .from(loadBankStep)                                                       // 4
        .on("FAILED").to(alertStep)                                         // 5
          .on("*").fail()                                                   // 6
      .from(loadBankStep)                                                       // 7
        .on("*").fail()                                                     // 8
      .end()                                                                // 9
      .build();                                                             // 10
}
```

1. Le builder de job, comme au Module 2.
2. Premier step. Son retour est un builder de **flux** (et non plus un `Job` linéaire).
3. Si l'`ExitStatus` de `loadBankStep` vaut `COMPLETED`, on va à `bankReportStep`.
4. On **reprend** depuis `loadBankStep` pour déclarer une autre transition.
5. Si `loadBankStep` a pour code `FAILED`, on va à `alertStep` (prévenir l'équipe financière).
6. Après `alertStep`, quelle que soit l'issue (`*`), le job se termine en **échec** (`.fail()`). Sans cela, un job dont le chargement a échoué pourrait finir « réussi » parce que l'alerte, elle, a réussi (§3.4).
7. Encore une reprise depuis `loadBankStep`.
8. **Filet de sécurité** : tout **autre** code (un code personnalisé oublié, `STOPPED`, `UNKNOWN`) échoue explicitement au lieu de laisser le flux sans issue (piège n°1).
9. `.end()` termine la définition du flux.
10. `.build()` produit le `Job`.

**Le step d'alerte, côté bancaire.** `alertStep` envoie à l'équipe financière un message qui indique **le lot, le nombre de lignes rejetées et le nombre de lignes lues** :

```java
@Component
public class FinanceAlertTasklet implements Tasklet {

  private final AlertSender alertSender;                                           // 1

  public FinanceAlertTasklet(AlertSender alertSender) { this.alertSender = alertSender; }

  @Override
  public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) {
    JobExecution job = contribution.getStepExecution().getJobExecution();          // 2
    StepExecution load = job.getStepExecutions().stream()
        .filter(step -> step.getStepName().equals("loadBankStep"))                 // 3
        .findFirst().orElseThrow();

    alertSender.toFinanceTeam("Chargement du %s : %d lignes rejetées sur %d lues"
        .formatted(job.getJobParameters().getString("runDate"),
                   load.getFilterCount(), load.getReadCount()));                   // 4
    return RepeatStatus.FINISHED;
  }
}

@Bean
Step alertStep(JobRepository jobRepository, PlatformTransactionManager tx, FinanceAlertTasklet tasklet) {
  return new StepBuilder("alertStep", jobRepository).tasklet(tasklet, tx).build();
}
```

1. `AlertSender` est une interface applicative (courriel, messagerie d'équipe) : le composant reste **sans état** (Module 4).
2. Une tasklet retrouve l'exécution du job en cours à partir de sa contribution.
3. On y cherche l'exécution du step de chargement : ses compteurs sont déjà enregistrés.
4. `runDate` (identifiant, Module 3) désigne le lot concerné.

**Les motifs de transition.** Le texte de `.on("…")` est un motif : `*` remplace n'importe quelle suite de caractères, `?` un seul caractère. Quand plusieurs motifs correspondent, **le plus précis l'emporte**
(`COMPLETED` avant `COMP*`, avant `*`) : l'ordre d'écriture ne compte pas.

**Les fins de flux.** `.end()` termine en **réussite**, `.fail()` en **échec**, `.stopAndRestart(step)` arrête le job (statut `STOPPED`) en préparant une reprise au step indiqué.

### 2.2 Poser un code de sortie personnalisé

Pour aiguiller selon un fait métier (« le chargement a réussi, mais avec trop de lignes rejetées »), le step publie son propre code :

```java
@Component
public class RejectsExitListener implements StepExecutionListener {          // 1

  private static final long MAX_REJECTS = 100;

  @Override
  public ExitStatus afterStep(StepExecution stepExecution) {                // 2
    if (stepExecution.getStatus() != BatchStatus.COMPLETED) {               // 3
      return stepExecution.getExitStatus();
    }
    return stepExecution.getFilterCount() > MAX_REJECTS                     // 4
        ? new ExitStatus("COMPLETED_WITH_REJECTS")                          // 5
        : stepExecution.getExitStatus();
  }
}
```

1. Un listener de step, appelé **après** le step.
2. `afterStep` **retourne** l'`ExitStatus` final du step : c'est le moment pour le modifier.
3. On ne touche pas à un step déjà en échec : son code (`FAILED`) reste celui du framework. Le **`BatchStatus` reste inchangé** : seul le code de sortie change.
4. `getFilterCount()` : le nombre d'éléments filtrés ou rejetés (Modules 3 et 4).
5. Un code **libre**. Il devra être aiguillé explicitement (§2.1, ligne `on`) sinon le flux ne sait pas quoi en faire.

Il s'enregistre sur le step : `.listener(rejectsExitListener)`.

### 2.3 Le `JobExecutionDecider` : décider d'après un compteur

Autre approche, quand la décision dépend d'un **chiffre** que le step a laissé dans son contexte :

```java
@Component                                                                   // 1
public class RejectsDecider implements JobExecutionDecider {                 // 2

  @Override
  public FlowExecutionStatus decide(JobExecution jobExecution,
                                    StepExecution stepExecution) {          // 3
    long rejected = stepExecution.getExecutionContext().getLong("rejectedCount", 0L);  // 4
    if (rejected == 0) {
      return new FlowExecutionStatus("NO_REJECTS");                         // 5
    }
    return rejected > 100
        ? new FlowExecutionStatus("TOO_MANY_REJECTS")
        : new FlowExecutionStatus("FEW_REJECTS");
  }
}
```

1. **Pas de `@StepScope`** : un decider s'exécute **entre** deux steps, hors de tout step (§3.3, piège n°3). Un singleton convient, car il est **sans état**.
2. L'interface a une seule méthode.
3. Il reçoit le `JobExecution` complet et le `StepExecution` du **dernier step exécuté**.
4. Il lit un compteur dans le contexte du step. Ce compteur doit avoir été posé auparavant (par exemple par un listener qui y recopie `filterCount`). `getLong(clé, défaut)` évite l'erreur si la clé manque.
5. Un code libre : `FlowExecutionStatus` joue le rôle d'`ExitStatus` pour les décisions. Il existe aussi des constantes (`COMPLETED`, `FAILED`, `STOPPED`, `UNKNOWN`).

Le branchement :

```java
return new JobBuilder("bankDecisionJob", jobRepository)
    .start(loadBankStep)
    .next(rejectsDecider)                                                    // 1
      .on("NO_REJECTS").to(bankReportStep)                                       // 2
    .from(rejectsDecider)
      .on("FEW_REJECTS").to(bankReportStep)
    .from(rejectsDecider)
      .on("TOO_MANY_REJECTS").to(alertStep)                                  // 3
    .from(rejectsDecider)
      .on("*").fail()                                                        // 4
    .end()
    .build();
```

1. Après `loadBankStep`, on passe **par la décision** (elle n'écrit rien en base : ce n'est pas un step).
2. Chaque code renvoyé par le decider a sa transition.
3. Beaucoup de rejets : on alerte au lieu de rapporter.
4. Filet de sécurité, comme au §2.1.

**Decider ou code de sortie ?** Le code de sortie (§2.2) convient à une règle **simple et propre au step**. Le decider convient quand la décision **combine** plusieurs sources ou doit rester **testable seule**, sans lancer de step.

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Le decider : aiguiller selon un résultat »** (n°39) du PPT du cours.

### 2.4 Un `Split` : deux flux en parallèle

```java
@Bean
TaskExecutor flowExecutor() {                                                // 1
  var pool = new ThreadPoolTaskExecutor();
  pool.setThreadNamePrefix("flow-");                                         // 2
  pool.setCorePoolSize(2);                                                   // 3
  pool.setMaxPoolSize(2);
  pool.setQueueCapacity(0);                                                  // 4
  return pool;
}

@Bean
Job parallelJob(JobRepository jobRepository, TaskExecutor flowExecutor,
                Step importAccountsStep, Step importOperationsStep, Step consolidateStep) {

  Flow accountsFlow = new FlowBuilder<SimpleFlow>("accountsFlow")            // 5
      .start(importAccountsStep).build();
  Flow operationsFlow = new FlowBuilder<SimpleFlow>("operationsFlow")
      .start(importOperationsStep).build();

  Flow parallelFlow = new FlowBuilder<SimpleFlow>("parallelFlow")
      .split(flowExecutor)                                                   // 6
      .add(accountsFlow, operationsFlow)                                     // 7
      .build();

  return new JobBuilder("parallelJob", jobRepository)
      .start(parallelFlow)                                                   // 8
      .next(consolidateStep)                                                 // 9
      .end()
      .build();
}
```

1. Un **bean `TaskExecutor`** : le pool de threads qui exécutera les flux. Un singleton partagé (Module 2).
2. Un préfixe de nom de thread : les journaux montrent `flow-1`, `flow-2`. Indispensable pour diagnostiquer.
3. **2 threads** : autant que de flux parallèles à la fois. Un pool plus petit que le nombre de flux les ferait attendre ; un pool illimité saturerait la base (§3.5, piège n°4).
4. Pas de file d'attente : si le pool est plein, la tâche n'est pas mise en attente silencieusement.
5. Un **`Flow`** est un sous-graphe réutilisable. Ici, chacun ne contient qu'un step.
6. `.split(executor)` déclare que les flux ajoutés tournent **chacun sur un thread du pool**.
7. Les flux à lancer en parallèle.
8. Le groupe parallèle est un **état** du job comme un autre.
9. **`consolidateStep` ne démarre qu'après la fin des deux flux** : le `Split` est une barrière de synchronisation.

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Flows en parallèle (split) »** (n°40) du PPT du cours.

---

## 3. Plongée « sous le capot »

### 3.1 La machine à états du job

Un `Job` construit avec les flux est une `SimpleFlow` : un ensemble d'**états** (`StepState`, `DecisionState`, `SplitState`, `FlowState`, `EndState`) et une table de **transitions**.

```
état courant : loadBankStep
   1. exécuter l'état           → le step tourne, laisse sa StepExecution en base (Module 1)
   2. produire un statut        → code de l'ExitStatus du step : "COMPLETED"
   3. chercher la transition    → parmi celles déclarées pour cet état, quelle correspond à "COMPLETED" ?
        motifs candidats : COMPLETED, COMP*, *       → le plus précis gagne
   4. état suivant              → bankReportStep
   5. recommencer, jusqu'à un état de fin (end / fail / stop)
```

Ce que fait chaque état :

| État | Ce qu'il exécute | Le statut produit vient de… |
|---|---|---|
| `StepState` | un step | le **code de l'`ExitStatus`** du step |
| `DecisionState` | un `JobExecutionDecider` | le `FlowExecutionStatus` **retourné** par `decide(...)` |
| `SplitState` | plusieurs flux sur des threads | une **agrégation** : le statut « le plus grave » des flux (échec avant réussite) |
| `FlowState` | un sous-flux | le statut final du sous-flux |
| `EndState` | rien : il termine le job | impose `COMPLETED`, `FAILED` ou `STOPPED` |

**Deux erreurs de configuration révèlent la mécanique.** Elles sont détectées par le moteur de flux :

- **« Next state not found in flow=… for state=… with exit status=… »** : à l'exécution, un état a produit un code (`COMPLETED_WITH_REJECTS`) pour lequel **aucune transition ne correspond**. Le job **échoue immédiatement** (`FlowExecutionException`). Il ne reste pas bloqué en attente : il est `FAILED` et la reprise se fera à ce step. C'est le piège n°1.
- **« No end state was found. You must specify at least one transition with no next state. »** : à la construction, un flux dont **toutes** les transitions mènent à un autre état, sans jamais finir. Le job est refusé au lancement.

### 3.2 Comment l'`ExitStatus` est déduit quand on n'y touche pas

Sans code personnalisé, le step prend un `ExitStatus` **équivalent à son `BatchStatus`** : `COMPLETED` pour un succès, `FAILED` après une exception, `STOPPED` après un arrêt. C'est pourquoi `.on("COMPLETED")` fonctionne dans la plupart des exemples.
Dès qu'un listener (`afterStep`, §2.2) remplace le code, **le `BatchStatus` reste `COMPLETED`** (le step a bien réussi techniquement) alors que l'`ExitStatus` devient `COMPLETED_WITH_REJECTS`. La reprise se base sur le `BatchStatus`, l'aiguillage sur l'`ExitStatus` : les deux ne se mélangent jamais.

> **Cas à tester :** un `ExitStatus` à `FAILED` avec un `BatchStatus` à `COMPLETED` (comme dans `EmptyInputFailer` du Module 3B). Le comportement de reprise dans ce cas est à vérifier sur votre version.

### 3.3 Où s'exécute un decider, et pourquoi pas de `@StepScope`

Un `@StepScope` (Modules 2 et 4) n'existe **que pendant** l'exécution d'un step : le contexte de scope « step » est ouvert au début du step et fermé à sa fin. Un `JobExecutionDecider` est appelé **entre** deux steps, quand aucun contexte de step n'est actif.
Un decider marqué `@StepScope` provoque donc une erreur du type *« pas de contexte de step actif »* dès qu'on le résout (piège n°3).

Que faire de la « portée » d'un decider ?
- Il est **sans état** : un singleton (`@Component`) convient, c'est le choix par défaut ;
- s'il a besoin des paramètres du lancement, `@JobScope` existe : le bean est créé **par exécution de job**, ouvert avant le premier step ;
- il reçoit déjà l'essentiel en argument (`JobExecution`, `StepExecution`) : préférez les **lire** plutôt que les injecter.

### 3.4 BatchStatus du job : qui décide de l'échec ?

Quand un step échoue et qu'une transition mène à `alertStep`, le **job** ne « sait » plus qu'il y a eu un échec : c'est la **façon dont le flux se termine** qui fixe l'état final du job (`end`, `fail`, `stopAndRestart`).
Si l'alerte réussit et que le flux se termine par `.end()`, le job apparaît comme **réussi** alors que le chargement a échoué. Règle : **une branche d'erreur se termine par `.fail()`** quand la panne doit rester visible dans `batch_job_execution` (et pour la supervision, Module 8 *(parcours Complet)*).

### 3.5 Comment le `TaskExecutor` lance les flux en parallèle

```
                  thread « main » (ou thread du lanceur)
                          │
                    SplitState.handle()
          ┌───────────────┴───────────────┐
          ▼ soumet 2 tâches au TaskExecutor ▼
   thread flow-1                       thread flow-2
   accountsFlow                        operationsFlow
   importAccountsStep                  importOperationsStep
   (SA transaction,                    (SA transaction,
    SA StepExecution)                   SA StepExecution)
          │                                │
          └──────────────┬─────────────────┘
                    attente des deux  (Future.get)
                         ▼
                 agrégation des statuts
                         ▼
                   consolidateStep
```

Points clés :

1. **Un thread par flux.** Chaque flux ouvre **ses propres transactions** et ses propres connexions : les steps parallèles ne partagent pas de transaction.
2. Le thread appelant **attend** la fin de tous les flux avant de continuer : c'est la barrière.
3. Chaque step est enregistré séparément dans `batch_step_execution` (Module 1) : on voit en base quel thread (via les journaux, pas la table) et quand.
4. Les **singletons** utilisés dans plusieurs flux sont partagés entre threads : tout état modifiable dedans est une **course** (Module 4).
5. Le **pool de threads et le pool de connexions** sont deux limites distinctes. Avec 2 threads qui ouvrent chacun un curseur, une transaction et le `JobRepository`, il faut **plus de connexions** que de threads (par exemple 3 à 4 par flux). Un pool de 5 connexions avec 4 flux qui s'accaparent chacun 2 connexions se **bloque** : chaque flux attend une connexion que les autres ne rendront pas.

> Un `Split` parallélise des **steps différents**. Pour accélérer **un même step** sur de gros volumes, on utilise le multithread ou le partitionnement (Module 7 *(parcours Complet)*).

### 3.6 Le `Split` et la reprise

Si un flux du `Split` échoue et l'autre réussit, le `SplitState` produit le statut « le plus grave » (échec). Le job échoue ; à la reprise (Module 6), **seul le step en échec est rejoué** : les steps `COMPLETED` ne le sont pas, sauf `allowStartIfComplete(true)`. Le decider, lui, est **réévalué** à chaque exécution du job, y compris en reprise : il doit donc être **déterministe** et sans effet de bord.

### Références visuelles (§3 Sous le capot)

**1. Schéma officiel de la documentation Spring Batch**
- ◻ à confirmer : page *Scaling and Parallel Processing* (parallèle, `Split`) pour les schémas de parallélisation.
- ✔ vérifié : « Partitioned Process » (extrait d'architecture fourni) : à réserver au Module 7 *(parcours Complet)*, pas au `Split`.

**2. Schéma ASCII à garder (script vidéo)**
- §3.1 : la machine à états en 5 temps (exécuter / produire un statut / chercher la transition / état suivant / fin) : à garder pour la narration.
- §3.5 : le schéma des threads du `Split` : bon pour le script.

**3. Schéma personnalisé à créer pour le PPT**
- **Machine à états** en couleurs : états `StepState`, `DecisionState`, `SplitState`, `EndState`, transitions étiquetées par motif (`COMPLETED`, `*`), un chemin « Next state not found » en rouge.
- **Split** : thread 1 en bleu, thread 2 en vert, barrière de synchronisation en rouge, `consolidateStep` après la barrière.
- **Pool de connexions** : 2 flux × 3 connexions + `JobRepository`, jauge de pool qui sature.

---

## 4. Cas d'usage

### 4.1 L'import avec alerte

Le fichier du soir est chargé ; si plus de 100 lignes sont rejetées, **le rapport est remplacé par une alerte** envoyée à l'équipe, et le job termine en échec pour que la supervision le voie. Un code de sortie (§2.2) ou un decider (§2.3) en est le support.

### 4.2 Deux sources indépendantes

Les comptes (fichier) et les opérations (base) se chargent **en même temps** (§2.4) : le temps total est celui du plus long, non la somme. La consolidation attend les deux.

### 4.3 Le bon chemin selon le jour

Un job de fin de mois exécute une étape de clôture supplémentaire seulement le dernier jour ouvré : un decider qui lit un paramètre ou la date renvoie `MONTH_END` ou `NORMAL`, aiguillant vers la clôture ou directement vers le rapport.

---

## 5. Pièges : le Top 10

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| **1** | **`ExitStatus` personnalisé non aiguillé** | « Next state not found… with exit status=… » : le job échoue sans exécuter ce qu'on attendait | une transition pour chaque code, et un **filet** `.on("*")` |
| 2 | Confondre `BatchStatus` et `ExitStatus` | `.on("FAILED")` ne se déclenche pas : le code a été changé, ou le statut est autre | aiguiller sur le **code de sortie**, décider de la reprise sur le `BatchStatus` |
| **3** | **`JobExecutionDecider` en `@StepScope`** | erreur de contexte de scope : aucun step n'est actif entre deux steps | singleton sans état, ou `@JobScope` ; lire les arguments de `decide(...)` |
| **4** | **`Split` avec un `TaskExecutor` mal dimensionné** | pool trop grand → saturation de la base ; pool trop petit ou file illimitée → flux en attente, voire blocage si des splits sont imbriqués sur le même pool | pool borné, nommé, pas de file silencieuse ; pool plus petit que le pool de connexions |
| 5 | Pool de **connexions** inférieur aux besoins des flux parallèles | blocage : chacun attend une connexion détenue par un autre | dimensionner `maximumPoolSize` pour (flux × connexions par flux) + `JobRepository` |
| 6 | Branche d'erreur terminée par `.end()` | l'alerte réussit, le job apparaît **réussi** malgré l'échec du chargement | terminer par `.fail()` |
| 7 | État partagé entre flux parallèles | singleton avec champ modifiable modifié par deux threads (Module 4, en pire) | composants sans état, ou `@StepScope` par flux |
| 8 | Decider avec effets de bord ou requêtes lourdes | réévalué à chaque reprise : effet répété, lenteur | decider **pur** : il lit, il décide, il ne modifie rien |
| 9 | Motifs de transition mal compris | `COMP*` capte aussi `COMPLETED_WITH_REJECTS` ; `*` capte tout ; **le plus précis gagne, pas le premier écrit** | tester chaque chemin ; motifs explicites |
| 10 | Flux construit sans état final | « No end state was found… » : le job est refusé | au moins une transition sans suite (`end`, `fail`, `stopAndRestart`) |

**Comment tester un flux.** Un job à embranchements se teste **chemin par chemin** : un test par issue (`COMPLETED`, `FAILED`, `COMPLETED_WITH_REJECTS`, code inconnu). Vérifier à chaque fois quels steps ont été exécutés (`batch_step_execution`) et le statut final du job. Un decider se teste **seul**, en l'appelant avec une `StepExecution` fabriquée à la main : c'est son principal avantage sur un code de sortie.

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 5.1 | Du pipeline au graphe | 6 min | §1.1-1.2, §1.5 |
| 5.2 | `BatchStatus` contre `ExitStatus` | 8 min | §1.3, §2.2, §3.2 |
| 5.3 | Un flux conditionnel, ligne par ligne | 8 min | §2.1, §3.4 |
| 5.4 | Le decider | 8 min | §2.3, §3.3 |
| 5.5 | Sous le capot : la machine à états | 8 min | §3.1 |
| 5.6 | Le `Split` et les threads | 9 min | §2.4, §3.5-3.6 |
| 5.7 | Tester les chemins et Top 10 | 8 min | §5 |
| | **Total** | **≈ 55 min** | |

## 7. Exercices

1. **Statuts.** Un step `loadBankStep` réussit, mais son listener remplace le code par `COMPLETED_WITH_REJECTS`. Que valent son `BatchStatus` et son `ExitStatus` ? Vers quel step le flux du §2.1 va-t-il ? Que se passe-t-il si l'on retire la transition `.on("*").fail()` ?
2. **Decider.** Pourquoi un `JobExecutionDecider` ne peut-il pas être `@StepScope` ? Citez deux façons correctes de lui fournir ce dont il a besoin.
3. **Split.** Deux flux parallèles utilisent chacun 3 connexions, plus 1 pour le `JobRepository`. Quel est le minimum de connexions du pool pour éviter le blocage ? Pourquoi un pool de threads à 20 n'accélère-t-il pas un `Split` de 2 flux ?
4. **Terminaison.** Un job dont la branche d'erreur se termine par `.end()` est « réussi » alors que `loadBankStep` a échoué. Comment le détecter dans `batch_job_execution`, et comment le corriger ?
