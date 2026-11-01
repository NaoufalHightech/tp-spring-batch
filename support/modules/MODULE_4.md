# Module 4 · Processors, scopes et proxys

> **Pile :** Java 25 · Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16.
> **Parcours :** Essentiel. (Parcours *Essentiel* : modules 1 à 6 ; parcours *Complet* : tous les modules.)
> **Durée vidéo visée :** 55 à 60 min, en 7 sous-vidéos de 5 à 10 min (voir la fin).
> **Prérequis :** Module 2 (cycle de vie des beans, singleton, `@StepScope`), Module 3 (chunk, `return null`).
> Projet de référence : `tp/tpProd`. C'est le module du bug le plus vicieux de Spring Batch : le **double comptage**.

---

## 1. Le concept

### 1.1 Le rôle du `ItemProcessor`

Entre le reader et le writer, le processor est l'endroit des **règles métier**. Il reçoit **un** élément et fait l'une de ces trois choses :

| Action | Comment | Effet sur le step |
|---|---|---|
| **Transformer** | retourne un objet (de même type ou d'un autre type) | l'élément transformé entre dans le chunk |
| **Filtrer** | retourne **`null`** | l'élément n'est pas écrit ; `filter_count` augmente ; ce n'est pas une erreur |
| **Rejeter** | lève une exception | rollback du chunk ; le step échoue, sauf règle de skip (Module 6) |

Le contrat : `O process(I item)`. Il peut changer de type : `ItemProcessor<RawTransaction, BankTransaction>`.

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Processors : transformer, filtrer, composer »** (n°34) du PPT du cours.

### 1.2 Flashback sur le Module 3

Le `return null` du processor est la manière de **filtrer** : l'élément ne rejoint pas le chunk, la position de lecture avance quand même, et la
`StepExecution` incrémente **`filterCount`** (jamais `skipCount`). Dans `batch_step_execution` on lit alors
`read_count = write_count + filter_count`. Ce module ajoute un deuxième sujet : ce que le processor **garde en mémoire** entre deux éléments, et entre deux lancements.

### 1.3 Flashback sur le Module 2

Un bean Spring est un **singleton** : une seule instance pour toute l'application, créée au démarrage, partagée par tous les lancements. Tout
**champ modifiable** d'un singleton est un **état partagé**. Un `ItemProcessor` déclaré `@Component` est un singleton comme un autre : s'il a un
champ qui change, il garde sa valeur d'un lancement à l'autre tant que la JVM vit. C'est exactement le terrain du bug de ce module.

### 1.4 Trois façons de bien composer un processor

1. **Valider** (Bean Validation) : les règles sont des annotations sur l'objet, pas du code.
2. **Transformer** : convertir les types, calculer, enrichir.
3. **Chaîner** (`CompositeItemProcessor`) : plusieurs petits processors, chacun avec **une** responsabilité, appelés l'un après l'autre.

### Références visuelles (§1 Concept)

> Légende : « ✔ vérifié » = titre relevé dans l'extrait de documentation officielle fourni ; « ◻ à confirmer » = page citée, titre exact du schéma à contrôler sur la page avant d'insérer l'image.

**1. Schéma officiel de la documentation Spring Batch**
- ✔ vérifié : « Batch Stereotypes » (page *The Domain Language of Batch*) pour situer reader / processor / writer.

**2. Schéma ASCII à garder (script vidéo)**
- §1.1 : le tableau « transformer / filtrer / rejeter » (à garder pour l'oral).

**3. Schéma personnalisé à créer pour le PPT**
- **Trois flèches** depuis un élément entrant : vers le chunk (transformé), vers la poubelle (`null`, `filter_count + 1`), vers le rollback (exception) ; avec les compteurs de `batch_step_execution` en regard.

---

## 2. Le code, ligne par ligne

### 2.1 Valider avec Bean Validation

Dépendance (en plus de `spring-boot-starter-batch-jdbc`) :

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>      <!-- 1 -->
</dependency>
```

Il s'agit de la version enrichie du record `RawTransaction` du Module 3, avec les annotations de validation ajoutées.

```java
public record RawTransaction(
    @Positive long id,                                          // 2
    @NotBlank String accountNumber,                             // 3
    @NotBlank String transactionDate,
    @Pattern(regexp = "[DC]") String transactionType,           // 4
    @NotNull @PositiveOrZero BigDecimal amount) { }             // 5
```

```java
@Bean
ValidatingItemProcessor<RawTransaction> validationProcessor() {
  var validating = new BeanValidatingItemProcessor<RawTransaction>();   // 6
  validating.setFilter(true);                                           // 7
  return validating;
}
```

1. Apporte l'implémentation de Bean Validation (Jakarta). Sans elle, le validateur ne trouve aucune règle.
2. Les règles sont des **annotations sur les composants du record** : lisibles, réutilisables, sans `if`.
3. Chaîne non vide.
4. Une expression régulière : seul `D` ou `C` est accepté.
5. Montant obligatoire et positif ou nul.
6. `BeanValidatingItemProcessor` applique ces règles à chaque élément.
7. **Filtrer au lieu de rejeter.** Par défaut, un élément invalide **lève une `ValidationException`** : le chunk est annulé et le step échoue. Avec `setFilter(true)`, il est **filtré** (comme un `return null`) et `filterCount` augmente. Choisissez selon la règle métier : une ligne invalide doit-elle arrêter le lot, ou être écartée et comptée ? *(Pour la consigner, voir les listeners au Module 6.)*

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Valider les données »** (n°35) du PPT du cours.

### 2.2 Le processor de transformation : sans état

```java
@Component
public class BankTransactionProcessor
    implements ItemProcessor<RawTransaction, BankTransaction> {                 // 1

  private static final DateTimeFormatter FORMAT =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");                          // 2

  @Override
  public BankTransaction process(RawTransaction raw) {
    if (raw.amount().signum() == 0) {                                           // 3
      return null;                                                              // 4
    }
    return new BankTransaction(
        raw.id(), raw.accountNumber(),
        LocalDateTime.parse(raw.transactionDate(), FORMAT),                     // 5
        raw.transactionType(), raw.amount());
  }
}
```

1. Entrée et sortie de types différents.
2. **`static final`** : une seule instance, partagée par tous les threads. Sûr uniquement parce que `DateTimeFormatter` est **immuable** (§3.5).
3. Règle métier : un montant nul n'a rien à écrire.
4. `null` = filtré (§1.2).
5. Toute la conversion de la date est ici : le reader n'a lu que du texte (Module 3).

**Ce processor n'a aucun champ modifiable.** Rien ne change entre deux appels, ni entre deux lancements : il est sûr comme singleton.

### 2.3 Enchaîner deux processors : `CompositeItemProcessor`

```java
@Bean
CompositeItemProcessor<RawTransaction, BankTransaction> bankProcessor(
    ValidatingItemProcessor<RawTransaction> validationProcessor,
    BankTransactionProcessor transformProcessor) {
  return new CompositeItemProcessor<>(validationProcessor, transformProcessor);          // 1
}
```

1. L'ordre compte : la sortie du premier est l'entrée du suivant. Ici `RawTransaction` → *(validation)* → `RawTransaction` → *(transformation)* → `BankTransaction`.

Règle de fonctionnement : **si un maillon retourne `null`, la chaîne s'arrête** : les suivants ne sont pas appelés et l'élément est filtré. La validation placée en premier évite donc de transformer des données invalides.

> Les types génériques sont **effacés à l'exécution** : le compilateur ne vérifie pas que la sortie d'un maillon correspond à l'entrée du suivant. Une erreur d'ordre ne se voit qu'à l'exécution (`ClassCastException`, piège n°4).

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Enchaîner deux processors : le composite »** (n°57) du PPT du cours.

### 2.4 Le processor qui a un état : le piège

On veut, pour un rapport, le **total des débits** et le **total des crédits** du fichier. Première idée, naturelle et fausse :

```java
@Component                                                              // 1
public class AnalyticsProcessor
    implements ItemProcessor<BankTransaction, BankTransaction> {

  private BigDecimal totalDebit  = BigDecimal.ZERO;                     // 2
  private BigDecimal totalCredit = BigDecimal.ZERO;                     // 3

  @Override
  public BankTransaction process(BankTransaction t) {
    if (t.transactionType().equals("D")) {                              // 4
      totalDebit = totalDebit.add(t.amount());                          // 5
    } else {
      totalCredit = totalCredit.add(t.amount());
    }
    return t;                                                           // 6
  }

  public BigDecimal totalDebit()  { return totalDebit; }                // 7
  public BigDecimal totalCredit() { return totalCredit; }
}
```

1. `@Component` : **singleton** par défaut. Une seule instance dans toute l'application.
2. Un champ **modifiable** : c'est de l'état.
3. Idem.
4. On distingue débit et crédit.
5. On **accumule** dans le champ. Au premier lancement, tout va bien.
6. Le processor ne modifie pas l'élément : il l'observe et le laisse passer.
7. Une API REST (`/analytics`) lit ces totaux pour les afficher, par l'intermédiaire de `analyticsService.totals()`.

Ce code **compile, s'exécute sans erreur et passe un test qui ne lance le job qu'une fois**.

### 2.5 Le test qui révèle le bug

```java
@Test
void les_totaux_ne_doublent_pas_au_deuxieme_lancement() throws Exception {
  jobOperator.start(bankJob, params("2026-10-01"));                        // 1er lancement
  var first = analyticsService.totals();                             // lit les totaux

  jobOperator.start(bankJob, params("2026-10-02"));                        // 2e lancement, même JVM
  var second = analyticsService.totals();

  assertThat(second.totalDebit()).isEqualByComparingTo(first.totalDebit());   // doit rester égal
  assertThat(second.totalCredit()).isEqualByComparingTo(first.totalCredit());
}
```

(`params(runDate)` construit les deux paramètres du fil rouge : `runDate` identifiant et `inputFile` non identifiant, voir Module 3, §2.3.)

Avec le singleton du §2.4, **ce test échoue**. Il passe dès qu'un des correctifs du §3.4 est appliqué.

---

## 3. Plongée « sous le capot »

### 3.1 Le cycle de vie du bean, appliqué au processor

Rappel du Module 2 :

```
 1. instanciation           new AnalyticsProcessor()        ← UNE SEULE FOIS pour un singleton
 2. injection des dépendances
 3. callbacks « Aware »
 4. BeanPostProcessor : avant initialisation
 5. @PostConstruct / afterPropertiesSet
 6. BeanPostProcessor : après initialisation   ← c'est ici qu'un PROXY peut remplacer l'objet
 7. bean prêt
 8. @PreDestroy à l'arrêt
```

Pour un **singleton**, les étapes 1 à 7 se déroulent **au démarrage de l'application**, une seule fois. Les champs `totalDebit` et `totalCredit` naissent à zéro à ce moment-là, puis accumulent pendant toute la vie de la JVM.

### 3.2 `@StepScope` : un proxy qui crée l'objet à la demande

```java
@Component
@StepScope                                                              // ← une seule ligne en plus
public class AnalyticsProcessor implements ItemProcessor<BankTransaction, BankTransaction> { ... }
```

Ce que fait Spring :

1. **Au démarrage**, il n'instancie **pas** `AnalyticsProcessor`. À l'étape 6 du cycle de vie, un `BeanPostProcessor` le remplace par un **proxy** : une sous-classe générée (**CGLIB**) qui a la même apparence, mais ne contient **aucune donnée**. C'est ce proxy qui est injecté dans le `CompositeItemProcessor`, le step, etc.
2. **Quand un step démarre**, le premier appel à une méthode du proxy lui fait demander une instance au **contexte « step »** (`StepScope`). Ce contexte en crée une **neuve**, résout les `#{...}` et la mémorise **pour cette exécution du step**.
3. Chaque appel suivant sur le proxy est **délégué** à cette instance.
4. **À la fin du step**, l'instance est **détruite**. L'exécution suivante en aura une autre, **remise à zéro**.

```
SINGLETON                                    @StepScope
┌─────────────────────┐                      ┌───────────────┐         ┌───────────────────────┐
│ une instance        │ ◀── lancement 1      │ proxy         │ ──────▶ │ instance de l'exéc. 1 │ ← détruite en fin de step
│ totalDebit = 135,50 │ ◀── lancement 2      │ (vit toujours │         ├───────────────────────┤
│ puis 271,00 (!)     │                      │  sans données)│ ──────▶ │ instance de l'exéc. 2 │ ← repart de zéro
└─────────────────────┘                      └───────────────┘         └───────────────────────┘
```

**Dans la mémoire de la JVM**, le proxy est un petit objet permanent ; les vraies instances, elles, apparaissent et disparaissent avec les steps. Rien n'est partagé entre deux exécutions : c'est précisément la propriété recherchée.

### 3.3 La démonstration du bug du double comptage

Fichier d'entrée (5 lignes, dont une à montant nul, filtrée) : débits 120,50 + 15,00 ; crédits 2 000,00 + 350,75.

| Lancement | Éléments réellement traités | `totalDebit` affiché | `totalCredit` affiché |
|---|---|---|---|
| 1er (`runDate=2026-10-01`) | 4 | 135,50 | 2 350,75 |
| 2e (`runDate=2026-10-02`, **même JVM**) | 4 | **271,00** ← faux | **4 701,50** ← faux |
| 3e | 4 | **406,50** ← faux | **7 052,25** ← faux |

Aucune exception, aucun message d'erreur, `COMPLETED` à chaque fois : le job « réussit » et les chiffres sont faux. Le bug n'apparaît que :
- quand l'application **reste vivante** entre deux lancements (API REST, planificateur interne, conteneur de longue durée) ;
- **au deuxième lancement**, jamais au premier : un test qui lance le job une fois ne le voit pas.

Après un **redémarrage** de l'application, le compteur repart à zéro et tout semble de nouveau normal : c'est ce qui rend le bug si difficile à diagnostiquer.

> 🖼️ [RÉFÉRENCE PPT] : Utiliser la diapositive **« Le piège : relancer double les totaux »** (n°58) du PPT du cours.

### 3.4 Les trois solutions

**Solution 1 (la meilleure) : pas d'état dans le composant ; l'état va dans l'`ExecutionContext`.**
Le processor ne garde rien. Les totaux vivent dans le contexte du step, qui est **persisté à chaque commit** (Module 3, `batch_step_execution_context`) :

```java
@Component
@StepScope                                                                       // 1
public class AnalyticsProcessor implements ItemProcessor<BankTransaction, BankTransaction> {

  private final ExecutionContext context;                                        // 2

  public AnalyticsProcessor(@Value("#{stepExecution.executionContext}") ExecutionContext context) { // 3
    this.context = context;
  }

  @Override
  public BankTransaction process(BankTransaction t) {
    String key = t.transactionType().equals("D") ? "totalDebitCents" : "totalCreditCents";   // 4
    long cents = t.amount().movePointRight(2).longValueExact();                  // 5
    context.putLong(key, context.getLong(key, 0L) + cents);                      // 6
    return t;
  }
}
```

1. Le contexte du step n'existe que pendant l'exécution : le bean doit naître avec elle.
2. Une **référence** vers le contexte, pas un total en mémoire.
3. Spring injecte le contexte de **l'exécution en cours** (propriété `stepExecution` du contexte de step).
4. Deux clés, une par sens.
5. On travaille en **centimes entiers** (`long`) : le contexte se sérialise proprement et on évite les erreurs d'arrondi.
6. `getLong(clé, défaut)` lit la valeur déjà sauvegardée ; **au restart**, c'est la valeur du dernier commit : le total **reprend où il s'était arrêté** au lieu de repartir de zéro.

**Solution 2 : `@StepScope` avec un champ.** Plus simple (reprendre le code du §2.4 et ajouter `@StepScope`). Les totaux repartent de zéro à chaque exécution du step. Limite : en mémoire seulement, donc **perdus au restart** (§3.6).

**Solution 3 (à éviter) : remettre à zéro à la main**, par exemple avec une méthode `reset()` appelée dans un `StepExecutionListener.beforeStep`.

```java
@BeforeStep
public void reset() { totalDebit = BigDecimal.ZERO; totalCredit = BigDecimal.ZERO; }
```

Elle fonctionne tant que **personne ne l'oublie** et qu'**un seul step** utilise le composant à la fois. Deux steps parallèles ou deux jobs simultanés se remettent à zéro mutuellement : le bug revient, en pire.

| | Pas d'état (contexte) | `@StepScope` | Reset manuel |
|---|---|---|---|
| Neuf à chaque exécution | oui | oui | seulement si on y pense |
| Survit à un restart | **oui** (persisté) | non | non |
| Deux exécutions simultanées | sûr | sûr | **dangereux** |
| Effort | moyen | une annotation | faible, mais fragile |

### 3.5 Pourquoi `SimpleDateFormat` partagé est un bug

`SimpleDateFormat` **garde un état interne** (un calendrier de travail) modifié à chaque `parse` : deux threads qui l'utilisent en même temps **se marchent dessus**. Les résultats sont des dates **fausses**, parfois sans exception. Dans un step multithread (Module 7, *parcours Complet*) ou avec plusieurs steps parallèles, un champ partagé de ce type est un piège classique.

`DateTimeFormatter` est **immuable** : il ne change jamais, il peut être partagé à volonté, y compris dans un champ `static final`. C'est le remplaçant à utiliser. (La démo d'origine créait un `SimpleDateFormat` à chaque appel : sûr, mais coûteux.)

### 3.6 Même en `@StepScope`, le total du processor peut être faux

Un processor est **rappelé** quand un chunk est rejoué : après un **retry**, ou après un échec du writer suivi d'une reprise (Module 6). L'élément est alors traité deux fois : un total accumulé dans le processor le compte **deux fois**, que l'objet soit un singleton ou en `@StepScope`.

Règle pratique : **un processor ne devrait pas produire de chiffre qui engage l'entreprise.** Les agrégats de référence se calculent sur **ce qui a été réellement écrit** : par une requête (`SELECT SUM(amount) … GROUP BY transaction_type`) après le step, ou dans une transaction commune avec l'écriture. Le processor est le bon endroit pour **valider, convertir, filtrer**.

### 3.7 Les limites d'un proxy CGLIB

Un proxy CGLIB est une **sous-classe**. Il ne peut donc pas :
- étendre une classe **`final`**, ce qui inclut les **records** : un processor `@StepScope` doit être une classe ordinaire ;
- intercepter une méthode `final` ;
- intercepter un **appel interne** (`this.autreMethode()`) : l'appel ne passe pas par le proxy.

### Références visuelles (§3 Sous le capot)

**1. Schéma officiel de la documentation Spring Batch**
- Aucun schéma officiel pour les scopes ni pour les proxys CGLIB.

**2. Schéma ASCII à garder (script vidéo)**
- §3.1 : cycle de vie en 8 étapes (même schéma qu'au Module 2).
- §3.2 : singleton contre `@StepScope` (mémoire JVM) : à garder pour le script.

**3. Schéma personnalisé à créer pour le PPT**
- **⭐ Le bug du double comptage** (priorité n°1 du PPT, introuvable dans la documentation) : trois lancements successifs, **un seul objet singleton** au centre et son compteur qui monte 135,50 → 271,00 → 406,50, en rouge ; à côté, la version `@StepScope` avec trois instances qui repartent de zéro.
- **Rejeu du chunk** (§3.6) : l'élément traité deux fois après un retry, le total du processor faux, le `SUM` SQL juste.
- Tableau comparatif des **3 solutions** (§3.4) sous forme de matrice colorée.

---

## 4. Cas d'usage

### 4.1 Le rapport de fin de nuit

La banque veut, chaque matin, le total des débits et crédits traités. Avec le singleton du §2.4, le premier jour est exact ; le lendemain, dans une application de longue durée, le total **cumule deux nuits**. Le contrôleur financier découvre l'écart trois semaines plus tard. Avec l'`ExecutionContext` (ou une requête `SUM`), chaque nuit est indépendante.

### 4.2 Le tri des lignes

Un fichier de 2 millions de lignes contient 8 % de lignes invalides. La validation en tête du composite (§2.3) les écarte, et `filter_count` donne le chiffre exact pour l'audit, sans écrire une ligne de code de comptage.

### 4.3 Le processeur d'enrichissement

Il ajoute à chaque transaction le libellé de l'agence à partir d'un référentiel. Il est **sans état** : le référentiel est chargé une fois (au démarrage), en lecture seule, et partagé sans risque.

---

## 5. Pièges : le Top 10

| # | Piège | Ce qui se passe | Parade |
|---|---|---|---|
| **1** | **Singleton avec état** (champ modifiable dans un processor `@Component`) | **double comptage** entre lancements successifs dans la même JVM, sans erreur | pas d'état (`ExecutionContext`), ou `@StepScope` ; jamais de reset manuel |
| 2 | `@StepScope` sur une classe `final` ou un **record** | échec à la création du proxy (CGLIB ne peut pas sous-classer) | classe ordinaire, non `final` |
| 3 | Lever une exception pour une ligne « à ignorer » | rollback du chunk, step en échec | `return null` pour filtrer ; exception seulement pour une vraie erreur |
| 4 | Ordre d'un `CompositeItemProcessor` incohérent | `ClassCastException` à l'exécution, le compilateur n'a rien vu | tester la chaîne complète ; un maillon = un type d'entrée et de sortie clairs |
| **5** | **`SimpleDateFormat` partagé** (champ ou `static`) | dates fausses ou `NumberFormatException` aléatoires en multithread | **`DateTimeFormatter`** (immuable) |
| 6 | Accumuler un total dans le processor | un chunk rejoué (retry, reprise) compte deux fois | calculer les agrégats sur ce qui est écrit (`SUM` SQL) |
| 7 | Effet de bord dans le processor (e-mail, appel d'API, écriture externe) | l'effet est répété à chaque rejeu du chunk | processor pur : l'effet va dans le writer, idempotent |
| 8 | Requête en base pour **chaque** élément (N+1) | un million de lignes = un million de requêtes : débit effondré | jointure dans le reader, ou cache en lecture seule chargé au démarrage |
| **9** | **Test vert avec des données fausses** : le processor ne transforme pas (champ oublié, date non convertie) mais le test ne compte que les lignes | la base contient des données fausses, la CI est verte | asserter les **valeurs** transformées, tester le processor **seul** et le job **deux fois** (§5.1) |
| 10 | Validation sans le starter, ou sans choix filtrer/rejeter | aucune règle appliquée, ou step qui échoue à la première ligne invalide | `spring-boot-starter-validation` ; `setFilter(true)` si l'invalide doit être écarté |

### 5.1 Piège n°9 : le test qui ne vérifie pas la donnée

Un processor qui oublie de convertir la date :

```java
return new BankTransaction(raw.id(), raw.accountNumber(),
                           LocalDateTime.now(),                  // ← bug : la vraie date est ignorée
                           raw.transactionType(), raw.amount());
```

Un test qui ne vérifie que le nombre de lignes écrites reste **vert**. Trois tests complémentaires :

```java
// 1. Le processor seul, sans Spring : rapide et précis
@Test
void convertit_la_date_et_garde_les_champs() {
  var out = new BankTransactionProcessor()
      .process(new RawTransaction(1, "FR7612345", "01/10/2026 09:15", "D", new BigDecimal("120.50")));
  assertThat(out.transactionDate()).isEqualTo(LocalDateTime.of(2026, 10, 1, 9, 15));
  assertThat(out.amount()).isEqualByComparingTo("120.50");
}

// 2. Le filtre : une valeur nulle est filtrée, pas écrite
@Test
void un_montant_nul_est_filtre() {
  assertThat(new BankTransactionProcessor()
      .process(new RawTransaction(4, "FR7698765", "02/10/2026 15:45", "D", BigDecimal.ZERO))).isNull();
}

// 3. Le job : on vérifie une VALEUR calculée, pas un nombre
@Test
void la_somme_des_montants_ecrits_est_correcte() {
  assertThat(jdbc.queryForObject("SELECT SUM(amount) FROM bank_transaction", BigDecimal.class))
      .isEqualByComparingTo("2486.25");
}
```

> **Règle :** un test de processor vérifie **une valeur produite**. Et tout composant susceptible d'avoir un état se teste avec **deux lancements dans la même JVM** (§2.5).

---

## 6. Découpage en sous-vidéos

| # | Titre | Durée | Contenu |
|---|---|---|---|
| 4.1 | Le rôle du processor : transformer, filtrer, rejeter | 7 min | §1, flashbacks |
| 4.2 | Valider avec Bean Validation | 7 min | §2.1 |
| 4.3 | Transformer et enchaîner (composite) | 8 min | §2.2-2.3 |
| 4.4 | Le processor à état et le bug du double comptage | 10 min | §2.4-2.5, §3.3 (démonstration) |
| 4.5 | Sous le capot : cycle de vie, proxy CGLIB, mémoire JVM | 10 min | §3.1-3.2, §3.7 |
| 4.6 | Les trois solutions et leurs limites | 9 min | §3.4, §3.6 |
| 4.7 | `SimpleDateFormat`, tests et Top 10 | 9 min | §3.5, §5 |
| | **Total** | **≈ 60 min** | |

## 7. Exercices

1. **Le tableau.** Avec le singleton du §2.4, quel total de débits la troisième exécution affiche-t-elle si chaque fichier contient 135,50 de débits ? Pourquoi un redémarrage de l'application « répare »-t-il l'affichage ?
2. **Le proxy.** Un collègue déclare `@StepScope` sur un `record AnalyticsProcessor(...)`. Que se passe-t-il, et pourquoi ?
3. **Le choix.** Choisissez entre `ExecutionContext`, `@StepScope` seul et reset manuel pour : (a) un compteur de lignes rejetées à afficher dans le rapport ; (b) un total qui doit survivre à un restart ; (c) un cache de lecture seule du référentiel d'agences. Justifiez.
4. **Le test.** Écrivez l'assertion qui détecte un processor qui oublie de convertir la date, alors que `assertThat(rows).hasSize(4)` reste vert.
