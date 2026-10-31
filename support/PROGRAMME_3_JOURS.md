# Spring Batch : formation de 3 jours

> Plan **calqué sur le cours du formateur** (`docs/spring_batch.pdf`, D. Defrance : 5 parties, annexe TP 1.1 à 1.10)
> et sur ses 3 séances enregistrées (intro et concepts, projet et démo bancaire, composite et piège).
> Rythme : 7 h de face-à-face par jour (9 h-12 h 30 / 14 h-17 h 30), environ 50 % de pratique.
> Colonne **Preuve** : ce qui a réellement été exécuté (journaux dans `docs/verifications/`).
> Les contenus marqués **non exécuté** viennent du cours ou de la documentation officielle, sans test ici.

| Support | Où |
|---|---|
| Cours écrit | `support/COURS_SPRING_BATCH.md` |
| TP fil rouge pas à pas | `support/TP_FIL_ROUGE.md` |
| PPT animé (69 diapos) | `pptx/Spring_Batch_cours_complet.pptx` |
| Vidéo animée du TP | `video/` |
| Code des TP | `tp/tpSpringBatchSolution`, `tp/tpBankDemo`, `tp/tpComplements` |

---

## Jour 1 · Comprendre, démarrer, lire et écrire des fichiers

*Objectif : écrire et lancer un premier job, savoir lire/écrire CSV, positions fixes, JSON, XML.*

| Horaire | Module | PDF | Diapos | Pratique | Preuve |
|---|---|---|---|---|---|
| 9 h 00 – 9 h 45 | Pourquoi le batch : besoins, cas d'usage, principes, stratégies | I.1 | 3-10 | quiz « batch ou temps réel ? » | doc officielle (non exécuté) |
| 9 h 45 – 10 h 45 | Architecture en 3 couches, Job / JobInstance / JobExecution / Step / StepExecution, ExecutionContext, JobRepository | I.2-I.3 | 11-18 | schéma à compléter ; prédire le nombre de JobInstance | exécuté (étape 3 du TP) |
| 11 h 00 – 12 h 30 | Maven (avec et sans Boot), JobRepository, tasklet, Step et Job | I.4-I.6.4 | 19-23 | **TP 1.1-1.2** : Hello World | `mvn test` : 16 classes vertes |
| 14 h 00 – 15 h 00 | Lancer un job : ligne de commande, test JUnit, XML | I.6.5-I.6.7 | 24-25 | lancer avec/sans paramètre horodaté | exécuté |
| 15 h 00 – 16 h 00 | Tasklet ou chunk, algorithme du chunk, ItemProcessor | II.1-II.2 | 26-30 | **TP 1.3-1.4** : CSV vers console | exécuté |
| 16 h 15 – 17 h 30 | Formats : CSV délimité, **positions fixes**, **hybride**, JSON, XML | II.3 | 31-32 | CSV vers JSON puis XML ; lire un fichier à positions fixes | exécuté (`tpComplements` : `FilesTest`) |

**Bilan du jour 1 (15 min) :** trois pièges vus, `@EnableBatchProcessing` inutile avec Boot 3, plus de `JobBuilderFactory`, un mode strict qui refuse une ligne trop longue ou trop courte en positions fixes.

## Jour 2 · Paramètres, processeurs, base de données, flux et parallélisme

*Objectif : un job paramétré qui lit/écrit en base, avec des chemins conditionnels et du parallélisme.*

| Horaire | Module | PDF | Diapos | Pratique | Preuve |
|---|---|---|---|---|---|
| 9 h 00 – 10 h 00 | Job parameters, `@JobScope`/`@StepScope`, validation, « 2 instances = au moins 1 paramètre différent » | III.1 | 33 | **TP 1.5** : CSV vers XML avec paramètres | exécuté (`tpComplements` : `JobsTest.validation…`) |
| 10 h 00 – 11 h 00 | Processeurs : filtrage (retour `null`), enchaînement (composite) | III.2 | 34-35 | filtrer les moins de 18 ans | exécuté (`filtrage_et_composition`) |
| 11 h 15 – 12 h 30 | Base de données : reader curseur / paging, writer JDBC | III.3 | 36 | **TP 1.6** : lecture et insertion en base | exécuté |
| 14 h 00 – 15 h 00 | Flow : séquence, conditions, ExitStatus, **decider** | III.4.1-4.4 | 38-39 | **TP 1.7** : flow conditionnel | exécuté |
| 15 h 00 – 16 h 00 | Flows en parallèle (split), autres possibilités | III.4.5 | 40 | split de 2 flows | exécuté (`ParallelFlowsJobConfig`) |
| 16 h 15 – 17 h 15 | Partitions : même step, plages différentes | III.4.6 | 41 | **TP 1.8** (facultatif) | exécuté |
| 17 h 15 – 17 h 30 | Bilan, questions | | | | |

## Jour 3 · Fiabilité, tests, composants personnalisés, exploitation et démo bancaire

*Objectif : un batch qui résiste aux erreurs, testé, lancé et supervisé.*

| Horaire | Module | PDF | Diapos | Pratique | Preuve |
|---|---|---|---|---|---|
| 9 h 00 – 10 h 00 | Tests : job, step, assertions, classe abstraite | IV.1 | 46 | test d'un job et d'un step | exécuté |
| 10 h 00 – 11 h 15 | **Skip**, **retry**, **restart** | IV.2 | 43-45 | **TP 1.9** : incidents (retry ou restart) | skip/restart exécutés ; **retry exécuté** (`tpComplements`) |
| 11 h 30 – 12 h 30 | Reader et writer personnalisés (jeu de données, écriture en 2 tables), pattern « délégation » | IV.3, IV.7.2 | 47 | écrire un writer 2 tables | exécuté (`reader_delegue_et_writer_deux_tables`) |
| 14 h 00 – 15 h 00 | Lancement (scheduler, REST), Spring Cloud Data Flow, monitoring, logging par listener | IV.4-IV.7.1 | 48 | **TP 1.10** : superviser | listener/logs exécutés ; **SCDF non exécuté** |
| 15 h 00 – 16 h 15 | **Démo du formateur** : transactions bancaires, REST, composite, piège du processor avec état | séances 2-3 | 49-59 | refaire la démo seul | exécuté (`tpBankDemo`) |
| 16 h 15 – 17 h 00 | Bonnes pratiques, Spring Batch 6, questions d'entretien | | 60-66 | atelier : migrer une config 5 vers 6 | v6 **non exécuté** |
| 17 h 00 – 17 h 30 | Synthèse et évaluation | | 67-69 | | |

---

## Couverture du cours du formateur

| Chapitre du PDF | Cours écrit | PPT | Code exécuté |
|---|---|---|---|
| I. Vue d'ensemble, démarrage | oui | oui | oui |
| II. Tasklet, chunk, fichiers (CSV, positions fixes, hybride, JSON, XML) | oui (§14 complète) | oui | oui |
| III. Paramètres, processeurs, base, flows, partitions | oui | oui | oui |
| IV. Tests, skip/retry/restart, custom reader/writer | oui | oui | oui |
| IV. Scheduler, Spring Cloud Data Flow, monitoring | résumé | résumé | **non exécuté** |
| IV.7 logging, patterns | oui (§14) | oui | oui |
| V. Annexe TP 1.1 à 1.10 | oui (TP fil rouge) | oui | 1.1-1.9 exécutés, 1.10 non |
| Séances du formateur (démo bancaire) | oui | oui | oui |

## Écarts honnêtes
- Les diapos ne détaillent pas encore le format **hybride** ni le **monitoring** (une seule diapo chacun) : à étoffer si le temps le permet.
- La vidéo animée suit le TP fil rouge, pas encore la démo bancaire du formateur.
- Les animations du PPT n'ont pas été ouvertes dans PowerPoint lui-même.
