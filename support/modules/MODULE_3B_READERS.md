# Module 3 (complément) · Le catalogue des readers

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Durée vidéo visée :** 35 à 40 min, en 5 sous-vidéos de 5 à 9 min.
> **Prérequis :** Module 3 (chunk, `ItemStream`, `ExecutionContext`).
> **Source :** chapitre 7 (« ItemReaders ») de *The Definitive Guide to Spring Batch* de Michael T. Minella,
> **reformulé et adapté** : exemples réécrits sur le cas bancaire du cours, et mis à jour pour Spring Batch 6.0.6
> (le livre décrit Spring Batch 4 : `JobBuilderFactory`, `BatchConfigurer`, readers Hibernate…).
> Projet de référence : `tp/tpProd`.

---

## 1. Le concept

### 1.1 Un reader, un contrat simple

`ItemReader<T>` n'a qu'une méthode, `read()`. Elle retourne **un** élément à chaque appel et `null` quand il n'y en a plus.
Spring Batch fournit des implémentations pour la plupart des sources ; on n'écrit un reader soi-même que pour une source
inhabituelle (service web, protocole maison).

### 1.2 Ce qui a changé depuis le livre (à savoir avant de copier un tutoriel)

Vérifié dans les jars de la 6.0.6 :

| Dans le livre (Spring Batch 4) | Dans Spring Batch 6.0.6 |
|---|---|
| `HibernateCursorItemReader`, `HibernatePagingItemReader` | **absents** : aucun reader Hibernate natif |
| « JPA n'a pas de reader curseur » | **`JpaCursorItemReader` existe**, à côté de `JpaPagingItemReader` |
| `MongoItemReader` | remplacé par **`MongoPagingItemReader`** et **`MongoCursorItemReader`** |
| paquets `org.springframework.batch.item.*` | **`org.springframework.batch.infrastructure.item.*`** |
| `JobBuilderFactory` / `StepBuilderFactory`, `BatchConfigurer` | disparus : on construit les builders directement |
| `ArgumentPreparedStatementSetter` | classe de **Spring Framework** (`spring-jdbc`), pas de Spring Batch |

### 1.3 Le catalogue

| Source | Reader | Remarque clé |
|---|---|---|
| Fichier plat (délimité, positions fixes) | `FlatFileItemReader` | nom obligatoire ; `LineTokenizer` + `FieldSetMapper` |
| Fichier à plusieurs formats de ligne | `FlatFileItemReader` + `PatternMatchingCompositeLineMapper` | un tokenizer par préfixe |
| Plusieurs fichiers de même format | `MultiResourceItemReader` | **aucune protection** au restart (§3.4) |
| XML | `StaxEventItemReader` | lit un **fragment** à la fois, jamais l'arbre entier |
| JSON | `JsonItemReader` | document = un tableau d'objets ; Jackson |
| Base, un curseur | `JdbcCursorItemReader` | une connexion tenue ; **non** thread-safe |
| Base, par pages | `JdbcPagingItemReader` | tri sur clé **unique** obligatoire |
| JPA | `JpaPagingItemReader`, `JpaCursorItemReader` | |
| Procédure stockée | `StoredProcedureItemReader` | |
| MongoDB | `MongoPagingItemReader`, `MongoCursorItemReader` | tri obligatoire en pagination |
| Tout magasin Spring Data | `RepositoryItemReader` | méthode paginée du repository |
| Service Java existant | `ItemReaderAdapter` | la méthode doit retourner `null` à la fin |

---

## 2. Le code, ligne par ligne

### 2.1 Le fichier à plusieurs formats de ligne

Un export bancaire mêle des lignes de compte et des lignes d'opération, repérées par un préfixe :

```
ACC,FR7612345,Durand,Alice
OP,2026-10-01 09:15:00,D,120.50
OP,2026-10-01 10:02:00,C,2000.00
ACC,FR7698765,Martin,Paul
ACC,FR7600000,Bernard,Jeanne
OP,2026-10-02 14:30:00,D,15.00
```

```java
@Bean
@StepScope
FlatFileItemReader<Object> rawLineReader(
    @Value("#{jobParameters['inputFile']}") String inputFile) {

  var accTokenizer = new DelimitedLineTokenizer();                                  // 1
  accTokenizer.setNames("prefix", "accountNumber", "lastName", "firstName");        // 2

  var opTokenizer = new DelimitedLineTokenizer();
  opTokenizer.setNames("prefix", "date", "type", "amount");                         // 3

  var mapper = new PatternMatchingCompositeLineMapper<Object>();                    // 4
  mapper.setTokenizers(Map.of("ACC*", accTokenizer, "OP*", opTokenizer));           // 5
  mapper.setFieldSetMappers(Map.of(                                                 // 6
      "ACC*", (FieldSetMapper<Object>) fs -> new AccountLine(
          fs.readString("accountNumber"), fs.readString("lastName"), fs.readString("firstName")),
      "OP*", (FieldSetMapper<Object>) fs -> new OperationLine(
          LocalDateTime.parse(fs.readString("date").replace(' ', 'T')),
          fs.readString("type"), fs.readBigDecimal("amount"))));

  return new FlatFileItemReaderBuilder<Object>()
      .name("rawLineReader")                                                        // 7
      .resource(new FileSystemResource(inputFile))
      .lineMapper(mapper)                                                           // 8
      .build();
}

public record AccountLine(String accountNumber, String lastName, String firstName) { }
public record OperationLine(LocalDateTime date, String type, BigDecimal amount) { }
```

1. Un tokenizer par format de ligne : chacun ne connaît que **son** format.
2. Le préfixe est une colonne comme une autre ; on la nomme pour garder les indices alignés.
3. Autre format, autres colonnes.
4. Le mapper composite choisit, pour chaque ligne, le tokenizer **et** le mapper selon son début.
5. Le motif `ACC*` signifie « commence par `ACC` ». Un motif absent pour une ligne donnée provoque une erreur.
6. Un `FieldSetMapper` par format : il transforme les champs en objet typé. `readBigDecimal` convertit directement.
7. Nom unique, comme toujours (Module 3).
8. `lineMapper(...)` remplace la paire tokenizer/mapper simple.

Pourquoi ne pas écrire **un seul** tokenizer qui devine le format ? Il devient vite illisible avec trois ou quatre formats, et
mélange deux responsabilités : reconnaître la ligne, puis la découper.

### 2.2 Regrouper une ligne « compte » et ses lignes « opération » en un seul élément

On veut un `Account` qui contient sa liste d'opérations. Problème : on ne sait qu'un compte est complet qu'en **lisant la ligne
suivante**. La solution est un reader qui regarde en avance (`peek`).

```java
public record Account(String accountNumber, String lastName, String firstName,
                      List<OperationLine> operations) { }

public class AccountReader implements ItemStreamReader<Account> {                    // 1

  private final SingleItemPeekableItemReader<Object> source;                         // 2

  public AccountReader(ItemReader<Object> delegate) {
    this.source = new SingleItemPeekableItemReader<>();                              // 3
    this.source.setDelegate(delegate);                                               // 4
  }

  @Override
  public Account read() throws Exception {
    if (!(source.read() instanceof AccountLine head)) {                              // 5
      return null;                                                                   // 6
    }
    var operations = new ArrayList<OperationLine>();
    while (source.peek() instanceof OperationLine) {                                 // 7
      operations.add((OperationLine) source.read());                                 // 8
    }
    return new Account(head.accountNumber(), head.lastName(), head.firstName(), operations); // 9
  }

  @Override public void open(ExecutionContext ctx)   { source.open(ctx); }           // 10
  @Override public void update(ExecutionContext ctx) { source.update(ctx); }
  @Override public void close()                      { source.close(); }
}
```

1. On implémente `ItemStreamReader` (et non `ItemReader`) car ce reader doit **propager** le cycle de vie `open/update/close` à celui qu'il enveloppe.
2. `SingleItemPeekableItemReader` fournit `peek()` : regarder la ligne suivante **sans la consommer**.
3. Il enveloppe le reader de lignes brutes (§2.1).
4. Le reader de fichier est le « délégué ».
5. *Pattern matching* : si l'élément lu est une ligne de compte, on l'appelle `head`. Sinon c'est la fin des données (`null`) ou un fichier mal formé.
6. Fin du fichier : le step s'arrête.
7. Tant que la ligne **suivante** est une opération, elle appartient à ce compte.
8. On la consomme et on l'ajoute.
9. Le compte, avec zéro, une ou plusieurs opérations, est **un seul élément** : c'est ce que compte le chunk, ce que reçoit le processor et le writer.
10. Chaque méthode du cycle de vie est transmise au délégué : sans cela, le fichier ne serait jamais ouvert ni fermé et la position jamais sauvegardée.

> Cette technique s'appelle la *rupture de contrôle* (control break) : on détecte la fin d'un groupe quand le suivant commence.
> Ici, un chunk de 100 contient **100 comptes**, pas 100 lignes.

### 2.3 Lire PostgreSQL par pages

```java
@Bean
@StepScope
JdbcPagingItemReader<BankTransaction> pagedReader(
    DataSource dataSource, PagingQueryProvider queryProvider,
    @Value("#{jobParameters['accountNumber']}") String accountNumber) {

  return new JdbcPagingItemReaderBuilder<BankTransaction>()
      .name("pagedReader")                                                           // 1
      .dataSource(dataSource)                                                        // 2
      .queryProvider(queryProvider)                                                  // 3
      .parameterValues(Map.of("account", accountNumber))                             // 4
      .pageSize(500)                                                                 // 5
      .rowMapper((rs, i) -> new BankTransaction(                                     // 6
          rs.getLong("id"), rs.getString("account_number"),
          rs.getTimestamp("transaction_date").toLocalDateTime(),
          rs.getString("transaction_type"), rs.getBigDecimal("amount")))
      .build();
}

@Bean
SqlPagingQueryProviderFactoryBean queryProvider(DataSource dataSource) {
  var factory = new SqlPagingQueryProviderFactoryBean();
  factory.setDataSource(dataSource);                                                 // 7
  factory.setSelectClause("SELECT id, account_number, transaction_date, transaction_type, amount");
  factory.setFromClause("FROM bank_transaction");
  factory.setWhereClause("WHERE account_number = :account");                         // 8
  factory.setSortKey("id");                                                          // 9
  return factory;
}
```

1. Nom obligatoire : la page courante est sauvegardée sous ce préfixe.
2. Source de données PostgreSQL.
3. Le « fournisseur de requête » sait écrire la requête paginée **propre au SGBD**.
4. Les paramètres nommés (`:account`) sont donnés sous forme de table.
5. 500 lignes par requête ; ensuite le reader sert les éléments un par un.
6. Le `RowMapper` : **chaque colonne doit être lue** (piège n°9 du Module 3).
7. La fabrique **détecte PostgreSQL** à partir de la `DataSource` et choisit la bonne variante de requête.
8. Les clauses sont fournies **par morceaux** ; le reader assemble une requête par page.
9. **Clé de tri unique** : le reader s'en sert pour repérer la page suivante. Une clé non unique ou modifiée pendant la lecture fait **sauter ou répéter** des lignes (piège n°6 du Module 3).

### 2.4 Un reader personnalisé qui sait reprendre

Pour une source sans reader prêt à l'emploi (ici, une liste de comptes fournie par un service), on étend la classe de base
qui **compte les éléments lus** et gère la reprise à notre place :

```java
public class ExternalAccountsReader extends AbstractItemCountingItemStreamItemReader<AccountLine> { // 1

  private final AccountClient client;                                                // 2
  private Iterator<AccountLine> iterator;

  public ExternalAccountsReader(AccountClient client) {
    this.client = client;
    setName("externalAccountsReader");                                               // 3
  }

  @Override protected void doOpen() {                                                // 4
    iterator = client.fetchAll().iterator();
  }

  @Override protected AccountLine doRead() {                                         // 5
    return iterator.hasNext() ? iterator.next() : null;
  }

  @Override protected void doClose() {                                               // 6
    iterator = null;
  }
}
```

1. La classe de base maintient un compteur et le sauvegarde à chaque chunk dans l'`ExecutionContext`. Au redémarrage, elle **saute** les éléments déjà lus (`doOpen`, puis lectures à vide jusqu'au compteur).
2. Le client du service externe, injecté.
3. Nom obligatoire (préfixe des clés sauvegardées).
4. Ouvre la source (ici : charge l'itérateur).
5. Lit **un** élément ou `null`.
6. Libère la source.

> Écrire soi-même `open`/`update` avec ses propres clés est possible (classe `ItemStreamSupport` et sa méthode
> `getExecutionContextKey`), mais la classe de base ci-dessus est plus simple et plus sûre.
> **Attention :** `fetchAll()` charge tout en mémoire : acceptable pour 1 000 comptes, pas pour 10 millions (piège n°2 du Module 3).

### 2.5 Échouer quand il n'y a aucune donnée

Par défaut, un fichier vide ou une requête sans résultat termine le step normalement. Si c'est anormal :

```java
@Component
public class EmptyInputFailer implements StepExecutionListener {                     // 1
  @Override
  public ExitStatus afterStep(StepExecution stepExecution) {                         // 2
    return stepExecution.getReadCount() > 0
        ? stepExecution.getExitStatus()                                              // 3
        : ExitStatus.FAILED;                                                         // 4
  }
}
```

1. Un listener de step : appelé avant et après chaque step.
2. `afterStep` reçoit la `StepExecution` terminée et **renvoie le code de sortie** final.
3. Des données ont été lues : on laisse le code de sortie tel quel.
4. Aucune donnée : le code de sortie devient `FAILED`. Le job pourra alors être aiguillé vers une alerte (Module 5).

### 2.6 Ignorer certaines erreurs de lecture

```java
.faultTolerant()
.skip(FlatFileParseException.class)                                                  // 1
.skipLimit(10)                                                                       // 2
.listener(new SkippedLinesLogger())                                                  // 3
```

1. On ignore uniquement les erreurs de **format de ligne**.
2. Au-delà de 10 lignes ignorées, le step échoue : au-delà d'un seuil, c'est le fichier qui est mauvais.
3. Un listener consigne la ligne fautive. `FlatFileParseException` expose le **numéro de ligne** et le **texte brut** : de quoi écrire un rapport de rejets.

Pour une règle plus fine, on implémente `SkipPolicy` :

```java
public class FileSkipPolicy implements SkipPolicy {
  @Override
  public boolean shouldSkip(Throwable t, long skipCount) {                           // 1
    return switch (t) {                                                              // 2
      case FileNotFoundException e -> false;                                         // 3
      case FlatFileParseException e -> skipCount < 10;                               // 4
      default -> false;
    };
  }
}
```

1. Reçoit l'exception et le nombre d'éléments déjà ignorés.
2. `switch` avec *pattern matching* sur le type de l'exception (Java 21+).
3. Un fichier manquant n'est **jamais** ignorable.
4. Une ligne mal formée l'est tant que le seuil n'est pas atteint.

(Le skip est approfondi au Module 6.)

---

## 3. Plongée « sous le capot »

### 3.1 Pourquoi un reader à état doit être un `ItemStream`

Les readers fournis ouvrent et ferment leur ressource et sauvegardent leur position tout seuls : ils implémentent déjà `ItemStream`.
Si vous écrivez un reader qui **enveloppe** un autre reader (§2.2), c'est à vous de **retransmettre** `open`, `update` et `close`. Oublier
`update` ne casse pas le premier lancement, mais **aucune position n'est sauvegardée** : la reprise rejouera tout.

### 3.2 Un fragment, pas l'arbre : XML et JSON

Un parseur DOM charge tout le document en mémoire : impossible sur un gros fichier. Spring Batch utilise StAX, un parseur **à
événements** qui permet de lire **un fragment à la fois** (par exemple chaque balise `<account>`) et de le convertir en objet. Même
principe pour `JsonItemReader` : le fichier doit contenir **un seul tableau** d'objets, lu élément par élément.
Mémoire stable quelle que soit la taille du fichier.

### 3.3 Curseur ou pages : une question de connexion et de threads

- Un **curseur** garde un `ResultSet` ouvert : une seule requête, une connexion occupée pendant tout le step, et **pas de partage entre threads**.
- La **pagination** émet une requête par page : la connexion est libérée entre deux pages, le reader est utilisable en multithread
  (Module 7), au prix d'un tri obligatoire.
- Selon la base et le pilote, un curseur peut **charger tout le résultat en mémoire** au lieu de le diffuser : voir l'encart « Rappel : qu'est-ce qu'un curseur ? » du Module 3 (§3.5) : avec PostgreSQL, il faut
  désactiver l'auto-commit **et** fixer le `fetchSize`.

### 3.4 Plusieurs fichiers : aucune protection au restart

`MultiResourceItemReader` parcourt une liste de fichiers avec un seul reader délégué (qui doit alors implémenter
`ResourceAwareItemReaderItemStream`, pour recevoir chaque fichier tour à tour). Au **restart**, la liste est **recalculée** : un fichier
déposé entre le premier lancement et la reprise sera traité, alors qu'il n'existait pas au départ.
**Parade :** un répertoire **par exécution**. Tous les fichiers du lot y sont déposés ; les nouveaux fichiers vont dans le répertoire suivant.

### 3.5 Pourquoi un ORM complet est risqué en batch

Une session JPA/Hibernate **mémorise chaque entité lue** (cache de premier niveau). Sur un million de lignes lues puis écrites,
la mémoire grossit jusqu'à `OutOfMemoryError`. Le coût d'un ORM par élément reste en outre supérieur à celui de JDBC, et la mémoire demande une
surveillance particulière (vider la session régulièrement, ne lire que les colonnes utiles). Quand le mapping existe déjà, c'est un bon raccourci ;
quand la performance prime, préférez JDBC. Aucun reader Hibernate natif n'existe en 6.0.6 (§1.2) : passez par JPA.

---

## 4. Cas d'usage

### 4.1 L'export hétérogène d'une application historique

Une application plus ancienne produit un seul fichier où comptes et opérations se mêlent. Le reader à formats multiples (§2.1) et le
reader de regroupement (§2.2) en font des `Account` complets sans écrire d'analyseur monolithique.

### 4.2 La réconciliation depuis PostgreSQL

Lecture paginée (§2.3) des transactions d'un compte, par pages de 500, avec clé de tri unique : débit régulier, mémoire constante,
reprise possible.

### 4.3 Une source sans reader

Un service interne expose des comptes via une API. On enveloppe l'appel dans un reader personnalisé (§2.4) : le compteur de la classe
de base rend la reprise automatique.

---

## 5. Pièges

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| 1 | Reader d'enveloppe qui oublie `open`/`update`/`close` | fichier jamais fermé ; aucune position sauvegardée | retransmettre les trois méthodes (§2.2) |
| 2 | Motif de ligne absent dans `PatternMatchingCompositeLineMapper` | erreur sur une ligne de type inconnu | prévoir un motif par format (et un motif de rejet explicite) |
| 3 | `FixedLengthTokenizer` en mode strict | une ligne plus longue ou plus courte que les colonnes fait échouer le step | caler les colonnes sur le cas le plus long, ou assouplir en connaissance de cause (Module 3) |
| 4 | Espaces conservés dans les champs en positions fixes | `"Durand    "` ≠ `"Durand"`, jointures et comparaisons fausses | nettoyer dans le `FieldSetMapper` ou le processor |
| 5 | Tri de pagination non unique | lignes sautées ou lues deux fois, sans erreur | clé de tri unique (§2.3) |
| 6 | `MultiResourceItemReader` avec restart | un fichier ajouté entre-temps est traité | répertoire par exécution (§3.4) |
| 7 | `ItemReaderAdapter` dont la méthode ne retourne jamais `null` | **boucle infinie** : le step ne se termine pas | la méthode doit retourner `null` à la fin |
| 8 | Reader d'adaptateur dont la méthode retourne une **liste** | la liste entière devient **un seul élément** | retourner un élément à la fois, ou itérer dans le processor |
| 9 | Fichier vide traité comme un succès | un lot « réussi » sans aucune donnée passe inaperçu | `EmptyInputFailer` (§2.5) |
| 10 | Ignorer des erreurs sans les consigner | des lignes disparaissent sans trace, **inacceptable pour de l'argent** | listener de rejets avec numéro de ligne et texte brut |

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 3B.1 | Le catalogue des readers (et ce qui a disparu) | 6 min | §1 |
| 3B.2 | Fichiers à plusieurs formats | 8 min | §2.1 |
| 3B.3 | Un compte et ses opérations : la rupture de contrôle | 9 min | §2.2, §3.1 |
| 3B.4 | Lire PostgreSQL par pages | 8 min | §2.3, §3.3 |
| 3B.5 | Reader personnalisé, entrées vides, erreurs | 9 min | §2.4-2.6, §5 |
| | **Total** | **≈ 40 min** | |

## 7. Exercices

1. **Rupture de contrôle.** Avec le fichier du §2.1, combien d'`Account` le reader retourne-t-il et combien d'opérations contient chacun ? Que devient un compte sans opération ?
2. **Chunk.** Avec un chunk de 100, combien de **lignes** du fichier peuvent être traitées dans une seule transaction ? Pourquoi la réponse n'est-elle pas 100 ?
3. **Pagination.** Un collègue trie les pages sur `transaction_date`. Plusieurs transactions partagent la même date. Que risque-t-il de se passer, et comment corriger ?
4. **Restart.** Un job lit tous les fichiers d'un répertoire partagé avec `MultiResourceItemReader`. Il échoue au deuxième fichier ; un troisième fichier arrive avant la reprise. Que traite la reprise ? Quelle organisation évite le problème ?
