# Module 2B : Paramètres, listeners et cycle de vie d'un job

Vidéo de formation Spring Batch, complément du Module 2 (parcours complet, optionnel). Durée : environ vingt minutes (estimation du moteur), en cinq parties (2B.1 à 2B.5). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_2B_CYCLE_DE_VIE.md`, dont les classes et signatures ont été lues dans les jars (`spring-batch-core` six point zéro point six, `spring-boot-batch` quatre point un point deux). Le rappel sur RunIdIncrementer (partie 2B.2) renvoie vers l'Annexe 1 pour le détail. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des autres modules autorisées).

## Description de la voix

> Voix masculine française de France, 30-40 ans, ton de formateur proche : posé, précis, pédagogue, un peu d'humour sec. Débit régulier, pauses avant les chutes et après chaque règle à retenir. Son studio propre.

## Script

### Scène 0 : Ouverture

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L001 | calme, accroche | Un lundi matin, ton job de relevé se lance avec une date mal écrite : un O à la place d'un zéro. Il tourne vingt minutes, puis il échoue. | Terminal : date mal écrite, vingt minutes, FAILED |
| L002 | rappel | Au module un, tu as vu l'instance et les paramètres identifiants. Au module deux, tu as écrit ton premier job. | Rappels : Module 1 et Module 2 |
| L003 | pédagogue | Un job a un cycle de vie. Imagine un chantier : un videur à l'entrée, un chef de chantier, des ouvriers, et des consignes qui passent de l'un à l'autre. | Videur, chef de chantier, ouvriers, consignes |
| L004 | explicatif | Le videur, c'est le validateur de paramètres. Le chef de chantier, un listener. Les ouvriers, les steps. Les consignes, l'ExecutionContext. | Validateur, listener, steps, ExecutionContext |
| L005 | annonce | Cinq étapes : le videur, un rappel sur RunIdIncrementer, le chef de chantier, les consignes, et les outils tout faits. | Cinq pastilles 2B.1 à 2B.5 |
| L006 | pont | Commençons par le videur. | Titre « 2B.1 Le videur » |

### Scène 1 : Le videur, valider les paramètres (2B.1)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L007 | besoin | Mon besoin : refuser un lancement dont les paramètres sont faux, avant qu'il ne coûte vingt minutes. | Refuser avant de dépenser |
| L008 | technique | DefaultJobParametersValidator prend deux listes : les clés obligatoires, et les clés facultatives. | Code : `new DefaultJobParametersValidator(` |
| L009 | technique | Ici, runDate est obligatoire, et format est facultatif. | Code : `{"runDate"}` et `{"format"}` |
| L010 | attention | Attention : dès que tu déclares des clés facultatives, toute autre clé est refusée. Un paramètre inconnu fait échouer le lancement. | Autre clé : refusée |
| L011 | technique | Tu le branches sur le builder du job, avec validator. | Code : `.validator(statementValidator)` |
| L012 | explicatif | En cas de refus, tu reçois une InvalidJobParametersException, et le job n'est jamais exécuté. L'ancien nom, JobParametersInvalidException, a disparu en version six. | `InvalidJobParametersException` |
| L013 | technique | Pour une règle métier, par exemple une date au bon format, tu écris ton propre validateur : une méthode validate qui lève cette exception. | Code : `public void validate(JobParameters p)` |
| L014 | explicatif | Le builder n'accepte qu'un seul validateur. CompositeJobParametersValidator en enchaîne plusieurs. | `CompositeJobParametersValidator` |
| L015 | technique | Un mot sur l'identité. addString accepte un troisième argument : identifying. À faux, le paramètre ne compte pas dans l'identité de l'instance. Idéal pour un horodatage de traçabilité. | Code : `.addString("startedBy", user, false)` |
| L016 | défi, direct | Question. Tu oublies un paramètre obligatoire, runDate. Que fait le videur ? | Question « PRÉDIRE » |
| L017 | posé | Il refuse le lancement : InvalidJobParametersException, et aucun step ne s'exécute. | Choix « refusé » en vert |
| L018 | défi, direct | Question. Un job déclare runDate obligatoire et format facultatif. On le lance avec runDate, et un paramètre mode. Que se passe-t-il ? | Question « PRÉDIRE » |
| L019 | posé | Le lancement est refusé : mode n'est pas dans les clés autorisées. Le job ne démarre pas. | Choix « refusé » en vert |
| L020 | pont | Et si tu veux, au contraire, forcer une nouvelle instance à la demande ? Un rappel. | Titre « 2B.2 Rappel » |

### Scène 2 : Rappel, une nouvelle instance à la demande (2B.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L021 | besoin | Tu as un job de reporting à la demande. Tu veux qu'il tourne à chaque clic, même si la date métier n'a pas changé. | Reporting : un clic de plus, même date |
| L022 | défi, direct | Comment forcer une nouvelle instance, sans casser la reprise ? | La question |
| L023 | pédagogue | C'est le rôle de RunIdIncrementer. Il ajoute un paramètre run point id, qui s'incrémente tout seul. | `RunIdIncrementer` : `run.id` = 1, 2, 3 |
| L024 | explicatif | Ce paramètre est identifiant : une nouvelle valeur, une nouvelle instance. Et la reprise reste intacte, puisque le même run id désigne la même instance. | Identifiant : nouvelle valeur, nouvelle instance |
| L025 | technique | Tu le déclares avec incrementer, dans le builder du job. | Code : `.incrementer(new RunIdIncrementer())` |
| L026 | attention | Attention : il ne s'applique qu'avec startNextInstance. Avec JobOperator point start, et avec le lancement automatique de Spring Boot quatre point un, il n'est pas appelé. | `startNextInstance` oui, `start(job, params)` non |
| L027 | appuyé | Et si ton validateur liste des clés facultatives, ajoutes-y run point id : sinon il refuse ton propre incrémenteur. | Validateur : ajouter `run.id` |
| L028 | défi, direct | Question. Ton job a un RunIdIncrementer, et Spring Boot quatre point un le lance au démarrage. Le run point id est-il ajouté ? | Question « PRÉDIRE » |
| L029 | posé | Non. Le lancement automatique appelle JobOperator point start, sans incrémenteur. Pour l'avoir, tu appelles startNextInstance. | Choix « non » en vert |
| L030 | rappel | Pour le détail du hachage, de la JOB KEY et du code, regarde l'Annexe 1. | Renvoi : Annexe 1 |
| L031 | pont | Passons au chef de chantier. | Titre « 2B.3 Les listeners » |

### Scène 3 : Le chef de chantier, les listeners (2B.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L032 | besoin | Mon besoin : savoir quand le job commence et comment il a fini, sans ouvrir les journaux. | Début et fin du job |
| L033 | technique | JobExecutionListener a deux méthodes : beforeJob, avant le premier step, et afterJob, à la fin. | Code : `implements JobExecutionListener` |
| L034 | explicatif | Les deux ont une version par défaut, vide. Tu redéfinis seulement celle dont tu as besoin. | Méthodes par défaut |
| L035 | appuyé | Et afterJob est appelé quelle que soit la fin : réussite ou échec. | Appelé même après un échec |
| L036 | appuyé | D'où le test sur le statut. Sans lui, tu enverrais « terminé » après un échec. | Code : `if (e.getStatus() == BatchStatus.COMPLETED)` |
| L037 | explicatif | Les usages typiques : notifier, nettoyer des fichiers temporaires, libérer une ressource. | Notifier, nettoyer, libérer |
| L038 | technique | Tu le branches avec listener. Une classe annotée BeforeJob et AfterJob se branche de la même façon. | `.listener(...)`, `@BeforeJob`, `@AfterJob` |
| L039 | défi, direct | Question. Le job échoue au deuxième step. La méthode afterJob est-elle appelée ? | Question « PRÉDIRE » |
| L040 | posé | Oui, elle est appelée, avec le statut FAILED. C'est voulu : un job qui échoue doit aussi nettoyer. | Choix « oui, FAILED » en vert |
| L041 | appuyé | Garde ton listener court et sûr : une exception dans un listener peut perturber l'issue du job. | Listener court et sûr |
| L042 | technique | Après un échec, regarde la base. Dans batch job execution, le statut du job, FAILED, et son code de sortie. | SQL : `SELECT job_execution_id, status, exit_code FROM batch_job_execution …` |
| L043 | explicatif | Le statut que ton afterJob lit est celui que tu vois ici. Ce que tu lis dans le listener, tu peux le vérifier dans la table. | Résultat : `status = FAILED   exit_code = FAILED` |
| L044 | technique | Le step a le même mécanisme : le contremaître. beforeStep avant le step, afterStep après. | Code : `StepExecutionListener` |
| L045 | explicatif | Une différence : afterStep retourne un ExitStatus. Il peut donc changer l'issue du step. | `ExitStatus afterStep(...)` |
| L046 | pont | Reste à faire voyager une consigne d'un step à l'autre. | Titre « 2B.4 Les consignes » |

### Scène 4 : Passer une consigne d'un step à l'autre (2B.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L047 | besoin | Mon besoin : le step de chargement compte les lignes, et le step de contrôle doit connaître ce total. | Deux steps, un total à transmettre |
| L048 | explicatif | Chaque step a son carnet de notes : son ExecutionContext. Le job a le sien. | Carnet du step, carnet du job |
| L049 | appuyé | Une note écrite dans le carnet d'un step n'est pas visible des steps suivants. | Note non visible |
| L050 | pédagogue | ExecutionContextPromotionListener recopie une note du carnet du step vers le carnet du job. | Promotion : de step à job |
| L051 | technique | Tu lui donnes les clés à recopier, avec setKeys. Ici : totalLines. | Code : `listener.setKeys(new String[] {"totalLines"})` |
| L052 | technique | Et tu le branches sur le step qui écrit la note. | Code : `.listener(promotion)` |
| L053 | explicatif | Par défaut, il ne recopie que si le step a réussi. Une note d'un step échoué décrit un état incomplet. | Seulement si le step a réussi |
| L054 | appuyé | Avec setStrict à vrai, il fait échouer le step si la clé est absente. Sans cela, la valeur manque sans erreur. | `setStrict(true)` |
| L055 | technique | Voyons-le en base. Dans batch job execution context, la note du job apparaît, en JSON. | SQL : `SELECT short_context FROM batch_job_execution_context …` |
| L056 | explicatif | On y lit totalLines égal à douze mille quatre cent quatre-vingts. La note est enregistrée avec le job : elle survit à une reprise. | Résultat : `{"totalLines":12480}` |
| L057 | défi, direct | Question. Le step un écrit totalLines, sans promotion. Que lit le step deux ? | Question « PRÉDIRE » |
| L058 | posé | Null. La note est restée dans le carnet du step un. Sans promotion, personne d'autre ne la voit. | Choix « null » en vert |
| L059 | pont | Dernière partie : réutiliser des steps, et les outils tout faits. | Titre « 2B.5 Réutiliser et outils » |

### Scène 5 : Réutiliser des steps, outils tout faits, lancement (2B.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L060 | besoin | Mon besoin : réutiliser la même suite de steps dans plusieurs jobs. | Une suite de steps, plusieurs jobs |
| L061 | explicatif | Première option : un flow, passé au job. Dans le repository, les steps apparaissent comme s'ils étaient écrits dans le job. Un plan de travail photocopié. | Tableau, ligne flow |
| L062 | explicatif | Deuxième option : un FlowStep, avec StepBuilder point flow. Une ligne de plus dans le repository : le plan, avec un titre. Pratique pour le suivre comme un tout. | Tableau, ligne FlowStep |
| L063 | explicatif | Troisième option : un JobStep, avec StepBuilder point job. Le job enfant est un sous-traitant : sa propre instance, sa propre exécution. | Tableau, ligne JobStep |
| L064 | technique | Le job enfant a ses propres paramètres. DefaultJobParametersExtractor les prend dans ceux du parent. Sans extracteur, il démarre sans paramètres. | Code : `.job(preProcessingJob).parametersExtractor(...)` |
| L065 | règle | Un seul niveau de JobStep. Au-delà, tu ne peux plus suspendre un job intermédiaire sans toucher au maître. | Phrase encadrée |
| L066 | besoin | Autre besoin : un step qui appelle du code existant, sans écrire de tasklet. | Code existant |
| L067 | technique | MethodInvokingTaskletAdapter appelle une méthode d'un bean existant, une seule fois. | Tableau, ligne 1 |
| L068 | technique | CallableTaskletAdapter exécute un Callable. Mais le step attend la fin : ce n'est pas du parallélisme. | Tableau, ligne 2 |
| L069 | défi, direct | Question. CallableTaskletAdapter exécute ton code sur un autre thread. Le step avance-t-il en parallèle ? | Question « PRÉDIRE » |
| L070 | posé | Non. Le step attend la fin du Callable. Un autre thread, mais aucun gain de temps : ce n'est pas du parallélisme. | Choix « non » en vert |
| L071 | technique | SystemCommandTasklet lance une commande du système. | Tableau, ligne 3 |
| L072 | technique | En version six, tu donnes la commande en morceaux : tar, czf, le nom de l'archive, le dossier. Pas de shell, donc pas d'injection. | Code : `setCommand("tar", "czf", "archive.tgz", "export/")` |
| L073 | appuyé | Mets un timeout, sinon un processus bloqué bloque le step. Et interruptOnCancel pour l'arrêter avec le job. | Code : `setTimeout(60_000)` |
| L074 | explicatif | Le code de sortie de la commande se traduit en statut avec un SystemProcessExitCodeMapper. | Code de sortie vers statut |
| L075 | explicatif | Pour lancer le job depuis l'extérieur, Spring Boot quatre point un fournit JobLauncherApplicationRunner, et JobExecutionExitCodeGenerator pour le code de sortie du processus. | Runner et code de sortie |
| L076 | explicatif | Un cron ou un orchestrateur sait ainsi si le job a réussi. La propriété spring point batch point job point name choisit le job quand il y en a plusieurs. | `spring.batch.job.name` |

### Scène 6 : Top 10 des pièges, de un à cinq

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L077 | pédagogue | Dix pièges, avec pour chacun ce qui se passe, la parade, et comment le repérer dans les journaux ou en base. | Tableau, lignes 1 à 5 |
| L078 | appuyé | Un : un validateur qui liste des clés facultatives et oublie run point id. Le lancement est refusé. Parade : l'ajouter aux clés facultatives. | Ligne 1 |
| L079 | pédagogue | Comment le repérer : un lancement refusé dès que l'incrémenteur est actif. | Extrait indicatif : `InvalidJobParametersException … run.id` |
| L080 | appuyé | Deux : un afterJob qui annonce « terminé » sans tester le statut. Parade : tester le BatchStatus. | Ligne 2 |
| L081 | pédagogue | Comment le repérer : un message de réussite dans le journal, et un statut FAILED en base. | Extrait indicatif : `Terminé : 0 lignes   job status = FAILED` |
| L082 | appuyé | Trois : lire dans un step une note écrite dans un autre, sans promotion. Parade : ExecutionContextPromotionListener. | Ligne 3 |
| L083 | pédagogue | Comment le repérer : totalLines vaut null dans le step suivant. | Extrait indicatif : `totalLines = null` |
| L084 | appuyé | Quatre : une clé promue absente, avec setStrict à faux. La valeur manque, sans erreur. Parade : setStrict à vrai. | Ligne 4 |
| L085 | pédagogue | Comment le repérer : un contrôle qui travaille sur zéro ligne, sans qu'aucune erreur ait été levée. | Extrait indicatif : `contrôle : 0 lignes lues, aucune erreur` |
| L086 | appuyé | Cinq : un listener de job qui lève une exception. Il peut perturber l'issue du job. Parade : un listener court, les notifications dans un try catch. | Ligne 5 |
| L087 | pédagogue | Comment le repérer : une exception venue d'afterJob dans les journaux. | Extrait indicatif : `Exception in afterJob : MailException` |

### Scène 7 : Top 10 des pièges, de six à dix

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L088 | appuyé | Six : une chaîne de JobStep sur plusieurs niveaux. Impossible de suspendre un job intermédiaire. Parade : un seul niveau, ou un planificateur. | Ligne 6 |
| L089 | pédagogue | Comment le repérer : des jobs imbriqués dans batch job instance, parent, enfant, petit-enfant. | Extrait indicatif : `batch_job_instance : parentJob, childJob, grandChildJob` |
| L090 | appuyé | Sept : un JobStep sans extracteur de paramètres. Le job enfant démarre sans paramètres. Parade : DefaultJobParametersExtractor. | Ligne 7 |
| L091 | pédagogue | Comment le repérer : un refus de paramètres sur le job enfant. | Extrait indicatif : `InvalidJobParametersException : runDate manquant (job enfant)` |
| L092 | appuyé | Huit : prendre CallableTaskletAdapter pour du parallélisme. Le step attend. Parade : un split, ou un step multithread. | Ligne 8 |
| L093 | pédagogue | Comment le repérer : une durée totale égale à la somme des durées, sans aucun gain. | Extrait indicatif : `durée : 120 s = 60 s + 60 s` |
| L094 | appuyé | Neuf : un SystemCommandTasklet sans timeout. Un processus bloqué bloque le step. Parade : setTimeout. | Ligne 9 |
| L095 | pédagogue | Comment le repérer : un step en cours depuis des heures, sans progression. | Extrait indicatif : `step démarré à 02:00   toujours STARTED à 09:00` |
| L096 | appuyé | Dix : copier les anciens noms, JobParametersInvalidException ou JobBuilderFactory. Parade : les noms de la six point zéro point six. | Ligne 10 |
| L097 | pédagogue | Comment le repérer : une erreur de compilation, dès que tu copies le code d'un ancien tutoriel. | Extrait indicatif : `error: cannot find symbol   class JobParametersInvalidException` |

### Scène 8 : Bilan et exercices

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L098 | pédagogue | Reprenons notre chantier. Le videur refuse les mauvais paramètres. Le chef de chantier note le début et la fin. Le carnet transmet les consignes d'un step à l'autre. | Videur, chef de chantier, carnet |
| L099 | récapitulatif | Pour réutiliser des steps : le plan photocopié, le plan avec un titre, ou le sous-traitant. Et pour une nouvelle instance à la demande : RunIdIncrementer, et l'Annexe 1. | Flow, FlowStep, JobStep, Annexe 1 |
| L100 | défi | Cinq exercices. Un : un job déclare runDate obligatoire et format facultatif. On le lance avec runDate et mode. Que se passe-t-il, et avec un RunIdIncrementer ? | Exercice 1 |
| L101 | défi | Deux : le job échoue au deuxième step. Quelles méthodes de listener sont appelées, et que contient le statut dans afterJob ? | Exercice 2 |
| L102 | défi | Trois : le step un écrit totalLines, le step deux lit null. Qu'oublie-t-on ? Que change setStrict à vrai ? | Exercice 3 |
| L103 | défi | Quatre : quelle différence voit-on dans batch job instance entre un FlowStep et un JobStep ? | Exercice 4 |
| L104 | défi | Cinq : pourquoi donner la commande en morceaux à SystemCommandTasklet est-il plus sûr qu'une seule chaîne ? | Exercice 5 |
| L105 | pause | Prends le temps d'y réfléchir. | Compte à rebours de dix secondes |
| L106 | explicatif | Correction un. Le lancement est refusé : mode n'est pas autorisé. Avec un RunIdIncrementer, il faut aussi autoriser run point id. | Exercice 1 |
| L107 | explicatif | Correction deux. beforeJob, puis afterJob, appelé même après un échec. Le statut vaut FAILED. | Exercice 2 |
| L108 | explicatif | Correction trois. On oublie la promotion. Avec setStrict à vrai, le step échoue si la clé est absente. | Exercice 3 |
| L109 | explicatif | Correction quatre. Un FlowStep ne crée aucune nouvelle instance. Un JobStep en crée une : celle du job enfant. | Exercice 4 |
| L110 | explicatif | Correction cinq. Aucun shell n'interprète la commande : un nom de fichier piégé ne peut pas injecter de commande. | Exercice 5 |
| L111 | transition | Tu maîtrises le cycle de vie d'un job. Au module trois, tu entres dans le cœur de Spring Batch : le chunk. | Ouverture sur le Module 3 |
