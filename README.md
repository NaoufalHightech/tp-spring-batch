# Spring Batch : de la Tasklet au Remote Chunking

Formation Spring Batch de niveau « production », construite sur **Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16**.
Chaque module suit la même structure : **Concept**, **Code ligne par ligne**, **Plongée sous le capot**, **Cas d'usage**, **Pièges (Top 10)**, puis exercices et découpage en sous-vidéos.
Le fil rouge est un traitement de **transactions bancaires** (fichier CSV vers PostgreSQL).

> Le dépôt d'origine (énoncés et solutions de TP de D. Defrance) est décrit dans [`README.txt`](README.txt).

---

## Ordre de lecture des modules

Le **Module 3B** est un complément direct du Module 3 (il le prolonge) : on le lit **juste après** lui, avant le Module 4.

| Ordre | Module | Fichier | Durée visée | Parcours |
|---|---|---|---|---|
| 1 | **1 · Fondations et environnement de production** | [`MODULE_1.md`](support/modules/MODULE_1.md) | 46 min | Essentiel |
| 2 | **2 · Premier job et cycle de vie** | [`MODULE_2.md`](support/modules/MODULE_2.md) | 45 min | Essentiel |
| 3 | **3 · Le chunk : lire, traiter, écrire** | [`MODULE_3.md`](support/modules/MODULE_3.md) | 55 min | Essentiel |
| 4 | **3B · Le catalogue des readers** *(complément du Module 3)* | [`MODULE_3B_READERS.md`](support/modules/MODULE_3B_READERS.md) | 40 min | **Optionnel / Avancé** |
| 5 | **4 · Processors, scopes et proxys** | [`MODULE_4.md`](support/modules/MODULE_4.md) | 60 min | Essentiel |
| 6 | **5 · Flux et orchestration** | [`MODULE_5.md`](support/modules/MODULE_5.md) | 55 min | Essentiel |
| 7 | **6 · Fiabilité : skip, retry, restart, arrêt gracieux** | [`MODULE_6.md`](support/modules/MODULE_6.md) | 60 min | Essentiel |
| 8 | **7 · Mise à l'échelle et multi-instance** | [`MODULE_7.md`](support/modules/MODULE_7.md) | 70 min | **Optionnel / Avancé** |
| 9 | **8 · Production : tests, monitoring, déploiement, cloud** | [`MODULE_8.md`](support/modules/MODULE_8.md) | 73 min | **Optionnel / Avancé** |

### Deux parcours

| Parcours | Modules | Durée |
|---|---|---|
| **Essentiel** | 1, 2, 3, 4, 5, 6 | 321 min ≈ **5 h 21** |
| **Complet** | tous (avec 3B, 7 et 8) | 504 min ≈ **8 h 24** |

Les renvois d'un module du parcours Essentiel vers un module optionnel sont marqués *(parcours Complet)*.

---

## Documents de production

| Document | Contenu |
|---|---|
| [`REVUE_CROISEE.md`](REVUE_CROISEE.md) | cartographie des concepts, redondances, contradictions, flashbacks, références au PPT, état d'application des décisions |
| [`pptx/generate_pptx.py`](pptx/generate_pptx.py) | génère le PPT module par module (Module 1 pour l'instant) ; sortie dans `pptx/build/` ; **non exécuté par l'équipe de rédaction** |
| [`ASSETS_A_CREER.md`](ASSETS_A_CREER.md) | les 36 schémas S01 à S38 (tous en formes natives) avec leur description visuelle et leur état, schémas officiels à insérer |
| [`PPT_PLAN.md`](PPT_PLAN.md) | plan du PPT final (Phase 1) : inventaire des 69 diapositives d'origine, 214 diapositives du nouveau PPT par module, schémas à créer ; généré et contrôlé par `pptx/plan_tools/gen_plan.py` |
| [`support/modules/VISUELS.md`](support/modules/VISUELS.md) | méthode des « Références visuelles », schémas officiels identifiés, schémas à créer, correspondance avec les diapositives du PPT |

## Code de référence

| Projet | Pile | Usage |
|---|---|---|
| [`tp/tpProd`](tp/tpProd) | Boot 4.1.2, Spring Batch 6.0.6, PostgreSQL, JDK 25 | projet du Module 1 (`FirstJobConfig`) ; **non recompilé depuis le renommage des classes** |
| [`tp/tpComplements`](tp/tpComplements) | Boot 3.2.4, Spring Batch 5.1 | compléments du cours d'origine (positions fixes, format hybride, retry, validation…), 10 tests exécutés |
| [`tp/tpBankDemo`](tp/tpBankDemo) | Boot 3.2.4, Spring Batch 5.1 | démonstration bancaire du formateur, tests exécutés |
| [`tp/tpSpringBatchSolution`](tp/tpSpringBatchSolution) | Boot 3.2.4, Spring Batch 5.1 | solutions des TP d'origine |

> **Le code des modules 3 à 8 est écrit pour Spring Batch 6.0.6 mais n'a pas été exécuté** ; les sections marquées **(Théorique)** (distribué, Kubernetes, Data Flow, lancement asynchrone) le sont explicitement. Les classes citées ont été vérifiées dans les jars 6.0.6.

## Supports antérieurs (à aligner sur Spring Batch 6)

Ces supports ont été produits sur **Spring Batch 5.1 / Boot 3.2.4** et seront mis à jour à partir des modules :

| Support | Fichier |
|---|---|
| Cours écrit et TP fil rouge | [`support/COURS_SPRING_BATCH.md`](support/COURS_SPRING_BATCH.md), [`support/TP_FIL_ROUGE.md`](support/TP_FIL_ROUGE.md) |
| Programme de 3 jours | [`support/PROGRAMME_3_JOURS.md`](support/PROGRAMME_3_JOURS.md) |
| PPT animé (69 diapositives) | [`pptx/Spring_Batch_cours_complet.pptx`](pptx/Spring_Batch_cours_complet.pptx) |
| Vidéo animée du TP | [`video/`](video) |

Le détail des diapositives dont le code est périmé est au §7.3 de [`REVUE_CROISEE.md`](REVUE_CROISEE.md).
