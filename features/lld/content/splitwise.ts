import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const splitwise: LLDProblemContent = {
  slug: "splitwise",

  statementMD: [
    "Design the object model for a **Splitwise-style expense sharing system**.",
    "Users can join groups, one member can record an expense paid on behalf of others,",
    "and the system maintains net balances so everyone can see who owes whom.",
    "",
    "The core design must support **equal**, **exact amount**, and **percentage** splits,",
    "update balances whenever an expense is committed, and simplify debts into the",
    "smallest practical list of settle-up payments.",
  ].join("\n"),

  businessContextMD: [
    "Splitwise is a favorite intermediate LLD problem at product and fintech companies",
    "because it looks like simple bookkeeping but quickly exposes design quality.",
    "Good candidates separate split calculation from expense orchestration, keep",
    "money arithmetic precise, preserve the zero-sum balance invariant, and describe",
    "how settlements are derived from balances rather than stored as a second source",
    "of truth.",
  ].join("\n"),

  functionalRequirements: [
    "Create users with stable identity, display name, and email.",
    "Create a group and add users as members.",
    "Record an expense with payer, amount, and a list of participant splits.",
    "Support equal, exact, and percentage split strategies.",
    "Validate that all split shares add up exactly to the expense amount.",
    "Maintain a net balance sheet for the group after every committed expense.",
    "Show a member's current net balance.",
    "Generate simplified settle-up payments from current balances.",
    "Return immutable snapshots for history, members, and balances so callers cannot corrupt state.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Money correctness",
      detailMD:
        "Use **BigDecimal** with two-decimal rounding. Never model balances with floating point numbers.",
    },
    {
      label: "Consistency",
      detailMD:
        "After every balance update, the sum of all net balances must be zero. Any non-zero total is a domain bug.",
    },
    {
      label: "Extensibility",
      detailMD:
        "Adding a new split mode such as shares, weights, or caps should mean adding a **Split** subclass, not editing expense validation.",
    },
    {
      label: "Thread safety at aggregate boundaries",
      detailMD:
        "**Group**, **ExpenseService**, and **BalanceSheet** synchronize mutations so member checks, expense writes, and balance updates cannot interleave incorrectly.",
    },
    {
      label: "Defensive reads",
      detailMD:
        "Membership, history, and balance snapshots are copied before exposure to keep the in-memory model encapsulated.",
    },
  ],

  requirementClarification: [
    {
      question: "Should users belong to multiple groups?",
      answerMD:
        "The core model designs one group at a time. A production service can keep many **Group** instances and route requests by group id.",
    },
    {
      question: "Does the payer have to be included in the splits?",
      answerMD:
        "No. The reference model supports both cases. The payer is credited for the full paid amount, and every listed split user is debited for their share.",
    },
    {
      question: "Do we store every pairwise debt edge?",
      answerMD:
        "No. Store only net balances per user. Pairwise payments are derived by **SettlementService** when the user asks to settle up.",
    },
    {
      question: "How exact must percentage splits be?",
      answerMD:
        "The base implementation rounds each participant share to two decimals and then validates the sum equals the expense amount. In production, remainder allocation should be explicit.",
    },
    {
      question: "Is payment execution in scope?",
      answerMD:
        "No. **Payment** is a settlement instruction. Integrating banks or wallets is a boundary adapter and appears as a follow-up.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class User {",
    "        -String id",
    "        -String displayName",
    "        -String email",
    "        +getId() String",
    "        +equals(Object) boolean",
    "    }",
    "    class Group {",
    "        -String id",
    "        -String name",
    "        -Set~User~ members",
    "        -BalanceSheet balanceSheet",
    "        +addMember(User) void",
    "        +contains(User) boolean",
    "        +getBalanceSheet() BalanceSheet",
    "    }",
    "    class Split {",
    "        <<abstract>>",
    "        -User user",
    "        +shareOf(BigDecimal,int) BigDecimal",
    "        +validate(BigDecimal) void",
    "    }",
    "    class EqualSplit",
    "    class ExactSplit {",
    "        -BigDecimal amount",
    "    }",
    "    class PercentSplit {",
    "        -BigDecimal percent",
    "    }",
    "    class Expense {",
    "        -String id",
    "        -User payer",
    "        -BigDecimal amount",
    "        -List~Split~ splits",
    "        -Instant createdAt",
    "        +getSplits() List~Split~",
    "    }",
    "    class BalanceSheet {",
    "        -Map~User,BigDecimal~ netBalances",
    "        +apply(Expense) void",
    "        +snapshot() Map",
    "        +balanceOf(User) BigDecimal",
    "    }",
    "    class ExpenseService {",
    "        -Group group",
    "        -List~Expense~ expenses",
    "        +addExpense(User,BigDecimal,List~Split~) Expense",
    "        +history() List~Expense~",
    "        +balanceOf(User) BigDecimal",
    "        +settleUp() List~Payment~",
    "    }",
    "    class SettlementService {",
    "        +simplify(Map) List~Payment~",
    "    }",
    "    class BalanceNode {",
    "        -User user",
    "        -BigDecimal amount",
    "    }",
    "    class Payment {",
    "        -User from",
    "        -User to",
    "        -BigDecimal amount",
    "        +describe() String",
    "    }",
    "    Group o-- User",
    "    Group *-- BalanceSheet",
    "    ExpenseService --> Group",
    "    ExpenseService o-- Expense",
    "    ExpenseService ..> SettlementService",
    "    Expense --> User",
    "    Expense o-- Split",
    "    Split --> User",
    "    Split <|-- EqualSplit",
    "    Split <|-- ExactSplit",
    "    Split <|-- PercentSplit",
    "    BalanceSheet ..> Expense",
    "    BalanceSheet --> User",
    "    SettlementService ..> BalanceNode",
    "    SettlementService ..> Payment",
    "    Payment --> User",
  ].join("\n"),
  classDiagramCaptionMD:
    "The service creates valid expenses, the split hierarchy owns share calculation, the balance sheet owns the zero-sum ledger, and settlement is derived on demand.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Member",
    "    participant Service as ExpenseService",
    "    participant GroupObj as Group",
    "    participant ExpenseObj as Expense",
    "    participant SplitObj as Split",
    "    participant Sheet as BalanceSheet",
    "    participant Solver as SettlementService",
    "    Member->>Service: addExpense(payer, amount, splits)",
    "    Service->>GroupObj: contains(payer)",
    "    loop each split",
    "        Service->>GroupObj: contains(split.user)",
    "    end",
    "    Service->>ExpenseObj: new Expense(id, payer, amount, splits)",
    "    loop each split",
    "        ExpenseObj->>SplitObj: validate(amount)",
    "        ExpenseObj->>SplitObj: shareOf(amount, count)",
    "    end",
    "    Service->>Sheet: apply(expense)",
    "    Sheet->>Sheet: credit payer and debit split users",
    "    Service-->>Member: Expense",
    "    Member->>Service: settleUp()",
    "    Service->>Sheet: snapshot()",
    "    Service->>Solver: simplify(snapshot)",
    "    Solver-->>Member: List[Payment]",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Expense creation, balance observation, and debt simplification are separate phases. That separation keeps validation, ledger mutation, and settlement policy independently testable.",

  entities: [
    {
      name: "User",
      responsibilityMD:
        "Identity value object for a member. Equality and hashing use **id**, which keeps balance maps stable even when display details change.",
      attributes: ["id", "displayName", "email"],
    },
    {
      name: "Group",
      responsibilityMD:
        "Aggregate for membership and the group's **BalanceSheet**. It exposes synchronized membership operations and owns the single ledger for the group.",
      attributes: ["id", "name", "members", "balanceSheet"],
    },
    {
      name: "Split",
      responsibilityMD:
        "Abstract split strategy. It binds a participant user and defines **shareOf** and **validate** so each concrete split mode owns its own math.",
      attributes: ["user", "shareOf(totalAmount, splitCount)", "validate(totalAmount)"],
    },
    {
      name: "EqualSplit",
      responsibilityMD:
        "Concrete strategy that divides the total amount evenly across the number of split entries, rounding to two decimals.",
      attributes: ["user"],
    },
    {
      name: "ExactSplit",
      responsibilityMD:
        "Concrete strategy that stores a fixed owed amount for the participant and rejects negative or over-large shares.",
      attributes: ["user", "amount"],
    },
    {
      name: "PercentSplit",
      responsibilityMD:
        "Concrete strategy that stores a percentage and derives the participant amount from the expense total.",
      attributes: ["user", "percent"],
    },
    {
      name: "Expense",
      responsibilityMD:
        "Immutable transaction record. It validates positive amount, non-empty splits, each split's rule, and the final sum before the ledger can observe it.",
      attributes: ["id", "payer", "amount", "splits", "createdAt"],
    },
    {
      name: "BalanceSheet",
      responsibilityMD:
        "Synchronized net-balance ledger. Applying an expense credits the payer, debits participants, removes zero balances, and enforces total zero.",
      attributes: ["netBalances"],
    },
    {
      name: "ExpenseService",
      responsibilityMD:
        "Application service and factory method boundary. It validates membership, creates **Expense** ids, applies the expense to the sheet, stores history, and starts settlement.",
      attributes: ["group", "expenses"],
    },
    {
      name: "SettlementService",
      responsibilityMD:
        "Simplification algorithm. It converts positive balances into creditors, negative balances into debtors, and greedily emits payments between the largest remaining sides.",
      attributes: ["simplify(balances)"],
    },
    {
      name: "Payment",
      responsibilityMD:
        "Settle-up instruction from one user to another for a precise amount. It is derived from balances and not stored as primary ledger truth.",
      attributes: ["from", "to", "amount"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "**Split** is the strategy abstraction. **EqualSplit**, **ExactSplit**, and **PercentSplit** vary share calculation and validation while **Expense** treats them uniformly.",
    },
    {
      name: "Observer",
      whyMD:
        "**BalanceSheet** is the ledger observer of committed expenses. The reference implementation wires the notification synchronously through **ExpenseService.addExpense** with **apply(expense)**, keeping balance mutation outside **Expense** itself.",
    },
    {
      name: "Factory Method",
      whyMD:
        "**ExpenseService.addExpense** is the creation boundary for valid **Expense** objects: it checks membership, generates the id, constructs the expense, applies it, and returns the committed aggregate.",
    },
  ],

  designSteps: [
    {
      title: "Start with stable user identity and group membership",
      detailMD:
        "**User** equality is based on **id**, not email or display name. **Group** keeps members in a set and synchronizes reads and writes so membership checks are consistent during expense creation.",
    },
    {
      title: "Make split modes pluggable strategies",
      detailMD:
        "Put the variable math behind **Split.shareOf** and **Split.validate**. **Expense** can validate any split list without switch statements.",
      code: [
        "public abstract class Split {",
        "    private final User user;",
        "",
        "    public abstract BigDecimal shareOf(BigDecimal totalAmount, int splitCount);",
        "    public abstract void validate(BigDecimal totalAmount);",
        "}",
      ].join("\n"),
    },
    {
      title: "Validate each expense before touching balances",
      detailMD:
        "**Expense** is immutable and validates that the amount is positive, the split list is non-empty, and all calculated shares sum to the paid amount.",
      code: [
        "BigDecimal total = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);",
        "for (Split split : splits) {",
        "    split.validate(amount);",
        "    total = total.add(split.shareOf(amount, splits.size()));",
        "}",
        "if (total.compareTo(amount) != 0) {",
        "    throw new IllegalArgumentException();",
        "}",
      ].join("\n"),
    },
    {
      title: "Use the service as the factory and transaction boundary",
      detailMD:
        "**ExpenseService.addExpense** checks that payer and participants are group members, creates a UUID-backed **Expense**, applies it to the ledger, appends history, and returns the committed object.",
      code: [
        "public synchronized Expense addExpense(User payer, BigDecimal amount, List<Split> splits) {",
        "    ensureMember(payer);",
        "    for (Split split : splits) ensureMember(split.getUser());",
        "    Expense expense = new Expense(UUID.randomUUID().toString(), payer, amount, splits);",
        "    group.getBalanceSheet().apply(expense);",
        "    expenses.add(expense);",
        "    return expense;",
        "}",
      ].join("\n"),
    },
    {
      title: "Update net balances as an observed side effect",
      detailMD:
        "**BalanceSheet.apply** credits the payer for the full amount and debits every split user for their share. Removing zero entries keeps snapshots compact, and the total-zero assertion catches drift.",
    },
    {
      title: "Derive settle-up payments from balances",
      detailMD:
        "**SettlementService** does not mutate the ledger. It separates creditors and debtors into priority queues, matches the largest credit with the largest debt, emits a **Payment**, and repeats until one side is empty.",
    },
    {
      title: "Keep read APIs defensive",
      detailMD:
        "**getMembers**, **history**, and **snapshot** return unmodifiable copies. This is important in LLD interviews because it proves callers cannot bypass domain methods and edit internal state.",
    },
  ],

  implementation: referenceFiles("design-splitwise"),

  classExplanations: [
    {
      className: "User",
      detailMD:
        "Final identity class with **id**, **displayName**, and **email**. Equality and hash code depend only on **id**, which is exactly what a ledger map needs.",
    },
    {
      className: "Group",
      detailMD:
        "Owns a synchronized **LinkedHashSet** of members and a single **BalanceSheet**. It gives the service a membership guard without exposing mutable internal state.",
    },
    {
      className: "Split",
      detailMD:
        "Abstract base for split strategies. It stores the participant **User**, declares **shareOf** and **validate**, and provides **money** for two-decimal rounding.",
    },
    {
      className: "EqualSplit",
      detailMD:
        "Concrete split strategy that divides the total amount by split count using two-decimal **HALF_UP** rounding. It only needs to ensure the expense amount is positive.",
    },
    {
      className: "ExactSplit",
      detailMD:
        "Concrete split strategy with a fixed **amount**. It rejects negative shares and shares larger than the total expense.",
    },
    {
      className: "PercentSplit",
      detailMD:
        "Concrete split strategy with a **percent** field. It validates the percentage range and converts it to money by multiplying the expense amount.",
    },
    {
      className: "Expense",
      detailMD:
        "Immutable expense record with generated id, payer, rounded amount, copied splits, and timestamp. Construction fails unless split shares sum exactly to the amount.",
    },
    {
      className: "BalanceSheet",
      detailMD:
        "Synchronized ledger of **User** to net **BigDecimal**. **apply** credits the payer, debits participants, removes zero balances, and asserts that the ledger remains zero-sum.",
    },
    {
      className: "ExpenseService",
      detailMD:
        "Application service for a single group. It validates membership, factory-creates expenses with UUIDs, updates the balance sheet, stores history, answers balances, and delegates settlement.",
    },
    {
      className: "SettlementService",
      detailMD:
        "Stateless debt simplifier. It builds creditor and debtor priority queues from a snapshot and repeatedly emits the minimum payment between the largest remaining amounts.",
    },
    {
      className: "BalanceNode",
      detailMD:
        "Private helper inside **SettlementService** that pairs a **User** with an absolute amount for priority queue ordering.",
    },
    {
      className: "Payment",
      detailMD:
        "Package-private settlement instruction with **from**, **to**, and **amount**. **describe** renders a human-readable instruction without exposing ledger mutation.",
    },
  ],

  dryRun: {
    inputMD:
      "Group members: **Asha**, **Ben**, **Chen**. Expense 1: Asha pays 300.00 split equally across all three. Expense 2: Ben pays 120.00 split exactly as Asha 50.00 and Chen 70.00.",
    columns: ["Step", "Action", "Asha", "Ben", "Chen", "Output"],
    rows: [
      ["1", "Add members", "0.00", "0.00", "0.00", "All balances start at zero"],
      ["2", "Asha pays 300.00 equally", "+200.00", "-100.00", "-100.00", "Asha credited 300.00 and debited 100.00"],
      ["3", "Ben pays 120.00 exact", "+150.00", "+20.00", "-170.00", "Asha debited 50.00, Chen debited 70.00"],
      ["4", "settleUp()", "+150.00", "+20.00", "-170.00", "Chen -> Asha 150.00; Chen -> Ben 20.00"],
    ],
    narrativeMD:
      "The balance sheet stores net positions, not pairwise edges. Asha and Ben are creditors after both expenses; Chen is the only debtor, so settlement emits two payments.",
  },

  complexity: [
    {
      operation: "addExpense",
      time: "O(S)",
      space: "O(S)",
      note: "S split entries. Membership checks are set lookups, validation iterates splits, and the expense stores a copied split list.",
    },
    {
      operation: "balanceOf",
      time: "O(1)",
      space: "O(1)",
      note: "Hash map lookup in the balance sheet.",
    },
    {
      operation: "history",
      time: "O(E)",
      space: "O(E)",
      note: "Returns a defensive copy of E expenses.",
    },
    {
      operation: "snapshot",
      time: "O(U)",
      space: "O(U)",
      note: "Copies balances for U users with non-zero positions.",
    },
    {
      operation: "settleUp",
      time: "O(U log U)",
      space: "O(U)",
      note: "Builds debtor and creditor priority queues and emits at most O(U) payments.",
    },
  ],
  complexityNotesMD:
    "For interview scale, the hot path is **addExpense**, linear in participants on that expense. **settleUp** is usually less frequent and depends on users with non-zero balances, not total expenses recorded.",

  extensibility: [
    {
      label: "New split strategy",
      detailMD:
        "Add a new **Split** subclass such as **ShareSplit**, **WeightSplit**, or **CappedSplit**. **Expense** and **BalanceSheet** keep calling **shareOf** and **validate**.",
    },
    {
      label: "Multi-group application",
      detailMD:
        "Put **Group** instances behind a repository keyed by group id. **ExpenseService** can become request-scoped or receive the group for each command.",
    },
    {
      label: "Real payment execution",
      detailMD:
        "Keep **Payment** as a domain instruction and add a **PaymentProcessor** adapter for wallets, UPI, cards, or bank transfers.",
    },
    {
      label: "Expense categories and attachments",
      detailMD:
        "Add optional fields to **Expense** or a side object for category, notes, and receipt URLs without changing split math or settlement.",
    },
    {
      label: "Notifications",
      detailMD:
        "Generalize the synchronous balance update into an observer list so expense-created events can update balances, send push notifications, and write audit logs.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Pairwise debt matrix",
      detailMD:
        "Store what each user owes every other user directly, updating pairwise edges on every expense.",
      tradeoffsMD:
        "Makes some user-to-user views fast, but creates O(U squared) state and makes simplification more complex. Net balances are a cleaner source of truth.",
    },
    {
      name: "Event-sourced ledger",
      detailMD:
        "Append immutable expense events and recompute balances from the event log or maintain projections.",
      tradeoffsMD:
        "Excellent auditability and replay, but more infrastructure and eventual consistency. For an LLD interview, an in-memory balance sheet is clearer.",
    },
    {
      name: "Explicit observer interface",
      detailMD:
        "Define an **ExpenseObserver** interface and let **BalanceSheet**, notification senders, and audit writers subscribe to committed expenses.",
      tradeoffsMD:
        "More extensible than a direct **apply** call, but adds ceremony. The reference keeps the observer relationship synchronous and simple.",
    },
    {
      name: "Stored settlements",
      detailMD:
        "Persist generated **Payment** instructions as settlement sessions.",
      tradeoffsMD:
        "Useful for payment workflows, but dangerous if treated as truth. Balances must remain the canonical ledger until payments are actually recorded.",
    },
  ],

  commonMistakes: [
    "Using **double** or **float** for money and then fighting rounding bugs.",
    "Keeping pairwise debts as the primary source of truth when net balances are enough for settlement.",
    "Putting equal, exact, and percentage logic in **ExpenseService** with conditionals instead of a **Split** strategy hierarchy.",
    "Forgetting to validate that split shares sum to the expense amount.",
    "Allowing non-members to appear in an expense because only the payer was checked.",
    "Updating history before balance application succeeds, leaving a committed expense without ledger changes.",
    "Returning mutable lists or maps from **Group**, **ExpenseService**, or **BalanceSheet**.",
    "Treating simplified **Payment** instructions as already-settled money movement.",
  ],

  followUps: [
    {
      question: "How would you record that Chen actually paid Asha 150.00?",
      answerMD:
        "Model settlement as another ledger event: payer Chen, receiver Asha, amount 150.00. Apply it by debiting Asha's credit and reducing Chen's debt, then keep an audit record.",
    },
    {
      question: "How do you support recurring expenses like monthly rent?",
      answerMD:
        "Add a scheduler that creates normal **Expense** objects from a recurrence rule. The ledger should not care whether an expense was manual or scheduled.",
    },
    {
      question: "How would you make percentage splits robust when rounding leaves one cent?",
      answerMD:
        "Choose a deterministic remainder policy, such as assigning leftover cents to the payer or to participants sorted by id, and test it explicitly.",
    },
    {
      question: "Can this design support individual friendships outside groups?",
      answerMD:
        "Yes. Represent a one-to-one group or introduce a **Ledger** abstraction shared by groups and friendships. The split, expense, and settlement logic remains reusable.",
    },
    {
      question: "What changes for millions of users?",
      answerMD:
        "Persist users, expenses, and balances; shard by group id; make **addExpense** transactional; publish expense-created events for async projections and notifications.",
    },
  ],

  productionConsiderations: [
    {
      label: "Transactional persistence",
      detailMD:
        "Store expense history and balance deltas in one database transaction. A committed expense without its balance update is an accounting incident.",
    },
    {
      label: "Audit trail",
      detailMD:
        "Keep immutable expense and settlement events, including who created them and when. Financial products need explainability and rollback paths.",
    },
    {
      label: "Idempotency",
      detailMD:
        "Accept a client request id for **addExpense** so retries after network failures do not create duplicate expenses.",
    },
    {
      label: "Currency and locale",
      detailMD:
        "Add a currency field and use currency-specific scales. Do not mix balances across currencies without an explicit conversion event.",
    },
    {
      label: "Notifications and projections",
      detailMD:
        "Publish an expense-created event after commit. Balance projections, push notifications, email, and analytics can consume it independently.",
    },
    {
      label: "Privacy and access control",
      detailMD:
        "Verify group membership for every read and write. Expense history and balances are sensitive financial data.",
    },
  ],

  interviewNotes: [
    "Did the candidate identify **Split** as the Strategy seam and avoid switch-heavy split calculation?",
    "Did they protect the zero-sum balance invariant after every expense?",
    "Did they separate net balances from derived settle-up payments?",
    "Did they use precise money types and discuss rounding edge cases?",
    "Did they keep **ExpenseService** as the consistency boundary for membership, creation, ledger update, and history?",
    "Can they explain the greedy settlement algorithm and its complexity?",
  ],

  quiz: [
    {
      question: "Why is **Split** an abstract class with **shareOf** and **validate**?",
      options: [
        "So equal, exact, and percentage splits can vary independently of **Expense**",
        "So balances can be stored without users",
        "So settlement can run in constant time",
        "So Java can avoid using **BigDecimal**",
      ],
      answerIndex: 0,
      explanationMD:
        "This is the Strategy pattern: **Expense** depends on the stable **Split** contract while concrete split modes own their math.",
    },
    {
      question: "What invariant does **BalanceSheet.apply** verify after updating balances?",
      options: [
        "Every user has a positive balance",
        "The sum of all net balances is zero",
        "Every expense has exactly three splits",
        "The payer never appears in the split list",
      ],
      answerIndex: 1,
      explanationMD:
        "A group ledger is zero-sum: every credit must be matched by equal debits.",
    },
    {
      question: "Why does **settleUp** use priority queues of creditors and debtors?",
      options: [
        "To match the largest remaining credit with the largest remaining debt efficiently",
        "To preserve expense insertion order",
        "To avoid validating split totals",
        "To make member lookup faster",
      ],
      answerIndex: 0,
      explanationMD:
        "The greedy simplification repeatedly clears the largest possible amount between one debtor and one creditor.",
    },
    {
      question: "Which class acts as the factory method boundary for creating committed expenses?",
      options: ["User", "BalanceSheet", "ExpenseService", "Payment"],
      answerIndex: 2,
      explanationMD:
        "**ExpenseService.addExpense** validates membership, generates the id, constructs the **Expense**, updates the ledger, and stores history.",
    },
    {
      question: "Why are **history** and **snapshot** returned as defensive copies?",
      options: [
        "To let callers mutate internal state faster",
        "To prevent external code from corrupting service or ledger internals",
        "To make **BigDecimal** immutable",
        "To force settlement to use exact splits only",
      ],
      answerIndex: 1,
      explanationMD:
        "Encapsulation matters: callers should read state through copies, not hold references to internal mutable collections.",
    },
  ],

  practiceVariants: [
    {
      title: "Add share-based splits",
      detailMD:
        "Implement **ShareSplit** where each participant has N shares and pays amount times their share divided by total shares. Keep **Expense** unchanged.",
      difficulty: "Beginner",
    },
    {
      title: "Record actual settlements",
      detailMD:
        "Add a command that records a real payment between two users and applies it to the balance sheet as a ledger event.",
      difficulty: "Intermediate",
    },
    {
      title: "Multi-currency groups",
      detailMD:
        "Allow a group to track balances per currency and reject settlement across currencies unless an explicit conversion event exists.",
      difficulty: "Advanced",
    },
    {
      title: "Expense observers",
      detailMD:
        "Introduce an **ExpenseObserver** interface so balance updates, notifications, analytics, and audit logging subscribe to the same committed expense event.",
      difficulty: "Intermediate",
    },
  ],

  flashcards: [
    {
      front: "What is the source of truth for debts?",
      back: "The **BalanceSheet** net balance map. Pairwise **Payment** instructions are derived when settling up.",
    },
    {
      front: "Which pattern models equal, exact, and percentage splits?",
      back: "Strategy — **Split** is the abstraction, with **EqualSplit**, **ExactSplit**, and **PercentSplit** as concrete strategies.",
    },
    {
      front: "What does a positive balance mean?",
      back: "The user is owed money by the group. A negative balance means the user owes money.",
    },
    {
      front: "Why validate split totals in **Expense**?",
      back: "An invalid expense must fail before the ledger is updated; otherwise the zero-sum invariant can be broken.",
    },
    {
      front: "How does settlement simplification work?",
      back: "Put creditors and debtors in priority queues and repeatedly pay the smaller of the largest credit and largest debt.",
    },
    {
      front: "Why is **ExpenseService.addExpense** synchronized?",
      back: "It keeps membership checks, expense creation, balance application, and history append as one consistency boundary.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** User, Group, Split hierarchy, Expense, BalanceSheet, ExpenseService, SettlementService, Payment.",
    "",
    "**Patterns:** Strategy for split calculation; Observer-style balance update on committed expense; Factory Method through **ExpenseService.addExpense**.",
    "",
    "**Core flow:** addExpense = validate members -> create Expense -> validate split totals -> apply BalanceSheet -> append history.",
    "",
    "**Balance rule:** payer gets credited by the paid amount; every split user is debited by their computed share; all balances must sum to zero.",
    "",
    "**Settlement:** derive payments from net balances using creditor and debtor priority queues. Do not store pairwise debts as primary truth.",
    "",
    "**Complexity:** addExpense O(S), balanceOf O(1), snapshot O(U), settleUp O(U log U).",
    "",
    "**Interview hooks:** money precision, rounding remainders, idempotency, settlement recording, multi-currency, and observer-based notifications.",
  ].join("\n"),

  references: [
    {
      title: "Head First Design Patterns (Strategy and Observer)",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Effective Java — Item 17 (minimize mutability) and Item 60 (avoid float and double if exact answers are required)",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — Strategy Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/strategy",
    },
    {
      title: "Refactoring Guru — Observer Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/observer",
    },
  ],

  relatedProblems: [
    { slug: "digital-wallet", note: "Settlement execution and wallet transfers build on the same money and ledger concerns." },
    { slug: "banking-system", note: "Banking extends this problem into stronger transaction, audit, and account invariants." },
    { slug: "parking-lot", note: "Another aggregate-root design with Strategy and Factory Method seams." },
  ],
};
