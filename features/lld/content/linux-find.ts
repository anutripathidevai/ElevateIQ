import type { LLDProblemContent } from "../types";

export const linuxFind: LLDProblemContent = {
  slug: "linux-find",

  statementMD: [
    "Design the object model for a simplified Linux 'find' command. Given a root directory, traverse the file tree, evaluate each node against composable filter predicates, and apply an action to every matching node.",
    "",
    "The core interview challenge is not path parsing or operating-system calls. It is designing a traversal engine that is closed for modification while filters remain open for extension. Adding **OwnerFilter**, **ModifiedAfterFilter**, or **PermissionFilter** should mean adding a class, not changing **FindCommand**.",
  ].join("\n"),

  businessContextMD: [
    "Search tools appear in developer platforms, backup systems, sync engines, document stores, and admin consoles. A clean 'find' design tests whether a candidate can separate traversal from matching policy and from output behavior.",
    "",
    "Interviewers use this problem to probe composition, recursion, iterators, and the open/closed principle. The strongest solution treats filters as a predicate tree: leaf filters check one fact, logical filters combine other filters, and the command only asks one question: does this node match?",
  ].join("\n"),

  functionalRequirements: [
    "Represent a directory tree containing directories and files.",
    "Traverse the tree from a provided root in deterministic depth-first order.",
    "Support filtering by exact file or directory name.",
    "Support filtering by file extension, ignoring directories for extension checks.",
    "Support filtering by exact size and minimum size for files.",
    "Combine filters with AND, OR, and NOT without changing traversal logic.",
    "Apply an action to every matching node, such as printing the name or collecting results.",
    "Allow new filters to be introduced by implementing the same **Filter** interface.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Open for filters",
      detailMD:
        "The traversal engine must depend only on **Filter**. New leaf filters and new logical filters should not require edits to **FindCommand**.",
    },
    {
      label: "Predictable traversal",
      detailMD:
        "The command should visit nodes in a stable depth-first order so dry runs, tests, and user output are easy to reason about.",
    },
    {
      label: "Small memory footprint",
      detailMD:
        "Traversal should use an iterator stack proportional to tree depth rather than flattening the whole tree before matching.",
    },
    {
      label: "Safe composition",
      detailMD:
        "Composite filters should validate their children and hide their internal lists so callers cannot mutate a predicate after construction.",
    },
    {
      label: "Separation of concerns",
      detailMD:
        "Tree structure, predicate evaluation, traversal, and matched-node action must live in separate classes.",
    },
  ],

  requirementClarification: [
    {
      question: "Are we designing a full POSIX-compatible 'find' command?",
      answerMD:
        "No. The scope is an in-memory LLD model that demonstrates traversal, composable filters, and actions. Real command-line parsing, symbolic links, permissions, and file-system errors are production extensions.",
    },
    {
      question: "Should filters match directories as well as files?",
      answerMD:
        "Name filters can match any node. Extension and size filters match files only, because those predicates are file-specific in this simplified model.",
    },
    {
      question: "How are AND, OR, and NOT represented?",
      answerMD:
        "They are filters too. **AndFilter**, **OrFilter**, and **NotFilter** implement **Filter** and hold child filters, creating a Composite predicate tree.",
    },
    {
      question: "What does applying an action mean?",
      answerMD:
        "The command receives an **Action** strategy. It can print, collect, delete, archive, or emit metrics for a match without changing traversal or filtering.",
    },
    {
      question: "Do we need lazy streaming of results?",
      answerMD:
        "The reference design applies actions as it traverses. A production variant can expose an iterator or stream of matches using the same filter tree.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class FileNode {",
    "        -String name",
    "        -boolean directory",
    "        -long sizeBytes",
    "        -List~FileNode~ children",
    "        +addChild(FileNode) FileNode",
    "        +iterator() Iterator~FileNode~",
    "        +accept(Visitor) void",
    "    }",
    "    class Visitor {",
    "        <<interface>>",
    "        +visit(FileNode) void",
    "    }",
    "    class Filter {",
    "        <<interface>>",
    "        +matches(FileNode) boolean",
    "        +and(Filter) Filter",
    "        +or(Filter) Filter",
    "        +negate() Filter",
    "    }",
    "    class NameFilter",
    "    class ExtensionFilter",
    "    class SizeFilter",
    "    class AndFilter",
    "    class OrFilter",
    "    class NotFilter",
    "    class FindCommand {",
    "        -Filter filter",
    "        -Action action",
    "        +execute(FileNode) void",
    "        +visit(FileNode) void",
    "    }",
    "    class Action {",
    "        <<interface>>",
    "        +apply(FileNode) void",
    "    }",
    "    FileNode o-- FileNode",
    "    FileNode ..> Visitor",
    "    Filter <|.. NameFilter",
    "    Filter <|.. ExtensionFilter",
    "    Filter <|.. SizeFilter",
    "    Filter <|.. AndFilter",
    "    Filter <|.. OrFilter",
    "    Filter <|.. NotFilter",
    "    AndFilter o-- Filter",
    "    OrFilter o-- Filter",
    "    NotFilter o-- Filter",
    "    FindCommand ..|> Visitor",
    "    FindCommand ..> Filter",
    "    FindCommand ..> Action",
  ].join("\n"),
  classDiagramCaptionMD:
    "The key shape is the predicate tree. Leaf filters and logical filters share the same **Filter** interface, so **FindCommand** is unaware of the concrete matching rules.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor User",
    "    participant Cmd as FindCommand",
    "    participant Root as FileNode",
    "    participant Iter as DepthFirstIterator",
    "    participant F as Filter",
    "    participant Act as Action",
    "    User->>Cmd: execute(root)",
    "    Cmd->>Root: accept(commandVisitor)",
    "    Root->>Iter: iterator()",
    "    loop each node",
    "        Iter-->>Root: next node",
    "        Root->>Cmd: visit(node)",
    "        Cmd->>F: matches(node)",
    "        alt matched",
    "            Cmd->>Act: apply(node)",
    "        else rejected",
    "            Cmd-->>Cmd: continue",
    "        end",
    "    end",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "Traversal, filtering, and action execution remain separate: the tree exposes iteration, the filter answers true or false, and the action handles the match.",

  entities: [
    {
      name: "FileNode",
      responsibilityMD:
        "Represents either a directory or a file. It owns child nodes for directories and exposes a depth-first iterator plus a visitor entry point.",
      attributes: ["name", "directory", "sizeBytes", "children"],
    },
    {
      name: "Filter",
      responsibilityMD:
        "Predicate interface for all matching rules. The traversal engine depends only on **matches**, plus convenience composition methods.",
      attributes: ["matches(node)", "and(filter)", "or(filter)", "negate()"],
    },
    {
      name: "NameFilter",
      responsibilityMD:
        "Leaf predicate that matches a node by exact name. It works for both directories and files.",
      attributes: ["expectedName"],
    },
    {
      name: "ExtensionFilter",
      responsibilityMD:
        "Leaf predicate that matches file extensions after normalizing case and ignoring an optional leading dot.",
      attributes: ["extension"],
    },
    {
      name: "SizeFilter",
      responsibilityMD:
        "Leaf predicate that supports exact-size and minimum-size comparisons for files.",
      attributes: ["bytes", "mode"],
    },
    {
      name: "AndFilter / OrFilter / NotFilter",
      responsibilityMD:
        "Composite predicates that hold child filters. They let callers build arbitrarily nested boolean expressions.",
      attributes: ["filters", "child"],
    },
    {
      name: "FindCommand",
      responsibilityMD:
        "Traversal coordinator. It visits nodes, asks the configured filter whether a node matches, and invokes the configured action.",
      attributes: ["filter", "action"],
    },
    {
      name: "Action",
      responsibilityMD:
        "Strategy for what happens to each matching node. Printing is only one possible action.",
      attributes: ["apply(node)"],
    },
  ],

  patternsUsed: [
    {
      name: "Composite",
      whyMD:
        "**AndFilter**, **OrFilter**, and **NotFilter** are filters that contain other filters. This makes a complex boolean expression look like a single **Filter** to the traversal engine.",
    },
    {
      name: "Strategy",
      whyMD:
        "**Filter** is the matching strategy and **Action** is the match-handling strategy. **FindCommand** is configured with both and does not know the concrete policy.",
    },
    {
      name: "Visitor",
      whyMD:
        "**FileNode.accept** receives a visitor, and **FindCommand** implements the visit operation. This keeps node traversal and node processing decoupled.",
    },
    {
      name: "Iterator",
      whyMD:
        "**FileNode** implements **Iterable** and returns a depth-first iterator. Traversal state lives in the iterator stack, not in the command.",
    },
  ],

  designSteps: [
    {
      title: "Start with a tree node that can be traversed",
      detailMD:
        "Represent both files and directories as **FileNode** so traversal logic is uniform. A directory owns children; a file has size and no children.",
      code: [
        "public final class FileNode implements Iterable<FileNode> {",
        "    private final String name;",
        "    private final boolean directory;",
        "    private final long sizeBytes;",
        "    private final List<FileNode> children = new ArrayList<>();",
        "}",
      ].join("\n"),
    },
    {
      title: "Define a small predicate interface",
      detailMD:
        "**Filter** is the only concept the command needs for matching. The default composition methods make client code read like a query expression.",
      code: [
        "@FunctionalInterface",
        "public interface Filter {",
        "    boolean matches(FileNode node);",
        "",
        "    default Filter and(Filter other) {",
        "        return new AndFilter(this, other);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Implement leaf filters independently",
      detailMD:
        "Each leaf filter checks one field and owns its own boundary rules. **ExtensionFilter** ignores directories; **SizeFilter** ignores directories and supports exact or minimum size.",
    },
    {
      title: "Make logical operators filters too",
      detailMD:
        "Logical filters implement the same interface as leaf filters. This is the Composite move: **AndFilter** can contain **OrFilter**, which can contain **NotFilter**, and the command still sees one **Filter**.",
      code: [
        "public final class AndFilter implements Filter {",
        "    private final List<Filter> filters;",
        "",
        "    public boolean matches(FileNode node) {",
        "        for (Filter filter : filters) {",
        "            if (!filter.matches(node)) {",
        "                return false;",
        "            }",
        "        }",
        "        return true;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      title: "Keep traversal ignorant of concrete filters",
      detailMD:
        "**FindCommand** receives a root, a filter, and an action. It visits nodes and delegates both decisions: whether the node matches and what to do with it.",
    },
    {
      title: "Treat actions as another extension point",
      detailMD:
        "Printing, collecting, deleting, or archiving matches should not create subclasses of the command. They are **Action** implementations passed into the command.",
    },
  ],

  implementation: [
    {
      filename: "FileNode.java",
      language: "java",
      content: [
        "import java.util.ArrayDeque;",
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.Deque;",
        "import java.util.Iterator;",
        "import java.util.List;",
        "import java.util.NoSuchElementException;",
        "import java.util.Objects;",
        "",
        "public final class FileNode implements Iterable<FileNode> {",
        "    private final String name;",
        "    private final boolean directory;",
        "    private final long sizeBytes;",
        "    private final List<FileNode> children = new ArrayList<>();",
        "",
        "    private FileNode(String name, boolean directory, long sizeBytes) {",
        "        if (!directory && sizeBytes < 0) {",
        "            throw new IllegalArgumentException(\"File size cannot be negative\");",
        "        }",
        "        this.name = Objects.requireNonNull(name, \"name\");",
        "        this.directory = directory;",
        "        this.sizeBytes = directory ? 0 : sizeBytes;",
        "    }",
        "",
        "    public static FileNode directory(String name) {",
        "        return new FileNode(name, true, 0);",
        "    }",
        "",
        "    public static FileNode file(String name, long sizeBytes) {",
        "        return new FileNode(name, false, sizeBytes);",
        "    }",
        "",
        "    public FileNode addChild(FileNode child) {",
        "        if (!directory) {",
        "            throw new IllegalStateException(\"Files cannot have children\");",
        "        }",
        "        children.add(Objects.requireNonNull(child, \"child\"));",
        "        return this;",
        "    }",
        "",
        "    public String name() {",
        "        return name;",
        "    }",
        "",
        "    public boolean isDirectory() {",
        "        return directory;",
        "    }",
        "",
        "    public long sizeBytes() {",
        "        return sizeBytes;",
        "    }",
        "",
        "    public List<FileNode> children() {",
        "        return Collections.unmodifiableList(children);",
        "    }",
        "",
        "    public String extension() {",
        "        int dot = name.lastIndexOf('.');",
        "        if (dot < 0 || dot == name.length() - 1) {",
        "            return \"\";",
        "        }",
        "        return name.substring(dot + 1).toLowerCase();",
        "    }",
        "",
        "    public void accept(Visitor visitor) {",
        "        Objects.requireNonNull(visitor, \"visitor\");",
        "        for (FileNode node : this) {",
        "            visitor.visit(node);",
        "        }",
        "    }",
        "",
        "    @Override",
        "    public Iterator<FileNode> iterator() {",
        "        return new DepthFirstIterator(this);",
        "    }",
        "",
        "    public interface Visitor {",
        "        void visit(FileNode node);",
        "    }",
        "",
        "    private static final class DepthFirstIterator implements Iterator<FileNode> {",
        "        private final Deque<FileNode> stack = new ArrayDeque<>();",
        "",
        "        private DepthFirstIterator(FileNode root) {",
        "            stack.push(root);",
        "        }",
        "",
        "        @Override",
        "        public boolean hasNext() {",
        "            return !stack.isEmpty();",
        "        }",
        "",
        "        @Override",
        "        public FileNode next() {",
        "            if (stack.isEmpty()) {",
        "                throw new NoSuchElementException();",
        "            }",
        "            FileNode current = stack.pop();",
        "            List<FileNode> childList = current.children;",
        "            for (int i = childList.size() - 1; i >= 0; i--) {",
        "                stack.push(childList.get(i));",
        "            }",
        "            return current;",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Filter.java",
      language: "java",
      content: [
        "@FunctionalInterface",
        "public interface Filter {",
        "    boolean matches(FileNode node);",
        "",
        "    default Filter and(Filter other) {",
        "        return new AndFilter(this, other);",
        "    }",
        "",
        "    default Filter or(Filter other) {",
        "        return new OrFilter(this, other);",
        "    }",
        "",
        "    default Filter negate() {",
        "        return new NotFilter(this);",
        "    }",
        "",
        "    static Filter alwaysTrue() {",
        "        return node -> true;",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "NameFilter.java",
      language: "java",
      content: [
        "import java.util.Locale;",
        "import java.util.Objects;",
        "",
        "public final class NameFilter implements Filter {",
        "    private final String expectedName;",
        "",
        "    public NameFilter(String expectedName) {",
        "        this.expectedName = Objects.requireNonNull(expectedName, \"expectedName\");",
        "    }",
        "",
        "    @Override",
        "    public boolean matches(FileNode node) {",
        "        return node.name().equals(expectedName);",
        "    }",
        "}",
        "",
        "final class ExtensionFilter implements Filter {",
        "    private final String extension;",
        "",
        "    ExtensionFilter(String extension) {",
        "        String normalized = Objects.requireNonNull(extension, \"extension\").toLowerCase(Locale.ROOT);",
        "        this.extension = normalized.startsWith(\".\") ? normalized.substring(1) : normalized;",
        "    }",
        "",
        "    @Override",
        "    public boolean matches(FileNode node) {",
        "        return !node.isDirectory() && node.extension().equals(extension);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "SizeFilter.java",
      language: "java",
      content: [
        "public final class SizeFilter implements Filter {",
        "    private final long bytes;",
        "    private final Mode mode;",
        "",
        "    private SizeFilter(long bytes, Mode mode) {",
        "        if (bytes < 0) {",
        "            throw new IllegalArgumentException(\"Size cannot be negative\");",
        "        }",
        "        this.bytes = bytes;",
        "        this.mode = mode;",
        "    }",
        "",
        "    public static SizeFilter exact(long bytes) {",
        "        return new SizeFilter(bytes, Mode.EXACT);",
        "    }",
        "",
        "    public static SizeFilter atLeast(long bytes) {",
        "        return new SizeFilter(bytes, Mode.AT_LEAST);",
        "    }",
        "",
        "    @Override",
        "    public boolean matches(FileNode node) {",
        "        if (node.isDirectory()) {",
        "            return false;",
        "        }",
        "        if (mode == Mode.EXACT) {",
        "            return node.sizeBytes() == bytes;",
        "        }",
        "        return node.sizeBytes() >= bytes;",
        "    }",
        "",
        "    private enum Mode {",
        "        EXACT,",
        "        AT_LEAST",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "AndFilter.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.List;",
        "import java.util.Objects;",
        "",
        "public final class AndFilter implements Filter {",
        "    private final List<Filter> filters;",
        "",
        "    public AndFilter(Filter... filters) {",
        "        this.filters = copyOf(filters);",
        "    }",
        "",
        "    @Override",
        "    public boolean matches(FileNode node) {",
        "        for (Filter filter : filters) {",
        "            if (!filter.matches(node)) {",
        "                return false;",
        "            }",
        "        }",
        "        return true;",
        "    }",
        "",
        "    static List<Filter> copyOf(Filter... filters) {",
        "        if (filters.length == 0) {",
        "            throw new IllegalArgumentException(\"At least one filter is required\");",
        "        }",
        "        List<Filter> copy = new ArrayList<>();",
        "        for (Filter filter : filters) {",
        "            copy.add(Objects.requireNonNull(filter, \"filter\"));",
        "        }",
        "        return Collections.unmodifiableList(copy);",
        "    }",
        "}",
        "",
        "final class OrFilter implements Filter {",
        "    private final List<Filter> filters;",
        "",
        "    OrFilter(Filter... filters) {",
        "        this.filters = AndFilter.copyOf(filters);",
        "    }",
        "",
        "    @Override",
        "    public boolean matches(FileNode node) {",
        "        for (Filter filter : filters) {",
        "            if (filter.matches(node)) {",
        "                return true;",
        "            }",
        "        }",
        "        return false;",
        "    }",
        "}",
        "",
        "final class NotFilter implements Filter {",
        "    private final Filter child;",
        "",
        "    NotFilter(Filter child) {",
        "        this.child = Objects.requireNonNull(child, \"child\");",
        "    }",
        "",
        "    @Override",
        "    public boolean matches(FileNode node) {",
        "        return !child.matches(node);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "FindCommand.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "",
        "public final class FindCommand implements FileNode.Visitor {",
        "    private final Filter filter;",
        "    private final Action action;",
        "",
        "    public FindCommand(Filter filter, Action action) {",
        "        this.filter = Objects.requireNonNull(filter, \"filter\");",
        "        this.action = Objects.requireNonNull(action, \"action\");",
        "    }",
        "",
        "    public void execute(FileNode root) {",
        "        Objects.requireNonNull(root, \"root\").accept(this);",
        "    }",
        "",
        "    @Override",
        "    public void visit(FileNode node) {",
        "        if (filter.matches(node)) {",
        "            action.apply(node);",
        "        }",
        "    }",
        "",
        "    @FunctionalInterface",
        "    public interface Action {",
        "        void apply(FileNode node);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "Main.java",
      language: "java",
      content: [
        "public class Main {",
        "    public static void main(String[] args) {",
        "        FileNode root = FileNode.directory(\"repo\")",
        "            .addChild(FileNode.file(\"README.md\", 1200))",
        "            .addChild(FileNode.directory(\"src\")",
        "                .addChild(FileNode.file(\"App.java\", 4000))",
        "                .addChild(FileNode.file(\"AppTest.java\", 8000)))",
        "            .addChild(FileNode.directory(\"logs\")",
        "                .addChild(FileNode.file(\"app.log\", 6500))",
        "                .addChild(FileNode.file(\"debug.log\", 900)));",
        "",
        "        Filter javaFiles = new ExtensionFilter(\"java\");",
        "        Filter largeFiles = SizeFilter.atLeast(5000);",
        "        Filter logs = new ExtensionFilter(\"log\");",
        "        Filter notTests = new NotFilter(new NameFilter(\"AppTest.java\"));",
        "        Filter criteria = javaFiles.or(logs).and(largeFiles).and(notTests);",
        "",
        "        FindCommand find = new FindCommand(",
        "            criteria,",
        "            node -> System.out.println(node.name() + \" \" + node.sizeBytes() + \" bytes\")",
        "        );",
        "        find.execute(root);",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "FileNode",
      detailMD:
        "Unified tree node for files and directories. It protects the directory invariant, exposes child views safely, implements **Iterable**, and accepts a visitor for traversal-time processing.",
    },
    {
      className: "Filter",
      detailMD:
        "Tiny predicate interface used by every matching rule. Its default **and**, **or**, and **negate** methods are convenience factories for composite filters.",
    },
    {
      className: "NameFilter / ExtensionFilter",
      detailMD:
        "**NameFilter** checks exact names for any node. **ExtensionFilter** normalizes the requested extension and only matches files.",
    },
    {
      className: "SizeFilter",
      detailMD:
        "Encapsulates size comparisons for files. Static factories make the caller choose exact size or minimum size without exposing enum details.",
    },
    {
      className: "AndFilter / OrFilter / NotFilter",
      detailMD:
        "Composite filters. They store immutable child filters and implement short-circuit boolean logic while still presenting the same **Filter** interface.",
    },
    {
      className: "FindCommand / Action",
      detailMD:
        "**FindCommand** is the visitor and coordinator. **Action** is the pluggable behavior for matches, so the command does not know whether matches are printed, collected, or deleted.",
    },
    {
      className: "Main",
      detailMD:
        "Small demo wiring: builds a tree, composes extension, size, and NOT predicates, and prints the nodes that satisfy the final filter.",
    },
  ],

  dryRun: {
    inputMD:
      "Tree: repo contains README.md 1200B, src/App.java 4000B, src/AppTest.java 8000B, logs/app.log 6500B, logs/debug.log 900B. Filter: (extension java OR extension log) AND min-size 5000 AND NOT name AppTest.java. Action: print match.",
    columns: ["Step", "Visited node", "Extension or name result", "Size and NOT result", "Action"],
    rows: [
      ["1", "repo", "false because directory has no extension", "not evaluated after OR false", "skip"],
      ["2", "README.md", "false", "not evaluated after OR false", "skip"],
      ["3", "src", "false because directory has no extension", "not evaluated after OR false", "skip"],
      ["4", "App.java", "true", "4000B is below 5000B", "skip"],
      ["5", "AppTest.java", "true", "8000B passes size but NOT name fails", "skip"],
      ["6", "logs", "false because directory has no extension", "not evaluated after OR false", "skip"],
      ["7", "app.log", "true", "6500B passes and NOT name passes", "print app.log"],
      ["8", "debug.log", "true", "900B is below 5000B", "skip"],
    ],
    narrativeMD:
      "Only **app.log** reaches the action. Notice that the traversal never changes when the predicate becomes more complex; only the filter tree changes.",
  },

  complexity: [
    {
      operation: "execute traversal",
      time: "O(N × F)",
      space: "O(H)",
      note: "N nodes, H tree height, F cost of evaluating the filter tree for one node.",
    },
    {
      operation: "leaf filter match",
      time: "O(1)",
      space: "O(1)",
      note: "Name, extension, exact size, and min-size checks are constant-time over stored metadata.",
    },
    {
      operation: "AND or OR filter match",
      time: "O(K)",
      space: "O(1)",
      note: "K child filters in the composite; short-circuiting often stops earlier.",
    },
    {
      operation: "NOT filter match",
      time: "O(C)",
      space: "O(1)",
      note: "C is the wrapped child filter cost.",
    },
    {
      operation: "building a composite filter",
      time: "O(K)",
      space: "O(K)",
      note: "Children are copied into an immutable list for safety.",
    },
  ],
  complexityNotesMD:
    "For ordinary in-memory metadata, traversal dominates. In a real file system, I/O and permission checks dominate, so the same design should stream nodes and handle errors without materializing all matches.",

  extensibility: [
    {
      label: "Add a new leaf filter",
      detailMD:
        "Create a class such as **OwnerFilter** or **ModifiedAfterFilter** that implements **Filter**. No change is needed in **FindCommand** or any existing composite filter.",
    },
    {
      label: "Add a new logical operator",
      detailMD:
        "A filter such as **XorFilter** can also implement **Filter** and hold children. It plugs into the same predicate tree.",
    },
    {
      label: "Add a new action",
      detailMD:
        "Implement **Action** to collect matches, delete files, archive files, or emit events. Traversal and matching stay untouched.",
    },
    {
      label: "Switch traversal policy",
      detailMD:
        "Replace the depth-first iterator with breadth-first or parallel traversal behind **FileNode.iterator** or a dedicated traversal strategy while keeping filter semantics unchanged.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Return a list of matches",
      detailMD:
        "Instead of applying an action during traversal, **FindCommand** could collect and return a list of matched nodes.",
      tradeoffsMD:
        "Simpler for small trees and tests, but it uses O(M) memory for M matches and delays action execution until traversal completes.",
    },
    {
      name: "Parse an expression into filters",
      detailMD:
        "Introduce a parser that turns user input such as name, extension, and size flags into the same filter tree.",
      tradeoffsMD:
        "Better user-facing realism, but parsing is a separate concern and can distract from the LLD core if introduced too early.",
    },
    {
      name: "Chain of filters",
      detailMD:
        "Model filtering as a pipeline where each filter either passes the node to the next filter or rejects it.",
      tradeoffsMD:
        "Readable for pure AND logic, but OR and NOT become awkward. A Composite predicate tree is more natural for arbitrary boolean expressions.",
    },
    {
      name: "Visitor per operation",
      detailMD:
        "Make every operation a separate visitor over **FileNode**, such as printing, counting, or deleting visitors.",
      tradeoffsMD:
        "Strong separation for many tree operations, but matching policy can get duplicated unless those visitors still delegate to **Filter**.",
    },
  ],

  commonMistakes: [
    "Putting a large if-else chain for name, extension, and size directly inside **FindCommand**.",
    "Representing AND and OR as flags on one filter class instead of making logical filters composable.",
    "Making **SizeFilter** match directories, which creates surprising results for directory nodes with synthetic size zero.",
    "Flattening the whole tree before matching, which wastes memory and prevents streaming actions.",
    "Hard-coding print behavior in the traversal engine instead of injecting an **Action**.",
    "Exposing mutable child lists from **FileNode**, allowing callers to mutate traversal state unexpectedly.",
    "Treating NOT as a special case in the command rather than as another filter.",
  ],

  followUps: [
    {
      question: "How would you add a modified-after date filter?",
      answerMD:
        "Add timestamp metadata to **FileNode** or an external metadata provider, then implement **ModifiedAfterFilter implements Filter**. The command and composite filters stay unchanged.",
    },
    {
      question: "How would you support user input like find root -name app.log -size +5k?",
      answerMD:
        "Add a parser layer that converts tokens into a **Filter** tree and an **Action**. Keep parsing outside the domain model so the core design remains testable.",
    },
    {
      question: "How do you prevent cycles caused by symbolic links?",
      answerMD:
        "In production, track visited inode or canonical path identifiers in the iterator and skip already-seen directories. The in-memory interview model assumes a tree.",
    },
    {
      question: "Can this be parallelized?",
      answerMD:
        "Yes for independent subtrees if filters are immutable and actions are thread-safe. The current design already helps because filter state is read-only after construction.",
    },
    {
      question: "Why prefer Composite filters over a single enum-based filter class?",
      answerMD:
        "A single enum class usually grows a switch for each new predicate or operator. Composite filters keep every new rule additive and preserve open/closed behavior.",
    },
  ],

  productionConsiderations: [
    {
      label: "Real file-system adapter",
      detailMD:
        "Use an adapter around platform APIs to stream file metadata into **FileNode**-like views. Do not bake OS calls into filters or command orchestration.",
    },
    {
      label: "Permission and I/O errors",
      detailMD:
        "Traversal should decide whether to skip unreadable directories, report errors, or fail fast. Keep that policy explicit and testable.",
    },
    {
      label: "Symlink and cycle handling",
      detailMD:
        "Track stable file identifiers to avoid infinite traversal when symbolic links point to ancestors.",
    },
    {
      label: "Action safety",
      detailMD:
        "Destructive actions such as delete should support dry-run mode, audit logging, and confirmation boundaries.",
    },
    {
      label: "Large trees",
      detailMD:
        "Use streaming traversal and backpressure for very large trees. Avoid collecting all matches unless the caller explicitly asks for it.",
    },
  ],

  interviewNotes: [
    "Did the candidate make filters composable instead of adding conditionals to traversal?",
    "Can the candidate explain why logical filters are also filters?",
    "Is the traversal order deterministic and memory-conscious?",
    "Are action, filter, and traversal responsibilities separate?",
    "Can a new predicate be added without editing **FindCommand**?",
    "Did the candidate identify real-world concerns such as symlinks, permissions, and large directories as extensions rather than core distractions?",
  ],

  quiz: [
    {
      question: "Why should **FindCommand** depend on **Filter** instead of concrete filters?",
      options: [
        "So new matching rules can be added without changing traversal",
        "So Java can inline every predicate",
        "So directories never need to be visited",
        "So actions can only print matches",
      ],
      answerIndex: 0,
      explanationMD:
        "Depending on the interface is the open/closed point. The command asks **matches** and remains unchanged as filters grow.",
    },
    {
      question: "Why are **AndFilter** and **OrFilter** examples of Composite?",
      options: [
        "They inherit from **FileNode**",
        "They contain child **Filter** objects while also implementing **Filter**",
        "They execute file-system system calls",
        "They convert actions into strings",
      ],
      answerIndex: 1,
      explanationMD:
        "A Composite object has the same interface as its children. A logical filter can be used wherever a leaf filter can be used.",
    },
    {
      question: "What should **SizeFilter.atLeast(5000)** do when it receives a directory node?",
      options: [
        "Treat the directory as size zero and maybe match",
        "Throw an exception",
        "Return false because this filter is file-specific",
        "Recursively add child sizes",
      ],
      answerIndex: 2,
      explanationMD:
        "The simplified design keeps directory size out of scope. File-specific predicates should return false for directories.",
    },
    {
      question: "Which choice best preserves the open/closed principle for a new **OwnerFilter**?",
      options: [
        "Add an owner branch to a switch in **FindCommand**",
        "Add an owner flag to **NameFilter**",
        "Rewrite all filters to know about owners",
        "Create **OwnerFilter implements Filter** and compose it with existing filters",
      ],
      answerIndex: 3,
      explanationMD:
        "A new predicate should be a new class behind the existing interface, not a modification to traversal or existing filters.",
    },
    {
      question: "What is the role of **Action** in the design?",
      options: [
        "It stores directory children",
        "It decides whether a node matches",
        "It defines what to do with each matched node",
        "It prevents the iterator from using memory",
      ],
      answerIndex: 2,
      explanationMD:
        "**Action** is a strategy for match handling. Printing, collecting, and deleting are different actions.",
    },
  ],

  practiceVariants: [
    {
      title: "Add date and owner filters",
      detailMD:
        "Extend **FileNode** metadata and add **ModifiedAfterFilter** plus **OwnerFilter**. Verify **FindCommand** stays untouched.",
      difficulty: "Intermediate",
    },
    {
      title: "Build a query parser",
      detailMD:
        "Parse a small command syntax into a filter tree with parentheses, AND, OR, and NOT precedence.",
      difficulty: "Advanced",
    },
    {
      title: "Implement safe delete action",
      detailMD:
        "Add an **Action** that supports dry-run output, confirmation, and audit logging before deleting files.",
      difficulty: "Advanced",
    },
  ],

  flashcards: [
    {
      front: "What is the main open/closed seam in Linux find?",
      back: "**FindCommand** depends on **Filter**, so new predicates are new filter classes rather than edits to traversal.",
    },
    {
      front: "Why are logical filters Composite?",
      back: "They contain child filters and implement **Filter** themselves, so a whole predicate tree behaves like one predicate.",
    },
    {
      front: "Which pattern models depth-first traversal state?",
      back: "Iterator. **FileNode.iterator** returns a stack-backed depth-first iterator.",
    },
    {
      front: "What pattern lets matched-node behavior vary?",
      back: "Strategy via **Action**. The command can print, collect, delete, or archive matches through the same interface.",
    },
    {
      front: "What should a file-specific filter do for directories?",
      back: "Return false unless directory matching is explicitly part of that filter.",
    },
    {
      front: "What does NOT wrap?",
      back: "**NotFilter** wraps exactly one child **Filter** and negates that child result.",
    },
  ],

  cheatSheetMD: [
    "**Core model:** FileNode represents both files and directories; Filter represents one match predicate; FindCommand traverses and applies Action.",
    "",
    "**Filters:** NameFilter, ExtensionFilter, and SizeFilter are leaves. AndFilter, OrFilter, and NotFilter are composite filters.",
    "",
    "**Patterns:** Composite for filter trees; Strategy for Filter and Action; Visitor for node processing; Iterator for depth-first traversal.",
    "",
    "**Flow:** execute(root) -> root.accept(visitor) -> iterator yields nodes -> filter.matches(node) -> action.apply(node) on matches.",
    "",
    "**Open/closed rule:** add new filters by implementing Filter. Do not edit FindCommand for new predicates.",
    "",
    "**Complexity:** traversal is O(N × F) time and O(H) space, where F is filter evaluation cost and H is tree height.",
    "",
    "**Production extensions:** parser, symlink cycle detection, file-system adapter, permission handling, and safe destructive actions.",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    },
    {
      title: "Refactoring Guru — Composite Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/composite",
    },
    {
      title: "Oracle Java Documentation — Iterator Interface",
      kind: "Docs",
      url: "https://docs.oracle.com/javase/8/docs/api/java/util/Iterator.html",
      author: "Oracle",
    },
    {
      title: "POSIX find utility specification",
      kind: "Docs",
      url: "https://pubs.opengroup.org/onlinepubs/9699919799/utilities/find.html",
      author: "The Open Group",
    },
  ],

  relatedProblems: [
    { slug: "file-system", note: "Shares the directory tree model and Composite thinking." },
    { slug: "text-editor", note: "Another problem where operations and traversal must stay decoupled from the data structure." },
    { slug: "google-drive", note: "Extends file metadata, search, and actions into a larger storage product." },
  ],
};
