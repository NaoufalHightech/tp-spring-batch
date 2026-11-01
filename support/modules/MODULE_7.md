# Module 7 · Mise à l'échelle et multi-instance

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Complet : **Optionnel / Avancé**. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 65 à 70 min, en 9 sous-vidéos de 5 à 9 min (voir la fin).
> **Prérequis :** Module 1 (`JobRepository`, colonne `version`), Module 3 (reader, `ItemStream`), Module 4 (état partagé), Module 5 (`Split`, pools), Module 6 (restart).
> Projet de référence : `tp/tpProd`.
>
> **Légende des sections :** les parties marquées **(Théorique)** donnent le code et l'architecture à partir des classes de Spring Batch 6.0.6, mais n'ont pas été exécutées.
> Les lignes `🖼️ [RÉFÉRENCE PPT]` renvoient aux diapositives du PPT du cours.
>
> **Sources :** chapitre 11 (« Scaling and Tuning ») de *The Definitive Guide to Spring Batch*, M. T. Minella, **reformulé et adapté** à Spring Batch 6.0.6.
> Le chapitre 12 (« Cloud Native Batch ») est réservé au Module 8.

---

## 1. Le concept

### 1.1 Mesurer avant d'optimiser

Une règle ancienne de l'optimisation : **ne pas optimiser** ; et, pour les experts, **pas encore**. On passe à l'échelle **après** avoir trouvé le goulot, pas avant. Un job qui ne tient pas dans ses délais a souvent
un défaut que le parallélisme ne guérit pas : une boucle accidentelle dans un processor, une requête par élément (Module 4, piège n°8), une chaîne qui grossit sans fin. Paralléliser un code défaillant le rend défaillant **plus vite**.

Avant tout :
1. **Mesurer** où va le temps : processeur (le CPU travaille-t-il sur votre logique, ou sur l'analyse des fichiers ?), mémoire (que contient le tas ?), entrées-sorties (la base ou le disque sont-ils saturés ?).
2. **Outils :** *Java Flight Recorder* (fourni avec le JDK, utilisable sur une JVM de production) et *VisualVM* (outil externe, onglets Monitor, Threads, Sampler) ; un échantillonnage du CPU désigne les méthodes les plus coûteuses, une comparaison de deux instantanés mémoire désigne ce qui s'accumule.
3. **Corriger** les défauts de code d'abord. Ensuite seulement, choisir une stratégie ci-dessous.

La plupart des traitements par lots sont **limités par les entrées-sorties** (base, fichiers), pas par le CPU : c'est ce qui oriente le choix.

### 1.2 Pourquoi et quand passer à l'échelle

| Déclencheur | Exemple |
|---|---|
| **Volume** qui grossit | 2 millions de lignes hier, 50 millions dans un an |
| **SLA** (fenêtre de traitement) | « le rapprochement doit être fini à 6 h, il se termine à 8 h » |
| **Disponibilité** | un seul serveur est un point de défaillance |

### 1.3 Les approches, de la plus simple à la plus complexe

```
        UN SEUL SERVEUR (une JVM)                                 PLUSIEURS SERVEURS
┌───────────────────────────────────────────────────────┐   ┌──────────────────────────────────┐
│ 1. Step multithread       un step, N chunks en //     │   │ 5. Partitionnement DISTRIBUÉ     │
│ 2. Flux parallèles        N steps différents en //    │   │    (remote partitioning)         │
│    (Split, Module 5)                                  │   │ 6. REMOTE CHUNKING               │
│ 3. Traitement asynchrone  le processor seul en //     │   │ 7. Compétition sur une file      │
│    (AsyncItemProcessor)                               │   │    (SKIP LOCKED, §2.5)           │
│ 4. Partitionnement LOCAL  N steps identiques, plages  │   └──────────────────────────────────┘
│    de données disjointes                              │
└───────────────────────────────────────────────────────┘
```

| Approche | Ce qui est parallélisé | Servez-vous-en quand | Point faible |
|---|---|---|---|
| **Step multithread** | les **chunks** d'un même step | gain rapide, reader déjà thread-safe | état du reader, **pas de restart au chunk près**, ordre perdu |
| **Flux parallèles** (`Split`) | des **steps différents** | sources indépendantes | ne parallélise pas **un** gros step |
| **`AsyncItemProcessor`** | seulement le **processor** | le processor est lent (calcul, appel externe) | lecture et écriture restent séquentielles |
| **Partitionnement local** | le **même** step sur des **plages disjointes** | gros volume, I/O, un serveur suffit | limité à une JVM |
| **Partitionnement distribué** | idem, sur **plusieurs JVM** | un serveur ne suffit plus | infrastructure de messages |
| **Remote chunking** | le **processor**, sur d'autres JVM | **le traitement** est le goulot, pas l'I/O | les **données** transitent par le réseau |
| **File avec `SKIP LOCKED`** | des lignes réservées par chaque instance | travail en continu, instances interchangeables | conception de la réservation à votre charge |

> 🖼️ [RÉFÉRENCE PPT] : Utiliser les diapositives **« Flows en parallèle (split) »** (n°40) et **« Partitions : le même step, des plages différentes »** (n°41).

### 1.4 La question du multi-instance : deux serveurs, un seul travail

Deux situations très différentes, souvent confondues :

| Situation | Question | Réponse |
|---|---|---|
| **Éviter les doublons** | deux serveurs déclenchent **le même job** (même `runDate`) : qui l'exécute ? | **le `JobRepository`** : un seul démarre, l'autre reçoit `JobExecutionAlreadyRunningException` (Module 1) |
| **Se partager le travail** | deux serveurs **veulent** travailler ensemble sur le même volume | le **partitionnement** (découpage décidé à l'avance) ou la **réservation de lignes** `SKIP LOCKED` (chacun prend ce qui est libre) |

### 1.5 Flashbacks

- **Module 1.** Tous les serveurs doivent partager **la même base** de métadonnées : c'est elle qui fait de plusieurs processus **un seul** système. La colonne `version` et l'isolation de création arbitrent les conflits.
- **Module 4.** Un composant singleton avec un état modifiable devient, avec **plusieurs threads**, une **course** : le double comptage passe de « bug à retardement » à « résultats aléatoires ».
- **Module 5.** Le `Split` parallélise des **steps** différents, avec un pool de threads à dimensionner. Le partitionnement parallélise **un même step** sur des **données** différentes ; il réutilise la même mécanique (pool de threads, connexions).

---

### Références visuelles (§1 Concept)

> Légende : « ✔ vérifié » = titre relevé dans l'extrait de documentation officielle fourni ; « ◻ à confirmer » = page citée, titre à contrôler avant d'insérer l'image.

**1. Schéma officiel de la documentation Spring Batch**
- ✔ vérifié : « Partitioned Process » (page *Spring Batch Architecture*), pour le principe du partitionnement.
- ◻ à confirmer : page *Scaling and Parallel Processing* (multithread, steps parallèles, remote chunking, partitionnement) : repérer un schéma par approche.

**2. Schéma ASCII à garder (script vidéo)**
- §1.3 : le panorama « un serveur / plusieurs serveurs » (fil conducteur du module).

**3. Schéma personnalisé à créer pour le PPT**
- **Arbre de choix** : le goulot est-il l'I/O, le traitement, ou le temps d'attente ? → multithread, partitionnement, remote chunking.
- Schéma « **deux situations du multi-instance** » (éviter les doublons contre se partager le travail).

---

## 2. Le code, ligne par ligne

### 2.1 Un step multithread

```java
@Bean
AsyncTaskExecutor chunkExecutor() {
  var executor = new SimpleAsyncTaskExecutor("chunk-");                       // 1
  executor.setConcurrencyLimit(4);                                            // 2
  return executor;
}

@Bean
Step loadBankMtStep(JobRepository jobRepository, PlatformTransactionManager tx,
                    JdbcPagingItemReader<RawTransaction> pagedReader,
                    CompositeItemProcessor<RawTransaction, BankTransaction> bankProcessor,
                    JdbcBatchItemWriter<BankTransaction> bankDbWriter,
                    AsyncTaskExecutor chunkExecutor) {

  return new StepBuilder("loadBankMtStep", jobRepository)
      .<RawTransaction, BankTransaction>chunk(100)                            // 3
      .transactionManager(tx)
      .reader(pagedReader)                                                    // 4
      .processor(bankProcessor)
      .writer(bankDbWriter)
      .taskExecutor(chunkExecutor)                                            // 5
      .build();
}
```

1. Un exécuteur asynchrone avec un **préfixe de nom de thread** : indispensable pour lire les journaux.
2. **Plafond de 4 chunks simultanés** (`setConcurrencyLimit`, *à confirmer en Spring Framework 7*). Sans limite, un `SimpleAsyncTaskExecutor` crée un thread **par tâche**, sans recyclage : à proscrire en production tel quel.
3. Même chunk qu'au Module 3. **Chaque chunk, dans son thread, a sa propre transaction.**
4. Le reader doit être **thread-safe** : un reader paginé l'est ; un reader de fichier ou un curseur ne l'est pas (§3.4).
5. En version 6, `taskExecutor(...)` du builder de chunk attend un **`AsyncTaskExecutor`** (le `TaskExecutor` simple de la version 4 ne suffit plus).

**Rendre un reader non thread-safe utilisable :**

```java
var shared = new SynchronizedItemStreamReader<RawTransaction>(bankCsvReader);     // 1
// ... dans le step :
.reader(shared).stream(shared)                                                    // 2
```

1. Un décorateur qui **sérialise** les appels à `read()` : un seul thread à la fois lit. Le reste (traitement, écriture) reste parallèle.
2. Le décorateur est lui-même un `ItemStream` : on l'enregistre.

**Le prix à payer :** avec plusieurs threads, les chunks se terminent **dans le désordre** ; une « position de lecture » n'a donc plus de sens. Un reader de fichier doit alors avoir `saveState(false)` (Module 3B) : **plus de reprise au chunk près**. Pour garder la reprise, on partitionne (§2.3).

### 2.2 Traiter plus vite sans toucher à la lecture : `AsyncItemProcessor`

Quand **seul le processor** est lent (calcul coûteux, appel à un service), on le sort sur d'autres threads, et le writer reçoit des résultats « futurs » :

```java
@Bean
AsyncItemProcessor<RawTransaction, BankTransaction> asyncProcessor(
    CompositeItemProcessor<RawTransaction, BankTransaction> bankProcessor,
    TaskExecutor processorExecutor) {
  var async = new AsyncItemProcessor<RawTransaction, BankTransaction>();          // 1
  async.setDelegate(bankProcessor);                                               // 2
  async.setTaskExecutor(processorExecutor);                                       // 3
  return async;
}

@Bean
AsyncItemWriter<BankTransaction> asyncWriter(JdbcBatchItemWriter<BankTransaction> bankDbWriter) {
  var async = new AsyncItemWriter<BankTransaction>();                             // 4
  async.setDelegate(bankDbWriter);
  return async;
}
```

```java
.<RawTransaction, Future<BankTransaction>>chunk(100)                              // 5
.reader(reader).processor(asyncProcessor).writer(asyncWriter)
```

1. Il **décore** votre processor ; il vit dans le module `spring-batch-integration` (dépendance à ajouter).
2. Le vrai traitement.
3. Le pool qui exécute chaque `process(...)` sur un thread.
4. **Les deux vont toujours ensemble** : le writer « déballe » les `Future` et passe les résultats au writer réel.
5. Le **type de sortie du chunk change** : `Future<BankTransaction>`, puisque c'est ce que le processor asynchrone renvoie.

Exemple d'ordre de grandeur : un traitement de **5 ms par élément** sur **1 million** d'éléments représente environ **1 h 23** en séquentiel ; réparti sur 8 threads, il tombe à environ 10 minutes, si le reste ne devient pas le goulot.

### 2.3 Le partitionnement local

Principe : un **step maître** (*manager*) découpe les données en **plages disjointes** ; pour chaque plage, un **step ouvrier** (*worker*) complet (reader, processor, writer) s'exécute, chacun avec **sa propre `StepExecution`**, donc sa propre reprise.

```
                   ┌───────────────────────────┐
                   │ managerStep               │  1. Partitioner.partition(gridSize=4)
                   │ (pas de lecture ni d'écr.)│     → 4 ExecutionContext {minId, maxId}
                   └─────────────┬─────────────┘
                                 │ 2. une StepExecution par plage (écrites dans le JobRepository)
        ┌──────────────┬─────────┴────┬──────────────┐
        ▼              ▼              ▼              ▼
  workerStep:      workerStep:   workerStep:    workerStep:
  partition0       partition1    partition2     partition3
  ids 1–2500       2501–5000     5001–7500      7501–10000      3. un thread chacun (TaskExecutor)
        └──────────────┴────────┬─────┴──────────────┘
                                ▼
                    4. agrégation des statuts → managerStep COMPLETED / FAILED
```

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Partitions : le même step, des plages différentes »** (n°41) pour le schéma manager / partitions / workers.

**Le découpage : le `Partitioner`**

```java
@Component
public class IdRangePartitioner implements Partitioner {

  private final JdbcTemplate jdbc;

  public IdRangePartitioner(JdbcTemplate jdbc) { this.jdbc = jdbc; }

  @Override
  public Map<String, ExecutionContext> partition(int gridSize) {                 // 1
    long min = jdbc.queryForObject("SELECT COALESCE(MIN(id), 0) FROM staging_transaction", Long.class);
    long max = jdbc.queryForObject("SELECT COALESCE(MAX(id), 0) FROM staging_transaction", Long.class);
    long size = Math.ceilDiv(max - min + 1, gridSize);                           // 2

    var partitions = new LinkedHashMap<String, ExecutionContext>();
    for (int i = 0; i < gridSize; i++) {
      long start = min + (long) i * size;                                        // 3
      if (start > max) break;                                                    // 4
      long end = Math.min(start + size - 1, max);                                // 5
      var context = new ExecutionContext();
      context.putLong("minId", start);                                           // 6
      context.putLong("maxId", end);
      partitions.put("partition" + i, context);                                  // 7
    }
    return partitions;
  }
}
```

1. `gridSize` est une **indication** (le nombre de partitions souhaité) : Spring Batch ne la calcule pas, c'est vous qui la fixez.
2. `ceilDiv` : arrondi **supérieur**, pour que les plages couvrent **tout** l'intervalle sans trou.
3. Début de la plage `i`.
4. Si l'intervalle est petit, on s'arrête : pas de plage vide.
5. Fin **incluse**, bornée par le maximum. **Chaque identifiant appartient à exactement une plage** : pas de chevauchement (piège n°4).
6. Une partition **est** un `ExecutionContext` : il porte la plage.
7. La clé est le **nom** de la partition. Il doit être **unique et déterministe** : au restart, c'est lui qui retrouve la partition (§3.3).

**Le step ouvrier : un step ordinaire, qui lit sa plage dans son contexte**

```java
@Bean
@StepScope
JdbcPagingItemReader<RawTransaction> partitionReader(
    DataSource dataSource, PagingQueryProvider rangeQueryProvider,
    @Value("#{stepExecutionContext['minId']}") Long minId,                        // 1
    @Value("#{stepExecutionContext['maxId']}") Long maxId) {

  return new JdbcPagingItemReaderBuilder<RawTransaction>()
      .name("partitionReader")
      .dataSource(dataSource)
      .queryProvider(rangeQueryProvider)                                          // WHERE id BETWEEN :minId AND :maxId, tri par id
      .parameterValues(Map.of("minId", minId, "maxId", maxId))                    // 2
      .pageSize(500)
      .rowMapper(rawRowMapper)
      .build();
}
```

1. Le contexte du **step ouvrier** (et non les paramètres du job) donne la plage : c'est ce qui rend chaque ouvrier différent. `@StepScope` est donc indispensable (Module 2).
2. La plage est injectée dans la requête paginée (Module 3B, tri sur la clé unique `id`).

**Le step maître**

```java
@Bean
Step loadManagerStep(JobRepository jobRepository, IdRangePartitioner partitioner,
                     Step loadWorkerStep, TaskExecutor partitionExecutor) {
  return new StepBuilder("loadManagerStep", jobRepository)
      .partitioner("loadWorkerStep", partitioner)                                 // 1
      .step(loadWorkerStep)                                                       // 2
      .gridSize(4)                                                                // 3
      .taskExecutor(partitionExecutor)                                            // 4
      .build();
}

@Bean
TaskExecutor partitionExecutor() {
  var pool = new ThreadPoolTaskExecutor();
  pool.setThreadNamePrefix("partition-");
  pool.setCorePoolSize(4);
  pool.setMaxPoolSize(4);                                                         // 5
  return pool;
}
```

1. Le nom du step ouvrier et le découpeur de données.
2. Le step ouvrier à exécuter pour chaque plage.
3. Nombre de partitions demandé.
4. **Sans exécuteur, tout s'exécute dans un seul thread** : le gestionnaire de partitions utilise par défaut un exécuteur **synchrone** (vérifié dans le code). Le partitionnement « fonctionne » alors, sans aucun gain.
5. Pool borné, aussi grand que le nombre de partitions simultanées souhaité, **plus petit que le pool de connexions** (Module 5, §3.5).

Après exécution, `batch_step_execution` contient **une ligne pour le maître et une par partition** (`loadWorkerStep:partition0`, …) : les compteurs du maître sont la **somme** de ceux des partitions.

### 2.4 Le partitionnement distribué, puis le remote chunking **(Théorique)**

**Partitionnement distribué.** Même découpage, mais chaque partition est envoyée **par un message** à un autre serveur. Seules les **métadonnées** (la plage) voyagent. Trois éléments (classes de `spring-batch-integration` 6.0.6) :

- côté maître : `RemotePartitioningManagerStepBuilderFactory` (en version 4, ce composant s'appelait « Master ») : on lui donne le `Partitioner`, un canal de **sortie** (requêtes) et un canal d'**entrée** (réponses) ;
- côté ouvrier : `RemotePartitioningWorkerStepBuilderFactory` : un canal d'entrée (les requêtes) et un canal de sortie (les réponses) ;
- `@EnableBatchIntegration` pour activer les builders ; les canaux sont reliés à un **courtier de messages** (RabbitMQ, Kafka…) par Spring Integration.

```java
@Configuration
@Profile("manager")                                                              // 1
@EnableBatchIntegration
class ManagerConfig {

  @Bean
  Step managerStep(RemotePartitioningManagerStepBuilderFactory factory, IdRangePartitioner partitioner,
                   MessageChannel requests, MessageChannel replies) {
    return factory.get("managerStep")
        .partitioner("workerStep", partitioner)
        .gridSize(8)
        .outputChannel(requests)                                                 // 2
        .inputChannel(replies)                                                   // 3
        .build();
  }
  // + le Job et les « flux d'intégration » reliant les canaux au courtier de messages
}
```

1. **Le job ne doit exister que sur le profil « manager »** : avec un seul jar partagé, Spring Boot lancerait sinon le job **aussi sur chaque ouvrier**.
2. Les requêtes (une par partition) partent vers les ouvriers.
3. Les réponses reviennent et sont agrégées.

Points à retenir :
- **Tous** les serveurs (maître et ouvriers) partagent **le même `JobRepository`** : c'est là que vit l'état de chaque partition, donc la reprise (Module 1).
- Un ouvrier exécute son step **hors du contexte du job** : il n'a **pas** accès au `JobExecution` ni à son `ExecutionContext`. Tout ce qu'il lui faut doit être dans le contexte de **sa partition**.
- Le courtier doit offrir une **livraison garantie** (messages persistants).

**Partitionnement avec lancement dynamique.** Un projet voisin, Spring Cloud Task, fournit un `DeployerPartitionHandler` qui **lance de nouvelles instances de l'application à la demande** (sur Kubernetes, par exemple), les ouvriers s'éteignant à la fin de leur partition : c'est l'élasticité du cloud. Compatibilité avec Spring Boot 4 : à vérifier avant tout usage.

**Remote chunking.** Ici, c'est le **maître qui lit** ; il envoie les **données** (les éléments eux-mêmes) aux ouvriers, qui **traitent et écrivent** :

```
  maître : lit les éléments ──(éléments par messages)──▶ ouvriers : processor + writer
  maître : reçoit les comptes-rendus (StepContribution) ◀────────────────────────────
```

Builders : `RemoteChunkingManagerStepBuilderFactory` côté maître (le reader y reste), et `RemoteChunkingWorkerBuilder` côté ouvrier (processor et writer). **À réserver au cas où le processor est le goulot** : les données traversent le réseau, ce qui coûte ; si l'I/O est le goulot, on aggrave la situation (piège n°8). Contrairement au partitionnement, **aucune information ne dit quel ouvrier traite quoi** : si un ouvrier tombe, il faut une livraison de messages garantie et **idempotente**.

### 2.5 Plusieurs instances qui se partagent une file : `SELECT … FOR UPDATE SKIP LOCKED`

Cas : des lignes arrivent en continu dans une table de travail. Plusieurs instances de l'application tournent et chacune doit **prendre des lignes que les autres ne prennent pas**, sans coordination centrale.

```sql
CREATE TABLE staging_transaction (
  id               BIGINT        PRIMARY KEY,
  account_number   VARCHAR(20)   NOT NULL,
  transaction_date TIMESTAMP     NOT NULL,
  transaction_type CHAR(1)       NOT NULL,
  amount           NUMERIC(15,2) NOT NULL,
  status           VARCHAR(10)   NOT NULL DEFAULT 'NEW',        -- NEW → CLAIMED → DONE
  claimed_by       VARCHAR(40),
  claimed_at       TIMESTAMPTZ
);
CREATE INDEX idx_staging_claim ON staging_transaction (status, claimed_at, id);
```

**La réservation (« claim ») en une requête atomique :**

```sql
UPDATE staging_transaction s
   SET status = 'CLAIMED', claimed_by = :worker, claimed_at = now()
 WHERE s.id IN (
        SELECT id FROM staging_transaction
         WHERE status = 'NEW'
            OR (status = 'CLAIMED' AND claimed_at < now() - (:leaseSeconds * interval '1 second'))   -- (a)
         ORDER BY id
         LIMIT :batch
           FOR UPDATE SKIP LOCKED)                                                                   -- (b)
RETURNING s.id, s.account_number, s.transaction_date, s.transaction_type, s.amount
```

- **(b) `FOR UPDATE SKIP LOCKED`** : la sous-requête **verrouille** les lignes qu'elle sélectionne ; les lignes **déjà verrouillées par une autre transaction sont sautées**, pas attendues. Deux instances qui exécutent cette requête au même instant obtiennent donc des **lignes différentes**, sans s'attendre l'une l'autre.
- **(a) le bail (« lease »)** : une ligne `CLAIMED` depuis trop longtemps (instance morte) redevient disponible. Sans cela, un crash laisserait des lignes **réservées pour toujours** (piège n°9).

```java
public class ClaimingReader implements ItemReader<RawTransaction> {

  private final NamedParameterJdbcTemplate jdbc;
  private final TransactionTemplate claimTx;                                       // 1
  private final String workerId; private final int batchSize; private final int leaseSeconds;
  private final Deque<RawTransaction> buffer = new ArrayDeque<>();

  public ClaimingReader(NamedParameterJdbcTemplate jdbc, PlatformTransactionManager tm,
                        String workerId, int batchSize, int leaseSeconds) {
    this.jdbc = jdbc;
    this.claimTx = new TransactionTemplate(tm);
    this.claimTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);   // 2
    this.workerId = workerId; this.batchSize = batchSize; this.leaseSeconds = leaseSeconds;
  }

  @Override
  public synchronized RawTransaction read() {                                      // 3
    if (buffer.isEmpty()) {
      buffer.addAll(claimTx.execute(status -> jdbc.query(CLAIM_SQL,                // 4
          Map.of("worker", workerId, "batch", batchSize, "leaseSeconds", leaseSeconds), rawRowMapper)));
    }
    return buffer.poll();                                                          // 5
  }
}
```

1. Un `TransactionTemplate` : exécute une action dans une transaction.
2. **`REQUIRES_NEW`** : la réservation est **validée tout de suite**, dans sa propre transaction, **indépendante** de celle du chunk. Le verrou n'est tenu que le temps de la réservation ; ensuite, c'est la colonne `status` qui protège la ligne, pas un verrou de base de données.
3. `synchronized` : le reader peut être appelé par plusieurs threads (§2.1).
4. Si le tampon est vide, on réserve un nouveau lot.
5. `null` quand la file est vide : le step se termine.

**Marquer les lignes terminées**, dans la **même transaction que l'écriture** :

```java
// writer composite : d'abord l'écriture métier, puis le marquage DONE
new CompositeItemWriter<>(bankDbWriter, markDoneWriter)

// markDoneWriter : UPDATE staging_transaction SET status = 'DONE' WHERE id IN (:ids)
```

**Lancer plusieurs instances.** Chaque instance démarre le job avec un **`workerId` identifiant différent** (par exemple le nom du pod). Ce sont donc des **`JobInstance` distinctes** : elles ne se bloquent pas par `JobExecutionAlreadyRunningException` (Module 1), et chacune vide la file jusqu'à ce qu'elle soit vide.

---

## 3. Plongée « sous le capot »

### 3.1 Comment le `JobRepository` gère la concurrence entre instances

Trois mécanismes se complètent (Module 1) :

| Mécanisme | Protège contre | Où |
|---|---|---|
| **Isolation de création** (`SERIALIZABLE`) | deux lancements simultanés du même job | création de la `JobExecution` |
| **Vérification des exécutions en cours** | un lancement alors qu'un autre tourne | `JobExecutionAlreadyRunningException` |
| **Colonne `version`** (verrouillage optimiste) | deux écritures concurrentes sur **la même ligne** | `UPDATE … WHERE version = ?` |

**Pour une `StepExecution`, le contrôle de version est strict** : dans le code de `JdbcStepExecutionDao`, une mise à jour dont la version est périmée lève `OptimisticLockingFailureException`. (Pour la `JobExecution`, une synchronisation du statut atténue le contrôle, Module 1 §3.4.)

Quand cela arrive-t-il **en pratique** ? Quand **deux processus modifient la même `StepExecution`**. Exemple typique du partitionnement distribué : un message est **livré deux fois** (livraison « au moins une fois ») ; deux ouvriers exécutent la **même** partition, donc la **même** ligne `batch_step_execution`. Le second à écrire reçoit l'exception : **le système a détecté le doublon**, il ne faut ni le masquer ni le « corriger » en désactivant le contrôle. On traite l'exception comme un signal : la partition est déjà prise en charge.

### 3.2 Comment le `Partitioner` découpe les données, et comment naissent les `StepExecution` des ouvriers

```
  managerStep démarre
        │
        ▼
  SimpleStepExecutionSplitter.split(managerExecution, gridSize)
        │ 1. appelle  Partitioner.partition(gridSize)  → Map<nom, ExecutionContext>
        │ 2. pour chaque entrée : crée une StepExecution nommée « loadWorkerStep:<nom> »
        │      avec ce ExecutionContext, et l'ÉCRIT dans le JobRepository (statut STARTING)
        ▼
  PartitionHandler.handle(...)    ← TaskExecutorPartitionHandler (local) ou MessageChannelPartitionHandler (distant)
        │ 3. exécute chaque StepExecution via le TaskExecutor, ou l'envoie à un ouvrier distant
        ▼
  StepExecutionAggregator          ← 4. additionne les compteurs des partitions, déduit le statut du maître
```

**Une partition n'est qu'un `ExecutionContext`** : un petit dictionnaire (`minId`, `maxId`) qui est **stocké en base**. L'ouvrier le lit avec `#{stepExecutionContext['minId']}` (§2.3). C'est tout le « protocole » entre le maître et l'ouvrier.

### 3.3 Le partitionnement et la reprise

> *Basé sur la documentation et sur la lecture du code de découpage des partitions ; à tester sur votre version avant de s'y fier.*

Au `restart` du job, le découpeur **consulte la dernière exécution** du step maître (`getLastStepExecution`) :
- les partitions **déjà terminées** ne sont **pas rejouées** (sauf `allowStartIfComplete`) ;
- les partitions **échouées** sont rejouées, avec **le même contexte** : la même plage ;
- le `Partitioner` est rappelé, ou, s'il implémente `PartitionNameProvider`, **seuls les noms** des partitions lui sont redemandés.

Conséquence : le découpage doit être **déterministe**. Si les données ont changé entre-temps (de nouvelles lignes avec des identifiants plus grands), un `partition()` qui recalcule le maximum produirait **d'autres plages** et les noms ne correspondraient plus aux anciens résultats. D'où la règle : **figer** la source d'un lot (table de travail du lot, plage inscrite dans les paramètres du job).

### 3.4 Quels readers supportent plusieurs threads ?

| Reader | Thread-safe ? | Pourquoi |
|---|---|---|
| `JdbcPagingItemReader` | **oui** | chaque page est une requête indépendante |
| `JdbcCursorItemReader` | **non** | **un seul `ResultSet`** partagé : lectures qui s'entremêlent |
| `FlatFileItemReader` | **non** | un seul flux de lecture et un compteur de lignes |
| `StaxEventItemReader`, `JsonItemReader` | **non** | idem |
| tout reader enveloppé dans `SynchronizedItemStreamReader` | **oui** (lecture sérialisée) | un verrou autour de `read()` |

Un reader non thread-safe utilisé sans précaution **ne plante pas** : il **saute** ou **duplique** des lignes (curseur partagé), ce qui est bien pire.

Le cas du partitionnement est différent : **chaque ouvrier a son propre reader** (grâce à `@StepScope`), donc **aucune partie du reader n'est partagée** : un `FlatFileItemReader` ou un curseur y sont parfaitement sûrs. C'est pourquoi le partitionnement convient mieux que le multithread aux readers « simples ».

### 3.5 Le rôle du `TaskExecutor` dans le partitionnement local

`TaskExecutorPartitionHandler` soumet chaque partition au `TaskExecutor` : **un thread par partition simultanée**. Ce que cela implique :

1. **Défaut synchrone.** Sans exécuteur, c'est un `SyncTaskExecutor` : les partitions s'exécutent **l'une après l'autre**. Aucune erreur, aucun gain (§2.3, point 4).
2. **Nombre de partitions contre nombre de threads.** On peut avoir 16 partitions et 4 threads : les partitions sont servies **quatre par quatre**. Des partitions plus petites que le nombre de threads équilibrent mieux la charge si leurs tailles sont inégales.
3. **Un thread = une `StepExecution` = ses propres transactions et connexions** (Module 5, §3.5) : le pool de connexions de la base doit être dimensionné en conséquence.
4. **Tout composant partagé entre ouvriers est partagé entre threads** : un singleton avec un état y devient une course (Module 4, piège n°1).

### 3.6 Comment `SKIP LOCKED` règle la concurrence

PostgreSQL pose un **verrou de ligne** sur chaque ligne retournée par un `SELECT … FOR UPDATE`. Une autre transaction qui veut la même ligne :
- **sans option** : **attend** la fin de la première (file d'attente, débit divisé) ;
- **avec `NOWAIT`** : échoue immédiatement ;
- **avec `SKIP LOCKED`** : **l'ignore** et prend les lignes suivantes.

Le résultat est un **tirage sans conflit** entre instances. Deux limites à connaître :
- l'ordre n'est plus garanti entre instances (une ligne sautée sera traitée plus tard) : un traitement qui exige l'ordre ne doit pas utiliser ce motif ;
- le verrou est **tenu jusqu'à la fin de la transaction** : c'est pourquoi la réservation est faite dans une **courte transaction propre** (`REQUIRES_NEW`) et que la protection durable est la colonne `status`.

> L'isolation par défaut de PostgreSQL (`READ COMMITTED`) convient à cette requête. Sous `SERIALIZABLE`, des conflits de sérialisation (`40001`) apparaissent et il faut réessayer.

---

### Références visuelles (§3 Sous le capot)

**1. Schéma officiel de la documentation Spring Batch**
- ✔ vérifié : « Partitioned Process » (page *Spring Batch Architecture*), pour le partitionnement.
- ◻ à confirmer : page *Scaling and Parallel Processing* : schémas des pages « Partitioning » et « Remote Chunking ».

**2. Schéma ASCII à garder (script vidéo)**
- §2.3 : manager → partitions → workers ; §3.2 : la chaîne `split` → `handle` → `aggregate` ; §2.4 : remote chunking.

**3. Schéma personnalisé à créer pour le PPT**
- ⭐ **Deux instances et `SKIP LOCKED`** : la table de travail, les lignes réservées par A (bleu) et B (vert), les lignes verrouillées en gris sautées.
- **Partitionnement avec plages** : l'intervalle d'identifiants découpé en 4 couleurs sans chevauchement, et le cas **fautif** (plages qui se recouvrent, en rouge).
- **Livraison en double** : deux ouvriers sur la même partition, la 2e écriture rejetée par `OptimisticLockingFailureException`.
- **Quel reader est thread-safe ?** : tableau en pastilles vertes / rouges.
- Courbe **débit contre nombre de threads** (le débit plafonne quand l'I/O sature).

---

## 4. Cas d'usage

### 4.1 La fin de mois qui ne tient plus dans la nuit

50 millions de lignes à rapprocher, fenêtre de 2 heures. Mesure faite : la base d'entrée est le goulot, pas le CPU. Le **partitionnement local** en 8 plages divise le temps par un facteur voisin du nombre de threads **jusqu'à saturation de l'I/O** ; au-delà, ajouter des threads n'apporte plus rien. Si un serveur ne suffit plus : **partitionnement distribué**, avec le même `Partitioner`.

### 4.2 Le calcul lourd par transaction

Un score de risque qui prend 40 ms par transaction. Lecture et écriture sont rapides. **`AsyncItemProcessor`** (ou remote chunking si un seul serveur ne suffit pas) parallélise le calcul sans toucher au reste.

### 4.3 Les instances interchangeables

Un service reçoit des transactions toute la journée ; trois pods Kubernetes les consomment. Avec `SKIP LOCKED`, chaque pod prend ce qui est libre, un pod qui meurt voit ses lignes **revenir** à la file à l'expiration du bail, et l'on ajoute ou retire des pods **sans reconfiguration**.

---

## 5. Pièges : le Top 10

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| 1 | **Reader non thread-safe** : curseur JDBC ou fichier partagé entre threads | lignes **sautées ou dupliquées**, sans erreur | reader paginé, `SynchronizedItemStreamReader`, ou **partitionner** (un reader par ouvrier) |
| 2 | **Singleton avec état** en multithread | résultats aléatoires (Module 4, en pire) | composants sans état, ou `@StepScope` |
| 3 | **Pool de threads mal dimensionné** (Module 5, piège n°4) : `SimpleAsyncTaskExecutor` illimité en production, ou pool supérieur au pool de connexions | saturation de la base, blocage faute de connexions | pool borné et nommé ; threads **<** connexions disponibles |
| **4** | **`OptimisticLockingFailureException` en multi-instance** | deux processus écrivent la **même** `StepExecution` (message livré deux fois, reprise lancée en parallèle) | ne **pas** la masquer : c'est le signal d'un doublon ; livraison garantie ; une seule reprise à la fois |
| 5 | **Plages de partitionnement qui se chevauchent** (ou qui laissent un trou) | lignes **traitées deux fois** (doublons, totaux faux) ou **jamais** | bornes **incluses** calculées par `ceilDiv`, test « chaque id dans exactement une plage » (§5.1) |
| 6 | Partitionnement **sans `TaskExecutor`** | exécuteur synchrone par défaut : **aucun gain** | `.taskExecutor(...)` explicite, partitions visibles dans des threads différents |
| 7 | **Multithread avec reprise** : `saveState(false)` oublié ou position sauvegardée dans le désordre | restart au mauvais endroit | `saveState(false)` assumé ; pour la reprise, partitionner |
| 8 | **Remote chunking** quand l'I/O est le goulot | les données transitent par le réseau : **plus lent** qu'avant | remote chunking **seulement** si le processor est le goulot ; sinon partitionner |
| 9 | **`SKIP LOCKED` sans bail** | un crash laisse des lignes `CLAIMED` **pour toujours** | `claimed_at` + reprise des réservations expirées |
| 10 | **Le job démarré sur chaque ouvrier** (un seul jar, pas de profil) | le job tourne sur le maître **et** sur chaque ouvrier | `@Profile("manager")` sur le job ; ouvriers sans `Job` |

### 5.1 Tester que les plages ne se chevauchent pas

```java
@Test
void chaque_identifiant_appartient_a_exactement_une_plage() {
  jdbc.update("INSERT INTO staging_transaction(id, account_number, transaction_date, transaction_type, amount) "
            + "SELECT g, 'FR76', now(), 'D', 1 FROM generate_series(1, 10000) g");

  var partitions = partitioner.partition(4);

  assertThat(partitions).hasSize(4);
  long previousEnd = 0;
  for (var context : partitions.values()) {                       // dans l'ordre des partitions
    long min = context.getLong("minId"), max = context.getLong("maxId");
    assertThat(min).isEqualTo(previousEnd + 1);                   // ni trou, ni recouvrement
    previousEnd = max;
  }
  assertThat(previousEnd).isEqualTo(10000);                       // tout l'intervalle est couvert
}
```

**Un second test, à ne jamais omettre :** après le job, `SELECT COUNT(*)` égal au nombre de lignes de la source, **et** `SELECT COUNT(DISTINCT id)` égal au même nombre : ni pertes, ni doublons.

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 7.1 | Mesurer avant d'optimiser ; pourquoi passer à l'échelle | 7 min | §1.1-1.2 |
| 7.2 | Le panorama des approches ; deux serveurs, deux problèmes | 8 min | §1.3-1.5 |
| 7.3 | Le step multithread et ses limites | 8 min | §2.1, §3.4 |
| 7.4 | `AsyncItemProcessor` et flux parallèles | 6 min | §2.2 |
| 7.5 | Le partitionnement local, ligne par ligne | 9 min | §2.3, §3.2, §3.5 |
| 7.6 | Partitionnement, restart et chevauchement | 7 min | §3.3, §5.1 |
| 7.7 | Distribué et remote chunking (théorie) | 8 min | §2.4 |
| 7.8 | Multi-instance : `SKIP LOCKED` et bail | 9 min | §2.5, §3.6 |
| 7.9 | Concurrence sur le `JobRepository` et Top 10 | 8 min | §3.1, §5 |
| | **Total** | **≈ 70 min** | |

## 7. Exercices

1. **Choisir.** Un job de 40 minutes lit un fichier unique de 4 Go, applique un calcul lent à chaque ligne (30 ms), puis écrit en base. Quel est le goulot ? Proposez deux approches adaptées et une qui ne l'est pas.
2. **Plages.** Avec `min = 1`, `max = 10 000` et `gridSize = 4`, quelles sont les quatre plages ? Et avec `max = 10 002` ? Combien d'identifiants contient la dernière ?
3. **Défaut caché.** Un collègue active le partitionnement local avec `gridSize(8)` et ne voit aucune amélioration. Quelle ligne manque ? Comment le constater dans les journaux ?
4. **Doublon.** Dans un partitionnement distribué, un message est livré deux fois. Que se passe-t-il pour la seconde écriture de la `StepExecution` ? Que doit faire le code applicatif ?
5. **File.** Un pod meurt après avoir réservé 500 lignes avec `SKIP LOCKED`. Sans bail, que deviennent-elles ? Avec un bail de 10 minutes, quand redeviennent-elles disponibles ?
