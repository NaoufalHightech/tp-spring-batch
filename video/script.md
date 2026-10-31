# SB1 · Spring Batch : du premier job au batch fiable

Formation Spring Batch. Partie unique, trois profondeurs, tutoiement. Source : `docs/spring_batch.pdf` (plan I à V) et le projet `tp/tpSpringBatchSolution` (Spring Boot 3.2.4, Spring Batch 5.1.x, Java 17 ; exécuté ici avec Java 21). Plan du cours respecté : I vue d'ensemble et démarrage, II tasklet et chunk, III paramètres, JDBC, flows, partitions, IV tests et reprise sur erreurs, V TP.

**Règle prioritaire appliquée** : tout le code affiché est lu dans le projet réel par `video/gen.py` au moment de la génération (jamais recopié à la main). Les sorties console viennent de `docs/verifications/mvn_test_full.log`.

**Objectif principal** : à la fin, tu sais **concevoir** un job et ses steps, **lire et écrire** des fichiers et une base par blocs, **rendre** un batch fiable (paramètres, erreurs, reprise, tests).
**Prérequis** : Java, Maven, Spring Boot de base.

**Distinction tenue dans toute la vidéo** :
- **CONFIRMÉ** : exécuté (`mvn test` : 16 classes de test, 15 passent, 1 échec expliqué en scène 12) ou lu dans le code du dépôt.
- **CONVENTION** : choix d'équipe raisonnable, pas une règle du framework.
- **SOURCE** : documentation officielle Spring Batch (textes fournis, y compris « What's new in Spring Batch 6 » et « The Domain Language of Batch »), non exécutée ici ; à vérifier avec le guide de migration avant usage.

**Son d'alerte** : chaque bonne pratique (et chaque piège) déclenche le signal sonore, puis une carte dit : la pratique, **pourquoi**, et **ce qu'elle nous évite**.

## Script

### Scène 0 : Sujet

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L01 | net | Spring Batch, du premier job au batch fiable. Un cours, et un TP fil rouge : un catalogue de produits que l'on lit, transforme et écrit de plusieurs façons. | Titre · chips CSV, JSON, XML, base · CONFIRMÉ |
| L02 | net | À la fin, tu sauras : un, concevoir un job avec ses steps. Deux, lire et écrire des fichiers et une base par blocs. Trois, rendre un batch fiable : paramètres, erreurs, reprise et tests. | Trois objectifs |
| L03 | alerte | Chaque bonne pratique sera annoncée par ce signal. Et à chaque fois, je te dis pourquoi, et ce qu'elle nous évite. | Démo du signal sonore · carte exemple |

### Scène 1 : Le problème

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L04 | net | Point de départ. Chaque nuit, on recopie cent mille produits d'un fichier vers une base. Sans écran, sans utilisateur. | Fichier vers base · RECONSTITUTION |
| L05 | net | Trois risques. Tout charger en mémoire. Tout perdre si la ligne cinquante mille est mauvaise. Ne pas savoir où ça s'est arrêté. | Trois risques en rouge |
| L06 | net | Spring Batch répond à chacun : le traitement par blocs, la transaction par bloc, et un journal de suivi en base. | Trois réponses en vert |

### Scène 2 : Vue d'ensemble pragmatique

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L07 | net | Un job contient des steps. Un step est soit une tasklet, soit un chunk. | Schéma : job, steps |
| L08 | net | Voici le schéma de référence. Un job operator pilote un job. Le job contient un ou plusieurs steps. Chaque step a exactement un reader et un writer. Et tout est enregistré dans le job repository. | Schéma de référence · SOURCE : documentation officielle |
| L09 | net | Une tasklet fait une seule action. Un chunk lit un élément à la fois, le transforme, puis écrit par blocs. | Reader, processor, writer |
| L10 | net | Chaque bloc est une transaction. Si l'écriture échoue, le bloc entier est annulé. | Bloc de cinq · rollback |
| L11 | net | Le job repository enregistre tout : instance, exécution, et compteurs de chaque step. | JobRepository · tables BATCH |
| L12 | net | Quand l'utiliser ? Gros volumes, reprise, suivi. Pour dix lignes, un script suffit : le coût d'entrée est réel. C'est une convention, pas une règle de Spring. | Tableau quand oui, quand non · CONVENTION |

### Scène 3 : Vue d'ensemble, l'architecture en couches

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L13 | net | Avant les détails, la vue d'ensemble. Spring Batch est organisé en trois couches : l'application, le cœur, et l'infrastructure. | Schéma des trois couches · SOURCE : documentation Spring Batch |
| L14 | net | L'application, c'est notre code : les jobs, les steps, les readers et les processors que nous écrivons. | Couche application surlignée |
| L15 | net | Le cœur, le batch core, contient les classes qui lancent et contrôlent un job : le job, le step, et le lanceur. Dans la version six, c'est le job operator ; dans notre dépôt, en version cinq, c'est le job launcher. | Couche cœur surlignée · SOURCE : documentation officielle v6 |
| L16 | net | L'infrastructure fournit les lecteurs et écrivains communs, et des services comme le retry template. L'application et le cœur s'appuient tous deux sur elle. | Couche infrastructure surlignée |
| L17 | net | Dans toute la suite, un repère en haut de l'écran te dit à quelle étape du TP nous sommes, et dans quelle couche vit le composant montré. | Repère : étape du TP et couche |

### Scène 4 : Principes généraux d'un bon batch

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L18 | net | Avant de coder, quelques principes valables pour tout batch. À chaque principe, le signal, le pourquoi, et ce qu'il nous évite. | Titre · SOURCE : documentation Spring Batch |
| L19 | alerte | Bonne pratique : minimiser les entrées-sorties. Pourquoi : c'est le premier coût d'un batch. Ce que ça nous évite : relire la même donnée à chaque transaction, ou parcourir toute une table faute de clé dans la clause where. | Carte bonne pratique 1 · SOURCE |
| L20 | alerte | Bonne pratique : ne pas faire les choses deux fois. Pourquoi : un total recalculé en fin de traitement relit toutes les données. Ce que ça nous évite : un second passage complet, car on incrémente les totaux pendant le traitement. | Carte bonne pratique 2 · SOURCE |
| L21 | alerte | Bonne pratique : toujours supposer le pire sur les données. Valider chaque enregistrement, et poser un total de contrôle, par exemple une ligne de fin qui donne le nombre d'enregistrements. Ce que ça nous évite : un fichier tronqué accepté comme complet. | Carte bonne pratique 3 · SOURCE |
| L22 | alerte | Bonne pratique : tester la charge tôt, avec des volumes réalistes. Pourquoi : un batch grossit avec le temps. Ce que ça nous évite : découvrir la limite en production, pendant la fenêtre batch. | Carte bonne pratique 4 · SOURCE |
| L23 | alerte | Bonne pratique : sauvegarder les fichiers comme les bases, et tester la restauration. Ce que ça nous évite : un batch qui dépend de fichiers plats impossibles à retrouver. | Carte bonne pratique 5 · SOURCE |
| L24 | net | Et reste simple : un traitement complexe se découpe en steps simples, avec les données gardées près du traitement. | Règle de simplicité |

### Scène 5 : Stratégies de traitement et partitionnement

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L25 | net | Pour concevoir un job, on le décompose en briques standard : conversion, validation, extraction, extraction avec mise à jour, traitement et mise à jour, et mise en forme de la sortie. | Six briques · SOURCE : documentation Spring Batch |
| L26 | net | Trois utilitaires reviennent souvent : trier, répartir, fusionner. Et un batch est guidé par une base, par un fichier, ou par des messages. | Trier, répartir, fusionner · trois sources |
| L27 | net | Puis on choisit une stratégie, de la plus simple à la plus complexe : traitement normal dans une fenêtre batch, batch concurrent avec le en ligne, jobs en parallèle, partitionnement, ou une combinaison. | Cinq stratégies |
| L28 | alerte | Bonne pratique : même dans le cas le plus simple, prévoir des points de validation et la reprise. Pourquoi : un batch grossit en volume et en complexité. Ce que ça nous évite : un unique commit final, impossible à faire évoluer et à relancer. | Carte bonne pratique 6 · SOURCE |
| L29 | net | Le verrouillage compte. En optimiste, on lit un horodatage, et on le vérifie à la mise à jour. En pessimiste, on pose un verrou dès la lecture. | Tableau optimiste, pessimiste |
| L30 | alerte | Règle de pouce de la documentation : l'optimiste convient plutôt aux applications en ligne, le pessimiste plutôt aux batchs. Et un même schéma de verrouillage pour toutes les applications qui touchent la donnée. Ce que ça nous évite : des mises à jour perdues et des verrous incohérents. | Carte bonne pratique 7 · SOURCE |
| L31 | net | Le partitionnement : le même job tourne en plusieurs instances, chacune sur sa part des données. On découpe, on traite en parallèle, puis on fusionne. | Schéma : découper, traiter, fusionner |
| L32 | net | Six façons de découper : en parts égales, par colonne clé, par vues, avec un indicateur de traitement, par extraction vers des fichiers, ou par colonne de hachage. | Six approches |
| L33 | alerte | Bonne pratique : valider les partitions avant de lancer. Elles couvrent toute la plage, sans trou, et chacune ne traite que sa part. Ce que ça nous évite : des données jamais traitées, ou traitées deux fois. Décide aussi à l'avance : si une partition échoue, que fait-on des autres ? | Carte bonne pratique 8 · SOURCE |
| L34 | net | Retiens cette carte. Nous reviendrons aux partitions à l'étape dix du TP. | Repère étape dix |
| L35 | net | Place maintenant au TP fil rouge, étape par étape. | Feuille de route des onze étapes |

### Scène 6 : Étape un, le projet et le job repository

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L36 | net | Étape un : le projet. Spring Boot trois, Java dix-sept, le starter batch. Voici les propriétés de l'application. | IDE : application.properties |
| L37 | net | Initialize schema always : Spring Batch crée ses tables au premier démarrage. | Ligne 1 surlignée · CONFIRMÉ |
| L38 | alerte | Bonne pratique : job enabled à false. Pourquoi : sinon Spring Boot lance tous les jobs au démarrage. Ce que ça nous évite : un lancement involontaire, et une erreur quand il y a plusieurs jobs. | Carte bonne pratique 1 |
| L39 | net | Les produits vivent dans une seconde base, productdb, déclarée à part. | Lignes productdb |
| L40 | net | La base de Spring Batch, elle, est primaire, avec l'annotation batch data source. | IDE : AutomaticSpringBootBatchJobRepositoryConfig |
| L41 | alerte | Bonne pratique : une seule datasource primaire pour le job repository, les autres qualifiées. Pourquoi : Spring Boot doit savoir où écrire ses métadonnées. Ce que ça nous évite : des métadonnées dans la mauvaise base, ou un échec au démarrage. | Carte bonne pratique 2 |
| L42 | alerte | Autre piège : n'ajoute pas enable batch processing avec Spring Boot trois. Pourquoi : il désactive l'auto-configuration. Ce que ça nous évite : un job repository et un lanceur qui ne sont plus créés comme prévu. | Carte piège · CONFIRMÉ par le commentaire du dépôt |
| L43 | alerte | Dernier point, constaté dans ce dépôt : le mot de passe de la base est écrit en clair. Bonne pratique : le passer par une variable d'environnement. Ce que ça nous évite : une fuite de secret dans git. | Carte bonne pratique 3 · ligne password |

### Scène 7 : Premier job, la tasklet

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L44 | net | Notre premier job affiche un message. On commence par la tasklet. | IDE : PrintMessageTasklet |
| L45 | net | Elle implémente l'interface Tasklet. | Ligne class |
| L46 | net | La méthode execute reçoit le contexte du chunk et fait le travail. | Ligne execute |
| L47 | net | Ici, on affiche le message. | Ligne println |
| L48 | net | Et on retourne FINISHED : sinon Spring Batch rappellerait la tasklet en boucle. | Ligne return · CONFIRMÉ |
| L49 | net | Ensuite, la configuration du job. Un step construit avec le job repository et le gestionnaire de transaction. | IDE : HelloWorldJobConfig |
| L50 | net | Le step reçoit la tasklet, puis on appelle build. | Lignes step |
| L51 | net | Le job démarre par ce step. Son nom est celui qu'on utilisera pour le lancer. | Lignes job |
| L52 | net | Résultat de l'exécution réelle. | Console : hello world by SpringBatch |
| L53 | alerte | Bonne pratique : le nom du job égal au nom du bean et au nom affiché. Pourquoi : c'est ce nom que voient les tables et les outils de supervision. Ce que ça nous évite : chercher un job sous un autre nom. Le dépôt contient justement un écart, on le verra en scène onze. | Carte bonne pratique 4 |

### Scène 8 : Prédire

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L54 | question | Question. On lance deux fois de suite le même job, avec exactement les mêmes paramètres, et le premier lancement a réussi. A : le job tourne deux fois. B : Spring Batch refuse le second lancement. C : le second lancement écrase le premier. Mets en pause : écris ta réponse, et pourquoi. | Propositions A, B, C · compte à rebours |
| L55 | net | On ne tranche pas à l'intuition. On regarde ce qu'est une job instance. | Schéma JobInstance |
| L56 | net | Une job instance, c'est un job plus ses paramètres identifiants. Une exécution réussie ferme l'instance. | Schéma : job, instance, exécution |
| L57 | net | Une exécution est une tentative. Si celle du premier janvier échoue, on relance avec la même date : même instance, nouvelle exécution. Seule une exécution réussie ferme l'instance. | Table BATCH_JOB_EXECUTION : FAILED puis COMPLETED · SOURCE : documentation officielle |
| L58 | net | Réponse B. Le second lancement est refusé. Mauvaise réponse A : tu confonds job et exécution. Mauvaise réponse C : rien n'est écrasé, l'historique est conservé. | Révélation par élimination · CONFIRMÉ par le cours |
| L59 | net | Même logique pour les steps. Chaque step a une step execution, rattachée à une job execution, avec ses compteurs de lecture, d'écriture et de validation, et un contexte d'exécution : c'est lui qui permet de reprendre là où on s'était arrêté. | Schéma step execution · SOURCE : documentation officielle |
| L60 | alerte | Bonne pratique, avec une nuance. Le TP ajoute un horodatage pour relancer à volonté. En production, préfère un paramètre métier, comme la date du traitement. Pourquoi : un horodatage crée une nouvelle instance à chaque fois. Ce que ça nous évite : l'impossibilité de reprendre un job échoué. | Carte bonne pratique 5 · CONVENTION |

### Scène 9 : Le chunk, du CSV à la console

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L61 | net | Passons au chunk : lire un fichier CSV de produits et les afficher. | IDE : ProductsCsvToConsoleJobConfig |
| L62 | net | Le step déclare ses types : un produit en entrée, un produit en sortie. | Ligne chunk |
| L63 | net | Chunk de cinq : cinq éléments lus, puis écrits en une transaction. | Ligne chunk cinq |
| L64 | net | Le reader, le processor, le writer. | Lignes reader, processor, writer |
| L65 | alerte | Bonne pratique : choisir la taille du chunk en connaissance de cause. Ici, cinq, pour que l'exemple soit lisible. Pourquoi : trop petit, trop de validations ; trop grand, trop de mémoire et un gros rollback. Ce que ça nous évite : un batch lent ou qui sature. En production, on mesure, souvent entre cent et mille. | Carte bonne pratique 6 · CONVENTION |
| L66 | net | Le reader CSV, maintenant. | IDE : MyCsvFileProductReaderConfig |
| L67 | net | Un FlatFileItemReader, construit avec son builder. | Lignes builder |
| L68 | net | On saute la ligne d'en-tête, on déclare le séparateur point-virgule. | Lignes linesToSkip, delimiter |
| L69 | net | Les noms des colonnes correspondent aux propriétés de la classe Product. | Ligne names |
| L70 | net | Et le fichier à lire vient d'un paramètre du job. | Ligne resource · @JobScope |
| L71 | alerte | Bonne pratique : step scope ou job scope pour tout bean qui lit un paramètre. Pourquoi : le bean est créé au démarrage du step, quand les paramètres existent. Ce que ça nous évite : un paramètre nul, ou un état partagé entre deux exécutions. | Carte bonne pratique 7 |
| L72 | net | Le processor met la catégorie en majuscules. | IDE : SimpleUppercaseProductProcessor |
| L73 | net | Il retourne un nouveau produit, sans modifier l'ancien. Retourner null filtrerait l'élément. | Lignes process |
| L74 | net | Sortie réelle du test. | Console : produits en majuscules |
| L75 | alerte | Bonne pratique : un processor sans effet de bord caché. Pourquoi : il peut être rejoué lors d'un rollback. Ce que ça nous évite : des compteurs ou des écritures en double. | Carte bonne pratique 8 |

### Scène 10 : Base de données

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L76 | net | Maintenant la base. Le reader JDBC exécute une requête et passe chaque ligne à un mapper. | IDE : MyDbProductWithDetailsReaderConfig |
| L77 | net | Le mapper transforme une ligne en objet. Regarde bien celui-ci. | IDE : ProductWithDetailsRowMapper |
| L78 | alerte | Piège constaté dans le code. La constante du libellé est déclarée, mais le mapper ne l'utilise jamais : le libellé n'est pas copié. Les tests passent quand même. Bonne pratique : vérifier le contenu, pas seulement le statut completed. Ce que ça nous évite : une donnée perdue, sans aucune erreur. | Carte piège · CONFIRMÉ par lecture et recherche dans le code |
| L79 | net | Côté écriture : un JdbcBatchItemWriter, avec une requête nommée. | IDE : MyDbProductWithDetailsWriterConfig |
| L80 | net | Les paramètres de la requête portent le nom des propriétés du produit. | Ligne UPDATE |
| L81 | alerte | Bonne pratique : une écriture en base idempotente, ici un update par identifiant. Pourquoi : un bloc peut être rejoué après un incident. Ce que ça nous évite : des doublons à la reprise. | Carte bonne pratique 9 |

### Scène 11 : Flow conditionnel

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L82 | net | Objectif : choisir la suite du job selon le nombre de prix modifiés. | Schéma flow |
| L83 | net | Le processor compte les produits ajustés dans le contexte d'exécution du step. | IDE : IncreasePriceOfProductWithDetailsProcessor |
| L84 | net | Un decider lit ce compteur et retourne un statut libre. | IDE : MyUpdatedCountCheckingDecider |
| L85 | net | Si le compteur atteint le seuil, le statut est completed with many updated. | Ligne FlowExecutionStatus |
| L86 | alerte | Piège lu dans le code. Si aucun produit n'est ajusté, le compteur est absent, et la comparaison déclenche une erreur de pointeur nul. Bonne pratique : tester l'absence avant de comparer. Ce que ça nous évite : un job qui plante sur le cas le plus banal, aucune modification. | Carte piège · lu dans le code, non exécuté |
| L87 | net | Dans le job, chaque statut mène à un step. | IDE : IncreaseProductPriceInDbJobConfig |
| L88 | net | Beaucoup de modifications : un message, puis le step de statistiques. Peu : un message seulement. | Lignes on, to, from |
| L89 | alerte | Bonne pratique : le nom du job égal au nom du bean. Le journal réel affiche insertIntoCsvFromDbJob pour le bean increaseProductPriceInDbJob. Ce que ça nous évite : une supervision où les noms ne correspondent à rien. | Carte bonne pratique 10 · CONFIRMÉ par le journal |

### Scène 12 : Erreurs, skip et reprise

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L90 | net | Un fichier avec des lignes illisibles. Faut-il tout arrêter ? | Fichier avec LINE_WITH_ERROR |
| L91 | net | Avec skip, on ignore certaines erreurs, jusqu'à une limite. | IDE : ProductsWithDetailsCsvToDbJobWithSkipsConfig |
| L92 | net | Fault tolerant active la tolérance. Skip limit cinq. On ne saute que les erreurs de lecture. | Ligne faultTolerant |
| L93 | net | Et un listener trace chaque ligne ignorée. | IDE : MySkippedErrorsListener |
| L94 | net | Sortie réelle : deux lignes ignorées, et le job termine. | Console : SKIPPED_READ_ERROR · CONFIRMÉ |
| L95 | alerte | Bonne pratique : borner le skip, cibler l'exception, et toujours tracer. Pourquoi : un skip trop large cache de vrais bugs. Ce que ça nous évite : des données perdues en silence. | Carte bonne pratique 11 |
| L96 | net | Autre stratégie : la reprise. Ce même fichier, lu sans skip, échoue à la ligne trois. | Console : FlatFileParseException |
| L97 | net | C'est d'ailleurs la seule classe de test en échec de notre exécution : le step n'a pas de skip. | Bilan : quinze sur seize · CONFIRMÉ |
| L98 | net | Pour reprendre, c'est le statut du step qui compte, pas son statut de sortie. | IDE : MyStoppedForRestartExecutionListener |
| L99 | alerte | Bonne pratique : limiter les redémarrages avec start limit. Pourquoi : un relancement automatique peut boucler. Ce que ça nous évite : un batch qui retente sans fin. Et le statut qui commande la reprise est le statut, pas le statut de sortie. | Carte bonne pratique 12 |

### Scène 13 : Partitions

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L100 | net | Pour aller plus vite : les partitions. Un step manager découpe le travail, des workers l'exécutent en parallèle. | Schéma partitions |
| L101 | net | Le partitioner crée une plage d'identifiants par partition. | IDE : NumericColumnRangePartitioner |
| L102 | net | Chaque partition reçoit son propre contexte, avec from et to. | Lignes ExecutionContext |
| L103 | net | Le step manager lance quatre workers, avec un task executor. | IDE : IncreaseProductPriceInDbWithPartitionJobConfig |
| L104 | alerte | Bonne pratique : un reader de pagination en step scope pour chaque partition. Pourquoi : un reader à curseur n'est pas sûr entre plusieurs threads. Ce que ça nous évite : des lignes lues deux fois, ou manquantes. | Carte bonne pratique 13 |

### Scène 14 : Tests

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L105 | net | Dernier volet : tester. Une classe abstraite lance le job et vérifie le statut. | IDE : AbstractBasicActiveTestJob |
| L106 | net | Chaque test concret fournit seulement ses paramètres. | IDE : TestIncreaseProductPriceInDbJob |
| L107 | alerte | Bonne pratique : une base de test préparée par le test lui-même. Pourquoi : à la première exécution, les tables de productdb n'existaient pas. Ce que ça nous évite : un test qui échoue sur une autre machine. Constaté pendant cette préparation. | Carte bonne pratique 14 · CONFIRMÉ |

### Scène 15 : Mises à jour, Spring Batch 6

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L108 | net | Mise à jour : Spring Batch six. Le dépôt est en version cinq ; voici ce qui change, et ce que ça implique pour notre TP. D'abord les dépendances : Spring Framework sept, Spring Integration sept, Spring Data quatre, Micrometer un point seize. | Dépendances · SOURCE : doc officielle Spring Batch 6, non exécutée ici |
| L109 | alerte | Mise à jour : l'infrastructure se simplifie. Le job repository étend le job explorer. Le job operator étend le job launcher. Le registre de jobs et le gestionnaire de transaction deviennent optionnels. Ce que ça nous évite : une dizaine de beans de configuration. Pour notre dépôt : le job launcher devient un job operator. | Carte mise à jour 1 · SOURCE : doc officielle Spring Batch 6, non exécutée ici |
| L110 | alerte | Mise à jour : de nouvelles annotations. Enable batch processing règle les attributs communs, et enable jdbc job repository ou enable mongo job repository règle le stockage. Par défaut, le dépôt est sans ressource : plus besoin de H2 pour les métadonnées. Attention : ma règle précédente, pas d'enable batch processing, vaut pour Spring Batch cinq avec Spring Boot trois. | Carte mise à jour 2 · exemple de la documentation |
| L111 | alerte | Mise à jour : le chunk change d'implémentation. Le chunk oriented step remplace le tasklet step. Le retry s'appuie sur Spring Framework sept, plus sur Spring Retry, et le skip passe par une skip policy. Notre fault tolerant avec skip limit sera à migrer. | Carte mise à jour 3 · exemple de la documentation |
| L112 | net | Concurrence : un nouveau modèle producteur consommateur avec une file bornée. S'y ajoutent le chunking local, les steps distants, et le style SEDA avec Spring Integration. Nos partitions restent un concept valable. | Nouveautés concurrence · SOURCE : doc officielle Spring Batch 6, non exécutée ici |
| L113 | alerte | Mise à jour : l'exploitation progresse. Un command line job operator. Une méthode recover pour relancer proprement une exécution morte, sans modifier la base à la main. Une interface stoppable step, l'arrêt en douceur, et des événements Java Flight Recorder. Ce que ça nous évite : des corrections SQL manuelles et risquées. | Carte mise à jour 4 · SOURCE : doc officielle Spring Batch 6, non exécutée ici |
| L114 | alerte | Mise à jour : des dépréciations à planifier. La configuration xml du namespace batch est dépréciée, avec suppression prévue en version sept : nos jobs du profil xml config sont concernés. Jackson deux est déprécié au profit de Jackson trois, et le support de JUnit quatre aussi. Ce que ça nous évite : une migration en urgence. | Carte mise à jour 5 · SOURCE : doc officielle Spring Batch 6, non exécutée ici |
| L115 | net | Retiens : les concepts du cours ne changent pas ; ce qui évolue, ce sont les classes de configuration et de lancement. Cette source est la documentation officielle, non exécutée ici : lis le guide de migration avant de migrer. | Synthèse · SOURCE : doc officielle Spring Batch 6, non exécutée ici |

### Scène 16 : Trois niveaux et conclusion

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L116 | net | Développeur : tasklet ou chunk, paramètres en scope, tests. | Panneau développeur |
| L117 | net | Tech Lead : tailles de chunk mesurées, skip borné et tracé, secrets dehors. | Panneau Tech Lead |
| L118 | net | Architecte : reprise, idempotence, partitions, supervision, et migration de version. | Panneau architecte |
| L119 | climax | Règle à retenir : un bon batch se lit par blocs, s'écrit sans doublon, et se reprend là où il s'est arrêté. | Règle finale |
