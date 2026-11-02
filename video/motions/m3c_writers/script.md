# Module 3C : Le catalogue des writers

Vidéo de formation Spring Batch, complément du Module 3 (parcours complet, optionnel). Durée : environ seize minutes (estimation du moteur), en cinq parties (3C.1 à 3C.5). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_3C_WRITERS.md`, dont les classes et signatures ont été lues dans les jars de la six point zéro point six. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Le job a tourné toute la nuit. Le matin, le fichier contient des lignes en double, et une moitié de ligne à la fin. | Fichier : doublons et ligne coupée |
| L002 | pédagogue | Jusqu'ici, on a surtout lu. Au module trois, tu as écrit dans PostgreSQL. Mais écrire dans un fichier, une file ou une API, ce n'est pas la même chose. | Carte : base, fichier, message, API |
| L003 | rappel | Au module trois, tu as vu JdbcBatchItemWriter : un lot JDBC par chunk. Au module trois B, tu as vu la règle des ItemStream pour les readers. | Rappels : Module 3 et Module 3B |
| L004 | explicatif | Un writer ne reçoit pas un élément. Il reçoit tout le chunk, en un seul appel. C'est ce qui permet d'écrire par lots. | Contrat : `write(Chunk)` |
| L005 | annonce | Cinq étapes : le catalogue, les fichiers, la transaction d'un fichier, les destinations multiples, et ton propre writer. | Cinq pastilles 3C.1 à 3C.5 |
| L006 | pont | Commençons par le catalogue, et par ce qui a disparu depuis les anciens tutoriels. | Titre « 3C.1 Le catalogue » |

### Scène 1 : Le catalogue des writers (3C.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L007 | besoin | Mon besoin : choisir le bon writer pour ma destination, et savoir ce qui m'attend quand ça se passe mal. | Carte mentale vide |
| L008 | explicatif | ItemWriter n'a qu'une méthode : write, qui reçoit un Chunk. Si le writer garde une ressource ouverte, il est aussi un ItemStream : open, update, close. | Contrat : `write(Chunk)`, `open`, `update`, `close` |
| L009 | technique | Pour les fichiers : FlatFileItemWriter, délimité ou formaté. JsonFileItemWriter pour le JSON, StaxEventItemWriter pour le XML. | Branche « fichiers » |
| L010 | technique | Pour une base : JdbcBatchItemWriter pour du SQL écrit à la main, JpaItemWriter pour un ORM, RepositoryItemWriter pour Spring Data. | Branche « base » |
| L011 | technique | Pour les messages : JmsItemWriter, AmqpItemWriter, KafkaItemWriter. Et aussi Mongo, Redis, Avro, ou même un courriel. | Branche « messages et autres » |
| L012 | technique | Pour combiner : CompositeItemWriter envoie à tous. ClassifierCompositeItemWriter choisit selon l'élément. MultiResourceItemWriter découpe en plusieurs fichiers. | Branche « composition » |
| L013 | technique | Pour un bean existant : ItemWriterAdapter. Pour un test : ListItemWriter. Pour plusieurs threads : SynchronizedItemStreamWriter. | Branche « adaptateurs, tests, threads » |
| L014 | appuyé | Attention, ce catalogue a changé depuis les anciens tutoriels. Le writer Hibernate natif a disparu. | Hibernate en gris |
| L015 | explicatif | Il n'existe plus de HibernateItemWriter en version six. Pour un ORM, tu passes par JpaItemWriter. | `HibernateItemWriter` barré |
| L016 | explicatif | Autre changement : write reçoit un Chunk, plus une liste. Et les paquets sont sous infrastructure point item. | Anciennes signatures barrées |
| L017 | explicatif | Bonne nouvelle : le builder du writer de fichier sait maintenant écrire un record, avec sourceType. Plus besoin de getters. | `sourceType(BankTransaction.class)` en vert |
| L018 | défi, direct | Question. Un tutoriel te demande HibernateItemWriter. Que fais-tu en Spring Batch six ? | Question « PRÉDIRE » |
| L019 | posé | Tu utilises JpaItemWriter, ou JdbcBatchItemWriter si tu préfères le SQL. Aucun writer Hibernate natif n'existe en six point zéro point six. | Choix « JPA » en vert |
| L020 | explicatif | JpaItemWriter fait un merge par défaut. Avec usePersist à vrai, il fait un persist. Et il peut vider le contexte de persistance. | Code : `setUsePersist(true)` |
| L021 | attention | Rappelle-toi le module trois B : un ORM complet en batch charge des objets que tu n'utilises pas. Le SQL direct reste souvent plus sûr. | Rappel Module 3B |
| L022 | pont | Passons à la pratique, avec le cas le plus fréquent : écrire un fichier. | Titre « 3C.2 Écrire un fichier » |

### Scène 2 : Écrire un fichier : CSV, positions fixes, JSON (3C.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L023 | besoin | Mon besoin : un relevé des transactions, en CSV, pour la comptabilité. | Fichier `releve.csv` |
| L024 | technique | Le writer vient du builder. La destination est une WritableResource, et non une simple Resource : ce type garantit que le fichier est ouvert en écriture, et pas en simple lecture. | Code : `FlatFileItemWriterBuilder<BankTransaction>().resource(out)` |
| L025 | appuyé | Donne-lui un nom. Sans nom, l'état ne peut pas être sauvegardé, et il n'y aura pas de reprise. | Code : `.name("statementWriter")` |
| L026 | technique | Delimited, avec un point-virgule : la virgule sert de séparateur décimal en France. | Code : `.delimited().delimiter(";")` |
| L027 | technique | Puis sourceType avec le record, et les noms des composants : id, accountNumber, transactionDate, transactionType, amount. | Code : `.sourceType(BankTransaction.class).names(...)` |
| L028 | défi, direct | Question. Un collègue écrit names sur un record, mais oublie sourceType. Que se passe-t-il ? | Question « PRÉDIRE » |
| L029 | posé | Ça échoue : le builder cherche des getters comme getId, que les records n'ont pas. Avec sourceType, il utilise les noms des composants. | Choix « échec » en vert |
| L030 | technique | L'en-tête s'écrit avec un headerCallback : une lambda qui reçoit un Writer. | Code : `.headerCallback(w -> w.write("id;compte;date;type;montant"))` |
| L031 | technique | Le pied de page, avec footerCallback. Typiquement un total de contrôle, ou le nombre de lignes. | Code : `.footerCallback(...)` |
| L032 | explicatif | Et shouldDeleteIfExists, vrai par défaut : un fichier existant est écrasé au premier lancement. À faux, il fait échouer le step. | Code : `.shouldDeleteIfExists(true)` |
| L033 | explicatif | Les montants BigDecimal sont écrits avec toString : mille deux cent trente-quatre point cinquante. Pour un autre format, il faut un FieldExtractor. | Montant : `1234.50` |
| L034 | besoin | Autre besoin : un fichier en positions fixes pour un système historique. | Colonnes de largeur fixe |
| L035 | technique | Tu passes par formatted, avec un gabarit. Un gabarit, c'est un formulaire à cases : chaque morceau décrit une colonne. | Code : `.formatted().format("%-12s%-8s%12.2f")` |
| L036 | pédagogue | Lis le premier morceau. Le s dit « du texte ». Le moins dit « aligne à gauche ». Le douze dit « prends douze caractères de large ». | `s` texte · `-` à gauche · `12` de large |
| L037 | pédagogue | Et le dernier : f dit « un nombre décimal », point deux dit « deux décimales ». Un nombre est aligné à droite par défaut. | `.2f` : deux décimales |
| L038 | appuyé | Piège : une valeur plus longue que sa colonne déborde, et décale toute la ligne. Le fichier est faux, sans erreur. | Colonnes décalées en rouge |
| L039 | technique | Parade : maximumLength et minimumLength. Le writer échoue avec le message « String overflowed in formatter ». | Code : `.maximumLength(32)` |
| L040 | besoin | Dernier besoin : du JSON, pour une application web. | Tableau JSON |
| L041 | technique | JsonFileItemWriter, avec un marshaller. En Spring Batch six, JacksonJsonObjectMarshaller repose sur Jackson trois. | Code : `new JacksonJsonObjectMarshaller<>()` |
| L042 | explicatif | Le fichier produit est un tableau JSON : un crochet ouvrant, les objets séparés par des virgules, un crochet fermant. | Sortie : `[ {...}, {...} ]` |
| L043 | explicatif | Pour des dates ou des formats spéciaux, tu passes ton propre JsonMapper au constructeur du marshaller. | Code : `new JacksonJsonObjectMarshaller<>(mapper)` |
| L044 | pont | Reste une question importante : que devient ce fichier quand le chunk échoue ? | Titre « 3C.3 La transaction d'un fichier » |

### Scène 3 : Pourquoi un fichier est transactionnel (3C.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L045 | besoin | Mon besoin : un fichier qui reste cohérent avec la base, même quand un chunk échoue. | Fichier et base côte à côte |
| L046 | explicatif | Le writer de fichier n'écrit pas directement sur le disque dur. Il écrit d'abord dans un brouillon : un tampon en mémoire. | Brouillon : tampon en mémoire |
| L047 | explicatif | Si le chunk est validé, le commit, il recopie le brouillon au propre sur le disque. Si le chunk échoue, le rollback, il jette le brouillon. | Commit : recopié au propre. Rollback : jeté |
| L048 | appuyé | C'est ce qui garantit qu'il n'y a jamais de ligne à moitié écrite : le fichier suit la même frontière que la base. | Aucune ligne à moitié écrite |
| L049 | explicatif | À chaque chunk, le writer sauvegarde deux valeurs dans l'ExecutionContext : le nombre d'éléments écrits, et la position en octets. | Clés : `current.count` et `written` |
| L050 | explicatif | La clé written contient la position validée dans le fichier. C'est elle qui sert au restart. | `statementWriter.written = 412 905` |
| L051 | défi, direct | Question. Un export de dix mille lignes échoue à la ligne six mille trois cents, après un commit à six mille. Que contient le fichier ? | Question « PRÉDIRE » |
| L052 | posé | Six mille lignes. Les trois cents suivantes étaient dans le tampon, et le rollback les a jetées. Aucune ligne coupée. | Choix « 6 000 lignes » en vert |
| L053 | explicatif | Au restart, le writer rouvre le fichier, le tronque à la position written, et reprend à la ligne six mille un. | Troncature à `written` |
| L054 | appuyé | Et l'en-tête n'est pas réécrit à la reprise. Pas de doublon, pas de ligne tronquée. | En-tête : une seule fois |
| L055 | technique | Deux réglages à connaître. transactional à faux écrit tout de suite : plus rapide, mais un rollback laisse des lignes. | Code : `.transactional(false)` en orange |
| L056 | technique | Et forceSync à vrai force l'écriture physique sur le disque à chaque chunk : plus sûr en cas de coupure de courant, nettement plus lent. | Code : `.forceSync(true)` |
| L057 | règle | Garde la valeur par défaut en production. Un fichier de travail jetable peut se passer de la transaction, pas un fichier livré. | Phrase encadrée |
| L058 | besoin | Même logique côté base : savoir si une écriture a vraiment eu lieu. | Retour sur JdbcBatchItemWriter |
| L059 | explicatif | JdbcBatchItemWriter a un réglage, assertUpdates, vrai par défaut. Si une requête du lot ne modifie aucune ligne, le chunk échoue. | Code : `.assertUpdates(true)` |
| L060 | appuyé | Pour un UPDATE, c'est précieux : une ligne introuvable est une erreur de données, pas un succès silencieux. | UPDATE : zéro ligne égale erreur |
| L061 | appuyé | Pour un INSERT avec ON CONFLICT DO NOTHING, c'est l'inverse : zéro ligne est normal. Il faut alors assertUpdates à faux. | `ON CONFLICT DO NOTHING` : `assertUpdates(false)` |
| L062 | pont | Maintenant, plusieurs destinations pour les mêmes données. | Titre « 3C.4 Plusieurs destinations » |

### Scène 4 : Composite, routage et découpage (3C.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L063 | besoin | Mon besoin : écrire en base et garder une trace dans un fichier d'audit, en une seule passe. | Base et audit |
| L064 | technique | CompositeItemWriter, c'est un photocopieur. Il prend le chunk entier et le duplique vers toutes les destinations, l'une après l'autre. | Photocopieur : le chunk copié partout. Code : `.delegates(bankDbWriter, auditWriter)` |
| L065 | explicatif | C'est un ItemStreamWriter : il ouvre et ferme lui-même ses délégués. Tu n'as rien à déclarer sur le step. | Ouverture automatique des délégués |
| L066 | appuyé | Si le deuxième writer échoue, tout est annulé : la base revient en arrière, et le tampon du fichier est jeté. Les deux restent cohérents. | Rollback des deux |
| L067 | besoin | Autre besoin : les débits dans un fichier, les crédits dans un autre. | Deux fichiers |
| L068 | technique | ClassifierCompositeItemWriter, c'est un facteur. Il regarde chaque lettre, une par une, et la dépose dans la boîte aux lettres qui correspond à sa règle. | Facteur : une lettre à la fois |
| L069 | explicatif | La règle est une lambda : elle reçoit l'élément, et retourne le writer. Les éléments d'un même chunk peuvent donc partir vers des destinations différentes. | Code : `.classifier(tx -> ... ? debitWriter : creditWriter)` |
| L070 | défi, direct | Question. Ton job échoue au premier write, avec le message « Writer must be open before it can be written to ». Que manque-t-il ? | Question « PRÉDIRE » |
| L071 | posé | Les deux writers de fichier n'ont jamais été ouverts. ClassifierCompositeItemWriter n'est pas un ItemStream : il faut les enregistrer avec stream. | Code : `.stream(debitWriter).stream(creditWriter)` |
| L072 | règle | La règle : un writer de composition qui n'est pas un ItemStream n'ouvre pas ses délégués. Enregistre-les toi-même. | Tableau : composite oui, classifier non |
| L073 | besoin | Dernier besoin : un export de deux millions de lignes, trop gros pour un seul fichier. | Fichier énorme |
| L074 | technique | MultiResourceItemWriter entoure un writer de fichier, et coupe tous les n éléments, avec itemCountLimitPerResource. | Code : `.itemCountLimitPerResource(500_000)` |
| L075 | technique | Tu lui donnes la base du nom. Les fichiers s'appellent releve point un, releve point deux, et ainsi de suite. | Fichiers `releve.1`, `releve.2` |
| L076 | appuyé | Le délégué ne doit pas avoir de ressource fixe : elle est remplacée à chaque nouveau fichier. | Ressource fixe : interdit |
| L077 | appuyé | La coupure a lieu à la fin d'un chunk. Avec un chunk de trois cents et une limite de cinq cent mille, le premier fichier compte cinq cent mille cent lignes. | 1 667 chunks = 500 100 lignes |
| L078 | règle | Choisis une limite multiple du chunk. Et rappelle-toi que l'en-tête et le pied de page sont écrits dans chaque fichier. | Limite : multiple du chunk |
| L079 | explicatif | Dernier cas : plusieurs threads. JdbcBatchItemWriter est prévu pour. FlatFileItemWriter ne l'est pas : un seul fichier, un seul tampon. | Module 7 : writer partagé |
| L080 | technique | Tu l'enveloppes dans un SynchronizedItemStreamWriter, qui sérialise write. L'ordre des lignes n'est plus garanti. | Code : `new SynchronizedItemStreamWriter<>(fileWriter)` |
| L081 | appuyé | Avec plusieurs threads, la position written n'a plus de sens. Mets saveState à faux, et renonce à la reprise au chunk près. | `saveState(false)` |
| L082 | pont | Et quand aucune destination n'existe ? On écrit son propre writer. | Titre « 3C.5 Son propre writer » |

### Scène 5 : Son propre writer et les destinations hors transaction (3C.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L083 | besoin | Mon besoin : envoyer le chunk à un service, sans writer prêt à l'emploi. | Service externe |
| L084 | technique | Tu implémentes ItemWriter, avec une seule méthode : write, qui reçoit un Chunk. | Code : `class AccountApiWriter implements ItemWriter<AccountLine>` |
| L085 | technique | Dans write, tu envoies tous les éléments d'un coup, avec chunk point getItems. Un appel pour cent éléments. | Code : `client.registerAll(chunk.getItems())` |
| L086 | explicatif | Si ton writer garde une ressource ouverte, étends AbstractItemStreamItemWriter : tu obtiens open, update, close, et le nom pour les clés d'état. | `AbstractItemStreamItemWriter` |
| L087 | explicatif | ItemWriterAdapter est la version sans code : il appelle une méthode d'un bean existant, mais une fois par élément. | Code : `setTargetMethod("register")` |
| L088 | explicatif | PropertyExtractingDelegatingItemWriter fait pareil, mais il passe des propriétés de l'élément comme arguments de la méthode. | `setFieldsUsedAsTargetMethodArguments` |
| L089 | attention | Pratique pour un prototype. Pour la production, préfère ton writer : un appel par chunk coûte bien moins cher qu'un appel par élément. | 1 appel contre 100 |
| L090 | appuyé | Mais attention à une différence : la base et le fichier transactionnel suivent le chunk. Une file de messages, une API, un courriel, non. | Base et fichier : oui. API et file : non |
| L091 | appuyé | Un message déjà envoyé ne revient pas après un rollback. Et le chunk rejoué le renvoie. | Message envoyé, rollback, renvoi |
| L092 | explicatif | Deux parades : un destinataire idempotent, avec une clé de déduplication stable, ou le motif outbox : écrire en base, envoyer ensuite. | Idempotence et outbox |
| L093 | rappel | Le détail est dans l'annexe REST, au sujet de l'écriture vers une API. | Rappel : Annexe REST |
| L094 | pédagogue | Récapitulons les pièges. Un : names sur un record, sans sourceType. Deux : un writer de fichier sans nom. | Pièges 1 et 2 |
| L095 | pédagogue | Trois : un ClassifierCompositeItemWriter sans stream. Quatre : assertUpdates vrai avec ON CONFLICT DO NOTHING. | Pièges 3 et 4 |
| L096 | pédagogue | Cinq : une largeur fixe dépassée. Six : transactional à faux en production. | Pièges 5 et 6 |
| L097 | pédagogue | Sept : un FlatFileItemWriter partagé entre threads. Huit : écrire vers une API comme vers une base. | Pièges 7 et 8 |
| L098 | rappel | Les exercices du module écrit reprennent ces cas : le record, le restart, le routage, assertUpdates et le découpage. | Exercices 1 à 5 |
| L099 | transition | Tu sais maintenant lire et écrire vers presque n'importe quelle source. Au module quatre, tu transformes les données entre les deux. | Ouverture sur le Module 4 |
