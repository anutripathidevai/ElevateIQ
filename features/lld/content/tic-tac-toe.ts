import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

export const ticTacToe: LLDProblemContent = {
  slug: "tic-tac-toe",

  statementMD: [
    "Design the object model for a **generic N×N Tic-Tac-Toe engine**.",
    "Two players take turns placing their piece type on an empty cell, the game",
    "rejects illegal moves, detects wins efficiently, and ends in either a win",
    "or a draw.",
    "",
    "The design should be reusable beyond the classic 3×3 board. The board size",
    "and target line length are configurable, the win rule is pluggable, and the",
    "core model stays independent of UI, networking, storage, or bots.",
  ].join("\n"),

  businessContextMD: [
    "Tic-Tac-Toe is a favorite beginner LLD interview problem in Amazon, Google,",
    "and Adobe style rounds because it looks small but exposes the fundamentals:",
    "entity boundaries, turn management,",
    "state transitions, validation, and algorithmic win detection. Strong answers",
    "avoid scanning the whole board after every move and instead update row,",
    "column, and diagonal counters from the last move.",
    "",
    "Interviewers use this problem to check whether you can keep the game engine",
    "clean while leaving seams for other grid games such as Connect Four, Gomoku,",
    "or configurable tournament modes.",
  ].join("\n"),

  functionalRequirements: [
    "Create an N×N board where N is at least 3.",
    "Support exactly two players, each with a distinct piece type such as X or O.",
    "Allow only the current player to place a piece on an empty, in-bounds cell.",
    "Reject moves outside the board, moves on occupied cells, and moves after the game is complete.",
    "Detect a win across a row, column, main diagonal, anti-diagonal, or configurable target-length run.",
    "Detect a draw when all cells are filled and no winning move has occurred.",
    "Expose the current player, game state, winner, and board marks for a UI or API layer.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Efficient win detection",
      detailMD:
        "For the classic target equals board size case, a move updates row, column, and diagonal counters in O(1) instead of rescanning the board.",
    },
    {
      label: "Correct state transitions",
      detailMD:
        "The game must move from IN_PROGRESS to exactly one terminal state, WIN or DRAW, and must never accept another move afterward.",
    },
    {
      label: "Encapsulation",
      detailMD:
        "Board bounds, cell occupancy, player marks, and move ordering are guarded inside domain objects rather than trusted to callers.",
    },
    {
      label: "Extensibility",
      detailMD:
        "Win rules, player creation, and piece creation should be replaceable without rewriting the main game loop.",
    },
    {
      label: "Thread safety per game",
      detailMD:
        "A single game can serialize play calls so two clients cannot place into the same turn concurrently.",
    },
  ],

  requirementClarification: [
    {
      question: "Is the board always 3×3?",
      answerMD:
        "No. Model a square board of size N where N is at least 3. The default interview version can use target N, and the implementation also accepts any target from 3 through N.",
    },
    {
      question: "How many players and piece types are required?",
      answerMD:
        "Exactly two players in the base design. Each player must have a distinct non-empty mark. X and O are the default piece types.",
    },
    {
      question: "Should the engine include a UI, command line loop, or network API?",
      answerMD:
        "No. The LLD focus is the in-memory game engine. UI, API, and persistence layers should call the game model through a small adapter.",
    },
    {
      question: "Do we need undo or move history?",
      answerMD:
        "Not in the base requirements. The current counting strategy is one-way; undo can be added by storing moves and making the strategy support rollback.",
    },
    {
      question: "Can the last move both fill the board and win?",
      answerMD:
        "Yes. Always check the win condition before declaring a draw, because the final empty cell might complete a line.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Game {",
    "        -Board board",
    "        -List~Player~ players",
    "        -WinningStrategy winningStrategy",
    "        -int currentPlayerIndex",
    "        -int moveCount",
    "        -GameState state",
    "        -Player winner",
    "        +play(int,int) GameState",
    "        +currentPlayer() Player",
    "        +getState() GameState",
    "        +getWinner() Player",
    "    }",
    "    class Board {",
    "        -int size",
    "        -CellMatrix cells",
    "        +place(int,int,Mark) void",
    "        +markAt(int,int) Mark",
    "        +isInside(int,int) boolean",
    "        +size() int",
    "    }",
    "    class Cell {",
    "        -int row",
    "        -int col",
    "        -Mark mark",
    "        +place(Mark) void",
    "        +isEmpty() boolean",
    "        +getMark() Mark",
    "    }",
    "    class Player {",
    "        -String id",
    "        -String name",
    "        -Mark mark",
    "        +getMark() Mark",
    "    }",
    "    class Mark {",
    "        <<enumeration>>",
    "        X",
    "        O",
    "        EMPTY",
    "        +score() int",
    "        +isPlayerMark() boolean",
    "    }",
    "    class GameState {",
    "        <<enumeration>>",
    "        IN_PROGRESS",
    "        WIN",
    "        DRAW",
    "    }",
    "    class WinningStrategy {",
    "        <<interface>>",
    "        +isWinningMove(Board,int,int,Mark) boolean",
    "    }",
    "    class CountingWinningStrategy {",
    "        -int size",
    "        -int target",
    "        -IntArray rows",
    "        -IntArray cols",
    "        -int diagonal",
    "        -int antiDiagonal",
    "        +isWinningMove(Board,int,int,Mark) boolean",
    "    }",
    "    Game o-- Board",
    "    Game o-- Player",
    "    Game --> GameState",
    "    Game ..> WinningStrategy",
    "    Board o-- Cell",
    "    Cell --> Mark",
    "    Player --> Mark",
    "    WinningStrategy <|.. CountingWinningStrategy",
  ].join("\n"),
  classDiagramCaptionMD:
    "Game is the aggregate root. Board owns Cells, Player owns a Mark, and Game delegates all win detection to the WinningStrategy interface.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant Game",
    "    participant Board",
    "    participant Cell",
    "    participant Strategy as WinningStrategy",
    "    Client->>Game: play(row, col)",
    "    Game->>Game: verify state is IN_PROGRESS",
    "    Game->>Game: select current player",
    "    Game->>Board: place(row, col, mark)",
    "    Board->>Cell: place(mark)",
    "    Cell-->>Board: placed",
    "    Board-->>Game: move accepted",
    "    Game->>Strategy: isWinningMove(board, row, col, mark)",
    "    alt winning move",
    "        Strategy-->>Game: true",
    "        Game->>Game: set winner and state WIN",
    "    else board full",
    "        Strategy-->>Game: false",
    "        Game->>Game: set state DRAW",
    "    else continue",
    "        Strategy-->>Game: false",
    "        Game->>Game: rotate current player",
    "    end",
    "    Game-->>Client: GameState",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "The move flow is intentionally serial: validate game state, place the mark, ask the strategy whether the last move won, then update state or rotate turns.",

  entities: [
    {
      name: "Game",
      responsibilityMD:
        "Aggregate root for one match. It owns the board, players, current turn, move count, state, winner, and the injected win strategy.",
      attributes: ["board", "players", "winningStrategy", "currentPlayerIndex", "moveCount", "state", "winner"],
    },
    {
      name: "Board",
      responsibilityMD:
        "Owns the square cell matrix, validates coordinates, delegates placement to the correct cell, and exposes mark reads for strategies.",
      attributes: ["size", "cells"],
    },
    {
      name: "Cell",
      responsibilityMD:
        "Stores immutable coordinates and the current mark. It rejects overwrites and rejects the EMPTY mark as a playable piece.",
      attributes: ["row", "col", "mark"],
    },
    {
      name: "Player",
      responsibilityMD:
        "Represents a participant with id, display name, and a non-empty mark. Game uses players only for turn order and marks.",
      attributes: ["id", "name", "mark"],
    },
    {
      name: "Mark",
      responsibilityMD:
        "Piece type enum. X contributes +1, O contributes -1, and EMPTY contributes 0 so counting-based win detection stays compact.",
      attributes: ["X", "O", "EMPTY", "score"],
    },
    {
      name: "GameState",
      responsibilityMD:
        "Explicit lifecycle state for the match: IN_PROGRESS while moves are allowed, WIN after a winner is found, and DRAW when the board fills.",
      attributes: ["IN_PROGRESS", "WIN", "DRAW"],
    },
    {
      name: "WinningStrategy",
      responsibilityMD:
        "Rule interface that decides whether the latest move has ended the game. Game depends on this abstraction rather than a hard-coded algorithm.",
      attributes: ["isWinningMove"],
    },
    {
      name: "CountingWinningStrategy",
      responsibilityMD:
        "Default rule implementation. It maintains row, column, and diagonal counters and can also scan from the last move for target lengths smaller than the board.",
      attributes: ["rows", "cols", "diagonal", "antiDiagonal", "target"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "WinningStrategy isolates the rule for deciding a winning move. Game stays unchanged whether the rule is classic Tic-Tac-Toe, target K in a row, or another grid-game policy.",
    },
    {
      name: "State",
      whyMD:
        "GameState makes the lifecycle explicit. Game checks IN_PROGRESS before every move and transitions once to WIN or DRAW, preventing illegal moves after completion.",
    },
    {
      name: "Factory Method",
      whyMD:
        "Player and piece creation belong at the setup boundary. A factory method can map request data to validated Player objects and Mark values, while Game receives already-valid participants and never parses input formats.",
    },
  ],

  designSteps: [
    {
      title: "Model piece types with scores",
      detailMD:
        "The Mark enum is more than a label. X is +1 and O is -1, which lets the counting strategy detect a full line by checking the absolute counter value.",
      code: [
        "public enum Mark {",
        "    X(1),",
        "    O(-1),",
        "    EMPTY(0);",
        "",
        "    private final int score;",
        "",
        "    Mark(int score) {",
        "        this.score = score;",
        "    }",
        "",
        "    public int score() {",
        "        return score;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Let cells and board guard placement",
      detailMD:
        "Board validates coordinates and Cell validates occupancy. The caller cannot overwrite a move or place EMPTY because the invariant is protected at the object that owns the state.",
      code: [
        "public void place(Mark nextMark) {",
        "    if (!isEmpty()) {",
        "        throw new IllegalStateException(\"Cell is already occupied\");",
        "    }",
        "    if (nextMark == Mark.EMPTY) {",
        "        throw new IllegalArgumentException(\"Cannot place EMPTY\");",
        "    }",
        "    mark = nextMark;",
        "}",
      ].join("\n"),
    },
    {
      title: "Make the game loop the single turn boundary",
      detailMD:
        "Game.play is synchronized, checks that the match is still active, places the current player's mark, and updates either winner, draw, or next player. Turn rotation never leaks to the UI.",
    },
    {
      title: "Put win detection behind a strategy",
      detailMD:
        "Game delegates to WinningStrategy after each accepted move. This is the key seam for variants: standard rows and diagonals, target K runs, forbidden moves, or a completely different grid game.",
    },
    {
      title: "Use counters for the classic efficient check",
      detailMD:
        "CountingWinningStrategy updates only the row, column, and diagonals touched by the latest move. When target equals board size, a win check is constant time.",
      code: [
        "rows[row] += value;",
        "cols[col] += value;",
        "if (row == col) diagonal += value;",
        "if (row + col == size - 1) antiDiagonal += value;",
        "",
        "return Math.abs(rows[row]) == target",
        "    || Math.abs(cols[col]) == target",
        "    || Math.abs(diagonal) == target",
        "    || Math.abs(antiDiagonal) == target;",
      ].join("\n"),
    },
    {
      title: "Check win before draw",
      detailMD:
        "After placement, increment move count and ask the strategy first. Only when there is no winner and move count equals N×N should the state become DRAW.",
    },
    {
      title: "Keep construction outside the game engine",
      detailMD:
        "A controller or factory method should create players and marks from request data before Game starts. That keeps parsing, validation messages, bot selection, and alternate pieces out of the core match logic.",
    },
  ],

  implementation: referenceFiles("design-tic-tac-toe"),

  classExplanations: [
    {
      className: "Mark",
      detailMD:
        "Enum for playable and empty piece values. Its score method powers the counter algorithm: X adds +1, O adds -1, and EMPTY is never accepted for a player move.",
    },
    {
      className: "Cell",
      detailMD:
        "Represents one board coordinate. Row and column are immutable, while mark changes from EMPTY to a player mark exactly once through the validated place method.",
    },
    {
      className: "Board",
      detailMD:
        "Owns the N×N Cell matrix. It enforces the minimum size, validates coordinates, delegates placement to Cell, exposes markAt for strategies, and offers isInside for directional scans.",
    },
    {
      className: "Player",
      detailMD:
        "Immutable player value object with id, name, and mark. The constructor rejects EMPTY and null fields so Game can assume both participants are valid.",
    },
    {
      className: "GameState",
      detailMD:
        "Small enum that models the match lifecycle. IN_PROGRESS allows moves; WIN and DRAW are terminal states enforced by Game.play.",
    },
    {
      className: "WinningStrategy",
      detailMD:
        "Interface for rule evaluation. It receives the board, latest row and column, and latest mark, allowing Game to delegate win detection without knowing the algorithm.",
    },
    {
      className: "CountingWinningStrategy",
      detailMD:
        "Stateful strategy bound to one game. It stores row and column arrays plus diagonal counters. For target equal to board size it checks counters in O(1); for smaller targets it scans four lines from the last move.",
    },
    {
      className: "Game",
      detailMD:
        "Coordinates the match. Its synchronized play method rejects completed games, places the current mark, increments move count, asks the strategy for a win, sets WIN or DRAW, otherwise rotates to the next player.",
    },
  ],

  dryRun: {
    inputMD:
      "3×3 board with target 3. Player A uses X and Player B uses O. Moves: A at (0,0), B at (0,1), A at (1,1), B at (0,2), A at (2,2).",
    columns: ["Step", "Current player", "Move", "Counter impact", "Result"],
    rows: [
      ["1", "A with X", "(0,0)", "row 0 +1, col 0 +1, diagonal +1", "IN_PROGRESS; next B"],
      ["2", "B with O", "(0,1)", "row 0 -1, col 1 -1", "IN_PROGRESS; next A"],
      ["3", "A with X", "(1,1)", "row 1 +1, col 1 +1, diagonal +1", "IN_PROGRESS; next B"],
      ["4", "B with O", "(0,2)", "row 0 -1, col 2 -1, anti-diagonal -1", "IN_PROGRESS; next A"],
      ["5", "A with X", "(2,2)", "row 2 +1, col 2 +1, diagonal +1", "WIN; winner A"],
    ],
    narrativeMD:
      "The diagonal counter reaches +3 on step 5, so the strategy returns true. Game sets the winner before checking whether the board is full.",
  },

  complexity: [
    {
      operation: "Create board",
      time: "O(N^2)",
      space: "O(N^2)",
      note: "The board materializes every Cell in the N×N grid.",
    },
    {
      operation: "play with target equal to N",
      time: "O(1)",
      space: "O(1)",
      note: "Placement, counter updates, state transition, and turn rotation are constant-time after board setup.",
    },
    {
      operation: "play with target less than N",
      time: "O(N)",
      space: "O(1)",
      note: "The strategy scans up to four lines from the latest move to find a target-length run.",
    },
    {
      operation: "Strategy storage",
      time: "O(1)",
      space: "O(N)",
      note: "Rows and columns require two arrays of length N plus two diagonal counters.",
    },
  ],
  complexityNotesMD:
    "The board itself is O(N^2). The important interview optimization is avoiding an O(N^2) scan after every move; the latest move contains enough information to check only affected lines.",

  extensibility: [
    {
      label: "Alternate win rules",
      detailMD:
        "Implement a new WinningStrategy for Gomoku, misere rules, blocked cells, or tournament-specific winning conditions.",
    },
    {
      label: "Different player types",
      detailMD:
        "Create human, bot, or remote players through a factory at setup time while keeping Game dependent only on Player and Mark.",
    },
    {
      label: "Move history and undo",
      detailMD:
        "Add a Move value object and an undo-aware strategy that can subtract the same counter values it added during play.",
    },
    {
      label: "Other grid games",
      detailMD:
        "Reuse Board, Cell, turn state, and strategy seams for games like Connect Four by changing placement rules and win strategy.",
    },
    {
      label: "Persistence and replay",
      detailMD:
        "Store accepted moves as an append-only log so games can be resumed, audited, or replayed without exposing mutable board internals.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Full-board scan after every move",
      detailMD:
        "After each placement, inspect every row, column, and diagonal to decide whether someone won.",
      tradeoffsMD:
        "Simpler to explain for 3×3, but it does unnecessary work and does not scale cleanly to larger boards.",
    },
    {
      name: "Immutable board snapshots",
      detailMD:
        "Represent each move as a new Board instance and keep the previous boards for undo, replay, or concurrent reads.",
      tradeoffsMD:
        "Great for history and debugging, but creates more objects and requires careful sharing to avoid O(N^2) copying per move.",
    },
    {
      name: "External rule engine",
      detailMD:
        "Move all state transitions and win rules into a GameRules service while Game stores only the current state.",
      tradeoffsMD:
        "Useful for a large multi-game platform, but over-engineered for a single interview problem and can make ownership blurry.",
    },
    {
      name: "Bitboard representation",
      detailMD:
        "Store each player's occupied cells as bits and use bit operations to test wins.",
      tradeoffsMD:
        "Very fast for fixed small boards, but harder to read, harder to generalize to arbitrary N, and less suitable for beginner LLD.",
    },
  ],

  commonMistakes: [
    "Scanning the whole board after every move instead of checking only affected row, column, and diagonals.",
    "Letting the UI decide whose turn it is, which splits game authority across layers.",
    "Checking draw before win and missing a final-move victory.",
    "Allowing a player to use EMPTY or allowing both players to share the same mark.",
    "Forgetting anti-diagonal detection where row plus column equals N minus 1.",
    "Allowing moves after WIN or DRAW because the state guard is missing.",
    "Sharing one stateful CountingWinningStrategy across multiple games, causing counters to leak between matches.",
  ],

  followUps: [
    {
      question: "How would you support Connect Four?",
      answerMD:
        "Keep the turn and state model, replace placement with gravity-based column placement, and inject a strategy that checks vertical, horizontal, and diagonal runs from the dropped piece.",
    },
    {
      question: "How would you add undo?",
      answerMD:
        "Store a stack of Move objects. Undo must clear the board cell, decrement move count, restore state to IN_PROGRESS, and roll back the strategy counters or rebuild them from history.",
    },
    {
      question: "Can the same strategy support target 4 on a 10×10 board?",
      answerMD:
        "Yes. Counters alone work when target equals board size. For smaller targets, scan outward from the latest move in four directions and count a continuous run.",
    },
    {
      question: "What happens if two clients submit moves at the same time?",
      answerMD:
        "The game should serialize play calls with a per-game lock. The reference Game.play method is synchronized, so only one move can update the board and turn state at a time.",
    },
    {
      question: "How would you run many games at once?",
      answerMD:
        "Create one Game instance per match and store them in a repository keyed by game id. Do not share mutable Board or CountingWinningStrategy instances across games.",
    },
  ],

  productionConsiderations: [
    {
      label: "Persistence",
      detailMD:
        "Persist game metadata and accepted moves, not just the final board. A move log enables replay, recovery, auditing, and dispute resolution.",
    },
    {
      label: "API concurrency",
      detailMD:
        "Use per-game locking or optimistic version checks so duplicate requests and racing clients cannot skip turns or place two marks at once.",
    },
    {
      label: "Validation and abuse handling",
      detailMD:
        "Return clear errors for invalid turns, occupied cells, out-of-range coordinates, and completed games. Rate-limit automated clients in multiplayer settings.",
    },
    {
      label: "Observability",
      detailMD:
        "Track active games, invalid move rate, average game length, draw rate, and strategy errors so production issues are visible.",
    },
    {
      label: "Bot and matchmaking boundaries",
      detailMD:
        "Keep AI and matchmaking outside Game. They choose a legal move, then submit it through the same play method as a human player.",
    },
  ],

  interviewNotes: [
    "Did you make Game the single authority for turns and terminal states?",
    "Did you check win before draw on the final move?",
    "Did you use row, column, and diagonal counters instead of scanning the whole board?",
    "Did you put win detection behind a Strategy interface so variants are additive?",
    "Did you call out the stateful nature of CountingWinningStrategy and keep one instance per game?",
    "Did you keep player and piece creation at the setup boundary rather than inside the move loop?",
  ],

  quiz: [
    {
      question: "Why does Mark assign X a score of +1 and O a score of -1?",
      options: [
        "So row, column, and diagonal counters can identify a full line by absolute value",
        "So X always plays before O",
        "So the board can store fewer cells",
        "So the UI can color the marks automatically",
      ],
      answerIndex: 0,
      explanationMD:
        "A line of all X reaches +target and a line of all O reaches -target. Taking the absolute value detects either winner with the same counter logic.",
    },
    {
      question: "Why should Game check for a win before checking for a draw?",
      options: [
        "Because draw checking is slower",
        "Because a final move can fill the board and complete a winning line",
        "Because GameState cannot represent draw",
        "Because Player owns the board",
      ],
      answerIndex: 1,
      explanationMD:
        "The last empty cell might be the winning move. If draw is checked first, the engine can incorrectly hide a valid win.",
    },
    {
      question: "What is the main benefit of WinningStrategy?",
      options: [
        "It stores player names",
        "It removes the need for a Board",
        "It lets Game swap win rules without changing the turn-management code",
        "It makes invalid coordinates valid",
      ],
      answerIndex: 2,
      explanationMD:
        "This is Strategy: Game delegates the variable rule, so standard Tic-Tac-Toe and other grid-game rules can share the same match orchestration.",
    },
    {
      question: "Which state transition is valid after a non-winning move that does not fill the board?",
      options: [
        "IN_PROGRESS to WIN",
        "IN_PROGRESS to DRAW",
        "DRAW to IN_PROGRESS",
        "Remain IN_PROGRESS and rotate the current player",
      ],
      answerIndex: 3,
      explanationMD:
        "The game is still active, so only the current player index changes. Terminal states are reserved for a win or a full-board draw.",
    },
    {
      question: "Which data structure makes classic N-in-a-row checking efficient?",
      options: [
        "A sorted set of player names",
        "Row counters, column counters, and two diagonal counters",
        "A queue of previous winners",
        "A map from score to board size",
      ],
      answerIndex: 1,
      explanationMD:
        "Only the row, column, and diagonals touched by the latest move can change, so those counters are enough for target equal to N.",
    },
  ],

  practiceVariants: [
    {
      title: "Add undo and replay",
      detailMD:
        "Introduce a Move class, store move history, and make the board plus winning strategy support rollback.",
      difficulty: "Intermediate",
    },
    {
      title: "Add a bot player",
      detailMD:
        "Create players through a factory and allow one player to choose moves through a BotStrategy while Game still validates every move.",
      difficulty: "Intermediate",
    },
    {
      title: "Design Connect Four",
      detailMD:
        "Reuse the turn and state model, but change placement to drop into a column and update the winning strategy for runs of four.",
      difficulty: "Advanced",
    },
    {
      title: "Support best-of-three matches",
      detailMD:
        "Add a Match aggregate that creates Games, tracks round winners, and declares an overall winner without bloating the Game class.",
      difficulty: "Beginner",
    },
  ],

  flashcards: [
    {
      front: "What owns turn management in this design?",
      back: "Game owns currentPlayerIndex and rotates it only after a valid non-terminal move.",
    },
    {
      front: "Why is WinningStrategy stateful in the reference solution?",
      back: "CountingWinningStrategy stores row, column, and diagonal counters that accumulate as moves are played.",
    },
    {
      front: "When is a draw declared?",
      back: "After a valid move, only if no win was found and moveCount equals board size squared.",
    },
    {
      front: "What does GameState protect?",
      back: "It prevents moves after terminal states and makes IN_PROGRESS, WIN, and DRAW explicit.",
    },
    {
      front: "Where should player and piece creation live?",
      back: "At the setup boundary, often behind factory methods, so Game receives validated Player and Mark objects.",
    },
    {
      front: "What invariant does Cell enforce?",
      back: "A cell can be filled once with a non-empty mark; overwrites and EMPTY placements are rejected.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** Game, Board, Cell, Player, Mark, GameState, WinningStrategy, CountingWinningStrategy.",
    "",
    "**Flow:** client calls play → Game verifies active state → Board places current mark → strategy checks latest move → Game sets WIN, DRAW, or rotates turn.",
    "",
    "**Win check:** for target N, update row, column, main diagonal, and anti-diagonal counters. A counter absolute value equal to N means the latest player won.",
    "",
    "**State:** IN_PROGRESS allows moves; WIN and DRAW are terminal. Always check win before draw.",
    "",
    "**Patterns:** Strategy for win rules, State for lifecycle, Factory Method at setup for player and piece creation.",
    "",
    "**Complexity:** board setup O(N^2), classic play O(1), target less than N play O(N), strategy storage O(N).",
    "",
    "**Pitfalls:** shared strategy instances, UI-managed turns, missing anti-diagonal, accepting EMPTY, moves after terminal state.",
  ].join("\n"),

  references: [
    {
      title: "Head First Design Patterns",
      kind: "Book",
      author: "Freeman & Robson",
    },
    {
      title: "Effective Java — Item 34, Use enums instead of int constants",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — Strategy Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/strategy",
    },
    {
      title: "Refactoring Guru — State Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/state",
    },
  ],

  relatedProblems: [
    { slug: "snake-and-ladder", note: "Another beginner game model focused on turns, board movement, and state." },
    { slug: "chess", note: "A richer board game where move validation and piece behavior become deeper strategy seams." },
    { slug: "parking-lot", note: "A beginner aggregate-root design with validation, state changes, and factory creation seams." },
  ],
};
