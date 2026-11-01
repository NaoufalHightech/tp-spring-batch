# Module 3 · Le chunk : lire, traiter, écrire

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Essentiel. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 50 à 55 min, en 7 sous-vidéos de 5 à 9 min (voir la fin).
> **Prérequis :** Module 1 (`ExecutionContext`, `JobRepository`), Module 2 (tasklet, `@StepScope`).
> Projet de référence : `tp/tpProd`. Cas fil rouge : charger un fichier de transactions bancaires dans PostgreSQL.

---

## 1. Le concept

### 1.1 De la tasklet au chunk

Une tasklet (Module 2) est **une action**. Un traitement de masse, lui, répète la même action sur des millions
d'éléments. Écrire la boucle soi-même oblige à gérer la mémoire, les transactions, la reprise et les compteurs.
Le **traitement par chunk** confie tout cela à Spring Batch : vous ne fournissez que trois pièces.

| Pièce | Rôle | Interface | Cardinalité |
|---|---|---|---|
| **Reader** | lit **un** élément à la fois, retourne `null` à la fin | `ItemReader<I>` | 1 appel = 1 élément |
| **Processor** | transforme, valide ou **filtre** un élément | `ItemProcessor<I, O>` | 1 appel = 1 élément |
| **Writer** | écrit **tout un lot** d'un coup | `ItemWriter<O>` | 1 appel = 1 chunk |

### 1.2 L'algorithme (à savoir par cœur)

Avec une taille de chunk de 100 :

```
début du step
  répéter :
    ┌─ ouvrir une TRANSACTION ─────────────────────────────────────────┐
    │  répéter jusqu'à 100 fois :                                      │
    │      item = reader.read()          (null → fin des données)      │
    │      résultat = processor.process(item)                          │
    │      si résultat != null : l'ajouter au chunk                    │
    │  writer.write(chunk)               (une seule écriture)          │
    │  sauvegarder l'état dans l'ExecutionContext (ItemStream.update)  │
    │  mettre à jour les compteurs de la StepExecution                 │
    └─ COMMIT ─────────────────────────────────────────────────────────┘
  jusqu'à ce que le reader retourne null
fin du step
```

**Un chunk = une transaction.** Le *commit interval* (la taille du chunk) est donc aussi la taille de ce qu'on
perd si un chunk échoue : un rollback annule les 100 éléments du lot, pas les chunks déjà validés.

### 1.3 Flashback sur le Module 1

L'`ExecutionContext` du Module 1 est la « sauvegarde de partie » du step, stockée dans
`batch_step_execution_context`. Ce module montre **qui l'écrit et quand** : le reader y note sa position à
**chaque commit**. Au Module 6, c'est elle qui permettra de reprendre un job échoué à la ligne près.

### 1.4 Ce qui change dans Spring Batch 6

Dans la 6.0.6, le step orienté chunk s'écrit avec **`StepBuilder.chunk(int)`**, qui retourne un
`ChunkOrientedStepBuilder` et produit un `ChunkOrientedStep`. L'ancienne forme **`chunk(int, tx)`**, que
vous trouverez dans tous les tutoriels antérieurs, est **dépréciée depuis la 6.0 et prévue pour suppression** :
elle compile encore, avec un avertissement. Dans la nouvelle forme, le gestionnaire de transactions se donne par
`.transactionManager(tx)`.

### Références visuelles (§1 Concept)

> Légende : « ✔ vérifié » = titre relevé dans l'extrait de documentation officielle fourni ; « ◻ à confirmer » = page citée, titre exact du schéma à contrôler sur la page avant d'insérer l'image.

**1. Schéma officiel de la documentation Spring Batch**
- ◻ à confirmer : page *Configuring a Step*, section *Chunk-oriented Processing* : schéma lecture / traitement / écriture par chunk.
- ✔ vérifié : « Job Hierarchy With Steps » pour situer le step.

**2. Schéma ASCII à garder (script vidéo)**
- §1.2 : l'algorithme du chunk en pseudo-code (à garder pour la narration, le schéma officiel illustre la même boucle).

**3. Schéma personnalisé à créer pour le PPT**
- **Frise des transactions** : 3 chunks, chaque commit = « 100 lignes écrites + position sauvegardée » (reprend le schéma §3.2), crash avant le commit du 3e chunk.

---

## 2. Le code, ligne par ligne

### 2.1 Le fichier et la table

`data/transactions.csv` :

```csv
id,accountNumber,transactionDate,transactionType,amount
1,FR7612345,01/10/2026 09:15,D,120.50
2,FR7612345,01/10/2026 10:02,C,2000.00
3,FR7698765,02/10/2026 14:30,D,15.00
4,FR7698765,02/10/2026 15:45,D,0.00
5,FR7612345,03/10/2026 08:00,C,350.75
```

Script de migration (Flyway, `V2__bank_transaction.sql`) :

```sql
CREATE TABLE bank_transaction (
  id               BIGINT        PRIMARY KEY,                                       -- 1
  account_number   VARCHAR(20)   NOT NULL,
  transaction_date TIMESTAMP     NOT NULL,                                          -- 2
  transaction_type CHAR(1)       NOT NULL CHECK (transaction_type IN ('D','C')),    -- 3
  amount           NUMERIC(15,2) NOT NULL                                           -- 4
);
```

1. Clé primaire **fournie par le fichier** : elle rendra l'écriture rejouable (voir `ON CONFLICT`, §2.4).
2. Un vrai type date-heure, pas une chaîne.
3. La base **refuse** une valeur invalide : dernière ligne de défense.
4. `NUMERIC` pour l'argent : jamais `DOUBLE PRECISION` (erreurs d'arrondi).

### 2.2 Les objets métier : deux records

```java
public record RawTransaction(                                  // 1
    long id, String accountNumber, String transactionDate,
    String transactionType, BigDecimal amount) { }             // 2

public record BankTransaction(                                 // 3
    long id, String accountNumber, LocalDateTime transactionDate,
    String transactionType, BigDecimal amount) {

  public BankTransaction {                                     // 4
    if (!transactionType.equals("D") && !transactionType.equals("C"))
      throw new IllegalArgumentException("Type inconnu : " + transactionType);
  }
}
```

1. Un **record** : classe de données immuable (Java 16+). Aucun getter ni `equals` à écrire.
2. La date est lue en **chaîne** : le reader ne fait que lire, la conversion appartient au processor.
3. L'objet écrit en base a de **vrais types**.
4. **Constructeur compact** : s'exécute à chaque création et protège l'invariant. Un type invalide ne peut jamais exister.

### 2.3 Le reader : `FlatFileItemReader`

```java
@Configuration
public class BankReaderConfig {

  @Bean
  @StepScope                                                                          // 1
  FlatFileItemReader<RawTransaction> bankCsvReader(                                   // 2
      @Value("#{jobParameters['inputFile']}") String inputFile) {                     // 3

    var tokenizer = new DelimitedLineTokenizer();                                     // 4
    tokenizer.setDelimiter(",");                                                      // 5
    tokenizer.setNames("id", "accountNumber", "transactionDate",
                       "transactionType", "amount");                                  // 6

    return new FlatFileItemReaderBuilder<RawTransaction>()                            // 7
        .name("bankCsvReader")                                                        // 8
        .resource(new FileSystemResource(inputFile))                                  // 9
        .linesToSkip(1)                                                               // 10
        .lineTokenizer(tokenizer)                                                     // 11
        .fieldSetMapper(new RecordFieldSetMapper<>(RawTransaction.class))             // 12
        .build();                                                                     // 13
  }
}
```

1. Le fichier est un **paramètre du lancement** (Module 2) : le bean doit naître au démarrage du step.
2. Le type de retour est la **classe concrète**, pas `ItemReader`. Raison au piège n°4.
3. Expression évaluée au démarrage du step.
4. Le tokenizer **découpe une ligne en champs** selon un séparateur.
5. Séparateur virgule (`;` pour un export français).
6. Noms des colonnes, **dans l'ordre du fichier** : ils servent ensuite à remplir l'objet.
7. Le builder est la manière moderne d'assembler un reader (plus lisible que les setters).
8. **Le nom est obligatoire** : il préfixe les clés sauvegardées dans l'`ExecutionContext` (§3.2).
9. `FileSystemResource` : fichier du disque. `ClassPathResource` pour un fichier embarqué.
10. **`linesToSkip(1)`** : saute l'en-tête. Sans cela, la ligne `id,accountNumber,…` est lue comme une donnée et échoue à la conversion de `id` en nombre.
11. On branche le tokenizer.
12. `RecordFieldSetMapper` remplit le record à partir des champs, **par nom**.
13. `build()` assemble et configure le reader.

### 2.4 Le processor

```java
@Component
public class BankTransactionProcessor
    implements ItemProcessor<RawTransaction, BankTransaction> {                       // 1

  private static final DateTimeFormatter FORMAT =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");                                // 2

  @Override
  public BankTransaction process(RawTransaction raw) {                                // 3
    if (raw.amount().signum() == 0) {                                                 // 4
      return null;                                                                    // 5
    }
    return new BankTransaction(                                                       // 6
        raw.id(), raw.accountNumber(),
        LocalDateTime.parse(raw.transactionDate(), FORMAT),                           // 7
        raw.transactionType(), raw.amount());
  }
}
```

1. Deux types génériques : **entrée** `RawTransaction`, **sortie** `BankTransaction`. Ils peuvent différer.
2. `DateTimeFormatter` est **immuable et thread-safe**, donc sans risque en champ `static final`. Son ancêtre `SimpleDateFormat` ne l'est pas (Module 4).
3. Une méthode, un élément. Le processor ne connaît ni le fichier, ni la base.
4. Règle métier : une transaction de montant nul n'a rien à enregistrer.
5. **`return null` filtre l'élément** : il n'est pas ajouté au chunk, donc jamais écrit. Ce n'est pas une erreur (§3.4).
6. Construction de l'objet cible ; le constructeur compact valide le type.
7. Conversion de la chaîne en date. Un format invalide lève ici `DateTimeParseException`.

### 2.5 Le writer : `JdbcBatchItemWriter` pour PostgreSQL

```java
@Configuration
public class BankWriterConfig {

  @Bean
  JdbcBatchItemWriter<BankTransaction> bankDbWriter(DataSource dataSource) {          // 1
    return new JdbcBatchItemWriterBuilder<BankTransaction>()
        .dataSource(dataSource)                                                       // 2
        .sql("""
            INSERT INTO bank_transaction
              (id, account_number, transaction_date, transaction_type, amount)
            VALUES (:id, :accountNumber, :transactionDate, :transactionType, :amount)
            ON CONFLICT (id) DO UPDATE
              SET account_number   = EXCLUDED.account_number,
                  transaction_date = EXCLUDED.transaction_date,
                  transaction_type = EXCLUDED.transaction_type,
                  amount           = EXCLUDED.amount
            """)                                                                      // 3
        .itemSqlParameterSourceProvider(tx -> new MapSqlParameterSource()             // 4
            .addValue("id", tx.id())
            .addValue("accountNumber", tx.accountNumber())
            .addValue("transactionDate", tx.transactionDate())
            .addValue("transactionType", tx.transactionType())
            .addValue("amount", tx.amount()))
        .build();                                                                     // 5
  }
}
```

1. Le type générique est l'objet **de sortie** du processor.
2. La `DataSource` PostgreSQL du Module 1 : **la même** que le `JobRepository`, donc la même transaction (§3.3).
3. Le SQL (équivalent de `setSql(...)` sur le writer) avec des **paramètres nommés** `:nom`. Bloc de texte `"""` : lisible sans concaténation. `ON CONFLICT … DO UPDATE` rend l'écriture **rejouable** : relancer le même fichier ne duplique pas et ne plante pas.
4. Chaque élément est converti en paramètres. On passe par un fournisseur explicite car **`beanMapped()` s'appuie sur des getters `getX()`**, que les records n'ont pas (ils exposent `id()`, pas `getId()`).
5. Le writer envoie les 100 éléments du chunk en **un seul lot JDBC**.

> Réglage PostgreSQL : ajouter `reWriteBatchedInserts=true` à l'URL JDBC permet au pilote de regrouper les
> insertions d'un lot en moins de requêtes : gain mesurable sur les gros chargements.

### 2.6 Le step

```java
@Configuration
public class BankJobConfig {

  @Bean
  Step loadBankStep(JobRepository jobRepository,
                    PlatformTransactionManager transactionManager,
                    FlatFileItemReader<RawTransaction> bankCsvReader,
                    BankTransactionProcessor processor,
                    JdbcBatchItemWriter<BankTransaction> bankDbWriter) {
    return new StepBuilder("loadBankStep", jobRepository)                             // 1
        .<RawTransaction, BankTransaction>chunk(100)                                  // 2
        .transactionManager(transactionManager)                                       // 3
        .reader(bankCsvReader)                                                        // 4
        .processor(processor)                                                         // 5
        .writer(bankDbWriter)                                                         // 6
        .stream(bankCsvReader)                                                        // 7
        .build();                                                                     // 8
  }

  @Bean
  Job bankJob(JobRepository jobRepository, Step loadBankStep) {
    return new JobBuilder("bankJob", jobRepository).start(loadBankStep).build();
  }
}
```

1. Le step porte un nom, clé de ses exécutions dans `batch_step_execution`.
2. Les types **d'entrée et de sortie** du chunk, puis la taille : 100 éléments par transaction. Forme de la version 6.
3. La transaction qui entoure chaque chunk. (Forme dépréciée équivalente : `.chunk(100, transactionManager)`.)
4. Le reader.
5. Le processor (facultatif : sans lui, les éléments passent tels quels).
6. Le writer.
7. **Enregistre explicitement le reader comme `ItemStream`** : le step l'ouvre, le met à jour à chaque commit et le ferme. Le déclarer ne coûte rien et évite le piège n°4.
8. Produit un `ChunkOrientedStep`.

---

## 3. Plongée « sous le capot »

### 3.1 `ItemStream` : la durée de vie d'une ressource

Un reader ou un writer qui tient une ressource (fichier, curseur, connexion) implémente `ItemStream`, trois méthodes :

| Méthode | Appelée… | Rôle |
|---|---|---|
| `open(ExecutionContext)` | **une fois**, avant la première lecture | ouvrir la ressource ; **relire l'état sauvegardé** et s'y repositionner si c'est une reprise |
| `update(ExecutionContext)` | **à chaque chunk, avant le commit** | **écrire l'état** dans le contexte (position atteinte) |
| `close()` | **une fois**, à la fin (succès ou échec) | libérer la ressource |

Le step appelle ce cycle de vie automatiquement pour tout flux qu'on lui a déclaré (§2.6, ligne 7).

### 3.2 Comment la position de lecture est sauvegardée

Le reader de fichier compte les éléments lus. À chaque chunk :

1. `update(executionContext)` y inscrit le compteur, sous une clé préfixée par le nom du reader
   (de la forme `bankCsvReader.read.count`) : **c'est pourquoi le nom est obligatoire**, et unique par reader ;
2. juste avant le commit, Spring Batch **persiste cet `ExecutionContext`** dans `batch_step_execution_context`
   (la table du Module 1) ;
3. si tout réussit, le commit valide **d'un seul bloc** : les 100 lignes écrites et la position.

```
chunk 1 (lignes 1-100)    écrit 100 lignes ─┐
                          position = 100  ──┴─ MÊME COMMIT
chunk 2 (lignes 101-200)  écrit 100 lignes ─┐
                          position = 200  ──┴─ MÊME COMMIT
chunk 3 (lignes 201-300)  ... crash ...        ◀── ni lignes ni position 300 enregistrées
```

Au redémarrage (Module 6), `open(...)` relit `read.count = 200`, saute 200 éléments et reprend à la 201e. **Les données et la position sont validées ensemble**, donc elles ne peuvent jamais se contredire : c'est ce qui évite à la fois la perte et le doublon.

Condition : écrire dans **la même base** que le `JobRepository` (ou gérer une transaction globale). Écrire les données dans une autre base sans transaction commune brise cette garantie.

### 3.3 Qui détient la transaction

Le `PlatformTransactionManager` ouvre une transaction par chunk. Le reader, le processor et le writer s'exécutent **dans** cette transaction ; les écritures du writer et celles du `JobRepository` (compteurs, contexte) partagent la même connexion et le même commit. Une exception dans le processor ou le writer provoque un **rollback de tout le chunk** : aucune ligne des 100 n'est écrite, la position n'avance pas, et le step échoue (ou applique skip/retry, Module 6).

### 3.4 Pourquoi `return null` filtre l'élément

Le contrat de `ItemProcessor.process` est : **« retourner `null` signifie : ne pas poursuivre le traitement de cet élément ».** Dans la boucle du step :

```
résultat = processor.process(item)
si résultat == null  →  filterCount++   (l'élément n'entre pas dans le chunk)
sinon                →  ajouter au chunk
```

Conséquences :
- l'élément n'est **jamais transmis au writer** ;
- ce n'est **ni une erreur, ni un skip** : le compteur `filter_count` de `batch_step_execution` augmente, pas `skip_count` ;
- la position de lecture avance quand même : la ligne est considérée comme traitée.

Sur notre exemple : 5 lignes lues, 1 filtrée (montant nul), 4 écrites ; dans `batch_step_execution`, `read_count = 5`, `filter_count = 1`, `write_count = 4`.

Un chunk entièrement filtré est un chunk **vide** : le writer reçoit un lot sans élément et ne fait rien ; le commit a lieu quand même.

### 3.5 Cursor ou pagination : deux façons de lire une base

> #### Rappel : qu'est-ce qu'un curseur ?
>
> **Un curseur est un pointeur vers le résultat d'une requête.** Au lieu de rapatrier toutes les lignes d'un coup
> (ce qui ferait exploser la mémoire sur un gros résultat), on garde la requête « ouverte » et on dit à la base :
> *« donne-moi la ligne suivante, puis la suivante… »*.
>
> ```
>  SANS curseur                          AVEC curseur
>  ┌────────┐   10 millions de lignes   ┌────────┐   ligne 1, 2, 3…
>  │  Base  │ ────────────────────────▶ │  Base  │ ──┐
>  └────────┘   tout en mémoire JVM     └────────┘   │  ┌───────────────┐
>                  💥 OutOfMemory                     └─▶│ curseur ▶ ... │ avance d'une ligne à la fois
>                                                        └───────────────┘
> ```
>
> **Le rôle du `fetchSize`.** Le pilote JDBC (comme le pilote PostgreSQL) ne va pas chercher les lignes **une par une**
> sur le serveur : ce serait un aller-retour réseau par ligne. Il les rapatrie **par paquets** de `fetchSize` lignes
> (par exemple 1 000). Le curseur avance dans le paquet en mémoire ; quand il est épuisé, le pilote demande le suivant.
>
> ```
>   serveur PostgreSQL                          JVM (pilote JDBC)
>   ┌──────────────────┐   paquet de 1 000   ┌────────────────────────────┐
>   │ résultat complet │ ──────────────────▶ │ [ 1 ... 1000 ]             │
>   │ (10 M de lignes) │                     │   ▲ le curseur lit ici,    │
>   │                  │   paquet suivant    │   │ ligne après ligne      │
>   │                  │ ──────────────────▶ │ [ 1001 ... 2000 ]          │
>   └──────────────────┘                     └────────────────────────────┘
>   en mémoire JVM : au plus UN paquet à la fois
> ```
>
> `fetchSize` trop petit : beaucoup d'allers-retours. Trop grand : un paquet volumineux en mémoire.
> Un ordre de grandeur courant : 500 à 5 000, à mesurer comme la taille du chunk.
>
> **⚠ Piège PostgreSQL.** Par défaut, le pilote PostgreSQL **charge tout le résultat en mémoire**, quel que soit le reader.
> Il ne fait du vrai *streaming* que si **les quatre conditions** suivantes sont réunies :
>
> | Condition | Comment |
> |---|---|
> | l'**auto-commit est désactivé** sur la connexion | voir ci-dessous |
> | le `fetchSize` est **supérieur à 0** | `.fetchSize(1000)` sur le reader |
> | le curseur est **en avant seulement** (*forward-only*) | c'est le cas par défaut du reader |
> | la requête est **une seule instruction** | pas de `;` multiples |
>
> **Qui désactive l'auto-commit ?** Pas automatiquement. `JdbcCursorItemReader` ouvre **sa propre connexion** à
> partir du pool, hors de la transaction du chunk ; il ne modifie l'auto-commit que si on le lui demande
> explicitement (propriété `connectionAutoCommit`, vide par défaut). Deux façons de l'obtenir :
>
> ```java
> var reader = new JdbcCursorItemReaderBuilder<BankTransaction>()
>     .name("cursorReader")
>     .dataSource(dataSource)
>     .sql("SELECT id, account_number, transaction_date, transaction_type, amount FROM bank_transaction")
>     .fetchSize(1000)                                  // paquets de 1 000 lignes
>     .rowMapper(rowMapper)
>     .build();
> reader.setConnectionAutoCommit(false);                // le curseur PostgreSQL exige l'auto-commit désactivé
> ```
>
> ou, pour toute l'application, `spring.datasource.hikari.auto-commit=false`.
> **Sans l'un de ces réglages, `fetchSize(1000)` est ignoré par PostgreSQL** : le reader fonctionne, mais lit tout
> en mémoire, et l'`OutOfMemoryError` n'arrive que sur le gros fichier de production.

| | `JdbcCursorItemReader` | `JdbcPagingItemReader` |
|---|---|---|
| Principe | **une requête**, un curseur ouvert pendant tout le step | une requête **par page**, avec tri et clé de reprise |
| Mémoire | faible (le pilote contrôle la taille de lecture, `fetchSize`) | une page à la fois (`pageSize`) |
| Connexion | une connexion tenue pendant tout le step | libérée entre deux pages |
| Plusieurs threads | **non** | **oui** (documenté comme thread-safe) |
| Risque | curseur coupé si le step dure trop longtemps | **lignes sautées ou doublonnées** si le tri est instable (piège n°6) |

### 3.6 Le coût de la taille du chunk

| Chunk petit (ex. 1) | Chunk grand (ex. 100 000) |
|---|---|
| un commit par élément : très lent | peu de commits : rapide |
| rollback minuscule | rollback énorme : tout est à refaire |
| position sauvegardée très souvent | position rarement sauvegardée : la reprise rejoue beaucoup |
| mémoire minimale | **tout le chunk est en mémoire** : risque `OutOfMemoryError` |

La valeur se **mesure** (courbe débit contre taille), souvent entre 100 et 5 000. Il n'y a pas de bonne réponse théorique.

### Références visuelles (§3 Sous le capot)

**1. Schéma officiel de la documentation Spring Batch**
- Aucun schéma officiel pour `ItemStream` et la sauvegarde de position.

**2. Schéma ASCII à garder (script vidéo)**
- §3.2 : « chunk 1 / chunk 2 / chunk 3 + crash » (à garder).
- §3.5 : les deux schémas de l'encart « curseur » (sans / avec curseur ; paquets de `fetchSize`) : à garder pour la vidéo.

**3. Schéma personnalisé à créer pour le PPT**
- **Cycle de vie `ItemStream`** : `open` → (`read` × N, `update`, commit) × chunks → `close`, avec l'`ExecutionContext` qui circule.
- **Curseur contre pagination** redessinés en couleurs (le schéma du livre n'est pas réutilisable sans autorisation).
- Tableau des **4 conditions du streaming PostgreSQL** en 4 pastilles vertes/rouges.

---

## 4. Cas d'usage

### 4.1 Le fichier de 10 Go

La banque dépose chaque nuit un fichier de 10 Go. Le charger en mémoire est impossible. Avec un chunk de 1 000, la mémoire reste constante (un chunk à la fois) : le step lit, filtre, écrit, valide, et la position est sauvegardée tous les 1 000 éléments. À 3 h 40, le serveur redémarre ; la reprise rejoue **au plus un chunk**, pas dix heures de travail.

### 4.2 La migration entre deux référentiels

Lecture paginée dans l'ancienne base, transformation (changement de format de dates et de codes), écriture par lots dans PostgreSQL. L'écriture `ON CONFLICT DO UPDATE` permet de **rejouer** la migration sans doublon.

### 4.3 Le nettoyage avec filtrage

Un fichier de 2 millions de lignes contient 8 % de lignes à montant nul. Le processor les filtre : elles ne polluent pas la base, et `filter_count` donne le chiffre exact pour le rapport d'audit.

---

## 5. Pièges : le Top 10

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| 1 | Taille de chunk à 1 (ou « par défaut » jamais mesurée) | un commit par ligne, débit divisé par 10 à 100 | mesurer, viser 100 à 5 000 |
| 2 | **`OutOfMemoryError`** : un reader qui charge tout (`findAll()`, liste complète) ; ou chunk énorme | le JVM s'arrête au milieu de la nuit | lecture **flux** (fichier, cursor, paging), chunk borné, jamais de liste entière |
| 3 | Reader sans `name(...)` | échec au démarrage (« un nom est requis ») ou clés qui se mélangent entre deux readers | nom **unique** par reader |
| 4 | Bean `@StepScope` typé `ItemReader` au lieu de la classe concrète | le proxy ne se voit pas comme `ItemStream` : `open/update/close` jamais appelés, **aucune position sauvegardée** | type de retour concret, et `.stream(reader)` |
| 5 | Processor avec **état** ou `SimpleDateFormat` partagé | double comptage (Module 2), valeurs fausses en multi-thread | processor sans état, `DateTimeFormatter` |
| 6 | **`PagingItemReader` instable** : tri sur une colonne non unique, ou on modifie pendant la lecture la colonne qui filtre | lignes **sautées ou lues deux fois**, sans erreur | clé de tri **unique** (ex. clé primaire), ne pas modifier la sélection pendant la lecture |
| 7 | `ON CONFLICT DO NOTHING` avec le contrôle des mises à jour actif | `assertUpdates` (actif par défaut) exige au moins une ligne touchée : un lot de doublons **fait échouer le step** | `DO UPDATE`, ou `assertUpdates(false)` en connaissance de cause |
| 8 | `beanMapped()` avec des records | les paramètres `:id`… sont introuvables (pas de getters `getX`) | fournisseur explicite (§2.5) ou classe JavaBean |
| 9 | **Test vert avec des données fausses** : un `RowMapper` (ou mapper) incomplet | le test ne vérifie que le **nombre** de lignes ; un champ oublié reste `null`/`0` ; la base est fausse et le test passe | asserter les **valeurs** (somme des montants, premier et dernier élément), pas seulement `count` |
| 10 | Oublier `linesToSkip(1)` | la ligne d'en-tête est lue comme une donnée : échec de conversion à la ligne 1 | `linesToSkip(1)` et un test avec un en-tête |

**Détail du piège n° 9.** Soit un `RowMapper` qui lit `id` et `accountNumber` mais oublie `amount` :

```java
// Incomplet : amount reste à null / 0, aucune erreur
(rs, i) -> new BankTransaction(rs.getLong("id"), rs.getString("account_number"),
                               rs.getTimestamp("transaction_date").toLocalDateTime(),
                               rs.getString("transaction_type"), BigDecimal.ZERO)
```

Le test `assertThat(rows).hasSize(4)` est **vert**, et tous les montants sont à zéro. Le bon test vérifie le contenu :

```java
assertThat(jdbc.queryForObject("SELECT SUM(amount) FROM bank_transaction", BigDecimal.class))
    .isEqualByComparingTo("2486.25");    // 120.50 + 2000.00 + 15.00 + 350.75 (la ligne à 0.00 est filtrée)
```

> Règle : un test de chargement doit **contrôler au moins une valeur calculée** (somme, premier/dernier
> enregistrement), car le comptage seul ne voit pas une colonne oubliée.

**Flashback sur le Module 2.** Les pièges 4 et 5 sont deux visages du même sujet : un composant partagé (singleton, proxy mal typé) ne fait pas ce qu'on croit. Relisez §3.2 du Module 2.

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 3.1 | De la tasklet au chunk | 7 min | §1.1-1.4 |
| 3.2 | Les données : fichier, table, records | 6 min | §2.1-2.2 |
| 3.3 | Le reader de fichier plat | 9 min | §2.3 |
| 3.4 | Le processor et le filtrage | 7 min | §2.4, §3.4 |
| 3.5 | Le writer PostgreSQL et le step | 9 min | §2.5-2.6 |
| 3.6 | Sous le capot : `ItemStream`, `ExecutionContext`, transaction | 10 min | §3.1-3.3, §3.6 |
| 3.7 | Top 10 des pièges et test correct | 7 min | §5, §3.5 |
| | **Total** | **≈ 55 min** | |

## 7. Exercices

1. **Filtre.** Le fichier contient 1 000 lignes dont 80 à montant nul. Combien valent `read_count`, `filter_count` et `write_count` de la `StepExecution` ? Que vaut `skip_count` ?
2. **Reprise.** Un chunk de 100 échoue à la ligne 350 (avec le chunk 4 en cours). Quelle position est enregistrée dans l'`ExecutionContext` ? Combien de lignes sont déjà en base ? Justifiez par la règle « une transaction par chunk ».
3. **Reader.** Un collègue a retiré `name("bankCsvReader")` du reader « pour simplifier ». Que risque-t-il de se passer ? Et s'il retourne `ItemReader<RawTransaction>` depuis la méthode `@StepScope` ?
4. **Test.** Écrivez l'assertion qui détecte qu'un champ `amount` n'a pas été mappé, alors qu'`assertThat(rows).hasSize(4)` reste vert.
