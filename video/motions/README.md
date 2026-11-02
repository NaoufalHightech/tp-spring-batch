# Vidéos du cours sur le moteur « motions »

Un dossier par module : `m1_fondations/` (Module 1), puis `m2_…`, etc.

Chaque dossier contient ce que le moteur motions attend d'un épisode : `script.md` (voix et écrans, source de vérité), `script.json` (extrait par `tools/parse_script.py`), puis `scenes.js`, `index.html`, `timing.json` quand les animations sont écrites.

## Utilisation

Le moteur (`engine.js`, `shared.js`, `player.js`, `tools/`) vit dans le dépôt motions. Copier le dossier du module dans `motions/episodes/`, puis suivre `docs/RENDU_LOCAL.md` de ce dépôt :

```bash
./tools/new_episode.sh episodes/m1_fondations "Module 1" "SPRING BATCH // M1"   # squelette scenes.js
./tools/check_scenes.sh episodes/m1_fondations                                  # ancres, rendu, planches
python tools/voxtral_local.py episodes/m1_fondations                            # voix
./make_episode.sh episodes/m1_fondations m1_fondations 16                       # MP4
```

## Avancement

| Module | script.md | scenes.js | voix | rendu |
|---|---|---|---|---|
| 1 | écrit : 298 lignes, 46 min estimées | écrit : 21 scènes, vérifié (ancres, rendu sans erreur) | à faire | à faire |
| 2 | écrit : 231 lignes, ≈ 36 min estimées | écrit : 13 scènes, vérifié | à faire | à faire |
| 3 | écrit : 223 lignes, ≈ 33 min estimées | écrit : 14 scènes, vérifié | à faire | à faire |
| 3B | écrit : 132 lignes, ≈ 20 min estimées | écrit : 9 scènes, vérifié | à faire | à faire |
| 4 | écrit : 151 lignes, ≈ 22 min estimées | écrit : 13 scènes, vérifié | à faire | à faire |
| 5 | écrit : 158 lignes, ≈ 22 min estimées | écrit : 11 scènes, vérifié | à faire | à faire |
| 6 à 8 | à faire | | | |
