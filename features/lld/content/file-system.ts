import type { LLDProblemContent } from "../types";

/**
 * Exemplar LLD problem — Design an In-Memory File System.
 *
 * Fresh Java implementation authored inline for the file-system catalog entry.
 */
export const fileSystem: LLDProblemContent = {
  slug: "file-system",

  statementMD: [
    "Design an **in-memory file system** that supports directories and files organized as a tree.",
    "Clients should be able to create directories, create files, read and write file contents, list paths, delete nodes, and ask for the aggregate size of any subtree.",
    "",
    "The heart of the interview is the **Composite pattern**: files and directories share a common **FileSystemNode** base, so traversal, deletion, listing, and size aggregation can treat a subtree uniformly.",
  ].join("\n"),

  businessContextMD: [
    "This problem appears in storage, developer tooling, and cloud-drive interviews because it exposes how well a candidate models hierarchy.",
    "A strong solution keeps path parsing at the facade boundary, keeps node behavior inside the node classes, and uses recursive traversal instead of scattering directory-specific checks through every operation.",
    "The in-memory constraint removes persistence and permissions so the conversation can focus on object design, invariants, and extensibility.",
  ].join("\n"),

  functionalRequirements: [
    "Create nested directories with **mkdir** using absolute paths such as **/docs/projects**.",
    "Create a file at an existing directory path with initial content.",
    "Read and replace file content through **readFile** and **writeFile**.",
    "List a directory's immediate children in deterministic order; listing a file returns that file name.",
    "Delete a file or an entire directory subtree by path, while rejecting deletion of the root.",
    "Resolve absolute paths recursively from the root and fail clearly when a component is missing or a file is used as a directory.",
    "Return the aggregate size of any path, where a file size is its content length and a directory size is the sum of descendant file sizes.",
  ],

  nonFunctionalRequirements: [
    {
      label: "Correct tree invariants",
      detailMD:
        "A directory owns unique child names, every child has exactly one parent, and the root has no parent. Operations must preserve those invariants.",
    },
    {
      label: "Low latency for interview scale",
      detailMD:
        "Path operations should be proportional to path depth plus work on the touched subtree, which is acceptable for an in-memory design.",
    },
    {
      label: "Encapsulation",
      detailMD:
        "File content changes live on **FileNode** and child management lives on **DirectoryNode**; the facade coordinates but does not mutate raw maps directly.",
    },
    {
      label: "Extensibility",
      detailMD:
        "Adding metadata, search, permissions, or alternate storage should be possible without rewriting the path traversal algorithm.",
    },
    {
      label: "Deterministic output",
      detailMD:
        "List results are sorted so demos, tests, and interview dry runs are repeatable regardless of insertion order.",
    },
  ],

  requirementClarification: [
    {
      question: "Are paths absolute or relative?",
      answerMD:
        "Assume absolute Unix-style paths beginning with **/**. Relative path support can be layered later by keeping a current working directory in a session object.",
    },
    {
      question: "Should **writeFile** create a missing file?",
      answerMD:
        "In the base design, **createFile** creates and **writeFile** updates an existing file. This keeps error handling explicit and mirrors many real file APIs.",
    },
    {
      question: "Does deleting a directory require it to be empty?",
      answerMD:
        "For the base design, deleting a directory removes its whole subtree. A safer empty-directory-only delete is an easy policy change in the facade.",
    },
    {
      question: "Do we need persistence, permissions, symbolic links, or quotas?",
      answerMD:
        "No for the core model. The design is in-memory and single-process; production concerns document where repositories, ACLs, and quotas plug in.",
    },
    {
      question: "How is file size measured?",
      answerMD:
        "Use content length in characters for the interview implementation. A production system would choose bytes and store size as metadata.",
    },
  ],

  classDiagramMermaid: [
    "classDiagram",
    "    class FileSystemNode {",
    "        <<abstract>>",
    "        -String name",
    "        -DirectoryNode parent",
    "        +getPath() String",
    "        +isDirectory() boolean",
    "        +size() int",
    "        +accept(NodeVisitor) void",
    "    }",
    "    class FileNode {",
    "        -String content",
    "        +read() String",
    "        +write(String) void",
    "        +size() int",
    "    }",
    "    class DirectoryNode {",
    "        -Map~String,FileSystemNode~ children",
    "        +add(FileSystemNode) void",
    "        +remove(String) FileSystemNode",
    "        +child(String) Optional",
    "        +iterator() Iterator",
    "        +size() int",
    "    }",
    "    class NodeVisitor {",
    "        <<interface>>",
    "        +visit(FileNode) void",
    "        +visit(DirectoryNode) void",
    "    }",
    "    class FileSystem {",
    "        -DirectoryNode root",
    "        +mkdir(String) void",
    "        +createFile(String,String) void",
    "        +readFile(String) String",
    "        +writeFile(String,String) void",
    "        +ls(String) List",
    "        +delete(String) boolean",
    "        +size(String) int",
    "        #createDirectoryNode(String) DirectoryNode",
    "        #createFileNode(String,String) FileNode",
    "    }",
    "    class Main",
    "    FileSystemNode <|-- FileNode",
    "    FileSystemNode <|-- DirectoryNode",
    "    DirectoryNode o-- FileSystemNode",
    "    FileSystem o-- DirectoryNode",
    "    FileSystemNode ..> NodeVisitor",
    "    Main ..> FileSystem",
  ].join("\n"),
  classDiagramCaptionMD:
    "The tree is modeled as a Composite: **DirectoryNode** owns children that are still **FileSystemNode** instances, while **FileNode** is a leaf. **FileSystem** is the boundary that translates paths into recursive node traversal.",

  sequenceDiagramMermaid: [
    "sequenceDiagram",
    "    actor Client",
    "    participant FS as FileSystem",
    "    participant Root as DirectoryNode",
    "    participant Dir as DirectoryNode",
    "    participant File as FileNode",
    "    Client->>FS: mkdir(/docs/projects)",
    "    FS->>Root: resolve docs recursively",
    "    Root-->>FS: docs DirectoryNode",
    "    FS->>Dir: add projects DirectoryNode",
    "    Client->>FS: createFile(/docs/projects/plan.txt, text)",
    "    FS->>Root: resolve parent recursively",
    "    Root-->>FS: projects DirectoryNode",
    "    FS->>Dir: add FileNode",
    "    Client->>FS: size(/docs)",
    "    FS->>Root: resolve docs",
    "    FS->>Dir: size()",
    "    Dir->>File: size()",
    "    File-->>Dir: content length",
    "    Dir-->>FS: aggregate size",
    "    FS-->>Client: total",
  ].join("\n"),
  sequenceDiagramCaptionMD:
    "All public operations begin at **FileSystem**, but once a path resolves to a node, recursive node methods do the real tree work.",

  entities: [
    {
      name: "FileSystem",
      responsibilityMD:
        "Facade over the tree. Validates absolute paths, resolves components recursively, exposes the API, and centralizes node creation through factory methods.",
      attributes: ["root"],
    },
    {
      name: "FileSystemNode",
      responsibilityMD:
        "Abstract Component in the Composite. Stores name and parent, computes full path, and defines the common operations **size**, **isDirectory**, and **accept**.",
      attributes: ["name", "parent"],
    },
    {
      name: "DirectoryNode",
      responsibilityMD:
        "Composite node. Owns uniquely named child nodes, supports iteration over children, delegates aggregate size to descendants, and performs pre-order visitor traversal.",
      attributes: ["children"],
    },
    {
      name: "FileNode",
      responsibilityMD:
        "Leaf node. Stores mutable file content, implements read/write, and reports size as content length.",
      attributes: ["content"],
    },
    {
      name: "NodeVisitor",
      responsibilityMD:
        "Behavior extension seam. Lets clients add traversal behavior such as printing, indexing, auditing, or statistics without adding methods to every node class.",
      attributes: ["visit(FileNode)", "visit(DirectoryNode)"],
    },
    {
      name: "Path components",
      responsibilityMD:
        "The normalized tokens produced from an absolute path. They drive the recursive descent from root to target and keep parsing outside the domain nodes.",
      attributes: ["component list", "target name"],
    },
  ],

  patternsUsed: [
    {
      name: "Composite",
      whyMD:
        "**FileSystemNode** is the common component, **FileNode** is the leaf, and **DirectoryNode** is the composite that owns child nodes. This makes **size** and visitor traversal recursive and uniform.",
    },
    {
      name: "Factory Method",
      whyMD:
        "**FileSystem.createDirectoryNode** and **createFileNode** centralize node construction. Subclasses can override them to attach metadata, quotas, or instrumented nodes without changing path operations.",
    },
    {
      name: "Iterator",
      whyMD:
        "**DirectoryNode** implements **Iterable<FileSystemNode>**, so callers can traverse children without seeing the internal map. It preserves encapsulation while supporting listing and visitors.",
    },
    {
      name: "Visitor",
      whyMD:
        "**NodeVisitor** separates traversal actions from the node classes. A printer, indexer, or metrics collector can visit files and directories without bloating the core model.",
    },
  ],

  designSteps: [
    {
      title: "Start with a shared node abstraction",
      detailMD:
        "Both files and directories need a name, parent link, path calculation, size, and visitor hook. Put that common contract in **FileSystemNode** so every public operation can resolve to one type.",
      code: [
        "public abstract class FileSystemNode {",
        "    public abstract boolean isDirectory();",
        "    public abstract int size();",
        "    public abstract void accept(NodeVisitor visitor);",
        "}",
      ].join("\n"),
    },
    {
      title: "Make directory the Composite",
      detailMD:
        "**DirectoryNode** stores children as **FileSystemNode**, not as separate file and directory collections. Aggregate size becomes a simple recursive sum.",
      code: [
        "public int size() {",
        "    int total = 0;",
        "    for (FileSystemNode child : children.values()) {",
        "        total += child.size();",
        "    }",
        "    return total;",
        "}",
      ].join("\n"),
    },
    {
      title: "Keep path parsing in the facade",
      detailMD:
        "**FileSystem** is responsible for absolute paths. It splits a path into components and recursively descends from the root, creating directories only for **mkdir**.",
      code: [
        "private FileSystemNode resolveFrom(DirectoryNode current, List<String> parts, int index, boolean createMissing) {",
        "    String name = parts.get(index);",
        "    FileSystemNode child = current.child(name).orElse(null);",
        "    if (child == null && createMissing) {",
        "        child = createDirectoryNode(name);",
        "        current.add(child);",
        "    }",
        "    return index == parts.size() - 1 ? child : resolveFrom((DirectoryNode) child, parts, index + 1, createMissing);",
        "}",
      ].join("\n"),
    },
    {
      title: "Separate create and write semantics",
      detailMD:
        "**createFile** fails when the name already exists and **writeFile** fails when the path is not an existing file. This avoids ambiguous upsert behavior during an interview.",
    },
    {
      title: "Expose iteration without exposing storage",
      detailMD:
        "**DirectoryNode.iterator** returns an unmodifiable iterator over children. The facade can list names and visitors can traverse, but no caller can mutate the backing map.",
    },
    {
      title: "Add visitor traversal as an extension seam",
      detailMD:
        "**accept** performs pre-order traversal: visit the directory, then recursively visit descendants. That gives future features like search indexing and audit logging a clean hook.",
      code: [
        "public void accept(NodeVisitor visitor) {",
        "    visitor.visit(this);",
        "    for (FileSystemNode child : children.values()) {",
        "        child.accept(visitor);",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  implementation: [
    {
      filename: "FileSystemNode.java",
      language: "java",
      content: [
        "import java.util.Objects;",
        "",
        "public abstract class FileSystemNode {",
        "    private final String name;",
        "    private DirectoryNode parent;",
        "",
        "    protected FileSystemNode(String name) {",
        "        this.name = Objects.requireNonNull(name, \"name\");",
        "        if (name.contains(\"/\")) {",
        "            throw new IllegalArgumentException(\"Node name cannot contain a slash\");",
        "        }",
        "        if (!name.isEmpty() && name.trim().isEmpty()) {",
        "            throw new IllegalArgumentException(\"Node name cannot be blank\");",
        "        }",
        "    }",
        "",
        "    public String getName() {",
        "        return name;",
        "    }",
        "",
        "    public DirectoryNode getParent() {",
        "        return parent;",
        "    }",
        "",
        "    void setParent(DirectoryNode parent) {",
        "        this.parent = parent;",
        "    }",
        "",
        "    public String getPath() {",
        "        if (parent == null) {",
        "            return name.isEmpty() ? \"/\" : \"/\" + name;",
        "        }",
        "        String parentPath = parent.getPath();",
        "        return parentPath.equals(\"/\") ? parentPath + name : parentPath + \"/\" + name;",
        "    }",
        "",
        "    public abstract boolean isDirectory();",
        "",
        "    public abstract int size();",
        "",
        "    public abstract void accept(NodeVisitor visitor);",
        "}",
      ].join("\n"),
    },
    {
      filename: "FileNode.java",
      language: "java",
      content: [
        "public class FileNode extends FileSystemNode {",
        "    private String content;",
        "",
        "    public FileNode(String name, String content) {",
        "        super(name);",
        "        this.content = content == null ? \"\" : content;",
        "    }",
        "",
        "    @Override",
        "    public boolean isDirectory() {",
        "        return false;",
        "    }",
        "",
        "    public String read() {",
        "        return content;",
        "    }",
        "",
        "    public void write(String newContent) {",
        "        content = newContent == null ? \"\" : newContent;",
        "    }",
        "",
        "    @Override",
        "    public int size() {",
        "        return content.length();",
        "    }",
        "",
        "    @Override",
        "    public void accept(NodeVisitor visitor) {",
        "        visitor.visit(this);",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "DirectoryNode.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.Iterator;",
        "import java.util.LinkedHashMap;",
        "import java.util.List;",
        "import java.util.Map;",
        "import java.util.Objects;",
        "import java.util.Optional;",
        "",
        "public class DirectoryNode extends FileSystemNode implements Iterable<FileSystemNode> {",
        "    private final Map<String, FileSystemNode> children = new LinkedHashMap<>();",
        "",
        "    public DirectoryNode(String name) {",
        "        super(name);",
        "    }",
        "",
        "    @Override",
        "    public boolean isDirectory() {",
        "        return true;",
        "    }",
        "",
        "    public Optional<FileSystemNode> child(String name) {",
        "        return Optional.ofNullable(children.get(name));",
        "    }",
        "",
        "    public List<String> childNames() {",
        "        return new ArrayList<>(children.keySet());",
        "    }",
        "",
        "    public void add(FileSystemNode node) {",
        "        Objects.requireNonNull(node, \"node\");",
        "        if (node.getName().isEmpty()) {",
        "            throw new IllegalArgumentException(\"Only the root directory may have an empty name\");",
        "        }",
        "        if (children.containsKey(node.getName())) {",
        "            throw new IllegalArgumentException(\"A child named \" + node.getName() + \" already exists\");",
        "        }",
        "        node.setParent(this);",
        "        children.put(node.getName(), node);",
        "    }",
        "",
        "    public FileSystemNode remove(String name) {",
        "        FileSystemNode removed = children.remove(name);",
        "        if (removed == null) {",
        "            throw new IllegalArgumentException(\"No child named \" + name);",
        "        }",
        "        removed.setParent(null);",
        "        return removed;",
        "    }",
        "",
        "    @Override",
        "    public Iterator<FileSystemNode> iterator() {",
        "        return Collections.unmodifiableCollection(children.values()).iterator();",
        "    }",
        "",
        "    @Override",
        "    public int size() {",
        "        int total = 0;",
        "        for (FileSystemNode child : children.values()) {",
        "            total += child.size();",
        "        }",
        "        return total;",
        "    }",
        "",
        "    @Override",
        "    public void accept(NodeVisitor visitor) {",
        "        visitor.visit(this);",
        "        for (FileSystemNode child : children.values()) {",
        "            child.accept(visitor);",
        "        }",
        "    }",
        "}",
      ].join("\n"),
    },
    {
      filename: "NodeVisitor.java",
      language: "java",
      content: [
        "public interface NodeVisitor {",
        "    void visit(FileNode file);",
        "",
        "    void visit(DirectoryNode directory);",
        "}",
      ].join("\n"),
    },
    {
      filename: "FileSystem.java",
      language: "java",
      content: [
        "import java.util.ArrayList;",
        "import java.util.Collections;",
        "import java.util.List;",
        "import java.util.Objects;",
        "",
        "public class FileSystem {",
        "    private final DirectoryNode root = new DirectoryNode(\"\");",
        "",
        "    public void mkdir(String path) {",
        "        ensureDirectory(path);",
        "    }",
        "",
        "    public void createFile(String path, String content) {",
        "        Target target = parseTarget(path);",
        "        DirectoryNode parent = resolveDirectory(target.parentPath);",
        "        if (parent.child(target.name).isPresent()) {",
        "            throw new IllegalArgumentException(\"Path already exists: \" + path);",
        "        }",
        "        parent.add(createFileNode(target.name, content));",
        "    }",
        "",
        "    public String readFile(String path) {",
        "        return resolveFile(path).read();",
        "    }",
        "",
        "    public void writeFile(String path, String content) {",
        "        resolveFile(path).write(content);",
        "    }",
        "",
        "    public List<String> ls(String path) {",
        "        FileSystemNode node = resolve(path);",
        "        if (!node.isDirectory()) {",
        "            return Collections.singletonList(node.getName());",
        "        }",
        "        List<String> names = ((DirectoryNode) node).childNames();",
        "        Collections.sort(names);",
        "        return names;",
        "    }",
        "",
        "    public boolean delete(String path) {",
        "        Target target = parseTarget(path);",
        "        DirectoryNode parent = resolveDirectory(target.parentPath);",
        "        if (!parent.child(target.name).isPresent()) {",
        "            return false;",
        "        }",
        "        parent.remove(target.name);",
        "        return true;",
        "    }",
        "",
        "    public int size(String path) {",
        "        return resolve(path).size();",
        "    }",
        "",
        "    public void traverse(String path, NodeVisitor visitor) {",
        "        Objects.requireNonNull(visitor, \"visitor\");",
        "        resolve(path).accept(visitor);",
        "    }",
        "",
        "    protected DirectoryNode createDirectoryNode(String name) {",
        "        return new DirectoryNode(name);",
        "    }",
        "",
        "    protected FileNode createFileNode(String name, String content) {",
        "        return new FileNode(name, content);",
        "    }",
        "",
        "    private DirectoryNode ensureDirectory(String path) {",
        "        List<String> parts = components(path);",
        "        if (parts.isEmpty()) {",
        "            return root;",
        "        }",
        "        FileSystemNode node = resolveFrom(root, parts, 0, true);",
        "        if (!node.isDirectory()) {",
        "            throw new IllegalArgumentException(\"Path is a file: \" + path);",
        "        }",
        "        return (DirectoryNode) node;",
        "    }",
        "",
        "    private FileSystemNode resolve(String path) {",
        "        List<String> parts = components(path);",
        "        return parts.isEmpty() ? root : resolveFrom(root, parts, 0, false);",
        "    }",
        "",
        "    private DirectoryNode resolveDirectory(String path) {",
        "        FileSystemNode node = resolve(path);",
        "        if (!node.isDirectory()) {",
        "            throw new IllegalArgumentException(\"Path is not a directory: \" + path);",
        "        }",
        "        return (DirectoryNode) node;",
        "    }",
        "",
        "    private FileNode resolveFile(String path) {",
        "        FileSystemNode node = resolve(path);",
        "        if (node.isDirectory()) {",
        "            throw new IllegalArgumentException(\"Path is not a file: \" + path);",
        "        }",
        "        return (FileNode) node;",
        "    }",
        "",
        "    private FileSystemNode resolveFrom(DirectoryNode current, List<String> parts, int index, boolean createMissingDirectories) {",
        "        String name = parts.get(index);",
        "        FileSystemNode child = current.child(name).orElse(null);",
        "        if (child == null) {",
        "            if (!createMissingDirectories) {",
        "                throw new IllegalArgumentException(\"Missing path component: \" + name);",
        "            }",
        "            child = createDirectoryNode(name);",
        "            current.add(child);",
        "        }",
        "        if (index == parts.size() - 1) {",
        "            return child;",
        "        }",
        "        if (!child.isDirectory()) {",
        "            throw new IllegalArgumentException(\"Cannot traverse through file: \" + child.getPath());",
        "        }",
        "        return resolveFrom((DirectoryNode) child, parts, index + 1, createMissingDirectories);",
        "    }",
        "",
        "    private Target parseTarget(String path) {",
        "        List<String> parts = components(path);",
        "        if (parts.isEmpty()) {",
        "            throw new IllegalArgumentException(\"Root cannot be used as a file or delete target\");",
        "        }",
        "        String name = parts.get(parts.size() - 1);",
        "        String parentPath = parts.size() == 1 ? \"/\" : \"/\" + String.join(\"/\", parts.subList(0, parts.size() - 1));",
        "        return new Target(parentPath, name);",
        "    }",
        "",
        "    private List<String> components(String path) {",
        "        Objects.requireNonNull(path, \"path\");",
        "        if (!path.startsWith(\"/\")) {",
        "            throw new IllegalArgumentException(\"Path must be absolute: \" + path);",
        "        }",
        "        List<String> result = new ArrayList<>();",
        "        for (String part : path.split(\"/\")) {",
        "            if (!part.isEmpty()) {",
        "                result.add(part);",
        "            }",
        "        }",
        "        return result;",
        "    }",
        "",
        "    private static class Target {",
        "        private final String parentPath;",
        "        private final String name;",
        "",
        "        private Target(String parentPath, String name) {",
        "            this.parentPath = parentPath;",
        "            this.name = name;",
        "        }",
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
        "        FileSystem fs = new FileSystem();",
        "",
        "        fs.mkdir(\"/docs/projects\");",
        "        fs.createFile(\"/docs/readme.txt\", \"hello\");",
        "        fs.createFile(\"/docs/projects/plan.txt\", \"draft\");",
        "",
        "        System.out.println(fs.ls(\"/docs\"));",
        "        System.out.println(fs.readFile(\"/docs/readme.txt\"));",
        "",
        "        fs.writeFile(\"/docs/readme.txt\", \"hello world\");",
        "        System.out.println(fs.size(\"/docs\"));",
        "",
        "        fs.traverse(\"/docs\", new NodeVisitor() {",
        "            @Override",
        "            public void visit(FileNode file) {",
        "                System.out.println(\"FILE \" + file.getPath() + \" bytes=\" + file.size());",
        "            }",
        "",
        "            @Override",
        "            public void visit(DirectoryNode directory) {",
        "                System.out.println(\"DIR  \" + directory.getPath());",
        "            }",
        "        });",
        "",
        "        fs.delete(\"/docs/projects/plan.txt\");",
        "        System.out.println(fs.size(\"/docs\"));",
        "    }",
        "}",
      ].join("\n"),
    },
  ],

  classExplanations: [
    {
      className: "FileSystemNode",
      detailMD:
        "The abstract Component. It owns the common identity fields, parent wiring, full-path calculation, and the shared contract that both files and directories implement.",
    },
    {
      className: "FileNode",
      detailMD:
        "The leaf in the Composite. It stores content, exposes read/write, returns content length as size, and accepts a visitor by dispatching to **visit(FileNode)**.",
    },
    {
      className: "DirectoryNode",
      detailMD:
        "The Composite node. It owns a name-to-child map, rejects duplicate child names, exposes an iterator instead of the map, recursively sums sizes, and performs pre-order visitor traversal.",
    },
    {
      className: "NodeVisitor",
      detailMD:
        "The Visitor interface. It provides separate hooks for **FileNode** and **DirectoryNode**, allowing clients to add traversal behavior without modifying node classes.",
    },
    {
      className: "FileSystem",
      detailMD:
        "The facade and path resolver. Public methods parse absolute paths, recursively resolve nodes from root, enforce create/write/delete semantics, and use factory methods for node creation.",
    },
    {
      className: "Main",
      detailMD:
        "A compact demonstration that creates directories and files, lists a directory, reads and writes a file, computes subtree size, traverses with a visitor, and deletes a file.",
    },
  ],

  dryRun: {
    inputMD:
      "Actions: **mkdir(/docs/projects)**, **createFile(/docs/readme.txt, hello)**, **createFile(/docs/projects/plan.txt, draft)**, **writeFile(/docs/readme.txt, hello world)**, **size(/docs)**, **delete(/docs/projects/plan.txt)**.",
    columns: ["Step", "Operation", "Resolved target", "Tree effect", "Result"],
    rows: [
      ["1", "mkdir /docs/projects", "root then docs", "Create docs and projects directories", "No output"],
      ["2", "createFile /docs/readme.txt", "parent /docs", "Add readme.txt with length 5", "File created"],
      ["3", "createFile /docs/projects/plan.txt", "parent /docs/projects", "Add plan.txt with length 5", "File created"],
      ["4", "writeFile /docs/readme.txt", "file readme.txt", "Replace content with length 11", "File updated"],
      ["5", "size /docs", "directory docs", "Sum readme 11 + plan 5 recursively", "16"],
      ["6", "delete /docs/projects/plan.txt", "parent /docs/projects", "Remove plan.txt from children", "true"],
      ["7", "size /docs", "directory docs", "Sum remaining readme 11", "11"],
    ],
    narrativeMD:
      "The important moment is Step 5: **FileSystem** only resolves **/docs**. The recursive **DirectoryNode.size** method performs the aggregate calculation by treating every child as a **FileSystemNode**.",
  },

  complexity: [
    {
      operation: "mkdir",
      time: "O(D)",
      space: "O(D)",
      note: "D is the number of path components. Missing directory nodes may be allocated along the path.",
    },
    {
      operation: "createFile",
      time: "O(D)",
      space: "O(1)",
      note: "Resolve the parent directory recursively, then insert one child into a map.",
    },
    {
      operation: "readFile / writeFile",
      time: "O(D)",
      space: "O(1)",
      note: "Resolve the file path. Replacing content stores the new string reference in this simplified model.",
    },
    {
      operation: "ls",
      time: "O(D + C log C)",
      space: "O(C)",
      note: "Resolve the path, copy C child names, and sort them for deterministic output.",
    },
    {
      operation: "delete",
      time: "O(D)",
      space: "O(1)",
      note: "Resolve the parent and remove the target child; garbage collection reclaims the detached subtree.",
    },
    {
      operation: "size",
      time: "O(D + N)",
      space: "O(H)",
      note: "Resolve the starting node, then recursively visit N nodes in that subtree. H is recursion height.",
    },
  ],
  complexityNotesMD:
    "The design optimizes for clarity. If **size** becomes a hot path, cache subtree sizes on directories and update ancestors on file writes, creates, and deletes; that trades simpler reads for stricter mutation bookkeeping.",

  extensibility: [
    {
      label: "Metadata and permissions",
      detailMD:
        "Add owner, timestamps, permissions, or ACLs to **FileSystemNode**. Keep authorization checks in **FileSystem** before mutation so nodes remain focused on tree behavior.",
    },
    {
      label: "Cached directory sizes",
      detailMD:
        "Store **cachedSize** on **DirectoryNode** and update ancestors during create, write, and delete. This changes **size** from subtree traversal to O(D).",
    },
    {
      label: "Search and indexing",
      detailMD:
        "Implement a **NodeVisitor** that indexes file names, content, or metadata. Traversal stays unchanged and the node classes do not gain search-specific methods.",
    },
    {
      label: "Persistence",
      detailMD:
        "Override factory methods to create repository-backed node types or add a **Repository** layer behind **FileSystem** for snapshots and recovery.",
    },
    {
      label: "Relative paths",
      detailMD:
        "Introduce a session object with a current directory and normalize relative paths before calling the existing absolute-path facade.",
    },
  ],

  alternativeDesigns: [
    {
      name: "Flat path map",
      detailMD:
        "Store every absolute path in a **Map<String, Node>** and make each operation a direct key lookup.",
      tradeoffsMD:
        "Simple and fast for point lookups, but rename, delete subtree, and aggregate size become path-prefix operations. It also hides the Composite relationship interviewers expect.",
    },
    {
      name: "Trie without node polymorphism",
      detailMD:
        "Use one trie node class with a boolean flag for file versus directory and optional content.",
      tradeoffsMD:
        "Fewer classes, but behavior fills with conditionals. The design is less extensible than separate **FileNode** and **DirectoryNode** subclasses.",
    },
    {
      name: "Size-cached Composite",
      detailMD:
        "Keep the same tree, but each directory stores aggregate size and mutations update the ancestor chain.",
      tradeoffsMD:
        "Makes **size** cheap but complicates every write, create, and delete. A missed update causes silent inconsistency.",
    },
  ],

  commonMistakes: [
    "Representing paths as raw strings everywhere and never building a real tree.",
    "Putting content fields on directories or child maps on files, which blurs leaf and composite responsibilities.",
    "Letting external callers mutate the directory child map directly.",
    "Making **writeFile** silently create parent directories and files without clarifying upsert semantics.",
    "Calculating directory size in **FileSystem** with type checks instead of letting nodes implement **size** polymorphically.",
    "Forgetting to reject deletion of the root, leaving the facade with no stable aggregate root.",
    "Skipping deterministic sort in **ls**, causing flaky demos and tests.",
  ],

  followUps: [
    {
      question: "How would you support **move** and **rename**?",
      answerMD:
        "Resolve the source parent and destination parent, remove the source child, validate the new name is free, then add it to the destination. Guard against moving a directory into its own descendant.",
    },
    {
      question: "How do you make **size** O(1) for directories?",
      answerMD:
        "Cache aggregate size on each directory. On file content changes, create, and delete, propagate the size delta up the parent chain to root.",
    },
    {
      question: "How would you add **find by name**?",
      answerMD:
        "Add a **NodeVisitor** that records nodes whose names match a predicate. The traversal can start at any resolved directory and does not require changing node classes.",
    },
    {
      question: "What changes for concurrent access?",
      answerMD:
        "Use a read-write lock around the facade or finer-grained locks per directory. Mutations must make path resolution plus child update atomic for the touched parent.",
    },
    {
      question: "How would symbolic links affect this design?",
      answerMD:
        "Add a new **SymlinkNode** leaf with a target path and detect cycles during resolution. This is a deliberate extension because symlinks complicate traversal and deletion semantics.",
    },
  ],

  productionConsiderations: [
    {
      label: "Durability",
      detailMD:
        "An in-memory tree disappears on restart. Persist snapshots or append a write-ahead log of operations so the tree can be rebuilt safely.",
    },
    {
      label: "Concurrency",
      detailMD:
        "Multiple clients require locking. Start with a facade-level read-write lock, then move to directory-level locks if contention appears.",
    },
    {
      label: "Memory limits",
      detailMD:
        "Large file contents should not live as Java strings inside nodes. Store blocks externally and keep metadata plus block references in **FileNode**.",
    },
    {
      label: "Path normalization",
      detailMD:
        "Production code must handle repeated slashes, **.**, **..**, Unicode normalization, reserved names, and maximum path length consistently.",
    },
    {
      label: "Observability",
      detailMD:
        "Track operation counts, latency by operation, tree size, file count, and failed path resolutions to diagnose misuse and growth patterns.",
    },
  ],

  interviewNotes: [
    "Did the candidate identify Composite early and use it to remove type-check-heavy traversal?",
    "Are path parsing and recursive resolution isolated inside the facade?",
    "Do files and directories have crisp, separate responsibilities?",
    "Are edge cases clear: root path, missing component, duplicate name, file used as directory, delete root?",
    "Can the design evolve toward permissions, search, cached sizes, and persistence without rewriting the core tree?",
  ],

  quiz: [
    {
      question: "Why is **FileSystemNode** the base type for both files and directories?",
      options: [
        "So operations like **size** and **accept** can treat a subtree uniformly",
        "So every node stores file content",
        "So path parsing can be skipped",
        "So Java maps can sort names automatically",
      ],
      answerIndex: 0,
      explanationMD:
        "That is the Composite pattern: clients operate on the common component while leaves and composites implement behavior differently.",
    },
    {
      question: "Where should recursive path traversal live in this design?",
      options: [
        "Inside every node class",
        "In **FileSystem**, because it is the facade that understands path strings",
        "In **Main**, because it is only demo code",
        "Inside **FileNode**, because files are leaves",
      ],
      answerIndex: 1,
      explanationMD:
        "**FileSystem** converts strings to nodes. After resolution, node methods handle tree behavior such as size and visitor traversal.",
    },
    {
      question: "What does the Iterator pattern protect here?",
      options: [
        "It encrypts file contents",
        "It lets clients inspect directory children without exposing the mutable child map",
        "It makes recursive size constant time",
        "It replaces the need for a root directory",
      ],
      answerIndex: 1,
      explanationMD:
        "The iterator exposes traversal over children while keeping ownership and mutation rules inside **DirectoryNode**.",
    },
    {
      question: "Why is **writeFile** separate from **createFile**?",
      options: [
        "To avoid ambiguous upsert behavior and make missing-file errors explicit",
        "Because Java cannot update strings",
        "Because directories cannot contain more than one file",
        "To make **ls** faster",
      ],
      answerIndex: 0,
      explanationMD:
        "Clear command semantics are easier to reason about in an interview and prevent accidental file creation.",
    },
    {
      question: "Which extension is a natural use of **NodeVisitor**?",
      options: [
        "Creating the root directory",
        "Changing absolute paths to relative paths",
        "Building a search index while traversing files and directories",
        "Preventing duplicate child names in a directory",
      ],
      answerIndex: 2,
      explanationMD:
        "Visitor is ideal for new traversal behavior such as indexing, printing, metrics, or auditing.",
    },
  ],

  practiceVariants: [
    {
      title: "Add rename and move",
      detailMD:
        "Implement **rename(path, newName)** and **move(source, destinationDirectory)** while preventing duplicate names and cycles.",
      difficulty: "Intermediate",
    },
    {
      title: "Cache subtree sizes",
      detailMD:
        "Make directory size queries O(1) by maintaining aggregate size deltas through parent links on every mutation.",
      difficulty: "Advanced",
    },
    {
      title: "Implement find",
      detailMD:
        "Use **NodeVisitor** to find files by name suffix, minimum size, or content predicate under a chosen directory.",
      difficulty: "Beginner",
    },
  ],

  flashcards: [
    {
      front: "Which pattern is the core of an in-memory file system tree?",
      back: "Composite: **FileSystemNode** is the component, **FileNode** is the leaf, and **DirectoryNode** is the composite.",
    },
    {
      front: "What does **FileSystem** own?",
      back: "The root directory and all path-based operations: mkdir, createFile, readFile, writeFile, ls, delete, size, and traversal.",
    },
    {
      front: "Why does **DirectoryNode** implement **Iterable<FileSystemNode>**?",
      back: "To expose child traversal without exposing or allowing mutation of the internal child map.",
    },
    {
      front: "What is the base complexity of **size(/path)**?",
      back: "O(D + N), where D is path depth and N is the number of nodes in the resolved subtree.",
    },
    {
      front: "How do you make directory size queries faster?",
      back: "Cache aggregate size on directories and propagate size deltas up the parent chain on mutations.",
    },
    {
      front: "What does **NodeVisitor** enable?",
      back: "New traversal behaviors such as printing, indexing, metrics, or audit collection without editing node classes.",
    },
  ],

  cheatSheetMD: [
    "**Core model:** FileSystem facade owns the root. FileSystemNode is the abstract component. FileNode is the leaf. DirectoryNode is the composite.",
    "",
    "**Path flow:** validate absolute path → split into components → recursively resolve from root → apply operation to the resolved node or parent.",
    "",
    "**Operations:** mkdir creates missing directories; createFile inserts a leaf under an existing directory; writeFile updates an existing leaf; ls returns sorted child names; delete detaches a subtree; size recursively aggregates file content length.",
    "",
    "**Patterns:** Composite for the tree, Factory Method for node creation, Iterator for directory children, Visitor for traversal extensions.",
    "",
    "**Invariants:** root is stable, directory child names are unique, parent links are maintained, files have no children, external callers never mutate the child map directly.",
    "",
    "**Complexity:** path operations are O(D); ls adds O(C log C); size adds O(N) for subtree traversal unless cached.",
  ].join("\n"),

  references: [
    {
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      kind: "Book",
      author: "Gamma, Helm, Johnson, Vlissides",
    },
    {
      title: "Effective Java — Item 18 and Item 52",
      kind: "Book",
      author: "Joshua Bloch",
    },
    {
      title: "Refactoring Guru — Composite Pattern",
      kind: "Docs",
      url: "https://refactoring.guru/design-patterns/composite",
    },
    {
      title: "Oracle Java Tutorials — Interfaces and Inheritance",
      kind: "Docs",
      url: "https://docs.oracle.com/javase/tutorial/java/IandI/index.html",
    },
  ],

  relatedProblems: [
    { slug: "linux-find", note: "Extends tree traversal into predicate-based search." },
    { slug: "text-editor", note: "Another in-memory model with mutation semantics and undo-friendly state." },
    { slug: "dropbox", note: "Builds from file-system objects toward sync, sharing, metadata, and durability." },
  ],
};
