# Revue croisée de la formation (Modules 1 à 8, dont le 3B lu entre le 3 et le 4)

**Décisions validées le 1er novembre 2026.** Les 11 décisions ont été appliquées dans les modules (voir §9) ; les statuts ci-dessous sont à jour au même jour.

> **Périmètre :** `support/modules/MODULE_1.md` à `MODULE_8.md`, `MODULE_3B_READERS.md`, `VISUELS.md`.
> **Méthode :** lecture automatisée des 9 fichiers (extraction des renvois, des numéros de pièges, des sections, des sous-vidéos, des noms de classes, des citations de diapositives)
> puis lecture des passages signalés. Les diapositives citées ont été comparées au fichier `pptx/Spring_Batch_cours_complet.pptx` (69 diapositives).
> **Ce que cette revue ne fait pas :** elle n'exécute pas le code des modules (consigne du projet) et ne vérifie pas le contenu des diapositives autres que celles citées.

## 0. Synthèse

| Résultat | Détail |
|---|---|
| **Structure** | 9 fichiers sur 9 ont les 5 sections attendues (Concept, Code, Sous le capot, Cas d'usage, Pièges), exactement 10 pièges, deux sous-sections « Références visuelles », un tableau de sous-vidéos dont la somme est exacte (après correction du Module 1) |
| **Renvois** | 26 renvois explicites « piège n°X du Module Y » ou « Module Y, §x.y » (contrôle **refait après le déplacement du 3B** et l'ajout de M8 §2.7) : **26 sur 26 pointent sur une cible qui existe** ; les 7 renvois « Module 3B » pointent vers du **contenu**, pas vers une position |
| **Diapositives citées dans les modules** | 17 sur 17 correctes (numéro et titre) |
| **Contradictions** | **13 relevées** (C13 ajoutée lors du contrôle des renvois au 3B) : 3 corrigées et **vérifiées** (C3, C8, C12) ; 3 **en cours** (C2, C9, R4) ; 6 **appliquées**, à valider (C1, C4, C5, C6, C7, C10) ; C11 clarifiée ; C13 **corrigée**, à valider (§3) |
| **Lacune** | la promesse des Modules 1 et 2 (« lancement asynchrone, Module 8 ») est **tenue** par la nouvelle section **Module 8, §2.7** (C9, en cours de validation) |
| **Parcours** | *Essentiel* (modules 1 à 6) = **321 min ≈ 5 h 21** ; *Complet* = **504 min ≈ 8 h 24** (le Module 8 passe à 73 min avec la nouvelle §2.7). Les renvois de l'Essentiel vers l'optionnel sont étiquetés « (parcours Complet) » (§6) |

**Corrigé lors de la première passe, puis vérifié :** en-tête du Module 1 ; manifeste Kubernetes du Module 8 ; formulation du restart implicite (Modules 6 et 8) ; étiquettes de parcours.

**Appliqué lors de la seconde passe (décisions du 1er novembre 2026) :** voir §9.

---

## 1. Cartographie des concepts

**Légende :** ● introduit ou défini · ◐ approfondi · ○ utilisé · ↩ rappelé explicitement (flashback) · ▷ annoncé.

| Concept | M1 | M2 | M3 | M3B | M4 | M5 | M6 | M7 | M8 |
|---|---|---|---|---|---|---|---|---|---|
| Job, `JobInstance` = Job + paramètres identifiants | ● | ↩ | | | | | ○ | ○ (`workerId`) | ↩ |
| `JobExecution`, `StepExecution`, tables `BATCH_*` | ● | ○ | | | | ○ | ○ | ○ | ○ |
| `ExecutionContext` | ● | | ◐ | ○ | ○ (solution 1) | ○ (decider) | ↩ | ○ (une partition **est** un contexte) | |
| `JobRepository` en PostgreSQL, `@EnableJdbcJobRepository` | ● | ○ | ○ | | | ↩ | ↩ | ↩ (partagé) | ↩ |
| Verrouillage optimiste (`version`), isolation `SERIALIZABLE` | ● | | | | | | | ◐ (`StepExecution`) | |
| `JobOperator` / `JobLauncher` | ● | ◐ | | | | | ○ (`restart`, `stop`) | | ○ (tests) |
| Singleton, cycle de vie du bean | ▷ | ● | ↩ (pièges 4-5) | | ◐ | ↩ | ↩ (listener) | ↩ | |
| `@StepScope`, proxy CGLIB | | ● | ○ | ○ | ◐ | ○ (decider : **pas** de `@StepScope`) | | ○ (reader de partition) | ○ (tests) |
| Tasklet contre chunk | | ● | ◐ | | | | | | |
| Algorithme du chunk, une transaction par chunk | | | ● | | | | ↩ (rollback et rejeu) | ○ | |
| `ItemStream` (`open`/`update`/`close`) | | | ● | ◐ (délégation) | | | ○ | ○ (`Synchronized…`) | |
| Curseur, pagination, `fetchSize`, auto-commit | | | ● | ↩ | | | | ◐ (thread-safety) | |
| `return null` filtre, `filterCount` | ▷ | | ● | | ↩ | ○ | | | ○ |
| Écriture idempotente (`ON CONFLICT`) | | | ● | | | | ↩ | | |
| `DateTimeFormatter` contre `SimpleDateFormat` | | | ○ | | ● | | | ▷ (multithread) | |
| Bean Validation, `CompositeItemProcessor` | | | | | ● | | ○ (skip) | | |
| **Double comptage** du singleton | | ● (tasklet) | | | ◐ (processor) | | ↩ (rejeu) | ↩ (multithread) | ↩ (test) |
| `BatchStatus` contre `ExitStatus` | ○ (statuts) | | | ○ (**avant** M5) | | ● | ○ (restart sur `BatchStatus`) | | ○ |
| Flux, decider, `Split` | | | | | | ● | | ↩ (Split ≠ partitionnement) | |
| `TaskExecutor`, dimensionnement des pools | | ○ (threads virtuels) | | | | ● | | ◐ | |
| Skip, retry, restart | | | | ○ (**aperçu du skip**) | | | ● | | ○ |
| `RetryPolicy` de Spring Framework 7 | | | | | | | ● | | ↩ (récapitulatif) |
| Arrêt gracieux, exécution orpheline (`STARTED`) | ● (piège n°7) | | | | | | ◐ | | ↩ (délai d'arrêt) |
| Partitionnement, `Partitioner`, `StepExecution` des workers | | | | | | ▷ | | ● | ○ (événements JFR) |
| `SKIP LOCKED`, réservation avec bail | | | | | | | | ● | |
| Readers thread-safe ou non | | | ○ | ○ | | | | ◐ | |
| Tests (`@SpringBatchTest`, tests de contenu) | | | | | ○ (deux lancements) | | ○ (liste de tests) | ○ (plages) | ● |
| Micrometer, JFR, journaux structurés | | | | | | | | | ● |
| Kubernetes, Spring Cloud Data Flow | | ○ (mention) | | | | | | | ● |
| Parité dev/prod sur PostgreSQL | ● | | | | | | | | ↩ |

**Lecture.** Aucun concept n'est utilisé avant son introduction **sauf trois** :
1. **`ExitStatus`** est utilisé au **Module 3B** (`EmptyInputFailer`) alors que sa définition est au Module 5 : le renvoi « (Module 5) » existe, mais la notion n'y est pas expliquée.
2. **Le skip** est montré au **Module 3B** (§2.6) avant le Module 6 (voir R4).
3. **`TaskExecutorJobOperator`** et le lancement asynchrone, annoncés au Module 8 par les Modules 1 et 2, **n'étaient pas traités** : c'est le rôle de la nouvelle section **M8 §2.7** (C9, en cours).

---

## 2. Redondances

| # | Concept répété | Où | Verdict | Suggestion |
|---|---|---|---|---|
| R1 | Cycle de vie du bean en 8 étapes | M2 §3.1 et M4 §3.1 (identiques) | **Justifié** (directive : « ré-explique ») mais quasi mot pour mot | M4 : rappel en 3 lignes + renvoi à M2 §3.1, puis seulement ce qui est nouveau |
| R2 | Singleton contre `@StepScope` : les 4 temps du proxy et le schéma mémoire | M2 §3.2 et M4 §3.2 | **Partiellement justifié** : même explication, même schéma | M2 : version courte (idée + schéma) ; M4 : le détail (CGLIB, limites) |
| R3 | Démonstration du double comptage | M2 §3.3 (100 → 200) et M4 §3.3 (135,50 → 271,00 → 406,50) | **Justifié** : progression voulue (tasklet puis processor) | Conserver ; M2 annonce déjà M4 |
| R4 | Skip : `faultTolerant().skip(...)` | **M3B §2.6** et M6 §2.1 | **En cours** : le skip était enseigné deux fois, et M3B est **optionnel** alors que M6 est « Essentiel » | **Appliqué** : `SkipPolicy` (avec le `switch`) déplacée dans M6 §2.1 ; M3B §2.6 réduit à un aperçu de 3 lignes et un renvoi |
| R5 | `SimpleDateFormat` | M3 §2.4 + piège 5 ; M4 §3.5 + piège 5 | **Justifié** : mention (M3) puis explication (M4) | Conserver |
| R6 | Verrouillage optimiste | M1 §3.3-3.4 ; M7 §3.1 | **Justifié** : complémentaires (`JobExecution` atténué / `StepExecution` strict) | Conserver (le renvoi explicite existe) |
| R7 | Exécution orpheline (`STARTED`) | M1 piège 7 ; M6 §3.4 | **Justifié** et croisé | Conserver |
| R8 | Dimensionnement des pools de threads et de connexions | M5 §3.5 ; M7 §3.5 + piège 3 ; M8 | **Justifié** et croisé | Conserver |
| R9 | Position sauvegardée à chaque commit | M3 §3.2 ; M6 §3.1 | **Justifié** : flashback annoncé | Conserver |
| R10 | Singleton avec état dans le Top 10 | M2 #3, M4 #1, M7 #2 | **Justifié** : trois contextes (tasklet, processor, multithread) | Voir §5, « pièges récurrents » |
| R11 | `return null` filtre | M3 §3.4 ; M4 §1.2 | **Justifié** (flashback) | Conserver |

---

## 3. Contradictions et incohérences

| # | Gravité | Constat | Où | Statut / suggestion |
|---|---|---|---|---|
| **C1** | **Haute** | **Paramètres du job du fil rouge incohérents.** Le job reçoit `inputFile` (M3, M3B, M8), mais le service de reprise (M6 §2.4) reconstruit les paramètres avec **`runDate` seul**, et M4/M6 identifient les lancements par `runDate`. Un `restartFor("2026-10-01")` retrouverait une autre instance que celle lancée avec `inputFile` | M3 §2.3, M4 §2.5, M6 §2.4, M8 §2.1 | **Appliqué, à valider.** `bankJob` : `runDate` identifiant + `inputFile` non identifiant ; note et code dans M3 §2.3 ; M4 §2.5, M6 §2.4 et M8 §2.1 alignés |
| **C2** | **Haute** | **Deux classes `HelloJobConfig` et deux `POST /jobs/hello`** : M1 §2.4-2.5 (package `tp.prod`) et M2 §2.2/2.4 (package `tp.prod.hello`, avec un autre step). Si l'élève conserve les deux : beans `helloJob` en double, deux contrôleurs sur la même route | M1, M2 | **En cours.** M1 : `FirstJobConfig`, `firstJob`, `POST /jobs/first` (code `tp/tpProd` renommé) ; M2 garde `HelloJobConfig` / `/jobs/hello` avec la phrase de transition |
| C3 | **Haute** | **Le manifeste Kubernetes (M8) ne lançait aucun traitement** : le Module 1 pose `spring.batch.job.enabled=false`, le manifeste n'y revenait pas ; le conteneur démarrait, ne faisait rien, sortait avec le code 0 | M8 §2.5 | **Vérifié** (variables `SPRING_BATCH_JOB_ENABLED` et `SPRING_BATCH_JOB_NAME`, encadré « deux manières de déclencher un batch ») |
| C4 | Moyenne | **Noms du fil rouge** : M5 utilise `loadStep`, `reportStep`, `alertStep` (génériques) alors que M3, M6, M7, M8 utilisent `loadBankStep`. M5 ne manipule aucun objet bancaire (0 occurrence de `BankTransaction`) | M5 §2.1-2.4 | **Appliqué, à valider.** M5 : `loadBankStep`, `bankReportStep` ; `alertStep` enrichi (`FinanceAlertTasklet`, alerte à l'équipe financière) |
| C5 | Moyenne | **API de test des totaux différente** : M4 §2.5 appelle `analyticsController.analytics()`, M8 §2.2 appelle `analytics.compute()` | M4, M8 | **Appliqué, à valider.** `analyticsService.totals()` dans M4 et M8 |
| C6 | Moyenne | **`RawTransaction` défini deux fois** : M3 §2.2 (sans annotations), M4 §2.1 (avec règles de validation). L'évolution est voulue mais **jamais signalée** | M3, M4 | **Appliqué, à valider.** Phrase ajoutée dans M4 §2.1 |
| C7 | Moyenne | **Numérotation du piège « test vert »** : « piège n°9 » en M3 et M4, mais en M8 il est la ligne **n°1** tout en étant libellé « piège n°9, récurrent » | M8 §5 | **Appliqué, à valider.** « piège récurrent (n°9 des Modules 3 et 4) » dans M8 §2.2 et §5 |
| C8 | Basse | En-tête du Module 1 : « 5 sous-vidéos de 5 à 9 min », « 40 à 45 min » ; le tableau en liste **6** (total 46 min) | M1 | **Vérifié** (45 à 50 min, 6 sous-vidéos, somme 46) |
| **C9** | **Haute** | **Promesse non tenue.** M1 (§2.5 point 7, pièges 6 et 10), M2 (§2.4, variante) renvoient au **Module 8** pour le lancement asynchrone et le choix du nombre de threads ; le Module 8 **ne le traite pas** (aucune occurrence de `TaskExecutorJobOperator` hors du tableau récapitulatif) | M1, M2, M8 | **En cours.** Nouvelle section **M8 §2.7** (`TaskExecutorJobOperator`, comparaison avec l'exécuteur du M2, configuration) + sous-vidéo 8.7 ; renvois de M1 (§2.5 pt 7, pièges 6 et 10) et M2 (§2.4) mis à jour |
| C10 | Moyenne | **`EmptyInputFailer` (M3B §2.5) : `ExitStatus` `FAILED` mais `BatchStatus` `COMPLETED`.** M5 §3.2 dit que la reprise s'appuie sur le `BatchStatus` et M6 que seuls `FAILED`/`STOPPED` sont reprenables : un step « échoué » par son code de sortie serait **non reprenable**. Le comportement du job dans ce cas n'est expliqué nulle part | M3B, M5, M6 | **Appliqué, à valider.** Note « Cas à tester » dans M5 §3.2 ; le test lui-même reste à faire |
| C11 | Basse | **M2 §4.1** présente un `CronJob` qui appelle `POST /jobs/hello` ; **M8** montre un `CronJob` qui lance directement le conteneur | M2, M8 | **Clarifié** dans M8 (encadré) ; aucun changement dans M2 |
| C12 | Basse | **Restart implicite.** M6 ne mentionnait que `restart(executionId)` alors que `start(...)` avec les mêmes paramètres reprend aussi une instance `FAILED` (confirmé par la documentation) | M6 §2.4, M8 §2.5 | **Vérifié** (encadré « Restart implicite » dans M6 §2.4, formulation dans M8 §2.5) |
| C13 | Moyenne | **Renvoi vers du vide.** M7 §2.1 renvoie au **Module 3B** pour `saveState(false)`, mais ni le 3B ni le Module 3 ne définissaient `saveState` ; le Module 6 (parcours Essentiel) emploie aussi le terme sans l'avoir défini | M3, M3B, M6, M7 | **Corrigé, à valider.** Définition ajoutée en **M3 §3.2** (valeur par défaut, effet sur la reprise) et en **M3B §3.1** (cas du step multithread, vers lequel M7 renvoie) |

**Cohérences vérifiées sans écart :** `BatchStatus`/`ExitStatus` (M5, M6, M8) ; `chunk(n)` contre `chunk(n, tx)` déprécié (M3, M6, M7, M8) ; retry de Spring Framework 7 (M6, M8) ; verrouillage optimiste `JobExecution`/`StepExecution` (M1, M7) ; clé de position `read.count` (M3, M6) ; thread-safety des readers (M3, M3B, M7) ; exécution orpheline (M1, M6, M8) ; durées (somme des sous-vidéos = total annoncé dans les 9 modules après correction de M1).

---

## 4. Flashbacks : vérification des renvois

Sections « Flashback » dédiées : M2 §1.1, M3 §1.3, M4 §1.2-1.3, M5 §1.5, M6 §1.3, M7 §1.5, M8 §1.6. **M1** (premier module) annonce au lieu de rappeler ; **M3B** n'a pas de section dédiée (renvois dispersés vers M3).

| Source | Cible | Concept rappelé | Cible correcte ? |
|---|---|---|---|
| M2 §1.1 | M1 | `JobRepository`, `JobInstance`, paramètres identifiants, `JobOperator` | ✔ |
| M2 §2.3 pt 6, piège 10 | M1 | paramètre identifiant, horodatage | ✔ |
| M3 §1.3 | M1 | `ExecutionContext`, `batch_step_execution_context` | ✔ |
| M3 §5 (fin) | M2 §3.2 | composant partagé / proxy mal typé | ✔ |
| M3B §2.3, §2.4 | M3 (pièges n°6, n°9, n°2) | pagination instable, `RowMapper` incomplet, `OutOfMemoryError` | ✔ ✔ ✔ |
| M3B §3.3 | M3 §3.5 | curseur, `fetchSize` | ✔ |
| M4 §1.2 | M3 §3.4 | `return null`, `filterCount` | ✔ |
| M4 §1.3 | M2 | singleton, cycle de vie | ✔ |
| M5 §1.5 | M1, M2 | statuts en base, singletons, `TaskExecutor` | ✔ |
| M6 §1.3 | M3 §3.2, M4 §3.6, M1 | position sauvegardée, rejeu du chunk, statut du dernier `JobExecution` | ✔ ✔ ✔ |
| M6 §3.4 | M1 piège n°7 | exécution `STARTED` orpheline | ✔ (corrigé : n°7 et non n°3) |
| M6 §3.2 | M4 piège n°7 ; M4 §3.6 | effets de bord, rejeu du chunk | ✔ ✔ |
| M7 §1.5 | M1, M4, M5 | `JobRepository` partagé, singleton à état en multithread, `Split` | ✔ ✔ ✔ |
| M7 intro | M4 piège n°8 ; M4 piège n°1 ; M5 piège n°4 | N+1, double comptage, pool de threads | ✔ ✔ ✔ |
| M7 §3.1 | M1 §3.4 ; M5 §3.5 | atténuation du verrouillage ; pool de connexions | ✔ ✔ |
| M8 §1.6 | M1 à M7 | tableau récapitulatif (piège phare de chaque module) | ✔ (les 8 pièges phares cités existent dans les Top 10 des modules concernés) |

---

## 5. Pièges : cohérence entre modules

**Pièges récurrents** (un même concept sous plusieurs numéros) :

| Concept | Occurrences | Même concept ? | Remarque |
|---|---|---|---|
| **Test vert avec des données fausses** | M3 #9 (`RowMapper` incomplet) ; M4 #9 (processor qui ne transforme pas) ; **M8 #1** | **Oui** : trois manifestations d'un même défaut (on vérifie le nombre, pas la valeur) | Conserver, mais **nommer** le piège une fois (« piège du test aveugle ») et corriger la numérotation de M8 (C7) |
| Singleton avec état | M2 #3 ; M4 #1 ; M7 #2 | **Oui** (tasklet, processor, multithread) | Progression voulue ; M7 renvoie à M4 |
| Dimensionnement des pools | M5 #4 et #5 ; M7 #3 ; M8 (grace period #9) | **Oui** (threads, connexions) | Croisé correctement |
| Reprise impossible ou refusée | M1 #7 ; M6 #3, #9, #10 ; M8 #9 | **Oui** (exécution orpheline, mauvais statut, reader non reprenable) | Croisé correctement |
| Lancement mal configuré | M1 #6, #10 ; M2 #1, #2 ; M8 #6, #8 | **Oui** (lancement automatique, requête HTTP bloquée, `CronJob`) | Croisé, mais la promesse sur l'asynchrone est à tenir (C9) |

**Constat :** les numéros ne sont pas stables d'un module à l'autre (le « n°9 » est un piège différent dans chaque module) : seuls M3 et M4 partagent le même n°9. Suggestion : toujours citer « piège n°X **du Module Y** » (déjà respecté dans les 14 renvois).

---

## 6. Parcours et dépendances

**Ordre de lecture.** Le Module 3B est un complément direct du Module 3 : il se lit **entre le 3 et le 4**, bien qu'il porte le nom « 3B » et reste **optionnel**. L'ordre des fichiers (`MODULE_3.md`, `MODULE_3B_READERS.md`, `MODULE_4.md`) est déjà celui du tri alphabétique ; il est fixé dans `README.md`.

```
1 → 2 → 3 → [3B : optionnel] → 4 → 5 → 6 → [7 : optionnel] → [8 : optionnel]
```

| Transition | Texte | Où |
|---|---|---|
| fin du Module 3 | « Le Module 3B (optionnel) explore les readers avancés […] Si vous suivez le parcours Essentiel, passez directement au Module 4. » | M3, entre §6 et §7 |
| fin du Module 3B | « Le Module 4 (processors) vous attend pour transformer les données que vous venez d'apprendre à lire. » | M3B, dernière ligne |
| en tête du Module 4 | « Prérequis de parcours : Module 3 (obligatoire) et Module 3B (optionnel, si vous l'avez suivi). » | M4, en-tête |

**Dépendances du 3B.** Aucun module du parcours Essentiel ne **dépend** du 3B pour être compris ; trois renvois pointent vers son contenu, tous étiquetés *(parcours Complet)* ou situés dans un module lui-même optionnel :

| Renvoi | Contenu visé dans le 3B | Étiquette |
|---|---|---|
| M5 §3.2 (note « Cas à tester ») | `EmptyInputFailer` (§2.5) | *(parcours Complet)* ajouté |
| M6 piège 9 | répertoire par exécution (§3.4) | *(Module 3B, parcours Complet)* |
| M7 §2.1 et §2.3 | `saveState(false)` (§3.1), pagination à clé unique (§2.3) | module 7 déjà optionnel |

| Parcours | Modules | Durée |
|---|---|---|
| **Essentiel** | 1, 2, 3, 4, 5, 6 | 46 + 45 + 55 + 60 + 55 + 60 = **321 min ≈ 5 h 21** |
| **Complet** | + 3B (40), 7 (70), 8 (73) | **504 min ≈ 8 h 24** |

**Le parcours Essentiel renvoie à du contenu optionnel.** Un élève qui s'arrête au Module 6 rencontre ces annonces ; **toutes sont maintenant étiquetées « (parcours Complet) »** (dernière colonne) :

| Module Essentiel | Renvoi | Cible optionnelle | Traitement appliqué |
|---|---|---|---|
| M1 §2.5 point 7 | lancement asynchrone | M8 §2.7 | première version indiquée au M2 §2.4 ; M8 §2.7 *(parcours Complet)* |
| M1 §5, pièges 6 et 10 | lancement explicite / asynchrone | M8 §2.7 | idem, étiqueté |
| M2 §2.4 (variante) | `TaskExecutorJobOperator` | M8 §2.7 | étiqueté *(parcours Complet)* |
| M4 §3.5 | `SimpleDateFormat` en multithread | M7 | étiqueté *(parcours Complet)* |
| M5 §3.4 | supervision | M8 | étiqueté *(parcours Complet)* |
| M5 §3.5 et références visuelles | `Split` contre partitionnement | M7 | étiqueté *(parcours Complet)* (2 renvois) |
| M6 piège 9 | répertoire par exécution | M3B | étiqueté *(Module 3B, parcours Complet)* |
| M6 | le **skip** montré aussi en 3B | M3B | **résolu** : le skip complet est dans M6 (R4) |

---

## 7. Références aux diapositives du PPT

### 7.1 Diapositives citées dans les modules (17)

| Module | Diapositives citées | Statut |
|---|---|---|
| M6 | 43 « Skip : ignorer certaines erreurs », 44 « Retry : retenter les erreurs transitoires », 45 « Restart : reprendre là où ça s'est arrêté » (×2), 17 « ExecutionContext et JobRepository » (×2), 16 « Step et StepExecution », 29 « L'algorithme du chunk et ses interfaces » | **vérifié** (numéro et titre) |
| M7 | 40 « Flows en parallèle (split) », 41 « Partitions : le même step, des plages différentes » (×2) | **vérifié** |
| M8 | 46 « Tester un job et un step », 47 « Composants personnalisés, logs et patterns », 48 « Lancer et superviser », 64 « Spring Batch 6 : les nouveautés », 65 « Impact sur notre TP (Spring Batch 5 → 6) » | **vérifié** |
| M1 (6), M2 (4), M3 (4), M3B (2), M4 (4), M5 (3) | **lignes `🖼️ [RÉFÉRENCE PPT]` ajoutées**, avec les **titres complets** | **vérifié** : 39 citations numéro + titre, **0 écart** (contrôle automatique) |

### 7.2 Correspondance `VISUELS.md` §5 (27 renvois)

**27 titres, tous complets après correction** (6 titres abrégés complétés dans cette passe) : n°31 « Le reader CSV » (réel : « … (FlatFileItemReader) »), n°38 « Enchaîner les steps » (réel : « … : séquence et conditions »), n°39 « Le decider » (réel : « … : aiguiller selon un résultat »), n°43, 44, 45 (titres sans la suite). **Aucun numéro faux.** À reprendre avec les titres complets lors de l'insertion des lignes `🖼️`.

### 7.3 Contenu des diapositives à mettre à jour (écarts avec les modules)

| Diapo | Contenu actuel | Écart avec les modules | Action |
|---|---|---|---|
| 43, 44, 45 | `chunk(5, batchTxManager)`, `backOffPolicy(new ExponentialBackOffPolicy())` | forme dépréciée / supprimée en 6.0.6 (M3, M6) | remplacer par `chunk(n)` + `retryPolicy(RetryPolicy.builder()…)` |
| 44 | « `retryLimit(3)` : trois tentatives **au total** » | vrai en 5.1 ; en 6 le sens de `maxRetries` est à **mesurer** (M6, exercice 3) | reformuler après mesure |
| 46 | `jobLauncherTestUtils.launchJob(...)` | `JobLauncherTestUtils` déprécié ; `JobOperatorTestUtils.startJob(...)` (M8 §2.1) | remplacer |
| 41 | clés de contexte `from` / `to`, `NumericColumnRangePartitioner` | M7 : `minId` / `maxId`, `IdRangePartitioner` | harmoniser |
| 40 | `new SimpleAsyncTaskExecutor()` pour le `Split` | M5 : pool **borné** ; M7 : `SimpleAsyncTaskExecutor` illimité à proscrire en production | remplacer ou marquer « démonstration » |
| 64 | nouveautés : `StoppableStep`, `CommandLineJobOperator`, `@EnableMongoJobRepository`, dépôt « sans ressource » par défaut, modèle de concurrence (producteur-consommateur, local chunking, remote step, SEDA) | **non couvertes** par M8 §1.2 ; `CommandLineJobOperator` existe dans le jar | compléter M8 §1.2 ou alléger la diapositive |
| 17 | « au minimum H2 en… » | M1 : H2 jamais en production | vérifier la formulation |
| 12 à 16 | non relues en détail | | à relire lors de la mise à jour du PPT |

---

## 8. Fil rouge : présence du cas bancaire

| Module | Cas bancaire ? | Classes et noms |
|---|---|---|
| M1, M2 | **Non** (job « Hello », `runDate`) | `HelloJobConfig`, `helloJob` (C2) |
| M3 | Oui | `RawTransaction`, `BankTransaction`, `loadBankStep`, `bankCsvReader`, `bankDbWriter` |
| M3B | Oui (comptes et opérations) | `AccountLine`, `OperationLine`, `Account` |
| M4 | Oui | `BankTransactionProcessor`, `AnalyticsProcessor`, `bankProcessor` |
| M5 | **Partiel** : noms génériques (C4) | `loadStep`, `reportStep`, `alertStep`, `bankFlowJob` |
| M6, M7, M8 | Oui | `loadBankStep`, `bankJob`, `bank_transaction`, `staging_transaction` |

**Constat :** le cas bancaire démarre au Module 3 ; les deux premiers modules utilisent un job « Hello » (choix pédagogique légitime : pas de fichier ni de base métier avant le chunk). Une phrase de transition en fin de Module 2 (« à partir du Module 3, nous chargeons un fichier de transactions bancaires ») rendrait le passage explicite.

---

## 9. Décisions validées le 1er novembre 2026 : état d'application

| # | Décision | Statut |
|---|---|---|
| 1 | **C9** : section « Lancer sans bloquer en production » dans M8 + renvois de M1 et M2 | **En cours** (M8 §2.7 rédigée, sous-vidéo 8.7, durées recalculées) |
| 2 | **C1** : `runDate` (identifiant) + `inputFile` (non identifiant) | **Appliqué** (M3, M4, M6, M8) |
| 3 | **C2** : `FirstJobConfig` / `POST /jobs/first` (M1), `HelloJobConfig` / `POST /jobs/hello` (M2) | **En cours** (modules et projet `tp/tpProd` renommés ; code non exécuté) |
| 4 | **R4** : `SkipPolicy` déplacée vers M6, aperçu de 3 lignes en M3B | **En cours** (appliqué) |
| 5 | **C4** : `loadBankStep`, `bankReportStep`, `alertStep` enrichi | **Appliqué** |
| 6 | **C5** : `analyticsService.totals()` | **Appliqué** (M4, M8) |
| 7 | **C6** : phrase « version enrichie du record `RawTransaction` » | **Appliqué** (M4 §2.1) |
| 8 | **C7** : « piège récurrent (n°9 des Modules 3 et 4) » | **Appliqué** (M8 §2.2 et §5) |
| 9 | **C10** : note « Cas à tester » (`ExitStatus` `FAILED`, `BatchStatus` `COMPLETED`) | **Appliqué** (M5 §3.2) ; test à faire |
| 10 | Étiquette « (parcours Complet) » sur les 8 renvois Essentiel vers optionnel | **Appliqué** (§6) |
| 11 | Lignes `🖼️ [RÉFÉRENCE PPT]` dans M1 à M5 et M3B, titres complets | **Appliqué** et **vérifié** (39 citations, 0 écart) |

**Durées après modification :** Module 8 : 73 min (10 sous-vidéos) ; **Complet : 504 min ≈ 8 h 24** ; **Essentiel : 321 min ≈ 5 h 21**.
