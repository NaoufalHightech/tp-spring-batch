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
def TRAP(title, why, saves): return BP(title, why, saves, "trap")
def UPD(title, why, saves): return BP(title, why, saves, "upd")

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
A["L07"] = [DIA("arch", ["job", "step", "tasklet"])]
A["L08"] = [DIA("arch", ["job", "step", "reader", "proc", "writer", "chunk"])]
A["L09"] = [DIA("arch", ["step", "tx", "reader", "proc", "writer", "chunk"])]
A["L10"] = [DIA("arch", ["job", "repo"])]
A["L11"] = [{"k": "table", "title": "Quand choisir Spring Batch ? (CONVENTION)", "head": ["Situation", "Choix"],
             "rows": [["Gros volumes, reprise nécessaire, suivi", "Spring Batch"],
                      ["Quelques dizaines de lignes, une fois", "Un simple script"],
                      ["Temps réel, événements", "Plutôt un broker (Kafka…)"]]}]
# Scène 3
A["L35"] = [{"k": "tab", "f": "props"}]
A["L36"] = [C("props", ("spring.batch.jdbc.initialize-schema=always",) * 2, "Schéma auto",
              "Au 1er démarrage, Spring Batch crée les tables BATCH_JOB_INSTANCE, BATCH_JOB_EXECUTION, BATCH_STEP_EXECUTION…")]
A["L37"] = [C("props", ("#disable auto lauching", "spring.batch.job.enabled=false"), "Pas de lancement auto",
              "Sans cette ligne, Spring Boot lance TOUS les jobs au démarrage."),
            BP("job.enabled = false", "Spring Boot lance sinon automatiquement tous les jobs trouvés au démarrage.",
               "Un lancement involontaire, et l'erreur « plusieurs jobs » quand l'application en contient plusieurs.")]
A["L38"] = [C("props", ("#secondary DataBases", "spring.productdb.datasource.password="), "Base métier à part",
              "productdb (H2 fichier) contient les produits. Elle n'est PAS la base du JobRepository.")]
A["L39"] = [C("repoCfg", ("=@Primary", "public DataSource datasource("), "Datasource principale",
              "@Primary + @BatchDataSource : c'est elle que Spring Boot utilise pour le JobRepository."),
            C("repoCfg", ("return dbDataSourceProperties", ".build();"))]
A["L40"] = [BP("Une seule datasource @Primary pour le JobRepository",
               "Spring Boot doit savoir sans ambiguïté où écrire ses métadonnées ; les autres bases sont qualifiées (@Qualifier).",
               "Des métadonnées écrites dans la mauvaise base, ou un échec au démarrage (plusieurs DataSource candidates).")]
A["L41"] = [C("repoCfg", ("Surtout pas ici",) * 2, "Pas d'@EnableBatchProcessing",
              "Commentaire du dépôt : avec Spring Boot 3, cette annotation désactive l'auto-configuration."),
            TRAP("N'ajoute pas @EnableBatchProcessing avec Spring Boot 3",
                 "Elle désactive l'auto-configuration de Spring Boot pour Spring Batch.",
                 "Un JobRepository et un lanceur qui ne sont plus créés comme prévu, et un schéma non initialisé.")]
A["L42"] = [C("props", ("spring.datasource.username=root", "spring.datasource.password=root"), "Secret en clair",
              "Constaté dans le dépôt : identifiants MariaDB dans application.properties."),
            mark("props", "spring.datasource.password=root", "secret en clair"),
            BP("Secrets par variable d'environnement",
               "Un fichier versionné est lu par tous ceux qui ont accès au dépôt, pour toujours (historique git).",
               "La fuite d'un mot de passe de base : on écrit ${DB_PASSWORD} et la valeur reste hors de git.")]
# Scène 4
A["L43"] = [{"k": "tab", "f": "tasklet"}]
A["L44"] = [C("tasklet", ("public class PrintMessageTasklet", "public class PrintMessageTasklet"), "Une Tasklet",
              "Interface Tasklet : une seule méthode execute(), pour une action unique.")]
A["L45"] = [C("tasklet", ("@Override", "public RepeatStatus execute"), "execute()",
              "Appelée par Spring Batch dans une transaction ; reçoit le contexte du chunk en cours.")]
A["L46"] = [C("tasklet", ("System.out.println(message);",) * 2, "Le travail",
              "Ici un simple affichage. Ailleurs : procédure stockée, ménage de fichiers, appel d'API.")]
A["L47"] = [C("tasklet", [("return RepeatStatus.FINISHED;", "}")], "FINISHED",
              "FINISHED = terminé. CONTINUABLE ferait rappeler la tasklet en boucle.")]
A["L48"] = [C("hello", [("@Configuration", "public class HelloWorldJobConfig")], "Classe de config",
              "Hérite de MyAbstractJobConfig, qui injecte jobRepository et batchTxManager.")]
A["L49"] = [C("hello", [("public Step simplePrintMessageStep", ".build();")], "Le Step",
              "StepBuilder(nom, jobRepository).tasklet(tasklet, txManager) : le gestionnaire de transaction est explicite en Batch 5.")]
A["L50"] = [C("hello", [('@Bean(name="myHelloWorldJob")', "return this.buildMySingleStepJob")], "Le Job",
              "Le nom du job est celui du bean : c'est lui qu'on passera au lanceur.")]
A["L51"] = [OUT(HELLO, True)]
A["L52"] = [BP("Même nom partout : job, bean, journal",
               "Ce nom est celui que voient les tables BATCH_* et les outils de supervision.",
               "Chercher un job sous un autre nom pendant un incident. (Un écart existe dans ce dépôt : scène 11.)")]
# Scène 5
PRED = {"k": "pred", "q": "On relance le MÊME job avec EXACTEMENT les mêmes paramètres. Le 1er lancement a réussi.",
        "opts": ["Le job tourne une 2e fois", "Spring Batch refuse le 2e lancement", "Le 2e lancement écrase le 1er"], "ans": 1}
A["L53"] = [dict(PRED, reveal=False)]
A["L54"] = [DIA("instance", ["job", "inst", "params"])]
A["L55"] = [DIA("instance", ["job", "inst", "params", "exec", "step"])]
A["L56"] = [dict(PRED, reveal=True)]
A["L57"] = [BP("Paramètre métier plutôt qu'horodatage (CONVENTION)",
               "Le TP ajoute un horodatage pour pouvoir relancer à volonté ; mais un horodatage crée une NOUVELLE instance à chaque lancement.",
               "L'impossibilité de reprendre un job échoué : on reprend avec les mêmes paramètres (ex. date de traitement).")]
# Scène 6
A["L58"] = [C("csvJob", [('@Bean @Qualifier("csvToConsole")', 'var name = "stepCsvToConsole"')], "Déclarer le step",
              "Un Step est un bean ; on lui injecte reader, writer et processor.")]
A["L59"] = [C("csvJob", [("return stepBuilder", ".<Product, Product>chunk(5")], "Types du chunk",
              "<Product, Product> : type lu / type écrit. Le compilateur vérifie la chaîne.")]
A["L60"] = [C("csvJob", (".<Product, Product>chunk(5",) * 2, "Chunk de 5",
              "5 éléments lus puis écrits en UNE transaction (commit interval).")]
A["L61"] = [C("csvJob", [(".reader(productItemReader)", ".build();")], "Reader · Processor · Writer",
              "Lire un à un, transformer, écrire le bloc. build() construit le step.")]
A["L62"] = [BP("Taille de chunk choisie en connaissance de cause (CONVENTION)",
               "Trop petit : trop de commits. Trop grand : mémoire et gros rollback. Ici 5 pour la lisibilité ; en production on mesure (souvent 100 à 1000).",
               "Un batch lent ou qui sature la mémoire, ou qui perd un énorme bloc au moindre échec.")]
A["L63"] = [C("csvReader", [('@Bean @Qualifier("csv")', "public FlatFileItemReader<Product> productCsvFileReader(")], "Le reader CSV",
              "@JobScope : le bean est créé au démarrage du job, quand les paramètres existent.")]
A["L64"] = [C("csvReader", [("return new FlatFileItemReaderBuilder", '.name("productCsvFileReader")')], "FlatFileItemReader",
              "Le builder évite la config verbeuse. Le nom sert à sauvegarder la position (ItemStream) pour le restart.")]
A["L65"] = [C("csvReader", [(".linesToSkip(1)", '.delimiter(";")')], "Format du fichier",
              "On saute l'en-tête ; séparateur point-virgule.")]
A["L66"] = [C("csvReader", [(".names(", ".build();")], "Colonnes → propriétés",
              "Les noms correspondent aux propriétés de Product ; targetType crée les objets.")]
A["L67"] = [C("csvReader", [('@Value("#{jobParameters', "Resource inputCsvResource"), (".resource(inputCsvResource)",) * 2], "Fichier = paramètre",
              "Le chemin vient du paramètre inputFilePath : même job, autres fichiers, sans recompiler.")]
A["L68"] = [BP("@StepScope / @JobScope pour tout bean qui lit un paramètre",
               "Le bean n'est créé qu'au démarrage du step ou du job, quand #{jobParameters[...]} existe ; chaque exécution a sa propre instance.",
               "Un paramètre nul au démarrage, ou un état partagé entre deux exécutions (ou deux threads).")]
A["L69"] = [C("upper", [("@Component", "public class SimpleUppercaseProductProcessor")], "Un processor",
              "ItemProcessor<Product,Product> : un élément entre, un élément sort.")]
A["L70"] = [C("upper", [("public Product process", "return product;")], "process()",
              "On construit un NOUVEAU produit. Retourner null filtrerait l'élément (filterCount).")]
A["L71"] = [OUT(UPPER, True)]
A["L72"] = [BP("Un processor sans effet de bord caché",
               "Un chunk annulé est rejoué : le processor peut donc être appelé deux fois pour le même élément.",
               "Des compteurs ou des écritures en double après un rollback ou un retry.")]
# Scène 7
A["L73"] = [C("dbReader", [("private static final String SELECT_QUERY", "private static final String SELECT_QUERY"),
                           ("return new JdbcCursorItemReaderBuilder", ".build();")], "Reader JDBC",
              "Une requête SELECT, la datasource productdb (qualifiée) et un RowMapper.")]
A["L74"] = [C("rowMapper", [("public ProductWithDetails mapRow", "return p;")], "RowMapper",
              "Transforme une ligne SQL en objet. Lis-le attentivement…")]
A["L75"] = [C("rowMapper", [("public static final String LABEL_COLUMN",) * 2], None, None),
            mark("rowMapper", "public static final String LABEL_COLUMN", "jamais utilisée"),
            TRAP("Un test « COMPLETED » ne prouve pas que la donnée est juste",
                 "Le mapper déclare LABEL_COLUMN mais n'appelle jamais setLabel() : le libellé n'est pas copié. (grep : aucun setLabel dans ce mapper)",
                 "Une donnée perdue sans aucune erreur, avec des tests verts. On vérifie le CONTENU (fichier attendu, valeurs).")]
A["L76"] = [C("dbWriter", [("private static final String UPDATE_PRICE_QUERY", "time_stamp = :time_stamp WHERE id = :id"),
                           ('@Bean @Qualifier("update_price_in_db")', ".build();")], "JdbcBatchItemWriter",
              "Requête nommée : un UPDATE par id, envoyé en batch JDBC pour tout le chunk.")]
A["L77"] = [C("dbWriter", [("private static final String UPDATE_PRICE_QUERY", "time_stamp = :time_stamp WHERE id = :id")], "Paramètres nommés",
              ":price, :time_stamp, :id correspondent aux propriétés du produit (BeanPropertyItemSqlParameterSourceProvider).")]
A["L78"] = [BP("Écriture idempotente (UPDATE par id)",
               "Un bloc peut être rejoué après un incident ou un redémarrage.",
               "Des doublons à la reprise : rejouer un UPDATE donne le même résultat, rejouer un INSERT crée des lignes en double.")]
# Scène 8
A["L79"] = [DIA("flow", ["s1", "dec", "many", "stat", "few"])]
A["L80"] = [C("incProc", [("private void incrementNumberOfAjustedProducts", "stepExecution.getExecutionContext().put")], "Compteur dans le contexte",
              "Le processor (@StepScope) range le nombre de prix ajustés dans l'ExecutionContext du step.")]
A["L81"] = [C("decider", [("public class MyUpdatedCountCheckingDecider", "public FlowExecutionStatus decide")], "JobExecutionDecider",
              "Reçoit la dernière StepExecution et retourne un statut libre pour aiguiller le flow.")]
A["L82"] = [C("decider", [("Integer nbAjustedProducts", "return new FlowExecutionStatus(stepExecution")], "Le statut",
              "Seuil atteint : COMPLETED_WITH_MANY_UPDATED, sinon on renvoie l'ExitStatus du step.")]
A["L83"] = [mark("decider", "if(nbAjustedProducts>=minManyUpdated)", "NPE si compteur absent"),
            TRAP("Tester l'absence avant de comparer (lu dans le code, non exécuté)",
                 "Si aucun produit n'est ajusté, la clé n'existe pas : get() retourne null et la comparaison déboxe un null.",
                 "Un job qui plante sur le cas le plus banal : aucune modification. Prévoir le défaut (0) et un test dédié.")]
A["L84"] = [C("incJob", [('@Bean(name="increaseProductPriceInDbJob")', 'var name = "insertIntoCsvFromDbJob"')], "Le job",
              "Le bean s'appelle increaseProductPriceInDbJob, mais le job est nommé autrement…")]
A["L85"] = [C("incJob", [("Step stepWhenFew", "Step stepWhenMany"), ("return builder.start(step1)", ".build();")], "Aiguillage",
              "Chaque statut du decider mène à un step ; MANY enchaîne ensuite sur le step de statistiques.")]
A["L86"] = [mark("incJob", 'var name = "insertIntoCsvFromDbJob"', "nom ≠ bean"),
            OUT(NAMEMISMATCH, True),
            BP("Un seul nom pour le job (bean = nom déclaré)",
               "Le journal réel affiche FlowJob [name=insertIntoCsvFromDbJob] alors que le bean s'appelle increaseProductPriceInDbJob.",
               "Une supervision où les noms ne correspondent à rien, et des JobInstance introuvables par leur nom.")]
# Scène 9
A["L87"] = [OUT(CSV_ERR, True)]
A["L88"] = [C("skipJob", [("public Step stepDetailsCsvToDbWithSkips", "return stepBuilder")], "Un step tolérant",
              "Même chunk de 5, mais avec une politique d'erreurs.")]
A["L89"] = [C("skipJob", [(".<ProductWithDetails, ProductWithDetails>chunk(5", ".faultTolerant().skipLimit(5)")], "skip",
              "faultTolerant() active la tolérance ; skipLimit(5) borne ; skip(ItemReaderException) cible l'erreur.")]
A["L90"] = [C("skipJob", [(".listener(new MySkippedErrorsListener())",) * 2]),
            C("skipLis", [("public class MySkippedErrorsListener", "SkipListener.super.onSkipInRead(t);")], "SkipListener",
              "onSkipInRead() est appelé pour chaque ligne ignorée : on trace.")]
A["L91"] = [OUT(SKIPS, True)]
A["L92"] = [BP("Borner le skip, cibler l'exception, tracer",
               "Un skip trop large (Exception) cache de vrais bugs ; sans limite, un fichier entièrement faux « réussit ».",
               "Des données perdues en silence. Idéalement : fichier de rejets + alerte au-delà d'un seuil.")]
A["L93"] = [OUT(PARSE, True)]
A["L94"] = [LIST("Bilan de mvn test (docs/verifications)", [["16 classes de test exécutées", "cyan"], ["15 réussies", "green"],
              ["1 échec : TestFromDetailsCsvToDbWithRestartableJob (fichier en erreur, step sans skip)", "orange"]], 3)]
A["L95"] = [C("restartLis", [("public ExitStatus afterStep", "stepExecution.setStatus(batchStatus);")], "Le statut qui compte",
              "Le restart dépend du BatchStatus (FAILED/STOPPED), pas de l'ExitStatus.")]
A["L96"] = [C("restartJob", [(".startLimit(3)", ".listener(new MyStoppedForRestartExecutionListener())")]),
            BP("startLimit pour borner les redémarrages",
               "Un relancement automatique sans limite peut boucler ; le statut (BatchStatus) commande la reprise, pas le statut de sortie.",
               "Un batch qui retente sans fin et pollue le JobRepository. startLimit(3) = 1 lancement + 2 reprises.")]
# Scène 10
A["L97"] = [DIA("partition", ["m", "w", "db"])]
A["L98"] = [C("partitioner", [("public Map<String, ExecutionContext> partition(int gridSize)", "int range =")], "Partitioner",
              "Calcule min et max des id, puis une plage par partition (gridSize = nombre de threads).")]
A["L99"] = [C("partitioner", [("ExecutionContext partitionExecutionContext", 'partitionExecutionContext.putInt("to", to);')], "Un contexte par partition",
              "Chaque worker reçoit from et to dans son propre ExecutionContext.")]
A["L100"] = [C("partJob", [('@Bean @Qualifier("dbToDbWithPriceIncreasePartitionManager")', ".build();")], "Step manager",
              "partitioner(...).step(worker).gridSize(4).taskExecutor(...) : 4 workers en parallèle.")]
A["L101"] = [C("partReader", [("@StepScope", '@Value("#{stepExecutionContext[to]}") Integer to)')], "Reader par partition",
              "Reader paginé en @StepScope : chacun lit #{stepExecutionContext[from]} → [to]."),
            BP("Reader paginé et @StepScope pour chaque partition",
               "Un reader à curseur (JdbcCursorItemReader) n'est pas sûr entre plusieurs threads ; en step scope chaque worker a le sien.",
               "Des lignes lues deux fois ou jamais, et des écritures concurrentes incohérentes.")]
# Scène 11
A["L102"] = [C("testAbs", [("public abstract class AbstractBasicActiveTestJob", "postJobCheckings();")], "Test générique",
              "Lance le job avec les paramètres, vérifie le nom et l'exitCode COMPLETED, puis un hook postJobCheckings().")]
A["L103"] = [C("testInc", [("public class TestIncreaseProductPriceInDbJob", ".addLong(\"minManyUpdated\",2L);")], "Un test concret",
              "Ne fournit que ses paramètres : taux, catégorie, seuil du decider.")]
A["L104"] = [BP("Un test prépare lui-même ses données (CONFIRMÉ)",
               "Au premier lancement de ce dépôt, deux tests ont échoué : les tables de productdb n'existaient pas (scripts SQL à lancer à la main).",
               "Un test qui passe sur une machine et échoue sur l'autre. Préférer spring.sql.init ou un @Sql de test.")]
# Scène 12
A["L105"] = [LIST("Versions", [["Ce dépôt : Spring Boot 3.2.4 · Spring Batch 5.1.x · Java 17 (CONFIRMÉ)", "green"], ["Spring Batch 6 · Spring Boot 4 : JobOperator, JobExplorer fusionné (RECONSTITUTION)", "purple"]], 2),
            UPD("Spring Batch 6 (avec Spring Boot 4) : RECONSTITUTION",
                "Le dépôt est en Spring Batch 5.1 / Boot 3.2. En version 6, JobOperator remplace JobLauncher et JobExplorer est fusionné dans JobRepository.",
                "Vérifie la note de version officielle avant de migrer : cette information vient de ma connaissance, pas d'une exécution.")]
A["L106"] = [LIST("RECONSTITUTION : à vérifier avant usage", [["Source : ma connaissance des versions récentes, pas une exécution", "purple"],
              ["Les concepts (job, step, chunk, instance, execution, scopes) restent valables", "green"],
              ["Seules les classes de lancement évoluent : lis la note de version", "orange"]], 3)]
# Scène 13
LEV = [["Développeur : tasklet ou chunk, paramètres en scope, tests de contenu", "cyan"],
       ["Tech Lead : chunk mesuré, skip borné et tracé, secrets hors de git", "orange"],
       ["Architecte : reprise, idempotence, partitions, supervision, migration", "purple"]]
A["L107"] = [LIST("Trois niveaux", LEV, 1)]
A["L108"] = [LIST("Trois niveaux", LEV, 2)]
A["L109"] = [LIST("Trois niveaux", LEV, 3)]
A["L110"] = [{"k": "rule", "text": "Un bon batch se lit par blocs, s'écrit sans doublon, et se reprend là où il s'est arrêté."}]


# ---- Scène 3 : architecture en couches (documentation officielle)
A["L12"] = [DIA("layers", ["app", "core", "infra"])]
A["L13"] = [DIA("layers", ["app"])]
A["L14"] = [DIA("layers", ["core"])]
A["L15"] = [DIA("layers", ["infra"])]
A["L16"] = [{"k": "road"}]
# ---- Scène 4 : principes généraux
A["L17"] = [LIST("Principes généraux d'un bon batch", [["Un batch touche l'architecture en ligne, et inversement", "cyan"],
              ["Simplifier : pas de logique complexe dans un seul batch", "cyan"],
              ["Données et traitement physiquement proches", "cyan"]], 3)]
A["L18"] = [BP("Minimiser les entrées-sorties",
               "Les E/S sont le premier coût d'un batch : faire un maximum en mémoire, et analyser les requêtes SQL.",
               "Relire la même donnée à chaque transaction, la relire dans la même transaction, des scans de table ou d'index inutiles, une clause WHERE sans clé.", src=SRC)]
A["L19"] = [BP("Ne pas faire les choses deux fois",
               "Un total de reporting recalculé après coup oblige à relire toutes les données déjà traitées.",
               "Un second passage complet : on incrémente les totaux stockés pendant le traitement initial.", src=SRC)]
A["L20"] = [BP("Toujours supposer le pire sur les données",
               "Les données entrantes sont fausses ou incomplètes tant qu'on ne les a pas contrôlées : validation de chaque enregistrement, total de contrôle (ligne de fin avec nombre d'enregistrements et agrégat de clés).",
               "Un fichier tronqué ou corrompu accepté comme complet, et des erreurs découvertes trop tard.", src=SRC)]
A["L21"] = [BP("Tester la charge tôt, avec des volumes réalistes",
               "Un batch grossit avec le temps, en volume comme en complexité ; les goulots n'apparaissent qu'à l'échelle réelle.",
               "Découvrir la limite en production, en pleine fenêtre batch.", src=SRC)]
A["L22"] = [BP("Sauvegarder les fichiers comme les bases, et tester la restauration",
               "Les sauvegardes de bases sont souvent bien gérées côté en ligne ; celles des fichiers plats sont oubliées.",
               "Un batch qui dépend de fichiers plats impossibles à retrouver après un incident.", src=SRC)]
A["L23"] = [LIST("Simplicité", [["Décomposer en steps simples", "green"], ["Garder les données près du traitement", "green"],
              ["Réutiliser des briques communes avec l'en ligne", "green"]], 3)]
# ---- Scène 5 : stratégies et partitionnement
A["L24"] = [LIST("Briques standard d'un job", [["Conversion : format externe → format standard", "cyan"], ["Validation : cohérence entrées et sorties", "cyan"],
              ["Extraction : lire, sélectionner, écrire un fichier", "cyan"], ["Extraction avec mise à jour : modifier base ou fichier", "cyan"],
              ["Traitement et mise à jour : règles métier", "cyan"], ["Mise en forme de la sortie : fichier à transmettre", "cyan"]], 6)]
A["L25"] = [{"k": "table", "title": "Utilitaires et sources d'entrée", "head": ["Utilitaire", "Piloté par"],
             "rows": [["Trier (re-séquencer par clé)", "une base de données (lignes)"], ["Répartir (1 fichier → plusieurs)", "un fichier (enregistrements)"],
                      ["Fusionner (plusieurs → 1)", "une file de messages"]]}]
A["L26"] = [LIST("Stratégies, de la plus simple à la plus complexe", [["1 · Traitement normal dans une fenêtre batch", "green"],
              ["2 · Batch concurrent avec l'en ligne", "green"], ["3 · Jobs différents en parallèle", "orange"],
              ["4 · Partitionnement (même job, plusieurs instances)", "orange"], ["5 · Une combinaison des précédentes", "red"]], 5)]
A["L27"] = [BP("Prévoir validation et reprise, même dans le cas le plus simple",
               "Un batch grossit en volume et en complexité ; un unique commit final devient une contrainte douloureuse à modifier.",
               "Un batch impossible à relancer et à faire évoluer : on prévoit des points de validation pour la reprise.", src=SRC)]
A["L28"] = [{"k": "table", "title": "Verrouillage logique", "head": ["", "Optimiste", "Pessimiste"],
             "rows": [["Hypothèse", "peu de conflits", "conflits probables"], ["Principe", "horodatage relu dans le WHERE de l'UPDATE", "drapeau ou verrou posé à la lecture"],
                      ["Convient plutôt à", "applications en ligne", "applications batch"]]}]
A["L29"] = [BP("Un même schéma de verrouillage pour tous (règle de pouce)",
               "Optimiste plutôt pour l'en ligne, pessimiste plutôt pour le batch ; et tous les programmes qui touchent la donnée doivent suivre le même schéma.",
               "Des mises à jour perdues, des verrous incohérents ou des interblocages entre batch et en ligne.", src=SRC)]
A["L30"] = [DIA("partfig", ["single", "par"])]
A["L31"] = [LIST("Six façons de découper (cas par cas)", [["Parts égales (bornes basse et haute)", "cyan"], ["Par colonne clé (code, plage de valeurs)", "cyan"],
              ["Par vues (découpage au niveau base)", "cyan"], ["Indicateur de traitement (non traité / en cours / fini)", "cyan"],
              ["Extraction vers fichier plat, puis découpage", "cyan"], ["Colonne de hachage (instance A, B, C…)", "cyan"]], 6)]
A["L32"] = [BP("Valider les partitions avant de lancer",
               "Les partitions doivent couvrir toute la plage, sans trou, et chacune ne traiter que sa part ; décider aussi du sort des autres si l'une échoue.",
               "Des données jamais traitées, des données traitées deux fois, ou un job bloqué parce qu'une partition a échoué.", src=SRC)]
A["L33"] = [DIA("partfig", ["par"])]
A["L34"] = [{"k": "road"}]

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
