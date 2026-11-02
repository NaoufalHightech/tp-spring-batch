# Module 3B : Le catalogue des readers

Vidéo de formation Spring Batch, complément du Module 3 (parcours complet, optionnel). Durée visée : 40 minutes, en cinq parties (3B.1 à 3B.5). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_3B_READERS.md`. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Un export bancaire, un seul fichier, et dedans, des lignes de compte mélangées à des lignes d'opération. Ton reader de fichier plat, lui, attend un seul format. | Fichier mêlant lignes ACC et OP, point d'interrogation |
| L002 | pédagogue | Au module trois, tu as lu un fichier CSV tout simple. Ici, on passe au catalogue complet : les sources que tu rencontreras vraiment. | Carte des sources : fichier, base, service |
| L003 | rappel | Un rappel du module trois. Un reader qui garde une ressource est un ItemStream : open, update, close. Sa position est sauvegardée à chaque chunk. | Cycle open, update, close |
| L004 | annonce | Cinq étapes : le catalogue, les fichiers à plusieurs formats, la rupture de contrôle, la lecture par pages, et enfin les readers personnalisés. | Cinq pastilles 3B.1 à 3B.5 |

### Scène 1 : Le catalogue des readers (3B.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L005 | besoin | Mon besoin : choisir le bon reader pour ma source. Il y en a beaucoup, alors mettons de l'ordre. | Carte mentale vide |
| L006 | explicatif | Un ItemReader n'a qu'une méthode, read. Elle retourne un élément à chaque appel, et null quand il n'y en a plus. | Contrat : `read()` → élément ou null |
| L007 | explicatif | Spring Batch fournit des implémentations pour la plupart des sources. On n'écrit son propre reader que pour une source inhabituelle. | Source inhabituelle en orange |
| L008 | technique | Pour les fichiers : FlatFileItemReader, délimité ou en positions fixes. Pour plusieurs formats de ligne, un mapper composite. | Branche « fichier » : FlatFile |
| L009 | technique | Pour plusieurs fichiers de même format : MultiResourceItemReader. Pour le XML : StaxEventItemReader. Pour le JSON : JsonItemReader. | Branche « fichiers » : MultiResource, Stax, Json |
| L010 | technique | Pour une base : JdbcCursorItemReader, ou JdbcPagingItemReader. Pour JPA : JpaPagingItemReader et JpaCursorItemReader. | Branche « base » |
| L011 | technique | Pour une procédure stockée : StoredProcedureItemReader. Pour MongoDB : MongoPagingItemReader et MongoCursorItemReader. | Branche « procédure et Mongo » |
| L012 | technique | Pour un magasin Spring Data : RepositoryItemReader. Pour un service Java existant : ItemReaderAdapter. | Branche « Spring Data et service » |
| L013 | appuyé | Attention, ce catalogue a changé depuis les anciens tutoriels. Les readers Hibernate natifs ont disparu. | Hibernate en gris |
| L014 | explicatif | Il n'existe plus aucun reader Hibernate natif en version six. Pour un mapping objet-relationnel, on passe par JPA. | `HibernateCursorItemReader` barré |
| L015 | explicatif | Autre changement : JpaCursorItemReader existe maintenant, à côté du paginé. Et MongoItemReader est remplacé par deux readers. | Nouveaux readers en vert |
| L016 | appuyé | Les paquets ont bougé aussi. Tout est dans infrastructure point item. Et les fabriques, JobBuilderFactory et StepBuilderFactory, ont disparu. | Imports anciens barrés |
| L017 | défi, direct | Question. Un tutoriel te demande HibernateCursorItemReader. Que fais-tu en Spring Batch six ? | Question « PRÉDIRE » |
| L018 | posé | Tu utilises JPA : JpaCursorItemReader ou JpaPagingItemReader. Aucun reader Hibernate natif n'existe en six point zéro point six. | Choix « JPA » en vert |
| L019 | pont | Commençons par le cas le plus fréquent dans les systèmes anciens : un fichier qui mélange plusieurs formats. | Titre « 3B.2 Plusieurs formats » |

### Scène 2 : Fichiers à plusieurs formats (3B.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L020 | besoin | Mon besoin : lire un export où comptes et opérations sont mêlés, repérés par un préfixe. | Fichier avec ACC et OP |
| L021 | technique | Une ligne ACC porte un compte : numéro, nom, prénom. Une ligne OP porte une opération : date, type, montant. | Deux formats en deux couleurs |
| L022 | explicatif | Première idée : un seul tokenizer qui devine le format. Ça marche pour deux formats. | Tokenizer unique avec if |
| L023 | explicatif | Mais avec trois ou quatre formats, il devient illisible, et il mélange deux responsabilités : reconnaître la ligne, puis la découper. | Tokenizer qui enfle, en rouge |
| L024 | explicatif | La bonne idée : un tokenizer par format. Chacun ne connaît que son format. | Deux tokenizers côte à côte |
| L025 | technique | Le tokenizer des comptes : les colonnes prefix, accountNumber, lastName, firstName. | Code : `accTokenizer.setNames("prefix", "accountNumber", …)` |
| L026 | technique | Le tokenizer des opérations : prefix, date, type, amount. Le préfixe est une colonne comme une autre. | Code : `opTokenizer.setNames("prefix", "date", "type", "amount")` |
| L027 | appuyé | Puis le mapper composite, PatternMatchingCompositeLineMapper. Pour chaque ligne, il choisit le tokenizer et le mapper selon son début. | Code : `new PatternMatchingCompositeLineMapper<Object>()` |
| L028 | technique | Le motif ACC étoile signifie : commence par ACC. Un motif absent pour une ligne provoque une erreur. | `Map.of("ACC*", …, "OP*", …)` |
| L029 | technique | Un FieldSetMapper par format : il transforme les champs en objet typé. readBigDecimal convertit directement le montant. | Code : `fs.readBigDecimal("amount")` |
| L030 | technique | Le builder du reader : un nom unique, comme toujours, et lineMapper à la place de la paire tokenizer et mapper simple. | Code : `.name("rawLineReader").lineMapper(mapper)` |
| L031 | explicatif | Deux records portent les résultats : AccountLine pour un compte, OperationLine pour une opération. | Deux records |
| L032 | défi, direct | Question. Le fichier contient une ligne qui commence par XYZ. Que se passe-t-il ? | Question « PRÉDIRE » |
| L033 | posé | Une erreur : aucun motif ne correspond. Il faut prévoir un motif par format, et un motif de rejet explicite. | Erreur en rouge, motif `*` de rejet |
| L034 | pont | Mais on veut mieux qu'un flux mêlé de lignes. On veut un compte qui contient ses opérations. | Titre « 3B.3 Rupture de contrôle » |

### Scène 3 : La rupture de contrôle (3B.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L035 | besoin | Mon besoin : un objet Account qui contient sa liste d'opérations. | Account avec liste |
| L036 | explicatif | Voici le défi : on ne sait qu'un compte est complet qu'en lisant la ligne suivante. | Flux ACC, OP, OP, ACC |
| L037 | explicatif | La solution : un reader qui regarde en avance. On appelle ça peek. | Flèche « peek » sur la ligne suivante |
| L038 | technique | Je crée un reader qui implémente ItemStreamReader, et non ItemReader. Il doit propager le cycle de vie à celui qu'il enveloppe. | Code : `implements ItemStreamReader<Account>` |
| L039 | technique | Il enveloppe un SingleItemPeekableItemReader, qui fournit peek : regarder la ligne suivante sans la consommer. | Code : `SingleItemPeekableItemReader<Object>` |
| L040 | technique | Le reader de fichier est le délégué. | `source.setDelegate(delegate)` |
| L041 | technique | Dans read : je lis une ligne. Si c'est un compte, je l'appelle head, avec du pattern matching. Sinon, c'est la fin des données. | `if (!(source.read() instanceof AccountLine head)) return null;` |
| L042 | technique | Puis, tant que la ligne suivante est une opération, elle appartient à ce compte. Je la consomme, et je l'ajoute. | `while (source.peek() instanceof OperationLine) …` |
| L043 | appuyé | Et je retourne le compte, avec zéro, une ou plusieurs opérations. C'est un seul élément : c'est ce que compte le chunk. | `return new Account(…, operations);` |
| L044 | règle | Un chunk de cent contient cent comptes, pas cent lignes. | Chunk de 100 comptes |
| L045 | explicatif | On appelle cette technique la rupture de contrôle : on détecte la fin d'un groupe quand le suivant commence. | Groupes qui se ferment |
| L046 | appuyé | Et le point crucial : open, update et close sont transmis au délégué. Sans cela, le fichier ne serait jamais ouvert, ni fermé. | Code : `source.open(ctx)`, `source.update(ctx)`, `source.close()` |
| L047 | appuyé | Oublier update ne casse pas le premier lancement. Mais aucune position n'est sauvegardée : la reprise rejoue tout. | Position jamais sauvegardée, en rouge |
| L048 | défi, direct | Question. Avec le fichier d'exemple, combien d'Account le reader retourne-t-il ? | Question « PRÉDIRE » |
| L049 | posé | Trois. Alice avec deux opérations, Martin sans opération, Bernard avec une. Un compte sans opération reste un compte, avec une liste vide. | Trois comptes : 2, 0, 1 opérations |
| L050 | défi, direct | Question. Avec un chunk de cent, combien de lignes du fichier traite-t-on dans une transaction ? | Question « PRÉDIRE » |
| L051 | posé | Plus de cent, puisque chaque compte contient ses opérations. Cent comptes, c'est cent lignes de compte, plus toutes leurs lignes d'opération. | Cent comptes, plus de cent lignes |
| L052 | explicatif | Il existe aussi un réglage, saveState à false, pour les readers partagés entre threads. On y reviendra avec le multithread. | `saveState(false)` : restart du début |
| L053 | pont | Passons à une autre source : la base de données, lue par pages. | Titre « 3B.4 Lire par pages » |

### Scène 4 : Lire PostgreSQL par pages (3B.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L054 | besoin | Mon besoin : lire les transactions d'un compte, par pages de cinq cents, avec une mémoire constante. | Table, pages de 500 |
| L055 | explicatif | Un curseur garde un résultat ouvert : une seule requête, une connexion occupée pendant tout le step, et pas de partage entre threads. | Curseur : une connexion tenue |
| L056 | explicatif | La pagination émet une requête par page. La connexion est libérée entre deux pages, et le reader est utilisable en multithread. | Pagination : une requête par page |
| L057 | appuyé | Le prix : un tri obligatoire. | Tri obligatoire en orange |
| L058 | technique | Le reader : JdbcPagingItemReaderBuilder, avec un nom obligatoire. La page courante est sauvegardée sous ce préfixe. | Code : `.name("pagedReader")` |
| L059 | technique | La source de données PostgreSQL, puis un fournisseur de requête, qui écrit la requête paginée propre à la base. | `.dataSource(dataSource).queryProvider(queryProvider)` |
| L060 | technique | Les paramètres nommés, sous forme de table, et pageSize à cinq cents. | `.parameterValues(Map.of("account", accountNumber)).pageSize(500)` |
| L061 | appuyé | Le RowMapper : chaque colonne doit être lue. Un champ oublié reste à zéro, et le test peut rester vert. | `.rowMapper((rs, i) -> new BankTransaction(…))` |
| L062 | technique | Le fournisseur de requête : une fabrique qui détecte PostgreSQL à partir de la DataSource, et choisit la bonne variante. | Code : `SqlPagingQueryProviderFactoryBean` |
| L063 | technique | Les clauses sont fournies par morceaux : select, from, where. Le reader assemble une requête par page. | `setSelectClause`, `setFromClause`, `setWhereClause` |
| L064 | appuyé | Et la clé de tri : id. Elle sert à repérer la page suivante. | `setSortKey("id")` surligné |
| L065 | règle | Une clé non unique, ou modifiée pendant la lecture, fait sauter ou répéter des lignes. | Phrase encadrée |
| L066 | défi, direct | Question. Un collègue trie les pages sur transaction date. Plusieurs transactions partagent la même date. Que risque-t-il ? | Question « PRÉDIRE » |
| L067 | posé | Des lignes sautées ou lues deux fois, sans erreur. Il faut trier sur une clé unique, comme l'identifiant, ou ajouter l'identifiant au tri. | Deux lignes à égalité, ordre qui change |
| L068 | explicatif | Un mot sur le curseur, côté PostgreSQL : le pilote charge tout en mémoire, sauf si l'auto-commit est désactivé et le fetchSize fixé. | Rappel du module 3 |
| L069 | explicatif | Un dernier point sur les ORM. Une session JPA mémorise chaque entité lue. Sur un million de lignes, la mémoire grossit jusqu'à l'erreur. | Cache de premier niveau qui gonfle |
| L070 | appuyé | Quand le mapping existe déjà, c'est un bon raccourci. Quand la performance prime, préfère JDBC. | Deux options |
| L071 | pont | Il reste les sources sans reader prêt à l'emploi. | Titre « 3B.5 Readers personnalisés » |

### Scène 5 : Reader personnalisé, entrées vides, erreurs (3B.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L072 | besoin | Mon besoin : lire une liste de comptes fournie par un service interne, avec une reprise automatique. | Service → reader → job |
| L073 | explicatif | Première idée : écrire open et update moi-même, avec mes propres clés. C'est possible, mais fragile. | open/update à la main, en orange |
| L074 | explicatif | La bonne idée : étendre AbstractItemCountingItemStreamItemReader. La classe de base compte les éléments lus, et gère la reprise. | Code : `extends AbstractItemCountingItemStreamItemReader<AccountLine>` |
| L075 | technique | Le client du service est injecté. Et le nom est obligatoire : c'est le préfixe des clés sauvegardées. | `setName("externalAccountsReader")` |
| L076 | technique | doOpen ouvre la source. Ici, il charge un itérateur. | `doOpen() { iterator = client.fetchAll().iterator(); }` |
| L077 | technique | doRead lit un élément, ou retourne null. | `doRead() { return iterator.hasNext() ? iterator.next() : null; }` |
| L078 | technique | doClose libère la source. | `doClose() { iterator = null; }` |
| L079 | explicatif | Au redémarrage, la classe de base saute les éléments déjà lus, grâce au compteur. Tu n'écris rien pour la reprise. | Compteur, saut des éléments lus |
| L080 | appuyé | Attention : fetchAll charge tout en mémoire. Acceptable pour mille comptes, pas pour dix millions. | Mille comptes vert, dix millions rouge |
| L081 | défi, direct | Question. Une méthode d'ItemReaderAdapter ne retourne jamais null. Que se passe-t-il ? | Question « PRÉDIRE » |
| L082 | posé | Une boucle infinie : le step ne se termine jamais. La méthode doit retourner null à la fin. | Boucle infinie |
| L083 | explicatif | Autre cas : une méthode d'adaptateur qui retourne une liste. La liste entière devient un seul élément. | Liste = un élément |
| L084 | explicatif | Deuxième sujet : un fichier vide. Par défaut, le step se termine normalement, sans rien lire. | Fichier vide, step vert |
| L085 | appuyé | Si c'est anormal, un lot réussi sans donnée passe inaperçu. Un listener de step peut le faire échouer. | Lot vert sans donnée, en orange |
| L086 | technique | Dans afterStep : si le nombre d'éléments lus est supérieur à zéro, on garde le code de sortie. Sinon, FAILED. | Code : `getReadCount() > 0 ? … : ExitStatus.FAILED` |
| L087 | explicatif | Le job pourra alors être aiguillé vers une alerte, comme on le verra au module cinq. | Alerte |
| L088 | explicatif | Troisième sujet : ignorer des erreurs de lecture. Un aperçu, le détail est au module six. | Aperçu skip |
| L089 | technique | faultTolerant, skip sur FlatFileParseException, et skipLimit à dix : au plus dix lignes mal formées sont ignorées. | Code : `.faultTolerant().skip(FlatFileParseException.class).skipLimit(10)` |
| L090 | explicatif | Au-delà de dix, le step échoue : à ce stade, c'est le fichier qui est mauvais. | Onzième ligne : échec |
| L091 | appuyé | Mais ignorer sans consigner est inacceptable pour de l'argent. Des lignes disparaissent sans trace. | Lignes qui disparaissent |
| L092 | règle | Il faut un listener de rejets, avec le numéro de ligne et le texte brut. | Phrase encadrée |
| L093 | explicatif | Un cas de plus : plusieurs fichiers avec MultiResourceItemReader. Il parcourt une liste de fichiers avec un seul reader délégué. | Liste de fichiers |
| L094 | appuyé | Au restart, la liste est recalculée. Un fichier déposé entre le premier lancement et la reprise sera traité, alors qu'il n'existait pas au départ. | Liste : fichier 4 ajouté en rouge |
| L095 | règle | La parade : un répertoire par exécution. Les nouveaux fichiers vont dans le répertoire suivant. | Répertoire par exécution, en vert |
| L096 | défi, direct | Question. Un job échoue au deuxième fichier. Un troisième arrive avant la reprise. Que traite la reprise ? | Question « PRÉDIRE » |
| L097 | posé | Elle traite le troisième fichier aussi, puisque la liste est recalculée. Un répertoire par exécution évite ce problème. | Fichier 3 traité, répertoire dédié |
| L098 | pont | Voyons les dix pièges de ce module. | Titre « Top 10 » |

### Scène 6 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L099 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L100 | appuyé | Un : un reader d'enveloppe qui oublie open, update ou close. Le fichier n'est jamais fermé, aucune position n'est sauvegardée. | Ligne 1 |
| L101 | pédagogue | Comment le repérer : un restart qui repart du début, alors que le reader est enveloppé. | Extrait indicatif : `batch_step_execution_context` vide après le premier chunk |
| L102 | appuyé | Deux : un motif absent dans le mapper composite. Erreur sur une ligne de type inconnu. | Ligne 2 |
| L103 | pédagogue | Comment le repérer : un échec sur une ligne dont le préfixe n'est pas prévu. | Extrait indicatif : `IllegalStateException: Could not map … "XYZ,…"` |
| L104 | appuyé | Trois : FixedLengthTokenizer en mode strict. Une ligne plus longue ou plus courte que les colonnes fait échouer le step. | Ligne 3 |
| L105 | pédagogue | Comment le repérer : une erreur de nombre de champs, dès la première ligne du fichier réel. | Extrait indicatif : `IncorrectLineLengthException: Line is longer than max` |
| L106 | appuyé | Quatre : les espaces conservés dans les champs en positions fixes. Durand avec ses espaces n'est pas Durand. | Ligne 4 |
| L107 | pédagogue | Comment le repérer : des jointures qui ne trouvent rien, alors que les valeurs semblent identiques. | Extrait indicatif : `"Durand    " ≠ "Durand"` |
| L108 | appuyé | Cinq : un tri de pagination non unique. Lignes sautées ou lues deux fois, sans erreur. | Ligne 5 |
| L109 | pédagogue | Comment le repérer : un total qui diffère de la source, sans aucune exception. | Extrait indicatif : source `1000000`, destination `999 987` |

### Scène 7 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L110 | pont | Les cinq suivants touchent les fichiers multiples, les adaptateurs et les erreurs ignorées. | Tableau, lignes 6 à 10 |
| L111 | appuyé | Six : MultiResourceItemReader avec restart. Un fichier ajouté entre-temps est traité. | Ligne 6 |
| L112 | pédagogue | Comment le repérer : plus de fichiers traités à la reprise qu'au premier lancement. | Extrait indicatif : `Resource list: [f1, f2]` puis `[f1, f2, f3]` |
| L113 | appuyé | Sept : un ItemReaderAdapter dont la méthode ne retourne jamais null. Boucle infinie. | Ligne 7 |
| L114 | pédagogue | Comment le repérer : un step qui ne se termine jamais, avec un compteur de lecture qui grimpe. | Extrait indicatif : `read_count = 48213   status = STARTED` |
| L115 | appuyé | Huit : une méthode d'adaptateur qui retourne une liste. La liste entière devient un seul élément. | Ligne 8 |
| L116 | pédagogue | Comment le repérer : un compteur de lecture à un, alors que la liste contenait mille éléments. | Extrait indicatif : `read_count = 1` |
| L117 | appuyé | Neuf : un fichier vide traité comme un succès. Un lot réussi sans donnée passe inaperçu. | Ligne 9 |
| L118 | pédagogue | Comment le repérer : un statut COMPLETED, et un nombre de lignes lues à zéro. | Extrait indicatif : `status = COMPLETED   read_count = 0` |
| L119 | appuyé | Dix : ignorer des erreurs sans les consigner. Des lignes disparaissent sans trace, inacceptable pour de l'argent. | Ligne 10 |
| L120 | pédagogue | Comment le repérer : un skip count supérieur à zéro, et aucune ligne dans un journal des rejets. | Extrait indicatif : `skip_count = 7`, journal des rejets vide |
| L121 | pédagogue | Pourquoi on y tombe : parce que chaque piège ressemble à un détail, jusqu'au premier incident en production. | Détail, puis incident |

### Scène 8 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L122 | pédagogue | Reprenons notre export bancaire aux formats mêlés. Tu sais maintenant le lire, le regrouper, et le reprendre. | Fichier ACC et OP |
| L123 | récapitulatif | Un tokenizer par format, et un mapper composite. Un reader d'enveloppe qui propage open, update et close. | Deux pastilles |
| L124 | récapitulatif | Une pagination triée sur une clé unique. Un reader personnalisé qui compte, et un répertoire par exécution. | Deux pastilles |
| L125 | défi | Quatre exercices pour finir. Un : avec le fichier d'exemple, combien d'Account, avec combien d'opérations chacun ? | Exercice 1 |
| L126 | défi | Deux : avec un chunk de cent, combien de lignes dans une transaction ? Pourquoi pas cent ? | Exercice 2 |
| L127 | défi | Trois : un collègue trie les pages sur la date. Plusieurs transactions partagent la même date. Que risque-t-il, et comment corriger ? | Exercice 3 |
| L128 | défi | Quatre : un job lit un répertoire partagé. Il échoue au deuxième fichier, un troisième arrive. Que traite la reprise ? | Exercice 4 |
| L129 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L130 | explicatif | Correction un. Trois comptes : deux opérations, zéro, une. Correction deux : plus de cent lignes, puisque chaque compte contient ses opérations. | Exercices 1 et 2 |
| L131 | explicatif | Correction trois : des lignes sautées ou doublées. Trier sur une clé unique. Correction quatre : la reprise traite aussi le troisième fichier. Un répertoire par exécution. | Exercices 3 et 4 |
| L132 | transition | Au module suivant, tu passes aux processors, aux scopes et aux proxys, pour transformer les données que tu viens d'apprendre à lire. | Aperçu « processors, scopes, proxys » |
