# Module 3 (complément) · Le catalogue des writers

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Complet : **Optionnel / Avancé**. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 25 à 30 min, en 5 sous-vidéos de 4 à 8 min.
> **Prérequis :** Module 3 (chunk, `JdbcBatchItemWriter`), Module 3B (readers, `ItemStream`).
> **Sources :** classes de Spring Batch 6.0.6 lues dans les jars (`spring-batch-infrastructure`), et le chapitre « ItemWriters » des ouvrages de référence
> sur Spring Batch (Spring Batch 4 et 5), **reformulés et adaptés** : exemples réécrits sur le cas bancaire du cours, et mis à jour pour la 6.0.6.
> Projet de référence : `tp/tpProd`.

---

## 1. Le concept

### 1.1 Un writer, un contrat simple

`ItemWriter<T>` n'a qu'une méthode : `write(Chunk<? extends T> chunk)`. Elle reçoit **tout le chunk d'un coup** (100 éléments si le chunk vaut 100),
et non un élément à la fois comme un reader ou un processor. C'est ce qui permet les écritures groupées : un seul lot JDBC, un seul appel réseau, une seule écriture disque.

Si le writer garde une ressource ouverte (un fichier, une connexion), il doit aussi être un **`ItemStream`** (`open`, `update`, `close`) : c'est l'interface
`ItemStreamWriter<T>`. Comme pour les readers (Module 3B), la position d'écriture est alors sauvegardée à chaque chunk.

### 1.2 Ce qui a changé depuis les livres (à savoir avant de copier un tutoriel)

Vérifié dans les jars de la 6.0.6 :

| Dans les livres (Spring Batch 4 et 5) | Dans Spring Batch 6.0.6 |
|---|---|
| `HibernateItemWriter` | **absent** : pour un ORM, on passe par `JpaItemWriter` |
| `write(List<? extends T> items)` | **`write(Chunk<? extends T> chunk)`** (depuis la version 5) |
| paquets `org.springframework.batch.item.*` | **`org.springframework.batch.infrastructure.item.*`** |
| `new FlatFileItemWriter<>()` puis `setResource`, `setLineAggregator` | constructeurs `FlatFileItemWriter(resource, lineAggregator)` ; ou, plus simple, le builder |
| `FlatFileItemWriterBuilder.names(...)` sur un record : échec (pas de getters `getX()`) | avec **`sourceType(MonRecord.class)`**, le builder utilise `RecordFieldExtractor` : les **noms des composants** du record suffisent |
| marshaller JSON basé sur Jackson 2 | **`JacksonJsonObjectMarshaller`**, fondé sur **Jackson 3** (`tools.jackson`) ; `GsonJsonObjectMarshaller` existe aussi |
| `ClassifierCompositeItemWriter` : classifieur en classe | `Classifier<T, ItemWriter<? super T>>` est une interface fonctionnelle : une **lambda** suffit |

### 1.3 Le catalogue

| Destination | Writer | Remarque clé |
|---|---|---|
| Base, SQL à la main | `JdbcBatchItemWriter` | un lot JDBC par chunk ; paramètres nommés ; `assertUpdates` (vrai par défaut) |
| Base, via JPA | `JpaItemWriter` | `merge` par défaut, `persist` si `usePersist(true)` ; **vide le contexte de persistance** si demandé |
| Base, via Spring Data | `RepositoryItemWriter` | délègue à un `CrudRepository` |
| Fichier plat (délimité, positions fixes) | `FlatFileItemWriter` | en-tête, pied de page, **transactionnel** (§3.1) |
| Fichier JSON | `JsonFileItemWriter` | un tableau JSON ; marshaller Jackson 3 ou Gson |
| Fichier XML | `StaxEventItemWriter` | un fragment par élément, dans un élément racine |
| Plusieurs fichiers numérotés | `MultiResourceItemWriter` | autour d'un writer de fichier ; **découpe par nombre d'éléments** |
| Plusieurs destinations, **toutes** | `CompositeItemWriter` | chaque writer reçoit **le chunk entier** |
| Une destination **selon l'élément** | `ClassifierCompositeItemWriter` | un classifieur choisit le writer ; **n'est pas un `ItemStream`** (§3.3) |
| Messages | `JmsItemWriter`, `AmqpItemWriter`, `KafkaItemWriter` | écriture **hors transaction de la base** (§3.2) |
| Autres magasins | `MongoItemWriter`, `RedisItemWriter`, `AvroItemWriter` | selon la technologie |
| Courrier | `SimpleMailMessageItemWriter`, `MimeMessageItemWriter` | un message par élément |
| Une méthode d'un bean existant | `ItemWriterAdapter`, `PropertyExtractingDelegatingItemWriter` | un appel **par élément** (§2.7) |
| Un simple `Consumer` | `ConsumerItemWriter` | pratique pour un prototype |
| Rien (tests) | `ListItemWriter` | garde les éléments en mémoire |
| Verrouillage (multithread) | `SynchronizedItemStreamWriter`, `SynchronizedItemWriter` | sérialise `write` (Module 7) |

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Base de données : reader et writer JDBC »** (n°36) du PPT du cours pour la partie JDBC. Les autres destinations n'ont pas de diapositive : à créer.

---

## 2. Le code, ligne par ligne

### 2.1 Exporter un relevé en CSV, avec en-tête et pied de page

On lit `bank_transaction` (reader paginé du Module 3B) et on écrit un fichier pour la comptabilité.

```java
@Bean
FlatFileItemWriter<BankTransaction> statementWriter(
    @Value("${export.dir}/releve.csv") WritableResource out) {                     // 1
  return new FlatFileItemWriterBuilder<BankTransaction>()
      .name("statementWriter")                                                      // 2
      .resource(out)
      .delimited().delimiter(";")                                                   // 3
      .sourceType(BankTransaction.class)                                            // 4
      .names("id", "accountNumber", "transactionDate", "transactionType", "amount")
      .headerCallback(w -> w.write("id;compte;date;type;montant"))                  // 5
      .footerCallback(w -> w.write("# fin du relevé"))                              // 6
      .shouldDeleteIfExists(true)                                                   // 7
      .build();
}
```

1. La destination est une **`WritableResource`** (et non une simple `Resource`). **On utilise `WritableResource` pour garantir que le fichier est ouvert en écriture et non en simple lecture** : une `Resource` ordinaire sait seulement se lire.
2. Nom obligatoire dès que l'état est sauvegardé : il préfixe les clés de l'`ExecutionContext`.
3. Séparateur `;` (le point-virgule est courant dans les exports français : la virgule sert de séparateur décimal).
4. `sourceType` avec un **record** : le builder emploie `RecordFieldExtractor`. Sans lui, il chercherait des getters `getId()` que les records n'ont pas (même piège que `beanMapped()` au Module 3).
5. L'en-tête est un `FlatFileHeaderCallback` : une méthode `writeHeader(Writer)`. Une lambda suffit.
6. Le pied de page : même principe (`FlatFileFooterCallback`). Typique : un total de contrôle ou un nombre de lignes.
7. Vrai par défaut : si le fichier existe déjà **au premier lancement**, il est écrasé. À `false`, un fichier existant fait échouer le step plutôt que d'être écrasé.

> Les montants (`BigDecimal`) sont écrits avec `toString()` : `1234.50`. Pour un autre format (virgule décimale, zéros à gauche), utiliser un **`FieldExtractor`** personnalisé
> ou le mode formaté ci-dessous.

### 2.2 Un fichier en positions fixes pour un système historique

Certains destinataires attendent des colonnes de largeur fixe. On passe par `formatted()` et un format `printf` :

```java
.formatted().format("%-12s%-8s%12.2f")          // 1
.sourceType(BankTransaction.class)
.names("accountNumber", "transactionType", "amount")
```

1. **C'est un gabarit**, comme un formulaire à cases : chaque morceau décrit une colonne. Prenons `%-12s` : le `s` dit « du texte », le **`-`** dit « **aligne à gauche** », le **`12`** dit « **prends 12 caractères de large** ». Pour `%12.2f` : le `f` dit « un nombre décimal », le **`.2`** dit « **2 décimales** » et le `12` fixe la largeur (un nombre est aligné à **droite** par défaut). Une valeur plus longue que la largeur **déborde** et décale la suite de la ligne : prévoir `minimumLength` et `maximumLength` pour échouer plutôt que de produire un fichier faux.

### 2.3 Écrire en base : `JdbcBatchItemWriter`, rappel et réglages

Le writer du Module 3 reste la référence. Trois réglages à connaître :

```java
new JdbcBatchItemWriterBuilder<BankTransaction>()
    .dataSource(dataSource)
    .sql("INSERT INTO bank_transaction (...) VALUES (...) ON CONFLICT (id) DO NOTHING")   // 1
    .itemSqlParameterSourceProvider(tx -> new MapSqlParameterSource()...)
    .assertUpdates(false)                                                                  // 2
    .build();
```

1. `ON CONFLICT … DO NOTHING` (ou `DO UPDATE`) rend l'écriture **rejouable** : un chunk rejoué ou une reprise ne crée pas de doublon (Module 3).
2. Par défaut (`true`), le writer **échoue** si une requête du lot n'a modifié **aucune ligne**. Avec `DO NOTHING`, une ligne déjà présente renvoie zéro : il faut alors `assertUpdates(false)`, sinon le job échoue sur un cas parfaitement normal.

> `beanMapped()` et `columnMapped()` existent pour les JavaBeans et les `Map` ; pour un record, on garde le fournisseur de paramètres explicite.

### 2.4 Plusieurs destinations pour chaque élément : `CompositeItemWriter`

**L'image à retenir : `CompositeItemWriter` est un photocopieur.** Il prend le chunk entier et le duplique vers toutes les destinations, l'une après l'autre.
On veut ici **à la fois** écrire en base et garder une trace dans un fichier d'audit :

```java
@Bean
CompositeItemWriter<BankTransaction> dbAndAuditWriter(
    JdbcBatchItemWriter<BankTransaction> bankDbWriter,
    FlatFileItemWriter<BankTransaction> auditWriter) {
  return new CompositeItemWriterBuilder<BankTransaction>()
      .delegates(bankDbWriter, auditWriter)                                    // 1
      .build();                                                                // 2
}
```

1. Les writers sont appelés **dans l'ordre**, chacun avec **le chunk entier**.
2. `CompositeItemWriter` est un `ItemStreamWriter` : il **ouvre et ferme** lui-même les délégués qui sont des `ItemStream` (le fichier d'audit). On n'a donc pas besoin de les déclarer sur le step, sauf si on met `ignoreItemStream(true)`.

Si le deuxième writer échoue, la transaction est annulée : la base revient en arrière, et le **fichier transactionnel** (§3.1) oublie son tampon. Les deux restent cohérents.

### 2.5 Une destination selon l'élément : `ClassifierCompositeItemWriter`

**L'image à retenir : `ClassifierCompositeItemWriter` est un facteur.** Il regarde chaque lettre (chaque élément) une par une et la dépose dans la boîte aux lettres (le writer) qui correspond à sa règle. Là où le photocopieur envoie **tout à tout le monde**, le facteur **trie**.
Les transactions de type débit vont dans un fichier, les crédits dans un autre :

```java
@Bean
ClassifierCompositeItemWriter<BankTransaction> routingWriter(
    FlatFileItemWriter<BankTransaction> debitWriter,
    FlatFileItemWriter<BankTransaction> creditWriter) {
  return new ClassifierCompositeItemWriterBuilder<BankTransaction>()
      .classifier(tx -> "D".equals(tx.transactionType()) ? debitWriter : creditWriter)   // 1
      .build();
}

// dans le step :
.writer(routingWriter)
.stream(debitWriter).stream(creditWriter)                                                 // 2
```

1. Le classifieur est une **lambda** : elle reçoit l'élément et retourne le **writer** qui doit le recevoir. Les éléments d'un même chunk peuvent partir vers des writers différents.
2. **Piège classique** : `ClassifierCompositeItemWriter` n'est **pas** un `ItemStream`. Les deux writers de fichier ne seraient donc **jamais ouverts**. Il faut les enregistrer à la main avec `.stream(...)`. Sans cela, la première écriture échoue avec « Writer must be open before it can be written to ».

### 2.6 Découper un gros export : `MultiResourceItemWriter`

Un export de 2 millions de lignes en un seul fichier est difficile à transmettre. On le coupe tous les 500 000 éléments :

```java
@Bean
MultiResourceItemWriter<BankTransaction> splitWriter(
    FlatFileItemWriter<BankTransaction> delegate,
    @Value("file:${export.dir}/releve") WritableResource base) {
  return new MultiResourceItemWriterBuilder<BankTransaction>()
      .name("splitWriter")
      .resource(base)                                                          // 1
      .delegate(delegate)                                                      // 2
      .itemCountLimitPerResource(500_000)                                      // 3
      .build();
}
```

1. La **base** du nom : les fichiers seront `releve.1`, `releve.2`, etc. (suffixe personnalisable avec un `ResourceSuffixCreator`).
2. Le délégué est un writer de fichier. Sa propre ressource est **remplacée** à chaque nouveau fichier : ne pas lui en donner une fixe.
3. Le compte porte sur les **éléments** et non sur les chunks. La coupure a lieu **à la fin d'un chunk** : un fichier peut donc dépasser un peu la limite si elle n'est pas un multiple de la taille du chunk. Choisir une limite multiple du chunk.

> L'en-tête et le pied de page du délégué sont écrits dans **chaque** fichier.

### 2.7 Écrire en JSON, ou appeler un bean existant

**JSON** : un tableau d'objets, pratique pour une application web ou une API.

```java
new JsonFileItemWriterBuilder<BankTransaction>()
    .name("jsonWriter")
    .resource(out)
    .jsonObjectMarshaller(new JacksonJsonObjectMarshaller<>())      // 1
    .build();
```

1. En Spring Batch 6, ce marshaller repose sur **Jackson 3**. Un `JsonMapper` personnalisé se passe au constructeur (formats de date, modules).

**Un bean existant** : le service `AccountClient` expose déjà `register(AccountLine)`. Sans écrire de writer :

```java
var adapter = new ItemWriterAdapter<AccountLine>();
adapter.setTargetObject(accountClient);
adapter.setTargetMethod("register");        // appelée UNE FOIS PAR ÉLÉMENT
```

`PropertyExtractingDelegatingItemWriter` fait de même, mais passe **des propriétés** de l'élément comme arguments de la méthode (`setFieldsUsedAsTargetMethodArguments`).
Pratique pour un prototype ; pour un système réel, préférer un writer écrit à la main (§2.8) qui envoie **tout le chunk** en un appel.

### 2.8 Écrire son propre writer

Quand aucune destination n'existe, ou pour envoyer le chunk en un seul appel :

```java
public class AccountApiWriter implements ItemWriter<AccountLine> {                        // 1

  private final AccountClient client;
  public AccountApiWriter(AccountClient client) { this.client = client; }

  @Override
  public void write(Chunk<? extends AccountLine> chunk) {                                 // 2
    client.registerAll(chunk.getItems());                                                 // 3
  }
}
```

1. Interface à une méthode. Si le writer garde une ressource ouverte, étendre `AbstractItemStreamItemWriter` : on obtient `open`, `update`, `close` et le nom pour les clés d'état.
2. Le paramètre est un **`Chunk`**, pas une liste (depuis la version 5).
3. **Un appel pour tout le chunk** : cent éléments, un seul aller-retour réseau. Si le service externe n'est pas transactionnel, lire l'**Annexe REST** : un rejeu de chunk renvoie les éléments.

---

## 3. Plongée « sous le capot »

### 3.1 Pourquoi un writer de fichier est « transactionnel »

**L'image à retenir : le brouillon.** Le writer de fichier n'écrit pas directement sur le disque dur. Il écrit dans un **brouillon** (un tampon en mémoire).
Si le chunk est **validé** (commit), il **recopie le brouillon au propre** sur le disque. Si le chunk **échoue** (rollback), il **jette le brouillon**.
C'est ce qui garantit qu'**il n'y a jamais de ligne à moitié écrite** : le fichier suit la **même frontière** que la base. (Le nom de la classe qui s'en charge : `TransactionAwareBufferedWriter`.)

À chaque chunk, le writer sauvegarde dans l'`ExecutionContext` deux valeurs : `<nom>.current.count` (éléments écrits) et `<nom>.written` (**position en octets** validée dans le fichier).
Au **restart**, il rouvre le fichier, le **tronque** à cette position, et reprend. L'en-tête n'est pas réécrit. Résultat : pas de ligne en double, pas de ligne tronquée.

Réglage `transactional(false)` : écriture immédiate, plus rapide, mais un rollback laisse des lignes dans le fichier. À réserver aux fichiers de travail jetables.
`forceSync(true)` force l'écriture physique sur le disque à chaque chunk : plus sûr en cas de coupure de courant, nettement plus lent.

### 3.2 Les destinations qui ne suivent pas la transaction

La base et le fichier transactionnel sont **cohérents** avec le chunk. Une file de messages (`JmsItemWriter`, `KafkaItemWriter`, `AmqpItemWriter`), une API, un courriel ne le sont pas toujours :
un message **déjà envoyé** ne revient pas après un rollback, et le chunk rejoué le **renvoie**. Deux parades : un destinataire **idempotent**
(clé de déduplication stable), ou le motif **outbox** (écrire en base, envoyer ensuite). Détail dans l'**Annexe REST** (écriture vers une API).

### 3.3 Qui ouvre les writers ? La règle des `ItemStream`

Spring Batch enregistre automatiquement le **writer du step** s'il est un `ItemStream`. Il ne **descend pas** dans les délégués d'un writer qui n'est pas lui-même un `ItemStream`.

| Writer de composition | Ouvre ses délégués ? |
|---|---|
| `CompositeItemWriter` | **oui** (il est un `ItemStreamWriter`) |
| `ClassifierCompositeItemWriter` | **non** : enregistrer chaque délégué avec `.stream(...)` |
| `MultiResourceItemWriter` | oui, pour son délégué |
| `SynchronizedItemStreamWriter` | oui |

Un writer de fichier jamais ouvert échoue au premier `write`. Un fichier ouvert mais mal fermé peut rester **vide** ou **incomplet**.

### 3.4 Écrire à plusieurs threads

Dans un step multithread (Module 7), le même writer reçoit des chunks de plusieurs threads. `JdbcBatchItemWriter` est prévu pour : il crée un lot par appel
et chaque thread a sa propre transaction. `FlatFileItemWriter` **ne l'est pas** : un seul fichier, un seul tampon. On l'enveloppe dans un
`SynchronizedItemStreamWriter`, qui sérialise `write`, et on accepte que les lignes soient écrites dans un **ordre non garanti**.
Avec plusieurs threads, la position `written` n'a plus de sens : fixer `saveState(false)` et renoncer à la reprise au chunk près (comme pour les readers).

### 3.5 Ce que fait `assertUpdates` et pourquoi c'est utile

Avec `assertUpdates(true)`, une requête du lot qui ne modifie **aucune ligne** fait échouer le chunk. Pour un `UPDATE ... WHERE id = :id`, c'est précieux :
une ligne introuvable est une **erreur de données**, pas un succès silencieux. Pour un `INSERT ... ON CONFLICT DO NOTHING`, c'est l'inverse : zéro ligne est normal (§2.3).

---

## 4. Cas d'usage

### 4.1 Le relevé mensuel pour la comptabilité

Reader paginé sur `bank_transaction` → `FlatFileItemWriter` avec en-tête, total de contrôle en pied de page, un fichier par mois. En cas d'échec à mi-parcours, le restart tronque le fichier et reprend.

### 4.2 L'export découpé pour un partenaire

Même reader → `MultiResourceItemWriter` autour d'un `FlatFileItemWriter` : un fichier par tranche de 500 000 lignes, que le partenaire récupère par SFTP.

### 4.3 Base et audit en une seule passe

`CompositeItemWriter` : écriture dans `bank_transaction` et dans un fichier d'audit. Un échec sur l'un annule l'autre.

### 4.4 Le routage débit et crédit

`ClassifierCompositeItemWriter` : deux fichiers (`debits`, `credits`) alimentés par le même flux, sans deuxième lecture de la source.

---

## 5. Pièges

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| 1 | `.names(...)` sur un record **sans** `sourceType(...)` | échec : aucun getter `getX()` | `sourceType(MonRecord.class)` (§2.1) |
| 2 | Writer de fichier sans nom | l'état ne peut pas être sauvegardé : pas de reprise | toujours `name(...)` |
| 3 | `ClassifierCompositeItemWriter` sans `.stream(...)` | « Writer must be open » au premier `write` | enregistrer chaque délégué (§2.5) |
| 4 | `assertUpdates(true)` avec `ON CONFLICT DO NOTHING` | le job échoue sur une ligne déjà présente | `assertUpdates(false)` (§2.3) |
| 5 | Largeur fixe dépassée par une valeur | colonnes décalées, fichier faux sans erreur | `maximumLength`, ou valider avant (§2.2) |
| 6 | `MultiResourceItemWriter` avec une ressource fixe sur le délégué | tous les fichiers écrivent au même endroit | laisser la ressource au `MultiResourceItemWriter` |
| 7 | Limite par fichier non multiple du chunk | fichiers un peu plus gros que prévu | choisir un multiple (§2.6) |
| 8 | `transactional(false)` en production | lignes laissées dans le fichier après un rollback | garder la valeur par défaut |
| 9 | `FlatFileItemWriter` partagé entre threads sans protection | lignes mélangées ou perdues | `SynchronizedItemStreamWriter` (§3.4) |
| 10 | Écrire vers une API ou une file comme vers une base | doublons au rejeu du chunk | destinataire idempotent ou outbox (§3.2) |

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 3C.1 | Le catalogue des writers (et ce qui a changé) | 5 min | §1 |
| 3C.2 | Écrire un fichier : CSV, positions fixes, JSON | 7 min | §2.1, §2.2, §2.7 |
| 3C.3 | Pourquoi un fichier est transactionnel | 6 min | §3.1, §3.5 |
| 3C.4 | Plusieurs destinations : composite, routage, découpage | 8 min | §2.4 à 2.6, §3.3, §3.4 |
| 3C.5 | Son propre writer, et les destinations hors transaction | 6 min | §2.7, §2.8, §3.2, §5 |
| | **Total** | **≈ 30 min** | |

## 7. Exercices

1. **Record.** Un collègue écrit `.delimited().names("id", "amount")` sur un `BankTransaction` (un record) et obtient une erreur. Quelle ligne manque, et pourquoi ?
2. **Restart.** Un export de 10 000 lignes échoue à la ligne 6 300 après un commit à 6 000. Que contient le fichier après le rollback ? Que fait le restart du fichier ?
3. **Routage.** Un `ClassifierCompositeItemWriter` envoie les débits et les crédits vers deux `FlatFileItemWriter`. Le job échoue au premier `write`. Quelle ligne manque dans la configuration du step ?
4. **assertUpdates.** Un `INSERT … ON CONFLICT (id) DO NOTHING` échoue sur la ligne 12 d'un chunk alors que tout est « normal ». Quelle est la cause et quel est le réglage ?
5. **Découpage.** `itemCountLimitPerResource(500_000)` avec un chunk de 300. Combien d'éléments le premier fichier contient-il au plus ?

---

> *« Vous savez maintenant lire et écrire vers presque n'importe quelle source. Le Module 4 (processors) vous attend pour transformer les données entre les deux. »*
