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
| 1 | à valider | à faire | à faire | à faire |
| 2 à 8, 3B | à faire | | | |
