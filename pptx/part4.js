'use strict';
// Partie 4 : démo du formateur, bonnes pratiques, versions, entretien, TP, synthèse
const { pres, C, SH, HEX, slide, N, title, card, box, arrow, label, chip, stat, tbl, code, snip, SOL, ROOT, BANK } = require('./lib');

module.exports = function () {
  const S7 = '7 · Démo du formateur', S8 = '8 · Bonnes pratiques et versions';
  const noCom = a => a.filter(l => !l.trim().startsWith('//') || l.trim() === '// …');
  const BR = ROOT + '/tpBankDemo/src/main/resources/';

  slide('SECTION', S7, "Septième partie : la démonstration du formateur, un traitement de transactions bancaires, reproduit et exécuté dans un projet réel en Spring Batch cinq.", 'push', sl => {
    sl.addText('7 · Démo du formateur', { placeholder: 'title' });
    sl.addText('Transactions bancaires : CSV vers base, lancement par REST, processors composés', { placeholder: 'sub' });
  });

  // ---------------------------------------------------------------- cas
  slide('CONTENU', S7, "Passons à la pratique : un traitement de transactions bancaires. On crée un projet Spring Boot avec Spring Batch, Spring Web pour une API REST de déclenchement, Spring Data JPA et la base H2 pour enregistrer. Le fichier d'entrée est un CSV : une ligne d'en-têtes, puis une ligne par transaction : identifiant, numéro de compte, date, type et montant. Le type est D pour un débit, C pour un crédit.", 'fade', sl => {
    title(sl, 'Le cas : des transactions bancaires');
    code(sl, 0.6, 1.6, 7.4, 3.5, snip(BR + 'data.csv', [['id,accountNumber', '5,100200302']]), { title: 'data.csv (fichier d\'entrée)', size: 13, steps: [[0, 0, 1], [1, 5, 2]] });
    card(sl, 8.4, 1.6, 4.3, 1.4, { head: 'Dépendances', body: 'Batch · Web · Data JPA · H2.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 8.4, 3.15, 4.3, 1.4, { head: 'Type de transaction', body: 'D = débit, C = crédit.', col: C.accent5, hs: 17, bs: 14, g: 2 });
    card(sl, 8.4, 4.7, 4.3, 1.4, { head: 'Console H2', body: 'Consulter la base dans un navigateur.', col: C.accent6, hs: 17, bs: 14, g: 3 });
    box(sl, 0.6, 5.45, 7.4, 0.9, 'data.csv  →  traitement batch  →  table BANK_TRANSACTION', { col: C.accent3, dark: true, size: 17, g: 3 });
  });

  slide('CONTENU', S7, "D'abord l'objet métier : la classe BankTransaction, une entité JPA. La date lue dans le fichier est du texte : on la garde dans un champ texte, et un champ date non persistant, marqué transient, sera rempli par un processor. Puis le repository : une interface qui étend JPA repository. Spring Data fournit le mapping objet-relationnel.", 'fade', sl => {
    title(sl, 'L\'objet métier et le repository');
    code(sl, 0.6, 1.6, 7.4, 3.9, snip(BANK + 'model/BankTransaction.java', [['@Entity', 'private double amount;']]), { title: 'BankTransaction.java', size: 13, steps: [[0, 3, 1], [4, 5, 2], [6, 8, 3]] });
    code(sl, 0.6, 5.65, 7.4, 0.95, snip(BANK + 'dao/BankTransactionRepository.java', [['public interface BankTransactionRepository', 'public interface BankTransactionRepository']]), { size: 12 });
    card(sl, 8.4, 1.6, 4.3, 1.5, { head: '@Entity + @Id', body: 'L\'identifiant vient du fichier.', col: C.accent2, hs: 17, bs: 14, g: 1 });
    card(sl, 8.4, 3.25, 4.3, 1.7, { head: 'Date : deux champs', body: 'Le texte lu, et une vraie date calculée (non persistée).', col: C.accent5, hs: 17, bs: 14, g: 2 });
    card(sl, 8.4, 5.1, 4.3, 1.5, { head: '@Transient', body: 'Ce champ n\'est pas enregistré en base.', col: C.accent3, hs: 17, bs: 14, g: 3 });
  });

  // ---------------------------------------------------------------- config
  slide('CONTENU', S7, "Maintenant la configuration du job. Un bean job : il démarre avec un step. Le step : un nom, une taille de chunk de cent, le reader, le processor et le writer. Le formateur utilise les fabriques de jobs et de steps ; avec Spring Batch cinq, on utilise job builder et step builder avec le job repository, et le gestionnaire de transaction passé au chunk. Et avec Spring Boot trois, pas de enable batch processing.", 'fade', sl => {
    title(sl, 'Configurer le job et son step');
    code(sl, 0.6, 1.6, 8.0, 4.6, snip(BANK + 'config/SpringBatchConfig.java', [['public Job bankJob', '.build();'], ['public Step stepLoadData', '.build();']]),
      { title: 'SpringBatchConfig.java (exécuté)', size: 12, steps: [[0, 3, 1], [5, 16, 2]] });
    card(sl, 9.0, 1.6, 3.7, 1.55, { head: 'Le job', body: 'bankJob : démarre par stepLoadData.', col: C.accent5, hs: 17, bs: 14, g: 1 });
    card(sl, 9.0, 3.3, 3.7, 1.55, { head: 'Le step', body: 'chunk(100, tx) + reader, processor, writer.', col: C.accent2, hs: 17, bs: 14, g: 2 });
    card(sl, 9.0, 5.0, 3.7, 1.6, { head: 'Mise à jour', body: 'Plus de fabriques ; pas d\'@EnableBatchProcessing en Boot 3.', col: C.accent3, hs: 16, bs: 13, g: 2 });
  });

  slide('CONTENU', S7, "Le reader : un reader de fichier plat. Le nom du fichier n'est pas écrit en dur : on l'injecte depuis les propriétés avec value. On saute la première ligne, celle des en-têtes. Le line mapper transforme chaque ligne en objet : un tokenizer découpe selon le séparateur virgule et nomme les champs dans l'ordre, et un mapper de champs remplit un objet de la classe cible.", 'fade', sl => {
    title(sl, 'Le reader : un fichier plat');
    code(sl, 0.6, 1.6, 8.2, 4.9, snip(BANK + 'config/SpringBatchConfig.java', [['public FlatFileItemReader<BankTransaction> flatFileItemReader', 'return reader;'], ['public LineMapper<BankTransaction> lineMapper', 'return lineMapper;']]).filter(l => l.trim()),
      { title: 'SpringBatchConfig.java : reader et line mapper', size: 11, steps: [[0, 6, 1], [8, 13, 2], [14, 18, 3]] });
    card(sl, 9.2, 1.6, 3.5, 1.5, { head: '@Value("${input.file}")', body: 'Le chemin vient des propriétés.', col: C.accent2, hs: 15, bs: 13, g: 1 });
    card(sl, 9.2, 3.25, 3.5, 1.5, { head: 'Tokenizer', body: 'Séparateur « , » et noms des champs dans l\'ordre.', col: C.accent5, hs: 16, bs: 13, g: 2 });
    card(sl, 9.2, 4.9, 3.5, 1.6, { head: 'FieldSetMapper', body: 'Remplit un BankTransaction.', col: C.accent6, hs: 16, bs: 13, g: 3 });
  });

  slide('CONTENU', S7, "Le processor est une classe composant Spring qui implémente item processor, avec le même type en entrée et en sortie. Il convertit la date texte, au format jour, mois, année, heure et minute, en vraie date, puis retourne l'objet. Un simple date format n'est pas sûr entre plusieurs threads : on en crée un par appel. Le writer reçoit la liste et appelle save all du repository.", 'fade', sl => {
    title(sl, 'Le processor et le writer');
    code(sl, 0.6, 1.6, 7.0, 2.85, noCom(snip(BANK + 'processor/BankTransactionItemProcessor.java', [['public class BankTransactionItemProcessor', 'public class BankTransactionItemProcessor'], ['public BankTransaction process', 'return transaction;']])), { title: 'BankTransactionItemProcessor.java', size: 11, steps: [[0, 2, 1], [3, 5, 2]] });
    code(sl, 0.6, 4.65, 7.0, 1.9, snip(BANK + 'writer/BankTransactionItemWriter.java', [['public class BankTransactionItemWriter', 'public class BankTransactionItemWriter'], ['public void write', 'repository.saveAll(chunk.getItems());']]), { title: 'BankTransactionItemWriter.java', size: 11, steps: [[0, 3, 3]] });
    card(sl, 8.0, 1.6, 4.7, 1.5, { head: 'Même type en entrée et en sortie', body: 'Ici l\'objet est enrichi puis retourné.', col: C.accent2, hs: 16, bs: 14, g: 1 });
    card(sl, 8.0, 3.25, 4.7, 1.65, { head: 'Un format de date par appel', body: 'SimpleDateFormat n\'est pas thread-safe : jamais un champ partagé.', col: C.accent4, hs: 16, bs: 14, g: 2 });
    card(sl, 8.0, 5.05, 4.7, 1.5, { head: 'saveAll(chunk)', body: 'Le writer enregistre tout le chunk.', col: C.accent6, hs: 16, bs: 14, g: 3 });
  });

  // ---------------------------------------------------------------- REST
  slide('CONTENU', S7, "Pour lancer le job, on crée un contrôleur REST qui utilise le job launcher. On construit des job parameters avec l'heure de départ, pour que chaque exécution soit une nouvelle instance. Le launcher lance le job, on attend la fin, et on retourne le statut. On désactive le lancement automatique avec job enabled à false. Dans le cours, l'appel est un get ; pour une action qui modifie des données, un post serait préférable.", 'fade', sl => {
    title(sl, 'Lancer le job par une API REST');
    box(sl, 0.6, 1.7, 1.8, 0.9, 'Navigateur', { sub: 'GET /startJob', col: C.accent5, size: 16, g: 1 }); box(sl, 2.9, 1.7, 2.0, 0.9, 'Contrôleur', { col: C.accent2, size: 16, g: 2 });
    box(sl, 5.4, 1.7, 2.0, 0.9, 'JobLauncher', { col: C.accent5, size: 16, g: 3 }); box(sl, 7.9, 1.7, 1.8, 0.9, 'bankJob', { col: C.accent2, size: 16, g: 4 }); box(sl, 10.2, 1.7, 2.5, 0.9, 'Base H2', { sub: 'BANK_TRANSACTION', col: C.accent6, size: 15, g: 5 });
    arrow(sl, 2.4, 2.15, 2.9, 2.15, { g: 2 }); arrow(sl, 4.9, 2.15, 5.4, 2.15, { g: 3 }); arrow(sl, 7.4, 2.15, 7.9, 2.15, { g: 4 }); arrow(sl, 9.7, 2.15, 10.2, 2.15, { g: 5 });
    code(sl, 0.6, 3.0, 8.4, 3.55, snip(BANK + 'web/JobRestController.java', [['@GetMapping("/startJob")', 'return jobExecution.getStatus();']]), { title: 'JobRestController.java (exécuté)', size: 12, steps: [[0, 3, 2], [4, 5, 3], [6, 9, 4]] });
    card(sl, 9.4, 3.0, 3.3, 1.6, { head: 'job.enabled = false', body: 'Le job ne démarre pas tout seul.', col: C.accent3, hs: 15, bs: 13, g: 2 });
    card(sl, 9.4, 4.75, 3.3, 1.8, { head: 'À améliorer', body: 'POST plutôt que GET ; ne pas bloquer la requête : lancement asynchrone.', col: C.accent4, hs: 15, bs: 13, g: 6 });
  });

  // ---------------------------------------------------------------- résultat
  slide('CONTENU', S7, "Résultat, exécuté pour de vrai dans le projet. L'appel retourne completed. La table contient les huit transactions du fichier. Sur le premier lancement, le total des débits est neuf cent trente-sept virgule quinze, et celui des crédits quatre mille sept cents. Et dans la console H2, on retrouve les données insérées.", 'fade', sl => {
    title(sl, 'Résultat : exécuté et vérifié');
    stat(sl, 0.6, 1.7, 3.8, 'COMPLETED', 'statut retourné par /startJob', { bs: 34, g: 1 });
    stat(sl, 4.6, 1.7, 3.8, '8', 'lignes en base (BANK_TRANSACTION)', { g: 2 });
    stat(sl, 8.6, 1.7, 4.1, '937,15', 'total des débits (D)', { col: C.accent4, g: 3 });
    stat(sl, 8.6, 3.7, 4.1, '4 700', 'total des crédits (C)', { col: C.accent5, g: 3 });
    sl.addText([{ text: 'Job: [SimpleJob: [name=bankJob]] launched …', options: { breakLine: true, color: C.accent1 } }, { text: 'Executing step: [stepLoadData]', options: { breakLine: true, color: C.background1 } },
      { text: 'Step: [stepLoadData] executed in 100ms', options: { breakLine: true, color: C.background1 } }, { text: 'Job: [SimpleJob: [name=bankJob]] completed … status: [COMPLETED]', options: { color: C.accent1 } }],
      { x: 0.6, y: 3.9, w: 7.8, h: 2.0, shape: SH.roundRect, rectRadius: 0.07, fill: { color: C.text1 }, fontFace: 'Courier New', fontSize: 13, valign: 'middle', margin: 10, isTextBox: true, objectName: N(2) });
    label(sl, 'Journal réel de l\'exécution (docs/verifications/bank_demo_test.log).', 0.6, 6.05, 7.8, 0.4, { size: 13, italic: true, col: C.text2, g: 2 });
  });

  // ---------------------------------------------------------------- composite
  slide('CONTENU', S7, "Ajoutons un deuxième processor : il calcule le total des débits et le total des crédits. Il garde ces totaux dans des attributs : c'est un processor avec état. On les enchaîne dans un processor composite : d'abord la conversion de date, puis l'analyse. Le step utilise maintenant le composite à la place du processor unique, et un point d'API analytics retourne les deux totaux.", 'fade', sl => {
    title(sl, 'Enchaîner deux processors : le composite');
    code(sl, 0.6, 1.6, 6.5, 3.4, snip(BANK + 'processor/BankTransactionAnalyticsItemProcessor.java', [['private double totalDebit;', 'return transaction;']]), { title: 'BankTransactionAnalyticsItemProcessor.java', size: 12, steps: [[0, 1, 1], [3, 8, 2]] });
    code(sl, 0.6, 5.15, 6.5, 1.4, snip(BANK + 'config/SpringBatchConfig.java', [['composite.setDelegates', 'composite.setDelegates']]), { title: 'composition', size: 12, steps: [[0, 0, 3]] });
    box(sl, 7.5, 1.7, 2.4, 0.9, 'dateProcessor', { sub: 'texte → date', col: C.accent3, dark: true, size: 15, g: 3 }); box(sl, 10.3, 1.7, 2.4, 0.9, 'analytics', { sub: 'cumule D et C', col: C.accent3, dark: true, size: 15, g: 3 });
    arrow(sl, 9.9, 2.15, 10.3, 2.15, { g: 3 });
    card(sl, 7.5, 3.0, 5.2, 1.5, { head: 'Processor avec état', body: 'Il garde totalDebit et totalCredit dans des attributs.', col: C.accent2, hs: 17, bs: 14, g: 2 });
    card(sl, 7.5, 4.65, 5.2, 1.9, { head: '/analytics', body: 'Retourne les deux totaux. Après le 1er lancement : débit 937,15 · crédit 4 700.', col: C.accent5, hs: 17, bs: 14, g: 4 });
  });

  slide('CONTENU', S7, "Le piège, constaté par exécution : relançons le job avec le même fichier. Les totaux doublent, mille huit cent soixante-quatorze virgule trois et neuf mille quatre cents. Le processor est un singleton qui garde son état entre deux exécutions. En base, rien n'est dupliqué, puisque les identifiants sont les mêmes : on obtient des chiffres faux sans aucune erreur. Bonne pratique : un état par exécution, avec step scope, ou dans l'execution context.", 'fade', sl => {
    title(sl, 'Le piège : relancer double les totaux');
    sl.addChart(pres.charts.BAR, [
      { name: '1er lancement', labels: ['Total des débits', 'Total des crédits'], values: [937.15, 4700] },
      { name: '2e lancement (même fichier)', labels: ['Total des débits', 'Total des crédits'], values: [1874.3, 9400] }],
    { x: 0.6, y: 1.55, w: 7.4, h: 4.9, barDir: 'col', chartColors: [HEX.green, HEX.red], showLegend: true, legendPos: 'b', legendFontSize: 13, legendFontFace: '+mn-lt', showValue: true, dataLabelPosition: 'outEnd', dataLabelFontSize: 13, dataLabelFontFace: '+mn-lt',
      catAxisLabelFontSize: 13, catAxisLabelFontFace: '+mn-lt', valAxisLabelFontSize: 12, valAxisLabelFontFace: '+mn-lt', valGridLine: { color: 'D9E5DC', size: 0.75 }, catGridLine: { style: 'none' }, showTitle: false, valAxisMaxVal: 11000, valAxisMinVal: 0, dataLabelFormatCode: '#,##0.00' });
    card(sl, 8.4, 1.6, 4.3, 1.55, { head: 'Cause', body: 'Un singleton garde son état entre deux exécutions.', col: C.accent4, hs: 17, bs: 14, g: 1 });
    card(sl, 8.4, 3.3, 4.3, 1.55, { head: 'Conséquence', body: 'Des chiffres faux, sans aucune erreur.', col: C.accent4, hs: 17, bs: 14, g: 2 });
    card(sl, 8.4, 5.0, 4.3, 1.55, { head: 'Correctif', body: '@StepScope, ou l\'ExecutionContext du step.', col: C.accent2, hs: 17, bs: 14, g: 3 });
  });

  slide('CONTENU', S7, "Ce qui a changé entre la démonstration d'origine et la version actuelle, vérifié par exécution : les fabriques de jobs et de steps ont disparu ; on n'ajoute plus enable batch processing avec Spring Boot trois ; le writer reçoit un chunk et non une liste ; JPA est passé de javax à jakarta ; et quelques bonnes pratiques, comme créer un format de date par appel.", 'fade', sl => {
    title(sl, 'Ce qui a changé depuis la démo d\'origine');
    tbl(sl, [['Démo d\'origine (Batch 4)', 'Aujourd\'hui (Batch 5 · Boot 3)'], ['JobBuilderFactory, StepBuilderFactory', 'JobBuilder(nom, jobRepository), StepBuilder(...)'], ['@EnableBatchProcessing', 'Pas nécessaire : il désactive l\'auto-configuration'],
      ['write(List<T>)', 'write(Chunk<T>)'], ['javax.persistence', 'jakarta.persistence'], ['GET /startJob et boucle d\'attente', 'POST, lancement asynchrone, pas d\'attente active'], ['SimpleDateFormat partagé', 'Un format par appel (ou DateTimeFormatter)']],
      { x: 0.6, y: 1.65, w: 12.1, colW: [5.6, 6.5], fs: 15, hs: 15, rowH: 0.65, g: 1 });
    chip(sl, 'Vérifié : tp/tpBankDemo (mvn test)', 0.6, 6.4, 4.6, { col: C.accent2, size: 14, h: 0.45, g: 2 });
  });

  // =============================================================== 8. bonnes pratiques & versions
  slide('SECTION', S8, "Huitième partie : les bonnes pratiques à retenir, les pièges rencontrés, et les nouveautés de la version six.", 'push', sl => {
    sl.addText('8 · Bonnes pratiques et versions', { placeholder: 'title' });
    sl.addText('Pourquoi, et ce qu\'elles nous évitent', { placeholder: 'sub' });
  });

  slide('CONTENU', S8, "Bonnes pratiques, première série. Désactiver le lancement automatique des jobs. Une seule datasource primaire pour le job repository. Pas de enable batch processing avec Spring Boot trois. Un paramètre métier plutôt qu'un horodatage pour pouvoir reprendre. Une taille de chunk mesurée. Et le step scope pour tout bean qui lit un paramètre.", 'fade', sl => {
    title(sl, 'Bonnes pratiques (1/2)');
    const b = [['job.enabled = false', 'Évite un lancement involontaire de tous les jobs.'], ['Une datasource primaire', 'Évite des métadonnées dans la mauvaise base.'], ['Pas d\'@EnableBatchProcessing (Boot 3)', 'Évite de perdre l\'auto-configuration.'],
      ['Paramètre métier, pas horodatage', 'Évite l\'impossibilité de reprendre un job échoué.'], ['Taille de chunk mesurée', 'Évite trop de commits, ou un gros rollback.'], ['@StepScope / @JobScope', 'Évite un paramètre nul ou un état partagé.']];
    b.forEach((c, i) => card(sl, 0.6 + (i % 3) * 4.07, 1.65 + Math.floor(i / 3) * 2.5, 3.9, 2.3, { badge: i + 1, head: c[0], body: c[1], col: [C.accent2, C.accent5, C.accent6][i % 3], hs: 17, bs: 15, g: Math.floor(i / 3) + 1 }));
  });

  slide('CONTENU', S8, "Seconde série. Un processor sans effet de bord caché, car un chunk annulé est rejoué. Une écriture idempotente. Borner le skip, cibler l'exception et tracer. Limiter les redémarrages avec le start limit. Vérifier le contenu et pas seulement le statut completed. Et garder les secrets, comme les mots de passe, hors du dépôt.", 'fade', sl => {
    title(sl, 'Bonnes pratiques (2/2)');
    const b = [['Processor sans effet de bord', 'Un chunk annulé est rejoué : évite des doubles comptages.'], ['Écriture idempotente', 'Évite les doublons à la reprise.'], ['Skip borné, ciblé, tracé', 'Évite des données perdues en silence.'],
      ['startLimit', 'Évite un batch qui retente sans fin.'], ['Tester le contenu', 'Un test COMPLETED ne prouve pas que la donnée est juste.'], ['Secrets hors de git', 'Évite une fuite de mot de passe dans l\'historique.']];
    b.forEach((c, i) => card(sl, 0.6 + (i % 3) * 4.07, 1.65 + Math.floor(i / 3) * 2.5, 3.9, 2.3, { badge: i + 7, head: c[0], body: c[1], col: [C.accent3, C.accent4, C.accent2][i % 3], hs: 17, bs: 15, g: Math.floor(i / 3) + 1 }));
  });

  slide('CONTENU', S8, "Des pièges constatés dans le dépôt du TP lui-même, avec leur niveau de preuve. Le row mapper ne copie jamais le libellé, et les tests restent verts : constaté par lecture et recherche. Le decider peut déclencher une erreur de pointeur nul si aucun produit n'est modifié : lu dans le code, non exécuté. Le job de statistiques est nommé autrement que son bean : constaté dans le journal. Et un mot de passe est écrit en clair dans les propriétés.", 'fade', sl => {
    title(sl, 'Pièges constatés dans le dépôt du TP');
    tbl(sl, [['Piège', 'Où', 'Preuve', 'Conséquence'], ['Libellé jamais copié', 'ProductWithDetailsRowMapper', 'Lecture + recherche', 'Donnée perdue, tests verts'], ['Compteur absent', 'MyUpdatedCountCheckingDecider', 'Lu, non exécuté', 'Plantage si 0 produit modifié'],
      ['Nom du job ≠ nom du bean', 'IncreaseProductPriceInDbJobConfig', 'Journal réel', 'Supervision incohérente'], ['Mot de passe en clair', 'application.properties', 'Lecture', 'Fuite dans git'], ['Base non préparée', 'Tests productdb', 'Exécution', 'Tests rouges sur une autre machine']],
      { x: 0.6, y: 1.65, w: 12.1, colW: [2.9, 3.6, 2.2, 3.4], fs: 14, hs: 14, rowH: 0.68, g: 1 });
  });

  slide('CONTENU', S8, "Les nouveautés de Spring Batch six, d'après la documentation officielle, non exécutées ici. Les dépendances passent à Spring Framework sept. L'infrastructure se simplifie : le job repository étend le job explorer, le job operator étend le job launcher. De nouvelles annotations configurent le stockage, et le dépôt est sans ressource par défaut. Le chunk oriented step remplace le tasklet step, avec un nouveau retry et un skip par politique. Un nouveau modèle de concurrence, de meilleurs outils d'exploitation, et des dépréciations à planifier.", 'fade', sl => {
    title(sl, 'Spring Batch 6 : les nouveautés');
    tbl(sl, [['Nouveauté', 'Ce que ça change'], ['Infrastructure simplifiée', 'JobRepository étend JobExplorer ; JobOperator étend JobLauncher'], ['Annotations', '@EnableJdbcJobRepository / @EnableMongoJobRepository ; dépôt « sans ressource » par défaut'],
      ['ChunkOrientedStep', 'Remplace TaskletStep ; retry via Spring Framework 7 ; skip via SkipPolicy'], ['Concurrence', 'Producteur-consommateur, local chunking, remote step, SEDA'], ['Exploitation', 'CommandLineJobOperator, recover, StoppableStep, arrêt en douceur, JFR'],
      ['Dépréciations', 'Namespace XML (suppression en v7), Jackson 2, JUnit 4, modular = true']],
      { x: 0.6, y: 1.65, w: 12.1, colW: [3.0, 9.1], fs: 14, hs: 15, rowH: 0.68, g: 1 });
    chip(sl, 'Source : documentation officielle Spring Batch 6 · non exécuté ici', 0.6, 6.55, 7.0, { col: C.accent3, dark: true, size: 13, h: 0.42, g: 2 });
  });

  slide('CONTENU', S8, "Ce que cela implique pour notre TP, qui est en version cinq : le job launcher deviendra un job operator ; notre fault tolerant avec skip limit sera à migrer vers les politiques ; nos jobs du profil XML sont concernés par la dépréciation ; et jackson-databind, par le passage à Jackson trois. Les concepts du cours, eux, ne changent pas.", 'fade', sl => {
    title(sl, 'Impact sur notre TP (Spring Batch 5 → 6)');
    card(sl, 0.6, 1.65, 3.9, 2.3, { head: 'JobLauncher → JobOperator', body: 'Le lancement s\'unifie dans le job operator.', col: C.accent2, hs: 18, bs: 15, g: 1 });
    card(sl, 4.7, 1.65, 3.9, 2.3, { head: 'faultTolerant().skip(...)', body: 'À migrer vers le chunk oriented step et ses politiques.', col: C.accent5, hs: 18, bs: 15, g: 2 });
    card(sl, 8.8, 1.65, 3.9, 2.3, { head: 'Jobs XML', body: 'Profil xmlJobConfig : namespace déprécié (suppression en v7).', col: C.accent4, hs: 18, bs: 15, g: 3 });
    card(sl, 0.6, 4.2, 6.0, 2.2, { head: 'jackson-databind', body: 'Passage à Jackson 3 ; Jackson 2 est déprécié.', col: C.accent3, hs: 18, bs: 15, g: 4 });
    card(sl, 6.8, 4.2, 5.9, 2.2, { head: 'Ce qui ne change pas', body: 'Job, step, chunk, instance, exécution, scopes, reprise : les concepts du cours.', col: C.accent2, hs: 18, bs: 15, g: 5 });
  });

  slide('CONTENU', S8, "Pour préparer un entretien, voici les questions fréquentes et la réponse courte. C'est quoi Spring Batch ? Quelle différence entre job, instance et exécution ? Comment fonctionne un chunk ? À quoi sert le job repository ? Comment reprendre un job échoué ? Et comment paralléliser ?", 'fade', sl => {
    title(sl, 'Questions d\'entretien');
    tbl(sl, [['Question', 'Réponse courte'], ['C\'est quoi Spring Batch ?', 'Un module Spring pour traiter des lots : lire, traiter, écrire, avec suivi et reprise.'], ['Job, JobInstance, JobExecution ?', 'Le type de tâche ; job + paramètres identifiants ; une tentative d\'exécution.'],
      ['Comment fonctionne un chunk ?', 'Lire et traiter un par un, écrire par bloc, 1 bloc = 1 transaction.'], ['À quoi sert le JobRepository ?', 'Persister instances, exécutions et contextes : suivi et reprise.'],
      ['Skip, retry, restart ?', 'Ignorer des erreurs ; retenter une opération ; reprendre un job échoué.'], ['Comment paralléliser ?', 'Flows en split, partitions, et le nouveau modèle de concurrence en v6.'], ['Pourquoi @StepScope ?', 'Un bean créé par exécution : paramètres injectés, pas d\'état partagé.']],
      { x: 0.6, y: 1.55, w: 12.1, colW: [4.2, 7.9], fs: 14, hs: 15, rowH: 0.6, g: 1 });
  });

  slide('CONTENU', S8, "Le TP fil rouge, en quatorze étapes : le projet et le job repository, la tasklet, le job et ses paramètres, le chunk, les formats JSON et XML, la base de données, le flow et le decider, le skip, le restart, les partitions, les flows parallèles, les processors composés et l'état, le lancement et la supervision, et les tests.", 'fade', sl => {
    title(sl, 'Le TP fil rouge : 14 étapes');
    const st = ['Projet et JobRepository', 'Premier job : tasklet', 'Job, instance, paramètres', 'Chunk : CSV vers console', 'JSON et XML', 'Base de données', 'Flow et decider', 'Erreurs : skip', 'Reprise : restart', 'Partitions', 'Flows parallèles', 'Processeurs composés et état', 'Lancer et superviser', 'Tests'];
    st.forEach((t, i) => card(sl, 0.6 + (i % 7) * 1.74, 1.7 + Math.floor(i / 7) * 2.45, 1.62, 2.25, { head: String(i + 1), body: t, col: [C.accent2, C.accent5, C.accent6, C.accent3][Math.floor(i / 2) % 4], hs: 26, bs: 14, g: Math.floor(i / 7) + 1 }));
    label(sl, 'Support : support/TP_FIL_ROUGE.md · code : tp/tpSpringBatchSolution · démo : tp/tpBankDemo', 0.6, 6.6, 12.1, 0.35, { size: 13, italic: true, col: C.text2, g: 3 });
  });

  // ---------------------------------------------------------------- synthèse
  slide('CONTENU_SOMBRE', S8, "Pour conclure : un job contient des steps ; un step lit, traite et écrit par morceaux ; le job repository se souvient de tout ; et chaque lancement est une instance de job. La règle à retenir : un bon batch se lit par blocs, s'écrit sans doublon, et se reprend là où il s'est arrêté.", 'fade', sl => {
    title(sl, 'Ce qu\'il faut retenir');
    const k = [['Un job contient des steps', C.accent1], ['Un step lit, traite, écrit par morceaux', C.accent3], ['Le JobRepository se souvient de tout', C.accent5], ['Chaque lancement = une instance de job', C.accent6]];
    k.forEach((c, i) => card(sl, 0.6 + (i % 2) * 6.17, 1.6 + Math.floor(i / 2) * 1.45, 5.95, 1.3, { head: c[0], col: c[1], hs: 20, valign: 'middle', g: i + 1 }));
    sl.addText('Un bon batch se lit par blocs, s\'écrit sans doublon, et se reprend là où il s\'est arrêté.', { x: 0.9, y: 4.75, w: 11.5, h: 1.6, fontFace: 'Cambria', fontSize: 30, bold: true, color: C.background1, align: 'center', valign: 'middle', isTextBox: true, objectName: N(5) });
  });

  slide('TITRE', S8, "Merci. Les supports : le cours et le TP fil rouge en markdown, les deux vidéos animées, la démo bancaire et les exemples complémentaires dans le dépôt.", 'fade', sl => {
    sl.addText('À toi de jouer', { placeholder: 'title' });
    sl.addText('Cours · TP fil rouge · démo bancaire · vidéos animées : tout est dans le dépôt', { placeholder: 'sub' });
    ['COURS_SPRING_BATCH.md', 'TP_FIL_ROUGE.md', 'tp/tpBankDemo', 'video/index.html'].forEach((t, i) => chip(sl, t, 0.9 + i * 3.0, 5.45, 2.85, { col: C.accent2, size: 13, g: 1 }));
  });
};
