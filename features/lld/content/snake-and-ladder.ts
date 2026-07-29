import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const snakeAndLadder: LLDProblemContent = {
  slug: "snake-and-ladder",

  statementMD: [
    "Design the object model for **Snake & Ladder**, a turn-based board game where",
    "multiple players wait in a queue, roll a dice, move across numbered cells,",
    "apply any snake or ladder jump they land on, and win only when they reach the",
    "final cell exactly.",
    "",
    "The interview focus is not graphics or networking. Focus on the game engine:",
    "board setup, dice Strategy, fair turn ordering, movement rules, event",
    "publication, and clean seams for custom boards or deterministic tests.",
  ].join("\n"),

  businessContextMD: [
    "Snake & Ladder is a beginner-friendly game design question used by Amazon,",
    "Flipkart, and Microsoft because the rules are simple but the modelling",
    "signals are strong. A good solution separates immutable board layout from",
    "mutable player state, keeps dice pluggable through Strategy, centralizes board",
    "construction through a Factory Method, and exposes game events through an",
    "Observer-style seam rather than scattering print statements through the code.",
  ].join("\n"),

  functionalRequirements: [
    "Create an N by N board whose final cell is N squared.",
    "Represent snakes and ladders as jumps from one cell to another cell.",
    "Reject invalid jumps such as a jump from the first cell, a jump from the final cell, duplicate jump starts, or endpoints outside the board.",
    "Support two or more players and process turns in queue order.",
    "Roll dice through a pluggable Dice strategy so tests can use deterministic rolls and production can use random rolls.",
    "Resolve a move by applying the dice roll, staying in place on overshoot, then applying at most one jump from the landing cell.",
    "Declare a winner as soon as a player reaches the final cell exactly and stop re-queuing that player.",
    "Publish move, jump, and win events so a console, UI, logger, or scoreboard can observe the game without owning game rules.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Deterministic testability",
      detailMD:
        "The dice must be injected so a unit test can replay exact rolls without depending on randomness.",
    },
    {
      label: "Rule correctness",
      detailMD:
        "Overshoot, jump validation, queue rotation, and win detection must be enforced by domain objects rather than by UI code.",
    },
    {
      label: "Extensible setup",
      detailMD:
        "A new board layout should be created by a factory or configuration loader without changing Game.playTurn.",
    },
    {
      label: "Low latency",
      detailMD:
        "A turn should be constant time after setup: roll once, check one jump map entry, update one player, and rotate the queue.",
    },
    {
      label: "Separation of concerns",
      detailMD:
        "The game engine should not know whether events are printed, stored, streamed, or rendered in a UI.",
    },
  ],

  requirementClarification: [
    {
      question: "Does a player need the exact roll to win?",
      answerMD:
        "Yes. If the roll would move beyond the final cell, the player stays at the current position and the turn passes.",
    },
    {
      question: "Can a cell have both a snake and a ladder?",
      answerMD:
        "No. At most one jump may start from a cell. The Board rejects duplicate jump starts during setup.",
    },
    {
      question: "Can jumps chain if the destination also has a jump?",
      answerMD:
        "Not in the base design. Apply at most one jump for the landing cell. Chained jumps are a documented variant.",
    },
    {
      question: "Where do dice rolls come from?",
      answerMD:
        "From an injected Dice strategy. RandomDice is production friendly; tests can provide a fixed-sequence Dice implementation.",
    },
    {
      question: "Do we need persistence or multiplayer networking?",
      answerMD:
        "No for the core LLD. Keep the engine in memory and expose events so external adapters can persist or broadcast later.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Game {",
    "        -Board board",
    "        -Dice dice",
    "        -Queue~Player~ players",
    "        -Player winner",
    "        +start() Player",
    "        +playTurn() void",
    "        +getWinner() Player",
    "    }",
    "    class Board {",
    "        -int dimension",
    "        -Map~Integer,Jump~ jumps",
    "        +getFinalCell() int",
    "        +addJump(Jump) void",
    "        +targetAfterRoll(int, int) int",
    "        +move(int, int) int",
    "        +getJumpAt(int) Jump",
    "    }",
    "    class Jump {",
    "        -int start",
    "        -int end",
    "        +isSnake() boolean",
    "        +isLadder() boolean",
    "        +describe() String",
    "    }",
    "    class Dice {",
    "        <<interface>>",
    "        +roll() int",
    "    }",
    "    class RandomDice {",
    "        -int sides",
    "        -Random random",
    "        +roll() int",
    "    }",
    "    class Player {",
    "        -String name",
    "        -int position",
    "        +getName() String",
    "        +getPosition() int",
    "        +setPosition(int) void",
    "    }",
    "    Game --> Board",
    "    Game ..> Dice",
    "    Game o-- Player",
    "    Board o-- Jump",
    "    Dice <|.. RandomDice",
  ].join("\n"),
  classDiagramCaptionMD:
    "The diagram mirrors the shipped Java core. Factory Method and Observer are interview-ready seams around this core: board construction wraps Board.addJump, and Game.announce is the event publication point.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Driver",
    "    participant Game",
    "    participant Dice",
    "    participant Board",
    "    participant Player",
    "    Driver->>Game: playTurn",
    "    Game->>Game: poll next player",
    "    Game->>Dice: roll",
    "    Dice-->>Game: roll value",
    "    Game->>Board: targetAfterRoll before roll",
    "    Board-->>Game: target cell",
    "    Game->>Board: getJumpAt target",
    "    Board-->>Game: jump or none",
    "    Game->>Player: setPosition final cell",
    "    Game->>Game: announce move",
    "    alt final cell reached",
    "        Game->>Game: set winner",
    "        Game->>Game: print win",
    "    else game continues",
    "        Game->>Game: offer player to queue tail",
    "    end",
    "    Game-->>Driver: turn complete",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "One turn is a small pipeline: dequeue, roll, calculate target, resolve one jump, update position, publish events, then either declare the winner or rotate the player to the tail.",

  entities: [
    {
      name: "Game",
      responsibilityMD:
        "Aggregate root for a running match. Owns the Board, the Dice strategy, the player queue, and the winner state.",
      attributes: ["board", "dice", "players", "winner"],
    },
    {
      name: "Board",
      responsibilityMD:
        "Owns board dimension and jump lookup. It validates jump placement, calculates overshoot behavior, and resolves landing-cell jumps.",
      attributes: ["dimension", "jumps"],
    },
    {
      name: "Jump",
      responsibilityMD:
        "Immutable value object for a snake or ladder. Direction is derived from start and end rather than stored as a separate flag.",
      attributes: ["start", "end", "isSnake", "isLadder"],
    },
    {
      name: "Dice",
      responsibilityMD:
        "Strategy interface for dice rolls. Game depends on this abstraction, not on randomness.",
      attributes: ["roll"],
    },
    {
      name: "RandomDice",
      responsibilityMD:
        "Default Dice implementation that returns a uniformly random value from one to the configured number of sides.",
      attributes: ["sides", "random"],
    },
    {
      name: "Player",
      responsibilityMD:
        "Mutable participant state: a validated name and the current board position, starting from cell 1.",
      attributes: ["name", "position"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "Dice is injected into Game, so random production rolls and deterministic test rolls share the same turn engine.",
    },
    {
      name: "Factory Method",
      whyMD:
        "Board setup belongs in a factory method that returns a fully configured Board from a named layout or config. Game should receive a ready Board and never know how snakes and ladders were authored.",
    },
    {
      name: "Observer",
      whyMD:
        "Move, jump, and win announcements should be events. The reference code has a single announce seam; production code should notify observers from that seam instead of coupling Game to console, UI, or storage.",
    },
  ],

  designSteps: [
    {
      title: "Start with board invariants",
      detailMD:
        "Board owns the dimension, final cell, and jump map. It rejects invalid starts, duplicate jump starts, and endpoints outside the board during setup so Game can trust the layout.",
    },
    {
      title: "Model snakes and ladders as one Jump value object",
      detailMD:
        "A snake and a ladder differ only by direction. If end is smaller than start it is a snake; if end is larger it is a ladder. This avoids parallel Snake and Ladder classes with duplicated fields.",
    },
    {
      title: "Inject dice as a Strategy",
      detailMD:
        "Game calls Dice.roll and does not care whether the implementation is RandomDice, a fixed-sequence test dice, or a weighted dice variant.",
      code: [
        "public interface Dice {",
        "    int roll();",
        "}",
        "",
        "public class RandomDice implements Dice {",
        "    public int roll() {",
        "        return random.nextInt(sides) + 1;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Resolve a turn in one place",
      detailMD:
        "Game.playTurn should poll the queue, roll once, ask Board for the target, apply one jump if present, update the player, then either set the winner or offer the player back to the queue tail.",
      code: [
        "Player player = players.poll();",
        "int before = player.getPosition();",
        "int roll = dice.roll();",
        "int target = board.targetAfterRoll(before, roll);",
        "Jump jump = board.getJumpAt(target);",
        "int after = jump == null ? target : jump.getEnd();",
        "player.setPosition(after);",
      ].join("\n"),
    },
    {
      title: "Centralize layout creation in a Factory Method",
      detailMD:
        "The core implementation exposes Board.addJump. In an interview, wrap repeated setup in a factory method so named boards, tests, and config-driven layouts do not duplicate construction logic.",
      code: [
        "public static Board classicBoard() {",
        "    Board board = new Board(10);",
        "    board.addJump(new Jump(4, 25));",
        "    board.addJump(new Jump(14, 7));",
        "    return board;",
        "}",
      ].join("\n"),
    },
    {
      title: "Publish events from a single seam",
      detailMD:
        "The reference Game uses announce for console messages. Treat that as the Observer seam: notify listeners on move, jump, and win without letting observers mutate Board or Player state.",
    },
  ],

  implementation: referenceFiles("design-snake-and-ladder"),

  classExplanations: [
    {
      className: "Jump",
      detailMD:
        "Immutable value object with start and end cells. It validates positive positions, rejects no-op jumps, derives snake or ladder direction, and provides a human-readable description.",
    },
    {
      className: "Board",
      detailMD:
        "Owns board dimension and a map from jump start cell to Jump. It validates jumps, exposes final cell, handles overshoot by keeping the player in place, and resolves one jump after a roll.",
    },
    {
      className: "Dice",
      detailMD:
        "Small Strategy interface with one roll method. This is the main testability seam because Game depends only on Dice, not on RandomDice.",
    },
    {
      className: "RandomDice",
      detailMD:
        "Default Dice implementation. It validates that the dice has at least two sides and returns a one-based random roll using java.util.Random.",
    },
    {
      className: "Player",
      detailMD:
        "Mutable participant object. It validates the name, starts every player at cell 1, exposes the current position, and guards against non-positive positions.",
    },
    {
      className: "Game",
      detailMD:
        "Coordinates the match. It stores players in a LinkedList-backed Queue, rolls the injected dice, asks Board for target and jump data, updates the current player, announces the move, sets the winner at the final cell, and otherwise rotates the player to the queue tail.",
    },
  ],

  dryRun: {
    inputMD:
      "10 by 10 board with ladder 4 to 25 and snake 14 to 7. Queue is Asha then Ben. Dice is deterministic for demonstration; the final row is a condensed late-game turn with Asha at 97.",
    columns: ["Turn", "Player", "Roll", "Before", "Resolution", "Queue after turn"],
    rows: [
      ["1", "Asha", "3", "1", "lands on 4, ladder moves to 25", "Ben, Asha"],
      ["2", "Ben", "5", "1", "moves to 6, no jump", "Asha, Ben"],
      ["3", "Asha", "6", "25", "moves to 31, no jump", "Ben, Asha"],
      ["4", "Ben", "2", "6", "moves to 8, no jump", "Asha, Ben"],
      ["5", "Asha", "4", "31", "moves to 35, no jump", "Ben, Asha"],
      ["6", "Ben", "6", "8", "lands on 14, snake moves to 7", "Asha, Ben"],
      ["7", "Asha", "3", "97", "moves to 100, final cell reached", "game ends"],
    ],
    narrativeMD:
      "The same turn pipeline handles a ladder, a snake, a normal move, and the winning move. The queue rotates only when the player has not won.",
  },

  complexity: [
    {
      operation: "addJump during setup",
      time: "O(1)",
      space: "O(1)",
      note: "Hash map insert after constant-time validation.",
    },
    {
      operation: "playTurn",
      time: "O(1)",
      space: "O(1)",
      note: "Queue poll, dice roll, one jump lookup, one position update, and queue offer.",
    },
    {
      operation: "start",
      time: "O(T)",
      space: "O(1)",
      note: "T is the number of turns until a player reaches the final cell.",
    },
    {
      operation: "board setup",
      time: "O(J + P)",
      space: "O(J + P)",
      note: "J jumps stored in Board and P players stored in the game queue.",
    },
  ],
  complexityNotesMD:
    "The hot path is already constant time because the board uses a jump map instead of scanning snakes and ladders. The unbounded part of the game is not per-turn cost; it is the random number of turns before an exact finish.",

  extensibility: [
    {
      label: "Deterministic tests",
      detailMD:
        "Add a FixedDice or ScriptedDice implementation. Game needs no change because it already depends on the Dice interface.",
    },
    {
      label: "Config-driven boards",
      detailMD:
        "Move setup into BoardFactory.fromConfig so boards can be loaded from JSON, a database, or interview fixtures while preserving Board validation.",
    },
    {
      label: "Event subscribers",
      detailMD:
        "Replace console printing in announce with GameEventObserver callbacks for UI rendering, audit logs, metrics, or replay recording.",
    },
    {
      label: "Rule variants",
      detailMD:
        "Support chained jumps, extra turns on rolling six, or bouncing back from the final cell by adding a MovementRule strategy around Board.move.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Separate Snake and Ladder subclasses",
      detailMD:
        "Create Snake and Ladder classes instead of one Jump value object.",
      tradeoffsMD:
        "This can make direction explicit, but it duplicates start and end validation and adds polymorphism without meaningful behavior differences in the base problem.",
    },
    {
      name: "Board owns player positions",
      detailMD:
        "Store player positions in Board rather than in Player.",
      tradeoffsMD:
        "It centralizes all state, but Board becomes responsible for both layout and gameplay. Keeping position on Player makes Board reusable for many games.",
    },
    {
      name: "Recursive jump resolution",
      detailMD:
        "Keep following jumps until a cell without a jump is reached.",
      tradeoffsMD:
        "Useful for a variant, but it needs cycle detection and differs from the simpler one-jump rule most interviews expect.",
    },
    {
      name: "Event bus instead of direct observers",
      detailMD:
        "Publish GameEvent objects to a central event bus.",
      tradeoffsMD:
        "Better for large applications with many subscribers, but direct observers are easier to reason about in a focused LLD interview.",
    },
  ],

  commonMistakes: [
    "Hard-coding RandomDice inside Game, making deterministic tests painful.",
    "Representing snakes and ladders as two unrelated maps and forgetting to enforce one jump per start cell.",
    "Moving past the final cell instead of staying in place on overshoot.",
    "Re-queuing the winning player and continuing the game after a winner is set.",
    "Letting UI or console code calculate movement rules instead of observing game events.",
    "Putting board setup directly in Game.playTurn instead of constructing a valid Board before the game starts.",
    "Applying chained jumps accidentally when the requirement says only the first landing cell jump applies.",
  ],

  followUps: [
    {
      question: "How would you test a winning path deterministically?",
      answerMD:
        "Inject a ScriptedDice with a known roll sequence, create a small board through a factory method, call playTurn repeatedly, and assert winner plus final positions.",
    },
    {
      question: "How do you support an extra turn when a player rolls six?",
      answerMD:
        "Extract queue-rotation policy into a TurnRule strategy. After a move, the rule decides whether the same player stays at the front or moves to the tail.",
    },
    {
      question: "How would you persist a game or support replay?",
      answerMD:
        "Record move events emitted by the Observer seam: player, before, roll, target, jump, after, and whether the move won. Replaying events reconstructs visible state.",
    },
    {
      question: "What changes if the board is not 10 by 10?",
      answerMD:
        "Nothing in Game. Board already derives final cell from dimension squared and validates jumps against that final cell.",
    },
    {
      question: "How would you prevent invalid board configs from reaching production?",
      answerMD:
        "Keep validation in Board.addJump, run BoardFactory validation at startup, and fail fast if a config has duplicate starts or out-of-range endpoints.",
    },
  ],

  productionConsiderations: [
    {
      label: "Configuration validation",
      detailMD:
        "Validate board files at startup and expose clear errors for duplicate jump starts, invalid endpoints, or impossible dimensions.",
    },
    {
      label: "Observability",
      detailMD:
        "Emit move and win events with game id, player id, roll, before, target, jump, and after fields so debugging and replay are straightforward.",
    },
    {
      label: "Fair randomness",
      detailMD:
        "Use a well-scoped random source, avoid sharing mutable Random unsafely across threads, and log dice strategy configuration for audits.",
    },
    {
      label: "Concurrency boundary",
      detailMD:
        "A single in-memory Game should process one turn at a time. If exposed over an API, protect playTurn with a per-game lock or command queue.",
    },
    {
      label: "Persistence and recovery",
      detailMD:
        "Store initial board config plus ordered events. On restart, rebuild Board through the factory and replay accepted moves to restore positions.",
    },
  ],

  interviewNotes: [
    "Do you inject Dice instead of creating randomness inside Game?",
    "Do you keep jump validation and overshoot rules inside Board?",
    "Do you model turn order as a queue and rotate only non-winning players?",
    "Do you separate board setup from game execution through a factory method?",
    "Do you expose move and win notifications as observations rather than mixing UI with rules?",
    "Can you explain why one Jump class is enough for both snakes and ladders?",
  ],

  quiz: [
    {
      question: "Why should Game depend on the Dice interface instead of RandomDice directly?",
      options: [
        "It lets tests and production provide different roll strategies without changing Game",
        "It makes every dice roll faster than a method call",
        "It removes the need for a Board",
        "It guarantees a player will eventually win",
      ],
      answerIndex: 0,
      explanationMD:
        "This is the Strategy pattern. The turn engine consumes a roll and stays independent of how the roll is generated.",
    },
    {
      question: "What should happen when a player at 98 rolls 5 on a 100-cell board?",
      options: [
        "Move to 103 and then clamp to 100",
        "Stay at 98 because the roll overshoots the final cell",
        "Move backward to 95",
        "Skip the next player automatically",
      ],
      answerIndex: 1,
      explanationMD:
        "The stated rule is exact finish. Board.targetAfterRoll returns the current position when the target is beyond the final cell.",
    },
    {
      question: "Why is a single Jump class enough for snakes and ladders?",
      options: [
        "Because direction is derived from whether end is below or above start",
        "Because snakes and ladders must always have the same length",
        "Because the dice decides whether a jump is valid",
        "Because the player queue stores jump direction",
      ],
      answerIndex: 0,
      explanationMD:
        "Both concepts share start and end cells. Direction-specific behavior is simply isSnake or isLadder.",
    },
    {
      question: "Where should standard board layouts be constructed?",
      options: [
        "Inside Game.playTurn",
        "Inside Player.setPosition",
        "In a BoardFactory or setup factory method before Game starts",
        "Inside RandomDice.roll",
      ],
      answerIndex: 2,
      explanationMD:
        "Factory Method keeps setup separate from gameplay and gives tests a reusable way to create valid boards.",
    },
    {
      question: "What is the best Observer seam in the reference Game class?",
      options: [
        "The announce method that currently prints move details",
        "The Board constructor",
        "The Jump.isSnake method",
        "The RandomDice constructor",
      ],
      answerIndex: 0,
      explanationMD:
        "announce is already centralized around move output. Replacing its body with listener notifications keeps rules unchanged.",
    },
  ],

  practiceVariants: [
    {
      title: "Scripted dice and replay tests",
      detailMD:
        "Implement a Dice that returns a fixed queue of rolls, then write tests for ladder, snake, overshoot, and exact win scenarios.",
      difficulty: "Beginner",
    },
    {
      title: "Configurable BoardFactory",
      detailMD:
        "Create a factory that reads dimension and jump pairs from a config object, calls Board.addJump, and fails fast on invalid layouts.",
      difficulty: "Intermediate",
    },
    {
      title: "Observer-based scoreboard",
      detailMD:
        "Add GameEventObserver implementations for console logs and an in-memory scoreboard without letting observers change move outcomes.",
      difficulty: "Intermediate",
    },
    {
      title: "Advanced turn rules",
      detailMD:
        "Add extra turns on rolling six and a maximum consecutive-six rule. Keep queue logic isolated behind a TurnRule strategy.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "Which pattern makes dice pluggable?",
      back: "Strategy. Game depends on Dice, while RandomDice or ScriptedDice supplies the roll behavior.",
    },
    {
      front: "Where does overshoot logic belong?",
      back: "In Board.targetAfterRoll, because Board owns final-cell knowledge.",
    },
    {
      front: "How is turn order represented?",
      back: "A Queue of Player objects. Poll the current player and offer the player back only if they did not win.",
    },
    {
      front: "Why use one Jump class?",
      back: "Snake versus ladder is derived from start and end direction, so separate classes add little value for the base rules.",
    },
    {
      front: "What does the board setup factory protect?",
      back: "It keeps layout construction and validation outside the turn engine and makes named boards reusable.",
    },
    {
      front: "What should observers receive?",
      back: "Move and win facts such as player, roll, before, target, jump, after, and winner, without authority to mutate the game.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** Game, Board, Jump, Dice, RandomDice, Player, plus setup and event seams.",
    "",
    "**Patterns:** Strategy for Dice, Factory Method for board setup, Observer for move and win events.",
    "",
    "**Turn flow:** poll player → roll dice → compute target → apply one jump → set position → publish event → win or re-queue.",
    "",
    "**Invariants:** final cell is dimension squared; jump starts are unique; jumps cannot start at first or final cell; overshoot keeps the player in place; winner is not re-queued.",
    "",
    "**Complexity:** setup O(J + P) space; each turn O(1) time with a jump map; full game O(T) turns until win.",
    "",
    "**Extensions:** scripted dice, config BoardFactory, event observers, chained jumps, extra-turn rules, persisted event replay.",
  ].join("\n"),

  references: [
    {
      title: "Head First Design Patterns",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Effective Java",
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
    { slug: "tic-tac-toe", note: "Another small board game focused on clean move and win detection." },
    { slug: "ludo", note: "A richer dice-and-turn game with more complex token movement rules." },
    { slug: "chess", note: "A board game where rule objects and move validation become much deeper." },
  ],
};
