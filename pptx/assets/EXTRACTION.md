# Extraction des images du PPT d'origine : impossible, et inutile

**Constat** (relevé sur `pptx/Spring_Batch_cours_complet.pptx`, 69 diapositives) :

| Mesure | Résultat |
|---|---|
| Balises `<p:pic>` (images) sur les 69 diapositives | **0** |
| Fichiers dans `ppt/media/` | **0** (le dossier est vide) |
| Schémas du PPT | **formes natives** (rectangles arrondis, flèches, tableaux), sans image |

Il n'y a **rien à extraire** : ce dossier `pptx/assets/` ne contiendra pas d'images.

**Stratégie retenue (décision validée) : tout en formes natives PowerPoint**, comme le PPT d'origine. Pas d'image, pas de Manim.

1. **Tous** les schémas, ceux du PPT d'origine comme S01 à S38, sont dessinés par `pptx/generate_pptx.py` avec `python-pptx` (rectangles arrondis, ovales, connecteurs fléchés, tableaux). La liste des 36 schémas et leur état sont dans `ASSETS_A_CREER.md`.
2. Les schémas **officiels** (6, titres vérifiés) restent des **images** de la documentation : le script place une légende « Schéma officiel à insérer » ; l'insertion se fait à la main.

**Palette.** Le dictionnaire `PAL` du script reprend **exactement** le thème du PPT d'origine (relevé dans le fichier) :

| Rôle | Couleur | | Rôle | Couleur |
|---|---|---|---|---|
| texte, fond du code (dk1) | `10211A` | | orange (accent3) | `E9A23B` |
| séparateurs, bordure du code (dk2) | `1D3B2A` | | rouge (accent4) | `D4503F` |
| fond des diapositives (lt1) | `FFFFFF` | | bleu (accent5) | `3F7CAC` |
| fond des cartes, lignes paires (lt2) | `EEF5EF` | | violet (accent6) | `8A63D2` |
| vert principal (accent2) | `2E7D4F` | | vert clair (accent1) | `6DB33F` |

Les couleurs du code (texte `E8F0EA`, commentaires `8FA89A`, mots-clés `C3A6F5`, types `7FC1EE`) viennent de `pptx/lib.js`.

**Ce qui diffère encore du PPT d'origine** (à trancher) : les polices. L'original utilise **Cambria** pour les titres et **Courier New** pour le code ; le script utilise **Calibri** et **Consolas**, comme demandé pour cette passe. Un changement tient en une ligne : `FONT, FONT_TITLE, MONO = ...`.
