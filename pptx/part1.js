'use strict';
// Partie 1 : titre, plan, pourquoi le batch, architecture et vocabulaire
const { pres, C, SH, HEX, slide, N, title, card, box, arrow, label, chip, stat, tbl, code } = require('./lib');

module.exports = function () {
  // ------------------------------------------------------------------ 1. titre
  slide('TITRE', 'Introduction', "Bienvenue dans ce cours complet sur Spring Batch : un module de Spring très utilisé en entreprise et très demandé en entretien d'embauche. Nous allons voir pourquoi le batch existe, comment Spring Batch est construit, comment on l'écrit, comment on le rend fiable, puis une démonstration complète.", 'fade', sl => {
    sl.addText('Spring Batch', { placeholder: 'title' });
    sl.addText('Le cours complet : du traitement par lots au batch fiable', { placeholder: 'sub' });
    ['CSV', 'JSON', 'XML', 'JDBC', 'flows', 'skip & restart', 'partitions', 'tests'].forEach((t, i) =>
      chip(sl, t, 0.9 + i * 1.5, 5.45, 1.35, { col: C.accent2, size: 14, g: 1 }));
    label(sl, 'Spring Boot 3 · Spring Batch 5 · avec les nouveautés de la version 6', 0.9, 6.3, 11.5, 0.4, { size: 16, col: C.background2, g: 2 });
  });

  // ------------------------------------------------------------------ 2. plan
  slide('CONTENU', 'Introduction', "Voici le plan : huit parties. On commence par le pourquoi, puis l'architecture et le vocabulaire, le démarrage, le chunk, les flux et le parallélisme, la fiabilité et les tests, la démonstration du formateur, et pour finir les bonnes pratiques et les nouveautés de la version 6.", 'fade', sl => {
    title(sl, 'Plan du cours');
    const parts = [['Pourquoi le batch', 'cas d\'usage, principes, stratégies'], ['Architecture et vocabulaire', 'couches, job, instance, step'], ['Démarrer', 'projet, JobRepository, premier job'], ['Tasklet et chunk', 'reader, processor, writer, formats'],
      ['Flux et parallélisme', 'enchaînements, decider, flows, partitions'], ['Fiabilité et tests', 'skip, retry, restart, tests, supervision'], ['Démo du formateur', 'transactions bancaires, REST, composite'], ['Bonnes pratiques et versions', 'pièges, Spring Batch 6, entretien']];
    parts.forEach((p, i) => card(sl, 0.6 + (i % 4) * 3.07, 1.7 + Math.floor(i / 4) * 2.55, 2.9, 2.3, { badge: i + 1, head: p[0], body: p[1], hs: 18, bs: 14, g: 1 + Math.floor(i / 4) }));
    label(sl, 'Un fil rouge : un catalogue de produits (TP) et des transactions bancaires (démo).', 0.6, 6.62, 12, 0.35, { size: 15, italic: true, col: C.text2, g: 3 });
  });

  // ------------------------------------------------------------------ 3. section
  slide('SECTION', '1 · Pourquoi le batch', "Première partie : pourquoi on a encore besoin de traitements par lots.", 'push', sl => {
    sl.addText('1 · Pourquoi le batch', { placeholder: 'title' });
    sl.addText('Définition, besoins, cas d\'usage, principes et stratégies', { placeholder: 'sub' });
  });

  // ------------------------------------------------------------------ 4. lire, traiter, écrire
  slide('CONTENU', '1 · Pourquoi le batch', "Le batch processing, c'est la répétition de traitements sur de grands ensembles de données accumulées pendant une période passée : des transactions bancaires, des fichiers de log. Les entrées peuvent être des fichiers texte, des fichiers Excel, des bases de données. Le principe tient en trois mots : lire, traiter, écrire. Le résultat est écrit dans une base, dans des fichiers, ou dans des files d'attente d'un broker.", 'fade', sl => {
    title(sl, 'Le batch : lire, traiter, écrire');
    ['Fichier CSV / texte', 'Fichier Excel', 'Base de données'].forEach((t, i) => box(sl, 0.6, 1.9 + i * 1.0, 2.5, 0.75, t, { col: C.accent5, size: 15, g: 1 }));
    ['Base de données', 'Fichiers', 'File d\'attente (broker)'].forEach((t, i) => box(sl, 10.23, 1.9 + i * 1.0, 2.5, 0.75, t, { col: C.accent5, size: 15, g: 5 }));
    box(sl, 3.75, 2.35, 1.9, 1.5, 'READER', { sub: 'lit un élément', col: C.accent2, g: 2 });
    box(sl, 6.0, 2.35, 1.9, 1.5, 'PROCESSOR', { sub: 'transforme', col: C.accent3, dark: true, g: 3 });
    box(sl, 8.25, 2.35, 1.5, 1.5, 'WRITER', { sub: 'écrit', col: C.accent6, g: 4 });
    [2.275, 3.275, 4.275].forEach(y => arrow(sl, 3.1, y, 3.72, 3.1, { g: 2 }));
    arrow(sl, 5.7, 3.1, 5.95, 3.1, { g: 3 }); arrow(sl, 7.95, 3.1, 8.2, 3.1, { g: 4 });
    [2.275, 3.275, 4.275].forEach(y => arrow(sl, 9.78, 3.1, 10.2, y, { g: 5 }));
    label(sl, 'Batch processing = répétition de traitements sur de grands ensembles de données, sans intervention humaine.', 0.6, 5.2, 12.1, 0.7, { size: 20, bold: true, col: C.text2, g: 6 });
    label(sl, 'Données accumulées pendant une période : une semaine, un mois, une année.', 0.6, 6.0, 12.1, 0.5, { size: 16, col: C.text1, g: 6 });
  });

  // ------------------------------------------------------------------ 5. besoins techniques
  slide('CONTENU', '1 · Pourquoi le batch', "Un traitement de masse a cinq besoins techniques : pas d'interface utilisateur, de bonnes performances, de la supervision, de la fiabilité avec reprise, et une distinction claire : un batch n'est pas un scheduler, mais un scheduler peut le lancer.", 'fade', sl => {
    title(sl, 'Les besoins techniques d\'un traitement de masse');
    const b = [['Sans intervention humaine', 'Pas d\'IHM : tout est automatique, l\'humain déclenche au plus.', C.accent2], ['Efficacité', 'Traitements lourds et longs (minutes, heures) : à optimiser.', C.accent5],
      ['Supervision', 'Savoir ce qui est fait, ce qui reste, et si tout s\'est bien passé.', C.accent6], ['Fiabilité', 'Reprendre un lot en échec : transaction par lot.', C.accent4], ['Un batch n\'est pas un scheduler', 'Un scheduler (Quartz, cron) peut le lancer.', C.accent3], ['Parallélisme', 'Beaucoup de jobs en parallèle pour de gros volumes.', C.accent4]];
    b.forEach((c, i) => card(sl, 0.6 + (i % 3) * 4.07, 1.7 + Math.floor(i / 3) * 2.6, 3.9, 2.35, { badge: i + 1, head: c[0], body: c[1], col: c[2], hs: 19, bs: 15, g: i + 1 }));
  });

  // ------------------------------------------------------------------ 6. cas métier
  slide('CONTENU', '1 · Pourquoi le batch', "Les cas métier sont partout. À la fin de chaque mois, une entreprise calcule et vire les salaires. Un opérateur télécom génère des millions de factures en PDF. On traite des bulletins de salaire, on envoie des e-mails automatiquement, on génère des rapports quotidiens, hebdomadaires ou mensuels, et on exécute des workflows sans intervention humaine. Banques, assurances, télécoms, commerce : c'est du quotidien.", 'fade', sl => {
    title(sl, 'Cas d\'usage métier');
    const u = [['Salaires', 'Fin de mois : calculer et virer les salaires des employés.'], ['Factures', 'Un opérateur télécom en génère des millions, en PDF.'], ['Bulletins de paie', 'Traitement de masse à chaque fin de mois.'],
      ['E-mails', 'Envois automatiques à partir de fichiers de données.'], ['Rapports', 'Quotidiens, hebdomadaires, mensuels.'], ['Workflows', 'Exécution automatique sans intervention humaine.']];
    u.forEach((c, i) => card(sl, 0.6 + (i % 3) * 4.07, 1.65 + Math.floor(i / 3) * 2.3, 3.9, 2.1, { head: c[0], body: c[1], col: i % 2 ? C.accent5 : C.accent2, hs: 20, bs: 15, g: Math.floor(i / 3) + 1 }));
    label(sl, 'Banques · assurances · télécoms · commerce : du quotidien.', 0.6, 6.4, 12.1, 0.45, { size: 17, bold: true, col: C.text2, g: 3 });
  });

  // ------------------------------------------------------------------ 7. cas techniques
  slide('CONTENU', '1 · Pourquoi le batch', "Côté technique : lancer à intervalle régulier les tests unitaires d'une application, mettre à jour une base de données à deux heures du matin, consommer les messages d'une file d'attente, contrôler l'intégrité d'un serveur, ou générer beaucoup de données factices pour un test de charge. Et c'est un sujet très demandé en entretien d'embauche.", 'fade', sl => {
    title(sl, 'Cas d\'usage techniques');
    const u = [['Tests planifiés', 'Exécuter les tests unitaires à intervalle régulier.'], ['Base de données', 'Mises à jour automatiques à heure fixe (ex. 2 h du matin).'], ['Files d\'attente', 'Consommer les messages d\'un broker puis traiter.'],
      ['Intégrité', 'Contrôler l\'intégrité d\'un serveur d\'applications.'], ['Données factices', 'Remplir une base pour un test de charge.']];
    u.forEach((c, i) => card(sl, 0.6 + (i % 3) * 4.07, 1.65 + Math.floor(i / 3) * 2.3, 3.9, 2.1, { head: c[0], body: c[1], col: [C.accent2, C.accent5, C.accent6, C.accent3, C.accent4][i], hs: 20, bs: 15, g: Math.floor(i / 3) + 1 }));
    chip(sl, 'Très demandé en entretien d\'embauche', 8.95, 4.35, 3.8, { col: C.accent3, dark: true, size: 15, h: 0.5, g: 3 });
    label(sl, 'Même les équipes qui n\'utilisent pas Spring finissent par l\'utiliser pour le batch.', 8.95, 4.95, 3.8, 0.9, { size: 14, italic: true, col: C.text2, g: 3 });
  });

  // ------------------------------------------------------------------ 8. principes
  slide('CONTENU', '1 · Pourquoi le batch', "La documentation officielle donne des principes valables pour tout batch : minimiser les entrées-sorties, ne pas faire les choses deux fois, toujours supposer le pire sur les données, tester la charge tôt, sauvegarder aussi les fichiers, et rester simple. Pour chacun, il faut savoir pourquoi, et ce qu'il nous évite.", 'fade', sl => {
    title(sl, 'Principes d\'un bon batch');
    tbl(sl, [['Principe', 'Pourquoi', 'Ce que ça évite'],
      ['Minimiser les E/S', 'Premier coût d\'un batch', 'Relire à chaque transaction, scans inutiles'],
      ['Ne pas faire deux fois', 'Un total recalculé relit tout', 'Un second passage complet'],
      ['Supposer le pire', 'Données non contrôlées = suspectes', 'Un fichier tronqué accepté comme complet'],
      ['Tester la charge tôt', 'Un batch grossit avec le temps', 'Découvrir la limite en production'],
      ['Sauvegarder aussi les fichiers', 'Les fichiers plats sont oubliés', 'Un batch qui dépend de fichiers perdus'],
      ['Rester simple', 'Complexité = risque', 'Des batchs monolithiques ingérables']], { x: 0.6, y: 1.6, w: 12.1, colW: [3.4, 4.2, 4.5], fs: 15, hs: 15, rowH: 0.62, g: 1 });
    label(sl, 'Source : documentation officielle Spring Batch.', 0.6, 6.55, 8, 0.35, { size: 12, italic: true, col: C.text2 });
  });

  // ------------------------------------------------------------------ 9. stratégies
  slide('CONTENU', '1 · Pourquoi le batch', "On choisit une stratégie de traitement, de la plus simple à la plus complexe : traitement normal dans une fenêtre batch, batch concurrent avec l'en ligne, jobs en parallèle, partitionnement, ou une combinaison. Même dans le cas simple, il faut prévoir des points de validation et la reprise : un batch grossit en volume et en complexité.", 'fade', sl => {
    title(sl, 'Stratégies de traitement, du plus simple au plus complexe');
    const s = [['1', 'Traitement normal', 'dans une fenêtre batch'], ['2', 'Batch concurrent', 'avec l\'en ligne'], ['3', 'Jobs en parallèle', 'plusieurs jobs à la fois'], ['4', 'Partitionnement', 'même job, plusieurs instances'], ['5', 'Combinaison', 'des précédentes']];
    s.forEach((c, i) => {
      const h = 1.2 + i * 0.55, x = 0.6 + i * 2.45;
      box(sl, x, 5.9 - h, 2.3, h, c[1], { sub: c[2], col: [C.accent2, C.accent5, C.accent6, C.accent3, C.accent4][i], dark: i === 3, size: 16, subSize: 13, g: i + 1 });
      sl.addText(c[0], { x: x + 0.05, y: 5.9 - h - 0.55, w: 0.45, h: 0.45, shape: SH.ellipse, fill: { color: C.text1 }, color: C.background1, bold: true, fontSize: 15, align: 'center', valign: 'middle', margin: 0, isTextBox: true, objectName: N(i + 1) });
    });
    label(sl, 'Même dans le cas simple : prévoir des points de validation et la reprise.', 0.6, 6.15, 12.1, 0.45, { size: 17, bold: true, col: C.text2, g: 6 });
  });

  // ------------------------------------------------------------------ 10. verrouillage + partitionnement
  slide('CONTENU', '1 · Pourquoi le batch', "Deux notions de conception. Le verrouillage logique : optimiste, avec un horodatage relu dans la clause where de la mise à jour, plutôt pour l'en ligne ; pessimiste, avec un verrou posé à la lecture, plutôt pour le batch. Et le partitionnement : le même job tourne en plusieurs instances, chacune sur sa part des données. Il y a six façons de découper, et il faut valider que les partitions couvrent toute la plage, sans trou.", 'fade', sl => {
    title(sl, 'Verrouillage logique et partitionnement');
    tbl(sl, [['', 'Optimiste', 'Pessimiste'], ['Hypothèse', 'peu de conflits', 'conflits probables'], ['Principe', 'horodatage relu dans le WHERE', 'verrou posé à la lecture'], ['Plutôt pour', 'applications en ligne', 'applications batch']],
      { x: 0.6, y: 1.65, w: 6.0, colW: [1.6, 2.2, 2.2], fs: 14, hs: 14, rowH: 0.6, g: 1 });
    label(sl, 'Même schéma de verrouillage pour toutes les applications qui touchent la donnée.', 0.6, 4.25, 6.0, 0.8, { size: 14, italic: true, col: C.text2, g: 1 });
    label(sl, 'Six façons de découper (cas par cas)', 7.0, 1.6, 5.7, 0.4, { size: 18, bold: true, col: C.accent2, g: 2 });
    ['Parts égales (bornes basse et haute)', 'Par colonne clé (plages de valeurs)', 'Par vues (au niveau base)', 'Indicateur de traitement (non traité, en cours, fini)', 'Extraction vers fichier plat puis découpage', 'Colonne de hachage (instance A, B, C…)']
      .forEach((t, i) => box(sl, 7.0, 2.1 + i * 0.62, 5.7, 0.52, `${i + 1} · ${t}`, { col: i % 2 ? C.accent5 : C.accent2, size: 14, g: 2 }));
    chip(sl, 'À valider : couvrir toute la plage, sans trou', 7.0, 5.95, 5.7, { col: C.accent3, dark: true, size: 14, h: 0.45, g: 3 });
  });

  // ------------------------------------------------------------------ 11. section
  slide('SECTION', '2 · Architecture et vocabulaire', "Deuxième partie : l'architecture de Spring Batch et son vocabulaire.", 'push', sl => {
    sl.addText('2 · Architecture et vocabulaire', { placeholder: 'title' });
    sl.addText('Trois couches, puis job, instance, exécution, step et contexte', { placeholder: 'sub' });
  });

  // ------------------------------------------------------------------ 12. couches
  slide('CONTENU', '2 · Architecture et vocabulaire', "Spring Batch repose sur une architecture à trois couches. L'application, c'est le code que tu écris : les jobs et le code personnalisé. Le batch core est le noyau : les classes d'exécution nécessaires pour lancer et contrôler un job, comme le job, le step et le lanceur. L'infrastructure est la base commune : les readers et writers et les services comme le retry. Application et cœur s'appuient tous deux sur l'infrastructure.", 'fade', sl => {
    title(sl, 'Architecture en trois couches');
    box(sl, 1.2, 1.7, 6.2, 1.35, 'Application', { sub: 'tes jobs, steps, readers, processors', col: C.accent2, size: 24, subSize: 15, g: 1 });
    box(sl, 1.2, 3.4, 6.2, 1.35, 'Batch Core', { sub: 'Job, Step, JobLauncher / JobOperator', col: C.accent5, size: 24, subSize: 15, g: 2 });
    box(sl, 1.2, 5.1, 6.2, 1.35, 'Batch Infrastructure', { sub: 'ItemReader, ItemWriter, RetryTemplate…', col: C.accent3, dark: true, size: 24, subSize: 15, g: 3 });
    arrow(sl, 4.0, 3.05, 4.0, 3.38, { g: 2 }); arrow(sl, 4.0, 4.75, 4.0, 5.08, { g: 3 });
    label(sl, 'Le code que tu écris : les traitements par lots et le code personnalisé.', 7.8, 1.85, 4.9, 1.0, { size: 16, g: 1 });
    label(sl, 'Le noyau : classes d\'exécution pour lancer et contrôler un job.', 7.8, 3.55, 4.9, 1.0, { size: 16, g: 2 });
    label(sl, 'Base commune : readers, writers et services courants (utilisés par l\'application ET par le cœur).', 7.8, 5.25, 4.9, 1.2, { size: 16, g: 3 });
  });

  // ------------------------------------------------------------------ 13. schéma de référence
  slide('CONTENU', '2 · Architecture et vocabulaire', "Le schéma de référence de la documentation : un job operator pilote un job ; le job contient un ou plusieurs steps ; chaque step a exactement un reader et un writer ; et tout est enregistré dans le job repository. Dans notre dépôt, en version cinq, c'est le job launcher qui lance les jobs.", 'fade', sl => {
    title(sl, 'Le schéma de référence');
    box(sl, 0.6, 2.2, 2.3, 1.0, 'JobLauncher', { sub: '(JobOperator en v6)', col: C.accent5, size: 18, g: 1 });
    box(sl, 3.5, 2.2, 1.9, 1.0, 'Job', { col: C.accent5, size: 20, g: 1 });
    box(sl, 6.0, 2.2, 1.9, 1.0, 'Step', { col: C.accent5, size: 20, g: 2 });
    box(sl, 8.8, 1.45, 2.2, 0.9, 'ItemReader', { col: C.accent3, dark: true, size: 18, g: 3 });
    box(sl, 8.8, 3.05, 2.2, 0.9, 'ItemWriter', { col: C.accent3, dark: true, size: 18, g: 3 });
    arrow(sl, 2.9, 2.7, 3.5, 2.7, { g: 1 }); arrow(sl, 5.4, 2.7, 6.0, 2.7, { g: 2 }); arrow(sl, 7.9, 2.5, 8.8, 1.95, { g: 3 }); arrow(sl, 7.9, 2.9, 8.8, 3.5, { g: 3 });
    label(sl, '1', 5.45, 2.25, 0.3, 0.3, { bold: true, g: 2 }); label(sl, '*', 5.85, 2.25, 0.3, 0.3, { bold: true, g: 2 });
    box(sl, 0.6, 5.0, 10.4, 1.0, 'JobRepository', { sub: 'enregistre instances, exécutions, compteurs (tables BATCH_*)', col: C.accent2, size: 20, g: 4 });
    [1.75, 4.45, 6.95].forEach(x => arrow(sl, x, 3.2, x, 5.0, { g: 4, dash: true, col: C.accent2 }));
    label(sl, 'Un step a exactement un reader, un writer, et un processor facultatif.', 0.6, 6.25, 12, 0.4, { size: 15, italic: true, col: C.text2, g: 5 });
  });

  // ------------------------------------------------------------------ 14. job, instance, execution
  slide('CONTENU', '2 · Architecture et vocabulaire', "Prenons un job de fin de journée, EndOfDay. Il n'y a qu'un job. Mais chaque jour est une instance : le job pour la date du jour. Et chaque tentative d'exécuter cette instance est une job execution. Si le premier lancement échoue et qu'on relance avec la même date, c'est la même instance, avec une nouvelle exécution.", 'fade', sl => {
    title(sl, 'Job, JobInstance, JobExecution');
    box(sl, 0.9, 1.7, 3.0, 1.0, 'Job', { sub: 'EndOfDay : le type de tâche', col: C.accent5, size: 20, g: 1 });
    box(sl, 0.9, 3.45, 3.0, 1.0, 'JobInstance', { sub: 'EndOfDay du 2007/05/05', col: C.accent3, dark: true, size: 20, g: 2 });
    box(sl, 0.9, 5.2, 3.0, 1.0, 'JobExecution', { sub: '1re tentative du 2007/05/05', col: C.accent3, dark: true, size: 20, g: 3 });
    arrow(sl, 2.4, 2.7, 2.4, 3.45, { g: 2 }); arrow(sl, 2.4, 4.45, 2.4, 5.2, { g: 3 });
    label(sl, '*', 2.5, 2.9, 0.3, 0.3, { bold: true, g: 2 }); label(sl, '*', 2.5, 4.65, 0.3, 0.3, { bold: true, g: 3 });
    box(sl, 5.0, 3.45, 2.9, 1.0, 'JobParameters', { sub: 'schedule.date = 2007/05/05', col: C.accent5, size: 18, g: 2 });
    arrow(sl, 5.0, 3.95, 3.95, 3.95, { g: 2 });
    card(sl, 8.4, 1.7, 4.3, 1.5, { head: 'Job', body: 'Définit ce qu\'est la tâche et comment l\'exécuter.', col: C.accent5, hs: 18, bs: 14, g: 1 });
    card(sl, 8.4, 3.35, 4.3, 1.5, { head: 'JobInstance', body: 'Un job + ses paramètres identifiants : une exécution logique.', col: C.accent3, hs: 18, bs: 14, g: 2 });
    card(sl, 8.4, 5.0, 4.3, 1.5, { head: 'JobExecution', body: 'Une tentative réelle : réussite ou échec.', col: C.accent3, hs: 18, bs: 14, g: 3 });
  });

  // ------------------------------------------------------------------ 15. instance = job + params
  slide('CONTENU', '2 · Architecture et vocabulaire', "La règle à retenir : JobInstance égale Job plus paramètres identifiants. Une exécution réussie ferme l'instance : on ne peut pas la relancer. Relancer une instance déjà en cours lève une exception. Voici les tables du JobRepository : une instance, deux tentatives, puis une autre instance pour le jour suivant.", 'fade', sl => {
    title(sl, 'JobInstance = Job + paramètres identifiants');
    tbl(sl, [['JOB_EXEC_ID', 'JOB_INST_ID', 'paramètre schedule.Date', 'STATUS'], ['1', '1', '2017-01-01', 'FAILED'], ['2', '1', '2017-01-01 (relance)', 'COMPLETED : l\'instance 1 est fermée'], ['3', '2', '2017-01-02', 'COMPLETED : une AUTRE instance']],
      { x: 0.6, y: 1.65, w: 12.1, colW: [1.9, 1.9, 3.5, 4.8], fs: 15, hs: 15, rowH: 0.62, g: 1 });
    card(sl, 0.6, 4.6, 3.9, 1.9, { head: 'Même paramètres', body: 'Même instance, nouvelle exécution : c\'est la reprise.', col: C.accent2, hs: 18, bs: 15, g: 2 });
    card(sl, 4.7, 4.6, 3.9, 1.9, { head: 'Instance réussie', body: 'Fermée : un nouveau lancement identique est refusé.', col: C.accent4, hs: 18, bs: 15, g: 3 });
    card(sl, 8.8, 4.6, 3.9, 1.9, { head: 'Instance en cours', body: 'JobExecutionAlreadyRunningException si on la relance.', col: C.accent3, hs: 18, bs: 15, g: 4 });
  });

  // ------------------------------------------------------------------ 16. step & stepexecution
  slide('CONTENU', '2 · Architecture et vocabulaire', "Un step est une phase indépendante d'un job. À chaque exécution d'un step correspond une step execution, rattachée à une job execution. Elle porte les compteurs : éléments lus, écrits, filtrés, ignorés, nombre de commits et de rollbacks, et son contexte d'exécution.", 'fade', sl => {
    title(sl, 'Step et StepExecution');
    box(sl, 0.7, 1.7, 1.9, 0.8, 'Job', { col: C.accent5, size: 18, g: 1 }); box(sl, 3.6, 1.7, 1.9, 0.8, 'Step', { col: C.accent5, size: 18, g: 1 });
    box(sl, 0.7, 3.2, 1.9, 0.8, 'JobInstance', { col: C.accent3, dark: true, size: 16, g: 2 }); box(sl, 0.7, 4.7, 1.9, 0.8, 'JobExecution', { col: C.accent3, dark: true, size: 16, g: 2 });
    box(sl, 3.6, 4.7, 2.2, 0.8, 'StepExecution', { col: C.accent3, dark: true, size: 16, g: 3 });
    arrow(sl, 2.6, 2.1, 3.6, 2.1, { g: 1 }); arrow(sl, 1.65, 2.5, 1.65, 3.2, { g: 2 }); arrow(sl, 1.65, 4.0, 1.65, 4.7, { g: 2 }); arrow(sl, 2.6, 5.1, 3.6, 5.1, { g: 3 }); arrow(sl, 4.55, 2.5, 4.7, 4.7, { g: 3 });
    tbl(sl, [['Propriété', 'Rôle'], ['status / exitStatus', 'état technique / code de sortie'], ['readCount / writeCount', 'éléments lus / écrits'], ['commitCount / rollbackCount', 'transactions validées / annulées'], ['filterCount', 'éléments filtrés par le processor'],
      ['read/process/writeSkipCount', 'éléments ignorés (skip)'], ['executionContext', 'données persistées pour la reprise']], { x: 6.5, y: 1.7, w: 6.2, colW: [2.9, 3.3], fs: 13, hs: 14, rowH: 0.58, g: 3 });
    label(sl, 'Si un step échoue parce que le précédent a échoué, aucune StepExecution n\'est créée.', 0.7, 6.0, 12, 0.5, { size: 14, italic: true, col: C.text2, g: 4 });
  });

  // ------------------------------------------------------------------ 17. execution context
  slide('CONTENU', '2 · Architecture et vocabulaire', "L'execution context est un sac de données clé-valeur, conservé par le framework. Il y en a un par job execution et un par step execution. Celui du step est sauvegardé à chaque commit : c'est ce qui permet de reprendre là où on s'est arrêté. Le job repository persiste ces métadonnées dans une base de données.", 'fade', sl => {
    title(sl, 'ExecutionContext et JobRepository');
    card(sl, 0.6, 1.65, 5.9, 1.6, { head: 'Contexte du step', body: 'Sauvegardé à CHAQUE commit : position de lecture, compteurs, tes données.', col: C.accent2, hs: 19, bs: 15, g: 1 });
    card(sl, 0.6, 3.45, 5.9, 1.6, { head: 'Contexte du job', body: 'Sauvegardé entre deux steps. Ce ne sont PAS les mêmes objets.', col: C.accent5, hs: 19, bs: 15, g: 2 });
    card(sl, 0.6, 5.25, 5.9, 1.3, { head: 'Entrées sérialisables', body: 'Sans cela, la reprise du job est impossible.', col: C.accent4, hs: 19, bs: 15, g: 3 });
    tbl(sl, [['STEP_EXEC_ID', 'SHORT_CONTEXT'], ['1', '{piece.count=40321}']], { x: 6.9, y: 1.7, w: 5.8, colW: [2.3, 3.5], fs: 15, hs: 15, rowH: 0.6, g: 4 });
    label(sl, 'BATCH_STEP_EXECUTION_CONTEXT : le step a traité 40 321 éléments avant l\'échec ; la reprise repart de l\'élément suivant.', 6.9, 3.1, 5.8, 1.0, { size: 14, italic: true, col: C.text2, g: 4 });
    box(sl, 6.9, 4.4, 5.8, 1.3, 'JobRepository', { sub: 'persiste les métadonnées dans une base de données (au minimum H2 en mémoire en v5)', col: C.accent2, size: 20, g: 5 });
  });

  // ------------------------------------------------------------------ 18. historique
  slide('CONTENU', '2 · Architecture et vocabulaire', "Un mot sur les versions. La configuration est passée du XML au Java, puis aux paramétrages modernes. La version cinq demande Java dix-sept et s'aligne sur Spring six. Règle : Spring Batch N pour Spring Framework N moins un. Et la version six, plus récente, apporte de nouvelles configurations.", 'fade', sl => {
    title(sl, 'Historique des versions');
    const v = [['1.x', '2008', 'Configuration XML'], ['2.x', '2009-10', 'NoSQL, configuration Java'], ['3.x', 'Spring 4', 'Java 8, JSR-352'], ['4.x', 'Spring 5', 'Alignement Spring 5'], ['5.x', 'Spring 6', 'Java 17 minimum, Jakarta EE'], ['6.0', 'Spring 7', 'Nouveautés (voir la dernière partie)']];
    v.forEach((c, i) => {
      box(sl, 0.6 + i * 2.05, 2.3, 1.9, 1.1, c[0], { sub: c[1], col: i === 4 ? C.accent2 : i === 5 ? C.accent6 : C.accent5, size: 24, subSize: 14, g: i + 1 });
      label(sl, c[2], 0.6 + i * 2.05, 3.6, 1.9, 1.0, { size: 14, align: 'center', g: i + 1 });
    });
    arrow(sl, 0.6, 2.0, 12.7, 2.0, { g: 1, col: C.accent2 });
    chip(sl, 'Spring Batch N pour Spring Framework N−1', 0.6, 5.2, 5.6, { col: C.accent3, dark: true, size: 16, h: 0.5, g: 7 });
    label(sl, 'Depuis la v5 : le JobRepository exige une base de données (même H2 en mémoire).', 6.5, 5.15, 6.2, 0.7, { size: 15, col: C.text1, g: 7 });
  });
};
