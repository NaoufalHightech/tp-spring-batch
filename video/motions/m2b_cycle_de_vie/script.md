# Module 2B : Paramètres, listeners et cycle de vie d'un job

Vidéo de formation Spring Batch, complément du Module 2 (parcours complet, optionnel). Durée : environ douze minutes (estimation du moteur), en cinq parties (2B.1 à 2B.5). Pile : Java vingt-cinq, Spring Boot quatre point un point deux, Spring Batch six point zéro point six, PostgreSQL seize. Source de vérité : `support/modules/MODULE_2B_CYCLE_DE_VIE.md`, dont les classes et signatures ont été lues dans les jars (`spring-batch-core` six point zéro point six, `spring-boot-batch` quatre point un point deux). Le rappel sur RunIdIncrementer (partie 2B.2) renvoie vers l'Annexe 1 pour le détail. Règles : `docs/STYLE.md` du dépôt motions, avec les réglages du projet (tutoiement, voix fr_male, annonces des autres modules autorisées).

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
| L015 | défi, direct | Question. Un job déclare runDate obligatoire et format facultatif. On le lance avec runDate, et un paramètre mode. Que se passe-t-il ? | Question « PRÉDIRE » |
| L016 | posé | Le lancement est refusé : mode n'est pas dans les clés autorisées. Le job ne démarre pas. | Choix « refusé » en vert |
| L017 | pont | Et si tu veux, au contraire, forcer une nouvelle instance à la demande ? Un rappel. | Titre « 2B.2 Rappel » |

### Scène 2 : Rappel, une nouvelle instance à la demande (2B.2)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L018 | besoin | Tu as un job de reporting à la demande. Tu veux qu'il tourne à chaque clic, même si la date métier n'a pas changé. | Reporting : un clic de plus, même date |
| L019 | défi, direct | Comment forcer une nouvelle instance, sans casser la reprise ? | La question |
| L020 | pédagogue | C'est le rôle de RunIdIncrementer. Il ajoute un paramètre run point id, qui s'incrémente tout seul. | `RunIdIncrementer` : `run.id` = 1, 2, 3 |
| L021 | explicatif | Ce paramètre est identifiant : une nouvelle valeur, une nouvelle instance. Et la reprise reste intacte, puisque le même run id désigne la même instance. | Identifiant : nouvelle valeur, nouvelle instance |
| L022 | technique | Tu le déclares avec incrementer, dans le builder du job. | Code : `.incrementer(new RunIdIncrementer())` |
| L023 | attention | Attention : il ne s'applique qu'avec startNextInstance. Avec JobOperator point start, et avec le lancement automatique de Spring Boot quatre point un, il n'est pas appelé. | `startNextInstance` oui, `start(job, params)` non |
| L024 | appuyé | Et si ton validateur liste des clés facultatives, ajoutes-y run point id : sinon il refuse ton propre incrémenteur. | Validateur : ajouter `run.id` |
| L025 | rappel | Pour les détails, le code et la requête SQL, regarde l'Annexe 1. | Renvoi : Annexe 1 |
| L026 | pont | Passons au chef de chantier. | Titre « 2B.3 Les listeners » |

### Scène 3 : Le chef de chantier, les listeners (2B.3)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L027 | besoin | Mon besoin : savoir quand le job commence et comment il a fini, sans ouvrir les journaux. | Début et fin du job |
| L028 | technique | JobExecutionListener a deux méthodes : beforeJob, avant le premier step, et afterJob, à la fin. | Code : `implements JobExecutionListener` |
| L029 | explicatif | Les deux ont une version par défaut, vide. Tu redéfinis seulement celle dont tu as besoin. | Méthodes par défaut |
| L030 | appuyé | Et afterJob est appelé quelle que soit la fin : réussite ou échec. | Appelé même après un échec |
| L031 | appuyé | D'où le test sur le statut. Sans lui, tu enverrais « terminé » après un échec. | Code : `if (e.getStatus() == BatchStatus.COMPLETED)` |
| L032 | explicatif | Les usages typiques : notifier, nettoyer des fichiers temporaires, libérer une ressource. | Notifier, nettoyer, libérer |
| L033 | technique | Tu le branches avec listener. Une classe annotée BeforeJob et AfterJob se branche de la même façon. | `.listener(...)`, `@BeforeJob`, `@AfterJob` |
| L034 | défi, direct | Question. Le job échoue au deuxième step. La méthode afterJob est-elle appelée ? | Question « PRÉDIRE » |
| L035 | posé | Oui, elle est appelée, avec le statut FAILED. C'est voulu : un job qui échoue doit aussi nettoyer. | Choix « oui, FAILED » en vert |
| L036 | appuyé | Garde ton listener court et sûr : une exception dans un listener peut perturber l'issue du job. | Listener court et sûr |
| L037 | technique | Le step a le même mécanisme : le contremaître. beforeStep avant le step, afterStep après. | Code : `StepExecutionListener` |
| L038 | explicatif | Une différence : afterStep retourne un ExitStatus. Il peut donc changer l'issue du step. | `ExitStatus afterStep(...)` |
| L039 | pont | Reste à faire voyager une consigne d'un step à l'autre. | Titre « 2B.4 Les consignes » |

### Scène 4 : Passer une consigne d'un step à l'autre (2B.4)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L040 | besoin | Mon besoin : le step de chargement compte les lignes, et le step de contrôle doit connaître ce total. | Deux steps, un total à transmettre |
| L041 | explicatif | Chaque step a son carnet de notes : son ExecutionContext. Le job a le sien. | Carnet du step, carnet du job |
| L042 | appuyé | Une note écrite dans le carnet d'un step n'est pas visible des steps suivants. | Note non visible |
| L043 | pédagogue | ExecutionContextPromotionListener recopie une note du carnet du step vers le carnet du job. | Promotion : de step à job |
| L044 | technique | Tu lui donnes les clés à recopier, avec setKeys. Ici : totalLines. | Code : `listener.setKeys(new String[] {"totalLines"})` |
| L045 | technique | Et tu le branches sur le step qui écrit la note. | Code : `.listener(promotion)` |
| L046 | explicatif | Par défaut, il ne recopie que si le step a réussi. Une note d'un step échoué décrit un état incomplet. | Seulement si le step a réussi |
| L047 | appuyé | Avec setStrict à vrai, il fait échouer le step si la clé est absente. Sans cela, la valeur manque sans erreur. | `setStrict(true)` |
| L048 | défi, direct | Question. Le step un écrit totalLines, sans promotion. Que lit le step deux ? | Question « PRÉDIRE » |
| L049 | posé | Null. La note est restée dans le carnet du step un. Sans promotion, personne d'autre ne la voit. | Choix « null » en vert |
| L050 | pont | Dernière partie : réutiliser des steps, et les outils tout faits. | Titre « 2B.5 Réutiliser et outils » |

### Scène 5 : Réutiliser des steps, outils tout faits, lancement (2B.5)

| N° | Expression | Texte | Écran |
|---|---|---|---|
| L051 | besoin | Mon besoin : réutiliser la même suite de steps dans plusieurs jobs. | Une suite de steps, plusieurs jobs |
| L052 | explicatif | Première option : un flow, passé au job. Dans le repository, les steps apparaissent comme s'ils étaient écrits dans le job. Un plan de travail photocopié. | Tableau, ligne flow |
| L053 | explicatif | Deuxième option : un FlowStep, avec StepBuilder point flow. Une ligne de plus dans le repository : le plan, avec un titre. Pratique pour le suivre comme un tout. | Tableau, ligne FlowStep |
| L054 | explicatif | Troisième option : un JobStep, avec StepBuilder point job. Le job enfant est un sous-traitant : sa propre instance, sa propre exécution. | Tableau, ligne JobStep |
| L055 | technique | Le job enfant a ses propres paramètres. DefaultJobParametersExtractor les prend dans ceux du parent. Sans extracteur, il démarre sans paramètres. | Code : `.job(preProcessingJob).parametersExtractor(...)` |
| L056 | règle | Un seul niveau de JobStep. Au-delà, tu ne peux plus suspendre un job intermédiaire sans toucher au maître. | Phrase encadrée |
| L057 | besoin | Autre besoin : un step qui appelle du code existant, sans écrire de tasklet. | Code existant |
| L058 | technique | MethodInvokingTaskletAdapter appelle une méthode d'un bean existant, une seule fois. | Tableau, ligne 1 |
| L059 | technique | CallableTaskletAdapter exécute un Callable. Mais le step attend la fin : ce n'est pas du parallélisme. | Tableau, ligne 2 |
| L060 | technique | SystemCommandTasklet lance une commande du système. | Tableau, ligne 3 |
| L061 | technique | En version six, tu donnes la commande en morceaux : tar, czf, le nom de l'archive, le dossier. Pas de shell, donc pas d'injection. | Code : `setCommand("tar", "czf", "archive.tgz", "export/")` |
| L062 | appuyé | Mets un timeout, sinon un processus bloqué bloque le step. Et interruptOnCancel pour l'arrêter avec le job. | Code : `setTimeout(60_000)` |
| L063 | explicatif | Le code de sortie de la commande se traduit en statut avec un SystemProcessExitCodeMapper. | Code de sortie vers statut |
| L064 | explicatif | Pour lancer le job depuis l'extérieur, Spring Boot quatre point un fournit JobLauncherApplicationRunner, et JobExecutionExitCodeGenerator pour le code de sortie du processus. | Runner et code de sortie |
| L065 | explicatif | Un cron ou un orchestrateur sait ainsi si le job a réussi. La propriété spring point batch point job point name choisit le job quand il y en a plusieurs. | `spring.batch.job.name` |
| L066 | pédagogue | Récapitulons les pièges. Un : run point id oublié dans le validateur. Deux : afterJob sans tester le statut. | Pièges 1 et 2 |
| L067 | pédagogue | Trois : une note qu'on oublie de promouvoir. Quatre : un JobStep sans extracteur de paramètres. | Pièges 3 et 4 |
| L068 | pédagogue | Cinq : un SystemCommandTasklet sans timeout. Six : copier les anciens noms, JobParametersInvalidException ou JobBuilderFactory. | Pièges 5 et 6 |
| L069 | rappel | Les exercices du module écrit reprennent ces cas. | Exercices 1 à 5 |
| L070 | transition | Tu maîtrises le cycle de vie d'un job. Au module trois, tu entres dans le cœur de Spring Batch : le chunk. | Ouverture sur le Module 3 |
