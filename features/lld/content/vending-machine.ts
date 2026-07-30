import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

/**
 * Exemplar LLD problem: Design a Vending Machine.
 *
 * Reuses the reviewed Java from the practice bank and layers the full learning
 * walkthrough on top.
 */
export const vendingMachine: LLDProblemContent = {
  slug: "vending-machine",

  statementMD: [
    "Design the object model for a **vending machine** that accepts payment, lets a customer select a product, dispenses it when the payment and stock are valid, and returns change or refunds when the flow cannot continue.",
    "",
    "The interview is about the **machine lifecycle**. A good solution makes illegal transitions impossible: you cannot dispense before selecting, you cannot select without payment, and an out-of-stock item should not corrupt the customer transaction.",
    "",
    "The base reference implementation uses coins, products, inventory counts, a change bank, and explicit machine states. Notes, cards, and richer payment providers are natural extensions behind the same payment and change seam.",
  ].join("\n"),

  businessContextMD: [
    "Vending Machine is a classic beginner LLD question at Amazon, Microsoft, Adobe, and Oracle because it is small enough to finish in one interview but rich enough to expose design maturity.",
    "",
    "Interviewers are looking for a finite-state model instead of scattered boolean flags, a single source of truth for inventory, and a payment/change policy that can evolve from coins to notes or cashless methods without rewriting the machine flow.",
  ].join("\n"),

  functionalRequirements: [
    "Display products with price and availability.",
    "Accept supported coins and track the inserted amount for the active transaction.",
    "Allow a customer to select a product only after payment has started.",
    "Reject a product selection when stock is unavailable or the inserted amount is insufficient.",
    "Dispense exactly one unit of the selected product after successful validation.",
    "Return exact change when the inserted amount exceeds the product price.",
    "Refund inserted coins when the customer cancels or when exact change cannot be produced.",
    "Allow an admin to refill inventory by adding products and counts.",
  ],

  nonFunctionalRequirements: [
    {
      label: "State correctness",
      detailMD:
        "Every public action should be interpreted by the current state, so invalid sequences fail early and consistently.",
    },
    {
      label: "Inventory consistency",
      detailMD:
        "Stock must decrement only after the machine is ready to dispense, never during a failed selection or refund.",
    },
    {
      label: "Payment accuracy",
      detailMD:
        "Inserted value, refunds, and change must be computed in cents to avoid floating-point rounding errors.",
    },
    {
      label: "Extensibility",
      detailMD:
        "New products, coin denominations, notes, and payment policies should be additive changes around small interfaces or isolated algorithms.",
    },
    {
      label: "Low latency",
      detailMD:
        "Selection and dispensing should be in-memory operations with predictable constant-time or small linear-time behavior.",
    },
  ],

  requirementClarification: [
    {
      question: "Do we support both coins and notes in the base design?",
      answerMD:
        "The reference implementation uses coins as the concrete payment unit. Model notes as the same kind of monetary input or as a future payment strategy; do not let that choice leak into the state flow.",
    },
    {
      question: "Should the machine require exact change from the customer?",
      answerMD:
        "No. The machine accepts overpayment and attempts to return exact change. If it cannot make change, it refunds the inserted coins and resets.",
    },
    {
      question: "Can the customer cancel at any time?",
      answerMD:
        "Cancellation is meaningful before dispensing. Idle cancel returns nothing, HasMoney and OutOfStock cancel refund inserted coins, and Dispensing rejects cancellation because the transaction is already committed.",
    },
    {
      question: "Who refills products and change?",
      answerMD:
        "Admin refill is modeled through the inventory and change-bank responsibilities. The reference code exposes Inventory.addProduct for product refill; a production version would add authenticated admin methods for loading change.",
    },
    {
      question: "Do we persist transactions or inventory to a database?",
      answerMD:
        "Not in the interview core. Keep the domain in memory, then call out where repositories or hardware adapters would be attached for production durability.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class VendingMachine {",
    "        -Inventory inventory",
    "        -Map~Coin,Integer~ changeBank",
    "        -List~Coin~ insertedCoins",
    "        -State currentState",
    "        -int insertedAmount",
    "        -Product selectedProduct",
    "        -List~Coin~ lastChange",
    "        +insertCoin(Coin) void",
    "        +selectProduct(String) void",
    "        +dispense() void",
    "        +cancel() List~Coin~",
    "        +collectChange() List~Coin~",
    "    }",
    "    class State {",
    "        <<interface>>",
    "        +insertCoin(VendingMachine, Coin) void",
    "        +selectProduct(VendingMachine, String) void",
    "        +dispense(VendingMachine) void",
    "        +cancel(VendingMachine) List~Coin~",
    "    }",
    "    class IdleState",
    "    class HasMoneyState",
    "    class DispensingState",
    "    class OutOfStockState",
    "    class Inventory {",
    "        -Map~String,Product~ products",
    "        -Map~String,Integer~ counts",
    "        +addProduct(Product, int) void",
    "        +find(String) Product",
    "        +hasStock(Product) boolean",
    "        +decrement(Product) void",
    "    }",
    "    class Product {",
    "        -String id",
    "        -String name",
    "        -int price",
    "        +getId() String",
    "        +getName() String",
    "        +getPrice() int",
    "    }",
    "    class Coin {",
    "        <<enumeration>>",
    "        ONE",
    "        FIVE",
    "        TEN",
    "        TWENTY_FIVE",
    "        +getValue() int",
    "    }",
    "    VendingMachine o-- Inventory",
    "    VendingMachine --> State",
    "    VendingMachine --> Product",
    "    VendingMachine --> Coin",
    "    Inventory o-- Product",
    "    State <|.. IdleState",
    "    State <|.. HasMoneyState",
    "    State <|.. DispensingState",
    "    State <|.. OutOfStockState",
  ].join("\n"),
  classDiagramCaptionMD:
    "The machine owns the lifecycle and delegates each action to the current State. Inventory is the single source of stock truth, while Coin and the change bank capture the current payment model.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Customer",
    "    participant VM as VendingMachine",
    "    participant St as State",
    "    participant Inv as Inventory",
    "    participant Chg as ChangeBank",
    "    Customer->>VM: insertCoin(TWENTY_FIVE)",
    "    VM->>St: IdleState.insertCoin(machine, coin)",
    "    St->>VM: acceptCoin(coin)",
    "    St->>VM: moveTo(HasMoneyState)",
    "    Customer->>VM: selectProduct(A1)",
    "    VM->>St: HasMoneyState.selectProduct(machine, A1)",
    "    St->>Inv: find(A1)",
    "    Inv-->>St: Product",
    "    St->>Inv: hasStock(product)",
    "    Inv-->>St: true",
    "    St->>VM: prepareChange(insertedAmount - price)",
    "    VM->>Chg: takeChange(amount)",
    "    Chg-->>VM: exact coins",
    "    St->>VM: setSelectedProduct(product)",
    "    St->>VM: moveTo(DispensingState)",
    "    Customer->>VM: dispense()",
    "    VM->>St: DispensingState.dispense(machine)",
    "    St->>Inv: decrement(product)",
    "    St->>VM: clearTransaction()",
    "    St->>VM: moveTo(IdleState)",
    "    Customer->>VM: collectChange()",
    "    VM-->>Customer: change coins",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "A successful purchase is a state transition chain: Idle accepts money, HasMoney validates stock and change, Dispensing decrements inventory, and the machine returns to Idle.",

  entities: [
    {
      name: "VendingMachine",
      responsibilityMD:
        "Aggregate root and public facade. Holds the current State, inserted coins, selected product, change bank, and the shared inventory reference.",
      attributes: [
        "inventory",
        "changeBank",
        "insertedCoins",
        "currentState",
        "insertedAmount",
        "selectedProduct",
        "lastChange",
      ],
    },
    {
      name: "State",
      responsibilityMD:
        "Lifecycle interface for actions that vary by phase: insert coin, select product, dispense, and cancel.",
      attributes: ["insertCoin", "selectProduct", "dispense", "cancel"],
    },
    {
      name: "IdleState",
      responsibilityMD:
        "Waiting state. Accepts the first coin and moves the machine to HasMoney; selection and dispensing are invalid here.",
      attributes: ["insertCoin", "cancel"],
    },
    {
      name: "HasMoneyState",
      responsibilityMD:
        "Active payment state. Accepts more coins, validates selection, prepares change, and moves to Dispensing only when the transaction can complete.",
      attributes: ["insertCoin", "selectProduct", "cancel"],
    },
    {
      name: "DispensingState",
      responsibilityMD:
        "Committed state. Blocks further input, decrements inventory for the selected product, clears transaction data, and returns to Idle.",
      attributes: ["dispense"],
    },
    {
      name: "OutOfStockState",
      responsibilityMD:
        "Recovery state after an unavailable selection. Allows refund or selecting a different stocked product without losing inserted money.",
      attributes: ["selectProduct", "cancel"],
    },
    {
      name: "Inventory",
      responsibilityMD:
        "Single source of truth for product catalog and stock counts. Admin refill adds products and increments counts; dispensing decrements counts.",
      attributes: ["products", "counts"],
    },
    {
      name: "Product",
      responsibilityMD:
        "Immutable product metadata: id, display name, and price in cents.",
      attributes: ["id", "name", "price"],
    },
    {
      name: "Coin",
      responsibilityMD:
        "Supported monetary denomination. Values are stored as integer cents for exact payment and change calculations.",
      attributes: ["ONE", "FIVE", "TEN", "TWENTY_FIVE"],
    },
  ],

  patternsUsed: [
    {
      name: "State",
      whyMD:
        "The machine lifecycle is modeled by State implementations. Each state decides which actions are legal and when to move to another state, avoiding a large conditional block inside VendingMachine.",
    },
    {
      name: "Singleton",
      whyMD:
        "Inventory is treated as the single source of truth for one physical machine. The reference code keeps it injectable for testing, but the object graph should create one shared Inventory instance and route all stock reads, refills, and decrements through it.",
    },
    {
      name: "Strategy",
      whyMD:
        "Payment and change are isolated from the state flow. The reference code ships a greedy change algorithm behind prepareChange; in a fuller implementation that seam becomes a ChangeStrategy or PaymentStrategy without changing Idle, HasMoney, or Dispensing behavior.",
    },
  ],

  designSteps: [
    {
      title: "Start with the lifecycle, not the data tables",
      detailMD:
        "Model the vending machine as a finite-state workflow: Idle, HasMoney, Dispensing, and OutOfStock. Each state receives the same public actions but handles only the actions valid for that phase.",
      code: [
        "public interface State {",
        "    void insertCoin(VendingMachine machine, Coin coin);",
        "    void selectProduct(VendingMachine machine, String productId);",
        "    void dispense(VendingMachine machine);",
        "    List<Coin> cancel(VendingMachine machine);",
        "}",
      ].join("\n"),
    },
    {
      title: "Keep the machine as a thin orchestrator",
      detailMD:
        "VendingMachine exposes insertCoin, selectProduct, dispense, and cancel, then delegates each call to currentState. It owns transaction fields such as inserted amount, selected product, and last change, but it does not decide every branch itself.",
    },
    {
      title: "Use HasMoneyState as the transaction validator",
      detailMD:
        "Product selection belongs in HasMoneyState because that is the first point where the machine has payment and a requested item. It validates stock, verifies sufficient funds, asks for change, and only then moves to Dispensing.",
      code: [
        "public void selectProduct(VendingMachine machine, String productId) {",
        "    Product product = machine.getInventory().find(productId);",
        "    if (!machine.getInventory().hasStock(product)) {",
        "        machine.setSelectedProduct(product);",
        "        machine.moveTo(machine.outOfStockState());",
        "        throw new IllegalStateException(\"selected product is out of stock\");",
        "    }",
        "    if (machine.getInsertedAmount() < product.getPrice()) {",
        "        throw new IllegalStateException(\"insufficient funds\");",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Make inventory the stock authority",
      detailMD:
        "Inventory owns both product metadata and counts. Admin refill increments counts through addProduct, while dispensing calls decrement only after the transaction is committed.",
      code: [
        "public void addProduct(Product product, int count) {",
        "    if (count < 0) {",
        "        throw new IllegalArgumentException(\"count cannot be negative\");",
        "    }",
        "    products.put(product.getId(), product);",
        "    counts.put(product.getId(), counts.getOrDefault(product.getId(), 0) + count);",
        "}",
      ].join("\n"),
    },
    {
      title: "Treat change-making as a payment policy seam",
      detailMD:
        "The reference code uses a greedy descending coin scan inside VendingMachine.takeChange. Keep that algorithm isolated so a richer design can swap in a different strategy for notes, cashless refunds, or denominations where greedy is not optimal.",
    },
    {
      title: "Commit only in DispensingState",
      detailMD:
        "Do not decrement inventory during selection. DispensingState is the commit point: it has a selected product, decrements stock, clears transaction data, and returns the machine to Idle.",
    },
  ],

  implementation: referenceFiles("design-vending-machine"),

  classExplanations: [
    {
      className: "Coin",
      detailMD:
        "Enumeration of supported denominations: ONE, FIVE, TEN, and TWENTY_FIVE. Each coin stores its value in cents so payment arithmetic stays integer-based.",
    },
    {
      className: "Product",
      detailMD:
        "Immutable product data with id, name, and price. The constructor validates that id is present and price is positive, which keeps invalid catalog entries out of the machine.",
    },
    {
      className: "Inventory",
      detailMD:
        "Catalog plus stock counter. addProduct supports admin refill, find validates product ids, hasStock answers availability, and decrement enforces the no-negative-stock invariant.",
    },
    {
      className: "State",
      detailMD:
        "Lifecycle interface implemented by every machine state. It gives the same action surface to IdleState, HasMoneyState, DispensingState, and OutOfStockState.",
    },
    {
      className: "VendingMachine",
      detailMD:
        "Public facade and transaction holder. It delegates actions to currentState, records inserted coins and amount, manages the change bank, stores the selected product, and exposes collectChange after a successful purchase.",
    },
    {
      className: "IdleState",
      detailMD:
        "Initial waiting state. The first coin is accepted and the machine moves to HasMoneyState; selecting or dispensing before payment throws a clear error.",
    },
    {
      className: "HasMoneyState",
      detailMD:
        "Payment-active state. It accepts additional coins, validates selected product and funds, prepares exact change, refunds when change cannot be made, and moves to DispensingState on success.",
    },
    {
      className: "DispensingState",
      detailMD:
        "Committed state. It rejects new input, decrements inventory for the selected product, clears the transaction, and resets the machine to IdleState.",
    },
    {
      className: "OutOfStockState",
      detailMD:
        "Recovery state for unavailable selections. It can accept more coins, retry a different product by returning through HasMoneyState, or cancel and refund the inserted coins.",
    },
  ],

  dryRun: {
    inputMD:
      "Inventory has A1 Cola priced at 125¢ with count 1. Customer inserts six TWENTY_FIVE coins, selects A1, dispenses, then collects change.",
    columns: ["Step", "Action", "State before", "Transaction data", "Result"],
    rows: [
      ["1", "insertCoin(25¢)", "Idle", "amount 0¢, selected none", "Coin accepted, state HasMoney"],
      ["2", "insert five more 25¢ coins", "HasMoney", "amount 25¢", "amount 150¢"],
      ["3", "selectProduct(A1)", "HasMoney", "amount 150¢, price 125¢", "change 25¢ prepared, state Dispensing"],
      ["4", "dispense()", "Dispensing", "selected A1, stock 1", "stock 0, transaction cleared, state Idle"],
      ["5", "collectChange()", "Idle", "lastChange 25¢", "customer receives one TWENTY_FIVE coin"],
    ],
    narrativeMD:
      "The important ordering is selection before commit: HasMoneyState prepares change first, and only DispensingState decrements inventory.",
  },

  complexity: [
    {
      operation: "insertCoin",
      time: "O(1)",
      space: "O(1)",
      note: "Adds one coin to the transaction list and increments its denomination count in the change bank.",
    },
    {
      operation: "selectProduct",
      time: "O(D)",
      space: "O(D)",
      note: "D is number of coin denominations. Product lookup is map-based; preparing change scans denominations and may return a change list.",
    },
    {
      operation: "dispense",
      time: "O(1)",
      space: "O(1)",
      note: "Decrements one inventory counter and clears transaction fields.",
    },
    {
      operation: "admin refill",
      time: "O(1)",
      space: "O(1)",
      note: "Inventory.addProduct updates product and count maps for one product id.",
    },
    {
      operation: "cancel",
      time: "O(C)",
      space: "O(C)",
      note: "C is inserted coins for the active transaction; the refund list copies those coins.",
    },
  ],
  complexityNotesMD:
    "The interview-grade model is effectively constant time because the number of denominations is tiny. If the product catalog becomes large, product display and search need pagination or indexing, but the transaction state machine remains unchanged.",

  extensibility: [
    {
      label: "New denomination or notes",
      detailMD:
        "Add a new money type or generalize Coin into a PaymentUnit. Keep values in cents and route change-making through the same policy seam.",
    },
    {
      label: "Digital payments",
      detailMD:
        "Introduce a PaymentStrategy that authorizes and captures externally, while the State flow still decides when selection and dispensing are legal.",
    },
    {
      label: "Admin operations",
      detailMD:
        "Add authenticated refill methods for products and change bank loading. Inventory remains the stock authority; hardware adapters call into it.",
    },
    {
      label: "Product categories and discounts",
      detailMD:
        "Add metadata to Product and inject a pricing or promotion strategy before comparing inserted amount with final price.",
    },
    {
      label: "Telemetry",
      detailMD:
        "Emit events on selection failures, refunds, stock depletion, and successful dispenses without changing state behavior.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Single class with enum state",
      detailMD:
        "Keep an enum field such as IDLE or HAS_MONEY and use switch statements inside VendingMachine methods.",
      tradeoffsMD:
        "It is shorter for a toy demo, but every new state or transition edits the same large methods and invalid actions become easy to miss.",
    },
    {
      name: "Explicit ChangeStrategy interface",
      detailMD:
        "Extract takeChange into a ChangeStrategy with a greedy implementation, a dynamic-programming implementation, or a provider-specific refund strategy.",
      tradeoffsMD:
        "This is cleaner for production and aligns strongly with Strategy, but it adds another interface that may be unnecessary for a beginner interview unless payments are emphasized.",
    },
    {
      name: "Static singleton Inventory",
      detailMD:
        "Expose Inventory.getInstance so every machine and admin panel uses the same process-wide catalog.",
      tradeoffsMD:
        "It demonstrates Singleton directly, but constructor injection is easier to test and safer when modeling multiple physical machines.",
    },
  ],

  commonMistakes: [
    "Using boolean flags such as hasMoney and isDispensing instead of explicit State objects.",
    "Decrementing inventory during selection before payment and change validation have succeeded.",
    "Forgetting to refund inserted coins when exact change cannot be made.",
    "Letting OutOfStock discard the customer payment instead of allowing cancel or another selection.",
    "Using floating-point money values instead of integer cents.",
    "Hard-coding coin logic throughout every state instead of keeping it inside the machine or a payment strategy seam.",
    "Making Inventory mutable from the outside by exposing its internal maps.",
  ],

  followUps: [
    {
      question: "How would you support notes in addition to coins?",
      answerMD:
        "Generalize Coin into a MoneyUnit with denomination value, or add a PaymentStrategy that accepts both notes and coins. The state flow does not need to know which instrument was inserted.",
    },
    {
      question: "How do you handle a selected product that is out of stock?",
      answerMD:
        "Move to OutOfStockState, preserve inserted payment, and allow either cancel for refund or selecting another stocked product.",
    },
    {
      question: "Why not decrement stock immediately when the customer selects a product?",
      answerMD:
        "Selection can still fail because of insufficient funds or inability to make change. Stock should decrement only at the committed dispense step.",
    },
    {
      question: "How would you make the change algorithm robust for arbitrary denominations?",
      answerMD:
        "Extract a ChangeStrategy and use dynamic programming or bounded coin search when greedy is not guaranteed to find a valid solution.",
    },
    {
      question: "What happens if the machine loses power after taking payment?",
      answerMD:
        "Production systems persist transaction state and inserted value before moving to dispensing. On restart, reconcile pending transactions by refunding or completing dispense with an audit trail.",
    },
  ],

  productionConsiderations: [
    {
      label: "Hardware adapters",
      detailMD:
        "Coin acceptors, bill validators, card readers, and dispensers should be adapters around the domain. The core model should not perform device I/O directly.",
    },
    {
      label: "Durability and reconciliation",
      detailMD:
        "Persist inventory, cash-bank balances, and in-flight transactions so the machine can recover after power loss without losing money or stock.",
    },
    {
      label: "Security",
      detailMD:
        "Admin refill and cash collection require authentication, tamper detection, and auditable events.",
    },
    {
      label: "Operational monitoring",
      detailMD:
        "Track stockouts, failed change attempts, refunds, coin-bank levels, and dispenser errors so operators can service machines before customers are affected.",
    },
    {
      label: "Concurrency",
      detailMD:
        "A physical vending machine is usually single-user, but admin refill, telemetry, and remote price updates can race with purchases. Use a transaction lock or repository transaction around commit.",
    },
  ],

  interviewNotes: [
    "Did you lead with a State model rather than a pile of conditionals?",
    "Does each invalid action fail in the state where it is invalid?",
    "Is Inventory the single source of truth for product counts?",
    "Do payment and change calculations use integer cents?",
    "Can you explain where Strategy fits for change-making or external payments?",
    "Did you preserve inserted money across recoverable failures and refund on cancellation?",
  ],

  quiz: [
    {
      question: "Why is the State pattern a strong fit for a vending machine?",
      options: [
        "The same action has different legal behavior in Idle, HasMoney, Dispensing, and OutOfStock",
        "It makes coin arithmetic faster",
        "It removes the need for an inventory",
        "It automatically persists transactions",
      ],
      answerIndex: 0,
      explanationMD:
        "State localizes transition rules. For example, selectProduct is invalid in Idle, meaningful in HasMoney, and rejected during Dispensing.",
    },
    {
      question: "When should inventory be decremented?",
      options: [
        "When the customer inserts the first coin",
        "When the product button is pressed",
        "After payment and change validation, during dispense",
        "Only when the admin refills the machine",
      ],
      answerIndex: 2,
      explanationMD:
        "Dispensing is the commit point. Before that, the transaction may still fail and must not consume stock.",
    },
    {
      question: "What should happen if exact change cannot be produced?",
      options: [
        "Dispense the product and owe the customer later",
        "Refund inserted coins and reset the transaction",
        "Keep the money and mark the product out of stock",
        "Ignore the change amount if it is small",
      ],
      answerIndex: 1,
      explanationMD:
        "The machine should not accept a transaction it cannot settle. Refunding keeps money and stock consistent.",
    },
    {
      question: "How does Inventory relate to the Singleton idea in this design?",
      options: [
        "It is the single stock authority for the physical machine",
        "Every Product creates its own Inventory",
        "Each State stores a separate copy of stock counts",
        "The Coin enum owns all product counts",
      ],
      answerIndex: 0,
      explanationMD:
        "Even when injected for testability, Inventory should be one shared source of truth for stock reads, refills, and decrements.",
    },
    {
      question: "Where is the best seam for supporting cards, notes, or a different change algorithm?",
      options: [
        "Inside Product getters",
        "Inside every State implementation",
        "Behind a PaymentStrategy or ChangeStrategy used by the machine",
        "In the Coin enum constructor only",
      ],
      answerIndex: 2,
      explanationMD:
        "Payment policy varies independently from lifecycle rules, so Strategy keeps the state classes stable.",
    },
  ],

  practiceVariants: [
    {
      title: "Add a ChangeStrategy interface",
      detailMD:
        "Extract the greedy change code into an interface and add a bounded-search implementation for arbitrary denominations.",
      difficulty: "Beginner",
    },
    {
      title: "Support notes and card payments",
      detailMD:
        "Generalize payment input so coins, notes, and card authorization all feed the same transaction flow.",
      difficulty: "Intermediate",
    },
    {
      title: "Add remote admin refill and pricing",
      detailMD:
        "Create admin operations for refill, product disablement, and price changes, with validation so active purchases remain safe.",
      difficulty: "Intermediate",
    },
    {
      title: "Handle hardware failures",
      detailMD:
        "Model dispenser failure after payment authorization. Decide whether to refund, retry, or mark the slot unavailable.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What are the core vending machine states?",
      back: "Idle, HasMoney, Dispensing, and OutOfStock.",
    },
    {
      front: "What is the commit point for stock decrement?",
      back: "DispensingState.dispense, after product, funds, and change have already been validated.",
    },
    {
      front: "Why keep money as integer cents?",
      back: "It avoids floating-point rounding errors in payment, refund, and change calculations.",
    },
    {
      front: "What owns product counts?",
      back: "Inventory, treated as the single source of truth for the physical machine.",
    },
    {
      front: "Which pattern controls lifecycle transitions?",
      back: "State. Each state implements insertCoin, selectProduct, dispense, and cancel differently.",
    },
    {
      front: "Where should alternative change algorithms live?",
      back: "Behind a ChangeStrategy or PaymentStrategy seam, not inside every state.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** VendingMachine, State, IdleState, HasMoneyState, DispensingState, OutOfStockState, Inventory, Product, Coin.",
    "",
    "**Patterns:** State for lifecycle, Singleton-style Inventory as one stock authority, Strategy seam for payment and change.",
    "",
    "**Flow:** insert coin, move Idle to HasMoney, select product, validate stock and amount, prepare change, move to Dispensing, decrement inventory, clear transaction, return to Idle.",
    "",
    "**Invariants:** no dispense without selection, no stock decrement before commit, no accepted sale without exact change, refund returns inserted coins before reset.",
    "",
    "**Complexity:** insertCoin O(1), selectProduct O(D), dispense O(1), cancel O(C), where D is denominations and C is inserted coins.",
    "",
    "**Extend:** add notes or cards through payment strategy, add admin refill around Inventory, add robust change-making behind a strategy interface.",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Gamma, Helm, Johnson, Vlissides",
    },
    {
      title: "Head First Design Patterns",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Refactoring Guru: State Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/state",
    },
    {
      title: "Refactoring Guru: Strategy Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/strategy",
    },
  ],

  relatedProblems: [
    { slug: "atm", note: "Another cash-handling state machine with validation and failure recovery." },
    { slug: "coffee-machine", note: "A nearby machine-design problem with inventory and dispensing concerns." },
    { slug: "parking-lot", note: "A beginner aggregate-root problem with payment and resource allocation." },
  ],
};
