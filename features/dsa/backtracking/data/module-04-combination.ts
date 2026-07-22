import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "bt-combinations",
    moduleId: "bt-combination",
    order: 13,
    title: "Combinations",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/combinations/",
    tags: ["Backtracking", "Recursion", "DFS", "Combinations", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given two integers **n** and **k**, return all possible combinations of **k** numbers chosen from the range **1** through **n**. The answer may be returned in any order, but each combination should contain numbers in increasing order conceptually so the same set is not repeated as different permutations.",
    constraints: [
      "1 <= n <= 20",
      "1 <= k <= n",
    ],
    inputMD: "Two integers: **n**, the largest available number, and **k**, the number of values to choose.",
    outputMD: "A list of combinations, where each combination contains exactly **k** distinct numbers from **1** through **n**.",
    examples: [
      { input: "n = 4, k = 2", output: "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]", explanation: "Every 2-number set from **1..4** appears once. **[1,2]** is included, but **[2,1]** is not because order does not create a new combination." },
      { input: "n = 1, k = 1", output: "[[1]]", explanation: "The only available number must be chosen." },
      { input: "n = 5, k = 3", output: "[[1,2,3],[1,2,4],[1,2,5],[1,3,4],[1,3,5],[1,4,5],[2,3,4],[2,3,5],[2,4,5],[3,4,5]]", explanation: "There are **10** ways to choose 3 numbers from 5, and each appears in increasing order." },
    ],
    learningObjectives: [
      "Recognise a choose-without-order prompt as the combination start-index pattern.",
      "Carry a **start** value so recursion never revisits earlier numbers or emits permuted duplicates.",
      "Use remaining-pick pruning to stop branches that cannot reach size **k**.",
      "Explain why the path is copied only when its size reaches **k**.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is the pure combination pattern: choose **k** items from an ordered universe, and the order of the chosen items does not matter. That immediately suggests a **start index**. After choosing number **x**, future choices must come from numbers greater than **x**, so **[1,2]** can be created but **[2,1]** is never considered.\n\nThe state is small: the next number allowed by **start** and the current **path**. The base case is when **path.size() == k**. The key interview insight is that the tree is not a permutation tree; each level only moves forward through the candidate range, which prevents duplicates by construction.",
    commonMistakes: [
      "Restarting the loop from **1** at every depth, which produces permutations such as **[2,1]**.",
      "Adding the same **path** object to the answer instead of adding a copy.",
      "Forgetting to remove the chosen number after the recursive call.",
      "Missing the bound check and exploring branches that do not have enough remaining numbers to fill **k** slots.",
    ],
    algorithmMD:
      "**State**\n\nEach recursion frame stores **start**, the smallest number that may still be chosen, and **path**, the increasing list chosen so far. The remaining picks needed are **k - path.size()**.\n\n**Recursion tree**\n\nFor **n = 4, k = 2**, depth 0 tries **1**, **2**, and **3** as first choices. Under **1**, the next level tries **2**, **3**, and **4**, producing **[1,2]**, **[1,3]**, and **[1,4]**. Under **2**, it tries **3** and **4**, producing **[2,3]** and **[2,4]**. Under **3**, it tries **4**, producing **[3,4]**. Starting with **4** is pruned because there is no second number left.\n\n**Pruning**\n\nBefore choosing a candidate **i**, check whether the range **i..n** has enough numbers to finish the path. If **n - i + 1 < k - path.size()**, then every later **i** has even fewer numbers left, so the loop can stop immediately.\n\n**Algorithm**\n\n1. Start DFS with **start = 1** and an empty **path**.\n2. If **path.size() == k**, copy **path** into the answer and return.\n3. Compute how many more numbers are needed.\n4. Loop **value** from **start** through **n**, stopping when not enough numbers remain.\n5. Choose **value**, recurse with **start = value + 1**, then unchoose **value**.\n6. Return the accumulated combinations.",
    solutions: [
      {
        name: "Start-index DFS with remaining-count pruning",
        approachMD:
          "Use the natural ordering **1..n** to make every combination increasing. The helper receives the next allowed number, so once a value is chosen it cannot appear again and no earlier value can be permuted in front of it.",
        walkthroughMD:
          "1. Create the result list and start DFS at number **1** with an empty path.\n2. When the path length equals **k**, append a copy to the result.\n3. At each frame, compute how many values are still needed.\n4. Iterate candidate values from **start** upward while enough numbers remain to complete the path.\n5. Add the candidate, recurse with **candidate + 1**, then remove it before trying the next candidate.",
        complexity: { time: "O(C(n, k) * k)", space: "O(k)", note: "There are C(n, k) valid leaves and each copied combination has length k. The auxiliary recursion depth is k, excluding the output." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(n, k, 1, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int n, int k, int start, List<Integer> path, List<List<Integer>> result) {
        if (path.size() == k) {
            result.add(new ArrayList<>(path));
            return;
        }

        int remainingNeeded = k - path.size();
        for (int value = start; value <= n; value++) {
            if (n - value + 1 < remainingNeeded) {
                break;
            }
            path.add(value);
            backtrack(n, k, value + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 4, k = 2. Track how **start** forces increasing choices and how the last impossible first choice is pruned.",
      columns: ["depth", "start", "choice", "path and count", "action"],
      rows: [
        ["0", "1", "1", "[1] size 1", "choose 1, recurse with start 2"],
        ["1", "2", "2", "[1,2] size 2", "size is k, add copy"],
        ["1", "2", "3", "[1,3] size 2", "size is k, add copy"],
        ["1", "2", "4", "[1,4] size 2", "size is k, add copy"],
        ["0", "1", "2", "[2] size 1", "choose 2, recurse with start 3"],
        ["1", "3", "3", "[2,3] size 2", "size is k, add copy"],
        ["1", "3", "4", "[2,4] size 2", "size is k, add copy"],
        ["0", "1", "3", "[3] size 1", "choose 3, recurse with start 4"],
        ["1", "4", "4", "[3,4] size 2", "size is k, add copy"],
        ["0", "1", "4", "[] size 0", "prune because only one number remains but two are needed"],
      ],
      narrativeMD: "The DFS emits each increasing pair once. The branch starting with **4** is skipped because it cannot be completed to length **2**.",
    },
    interviewTipsMD:
      "Say early that combinations are not permutations. The **start** index is the proof: every recursive child can only choose numbers to the right of the current choice. Then add the remaining-count bound because it shows you are thinking about the shape of the recursion tree, not just writing a template.",
    followUps: [
      "How would you generate combinations in lexicographic order?",
      "How would you return only the count without listing every combination?",
      "How would the template change if the input numbers contained duplicates?",
      "How would you choose **k** items from an arbitrary array instead of **1..n**?",
    ],
    similarProblems: [
      { title: "Combination Sum", difficulty: "Medium", slug: "bt-combination-sum", note: "Keeps the start-index idea but allows reusing the same candidate." },
      { title: "Combination Sum II", difficulty: "Medium", slug: "bt-combination-sum-ii", note: "Uses start-index recursion with duplicate skipping and one-use candidates." },
      { title: "Subsets", difficulty: "Medium", slug: "bt-subsets", note: "Another order-free search over increasing decisions." },
      { title: "Permutations", difficulty: "Medium", slug: "bt-permutations", note: "Contrasts combinations with the order-matters placement pattern." },
    ],
    keyTakeaways: [
      "A start index is the core tool for choosing without order.",
      "Moving to **value + 1** prevents reuse and prevents permuted duplicates.",
      "Prune when the remaining range cannot fill the remaining slots.",
      "Copy the path only at valid leaves of size **k**.",
    ],
    pattern:
      "For choose-k combinations, keep an increasing path, recurse from the next value, and stop any loop branch that cannot supply enough remaining choices.",
  },
  {
    kind: "problem",
    slug: "bt-combination-sum",
    moduleId: "bt-combination",
    order: 14,
    title: "Combination Sum",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/combination-sum/",
    tags: ["Backtracking", "Recursion", "DFS", "Array", "Pruning", "Combinations"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an array of distinct positive integers **candidates** and a positive integer **target**, return all unique combinations of candidates whose selected numbers sum to **target**. You may choose the same candidate an unlimited number of times. The answer may be returned in any order.",
    constraints: [
      "1 <= candidates.length <= 30",
      "2 <= candidates[i] <= 40",
      "All elements of candidates are distinct",
      "1 <= target <= 40",
    ],
    inputMD: "An integer array **candidates** containing distinct positive values, and an integer **target**.",
    outputMD: "A list of combinations where each combination sums to **target** and may reuse a candidate multiple times.",
    examples: [
      { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]", explanation: "The value **2** can be reused, so **2 + 2 + 3** is valid. **7** alone is also valid." },
      { input: "candidates = [2,3,5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]", explanation: "Each listed combination sums to 8, and order variants such as **[3,2,3]** are not repeated." },
      { input: "candidates = [2], target = 1", output: "[]", explanation: "The only candidate already exceeds the target, so no combination exists." },
    ],
    learningObjectives: [
      "Distinguish unlimited reuse from the no-reuse combination template.",
      "Use the same **start** index after choosing a candidate that may be reused.",
      "Sort candidates so **candidate > remaining** can end the loop early.",
      "Track remaining target instead of recomputing the path sum from scratch.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is still a choose-without-order problem: **[2,2,3]** and **[3,2,2]** represent the same combination. The start-index technique is still the right duplicate-prevention tool. The twist is reuse: after choosing candidate at index **i**, the next recursive call starts at **i** again, not **i + 1**.\n\nBecause every number is positive, the running sum only increases as the path grows. That gives a clean pruning rule: once the remaining target becomes negative, the branch cannot recover. Sorting improves the rule further: when the current candidate is larger than the remaining target, all later candidates are also too large, so the loop can break.",
    commonMistakes: [
      "Recursing with **i + 1** after every choice, which incorrectly forbids using a candidate more than once.",
      "Recursing from **0** after every choice, which creates duplicate orderings of the same combination.",
      "Continuing the loop after a sorted candidate exceeds the remaining target.",
      "Adding a path when the sum is below target just because no more candidates were tried.",
    ],
    algorithmMD:
      "**State**\n\nEach frame carries **start**, the first candidate index allowed in this combination suffix, **remaining**, the amount still needed to reach target, and **path**, the chosen values.\n\n**Recursion tree**\n\nFor sorted **[2,3,6,7]** and target **7**, the root first chooses **2** and stays at index **0**, allowing another **2**. That path reaches **[2,2]** with remaining **3**, then chooses **3** and adds **[2,2,3]**. The branch **[2,2,2]** has remaining **1**, so candidates **2**, **3**, **6**, and **7** are too large and the branch stops. Back at the root, choosing **3** cannot later choose **2**, so order duplicates are avoided. Choosing **7** reaches remaining **0** and adds **[7]**.\n\n**Pruning**\n\nAll values are positive. If **remaining == 0**, the path is complete. If a sorted candidate is greater than **remaining**, break the loop because all later candidates are greater too. Reusing is controlled deliberately by calling the helper with the same index **i**.\n\n**Algorithm**\n\n1. Sort **candidates**.\n2. Start DFS with **start = 0**, **remaining = target**, and an empty **path**.\n3. If **remaining == 0**, copy **path** into the answer.\n4. Loop **i** from **start** to the end of the array.\n5. Break when **candidates[i] > remaining**.\n6. Choose **candidates[i]**, recurse with **start = i** and the reduced remaining target, then unchoose it.",
    solutions: [
      {
        name: "Sorted start-index DFS with reusable candidates",
        approachMD:
          "Sorting lets the DFS stop a branch as soon as a candidate is too large for the remaining target. Passing **i** back into the recursive call is the key reuse rule; passing **i + 1** would solve a different problem.",
        walkthroughMD:
          "1. Sort the candidates in ascending order.\n2. Call the helper with start index **0** and the full target as the remaining sum.\n3. When remaining becomes **0**, copy the current path into the result.\n4. For each candidate from **start** onward, stop if it exceeds the remaining sum.\n5. Add the candidate, recurse from the same index to allow reuse, then remove it before trying the next candidate.",
        complexity: { time: "O(n^(target / minCandidate) * target / minCandidate)", space: "O(target / minCandidate)", note: "The maximum depth is bounded by repeatedly choosing the smallest candidate. The output size dominates for many inputs." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] candidates, int remaining, int start, List<Integer> path, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(path));
            return;
        }

        for (int index = start; index < candidates.length; index++) {
            int candidate = candidates[index];
            if (candidate > remaining) {
                break;
            }
            path.add(candidate);
            backtrack(candidates, remaining - candidate, index, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "candidates = [2,3,6,7], target = 7. The array is already sorted. Track **remaining** as part of the path summary.",
      columns: ["depth", "start", "choice", "path and sum", "action"],
      rows: [
        ["0", "0", "2", "[2], remaining 5", "choose 2 and recurse from same index 0"],
        ["1", "0", "2", "[2,2], remaining 3", "reuse 2 because start stayed at 0"],
        ["2", "0", "2", "[2,2,2], remaining 1", "next candidate 2 is too large, prune"],
        ["2", "0", "3", "[2,2,3], remaining 0", "add combination"],
        ["1", "0", "3", "[2,3], remaining 2", "candidate 3 is now too large at next depth, prune"],
        ["0", "0", "3", "[3], remaining 4", "choose 3, recurse from index 1"],
        ["1", "1", "3", "[3,3], remaining 1", "candidate 3 is too large, prune"],
        ["0", "0", "6", "[6], remaining 1", "next candidate 6 is too large, prune"],
        ["0", "0", "7", "[7], remaining 0", "add combination"],
      ],
      narrativeMD: "The same-index recursive call is why **2** can repeat, while the start index still prevents order duplicates like **[3,2,2]**.",
    },
    interviewTipsMD:
      "Frame the problem as combinations over a sorted candidate list, not permutations. Then explicitly say the recursive start rule: reuse means call with **i**; no reuse means call with **i + 1**. That single sentence often separates correct solutions from near misses.",
    followUps: [
      "What changes if each candidate may be used at most once?",
      "How would you handle duplicate values in **candidates**?",
      "How would you return only the number of combinations instead of listing them?",
      "How would the solution change if negative numbers were allowed?",
    ],
    similarProblems: [
      { title: "Combination Sum II", difficulty: "Medium", slug: "bt-combination-sum-ii", note: "Switches from reusable candidates to one-use candidates with duplicate skipping." },
      { title: "Combination Sum III", difficulty: "Medium", slug: "bt-combination-sum-iii", note: "Uses a fixed number range and an exact pick count." },
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "The base start-index pattern without a target sum." },
      { title: "Combination Sum IV", difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum-iv/", note: "Counts ordered sequences, so it becomes a dynamic programming problem rather than this combination DFS." },
    ],
    keyTakeaways: [
      "Unlimited reuse means recurse from the same candidate index.",
      "The start index still prevents permuted duplicates.",
      "Sorting enables an early break when a candidate exceeds the remaining target.",
      "Track **remaining** directly so the base case is **remaining == 0**.",
    ],
    pattern:
      "For reusable combination sums, sort candidates, recurse from the same index after choosing, and stop a loop branch once the candidate exceeds the remaining target.",
  },
  {
    kind: "problem",
    slug: "bt-combination-sum-ii",
    moduleId: "bt-combination",
    order: 15,
    title: "Combination Sum II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/combination-sum-ii/",
    tags: ["Backtracking", "Recursion", "DFS", "Sorting", "Duplicate Skipping", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 23,
    statementMD:
      "Given an array **candidates** that may contain duplicate positive integers and an integer **target**, return all unique combinations whose selected numbers sum to **target**. Each candidate occurrence may be used at most once. The answer must not contain duplicate combinations.",
    constraints: [
      "1 <= candidates.length <= 100",
      "1 <= candidates[i] <= 50",
      "1 <= target <= 30",
    ],
    inputMD: "An integer array **candidates**, possibly with duplicate values, and an integer **target**.",
    outputMD: "A list of unique combinations where each array position is used at most once and each combination sums to **target**.",
    examples: [
      { input: "candidates = [10,1,2,7,6,1,5], target = 8", output: "[[1,1,6],[1,2,5],[1,7],[2,6]]", explanation: "After sorting, the two **1** values can both be used in **[1,1,6]**, but duplicate branches that start with the second **1** at the same depth are skipped." },
      { input: "candidates = [2,5,2,1,2], target = 5", output: "[[1,2,2],[5]]", explanation: "The three **2** values are separate occurrences, but the combination **[1,2,2]** appears only once." },
      { input: "candidates = [1,1,1], target = 2", output: "[[1,1]]", explanation: "Multiple equal occurrences exist, but there is only one unique value combination that sums to 2." },
    ],
    learningObjectives: [
      "Apply start-index recursion when each occurrence can be used at most once.",
      "Sort the input so equal values become adjacent and can be skipped at the same depth.",
      "Use **i > start && candidates[i] == candidates[i - 1]** to avoid duplicate combinations.",
      "Prune target-sum branches with a sorted early break.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is a combination sum with two added constraints: each array occurrence is one-use, and equal values can create duplicate result rows. The no-reuse part is solved by recursing with **i + 1** after choosing index **i**. The duplicate part is solved by sorting and skipping equal values that would start the same choice at the same recursion depth.\n\nThe skip rule is depth-sensitive. If **i > start** and **candidates[i] == candidates[i - 1]**, choosing this value would create the same subtree already created by the previous equal value at this depth. But when the previous equal value is already in the path from an earlier depth, the current equal value may still be chosen, which is how **[1,1,6]** remains valid.",
    commonMistakes: [
      "Skipping every duplicate value globally, which incorrectly prevents combinations such as **[1,1,6]**.",
      "Using **i** instead of **i + 1** in the recursive call, which allows the same occurrence to be reused.",
      "Applying the duplicate-skip rule before sorting the array.",
      "Continuing after **candidate > remaining** even though the sorted suffix cannot help.",
    ],
    algorithmMD:
      "**State**\n\nEach frame stores **start**, the first unused occurrence index available to this path, **remaining**, and **path**. Because each chosen occurrence advances to **i + 1**, no occurrence can be reused.\n\n**Recursion tree**\n\nFor **candidates = [10,1,2,7,6,1,5]**, sorting gives **[1,1,2,5,6,7,10]**. At the root, the first **1** opens all combinations beginning with **1**, including the child that chooses the second **1** and later **6** to form **[1,1,6]**. When the root loop reaches the second **1**, it is skipped because it would create another root subtree beginning with **1**. Later, branches **[1,2,5]**, **[1,7]**, and **[2,6]** reach target **8**. Values greater than the remaining sum stop their loops.\n\n**Pruning**\n\nSort first. If **i > start** and the current value equals the previous value, skip it to avoid duplicate sibling branches. If **candidates[i] > remaining**, break because every later value is at least as large. If **remaining == 0**, add a copy of the path.\n\n**Algorithm**\n\n1. Sort **candidates**.\n2. Start DFS with **start = 0**, **remaining = target**, and an empty **path**.\n3. If **remaining == 0**, add a copy of **path**.\n4. For each **i** from **start** onward, skip **candidates[i]** when it equals the previous value at the same depth.\n5. Break if **candidates[i] > remaining**.\n6. Choose **candidates[i]**, recurse with **start = i + 1**, then unchoose it.",
    solutions: [
      {
        name: "Sorted one-use DFS with sibling duplicate skip",
        approachMD:
          "Sorting groups equal values together. The helper advances to **i + 1** so each occurrence is used at most once, and the sibling skip removes duplicate subtrees without blocking valid repeated values across different depths.",
        walkthroughMD:
          "1. Sort the candidate array so duplicates are adjacent.\n2. Start DFS with the full target as the remaining sum.\n3. At each depth, iterate from **start** to the end of the array.\n4. Skip a value if it equals the previous value and the previous value was a sibling choice at this same depth.\n5. Stop the loop once the value exceeds the remaining sum.\n6. Choose the value, recurse from **index + 1**, and then remove it.",
        complexity: { time: "O(2^n * n)", space: "O(n)", note: "In the worst case the DFS explores subsets of the n occurrences and copies length-n paths into the output. Sorting costs O(n log n)." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> result = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int[] candidates, int remaining, int start, List<Integer> path, List<List<Integer>> result) {
        if (remaining == 0) {
            result.add(new ArrayList<>(path));
            return;
        }

        for (int index = start; index < candidates.length; index++) {
            if (index > start && candidates[index] == candidates[index - 1]) {
                continue;
            }
            int candidate = candidates[index];
            if (candidate > remaining) {
                break;
            }
            path.add(candidate);
            backtrack(candidates, remaining - candidate, index + 1, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "candidates = [10,1,2,7,6,1,5], target = 8. After sorting, use **[1,1,2,5,6,7,10]**.",
      columns: ["depth", "start", "choice", "path and sum", "action"],
      rows: [
        ["0", "0", "1 at index 0", "[1], remaining 7", "choose first 1"],
        ["1", "1", "1 at index 1", "[1,1], remaining 6", "allowed because it is deeper, not a skipped sibling"],
        ["2", "2", "6 at index 4", "[1,1,6], remaining 0", "add combination"],
        ["1", "1", "2 at index 2", "[1,2], remaining 5", "choose 2 after first 1"],
        ["2", "3", "5 at index 3", "[1,2,5], remaining 0", "add combination"],
        ["1", "1", "7 at index 5", "[1,7], remaining 0", "add combination"],
        ["0", "0", "1 at index 1", "[] remaining 8", "skip duplicate sibling because previous value was also 1"],
        ["0", "0", "2 at index 2", "[2], remaining 6", "choose 2 from root"],
        ["1", "3", "6 at index 4", "[2,6], remaining 0", "add combination"],
        ["0", "0", "10 at index 6", "[] remaining 8", "break because 10 exceeds remaining"],
      ],
      narrativeMD: "The second **1** is skipped only as a root sibling. It is still available after choosing the first **1**, which preserves valid combinations with repeated equal values.",
    },
    interviewTipsMD:
      "The duplicate skip is the centerpiece. Explain it as skipping duplicate siblings, not duplicate values everywhere. Use the phrase **i > start** to show that the previous equal value must be at the same recursion depth. Then contrast with Combination Sum: this problem advances to **i + 1** because each occurrence is one-use.",
    followUps: [
      "What breaks if the array is not sorted first?",
      "How would you modify the solution to return combinations in descending order?",
      "How would you count unique combinations without materialising them?",
      "How does the skip rule differ from the one used in duplicate permutations?",
    ],
    similarProblems: [
      { title: "Combination Sum", difficulty: "Medium", slug: "bt-combination-sum", note: "Allows unlimited reuse and therefore recurses from the same index." },
      { title: "Combination Sum III", difficulty: "Medium", slug: "bt-combination-sum-iii", note: "Has no duplicates but adds an exact count and fixed range." },
      { title: "Subsets II", difficulty: "Medium", slug: "bt-subsets-ii", note: "Uses the same sorted sibling-skip idea without a target sum." },
      { title: "Permutations II", difficulty: "Medium", slug: "bt-permutations-ii", note: "Also handles duplicates, but order matters and the skip uses a used-array condition." },
    ],
    keyTakeaways: [
      "One-use candidates recurse with **i + 1**.",
      "Sort duplicates before trying to skip them.",
      "Skip equal sibling choices with **i > start** to avoid duplicate combinations.",
      "A sorted early break cuts every suffix once the candidate exceeds the remaining target.",
    ],
    pattern:
      "For one-use combination sums with duplicates, sort, recurse to the next index, skip equal sibling values, and break when the candidate is larger than the remaining target.",
  },
  {
    kind: "problem",
    slug: "bt-combination-sum-iii",
    moduleId: "bt-combination",
    order: 16,
    title: "Combination Sum III",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/combination-sum-iii/",
    tags: ["Backtracking", "Recursion", "DFS", "Combinations", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Find all valid combinations of exactly **k** numbers that sum to **n** using only numbers **1** through **9**. Each number may be used at most once, and each valid combination should appear once.",
    constraints: [
      "2 <= k <= 9",
      "1 <= n <= 60",
    ],
    inputMD: "Two integers: **k**, the exact number of values to choose, and **n**, the required sum.",
    outputMD: "A list of combinations where each combination has exactly **k** distinct numbers from **1..9** and sums to **n**.",
    examples: [
      { input: "k = 3, n = 7", output: "[[1,2,4]]", explanation: "The only 3-number combination from **1..9** that sums to 7 is **1 + 2 + 4**." },
      { input: "k = 3, n = 9", output: "[[1,2,6],[1,3,5],[2,3,4]]", explanation: "Each combination uses three distinct numbers and sums to 9." },
      { input: "k = 4, n = 1", output: "[]", explanation: "Even the four smallest distinct numbers, **1 + 2 + 3 + 4**, already exceed 1." },
    ],
    learningObjectives: [
      "Combine the start-index template with both a count constraint and a sum constraint.",
      "Use **1..9** as a fixed ordered candidate range without an input array.",
      "Prune branches using remaining count, minimum possible sum, and maximum possible sum.",
      "Stop candidate loops when the current value exceeds the remaining sum.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is the combination start-index pattern on a fixed universe **1..9**. Order does not matter, and each number can be used at most once, so after choosing **value**, the next recursive call starts at **value + 1**.\n\nThe difference from plain Combinations is that a path must satisfy two goals at the same time: exactly **k** numbers and sum **n**. That makes pruning especially powerful. If the remaining slots cannot be filled from the remaining numbers, or if even the smallest possible fill is too large, or if even the largest possible fill is too small, the branch can stop before exploring children.",
    commonMistakes: [
      "Adding a path when the sum is correct but the path length is not **k**.",
      "Allowing number **10** or reusing a number because the start value was not advanced.",
      "Missing the low-sum and high-sum bounds, which makes the recursion tree noisier than needed.",
      "Stopping only when remaining becomes negative instead of using the exact count constraint as well.",
    ],
    algorithmMD:
      "**State**\n\nEach frame stores **start**, the next number allowed from **1..9**, **remaining**, the sum still needed, and **path**, the numbers chosen so far. The remaining count is **k - path.size()**.\n\n**Recursion tree**\n\nFor **k = 3, n = 9**, the root chooses **1**, then tries second choices **2**, **3**, and higher. Branch **[1,2]** needs **6**, so choosing **6** completes **[1,2,6]**. Branch **[1,3]** needs **5**, so **[1,3,5]** is added. Branch **[1,4]** would need **4**, but future numbers must be greater than 4, so it is pruned. After backtracking, root choice **2** can produce **[2,3,4]**. Larger roots are pruned by the minimum possible sum for the remaining slots.\n\n**Pruning**\n\nIf no slots remain, add the path only when **remaining == 0**. If there are not enough numbers left between **start** and **9**, return. Compute the smallest sum obtainable by taking the next **needed** numbers and the largest sum obtainable by taking the largest **needed** numbers from **1..9**. If **remaining** is outside that range, return. During the loop, break when **value > remaining**.\n\n**Algorithm**\n\n1. Start DFS with **start = 1**, **remaining = n**, and an empty **path**.\n2. Let **needed = k - path.size()**.\n3. If **needed == 0**, add the path only when **remaining == 0**.\n4. Prune if too few numbers remain, if the minimum possible fill exceeds **remaining**, or if the maximum possible fill is below **remaining**.\n5. Loop **value** from **start** through **9**, breaking when **value > remaining**.\n6. Choose **value**, recurse with **value + 1** and **remaining - value**, then unchoose it.",
    solutions: [
      {
        name: "Bounded start-index DFS over 1 through 9",
        approachMD:
          "The fixed range lets us add stronger bounds than the generic combination template. Before branching, compare the remaining target against the smallest and largest sums that can be made with the required number of future picks.",
        walkthroughMD:
          "1. Begin from value **1** with the full target remaining.\n2. At each frame, calculate how many more numbers are needed.\n3. If no numbers are needed, record the path only when the remaining sum is **0**.\n4. Prune when there are too few values left, when the next smallest values already exceed the remaining sum, or when the largest possible values cannot reach it.\n5. Try each value from **start** to **9**, recurse with **value + 1**, and remove the value after returning.",
        complexity: { time: "O(C(9, k) * k)", space: "O(k)", note: "The search considers combinations of the fixed 1..9 range and copies each valid path of length k. With 9 fixed, the practical cost is constant." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<List<Integer>> combinationSum3(int k, int n) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(1, k, n, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(int start, int k, int remaining, List<Integer> path, List<List<Integer>> result) {
        int needed = k - path.size();
        if (needed == 0) {
            if (remaining == 0) {
                result.add(new ArrayList<>(path));
            }
            return;
        }

        if (start + needed - 1 > 9) {
            return;
        }

        int minPossible = 0;
        for (int value = start; value < start + needed; value++) {
            minPossible += value;
        }

        int maxPossible = 0;
        for (int value = 9; value > 9 - needed; value--) {
            maxPossible += value;
        }

        if (remaining < minPossible || remaining > maxPossible) {
            return;
        }

        for (int value = start; value <= 9; value++) {
            if (value > remaining) {
                break;
            }
            path.add(value);
            backtrack(value + 1, k, remaining - value, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "k = 3, n = 9. Track **remaining** and the exact count as the DFS moves forward through **1..9**.",
      columns: ["depth", "start", "choice", "path and sum", "action"],
      rows: [
        ["0", "1", "1", "[1], remaining 8", "choose 1, need two more numbers"],
        ["1", "2", "2", "[1,2], remaining 6", "choose 2"],
        ["2", "3", "6", "[1,2,6], remaining 0", "needed count reached, add combination"],
        ["1", "2", "3", "[1,3], remaining 5", "choose 3"],
        ["2", "4", "5", "[1,3,5], remaining 0", "needed count reached, add combination"],
        ["1", "2", "4", "[1,4], remaining 4", "prune because next number must exceed 4"],
        ["0", "1", "2", "[2], remaining 7", "choose 2 from root"],
        ["1", "3", "3", "[2,3], remaining 4", "choose 3"],
        ["2", "4", "4", "[2,3,4], remaining 0", "needed count reached, add combination"],
        ["0", "1", "4", "[4], remaining 5", "prune because the two smallest following numbers exceed remaining"],
      ],
      narrativeMD: "The valid combinations are found only when both constraints meet at the same leaf: exactly three numbers and remaining sum **0**.",
    },
    interviewTipsMD:
      "Emphasise the double constraint. A sum of **0** is not enough unless the path has exactly **k** numbers, and a path of length **k** is not enough unless the sum is exact. The min and max possible sum bounds are a strong way to demonstrate pruning maturity on a small search space.",
    followUps: [
      "How would the solution change for choosing from **1..m** instead of **1..9**?",
      "How would you return combinations in descending lexicographic order?",
      "How would you count the combinations without storing them?",
      "How would you adapt the bounds if candidates came from an arbitrary sorted array?",
    ],
    similarProblems: [
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "The same start-index skeleton without a target sum." },
      { title: "Combination Sum", difficulty: "Medium", slug: "bt-combination-sum", note: "Uses a target sum but allows candidate reuse." },
      { title: "Combination Sum II", difficulty: "Medium", slug: "bt-combination-sum-ii", note: "Uses one-use candidates from an array, including duplicates." },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "bt-letter-combinations-of-a-phone-number", note: "Another fixed-depth backtracking tree, but choices come from digit mappings." },
    ],
    keyTakeaways: [
      "Exact count and exact sum must both be checked at the leaf.",
      "The range **1..9** uses the same start-index no-reuse rule as combinations.",
      "Minimum and maximum possible sums prune impossible branches early.",
      "Advancing to **value + 1** prevents reuse and keeps combinations increasing.",
    ],
    pattern:
      "For fixed-range count-and-sum combinations, recurse forward with a start value, track remaining count and sum, and prune with feasible minimum and maximum sums before branching.",
  },
];
