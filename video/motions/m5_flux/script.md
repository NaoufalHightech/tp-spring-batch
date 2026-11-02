# Module 5 : Flux et orchestration

Vidéo de formation Spring Batch. Durée visée : 55 minutes, en sept parties (5.1 à 5.7). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_5.md`. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture et flashbacks

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Le chargement du soir a échoué. L'alerte est partie, elle a réussi. Et le job apparaît en vert dans le tableau de bord. Personne n'a rien vu de la nuit. | Chargement rouge, alerte verte, job vert |
| L002 | pédagogue | Ce bug existe, et il vient d'une seule ligne : une branche d'erreur terminée par end au lieu de fail. Aujourd'hui, on apprend à orchestrer proprement. | Branche d'erreur, `.end()` en rouge |
| L003 | rappel | Un rappel du module un. Chaque step terminé écrit son statut et son code de sortie dans batch step execution. Un flux conditionnel n'y change rien. | Table batch_step_execution : status, exit_code |
| L004 | rappel | Un rappel du module deux. Les beans Step, Flow et Job sont des singletons sans état : ils décrivent le graphe. L'exécution vit dans les JobExecution. | Graphe décrit, exécution à part |
| L005 | annonce | Sept étapes : du pipeline au graphe, deux statuts, un flux conditionnel, le decider, la machine à états, le split, et les pièges. | Sept pastilles 5.1 à 5.7 |

### Scène 1 : Du pipeline au graphe (5.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L006 | besoin | Mon besoin : un traitement de nuit qui ne se contente pas d'enchaîner des steps en ligne droite. | Ligne droite A → B |
| L007 | explicatif | Jusqu'ici, un job était une suite : step A, puis step B. Si A échoue, le job s'arrête. | A, B ; A en rouge, arrêt |
| L008 | explicatif | Un vrai traitement se ramifie. On charge le fichier. Puis on regarde l'issue. | Step loadBankStep |
| L009 | explicatif | Réussi : on produit le rapport de rapprochement. Réussi avec trop de rejets : on prévient l'équipe. Échec : on prévient aussi. | Trois branches depuis le chargement |
| L010 | appuyé | Un job est donc un graphe d'états : des steps, des décisions, des groupes parallèles, reliés par des transitions. | Graphe coloré |
| L011 | technique | L'écriture simple : start a, next b, next c. Si a échoue, le job s'arrête. | Code : `.start(a).next(b).next(c)` |
| L012 | technique | L'écriture conditionnelle : on, avec un code, to, un step. Et from, pour reprendre depuis un step. | Code : `.start(a).on("COMPLETED").to(b).from(a).on("FAILED").to(c)` |
| L013 | explicatif | On choisit la suite selon l'issue de a. C'est ce qui permet les alertes, les chemins d'erreur et les branches métier. | Alertes, erreurs, branches |
| L014 | défi, direct | Question. Dans un enchaînement simple, le step a échoue. Que fait le job ? | Question « PRÉDIRE » |
| L015 | posé | Il s'arrête. Pour réagir à l'échec, il faut un flux conditionnel. | Job arrêté |
| L016 | pont | Pour écrire ces transitions, il faut comprendre deux statuts qu'on confond tout le temps. | Titre « 5.2 BatchStatus / ExitStatus » |

### Scène 2 : BatchStatus contre ExitStatus (5.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L017 | besoin | Mon besoin : comprendre ce que compare exactement un on, dans une transition. | Transition on("COMPLETED") |
| L018 | explicatif | Il y a deux notions différentes. D'abord le BatchStatus : une énumération fixe, décidée par le framework. | Rail 1 : BatchStatus |
| L019 | technique | Les valeurs : STARTING, STARTED, STOPPING, STOPPED, FAILED, COMPLETED, ABANDONED. Il sert à l'état technique et à la reprise. | Énumération |
| L020 | explicatif | Ensuite l'ExitStatus : un texte libre, un code. Il sert à aiguiller le flux et à informer l'extérieur. | Rail 2 : ExitStatus |
| L021 | technique | Valeurs courantes : COMPLETED, FAILED, STOPPED, NOOP. Ou ton propre code, par exemple COMPLETED WITH REJECTS. | Codes libres |
| L022 | règle | Retiens : les transitions comparent le code de l'ExitStatus, pas le BatchStatus. | Phrase encadrée |
| L023 | explicatif | Par défaut, les deux coïncident : un step réussi a un ExitStatus COMPLETED. C'est ce qui entretient la confusion. | Deux rails alignés |
| L024 | appuyé | Dès que tu poses un code personnalisé, ils divergent. | Deux rails qui divergent |
| L025 | besoin | Cas concret : aiguiller selon un fait métier. Le chargement a réussi, mais avec trop de lignes rejetées. | Chargement réussi, 150 rejets |
| L026 | technique | Un listener de step, appelé après le step. Il implémente StepExecutionListener. | Code : `implements StepExecutionListener` |
| L027 | technique | afterStep retourne l'ExitStatus final : c'est le moment de le modifier. | `afterStep(StepExecution stepExecution)` |
| L028 | appuyé | On ne touche pas à un step déjà en échec : son code FAILED reste celui du framework. | `if (status != COMPLETED) return …` |
| L029 | technique | Sinon, si le nombre de lignes filtrées dépasse cent, on retourne un code personnalisé. | `getFilterCount() > MAX_REJECTS` |
| L030 | appuyé | Le BatchStatus reste inchangé : COMPLETED. Seul le code de sortie change. | BatchStatus COMPLETED, ExitStatus COMPLETED_WITH_REJECTS |
| L031 | règle | La reprise se base sur le BatchStatus. L'aiguillage se base sur l'ExitStatus. | Deux usages |
| L032 | explicatif | Sans code personnalisé, le step prend un ExitStatus équivalent à son BatchStatus. | Équivalence par défaut |
| L033 | défi, direct | Question. Le step a réussi, mais le listener a posé COMPLETED WITH REJECTS. Que valent le BatchStatus et l'ExitStatus ? | Question « PRÉDIRE » |
| L034 | posé | BatchStatus COMPLETED. ExitStatus COMPLETED WITH REJECTS. Le step a réussi techniquement, mais le code dit autre chose. | Deux valeurs |
| L035 | pont | Il faut maintenant que le flux sache quoi faire de ce code. | Titre « 5.3 Un flux conditionnel » |

### Scène 3 : Un flux conditionnel, ligne par ligne (5.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L036 | besoin | Mon besoin : charger le fichier, produire le rapport si tout va bien, prévenir l'équipe sinon. | loadBankStep, bankReportStep, alertStep |
| L037 | technique | Le builder du job, comme au module deux. Je démarre avec loadBankStep. | Code : `new JobBuilder("bankFlowJob", jobRepository).start(loadBankStep)` |
| L038 | technique | Son retour est maintenant un builder de flux, et non plus un job linéaire. | Builder de flux |
| L039 | technique | Si l'ExitStatus de loadBankStep vaut COMPLETED, on va à bankReportStep. | `.on("COMPLETED").to(bankReportStep)` |
| L040 | technique | Puis on reprend depuis loadBankStep pour déclarer une autre transition. Si le code est FAILED, on va à alertStep. | `.from(loadBankStep).on("FAILED").to(alertStep)` |
| L041 | appuyé | Après alertStep, quelle que soit l'issue, étoile, le job se termine en échec, avec fail. | `.on("*").fail()` |
| L042 | appuyé | Sans cela, un job dont le chargement a échoué pourrait finir réussi, parce que l'alerte, elle, a réussi. | Alerte verte, job vert : faux |
| L043 | technique | Encore une reprise depuis loadBankStep. Et le filet de sécurité : tout autre code échoue explicitement. | `.from(loadBankStep).on("*").fail()` |
| L044 | appuyé | Un code personnalisé oublié, STOPPED, UNKNOWN : sans ce filet, le flux reste sans issue. | Code oublié sans issue |
| L045 | technique | Le end termine la définition du flux. Et build produit le job. | `.end().build()` |
| L046 | explicatif | Le step d'alerte est une tasklet. Elle retrouve l'exécution du job en cours à partir de sa contribution. | Code : `contribution.getStepExecution().getJobExecution()` |
| L047 | technique | On y cherche l'exécution du step de chargement : ses compteurs sont déjà enregistrés. | Filtre sur `loadBankStep` |
| L048 | technique | Le message indique le lot, le nombre de lignes rejetées, et le nombre de lignes lues. | `"Chargement du %s : %d lignes rejetées sur %d lues"` |
| L049 | explicatif | AlertSender est une interface applicative, courriel ou messagerie d'équipe. Le composant reste sans état, comme au module quatre. | Composant sans état |
| L050 | explicatif | Un mot sur les motifs. Étoile remplace n'importe quelle suite de caractères. Point d'interrogation, un seul caractère. | Motifs `*` et `?` |
| L051 | appuyé | Quand plusieurs motifs correspondent, le plus précis l'emporte. COMPLETED avant COMP étoile, avant étoile. L'ordre d'écriture ne compte pas. | Précision décroissante |
| L052 | explicatif | Et les fins de flux. End termine en réussite. Fail termine en échec. StopAndRestart arrête le job, et prépare une reprise. | Trois fins |
| L053 | défi, direct | Question. Le code COMPLETED WITH REJECTS arrive, et aucune transition ne le prévoit. Que se passe-t-il, avec le filet étoile ? | Question « PRÉDIRE » |
| L054 | posé | Le filet l'attrape : le job se termine en échec, explicitement. Sans le filet, le moteur lève une erreur : Next state not found. | Job FAILED explicite |
| L055 | règle | Une branche d'erreur se termine par fail, quand la panne doit rester visible dans batch job execution. | Phrase encadrée |
| L056 | explicatif | C'est la façon dont le flux se termine qui fixe l'état final du job. Pas le step qui a échoué. | Flux → état final |
| L057 | pont | Parfois, le code de sortie ne suffit pas. On veut décider à partir d'un chiffre. | Titre « 5.4 Le decider » |

### Scène 4 : Le decider (5.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L058 | besoin | Mon besoin : aiguiller selon un compteur, par exemple le nombre de lignes rejetées. | Compteur rejectedCount |
| L059 | explicatif | Un JobExecutionDecider est une décision pure, sans traitement. Il lit l'état et retourne un code. | Boîte « decider » : lit, décide |
| L060 | technique | Un Component, sans StepScope. Je reviens sur ce point dans un instant. | Code : `@Component public class RejectsDecider` |
| L061 | technique | L'interface a une seule méthode : decide. Elle reçoit le JobExecution complet, et le StepExecution du dernier step exécuté. | `decide(JobExecution, StepExecution)` |
| L062 | technique | Il lit un compteur dans le contexte du step. Le getLong avec une valeur par défaut évite l'erreur si la clé manque. | `getLong("rejectedCount", 0L)` |
| L063 | technique | Un code libre : FlowExecutionStatus joue le rôle d'ExitStatus pour les décisions. | `new FlowExecutionStatus("NO_REJECTS")` |
| L064 | technique | Aucun rejet : NO REJECTS. Plus de cent : TOO MANY REJECTS. Entre les deux : FEW REJECTS. | Trois codes |
| L065 | explicatif | Le branchement. Après loadBankStep, on passe par la décision, avec next. | `.start(loadBankStep).next(rejectsDecider)` |
| L066 | technique | Chaque code renvoyé a sa transition. NO REJECTS et FEW REJECTS vont au rapport. | `.on("NO_REJECTS").to(bankReportStep)` |
| L067 | technique | TOO MANY REJECTS va à l'alerte. Et le filet étoile fait échouer tout le reste. | `.on("TOO_MANY_REJECTS").to(alertStep)`, `.on("*").fail()` |
| L068 | explicatif | La décision n'écrit rien en base : ce n'est pas un step. | Decider sans StepExecution |
| L069 | appuyé | Pourquoi pas de StepScope ? Un StepScope n'existe que pendant l'exécution d'un step. Le decider est appelé entre deux steps. | Frise : step, decider, step |
| L070 | appuyé | À ce moment, aucun contexte de step n'est ouvert. Un decider en StepScope provoque une erreur : aucun contexte actif. | Erreur « pas de contexte de step actif » |
| L071 | explicatif | Que faire alors ? Un singleton sans état, c'est le choix par défaut. | Singleton sans état |
| L072 | explicatif | S'il a besoin des paramètres du lancement, JobScope existe : créé par exécution de job. Mais préfère lire les arguments reçus. | JobScope ou arguments |
| L073 | règle | Un decider est pur : il lit, il décide, il ne modifie rien. | Phrase encadrée |
| L074 | défi, direct | Question. Quand utiliser un decider plutôt qu'un code de sortie ? | Question « PRÉDIRE » |
| L075 | posé | Le code de sortie convient à une règle simple et propre au step. Le decider, quand la décision combine plusieurs sources, ou doit se tester seule. | Deux cas |
| L076 | pont | Voyons maintenant comment le moteur de flux fait tout cela. | Titre « 5.5 La machine à états » |

### Scène 5 : La machine à états (5.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L077 | besoin | Mon besoin : comprendre comment le moteur choisit l'état suivant. | Graphe d'états |
| L078 | explicatif | Un job construit avec des flux est une SimpleFlow : un ensemble d'états, et une table de transitions. | Table d'états et transitions |
| L079 | technique | Cinq temps. D'abord, exécuter l'état : le step tourne, laisse sa StepExecution en base. | Temps 1 |
| L080 | technique | Ensuite, produire un statut : le code de l'ExitStatus du step, par exemple COMPLETED. | Temps 2 |
| L081 | technique | Puis chercher la transition. Motifs candidats : COMPLETED, COMP étoile, étoile. Le plus précis gagne. | Temps 3 |
| L082 | technique | Puis l'état suivant : bankReportStep. Et on recommence, jusqu'à un état de fin. | Temps 4 et 5 |
| L083 | explicatif | Il y a cinq sortes d'états. StepState exécute un step. DecisionState exécute un decider. | StepState, DecisionState |
| L084 | explicatif | SplitState lance plusieurs flux sur des threads. FlowState exécute un sous-flux. EndState termine le job. | SplitState, FlowState, EndState |
| L085 | explicatif | Le statut produit vient, selon l'état, du code d'ExitStatus du step, du FlowExecutionStatus du decider, ou d'une agrégation pour le split. | Tableau d'origine du statut |
| L086 | appuyé | Deux erreurs révèlent la mécanique. La première : Next state not found, avec le code reçu. | Message en rouge |
| L087 | explicatif | À l'exécution, un état a produit un code pour lequel aucune transition ne correspond. Le job échoue immédiatement. | Chemin rouge « Next state not found » |
| L088 | appuyé | La seconde : No end state was found. À la construction, un flux dont toutes les transitions mènent à un autre état, sans jamais finir. | Message en rouge |
| L089 | explicatif | Le job est refusé au lancement. Il faut au moins une transition sans suite : end, fail ou stopAndRestart. | Au moins une fin |
| L090 | défi, direct | Question. Un flux n'a aucune transition vers une fin. Quand l'erreur apparaît-elle : à la construction, ou à l'exécution ? | Question « PRÉDIRE » |
| L091 | posé | À la construction : le job est refusé au lancement. L'autre erreur, Next state not found, apparaît à l'exécution. | Deux moments |
| L092 | pont | Dernier outil de ce module : faire tourner des flux en parallèle. | Titre « 5.6 Le split » |

### Scène 6 : Le split et les threads (5.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L093 | besoin | Mon besoin : charger les comptes et les opérations en même temps, puis consolider. | Deux sources parallèles |
| L094 | explicatif | Un Split lance plusieurs flux en parallèle, puis attend qu'ils soient tous terminés. | Deux flux, une barrière |
| L095 | technique | D'abord un TaskExecutor : le pool de threads qui exécutera les flux. Un singleton partagé, comme au module deux. | Code : `ThreadPoolTaskExecutor` |
| L096 | technique | Un préfixe de nom de thread : les journaux montrent flow un, flow deux. Indispensable pour diagnostiquer. | `setThreadNamePrefix("flow-")` |
| L097 | technique | Deux threads : autant que de flux parallèles à la fois. Pas de file d'attente. | `setCorePoolSize(2)`, `setQueueCapacity(0)` |
| L098 | explicatif | Un pool plus petit ferait attendre les flux. Un pool illimité saturerait la base. | Pool trop petit / trop grand |
| L099 | technique | Un Flow est un sous-graphe réutilisable. Ici, chacun ne contient qu'un step. | Code : `new FlowBuilder<SimpleFlow>("accountsFlow").start(importAccountsStep)` |
| L100 | technique | Puis split, avec l'exécuteur, et add, avec les deux flux. Chacun tourne sur un thread du pool. | `.split(flowExecutor).add(accountsFlow, operationsFlow)` |
| L101 | technique | Le job démarre avec ce groupe parallèle, puis enchaîne avec consolidateStep. | `.start(parallelFlow).next(consolidateStep)` |
| L102 | règle | consolidateStep ne démarre qu'après la fin des deux flux. Le split est une barrière de synchronisation. | Barrière rouge |
| L103 | explicatif | Un thread par flux. Chaque flux ouvre ses propres transactions, ses propres connexions. Les steps parallèles ne partagent pas de transaction. | Deux threads, deux transactions |
| L104 | explicatif | Chaque step est enregistré séparément dans batch step execution. | Deux StepExecution |
| L105 | appuyé | Les singletons utilisés dans plusieurs flux sont partagés entre threads. Tout état modifiable dedans est une course, comme au module quatre. | Singleton partagé, course |
| L106 | appuyé | Deux limites distinctes : le pool de threads, et le pool de connexions. Chaque flux a besoin de plusieurs connexions, plus une pour le JobRepository. | Pool de connexions qui sature |
| L107 | défi, direct | Question. Deux flux parallèles utilisent chacun trois connexions, plus une pour le JobRepository. Quel minimum de connexions dans le pool ? | Question « PRÉDIRE » |
| L108 | posé | Sept : deux fois trois, plus une. Moins, et les flux se bloquent en attendant une connexion détenue par un autre. | 7 connexions |
| L109 | explicatif | Si un flux échoue et l'autre réussit, le split produit le statut le plus grave : échec. Le job échoue. | Un flux rouge, un vert |
| L110 | appuyé | À la reprise, seul le step en échec est rejoué. Les steps terminés ne le sont pas. | Reprise : un seul step |
| L111 | explicatif | Un split parallélise des steps différents. Pour accélérer un même step sur de gros volumes, c'est le multithread ou le partitionnement, plus loin dans la formation. | Un step, plusieurs partitions |
| L112 | pont | Voyons trois situations réelles. | Titre « cas d'usage » |

### Scène 7 : Cas d'usage

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L113 | explicatif | Premier cas : l'import avec alerte. Si plus de cent lignes sont rejetées, le rapport est remplacé par une alerte. | Rapport remplacé par alerte |
| L114 | appuyé | Et le job termine en échec, pour que la supervision le voie. Un code de sortie ou un decider en est le moyen. | Job FAILED, supervision |
| L115 | explicatif | Deuxième cas : deux sources indépendantes. Les comptes dans un fichier, les opérations dans une base. | Fichier + base |
| L116 | appuyé | Elles se chargent en même temps : le temps total est celui du plus long, non la somme. La consolidation attend les deux. | Durée = max, pas somme |
| L117 | explicatif | Troisième cas : le bon chemin selon le jour. Un job de fin de mois exécute une clôture supplémentaire seulement le dernier jour ouvré. | Calendrier, dernier jour ouvré |
| L118 | explicatif | Un decider lit la date, et renvoie MONTH END ou NORMAL. Il aiguille vers la clôture, ou directement vers le rapport. | Decider : MONTH_END / NORMAL |
| L119 | pont | Voyons les dix pièges. | Titre « Top 10 » |

### Scène 8 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L120 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L121 | appuyé | Un : un ExitStatus personnalisé non aiguillé. Le job échoue sans exécuter ce qu'on attendait. | Ligne 1 |
| L122 | pédagogue | Comment le repérer : un message Next state not found, avec le code personnalisé dedans. | Extrait indicatif : `FlowExecutionException: Next state not found … exit status=COMPLETED_WITH_REJECTS` |
| L123 | appuyé | Deux : confondre BatchStatus et ExitStatus. Un on FAILED qui ne se déclenche pas. | Ligne 2 |
| L124 | pédagogue | Comment le repérer : un step COMPLETED en base, avec un exit code qui n'est pas celui attendu. | Extrait indicatif : `status = COMPLETED   exit_code = COMPLETED_WITH_REJECTS` |
| L125 | appuyé | Trois : un decider en StepScope. Erreur de contexte, aucun step n'est actif. | Ligne 3 |
| L126 | pédagogue | Comment le repérer : une exception de scope dès la résolution du decider. | Extrait indicatif : `IllegalStateException: No context holder available for step scope` |
| L127 | appuyé | Quatre : un split avec un exécuteur mal dimensionné. Saturation de la base, ou flux qui attendent. | Ligne 4 |
| L128 | pédagogue | Comment le repérer : des threads qui attendent, ou une base saturée de connexions. | Extrait indicatif : `HikariPool: Connection is not available, request timed out after 30000ms` |
| L129 | appuyé | Cinq : un pool de connexions inférieur aux besoins des flux parallèles. Blocage. | Ligne 5 |
| L130 | pédagogue | Comment le repérer : un job figé, avec un pool à zéro connexion libre. | Extrait indicatif : `active=7 idle=0 waiting=2` |

### Scène 9 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L131 | pont | Les cinq suivants touchent la terminaison, l'état partagé et les motifs. | Tableau, lignes 6 à 10 |
| L132 | appuyé | Six : une branche d'erreur terminée par end. L'alerte réussit, le job apparaît réussi. | Ligne 6 |
| L133 | pédagogue | Comment le repérer : un job COMPLETED en base, alors que le chargement a échoué. | Extrait indicatif : `job status = COMPLETED   loadBankStep = FAILED` |
| L134 | appuyé | Sept : un état partagé entre flux parallèles. Un singleton modifié par deux threads. | Ligne 7 |
| L135 | pédagogue | Comment le repérer : des totaux faux, différents à chaque lancement. | Extrait indicatif : `total = 1 187,00  puis  1 203,50` |
| L136 | appuyé | Huit : un decider avec des effets de bord ou des requêtes lourdes. Réévalué à chaque reprise. | Ligne 8 |
| L137 | pédagogue | Comment le repérer : une alerte envoyée deux fois, après une reprise. | Extrait indicatif : deux lignes `alerte envoyée` |
| L138 | appuyé | Neuf : des motifs mal compris. COMP étoile capte aussi COMPLETED WITH REJECTS. Le plus précis gagne, pas le premier écrit. | Ligne 9 |
| L139 | pédagogue | Comment le repérer : un step exécuté dans la mauvaise branche, après l'ajout d'un nouveau code. | Extrait indicatif : `COMPLETED_WITH_REJECTS → bankReportStep` |
| L140 | appuyé | Dix : un flux construit sans état final. No end state was found. Le job est refusé. | Ligne 10 |
| L141 | pédagogue | Comment le repérer : une erreur dès le démarrage, avant tout lancement. | Extrait indicatif : `No end state was found. You must specify at least one transition with no next state.` |
| L142 | explicatif | Pour tester un flux, un test par issue : COMPLETED, FAILED, COMPLETED WITH REJECTS, et un code inconnu. | Quatre tests |
| L143 | appuyé | À chaque fois, on vérifie quels steps ont été exécutés, dans batch step execution. | Steps exécutés par chemin |
| L144 | pédagogue | Pourquoi on y tombe : parce qu'un seul chemin, le chemin heureux, est testé. | Un chemin sur quatre |

### Scène 10 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L145 | pédagogue | Reprenons notre job vert, avec un chargement échoué. Tu sais maintenant comment le rendre rouge. | Job vert → fail |
| L146 | récapitulatif | Un job est un graphe. Les transitions comparent l'ExitStatus. Le BatchStatus sert à la reprise. | Trois pastilles |
| L147 | récapitulatif | Le decider décide d'après un chiffre, sans StepScope. Le split parallélise, avec un pool borné. | Deux pastilles |
| L148 | récapitulatif | Toute branche d'erreur se termine par fail, avec un filet étoile. | Pastille |
| L149 | défi | Quatre exercices. Un : le step réussit, le listener pose COMPLETED WITH REJECTS. Quels statuts, et quelle suite avec le flux du module ? | Exercice 1 |
| L150 | défi | Deux : pourquoi un decider ne peut-il pas être en StepScope ? Donne deux façons correctes de lui fournir ce dont il a besoin. | Exercice 2 |
| L151 | défi | Trois : deux flux parallèles utilisent chacun trois connexions, plus une pour le JobRepository. Quel minimum ? Pourquoi un pool de vingt threads n'accélère rien ? | Exercice 3 |
| L152 | défi | Quatre : un job dont la branche d'erreur se termine par end est réussi alors que le chargement a échoué. Comment le détecter, et le corriger ? | Exercice 4 |
| L153 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L154 | explicatif | Correction un. BatchStatus COMPLETED, ExitStatus COMPLETED WITH REJECTS. Le filet étoile fait échouer le job. Sans filet, Next state not found. | Exercice 1 |
| L155 | explicatif | Correction deux. Le decider tourne entre deux steps, hors de tout contexte de step. Un singleton sans état, ou JobScope, ou lire les arguments. | Exercice 2 |
| L156 | explicatif | Correction trois. Sept connexions. Un pool de vingt threads n'accélère rien : il n'y a que deux flux. | Exercice 3 |
| L157 | explicatif | Correction quatre. Un job COMPLETED avec un step du chargement en FAILED. On corrige en terminant la branche par fail. | Exercice 4 |
| L158 | transition | Au module suivant, tu apprends la fiabilité : skip, retry, restart et l'arrêt gracieux. | Aperçu « fiabilité » |
