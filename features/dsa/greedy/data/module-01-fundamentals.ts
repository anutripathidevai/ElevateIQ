import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "greedy-what-is-greedy",
    moduleId: "greedy-fundamentals",
    order: 1,
    title: "What Is a Greedy Algorithm?",
    estimatedReadingMin: 8,
    tags: ["Greedy", "Foundations", "Interview Framework"],
    summaryMD:
      "A greedy algorithm solves an optimization problem by making one locally best choice at a time, but it is correct only when that choice can be proven safe.",
    sections: [
      {
        heading: "The Core Idea",
        bodyMD:
          "A greedy algorithm builds an answer in small irreversible steps. At each step it chooses the option that looks best according to a simple rule, such as the earliest finishing interval, the farthest reachable index, the cheapest available resource, or the lexicographically smallest character that can still lead to a valid answer. Once the choice is made, greedy commits and never revisits it.\n\nThat commitment is the entire attraction and the entire danger. If the local choice is safe, greedy can turn a large search space into a short scan, sort, or heap loop. If the local choice is only a tempting heuristic, the algorithm may be fast and consistently wrong. In interviews, the word greedy should immediately trigger the question: why is this local decision guaranteed not to block the global optimum?",
      },
      {
        heading: "What Greedy Is Not",
        bodyMD:
          "Greedy is not the same as picking the first idea that seems intuitive. Many locally attractive decisions fail because they spend a scarce resource too early or ignore a future constraint. For example, with coin values **1**, **3**, and **4**, making amount **6** by repeatedly taking the largest coin gives **4 + 1 + 1**, but the optimum is **3 + 3**. The local rule is simple, but it is not safe for that coin system.\n\nGreedy is also not a substitute for dynamic programming. DP keeps multiple futures alive because early choices may interact with later choices in complicated ways. Greedy deliberately keeps only one future. That is acceptable only when a correctness argument shows that every optimal solution can be transformed to include the greedy choice without becoming worse.",
      },
      {
        heading: "The Interview Workflow",
        bodyMD:
          "A reliable greedy explanation has five parts:\n\n1. State the objective: are you maximizing count, minimizing cost, reaching the end, or producing the smallest valid string?\n2. Propose the greedy choice: which item or action do you commit to next?\n3. Identify the ordering or data structure: sorting, two pointers, a heap, or a one-pass frontier.\n4. Prove the choice is safe: usually with an exchange argument or an invariant.\n5. Implement the scan and update the minimal state needed for future decisions.\n\nThis structure matters because greedy code is often short. Without the proof, short code looks like a guess. With the proof, the same code becomes an interview-ready algorithm.",
      },
      {
        heading: "Why Greedy Feels Powerful",
        bodyMD:
          "Greedy problems often look complex because they contain many possible subsets, schedules, jumps, or strings. The winning insight is that the future can be summarized by a compact boundary: the current end time, the farthest reach, the number of open tasks, the best refund from a heap, or the last occurrence of a character. You do not need to remember every chosen item, only the state that determines what remains feasible.\n\nThat is why greedy solutions frequently have clean complexity: **O(n log n)** for sorting or heap operations, and **O(n)** once the order is fixed. The implementation may be simple, but the conceptual work is choosing a rule that preserves optimality under every possible input.",
      },
    ],
    keyTakeaways: [
      "Greedy commits to one locally best choice at a time and never backtracks.",
      "A greedy rule is correct only when the chosen local action can be proven safe for some optimal solution.",
      "Most interview greedy solutions need a clear ordering, a compact invariant, and a proof of correctness.",
      "Fast greedy code without a safety proof is just a heuristic, not an algorithmic guarantee.",
    ],
  },
  {
    kind: "concept",
    slug: "greedy-greedy-choice-property",
    moduleId: "greedy-fundamentals",
    order: 2,
    title: "The Greedy-Choice Property",
    estimatedReadingMin: 7,
    tags: ["Greedy", "Correctness", "Proofs"],
    summaryMD:
      "The greedy-choice property says that at least one optimal solution begins with the greedy choice, so committing to that choice does not sacrifice optimality.",
    sections: [
      {
        heading: "The Property That Makes Greedy Legal",
        bodyMD:
          "The greedy-choice property is the formal reason a local decision can be made before solving the rest of the problem. It does not say every optimal solution must choose the greedy option. It says there exists an optimal solution that does. That is enough: after taking the greedy choice, the algorithm can focus on the remaining smaller problem.\n\nThis distinction is important in interviews. If there are many optimal schedules, many valid partitions, or many minimum-cost constructions, greedy only needs to show that one optimum can be aligned with its first move. The algorithm is allowed to choose a particular optimum among all equally good possibilities.",
      },
      {
        heading: "Safe Choice vs Best-Looking Choice",
        bodyMD:
          "A safe choice is not necessarily the choice with the largest immediate value. In interval scheduling, choosing the shortest meeting is not the standard safe rule, and choosing the earliest starting meeting can be disastrous. Choosing the meeting with the earliest end time is safe because it leaves as much remaining room as possible for all future meetings.\n\nThe phrase as much remaining room as possible is the kind of reasoning you want. A greedy choice is usually safe because it preserves or improves a resource that all future solutions depend on: time, capacity, reach, lexicographic flexibility, remaining deadlines, or available capital.",
      },
      {
        heading: "How to Test a Candidate Rule",
        bodyMD:
          "When you suspect a greedy rule, test it with adversarial inputs. Ask what future constraint the rule might harm. If the rule chooses a large profit, can it consume too much time? If it chooses a short jump, can it trap you before a gap? If it chooses the smallest character, can it lose the last copy of a required character?\n\nThen look for a proof. Can any optimal answer that skips your greedy choice be modified to include it? Does the modification keep feasibility? Does it keep the objective value at least as good for maximization, or no larger for minimization? If you cannot answer these questions, the property is not established.",
      },
      {
        heading: "Common Places It Appears",
        bodyMD:
          "The property appears in several recurring forms. For intervals, choosing the earliest finish keeps the timeline most open. For arrays like Jump Game, carrying the farthest reachable index dominates all shorter reaches from the same prefix. For scheduling with deadlines, doing urgent work first or replacing the longest accepted job can preserve feasibility. For strings, choosing the smallest available character is safe only when all required future characters can still appear later.\n\nThese are not separate tricks. They are different ways of proving that the greedy step does not reduce the set of achievable optimal outcomes.",
      },
    ],
    keyTakeaways: [
      "The greedy-choice property means some optimal solution starts with the greedy choice.",
      "The locally largest or most obvious choice is not safe unless it preserves future feasibility.",
      "A good test is whether an optimal solution that differs can be changed to include the greedy choice without getting worse.",
      "Most successful greedy rules protect a scarce future resource such as time, reach, capacity, or character availability.",
    ],
  },
  {
    kind: "concept",
    slug: "greedy-optimal-substructure",
    moduleId: "greedy-fundamentals",
    order: 3,
    title: "Optimal Substructure",
    estimatedReadingMin: 7,
    tags: ["Greedy", "Optimal Substructure", "Recurrence"],
    summaryMD:
      "Optimal substructure means that after a safe greedy choice is fixed, the remaining work is itself a smaller optimization problem of the same kind.",
    sections: [
      {
        heading: "The Second Required Property",
        bodyMD:
          "Greedy-choice property explains why the first commitment is safe. Optimal substructure explains why the algorithm can continue recursively or iteratively after that commitment. Once the greedy choice is included, the rest of the answer must be optimal for the remaining feasible instance. If it were not, replacing the rest with a better remaining solution would improve the whole answer.\n\nFor example, after selecting the earliest-ending non-overlapping interval, the remaining problem is to choose as many compatible intervals as possible after that end time. The original interval no longer needs to be reconsidered; it only changes the boundary for the smaller instance.",
      },
      {
        heading: "Greedy Shrinks the Problem Differently From DP",
        bodyMD:
          "Dynamic programming also relies on optimal substructure, but it may branch over many choices before selecting the best recurrence value. Greedy uses optimal substructure more aggressively: it chooses one branch immediately and trusts the proof that no other branch needs to survive.\n\nThis is why optimal substructure alone is not enough for greedy. Many DP problems have it, including knapsack and edit distance, but a single local choice is still unsafe. Greedy needs both properties together: a safe first choice and a remaining subproblem that can be solved optimally by the same style of reasoning.",
      },
      {
        heading: "What the Remaining Problem Must Preserve",
        bodyMD:
          "After a greedy choice, the remaining problem must preserve the right information. In interval problems, the remaining state may be the end time of the last chosen interval. In Jump Game, it may be the farthest reachable position after scanning a prefix. In heap-assisted scheduling, it may be the set of accepted jobs and the current total time.\n\nIf the future depends on hidden history that the greedy state discards, optimal substructure may not hold under that state. The fix may be a richer state, which often points toward DP, or a different greedy invariant that truly captures everything future decisions need.",
      },
      {
        heading: "How to Explain It Clearly",
        bodyMD:
          "A strong explanation says what the smaller instance is. Do not merely say the problem has optimal substructure. Say: after choosing this interval, all future intervals must start after **currentEnd**, so the rest is the same problem restricted to the suffix of compatible intervals. Or say: after scanning this prefix, any successful path only needs the maximum reachable boundary, because any smaller boundary is dominated.\n\nThat concrete remaining-instance statement connects the proof to the implementation. It tells the interviewer why a few variables are enough and why no discarded choice can return later to improve the answer.",
      },
    ],
    keyTakeaways: [
      "Optimal substructure lets the remaining work after a greedy choice be solved as a smaller optimization problem.",
      "Greedy needs optimal substructure plus a proven safe choice; optimal substructure alone often still requires DP.",
      "The retained state must contain all information future choices need for correctness.",
      "In interviews, define the remaining instance explicitly instead of naming the property abstractly.",
    ],
  },
  {
    kind: "concept",
    slug: "greedy-exchange-argument",
    moduleId: "greedy-fundamentals",
    order: 4,
    title: "The Exchange Argument",
    estimatedReadingMin: 9,
    tags: ["Greedy", "Exchange Argument", "Correctness", "Proofs"],
    summaryMD:
      "An exchange argument proves a greedy choice by taking an optimal solution that differs, swapping the greedy choice into it, and showing the result is still feasible and no worse.",
    sections: [
      {
        heading: "The Proof Shape",
        bodyMD:
          "The exchange argument is the most reusable proof technique for greedy algorithms. You assume there is an optimal solution. If that solution already contains the greedy choice, there is nothing to prove. If it does not, you exchange one of its choices with the greedy choice and show that the modified solution remains valid and has objective value no worse than before.\n\nThis proves that some optimal solution contains the greedy choice. Once that is established, the algorithm can safely commit to the choice and solve the smaller remaining problem. The proof is often short, but it must address both feasibility and objective value.",
      },
      {
        heading: "Template Step by Step",
        bodyMD:
          "Use this template in interviews:\n\n1. Let **G** be the greedy choice the algorithm makes first.\n2. Consider an optimal solution **OPT**.\n3. If **OPT** already uses **G**, we are done.\n4. Otherwise, identify the item **X** in **OPT** that conflicts with or occupies the role of **G**.\n5. Replace **X** with **G**.\n6. Prove the replacement is feasible.\n7. Prove the replacement is no worse for the objective.\n\nThe exact meaning of no worse depends on the problem. For maximizing the number of intervals, the count stays the same. For minimizing arrows, the number of arrows does not increase. For lexicographically smallest strings, the resulting string is no larger while still allowing all required future characters.",
      },
      {
        heading: "Example: Earliest Ending Interval",
        bodyMD:
          "In maximum non-overlapping intervals, greedy chooses the interval with the earliest end time among all available intervals. Take any optimal solution. If its first interval is not the greedy interval, replace its first interval with the greedy one. The greedy interval ends no later than the original first interval, so every later interval that was compatible before is still compatible after the swap.\n\nThe number of chosen intervals is unchanged, and feasibility is preserved. Therefore there exists an optimal solution that starts with the earliest-ending interval. Repeating this reasoning after each choice justifies the full greedy scan.",
      },
      {
        heading: "Common Proof Mistakes",
        bodyMD:
          "The first mistake is proving only that the greedy choice looks good, not that it can replace a choice inside an optimal solution. A statement like it leaves more room is useful intuition, but the proof must connect that room to all future choices remaining feasible.\n\nThe second mistake is exchanging with the wrong object. In scheduling, the greedy interval usually replaces the first interval of an optimal solution, not an arbitrary later interval. In heap scheduling, a newly considered job may replace the longest accepted job, not necessarily the most recent job. The exchange must target the item whose role the greedy choice can safely take.\n\nThe third mistake is ignoring ties. Ties are usually harmless, but the proof should tolerate them. If two choices end at the same time or have the same cost, either can be selected because the exchange remains no worse.",
      },
    ],
    keyTakeaways: [
      "The exchange argument proves there is an optimal solution that includes the greedy choice.",
      "The standard proof is assume an optimal solution differs, swap the greedy choice in, preserve feasibility, and show no worse objective value.",
      "A correct exchange identifies exactly which choice in the optimal solution is being replaced.",
      "Tie cases should still satisfy the same feasibility and no-worse reasoning.",
    ],
  },
  {
    kind: "concept",
    slug: "greedy-vs-dynamic-programming",
    moduleId: "greedy-fundamentals",
    order: 5,
    title: "Greedy vs Dynamic Programming",
    estimatedReadingMin: 8,
    tags: ["Greedy", "Dynamic Programming", "Decision Making", "Trade-offs"],
    summaryMD:
      "Greedy is safe when one proven local choice can dominate all alternatives, while dynamic programming is needed when multiple future states must remain alive until more information is known.",
    sections: [
      {
        heading: "The Decision Difference",
        bodyMD:
          "Greedy and dynamic programming both solve optimization problems by exploiting structure, but they make decisions at different times. Greedy chooses now and commits. DP delays commitment by computing the value of multiple states, then lets a recurrence decide which future is best.\n\nA useful mental model is futures. Greedy keeps one future because a proof says all other futures are dominated or exchangeable. DP keeps many futures because early choices can become good or bad depending on later constraints. If you cannot safely discard competing futures, you should be suspicious of a greedy solution.",
      },
      {
        heading: "When Greedy Is Safe",
        bodyMD:
          "Greedy is usually safe when the local choice protects a bottleneck resource that every future solution needs. Earliest-ending intervals protect time. Farthest reach protects array progress. Replacing the longest job under a deadline protects total scheduled time. Choosing a character only when its future availability is safe protects string feasibility.\n\nThe key is dominance. If one choice leaves the future at least as flexible as another choice while achieving the same immediate role, the worse choice can be discarded. That is the heart of many exchange arguments and invariants.",
      },
      {
        heading: "When You Must Keep Multiple Futures",
        bodyMD:
          "Use DP when two choices cannot be ranked locally because their value depends on later decisions. In 0-1 Knapsack, a high-value item may consume capacity needed for a combination of smaller items. In Edit Distance, insert, delete, and replace each lead to different prefix states that must all be evaluated. In many coin systems, choosing the largest coin first can prevent the fewest total coins.\n\nThese problems still have optimal substructure, but no single first choice is provably safe across all inputs. DP keeps states such as **index**, **capacity**, **amount**, or two prefix lengths so that each future can be compared after its consequences are known.",
      },
      {
        heading: "A Fast Interview Diagnostic",
        bodyMD:
          "Ask four questions before choosing the paradigm:\n\n1. Can I state a local rule that chooses one action before solving the rest?\n2. Can I prove an optimal solution exists that takes this action?\n3. After taking it, is the remaining problem the same type with a smaller boundary?\n4. If the answer to question two is no, what state variables are needed to compare the competing futures?\n\nIf the proof is strong, implement greedy. If the proof keeps breaking because different histories matter, define DP states. This diagnostic is especially valuable when a problem is disguised as sorting, scheduling, or reachability but actually requires retaining alternatives.",
      },
    ],
    keyTakeaways: [
      "Greedy commits early; DP evaluates multiple states before choosing among futures.",
      "Greedy is safe when a local choice can be proven dominant or exchangeable with an optimal choice.",
      "DP is needed when early decisions interact with later constraints and no single future can be discarded safely.",
      "Optimal substructure appears in both paradigms, but greedy additionally requires the greedy-choice property.",
    ],
  },
  {
    kind: "concept",
    slug: "greedy-common-interview-patterns",
    moduleId: "greedy-fundamentals",
    order: 6,
    title: "Common Greedy Interview Patterns",
    estimatedReadingMin: 9,
    tags: ["Greedy", "Patterns", "Intervals", "Heaps"],
    summaryMD:
      "Most interview greedy problems reduce to a small set of templates involving sorted boundaries, deadlines, farthest reach, heap-backed replacement, or last-occurrence feasibility.",
    sections: [
      {
        heading: "How to Use Pattern Recognition",
        bodyMD:
          "Pattern recognition should suggest a candidate greedy rule, not replace the proof. When you see intervals, deadlines, reachability, limited resources, or string feasibility, map the problem to a known template and then verify the greedy-choice property for the exact objective.\n\nThe best candidates explain both the signal and the invariant. Signal tells you which template to try. Invariant tells you why the scan remains correct after every choice.",
      },
      {
        heading: "Sort-by-End Intervals",
        bodyMD:
          "Use the sort-by-end template when you must maximize the number of non-overlapping intervals, remove the fewest overlaps, or place the minimum number of resources over interval ranges. The signal is that choosing an interval or arrow creates a right boundary that future items must respect. Sorting by end time or right endpoint makes the earliest finishing compatible choice available first.\n\nThe invariant is that the chosen boundary is as far left as possible among equally good partial solutions. For interval scheduling, earlier end leaves more room. For arrows bursting balloons, placing an arrow at the current smallest end keeps it inside the current overlapping group while maximizing the chance it also hits later balloons in that group.",
      },
      {
        heading: "Earliest Deadlines and Farthest Reach",
        bodyMD:
          "Use earliest-deadline scheduling when tasks, events, or courses have deadlines and each accepted item consumes time. The usual signal is a feasibility condition like total time must not exceed the current deadline. Sometimes the greedy rule is to process by increasing deadline and drop the longest accepted task when feasibility breaks, because removing the longest task frees the most time with one removal.\n\nUse farthest-reach arrays when each position expands a reachable frontier, as in Jump Game and Jump Game II. The signal is that among all choices available in the current window, only the farthest future boundary matters. Shorter reaches are dominated because they cannot unlock anything that the farther reach cannot also reach.",
      },
      {
        heading: "Heap-Assisted Greedy",
        bodyMD:
          "Use a heap when the greedy algorithm needs to revise a previous choice while scanning in a meaningful order. The scan order often comes from time, deadline, height, capital, or position. The heap stores the best candidate to add next or the worst accepted candidate to remove if a constraint becomes violated.\n\nCommon signals include choose the largest profit among currently affordable projects, use ladders on the biggest climbs seen so far, or keep accepted courses but discard the longest duration when deadlines fail. The invariant is not that the algorithm never changes its mind. It is that after each prefix, the heap represents the best feasible set for that prefix under the chosen resource constraint.",
      },
      {
        heading: "Last-Occurrence String Cuts",
        bodyMD:
          "Use last-occurrence templates when a string decision must ensure that required characters can still appear later. Partition Labels expands the current segment to the farthest last occurrence of any character inside it; a cut is safe only when the scan reaches that farthest boundary. Remove Duplicate Letters chooses a small character only after confirming that popped characters occur again later.\n\nThe signal is future availability. A locally smaller character or earlier cut is unsafe if it loses the final copy of something required. The invariant tracks whether every deferred character can still be recovered. Once the invariant says the future remains feasible, the greedy choice can be locked in.",
      },
    ],
    keyTakeaways: [
      "Intervals often use sorting by end or right endpoint to keep the future boundary as flexible as possible.",
      "Deadline and reach problems track prefix feasibility through total time, dropped longest tasks, or farthest reachable boundary.",
      "Heap-assisted greedy manages the best candidate to add or the worst accepted choice to replace under a resource constraint.",
      "String greedy problems often depend on last occurrences so local choices do not destroy future feasibility.",
    ],
  },
];
