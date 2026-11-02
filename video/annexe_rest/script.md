# Annexe REST : Consommer des API dans un batch

Vidéo de formation Spring Batch, annexe, à regarder après le Module 6 (et avant le Module 8 pour la supervision). Durée : celle qu'il faut, environ quinze minutes, en neuf parties. Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Sources : `support/modules/MODULE_6.md` (retry et skip), `MODULE_4.md` (processor et rejeu du chunk), et les classes de Spring Batch six point zéro point six (AbstractPaginatedDataItemReader, ItemReaderAdapter, ItemWriterAdapter) et de Spring Framework sept (RetryTemplate, RetryPolicy), lues dans les jars. Non vérifié faute de jar téléchargeable : RestClient, HttpExchange et MockRestServiceServer de Spring Framework sept, et les propriétés `spring.http.client.connect-timeout` et `read-timeout` de Spring Boot quatre point un ; à confirmer dans la documentation avant tournage. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des autres modules autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 1 : L'accroche et les risques

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Ton job de nuit appelle une API REST. Pendant dix mois, tout va bien. Puis, un soir, l'API répond en trente secondes au lieu de trente millisecondes. | Terminal : latence 30 ms puis 30 s |
| L002 | appuyé | Ton batch lit un million de lignes, et fait un appel par ligne. Il ne finira pas avant le matin. | Compteur : 1 000 000 appels |
| L003 | posé | Pire : un autre soir, l'API tombe en panne au milieu du traitement. Ton job s'arrête. Mais l'API, elle, avait déjà reçu la moitié de tes écritures. | Schéma : écritures déjà reçues |
| L004 | rappel | Au module un, tu as exposé une API pour lancer le job. Au module six, tu as vu le retry. Ici, on fait l'inverse : ton batch consomme une API. | Rappels : Module 1 et Module 6 |
| L005 | explicatif | Une API, c'est une dépendance externe. Elle est lente, elle tombe, elle limite le débit, et elle ne participe pas à ta transaction. | Quatre risques : lenteur, panne, quotas, transaction |
| L006 | pédagogue | Cette annexe répond à une question : comment appeler une API dans un batch, sans transformer ton job en roulette russe ? | Titre de l'annexe |
| L007 | annonce | Trois endroits possibles dans un step : en entrée, dans le processor, en sortie. Chacun a son piège. | Reader, processor, writer |
| L008 | pont | On commence par le socle : le client HTTP, ses délais d'attente, et la classification des erreurs. | Titre « Le socle » |

### Scène 2 : Le client HTTP

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L009 | explicatif | Dans Spring Boot quatre, le client synchrone recommandé s'appelle RestClient. Un batch s'exécute thread par thread : pas besoin de réactif. | RestClient en vert, RestTemplate et WebClient en gris |
| L010 | technique | Tu construis le client à partir du builder fourni par Spring Boot. Tu profites ainsi de la configuration commune et des mesures. | Code : `builder.baseUrl(url).build()` |
| L011 | appuyé | Premier réflexe, avant tout le reste : les délais d'attente. Sans délai de lecture, un appel peut attendre indéfiniment, et ton step reste bloqué. | Terminal : appel sans fin |
| L012 | technique | Deux délais : la connexion, et la lecture. Deux secondes pour la connexion, cinq pour la lecture, par exemple. | Code : `spring.http.client.connect-timeout=2s` et `read-timeout=5s` |
| L013 | pédagogue | Un délai trop long cache la panne, un délai trop court crée de faux échecs. Mesure d'abord la latence normale, puis prends une marge. | Échelle : latence normale, marge, délai |
| L014 | explicatif | Pour écrire moins de code, Spring propose les clients déclaratifs : une interface Java annotée avec HttpExchange. | Code : `@HttpExchange("/accounts") interface AccountApi` |
| L015 | technique | Tu y déclares tes appels avec GetExchange et PostExchange. Spring génère l'implémentation, à partir de ton RestClient. | Code : `@GetExchange`, `@PostExchange`, `HttpServiceProxyFactory` |
| L016 | explicatif | L'avantage : l'API devient un simple bean, facile à injecter dans un reader, un processor ou un writer, et facile à simuler dans les tests. | Bean injecté dans les trois composants |
| L017 | pont | Maintenant, ce qui arrive quand l'appel échoue. Spring distingue plusieurs familles d'erreurs. | Titre « Classer les erreurs » |

### Scène 3 : Classer les erreurs et réessayer

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L018 | explicatif | Un statut cinq cent, c'est une HttpServerErrorException : le serveur a un problème. Il peut se rétablir : on réessaie. | 5xx : transitoire |
| L019 | explicatif | Une erreur réseau, délai dépassé ou connexion refusée, arrive en ResourceAccessException. Elle aussi est transitoire : on réessaie. | ResourceAccessException : transitoire |
| L020 | explicatif | Un statut quatre cent, c'est une HttpClientErrorException : ta requête est mauvaise. La rejouer ne servira à rien : on ne réessaie pas. | 4xx : permanent |
| L021 | appuyé | Deux exceptions à cette règle : le quatre cent huit, délai dépassé côté serveur, et le quatre cent vingt-neuf, trop de requêtes. Ces deux-là sont transitoires. | 408 et 429 en orange |
| L022 | posé | La règle tient en une phrase : cinq cent et erreurs réseau, on réessaie. Quatre cent, non, sauf quatre cent huit et quatre cent vingt-neuf. | Tableau de décision |
| L023 | technique | Spring Framework sept fournit RetryTemplate, avec une RetryPolicy. Tu choisis le nombre d'essais, le délai, un multiplicateur, et un prédicat qui désigne les erreurs transitoires. | Code : `RetryPolicy.builder().maxRetries(3).delay(...)` |
| L024 | technique | Le prédicat est une simple méthode : elle répond vrai pour les erreurs cinq cent, les erreurs réseau, le quatre cent huit et le quatre cent vingt-neuf. | Code : `.predicate(Retries::isTransient)` |
| L025 | technique | Tu exécutes l'appel dans le template. Si les essais sont épuisés, tu reçois une RetryException, avec la dernière cause. | Code : `retryTemplate.execute(() -> api.find(id))` |
| L026 | défi, direct | Question. L'API répond quatre cent quatre pour une ligne. Que fait ton batch ? | Question « PRÉDIRE » |
| L027 | posé | Il ne réessaie pas. Un quatre cent quatre ne se corrige pas en attendant. Tu décides : ignorer la ligne avec un skip, ou faire échouer le step. | Choix « pas de retry » en vert |
| L028 | explicatif | Pourquoi un RetryTemplate local, plutôt que le retry du step ? Parce que le retry du step rejoue tout le chunk, donc les appels de tous les autres éléments. | Chunk de cent rejoué : cent appels |
| L029 | appuyé | Le template local ne rejoue que l'appel qui a échoué. Le retry du step reste un filet de sécurité, pour le reste. | Deux niveaux : appel et chunk |
| L030 | pont | Passons aux trois positions. D'abord l'entrée : lire des données depuis une API. | Titre « En entrée » |

### Scène 4 : L'API en entrée, le reader paginé

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L031 | explicatif | Cas un : l'API est ta source de données. Elle renvoie une page de résultats : une liste, et un numéro de page. | API paginée : page 0, 1, 2 |
| L032 | explicatif | Tu ne peux pas tout charger en mémoire. Le job lit page après page, comme un reader de base de données paginé. | Fenêtre glissante sur les pages |
| L033 | technique | Spring Batch fournit une classe de base : AbstractPaginatedDataItemReader. Tu n'écris qu'une méthode : doPageRead. | Code : `extends AbstractPaginatedDataItemReader<Account>` |
| L034 | technique | Dans doPageRead, tu appelles l'API avec le numéro de page courant et la taille de page, et tu retournes un itérateur. | Code : `api.list(page, pageSize).iterator()` |
| L035 | explicatif | Quand l'API renvoie une page vide, tu retournes un itérateur vide, et le reader termine. | Page vide : fin de lecture |
| L036 | appuyé | Donne un nom au reader avec setName. Sans nom, la position ne peut pas être sauvegardée dans l'ExecutionContext. | Code : `setName("accountApiReader")` |
| L037 | explicatif | Le reader est un ItemStream. À chaque commit, il écrit le nombre d'éléments lus dans l'ExecutionContext, sous la clé read point count. | Clé : `accountApiReader.read.count` |
| L038 | explicatif | Au restart, il calcule la page où il s'était arrêté, relit seulement cette page, et saute les éléments déjà traités. Il ne rejoue pas les pages précédentes. | Restart : saut à la page 7 |
| L039 | défi, direct | Question. Pendant que ton job lit, quelqu'un crée des comptes sur la première page. Que se passe-t-il ? | Question « PRÉDIRE » |
| L040 | posé | Des doublons, ou des trous. Les éléments glissent d'une page à l'autre. Une pagination par numéro de page n'est pas stable si les données bougent. | Choix « doublons ou trous » en vert |
| L041 | technique | Premier remède : un tri stable, par identifiant, et un filtre figé au démarrage, par exemple les éléments créés avant l'heure de lancement. | Code : `?sort=id&createdBefore=2026-11-01T00:00` |
| L042 | technique | Deuxième remède : une pagination par curseur. Tu demandes les éléments situés après le dernier identifiant lu. | Code : `?afterId=1250&limit=500` |
| L043 | appuyé | Troisième remède, le plus robuste : copier d'abord l'API dans une table de staging, puis lire la table. La lecture devient reproductible. | Step 1 : copie. Step 2 : lecture |
| L044 | attention | Un piège : ItemReaderAdapter. Il appelle une méthode jusqu'à ce qu'elle retourne null. Mais il n'est pas un ItemStream : aucune position n'est sauvegardée. | `ItemReaderAdapter` : pas d'ExecutionContext |
| L045 | appuyé | Résultat : après un échec, le restart repart de zéro. Pour un reader à API, préfère donc la classe paginée. | Restart de zéro en rouge |
| L046 | pédagogue | Choisis une taille de page égale à la taille de ton chunk, ou à un multiple. Cinq cents éléments par page, un chunk de cinq cents. | Page 500 égale chunk 500 |
| L047 | pont | Deuxième position : appeler l'API depuis un processor. | Titre « Dans le processor » |

### Scène 5 : L'API dans le processor

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L048 | explicatif | Cas deux : tu enrichis chaque élément avec une API, par exemple le taux de change d'une devise. | Processor : élément puis appel API |
| L049 | appuyé | C'est simple à écrire. Mais fais le calcul : cent mille éléments, cinquante millisecondes par appel, cela fait cinq mille secondes. Plus d'une heure vingt. | Calcul : 100 000 × 50 ms = 83 min |
| L050 | explicatif | C'est le piège des N plus un appels : un appel par ligne, alors que quelques centaines de valeurs distinctes suffiraient. | N+1 : 100 000 appels, 500 valeurs distinctes |
| L051 | technique | Premier remède : un cache. Les données de référence, comme les devises, changent rarement pendant une nuit. Cinq cents valeurs, cinq cents appels. | Code : `cache.computeIfAbsent(code, api::rate)` |
| L052 | pédagogue | Ton cache vit dans le processor et dure le temps du job. Pas besoin d'un cache distribué. | Cache : durée du job |
| L053 | technique | Deuxième remède : précharger toutes les valeurs au début du step, avec un seul appel de liste. Le processor n'a plus qu'une recherche en mémoire. | Préchargement : un appel, puis mémoire |
| L054 | technique | Troisième remède, quand les données sont propres à chaque ligne : un endpoint en lot, qui accepte cent identifiants à la fois, plutôt qu'un seul. | Endpoint bulk : 100 identifiants par appel |
| L055 | défi, direct | Question. Un chunk de cent éléments échoue au quatre-vingt-dixième. Le retry du step rejoue le chunk. Combien d'appels API en tout ? | Question « PRÉDIRE » |
| L056 | posé | Environ cent quatre-vingt-dix : quatre-vingt-dix à la première tentative, cent au rejeu. Le rejeu rappelle le processor : ton appel doit être sans effet de bord. | Choix « 190 » en vert |
| L057 | appuyé | Un GET est idempotent : le rejouer ne change rien. Un POST dans un processor est dangereux : tu l'enverras deux fois. | GET en vert, POST en rouge |
| L058 | posé | La règle : dans un processor, on lit avec l'API, on n'écrit pas. L'écriture est le travail du writer. | Règle : lecture seule |
| L059 | pédagogue | Dernier détail : quand une exception sort du processor et déclenche un skip, garde l'identifiant de l'élément dans le message. Tu te remercieras en lisant le journal. | Message : compte 1250, API 404 |
| L060 | pont | Troisième position : l'écriture vers une API. C'est là que les vrais problèmes commencent. | Titre « En sortie » |

### Scène 6 : L'API en sortie, le writer

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L061 | appuyé | Cas trois : le writer envoie les éléments vers une API. Ça paraît anodin. C'est le cas le plus dangereux. | Writer : chunk vers API |
| L062 | rappel | Rappelle-toi ce que garantit le chunk : la base est transactionnelle. Le commit et le rollback couvrent tes tables. | Transaction : couvre la base |
| L063 | appuyé | Mais l'API ne participe pas à cette transaction. Un appel envoyé ne peut pas être annulé par un rollback. | API en dehors de la transaction |
| L064 | explicatif | Scénario : le writer envoie cinquante éléments. Puis le commit échoue en base. Le chunk est annulé, et rejoué. | Séquence : envoi, échec du commit, rejeu |
| L065 | appuyé | Les cinquante éléments sont envoyés une seconde fois. Résultat : cinquante doublons côté API. | 50 doublons |
| L066 | explicatif | Même chose au restart : le dernier chunk, jamais validé en base mais déjà reçu par l'API, est renvoyé. | Restart : dernier chunk renvoyé |
| L067 | défi, direct | Question. Pour éviter les doublons, tu génères un UUID aléatoire pour chaque appel et tu l'envoies dans l'en-tête Idempotency-Key. Ça marche ? | Question « PRÉDIRE » |
| L068 | posé | Non. Un UUID tiré à chaque appel change à chaque rejeu : l'API le voit comme une nouvelle demande. La clé doit être stable. | Choix « non » en vert |
| L069 | technique | Construis la clé avec des données métier stables : le type d'opération, l'identifiant de l'élément, la date de traitement. | Code : `"payment-" + id + "-" + runDate` |
| L070 | explicatif | L'API reconnaît la clé déjà vue, et renvoie le résultat d'origine, sans refaire l'opération. | Deuxième envoi : résultat d'origine |
| L071 | explicatif | Si l'API ne gère pas l'idempotence, choisis une méthode naturellement idempotente : un PUT sur l'identifiant, plutôt qu'un POST. | PUT en vert, POST en rouge |
| L072 | technique | Dernière option : le motif outbox. Dans le chunk, tu écris en base une table des envois à faire. Un second step envoie, puis marque comme envoyé. | Step 1 : table outbox. Step 2 : envoi |
| L073 | appuyé | Ainsi, la transaction ne couvre que la base, et l'envoi peut être rejoué sans risque, puisque l'état est connu. | Statut ENVOYÉ en base |
| L074 | technique | Écrire un writer personnalisé est simple : une méthode write qui reçoit le chunk, et un appel groupé si l'API accepte un lot. | Code : `class ApiPaymentWriter implements ItemWriter<Payment>` |
| L075 | pédagogue | Un appel par chunk est bien plus efficace qu'un appel par élément. Cent éléments, un appel, et un seul point de rejeu. | 1 appel au lieu de 100 |
| L076 | explicatif | ItemWriterAdapter, lui, appelle une méthode par élément. C'est pratique pour un prototype, moins pour la production. | `ItemWriterAdapter` : un appel par élément |
| L077 | pédagogue | Si le lot échoue en partie, lis la réponse : l'API peut indiquer quels éléments sont refusés. Remonte-les, plutôt qu'une exception générique. | Réponse partielle : 98 acceptés, 2 refusés |

### Scène 7 : Débit et quotas

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L078 | explicatif | Les API limitent le débit. Au-delà du quota, tu reçois un statut quatre cent vingt-neuf : trop de requêtes. | 429 |
| L079 | technique | L'en-tête Retry-After indique combien de temps attendre. Respecte-le, plutôt que de rejouer à toute vitesse. | En-tête : `Retry-After: 30` |
| L080 | technique | Un retry exponentiel, avec un peu de jitter, évite que tous tes threads rejouent au même instant. | Délais : 1 s, 2 s, 4 s avec jitter |
| L081 | explicatif | Si tu multiplies les threads, comme au module sept, tu multiplies aussi les appels. Le quota est partagé, il n'est pas par thread. | N threads, un seul quota |
| L082 | technique | Mets un limiteur de débit global, partagé entre les threads, et règle-le un peu sous le quota annoncé. | Limiteur : 80 % du quota |
| L083 | appuyé | Garde de la marge : l'API sert aussi d'autres clients. Un batch qui consomme tout le quota fait tomber les utilisateurs en journée. | Batch contre utilisateurs |
| L084 | pédagogue | Place les appels lourds la nuit, et prévois un paramètre pour réduire le débit sans redéployer. | Paramètre : requêtes par seconde |
| L085 | pont | Reste à tester tout cela, sans appeler la vraie API. | Titre « Tester et surveiller » |

### Scène 8 : Tester et surveiller

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L086 | appuyé | Un test de batch ne doit jamais appeler la vraie API. Elle est lente, instable, et peut-être facturée. | Pas d'API réelle dans les tests |
| L087 | technique | Avec MockRestServiceServer, tu te branches sur le builder du RestClient, et tu simules les réponses. | Code : `MockRestServiceServer.bindTo(builder)` |
| L088 | technique | Scénario un : l'API répond cinq cent trois, puis deux cents. Tu vérifies que le batch réussit après un retry. | Code : `withServerError()` puis `withSuccess(...)` |
| L089 | technique | Scénario deux : l'API répond quatre cent quatre. Tu vérifies qu'il n'y a aucun retry, et que la ligne est ignorée. | Code : `withStatus(NOT_FOUND)` |
| L090 | technique | Scénario trois : une erreur réseau, simulée avec withException. Tu vérifies qu'elle est réessayée, et que le step échoue proprement quand les essais sont épuisés. | Code : `withException(new IOException())` |
| L091 | explicatif | Côté exploitation, construis le client avec le builder de Spring Boot : les appels sortants sont alors mesurés, avec la métrique http point client point requests. | Métrique : `http.client.requests` |
| L092 | appuyé | Journalise l'adresse appelée et le statut, jamais les en-têtes d'authentification. Un jeton dans un journal, c'est une fuite. | Journal : URL et statut, sans jeton |
| L093 | pédagogue | Et surveille trois chiffres : le nombre d'appels, le taux d'erreur et la latence. Ils annoncent la panne avant qu'elle n'arrive. | Trois indicateurs |

### Scène 9 : Récapitulatif et clôture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L094 | calme | Récapitulons, position par position. | Tableau : entrée, processor, sortie |
| L095 | pédagogue | En entrée : un reader paginé qui sauvegarde sa position, avec un tri stable, ou une copie en staging. | Entrée : reader paginé |
| L096 | pédagogue | Dans le processor : on lit seulement, avec un cache ou un préchargement, pour éviter les N plus un appels. | Processor : lecture seule, cache |
| L097 | pédagogue | En sortie : une clé d'idempotence stable, ou un outbox, et des appels groupés par chunk. | Sortie : idempotence, outbox, lot |
| L098 | appuyé | Partout : un délai de connexion et de lecture, un retry limité aux erreurs transitoires, et un débit sous le quota. | Socle commun |
| L099 | posé | Cinq pièges à retenir : pas de délai d'attente, un UUID aléatoire comme clé, un POST dans le processor, une pagination instable, et ItemReaderAdapter sans position. | Top 5 des pièges |
| L100 | rappel | Tu retrouveras les bases dans les modules trois, quatre et six, et la supervision au module huit. | Rappels : Modules 3, 4, 6 et 8 |
| L101 | appuyé | Avant de passer en production, pose-toi une question : si l'API tombe à la moitié, mon job sait-il reprendre sans doublon ? | Question finale |
| L102 | léger, conclusion | Voilà pour cette annexe. Ton batch sait maintenant parler à une API, sans lui faire confiance aveuglément. | Fin : « Annexe REST terminée » |
