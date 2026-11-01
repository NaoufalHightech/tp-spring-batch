# Module 1 : Fondations et environnement de production

Vidéo de formation Spring Batch. Durée visée : 46 minutes, en six parties (1.1 à 1.6). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_1.md` ; le code montré est celui de `tp/tpProd`.

Règles : `docs/STYLE.md` du dépôt motions (tutoiement, vulgarisation avant le mot technique, un seul nouveau concept à la fois, transitions motivées). Le schéma personnalisé de chaque notion est dessiné en formes natives, avec la palette de la formation : vert = nominal, rouge = erreur ou piège, orange = attention, bleu = lecture, violet = écriture.

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script


### Scène 0 : Ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Il est trois heures douze. Ton serveur redémarre pour une mise à jour. Ton traitement de nuit, lui, tournait depuis deux heures. | Horloge 03:12, barre de progression d'un job qui s'arrête net |
| L002 | grave, pause avant la question | Au matin, une seule question compte : qu'est-ce qui a été fait, et qu'est-ce qui reste à faire ? | Deux colonnes « fait » et « reste » vides, point d'interrogation |
| L003 | pédagogue | Dans ce module, tu vas construire de quoi répondre à cette question. Un environnement de production pour tes traitements par lots. | Titre « Module 1 : Fondations » et la pile Java, Boot, Batch, PostgreSQL |
| L004 | annonce, rythmé | Six étapes : pourquoi un batch de production, le vocabulaire, le projet, ton premier job, ce qui se passe sous le capot, et les pièges à éviter. | Six pastilles numérotées 1.1 à 1.6 qui s'allument |

### Scène 1 : Qu'est-ce qu'un batch ? (1.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L005 | posé, image concrète | Imagine une imprimerie qui, chaque nuit, imprime tous les relevés de compte de la banque. Personne n'appuie sur un bouton pour chaque relevé. | Pile de relevés qui défile devant une machine |
| L006 | explicatif | Un batch, c'est ça : répéter un même traitement sur un très grand ensemble de données, sans intervention humaine. | Schéma Sources → READER → PROCESSOR → WRITER → Destinations, flèches vertes |
| L007 | explicatif | On lit un élément, on le transforme, on l'écrit. Puis on recommence, des millions de fois. | Les trois boîtes pulsent l'une après l'autre |
| L008 | technique | Les données viennent d'un fichier, d'une base ou d'une file d'attente, et repartent vers une base ou un autre fichier. | Les boîtes Sources et Destinations se remplissent d'icônes fichier, base, file |
| L009 | pédagogue | Alors, pourquoi on en a besoin ? Regarde les besoins techniques d'un traitement de masse. | Tableau des six besoins, ligne par ligne |
| L010 | appuyé | Sans intervention humaine : tout est automatique. Efficacité : ça dure des minutes, parfois des heures. Supervision : savoir ce qui est fait et ce qui reste. | Les trois premières lignes s'illuminent |
| L011 | appuyé | Fiabilité : reprendre un lot en échec. Parallélisme : plusieurs jobs en même temps. Et un point souvent oublié : un batch n'est pas un planificateur. | Les trois dernières lignes ; « Quartz, cron, Kubernetes » en gris |
| L012 | explicatif | Un planificateur, comme cron ou Kubernetes, décide quand lancer. Le batch fait le travail une fois lancé. | Deux boîtes : horloge à gauche, job à droite, flèche « lance » |
| L013 | pédagogue | Une question honnête avant d'aller plus loin : pourquoi un framework ? Première idée : un script qui boucle sur un fichier et insère ligne par ligne. Et ça marche. | Script shell qui boucle, barre verte |
| L014 | explicatif | Mais au bout d'un mois, plus personne ne sait où il s'est arrêté. Le relancer double les lignes. Et deux copies du script peuvent tourner en même temps. | Trois problèmes en rouge : arrêt, doublons, concurrence |
| L015 | explicatif | Chaque équipe réécrit alors son propre suivi d'exécution, sa propre reprise, son propre verrou. | Trois briques maison, chacune différente |
| L016 | règle | Spring Batch fournit ces trois briques, éprouvées : le suivi, la reprise, le verrou. À toi de fournir la lecture, le traitement et l'écriture. | Contrat : framework à gauche, ton métier à droite |
| L017 | appuyé | Pour qu'un batch soit exploitable, six principes reviennent toujours. Chacun évite un défaut précis. | Tableau « Principes d'un bon batch », en-têtes |
| L018 | explicatif | Minimiser les entrées-sorties : c'est le premier coût d'un batch. On évite de relire les mêmes données à chaque transaction, et les parcours inutiles. | Ligne 1 : « minimiser les E/S » |
| L019 | explicatif | Ne pas faire deux fois : un total recalculé qui relit tout, c'est un second passage complet pour rien. | Ligne 2 |
| L020 | appuyé | Supposer le pire : des données non contrôlées sont suspectes. Un fichier tronqué ne doit jamais être accepté comme complet. | Ligne 3, fichier coupé en rouge |
| L021 | explicatif | Tester la charge tôt : un batch grossit avec le temps. Mieux vaut découvrir sa limite avant la production que pendant. | Ligne 4, courbe de volume |
| L022 | explicatif | Sauvegarder aussi les fichiers : les fichiers plats sont oubliés, et un batch qui dépend de fichiers perdus ne repart pas. | Ligne 5 |
| L023 | règle | Et rester simple : la complexité est un risque. Des batchs monolithiques deviennent vite ingérables. | Ligne 6, encadré |
| L024 | narratif | Côté métier, tu en croises partout : les salaires qu'on vire en fin de mois, les factures de l'opérateur télécom, les bulletins de paie, les e-mails de masse. | Quatre cartes métier qui apparaissent |
| L025 | narratif | Côté technique : des tests lancés à intervalle régulier, des mises à jour de base à deux heures du matin, la consommation d'une file de messages, un test de charge. | Cinq cartes techniques ; légende « même sans Spring, on finit par en faire » |
| L026 | pédagogue, pont | Tout ça fonctionne très bien… tant que rien ne casse. Voyons comment on traite un volume de plus en plus grand. | Les cartes se rangent en bas, la ligne « volume » monte |
| L027 | explicatif | Cinq stratégies, de la plus simple à la plus complexe. D'abord un traitement normal, dans une fenêtre de nuit. | Escalier : marche 1 verte « traitement normal » |
| L028 | explicatif | Puis un batch qui tourne en même temps que les utilisateurs. Puis plusieurs jobs en parallèle. | Marches 2 bleue et 3 orange |
| L029 | explicatif | Puis un même job découpé sur plusieurs instances : on appelle ça du partitionnement. Et enfin, une combinaison de tout ça. | Marches 4 violette et 5 rouge |
| L030 | règle, lent | Même dans le cas le plus simple, prévois des points de validation et la possibilité de reprendre. | Texte « validation + reprise » encadré sur la marche 1 |
| L031 | pédagogue, pont | Cette dernière idée, la reprise, c'est le sujet du module. Reprenons notre nuit de trois heures douze. | L'escalier se replie, l'horloge 03:12 revient |

### Scène 2 : La nuit interrompue (1.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L032 | narratif | Deux heures du matin, un job de rapprochement bancaire démarre. À trois heures douze, le serveur redémarre pour une mise à jour du système. | Frise horaire : 2 h 00 (vert), 3 h 12 (rouge) |
| L033 | suspense | Quand tu arrives, rien n'a planté en apparence. Mais le job ne tourne plus. | Frise : « au matin » orange, processus disparu |
| L034 | technique | Dans la base, l'exécution est restée à l'état « démarré ». Seulement, le processus qui la portait n'existe plus. | Ligne de base « STARTED » avec un point d'interrogation |
| L035 | pédagogue | La solution : déclarer cette exécution orpheline, puis relancer. Et le traitement reprend à la dernière position confirmée, au lieu de repartir de zéro. | Flèches « abandon » puis « relance » ; la barre reprend à 60 % |
| L036 | appuyé | Sans dépôt de métadonnées persistant, ce scénario veut dire : on rejoue dix gigaoctets depuis le début, et on espère ne pas écrire deux fois les mêmes lignes. | Barre qui repart de zéro, lignes en double en rouge |
| L037 | pédagogue | Donc la vraie question n'est pas « comment je lance ? ». C'est « qu'est-ce que je dois garder pour pouvoir répondre le lendemain ? » | Trois questions qui s'affichent en cartes |

### Scène 3 : Les trois questions de production (1.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L038 | explicatif | Trois questions décident de la tenue en production. Première : que s'est-il passé cette nuit, et où le job s'est-il arrêté ? | Carte 1, flèche vers « métadonnées » |
| L039 | explicatif | Deuxième : deux serveurs peuvent-ils lancer le même job en même temps ? | Carte 2, flèche vers « verrouillage » |
| L040 | explicatif | Troisième : peut-on reprendre sans tout rejouer et sans doubler les données ? | Carte 3, flèche vers « état du step » |
| L041 | règle, posé | Les trois réponses reposent sur une base de données durable et partagée. Ici, ce sera PostgreSQL. | Cylindre PostgreSQL au centre, trois flèches |
| L042 | pédagogue | Une base en mémoire, comme H2, est très bien pour tes tests. Jamais pour la production : elle disparaît avec le processus. | Cylindre H2 qui s'efface avec le job, croix rouge |
| L043 | défi, direct | À toi de jouer. Ton job de rapprochement tourne depuis deux heures, et le serveur redémarre. Pour savoir où il en était, tu te bases sur la mémoire du processus, ou sur une base partagée ? | Question « PRÉDIRE » avec deux choix |
| L044 | posé | Dans la mémoire du processus, tout a disparu avec lui. Seule une base durable et partagée garde la trace. C'est pour ça que ce module commence par elle. | Choix « base partagée » en vert, « mémoire » en rouge |
| L045 | récapitulatif | En résumé : un batch répète lire, traiter, écrire sans intervention humaine. En production, trois questions décident : la trace, le verrou et la reprise. | Trois pastilles : trace, verrou, reprise |
| L046 | pont | Pour utiliser cette base, il faut d'abord parler le même langage que Spring Batch. Commençons par le vocabulaire. | La base glisse à droite, le mot « vocabulaire » s'affiche |

### Scène 4 : Le vocabulaire (1.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L047 | posé, image concrète | Prends une recette de cuisine : la tarte aux pommes. C'est le même plat à chaque fois. Mais chaque fois que tu la fais, avec des pommes d'une certaine récolte, tu fais une tarte précise. | Livre de recettes ; tarte du lundi, tarte du mardi |
| L048 | explicatif | Un Job, c'est la recette : un nom et une liste d'étapes. Une JobInstance, c'est la recette appliquée à des paramètres précis. | Boîte bleue Job, boîte verte JobInstance reliées, étiquette « 1 … * » |
| L049 | explicatif | Par exemple, le job de fin de journée, pour la date du cinq mai deux mille sept. Cette date est un paramètre identifiant. | JobParameters violette, flèche vers JobInstance |
| L050 | explicatif | Et une JobExecution, c'est une tentative réelle de réaliser cette instance. Elle peut réussir, ou échouer puis être reprise. | Boîte orange JobExecution, deux flèches : réussite, échec |
| L051 | règle, détache les mots | Règle d'or : JobInstance égale Job plus paramètres identifiants. | Équation animée « Job + paramètres = JobInstance » |
| L052 | explicatif | Deux lancements avec les mêmes paramètres identifiants désignent la même instance. | Deux flèches de lancement vers une seule boîte |
| L053 | explicatif | Si cette instance est déjà terminée avec succès, Spring Batch refuse de la rejouer. | Instance verte qui se ferme, flèche rouge refusée |
| L054 | image concrète | Une autre image : un billet de train pour Paris, le douze mars. Ce billet, c'est l'instance. Si tu rates le train et que tu en prends un autre avec le même billet, c'est une nouvelle tentative, pas un nouveau billet. | Billet de train, deux trains qui se succèdent |
| L055 | pédagogue | Regarde un exemple dans la table des exécutions. | Tableau JOB_EXEC_ID, JOB_INST_ID, paramètre, statut |
| L056 | technique | L'exécution un, pour l'instance un, avec la date du premier janvier : elle a échoué. | Ligne 1 : FAILED en rouge |
| L057 | technique | L'exécution deux relance la même instance, avec la même date : c'est une reprise, et elle réussit. L'instance un est maintenant fermée. | Ligne 2 : COMPLETED en vert, cadenas |
| L058 | technique | L'exécution trois a une autre date : c'est une autre instance, qui démarre à zéro. | Ligne 3 : nouvelle instance |
| L059 | pédagogue | Trois cas à retenir. Mêmes paramètres : même instance, nouvelle exécution, donc reprise. | Carte « Mêmes paramètres » |
| L060 | pédagogue | Instance réussie : elle est fermée, un nouveau lancement identique est refusé. Instance en cours : on ne peut pas la lancer une seconde fois. | Cartes « Instance réussie » et « Instance en cours » |
| L061 | défi, direct | Petit test. Le job de fin de journée du cinq mai échoue à la moitié. Tu le relances avec la même date : nouvelle instance, ou nouvelle exécution ? | Question « PRÉDIRE » |
| L062 | posé | Une nouvelle exécution de la même instance : c'est une reprise. Et si tu avais changé la date, ce serait une autre instance, qui repart de zéro. | Deux flèches : même date → reprise ; autre date → autre instance |
| L063 | pédagogue | Avant de zoomer sur le step, un mot sur les états d'une exécution. Elle passe par plusieurs étapes. | Ligne de vie d'une exécution, états alignés |
| L064 | explicatif | Starting : elle vient d'être créée. Started : elle tourne. | États STARTING, STARTED en bleu |
| L065 | explicatif | Completed : elle s'est bien terminée. Failed : elle a échoué, et on peut la reprendre. | COMPLETED vert, FAILED rouge |
| L066 | explicatif | Stopping puis Stopped : un arrêt a été demandé, puis pris en compte. Là aussi, on peut reprendre. | STOPPING, STOPPED orange |
| L067 | explicatif | Abandoned : on a décidé de ne plus jamais la reprendre. C'est un état final. | ABANDONED gris, cadenas |
| L068 | règle | Retiens la différence : failed et stopped se reprennent. Completed et abandoned se ferment. | Deux groupes : reprenables / fermés |
| L069 | défi, direct | Une exécution est restée à l'état started après un crash. Peut-on simplement la relancer ? | Question « PRÉDIRE » |
| L070 | posé | Non : Spring Batch la croit encore en cours. Il faut d'abord l'abandonner ou la récupérer, après avoir vérifié que rien ne tourne vraiment. | Flèche STARTED → abandon / recover → relance |
| L071 | pont | On sait maintenant ce qu'est un lancement. Zoomons sur ce qui se passe à l'intérieur : le step. | Zoom sur une JobExecution qui s'ouvre |

### Scène 5 : Step, StepExecution et ExecutionContext (1.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L072 | explicatif | Un job est une suite d'étapes. Chaque étape s'appelle un Step. | Trois boîtes Step reliées dans la JobExecution |
| L073 | explicatif | Chaque tentative d'un step laisse une StepExecution, avec ses compteurs : éléments lus, écrits, filtrés, ignorés. | Boîte StepExecution avec six compteurs |
| L074 | technique | On y trouve aussi les validations de transaction, et les annulations. Si un step échoue parce que le précédent a échoué, aucune StepExecution n'est créée. | Compteurs commit et rollback ; step grisé |
| L075 | image concrète | Pense à un jeu vidéo. Quand tu sauvegardes, le jeu garde ta position. Si tu coupes la console, tu reprends là où tu étais. | Console, écran de sauvegarde « niveau 3, position x » |
| L076 | explicatif | C'est exactement le rôle de l'ExecutionContext : la sauvegarde de partie du step. Par exemple, la ligne douze mille atteinte. | Boîte ExecutionContext avec « ligne 12 000 » |
| L077 | technique | Le contexte du step est sauvegardé à chaque validation de transaction. Le contexte du job est sauvegardé entre deux steps. Ce ne sont pas les mêmes objets. | Deux boîtes : contexte du step (bleue), contexte du job (verte) |
| L078 | technique | Concrètement, la table des contextes de step contient une ligne par step. Par exemple, le lecteur de fichier y inscrit le nombre de lignes lues : trois mille quatre cents. | Tableau STEP_EXEC_ID / SHORT_CONTEXT avec un petit JSON `bankCsvReader.read.count` = 3400 (exemple) |
| L079 | explicatif | Si le step échoue, la reprise repart de l'élément suivant, le trois mille quatre cent unième, sans tout relire. | Flèche verte de reprise après 3400 |
| L080 | règle | Et tout ce que tu y mets doit être sérialisable. Sans cela, la reprise est impossible. | Cadenas orange « sérialisable » |
| L081 | pont | Toutes ces informations doivent bien aller quelque part. C'est le rôle du JobRepository. | Flèches de toutes les boîtes vers un cylindre PostgreSQL |
| L082 | technique | Le JobRepository persiste les métadonnées dans PostgreSQL. Tu verras plus loin qu'il y a une colonne version qui sert au verrouillage optimiste. | Cylindre + colonne « version » en rouge |
| L083 | pont | Reste à voir où il se place dans l'architecture. | Les trois couches apparaissent |

### Scène 6 : Les trois couches (1.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L084 | explicatif | Spring Batch s'organise en trois couches. En haut, l'application : ce que tu écris, tes jobs, tes steps, tes lecteurs, tes processeurs. | Bloc vert « Application » |
| L085 | explicatif | Au milieu, le noyau : le Job, le Step, le JobOperator et le JobRepository. | Bloc bleu « Batch Core » |
| L086 | explicatif | En bas, l'infrastructure : les lecteurs, les écrivains, les services courants, utilisés par ton code et par le cœur. | Bloc violet « Batch Infrastructure » |
| L087 | appuyé | Un point à noter : l'infrastructure sert à la fois à ton application et au noyau. | Flèches de la couche basse vers les deux autres |
| L088 | pédagogue | Voici maintenant le schéma de référence. Le JobOperator lance le Job. Le Job est fait de Steps. Chaque Step a un reader, un writer, et un processor facultatif. | Schéma JobOperator → Job → Step → ItemReader, ItemWriter |
| L089 | appuyé | Et le JobRepository, en pointillé, enregistre tout ce qui se passe. | Flèche rouge pointillée vers JobRepository |
| L090 | règle | Retiens : un step a exactement un reader, un writer, et un processor facultatif. | Encadré « 1 reader, 1 writer, 0 ou 1 processor » |
| L091 | pédagogue | Une règle pratique. Quand tu cherches où placer du code, demande-toi s'il appartient à ton métier ou au moteur. Le métier va en haut. Le moteur, tu l'utilises, tu ne le réécris pas. | Deux flèches : « mon métier » vers Application, « le moteur » vers Core |
| L092 | défi, direct | Question rapide : dans quelle couche se trouve le JobRepository ? Application, noyau ou infrastructure ? | Question « PRÉDIRE » |
| L093 | posé | Dans le noyau : c'est un composant du cœur, que ton application utilise sans le réécrire. | Bloc Batch Core clignote vert |
| L094 | pont | Avant d'écrire du code, un mot sur le contexte. Cette version n'est pas celle que tu as peut-être vue dans les tutoriels. | Frise des versions 1.x à 6.x |
| L095 | explicatif | Spring Batch est né en deux mille huit, en configuration XML. Puis la configuration en Java. Puis Spring Quatre, Cinq, Six. | Frise : 1.x 2008, 2.x, 3.x, 4.x, 5.x |
| L096 | règle | À partir de la version cinq, le JobRepository exige une base de données. En production, c'est PostgreSQL. | Version 5 en vert, « base obligatoire » |
| L097 | pédagogue | Et avec la version six, il y a de vraies nouveautés que tu dois connaître avant d'écrire une ligne. | Version 6 en grand |
| L098 | explicatif | Spring Boot quatre point un point deux embarque Spring Batch six point zéro point six, via un starter dédié. | Tableau « Nouveauté / Conséquence », ligne 1 |
| L099 | appuyé | Les paquets ont bougé. Un import copié d'un tutoriel pour la version quatre ou cinq ne compilera plus. | Ligne 2 : `core.job.Job` à côté de `core.Job` barré |
| L100 | technique | Les paramètres ont leur propre paquet, core point job point parameters. Les steps, core point step. Et les lecteurs et écrivains, infrastructure point item. | Trois lignes d'import en vert |
| L101 | explicatif | Le JobOperator étend le JobLauncher, et offre start, restart, stop, abandon et recover. | Ligne 3 : cinq verbes |
| L102 | explicatif | Le JobRepository étend le JobExplorer : lire et écrire les métadonnées passent par une seule interface. | Ligne 4 |
| L103 | explicatif | Et une annotation, EnableJdbcJobRepository, déclare le dépôt JDBC. | Ligne 5 |
| L104 | récapitulatif | En résumé : un Job est une recette, une JobInstance la recette avec ses paramètres, une JobExecution une tentative. Le JobRepository garde tout, dans PostgreSQL. | Pastilles : Job, Instance, Execution, Repository |
| L105 | pont | C'est cette annotation que nous allons écrire. D'abord, il faut un projet. | Titre « 1.3 Le projet », éditeur vide |

### Scène 7 : Le pom (1.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L106 | pédagogue, besoin | Mon besoin : un projet Java qui sait parler à PostgreSQL et à Spring Batch, sans que je gère les versions à la main. | Éditeur, onglet pom.xml vide |
| L107 | pédagogue, première idée | Première idée : j'ajoute les dépendances une par une, avec leur version. Ça marche, jusqu'au jour où deux versions ne s'entendent plus. | Trois versions qui se télescopent, croix rouge |
| L108 | explicatif, décision | La bonne idée : un parent. Le parent Boot fixe toutes les versions compatibles. Je n'écris aucune version de Spring Batch à la main. | Code tapé : bloc parent avec 4.1.2 surligné |
| L109 | technique | Je précise la version de Java : vingt-cinq. Le JDK doit être le vingt-cinq. | Ligne java.version, étiquette « JDK 25 » |
| L110 | explicatif | Pourquoi y tenir ? Parce que le compilateur et l'environnement d'exécution doivent coïncider. Un JDK plus ancien refusera de charger des classes compilées pour un JDK plus récent. | Deux JDK, flèche refusée en rouge |
| L111 | technique | Ensuite, le starter Spring Batch JDBC : il apporte Spring Batch et le support JDBC pour enregistrer les métadonnées. | Dépendance starter tapée, ligne 3 |
| L112 | technique | Puis le pilote PostgreSQL, en portée runtime : il n'est utile qu'à l'exécution. | Dépendance postgresql, `runtime` surligné |
| L113 | technique | Enfin, le starter de test, en portée test : jamais dans l'application livrée. | Dépendance test, étiquette « jamais livré » |
| L114 | règle | Retiens : une seule version écrite, celle du parent. Tout le reste est aligné pour toi. | Cinq pastilles numérotées sur le code |
| L115 | défi, direct | Question : dans ce pom, où écris-tu la version de Spring Batch ? | Question « PRÉDIRE » |
| L116 | posé | Nulle part. Elle vient du parent. C'est lui qui garantit que toutes les briques sont compatibles entre elles. | Parent surligné, le reste en bleu |
| L117 | pont | Le projet sait maintenant quoi utiliser. Il reste à lui dire où est la base. | Onglet application.properties s'ouvre |

### Scène 8 : application.properties (1.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L118 | besoin | Mon besoin : configurer la base sans jamais mettre un mot de passe dans le dépôt Git. | Dépôt Git avec un mot de passe en clair, alerte rouge |
| L119 | explicatif, décision | La syntaxe dollar accolade, nom de variable, deux-points, valeur par défaut. En production, l'adresse vient de l'environnement, pas du dépôt. | Ligne url tapée, `${DB_URL:…}` surligné |
| L120 | explicatif | Pareil pour l'utilisateur : un compte dédié au batch, sans droits d'administration. | Ligne username |
| L121 | appuyé | Et pour le mot de passe, aucun défaut : il ne doit jamais figurer dans le code. | Ligne password sans valeur par défaut, cadenas |
| L122 | explicatif | Concrètement, sur ton poste, tu définis une variable d'environnement. En production, c'est l'orchestrateur, ou un coffre-fort de secrets, qui l'injecte. Le code, lui, ne change pas. | Trois environnements : poste, recette, production, chacun avec sa variable |
| L123 | technique | Deux réglages importants. Le lancement automatique des jobs est désactivé : sinon Boot lance tous les jobs au démarrage. | Ligne `spring.batch.job.enabled=false` surlignée |
| L124 | technique | Et la création du schéma est à never en production : le schéma vient d'un outil de migration versionné, comme Flyway ou Liquibase, pas de l'application. | Ligne initialize-schema, `never` en vert, `always` en orange « développement seulement » |
| L125 | explicatif | Pourquoi un outil de migration ? Parce que le schéma devient versionné : chaque changement est un fichier, relu en revue de code, et rejoué dans le même ordre sur tous les environnements. | Trois fichiers V1, V2, V3 qui s'empilent |
| L126 | explicatif | Une création automatique au démarrage ne laisse aucune trace de ce qui a changé, ni de qui l'a changé. | Même pile, fichiers vides barrés |
| L127 | pédagogue | Pendant le développement, tu peux mettre always, pour gagner du temps. Mais l'oublier en production, c'est le piège numéro un : on y revient à la fin. | Interrupteur « dev : always » orange, « prod : never » vert |
| L128 | défi, direct | Question : quelle valeur mets-tu en production pour la création du schéma ? | Question « PRÉDIRE » |
| L129 | posé | never. Le schéma vient de la migration, jamais de l'application. | `never` en vert |
| L130 | règle | Le schéma en production n'est jamais créé par l'application. | Phrase encadrée |
| L131 | pont | Il manque une pièce : dire à Spring Batch d'utiliser cette base pour son dépôt. | Onglet BatchInfraConfig.java |

### Scène 9 : EnableJdbcJobRepository ligne par ligne (1.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L132 | besoin | Mon besoin : un JobRepository qui écrit dans PostgreSQL. | Cylindre PostgreSQL vide |
| L133 | explicatif | Je commence par une classe de configuration Spring : ses annotations sont lues au démarrage du contexte. | Code tapé : `@Configuration` |
| L134 | explicatif | Puis EnableJdbcJobRepository : elle déclare un JobRepository JDBC. Dans les versions précédentes, il fallait le configurer à la main. | Annotation tapée, ancienne version barrée |
| L135 | technique | Le nom du bean DataSource : celui que Boot crée à partir des propriétés de tout à l'heure. | `dataSourceRef = "dataSource"` |
| L136 | technique | Le nom du gestionnaire de transactions, qui encadre l'écriture des métadonnées. | `transactionManagerRef` |
| L137 | technique | Le préfixe des tables. Utile pour héberger plusieurs applications dans un même schéma. | `tablePrefix = "BATCH_"` |
| L138 | technique | La classe n'a aucune méthode : l'annotation suffit. | `public class BatchInfraConfig { }` |
| L139 | pédagogue | Si tu as déjà vu Spring Batch en version quatre, tu te souviens peut-être d'une classe de configuration qui étendait un configurateur par défaut. Ici, tout tient en une annotation. | Ancienne classe barrée, annotation à côté |
| L140 | alerte, appuyé | Attention à un détail : l'isolation de création. Par défaut, elle est à SERIALIZABLE, c'est le niveau le plus strict. | Encadré orange « Ne changez pas l'isolation » |
| L141 | règle | Ne l'abaisse pas. Si tu la baisses, tu supprimes la protection contre deux lancements simultanés. | Attribut `isolationLevelForCreate` barré en rouge |
| L142 | récapitulatif | En résumé : un seul numéro de version dans le parent, des propriétés qui viennent de l'environnement, un schéma qui n'est jamais créé par l'application, et une annotation pour le dépôt. | Quatre pastilles |
| L143 | pont | Maintenant que tout est branché, écrivons un premier job. | Titre « 1.4 Ton premier job » |

### Scène 10 : Le premier job (1.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L144 | besoin | Mon besoin : un job minimal, qui affiche un message, pour vérifier que toute la chaîne fonctionne. | Console vide, curseur |
| L145 | explicatif | Pas besoin de lire un fichier ni d'écrire en base. Une tasklet suffit : une seule action. | Boîte « Tasklet = une action » |
| L146 | explicatif | Je déclare un journal : en batch, les logs sont souvent la seule interface. | Code : `Logger log` tapé |
| L147 | explicatif | Puis la tasklet, comme un bean : elle sera testable seule. | Code : `Tasklet firstTasklet()` |
| L148 | technique | C'est une lambda, parce que Tasklet n'a qu'une méthode : une interface fonctionnelle. | Lambda mise en évidence |
| L149 | technique | Le StepContribution donne accès à l'exécution du step : son nom, ses compteurs. | `contribution.getStepExecution().getStepName()` |
| L150 | technique | Je retourne FINISHED : le step est terminé. Avec CONTINUABLE, la tasklet serait relancée dans une nouvelle transaction. | `RepeatStatus.FINISHED` surligné, `CONTINUABLE` en grisé |
| L151 | explicatif | Maintenant le step. Spring injecte le JobRepository, le gestionnaire de transactions et la tasklet. | Bean `firstStep` tapé, paramètres surlignés |
| L152 | technique | Le nom du step est la clé sous laquelle ses exécutions sont enregistrées. | `new StepBuilder("firstStep", repo)` |
| L153 | technique | La tasklet s'exécute dans une transaction gérée par le gestionnaire que je lui passe. | `.tasklet(firstTasklet, tx)` |
| L154 | technique | Un point sur cette transaction. Si la tasklet lève une exception, la transaction est annulée, et le step passe en échec. | Tasklet qui lève une exception, rollback |
| L155 | explicatif | Rien n'est écrit à moitié : c'est tout ou rien. L'échec est enregistré en base, avec son message. | Ligne FAILED avec message |
| L156 | pédagogue | Le lendemain, c'est cette trace que tu liras pour comprendre ce qui s'est passé. | Œil sur la ligne FAILED |
| L157 | explicatif | Enfin le job. Son nom identifie la recette dans la table des instances. | Bean `firstJob`, `"firstJob"` surligné |
| L158 | technique | start désigne le premier step, build produit le job. | `.start(firstStep).build()` |
| L159 | règle | Un job, un step, une tasklet : c'est le plus petit batch possible. Il reste à le lancer. | Schéma Job → Step → Tasklet, trois boîtes vertes |
| L160 | besoin | Lançons-le, et regardons la console. Les lignes qui suivent sont un extrait indicatif. | Terminal, badge « extrait indicatif » |
| L161 | technique | D'abord le lancement du job, avec ses paramètres : runDate égale deux mille vingt-six, onze, zéro un. | Terminal : ligne « launched with the following parameters » |
| L162 | technique | Puis le step qui démarre. Puis notre message : bonjour depuis firstStep. | Terminal : « Executing step », « Bonjour depuis firstStep » |
| L163 | technique | Et enfin le statut final : terminé. | Terminal : « status: COMPLETED » en vert |
| L164 | défi, direct | Et si tu relances exactement la même commande, avec la même date ? Qu'est-ce qui s'affiche ? | Question « PRÉDIRE » |
| L165 | posé | Une exception : JobInstanceAlreadyCompleteException. L'instance est terminée, elle est fermée. Pour relancer, change la date : c'est une autre instance, qui s'exécute normalement. | Terminal : exception en rouge, puis nouvelle date en vert |

### Scène 11 : Lancer le job par une API (1.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L166 | besoin | Mon besoin : déclencher ce job depuis l'extérieur, par exemple depuis un ordonnanceur. | Ordonnanceur → requête HTTP → application |
| L167 | explicatif | Je définis la requête avec un record : un porteur de données immuable, sans getters à écrire. | Code : `record RunRequest(String runDate)` |
| L168 | explicatif | Et la réponse aussi, avec un switch en expression sur le statut : le compilateur vérifie que tous les cas sont couverts. | `record RunResult`, `switch` surligné |
| L169 | technique | Terminé devient « TERMINÉ ». Échec ou arrêt devient « À REPRENDRE ». Le reste garde son nom. | Table de correspondance sous le code |
| L170 | technique | Le contrôleur reçoit un JobOperator et le job. | Contrôleur : constructeur tapé |
| L171 | appuyé | Un POST, pas un GET : lancer un job modifie l'état. Un GET doit pouvoir être rejoué sans effet, par un navigateur ou un robot. | `@PostMapping`, GET barré en rouge |
| L172 | technique | JobParametersBuilder fabrique les paramètres. Et runDate est un paramètre identifiant : c'est lui qui définit la JobInstance. | `.addString("runDate", …)` surligné |
| L173 | pédagogue | Un mot sur les paramètres. Il y en a de deux sortes. | Deux colonnes : identifiants / non identifiants |
| L174 | explicatif | Les paramètres identifiants définissent l'instance. La date métier en est le bon exemple. | Colonne 1 : runDate |
| L175 | explicatif | Les non identifiants accompagnent l'exécution sans changer l'instance : un horodatage de lancement, le nom de l'opérateur, un commentaire. | Colonne 2 : horodatage, opérateur |
| L176 | technique | Dans le code, un troisième argument booléen le précise. Par défaut, un paramètre est identifiant. | Code : addString avec false |
| L177 | règle | Si tu hésites, demande-toi : deux lancements avec une valeur différente sont-ils deux traitements différents ? Si oui, identifiant. | Encadré règle |
| L178 | défi, direct | Tu veux tracer qui a lancé le job, sans créer une nouvelle instance à chaque fois. Identifiant ou non ? | Question « PRÉDIRE » |
| L179 | posé | Non identifiant. L'opérateur est une information de contexte : il ne change pas le traitement. | Opérateur en colonne 2 |
| L180 | technique | Enfin, JobOperator point start lance le job et renvoie l'exécution terminée. | `jobOperator.start(firstJob, params)` |
| L181 | technique | Un appel depuis un terminal : on envoie un POST avec la date, et la réponse contient l'identifiant de l'exécution et son statut, terminé. Cet extrait est une reconstitution. | Terminal : curl POST, réponse JSON executionId et status |
| L182 | alerte | Attention : ce lancement est synchrone. Pour un job long, la requête HTTP reste bloquée. | Chrono qui tourne, requête qui dépasse le délai |
| L183 | pédagogue | Un job qui dure vingt minutes : le client HTTP abandonnera bien avant. Le job continuera peut-être, mais plus personne ne saura comment ça s'est terminé. D'où le lancement asynchrone, que nous mettrons en place plus loin dans la formation. | Client qui lâche à 30 s, job qui continue à droite |
| L184 | récapitulatif | En résumé : un job, un step, une tasklet. Des paramètres identifiants pour définir l'instance. Un lancement par POST, et un job long qui se lance en asynchrone. | Quatre pastilles |
| L185 | pont | C'est un piège que tu retrouveras. Pour l'instant, regardons ce qui s'est passé dans la base. | Titre « 1.5 Sous le capot », cylindre PostgreSQL |

### Scène 12 : Les six tables (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L186 | besoin | Mon besoin : savoir ce que Spring Batch a écrit pendant ce petit job. | Cylindre qui s'ouvre |
| L187 | explicatif | Le schéma contient six tables et trois séquences. | ERD : six entités, trois couleurs |
| L188 | technique | La table des instances : une ligne par job et ses paramètres identifiants, avec le nom du job et la clé de hachage des paramètres. | Entité `batch_job_instance` en bleu |
| L189 | technique | La table des exécutions : une ligne par tentative, avec le statut, le code de sortie, le début, la fin, et une colonne version. | Entité `batch_job_execution`, `version` en rouge |
| L190 | technique | Les paramètres de l'exécution : nom, type, valeur, et un drapeau pour savoir s'ils sont identifiants. | Entité `batch_job_execution_params` |
| L191 | technique | Le contexte de l'exécution du job : la sauvegarde du job, sérialisée. | Entité `batch_job_execution_context` |
| L192 | technique | La table des steps : les compteurs lu, écrit, filtré, annulé, le statut, et une colonne version aussi. | Entité `batch_step_execution`, `version` en rouge |
| L193 | technique | Et le contexte du step : la sauvegarde de partie. | Entité `batch_step_execution_context` |
| L194 | explicatif | Trois séquences produisent les identifiants. Les colonnes version, en rouge, portent le verrouillage optimiste : on y arrive. | Séquences en bas, colonnes version clignotent |
| L195 | besoin | Vérifions dans PostgreSQL. La commande qui liste les tables en montre six, toutes préfixées par batch. | Terminal psql : liste des six tables |
| L196 | technique | Et celle des séquences en montre trois, une par type d'identifiant. | Terminal psql : trois séquences |
| L197 | pédagogue | Tu peux même rejouer la protection à la main, avec deux sessions. Reconstitution simplifiée. | Deux terminaux psql côte à côte |
| L198 | technique | Dans la première, tu ouvres une transaction au niveau le plus strict, tu cherches une exécution en cours, et tu n'en trouves pas. Dans la seconde, pareil. | Deux terminaux : SELECT sans résultat |
| L199 | technique | Puis les deux insèrent leur exécution. | Deux INSERT en parallèle |
| L200 | règle | La première valide. La seconde échoue avec l'erreur de sérialisation. Voilà ce que Spring Batch intercepte pour toi. | Terminal 2 : ERREUR 40001 en rouge |
| L201 | pédagogue | Regardons les lignes réellement écrites par notre premier lancement. Exemple indicatif. | Quatre petites tables apparaissent |
| L202 | technique | Une instance, pour le job firstJob, avec sa clé de hachage. | Ligne de `batch_job_instance` |
| L203 | technique | Une exécution rattachée à cette instance, au statut terminé. | Ligne de `batch_job_execution` |
| L204 | technique | Un paramètre : runDate, de type texte, identifiant vrai. | Ligne de `batch_job_execution_params` |
| L205 | technique | Et une exécution de step, avec ses compteurs : zéro lu, zéro écrit, puisque la tasklet ne lit ni n'écrit rien, et une validation de transaction. | Ligne de `batch_step_execution` |
| L206 | règle | Une trace complète, produite sans une seule ligne de code de ta part. | Les quatre lignes se relient |
| L207 | règle | Chaque transition est écrite en base immédiatement. Si le serveur est coupé, la base connaît le dernier point confirmé. C'est ce qui rend la reprise possible. | Flèche « coupure » ; dernier point en vert |
| L208 | pont | Et au lancement, comment Spring Batch décide-t-il qu'un job peut démarrer ? | Flèche vers « vérification du lancement » |

### Scène 13 : La vérification d'un lancement (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L209 | explicatif | Première étape : chercher la JobInstance à partir du nom du job et des paramètres identifiants, grâce à la clé de hachage. | Boîte 1 bleue |
| L210 | explicatif | Deuxième étape : si elle existe, y a-t-il une exécution en cours ? Alors, c'est refusé. | Boîte 2 rouge, exception JobExecutionAlreadyRunningException |
| L211 | explicatif | Troisième étape : l'instance est-elle déjà terminée avec succès ? Alors, c'est encore refusé. | Boîte 3 rouge, JobInstanceAlreadyCompleteException |
| L212 | explicatif | Sinon, on crée une nouvelle JobExecution. | Boîte 4 verte |
| L213 | pédagogue, pont | Mais regarde bien : ces lectures puis cette création ne forment pas une opération atomique. Si deux serveurs passent la première étape en même temps ? | Deux flèches arrivent en même temps sur la boîte 1 |
| L214 | explicatif | Pour comprendre, prends l'isolation la plus faible : chaque transaction ne voit que ce qui est déjà validé. Les deux voient « aucune exécution en cours », et créent chacune la leur. | Deux transactions A et B, chacune crée son exécution en rouge |
| L215 | explicatif | C'est la raison d'être de l'isolation de création. Elle est exécutée au niveau le plus strict de PostgreSQL. | Boîte 4 : étiquette « SERIALIZABLE » |
| L216 | explicatif | Ce niveau fait échouer l'une des deux transactions concurrentes, avec une erreur de sérialisation. | Deux transactions : l'une verte, l'autre rouge |
| L217 | règle | Le perdant reçoit une exception. C'est le comportement voulu : le lancement doit être retenté, ou abandonné. | Phrase encadrée |
| L218 | défi, direct | Question : on a baissé l'isolation, et les deux serveurs passent la vérification au même instant. Que se passe-t-il ? | Question « PRÉDIRE » |
| L219 | posé | Les deux créent une exécution : deux traitements concurrents, des données en double. C'est exactement ce que l'isolation stricte empêche. | Deux flux rouges qui écrivent les mêmes lignes |
| L220 | pont | Voilà pour la création. Mais une exécution en cours est aussi mise à jour, sans cesse. Et là, on change de mécanisme. | Titre « le verrouillage optimiste » |

### Scène 14 : Le verrouillage optimiste (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L221 | image concrète | Imagine un document partagé. Deux collègues l'ouvrent en même temps, à la version trois. Le premier enregistre. Le second veut enregistrer à son tour. | Deux avatars, un document « v3 » |
| L222 | explicatif | Soit on bloque le document pour tout le monde pendant l'édition. Soit on laisse faire et on vérifie à l'enregistrement. | Deux options : cadenas ou vérification |
| L223 | explicatif | Le second choix s'appelle un verrouillage optimiste : on parie sur l'absence de conflit, et on le détecte à l'écriture. | Option vérification mise en avant |
| L224 | technique | Dans Spring Batch, chaque ligne d'exécution porte une colonne version. Le serveur A lit l'exécution quarante-deux, version trois. | Diagramme de séquence : A lit, version = 3 |
| L225 | technique | Le serveur B la lit aussi, version trois. | B lit, version = 3 |
| L226 | technique | A écrit sa mise à jour avec une condition : version égale trois. Une ligne est modifiée, la version passe à quatre. | UPDATE … WHERE version = 3, retour vert « version = 4 » |
| L227 | technique, couperet | B écrit avec la même condition. Mais la version est maintenant quatre : aucune ligne ne correspond. | UPDATE de B, retour rouge « 0 ligne » |
| L228 | explicatif | Résultat : une OptimisticLockingFailureException. Le second écrivain est refusé. | Exception rouge sur la lifeline de B |
| L229 | règle | Aucun verrou de base n'est tenu pendant la lecture : pas de blocage. Le prix à payer : le perdant doit gérer l'échec. | Encadré avantage / coût |
| L230 | explicatif | Face à lui, le verrouillage pessimiste : on bloque la ligne dès la lecture. Personne d'autre ne peut la modifier tant que tu n'as pas fini. C'est sûr, mais tout le monde attend, et un traitement long bloque les autres. | Cadenas rouge sur une ligne, file d'attente |
| L231 | pédagogue | Pour un dépôt de métadonnées lu et écrit très souvent, le choix optimiste évite les blocages. Les conflits sont rares : on les détecte au lieu de les empêcher. | Balance : optimiste (vert) contre pessimiste (orange) |
| L232 | défi, direct | Question : le serveur B écrit avec la version trois alors que la base est à la version quatre. Combien de lignes sont modifiées ? | Question « PRÉDIRE » |
| L233 | posé | Zéro. Et c'est précisément ce zéro qui déclenche l'exception. | Compteur « 0 » en rouge |
| L234 | pont | C'est le principe. Mais en pratique, ce mécanisme est atténué. Il faut que tu saches pourquoi. | Titre « ce qu'il faut savoir » |

### Scène 15 : Le piège du verrouillage atténué (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L235 | explicatif | En théorie, une copie périmée d'une exécution doit lever l'exception à l'écriture. | Carte « Le mécanisme » |
| L236 | technique, appuyé | En pratique, dans la classe JdbcJobExecutionDao, une méthode de synchronisation compare la version en base à celle de l'objet en mémoire, avant l'écriture. | Carte « Le piège », code `JdbcJobExecutionDao` |
| L237 | technique | Si elles diffèrent, elle recopie la version de la base, et ne fait que monter le statut, jamais le baisser. | Statuts : flèche vers le haut verte, vers le bas barrée |
| L238 | explicatif | Pourquoi ? Pour qu'un ordre d'arrêt, posé depuis un autre processus, ne soit pas écrasé par une exécution qui continue de tourner. | Deux processus : stop (rouge) ne doit pas être écrasé |
| L239 | règle, lent | Conséquence : le verrouillage existe, mais il est atténué. Ne t'attends pas à une exception à chaque fois. | Carte « À retenir » |
| L240 | appuyé | La protection contre deux lancements simultanés combine deux choses : la vérification des exécutions en cours, et l'isolation de création. Pas seulement la colonne version. | Deux briques ensemble : vérification + SERIALIZABLE |
| L241 | appuyé | Et pour arrêter un job depuis l'extérieur, passe par JobOperator point stop. C'est précisément ce que cette synchronisation protège. | Flèche `JobOperator.stop(...)` |
| L242 | défi, direct | Dernière question : un test qui exige l'exception à chaque copie périmée, est-il fiable ? | Question « PRÉDIRE » |
| L243 | posé | Non. À cause de la synchronisation, l'exception n'est pas systématique. Un tel test se trompera. | Test rouge, étiquette « attend l'exception » |
| L244 | pédagogue | Un dernier point, qui paraît anodin et qui sera central plus tard dans la formation. Le JobRepository est un singleton. | Titre « un singleton sans danger » |

### Scène 16 : Le singleton sans danger (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L245 | image concrète | Un singleton, c'est une seule instance pour toute l'application. Comme un seul guichet pour toute une ville. | Un guichet, une file de clients |
| L246 | explicatif | Ça ne pose aucun problème pour le JobRepository : il ne garde rien entre deux appels. Tout l'état vit en base. | Guichet vert, cylindre à droite |
| L247 | pédagogue, appuyé | En revanche, un singleton qui garde un total ou un compteur en mémoire, c'est un piège. Tous les lancements se partagent ce même total. | Guichet rouge avec un compteur 135,50 qui monte |
| L248 | règle | Un singleton sans état est sûr. Un singleton qui garde un compteur ne l'est pas. | Opposition en deux cartes |
| L249 | pédagogue | Retiens bien cette opposition. Nous verrons le double comptage en détail quand nous parlerons des processors et des scopes. | Compteur 271,00 puis 406,50 en rouge |
| L250 | pont | Avant de conclure, deux cas d'usage qui montrent à quoi sert tout ce dispositif. | Deux serveurs apparaissent |

### Scène 17 : Deux serveurs et l'audit (1.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L251 | explicatif | Deux instances de l'application tournent derrière un répartiteur. À deux heures du matin, une tâche planifiée lance le même job, avec le même runDate, sur les deux. | Deux serveurs, un répartiteur, deux flèches simultanées |
| L252 | appuyé | Grâce à la vérification et à l'isolation de création, une seule exécution démarre. L'autre échoue proprement. | Serveur A vert, serveur B rouge, exception |
| L253 | règle | Sans cela, deux traitements concurrents, et des données en double. | Deux flux qui écrivent les mêmes lignes en rouge |
| L254 | explicatif | Deuxième cas : l'audit. Quel a été le résultat du job d'hier, combien de lignes écrites, combien rejetées ? | Bureau d'un responsable, question en bulle |
| L255 | technique | La réponse est une requête SQL sur la table des steps. Les compteurs sont déjà là. | Code SQL tapé : SELECT … FROM batch_step_execution |
| L256 | règle | Rien à ajouter à l'application : l'audit vient des métadonnées. | Résultat de la requête sous forme de tableau |
| L257 | explicatif | Un dernier avantage de ces tables : elles grossissent à chaque exécution. On supprime les anciennes lignes par date de fin, avec une tâche planifiée. | Tables qui grossissent, ciseaux sur les lignes anciennes |
| L258 | règle | Sans purge, les requêtes ralentissent peu à peu. C'est le piège numéro huit. | Courbe de temps de requête qui monte |
| L259 | récapitulatif | En résumé : six tables, deux colonnes version, une isolation stricte, un verrouillage optimiste atténué et des singletons sans état. | Cinq pastilles |
| L260 | pont | Il ne reste plus qu'à voir où l'on tombe quand on oublie tout ça. Voici le palmarès des pièges. | Titre « 1.6 Top 10 des pièges » |

### Scène 18 : Top 10 des pièges, de un à cinq (1.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L261 | pédagogue | Dix pièges, avec pour chacun ce qui se passe et la parade. Les premiers touchent la configuration. | Tableau, lignes 1 à 5 |
| L262 | appuyé | Un : le schéma créé par l'application en production. Ça donne des droits excessifs. La parade : never, et un outil de migration. | Ligne 1, icône sirène |
| L263 | pédagogue | Comment le repérer : l'application démarre, et tu vois des instructions de création de tables dans les journaux de démarrage. | Extrait indicatif : `CREATE TABLE batch_job_instance (…)` dans le journal de démarrage ; `initialize-schema=always` |
| L264 | appuyé | Deux : un dépôt en mémoire en production. Aucune reprise après redémarrage, aucune trace. La parade : PostgreSQL persistant. | Ligne 2 |
| L265 | pédagogue | Le signe typique : un job qui reprend parfaitement en local, et jamais après un redémarrage en recette. | Extrait indicatif : `jdbc:h2:mem:testdb` ; après redémarrage `SELECT count(*) FROM batch_job_instance` → 0 |
| L266 | appuyé | Trois : abaisser l'isolation de création pour éviter les erreurs de sérialisation. Résultat : deux lancements concurrents deviennent possibles. | Ligne 3 en rouge |
| L267 | règle | La parade : garder l'isolation stricte, et gérer l'erreur par une nouvelle tentative ou une alerte. | Phrase encadrée |
| L268 | pédagogue | Comment le repérer : un jour, tu vois deux exécutions du même job qui tournent en même temps. | Extrait indicatif : `firstJob runDate=2026-11-01 STARTED` deux fois ; `isolationLevelForCreate = READ_COMMITTED` |
| L269 | appuyé | Quatre : relancer avec les mêmes paramètres. L'instance est déjà terminée, et tu reçois JobInstanceAlreadyCompleteException. | Ligne 4 |
| L270 | explicatif | La parade : un paramètre identifiant qui change, comme une date métier, ou démarrer l'instance suivante. | Paramètre qui change de couleur |
| L271 | pédagogue | Comment le repérer : le même job refuse de partir le lendemain d'un succès, avec le même paramètre. | Extrait indicatif : `JobInstanceAlreadyCompleteException: A job instance already exists and is complete for identifying parameters={runDate=2026-11-01}` |
| L272 | appuyé | Cinq : mettre l'horodatage courant en paramètre identifiant, « pour que ça marche ». Chaque relance devient une nouvelle instance. Plus de reprise. | Ligne 5, dates qui se multiplient |
| L273 | règle | La parade : un paramètre métier stable, et l'horodatage en paramètre non identifiant. | Deux colonnes identifiant / non identifiant |
| L274 | pédagogue | Comment le repérer : une relance qui repart de zéro, alors que tu attendais une reprise. | Extrait indicatif : `addString("runAt", Instant.now().toString())` ; instances 101, 102, 103 pour le même jour |

### Scène 19 : Top 10 des pièges, de six à dix (1.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L275 | pont | Les cinq suivants concernent l'exploitation. | Tableau, lignes 6 à 10 |
| L276 | appuyé | Six : laisser le lancement automatique à true. Tous les jobs partent au démarrage de l'application. La parade : false, et un lancement explicite. | Ligne 6 |
| L277 | pédagogue | Comment le repérer : des jobs inattendus dans les journaux, au démarrage d'un environnement de test. | Extrait indicatif : `Job: [name=importJob] launched` puis `Job: [name=exportJob] launched` au démarrage |
| L278 | appuyé | Sept : une exécution restée en cours après un crash. Le job refuse de repartir. La parade : abandonner ou récupérer, après avoir vérifié que rien ne tourne vraiment. | Ligne 7, flèches abandon et recover |
| L279 | pédagogue | Comment le repérer : le message « déjà en cours » alors que le serveur est arrêté depuis longtemps. | Extrait indicatif : `JobExecutionAlreadyRunningException: A job execution for this job is already running: id=42, status=STARTED` |
| L280 | appuyé | Huit : ne jamais purger les tables de métadonnées. Elles deviennent énormes et les requêtes lentes. La parade : une purge planifiée. | Ligne 8, compteur de lignes qui explose |
| L281 | pédagogue | Comment le repérer : une requête d'audit qui prend de plus en plus de temps, mois après mois. | Extrait indicatif : `SELECT count(*) FROM batch_step_execution;` → 48 213 904 lignes |
| L282 | appuyé | Neuf : copier des imports d'une ancienne version. Erreurs de compilation. La parade : les paquets de la version six. | Ligne 9, `core.Job` barré |
| L283 | pédagogue | Comment le repérer : le compilateur te le dit tout de suite. C'est le piège le plus facile à trouver. | Extrait indicatif : `error: package org.springframework.batch.core.Job does not exist` |
| L284 | appuyé | Dix : lancer un job long dans la requête HTTP. La requête reste bloquée, le délai est dépassé. La parade : un lancement asynchrone. | Ligne 10, chrono |
| L285 | pédagogue | Comment le repérer : un client HTTP qui expire, alors que le job a bien tourné côté serveur. | Extrait indicatif : `curl: (28) Operation timed out after 30001 ms` |
| L286 | pédagogue | Et un bug silencieux typique : un test qui passe sur H2, parce que le verrouillage est trivial en mémoire. | Test vert sur H2, rouge sur PostgreSQL |
| L287 | règle | Tout test de concurrence ou de reprise doit tourner sur PostgreSQL. | Phrase encadrée |

### Scène 20 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L288 | pédagogue | Reprenons notre nuit de trois heures douze. Tu sais maintenant comment répondre au matin : les métadonnées dans PostgreSQL disent ce qui a été fait et où ça s'est arrêté. | Horloge 03:12, ligne STARTED en base, flèche vers la relance |
| L289 | récapitulatif | Un Job est une recette. Une JobInstance, la recette avec ses paramètres. Une JobExecution, une tentative. Un ExecutionContext, la sauvegarde de partie. | Quatre pastilles |
| L290 | récapitulatif | Un dépôt JDBC, déclaré avec une annotation. Six tables, dont deux colonnes version. Une isolation stricte à ne pas toucher. | Trois pastilles |
| L291 | défi | Trois exercices pour finir. Un : tu lances deux fois le même job avec la même date. Que se passe-t-il si le premier est terminé ? S'il est encore en cours ? Cite les deux exceptions. | Exercice 1 |
| L292 | défi | Deux : comment relancer le job du jour après un échec, sans jamais rejouer un job réussi ? Quel paramètre est identifiant, lequel ne l'est pas ? | Exercice 2 |
| L293 | défi | Trois : un collègue propose de passer l'isolation à READ_COMMITTED pour supprimer des erreurs dans les journaux. Quel risque, et que lui réponds-tu ? | Exercice 3 |
| L294 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L295 | explicatif | Correction de l'exercice un. Si le premier lancement est terminé, le second lève JobInstanceAlreadyCompleteException. S'il est encore en cours, JobExecutionAlreadyRunningException. | Exercice 1 : deux exceptions affichées |
| L296 | explicatif | Exercice deux. La date métier est identifiante : elle fait l'instance. Un horodatage de lancement ou un compteur de relance sera non identifiant : il ne change pas l'instance, donc la reprise reste possible. | Exercice 2 : deux colonnes identifiant / non identifiant |
| L297 | explicatif | Exercice trois. READ_COMMITTED supprime la protection contre deux lancements simultanés : on peut avoir deux traitements concurrents. La bonne réponse : garder l'isolation stricte, et gérer l'erreur par une nouvelle tentative ou une alerte. | Exercice 3 : isolation stricte en vert |
| L298 | transition | Dans le module suivant, tu vas lancer et piloter ce premier job proprement, et voir toute la vie d'une exécution. | Aperçu « lancer, arrêter, relancer » |
