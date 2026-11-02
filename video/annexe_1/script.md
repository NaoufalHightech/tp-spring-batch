# Annexe 1 : Paramètres de Job et RunIdIncrementer

Vidéo de formation Spring Batch, annexe courte, à regarder après le Module 2 (ou à tout moment). Durée visée : 6 à 8 minutes, en cinq parties. Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_1.md` (piège cinq, paramètres identifiants) et les classes de Spring Batch six point zéro point six (RunIdIncrementer, DefaultJobKeyGenerator, schéma PostgreSQL), vérifiées dans le jar. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des autres modules autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 1 : L'accroche

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Tu veux relancer ton job. Spring Batch refuse : JobInstanceAlreadyCompleteException. L'instance est déjà COMPLETED. | Terminal : `JobInstanceAlreadyCompleteException` |
| L002 | complice | Alors tu fais ce que tout le monde fait : tu ajoutes un paramètre timestamp, avec l'heure courante. Et ça marche. | Code : `.addLong("timestamp", System.currentTimeMillis())` |
| L003 | appuyé | Ça marche, oui. Et tu viens de casser la reprise. Au module un, c'était le piège numéro cinq. | Piège 5 du Module 1 en rouge |
| L004 | explicatif | Rappel. Une JobInstance, c'est un job plus ses paramètres identifiants. Le timestamp change à chaque lancement, donc chaque lancement crée une nouvelle instance. | Équation : job + paramètres = instance |
| L005 | explicatif | Ton job échoue à la ligne neuf cent mille. Tu le relances. Le timestamp a changé : nouvelle instance, et tout repart de zéro. | Deux exécutions, deux instances, reprise perdue |
| L006 | posé | Le timestamp n'est donc pas la solution. Mais ton besoin, lui, est légitime. | Besoin en orange |
| L007 | annonce | Dans cette annexe : le besoin, la solution, ce qui se passe dans la base, et le piège à repérer. Environ sept minutes. | Quatre pastilles |
| L008 | pont | Commençons par le besoin. Quand veut-on vraiment une nouvelle instance ? | Titre « Le besoin légitime » |

### Scène 2 : Le besoin légitime

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L009 | explicatif | Il existe des jobs sans identité métier. Un rapport à la demande, par exemple. Chaque demande est un nouveau travail. | Carte : rapport à la demande |
| L010 | exemple | Un client demande son relevé en PDF. Dix minutes plus tard, il le redemande. Même job, mêmes données, mais deux demandes distinctes. | Deux demandes identiques, deux PDF |
| L011 | explicatif | Autre cas : un job de nettoyage lancé toutes les heures, sans date métier. Il n'y a pas de runDate à mettre. | Carte : nettoyage horaire |
| L012 | appuyé | Dans ces cas, aucun paramètre naturel ne distingue deux lancements. Il faut en fabriquer un. | Aucun paramètre naturel : point d'interrogation |
| L013 | pédagogue | Mais pas n'importe lequel. Un compteur, simple, qui avance d'un à chaque nouvelle instance, et qui laisse la reprise intacte. | Compteur 1, 2, 3 |
| L014 | pont | Spring Batch fournit exactement ça. Voyons comment. | Titre « RunIdIncrementer » |

### Scène 3 : La solution, RunIdIncrementer

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L015 | technique | Le job s'appelle rapportClient. Le JobBuilder reçoit le nom et le JobRepository. | Code : `new JobBuilder("rapportClient", jobRepository)` |
| L016 | technique | Ensuite, un seul appel : incrementer, avec un nouveau RunIdIncrementer. Puis le premier step, comme d'habitude. | Code : `.incrementer(new RunIdIncrementer())` |
| L017 | explicatif | Que fait cet objet ? Il ajoute un paramètre nommé run point id, de type Long, et il l'augmente d'un à chaque nouvelle instance. | Paramètre `run.id` en violet |
| L018 | appuyé | Et ce paramètre est identifiant. C'est lui qui fait la différence entre deux lancements. | Étiquette « identifiant » |
| L019 | attention | Attention : l'incrémenteur ne se déclenche pas tout seul. Avec JobOperator point start et des paramètres, il n'est pas appelé. | `start(job, params)` : incrémenteur ignoré |
| L020 | technique | Il intervient quand tu demandes la prochaine instance : JobOperator point startNextInstance. Spring Batch prend les derniers paramètres, appelle l'incrémenteur, et lance. | Code : `jobOperator.startNextInstance(job)` |
| L021 | défi, direct | Question. Base vide, premier lancement avec startNextInstance. Quelle valeur prend run point id ? | Question « PRÉDIRE » |
| L022 | posé | Un. L'incrémenteur part de zéro quand le paramètre n'existe pas, et ajoute un. Puis deux, puis trois. | Compteur 1 en vert |
| L023 | pont | Mais comment Spring Batch sait-il que c'est une nouvelle instance ? Ouvrons la base. | Titre « Sous le capot » |

### Scène 4 : Sous le capot, la JOB_KEY

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L024 | explicatif | Dans la table batch_job_instance, chaque instance a un nom de job et une colonne job_key. | Table `batch_job_instance` |
| L025 | technique | La job_key est une empreinte de trente-deux caractères, un hachage MD5 des paramètres identifiants, triés par nom. | Calcul : paramètres identifiants → MD5 → clé |
| L026 | appuyé | Seuls les paramètres identifiants entrent dans le calcul. Un paramètre non identifiant ne change jamais la clé. | Paramètre non identifiant barré |
| L027 | explicatif | Il existe une contrainte d'unicité sur le couple job_name et job_key. Même nom, même clé : même instance. | Contrainte `unique(job_name, job_key)` |
| L028 | technique | Avec run point id égal à un, on obtient une clé. Avec run point id égal à deux, une autre clé, donc une nouvelle ligne. | Deux lignes, deux clés différentes |
| L029 | technique | Les valeurs elles-mêmes sont dans batch_job_execution_params : le nom, le type, la valeur, et une colonne identifying. | Table `batch_job_execution_params` : run.id = 1, run.id = 2 |
| L030 | explicatif | Dans Spring Batch six, ces colonnes s'appellent parameter_name, parameter_type et parameter_value. Les anciens tutoriels parlent de key_name et type_cd. | Anciens noms barrés |
| L031 | pont | Maintenant que tu sais où chercher, voyons le piège, directement en base. | Titre « Le piège en base » |

### Scène 5 : Le piège en base de données

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L032 | explicatif | Tu hérites d'un batch en production. Tu veux savoir si quelqu'un a mis un horodatage en paramètre identifiant. Une seule requête suffit. | Terminal : psql |
| L033 | technique | Tu sélectionnes les paramètres de la table batch_job_execution_params, uniquement ceux où identifying vaut Y. | SQL : `SELECT … WHERE identifying = 'Y'` |
| L034 | explicatif | Voici un résultat sain. runDate, de type LocalDate, vaut deux mille vingt-six, onze, un, aux deux exécutions. | Lignes 41 et 42 : `runDate` en vert |
| L035 | explicatif | Même valeur, donc une seule instance, deux exécutions : le premier essai a échoué, la reprise a réussi. C'est exactement ce qu'on veut. | Une instance, deux exécutions |
| L036 | appuyé | Et voici le problème. Un paramètre timestamp, de type Long, avec treize chiffres. Et une autre valeur à l'exécution suivante. | Lignes 43 et 44 : `timestamp` en rouge |
| L037 | appuyé | Treize chiffres, c'est un nombre de millisecondes depuis mille neuf cent soixante-dix. Une valeur qui ne se répète jamais ne peut pas servir d'identité. | Zoom sur 1793491200000 |
| L038 | pédagogue | Comment le reconnaître vite ? Un nom comme timestamp, now ou runTime, un type Long, et une valeur différente à chaque ligne. | Trois signaux d'alerte |
| L039 | posé | Comparé à un runDate, qui est lisible, qui a un sens métier, et qui se répète lors d'une reprise. | Comparaison côte à côte |
| L040 | pont | Reste un dernier piège, qui touche la reprise elle-même. | Titre « Reprise et validation » |

### Scène 6 : Reprise et validation

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L041 | défi, direct | Question. Ton job a échoué avec run point id égal à trois. Tu veux le reprendre, sans repartir de zéro. Quel run point id utilises-tu ? | Question « PRÉDIRE » |
| L042 | posé | Le même, trois. Avec quatre, tu crées une nouvelle instance et tu repars de zéro. Avec restart sur l'identifiant d'exécution, Spring Batch reprend les paramètres tout seul. | Instance 3 en vert, instance 4 en rouge |
| L043 | appuyé | Autre piège classique. Tu ajoutes un validateur de paramètres, avec une liste de clés autorisées. Tu oublies run point id. | `DefaultJobParametersValidator` : liste fermée |
| L044 | explicatif | Résultat : le lancement est refusé, parce que run point id n'est pas dans les clés optionnelles. Le validateur dit non à ton propre incrémenteur. | Rejet du paramètre `run.id` |
| L045 | technique | Tu l'ajoutes aux clés optionnelles, et le lancement repasse. Une ligne, mais il faut y penser. | Code : `optionalKeys = {"run.id"}` |
| L046 | pont | Récapitulons, avec une règle de décision. | Titre « La règle » |

### Scène 7 : La règle et la clôture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L047 | pédagogue | Premier cas : ton job a une identité métier, une date, un client, un fichier. Tu utilises ce paramètre métier. C'est la règle du module un. | Cas 1 : paramètre métier |
| L048 | pédagogue | Deuxième cas : le job n'a aucune identité métier, et chaque lancement est une demande distincte. Tu utilises RunIdIncrementer. | Cas 2 : `RunIdIncrementer` |
| L049 | appuyé | Jamais un timestamp comme paramètre identifiant. Si tu veux garder l'heure pour la traçabilité, mets-la en paramètre non identifiant. | Timestamp barré, version non identifiante en vert |
| L050 | posé | Trois réflexes à retenir. Une instance égale un job plus ses paramètres identifiants. L'incrémenteur n'agit qu'avec startNextInstance. Et pour reprendre, on garde le même run point id. | Trois pastilles |
| L051 | calme | Tu retrouveras le contexte dans les modules un et deux, et la reprise en détail au module six. | Rappels vers les Modules 1, 2 et 6 |
| L052 | léger, conclusion | Voilà pour cette annexe. La prochaine fois que ton job refuse de se relancer, tu sauras quoi regarder avant d'ajouter un timestamp. | Fin : « Annexe 1 terminée » |
