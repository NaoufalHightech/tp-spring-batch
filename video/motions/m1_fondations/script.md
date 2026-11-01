# Module 1 : Fondations et environnement de production

Vidéo de formation Spring Batch. Durée visée : 46 minutes, en six parties (1.1 à 1.6). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_1.md` ; le code montré est celui de `tp/tpProd`.

Règles : `docs/STYLE.md` du dépôt motions (tutoiement, vulgarisation avant le mot technique, un seul nouveau concept à la fois, transitions motivées). Le schéma personnalisé de chaque notion est dessiné en formes natives, avec la palette de la formation : vert = nominal, rouge = erreur ou piège, orange = attention, bleu = lecture, violet = écriture.

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L01 | calme, accroche | Il est trois heures douze. Ton serveur redémarre pour une mise à jour. Ton traitement de nuit, lui, tournait depuis deux heures. | Horloge 03:12, barre de progression d'un job qui s'arrête net |
| L02 | grave, pause avant la question | Au matin, une seule question compte : qu'est-ce qui a été fait, et qu'est-ce qui reste à faire ? | Deux colonnes « fait » et « reste » vides, point d'interrogation |
| L03 | pédagogue | Dans ce module, tu vas construire de quoi répondre à cette question. Un environnement de production pour tes traitements par lots. | Titre « Module 1 : Fondations » et la pile Java, Boot, Batch, PostgreSQL |
| L04 | annonce, rythmé | Six étapes : pourquoi un batch de production, le vocabulaire, le projet, ton premier job, ce qui se passe sous le capot, et les pièges à éviter. | Six pastilles numérotées 1.1 à 1.6 qui s'allument |

### Scène 1 : Qu'est-ce qu'un batch ? (1.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L05 | posé, image concrète | Imagine une imprimerie qui, chaque nuit, imprime tous les relevés de compte de la banque. Personne n'appuie sur un bouton pour chaque relevé. | Pile de relevés qui défile devant une machine |
| L06 | explicatif | Un batch, c'est ça : répéter un même traitement sur un très grand ensemble de données, sans intervention humaine. | Schéma Sources → READER → PROCESSOR → WRITER → Destinations, flèches vertes |
| L07 | explicatif | On lit un élément, on le transforme, on l'écrit. Puis on recommence, des millions de fois. | Les trois boîtes pulsent l'une après l'autre |
| L08 | technique | Les données viennent d'un fichier, d'une base ou d'une file d'attente, et repartent vers une base ou un autre fichier. | Les boîtes Sources et Destinations se remplissent d'icônes fichier, base, file |
| L09 | pédagogue | Alors, pourquoi on en a besoin ? Regarde les besoins techniques d'un traitement de masse. | Tableau des six besoins, ligne par ligne |
| L10 | appuyé | Sans intervention humaine : tout est automatique. Efficacité : ça dure des minutes, parfois des heures. Supervision : savoir ce qui est fait et ce qui reste. | Les trois premières lignes s'illuminent |
| L11 | appuyé | Fiabilité : reprendre un lot en échec. Parallélisme : plusieurs jobs en même temps. Et un point souvent oublié : un batch n'est pas un planificateur. | Les trois dernières lignes ; « Quartz, cron, Kubernetes » en gris |
| L12 | explicatif | Un planificateur, comme cron ou Kubernetes, décide quand lancer. Le batch fait le travail une fois lancé. | Deux boîtes : horloge à gauche, job à droite, flèche « lance » |
| L13 | narratif | Côté métier, tu en croises partout : les salaires qu'on vire en fin de mois, les factures de l'opérateur télécom, les bulletins de paie, les e-mails de masse. | Quatre cartes métier qui apparaissent |
| L14 | narratif | Côté technique : des tests lancés à intervalle régulier, des mises à jour de base à deux heures du matin, la consommation d'une file de messages, un test de charge. | Cinq cartes techniques ; légende « même sans Spring, on finit par en faire » |
| L15 | pédagogue, pont | Tout ça fonctionne très bien… tant que rien ne casse. Voyons comment on traite un volume de plus en plus grand. | Les cartes se rangent en bas, la ligne « volume » monte |
| L16 | explicatif | Cinq stratégies, de la plus simple à la plus complexe. D'abord un traitement normal, dans une fenêtre de nuit. | Escalier : marche 1 verte « traitement normal » |
| L17 | explicatif | Puis un batch qui tourne en même temps que les utilisateurs. Puis plusieurs jobs en parallèle. | Marches 2 bleue et 3 orange |
| L18 | explicatif | Puis un même job découpé sur plusieurs instances : on appelle ça du partitionnement. Et enfin, une combinaison de tout ça. | Marches 4 violette et 5 rouge |
| L19 | règle, lent | Même dans le cas le plus simple, prévois des points de validation et la possibilité de reprendre. | Texte « validation + reprise » encadré sur la marche 1 |
| L20 | pédagogue, pont | Cette dernière idée, la reprise, c'est le sujet du module. Reprenons notre nuit de trois heures douze. | L'escalier se replie, l'horloge 03:12 revient |

### Scène 2 : La nuit interrompue (1.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L21 | narratif | Deux heures du matin, un job de rapprochement bancaire démarre. À trois heures douze, le serveur redémarre pour une mise à jour du système. | Frise horaire : 2 h 00 (vert), 3 h 12 (rouge) |
| L22 | suspense | Quand tu arrives, rien n'a planté en apparence. Mais le job ne tourne plus. | Frise : « au matin » orange, processus disparu |
| L23 | technique | Dans la base, l'exécution est restée à l'état « démarré ». Seulement, le processus qui la portait n'existe plus. | Ligne de base « STARTED » avec un point d'interrogation |
| L24 | pédagogue | La solution : déclarer cette exécution orpheline, puis relancer. Et le traitement reprend à la dernière position confirmée, au lieu de repartir de zéro. | Flèches « abandon » puis « relance » ; la barre reprend à 60 % |
| L25 | appuyé | Sans dépôt de métadonnées persistant, ce scénario veut dire : on rejoue dix gigaoctets depuis le début, et on espère ne pas écrire deux fois les mêmes lignes. | Barre qui repart de zéro, lignes en double en rouge |
| L26 | pédagogue | Donc la vraie question n'est pas « comment je lance ? ». C'est « qu'est-ce que je dois garder pour pouvoir répondre le lendemain ? » | Trois questions qui s'affichent en cartes |

### Scène 3 : Les trois questions de production (1.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L27 | explicatif | Trois questions décident de la tenue en production. Première : que s'est-il passé cette nuit, et où le job s'est-il arrêté ? | Carte 1, flèche vers « métadonnées » |
| L28 | explicatif | Deuxième : deux serveurs peuvent-ils lancer le même job en même temps ? | Carte 2, flèche vers « verrouillage » |
| L29 | explicatif | Troisième : peut-on reprendre sans tout rejouer et sans doubler les données ? | Carte 3, flèche vers « état du step » |
| L30 | règle, posé | Les trois réponses reposent sur une base de données durable et partagée. Ici, ce sera PostgreSQL. | Cylindre PostgreSQL au centre, trois flèches |
| L31 | pédagogue | Une base en mémoire, comme H2, est très bien pour tes tests. Jamais pour la production : elle disparaît avec le processus. | Cylindre H2 qui s'efface avec le job, croix rouge |
| L32 | pont | Pour utiliser cette base, il faut d'abord parler le même langage que Spring Batch. Commençons par le vocabulaire. | La base glisse à droite, le mot « vocabulaire » s'affiche |

### Scène 4 : Le vocabulaire (1.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L33 | posé, image concrète | Prends une recette de cuisine : la tarte aux pommes. C'est le même plat à chaque fois. Mais chaque fois que tu la fais, avec des pommes d'une certaine récolte, tu fais une tarte précise. | Livre de recettes ; tarte du lundi, tarte du mardi |
| L34 | explicatif | Un Job, c'est la recette : un nom et une liste d'étapes. Une JobInstance, c'est la recette appliquée à des paramètres précis. | Boîte bleue Job, boîte verte JobInstance reliées, étiquette « 1 … * » |
| L35 | explicatif | Par exemple, le job de fin de journée, pour la date du cinq mai deux mille sept. Cette date est un paramètre identifiant. | JobParameters violette, flèche vers JobInstance |
| L36 | explicatif | Et une JobExecution, c'est une tentative réelle de réaliser cette instance. Elle peut réussir, ou échouer puis être reprise. | Boîte orange JobExecution, deux flèches : réussite, échec |
| L37 | règle, détache les mots | Règle d'or : JobInstance égale Job plus paramètres identifiants. | Équation animée « Job + paramètres = JobInstance » |
| L38 | explicatif | Deux lancements avec les mêmes paramètres identifiants désignent la même instance. | Deux flèches de lancement vers une seule boîte |
| L39 | explicatif | Si cette instance est déjà terminée avec succès, Spring Batch refuse de la rejouer. | Instance verte qui se ferme, flèche rouge refusée |
| L40 | pédagogue | Regarde un exemple dans la table des exécutions. | Tableau JOB_EXEC_ID, JOB_INST_ID, paramètre, statut |
| L41 | technique | L'exécution un, pour l'instance un, avec la date du premier janvier : elle a échoué. | Ligne 1 : FAILED en rouge |
| L42 | technique | L'exécution deux relance la même instance, avec la même date : c'est une reprise, et elle réussit. L'instance un est maintenant fermée. | Ligne 2 : COMPLETED en vert, cadenas |
| L43 | technique | L'exécution trois a une autre date : c'est une autre instance, qui démarre à zéro. | Ligne 3 : nouvelle instance |
| L44 | pédagogue | Trois cas à retenir. Mêmes paramètres : même instance, nouvelle exécution, donc reprise. | Carte « Mêmes paramètres » |
| L45 | pédagogue | Instance réussie : elle est fermée, un nouveau lancement identique est refusé. Instance en cours : on ne peut pas la lancer une seconde fois. | Cartes « Instance réussie » et « Instance en cours » |
| L46 | pont | On sait maintenant ce qu'est un lancement. Zoomons sur ce qui se passe à l'intérieur : le step. | Zoom sur une JobExecution qui s'ouvre |

### Scène 5 : Step, StepExecution et ExecutionContext (1.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L47 | explicatif | Un job est une suite d'étapes. Chaque étape s'appelle un Step. | Trois boîtes Step reliées dans la JobExecution |
| L48 | explicatif | Chaque tentative d'un step laisse une StepExecution, avec ses compteurs : éléments lus, écrits, filtrés, ignorés. | Boîte StepExecution avec six compteurs |
| L49 | technique | On y trouve aussi les validations de transaction, et les annulations. Si un step échoue parce que le précédent a échoué, aucune StepExecution n'est créée. | Compteurs commit et rollback ; step grisé |
| L50 | image concrète | Pense à un jeu vidéo. Quand tu sauvegardes, le jeu garde ta position. Si tu coupes la console, tu reprends là où tu étais. | Console, écran de sauvegarde « niveau 3, position x » |
| L51 | explicatif | C'est exactement le rôle de l'ExecutionContext : la sauvegarde de partie du step. Par exemple, la ligne douze mille atteinte. | Boîte ExecutionContext avec « ligne 12 000 » |
| L52 | technique | Le contexte du step est sauvegardé à chaque validation de transaction. Le contexte du job est sauvegardé entre deux steps. Ce ne sont pas les mêmes objets. | Deux boîtes : contexte du step (bleue), contexte du job (verte) |
| L53 | règle | Et tout ce que tu y mets doit être sérialisable. Sans cela, la reprise est impossible. | Cadenas orange « sérialisable » |
| L54 | pont | Toutes ces informations doivent bien aller quelque part. C'est le rôle du JobRepository. | Flèches de toutes les boîtes vers un cylindre PostgreSQL |
| L55 | technique | Le JobRepository persiste les métadonnées dans PostgreSQL. Tu verras plus loin qu'il y a une colonne version qui sert au verrouillage optimiste. | Cylindre + colonne « version » en rouge |
| L56 | pont | Reste à voir où il se place dans l'architecture. | Les trois couches apparaissent |

### Scène 6 : Les trois couches (1.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L57 | explicatif | Spring Batch s'organise en trois couches. En haut, l'application : ce que tu écris, tes jobs, tes steps, tes lecteurs, tes processeurs. | Bloc vert « Application » |
| L58 | explicatif | Au milieu, le noyau : le Job, le Step, le JobOperator et le JobRepository. | Bloc bleu « Batch Core » |
| L59 | explicatif | En bas, l'infrastructure : les lecteurs, les écrivains, les services courants, utilisés par ton code et par le cœur. | Bloc violet « Batch Infrastructure » |
| L60 | appuyé | Un point à noter : l'infrastructure sert à la fois à ton application et au noyau. | Flèches de la couche basse vers les deux autres |
| L61 | pédagogue | Voici maintenant le schéma de référence. Le JobOperator lance le Job. Le Job est fait de Steps. Chaque Step a un reader, un writer, et un processor facultatif. | Schéma JobOperator → Job → Step → ItemReader, ItemWriter |
| L62 | appuyé | Et le JobRepository, en pointillé, enregistre tout ce qui se passe. | Flèche rouge pointillée vers JobRepository |
| L63 | règle | Retiens : un step a exactement un reader, un writer, et un processor facultatif. | Encadré « 1 reader, 1 writer, 0 ou 1 processor » |
| L64 | pont | Avant d'écrire du code, un mot sur le contexte. Cette version n'est pas celle que tu as peut-être vue dans les tutoriels. | Frise des versions 1.x à 6.x |
| L65 | explicatif | Spring Batch est né en deux mille huit, en configuration XML. Puis la configuration en Java. Puis Spring Quatre, Cinq, Six. | Frise : 1.x 2008, 2.x, 3.x, 4.x, 5.x |
| L66 | règle | À partir de la version cinq, le JobRepository exige une base de données. En production, c'est PostgreSQL. | Version 5 en vert, « base obligatoire » |
| L67 | pédagogue | Et avec la version six, il y a de vraies nouveautés que tu dois connaître avant d'écrire une ligne. | Version 6 en grand |
| L68 | explicatif | Spring Boot quatre point un point deux embarque Spring Batch six point zéro point six, via un starter dédié. | Tableau « Nouveauté / Conséquence », ligne 1 |
| L69 | appuyé | Les paquets ont bougé. Un import copié d'un tutoriel pour la version quatre ou cinq ne compilera plus. | Ligne 2 : `core.job.Job` à côté de `core.Job` barré |
| L70 | explicatif | Le JobOperator étend le JobLauncher, et offre start, restart, stop, abandon et recover. | Ligne 3 : cinq verbes |
| L71 | explicatif | Le JobRepository étend le JobExplorer : lire et écrire les métadonnées passent par une seule interface. | Ligne 4 |
| L72 | explicatif | Et une annotation, EnableJdbcJobRepository, déclare le dépôt JDBC. | Ligne 5 |
| L73 | pont | C'est cette annotation que nous allons écrire. D'abord, il faut un projet. | Titre « 1.3 Le projet », éditeur vide |

### Scène 7 : Le pom (1.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L74 | pédagogue, besoin | Mon besoin : un projet Java qui sait parler à PostgreSQL et à Spring Batch, sans que je gère les versions à la main. | Éditeur, onglet pom.xml vide |
| L75 | pédagogue, première idée | Première idée : j'ajoute les dépendances une par une, avec leur version. Ça marche, jusqu'au jour où deux versions ne s'entendent plus. | Trois versions qui se télescopent, croix rouge |
| L76 | explicatif, décision | La bonne idée : un parent. Le parent Boot fixe toutes les versions compatibles. Je n'écris aucune version de Spring Batch à la main. | Code tapé : bloc parent avec 4.1.2 surligné |
| L77 | technique | Je précise la version de Java : vingt-cinq. Le JDK doit être le vingt-cinq. | Ligne java.version, étiquette « JDK 25 » |
| L78 | technique | Ensuite, le starter Spring Batch JDBC : il apporte Spring Batch et le support JDBC pour enregistrer les métadonnées. | Dépendance starter tapée, ligne 3 |
| L79 | technique | Puis le pilote PostgreSQL, en portée runtime : il n'est utile qu'à l'exécution. | Dépendance postgresql, `runtime` surligné |
| L80 | technique | Enfin, le starter de test, en portée test : jamais dans l'application livrée. | Dépendance test, étiquette « jamais livré » |
| L81 | règle | Retiens : une seule version écrite, celle du parent. Tout le reste est aligné pour toi. | Cinq pastilles numérotées sur le code |
| L82 | pont | Le projet sait maintenant quoi utiliser. Il reste à lui dire où est la base. | Onglet application.properties s'ouvre |

### Scène 8 : application.properties (1.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L83 | besoin | Mon besoin : configurer la base sans jamais mettre un mot de passe dans le dépôt Git. | Dépôt Git avec un mot de passe en clair, alerte rouge |
| L84 | explicatif, décision | La syntaxe dollar accolade, nom de variable, deux-points, valeur par défaut. En production, l'adresse vient de l'environnement, pas du dépôt. | Ligne url tapée, `${DB_URL:…}` surligné |
| L85 | explicatif | Pareil pour l'utilisateur : un compte dédié au batch, sans droits d'administration. | Ligne username |
| L86 | appuyé | Et pour le mot de passe, aucun défaut : il ne doit jamais figurer dans le code. | Ligne password sans valeur par défaut, cadenas |
| L87 | technique | Deux réglages importants. Le lancement automatique des jobs est désactivé : sinon Boot lance tous les jobs au démarrage. | Ligne `spring.batch.job.enabled=false` surlignée |
| L88 | technique | Et la création du schéma est à never en production : le schéma vient d'un outil de migration versionné, comme Flyway ou Liquibase, pas de l'application. | Ligne initialize-schema, `never` en vert, `always` en orange « développement seulement » |
| L89 | règle | Le schéma en production n'est jamais créé par l'application. | Phrase encadrée |
| L90 | pont | Il manque une pièce : dire à Spring Batch d'utiliser cette base pour son dépôt. | Onglet BatchInfraConfig.java |

### Scène 9 : EnableJdbcJobRepository ligne par ligne (1.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L91 | besoin | Mon besoin : un JobRepository qui écrit dans PostgreSQL. | Cylindre PostgreSQL vide |
| L92 | explicatif | Je commence par une classe de configuration Spring : ses annotations sont lues au démarrage du contexte. | Code tapé : `@Configuration` |
| L93 | explicatif | Puis EnableJdbcJobRepository : elle déclare un JobRepository JDBC. Dans les versions précédentes, il fallait le configurer à la main. | Annotation tapée, ancienne version barrée |
| L94 | technique | Le nom du bean DataSource : celui que Boot crée à partir des propriétés de tout à l'heure. | `dataSourceRef = "dataSource"` |
| L95 | technique | Le nom du gestionnaire de transactions, qui encadre l'écriture des métadonnées. | `transactionManagerRef` |
| L96 | technique | Le préfixe des tables. Utile pour héberger plusieurs applications dans un même schéma. | `tablePrefix = "BATCH_"` |
| L97 | technique | La classe n'a aucune méthode : l'annotation suffit. | `public class BatchInfraConfig { }` |
| L98 | alerte, appuyé | Attention à un détail : l'isolation de création. Par défaut, elle est à SERIALIZABLE, c'est le niveau le plus strict. | Encadré orange « Ne changez pas l'isolation » |
| L99 | règle | Ne l'abaisse pas. Si tu la baisses, tu supprimes la protection contre deux lancements simultanés. | Attribut `isolationLevelForCreate` barré en rouge |
| L100 | pont | Maintenant que tout est branché, écrivons un premier job. | Titre « 1.4 Ton premier job » |

### Scène 10 : Le premier job (1.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L101 | besoin | Mon besoin : un job minimal, qui affiche un message, pour vérifier que toute la chaîne fonctionne. | Console vide, curseur |
| L102 | explicatif | Pas besoin de lire un fichier ni d'écrire en base. Une tasklet suffit : une seule action. | Boîte « Tasklet = une action » |
| L103 | explicatif | Je déclare un journal : en batch, les logs sont souvent la seule interface. | Code : `Logger log` tapé |
| L104 | explicatif | Puis la tasklet, comme un bean : elle sera testable seule. | Code : `Tasklet firstTasklet()` |
| L105 | technique | C'est une lambda, parce que Tasklet n'a qu'une méthode : une interface fonctionnelle. | Lambda mise en évidence |
| L106 | technique | Le StepContribution donne accès à l'exécution du step : son nom, ses compteurs. | `contribution.getStepExecution().getStepName()` |
| L107 | technique | Je retourne FINISHED : le step est terminé. Avec CONTINUABLE, la tasklet serait relancée dans une nouvelle transaction. | `RepeatStatus.FINISHED` surligné, `CONTINUABLE` en grisé |
| L108 | explicatif | Maintenant le step. Spring injecte le JobRepository, le gestionnaire de transactions et la tasklet. | Bean `firstStep` tapé, paramètres surlignés |
| L109 | technique | Le nom du step est la clé sous laquelle ses exécutions sont enregistrées. | `new StepBuilder("firstStep", repo)` |
| L110 | technique | La tasklet s'exécute dans une transaction gérée par le gestionnaire que je lui passe. | `.tasklet(firstTasklet, tx)` |
| L111 | explicatif | Enfin le job. Son nom identifie la recette dans la table des instances. | Bean `firstJob`, `"firstJob"` surligné |
| L112 | technique | start désigne le premier step, build produit le job. | `.start(firstStep).build()` |
| L113 | règle | Un job, un step, une tasklet : c'est le plus petit batch possible. Il reste à le lancer. | Schéma Job → Step → Tasklet, trois boîtes vertes |

### Scène 11 : Lancer le job par une API (1.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L114 | besoin | Mon besoin : déclencher ce job depuis l'extérieur, par exemple depuis un ordonnanceur. | Ordonnanceur → requête HTTP → application |
| L115 | explicatif | Je définis la requête avec un record : un porteur de données immuable, sans getters à écrire. | Code : `record RunRequest(String runDate)` |
| L116 | explicatif | Et la réponse aussi, avec un switch en expression sur le statut : le compilateur vérifie que tous les cas sont couverts. | `record RunResult`, `switch` surligné |
| L117 | technique | Terminé devient « TERMINÉ ». Échec ou arrêt devient « À REPRENDRE ». Le reste garde son nom. | Table de correspondance sous le code |
| L118 | technique | Le contrôleur reçoit un JobOperator et le job. | Contrôleur : constructeur tapé |
| L119 | appuyé | Un POST, pas un GET : lancer un job modifie l'état. Un GET doit pouvoir être rejoué sans effet, par un navigateur ou un robot. | `@PostMapping`, GET barré en rouge |
| L120 | technique | JobParametersBuilder fabrique les paramètres. Et runDate est un paramètre identifiant : c'est lui qui définit la JobInstance. | `.addString("runDate", …)` surligné |
| L121 | technique | Enfin, JobOperator point start lance le job et renvoie l'exécution terminée. | `jobOperator.start(firstJob, params)` |
| L122 | alerte | Attention : ce lancement est synchrone. Pour un job long, la requête HTTP reste bloquée. | Chrono qui tourne, requête qui dépasse le délai |
| L123 | pont | C'est un piège que tu retrouveras. Pour l'instant, regardons ce qui s'est passé dans la base. | Titre « 1.5 Sous le capot », cylindre PostgreSQL |

### Scène 12 : Les six tables (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L124 | besoin | Mon besoin : savoir ce que Spring Batch a écrit pendant ce petit job. | Cylindre qui s'ouvre |
| L125 | explicatif | Le schéma contient six tables et trois séquences. | ERD : six entités, trois couleurs |
| L126 | technique | La table des instances : une ligne par job et ses paramètres identifiants, avec le nom du job et la clé de hachage des paramètres. | Entité `batch_job_instance` en bleu |
| L127 | technique | La table des exécutions : une ligne par tentative, avec le statut, le code de sortie, le début, la fin, et une colonne version. | Entité `batch_job_execution`, `version` en rouge |
| L128 | technique | Les paramètres de l'exécution : nom, type, valeur, et un drapeau pour savoir s'ils sont identifiants. | Entité `batch_job_execution_params` |
| L129 | technique | Le contexte de l'exécution du job : la sauvegarde du job, sérialisée. | Entité `batch_job_execution_context` |
| L130 | technique | La table des steps : les compteurs lu, écrit, filtré, annulé, le statut, et une colonne version aussi. | Entité `batch_step_execution`, `version` en rouge |
| L131 | technique | Et le contexte du step : la sauvegarde de partie. | Entité `batch_step_execution_context` |
| L132 | explicatif | Trois séquences produisent les identifiants. Les colonnes version, en rouge, portent le verrouillage optimiste : on y arrive. | Séquences en bas, colonnes version clignotent |
| L133 | règle | Chaque transition est écrite en base immédiatement. Si le serveur est coupé, la base connaît le dernier point confirmé. C'est ce qui rend la reprise possible. | Flèche « coupure » ; dernier point en vert |
| L134 | pont | Et au lancement, comment Spring Batch décide-t-il qu'un job peut démarrer ? | Flèche vers « vérification du lancement » |

### Scène 13 : La vérification d'un lancement (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L135 | explicatif | Première étape : chercher la JobInstance à partir du nom du job et des paramètres identifiants, grâce à la clé de hachage. | Boîte 1 bleue |
| L136 | explicatif | Deuxième étape : si elle existe, y a-t-il une exécution en cours ? Alors, c'est refusé. | Boîte 2 rouge, exception JobExecutionAlreadyRunningException |
| L137 | explicatif | Troisième étape : l'instance est-elle déjà terminée avec succès ? Alors, c'est encore refusé. | Boîte 3 rouge, JobInstanceAlreadyCompleteException |
| L138 | explicatif | Sinon, on crée une nouvelle JobExecution. | Boîte 4 verte |
| L139 | pédagogue, pont | Mais regarde bien : ces lectures puis cette création ne forment pas une opération atomique. Si deux serveurs passent la première étape en même temps ? | Deux flèches arrivent en même temps sur la boîte 1 |
| L140 | explicatif | C'est la raison d'être de l'isolation de création. Elle est exécutée au niveau le plus strict de PostgreSQL. | Boîte 4 : étiquette « SERIALIZABLE » |
| L141 | explicatif | Ce niveau fait échouer l'une des deux transactions concurrentes, avec une erreur de sérialisation. | Deux transactions : l'une verte, l'autre rouge |
| L142 | règle | Le perdant reçoit une exception. C'est le comportement voulu : le lancement doit être retenté, ou abandonné. | Phrase encadrée |
| L143 | pont | Voilà pour la création. Mais une exécution en cours est aussi mise à jour, sans cesse. Et là, on change de mécanisme. | Titre « le verrouillage optimiste » |

### Scène 14 : Le verrouillage optimiste (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L144 | image concrète | Imagine un document partagé. Deux collègues l'ouvrent en même temps, à la version trois. Le premier enregistre. Le second veut enregistrer à son tour. | Deux avatars, un document « v3 » |
| L145 | explicatif | Soit on bloque le document pour tout le monde pendant l'édition. Soit on laisse faire et on vérifie à l'enregistrement. | Deux options : cadenas ou vérification |
| L146 | explicatif | Le second choix s'appelle un verrouillage optimiste : on parie sur l'absence de conflit, et on le détecte à l'écriture. | Option vérification mise en avant |
| L147 | technique | Dans Spring Batch, chaque ligne d'exécution porte une colonne version. Le serveur A lit l'exécution quarante-deux, version trois. | Diagramme de séquence : A lit, version = 3 |
| L148 | technique | Le serveur B la lit aussi, version trois. | B lit, version = 3 |
| L149 | technique | A écrit sa mise à jour avec une condition : version égale trois. Une ligne est modifiée, la version passe à quatre. | UPDATE … WHERE version = 3, retour vert « version = 4 » |
| L150 | technique, couperet | B écrit avec la même condition. Mais la version est maintenant quatre : aucune ligne ne correspond. | UPDATE de B, retour rouge « 0 ligne » |
| L151 | explicatif | Résultat : une OptimisticLockingFailureException. Le second écrivain est refusé. | Exception rouge sur la lifeline de B |
| L152 | règle | Aucun verrou de base n'est tenu pendant la lecture : pas de blocage. Le prix à payer : le perdant doit gérer l'échec. | Encadré avantage / coût |
| L153 | pont | C'est le principe. Mais en pratique, ce mécanisme est atténué. Il faut que tu saches pourquoi. | Titre « ce qu'il faut savoir » |

### Scène 15 : Le piège du verrouillage atténué (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L154 | explicatif | En théorie, une copie périmée d'une exécution doit lever l'exception à l'écriture. | Carte « Le mécanisme » |
| L155 | technique, appuyé | En pratique, dans la classe JdbcJobExecutionDao, une méthode de synchronisation compare la version en base à celle de l'objet en mémoire, avant l'écriture. | Carte « Le piège », code `JdbcJobExecutionDao` |
| L156 | technique | Si elles diffèrent, elle recopie la version de la base, et ne fait que monter le statut, jamais le baisser. | Statuts : flèche vers le haut verte, vers le bas barrée |
| L157 | explicatif | Pourquoi ? Pour qu'un ordre d'arrêt, posé depuis un autre processus, ne soit pas écrasé par une exécution qui continue de tourner. | Deux processus : stop (rouge) ne doit pas être écrasé |
| L158 | règle, lent | Conséquence : le verrouillage existe, mais il est atténué. Ne t'attends pas à une exception à chaque fois. | Carte « À retenir » |
| L159 | appuyé | La protection contre deux lancements simultanés combine deux choses : la vérification des exécutions en cours, et l'isolation de création. Pas seulement la colonne version. | Deux briques ensemble : vérification + SERIALIZABLE |
| L160 | appuyé | Et pour arrêter un job depuis l'extérieur, passe par JobOperator point stop. C'est précisément ce que cette synchronisation protège. | Flèche `JobOperator.stop(...)` |
| L161 | pédagogue | Un dernier point, qui paraît anodin et qui sera central plus tard dans la formation. Le JobRepository est un singleton. | Titre « un singleton sans danger » |

### Scène 16 : Le singleton sans danger (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L162 | image concrète | Un singleton, c'est une seule instance pour toute l'application. Comme un seul guichet pour toute une ville. | Un guichet, une file de clients |
| L163 | explicatif | Ça ne pose aucun problème pour le JobRepository : il ne garde rien entre deux appels. Tout l'état vit en base. | Guichet vert, cylindre à droite |
| L164 | pédagogue, appuyé | En revanche, un singleton qui garde un total ou un compteur en mémoire, c'est un piège. Tous les lancements se partagent ce même total. | Guichet rouge avec un compteur 135,50 qui monte |
| L165 | règle | Un singleton sans état est sûr. Un singleton qui garde un compteur ne l'est pas. | Opposition en deux cartes |
| L166 | pédagogue | Retiens bien cette opposition. Nous verrons le double comptage en détail quand nous parlerons des processors et des scopes. | Compteur 271,00 puis 406,50 en rouge |
| L167 | pont | Avant de conclure, deux cas d'usage qui montrent à quoi sert tout ce dispositif. | Deux serveurs apparaissent |

### Scène 17 : Deux serveurs et l'audit (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L168 | explicatif | Deux instances de l'application tournent derrière un répartiteur. À deux heures du matin, une tâche planifiée lance le même job, avec le même runDate, sur les deux. | Deux serveurs, un répartiteur, deux flèches simultanées |
| L169 | appuyé | Grâce à la vérification et à l'isolation de création, une seule exécution démarre. L'autre échoue proprement. | Serveur A vert, serveur B rouge, exception |
| L170 | règle | Sans cela, deux traitements concurrents, et des données en double. | Deux flux qui écrivent les mêmes lignes en rouge |
| L171 | explicatif | Deuxième cas : l'audit. Quel a été le résultat du job d'hier, combien de lignes écrites, combien rejetées ? | Bureau d'un responsable, question en bulle |
| L172 | technique | La réponse est une requête SQL sur la table des steps. Les compteurs sont déjà là. | Code SQL tapé : SELECT … FROM batch_step_execution |
| L173 | règle | Rien à ajouter à l'application : l'audit vient des métadonnées. | Résultat de la requête sous forme de tableau |
| L174 | pont | Il ne reste plus qu'à voir où l'on tombe quand on oublie tout ça. Voici le palmarès des pièges. | Titre « 1.6 Top 10 des pièges » |

### Scène 18 : Top 10 des pièges, de un à cinq (1.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L175 | pédagogue | Dix pièges, avec pour chacun ce qui se passe et la parade. Les premiers touchent la configuration. | Tableau, lignes 1 à 5 |
| L176 | appuyé | Un : le schéma créé par l'application en production. Ça donne des droits excessifs. La parade : never, et un outil de migration. | Ligne 1, icône sirène |
| L177 | appuyé | Deux : un dépôt en mémoire en production. Aucune reprise après redémarrage, aucune trace. La parade : PostgreSQL persistant. | Ligne 2 |
| L178 | appuyé | Trois : abaisser l'isolation de création pour éviter les erreurs de sérialisation. Résultat : deux lancements concurrents deviennent possibles. | Ligne 3 en rouge |
| L179 | règle | La parade : garder l'isolation stricte, et gérer l'erreur par une nouvelle tentative ou une alerte. | Phrase encadrée |
| L180 | appuyé | Quatre : relancer avec les mêmes paramètres. L'instance est déjà terminée, et tu reçois JobInstanceAlreadyCompleteException. | Ligne 4 |
| L181 | explicatif | La parade : un paramètre identifiant qui change, comme une date métier, ou démarrer l'instance suivante. | Paramètre qui change de couleur |
| L182 | appuyé | Cinq : mettre l'horodatage courant en paramètre identifiant, « pour que ça marche ». Chaque relance devient une nouvelle instance. Plus de reprise. | Ligne 5, dates qui se multiplient |
| L183 | règle | La parade : un paramètre métier stable, et l'horodatage en paramètre non identifiant. | Deux colonnes identifiant / non identifiant |

### Scène 19 : Top 10 des pièges, de six à dix (1.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L184 | pont | Les cinq suivants concernent l'exploitation. | Tableau, lignes 6 à 10 |
| L185 | appuyé | Six : laisser le lancement automatique à true. Tous les jobs partent au démarrage de l'application. La parade : false, et un lancement explicite. | Ligne 6 |
| L186 | appuyé | Sept : une exécution restée en cours après un crash. Le job refuse de repartir. La parade : abandonner ou récupérer, après avoir vérifié que rien ne tourne vraiment. | Ligne 7, flèches abandon et recover |
| L187 | appuyé | Huit : ne jamais purger les tables de métadonnées. Elles deviennent énormes et les requêtes lentes. La parade : une purge planifiée. | Ligne 8, compteur de lignes qui explose |
| L188 | appuyé | Neuf : copier des imports d'une ancienne version. Erreurs de compilation. La parade : les paquets de la version six. | Ligne 9, `core.Job` barré |
| L189 | appuyé | Dix : lancer un job long dans la requête HTTP. La requête reste bloquée, le délai est dépassé. La parade : un lancement asynchrone. | Ligne 10, chrono |
| L190 | pédagogue | Et un bug silencieux typique : un test qui passe sur H2, parce que le verrouillage est trivial en mémoire. | Test vert sur H2, rouge sur PostgreSQL |
| L191 | règle | Tout test de concurrence ou de reprise doit tourner sur PostgreSQL. | Phrase encadrée |

### Scène 20 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L192 | pédagogue | Reprenons notre nuit de trois heures douze. Tu sais maintenant comment répondre au matin : les métadonnées dans PostgreSQL disent ce qui a été fait et où ça s'est arrêté. | Horloge 03:12, ligne STARTED en base, flèche vers la relance |
| L193 | récapitulatif | Un Job est une recette. Une JobInstance, la recette avec ses paramètres. Une JobExecution, une tentative. Un ExecutionContext, la sauvegarde de partie. | Quatre pastilles |
| L194 | récapitulatif | Un dépôt JDBC, déclaré avec une annotation. Six tables, dont deux colonnes version. Une isolation stricte à ne pas toucher. | Trois pastilles |
| L195 | défi | Trois exercices pour finir. Un : tu lances deux fois le même job avec la même date. Que se passe-t-il si le premier est terminé ? S'il est encore en cours ? Cite les deux exceptions. | Exercice 1 |
| L196 | défi | Deux : comment relancer le job du jour après un échec, sans jamais rejouer un job réussi ? Quel paramètre est identifiant, lequel ne l'est pas ? | Exercice 2 |
| L197 | défi | Trois : un collègue propose de passer l'isolation à READ_COMMITTED pour supprimer des erreurs dans les journaux. Quel risque, et que lui réponds-tu ? | Exercice 3 |
| L198 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L199 | transition | Dans le module suivant, tu vas lancer et piloter ce premier job proprement, et voir toute la vie d'une exécution. | Aperçu « lancer, arrêter, relancer » |
