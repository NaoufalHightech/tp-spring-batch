# Module 8 : Production, tests, monitoring, déploiement et cloud

Vidéo de formation Spring Batch, dernier module, parcours complet. Durée visée : 73 minutes, en dix parties (8.1 à 8.10). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_8.md`. Les parties Kubernetes, Data Flow et lancement asynchrone sont théoriques : code et architecture tirés des classes et de la documentation, sans exécution. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Neuf heures du matin. Un utilisateur te prévient : les montants de la nuit sont tous à zéro. Ton test est vert, ton job est COMPLETED. Personne n'a été alerté. | 09:00, test vert, montants à zéro |
| L002 | pédagogue | Voilà ce qu'est la production : tout ce qui n'est pas testé sur les valeurs, supervisé, et déployé proprement finit par arriver un matin. | Trois piliers manquants |
| L003 | pédagogue | Dernier module de la formation. Trois piliers : les tests, le monitoring, le déploiement. Et un bilan de tout le parcours. | Trois piliers |
| L004 | annonce | Dix étapes : les trois piliers, tester un job, le test de contenu, les métriques, JFR et les journaux, les douze facteurs, le lancement sans blocage, Kubernetes, Data Flow, et le bilan. | Dix pastilles 8.1 à 8.10 |

### Scène 1 : Les trois piliers et les nouveautés de la version six (8.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L005 | besoin | Mon besoin : mettre un batch en production sans dormir mal. | Batch, nuit |
| L006 | explicatif | Premier pilier : les tests. Ce que je livre fait-il ce que je crois ? JobOperatorTestUtils, et des tests de contenu. | Pilier 1 : tests |
| L007 | explicatif | Deuxième pilier : le monitoring. Que s'est-il passé cette nuit, et suis-je prévenu quand ça tourne mal ? Micrometer, JFR, journaux, alertes. | Pilier 2 : monitoring |
| L008 | explicatif | Troisième pilier : le déploiement. Où et comment ça s'exécute, redémarre, s'arrête ? Kubernetes, et Spring Cloud Data Flow. | Pilier 3 : déploiement |
| L009 | appuyé | Un récapitulatif des nouveautés de la version six. Le JobOperator, qui étend le JobLauncher. | Récap v6 : JobOperator |
| L010 | appuyé | Le JobRepository, qui étend le JobExplorer. Les paquets déplacés. Le step orienté chunk. Le retry de Spring Framework sept. | Récap v6 : paquets, ChunkOrientedStep |
| L011 | appuyé | Les événements JFR natifs. Les métriques et les observations Micrometer. Et JobOperatorTestUtils, qui remplace JobLauncherTestUtils, déprécié pour suppression. | Récap v6 : JFR, Micrometer, test utils |
| L012 | défi, direct | Question. Un tutoriel te fait utiliser JobLauncherTestUtils. Que fais-tu en Spring Batch six ? | Question « PRÉDIRE » |
| L013 | posé | JobOperatorTestUtils : il offre startJob et startStep. L'ancien est déprécié pour suppression. | Choix « JobOperatorTestUtils » |
| L014 | pont | Commençons par les tests. | Titre « 8.2 Tester » |

### Scène 2 : Tester un job et un step (8.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L015 | besoin | Mon besoin : lancer le job complet dans un test, avec une vraie base. | Test d'intégration |
| L016 | technique | SpringBootTest : un contexte Spring complet, branché sur PostgreSQL. La parité avec la production. | Code : `@SpringBootTest` |
| L017 | technique | SpringBatchTest : il active les utilitaires de test, et la prise en charge des beans StepScope et JobScope. | `@SpringBatchTest` |
| L018 | technique | JobOperatorTestUtils, injecté. Avec plusieurs jobs dans le contexte, on désigne explicitement celui à tester. | `jobTestUtils.setJob(bankJob)` |
| L019 | appuyé | Un état de départ connu : on vide la table. Un test qui dépend du test précédent est un test faux. | `jdbc.update("DELETE FROM bank_transaction")` |
| L020 | technique | Des paramètres uniques : le builder ajoute un paramètre aléatoire. Chaque test crée une nouvelle JobInstance, et ne bute pas sur déjà terminé. | `getUniqueJobParametersBuilder()` |
| L021 | technique | runDate est identifiant. inputFile est non identifiant, avec le troisième argument à false. | `.addString("runDate", …).addString("inputFile", …, false)` |
| L022 | technique | startJob lance le job et attend sa fin. | `jobTestUtils.startJob(params)` |
| L023 | technique | On vérifie le statut technique : COMPLETED. Puis les compteurs : lus cinq, filtrés un, écrits quatre. | `assertThat(step.getReadCount()).isEqualTo(5)` |
| L024 | explicatif | Pour tester un seul step, sans rejouer tout le job : startStep, avec le nom du step. | `jobTestUtils.startStep("loadBankStep")` |
| L025 | explicatif | On diagnostique plus vite, et on évite d'attendre les steps voisins. | Un seul step |
| L026 | explicatif | Et un composant StepScope, par exemple le reader, se teste hors d'un job. | Reader hors job |
| L027 | technique | Une StepExecution factice, avec les paramètres, fabriquée par MetaDataInstanceFactory. | `MetaDataInstanceFactory.createStepExecution(params)` |
| L028 | technique | Puis StepScopeTestUtils point doInStepScope : le code s'exécute dans un scope step actif. Sans cela, jobParameters n'est pas résolu. | `StepScopeTestUtils.doInStepScope(stepExecution, () -> …)` |
| L029 | défi, direct | Question. Pourquoi des paramètres uniques à chaque test ? | Question « PRÉDIRE » |
| L030 | posé | Pour créer une nouvelle JobInstance à chaque test. Avec les mêmes paramètres, le deuxième test recevrait JobInstanceAlreadyComplete. | Deux tests, même instance, en rouge |
| L031 | pont | Mais un test qui ne vérifie que les compteurs peut encore mentir. | Titre « 8.3 Test de contenu » |

### Scène 3 : Le test de contenu (8.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L032 | besoin | Mon besoin : un test qui détecte une base remplie de données fausses. | Base fausse, test vert |
| L033 | explicatif | C'est le piège récurrent, le numéro neuf des modules trois et quatre. Un test qui ne vérifie que COMPLETED et le nombre de lignes reste vert. | Test vert, données fausses |
| L034 | technique | Premier contrôle : le contenu d'une ligne précise, champ par champ. | Code : `jdbc.queryForMap("SELECT … WHERE id = 1")` |
| L035 | technique | Le compte, le type. La date est convertie : le premier octobre deux mille vingt-six, neuf heures quinze. | `isEqualTo(LocalDateTime.of(2026, 10, 1, 9, 15))` |
| L036 | technique | Le montant, avec isEqualByComparingTo : cent vingt virgule cinquante. | `isEqualByComparingTo("120.50")` |
| L037 | appuyé | Deuxième contrôle : un total calculé. Une colonne oubliée le ferait échouer. | `SELECT SUM(amount)` → 2486.25 |
| L038 | appuyé | Troisième contrôle : la ligne filtrée n'est pas en base. | `COUNT(*) WHERE id = 4` → 0 |
| L039 | explicatif | Et un test à deux lancements, comme au module quatre : les totaux ne doublent pas. | Deux lancements |
| L040 | règle | La grille d'un bon test de job : le statut, les compteurs, les valeurs d'une ligne complète, un total, les exclusions. | Cinq contrôles |
| L041 | défi, direct | Question. Un processor met LocalDateTime point now à la place de la vraie date. Quel test reste vert ? | Question « PRÉDIRE » |
| L042 | posé | Celui qui vérifie COMPLETED et le nombre de lignes. Seul le contrôle de la valeur de la date le détecte. | Test de comptage vert, test de valeur rouge |
| L043 | pont | Après les tests, le monitoring. | Titre « 8.4 Métriques » |

### Scène 4 : Les métriques avec Micrometer (8.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L044 | besoin | Mon besoin : savoir, sans ouvrir les journaux, si la nuit s'est bien passée. | Tableau de bord |
| L045 | explicatif | Spring Batch publie déjà des métriques. spring point batch point job : la durée d'un job. | Métrique `spring.batch.job` |
| L046 | explicatif | spring point batch point job point launch point count : le nombre de lancements. spring point batch point step : la durée d'un step. | `spring.batch.job.launch.count`, `spring.batch.step` |
| L047 | explicatif | item read, item process : la durée de lecture et de traitement par élément. chunk write : la durée d'écriture d'un chunk. | `spring.batch.item.read`, `spring.batch.chunk.write` |
| L048 | explicatif | Les étiquettes portent le nom du job, du step, son statut. | Étiquettes |
| L049 | technique | Pour brancher le job, on lui donne un ObservationRegistry, fourni par Spring Boot avec l'actuator. | `.observationRegistry(observationRegistry)` |
| L050 | explicatif | Ensuite, des métriques métier, que le framework ne connaît pas : un listener de step. | Code : `BankMetricsListener` |
| L051 | technique | Un compteur : une valeur qui ne fait que croître. Ici, les lignes rejetées, filtrées plus ignorées. | `Counter.builder("bank.transactions.rejected")` |
| L052 | technique | Un timer : une durée, avec nombre, somme et maximum. Calculée avec BatchMetrics point calculateDuration. | `Timer.builder("bank.load.duration")` |
| L053 | appuyé | Et le listener rend le code de sortie, inchangé, comme au module cinq. | `return stepExecution.getExitStatus();` |
| L054 | explicatif | Les alertes comptent plus que les graphiques. Une : le job n'a pas réussi à l'heure attendue. | Alerte 1 |
| L055 | explicatif | Deux : un job a échoué. Trois : une durée anormale, au-dessus de deux fois la normale. Quatre : trop de rejets. | Alertes 2, 3, 4 |
| L056 | appuyé | Un piège : les métriques tirées d'un pod de vingt secondes. Le job a disparu avant d'être lu. | Pull : pod disparu |
| L057 | explicatif | Prometheus interroge toutes les trente secondes. Un job de vingt secondes passe entre deux lectures. | Ligne de temps 0 à 60 s |
| L058 | explicatif | Deux solutions : pousser les métriques vers un Pushgateway, ou un export OTLP. Ou lire le référentiel. | Push : flèche verte |
| L059 | défi, direct | Question. Un job dure vingt secondes, Prometheus interroge toutes les trente secondes. Que voit-on ? | Question « PRÉDIRE » |
| L060 | posé | Parfois rien : le job a disparu entre deux lectures. Il faut pousser, ou lire le dépôt. | Deux traits rouges ratés |
| L061 | pont | Les métriques disent combien. Les journaux et JFR disent pourquoi. | Titre « 8.5 JFR et journaux » |

### Scène 5 : JFR et journaux structurés (8.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L062 | besoin | Mon besoin : comprendre pourquoi le job est deux fois plus lent qu'hier. | Job deux fois plus lent |
| L063 | explicatif | Java Flight Recorder enregistre des événements dans la JVM, avec très peu de coût, même en production. | JFR |
| L064 | explicatif | Spring Batch publie ses propres événements JFR : sur le chunk, la lecture, le traitement, l'écriture, la transaction. | Événements du chunk |
| L065 | appuyé | Un grand nombre d'événements de scan signale un chunk rejoué élément par élément : le mode scan du module six. | Événements ChunkScan |
| L066 | explicatif | Pour un partitionnement : des événements de découpage et d'agrégation. | Split, aggregate |
| L067 | besoin | Passons aux journaux. Mon besoin : retrouver toutes les lignes d'une exécution. | Journaux |
| L068 | technique | Un listener de job. Dans beforeJob, le MDC attache le nom du job et l'identifiant de l'exécution à chaque ligne. | `MDC.put("jobName", …)`, `MDC.put("jobExecutionId", …)` |
| L069 | technique | L'API fluide de SLF4J deux ajoute des paires clé-valeur. Elles deviennent des champs, pas du texte à analyser. | `log.atInfo().addKeyValue("params", …)` |
| L070 | technique | Dans afterJob : un récapitulatif par step, avec les compteurs du framework, déjà prêts. | `addKeyValue("read", step.getReadCount())` |
| L071 | technique | Et on nettoie le MDC, pour ne pas polluer le thread suivant. | `MDC.clear()` |
| L072 | explicatif | Dans application point properties : logging structured format console égale ecs, ou logstash. Du JSON sur la sortie standard. | `logging.structured.format.console=ecs` |
| L073 | appuyé | Une limite : le MDC est propre au thread. Dans un step multithread ou partitionné, les threads secondaires n'héritent pas de ces champs. | Threads secondaires sans MDC |
| L074 | défi, direct | Question. Pourquoi des journaux en JSON, plutôt que du texte libre ? | Question « PRÉDIRE » |
| L075 | posé | Parce que les champs sont exploitables sans analyse de texte : on filtre par identifiant d'exécution, par job, par statut. | Filtrage par champs |
| L076 | pont | Tout cela dessine une application cloud native. Voyons les douze facteurs, appliqués au batch. | Titre « 8.6 Cloud native » |

### Scène 6 : Un batch cloud native (8.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L077 | besoin | Mon besoin : qu'un batch se comporte bien dans un conteneur, qu'on peut jeter et relancer. | Conteneur |
| L078 | explicatif | La configuration dans l'environnement : l'URL, l'utilisateur, les secrets viennent de variables, pas du jar. | Facteur : config |
| L079 | explicatif | Les services externes sont attachés : la base PostgreSQL est une ressource configurée, pas codée. | Facteur : services |
| L080 | explicatif | Des processus sans état : l'état vit dans le JobRepository. Un job échoué sur un nœud reprend sur un autre. | Facteur : sans état |
| L081 | explicatif | La concurrence par les processus : on monte en charge par instances, pas seulement par threads. | Facteur : concurrence |
| L082 | explicatif | Un processus jetable : démarrage rapide, arrêt gracieux. SIGTERM sans perte, relancement sans surprise. | Facteur : jetable |
| L083 | explicatif | La parité dev et production : on teste sur PostgreSQL, pas sur une base en mémoire. | Facteur : parité |
| L084 | explicatif | Les journaux en flux : tout sur la sortie standard, collecté ailleurs. | Facteur : journaux |
| L085 | explicatif | Les tâches d'administration ponctuelles : un batch est souvent lui-même cette tâche. | Facteur : tâche |
| L086 | défi, direct | Question. Où doit vivre l'état d'un batch pour qu'un nœud puisse remplacer un autre ? | Question « PRÉDIRE » |
| L087 | posé | Dans le JobRepository, en base partagée. Aucun état local au processus. | JobRepository partagé |
| L088 | pont | Dans ce monde, comment lancer un job sans bloquer ? | Titre « 8.7 Lancer sans bloquer » |

### Scène 7 : Lancer sans bloquer en production (8.7)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L089 | besoin | Mon besoin : lancer un job sans bloquer, avec une règle à un seul endroit. Partie théorique. | Badge « théorique » |
| L090 | explicatif | Au module deux, le contrôleur confie le lancement à un exécuteur applicatif. Spring Batch six offre une seconde voie. | Rappel module 2 |
| L091 | explicatif | Un lanceur asynchrone : TaskExecutorJobOperator. Le lanceur crée lui-même le thread. | `TaskExecutorJobOperator` |
| L092 | explicatif | La règle est à un seul endroit : tout lancement par ce JobOperator est asynchrone. | Une seule règle |
| L093 | appuyé | Et start retourne la JobExecution, immédiatement, avec son identifiant. Avec l'exécuteur applicatif, l'appel est dans la tâche : rien d'utile n'est retourné. | `JobExecution` immédiate |
| L094 | appuyé | Les erreurs de lancement, instance déjà terminée ou déjà en cours, sont levées avant le thread. Perdues dans le thread avec l'exécuteur applicatif, si on ne les journalise pas. | Erreurs levées avant le thread |
| L095 | technique | Le pool : nommé, borné, avec une file, et un arrêt qui attend la fin des tâches. | Code : `ThreadPoolTaskExecutor`, `setWaitForTasksToCompleteOnShutdown(true)` |
| L096 | technique | Un délai d'attente à l'arrêt de cent vingt secondes : cohérent avec le délai de l'orchestrateur. | `setAwaitTerminationSeconds(120)` |
| L097 | technique | Puis le TaskExecutorJobOperator, avec le dépôt, le registre de jobs, et ce pool. | `new TaskExecutorJobOperator()` |
| L098 | défi, direct | Question. Un job déjà terminé est relancé avec les mêmes paramètres, par le lanceur asynchrone. Où l'erreur apparaît-elle ? | Question « PRÉDIRE » |
| L099 | posé | À l'appel, avant la création du thread : l'appelant la reçoit directement. | Exception à l'appel |
| L100 | pont | Voyons maintenant où ce job s'exécute vraiment : Kubernetes. | Titre « 8.8 Kubernetes » |

### Scène 8 : Kubernetes, Job, CronJob, reprise (8.8)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L101 | besoin | Mon besoin : exécuter mon batch chaque nuit à deux heures, et qu'il s'arrête quand il a fini. Partie théorique. | Badge « théorique » |
| L102 | explicatif | Première idée : un Deployment. Le processus redémarre après chaque fin, même réussie. C'est le piège. | Deployment, boucle |
| L103 | explicatif | La bonne idée : un CronJob, qui crée des Jobs, qui créent des pods. Le pod s'exécute puis disparaît. | CronJob → Job → Pod |
| L104 | technique | Le schedule, au format cron : tous les jours à deux heures. Et le fuseau, sinon c'est celui du cluster. | `schedule: "0 2 * * *"`, `timeZone` |
| L105 | appuyé | concurrencyPolicy Forbid : si l'exécution précédente tourne encore, on n'en lance pas une deuxième. Avec Allow, deux exécutions simultanées. | `concurrencyPolicy: Forbid` |
| L106 | technique | startingDeadlineSeconds : un déclenchement manqué de plus de dix minutes est sauté. | `startingDeadlineSeconds: 600` |
| L107 | technique | backoffLimit : le nombre de tentatives avant de déclarer le Job en échec. | `backoffLimit: 2` |
| L108 | appuyé | activeDeadlineSeconds : la durée maximale. Au-delà de deux heures, Kubernetes arrête le pod et marque le Job en échec. | `activeDeadlineSeconds: 7200` |
| L109 | technique | ttlSecondsAfterFinished : nettoyage des pods terminés après vingt-quatre heures. | `ttlSecondsAfterFinished: 86400` |
| L110 | technique | restartPolicy OnFailure : le conteneur est relancé dans le même pod. Never : un nouveau pod à chaque tentative. Pas Always, interdit pour un Job. | `restartPolicy: OnFailure` |
| L111 | appuyé | terminationGracePeriodSeconds : le délai de l'arrêt gracieux du module six. Supérieur à la durée d'un chunk. | `terminationGracePeriodSeconds: 120` |
| L112 | technique | Les secrets viennent de secretKeyRef : jamais de l'image, jamais du dépôt. | `secretKeyRef: bank-db` |
| L113 | appuyé | Un batch n'embarque pas de serveur web : web application type à none. Sinon le processus ne se termine jamais. | `SPRING_MAIN_WEBAPPLICATIONTYPE: none` |
| L114 | appuyé | Le lancement automatique est réactivé ici. Le module deux le désactive pour une API. Un Job Kubernetes doit démarrer le job tout seul. | `SPRING_BATCH_JOB_ENABLED: "true"` |
| L115 | technique | Et le nom du job à lancer, puisque l'application en contient plusieurs. | `SPRING_BATCH_JOB_NAME: bankJob` |
| L116 | explicatif | Kubernetes décide d'une nouvelle tentative d'après le code de sortie du processus. | Code de sortie ≠ 0 → nouvelle tentative |
| L117 | appuyé | Et la reprise est automatique, grâce au JobRepository : la nouvelle tentative relance avec les mêmes paramètres, et reprend l'instance échouée. | Même instance, reprise |
| L118 | défi, direct | Question. Un CronJob a backoffLimit six, restartPolicy OnFailure, et aucun activeDeadlineSeconds. Le job échoue à chaque fois pour une erreur de configuration. Que se passe-t-il ? | Question « PRÉDIRE » |
| L119 | posé | Il réessaie jusqu'à sept fois, toute la nuit, sans limite de durée. Deux réglages corrigent : un backoffLimit bas, et une durée maximale. | Sept tentatives, nuit entière |
| L120 | pont | Reste une alternative à Kubernetes seul : Spring Cloud Data Flow. | Titre « 8.9 Data Flow » |

### Scène 9 : Spring Cloud Data Flow et Spring Cloud Task (8.9)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L121 | besoin | Mon besoin : superviser des dizaines de batchs depuis un seul tableau de bord. Partie théorique. | Badge « théorique » |
| L122 | explicatif | Un à cinq jobs, sur Kubernetes : un CronJob et des métriques suffisent. Pas besoin de Data Flow. | Peu de jobs |
| L123 | explicatif | Data Flow s'impose quand on gère de nombreuses tâches, avec des définitions, des planifications, et un tableau de bord central. | Beaucoup de jobs |
| L124 | technique | Étape un : rendre l'application compatible, avec spring-cloud-starter-task et EnableTask. | `@EnableTask` |
| L125 | technique | Étape deux : enregistrer l'application, avec son nom, son type task, et son adresse. | `app register --name fileImport --type task` |
| L126 | technique | Étape trois : définir une tâche. Étape quatre : la lancer, à la demande, planifiée, ou déclenchée par un flux. | `task create …`, `task launch …` |
| L127 | technique | Étape cinq : superviser dans le tableau de bord. Les onglets Tasks et Executions, et Jobs, pour le référentiel Spring Batch. | Tableau de bord |
| L128 | appuyé | Deux bases entrent en jeu : celle du serveur Data Flow, et celle du JobRepository de ton batch. | Deux bases |
| L129 | appuyé | Pour que l'onglet Jobs fonctionne, le serveur doit lire le JobRepository de ton batch. Mal configuré, les métadonnées sont perdues au redémarrage. | Serveur sans base dédiée |
| L130 | défi, direct | Question. Quand Data Flow est-il justifié ? | Question « PRÉDIRE » |
| L131 | posé | Quand on gère beaucoup de tâches avec un tableau de bord central. Pour un à cinq jobs, un CronJob suffit. | Seuil : beaucoup de jobs |
| L132 | pont | Voyons les dix pièges de la production. | Titre « Top 10 » |

### Scène 10 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L133 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L134 | appuyé | Un : un test vert avec des données fausses. COMPLETED et le bon nombre de lignes, mais une base fausse. | Ligne 1 |
| L135 | pédagogue | Comment le repérer : un utilisateur qui signale des montants à zéro, avec tous les tests au vert. | Extrait indicatif : `amount = 0.00   status = COMPLETED   tests : ✔` |
| L136 | appuyé | Deux : aucun monitoring. L'échec est découvert par un utilisateur, à neuf heures. | Ligne 2 |
| L137 | pédagogue | Comment le repérer : aucune alerte reçue, un job FAILED depuis trois heures. | Extrait indicatif : `status = FAILED   end_time = 03:12`, aucune alerte |
| L138 | appuyé | Trois : un batch déployé comme un Deployment, ou un Job mal réglé. Le processus redémarre après chaque fin. | Ligne 3 |
| L139 | pédagogue | Comment le repérer : un pod qui redémarre sans fin après des exécutions réussies. | Extrait indicatif : `RESTARTS = 14   STATUS = CrashLoopBackOff` |
| L140 | appuyé | Quatre : Data Flow mal configuré. Pas de base dédiée, ou le JobRepository non lu. | Ligne 4 |
| L141 | pédagogue | Comment le repérer : un onglet Jobs vide, ou des exécutions perdues après un redémarrage. | Extrait indicatif : onglet Jobs : `0 résultat` |
| L142 | appuyé | Cinq : des métriques tirées d'un pod de vingt secondes. Le job disparaît avant d'être lu. | Ligne 5 |
| L143 | pédagogue | Comment le repérer : un graphique vide les nuits où le job est court. | Extrait indicatif : `spring_batch_job_seconds : aucune série` |

### Scène 11 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L144 | pont | Les cinq suivants touchent l'image, les secrets, la concurrence et les tests. | Tableau, lignes 6 à 10 |
| L145 | appuyé | Six : un serveur web dans un Job Kubernetes. Le processus ne se termine jamais. | Ligne 6 |
| L146 | pédagogue | Comment le repérer : un pod qui reste Running après la fin du job. | Extrait indicatif : `STATUS = Running   (job COMPLETED depuis 2 h)` |
| L147 | appuyé | Sept : des secrets dans l'image ou le dépôt. Une fuite d'identifiants. | Ligne 7 |
| L148 | pédagogue | Comment le repérer : un mot de passe visible dans le dépôt ou dans l'historique de l'image. | Extrait indicatif : `DB_PASSWORD=…` dans un fichier versionné |
| L149 | appuyé | Huit : un CronJob avec concurrencyPolicy Allow. Deux exécutions du même lot en parallèle. | Ligne 8 |
| L150 | pédagogue | Comment le repérer : deux pods du même CronJob en même temps. | Extrait indicatif : deux lignes `bank-load-…   Running` |
| L151 | appuyé | Neuf : un délai d'arrêt plus court qu'un chunk. Un pod tué en plein chunk, une exécution orpheline. | Ligne 9 |
| L152 | pédagogue | Comment le repérer : une exécution STARTED au matin, sans pod. | Extrait indicatif : `status = STARTED   end_time = NULL` |
| L153 | appuyé | Dix : tester sur une base en mémoire, avec des journaux non structurés. Des défauts propres à PostgreSQL apparaissent seulement en production. | Ligne 10 |
| L154 | pédagogue | Comment le repérer : un test vert en local, un échec de sérialisation en production. | Extrait indicatif : `ERROR: could not serialize access   SQLSTATE 40001` |
| L155 | pédagogue | Pourquoi on y tombe : parce que la production est le seul endroit où tout se rejoint, et le dernier endroit où on regarde. | Production : tout se rejoint |

### Scène 12 : Bilan de la formation

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L156 | pédagogue | Reprenons notre matin à neuf heures, avec des montants à zéro. Tu sais maintenant pourquoi le test était vert, et comment l'éviter. | 09:00, test de contenu |
| L157 | récapitulatif | Module un : une JobInstance égale un Job plus des paramètres identifiants. Le JobRepository, en PostgreSQL, rend tout reprenable et verrouillable. Le piège : l'isolation abaissée. | Module 1 |
| L158 | récapitulatif | Module deux : le singleton, le proxy StepScope, le JobOperator. Le piège : un job long lancé dans la requête HTTP. | Module 2 |
| L159 | récapitulatif | Module trois : un chunk égale une transaction, et la position est sauvegardée avec les données. Le piège : une taille de chunk jamais mesurée, ou un curseur sans auto-commit désactivé. | Module 3 |
| L160 | récapitulatif | Module quatre : un processor sans état, retourner null filtre. Le piège : le double comptage du singleton. | Module 4 |
| L161 | récapitulatif | Module cinq : BatchStatus n'est pas ExitStatus, le decider, le split. Le piège : un ExitStatus non aiguillé. | Module 5 |
| L162 | récapitulatif | Module six : skip pour la donnée, retry pour la ressource, restart pour le processus, et l'arrêt gracieux. Le piège : un skip silencieux. | Module 6 |
| L163 | récapitulatif | Module sept : mesurer avant d'optimiser, le partitionnement, et SKIP LOCKED. Le piège : des plages qui se chevauchent. | Module 7 |
| L164 | récapitulatif | Module huit : des tests de contenu, des métriques, des journaux, Kubernetes. Le piège : un test vert avec des données fausses. | Module 8 |
| L165 | défi | Quatre exercices pour finir. Un : un processor met LocalDateTime point now à la place de la date. Quel test reste vert, et quelle assertion le détecte ? | Exercice 1 |
| L166 | défi | Deux : un CronJob avec backoffLimit six, OnFailure, et pas de durée maximale, qui échoue à chaque fois. Que se passe-t-il, et quels deux réglages corrigent ? | Exercice 2 |
| L167 | défi | Trois : un job dure vingt secondes, Prometheus interroge toutes les trente secondes. Que voit-on, et quelles deux solutions ? | Exercice 3 |
| L168 | défi | Quatre : un job est deux fois plus lent qu'hier. Quels événements JFR consultes-tu d'abord, et que conclus-tu d'un grand nombre d'événements de scan ? | Exercice 4 |
| L169 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L170 | explicatif | Correction un. Le test qui vérifie COMPLETED et le nombre de lignes. L'assertion : la valeur de la date, champ par champ. | Exercice 1 |
| L171 | explicatif | Correction deux. Sept tentatives pendant la nuit, sans limite de durée. On baisse le backoffLimit, et on ajoute activeDeadlineSeconds. | Exercice 2 |
| L172 | explicatif | Correction trois. Rien, ou un trou : le job disparaît entre deux lectures. On pousse les métriques, ou on lit le dépôt. | Exercice 3 |
| L173 | explicatif | Correction quatre. Les événements du chunk d'abord. Beaucoup d'événements de scan : des chunks rejoués élément par élément, après des erreurs d'écriture. | Exercice 4 |
| L174 | pédagogue | Tu as maintenant tout le parcours : des fondations aux tests de production. Un travail pratique de synthèse complète cette formation. | Parcours complet, TP de synthèse à venir |
| L175 | transition | Merci d'avoir suivi cette formation. Pour la suite, ouvre le projet, lance le job, casse-le exprès, et regarde ce que raconte la base. | Fin |
