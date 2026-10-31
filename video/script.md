# SB1 · Spring Batch : du premier job au batch fiable

Formation Spring Batch. Partie unique, trois profondeurs, tutoiement. Source : `docs/spring_batch.pdf` (plan I à V) et le projet `tp/tpSpringBatchSolution` (Spring Boot 3.2.4, Spring Batch 5.1.x, Java 17 ; exécuté ici avec Java 21). Plan du cours respecté : I vue d'ensemble et démarrage, II tasklet et chunk, III paramètres, JDBC, flows, partitions, IV tests et reprise sur erreurs, V TP.

**Règle prioritaire appliquée** : tout le code affiché est lu dans le projet réel par `video/gen.py` au moment de la génération (jamais recopié à la main). Les sorties console viennent de `docs/verifications/mvn_test_full.log`.

**Objectif principal** : à la fin, tu sais **concevoir** un job et ses steps, **lire et écrire** des fichiers et une base par blocs, **rendre** un batch fiable (paramètres, erreurs, reprise, tests).
**Prérequis** : Java, Maven, Spring Boot de base.

**Distinction tenue dans toute la vidéo** :
- **CONFIRMÉ** : exécuté (`mvn test` : 16 classes de test, 15 passent, 1 échec expliqué en scène 9) ou lu dans le code du dépôt.
- **CONVENTION** : choix d'équipe raisonnable, pas une règle du framework.
- **RECONSTITUTION** : issu de ma connaissance des versions récentes, non exécuté ici, à vérifier avant usage.

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
| L08 | net | Une tasklet fait une seule action. Un chunk lit un élément à la fois, le transforme, puis écrit par blocs. | Reader, processor, writer |
| L09 | net | Chaque bloc est une transaction. Si l'écriture échoue, le bloc entier est annulé. | Bloc de cinq · rollback |
| L10 | net | Le job repository enregistre tout : instance, exécution, et compteurs de chaque step. | JobRepository · tables BATCH |
| L11 | net | Quand l'utiliser ? Gros volumes, reprise, suivi. Pour dix lignes, un script suffit : le coût d'entrée est réel. C'est une convention, pas une règle de Spring. | Tableau quand oui, quand non · CONVENTION |

### Scène 3 : Étape un, le projet et le job repository

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L12 | net | Étape un : le projet. Spring Boot trois, Java dix-sept, le starter batch. Voici les propriétés de l'application. | IDE : application.properties |
| L13 | net | Initialize schema always : Spring Batch crée ses tables au premier démarrage. | Ligne 1 surlignée · CONFIRMÉ |
| L14 | alerte | Bonne pratique : job enabled à false. Pourquoi : sinon Spring Boot lance tous les jobs au démarrage. Ce que ça nous évite : un lancement involontaire, et une erreur quand il y a plusieurs jobs. | Carte bonne pratique 1 |
| L15 | net | Les produits vivent dans une seconde base, productdb, déclarée à part. | Lignes productdb |
| L16 | net | La base de Spring Batch, elle, est primaire, avec l'annotation batch data source. | IDE : AutomaticSpringBootBatchJobRepositoryConfig |
| L17 | alerte | Bonne pratique : une seule datasource primaire pour le job repository, les autres qualifiées. Pourquoi : Spring Boot doit savoir où écrire ses métadonnées. Ce que ça nous évite : des métadonnées dans la mauvaise base, ou un échec au démarrage. | Carte bonne pratique 2 |
| L18 | alerte | Autre piège : n'ajoute pas enable batch processing avec Spring Boot trois. Pourquoi : il désactive l'auto-configuration. Ce que ça nous évite : un job repository et un lanceur qui ne sont plus créés comme prévu. | Carte piège · CONFIRMÉ par le commentaire du dépôt |
| L19 | alerte | Dernier point, constaté dans ce dépôt : le mot de passe de la base est écrit en clair. Bonne pratique : le passer par une variable d'environnement. Ce que ça nous évite : une fuite de secret dans git. | Carte bonne pratique 3 · ligne password |

### Scène 4 : Premier job, la tasklet

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L20 | net | Notre premier job affiche un message. On commence par la tasklet. | IDE : PrintMessageTasklet |
| L21 | net | Elle implémente l'interface Tasklet. | Ligne class |
| L22 | net | La méthode execute reçoit le contexte du chunk et fait le travail. | Ligne execute |
| L23 | net | Ici, on affiche le message. | Ligne println |
| L24 | net | Et on retourne FINISHED : sinon Spring Batch rappellerait la tasklet en boucle. | Ligne return · CONFIRMÉ |
| L25 | net | Ensuite, la configuration du job. Un step construit avec le job repository et le gestionnaire de transaction. | IDE : HelloWorldJobConfig |
| L26 | net | Le step reçoit la tasklet, puis on appelle build. | Lignes step |
| L27 | net | Le job démarre par ce step. Son nom est celui qu'on utilisera pour le lancer. | Lignes job |
| L28 | net | Résultat de l'exécution réelle. | Console : hello world by SpringBatch |
| L29 | alerte | Bonne pratique : le nom du job égal au nom du bean et au nom affiché. Pourquoi : c'est ce nom que voient les tables et les outils de supervision. Ce que ça nous évite : chercher un job sous un autre nom. Le dépôt contient justement un écart, on le verra en scène huit. | Carte bonne pratique 4 |

### Scène 5 : Prédire

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L30 | question | Question. On lance deux fois de suite le même job, avec exactement les mêmes paramètres, et le premier lancement a réussi. A : le job tourne deux fois. B : Spring Batch refuse le second lancement. C : le second lancement écrase le premier. Mets en pause : écris ta réponse, et pourquoi. | Propositions A, B, C · compte à rebours |
| L31 | net | On ne tranche pas à l'intuition. On regarde ce qu'est une job instance. | Schéma JobInstance |
| L32 | net | Une job instance, c'est un job plus ses paramètres identifiants. Une exécution réussie ferme l'instance. | Schéma : job, instance, exécution |
| L33 | net | Réponse B. Le second lancement est refusé. Mauvaise réponse A : tu confonds job et exécution. Mauvaise réponse C : rien n'est écrasé, l'historique est conservé. | Révélation par élimination · CONFIRMÉ par le cours |
| L34 | alerte | Bonne pratique, avec une nuance. Le TP ajoute un horodatage pour relancer à volonté. En production, préfère un paramètre métier, comme la date du traitement. Pourquoi : un horodatage crée une nouvelle instance à chaque fois. Ce que ça nous évite : l'impossibilité de reprendre un job échoué. | Carte bonne pratique 5 · CONVENTION |

### Scène 6 : Le chunk, du CSV à la console

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L35 | net | Passons au chunk : lire un fichier CSV de produits et les afficher. | IDE : ProductsCsvToConsoleJobConfig |
| L36 | net | Le step déclare ses types : un produit en entrée, un produit en sortie. | Ligne chunk |
| L37 | net | Chunk de cinq : cinq éléments lus, puis écrits en une transaction. | Ligne chunk cinq |
| L38 | net | Le reader, le processor, le writer. | Lignes reader, processor, writer |
| L39 | alerte | Bonne pratique : choisir la taille du chunk en connaissance de cause. Ici, cinq, pour que l'exemple soit lisible. Pourquoi : trop petit, trop de validations ; trop grand, trop de mémoire et un gros rollback. Ce que ça nous évite : un batch lent ou qui sature. En production, on mesure, souvent entre cent et mille. | Carte bonne pratique 6 · CONVENTION |
| L40 | net | Le reader CSV, maintenant. | IDE : MyCsvFileProductReaderConfig |
| L41 | net | Un FlatFileItemReader, construit avec son builder. | Lignes builder |
| L42 | net | On saute la ligne d'en-tête, on déclare le séparateur point-virgule. | Lignes linesToSkip, delimiter |
| L43 | net | Les noms des colonnes correspondent aux propriétés de la classe Product. | Ligne names |
| L44 | net | Et le fichier à lire vient d'un paramètre du job. | Ligne resource · @JobScope |
| L45 | alerte | Bonne pratique : step scope ou job scope pour tout bean qui lit un paramètre. Pourquoi : le bean est créé au démarrage du step, quand les paramètres existent. Ce que ça nous évite : un paramètre nul, ou un état partagé entre deux exécutions. | Carte bonne pratique 7 |
| L46 | net | Le processor met la catégorie en majuscules. | IDE : SimpleUppercaseProductProcessor |
| L47 | net | Il retourne un nouveau produit, sans modifier l'ancien. Retourner null filtrerait l'élément. | Lignes process |
| L48 | net | Sortie réelle du test. | Console : produits en majuscules |
| L49 | alerte | Bonne pratique : un processor sans effet de bord caché. Pourquoi : il peut être rejoué lors d'un rollback. Ce que ça nous évite : des compteurs ou des écritures en double. | Carte bonne pratique 8 |

### Scène 7 : Base de données

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L50 | net | Maintenant la base. Le reader JDBC exécute une requête et passe chaque ligne à un mapper. | IDE : MyDbProductWithDetailsReaderConfig |
| L51 | net | Le mapper transforme une ligne en objet. Regarde bien celui-ci. | IDE : ProductWithDetailsRowMapper |
| L52 | alerte | Piège constaté dans le code. La constante du libellé est déclarée, mais le mapper ne l'utilise jamais : le libellé n'est pas copié. Les tests passent quand même. Bonne pratique : vérifier le contenu, pas seulement le statut completed. Ce que ça nous évite : une donnée perdue, sans aucune erreur. | Carte piège · CONFIRMÉ par lecture et recherche dans le code |
| L53 | net | Côté écriture : un JdbcBatchItemWriter, avec une requête nommée. | IDE : MyDbProductWithDetailsWriterConfig |
| L54 | net | Les paramètres de la requête portent le nom des propriétés du produit. | Ligne UPDATE |
| L55 | alerte | Bonne pratique : une écriture en base idempotente, ici un update par identifiant. Pourquoi : un bloc peut être rejoué après un incident. Ce que ça nous évite : des doublons à la reprise. | Carte bonne pratique 9 |

### Scène 8 : Flow conditionnel

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L56 | net | Objectif : choisir la suite du job selon le nombre de prix modifiés. | Schéma flow |
| L57 | net | Le processor compte les produits ajustés dans le contexte d'exécution du step. | IDE : IncreasePriceOfProductWithDetailsProcessor |
| L58 | net | Un decider lit ce compteur et retourne un statut libre. | IDE : MyUpdatedCountCheckingDecider |
| L59 | net | Si le compteur atteint le seuil, le statut est completed with many updated. | Ligne FlowExecutionStatus |
| L60 | alerte | Piège lu dans le code. Si aucun produit n'est ajusté, le compteur est absent, et la comparaison déclenche une erreur de pointeur nul. Bonne pratique : tester l'absence avant de comparer. Ce que ça nous évite : un job qui plante sur le cas le plus banal, aucune modification. | Carte piège · lu dans le code, non exécuté |
| L61 | net | Dans le job, chaque statut mène à un step. | IDE : IncreaseProductPriceInDbJobConfig |
| L62 | net | Beaucoup de modifications : un message, puis le step de statistiques. Peu : un message seulement. | Lignes on, to, from |
| L63 | alerte | Bonne pratique : le nom du job égal au nom du bean. Le journal réel affiche insertIntoCsvFromDbJob pour le bean increaseProductPriceInDbJob. Ce que ça nous évite : une supervision où les noms ne correspondent à rien. | Carte bonne pratique 10 · CONFIRMÉ par le journal |

### Scène 9 : Erreurs, skip et reprise

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L64 | net | Un fichier avec des lignes illisibles. Faut-il tout arrêter ? | Fichier avec LINE_WITH_ERROR |
| L65 | net | Avec skip, on ignore certaines erreurs, jusqu'à une limite. | IDE : ProductsWithDetailsCsvToDbJobWithSkipsConfig |
| L66 | net | Fault tolerant active la tolérance. Skip limit cinq. On ne saute que les erreurs de lecture. | Ligne faultTolerant |
| L67 | net | Et un listener trace chaque ligne ignorée. | IDE : MySkippedErrorsListener |
| L68 | net | Sortie réelle : deux lignes ignorées, et le job termine. | Console : SKIPPED_READ_ERROR · CONFIRMÉ |
| L69 | alerte | Bonne pratique : borner le skip, cibler l'exception, et toujours tracer. Pourquoi : un skip trop large cache de vrais bugs. Ce que ça nous évite : des données perdues en silence. | Carte bonne pratique 11 |
| L70 | net | Autre stratégie : la reprise. Ce même fichier, lu sans skip, échoue à la ligne trois. | Console : FlatFileParseException |
| L71 | net | C'est d'ailleurs la seule classe de test en échec de notre exécution : le step n'a pas de skip. | Bilan : quinze sur seize · CONFIRMÉ |
| L72 | net | Pour reprendre, c'est le statut du step qui compte, pas son statut de sortie. | IDE : MyStoppedForRestartExecutionListener |
| L73 | alerte | Bonne pratique : limiter les redémarrages avec start limit. Pourquoi : un relancement automatique peut boucler. Ce que ça nous évite : un batch qui retente sans fin. Et le statut qui commande la reprise est le statut, pas le statut de sortie. | Carte bonne pratique 12 |

### Scène 10 : Partitions

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L74 | net | Pour aller plus vite : les partitions. Un step manager découpe le travail, des workers l'exécutent en parallèle. | Schéma partitions |
| L75 | net | Le partitioner crée une plage d'identifiants par partition. | IDE : NumericColumnRangePartitioner |
| L76 | net | Chaque partition reçoit son propre contexte, avec from et to. | Lignes ExecutionContext |
| L77 | net | Le step manager lance quatre workers, avec un task executor. | IDE : IncreaseProductPriceInDbWithPartitionJobConfig |
| L78 | alerte | Bonne pratique : un reader de pagination en step scope pour chaque partition. Pourquoi : un reader à curseur n'est pas sûr entre plusieurs threads. Ce que ça nous évite : des lignes lues deux fois, ou manquantes. | Carte bonne pratique 13 |

### Scène 11 : Tests

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L79 | net | Dernier volet : tester. Une classe abstraite lance le job et vérifie le statut. | IDE : AbstractBasicActiveTestJob |
| L80 | net | Chaque test concret fournit seulement ses paramètres. | IDE : TestIncreaseProductPriceInDbJob |
| L81 | alerte | Bonne pratique : une base de test préparée par le test lui-même. Pourquoi : à la première exécution, les tables de productdb n'existaient pas. Ce que ça nous évite : un test qui échoue sur une autre machine. Constaté pendant cette préparation. | Carte bonne pratique 14 · CONFIRMÉ |

### Scène 12 : Mises à jour des versions

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L82 | alerte | Mise à jour. Le dépôt est en Spring Batch cinq. Dans la version six, associée à Spring Boot quatre, le job operator remplace le job launcher, et l'explorateur de jobs est fusionné dans le repository. | Carte mise à jour · RECONSTITUTION |
| L83 | net | Ce point vient de ma connaissance, pas d'une exécution : vérifie la note de version avant de migrer. | Étiquette RECONSTITUTION |

### Scène 13 : Trois niveaux et conclusion

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L84 | net | Développeur : tasklet ou chunk, paramètres en scope, tests. | Panneau développeur |
| L85 | net | Tech Lead : tailles de chunk mesurées, skip borné et tracé, secrets dehors. | Panneau Tech Lead |
| L86 | net | Architecte : reprise, idempotence, partitions, supervision, et migration de version. | Panneau architecte |
| L87 | climax | Règle à retenir : un bon batch se lit par blocs, s'écrit sans doublon, et se reprend là où il s'est arrêté. | Règle finale |
