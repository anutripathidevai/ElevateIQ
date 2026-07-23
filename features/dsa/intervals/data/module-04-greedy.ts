import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "iv-minimum-arrows-burst-balloons",
    moduleId: "intervals-greedy",
    order: 11,
    title: "Minimum Number of Arrows to Burst Balloons",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
    tags: ["Intervals", "Sorting", "Greedy", "Sweep Line"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "You are given an array **points** where **points[i] = [xstart, xend]** represents the horizontal diameter of one balloon. An arrow shot vertically at coordinate **x** bursts every balloon whose interval contains **x**. Return the minimum number of arrows needed to burst all balloons.",
    constraints: [
      "1 <= points.length <= 10^5",
      "points[i].length == 2",
      "-2^31 <= xstart < xend <= 2^31 - 1",
    ],
    inputMD: "An integer matrix **points**, where each row is the inclusive horizontal range **[xstart, xend]** covered by one balloon.",
    outputMD: "An integer: the minimum number of vertical arrows required to burst every balloon.",
    examples: [
      {
        input: "points = [[10,16],[2,8],[1,6],[7,12]]",
        output: "2",
        explanation: "Shoot one arrow at **x = 6** to burst **[1,6]** and **[2,8]**, then one arrow at **x = 12** to burst **[7,12]** and **[10,16]**.",
      },
      {
        input: "points = [[1,2],[3,4],[5,6],[7,8]]",
        output: "4",
        explanation: "No two balloons overlap, so each balloon needs its own arrow.",
      },
      {
        input: "points = [[1,2],[2,3],[3,4],[4,5]]",
        output: "2",
        explanation: "The intervals touch at endpoints. One arrow at **x = 2** bursts the first two balloons, and one arrow at **x = 4** bursts the last two.",
      },
    ],
    learningObjectives: [
      "Recognise balloon bursting as choosing points that stab intervals.",
      "Sort intervals by end coordinate to make the safest earliest arrow choice.",
      "Prove why shooting at the first ending balloon does not lose optimality.",
      "Use overflow-safe comparators when endpoints can be near integer limits.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **minimum arrows**, **burst all balloons**, and each balloon is an interval on the x-axis. This is not a merge problem; we do not need the union of ranges. We need the fewest points such that every interval contains at least one chosen point. That is the interval stabbing pattern.\n\nThe trap is sorting by start and committing too early. The interval that ends first creates the tightest deadline: if we do not shoot by its end, it can never be burst later. So we sort by end, shoot at that end, and let the same arrow cover every later balloon whose start is still at or before that coordinate.\n\n**Why greedy works / proof sketch**\n\nLook at the remaining balloon with the smallest end **r**. Any valid solution must place some arrow inside it, at a coordinate **x <= r**. If that arrow also bursts another remaining balloon, that other balloon has start **<= x <= r** and end **>= r** because **r** is the smallest end among remaining intervals. Therefore moving the arrow to exactly **r** still bursts every balloon the old arrow burst. There is an optimal solution whose first arrow is at **r**, so the greedy choice is safe. After removing all balloons hit by that arrow, the same argument applies to the suffix.",
    commonMistakes: [
      "Sorting by start time and shooting at the first start, which can choose an arrow too far left.",
      "Using subtractive comparator arithmetic and overflowing on extreme endpoints.",
      "Starting a new arrow when **start == arrowX**, even though endpoints are inclusive.",
      "Updating the arrow position while processing an overlapping balloon; the arrow should stay at the earliest end already chosen.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort balloons by their right endpoint. The first balloon in that order must be hit no later than its end, so shoot an arrow exactly there. Every following balloon with **start <= arrowX** is also burst by that arrow. The first balloon with **start > arrowX** cannot be hit by the current arrow, so it starts a new group and we shoot at its end. Use **Integer.compare(a[1], b[1])** for the sort because coordinates can be near **Integer.MAX_VALUE** or **Integer.MIN_VALUE**.\n\n**Interval walkthrough**\n\nUse **points = [[10,16],[2,8],[1,6],[7,12]]**. Sorted by end, the number line order is **[1,6]**, **[2,8]**, **[7,12]**, **[10,16]**. Draw the first two as overlapping over coordinate **6**: **1 ---- 6 ---- 8**. Shoot at **6**, so both **[1,6]** and **[2,8]** disappear. The next start is **7**, which is to the right of **6**, so draw the next cluster **7 ---- 12 ---- 16**. Shoot at **12**, and both **[7,12]** and **[10,16]** are hit. Two clusters mean two arrows.\n\n**Algorithm**\n\n1. Sort **points** by end coordinate ascending with **Integer.compare**.\n2. Initialise **arrows = 1** and **arrowX** to the end of the first sorted balloon.\n3. Scan the remaining balloons in sorted order.\n4. If **points[i][0] <= arrowX**, the current arrow bursts this balloon, so skip it.\n5. If **points[i][0] > arrowX**, shoot a new arrow at **points[i][1]** and increment **arrows**.\n6. Return **arrows** after the scan.",
    solutions: [
      {
        name: "Sort by end and shoot greedily",
        whenToUseMD:
          "Use this canonical solution whenever the problem asks for the fewest points, arrows, or markers needed to cover intervals.",
        approachMD:
          "Sort by each balloon end coordinate. The first ending balloon forces the next arrow position, and placing the arrow at that end keeps it as far right as possible while still hitting the forced balloon.",
        walkthroughMD:
          "1. Sort **points** by **end** ascending using **Integer.compare**.\n2. Place the first arrow at the first sorted balloon end.\n3. For each next balloon, compare its start with the current arrow coordinate.\n4. If the start is less than or equal to the arrow coordinate, the balloon is already burst.\n5. Otherwise, count a new arrow and place it at this balloon end.\n6. Return the number of arrows placed.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting dominates the scan. Java sorts object arrays with temporary storage; the greedy scan itself is O(1) extra space." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int findMinArrowShots(int[][] points) {
        Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));

        int arrows = 1;
        int arrowX = points[0][1];

        for (int index = 1; index < points.length; index++) {
            if (points[index][0] > arrowX) {
                arrows++;
                arrowX = points[index][1];
            }
        }

        return arrows;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "points = **[[10,16],[2,8],[1,6],[7,12]]**. After sorting by end: **[[1,6],[2,8],[7,12],[10,16]]**.",
      columns: ["sorted balloon", "arrow before", "test", "action", "arrows"],
      rows: [
        ["[1,6]", "none", "first balloon", "shoot at 6", "1"],
        ["[2,8]", "6", "2 <= 6", "same arrow bursts it", "1"],
        ["[7,12]", "6", "7 > 6", "shoot new arrow at 12", "2"],
        ["[10,16]", "12", "10 <= 12", "same arrow bursts it", "2"],
      ],
      narrativeMD: "Every skipped balloon contains the current arrow coordinate. The scan creates exactly two non-overlapping arrow groups, so the answer is **2**.",
    },
    interviewTipsMD:
      "State the greedy invariant clearly: **arrowX** is the end of the earliest-ending unburst balloon, and all skipped balloons contain that coordinate. Mention endpoint inclusivity, because **start == arrowX** is still a burst. Also call out the comparator: use **Integer.compare(a[1], b[1])**, never subtraction, because the problem allows extreme integer coordinates.",
    followUps: [
      "How would you return the actual arrow coordinates instead of only the count?",
      "What changes if balloon endpoints are open intervals instead of inclusive intervals?",
      "How would you solve it if balloons arrived as a stream and you could not sort first?",
      "How would the strategy change if each arrow had a width instead of being a single coordinate?",
    ],
    similarProblems: [
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "iv-non-overlapping-intervals", note: "Also sorts by end to make the interval that leaves the most room the keeper." },
      { title: "Remove Covered Intervals", difficulty: "Medium", slug: "iv-remove-covered-intervals", note: "Another greedy sweep where the sort key decides what can be safely discarded." },
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "Uses overlap checks after sorting, but merges ranges instead of stabbing them with points." },
      { title: "Partition Labels", difficulty: "Medium", url: "https://leetcode.com/problems/partition-labels/", note: "A greedy range-closing problem where each chosen boundary is forced by the farthest requirement." },
    ],
    keyTakeaways: [
      "Minimum arrows is an interval stabbing problem, not a merge-output problem.",
      "Sorting by end exposes the earliest deadline among remaining balloons.",
      "Shooting at that end is safe by an exchange argument and maximises reuse of the arrow.",
      "Inclusive endpoints mean **start <= arrowX** is covered by the current arrow.",
    ],
    pattern:
      "Interval stabbing greedy: sort by end, choose the earliest finishing interval end as the next point, and skip every interval containing that point.",
  },
  {
    kind: "problem",
    slug: "iv-remove-covered-intervals",
    moduleId: "intervals-greedy",
    order: 12,
    title: "Remove Covered Intervals",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/remove-covered-intervals/",
    tags: ["Intervals", "Sorting", "Greedy", "Sweep Line"],
    companies: ["Amazon", "Google", "Microsoft", "Meta"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an array **intervals** where **intervals[i] = [li, ri]**. An interval **[a, b]** is covered by another interval **[c, d]** if **c <= a** and **b <= d**. Remove every covered interval and return the number of intervals that remain.",
    constraints: [
      "1 <= intervals.length <= 1000",
      "intervals[i].length == 2",
      "0 <= li < ri <= 10^5",
      "All intervals are unique",
    ],
    inputMD: "An integer matrix **intervals**, where each row gives the start and end of one interval.",
    outputMD: "An integer: the number of intervals not covered by any other interval.",
    examples: [
      {
        input: "intervals = [[1,4],[3,6],[2,8]]",
        output: "2",
        explanation: "Interval **[3,6]** is covered by **[2,8]**. The intervals **[1,4]** and **[2,8]** remain.",
      },
      {
        input: "intervals = [[1,4],[2,3]]",
        output: "1",
        explanation: "Interval **[2,3]** is fully inside **[1,4]**, so only **[1,4]** remains.",
      },
      {
        input: "intervals = [[0,10],[5,12]]",
        output: "2",
        explanation: "The intervals overlap, but neither one covers the other because each extends farther on one side.",
      },
    ],
    learningObjectives: [
      "Distinguish full containment from ordinary overlap.",
      "Sort equal-start intervals by descending end to reveal covered intervals correctly.",
      "Track the farthest end seen so far during a left-to-right sweep.",
      "Explain why a single maximum end is enough once starts are sorted.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **covered**, **contains**, or **remove intervals inside other intervals**. The trap is treating this like merge intervals. Overlap is not enough; **[0,10]** and **[5,12]** overlap but neither covers the other. We need to know whether a previous interval starts no later and ends no earlier.\n\nSorting by start ascending gives the first half of coverage for free: every previous interval starts at or before the current one. For equal starts, the longer interval must come first; otherwise **[1,3]** would be counted before **[1,4]** reveals that it is covered. After that ordering, the only state we need is the largest end seen so far.\n\n**Why greedy works / proof sketch**\n\nWhen the sweep reaches an interval **[s,e]**, every earlier interval has start **<= s** because of the sort. If the largest previous end **prevEnd** is at least **e**, then some earlier interval starts no later and ends no earlier, so **[s,e]** is definitely covered and can be discarded. If **e > prevEnd**, no earlier interval can cover it because all earlier ends are smaller than **e**. Keeping it and updating **prevEnd** is forced. The equal-start descending tie-break makes the strongest covering candidate appear before the intervals it covers.",
    commonMistakes: [
      "Sorting equal starts by end ascending, which counts a shorter interval before the longer interval that covers it.",
      "Checking only whether intervals overlap instead of whether one fully contains the other.",
      "Resetting the tracked end when a covered interval appears; the farthest previous end must stay alive.",
      "Returning the number removed instead of the number remaining.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort by start ascending, and when two intervals have the same start, sort by end descending. Sweep once while tracking **prevEnd**, the farthest end among intervals kept or seen so far. If the current end is less than or equal to **prevEnd**, the current interval is covered. If it extends beyond **prevEnd**, it cannot be covered by any earlier interval, so count it as remaining and update **prevEnd**.\n\n**Interval walkthrough**\n\nUse **intervals = [[1,4],[1,3],[2,8],[3,6]]**. After sorting, the number line order is **[1,4]**, **[1,3]**, **[2,8]**, **[3,6]** because the same-start interval with end **4** comes before end **3**. Draw **[1,4]** as **1 ---- 4** and **[1,3]** inside it as **1 -- 3**; since the farthest end is **4**, **[1,3]** is covered. Then **[2,8]** stretches beyond the current farthest end, so it remains and moves the boundary to **8**. Finally **[3,6]** sits under **2 ---- 8**, so it is covered. Two intervals remain.\n\n**Algorithm**\n\n1. Sort **intervals** by start ascending.\n2. For equal starts, sort by end descending so the covering interval is seen first.\n3. Initialise **remaining = 0** and **prevEnd** to the smallest integer value.\n4. For each interval **[start,end]** in sorted order, compare **end** with **prevEnd**.\n5. If **end <= prevEnd**, the interval is covered, so skip it.\n6. Otherwise, increment **remaining** and set **prevEnd = end**.\n7. Return **remaining**.",
    solutions: [
      {
        name: "Sorted containment sweep",
        whenToUseMD:
          "Use this when intervals can be sorted and the question asks how many intervals survive full coverage by another interval.",
        approachMD:
          "Sort by **start** ascending and **end** descending on ties. Then every previous interval starts no later than the current one, so coverage is determined only by whether the current end is within the farthest previous end.",
        walkthroughMD:
          "1. Sort intervals by start ascending.\n2. For equal starts, put the longer interval first by sorting end descending.\n3. Keep **farthestEnd**, the largest end among intervals that could cover future intervals.\n4. If the current end is less than or equal to **farthestEnd**, skip it as covered.\n5. Otherwise count it as remaining and update **farthestEnd**.\n6. Return the remaining count.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting dominates the sweep. The scan stores only counters, while Java object-array sorting may allocate temporary storage." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int removeCoveredIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> {
            if (a[0] != b[0]) {
                return Integer.compare(a[0], b[0]);
            }
            return Integer.compare(b[1], a[1]);
        });

        int remaining = 0;
        int farthestEnd = Integer.MIN_VALUE;

        for (int[] interval : intervals) {
            if (interval[1] > farthestEnd) {
                remaining++;
                farthestEnd = interval[1];
            }
        }

        return remaining;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = **[[1,4],[1,3],[2,8],[3,6]]**. Sorted order is **[[1,4],[1,3],[2,8],[3,6]]** because equal starts place the longer interval first.",
      columns: ["sorted interval", "farthest end before", "covered?", "action", "remaining"],
      rows: [
        ["[1,4]", "none", "no", "count it and set farthest end to 4", "1"],
        ["[1,3]", "4", "yes, 3 <= 4", "skip as covered", "1"],
        ["[2,8]", "4", "no", "count it and extend farthest end to 8", "2"],
        ["[3,6]", "8", "yes, 6 <= 8", "skip as covered", "2"],
      ],
      narrativeMD: "The remaining intervals are **[1,4]** and **[2,8]**. The sweep never needs to remember every previous interval; the maximum end captures the strongest covering candidate.",
    },
    interviewTipsMD:
      "Emphasise the difference between overlap and containment. The tie-break is usually where candidates lose points: same start must sort by end descending, otherwise a covered short interval can be counted before its covering long interval. During the sweep, say that **prevEnd** represents the best covering reach among all earlier starts.",
    followUps: [
      "How would you return the intervals that remain instead of only their count?",
      "How would the condition change if intervals were open at the right endpoint?",
      "How would you count intervals covered by at least two other intervals?",
      "Can you adapt the sweep if intervals arrive already sorted by start but not by equal-start end order?",
    ],
    similarProblems: [
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "Both sort by start, but merging extends ranges while coverage discards contained ranges." },
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", slug: "iv-minimum-arrows-burst-balloons", note: "Another greedy interval problem where the chosen sort key proves the local action." },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "iv-non-overlapping-intervals", note: "Uses interval ends to decide which intervals should survive conflicts." },
      { title: "Insert Interval", difficulty: "Medium", slug: "iv-insert-interval", note: "Also distinguishes overlapping, contained, and extending interval relationships." },
    ],
    keyTakeaways: [
      "Covered intervals require full containment, not just an overlap.",
      "Sort equal starts by descending end so longer intervals can cover shorter ones immediately.",
      "After sorting by start, **end <= prevEnd** is exactly the covered condition.",
      "Counting survivors is easier than physically removing intervals from the array.",
    ],
    pattern:
      "Containment sweep: sort by start ascending and end descending on ties, then keep only intervals that extend the farthest end seen so far.",
  },
  {
    kind: "problem",
    slug: "iv-interval-list-intersections",
    moduleId: "intervals-greedy",
    order: 13,
    title: "Interval List Intersections",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/interval-list-intersections/",
    tags: ["Intervals", "Two Pointers", "Greedy", "Merge", "Sorting"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "You are given two lists of closed intervals, **firstList** and **secondList**. Within each list, intervals are pairwise disjoint and sorted by start time. Return the intersection of these two interval lists.",
    constraints: [
      "0 <= firstList.length, secondList.length <= 1000",
      "firstList[i].length == 2",
      "secondList[j].length == 2",
      "0 <= start <= end <= 10^9",
      "Each input list is pairwise disjoint and sorted by start",
    ],
    inputMD: "Two integer matrices **firstList** and **secondList**, each already sorted by start with no overlaps inside the same list.",
    outputMD: "An integer matrix containing every intersection interval, in sorted order.",
    examples: [
      {
        input: "firstList = [[0,2],[5,10],[13,23],[24,25]], secondList = [[1,5],[8,12],[15,24],[25,26]]",
        output: "[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]",
        explanation: "Each output interval is the overlap between the current interval from the first list and the current interval from the second list. Touching endpoints such as **5** and **25** count because intervals are closed.",
      },
      {
        input: "firstList = [[1,3],[5,9]], secondList = []",
        output: "[]",
        explanation: "If one list is empty, there is no interval from that list to intersect with the other list.",
      },
      {
        input: "firstList = [[1,7]], secondList = [[3,4],[5,6]]",
        output: "[[3,4],[5,6]]",
        explanation: "Both intervals in the second list lie inside **[1,7]**, so each one becomes an intersection.",
      },
    ],
    learningObjectives: [
      "Use two pointers to merge across two sorted interval lists.",
      "Compute an intersection as **[max(startA,startB), min(endA,endB)]**.",
      "Advance the interval that ends first and justify why it cannot help later.",
      "Handle endpoint-touching intersections correctly for closed intervals.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **two sorted interval lists**, **pairwise disjoint**, and **return intersections**. This is the interval version of merging two sorted arrays. Because each list is already sorted and non-overlapping internally, only the current interval from each list can possibly create the next output intersection.\n\nFor two current intervals **A** and **B**, the overlap starts at the later start and ends at the earlier end. If **max(startA,startB) <= min(endA,endB)**, that range is a real closed-interval intersection. After processing the pair, the interval with the smaller end is finished forever: every future interval in the other list starts at or after the current one, so the smaller-ending interval cannot intersect anything later. That gives the pointer move.",
    commonMistakes: [
      "Advancing both pointers after every comparison and skipping intersections when one long interval overlaps multiple shorter intervals.",
      "Using a strict **start < end** test and missing single-point intersections like **[5,5]**.",
      "Sorting the input again even though the lists are already sorted and disjoint.",
      "Building merged unions of both lists instead of directly emitting intersections.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep one pointer in each list. For **firstList[i]** and **secondList[j]**, the intersection candidate is **[max(starts), min(ends)]**. Emit it when the start is less than or equal to the end. Then advance the pointer whose interval ends first, because that interval cannot overlap any later interval from the other list.\n\n**Interval walkthrough**\n\nUse **firstList = [[0,2],[5,10],[13,23],[24,25]]** and **secondList = [[1,5],[8,12],[15,24],[25,26]]**. Draw the first pair on a number line: **A [0,2]** and **B [1,5]** overlap from **1** to **2**, so output **[1,2]** and advance **A** because it ends at **2**. Now **A [5,10]** touches **B [1,5]** at **5**, so output **[5,5]** and advance **B**. The same **A [5,10]** then overlaps **B [8,12]** as **[8,10]**. Each move discards only the interval whose right edge has already passed.\n\n**Algorithm**\n\n1. Initialise pointers **i = 0** and **j = 0** and an empty result list.\n2. While both pointers are inside their lists, read intervals **A = firstList[i]** and **B = secondList[j]**.\n3. Compute **start = max(A.start, B.start)** and **end = min(A.end, B.end)**.\n4. If **start <= end**, append **[start,end]** to the result.\n5. If **A.end < B.end**, increment **i**.\n6. If **B.end < A.end**, increment **j**.\n7. If the ends are equal, increment both pointers.\n8. Convert the result list to an **int[][]** and return it.",
    solutions: [
      {
        name: "Two-pointer interval merge",
        whenToUseMD:
          "Use this when both interval lists are already sorted and internally disjoint, which makes a linear merge possible.",
        approachMD:
          "Compare the current interval from each list. The overlap, if any, is bounded by the later start and the earlier end. After checking it, discard the interval that ends first because it cannot intersect future intervals.",
        walkthroughMD:
          "1. Start one pointer at the beginning of each list.\n2. For the current pair, compute **start = max(startA, startB)** and **end = min(endA, endB)**.\n3. Append **[start,end]** when **start <= end**.\n4. Advance the pointer whose current interval has the smaller end.\n5. If both intervals end together, advance both pointers.\n6. Continue until either list is exhausted, then return the collected intersections.",
        complexity: { time: "O(m + n)", space: "O(k)", note: "Each input interval is advanced at most once. The result stores **k** intersections; aside from output storage, the algorithm uses O(1) extra space." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int[][] intervalIntersection(int[][] firstList, int[][] secondList) {
        List<int[]> intersections = new ArrayList<>();
        int first = 0;
        int second = 0;

        while (first < firstList.length && second < secondList.length) {
            int start = Math.max(firstList[first][0], secondList[second][0]);
            int end = Math.min(firstList[first][1], secondList[second][1]);

            if (start <= end) {
                intersections.add(new int[] { start, end });
            }

            int firstEnd = firstList[first][1];
            int secondEnd = secondList[second][1];

            if (firstEnd < secondEnd) {
                first++;
            } else if (secondEnd < firstEnd) {
                second++;
            } else {
                first++;
                second++;
            }
        }

        return intersections.toArray(new int[intersections.size()][]);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "firstList = **[[0,2],[5,10],[13,23],[24,25]]**, secondList = **[[1,5],[8,12],[15,24],[25,26]]**.",
      columns: ["first interval", "second interval", "candidate", "append", "advance"],
      rows: [
        ["[0,2]", "[1,5]", "[1,2] is valid", "[1,2]", "first, because 2 < 5"],
        ["[5,10]", "[1,5]", "[5,5] is valid", "[5,5]", "second, because 5 < 10"],
        ["[5,10]", "[8,12]", "[8,10] is valid", "[8,10]", "first, because 10 < 12"],
        ["[13,23]", "[8,12]", "[13,12] is invalid", "none", "second, because 12 < 23"],
        ["[13,23]", "[15,24]", "[15,23] is valid", "[15,23]", "first, because 23 < 24"],
        ["[24,25]", "[15,24]", "[24,24] is valid", "[24,24]", "second, because 24 < 25"],
        ["[24,25]", "[25,26]", "[25,25] is valid", "[25,25]", "first, because 25 < 26"],
      ],
      narrativeMD: "The pointer with the smaller end always moves past an interval that cannot overlap anything later. The collected intersections are **[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]**.",
    },
    interviewTipsMD:
      "Lead with the sorted-list merge analogy. The strongest sentence is: the next intersection can only come from the two current intervals, and after checking them, the one ending first is exhausted. Be explicit that intervals are closed, so touching endpoints produce valid one-point intersections such as **[5,5]**.",
    followUps: [
      "How would you intersect more than two sorted interval lists?",
      "How would the answer change for half-open intervals **[start,end)**?",
      "How would you return the total length of all intersections without storing them?",
      "What if intervals inside each input list were not sorted or could overlap?",
    ],
    similarProblems: [
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "Both rely on local overlap tests after intervals are ordered." },
      { title: "Insert Interval", difficulty: "Medium", slug: "iv-insert-interval", note: "Another problem where a carried interval is compared against sorted ranges." },
      { title: "Employee Free Time", difficulty: "Hard", slug: "iv-employee-free-time", note: "Combines multiple sorted schedules and reasons about gaps between merged busy intervals." },
      { title: "Meeting Rooms", difficulty: "Easy", slug: "iv-meeting-rooms", note: "Uses sorted intervals and endpoint comparisons to detect conflicts." },
    ],
    keyTakeaways: [
      "For two intervals, the intersection is bounded by the later start and earlier end.",
      "Closed intervals intersect when **maxStart <= minEnd**, including single-point touches.",
      "Advance the pointer with the smaller end because that interval cannot help with future intervals.",
      "Sorted, disjoint input lists make the solution linear without extra sorting.",
    ],
    pattern:
      "Two-list interval merge: compare current intervals, emit the overlap from max start to min end, then advance the interval that ends first.",
  },
];


