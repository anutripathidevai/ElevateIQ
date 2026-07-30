import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "greedy-merge-intervals",
    moduleId: "greedy-intervals",
    order: 7,
    title: "Merge Intervals",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
    tags: ["Greedy", "Intervals", "Sorting", "Sweep Line"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Given an array of intervals where **intervals[i] = [start, end]**, merge all overlapping intervals and return an array of the non-overlapping intervals that cover every point from the input.",
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start <= end <= 10^4",
    ],
    inputMD: "An integer matrix **intervals**, where each row is a closed interval **[start, end]**.",
    outputMD: "A matrix of merged, non-overlapping intervals that covers the same set of points as the input.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Intervals **[1,3]** and **[2,6]** overlap, so they merge into **[1,6]**. The other intervals are disjoint." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "The intervals touch at endpoint **4**. Because intervals are closed, they overlap and merge into **[1,5]**." },
      { input: "intervals = [[1,4],[0,2],[3,5]]", output: "[[0,5]]", explanation: "After sorting by start, each interval overlaps the growing merged interval, so the final coverage is **[0,5]**." },
    ],
    learningObjectives: [
      "Recognise when sorting intervals by start turns a global overlap problem into a one-pass sweep.",
      "Maintain the current merged interval and extend only its right endpoint when overlap is detected.",
      "Explain why earlier intervals never need to be revisited after the sweep passes them.",
      "Handle endpoint-touching intervals correctly for closed ranges.",
    ],
    intuitionMD:
      "The greedy insight is to make overlap local. Unsorted intervals can overlap with anything, so every decision feels global. Once intervals are sorted by start, any interval that can overlap the current merged block must appear immediately while its start is still at or before the current end.\n\nThe tempting wrong idea is to repeatedly search for overlapping pairs and merge them. That works logically, but it hides the structure and can become slow and messy. Sorting reveals the real pattern: sweep left to right, keep the best current coverage, and only start a new block when the next interval begins after the current end.",
    commonMistakes: [
      "Forgetting to sort first, which makes a single pass invalid.",
      "Treating **start == currentEnd** as non-overlap even though closed intervals overlap at the shared endpoint.",
      "Appending every interval before deciding whether it should extend the previous one.",
      "Updating both start and end on overlap; after sorting by start, the current merged start is already the earliest one.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nSort intervals by starting point. Keep the last merged interval as the current block of coverage. If the next interval starts within that block, extend the block end to the farthest end seen. If it starts after the block, the current block is final and a new block begins.\n\n**Why it works**\n\nAfter sorting, all future intervals start no earlier than the current interval. Once an interval starts after the current merged end, no later interval can connect back to the current block because later starts are even larger. Therefore it is safe to close the current block immediately.\n\n**Proof of correctness**\n\nConsider any optimal merged output after intervals are sorted. The first output interval must begin at the smallest start among the input intervals in its connected component. While subsequent intervals start at or before the current merged end, they belong to the same component and any valid output must cover their farthest end. If an optimal output split this component earlier, exchanging those split pieces for one interval from the earliest start to the farthest end preserves exactly the same coverage and uses no extra intervals. When the next start is greater than the current end, no interval later in sorted order can bridge the gap, so every valid output must start a new interval. Repeating this exchange argument for each component gives exactly the greedy output.\n\n**Algorithm**\n\n1. Sort **intervals** by start, using end as a tie-breaker.\n2. Create an empty result list.\n3. For each interval, compare its start with the end of the last merged interval.\n4. If there is no last interval or the start is greater than the last end, append a new interval.\n5. Otherwise, update the last end to **max(lastEnd, currentEnd)**.\n6. Return the result list as an array.",
    solutions: [
      {
        name: "Sort by start and sweep",
        approachMD:
          "Sorting by start makes each overlap decision depend only on the last interval already merged. The result list stores finalized merged blocks, and the final block may keep expanding as long as incoming intervals overlap it.",
        walkthroughMD:
          "1. Sort intervals by increasing start so potential overlaps are adjacent.\n2. Iterate through the sorted intervals.\n3. If the result is empty or the current interval starts after the last merged end, append a fresh interval.\n4. Otherwise, merge by extending the last merged end to the maximum of both ends.\n5. Convert the list of merged intervals back to a matrix.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting dominates the runtime. The output list can contain up to n intervals." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> {
            int byStart = Integer.compare(a[0], b[0]);
            if (byStart != 0) {
                return byStart;
            }
            return Integer.compare(a[1], b[1]);
        });

        List<int[]> merged = new ArrayList<>();
        for (int[] interval : intervals) {
            if (merged.isEmpty() || interval[0] > merged.get(merged.size() - 1)[1]) {
                merged.add(new int[] { interval[0], interval[1] });
            } else {
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], interval[1]);
            }
        }

        return merged.toArray(new int[merged.size()][]);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = [[1,3],[2,6],[8,10],[15,18]]. Sort by start, then track the current merged interval and output count.",
      columns: ["step", "interval after start-sort", "current merged before", "decision", "current merged after", "output count"],
      rows: [
        ["1", "[1,3]", "none", "Start the first merged interval.", "[1,3]", "1"],
        ["2", "[2,6]", "[1,3]", "2 <= 3, so extend the current end to 6.", "[1,6]", "1"],
        ["3", "[8,10]", "[1,6]", "8 > 6, so close the old block and start a new one.", "[8,10]", "2"],
        ["4", "[15,18]", "[8,10]", "15 > 10, so start another block.", "[15,18]", "3"],
      ],
      narrativeMD: "The sweep produces three disjoint merged blocks: **[1,6]**, **[8,10]**, and **[15,18]**.",
    },
    interviewTipsMD:
      "Lead with the sort-then-sweep pattern. Say that sorting by start makes all intervals that can merge with the current block appear before the first interval that starts after the current end. Interviewers often check whether you treat touching endpoints correctly, so explicitly mention that **[1,4]** and **[4,5]** merge for closed intervals.",
    followUps: [
      "How would you merge intervals if they arrive as a stream instead of all at once?",
      "How would you return the total covered length after merging?",
      "How would the answer change if intervals were open rather than closed?",
      "How would you merge intervals across multiple already-sorted lists?",
    ],
    similarProblems: [
      { title: "Insert Interval", difficulty: "Medium", slug: "greedy-insert-interval", note: "Uses the same merge condition while adding one new interval." },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "greedy-non-overlapping-intervals", note: "Chooses which intervals to keep instead of merging their coverage." },
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", slug: "greedy-minimum-arrows-burst-balloons", note: "Sorts intervals by end and groups overlaps with one greedy point." },
      { title: "Meeting Rooms", difficulty: "Easy", slug: "greedy-meeting-rooms", note: "Another interval sorting problem focused on detecting conflicts." },
    ],
    keyTakeaways: [
      "Sorting by start makes overlapping intervals adjacent.",
      "The current merged interval only needs its end extended on overlap.",
      "A gap after the current end proves the current merged block is final.",
      "Endpoint equality counts as overlap for closed intervals.",
    ],
    pattern:
      "Sort intervals by start, sweep once, extend the current block while intervals overlap, and start a new block only after a real gap.",
  },
  {
    kind: "problem",
    slug: "greedy-non-overlapping-intervals",
    moduleId: "greedy-intervals",
    order: 8,
    title: "Non-overlapping Intervals",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/non-overlapping-intervals/",
    tags: ["Greedy", "Intervals", "Sorting", "Activity Selection"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "TikTok"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an array of intervals, return the minimum number of intervals you need to remove so that the remaining intervals are non-overlapping. Intervals that only touch at an endpoint, such as **[1,2]** and **[2,3]**, are non-overlapping.",
    constraints: [
      "1 <= intervals.length <= 10^5",
      "intervals[i].length == 2",
      "-5 * 10^4 <= start < end <= 5 * 10^4",
    ],
    inputMD: "An integer matrix **intervals**, where each row is an interval **[start, end]**.",
    outputMD: "An integer: the minimum number of intervals to remove so all remaining intervals are pairwise non-overlapping.",
    examples: [
      { input: "intervals = [[1,2],[2,3],[3,4],[1,3]]", output: "1", explanation: "Remove **[1,3]**. The remaining intervals touch only at endpoints, which is allowed." },
      { input: "intervals = [[1,2],[1,2],[1,2]]", output: "2", explanation: "Only one of the identical intervals can remain, so two must be removed." },
      { input: "intervals = [[1,2],[2,3]]", output: "0", explanation: "The intervals do not overlap because the first ends exactly where the second starts." },
    ],
    learningObjectives: [
      "Transform minimum removals into maximizing the number of intervals kept.",
      "Recognise the earliest-finish greedy rule for interval scheduling.",
      "Use an exchange argument to justify keeping the interval with the smallest end.",
      "Distinguish overlap rules for removal from merge rules for closed intervals.",
    ],
    intuitionMD:
      "The greedy insight is to keep as many intervals as possible, then removals are simply **n - kept**. To leave room for future intervals, the safest interval to keep is the one that finishes earliest among the intervals currently competing for the next slot.\n\nThe tempting wrong idea is to sort by start and keep the first interval you see. That can trap you with a long interval that blocks several short intervals. Sorting by end makes the local choice future-friendly: each kept interval leaves the maximum remaining timeline for everything after it.",
    commonMistakes: [
      "Sorting by start and keeping long intervals that block better future choices.",
      "Using **start <= currentEnd** as overlap; for this problem, touching endpoints are allowed, so overlap is **start < currentEnd**.",
      "Counting kept intervals but returning that count instead of removals.",
      "When two intervals overlap, advancing the current end to the larger end instead of keeping the smaller end.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nSort intervals by increasing end. Keep the first interval because it finishes earliest. Then keep every next interval whose start is at least the end of the last kept interval. Every interval that starts before that end must be removed.\n\n**Why it works**\n\nAmong all intervals that could be chosen next, the one with the earliest end leaves the most room for future intervals. Choosing a later-ending interval can only reduce the set of intervals that remain compatible afterward.\n\n**Proof of correctness**\n\nTake an optimal solution that keeps the maximum number of non-overlapping intervals. Look at the first interval kept by that solution. The greedy algorithm chooses the interval with the earliest end among all intervals. If the optimal solution chose a different first interval, replace it with the greedy interval. The greedy interval ends no later, so every interval that was compatible after the original first interval is still compatible after the greedy one. The number of kept intervals does not decrease. Applying the same exchange after each greedy choice shows there is an optimal solution that makes exactly the greedy choices. Therefore the greedy kept count is maximum, and the resulting removal count is minimum.\n\n**Algorithm**\n\n1. Sort **intervals** by end, using start as a tie-breaker.\n2. Set **currentEnd** to the end of the first interval and **removed** to **0**.\n3. Scan the remaining intervals.\n4. If **start < currentEnd**, the interval overlaps the last kept interval, so increment **removed**.\n5. Otherwise, keep the interval and update **currentEnd** to its end.\n6. Return **removed**.",
    solutions: [
      {
        name: "Earliest finishing interval sweep",
        approachMD:
          "This is the classic activity-selection greedy rule. By sorting by end, every time we keep an interval we choose the compatible interval that leaves the most room for the rest of the schedule.",
        walkthroughMD:
          "1. Sort intervals by increasing end time, with start as a deterministic tie-breaker.\n2. Keep the first interval and remember its end.\n3. For each later interval, compare its start to the end of the last kept interval.\n4. If it overlaps, remove it and keep the earlier end already stored.\n5. If it does not overlap, keep it and move the current end forward.",
        complexity: { time: "O(n log n)", space: "O(1)", note: "Sorting dominates. Apart from the sort implementation, the sweep uses constant extra space." },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> {
            int byEnd = Integer.compare(a[1], b[1]);
            if (byEnd != 0) {
                return byEnd;
            }
            return Integer.compare(a[0], b[0]);
        });

        int removed = 0;
        int currentEnd = intervals[0][1];

        for (int index = 1; index < intervals.length; index++) {
            if (intervals[index][0] < currentEnd) {
                removed++;
            } else {
                currentEnd = intervals[index][1];
            }
        }

        return removed;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = [[1,2],[2,3],[3,4],[1,3]]. Sort by end and track the end of the last kept interval plus the removal count.",
      columns: ["step", "interval after end-sort", "current kept end before", "decision", "current kept end after", "removed count"],
      rows: [
        ["1", "[1,2]", "none", "Keep the earliest ending interval.", "2", "0"],
        ["2", "[1,3]", "2", "1 < 2, so remove this overlapping interval.", "2", "1"],
        ["3", "[2,3]", "2", "2 >= 2, so keep it and move the end to 3.", "3", "1"],
        ["4", "[3,4]", "3", "3 >= 3, so keep it and move the end to 4.", "4", "1"],
      ],
      narrativeMD: "The greedy sweep keeps three intervals and removes one. Since three is the maximum possible kept count, one removal is minimum.",
    },
    interviewTipsMD:
      "Frame the problem as activity selection: minimize removals by maximizing compatible intervals kept. The key phrase interviewers expect is earliest finishing time. Also be careful with the boundary rule: unlike Merge Intervals, endpoint equality is allowed here, so **[1,2]** and **[2,3]** can both remain.",
    followUps: [
      "How would you return the intervals removed rather than only the count?",
      "How would the rule change if intervals touching at endpoints were considered overlapping?",
      "How would you solve the weighted version where each interval has a value?",
      "How would you handle intervals arriving online without sorting all of them first?",
    ],
    similarProblems: [
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", slug: "greedy-minimum-arrows-burst-balloons", note: "Also sorts by end and groups compatible intervals greedily." },
      { title: "Meeting Rooms", difficulty: "Easy", slug: "greedy-meeting-rooms", note: "Uses interval overlap rules to detect whether all intervals can coexist." },
      { title: "Maximum Events That Can Be Attended", difficulty: "Medium", slug: "greedy-maximum-events-attended", note: "Another scheduling problem where choosing the earliest finishing option preserves future choices." },
      { title: "Merge Intervals", difficulty: "Medium", slug: "greedy-merge-intervals", note: "A start-sorted interval sweep with a different objective." },
    ],
    keyTakeaways: [
      "Minimum removals equals total intervals minus maximum intervals kept.",
      "For interval scheduling, choosing the earliest finishing compatible interval is safe.",
      "When an overlap appears after end-sorting, remove the current interval and keep the smaller end.",
      "Endpoint equality is compatible in this problem.",
    ],
    pattern:
      "Sort intervals by end, keep each interval that starts after or at the last kept end, and count every overlapping interval as a removal.",
  },
  {
    kind: "problem",
    slug: "greedy-insert-interval",
    moduleId: "greedy-intervals",
    order: 9,
    title: "Insert Interval",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/insert-interval/",
    tags: ["Greedy", "Intervals", "Array", "Sweep Line"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "You are given a list of non-overlapping intervals sorted by start time and a new interval. Insert the new interval into the list so that the result remains sorted and non-overlapping, merging intervals when necessary.",
    constraints: [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "intervals is sorted by start and contains no overlapping intervals",
      "newInterval.length == 2",
      "0 <= start <= end <= 10^5",
    ],
    inputMD: "A sorted, non-overlapping matrix **intervals** and one interval **newInterval = [start, end]**.",
    outputMD: "A sorted, non-overlapping matrix after inserting and merging **newInterval**.",
    examples: [
      { input: "intervals = [[1,3],[6,9]], newInterval = [2,5]", output: "[[1,5],[6,9]]", explanation: "**[2,5]** overlaps **[1,3]**, so they merge into **[1,5]** before **[6,9]**." },
      { input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]", output: "[[1,2],[3,10],[12,16]]", explanation: "The new interval overlaps **[3,5]**, **[6,7]**, and **[8,10]**, forming **[3,10]**." },
      { input: "intervals = [], newInterval = [5,7]", output: "[[5,7]]", explanation: "With no existing intervals, the inserted interval is the entire result." },
    ],
    learningObjectives: [
      "Use sorted, non-overlapping input to avoid sorting again.",
      "Partition the sweep into intervals before, overlapping with, and after the inserted interval.",
      "Maintain the growing inserted interval as a current merged block.",
      "Handle empty input and endpoint-touching overlaps cleanly.",
    ],
    intuitionMD:
      "The greedy insight is that the existing list is already sorted and clean. The new interval can only affect one contiguous region: intervals before it are safely copied, intervals that overlap it are absorbed into one growing interval, and intervals after it are safely copied.\n\nThe tempting wrong idea is to append the new interval, sort everything, and run Merge Intervals. That is correct but ignores the stronger input guarantee. A single sweep can preserve order and merge only the one region touched by the new interval.",
    commonMistakes: [
      "Sorting again even though the input is already sorted.",
      "Using **intervalStart < newEnd** instead of **intervalStart <= newEnd**, which misses endpoint-touching overlap.",
      "Appending the merged new interval too early before all overlapping intervals have been absorbed.",
      "Forgetting to copy the trailing intervals after the merge phase finishes.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nSweep the sorted intervals once. Copy every interval that ends before the new interval starts. Then greedily absorb every interval whose start is at or before the current new interval end. Once an interval starts after the merged new interval, the merge region is complete, so append the merged interval and copy the rest.\n\n**Why it works**\n\nBecause the original intervals are sorted and non-overlapping, intervals before the new interval cannot be affected by later intervals. All intervals that overlap the inserted interval appear consecutively. After the first interval that starts beyond the current merged end, no later interval can overlap the merged interval either.\n\n**Proof of correctness**\n\nConsider any valid output after inserting **newInterval**. Every original interval ending before the new interval starts is disjoint from the inserted coverage, so exchanging any different placement for copying it unchanged preserves sorted order and coverage. For the overlapping region, all intervals connected to the new interval must be represented by one interval whose start is the minimum start and whose end is the maximum end of that region; splitting it would create overlapping output intervals or duplicate coverage. The greedy sweep computes exactly those minimum and maximum boundaries by absorbing each overlapping interval. Once the next interval starts after the merged end, sorted order guarantees all later intervals are also after it, so copying the suffix unchanged is forced. Therefore the greedy output is the unique sorted non-overlapping representation of the inserted coverage.\n\n**Algorithm**\n\n1. Create an empty result list and start at index **0**.\n2. Append all intervals with **end < newStart**.\n3. While intervals overlap the current new interval, update **start = min(start, intervalStart)** and **end = max(end, intervalEnd)**.\n4. Append the merged new interval once.\n5. Append all remaining intervals unchanged.\n6. Return the result as an array.",
    solutions: [
      {
        name: "Three-phase interval sweep",
        approachMD:
          "The sorted input lets us process the array in three phases: before the new interval, overlapping with it, and after it. Only the middle phase can change interval boundaries.",
        walkthroughMD:
          "1. Copy intervals whose end is strictly before the new interval start.\n2. Track the current merged start and end for the inserted interval.\n3. Absorb every interval whose start is at or before the current merged end.\n4. Append the merged interval exactly once after the overlap phase.\n5. Copy the remaining suffix intervals unchanged.",
        complexity: { time: "O(n)", space: "O(n)", note: "The algorithm scans the input once. The output array can contain up to n + 1 intervals." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> result = new ArrayList<>();
        int index = 0;
        int n = intervals.length;

        while (index < n && intervals[index][1] < newInterval[0]) {
            result.add(new int[] { intervals[index][0], intervals[index][1] });
            index++;
        }

        int start = newInterval[0];
        int end = newInterval[1];
        while (index < n && intervals[index][0] <= end) {
            start = Math.min(start, intervals[index][0]);
            end = Math.max(end, intervals[index][1]);
            index++;
        }

        result.add(new int[] { start, end });

        while (index < n) {
            result.add(new int[] { intervals[index][0], intervals[index][1] });
            index++;
        }

        return result.toArray(new int[result.size()][]);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]. The input is already sorted by start, so trace the single sweep and current merged interval.",
      columns: ["step", "interval in sorted order", "current merged new interval", "decision", "output count"],
      rows: [
        ["1", "[1,2]", "[4,8]", "2 < 4, so copy this interval before the merge region.", "1"],
        ["2", "[3,5]", "[4,8]", "3 <= 8, so merge to [3,8].", "1"],
        ["3", "[6,7]", "[3,8]", "6 <= 8, so it is absorbed and the end stays 8.", "1"],
        ["4", "[8,10]", "[3,8]", "8 <= 8, so merge at the endpoint and extend to [3,10].", "1"],
        ["5", "[12,16]", "[3,10]", "12 > 10, so append [3,10] and then copy the suffix interval.", "3"],
      ],
      narrativeMD: "The output is **[1,2]**, then the merged inserted interval **[3,10]**, then the untouched suffix **[12,16]**.",
    },
    interviewTipsMD:
      "Mention that this is Merge Intervals with a stronger precondition: the existing intervals are already sorted and non-overlapping. That is why a one-pass three-phase sweep is better than appending and sorting. Be explicit about when the merged interval is appended; appending it too early is the most common implementation bug.",
    followUps: [
      "What if you need to insert many intervals one by one?",
      "What if intervals are not sorted initially?",
      "How would you delete an interval range from the list instead of inserting one?",
      "How would you maintain this structure for online calendar bookings?",
    ],
    similarProblems: [
      { title: "Merge Intervals", difficulty: "Medium", slug: "greedy-merge-intervals", note: "The general version where all intervals may need sorting and merging." },
      { title: "Meeting Rooms", difficulty: "Easy", slug: "greedy-meeting-rooms", note: "Also relies on sorted intervals and endpoint conflict rules." },
      { title: "Employee Free Time", difficulty: "Hard", url: "https://leetcode.com/problems/employee-free-time/", note: "Merges busy intervals across multiple schedules to find gaps." },
      { title: "Data Stream as Disjoint Intervals", difficulty: "Hard", url: "https://leetcode.com/problems/data-stream-as-disjoint-intervals/", note: "Maintains merged intervals dynamically as values arrive." },
    ],
    keyTakeaways: [
      "When intervals are already sorted, do not pay another sorting cost.",
      "The inserted interval can only merge with one contiguous block of intervals.",
      "Copy before, merge middle, copy after is the clean implementation structure.",
      "Append the merged interval once, after all overlaps have been consumed.",
    ],
    pattern:
      "For sorted non-overlapping intervals, sweep in three phases: copy intervals before the target range, merge the overlapping block, then copy the remaining suffix.",
  },
  {
    kind: "problem",
    slug: "greedy-minimum-arrows-burst-balloons",
    moduleId: "greedy-intervals",
    order: 10,
    title: "Minimum Number of Arrows to Burst Balloons",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
    tags: ["Greedy", "Intervals", "Sorting", "Activity Selection"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Uber"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "There are balloons represented by horizontal intervals **points[i] = [xStart, xEnd]**. An arrow shot vertically at coordinate **x** bursts every balloon where **xStart <= x <= xEnd**. Return the minimum number of arrows needed to burst all balloons.",
    constraints: [
      "1 <= points.length <= 10^5",
      "points[i].length == 2",
      "-2^31 <= xStart < xEnd <= 2^31 - 1",
    ],
    inputMD: "An integer matrix **points**, where each row is the inclusive horizontal span of one balloon.",
    outputMD: "An integer: the minimum number of vertical arrows required to burst every balloon.",
    examples: [
      { input: "points = [[10,16],[2,8],[1,6],[7,12]]", output: "2", explanation: "Shoot one arrow at **6** to burst **[1,6]** and **[2,8]**, and another at **12** to burst **[7,12]** and **[10,16]**." },
      { input: "points = [[1,2],[3,4],[5,6],[7,8]]", output: "4", explanation: "No two balloons overlap, so each balloon needs its own arrow." },
      { input: "points = [[1,2],[2,3],[3,4],[4,5]]", output: "2", explanation: "Endpoint hits count. An arrow at **2** bursts the first two balloons, and an arrow at **4** bursts the last two." },
    ],
    learningObjectives: [
      "Model one arrow as choosing a point shared by a group of overlapping intervals.",
      "Apply the earliest-ending greedy rule to minimize selected points.",
      "Use an exchange argument to justify shooting at the current smallest end.",
      "Handle inclusive endpoints and large coordinate values safely.",
    ],
    intuitionMD:
      "The greedy insight is to ask where the first arrow should go. If we sort balloons by right endpoint, the balloon that ends earliest must be burst soon. Shooting at its right endpoint is the safest possible choice: it bursts that balloon and remains as far right as possible, giving the same arrow the best chance to hit upcoming balloons.\n\nThe tempting wrong idea is to shoot near the start of an overlap or to sort by start and keep widening a group. That can waste reach. The earliest end is the deadline; placing the arrow exactly at that deadline satisfies the current balloon while preserving maximum compatibility with later balloons.",
    commonMistakes: [
      "Sorting by start and choosing arrows too early inside an overlap group.",
      "Using **start >= arrowPosition** to start a new arrow; because endpoints are inclusive, only **start > arrowPosition** requires a new arrow.",
      "Updating the arrow position when a balloon is already burst by the current arrow.",
      "Subtracting coordinates in the comparator, which can overflow for 32-bit endpoint values.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nSort balloons by increasing end coordinate. Shoot the first arrow at the end of the earliest-ending balloon. Every later balloon whose start is at or before that arrow position is already burst. When a balloon starts after the arrow position, shoot a new arrow at that balloon's end.\n\n**Why it works**\n\nThe earliest-ending unburst balloon imposes the tightest deadline on the next arrow. Any valid solution must place an arrow somewhere within that balloon. Choosing its end is never worse than choosing an earlier point, because the end is still inside the balloon and can only make the arrow more likely to hit future balloons that start later.\n\n**Proof of correctness**\n\nConsider an optimal solution for the sorted balloons. Look at the earliest-ending balloon not yet burst. The optimal solution must use some arrow position inside that balloon. Move that arrow to the balloon's end. This exchange still bursts the earliest-ending balloon. It also does not lose any previously considered balloon in the current group, because their starts are at or before this end and their ends are no smaller than the earliest end by sorting. Moving right to the earliest end can only help with future balloons. Therefore there is an optimal solution that shoots exactly where the greedy algorithm shoots. After removing every balloon burst by that arrow, the same argument applies to the remaining balloons. Thus the greedy arrow count is minimum.\n\n**Algorithm**\n\n1. Sort **points** by end coordinate, using start as a tie-breaker.\n2. Shoot the first arrow at the end of the first balloon and set **arrows = 1**.\n3. Scan the remaining balloons in sorted order.\n4. If the balloon start is at or before **arrowPosition**, it is already burst.\n5. If the balloon start is greater than **arrowPosition**, shoot a new arrow at its end and increment **arrows**.\n6. Return **arrows**.",
    solutions: [
      {
        name: "Sort by end and place arrows at deadlines",
        approachMD:
          "Each arrow is placed at the right endpoint of the earliest-ending unburst balloon. That point is the latest safe position for the current balloon and maximizes the chance of covering later overlapping balloons.",
        walkthroughMD:
          "1. Sort balloons by end coordinate using **Integer.compare** to avoid overflow.\n2. Place the first arrow at the first balloon end.\n3. For each next balloon, check whether its start is covered by the current arrow.\n4. If it is covered, do nothing because the same arrow bursts it.\n5. If it starts after the arrow, create a new arrow at this balloon's end.",
        complexity: { time: "O(n log n)", space: "O(1)", note: "Sorting dominates. The scan keeps only the current arrow position and count." },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int findMinArrowShots(int[][] points) {
        Arrays.sort(points, (a, b) -> {
            int byEnd = Integer.compare(a[1], b[1]);
            if (byEnd != 0) {
                return byEnd;
            }
            return Integer.compare(a[0], b[0]);
        });

        int arrows = 1;
        int arrowPosition = points[0][1];

        for (int index = 1; index < points.length; index++) {
            if (points[index][0] > arrowPosition) {
                arrows++;
                arrowPosition = points[index][1];
            }
        }

        return arrows;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "points = [[10,16],[2,8],[1,6],[7,12]]. Sort by balloon end, then track the current arrow position and arrow count.",
      columns: ["step", "balloon after end-sort", "current arrow before", "decision", "current arrow after", "arrows"],
      rows: [
        ["1", "[1,6]", "none", "Shoot the first arrow at the earliest end 6.", "6", "1"],
        ["2", "[2,8]", "6", "2 <= 6, so this balloon is burst by the same arrow.", "6", "1"],
        ["3", "[7,12]", "6", "7 > 6, so shoot a new arrow at 12.", "12", "2"],
        ["4", "[10,16]", "12", "10 <= 12, so the second arrow also bursts this balloon.", "12", "2"],
      ],
      narrativeMD: "Two arrows are enough: one at **6** for the first overlap group and one at **12** for the second group.",
    },
    interviewTipsMD:
      "This problem is the point-cover version of interval scheduling. Say that the earliest end is a deadline, and shooting at that deadline is the exchange-safe choice. Be precise about inclusive endpoints: a balloon starting exactly at the arrow position is already burst, so a new arrow is needed only when **start > arrowPosition**.",
    followUps: [
      "How would the solution change if arrow hits were not inclusive at endpoints?",
      "How would you return the actual arrow positions?",
      "What if each arrow had a limited vertical range and could not hit every balloon at that x-coordinate?",
      "How would you handle balloons being added dynamically over time?",
    ],
    similarProblems: [
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "greedy-non-overlapping-intervals", note: "Uses the same earliest-ending exchange argument." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "greedy-meeting-rooms-ii", note: "Another interval sweep that counts resources needed for overlaps." },
      { title: "Maximum Events That Can Be Attended", difficulty: "Medium", slug: "greedy-maximum-events-attended", note: "Chooses the earliest ending available event to preserve future options." },
      { title: "Car Fleet", difficulty: "Medium", url: "https://leetcode.com/problems/car-fleet/", note: "Groups intervals of influence with a greedy sweep from one side." },
    ],
    keyTakeaways: [
      "One arrow is a point chosen inside as many overlapping intervals as possible.",
      "The earliest-ending unburst balloon determines the next arrow position.",
      "Shooting at that end is safe because it satisfies the current deadline and preserves future reach.",
      "Inclusive endpoints mean **start == arrowPosition** is covered.",
    ],
    pattern:
      "Sort intervals by end, choose a point at the earliest end, skip every interval containing that point, and repeat when the next interval starts after it.",
  },
];
