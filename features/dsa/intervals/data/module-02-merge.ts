import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "iv-merge-intervals",
    moduleId: "intervals-merge",
    order: 5,
    title: "Merge Intervals",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
    tags: ["Intervals", "Sorting", "Greedy", "Array", "Sweep Line"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an array of intervals where **intervals[i] = [starti, endi]**, merge all overlapping intervals and return an array of non-overlapping intervals that covers exactly the same ranges.",
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= starti <= endi <= 10^4",
    ],
    inputMD: "An integer matrix **intervals**, where each row represents a closed interval **[start, end]**.",
    outputMD: "An integer matrix containing the merged, non-overlapping intervals in increasing start order.",
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "**[1,3]** overlaps **[2,6]**, so they become **[1,6]**. The intervals **[8,10]** and **[15,18]** are separate.",
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Because these are closed intervals, **[1,4]** and **[4,5]** touch at **4**, so they overlap and merge.",
      },
    ],
    learningObjectives: [
      "Recognise the canonical sort-by-start merge pattern for interval ranges.",
      "Explain why a single carried interval is enough after sorting by start time.",
      "Apply the overlap rule **nextStart <= carriedEnd** without off-by-one errors.",
      "Convert the carried interval into an output list only when a gap appears.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe trigger words are **merge**, **overlapping intervals**, and **return non-overlapping ranges**. The trap is trying to compare every pair, or comparing each interval only with its original neighbour after previous merges have already extended the range.\n\nSort by **start** so intervals arrive from left to right on the number line. Once sorted, the only active state is the interval you are currently carrying. If the next interval starts before or exactly at the carried end, it overlaps and can only extend the carried end. If it starts after the carried end, no future interval can go back and touch the carried interval, so the carried interval is final.",
    commonMistakes: [
      "Forgetting to sort first, which makes a one-pass merge invalid.",
      "Using **nextStart < carriedEnd** and missing intervals that touch at the same endpoint.",
      "Appending the carried interval too early before all overlapping intervals have extended it.",
      "Comparing the next interval with the last original interval instead of the current merged interval.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort intervals by **start**. Carry one merged interval with a current **start** and **end**. For each next interval, if **nextStart <= currentEnd**, the intervals overlap, so extend **currentEnd** to **max(currentEnd, nextEnd)**. Otherwise a gap exists, so emit the carried interval and start carrying the next one.\n\n**Interval walkthrough**\n\nUse **intervals = [[1,3],[2,6],[8,10],[15,18]]**. On the number line **1--2--3--4--5--6--7--8--9--10--15--18**, carry **[1,3]** first. The next interval **[2,6]** begins at **2**, which is inside the carried interval ending at **3**, so the carried range stretches to **[1,6]**. Then **[8,10]** starts after **6**, creating a gap, so **[1,6]** is final. Carry **[8,10]**. The interval **[15,18]** starts after **10**, so **[8,10]** is final and the last carried interval becomes **[15,18]**.\n\n**Algorithm**\n\n1. Sort **intervals** by increasing start value.\n2. Initialise the carried interval from the first sorted interval.\n3. For each remaining interval, compare its start with the carried end.\n4. If it overlaps, extend the carried end to the larger end value.\n5. If it does not overlap, append the carried interval to the result and carry the new interval.\n6. After the loop, append the final carried interval.\n7. Convert the result list to an **int[][]** and return it.",
    solutions: [
      {
        name: "Sort by start and carry one merged interval",
        whenToUseMD:
          "Use this as the canonical interview solution whenever intervals can be sorted and the task is to coalesce all overlaps.",
        approachMD:
          "Sort intervals by start time, then sweep left to right while carrying one merged interval. Sorting guarantees that if the next interval starts after the carried end, the carried interval can never overlap any later interval.",
        walkthroughMD:
          "1. Return an empty matrix if the input is empty.\n2. Sort intervals by their start value.\n3. Seed **currentStart** and **currentEnd** from the first interval.\n4. For every next interval, merge it into the carried interval when **nextStart <= currentEnd**.\n5. When a gap appears, add the carried interval to the result and reset the carried values.\n6. Add the final carried interval after the scan and return the result matrix.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting dominates the runtime. The result can hold every interval when nothing overlaps." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int[][] merge(int[][] intervals) {
        if (intervals.length == 0) {
            return new int[0][0];
        }

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        List<int[]> merged = new ArrayList<>();
        int currentStart = intervals[0][0];
        int currentEnd = intervals[0][1];

        for (int index = 1; index < intervals.length; index++) {
            int nextStart = intervals[index][0];
            int nextEnd = intervals[index][1];

            if (nextStart <= currentEnd) {
                currentEnd = Math.max(currentEnd, nextEnd);
            } else {
                merged.add(new int[] { currentStart, currentEnd });
                currentStart = nextStart;
                currentEnd = nextEnd;
            }
        }

        merged.add(new int[] { currentStart, currentEnd });
        return merged.toArray(new int[merged.size()][]);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = **[[1,3],[2,6],[8,10],[15,18]]**. The intervals are already sorted by start, so the sweep can begin immediately.",
      columns: ["next interval", "carried before", "overlap test", "action", "result so far"],
      rows: [
        ["[1,3]", "none", "first interval", "carry [1,3]", "[]"],
        ["[2,6]", "[1,3]", "2 <= 3", "extend carry to [1,6]", "[]"],
        ["[8,10]", "[1,6]", "8 > 6", "emit [1,6], carry [8,10]", "[[1,6]]"],
        ["[15,18]", "[8,10]", "15 > 10", "emit [8,10], carry [15,18]", "[[1,6],[8,10]]"],
        ["end", "[15,18]", "no more intervals", "emit final carry", "[[1,6],[8,10],[15,18]]"],
      ],
      narrativeMD: "The carried interval is the only mutable range. It grows from **[1,3]** to **[1,6]**, then gaps cause final intervals to be emitted.",
    },
    complexityNote:
      "The optimal pattern is **O(n log n)** because arbitrary intervals must be sorted before one linear merge pass.",
    interviewTipsMD:
      "State the overlap rule clearly: after sorting by start, **nextStart <= currentEnd** means merge, otherwise emit. Mention that touching endpoints overlap for this problem. Interviewers often test **[[1,4],[4,5]]** to catch the strict-inequality mistake.",
    followUps: [
      "How would the solution change if intervals were half-open, meaning **[start, end)**?",
      "How would you merge intervals as they arrive in a stream without sorting the full history each time?",
      "How would you return the total covered length instead of the merged intervals?",
      "How would you handle intervals with extra payload data that must be preserved during merging?",
    ],
    similarProblems: [
      { title: "Insert Interval", difficulty: "Medium", slug: "iv-insert-interval", note: "Uses the same merge rule, but the input is already sorted and only one new interval is inserted." },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "iv-non-overlapping-intervals", note: "Uses interval overlap reasoning, but chooses removals greedily by earliest end." },
      { title: "Remove Covered Intervals", difficulty: "Medium", slug: "iv-remove-covered-intervals", note: "Also sorts intervals and reasons about whether one range absorbs another." },
      { title: "Interval List Intersections", difficulty: "Medium", slug: "iv-interval-list-intersections", note: "Computes overlaps directly between two already sorted interval lists." },
    ],
    keyTakeaways: [
      "Sorting by start turns pairwise merging into a one-pass sweep.",
      "The carried interval represents all overlaps seen so far in the current connected group.",
      "A gap proves the carried interval is final because all future starts are even larger.",
      "Closed intervals that touch at an endpoint should be merged in this problem.",
    ],
    pattern:
      "Sort by start, carry one merged interval, extend on overlap, and emit only when a gap appears.",
  },
  {
    kind: "problem",
    slug: "iv-insert-interval",
    moduleId: "intervals-merge",
    order: 6,
    title: "Insert Interval",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/insert-interval/",
    tags: ["Intervals", "Array", "Greedy", "Linear Scan", "Sorting"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given a sorted array of non-overlapping intervals and a single **newInterval**. Insert **newInterval** into the array so the result is still sorted by start and contains no overlapping intervals.",
    constraints: [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "newInterval.length == 2",
      "0 <= starti <= endi <= 10^5",
      "intervals is sorted by start and contains no overlaps",
    ],
    inputMD: "An integer matrix **intervals** sorted by start with no overlaps, and an integer array **newInterval = [start, end]**.",
    outputMD: "An integer matrix after inserting and merging **newInterval**, still sorted and non-overlapping.",
    examples: [
      {
        input: "intervals = [[1,3],[6,9]], newInterval = [2,5]",
        output: "[[1,5],[6,9]]",
        explanation: "**newInterval** overlaps **[1,3]**, so they merge into **[1,5]**. The interval **[6,9]** stays after it.",
      },
      {
        input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
        output: "[[1,2],[3,10],[12,16]]",
        explanation: "**[4,8]** overlaps **[3,5]**, **[6,7]**, and **[8,10]**, so the merged interval becomes **[3,10]**.",
      },
    ],
    learningObjectives: [
      "Use the sorted, non-overlapping invariant to avoid re-sorting the input.",
      "Split the scan into before, overlap, and after phases.",
      "Merge the new interval by expanding both start and end boundaries.",
      "Handle endpoint-touching intervals with the correct closed-interval overlap rule.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **insert one interval** into a list that is already **sorted** and **non-overlapping**. The trap is treating this like Merge Intervals and sorting everything again. Sorting works, but it misses the stronger invariant and gives up the clean O(n) pass.\n\nBecause the old intervals are already disjoint and ordered, each interval falls into exactly one phase. It either ends before the new interval starts, overlaps the new interval, or starts after the merged new interval ends. Once you enter the after phase, no later interval can overlap because later starts are even larger.",
    commonMistakes: [
      "Sorting the combined array and losing the intended O(n) use of the input invariant.",
      "Using **intervalEnd <= newStart** as the before condition, which fails when endpoints touch and should merge.",
      "Appending **newInterval** before all overlapping intervals have expanded it.",
      "Forgetting to copy the intervals after the merged interval is emitted.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse one linear scan with three phases. First copy every interval whose end is strictly before **newInterval** starts. Then merge every interval whose start is less than or equal to the current merged end. Finally append the merged interval and copy the remaining intervals.\n\n**Interval walkthrough**\n\nUse **intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]]** and **newInterval = [4,8]**. On the number line **1--2--3--4--5--6--7--8--9--10--12--16**, **[1,2]** ends before **4**, so it is copied unchanged. Carry the new interval **[4,8]**. The interval **[3,5]** overlaps it and pulls the carried start left to **3**, giving **[3,8]**. Then **[6,7]** sits inside the carried interval, so it stays **[3,8]**. Then **[8,10]** touches at **8**, so the carried interval extends to **[3,10]**. The next interval **[12,16]** starts after **10**, so emit **[3,10]** and copy **[12,16]**.\n\n**Algorithm**\n\n1. Create an empty result list and start scanning from index **0**.\n2. Copy intervals while **intervalEnd < newStart** because they are completely before the insertion.\n3. Initialise **mergedStart** and **mergedEnd** from **newInterval**.\n4. While the current interval starts at or before **mergedEnd**, merge it by taking the smaller start and larger end.\n5. Append the merged interval once the overlap phase ends.\n6. Copy all remaining intervals because they start after the merged interval.\n7. Return the result list as an **int[][]**.",
    solutions: [
      {
        name: "Three-phase linear insertion",
        whenToUseMD:
          "Use this when the input guarantee says intervals are already sorted and non-overlapping. It is simpler and faster than sorting the combined list.",
        approachMD:
          "Scan once. Copy intervals that are fully before **newInterval**, merge the consecutive block that overlaps it, then copy the intervals that are fully after it.",
        walkthroughMD:
          "1. Create **result** and an index at the beginning of **intervals**.\n2. Add all intervals with **end < newInterval[0]** to **result**.\n3. Carry **mergedStart** and **mergedEnd** from **newInterval**.\n4. While intervals overlap the carried range, update both carried boundaries.\n5. Add the carried merged interval to **result**.\n6. Add every remaining interval unchanged and return the matrix.",
        complexity: { time: "O(n)", space: "O(n)", note: "Each existing interval is visited once. The output list can contain O(n) intervals." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> result = new ArrayList<>();
        int index = 0;
        int n = intervals.length;

        while (index < n && intervals[index][1] < newInterval[0]) {
            result.add(intervals[index]);
            index++;
        }

        int mergedStart = newInterval[0];
        int mergedEnd = newInterval[1];

        while (index < n && intervals[index][0] <= mergedEnd) {
            mergedStart = Math.min(mergedStart, intervals[index][0]);
            mergedEnd = Math.max(mergedEnd, intervals[index][1]);
            index++;
        }

        result.add(new int[] { mergedStart, mergedEnd });

        while (index < n) {
            result.add(intervals[index]);
            index++;
        }

        return result.toArray(new int[result.size()][]);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = **[[1,2],[3,5],[6,7],[8,10],[12,16]]**, newInterval = **[4,8]**.",
      columns: ["phase", "interval considered", "merged interval before", "action", "result so far"],
      rows: [
        ["before", "[1,2]", "[4,8]", "2 < 4, copy it", "[[1,2]]"],
        ["overlap", "[3,5]", "[4,8]", "merge to [3,8]", "[[1,2]]"],
        ["overlap", "[6,7]", "[3,8]", "stays [3,8]", "[[1,2]]"],
        ["overlap", "[8,10]", "[3,8]", "touches at 8, merge to [3,10]", "[[1,2]]"],
        ["after", "[12,16]", "[3,10]", "12 > 10, emit merged then copy rest", "[[1,2],[3,10],[12,16]]"],
      ],
      narrativeMD: "The old intervals are already ordered, so the overlapping block is contiguous. Once **[12,16]** starts after the carried end **10**, the merge phase is over.",
    },
    complexityNote:
      "The sorted, disjoint input lets this run in **O(n)** time without an additional sort.",
    interviewTipsMD:
      "Call out the three phases before coding: **before**, **overlap**, **after**. This prevents messy conditionals. The before condition is **end < newStart**, not **end <= newStart**, because closed intervals that touch should be merged.",
    followUps: [
      "What if multiple new intervals must be inserted at once?",
      "What if the existing intervals were not sorted or could already overlap?",
      "How would you insert intervals online and answer queries after each insertion?",
      "How would the conditions change for half-open intervals?",
    ],
    similarProblems: [
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "The fallback pattern if the input is not already sorted and disjoint." },
      { title: "Interval List Intersections", difficulty: "Medium", slug: "iv-interval-list-intersections", note: "Also relies on sorted interval lists and moves through them linearly." },
      { title: "My Calendar I", difficulty: "Medium", slug: "iv-my-calendar-i", note: "An online insertion problem where a new interval is accepted only if it does not overlap." },
      { title: "Data Stream as Disjoint Intervals", difficulty: "Hard", slug: "iv-data-stream-disjoint-intervals", note: "Maintains disjoint ranges incrementally as new values arrive." },
    ],
    keyTakeaways: [
      "The sorted, non-overlapping input turns insertion into a single pass.",
      "Intervals before the new interval satisfy **end < newStart**.",
      "The overlap phase is contiguous, so merge all of it before appending the carried interval.",
      "After the merged interval is emitted, every remaining interval can be copied unchanged.",
    ],
    pattern:
      "For one interval insertion into a sorted disjoint list, copy the left side, merge the overlapping block, then copy the right side.",
  },
  {
    kind: "problem",
    slug: "iv-non-overlapping-intervals",
    moduleId: "intervals-merge",
    order: 7,
    title: "Non-overlapping Intervals",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/non-overlapping-intervals/",
    tags: ["Intervals", "Greedy", "Sorting", "Array", "Scheduling"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "Given an array of intervals, return the minimum number of intervals you need to remove so the rest of the intervals are non-overlapping.",
    constraints: [
      "1 <= intervals.length <= 10^5",
      "intervals[i].length == 2",
      "-5 * 10^4 <= starti < endi <= 5 * 10^4",
    ],
    inputMD: "An integer matrix **intervals**, where each row is a closed interval **[start, end]**.",
    outputMD: "An integer: the minimum number of intervals to remove so no remaining intervals overlap.",
    examples: [
      {
        input: "intervals = [[1,2],[2,3],[3,4],[1,3]]",
        output: "1",
        explanation: "Remove **[1,3]**. The remaining intervals **[1,2]**, **[2,3]**, and **[3,4]** only touch at endpoints and do not overlap.",
      },
      {
        input: "intervals = [[1,2],[1,2],[1,2]]",
        output: "2",
        explanation: "Only one copy of **[1,2]** can remain, so two intervals must be removed.",
      },
      {
        input: "intervals = [[1,2],[2,3]]",
        output: "0",
        explanation: "The first interval ends exactly when the second begins, so they are already non-overlapping.",
      },
    ],
    learningObjectives: [
      "Recognise minimum removals as the complement of keeping the maximum number of compatible intervals.",
      "Explain why sorting by end time gives the safest greedy choice.",
      "Use **nextStart < lastEnd** as the overlap test for accepted intervals.",
      "Count removals without physically deleting intervals from the array.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **remove the fewest intervals** so the survivors do not overlap. The trap is merging intervals, which changes the ranges and does not answer how many original intervals must be removed. Another trap is sorting by start and keeping a long interval that blocks many short ones.\n\nThis is an interval scheduling problem in disguise. To minimise removals, maximise how many intervals you keep. The greedy choice is to keep the interval that ends earliest, because it leaves the most room for everything that follows. After sorting by **end**, whenever the next interval overlaps the last kept interval, remove the next interval and keep the earlier-ending one already chosen.",
    commonMistakes: [
      "Merging overlapping intervals instead of counting how many original intervals must be removed.",
      "Sorting by start and keeping a long early interval that blocks better future choices.",
      "Treating **start == lastEnd** as an overlap even though touching endpoints are allowed here.",
      "Updating **lastEnd** after counting a removal, which accidentally keeps the later-ending conflicting interval.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort intervals by increasing **end**. Keep the first interval and remember its end as **lastEnd**. For each next interval, if **start < lastEnd**, it overlaps the last kept interval, so count one removal and keep **lastEnd** unchanged. Otherwise keep the interval and update **lastEnd** to its end.\n\n**Interval walkthrough**\n\nUse **intervals = [[1,2],[2,3],[3,4],[1,3]]**. Sorted by end, the order is **[1,2]**, **[1,3]**, **[2,3]**, **[3,4]**. On the number line **1--2--3--4**, keep **[1,2]** first, so **lastEnd = 2**. The interval **[1,3]** starts at **1**, before **2**, so it overlaps and is removed; keeping **[1,2]** is better because it ends earlier. The interval **[2,3]** starts exactly at **2**, so it can stay and **lastEnd** becomes **3**. The interval **[3,4]** starts at **3**, so it can stay too. Total removals: **1**.\n\n**Algorithm**\n\n1. Return **0** when there are zero or one intervals.\n2. Sort intervals by increasing end value.\n3. Set **lastEnd** to the end of the first sorted interval.\n4. Scan the remaining intervals in sorted order.\n5. If the current start is less than **lastEnd**, increment **removals** and do not update **lastEnd**.\n6. Otherwise keep the current interval and update **lastEnd** to its end.\n7. Return **removals**.",
    solutions: [
      {
        name: "Sort by end and count rejected intervals",
        whenToUseMD:
          "Use this for the canonical greedy proof. It directly maximises the number of intervals kept, which minimises removals.",
        approachMD:
          "Sort by interval end time, then keep intervals only when they start at or after the last kept end. If an interval starts before **lastEnd**, count it as removed because the already kept interval ends no later.",
        walkthroughMD:
          "1. Handle arrays with at most one interval by returning **0**.\n2. Sort all intervals by end time, using start time only as a stable tie-breaker.\n3. Keep the first interval and store its end in **lastEnd**.\n4. For each next interval, count a removal when **start < lastEnd**.\n5. Only update **lastEnd** when the current interval is kept.\n6. Return the total number of removals.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting dominates the runtime. The greedy scan stores only two integers, while Java sorting may allocate temporary storage." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int eraseOverlapIntervals(int[][] intervals) {
        if (intervals.length <= 1) {
            return 0;
        }

        Arrays.sort(intervals, (a, b) -> {
            if (a[1] != b[1]) {
                return Integer.compare(a[1], b[1]);
            }
            return Integer.compare(a[0], b[0]);
        });

        int removals = 0;
        int lastEnd = intervals[0][1];

        for (int index = 1; index < intervals.length; index++) {
            int start = intervals[index][0];
            int end = intervals[index][1];

            if (start < lastEnd) {
                removals++;
            } else {
                lastEnd = end;
            }
        }

        return removals;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = **[[1,2],[2,3],[3,4],[1,3]]**. After sorting by end: **[[1,2],[1,3],[2,3],[3,4]]**.",
      columns: ["interval", "lastEnd before", "overlap test", "decision", "removals"],
      rows: [
        ["[1,2]", "none", "first kept interval", "keep, lastEnd = 2", "0"],
        ["[1,3]", "2", "1 < 2", "remove current, keep earlier end 2", "1"],
        ["[2,3]", "2", "2 >= 2", "keep, lastEnd = 3", "1"],
        ["[3,4]", "3", "3 >= 3", "keep, lastEnd = 4", "1"],
      ],
      narrativeMD: "Sorting by end makes the conflict decision local. When **[1,3]** conflicts with **[1,2]**, the shorter earlier-ending interval is always at least as good for future intervals.",
    },
    complexityNote:
      "The greedy choice is optimal after an **O(n log n)** end-time sort; the scan itself is linear.",
    interviewTipsMD:
      "Phrase the proof as **keep as many as possible**, then removals are **n - kept** or equivalently count rejected intervals. Sorting by end is the key: the earliest finishing compatible interval leaves the most remaining space. Be explicit that **start == lastEnd** is allowed, so the removal test is **start < lastEnd**.",
    followUps: [
      "Can you return the intervals that remain instead of only the removal count?",
      "How would the answer change if touching endpoints were considered overlapping?",
      "How would you solve the weighted version where each interval has a removal cost?",
      "Can you compute the same answer by sorting by start and replacing the current end with the smaller end on conflict?",
    ],
    similarProblems: [
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", slug: "iv-minimum-arrows-burst-balloons", note: "Also sorts by end and greedily keeps the earliest finishing boundary." },
      { title: "Meeting Rooms", difficulty: "Easy", slug: "iv-meeting-rooms", note: "A boolean overlap check that uses similar endpoint rules." },
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "Contrasts merging ranges with selecting a maximum compatible subset." },
      { title: "Remove Covered Intervals", difficulty: "Medium", slug: "iv-remove-covered-intervals", note: "Another interval removal/counting problem where the sort key drives the proof." },
    ],
    keyTakeaways: [
      "Minimum removals equals choosing the maximum number of non-overlapping intervals to keep.",
      "Sorting by end time makes the earliest-finishing interval the safest greedy keeper.",
      "On conflict, count a removal and keep **lastEnd** unchanged.",
      "Endpoint touching is allowed here, so only **start < lastEnd** is an overlap.",
    ],
    pattern:
      "Greedy interval selection: sort by end, keep the earliest-finishing compatible interval, and count every later overlap as a removal.",
  },
];
