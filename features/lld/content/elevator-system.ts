import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const elevatorSystem: LLDProblemContent = {
  slug: "elevator-system",

  statementMD: [
    "Design the object model for a **multi-car elevator system** in a building.",
    "The system receives external hall calls from floors and internal car calls",
    "from passengers inside an elevator. A controller assigns hall calls to cars,",
    "each car maintains stop queues, moves one floor at a time, opens doors at",
    "served stops, and keeps its direction and lifecycle state consistent.",
    "",
    "This is an intermediate LLD problem because the interesting part is not just",
    "classes. You must reason about scheduling, request queues, state transitions,",
    "display updates, and concurrent requests arriving while cars are moving.",
  ].join("\n"),

  businessContextMD: [
    "Elevator systems appear in interviews at Amazon, Google, Uber, and Microsoft",
    "because they compress several real control-system concerns into one design:",
    "dispatching across a fleet, local car scheduling, state machines, and safety",
    "around shared mutable state.",
    "",
    "A strong answer separates **bank-level dispatch** from **car-level service**.",
    "The controller decides which car should answer a hall call. The chosen car",
    "then serves its ordered stop queues using a SCAN or LOOK style rule. Floor",
    "indicators and displays observe state changes rather than owning scheduling",
    "logic.",
  ].join("\n"),

  functionalRequirements: [
    "Support a building with a configurable minimum floor, maximum floor, and elevator count.",
    "Accept external hall requests containing the source floor and desired direction.",
    "Accept internal car requests containing the elevator id and destination floor.",
    "Dispatch hall calls to an elevator through a pluggable scheduling strategy.",
    "Maintain per-car request queues so each car can continue in its current direction before reversing.",
    "Move cars through states such as idle, moving up, moving down, and doors open.",
    "Advance the simulation with a tick that moves every car by at most one floor.",
    "Validate floor ranges and reject invalid elevator ids or impossible hall directions.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Scheduling quality",
      detailMD:
        "A hall call should usually go to the car with the lowest estimated pickup cost, preferring cars already moving toward the caller in the requested direction.",
    },
    {
      label: "Concurrency safety",
      detailMD:
        "Hall calls, car calls, and ticks may arrive from different button panels or a scheduler thread. The controller and each elevator need clear synchronization boundaries.",
    },
    {
      label: "Extensibility",
      detailMD:
        "Nearest-car dispatch, zoning, VIP priority, destination dispatch, and energy-saving policies should be replaceable without rewriting Elevator.",
    },
    {
      label: "Responsiveness",
      detailMD:
        "Submit operations should do small in-memory work: choose a car, enqueue a stop, and return quickly. Physical movement happens over ticks.",
    },
    {
      label: "Observability",
      detailMD:
        "Floor displays, car panels, and monitoring systems should learn about current floor, direction, and door state through update events or snapshots.",
    },
  ],

  requirementClarification: [
    {
      question: "Are we designing one elevator or a bank of elevators?",
      answerMD:
        "A bank of elevators. The controller receives hall calls and assigns one elevator; each elevator owns its own stop queues and movement state.",
    },
    {
      question: "Do hall calls include direction?",
      answerMD:
        "Yes. A person outside the car asks for up or down, so the dispatch strategy can prefer cars already moving the right way.",
    },
    {
      question: "Do internal car requests need direction?",
      answerMD:
        "No. Inside the car, the passenger selects a destination floor. Direction is derived from the car current floor and current service plan.",
    },
    {
      question: "Is this a real-time hardware controller?",
      answerMD:
        "No. Model the domain and scheduling logic. Hardware buttons, motors, sensors, and doors are adapters around the core model.",
    },
    {
      question: "Should the controller be a global singleton?",
      answerMD:
        "Treat it as one coordinator per elevator bank. The reference Java keeps it owned by Building for testability, while production dependency injection would register exactly one controller for that bank.",
    },
    {
      question: "How much scheduling sophistication is expected?",
      answerMD:
        "Start with nearest-car dispatch at the bank level and SCAN or LOOK behavior inside each car. Then discuss zoning, load, priority, and fairness as extensions.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Building {",
    "        -int minFloor",
    "        -int maxFloor",
    "        -ElevatorController controller",
    "        +pressHallButton(int, Direction) int",
    "        +selectFloor(int, int) void",
    "        +runOneTick() void",
    "    }",
    "    class ElevatorController {",
    "        -List~Elevator~ elevators",
    "        -DispatchStrategy dispatchStrategy",
    "        +submitHallCall(int, Direction) int",
    "        +submitCarCall(int, int) void",
    "        +tick() void",
    "    }",
    "    class Elevator {",
    "        -int id",
    "        -int currentFloor",
    "        -Direction direction",
    "        -ElevatorState state",
    "        -NavigableSet~Integer~ upStops",
    "        -NavigableSet~Integer~ downStops",
    "        +addStop(int) void",
    "        +step() void",
    "        +estimatedDistanceTo(HallRequest) int",
    "    }",
    "    class Request {",
    "        <<abstract>>",
    "        -int floor",
    "        +getFloor() int",
    "    }",
    "    class HallRequest {",
    "        -Direction direction",
    "        +getDirection() Direction",
    "    }",
    "    class CarRequest {",
    "        -int elevatorId",
    "        +getElevatorId() int",
    "    }",
    "    class DispatchStrategy {",
    "        <<interface>>",
    "        +chooseElevator(List~Elevator~, HallRequest) Elevator",
    "    }",
    "    class NearestCarStrategy",
    "    class Direction {",
    "        <<enumeration>>",
    "        UP",
    "        DOWN",
    "        IDLE",
    "    }",
    "    class ElevatorState {",
    "        <<enumeration>>",
    "        IDLE",
    "        MOVING_UP",
    "        MOVING_DOWN",
    "        DOORS_OPEN",
    "    }",
    "    Building o-- ElevatorController",
    "    ElevatorController o-- Elevator",
    "    ElevatorController ..> DispatchStrategy",
    "    DispatchStrategy <|.. NearestCarStrategy",
    "    Request <|-- HallRequest",
    "    Request <|-- CarRequest",
    "    Elevator ..> HallRequest",
    "    Elevator --> Direction",
    "    Elevator --> ElevatorState",
  ].join("\n"),
  classDiagramCaptionMD:
    "The code keeps the bank coordinator in ElevatorController, isolates dispatch behind DispatchStrategy, and keeps stop ordering plus state transitions inside Elevator.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Rider",
    "    participant Building",
    "    participant Controller as ElevatorController",
    "    participant Strategy as DispatchStrategy",
    "    participant Car as Elevator",
    "    Rider->>Building: pressHallButton(floor, direction)",
    "    Building->>Controller: submitHallCall(floor, direction)",
    "    Controller->>Strategy: chooseElevator(elevators, request)",
    "    Strategy->>Car: estimatedDistanceTo(request)",
    "    Car-->>Strategy: pickup cost",
    "    Strategy-->>Controller: selected car",
    "    Controller->>Car: addStop(floor)",
    "    Controller-->>Building: selected elevator id",
    "    Building-->>Rider: elevator id",
    "    loop each tick",
    "        Building->>Controller: runOneTick()",
    "        Controller->>Car: step()",
    "        Car->>Car: move or open doors",
    "    end",
    "    Rider->>Building: selectFloor(elevatorId, destination)",
    "    Building->>Controller: submitCarCall(elevatorId, destination)",
    "    Controller->>Car: addStop(destination)",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Hall calls are dispatched once at the controller; after assignment, the elevator owns local stop ordering and movement over ticks.",

  entities: [
    {
      name: "Building",
      responsibilityMD:
        "Public facade for panels, tests, and simulations. It validates floor ranges and forwards button presses to the single controller for this elevator bank.",
      attributes: ["minFloor", "maxFloor", "controller"],
    },
    {
      name: "ElevatorController",
      responsibilityMD:
        "Bank coordinator. It owns the elevator list, delegates hall-call assignment to a DispatchStrategy, routes car calls by elevator id, and advances all cars on each tick.",
      attributes: ["elevators", "dispatchStrategy"],
    },
    {
      name: "Elevator",
      responsibilityMD:
        "Car aggregate. It stores current floor, direction, lifecycle state, and two ordered stop queues, then decides how to move or open doors on each tick.",
      attributes: ["id", "currentFloor", "direction", "state", "upStops", "downStops"],
    },
    {
      name: "Request",
      responsibilityMD:
        "Base value for a requested floor. HallRequest adds desired direction; CarRequest adds the elevator id that received the destination selection.",
      attributes: ["floor"],
    },
    {
      name: "DispatchStrategy",
      responsibilityMD:
        "Policy interface for selecting an elevator for a hall call. NearestCarStrategy is the default implementation in the reference code.",
      attributes: ["chooseElevator"],
    },
    {
      name: "Direction",
      responsibilityMD:
        "Small enum for movement intent: up, down, or idle. It also exposes opposite for policies that need reversal logic.",
      attributes: ["UP", "DOWN", "IDLE"],
    },
    {
      name: "ElevatorState",
      responsibilityMD:
        "Explicit lifecycle enum for idle, moving up, moving down, and doors open. It keeps door-open behavior visible instead of hiding it in booleans.",
      attributes: ["IDLE", "MOVING_UP", "MOVING_DOWN", "DOORS_OPEN"],
    },
    {
      name: "Display observer",
      responsibilityMD:
        "Production-facing role for floor indicators and car panels. It should subscribe to current-floor, direction, and door-state changes instead of influencing scheduling.",
      attributes: ["elevatorId", "floor", "direction", "state"],
    },
  ],

  patternsUsed: [
    {
      name: "State",
      whyMD:
        "ElevatorState makes the car lifecycle explicit: idle, moving up, moving down, and doors open. The reference uses an enum state machine; a larger implementation can promote each state into a concrete state class.",
    },
    {
      name: "Strategy",
      whyMD:
        "DispatchStrategy separates bank-level scheduling from controller flow. NearestCarStrategy can be replaced with LOOK, zoning, load-aware, or priority scheduling without changing Elevator.",
    },
    {
      name: "Singleton",
      whyMD:
        "There should be one authoritative ElevatorController per elevator bank. The reference keeps that controller owned by Building for testability; production dependency injection can register it as the bank singleton.",
    },
    {
      name: "Observer",
      whyMD:
        "Floor displays, car displays, and telemetry should observe state snapshots after movement or door changes. They must not poll or mutate elevator stop queues.",
    },
  ],

  designSteps: [
    {
      title: "Split hall requests from car requests",
      detailMD:
        "A hall call has floor plus desired direction. A car call has elevator id plus destination floor. Keeping the two request types separate avoids guessing intent later.",
      code: [
        "abstract class Request {",
        "    private final int floor;",
        "",
        "    protected Request(int floor) {",
        "        this.floor = floor;",
        "    }",
        "}",
        "",
        "class HallRequest extends Request {",
        "    private final Direction direction;",
        "",
        "    HallRequest(int floor, Direction direction) {",
        "        super(floor);",
        "        this.direction = direction;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Keep SCAN or LOOK ordering inside the elevator",
      detailMD:
        "Use one ascending set for upward stops and one descending set for downward stops. The car continues in its current direction while stops remain, then reverses when needed.",
      code: [
        "class Elevator {",
        "    private final NavigableSet<Integer> upStops = new TreeSet<>();",
        "    private final NavigableSet<Integer> downStops = new TreeSet<>(Collections.reverseOrder());",
        "    private int currentFloor;",
        "",
        "    synchronized void addStop(int floor) {",
        "        if (floor > currentFloor) {",
        "            upStops.add(floor);",
        "        } else if (floor < currentFloor) {",
        "            downStops.add(floor);",
        "        } else {",
        "            openDoors();",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Dispatch hall calls through a strategy",
      detailMD:
        "The controller should not know the scoring formula. It asks DispatchStrategy for a car; NearestCarStrategy scores every car by estimated pickup distance and direction compatibility.",
      code: [
        "class NearestCarStrategy implements DispatchStrategy {",
        "    public Elevator chooseElevator(List<Elevator> elevators, HallRequest request) {",
        "        return elevators.stream()",
        "                .min(Comparator.comparingInt(elevator -> elevator.estimatedDistanceTo(request)))",
        "                .orElseThrow(() -> new IllegalStateException(\"no elevators available\"));",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Drive a visible car and door state machine",
      detailMD:
        "Each tick either chooses a direction, moves one floor, opens doors at a requested stop, or returns to idle. Door-open is a first-class state so displays and tests can observe it.",
    },
    {
      title: "Use one controller per bank and synchronize entry points",
      detailMD:
        "Building owns one ElevatorController for the bank. Controller methods are synchronized, and Elevator mutators are synchronized, so dispatch, car-call routing, and ticking do not interleave into corrupt queues.",
    },
    {
      title: "Publish display updates as observer notifications",
      detailMD:
        "A production system should emit snapshots after movement and door changes. Displays observe those snapshots; they do not choose elevators or inspect internal stop sets.",
      code: [
        "interface ElevatorObserver {",
        "    void onChanged(int elevatorId, int floor, Direction direction, ElevatorState state);",
        "}",
        "",
        "class FloorDisplay implements ElevatorObserver {",
        "    public void onChanged(int elevatorId, int floor, Direction direction, ElevatorState state) {",
        "        render(elevatorId, floor, direction, state);",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  implementation: referenceFiles("design-elevator-system"),

  classExplanations: [
    {
      className: "Direction",
      detailMD:
        "Movement-intent enum with UP, DOWN, and IDLE. The opposite method supports policies that need to reverse direction cleanly.",
    },
    {
      className: "ElevatorState",
      detailMD:
        "Lifecycle enum for IDLE, MOVING_UP, MOVING_DOWN, and DOORS_OPEN. The isMoving helper keeps movement checks readable.",
    },
    {
      className: "Request",
      detailMD:
        "Abstract base value that stores and validates a requested floor. It prevents negative floors before a request reaches scheduling code.",
    },
    {
      className: "HallRequest",
      detailMD:
        "External request from a floor panel. It stores the desired direction and rejects IDLE because a hall call must mean up or down.",
    },
    {
      className: "CarRequest",
      detailMD:
        "Internal request from inside a specific car. It carries the elevator id plus destination floor, leaving direction derivation to the elevator.",
    },
    {
      className: "Elevator",
      detailMD:
        "The core car model. It stores bounds, current floor, current direction, state, and two ordered stop sets. addStop enqueues a destination; step moves one floor or opens doors; estimatedDistanceTo supports dispatch scoring.",
    },
    {
      className: "DispatchStrategy",
      detailMD:
        "Scheduling interface used by the controller to choose an elevator for a HallRequest. This is the main seam for replacing nearest-car with zoning, LOOK, or load-aware policies.",
    },
    {
      className: "NearestCarStrategy",
      detailMD:
        "Default strategy that picks the elevator with the smallest estimatedDistanceTo score. The Elevator score penalizes cars moving away or serving the opposite direction.",
    },
    {
      className: "ElevatorController",
      detailMD:
        "Bank coordinator. It owns a copy of the elevator list, routes hall calls through DispatchStrategy, routes car calls by id, and ticks every car. Its public methods are synchronized.",
    },
    {
      className: "Building",
      detailMD:
        "Facade for clients and simulations. It creates the elevators, installs NearestCarStrategy, validates floor ranges, exposes hall and car button methods, and advances time with runOneTick.",
    },
  ],

  dryRun: {
    inputMD:
      "Building floors 0 to 10 with two elevators, both starting at floor 0. Events: hall up at 3, hall up at 7, tick, passenger in elevator 1 selects floor 9.",
    columns: ["Step", "Event", "Controller decision", "Elevator 1", "Elevator 2", "Result"],
    rows: [
      ["1", "pressHallButton(3, UP)", "Nearest car chooses E1 by tie order", "upStops {3}", "idle at 0", "Return elevator id 1"],
      ["2", "pressHallButton(7, UP)", "E1 is already moving toward call, E2 is idle at 0", "upStops {3, 7}", "idle at 0", "Return elevator id 1"],
      ["3", "runOneTick()", "Controller ticks every car", "moves from 0 to 1, MOVING_UP", "stays IDLE", "No stop served yet"],
      ["4", "selectFloor(1, 9)", "Route car call to E1", "upStops {3, 7, 9}", "idle at 0", "Destination queued"],
      ["5", "two more ticks", "Controller ticks every car", "reaches 3, DOORS_OPEN", "stays IDLE", "Hall call at 3 served"],
      ["6", "next tick after doors open", "E1 chooses direction again", "continues MOVING_UP toward 7 and 9", "stays IDLE", "SCAN behavior resumes"],
    ],
    narrativeMD:
      "The key interview point is that the controller assigns hall calls, but E1 owns the ordered stop queue after assignment. New car calls merge into the same direction queue while the car is moving.",
  },

  complexity: [
    {
      operation: "submitHallCall",
      time: "O(E + log S)",
      space: "O(1)",
      note: "E elevators are scored by the dispatch strategy; enqueueing the chosen floor is O(log S).",
    },
    {
      operation: "submitCarCall",
      time: "O(E + log S)",
      space: "O(1)",
      note: "The reference scans for the elevator id, then inserts the destination into one ordered stop set.",
    },
    {
      operation: "tick",
      time: "O(E log S)",
      space: "O(1)",
      note: "Each elevator moves at most one floor and may remove a served stop from a TreeSet.",
    },
    {
      operation: "estimatedDistanceTo",
      time: "O(1)",
      space: "O(1)",
      note: "Uses current floor, direction, and request direction to compute a penalty-adjusted distance.",
    },
  ],
  complexityNotesMD:
    "E is number of elevators and S is pending stops in one elevator. A production controller would keep elevators in a map by id to make car calls O(log S), and advanced dispatch may cost more if it simulates future routes.",

  extensibility: [
    {
      label: "New dispatch algorithm",
      detailMD:
        "Implement DispatchStrategy for zoning, LOOK, destination dispatch, VIP priority, load-aware scoring, or energy-saving night mode. Controller flow stays the same.",
    },
    {
      label: "Richer car state",
      detailMD:
        "Promote ElevatorState enum values into state objects if door timers, overload, maintenance, emergency stop, or fire-service mode require state-specific behavior.",
    },
    {
      label: "Display and telemetry observers",
      detailMD:
        "Add observers that receive snapshots after addStop, step, and openDoors. Floor displays and metrics can update without reading private queues.",
    },
    {
      label: "Multiple elevator banks",
      detailMD:
        "Introduce Bank or Zone aggregates, each with its own singleton controller and strategy. A building-level router chooses the bank first.",
    },
    {
      label: "Persistence and replay",
      detailMD:
        "Store requests, state transitions, and served stops in an event log so operations can replay incidents and recover after controller restarts.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Central global scheduler",
      detailMD:
        "Keep all pending hall and car requests in the controller, and compute complete routes for every elevator on each decision.",
      tradeoffsMD:
        "Can optimize globally, but the controller becomes complex and highly contended. The reference keeps local car queues simpler and easier to reason about.",
    },
    {
      name: "Pure SCAN without nearest-car dispatch",
      detailMD:
        "Assign each hall call to a fixed car or zone and let that car run SCAN locally.",
      tradeoffsMD:
        "Very predictable and simple, but can leave an idle nearby car unused while another busy car owns the zone.",
    },
    {
      name: "Destination dispatch",
      detailMD:
        "Ask passengers for destination before boarding, group compatible riders, and assign a car based on route clustering.",
      tradeoffsMD:
        "Reduces stops in busy buildings, but changes the request model and requires richer kiosk and passenger-flow handling.",
    },
    {
      name: "Actor per elevator",
      detailMD:
        "Run each Elevator as an actor with a mailbox; the controller sends assignment messages and receives snapshots.",
      tradeoffsMD:
        "Excellent isolation and concurrency, but adds asynchronous delivery, ordering, and failure-handling complexity.",
    },
  ],

  commonMistakes: [
    "Mixing dispatch and movement by letting ElevatorController directly manipulate stop queues and current floor.",
    "Treating hall and car requests as the same object, losing the requested hall direction.",
    "Using one unsorted list of stops, causing cars to bounce inefficiently instead of serving in a SCAN or LOOK order.",
    "Representing doors as a boolean and forgetting the DOORS_OPEN lifecycle state.",
    "Hard-coding nearest-car logic in the controller instead of behind DispatchStrategy.",
    "Ignoring concurrent hall calls and ticks, which can corrupt queues or assign based on stale state.",
    "Letting floor displays poll private elevator fields instead of observing published snapshots.",
    "Creating multiple controllers for the same bank, which splits the source of truth for assignments.",
  ],

  followUps: [
    {
      question: "How would you implement LOOK instead of simple nearest-car dispatch?",
      answerMD:
        "Keep local elevator queues ordered by direction, but in DispatchStrategy score the projected pickup using current route endpoints instead of raw floor distance. LOOK avoids traveling to the building edge when no stop exists there.",
    },
    {
      question: "How do you prevent a hall call from being assigned twice under concurrency?",
      answerMD:
        "Make request submission atomic at the controller boundary. In a distributed setup, store hall requests with an assigned elevator id using a compare-and-set or database transaction.",
    },
    {
      question: "Where should door timing live?",
      answerMD:
        "In the car state machine. DOORS_OPEN can hold a timer or become a DoorOpenState object that consumes ticks until the close condition is met.",
    },
    {
      question: "How would displays update in real time?",
      answerMD:
        "Publish immutable snapshots after state transitions. Floor displays, car panels, and telemetry subscribe as observers and render without changing scheduling state.",
    },
    {
      question: "How do you handle elevator capacity or overload?",
      answerMD:
        "Add load to the elevator snapshot and scoring function. If overloaded, reject new car movement, keep doors open, and avoid assigning hall calls to that car.",
    },
    {
      question: "What changes for multiple banks or zones?",
      answerMD:
        "Introduce a BuildingRouter or BankController layer. It chooses the bank or zone first; within each bank, the existing ElevatorController and DispatchStrategy remain unchanged.",
    },
  ],

  productionConsiderations: [
    {
      label: "Safety and hardware integration",
      detailMD:
        "Real systems must integrate door sensors, motor controllers, brake status, fire-service mode, emergency stops, and interlocks. The LLD core should expose safe commands, not talk directly to raw hardware.",
    },
    {
      label: "Threading model",
      detailMD:
        "The reference uses synchronized methods. Production systems often use a single event loop or actor per car to make ordering explicit and avoid lock-order deadlocks.",
    },
    {
      label: "Fairness and starvation",
      detailMD:
        "Nearest-car can starve distant calls during traffic peaks. Add age-based penalties or zone balancing so old requests become increasingly expensive to ignore.",
    },
    {
      label: "Observability",
      detailMD:
        "Emit events for request accepted, assigned, car moved, door opened, door closed, and request served. Dashboards should show wait time, travel time, stops per trip, and failure rates.",
    },
    {
      label: "Controller availability",
      detailMD:
        "One logical singleton controller per bank does not mean one fragile process. Use leader election or hot standby so exactly one leader assigns calls while another can take over.",
    },
  ],

  interviewNotes: [
    "Did you separate external hall calls from internal car calls?",
    "Can you explain the difference between bank-level dispatch and car-level SCAN or LOOK serving?",
    "Is the dispatch policy behind a Strategy interface rather than hard-coded in the controller?",
    "Did you model the door lifecycle explicitly with DOORS_OPEN instead of hidden booleans?",
    "Can you identify the concurrency boundary for call submission and ticking?",
    "Did you describe one controller per bank and observer-style display updates without coupling displays to queues?",
  ],

  quiz: [
    {
      question: "Why does HallRequest store a direction while CarRequest does not?",
      options: [
        "A hall passenger chooses up or down before boarding, while an in-car passenger chooses only a destination floor",
        "CarRequest cannot be validated",
        "HallRequest is used only for display updates",
        "Direction is needed only for emergency mode",
      ],
      answerIndex: 0,
      explanationMD:
        "The hall direction is critical for dispatch scoring. Inside the car, direction is inferred from current floor and destination.",
    },
    {
      question: "What is the main benefit of DispatchStrategy?",
      options: [
        "It removes the need for ElevatorState",
        "It makes every elevator move at the same speed",
        "It lets the controller swap scheduling policies without changing car movement logic",
        "It stores all floor display state",
      ],
      answerIndex: 2,
      explanationMD:
        "Strategy isolates the fleet assignment policy. Nearest-car, zoning, LOOK-aware, and priority policies can all implement the same interface.",
    },
    {
      question: "Why use separate upStops and downStops ordered sets?",
      options: [
        "To serialize all requests through one global queue",
        "To support SCAN style serving in the current direction before reversing",
        "To make hall calls impossible",
        "To avoid validating floors",
      ],
      answerIndex: 1,
      explanationMD:
        "Ordered sets make the next stop in each direction easy to find and prevent duplicate stops in the same queue.",
    },
    {
      question: "What should happen when an elevator reaches a requested floor?",
      options: [
        "The controller should delete the elevator",
        "The elevator should enter DOORS_OPEN and remove the served stop",
        "The request should be re-added to both queues",
        "The dispatch strategy should become a singleton",
      ],
      answerIndex: 1,
      explanationMD:
        "Serving a stop is a car-level state transition: remove the stop and expose the door-open state for passengers and displays.",
    },
    {
      question: "What is the best role for floor displays?",
      options: [
        "They should choose the nearest elevator",
        "They should mutate upStops and downStops directly",
        "They should observe published state snapshots and render current floor, direction, and door state",
        "They should replace ElevatorController",
      ],
      answerIndex: 2,
      explanationMD:
        "Observer keeps display updates decoupled from scheduling. Displays render state; they do not own state.",
    },
    {
      question: "Why should there be one logical controller per elevator bank?",
      options: [
        "So every request has one authoritative assignment point",
        "So Java enums can compile",
        "So no elevator needs a state machine",
        "So all displays can stop observing",
      ],
      answerIndex: 0,
      explanationMD:
        "A single logical controller prevents split-brain assignment decisions. Production can still run standby replicas as long as only one leader assigns calls.",
    },
  ],

  practiceVariants: [
    {
      title: "Implement LOOK-aware dispatch",
      detailMD:
        "Modify the strategy so it estimates pickup based on a car current route endpoint and pending stops, not just current floor distance.",
      difficulty: "Intermediate",
    },
    {
      title: "Add display observers",
      detailMD:
        "Create an observer interface, publish immutable elevator snapshots after every state transition, and attach floor and in-car displays.",
      difficulty: "Intermediate",
    },
    {
      title: "Add capacity and overload handling",
      detailMD:
        "Track passenger load, refuse movement when overloaded, keep doors open, and make DispatchStrategy avoid overloaded cars.",
      difficulty: "Advanced",
    },
    {
      title: "Model emergency and maintenance modes",
      detailMD:
        "Extend the state machine so emergency stop and maintenance remove a car from dispatch while preserving safe door and movement behavior.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the difference between hall and car requests?",
      back: "Hall requests contain floor plus desired direction; car requests contain elevator id plus destination floor.",
    },
    {
      front: "Which pattern makes elevator assignment swappable?",
      back: "Strategy, through DispatchStrategy and concrete policies such as NearestCarStrategy.",
    },
    {
      front: "What does SCAN or LOOK mean for one elevator?",
      back: "Continue serving stops in the current direction, then reverse only when there are no more useful stops that way.",
    },
    {
      front: "Why model DOORS_OPEN as a state?",
      back: "Door-open behavior affects ticks, displays, boarding, and future transitions, so it should be explicit.",
    },
    {
      front: "What is the singleton boundary in this problem?",
      back: "One logical ElevatorController per elevator bank is the authoritative assignment point.",
    },
    {
      front: "What should observers receive?",
      back: "Immutable snapshots containing elevator id, current floor, direction, and state.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** Building facade, ElevatorController bank coordinator, Elevator car aggregate, Request hierarchy, Direction, ElevatorState, DispatchStrategy.",
    "",
    "**Requests:** HallRequest = floor plus direction; CarRequest = elevator id plus destination.",
    "",
    "**Scheduling:** Controller uses Strategy to assign hall calls; Elevator uses ordered up and down stop sets for SCAN or LOOK style service.",
    "",
    "**State:** Direction captures travel intent; ElevatorState captures lifecycle: IDLE, MOVING_UP, MOVING_DOWN, DOORS_OPEN.",
    "",
    "**Concurrency:** Synchronize controller submissions and elevator mutation, or replace locks with an event loop or actor per car.",
    "",
    "**Patterns:** State for car lifecycle, Strategy for dispatch, Singleton for one controller per bank, Observer for displays and telemetry.",
    "",
    "**Complexity:** Hall call O(E) plus O(log S) enqueue, car call O(E + log S), tick O(E log S).",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Gamma, Helm, Johnson, and Vlissides",
    },
    {
      title: "Elevator algorithm",
      kind: "Docs",
      url: "https://en.wikipedia.org/wiki/Elevator_algorithm",
    },
    {
      title: "Java Concurrency in Practice",
      kind: "Book",
      author: "Brian Goetz",
    },
    {
      title: "Refactoring Guru — Observer Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/observer",
    },
  ],

  relatedProblems: [
    { slug: "parking-lot", note: "Another facility-control design with allocation, state, and concurrency boundaries." },
    { slug: "lru-cache", note: "Practice ordered state updates and O(1) access tradeoffs before optimizing request queues." },
    { slug: "task-scheduler", note: "Scheduling priorities, fairness, and queue management are natural follow-ups." },
  ],
};
