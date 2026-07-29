import type { LLDProblemContent } from "../types";
import { referenceFiles } from "./reference-solutions";

/**
 * Exemplar LLD problem — Design a Logging Framework.
 *
 * Reuses the reviewed Java from the practice bank **design-logging-framework**
 * as the reference implementation, and layers the full learning walkthrough on top.
 */
export const loggingFramework: LLDProblemContent = {
  slug: "logging-framework",

  statementMD: [
    "Design the object model for a **logging framework** that application code can use to emit diagnostics at different severities.",
    "The framework should support **DEBUG**, **INFO**, **WARN**, and **ERROR** levels, named loggers, level filtering, a chain of handlers, pluggable formatters, and pluggable sinks such as console and file output.",
    "",
    "The interview focus is the class model: where filtering lives, how messages move through a chain, how sinks are added without changing core logging code, and how the same design can evolve into async logging for production workloads.",
  ].join("\n"),

  businessContextMD: [
    "Logging frameworks sit on every critical path at companies like Amazon, Microsoft, and Oracle. They must be easy for application teams to call, cheap when a message is filtered out, and extensible enough to add structured formats, file rotation, remote collectors, or async buffering later.",
    "",
    "A strong LLD answer shows that logging is not just printing text. It is a pipeline: caller API → level filter → log event → handler chain → formatter strategy → observer appenders.",
  ].join("\n"),

  functionalRequirements: [
    "Expose named loggers through a central manager so different application modules can request their own logger.",
    "Support the four levels **DEBUG**, **INFO**, **WARN**, and **ERROR** with severity ordering.",
    "Filter messages below the configured minimum level before creating or publishing a log event.",
    "Route accepted messages through a Chain of Responsibility made of log-level handlers.",
    "Format each accepted **LogMessage** through a pluggable **Formatter** strategy.",
    "Publish the formatted message to one or more pluggable **Appender** sinks, including console and file sinks.",
    "Provide convenience methods **debug**, **info**, **warn**, and **error** in addition to a generic **log** method.",
    "Keep the sink abstraction compatible with an async appender that can enqueue work without changing **Logger**.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Low overhead on filtered logs",
      detailMD:
        "A message below the logger's minimum level should return immediately. It should not allocate a **LogMessage**, run the handler chain, format text, or touch any sink.",
    },
    {
      label: "Thread-safe shared loggers",
      detailMD:
        "**LogManager** must safely return the same named logger to concurrent callers. Logger configuration and appender iteration must not corrupt shared state.",
    },
    {
      label: "Extensibility",
      detailMD:
        "New formatters, appenders, and async wrappers should be additive classes behind existing interfaces rather than edits to the logging flow.",
    },
    {
      label: "Failure isolation",
      detailMD:
        "A sink failure should be isolated at the appender boundary. The reference **FileAppender** converts I/O errors into a clear runtime failure rather than silently losing logs.",
    },
    {
      label: "Deterministic message model",
      detailMD:
        "A log event should capture its level, logger name, text, and creation time once so every appender sees the same event content.",
    },
  ],

  requirementClarification: [
    {
      question: "Do we need hierarchical package loggers like **com.app.service** inheriting from **com.app**?",
      answerMD:
        "Not in the base design. We model named loggers returned by **LogManager**. Hierarchical inheritance is a documented extension.",
    },
    {
      question: "Should logging calls be async by default?",
      answerMD:
        "For the reference design, **Logger** publishes synchronously to keep the core pipeline readable. Async logging is supported by the **Appender** seam: a production **AsyncAppender** can enqueue formatted messages and flush on a worker.",
    },
    {
      question: "Can a logger write to multiple destinations?",
      answerMD:
        "Yes. **Logger** owns a list of appenders and publishes the same formatted message to each one, such as console plus file.",
    },
    {
      question: "Can users change the output format?",
      answerMD:
        "Yes. **Formatter** is an interface. **SimpleFormatter** is the default, and structured or JSON formatters can implement the same method.",
    },
    {
      question: "What happens when a message level does not match the first handler?",
      answerMD:
        "The **LogHandler** passes the event to the next handler until a matching **LevelLogHandler** publishes it or the chain ends.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class LogManager {",
    "        -ConcurrentMap~String,Logger~ loggers",
    "        +getInstance() LogManager",
    "        +getLogger(String) Logger",
    "    }",
    "    class Logger {",
    "        -String name",
    "        -List~Appender~ appenders",
    "        -LogHandler handlerChain",
    "        -LogLevel minimumLevel",
    "        -Formatter formatter",
    "        +setMinimumLevel(LogLevel) void",
    "        +setFormatter(Formatter) void",
    "        +addAppender(Appender) void",
    "        +log(LogLevel,String) void",
    "        +debug(String) void",
    "        +info(String) void",
    "        +warn(String) void",
    "        +error(String) void",
    "    }",
    "    class LogLevel {",
    "        <<enumeration>>",
    "        DEBUG",
    "        INFO",
    "        WARN",
    "        ERROR",
    "        +isAtLeast(LogLevel) boolean",
    "    }",
    "    class LogMessage {",
    "        -String loggerName",
    "        -LogLevel level",
    "        -String text",
    "        -Instant createdAt",
    "        +create(String,LogLevel,String) LogMessage",
    "    }",
    "    class LogHandler {",
    "        <<abstract>>",
    "        -LogHandler next",
    "        +linkWith(LogHandler) LogHandler",
    "        +handle(LogMessage,Logger) void",
    "        #canHandle(LogLevel) boolean",
    "    }",
    "    class LevelLogHandler {",
    "        -LogLevel handledLevel",
    "        +defaultChain() LogHandler",
    "    }",
    "    class Formatter {",
    "        <<interface>>",
    "        +format(LogMessage) String",
    "    }",
    "    class SimpleFormatter",
    "    class Appender {",
    "        <<interface>>",
    "        +append(String) void",
    "    }",
    "    class ConsoleAppender",
    "    class FileAppender {",
    "        -Path path",
    "        +append(String) void",
    "    }",
    "    LogManager o-- Logger",
    "    Logger --> LogLevel",
    "    Logger --> LogHandler",
    "    Logger --> Formatter",
    "    Logger o-- Appender",
    "    Logger ..> LogMessage",
    "    LogMessage --> LogLevel",
    "    LogHandler <|-- LevelLogHandler",
    "    LevelLogHandler --> LogLevel",
    "    Formatter <|.. SimpleFormatter",
    "    Appender <|.. ConsoleAppender",
    "    Appender <|.. FileAppender",
  ].join("\n"),
  classDiagramCaptionMD:
    "The design has three seams: **LogHandler** forms the responsibility chain, **Formatter** chooses rendering, and **Appender** observers receive the rendered output.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant Manager as LogManager",
    "    participant Logger as Logger",
    "    participant Level as LogLevel",
    "    participant Handler as LogHandler",
    "    participant Formatter as Formatter",
    "    participant Console as ConsoleAppender",
    "    participant File as FileAppender",
    "    Client->>Manager: getInstance()",
    "    Client->>Manager: getLogger(billing)",
    "    Manager-->>Client: Logger",
    "    Client->>Logger: log(DEBUG, cache miss)",
    "    Logger->>Level: isAtLeast(INFO)",
    "    Level-->>Logger: false",
    "    Logger-->>Client: drop before allocation",
    "    Client->>Logger: log(ERROR, payment failed)",
    "    Logger->>Level: isAtLeast(INFO)",
    "    Level-->>Logger: true",
    "    Logger->>Handler: handle(message, logger)",
    "    Handler->>Logger: publish(message)",
    "    Logger->>Formatter: format(message)",
    "    Formatter-->>Logger: rendered text",
    "    Logger->>Console: append(rendered text)",
    "    Logger->>File: append(rendered text)",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Rejected logs stop at the level check. Accepted logs pass through the handler chain, then one formatted string is broadcast to every configured appender.",

  entities: [
    {
      name: "LogManager",
      responsibilityMD:
        "Singleton registry for named **Logger** instances. It uses a concurrent map so repeated calls for the same name return the same logger safely.",
      attributes: ["loggers"],
    },
    {
      name: "Logger",
      responsibilityMD:
        "Facade used by application code. It owns the minimum level, handler chain, formatter, and appender list, and coordinates the full logging pipeline.",
      attributes: ["name", "appenders", "handlerChain", "minimumLevel", "formatter"],
    },
    {
      name: "LogLevel",
      responsibilityMD:
        "Severity enum with explicit numeric ordering. **isAtLeast** is the single source of truth for level filtering.",
      attributes: ["DEBUG", "INFO", "WARN", "ERROR", "severity"],
    },
    {
      name: "LogMessage",
      responsibilityMD:
        "Immutable event object created only after filtering succeeds. It captures logger name, level, text, and timestamp.",
      attributes: ["loggerName", "level", "text", "createdAt"],
    },
    {
      name: "LogHandler",
      responsibilityMD:
        "Abstract chain node. **handle** either publishes the message when this handler accepts it or forwards to the next handler.",
      attributes: ["next"],
    },
    {
      name: "LevelLogHandler",
      responsibilityMD:
        "Concrete handler for one severity. **defaultChain** wires DEBUG → INFO → WARN → ERROR handlers in order.",
      attributes: ["handledLevel"],
    },
    {
      name: "Formatter",
      responsibilityMD:
        "Rendering strategy interface. It turns a **LogMessage** into text without knowing where that text will be written.",
      attributes: ["format(message)"],
    },
    {
      name: "SimpleFormatter",
      responsibilityMD:
        "Default formatter that emits timestamp, level, logger name, and message text in a predictable human-readable form.",
      attributes: ["DateTimeFormatter"],
    },
    {
      name: "Appender",
      responsibilityMD:
        "Sink observer interface. Each appender receives the rendered log line and decides where or how to write it.",
      attributes: ["append(formattedMessage)"],
    },
    {
      name: "ConsoleAppender",
      responsibilityMD:
        "Console sink that writes formatted messages to standard output.",
      attributes: ["append(formattedMessage)"],
    },
    {
      name: "FileAppender",
      responsibilityMD:
        "File sink that appends each formatted message to a path using UTF-8 and synchronizes writes for thread safety.",
      attributes: ["path"],
    },
  ],

  patternsUsed: [
    {
      name: "Chain of Responsibility",
      whyMD:
        "**LogHandler** owns the chain link and **LevelLogHandler** owns the level match. **Logger** sends a message to the chain without switching on every level itself.",
    },
    {
      name: "Singleton",
      whyMD:
        "**LogManager** uses the holder idiom to expose exactly one registry of named loggers across the process.",
    },
    {
      name: "Strategy",
      whyMD:
        "**Formatter** is the rendering strategy and **Appender** is the sink strategy. New text formats and destinations are added behind interfaces.",
    },
    {
      name: "Observer",
      whyMD:
        "**Logger.publish** broadcasts one formatted event to every registered **Appender**. Console, file, and future async appenders observe the same stream.",
    },
  ],

  designSteps: [
    {
      title: "Model severity as an ordered enum",
      detailMD:
        "Give each **LogLevel** an explicit severity number so filtering is stable even if enum declaration order changes later.",
      code: [
        "public enum LogLevel {",
        "    DEBUG(10), INFO(20), WARN(30), ERROR(40);",
        "",
        "    public boolean isAtLeast(LogLevel minimum) {",
        "        return severity >= minimum.severity;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Capture accepted events as immutable messages",
      detailMD:
        "**LogMessage.create** stamps the event with the current time after filtering. Every formatter and appender sees the same logger name, level, text, and timestamp.",
    },
    {
      title: "Build a level handler chain",
      detailMD:
        "Each **LevelLogHandler** is responsible for exactly one level. The default chain makes level routing explicit without a switch inside **Logger**.",
      code: [
        "public static LogHandler defaultChain() {",
        "    LogHandler debug = new LevelLogHandler(LogLevel.DEBUG);",
        "    debug.linkWith(new LevelLogHandler(LogLevel.INFO))",
        "        .linkWith(new LevelLogHandler(LogLevel.WARN))",
        "        .linkWith(new LevelLogHandler(LogLevel.ERROR));",
        "    return debug;",
        "}",
      ].join("\n"),
    },
    {
      title: "Filter first, then publish",
      detailMD:
        "**Logger.log** rejects below-threshold messages before allocation. Accepted messages go into the handler chain, which calls back into **publish**.",
      code: [
        "public void log(LogLevel level, String text) {",
        "    if (!level.isAtLeast(minimumLevel)) {",
        "        return;",
        "    }",
        "    handlerChain.handle(LogMessage.create(name, level, text), this);",
        "}",
      ].join("\n"),
    },
    {
      title: "Separate formatting from delivery",
      detailMD:
        "**Logger.publish** asks the current **Formatter** for one rendered string, then iterates over the appender list. Output policy is not hard-coded into the logger.",
    },
    {
      title: "Centralize logger lookup in a singleton manager",
      detailMD:
        "**LogManager.getInstance** exposes the process-wide registry, while **getLogger** uses atomic map insertion so named loggers are reused safely.",
    },
    {
      title: "Keep async logging as an appender-level extension",
      detailMD:
        "Because **Logger** depends only on **Appender**, a future async implementation can enqueue the formatted line and return quickly. Backpressure, flushing, and worker lifecycle stay outside the core logger.",
    },
  ],

  implementation: referenceFiles("design-logging-framework"),

  classExplanations: [
    {
      className: "LogLevel",
      detailMD:
        "Enum for **DEBUG**, **INFO**, **WARN**, and **ERROR**. The numeric severity makes **isAtLeast** the single filter rule used by **Logger**.",
    },
    {
      className: "LogMessage",
      detailMD:
        "Immutable event value. Its static **create** factory captures the current **Instant** and stores logger name, level, and text behind getters.",
    },
    {
      className: "Formatter",
      detailMD:
        "Strategy interface for rendering a **LogMessage**. It keeps the logger independent from text shape, structured output, or locale choices.",
    },
    {
      className: "SimpleFormatter",
      detailMD:
        "Default **Formatter** implementation. It uses an ISO offset timestamp and emits level, logger name, and text as one human-readable line.",
    },
    {
      className: "Appender",
      detailMD:
        "Sink interface for already formatted text. Console, file, remote, buffered, and async destinations can all implement **append**.",
    },
    {
      className: "ConsoleAppender",
      detailMD:
        "Simple **Appender** that writes the formatted line to standard output. It is the default sink added to every new **Logger**.",
    },
    {
      className: "FileAppender",
      detailMD:
        "File-backed **Appender**. It appends UTF-8 bytes to a configured path, creates the file when needed, synchronizes writes, and surfaces I/O failure as **IllegalStateException**.",
    },
    {
      className: "LogHandler",
      detailMD:
        "Abstract Chain of Responsibility node. **linkWith** wires the chain, and final **handle** either publishes through the logger or forwards to **next**.",
    },
    {
      className: "LevelLogHandler",
      detailMD:
        "Concrete chain node that accepts one **LogLevel**. **defaultChain** constructs the DEBUG, INFO, WARN, and ERROR sequence used by each **Logger**.",
    },
    {
      className: "Logger",
      detailMD:
        "Application-facing facade. It stores configuration, performs level filtering, creates **LogMessage** objects, invokes the handler chain, formats events, and broadcasts to appenders.",
    },
    {
      className: "LogManager",
      detailMD:
        "Singleton registry for loggers. The holder idiom gives lazy, thread-safe initialization, and **computeIfAbsent** returns one **Logger** per name.",
    },
  ],

  dryRun: {
    inputMD:
      "Create logger **billing** from **LogManager**. Set minimum level to **INFO**, keep the default **ConsoleAppender**, add a **FileAppender**, and use **SimpleFormatter**. Calls: **debug** for cache miss, **info** for payment started, and **error** for payment failed.",
    columns: ["Step", "Call", "Filter decision", "Handler result", "Formatted output", "Sink effect"],
    rows: [
      [
        "1",
        "getLogger(billing)",
        "Not a log event",
        "No handler",
        "No output",
        "Singleton manager returns the cached or new Logger",
      ],
      [
        "2",
        "debug(cache miss)",
        "DEBUG is below INFO",
        "Chain not invoked",
        "No output",
        "No appender receives anything",
      ],
      [
        "3",
        "info(payment started)",
        "INFO passes",
        "INFO handler publishes",
        "timestamp INFO [billing] payment started",
        "Console and file receive the same line",
      ],
      [
        "4",
        "error(payment failed)",
        "ERROR passes",
        "ERROR handler publishes",
        "timestamp ERROR [billing] payment failed",
        "Console and file receive the same line",
      ],
      [
        "5",
        "add async appender later",
        "Not a log event",
        "No handler",
        "No output",
        "A new Appender can enqueue future lines without Logger changes",
      ],
    ],
    narrativeMD:
      "The important optimization is step 2: the DEBUG message is rejected before **LogMessage.create**, formatting, or I/O. Steps 3 and 4 show accepted events taking the same path regardless of severity.",
  },

  complexity: [
    {
      operation: "getLogger",
      time: "O(1) average",
      space: "O(1) per distinct logger",
      note: "Concurrent hash map lookup and possible insertion by name.",
    },
    {
      operation: "filtered log call",
      time: "O(1)",
      space: "O(1)",
      note: "A below-threshold call only compares severities and returns.",
    },
    {
      operation: "accepted log call",
      time: "O(H + A + W)",
      space: "O(1)",
      note: "H handlers in the chain, A appenders, and W work done by sinks such as file write length.",
    },
    {
      operation: "addAppender",
      time: "O(A)",
      space: "O(A)",
      note: "CopyOnWriteArrayList copies the appender array on mutation, which is acceptable because configuration is rare.",
    },
    {
      operation: "file append",
      time: "O(M)",
      space: "O(M)",
      note: "M is formatted message length converted to UTF-8 bytes.",
    },
  ],
  complexityNotesMD:
    "The hot path is the accepted log call. In the reference implementation H is bounded by four levels, so practical cost is dominated by formatting and sink I/O. Async appenders shift I/O off the caller thread but add queue memory and backpressure decisions.",

  extensibility: [
    {
      label: "New formatter",
      detailMD:
        "Implement **Formatter** for JSON, key-value, colorized console, or redacted output, then call **setFormatter** on a logger.",
    },
    {
      label: "New sink",
      detailMD:
        "Implement **Appender** for rotating files, sockets, cloud collectors, metrics streams, or tests. **Logger.publish** does not change.",
    },
    {
      label: "Async logging",
      detailMD:
        "Add an **AsyncAppender** that owns a bounded queue and worker thread. It implements the same **append** method, so async behavior is a sink concern.",
    },
    {
      label: "New level policy",
      detailMD:
        "Add a **LogLevel** and a matching **LevelLogHandler** in the chain. If levels become dynamic, replace the enum with a registry and keep the handler abstraction.",
    },
    {
      label: "Structured context",
      detailMD:
        "Extend **LogMessage** with fields such as request id, tenant id, or key-value attributes. Existing formatters can ignore new fields while structured formatters use them.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Switch-based logger",
      detailMD:
        "Put level routing directly inside **Logger.log** with a switch over **LogLevel** and call appenders from each branch.",
      tradeoffsMD:
        "Simpler for four levels, but it removes the Chain of Responsibility seam and makes custom handling policies require logger edits.",
    },
    {
      name: "Always-async event queue",
      detailMD:
        "Make **Logger** enqueue **LogMessage** objects into a shared dispatcher, and let worker threads format and write to sinks.",
      tradeoffsMD:
        "Better latency for callers under slow I/O, but more complex shutdown, flush, ordering, memory, and backpressure behavior.",
    },
    {
      name: "Hierarchical logger tree",
      detailMD:
        "Store loggers in a package-style tree where child loggers inherit level, formatter, and appenders from parents unless overridden.",
      tradeoffsMD:
        "Closer to mature production frameworks, but substantially more state and precedence rules than an interview base design needs.",
    },
  ],

  commonMistakes: [
    "Formatting the message before checking **minimumLevel**, which makes filtered DEBUG logs expensive.",
    "Hard-coding console and file writes inside **Logger**, preventing new sinks without modifying core logic.",
    "Using a public constructor for **LogManager** and ending up with multiple logger registries.",
    "Letting **LogHandler.handle** be overridden and accidentally breaking the forward-to-next invariant.",
    "Ignoring thread safety for the appender list while one thread logs and another thread reconfigures sinks.",
    "Treating async logging as one new thread per log call instead of a bounded queue and worker model.",
    "Catching and swallowing file I/O failures, which makes missing logs impossible to diagnose.",
  ],

  followUps: [
    {
      question: "How would you add async logging without changing application code?",
      answerMD:
        "Implement **AsyncAppender** behind the existing **Appender** interface. It enqueues formatted strings into a bounded queue, a worker drains to a delegate appender, and shutdown flushes remaining messages.",
    },
    {
      question: "How would you support JSON logs?",
      answerMD:
        "Create a **JsonFormatter** implementing **Formatter**. It serializes **LogMessage** fields and any future structured context into one JSON line.",
    },
    {
      question: "How can you prevent a slow file sink from delaying every request?",
      answerMD:
        "Use an async appender or a batching appender for file output. Decide a backpressure policy: block, drop DEBUG/INFO first, or fail fast when the queue is full.",
    },
    {
      question: "How would you support different minimum levels for different modules?",
      answerMD:
        "Return one named **Logger** per module from **LogManager** and configure **minimumLevel** per logger. A hierarchy can be added later for inheritance.",
    },
    {
      question: "What should happen if one appender fails but another succeeds?",
      answerMD:
        "In production, isolate failures per appender and report them through internal diagnostics so one bad sink does not stop all logging. The reference implementation keeps failure visible for clarity.",
    },
  ],

  productionConsiderations: [
    {
      label: "Async queue and backpressure",
      detailMD:
        "Use bounded queues, explicit drop or block policy, flush on shutdown, and metrics for queue depth and dropped messages.",
    },
    {
      label: "File rotation and retention",
      detailMD:
        "Production file appenders need rotation by size or time, compression, retention limits, and safe rollover under concurrent writes.",
    },
    {
      label: "Structured observability",
      detailMD:
        "Prefer machine-readable fields for request id, tenant, trace id, and error class. Keep text logs compatible with metrics and tracing systems.",
    },
    {
      label: "Security and privacy",
      detailMD:
        "Add redaction in formatter or message creation for credentials, tokens, personal data, and payment details. Logging must not become a data leak.",
    },
    {
      label: "Operational diagnostics",
      detailMD:
        "The framework itself should expose internal counters for appender failures, queue drops, bytes written, and formatting errors.",
    },
  ],

  interviewNotes: [
    "Did the candidate filter before allocation, formatting, and I/O?",
    "Are handler routing, formatting, and sink delivery separated into clear abstractions?",
    "Is **LogManager** a safe singleton rather than global mutable state with multiple instances?",
    "Can the design add console, file, remote, and async sinks without editing **Logger.log**?",
    "Did the candidate call out thread safety and backpressure instead of hand-waving async logging?",
  ],

  quiz: [
    {
      question: "Why should **Logger.log** check **minimumLevel** before creating a **LogMessage**?",
      options: [
        "To avoid allocation, formatting, handler traversal, and I/O for filtered messages",
        "Because Java enums cannot be compared after object creation",
        "To force every appender to run on the caller thread",
        "Because Chain of Responsibility requires a null message",
      ],
      answerIndex: 0,
      explanationMD:
        "Filtered log calls can be extremely frequent. The cheap severity check protects the hot path from unnecessary work.",
    },
    {
      question: "Which class represents the Singleton pattern in the reference design?",
      options: ["Logger", "LogManager", "SimpleFormatter", "FileAppender"],
      answerIndex: 1,
      explanationMD:
        "**LogManager** uses the holder idiom and exposes **getInstance** as the single process-wide registry.",
    },
    {
      question: "What is the main benefit of the **Appender** interface?",
      options: [
        "It makes every log line ERROR by default",
        "It lets sinks such as console, file, remote, test, or async be added without changing **Logger**",
        "It removes the need for a formatter",
        "It stores loggers by name",
      ],
      answerIndex: 1,
      explanationMD:
        "The appender seam is the output extension point. The logger only knows it can call **append**.",
    },
    {
      question: "What does the Chain of Responsibility contribute here?",
      options: [
        "It guarantees file rotation",
        "It routes an accepted log message through handlers until one handler owns that level",
        "It serializes every log as JSON",
        "It creates the singleton manager",
      ],
      answerIndex: 1,
      explanationMD:
        "**LevelLogHandler** instances each own one level and are linked by **LogHandler.linkWith**.",
    },
    {
      question: "Where should async logging behavior fit best in this design?",
      options: [
        "Inside every caller before it invokes **Logger**",
        "By replacing **LogLevel** with threads",
        "As an **Appender** implementation or wrapper with a queue and worker",
        "By formatting the same message twice",
      ],
      answerIndex: 2,
      explanationMD:
        "Async behavior is a delivery concern. Keeping it behind **Appender** avoids changing caller code or logger filtering.",
    },
  ],

  practiceVariants: [
    {
      title: "Build an async appender",
      detailMD:
        "Implement an **AsyncAppender** with a bounded queue, one worker thread, flush on shutdown, and a configurable policy for full queues.",
      difficulty: "Intermediate",
    },
    {
      title: "Add JSON structured logging",
      detailMD:
        "Create **JsonFormatter** and extend **LogMessage** with optional key-value context while keeping existing appenders unchanged.",
      difficulty: "Intermediate",
    },
    {
      title: "Add hierarchical logger configuration",
      detailMD:
        "Support parent-child logger names such as service and service.payment, with inherited level and appenders unless overridden.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "Where is level filtering implemented?",
      back: "In **Logger.log**, using **LogLevel.isAtLeast** before creating a **LogMessage**.",
    },
    {
      front: "Which class provides the singleton registry?",
      back: "**LogManager**, using the holder idiom and a concurrent map of logger names.",
    },
    {
      front: "What is the Strategy seam for formatting?",
      back: "**Formatter**. **SimpleFormatter** is one implementation; JSON or redacting formatters can be added.",
    },
    {
      front: "What observes published log output?",
      back: "Every registered **Appender** observes the formatted line and writes it to its own destination.",
    },
    {
      front: "Why use **CopyOnWriteArrayList** for appenders?",
      back: "Logging reads the list often while configuration changes are rare, so iteration stays safe without explicit locks.",
    },
    {
      front: "How do you add async logging cleanly?",
      back: "Create an **AsyncAppender** that queues formatted lines and delegates writes to another appender on a worker.",
    },
  ],

  cheatSheetMD: [
    "**Entities:** LogManager, Logger, LogLevel, LogMessage, LogHandler, LevelLogHandler, Formatter, SimpleFormatter, Appender, ConsoleAppender, FileAppender.",
    "",
    "**Core flow:** caller gets a named logger → logger filters by minimum level → creates LogMessage → sends through handler chain → formatter renders → appenders receive the line.",
    "",
    "**Patterns:** Chain of Responsibility for level handlers, Singleton for LogManager, Strategy for Formatter and Appender, Observer for publishing to many appenders.",
    "",
    "**Invariants:** filtered logs do no formatting or I/O; named loggers are reused; appenders receive identical formatted text for one event; file writes are synchronized.",
    "",
    "**Async extension:** keep Logger unchanged. Add an appender with a bounded queue, worker, flush, and backpressure policy.",
    "",
    "**Complexity:** filtered log O(1); accepted log O(H + A + W); getLogger O(1) average; addAppender O(A) because copy-on-write copies the appender list.",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Gamma, Helm, Johnson, and Vlissides",
    },
    {
      title: "Refactoring Guru — Chain of Responsibility",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/chain-of-responsibility",
    },
    {
      title: "Log4j 2 Manual — Architecture",
      kind: "Docs",
      url: "https://logging.apache.org/log4j/2.x/manual/architecture.html",
    },
    {
      title: "Effective Java — Item 3 and Item 17",
      kind: "Book",
      author: "Joshua Bloch",
    },
  ],

  relatedProblems: [
    { slug: "notification-system", note: "Also broadcasts events to multiple delivery channels." },
    { slug: "rate-limiter", note: "Another hot-path infrastructure component where fast rejection matters." },
    { slug: "message-queue", note: "Useful follow-up for durable async logging and backpressure." },
  ],
};
