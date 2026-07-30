import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "bt-subsets",
    moduleId: "bt-subset",
    order: 9,
    title: "Subsets",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/subsets/",
    tags: ["Backtracking", "Subset Pattern", "Recursion", "DFS", "Power Set"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 16,
    statementMD:
      "Given an integer array **nums** of unique elements, return all possible subsets of **nums**. The solution set must not contain duplicate subsets, and the order of subsets in the output may be arbitrary.",
    constraints: [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10",
      "All values in nums are unique",
    ],
    inputMD: "An integer array **nums** containing unique values.",
    outputMD: "A list of lists containing every subset of **nums** exactly once.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]",
        explanation: "Each number can be absent or present, so three numbers create **2^3 = 8** subsets. The output is shown in one valid DFS order.",
      },
      {
        input: "nums = [0]",
        output: "[[],[0]]",
        explanation: "The empty subset is always included, and the only non-empty subset chooses **0**.",
      },
    ],
    learningObjectives: [
      "Recognise **enumerate all subsets** as the subset backtracking pattern.",
      "Use a **start** pointer so every recursive choice only considers later indices.",
      "Record the current path at every recursion node because every partial choice is a valid subset.",
      "Explain the equivalent binary framing where each index is either taken or skipped.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe phrase **all possible subsets** is the giveaway. We are not optimizing one answer; we must enumerate every valid configuration. For a subset, there is no fixed final length. The empty path is valid, a one-element path is valid, and so is any longer path that preserves the original index order.\n\nThe subset pattern keeps two pieces of state: **start**, the first index still available, and **path**, the elements chosen so far. At each recursion frame, record a copy of **path** immediately, then try choosing each candidate from **start** onward. Choosing **nums[i]** moves the next frame to **i + 1**, which means the same element cannot be reused and earlier elements cannot be reordered back into the subset.\n\nYou can also view the same search as a binary take-or-skip decision at every index: take **nums[i]** and move forward, or skip it and move forward. The start-index loop is the compact interview version of that decision tree, and every node in the tree represents one answer.",
    commonMistakes: [
      "Recording a subset only at the leaf, which misses shorter subsets like **[]** and **[1]** in the loop-style DFS.",
      "Recursing with the same index after choosing, which allows reusing an element and turns the problem into a combination-sum variant.",
      "Adding **path** directly to the result instead of adding a copy, causing every stored subset to mutate later.",
      "Starting the loop from **0** in every frame, which generates duplicate orders such as **[1,2]** and **[2,1]**.",
    ],
    algorithmMD:
      "**State**\n\nEach recursion frame carries **start** and **path**. **start** is the first index that may still be chosen, and **path** is the subset built by previous choices. The result list stores copies of paths, not references to the mutable working list.\n\n**Recursion tree**\n\nFor **nums = [1,2,3]**, the root has **path = []** and records the empty subset immediately. From the root, choose **1** to enter the branch **[1]**, then choose **2** for **[1,2]**, then choose **3** for **[1,2,3]**. After unchoosing **3** and **2**, the **[1]** branch can choose **3** directly, creating **[1,3]**. Back at the root, choosing **2** creates **[2]**, then **[2,3]**. Finally, choosing **3** from the root creates **[3]**. Notice that every node, not just every leaf, is an output subset.\n\n**Pruning**\n\nNo value-based pruning is needed because all values are unique. The **start** pointer is the structural pruning: it prevents reusing an index and prevents permuted duplicates such as **[2,1]** after **[1,2]** has already represented that combination of elements.\n\n**Algorithm**\n\n1. Create an empty result list and an empty **path**.\n2. Enter DFS with **start = 0**.\n3. Add a copy of **path** to the result at the start of every frame.\n4. For each index from **start** to the end, choose **nums[index]** by appending it to **path**.\n5. Explore the next frame with **start = index + 1**.\n6. Unchoose by removing the last value so the next sibling branch starts clean.\n7. Return the result after DFS finishes.",
    solutions: [
      {
        name: "Start-index subset DFS",
        approachMD:
          "Use the canonical subset DFS template: record the current path, then append one later element at a time and recurse beyond that element. The **start** pointer keeps each subset in index order, so every unique selection appears exactly once.",
        walkthroughMD:
          "1. Create **result** and call the helper with **start = 0** and an empty **path**.\n2. In every helper call, add a new copy of **path** to **result**.\n3. Loop **index** from **start** through the end of **nums**.\n4. Add **nums[index]** to **path** to choose it for the current subset.\n5. Recurse with **index + 1** so later choices can only use later numbers.\n6. Remove the last value from **path** before trying the next index.",
        complexity: { time: "O(2^n * n)", space: "O(n)", note: "There are 2^n subsets and copying a path can cost up to n. Auxiliary recursion space is O(n); output storage is O(2^n * n)." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
        result.add(new ArrayList<>(path));

        for (int index = start; index < nums.length; index++) {
            path.add(nums[index]);
            backtrack(nums, index + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,3]. Track the current recursion depth, the choice being made, and when a path is copied into the answer.",
      columns: ["depth", "choice", "path", "action", "result added"],
      rows: [
        ["0", "enter start 0", "[]", "record current path", "[]"],
        ["0", "choose 1", "[1]", "explore from index 1", "pending"],
        ["1", "enter start 1", "[1]", "record current path", "[1]"],
        ["1", "choose 2", "[1,2]", "explore from index 2", "pending"],
        ["2", "enter start 2", "[1,2]", "record current path", "[1,2]"],
        ["2", "choose 3", "[1,2,3]", "explore from index 3", "pending"],
        ["3", "enter start 3", "[1,2,3]", "record current path", "[1,2,3]"],
        ["2", "unchoose 3", "[1,2]", "return to sibling choices", "none"],
        ["1", "unchoose 2, choose 3", "[1,3]", "explore from index 3", "pending"],
        ["2", "enter start 3", "[1,3]", "record current path", "[1,3]"],
        ["0", "unchoose 1, choose 2", "[2]", "explore from index 2", "pending"],
        ["1", "enter start 2", "[2]", "record current path", "[2]"],
        ["1", "choose 3", "[2,3]", "explore from index 3", "pending"],
        ["2", "enter start 3", "[2,3]", "record current path", "[2,3]"],
        ["0", "choose 3", "[3]", "explore from index 3", "pending"],
        ["1", "enter start 3", "[3]", "record current path", "[3]"],
      ],
      narrativeMD: "The final result contains **[]**, **[1]**, **[1,2]**, **[1,2,3]**, **[1,3]**, **[2]**, **[2,3]**, and **[3]**. The order can vary, but every subset is produced once because the start pointer only moves forward.",
    },
    complexityNote:
      "The result itself is exponential, so the goal is not to beat **O(2^n)**. The interview goal is to generate each subset once with clean choose, explore, and unchoose mechanics.",
    interviewTipsMD:
      "Say early that every recursion node is an answer. That sentence prevents the most common leaf-only mistake. Then name the two equivalent framings: a binary take-or-skip tree over indices, or the start-index DFS loop that chooses the next included element. Interviewers usually prefer the start-index version because it naturally extends to duplicates and combinations.",
    followUps: [
      "How would the solution change if **nums** could contain duplicate values?",
      "How would you generate only subsets of size exactly **k**?",
      "How would you stream subsets one at a time instead of storing all of them?",
      "How would the recursion tree differ in the explicit take-or-skip implementation?",
    ],
    similarProblems: [
      { title: "Subsets II", difficulty: "Medium", slug: "bt-subsets-ii", note: "Adds duplicate values and the sorted-skip pruning rule." },
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "Uses the same start pointer but records only paths of length k." },
      { title: "Combination Sum", difficulty: "Medium", slug: "bt-combination-sum", note: "Uses choose and unchoose while controlling whether an index can be reused." },
      { title: "Permutations", difficulty: "Medium", slug: "bt-permutations", note: "Contrasts subset selection with ordered placement using a used marker." },
    ],
    keyTakeaways: [
      "Subsets are an enumeration problem, not an optimization problem.",
      "Record **path** at every node because every partial selection is valid.",
      "A forward-moving **start** pointer prevents reuse and permutation duplicates.",
      "Always copy the mutable path before storing it in the result.",
    ],
    pattern:
      "Subset DFS template: record the current path, choose each candidate from start onward, recurse with the next index, then unchoose before trying the next sibling.",
  },
  {
    kind: "problem",
    slug: "bt-subsets-ii",
    moduleId: "bt-subset",
    order: 10,
    title: "Subsets II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/subsets-ii/",
    tags: ["Backtracking", "Subset Pattern", "Sorting", "Duplicate Handling", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given an integer array **nums** that may contain duplicates, return all possible subsets. The solution set must not contain duplicate subsets, and the order of subsets in the output may be arbitrary.",
    constraints: [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10",
      "nums may contain duplicate values",
    ],
    inputMD: "An integer array **nums**, where equal values may appear multiple times.",
    outputMD: "A list of lists containing every distinct subset exactly once.",
    examples: [
      {
        input: "nums = [1,2,2]",
        output: "[[],[1],[1,2],[1,2,2],[2],[2,2]]",
        explanation: "The two **2** values allow subsets with zero, one, or two copies of **2**, but the subset **[2]** should appear only once.",
      },
      {
        input: "nums = [0]",
        output: "[[],[0]]",
        explanation: "With one value, the answer is the same as the basic subset pattern: skip it or take it.",
      },
      {
        input: "nums = [2,2]",
        output: "[[],[2],[2,2]]",
        explanation: "Choosing the first **2** or the second **2** alone produces the same subset, so only one single-**2** branch is kept.",
      },
    ],
    learningObjectives: [
      "Extend the subset DFS template to inputs with duplicate values.",
      "Sort the array so equal values become adjacent and duplicate branches can be detected locally.",
      "Use the **i > start** guard to skip only duplicate sibling choices, not valid deeper copies.",
      "Explain why duplicate pruning removes repeated outputs without removing subsets that need multiple equal values.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is still the subset pattern: enumerate every valid selection, and every recursion node is an answer. The new difficulty is that equal values make different index choices look identical in the output. For **[2,2]**, choosing index 0 alone and choosing index 1 alone both create **[2]**.\n\nSorting turns duplicate values into adjacent runs. Then each recursion level can enforce one rule: among equal sibling choices, only the first copy is allowed to start a branch. The condition **i > start && nums[i] == nums[i - 1]** detects exactly that situation. **i > start** means the previous equal value was available as a sibling in the same frame, so choosing the later copy would duplicate the earlier branch.\n\nThe guard must not skip when **i == start**. In that case, we are in a deeper frame after choosing a previous copy, and selecting the next equal value is how we build valid subsets such as **[2,2]**. Sorting plus this level-aware guard removes duplicate branches, not duplicate values from the final subsets.",
    commonMistakes: [
      "Skipping every value equal to the previous one, which incorrectly prevents valid subsets like **[2,2]**.",
      "Forgetting to sort first, so equal values are not adjacent and the duplicate check is unreliable.",
      "Using **i > 0** instead of **i > start**, which skips duplicates across different recursion levels and loses answers.",
      "Trying to remove duplicate lists after generation with a set, which hides the real backtracking pruning idea and wastes work.",
    ],
    algorithmMD:
      "**State**\n\nEach frame carries **start** and **path**, just like Subsets. The array is sorted before DFS. At one recursion level, the loop variable **i** represents sibling choices for the next value to append to **path**.\n\n**Recursion tree**\n\nFor sorted **nums = [1,2,2]**, the root records **[]**. Choosing **1** records **[1]**. Inside that branch, choosing the first **2** records **[1,2]**, and the deeper frame may choose the second **2** to record **[1,2,2]**. After returning to the **[1]** frame, the loop considers the second **2** as a sibling choice. Because it equals the previous value and **i > start**, that branch is skipped; it would create another **[1,2]** branch.\n\nBack at the root, choosing the first **2** records **[2]**, and the deeper frame can choose the second **2** to record **[2,2]**. When the root loop later considers the second **2**, the same skip rule removes it because the first **2** already started the root-level **[2]** branch.\n\n**Pruning**\n\nThe pruning rule is **skip nums[i] when i > start and nums[i] == nums[i - 1]**. Sorting makes equal values adjacent. The **i > start** part proves the previous equal value was a sibling option in this exact frame, so the branch beginning with the later copy would produce the same suffix choices as the branch beginning with the earlier copy. When **i == start**, the previous equal value belongs to an ancestor choice, not a sibling, so we must allow it to support subsets with multiple copies.\n\n**Algorithm**\n\n1. Sort **nums** so duplicates are adjacent.\n2. Create an empty result list and an empty **path**.\n3. At the start of every DFS frame, add a copy of **path** to the result.\n4. Loop **i** from **start** to the end of **nums**.\n5. If **i > start** and **nums[i] == nums[i - 1]**, skip this sibling branch.\n6. Otherwise choose **nums[i]**, recurse with **i + 1**, and then unchoose it.\n7. Return the result after all unique branches have been explored.",
    solutions: [
      {
        name: "Sorted subset DFS with duplicate-sibling pruning",
        approachMD:
          "Sort first, then use the normal start-index subset DFS. At each level, skip a value when it is the same as the immediately previous value and the previous value was available as a sibling choice in the same loop.",
        walkthroughMD:
          "1. Sort **nums** so equal values sit next to each other.\n2. Start DFS with **start = 0** and an empty **path**.\n3. Record a copy of **path** at every frame.\n4. For each candidate index **i**, skip it if **i > start** and it equals **nums[i - 1]**.\n5. Choose **nums[i]**, recurse with **i + 1**, then remove it before the next sibling.\n6. Return the accumulated unique subsets.",
        complexity: { time: "O(2^n * n)", space: "O(n)", note: "Sorting costs O(n log n), dominated by the worst-case 2^n unique subsets and path copying. Auxiliary recursion space is O(n); output storage can be O(2^n * n)." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {
        result.add(new ArrayList<>(path));

        for (int index = start; index < nums.length; index++) {
            if (index > start && nums[index] == nums[index - 1]) {
                continue;
            }

            path.add(nums[index]);
            backtrack(nums, index + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,2]. After sorting, track how the duplicate-sibling skip keeps one branch for a single **2** while still allowing **[2,2]** and **[1,2,2]**.",
      columns: ["depth", "index considered", "path", "action", "result added"],
      rows: [
        ["0", "enter start 0", "[]", "record current path", "[]"],
        ["0", "choose 1 at 0", "[1]", "explore start 1", "pending"],
        ["1", "enter start 1", "[1]", "record current path", "[1]"],
        ["1", "choose first 2 at 1", "[1,2]", "explore start 2", "pending"],
        ["2", "enter start 2", "[1,2]", "record current path", "[1,2]"],
        ["2", "choose second 2 at 2", "[1,2,2]", "explore start 3", "pending"],
        ["3", "enter start 3", "[1,2,2]", "record current path", "[1,2,2]"],
        ["1", "consider second 2 at 2", "[1]", "skip duplicate sibling", "none"],
        ["0", "choose first 2 at 1", "[2]", "explore start 2", "pending"],
        ["1", "enter start 2", "[2]", "record current path", "[2]"],
        ["1", "choose second 2 at 2", "[2,2]", "explore start 3", "pending"],
        ["2", "enter start 3", "[2,2]", "record current path", "[2,2]"],
        ["0", "consider second 2 at 2", "[]", "skip duplicate branch at root", "none"],
      ],
      narrativeMD: "The skip happens only when the later **2** is a sibling of an earlier **2** at the same depth. Deeper frames can still choose the later **2**, so subsets with two copies remain valid while duplicate single-copy branches disappear.",
    },
    complexityNote:
      "The duplicate skip reduces repeated work on equal-value branches, but the worst case is still exponential when all values are distinct.",
    interviewTipsMD:
      "Do not just say skip duplicates. Say exactly where: skip a duplicate only when it appears after the first equal value in the same loop level. The **i > start** guard is the proof. It distinguishes duplicate sibling branches, which should be removed, from deeper choices that represent taking multiple copies, which must stay.",
    followUps: [
      "How would you adapt this to generate subsets of size exactly **k** with duplicates?",
      "How would you count the number of unique subsets without listing them?",
      "How would the duplicate rule change for permutations with repeated values?",
      "Can you generate the subsets in lexicographic order, and what sort order would you use?",
    ],
    similarProblems: [
      { title: "Subsets", difficulty: "Medium", slug: "bt-subsets", note: "The same template without duplicate pruning." },
      { title: "Permutations II", difficulty: "Medium", slug: "bt-permutations-ii", note: "Also sorts first and skips duplicate sibling choices, but for ordered arrangements." },
      { title: "Combination Sum II", difficulty: "Medium", slug: "bt-combination-sum-ii", note: "Uses the same sorted-skip rule while targeting a sum." },
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "Another start-index DFS where sibling choices are controlled by depth." },
      { title: "Palindrome Partitioning", difficulty: "Medium", slug: "bt-palindrome-partitioning", note: "A different backtracking pattern where pruning rejects invalid cuts." },
    ],
    keyTakeaways: [
      "Sorting makes duplicate values adjacent so a local skip rule can detect repeated branches.",
      "Use **i > start**, not **i > 0**, to skip duplicate siblings without losing deeper duplicate copies.",
      "Every recursion node is still a valid subset and should be recorded.",
      "Pruning duplicate branches is better than generating duplicates and deduplicating afterward.",
    ],
    pattern:
      "Duplicate-safe subset DFS: sort the array, record every path, and skip a candidate only when it duplicates a previous sibling at the same recursion depth.",
  },
];