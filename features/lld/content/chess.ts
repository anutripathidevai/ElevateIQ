import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

/**
 * Exemplar LLD problem — Design Chess.
 *
 * Reuses the reviewed Java from the practice bank and adds the advanced design walkthrough.
 */
export const chess: LLDProblemContent = {
  slug: "chess",

  statementMD: [
    "Design the object model for a **Chess** engine that supports two players moving pieces on an 8x8 board.",
    "The system must represent the board, all standard piece types, legal move validation, turn ownership, status transitions, and the history seam needed for undo or replay.",
    "The interview focus is not a UI or an online matchmaking service. It is the domain model: where rules live, how illegal moves are rejected before mutation, and how the game can grow from a clean core into castling, promotion, draw rules, timers, and persistence.",
  ].join("\n"),

  businessContextMD: [
    "Chess is an advanced LLD interview problem because the obvious model quickly becomes a giant conditional controller if responsibilities are misplaced.",
    "Strong candidates separate **Board** storage from **Piece** movement strategy, make **Game** the state machine, treat **Move** as the command request, and validate self-check on a candidate board before committing the real board.",
    "Amazon, Google, and Microsoft commonly use this style of game-design problem to test polymorphism, invariants, state transitions, and extensibility under a dense rule set.",
  ].join("\n"),

  functionalRequirements: [
    "Represent an 8x8 board with addressable, bounds-checked squares.",
    "Initialize a normal chess starting position for black and white pieces.",
    "Model players by name and color, with white moving first and turns alternating after valid moves.",
    "Support King, Queen, Rook, Bishop, Knight, and Pawn with per-type movement rules.",
    "Validate each move for game status, source occupancy, active-player ownership, destination bounds, piece geometry, blocked paths, legal capture, and self-check.",
    "Apply a move atomically only after every validation passes.",
    "Detect whether the next player is in check, checkmate, or stalemate after a valid move.",
    "Expose current player and game status so a UI, API, or test harness can observe the game without mutating it.",
    "Represent a move as a command-style object so a move log, replay, or undo stack can be layered on the same boundary.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Rule correctness",
      detailMD:
        "Illegal movement, own-piece capture, moving into check, and moving after the game is terminal must be rejected before the real board changes.",
    },
    {
      label: "Extensibility",
      detailMD:
        "Special rules such as castling, en passant, promotion, half-move draw counters, and variants should be additive validators or move effects, not edits to every piece.",
    },
    {
      label: "Encapsulation",
      detailMD:
        "**Board** owns placement and path queries; **Piece** owns movement geometry; **Game** owns turns, status transitions, and self-check validation.",
    },
    {
      label: "Deterministic behavior",
      detailMD:
        "Given the same starting position and move list, the engine should reach the same board and status. This makes replay, debugging, and tests straightforward.",
    },
    {
      label: "Interactive latency",
      detailMD:
        "A complete status update scans at most a fixed 8x8 board. Even a brute-force legal-move search is effectively constant time for standard chess.",
    },
  ],

  requirementClarification: [
    {
      question: "Which coordinate system should the design use?",
      answerMD:
        "Use zero-based **Square(row, col)** coordinates internally. Row 0 is black's back rank, row 7 is white's back rank, and presentation notation such as e4 can be translated at the boundary.",
    },
    {
      question: "Do we need castling, en passant, promotion, clocks, or draw-by-repetition in the first pass?",
      answerMD:
        "No. The core implementation ignores those tournament rules but keeps clear extension points: extra validators, richer move effects, and additional **GameStatus** values.",
    },
    {
      question: "Should **Board** know whose turn it is?",
      answerMD:
        "No. **Board** is a storage and query object. Turn ownership belongs to **Game**, which asks **Board** for pieces and then delegates movement geometry to those pieces.",
    },
    {
      question: "How exact should checkmate and stalemate detection be?",
      answerMD:
        "The reference implementation performs a high-level legal-move search: locate the king, test attacks by opposing pieces, then see whether any legal candidate move removes check or avoids stalemate.",
    },
    {
      question: "How should move history and undo be handled?",
      answerMD:
        "The base code models **Move** as the immutable command request. A production version would store executed moves with captured piece and prior status metadata so undo can reverse **moveUnchecked** safely.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class Game {",
    "        -Board board",
    "        -Player whitePlayer",
    "        -Player blackPlayer",
    "        -Color turn",
    "        -GameStatus status",
    "        +move(Move) void",
    "        +getCurrentPlayer() Player",
    "        +getStatus() GameStatus",
    "    }",
    "    class Board {",
    "        -PieceMatrix pieces",
    "        +isInside(Square) boolean",
    "        +get(Square) Piece",
    "        +place(Piece, Square) void",
    "        +moveUnchecked(Square, Square) void",
    "        +isPathClear(Square, Square) boolean",
    "        +occupiedSquares() List~Square~",
    "        +copy() Board",
    "        +setupStartingPosition() void",
    "    }",
    "    class Square {",
    "        -int row",
    "        -int col",
    "        +getRow() int",
    "        +getCol() int",
    "        +equals(Object) boolean",
    "        +hashCode() int",
    "    }",
    "    class Piece {",
    "        <<abstract>>",
    "        -Color color",
    "        +getColor() Color",
    "        +canMove(Board, Square, Square) boolean",
    "    }",
    "    class King",
    "    class Queen",
    "    class Rook",
    "    class Bishop",
    "    class Knight",
    "    class Pawn",
    "    class Move {",
    "        -Square from",
    "        -Square to",
    "        +getFrom() Square",
    "        +getTo() Square",
    "    }",
    "    class Player {",
    "        -String name",
    "        -Color color",
    "        +getName() String",
    "        +getColor() Color",
    "    }",
    "    class Color {",
    "        <<enumeration>>",
    "        WHITE",
    "        BLACK",
    "        +opposite() Color",
    "    }",
    "    class GameStatus {",
    "        <<enumeration>>",
    "        ACTIVE",
    "        WHITE_WON",
    "        BLACK_WON",
    "        STALEMATE",
    "    }",
    "    Game o-- Board",
    "    Game --> Player",
    "    Game --> Move",
    "    Game ..> GameStatus",
    "    Game ..> Color",
    "    Board o-- Piece",
    "    Board --> Square",
    "    Move --> Square",
    "    Piece --> Color",
    "    Player --> Color",
    "    Piece <|-- King",
    "    Piece <|-- Queen",
    "    Piece <|-- Rook",
    "    Piece <|-- Bishop",
    "    Piece <|-- Knight",
    "    Piece <|-- Pawn",
  ].join("\n"),
  classDiagramCaptionMD:
    "The diagram mirrors the reference Java: **Game** coordinates state, **Board** stores placement, **Piece** subclasses own movement strategy, and **Move** carries the command request from one **Square** to another.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor User",
    "    participant G as Game",
    "    participant B as Board",
    "    participant P as Piece",
    "    participant C as CandidateBoard",
    "    User->>G: move(move)",
    "    G->>B: get(move.from)",
    "    B-->>G: piece",
    "    G->>G: validate status and ownership",
    "    G->>P: canMove(board, from, to)",
    "    P->>B: inspect target and path",
    "    B-->>P: movement facts",
    "    P-->>G: legal movement",
    "    G->>B: copy()",
    "    B-->>G: candidate",
    "    G->>C: moveUnchecked(from, to)",
    "    G->>G: isKingInCheck(candidate, turn)",
    "    alt move is safe",
    "        G->>B: moveUnchecked(from, to)",
    "        G->>G: updateStatus(next)",
    "        G-->>User: move accepted",
    "    else move is illegal",
    "        G-->>User: exception without board mutation",
    "    end",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "The real board changes only after movement rules and self-check are validated on a copied board. That ordering is the main correctness invariant.",

  entities: [
    {
      name: "Game",
      responsibilityMD:
        "Aggregate root and state machine. It validates moves, rejects terminal-game actions, prevents self-check, updates checkmate or stalemate, and alternates turns.",
      attributes: ["board", "whitePlayer", "blackPlayer", "turn", "status"],
    },
    {
      name: "Board",
      responsibilityMD:
        "Owns the 8x8 placement matrix and board-level queries such as bounds, path clearance, occupied squares, copying, and unchecked piece movement.",
      attributes: ["pieces"],
    },
    {
      name: "Square",
      responsibilityMD:
        "Immutable coordinate value object used by **Board**, **Move**, and search loops. Equality and hash code make coordinates safe as values.",
      attributes: ["row", "col"],
    },
    {
      name: "Piece",
      responsibilityMD:
        "Abstract base for color and shared target checks. Each subclass implements **canMove** as its movement strategy.",
      attributes: ["color", "canCaptureOrMoveTo"],
    },
    {
      name: "King",
      responsibilityMD:
        "Allows one-square movement in any direction and cannot stay on the same square. The broader rule that kings may not move into check is enforced by **Game**.",
      attributes: ["color"],
    },
    {
      name: "Queen",
      responsibilityMD:
        "Combines rook-like straight movement and bishop-like diagonal movement, requiring a clear path and a legal target.",
      attributes: ["color"],
    },
    {
      name: "Rook",
      responsibilityMD:
        "Moves horizontally or vertically with path clearance. This is the natural home for castling metadata in an extended design.",
      attributes: ["color"],
    },
    {
      name: "Bishop",
      responsibilityMD:
        "Moves diagonally with path clearance and legal capture checks.",
      attributes: ["color"],
    },
    {
      name: "Knight",
      responsibilityMD:
        "Moves in an L shape and ignores path clearance because it jumps over intervening pieces.",
      attributes: ["color"],
    },
    {
      name: "Pawn",
      responsibilityMD:
        "Encodes direction by color, starting-row double steps, forward movement into empty squares, and diagonal captures.",
      attributes: ["color", "direction", "startRow"],
    },
    {
      name: "Move",
      responsibilityMD:
        "Immutable command request from a source square to a destination square. It is intentionally small so history, replay, and undo metadata can wrap it.",
      attributes: ["from", "to"],
    },
    {
      name: "Player",
      responsibilityMD:
        "Human or bot identity associated with a color. It does not own pieces; board state does.",
      attributes: ["name", "color"],
    },
    {
      name: "GameStatus",
      responsibilityMD:
        "Closed state vocabulary for active play, white win, black win, and stalemate.",
      attributes: ["ACTIVE", "WHITE_WON", "BLACK_WON", "STALEMATE"],
    },
    {
      name: "Color",
      responsibilityMD:
        "Side enum with **opposite** to advance turns and choose the player being evaluated for check.",
      attributes: ["WHITE", "BLACK"],
    },
  ],

  patternsUsed: [
    {
      name: "Strategy",
      whyMD:
        "Movement varies by piece, but **Game** calls the same **Piece.canMove** interface. King, Queen, Rook, Bishop, Knight, and Pawn are interchangeable movement strategies behind the abstract base.",
    },
    {
      name: "Factory Method",
      whyMD:
        "The reference code centralizes initial piece creation inside **Board.setupStartingPosition** and **placeBackRank**. In production, that seam becomes a **PieceFactory** so variants, loaded positions, and promoted pieces are created without changing **Game**.",
    },
    {
      name: "State",
      whyMD:
        "**GameStatus** makes the game lifecycle explicit. **Game.updateStatus** transitions from **ACTIVE** to **WHITE_WON**, **BLACK_WON**, or **STALEMATE** after each accepted move.",
    },
    {
      name: "Command",
      whyMD:
        "**Move** is the command request consumed by **Game.move**. The base implementation executes it directly; undo and replay extend the same boundary by storing executed command metadata such as captured piece and previous status.",
    },
  ],

  designSteps: [
    {
      title: "Start with immutable coordinates and a storage-only board",
      detailMD:
        "Make **Square** a value object and keep **Board** focused on storage, bounds, path queries, copying, and unchecked mutation. Turn logic must not leak into **Board**.",
      code: [
        "public boolean isInside(Square square) {",
        "    return square.getRow() >= 0 && square.getRow() < 8",
        "        && square.getCol() >= 0 && square.getCol() < 8;",
        "}",
      ].join("\n"),
    },
    {
      title: "Push movement geometry into piece strategies",
      detailMD:
        "The abstract **Piece** exposes the common color and target helper, while each concrete piece implements exactly its own geometry. This avoids a large switch in **Game**.",
      code: [
        "public abstract class Piece {",
        "    private final Color color;",
        "    protected Piece(Color color) { this.color = color; }",
        "    public Color getColor() { return color; }",
        "    public abstract boolean canMove(Board board, Square from, Square to);",
        "}",
      ].join("\n"),
    },
    {
      title: "Model sliding, leaping, and pawn movement separately",
      detailMD:
        "Sliding pieces ask **Board.isPathClear**, knights skip path checks, and pawns combine color direction with occupancy-sensitive capture rules. Each rule stays local to the class that needs it.",
      code: [
        "public boolean canMove(Board board, Square from, Square to) {",
        "    int rowDelta = Math.abs(to.getRow() - from.getRow());",
        "    int colDelta = Math.abs(to.getCol() - from.getCol());",
        "    boolean diagonal = rowDelta == colDelta;",
        "    boolean straight = from.getRow() == to.getRow() || from.getCol() == to.getCol();",
        "    return board.isInside(to) && (diagonal || straight)",
        "        && rowDelta + colDelta > 0",
        "        && board.isPathClear(from, to)",
        "        && canCaptureOrMoveTo(board, to);",
        "}",
      ].join("\n"),
    },
    {
      title: "Validate in layers before mutating the real board",
      detailMD:
        "**Game.move** first checks lifecycle, source ownership, piece movement, then self-check on a copied board. Only the final success path calls **board.moveUnchecked** on the real board.",
      code: [
        "Board candidate = board.copy();",
        "candidate.moveUnchecked(move.getFrom(), move.getTo());",
        "if (isKingInCheck(candidate, turn)) {",
        "    throw new IllegalArgumentException(\"Move leaves king in check\");",
        "}",
        "board.moveUnchecked(move.getFrom(), move.getTo());",
      ].join("\n"),
    },
    {
      title: "Detect check by asking opposing pieces whether they attack the king",
      detailMD:
        "The engine locates the king, scans occupied squares, and asks every opposing piece if it can move to the king's square in the current position.",
    },
    {
      title: "Derive checkmate and stalemate from legal-move search",
      detailMD:
        "After a valid move, evaluate the next player. If they are in check and have no legal move, the mover wins. If they are not in check and still have no legal move, the game is a stalemate.",
      code: [
        "private void updateStatus(Color nextToMove) {",
        "    boolean inCheck = isKingInCheck(board, nextToMove);",
        "    boolean hasLegalMove = hasAnyLegalMove(nextToMove);",
        "    if (inCheck && !hasLegalMove) {",
        "        status = nextToMove == Color.WHITE ? GameStatus.BLACK_WON : GameStatus.WHITE_WON;",
        "    } else if (!inCheck && !hasLegalMove) {",
        "        status = GameStatus.STALEMATE;",
        "    } else {",
        "        status = GameStatus.ACTIVE;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Treat moves as commands and add history at the execution boundary",
      detailMD:
        "The reference **Move** is already an immutable command request. To add undo, store an executed-move record beside **Game.move** with source, destination, moved piece, captured piece, prior turn, and prior status.",
      code: [
        "public final class Move {",
        "    private final Square from;",
        "    private final Square to;",
        "    public Move(Square from, Square to) {",
        "        this.from = from;",
        "        this.to = to;",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  implementation: referenceFiles("design-chess"),

  classExplanations: [
    {
      className: "Color",
      detailMD:
        "Enum for the two sides. **opposite** is used by **Game** to advance the turn and to evaluate the next player after a move.",
    },
    {
      className: "Square",
      detailMD:
        "Immutable row/column coordinate. It exposes accessors and value equality, making it safe to create fresh coordinates during board scans and legal-move search.",
    },
    {
      className: "Board",
      detailMD:
        "Stores a fixed 8x8 **Piece** matrix. It owns bounds checks, placement, path clearance, occupied-square enumeration, shallow copying for candidate validation, and starting-position setup.",
    },
    {
      className: "Piece",
      detailMD:
        "Abstract movement strategy. It stores color, provides **canCaptureOrMoveTo** for shared target rules, and requires each concrete piece to implement **canMove**.",
    },
    {
      className: "King",
      detailMD:
        "Concrete **Piece** that moves at most one row and one column, cannot remain stationary, and respects target occupancy. Check safety is handled outside by **Game**.",
    },
    {
      className: "Queen",
      detailMD:
        "Concrete **Piece** combining diagonal and straight-line movement. It requires non-zero movement, clear path, board bounds, and a legal target.",
    },
    {
      className: "Rook",
      detailMD:
        "Concrete **Piece** for horizontal or vertical movement. It rejects same-square moves, requires path clearance, and can capture only opposing pieces.",
    },
    {
      className: "Bishop",
      detailMD:
        "Concrete **Piece** for diagonal movement. The movement is valid only when row and column deltas match, the path is clear, and the target is empty or hostile.",
    },
    {
      className: "Knight",
      detailMD:
        "Concrete **Piece** for L-shaped movement. It intentionally does not call **isPathClear** because knights can jump over pieces.",
    },
    {
      className: "Pawn",
      detailMD:
        "Concrete **Piece** with the densest basic movement rule: color-specific direction, starting-row double advance, forward movement only to empty squares, and diagonal captures only against enemies.",
    },
    {
      className: "Move",
      detailMD:
        "Immutable command request holding **from** and **to** squares. It is intentionally free of validation so **Game** can validate the command against the current board and turn.",
    },
    {
      className: "Player",
      detailMD:
        "Small identity object with name and color. It represents who is playing a side but does not own the pieces; the board owns piece placement.",
    },
    {
      className: "GameStatus",
      detailMD:
        "Enum for the current lifecycle: active, white won, black won, or stalemate. The reference design encodes check as a derived condition rather than a stored status.",
    },
    {
      className: "Game",
      detailMD:
        "The domain controller and state machine. It validates **Move**, copies the board for self-check detection, commits legal moves, searches for checkmate or stalemate, and exposes current player/status.",
    },
  ],

  dryRun: {
    inputMD:
      "Fool's mate on the starting board using zero-based coordinates: White f2-f3, Black e7-e5, White g2-g4, Black Qd8-h4. Coordinates use row 0 for black's back rank and column 0 for file a.",
    columns: ["Step", "Move", "Validation focus", "Board or status change", "Turn result"],
    rows: [
      ["0", "Initial setup", "Board.setupStartingPosition places all pieces", "status ACTIVE", "WHITE to move"],
      ["1", "Move (6,5) to (5,5)", "White Pawn moves one row forward into empty square", "f-pawn leaves f2", "BLACK to move"],
      ["2", "Move (1,4) to (3,4)", "Black Pawn uses starting-row double step with middle square empty", "e-pawn moves to e5", "WHITE to move"],
      ["3", "Move (6,6) to (4,6)", "White Pawn uses starting-row double step and opens king diagonal", "g-pawn moves to g4", "BLACK to move"],
      ["4", "Move (0,3) to (4,7)", "Black Queen moves diagonally through a clear path", "queen lands on h4", "Evaluate WHITE"],
      ["5", "updateStatus(WHITE)", "White king is attacked and no legal move removes it", "status BLACK_WON", "Turn does not advance"],
    ],
    narrativeMD:
      "The important row is step 4: the queen's geometric move is not enough. **Game** also copies the board, verifies black does not leave its own king in check, commits the move, then searches whether white has any legal response. With none available, **BLACK_WON** is set.",
  },

  complexity: [
    {
      operation: "Board.get/place/isInside",
      time: "O(1)",
      space: "O(1)",
      note: "Direct matrix access on a fixed 8x8 board.",
    },
    {
      operation: "Piece.canMove",
      time: "O(1) for King, Knight, Pawn; O(N) for Queen, Rook, Bishop",
      space: "O(1)",
      note: "Sliding pieces may scan up to N squares for path clearance.",
    },
    {
      operation: "isKingInCheck",
      time: "O(P × N)",
      space: "O(P)",
      note: "Scans occupied squares and asks enemy pieces whether they attack the king; occupiedSquares materializes up to P coordinates.",
    },
    {
      operation: "hasAnyLegalMove",
      time: "O(P × N² × (N² + P × N))",
      space: "O(N² + P)",
      note: "For each piece and destination, the code may copy the board and re-run king safety checks. With N=8 this is still small.",
    },
    {
      operation: "Game.move",
      time: "O(P × N² × (N² + P × N)) worst case, O(1) for standard chess size",
      space: "O(N² + P)",
      note: "The expensive part is terminal-state search after a legal move, not source or geometry validation.",
    },
  ],
  complexityNotesMD:
    "For interviews, say the asymptotic form using board dimension **N** and piece count **P**, then immediately note that normal chess fixes N at 8 and P at 32, making the brute-force search acceptable. Optimized engines use bitboards, attack maps, and incremental move generation, but those are unnecessary for LLD clarity.",

  extensibility: [
    {
      label: "Special moves",
      detailMD:
        "Add validators/effects for castling, en passant, and promotion around **Game.move**. Promotion can call a **PieceFactory** without changing basic movement classes.",
    },
    {
      label: "Move history and undo",
      detailMD:
        "Store executed commands with **Move**, moved piece, captured piece, previous turn, previous status, and promotion metadata. Undo reverses board placement and restores state from that record.",
    },
    {
      label: "Richer statuses",
      detailMD:
        "Extend **GameStatus** with CHECK, DRAW_BY_REPETITION, FIFTY_MOVE_RULE, RESIGNATION, and TIMEOUT if the product needs these states explicitly.",
    },
    {
      label: "Variant boards and custom pieces",
      detailMD:
        "Extract board size and starting layout into configuration, and register new **Piece** subclasses behind a factory. **Game** still calls **canMove**.",
    },
    {
      label: "AI or hints",
      detailMD:
        "Expose legal move generation as a service that reuses **hasAnyLegalMove** logic. A bot or hint engine can evaluate candidate boards without mutating the game.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Rule engine with validators",
      detailMD:
        "Instead of putting most orchestration in **Game.move**, create a chain of validators: status, source, ownership, movement, self-check, and special-rule validators.",
      tradeoffsMD:
        "Excellent for castling and draw rules, but heavier for an interview unless the candidate keeps the chain readable.",
    },
    {
      name: "Immutable board snapshots",
      detailMD:
        "Every accepted move returns a new **Board** instead of mutating the current matrix. History and undo become natural because old boards remain available.",
      tradeoffsMD:
        "Simplifies replay and debugging at the cost of extra allocation and more careful sharing of immutable pieces.",
    },
    {
      name: "ExecutedMove command objects",
      detailMD:
        "Make each accepted move an object with **execute** and **undo**, storing captured piece, prior status, and prior turn.",
      tradeoffsMD:
        "This is the strongest Command pattern implementation, but it introduces more classes than the reference solution needs for the base problem.",
    },
    {
      name: "Bitboard engine",
      detailMD:
        "Represent each piece set as 64-bit masks and precompute attacks for very fast move generation.",
      tradeoffsMD:
        "Great for chess engines, poor for LLD interviews because it hides object responsibilities behind dense bit manipulation.",
    },
  ],

  commonMistakes: [
    "Putting all movement logic in **Game** with piece-type conditionals instead of using **Piece.canMove** polymorphism.",
    "Mutating the real board before checking whether the move leaves the current player's king in check.",
    "Letting **Board** manage turns or game status, which mixes storage with orchestration.",
    "Treating check as a stored boolean that can drift from the board instead of deriving it from the current position.",
    "Forgetting that pawns move and capture differently, and that their direction depends on color.",
    "Checking piece geometry but forgetting own-piece capture and blocked paths for sliding pieces.",
    "Declaring checkmate just because the king is attacked, without searching for any legal escape move.",
    "Designing undo as a blind reverse move without remembering captured pieces and previous status.",
  ],

  followUps: [
    {
      question: "How would you add castling?",
      answerMD:
        "Track whether the king and rook have moved, verify the path is clear, ensure the king is not in check and does not pass through attacked squares, then apply a compound move effect that moves both pieces atomically.",
    },
    {
      question: "How would you implement undo?",
      answerMD:
        "Store an executed command record after each accepted move: **Move**, moved piece, captured piece, prior turn, prior status, and any promotion or castling side effects. Undo restores all of those fields in reverse order.",
    },
    {
      question: "Where should legal move generation live?",
      answerMD:
        "The primitive geometry stays in **Piece.canMove**. A higher-level move generator can live beside **Game** and reuse board copying plus self-check validation to enumerate only legal moves.",
    },
    {
      question: "Why copy the board before applying a move?",
      answerMD:
        "It lets the engine test self-check without risking a partially mutated real board. If the move is illegal, the committed state remains untouched.",
    },
    {
      question: "How would you support custom chess variants?",
      answerMD:
        "Make board dimensions, starting layout, and piece factory configuration-driven. Each custom piece still implements **canMove**, so **Game** remains generic.",
    },
    {
      question: "Should CHECK be part of **GameStatus**?",
      answerMD:
        "It depends on product needs. The reference derives check during status updates and stores only terminal states. If the UI must display CHECK persistently, add it as a non-terminal state carefully so turn transitions remain clear.",
    },
  ],

  productionConsiderations: [
    {
      label: "Persistence and replay",
      detailMD:
        "Persist the initial position plus a validated move log. Reconstruct board state by replaying commands, and store snapshots periodically for faster recovery.",
    },
    {
      label: "Rule-versioning",
      detailMD:
        "Store which rule set created a game. Chess variants, bug fixes, or tournament modes should not reinterpret old move histories differently.",
    },
    {
      label: "Concurrency",
      detailMD:
        "For online play, serialize moves per game with an optimistic version or lock. Reject stale moves whose expected turn/version no longer matches.",
    },
    {
      label: "Observability",
      detailMD:
        "Emit events for move accepted, move rejected, checkmate, stalemate, resignation, timeout, and undo. These events support analytics and dispute debugging.",
    },
    {
      label: "Input boundaries",
      detailMD:
        "Translate algebraic notation, UI clicks, or API payloads into **Move** at the boundary. The domain should only receive validated coordinate objects.",
    },
  ],

  interviewNotes: [
    "Did the candidate keep **Board**, **Piece**, and **Game** responsibilities separate?",
    "Did they reject illegal moves before mutating the committed board?",
    "Did they explain why checkmate requires legal-move search, not just detecting attack on the king?",
    "Did they mention the command/history metadata needed for undo, including captured pieces and previous status?",
    "Did they offer extension seams for castling, promotion, variants, and richer draw rules without rewriting the engine?",
    "Did they avoid over-optimizing into bitboards before the object model is clear?",
  ],

  quiz: [
    {
      question: "Why should movement rules live in **Piece** subclasses?",
      options: [
        "Because each piece has different geometry behind the same **canMove** interface",
        "Because **Board** cannot store pieces otherwise",
        "Because Java enums cannot model colors",
        "Because it automatically detects checkmate without search",
      ],
      answerIndex: 0,
      explanationMD:
        "This is Strategy through polymorphism: **Game** asks the current piece whether it can move, without knowing whether it is a rook, pawn, or knight.",
    },
    {
      question: "What is the main reason **Game.move** copies the board before committing a move?",
      options: [
        "To test whether the move leaves the current player's king in check without mutating real state",
        "To make every move take O(1) time",
        "To avoid needing **Square.equals**",
        "To let **Board** change the active player",
      ],
      answerIndex: 0,
      explanationMD:
        "Self-check validation must be safe. A copied board lets the engine simulate the move and reject it with the original board untouched.",
    },
    {
      question: "Which condition indicates stalemate in this design?",
      options: [
        "The next player is not in check and has no legal move",
        "The current player captures a queen",
        "Both players have the same number of pieces",
        "A pawn reaches the final rank",
      ],
      answerIndex: 0,
      explanationMD:
        "Stalemate is terminal only when the player to move is safe but has no legal move available.",
    },
    {
      question: "What extra information is required to undo a capture correctly?",
      options: [
        "Only the destination square",
        "The captured piece plus prior turn and status metadata",
        "Only the current player's name",
        "The board dimensions but not the move",
      ],
      answerIndex: 1,
      explanationMD:
        "A reverse move is not enough. Undo must restore any captured piece and restore state-machine fields that changed after the move.",
    },
    {
      question: "Why is **Board** kept free of turn logic?",
      options: [
        "So it remains a reusable placement and query model for validation, copying, setup, and tests",
        "So pawns can move backward",
        "So **GameStatus** can be removed",
        "So path clearance becomes unnecessary",
      ],
      answerIndex: 0,
      explanationMD:
        "Board state and game orchestration change for different reasons. Keeping turns in **Game** preserves a clean separation of concerns.",
    },
  ],

  practiceVariants: [
    {
      title: "Add castling and promotion",
      detailMD:
        "Track whether king and rooks moved, validate attacked transit squares, and use a factory to replace a pawn on promotion.",
      difficulty: "Advanced",
    },
    {
      title: "Implement undo and redo",
      detailMD:
        "Add an executed-move history stack and a redo stack. Include captured piece, prior turn, prior status, and compound move side effects.",
      difficulty: "Advanced",
    },
    {
      title: "Add algebraic notation parsing",
      detailMD:
        "Translate user-facing notation into **Move** while keeping domain validation in **Game**.",
      difficulty: "Intermediate",
    },
    {
      title: "Support chess variants",
      detailMD:
        "Make board size, initial layout, and registered piece strategies configurable for variants such as Chess960 or custom pieces.",
      difficulty: "Expert",
    },
  ],

  flashcards: [
    {
      front: "Which class owns turn management?",
      back: "**Game** owns the current **Color** turn and advances it only after a valid move when status remains **ACTIVE**.",
    },
    {
      front: "Which method is the movement strategy seam?",
      back: "**Piece.canMove(Board, Square, Square)**, implemented by King, Queen, Rook, Bishop, Knight, and Pawn.",
    },
    {
      front: "Why does **Game.move** validate on a candidate board?",
      back: "To reject self-check without mutating the committed board.",
    },
    {
      front: "How is check detected?",
      back: "Find the king, then ask each opposing piece whether it can move to the king's square in the current position.",
    },
    {
      front: "How is checkmate different from check?",
      back: "Checkmate is check plus no legal move that removes the check or otherwise leaves the king safe.",
    },
    {
      front: "What does **Move** represent?",
      back: "An immutable command request containing a source square and a destination square.",
    },
    {
      front: "What must an undo record remember?",
      back: "The move, moved piece, captured piece, previous turn, previous status, and any special side effects such as promotion or castling.",
    },
  ],

  cheatSheetMD: [
    "**Core model:** Game coordinates turns and status; Board stores an 8x8 piece matrix; Square identifies coordinates; Move carries from/to; Player binds name to color.",
    "",
    "**Piece strategy:** Piece is abstract. King, Queen, Rook, Bishop, Knight, and Pawn each implement **canMove**. Sliding pieces use **Board.isPathClear**; knights do not; pawns depend on color and target occupancy.",
    "",
    "**Validation order:** status active → source has current-player piece → piece geometry is legal → candidate board does not leave mover's king in check → commit real board → update next player's status → advance turn only if active.",
    "",
    "**State:** **GameStatus** stores ACTIVE, WHITE_WON, BLACK_WON, STALEMATE. Check is derived from the current board; checkmate is check plus no legal move.",
    "",
    "**Patterns:** Strategy for piece movement, Factory Method seam for piece creation/setup, State for game lifecycle, Command for **Move** and future undo/replay history.",
    "",
    "**Extensibility:** Add castling, promotion, en passant, move history, notation parsing, custom pieces, and variant boards around **Game.move** without corrupting **Board** or existing piece rules.",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Gamma, Helm, Johnson, and Vlissides",
    },
    {
      title: "Effective Java — Enums, immutability, and method design",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — Strategy Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/strategy",
    },
    {
      title: "Chess Programming Wiki — Move Generation",
      kind: "Docs",
      url: "https://www.chessprogramming.org/Move_Generation",
    },
  ],

  relatedProblems: [
    { slug: "tic-tac-toe", note: "A simpler board-game state machine before check/checkmate complexity." },
    { slug: "snake-and-ladder", note: "Turn sequencing and board movement with fewer rule interactions." },
    { slug: "ludo", note: "Another game model where moves, turn state, and extensible rules matter." },
  ],
};
