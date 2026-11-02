# Module 2 (complément) · Paramètres, listeners et cycle de vie d'un job

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Complet : **Optionnel / Avancé**. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 15 à 20 min, en 5 sous-vidéos.
> **Prérequis :** Modules 1 et 2 (`JobInstance`, paramètres identifiants, premier job).
> **Sources :** classes de Spring Batch 6.0.6 lues dans les jars (`spring-batch-core`, `spring-boot-batch` 4.1.2), et les chapitres « Jobs et steps » des ouvrages de référence
> (Spring Batch 4 et 5), **reformulés et adaptés** au cas bancaire du cours.
> Projet de référence : `tp/tpProd`.

---

## 1. Le concept

### 1.1 Le cycle de vie d'un job, en une image

Quand on lance un job, il traverse toujours les mêmes étapes :

1. **Le videur à l'entrée** : le *validateur de paramètres* vérifie que les paramètres sont complets et corrects. S'il refuse, le job ne démarre pas.
2. **Le chef de chantier** : le *listener de job* note l'arrivée (`beforeJob`) puis, quand tout est fini, le départ (`afterJob`), **quelle que soit la fin** (réussite ou échec).
3. **Les ouvriers** : les steps s'exécutent. Chaque step a son propre listener (`beforeStep`, `afterStep`) et son propre carnet de notes (`ExecutionContext`).
4. **Le passage de consignes** : une note écrite dans le carnet d'un step peut être recopiée dans le carnet du job pour que les steps suivants la lisent.

### 1.2 Ce qui a changé depuis les livres (à savoir avant de copier un tutoriel)

Vérifié dans les jars de la 6.0.6 :

| Dans les livres (Spring Batch 4 et 5) | Dans Spring Batch 6.0.6 |
|---|---|
| `JobParametersInvalidException` | **`InvalidJobParametersException`** |
| `org.springframework.batch.core.JobParameters…` | **`org.springframework.batch.core.job.parameters.*`** |
| `org.springframework.batch.core.JobExecutionListener` | **`org.springframework.batch.core.listener.JobExecutionListener`** |
| `JobBuilderFactory` / `StepBuilderFactory` | disparus : `new JobBuilder(nom, jobRepository)` |
| `JobLauncher` pour lancer | **`JobOperator`** (Module 1) |
| `spring.batch.job.names` (liste) | propriété **`spring.batch.job.name`** (un seul nom) dans `BatchProperties` de Spring Boot 4.1 |
| `JobListenerFactoryBean` pour les annotations | `.listener(objet)` accepte directement un objet annoté `@BeforeJob` / `@AfterJob` |
| `@EnableBatchProcessing` | inutile avec Spring Boot 4 : la configuration est automatique |

### 1.3 Le catalogue de ce module

| Besoin | Outil | Image |
|---|---|---|
| Refuser des paramètres incorrects | `JobParametersValidator`, `DefaultJobParametersValidator`, `CompositeJobParametersValidator` | le videur |
| Forcer une nouvelle instance à la demande | `RunIdIncrementer` (détail : **Annexe 1**) | le compteur de tickets |
| Réagir au début et à la fin du job | `JobExecutionListener` | le chef de chantier |
| Réagir au début et à la fin d'un step | `StepExecutionListener` | le contremaître |
| Passer une note d'un step aux suivants | `ExecutionContextPromotionListener` | recopier une note d'un carnet à l'autre |
| Réutiliser une suite de steps | `Flow`, `FlowStep`, `JobStep` | plan réutilisable, ou sous-traitant |
| Un step qui appelle du code existant | `MethodInvokingTaskletAdapter`, `CallableTaskletAdapter`, `SystemCommandTasklet` | les outils tout faits |

---

## 2. Le code, ligne par ligne

### 2.1 Le videur : valider les paramètres

```java
@Bean
JobParametersValidator statementValidator() {
  return new DefaultJobParametersValidator(
      new String[] {"runDate"},                                    // 1
      new String[] {"format"});                                    // 2
}

@Bean
Job statementJob(JobRepository jobRepository, Step step, JobParametersValidator statementValidator) {
  return new JobBuilder("statementJob", jobRepository)
      .validator(statementValidator)                               // 3
      .start(step)
      .build();
}
```

1. Clés **obligatoires** : sans `runDate`, le lancement est refusé.
2. Clés **autorisées mais facultatives**. **Toute autre clé est refusée** dès qu'on déclare des clés facultatives (voir le piège du §5).
3. Le validateur se branche sur le builder du job. Le refus lève une **`InvalidJobParametersException`** : le job n'est jamais exécuté.

Pour une règle métier (format de date, valeur autorisée), on écrit son propre validateur : une méthode `validate(JobParameters)` qui lève `InvalidJobParametersException` en cas de refus.
`CompositeJobParametersValidator` enchaîne plusieurs validateurs (le builder n'en accepte qu'un).

### 2.2 Rappel : `RunIdIncrementer`, une nouvelle instance à la demande

> *Tu as un job de reporting à la demande. Tu veux qu'il tourne à chaque clic, même si la date métier n'a pas changé. Comment forcer une nouvelle instance sans casser la reprise ?*

**C'est le rôle de `RunIdIncrementer`.** Il ajoute un paramètre `run.id` qui s'incrémente tout seul, et ce paramètre est **identifiant** : une nouvelle valeur, donc une nouvelle `JobInstance`.
Trois choses à retenir : il se déclare avec `.incrementer(new RunIdIncrementer())` ; il ne s'applique qu'avec `JobOperator.startNextInstance(...)`, pas avec `start(job, params)` ;
et un validateur qui liste des clés facultatives doit **inclure `run.id`**, sinon il refuse l'incrémenteur.
**Pour les détails et le code, regarde l'Annexe 1** (la `JOB_KEY`, la requête SQL, le piège du timestamp).

### 2.3 Le chef de chantier : un listener de job

```java
public class StatementJobListener implements JobExecutionListener {

  @Override public void beforeJob(JobExecution execution) {                 // 1
    log.info("Début de {}", execution.getJobInstance().getJobName());
  }

  @Override public void afterJob(JobExecution execution) {                  // 2
    if (execution.getStatus() == BatchStatus.COMPLETED) {                   // 3
      log.info("Terminé : {} lignes", total(execution));
    } else {
      alertTeam(execution);                                                 // 4
    }
  }
}
```

1. Appelé **avant** le premier step. Les deux méthodes ont une implémentation par défaut vide : on ne redéfinit que celle dont on a besoin.
2. Appelé **à la fin, quelle que soit l'issue**.
3. D'où le test sur le statut : sans lui, on enverrait « terminé » même après un échec.
4. Usage typique : notifier, nettoyer des fichiers temporaires, libérer une ressource. Un nettoyage ne doit pas changer l'issue du job.

Branchement : `.listener(new StatementJobListener())`. Une classe sans interface, avec des méthodes annotées `@BeforeJob` et `@AfterJob`, se branche avec le même `.listener(objet)`.

### 2.4 Le contremaître et le passage de consignes

Un listener de step ressemble à celui du job (`beforeStep`, `afterStep`). Une différence : **`afterStep` retourne un `ExitStatus`**, et peut donc **changer l'issue du step** (par exemple en `COMPLETED WITH SKIPS`).

Chaque step a son carnet (`ExecutionContext` du step) ; le job a le sien. Une note écrite dans le carnet d'un step **n'est pas visible** des steps suivants. Pour la leur transmettre :

```java
@Bean
ExecutionContextPromotionListener promotion() {
  var listener = new ExecutionContextPromotionListener();
  listener.setKeys(new String[] {"totalLines"});                           // 1
  return listener;
}
// dans le step : .listener(promotion)
```

1. À la fin du step, la clé `totalLines` est **recopiée du carnet du step vers le carnet du job**. Par défaut, **uniquement si le step a réussi** (`setStatuses` change cette règle) ; `setStrict(true)` fait échouer le step si la clé est absente.

### 2.5 Réutiliser une suite de steps : flow, `FlowStep`, `JobStep`

| Option | Ce qu'on voit dans le `JobRepository` | Image | Quand |
|---|---|---|---|
| Flow passé au job | les steps du flow, **comme s'ils étaient écrits dans le job** | un plan de travail photocopié | simple réutilisation |
| `FlowStep` | **une ligne de plus** : le step qui englobe le flow | le plan, avec un titre | suivre le flow comme un tout dans le monitoring |
| `JobStep` | **un autre job** : sa propre `JobInstance` et sa propre exécution | un sous-traitant avec son propre dossier | job vraiment indépendant |

```java
new StepBuilder("initStep", jobRepository)
    .job(preProcessingJob)                                                  // 1
    .parametersExtractor(extractor)                                         // 2
    .build();
```

1. `StepBuilder.job(...)` crée un `JobStep`. Pour un `FlowStep` : `StepBuilder.flow(...)`.
2. Le job enfant a **ses propres paramètres** : un `DefaultJobParametersExtractor` les prend dans les paramètres du parent (`setKeys`, ou `setUseAllParentParameters(true)`).

> **Garde-fou.** Enchaîner des jobs par des `JobStep` donne des arbres difficiles à piloter : on ne peut plus suspendre ou sauter un job intermédiaire sans toucher au maître. Pour enchaîner, préférer un planificateur ou un job unique.

### 2.6 Les outils tout faits : trois tasklets

```java
var shell = new SystemCommandTasklet();
shell.setCommand("tar", "czf", "archive.tgz", "export/");                    // 1
shell.setTimeout(60_000);                                                    // 2
shell.setWorkingDirectory("/var/batch");                                     // 3
shell.setInterruptOnCancel(true);                                            // 4
```

1. En version 6, la commande est donnée **en morceaux** (`String...`) : pas d'interprétation par un shell, donc pas d'injection par concaténation.
2. Délai maximal en millisecondes : au-delà, le step échoue.
3. Dossier de travail.
4. Si le job est arrêté, le processus est interrompu.

- `MethodInvokingTaskletAdapter` : appelle une méthode d'un bean existant (`setTargetObject`, `setTargetMethod`), une fois. Idéal pour réutiliser un service sans écrire de tasklet.
- `CallableTaskletAdapter` : exécute un `Callable<RepeatStatus>`. **Le step attend** qu'il termine : ce n'est pas du parallélisme.
- Le code de sortie d'une commande se traduit en statut avec un `SystemProcessExitCodeMapper`.

### 2.7 Lancer depuis l'extérieur

Avec Spring Boot 4.1, le lancement au démarrage est assuré par `JobLauncherApplicationRunner`, et le code de sortie du processus par `JobExecutionExitCodeGenerator`
(ce qui permet à un `cron` ou à un orchestrateur de savoir si le job a réussi). La propriété `spring.batch.job.name` choisit le job à lancer quand il y en a plusieurs.
`CommandLineJobRunner` existe toujours, mais le chemin habituel est celui de Spring Boot. Pour un lancement **planifié depuis l'application**, voir le Module 8 (`@Scheduled` appelant le `JobOperator`).

---

## 3. Plongée « sous le capot »

### 3.1 Qui ouvre quoi, et dans quel ordre

Validation → incrémenteur (si `startNextInstance`) → `beforeJob` → steps (avec `beforeStep` / `afterStep`) → `afterJob`. Un listener qui lève une exception peut perturber le job : le garder **court et sûr**.

### 3.2 Pourquoi `afterJob` s'exécute même après un échec

C'est voulu : c'est l'endroit du nettoyage. Un job qui échoue doit libérer ses fichiers temporaires comme un job qui réussit. D'où le test explicite du statut avant d'annoncer une réussite.

### 3.3 Promotion : pourquoi « seulement si le step a réussi »

Une note venant d'un step **échoué** décrit un état incomplet. La recopier dans le carnet du job ferait lire aux steps suivants une donnée à moitié construite. La règle par défaut protège ce cas.

---

## 4. Cas d'usage

### 4.1 Le rapport à la demande

Paramètres : `customerId` (obligatoire), `format` (facultatif). Validateur qui accepte aussi `run.id`. `RunIdIncrementer` pour qu'un deuxième clic crée une nouvelle instance.

### 4.2 Le job qui prévient l'équipe

`JobExecutionListener` : un message de réussite avec le total, ou une alerte avec le statut et les erreurs.

### 4.3 Le total qui voyage

Le step de chargement compte les lignes et promeut `totalLines`. Le step de contrôle suivant le lit dans l'`ExecutionContext` du job.

---

## 5. Pièges

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| 1 | Validateur avec clés facultatives qui oublie `run.id` | le lancement est refusé à cause de l'incrémenteur | ajouter `run.id` aux clés facultatives (§2.2) |
| 2 | `afterJob` qui annonce « terminé » sans tester le statut | message de réussite après un échec | tester `BatchStatus` (§2.3) |
| 3 | Lire dans un step une note écrite dans un autre sans promotion | valeur absente (`null`) | `ExecutionContextPromotionListener` (§2.4) |
| 4 | Clé promue absente et `setStrict(false)` | la valeur manque, **sans erreur** | `setStrict(true)` |
| 5 | Listener de job qui lève une exception | peut perturber l'issue du job | listener court, `try/catch` autour des notifications |
| 6 | Chaîne de `JobStep` sur plusieurs niveaux | impossible de suspendre un job intermédiaire | un seul niveau, ou un planificateur |
| 7 | `JobStep` sans extracteur de paramètres | le job enfant démarre **sans paramètres** | `DefaultJobParametersExtractor` (§2.5) |
| 8 | `CallableTaskletAdapter` pris pour du parallélisme | le step attend quand même | `split` ou step multithread (Modules 5 et 7) |
| 9 | `SystemCommandTasklet` sans timeout | un processus bloqué bloque le step | `setTimeout` (§2.6) |
| 10 | Copier `JobParametersInvalidException` ou `JobBuilderFactory` d'un tutoriel | erreur de compilation | noms de la 6.0.6 (§1.2) |

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 2B.1 | Le videur : valider les paramètres | 4 min | §2.1, §5 piège 1 |
| 2B.2 | Rappel : une nouvelle instance à la demande | 2 min | §2.2 (renvoi vers l'Annexe 1) |
| 2B.3 | Le chef de chantier : les listeners | 4 min | §2.3, §3.2 |
| 2B.4 | Passer une consigne d'un step à l'autre | 4 min | §2.4, §3.3 |
| 2B.5 | Réutiliser des steps, outils tout faits, lancement | 6 min | §2.5 à 2.7 |
| | **Total** | **≈ 20 min** | |

## 7. Exercices

1. **Videur.** Un job déclare `requiredKeys = {runDate}` et `optionalKeys = {format}`. On lance avec `runDate=2026-11-02 mode=test`. Que se passe-t-il ? Et si on ajoute un `RunIdIncrementer` ?
2. **Chef de chantier.** Le job échoue au deuxième step. Quelles méthodes de listener sont appelées ? Que contient `getStatus()` dans `afterJob` ?
3. **Consigne.** Le step 1 écrit `totalLines` dans son carnet. Le step 2 lit `totalLines` dans le carnet du job et trouve `null`. Qu'oublie-t-on ? Que change `setStrict(true)` ?
4. **Sous-traitant.** Quelle différence voit-on dans `batch_job_instance` entre un `FlowStep` et un `JobStep` ?
5. **Commande.** Pourquoi `setCommand("tar", "czf", "a.tgz", "x/")` est-il plus sûr qu'une seule chaîne de caractères ?

---

> *« Vous maîtrisez maintenant les paramètres et le cycle de vie d'un job. Le Module 3 (chunk) vous attend pour entrer dans le cœur de Spring Batch. »*
