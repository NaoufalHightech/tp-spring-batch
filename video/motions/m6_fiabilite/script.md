# Module 6 : Fiabilité, skip, retry, restart, arrêt gracieux

Vidéo de formation Spring Batch. Durée visée : 60 minutes, en sept parties (6.1 à 6.7). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_6.md`. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture et flashbacks

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Il est trois heures douze. Une mise à jour système envoie un signal d'arrêt à ton serveur. Le job de nuit en est à la ligne trois mille quatre cents. | Horloge 03:12, job à 3 400 lignes |
| L002 | pédagogue | Au matin, deux scénarios. Dans le premier, tout reprend à la ligne trois mille quatre cent un, sans perte ni doublon. Dans le second, le job est orphelin et refuse de repartir. | Deux scénarios : vert, rouge |
| L003 | rappel | Un rappel du module trois. La position de lecture est sauvegardée à chaque commit, dans la même transaction que les données. C'est ce qui permet une reprise sans perte ni doublon. | Position + données, même commit |
| L004 | rappel | Un rappel du module quatre. Un chunk rejoué rappelle le processor : un total accumulé dedans compte l'élément deux fois. | Élément traité deux fois |
| L005 | rappel | Et un rappel du module un. Le statut de la dernière exécution décide si un restart est permis. | Table batch_job_execution |
| L006 | annonce | Sept étapes : trois problèmes et trois outils, le skip, le retry, le restart, ce qui se passe sous le capot, l'arrêt gracieux, et les pièges. | Sept pastilles 6.1 à 6.7 |

### Scène 1 : Trois problèmes, trois outils (6.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L007 | besoin | Mon besoin : qu'un lot de nuit survive aux ennuis, sans que je les traite tous de la même façon. | Lot de nuit, trois nuages |
| L008 | explicatif | Premier ennui : une donnée est mauvaise. Une ligne mal formée, un montant illisible. | Ligne CSV cassée |
| L009 | explicatif | Deuxième ennui : une ressource est momentanément indisponible. Un verrou, un délai réseau, une panne de deux secondes. | Verrou, réseau |
| L010 | explicatif | Troisième ennui : le processus s'arrête. Un crash, un redémarrage, un arrêt demandé. | Serveur qui s'éteint |
| L011 | appuyé | Chaque ennui a son réflexe. Pour la donnée : le skip. On ignore cette ligne, on la consigne, et on continue. | Outil 1 : skip |
| L012 | appuyé | Pour la ressource : le retry. On réessaie après une courte pause. | Outil 2 : retry |
| L013 | appuyé | Pour le processus : le restart. On reprend au dernier point validé. | Outil 3 : restart |
| L014 | explicatif | Voici l'arbre de décision. L'erreur vient-elle de la donnée ? Alors skip : la relancer ne changera rien, la ligne est fausse. | Arbre, branche skip |
| L015 | explicatif | Sinon, est-elle transitoire, comme un réseau ou un verrou ? Alors retry : dans quelques secondes, ça passera. | Arbre, branche retry |
| L016 | explicatif | Sinon, bug, panne durable ou arrêt : le step échoue, et on fait un restart après correction. | Arbre, branche restart |
| L017 | défi, direct | Question. Une ligne du fichier a un montant illisible. Skip, retry ou restart ? | Question « PRÉDIRE » |
| L018 | posé | Skip : relancer ne changera rien, la ligne est fausse. On l'ignore et on la consigne. | Choix « skip » en vert |
| L019 | explicatif | Un mot sur ce qui change en version six. Le step tolérant aux fautes se construit sur le builder de chunk, avec faultTolerant. | Code : `.faultTolerant()` |
| L020 | appuyé | Le retry n'est plus fourni par la bibliothèque Spring Retry. Il s'appuie sur le paquet retry de Spring Framework sept. | Spring Retry barré, `org.springframework.core.retry` |
| L021 | explicatif | Les anciens backOffPolicy et ExponentialBackOffPolicy n'existent plus sur le builder. On utilise retryPolicy. | `backOffPolicy` barré, `retryPolicy` |
| L022 | pont | Commençons par le skip, avec ses deux pièces : la règle, et la trace. | Titre « 6.2 Skip » |

### Scène 2 : Skip, ignorer et consigner (6.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L023 | besoin | Mon besoin : ignorer une ligne mauvaise, sans perdre la trace de ce qu'on a ignoré. | Ligne ignorée + trace |
| L024 | technique | Le step du module trois, avec chunk de cent, et le reader, le processor, le writer. | Code : `.chunk(100)…` |
| L025 | appuyé | Puis faultTolerant. Sans cet appel, tout skip et tout retry sont ignorés, et la première exception fait échouer le step. | `.faultTolerant()` surligné |
| L026 | technique | Les lignes mal formées du fichier : FlatFileParseException, ignorables. Les éléments invalides du module quatre aussi : ValidationException. | `.skip(FlatFileParseException.class).skip(ValidationException.class)` |
| L027 | appuyé | Et skipLimit à dix : à la onzième erreur ignorée, le step échoue. Au-delà d'un seuil, ce n'est plus une ligne mauvaise, c'est un fichier mauvais. | `.skipLimit(10)` |
| L028 | technique | Un listener de skip : appelé à chaque élément ignoré. C'est lui qui laisse une trace. | `.skipListener(rejectedLineLogger)` |
| L029 | technique | Il implémente SkipListener, avec trois méthodes : une pour la lecture, une pour le traitement, une pour l'écriture. | `implements SkipListener<RawTransaction, BankTransaction>` |
| L030 | technique | En lecture, si c'est une erreur de format, on a de quoi être précis : le numéro de la ligne et son texte brut. | `e.getLineNumber()`, `e.getInput()` |
| L031 | explicatif | Voilà de quoi écrire un rapport de rejets exploitable, à envoyer au partenaire le lendemain. | Rapport de rejets |
| L032 | explicatif | En lecture, on n'a pas d'élément : la lecture a échoué. En traitement, on a l'élément d'entrée. En écriture, l'élément de sortie. | Trois méthodes, trois contextes |
| L033 | appuyé | Sans listener, des lignes disparaissent sans trace. Inacceptable quand il s'agit d'argent. | Lignes qui disparaissent, en rouge |
| L034 | explicatif | Quand telle exception jusqu'à N fois ne suffit pas, on écrit sa propre règle : une SkipPolicy. | Code : `implements SkipPolicy` |
| L035 | technique | Elle reçoit l'exception et le nombre d'éléments déjà ignorés. Un switch avec pattern matching sur le type de l'exception. | `shouldSkip(Throwable t, long skipCount)` |
| L036 | technique | Un fichier manquant n'est jamais ignorable. Une ligne mal formée l'est, tant que le seuil n'est pas atteint. | `case FileNotFoundException -> false`, `skipCount < 10` |
| L037 | explicatif | On la branche avec skipPolicy, à la place de skip et de skipLimit. | `.skipPolicy(new FileSkipPolicy())` |
| L038 | défi, direct | Question. Tu oublies faultTolerant mais tu écris skip et skipLimit. Que se passe-t-il ? | Question « PRÉDIRE » |
| L039 | posé | Les règles sont ignorées : la première exception fait échouer le step. | Step FAILED |
| L040 | pont | Passons au retry, avec la nouvelle politique de Spring Framework sept. | Titre « 6.3 Retry » |

### Scène 3 : Retry, la politique de Spring Framework 7 (6.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L041 | besoin | Mon besoin : réessayer après un verrou de quelques secondes, sans marteler la base. | Verrou, base en difficulté |
| L042 | explicatif | Première idée : réessayer tout de suite, plusieurs fois. Ça marche, mais on martèle une base déjà en difficulté. | Dix tentatives en rafale, en rouge |
| L043 | explicatif | La bonne idée : une politique, avec des pauses qui grandissent. RetryPolicy point builder. | Code : `RetryPolicy.builder()` |
| L044 | technique | maxRetries : le nombre de nouvelles tentatives. À mesurer, sans supposer que la tentative initiale est comptée. | `.maxRetries(3)` |
| L045 | technique | delay : la pause avant la première nouvelle tentative, deux cents millisecondes. | `.delay(Duration.ofMillis(200))` |
| L046 | technique | multiplier : une progression exponentielle. Deux cents, quatre cents, huit cents. | `.multiplier(2.0)` |
| L047 | technique | maxDelay : un plafond, jamais plus de deux secondes. | `.maxDelay(Duration.ofSeconds(2))` |
| L048 | technique | jitter : un peu d'aléa, pour que plusieurs jobs ne réessaient pas à la même milliseconde. C'est l'effet de troupeau. | `.jitter(Duration.ofMillis(50))` |
| L049 | appuyé | includes : seules les erreurs transitoires sont retentées. Un échec de verrou ou de délai, pas un NullPointerException. | `.includes(TransientDataAccessException.class, SocketTimeoutException.class)` |
| L050 | technique | Et la politique se branche sur le step tolérant avec retryPolicy. | `.faultTolerant().retryPolicy(transientRetry)` |
| L051 | explicatif | Forme courte, quand aucune pause n'est nécessaire : retry, avec la classe, et retryLimit. | `.retry(TransientDataAccessException.class).retryLimit(3)` |
| L052 | explicatif | On peut combiner skip et retry. Une erreur à la fois retentable et ignorable est d'abord retentée. | Retry puis skip |
| L053 | appuyé | Si les tentatives sont épuisées, l'élément est ignoré, et consigné. Une erreur ignorable mais pas retentable est ignorée tout de suite. | Épuisé : skip |
| L054 | défi, direct | Question. Pourquoi ne pas réessayer un NullPointerException ? | Question « PRÉDIRE » |
| L055 | posé | Parce que c'est un bug, pas un hoquet. On le réessaie trois fois pour rien, et on masque une régression. | Bug réessayé 3 fois |
| L056 | pont | Maintenant, le troisième outil : reprendre un job échoué. | Titre « 6.4 Restart » |

### Scène 4 : Restart, reprendre un job échoué (6.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L057 | besoin | Mon besoin : reprendre le lot du premier octobre après un échec, sans rien rejouer. | Lot du 2026-10-01, FAILED |
| L058 | technique | Un service avec le JobOperator et le JobRepository. | Code : `@Service public class BankRestartService` |
| L059 | appuyé | Le paramètre identifiant runDate désigne la même JobInstance. Il suffit : inputFile, non identifiant, n'entre pas dans l'identité. | `.addString("runDate", runDate)` |
| L060 | technique | On retrouve la dernière exécution de cette instance, dans PostgreSQL. | `jobRepository.getLastJobExecution("bankJob", params)` |
| L061 | technique | Un switch sur le statut. Le comportement est explicite pour chaque cas. | `switch (last.getStatus())` |
| L062 | appuyé | Seuls FAILED et STOPPED autorisent un restart. Il crée une nouvelle exécution de la même instance, et retourne son identifiant. | `case FAILED, STOPPED -> jobOperator.restart(last.getId())` |
| L063 | appuyé | COMPLETED : rien à reprendre. Un autre statut, comme STARTED : le dépôt croit que le job tourne encore. | `COMPLETED → exception`, `default → exception` |
| L064 | explicatif | La documentation indique aussi qu'un start avec les mêmes paramètres sur une instance FAILED fait lui-même le restart. Restart reste la forme explicite. | start = restart implicite |
| L065 | technique | Des réglages utiles : startLimit, trois démarrages au maximum pour ce step. | `.startLimit(3)` |
| L066 | technique | allowStartIfComplete : rejouer ce step même s'il a déjà réussi, par exemple pour un nettoyage. | `.allowStartIfComplete(true)` |
| L067 | technique | Et preventRestart sur le job : pour déclarer un job non reprenable. | `.preventRestart()` |
| L068 | défi, direct | Question. Tu relances un job COMPLETED avec les mêmes paramètres. Que se passe-t-il ? | Question « PRÉDIRE » |
| L069 | posé | JobInstanceAlreadyCompleteException : l'instance est terminée, rien à reprendre. | Exception |
| L070 | pont | Comment Spring Batch sait-il où reprendre ? Regardons les tables. | Titre « 6.5 Sous le capot » |

### Scène 5 : Comment on sait où reprendre (6.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L071 | besoin | Mon besoin : comprendre exactement ce que lit un restart. | Tables à explorer |
| L072 | explicatif | En haut : une JobInstance, bankJob avec la date du premier octobre. C'est l'identité du lot. | `batch_job_instance` |
| L073 | explicatif | En dessous : la première exécution, FAILED, un crash à trois heures douze. Son step loadBankStep, FAILED, avec trente-quatre commits. | `batch_job_execution n°1  FAILED` |
| L074 | explicatif | Et son contexte : bankCsvReader point read point count égale trois mille quatre cents. | `{"bankCsvReader.read.count": 3400}` |
| L075 | explicatif | Au restart : une deuxième exécution, rattachée à la même instance. | `batch_job_execution n°2` |
| L076 | technique | Pour chaque step, on examine la dernière StepExecution. Un step COMPLETED est sauté. Un step FAILED ou STOPPED est rejoué. | Steps sautés / rejoués |
| L077 | technique | Le contexte de la dernière exécution est relu. Open restaure la position. | `open(contexte)` |
| L078 | appuyé | Le reader saute trois mille quatre cents lignes, et reprend à la trois mille quatre cent unième. | Reprise à 3 401 |
| L079 | règle | Pourquoi sans perte ni doublon ? Parce que, à chaque commit, les lignes et la position sont validées dans la même transaction. | Même commit |
| L080 | explicatif | Au crash, il n'existe que deux états : le chunk est entièrement validé, ou pas du tout. | Deux états |
| L081 | explicatif | Un crash à la ligne trois mille quatre cent cinquante : les cinquante lignes non validées sont rejouées. | Frise : chunk 34 validé, crash à 3 450 |
| L082 | appuyé | Quatre conditions. Le reader sauvegarde son état : un nom, saveState actif. | Condition 1 |
| L083 | appuyé | Les paramètres identifiants sont identiques. Le reader est rejouable : le fichier n'a pas été remplacé. | Conditions 2 et 3 |
| L084 | appuyé | Et l'écriture est dans la même base que le JobRepository, ou idempotente, avec ON CONFLICT DO UPDATE. | Condition 4 |
| L085 | défi, direct | Question. Le fichier est remplacé entre le crash et la reprise. Que se passe-t-il ? | Question « PRÉDIRE » |
| L086 | posé | Le reader saute trois mille quatre cents lignes d'un autre fichier : la reprise est fausse. Il faut figer le fichier, un répertoire par exécution. | Fichier remplacé, en rouge |
| L087 | pont | Voyons maintenant ce qui se passe dans la transaction quand un chunk échoue, puis qu'on retente. | Titre « rollback et rejeu » |

### Scène 6 : Rollback et rejeu d'un chunk (6.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L088 | besoin | Mon besoin : comprendre le coût exact d'un retry. | Chunk de 100 |
| L089 | explicatif | Début du chunk, première transaction. On lit cent éléments, on les traite. À l'élément trente-sept, une exception transitoire, un verrou. | Élément 37 en rouge |
| L090 | appuyé | Rollback. Les trente-six éléments déjà traités sont annulés. Rien n'est écrit. | Rollback, 36 éléments annulés |
| L091 | explicatif | Une pause : deux cents millisecondes, puis quatre cents, puis huit cents. | Pause exponentielle |
| L092 | explicatif | Puis une deuxième transaction. Le chunk est rejoué en entier : les cent éléments sont retraités depuis le début. | Rejeu complet, en vert |
| L093 | explicatif | Si ça passe : écriture des cent, sauvegarde de la position, commit. Sinon, retour au rollback, jusqu'à épuisement. | Succès ou nouvelle tentative |
| L094 | explicatif | À l'épuisement : si l'exception est ignorable, l'élément fautif est écarté. Sinon, le step échoue, et un restart reste possible. | Skip ou échec |
| L095 | appuyé | Première conséquence : le rollback annule le chunk entier. Plus le chunk est grand, plus le rejeu coûte. | Chunk grand = rejeu coûteux |
| L096 | appuyé | Deuxième : les trente-six premiers éléments sont retraités. Ce qu'ils ont fait hors de la transaction, un appel d'API, un e-mail, est répété. | Effets répétés |
| L097 | appuyé | Et tout compteur en mémoire les compte deux fois, comme au module quatre. | Compteur doublé |
| L098 | explicatif | Troisième : quand l'écriture échoue et qu'un skip est possible, Spring Batch rejoue le chunk élément par élément, pour isoler le fautif. | Mode scan |
| L099 | appuyé | C'est exact, mais plus lent : cent petites transactions au lieu d'une. | 100 petites transactions |
| L100 | règle | Valide en amont, comme au module quatre, pour que l'écriture n'échoue pas. | Phrase encadrée |
| L101 | défi, direct | Question. Un chunk de cent, un échec à l'élément trente-sept en traitement, puis succès. Combien d'éléments sont écrits en base ? | Question « PRÉDIRE » |
| L102 | posé | Cent, une seule fois. La première tentative est annulée, la deuxième écrit tout. Mais le processor a été appelé plus de cent fois. | 100 écrits, processor rappelé |
| L103 | pont | Reste le cas du SIGTERM, qui arrive en pleine nuit. | Titre « 6.6 Arrêt gracieux » |

### Scène 7 : L'arrêt gracieux (6.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L104 | besoin | Mon besoin : quand le serveur reçoit SIGTERM, que le job finisse le chunk en cours, puis s'arrête proprement. | SIGTERM, chunk en cours |
| L105 | explicatif | Sans cela, la JVM est coupée au milieu d'une transaction. Avec un hook, l'arrêt est demandé, et coopératif. | Coupure brutale / arrêt coopératif |
| L106 | technique | Un listener de job. Il retient une association par exécution : un listener est un singleton, il peut surveiller plusieurs exécutions. | Code : `Map<Long, Thread> hooks` |
| L107 | appuyé | Jamais un champ unique : c'est le piège du module deux et du module quatre. | Champ unique barré |
| L108 | technique | Le JobOperator est injecté à la demande, avec ObjectProvider, pour éviter une dépendance circulaire. | `ObjectProvider<JobOperator>` |
| L109 | technique | Dans beforeJob : l'exécution a un identifiant. On crée un JobExecutionShutdownHook, avec l'exécution et l'opérateur. | `new JobExecutionShutdownHook(jobExecution, jobOperator.getObject())` |
| L110 | technique | Et on l'enregistre auprès de la JVM, avec addShutdownHook. | `Runtime.getRuntime().addShutdownHook(hook)` |
| L111 | technique | Dans afterJob : le job est terminé, le hook devient inutile. On le retire. | `removeShutdownHook(hook)` |
| L112 | explicatif | Si la JVM est déjà en train de s'arrêter, le retrait est refusé : on ignore cette exception. | `catch (IllegalStateException …)` |
| L113 | technique | Le listener se branche sur le job, avec listener. | `.listener(gracefulShutdownListener)` |
| L114 | explicatif | Que fait le hook ? À la réception du signal, il journalise, puis appelle jobOperator point stop sur l'exécution. | SIGTERM → hook → `stop(jobExecution)` |
| L115 | appuyé | Il demande l'arrêt. Il n'attend pas la fin. L'exécution est marquée arrêt demandé. | Marquage « arrêt demandé » |
| L116 | explicatif | Le chunk en cours continue, valide son commit, lignes et position. | Chunk en cours terminé |
| L117 | explicatif | Avant le chunk suivant, la politique d'interruption constate la demande, et lève une JobInterruptedException. | JobInterruptedException |
| L118 | explicatif | La StepExecution et la JobExecution passent à STOPPED, le contexte est sauvegardé, et la JVM s'arrête proprement. | STOPPED, contexte sauvegardé |
| L119 | appuyé | L'arrêt est coopératif : il a lieu entre deux chunks. Un chunk de cent mille éléments retarde l'arrêt d'autant. | Chunk énorme retarde l'arrêt |
| L120 | appuyé | Et le statut final est STOPPED, pas FAILED : le restart est autorisé, sans rien corriger. | STOPPED vert |
| L121 | appuyé | Côté exploitation : le délai accordé par l'orchestrateur doit dépasser la durée d'un chunk. Sinon la JVM est tuée avant la fin. | terminationGracePeriodSeconds > durée d'un chunk |
| L122 | défi, direct | Question. Que se passe-t-il si le délai d'arrêt de l'orchestrateur est plus court qu'un chunk ? | Question « PRÉDIRE » |
| L123 | posé | La JVM est tuée avant la fin du chunk : on retombe dans le cas du crash, avec une exécution orpheline. | Exécution orpheline |
| L124 | explicatif | Un kill moins neuf, une erreur de mémoire, une coupure de courant : aucun hook ne s'exécute. | kill -9 : aucun hook |
| L125 | explicatif | Le chunk en cours est annulé par PostgreSQL, ce qui est sain. Mais le dépôt garde l'exécution à l'état STARTED. | Exécution STARTED orpheline |
| L126 | appuyé | Conséquence : un restart est refusé, car le dépôt croit que le job tourne encore. | Restart refusé |
| L127 | appuyé | Il faut d'abord déclarer l'exécution orpheline, avec recover, ou abandon. | `jobOperator.recover(…)` |
| L128 | règle | Avant de le faire, vérifie qu'aucune JVM n'exécute plus ce job. Sinon, deux exécutions simultanées. | Vérifier d'abord |
| L129 | pont | Trois situations réelles pour fixer ces idées. | Titre « cas d'usage » |

### Scène 8 : Cas d'usage

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L130 | explicatif | Premier cas : la nuit du serveur qui redémarre. À trois heures douze, SIGTERM. Le hook demande l'arrêt, le chunk en cours se termine, le job passe à STOPPED. | SIGTERM, STOPPED |
| L131 | appuyé | Au matin, restartFor reprend à la ligne trois mille quatre cent un. Aucune ligne perdue ni dupliquée. | Reprise à 3 401 |
| L132 | explicatif | Deuxième cas : le fichier d'un partenaire contient trois lignes cassées sur deux millions. Un skip, un plafond à dix, un listener. | 3 lignes sur 2 M |
| L133 | appuyé | Le lot va au bout, et le rapport de rejets part au partenaire le lendemain. | Rapport de rejets |
| L134 | explicatif | Troisième cas : la base qui hoquette. Un verrou de quelques secondes fait échouer un chunk. | Verrou de 3 s |
| L135 | appuyé | Avec un retry exponentiel, la deuxième tentative passe. Personne n'a rien vu, hormis une ligne de journal. | Tentative 2 : verte |
| L136 | pont | Voyons les dix pièges. | Titre « Top 10 » |

### Scène 9 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L137 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L138 | appuyé | Un : un skip silencieux. Des lignes disparaissent sans trace. | Ligne 1 |
| L139 | pédagogue | Comment le repérer : un skip count supérieur à zéro, et aucune ligne dans le journal des rejets. | Extrait indicatif : `skip_count = 7`, journal des rejets : vide |
| L140 | appuyé | Deux : un retry sur une exception non transitoire. On réessaie un bug trois fois pour rien. | Ligne 2 |
| L141 | pédagogue | Comment le repérer : la même NullPointerException, répétée trois fois, avec des pauses. | Extrait indicatif : `NullPointerException` ×3, pauses de 200, 400, 800 ms |
| L142 | appuyé | Trois : un restart d'un job dont le statut n'est pas FAILED ni STOPPED. | Ligne 3 |
| L143 | pédagogue | Comment le repérer : une exception sur le statut, ou une nouvelle instance si les paramètres changent. | Extrait indicatif : `JobInstanceAlreadyCompleteException` |
| L144 | appuyé | Quatre : un skipLimit trop haut. Un fichier totalement mauvais passe pour quelques erreurs. | Ligne 4 |
| L145 | pédagogue | Comment le repérer : un lot COMPLETED, avec un taux de rejets énorme. | Extrait indicatif : `status = COMPLETED   skip_count = 482 931` |
| L146 | appuyé | Cinq : skip ou retry sans faultTolerant. Les règles sont ignorées. | Ligne 5 |
| L147 | pédagogue | Comment le repérer : un step qui échoue à la première exception, malgré les règles écrites. | Extrait indicatif : `FlatFileParseException … step FAILED   skip_count = 0` |

### Scène 10 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L148 | pont | Les cinq suivants touchent le débit, les effets de bord et l'arrêt. | Tableau, lignes 6 à 10 |
| L149 | appuyé | Six : un skip en écriture, sans y penser. Le chunk est rejoué élément par élément. | Ligne 6 |
| L150 | pédagogue | Comment le repérer : un débit qui s'effondre dès qu'un élément échoue à l'écriture. | Extrait indicatif : `commit_count = 100 pour un seul chunk` |
| L151 | appuyé | Sept : un retry avec des effets de bord, ou des totaux dans le processor. | Ligne 7 |
| L152 | pédagogue | Comment le repérer : un e-mail envoyé deux fois, un compteur doublé après rejeu. | Extrait indicatif : deux lignes `mail envoyé : client 42` |
| L153 | appuyé | Huit : un retry sans pause ni plafond. On martèle une base déjà en difficulté. | Ligne 8 |
| L154 | pédagogue | Comment le repérer : des dizaines de tentatives par seconde, et une base qui sature. | Extrait indicatif : `retry 1 … retry 47` en une seconde |
| L155 | appuyé | Neuf : un reader non reprenable. Pas de nom, saveState désactivé, ou fichier remplacé. | Ligne 9 |
| L156 | pédagogue | Comment le repérer : un restart qui repart de zéro, avec des doublons ou des pertes. | Extrait indicatif : `read.count absent   →   reprise à la ligne 1` |
| L157 | appuyé | Dix : un arrêt non gracieux. Pas de hook, ou un délai plus court qu'un chunk. Exécution orpheline. | Ligne 10 |
| L158 | pédagogue | Comment le repérer : une exécution STARTED au matin, sans processus, et un restart refusé. | Extrait indicatif : `status = STARTED   end_time = NULL` |
| L159 | explicatif | Trois tests qu'un job de production doit avoir. Le skip : un fichier avec deux lignes mauvaises, job COMPLETED, skip count égal à deux. | Test skip |
| L160 | explicatif | Le retry : un processor qui échoue deux fois puis réussit, job COMPLETED. On compte les appels, et on vérifie qu'aucun total n'est doublé. | Test retry |
| L161 | explicatif | Le restart : un writer qui échoue au trois cent cinquantième élément. Puis relance avec les mêmes paramètres, et un SELECT COUNT égal au nombre de lignes. | Test restart |
| L162 | règle | Ni plus, ce serait des doublons. Ni moins, ce serait des pertes. | Phrase encadrée |

### Scène 11 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L163 | pédagogue | Reprenons notre nuit de trois heures douze. Tu sais maintenant comment le job reprend, ou pourquoi il refuse de repartir. | Nuit de 3 h 12, reprise |
| L164 | récapitulatif | Skip pour la donnée, retry pour la ressource, restart pour le processus. | Trois pastilles |
| L165 | récapitulatif | Un skip se consigne. Un retry se borne, avec pauses et jitter. Un restart reprend au dernier commit. | Trois pastilles |
| L166 | récapitulatif | Un arrêt gracieux demande l'arrêt, laisse finir le chunk, et passe à STOPPED. | Pastille |
| L167 | défi | Quatre exercices. Un : pourquoi un skip sans listener est-il dangereux pour un fichier bancaire ? | Exercice 1 |
| L168 | défi | Deux : un processor échoue deux fois par élément sur trois éléments. Combien d'appels, combien de rollbacks ? Mesure-le sur ta version. | Exercice 2 |
| L169 | défi | Trois : un job est STARTED au matin, sans aucun processus. Que fais-tu, dans quel ordre ? | Exercice 3 |
| L170 | défi | Quatre : un chunk de cent mille et un délai d'arrêt de trente secondes. Quel est le risque ? | Exercice 4 |
| L171 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L172 | explicatif | Correction un. Des lignes disparaissent sans trace : à la réconciliation, on ne sait pas lesquelles. Il faut le numéro de ligne et le texte brut. | Exercice 1 |
| L173 | explicatif | Correction deux. À mesurer sur ta version : c'est précisément le but de l'exercice. Compte les appels et les rollbacks. | Exercice 2 |
| L174 | explicatif | Correction trois. Vérifier qu'aucune JVM n'exécute plus ce job. Puis recover ou abandon. Puis restart. | Exercice 3 |
| L175 | explicatif | Correction quatre. L'arrêt est coopératif, entre deux chunks. Un chunk trop long dépasse le délai : la JVM est tuée, exécution orpheline. | Exercice 4 |
| L176 | transition | Au module suivant, tu passes à l'échelle : multithread, partitionnement, plusieurs instances, et le verrou SKIP LOCKED. | Aperçu « mise à l'échelle » |
