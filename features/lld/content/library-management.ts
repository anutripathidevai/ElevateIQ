import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const libraryManagement: LLDProblemContent = {
  slug: "library-management",

  statementMD: [
    "Design the object model for a **Library Management System** used by a public or university library.",
    "The system must catalog books, track physical book copies, register members, let members search the catalog, borrow and return copies, calculate fines for overdue returns, and maintain reservation queues when popular titles are unavailable.",
    "",
    "The interview focus is the **domain model** and the seams around policy: searching, lending rules, fines, reservations, and notifications. A clean answer separates the bibliographic record from each physical copy, keeps loan state consistent, and avoids turning the service layer into a pile of conditional logic.",
  ].join("\n"),

  businessContextMD: [
    "Library Management is a beginner-friendly but realistic LLD problem because it mixes CRUD-like catalog data with state transitions that must be correct: a copy cannot be loaned twice, a member cannot exceed the loan limit, and a returned copy may need to satisfy the oldest reservation before becoming generally available.",
    "",
    "Interviewers use this problem to evaluate whether you can model **Book** versus **BookCopy**, use Repository-like collections for lookup, apply Strategy to catalog search, and apply Observer to reservation notifications without over-engineering the solution.",
  ].join("\n"),

  functionalRequirements: [
    "Store bibliographic books with ISBN, title, authors, and subject.",
    "Track physical book copies by barcode and status: available, loaned, reserved, or lost.",
    "Register members and enforce a maximum number of open loans per member.",
    "Search the catalog by title, author, or subject.",
    "Borrow an available copy of a requested ISBN and create a loan with a due date.",
    "Return a borrowed copy, close the loan, and calculate an overdue fine.",
    "Allow members to reserve a book when copies are unavailable or currently loaned.",
    "Notify the next reserved member when a returned copy is held for them.",
  ],

  nonFunctionalRequirements: [
    {
      label: "State correctness",
      detailMD:
        "A copy must never be both available and loaned. All transitions go through **BookCopy** methods that validate the current status.",
    },
    {
      label: "Extensibility",
      detailMD:
        "New search modes, fine policies, and notification channels should be additive. The lending workflow should not need a rewrite for each new rule.",
    },
    {
      label: "Interactive latency",
      detailMD:
        "Catalog search and borrow should be fast enough for a librarian desk workflow. The reference solution uses in-memory scans; production would add indexes.",
    },
    {
      label: "Fair reservations",
      detailMD:
        "Reservations for the same ISBN are served FIFO so the earliest waiting member gets the next returned copy.",
    },
    {
      label: "Thread safety at hot spots",
      detailMD:
        "Copy status and member open-loan counts are synchronized so two desks cannot lend the same copy or exceed a member limit.",
    },
  ],

  requirementClarification: [
    {
      question: "Is **Book** the same as a physical copy?",
      answerMD:
        "No. **Book** is the bibliographic record identified by ISBN. **BookCopy** is a physical item with a barcode and status. Multiple copies can point to the same book.",
    },
    {
      question: "How long is a loan?",
      answerMD:
        "Assume a fixed 14-day loan period in the base design. A production design can extract this into a policy object.",
    },
    {
      question: "Can members reserve a specific barcode?",
      answerMD:
        "For the base design, reservations are at the ISBN level, not at the barcode level. The next returned copy of that ISBN can satisfy the oldest reservation.",
    },
    {
      question: "Do fines block future borrowing?",
      answerMD:
        "The reference solution calculates and returns the fine amount on return. Blocking behavior is a policy extension that can consult a member account balance.",
    },
    {
      question: "Do we need staff roles, payments, or a REST API?",
      answerMD:
        "No for the core LLD. Model the domain and service behavior first; staff auth, payment collection, and HTTP controllers are adapters around this model.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Book {",
    "        -String isbn",
    "        -String title",
    "        -List~String~ authors",
    "        -String subject",
    "        +getIsbn() String",
    "    }",
    "    class BookCopy {",
    "        -String barcode",
    "        -Book book",
    "        -CopyStatus status",
    "        +markLoaned() void",
    "        +markReserved() void",
    "        +markAvailable() void",
    "        +markLost() void",
    "    }",
    "    class CopyStatus {",
    "        <<enumeration>>",
    "        AVAILABLE",
    "        LOANED",
    "        RESERVED",
    "        LOST",
    "    }",
    "    class Member {",
    "        -String id",
    "        -String name",
    "        -int maxOpenLoans",
    "        -Set~Loan~ openLoans",
    "        +canBorrowMore() boolean",
    "        +addLoan(Loan) void",
    "        +closeLoan(Loan) void",
    "    }",
    "    class Catalog {",
    "        -List~Book~ books",
    "        -List~BookCopy~ copies",
    "        +addBook(Book) void",
    "        +addCopy(BookCopy) void",
    "        +search(SearchCriteria) List~Book~",
    "        +findAvailableCopy(String) Optional~BookCopy~",
    "    }",
    "    class SearchCriteria {",
    "        <<interface>>",
    "        +matches(Book) boolean",
    "    }",
    "    class TitleCriteria",
    "    class AuthorCriteria",
    "    class SubjectCriteria",
    "    class Loan {",
    "        -BookCopy copy",
    "        -Member member",
    "        -LocalDate issueDate",
    "        -LocalDate dueDate",
    "        -LocalDate returnedDate",
    "        +isOpen() boolean",
    "        +close(LocalDate) void",
    "    }",
    "    class Reservation {",
    "        -Book book",
    "        -Member member",
    "        -Instant createdAt",
    "        -boolean active",
    "        +fulfill() void",
    "    }",
    "    class ReservationNotifier {",
    "        <<interface>>",
    "        +notifyReady(Member, BookCopy) void",
    "    }",
    "    class FineService {",
    "        -BigDecimal dailyFine",
    "        +calculateFine(Loan, LocalDate) BigDecimal",
    "    }",
    "    class LibraryService {",
    "        -Catalog catalog",
    "        -FineService fineService",
    "        -ReservationNotifier notifier",
    "        -Map~String,Loan~ openLoansByBarcode",
    "        -Map~String,Queue~ reservationsByIsbn",
    "        +borrow(String, Member, LocalDate) Loan",
    "        +returnCopy(String, LocalDate) BigDecimal",
    "        +reserve(Book, Member) Reservation",
    "    }",
    "    BookCopy --> Book",
    "    BookCopy --> CopyStatus",
    "    Catalog o-- Book",
    "    Catalog o-- BookCopy",
    "    Catalog ..> SearchCriteria",
    "    SearchCriteria <|.. TitleCriteria",
    "    SearchCriteria <|.. AuthorCriteria",
    "    SearchCriteria <|.. SubjectCriteria",
    "    Loan --> BookCopy",
    "    Loan --> Member",
    "    Member o-- Loan",
    "    Reservation --> Book",
    "    Reservation --> Member",
    "    LibraryService --> Catalog",
    "    LibraryService --> FineService",
    "    LibraryService --> ReservationNotifier",
    "    LibraryService o-- Loan",
    "    LibraryService o-- Reservation",
  ].join("\n"),
  classDiagramCaptionMD:
    "The design separates catalog data, physical copy state, member loan limits, and service orchestration. **Catalog** behaves like an in-memory repository, **SearchCriteria** is the search strategy seam, and **ReservationNotifier** is the observer boundary.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Patron",
    "    participant Svc as LibraryService",
    "    participant Cat as Catalog",
    "    participant Copy as BookCopy",
    "    participant Mem as Member",
    "    participant Fine as FineService",
    "    participant Obs as ReservationNotifier",
    "    Patron->>Svc: borrow(isbn, member, today)",
    "    Svc->>Cat: findAvailableCopy(isbn)",
    "    Cat-->>Svc: Optional copy",
    "    Svc->>Copy: getStatus()",
    "    Svc->>Mem: canBorrowMore()",
    "    Svc->>Copy: markLoaned()",
    "    Svc->>Svc: create Loan and index by barcode",
    "    Svc->>Mem: addLoan(loan)",
    "    Svc-->>Patron: Loan",
    "    Note over Patron,Svc: later, another patron reserves while copy is loaned",
    "    Patron->>Svc: returnCopy(barcode, returnedOn)",
    "    Svc->>Svc: remove open loan",
    "    Svc->>Fine: calculateFine(loan, returnedOn)",
    "    Svc->>Svc: poll reservation queue for ISBN",
    "    alt reservation waiting",
    "        Svc->>Copy: markReserved()",
    "        Svc->>Obs: notifyReady(member, copy)",
    "    else no reservation",
    "        Svc->>Copy: markAvailable()",
    "    end",
    "    Svc-->>Patron: fine amount",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Borrow is a copy-level check-then-mark transition. Return closes the loan, computes the fine, then either releases the copy or reserves it for the next waiting member and notifies through the observer.",

  entities: [
    {
      name: "Book",
      responsibilityMD:
        "Bibliographic record for a title. It carries ISBN, title, authors, and subject, but has no availability state.",
      attributes: ["isbn", "title", "authors", "subject"],
    },
    {
      name: "BookCopy",
      responsibilityMD:
        "Physical copy identified by barcode. Owns the status transition methods so callers cannot casually flip between available, loaned, reserved, and lost.",
      attributes: ["barcode", "book", "status"],
    },
    {
      name: "CopyStatus",
      responsibilityMD:
        "Enum describing a copy lifecycle: **AVAILABLE**, **LOANED**, **RESERVED**, and **LOST**.",
      attributes: ["AVAILABLE", "LOANED", "RESERVED", "LOST"],
    },
    {
      name: "Member",
      responsibilityMD:
        "Registered library user. Tracks open loans and enforces the per-member loan limit through **canBorrowMore** and **addLoan**.",
      attributes: ["id", "name", "maxOpenLoans", "openLoans"],
    },
    {
      name: "Catalog",
      responsibilityMD:
        "In-memory repository for books and copies. It answers catalog search queries and finds an available copy for an ISBN.",
      attributes: ["books", "copies"],
    },
    {
      name: "SearchCriteria",
      responsibilityMD:
        "Strategy interface for matching a book during catalog search. Concrete criteria handle title, author, and subject queries.",
      attributes: ["matches(book)"],
    },
    {
      name: "Loan",
      responsibilityMD:
        "Record of one borrowing session: copy, member, issue date, due date, and optional return date.",
      attributes: ["copy", "member", "issueDate", "dueDate", "returnedDate"],
    },
    {
      name: "Reservation",
      responsibilityMD:
        "A waiting member's hold on a book. It records the book, member, creation time, and active flag, then becomes fulfilled when a copy is held.",
      attributes: ["book", "member", "createdAt", "active"],
    },
    {
      name: "FineService",
      responsibilityMD:
        "Fine calculation policy. It multiplies overdue days by a configured daily fine and returns zero for on-time returns.",
      attributes: ["dailyFine"],
    },
    {
      name: "ReservationNotifier",
      responsibilityMD:
        "Observer boundary for notifying a member that a reserved copy is ready. Email, SMS, app push, or test spies can implement it.",
      attributes: ["notifyReady(member, copy)"],
    },
    {
      name: "LibraryService",
      responsibilityMD:
        "Application service and aggregate coordinator. It borrows, returns, reserves, tracks open loans by barcode, and owns reservation queues by ISBN.",
      attributes: ["catalog", "fineService", "notifier", "openLoansByBarcode", "reservationsByIsbn"],
    },
  ],

  patternsUsed: [
    {
      name: "Repository",
      whyMD:
        "**Catalog** centralizes book and copy storage behind add, search, and availability lookup methods. The service asks the repository-like object for data instead of walking raw collections everywhere.",
    },
    {
      name: "Strategy",
      whyMD:
        "**SearchCriteria** lets title, author, and subject searches vary independently of **Catalog.search**. Adding ISBN or keyword search is a new criteria class, not an edit to the catalog loop.",
    },
    {
      name: "Observer",
      whyMD:
        "**ReservationNotifier** decouples the reservation workflow from the notification channel. Returning a copy triggers **notifyReady**, while email, SMS, or app push remain outside the domain.",
    },
  ],

  designSteps: [
    {
      title: "Separate the title record from the copy state",
      detailMD:
        "Model **Book** as immutable catalog metadata and **BookCopy** as the mutable physical item. The barcode belongs to the copy; ISBN belongs to the book.",
      code: [
        "public final class BookCopy {",
        "    private final String barcode;",
        "    private final Book book;",
        "    private CopyStatus status = CopyStatus.AVAILABLE;",
        "",
        "    public synchronized void markLoaned() {",
        "        requireStatus(CopyStatus.AVAILABLE);",
        "        status = CopyStatus.LOANED;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Make catalog lookup repository-like",
      detailMD:
        "**Catalog** owns the collections and exposes meaningful operations: **search** and **findAvailableCopy**. This keeps data access out of **LibraryService** and makes a database-backed repository a clean future replacement.",
    },
    {
      title: "Use strategies for search criteria",
      detailMD:
        "The catalog does not switch on query type. It accepts a **SearchCriteria** and asks whether each book matches. Title, author, and subject searches are independent strategies.",
      code: [
        "interface SearchCriteria {",
        "    boolean matches(Book book);",
        "}",
        "",
        "final class TitleCriteria implements SearchCriteria {",
        "    public boolean matches(Book book) {",
        "        return book.getTitle().toLowerCase(Locale.ROOT).contains(token);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Borrow by locking the copy and validating the member limit",
      detailMD:
        "**LibraryService.borrow** asks the catalog for an available copy, synchronizes on that copy, validates the status and member limit, marks the copy loaned, creates a **Loan**, indexes it by barcode, and adds it to the member.",
      code: [
        "synchronized (copy) {",
        "    if (copy.getStatus() != CopyStatus.AVAILABLE) {",
        "        throw new IllegalStateException(\"Copy was borrowed by another request\");",
        "    }",
        "    if (!member.canBorrowMore()) {",
        "        throw new IllegalStateException(\"Member cannot borrow more books\");",
        "    }",
        "    copy.markLoaned();",
        "}",
      ].join("\n"),
    },
    {
      title: "Return closes the loan before changing copy availability",
      detailMD:
        "**returnCopy** removes the open loan, closes it with the return date, updates the member's open-loan set, calculates the fine, then decides what happens to the copy.",
    },
    {
      title: "Serve reservations through a FIFO queue and an observer",
      detailMD:
        "Reservations are grouped by ISBN. On return, the service polls the queue; if a reservation exists, the copy becomes **RESERVED**, the reservation is fulfilled, and **ReservationNotifier** is called.",
      code: [
        "if (next == null) {",
        "    copy.markAvailable();",
        "} else {",
        "    next.fulfill();",
        "    copy.markReserved();",
        "    notifier.notifyReady(next.getMember(), copy);",
        "}",
      ].join("\n"),
    },
  ],

  implementation: referenceFiles("design-library-management"),

  classExplanations: [
    {
      className: "Book",
      detailMD:
        "Immutable bibliographic metadata. It validates ISBN, defensively copies the authors list, and exposes read-only getters so catalog records are not mutated accidentally.",
    },
    {
      className: "BookCopy",
      detailMD:
        "Represents one physical item with a barcode and status. Synchronized transition methods enforce status rules for loaning, reserving, making available, and marking lost.",
    },
    {
      className: "CopyStatus",
      detailMD:
        "Enum for the copy lifecycle: **AVAILABLE**, **LOANED**, **RESERVED**, and **LOST**. It keeps state values explicit and avoids magic strings.",
    },
    {
      className: "Member",
      detailMD:
        "Stores member identity, maximum loan count, and an internal set of open loans. Synchronized methods protect the loan-limit invariant.",
    },
    {
      className: "Catalog",
      detailMD:
        "In-memory repository for **Book** and **BookCopy** objects. It adds records, searches books with a supplied strategy, and finds the first available copy for an ISBN.",
    },
    {
      className: "SearchCriteria",
      detailMD:
        "Strategy interface used by **Catalog.search**. Each implementation decides whether a book matches a particular query style.",
    },
    {
      className: "TitleCriteria",
      detailMD:
        "Case-insensitive title search strategy. It lowercases the search token and checks whether the book title contains it.",
    },
    {
      className: "AuthorCriteria",
      detailMD:
        "Case-insensitive author search strategy. It scans all authors of a book and succeeds when any author contains the token.",
    },
    {
      className: "SubjectCriteria",
      detailMD:
        "Case-insensitive subject search strategy. It keeps subject filtering separate from title and author matching.",
    },
    {
      className: "Loan",
      detailMD:
        "Borrowing session record. It knows the copy, member, issue date, due date, and return state; **close** prevents double returns.",
    },
    {
      className: "Reservation",
      detailMD:
        "A member's waitlist entry for a book. It captures creation time for ordering and transitions from active to fulfilled exactly once.",
    },
    {
      className: "ReservationNotifier",
      detailMD:
        "Observer interface called when a returned copy is reserved for the next waiting member. Implementations can send email, SMS, app push, or test notifications.",
    },
    {
      className: "FineService",
      detailMD:
        "Overdue fine calculator. It validates the configured daily fine and charges only for days after the loan due date.",
    },
    {
      className: "LibraryService",
      detailMD:
        "Coordinates the application flow. It borrows copies, returns copies, creates reservations, indexes open loans by barcode, and moves returned copies to either available or reserved.",
    },
  ],

  dryRun: {
    inputMD:
      "Catalog has **Clean Code** with ISBN ISBN-1 and one copy C1. Daily fine is 5. Member M1 can borrow 2 books. Member M2 reserves the title while C1 is loaned.",
    columns: ["Step", "Action", "Catalog and copy state", "Loan state", "Reservation state", "Result"],
    rows: [
      ["1", "addBook and addCopy(C1)", "Book indexed; C1 AVAILABLE", "No open loans", "No reservations", "Catalog ready"],
      ["2", "search TitleCriteria clean", "Book matches title search", "No open loans", "No reservations", "Search returns Clean Code"],
      ["3", "borrow ISBN-1 by M1 on Jul 1", "C1 moves to LOANED", "Loan L1 due Jul 15", "No reservations", "Borrow succeeds"],
      ["4", "reserve book by M2", "C1 remains LOANED", "L1 still open", "Queue ISBN-1 contains R1", "Reservation recorded"],
      ["5", "return C1 on Jul 18", "C1 moves to RESERVED", "L1 closes; fine is 15", "R1 fulfilled", "M2 notified that C1 is ready"],
    ],
    narrativeMD:
      "The run shows the core invariants: search is read-only, borrow changes the copy to **LOANED**, a reservation waits by ISBN, and return computes three overdue days of fine before reserving the copy for the next member.",
  },

  complexity: [
    {
      operation: "Catalog.search",
      time: "O(B × A)",
      space: "O(R)",
      note: "B books, A authors per book for author search, R matching results.",
    },
    {
      operation: "findAvailableCopy",
      time: "O(C)",
      space: "O(1)",
      note: "Linear scan over copies in the in-memory reference catalog.",
    },
    {
      operation: "borrow",
      time: "O(C)",
      space: "O(1)",
      note: "Dominated by finding an available copy; loan insertion and member update are constant time.",
    },
    {
      operation: "returnCopy",
      time: "O(1)",
      space: "O(1)",
      note: "Open-loan lookup, fine calculation, and reservation queue poll are constant time.",
    },
    {
      operation: "reserve",
      time: "O(1)",
      space: "O(1)",
      note: "Append to the per-ISBN queue.",
    },
  ],
  complexityNotesMD:
    "The reference solution favors clarity over indexing. A production repository would maintain maps by ISBN, title tokens, author tokens, and barcode so search and availability avoid full scans.",

  extensibility: [
    {
      label: "Database-backed repositories",
      detailMD:
        "Replace **Catalog** with **BookRepository** and **CopyRepository** implementations without changing the lending flow. Keep the service dependent on repository operations, not storage details.",
    },
    {
      label: "More search strategies",
      detailMD:
        "Add **IsbnCriteria**, **KeywordCriteria**, or composed criteria. **Catalog.search** still receives a **SearchCriteria** and does not branch by type.",
    },
    {
      label: "Flexible lending policy",
      detailMD:
        "Extract loan duration, renewal limits, and fine rules into policy objects when requirements differ for students, faculty, or premium members.",
    },
    {
      label: "Notification channels",
      detailMD:
        "Implement **ReservationNotifier** with email, SMS, push notifications, or a fan-out composite. The return flow remains unchanged.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Full repository layer per aggregate",
      detailMD:
        "Create **BookRepository**, **CopyRepository**, **LoanRepository**, and **ReservationRepository** interfaces, then inject concrete in-memory or SQL implementations.",
      tradeoffsMD:
        "Closer to production and easier to persist, but more boilerplate for a beginner interview. Start with **Catalog** unless the interviewer asks about storage.",
    },
    {
      name: "Policy objects for all rules",
      detailMD:
        "Extract **LoanPolicy** and **FinePolicy** so duration, borrowing eligibility, renewals, and fines vary by member type.",
      tradeoffsMD:
        "Very extensible, but can distract from the core model if introduced before the requirements demand it.",
    },
    {
      name: "Event-driven reservation fulfillment",
      detailMD:
        "Publish a **CopyReturned** event and let a reservation handler reserve the copy and notify the member asynchronously.",
      tradeoffsMD:
        "Improves decoupling and reliability at scale, but introduces eventual consistency and more infrastructure than needed in the base design.",
    },
  ],

  commonMistakes: [
    "Treating **Book** and **BookCopy** as the same object, which makes multiple physical copies impossible to model cleanly.",
    "Representing copy status as strings and updating it directly from the service instead of using transition methods.",
    "Hard-coding title, author, and subject branches inside **Catalog.search** instead of using **SearchCriteria** strategies.",
    "Forgetting to close the member's open loan on return, so the member permanently loses borrowing capacity.",
    "Making returned copies immediately available even when there is an existing reservation queue.",
    "Calling notification code directly through an email class instead of depending on **ReservationNotifier**.",
    "Ignoring concurrency around the copy status check and mark operation.",
  ],

  followUps: [
    {
      question: "How would you make catalog search faster?",
      answerMD:
        "Maintain indexes in the repository: ISBN to book, normalized title token to books, author token to books, and ISBN to available-copy queues. The domain model can stay the same.",
    },
    {
      question: "How do you support renewals?",
      answerMD:
        "Add a renewal count and a **LoanPolicy** that checks whether the loan is open, not reserved by another member, and below the renewal limit before extending the due date.",
    },
    {
      question: "What happens if two librarians try to borrow the same copy?",
      answerMD:
        "The service synchronizes on the candidate **BookCopy** and rechecks the status before **markLoaned**. Only one request can complete the transition.",
    },
    {
      question: "How would you collect fines?",
      answerMD:
        "Keep **FineService** responsible for calculation, then add a payment adapter or account ledger outside the core loan-closing flow. Calculation and collection are separate concerns.",
    },
    {
      question: "How would you notify many channels at once?",
      answerMD:
        "Implement **ReservationNotifier** as a composite that invokes email, SMS, and app push observers. The return flow still depends on one interface.",
    },
  ],

  productionConsiderations: [
    {
      label: "Persistence and transactions",
      detailMD:
        "Store books, copies, loans, members, and reservations in a database. Borrow and return should be transactional so copy status, loan rows, and reservation rows stay consistent.",
    },
    {
      label: "Indexes",
      detailMD:
        "Add indexes on ISBN, barcode, normalized title, author, subject, and reservation queue position to avoid scanning as the library grows.",
    },
    {
      label: "Concurrency control",
      detailMD:
        "Use row-level locks or optimistic version columns on **BookCopy** and **Member** to prevent double lending across multiple app instances.",
    },
    {
      label: "Auditability",
      detailMD:
        "Record every loan, return, renewal, fine calculation, and status change with actor and timestamp. Libraries need dispute resolution and compliance history.",
    },
    {
      label: "Operational notifications",
      detailMD:
        "Make notifications retryable and idempotent. A copy should not be released to the general pool just because an email provider is temporarily down.",
    },
  ],

  interviewNotes: [
    "Did you clearly separate **Book** from **BookCopy**?",
    "Are copy status transitions guarded by the domain object rather than scattered assignments?",
    "Is catalog lookup isolated behind repository-style methods?",
    "Can new search criteria and notification channels be added without editing the core flow?",
    "Do returns respect FIFO reservations before marking a copy available?",
    "Did you discuss concurrency for the borrow path?",
  ],

  quiz: [
    {
      question: "Why does the model need both **Book** and **BookCopy**?",
      options: [
        "Because one ISBN can have multiple physical copies with different barcodes and statuses",
        "Because Java requires every domain model to have two classes",
        "Because fines are stored on the book record",
        "Because reservations can only point to barcodes",
      ],
      answerIndex: 0,
      explanationMD:
        "**Book** is catalog metadata; **BookCopy** is the lendable physical item. Mixing them breaks availability tracking.",
    },
    {
      question: "Which part of the reference solution demonstrates Strategy?",
      options: [
        "The **CopyStatus** enum values",
        "**SearchCriteria** with **TitleCriteria**, **AuthorCriteria**, and **SubjectCriteria**",
        "The **openLoansByBarcode** map",
        "The **Book** constructor validation",
      ],
      answerIndex: 1,
      explanationMD:
        "Each search criteria class implements the same interface and can be passed to **Catalog.search** interchangeably.",
    },
    {
      question: "Why is **ReservationNotifier** an interface?",
      options: [
        "To avoid calculating fines",
        "To let the return flow notify observers without knowing the delivery channel",
        "To make catalog search faster",
        "To store reservations in sorted order",
      ],
      answerIndex: 1,
      explanationMD:
        "The Observer boundary keeps domain flow independent from email, SMS, push, or any other notification mechanism.",
    },
    {
      question: "What should happen when a loaned copy is returned and a reservation queue exists?",
      options: [
        "The copy should always become available",
        "The copy should be marked lost",
        "The oldest reservation should be fulfilled and the copy should become reserved",
        "The member's loan limit should be increased",
      ],
      answerIndex: 2,
      explanationMD:
        "The system must preserve fairness. The next waiting member receives the returned copy before the general pool does.",
    },
    {
      question: "What is the main complexity bottleneck in the reference implementation?",
      options: [
        "Returning a copy",
        "Adding a loan to a member",
        "Calculating a fine",
        "Linear scans in catalog search and available-copy lookup",
      ],
      answerIndex: 3,
      explanationMD:
        "The in-memory **Catalog** scans lists. Production repositories should add indexes for title, author, subject, ISBN, and barcode.",
    },
  ],

  practiceVariants: [
    {
      title: "Add renewals",
      detailMD:
        "Allow a member to renew an open loan when no other member has reserved the book. Add renewal limits and update due-date logic cleanly.",
      difficulty: "Beginner",
    },
    {
      title: "Add member tiers",
      detailMD:
        "Students, faculty, and guests have different loan limits, loan durations, and fine caps. Extract the policy without bloating **LibraryService**.",
      difficulty: "Intermediate",
    },
    {
      title: "Add branch libraries",
      detailMD:
        "Support multiple branches, copy transfers, and reservations that can prefer a member's home branch before searching globally.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the difference between **Book** and **BookCopy**?",
      back: "**Book** is ISBN-level metadata; **BookCopy** is a physical item with barcode and status.",
    },
    {
      front: "Which class behaves like the repository in the reference design?",
      back: "**Catalog** stores books and copies and exposes search plus available-copy lookup.",
    },
    {
      front: "Which pattern powers title, author, and subject searches?",
      back: "Strategy — **SearchCriteria** with **TitleCriteria**, **AuthorCriteria**, and **SubjectCriteria**.",
    },
    {
      front: "Where is the Observer seam?",
      back: "**ReservationNotifier**, called when a returned copy is reserved for the next waiting member.",
    },
    {
      front: "What invariant does **Member** enforce?",
      back: "A member cannot exceed **maxOpenLoans** because **canBorrowMore** and **addLoan** guard the open-loan set.",
    },
    {
      front: "What happens on an overdue return?",
      back: "**Loan** closes, **FineService** calculates overdue days times daily fine, and the copy is released or reserved for the next hold.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** Book, BookCopy, CopyStatus, Member, Catalog, SearchCriteria, Loan, Reservation, FineService, ReservationNotifier, LibraryService.",
    "",
    "**Patterns:** Repository through Catalog, Strategy through SearchCriteria implementations, Observer through ReservationNotifier.",
    "",
    "**Borrow flow:** find available copy by ISBN → lock copy → check member limit → mark loaned → create Loan → index by barcode → add to member.",
    "",
    "**Return flow:** remove open loan → close loan → remove from member → calculate fine → poll reservation queue → reserve and notify or mark available.",
    "",
    "**Invariants:** one status per copy; no loan without an available copy; member loan limit enforced; reservations served FIFO.",
    "",
    "**Complexity:** search O(B×A), find available copy O(C), borrow O(C), return O(1), reserve O(1) in the in-memory reference design.",
    "",
    "**Extend:** add repositories for persistence, policies for loan/fine rules, more SearchCriteria classes, and notifier implementations for real channels.",
  ].join("\n"),

  references: [
    {
      title: "Patterns of Enterprise Application Architecture — Repository",
      kind: "Book",
      author: "Martin Fowler",
    },
    {
      title: "Head First Design Patterns — Strategy and Observer",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Refactoring Guru — Observer Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/observer",
    },
  ],

  relatedProblems: [
    { slug: "parking-lot", note: "Similar resource allocation and status transition problem." },
    { slug: "movie-booking", note: "Reservation queues and availability constraints in a different domain." },
    { slug: "hotel-management", note: "Rooms, bookings, guests, and fines map closely to copies, loans, members, and penalties." },
  ],
};
