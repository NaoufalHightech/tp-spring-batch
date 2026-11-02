# Module 5 : Flux et orchestration

Vidéo de formation Spring Batch. Durée : environ trente minutes (estimation du moteur), en sept parties (5.1 à 5.7). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_5.md`. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées). Parti pris de cette version : un mentor qui raconte, avec cinq images, avant chaque bloc de code. Le colis (BatchStatus et ExitStatus), l'aiguillage ferroviaire (flux conditionnel), le chef d'orchestre (decider), le jeu de société (machine à états), le péage d'autoroute (split, threads et connexions).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de mentor qui raconte une histoire : posé, imagé, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture et flashbacks

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Imagine : le chargement du soir a échoué. L'alerte est partie, elle a réussi. Et le matin, le tableau de bord affiche ton job en vert. Personne n'a rien vu de la nuit. | Chargement rouge, alerte verte, job vert |
| L002 | pédagogue | Ce bug vient d'une seule ligne : une branche d'erreur terminée par end, au lieu de fail. Aujourd'hui, tu apprends à orchestrer un job pour que ça n'arrive plus. | Branche d'erreur, `.end()` en rouge |
| L003 | rappel | Un rappel du module un. Chaque step terminé écrit son statut et son code de sortie dans batch step execution. | Table batch_step_execution : status, exit_code |
| L004 | rappel | Et du module deux : les beans Step, Flow et Job sont des plans, des singletons sans état. L'exécution, elle, vit dans les JobExecution. | Plan décrit, exécution à part |
| L005 | pédagogue | Ce module est plein de mots techniques. Alors je te propose cinq images, une par grande idée. Garde-les en tête : elles te guideront jusqu'au code. | Cinq cartes d'images |
| L006 | explicatif | Le colis, pour comprendre les deux statuts. L'aiguillage ferroviaire, pour le flux conditionnel. Le chef d'orchestre, pour le decider. | Colis, aiguillage, chef d'orchestre |
| L007 | explicatif | Le jeu de société, pour comprendre le moteur. Et le péage d'autoroute, pour faire passer des flux en parallèle. | Jeu de société, péage |
| L008 | annonce | Sept étapes : du pipeline au graphe, les deux statuts, l'aiguillage, le decider, le moteur, le split, et les pièges. | Sept pastilles 5.1 à 5.7 |

### Scène 1 : Du pipeline au graphe (5.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L009 | besoin | Mon besoin : un traitement de nuit qui ne se contente pas d'enchaîner des steps en ligne droite. | Ligne droite A, B, C |
| L010 | pédagogue | Jusqu'ici, ton job était un train sur une voie unique : step A, puis step B, puis step C. Si A déraille, tout s'arrête. | Train sur voie unique, A en rouge |
| L011 | explicatif | Un vrai traitement se ramifie. On charge le fichier, et on regarde comment ça s'est passé. | Gare « chargement » |
| L012 | explicatif | Tout s'est bien passé : on produit le rapport. Beaucoup de lignes rejetées : on prévient l'équipe. Échec : on prévient aussi. | Trois voies depuis le chargement |
| L013 | appuyé | Voilà la vue d'ensemble. Un job n'est plus une ligne, c'est un réseau : des gares, qui sont les steps, et des aiguillages qui décident où va le train. | Réseau complet : gares et aiguillages |
| L014 | pédagogue | Retiens le plan : une gare de départ, le chargement ; trois directions possibles ; et des terminus, succès ou échec. | Départ, trois directions, terminus |
| L015 | technique | L'écriture simple : start a, next b, next c. Si a échoue, le job s'arrête. | Code : `.start(a).next(b).next(c)` |
| L016 | technique | L'écriture conditionnelle : on, avec un code, to, un step. Et from, pour repartir d'une gare précise. | Code : `.start(a).on("COMPLETED").to(b).from(a).on("FAILED").to(c)` |
| L017 | défi, direct | Question. Dans un enchaînement simple, le step a échoue. Que fait le job ? | Question « PRÉDIRE » |
| L018 | posé | Il s'arrête. Pour réagir à l'échec, il faut un flux conditionnel. | Job arrêté |
| L019 | pont | Pour écrire ces aiguillages, il faut d'abord comprendre deux statuts qu'on confond tout le temps. | Titre « 5.2 Le colis » |

### Scène 2 : BatchStatus contre ExitStatus, l'histoire du colis (5.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L020 | besoin | Mon besoin : savoir ce que regarde exactement un on, quand je décris une transition. | Transition `on("COMPLETED")` |
| L021 | pédagogue | Imagine un colis. Il voyage, et il porte deux informations bien distinctes. | Un colis |
| L022 | pédagogue | La première, c'est l'état du colis : en cours, livré, perdu. C'est le transporteur qui le décide. Toi, tu n'y touches pas. | État du colis : en cours, livré, perdu |
| L023 | explicatif | Dans Spring Batch, ça s'appelle le BatchStatus. C'est le framework qui le gère. | BatchStatus = état du colis |
| L024 | pédagogue | La seconde, c'est le mot écrit par le livreur sur le bordereau : livré au voisin, boîte pleine, porte cassée. Le livreur écrit ce qu'il veut. | Bordereau : « livré au voisin », « boîte pleine » |
| L025 | explicatif | Dans Spring Batch, ça s'appelle l'ExitStatus. Et celui-là, tu peux le personnaliser. | ExitStatus = mot du livreur |
| L026 | règle | Et voici la règle d'or : un on regarde toujours le mot du livreur, l'ExitStatus. Jamais l'état du colis. | Phrase encadrée |
| L027 | technique | Les valeurs du BatchStatus : STARTING, STARTED, STOPPING, STOPPED, FAILED, COMPLETED, ABANDONED. Il sert à l'état technique, et à la reprise. | Énumération fixe |
| L028 | technique | L'ExitStatus est un code, un texte libre : COMPLETED, FAILED, STOPPED, NOOP, ou ton propre mot, par exemple COMPLETED WITH REJECTS. | Codes libres |
| L029 | explicatif | Par défaut, les deux coïncident : un step réussi a un BatchStatus COMPLETED, et un livreur qui écrit COMPLETED. C'est ce qui entretient la confusion. | Deux rails alignés |
| L030 | appuyé | Dès que le livreur écrit un mot personnalisé, les deux divergent : le colis est livré, mais le bordereau dit autre chose. | Deux rails qui divergent |
| L031 | besoin | Cas concret : le chargement a réussi, mais avec cent cinquante lignes rejetées. Je veux que le flux le sache. | Chargement réussi, 150 rejets |
| L032 | technique | Je donne la parole au livreur : un listener de step, appelé après le step. Il implémente StepExecutionListener. | Code : `implements StepExecutionListener` |
| L033 | technique | afterStep retourne l'ExitStatus final. C'est le moment d'écrire un autre mot sur le bordereau. | `afterStep(StepExecution stepExecution)` |
| L034 | appuyé | Un colis perdu reste perdu : si le step a échoué, on ne touche pas à son code FAILED. | `if (status != COMPLETED) return …` |
| L035 | technique | Sinon, si le nombre de lignes filtrées dépasse cent, le livreur écrit un code personnalisé. | `getFilterCount() > MAX_REJECTS` |
| L036 | appuyé | Le colis est bien livré : le BatchStatus reste COMPLETED. Seul le mot sur le bordereau change. | BatchStatus COMPLETED, ExitStatus COMPLETED_WITH_REJECTS |
| L037 | règle | La reprise lit l'état du colis, le BatchStatus. L'aiguillage lit le bordereau, l'ExitStatus. | Deux usages |
| L038 | défi, direct | Question. Le step a réussi, mais le listener a écrit COMPLETED WITH REJECTS. Que valent le BatchStatus et l'ExitStatus ? | Question « PRÉDIRE » |
| L039 | posé | BatchStatus COMPLETED. ExitStatus COMPLETED WITH REJECTS. Colis livré, mais le bordereau dit autre chose. | Deux valeurs |
| L040 | pont | Il faut maintenant que le réseau sache lire ce bordereau. C'est le rôle des aiguillages. | Titre « 5.3 L'aiguillage » |

### Scène 3 : Un flux conditionnel, l'aiguillage ferroviaire (5.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L041 | besoin | Mon besoin : charger le fichier, produire le rapport si tout va bien, prévenir l'équipe sinon. | loadBankStep, bankReportStep, alertStep |
| L042 | pédagogue | Dessinons le réseau avant d'écrire du code. Une gare de départ : le chargement. | Gare de départ |
| L043 | pédagogue | Si la voie est libre, le train file vers la gare du rapport. S'il déraille, il est aiguillé vers la gare de l'alerte. | Deux voies : rapport, alerte |
| L044 | pédagogue | Et un filet de sécurité : si le train prend une direction que personne n'avait prévue, on arrête tout le réseau. | Voie imprévue : arrêt du réseau |
| L045 | technique | Maintenant, le code, ligne par ligne. Le train part de la gare : start, loadBankStep. | Code : `new JobBuilder("bankFlowJob", jobRepository).start(loadBankStep)` |
| L046 | technique | Son retour est un builder de flux : on peut maintenant déclarer des aiguillages. | Builder de flux |
| L047 | technique | Si le mot du livreur est COMPLETED, la voie est libre : le train va vers bankReportStep. | `.on("COMPLETED").to(bankReportStep)` |
| L048 | technique | Pour déclarer un autre aiguillage, on revient à la gare de départ, avec from loadBankStep. Si le train a déraillé, FAILED, il va vers alertStep. | `.from(loadBankStep).on("FAILED").to(alertStep)` |
| L049 | appuyé | Après l'alerte, quelle que soit l'issue, étoile, le job se termine en échec, avec fail. | `.on("*").fail()` |
| L050 | appuyé | Sans cela, le job pourrait finir réussi : l'alerte, elle, a réussi. Alerte verte, job vert, alors que le chargement est rouge. | Alerte verte, job vert : faux |
| L051 | technique | On revient encore à la gare de départ, et on pose le filet de sécurité : tout autre code arrête le réseau, explicitement. | `.from(loadBankStep).on("*").fail()` |
| L052 | appuyé | Un code personnalisé oublié, STOPPED, UNKNOWN : sans ce filet, le train reste sans voie. | Code oublié sans issue |
| L053 | technique | Le end ferme la définition du réseau, et build produit le job. | `.end().build()` |
| L054 | explicatif | L'alerte est une tasklet. Elle retrouve le job en cours à partir de sa contribution. | Code : `contribution.getStepExecution().getJobExecution()` |
| L055 | technique | Elle y cherche l'exécution du step de chargement : ses compteurs sont déjà enregistrés. | Filtre sur `loadBankStep` |
| L056 | technique | Le message donne le lot, le nombre de lignes rejetées, et le nombre de lignes lues. | `"Chargement du %s : %d lignes rejetées sur %d lues"` |
| L057 | explicatif | AlertSender est une interface applicative : courriel, messagerie d'équipe. Le composant reste sans état, comme au module quatre. | Composant sans état |
| L058 | explicatif | Un mot sur les panneaux. Étoile remplace n'importe quelle suite de caractères. Point d'interrogation, un seul caractère. | Motifs `*` et `?` |
| L059 | appuyé | Quand plusieurs panneaux conviennent, le plus précis l'emporte. COMPLETED avant COMP étoile, avant étoile. L'ordre d'écriture ne compte pas. | Précision décroissante |
| L060 | explicatif | Trois façons de terminer le réseau. End : terminus, réussite. Fail : terminus, échec. StopAndRestart : le train s'arrête en gare, prêt à repartir. | Trois fins |
| L061 | défi, direct | Question. Le code COMPLETED WITH REJECTS arrive, et aucun aiguillage ne le prévoit. Que se passe-t-il, avec le filet étoile ? | Question « PRÉDIRE » |
| L062 | posé | Le filet l'attrape : le job se termine en échec, explicitement. Sans le filet, le moteur lève une erreur : Next state not found. | Job FAILED explicite |
| L063 | règle | Une branche d'erreur se termine par fail, quand la panne doit rester visible dans batch job execution. | Phrase encadrée |
| L064 | explicatif | C'est la façon dont le réseau se termine qui fixe l'état final du job. Pas le step qui a échoué. | Flux, puis état final |
| L065 | pont | Parfois, le mot du livreur ne suffit pas : on veut décider à partir d'un chiffre. Il faut un arbitre. | Titre « 5.4 Le chef d'orchestre » |

### Scène 4 : Le decider, le chef d'orchestre (5.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L066 | besoin | Mon besoin : aiguiller selon un compteur, par exemple le nombre de lignes rejetées. | Compteur rejectedCount |
| L067 | pédagogue | Imagine un chef d'orchestre, ou un arbitre. Il ne joue d'aucun instrument. Il se place entre deux morceaux, et il décide de la suite. | Chef d'orchestre entre deux steps |
| L068 | pédagogue | Le decider fait pareil : il se place entre deux steps. Il lit un compteur, le nombre de rejets, et il dit : on continue, ou on alerte l'équipe. | Arbitre : on continue, ou on alerte |
| L069 | appuyé | Il ne traite aucune donnée, et il n'écrit rien en base : ce n'est pas un step. | Decider hors du step |
| L070 | technique | En code, c'est un JobExecutionDecider. Un Component, sans StepScope. J'explique pourquoi dans un instant. | Code : `@Component public class RejectsDecider` |
| L071 | technique | L'interface n'a qu'une méthode : decide. Elle reçoit le JobExecution complet, et le StepExecution du dernier step exécuté. | `decide(JobExecution, StepExecution)` |
| L072 | technique | Il lit un compteur dans le contexte du step. Le getLong avec une valeur par défaut évite l'erreur si la clé manque. | `getLong("rejectedCount", 0L)` |
| L073 | technique | Il répond avec un code libre : FlowExecutionStatus joue le rôle d'ExitStatus pour les décisions. | `new FlowExecutionStatus("NO_REJECTS")` |
| L074 | technique | Aucun rejet : NO REJECTS. Plus de cent : TOO MANY REJECTS. Entre les deux : FEW REJECTS. | Trois codes |
| L075 | technique | Le branchement : après loadBankStep, on passe par l'arbitre, avec next. | `.start(loadBankStep).next(rejectsDecider)` |
| L076 | technique | Chaque code renvoyé a sa direction. NO REJECTS et FEW REJECTS vont au rapport. | `.on("NO_REJECTS").to(bankReportStep)` |
| L077 | technique | TOO MANY REJECTS va à l'alerte. Et le filet étoile fait échouer tout le reste. | `.on("TOO_MANY_REJECTS").to(alertStep)`, `.on("*").fail()` |
| L078 | appuyé | Pourquoi pas de StepScope ? Un StepScope n'existe que pendant qu'un step s'exécute. Or l'arbitre intervient entre deux steps. | Frise : step, decider, step |
| L079 | appuyé | À ce moment, aucun contexte de step n'est ouvert. Un decider en StepScope provoque une erreur : aucun contexte actif. | Erreur « pas de contexte de step actif » |
| L080 | explicatif | Le choix par défaut : un singleton sans état. | Singleton sans état |
| L081 | explicatif | S'il a besoin des paramètres du lancement, JobScope existe : une instance par exécution de job. Mais préfère lire les arguments reçus. | JobScope ou arguments |
| L082 | règle | Un decider est pur : il lit, il décide, il ne modifie rien. | Phrase encadrée |
| L083 | défi, direct | Question. Quand utiliser un decider plutôt qu'un code de sortie ? | Question « PRÉDIRE » |
| L084 | posé | Le code de sortie convient à une règle simple, propre au step. Le decider, quand la décision combine plusieurs sources, ou doit se tester seule. | Deux cas |
| L085 | pont | Voyons maintenant comment le moteur fait tout cela. Pour ça, un jeu de société. | Titre « 5.5 Le jeu de société » |

### Scène 5 : La machine à états, le jeu de société (5.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L086 | besoin | Mon besoin : comprendre comment le moteur choisit l'étape suivante. | Graphe d'états |
| L087 | pédagogue | Pense à un jeu de société. Tu es sur une case : c'est un step. | Plateau, pion sur une case |
| L088 | pédagogue | Tu lances le dé : tu exécutes le step. | Dé lancé |
| L089 | pédagogue | Tu lis le chiffre : c'est l'ExitStatus. | Chiffre du dé |
| L090 | pédagogue | Tu regardes le plateau : la table des transitions te dit sur quelle case aller. | Flèches du plateau |
| L091 | pédagogue | Et tu recommences, jusqu'à la case arrivée. | Case arrivée |
| L092 | explicatif | Techniquement, un job construit avec des flux est une SimpleFlow : un ensemble d'états, et une table de transitions. C'est notre plateau. | Table d'états et transitions |
| L093 | technique | Cinq temps. Un : exécuter l'état. Le step tourne, et laisse sa StepExecution en base. | Temps 1 |
| L094 | technique | Deux : produire un statut. Le code de l'ExitStatus du step, par exemple COMPLETED. | Temps 2 |
| L095 | technique | Trois : chercher la transition sur le plateau. Panneaux candidats : COMPLETED, COMP étoile, étoile. Le plus précis gagne. | Temps 3 |
| L096 | technique | Quatre et cinq : aller à la case suivante, bankReportStep, et recommencer, jusqu'à une case de fin. | Temps 4 et 5 |
| L097 | explicatif | Il y a cinq sortes de cases. La case étape, StepState, exécute un step. La case décision, DecisionState, appelle un decider. | StepState, DecisionState |
| L098 | explicatif | La case carrefour, SplitState, lance plusieurs flux sur des threads. La case sous-plateau, FlowState, exécute un sous-flux. La case arrivée, EndState, termine le job. | SplitState, FlowState, EndState |
| L099 | explicatif | Le chiffre lu vient, selon la case : de l'ExitStatus du step, du code du decider, ou d'une agrégation pour le carrefour. | Tableau d'origine du statut |
| L100 | appuyé | Deux erreurs révèlent la mécanique. La première : Next state not found, avec le code reçu. | Message en rouge |
| L101 | explicatif | Le dé a donné un chiffre qui n'est écrit sur aucune flèche du plateau. À l'exécution, le job échoue immédiatement. | Chemin rouge « Next state not found » |
| L102 | appuyé | La seconde : No end state was found. | Message en rouge |
| L103 | explicatif | C'est un plateau sans case arrivée. Le job est refusé au lancement : il faut au moins une transition sans suite, end, fail ou stopAndRestart. | Au moins une fin |
| L104 | défi, direct | Question. Un flux n'a aucune transition vers une fin. Quand l'erreur apparaît-elle : à la construction, ou à l'exécution ? | Question « PRÉDIRE » |
| L105 | posé | À la construction : le job est refusé au lancement. L'autre erreur, Next state not found, apparaît à l'exécution. | Deux moments |
| L106 | pont | Dernier outil de ce module : faire passer plusieurs flux en même temps. Direction le péage. | Titre « 5.6 Le péage » |

### Scène 6 : Le split, le péage d'autoroute (5.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L107 | besoin | Mon besoin : charger les comptes et les opérations en même temps, puis consolider. | Deux sources parallèles |
| L108 | pédagogue | Imagine l'autoroute qui arrive au péage. Elle se sépare en deux voies : c'est le Split. | Autoroute qui se sépare en deux voies |
| L109 | pédagogue | Chaque voie a son guichet : c'est un thread. Deux voies, deux guichets, deux voitures qui passent en même temps. | Deux guichets, deux voitures |
| L110 | pédagogue | Et personne ne repart tant que les deux voitures ne sont pas passées : c'est une barrière de synchronisation. | Barrière |
| L111 | technique | En code, d'abord un TaskExecutor : le pool de threads, donc nos guichets. Un singleton partagé, comme au module deux. | Code : `ThreadPoolTaskExecutor` |
| L112 | technique | Un préfixe de nom de thread : les journaux montrent flow un, flow deux. Indispensable pour diagnostiquer. | `setThreadNamePrefix("flow-")` |
| L113 | technique | Deux threads : autant que de voies parallèles. Pas de file d'attente. | `setCorePoolSize(2)`, `setQueueCapacity(0)` |
| L114 | explicatif | Un pool plus petit ferait attendre les voitures. Un pool illimité saturerait la base. | Pool trop petit, trop grand |
| L115 | technique | Un Flow est un sous-graphe réutilisable : une voie. Ici, chaque voie ne contient qu'un step. | Code : `new FlowBuilder<SimpleFlow>("accountsFlow").start(importAccountsStep)` |
| L116 | technique | Puis split, avec l'exécuteur, et add, avec les deux flux. Chacun passe sur un guichet du pool. | `.split(flowExecutor).add(accountsFlow, operationsFlow)` |
| L117 | technique | Le job démarre avec ce groupe parallèle, puis enchaîne avec consolidateStep. | `.start(parallelFlow).next(consolidateStep)` |
| L118 | règle | consolidateStep ne démarre qu'après la fin des deux flux. Le split est une barrière. | Barrière rouge |
| L119 | explicatif | Chaque guichet ouvre ses propres transactions et ses propres connexions. Les steps parallèles ne partagent pas de transaction. | Deux threads, deux transactions |
| L120 | explicatif | Chaque step est enregistré séparément dans batch step execution. | Deux StepExecution |
| L121 | appuyé | Les singletons utilisés dans plusieurs flux sont partagés entre threads. Tout état modifiable dedans est une course, comme au module quatre. | Singleton partagé, course |
| L122 | pédagogue | Maintenant, le point qui piège tout le monde. Chaque voiture a besoin de tickets : ce sont les connexions à la base. | Tickets : connexions |
| L123 | pédagogue | Admettons trois tickets par voiture, plus un ticket pour le contrôleur, le JobRepository. Deux voitures, trois tickets chacune, plus un : sept tickets. | Sept tickets |
| L124 | appuyé | Avec sept tickets, tout passe. Avec seulement cinq, chaque voiture en prend deux, attend le troisième, que l'autre détient. Plus personne n'avance : c'est le blocage. | Cinq tickets : blocage |
| L125 | explicatif | Et si tu ouvres une troisième voie, avec sept tickets ? Deux voitures prennent leurs trois tickets. La troisième attend que l'une libère les siens. | Troisième voiture en attente |
| L126 | défi, direct | Question. Deux flux parallèles utilisent chacun trois connexions, plus une pour le JobRepository. Quel minimum de connexions dans le pool ? | Question « PRÉDIRE » |
| L127 | posé | Sept : deux fois trois, plus une. Moins, et les flux se bloquent en attendant une connexion détenue par un autre. | 7 connexions |
| L128 | explicatif | Deux limites distinctes, donc : le pool de threads, les guichets, et le pool de connexions, les tickets. | Guichets, tickets |
| L129 | explicatif | Si un flux échoue et l'autre réussit, le split produit le statut le plus grave : échec. Le job échoue. | Un flux rouge, un vert |
| L130 | appuyé | À la reprise, seul le step en échec est rejoué. Les steps terminés ne le sont pas. | Reprise : un seul step |
| L131 | explicatif | Un split parallélise des steps différents. Pour accélérer un même step sur de gros volumes, c'est le multithread ou le partitionnement, plus loin dans la formation. | Un step, plusieurs partitions |
| L132 | pont | Voyons trois situations réelles. | Titre « cas d'usage » |

### Scène 7 : Cas d'usage

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L133 | explicatif | Premier cas : l'import avec alerte. Si plus de cent lignes sont rejetées, le rapport est remplacé par une alerte. | Rapport remplacé par alerte |
| L134 | appuyé | Et le job termine en échec, pour que la supervision le voie. Un code de sortie ou un decider en est le moyen. | Job FAILED, supervision |
| L135 | explicatif | Deuxième cas : deux sources indépendantes. Les comptes dans un fichier, les opérations dans une base. | Fichier + base |
| L136 | appuyé | Elles se chargent en même temps : le temps total est celui du plus long, non la somme. La consolidation attend les deux. | Durée = max, pas somme |
| L137 | explicatif | Troisième cas : le bon chemin selon le jour. Un job de fin de mois exécute une clôture supplémentaire seulement le dernier jour ouvré. | Calendrier, dernier jour ouvré |
| L138 | explicatif | Un decider lit la date, et renvoie MONTH END ou NORMAL. Il aiguille vers la clôture, ou directement vers le rapport. | Decider : MONTH_END / NORMAL |
| L139 | pont | Voyons les dix pièges. | Titre « Top 10 » |

### Scène 8 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L140 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L141 | appuyé | Un : un ExitStatus personnalisé non aiguillé. Le job échoue sans exécuter ce qu'on attendait. | Ligne 1 |
| L142 | pédagogue | Comment le repérer : un message Next state not found, avec le code personnalisé dedans. | Extrait indicatif : `FlowExecutionException: Next state not found … exit status=COMPLETED_WITH_REJECTS` |
| L143 | appuyé | Deux : confondre BatchStatus et ExitStatus. Un on FAILED qui ne se déclenche pas. | Ligne 2 |
| L144 | pédagogue | Comment le repérer : un step COMPLETED en base, avec un exit code qui n'est pas celui attendu. | Extrait indicatif : `status = COMPLETED   exit_code = COMPLETED_WITH_REJECTS` |
| L145 | appuyé | Trois : un decider en StepScope. Erreur de contexte, aucun step n'est actif. | Ligne 3 |
| L146 | pédagogue | Comment le repérer : une exception de scope dès la résolution du decider. | Extrait indicatif : `IllegalStateException: No context holder available for step scope` |
| L147 | appuyé | Quatre : un split avec un exécuteur mal dimensionné. Saturation de la base, ou flux qui attendent. | Ligne 4 |
| L148 | pédagogue | Comment le repérer : des threads qui attendent, ou une base saturée de connexions. | Extrait indicatif : `HikariPool: Connection is not available, request timed out after 30000ms` |
| L149 | appuyé | Cinq : un pool de connexions inférieur aux besoins des flux parallèles. Blocage. | Ligne 5 |
| L150 | pédagogue | Comment le repérer : un job figé, avec un pool à zéro connexion libre. | Extrait indicatif : `active=7 idle=0 waiting=2` |

### Scène 9 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L151 | pont | Les cinq suivants touchent la terminaison, l'état partagé et les motifs. | Tableau, lignes 6 à 10 |
| L152 | appuyé | Six : une branche d'erreur terminée par end. L'alerte réussit, le job apparaît réussi. | Ligne 6 |
| L153 | pédagogue | Comment le repérer : un job COMPLETED en base, alors que le chargement a échoué. | Extrait indicatif : `job status = COMPLETED   loadBankStep = FAILED` |
| L154 | appuyé | Sept : un état partagé entre flux parallèles. Un singleton modifié par deux threads. | Ligne 7 |
| L155 | pédagogue | Comment le repérer : des totaux faux, différents à chaque lancement. | Extrait indicatif : `total = 1 187,00  puis  1 203,50` |
| L156 | appuyé | Huit : un decider avec des effets de bord ou des requêtes lourdes. Réévalué à chaque reprise. | Ligne 8 |
| L157 | pédagogue | Comment le repérer : une alerte envoyée deux fois, après une reprise. | Extrait indicatif : deux lignes `alerte envoyée` |
| L158 | appuyé | Neuf : des motifs mal compris. COMP étoile capte aussi COMPLETED WITH REJECTS. Le plus précis gagne, pas le premier écrit. | Ligne 9 |
| L159 | pédagogue | Comment le repérer : un step exécuté dans la mauvaise branche, après l'ajout d'un nouveau code. | Extrait indicatif : `COMPLETED_WITH_REJECTS → bankReportStep` |
| L160 | appuyé | Dix : un flux construit sans état final. No end state was found. Le job est refusé. | Ligne 10 |
| L161 | pédagogue | Comment le repérer : une erreur dès le démarrage, avant tout lancement. | Extrait indicatif : `No end state was found. You must specify at least one transition with no next state.` |
| L162 | explicatif | Pour tester un flux, un test par issue : COMPLETED, FAILED, COMPLETED WITH REJECTS, et un code inconnu. | Quatre tests |
| L163 | appuyé | À chaque fois, on vérifie quels steps ont été exécutés, dans batch step execution. | Steps exécutés par chemin |
| L164 | pédagogue | Pourquoi on y tombe : parce qu'un seul chemin, le chemin heureux, est testé. | Un chemin sur quatre |

### Scène 10 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L165 | pédagogue | Reprenons notre job vert, avec un chargement échoué. Tu sais maintenant comment le rendre rouge. | Job vert → fail |
| L166 | récapitulatif | Un job est un réseau. Un aiguillage lit le mot du livreur, l'ExitStatus. L'état du colis, le BatchStatus, sert à la reprise. | Trois pastilles |
| L167 | récapitulatif | Le chef d'orchestre, le decider, décide d'après un chiffre, sans StepScope. Le péage, le split, parallélise, avec des guichets et des tickets en nombre suffisant. | Deux pastilles |
| L168 | récapitulatif | Toute branche d'erreur se termine par fail, avec un filet étoile. | Pastille |
| L169 | défi | Quatre exercices. Un : le step réussit, le listener pose COMPLETED WITH REJECTS. Quels statuts, et quelle suite avec le flux du module ? | Exercice 1 |
| L170 | défi | Deux : pourquoi un decider ne peut-il pas être en StepScope ? Donne deux façons correctes de lui fournir ce dont il a besoin. | Exercice 2 |
| L171 | défi | Trois : deux flux parallèles utilisent chacun trois connexions, plus une pour le JobRepository. Quel minimum ? Pourquoi un pool de vingt threads n'accélère rien ? | Exercice 3 |
| L172 | défi | Quatre : un job dont la branche d'erreur se termine par end est réussi alors que le chargement a échoué. Comment le détecter, et le corriger ? | Exercice 4 |
| L173 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L174 | explicatif | Correction un. BatchStatus COMPLETED, ExitStatus COMPLETED WITH REJECTS. Le filet étoile fait échouer le job. Sans filet, Next state not found. | Exercice 1 |
| L175 | explicatif | Correction deux. Le decider tourne entre deux steps, hors de tout contexte de step. Un singleton sans état, ou JobScope, ou lire les arguments. | Exercice 2 |
| L176 | explicatif | Correction trois. Sept connexions. Un pool de vingt threads n'accélère rien : il n'y a que deux flux. | Exercice 3 |
| L177 | explicatif | Correction quatre. Un job COMPLETED avec un step du chargement en FAILED. On corrige en terminant la branche par fail. | Exercice 4 |
| L178 | transition | Au module suivant, tu apprends la fiabilité : skip, retry, restart et l'arrêt gracieux. | Aperçu « fiabilité » |
