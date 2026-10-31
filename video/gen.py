#!/usr/bin/env python3
"""Générateur : script.md + code réel du projet + sorties réelles  ->  video/index.html

Principe (cf. skill tutorial-to-video) : le code affiché est LU dans le projet au moment de la
génération, jamais recopié. Chaque motif (a, b) doit être trouvé dans le fichier, sinon erreur.
Usage : python3 video/gen.py
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOL = os.path.join(ROOT, "tp", "tpSpringBatchSolution")
JAVA = os.path.join(SOL, "src", "main", "java", "tp", "tpSpringBatch")
TEST = os.path.join(SOL, "src", "test", "java", "tp", "tpSpringBatch")
RES = os.path.join(SOL, "src", "main", "resources")
LOG = os.path.join(ROOT, "docs", "verifications", "mvn_test_full.log")

FILE_PATHS = {
    "props": os.path.join(RES, "application.properties"),
    "repoCfg": f"{JAVA}/config/AutomaticSpringBootBatchJobRepositoryConfig.java",
    "tasklet": f"{JAVA}/tasklet/PrintMessageTasklet.java",
    "hello": f"{JAVA}/job/java/HelloWorldJobConfig.java",
    "csvJob": f"{JAVA}/job/java/ProductsCsvToConsoleJobConfig.java",
    "csvReader": f"{JAVA}/reader/java/MyCsvFileProductReaderConfig.java",
    "upper": f"{JAVA}/processor/SimpleUppercaseProductProcessor.java",
    "dbReader": f"{JAVA}/reader/java/MyDbProductWithDetailsReaderConfig.java",
    "rowMapper": f"{JAVA}/db/ProductWithDetailsRowMapper.java",
    "dbWriter": f"{JAVA}/writer/java/MyDbProductWithDetailsWriterConfig.java",
    "incProc": f"{JAVA}/processor/IncreasePriceOfProductWithDetailsProcessor.java",
    "decider": f"{JAVA}/decider/MyUpdatedCountCheckingDecider.java",
    "incJob": f"{JAVA}/job/java/IncreaseProductPriceInDbJobConfig.java",
    "skipJob": f"{JAVA}/job/java/ProductsWithDetailsCsvToDbJobWithSkipsConfig.java",
    "skipLis": f"{JAVA}/listener/MySkippedErrorsListener.java",
    "restartLis": f"{JAVA}/listener/MyStoppedForRestartExecutionListener.java",
    "restartJob": f"{JAVA}/job/java/ProductsWithDetailsCsvToDbJobWithRestartableConfig.java",
    "partitioner": f"{JAVA}/partitionner/NumericColumnRangePartitioner.java",
    "partJob": f"{JAVA}/job/java/IncreaseProductPriceInDbWithPartitionJobConfig.java",
    "partReader": f"{JAVA}/reader/java/MyDbProductWithDetailsReaderWithPartitionConfig.java",
    "testAbs": f"{TEST}/AbstractBasicActiveTestJob.java",
    "testInc": f"{TEST}/job/TestIncreaseProductPriceInDbJob.java",
}

_cache = {}
def load(key):
    """Lignes visibles (numéro d'origine, texte) : sans package/import, tabulations -> 4 espaces."""
    if key not in _cache:
        raw = open(FILE_PATHS[key], encoding="utf-8").read().splitlines()
        out = []
        for i, l in enumerate(raw, 1):
            if re.match(r"\s*(package|import)\s", l):
                continue
            out.append([i, l.replace("\t", "    ").rstrip()])
        _cache[key] = out
    return _cache[key]

def find(key, pat, start=1):
    for n, t in load(key):
        if n >= start and ((pat[0] == "=" and t.strip() == pat[1:]) or (pat[0] != "=" and pat in t)):
            return n
    sys.exit(f"MOTIF INTROUVABLE dans {key}: {pat!r} (à partir de la ligne {start})")

def C(key, ranges, t=None, x=None):
    """Révèle des plages [(a, b), ...] : a et b sont des motifs ; b est cherché à partir de a."""
    if isinstance(ranges, tuple):
        ranges = [ranges]
    rs = []
    for a, b in ranges:
        na = find(key, a)
        nb = find(key, b, na)
        rs.append([na, nb])
    act = {"k": "code", "f": key, "r": rs}
    if t: act["t"] = t
    if x: act["x"] = x
    return act

def BP(title, why, saves, kind="bp", src=None):
    d = {"k": "bp", "kind": kind, "title": title, "why": why, "saves": saves}
    if src: d["src"] = src
    return d
SRC = "Source : documentation officielle Spring Batch (texte fourni)"
def TRAP(title, why, saves, src=None): return BP(title, why, saves, "trap", src)
def UPD(title, why, saves, src=None): return BP(title, why, saves, "upd", src)

def mark(key, pat, text):
    return {"k": "mark", "f": key, "line": find(key, pat), "text": text}
def OUT(lines, clear=False): return {"k": "out", "lines": lines, "clear": clear}
def DIA(i, hl): return {"k": "dia", "id": i, "hl": hl}
def LIST(title, items, n): return {"k": "list", "title": title, "items": items, "n": n}

# ------------------------------------------------------------------ sorties réelles
log = open(LOG, encoding="utf-8", errors="replace").read().splitlines() if os.path.exists(LOG) else []
def real(pred, n, strip=None):
    got = []
    for l in log:
        if pred(l) and l not in got:
            got.append(l)
        if len(got) == n: break
    if len(got) < n:
        sys.exit("SORTIE RÉELLE absente du journal pour un des écrans console")
    return [re.sub(strip, "", g) if strip else g for g in got]

HELLO = real(lambda l: l.strip() == "hello world by SpringBatch", 1)
UPPER = real(lambda l: l.startswith("Product [features=") and "main_category=ALIMENT" in l, 2) + \
        real(lambda l: l.startswith("Product [features=") and "main_category=VETEMENT" in l, 2)
SKIPS = real(lambda l: l.startswith("SKIPPED_READ_ERROR"), 2, strip=r"in resource=\[file \[[^\]]*/")
PARSE = real(lambda l: l.startswith("org.springframework.batch.item.file.FlatFileParseException"), 1,
             strip=r"in resource=\[file \[[^\]]*/")
NAMEMISMATCH = [re.search(r"Job: \[FlowJob: \[name=[^\]]+\]\] launched", x).group(0) for x in
                real(lambda l: "FlowJob: [name=insertIntoCsvFromDbJob]" in l and "launched" in l, 1)]
CSV_ERR = open(os.path.join(SOL, "data", "input", "csv", "newDetailsProducts_withErrors.csv"),
               encoding="utf-8").read().splitlines()[:5]

# ------------------------------------------------------------------ actions par ligne de voix
A = {}
# Scène 0
A["L01"] = [{"k": "title", "title": "Spring Batch", "sub": "du premier job au batch fiable · TP fil rouge : le catalogue de produits",
             "chips": ["CSV", "JSON", "XML", "JDBC", "flow conditionnel", "skip & restart", "partitions", "tests"]}]
OBJ = [["Concevoir un job et ses steps (tasklet, chunk)", "cyan"],
       ["Lire et écrire fichiers et base, par blocs", "green"],
       ["Rendre un batch fiable : paramètres, erreurs, reprise, tests", "orange"]]
A["L02"] = [LIST("À la fin, tu sauras…", OBJ, 3)]
A["L03"] = [{"k": "blank"},
            BP("Exemple : voici le signal d'une bonne pratique",
               "chaque carte dit pourquoi la pratique existe",
               "et le problème précis qu'elle fait disparaître")]
# Scène 1
RISK = [["Tout charger en mémoire", "red"], ["Tout perdre si la ligne 50 000 est mauvaise", "red"],
        ["Ne pas savoir où ça s'est arrêté", "red"]]
ANS = [["Traitement par blocs (chunk)", "green"], ["Une transaction par bloc", "green"],
       ["Un journal de suivi en base (JobRepository)", "green"]]
A["L04"] = [LIST("Chaque nuit : 100 000 produits, fichier → base", [["Pas d'écran, pas d'utilisateur : un batch", "cyan"]], 1)]
A["L05"] = [LIST("Trois risques", RISK, 3)]
A["L06"] = [LIST("Trois réponses de Spring Batch", ANS, 3)]
# Scène 2
A["L07"] = [DIA("stereo", ["job", "step"])]
A["L08"] = [DIA("stereo", ["op", "job", "step", "reader", "writer", "repo"])]
A["L09"] = [DIA("arch", ["job", "step", "reader", "proc", "writer", "chunk"])]
A["L10"] = [DIA("arch", ["step", "tx", "reader", "proc", "writer", "chunk"])]
A["L11"] = [DIA("stereo", ["repo", "op", "job", "step"])]
A["L12"] = [{"k": "table", "title": "Quand choisir Spring Batch ? (CONVENTION)", "head": ["Situation", "Choix"],
             "rows": [["Gros volumes, reprise nécessaire, suivi", "Spring Batch"],
                      ["Quelques dizaines de lignes, une fois", "Un simple script"],
                      ["Temps réel, événements", "Plutôt un broker (Kafka…)"]]}]
# Scène 3
A["L36"] = [{"k": "tab", "f": "props"}]
A["L37"] = [C("props", ("spring.batch.jdbc.initialize-schema=always",) * 2, "Schéma auto",
              "Au 1er démarrage, Spring Batch crée les tables BATCH_JOB_INSTANCE, BATCH_JOB_EXECUTION, BATCH_STEP_EXECUTION…")]
A["L38"] = [C("props", ("#disable auto lauching", "spring.batch.job.enabled=false"), "Pas de lancement auto",
              "Sans cette ligne, Spring Boot lance TOUS les jobs au démarrage."),
            BP("job.enabled = false", "Spring Boot lance sinon automatiquement tous les jobs trouvés au démarrage.",
               "Un lancement involontaire, et l'erreur « plusieurs jobs » quand l'application en contient plusieurs.")]
A["L39"] = [C("props", ("#secondary DataBases", "spring.productdb.datasource.password="), "Base métier à part",
              "productdb (H2 fichier) contient les produits. Elle n'est PAS la base du JobRepository.")]
A["L40"] = [C("repoCfg", ("=@Primary", "public DataSource datasource("), "Datasource principale",
              "@Primary + @BatchDataSource : c'est elle que Spring Boot utilise pour le JobRepository."),
            C("repoCfg", ("return dbDataSourceProperties", ".build();"))]
A["L41"] = [BP("Une seule datasource @Primary pour le JobRepository",
               "Spring Boot doit savoir sans ambiguïté où écrire ses métadonnées ; les autres bases sont qualifiées (@Qualifier).",
               "Des métadonnées écrites dans la mauvaise base, ou un échec au démarrage (plusieurs DataSource candidates).")]
A["L42"] = [C("repoCfg", ("Surtout pas ici",) * 2, "Pas d'@EnableBatchProcessing",
              "Commentaire du dépôt : avec Spring Boot 3, cette annotation désactive l'auto-configuration."),
            TRAP("N'ajoute pas @EnableBatchProcessing avec Spring Boot 3 (Spring Batch 5)",
                 "Elle désactive l'auto-configuration de Spring Boot pour Spring Batch.",
                 "Un JobRepository et un lanceur qui ne sont plus créés comme prévu, et un schéma non initialisé.")]
A["L43"] = [C("props", ("spring.datasource.username=root", "spring.datasource.password=root"), "Secret en clair",
              "Constaté dans le dépôt : identifiants MariaDB dans application.properties."),
            mark("props", "spring.datasource.password=root", "secret en clair"),
            BP("Secrets par variable d'environnement",
               "Un fichier versionné est lu par tous ceux qui ont accès au dépôt, pour toujours (historique git).",
               "La fuite d'un mot de passe de base : on écrit ${DB_PASSWORD} et la valeur reste hors de git.")]
# Scène 4
A["L44"] = [{"k": "tab", "f": "tasklet"}]
A["L45"] = [C("tasklet", ("public class PrintMessageTasklet", "public class PrintMessageTasklet"), "Une Tasklet",
              "Interface Tasklet : une seule méthode execute(), pour une action unique.")]
A["L46"] = [C("tasklet", ("@Override", "public RepeatStatus execute"), "execute()",
              "Appelée par Spring Batch dans une transaction ; reçoit le contexte du chunk en cours.")]
A["L47"] = [C("tasklet", ("System.out.println(message);",) * 2, "Le travail",
              "Ici un simple affichage. Ailleurs : procédure stockée, ménage de fichiers, appel d'API.")]
A["L48"] = [C("tasklet", [("return RepeatStatus.FINISHED;", "}")], "FINISHED",
              "FINISHED = terminé. CONTINUABLE ferait rappeler la tasklet en boucle.")]
A["L49"] = [C("hello", [("@Configuration", "public class HelloWorldJobConfig")], "Classe de config",
              "Hérite de MyAbstractJobConfig, qui injecte jobRepository et batchTxManager.")]
A["L50"] = [C("hello", [("public Step simplePrintMessageStep", ".build();")], "Le Step",
              "StepBuilder(nom, jobRepository).tasklet(tasklet, txManager) : le gestionnaire de transaction est explicite en Batch 5.")]
A["L51"] = [C("hello", [('@Bean(name="myHelloWorldJob")', "return this.buildMySingleStepJob")], "Le Job",
              "Le nom du job est celui du bean : c'est lui qu'on passera au lanceur.")]
A["L52"] = [OUT(HELLO, True)]
A["L53"] = [BP("Même nom partout : job, bean, journal",
               "Ce nom est celui que voient les tables BATCH_* et les outils de supervision.",
               "Chercher un job sous un autre nom pendant un incident. (Un écart existe dans ce dépôt : scène 11.)")]
# Scène 5
PRED = {"k": "pred", "q": "On relance le MÊME job avec EXACTEMENT les mêmes paramètres. Le 1er lancement a réussi.",
        "opts": ["Le job tourne une 2e fois", "Spring Batch refuse le 2e lancement", "Le 2e lancement écrase le 1er"], "ans": 1}
A["L54"] = [dict(PRED, reveal=False)]
A["L55"] = [DIA("eod", ["job", "inst", "exec"])]
A["L56"] = [DIA("eod", ["job", "inst", "exec", "params"])]
A["L57"] = [{"k": "table", "title": "BATCH_JOB_EXECUTION (EndOfDayJob) : une instance, plusieurs tentatives",
             "head": ["JOB_EXEC_ID", "JOB_INST_ID", "paramètre schedule.Date", "STATUS"],
             "rows": [["1", "1", "2017-01-01", "FAILED (21:00 → 21:30)"], ["2", "1", "2017-01-01 (relance)", "COMPLETED : l'instance 1 est fermée"],
                      ["3", "2", "2017-01-02", "COMPLETED : une AUTRE instance"]]}]
A["L59"] = [DIA("stephier", ["job", "step", "inst", "exec", "sexec"])]
A["L58"] = [dict(PRED, reveal=True)]
A["L60"] = [BP("Paramètre métier plutôt qu'horodatage (CONVENTION)",
               "Le TP ajoute un horodatage pour pouvoir relancer à volonté ; mais un horodatage crée une NOUVELLE instance à chaque lancement.",
               "L'impossibilité de reprendre un job échoué : on reprend avec les mêmes paramètres (ex. date de traitement).")]
# Scène 6
A["L61"] = [C("csvJob", [('@Bean @Qualifier("csvToConsole")', 'var name = "stepCsvToConsole"')], "Déclarer le step",
              "Un Step est un bean ; on lui injecte reader, writer et processor.")]
A["L62"] = [C("csvJob", [("return stepBuilder", ".<Product, Product>chunk(5")], "Types du chunk",
              "<Product, Product> : type lu / type écrit. Le compilateur vérifie la chaîne.")]
A["L63"] = [C("csvJob", (".<Product, Product>chunk(5",) * 2, "Chunk de 5",
              "5 éléments lus puis écrits en UNE transaction (commit interval).")]
A["L64"] = [C("csvJob", [(".reader(productItemReader)", ".build();")], "Reader · Processor · Writer",
              "Lire un à un, transformer, écrire le bloc. build() construit le step.")]
A["L65"] = [BP("Taille de chunk choisie en connaissance de cause (CONVENTION)",
               "Trop petit : trop de commits. Trop grand : mémoire et gros rollback. Ici 5 pour la lisibilité ; en production on mesure (souvent 100 à 1000).",
               "Un batch lent ou qui sature la mémoire, ou qui perd un énorme bloc au moindre échec.")]
A["L66"] = [C("csvReader", [('@Bean @Qualifier("csv")', "public FlatFileItemReader<Product> productCsvFileReader(")], "Le reader CSV",
              "@JobScope : le bean est créé au démarrage du job, quand les paramètres existent.")]
A["L67"] = [C("csvReader", [("return new FlatFileItemReaderBuilder", '.name("productCsvFileReader")')], "FlatFileItemReader",
              "Le builder évite la config verbeuse. Le nom sert à sauvegarder la position (ItemStream) pour le restart.")]
A["L68"] = [C("csvReader", [(".linesToSkip(1)", '.delimiter(";")')], "Format du fichier",
              "On saute l'en-tête ; séparateur point-virgule.")]
A["L69"] = [C("csvReader", [(".names(", ".build();")], "Colonnes → propriétés",
              "Les noms correspondent aux propriétés de Product ; targetType crée les objets.")]
A["L70"] = [C("csvReader", [('@Value("#{jobParameters', "Resource inputCsvResource"), (".resource(inputCsvResource)",) * 2], "Fichier = paramètre",
              "Le chemin vient du paramètre inputFilePath : même job, autres fichiers, sans recompiler.")]
A["L71"] = [BP("@StepScope / @JobScope pour tout bean qui lit un paramètre",
               "Le bean n'est créé qu'au démarrage du step ou du job, quand #{jobParameters[...]} existe ; chaque exécution a sa propre instance.",
               "Un paramètre nul au démarrage, ou un état partagé entre deux exécutions (ou deux threads).")]
A["L72"] = [C("upper", [("@Component", "public class SimpleUppercaseProductProcessor")], "Un processor",
              "ItemProcessor<Product,Product> : un élément entre, un élément sort.")]
A["L73"] = [C("upper", [("public Product process", "return product;")], "process()",
              "On construit un NOUVEAU produit. Retourner null filtrerait l'élément (filterCount).")]
A["L74"] = [OUT(UPPER, True)]
A["L75"] = [BP("Un processor sans effet de bord caché",
               "Un chunk annulé est rejoué : le processor peut donc être appelé deux fois pour le même élément.",
               "Des compteurs ou des écritures en double après un rollback ou un retry.")]
# Scène 7
A["L76"] = [C("dbReader", [("private static final String SELECT_QUERY", "private static final String SELECT_QUERY"),
                           ("return new JdbcCursorItemReaderBuilder", ".build();")], "Reader JDBC",
              "Une requête SELECT, la datasource productdb (qualifiée) et un RowMapper.")]
A["L77"] = [C("rowMapper", [("public ProductWithDetails mapRow", "return p;")], "RowMapper",
              "Transforme une ligne SQL en objet. Lis-le attentivement…")]
A["L78"] = [C("rowMapper", [("public static final String LABEL_COLUMN",) * 2], None, None),
            mark("rowMapper", "public static final String LABEL_COLUMN", "jamais utilisée"),
            TRAP("Un test « COMPLETED » ne prouve pas que la donnée est juste",
                 "Le mapper déclare LABEL_COLUMN mais n'appelle jamais setLabel() : le libellé n'est pas copié. (grep : aucun setLabel dans ce mapper)",
                 "Une donnée perdue sans aucune erreur, avec des tests verts. On vérifie le CONTENU (fichier attendu, valeurs).")]
A["L79"] = [C("dbWriter", [("private static final String UPDATE_PRICE_QUERY", "time_stamp = :time_stamp WHERE id = :id"),
                           ('@Bean @Qualifier("update_price_in_db")', ".build();")], "JdbcBatchItemWriter",
              "Requête nommée : un UPDATE par id, envoyé en batch JDBC pour tout le chunk.")]
A["L80"] = [C("dbWriter", [("private static final String UPDATE_PRICE_QUERY", "time_stamp = :time_stamp WHERE id = :id")], "Paramètres nommés",
              ":price, :time_stamp, :id correspondent aux propriétés du produit (BeanPropertyItemSqlParameterSourceProvider).")]
A["L81"] = [BP("Écriture idempotente (UPDATE par id)",
               "Un bloc peut être rejoué après un incident ou un redémarrage.",
               "Des doublons à la reprise : rejouer un UPDATE donne le même résultat, rejouer un INSERT crée des lignes en double.")]
# Scène 8
A["L82"] = [DIA("flow", ["s1", "dec", "many", "stat", "few"])]
A["L83"] = [C("incProc", [("private void incrementNumberOfAjustedProducts", "stepExecution.getExecutionContext().put")], "Compteur dans le contexte",
              "Le processor (@StepScope) range le nombre de prix ajustés dans l'ExecutionContext du step.")]
A["L84"] = [C("decider", [("public class MyUpdatedCountCheckingDecider", "public FlowExecutionStatus decide")], "JobExecutionDecider",
              "Reçoit la dernière StepExecution et retourne un statut libre pour aiguiller le flow.")]
A["L85"] = [C("decider", [("Integer nbAjustedProducts", "return new FlowExecutionStatus(stepExecution")], "Le statut",
              "Seuil atteint : COMPLETED_WITH_MANY_UPDATED, sinon on renvoie l'ExitStatus du step.")]
A["L86"] = [mark("decider", "if(nbAjustedProducts>=minManyUpdated)", "NPE si compteur absent"),
            TRAP("Tester l'absence avant de comparer (lu dans le code, non exécuté)",
                 "Si aucun produit n'est ajusté, la clé n'existe pas : get() retourne null et la comparaison déboxe un null.",
                 "Un job qui plante sur le cas le plus banal : aucune modification. Prévoir le défaut (0) et un test dédié.")]
A["L87"] = [C("incJob", [('@Bean(name="increaseProductPriceInDbJob")', 'var name = "insertIntoCsvFromDbJob"')], "Le job",
              "Le bean s'appelle increaseProductPriceInDbJob, mais le job est nommé autrement…")]
A["L88"] = [C("incJob", [("Step stepWhenFew", "Step stepWhenMany"), ("return builder.start(step1)", ".build();")], "Aiguillage",
              "Chaque statut du decider mène à un step ; MANY enchaîne ensuite sur le step de statistiques.")]
A["L89"] = [mark("incJob", 'var name = "insertIntoCsvFromDbJob"', "nom ≠ bean"),
            OUT(NAMEMISMATCH, True),
            BP("Un seul nom pour le job (bean = nom déclaré)",
               "Le journal réel affiche FlowJob [name=insertIntoCsvFromDbJob] alors que le bean s'appelle increaseProductPriceInDbJob.",
               "Une supervision où les noms ne correspondent à rien, et des JobInstance introuvables par leur nom.")]
# Scène 9
A["L90"] = [OUT(CSV_ERR, True)]
A["L91"] = [C("skipJob", [("public Step stepDetailsCsvToDbWithSkips", "return stepBuilder")], "Un step tolérant",
              "Même chunk de 5, mais avec une politique d'erreurs.")]
A["L92"] = [C("skipJob", [(".<ProductWithDetails, ProductWithDetails>chunk(5", ".faultTolerant().skipLimit(5)")], "skip",
              "faultTolerant() active la tolérance ; skipLimit(5) borne ; skip(ItemReaderException) cible l'erreur.")]
A["L93"] = [C("skipJob", [(".listener(new MySkippedErrorsListener())",) * 2]),
            C("skipLis", [("public class MySkippedErrorsListener", "SkipListener.super.onSkipInRead(t);")], "SkipListener",
              "onSkipInRead() est appelé pour chaque ligne ignorée : on trace.")]
A["L94"] = [OUT(SKIPS, True)]
A["L95"] = [BP("Borner le skip, cibler l'exception, tracer",
               "Un skip trop large (Exception) cache de vrais bugs ; sans limite, un fichier entièrement faux « réussit ».",
               "Des données perdues en silence. Idéalement : fichier de rejets + alerte au-delà d'un seuil.")]
A["L96"] = [OUT(PARSE, True)]
A["L97"] = [LIST("Bilan de mvn test (docs/verifications)", [["16 classes de test exécutées", "cyan"], ["15 réussies", "green"],
              ["1 échec : TestFromDetailsCsvToDbWithRestartableJob (fichier en erreur, step sans skip)", "orange"]], 3)]
A["L98"] = [C("restartLis", [("public ExitStatus afterStep", "stepExecution.setStatus(batchStatus);")], "Le statut qui compte",
              "Le restart dépend du BatchStatus (FAILED/STOPPED), pas de l'ExitStatus.")]
A["L99"] = [C("restartJob", [(".startLimit(3)", ".listener(new MyStoppedForRestartExecutionListener())")]),
            BP("startLimit pour borner les redémarrages",
               "Un relancement automatique sans limite peut boucler ; le statut (BatchStatus) commande la reprise, pas le statut de sortie.",
               "Un batch qui retente sans fin et pollue le JobRepository. startLimit(3) = 1 lancement + 2 reprises.")]
# Scène 10
A["L100"] = [DIA("partition", ["m", "w", "db"])]
A["L101"] = [C("partitioner", [("public Map<String, ExecutionContext> partition(int gridSize)", "int range =")], "Partitioner",
              "Calcule min et max des id, puis une plage par partition (gridSize = nombre de threads).")]
A["L102"] = [C("partitioner", [("ExecutionContext partitionExecutionContext", 'partitionExecutionContext.putInt("to", to);')], "Un contexte par partition",
              "Chaque worker reçoit from et to dans son propre ExecutionContext.")]
A["L103"] = [C("partJob", [('@Bean @Qualifier("dbToDbWithPriceIncreasePartitionManager")', ".build();")], "Step manager",
              "partitioner(...).step(worker).gridSize(4).taskExecutor(...) : 4 workers en parallèle.")]
A["L104"] = [C("partReader", [("@StepScope", '@Value("#{stepExecutionContext[to]}") Integer to)')], "Reader par partition",
              "Reader paginé en @StepScope : chacun lit #{stepExecutionContext[from]} → [to]."),
            BP("Reader paginé et @StepScope pour chaque partition",
               "Un reader à curseur (JdbcCursorItemReader) n'est pas sûr entre plusieurs threads ; en step scope chaque worker a le sien.",
               "Des lignes lues deux fois ou jamais, et des écritures concurrentes incohérentes.")]
# Scène 11
A["L105"] = [C("testAbs", [("public abstract class AbstractBasicActiveTestJob", "postJobCheckings();")], "Test générique",
              "Lance le job avec les paramètres, vérifie le nom et l'exitCode COMPLETED, puis un hook postJobCheckings().")]
A["L106"] = [C("testInc", [("public class TestIncreaseProductPriceInDbJob", ".addLong(\"minManyUpdated\",2L);")], "Un test concret",
              "Ne fournit que ses paramètres : taux, catégorie, seuil du decider.")]
A["L107"] = [BP("Un test prépare lui-même ses données (CONFIRMÉ)",
               "Au premier lancement de ce dépôt, deux tests ont échoué : les tables de productdb n'existaient pas (scripts SQL à lancer à la main).",
               "Un test qui passe sur une machine et échoue sur l'autre. Préférer spring.sql.init ou un @Sql de test.")]
# Scène 12
SRC6 = "Source : documentation officielle Spring Batch 6 (texte fourni) · non exécuté ici"
def snip(title, lines): return {"k": "snip", "title": title, "lines": lines}
A["L108"] = [LIST("Dépendances de Spring Batch 6", [["Spring Framework 7.0 · Spring Integration 7.0", "purple"], ["Spring Data 4.0 · Spring LDAP 4.0", "purple"],
              ["Spring AMQP 4.0 · Spring Kafka 4.0 · Micrometer 1.16", "purple"], ["Notre dépôt : Spring Boot 3.2.4 · Spring Batch 5.1.x", "green"]], 4)]
A["L109"] = [LIST("Infrastructure simplifiée", [["JobRepository étend JobExplorer", "purple"], ["JobOperator étend JobLauncher", "purple"],
              ["JobRegistry optionnel, enregistrement automatique", "purple"], ["Gestionnaire de transaction optionnel", "purple"]], 4),
             UPD("Moins de beans de configuration", "Il n'y a plus à définir JobExplorer, JobLauncher, JobRegistrySmartInitializingSingleton, ni à synchroniser le même sérialiseur de contexte sur deux beans.",
                 "Une dizaine de beans à écrire et à garder cohérents. Pour notre dépôt : JobLauncher devient JobOperator.", src=SRC6)]
A["L110"] = [snip("Exemple de la documentation (Spring Batch 6)", [
                '@EnableBatchProcessing(taskExecutorRef = "batchTaskExecutor")',
                '@EnableJdbcJobRepository(dataSourceRef = "batchDataSource",',
                '        transactionManagerRef = "batchTransactionManager")',
                'class MyJobConfiguration {', '    ...', '}']),
             UPD("Annotations par stockage ; dépôt « sans ressource » par défaut",
                 "@EnableBatchProcessing règle les attributs communs ; @EnableJdbcJobRepository ou @EnableMongoJobRepository règle le stockage. DefaultBatchConfiguration utilise ResourcelessJobRepository : plus d'H2 pour les métadonnées.",
                 "Une base en mémoire inutile. Attention : « pas d'@EnableBatchProcessing » (scène 6) vaut pour Spring Batch 5 avec Spring Boot 3 ; la v6 change les règles.", src=SRC6)]
A["L111"] = [snip("Exemple de la documentation (Spring Batch 6)", [
                'return new ChunkOrientedStepBuilder<Person, Person>("step", jobRepository, chunkSize)',
                '    .reader(itemReader)', '    .writer(itemWriter)', '    .faultTolerant()',
                '    .retryPolicy(retryPolicy)', '    .skipPolicy(skipPolicy)', '    .build();']),
             UPD("ChunkOrientedStep : retry et skip repensés",
                 "ChunkOrientedStep remplace TaskletStep / ChunkOrientedTasklet (expérimental en 5.1, stable en 6.0). Retry basé sur Spring Framework 7 (plus Spring Retry) ; skip entièrement basé sur SkipPolicy.",
                 "Notre .faultTolerant().skipLimit(5).skip(...) sera à migrer : le guide de migration détaille le passage.", src=SRC6)]
A["L112"] = [LIST("Concurrence et distribution", [["Modèle producteur-consommateur, file interne bornée", "purple"], ["Local chunking : plusieurs threads dans une JVM", "purple"],
              ["Remote step et SEDA via Spring Integration", "purple"], ["Nos partitions : concept toujours valable", "green"]], 4)]
A["L113"] = [LIST("Exploitation", [["CommandLineJobOperator (start, stop, restart…)", "purple"], ["JobOperator.recover : récupérer une exécution morte", "purple"],
              ["StoppableStep et arrêt en douceur (graceful shutdown)", "purple"], ["Événements Java Flight Recorder (JFR)", "purple"]], 4),
             UPD("recover : fini les corrections SQL à la main",
                 "Avant la v6, une exécution tuée brutalement ne pouvait se récupérer qu'en modifiant la base à la main, différemment selon le type de repository.",
                 "Des UPDATE manuels risqués, et incohérents entre JDBC et NoSQL.", src=SRC6)]
A["L114"] = [LIST("Dépréciations (suppression prévue en v7 pour le XML)", [["Configuration XML (namespace batch) : nos jobs du profil xmlJobConfig", "red"],
              ["Jackson 2 → Jackson 3 (jackson-databind du pom)", "orange"], ["Support de JUnit 4 dans spring-batch-test", "orange"],
              ["@EnableBatchProcessing(modular = true)", "orange"]], 4),
             UPD("Planifier la migration avant la suppression",
                 "La documentation annonce la suppression du namespace XML batch en 7.0 ; Jackson 2 et JUnit 4 sont aussi dépréciés.",
                 "Une migration en urgence le jour où la version suivante devient obligatoire.", src=SRC6)]
A["L115"] = [LIST("À retenir sur la v6", [["Les concepts du cours ne changent pas", "green"], ["Changent : configuration et lancement", "orange"],
              ["Lire le guide de migration avant de migrer", "cyan"]], 3)]

# Scène 13
LEV = [["Développeur : tasklet ou chunk, paramètres en scope, tests de contenu", "cyan"],
       ["Tech Lead : chunk mesuré, skip borné et tracé, secrets hors de git", "orange"],
       ["Architecte : reprise, idempotence, partitions, supervision, migration", "purple"]]
A["L116"] = [LIST("Trois niveaux", LEV, 1)]
A["L117"] = [LIST("Trois niveaux", LEV, 2)]
A["L118"] = [LIST("Trois niveaux", LEV, 3)]
A["L119"] = [{"k": "rule", "text": "Un bon batch se lit par blocs, s'écrit sans doublon, et se reprend là où il s'est arrêté."}]


# ---- Scène 3 : architecture en couches (documentation officielle)
A["L13"] = [DIA("layers", ["app", "core", "infra"])]
A["L14"] = [DIA("layers", ["app"])]
A["L15"] = [DIA("layers", ["core"])]
A["L16"] = [DIA("layers", ["infra"])]
A["L17"] = [{"k": "road"}]
# ---- Scène 4 : principes généraux
A["L18"] = [LIST("Principes généraux d'un bon batch", [["Un batch touche l'architecture en ligne, et inversement", "cyan"],
              ["Simplifier : pas de logique complexe dans un seul batch", "cyan"],
              ["Données et traitement physiquement proches", "cyan"]], 3)]
A["L19"] = [BP("Minimiser les entrées-sorties",
               "Les E/S sont le premier coût d'un batch : faire un maximum en mémoire, et analyser les requêtes SQL.",
               "Relire la même donnée à chaque transaction, la relire dans la même transaction, des scans de table ou d'index inutiles, une clause WHERE sans clé.", src=SRC)]
A["L20"] = [BP("Ne pas faire les choses deux fois",
               "Un total de reporting recalculé après coup oblige à relire toutes les données déjà traitées.",
               "Un second passage complet : on incrémente les totaux stockés pendant le traitement initial.", src=SRC)]
A["L21"] = [BP("Toujours supposer le pire sur les données",
               "Les données entrantes sont fausses ou incomplètes tant qu'on ne les a pas contrôlées : validation de chaque enregistrement, total de contrôle (ligne de fin avec nombre d'enregistrements et agrégat de clés).",
               "Un fichier tronqué ou corrompu accepté comme complet, et des erreurs découvertes trop tard.", src=SRC)]
A["L22"] = [BP("Tester la charge tôt, avec des volumes réalistes",
               "Un batch grossit avec le temps, en volume comme en complexité ; les goulots n'apparaissent qu'à l'échelle réelle.",
               "Découvrir la limite en production, en pleine fenêtre batch.", src=SRC)]
A["L23"] = [BP("Sauvegarder les fichiers comme les bases, et tester la restauration",
               "Les sauvegardes de bases sont souvent bien gérées côté en ligne ; celles des fichiers plats sont oubliées.",
               "Un batch qui dépend de fichiers plats impossibles à retrouver après un incident.", src=SRC)]
A["L24"] = [LIST("Simplicité", [["Décomposer en steps simples", "green"], ["Garder les données près du traitement", "green"],
              ["Réutiliser des briques communes avec l'en ligne", "green"]], 3)]
# ---- Scène 5 : stratégies et partitionnement
A["L25"] = [LIST("Briques standard d'un job", [["Conversion : format externe → format standard", "cyan"], ["Validation : cohérence entrées et sorties", "cyan"],
              ["Extraction : lire, sélectionner, écrire un fichier", "cyan"], ["Extraction avec mise à jour : modifier base ou fichier", "cyan"],
              ["Traitement et mise à jour : règles métier", "cyan"], ["Mise en forme de la sortie : fichier à transmettre", "cyan"]], 6)]
A["L26"] = [{"k": "table", "title": "Utilitaires et sources d'entrée", "head": ["Utilitaire", "Piloté par"],
             "rows": [["Trier (re-séquencer par clé)", "une base de données (lignes)"], ["Répartir (1 fichier → plusieurs)", "un fichier (enregistrements)"],
                      ["Fusionner (plusieurs → 1)", "une file de messages"]]}]
A["L27"] = [LIST("Stratégies, de la plus simple à la plus complexe", [["1 · Traitement normal dans une fenêtre batch", "green"],
              ["2 · Batch concurrent avec l'en ligne", "green"], ["3 · Jobs différents en parallèle", "orange"],
              ["4 · Partitionnement (même job, plusieurs instances)", "orange"], ["5 · Une combinaison des précédentes", "red"]], 5)]
A["L28"] = [BP("Prévoir validation et reprise, même dans le cas le plus simple",
               "Un batch grossit en volume et en complexité ; un unique commit final devient une contrainte douloureuse à modifier.",
               "Un batch impossible à relancer et à faire évoluer : on prévoit des points de validation pour la reprise.", src=SRC)]
A["L29"] = [{"k": "table", "title": "Verrouillage logique", "head": ["", "Optimiste", "Pessimiste"],
             "rows": [["Hypothèse", "peu de conflits", "conflits probables"], ["Principe", "horodatage relu dans le WHERE de l'UPDATE", "drapeau ou verrou posé à la lecture"],
                      ["Convient plutôt à", "applications en ligne", "applications batch"]]}]
A["L30"] = [BP("Un même schéma de verrouillage pour tous (règle de pouce)",
               "Optimiste plutôt pour l'en ligne, pessimiste plutôt pour le batch ; et tous les programmes qui touchent la donnée doivent suivre le même schéma.",
               "Des mises à jour perdues, des verrous incohérents ou des interblocages entre batch et en ligne.", src=SRC)]
A["L31"] = [DIA("partfig", ["single", "par"])]
A["L32"] = [LIST("Six façons de découper (cas par cas)", [["Parts égales (bornes basse et haute)", "cyan"], ["Par colonne clé (code, plage de valeurs)", "cyan"],
              ["Par vues (découpage au niveau base)", "cyan"], ["Indicateur de traitement (non traité / en cours / fini)", "cyan"],
              ["Extraction vers fichier plat, puis découpage", "cyan"], ["Colonne de hachage (instance A, B, C…)", "cyan"]], 6)]
A["L33"] = [BP("Valider les partitions avant de lancer",
               "Les partitions doivent couvrir toute la plage, sans trou, et chacune ne traiter que sa part ; décider aussi du sort des autres si l'une échoue.",
               "Des données jamais traitées, des données traitées deux fois, ou un job bloqué parce qu'une partition a échoué.", src=SRC)]
A["L34"] = [DIA("partfig", ["par"])]
A["L35"] = [{"k": "road"}]

# ------------------------------------------------------------------ parse script.md
md = open(os.path.join(ROOT, "video", "script.md"), encoding="utf-8").read()
scenes, cur = [], None
for line in md.splitlines():
    m = re.match(r"### Scène (\d+) : (.*)", line)
    if m:
        cur = {"id": int(m.group(1)), "title": m.group(2).strip(), "beats": []}
        scenes.append(cur); continue
    m = re.match(r"\| (L\d+) \| (.*?) \| (.*) \| (.*) \|$", line)
    if m and cur is not None:
        cur["beats"].append({"id": m.group(1), "expr": m.group(2), "text": m.group(3), "screen": m.group(4)})

ids = [b["id"] for s in scenes for b in s["beats"]]
assert ids == [f"L{i:02d}" for i in range(1, len(ids) + 1)], "identifiants L01.. non continus"
missing = [i for i in ids if i not in A]
extra = [i for i in A if i not in ids]
if missing or extra:
    sys.exit(f"lignes sans action: {missing} ; actions sans ligne: {extra}")

# contrôle d'ancrage : les cartes bonne pratique doivent avoir une ligne 'alerte' et inversement
for s in scenes:
    for b in s["beats"]:
        has_bp = any(a["k"] == "bp" for a in A[b["id"]])
        if has_bp != (b["expr"].strip() == "alerte"):
            sys.exit(f"{b['id']}: carte bonne pratique et expression 'alerte' incohérentes")
        b["acts"] = A[b["id"]]


# ------------------------------------------------------------------ repères : étape du TP et couche
STEPS = ["Projet et JobRepository", "Premier job : tasklet", "Job, instance, paramètres", "Chunk : CSV vers console",
         "JSON et XML (hors vidéo)", "Base de données", "Flow et decider", "Erreurs : skip", "Reprise : restart", "Partitions", "Tests"]
SCENE_STEP = {6: 1, 7: 2, 8: 3, 9: 4, 10: 6, 11: 7, 12: 8, 13: 10, 14: 11}
SCENE_LAYER = {6: "core", 7: "core", 8: "core", 9: "app", 10: "infra", 11: "core", 12: "core", 13: "core", 14: "app", 15: "core"}
FILE_LAYER = {"props": "core", "repoCfg": "core", "tasklet": "app", "hello": "app", "csvJob": "app", "csvReader": "infra", "upper": "app",
              "dbReader": "infra", "rowMapper": "app", "dbWriter": "infra", "incProc": "app", "decider": "core", "incJob": "app",
              "skipJob": "core", "skipLis": "core", "restartLis": "core", "restartJob": "core", "partitioner": "core",
              "partJob": "core", "partReader": "infra", "testAbs": "app", "testInc": "app"}
for s in scenes:
    step = SCENE_STEP.get(s["id"], 0)
    cur_layer = SCENE_LAYER.get(s["id"])
    for b in s["beats"]:
        if s["id"] == 12 and b["text"].startswith("Autre stratégie : la reprise"):
            step = 9
        b["step"] = step
        lay = cur_layer
        for a in b["acts"]:
            if a["k"] == "code": lay = FILE_LAYER[a["f"]]
            if a["k"] == "dia" and a["id"] == "layers" and len(a["hl"]) == 1: lay = a["hl"][0]
        b["layer"] = lay
        if s["id"] in (3,) and b["layer"] is None: b["layer"] = None
        if lay: cur_layer = lay if s["id"] not in (3, 4, 5) else cur_layer

used = sorted({a["f"] for v in A.values() for a in v if a["k"] in ("code", "tab", "mark")})
files = {k: {"name": os.path.basename(FILE_PATHS[k]), "lines": load(k)} for k in used}
timing = json.load(open(os.path.join(ROOT, "video", "timing.json"), encoding="utf-8"))
data = {"scenes": scenes, "files": files, "extra": timing["extra_after"], "steps": STEPS}

tpl = open(os.path.join(ROOT, "video", "engine.html"), encoding="utf-8").read()
out = tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False))
open(os.path.join(ROOT, "video", "index.html"), "w", encoding="utf-8").write(out)
nbp = sum(1 for v in A.values() for a in v if a["k"] == "bp")
print(f"OK : {len(scenes)} scènes, {len(ids)} lignes de voix, {len(files)} fichiers réels, {nbp} cartes (bonnes pratiques/pièges/maj)")
