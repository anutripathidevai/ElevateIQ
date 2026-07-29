import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

/**
 * Exemplar LLD problem — Design a Parking Lot.
 *
 * Reuses the reviewed Java from the practice bank (**design-parking-lot**) as the
 * reference implementation, and layers the full learning walkthrough on top.
 */
export const parkingLot: LLDProblemContent = {
  slug: "parking-lot",

  statementMD: [
    "Design the object model for a **multi-level parking lot** that a facility",
    "operator can run day to day. Vehicles of different sizes enter, are assigned",
    "a suitable free spot, receive a ticket, and pay a fee computed from how long",
    "they stayed when they exit.",
    "",
    "The interview is about the **class model** — responsibilities, relationships,",
    "and the seams that keep the design extensible for new vehicle types, spot",
    "types, and pricing rules — not about a database schema or a REST API.",
  ].join("\n"),

  businessContextMD: [
    "Parking Lot is the canonical warm-up LLD question at Amazon, Google, and",
    "most product companies. It is deceptively rich: it exercises enums, an",
    "inheritance hierarchy, composition (Lot → Level → Spot), the Strategy pattern",
    "for pricing, a Factory for object creation, and a real concurrency concern",
    "(two cars racing for the last spot). Interviewers use it to see whether you",
    "can keep responsibilities in the right place and defend your boundaries.",
  ].join("\n"),

  functionalRequirements: [
    "Support multiple levels, each with a fixed set of spots.",
    "Spots come in sizes (motorcycle, compact, large); a vehicle may occupy any spot that can hold its size.",
    "Park a vehicle: find and reserve a suitable free spot, then issue a ticket.",
    "Unpark a vehicle by ticket: free the spot and compute the fee for the stay.",
    "Report real-time availability of free spots by size, per level.",
    "Reject entry gracefully when the lot is full for the requested vehicle size.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Correctness under concurrency",
      detailMD:
        "Two entry gates must never assign the same spot. Park/unpark on the lot are the critical section.",
    },
    {
      label: "Extensibility",
      detailMD:
        "New vehicle types, spot sizes, and pricing plans should slot in without editing the parking flow.",
    },
    {
      label: "Low latency",
      detailMD:
        "A park request is a small in-memory scan — effectively O(spots on a level) and interactive.",
    },
    {
      label: "Encapsulation",
      detailMD:
        "Fit rules and occupancy state live on the domain objects, not in the controller orchestrating them.",
    },
  ],

  requirementClarification: [
    {
      question: "Can a large vehicle occupy multiple small spots?",
      answerMD:
        "Out of scope for the base design — one vehicle takes exactly one spot that can hold its size. Multi-spot allocation is a documented extension.",
    },
    {
      question: "Is pricing hourly, daily, or tiered?",
      answerMD:
        "Assume a pluggable pricing plan. The base implementation ships an hourly strategy, but the exit path must not hard-code it.",
    },
    {
      question: "Do we need to model payments, gates, or an entry display board?",
      answerMD:
        "Not for the core model. We expose **park**, **unpark**, and **availability**; payment/hardware are adapters layered on top.",
    },
    {
      question: "Are spot assignments persisted across restarts?",
      answerMD:
        "In-memory is fine for the interview. We keep state on the objects and note where a repository would plug in for durability.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class ParkingLot {",
    "        -List~Level~ levels",
    "        -ParkingFeeStrategy feeStrategy",
    "        -Map~String,Ticket~ activeTickets",
    "        +park(Vehicle) Ticket",
    "        +unpark(String) long",
    "        +availability() Map",
    "    }",
    "    class Level {",
    "        -int number",
    "        -List~ParkingSpot~ spots",
    "        +reserveSpotFor(Vehicle) Optional~ParkingSpot~",
    "        +freeSpotsBySize() Map",
    "    }",
    "    class ParkingSpot {",
    "        -String id",
    "        -VehicleSize size",
    "        -Vehicle vehicle",
    "        +canFit(Vehicle) boolean",
    "        +park(Vehicle) void",
    "        +unpark() Vehicle",
    "    }",
    "    class Vehicle {",
    "        <<abstract>>",
    "        -String plate",
    "        -VehicleSize size",
    "        +fitsIn(VehicleSize) boolean",
    "    }",
    "    class Motorcycle",
    "    class Car",
    "    class Bus",
    "    class Ticket {",
    "        -String id",
    "        -Instant entryTime",
    "    }",
    "    class ParkingFeeStrategy {",
    "        <<interface>>",
    "        +calculateFee(Ticket, Instant) long",
    "    }",
    "    class HourlyFeeStrategy",
    "    class VehicleSize {",
    "        <<enumeration>>",
    "        MOTORCYCLE",
    "        COMPACT",
    "        LARGE",
    "    }",
    "    ParkingLot o-- Level",
    "    ParkingLot ..> ParkingFeeStrategy",
    "    Level o-- ParkingSpot",
    "    ParkingSpot --> Vehicle",
    "    Ticket --> ParkingSpot",
    "    Ticket --> Vehicle",
    "    Vehicle <|-- Motorcycle",
    "    Vehicle <|-- Car",
    "    Vehicle <|-- Bus",
    "    ParkingFeeStrategy <|.. HourlyFeeStrategy",
  ].join("\n"),
  classDiagramCaptionMD:
    "Composition runs top-down (Lot owns Levels, Level owns Spots); pricing is an interface the Lot depends on, so a new plan never touches the parking flow.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Driver",
    "    participant Lot as ParkingLot",
    "    participant Lvl as Level",
    "    participant Spot as ParkingSpot",
    "    Driver->>Lot: park(vehicle)",
    "    Lot->>Lvl: reserveSpotFor(vehicle)",
    "    Lvl->>Spot: canFit(vehicle)?",
    "    Spot-->>Lvl: true",
    "    Lvl->>Spot: park(vehicle)",
    "    Lvl-->>Lot: Optional[spot]",
    "    Lot->>Lot: create Ticket, store active",
    "    Lot-->>Driver: Ticket",
    "    Note over Driver,Lot: later, on exit",
    "    Driver->>Lot: unpark(ticketId)",
    "    Lot->>Lot: feeStrategy.calculateFee(ticket, now)",
    "    Lot->>Spot: unpark()",
    "    Lot-->>Driver: fee",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "The Lot orchestrates but delegates the spot decision to the Level and the fee decision to the strategy — it owns coordination, not policy.",

  entities: [
    {
      name: "ParkingLot",
      responsibilityMD:
        "Aggregate root. Owns levels + the fee strategy, keeps the map of active tickets, and is the single synchronized entry point for park/unpark.",
      attributes: ["levels", "feeStrategy", "activeTickets"],
    },
    {
      name: "Level",
      responsibilityMD:
        "Owns the spots on one floor and knows how to find + reserve the first spot that fits a vehicle.",
      attributes: ["number", "spots"],
    },
    {
      name: "ParkingSpot",
      responsibilityMD:
        "Holds occupancy state and the fit rule (**canFit**). Guards its own invariant — you cannot park in an occupied or too-small spot.",
      attributes: ["id", "size", "vehicle"],
    },
    {
      name: "Vehicle",
      responsibilityMD:
        "Abstract base carrying plate + size; **Motorcycle**/**Car**/**Bus** fix the size. Knows whether it fits a given spot size.",
      attributes: ["plate", "size"],
    },
    {
      name: "Ticket",
      responsibilityMD:
        "Immutable record of a parking session: the reserved spot, the vehicle, and the entry timestamp used for billing.",
      attributes: ["id", "spot", "vehicle", "entryTime"],
    },
    {
      name: "ParkingFeeStrategy",
      responsibilityMD:
        "Pricing policy interface. **HourlyFeeStrategy** is the default; new plans (daily, weekend, EV) implement the same method.",
      attributes: ["calculateFee(ticket, exitTime)"],
    },
    {
      name: "VehicleSize",
      responsibilityMD:
        "Ordered enum (MOTORCYCLE < COMPACT < LARGE) whose ordinal encodes the fit rule via **canHold**.",
      attributes: ["MOTORCYCLE", "COMPACT", "LARGE"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "**ParkingFeeStrategy** isolates pricing. The exit path calls **calculateFee** without knowing whether it is hourly, daily, or promotional — a new plan is a new class, not an edit.",
    },
    {
      name: "Factory Method",
      whyMD:
        "**ParkingFactory** centralises vehicle + spot creation so tests, demos, and gates build objects consistently and the concrete **Motorcycle**/**Car**/**Bus** types stay package-private.",
    },
    {
      name: "Template Method",
      whyMD:
        "The abstract **Vehicle** fixes the plate/size skeleton and the **fitsIn** rule; subclasses only supply their size, avoiding duplicated fit logic.",
    },
  ],

  designSteps: [
    {
      title: "Model sizes and put the fit rule in one place",
      detailMD:
        "Use an ordered **VehicleSize** enum and express compatibility as **canHold** on it. Every other class asks the enum instead of re-deriving the rule.",
      code: [
        "public enum VehicleSize {",
        "    MOTORCYCLE, COMPACT, LARGE;",
        "    public boolean canHold(VehicleSize needed) {",
        "        return ordinal() >= needed.ordinal();",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Let the spot guard its own state",
      detailMD:
        "**ParkingSpot.canFit** checks both *free* and *big enough*; **park**/**unpark** throw on invariant violations so no caller can corrupt occupancy.",
      code: [
        "public boolean canFit(Vehicle candidate) {",
        "    return isFree() && candidate.fitsIn(size);",
        "}",
      ].join("\n"),
    },
    {
      title: "Let each level own spot selection",
      detailMD:
        "**Level.reserveSpotFor** scans its spots, reserves the first fit, and returns an **Optional**. The lot never iterates raw spots.",
    },
    {
      title: "Issue tickets at the lot boundary, atomically",
      detailMD:
        "**ParkingLot.park** tries levels in order and only creates a **Ticket** after a spot is reserved. **park**/**unpark** are **synchronized** so the check-then-assign cannot race.",
    },
    {
      title: "Price exits behind a strategy",
      detailMD:
        "**unpark** validates the ticket, removes it, asks the injected **ParkingFeeStrategy** for the fee, then frees the spot. Pricing is swappable at construction time.",
    },
  ],

  implementation: referenceFiles("design-parking-lot"),

  classExplanations: [
    {
      className: "VehicleSize",
      detailMD:
        "An ordered enum. Because **LARGE > COMPACT > MOTORCYCLE** by ordinal, **canHold** is a one-liner and the fit rule lives in exactly one place.",
    },
    {
      className: "Vehicle / Motorcycle / Car / Bus",
      detailMD:
        "**Vehicle** validates the plate and stores the size; **fitsIn** delegates to **VehicleSize.canHold**. The three subclasses only pin their size, so there is no duplicated logic.",
    },
    {
      className: "ParkingSpot",
      detailMD:
        "Holds **id**, **size**, and the current **vehicle**. **canFit** combines free + size checks; **park**/**unpark** enforce the invariant and throw rather than silently misbehave.",
    },
    {
      className: "Level",
      detailMD:
        "Owns a floor's spots. **reserveSpotFor** does the linear scan-and-reserve; **freeSpotsBySize** powers the availability board using an **EnumMap**.",
    },
    {
      className: "Ticket",
      detailMD:
        "Immutable session record created with a random id and the entry **Instant**. It ties a vehicle to its reserved spot for billing on exit.",
    },
    {
      className: "ParkingFeeStrategy / HourlyFeeStrategy",
      detailMD:
        "The interface is the pricing seam. **HourlyFeeStrategy** rounds partial hours up and multiplies by a cents-per-hour rate; other plans implement the same method.",
    },
    {
      className: "ParkingFactory",
      detailMD:
        "Static factory that maps a type string to the right **Vehicle** subclass and builds spot ids consistently. Keeps the concrete vehicle classes package-private.",
    },
    {
      className: "ParkingLot",
      detailMD:
        "The aggregate root. **park**/**unpark**/**availability** are **synchronized**; it owns the active-ticket map and delegates spot selection to levels and pricing to the strategy.",
    },
  ],

  dryRun: {
    inputMD:
      "Lot with 1 level: spots **[MOTORCYCLE, COMPACT, LARGE]**. Actions: park a Car, park a Bus, unpark the Car after 90 minutes at 200¢/hour.",
    columns: ["Step", "Action", "Spot chosen", "Active tickets", "Result"],
    rows: [
      ["1", "park(Car · COMPACT)", "COMPACT spot", "{T1}", "Ticket T1"],
      ["2", "park(Bus · LARGE)", "LARGE spot", "{T1, T2}", "Ticket T2"],
      [
        "3",
        "unpark(T1) @ +90 min",
        "COMPACT freed",
        "{T2}",
        "ceil(90/60)=2h × 200¢ = 400¢",
      ],
      ["4", "availability()", "—", "{T2}", "COMPACT:1, MOTORCYCLE:1, LARGE:0"],
    ],
    narrativeMD:
      "Step 3 shows the hourly strategy rounding 90 minutes up to 2 hours, and freeing the spot the moment the ticket is settled.",
  },

  complexity: [
    {
      operation: "park",
      time: "O(L × S)",
      space: "O(1)",
      note: "L levels, S spots per level — a linear scan for the first fit.",
    },
    {
      operation: "unpark",
      time: "O(1)",
      space: "O(1)",
      note: "Map removal + a constant-time fee computation.",
    },
    {
      operation: "availability",
      time: "O(L × S)",
      space: "O(L)",
      note: "Counts free spots by size across every level.",
    },
  ],
  complexityNotesMD:
    "Park is the hot path. If S grows large, replace the per-level linear scan with size-bucketed free-spot queues to make park O(1) as well (see Alternative Designs).",

  extensibility: [
    {
      label: "New vehicle / spot size",
      detailMD:
        "Add an enum constant (respecting order) and, if needed, a **Vehicle** subclass. The fit rule and every scan keep working.",
    },
    {
      label: "New pricing plan",
      detailMD:
        "Implement **ParkingFeeStrategy** (daily cap, weekend rate, EV surcharge) and inject it — no change to **park**/**unpark**.",
    },
    {
      label: "Reservations / EV charging",
      detailMD:
        "Add a **SpotFeature** set or a decorator on **ParkingSpot**; **canFit** grows an extra predicate without touching the lot.",
    },
    {
      label: "Multiple entrances / durability",
      detailMD:
        "Swap the in-memory ticket map for a **TicketRepository**; the synchronized methods become the transaction boundary.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Size-bucketed free-spot queues",
      detailMD:
        "Keep a per-size map (VehicleSize to a deque of free spots) per level so **park** pops in O(1) instead of scanning.",
      tradeoffsMD:
        "Faster park at the cost of extra bookkeeping on every park/unpark and more state to keep consistent under concurrency.",
    },
    {
      name: "Central **SpotManager** service",
      detailMD:
        "Pull spot selection out of **Level** into a dedicated allocator that sees all levels at once (e.g. to balance load).",
      tradeoffsMD:
        "Enables global policies but weakens the clean Lot→Level→Spot ownership and centralises a lock.",
    },
    {
      name: "Lock-per-level instead of lock-on-lot",
      detailMD:
        "Synchronize each **Level** so cars entering different floors don't contend on one lock.",
      tradeoffsMD:
        "Higher throughput, but the availability snapshot is no longer a single atomic view.",
    },
  ],

  commonMistakes: [
    "Putting the fit rule in the controller (**if size == ...**) instead of on **VehicleSize**/**ParkingSpot**.",
    "Creating the ticket before a spot is actually reserved, so a failed park still bills the driver.",
    "Forgetting to synchronize park/unpark, letting two gates hand out the same spot.",
    "Hard-coding hourly pricing in the exit path instead of behind a strategy.",
    "Exposing mutable internal lists (spots, tickets) so callers can corrupt occupancy state.",
    "Modelling vehicle types with an enum + switch instead of polymorphism, which then leaks into every method.",
  ],

  followUps: [
    {
      question: "How do you make park O(1) under heavy load?",
      answerMD:
        "Maintain per-size free-spot queues per level and pop the head; push back on unpark. Trades a little memory + bookkeeping for constant-time allocation.",
    },
    {
      question: "How would you support parking a large vehicle across two spots?",
      answerMD:
        "Introduce a **SpotGroup**/allocation abstraction so a reservation can hold N adjacent spots atomically; **canFit** becomes a group-level check.",
    },
    {
      question: "Two entrances race for the last spot — what happens?",
      answerMD:
        "Because **park** is synchronized (or the level lock is held during check-then-reserve), the reservation is atomic; the loser gets **Optional.empty()** and is told the lot is full.",
    },
    {
      question: "Where would payments and gate hardware live?",
      answerMD:
        "As adapters at the boundary — a **PaymentProcessor** and gate controllers call into **park**/**unpark**. The domain stays free of I/O.",
    },
  ],

  productionConsiderations: [
    {
      label: "Persistence",
      detailMD:
        "Back tickets + occupancy with a **TicketRepository** (SQL) so state survives restarts and supports multiple app instances.",
    },
    {
      label: "Concurrency at scale",
      detailMD:
        "A single lock becomes a bottleneck. Move to per-level locks or optimistic reservation with a DB row lock on the spot.",
    },
    {
      label: "Observability",
      detailMD:
        "Emit metrics for occupancy %, park failures, and average dwell time; alert when a size class is chronically full.",
    },
    {
      label: "Pricing correctness",
      detailMD:
        "Compute fees server-side with a fixed clock source, round consistently, and keep an audit trail of the rate applied to each ticket.",
    },
  ],

  interviewNotes: [
    "Did you keep the fit rule in one place and out of the orchestration code?",
    "Is object creation atomic — no ticket without a reserved spot?",
    "Did you name the concurrency problem and guard the critical section?",
    "Is pricing behind an interface so a new plan is additive?",
    "Can you extend to new vehicle/spot types by adding data, not editing flow?",
  ],

  quiz: [
    {
      question: "Why is **canHold** defined on **VehicleSize** rather than in **ParkingLot**?",
      options: [
        "To keep the fit rule in one place so no controller re-implements it",
        "Because enums run faster than method calls",
        "So the lot can skip the availability check",
        "It is required by the Strategy pattern",
      ],
      answerIndex: 0,
      explanationMD:
        "Encapsulating the rule on the enum means every caller asks the same source of truth — adding a size can't create an inconsistent check.",
    },
    {
      question: "What does making **ParkingFeeStrategy** an interface buy you?",
      options: [
        "Nothing — it's the same as a static method",
        "A new pricing plan is a new class, with no change to park/unpark",
        "It removes the need to store the entry time",
        "It makes parking O(1)",
      ],
      answerIndex: 1,
      explanationMD:
        "That's the Strategy pattern: pricing policy varies independently of the parking flow that uses it.",
    },
    {
      question: "Why are **park** and **unpark** synchronized?",
      options: [
        "To make the code shorter",
        "So the fee calculation is exact",
        "So check-then-reserve is atomic and two gates can't grab the same spot",
        "Because Java requires it for shared maps",
      ],
      answerIndex: 2,
      explanationMD:
        "The race is between checking a spot is free and reserving it; the synchronized boundary makes that sequence atomic.",
    },
    {
      question: "Why create the **Ticket** only after a spot is reserved?",
      options: [
        "To avoid billing a driver when parking actually failed",
        "To save memory",
        "Because the ticket id depends on the spot",
        "So the strategy can be chosen later",
      ],
      answerIndex: 0,
      explanationMD:
        "Ordering matters: a ticket represents a committed reservation, so it must not exist for a park that couldn't be satisfied.",
    },
  ],

  practiceVariants: [
    {
      title: "Add EV charging spots",
      detailMD:
        "Introduce a spot feature so only EVs may take charging spots, and prefer non-charging spots for non-EVs. Keep the fit rule extensible.",
      difficulty: "Intermediate",
    },
    {
      title: "Daily-cap pricing",
      detailMD:
        "Add a strategy that charges hourly but never more than a daily maximum. Verify the exit path needs no changes.",
      difficulty: "Beginner",
    },
    {
      title: "Nearest-spot allocation",
      detailMD:
        "Allocate the free spot closest to an entrance. Decide whether this belongs in **Level**, a new allocator, or a comparator.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "Where does the vehicle-to-spot fit rule live?",
      back: "On **VehicleSize.canHold** (ordinal comparison), reused by **Vehicle.fitsIn** and **ParkingSpot.canFit**.",
    },
    {
      front: "Which pattern makes pricing swappable?",
      back: "Strategy — **ParkingFeeStrategy**, injected into **ParkingLot**.",
    },
    {
      front: "What is the concurrency critical section?",
      back: "Check-then-reserve in park (and free-on-exit in unpark); guarded by synchronizing the lot.",
    },
    {
      front: "Ownership chain of the model?",
      back: "ParkingLot owns Levels, a Level owns Spots, a Spot holds at most one Vehicle; a Ticket links a Vehicle to its Spot.",
    },
    {
      front: "How do you make park O(1)?",
      back: "Keep per-size free-spot queues per level and pop the head instead of scanning.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** ParkingLot → Level → ParkingSpot; Vehicle (abstract) + Motorcycle/Car/Bus; Ticket; ParkingFeeStrategy; VehicleSize.",
    "",
    "**Patterns:** Strategy (pricing), Factory (creation), Template Method (Vehicle base).",
    "",
    "**Flows:** park = try levels → reserve first fit → issue ticket; unpark = validate ticket → compute fee → free spot.",
    "",
    "**Invariants:** one vehicle per spot; ticket only after reservation; park/unpark atomic.",
    "",
    "**Complexity:** park O(L×S), unpark O(1), availability O(L×S).",
    "",
    "**Extend:** new size = enum constant; new price = new strategy; reservations = spot feature/decorator.",
  ].join("\n"),

  references: [
    {
      title: "Head First Design Patterns (Strategy, Factory)",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Effective Java — Item 34 (enums), Item 1 (static factories)",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — Strategy Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/strategy",
    },
  ],

  relatedProblems: [
    { slug: "elevator-system", note: "Another facility-control model with state + selection policy." },
    { slug: "vending-machine", note: "State + Strategy on a smaller surface." },
    { slug: "solid-principles", note: "The principles this design leans on." },
  ],
};
