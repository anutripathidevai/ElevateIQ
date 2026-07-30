import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const atm: LLDProblemContent = {
  slug: "atm",

  statementMD: [
    "Design an **ATM** that accepts one card at a time, authenticates the card holder with a PIN, allows balance inquiry and cash withdrawal, and returns the card safely at the end of the session.",
    "",
    "The main design challenge is to keep the session lifecycle explicit. The user moves conceptually through **Idle**, **CardInserted**, **Authenticated**, **SelectingTransaction**, and **Dispensing**. The reference implementation names CardInserted as **HasCardState** and represents transaction selection plus execution with **AuthenticatedState** and **TransactionState**.",
  ].join("\n"),

  businessContextMD: [
    "ATM is a classic low-level design interview problem because it combines UI flow, account safety, and physical hardware constraints in a compact model.",
    "",
    "Interviewers expect a candidate to avoid a giant condition-heavy controller. A strong design makes each state responsible for the actions allowed at that point, delegates PIN and balance operations to the bank boundary, and treats the cash cassette as one shared hardware resource that dispenses notes through a highest-denomination-first chain.",
  ].join("\n"),

  functionalRequirements: [
    "Accept a card only when the ATM is idle and bind it to the current session.",
    "Authenticate the card holder by validating the entered PIN through a bank or account service.",
    "Maintain the active card and account only for the lifetime of the session.",
    "Allow an authenticated user to check account balance through the bank service.",
    "Allow an authenticated user to select a transaction such as withdrawal or deposit.",
    "Withdraw cash only when the amount is positive, the account has enough balance, and the dispenser can satisfy the amount with available notes.",
    "Dispense cash using a highest-denomination-first note chain such as 2000, then 500, then 100.",
    "Allow card ejection from any active session and return the ATM to idle with session data cleared.",
    "Reject invalid actions in the current state, such as withdrawing before PIN validation.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Session correctness",
      detailMD:
        "Only one card session is active in the base design, and every eject or failed authentication path clears the active card and account.",
    },
    {
      label: "Financial consistency",
      detailMD:
        "A withdrawal must not debit the account unless the dispenser can serve the amount, and it must not dispense unless the debit succeeds.",
    },
    {
      label: "Cash inventory integrity",
      detailMD:
        "The dispenser owns note counts and updates them atomically per denomination so software balance never drifts from cassette balance.",
    },
    {
      label: "Extensibility",
      detailMD:
        "New states, transaction types, and denominations should be additive through new state handlers or chain links, not edits across the controller.",
    },
    {
      label: "Security",
      detailMD:
        "PIN validation belongs behind the bank boundary; production systems hash PIN data, limit attempts, and audit every account mutation.",
    },
    {
      label: "Low latency",
      detailMD:
        "State transitions and denomination checks are in-memory and bounded by a tiny number of states and note handlers.",
    },
  ],

  requirementClarification: [
    {
      question: "Can the ATM serve more than one card at the same time?",
      answerMD:
        "No. Assume one physical terminal with one active session. Multiple ATMs would each have their own session context and shared bank backend.",
    },
    {
      question: "Which denominations should the cash dispenser support?",
      answerMD:
        "Use 2000, 500, and 100 in the base design. The chain is ordered from highest to lowest denomination so larger notes are consumed first.",
    },
    {
      question: "How should balance inquiry work?",
      answerMD:
        "It is read-only after authentication. The reference bank service exposes **getBalance**, so the ATM UI can display the balance without changing session state.",
    },
    {
      question: "What happens after an invalid PIN?",
      answerMD:
        "The base implementation prints an invalid PIN message, clears the session, and returns to idle. A production version would count attempts and may retain or block the card.",
    },
    {
      question: "Should the account be debited before checking cash availability?",
      answerMD:
        "No. First validate that the dispenser can serve the amount, then debit the account, then dispense notes. This avoids charging for impossible cash.",
    },
    {
      question: "Is the cash dispenser a Singleton?",
      answerMD:
        "Conceptually yes for one terminal because there is only one physical cassette inventory. The reference code injects one **CashDispenser** instance, which keeps the singleton resource testable.",
    },
  ],
  classDiagramMermaid: [
    "classDiagram",
    "    class ATMState {",
    "        <<interface>>",
    "        +insertCard(ATM, Card) void",
    "        +enterPin(ATM, String) void",
    "        +selectOperation(ATM, String) void",
    "        +withdraw(ATM, int) void",
    "        +deposit(ATM, int) void",
    "        +ejectCard(ATM) void",
    "        +name() String",
    "    }",
    "    class IdleState {",
    "        +insertCard(ATM, Card) void",
    "        +ejectCard(ATM) void",
    "        +name() String",
    "    }",
    "    class HasCardState {",
    "        +enterPin(ATM, String) void",
    "        +name() String",
    "    }",
    "    class AuthenticatedState {",
    "        +selectOperation(ATM, String) void",
    "        +ejectCard(ATM) void",
    "        +name() String",
    "    }",
    "    class TransactionState {",
    "        -String operation",
    "        +withdraw(ATM, int) void",
    "        +deposit(ATM, int) void",
    "        +selectOperation(ATM, String) void",
    "        +name() String",
    "    }",
    "    class ATM {",
    "        -ATMState state",
    "        -BankService bankService",
    "        -CashDispenser cashDispenser",
    "        -Card currentCard",
    "        -Account currentAccount",
    "        +insertCard(Card) void",
    "        +enterPin(String) void",
    "        +selectOperation(String) void",
    "        +withdraw(int) void",
    "        +deposit(int) void",
    "        +ejectCard() void",
    "        +getState() ATMState",
    "    }",
    "    class Card {",
    "        -String cardNumber",
    "        -String accountId",
    "        +getCardNumber() String",
    "        +getAccountId() String",
    "    }",
    "    class Account {",
    "        -String id",
    "        -String pin",
    "        -int balance",
    "        +hasPin(String) boolean",
    "        +getBalance() int",
    "        +debit(int) void",
    "        +credit(int) void",
    "    }",
    "    class BankService {",
    "        -Map~String,Account~ accounts",
    "        +register(Account) void",
    "        +getAccount(String) Account",
    "        +validatePin(Card, String) boolean",
    "        +debit(String, int) void",
    "        +credit(String, int) void",
    "        +getBalance(String) int",
    "    }",
    "    class DispenseChain {",
    "        <<interface>>",
    "        +setNext(DispenseChain) void",
    "        +canDispense(int) boolean",
    "        +dispense(int) void",
    "    }",
    "    class NoteDispenser {",
    "        -int denomination",
    "        -int noteCount",
    "        -DispenseChain next",
    "        +canDispense(int) boolean",
    "        +dispense(int) void",
    "    }",
    "    class CashDispenser {",
    "        -DispenseChain head",
    "        +canDispense(int) boolean",
    "        +dispense(int) void",
    "    }",
    "    ATMState <|.. IdleState",
    "    ATMState <|.. HasCardState",
    "    ATMState <|.. AuthenticatedState",
    "    ATMState <|.. TransactionState",
    "    ATM o-- ATMState : current",
    "    ATM --> BankService",
    "    ATM --> CashDispenser",
    "    ATM --> Card : currentCard",
    "    ATM --> Account : currentAccount",
    "    Card --> Account : accountId",
    "    BankService o-- Account",
    "    CashDispenser o-- DispenseChain",
    "    DispenseChain <|.. NoteDispenser",
    "    NoteDispenser --> DispenseChain : next",
  ].join("\n"),
  classDiagramCaptionMD:
    "The diagram uses the real reference names: **HasCardState** is the CardInserted phase, **AuthenticatedState** lets the user choose a transaction, and **TransactionState** executes withdrawal or deposit before returning to authenticated.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Customer",
    "    participant Atm as ATM",
    "    participant Idle as IdleState",
    "    participant HasCard as HasCardState",
    "    participant Auth as AuthenticatedState",
    "    participant Txn as TransactionState",
    "    participant Bank as BankService",
    "    participant Account as Account",
    "    participant Dispenser as CashDispenser",
    "    participant Chain as DispenseChain",
    "    Customer->>Atm: insertCard(card)",
    "    Atm->>Idle: insertCard(atm, card)",
    "    Idle->>Atm: setCurrentCard, setState HasCardState",
    "    Customer->>Atm: enterPin(pin)",
    "    Atm->>HasCard: enterPin(atm, pin)",
    "    HasCard->>Bank: validatePin(card, pin)",
    "    Bank->>Account: hasPin(pin)",
    "    Account-->>Bank: true",
    "    Bank-->>HasCard: true",
    "    HasCard->>Bank: getAccount(accountId)",
    "    HasCard->>Atm: setCurrentAccount, setState AuthenticatedState",
    "    opt Balance inquiry",
    "        Atm->>Bank: getBalance(accountId)",
    "        Bank->>Account: getBalance()",
    "        Account-->>Bank: balance",
    "        Bank-->>Atm: balance",
    "    end",
    "    Customer->>Atm: selectOperation(WITHDRAW)",
    "    Atm->>Auth: selectOperation(atm, WITHDRAW)",
    "    Auth->>Atm: setState TransactionState",
    "    Customer->>Atm: withdraw(amount)",
    "    Atm->>Txn: withdraw(atm, amount)",
    "    Txn->>Atm: performWithdrawal(amount)",
    "    Atm->>Dispenser: canDispense(amount)",
    "    Dispenser->>Chain: canDispense(amount)",
    "    Chain-->>Dispenser: true",
    "    Dispenser-->>Atm: true",
    "    Atm->>Bank: debit(accountId, amount)",
    "    Bank->>Account: debit(amount)",
    "    Atm->>Dispenser: dispense(amount)",
    "    Dispenser->>Chain: dispense(amount)",
    "    Txn->>Atm: setState AuthenticatedState",
    "    Customer->>Atm: ejectCard()",
    "    Atm->>Auth: ejectCard(atm)",
    "    Auth->>Atm: clearSession, setState IdleState",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "The withdrawal path checks cash availability before account debit, then lets the denomination chain release notes. Balance inquiry is read-only and does not change state.",
  entities: [
    {
      name: "ATM",
      responsibilityMD:
        "Session context and public façade. It delegates user actions to the active state, stores current card/account, and coordinates bank and dispenser calls.",
      attributes: ["state", "bankService", "cashDispenser", "currentCard", "currentAccount"],
    },
    {
      name: "ATMState",
      responsibilityMD:
        "State interface for all user actions. Default methods reject invalid operations, so each concrete state only implements what it allows.",
      attributes: ["insertCard", "enterPin", "selectOperation", "withdraw", "deposit", "ejectCard"],
    },
    {
      name: "IdleState",
      responsibilityMD:
        "Represents the terminal before any card is present. It accepts a card, stores it on the ATM, and moves the session to **HasCardState**.",
      attributes: ["insertCard", "ejectCard", "name"],
    },
    {
      name: "HasCardState",
      responsibilityMD:
        "CardInserted phase. It validates the PIN through **BankService**, loads the account on success, or clears the session on failure.",
      attributes: ["enterPin", "name"],
    },
    {
      name: "AuthenticatedState",
      responsibilityMD:
        "Authenticated phase. It lets the user choose a transaction and supports card ejection without losing account correctness.",
      attributes: ["selectOperation", "ejectCard", "name"],
    },
    {
      name: "TransactionState",
      responsibilityMD:
        "Selected transaction phase. It stores the selected operation, executes withdrawal or deposit, and returns to authenticated for the next action.",
      attributes: ["operation", "withdraw", "deposit", "selectOperation"],
    },
    {
      name: "Card",
      responsibilityMD:
        "Immutable card data used to identify the bank account for the current session.",
      attributes: ["cardNumber", "accountId"],
    },
    {
      name: "Account",
      responsibilityMD:
        "Bank account aggregate with synchronized PIN check, balance read, debit, and credit operations.",
      attributes: ["id", "pin", "balance"],
    },
    {
      name: "BankService",
      responsibilityMD:
        "Boundary to account data. It registers accounts, validates PINs, exposes balance inquiry, and performs debit or credit.",
      attributes: ["accounts", "validatePin", "getBalance", "debit", "credit"],
    },
    {
      name: "CashDispenser",
      responsibilityMD:
        "Single cash hardware façade for the terminal. It owns the head of the denomination chain and validates amounts before dispensing.",
      attributes: ["head", "canDispense", "dispense"],
    },
    {
      name: "DispenseChain",
      responsibilityMD:
        "Chain interface implemented by note handlers. Each link can validate or dispense part of the requested amount and delegate the remainder.",
      attributes: ["setNext", "canDispense", "dispense"],
    },
    {
      name: "NoteDispenser",
      responsibilityMD:
        "One denomination handler. It uses as many of its notes as possible, updates its count on dispense, and passes the remainder to the next link.",
      attributes: ["denomination", "noteCount", "next"],
    },
  ],

  patternsUsed: [
    {
      name: "State",
      whyMD:
        "The session lifecycle is represented by **ATMState** implementations. Invalid actions are rejected by the current state instead of a long conditional block inside **ATM**.",
    },
    {
      name: "Chain of Responsibility",
      whyMD:
        "**CashDispenser** delegates to a linked chain of **NoteDispenser** handlers. Each handler consumes its denomination and passes the remaining amount downward.",
    },
    {
      name: "Singleton",
      whyMD:
        "A physical ATM has one cash cassette inventory. The reference design injects one **CashDispenser** instance so tests stay clean, while production can expose that same resource through a singleton provider per terminal.",
    },
  ],

  designSteps: [
    {
      title: "Define state-driven user actions",
      detailMD:
        "Start with **ATMState** as the contract for card insertion, PIN entry, transaction selection, withdrawal, deposit, and eject. Default methods reject actions that the current state does not allow.",
      code: [
        "public interface ATMState {",
        "    default void withdraw(ATM atm, int amount) {",
        "        throw new IllegalStateException(\"Cannot withdraw now\");",
        "    }",
        "",
        "    String name();",
        "}",
      ].join("\n"),
    },
    {
      title: "Map lifecycle phases to concrete states",
      detailMD:
        "Use **IdleState** for no card, **HasCardState** for CardInserted, **AuthenticatedState** for selecting the next transaction, and **TransactionState** for executing the selected operation.",
    },
    {
      title: "Keep ATM as a delegating context",
      detailMD:
        "Public methods on **ATM** are thin. They call the same method on the current state, while package-level helpers such as **performWithdrawal** perform the coordinated bank and dispenser work.",
    },
    {
      title: "Authenticate and read balances through the bank boundary",
      detailMD:
        "**BankService** owns account lookup, PIN validation, balance inquiry, debit, and credit. The ATM does not inspect or mutate account fields directly.",
      code: [
        "public int getBalance(String accountId) {",
        "    return getAccount(accountId).getBalance();",
        "}",
        "",
        "public void debit(String accountId, int amount) {",
        "    getAccount(accountId).debit(amount);",
        "}",
      ].join("\n"),
    },
    {
      title: "Build a highest-denomination-first dispense chain",
      detailMD:
        "Create one **NoteDispenser** per denomination and link 2000 to 500 to 100. This keeps denomination logic local to each handler.",
      code: [
        "NoteDispenser twoThousand = new NoteDispenser(2000, notesOf2000);",
        "NoteDispenser fiveHundred = new NoteDispenser(500, notesOf500);",
        "NoteDispenser oneHundred = new NoteDispenser(100, notesOf100);",
        "twoThousand.setNext(fiveHundred);",
        "fiveHundred.setNext(oneHundred);",
      ].join("\n"),
    },
    {
      title: "Withdraw in a failure-safe order",
      detailMD:
        "Validate amount, verify dispenser capability, debit the bank account, and only then dispense notes. If either validation or debit fails, no cash leaves the ATM.",
    },
    {
      title: "Eject card as a universal reset path",
      detailMD:
        "The default state behavior can clear the current session and return to idle. Active states may override it to print messages, but they preserve the same invariant.",
    },
  ],

  implementation: referenceFiles("design-atm"),
  classExplanations: [
    {
      className: "ATMState",
      detailMD:
        "Interface for state-specific behavior. Its default methods throw for invalid actions, and the default eject path clears the session and returns the ATM to **IdleState**.",
    },
    {
      className: "IdleState",
      detailMD:
        "The only state that accepts a new card. It validates the card object, stores it on **ATM**, transitions to **HasCardState**, and treats eject as a harmless no-op.",
    },
    {
      className: "HasCardState",
      detailMD:
        "Handles PIN entry after card insertion. It asks **BankService** to validate the PIN, loads the account on success, and clears the session back to idle on failure.",
    },
    {
      className: "AuthenticatedState",
      detailMD:
        "Represents a verified user who can choose a transaction or eject the card. It creates **TransactionState** with the selected operation string.",
    },
    {
      className: "TransactionState",
      detailMD:
        "Stores the selected operation in normalized form. It executes withdrawal or deposit only when the operation matches, then returns the ATM to **AuthenticatedState**.",
    },
    {
      className: "ATM",
      detailMD:
        "Context object and public façade. It delegates user actions to the current state, holds the active card/account, and coordinates withdrawal as dispenser check, bank debit, then cash dispense.",
    },
    {
      className: "Card",
      detailMD:
        "Immutable value object with a card number and account id. It is intentionally small because the bank service owns account validation and balance data.",
    },
    {
      className: "Account",
      detailMD:
        "Synchronized account model with id, PIN, and balance. It validates PIN, returns balance, and guards debit against insufficient funds.",
    },
    {
      className: "BankService",
      detailMD:
        "In-memory bank boundary backed by an account map. It registers accounts, resolves accounts by id, validates PIN, and exposes debit, credit, and balance inquiry.",
    },
    {
      className: "DispenseChain",
      detailMD:
        "Interface for denomination handlers. It defines linking, capability check, and dispense operations so the cash path can be extended one handler at a time.",
    },
    {
      className: "NoteDispenser",
      detailMD:
        "Concrete chain link for one denomination. It calculates usable notes, delegates the remaining amount, and decrements its own note count during dispense.",
    },
    {
      className: "CashDispenser",
      detailMD:
        "Cash hardware façade. It builds the 2000 to 500 to 100 chain, rejects non-positive or non-100-multiple amounts, and delegates validation and dispensing to the chain head.",
    },
  ],

  dryRun: {
    inputMD:
      "Account A1 has PIN 1234 and balance 10000. The dispenser has one 2000 note, three 500 notes, and ten 100 notes. Actions: insert card C1, enter PIN, check balance, withdraw 2600, eject card.",
    columns: ["Step", "User action", "State before", "Main collaborator", "State after", "Result"],
    rows: [
      ["1", "insertCard(C1)", "IDLE", "IdleState", "HAS_CARD", "Current card set to C1"],
      ["2", "enterPin(1234)", "HAS_CARD", "BankService.validatePin", "AUTHENTICATED", "Account A1 loaded"],
      ["3", "balance inquiry", "AUTHENTICATED", "BankService.getBalance", "AUTHENTICATED", "Balance shown as 10000"],
      ["4", "selectOperation(WITHDRAW)", "AUTHENTICATED", "AuthenticatedState", "TRANSACTION_WITHDRAW", "Operation stored"],
      ["5", "withdraw(2600)", "TRANSACTION_WITHDRAW", "CashDispenser and BankService", "AUTHENTICATED", "Debit 2600, dispense 1x2000 plus 1x500 plus 1x100"],
      ["6", "ejectCard()", "AUTHENTICATED", "AuthenticatedState", "IDLE", "Session cleared"],
    ],
    narrativeMD:
      "Step 5 demonstrates the critical ordering: cash capability is checked first, the account is debited second, and the chain releases notes third. The user stays authenticated after a completed transaction and may choose another operation or eject.",
  },

  complexity: [
    {
      operation: "insert card / eject card",
      time: "O(1)",
      space: "O(1)",
      note: "Only state and session references are updated.",
    },
    {
      operation: "PIN authentication",
      time: "O(1) average",
      space: "O(1)",
      note: "Hash map lookup by account id plus a synchronized PIN comparison in the reference model.",
    },
    {
      operation: "balance inquiry",
      time: "O(1) average",
      space: "O(1)",
      note: "BankService resolves the account and reads the synchronized balance.",
    },
    {
      operation: "withdraw",
      time: "O(D)",
      space: "O(1)",
      note: "D is the number of denomination handlers. The reference chain has D = 3.",
    },
    {
      operation: "deposit",
      time: "O(1) average",
      space: "O(1)",
      note: "A bank lookup followed by a synchronized credit.",
    },
  ],
  complexityNotesMD:
    "The ATM state machine is constant sized. Withdrawal is linear in denomination count, which is effectively constant for normal ATM cassettes. If denominations become dynamic or non-canonical, consider a planner that finds an optimal note combination before mutating inventory.",

  extensibility: [
    {
      label: "New denominations",
      detailMD:
        "Add another **NoteDispenser** link and place it in the chain order. No ATM state or bank code changes.",
    },
    {
      label: "New transaction type",
      detailMD:
        "Add an operation branch in **TransactionState** or introduce transaction command objects if the list grows beyond a few operations.",
    },
    {
      label: "Multiple accounts per card",
      detailMD:
        "Let **Card** carry account choices and add an account-selection state after authentication before transaction selection.",
    },
    {
      label: "External bank integration",
      detailMD:
        "Replace the in-memory **BankService** map with a gateway or repository while keeping the ATM state model unchanged.",
    },
    {
      label: "Receipts and audit",
      detailMD:
        "Emit a transaction record after each debit, credit, balance inquiry, and eject event without changing the state transition contracts.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Switch-based ATM controller",
      detailMD:
        "Keep an enum for the current state and use conditionals inside every ATM method to decide what is allowed.",
      tradeoffsMD:
        "Simpler for a tiny demo, but each new state or action edits the central class and makes invalid transitions easy to miss.",
    },
    {
      name: "Command objects for transactions",
      detailMD:
        "Represent withdrawal, deposit, balance inquiry, and transfer as command classes selected after authentication.",
      tradeoffsMD:
        "Cleaner when transaction types grow, but extra abstraction can feel heavy for the beginner version with only a few operations.",
    },
    {
      name: "Hard Singleton cash dispenser",
      detailMD:
        "Expose **CashDispenser.getInstance** and let every ATM call the global instance directly.",
      tradeoffsMD:
        "Protects one hardware inventory, but hurts tests and multi-terminal simulations. Dependency injection of one shared instance is usually the better Singleton variant.",
    },
    {
      name: "Optimal note planner",
      detailMD:
        "Instead of greedy highest-first dispensing, compute a note combination that satisfies the amount while preserving scarce denominations.",
      tradeoffsMD:
        "Useful for unusual denominations or cash optimization, but overkill for standard ATM notes and makes the design less interview-friendly.",
    },
  ],
  commonMistakes: [
    "Putting every action check inside **ATM** instead of letting the current state own valid and invalid behavior.",
    "Debiting the account before checking whether the cash dispenser can serve the requested amount.",
    "Dispensing cash before confirming the bank debit succeeded.",
    "Forgetting to clear current card and account on eject or failed authentication.",
    "Letting every denomination know about all other denominations instead of using a linked chain.",
    "Treating the cash dispenser as many independent objects, which creates conflicting note counts for one physical cassette.",
    "Making balance inquiry mutate session or account state even though it is read-only.",
    "Storing raw PINs in a production design rather than using hashing, encryption, retry limits, and audit controls.",
  ],

  followUps: [
    {
      question: "How would you add balance inquiry as a first-class ATM action?",
      answerMD:
        "Add **balanceInquiry** to **ATMState** with a default rejection, implement it in **AuthenticatedState** or **TransactionState**, and delegate to **BankService.getBalance** for the active account.",
    },
    {
      question: "What if the dispenser check passes but bank debit fails?",
      answerMD:
        "No cash should be dispensed. The reference order already checks cash first, then calls bank debit, then dispenses only after debit returns successfully.",
    },
    {
      question: "What if the dispenser jams after the account was debited?",
      answerMD:
        "Production needs hardware acknowledgements, reversal or adjustment transactions, and reconciliation logs. The interview model can mention this as a reliability extension.",
    },
    {
      question: "How would you enforce one cash dispenser instance per terminal?",
      answerMD:
        "Use a terminal-scoped singleton provider or dependency injection container that returns the same **CashDispenser** for a given ATM id, and keep its methods synchronized.",
    },
    {
      question: "How do you support multiple accounts on one card?",
      answerMD:
        "After PIN validation, introduce an account-selection state, store the chosen account on **ATM**, and keep transaction logic unchanged.",
    },
    {
      question: "Why is State better than an enum and switch here?",
      answerMD:
        "Each state owns its legal actions and transitions. Adding a state becomes adding a class, not editing every public ATM method.",
    },
  ],

  productionConsiderations: [
    {
      label: "PIN and card security",
      detailMD:
        "Never store raw PINs. Use secure PIN verification, attempt limits, card blocking rules, encrypted transport, and careful logging that excludes secrets.",
    },
    {
      label: "Transaction atomicity",
      detailMD:
        "Coordinate bank debit, cash dispense acknowledgement, and reversal paths so outages or hardware faults do not leave customers charged incorrectly.",
    },
    {
      label: "Cash reconciliation",
      detailMD:
        "Track cassette inventory, physical refill events, rejected notes, and daily balancing against the bank ledger.",
    },
    {
      label: "Remote bank failures",
      detailMD:
        "Timeouts, retries, offline mode, and idempotency keys are required when the ATM calls a remote banking network.",
    },
    {
      label: "Observability and audit",
      detailMD:
        "Emit metrics and audit events for authentication failures, declined withdrawals, dispenser errors, balance inquiries, and cash-low thresholds.",
    },
  ],

  interviewNotes: [
    "Can the candidate explain the lifecycle as states instead of booleans such as cardPresent and authenticated?",
    "Do they keep account operations behind **BankService** and avoid direct balance mutation from UI code?",
    "Do they protect the withdrawal ordering so users are not debited without cash?",
    "Do they model cash dispensing with a clean denomination chain rather than hard-coded nested conditionals?",
    "Do they recognize **CashDispenser** as one shared hardware resource and discuss Singleton without sacrificing testability?",
    "Can they state how balance inquiry fits without mutating the session?",
  ],

  quiz: [
    {
      question: "Which component should reject a withdrawal before a valid PIN is entered?",
      options: [
        "The current ATMState implementation",
        "The Card constructor",
        "The NoteDispenser chain",
        "The receipt printer",
      ],
      answerIndex: 0,
      explanationMD:
        "State-specific rejection is the point of the State pattern. Before authentication, the active state does not allow withdrawal.",
    },
    {
      question: "Why should the ATM call canDispense before debiting the account?",
      options: [
        "To avoid debiting a customer when the ATM cannot provide the requested cash",
        "To make the PIN check faster",
        "To skip account balance validation",
        "To reduce the number of state classes",
      ],
      answerIndex: 0,
      explanationMD:
        "Cash capability is a prerequisite for a successful withdrawal. If the cassette cannot serve the amount, the bank balance should remain unchanged.",
    },
    {
      question: "What does a NoteDispenser do in the chain?",
      options: [
        "It validates the customer PIN",
        "It handles one denomination and delegates the remaining amount",
        "It chooses which account the card should use",
        "It stores the current ATM state",
      ],
      answerIndex: 1,
      explanationMD:
        "Each handler owns one denomination, consumes as many notes as possible, and passes the remainder to the next denomination.",
    },
    {
      question: "What is the best interpretation of Singleton for CashDispenser in this design?",
      options: [
        "Every method must be static",
        "There should be exactly one cash inventory object per physical terminal",
        "All ATMs in the world share one object",
        "The dispenser replaces the bank service",
      ],
      answerIndex: 1,
      explanationMD:
        "Singleton here means one software façade for one physical cassette inventory. Injecting that one instance is more testable than hard global access.",
    },
    {
      question: "Which operation should be read-only after authentication?",
      options: [
        "Withdrawal",
        "Deposit",
        "Balance inquiry",
        "Cash cassette refill",
      ],
      answerIndex: 2,
      explanationMD:
        "Balance inquiry reads the account balance through the bank service and should not change account or session state.",
    },
    {
      question: "Why does TransactionState return to AuthenticatedState after a withdrawal or deposit?",
      options: [
        "So the same user can choose another transaction or eject the card",
        "So the PIN is forgotten immediately",
        "So the dispenser can rebuild its chain",
        "So the account balance is reset",
      ],
      answerIndex: 0,
      explanationMD:
        "After a completed transaction the session is still authenticated, so the user can select another operation or end the session.",
    },
  ],

  practiceVariants: [
    {
      title: "Make balance inquiry a full state action",
      detailMD:
        "Add a balance inquiry method to the state interface, implement it for authenticated users, and return a display-friendly result without changing balance.",
      difficulty: "Beginner",
    },
    {
      title: "Add daily withdrawal limits",
      detailMD:
        "Track per-account or per-card withdrawal totals and reject requests beyond the configured limit before debiting.",
      difficulty: "Intermediate",
    },
    {
      title: "Support multiple accounts per card",
      detailMD:
        "After PIN validation, add an account-selection phase and let withdrawal, deposit, and balance inquiry operate on the selected account.",
      difficulty: "Intermediate",
    },
    {
      title: "Handle dispenser failure and reversal",
      detailMD:
        "Model hardware acknowledgement and add a reversal path when debit succeeds but cash dispense fails.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the conceptual ATM lifecycle?",
      back: "Idle to CardInserted, then Authenticated, then SelectingTransaction or Dispensing, then back to Authenticated or Idle.",
    },
    {
      front: "Which reference class represents CardInserted?",
      back: "HasCardState. It owns PIN entry and moves to AuthenticatedState on success.",
    },
    {
      front: "Which pattern models the session lifecycle?",
      back: "State. ATM delegates each action to the active ATMState implementation.",
    },
    {
      front: "Which pattern models note dispensing?",
      back: "Chain of Responsibility. Each NoteDispenser handles one denomination and delegates the remainder.",
    },
    {
      front: "Why treat CashDispenser as a Singleton resource?",
      back: "One physical ATM has one cash inventory, so software should not create multiple independent note-count owners for the same cassette.",
    },
    {
      front: "What is the safe withdrawal order?",
      back: "Validate amount, check dispenser capability, debit bank account, then dispense cash.",
    },
    {
      front: "Where is PIN validation performed?",
      back: "BankService validates the card and PIN by delegating to the matching Account.",
    },
    {
      front: "Where does balance inquiry belong?",
      back: "Behind BankService.getBalance for the authenticated account, with no session or balance mutation.",
    },
  ],

  cheatSheetMD: [
    "**Core model:** ATM is the context. ATMState is the lifecycle interface. IdleState, HasCardState, AuthenticatedState, and TransactionState own allowed actions.",
    "",
    "**Lifecycle:** Idle accepts a card. HasCard validates PIN. Authenticated selects a transaction or ejects. TransactionState executes withdrawal or deposit and returns to Authenticated.",
    "",
    "**Bank boundary:** BankService owns account lookup, PIN validation, debit, credit, and balance inquiry. Account owns synchronized balance mutation.",
    "",
    "**Cash path:** CashDispenser owns a highest-first chain: 2000 to 500 to 100. NoteDispenser handles one denomination and delegates the remainder.",
    "",
    "**Patterns:** State for session flow, Chain of Responsibility for denominations, Singleton-style single CashDispenser resource per terminal.",
    "",
    "**Withdrawal invariant:** check dispenser capability before debit; dispense only after debit succeeds; clear session on eject or failed authentication.",
    "",
    "**Complexity:** state transitions O(1), balance inquiry O(1) average, withdrawal O(D) for D denomination handlers.",
  ].join("\n"),

  references: [
    {
      title: "Head First Design Patterns — State and Chain of Responsibility",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Effective Java — Singleton and dependency injection guidance",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — State Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/state",
    },
    {
      title: "Refactoring Guru — Chain of Responsibility Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/chain-of-responsibility",
    },
    {
      title: "OWASP Authentication Cheat Sheet",
      kind: "Docs",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html",
    },
  ],

  relatedProblems: [
    { slug: "vending-machine", note: "Another beginner State pattern problem with user actions constrained by lifecycle." },
    { slug: "banking-system", note: "Expands the account, ledger, and transaction consistency side of the ATM boundary." },
    { slug: "parking-lot", note: "A comparable hardware-adjacent design with a central context, resources, and safe state updates." },
  ],
};