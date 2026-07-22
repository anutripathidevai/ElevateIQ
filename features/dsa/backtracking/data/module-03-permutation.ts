import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "bt-permutations",
    moduleId: "bt-permutation",
    order: 11,
    title: "Permutations",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/permutations/",
    tags: ["Backtracking", "Recursion", "DFS", "Permutation", "Array"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given an array **nums** of distinct integers, return all possible permutations. You may return the answer in any order.",
    constraints: [
      "1 <= nums.length <= 6",
      "-10 <= nums[i] <= 10",
      "All integers in nums are distinct",
    ],
    inputMD: "An integer array **nums** where every value is unique.",
    outputMD: "A list of lists, where each inner list is one ordering that uses every element of **nums** exactly once.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        explanation: "There are 3 choices for the first position, then 2 for the second, then 1 for the third, giving **3! = 6** orderings.",
      },
      {
        input: "nums = [0,1]",
        output: "[[0,1],[1,0]]",
        explanation: "Both values must appear exactly once, and the only difference between the two answers is their order.",
      },
      {
        input: "nums = [1]",
        output: "[[1]]",
        explanation: "A single value has only one possible ordering.",
      },
    ],
    learningObjectives: [
      "Recognise that asking for all orderings is the permutation placement pattern.",
      "Represent the current partial ordering with a path and a **used[]** array.",
      "Apply choose, explore, and unchoose so sibling branches do not share state.",
      "Explain why the output size itself is factorial.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe phrase all possible permutations means order matters and every element must be used exactly once. This is not a subset problem where each value is either included or skipped once. Instead, every recursion depth represents one position in the output ordering, and the choices are all elements not already used in earlier positions.\n\nIntuition\n\nThink of filling slots from left to right. At depth **0**, any number can occupy the first slot. At depth **1**, any remaining number can occupy the second slot. A boolean **used[]** array is the cleanest state because it answers one question in O(1): is this index already in the current path? When the path reaches length **n**, it is a complete permutation and should be copied into the result.",
    commonMistakes: [
      "Using a start index like combinations, which incorrectly prevents values from appearing before earlier indices.",
      "Adding the live **path** object to the answer without copying it.",
      "Forgetting to unmark **used[i]** after recursion, causing later branches to miss valid choices.",
      "Stopping after one valid ordering instead of collecting every leaf in the recursion tree.",
    ],
    algorithmMD:
      "**State**\n\nEach recursion frame carries the input **nums**, a mutable **path**, a boolean **used[]** array, and the shared **result** list. The depth is simply **path.length**. The invariant is that every index marked true in **used[]** appears exactly once in **path**, and every index marked false is available for the next position.\n\n**Recursion tree**\n\nFor **nums = [1,2,3]**, the root is the empty path. Level 1 has branches **[1]**, **[2]**, and **[3]** because any value can be first. Under **[1]**, the next branches are **[1,2]** and **[1,3]**. Their leaves are **[1,2,3]** and **[1,3,2]**. The same structure repeats under prefixes **[2]** and **[3]**. Every root-to-leaf path is one complete ordering.\n\n**Pruning**\n\nThe only pruning needed for distinct numbers is the **used[]** check. If an index is already true, choosing it again would duplicate that element inside the same permutation, so the branch is skipped. No value-based duplicate rule is needed because the input values are distinct.\n\n**Algorithm**\n\n1. Create **result**, **path**, and **used[]**.\n2. If **path.length == nums.length**, copy **path** into **result** and return.\n3. For each index **i** from left to right, skip it when **used[i]** is true.\n4. Choose **nums[i]** by marking **used[i]** true and appending it to **path**.\n5. Explore the next depth.\n6. Unchoose by removing the last path value and marking **used[i]** false.\n7. Return **result** after all branches finish.",
    solutions: [
      {
        name: "Backtracking with used array",
        approachMD:
          "Fill the permutation one position at a time. At each depth, scan every index and choose only values whose **used** flag is false. The helper records a copy when the path length reaches the input length, then backtracks so the next sibling branch sees a clean state.",
        walkthroughMD:
          "1. Initialise **result**, an empty **path**, and a boolean **used** array of length **n**.\n2. In the helper, check whether **path.size() == nums.length**. If so, copy the path into the result.\n3. Otherwise, loop over every index because any unused value can occupy the current position.\n4. Mark the chosen index as used, append its value, and recurse.\n5. Remove the appended value and mark the index unused before continuing the loop.",
        complexity: {
          time: "O(n! * n)",
          space: "O(n)",
          note: "There are n! permutations, and copying each complete path costs O(n). The recursion path and used array take O(n) extra space excluding output.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path));
            return;
        }

        for (int index = 0; index < nums.length; index++) {
            if (used[index]) {
                continue;
            }

            used[index] = true;
            path.add(nums[index]);
            backtrack(nums, used, path, result);
            path.remove(path.size() - 1);
            used[index] = false;
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,2,3]. Track the first branch completely, then show how backtracking opens the next sibling branches.",
      columns: ["depth", "choice", "path", "used", "action"],
      rows: [
        ["0", "start", "[]", "[F,F,F]", "begin with no chosen values"],
        ["0", "1", "[1]", "[T,F,F]", "choose nums[0] for the first position"],
        ["1", "2", "[1,2]", "[T,T,F]", "choose nums[1] for the second position"],
        ["2", "3", "[1,2,3]", "[T,T,T]", "record a complete permutation"],
        ["2", "3", "[1,2]", "[T,T,F]", "unchoose nums[2] and return to depth 2"],
        ["1", "2", "[1]", "[T,F,F]", "unchoose nums[1] and try another unused value"],
        ["1", "3", "[1,3]", "[T,F,T]", "choose nums[2] under prefix [1]"],
        ["2", "2", "[1,3,2]", "[T,T,T]", "record the second permutation under prefix [1]"],
        ["0", "1", "[]", "[F,F,F]", "after finishing prefix [1], unchoose nums[0]"],
        ["0", "2", "[2]", "[F,T,F]", "choose nums[1] and repeat the same template"],
      ],
      narrativeMD: "The tree eventually records six leaves. The key invariant is restored after every return: the path and **used[]** match the current prefix exactly.",
    },
    interviewTipsMD:
      "Say immediately that permutations differ from combinations because order matters, so the loop must start at **0** at every depth. The **used[]** array prevents reusing an index within the same path, while unchoose restores the frame for the next sibling. Mention the factorial output size so the interviewer knows you are not trying to make the enumeration polynomial.",
    followUps: [
      "How would the solution change if **nums** contained duplicates?",
      "How would you stream each permutation to a callback instead of storing all of them?",
      "How would you generate the kth permutation without enumerating every earlier one?",
      "How would you solve permutations of characters in a string?",
    ],
    similarProblems: [
      { title: "Permutations II", difficulty: "Medium", slug: "bt-permutations-ii", note: "Adds duplicate values and requires a sorted skip rule." },
      { title: "Subsets", difficulty: "Medium", slug: "bt-subsets", note: "Contrasts permutation placement with subset take-or-skip choices." },
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "Uses a start index because order no longer matters." },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "bt-letter-combinations-of-a-phone-number", note: "Also fills one output position per recursion depth." },
      { title: "Next Permutation", difficulty: "Medium", url: "https://leetcode.com/problems/next-permutation/", note: "Computes one lexicographic successor instead of enumerating all orderings." },
    ],
    keyTakeaways: [
      "Permutation backtracking fills positions, not include-or-skip decisions.",
      "Use **used[]** when any unused element can be chosen at every depth.",
      "Always copy the path at the leaf and always unchoose before the next sibling.",
      "The honest time bound is **O(n! * n)** because the output has factorial size.",
    ],
    pattern:
      "Permutation placement template: for each output position, try every unused index, choose it, recurse to the next position, then unchoose it.",
  },
  {
    kind: "problem",
    slug: "bt-permutations-ii",
    moduleId: "bt-permutation",
    order: 12,
    title: "Permutations II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/permutations-ii/",
    tags: ["Backtracking", "Recursion", "DFS", "Permutation", "Sorting", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an array **nums** that may contain duplicate values, return all unique permutations in any order.",
    constraints: [
      "1 <= nums.length <= 8",
      "-10 <= nums[i] <= 10",
      "nums may contain duplicate values",
    ],
    inputMD: "An integer array **nums** where equal values may appear at multiple indices.",
    outputMD: "A list of unique permutations. Two permutations are the same when they contain the same values in the same order.",
    examples: [
      {
        input: "nums = [1,1,2]",
        output: "[[1,1,2],[1,2,1],[2,1,1]]",
        explanation: "Swapping the two equal **1** values does not create a new value ordering, so only three unique permutations remain.",
      },
      {
        input: "nums = [1,2,3]",
        output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
        explanation: "With all values distinct, this reduces to the original permutation problem.",
      },
      {
        input: "nums = [2,2,2]",
        output: "[[2,2,2]]",
        explanation: "All indices carry the same value, so every index ordering produces the same value ordering.",
      },
    ],
    learningObjectives: [
      "Sort duplicate values so equal candidates become adjacent.",
      "Use **used[]** for index reuse and a separate skip rule for duplicate values.",
      "Explain why the previous equal not yet used guard fixes a canonical order among equal values.",
      "Generate each unique permutation once without post-processing with a set.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is still the permutation placement pattern: order matters, each recursion depth fills one output position, and each index can be used once. The new signal is duplicate values. If two equal values are treated as different choices at the same depth, the recursion tree creates identical value sequences through different index identities.\n\nIntuition\n\nSort the array first so equal values sit next to each other. Then enforce a canonical rule among equal values: when the previous equal value has not been used in the current prefix, do not use the later equal value yet. That means equal copies are chosen from left to right within any sibling group. We still allow the later equal value after the previous one is already in the path, because then they occupy different positions in a legitimate permutation.",
    commonMistakes: [
      "Skipping every duplicate value unconditionally, which prevents valid permutations like **[1,1,2]**.",
      "Using the wrong guard **used[i - 1]** instead of **!used[i - 1]**, which skips the cases where duplicate copies should be allowed together.",
      "Forgetting to sort first, so adjacent duplicate checks do not group equal values reliably.",
      "Using a result set to remove duplicates after generating them, which hides the pruning idea and wastes factorial work.",
    ],
    algorithmMD:
      "**State**\n\nEach frame carries the sorted **nums**, the current **path**, the boolean **used[]** array, and the shared **result** list. The depth is **path.length**. The **used[]** array still prevents reusing the same index, while sorting enables duplicate-aware pruning across neighbouring equal values.\n\n**Recursion tree**\n\nFor sorted **nums = [1,1,2]**, the root first chooses the **1** at index 0, then can choose the **1** at index 1 or **2**, producing leaves **[1,1,2]** and **[1,2,1]**. Back at the root, the branch that tries the **1** at index 1 is pruned because the previous equal **1** at index 0 is not used. Finally, choosing **2** at the root leads to **[2,1,1]**. The duplicate root branch that would mirror the first **1** branch never runs.\n\n**Pruning**\n\nAfter sorting, skip **nums[i]** when **i > 0**, **nums[i] == nums[i - 1]**, and **used[i - 1]** is false. This is the previous equal not yet used rule. It fixes the relative order of equal elements: among equal copies that are both available at the same depth, only the leftmost unused copy may start the branch. If the previous equal is already used, then the later equal copy is allowed because it is filling a later position, not competing as a sibling duplicate. This removes duplicate permutations at the source.\n\n**Algorithm**\n\n1. Sort **nums** so duplicate values are adjacent.\n2. Create **result**, **path**, and **used[]**.\n3. If **path.length == nums.length**, copy **path** into **result** and return.\n4. For each index **i**, skip it if **used[i]** is true.\n5. Also skip it when **i > 0**, **nums[i] == nums[i - 1]**, and **used[i - 1]** is false.\n6. Choose **nums[i]**, mark it used, and recurse.\n7. Unchoose by removing the last value and marking **used[i]** false.",
    solutions: [
      {
        name: "Sorted backtracking with duplicate skip",
        approachMD:
          "Sort first, then run the same used-array permutation template. The additional skip guard prevents a later equal value from being selected before an earlier equal value at the same decision level. That gives every value ordering one canonical index ordering.",
        walkthroughMD:
          "1. Sort **nums** so equal values are adjacent.\n2. In the helper, copy the path when it has length **n**.\n3. Loop over every index at each depth, skipping indices already marked in **used**.\n4. For duplicates, skip index **i** when the previous equal index **i - 1** is not currently used.\n5. Choose the candidate, recurse, and then unchoose it before testing the next candidate.",
        complexity: {
          time: "O(n! * n)",
          space: "O(n)",
          note: "In the worst case all values are distinct, so there are n! leaves and each copied permutation costs O(n). Sorting costs O(n log n) and is dominated.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public List<List<Integer>> permuteUnique(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> result = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> result) {
        if (path.size() == nums.length) {
            result.add(new ArrayList<>(path));
            return;
        }

        for (int index = 0; index < nums.length; index++) {
            if (used[index]) {
                continue;
            }
            if (index > 0 && nums[index] == nums[index - 1] && !used[index - 1]) {
                continue;
            }

            used[index] = true;
            path.add(nums[index]);
            backtrack(nums, used, path, result);
            path.remove(path.size() - 1);
            used[index] = false;
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,1,2]. After sorting, track how the duplicate guard prunes the second root-level **1** while still allowing both **1** values inside a complete path.",
      columns: ["depth", "choice", "path", "used", "action"],
      rows: [
        ["0", "start", "[]", "[F,F,F]", "sort to [1,1,2] and begin"],
        ["0", "1 at index 0", "[1]", "[T,F,F]", "choose the first 1"],
        ["1", "1 at index 1", "[1,1]", "[T,T,F]", "allowed because the previous equal is already used"],
        ["2", "2 at index 2", "[1,1,2]", "[T,T,T]", "record [1,1,2]"],
        ["1", "2 at index 2", "[1,2]", "[T,F,T]", "after backtracking, choose 2 before the second 1"],
        ["2", "1 at index 1", "[1,2,1]", "[T,T,T]", "record [1,2,1]"],
        ["0", "1 at index 1", "[]", "[F,F,F]", "skip because the previous equal index 0 is unused"],
        ["0", "2 at index 2", "[2]", "[F,F,T]", "choose 2 as the first value"],
        ["1", "1 at index 0", "[2,1]", "[T,F,T]", "choose the first 1 after prefix [2]"],
        ["2", "1 at index 1", "[2,1,1]", "[T,T,T]", "record [2,1,1]"],
      ],
      narrativeMD: "The skipped root branch is exactly the duplicate mirror of choosing index 0 first. The guard preserves valid paths with both equal values while removing sibling branches that only swap indistinguishable copies.",
    },
    interviewTipsMD:
      "The most important sentence is: after sorting, if the previous equal value has not been used in the current prefix, this later equal value would create a duplicate sibling branch. Make clear that **used[]** solves index reuse, while the sorted duplicate guard solves value-level duplication. Interviewers often test the guard by asking why **!used[i - 1]** is correct.",
    followUps: [
      "How would you count unique permutations without generating them?",
      "How would the solution change if values arrived one at a time and could not be sorted upfront?",
      "How would you generate unique permutations in lexicographic order?",
      "How would you adapt the same duplicate rule to subsets with duplicates?",
    ],
    similarProblems: [
      { title: "Permutations", difficulty: "Medium", slug: "bt-permutations", note: "The base used-array template before duplicate pruning." },
      { title: "Subsets II", difficulty: "Medium", slug: "bt-subsets-ii", note: "Uses sorting plus a duplicate skip rule in a subset recursion tree." },
      { title: "Combination Sum II", difficulty: "Medium", slug: "bt-combination-sum-ii", note: "Combines duplicate skipping with a target-sum search." },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "bt-letter-combinations-of-a-phone-number", note: "Another position-filling recursion template without duplicate values." },
      { title: "N-Queens", difficulty: "Hard", slug: "bt-n-queens", note: "A richer backtracking problem where pruning removes invalid board placements." },
    ],
    keyTakeaways: [
      "Sorting groups equal values so duplicate decisions can be detected locally.",
      "The guard uses **!used[i - 1]** to block later equal values only when they are sibling alternatives.",
      "Equal values may still appear together in a path when the earlier copy is already used.",
      "Duplicate pruning is better than generating all permutations and deduplicating afterward.",
    ],
    pattern:
      "Duplicate-aware permutation template: sort, try every unused index, and skip a duplicate candidate when its previous equal copy is still unused.",
  },
];
