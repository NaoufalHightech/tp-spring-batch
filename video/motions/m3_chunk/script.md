# Module 3 : Le chunk, lire, traiter, écrire

Vidéo de formation Spring Batch. Durée visée : 55 minutes, en sept parties (3.1 à 3.7). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_3.md`. Fil rouge : charger un fichier de transactions bancaires dans PostgreSQL. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script


### Scène 0 : Flashback et ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | La banque dépose chaque nuit un fichier de dix gigaoctets. Impossible de le charger en mémoire. Et à trois heures quarante, le serveur redémarre. | Fichier de 10 Go, jauge mémoire qui déborde, horloge 03:40 |
| L002 | pédagogue | Au matin, on veut deux choses : tout le fichier en base, sans doublon, et une reprise qui ne rejoue pas dix heures de travail. | Deux objectifs : « tout le fichier », « reprise courte » |
| L003 | rappel | Deux rappels. Au premier module, l'ExecutionContext est la sauvegarde de partie du step, dans la table batch step execution context. | Boîte ExecutionContext, cylindre PostgreSQL |
| L004 | rappel | Au deuxième module, une tasklet est une action dans une transaction, et StepScope crée un bean neuf à chaque exécution du step. | Tasklet, StepScope, proxy |
| L005 | annonce | Ce module répond à la question : comment traiter des millions d'éléments sans exploser la mémoire, et pouvoir reprendre ? Sept étapes. | Sept pastilles 3.1 à 3.7 |

### Scène 1 : De la tasklet au chunk (3.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L006 | besoin | Mon besoin : traiter un million de lignes. Une tasklet, c'est une action. Je peux y écrire une boucle moi-même. | Tasklet avec une boucle for |
| L007 | explicatif | Mais cette boucle, il faut la maintenir : la mémoire, les transactions, la reprise, les compteurs. Tout est à ta charge. | Quatre responsabilités qui s'empilent sur la boucle |
| L008 | explicatif | Le traitement par chunk confie tout cela à Spring Batch. Toi, tu fournis seulement trois pièces. | Trois boîtes : reader, processor, writer |
| L009 | technique | Le reader lit un seul élément à la fois, et retourne null quand il n'y a plus rien à lire. | Colonne Reader : « 1 appel = 1 élément » |
| L010 | technique | Le processor transforme, valide ou filtre un seul élément. | Colonne Processor : « 1 appel = 1 élément » |
| L011 | technique | Le writer, lui, écrit tout un lot d'un coup. Un appel, un chunk. | Colonne Writer : « 1 appel = 1 chunk » |
| L012 | explicatif | Voici l'algorithme, avec une taille de chunk de cent. Spring Batch ouvre une transaction. | Cadre « transaction » qui s'ouvre |
| L013 | explicatif | Puis, jusqu'à cent fois : il lit un élément, il le passe au processor, et si le résultat n'est pas null, il l'ajoute au chunk. | Boucle lire, traiter, ajouter, répétée |
| L014 | explicatif | Ensuite, une seule écriture du lot. Puis la sauvegarde de l'état dans l'ExecutionContext, et la mise à jour des compteurs. | Écriture, puis ExecutionContext, puis compteurs |
| L015 | appuyé | Et enfin le commit. Tout est validé en un seul bloc, puis on recommence, jusqu'à ce que le reader retourne null. | Commit, flèche de retour |
| L016 | règle | Un chunk égale une transaction. La taille du chunk est donc la taille de ce que tu perds si un chunk échoue. | Phrase encadrée |
| L017 | défi, direct | Question. Un chunk de cent échoue au cinquantième élément. Combien d'éléments de ce chunk sont écrits en base ? | Question « PRÉDIRE » |
| L018 | posé | Aucun. Le rollback annule les cent éléments du lot, mais pas les chunks déjà validés. | Chunk rouge, chunks précédents verts |
| L019 | pont | Une nouveauté de la version six touche directement l'écriture du step. La voici. | Titre « ce qui change en version 6 » |
| L020 | explicatif | Le step orienté chunk s'écrit maintenant avec StepBuilder point chunk, avec un seul argument : la taille. Il produit un ChunkOrientedStep. | Code : `.chunk(100)` |
| L021 | explicatif | L'ancienne forme, chunk avec la taille et le gestionnaire de transactions, est dépréciée depuis la version six, et prévue pour suppression. | Code : `.chunk(100, tx)` barré |
| L022 | technique | Elle compile encore, avec un avertissement. Dans la nouvelle forme, le gestionnaire de transactions se donne séparément, avec transactionManager. | Avertissement de compilation, `.transactionManager(tx)` |
| L023 | récapitulatif | En résumé : trois pièces, une transaction par chunk, et une nouvelle écriture du step. Passons aux données. | Pastilles récapitulatives |

### Scène 2 : Les données, le fichier, la table, les records (3.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L024 | besoin | Mon besoin : un exemple réel. Un fichier de transactions bancaires, chargé dans une table PostgreSQL. | Dossier data, fichier transactions.csv |
| L025 | technique | Le fichier a une ligne d'en-tête, puis une ligne par transaction : identifiant, compte, date, type et montant. | Tableau CSV, en-tête puis cinq lignes |
| L026 | explicatif | Regarde la quatrième ligne : un montant à zéro. On y reviendra, pour le filtrage. | Ligne 4 en orange |
| L027 | technique | Côté base, la table bank transaction. La clé primaire est fournie par le fichier : elle rendra l'écriture rejouable. | SQL tapé : `id BIGINT PRIMARY KEY` |
| L028 | technique | La date est un vrai type date-heure, pas une chaîne. | `transaction_date TIMESTAMP NOT NULL` |
| L029 | technique | Le type est contraint à D ou C : la base refuse toute autre valeur. C'est la dernière ligne de défense. | `CHECK (transaction_type IN ('D','C'))` |
| L030 | appuyé | Et le montant en NUMERIC. Jamais en double precision : l'argent ne supporte pas les erreurs d'arrondi. | `amount NUMERIC(15,2)`, double barré |
| L031 | défi, direct | Question. Pourquoi un montant en NUMERIC, et pas en nombre flottant ? | Question « PRÉDIRE » |
| L032 | posé | Parce qu'un flottant ne représente pas exactement les décimales. Zéro virgule un plus zéro virgule deux ne donne pas exactement zéro virgule trois. | Calcul flottant faux |
| L033 | explicatif | Côté Java, deux records. Le premier, RawTransaction, représente la ligne telle qu'elle est lue : la date reste une chaîne. | Code : `record RawTransaction` |
| L034 | explicatif | Pourquoi ? Parce que le reader ne fait que lire. La conversion appartient au processor. | Séparation lecture / conversion |
| L035 | technique | Le second, BankTransaction, a de vrais types, une vraie date et un montant décimal. | Code : `record BankTransaction` |
| L036 | appuyé | Son constructeur compact s'exécute à chaque création, et protège l'invariant : un type inconnu ne peut jamais exister. | Constructeur compact surligné |
| L037 | règle | Un record pour lire, un autre pour écrire. Le processor fait le pont entre les deux. | Flèche Raw → Bank |

### Scène 3 : Le reader de fichier plat (3.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L038 | besoin | Mon besoin : lire ce fichier ligne par ligne, sans jamais le charger en entier. | Fichier lu en flux |
| L039 | technique | Je déclare un bean, en StepScope, parce que le fichier est un paramètre du lancement. | Code : `@Bean @StepScope` |
| L040 | appuyé | Le type de retour est la classe concrète, FlatFileItemReader, pas l'interface ItemReader. Retiens bien ce détail, on y revient dans le piège numéro quatre. | `FlatFileItemReader<RawTransaction>` surligné |
| L041 | technique | Le chemin du fichier arrive par une expression sur jobParameters, évaluée au démarrage du step. | `@Value("#{jobParameters['inputFile']}")` |
| L042 | technique | Un tokenizer découpe une ligne en champs, selon un séparateur. Ici, la virgule. | `new DelimitedLineTokenizer()` |
| L043 | technique | Et on donne les noms des colonnes, dans l'ordre du fichier. Ils serviront à remplir l'objet. | `tokenizer.setNames("id", "accountNumber", …)` |
| L044 | technique | Puis le builder, la manière moderne d'assembler un reader. | `new FlatFileItemReaderBuilder<RawTransaction>()` |
| L045 | appuyé | Le nom est obligatoire. Il préfixe les clés sauvegardées dans l'ExecutionContext. Sans nom, pas de reprise. | `.name("bankCsvReader")` surligné |
| L046 | technique | La ressource : un FileSystemResource pour un fichier du disque, un ClassPathResource pour un fichier embarqué. | `.resource(new FileSystemResource(inputFile))` |
| L047 | appuyé | Et linesToSkip à un : saute l'en-tête. Sans cela, la ligne d'en-tête est lue comme une donnée, et la conversion de l'identifiant échoue. | `.linesToSkip(1)` |
| L048 | technique | Puis le tokenizer, et le mapper : il remplit le record à partir des champs, par nom. | `.lineTokenizer(tokenizer).fieldSetMapper(…)` |
| L049 | défi, direct | Question. Que se passe-t-il si j'oublie linesToSkip ? | Question « PRÉDIRE » |
| L050 | posé | La première ligne, id, accountNumber et la suite, est traitée comme une donnée : la conversion de id en nombre échoue dès la ligne un. | Terminal : erreur à la ligne 1 |
| L051 | explicatif | Un mot sur les deux paramètres du job. runDate est un paramètre identifiant : il définit la JobInstance, comme au premier module. | Code : `.addString("runDate", "2026-10-01")` |
| L052 | explicatif | inputFile est un paramètre non identifiant, avec le troisième argument à false. Il n'entre pas dans l'identité de l'instance. | `.addString("inputFile", …, false)` |
| L053 | règle | runDate identifie le lot. inputFile est une entrée qui peut varier. | Deux colonnes identifiant / non identifiant |
| L054 | appuyé | Conséquence : si le fichier est corrigé et que tu relances le lot du même jour après un échec, c'est la même instance qui reprend. | Instance 1 : exécution 1 FAILED, exécution 2 reprise |
| L055 | appuyé | Et si le lot est déjà terminé, le relancement est refusé, quel que soit le fichier. | Instance fermée, relance refusée |
| L056 | défi, direct | Question. Je relance le lot du même jour avec un autre fichier. L'instance précédente est COMPLETED. Que se passe-t-il ? | Question « PRÉDIRE » |
| L057 | posé | Refus : JobInstanceAlreadyCompleteException. L'instance est identifiée par runDate, pas par le fichier. | Exception en rouge |
| L058 | récapitulatif | En résumé : un reader nommé, de type concret, qui saute l'en-tête, et un fichier non identifiant. | Quatre pastilles |

### Scène 4 : Le processor et le filtrage (3.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L059 | besoin | Mon besoin : convertir la date, et ignorer les transactions de montant nul. | Raw → Bank, ligne à zéro écartée |
| L060 | technique | Un composant qui implémente ItemProcessor, avec deux types : l'entrée, RawTransaction, et la sortie, BankTransaction. | Code : `implements ItemProcessor<Raw, Bank>` |
| L061 | explicatif | Les deux types peuvent différer. C'est précisément le rôle du processor : transformer. | Types d'entrée et de sortie |
| L062 | technique | Un DateTimeFormatter, en champ static final. Il est immuable et thread-safe, donc sans risque. | `static final DateTimeFormatter FORMAT` |
| L063 | appuyé | Son ancêtre, SimpleDateFormat, ne l'est pas. On y reviendra avec les processeurs en multi-thread. | SimpleDateFormat barré |
| L064 | technique | La méthode process reçoit un élément, et en retourne un. Elle ne connaît ni le fichier, ni la base. | Code : `process(RawTransaction raw)` |
| L065 | technique | La règle métier : un montant nul n'a rien à enregistrer. | `if (raw.amount().signum() == 0)` |
| L066 | appuyé | Et on retourne null. Retourner null filtre l'élément : il n'est pas ajouté au chunk, donc jamais écrit. | `return null;` surligné |
| L067 | explicatif | Ce n'est pas une erreur. C'est le contrat : retourner null signifie, ne pas poursuivre le traitement de cet élément. | Contrat de l'interface |
| L068 | technique | Sinon, on construit l'objet cible, avec la date convertie. Un format invalide lève une DateTimeParseException ici. | `new BankTransaction(…, LocalDateTime.parse(…))` |
| L069 | explicatif | Dans la boucle du step, un résultat null incrémente filterCount, et l'élément n'entre pas dans le chunk. | Schéma : null → filterCount++ |
| L070 | appuyé | Pas skipCount : le filtrage n'est ni une erreur, ni un skip. Le compteur filter count augmente. | Deux compteurs : filter vert, skip gris |
| L071 | explicatif | Et la position de lecture avance quand même : la ligne est considérée comme traitée. | Position qui avance sur la ligne filtrée |
| L072 | technique | Sur notre exemple : cinq lignes lues, une filtrée, quatre écrites. read count cinq, filter count un, write count quatre. | Compteurs 5, 1, 4 |
| L073 | défi, direct | Question. Le fichier contient mille lignes dont quatre-vingts à montant nul. Combien vaut write count ? | Question « PRÉDIRE » |
| L074 | posé | Neuf cent vingt. Mille lues, quatre-vingts filtrées, neuf cent vingt écrites. Et skip count vaut zéro. | Compteurs 1000, 80, 920 |
| L075 | appuyé | Un cas limite : un chunk entièrement filtré est un chunk vide. Le writer reçoit un lot sans élément, ne fait rien, et le commit a lieu quand même. | Chunk vide, commit quand même |
| L076 | récapitulatif | En résumé : un processor sans état, qui convertit et filtre par null. Passons à l'écriture. | Pastilles |

### Scène 5 : Le writer PostgreSQL (3.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L077 | besoin | Mon besoin : écrire cent éléments d'un coup dans PostgreSQL, et pouvoir rejouer sans doublon. | Chunk de 100 → table |
| L078 | technique | Un bean JdbcBatchItemWriter, typé avec l'objet de sortie du processor. | Code : `JdbcBatchItemWriter<BankTransaction>` |
| L079 | technique | La DataSource PostgreSQL du premier module : la même que le JobRepository, donc la même transaction. | `.dataSource(dataSource)`, même base |
| L080 | technique | Le SQL, avec des paramètres nommés, et un bloc de texte entre triples guillemets : lisible, sans concaténation. | Code : `.sql(""" INSERT INTO bank_transaction …""")` |
| L081 | appuyé | Et ON CONFLICT DO UPDATE rend l'écriture rejouable : relancer le même fichier ne duplique rien, et ne plante pas. | `ON CONFLICT (id) DO UPDATE` surligné |
| L082 | explicatif | Chaque élément est converti en paramètres, par un fournisseur explicite. | `.itemSqlParameterSourceProvider(tx -> …)` |
| L083 | appuyé | Pourquoi explicite ? Parce que beanMapped s'appuie sur des getters getX, que les records n'ont pas. Ils exposent id, pas getId. | beanMapped barré, record sans getters |
| L084 | technique | Le writer envoie les cent éléments du chunk en un seul lot JDBC. | Un lot de 100 vers la base |
| L085 | explicatif | Un réglage PostgreSQL : reWriteBatchedInserts à true dans l'adresse JDBC. Le pilote regroupe les insertions en moins de requêtes. | URL : `?reWriteBatchedInserts=true` |
| L086 | défi, direct | Question. Je relance exactement le même fichier. ON CONFLICT DO UPDATE est en place. Combien de lignes se retrouvent en base ? | Question « PRÉDIRE » |
| L087 | posé | Quatre : les mêmes, mises à jour. Aucun doublon, et aucune erreur. | Table : 4 lignes |
| L088 | pont | Reste à assembler les trois pièces dans un step. | Titre « le step » |

### Scène 6 : Le step et le job (3.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L089 | besoin | Mon besoin : un step qui branche le reader, le processor et le writer, avec des chunks de cent. | Trois pièces à assembler |
| L090 | technique | StepBuilder, avec un nom : la clé de ses exécutions dans batch step execution. | Code : `new StepBuilder("loadBankStep", jobRepository)` |
| L091 | appuyé | Puis chunk de cent, avec les types d'entrée et de sortie. C'est la forme de la version six. | `.<RawTransaction, BankTransaction>chunk(100)` |
| L092 | technique | Puis transactionManager : la transaction qui entoure chaque chunk. | `.transactionManager(transactionManager)` |
| L093 | technique | Puis le reader, le processor, facultatif, et le writer. | `.reader(…).processor(…).writer(…)` |
| L094 | appuyé | Et stream, avec le reader. Il enregistre explicitement le reader comme ItemStream : le step l'ouvre, le met à jour à chaque commit, et le ferme. | `.stream(bankCsvReader)` surligné |
| L095 | explicatif | Le déclarer ne coûte rien, et évite le piège numéro quatre. | Étiquette « piège n°4 évité » |
| L096 | technique | Build produit un ChunkOrientedStep. Puis le job, comme au deuxième module. | `.build()`, bean `bankJob` |
| L097 | besoin | Lançons le job avec le fichier d'exemple. | Terminal vide |
| L098 | technique | La console affiche le lancement, le step, puis le statut final : COMPLETED. Extrait indicatif. | Terminal : `Step: [loadBankStep] executed`, COMPLETED |
| L099 | technique | Dans la table des steps : read count cinq, filter count un, write count quatre. | SQL : `SELECT read_count, filter_count, write_count …` |
| L100 | technique | Et dans la table de destination, quatre lignes. Le total des montants est de deux mille quatre cent quatre-vingt-six virgule vingt-cinq. | SQL : `SELECT SUM(amount)` → 2486.25 |
| L101 | explicatif | Et dans le contexte du step, la position du reader : read count égal cinq. | SQL : `SELECT short_context …` |
| L102 | récapitulatif | En résumé : le step assemble trois pièces, déclare le reader comme flux, et laisse Spring Batch tenir la boucle. Voyons sous le capot. | Pastilles |
| L103 | besoin | Provoquons maintenant un échec. Je remplace le montant de la ligne trois cent cinquante par du texte. | Fichier : ligne 350, montant « abc » |
| L104 | technique | Le reader lève une FlatFileParseException, avec le numéro de ligne. La transaction du chunk quatre est annulée. | Terminal : `FlatFileParseException … line 350` |
| L105 | technique | Dans la base : trois cents lignes, celles des trois premiers chunks. Et dans le contexte du step : read count égal trois cents. | SQL : `count(*)` = 300 ; `read.count = 300` |
| L106 | explicatif | Le step est en échec, le job aussi. Mais rien n'est écrit à moitié : le chunk quatre n'a laissé aucune trace. | Statut FAILED, chunk 4 vide |
| L107 | explicatif | On corrige le fichier, et on relance avec la même date : c'est la même instance, donc une reprise. | Instance 1 : exécution 2 |
| L108 | explicatif | La méthode open relit la position, saute trois cents éléments, et reprend à la trois cent unième. | Open : read.count = 300, reprise à 301 |
| L109 | règle | À la fin, mille lignes en base, sans doublon. C'est exactement la promesse du chunk. | 1000 lignes, 0 doublon, en vert |

### Scène 7 : ItemStream et la position sauvegardée (3.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L110 | besoin | Mon besoin : comprendre comment la position de lecture est sauvegardée, et pourquoi elle ne peut pas mentir. | Position + base |
| L111 | explicatif | Un reader ou un writer qui tient une ressource, un fichier, un curseur, une connexion, implémente ItemStream. | Interface ItemStream |
| L112 | technique | Trois méthodes. Open, appelée une fois, avant la première lecture : elle ouvre la ressource, et relit l'état sauvegardé. | Étape 1 : open |
| L113 | technique | Update, appelée à chaque chunk, avant le commit : elle écrit l'état dans le contexte, la position atteinte. | Étape 2 : update, à chaque chunk |
| L114 | technique | Et close, appelée une fois, à la fin, qu'il y ait succès ou échec : elle libère la ressource. | Étape 3 : close |
| L115 | explicatif | Le step appelle ce cycle de vie automatiquement, pour tout flux qu'on lui a déclaré. | Step qui pilote le cycle |
| L116 | technique | À chaque chunk, le reader inscrit son compteur dans l'ExecutionContext, sous une clé préfixée par son nom. | Clé : `bankCsvReader.read.count` |
| L117 | appuyé | C'est pour cela que le nom est obligatoire, et unique par reader. | Deux readers, clés distinctes |
| L118 | explicatif | Juste avant le commit, Spring Batch persiste ce contexte dans batch step execution context. | Contexte vers PostgreSQL |
| L119 | appuyé | Et le commit valide d'un seul bloc les cent lignes écrites et la position. | Chunk 1 : 100 lignes + position 100, même commit |
| L120 | explicatif | Chunk deux : cent lignes de plus, position deux cents, dans le même commit. | Chunk 2 : position 200 |
| L121 | appuyé | Chunk trois : un crash. Ni les lignes, ni la position trois cents ne sont enregistrées. | Chunk 3 en rouge, crash |
| L122 | règle | Les données et la position sont validées ensemble. Elles ne peuvent jamais se contredire. C'est ce qui évite à la fois la perte et le doublon. | Phrase encadrée |
| L123 | explicatif | Au redémarrage, open relit read count égal deux cents, saute deux cents éléments, et reprend à la deux cent unième. | Open relit 200, reprise à 201 |
| L124 | appuyé | Une condition : écrire dans la même base que le JobRepository. Avec une autre base, sans transaction commune, cette garantie est brisée. | Deux bases, transaction qui ne les couvre pas |
| L125 | défi, direct | Question. Un chunk de cent échoue à la ligne trois cent cinquante. Quelle position est enregistrée, et combien de lignes sont en base ? | Question « PRÉDIRE » |
| L126 | posé | Position trois cents, et trois cents lignes en base. Le chunk quatre, de trois cent un à quatre cents, est annulé en entier. | Frise : 3 chunks verts, chunk 4 rouge |
| L127 | explicatif | Il existe un réglage, saveState, à true par défaut. C'est lui qui rend la reprise possible. | `saveState` à true |
| L128 | explicatif | Le désactiver supprime toute écriture dans le contexte. Le reader n'a plus besoin de nom, mais un restart repart du début. | `saveState(false)` : restart du début |
| L129 | pédagogue | On ne s'y résout que dans un cas : un step multithread. On y reviendra plus loin dans la formation. | Étiquette « multithread, plus tard » |

### Scène 8 : La transaction et la taille du chunk (3.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L130 | explicatif | Qui détient la transaction ? Le gestionnaire de transactions en ouvre une par chunk. | Une transaction par chunk |
| L131 | technique | Le reader, le processor et le writer s'exécutent dans cette transaction. | Trois pièces dans le cadre |
| L132 | appuyé | Les écritures du writer et celles du JobRepository, compteurs et contexte, partagent la même connexion et le même commit. | Writer et repository sur la même connexion |
| L133 | appuyé | Une exception dans le processor ou le writer provoque un rollback de tout le chunk. Aucune ligne n'est écrite, la position n'avance pas. | Rollback complet |
| L134 | explicatif | Le step échoue, ou applique skip et retry, que nous verrons au module six. | Étiquette « skip / retry plus tard » |
| L135 | besoin | Dernière question de réglage : quelle taille de chunk choisir ? | Curseur de taille |
| L136 | explicatif | Un chunk petit, un seul élément : un commit par élément, très lent. Mais un rollback minuscule. | Colonne « petit » : lent, rollback minuscule |
| L137 | explicatif | Un chunk énorme, cent mille : peu de commits, très rapide. Mais tout le chunk est en mémoire, et un rollback refait tout. | Colonne « grand » : rapide, mémoire, gros rollback |
| L138 | appuyé | Entre les deux, il n'y a pas de bonne réponse théorique. La valeur se mesure : une courbe de débit contre la taille. | Courbe débit / taille de chunk |
| L139 | règle | Souvent entre cent et cinq mille. Mesure, ne devine pas. | Zone 100 à 5000 en vert |
| L140 | explicatif | Voici un exemple de mesure sur un million de lignes. Les chiffres sont illustratifs : ils changent avec ta machine et ta base. | Tableau, badge « illustratif » |
| L141 | explicatif | Un chunk de dix : dix minutes. Cent : une minute vingt. Mille : cinquante secondes. Cent mille : le même temps, mais la mémoire sature. | Courbe : durée par taille de chunk |
| L142 | défi, direct | Question. Pourquoi un chunk de cent mille risque-t-il un OutOfMemoryError ? | Question « PRÉDIRE » |
| L143 | posé | Parce que tous les éléments du chunk sont en mémoire en même temps, avant l'écriture. | Cent mille objets dans la JVM |
| L144 | pont | Parlons maintenant de la lecture en base de données, avec les curseurs. | Titre « curseur ou pagination » |

### Scène 9 : Curseur ou pagination (3.7)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L145 | besoin | Mon besoin : lire dix millions de lignes d'une base, sans faire exploser la mémoire. | Base de 10 M de lignes |
| L146 | image concrète | Un curseur, c'est un pointeur vers le résultat d'une requête. Au lieu de rapatrier toutes les lignes d'un coup, on garde la requête ouverte. | Base, curseur ouvert |
| L147 | explicatif | On dit à la base : donne-moi la ligne suivante, puis la suivante. Sans curseur, dix millions de lignes en mémoire : OutOfMemoryError. | Sans curseur : explosion. Avec curseur : ligne par ligne |
| L148 | technique | Le fetchSize règle la taille des paquets : le pilote ne va pas chercher les lignes une par une, ce serait un aller-retour réseau par ligne. | Paquets de fetchSize lignes |
| L149 | explicatif | Il les rapatrie par paquets, par exemple mille. Le curseur avance dans le paquet en mémoire, puis demande le suivant. | Paquet 1…1000, puis 1001…2000 |
| L150 | explicatif | Trop petit, beaucoup d'allers-retours. Trop grand, un paquet volumineux en mémoire. Entre cinq cents et cinq mille, à mesurer. | Deux extrêmes, zone verte |
| L151 | appuyé | Attention : un piège propre à PostgreSQL. Par défaut, le pilote charge tout le résultat en mémoire, quel que soit le reader. | Pilote PostgreSQL : tout en mémoire, en rouge |
| L152 | technique | Il ne fait du vrai streaming que si quatre conditions sont réunies. Première : l'auto-commit est désactivé sur la connexion. | Condition 1 : autocommit désactivé |
| L153 | technique | Deuxième : un fetchSize supérieur à zéro. Troisième : un curseur en avant seulement. Quatrième : une seule instruction. | Conditions 2, 3, 4 |
| L154 | appuyé | Qui désactive l'auto-commit ? Pas automatiquement. JdbcCursorItemReader ouvre sa propre connexion, hors de la transaction du chunk. | Connexion propre du reader |
| L155 | technique | Il faut le demander : setConnectionAutoCommit à false, ou, pour toute l'application, hikari auto-commit à false. | Code : `reader.setConnectionAutoCommit(false);` |
| L156 | appuyé | Sans l'un de ces réglages, fetchSize est ignoré. Le reader fonctionne, mais lit tout en mémoire. | Réglage absent : fetchSize ignoré |
| L157 | technique | Voyons le reader de base en code. Un builder, un nom, et la source de données. | Code : `new JdbcCursorItemReaderBuilder<BankTransaction>().name("cursorReader")` |
| L158 | technique | La requête SQL, puis fetchSize à mille : des paquets de mille lignes. | `.sql("SELECT …").fetchSize(1000)` |
| L159 | appuyé | Puis le mapper de ligne, et surtout, à part, setConnectionAutoCommit à false. Sans cette ligne, le streaming n'a pas lieu. | `reader.setConnectionAutoCommit(false);` surligné |
| L160 | pédagogue | Et l'OutOfMemoryError n'arrive que sur le gros fichier de production. | Test vert, production rouge |
| L161 | explicatif | Deux readers de base. JdbcCursorItemReader : une seule requête, un curseur ouvert pendant tout le step. | Colonne curseur |
| L162 | explicatif | JdbcPagingItemReader : une requête par page, avec tri et clé de reprise. Il est thread-safe, pas le curseur. | Colonne pagination |
| L163 | appuyé | Le risque du curseur : coupé si le step dure trop longtemps. Le risque de la pagination : des lignes sautées ou doublées, si le tri est instable. | Deux risques |
| L164 | règle | Pour la pagination, trie toujours sur une clé unique, comme la clé primaire. | Tri sur `id` |
| L165 | défi, direct | Question. Dans quel cas JdbcPagingItemReader peut-il lire deux fois la même ligne ? | Question « PRÉDIRE » |
| L166 | posé | Quand le tri porte sur une colonne non unique : l'ordre n'est plus stable d'une page à l'autre. | Deux lignes à égalité, ordre qui change |

### Scène 10 : Cas d'usage

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L167 | explicatif | Premier cas : le fichier de dix gigaoctets de la banque. Avec un chunk de mille, la mémoire reste constante : un chunk à la fois. | Mémoire plate, chunk par chunk |
| L168 | appuyé | À trois heures quarante, le serveur redémarre. La reprise rejoue au plus un chunk, pas dix heures de travail. | Frise : crash, reprise, un chunk rejoué |
| L169 | explicatif | Deuxième cas : la migration entre deux référentiels. Lecture paginée dans l'ancienne base, transformation, écriture par lots dans PostgreSQL. | Ancienne base → processor → PostgreSQL |
| L170 | explicatif | ON CONFLICT DO UPDATE permet de rejouer la migration, sans doublon. | Rejeu sans doublon |
| L171 | explicatif | Troisième cas : le nettoyage. Un fichier de deux millions de lignes contient huit pour cent de montants nuls. | Fichier 2 M, 8 % en orange |
| L172 | appuyé | Le processor les filtre. Elles ne polluent pas la base, et filter count donne le chiffre exact pour le rapport d'audit. | filterCount = 160 000 |
| L173 | pont | Voyons maintenant les dix pièges du module. | Titre « Top 10 » |

### Scène 11 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L174 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L175 | appuyé | Un : une taille de chunk à un, ou jamais mesurée. Un commit par ligne, un débit divisé par dix à cent. | Ligne 1 |
| L176 | pédagogue | Comment le repérer : un commit count égal au nombre de lignes lues. | Extrait indicatif : `read_count = 5000   commit_count = 5000` |
| L177 | pédagogue | Pourquoi on y tombe : parce que la valeur par défaut du tutoriel convient pour dix lignes de test. | Dix lignes de test, un million en production |
| L178 | appuyé | Deux : un OutOfMemoryError. Un reader qui charge tout, ou un chunk énorme. | Ligne 2 |
| L179 | pédagogue | Comment le repérer : la JVM s'arrête au milieu de la nuit. | Extrait indicatif : `java.lang.OutOfMemoryError: Java heap space` |
| L180 | pédagogue | Pourquoi on y tombe : un findAll semble pratique, et marche parfaitement en test. | findAll() sur 10 lignes |
| L181 | appuyé | Trois : un reader sans nom. Échec au démarrage, ou clés qui se mélangent entre deux readers. | Ligne 3 |
| L182 | pédagogue | Comment le repérer : un message qui exige un nom au démarrage du step. | Extrait indicatif : `IllegalArgumentException: A name is required` |
| L183 | pédagogue | Pourquoi on y tombe : on retire le nom pour simplifier, et rien ne casse tant qu'on ne reprend pas. | Nom supprimé, test vert |
| L184 | appuyé | Quatre : un bean StepScope typé ItemReader au lieu de la classe concrète. Le proxy ne se voit pas comme ItemStream. | Ligne 4 |
| L185 | pédagogue | Comment le repérer : aucune position sauvegardée, un restart qui repart du début. | Extrait indicatif : `batch_step_execution_context` vide |
| L186 | pédagogue | Pourquoi on y tombe : parce que le type ItemReader semble plus propre. Le proxy cache le flux. | ItemReader au lieu de la classe concrète |
| L187 | appuyé | Cinq : un processor avec état, ou un SimpleDateFormat partagé. Double comptage, valeurs fausses en multi-thread. | Ligne 5 |
| L188 | pédagogue | Comment le repérer : des dates incohérentes d'un lancement à l'autre. | Extrait indicatif : date `01/10/2026` lue comme `1970-…` |
| L189 | pédagogue | Pourquoi on y tombe : parce qu'un formateur de dates semble inoffensif, jusqu'au deuxième thread. | Un formateur partagé, deux threads |

### Scène 12 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L190 | pont | Les cinq suivants touchent la pagination, l'écriture et les tests. | Tableau, lignes 6 à 10 |
| L191 | appuyé | Six : un reader paginé instable. Tri sur une colonne non unique. Des lignes sautées ou lues deux fois, sans erreur. | Ligne 6 |
| L192 | pédagogue | Comment le repérer : un total qui ne correspond jamais exactement au nombre de lignes de la source. | Extrait indicatif : source `1000000`, destination `999 987` |
| L193 | pédagogue | Pourquoi on y tombe : parce que le tri sur une colonne non unique marche, jusqu'à ce que deux lignes soient à égalité. | Deux lignes à égalité |
| L194 | appuyé | Sept : ON CONFLICT DO NOTHING avec le contrôle des mises à jour actif. Un lot de doublons fait échouer le step. | Ligne 7 |
| L195 | pédagogue | Comment le repérer : une erreur sur le nombre de lignes mises à jour, à la relance du même fichier. | Extrait indicatif : `EmptyResultDataAccessException: Item 0 of 100 did not update any rows` |
| L196 | pédagogue | Pourquoi on y tombe : on veut ignorer les doublons, sans voir que le contrôle des mises à jour attend au moins une ligne. | DO NOTHING, aucune ligne touchée |
| L197 | appuyé | Huit : beanMapped avec des records. Les paramètres sont introuvables, puisque les records n'ont pas de getters. | Ligne 8 |
| L198 | pédagogue | Comment le repérer : une exception sur un paramètre nommé introuvable. | Extrait indicatif : `Invalid property 'id' of bean class …` |
| L199 | pédagogue | Pourquoi on y tombe : beanMapped est le raccourci le plus connu, et il vient d'avant les records. | Raccourci d'avant les records |
| L200 | appuyé | Neuf : un test vert avec des données fausses. Il ne vérifie que le nombre de lignes. | Ligne 9 |
| L201 | pédagogue | Comment le repérer : un champ à zéro en base, alors que le test est vert. | Extrait indicatif : `assertThat(rows).hasSize(4)` vert, `amount = 0` |
| L202 | pédagogue | Pourquoi on y tombe : parce que le comptage est le test le plus facile à écrire. | Test de comptage |
| L203 | explicatif | Voici le bon test : la somme des montants. Deux mille quatre cent quatre-vingt-six virgule vingt-cinq, la ligne à zéro étant filtrée. | Code : `SELECT SUM(amount)` = 2486.25 |
| L204 | règle | Un test de chargement doit contrôler au moins une valeur calculée. Le comptage seul ne voit pas une colonne oubliée. | Phrase encadrée |
| L205 | explicatif | Un second réflexe : tester le job complet deux fois, comme au module deux, et comparer la somme à chaque lancement. | Deux lancements, deux sommes |
| L206 | appuyé | Dix : oublier linesToSkip. L'en-tête est lue comme une donnée, et la conversion échoue à la ligne un. | Ligne 10 |
| L207 | pédagogue | Comment le repérer : une erreur de conversion sur la première ligne, avec le mot id. | Extrait indicatif : `NumberFormatException: For input string: "id"` |
| L208 | pédagogue | Pourquoi on y tombe : parce que le fichier d'exemple du tutoriel n'avait pas d'en-tête. | Fichier sans en-tête |
| L209 | pédagogue | Un flashback : les pièges quatre et cinq sont deux visages du même sujet du module deux. Un composant partagé ne fait pas ce qu'on croit. | Lien avec le module 2 |

### Scène 13 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L210 | pédagogue | Reprenons notre fichier de dix gigaoctets et notre redémarrage de trois heures quarante. Tu sais maintenant comment on s'en sort. | Fichier 10 Go, horloge 03:40 |
| L211 | récapitulatif | Un chunk, c'est une transaction : lire un par un, écrire par lot. | Pastille 1 |
| L212 | récapitulatif | La position est sauvegardée dans le même commit que les données : jamais de perte, jamais de doublon. | Pastille 2 |
| L213 | récapitulatif | Le reader a un nom, un type concret, et il est déclaré comme flux. Le processor filtre par null. | Pastille 3 |
| L214 | défi | Quatre exercices pour finir. Un : le fichier contient mille lignes dont quatre-vingts à montant nul. Combien valent read count, filter count et write count ? | Exercice 1 |
| L215 | défi | Deux : un chunk de cent échoue à la ligne trois cent cinquante. Quelle position est enregistrée, combien de lignes sont en base ? | Exercice 2 |
| L216 | défi | Trois : un collègue retire le nom du reader. Que risque-t-il de se passer ? Et s'il retourne ItemReader depuis la méthode StepScope ? | Exercice 3 |
| L217 | défi | Quatre : écris l'assertion qui détecte qu'un champ montant n'a pas été mappé, alors que le test de comptage reste vert. | Exercice 4 |
| L218 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L219 | explicatif | Correction un. Mille lues, quatre-vingts filtrées, neuf cent vingt écrites. Skip count vaut zéro. | Exercice 1 : 1000, 80, 920 |
| L220 | explicatif | Correction deux. Position trois cents, et trois cents lignes en base : le chunk quatre est annulé en entier. | Exercice 2 : 300 et 300 |
| L221 | explicatif | Correction trois. Sans nom, échec au démarrage, ou clés mélangées. Avec ItemReader, le proxy n'est pas un ItemStream, et aucune position n'est sauvegardée. | Exercice 3 : nom, type concret |
| L222 | explicatif | Correction quatre. Vérifier la somme des montants, ou le premier et le dernier enregistrement. | Exercice 4 : `SUM(amount)` |
| L223 | transition | Au module suivant, tu vas enrichir le processor : composer, valider, et comprendre pourquoi les scopes et les proxys comptent autant. | Aperçu « processors, scopes, proxys » |
