import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "greedy-course-schedule-iii",
    moduleId: "greedy-heap",
    order: 22,
    title: "Course Schedule III",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/course-schedule-iii/",
    tags: ["Greedy", "Heap", "Priority Queue", "Sorting", "Scheduling"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "You are given an array **courses** where **courses[i] = [duration, lastDay]**. Course **i** takes **duration** days and must be completed on or before **lastDay**. You start on day **0** and can take only one course at a time. Return the maximum number of courses you can finish.",
    constraints: [
      "1 <= courses.length <= 10^4",
      "1 <= duration, lastDay <= 10^4",
    ],
    inputMD: "A 2D integer array **courses**, where each row gives a course duration and its last valid completion day.",
    outputMD: "An integer: the maximum number of courses that can be completed before their deadlines.",
    examples: [
      { input: "courses = [[100,200],[200,1300],[1000,1250],[2000,3200]]", output: "3", explanation: "Take the 100-day, 1000-day, and 200-day courses. The 2000-day course is too costly to keep once it pushes total time past day 3200." },
      { input: "courses = [[1,2]]", output: "1", explanation: "The only course finishes on day 1, which is before its deadline day 2." },
      { input: "courses = [[3,2],[4,3]]", output: "0", explanation: "Each course individually takes longer than its deadline, so no course can be completed." },
    ],
    learningObjectives: [
      "Recognise when a greedy schedule needs the ability to undo a previous choice.",
      "Sort deadline-constrained jobs by deadline and maintain the best feasible prefix.",
      "Use a max-heap to remove the longest selected duration when the schedule becomes infeasible.",
      "Explain the exchange argument behind replacing a long course with a shorter one.",
    ],
    intuitionMD:
      "The greedy insight is to process courses in the order their deadlines become urgent. After considering all courses with deadline up to some day, we want the largest possible set whose total duration fits by that day.\n\nThe difficult part is that taking a course early may later become a bad commitment. A heap fixes that. We tentatively take every course, then if the total time exceeds the current deadline, we remove the longest course taken so far. Removing the longest duration gives back the most time while losing only one course, so it is the safest possible repair.\n\nThis is not the naive rule take the shortest available course or take courses by deadline only. The heap lets the algorithm revise earlier choices while preserving the best count for every deadline prefix.",
    commonMistakes: [
      "Sorting by duration instead of deadline, which ignores when courses expire.",
      "Rejecting only the current course when the schedule overflows, even if an earlier longer course is the real problem.",
      "Using a min-heap for durations, which removes the cheapest course and keeps the schedule unnecessarily long.",
      "Checking feasibility only at the end instead of after each deadline prefix.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nSort courses by **lastDay**. Walk through that order, tentatively add each duration to the schedule, and store selected durations in a max-heap. If the running total exceeds the current course deadline, remove the largest duration from the heap.\n\n**Why it works**\n\nAfter processing courses up to a particular deadline, all selected courses must fit within that deadline. If the total is too large, any feasible solution with the same number of selected courses must drop at least one selected course. Dropping the longest selected course leaves the smallest possible total time among all one-course removals, so it preserves the best chance to keep the same count for later deadlines.\n\n**Proof of correctness**\n\nConsider the courses in sorted deadline order. Maintain the invariant that after each step, the heap contains the maximum number of courses possible from the processed prefix, and among schedules with that count, its total duration is as small as possible. Adding a new course can only increase the count by one. If the total still fits, the invariant remains true. If the total exceeds the current deadline, every feasible schedule from this prefix with the tentative count must remove one selected course. Exchanging out the longest selected duration for any shorter removal cannot increase total time, so removing the longest gives a schedule no worse than any other one-removal repair. The count drops by exactly one, which is unavoidable. Therefore the invariant holds for every prefix, and after the last prefix the heap size is the maximum number of courses.\n\n**Algorithm**\n\n1. Sort **courses** by increasing **lastDay**.\n2. Keep **totalTime** as the sum of selected durations and a max-heap of selected durations.\n3. For each course, add its duration to **totalTime** and the heap.\n4. If **totalTime** exceeds the current deadline, poll the heap and subtract that longest duration.\n5. Return the heap size.",
    solutions: [
      {
        name: "Deadline order with max-heap replacement",
        approachMD:
          "Sort by deadline so every overflow is detected at the earliest point it matters. The max-heap stores the durations we currently plan to take. Whenever the prefix becomes infeasible, remove the longest selected duration because it frees the most time while sacrificing only one course.",
        walkthroughMD:
          "1. Sort the input by **lastDay** in ascending order.\n2. Initialise **totalTime = 0** and an empty max-heap of durations.\n3. For each course, tentatively take it by adding its duration to the heap and to **totalTime**.\n4. If **totalTime** is greater than this course deadline, remove the heap maximum and subtract it from **totalTime**.\n5. The remaining heap entries are the courses in the best feasible schedule, so return the heap size.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting costs O(n log n), and each course is pushed once and popped at most once from the heap." },
        filename: "Solution.java",
        code: `import java.util.Arrays;
import java.util.Collections;
import java.util.PriorityQueue;

class Solution {

    public int scheduleCourse(int[][] courses) {
        Arrays.sort(courses, (a, b) -> Integer.compare(a[1], b[1]));
        PriorityQueue<Integer> selectedDurations = new PriorityQueue<>(Collections.reverseOrder());
        int totalTime = 0;

        for (int[] course : courses) {
            int duration = course[0];
            int deadline = course[1];

            totalTime += duration;
            selectedDurations.offer(duration);

            if (totalTime > deadline) {
                totalTime -= selectedDurations.poll();
            }
        }

        return selectedDurations.size();
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "courses = [[100,200],[200,1300],[1000,1250],[2000,3200]]. After sorting by deadline: [100,200], [1000,1250], [200,1300], [2000,3200].",
      columns: ["course", "deadline", "action", "total time", "max-heap durations", "answer so far"],
      rows: [
        ["[100,200]", "200", "take 100", "100", "[100]", "1"],
        ["[1000,1250]", "1250", "take 1000", "1100", "[1000,100]", "2"],
        ["[200,1300]", "1300", "take 200", "1300", "[1000,200,100]", "3"],
        ["[2000,3200]", "3200", "take 2000, overflow, remove 2000", "1300", "[1000,200,100]", "3"],
      ],
      narrativeMD: "The last course is tentatively added, but keeping it would finish at day **3300**, beyond deadline **3200**. Removing the longest selected duration restores total time to **1300** while keeping **3** courses.",
    },
    interviewTipsMD:
      "Lead with the deadline-prefix invariant. The interviewer wants to hear that once courses are sorted by deadline, every processed prefix has a single feasibility condition: selected total time must fit by the current deadline. The max-heap is the rollback mechanism that removes the worst duration whenever that condition breaks.",
    followUps: [
      "How would the solution change if each course had a profit and you wanted maximum profit instead of maximum count?",
      "What if courses also had release dates before which they could not start?",
      "Can you recover one actual set of scheduled course indices, not just the count?",
      "Why does removing the longest selected course beat removing the newly added course every time?",
    ],
    similarProblems: [
      { title: "Furthest Building You Can Reach", difficulty: "Medium", slug: "greedy-furthest-building", note: "Also uses a heap to revise which expensive choices get premium resources." },
      { title: "IPO", difficulty: "Hard", slug: "greedy-ipo", note: "Uses heaps to choose the best available candidate as constraints evolve." },
      { title: "Maximum Number of Events That Can Be Attended", difficulty: "Medium", slug: "greedy-maximum-events-attended", note: "Another scheduling problem where deadline order drives the greedy choice." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "greedy-task-scheduler", note: "A heap-based scheduling pattern with constraints over time." },
    ],
    keyTakeaways: [
      "Sort by the constraint that expires first: the course deadline.",
      "When a chosen set becomes infeasible, remove the selected item with the worst duration cost.",
      "A max-heap gives greedy algorithms a controlled undo operation.",
      "The invariant is maximum count with minimum total duration for every processed deadline prefix.",
    ],
    pattern:
      "Deadline-prefix greedy with rollback: sort by deadline, tentatively accept candidates, and use a max-heap to discard the most expensive selected item whenever feasibility breaks.",
  },
  {
    kind: "problem",
    slug: "greedy-furthest-building",
    moduleId: "greedy-heap",
    order: 23,
    title: "Furthest Building You Can Reach",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/furthest-building-you-can-reach/",
    tags: ["Greedy", "Heap", "Priority Queue", "Array", "Resource Allocation"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "You are given building heights in an array **heights**, plus **bricks** and **ladders**. Moving from building **i** to **i + 1** costs nothing if the next building is not taller. If it is taller by **climb**, you must cover that climb using either **climb** bricks or one ladder. Return the index of the furthest building you can reach.",
    constraints: [
      "1 <= heights.length <= 10^5",
      "1 <= heights[i] <= 10^6",
      "0 <= bricks <= 10^9",
      "0 <= ladders <= heights.length",
    ],
    inputMD: "An integer array **heights**, an integer **bricks**, and an integer **ladders**.",
    outputMD: "An integer: the largest building index reachable from building **0**.",
    examples: [
      { input: "heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1", output: "4", explanation: "Use bricks for climb 5 and a ladder for climb 3 to reach index 4. The next climb of 5 cannot be paid with the remaining bricks." },
      { input: "heights = [4,12,2,7,3,18,20,3,19], bricks = 10, ladders = 2", output: "7", explanation: "Reserve ladders for the largest climbs seen so far. Bricks cover smaller climbs until the attempt to reach index 8 requires more bricks than remain." },
      { input: "heights = [14,3,19,3], bricks = 17, ladders = 0", output: "3", explanation: "Only positive climbs cost resources. The single climb from 3 to 19 costs 16 bricks, so the end is reachable." },
    ],
    learningObjectives: [
      "Identify why ladders should be saved for the largest climbs, not simply the earliest climbs.",
      "Use a min-heap to downgrade the smallest ladder climb to bricks when too many climbs need ladders.",
      "Stop exactly at the edge where brick usage first becomes negative.",
      "Explain the exchange argument behind assigning premium resources to largest costs.",
    ],
    intuitionMD:
      "The greedy insight is that ladders are more valuable on larger climbs because a ladder pays one climb regardless of height. If you have seen several positive climbs and only **ladders** ladders, the best use of those ladders is on the largest climbs among them.\n\nA min-heap lets us revise earlier assignments. Pretend every positive climb gets a ladder by pushing it into the heap. When the heap contains more climbs than ladders, one climb must be paid with bricks. We choose the smallest climb in the heap for bricks, leaving ladders assigned to the largest climbs seen so far.\n\nThis avoids the common trap of spending ladders as soon as possible. The heap continuously upgrades ladders to the largest climbs and downgrades smaller climbs to bricks.",
    commonMistakes: [
      "Using a ladder on the first positive climb without considering larger climbs later.",
      "Putting every height difference in the heap, including zero or negative moves that cost nothing.",
      "Returning the next building index after bricks go negative instead of the current building index.",
      "Using a max-heap for the ladder set and accidentally paying bricks for the largest climb.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nUse ladders for the largest positive climbs seen so far. Store ladder-assigned climbs in a min-heap. Whenever the heap size exceeds **ladders**, remove the smallest climb and pay for that one with bricks.\n\n**Why it works**\n\nFor any prefix of climbs, suppose we must choose which climbs get ladders. Since each ladder has the same cost no matter the climb size, bricks should cover the smaller climbs and ladders should cover the larger climbs. The min-heap enforces exactly that for every prefix.\n\n**Proof of correctness**\n\nConsider any reachable prefix and any allocation that uses a ladder on a smaller climb **a** while using bricks on a larger climb **b**. Swapping the ladder from **a** to **b** decreases brick usage by **b - a** or leaves it unchanged if **a = b**. The number of ladders used is the same, and reachability cannot get worse. Repeating this exchange transforms an optimal allocation into one where ladders cover the largest climbs in the prefix. Our heap algorithm maintains that allocation after every climb by ejecting the smallest ladder climb to bricks whenever there are too many ladder candidates. Therefore, when bricks first become negative, no other allocation can reach the next building.\n\n**Algorithm**\n\n1. Create a min-heap for positive climbs currently assigned to ladders.\n2. Iterate from building **0** to **n - 2**.\n3. Ignore non-positive climbs.\n4. Push each positive climb into the heap.\n5. If the heap size is greater than **ladders**, poll the smallest climb and subtract it from **bricks**.\n6. If **bricks** becomes negative, return the current building index.\n7. If the loop completes, return **n - 1**.",
    solutions: [
      {
        name: "Min-heap of ladder climbs",
        approachMD:
          "Maintain the set of climbs currently receiving ladders. The heap always contains the largest climbs seen so far because whenever it grows beyond the ladder count, the smallest climb is removed and paid with bricks.",
        walkthroughMD:
          "1. Create an empty min-heap named **ladderClimbs**.\n2. For each edge between adjacent buildings, compute the positive climb.\n3. Push every positive climb into the heap as if it were assigned a ladder.\n4. If the heap now has more entries than ladders, remove the smallest climb and spend that many bricks.\n5. If bricks are negative after that payment, return the current index because the next building cannot be reached.\n6. Otherwise continue and return the last index when all moves succeed.",
        complexity: { time: "O(n log l)", space: "O(l)", note: "The heap stores at most ladders + 1 climbs, so each positive climb costs O(log l), with l representing the number of ladders plus one for overflow." },
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
      columns: ["move", "climb", "heap after push", "brick payment", "bricks left", "furthest confirmed"],
      rows: [
        ["0 -> 1", "0", "[]", "none", "5", "1"],
        ["1 -> 2", "5", "[5]", "none", "5", "2"],
        ["2 -> 3", "0", "[5]", "none", "5", "3"],
        ["3 -> 4", "3", "[3,5]", "pay 3", "2", "4"],
        ["4 -> 5", "5", "[5,5]", "pay 5", "-3", "4"],
      ],
      narrativeMD: "With one ladder, the heap keeps one largest climb for the ladder. At move **4 -> 5**, even paying bricks for the smallest ladder candidate costs **5**, making bricks negative, so index **4** is the furthest reachable building.",
    },
    interviewTipsMD:
      "Phrase the heap as an assignment correction tool: every positive climb is a candidate for a ladder, but only the largest candidates keep ladders. When asked why the smallest heap item becomes bricks, use the premium-resource exchange: if a ladder is on a smaller climb while bricks pay a larger one, swapping them only helps.",
    followUps: [
      "How would you solve it with a max-heap that spends bricks first and refunds the largest climb when a ladder is needed?",
      "How would the answer change if ladders had different maximum heights?",
      "Can you return which climbs used ladders in addition to the furthest index?",
      "What if bricks could be replenished at certain buildings?",
    ],
    similarProblems: [
      { title: "Course Schedule III", difficulty: "Hard", slug: "greedy-course-schedule-iii", note: "Also uses a heap to replace the worst previous commitment." },
      { title: "IPO", difficulty: "Hard", slug: "greedy-ipo", note: "Another heap greedy where the available set changes after each choice." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "greedy-meeting-rooms-ii", note: "Uses a heap to track active resource commitments over a timeline." },
      { title: "Minimum Number of Refueling Stops", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/", note: "A closely related max-heap rollback problem over reachable checkpoints." },
    ],
    keyTakeaways: [
      "Use premium resources on the largest costs in the current prefix.",
      "A min-heap of ladder climbs makes the smallest ladder assignment easy to downgrade to bricks.",
      "When bricks first go negative, no exchange can make that prefix feasible.",
      "Ignoring non-positive climbs is essential because they consume no resources.",
    ],
    pattern:
      "Premium-resource greedy: assign the scarce resource to every candidate, then use a heap to downgrade the least deserving candidate whenever the resource count is exceeded.",
  },
  {
    kind: "problem",
    slug: "greedy-ipo",
    moduleId: "greedy-heap",
    order: 24,
    title: "IPO",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/ipo/",
    tags: ["Greedy", "Heap", "Priority Queue", "Sorting", "Simulation"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 28,
    statementMD:
      "You are given **k**, initial capital **w**, and two arrays **profits** and **capital**. Project **i** requires at least **capital[i]** current capital before it can be started and then adds **profits[i]** to your capital when completed. Choose at most **k** distinct projects to maximize final capital.",
    constraints: [
      "1 <= k <= 10^5",
      "0 <= w <= 10^9",
      "1 <= profits.length <= 10^5",
      "profits.length == capital.length",
      "0 <= profits[i] <= 10^4",
      "0 <= capital[i] <= 10^9",
    ],
    inputMD: "Integers **k** and **w**, plus equal-length arrays **profits** and **capital** describing project rewards and minimum capital requirements.",
    outputMD: "An integer: the maximum capital reachable after choosing at most **k** projects.",
    examples: [
      { input: "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]", output: "4", explanation: "Start with project 0 for profit 1. Capital becomes 1, unlocking projects 1 and 2. Choose profit 3 next for final capital 4." },
      { input: "k = 3, w = 0, profits = [1,2,3], capital = [0,1,2]", output: "6", explanation: "Choose profits 1, then 2, then 3 as each new capital level unlocks the next project." },
      { input: "k = 1, w = 2, profits = [1,2,3], capital = [1,1,2]", output: "5", explanation: "All projects are affordable at capital 2, so take the largest profit 3." },
    ],
    learningObjectives: [
      "Separate projects that are affordable now from projects that may become affordable later.",
      "Use a max-heap to choose the best profit among currently affordable projects.",
      "Use a min-heap by capital requirement to feed the affordable set efficiently.",
      "Prove why taking the highest available profit can only unlock at least as many future options as any smaller profit.",
    ],
    intuitionMD:
      "The greedy insight is that at any moment, projects split into two groups: affordable and locked. You cannot choose from the locked group yet, so the only meaningful decision is which affordable project to do next.\n\nAmong affordable projects, choosing the largest profit is always safe. It gives the maximum possible capital after this step, and having more capital never removes future projects. Two heaps make this online: a min-heap by capital reveals newly affordable projects, and a max-heap by profit selects the best affordable project.\n\nThis is a heap-driven greedy expansion. Unlike Course Schedule III or Furthest Building, the heap is not undoing a previous choice; it is upgrading the current choice as the feasible set grows.",
    commonMistakes: [
      "Sorting by profit once and scanning from the top, which repeatedly skips locked projects inefficiently.",
      "Taking the cheapest capital requirement instead of the highest profit among affordable projects.",
      "Forgetting to stop early when no project is affordable, even if fewer than **k** projects have been selected.",
      "Pushing all projects into the profit heap before checking whether their capital requirements are affordable.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nAlways choose the highest-profit project among projects whose capital requirement is at most current capital. Keep locked projects in a min-heap by capital requirement, and move every newly affordable project into a max-heap of profits before each choice.\n\n**Why it works**\n\nAt a selection step, locked projects are impossible to choose. Among affordable projects, a higher profit produces capital that is at least as large as choosing any lower profit. More capital can only unlock more projects; it never makes an affordable project unavailable.\n\n**Proof of correctness**\n\nTake any optimal sequence of remaining projects at some step, and suppose it chooses an affordable project with profit **p** while another affordable project has profit **q >= p**. Swap the first choice to the project with profit **q**. After this swapped choice, capital is at least as large as in the original sequence, so every project that was affordable later in the original sequence is still affordable at the same or earlier time. The swapped sequence can complete at least the same number of projects and end with at least as much capital. Repeating this exchange makes an optimal sequence choose the maximum affordable profit at every step, exactly what the heap algorithm does.\n\n**Algorithm**\n\n1. Push every project as **[capital, profit]** into a min-heap ordered by **capital**.\n2. Keep a max-heap of profits for projects affordable now.\n3. Repeat up to **k** times.\n4. Move every project whose required capital is at most current capital from the capital heap to the profit heap.\n5. If the profit heap is empty, break because no further project can be started.\n6. Poll the largest profit and add it to current capital.\n7. Return current capital.",
    solutions: [
      {
        name: "Two heaps: capital gate and max-profit choice",
        approachMD:
          "Use one min-heap to hold locked projects ordered by required capital and one max-heap to hold profits of projects that are affordable right now. Each selection first drains the capital heap into the profit heap as far as current capital allows, then takes the maximum affordable profit.",
        walkthroughMD:
          "1. Push each project into **lockedProjects** as **[capital[i], profits[i]]**, ordered by required capital.\n2. Initialise **currentCapital = w** and an empty max-heap **affordableProfits**.\n3. Before each selection, move all projects whose capital requirement is at most **currentCapital** into **affordableProfits**.\n4. If **affordableProfits** is empty, stop early because no project can currently be started.\n5. Poll the largest profit and add it to **currentCapital**.\n6. After at most **k** selections, return **currentCapital**.",
        complexity: { time: "O((n + k) log n)", space: "O(n)", note: "Each project is inserted into the capital heap, moved once to the profit heap, and at most k profits are selected." },
        filename: "Solution.java",
        code: `import java.util.PriorityQueue;

class Solution {

    public int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
        int n = profits.length;
        PriorityQueue<int[]> lockedProjects = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        for (int index = 0; index < n; index++) {
            lockedProjects.offer(new int[] {capital[index], profits[index]});
        }

        PriorityQueue<Integer> affordableProfits = new PriorityQueue<>((a, b) -> Integer.compare(b, a));
        int currentCapital = w;

        for (int chosen = 0; chosen < k; chosen++) {
            while (!lockedProjects.isEmpty() && lockedProjects.peek()[0] <= currentCapital) {
                affordableProfits.offer(lockedProjects.poll()[1]);
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
      inputMD: "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]. The capital min-heap starts with [0,1], [1,2], [1,3].",
      columns: ["selection", "capital before", "capital heap before unlock", "moved to profit heap", "profit max-heap", "capital after"],
      rows: [
        ["1", "0", "[[0,1],[1,2],[1,3]]", "[1]", "[1]", "1"],
        ["2", "1", "[[1,2],[1,3]]", "[2,3]", "[3,2]", "4"],
      ],
      narrativeMD: "Starting with capital **0**, only the profit **1** project is affordable. After taking it, capital becomes **1**, which unlocks the two remaining projects. The max-heap chooses profit **3**, giving final capital **4**.",
    },
    interviewTipsMD:
      "Make the feasibility boundary explicit. The capital min-heap is not choosing projects; it only discovers what has become affordable. The actual greedy choice is from the max-profit heap. This distinction prevents the common mistake of choosing the lowest-capital project when a higher-profit affordable project is available.",
    followUps: [
      "What if project profits could be negative and you may choose fewer than **k** projects?",
      "How would you return the selected project indices in order?",
      "What if each project had a duration and only projects completed before a deadline counted?",
      "How would the algorithm change if capital was consumed when starting a project instead of only required as a threshold?",
    ],
    similarProblems: [
      { title: "Course Schedule III", difficulty: "Hard", slug: "greedy-course-schedule-iii", note: "Another hard heap-greedy problem with feasibility constraints." },
      { title: "Furthest Building You Can Reach", difficulty: "Medium", slug: "greedy-furthest-building", note: "Also maintains a heap while the available resource level changes." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "greedy-task-scheduler", note: "Uses heap priority to repeatedly choose the best currently available task." },
      { title: "Maximum Number of Events That Can Be Attended", difficulty: "Medium", slug: "greedy-maximum-events-attended", note: "Separates availability over time from the greedy choice among available items." },
      { title: "Maximum Performance of a Team", difficulty: "Hard", url: "https://leetcode.com/problems/maximum-performance-of-a-team/", note: "Combines sorting with a heap-maintained candidate set." },
    ],
    keyTakeaways: [
      "Locked choices are irrelevant until capital makes them affordable.",
      "Among affordable projects, maximum profit is a safe greedy choice because more capital never hurts.",
      "A min-heap by capital plus a max-heap by profit separates discovery from selection.",
      "Stop early when the affordable heap is empty; choosing more projects is impossible.",
    ],
    pattern:
      "Expanding-frontier greedy: keep candidates ordered by prerequisite threshold, push newly feasible candidates into a priority queue, and repeatedly choose the best available payoff.",
  },
];
