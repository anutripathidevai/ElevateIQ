import type { LldEntry } from "./entry-types";

export const ENTRIES: LldEntry[] = [
  {
    slug: "design-logging-framework",
    isNew: true,
    title: "Design a Logging Framework",
    difficulty: "MEDIUM",
    tags: ["ood", "chain-of-responsibility", "strategy", "singleton"],
    statementMD: `Build a configurable logging framework that routes messages by severity and writes formatted output to one or more destinations.

**Requirements**
- Support log levels ordered as DEBUG < INFO < WARN < ERROR.
- Provide a Logger with a configurable minimum level.
- Allow multiple Appenders such as Console and File to be attached.
- Use a pluggable Formatter for message layout.
- Route each message through a chain of level-based handlers that accepts the matching level.
- Provide a thread-safe singleton LogManager for obtaining named loggers.

Focus on separating routing, formatting, output, and logger lookup so each concern can evolve independently.`,
    constraints: "Assume an in-process library with many application threads, modest log volume, and no need for external log shipping.",
    hints: [
      "Model the log event first.",
      "Separate filtering from output.",
      "Keep singleton state thread safe.",
    ],
    referenceSolution: `**Core classes:** LogLevel orders severities; LogMessage carries level, logger name, timestamp, and text; Formatter and Appender abstractions isolate layout and destinations; LogHandler chains level routing; Logger and LogManager expose the API. **Design notes:** Keep LogManager as a static-holder singleton with a concurrent map of named loggers. Compose each Logger with a minimum level, formatter, appender list, and handler chain. Let each handler either publish the message or pass it onward so adding a new level or destination does not disturb client code.`,
    solution: {
      approachMD: `Start by treating every call as an immutable LogMessage. The Logger should only decide whether the level passes its configured minimum and then delegate routing.

Use Chain of Responsibility for level routing: each handler accepts one severity and forwards the rest. Use Strategy for both formatting and appending because layouts and destinations change more often than the logger API.

Make LogManager the only global object. It owns named Logger instances in a concurrent map, while each Logger owns thread-safe appender configuration.`,
      steps: [
        {
          title: "Define severity and message data",
          detailMD: `Give every level an ordering value and keep the log event immutable. This makes minimum-level filtering cheap and keeps appenders from mutating shared data.`,
          code: {
            filename: "LogLevel.java",
            language: "java",
            content: `public enum LogLevel {
    DEBUG(10),
    INFO(20),
    WARN(30),
    ERROR(40);

    private final int severity;

    LogLevel(int severity) {
        this.severity = severity;
    }

    public boolean isAtLeast(LogLevel minimum) {
        return severity >= minimum.severity;
    }
}`,
          },
        },
        {
          title: "Make layout and output pluggable",
          detailMD: `Formatter and Appender are strategies. A Logger can reuse the same routing pipeline while changing how text is rendered or where it is written.`,
          code: {
            filename: "Appender.java",
            language: "java",
            content: `public interface Appender {
    void append(String formattedMessage);
}`,
          },
        },
        {
          title: "Route by level through handlers",
          detailMD: `The handler chain keeps the level dispatch logic out of Logger. Each handler checks whether it owns the message level and otherwise forwards to the next handler.`,
          code: {
            filename: "LogHandler.java",
            language: "java",
            content: `public abstract class LogHandler {
    private LogHandler next;

    public LogHandler linkWith(LogHandler next) {
        this.next = next;
        return next;
    }

    public final void handle(LogMessage message, Logger logger) {
        if (canHandle(message.getLevel())) {
            logger.publish(message);
            return;
        }
        if (next != null) {
            next.handle(message, logger);
        }
    }

    protected abstract boolean canHandle(LogLevel level);
}`,
          },
        },
        {
          title: "Compose the Logger",
          detailMD: `Logger combines minimum-level filtering, handler routing, formatting, and appenders. A copy-on-write appender list allows safe reads while configuration changes are rare.`,
        },
        {
          title: "Centralize lookup in LogManager",
          detailMD: `Use the initialization-on-demand holder idiom for a lazy thread-safe singleton and a ConcurrentHashMap for named logger reuse.`,
        },
      ],
      patterns: [
        {
          name: "Chain of Responsibility",
          why: "Level handlers form a pipeline where each handler either accepts a message or passes it onward.",
        },
        {
          name: "Strategy",
          why: "Formatter and Appender implementations can be swapped without changing Logger.",
        },
        {
          name: "Singleton",
          why: "LogManager provides one shared registry of named loggers across the process.",
        },
      ],
      code: [
        {
          filename: "LogLevel.java",
          language: "java",
          content: `public enum LogLevel {
    DEBUG(10),
    INFO(20),
    WARN(30),
    ERROR(40);

    private final int severity;

    LogLevel(int severity) {
        this.severity = severity;
    }

    public boolean isAtLeast(LogLevel minimum) {
        return severity >= minimum.severity;
    }
}`,
        },
        {
          filename: "LogMessage.java",
          language: "java",
          content: `import java.time.Instant;

public final class LogMessage {
    private final String loggerName;
    private final LogLevel level;
    private final String text;
    private final Instant createdAt;

    private LogMessage(String loggerName, LogLevel level, String text, Instant createdAt) {
        this.loggerName = loggerName;
        this.level = level;
        this.text = text;
        this.createdAt = createdAt;
    }

    public static LogMessage create(String loggerName, LogLevel level, String text) {
        return new LogMessage(loggerName, level, text, Instant.now());
    }

    public String getLoggerName() {
        return loggerName;
    }

    public LogLevel getLevel() {
        return level;
    }

    public String getText() {
        return text;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}`,
        },
        {
          filename: "Formatter.java",
          language: "java",
          content: `public interface Formatter {
    String format(LogMessage message);
}`,
        },
        {
          filename: "SimpleFormatter.java",
          language: "java",
          content: `import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public final class SimpleFormatter implements Formatter {
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME
        .withZone(ZoneId.systemDefault());

    @Override
    public String format(LogMessage message) {
        return formatter.format(message.getCreatedAt())
            + " " + message.getLevel().name()
            + " [" + message.getLoggerName() + "] "
            + message.getText();
    }
}`,
        },
        {
          filename: "Appender.java",
          language: "java",
          content: `public interface Appender {
    void append(String formattedMessage);
}`,
        },
        {
          filename: "ConsoleAppender.java",
          language: "java",
          content: `public final class ConsoleAppender implements Appender {
    @Override
    public void append(String formattedMessage) {
        System.out.println(formattedMessage);
    }
}`,
        },
        {
          filename: "FileAppender.java",
          language: "java",
          content: `import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

public final class FileAppender implements Appender {
    private final Path path;

    public FileAppender(Path path) {
        this.path = path;
    }

    @Override
    public synchronized void append(String formattedMessage) {
        try {
            Files.write(
                path,
                (formattedMessage + System.lineSeparator()).getBytes(StandardCharsets.UTF_8),
                StandardOpenOption.CREATE,
                StandardOpenOption.APPEND
            );
        } catch (IOException error) {
            throw new IllegalStateException("Could not write log file", error);
        }
    }
}`,
        },
        {
          filename: "LogHandler.java",
          language: "java",
          content: `public abstract class LogHandler {
    private LogHandler next;

    public LogHandler linkWith(LogHandler next) {
        this.next = next;
        return next;
    }

    public final void handle(LogMessage message, Logger logger) {
        if (canHandle(message.getLevel())) {
            logger.publish(message);
            return;
        }
        if (next != null) {
            next.handle(message, logger);
        }
    }

    protected abstract boolean canHandle(LogLevel level);
}`,
        },
        {
          filename: "LevelLogHandler.java",
          language: "java",
          content: `public final class LevelLogHandler extends LogHandler {
    private final LogLevel handledLevel;

    public LevelLogHandler(LogLevel handledLevel) {
        this.handledLevel = handledLevel;
    }

    public static LogHandler defaultChain() {
        LogHandler debug = new LevelLogHandler(LogLevel.DEBUG);
        debug.linkWith(new LevelLogHandler(LogLevel.INFO))
            .linkWith(new LevelLogHandler(LogLevel.WARN))
            .linkWith(new LevelLogHandler(LogLevel.ERROR));
        return debug;
    }

    @Override
    protected boolean canHandle(LogLevel level) {
        return handledLevel == level;
    }
}`,
        },
        {
          filename: "Logger.java",
          language: "java",
          content: `import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public final class Logger {
    private final String name;
    private final List<Appender> appenders = new CopyOnWriteArrayList<>();
    private final LogHandler handlerChain;
    private volatile LogLevel minimumLevel = LogLevel.INFO;
    private volatile Formatter formatter = new SimpleFormatter();

    Logger(String name) {
        this.name = name;
        this.handlerChain = LevelLogHandler.defaultChain();
        appenders.add(new ConsoleAppender());
    }

    public void setMinimumLevel(LogLevel minimumLevel) {
        this.minimumLevel = minimumLevel;
    }

    public void setFormatter(Formatter formatter) {
        this.formatter = formatter;
    }

    public void addAppender(Appender appender) {
        appenders.add(appender);
    }

    public void log(LogLevel level, String text) {
        if (!level.isAtLeast(minimumLevel)) {
            return;
        }
        handlerChain.handle(LogMessage.create(name, level, text), this);
    }

    void publish(LogMessage message) {
        String rendered = formatter.format(message);
        for (Appender appender : appenders) {
            appender.append(rendered);
        }
    }

    public void debug(String text) {
        log(LogLevel.DEBUG, text);
    }

    public void info(String text) {
        log(LogLevel.INFO, text);
    }

    public void warn(String text) {
        log(LogLevel.WARN, text);
    }

    public void error(String text) {
        log(LogLevel.ERROR, text);
    }
}`,
        },
        {
          filename: "LogManager.java",
          language: "java",
          content: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public final class LogManager {
    private final ConcurrentMap<String, Logger> loggers = new ConcurrentHashMap<>();

    private LogManager() {
    }

    private static final class Holder {
        private static final LogManager INSTANCE = new LogManager();
    }

    public static LogManager getInstance() {
        return Holder.INSTANCE;
    }

    public Logger getLogger(String name) {
        return loggers.computeIfAbsent(name, Logger::new);
    }
}`,
        },
      ],
    },
  },
  {
    slug: "design-rate-limiter",
    isNew: true,
    title: "Design a Rate Limiter",
    difficulty: "MEDIUM",
    tags: ["ood", "strategy", "concurrency", "token-bucket"],
    statementMD: `Design a reusable rate limiter that decides whether each client request should be allowed or rejected.

**Requirements**
- Decide allow or deny for a request identified by a client key.
- Support Token Bucket and Sliding Window Log algorithms through a Strategy interface.
- Keep request decisions thread safe.
- Support configurable capacity, refill rate, request window, and max requests.
- Maintain independent state per client.
- Provide a factory for choosing the algorithm.

Focus on isolating the rate-limiting algorithm from client code while protecting per-client mutable state.`,
    constraints: "Assume all decisions are made in memory on one service instance and client state may be created lazily.",
    hints: [
      "Store state per client key.",
      "Lock the smallest state object.",
      "Hide algorithm selection in a factory.",
    ],
    referenceSolution: `**Core classes:** RateLimiter defines allowRequest; TokenBucketRateLimiter and SlidingWindowRateLimiter implement separate algorithms; TokenBucket holds per-client token state; RateLimitConfig stores tuning knobs; RateLimiterFactory selects the strategy. **Design notes:** Use ConcurrentHashMap for lazy client state and synchronize on each client bucket or request deque instead of locking the whole limiter. Token Bucket handles bursts up to capacity while refilling over time. Sliding Window Log keeps exact recent timestamps and is simple but can use more memory under heavy traffic.`,
    solution: {
      approachMD: `Keep the public API tiny: a caller only asks whether a client request is allowed. Everything else is algorithm configuration and per-client state.

Use Strategy for the algorithm because Token Bucket and Sliding Window Log make different tradeoffs. Both implementations can share the same RateLimiter interface and be created by a factory.

For concurrency, use a concurrent map to find client state and then synchronize only that state. This allows different clients to be evaluated in parallel.`,
      steps: [
        {
          title: "Define the stable interface",
          detailMD: `The service layer should not care which rate-limiting algorithm is active. A single boolean method keeps integration simple.`,
          code: {
            filename: "RateLimiter.java",
            language: "java",
            content: `public interface RateLimiter {
    boolean allowRequest(String clientId);
}`,
          },
        },
        {
          title: "Capture configuration once",
          detailMD: `Store capacities, refill rate, window size, and request limit in a small immutable object so every strategy receives validated inputs.`,
        },
        {
          title: "Implement Token Bucket",
          detailMD: `Each client owns a bucket. Refill is computed from elapsed time, then a request consumes one token only if a token is available.`,
          code: {
            filename: "TokenBucket.java",
            language: "java",
            content: `public final class TokenBucket {
    private final int capacity;
    private final double refillPerSecond;
    private double tokens;
    private long lastRefillNanos;

    public TokenBucket(int capacity, double refillPerSecond) {
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    public synchronized boolean tryConsume() {
        refill();
        if (tokens < 1.0) {
            return false;
        }
        tokens -= 1.0;
        return true;
    }

    private void refill() {
        long now = System.nanoTime();
        double seconds = (now - lastRefillNanos) / 1_000_000_000.0;
        tokens = Math.min(capacity, tokens + seconds * refillPerSecond);
        lastRefillNanos = now;
    }
}`,
          },
        },
        {
          title: "Implement Sliding Window Log",
          detailMD: `For exact windows, keep recent timestamps per client. Remove expired entries before testing the limit and appending the current timestamp.`,
          code: {
            filename: "SlidingWindowRateLimiter.java",
            language: "java",
            content: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public final class SlidingWindowRateLimiter implements RateLimiter {
    private final RateLimitConfig config;
    private final ConcurrentMap<String, Deque<Long>> requests = new ConcurrentHashMap<>();

    public SlidingWindowRateLimiter(RateLimitConfig config) {
        this.config = config;
    }

    @Override
    public boolean allowRequest(String clientId) {
        long now = System.currentTimeMillis();
        Deque<Long> clientLog = requests.computeIfAbsent(clientId, key -> new ArrayDeque<>());
        synchronized (clientLog) {
            long cutoff = now - config.getWindowMillis();
            while (!clientLog.isEmpty() && clientLog.peekFirst() <= cutoff) {
                clientLog.removeFirst();
            }
            if (clientLog.size() >= config.getMaxRequests()) {
                return false;
            }
            clientLog.addLast(now);
            return true;
        }
    }
}`,
          },
        },
        {
          title: "Select algorithms through a factory",
          detailMD: `A factory keeps construction logic out of callers and makes it easy to switch algorithms from configuration.`,
        },
      ],
      patterns: [
        {
          name: "Strategy",
          why: "Each algorithm implements the same RateLimiter interface and can be selected without changing callers.",
        },
        {
          name: "Factory",
          why: "RateLimiterFactory centralizes algorithm selection and construction.",
        },
        {
          name: "Per-client monitor",
          why: "Synchronizing on a bucket or deque protects mutable state while allowing different clients to proceed concurrently.",
        },
      ],
      code: [
        {
          filename: "RateLimiter.java",
          language: "java",
          content: `public interface RateLimiter {
    boolean allowRequest(String clientId);
}`,
        },
        {
          filename: "RateLimitConfig.java",
          language: "java",
          content: `public final class RateLimitConfig {
    private final int capacity;
    private final double refillPerSecond;
    private final long windowMillis;
    private final int maxRequests;

    public RateLimitConfig(int capacity, double refillPerSecond, long windowMillis, int maxRequests) {
        if (capacity <= 0 || refillPerSecond <= 0 || windowMillis <= 0 || maxRequests <= 0) {
            throw new IllegalArgumentException("Rate limit values must be positive");
        }
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
        this.windowMillis = windowMillis;
        this.maxRequests = maxRequests;
    }

    public int getCapacity() {
        return capacity;
    }

    public double getRefillPerSecond() {
        return refillPerSecond;
    }

    public long getWindowMillis() {
        return windowMillis;
    }

    public int getMaxRequests() {
        return maxRequests;
    }
}`,
        },
        {
          filename: "TokenBucket.java",
          language: "java",
          content: `public final class TokenBucket {
    private final int capacity;
    private final double refillPerSecond;
    private double tokens;
    private long lastRefillNanos;

    public TokenBucket(int capacity, double refillPerSecond) {
        this.capacity = capacity;
        this.refillPerSecond = refillPerSecond;
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    public synchronized boolean tryConsume() {
        refill();
        if (tokens < 1.0) {
            return false;
        }
        tokens -= 1.0;
        return true;
    }

    private void refill() {
        long now = System.nanoTime();
        double seconds = (now - lastRefillNanos) / 1_000_000_000.0;
        tokens = Math.min(capacity, tokens + seconds * refillPerSecond);
        lastRefillNanos = now;
    }
}`,
        },
        {
          filename: "TokenBucketRateLimiter.java",
          language: "java",
          content: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public final class TokenBucketRateLimiter implements RateLimiter {
    private final RateLimitConfig config;
    private final ConcurrentMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    public TokenBucketRateLimiter(RateLimitConfig config) {
        this.config = config;
    }

    @Override
    public boolean allowRequest(String clientId) {
        TokenBucket bucket = buckets.computeIfAbsent(
            clientId,
            key -> new TokenBucket(config.getCapacity(), config.getRefillPerSecond())
        );
        return bucket.tryConsume();
    }
}`,
        },
        {
          filename: "SlidingWindowRateLimiter.java",
          language: "java",
          content: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public final class SlidingWindowRateLimiter implements RateLimiter {
    private final RateLimitConfig config;
    private final ConcurrentMap<String, Deque<Long>> requests = new ConcurrentHashMap<>();

    public SlidingWindowRateLimiter(RateLimitConfig config) {
        this.config = config;
    }

    @Override
    public boolean allowRequest(String clientId) {
        long now = System.currentTimeMillis();
        Deque<Long> clientLog = requests.computeIfAbsent(clientId, key -> new ArrayDeque<>());
        synchronized (clientLog) {
            long cutoff = now - config.getWindowMillis();
            while (!clientLog.isEmpty() && clientLog.peekFirst() <= cutoff) {
                clientLog.removeFirst();
            }
            if (clientLog.size() >= config.getMaxRequests()) {
                return false;
            }
            clientLog.addLast(now);
            return true;
        }
    }
}`,
        },
        {
          filename: "RateLimiterFactory.java",
          language: "java",
          content: `public final class RateLimiterFactory {
    public enum Algorithm {
        TOKEN_BUCKET,
        SLIDING_WINDOW_LOG
    }

    private RateLimiterFactory() {
    }

    public static RateLimiter create(Algorithm algorithm, RateLimitConfig config) {
        switch (algorithm) {
            case TOKEN_BUCKET:
                return new TokenBucketRateLimiter(config);
            case SLIDING_WINDOW_LOG:
                return new SlidingWindowRateLimiter(config);
            default:
                throw new IllegalArgumentException("Unknown algorithm: " + algorithm);
        }
    }
}`,
        },
      ],
    },
  },
  {
    slug: "design-chess",
    isNew: true,
    title: "Design a Chess Game",
    difficulty: "HARD",
    tags: ["ood", "game-design", "strategy", "state-machine"],
    statementMD: `Design the object model and controller for a chess game played by two alternating players on an 8x8 board.

**Requirements**
- Represent an 8x8 board with addressable squares.
- Model pieces with per-type movement rules for King, Queen, Rook, Bishop, Knight, and Pawn using polymorphism.
- Alternate turns between two players.
- Validate moves before applying them.
- Detect check, checkmate, and stalemate at a high level.
- Track game status throughout play.

Focus on clean game-state transitions and extensible movement rules rather than every tournament edge case.`,
    constraints: "Ignore UI, clocks, persistence, castling, en passant, and promotion details, but leave clear extension points for them.",
    hints: [
      "Let pieces own movement rules.",
      "Keep Board free of turn logic.",
      "Treat status as a state machine.",
    ],
    referenceSolution: `**Core classes:** Color and GameStatus are enums; Square identifies board coordinates; Board owns piece placement; Piece is an abstract base for King, Queen, Rook, Bishop, Knight, and Pawn; Move and Player carry interaction data; Game coordinates turns and status. **Design notes:** Use polymorphism as the movement strategy so adding a piece variant does not change the controller. Game validates ownership, legal movement, and self-check before mutating the board. Checkmate and stalemate can be detected by combining king-in-check detection with a search for any legal move.`,
    solution: {
      approachMD: `Keep the Board responsible only for squares and pieces. It should answer occupancy, path-clear, copy, and move operations, but it should not know whose turn it is.

Put movement rules in Piece subclasses. This keeps Game from becoming a large switch statement and lets each piece express only its geometry and capture rules.

Make Game the state machine. It validates the active player's move, prevents self-check, applies the move, evaluates checkmate or stalemate, and advances the turn only when the game remains active.`,
      steps: [
        {
          title: "Represent board coordinates",
          detailMD: `Square is an immutable value object. Board uses it to guard bounds, locate pieces, and move pieces without knowing turn order.`,
          code: {
            filename: "Square.java",
            language: "java",
            content: `public final class Square {
    private final int row;
    private final int col;

    public Square(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public int getRow() {
        return row;
    }

    public int getCol() {
        return col;
    }
}`,
          },
        },
        {
          title: "Move rules live in pieces",
          detailMD: `The abstract Piece type defines the common color and target helpers. Subclasses implement their own movement geometry.`,
          code: {
            filename: "Piece.java",
            language: "java",
            content: `public abstract class Piece {
    private final Color color;

    protected Piece(Color color) {
        this.color = color;
    }

    public Color getColor() {
        return color;
    }

    protected boolean canCaptureOrMoveTo(Board board, Square to) {
        Piece target = board.get(to);
        return target == null || target.getColor() != color;
    }

    public abstract boolean canMove(Board board, Square from, Square to);
}`,
          },
        },
        {
          title: "Validate before mutating",
          detailMD: `Game checks status, source ownership, piece movement, and self-check on a copied board. The real board changes only after all validations pass.`,
          code: {
            filename: "Game.java",
            language: "java",
            content: `public void move(Move move) {
    if (status != GameStatus.ACTIVE) {
        throw new IllegalStateException("Game is not active");
    }
    Piece piece = board.get(move.getFrom());
    if (piece == null || piece.getColor() != turn) {
        throw new IllegalArgumentException("No current-player piece at source");
    }
    if (!piece.canMove(board, move.getFrom(), move.getTo())) {
        throw new IllegalArgumentException("Illegal movement for piece");
    }
    Board candidate = board.copy();
    candidate.moveUnchecked(move.getFrom(), move.getTo());
    if (isKingInCheck(candidate, turn)) {
        throw new IllegalArgumentException("Move leaves king in check");
    }
    board.moveUnchecked(move.getFrom(), move.getTo());
    Color next = turn.opposite();
    updateStatus(next);
    if (status == GameStatus.ACTIVE) {
        turn = next;
    }
}`,
          },
        },
        {
          title: "Evaluate check and terminal states",
          detailMD: `Check is found by locating the king and asking every opposing piece whether it can attack that square. Checkmate and stalemate additionally require that no legal move exists.`,
        },
        {
          title: "Keep special rules as extensions",
          detailMD: `Castling, promotion, draw counters, and en passant can be added as extra validators or move effects without changing the Board and Piece responsibilities.`,
        },
      ],
      patterns: [
        {
          name: "Strategy through polymorphism",
          why: "Each Piece subclass implements its own movement rule behind the same canMove method.",
        },
        {
          name: "State machine",
          why: "GameStatus tracks ACTIVE, CHECKMATE, STALEMATE, and winner states as transitions after each valid move.",
        },
        {
          name: "Controller",
          why: "Game coordinates validation and turn changes while Board remains a storage model.",
        },
      ],
      code: [
        {
          filename: "Color.java",
          language: "java",
          content: `public enum Color {
    WHITE,
    BLACK;

    public Color opposite() {
        return this == WHITE ? BLACK : WHITE;
    }
}`,
        },
        {
          filename: "Square.java",
          language: "java",
          content: `public final class Square {
    private final int row;
    private final int col;

    public Square(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public int getRow() {
        return row;
    }

    public int getCol() {
        return col;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Square)) {
            return false;
        }
        Square square = (Square) other;
        return row == square.row && col == square.col;
    }

    @Override
    public int hashCode() {
        return 31 * row + col;
    }
}`,
        },
        {
          filename: "Board.java",
          language: "java",
          content: `import java.util.ArrayList;
import java.util.List;

public final class Board {
    private final Piece[][] pieces = new Piece[8][8];

    public boolean isInside(Square square) {
        return square.getRow() >= 0 && square.getRow() < 8
            && square.getCol() >= 0 && square.getCol() < 8;
    }

    public Piece get(Square square) {
        if (!isInside(square)) {
            return null;
        }
        return pieces[square.getRow()][square.getCol()];
    }

    public void place(Piece piece, Square square) {
        if (!isInside(square)) {
            throw new IllegalArgumentException("Square is outside the board");
        }
        pieces[square.getRow()][square.getCol()] = piece;
    }

    public void moveUnchecked(Square from, Square to) {
        Piece piece = get(from);
        place(piece, to);
        pieces[from.getRow()][from.getCol()] = null;
    }

    public boolean isPathClear(Square from, Square to) {
        int rowStep = Integer.compare(to.getRow(), from.getRow());
        int colStep = Integer.compare(to.getCol(), from.getCol());
        int row = from.getRow() + rowStep;
        int col = from.getCol() + colStep;
        while (row != to.getRow() || col != to.getCol()) {
            if (pieces[row][col] != null) {
                return false;
            }
            row += rowStep;
            col += colStep;
        }
        return true;
    }

    public List<Square> occupiedSquares() {
        List<Square> squares = new ArrayList<>();
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                if (pieces[row][col] != null) {
                    squares.add(new Square(row, col));
                }
            }
        }
        return squares;
    }

    public Board copy() {
        Board copy = new Board();
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                copy.pieces[row][col] = pieces[row][col];
            }
        }
        return copy;
    }

    public void setupStartingPosition() {
        for (int col = 0; col < 8; col++) {
            place(new Pawn(Color.BLACK), new Square(1, col));
            place(new Pawn(Color.WHITE), new Square(6, col));
        }
        placeBackRank(Color.BLACK, 0);
        placeBackRank(Color.WHITE, 7);
    }

    private void placeBackRank(Color color, int row) {
        place(new Rook(color), new Square(row, 0));
        place(new Knight(color), new Square(row, 1));
        place(new Bishop(color), new Square(row, 2));
        place(new Queen(color), new Square(row, 3));
        place(new King(color), new Square(row, 4));
        place(new Bishop(color), new Square(row, 5));
        place(new Knight(color), new Square(row, 6));
        place(new Rook(color), new Square(row, 7));
    }
}`,
        },
        {
          filename: "Piece.java",
          language: "java",
          content: `public abstract class Piece {
    private final Color color;

    protected Piece(Color color) {
        this.color = color;
    }

    public Color getColor() {
        return color;
    }

    protected boolean canCaptureOrMoveTo(Board board, Square to) {
        Piece target = board.get(to);
        return target == null || target.getColor() != color;
    }

    public abstract boolean canMove(Board board, Square from, Square to);
}`,
        },
        {
          filename: "King.java",
          language: "java",
          content: `public final class King extends Piece {
    public King(Color color) {
        super(color);
    }

    @Override
    public boolean canMove(Board board, Square from, Square to) {
        int rowDelta = Math.abs(to.getRow() - from.getRow());
        int colDelta = Math.abs(to.getCol() - from.getCol());
        return board.isInside(to)
            && rowDelta <= 1
            && colDelta <= 1
            && rowDelta + colDelta > 0
            && canCaptureOrMoveTo(board, to);
    }
}`,
        },
        {
          filename: "Queen.java",
          language: "java",
          content: `public final class Queen extends Piece {
    public Queen(Color color) {
        super(color);
    }

    @Override
    public boolean canMove(Board board, Square from, Square to) {
        int rowDelta = Math.abs(to.getRow() - from.getRow());
        int colDelta = Math.abs(to.getCol() - from.getCol());
        boolean diagonal = rowDelta == colDelta;
        boolean straight = from.getRow() == to.getRow() || from.getCol() == to.getCol();
        return board.isInside(to)
            && (diagonal || straight)
            && rowDelta + colDelta > 0
            && board.isPathClear(from, to)
            && canCaptureOrMoveTo(board, to);
    }
}`,
        },
        {
          filename: "Rook.java",
          language: "java",
          content: `public final class Rook extends Piece {
    public Rook(Color color) {
        super(color);
    }

    @Override
    public boolean canMove(Board board, Square from, Square to) {
        boolean straight = from.getRow() == to.getRow() || from.getCol() == to.getCol();
        boolean sameSquare = from.equals(to);
        return board.isInside(to)
            && straight
            && !sameSquare
            && board.isPathClear(from, to)
            && canCaptureOrMoveTo(board, to);
    }
}`,
        },
        {
          filename: "Bishop.java",
          language: "java",
          content: `public final class Bishop extends Piece {
    public Bishop(Color color) {
        super(color);
    }

    @Override
    public boolean canMove(Board board, Square from, Square to) {
        int rowDelta = Math.abs(to.getRow() - from.getRow());
        int colDelta = Math.abs(to.getCol() - from.getCol());
        return board.isInside(to)
            && rowDelta == colDelta
            && rowDelta > 0
            && board.isPathClear(from, to)
            && canCaptureOrMoveTo(board, to);
    }
}`,
        },
        {
          filename: "Knight.java",
          language: "java",
          content: `public final class Knight extends Piece {
    public Knight(Color color) {
        super(color);
    }

    @Override
    public boolean canMove(Board board, Square from, Square to) {
        int rowDelta = Math.abs(to.getRow() - from.getRow());
        int colDelta = Math.abs(to.getCol() - from.getCol());
        boolean lShape = rowDelta * colDelta == 2;
        return board.isInside(to) && lShape && canCaptureOrMoveTo(board, to);
    }
}`,
        },
        {
          filename: "Pawn.java",
          language: "java",
          content: `public final class Pawn extends Piece {
    public Pawn(Color color) {
        super(color);
    }

    @Override
    public boolean canMove(Board board, Square from, Square to) {
        if (!board.isInside(to)) {
            return false;
        }
        int direction = getColor() == Color.WHITE ? -1 : 1;
        int startRow = getColor() == Color.WHITE ? 6 : 1;
        int rowDelta = to.getRow() - from.getRow();
        int colDelta = Math.abs(to.getCol() - from.getCol());
        Piece target = board.get(to);

        if (colDelta == 0 && target == null) {
            if (rowDelta == direction) {
                return true;
            }
            Square middle = new Square(from.getRow() + direction, from.getCol());
            return from.getRow() == startRow
                && rowDelta == 2 * direction
                && board.get(middle) == null;
        }

        return colDelta == 1
            && rowDelta == direction
            && target != null
            && target.getColor() != getColor();
    }
}`,
        },
        {
          filename: "Move.java",
          language: "java",
          content: `public final class Move {
    private final Square from;
    private final Square to;

    public Move(Square from, Square to) {
        this.from = from;
        this.to = to;
    }

    public Square getFrom() {
        return from;
    }

    public Square getTo() {
        return to;
    }
}`,
        },
        {
          filename: "Player.java",
          language: "java",
          content: `public final class Player {
    private final String name;
    private final Color color;

    public Player(String name, Color color) {
        this.name = name;
        this.color = color;
    }

    public String getName() {
        return name;
    }

    public Color getColor() {
        return color;
    }
}`,
        },
        {
          filename: "GameStatus.java",
          language: "java",
          content: `public enum GameStatus {
    ACTIVE,
    WHITE_WON,
    BLACK_WON,
    STALEMATE
}`,
        },
        {
          filename: "Game.java",
          language: "java",
          content: `public final class Game {
    private final Board board = new Board();
    private final Player whitePlayer;
    private final Player blackPlayer;
    private Color turn = Color.WHITE;
    private GameStatus status = GameStatus.ACTIVE;

    public Game(Player whitePlayer, Player blackPlayer) {
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;
        board.setupStartingPosition();
    }

    public void move(Move move) {
        if (status != GameStatus.ACTIVE) {
            throw new IllegalStateException("Game is not active");
        }
        Piece piece = board.get(move.getFrom());
        if (piece == null || piece.getColor() != turn) {
            throw new IllegalArgumentException("No current-player piece at source");
        }
        if (!piece.canMove(board, move.getFrom(), move.getTo())) {
            throw new IllegalArgumentException("Illegal movement for piece");
        }
        Board candidate = board.copy();
        candidate.moveUnchecked(move.getFrom(), move.getTo());
        if (isKingInCheck(candidate, turn)) {
            throw new IllegalArgumentException("Move leaves king in check");
        }
        board.moveUnchecked(move.getFrom(), move.getTo());
        Color next = turn.opposite();
        updateStatus(next);
        if (status == GameStatus.ACTIVE) {
            turn = next;
        }
    }

    private void updateStatus(Color nextToMove) {
        boolean inCheck = isKingInCheck(board, nextToMove);
        boolean hasLegalMove = hasAnyLegalMove(nextToMove);
        if (inCheck && !hasLegalMove) {
            status = nextToMove == Color.WHITE ? GameStatus.BLACK_WON : GameStatus.WHITE_WON;
        } else if (!inCheck && !hasLegalMove) {
            status = GameStatus.STALEMATE;
        } else {
            status = GameStatus.ACTIVE;
        }
    }

    private boolean hasAnyLegalMove(Color color) {
        for (Square from : board.occupiedSquares()) {
            Piece piece = board.get(from);
            if (piece == null || piece.getColor() != color) {
                continue;
            }
            for (int row = 0; row < 8; row++) {
                for (int col = 0; col < 8; col++) {
                    Square to = new Square(row, col);
                    if (!piece.canMove(board, from, to)) {
                        continue;
                    }
                    Board candidate = board.copy();
                    candidate.moveUnchecked(from, to);
                    if (!isKingInCheck(candidate, color)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private boolean isKingInCheck(Board position, Color color) {
        Square kingSquare = findKing(position, color);
        if (kingSquare == null) {
            return true;
        }
        for (Square from : position.occupiedSquares()) {
            Piece attacker = position.get(from);
            if (attacker != null
                && attacker.getColor() != color
                && attacker.canMove(position, from, kingSquare)) {
                return true;
            }
        }
        return false;
    }

    private Square findKing(Board position, Color color) {
        for (Square square : position.occupiedSquares()) {
            Piece piece = position.get(square);
            if (piece instanceof King && piece.getColor() == color) {
                return square;
            }
        }
        return null;
    }

    public Player getCurrentPlayer() {
        return turn == Color.WHITE ? whitePlayer : blackPlayer;
    }

    public GameStatus getStatus() {
        return status;
    }
}`,
        },
      ],
    },
  },
];
