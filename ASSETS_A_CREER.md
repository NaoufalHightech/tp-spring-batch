# Schémas à créer

> Généré avec `PPT_PLAN.md` par `pptx/plan_tools/gen_plan.py`. Règle de `pptx/generate_pptx.py` : un schéma **personnalisé** de **plus de 5 formes** devient un **placeholder** (rectangle en pointillés) dans le PPT ; il est à créer en **Manim**.
> Un schéma de **5 formes ou moins** est dessiné nativement (`python-pptx`).

## 1. Schémas personnalisés S01 à S38

S02 et S33 sont **retirés** (décision validée).

| Id | Module | Schéma | Approche | État | Description | Diapositive(s) du plan |
|---|---|---|---|---|---|---|
| S01 | 1 | ERD des 6 tables BATCH_* avec les colonnes `version` | Manim | placeholder dans M1 (bandeau sous le tableau) | entité-relation annoté PostgreSQL ; `version` en évidence | n°26 |
| S03 | 1 | Séquence du verrouillage optimiste (serveurs A et B) | Manim | placeholder dans M1 | `UPDATE … WHERE version = ?` : 1 ligne puis 0 ligne ; version en rouge | n°28 |
| S04 | 1 | La nuit interrompue : crash à 3 h 12 et reprise | natif python-pptx | **réalisé** nativement dans M1 (4 boîtes) | frise temporelle (cas d'usage M1 §4.1) | n°12 |
| S05 | 2 | Tasklet contre chunk | natif python-pptx | à faire (M2) | deux colonnes : une action, une boucle lire-traiter-écrire | n°37 |
| S06 | 2/4 | Singleton contre proxy `@StepScope` (mémoire JVM) | Manim | à faire (animé en 4 temps) | proxy permanent gris, instances éphémères bleu et vert ; animé en 4 temps | n°47, n°106 |
| S07 | 2 | Double comptage de `CountingTasklet` (100 puis « 200 ») | natif python-pptx | à faire (M2) | chronologie courte ; annonce S15 | n°48 |
| S08 | 3 | Frise des transactions : commit = lignes + position | Manim | à faire | 3 chunks ; crash avant le commit du 3e | n°69 |
| S09 | 3 | Cycle de vie d'`ItemStream` | natif python-pptx | à faire (M3) | `open` → (`read` ×N, `update`, commit) ×chunks → `close` | n°68 |
| S10 | 3 | Curseur contre pagination, `fetchSize` et streaming PostgreSQL | Manim | à faire | redessiné (le schéma du livre n'est pas réutilisable) ; 4 conditions en pastilles | n°73, n°74 |
| S11 | 3B | Carte mentale des readers | Manim | à faire | par source ; ce qui a disparu en grisé | n°82 |
| S12 | 3B | Rupture de contrôle (ACC / OP / `peek`) | Manim | à faire | compte regroupé en un seul élément | n°85 |
| S13 | 3B | Restart de `MultiResourceItemReader` | Manim | à faire | fichier ajouté entre deux lancements ; contre-exemple du répertoire par exécution | n°93 |
| S14 | 4 | Les trois flèches du processor | natif python-pptx | à faire (M4) | transformer / filtrer / rejeter avec les compteurs de `batch_step_execution` | n°97 |
| S15 | 4 | Le bug du double comptage | Manim | à faire : priorité n°1 | ⭐ priorité n°1 ; un singleton, trois lancements, 135,50 → 271,00 → 406,50 | n°103 |
| S16 | 4 | Rejeu du chunk : total du processor faux, `SUM` SQL juste | Manim | à faire | élément traité deux fois après un retry | n°110 |
| S17 | 4 | Les trois solutions comparées | natif python-pptx | à faire (tableau coloré) | matrice colorée | n°109 |
| S18 | 5 | `BatchStatus` et `ExitStatus` en deux voies | natif python-pptx | à faire (M5) | rail technique / rail d'aiguillage ; `COMPLETED_WITH_REJECTS` | n°120 |
| S19 | 5 | Machine à états du job | Manim | à faire : priorité | ⭐ états, transitions étiquetées, « Next state not found » en rouge | n°128 |
| S20 | 5 | `Split` : threads et barrière | Manim | à faire | thread 1 bleu, thread 2 vert, barrière rouge | n°131 |
| S21 | 5 | Jauge du pool de connexions | natif python-pptx | à faire | 2 flux × 3 connexions + JobRepository | n°132 |
| S22 | 6 | Skip, retry, restart : tableau et arbre de décision | natif python-pptx | à faire (M6) | reprend le style des diapositives 43 à 45 | n°137 |
| S23 | 6 | Chronologie crash puis restart | Manim | à faire : priorité | ⭐ chunk 34 validé, crash à la ligne 3 450, reprise à la 3 401e | n°147 |
| S24 | 6 | Rollback et rejeu avec pause exponentielle | Manim | à faire | élément 37 en rouge, rollback, pause, rejeu en vert | n°145 |
| S25 | 6 | Arrêt gracieux contre `kill -9` | Manim | à faire | deux lignes de temps : `STOPPED` propre / `STARTED` orphelin | n°150 |
| S26 | 7 | Arbre de choix des approches de mise à l'échelle | Manim | à faire | goulot : I/O, traitement, attente | n°159 |
| S27 | 7 | Deux situations du multi-instance | natif python-pptx | à faire (M7) | éviter les doublons contre se partager le travail | n°160 |
| S28 | 7 | Deux instances et `SKIP LOCKED` | Manim | à faire : priorité | ⭐ lignes réservées par A (bleu), B (vert), verrouillées sautées (gris) | n°175 |
| S29 | 7 | Plages de partitionnement sans chevauchement | natif python-pptx | à faire | 4 couleurs ; cas fautif en rouge | n°171 |
| S30 | 7 | Livraison en double et `OptimisticLockingFailureException` | natif python-pptx | à faire | deux workers sur la même partition | n°177 |
| S31 | 7 | Quel reader est thread-safe ? | natif python-pptx | à faire (tableau) | tableau en pastilles vertes et rouges | n°163 |
| S32 | 7 | Débit contre nombre de threads | Manim | à faire | courbe qui plafonne quand l'I/O sature | n°178 |
| S34 | 8 | Les trois piliers | natif python-pptx | à faire (M8) | tests / monitoring / déploiement | n°183 |
| S35 | 8 | Récapitulatif : les 8 modules et leur piège phare | Manim | à faire | carte de la formation | n°205 |
| S36 | 8 | Machine à états Kubernetes d'un batch | Manim | à faire : priorité | ⭐ `restartPolicy`, `backoffLimit`, `activeDeadlineSeconds` | n°199 |
| S37 | 8 | Événements JFR sur le déroulé d'un chunk et d'un partitionnement | Manim | à faire | 11 événements placés sur le schéma | n°192 |
| S38 | 8 | Pull contre push des métriques | Manim | à faire | job de 20 secondes, scrape de 30 secondes | n°191 |

## 2. Schémas officiels à insérer (titres vérifiés)

L'insertion d'images officielles est manuelle : le script place une légende « Schéma officiel à insérer » sur les diapositives concernées.

| Titre officiel | Page | Où l'insérer |
|---|---|---|
| « Spring Batch Layered Architecture » | Spring Batch Architecture | Module 1, « Architecture en trois couches » |
| « Partitioned Process » | Spring Batch Architecture | Module 7, « Partitions : le même step… » |
| « Job Hierarchy With Steps » | The Domain Language of Batch | Module 1, « Job, JobInstance, JobExecution » |
| « Job Parameters » | The Domain Language of Batch | Module 1, « JobInstance = Job + paramètres identifiants » |
| « Batch Stereotypes » | The Domain Language of Batch | Module 4 (rôle du processor) — à rapprocher de S14 |
| « Job Hierarchy » | The Domain Language of Batch | Module 1 (variante sans les steps) |

## 3. Schémas du PPT d'origine

Le PPT d'origine **ne contient aucune image** (0 balise `p:pic`, dossier média vide) : tous ses schémas sont des **formes natives**. L'extraction d'images est donc impossible (voir `pptx/assets/EXTRACTION.md`). Les schémas d'origine **simples** (jusqu'à 8 formes) sont redessinés nativement dans le script ; les autres sont des placeholders listés ici.

| Diapositive d'origine | Schéma | Traitement dans le nouveau PPT |
|---|---|---|
| n°4 | lire, traiter, écrire | **redessiné** nativement (Module 1) |
| n°9 | cinq stratégies | **redessiné** nativement (Module 1) |
| n°12 | trois couches | **redessiné** nativement (Module 1) |
| n°13 | schéma de référence (6 formes) | **redessiné** nativement (Module 1) |
| n°14 | Job, JobInstance, JobExecution | **redessiné** nativement + légende du schéma officiel (Module 1) |
| n°27, 28, 29, 38, 39, 40, 41, 58 | tasklet/chunk, chunk, algorithme, flux, decider, split, partitions, double comptage | **à redessiner** dans les modules concernés (M2, M3, M5, M7, M4) |

## 4. Placeholders présents dans le Module 1

| Diapositive du plan | Placeholder | Contenu à créer |
|---|---|---|
| n°26 | S01 | ERD des 6 tables `BATCH_*` avec les colonnes `version` en évidence |
| n°28 | S03 | séquence A / B / base du verrouillage optimiste |
