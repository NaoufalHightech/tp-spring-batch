'use strict';
// Partie 3 : flux, parallélisme, fiabilité, tests, supervision
const { pres, C, SH, slide, N, title, card, box, arrow, label, chip, tbl, code, snip, SOL, SOLT, ROOT } = require('./lib');

module.exports = function () {
  const S5 = '5 · Flux et parallélisme', S6 = '6 · Fiabilité et tests';
  const noCom = a => a.filter(l => !l.trim().startsWith('//') || l.trim() === '// …');

  slide('SECTION', S5, "Cinquième partie : enchaîner des steps, choisir la suite selon un résultat, et exécuter en parallèle.", 'push', sl => {
    sl.addText('5 · Flux et parallélisme', { placeholder: 'title' });
    sl.addText('Enchaînements, decider, flows parallèles, partitions', { placeholder: 'sub' });
  });

  // ---------------------------------------------------------------- enchaînements
  slide('CONTENU', S5, "Un job peut enchaîner plusieurs steps : on démarre par un step et on ajoute les suivants avec next. Si un job contient des centaines de steps, il faut se demander s'il ne faut pas les regrouper. On peut aussi choisir la suite selon le résultat d'un step : si le résultat est complété, on va vers le step B ; en cas d'échec, vers le step C. Et on peut construire les steps dans une boucle à partir d'une liste. Cette forme est celle du cours du formateur.", 'fade', sl => {
    title(sl, 'Enchaîner les steps : séquence et conditions');
    box(sl, 0.6, 2.6, 1.9, 1.0, 'Step A', { col: C.accent2, size: 20, g: 1 });
    box(sl, 4.6, 1.8, 1.9, 1.0, 'Step B', { col: C.accent5, size: 20, g: 2 });
    box(sl, 4.6, 3.6, 1.9, 1.0, 'Step C', { col: C.accent4, size: 20, g: 3 });
    arrow(sl, 2.5, 3.0, 4.6, 2.3, { g: 2, col: C.accent2 }); arrow(sl, 2.5, 3.2, 4.6, 4.1, { g: 3, col: C.accent4 });
    label(sl, 'COMPLETED', 2.9, 2.2, 1.7, 0.35, { size: 13, bold: true, col: C.accent2, g: 2 }); label(sl, 'FAILED', 3.2, 3.95, 1.2, 0.35, { size: 13, bold: true, col: C.accent4, g: 3 });
    code(sl, 7.0, 1.6, 5.7, 3.0, ['jobBuilder.start(stepA)', '    .on("COMPLETED").to(stepB)', '    .from(stepA).on("FAILED").to(stepC)', '    .end()', '    .build();'],
      { title: 'flux conditionnel (cours du formateur)', size: 13, steps: [[0, 1, 2], [2, 2, 3], [3, 4, 3]] });
    code(sl, 0.6, 4.95, 12.1, 1.0, ['jobBuilder.start(step1).next(step2).next(step3).build();   // séquence simple'], { title: 'séquence', size: 14, steps: [[0, 0, 4]] });
    label(sl, '« COMPLETED WITH SKIPS » : un step terminé avec des lignes ignorées peut être aiguillé ailleurs.', 0.6, 6.15, 12.1, 0.4, { size: 14, italic: true, col: C.text2, g: 4 });
  });

  // ---------------------------------------------------------------- decider
  slide('CONTENU', S5, "Pour une logique d'aiguillage plus riche, on utilise un decider. Il reçoit la dernière step execution, lit par exemple un compteur dans son contexte, et retourne un statut libre. Dans le TP, si le nombre de prix modifiés atteint le seuil, le statut est completed with many updated, et le job enchaîne sur un step de statistiques. Attention : si aucun produit n'est modifié, le compteur est absent et la comparaison déclenche une erreur de pointeur nul. C'est lu dans le code, non exécuté.", 'fade', sl => {
    title(sl, 'Le decider : aiguiller selon un résultat');
    code(sl, 0.6, 1.6, 6.9, 2.5, noCom(snip(SOL + 'decider/MyUpdatedCountCheckingDecider.java', [['Integer nbAjustedProducts', 'getExitCode().toString()']])),
      { title: 'MyUpdatedCountCheckingDecider.java (extrait)', size: 12, steps: [[0, 1, 1], [2, 5, 2]] });
    code(sl, 0.6, 4.3, 6.9, 2.25, snip(SOL + 'job/java/IncreaseProductPriceInDbJobConfig.java', [['return builder.start(step1)', '.end()']]),
      { title: 'IncreaseProductPriceInDbJobConfig.java', size: 12, steps: [[0, 4, 3]] });
    card(sl, 7.9, 1.6, 4.8, 1.5, { head: 'Un statut libre', body: 'COMPLETED_WITH_MANY_UPDATED ou COMPLETED.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 7.9, 3.25, 4.8, 1.5, { head: 'Aiguillage', body: 'Chaque statut mène à un step : messages, puis statistiques CSV.', col: C.accent5, hs: 17, bs: 14, g: 3 });
    card(sl, 7.9, 4.9, 4.8, 1.65, { head: 'Piège (lu, non exécuté)', body: 'Compteur absent (aucun produit modifié) : null déboxé, erreur.', col: C.accent4, hs: 17, bs: 14, g: 4 });
  });

  // ---------------------------------------------------------------- flows parallèles
  slide('CONTENU', S5, "Pour exécuter des steps en parallèle, on les regroupe dans des flows, et on lance les flows ensemble avec un exécuteur de tâches asynchrone : c'est le split. Quand les flows sont terminés, on enchaîne sur le step suivant. Dans notre exemple exécuté, le flow un exécute les steps un et deux dans un thread, le flow deux exécute le step trois dans un autre thread, et le step quatre s'exécute après, dans le thread principal. La différence avec les partitions : ici ce sont des steps différents qui s'exécutent en parallèle.", 'fade', sl => {
    title(sl, 'Flows en parallèle (split)');
    box(sl, 0.6, 1.7, 1.6, 0.8, 'step1', { col: C.accent2, g: 1 }); box(sl, 2.6, 1.7, 1.6, 0.8, 'step2', { col: C.accent2, g: 1 }); box(sl, 0.6, 3.1, 1.6, 0.8, 'step3', { col: C.accent5, g: 2 });
    arrow(sl, 2.2, 2.1, 2.6, 2.1, { g: 1 });
    sl.addShape(SH.roundRect, { x: 0.45, y: 1.55, w: 3.9, h: 1.1, fill: { type: 'none' }, line: { color: C.accent2, width: 1.75, dashType: 'dash' }, rectRadius: 0.1, objectName: N(1) });
    sl.addShape(SH.roundRect, { x: 0.45, y: 2.95, w: 3.9, h: 1.1, fill: { type: 'none' }, line: { color: C.accent5, width: 1.75, dashType: 'dash' }, rectRadius: 0.1, objectName: N(2) });
    label(sl, 'flow1', 3.3, 1.62, 1.0, 0.3, { size: 12, bold: true, col: C.accent2, g: 1 }); label(sl, 'flow2', 3.3, 3.02, 1.0, 0.3, { size: 12, bold: true, col: C.accent5, g: 2 });
    box(sl, 0.6, 4.55, 3.6, 0.8, 'step4 (après les deux flows)', { col: C.accent3, dark: true, size: 14, g: 3 }); arrow(sl, 2.4, 4.05, 2.4, 4.55, { g: 3 });
    code(sl, 4.9, 1.6, 7.8, 3.6, snip(SOL + 'job/java/ParallelFlowsJobConfig.java', [['Flow flow1 = new FlowBuilder', 'Flow flow1 = new FlowBuilder'], ['Flow flow2 = new FlowBuilder', 'Flow flow2 = new FlowBuilder'], ['return new JobBuilder("parallelFlowsJob"', '.build();']], { sep: '' }),
      { title: 'ParallelFlowsJobConfig.java (exécuté)', size: 12, steps: [[0, 1, 1], [2, 11, 3]] });
    sl.addText([{ text: 'Sortie réelle :  ', options: { bold: true, color: C.accent1 } }, { text: 'step3 → flows-1 · step1, step2 → flows-2 · step4 → main', options: { color: C.background1 } }],
      { x: 4.9, y: 5.4, w: 7.8, h: 0.55, shape: SH.roundRect, rectRadius: 0.07, fill: { color: C.text1 }, fontFace: 'Courier New', fontSize: 13, valign: 'middle', margin: 8, isTextBox: true, objectName: N(4) });
    label(sl, 'Partition = le MÊME step sur des plages de données différentes.', 0.6, 6.2, 12, 0.4, { size: 15, bold: true, col: C.text2, g: 5 });
  });

  // ---------------------------------------------------------------- partitions
  slide('CONTENU', S5, "Avec les partitions, un step manager découpe le travail et des workers l'exécutent en parallèle, chacun avec un thread. Le partitioner crée une plage d'identifiants par partition, avec from et to dans un contexte d'exécution propre à chaque worker. Le reader de chaque worker lit sa plage. Il doit être sûr entre threads : un reader paginé en step scope, pas un curseur partagé.", 'fade', sl => {
    title(sl, 'Partitions : le même step, des plages différentes');
    box(sl, 3.9, 1.6, 2.6, 0.9, 'managerStep', { sub: 'Partitioner', col: C.accent5, size: 17, g: 1 });
    [0, 1, 2, 3].forEach(i => { box(sl, 0.6 + i * 1.65, 3.4, 1.5, 1.0, `worker ${i + 1}`, { sub: `plage ${i + 1}`, col: C.accent2, size: 14, subSize: 12, g: 2 }); arrow(sl, 5.2, 2.5, 1.35 + i * 1.65, 3.4, { g: 2, col: C.accent5 }); });
    box(sl, 0.6, 4.85, 6.45, 0.7, 'table : plages d\'id disjointes, aucun doublon', { col: C.text2, size: 14, g: 3 });
    code(sl, 7.4, 1.6, 5.3, 3.9, noCom(snip(SOL + 'partitionner/NumericColumnRangePartitioner.java', [['ExecutionContext partitionExecutionContext', 'partitionExecutionContext.putInt("to", to);']])).map(l => l.replace('partitionExecutionContext', 'ctx')),
      { title: 'NumericColumnRangePartitioner.java', size: 12, steps: [[0, 3, 2]] });
    card(sl, 0.6, 5.8, 6.45, 0.95, { head: 'À valider avant de lancer', body: 'Partitions sans trou, chacune limitée à sa plage.', col: C.accent3, hs: 15, bs: 13, g: 4 });
    card(sl, 7.4, 5.8, 5.3, 0.95, { head: 'Reader : paginé, @StepScope', body: 'Jamais un curseur partagé.', col: C.accent4, hs: 15, bs: 13, g: 4 });
  });

  // ================================================================= 6. fiabilité
  slide('SECTION', S6, "Sixième partie : rendre le batch fiable. Ignorer certaines erreurs, retenter, reprendre, tester et superviser.", 'push', sl => {
    sl.addText('6 · Fiabilité et tests', { placeholder: 'title' });
    sl.addText('Skip, retry, restart, tests, lancement et supervision', { placeholder: 'sub' });
  });

  slide('CONTENU', S6, "Le skip : on ignore certaines erreurs, jusqu'à une limite. Fault tolerant active la tolérance, skip limit borne le nombre de lignes ignorées, et on cible l'exception : ici les erreurs de lecture. Un listener trace chaque ligne ignorée. Sortie réelle : deux lignes ignorées, et le job termine. Bonne pratique : borner le skip, cibler l'exception, tracer.", 'fade', sl => {
    title(sl, 'Skip : ignorer certaines erreurs');
    code(sl, 0.6, 1.6, 7.3, 2.45, snip(SOL + 'job/java/ProductsWithDetailsCsvToDbJobWithSkipsConfig.java', [['.<ProductWithDetails, ProductWithDetails>chunk(5', '.build();']]),
      { title: 'ProductsWithDetailsCsvToDbJobWithSkipsConfig.java', size: 12, steps: [[0, 2, 1], [3, 3, 2], [4, 5, 3]] });
    code(sl, 0.6, 4.25, 7.3, 1.35, snip(SOL + 'listener/MySkippedErrorsListener.java', [['public void onSkipInRead', 'System.err.println("SKIPPED_READ_ERROR:" + t.getMessage());']]),
      { title: 'MySkippedErrorsListener.java', size: 12, steps: [[0, 2, 2]] });
    sl.addText([{ text: 'SKIPPED_READ_ERROR : ligne 3, input=[LINE_WITH_ERROR]', options: { color: C.accent1, breakLine: true } }, { text: 'SKIPPED_READ_ERROR : ligne 5, input=[LINE_WITH_ERROR]', options: { color: C.accent1 } }],
      { x: 0.6, y: 5.75, w: 7.3, h: 0.85, shape: SH.roundRect, rectRadius: 0.07, fill: { color: C.text1 }, fontFace: 'Courier New', fontSize: 12, valign: 'middle', margin: 8, isTextBox: true, objectName: N(3) });
    card(sl, 8.3, 1.6, 4.4, 1.4, { head: 'faultTolerant()', body: 'Active la tolérance aux erreurs.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 8.3, 3.15, 4.4, 1.4, { head: 'skipLimit(5) + skip(...)', body: 'Borner, et cibler l\'exception.', col: C.accent5, hs: 17, bs: 14, g: 2 });
    card(sl, 8.3, 4.7, 4.4, 1.9, { head: 'Évite', body: 'Un job qui s\'arrête pour une ligne, ou des données perdues en silence : on trace chaque skip.', col: C.accent4, hs: 17, bs: 14, g: 4 });
  });

  slide('CONTENU', S6, "Le retry : on retente une opération qui échoue pour une raison transitoire, par exemple un verrou en base. On fixe un nombre de tentatives et les exceptions concernées, avec éventuellement une pause exponentielle entre deux tentatives. Depuis la version deux point deux, le retry est dans la bibliothèque Spring Retry. Dans la version six, il s'appuie sur Spring Framework sept. Cette forme vient du cours et n'a pas été exécutée ici.", 'fade', sl => {
    title(sl, 'Retry : retenter les erreurs transitoires');
    code(sl, 0.6, 1.6, 7.6, 3.4, ['stepBuilder', '    .<Person, Person>chunk(5, batchTxManager)', '    .reader(reader).processor(processor).writer(writer)', '    .faultTolerant()', '    //.backOffPolicy(new ExponentialBackOffPolicy())', '    .retryLimit(3).retry(MyProcessException.class)', '    .build();'],
      { title: 'retry (d\'après le cours)', size: 13, steps: [[0, 2, 1], [3, 3, 2], [4, 5, 3]] });
    card(sl, 8.6, 1.6, 4.1, 1.45, { head: 'retryLimit(3)', body: 'Trois tentatives au total.', col: C.accent2, hs: 17, bs: 14, g: 3 });
    card(sl, 8.6, 3.2, 4.1, 1.45, { head: 'BackOffPolicy', body: 'Aucune pause (défaut) ou exponentielle.', col: C.accent5, hs: 17, bs: 14, g: 3 });
    card(sl, 8.6, 4.8, 4.1, 1.7, { head: 'Attention', body: 'Une exception retentée ne doit pas être non skippable ; le cours signale un piège en configuration Java.', col: C.accent4, hs: 15, bs: 13, g: 4 });
    chip(sl, 'Non exécuté ici', 0.6, 5.3, 2.4, { col: C.accent3, dark: true, size: 14, g: 3 });
  });

  slide('CONTENU', S6, "La reprise, ou restart. Pour qu'un job redémarre, deux conditions : un redémarrage explicitement demandé, et un statut de step, le batch status et non l'exit status, qui est failed ou stopped. Les steps déjà réussis ne sont pas rejoués, sauf si on le demande. Le start limit borne le nombre de démarrages. Dans le dépôt, un listener force le statut stopped pour la démonstration.", 'fade', sl => {
    title(sl, 'Restart : reprendre là où ça s\'est arrêté');
    code(sl, 0.6, 1.6, 7.3, 2.1, snip(SOL + 'listener/MyStoppedForRestartExecutionListener.java', [['public ExitStatus afterStep', 'BatchStatus batchStatus'], ['stepExecution.setStatus(batchStatus);', 'return StepExecutionListener.super.afterStep(stepExecution);']]),
      { title: 'MyStoppedForRestartExecutionListener.java', size: 12, steps: [[0, 4, 1]] });
    code(sl, 0.6, 3.9, 7.3, 1.1, snip(SOL + 'job/java/ProductsWithDetailsCsvToDbJobWithRestartableConfig.java', [['.startLimit(3)', '.listener(new MyStoppedForRestartExecutionListener())']]), { title: 'step redémarrable', size: 12, steps: [[0, 1, 2]] });
    card(sl, 8.3, 1.6, 4.4, 1.45, { head: '1 · Demande explicite', body: 'JobOperator.restart(execution) ou relance avec les mêmes paramètres.', col: C.accent2, hs: 16, bs: 13, g: 1 });
    card(sl, 8.3, 3.2, 4.4, 1.45, { head: '2 · BatchStatus', body: 'FAILED ou STOPPED : pas l\'ExitStatus.', col: C.accent4, hs: 16, bs: 14, g: 1 });
    card(sl, 8.3, 4.8, 4.4, 1.7, { head: 'Options', body: 'startLimit(n) : borner les démarrages. allowStartIfComplete : rejouer un step réussi.', col: C.accent3, hs: 16, bs: 13, g: 2 });
    label(sl, 'Constaté : TestFromDetailsCsvToDbWithRestartableJob échoue exprès (fichier en erreur, step sans skip).', 0.6, 5.25, 7.3, 0.9, { size: 13, italic: true, col: C.text2, g: 2 });
  });

  slide('CONTENU', S6, "Les tests. Avec SpringBatchTest, on dispose d'un JobLauncherTestUtils. Une classe abstraite lance le job avec des paramètres, vérifie le nom et le code de sortie completed, puis appelle un hook de contrôle supplémentaire. On peut aussi tester un step individuel avec launch step, à condition de charger la configuration du job qui le contient. Un test completed ne prouve pas que les données sont justes : on vérifie aussi le contenu.", 'fade', sl => {
    title(sl, 'Tester un job et un step');
    code(sl, 0.6, 1.6, 7.6, 3.6, snip(SOLT + 'AbstractBasicActiveTestJob.java', [['@Test', 'postJobCheckings();']]),
      { title: 'AbstractBasicActiveTestJob.java', size: 12, steps: [[0, 3, 1], [4, 6, 2], [7, 8, 3]] });
    code(sl, 0.6, 5.35, 7.6, 1.2, ['JobExecution je = jobLauncherTestUtils.launchStep("stepName", params);'], { title: 'test d\'un step individuel (d\'après le cours)', size: 12, steps: [[0, 0, 4]] });
    card(sl, 8.6, 1.6, 4.1, 1.4, { head: '@SpringBatchTest', body: 'JobLauncherTestUtils + JobRepositoryTestUtils.', col: C.accent2, hs: 16, bs: 14, g: 1 });
    card(sl, 8.6, 3.15, 4.1, 1.4, { head: 'COMPLETED', body: 'Vérifier l\'exit code du job.', col: C.accent5, hs: 16, bs: 14, g: 2 });
    card(sl, 8.6, 4.7, 4.1, 1.85, { head: 'Et le contenu', body: 'Fichier attendu, valeurs : un test vert ne prouve pas que la donnée est juste.', col: C.accent4, hs: 16, bs: 14, g: 3 });
  });

  slide('CONTENU', S6, "On peut aussi écrire ses propres readers et writers. Par exemple un reader qui génère un jeu de données, ou un writer qui écrit dans plusieurs cibles. Le motif principal : un reader ou un writer personnalisé qui délègue à des sous-readers ou sous-writers ouverts et fermés par les méthodes before step et after step. Les logs : un listener et slf4j produisent un fichier de logs à chaque exécution.", 'fade', sl => {
    title(sl, 'Composants personnalisés, logs et patterns');
    code(sl, 0.6, 1.6, 6.4, 2.4, snip(SOL + 'writer/custom/SimpleObjectWriter.java', [['public class SimpleObjectWriter', '}']]).filter(l => l.trim()).slice(0, 8),
      { title: 'SimpleObjectWriter.java : un writer personnalisé', size: 13, steps: [[0, 6, 1]] });
    card(sl, 7.4, 1.6, 5.3, 1.35, { head: 'Reader qui génère des données', body: 'Utile pour remplir une base de test.', col: C.accent2, hs: 17, bs: 14, g: 2 });
    card(sl, 7.4, 3.1, 5.3, 1.35, { head: 'Pattern : délégation', body: 'Custom reader/writer qui délègue à des sous-composants (@BeforeStep / @AfterStep).', col: C.accent5, hs: 16, bs: 13, g: 3 });
    card(sl, 7.4, 4.6, 5.3, 1.35, { head: 'Logs', body: 'Listener + slf4j : un fichier de logs par exécution.', col: C.accent6, hs: 17, bs: 14, g: 4 });
    label(sl, 'Si le reader garde un état (position), il implémente ItemStream pour la reprise.', 0.6, 4.35, 6.4, 0.8, { size: 14, italic: true, col: C.text2, g: 2 });
  });

  slide('CONTENU', S6, "Lancer et superviser. Une application Spring Batch a la seule responsabilité de démarrer un job en mode console. Elle peut être lancée par un scheduler comme Quartz, ou par Spring Cloud Data Flow. Comme elle stocke régulièrement l'état d'avancement dans la base du job repository, une application annexe peut le visualiser. L'ancien Spring Batch Admin, non maintenu depuis deux mille dix-sept, a été remplacé par une partie de Spring Cloud Data Flow, dont la console se trouve par défaut sur le port neuf mille trois cent quatre-vingt-treize.", 'fade', sl => {
    title(sl, 'Lancer et superviser');
    box(sl, 0.6, 1.8, 2.6, 1.0, 'Scheduler', { sub: 'Quartz, cron', col: C.accent3, dark: true, g: 1 });
    box(sl, 4.2, 1.8, 3.0, 1.0, 'Application Spring Batch', { sub: 'job en mode console', col: C.accent2, size: 17, g: 2 });
    box(sl, 8.2, 1.8, 2.3, 1.0, 'JobRepository DB', { sub: 'état d\'avancement', col: C.accent5, size: 16, g: 3 });
    box(sl, 8.2, 4.1, 2.3, 1.0, 'Console', { sub: 'Data Flow (9393)', col: C.accent6, size: 18, g: 4 });
    arrow(sl, 3.2, 2.3, 4.2, 2.3, { g: 2 }); arrow(sl, 7.2, 2.3, 8.2, 2.3, { g: 3 }); arrow(sl, 9.35, 3.8, 9.35, 4.1, { g: 4, dash: true }); arrow(sl, 9.35, 4.1, 9.35, 2.8, { g: 4 });
    card(sl, 0.6, 3.4, 6.6, 1.35, { head: 'Spring Cloud Data Flow', body: 'Installation par docker-compose ; prend en charge une application Spring Batch.', col: C.accent6, hs: 17, bs: 14, g: 4 });
    card(sl, 0.6, 4.95, 6.6, 1.5, { head: 'Spring Batch Admin : remplacé', body: 'Non maintenu depuis 2017. Certaines équipes développent leur propre supervision (API REST + interface).', col: C.accent3, hs: 16, bs: 13, g: 5 });
    card(sl, 8.2, 5.3, 4.5, 1.15, { head: 'Version 6', body: 'Command line job operator, recover, arrêt en douceur.', col: C.accent2, hs: 15, bs: 13, g: 5 });
  });
};
