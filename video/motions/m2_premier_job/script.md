# Module 2 : Premier job et cycle de vie

Vidéo de formation Spring Batch. Durée visée : 45 minutes, en six parties (2.1 à 2.6). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_2.md`. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Flashback et ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Imagine que ton premier job tourne parfaitement, le lundi. Le mardi, le rapport affiche un total deux fois trop grand. Aucune erreur dans les journaux. | Rapport lundi : 100 ; mardi : 200 en rouge, journal vide |
| L002 | pédagogue | Ce bug existe. Il s'appelle le double comptage, et il vient d'un seul mot : singleton. On va le provoquer, le comprendre, et l'éviter. | Mot « singleton » qui s'allume en rouge |
| L003 | rappel | Avant, trois rappels du premier module. Le JobRepository écrit dans PostgreSQL chaque début et chaque fin de job et de step. | Cylindre PostgreSQL, flèches depuis Job et Step |
| L004 | rappel | Une JobInstance, c'est un job plus ses paramètres identifiants. Mêmes paramètres, même instance, et si elle est terminée, on ne la rejoue pas. | Équation Job + paramètres = JobInstance, cadenas |
| L005 | rappel | Et le JobOperator étend le JobLauncher : il offre start, restart, stop et abandon. | Boîte JobOperator avec quatre verbes |
| L006 | annonce | La question de ce module : comment écrire un vrai premier job, et comment le lancer sans surprise ? Six étapes pour y répondre. | Six pastilles 2.1 à 2.6 qui s'allument |

### Scène 1 : Les deux modèles d'un step (2.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L007 | besoin | Mon besoin : exécuter un traitement dans un job. Mais un traitement, ça peut vouloir dire deux choses très différentes. | Job vide avec un step et un point d'interrogation |
| L008 | explicatif | Première chose : une action unique. Nettoyer une table, déplacer un fichier, appeler un service. On fait ça une fois, et c'est fini. | Carte « action unique » avec trois icônes |
| L009 | explicatif | Deuxième chose : un grand nombre d'éléments à lire, à transformer et à écrire, par paquets. Un million de lignes d'un fichier vers une base. | Carte « grand volume » avec flux de lignes |
| L010 | technique | Spring Batch propose un modèle pour chacun. Pour l'action unique, la tasklet. Pour le volume, le chunk. | Tableau Tasklet / Chunk, deux colonnes |
| L011 | technique | Le chunk, on le verra au module suivant. Il s'appuie sur trois interfaces : un lecteur, un processeur et un écrivain. | Colonne Chunk : reader, processor, writer |
| L012 | technique | La tasklet, elle, n'a qu'une seule méthode. Une seule action, dans une seule transaction. | Colonne Tasklet : une boîte « execute » |
| L013 | explicatif | Un détail important : si la tasklet retourne CONTINUABLE, Spring Batch la rappelle, dans une nouvelle transaction. Avec FINISHED, le step est terminé. | Flèche en boucle sur la tasklet, transactions 1, 2, 3 |
| L014 | règle | Retiens : une tasklet, c'est une action dans une transaction. Un chunk, c'est une boucle lire, traiter, écrire. | Deux encadrés opposés |
| L015 | défi, direct | Question rapide. Tu dois supprimer chaque nuit les lignes de plus de trente jours dans une table. Tasklet ou chunk ? | Question « PRÉDIRE » |
| L016 | posé | Une tasklet : c'est une seule instruction, pas un flux d'éléments à lire et à écrire. Si tu devais transformer chaque ligne, ce serait un chunk. | Choix « tasklet » en vert |
| L017 | pont | Reste une question : qui déclenche tout ça ? Regarde la chaîne complète. | Schéma déclencheur → JobOperator → Job → JobRepository |
| L018 | explicatif | À gauche, un déclencheur : une ligne de commande, un appel REST, un planificateur. Ce n'est pas Spring Batch. | Boîte « déclencheur » en orange |
| L019 | explicatif | Au milieu, le JobOperator, qui lance. Puis le job et ses steps, qui s'exécutent. Et le JobRepository, qui enregistre tout dans PostgreSQL. | Les trois boîtes suivantes s'allument |
| L020 | règle | Un batch n'est pas un planificateur. Spring Batch exécute et enregistre. Quelqu'un d'autre décide de l'heure. | Horloge cron, Kubernetes à côté |
| L021 | récapitulatif | En résumé : deux modèles de step, et un lanceur qui n'est pas un planificateur. Passons au premier : écrivons une tasklet. | Pastilles récapitulatives |

### Scène 2 : La tasklet, classe explicite (2.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L022 | besoin | Mon besoin : une tasklet qui affiche un message avec la date de traitement. Et que je puisse tester seule. | Fenêtre PrintMessageTasklet.java vide |
| L023 | explicatif | Au premier module, on a écrit une lambda. Cette fois, une classe, parce qu'une classe a un nom, des dépendances injectées, et se teste seule. | Lambda barrée, classe à côté |
| L024 | technique | Je commence par Component : Spring détecte la classe au démarrage et en fait un bean. Sans cela, il faudrait la déclarer à la main. | Code tapé : `@Component` |
| L025 | explicatif, appuyé | Puis StepScope. Retiens cette annotation : on y revient en détail. Le bean n'est pas créé au démarrage, mais à chaque exécution du step. | Code tapé : `@StepScope`, flèche vers « à chaque step » |
| L026 | technique | La classe implémente Tasklet, qui n'a qu'une méthode : execute. | Code tapé : `implements Tasklet` |
| L027 | technique | Un journal, parce qu'en batch les logs sont souvent la seule interface visible. | Code tapé : `Logger log` |
| L028 | technique | Un champ final pour la date : sa valeur est fixée à la construction, et ne change plus pendant l'exécution. | Code tapé : `private final String runDate;` |
| L029 | appuyé | Et le constructeur reçoit la date par une expression, jobParameters runDate. C'est du SpEL, le langage d'expression de Spring. | Code tapé : `@Value("#{jobParameters['runDate']}")` |
| L030 | explicatif | Cette expression est évaluée au moment où le step démarre, quand les paramètres du lancement sont connus. | Chronologie : démarrage de l'application, puis lancement avec paramètres |
| L031 | explicatif | Au démarrage de l'application, ces paramètres n'existent pas encore. Sans StepScope, l'expression échoue. | Flèche vers « n'existent pas encore », erreur rouge |
| L032 | technique | La méthode execute reçoit la contribution du step et le contexte du chunk. | Code tapé : signature de `execute` |
| L033 | technique | Avec la contribution, j'accède à la StepExecution : son nom, ses compteurs, son contexte. | Code tapé : `contribution.getStepExecution().getStepName()` |
| L034 | règle | Et je retourne FINISHED : le step est terminé. CONTINUABLE rappellerait la méthode, dans une nouvelle transaction. | Code tapé : `return RepeatStatus.FINISHED;` |
| L035 | défi, direct | Question. Que se passe-t-il si je retire StepScope, mais que je garde l'expression avec jobParameters ? | Question « PRÉDIRE » |
| L036 | posé | Le contexte ne démarre pas : au moment de créer le bean, les paramètres du lancement n'existent pas. L'erreur arrive avant même qu'un job soit lancé. | Terminal : erreur au démarrage du contexte |
| L037 | récapitulatif | En résumé : une classe, un bean, StepScope, une date reçue par SpEL, et FINISHED. | Cinq pastilles |
| L038 | pont | La tasklet est écrite. Il faut maintenant l'attacher à un step, et le step à un job. | Titre « 2.3 Le step et le job » |

### Scène 3 : Le step et le job avec les builders 6 (2.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L039 | besoin | Mon besoin : un job qui contient un step qui exécute cette tasklet. Et sans fabrique : les builders de la version six. | Fenêtre HelloJobConfig.java vide |
| L040 | explicatif | Je déclare une classe de configuration : ses méthodes Bean fabriquent des objets gérés par Spring. | Code tapé : `@Configuration` |
| L041 | explicatif | Chaque méthode Bean produit un bean, singleton par défaut. Ici, le step et le job sont des descriptions immuables : un singleton convient très bien. | Code tapé : `@Bean`, étiquette « singleton » en vert |
| L042 | technique | Le JobRepository du premier module est injecté par type. | Code tapé : `JobRepository jobRepository` |
| L043 | technique | Le gestionnaire de transactions encadrera la tasklet. | Code tapé : `PlatformTransactionManager` |
| L044 | appuyé | Et la tasklet est injectée aussi. Mais attention : ce que tu reçois n'est pas l'objet réel. C'est un proxy. On y revient dans la partie cinq. | Code tapé : `PrintMessageTasklet tasklet`, étiquette « proxy » en orange |
| L045 | technique | StepBuilder, avec un nom et le dépôt. En version six, on construit directement le builder : il n'y a plus de fabrique. | Code tapé : `new StepBuilder("printMessageStep", jobRepository)` |
| L046 | technique | Puis tasklet, avec la tasklet et son gestionnaire de transactions. Et build produit le step. | Code tapé : `.tasklet(tasklet, transactionManager).build()` |
| L047 | explicatif | Le job, maintenant. Spring injecte le step par type, et par son nom de méthode quand il y en a plusieurs. | Code tapé : bean `helloJob` |
| L048 | technique | JobBuilder, avec le nom du job. C'est ce nom que tu retrouveras dans la table des instances. | `new JobBuilder("helloJob", jobRepository)` surligné |
| L049 | technique | Start désigne le premier step. Plus tard, on enchaînera avec next. Et build produit le job. | `.start(printMessageStep).build()` |
| L050 | règle | Un job, un step, une tasklet, et aucune fabrique. Voilà ce qui a changé par rapport aux versions précédentes. | Tableau « v5 : StepBuilderFactory » barré, « v6 : StepBuilder » |
| L051 | défi, direct | Dans la table des instances, quel nom de job vois-tu apparaître après un lancement : le nom de la classe, du bean, ou celui passé au builder ? | Question « PRÉDIRE » |
| L052 | posé | Celui passé au JobBuilder : helloJob. Le nom de la classe ou de la méthode n'a aucune importance pour la base. | `helloJob` dans une ligne de `batch_job_instance` |
| L053 | pont | Il reste à lancer ce job. D'abord le plus simple : avec le JobOperator. | Titre « 2.4 Lancer le job » |

### Scène 4 : Lancer avec JobOperator (2.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L054 | besoin | Mon besoin : lancer helloJob pour une date donnée, depuis mon code. | Fenêtre HelloJobService.java vide |
| L055 | explicatif | Je crée un service : un bean de la couche métier, sans état, avec des dépendances en champs final. | Code tapé : `@Service` |
| L056 | technique | J'injecte le JobOperator et le job, par le constructeur. C'est la forme recommandée : pas d'annotation sur les champs. | Code tapé : constructeur |
| L057 | technique | JobParametersBuilder fabrique des paramètres typés. | Code tapé : `new JobParametersBuilder()` |
| L058 | appuyé | Et runDate est un paramètre identifiant par défaut. C'est lui qui définit la JobInstance : retour sur le premier module. | `.addString("runDate", runDate)` surligné |
| L059 | technique | Puis start, qui lance le job, attend la fin, et renvoie l'exécution terminée. | `return jobOperator.start(helloJob, params);` |
| L060 | explicatif | Un lancement synchrone : l'appel ne rend la main qu'à la fin du job. | Chrono qui tourne pendant l'exécution |
| L061 | pédagogue | Pour un job de deux secondes, aucun souci. Pour un job de vingt minutes, ton contrôleur reste bloqué vingt minutes. | Chrono à 20 minutes, requête qui attend |
| L062 | pont | Alors, comment lancer sans bloquer ? | Titre « lancer sans bloquer » |
| L063 | besoin | Mon besoin : une API qui répond tout de suite, pendant que le job tourne, et que je puisse interroger plus tard. | Schéma client → API → job, flèche retour immédiate |
| L064 | explicatif | Première idée : appeler start directement dans le contrôleur. Ça marche, mais la requête attend la fin du job. C'est le piège. | Contrôleur qui attend, délai dépassé en rouge |
| L065 | explicatif | Deuxième idée : on soumet l'appel à un autre thread. Le thread HTTP est libéré immédiatement. | Deux fils : HTTP libéré, job continue |
| L066 | technique | Pour cela, un exécuteur de threads virtuels, disponible depuis Java vingt et un : un thread par lancement, presque sans coût. | Code tapé : `Executors.newVirtualThreadPerTaskExecutor()` |
| L067 | technique | D'abord les deux records : la requête avec la date, et la réponse avec l'adresse où suivre l'exécution. | Code tapé : `record StartRequest`, `record StartResponse` |
| L068 | technique | Un POST, parce que lancer un job modifie l'état du système. Un GET doit pouvoir être rejoué sans effet. | `@PostMapping("/jobs/hello")` |
| L069 | appuyé | Je soumets le lancement à l'exécuteur, puis je réponds tout de suite : deux cent deux, Accepted. | `executor.submit(...)`, `ResponseEntity.accepted()` |
| L070 | explicatif | Ce code signifie : j'ai bien reçu ta demande, le traitement n'est pas terminé. | Étiquette « 202 : reçu, pas terminé » |
| L071 | explicatif | Et la requête de suivi : un GET, en lecture seule. Il interroge le dépôt avec le nom du job et ses paramètres. | Code tapé : `jobRepository.getLastJobExecution("helloJob", params)` |
| L072 | technique | Comme l'état vit dans PostgreSQL, le suivi survit à un redémarrage de l'application. | Flèche vers cylindre PostgreSQL |
| L073 | technique | Et le switch avec case null traite explicitement l'absence d'exécution. | `case null -> "INCONNU"` |
| L074 | appuyé | Attention à un point : dans le lancement asynchrone, si l'appel échoue, personne ne le voit. Il faut journaliser l'exception et lire l'état dans le dépôt. | Bloc catch vide barré en rouge |
| L075 | défi, direct | Question. L'appelant reçoit la main avant la fin du job. Dans quel état est l'exécution à cet instant : STARTING ou STARTED, ou COMPLETED ? | Question « PRÉDIRE » |
| L076 | posé | STARTING ou STARTED. Elle n'est pas terminée. C'est pour cela qu'on interroge ensuite le dépôt. | Ligne de base STARTED |
| L077 | explicatif | Il existe aussi une variante : un lanceur qui crée lui-même le thread, TaskExecutorJobOperator. On la verra en production, plus loin dans la formation. | Tableau « exécuteur applicatif / TaskExecutorJobOperator » |
| L078 | récapitulatif | En résumé : un service sans état, un POST, un deux cent deux, et un suivi par interrogation. | Quatre pastilles |
| L079 | pont | Tout ça repose sur une idée : les beans Spring ne sont pas tous créés de la même façon. C'est la partie la plus importante du module. | Titre « 2.5 Cycle de vie des beans » |

### Scène 5 : Le cycle de vie d'un bean (2.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L080 | besoin | Mon besoin : comprendre à quel moment exact Spring fabrique mes objets. Parce que de là dépend tout ce qui va suivre. | Bean qui apparaît sur une frise |
| L081 | image concrète | Imagine un restaurant. La cuisine prépare un plat, le serveur l'apporte, le client le mange, et on débarrasse. Un bean suit les mêmes étapes. | Cuisine, serveur, table, plonge |
| L082 | technique | Un : l'instanciation. Spring appelle le constructeur. Deux : l'injection des dépendances. | Étapes 1 et 2 de la frise |
| L083 | technique | Trois : les callbacks de type Aware, comme BeanNameAware, qui donnent au bean accès à son environnement. | Étape 3 |
| L084 | technique | Quatre : le post-processeur, avant l'initialisation. Cinq : l'initialisation elle-même, avec PostConstruct. | Étapes 4 et 5 |
| L085 | appuyé | Six : le post-processeur, après l'initialisation. C'est ici, et seulement ici, que les proxys sont créés. | Étape 6 en orange, étiquette « proxys » |
| L086 | technique | Sept : le bean est prêt. Huit : à l'arrêt du contexte, il est détruit, avec PreDestroy. | Étapes 7 et 8 |
| L087 | règle | Retiens deux conséquences. Ce que tu reçois par injection est parfois un proxy, pas ton objet. Et une action qui dépend des paramètres du lancement ne peut pas se faire à l'étape deux d'un singleton. | Deux encadrés |
| L088 | explicatif | Pourquoi ? Parce qu'à l'étape deux, aucun lancement n'a encore eu lieu. Il n'y a pas encore de paramètres à lire. | Frise : paramètres apparaissent après l'étape 7 |
| L089 | défi, direct | Question. À quelle étape le proxy d'un bean StepScope est-il créé ? | Question « PRÉDIRE » |
| L090 | posé | À l'étape six, après l'initialisation. La vraie instance, elle, n'est créée qu'au démarrage du step. | Étape 6 clignote |
| L091 | pont | Voyons maintenant ce que Spring fait de différent entre un singleton et un bean en StepScope. | Deux colonnes : singleton / StepScope |

### Scène 6 : Singleton contre StepScope et proxy (2.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L092 | explicatif | Par défaut, un bean est un singleton : un seul objet pour toute l'application, créé au démarrage, partagé par tous les appelants. | Boîte « une instance pour toujours » |
| L093 | appuyé | Partagé par tous les threads et tous les lancements. Donc tout champ modifiable est un état partagé. | Trois lancements qui pointent vers la même boîte |
| L094 | explicatif | Avec StepScope, Spring change de stratégie. Au démarrage, il ne crée pas la tasklet. Il crée à la place un proxy. | Proxy gris qui apparaît à la place |
| L095 | technique | Un proxy, c'est une sous-classe générée, qui prend la place du bean dans tous les points d'injection. | Proxy relié aux points d'injection |
| L096 | technique | Quand le step démarre, le proxy demande au contexte d'instancier la vraie tasklet. À ce moment, l'expression jobParameters peut être résolue. | Flèche proxy → instance 1 |
| L097 | technique | Chaque appel de méthode sur le proxy est délégué à l'instance de l'exécution courante. | Appel qui traverse le proxy |
| L098 | explicatif | Et à la fin du step, l'instance est détruite. L'exécution suivante en aura une neuve. | Instance 1 qui s'efface, instance 2 qui apparaît |
| L099 | règle | Le proxy vit toujours, les instances sont éphémères. | Schéma mémoire JVM : proxy permanent, instances 1, 2, 3 |
| L100 | pédagogue | Un dernier détail, qui vient du proxy : si une méthode appelle une autre méthode de la même classe, l'appel contourne le proxy. | Appel interne qui évite le proxy, en rouge |
| L101 | règle | Pour avoir la bonne instance, injecte le bean depuis l'extérieur. | Flèche verte depuis l'extérieur |
| L102 | pont | Voyons maintenant ce qui se passe quand on oublie tout cela. Je vais te montrer le bug du double comptage. | Titre « Le double comptage » |

### Scène 7 : La démonstration du double comptage (2.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L103 | besoin | Mon besoin : une tasklet qui compte les éléments traités. Cent éléments à chaque lancement. | Code : classe CountingTasklet |
| L104 | explicatif | Voici le code. Un champ processed, initialisé à zéro. À chaque exécution, j'ajoute cent, et j'affiche le total. | Code tapé : `private int processed = 0;` |
| L105 | explicatif | Cette classe est un Component, sans StepScope. Donc un singleton. | Étiquette « singleton » en rouge |
| L106 | appuyé | Premier lancement : cent éléments traités, le journal affiche cent. Parfait. | Terminal : `Total traité : 100` en vert |
| L107 | appuyé | Deuxième lancement, dans la même application : cent éléments traités. Mais le journal affiche deux cents. | Terminal : `Total traité : 200` en rouge |
| L108 | pédagogue | Aucune exception, aucun avertissement. Le rapport double alors que rien n'a été traité en plus. | Rapport : 200, journal vide |
| L109 | explicatif | Pourquoi ? Parce que le singleton survit entre deux lancements, et qu'il garde son champ. | Boîte singleton avec compteur qui monte |
| L110 | défi, direct | Question. Troisième lancement, toujours cent éléments. Qu'affiche le journal ? | Question « PRÉDIRE » |
| L111 | posé | Trois cents. Le compteur continue de grandir à chaque lancement, tant que l'application reste vivante. | Compteur 300 en rouge |
| L112 | explicatif | Trois parades, par ordre de préférence. Première : pas d'état dans les composants partagés. Le compteur vit dans la StepExecution ou dans l'ExecutionContext. | Carte 1 : « pas d'état » |
| L113 | explicatif | Deuxième : StepScope. Le composant est neuf à chaque exécution du step. | Carte 2 : `@StepScope` |
| L114 | explicatif | Troisième : réinitialiser l'état au début de chaque exécution. C'est fragile : on finit toujours par l'oublier. | Carte 3 en orange |
| L115 | pédagogue | Et un test qui lance le job une seule fois passe toujours. Le bug n'apparaît qu'au deuxième lancement, dans la même application. | Test vert une fois, rouge au deuxième lancement |
| L116 | règle | Tout test d'un job qui garde un état doit lancer le job au moins deux fois. | Phrase encadrée |
| L117 | pont | On y reviendra avec les processeurs. Reste un dernier point : ce que Spring Boot fait, tout seul, au démarrage. | Titre « 2.6 Démarrage Boot » |

### Scène 8 : Le démarrage de Spring Boot (2.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L118 | besoin | Mon besoin : démarrer mon application sans que mes jobs partent tout seuls. | Application qui démarre, jobs qui partent |
| L119 | explicatif | Par défaut, Spring Boot lance tous les jobs déclarés au démarrage, une seule fois, sans paramètre. | Trois jobs lancés au démarrage |
| L120 | explicatif | C'est pratique pour un Hello World. C'est dangereux pour une application qui expose une API, ou plusieurs jobs. | Hello World vert, API rouge |
| L121 | technique | Concrètement : après la construction du contexte, mais avant que l'application soit prête à servir. Si le job est long, l'application paraît bloquée au démarrage. | Frise : contexte, jobs, prêt à servir |
| L122 | technique | La propriété spring point batch point job point enabled à false désactive ce comportement. | Terminal : `spring.batch.job.enabled=false` |
| L123 | technique | Et spring point batch point job point name sélectionne un seul job à lancer. | `spring.batch.job.name=helloJob` |
| L124 | explicatif | Sans la première ligne, Spring Boot lancerait helloJob seul à chaque démarrage, sans runDate. L'échec serait journalisé avant même que l'API ne réponde. | Journal : échec au démarrage, en rouge |
| L125 | pédagogue | Il y a pourtant un cas où ce comportement est voulu : un job d'initialisation, qui charge un référentiel une seule fois à l'installation. | Carte « job d'initialisation » |
| L126 | défi, direct | Question. Tu as deux jobs dans l'application et tu veux lancer seulement l'un des deux au démarrage. Quelle propriété ajoutes-tu ? | Question « PRÉDIRE » |
| L127 | posé | Le nom du job : spring point batch point job point name. Et enabled reste à true. | `spring.batch.job.name` surligné |
| L128 | pont | Voyons trois situations réelles où tout cela s'assemble. | Titre « cas d'usage » |

### Scène 9 : Cas d'usage

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L129 | explicatif | Premier cas : l'import du matin. Un CronJob Kubernetes appelle POST jobs hello chaque jour à deux heures, avec la date du jour. | CronJob → POST /jobs/hello |
| L130 | explicatif | L'API répond deux cent deux aussitôt. Le job tourne. Et le tableau de bord appelle le GET pour suivre l'état. | Tableau de bord qui interroge |
| L131 | appuyé | Si le planificateur déclenche par erreur deux fois, le second appel échoue proprement : JobInstanceAlreadyComplete ou JobExecutionAlreadyRunning. | Deuxième appel en rouge, exception |
| L132 | explicatif | Deuxième cas : le job à la demande. Un gestionnaire demande, depuis une interface web, de recalculer les soldes du mois. | Interface web, bouton « recalculer » |
| L133 | explicatif | La requête ne peut pas attendre vingt minutes. Lancement asynchrone, retour immédiat, suivi par interrogation. | Chrono, 202, suivi |
| L134 | explicatif | Troisième cas : le job d'initialisation, qui profite du lancement automatique, avec le nom du job. | Boîte « initialisation », propriété name |
| L135 | pont | Il ne reste plus qu'à voir les dix pièges de ce module. | Titre « Top 10 des pièges » |

### Scène 10 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L136 | pédagogue | Dix pièges, avec pour chacun ce qui se passe et la parade. Les cinq premiers touchent le lancement et le singleton. | Tableau, lignes 1 à 5 |
| L137 | appuyé | Un : oublier de désactiver le lancement automatique. Tous les jobs partent au démarrage, sans paramètre. | Ligne 1 |
| L138 | pédagogue | Comment le repérer : des jobs inattendus dans les journaux au démarrage, avec des paramètres vides. | Extrait indicatif : `Job: [name=helloJob] launched with parameters: [{}]` |
| L139 | appuyé | Deux : lancer un job long de façon synchrone dans une requête HTTP. La requête reste bloquée, le client finit par relancer. | Ligne 2 |
| L140 | pédagogue | Comment le repérer : un client qui expire, et le même job lancé deux fois. | Extrait indicatif : `curl: (28) Operation timed out after 30001 ms` |
| L141 | appuyé | Trois : un champ modifiable dans un singleton. Le double comptage entre deux lancements. | Ligne 3 en rouge |
| L142 | pédagogue | Comment le repérer : un total qui augmente d'un lancement à l'autre, sans autre changement. | Extrait indicatif : `Total traité : 100` puis `Total traité : 200` |
| L143 | appuyé | Quatre : l'expression jobParameters sur un bean qui n'est pas en StepScope. Échec au démarrage du contexte. | Ligne 4 |
| L144 | pédagogue | Comment le repérer : l'application ne démarre pas, avec une erreur sur une propriété jobParameters. | Extrait indicatif : `BeanCreationException … jobParameters` |
| L145 | appuyé | Cinq : appeler une méthode de StepScope depuis la même classe. L'appel contourne le proxy. | Ligne 5 |
| L146 | pédagogue | Comment le repérer : un comportement différent selon qu'on appelle la méthode de l'intérieur ou de l'extérieur. | Extrait indicatif : appel interne, valeur `null` |

### Scène 11 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L147 | pont | Les cinq suivants touchent la tasklet et la gestion des erreurs. | Tableau, lignes 6 à 10 |
| L148 | appuyé | Six : une tasklet qui retourne null au lieu d'un statut. Exception à l'exécution. | Ligne 6 |
| L149 | pédagogue | Comment le repérer : une exception sur le statut de retour, dès la fin de la méthode. | Extrait indicatif : `NullPointerException` après `execute` |
| L150 | appuyé | Sept : une tasklet qui retourne CONTINUABLE sans condition d'arrêt. Boucle infinie, une transaction par tour. | Ligne 7 |
| L151 | pédagogue | Comment le repérer : un job qui ne se termine jamais, et des milliers de validations en base. | Extrait indicatif : `commit_count = 48213` |
| L152 | appuyé | Huit : lancer avec un GET. Un robot, un navigateur ou un préchargement relance le job. | Ligne 8 |
| L153 | pédagogue | Comment le repérer : le job se lance sans que personne ne l'ait demandé. | Extrait indicatif : `GET /jobs/hello 200` dans le journal d'accès |
| L154 | appuyé | Neuf : engloutir l'exception d'un lancement asynchrone. L'échec est invisible. | Ligne 9 |
| L155 | pédagogue | Comment le repérer : un job en échec en base, et aucune trace dans les journaux. | Extrait indicatif : `status = FAILED`, journal vide |
| L156 | appuyé | Dix : un paramètre horodaté, en paramètre identifiant. Chaque relance est une nouvelle instance, et la reprise devient impossible. | Ligne 10 |
| L157 | pédagogue | Comment le repérer : des instances qui se multiplient pour le même jour. | Extrait indicatif : `job_instance_id = 101, 102, 103` |
| L158 | pédagogue | Un bug silencieux typique : un test qui lance le job une fois et passe toujours. | Test vert au 1er lancement |
| L159 | règle | Le double comptage n'apparaît qu'au deuxième lancement, dans la même application. | Test rouge au 2e lancement |

### Scène 12 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L160 | pédagogue | Reprenons notre rapport du mardi, avec son total deux fois trop grand. Tu sais maintenant d'où il vient : un singleton qui garde un champ. | Rapport 200, flèche vers singleton |
| L161 | récapitulatif | Une tasklet est une action dans une transaction. Un step et un job se construisent avec les builders de la version six. | Deux pastilles |
| L162 | récapitulatif | Un lancement synchrone bloque. Un lancement asynchrone rend deux cent deux, et se suit par interrogation. | Deux pastilles |
| L163 | récapitulatif | Un singleton est partagé. Un bean en StepScope est neuf à chaque step, derrière un proxy. | Deux pastilles |
| L164 | défi | Trois exercices pour finir. Un : la classe CountingTasklet est lancée trois fois dans la même application. Qu'affiche-t-elle la troisième fois ? Propose deux corrections. | Exercice 1 |
| L165 | défi | Deux : pourquoi l'expression jobParameters échoue-t-elle sur un singleton, et pas en StepScope ? | Exercice 2 |
| L166 | défi | Trois : une collègue a mis start dans son contrôleur, et la requête dure vingt minutes. Explique ce qui se passe, et comment corriger. | Exercice 3 |
| L167 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L168 | explicatif | Correction de l'exercice un. Trois cents. Corrections : un composant sans état avec le compteur dans la StepExecution, ou StepScope. | Exercice 1 : 300, deux corrections |
| L169 | explicatif | Exercice deux. L'expression est évaluée au démarrage de l'application, quand les paramètres n'existent pas. En StepScope, elle est évaluée au démarrage du step. | Exercice 2 : deux chronologies |
| L170 | explicatif | Exercice trois. Le lancement est synchrone : la requête attend la fin du job. Il faut soumettre le lancement à un autre thread, répondre deux cent deux, et suivre l'état par interrogation. | Exercice 3 : 202 et suivi |
| L171 | transition | Dans le module suivant, tu passes au chunk : lire un fichier CSV, le transformer, et l'écrire dans PostgreSQL, par paquets. | Aperçu « lire, traiter, écrire » |
