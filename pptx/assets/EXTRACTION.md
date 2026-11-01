# Extraction des images du PPT d'origine : impossible

**Constat** (relevé sur `pptx/Spring_Batch_cours_complet.pptx`, 69 diapositives) :

| Mesure | Résultat |
|---|---|
| Balises `<p:pic>` (images) sur les 69 diapositives | **0** |
| Fichiers dans `ppt/media/` | **0** (le dossier est vide) |
| Schémas du PPT | **formes natives** (rectangles arrondis, flèches, tableaux), sans image |

Il n'y a donc **rien à extraire** avec `shape.image.blob` : ce dossier `pptx/assets/` ne contiendra pas d'images extraites.

**Ce qui est fait à la place** (voir `pptx/generate_pptx.py`) :

1. Les schémas **simples** du PPT d'origine (jusqu'à 8 formes : lire-traiter-écrire, cinq stratégies, trois couches, schéma de référence, hiérarchie Job / JobInstance / JobExecution) sont **redessinés nativement** avec la charte demandée.
2. Les schémas **personnalisés** S01 à S38 de **plus de 5 formes** deviennent des **placeholders** (rectangle en pointillés) ; ils sont listés dans `ASSETS_A_CREER.md` pour une création en Manim.
3. Les schémas **officiels** (6, titres vérifiés) reçoivent une **légende « schéma officiel à insérer »** ; l'insertion des images se fait à la main.

**Alternative écartée : copier les formes du PPT d'origine.** Les formes d'origine utilisent les couleurs du thème du PPT d'origine (vert 1D3B2A, bleu 3F7CAC…) ; les recopier dans un nouveau fichier mélangerait deux palettes. Elle reste possible si l'on construit le nouveau PPT à partir du fichier d'origine comme modèle.

**À noter sur la charte :** les couleurs demandées pour cette passe (`1F4E3D`, `3B7D54`, `2E6DA4`, `E89C1C`, `7B4CAF`, `C0392B`, `F4F8F4`, `1E1E1E`) sont proches, mais **différentes**, de celles du PPT d'origine. Toute la palette tient dans le dictionnaire `PAL` du script.
