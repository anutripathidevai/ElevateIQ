import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "dp-what-is-dynamic-programming",
    moduleId: "dp-fundamentals",
    order: 1,
    title: "What Is Dynamic Programming?",
    estimatedReadingMin: 8,
    tags: ["Dynamic Programming", "Foundations", "Interview Framework"],
    summaryMD:
      "Dynamic programming is a disciplined way to solve choice-heavy problems by naming reusable states, relating them with a recurrence, and computing each state once.",
    sections: [
      {
        heading: "The Core Idea",
        bodyMD:
          "Dynamic programming is not a data structure or a trick. It is a way of organizing a problem where the answer depends on many repeated decisions. Instead of exploring the same future again and again, you define a state that represents a smaller version of the problem, solve each state once, and reuse that answer wherever it is needed.\n\nThe interview version is simple to say but hard to execute: identify what information is necessary to make the remaining choices, write the recurrence that combines smaller answers, and choose an evaluation order that guarantees dependencies are ready before they are used.",
      },
      {
        heading: "When DP Applies",
        bodyMD:
          "A problem is a strong DP candidate when it has **choices**, **overlapping subproblems**, and **optimal substructure**. Choices mean the algorithm must decide among alternatives, such as take or skip, cut here or later, match or delete, move right or down. Overlapping subproblems mean different choice paths ask for the same smaller answer. Optimal substructure means the best answer for a larger state can be built from best answers to smaller states.\n\nClimbing Stairs has choices about the last step, repeated counts for smaller stairs, and a recurrence from **n - 1** and **n - 2**. Coin Change has choices about which coin to use next, repeated amounts, and a minimum over smaller amounts. Edit Distance has choices among insert, delete, and replace, with states formed by prefixes of two strings.",
      },
      {
        heading: "DP vs Greedy vs Divide and Conquer",
        bodyMD:
          "Greedy makes one locally best choice and commits to it. It works only when a proof shows that local choices cannot block a global optimum. Dynamic programming keeps multiple competing futures alive through states, so it is safer when early decisions interact with later constraints.\n\nDivide and conquer splits a problem into independent subproblems, solves them separately, and combines the results. Merge Sort is divide and conquer because the left and right halves do not ask for the same subarray answer repeatedly. DP is the right tool when the recursive tree recomputes the same states or when the best answer to one state is needed by many parents.",
      },
      {
        heading: "The Five-Step DP Framework",
        bodyMD:
          "Use the same checklist for almost every DP interview problem:\n\n1. Define the state: write exactly what **dp[...]** means in plain English.\n2. Identify the answer state: decide which cell or variable contains the final answer.\n3. Derive the transition: express one state using smaller or simpler states, usually from the last decision or next decision.\n4. Set base cases and initialization: anchor the smallest states so the recurrence has somewhere to stop.\n5. Choose evaluation order and space: decide top-down memoization or bottom-up tabulation, then compress memory only after the recurrence is correct.\n\nThis structure is more important than memorizing problem names. In senior interviews, clear state definition and transition derivation are what turn DP from guesswork into engineering.",
      },
    ],
    keyTakeaways: [
      "Dynamic programming computes each meaningful state once and reuses it across many choice paths.",
      "A good DP candidate has choices, overlapping subproblems, and optimal substructure.",
      "Greedy commits to one future, divide and conquer splits independent work, and DP manages repeated dependent states.",
      "The reliable DP workflow is state, answer, transition, base cases, evaluation order, then space optimization.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-overlapping-subproblems",
    moduleId: "dp-fundamentals",
    order: 2,
    title: "Overlapping Subproblems",
    estimatedReadingMin: 7,
    tags: ["Dynamic Programming", "Recursion Trees", "Memoization"],
    summaryMD:
      "Overlapping subproblems appear when different recursive paths ask for the same smaller answer, making caching or tabulation dramatically reduce work.",
    sections: [
      {
        heading: "What Overlap Means",
        bodyMD:
          "A subproblem is one smaller question inside the original problem. Subproblems overlap when the same smaller question is reached through multiple paths. The key word is **same**: same inputs, same constraints, same required answer. If two calls only look similar but carry different remaining capacity, index, or boundary, they are different states.\n\nOverlap is the reason DP improves on plain recursion. A recursive formulation might be logically correct, but if it recomputes the same state many times, its running time can explode. DP keeps the first result and reuses it.",
      },
      {
        heading: "Fibonacci as the Minimal Example",
        bodyMD:
          "Naive Fibonacci asks **fib(n)** to compute **fib(n - 1)** and **fib(n - 2)**. Those branches immediately collide. For **fib(5)**, the call **fib(3)** appears on both sides, and **fib(2)** appears even more often.\n\nThis is not a coincidence; every level fans out into calls that share descendants. The recursive tree has exponential size, while the number of distinct states is only **n + 1**. DP changes the cost from counting calls to counting unique states.",
      },
      {
        heading: "How to Detect It in Interviews",
        bodyMD:
          "When you write a recurrence, ask whether two different choices can lead to the same remaining problem. If yes, look for overlap. In Coin Change, choosing coin **1** then **2** can reach the same remaining amount as choosing **2** then **1**. In House Robber, many take or skip paths ask for the best answer starting at the same index. In Edit Distance, many edit sequences reach the same pair of prefix lengths.\n\nA practical test is to name the state. If the state space is much smaller than the naive recursion tree, DP is likely appropriate. If each subproblem is unique, as in classic binary search or Merge Sort, DP usually gives no benefit.",
      },
      {
        heading: "Overlap Is About Identity, Not Size",
        bodyMD:
          "Two subproblems overlap only when they are identical under your state definition. For example, **ways(i, amount)** and **ways(i + 1, amount)** are not the same even though the amount matches, because the available coins differ. Conversely, if the order of previous choices no longer matters, many histories can collapse into one state.\n\nThis is why state design and overlap are connected. A state should keep enough information to be correct, but not extra history that prevents identical futures from merging.",
      },
    ],
    recursionTree: {
      rootLabel: "Naive Fibonacci call tree",
      root: {
        label: "fib(5)",
        children: [
          {
            label: "fib(4)",
            children: [
              {
                label: "fib(3)",
                children: [
                  {
                    label: "fib(2)",
                    note: "recomputed later",
                    children: [
                      { label: "fib(1)", note: "base" },
                      { label: "fib(0)", note: "base" },
                    ],
                  },
                  { label: "fib(1)", note: "base" },
                ],
              },
              {
                label: "fib(2)",
                note: "repeated",
                children: [
                  { label: "fib(1)", note: "base" },
                  { label: "fib(0)", note: "base" },
                ],
              },
            ],
          },
          {
            label: "fib(3)",
            note: "repeated",
            children: [
              {
                label: "fib(2)",
                note: "repeated again",
                children: [
                  { label: "fib(1)", note: "base" },
                  { label: "fib(0)", note: "base" },
                ],
              },
              { label: "fib(1)", note: "base" },
            ],
          },
        ],
      },
      captionMD:
        "The tree repeats **fib(3)** and **fib(2)**. Memoization stores each value after the first computation, while tabulation computes each value once in increasing order.",
    },
    keyTakeaways: [
      "Overlapping subproblems are identical states reached by different choice paths.",
      "Naive recursion can be exponential even when the number of unique states is only linear or polynomial.",
      "Naming the state is the fastest way to see whether histories collapse into shared futures.",
      "If subproblems are independent and never repeat, the problem is more likely divide and conquer than DP.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-optimal-substructure",
    moduleId: "dp-fundamentals",
    order: 3,
    title: "Optimal Substructure",
    estimatedReadingMin: 7,
    tags: ["Dynamic Programming", "Recurrence", "Correctness"],
    summaryMD:
      "Optimal substructure means a best global answer can be assembled from best answers to smaller states without needing to remember the full path history.",
    sections: [
      {
        heading: "The Correctness Property Behind DP",
        bodyMD:
          "Optimal substructure is the reason a recurrence is safe. It says that once you choose how the larger solution connects to smaller states, the smaller pieces should themselves be optimal for their states. If a smaller piece were not optimal, replacing it with a better one would improve the larger answer, contradicting optimality.\n\nFor House Robber, if you decide to rob house **i**, the remaining left side must be the best answer through **i - 2**. A worse left answer would never be part of the best total. For Edit Distance, after choosing insert, delete, or replace, the remaining prefix problem must be solved optimally.",
      },
      {
        heading: "Examples That Have It",
        bodyMD:
          "Shortest path in an unweighted graph has optimal substructure: the shortest path to a node contains shortest paths to intermediate nodes. Minimum Path Sum has it because the cheapest path to a cell must extend the cheaper of the two best paths into its parents. Coin Change has it because after taking one coin, the rest of the amount should be solved with the fewest coins possible.\n\nCounting DPs also use a related form of compositional structure. In Climbing Stairs, the number of ways to reach **i** is the sum of complete counts for **i - 1** and **i - 2**. The subanswers are not optimal in a min or max sense, but they are still reusable complete answers.",
      },
      {
        heading: "When It Fails or Needs More State",
        bodyMD:
          "Some problems appear to lack optimal substructure only because the state is missing information. Suppose a path problem charges a penalty based on the previous two moves. A state that stores only the current cell may be insufficient, because the best continuation depends on recent direction history. Add that history to the state, and optimal substructure may return.\n\nOther problems truly resist simple DP because local optimal subsolutions are incompatible globally. If choosing the best part for one segment prevents a feasible choice in another segment and the constraint is not captured by the state, combining individually optimal pieces can be wrong.",
      },
      {
        heading: "How to Argue It in an Interview",
        bodyMD:
          "A strong DP explanation includes a short exchange argument. State the final decision, identify the remaining subproblem, and explain why that remaining subproblem must be optimal. For a minimum recurrence, say that if the remaining piece were not minimum, swapping in the minimum piece would produce a better total. For a maximum recurrence, use the symmetric argument.\n\nThis proof does not need to be formal, but it must connect the recurrence to correctness. Interviewers care that you are not just copying a familiar formula.",
      },
    ],
    keyTakeaways: [
      "Optimal substructure lets a larger optimal answer rely on smaller optimal answers.",
      "If the recurrence feels invalid, the state may be missing information needed to make subproblems independent enough.",
      "Counting DP uses reusable complete counts, while optimization DP uses min or max over reusable optimal values.",
      "Derive correctness from the final decision and explain why the remaining state must be solved optimally.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-recursion-vs-dp",
    moduleId: "dp-fundamentals",
    order: 4,
    title: "From Recursion to DP",
    estimatedReadingMin: 8,
    tags: ["Dynamic Programming", "Recursion", "Memoization", "Tabulation"],
    summaryMD:
      "Most DP solutions begin as a recursive choice model, then become efficient by caching states or by filling them iteratively in dependency order.",
    sections: [
      {
        heading: "Start With the Recursive Question",
        bodyMD:
          "A clean recursive formulation asks: if I am at this state, what choices can I make next, and what smaller states do those choices produce? This is often easier than jumping straight to an array. For House Robber, from index **i** you can skip to **i + 1** or take house **i** and jump to **i + 2**. For Coin Change, from amount **a** you can choose any coin and continue with **a - coin**.\n\nThe recursive version is valuable because it exposes the state and transition. It may still be too slow, but it tells you what must be cached or tabulated.",
      },
      {
        heading: "Plain Recursion Is a Specification, Not the Final Algorithm",
        bodyMD:
          "Plain recursion is acceptable as a thinking tool, but repeated states make it inefficient. Once two branches ask for the same state, the recursive tree is doing duplicate work. The state definition tells you the cache key: every argument that changes the answer must be part of the key.\n\nThis is the moment recursion becomes DP. You are no longer exploring histories; you are solving unique states. The algorithmic cost becomes the number of states times the cost of evaluating each transition.",
      },
      {
        heading: "The Mechanical Path",
        bodyMD:
          "The transformation is mechanical:\n\n1. Write the recursive function signature so its parameters are exactly the state.\n2. Add base cases for states whose answers are known immediately.\n3. Before computing a state, check whether the cache already has its answer.\n4. Store the computed answer before returning it. This is memoization.\n5. If desired, reverse the dependency direction and fill a table iteratively. This is tabulation.\n\nTop-down and bottom-up are not different recurrences. They are different evaluation strategies for the same state graph.",
      },
      {
        heading: "Why This Matters for Senior Interviews",
        bodyMD:
          "Senior interviewers often change constraints mid-problem. If your solution is memorized, a small variant can break it. If your solution came from a recursive model, you can adapt the state and transition.\n\nFor example, Climbing Stairs becomes Min Cost Climbing Stairs by changing what the state returns. Coin Change becomes Coin Change II by changing whether the transition minimizes coin count or counts combinations. The recursion-to-DP workflow gives you a reusable reasoning system instead of a catalog of formulas.",
      },
    ],
    keyTakeaways: [
      "Begin with a recursive state question before worrying about arrays.",
      "The cache key is the set of parameters that uniquely determine the answer.",
      "Memoization and tabulation usually implement the same recurrence in different orders.",
      "The cost of a DP is unique states times transition work, not the size of the naive recursion tree.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-memoization",
    moduleId: "dp-fundamentals",
    order: 5,
    title: "Memoization (Top-Down)",
    estimatedReadingMin: 8,
    tags: ["Dynamic Programming", "Top-Down", "Memoization", "Java"],
    summaryMD:
      "Memoization keeps the recursive formulation but adds a cache so each reachable state is computed at most once.",
    sections: [
      {
        heading: "Cache and Recurse",
        bodyMD:
          "Memoization is top-down DP. You ask for the original answer, let recursion discover the states it needs, and store each computed state in a cache. When another path asks for the same state, the function returns immediately.\n\nThis style is especially natural when the recurrence is easiest to express as decisions from the current state. It keeps the code close to the mathematical definition, which is useful for interval DP, string DP, and problems where not every theoretical state is reachable.",
      },
      {
        heading: "Choosing the Cache Key",
        bodyMD:
          "The cache key must include every parameter that can change the answer. If the answer depends on index and remaining capacity, cache **index + capacity**, not just index. If it depends on two string prefixes, cache both prefix lengths. If it depends on whether the previous item was taken, that flag belongs in the state.\n\nA missing state variable creates incorrect cache hits. An unnecessary state variable creates too many states and may hide overlap. The best memoized solutions are precise: enough information for correctness, no history that the future no longer needs.",
      },
      {
        heading: "When to Prefer Memoization",
        bodyMD:
          "Use memoization when the recursive recurrence is much clearer than the iterative order, when reachable states are sparse, or when you need to prototype correctness quickly. It is also strong for DFS-shaped DP, such as Word Break over starting indices or graph-like state spaces with pruning.\n\nThe trade-off is recursion overhead and stack depth. Java can hit stack limits on very deep linear recurrences. Memoization can also be slightly slower than tabulation because of function calls, hash maps, or sentinel checks, but clarity often wins during the first correct implementation.",
      },
      {
        heading: "Pros and Cons",
        bodyMD:
          "The main advantage is directness. The code mirrors the recurrence and computes only states that are actually requested. Base cases are usually local and readable.\n\nThe main disadvantages are operational. Deep recursion can overflow the stack, cache initialization needs care, and hash-based keys can add overhead. For production-style interview answers, mention that the same recurrence can often be converted to bottom-up tabulation if stack depth or constants matter.",
      },
    ],
    codeExamples: [
      {
        title: "Memoized one-dimensional recurrence",
        language: "java",
        code: `import java.util.Arrays;

class Solution {
    private int[] memo;

    public int fibonacci(int n) {
        memo = new int[n + 1];
        Arrays.fill(memo, -1);
        return value(n);
    }

    private int value(int i) {
        if (i <= 1) {
            return i;
        }
        if (memo[i] != -1) {
            return memo[i];
        }

        memo[i] = value(i - 1) + value(i - 2);
        return memo[i];
    }
}`,
        captionMD:
          "The recursive function parameters define the state. For a two-dimensional DP, use a two-dimensional array or a map key that includes both state variables.",
      },
    ],
    keyTakeaways: [
      "Memoization is top-down DP: recursion plus a cache keyed by state.",
      "Every variable that can change the answer must be part of the cache key.",
      "Memoization is often the clearest first correct solution, especially when reachable states are sparse.",
      "Watch for recursion depth, cache sentinels, and extra overhead from hash-based keys.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-tabulation",
    moduleId: "dp-fundamentals",
    order: 6,
    title: "Tabulation (Bottom-Up)",
    estimatedReadingMin: 8,
    tags: ["Dynamic Programming", "Bottom-Up", "Tabulation", "Java"],
    summaryMD:
      "Tabulation computes DP states iteratively from base cases toward the answer, using an order that satisfies every dependency before it is read.",
    sections: [
      {
        heading: "Fill the Table Instead of Calling the Tree",
        bodyMD:
          "Tabulation is bottom-up DP. Instead of asking recursively for the answer and letting calls discover dependencies, you allocate a table, initialize known base states, and fill remaining states in a deliberate order.\n\nThe table may be an array, a matrix, or a few variables. The important point is dependency order. When computing **dp[i]**, every state referenced by its transition must already be available.",
      },
      {
        heading: "Finding the Right Order",
        bodyMD:
          "For one-dimensional prefix DP, order is usually left to right: **dp[i]** depends on earlier indices. For suffix DP, it may be right to left. For two-string DP like Edit Distance, row and column order works because each cell depends on its top, left, and diagonal neighbors. For interval DP, increasing interval length is common because shorter intervals must be solved before longer ones.\n\nIf you cannot find an order, draw arrows from each state to the states it depends on. A valid tabulation order is any topological order of that dependency graph.",
      },
      {
        heading: "Why Interviewers Like Bottom-Up",
        bodyMD:
          "Bottom-up code avoids stack overflow, often has better constant factors, and makes space optimization easier. It also forces you to state base cases precisely because the table starts from them. For classic problems like Climbing Stairs, House Robber, Unique Paths, and Coin Change, a bottom-up answer is usually the expected final form.\n\nThe downside is that bottom-up can be less obvious for irregular state spaces. It may compute states that are theoretically valid but never needed by the original query.",
      },
      {
        heading: "Implementation Checklist",
        bodyMD:
          "Before writing loops, know four things: the table dimensions, the meaning of each cell, the base cells, and the dependency direction. Then write loops that move from known states to unknown states.\n\nA common mistake is copying a recurrence into a loop without checking whether referenced cells are already initialized. Another is using default zero values for states that should represent impossible or infinite answers.",
      },
    ],
    codeExamples: [
      {
        title: "Bottom-up one-dimensional template",
        language: "java",
        code: `class Solution {
    public int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }

        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;

        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }

        return dp[n];
    }
}`,
        captionMD:
          "The loop order follows the recurrence: **dp[i - 1]** and **dp[i - 2]** are filled before **dp[i]** is computed.",
      },
    ],
    keyTakeaways: [
      "Tabulation starts from base cases and fills states in dependency order.",
      "A valid loop order guarantees every state read by the transition has already been computed.",
      "Bottom-up solutions usually avoid recursion depth issues and are easier to compress for space.",
      "Do not trust default table values unless they match the intended base or impossible value.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-top-down-vs-bottom-up",
    moduleId: "dp-fundamentals",
    order: 7,
    title: "Top-Down vs Bottom-Up",
    estimatedReadingMin: 8,
    tags: ["Dynamic Programming", "Top-Down", "Bottom-Up", "Trade-offs"],
    summaryMD:
      "Top-down and bottom-up usually evaluate the same recurrence, but they differ in clarity, stack behavior, skipped states, constants, and space-optimization opportunities.",
    sections: [
      {
        heading: "Same State Graph, Different Traversal",
        bodyMD:
          "Think of DP states as nodes in a directed graph, where each node points to the states it depends on. Top-down starts at the answer node and recursively visits dependencies on demand. Bottom-up starts from base nodes and visits states in an order that eventually reaches the answer.\n\nBecause the recurrence is usually the same, the asymptotic time is often identical: number of reachable states times transition work. The practical differences come from how many states are reached and how expensive each state evaluation is.",
      },
      {
        heading: "Stack Depth and Operational Risk",
        bodyMD:
          "Top-down uses the call stack. That is fine for shallow trees but risky for deep linear chains, large grids, or recurrences where **n** can be very large. Java does not optimize tail calls, so deep memoized recursion can fail even when the algorithmic complexity is correct.\n\nBottom-up uses explicit loops and heap-allocated tables, so it avoids call-stack risk. In production-quality Java interviews, this is a strong reason to present bottom-up as the final form for straightforward one-dimensional or two-dimensional DPs.",
      },
      {
        heading: "Unreached States and Constant Factors",
        bodyMD:
          "Top-down computes only states reachable from the original query. If pruning removes large parts of the state space, memoization can be faster and simpler. Word Break is a good example: many starting indices may never be explored if earlier checks fail.\n\nBottom-up often scans the whole table. That predictability can improve locality and reduce overhead, especially with primitive arrays. Function calls, recursion frames, and map lookups can make top-down slower even when both approaches have the same big-O bound.",
      },
      {
        heading: "Ease of Space Optimization",
        bodyMD:
          "Bottom-up usually makes memory dependencies visible. If row **i** depends only on row **i - 1**, a rolling array is natural. If **dp[i]** depends only on two previous values, two variables are enough.\n\nTop-down caches are harder to compress because recursive calls may revisit older states in less predictable order. You can still reduce memory in some top-down designs, but most interview space optimizations are clearer after converting to tabulation.",
      },
      {
        heading: "How to Choose",
        bodyMD:
          "Start top-down when you need clarity, the state space is sparse, or the recurrence is irregular. Convert to bottom-up when the dependency order is obvious, stack depth is a concern, or space optimization is expected.\n\nA strong interview answer can mention both: derive with memoization for intuition, then implement bottom-up for reliability and better constants. That sequence shows both reasoning and engineering judgment.",
      },
    ],
    keyTakeaways: [
      "Top-down and bottom-up are evaluation strategies for the same DP state graph.",
      "Top-down can skip unreachable states but pays recursion and cache-lookup overhead.",
      "Bottom-up avoids stack depth problems and usually improves locality and space optimization.",
      "Choose based on clarity, reachable-state density, dependency order, and expected memory constraints.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-state-definition",
    moduleId: "dp-fundamentals",
    order: 8,
    title: "Defining the State",
    estimatedReadingMin: 9,
    tags: ["Dynamic Programming", "State Design", "Patterns"],
    summaryMD:
      "The state definition is the most important DP decision: it names exactly what each cached or tabulated answer means.",
    sections: [
      {
        heading: "State Is a Contract",
        bodyMD:
          "A DP state is not just an array index. It is a contract: **dp[i]** means a precise answer to a precise smaller question. If that sentence is vague, the transition will be vague too. Strong definitions include the scope, the decision boundary, and the returned quantity.\n\nCompare **dp[i]** is the answer up to index **i** with **dp[i]** is the maximum money robbable from houses **0..i**. The second version tells you what choices are legal and which previous states can be used.",
      },
      {
        heading: "Choose Dimensions From What Changes the Future",
        bodyMD:
          "A dimension belongs in the state if changing it can change the answer to the remaining problem. Index is common because the set of remaining items changes. Capacity is needed in knapsack because the same index with different remaining capacity has different possibilities. Two indices are needed in LCS and Edit Distance because both prefixes matter.\n\nDo not include history just because it happened. Include history only if it affects future choices or scoring. The art is to remember enough for correctness while letting many histories merge into one reusable state.",
      },
      {
        heading: "Common State Patterns",
        bodyMD:
          "Frequent patterns include:\n\n- **Index state**: **dp[i]** is the best or count for a prefix, suffix, or position. Examples: Climbing Stairs, House Robber, Decode Ways.\n- **Index plus capacity**: **dp[i][c]** is the best using first **i** items with capacity **c**. Examples: 0-1 Knapsack, Partition Equal Subset Sum.\n- **Two indices**: **dp[i][j]** compares or combines two prefixes. Examples: LCS, Edit Distance, Distinct Subsequences.\n- **Interval**: **dp[l][r]** is the best answer inside a range. Examples: Burst Balloons, Palindrome DPs, Stone Game.",
      },
      {
        heading: "Pitfalls",
        bodyMD:
          "The first pitfall is defining a state that cannot be transitioned cleanly. If **dp[i]** says best answer involving index **i** but does not specify whether **i** is included, you may need extra cases or a second state.\n\nThe second pitfall is mixing prefix and suffix meanings. If **dp[i]** sometimes means up to **i** and sometimes starting at **i**, base cases and loop direction become error-prone. The third pitfall is overfitting to the answer. The answer may be a single value, but intermediate states often need more dimensions to be correct.",
      },
      {
        heading: "A Quick Validation Test",
        bodyMD:
          "After defining a state, ask three questions. Can I identify the final answer state? Can I express this state using smaller or simpler states? Do the base cases have obvious values?\n\nIf any answer is no, revise the state before writing code. Most DP failures come from forcing a transition onto a weak state definition.",
      },
    ],
    keyTakeaways: [
      "A state definition must say exactly what each DP value represents.",
      "Add dimensions for information that changes future choices or scoring, not for irrelevant history.",
      "Common patterns include index, index plus capacity, two indices, and interval states.",
      "Validate a state by checking answer location, transition feasibility, and base cases before coding.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-state-transition",
    moduleId: "dp-fundamentals",
    order: 9,
    title: "Writing the Transition",
    estimatedReadingMin: 8,
    tags: ["Dynamic Programming", "Recurrence", "Transitions"],
    summaryMD:
      "The transition is the recurrence that combines smaller states, usually derived by isolating the last decision or the next decision.",
    sections: [
      {
        heading: "Derive From a Decision Boundary",
        bodyMD:
          "A transition should come from a crisp decision boundary. The most common approach is the last decision: what was the final move, final item used, final character matched, or final cut made? Climbing Stairs asks whether the last move was one step or two. Edit Distance asks whether the last characters match or which edit operation is last.\n\nFor suffix-style recursion, the next decision can be clearer: from this index, do we take, skip, cut, or match? Either direction is fine as long as the resulting states are smaller or closer to a base case.",
      },
      {
        heading: "Choose the Aggregation",
        bodyMD:
          "The problem goal determines how choices combine. Counting problems usually **sum** disjoint possibilities. Optimization problems usually take **min** or **max** over choices. Feasibility problems often use boolean **or** across choices and boolean **and** for required conditions.\n\nCoin Change minimizes one plus the best answer for the remaining amount. Coin Change II counts combinations, so it sums ways while carefully avoiding duplicate orderings. House Robber maximizes between skip and take. Word Break uses whether any valid word leads to a solvable suffix.",
      },
      {
        heading: "Respect Validity Conditions",
        bodyMD:
          "Every transition needs guards. You can use a coin only if **coin <= amount**. You can decode two digits only if the value is between **10** and **26**. You can move from a grid parent only if the parent is inside bounds and not blocked.\n\nInvalid choices should not quietly contribute zero unless zero is the correct identity. For minimum problems, invalid often means infinity. For maximum problems, invalid may mean negative infinity. For counting, invalid usually contributes zero.",
      },
      {
        heading: "Avoid Double Counting",
        bodyMD:
          "When summing choices, make sure the groups are disjoint or intentionally ordered. Climbing Stairs groups paths by their last move, so one-step and two-step endings do not overlap. Coin Change II counts combinations, not permutations, so the state includes which coin index is allowed; otherwise the same set of coins can be counted in many orders.\n\nIf your count seems too large, inspect whether two transition branches can generate the same final object. If yes, refine the state or constrain the iteration order.",
      },
    ],
    keyTakeaways: [
      "Transitions are easiest to derive from the last decision or next decision.",
      "Use sum for disjoint counts, min or max for optimization, and boolean logic for feasibility.",
      "Validity guards are part of the recurrence, not an implementation detail.",
      "Counting transitions must avoid duplicate generation of the same outcome.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-base-cases",
    moduleId: "dp-fundamentals",
    order: 10,
    title: "Base Cases and Initialization",
    estimatedReadingMin: 8,
    tags: ["Dynamic Programming", "Base Cases", "Initialization"],
    summaryMD:
      "Base cases anchor the recurrence, and initialization chooses the identity values that make impossible, empty, minimum, maximum, and counting states behave correctly.",
    sections: [
      {
        heading: "Why Base Cases Matter",
        bodyMD:
          "A recurrence is a chain of dependencies. Base cases are the anchors that stop the chain. If they are wrong, every later state can be consistently wrong even when the transition looks perfect.\n\nIn Climbing Stairs, **dp[0] = 1** because there is one way to do nothing. In Fibonacci, **fib(0) = 0** because the sequence defines it that way. These look similar but have different meanings, which is why copying base cases across problems is dangerous.",
      },
      {
        heading: "Empty Inputs Are Usually Meaningful",
        bodyMD:
          "Many DP problems need a state for the empty prefix, empty amount, or empty set. Edit Distance uses row zero and column zero for converting to or from the empty string. Coin Change II uses **dp[0] = 1** because there is one way to make amount zero: choose no coins. Minimum Coin Change often uses **dp[0] = 0** because zero coins are needed to make amount zero.\n\nThe empty state is not a hack. It is often the cleanest way to make the recurrence uniform.",
      },
      {
        heading: "Initialization Depends on the Objective",
        bodyMD:
          "For counting DPs, initialize impossible counts to **0** and seed the one known empty count when appropriate. For minimum DPs, initialize unknown states to a large sentinel so **min** works correctly. For maximum DPs, initialize impossible states to a very small sentinel if negative values are possible. For feasibility DPs, initialize boolean states to **false** except known true bases.\n\nA common bug is leaving a Java integer array at zero for a minimum problem. Zero then looks like a valid best answer, causing impossible states to win.",
      },
      {
        heading: "Off-by-One Discipline",
        bodyMD:
          "Off-by-one errors usually come from unclear state meaning. If **dp[i]** means first **i** items, then item **i - 1** is the newest item. If **dp[i]** means index **i** included in a zero-based array, then the newest item is **i**. Both are valid, but mixing them breaks transitions.\n\nBefore coding, decide whether your table includes an extra row or column for the empty prefix. Extra sentinel rows often make boundaries cleaner, especially in two-dimensional string DPs.",
      },
    ],
    keyTakeaways: [
      "Base cases are semantic facts about the smallest states, not boilerplate.",
      "Empty prefixes, empty amounts, and empty sets often need explicit DP states.",
      "Counting, min, max, and feasibility DPs require different initialization identities.",
      "Clear state meaning prevents most off-by-one mistakes in initialization and loops.",
    ],
  },
  {
    kind: "concept",
    slug: "dp-space-optimization",
    moduleId: "dp-fundamentals",
    order: 11,
    title: "Space Optimization",
    estimatedReadingMin: 9,
    tags: ["Dynamic Programming", "Space Optimization", "Rolling Array", "Java"],
    summaryMD:
      "Space optimization keeps only the DP states that future transitions can still read, replacing full tables with rolling arrays or variables when dependencies are local.",
    sections: [
      {
        heading: "Optimize After Correctness",
        bodyMD:
          "Space optimization should come after the state and transition are correct. The full table is easier to reason about, easier to debug, and easier to explain. Once the dependency pattern is clear, ask which old states are still needed by future computations.\n\nIf no future transition will read a state again, it can be discarded. This is the entire principle behind rolling arrays and rolling variables.",
      },
      {
        heading: "From 2D to 1D",
        bodyMD:
          "A two-dimensional DP can collapse to one dimension when each row depends only on the previous row and maybe the current row. Unique Paths can keep one row because each cell uses the value above and the value to the left. 0-1 Knapsack can keep one capacity array when capacities are iterated backward so each item is used at most once.\n\nLoop direction is critical. Backward capacity iteration preserves the previous row for 0-1 choices. Forward capacity iteration is appropriate for unbounded choices where reusing the same item is allowed.",
      },
      {
        heading: "From 1D to O(1)",
        bodyMD:
          "A one-dimensional DP can collapse to variables when each state depends on a fixed number of previous states. Climbing Stairs needs only the previous two values. House Robber needs the best value excluding and including the current position through a rolling pair.\n\nDo not compress if the transition reads an unbounded set of earlier states unless you have another data structure to summarize them. Optimization should preserve the same dependency information, not hope the missing values are unnecessary.",
      },
      {
        heading: "How to Explain It",
        bodyMD:
          "Interviewers want to hear the dependency argument. Say which previous cells the transition reads, how long those cells remain needed, and why overwriting is safe. If using a one-dimensional array for a two-dimensional DP, explicitly justify loop direction.\n\nA good explanation for Climbing Stairs is: **dp[i]** reads only **dp[i - 1]** and **dp[i - 2]**, so after computing the next value, all older states can be discarded.",
      },
    ],
    codeExamples: [
      {
        title: "Before and after rolling variables",
        language: "java",
        code: `class TabulatedSolution {
    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }

        int[] dp = new int[n + 1];
        dp[1] = 1;
        dp[2] = 2;

        for (int i = 3; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }

        return dp[n];
    }
}

class SpaceOptimizedSolution {
    public int climbStairs(int n) {
        if (n <= 2) {
            return n;
        }

        int twoBack = 1;
        int oneBack = 2;

        for (int i = 3; i <= n; i++) {
            int current = oneBack + twoBack;
            twoBack = oneBack;
            oneBack = current;
        }

        return oneBack;
    }
}`,
        captionMD:
          "Both versions compute the same recurrence. The optimized version keeps only the two states that the next transition can read.",
      },
    ],
    keyTakeaways: [
      "Optimize space only after the full DP dependency pattern is correct.",
      "A 2D table can become 1D when transitions need only the previous row or controlled current-row values.",
      "A 1D table can become O(1) when each state depends on a fixed-size window.",
      "Loop direction is part of correctness whenever overwriting a rolling array.",
    ],
  },
];
