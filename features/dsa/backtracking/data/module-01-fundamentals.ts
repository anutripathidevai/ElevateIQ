import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "bt-what-is-backtracking",
    moduleId: "bt-fundamentals",
    order: 1,
    title: "What is Backtracking",
    estimatedReadingMin: 8,
    tags: ["Backtracking", "DFS", "Foundations"],
    summaryMD:
      "Backtracking builds candidates one choice at a time and abandons a partial candidate as soon as it cannot lead to a valid solution.",
    sections: [
      {
        heading: "The Core Idea",
        bodyMD:
          "Backtracking is depth-first search over possible configurations. Instead of trying to guess the final answer directly, you build a partial candidate step by step. At each step, the algorithm asks which choices are legal from the current partial state, commits to one choice, explores the consequences, and then returns to try the next choice.\n\nThe word **backtrack** means retreating from a partial candidate when it is complete, invalid, or no longer useful. The retreat is not failure; it is the mechanism that lets one recursive search reuse the same state container for many alternatives.",
      },
      {
        heading: "Incremental Construction",
        bodyMD:
          "A backtracking solution treats the answer as something constructed gradually: a path of chosen numbers, a set of used positions, a partially filled board, or a string being partitioned. The current partial object is the state that the next recursive frame extends.\n\nThis is why backtracking feels different from many iterative algorithms. The central action is not scanning once from left to right. The central action is asking: what can I safely add next, and what must become true before I can record a complete answer?",
      },
      {
        heading: "Backtracking vs Enumerate Then Filter",
        bodyMD:
          "A brute-force enumerate-then-filter approach generates every complete candidate first and checks validity at the end. That is often wasteful because many candidates contain an invalid prefix that could have been rejected much earlier.\n\nBacktracking moves the validity checks into the construction process. If a partial board already has two queens attacking each other, there is no reason to place the remaining queens. If a partial sum already exceeds a positive target, deeper choices cannot repair it. Abandoning these branches early is what turns a naive exponential idea into a practical interview solution.",
      },
      {
        heading: "The Interview Mental Model",
        bodyMD:
          "In interviews, describe backtracking with three nouns: **state**, **choices**, and **base case**. The state is what the current recursion frame knows. The choices are the legal next moves from that state. The base case is the point where the partial candidate becomes complete enough to record or reject.\n\nOnce those are clear, the implementation usually follows the same rhythm: choose one option, recurse to explore it, then undo that choice so the next option starts from a clean state.",
      },
    ],
    codeExamples: [
      {
        title: "Subset search as incremental construction",
        language: "java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> answer = new ArrayList<>();
        search(nums, 0, new ArrayList<>(), answer);
        return answer;
    }

    private void search(int[] nums, int index, List<Integer> path, List<List<Integer>> answer) {
        if (index == nums.length) {
            answer.add(new ArrayList<>(path));
            return;
        }

        path.add(nums[index]);
        search(nums, index + 1, path, answer);
        path.remove(path.size() - 1);

        search(nums, index + 1, path, answer);
    }
}`,
        captionMD:
          "The path is the partial candidate. Each recursive frame decides whether the next value belongs in that candidate before moving deeper.",
      },
    ],
    keyTakeaways: [
      "Backtracking is DFS over configurations, not a separate data structure.",
      "The algorithm builds partial candidates and rejects dead branches before they become full candidates.",
      "A backtracking explanation should name the state, choices, base case, and rejection rule.",
      "Compared with enumerate then filter, backtracking moves validity checks earlier in the search.",
    ],
  },
  {
    kind: "concept",
    slug: "bt-decision-tree",
    moduleId: "bt-fundamentals",
    order: 2,
    title: "The Decision Tree",
    estimatedReadingMin: 7,
    tags: ["Backtracking", "Decision Tree", "DFS"],
    summaryMD:
      "A decision tree represents every partial state as a node, every choice as an edge, and every complete candidate as a leaf.",
    sections: [
      {
        heading: "Nodes, Edges, and Leaves",
        bodyMD:
          "The decision tree is the picture behind almost every backtracking solution. A node represents a partial state: the subset chosen so far, the permutation prefix filled so far, the board after several placements, or the string cuts already made. An edge represents one choice that transforms that state into a deeper state.\n\nLeaves are complete candidates. Some leaves become answers, and some are rejected. Good pruning also creates early leaves: places where the algorithm decides that a partial state should not grow any further.",
      },
      {
        heading: "Solving Means Walking the Tree",
        bodyMD:
          "Backtracking does not materialize the whole tree in memory. It performs a DFS walk of the tree. The call stack stores the path from the root to the current node, and each return moves the search back to the parent so another edge can be explored.\n\nThis mental model explains why undoing matters. When a recursive call returns from one child, the parent must look exactly as it did before that child was chosen. Otherwise, state from one branch leaks into its sibling branch.",
      },
      {
        heading: "A Small Permutation Tree",
        bodyMD:
          "For **nums = [1, 2, 3]**, the root is the empty prefix **[]**. Level one has prefixes **[1]**, **[2]**, and **[3]**. Under **[1]**, level two has **[1, 2]** and **[1, 3]** because only unused numbers can be placed next. The leaves under that branch are **[1, 2, 3]** and **[1, 3, 2]**.\n\nThe same pattern repeats under every first choice. The tree has depth **n**, and the branching factor shrinks because each level has fewer unused numbers. That is why permutations have factorial growth rather than simple power-set growth.",
      },
      {
        heading: "What the Tree Reveals",
        bodyMD:
          "A decision tree gives you three interview-ready insights. First, it shows the base case: when the node is deep enough to represent a complete candidate. Second, it shows the branching rule: which children a node may have. Third, it shows where pruning can safely remove entire subtrees.\n\nWhen stuck, draw the tree for the smallest nontrivial input. If you cannot label the root, the children, and the leaves, the state definition is probably not clear enough yet.",
      },
    ],
    codeExamples: [
      {
        title: "Permutation tree walk",
        language: "java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> answer = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        dfs(nums, used, new ArrayList<>(), answer);
        return answer;
    }

    private void dfs(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> answer) {
        if (path.size() == nums.length) {
            answer.add(new ArrayList<>(path));
            return;
        }

        for (int i = 0; i < nums.length; i++) {
            if (used[i]) {
                continue;
            }
            used[i] = true;
            path.add(nums[i]);
            dfs(nums, used, path, answer);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}`,
        captionMD:
          "Each loop iteration follows one edge from the current prefix node to a deeper prefix node in the decision tree.",
      },
    ],
    keyTakeaways: [
      "A node is a partial state, an edge is a choice, and a leaf is a complete candidate.",
      "Backtracking walks the decision tree with DFS instead of storing the whole tree.",
      "The call stack holds only the current root-to-node path, which is why memory is proportional to depth.",
      "Drawing a tiny tree exposes the base case, branching factor, and pruning opportunities.",
    ],
  },
  {
    kind: "concept",
    slug: "bt-state-space-search",
    moduleId: "bt-fundamentals",
    order: 3,
    title: "State Space Search",
    estimatedReadingMin: 8,
    tags: ["Backtracking", "State Space", "DFS", "Recursion"],
    summaryMD:
      "State space search views backtracking as DFS over all reachable states defined by a state representation, legal choices, and a goal condition.",
    sections: [
      {
        heading: "What a State Means",
        bodyMD:
          "A state is the complete information needed to continue the search correctly. For subsets, the state may be the current index and path. For permutations, it may be the path plus a **used[]** array. For N-Queens, it may be the current row plus columns and diagonals already occupied.\n\nThe state should include everything that changes the future and exclude history that no longer matters. If two different histories lead to the same remaining possibilities, the state can represent them the same way. If a missing detail changes which choices are legal, the state is incomplete.",
      },
      {
        heading: "Choices From a State",
        bodyMD:
          "The choices are the outgoing edges from the current state. They must be generated according to the problem's rules: unused values for permutations, later indices for combinations, safe cells for a board, or valid cut points in a string.\n\nA strong backtracking solution does not blindly try every imaginable action. It narrows the choice list to actions that are meaningful from the current state, then uses pruning checks to avoid actions that cannot succeed.",
      },
      {
        heading: "Goal, Base, and Invalid States",
        bodyMD:
          "The goal or base case says when the search should stop descending. Sometimes completion means record the current candidate, such as a subset or permutation. Sometimes it means return true immediately, such as finding any word path in a grid. Sometimes it means compare a score against the best answer found so far.\n\nInvalid states also stop the search, but they do not become answers. Examples include stepping outside a board, reusing a cell, exceeding a target with positive numbers, or placing an item that violates a constraint.",
      },
      {
        heading: "Depth-First Memory",
        bodyMD:
          "The full state space can be enormous, but backtracking usually stores only the active path through it. The recursion stack has one frame per depth level, and shared structures such as **path**, **used[]**, or a board are mutated and restored as the DFS moves.\n\nThat is why auxiliary memory is often **O(depth)** plus the structures needed to represent one state. The output itself can be much larger when the problem asks for all solutions, and that output space is normally counted separately.",
      },
    ],
    codeExamples: [
      {
        title: "Grid state space with visited cells",
        language: "java",
        code: `class Solution {
    public int countPaths(boolean[][] blocked) {
        if (blocked.length == 0 || blocked[0].length == 0) {
            return 0;
        }
        boolean[][] visited = new boolean[blocked.length][blocked[0].length];
        return search(blocked, visited, 0, 0);
    }

    private int search(boolean[][] blocked, boolean[][] visited, int row, int col) {
        int rows = blocked.length;
        int cols = blocked[0].length;
        if (row < 0 || row == rows || col < 0 || col == cols) {
            return 0;
        }
        if (blocked[row][col] || visited[row][col]) {
            return 0;
        }
        if (row == rows - 1 && col == cols - 1) {
            return 1;
        }

        visited[row][col] = true;
        int total = 0;
        total += search(blocked, visited, row + 1, col);
        total += search(blocked, visited, row - 1, col);
        total += search(blocked, visited, row, col + 1);
        total += search(blocked, visited, row, col - 1);
        visited[row][col] = false;
        return total;
    }
}`,
        captionMD:
          "The state is the current cell plus the visited cells on the active path. Invalid moves return immediately instead of expanding more states.",
      },
    ],
    keyTakeaways: [
      "State space means all states reachable by repeatedly applying legal choices.",
      "A correct state contains every detail needed to decide future choices.",
      "The base case handles complete goals, while invalid states stop without recording an answer.",
      "Backtracking searches the state space depth-first, often using memory proportional to recursion depth.",
    ],
  },
  {
    kind: "concept",
    slug: "bt-choose-explore-unchoose",
    moduleId: "bt-fundamentals",
    order: 4,
    title: "Choose, Explore, Unchoose",
    estimatedReadingMin: 8,
    tags: ["Backtracking", "Template", "Recursion", "Java"],
    summaryMD:
      "The choose, explore, unchoose template keeps recursive branches independent by applying one choice, exploring it fully, and restoring the previous state.",
    sections: [
      {
        heading: "The Three-Step Rhythm",
        bodyMD:
          "Most backtracking code is a disciplined repetition of three operations. **Choose** applies one candidate move to the current state. **Explore** recurses from the modified state. **Unchoose** restores the state so the next move can be tried from the same parent.\n\nThis rhythm is more than a coding convention. It is the correctness contract that makes a DFS tree walk possible with shared mutable objects instead of cloning the entire state at every edge.",
      },
      {
        heading: "Why Undoing Is Essential",
        bodyMD:
          "Recursive calls share references to objects like **path**, **used[]**, **board**, and running counters. If one branch appends a value or marks a cell and never restores it, the sibling branch starts from a polluted state. The output may contain extra values, miss solutions, or reject valid paths.\n\nUndoing makes each recursive frame behave as if it owns a clean snapshot of the parent state. You get the memory efficiency of mutation with the reasoning clarity of separate branches.",
      },
      {
        heading: "Common Mutable Structures",
        bodyMD:
          "A **path** list is usually undone by removing the last element. A **used[]** array is undone by resetting the chosen index to false. A board cell is undone by putting back the original marker or clearing the placement. A running sum is often passed by value, so it may not need an explicit undo.\n\nThe rule is simple: if the choice mutates shared state, the exact inverse mutation belongs after the recursive call. If a value is passed into the next frame as a new primitive value, Java restores it automatically when the frame returns.",
      },
      {
        heading: "Symmetry as a Debugging Tool",
        bodyMD:
          "Backtracking bugs are often asymmetry bugs. Look at every line that changes state before recursion and make sure a matching line restores it after recursion. The restore operation should usually be close to the recursive call so the pairing is visually obvious.\n\nWhen multiple fields change together, undo them in a consistent reverse order. That habit prevents subtle mistakes in board problems where a row placement may update columns, diagonals, and the visible board at the same time.",
      },
    ],
    codeExamples: [
      {
        title: "Generic choose, explore, unchoose template",
        language: "java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {
    static class State {
        int depth;
        int limit;

        State(int depth, int limit) {
            this.depth = depth;
            this.limit = limit;
        }
    }

    static class Choice {
    }

    private final List<State> answers = new ArrayList<>();

    public List<State> solve(int limit) {
        backtrack(new State(0, limit));
        return answers;
    }

    private void backtrack(State state) {
        if (isComplete(state)) {
            record(state);
            return;
        }

        for (Choice choice : choices(state)) {
            apply(state, choice);
            backtrack(state);
            undo(state, choice);
        }
    }

    private boolean isComplete(State state) {
        return state.depth == state.limit;
    }

    private List<Choice> choices(State state) {
        List<Choice> next = new ArrayList<>();
        next.add(new Choice());
        return next;
    }

    private void apply(State state, Choice choice) {
        state.depth++;
    }

    private void undo(State state, Choice choice) {
        state.depth--;
    }

    private void record(State state) {
        answers.add(new State(state.depth, state.limit));
    }
}`,
        captionMD:
          "The names are intentionally generic: apply the choice, recurse, then undo the same choice before trying the next one.",
      },
    ],
    keyTakeaways: [
      "Choose changes the current state, explore recurses, and unchoose restores the parent state.",
      "Undoing is required whenever branches share mutable structures such as lists, arrays, or boards.",
      "Passed-by-value primitives often avoid explicit undo because each frame owns its own value.",
      "Most backtracking bugs come from missing or mismatched restore operations.",
    ],
  },
  {
    kind: "concept",
    slug: "bt-pruning",
    moduleId: "bt-fundamentals",
    order: 5,
    title: "Pruning the Search",
    estimatedReadingMin: 8,
    tags: ["Backtracking", "Pruning", "Optimization", "Duplicates"],
    summaryMD:
      "Pruning cuts branches that cannot produce a valid, unique, or better answer, making exponential search practical on interview-sized inputs.",
    sections: [
      {
        heading: "What Pruning Does",
        bodyMD:
          "Pruning means deciding not to explore a subtree because the current partial state already proves that subtree is useless. The branch may violate a constraint, duplicate work already covered by another branch, exceed a bound, or fail to improve the best answer found so far.\n\nThe important word is **proves**. Pruning is safe only when the skipped branch cannot contain a required answer. A fast but unjustified skip changes correctness; a justified skip changes only performance.",
      },
      {
        heading: "Constraint Checks",
        bodyMD:
          "The most common pruning checks are local constraints. In N-Queens, do not place a queen in an attacked column or diagonal. In Word Search, do not step outside the grid, revisit the current path, or continue after a character mismatch. In Combination Sum with positive numbers, stop when the remaining target becomes negative.\n\nThese checks should happen before the recursive call whenever possible. The earlier you detect an impossible partial state, the larger the subtree you avoid.",
      },
      {
        heading: "Duplicate and Bound Pruning",
        bodyMD:
          "Duplicate pruning often starts by sorting. Once equal values are adjacent, a loop can skip a value when the same value has already been tried at the same recursion depth. That removes duplicate result branches without losing unique solutions.\n\nBound pruning uses arithmetic facts. If you still need **k** numbers but only **m** remain, stop. If the smallest possible continuation is already too large, stop. If the largest possible continuation is too small, stop. These bounds are especially valuable for combinations and advanced partitioning problems.",
      },
      {
        heading: "Early Return and Best Answer Pruning",
        bodyMD:
          "Some problems ask for any valid answer rather than all answers. In those cases, once a valid arrangement is found, recursive calls can return true and stop exploring siblings. Sudoku Solver and Word Search usually use this style.\n\nOptimization backtracking can also prune by comparing a partial score with the current best. If the best possible future cannot beat the best known answer, the branch is not worth exploring. The proof behind that bound is part of the algorithm, not an afterthought.",
      },
    ],
    codeExamples: [
      {
        title: "Sorted duplicate pruning for subsets",
        language: "java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> answer = new ArrayList<>();
        search(nums, 0, new ArrayList<>(), answer);
        return answer;
    }

    private void search(int[] nums, int start, List<Integer> path, List<List<Integer>> answer) {
        answer.add(new ArrayList<>(path));

        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) {
                continue;
            }
            path.add(nums[i]);
            search(nums, i + 1, path, answer);
            path.remove(path.size() - 1);
        }
    }
}`,
        captionMD:
          "After sorting, equal values are skipped only when they would start another branch at the same depth, which removes duplicate subsets without discarding unique ones.",
      },
    ],
    keyTakeaways: [
      "Pruning removes an entire subtree only when that subtree is impossible, redundant, or unable to improve the answer.",
      "Constraint checks should happen before recursion so invalid partial states do not grow deeper.",
      "Sorting enables depth-local duplicate skipping for subsets, combinations, and permutations with repeated values.",
      "Early return is appropriate when the problem asks for any valid solution instead of all solutions.",
    ],
  },
  {
    kind: "concept",
    slug: "bt-recursion-tree",
    moduleId: "bt-fundamentals",
    order: 6,
    title: "The Recursion Tree",
    estimatedReadingMin: 7,
    tags: ["Backtracking", "Recursion Tree", "Complexity"],
    summaryMD:
      "The recursion tree shows the actual calls made by the algorithm, making it the fastest way to explain traversal order, pruning, and complexity.",
    sections: [
      {
        heading: "How to Draw It",
        bodyMD:
          "Start with the initial call as the root. Label each node with the state that matters, not every local variable. For subsets, use the current index and path. For permutations, use the prefix and remaining unused values. For a board, use the row or cell being filled plus the placements already made.\n\nThen draw children by applying each legal next choice. Stop at base cases and explicitly mark whether the leaf records an answer, returns false, or gets pruned. A small input is enough; the goal is insight, not a complete picture for large **n**.",
      },
      {
        heading: "Counting Leaves",
        bodyMD:
          "Leaves often correspond to complete candidates. Subset recursion with include or exclude has **2^n** leaves because every element has two outcomes. Permutation recursion has **n!** leaves because the first position has **n** choices, the second has **n - 1**, and so on.\n\nCounting leaves gives a lower bound on time when the problem must output all solutions. If there are **2^n** subsets, no algorithm can list them in less than **O(2^n)** output steps.",
      },
      {
        heading: "Counting Internal Nodes",
        bodyMD:
          "Time is not only leaves. Every internal node also does work: checking constraints, looping over choices, marking state, and undoing state. For many backtracking families, the number of internal nodes is within the same exponential order as the leaves, so the leaf count gives the right growth class.\n\nWhen branching factor varies, use an upper bound. If every level has at most **b** choices and depth at most **d**, the tree has at most **1 + b + b^2 + ... + b^d** nodes, which is **O(b^d)** for **b > 1**.",
      },
      {
        heading: "Reading Pruning From the Tree",
        bodyMD:
          "A pruned branch is a node whose children are never drawn. Marking those cuts on the recursion tree helps interviewers see exactly what your optimization saves. It also protects correctness because you can explain why the omitted subtree cannot contain a useful answer.\n\nFor duplicate pruning, the tree shows that two sibling edges would produce the same set of descendants. For bound pruning, it shows that a partial state lacks enough remaining choices or has already exceeded a target.",
      },
    ],
    recursionTree: {
      rootLabel: "Subset recursion for [1, 2]",
      root: {
        label: "index 0, path []",
        children: [
          {
            label: "choose 1",
            children: [
              { label: "choose 2", note: "record [1, 2]" },
              { label: "skip 2", note: "record [1]" },
            ],
          },
          {
            label: "skip 1",
            children: [
              { label: "choose 2", note: "record [2]" },
              { label: "skip 2", note: "record []" },
            ],
          },
        ],
      },
      captionMD:
        "Each root-to-leaf path decides one outcome for each element. The same drawing style scales to permutations, combinations, strings, and boards.",
    },
    codeExamples: [
      {
        title: "Counting nodes in a binary recursion tree",
        language: "java",
        code: `class Solution {
    public int countSubsetTreeNodes(int n) {
        return count(0, n);
    }

    private int count(int depth, int n) {
        if (depth == n) {
            return 1;
        }

        int skip = count(depth + 1, n);
        int take = count(depth + 1, n);
        return 1 + skip + take;
    }
}`,
        captionMD:
          "The return value counts one node for the current call plus the nodes in both children, matching the drawn recursion tree.",
      },
    ],
    keyTakeaways: [
      "A recursion tree labels the calls actually made by the algorithm, not just the final outputs.",
      "Leaves often count complete candidates, while internal nodes account for loop and constraint work.",
      "A branching factor **b** and depth **d** give the common upper bound **O(b^d)**.",
      "Marking pruned nodes makes performance improvements and correctness arguments visible.",
    ],
  },
  {
    kind: "concept",
    slug: "bt-time-complexity",
    moduleId: "bt-fundamentals",
    order: 7,
    title: "Time Complexity of Backtracking",
    estimatedReadingMin: 8,
    tags: ["Backtracking", "Complexity", "Analysis"],
    summaryMD:
      "Backtracking time is the number of search nodes visited multiplied by the work done at each node or recorded solution.",
    sections: [
      {
        heading: "Start With Nodes Times Work",
        bodyMD:
          "The honest way to analyze backtracking is **number of visited nodes times work per node**. The node count comes from the recursion tree. The work per node includes generating choices, checking constraints, copying an answer, marking state, and undoing state.\n\nMany wrong complexity answers ignore copying. If a subset solution records **2^n** answers and each recorded list can have length up to **n**, the output-copying cost is **O(2^n * n)**, not just **O(2^n)**.",
      },
      {
        heading: "Subsets and Combinations",
        bodyMD:
          "Subsets usually have **2^n** leaves because every element is included or excluded. With answer copying, the standard bound is **O(2^n * n)** time and **O(n)** recursion depth excluding output.\n\nCombinations of size **k** have **C(n, k)** answers. A tight output-sensitive bound is often **O(C(n, k) * k)** when the algorithm records only size-**k** paths, plus internal loop overhead. In interviews, it is acceptable to state a safe upper bound such as **O(2^n * n)** when the combination search is a pruned subset tree.",
      },
      {
        heading: "Permutations",
        bodyMD:
          "Permutations have **n!** leaves because the number of choices shrinks from **n** to **1** across the depth levels. Recording each permutation costs **O(n)**, so the common bound is **O(n! * n)** time and **O(n)** auxiliary space excluding output.\n\nThe recursion tree also has internal nodes for partial prefixes, but they are dominated by the factorial number of leaves in the usual asymptotic statement. Duplicate pruning can reduce the number of leaves to the number of unique permutations, but the worst case remains factorial when all values are distinct.",
      },
      {
        heading: "Board and String Searches",
        bodyMD:
          "Board search bounds depend on the branching factor and depth. Word Search over a word of length **m** often uses **O(rows * cols * 3^m)** after the first step because each cell has at most three onward directions when revisiting the parent is forbidden. Sudoku is frequently bounded by **O(9^e)** where **e** is the number of empty cells, though constraint checks and choosing the next cell can prune heavily.\n\nString partitioning problems usually branch over cut positions. Palindrome Partitioning can have **O(2^n)** partitions in the worst case, with additional substring or path-copying cost depending on implementation.",
      },
      {
        heading: "Space Complexity",
        bodyMD:
          "Auxiliary space is usually the recursion depth plus the mutable structures used by one active path. A subset path has length at most **n**. A permutation has a path and **used[]**, both **O(n)**. A board search may mutate the board in place and use stack depth equal to the length of the path.\n\nOutput space is separate and can dominate everything. If the problem asks for all solutions, storing the answers costs the number of answers times the size of each answer.",
      },
    ],
    codeExamples: [
      {
        title: "Counting permutation leaves",
        language: "java",
        code: `class Solution {
    public int countPermutationLeaves(int n) {
        boolean[] used = new boolean[n];
        return search(n, used, 0);
    }

    private int search(int n, boolean[] used, int depth) {
        if (depth == n) {
            return 1;
        }

        int total = 0;
        for (int i = 0; i < n; i++) {
            if (used[i]) {
                continue;
            }
            used[i] = true;
            total += search(n, used, depth + 1);
            used[i] = false;
        }
        return total;
    }
}`,
        captionMD:
          "The leaf count grows as **n!** because each depth chooses one unused position value. A real permutation generator also copies **n** values per leaf.",
      },
    ],
    keyTakeaways: [
      "Analyze backtracking as visited nodes multiplied by work done per node or per recorded answer.",
      "Subsets are commonly **O(2^n * n)** and permutations are commonly **O(n! * n)** when copying output.",
      "Combinations are best stated with **C(n, k)** when the output size is the natural measure.",
      "Auxiliary space is usually **O(depth)** plus one active path, while output space may be exponentially larger.",
    ],
  },
  {
    kind: "concept",
    slug: "bt-when-to-use",
    moduleId: "bt-fundamentals",
    order: 8,
    title: "When to Use Backtracking",
    estimatedReadingMin: 7,
    tags: ["Backtracking", "Pattern Recognition", "Interviews"],
    summaryMD:
      "Use backtracking when a problem asks you to construct configurations through sequential choices under constraints, especially when it needs all solutions or any valid arrangement.",
    sections: [
      {
        heading: "Strong Signals",
        bodyMD:
          "Backtracking is a strong candidate when the prompt says **generate all**, **return all valid**, **find any arrangement**, **place items**, **partition a string**, **choose k**, or **try every assignment under constraints**. These phrases imply a search over configurations rather than a single linear pass.\n\nSmall input limits are another signal. If **n <= 10**, **n <= 15**, a board has a limited number of empty cells, or the prompt asks for all outputs, an exponential or factorial search may be intended.",
      },
      {
        heading: "Construct by Choices",
        bodyMD:
          "Backtracking fits when a solution can be built one decision at a time and invalid partial decisions can be rejected early. Subsets choose take or skip. Permutations choose which unused value fills the next position. Combinations choose the next index. String partitioning chooses the next cut. Board problems choose the next placement or move.\n\nIf you can clearly name the current partial candidate and the legal next choices, the choose, explore, unchoose template is probably close to the final solution.",
      },
      {
        heading: "When Another Tool Is Better",
        bodyMD:
          "Use DP when many different histories collapse into the same subproblem and the goal is a count, minimum, maximum, or feasibility answer rather than listing distinct configurations. Backtracking explores histories; DP merges equivalent states.\n\nUse greedy when a local choice can be proven safe and there is no need to revisit alternatives. Use BFS when the problem asks for the shortest number of moves in an unweighted state graph. Use plain DFS graph traversal when you are visiting existing graph nodes rather than constructing candidate objects through reversible choices.",
      },
      {
        heading: "The Interview Decision Process",
        bodyMD:
          "Before coding, ask four questions: Do I need all solutions or one valid arrangement? Can I build a partial answer one choice at a time? Can I reject invalid partial answers before completion? Are the constraints small enough for exponential search after pruning?\n\nIf the answers point to backtracking, explain the state, choices, base case, and pruning before writing code. That framing shows you are controlling the search tree instead of hoping recursion works by magic.",
      },
    ],
    codeExamples: [
      {
        title: "Generate valid parentheses by choices",
        language: "java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> answer = new ArrayList<>();
        build(n, 0, 0, new StringBuilder(), answer);
        return answer;
    }

    private void build(int n, int open, int close, StringBuilder path, List<String> answer) {
        if (path.length() == 2 * n) {
            answer.add(path.toString());
            return;
        }

        if (open < n) {
            path.append("(");
            build(n, open + 1, close, path, answer);
            path.deleteCharAt(path.length() - 1);
        }

        if (close < open) {
            path.append(")");
            build(n, open, close + 1, path, answer);
            path.deleteCharAt(path.length() - 1);
        }
    }
}`,
        captionMD:
          "The solution constructs strings by legal next choices. It prunes any prefix that would use too many closing parentheses.",
      },
    ],
    keyTakeaways: [
      "Backtracking is appropriate when solutions are configurations built through sequential reversible choices.",
      "Prompts asking for all valid outputs or any valid arrangement often point to search over a decision tree.",
      "Prefer DP when equivalent histories should merge, greedy when one provably safe choice is enough, and BFS for shortest unweighted paths.",
      "A strong interview setup names the state, choices, base case, and pruning before code.",
    ],
  },
];
