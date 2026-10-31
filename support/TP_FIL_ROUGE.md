# TP fil rouge : le catalogue de produits

Chaque étape correspond à une scène de la vidéo (`video/index.html`) et à un chapitre du cours
([`COURS_SPRING_BATCH.md`](COURS_SPRING_BATCH.md)). Le code complet de chaque étape se trouve dans
`tp/tpSpringBatchSolution`; le point de départ dans `tp/tpSpringBatch`.

Légende : ✅ CONFIRMÉ (exécuté ici, `docs/verifications/`) · 📐 CONVENTION · 🔔 bonne pratique (signal sonore dans la vidéo).

## Préparation (à faire une fois)

```bash
cd tp/tpSpringBatchSolution
# 1. Base métier productdb (H2 fichier ~/productDb) : tables + 4 produits
java -cp ~/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar org.h2.tools.RunScript -url jdbc:h2:~/productDb -user sa -script src/main/resources/sql/batch-schema.sql
java -cp ~/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar org.h2.tools.RunScript -url jdbc:h2:~/productDb -user sa -script src/main/resources/sql/insert-products.sql
```

```bash
# 2. Tous les tests, avec un JobRepository H2 en mémoire (le dépôt pointe sur MariaDB par défaut)
mvn test -Dspring.datasource.url='jdbc:h2:mem:jr;DB_CLOSE_DELAY=-1' -Dspring.datasource.driverClassName=org.h2.Driver -Dspring.datasource.username=sa -Dspring.datasource.password=
```

✅ Sans l'étape 1, `TestIncreaseProductPriceInDbJob` et `TestFromDetailsCsvToDbWithSkipsJob` échouent
(`Table "PRODUCT_WITH_DETAILS" not found`). Avec elle : **16 classes de test, 15 passent**.
La seule en échec, `TestFromDetailsCsvToDbWithRestartableJob`, lit un fichier contenant des lignes en erreur
sans `skip` : c'est le point de départ de l'étape 9.

---

## Étape 1 · Projet et JobRepository (scène 3)

1. Spring Initializr : Java 17, Maven, Spring Boot 3.x, dépendances *Spring Batch* et *H2*.
2. `application.properties` :

```properties
spring.batch.jdbc.initialize-schema=always      # crée les tables BATCH_*
spring.batch.job.enabled=false                  # on lance nous-mêmes les jobs
spring.datasource.url=jdbc:h2:~/jobRepositoryDb # base de Spring Batch
spring.productdb.datasource.url=jdbc:h2:~/productDb   # base métier (secondaire)
```

3. Classe `AutomaticSpringBootBatchJobRepositoryConfig` : une `DataSource` `@Primary` + `@BatchDataSource`.

🔔 **`job.enabled=false`** — *Pourquoi* : sinon Spring Boot lance tous les jobs au démarrage. *Évite* : un lancement involontaire et l'erreur « plusieurs jobs ».
🔔 **Une seule datasource primaire** — *Pourquoi* : Spring Boot doit savoir où écrire ses métadonnées. *Évite* : métadonnées dans la mauvaise base, échec au démarrage.
🔔 **Pas d'`@EnableBatchProcessing` avec Boot 3** — *Pourquoi* : il désactive l'auto-configuration. *Évite* : JobRepository/lanceur non créés comme prévu.
🔔 **Secrets hors du dépôt** — le dépôt contient `spring.datasource.password=root`. *Évite* : fuite de mot de passe dans git (`${DB_PASSWORD}`).

## Étape 2 · Premier job : une tasklet (scène 4)

Écris `PrintMessageTasklet` (`execute()` affiche le message, retourne `RepeatStatus.FINISHED`), puis
`HelloWorldJobConfig` : un `Step` (`StepBuilder(nom, jobRepository).tasklet(tasklet, txManager)`) et un `Job`.

✅ Sortie attendue : `hello world by SpringBatch`, job `COMPLETED`.

🔔 **Même nom partout** (job, bean, journal) — *Évite* : chercher un job sous un autre nom en supervision.

## Étape 3 · Lancer le job et comprendre la JobInstance (scène 5)

`TpSpringBatchApplication` (un `CommandLineRunner`) récupère le job par son nom et appelle `jobLauncher.run(job, params)`.

**À prédire** : on relance le même job avec les mêmes paramètres, après un succès. Réponse : **refus**
(`JobInstanceAlreadyCompleteException`) — une `JobInstance` = job + paramètres identifiants, et un succès la ferme.

🔔 **Paramètre métier plutôt qu'horodatage** 📐 — le TP ajoute `timeStampOfJobInstance` pour relancer à volonté ;
en production, un horodatage crée une nouvelle instance à chaque fois, donc **aucune reprise possible** d'un job échoué.

## Étape 4 · Chunk : CSV → console, puis processor (scène 6)

1. Modèles `BasicProduct` / `Product`, fichier `data/input/csv/products.csv` (`id;main_category;label;price;time_stamp;features`).
2. Reader : `FlatFileItemReaderBuilder` (`linesToSkip(1)`, `delimited().delimiter(";")`, `names(...)`, `targetType(Product.class)`), en `@JobScope` avec `#{jobParameters['inputFilePath']}`.
3. Processor `SimpleUppercaseProductProcessor` (`@StepScope`) : catégorie en majuscules.
4. Writer `SimpleObjectWriter` (affiche chaque produit) ; step `chunk(5, txManager)`.

✅ Sortie réelle : `Product [features=golden] BasicProduct [id=1, main_category=ALIMENT, label=pommes, price=2.2, …]`

🔔 **Taille de chunk mesurée** 📐 — *Évite* : trop de commits (petit) ou saturation mémoire et gros rollback (grand). Ici 5 pour la lisibilité ; en prod, mesurer (souvent 100 à 1000).
🔔 **`@StepScope`/`@JobScope`** pour tout bean qui lit un paramètre — *Évite* : paramètre nul, état partagé entre exécutions ou threads.
🔔 **Processor sans effet de bord caché** — un chunk annulé est rejoué. *Évite* : compteurs/écritures en double.

## Étape 5 · Autres formats : JSON et XML (hors vidéo, cours § II.3)

`fromCsvToJsonJob` (`JsonFileItemWriter` + `JacksonJsonObjectMarshaller`) et `fromCsvToXmlJob`
(`StaxEventItemWriter` + `Jaxb2Marshaller`, `@XmlRootElement` sur `Product`). Les chemins d'entrée/sortie sont
des **paramètres du job** (`inputFilePath`, `outputFilePath`, `enableUpperCase`). Comparer avec
`data/expected_output/` (le helper de test `verifSameContentExceptedResultFile` le fait).

## Étape 6 · Base de données (scène 7)

1. Reader `JdbcCursorItemReader` + `ProductWithDetailsRowMapper` (colonnes `f_*` → sous-objet `ProductFeatures`).
2. Processor `IncreasePriceOfProductWithDetailsProcessor` : +x % sur une catégorie.
3. Writer `JdbcBatchItemWriter` : `UPDATE product_with_details SET price = :price , time_stamp = :time_stamp WHERE id = :id`.

🔔 **Vérifier le contenu, pas seulement `COMPLETED`** — ✅ constaté : `ProductWithDetailsRowMapper` déclare
`LABEL_COLUMN` mais n'appelle jamais `setLabel()` (`grep setLabel` ne trouve que `ProductWithDetailsLineMapper`).
Les tests sont verts. *Évite* : une donnée perdue sans erreur. **Exercice** : corrige le mapper et ajoute une assertion.
🔔 **Écriture idempotente** (UPDATE par id) — *Évite* : doublons à la reprise.

## Étape 7 · Flow conditionnel avec un decider (scène 8)

1. Le processor compte les produits ajustés dans `stepExecution.getExecutionContext()` (`nbAjustedProducts`).
2. `MyUpdatedCountCheckingDecider` retourne `COMPLETED_WITH_MANY_UPDATED` si le compteur ≥ `minManyUpdated`, sinon l'`ExitStatus` du step.
3. Le job : `start(step1).next(decider).on("COMPLETED_WITH_MANY_UPDATED").to(stepWhenMany).from(decider).on("COMPLETED").to(stepWhenFew)`, puis statistiques CSV après `stepWhenMany`.

✅ Console : `>>>>> MANY updated products`.

🔔 **Tester l'absence du compteur** (lu dans le code, **non exécuté**) : si aucun produit n'est ajusté,
`get("nbAjustedProducts")` retourne `null` et `nbAjustedProducts>=minManyUpdated` déboxe un `null` (NPE).
*Évite* : un job qui plante sur le cas le plus banal. **Exercice** : écris le test `productCategoryToIncrease=zzz` pour le confirmer, puis corrige.
🔔 **Un seul nom de job** — ✅ le journal affiche `FlowJob: [name=insertIntoCsvFromDbJob]` pour le bean `increaseProductPriceInDbJob`.

## Étape 8 · Erreurs : skip (scène 9)

```java
.chunk(5, batchTxManager).reader(reader)
.faultTolerant().skipLimit(5).skip(ItemReaderException.class)
.listener(new MySkippedErrorsListener())
.writer(writer)
```

✅ Sortie réelle : deux `SKIPPED_READ_ERROR: Parsing error at line: 3 / 5 … input=[LINE_WITH_ERROR]` et le job termine.

🔔 **Borner le skip, cibler l'exception, tracer** — *Évite* : données perdues en silence.

## Étape 9 · Reprise : restart (scène 9)

Même fichier **sans skip** : échec `FlatFileParseException` ligne 3 (✅ c'est l'unique test en échec).
Pour reprendre : `BatchStatus` du step `FAILED`/`STOPPED` (pas l'`ExitStatus`), `startLimit(3)`,
`MyStoppedForRestartExecutionListener` force `STOPPED` pour la démonstration.

🔔 **`startLimit`** — *Évite* : un batch qui retente sans fin. 3 = 1 lancement + 2 reprises.

## Étape 10 · Partitions (scène 10, facultatif)

`NumericColumnRangePartitioner` (plages d'id) + `managerStep` (`partitioner(...).step(worker).gridSize(4).taskExecutor(...)`) +
reader paginé `@StepScope` lisant `#{stepExecutionContext[from]}` et `[to]`.

🔔 **Reader paginé en `@StepScope`** — un `JdbcCursorItemReader` n'est pas sûr entre threads. *Évite* : lignes lues deux fois ou manquantes.

## Étape 11 · Tests (scène 11)

`AbstractBasicActiveTestJob` lance le job (`JobLauncherTestUtils`), vérifie le nom et l'`exitCode`
`COMPLETED`, puis appelle `postJobCheckings()`. Chaque test concret ne fournit que ses paramètres.

🔔 **Un test prépare ses données** — ✅ constaté : sans scripts SQL préalables, 2 tests échouent. *Évite* : « ça passe chez moi ».
Piste : `spring.sql.init.*` ou `@Sql` sur la base `productdb` de test.

---

## Ce qui reste hors périmètre vérifié

* Spring Batch 6 / Spring Boot 4 (`JobOperator`, fusion de `JobExplorer`) : 🧩 **RECONSTITUTION** (connaissance, non exécutée) : lis la note de version avant de migrer.
* Retry, Spring Cloud Data Flow, monitoring : traités dans le cours, non rejoués ici.
