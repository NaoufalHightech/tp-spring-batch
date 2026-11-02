# Module 7 : Mise à l'échelle et multi-instance

Vidéo de formation Spring Batch, parcours complet, optionnel. Durée visée : 70 minutes, en neuf parties (7.1 à 7.9). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_7.md`. Les parties distribuées sont théoriques : le code vient des classes de Spring Batch six point zéro point six, sans exécution. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture et flashbacks

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Le rapprochement doit être fini à six heures. Il se termine à huit heures. Et le volume double chaque année. Ton premier réflexe : ajouter des threads. | Deadline 06:00, réalité 08:00 |
| L002 | pédagogue | Mauvais réflexe, ou en tout cas, réflexe trop rapide. Aujourd'hui, on apprend à mesurer, puis à choisir la bonne façon de passer à l'échelle. | Mesurer, puis choisir |
| L003 | rappel | Un rappel du module un. Tous les serveurs partagent la même base de métadonnées : c'est elle qui fait de plusieurs processus un seul système. | Deux serveurs, une base |
| L004 | rappel | Du module quatre : un singleton avec état, en multithread, ne fait plus un bug à retardement. Il fait des résultats aléatoires. | Singleton, deux threads |
| L005 | rappel | Du module cinq : le split parallélise des steps différents. Aujourd'hui, on parallélise un même step. | Split / même step |
| L006 | annonce | Neuf étapes : mesurer, le panorama, le multithread, l'asynchrone, le partitionnement local, restart, le distribué, SKIP LOCKED, et les pièges. | Neuf pastilles 7.1 à 7.9 |

### Scène 1 : Mesurer avant d'optimiser (7.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L007 | besoin | Mon besoin : un job qui ne tient plus dans ses délais. Et une envie : lui donner plus de threads. | Job lent |
| L008 | explicatif | Une règle ancienne de l'optimisation : ne pas optimiser. Et, pour les experts, pas encore. | Règle d'or |
| L009 | explicatif | Un job lent a souvent un défaut que le parallélisme ne guérit pas : une boucle accidentelle, une requête par élément, une chaîne qui grossit. | Défauts de code |
| L010 | appuyé | Paralléliser un code défaillant ne le répare pas : on obtient le même défaut, plus vite, et sur plus de threads. | Défaut multiplié |
| L011 | explicatif | Première étape : mesurer où va le temps. Le processeur, la mémoire, ou les entrées-sorties. | Trois mesures |
| L012 | explicatif | Les outils : Java Flight Recorder, fourni avec le JDK, utilisable sur une JVM de production. Et VisualVM, un outil externe. | JFR, VisualVM |
| L013 | explicatif | Un échantillonnage du processeur désigne les méthodes qui consomment le plus. | Profil CPU |
| L014 | règle | Deuxième étape : corriger les défauts de code. Troisième étape seulement : choisir une stratégie. | Trois étapes |
| L015 | explicatif | La plupart des traitements par lots sont limités par les entrées-sorties, base ou fichiers, pas par le processeur. C'est ce qui oriente le choix. | E/S plus que CPU |
| L016 | explicatif | Trois bonnes raisons de passer à l'échelle. Le volume qui grossit : deux millions de lignes hier, cinquante millions dans un an. | Volume |
| L017 | explicatif | Le SLA, la fenêtre de traitement. Et la disponibilité : un seul serveur est un point de défaillance. | SLA, disponibilité |
| L018 | défi, direct | Question. Un job lit des fichiers et écrit en base. Le processeur est à dix pour cent, la base à quatre-vingt-dix pour cent. Que fais-tu ? | Question « PRÉDIRE » |
| L019 | posé | Je ne rajoute pas de threads de calcul : le goulot est la base. J'optimise les écritures, ou je partitionne en respectant le pool de connexions. | Goulot : la base |

### Scène 2 : Le panorama des approches (7.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L020 | besoin | Mon besoin : choisir une stratégie parmi sept. De la plus simple à la plus complexe. | Sept approches |
| L021 | explicatif | Sur un seul serveur : un, le step multithread, qui parallélise les chunks d'un même step. | Approche 1 |
| L022 | explicatif | Deux : les flux parallèles, avec le split du module cinq. Trois : l'AsyncItemProcessor, qui ne parallélise que le processor. | Approches 2 et 3 |
| L023 | explicatif | Quatre : le partitionnement local. Le même step, sur des plages de données disjointes. | Approche 4 |
| L024 | explicatif | Sur plusieurs serveurs : cinq, le partitionnement distribué. Six, le remote chunking. Sept, la compétition sur une file, avec SKIP LOCKED. | Approches 5, 6, 7 |
| L025 | appuyé | Le step multithread : gain rapide si le reader est déjà thread-safe. Le point faible : l'état du reader, pas de restart au chunk près, l'ordre perdu. | Tableau, ligne 1 |
| L026 | appuyé | L'AsyncItemProcessor : quand le processor est lent. La lecture et l'écriture restent séquentielles. | Ligne 3 |
| L027 | appuyé | Le partitionnement local : gros volume, un serveur suffit. Limité à une JVM. | Ligne 4 |
| L028 | appuyé | Le remote chunking : quand c'est le traitement le goulot, pas l'I/O. Les données transitent par le réseau. | Ligne 6 |
| L029 | appuyé | SKIP LOCKED : un travail en continu, des instances interchangeables. La conception de la réservation est à ta charge. | Ligne 7 |
| L030 | explicatif | Une confusion fréquente : deux situations très différentes avec plusieurs serveurs. | Deux situations |
| L031 | explicatif | Première situation : éviter les doublons. Deux serveurs déclenchent le même job avec la même date. Qui l'exécute ? | Deux serveurs, un seul exécute |
| L032 | appuyé | Le JobRepository : un seul démarre, l'autre reçoit JobExecutionAlreadyRunningException, comme au module un. | Un vert, un rouge |
| L033 | explicatif | Deuxième situation : se partager le travail. Deux serveurs veulent travailler ensemble sur le même volume. | Deux serveurs, un volume |
| L034 | appuyé | Le partitionnement, découpage décidé à l'avance. Ou la réservation de lignes, SKIP LOCKED : chacun prend ce que l'autre ne prend pas. | Partition ou réservation |
| L035 | défi, direct | Question. Deux serveurs lancent le même job, avec la même date, à deux heures. Est-ce du partage de travail ? | Question « PRÉDIRE » |
| L036 | posé | Non : c'est un doublon. Le JobRepository en laisse passer un seul. Pour partager un volume, il faut partitionner, ou réserver. | Doublon ≠ partage |

### Scène 3 : Le step multithread et ses limites (7.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L037 | besoin | Mon besoin : plus de chunks en même temps, sans réécrire mon step. | Chunks en parallèle |
| L038 | technique | Un exécuteur asynchrone, avec un préfixe de nom de thread : indispensable pour lire les journaux. | Code : `new SimpleAsyncTaskExecutor("chunk-")` |
| L039 | appuyé | Et un plafond de quatre chunks simultanés. Sans limite, il crée un thread par tâche, sans recyclage : à proscrire en production. | `executor.setConcurrencyLimit(4)` |
| L040 | technique | Le step, comme au module trois : chunk de cent, le reader, le processor, le writer. | Code : `.chunk(100)…` |
| L041 | appuyé | Chaque chunk, dans son thread, a sa propre transaction. | Une transaction par thread |
| L042 | technique | Et taskExecutor, avec l'exécuteur. En version six, il attend un AsyncTaskExecutor. | `.taskExecutor(chunkExecutor)` |
| L043 | appuyé | Le reader doit être thread-safe. Un reader paginé l'est. Un curseur ou un reader de fichier ne l'est pas. | Reader paginé vert, curseur rouge |
| L044 | explicatif | Un tableau pour retenir. JdbcPagingItemReader : oui, chaque page est une requête indépendante. | Tableau, ligne 1 |
| L045 | explicatif | JdbcCursorItemReader : non, un seul ResultSet partagé. FlatFileItemReader : non, un flux et un compteur. | Lignes 2 et 3 |
| L046 | explicatif | XML et JSON : non plus. Tout reader enveloppé dans un SynchronizedItemStreamReader : oui, la lecture est sérialisée. | Lignes 4 et 5 |
| L047 | technique | SynchronizedItemStreamReader met un verrou autour de read : un seul thread lit à la fois. Le reste reste parallèle. | Code : `new SynchronizedItemStreamReader<>(bankCsvReader)` |
| L048 | technique | Et on l'enregistre aussi comme flux, avec stream. | `.reader(shared).stream(shared)` |
| L049 | appuyé | Le prix à payer : les chunks se terminent dans le désordre. Une position de lecture n'a plus de sens. | Chunks 3, 1, 2 |
| L050 | appuyé | Un reader de fichier doit alors avoir saveState à false : plus de position sauvegardée, et un restart qui repart du début. | `saveState(false)` |
| L051 | règle | Pour une reprise précise, ne fais pas du multithread : fais du partitionnement. | Phrase encadrée |
| L052 | défi, direct | Question. Un FlatFileItemReader est utilisé par quatre threads, sans précaution. Que risque-t-on ? | Question « PRÉDIRE » |
| L053 | posé | Des lignes sautées ou dupliquées, sans erreur : le flux de lecture et le compteur sont partagés. | Lignes perdues, sans exception |

### Scène 4 : Thread-safe, de quoi parle-t-on ? (7.3b)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L054 | pédagogue | Je viens de répéter thread-safe plusieurs fois. Prenons une minute pour dire ce que ça veut dire, et à quels composants ça s'applique. | Titre « Thread-safe ? » |
| L055 | explicatif | Une classe est thread-safe quand plusieurs threads peuvent l'utiliser en même temps, sans que le résultat devienne faux. | Définition : plusieurs threads, résultat juste |
| L056 | exemple | Un compteur partagé vaut cinq. Deux threads le lisent en même temps, et chacun écrit six. Il aurait dû valoir sept : une incrémentation est perdue. | Deux threads, compteur : 5 puis 6 au lieu de 7 |
| L057 | appuyé | Ce défaut s'appelle une condition de course. Il ne lève aucune exception, et il n'apparaît pas à chaque exécution. | Condition de course : aucune erreur |
| L058 | explicatif | Le danger vient de l'état modifiable partagé : un compteur, une liste, une position de lecture, un fichier ouvert. Sans état modifiable, il n'y a rien à protéger. | État modifiable en rouge, sans état en vert |
| L059 | explicatif | Dans Spring Batch, qu'est-ce qui est partagé ? Dans un step multithread, il n'y a qu'un reader, qu'un processor et qu'un writer. Chaque thread traite son propre chunk, mais appelle les mêmes objets. | Quatre threads, trois objets partagés |
| L060 | appuyé | Le reader est le plus exposé, parce qu'il a un état par nature : une position de lecture. C'est celui qu'on vient de voir. | Reader : une position |
| L061 | appuyé | Le processor est sûr s'il est sans état. S'il accumule un total ou un compteur dans un champ, c'est une condition de course. | Processor : sûr si sans état |
| L062 | explicatif | Le writer dépend de l'implémentation. JdbcBatchItemWriter est prévu pour plusieurs transactions concurrentes. FlatFileItemWriter ne l'est pas : un seul fichier, un seul tampon. | Writer : JDBC oui, fichier non |
| L063 | attention | Un piège : StepScope ne donne pas un exemplaire par thread. Il donne un exemplaire par exécution de step, partagé entre tous les threads. | `@StepScope` : une instance par step, pas par thread |
| L064 | défi, direct | Question. Ton processor garde un compteur dans un champ entier, et le step utilise quatre threads. Que vaut le compteur à la fin ? | Question « PRÉDIRE » |
| L065 | posé | Un résultat faux, souvent trop petit : les incrémentations se perdent, sans erreur. Et si un chunk est rejoué, il peut aussi être trop grand. | Choix « faux » en vert |
| L066 | technique | Les remèdes : un processor sans état, un AtomicLong si tu dois vraiment compter, ou mieux, les compteurs de la StepExecution que Spring Batch tient lui-même. | Trois remèdes |
| L067 | règle | La règle : un composant partagé entre threads ne garde aucun état modifiable. Sinon, tu le protèges, ou tu partitionnes : chaque partition a ses propres exemplaires. | Phrase encadrée |

### Scène 5 : AsyncItemProcessor (7.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L068 | besoin | Mon besoin : accélérer un processor lent, sans toucher à la lecture. | Processor lent |
| L069 | explicatif | AsyncItemProcessor décore ton processor, et exécute chaque process sur un thread. Il vit dans spring-batch-integration. | Code : `new AsyncItemProcessor<>()` |
| L070 | technique | On lui donne le vrai traitement avec setDelegate, et le pool avec setTaskExecutor. | `setDelegate(bankProcessor)`, `setTaskExecutor(…)` |
| L071 | appuyé | Et le writer asynchrone va toujours avec : il déballe les Future, et passe les résultats au writer réel. | `new AsyncItemWriter<>()` |
| L072 | appuyé | Le type de sortie du chunk change : c'est un Future de BankTransaction. | `<RawTransaction, Future<BankTransaction>>chunk(100)` |
| L073 | explicatif | Un ordre de grandeur : cinq millisecondes par élément, sur un million d'éléments. Environ une heure vingt-trois en séquentiel. | 5 ms × 1 M = 1 h 23 |
| L074 | explicatif | Réparti sur huit threads, environ dix minutes, si le reste ne devient pas le goulot. | 8 threads : ≈ 10 min |
| L075 | défi, direct | Question. Le processor est rapide, mais l'écriture est lente. L'AsyncItemProcessor aide-t-il ? | Question « PRÉDIRE » |
| L076 | posé | Non : lecture et écriture restent séquentielles. Il ne parallélise que le processor. | Goulot : writer |

### Scène 6 : Le partitionnement local (7.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L077 | besoin | Mon besoin : traiter un gros volume sur un serveur, avec une reprise précise. | Gros volume |
| L078 | explicatif | Le principe : un step maître découpe les données en plages disjointes. | Maître : partition(gridSize = 4) |
| L079 | explicatif | Pour chaque plage, un step ouvrier complet s'exécute, avec reader, processor et writer, et sa propre StepExecution. | Quatre ouvriers |
| L080 | technique | Quatre plages : un à deux mille cinq cents, deux mille cinq cent un à cinq mille, et ainsi de suite jusqu'à dix mille. | Plages 1–2500, … |
| L081 | explicatif | À la fin, le maître agrège les statuts : COMPLETED, ou FAILED. | Agrégation |
| L082 | technique | Le découpage : une classe qui implémente Partitioner. Elle reçoit gridSize, une indication, c'est toi qui la fixes. | Code : `implements Partitioner` |
| L083 | technique | On lit le minimum et le maximum des identifiants dans la table. | `SELECT MIN(id)`, `MAX(id)` |
| L084 | technique | ceilDiv : un arrondi supérieur, pour que les plages couvrent tout l'intervalle, sans trou. | `Math.ceilDiv(max - min + 1, gridSize)` |
| L085 | appuyé | Chaque identifiant appartient à exactement une plage. Pas de chevauchement. | Plages disjointes |
| L086 | technique | Une partition est un ExecutionContext : il porte la plage, minId et maxId. | `context.putLong("minId", start)` |
| L087 | appuyé | Le nom de la partition doit être unique et déterministe : au restart, c'est lui qui la retrouve. | `"partition" + i` |
| L088 | technique | Le step ouvrier : un reader en StepScope, qui lit sa plage dans le contexte du step ouvrier, et pas dans les paramètres du job. | `@Value("#{stepExecutionContext['minId']}")` |
| L089 | appuyé | C'est ce qui rend chaque ouvrier différent. D'où StepScope, comme au module deux. | Chaque ouvrier : sa plage |
| L090 | technique | Le step maître : partitioner, avec le nom du step ouvrier et le découpeur. | `.partitioner("loadWorkerStep", partitioner)` |
| L091 | technique | Le step ouvrier à exécuter pour chaque plage, et gridSize, le nombre de partitions. | `.step(loadWorkerStep).gridSize(4)` |
| L092 | appuyé | Et taskExecutor. Sans exécuteur, tout s'exécute dans un seul thread : l'exécuteur par défaut est synchrone. | `.taskExecutor(partitionExecutor)` |
| L093 | appuyé | Le partitionnement fonctionne, mais sans aucun gain. Aucune erreur, aucun avertissement. | Aucun gain, sans erreur |
| L094 | technique | Le pool : borné, nommé, aussi grand que le nombre de partitions simultanées, et plus petit que le pool de connexions. | Pool de 4, connexions > 4 |
| L095 | explicatif | On peut avoir seize partitions et quatre threads : les partitions sont servies quatre par quatre. | 16 partitions, 4 threads |
| L096 | explicatif | Un thread, une StepExecution, ses propres transactions et connexions. Le pool de connexions doit être dimensionné en conséquence. | Un thread = une StepExecution |
| L097 | explicatif | En base, une ligne pour le maître, et une par partition : loadWorkerStep deux points partition zéro, et ainsi de suite. | Lignes `loadWorkerStep:partition0…3` |
| L098 | appuyé | Les compteurs du maître sont la somme de ceux des partitions. | Somme des compteurs |
| L099 | défi, direct | Question. Avec min égal un, max égal dix mille et quatre partitions, quelles sont les plages ? | Question « PRÉDIRE » |
| L100 | posé | Un à deux mille cinq cents, deux mille cinq cent un à cinq mille, cinq mille un à sept mille cinq cents, sept mille cinq cent un à dix mille. | Quatre plages |
| L101 | défi, direct | Et avec max égal dix mille deux ? Combien d'identifiants dans la dernière plage ? | Question « PRÉDIRE » |
| L102 | posé | La taille devient deux mille cinq cent un. La dernière plage va de sept mille cinq cent quatre à dix mille deux : deux mille quatre cent quatre-vingt-dix-neuf identifiants. | Plages recalculées |
| L103 | pont | Voyons maintenant ce qui se passe au restart d'un job partitionné. | Titre « 7.6 Restart et chevauchement » |

### Scène 7 : Partitionnement, restart et chevauchement (7.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L104 | besoin | Mon besoin : qu'une partition en échec soit reprise, sans rejouer celles qui ont réussi. | Une partition FAILED |
| L105 | explicatif | Si un ouvrier échoue, le maître échoue. Au restart, seule la partition échouée est rejouée. | Partition 2 rouge |
| L106 | appuyé | C'est le nom déterministe de la partition qui permet de la retrouver. Un nom aléatoire casserait la reprise. | Nom stable |
| L107 | explicatif | Chaque partition a son propre contexte : sa position de lecture est sauvegardée à chaque commit, comme au module trois. | Position par partition |
| L108 | règle | Pour une reprise précise sur un gros volume, le partitionnement bat le multithread. | Partition > multithread |
| L109 | appuyé | Le piège majeur : des plages qui se chevauchent, ou qui laissent un trou. Des lignes traitées deux fois, ou jamais. | Chevauchement rouge |
| L110 | explicatif | Un test : pour plusieurs jeux de bornes, vérifier que chaque identifiant est dans exactement une plage. | Test des plages |
| L111 | technique | Et que la première plage commence au minimum, que la dernière finit au maximum. | Bornes aux extrémités |
| L112 | défi, direct | Question. Les plages se chevauchent de dix identifiants. Que se passe-t-il ? | Question « PRÉDIRE » |
| L113 | posé | Dix lignes traitées deux fois : des doublons, ou des totaux faux. Sans aucune erreur. | Zone de recouvrement rouge |
| L114 | pont | Et si une seule machine ne suffit plus ? Passons au distribué. | Titre « 7.7 Distribué » |

### Scène 8 : Distribué et remote chunking, théorie (7.7)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L115 | besoin | Mon besoin : répartir les partitions sur plusieurs serveurs. Cette partie est théorique : le code vient des classes de Spring Batch six, sans exécution. | Badge « théorique » |
| L116 | explicatif | Même découpage, mais chaque partition est envoyée par un message à un autre serveur. Seules les métadonnées voyagent : la plage. | Messages avec la plage |
| L117 | technique | Côté maître : RemotePartitioningManagerStepBuilderFactory. En version quatre, on disait Master. On lui donne le partitioner, et des canaux. | Code : `RemotePartitioningManagerStepBuilderFactory` |
| L118 | technique | Un canal de sortie pour les requêtes, un canal d'entrée pour les réponses. | `.outputChannel(requests).inputChannel(replies)` |
| L119 | technique | Côté ouvrier : RemotePartitioningWorkerStepBuilderFactory, avec un canal d'entrée et un canal de sortie. | Code : `RemotePartitioningWorkerStepBuilderFactory` |
| L120 | technique | EnableBatchIntegration active les builders. Les canaux sont reliés à un courtier de messages, RabbitMQ, Kafka, par Spring Integration. | `@EnableBatchIntegration` |
| L121 | appuyé | Le job ne doit exister que sur le profil manager. Sinon, avec un seul jar, Spring Boot lancerait le job aussi sur chaque ouvrier. | `@Profile("manager")` |
| L122 | appuyé | Tous les serveurs partagent le même JobRepository : c'est là que vit l'état de chaque partition. | Une base partagée |
| L123 | appuyé | Un ouvrier exécute son step hors du contexte du job. Tout ce qu'il lui faut doit être dans le contexte de sa partition. | Contexte de partition |
| L124 | appuyé | Et le courtier doit offrir une livraison garantie : des messages persistants. | Messages persistants |
| L125 | explicatif | Il existe aussi un partitionnement à lancement dynamique, avec Spring Cloud Task, qui lance de nouvelles instances à la demande. | Instances à la demande |
| L126 | explicatif | Autre approche : le remote chunking. Ici, c'est le maître qui lit. Il envoie les éléments aux ouvriers, qui traitent et écrivent. | Maître : lit → ouvriers : processor + writer |
| L127 | appuyé | À réserver au cas où le processor est le goulot. Si l'I/O est le goulot, les données transitent par le réseau : c'est plus lent qu'avant. | Réseau = nouveau goulot |
| L128 | défi, direct | Question. Le goulot est l'écriture en base. Remote chunking ou partitionnement ? | Question « PRÉDIRE » |
| L129 | posé | Partitionnement : chaque ouvrier lit et écrit sa plage. Le remote chunking ferait transiter toutes les données par le réseau. | Choix « partitionnement » |
| L130 | pont | Reste la dernière approche : des instances interchangeables, qui se partagent une file. | Titre « 7.8 SKIP LOCKED » |

### Scène 9 : Multi-instance, SKIP LOCKED et bail (7.8)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L131 | besoin | Mon besoin : des lignes arrivent en continu, plusieurs instances tournent, et chacune doit prendre des lignes que les autres ne prennent pas. | Table de travail, deux instances |
| L132 | explicatif | Première idée : un verrou distribué. Complexe et fragile. Deuxième idée : laisser la base arbitrer, avec SKIP LOCKED. | Verrou distribué barré |
| L133 | technique | La table de travail : un statut NEW, CLAIMED, DONE, une colonne claimed by, une colonne claimed at. | SQL : `status`, `claimed_by`, `claimed_at` |
| L134 | technique | Et un index sur le statut, la date de réservation, et l'identifiant. | `CREATE INDEX idx_staging_claim …` |
| L135 | explicatif | La réservation, en une requête atomique : un UPDATE, dont la sous-requête sélectionne les lignes. | SQL : `UPDATE … WHERE id IN (SELECT …)` |
| L136 | appuyé | FOR UPDATE SKIP LOCKED : la sous-requête verrouille les lignes sélectionnées. Les lignes déjà verrouillées par une autre transaction sont sautées, pas attendues. | `FOR UPDATE SKIP LOCKED` |
| L137 | explicatif | Deux instances qui réservent en même temps obtiennent des lignes différentes, sans jamais se bloquer. | A prend les lignes 1 à 4, B les suivantes |
| L138 | appuyé | Et le bail : une ligne CLAIMED depuis trop longtemps redevient disponible. Sans cela, un crash laisserait des lignes réservées pour toujours. | `claimed_at < now() - lease` |
| L139 | technique | Le reader : un TransactionTemplate, en REQUIRES NEW. La réservation est validée tout de suite, dans sa propre transaction. | Code : `PROPAGATION_REQUIRES_NEW` |
| L140 | explicatif | Le verrou n'est tenu que le temps de la réservation. Ensuite, c'est une ligne marquée, qui appartient à cette instance. | Verrou court |
| L141 | technique | La méthode read est synchronisée : elle remplit un tampon par une réservation, puis sert les éléments un par un. | Code : `public synchronized RawTransaction read()` |
| L142 | explicatif | Un tampon vide déclenche une réservation de lot. Poll retourne null quand il n'y a plus rien. | `buffer.poll()` |
| L143 | défi, direct | Question. Une instance réserve cent lignes, puis plante. Que deviennent ces lignes ? | Question « PRÉDIRE » |
| L144 | posé | Elles restent CLAIMED, jusqu'à l'expiration du bail : alors une autre instance les reprend. Sans bail, elles seraient perdues. | Bail expiré, lignes reprises |
| L145 | explicatif | Comment SKIP LOCKED règle la concurrence : une seule requête, un verrou de ligne, jamais d'attente. | Verrou de ligne |
| L146 | explicatif | Comparaison : sans SKIP LOCKED, la deuxième instance attend la première, ou elle prend les mêmes lignes. | Attente ou doublon |
| L147 | pont | Voyons comment le JobRepository gère lui-même la concurrence entre instances. | Titre « 7.9 JobRepository » |

### Scène 10 : Concurrence sur le JobRepository (7.9)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L148 | explicatif | Trois mécanismes. L'isolation de création SERIALIZABLE : elle protège contre deux lancements simultanés du même job. | Mécanisme 1 |
| L149 | explicatif | La vérification des exécutions en cours : elle lève JobExecutionAlreadyRunningException. | Mécanisme 2 |
| L150 | explicatif | La colonne version : le verrouillage optimiste, contre deux écritures concurrentes sur la même ligne. | Mécanisme 3 |
| L151 | appuyé | En multi-instance, une OptimisticLockingFailureException signale que deux processus écrivent la même StepExecution. | Deux écritures, même ligne |
| L152 | appuyé | Un message livré deux fois, une reprise lancée en parallèle. Ne la masque pas : c'est un signal. | Signal à ne pas masquer |
| L153 | explicatif | Un scénario : un message de partition est livré en double. Deux ouvriers exécutent la même partition. | Message en double |
| L154 | appuyé | Le deuxième écrit une StepExecution déjà modifiée : l'exception tombe. C'est le verrouillage optimiste qui fait son travail. | Exception en rouge |
| L155 | pont | Voyons maintenant les dix pièges. | Titre « Top 10 » |

### Scène 11 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L156 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L157 | appuyé | Un : un reader non thread-safe partagé entre threads. Lignes sautées ou dupliquées, sans erreur. | Ligne 1 |
| L158 | pédagogue | Comment le repérer : un total qui diffère de la source, sans exception. | Extrait indicatif : source `1000000`, destination `999 412` |
| L159 | appuyé | Deux : un singleton avec état en multithread. Résultats aléatoires. | Ligne 2 |
| L160 | pédagogue | Comment le repérer : un résultat différent à chaque lancement, sur les mêmes données. | Extrait indicatif : `total = 1 187,00  puis  1 203,50` |
| L161 | appuyé | Trois : un pool de threads mal dimensionné. SimpleAsyncTaskExecutor illimité, ou un pool supérieur au pool de connexions. | Ligne 3 |
| L162 | pédagogue | Comment le repérer : une base saturée, des connexions qui expirent. | Extrait indicatif : `HikariPool: Connection is not available, request timed out` |
| L163 | appuyé | Quatre : une OptimisticLockingFailureException en multi-instance. Ne la masque pas. | Ligne 4 |
| L164 | pédagogue | Comment le repérer : l'exception sur la table des steps, avec deux exécuteurs de la même partition. | Extrait indicatif : `OptimisticLockingFailureException … batch_step_execution` |
| L165 | appuyé | Cinq : des plages de partitionnement qui se chevauchent, ou qui laissent un trou. | Ligne 5 |
| L166 | pédagogue | Comment le repérer : des doublons en base, ou des lignes jamais traitées. | Extrait indicatif : `count = 1 000 010   (attendu 1 000 000)` |

### Scène 12 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L167 | pont | Les cinq suivants touchent l'exécuteur, la reprise, le remote chunking, le bail et les profils. | Tableau, lignes 6 à 10 |
| L168 | appuyé | Six : un partitionnement sans TaskExecutor. L'exécuteur est synchrone : aucun gain. | Ligne 6 |
| L169 | pédagogue | Comment le repérer : tous les journaux sur un seul thread, et la même durée qu'avant. | Extrait indicatif : `[main] loadWorkerStep:partition0 … partition1 …` |
| L170 | appuyé | Sept : du multithread avec reprise. SaveState oublié, ou position sauvegardée dans le désordre. | Ligne 7 |
| L171 | pédagogue | Comment le repérer : un restart qui repart au mauvais endroit. | Extrait indicatif : `read.count = 300` alors que les chunks 4 et 5 sont écrits |
| L172 | appuyé | Huit : du remote chunking quand l'I/O est le goulot. Plus lent qu'avant. | Ligne 8 |
| L173 | pédagogue | Comment le repérer : un réseau saturé, un débit inférieur à la version locale. | Extrait indicatif : `débit : 4 200 → 1 900 lignes/s` |
| L174 | appuyé | Neuf : SKIP LOCKED sans bail. Un crash laisse des lignes réservées pour toujours. | Ligne 9 |
| L175 | pédagogue | Comment le repérer : des lignes CLAIMED très anciennes, que personne ne traite. | Extrait indicatif : `status = CLAIMED   claimed_at = il y a 3 jours` |
| L176 | appuyé | Dix : le job démarré sur chaque ouvrier. Un seul jar, pas de profil. | Ligne 10 |
| L177 | pédagogue | Comment le repérer : le même job qui tourne sur le maître et sur chaque ouvrier. | Extrait indicatif : `Job: [name=bankJob] launched` sur trois machines |
| L178 | pédagogue | Pourquoi on y tombe : parce que chaque approche semble simple en démonstration, avec un seul serveur, une seule base, et peu de données. | Démo simple, production complexe |

### Scène 13 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L179 | pédagogue | Reprenons notre rapprochement de six heures. Tu sais maintenant quoi mesurer, et quelle approche choisir. | Deadline 06:00 |
| L180 | récapitulatif | Mesurer d'abord. Le multithread pour un reader sûr. L'asynchrone pour un processor lent. | Trois pastilles |
| L181 | récapitulatif | Le partitionnement pour un gros volume avec reprise précise. Le remote chunking quand le processor est le goulot. | Deux pastilles |
| L182 | récapitulatif | SKIP LOCKED avec un bail pour des instances interchangeables. | Pastille |
| L183 | défi | Quatre exercices. Un : un job de quarante minutes lit un fichier unique de quatre gigaoctets, applique un calcul lent de trente millisecondes à chaque ligne, puis écrit en base. Quel goulot, et quelles approches ? | Exercice 1 |
| L184 | défi | Deux : avec min un, max dix mille et quatre partitions, quelles plages ? Et avec max dix mille deux ? | Exercice 2 |
| L185 | défi | Trois : un collègue active le partitionnement avec huit partitions et ne voit aucune amélioration. Quelle ligne manque ? | Exercice 3 |
| L186 | défi | Quatre : une instance plante après avoir réservé cent lignes. Que se passe-t-il, avec et sans bail ? | Exercice 4 |
| L187 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L188 | explicatif | Correction un. Le goulot est le calcul de trente millisecondes par ligne : c'est le processor. AsyncItemProcessor, ou remote chunking. Pas un reader multithread sur un fichier unique. | Exercice 1 |
| L189 | explicatif | Correction deux. Plages de deux mille cinq cents. Avec dix mille deux, la taille devient deux mille cinq cent un, et la dernière plage contient deux mille quatre cent quatre-vingt-dix-neuf identifiants. | Exercice 2 |
| L190 | explicatif | Correction trois. Le taskExecutor manque : l'exécuteur par défaut est synchrone. On le voit dans les journaux, sur un seul thread. | Exercice 3 |
| L191 | explicatif | Correction quatre. Sans bail, les lignes restent réservées pour toujours. Avec bail, une autre instance les reprend à l'expiration. | Exercice 4 |
| L192 | transition | Au dernier module, tu passes en production : tests, supervision, déploiement, et Kubernetes. | Aperçu « production » |
