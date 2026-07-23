import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "iv-my-calendar-i",
    moduleId: "intervals-advanced",
    order: 14,
    title: "My Calendar I",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/my-calendar-i/",
    tags: ["Intervals", "Design", "TreeMap", "Binary Search Tree", "Calendar"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "Design a **MyCalendar** data structure. **book(startTime, endTime)** tries to add an event on the half-open interval **[startTime,endTime)**. The booking succeeds only if it does not overlap any existing event. Return **true** when the event is stored, otherwise return **false** and leave the calendar unchanged.",
    constraints: [
      "0 <= startTime < endTime <= 10^9",
      "At most 1000 calls will be made to book",
      "Intervals are half-open, so an event ending at time x does not overlap an event starting at time x",
    ],
    inputMD: "A constructor call **MyCalendar()** followed by a sequence of **book(startTime, endTime)** calls.",
    outputMD: "For the constructor output **null**. For each **book** call, output whether the event was accepted into the calendar.",
    examples: [
      {
        input: "operations = [MyCalendar, book, book, book], arguments = [[], [10,20], [15,25], [20,30]]",
        output: "[null, true, false, true]",
        explanation: "The first event is stored. The second overlaps [10,20), so it is rejected. The third starts exactly when [10,20) ends, so the half-open intervals do not overlap.",
      },
      {
        input: "operations = [MyCalendar, book, book, book, book], arguments = [[], [5,10], [10,15], [7,8], [1,5]]",
        output: "[null, true, true, false, true]",
        explanation: "[5,10) and [10,15) touch but do not overlap. [7,8) falls inside [5,10), while [1,5) ends exactly before the first event begins.",
      },
    ],
    learningObjectives: [
      "Model calendar events as half-open intervals and apply the correct overlap test.",
      "Use **TreeMap** ordering to inspect only the closest previous and next events.",
      "Explain why non-neighbour intervals cannot be the first conflict in a start-sorted calendar.",
      "Preserve the calendar state when a booking is rejected.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe design signal is an online interval set: events arrive one at a time, and each accepted event must remain sorted for future checks. Sorting the full calendar after every call is unnecessary. A list scan works for small limits, but it does not teach the scalable interview pattern.\n\nUse a **TreeMap** keyed by event start time. For a new interval **[startTime,endTime)**, only two neighbours can create the first conflict: the event with the greatest start not exceeding **startTime**, and the event with the smallest start not less than **startTime**. If the previous event ends after **startTime**, it overlaps from the left. If the next event starts before **endTime**, it overlaps from the right.",
    commonMistakes: [
      "Treating intervals as closed and rejecting back-to-back events like **[10,20)** and **[20,30)**.",
      "Scanning all events even though the start-sorted predecessor and successor are sufficient.",
      "Checking only the previous event and missing a next event that starts inside the new interval.",
      "Adding the event before validation, then forgetting to remove it on failure.",
    ],
    algorithmMD:
      "**Key idea**\n\nStore accepted events in a **TreeMap** where the key is the start time and the value is the end time. In start order, any event before the predecessor ends no later than the predecessor, and any event after the successor starts no earlier than the successor. Therefore the booking decision only needs **floorKey(startTime)** and **ceilingKey(startTime)**.\n\n**Interval walkthrough**\n\nBegin with an empty calendar. After **book([10,20])**, store **{10 -> 20}**, representing **[10,20)**. For **book([15,25])**, the floor neighbour is **[10,20)**, and **20 > 15**, so the new event enters the existing event and must be rejected. The calendar stays **{10 -> 20}**. For **book([20,30])**, the floor neighbour is still **[10,20)**, but **20 > 20** is false, and there is no ceiling neighbour. The new event is accepted, giving **{10 -> 20, 20 -> 30}**.\n\n**Algorithm**\n\n1. Create a **TreeMap** named **events** from start time to end time.\n2. For **book(startTime, endTime)**, find **previousStart = events.floorKey(startTime)**.\n3. If **previousStart** exists and **events.get(previousStart) > startTime**, return **false**.\n4. Find **nextStart = events.ceilingKey(startTime)**.\n5. If **nextStart** exists and **nextStart < endTime**, return **false**.\n6. Insert **startTime -> endTime** and return **true**.",
    solutions: [
      {
        name: "TreeMap neighbour check",
        whenToUseMD:
          "Use this when events are inserted online and each booking only needs to know whether it overlaps an already accepted interval.",
        approachMD:
          "The **TreeMap** keeps events sorted by start time. A candidate can only overlap the immediate predecessor or immediate successor in that sorted order, so **book** performs two logarithmic neighbour lookups and inserts only after both checks pass.",
        walkthroughMD:
          "1. Store each accepted event as **start -> end** in the **TreeMap**.\n2. Use **floorKey(startTime)** to find the closest event that starts before or at the candidate.\n3. Reject if that event's end is greater than **startTime**.\n4. Use **ceilingKey(startTime)** to find the closest event that starts after or at the candidate.\n5. Reject if that start is less than **endTime**.\n6. If neither neighbour overlaps, insert the event and return **true**.",
        complexity: {
          time: "O(log n) per book",
          space: "O(n)",
          note: "**TreeMap** predecessor, successor, and insert operations are logarithmic in the number of accepted events.",
        },
        filename: "MyCalendar.java",
        code: `import java.util.*;

class MyCalendar {
    private final TreeMap<Integer, Integer> events = new TreeMap<>();

    public MyCalendar() {}

    public boolean book(int startTime, int endTime) {
        Integer previousStart = events.floorKey(startTime);
        if (previousStart != null && events.get(previousStart) > startTime) {
            return false;
        }

        Integer nextStart = events.ceilingKey(startTime);
        if (nextStart != null && nextStart < endTime) {
            return false;
        }

        events.put(startTime, endTime);
        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Sequence of calls: **book([10,20])**, **book([15,25])**, **book([20,30])**, **book([5,10])**. The calendar stores **start -> end** pairs.",
      columns: ["call", "TreeMap before", "neighbour decision", "result"],
      rows: [
        ["book([10,20])", "{}", "no floor or ceiling conflict, store 10 -> 20", "true"],
        ["book([15,25])", "{10 -> 20}", "floor [10,20) ends after 15, reject", "false"],
        ["book([20,30])", "{10 -> 20}", "floor [10,20) ends at 20, no overlap", "true"],
        ["book([5,10])", "{10 -> 20, 20 -> 30}", "ceiling [10,20) starts at 10, no overlap", "true"],
      ],
      narrativeMD: "The important boundary is strict: an existing end equal to the new start is safe, and a next start equal to the new end is safe. Only **end > startTime** or **nextStart < endTime** creates a double booking.",
    },
    interviewTipsMD:
      "Say half-open intervals out loud before writing comparisons. Then justify why only two neighbours matter in a start-sorted map. A strong explanation is that every earlier interval starts no later than the floor interval, and because accepted intervals never overlap, it must also end no later than the floor interval. Symmetrically, every later interval starts no earlier than the ceiling interval.",
    followUps: [
      "How would you support cancelling an event while keeping the same complexity?",
      "How would the checks change if intervals were closed instead of half-open?",
      "How would you return the conflicting interval rather than just **false**?",
      "How would you extend the design to allow double bookings but reject triple bookings?",
    ],
    similarProblems: [
      { title: "My Calendar II", difficulty: "Medium", slug: "iv-my-calendar-ii", note: "Relaxes the rule to allow overlaps up to depth two." },
      { title: "Meeting Rooms", difficulty: "Easy", slug: "iv-meeting-rooms", note: "The offline version of detecting whether intervals overlap." },
      { title: "Insert Interval", difficulty: "Medium", slug: "iv-insert-interval", note: "Also places one new interval into an ordered set of non-overlapping intervals." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "iv-meeting-rooms-ii", note: "Counts maximum simultaneous events instead of rejecting them." },
      { title: "Range Module", difficulty: "Hard", url: "https://leetcode.com/problems/range-module/", note: "A fuller interval-set design with add, query, and remove operations." },
    ],
    keyTakeaways: [
      "Half-open intervals allow endpoints to touch without overlap.",
      "A start-sorted **TreeMap** reduces booking validation to predecessor and successor checks.",
      "Rejected bookings must not mutate the calendar.",
      "The reusable pattern is ordered interval set plus neighbour queries.",
    ],
    pattern:
      "Ordered interval set: store disjoint intervals by start, inspect the closest left and right neighbours, and mutate only when both boundaries are safe.",
  },
  {
    kind: "problem",
    slug: "iv-my-calendar-ii",
    moduleId: "intervals-advanced",
    order: 15,
    title: "My Calendar II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/my-calendar-ii/",
    tags: ["Intervals", "Design", "TreeMap", "Sweep Line", "Prefix Sum"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "Design a **MyCalendarTwo** data structure. **book(startTime, endTime)** adds an event on the half-open interval **[startTime,endTime)** if doing so does not create any time point covered by three events. Double bookings are allowed. Triple bookings are not.",
    constraints: [
      "0 <= startTime < endTime <= 10^9",
      "At most 1000 calls will be made to book",
      "Intervals are half-open, so an event ending at time x does not contribute at time x",
    ],
    inputMD: "A constructor call **MyCalendarTwo()** followed by a sequence of **book(startTime, endTime)** calls.",
    outputMD: "For the constructor output **null**. For each **book** call, output whether the event was accepted without creating a triple booking.",
    examples: [
      {
        input: "operations = [MyCalendarTwo, book, book, book, book, book, book], arguments = [[], [10,20], [50,60], [10,40], [5,15], [5,10], [25,55]]",
        output: "[null, true, true, true, false, true, true]",
        explanation: "[5,15) would make [10,15) covered by three events: [10,20), [10,40), and [5,15). The later [25,55) is accepted because it never pushes overlap depth above two.",
      },
      {
        input: "operations = [MyCalendarTwo, book, book, book, book], arguments = [[], [1,5], [5,10], [2,6], [4,7]]",
        output: "[null, true, true, true, false]",
        explanation: "[1,5) and [5,10) only touch. Adding [2,6) creates double-covered regions, but adding [4,7) would make [4,5) and [5,6) triple-covered.",
      },
    ],
    learningObjectives: [
      "Represent interval coverage changes with boundary deltas rather than storing every point.",
      "Use a **TreeMap** sweep line to compute active booking depth in time order.",
      "Rollback tentative mutations when a booking violates the maximum allowed overlap.",
      "Distinguish double booking from triple booking using prefix sums over event boundaries.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe phrase allow double booking but reject triple booking changes the problem from finding one conflicting neighbour to measuring overlap depth. A single predecessor check is no longer enough: a new event may overlap different existing events in different subranges, and the dangerous point is where active count becomes three.\n\nThe sweep-line pattern treats each interval as two boundary events: **+1** at its start and **-1** at its end. If boundaries are processed in sorted time order, the running prefix sum is the number of active bookings after that boundary. A tentative booking is valid exactly when every prefix sum remains at most two.",
    commonMistakes: [
      "Rejecting any overlap, which solves My Calendar I but not the double-booking variant.",
      "Checking only the new interval's endpoints instead of every boundary where active count can change.",
      "Forgetting to rollback both boundary deltas after detecting a triple booking.",
      "Treating an end boundary as still active at the same time another event starts.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse a **TreeMap** named **delta** where each key is a time and each value is the net active-count change at that time. To try **book(startTime,endTime)**, add **+1** at **startTime** and **-1** at **endTime**, then sweep the values in sorted key order. If the active count ever exceeds two, undo the two delta changes and reject. Otherwise keep the changes.\n\n**Interval walkthrough**\n\nAccept **book([10,20])** by storing deltas **10:+1, 20:-1**. Accept **book([10,40])** by updating to **10:+2, 20:-1, 40:-1**; the sweep reaches active count two on **[10,20)** and one on **[20,40)**. Now try **book([5,15])**. Tentative deltas become **5:+1, 10:+2, 15:-1, 20:-1, 40:-1**. Sweeping gives active one after time 5, then active three after time 10, so **[10,15)** would be triple-booked. Roll back **5:+1** and **15:-1**, leaving the previous valid map unchanged.\n\n**Algorithm**\n\n1. Store boundary changes in a sorted **TreeMap** from time to net delta.\n2. For each **book**, tentatively add **+1** at **startTime** and **-1** at **endTime**.\n3. Sweep **delta.values()** in key order while maintaining **active**.\n4. If **active > 2**, undo the tentative start and end changes and return **false**.\n5. If the sweep completes, keep the changes and return **true**.\n6. Remove a boundary key whenever its net delta becomes zero so the map stays compact.",
    solutions: [
      {
        name: "TreeMap boundary-count sweep",
        whenToUseMD:
          "Use this when the maximum allowed overlap is small and the number of calls is modest, but the time range is too large for an array of points.",
        approachMD:
          "Each booking contributes a start delta and an end delta. The sorted **TreeMap** lets the implementation replay the sweep line after a tentative update. If any prefix sum reaches three, the update is invalid and is rolled back immediately.",
        walkthroughMD:
          "1. Maintain **delta**, a **TreeMap** from boundary time to net active-count change.\n2. On **book(startTime,endTime)**, add **+1** at the start and **-1** at the end.\n3. Walk the deltas in increasing time order, accumulating the active booking count.\n4. If the count exceeds two, apply the inverse changes to rollback the tentative booking.\n5. Return **false** after rollback, or **true** if every prefix sum stayed at most two.",
        complexity: {
          time: "O(n) per book, with O(log n) TreeMap updates",
          space: "O(n)",
          note: "n is the number of stored boundary times. The tentative add and rollback are logarithmic; validating overlap depth requires sweeping the ordered boundaries.",
        },
        filename: "MyCalendarTwo.java",
        code: `import java.util.*;

class MyCalendarTwo {
    private final TreeMap<Integer, Integer> delta = new TreeMap<>();

    public MyCalendarTwo() {}

    public boolean book(int startTime, int endTime) {
        addDelta(startTime, 1);
        addDelta(endTime, -1);

        int active = 0;
        for (int change : delta.values()) {
            active += change;
            if (active > 2) {
                addDelta(startTime, -1);
                addDelta(endTime, 1);
                return false;
            }
        }

        return true;
    }

    private void addDelta(int time, int change) {
        int next = delta.getOrDefault(time, 0) + change;
        if (next == 0) {
            delta.remove(time);
        } else {
            delta.put(time, next);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Sequence of calls: **book([10,20])**, **book([10,40])**, **book([5,15])**, **book([20,30])**. The map stores boundary deltas.",
      columns: ["call", "tentative delta map", "maximum active count", "result"],
      rows: [
        ["book([10,20])", "{10:+1, 20:-1}", "1", "true"],
        ["book([10,40])", "{10:+2, 20:-1, 40:-1}", "2", "true"],
        ["book([5,15])", "{5:+1, 10:+2, 15:-1, 20:-1, 40:-1}", "3 on [10,15), rollback", "false"],
        ["book([20,30])", "{10:+2, 30:-1, 40:-1}", "2", "true"],
      ],
      narrativeMD: "The rejected call never remains in the map. The accepted **book([20,30])** starts exactly when **[10,20)** ends, so the combined delta at time 20 cancels out and does not create a triple booking.",
    },
    interviewTipsMD:
      "Frame the solution as a sweep line over boundary events, not as checking individual times. The active count only changes at starts and ends, so those are the only positions that need validation. Be explicit about rollback: a design method must leave the object exactly as it was when the operation returns **false**.",
    followUps: [
      "How would you generalize this design to reject overlap depth greater than **k**?",
      "How would you optimize booking validation for a much larger number of calls?",
      "How would you return the first triple-booked interval instead of **false**?",
      "How would cancellation change the boundary-count representation?",
    ],
    similarProblems: [
      { title: "My Calendar I", difficulty: "Medium", slug: "iv-my-calendar-i", note: "The single-overlap version that only needs predecessor and successor checks." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "iv-meeting-rooms-ii", note: "Computes maximum overlap depth offline with the same sweep-line idea." },
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", slug: "iv-minimum-arrows-burst-balloons", note: "Another interval problem where endpoints and overlap semantics drive the greedy decision." },
      { title: "Range Module", difficulty: "Hard", url: "https://leetcode.com/problems/range-module/", note: "A harder ordered-interval design with multiple update and query operations." },
    ],
    keyTakeaways: [
      "Double booking is allowed, so the question is overlap depth, not existence of overlap.",
      "Boundary deltas compress huge time ranges into the only times where active count changes.",
      "A tentative mutation plus rollback is a clean design pattern for validating state changes.",
      "Half-open endpoints are handled naturally by adding **-1** at the end boundary.",
    ],
    pattern:
      "Boundary-count sweep: record start and end deltas in sorted order, scan prefix sums to validate overlap depth, and rollback failed tentative updates.",
  },
  {
    kind: "problem",
    slug: "iv-data-stream-disjoint-intervals",
    moduleId: "intervals-advanced",
    order: 16,
    title: "Data Stream as Disjoint Intervals",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/data-stream-as-disjoint-intervals/",
    tags: ["Intervals", "Design", "TreeMap", "Data Stream", "Ordered Set"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 35,
    statementMD:
      "Design a **SummaryRanges** data structure that receives non-negative integers from a data stream. **addNum(value)** inserts one value. **getIntervals()** returns the current disjoint intervals covering all inserted values, sorted by start time.",
    constraints: [
      "0 <= value <= 10^4",
      "At most 3 * 10^4 calls will be made to addNum and getIntervals",
      "The output intervals must be disjoint and sorted by start",
    ],
    inputMD: "A constructor call **SummaryRanges()** followed by a sequence of **addNum(value)** and **getIntervals()** calls.",
    outputMD: "For the constructor and **addNum**, output **null**. For **getIntervals**, output a two-dimensional array of disjoint intervals sorted by start.",
    examples: [
      {
        input: "operations = [SummaryRanges, addNum, getIntervals, addNum, getIntervals, addNum, getIntervals, addNum, getIntervals, addNum, getIntervals], arguments = [[], [1], [], [3], [], [7], [], [2], [], [6], []]",
        output: "[null, null, [[1,1]], null, [[1,1],[3,3]], null, [[1,1],[3,3],[7,7]], null, [[1,3],[7,7]], null, [[1,3],[6,7]]]",
        explanation: "Adding 2 bridges [1,1] and [3,3] into [1,3]. Adding 6 extends left into [7,7], producing [6,7].",
      },
      {
        input: "operations = [SummaryRanges, addNum, addNum, addNum, getIntervals, addNum, getIntervals], arguments = [[], [5], [5], [4], [], [6], []]",
        output: "[null, null, null, null, [[4,5]], null, [[4,6]]]",
        explanation: "The duplicate 5 changes nothing. Adding 4 merges with the right-adjacent [5,5], and adding 6 extends the interval to [4,6].",
      },
    ],
    learningObjectives: [
      "Maintain a dynamic set of disjoint intervals as individual values arrive.",
      "Use **TreeMap** predecessor and successor entries to detect containment and adjacency.",
      "Coalesce left and right neighbours when a new value bridges two intervals.",
      "Return intervals in sorted order directly from the ordered map.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe data stream signal means values arrive online, so sorting all values and rebuilding intervals after every insertion is wasteful. The interval signal means the stored state should be compressed: contiguous values become one **[start,end]** range, and the ranges must stay disjoint.\n\nA **TreeMap** keyed by interval start gives exactly the neighbour queries needed for insertion. For a new **value**, the floor entry tells whether the value is already covered or touches the interval on the left. The ceiling entry tells whether it touches the interval on the right. Those two neighbours are the only intervals that can merge with a single inserted value.",
    commonMistakes: [
      "Storing every value in a set and rebuilding all intervals on each **getIntervals()** call.",
      "Forgetting to ignore a duplicate value already covered by the floor interval.",
      "Extending the left interval but failing to merge the right interval when the value bridges both sides.",
      "Returning intervals in insertion order instead of sorted start order.",
    ],
    algorithmMD:
      "**Key idea**\n\nStore disjoint intervals in a **TreeMap** as **start -> end**. On **addNum(value)**, first check the floor interval. If its end is at least **value**, the value is already covered. Otherwise, the value may be adjacent to the floor interval, adjacent to the ceiling interval, both, or neither. Remove any adjacent neighbours and insert the coalesced interval.\n\n**Interval walkthrough**\n\nStart empty. After **addNum(1)**, store **{1 -> 1}**. After **addNum(3)**, the value is not adjacent to the left interval because **1 + 1 != 3**, so store **{1 -> 1, 3 -> 3}**. Now **addNum(2)** sees floor **[1,1]** and ceiling **[3,3]**. Since **1 + 1 == 2** and **3 == 2 + 1**, the new value bridges both neighbours. Remove starts 1 and 3, then insert **1 -> 3**. Later **addNum(7)** creates **{1 -> 3, 7 -> 7}**, and **addNum(6)** merges with the right neighbour into **{1 -> 3, 6 -> 7}**.\n\n**Algorithm**\n\n1. Keep a **TreeMap** named **intervals** from start to end.\n2. For **addNum(value)**, read **left = intervals.floorEntry(value)**.\n3. If **left** exists and **left.end >= value**, the value is already covered, so return.\n4. Read **right = intervals.ceilingEntry(value)**.\n5. Start a new interval **[value,value]**.\n6. If **left.end + 1 == value**, merge left by using **left.start** as the new start and removing the old left interval.\n7. If **right.start == value + 1**, merge right by using **right.end** as the new end and removing the old right interval.\n8. Insert the final coalesced interval.\n9. For **getIntervals()**, iterate over **intervals.entrySet()** in order and copy each pair into the result array.",
    solutions: [
      {
        name: "TreeMap coalescing intervals",
        whenToUseMD:
          "Use this when inserts are online and the output must remain a compact sorted set of disjoint intervals.",
        approachMD:
          "The **TreeMap** stores only interval boundaries, not every inserted value. Each insertion consults the immediate left and right intervals, because a single value can only connect to neighbours ending at **value - 1** or starting at **value + 1**.",
        walkthroughMD:
          "1. Find the floor entry for **value** to detect duplicates or left adjacency.\n2. If the floor interval already covers **value**, return without changing state.\n3. Find the ceiling entry for possible right adjacency.\n4. Begin with the singleton interval **[value,value]**.\n5. If the left interval ends at **value - 1**, remove it and reuse its start.\n6. If the right interval starts at **value + 1**, remove it and reuse its end.\n7. Insert the merged interval and let **getIntervals()** iterate the map in sorted order.",
        complexity: {
          time: "addNum: O(log n), getIntervals: O(n)",
          space: "O(n)",
          note: "n is the number of disjoint intervals. Each insertion performs constant many **TreeMap** neighbour queries, removals, and one insert.",
        },
        filename: "SummaryRanges.java",
        code: `import java.util.*;

class SummaryRanges {
    private final TreeMap<Integer, Integer> intervals = new TreeMap<>();

    public SummaryRanges() {}

    public void addNum(int value) {
        Map.Entry<Integer, Integer> left = intervals.floorEntry(value);
        if (left != null && left.getValue() >= value) {
            return;
        }

        Map.Entry<Integer, Integer> right = intervals.ceilingEntry(value);
        int start = value;
        int end = value;

        if (left != null && left.getValue() + 1 == value) {
            start = left.getKey();
            intervals.remove(left.getKey());
        }

        if (right != null && right.getKey() == value + 1) {
            end = right.getValue();
            intervals.remove(right.getKey());
        }

        intervals.put(start, end);
    }

    public int[][] getIntervals() {
        int[][] result = new int[intervals.size()][2];
        int index = 0;

        for (Map.Entry<Integer, Integer> interval : intervals.entrySet()) {
            result[index][0] = interval.getKey();
            result[index][1] = interval.getValue();
            index++;
        }

        return result;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Sequence of calls: **addNum(1)**, **addNum(3)**, **addNum(7)**, **addNum(2)**, **getIntervals()**, **addNum(6)**, **getIntervals()**.",
      columns: ["call", "TreeMap before", "merge decision", "output or state"],
      rows: [
        ["addNum(1)", "{}", "no neighbours, insert singleton", "{1 -> 1}"],
        ["addNum(3)", "{1 -> 1}", "not adjacent to left, insert singleton", "{1 -> 1, 3 -> 3}"],
        ["addNum(7)", "{1 -> 1, 3 -> 3}", "no adjacent neighbours, insert singleton", "{1 -> 1, 3 -> 3, 7 -> 7}"],
        ["addNum(2)", "{1 -> 1, 3 -> 3, 7 -> 7}", "bridges [1,1] and [3,3]", "{1 -> 3, 7 -> 7}"],
        ["getIntervals()", "{1 -> 3, 7 -> 7}", "iterate in start order", "[[1,3],[7,7]]"],
        ["addNum(6)", "{1 -> 3, 7 -> 7}", "touches right interval [7,7]", "{1 -> 3, 6 -> 7}"],
        ["getIntervals()", "{1 -> 3, 6 -> 7}", "iterate in start order", "[[1,3],[6,7]]"],
      ],
      narrativeMD: "The inserted value can merge with at most two intervals: the one immediately to its left and the one immediately to its right. That is why a **TreeMap** neighbour query is enough to keep the whole summary compact.",
    },
    interviewTipsMD:
      "Make the invariant explicit: intervals in the map are always disjoint, sorted by start, and never adjacent after insertion, because adjacent intervals are immediately coalesced. When coding, handle duplicate containment before adjacency; otherwise adding a value already inside an interval can accidentally split or duplicate state.",
    followUps: [
      "How would you support removing a number from the stream summary?",
      "How would the design change if intervals were over long values instead of int values?",
      "How would you optimize **getIntervals()** if it is called far more often than **addNum()**?",
      "How would you make the structure safe for concurrent inserts and reads?",
    ],
    similarProblems: [
      { title: "Insert Interval", difficulty: "Medium", slug: "iv-insert-interval", note: "The offline version of inserting one interval into a sorted disjoint list." },
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "Builds the same disjoint interval representation from a batch of ranges." },
      { title: "My Calendar I", difficulty: "Medium", slug: "iv-my-calendar-i", note: "Also stores disjoint intervals in an ordered map and relies on neighbour checks." },
      { title: "Range Module", difficulty: "Hard", url: "https://leetcode.com/problems/range-module/", note: "Extends ordered disjoint intervals with range add, query, and remove." },
      { title: "Number of Recent Calls", difficulty: "Easy", url: "https://leetcode.com/problems/number-of-recent-calls/", note: "Another data-stream design where old and new values must be summarized over time." },
    ],
    keyTakeaways: [
      "A stream of values can be compressed into disjoint intervals instead of stored as isolated points.",
      "The floor interval detects duplicates and left adjacency.",
      "The ceiling interval detects right adjacency.",
      "A single inserted value can only merge with its immediate neighbours.",
    ],
    pattern:
      "Dynamic interval coalescing: store disjoint ranges by start, use predecessor and successor to find containment or adjacency, then replace neighbours with one merged interval.",
  },
];
