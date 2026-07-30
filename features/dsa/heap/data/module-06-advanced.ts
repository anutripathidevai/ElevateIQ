import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "heap-ipo",
    moduleId: "heap-advanced",
    order: 17,
    title: "IPO",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/ipo/",
    tags: ["Heap", "Priority Queue", "Greedy", "Sorting", "Capital Allocation"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 32,
    statementMD:
      "You are given an integer **k**, initial capital **w**, and two arrays **profits** and **capital**. Project **i** can only be started when your current capital is at least **capital[i]**. Once completed, it adds **profits[i]** to your capital. Choose at most **k** distinct projects to maximize your final capital.",
    constraints: [
      "1 <= k <= 10^5",
      "0 <= w <= 10^9",
      "1 <= profits.length <= 10^5",
      "profits.length == capital.length",
      "0 <= profits[i] <= 10^4",
      "0 <= capital[i] <= 10^9",
    ],
    inputMD: "An integer **k**, an integer **w**, and equal-length arrays **profits** and **capital** describing each project's reward and capital threshold.",
    outputMD: "An integer: the maximum capital reachable after selecting at most **k** projects.",
    examples: [
      { input: "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]", output: "4", explanation: "Start with the only affordable project for profit 1. Capital becomes 1, which unlocks the two remaining projects, then choose profit 3 for final capital 4." },
      { input: "k = 3, w = 0, profits = [1,2,3], capital = [0,1,2]", output: "6", explanation: "Choose profit 1, then profit 2, then profit 3 as each new capital level unlocks the next project." },
      { input: "k = 1, w = 2, profits = [1,2,3], capital = [1,1,2]", output: "5", explanation: "All projects are affordable at capital 2, so the best single choice is the project with profit 3." },
    ],
    learningObjectives: [
      "Recognise the expanding-affordable-set pattern where each greedy choice can unlock more candidates.",
      "Sort projects by required capital and use a pointer to reveal all projects affordable at the current capital.",
      "Use a max-heap to choose the highest profit among currently affordable projects.",
      "Explain why taking the maximum affordable profit is safe because more capital never reduces future options.",
    ],
    intuitionMD:
      "Pattern recognition starts with the phrase **currently affordable**. The candidates are not all available at the same time; each completed project increases capital and may unlock more projects. That is the signal for sorting by the unlock threshold and using a heap for the best choice inside the current frontier.\n\nThe greedy invariant is: before each project selection, the max-heap contains exactly the profits of every unchosen project whose capital requirement is at most current capital. Among those projects, choosing the largest profit is always safe because it produces capital at least as high as any smaller choice. Higher capital can only unlock more future projects; it never locks a project again.\n\nThe trap is sorting by profit once and scanning from the top. A high-profit project may be locked now, and repeatedly checking locked projects wastes time. Sorting by capital handles discovery, while the max-heap handles selection.",
    commonMistakes: [
      "Choosing the lowest capital requirement project instead of the highest profit among affordable projects.",
      "Pushing every project into the profit heap before verifying that it is affordable.",
      "Forgetting to stop early when the profit heap is empty before all **k** selections are used.",
      "Sorting by profit only, which mixes locked and affordable projects and loses the efficient frontier.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort projects by required capital. Sweep a pointer through that sorted list and move every newly affordable project into a max-heap of profits. Each of up to **k** rounds first unlocks everything affordable at the current capital, then chooses the largest profit from the heap.\n\nThe informal correctness argument is an exchange argument. At any round, locked projects are impossible to choose. If an optimal plan chooses an affordable project with profit **p** while another affordable project has profit **q >= p**, swapping the first choice to **q** leaves capital at least as large after the round. Every later project that was affordable in the original plan is still affordable, and possibly more are unlocked. Repeating that swap yields an optimal plan that always takes the maximum affordable profit.\n\n**Heap walkthrough**\n\nFor **k = 2**, **w = 0**, **profits = [1,2,3]**, and **capital = [0,1,1]**, the projects sorted by capital are profit 1 at capital 0, profit 2 at capital 1, and profit 3 at capital 1. Start with capital **0** and an empty max-heap. Round 1 unlocks profit **1**, so the heap is **[1]**; polling it raises capital to **1**. Round 2 now unlocks profits **2** and **3**, so the heap becomes **[3,2]**; polling **3** raises capital to **4**. The running capital always follows the best available profit choice.\n\n**Algorithm**\n\n1. Build project pairs **[capital requirement, profit]** and sort them by capital requirement.\n2. Keep a pointer to the first not-yet-unlocked project and a max-heap of affordable profits.\n3. Repeat at most **k** times.\n4. While the pointer project requires capital at most the current capital, push its profit into the max-heap and advance the pointer.\n5. If the max-heap is empty, stop because no project can currently be started.\n6. Poll the maximum profit and add it to current capital.\n7. Return the final capital.",
    solutions: [
      {
        name: "Capital-sorted scan with max-profit heap",
        whenToUseMD:
          "Use this whenever projects have a prerequisite threshold and completing one candidate increases the resource that unlocks future candidates.",
        approachMD:
          "Sort projects by required capital so affordability is discovered in one forward scan. The max-heap stores only profits of projects that are currently affordable and not yet chosen. For each project slot, unlock all affordable projects, take the largest profit, and add it to capital.",
        walkthroughMD:
          "1. Create **projects** as pairs of required capital and profit.\n2. Sort **projects** by required capital in ascending order.\n3. Maintain **nextProject** as the first locked project not yet processed.\n4. Before each choice, move every project with requirement at most **currentCapital** into **affordableProfits**.\n5. If no affordable profit exists, break early.\n6. Poll the maximum profit and add it to **currentCapital**.\n7. Return **currentCapital** after at most **k** selections.",
        complexity: { time: "O((n + k) log n)", space: "O(n)", note: "Sorting costs O(n log n); each project enters the heap once, and at most k projects are polled." },
        filename: "Solution.java",
        code: `import java.util.Arrays;
import java.util.Collections;
import java.util.PriorityQueue;

class Solution {

    public int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
        int n = profits.length;
        int[][] projects = new int[n][2];
        for (int index = 0; index < n; index++) {
            projects[index][0] = capital[index];
            projects[index][1] = profits[index];
        }

        Arrays.sort(projects, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> affordableProfits = new PriorityQueue<>(Collections.reverseOrder());
        int currentCapital = w;
        int nextProject = 0;

        for (int selected = 0; selected < k; selected++) {
            while (nextProject < n && projects[nextProject][0] <= currentCapital) {
                affordableProfits.offer(projects[nextProject][1]);
                nextProject++;
            }

            if (affordableProfits.isEmpty()) {
                break;
            }

            currentCapital += affordableProfits.poll();
        }

        return currentCapital;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]. Projects sorted by capital are [0,1], [1,2], [1,3].",
      columns: ["round", "capital before unlock", "newly affordable profits", "max-heap before pick", "picked profit", "capital after pick"],
      rows: [
        ["1", "0", "[1]", "[1]", "1", "1"],
        ["2", "1", "[2,3]", "[3,2]", "3", "4"],
      ],
      narrativeMD: "After the first project, capital **1** unlocks both remaining projects. The max-heap chooses profit **3**, so the final capital is **4** after two selections.",
    },
    interviewTipsMD:
      "Separate the two responsibilities clearly: sorting by capital discovers what is affordable, while the max-heap chooses the best profit from the affordable set. The proof should mention monotonic capital: choosing more profit now cannot make future feasibility worse.",
    followUps: [
      "How would you return the selected project indices in order?",
      "What changes if profits can be negative and you may choose fewer than **k** projects?",
      "How would the solution change if capital is spent when a project starts instead of only required as a threshold?",
      "Could you solve it with two heaps instead of sorting, and what tradeoff would that have?",
    ],
    similarProblems: [
      { title: "Furthest Building You Can Reach", difficulty: "Medium", slug: "heap-furthest-building", note: "Also uses a heap to make the best choice as resources evolve." },
      { title: "Minimum Cost to Hire K Workers", difficulty: "Hard", slug: "heap-min-cost-hire-k-workers", note: "Another advanced greedy problem where sorting defines the frontier and a heap optimizes inside it." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "heap-task-scheduler", note: "Repeatedly chooses the best currently available task using heap priority." },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "Practices choosing the right heap direction for top candidates." },
      { title: "Maximum Performance of a Team", difficulty: "Hard", url: "https://leetcode.com/problems/maximum-performance-of-a-team/", note: "Combines sorting by a limiting ratio with a heap-maintained candidate set." },
    ],
    keyTakeaways: [
      "Sort by the prerequisite threshold, not by the reward.",
      "The max-heap must contain only currently affordable projects.",
      "Maximum affordable profit is safe because more capital can only help future unlocks.",
      "Stop early when no affordable project exists, even if unused selections remain.",
    ],
    pattern:
      "Expanding-frontier greedy: sort by the unlock threshold, push newly feasible candidates into a priority queue, and repeatedly choose the best payoff among feasible candidates.",
  },
  {
    kind: "problem",
    slug: "heap-furthest-building",
    moduleId: "heap-advanced",
    order: 18,
    title: "Furthest Building You Can Reach",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/furthest-building-you-can-reach/",
    tags: ["Heap", "Priority Queue", "Greedy", "Array", "Resource Allocation"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 26,
    statementMD:
      "You are given an array **heights** representing building heights, plus **bricks** and **ladders**. Moving from building **i** to **i + 1** costs nothing if the next building is not taller. If the next building is taller by **climb**, you must spend **climb** bricks or one ladder. Return the index of the furthest building you can reach.",
    constraints: [
      "1 <= heights.length <= 10^5",
      "1 <= heights[i] <= 10^6",
      "0 <= bricks <= 10^9",
      "0 <= ladders <= heights.length",
    ],
    inputMD: "An integer array **heights**, an integer **bricks**, and an integer **ladders**.",
    outputMD: "An integer: the largest building index reachable from building **0**.",
    examples: [
      { input: "heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1", output: "4", explanation: "Use the ladder on one climb of 5 and bricks on climb 3. The next climb of 5 would make bricks negative, so index 4 is the furthest reachable building." },
      { input: "heights = [4,12,2,7,3,18,20,3,19], bricks = 10, ladders = 2", output: "7", explanation: "Ladders are kept for the largest climbs seen so far, while bricks pay smaller climbs. The attempt to reach index 8 requires more bricks than remain." },
      { input: "heights = [14,3,19,3], bricks = 17, ladders = 0", output: "3", explanation: "Only positive climbs cost resources. The climb from 3 to 19 costs 16 bricks, so the end is reachable." },
    ],
    learningObjectives: [
      "Recognise the premium-resource pattern where ladders should cover the largest costs in every prefix.",
      "Use a min-heap to remember climbs currently assigned to ladders and downgrade the smallest one to bricks when needed.",
      "Explain why assigning ladders to the largest climbs minimizes brick usage.",
      "Return the exact building before the first move that makes bricks negative.",
    ],
    intuitionMD:
      "Pattern recognition starts with two resources: bricks scale with climb height, while a ladder pays any one climb for a flat cost. That means ladders are the premium resource, and the greedy invariant should be that ladders cover the largest positive climbs seen so far.\n\nUse a min-heap to maintain the climbs currently assigned to ladders. Every positive climb is first treated as a ladder candidate and pushed into the heap. If the heap now contains more climbs than available ladders, one of those climbs must be paid with bricks. Paying bricks for the smallest heap climb is best because it leaves ladders on the largest climbs and minimizes brick spending in the prefix.\n\nThe trap is using ladders as soon as possible. Early climbs are not necessarily the biggest. The heap lets the algorithm revise earlier ladder assignments as larger climbs appear later.",
    commonMistakes: [
      "Using a ladder on the first climbs without revisiting whether later climbs are larger.",
      "Adding zero or negative height differences to the heap even though they cost nothing.",
      "Using a max-heap and paying bricks for the largest climb, which is the opposite of the intended exchange.",
      "Returning the next building after bricks go negative instead of the current building index.",
    ],
    algorithmMD:
      "**Key idea**\n\nPretend each positive climb gets a ladder, but keep those ladder candidates in a min-heap. Whenever the number of ladder candidates exceeds **ladders**, convert the smallest ladder candidate to bricks by polling the min-heap. The heap then contains exactly the largest climbs in the processed prefix, so ladders are reserved for the climbs where they save the most bricks.\n\nThe exchange argument is simple: if a ladder is used on a smaller climb **a** while bricks pay a larger climb **b**, swapping the ladder to **b** saves **b - a** bricks and cannot hurt reachability. Repeating this exchange proves that an optimal prefix allocation uses ladders on the largest climbs. Therefore, if bricks become negative after the heap has downgraded the smallest possible ladder climb, no other assignment can reach the next building.\n\n**Heap walkthrough**\n\nFor **heights = [4,2,7,6,9,14,12]**, **bricks = 5**, and **ladders = 1**, ignore the drop from 4 to 2. The climb 5 from 2 to 7 enters the heap, so ladder candidates are **[5]** and bricks stay **5**. The climb 3 from 6 to 9 makes the heap **[3,5]**; there is only one ladder, so poll **3** and spend 3 bricks, leaving heap **[5]** and bricks **2**. The climb 5 from 9 to 14 makes the heap **[5,5]**; poll **5**, bricks become **-3**, and the journey stops at index **4**.\n\n**Algorithm**\n\n1. Create a min-heap of positive climbs currently assigned to ladders.\n2. Walk from building **0** to building **n - 2**.\n3. Compute the climb to the next building and skip it if it is not positive.\n4. Push every positive climb into the heap.\n5. If the heap size exceeds **ladders**, poll the smallest climb and subtract it from **bricks**.\n6. If **bricks** is negative, return the current building index.\n7. If every move succeeds, return **n - 1**.",
    solutions: [
      {
        name: "Min-heap of ladder-assigned climbs",
        whenToUseMD:
          "Use this when a fixed number of free passes should be assigned to the largest costs seen so far, while the remaining smaller costs consume a limited budget.",
        approachMD:
          "The heap stores climbs currently covered by ladders. Each new positive climb becomes a ladder candidate. If there are too many candidates, the smallest one is removed from the heap and paid with bricks, leaving ladders on the largest climbs in the current prefix.",
        walkthroughMD:
          "1. Initialise an empty min-heap **ladderClimbs**.\n2. For each adjacent pair, compute the positive climb needed to move forward.\n3. Ignore non-positive climbs because they cost no resource.\n4. Push a positive climb into **ladderClimbs** as a ladder candidate.\n5. If the heap has more entries than **ladders**, poll the smallest climb and subtract it from **bricks**.\n6. If **bricks** becomes negative, return the current index because the next building is unreachable.\n7. Return the last index if the loop completes.",
        complexity: { time: "O(n log min(n, ladders + 1))", space: "O(min(n, ladders + 1))", note: "The heap stores at most ladders + 1 positive climbs before one is downgraded to bricks." },
        filename: "Solution.java",
        code: `import java.util.PriorityQueue;

class Solution {

    public int furthestBuilding(int[] heights, int bricks, int ladders) {
        PriorityQueue<Integer> ladderClimbs = new PriorityQueue<>();

        for (int index = 0; index < heights.length - 1; index++) {
            int climb = heights[index + 1] - heights[index];
            if (climb <= 0) {
                continue;
            }

            ladderClimbs.offer(climb);
            if (ladderClimbs.size() > ladders) {
                bricks -= ladderClimbs.poll();
                if (bricks < 0) {
                    return index;
                }
            }
        }

        return heights.length - 1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1. The heap stores climbs currently reserved for ladders.",
      columns: ["move", "positive climb", "heap after ladder candidate", "brick payment", "bricks left", "furthest confirmed"],
      rows: [
        ["0 -> 1", "0", "[]", "none", "5", "1"],
        ["1 -> 2", "5", "[5]", "none", "5", "2"],
        ["2 -> 3", "0", "[5]", "none", "5", "3"],
        ["3 -> 4", "3", "[3,5]", "pay 3", "2", "4"],
        ["4 -> 5", "5", "[5,5]", "pay 5", "-3", "4"],
      ],
      narrativeMD: "The heap keeps the largest one climb for the ladder. When the final climb shown forces a brick payment of **5**, bricks drop below zero, so building **4** is the furthest confirmed position.",
    },
    interviewTipsMD:
      "Say the invariant out loud: after each processed climb, the heap contains the largest climbs that receive ladders, and bricks have paid the smaller positive climbs. If challenged, use the exchange between a smaller ladder climb and a larger brick-paid climb to prove why ladders belong on the largest climbs.",
    followUps: [
      "How would you solve the same problem by spending bricks first with a max-heap refund strategy?",
      "How would the solution change if ladders had maximum climb heights?",
      "Can you return which climbs used ladders, not just the furthest index?",
      "What if some buildings give extra bricks when reached?",
    ],
    similarProblems: [
      { title: "IPO", difficulty: "Hard", slug: "heap-ipo", note: "Also maintains a heap while the available resource level changes." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "heap-task-scheduler", note: "Uses a priority queue to assign constrained resources over time." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "heap-meeting-rooms-ii", note: "Another resource-allocation problem driven by a heap over active commitments." },
      { title: "Minimum Cost to Hire K Workers", difficulty: "Hard", slug: "heap-min-cost-hire-k-workers", note: "Also combines a greedy invariant with a heap-maintained candidate set." },
      { title: "Minimum Number of Refueling Stops", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/", note: "A related heap rollback problem over reachable checkpoints." },
    ],
    keyTakeaways: [
      "Ladders should cover the largest climbs because their cost is independent of climb height.",
      "A min-heap makes the smallest ladder assignment easy to downgrade to bricks.",
      "When bricks first go negative after the downgrade, no alternate allocation can reach the next building.",
      "Only positive climbs consume resources.",
    ],
    pattern:
      "Premium-resource greedy: assign every cost to the scarce free resource, then use a min-heap to downgrade the smallest assignments whenever the resource limit is exceeded.",
  },
  {
    kind: "problem",
    slug: "heap-min-cost-hire-k-workers",
    moduleId: "heap-advanced",
    order: 19,
    title: "Minimum Cost to Hire K Workers",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/",
    tags: ["Heap", "Priority Queue", "Greedy", "Sorting", "Math"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Uber"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 36,
    statementMD:
      "You are given arrays **quality** and **wage**, where worker **i** has quality **quality[i]** and must be paid at least **wage[i]**. To hire exactly **k** workers, every hired worker must be paid in proportion to quality using the same rate, and each worker must receive at least their minimum wage. Return the minimum total cost to hire exactly **k** workers.",
    constraints: [
      "1 <= k <= quality.length <= 10^4",
      "quality.length == wage.length",
      "1 <= quality[i], wage[i] <= 10^4",
      "Answers within 10^-5 of the actual answer are accepted",
    ],
    inputMD: "Integer arrays **quality** and **wage**, plus an integer **k** for the exact number of workers to hire.",
    outputMD: "A floating-point number: the minimum possible total wage cost for a valid group of exactly **k** workers.",
    examples: [
      { input: "quality = [10,20,5], wage = [70,50,30], k = 2", output: "105.00000", explanation: "Hire workers with qualities 10 and 5 at rate 7. They are paid 70 and 35, satisfying both minimum wages for total cost 105." },
      { input: "quality = [3,1,10,10,1], wage = [4,8,2,2,7], k = 3", output: "30.66667", explanation: "The best group uses a shared wage-to-quality rate of 23 / 3, producing the minimum valid total for three selected qualities." },
    ],
    learningObjectives: [
      "Derive the wage-to-quality ratio insight that turns a group into one limiting worker and a quality sum.",
      "Sort workers by ratio so the current worker can be treated as the highest required rate in the group.",
      "Maintain the k smallest qualities among eligible workers with a max-heap.",
      "Explain why popping the largest quality minimizes cost under a fixed current ratio.",
    ],
    intuitionMD:
      "Pattern recognition starts when every selected worker must share the same pay rate per quality. For any chosen group, the rate must be at least the largest **wage / quality** ratio among its workers. Once that rate is fixed, total cost is simply **rate * sum of selected qualities**.\n\nSort workers by ratio in ascending order. When the sweep is at a worker with ratio **r**, all previously seen workers have ratio at most **r**, so any group formed from them and the current worker can legally be paid at rate **r**. Under that fixed rate, minimizing cost means minimizing the sum of qualities.\n\nThe greedy invariant is: after processing a ratio prefix, the heap and running sum represent the **k** smallest qualities among workers seen so far whenever at least **k** workers are available. A max-heap is used because if more than **k** qualities are present, the largest quality is the one to discard. That keeps the sum as small as possible for the current and future ratio checks.",
    commonMistakes: [
      "Sorting by wage alone or quality alone instead of by the wage-to-quality ratio.",
      "Using a min-heap of qualities, which removes the cheapest worker and leaves a larger quality sum.",
      "Computing a candidate cost before the heap contains exactly **k** workers.",
      "Forgetting that the current ratio is a double value and should not be truncated with integer division.",
    ],
    algorithmMD:
      "**Key idea**\n\nFor a selected group, the worker with the highest **wage / quality** ratio determines the minimum shared pay rate. Sort workers by this ratio. As each worker becomes the current highest-ratio worker, choose the **k** smallest qualities among all workers seen so far and evaluate **current ratio * quality sum**.\n\nThe exchange argument is about the quality sum under a fixed rate. If a candidate group of **k** workers under the current ratio includes a larger quality **a** while an eligible smaller quality **b** is excluded, swapping **a** out for **b** keeps every worker eligible under the same ratio and reduces or preserves total cost. Therefore, the best group for the current ratio is exactly the **k** smallest qualities among the ratio prefix. The max-heap enforces that by ejecting the largest quality whenever the heap grows beyond **k**.\n\n**Heap walkthrough**\n\nFor **quality = [10,20,5]**, **wage = [70,50,30]**, and **k = 2**, the ratios in ascending order are quality 20 at ratio **2.5**, quality 5 at ratio **6.0**, and quality 10 at ratio **7.0**. Add quality **20** first; the max-heap is **[20]** and the quality sum is **20**, so no cost is valid yet. Add quality **5**; the heap is **[20,5]**, the sum is **25**, and the candidate cost is **6.0 * 25 = 150**. Add quality **10**; the heap is **[20,5,10]**, sum is **35**, then pop the largest quality **20**, leaving **[10,5]** and sum **15**. At ratio **7.0**, the candidate cost is **7.0 * 15 = 105**, which is the best.\n\n**Algorithm**\n\n1. Pair every worker's quality with wage and sort workers by **wage / quality** in ascending order using double comparison.\n2. Maintain a max-heap of selected qualities and a running **qualitySum**.\n3. Sweep workers in ratio order.\n4. Add the current quality to the heap and to **qualitySum**.\n5. If the heap size exceeds **k**, poll the largest quality and subtract it from **qualitySum**.\n6. If the heap size is exactly **k**, compute **current ratio * qualitySum** and minimize the answer.\n7. Return the best cost.",
    solutions: [
      {
        name: "Ratio sweep with max-heap of qualities",
        whenToUseMD:
          "Use this when a group cost is controlled by a maximum ratio or threshold, and the remaining objective under that threshold is to minimize a size-k sum.",
        approachMD:
          "Sort workers by their minimum acceptable wage-to-quality ratio. During the sweep, the current worker supplies the highest ratio for any group ending at that point. A max-heap keeps the selected qualities as small as possible by removing the largest quality whenever more than **k** candidates are present.",
        walkthroughMD:
          "1. Store each worker as **[quality, wage]**.\n2. Sort workers by **wage / quality** using double comparison.\n3. Keep **largestQualities** as a max-heap and **qualitySum** as the sum of heap entries.\n4. For each worker in ratio order, add their quality to both the heap and the sum.\n5. If the heap size exceeds **k**, remove the largest quality and subtract it from the sum.\n6. When the heap size is exactly **k**, compute the current ratio times **qualitySum** and update the answer.\n7. Return the minimum candidate cost found.",
        complexity: { time: "O(n log n)", space: "O(k)", note: "Sorting costs O(n log n), and the heap stores at most k + 1 qualities during the sweep." },
        filename: "Solution.java",
        code: `import java.util.Arrays;
import java.util.Collections;
import java.util.PriorityQueue;

class Solution {

    public double mincostToHireWorkers(int[] quality, int[] wage, int k) {
        int n = quality.length;
        int[][] workers = new int[n][2];
        for (int index = 0; index < n; index++) {
            workers[index][0] = quality[index];
            workers[index][1] = wage[index];
        }

        Arrays.sort(workers, (a, b) -> Double.compare((double) a[1] / a[0], (double) b[1] / b[0]));
        PriorityQueue<Integer> largestQualities = new PriorityQueue<>(Collections.reverseOrder());
        long qualitySum = 0;
        double bestCost = Double.MAX_VALUE;

        for (int[] worker : workers) {
            int workerQuality = worker[0];
            int workerWage = worker[1];

            largestQualities.offer(workerQuality);
            qualitySum += workerQuality;

            if (largestQualities.size() > k) {
                qualitySum -= largestQualities.poll();
            }

            if (largestQualities.size() == k) {
                double ratio = (double) workerWage / workerQuality;
                bestCost = Math.min(bestCost, ratio * qualitySum);
            }
        }

        return bestCost;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "quality = [10,20,5], wage = [70,50,30], k = 2. Workers sorted by ratio are [quality 20, ratio 2.5], [quality 5, ratio 6.0], [quality 10, ratio 7.0].",
      columns: ["worker by ratio", "ratio", "action on max-heap qualities", "quality sum", "candidate cost", "best cost"],
      rows: [
        ["quality 20, wage 50", "2.5", "push 20 -> [20]", "20", "not enough workers", "none"],
        ["quality 5, wage 30", "6.0", "push 5 -> [20,5]", "25", "150", "150"],
        ["quality 10, wage 70", "7.0", "push 10 -> [20,5,10], pop 20 -> [10,5]", "15", "105", "105"],
      ],
      narrativeMD: "At ratio **7.0**, the heap has the two smallest qualities among all eligible workers: **10** and **5**. Their quality sum is **15**, so the best cost is **105**.",
    },
    interviewTipsMD:
      "Lead with the ratio insight before mentioning the heap. The interviewer needs to hear that any hired group is paid at a shared rate, and the largest wage-to-quality ratio in the group determines that rate. After sorting by ratio, the max-heap has one job: keep the **k** smallest qualities so the cost under the current rate is minimized.",
    followUps: [
      "How would you recover the actual worker indices for the minimum-cost group?",
      "What changes if workers can be paid different rates instead of one shared rate?",
      "How would you handle a streaming version where workers arrive already sorted by ratio?",
      "Can you explain why the heap is a max-heap even though the goal is minimum cost?",
    ],
    similarProblems: [
      { title: "IPO", difficulty: "Hard", slug: "heap-ipo", note: "Also sorts by a feasibility frontier and uses a heap to optimize the active candidate set." },
      { title: "Furthest Building You Can Reach", difficulty: "Medium", slug: "heap-furthest-building", note: "Another exchange-argument heap greedy over scarce resources." },
      { title: "K Closest Points to Origin", difficulty: "Medium", slug: "heap-k-closest-points", note: "Uses a size-k heap and removes the worst candidate when the heap grows too large." },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "Reinforces why a bounded heap often stores the opposite priority from the final goal." },
      { title: "Maximum Performance of a Team", difficulty: "Hard", url: "https://leetcode.com/problems/maximum-performance-of-a-team/", note: "Very similar ratio-sweep structure with a heap-maintained sum." },
    ],
    keyTakeaways: [
      "For any hired group, the largest wage-to-quality ratio determines the shared pay rate.",
      "After sorting by ratio, the current worker can be treated as the limiting highest-ratio worker.",
      "Under a fixed ratio, minimizing total cost means minimizing the sum of selected qualities.",
      "A max-heap of qualities removes the largest quality so the heap keeps the **k** smallest eligible qualities.",
    ],
    pattern:
      "Ratio-frontier greedy: sort by the limiting ratio, maintain a size-k heap that optimizes the additive quantity under the current ratio, and evaluate the objective at every valid prefix.",
  },
];
