# Vidéo animée « Spring Batch » (IDE + bonnes pratiques)

* `script.md` : script de voix (format `### Scène N` + tableaux `L01…L87`), source de vérité.
* `gen.py` : lit `script.md`, **lit le code réel** de `tp/tpSpringBatchSolution` et les sorties de
  `docs/verifications/mvn_test_full.log`, puis écrit `index.html` (échoue si un motif de code est introuvable,
  si une ligne n'a pas d'action, ou si carte « bonne pratique » et expression `alerte` divergent).
* `engine.html` : moteur (IDE à onglets, code tapé ligne par ligne avec note explicative, console, schémas,
  quiz [PRÉDIRE]). Chaque bonne pratique déclenche un **signal sonore** (carillon), chaque piège un buzz grave,
  chaque mise à jour un arpège ; la carte dit **Pourquoi** et **Ce que ça nous évite**.
* `timing.json` : silences ajoutés (20 s après la question [PRÉDIRE]).

```bash
python3 video/gen.py          # régénère video/index.html
# puis ouvrir video/index.html dans un navigateur : ▶ Démarrer
```

Commandes : Espace pause · ← → beat précédent/suivant · V voix de synthèse (fr-FR, optionnelle) · M son.
Les durées sans voix sont estimées (≈ 2,5 mots/s). La voix enregistrée et le rendu vidéo final ne sont pas inclus.
