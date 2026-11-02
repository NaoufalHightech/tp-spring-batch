# Module 4 : Processors, scopes et proxys

Vidéo de formation Spring Batch. Durée visée : 60 minutes, en sept parties (4.1 à 4.7). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_4.md`. C'est le module du bug le plus vicieux de Spring Batch : le double comptage. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des modules suivants autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture et flashbacks

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Le contrôleur financier découvre l'écart trois semaines plus tard. Le total des débits du rapport est faux, deux nuits cumulées. Aucune erreur, aucun journal rouge. | Rapport de fin de nuit, total faux, calendrier de trois semaines |
| L002 | pédagogue | Ce bug, c'est le double comptage. Il tient en une ligne : un champ modifiable dans un singleton. Aujourd'hui, on le provoque, on le comprend, on l'éteint. | Champ modifiable en rouge |
| L003 | rappel | Un rappel du module trois. Retourner null filtre l'élément : il n'entre pas dans le chunk, la position avance, et filter count augmente. Jamais skip count. | `return null` → filterCount |
| L004 | rappel | Un rappel du module deux. Un bean est un singleton : un seul objet pour toute l'application. Tout champ modifiable est un état partagé. | Singleton, trois lancements |
| L005 | annonce | Sept étapes : le rôle du processor, la validation, le composite, le piège de l'état, les trois solutions, les limites des proxys, et les pièges. | Sept pastilles 4.1 à 4.7 |

### Scène 1 : Le rôle du processor (4.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L006 | besoin | Mon besoin : appliquer des règles métier entre la lecture et l'écriture. | Reader → ? → writer |
| L007 | explicatif | C'est le rôle du processor. Il reçoit un seul élément, et il fait l'une de trois choses. | Trois flèches depuis un élément |
| L008 | explicatif | Première : transformer. Il retourne un objet, de même type ou d'un autre type, qui entre dans le chunk. | Flèche vers le chunk, en vert |
| L009 | explicatif | Deuxième : filtrer. Il retourne null. L'élément n'est pas écrit, filter count augmente, et ce n'est pas une erreur. | Flèche vers la corbeille, filterCount + 1 |
| L010 | explicatif | Troisième : rejeter. Il lève une exception. Rollback du chunk, le step échoue, sauf règle de skip. | Flèche vers le rollback, en rouge |
| L011 | technique | Le contrat est simple : un type en entrée, un type en sortie. ItemProcessor, entrée RawTransaction, sortie BankTransaction. | `ItemProcessor<RawTransaction, BankTransaction>` |
| L012 | technique | Dans la base, on lit la relation : read count égale write count plus filter count. | `read_count = write_count + filter_count` |
| L013 | défi, direct | Question. Un processor lève une exception sur un élément. Que devient le chunk ? | Question « PRÉDIRE » |
| L014 | posé | Il est annulé en entier, avec un rollback. Le step échoue, sauf règle de skip, que nous verrons au module six. | Chunk annulé |
| L015 | pont | Avant d'écrire des règles, voyons comment les exprimer sans écrire de if. | Titre « 4.2 Valider » |

### Scène 2 : Valider avec Bean Validation (4.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L016 | besoin | Mon besoin : refuser les lignes invalides, sans écrire une cascade de if. | Cascade de if barrée |
| L017 | explicatif | Les règles deviennent des annotations sur l'objet. Lisibles, réutilisables, sans code. | Annotations sur un record |
| L018 | technique | D'abord la dépendance : le starter de validation. Sans elle, le validateur ne trouve aucune règle. | XML : `spring-boot-starter-validation` |
| L019 | technique | Puis le record RawTransaction, enrichi. L'identifiant positif, le compte non vide. | `@Positive long id`, `@NotBlank String accountNumber` |
| L020 | technique | Le type avec une expression régulière : seul D ou C est accepté. Le montant obligatoire, positif ou nul. | `@Pattern(regexp = "[DC]")`, `@NotNull @PositiveOrZero` |
| L021 | technique | Le processor : BeanValidatingItemProcessor, qui applique ces règles à chaque élément. | `new BeanValidatingItemProcessor<RawTransaction>()` |
| L022 | appuyé | Par défaut, un élément invalide lève une ValidationException : le chunk est annulé, le step échoue. | Exception en rouge |
| L023 | appuyé | Avec setFilter à true, l'élément est filtré, comme avec return null, et filter count augmente. | `validating.setFilter(true)` |
| L024 | règle | Choisis selon la règle métier. Une ligne invalide doit-elle arrêter le lot, ou être écartée et comptée ? | Deux options : arrêter / écarter |
| L025 | défi, direct | Question. Tu oublies le starter de validation. Que se passe-t-il ? | Question « PRÉDIRE » |
| L026 | posé | Rien ne se plaint : aucune règle n'est appliquée. Toutes les lignes passent, même les invalides. | Lignes invalides qui passent |

### Scène 3 : Transformer et composer (4.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L027 | besoin | Mon besoin : valider d'abord, transformer ensuite, chacun avec une seule responsabilité. | Deux processors en série |
| L028 | technique | Le processor de transformation du module trois : sans état. Un DateTimeFormatter static final, immuable. | `static final DateTimeFormatter FORMAT` |
| L029 | technique | La règle métier : un montant nul est filtré. Sinon, on convertit la date et on construit l'objet. | `if (signum() == 0) return null;` |
| L030 | appuyé | Ce processor n'a aucun champ modifiable. Rien ne change entre deux appels, ni entre deux lancements. Il est sûr comme singleton. | Aucun champ qui change, en vert |
| L031 | technique | Pour les enchaîner : CompositeItemProcessor. On lui donne la validation, puis la transformation. | `new CompositeItemProcessor<>(validationProcessor, transformProcessor)` |
| L032 | appuyé | L'ordre compte. La sortie du premier est l'entrée du suivant. RawTransaction, validation, RawTransaction, transformation, BankTransaction. | Chaîne Raw → Raw → Bank |
| L033 | explicatif | Si un maillon retourne null, la chaîne s'arrête. Les suivants ne sont pas appelés, et l'élément est filtré. | Chaîne coupée au premier null |
| L034 | appuyé | Donc la validation en premier évite de transformer des données invalides. | Validation d'abord |
| L035 | appuyé | Attention : les types génériques sont effacés à l'exécution. Une erreur d'ordre ne se voit qu'à l'exécution, avec une ClassCastException. | Types effacés, exception en rouge |
| L036 | défi, direct | Question. Tu inverses l'ordre : transformation d'abord, validation ensuite. Que se passe-t-il ? | Question « PRÉDIRE » |
| L037 | posé | Une ClassCastException à l'exécution : la validation reçoit un BankTransaction au lieu d'un RawTransaction. Le compilateur n'a rien vu. | ClassCastException |
| L038 | pont | Maintenant, le piège. Un processor qui veut garder des totaux. | Titre « 4.4 Le piège de l'état » |

### Scène 4 : Le processor qui a un état (4.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L039 | besoin | Mon besoin : pour un rapport, le total des débits et le total des crédits du fichier. | Rapport : débits, crédits |
| L040 | explicatif | Première idée, naturelle : un processor qui accumule dans deux champs. Elle est fausse, mais elle marche. | Idée « accumuler dans des champs » |
| L041 | technique | Un Component, donc un singleton. Une seule instance dans toute l'application. | Code : `@Component public class AnalyticsProcessor` |
| L042 | technique | Deux champs modifiables : totalDebit et totalCredit. C'est de l'état. | Code : `private BigDecimal totalDebit = ZERO;` |
| L043 | technique | Dans process, on distingue débit et crédit, et on accumule dans le champ. | Code : `totalDebit = totalDebit.add(t.amount());` |
| L044 | technique | Le processor ne modifie pas l'élément : il l'observe et le laisse passer. | `return t;` |
| L045 | explicatif | Une API REST lit ces totaux pour les afficher. | `analyticsService.totals()` |
| L046 | appuyé | Ce code compile, s'exécute sans erreur, et passe un test qui ne lance le job qu'une fois. | Test vert, une seule fois |
| L047 | défi, direct | Question. Quel total affiche le premier lancement : cent trente-cinq virgule cinquante, ou le double ? | Question « PRÉDIRE » |
| L048 | posé | Cent trente-cinq virgule cinquante : exact. Le bug est silencieux au premier lancement. | Compteur 135,50 en vert |
| L049 | pont | Voyons le deuxième lancement, dans la même application. | Titre « 4.5 Le double comptage » |

### Scène 5 : La démonstration du double comptage (4.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L050 | besoin | Reprenons le fichier de cinq lignes du module trois. Une est filtrée. Les débits : cent vingt virgule cinquante, plus quinze. Les crédits : deux mille, plus trois cent cinquante virgule soixante-quinze. | Fichier : débits, crédits |
| L051 | technique | Premier lancement, runDate premier octobre : quatre éléments traités. Débit cent trente-cinq virgule cinquante. Crédit deux mille trois cent cinquante virgule soixante-quinze. | Ligne 1 : 135,50 / 2 350,75 |
| L052 | appuyé | Deuxième lancement, runDate deux octobre, dans la même application : quatre éléments traités. Mais le débit affiché est deux cent soixante et onze. | Ligne 2 : 271,00 en rouge |
| L053 | appuyé | Et le crédit, quatre mille sept cent un virgule cinquante. Les deux sont faux. | Ligne 2 : 4 701,50 en rouge |
| L054 | appuyé | Troisième lancement : quatre cent six virgule cinquante, et sept mille cinquante-deux virgule vingt-cinq. Toujours faux. | Ligne 3 : 406,50 / 7 052,25 |
| L055 | explicatif | Aucune exception. COMPLETED à chaque fois. Le job réussit, et les chiffres sont faux. | COMPLETED vert, chiffres rouges |
| L056 | explicatif | Le bug n'apparaît que dans deux cas. Quand l'application reste vivante entre deux lancements. | Application vivante : API, planificateur, conteneur |
| L057 | explicatif | Et au deuxième lancement, jamais au premier. Un test qui lance le job une fois ne le voit pas. | Test 1 : vert |
| L058 | appuyé | Après un redémarrage, le compteur repart à zéro, et tout semble normal. C'est ce qui rend le bug si difficile à diagnostiquer. | Redémarrage : compteur à zéro |
| L059 | défi, direct | Question. Pourquoi le test ne le voit-il pas ? | Question « PRÉDIRE » |
| L060 | posé | Parce que le singleton naît à zéro, et que le premier lancement part toujours de zéro. Le défaut n'apparaît qu'au deuxième. | Compteur à zéro au démarrage |
| L061 | explicatif | Voici le test qui révèle le bug. On lance le job avec deux dates, dans la même application, et on compare les totaux. | Test : deux lancements, comparaison |
| L062 | technique | Le deuxième total doit rester égal au premier. | `assertThat(second.totalDebit()).isEqualByComparingTo(first.totalDebit())` |
| L063 | appuyé | Avec le singleton, ce test échoue. Il passe dès qu'un des correctifs est appliqué. | Test rouge, puis vert |
| L064 | pont | Alors, comment ça marche, un bean en StepScope ? | Titre « 4.6 StepScope et proxy » |

### Scène 6 : Cycle de vie, StepScope et proxy (4.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L065 | rappel | Rappel du module deux : huit étapes de vie d'un bean. Pour un singleton, les étapes un à sept se passent au démarrage, une seule fois. | Frise 1 à 8, singleton |
| L066 | explicatif | Les champs totalDebit et totalCredit naissent à zéro à ce moment-là, puis accumulent pendant toute la vie de la JVM. | Compteur qui monte |
| L067 | explicatif | Avec StepScope, une seule ligne en plus, Spring change de stratégie. Au démarrage, il n'instancie pas le processor. | `@StepScope` ajouté |
| L068 | technique | À l'étape six, un post-processeur le remplace par un proxy : une sous-classe générée, avec CGLIB, qui n'a aucune donnée. | Proxy gris, étape 6 |
| L069 | technique | C'est ce proxy qui est injecté dans le composite et dans le step. | Proxy dans les points d'injection |
| L070 | technique | Quand un step démarre, le premier appel au proxy lui fait demander une instance au contexte step. | Flèche proxy → contexte step |
| L071 | technique | Ce contexte en crée une neuve, résout les expressions, et la mémorise pour cette exécution du step. | Instance neuve |
| L072 | technique | Chaque appel suivant est délégué à cette instance. | Appels délégués |
| L073 | appuyé | À la fin du step, l'instance est détruite. L'exécution suivante en aura une autre, remise à zéro. | Instance détruite |
| L074 | règle | Dans la mémoire de la JVM : un petit proxy permanent, et des vraies instances qui apparaissent et disparaissent. Rien n'est partagé entre deux exécutions. | Schéma JVM : proxy + instances |
| L075 | défi, direct | Question. Tu ajoutes StepScope à un processor. À quel moment le champ repart-il à zéro ? | Question « PRÉDIRE » |
| L076 | posé | À chaque exécution du step : une nouvelle instance, donc des champs neufs. | Instance neuve = champs à zéro |

### Scène 7 : Les trois solutions (4.6)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L077 | besoin | Mon besoin : un total correct, quel que soit le nombre de lancements. Voici trois solutions, de la meilleure à la pire. | Trois cartes |
| L078 | appuyé | Première solution, la meilleure : pas d'état dans le composant. L'état va dans l'ExecutionContext. | Carte 1 : ExecutionContext |
| L079 | explicatif | Le contexte du step est persisté à chaque commit, dans la table que tu connais depuis le module trois. | Table batch_step_execution_context |
| L080 | technique | Le processor est en StepScope, parce que le contexte n'existe que pendant l'exécution du step. | Code : `@Component @StepScope` |
| L081 | technique | Il garde seulement une référence vers le contexte, pas un total en mémoire. | Code : `private final ExecutionContext context;` |
| L082 | technique | Spring injecte le contexte de l'exécution en cours, avec une expression sur stepExecution. | `@Value("#{stepExecution.executionContext}")` |
| L083 | technique | Deux clés, une par sens. Et on travaille en centimes entiers : le contexte se sérialise proprement, sans erreur d'arrondi. | `"totalDebitCents"`, `movePointRight(2).longValueExact()` |
| L084 | appuyé | Et getLong avec une valeur par défaut. Au restart, c'est la valeur du dernier commit : le total reprend où il s'était arrêté. | `context.putLong(key, context.getLong(key, 0L) + cents)` |
| L085 | explicatif | Deuxième solution : StepScope avec un champ. Plus simple. Les totaux repartent de zéro à chaque exécution du step. | Carte 2 : `@StepScope` |
| L086 | appuyé | Limite : seulement en mémoire. Perdus au restart. | Restart : total perdu |
| L087 | explicatif | Troisième solution, à éviter : remettre à zéro à la main, avec un listener avant le step. | Carte 3 : reset manuel |
| L088 | appuyé | Elle fonctionne tant que personne ne l'oublie, et qu'un seul step utilise le composant à la fois. | Reset oublié |
| L089 | appuyé | Deux steps parallèles, ou deux jobs simultanés, se remettent à zéro mutuellement. Le bug revient, en pire. | Deux steps qui se remettent à zéro |
| L090 | explicatif | Voici la comparaison. Neuf à chaque exécution : oui, oui, et seulement si on y pense. | Tableau de comparaison, ligne 1 |
| L091 | explicatif | Survit à un restart : seulement l'ExecutionContext. Deux exécutions simultanées : sûr, sûr, dangereux. | Lignes 2 et 3 |
| L092 | défi, direct | Question. Quelle solution survit à un restart de l'application en plein step ? | Question « PRÉDIRE » |
| L093 | posé | L'ExecutionContext, parce qu'il est persisté à chaque commit. Au restart, le total reprend où il s'était arrêté. | Solution 1 en vert |
| L094 | pont | Même avec ces solutions, un total calculé dans un processor peut rester faux. Voici pourquoi. | Titre « total faux, même en StepScope » |

### Scène 8 : Le rejeu du chunk et les limites des proxys (4.6, 4.7)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L095 | explicatif | Un processor est rappelé quand un chunk est rejoué : après un retry, ou après un échec du writer suivi d'une reprise. | Chunk rejoué |
| L096 | appuyé | L'élément est alors traité deux fois. Un total accumulé dans le processor le compte deux fois, singleton ou StepScope. | Élément 37 traité deux fois |
| L097 | règle | Un processor ne devrait pas produire de chiffre qui engage l'entreprise. | Phrase encadrée |
| L098 | explicatif | Les agrégats de référence se calculent sur ce qui a été réellement écrit : une requête SUM groupée par type, après le step. | `SELECT SUM(amount) … GROUP BY transaction_type` |
| L099 | explicatif | Ou dans une transaction commune avec l'écriture. Le total du processor est faux, le SUM SQL est juste. | Total processor rouge, SUM vert |
| L100 | explicatif | Un mot sur SimpleDateFormat. Il garde un état interne, modifié à chaque parse. Deux threads se marchent dessus. | SimpleDateFormat, deux threads |
| L101 | appuyé | Les dates sont fausses, parfois sans exception. DateTimeFormatter est immuable : il peut être partagé à volonté. | DateTimeFormatter immuable, vert |
| L102 | explicatif | Dernier sujet : les limites d'un proxy CGLIB. C'est une sous-classe. Il ne peut pas étendre une classe final. | Sous-classe |
| L103 | appuyé | Ce qui inclut les records. Un processor en StepScope doit être une classe ordinaire. | Record barré |
| L104 | appuyé | Il ne peut pas intercepter une méthode final, ni un appel interne, this point autreMethode. L'appel ne passe pas par le proxy. | Appel interne qui contourne le proxy |
| L105 | défi, direct | Question. Peut-on mettre StepScope sur un record ? | Question « PRÉDIRE » |
| L106 | posé | Non : un record est final, et CGLIB ne peut pas le sous-classer. La création du proxy échoue. | Échec de création du proxy |
| L107 | pont | Trois situations réelles pour fixer ces idées. | Titre « cas d'usage » |

### Scène 9 : Cas d'usage

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L108 | explicatif | Premier cas : le rapport de fin de nuit. Le premier jour est exact. Le lendemain, dans une application de longue durée, le total cumule deux nuits. | Rapport jour 1 exact, jour 2 faux |
| L109 | appuyé | Le contrôleur financier découvre l'écart trois semaines plus tard. Avec l'ExecutionContext, ou un SUM, le problème n'existe pas. | Écart découvert, correctif |
| L110 | explicatif | Deuxième cas : le tri des lignes. Un fichier de deux millions de lignes, huit pour cent invalides. | Fichier 2 M, 8 % en rouge |
| L111 | explicatif | La validation en tête du composite les écarte, et filter count donne le chiffre exact pour l'audit. | Validation + filterCount |
| L112 | explicatif | Troisième cas : l'enrichissement. Ajouter le libellé de l'agence à chaque transaction, à partir d'un référentiel. | Référentiel d'agences |
| L113 | appuyé | Le processor est sans état. Le référentiel est chargé une fois, en lecture seule, et partagé sans risque. | Référentiel en lecture seule |
| L114 | pont | Voyons les dix pièges. | Titre « Top 10 » |

### Scène 10 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L115 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer. | Tableau, lignes 1 à 5 |
| L116 | appuyé | Un : un singleton avec état. Double comptage entre lancements successifs, sans erreur. | Ligne 1 |
| L117 | pédagogue | Comment le repérer : un total qui augmente d'un lancement à l'autre, après un redémarrage il redevient normal. | Extrait indicatif : `Total débit : 135,50` puis `271,00` |
| L118 | pédagogue | Pourquoi on y tombe : parce que le premier lancement est toujours correct. | Lancement 1 vert |
| L119 | appuyé | Deux : StepScope sur une classe final ou un record. Échec à la création du proxy. | Ligne 2 |
| L120 | pédagogue | Comment le repérer : une exception au démarrage de l'application, sur la création du proxy. | Extrait indicatif : `Cannot subclass final class …` |
| L121 | appuyé | Trois : lever une exception pour une ligne à ignorer. Rollback du chunk, step en échec. | Ligne 3 |
| L122 | pédagogue | Comment le repérer : un step en échec pour une simple ligne invalide, rollback dans les journaux. | Extrait indicatif : `ValidationException … chunk rolled back` |
| L123 | appuyé | Quatre : un ordre incohérent dans le composite. ClassCastException à l'exécution. | Ligne 4 |
| L124 | pédagogue | Comment le repérer : une ClassCastException, avec les deux types de la chaîne. | Extrait indicatif : `ClassCastException: BankTransaction cannot be cast to RawTransaction` |
| L125 | appuyé | Cinq : un SimpleDateFormat partagé. Dates fausses, en multithread. | Ligne 5 |
| L126 | pédagogue | Comment le repérer : des dates aléatoirement fausses, ou des erreurs de format sans cause apparente. | Extrait indicatif : `NumberFormatException: multiple points` |

### Scène 11 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L127 | pont | Les cinq suivants touchent les rejeux, les effets de bord et les tests. | Tableau, lignes 6 à 10 |
| L128 | appuyé | Six : accumuler un total dans le processor. Un chunk rejoué compte deux fois. | Ligne 6 |
| L129 | pédagogue | Comment le repérer : un total du processor différent du SUM SQL, après un retry. | Extrait indicatif : processor `1 250,00`, SQL `1 200,00` |
| L130 | appuyé | Sept : un effet de bord dans le processor. E-mail, appel d'API, écriture externe. L'effet est répété à chaque rejeu. | Ligne 7 |
| L131 | pédagogue | Comment le repérer : le même e-mail envoyé deux fois à un client. | Extrait indicatif : deux lignes `mail envoyé : client 42` |
| L132 | appuyé | Huit : une requête en base pour chaque élément. Un million de lignes, un million de requêtes. | Ligne 8 |
| L133 | pédagogue | Comment le repérer : un débit qui s'effondre, et des requêtes identiques en masse dans la base. | Extrait indicatif : `1 000 000 × SELECT … WHERE id = ?` |
| L134 | appuyé | Neuf : un test vert avec des données fausses. Le processor ne transforme pas, et le test compte seulement les lignes. | Ligne 9 |
| L135 | pédagogue | Comment le repérer : une date égale à maintenant dans la base, avec un test vert. | Extrait indicatif : `transaction_date = now()   ✗` |
| L136 | explicatif | Un processor qui oublie de convertir la date, et utilise LocalDateTime point now. Le test hasSize quatre passe. | Code : `LocalDateTime.now()` à la place de la vraie date |
| L137 | règle | Teste le processor seul, avec des valeurs. Et teste le job deux fois. | Phrase encadrée |
| L138 | appuyé | Dix : une validation sans le starter, ou sans choix entre filtrer et rejeter. Aucune règle appliquée, ou échec à la première ligne invalide. | Ligne 10 |
| L139 | pédagogue | Comment le repérer : des lignes invalides en base, ou un step qui échoue à la première ligne invalide. | Extrait indicatif : `amount = -50.00` en base |
| L140 | pédagogue | Pourquoi on y tombe : parce que chaque piège ressemble à un détail, jusqu'au premier incident en production. | Détail, puis incident |

### Scène 12 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L141 | pédagogue | Reprenons notre rapport faux depuis trois semaines. Tu sais maintenant d'où il vient, et comment l'éviter. | Rapport faux, flèche vers singleton |
| L142 | récapitulatif | Un processor transforme, filtre par null, ou rejette par exception. Valide en premier, avec un composite. | Deux pastilles |
| L143 | récapitulatif | Un singleton avec état fait un double comptage. L'ExecutionContext, StepScope et le SUM SQL en sont les remèdes. | Deux pastilles |
| L144 | récapitulatif | Un proxy CGLIB ne sous-classe ni un record, ni une classe final. | Pastille |
| L145 | défi | Exercices. Un : explique pourquoi le total d'un processor en StepScope peut quand même être faux. | Exercice 1 |
| L146 | défi | Deux : pourquoi StepScope échoue-t-il sur un record ? | Exercice 2 |
| L147 | défi | Trois : donne l'ordre correct d'un composite validation et transformation, et pourquoi. | Exercice 3 |
| L148 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L149 | explicatif | Correction un. Un chunk rejoué traite l'élément deux fois : le total l'accumule deux fois. Il faut un SUM sur ce qui est écrit. | Exercice 1 : rejeu |
| L150 | explicatif | Correction deux. Un record est final : CGLIB ne peut pas le sous-classer. Correction trois : validation d'abord, pour ne pas transformer des données invalides. | Exercices 2 et 3 |
| L151 | transition | Au module suivant, tu orchestres plusieurs steps : séquence, conditions, décisions, et exécutions parallèles. | Aperçu « flux et orchestration » |
