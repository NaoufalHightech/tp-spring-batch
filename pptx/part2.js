'use strict';
// Partie 2 : démarrer, tasklet, chunk, formats, paramètres, processeurs, validation, base de données
const { pres, C, SH, slide, N, title, card, box, arrow, label, chip, tbl, code, snip, SOL, SOLT, ROOT, fileLines } = require('./lib');

module.exports = function () {
  const S3 = '3 · Démarrer', S4 = '4 · Tasklet et chunk';

  slide('SECTION', S3, "Troisième partie : démarrer un projet Spring Batch et lancer un premier job.", 'push', sl => {
    sl.addText('3 · Démarrer', { placeholder: 'title' });
    sl.addText('Projet, JobRepository, premier job, lancement', { placeholder: 'sub' });
  });

  // ---------------------------------------------------------------- dépendances
  slide('CONTENU', S3, "Avec Spring Boot, la configuration est minimale : le starter batch, la base H2 pour le job repository, et les dépendances de test. Pour traiter du XML, on ajoute spring-oxm et JAXB ; pour du JSON, Jackson. Sans Spring Boot, il faudrait déclarer spring-context, spring-jdbc et spring-batch-core, avec enable batch processing.", 'fade', sl => {
    title(sl, 'Le projet : dépendances Maven');
    code(sl, 0.6, 1.6, 7.6, 4.9, [
      '<dependency>', '  <groupId>org.springframework.boot</groupId>', '  <artifactId>spring-boot-starter-batch</artifactId>', '</dependency>', '',
      '<!-- H2 : nécessaire au JobRepository -->', '<dependency>', '  <groupId>com.h2database</groupId>', '  <artifactId>h2</artifactId>', '  <scope>runtime</scope>', '</dependency>', '',
      '<!-- tests -->', '<dependency>  spring-boot-starter-test  </dependency>', '<dependency>  spring-batch-test (scope test)  </dependency>'],
      { title: 'pom.xml (d\'après le cours)', size: 13, steps: [[0, 3, 1], [5, 10, 2], [12, 14, 3]] });
    card(sl, 8.6, 1.6, 4.1, 1.45, { head: 'Starter batch', body: 'Configure JobRepository, JobLauncher et la base.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 8.6, 3.2, 4.1, 1.45, { head: 'Base H2', body: 'Le JobRepository exige une base de données.', col: C.accent5, hs: 17, bs: 14, g: 2 });
    card(sl, 8.6, 4.8, 4.1, 1.7, { head: 'Formats', body: 'XML : spring-oxm + JAXB. JSON : jackson-databind.', col: C.accent6, hs: 17, bs: 14, g: 3 });
  });

  // ---------------------------------------------------------------- JobRepository config
  slide('CONTENU', S3, "Le job repository a besoin d'une base. En propriétés : initialize-schema à always pour créer les tables au premier démarrage, et la datasource. On désactive le lancement automatique des jobs. Si l'application a plusieurs bases, celle de Spring Batch est la datasource primaire avec batch data source, et les autres sont qualifiées. Et avec Spring Boot trois, on n'ajoute pas enable batch processing, qui désactiverait l'auto-configuration.", 'fade', sl => {
    title(sl, 'Configurer le JobRepository');
    code(sl, 0.6, 1.6, 6.3, 2.35, snip(ROOT + '/tpSpringBatchSolution/src/main/resources/application.properties', [['spring.batch.jdbc.initialize-schema=always', 'spring.batch.jdbc.initialize-schema=always'], ['spring.batch.job.enabled=false', 'spring.batch.job.enabled=false'], ['spring.productdb.datasource.url', 'spring.productdb.datasource.url']], { sep: '# …' }),
      { title: 'application.properties', size: 13, steps: [[0, 0, 1], [2, 2, 2], [4, 4, 3]] });
    code(sl, 0.6, 4.15, 6.3, 2.4, ['@Primary', '@BatchDataSource', ...snip(SOL + 'config/AutomaticSpringBootBatchJobRepositoryConfig.java', [['@Bean(value = "dataSource")', '@Bean(value = "dataSource")']]), '// public DataSource datasource(...) { … }'],
      { title: 'AutomaticSpringBootBatchJobRepositoryConfig.java (extrait)', size: 13, steps: [[0, 3, 4]] });
    card(sl, 7.3, 1.6, 5.4, 1.3, { head: 'initialize-schema = always', body: 'Crée les tables BATCH_* au premier démarrage.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 7.3, 3.05, 5.4, 1.3, { head: 'job.enabled = false', body: 'Sans cela, Spring Boot lance tous les jobs au démarrage.', col: C.accent3, hs: 17, bs: 14, g: 2 });
    card(sl, 7.3, 4.5, 5.4, 1.0, { head: 'Base métier à part', body: 'productdb : datasource secondaire qualifiée.', col: C.accent5, hs: 17, bs: 14, g: 3 });
    card(sl, 7.3, 5.65, 5.4, 0.9, { head: 'Datasource primaire + @BatchDataSource', col: C.accent6, hs: 16, g: 4 });
  });

  // ---------------------------------------------------------------- tasklet
  slide('CONTENU', S3, "Notre premier job affiche un message. On commence par la tasklet : elle implémente l'interface Tasklet, avec une seule méthode execute. On affiche le message, et on retourne FINISHED. Sans cela, Spring Batch rappellerait la tasklet en boucle.", 'fade', sl => {
    title(sl, 'Premier job : la Tasklet');
    code(sl, 0.6, 1.6, 7.6, 3.9, snip(SOL + 'tasklet/PrintMessageTasklet.java', [['public class PrintMessageTasklet', 'public class PrintMessageTasklet'], ['private String message;', 'private String message;'], ['@Override', '}']]).slice(0, 10),
      { title: 'PrintMessageTasklet.java', size: 14, steps: [[0, 0, 1], [3, 5, 2], [6, 8, 3]] });
    card(sl, 8.6, 1.6, 4.1, 1.3, { head: 'Une action unique', body: 'Hello world, procédure stockée, ménage de fichiers…', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 8.6, 3.05, 4.1, 1.3, { head: 'execute()', body: 'Appelée dans une transaction par Spring Batch.', col: C.accent5, hs: 17, bs: 14, g: 2 });
    card(sl, 8.6, 4.5, 4.1, 1.5, { head: 'RepeatStatus.FINISHED', body: 'CONTINUABLE ferait rappeler la tasklet en boucle.', col: C.accent4, hs: 17, bs: 14, g: 3 });
    label(sl, 'Résultat réel : « hello world by SpringBatch », job COMPLETED.', 0.6, 5.85, 7.6, 0.4, { size: 14, italic: true, col: C.text2, g: 3 });
  });

  // ---------------------------------------------------------------- step + job
  slide('CONTENU', S3, "La configuration du job : un step construit avec step builder, son nom et le job repository ; on lui donne la tasklet et le gestionnaire de transaction. Puis le job, qui démarre par ce step. Le nom du job est celui que l'on passera au lanceur. Attention : dans Spring Batch cinq, les anciennes fabriques de jobs et de steps n'existent plus.", 'fade', sl => {
    title(sl, 'Configurer le Step et le Job');
    code(sl, 0.6, 1.6, 8.0, 4.9, snip(SOL + 'job/java/HelloWorldJobConfig.java', [['@Bean(name="myHelloWorldJob")', 'return this.buildMySingleStepJob'], ['public Step simplePrintMessageStep', '.build();']]),
      { title: 'HelloWorldJobConfig.java', size: 13, steps: [[0, 5, 1], [7, 14, 2]] });
    card(sl, 9.0, 1.6, 3.7, 1.55, { head: 'Le Job', body: 'Un nom, et un step de départ.', col: C.accent5, hs: 17, bs: 14, g: 1 });
    card(sl, 9.0, 3.3, 3.7, 1.55, { head: 'Le Step', body: 'StepBuilder(nom, jobRepository) puis tasklet(tasklet, txManager).', col: C.accent2, hs: 17, bs: 14, g: 2 });
    card(sl, 9.0, 5.0, 3.7, 1.55, { head: 'Mise à jour v5', body: 'Plus de JobBuilderFactory ni de StepBuilderFactory.', col: C.accent3, hs: 17, bs: 14, g: 3 });
  });

  // ---------------------------------------------------------------- lancement
  slide('CONTENU', S3, "Pour lancer un job : un command line runner récupère le job par son nom et appelle le job launcher avec des paramètres. Un paramètre qui change à chaque lancement, comme l'horodatage, permet de créer une nouvelle instance. En test, on utilise SpringBatchTest et JobLauncherTestUtils. Et on peut aussi lancer par une API REST ou par un scheduler.", 'fade', sl => {
    title(sl, 'Lancer un job');
    code(sl, 0.6, 1.6, 7.7, 3.2, snip(SOL + 'TpSpringBatchApplication.java', [['Job job = (Job) applicationContext.getBean(jobName);', 'Job job = (Job) applicationContext.getBean(jobName);'], ['JobParameters jobParameters = new JobParametersBuilder()', '.addLong("timeStampOfJobInstance"'], ['.addString("inputFilePath", inputFilePath)', '.addString("inputFilePath", inputFilePath)'], ['.toJobParameters();', '.toJobParameters();'], ['var jobExecution = jobLauncher.run(job, jobParameters);', 'var jobExecution = jobLauncher.run(job, jobParameters);']]),
      { title: 'TpSpringBatchApplication.java : run()', size: 13, steps: [[0, 0, 1], [2, 11, 2]] });
    const w = [['Ligne de commande', 'CommandLineRunner + JobLauncher', C.accent2], ['Test JUnit', '@SpringBatchTest + JobLauncherTestUtils', C.accent5], ['API REST', 'Un contrôleur qui appelle le job launcher', C.accent6], ['Scheduler', 'Quartz, cron, Spring Cloud Data Flow', C.accent3]];
    w.forEach((c, i) => card(sl, 8.7, 1.6 + i * 1.25, 4.0, 1.15, { head: c[0], body: c[1], col: c[2], hs: 16, bs: 13, g: 3 + i }));
    chip(sl, 'spring.batch.job.enabled = false', 0.6, 5.1, 4.4, { col: C.accent3, dark: true, size: 14, g: 3 });
    label(sl, 'Un paramètre qui change (horodatage) = une nouvelle instance à chaque lancement.', 5.2, 5.05, 3.4, 0.9, { size: 13, italic: true, col: C.text2, g: 3 });
  });

  // ---------------------------------------------------------------- XML
  slide('CONTENU', S3, "Le même job peut aussi être configuré en XML. C'est l'ancienne façon, encore présente dans le cours en variante : un job avec des steps, chaque step avec une tasklet. Attention, la documentation de la version six annonce que le namespace XML batch est déprécié, avec suppression prévue en version sept.", 'fade', sl => {
    title(sl, 'Variante : la configuration XML');
    code(sl, 0.6, 1.6, 7.7, 4.3, snip(ROOT + '/tpSpringBatchSolution/src/main/resources/job/myHelloWorldJob.xml', [['<bean id="printMessageTaskletA"', '</bean>'], ['<job id="myHelloWorldJob"', '</job>']], { sep: '<!-- … -->' }),
      { title: 'myHelloWorldJob.xml', size: 12, steps: [[0, 2, 1], [4, 10, 2]] });
    card(sl, 8.7, 1.6, 4.0, 1.5, { head: 'Beans + <job>', body: 'Les steps s\'enchaînent avec l\'attribut next.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 8.7, 3.25, 4.0, 1.5, { head: 'Profil xmlJobConfig', body: '@ImportResource charge les fichiers XML.', col: C.accent5, hs: 17, bs: 14, g: 2 });
    card(sl, 8.7, 4.9, 4.0, 1.5, { head: 'À planifier', body: 'Namespace batch déprécié (suppression prévue en v7).', col: C.accent4, hs: 17, bs: 14, g: 3 });
  });

  // =============================================================== 4. chunk
  slide('SECTION', S4, "Quatrième partie : le coeur de Spring Batch, le traitement orienté chunk.", 'push', sl => {
    sl.addText('4 · Tasklet et chunk', { placeholder: 'title' });
    sl.addText('Lire un par un, écrire par blocs, dans une transaction', { placeholder: 'sub' });
  });

  slide('CONTENU', S4, "Deux types de steps. La tasklet fait une action unique, comme une procédure stockée ou un ménage de fichiers. Le chunk traite des enregistrements en masse : un reader, un processor facultatif, un writer.", 'fade', sl => {
    title(sl, 'Tasklet ou chunk ?');
    card(sl, 0.6, 1.7, 5.9, 3.6, { head: 'Tasklet', body: 'Une tâche unique dans un step.\n\n· Hello world\n· Procédure stockée\n· Nettoyage de fichiers, appel d\'API', col: C.accent5, hs: 24, bs: 17, g: 1 });
    card(sl, 6.8, 1.7, 5.9, 3.6, { head: 'Chunk', body: 'Traitement de masse par blocs.\n\n· Lire un fichier, une base\n· Transformer chaque élément\n· Écrire par paquets, en transaction', col: C.accent2, hs: 24, bs: 17, g: 2 });
    chip(sl, 'Dans les deux cas : un Step, dans un Job', 3.4, 5.7, 6.5, { col: C.accent3, dark: true, size: 16, h: 0.5, g: 3 });
  });

  slide('CONTENU', S4, "Voici le principe du chunk. Le step lit un enregistrement, le traite, lit le suivant, le traite, et cumule les résultats dans une liste. Quand la liste atteint la taille du chunk, par exemple cent, le writer écrit toute la liste d'un coup, dans une transaction. Si l'écriture échoue, tout le chunk est annulé. Avec une taille de un, chaque enregistrement est écrit un par un.", 'fade', sl => {
    title(sl, 'Le chunk : lire un par un, écrire par blocs');
    box(sl, 0.6, 2.0, 1.9, 1.2, 'READER', { sub: 'read()', col: C.accent2, g: 1 });
    box(sl, 3.1, 2.0, 2.0, 1.2, 'PROCESSOR', { sub: 'process()', col: C.accent3, dark: true, g: 2 });
    arrow(sl, 2.5, 2.6, 3.1, 2.6, { g: 2 });
    for (let i = 0; i < 10; i++) sl.addText(String(i + 1), { x: 5.7 + i * 0.4, y: 2.25, w: 0.36, h: 0.7, shape: SH.rect, fill: { color: C.accent1 }, color: C.text1, fontSize: 11, bold: true, align: 'center', valign: 'middle', margin: 0, isTextBox: true, objectName: N(3) });
    arrow(sl, 5.1, 2.6, 5.68, 2.6, { g: 3 });
    label(sl, 'liste = taille du chunk (ex. 100)', 5.7, 3.0, 4.0, 0.4, { size: 14, italic: true, col: C.text2, g: 3 });
    box(sl, 10.4, 2.0, 2.3, 1.2, 'WRITER', { sub: 'write(liste)', col: C.accent6, g: 4 });
    arrow(sl, 9.75, 2.6, 10.4, 2.6, { g: 4 });
    sl.addText('1 chunk = 1 transaction : tout réussit, ou tout le chunk est annulé', { x: 0.6, y: 3.75, w: 12.1, h: 0.55, shape: SH.roundRect, rectRadius: 0.1, fill: { color: C.accent4 }, color: C.background1, bold: true, fontSize: 18, align: 'center', valign: 'middle', margin: 4, isTextBox: true, objectName: N(5) });
    card(sl, 0.6, 4.6, 3.9, 1.9, { head: 'Taille = 1', body: 'Lu, traité, écrit un par un. Simple mais coûteux.', col: C.accent5, hs: 18, bs: 15, g: 6 });
    card(sl, 4.7, 4.6, 3.9, 1.9, { head: 'Taille = 100', body: 'Écriture par paquets de cent : bien plus efficace.', col: C.accent2, hs: 18, bs: 15, g: 6 });
    card(sl, 8.8, 4.6, 3.9, 1.9, { head: 'Choisir la taille', body: 'Trop petit : trop de commits. Trop grand : mémoire et gros rollback.', col: C.accent3, hs: 18, bs: 14, g: 7 });
  });

  slide('CONTENU', S4, "En pseudo-code : une boucle de zéro à la taille du chunk lit un élément, le traite, l'ajoute à la liste ; puis la liste est écrite. Les interfaces sont simples : un reader retourne un élément, ou null quand il n'y a plus rien ; un processor reçoit un objet et en retourne un autre, ou null pour filtrer ; un writer reçoit un chunk, c'est-à-dire la liste.", 'fade', sl => {
    title(sl, 'L\'algorithme du chunk et ses interfaces');
    code(sl, 0.6, 1.6, 6.6, 3.0, ['List items = new ArrayList();', 'for (int i = 0; i < commitInterval; i++) {', '  items.add(itemReader.read());   // + process(item)', '}', 'itemWriter.write(items);   // 1 transaction'],
      { title: 'principe (d\'après le cours)', size: 15, steps: [[0, 0, 1], [1, 3, 2], [4, 4, 3]] });
    code(sl, 7.5, 1.6, 5.2, 3.0, ['T read()          // null = fin', '', 'O process(I item)  // null = filtré', '', 'void write(Chunk<? extends T> items)'],
      { title: 'ItemReader · ItemProcessor · ItemWriter', size: 13, steps: [[0, 0, 4], [2, 2, 5], [4, 4, 6]] });
    card(sl, 0.6, 4.9, 3.9, 1.6, { head: 'Reader', body: 'Un élément à la fois. Retourne null à la fin.', col: C.accent2, hs: 17, bs: 14, g: 4 });
    card(sl, 4.7, 4.9, 3.9, 1.6, { head: 'Processor', body: 'Transforme, calcule, filtre (null).', col: C.accent3, hs: 17, bs: 14, g: 5 });
    card(sl, 8.8, 4.9, 3.9, 1.6, { head: 'Writer', body: 'Reçoit le chunk (Chunk en v5, List avant).', col: C.accent6, hs: 17, bs: 14, g: 6 });
  });

  slide('CONTENU', S4, "Dans notre TP, voici le step du job qui lit un CSV de produits et les affiche. Le step déclare ses types, un produit en entrée et un produit en sortie. Le chunk est de cinq, avec le gestionnaire de transaction. Puis le reader, le processor et le writer, et on construit.", 'fade', sl => {
    title(sl, 'Un step orienté chunk (TP)');
    code(sl, 0.6, 1.6, 8.2, 4.1, snip(SOL + 'job/java/ProductsCsvToConsoleJobConfig.java', [['@Bean @Qualifier("csvToConsole")', '.build();']]).filter(l => !l.includes('simple mind')),
      { title: 'ProductsCsvToConsoleJobConfig.java', size: 12, steps: [[0, 3, 1], [5, 7, 2], [8, 12, 3]] });
    card(sl, 9.2, 1.6, 3.5, 1.5, { head: 'Types', body: '<Product, Product> : lu / écrit.', col: C.accent5, hs: 17, bs: 14, g: 2 });
    card(sl, 9.2, 3.25, 3.5, 1.5, { head: 'chunk(5, tx)', body: '5 éléments par transaction.', col: C.accent2, hs: 17, bs: 14, g: 2 });
    card(sl, 9.2, 4.9, 3.5, 1.6, { head: 'reader · processor · writer', body: 'Injectés comme beans.', col: C.accent6, hs: 16, bs: 14, g: 3 });
  });

  slide('CONTENU', S4, "Le reader CSV se construit avec son builder : on lui donne un nom, qui sert à mémoriser la position pour la reprise, la ressource, le nombre de lignes à sauter, le séparateur, les noms des colonnes, et la classe cible. Le chemin du fichier est un paramètre du job : le bean est en job scope.", 'fade', sl => {
    title(sl, 'Le reader CSV (FlatFileItemReader)');
    code(sl, 0.6, 1.6, 8.4, 4.9, snip(SOL + 'reader/java/MyCsvFileProductReaderConfig.java', [['@Bean @Qualifier("csv")', '.build();']]),
      { title: 'MyCsvFileProductReaderConfig.java', size: 13, steps: [[0, 4, 1], [5, 6, 2], [7, 9, 3], [10, 12, 4]] });
    card(sl, 9.4, 1.6, 3.3, 1.35, { head: '@JobScope', body: 'Créé quand les paramètres existent.', col: C.accent6, hs: 16, bs: 13, g: 1 });
    card(sl, 9.4, 3.1, 3.3, 1.2, { head: 'Ressource', body: 'Chemin = paramètre du job.', col: C.accent5, hs: 16, bs: 13, g: 2 });
    card(sl, 9.4, 4.45, 3.3, 1.0, { head: 'Format', body: 'Sauter l\'en-tête, séparateur ;', col: C.accent2, hs: 16, bs: 13, g: 3 });
    card(sl, 9.4, 5.6, 3.3, 0.95, { head: 'names + targetType', col: C.accent3, hs: 16, g: 4 });
  });

  slide('CONTENU', S4, "Spring Batch fournit des readers et des writers prêts pour les principaux formats : fichiers plats délimités ou à positions fixes, fichiers hybrides avec un line mapper personnalisé, JSON, XML, et bases de données JDBC.", 'fade', sl => {
    title(sl, 'Lire et écrire : les formats');
    tbl(sl, [['Format', 'Reader', 'Writer'], ['CSV / texte délimité', 'FlatFileItemReader', 'FlatFileItemWriter'], ['Positions fixes', 'FlatFileItemReader + FixedLengthTokenizer', 'FlatFileItemWriter'], ['Hybride', 'LineMapper personnalisé', '—'],
      ['JSON', 'JsonItemReader', 'JsonFileItemWriter (+ Jackson)'], ['XML', 'StaxEventItemReader (+ JAXB)', 'StaxEventItemWriter (+ JAXB)'], ['Base JDBC', 'JdbcCursorItemReader / JdbcPagingItemReader', 'JdbcBatchItemWriter']],
      { x: 0.6, y: 1.65, w: 12.1, colW: [2.9, 5.0, 4.2], fs: 15, hs: 15, rowH: 0.68, g: 1 });
    label(sl, 'Dans le TP : fromCsvToConsoleJob, fromCsvToJsonJob, fromCsvToXmlJob, puis base de données.', 0.6, 6.5, 12, 0.4, { size: 14, italic: true, col: C.text2, g: 2 });
  });

  slide('CONTENU', S4, "Un job reçoit des paramètres : le chemin du fichier d'entrée, du fichier de sortie, un indicateur. Pour les injecter dans les beans, on utilise le job scope ou le step scope : le bean n'est créé qu'au démarrage du step ou du job, quand les paramètres existent. Chaque exécution a sa propre instance. Sans cela, un paramètre nul, ou un état partagé entre deux exécutions.", 'fade', sl => {
    title(sl, 'Paramètres du job et scopes');
    code(sl, 0.6, 1.6, 6.9, 2.0, ['JobParameters jobParameters = new JobParametersBuilder()', '    .addString("inputFilePath", "data/input/csv/products.csv")', '    .addString("enableUpperCase", "true")', '    .toJobParameters();'], { title: 'lancement', size: 12, steps: [[0, 3, 1]] });
    code(sl, 0.6, 3.8, 6.9, 2.7, snip(SOL + 'processor/SimpleUppercaseProductProcessor.java', [['@Component', '@StepScope'], ['@Value("#{jobParameters[\'enableUpperCase\']}")', 'private Boolean']]),
      { title: 'SimpleUppercaseProductProcessor.java', size: 12, steps: [[0, 1, 2], [3, 4, 3]] });
    card(sl, 7.9, 1.6, 4.8, 1.55, { head: '@JobScope / @StepScope', body: 'Bean créé au démarrage du job / du step.', col: C.accent2, hs: 17, bs: 14, g: 2 });
    card(sl, 7.9, 3.3, 4.8, 1.55, { head: '#{jobParameters[\'x\']}', body: 'Injection tardive d\'un paramètre.', col: C.accent5, hs: 17, bs: 14, g: 3 });
    card(sl, 7.9, 5.0, 4.8, 1.5, { head: 'Évite', body: 'Un paramètre nul, ou un état partagé entre exécutions.', col: C.accent4, hs: 17, bs: 14, g: 4 });
  });

  slide('CONTENU', S4, "Le processor reçoit un objet et en retourne un autre. Retourner null filtre l'élément. On peut enchaîner plusieurs processors avec un composite : le résultat du premier devient l'entrée du second. Un composite peut même contenir un autre composite, comme un dossier dans un dossier, mais on s'en sert surtout pour une simple liste.", 'fade', sl => {
    title(sl, 'Processors : transformer, filtrer, composer');
    box(sl, 0.6, 1.8, 2.0, 1.1, 'foo', { sub: 'objet lu', col: C.accent5, g: 1 }); box(sl, 3.4, 1.8, 2.6, 1.1, 'Processor 1', { sub: 'foo → bar', col: C.accent3, dark: true, g: 2 });
    box(sl, 6.8, 1.8, 2.6, 1.1, 'Processor 2', { sub: 'bar → baz', col: C.accent3, dark: true, g: 3 }); box(sl, 10.2, 1.8, 2.5, 1.1, 'baz', { sub: 'objet écrit', col: C.accent6, g: 4 });
    arrow(sl, 2.6, 2.35, 3.4, 2.35, { g: 2 }); arrow(sl, 6.0, 2.35, 6.8, 2.35, { g: 3 }); arrow(sl, 9.4, 2.35, 10.2, 2.35, { g: 4 });
    sl.addShape(SH.roundRect, { x: 3.2, y: 1.65, w: 6.4, h: 1.4, fill: { type: 'none' }, line: { color: C.accent2, width: 2.25, dashType: 'dash' }, rectRadius: 0.1, objectName: N(3) });
    label(sl, 'CompositeItemProcessor', 3.2, 3.1, 6.4, 0.4, { size: 15, bold: true, align: 'center', col: C.accent2, g: 3 });
    code(sl, 0.6, 3.8, 7.4, 2.75, snip(SOL + 'job/java/ProductsCsvToConsoleWithCompositeJobConfig.java', [['public ItemProcessor<Product, Product> upperThenAnalyticsProcessor', 'return composite;']]).map(l => l.replace('ItemProcessor<Product, Product> upperThenAnalyticsProcessor(', 'ItemProcessor<Product, Product> composite(')),
      { title: 'ProductsCsvToConsoleWithCompositeJobConfig.java', size: 12, steps: [[0, 6, 5]] });
    card(sl, 8.4, 3.8, 4.3, 1.25, { head: 'Filtrer', body: 'process() retourne null : élément non écrit.', col: C.accent5, hs: 16, bs: 14, g: 5 });
    card(sl, 8.4, 5.2, 4.3, 1.35, { head: 'Composer', body: 'setDelegates(liste) : l\'ordre est l\'ordre d\'exécution.', col: C.accent2, hs: 16, bs: 14, g: 6 });
  });

  slide('CONTENU', S4, "La validation des données est essentielle dans un traitement par lots : un fichier brut peut contenir des données mal formatées. On peut réutiliser les annotations de validation, comme taille minimale et maximale, et déclarer un processor de validation par annotations. Chaque objet lu est alors vérifié avant d'aller plus loin. Cette forme vient du cours et n'a pas été exécutée ici.", 'fade', sl => {
    title(sl, 'Valider les données');
    code(sl, 0.6, 1.6, 6.9, 2.4, ['public class Client {', '  @Size(min = 1, max = 30)', '  private String nom;', '}'], { title: 'annotations de validation (d\'après le cours)', size: 14, steps: [[0, 3, 1]] });
    code(sl, 0.6, 4.2, 6.9, 2.3, ['@Bean', 'public BeanValidatingItemProcessor<Client> validator() {', '  return new BeanValidatingItemProcessor<>();', '}'], { title: 'processor de validation (forme usuelle)', size: 14, steps: [[0, 3, 2]] });
    card(sl, 7.9, 1.6, 4.8, 1.7, { head: 'Supposer le pire', body: 'Une donnée non contrôlée est suspecte : on valide chaque enregistrement.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 7.9, 3.45, 4.8, 1.5, { head: 'Évite', body: 'Une donnée mal formée qui contamine la base.', col: C.accent4, hs: 17, bs: 14, g: 2 });
    chip(sl, 'Non exécuté ici : à tester dans ton projet', 7.9, 5.2, 4.8, { col: C.accent3, dark: true, size: 14, h: 0.5, g: 2 });
  });

  slide('CONTENU', S4, "Pour la base de données, le reader JDBC exécute une requête et passe chaque ligne à un row mapper, qui construit l'objet. Le writer JDBC envoie une requête nommée en batch : ici une mise à jour du prix par identifiant. Les paramètres portent le nom des propriétés. Les produits vivent dans une seconde base, déclarée à part.", 'fade', sl => {
    title(sl, 'Base de données : reader et writer JDBC');
    code(sl, 0.6, 1.6, 6.5, 2.7, snip(SOL + 'reader/java/MyDbProductWithDetailsReaderConfig.java', [['return new JdbcCursorItemReaderBuilder', '.build();']]),
      { title: 'MyDbProductWithDetailsReaderConfig.java', size: 12, steps: [[0, 5, 1]] });
    code(sl, 0.6, 4.5, 6.5, 2.05, snip(SOL + 'writer/java/MyDbProductWithDetailsWriterConfig.java', [['private static final String UPDATE_PRICE_QUERY', 'WHERE id = :id'], ['.sql(UPDATE_PRICE_QUERY)', '.build();']]),
      { title: 'MyDbProductWithDetailsWriterConfig.java', size: 12, steps: [[0, 5, 3]] });
    card(sl, 7.5, 1.6, 5.2, 1.5, { head: 'Reader', body: 'Requête SELECT + RowMapper, sur la base productdb.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 7.5, 3.25, 5.2, 1.5, { head: 'Writer', body: 'UPDATE nommé, envoyé en batch pour tout le chunk.', col: C.accent6, hs: 17, bs: 14, g: 3 });
    card(sl, 7.5, 4.9, 5.2, 1.6, { head: 'Piège constaté', body: 'Le RowMapper du dépôt ne copie jamais le libellé (setLabel manquant) : les tests restent verts.', col: C.accent4, hs: 16, bs: 13, g: 4 });
  });
};
