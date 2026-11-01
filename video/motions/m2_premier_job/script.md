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
| L014 | explicatif | Un exemple concret : supprimer un million de lignes anciennes. Une seule instruction, c'est une seule transaction géante, qui peut saturer la base. | Une grosse transaction qui gonfle, jauge de la base en rouge |
| L015 | explicatif | Avec CONTINUABLE, tu supprimes mille lignes à la fois. À chaque tour, une transaction courte, validée, puis on recommence. | Boucle : 1000 lignes, commit, 1000 lignes, commit |
| L016 | technique | La condition de sortie : quand la suppression ne touche plus aucune ligne, tu retournes FINISHED. | Code : `return n == 0 ? FINISHED : CONTINUABLE;` |
| L017 | défi, direct | Question. Que se passe-t-il si ta tasklet retourne toujours CONTINUABLE ? | Question « PRÉDIRE » |
| L018 | posé | Une boucle infinie : une transaction par tour, et le job ne se termine jamais. C'est le piège numéro sept de ce module. | Compteur de commits qui monte sans fin, en rouge |
| L019 | règle | Retiens : une tasklet, c'est une action dans une transaction. Un chunk, c'est une boucle lire, traiter, écrire. | Deux encadrés opposés |
| L020 | défi, direct | Question rapide. Tu dois supprimer chaque nuit les lignes de plus de trente jours dans une table. Tasklet ou chunk ? | Question « PRÉDIRE » |
| L021 | posé | Une tasklet : c'est une seule instruction, pas un flux d'éléments à lire et à écrire. Si tu devais transformer chaque ligne, ce serait un chunk. | Choix « tasklet » en vert |
| L022 | pont | Reste une question : qui déclenche tout ça ? Regarde la chaîne complète. | Schéma déclencheur → JobOperator → Job → JobRepository |
| L023 | explicatif | À gauche, un déclencheur : une ligne de commande, un appel REST, un planificateur. Ce n'est pas Spring Batch. | Boîte « déclencheur » en orange |
| L024 | explicatif | Au milieu, le JobOperator, qui lance. Puis le job et ses steps, qui s'exécutent. Et le JobRepository, qui enregistre tout dans PostgreSQL. | Les trois boîtes suivantes s'allument |
| L025 | règle | Un batch n'est pas un planificateur. Spring Batch exécute et enregistre. Quelqu'un d'autre décide de l'heure. | Horloge cron, Kubernetes à côté |
| L026 | explicatif | Trois exemples de déclencheurs : le cron d'un serveur, un CronJob Kubernetes, ou l'appel REST d'un ordonnanceur. Dans tous les cas, Spring Batch reçoit une demande, avec des paramètres. | Trois déclencheurs qui pointent vers le JobOperator |
| L027 | règle | Ne mets jamais de planificateur dans le job lui-même. Avec deux instances de l'application, tu lancerais le traitement deux fois. | Deux serveurs avec chacun une horloge, doublon en rouge |
| L028 | récapitulatif | En résumé : deux modèles de step, et un lanceur qui n'est pas un planificateur. Passons au premier : écrivons une tasklet. | Pastilles récapitulatives |

### Scène 2 : La tasklet, classe explicite (2.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L029 | besoin | Mon besoin : une tasklet qui affiche un message avec la date de traitement. Et que je puisse tester seule. | Fenêtre PrintMessageTasklet.java vide |
| L030 | explicatif | Au premier module, on a écrit une lambda. Cette fois, une classe, parce qu'une classe a un nom, des dépendances injectées, et se teste seule. | Lambda barrée, classe à côté |
| L031 | technique | Je commence par Component : Spring détecte la classe au démarrage et en fait un bean. Sans cela, il faudrait la déclarer à la main. | Code tapé : `@Component` |
| L032 | explicatif, appuyé | Puis StepScope. Retiens cette annotation : on y revient en détail. Le bean n'est pas créé au démarrage, mais à chaque exécution du step. | Code tapé : `@StepScope`, flèche vers « à chaque step » |
| L033 | technique | La classe implémente Tasklet, qui n'a qu'une méthode : execute. | Code tapé : `implements Tasklet` |
| L034 | technique | Un journal, parce qu'en batch les logs sont souvent la seule interface visible. | Code tapé : `Logger log` |
| L035 | technique | Un champ final pour la date : sa valeur est fixée à la construction, et ne change plus pendant l'exécution. | Code tapé : `private final String runDate;` |
| L036 | appuyé | Et le constructeur reçoit la date par une expression, jobParameters runDate. C'est du SpEL, le langage d'expression de Spring. | Code tapé : `@Value("#{jobParameters['runDate']}")` |
| L037 | explicatif | Cette expression est évaluée au moment où le step démarre, quand les paramètres du lancement sont connus. | Chronologie : démarrage de l'application, puis lancement avec paramètres |
| L038 | explicatif | Au démarrage de l'application, ces paramètres n'existent pas encore. Sans StepScope, l'expression échoue. | Flèche vers « n'existent pas encore », erreur rouge |
| L039 | explicatif | Un mot sur SpEL : c'est un mini-langage d'expressions. Ici, jobParameters est un dictionnaire des paramètres du lancement, et on lit la clé runDate. | Dictionnaire jobParameters avec la clé runDate |
| L040 | explicatif | Il existe aussi JobScope : le bean vit le temps du job entier, au lieu du step. Pour une tasklet dans un seul step, StepScope suffit. | Deux portées : JobScope englobe StepScope |
| L041 | technique | La méthode execute reçoit la contribution du step et le contexte du chunk. | Code tapé : signature de `execute` |
| L042 | technique | Avec la contribution, j'accède à la StepExecution : son nom, ses compteurs, son contexte. | Code tapé : `contribution.getStepExecution().getStepName()` |
| L043 | règle | Et je retourne FINISHED : le step est terminé. CONTINUABLE rappellerait la méthode, dans une nouvelle transaction. | Code tapé : `return RepeatStatus.FINISHED;` |
| L044 | défi, direct | Question. Que se passe-t-il si je retire StepScope, mais que je garde l'expression avec jobParameters ? | Question « PRÉDIRE » |
| L045 | posé | Le contexte ne démarre pas : au moment de créer le bean, les paramètres du lancement n'existent pas. L'erreur arrive avant même qu'un job soit lancé. | Terminal : erreur au démarrage du contexte |
| L046 | récapitulatif | En résumé : une classe, un bean, StepScope, une date reçue par SpEL, et FINISHED. | Cinq pastilles |
| L047 | besoin | Lançons le job pour la date du premier novembre, et regardons ce qui se passe. | Terminal vide, curseur |
| L048 | technique | La console affiche d'abord le lancement du job, puis notre message, avec la date et le nom du step, puis le statut final : terminé. Extrait indicatif. | Terminal : `Traitement du 2026-11-01 (step printMessageStep)`, COMPLETED |
| L049 | technique | Dans la base, une instance pour le job helloJob, une exécution terminée, et un paramètre runDate, identifiant. | Trois lignes de tables, exemple indicatif |
| L050 | explicatif | Relançons avec la même date : exception, JobInstanceAlreadyCompleteException. L'instance est fermée, comme on l'a vu au premier module. | Terminal : exception en rouge |
| L051 | explicatif | Avec une autre date, c'est une autre instance, qui s'exécute normalement. Deux dates, deux instances, deux messages. | Deux lignes : instance 1 et instance 2 |
| L052 | pont | La tasklet est écrite. Il faut maintenant l'attacher à un step, et le step à un job. | Titre « 2.3 Le step et le job » |

### Scène 3 : Le step et le job avec les builders 6 (2.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L053 | besoin | Mon besoin : un job qui contient un step qui exécute cette tasklet. Et sans fabrique : les builders de la version six. | Fenêtre HelloJobConfig.java vide |
| L054 | explicatif | Je déclare une classe de configuration : ses méthodes Bean fabriquent des objets gérés par Spring. | Code tapé : `@Configuration` |
| L055 | explicatif | Chaque méthode Bean produit un bean, singleton par défaut. Ici, le step et le job sont des descriptions immuables : un singleton convient très bien. | Code tapé : `@Bean`, étiquette « singleton » en vert |
| L056 | technique | Le JobRepository du premier module est injecté par type. | Code tapé : `JobRepository jobRepository` |
| L057 | technique | Le gestionnaire de transactions encadrera la tasklet. | Code tapé : `PlatformTransactionManager` |
| L058 | appuyé | Et la tasklet est injectée aussi. Mais attention : ce que tu reçois n'est pas l'objet réel. C'est un proxy. On y revient dans la partie cinq. | Code tapé : `PrintMessageTasklet tasklet`, étiquette « proxy » en orange |
| L059 | explicatif | Pourquoi un proxy ici ? Parce que le step doit recevoir quelque chose tout de suite, au démarrage. Le proxy est cette chose : il attend que le step démarre pour fabriquer la vraie tasklet. | Proxy qui attend, instance qui apparaît au démarrage du step |
| L060 | règle | Retiens : tu ne manipules jamais la vraie tasklet directement. Tu passes toujours par le proxy. | Phrase encadrée |
| L061 | technique | StepBuilder, avec un nom et le dépôt. En version six, on construit directement le builder : il n'y a plus de fabrique. | Code tapé : `new StepBuilder("printMessageStep", jobRepository)` |
| L062 | technique | Puis tasklet, avec la tasklet et son gestionnaire de transactions. Et build produit le step. | Code tapé : `.tasklet(tasklet, transactionManager).build()` |
| L063 | explicatif | Le job, maintenant. Spring injecte le step par type, et par son nom de méthode quand il y en a plusieurs. | Code tapé : bean `helloJob` |
| L064 | technique | JobBuilder, avec le nom du job. C'est ce nom que tu retrouveras dans la table des instances. | `new JobBuilder("helloJob", jobRepository)` surligné |
| L065 | technique | Start désigne le premier step. Plus tard, on enchaînera avec next. Et build produit le job. | `.start(printMessageStep).build()` |
| L066 | règle | Un job, un step, une tasklet, et aucune fabrique. Voilà ce qui a changé par rapport aux versions précédentes. | Tableau « v5 : StepBuilderFactory » barré, « v6 : StepBuilder » |
| L067 | appuyé | Un point qu'on oublie : le nom du step est la clé de ses exécutions en base. Si tu le renommes, tu perds le lien avec l'historique. | Deux noms de step, historique orphelin en orange |
| L068 | règle | Les noms de job et de step sont des contrats. On ne les renomme pas à la légère. | Phrase encadrée |
| L069 | explicatif | Et le gestionnaire de transactions, pourquoi le passer ? Parce que la tasklet s'exécute dans une transaction, et c'est lui qui l'ouvre et la ferme. | Transaction autour de la tasklet |
| L070 | défi, direct | Dans la table des instances, quel nom de job vois-tu apparaître après un lancement : le nom de la classe, du bean, ou celui passé au builder ? | Question « PRÉDIRE » |
| L071 | posé | Celui passé au JobBuilder : helloJob. Le nom de la classe ou de la méthode n'a aucune importance pour la base. | `helloJob` dans une ligne de `batch_job_instance` |
| L072 | pont | Il reste à lancer ce job. D'abord le plus simple : avec le JobOperator. | Titre « 2.4 Lancer le job » |

### Scène 4 : Lancer avec JobOperator (2.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L073 | besoin | Mon besoin : lancer helloJob pour une date donnée, depuis mon code. | Fenêtre HelloJobService.java vide |
| L074 | explicatif | Je crée un service : un bean de la couche métier, sans état, avec des dépendances en champs final. | Code tapé : `@Service` |
| L075 | technique | J'injecte le JobOperator et le job, par le constructeur. C'est la forme recommandée : pas d'annotation sur les champs. | Code tapé : constructeur |
| L076 | technique | JobParametersBuilder fabrique des paramètres typés. | Code tapé : `new JobParametersBuilder()` |
| L077 | appuyé | Et runDate est un paramètre identifiant par défaut. C'est lui qui définit la JobInstance : retour sur le premier module. | `.addString("runDate", runDate)` surligné |
| L078 | technique | Puis start, qui lance le job, attend la fin, et renvoie l'exécution terminée. | `return jobOperator.start(helloJob, params);` |
| L079 | explicatif | Un lancement synchrone : l'appel ne rend la main qu'à la fin du job. | Chrono qui tourne pendant l'exécution |
| L080 | pédagogue | Pour un job de deux secondes, aucun souci. Pour un job de vingt minutes, ton contrôleur reste bloqué vingt minutes. | Chrono à 20 minutes, requête qui attend |
| L081 | explicatif | Regarde le même appel avec un chronomètre. Deux secondes pour un job rapide. Mille deux cents secondes pour un job de vingt minutes. | Deux chronomètres : 2 s et 1200 s |
| L082 | appuyé | Pendant tout ce temps, le thread du serveur reste occupé. Avec cent utilisateurs, ton serveur n'a plus de thread libre. | Cent requêtes qui attendent, pool saturé |
| L083 | défi, direct | Question. Pour un job de vingt minutes, vaut-il mieux appeler start dans le contrôleur, ou le soumettre à un autre thread ? | Question « PRÉDIRE » |
| L084 | posé | Le soumettre à un autre thread, et répondre tout de suite. C'est ce qu'on fait juste après. | Choix « autre thread » en vert |
| L085 | pont | Alors, comment lancer sans bloquer ? | Titre « lancer sans bloquer » |
| L086 | besoin | Mon besoin : une API qui répond tout de suite, pendant que le job tourne, et que je puisse interroger plus tard. | Schéma client → API → job, flèche retour immédiate |
| L087 | explicatif | Première idée : appeler start directement dans le contrôleur. Ça marche, mais la requête attend la fin du job. C'est le piège. | Contrôleur qui attend, délai dépassé en rouge |
| L088 | explicatif | Deuxième idée : on soumet l'appel à un autre thread. Le thread HTTP est libéré immédiatement. | Deux fils : HTTP libéré, job continue |
| L089 | technique | Pour cela, un exécuteur de threads virtuels, disponible depuis Java vingt et un : un thread par lancement, presque sans coût. | Code tapé : `Executors.newVirtualThreadPerTaskExecutor()` |
| L090 | technique | D'abord les deux records : la requête avec la date, et la réponse avec l'adresse où suivre l'exécution. | Code tapé : `record StartRequest`, `record StartResponse` |
| L091 | technique | Un POST, parce que lancer un job modifie l'état du système. Un GET doit pouvoir être rejoué sans effet. | `@PostMapping("/jobs/hello")` |
| L092 | défi, direct | Question. Pourquoi un POST, et pas un GET, pour lancer le job ? | Question « PRÉDIRE » |
| L093 | posé | Parce qu'un GET doit pouvoir être rejoué sans effet. Un navigateur, un robot, un préchargement peuvent le déclencher sans que personne le veuille. Un POST, lui, est une action volontaire. | Choix « POST » en vert, GET en rouge |
| L094 | appuyé | Je soumets le lancement à l'exécuteur, puis je réponds tout de suite : deux cent deux, Accepted. | `executor.submit(...)`, `ResponseEntity.accepted()` |
| L095 | explicatif | Ce code signifie : j'ai bien reçu ta demande, le traitement n'est pas terminé. | Étiquette « 202 : reçu, pas terminé » |
| L096 | explicatif | Et la requête de suivi : un GET, en lecture seule. Il interroge le dépôt avec le nom du job et ses paramètres. | Code tapé : `jobRepository.getLastJobExecution("helloJob", params)` |
| L097 | technique | Comme l'état vit dans PostgreSQL, le suivi survit à un redémarrage de l'application. | Flèche vers cylindre PostgreSQL |
| L098 | technique | Et le switch avec case null traite explicitement l'absence d'exécution. | `case null -> "INCONNU"` |
| L099 | besoin | Faisons l'essai complet, depuis un terminal. Je lance un POST avec la date, et la réponse arrive tout de suite : deux cent deux, avec l'adresse de suivi. | Terminal : curl POST, réponse 202 |
| L100 | technique | Un GET juste après : STARTED. Le job tourne encore. | Terminal : GET → STARTED |
| L101 | technique | Un GET quelques minutes plus tard : COMPLETED. Le job est terminé. | Terminal : GET → COMPLETED en vert |
| L102 | appuyé | Maintenant je redémarre l'application. Le GET répond toujours, avec le même état. Parce que l'état vit dans PostgreSQL, pas dans la mémoire de l'application. | Application redémarrée, GET toujours COMPLETED |
| L103 | explicatif | Et si j'envoie deux POST avec la même date, le second échoue proprement : l'instance est déjà terminée, ou déjà en cours. | Deuxième POST en rouge |
| L104 | appuyé | Attention à un point : dans le lancement asynchrone, si l'appel échoue, personne ne le voit. Il faut journaliser l'exception et lire l'état dans le dépôt. | Bloc catch vide barré en rouge |
| L105 | défi, direct | Question. L'appelant reçoit la main avant la fin du job. Dans quel état est l'exécution à cet instant : STARTING ou STARTED, ou COMPLETED ? | Question « PRÉDIRE » |
| L106 | posé | STARTING ou STARTED. Elle n'est pas terminée. C'est pour cela qu'on interroge ensuite le dépôt. | Ligne de base STARTED |
| L107 | explicatif | Il existe aussi une variante : un lanceur qui crée lui-même le thread, TaskExecutorJobOperator. On la verra en production, plus loin dans la formation. | Tableau « exécuteur applicatif / TaskExecutorJobOperator » |
| L108 | récapitulatif | En résumé : un service sans état, un POST, un deux cent deux, et un suivi par interrogation. | Quatre pastilles |
| L109 | besoin | Comment tester ça ? Un utilitaire de test lance le job. Et surtout, on le lance deux fois dans le même test. Exemple indicatif. | Code : `utils.startJob(params("2026-11-01"))` deux fois |
| L110 | explicatif | Un test qui lance une seule fois passe toujours. C'est au deuxième lancement que le double comptage apparaît, parce que le singleton a survécu. | Test 1 : vert. Test 2 : rouge |
| L111 | règle | Dans un test de job, vérifie toujours le deuxième lancement, avec une autre date. Il révèle les états cachés. | Phrase encadrée |
| L112 | pont | Tout ça repose sur une idée : les beans Spring ne sont pas tous créés de la même façon. C'est la partie la plus importante du module. | Titre « 2.5 Cycle de vie des beans » |

### Scène 5 : Le cycle de vie d'un bean (2.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L113 | besoin | Mon besoin : comprendre à quel moment exact Spring fabrique mes objets. Parce que de là dépend tout ce qui va suivre. | Bean qui apparaît sur une frise |
| L114 | image concrète | Imagine un restaurant. La cuisine prépare un plat, le serveur l'apporte, le client le mange, et on débarrasse. Un bean suit les mêmes étapes. | Cuisine, serveur, table, plonge |
| L115 | technique | Un : l'instanciation. Spring appelle le constructeur. Deux : l'injection des dépendances. | Étapes 1 et 2 de la frise |
| L116 | technique | Trois : les callbacks de type Aware, comme BeanNameAware, qui donnent au bean accès à son environnement. | Étape 3 |
| L117 | technique | Quatre : le post-processeur, avant l'initialisation. Cinq : l'initialisation elle-même, avec PostConstruct. | Étapes 4 et 5 |
| L118 | appuyé | Six : le post-processeur, après l'initialisation. C'est ici, et seulement ici, que les proxys sont créés. | Étape 6 en orange, étiquette « proxys » |
| L119 | technique | Sept : le bean est prêt. Huit : à l'arrêt du contexte, il est détruit, avec PreDestroy. | Étapes 7 et 8 |
| L120 | technique | Pour voir un proxy, affiche la classe de l'objet injecté. Tu ne vois pas PrintMessageTasklet, mais un nom avec CGLIB à la fin. | Console : `PrintMessageTasklet$$SpringCGLIB$$0` |
| L121 | explicatif | C'est la sous-classe générée par Spring. Elle ressemble à ta classe, mais elle intercepte les appels. | Sous-classe générée qui enveloppe la tasklet |
| L122 | règle | Retiens deux conséquences. Ce que tu reçois par injection est parfois un proxy, pas ton objet. Et une action qui dépend des paramètres du lancement ne peut pas se faire à l'étape deux d'un singleton. | Deux encadrés |
| L123 | explicatif | Pourquoi ? Parce qu'à l'étape deux, aucun lancement n'a encore eu lieu. Il n'y a pas encore de paramètres à lire. | Frise : paramètres apparaissent après l'étape 7 |
| L124 | défi, direct | Question. À quelle étape le proxy d'un bean StepScope est-il créé ? | Question « PRÉDIRE » |
| L125 | posé | À l'étape six, après l'initialisation. La vraie instance, elle, n'est créée qu'au démarrage du step. | Étape 6 clignote |
| L126 | pont | Voyons maintenant ce que Spring fait de différent entre un singleton et un bean en StepScope. | Deux colonnes : singleton / StepScope |

### Scène 6 : Singleton contre StepScope et proxy (2.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L127 | explicatif | Par défaut, un bean est un singleton : un seul objet pour toute l'application, créé au démarrage, partagé par tous les appelants. | Boîte « une instance pour toujours » |
| L128 | appuyé | Partagé par tous les threads et tous les lancements. Donc tout champ modifiable est un état partagé. | Trois lancements qui pointent vers la même boîte |
| L129 | explicatif | Avec StepScope, Spring change de stratégie. Au démarrage, il ne crée pas la tasklet. Il crée à la place un proxy. | Proxy gris qui apparaît à la place |
| L130 | technique | Un proxy, c'est une sous-classe générée, qui prend la place du bean dans tous les points d'injection. | Proxy relié aux points d'injection |
| L131 | technique | Quand le step démarre, le proxy demande au contexte d'instancier la vraie tasklet. À ce moment, l'expression jobParameters peut être résolue. | Flèche proxy → instance 1 |
| L132 | technique | Chaque appel de méthode sur le proxy est délégué à l'instance de l'exécution courante. | Appel qui traverse le proxy |
| L133 | explicatif | Et à la fin du step, l'instance est détruite. L'exécution suivante en aura une neuve. | Instance 1 qui s'efface, instance 2 qui apparaît |
| L134 | règle | Le proxy vit toujours, les instances sont éphémères. | Schéma mémoire JVM : proxy permanent, instances 1, 2, 3 |
| L135 | pédagogue | Un dernier détail, qui vient du proxy : si une méthode appelle une autre méthode de la même classe, l'appel contourne le proxy. | Appel interne qui évite le proxy, en rouge |
| L136 | technique | Voici le piège de l'appel interne. Ta méthode a appelle ta méthode b. Dans le code, ça s'écrit this point b : l'appel ne passe pas par le proxy. | Code : `this.b()`, flèche qui contourne le proxy |
| L137 | règle | Spring ne peut intercepter que les appels qui passent par le proxy. Un appel interne est invisible pour lui. | Proxy en pointillé contourné |
| L138 | règle | Pour avoir la bonne instance, injecte le bean depuis l'extérieur. | Flèche verte depuis l'extérieur |
| L139 | explicatif | Pour résumer les portées : singleton, un objet pour toute l'application. JobScope, un objet par job. StepScope, un objet par step. | Trois lignes : singleton, JobScope, StepScope |
| L140 | règle | Plus la portée est étroite, plus l'objet peut dépendre des paramètres du lancement, et moins il garde d'état entre deux exécutions. | Flèche : portée étroite → paramètres, pas d'état |
| L141 | pont | Voyons maintenant ce qui se passe quand on oublie tout cela. Je vais te montrer le bug du double comptage. | Titre « Le double comptage » |

### Scène 7 : La démonstration du double comptage (2.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L142 | besoin | Mon besoin : une tasklet qui compte les éléments traités. Cent éléments à chaque lancement. | Code : classe CountingTasklet |
| L143 | explicatif | Voici le code. Un champ processed, initialisé à zéro. À chaque exécution, j'ajoute cent, et j'affiche le total. | Code tapé : `private int processed = 0;` |
| L144 | explicatif | Cette classe est un Component, sans StepScope. Donc un singleton. | Étiquette « singleton » en rouge |
| L145 | appuyé | Premier lancement : cent éléments traités, le journal affiche cent. Parfait. | Terminal : `Total traité : 100` en vert |
| L146 | appuyé | Deuxième lancement, dans la même application : cent éléments traités. Mais le journal affiche deux cents. | Terminal : `Total traité : 200` en rouge |
| L147 | pédagogue | Aucune exception, aucun avertissement. Le rapport double alors que rien n'a été traité en plus. | Rapport : 200, journal vide |
| L148 | explicatif | Pourquoi ? Parce que le singleton survit entre deux lancements, et qu'il garde son champ. | Boîte singleton avec compteur qui monte |
| L149 | défi, direct | Question. Troisième lancement, toujours cent éléments. Qu'affiche le journal ? | Question « PRÉDIRE » |
| L150 | posé | Trois cents. Le compteur continue de grandir à chaque lancement, tant que l'application reste vivante. | Compteur 300 en rouge |
| L151 | explicatif | Trois parades, par ordre de préférence. Première : pas d'état dans les composants partagés. Le compteur vit dans la StepExecution ou dans l'ExecutionContext. | Carte 1 : « pas d'état » |
| L152 | explicatif | Deuxième : StepScope. Le composant est neuf à chaque exécution du step. | Carte 2 : `@StepScope` |
| L153 | explicatif | Troisième : réinitialiser l'état au début de chaque exécution. C'est fragile : on finit toujours par l'oublier. | Carte 3 en orange |
| L154 | technique | Voyons la première parade en code. Le compteur ne vit plus dans le composant, mais dans la StepExecution : contribution point incrementWriteCount, cent. | Code : `contribution.incrementWriteCount(100);` |
| L155 | explicatif | Le total est dans la base. Il se reprend après un crash, et il ne dépend d'aucun objet qui survit en mémoire. | Compteur dans batch_step_execution |
| L156 | technique | Deuxième parade : StepScope sur la tasklet. Une seule annotation, et le champ repart de zéro à chaque exécution. | Code : `@Component @StepScope` |
| L157 | défi, direct | Question. Quelle parade est la plus sûre ? | Question « PRÉDIRE » |
| L158 | posé | La première. Pas d'état du tout : il n'y a rien à oublier de réinitialiser, et rien à partager. | Carte 1 en vert |
| L159 | pédagogue | Et un test qui lance le job une seule fois passe toujours. Le bug n'apparaît qu'au deuxième lancement, dans la même application. | Test vert une fois, rouge au deuxième lancement |
| L160 | règle | Tout test d'un job qui garde un état doit lancer le job au moins deux fois. | Phrase encadrée |
| L161 | pont | On y reviendra avec les processeurs. Reste un dernier point : ce que Spring Boot fait, tout seul, au démarrage. | Titre « 2.6 Démarrage Boot » |

### Scène 8 : Le démarrage de Spring Boot (2.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L162 | besoin | Mon besoin : démarrer mon application sans que mes jobs partent tout seuls. | Application qui démarre, jobs qui partent |
| L163 | explicatif | Par défaut, Spring Boot lance tous les jobs déclarés au démarrage, une seule fois, sans paramètre. | Trois jobs lancés au démarrage |
| L164 | explicatif | C'est pratique pour un Hello World. C'est dangereux pour une application qui expose une API, ou plusieurs jobs. | Hello World vert, API rouge |
| L165 | technique | Concrètement : après la construction du contexte, mais avant que l'application soit prête à servir. Si le job est long, l'application paraît bloquée au démarrage. | Frise : contexte, jobs, prêt à servir |
| L166 | technique | Voici ce qu'on voit dans les journaux, avec le lancement automatique : le job helloJob est lancé au démarrage, avec des paramètres vides. Extrait indicatif. | Journal : `Job: [name=helloJob] launched with parameters: [{}]` |
| L167 | appuyé | Et comme la date est absente, la tasklet reçoit null, et le résultat est faux, ou une erreur, avant même que tu aies lancé quoi que ce soit. | Journal : `runDate = null` en rouge |
| L168 | technique | La propriété spring point batch point job point enabled à false désactive ce comportement. | Terminal : `spring.batch.job.enabled=false` |
| L169 | technique | Et spring point batch point job point name sélectionne un seul job à lancer. | `spring.batch.job.name=helloJob` |
| L170 | explicatif | Sans la première ligne, Spring Boot lancerait helloJob seul à chaque démarrage, sans runDate. L'échec serait journalisé avant même que l'API ne réponde. | Journal : échec au démarrage, en rouge |
| L171 | pédagogue | Il y a pourtant un cas où ce comportement est voulu : un job d'initialisation, qui charge un référentiel une seule fois à l'installation. | Carte « job d'initialisation » |
| L172 | défi, direct | Question. Tu as deux jobs dans l'application et tu veux lancer seulement l'un des deux au démarrage. Quelle propriété ajoutes-tu ? | Question « PRÉDIRE » |
| L173 | posé | Le nom du job : spring point batch point job point name. Et enabled reste à true. | `spring.batch.job.name` surligné |
| L174 | pont | Voyons trois situations réelles où tout cela s'assemble. | Titre « cas d'usage » |

### Scène 9 : Cas d'usage

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L175 | explicatif | Premier cas : l'import du matin. Un CronJob Kubernetes appelle POST jobs hello chaque jour à deux heures, avec la date du jour. | CronJob → POST /jobs/hello |
| L176 | explicatif | L'API répond deux cent deux aussitôt. Le job tourne. Et le tableau de bord appelle le GET pour suivre l'état. | Tableau de bord qui interroge |
| L177 | appuyé | Si le planificateur déclenche par erreur deux fois, le second appel échoue proprement : JobInstanceAlreadyComplete ou JobExecutionAlreadyRunning. | Deuxième appel en rouge, exception |
| L178 | explicatif | Deuxième cas : le job à la demande. Un gestionnaire demande, depuis une interface web, de recalculer les soldes du mois. | Interface web, bouton « recalculer » |
| L179 | explicatif | La requête ne peut pas attendre vingt minutes. Lancement asynchrone, retour immédiat, suivi par interrogation. | Chrono, 202, suivi |
| L180 | explicatif | Troisième cas : le job d'initialisation, qui profite du lancement automatique, avec le nom du job. | Boîte « initialisation », propriété name |
| L181 | explicatif | Un quatrième cas : le job échoue à trois heures du matin. Au matin, on relance avec la même date. | Frise : échec à 3 h, relance au matin |
| L182 | explicatif | C'est la même instance, donc une nouvelle exécution, et une reprise, comme on l'a vu au premier module. | Instance 1 : exécution 1 FAILED, exécution 2 COMPLETED |
| L183 | règle | Voilà pourquoi la date métier est identifiante : elle fait l'instance, et elle rend la reprise possible. | Phrase encadrée |
| L184 | pont | Il ne reste plus qu'à voir les dix pièges de ce module. | Titre « Top 10 des pièges » |

### Scène 10 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L185 | pédagogue | Dix pièges, avec pour chacun ce qui se passe et la parade. Les cinq premiers touchent le lancement et le singleton. | Tableau, lignes 1 à 5 |
| L186 | appuyé | Un : oublier de désactiver le lancement automatique. Tous les jobs partent au démarrage, sans paramètre. | Ligne 1 |
| L187 | pédagogue | Comment le repérer : des jobs inattendus dans les journaux au démarrage, avec des paramètres vides. | Extrait indicatif : `Job: [name=helloJob] launched with parameters: [{}]` |
| L188 | pédagogue | Pourquoi on y tombe : parce que Spring Boot est généreux par défaut. Tout ce qui est déclaré est exécuté. | Défaut généreux, flèche vers jobs |
| L189 | appuyé | Deux : lancer un job long de façon synchrone dans une requête HTTP. La requête reste bloquée, le client finit par relancer. | Ligne 2 |
| L190 | pédagogue | Comment le repérer : un client qui expire, et le même job lancé deux fois. | Extrait indicatif : `curl: (28) Operation timed out after 30001 ms` |
| L191 | pédagogue | Pourquoi on y tombe : parce qu'en local, le job dure deux secondes. En production, il dure vingt minutes. | Deux durées : 2 s et 20 min |
| L192 | appuyé | Trois : un champ modifiable dans un singleton. Le double comptage entre deux lancements. | Ligne 3 en rouge |
| L193 | pédagogue | Comment le repérer : un total qui augmente d'un lancement à l'autre, sans autre changement. | Extrait indicatif : `Total traité : 100` puis `Total traité : 200` |
| L194 | pédagogue | Pourquoi on y tombe : parce que le premier lancement est toujours correct. Le défaut n'apparaît qu'ensuite. | Lancement 1 vert, lancement 2 rouge |
| L195 | appuyé | Quatre : l'expression jobParameters sur un bean qui n'est pas en StepScope. Échec au démarrage du contexte. | Ligne 4 |
| L196 | pédagogue | Comment le repérer : l'application ne démarre pas, avec une erreur sur une propriété jobParameters. | Extrait indicatif : `BeanCreationException … jobParameters` |
| L197 | pédagogue | Pourquoi on y tombe : parce que le bean se crée au démarrage de l'application, et que les paramètres arrivent plus tard. | Chronologie : bean avant les paramètres |
| L198 | appuyé | Cinq : appeler une méthode de StepScope depuis la même classe. L'appel contourne le proxy. | Ligne 5 |
| L199 | pédagogue | Comment le repérer : un comportement différent selon qu'on appelle la méthode de l'intérieur ou de l'extérieur. | Extrait indicatif : appel interne, valeur `null` |
| L200 | pédagogue | Pourquoi on y tombe : parce que le code est écrit en pensant à l'objet, et pas au proxy qui est devant. | Objet derrière un proxy |

### Scène 11 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L201 | pont | Les cinq suivants touchent la tasklet et la gestion des erreurs. | Tableau, lignes 6 à 10 |
| L202 | appuyé | Six : une tasklet qui retourne null au lieu d'un statut. Exception à l'exécution. | Ligne 6 |
| L203 | pédagogue | Comment le repérer : une exception sur le statut de retour, dès la fin de la méthode. | Extrait indicatif : `NullPointerException` après `execute` |
| L204 | pédagogue | Pourquoi on y tombe : parce qu'on écrit une tasklet en vitesse, et qu'on oublie le retour. | Méthode sans return |
| L205 | appuyé | Sept : une tasklet qui retourne CONTINUABLE sans condition d'arrêt. Boucle infinie, une transaction par tour. | Ligne 7 |
| L206 | pédagogue | Comment le repérer : un job qui ne se termine jamais, et des milliers de validations en base. | Extrait indicatif : `commit_count = 48213` |
| L207 | pédagogue | Pourquoi on y tombe : on teste avec un petit volume, et la condition de sortie semble inutile. | Petit volume, boucle qui finit par hasard |
| L208 | appuyé | Huit : lancer avec un GET. Un robot, un navigateur ou un préchargement relance le job. | Ligne 8 |
| L209 | pédagogue | Comment le repérer : le job se lance sans que personne ne l'ait demandé. | Extrait indicatif : `GET /jobs/hello 200` dans le journal d'accès |
| L210 | pédagogue | Pourquoi on y tombe : parce qu'un GET est plus pratique à tester dans un navigateur. | Navigateur qui lance un GET |
| L211 | appuyé | Neuf : engloutir l'exception d'un lancement asynchrone. L'échec est invisible. | Ligne 9 |
| L212 | pédagogue | Comment le repérer : un job en échec en base, et aucune trace dans les journaux. | Extrait indicatif : `status = FAILED`, journal vide |
| L213 | pédagogue | Pourquoi on y tombe : parce qu'un try catch vide semble silencieux et propre. Il l'est : trop. | catch vide |
| L214 | appuyé | Dix : un paramètre horodaté, en paramètre identifiant. Chaque relance est une nouvelle instance, et la reprise devient impossible. | Ligne 10 |
| L215 | pédagogue | Comment le repérer : des instances qui se multiplient pour le même jour. | Extrait indicatif : `job_instance_id = 101, 102, 103` |
| L216 | pédagogue | Pourquoi on y tombe : parce qu'on veut une date unique à chaque lancement, et qu'on oublie ce que ça coûte. | Horodatage qui change à chaque fois |
| L217 | pédagogue | Un bug silencieux typique : un test qui lance le job une fois et passe toujours. | Test vert au 1er lancement |
| L218 | règle | Le double comptage n'apparaît qu'au deuxième lancement, dans la même application. | Test rouge au 2e lancement |

### Scène 12 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L219 | pédagogue | Reprenons notre rapport du mardi, avec son total deux fois trop grand. Tu sais maintenant d'où il vient : un singleton qui garde un champ. | Rapport 200, flèche vers singleton |
| L220 | récapitulatif | Une tasklet est une action dans une transaction. Un step et un job se construisent avec les builders de la version six. | Deux pastilles |
| L221 | récapitulatif | Un lancement synchrone bloque. Un lancement asynchrone rend deux cent deux, et se suit par interrogation. | Deux pastilles |
| L222 | récapitulatif | Un singleton est partagé. Un bean en StepScope est neuf à chaque step, derrière un proxy. | Deux pastilles |
| L223 | défi | Trois exercices pour finir. Un : la classe CountingTasklet est lancée trois fois dans la même application. Qu'affiche-t-elle la troisième fois ? Propose deux corrections. | Exercice 1 |
| L224 | défi | Deux : pourquoi l'expression jobParameters échoue-t-elle sur un singleton, et pas en StepScope ? | Exercice 2 |
| L225 | défi | Trois : une collègue a mis start dans son contrôleur, et la requête dure vingt minutes. Explique ce qui se passe, et comment corriger. | Exercice 3 |
| L226 | récapitulatif | En un mot : un singleton garde l'état, un proxy et StepScope le rendent éphémère, et un job lancé deux fois dans les tests le révèle. | Trois pastilles |
| L227 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L228 | explicatif | Correction de l'exercice un. Trois cents. Corrections : un composant sans état avec le compteur dans la StepExecution, ou StepScope. | Exercice 1 : 300, deux corrections |
| L229 | explicatif | Exercice deux. L'expression est évaluée au démarrage de l'application, quand les paramètres n'existent pas. En StepScope, elle est évaluée au démarrage du step. | Exercice 2 : deux chronologies |
| L230 | explicatif | Exercice trois. Le lancement est synchrone : la requête attend la fin du job. Il faut soumettre le lancement à un autre thread, répondre deux cent deux, et suivre l'état par interrogation. | Exercice 3 : 202 et suivi |
| L231 | transition | Dans le module suivant, tu passes au chunk : lire un fichier CSV, le transformer, et l'écrire dans PostgreSQL, par paquets. | Aperçu « lire, traiter, écrire » |
