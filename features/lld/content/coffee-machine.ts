import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const coffeeMachine: LLDProblemContent = {
  slug: "coffee-machine",

  statementMD: [
    "Design the object model for a **coffee machine** that prepares recipe-based beverages from a shared ingredient inventory.",
    "Customers select drinks such as espresso, latte, and cappuccino. Each drink has a fixed recipe of water, milk, coffee, and sugar. The machine must check stock, deduct all required ingredients atomically, brew the drink, and support refilling when stock runs low.",
    "The focus is the class model and concurrency boundary: immutable recipes, a central beverage factory, one shared machine plus inventory per physical device, and safe dispensing when multiple outlets are active.",
  ].join("\n"),

  businessContextMD: [
    "Coffee Machine is a compact real-world LLD interview problem used by Amazon, Swiggy, and Oracle because it combines everyday domain modelling with resource contention.",
    "A strong solution separates what a drink is from how the machine prepares it. Recipes are immutable, inventory owns stock mutation, the factory owns supported beverages, and the machine coordinates outlet capacity. Interviewers look for atomic check-and-deduct logic more than for payment screens or hardware details.",
  ].join("\n"),

  functionalRequirements: [
    "Support named beverages such as espresso, latte, and cappuccino.",
    "Represent every beverage as a recipe of ingredient quantities.",
    "Maintain inventory for water, milk, coffee, and sugar.",
    "Before dispensing, verify all required ingredients are available.",
    "Deduct all ingredients atomically only when the full recipe can be satisfied.",
    "Allow multiple outlets to prepare drinks concurrently up to machine capacity.",
    "Expose refill operations and inventory snapshots so operators can detect low-stock ingredients.",
    "Report unsupported beverages and insufficient ingredients clearly.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Inventory correctness",
      detailMD:
        "No request may partially consume ingredients. The check and deduction must be one critical section inside the inventory.",
    },
    {
      label: "Concurrency safety",
      detailMD:
        "Multiple outlets may brew at the same time, but stock mutation must remain serialized so two requests cannot spend the same units.",
    },
    {
      label: "Extensibility",
      detailMD:
        "Adding a new beverage should be a recipe and factory change, not a rewrite of the preparation workflow.",
    },
    {
      label: "Operator visibility",
      detailMD:
        "The design should expose available quantities and snapshots so low-stock alerts and refill dashboards can be layered on top.",
    },
    {
      label: "Testability",
      detailMD:
        "Recipes, inventory, and machine coordination should be testable without real hardware or background services.",
    },
  ],

  requirementClarification: [
    {
      question: "Are ingredient units grams, milliliters, or packets?",
      answerMD:
        "Use positive integer units and keep the unit convention outside the model. The inventory only needs consistent quantities per ingredient.",
    },
    {
      question: "Can an outlet reserve ingredients and brew later?",
      answerMD:
        "For the base design, preparation consumes ingredients immediately and then brews. Reservation queues are an extension.",
    },
    {
      question: "Does outlet count mean parallel brewing or separate machines?",
      answerMD:
        "It means one physical machine with multiple dispensing outlets. A semaphore limits how many preparations can be active at once.",
    },
    {
      question: "What should happen when stock is low but still enough for the current drink?",
      answerMD:
        "Prepare the drink successfully, then let an operator-facing low-stock check decide whether to trigger refill alerts.",
    },
    {
      question: "Do we need payment, cups, sensors, or cleaning cycles?",
      answerMD:
        "Not in the core model. Those are boundary adapters or follow-up extensions around the preparation flow.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class CoffeeMachine {",
    "        -IngredientInventory inventory",
    "        -BeverageFactory beverageFactory",
    "        -Semaphore outlets",
    "        +prepare(String) Beverage",
    "        +refill(Ingredient, int) void",
    "        +availableOutlets() int",
    "    }",
    "    class IngredientInventory {",
    "        -Map~Ingredient,Integer~ stock",
    "        +refill(Ingredient, int) void",
    "        +consume(Map~Ingredient,Integer~) void",
    "        +available(Ingredient) int",
    "        +snapshot() Map",
    "    }",
    "    class BeverageFactory {",
    "        +create(String) Beverage",
    "        -espressoRecipe() Recipe",
    "        -latteRecipe() Recipe",
    "        -cappuccinoRecipe() Recipe",
    "    }",
    "    class Beverage {",
    "        -String name",
    "        -Recipe recipe",
    "        +getName() String",
    "        +getRecipe() Recipe",
    "    }",
    "    class Recipe {",
    "        -Map~Ingredient,Integer~ ingredients",
    "        +getIngredients() Map",
    "        +builder() Builder",
    "    }",
    "    class Builder {",
    "        -Map~Ingredient,Integer~ ingredients",
    "        +add(Ingredient, int) Builder",
    "        +build() Recipe",
    "    }",
    "    class Ingredient {",
    "        <<enumeration>>",
    "        WATER",
    "        MILK",
    "        COFFEE",
    "        SUGAR",
    "    }",
    "    class InsufficientIngredientException {",
    "        -Ingredient ingredient",
    "        -int required",
    "        -int available",
    "        +getIngredient() Ingredient",
    "        +getRequired() int",
    "        +getAvailable() int",
    "    }",
    "    class Semaphore {",
    "        +acquire() void",
    "        +release() void",
    "        +availablePermits() int",
    "    }",
    "    CoffeeMachine o-- IngredientInventory",
    "    CoffeeMachine ..> BeverageFactory",
    "    CoffeeMachine --> Semaphore",
    "    CoffeeMachine ..> Beverage",
    "    CoffeeMachine ..> Ingredient",
    "    BeverageFactory ..> Beverage",
    "    BeverageFactory ..> Recipe",
    "    BeverageFactory ..> Builder",
    "    Beverage o-- Recipe",
    "    Recipe o-- Ingredient",
    "    Builder ..> Recipe",
    "    IngredientInventory o-- Ingredient",
    "    IngredientInventory ..> InsufficientIngredientException",
  ].join("\n"),
  classDiagramCaptionMD:
    "The machine coordinates outlets, the factory creates beverages, recipes stay immutable, and inventory is the only class allowed to mutate stock.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Customer",
    "    participant Machine as CoffeeMachine",
    "    participant Outlets as Semaphore",
    "    participant Factory as BeverageFactory",
    "    participant Inventory as IngredientInventory",
    "    Customer->>Machine: prepare(latte)",
    "    Machine->>Outlets: acquire()",
    "    Machine->>Factory: create(latte)",
    "    Factory-->>Machine: Beverage with Recipe",
    "    Machine->>Inventory: consume(recipe ingredients)",
    "    Inventory->>Inventory: check every ingredient",
    "    alt enough stock",
    "        Inventory->>Inventory: deduct every ingredient",
    "        Inventory-->>Machine: success",
    "        Machine->>Machine: brew(beverage)",
    "        Machine-->>Customer: Beverage",
    "    else insufficient stock",
    "        Inventory-->>Machine: InsufficientIngredientException",
    "        Machine-->>Customer: error message",
    "    end",
    "    Machine->>Outlets: release()",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "The outlet permit limits concurrent brewing, while the inventory monitor makes recipe consumption all-or-nothing.",

  entities: [
    {
      name: "CoffeeMachine",
      responsibilityMD:
        "Aggregate coordinator for one physical machine. It acquires an outlet permit, asks the factory for a beverage, consumes inventory, brews, and releases the permit.",
      attributes: ["inventory", "beverageFactory", "outlets"],
    },
    {
      name: "IngredientInventory",
      responsibilityMD:
        "Single owner of stock quantities. Refill, consume, available, and snapshot are synchronized so inventory state cannot be corrupted by concurrent outlets.",
      attributes: ["stock"],
    },
    {
      name: "Ingredient",
      responsibilityMD:
        "Enum vocabulary shared by recipes and inventory: WATER, MILK, COFFEE, and SUGAR.",
      attributes: ["WATER", "MILK", "COFFEE", "SUGAR"],
    },
    {
      name: "Recipe",
      responsibilityMD:
        "Immutable mapping from ingredient to quantity. It protects callers from changing a beverage after the factory creates it.",
      attributes: ["ingredients"],
    },
    {
      name: "Recipe.Builder",
      responsibilityMD:
        "Readable recipe construction API. It validates positive quantities, combines repeated ingredients, and produces an immutable Recipe.",
      attributes: ["add", "build"],
    },
    {
      name: "Beverage",
      responsibilityMD:
        "Value object holding a drink name and its recipe. The machine prepares the beverage without knowing the recipe details.",
      attributes: ["name", "recipe"],
    },
    {
      name: "BeverageFactory",
      responsibilityMD:
        "Creation boundary for supported drink names. It maps input such as latte to the correct Beverage and recipe.",
      attributes: ["create", "espressoRecipe", "latteRecipe", "cappuccinoRecipe"],
    },
    {
      name: "InsufficientIngredientException",
      responsibilityMD:
        "Domain error carrying the ingredient that failed, the required quantity, and the available quantity for clear outlet feedback.",
      attributes: ["ingredient", "required", "available"],
    },
  ],

  patternsUsed: [
    {
      name: "Builder",
      whyMD:
        "Recipe.Builder makes drink recipes readable and immutable. The factory can express latte or cappuccino quantities without exposing mutable maps.",
    },
    {
      name: "Factory Method",
      whyMD:
        "BeverageFactory.create centralizes supported beverage names and constructs the matching Beverage. The machine depends on creation behavior, not on drink-specific conditionals in the preparation flow.",
    },
    {
      name: "Singleton",
      whyMD:
        "A physical device should expose one shared CoffeeMachine and one shared IngredientInventory to all outlets. The reference classes remain constructor-injected for tests, while production composition can publish a single instance per device.",
    },
  ],

  designSteps: [
    {
      title: "Use one ingredient vocabulary",
      detailMD:
        "Start with the Ingredient enum so recipes, inventory, exceptions, and low-stock checks all speak the same language.",
    },
    {
      title: "Build immutable recipes",
      detailMD:
        "Represent a beverage as a Recipe and create it through Recipe.Builder. Once built, the map is unmodifiable, so concurrent requests cannot alter recipe quantities.",
      code: [
        "public Recipe latteRecipe() {",
        "    return Recipe.builder()",
        "            .add(Ingredient.WATER, 120)",
        "            .add(Ingredient.MILK, 80)",
        "            .add(Ingredient.COFFEE, 18)",
        "            .add(Ingredient.SUGAR, 5)",
        "            .build();",
        "}",
      ].join("\n"),
    },
    {
      title: "Centralize beverage creation",
      detailMD:
        "BeverageFactory owns the mapping from customer input to Beverage. Adding mocha or tea changes the factory recipes, while CoffeeMachine.prepare stays stable.",
    },
    {
      title: "Make inventory consumption atomic",
      detailMD:
        "IngredientInventory.consume first checks every required ingredient, then deducts every ingredient. Keeping both loops synchronized prevents partial consumption and double spending.",
      code: [
        "public synchronized void consume(Map<Ingredient, Integer> required) {",
        "    for (Map.Entry<Ingredient, Integer> entry : required.entrySet()) {",
        "        Ingredient ingredient = entry.getKey();",
        "        int need = entry.getValue();",
        "        int have = stock.get(ingredient);",
        "        if (have < need) {",
        "            throw new InsufficientIngredientException(ingredient, need, have);",
        "        }",
        "    }",
        "    for (Map.Entry<Ingredient, Integer> entry : required.entrySet()) {",
        "        stock.put(entry.getKey(), stock.get(entry.getKey()) - entry.getValue());",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Limit concurrent dispensing with outlet permits",
      detailMD:
        "CoffeeMachine.prepare acquires a semaphore permit before brewing and releases it in a finally block. This models finite outlets without weakening inventory correctness.",
    },
    {
      title: "Expose one machine and inventory per device",
      detailMD:
        "In production, a holder or dependency injection container should publish a single CoffeeMachine wired to a single IngredientInventory for each physical machine.",
      code: [
        "public final class CoffeeMachineHolder {",
        "    private static final IngredientInventory INVENTORY = new IngredientInventory();",
        "    private static final CoffeeMachine INSTANCE =",
        "            new CoffeeMachine(2, INVENTORY, new BeverageFactory());",
        "",
        "    private CoffeeMachineHolder() {",
        "    }",
        "",
        "    public static CoffeeMachine machine() {",
        "        return INSTANCE;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Use snapshot and refill for low-stock operations",
      detailMD:
        "The machine exposes refill, and inventory exposes available plus snapshot. A dashboard can compare the snapshot with thresholds and call refill without entering the brew path.",
    },
  ],

  implementation: referenceFiles("design-coffee-machine"),

  classExplanations: [
    {
      className: "Ingredient",
      detailMD:
        "Enum listing WATER, MILK, COFFEE, and SUGAR. It is the shared key type for recipes, stock, snapshots, and insufficient-stock errors.",
    },
    {
      className: "InsufficientIngredientException",
      detailMD:
        "Runtime domain exception raised when inventory cannot satisfy a recipe. It carries the ingredient, required quantity, and available quantity so the outlet can show a precise failure.",
    },
    {
      className: "Recipe",
      detailMD:
        "Immutable value object wrapping an unmodifiable EnumMap from Ingredient to quantity. Callers can read requirements but cannot mutate a finished recipe.",
    },
    {
      className: "Recipe.Builder",
      detailMD:
        "Nested builder that validates positive quantities, merges repeated ingredient additions, rejects empty recipes, and returns an immutable Recipe.",
    },
    {
      className: "Beverage",
      detailMD:
        "Final value object containing the display name and Recipe. It keeps the drink identity and ingredient requirements together for the machine workflow.",
    },
    {
      className: "BeverageFactory",
      detailMD:
        "Factory that normalizes the requested beverage name and returns Espresso, Latte, or Cappuccino with the correct recipe. Unsupported names fail at the creation boundary.",
    },
    {
      className: "IngredientInventory",
      detailMD:
        "Synchronized stock store backed by an EnumMap. Refill validates positive quantities, consume performs all checks before any deduction, and snapshot returns an unmodifiable copy for low-stock checks.",
    },
    {
      className: "CoffeeMachine",
      detailMD:
        "Coordinator that owns the shared inventory, factory, and outlet semaphore. Prepare acquires a permit, creates the beverage, consumes ingredients, brews, and always releases the permit.",
    },
  ],

  dryRun: {
    inputMD:
      "Machine with 2 outlets. Initial stock: WATER 300, MILK 150, COFFEE 60, SUGAR 20. Requests arrive for Latte, Espresso, Cappuccino, then Espresso again. Low-stock coffee threshold is 25.",
    columns: ["Step", "Action", "Outlet state", "Inventory snapshot", "Result"],
    rows: [
      ["1", "Refill initial stock", "2 permits free", "W300 M150 C60 S20", "Inventory ready"],
      ["2", "Prepare Latte", "1 permit held during brew", "W180 M70 C42 S15", "Latte prepared"],
      ["3", "Prepare Espresso while another outlet may be active", "Second permit can be held", "W120 M70 C24 S15", "Espresso prepared after atomic consume"],
      ["4", "Check low-stock threshold for coffee", "2 permits free after brews", "Coffee 24", "Refill recommended"],
      ["5", "Prepare Cappuccino", "1 permit held during brew", "W20 M10 C4 S9", "Cappuccino prepared"],
      ["6", "Prepare Espresso again", "Permit released after failure", "W20 M10 C4 S9", "Fails with insufficient WATER: required 60, available 20"],
    ],
    narrativeMD:
      "The important invariant is visible in steps 5 and 6: stock changes only after a full recipe passes validation. The failed espresso does not reduce coffee or any other ingredient.",
  },

  complexity: [
    {
      operation: "prepare",
      time: "O(I)",
      space: "O(1)",
      note: "I is the number of ingredient types in the recipe. Semaphore acquire and release are constant-time coordination around the stock check.",
    },
    {
      operation: "consume ingredients",
      time: "O(I)",
      space: "O(1)",
      note: "Inventory scans required ingredients once to validate and once to deduct.",
    },
    {
      operation: "refill one ingredient",
      time: "O(1)",
      space: "O(1)",
      note: "A single synchronized EnumMap update.",
    },
    {
      operation: "snapshot or low-stock scan",
      time: "O(N)",
      space: "O(N)",
      note: "N is total ingredient types. Snapshot copies the inventory so callers cannot mutate internal state.",
    },
    {
      operation: "create beverage",
      time: "O(I)",
      space: "O(I)",
      note: "The factory builds a recipe map for the selected drink.",
    },
  ],
  complexityNotesMD:
    "With four ingredients, all operations are effectively constant in practice. The design still states O(I) because new machines may add syrups, powders, cup sizes, or toppings.",

  extensibility: [
    {
      label: "Add a new beverage",
      detailMD:
        "Add a recipe method and name branch in BeverageFactory. CoffeeMachine.prepare and IngredientInventory.consume remain unchanged.",
    },
    {
      label: "Add a new ingredient",
      detailMD:
        "Add an Ingredient enum value and initialize its stock. Recipes can then include it through Recipe.Builder.",
    },
    {
      label: "Low-stock policy",
      detailMD:
        "Layer a threshold map over IngredientInventory.snapshot to alert when any quantity falls below its configured minimum.",
    },
    {
      label: "Multiple physical machines",
      detailMD:
        "Create one CoffeeMachine plus IngredientInventory pair per device id. Each pair is a singleton for that device, not a global singleton across the fleet.",
    },
    {
      label: "Async brew hardware",
      detailMD:
        "Replace the private brew method with a hardware adapter. Keep recipe validation and inventory mutation before hardware activation.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Preloaded recipe catalog",
      detailMD:
        "Build all recipes once into an immutable map from beverage name to Beverage instead of rebuilding a Recipe on every factory call.",
      tradeoffsMD:
        "Faster create calls and fewer allocations, but less flexible if operators edit recipes at runtime.",
    },
    {
      name: "Command per beverage request",
      detailMD:
        "Represent each preparation as a command that can be queued, retried, cancelled, or audited before reaching the machine.",
      tradeoffsMD:
        "Useful for kiosks with mobile ordering, but overkill for a simple synchronous machine interview design.",
    },
    {
      name: "Per-ingredient locks",
      detailMD:
        "Lock only the ingredients required by a recipe instead of synchronizing the whole inventory.",
      tradeoffsMD:
        "May improve throughput with many ingredients, but introduces lock ordering risks and is unnecessary for four core ingredients.",
    },
    {
      name: "Static singleton classes",
      detailMD:
        "Make CoffeeMachine and IngredientInventory expose getInstance methods directly.",
      tradeoffsMD:
        "Simple to explain, but it hides dependencies and makes tests share state. Constructor injection plus singleton composition is safer.",
    },
  ],

  commonMistakes: [
    "Checking ingredient availability in one method and deducting in another, which creates a race between outlets.",
    "Deducting ingredients as they are checked, causing partial consumption when a later ingredient is missing.",
    "Putting every beverage recipe inside CoffeeMachine.prepare instead of a factory or catalog.",
    "Returning the mutable inventory map directly from snapshot and letting callers corrupt stock.",
    "Treating outlet concurrency as a replacement for inventory locking. They solve different problems.",
    "Using a global static singleton in tests and accidentally leaking stock between test cases.",
    "Ignoring unsupported beverage names and returning null instead of failing clearly.",
  ],

  followUps: [
    {
      question: "How would you add mocha without changing the machine workflow?",
      answerMD:
        "Add chocolate or syrup as an Ingredient if needed, then add a mocha recipe in BeverageFactory. The prepare flow still creates, consumes, brews, and releases the permit.",
    },
    {
      question: "Why is consume synchronized if the machine already uses a semaphore?",
      answerMD:
        "The semaphore limits active outlets, but two active outlets can still reach inventory together. The synchronized consume method protects the check-and-deduct critical section.",
    },
    {
      question: "How do you notify operators about low stock?",
      answerMD:
        "Read IngredientInventory.snapshot, compare each quantity to a threshold map, and emit alerts outside the synchronized brew path.",
    },
    {
      question: "Should CoffeeMachine be a hard-coded static singleton?",
      answerMD:
        "Usually no. Treat it as a singleton at the composition boundary so production has one instance per device while tests can create isolated instances.",
    },
    {
      question: "What if brewing succeeds but hardware later fails?",
      answerMD:
        "Add a hardware adapter and an operation log. Decide whether ingredients are refundable based on physical reality, but keep the domain event auditable.",
    },
  ],

  productionConsiderations: [
    {
      label: "Durable inventory",
      detailMD:
        "Persist stock adjustments with an audit log so a power loss does not reset ingredient counts or hide failed dispense attempts.",
    },
    {
      label: "Fair outlet scheduling",
      detailMD:
        "If requests queue, make semaphore acquisition fair or put requests through an explicit FIFO queue to avoid starvation.",
    },
    {
      label: "Low-stock observability",
      detailMD:
        "Emit gauges for each ingredient, alerts for threshold breaches, and counters for insufficient-stock failures by beverage.",
    },
    {
      label: "Recipe governance",
      detailMD:
        "Keep recipe changes versioned. A prepared drink should be traceable to the recipe quantities active at preparation time.",
    },
    {
      label: "Hardware idempotency",
      detailMD:
        "Dispense commands to pumps and grinders should include operation ids so retries do not double-brew a drink.",
    },
  ],

  interviewNotes: [
    "Did you identify inventory check-and-deduct as the main critical section?",
    "Are recipes immutable and built away from the machine workflow?",
    "Does the factory isolate beverage creation from preparation orchestration?",
    "Can multiple outlets work concurrently without corrupting shared stock?",
    "Did you explain singleton scope as one shared instance per physical device, not global mutable state everywhere?",
    "Can the design support low-stock alerts and refill without rewriting dispense logic?",
  ],

  quiz: [
    {
      question: "Why should IngredientInventory.consume check all ingredients before deducting any of them?",
      options: [
        "To prevent partial consumption when a later ingredient is missing",
        "To make BeverageFactory simpler",
        "To avoid using an enum",
        "To make brewing asynchronous",
      ],
      answerIndex: 0,
      explanationMD:
        "A recipe is all-or-nothing. If milk is missing, the machine must not already have deducted water or coffee.",
    },
    {
      question: "What does the semaphore in CoffeeMachine model?",
      options: [
        "The number of ingredient types",
        "The number of concurrent outlet preparations allowed",
        "The inventory low-stock threshold",
        "The number of recipes in the factory",
      ],
      answerIndex: 1,
      explanationMD:
        "Each permit represents an outlet slot. It limits concurrent brewing but does not replace inventory synchronization.",
    },
    {
      question: "Why use Recipe.Builder for drink recipes?",
      options: [
        "It lets callers mutate recipes after creation",
        "It removes the need for inventory checks",
        "It makes recipe construction readable while producing immutable Recipe objects",
        "It guarantees every drink uses sugar",
      ],
      answerIndex: 2,
      explanationMD:
        "The builder is a clear construction API. The final Recipe protects its ingredient map from mutation.",
    },
    {
      question: "Where should supported beverage names such as latte and cappuccino be mapped to recipes?",
      options: [
        "Inside IngredientInventory.refill",
        "Inside the Semaphore",
        "Inside InsufficientIngredientException",
        "Inside BeverageFactory",
      ],
      answerIndex: 3,
      explanationMD:
        "The factory is the creation boundary. CoffeeMachine.prepare should not contain beverage-specific recipe branches.",
    },
    {
      question: "What is the safest way to apply Singleton in this design?",
      options: [
        "Expose one shared CoffeeMachine and IngredientInventory per physical device at composition time",
        "Make every method static and remove all objects",
        "Return the same Recipe.Builder from every request",
        "Use one global inventory for all machines in all locations",
      ],
      answerIndex: 0,
      explanationMD:
        "Singleton scope should match the physical device. Constructor-injected classes stay testable while production wiring shares the right instances.",
    },
  ],

  practiceVariants: [
    {
      title: "Add configurable recipes",
      detailMD:
        "Load recipes from a catalog and validate that every referenced ingredient exists before publishing the catalog.",
      difficulty: "Intermediate",
    },
    {
      title: "Add low-stock alerts",
      detailMD:
        "Create a threshold policy that reads inventory snapshots and reports ingredients requiring refill after each preparation.",
      difficulty: "Beginner",
    },
    {
      title: "Add request queueing",
      detailMD:
        "Queue beverage requests when all outlets are busy, preserve FIFO ordering, and surface estimated wait time.",
      difficulty: "Intermediate",
    },
    {
      title: "Add hardware failure recovery",
      detailMD:
        "Record preparation attempts and decide how to compensate when an ingredient was deducted but a pump or grinder failed.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the main invariant in a coffee machine design?",
      back: "A beverage consumes ingredients all-or-nothing; no failed request should partially reduce stock.",
    },
    {
      front: "Which class owns stock mutation?",
      back: "IngredientInventory owns refill, consume, available, and snapshot, and synchronizes them.",
    },
    {
      front: "Why is BeverageFactory useful?",
      back: "It maps requested drink names to Beverage objects and keeps recipe selection out of CoffeeMachine.prepare.",
    },
    {
      front: "What does Recipe.Builder protect?",
      back: "It makes recipe construction readable and returns an immutable Recipe with an unmodifiable ingredient map.",
    },
    {
      front: "What does the outlet semaphore not protect?",
      back: "It does not protect stock check-and-deduct. Inventory synchronization still handles that critical section.",
    },
    {
      front: "How should Singleton scope be described?",
      back: "One shared CoffeeMachine and IngredientInventory per physical device, usually provided by a holder or dependency injection container.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** CoffeeMachine, IngredientInventory, Ingredient, Recipe, Recipe.Builder, Beverage, BeverageFactory, InsufficientIngredientException.",
    "",
    "**Patterns:** Builder for immutable recipes, Factory Method for beverage creation, Singleton at the physical machine composition boundary.",
    "",
    "**Flow:** prepare = acquire outlet permit → create beverage → consume recipe ingredients atomically → brew → release permit.",
    "",
    "**Inventory invariant:** check every required ingredient before deducting any ingredient; failed requests leave stock unchanged.",
    "",
    "**Concurrency:** semaphore limits active outlets; synchronized inventory methods protect shared stock.",
    "",
    "**Extend:** add beverages in the factory, add ingredients in the enum, add low-stock alerts from inventory snapshots.",
  ].join("\n"),

  references: [
    {
      title: "Head First Design Patterns",
      kind: "Book",
      author: "Freeman and Robson",
    },
    {
      title: "Java Concurrency in Practice",
      kind: "Book",
      author: "Brian Goetz",
    },
    {
      title: "Refactoring Guru — Builder Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/builder",
    },
    {
      title: "Refactoring Guru — Factory Method Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/factory-method",
    },
  ],

  relatedProblems: [
    { slug: "vending-machine", note: "Another inventory-backed dispensing machine with stronger state-machine behavior." },
    { slug: "atm", note: "Similar focus on safe resource mutation and clear failure handling." },
    { slug: "parking-lot", note: "Another beginner real-world system with concurrency around scarce shared resources." },
  ],
};
