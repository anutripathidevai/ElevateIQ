import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "greedy-jump-game",
    moduleId: "greedy-array",
    order: 15,
    title: "Jump Game",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/jump-game/",
    tags: ["Greedy", "Array", "Reachability", "Prefix Maximum"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "You are given an integer array **nums**. You start at index **0**, and **nums[i]** tells you the maximum jump length you may take from index **i**. Return **true** if you can reach the last index, otherwise return **false**.",
    constraints: [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 10^5",
    ],
    inputMD: "An integer array **nums**, where each value is the maximum jump length from that index.",
    outputMD: "A boolean: **true** if the final index is reachable from index **0**, otherwise **false**.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "Jump from index 0 to index 1, then from index 1 to the last index." },
      { input: "nums = [3,2,1,0,4]", output: "false", explanation: "You can reach index 3, but its jump length is 0, so index 4 is unreachable." },
    ],
    learningObjectives: [
      "Recognise reachability problems where only the farthest reachable boundary matters.",
      "Maintain a greedy invariant instead of exploring all possible jumps.",
      "Explain why every index up to the current farthest boundary is safe to scan.",
      "Identify the failure point when the scan index moves beyond reach.",
    ],
    intuitionMD:
      "**Greedy Insight:** track the farthest reachable index seen so far. If you are scanning an index **i** that is at most **farthest**, then there is at least one valid sequence of jumps that gets you to **i**. From there, **i + nums[i]** may extend the reachable frontier.\n\nThe tempting wrong idea is to choose the largest immediate jump at every position. That can skip useful launch points. The greedy state is not the chosen path; it is the best frontier produced by all launch points discovered so far. Once the frontier reaches the last index, the answer is already **true**. If the scan ever passes the frontier, no future index can help because future indices are unreachable.",
    commonMistakes: [
      "Choosing the locally largest jump length instead of tracking the farthest reachable frontier.",
      "Continuing to update reach from an index that is already unreachable.",
      "Using an O(n) DP table when the greedy frontier is the only state needed.",
      "Forgetting that a one-element array is already at the last index.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nKeep one variable, **farthest**, meaning the maximum index reachable using any scanned position. Scan from left to right. For each reachable index, extend **farthest** with **i + nums[i]**.\n\n**Why it works**\n\nAll indices from **0** through **farthest** are reachable by definition of the frontier. Therefore scanning them in order does not miss any valid launch point. An unreachable index cannot contribute to any real path, so the first index greater than **farthest** proves failure.\n\n**Proof of correctness**\n\nMaintain the invariant that before processing index **i**, **farthest** is the farthest index reachable using only launch points before **i**. If **i > farthest**, then no processed launch point reaches **i**, and no unprocessed launch point can be used because reaching it would require first crossing **i**. So returning **false** is correct. Otherwise **i** is reachable, and replacing any particular path choice with the best extension from reachable launch points cannot make the frontier worse. Updating **farthest = max(farthest, i + nums[i])** preserves the invariant. If the invariant ever gives **farthest >= n - 1**, the last index is reachable, so returning **true** is correct.\n\n**Algorithm**\n\n1. Set **farthest = 0**.\n2. For each index **i** from left to right, first check whether **i > farthest**.\n3. If so, return **false** because the scan has reached an unreachable gap.\n4. Otherwise update **farthest** with **max(farthest, i + nums[i])**.\n5. Return **true** once the end is reachable, or after the scan completes.",
    solutions: [
      {
        name: "Farthest reachable frontier",
        approachMD:
          "Track the farthest index reachable from all positions you have already proven reachable. The moment the scan index exceeds that frontier, a gap exists and the end cannot be reached.",
        walkthroughMD:
          "1. Initialise **farthest** to **0** because you start at index 0.\n2. Iterate through the array from left to right.\n3. If the current index is greater than **farthest**, return **false** because no valid jump reaches it.\n4. Otherwise, extend **farthest** using **index + nums[index]**.\n5. Return **true** immediately if **farthest** reaches the final index; otherwise the completed scan also means success.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each index is scanned at most once and only the farthest frontier is stored." },
        filename: "Solution.java",
        code: `class Solution {

    public boolean canJump(int[] nums) {
        int farthest = 0;
        int lastIndex = nums.length - 1;

        for (int index = 0; index < nums.length; index++) {
            if (index > farthest) {
                return false;
            }

            farthest = Math.max(farthest, index + nums[index]);
            if (farthest >= lastIndex) {
                return true;
            }
        }

        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [3,2,1,0,4]. Track the reachable frontier until the scan finds the gap before the last index.",
      columns: ["index", "nums[index]", "farthest before", "reachable check", "farthest after"],
      rows: [
        ["0", "3", "0", "0 <= 0, reachable", "3"],
        ["1", "2", "3", "1 <= 3, reachable", "3"],
        ["2", "1", "3", "2 <= 3, reachable", "3"],
        ["3", "0", "3", "3 <= 3, reachable", "3"],
        ["4", "4", "3", "4 > 3, unreachable", "not processed"],
      ],
      narrativeMD: "The scan reaches index 4 while **farthest** is still 3. Since index 4 is unreachable, the answer is **false**.",
    },
    interviewTipsMD:
      "Say the invariant out loud: every index up to **farthest** is reachable. That one sentence usually convinces the interviewer that you are not guessing. If asked for the actual path, keep parent choices separately; for the boolean question, the path is unnecessary noise.",
    followUps: [
      "How would you return one valid jump path instead of only a boolean?",
      "How would you find the minimum number of jumps once reachability is guaranteed?",
      "What changes if jumps can be negative and move left as well as right?",
      "Can you solve the same reachability question from the end moving backward?",
    ],
    similarProblems: [
      { title: "Jump Game II", difficulty: "Medium", slug: "greedy-jump-game-ii", note: "Uses the same frontier idea but counts how many layers are needed." },
      { title: "Gas Station", difficulty: "Medium", slug: "greedy-gas-station", note: "Another array scan where a frontier or start candidate is reset only when impossible." },
      { title: "Furthest Building You Can Reach", difficulty: "Medium", slug: "greedy-furthest-building", note: "Also asks how far a resource-limited journey can extend." },
      { title: "Minimum Number of Refueling Stops", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/", note: "A harder reachability problem where the frontier grows by choosing the best resource." },
    ],
    keyTakeaways: [
      "Reachability can often be compressed to the farthest reachable boundary.",
      "Never update greedy state from an unreachable index.",
      "The first scan index beyond the frontier is a proof of failure.",
      "A path is not needed when the question only asks whether the end is reachable.",
    ],
    pattern:
      "Frontier reachability greedy: scan reachable positions, expand the farthest boundary, and fail exactly when the scan crosses that boundary.",
  },
  {
    kind: "problem",
    slug: "greedy-jump-game-ii",
    moduleId: "greedy-array",
    order: 16,
    title: "Jump Game II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/jump-game-ii/",
    tags: ["Greedy", "Array", "BFS Layers", "Reachability"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Uber"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "You are given a zero-indexed integer array **nums** of length **n**. You start at index **0**, and **nums[i]** is the maximum jump length from index **i**. Return the minimum number of jumps needed to reach index **n - 1**. The input is guaranteed to be reachable.",
    constraints: [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 1000",
      "It is guaranteed that the last index is reachable",
    ],
    inputMD: "An integer array **nums**, where each value is the maximum jump length from that index.",
    outputMD: "An integer: the minimum number of jumps required to reach the last index.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "2", explanation: "Jump from index 0 to index 1, then from index 1 to the last index." },
      { input: "nums = [2,3,0,1,4]", output: "2", explanation: "The best first jump is still to index 1, which can then jump to the end." },
    ],
    learningObjectives: [
      "View greedy jump counting as BFS-like level expansion over index ranges.",
      "Track the farthest next boundary reachable within the current jump.",
      "Increment the jump count only when the current level has been fully scanned.",
      "Avoid O(n^2) exploration of every edge in the implicit jump graph.",
    ],
    intuitionMD:
      "**Greedy Insight:** treat all indices reachable with the current number of jumps as one BFS-like level. While scanning that level, compute the farthest index any of those positions can reach with one more jump. When the scan reaches the end of the current level, you must spend one jump, and the next level ends at that farthest boundary.\n\nThe tempting wrong idea is to jump immediately to the index with the largest number written on it. The right comparison is not the local value **nums[i]**, but the resulting reach **i + nums[i]** among all positions in the current level. That is exactly what BFS would do if it expanded all edges, but the range representation makes it O(n).",
    commonMistakes: [
      "Incrementing jumps at every index instead of only at the end of the current range.",
      "Choosing the next index by largest **nums[i]** rather than largest **i + nums[i]**.",
      "Looping through the last index and adding an unnecessary extra jump.",
      "Using O(n^2) BFS over every possible jump edge even though ranges can be collapsed.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nMaintain two boundaries: **currentEnd**, the farthest index reachable with the current number of jumps, and **farthest**, the farthest index reachable with one additional jump from any index scanned in the current range. When the scan reaches **currentEnd**, commit one jump and move **currentEnd** to **farthest**.\n\n**Why it works**\n\nAll indices inside the current range are reachable with the same number of jumps. Since one more jump may start from any of them, the best next range is determined by the maximum **i + nums[i]** over the whole current range. Committing earlier would ignore a possible better launch point in the same level.\n\n**Proof of correctness**\n\nConsider the first jump count where an optimal solution chooses a next boundary smaller than the greedy **farthest** after scanning the current level. The greedy boundary is produced by some index reachable with the same number of jumps as every other index in that level. Replacing the optimal next boundary with the greedy boundary uses the same number of jumps and reaches at least as far, so it cannot make any future completion worse. By this exchange, there is an optimal solution whose boundary choices match the greedy choices at every level. Therefore the number of times we close a level is the minimum number of jumps.\n\n**Algorithm**\n\n1. If the array has one element, return **0**.\n2. Set **jumps = 0**, **currentEnd = 0**, and **farthest = 0**.\n3. Scan indices from **0** through **n - 2**.\n4. Update **farthest** with **max(farthest, i + nums[i])**.\n5. When **i == currentEnd**, increment **jumps** and set **currentEnd = farthest**.\n6. Once **currentEnd** reaches the last index, return **jumps**.",
    solutions: [
      {
        name: "BFS-level greedy range expansion",
        approachMD:
          "Collapse the implicit BFS graph into contiguous ranges. The current range contains all indices reachable with the current number of jumps; scanning it computes the next range boundary in one pass.",
        walkthroughMD:
          "1. Start with zero jumps, **currentEnd = 0**, and **farthest = 0**.\n2. Scan every index before the last index, because reaching the last index ends the problem.\n3. For each index, update **farthest** using **index + nums[index]**.\n4. When the scan index reaches **currentEnd**, one BFS level is complete, so increment **jumps** and promote **farthest** to the new **currentEnd**.\n5. Return as soon as **currentEnd** covers the last index.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each index enters exactly one range scan and only two boundaries are stored." },
        filename: "Solution.java",
        code: `class Solution {

    public int jump(int[] nums) {
        if (nums.length <= 1) {
            return 0;
        }

        int jumps = 0;
        int currentEnd = 0;
        int farthest = 0;
        int lastIndex = nums.length - 1;

        for (int index = 0; index < lastIndex; index++) {
            farthest = Math.max(farthest, index + nums[index]);

            if (index == currentEnd) {
                jumps++;
                currentEnd = farthest;
                if (currentEnd >= lastIndex) {
                    return jumps;
                }
            }
        }

        return jumps;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [2,3,1,1,4]. Treat indices reachable with the same jump count as a range.",
      columns: ["index", "nums[index]", "current jump end", "farthest after scan", "action"],
      rows: [
        ["0", "2", "0", "2", "close level, jumps = 1, next end = 2"],
        ["1", "3", "2", "4", "scan inside current level"],
        ["2", "1", "2", "4", "close level, jumps = 2, next end = 4"],
      ],
      narrativeMD: "After closing the second level, **currentEnd** reaches index 4, so the minimum number of jumps is **2**.",
    },
    interviewTipsMD:
      "Describe it as BFS without a queue. The queue would contain many indices, but because reachable indices form a contiguous range, **currentEnd** is enough to know when one jump layer ends. Also mention why the loop stops before the last index: you do not need to jump from the destination.",
    followUps: [
      "How would you return the actual indices chosen by the minimum-jump path?",
      "How would the algorithm change if the last index were not guaranteed reachable?",
      "Can you solve it with an explicit BFS, and why is that less efficient?",
      "What if each jump had a different cost rather than cost 1?",
    ],
    similarProblems: [
      { title: "Jump Game", difficulty: "Medium", slug: "greedy-jump-game", note: "The boolean version tracks only whether the frontier reaches the end." },
      { title: "Furthest Building You Can Reach", difficulty: "Medium", slug: "greedy-furthest-building", note: "Another reachability problem where the farthest progress is driven by a greedy resource choice." },
      { title: "Minimum Number of Refueling Stops", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/", note: "Also expands reach in layers, but chooses fuel with a heap." },
      { title: "Video Stitching", difficulty: "Medium", url: "https://leetcode.com/problems/video-stitching/", note: "Uses the same range-covering greedy pattern as jump levels." },
    ],
    keyTakeaways: [
      "Minimum jumps are BFS layers over contiguous reachable ranges.",
      "Scan the whole current range before committing the next jump.",
      "The best next range is the maximum **i + nums[i]** inside the current range.",
      "Do not count a jump from the last index.",
    ],
    pattern:
      "Range-level greedy BFS: scan the current reachable layer, collect the farthest next boundary, then spend exactly one step to move to that boundary.",
  },
  {
    kind: "problem",
    slug: "greedy-gas-station",
    moduleId: "greedy-array",
    order: 17,
    title: "Gas Station",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/gas-station/",
    tags: ["Greedy", "Array", "Prefix Sum", "Circular Array"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "There are **n** gas stations arranged in a circle. At station **i**, you can add **gas[i]** units of fuel, and it costs **cost[i]** units of fuel to travel from station **i** to station **i + 1**. You start with an empty tank. Return the starting station index if you can travel around the circuit once, otherwise return **-1**. If a valid answer exists, the problem guarantees it is unique.",
    constraints: [
      "gas.length == cost.length",
      "1 <= gas.length <= 10^5",
      "0 <= gas[i], cost[i] <= 10^4",
    ],
    inputMD: "Two integer arrays **gas** and **cost** of equal length, describing fuel gained at each station and fuel needed for the next road segment.",
    outputMD: "An integer: the unique valid starting index, or **-1** if completing the circuit is impossible.",
    examples: [
      { input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", output: "3", explanation: "Starting at index 3 gives tank changes +3, +3, -2, -2, -2 and never drops below zero." },
      { input: "gas = [2,3,4], cost = [3,4,3]", output: "-1", explanation: "Total gas is 9 and total cost is 10, so no start can complete the full circuit." },
    ],
    learningObjectives: [
      "Separate global feasibility from choosing the starting index.",
      "Use a running tank deficit to discard impossible starts in one scan.",
      "Explain why every station inside a failed segment can be skipped.",
      "Handle circular traversal without duplicating the array.",
    ],
    intuitionMD:
      "**Greedy Insight:** if total gas is at least total cost, the problem guarantee means a unique valid start exists. While scanning left to right, keep a running **tank** for the current candidate start. If **tank** becomes negative at station **i**, then the current start cannot reach **i + 1**. Even better, no station between the candidate start and **i** can be valid either, so reset the candidate start to **i + 1**.\n\nThe reason is that every station inside that failed segment was reached with a nonnegative tank from the old candidate. Starting later would remove some earlier fuel that helped you reach it, so it cannot make the failed segment easier. The only possible next candidate is after the failure.",
    commonMistakes: [
      "Trying every start and simulating the whole circle, which is O(n^2).",
      "Resetting the start when the global total is negative instead of when the current tank drops negative.",
      "Returning the candidate start without first checking total feasibility.",
      "Duplicating the circular route even though one linear scan of net gains is enough.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nTrack **totalBalance** over all stations and **tank** from the current candidate start. When **tank** becomes negative at index **i**, discard every start from the current candidate through **i** and set the candidate to **i + 1**.\n\n**Why it works**\n\nA negative **tank** means the candidate start cannot pay for the route through station **i**. Any later station inside the same segment had less prefix fuel available than the original candidate, because the original candidate reached it with a nonnegative tank after collecting all earlier segment gains. Therefore those starts also fail before or at the same boundary.\n\n**Proof of correctness**\n\nWhenever the scan resets after station **i**, suppose an optimal start **s** existed between the old candidate and **i**. The old candidate reached **s** with a nonnegative tank; removing that nonnegative prefix and starting at **s** cannot increase the fuel available for the remaining suffix from **s** through **i**. Since the old candidate has negative tank after **i**, start **s** must also fail by that point. This contradiction proves every skipped start is impossible. The scan therefore never discards a valid start. If **totalBalance < 0**, the entire circuit lacks enough fuel, so no start exists. If **totalBalance >= 0**, the remaining candidate is not discarded and, under the problem guarantee, is the unique valid start.\n\n**Algorithm**\n\n1. Set **start = 0**, **tank = 0**, and **totalBalance = 0**.\n2. For each station, compute **gain = gas[i] - cost[i]**.\n3. Add **gain** to both **tank** and **totalBalance**.\n4. If **tank < 0**, set **start = i + 1** and reset **tank = 0**.\n5. After the scan, return **start** if **totalBalance >= 0**, otherwise return **-1**.",
    solutions: [
      {
        name: "Reset start after each failed segment",
        approachMD:
          "Use one pass to accumulate global feasibility and local candidate feasibility. A negative local tank proves the whole candidate segment is impossible, so the next candidate starts immediately after the failure.",
        walkthroughMD:
          "1. Initialise **start**, **tank**, and **totalBalance** to **0**.\n2. At each station, compute the net fuel change **gas[index] - cost[index]**.\n3. Add that net change to the running candidate tank and to the global total balance.\n4. If the candidate tank becomes negative, move **start** to the next index and reset the tank to **0**.\n5. At the end, return **start** only if the global total balance is nonnegative; otherwise return **-1**.",
        complexity: { time: "O(n)", space: "O(1)", note: "One scan processes every station once and stores only balances plus the candidate start." },
        filename: "Solution.java",
        code: `class Solution {

    public int canCompleteCircuit(int[] gas, int[] cost) {
        int start = 0;
        int tank = 0;
        int totalBalance = 0;

        for (int index = 0; index < gas.length; index++) {
            int gain = gas[index] - cost[index];
            tank += gain;
            totalBalance += gain;

            if (tank < 0) {
                start = index + 1;
                tank = 0;
            }
        }

        if (totalBalance < 0) {
            return -1;
        }

        return start;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]. Track local tank, global total, and the current start candidate.",
      columns: ["index", "gas - cost", "tank before", "tank after reset check", "total balance", "start candidate"],
      rows: [
        ["0", "-2", "0", "0", "-2", "1"],
        ["1", "-2", "0", "0", "-4", "2"],
        ["2", "-2", "0", "0", "-6", "3"],
        ["3", "+3", "0", "3", "-3", "3"],
        ["4", "+3", "3", "6", "0", "3"],
      ],
      narrativeMD: "The global total ends at **0**, so a circuit is feasible. The only candidate not discarded is index **3**, which is returned.",
    },
    interviewTipsMD:
      "Split the explanation into two claims: total gas must cover total cost, and a negative running tank discards an entire segment of starts. That second claim is the greedy proof interviewers care about. Avoid saying the largest gas station is best; the route depends on cumulative net gain, not local gas alone.",
    followUps: [
      "How would you return all valid starts if uniqueness were not guaranteed?",
      "What if the car starts with some initial fuel already in the tank?",
      "How would the answer change if the tank had a maximum capacity?",
      "Can you express the solution using the minimum prefix sum of net gains?",
    ],
    similarProblems: [
      { title: "Jump Game", difficulty: "Medium", slug: "greedy-jump-game", note: "Both discard impossible prefixes while scanning left to right." },
      { title: "Candy", difficulty: "Hard", slug: "greedy-candy", note: "Another array greedy where local constraints must be reconciled globally." },
      { title: "Minimum Number of Refueling Stops", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/", note: "A fuel feasibility problem with extra choices about when to refuel." },
      { title: "Car Pooling", difficulty: "Medium", url: "https://leetcode.com/problems/car-pooling/", note: "Uses cumulative capacity balance over ordered events." },
    ],
    keyTakeaways: [
      "Global total balance decides whether any circuit is possible.",
      "A negative local tank proves the current candidate segment cannot contain the answer.",
      "Resetting after failure is safe because later starts in the failed segment have no extra fuel advantage.",
      "A circular route can often be solved with one linear scan over net changes.",
    ],
    pattern:
      "Candidate reset greedy: scan net balance, discard a whole prefix when the running feasibility measure goes negative, and verify global feasibility at the end.",
  },
  {
    kind: "problem",
    slug: "greedy-candy",
    moduleId: "greedy-array",
    order: 18,
    title: "Candy",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/candy/",
    tags: ["Greedy", "Array", "Two Passes", "Local Constraints"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "There are **n** children standing in a line. Each child has a rating. You must give every child at least one candy, and any child with a higher rating than an immediate neighbor must receive more candies than that neighbor. Return the minimum number of candies needed.",
    constraints: [
      "1 <= ratings.length <= 2 * 10^4",
      "0 <= ratings[i] <= 2 * 10^4",
    ],
    inputMD: "An integer array **ratings**, where **ratings[i]** is the rating of child **i**.",
    outputMD: "An integer: the minimum total candies satisfying both neighbor rules.",
    examples: [
      { input: "ratings = [1,0,2]", output: "5", explanation: "Give candies [2,1,2]. Both children with rating 1 and 2 are higher than the middle child, so both need more candies." },
      { input: "ratings = [1,2,2]", output: "4", explanation: "Give candies [1,2,1]. The last two ratings are equal, so the last child does not need more than the middle child." },
    ],
    learningObjectives: [
      "Break bidirectional neighbor constraints into two one-directional greedy passes.",
      "Use minimum candies from the left rule and then reconcile the right rule with **max**.",
      "Explain why every child can start with one candy without losing optimality.",
      "Distinguish strict greater-than constraints from equal-rating neighbors.",
    ],
    intuitionMD:
      "**Greedy Insight:** give every child one candy, then enforce the left-neighbor rule from left to right. If **ratings[i] > ratings[i - 1]**, child **i** must have one more candy than child **i - 1**. Then enforce the right-neighbor rule from right to left. If **ratings[i] > ratings[i + 1]**, child **i** must have at least one more candy than child **i + 1**, so take the **max** of its current value and that requirement.\n\nThe important detail is **max**. The left pass may already have assigned enough candies to satisfy an increasing run from the left. The right pass should only raise values that are too small; lowering would break constraints already satisfied.",
    commonMistakes: [
      "Using one pass and missing a higher-rated child that must beat its right neighbor.",
      "Overwriting the left-to-right candies during the right pass instead of taking **max**.",
      "Treating equal ratings as if one side must receive more candies.",
      "Trying to sort children by rating, which destroys the original neighbor relationships.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nStart with **1** candy for every child. The left-to-right pass gives each child the minimum amount needed to be greater than a lower-rated left neighbor. The right-to-left pass gives each child the minimum additional amount needed to be greater than a lower-rated right neighbor, using **max** to preserve the left rule.\n\n**Why it works**\n\nEach neighbor constraint is local and directional. The left pass independently satisfies all constraints of the form **ratings[i] > ratings[i - 1]** with the smallest possible candies for those constraints. The right pass independently satisfies all constraints of the form **ratings[i] > ratings[i + 1]** without reducing any already valid assignment.\n\n**Proof of correctness**\n\nAfter the left pass, every rising edge from left to right is satisfied with the minimum value forced by that rising chain. Consider the right pass at index **i**. If **ratings[i] <= ratings[i + 1]**, no right-neighbor constraint forces more candies, so leaving the value unchanged is optimal. If **ratings[i] > ratings[i + 1]**, any valid assignment must give child **i** at least **candies[i + 1] + 1**. Setting **candies[i]** to the maximum of its current value and that forced amount is the smallest value that satisfies both the already processed right constraint and the left-pass constraints. By induction from right to left, all right constraints are satisfied without unnecessary increases. Since every candy increase is forced by at least one neighbor constraint, the final sum is minimal.\n\n**Algorithm**\n\n1. Create a **candies** array of length **n** and fill it with **1**.\n2. Scan left to right from index **1**. If the current rating is greater than the left rating, set current candies to left candies plus **1**.\n3. Scan right to left from index **n - 2**. If the current rating is greater than the right rating, set current candies to **max(current, right candies + 1)**.\n4. Sum the candies array and return the total.",
    solutions: [
      {
        name: "Two directional passes",
        approachMD:
          "Handle one direction at a time. The first pass satisfies all increasing relationships from the left. The second pass satisfies all increasing relationships from the right while preserving the first pass with **max**.",
        walkthroughMD:
          "1. Allocate **candies** and fill it with **1** because every child must receive at least one candy.\n2. Walk left to right. When a child has a higher rating than the left neighbor, assign one more candy than that neighbor.\n3. Walk right to left. When a child has a higher rating than the right neighbor, raise its candy count to at least one more than the right neighbor.\n4. Sum all candy counts to produce the minimum total.",
        complexity: { time: "O(n)", space: "O(n)", note: "Two linear passes plus one summation; the candies array stores the final assignment." },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int candy(int[] ratings) {
        int n = ratings.length;
        int[] candies = new int[n];
        Arrays.fill(candies, 1);

        for (int index = 1; index < n; index++) {
            if (ratings[index] > ratings[index - 1]) {
                candies[index] = candies[index - 1] + 1;
            }
        }

        for (int index = n - 2; index >= 0; index--) {
            if (ratings[index] > ratings[index + 1]) {
                candies[index] = Math.max(candies[index], candies[index + 1] + 1);
            }
        }

        int total = 0;
        for (int count : candies) {
            total += count;
        }

        return total;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "ratings = [1,0,2]. Start every child with one candy, then reconcile the left and right neighbor rules.",
      columns: ["phase", "index", "rating comparison", "candies before", "candies after"],
      rows: [
        ["initial", "all", "minimum one candy each", "[]", "[1,1,1]"],
        ["left to right", "1", "0 > 1 is false", "[1,1,1]", "[1,1,1]"],
        ["left to right", "2", "2 > 0 is true", "[1,1,1]", "[1,1,2]"],
        ["right to left", "1", "0 > 2 is false", "[1,1,2]", "[1,1,2]"],
        ["right to left", "0", "1 > 0 is true", "[1,1,2]", "[2,1,2]"],
      ],
      narrativeMD: "The final candies array is **[2,1,2]**, whose sum is **5**. Both neighbor constraints are satisfied with no extra candies.",
    },
    interviewTipsMD:
      "Lead with the decomposition: one pass cannot see both directions cleanly, so satisfy the left constraint first and the right constraint second. Emphasise strict comparison; equal ratings impose no ordering. If the interviewer asks about O(1) space, discuss slope counting only after the two-pass solution is correct.",
    followUps: [
      "Can you solve Candy in O(1) extra space using increasing and decreasing slope lengths?",
      "How would you return the actual candies array instead of only the total?",
      "What changes if equal ratings must receive equal candies?",
      "How would the problem change if children stood in a circle?",
    ],
    similarProblems: [
      { title: "Gas Station", difficulty: "Medium", slug: "greedy-gas-station", note: "Another array greedy where local imbalance determines global feasibility." },
      { title: "Queue Reconstruction by Height", difficulty: "Medium", slug: "greedy-queue-reconstruction-by-height", note: "Also builds a valid arrangement under local ordering constraints." },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "greedy-non-overlapping-intervals", note: "A different greedy proof where local choices preserve global feasibility." },
      { title: "Trapping Rain Water", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/", note: "Also benefits from left and right directional information over an array." },
    ],
    keyTakeaways: [
      "Bidirectional local constraints can often be split into two directional passes.",
      "Initialising everyone to the minimum valid value keeps the solution minimal.",
      "The second pass must use **max** so it fixes new constraints without breaking old ones.",
      "Equal ratings do not force a candy ordering because the rule is strictly higher rating.",
    ],
    pattern:
      "Two-pass constraint greedy: satisfy all left-facing local constraints, then satisfy all right-facing constraints by only increasing values that need to be higher.",
  },
];
