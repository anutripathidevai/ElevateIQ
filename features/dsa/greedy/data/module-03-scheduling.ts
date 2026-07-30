import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "greedy-meeting-rooms",
    moduleId: "greedy-scheduling",
    order: 11,
    title: "Meeting Rooms",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/meeting-rooms/",
    tags: ["Greedy", "Intervals", "Sorting", "Scheduling"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 12,
    statementMD:
      "You are given an array **intervals** where **intervals[i] = [start_i, end_i]** represents one meeting. Determine whether a single person can attend every meeting.\n\nA meeting that ends at time **t** frees the person immediately, so another meeting may start at exactly **t** without overlapping.",
    constraints: [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i < end_i <= 10^6",
    ],
    inputMD: "An array **intervals** of meeting time ranges, where each range is **[start_i, end_i]**.",
    outputMD: "A boolean: **true** if no two meetings overlap, otherwise **false**.",
    examples: [
      { input: "intervals = [[0,30],[5,10],[15,20]]", output: "false", explanation: "The meeting from 5 to 10 starts before the meeting from 0 to 30 ends, so one person cannot attend both." },
      { input: "intervals = [[7,10],[2,4]]", output: "true", explanation: "After sorting by start time, the first meeting ends at 4 and the next starts at 7, so there is no overlap." },
      { input: "intervals = [[1,5],[5,8]]", output: "true", explanation: "The first meeting ends exactly when the second begins, which is allowed because the person is free at time 5." },
    ],
    learningObjectives: [
      "Recognise when chronological sorting turns interval overlap checks into adjacent comparisons.",
      "Explain why sorting by start time is the correct greedy ordering for feasibility.",
      "Handle the boundary case where one meeting ends exactly when another starts.",
      "Separate interval feasibility from interval selection problems that optimise a count.",
    ],
    intuitionMD:
      "**Greedy Insight:** Put the meetings in the order the person would experience them: increasing start time. Once meetings are sorted this way, any conflict must appear between a meeting and the meeting immediately before it in the sorted order.\n\nThe useful tracked value is the previous meeting end time. If the current start is before that end, the current meeting begins while the previous one is still running, so attendance is impossible. If every current start is at least the previous end, the person can walk through the whole calendar.\n\nThe wrong sort key trap is to sort by duration, by original input order, or by end time because those orders do not represent the actual chronological sequence of commitments. Earliest end is powerful when choosing the maximum number of compatible intervals, but for simply verifying one calendar, start time is the natural order.",
    commonMistakes: [
      "Checking only the input order and missing overlaps after a later interval starts earlier.",
      "Treating **start == previousEnd** as an overlap even though back-to-back meetings are allowed.",
      "Sorting by interval length, which has no relationship to calendar feasibility.",
      "Comparing the current meeting against every previous meeting instead of using the sorted adjacent property.",
    ],
    algorithmMD:
      "**Greedy strategy**\nSort meetings by increasing start time and scan once, comparing each meeting with the meeting that starts immediately before it.\n\n**Why it works**\nAfter sorting by start time, every future meeting starts no earlier than the current meeting. If the current meeting does not overlap the immediately previous one, then it cannot overlap any earlier meeting whose end has already been verified to finish before the previous start chain.\n\n**Proof of correctness**\nConsider the meetings in sorted start-time order. If the algorithm finds a pair where **currentStart < previousEnd**, those two real meetings overlap in time, so no valid single-person schedule exists.\n\nNow suppose the algorithm finishes without finding such a pair. For any earlier meeting **i** and later meeting **j**, the consecutive checks give **end_i <= start_{i + 1}**, and sorted starts give **start_{i + 1} <= start_j**. Therefore **end_i <= start_j**, so meeting **i** cannot overlap meeting **j**. Every pair is non-overlapping, so the person can attend all meetings.\n\nThis is an exchange argument in miniature: any valid calendar can be rewritten in chronological start order without changing the meetings. The greedy order is therefore safe because it is just the only order in which one person could actually attend them.\n\n**Algorithm**\n1. Sort **intervals** by start time.\n2. Walk from the second meeting to the end.\n3. If **intervals[i][0] < intervals[i - 1][1]**, return **false**.\n4. If the scan completes, return **true**.",
    solutions: [
      {
        name: "Sort by start time",
        approachMD:
          "Sorting creates the chronological order of the calendar. In that order, any overlap must be visible between neighbouring intervals, so one linear scan is enough.",
        walkthroughMD:
          "1. Sort all meetings by their start time.\n2. Start at index **1** because the first meeting has no previous meeting to conflict with.\n3. Compare the current start with the previous end.\n4. Return **false** immediately on an overlap; otherwise return **true** after all comparisons pass.",
        complexity: { time: "O(n log n)", space: "O(1)", note: "Sorting dominates the runtime; the scan is linear. Java may use stack space internally for sorting." },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public boolean canAttendMeetings(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        for (int index = 1; index < intervals.length; index++) {
            if (intervals[index][0] < intervals[index - 1][1]) {
                return false;
            }
        }

        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = [[0,30],[5,10],[15,20]]. After sorting by start time, the order is unchanged.",
      columns: ["current meeting", "previous end", "current start", "overlap?", "decision"],
      rows: [
        ["[0,30]", "none", "0", "no", "set previous end to 30"],
        ["[5,10]", "30", "5", "yes", "return false"],
      ],
      narrativeMD: "The scan stops as soon as **5 < 30**. The second meeting starts while the first is still running, so a single person cannot attend every meeting.",
    },
    interviewTipsMD:
      "Lead with the invariant: after sorting by start time, all meetings already checked form a non-overlapping prefix. Then the next meeting only needs to be compared with the previous meeting in that prefix. Also call out the equality case; many interviewers include back-to-back meetings to test boundary handling.",
    followUps: [
      "How would you return the first conflicting pair instead of a boolean?",
      "How would the answer change if a cleanup buffer of **k** minutes were required between meetings?",
      "What if you receive meetings as a stream rather than all at once?",
      "How would you solve the version that asks for the minimum number of rooms?",
    ],
    similarProblems: [
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "greedy-meeting-rooms-ii", note: "Extends feasibility to counting concurrent rooms." },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "greedy-non-overlapping-intervals", note: "Uses interval ordering to remove the fewest conflicting intervals." },
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", slug: "greedy-minimum-arrows-burst-balloons", note: "Another interval overlap problem where the chosen sort key matters." },
      { title: "Employee Free Time", difficulty: "Hard", url: "https://leetcode.com/problems/employee-free-time/", note: "Merges multiple calendars and asks for common gaps." },
    ],
    keyTakeaways: [
      "For one-person calendar feasibility, sort intervals by start time.",
      "After chronological sorting, only adjacent meetings need to be compared.",
      "A meeting starting exactly at the previous end is not an overlap.",
      "Do not confuse feasibility checking with maximum compatible interval selection.",
    ],
    pattern:
      "Chronological interval feasibility: sort by start, scan adjacent intervals, and reject the first current start that occurs before the previous end.",
  },
  {
    kind: "problem",
    slug: "greedy-meeting-rooms-ii",
    moduleId: "greedy-scheduling",
    order: 12,
    title: "Meeting Rooms II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/meeting-rooms-ii/",
    tags: ["Greedy", "Intervals", "Sorting", "Heap", "Sweep Line"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg", "Uber"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an array **intervals** where **intervals[i] = [start_i, end_i]** represents one meeting. Return the minimum number of conference rooms required so every meeting can be held.\n\nIf a meeting ends at time **t**, another meeting starting at time **t** may reuse the same room.",
    constraints: [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i < end_i <= 10^6",
    ],
    inputMD: "An array **intervals** of meeting time ranges.",
    outputMD: "An integer: the minimum number of rooms needed to schedule all meetings without room conflicts.",
    examples: [
      { input: "intervals = [[0,30],[5,10],[15,20]]", output: "2", explanation: "The long meeting from 0 to 30 overlaps with both shorter meetings, but the shorter meetings do not overlap with each other, so two rooms are enough." },
      { input: "intervals = [[7,10],[2,4]]", output: "1", explanation: "The first chronological meeting ends at 4 and the next starts at 7, so one room can be reused." },
      { input: "intervals = [[1,5],[5,8],[6,9]]", output: "2", explanation: "The meeting starting at 5 can reuse the first room, but the meeting starting at 6 overlaps with the 5 to 8 meeting." },
    ],
    learningObjectives: [
      "Use a min-heap to track the earliest room that becomes available.",
      "Explain why the maximum number of simultaneous meetings equals the minimum room count.",
      "Recognise the equivalent sweep-line formulation using sorted starts and ends.",
      "Handle the reuse boundary where **end <= start** means the room is free.",
    ],
    intuitionMD:
      "**Greedy Insight:** Process meetings by increasing start time. When a new meeting begins, the only room that matters first is the one that ends earliest. If even that room is still occupied, every other occupied room ends no earlier, so a new room is unavoidable.\n\nThe min-heap stores room end times, with the earliest-finishing room at the top. Reusing that room is safe because it frees the most constrained resource first. If it cannot be reused, no currently allocated room can be reused for this meeting.\n\nThe wrong sort key trap is to sort by end time and assign rooms from there, or to keep the latest-ending room at the top. Scheduling decisions are triggered by starts, but resource reuse is determined by the earliest end. This start-time scan plus earliest-end heap is the greedy pairing that makes the solution work.",
    commonMistakes: [
      "Using a max-heap of end times, which hides the room most likely to be reusable.",
      "Treating **end == start** as a conflict and allocating an unnecessary room.",
      "Returning the number of currently active meetings after a sweep without tracking the maximum.",
      "Sorting by end time first, which processes meetings before their room demand actually occurs.",
    ],
    algorithmMD:
      "**Greedy strategy**\nSort meetings by start time. Maintain a min-heap of room end times. For each meeting, reuse the earliest-ending room if it has already ended; otherwise allocate a new room.\n\n**Why it works**\nAt the current start time, the heap top is the room that becomes free first. If that end time is greater than the current start, then all other room end times are also greater, so every existing room is occupied and a new room is necessary. If the top is at most the current start, reusing it preserves the room count and keeps the allocation feasible.\n\n**Proof of correctness**\nConsider any step where the greedy algorithm processes the next meeting in start-time order. If the earliest room end is after this meeting starts, no schedule using the already allocated rooms can place this meeting in one of them, because every room ends no earlier than the heap top. Adding a room is therefore forced in every optimal schedule.\n\nIf the earliest room end is at or before the current start, greedy reuses that room. Take an optimal schedule that reuses some available room for this meeting. If it is not the earliest-ending room, swap the current meeting into the earliest-ending room instead. That room was already free, and the room originally used remains free as well, so no later meeting loses feasibility and the number of rooms does not increase. Repeating this exchange makes the optimal schedule match the greedy choices.\n\n**Algorithm**\n1. Sort **intervals** by start time.\n2. Create a min-heap containing end times of allocated rooms.\n3. For each meeting, if the smallest end time is **<= start**, remove it because that room can be reused.\n4. Add the current meeting end time to the heap.\n5. The heap size after all meetings is the number of rooms allocated.",
    solutions: [
      {
        name: "Min-heap of room end times",
        approachMD:
          "The heap represents allocated rooms by their next available time. For each chronological meeting, the earliest available room either can host it or proves that no existing room can.",
        walkthroughMD:
          "1. Sort meetings by start time.\n2. For each meeting, check the smallest end time in the heap.\n3. If that end time is **<= currentStart**, poll it and reuse that room.\n4. Push the current end time because the chosen room is now occupied until that end.\n5. Return the heap size, which is the total number of rooms that had to be allocated.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting costs O(n log n), and each meeting performs at most one heap insertion and one heap removal." },
        filename: "Solution.java",
        code: `import java.util.Arrays;
import java.util.PriorityQueue;

class Solution {

    public int minMeetingRooms(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> endTimes = new PriorityQueue<>();

        for (int[] meeting : intervals) {
            if (!endTimes.isEmpty() && endTimes.peek() <= meeting[0]) {
                endTimes.poll();
            }
            endTimes.offer(meeting[1]);
        }

        return endTimes.size();
    }
}`,
      },
      {
        name: "Chronological sweep with starts and ends",
        whenToUseMD:
          "Use this version when you want to emphasise that the answer is the peak number of active meetings. It avoids a heap by sorting start times and end times separately.",
        approachMD:
          "Separate all starts and ends, then sweep starts from earliest to latest. Before counting a new meeting, release every room whose end time is at most that start. The maximum active count seen during the sweep is the room requirement.",
        walkthroughMD:
          "1. Copy starts into one array and ends into another.\n2. Sort both arrays.\n3. For each start time, advance the end pointer while meetings have ended.\n4. Add the current meeting to the active room count and update the maximum.\n5. Return the maximum active count.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Two arrays are sorted, then swept linearly." },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int minMeetingRooms(int[][] intervals) {
        int n = intervals.length;
        int[] starts = new int[n];
        int[] ends = new int[n];

        for (int index = 0; index < n; index++) {
            starts[index] = intervals[index][0];
            ends[index] = intervals[index][1];
        }

        Arrays.sort(starts);
        Arrays.sort(ends);

        int activeRooms = 0;
        int maxRooms = 0;
        int endIndex = 0;

        for (int start : starts) {
            while (endIndex < n && ends[endIndex] <= start) {
                activeRooms--;
                endIndex++;
            }

            activeRooms++;
            maxRooms = Math.max(maxRooms, activeRooms);
        }

        return maxRooms;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = [[0,30],[5,10],[15,20]]. Sort by start time and track the min-heap of room end times.",
      columns: ["meeting", "heap before", "action", "heap after", "rooms so far"],
      rows: [
        ["[0,30]", "[]", "allocate a new room", "[30]", "1"],
        ["[5,10]", "[30]", "30 > 5, allocate a new room", "[10,30]", "2"],
        ["[15,20]", "[10,30]", "10 <= 15, reuse that room", "[20,30]", "2"],
      ],
      narrativeMD: "The heap size never exceeds **2**, and the final heap also contains two room end times. Therefore two rooms are necessary and sufficient.",
    },
    interviewTipsMD:
      "State the lower bound first: if **k** meetings overlap at one instant, at least **k** rooms are required. Then show the greedy heap achieves exactly that by reusing the earliest-ending room whenever possible. If the interviewer prefers sweep line, pivot to sorted starts and ends; it is the same active-count idea without explicitly naming rooms.",
    followUps: [
      "How would you return the actual room assignment for each meeting?",
      "How would you handle a required cleanup buffer between meetings?",
      "How would the solution change if meetings arrived online and could not be sorted first?",
      "Can you solve it with sorted start and end arrays instead of a heap?",
    ],
    similarProblems: [
      { title: "Meeting Rooms", difficulty: "Easy", slug: "greedy-meeting-rooms", note: "The one-room feasibility version of this problem." },
      { title: "Maximum Number of Events That Can Be Attended", difficulty: "Medium", slug: "greedy-maximum-events-attended", note: "Also uses a min-heap keyed by the earliest finishing deadline." },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "greedy-non-overlapping-intervals", note: "Optimises interval compatibility with a different greedy key." },
      { title: "Car Pooling", difficulty: "Medium", url: "https://leetcode.com/problems/car-pooling/", note: "A sweep-line capacity problem over time." },
      { title: "Employee Free Time", difficulty: "Hard", url: "https://leetcode.com/problems/employee-free-time/", note: "Calendar merging with multiple schedules." },
    ],
    keyTakeaways: [
      "Minimum rooms equals the maximum number of simultaneous meetings.",
      "Process meetings by start time, but choose rooms by earliest end time.",
      "A min-heap answers whether any allocated room can be reused now.",
      "Sorted starts and ends provide an equivalent sweep-line solution.",
    ],
    pattern:
      "Resource scheduling with reuse: sort requests by start time, keep the earliest finishing resource in a min-heap, and allocate only when that resource is still busy.",
  },
  {
    kind: "problem",
    slug: "greedy-task-scheduler",
    moduleId: "greedy-scheduling",
    order: 13,
    title: "Task Scheduler",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/task-scheduler/",
    tags: ["Greedy", "Counting", "Scheduling", "Heap", "Math"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an array **tasks** of uppercase letters and an integer **n**. Each CPU interval can execute one task or stay idle. Identical tasks must be separated by at least **n** intervals.\n\nReturn the least number of intervals needed to finish all tasks.",
    constraints: [
      "1 <= tasks.length <= 10^4",
      "tasks[i] is an uppercase English letter",
      "0 <= n <= 100",
    ],
    inputMD: "A character array **tasks** and a non-negative cooldown **n**.",
    outputMD: "An integer: the minimum CPU intervals needed, including idle intervals if they are unavoidable.",
    examples: [
      { input: "tasks = [A,A,A,B,B,B], n = 2", output: "8", explanation: "One optimal schedule is A, B, idle, A, B, idle, A, B. The two idle intervals are forced by the cooldown between identical tasks." },
      { input: "tasks = [A,A,A,B,B,B], n = 0", output: "6", explanation: "With no cooldown, all six tasks can run back-to-back in any order." },
      { input: "tasks = [A,A,A,A,B,B,C,C], n = 2", output: "10", explanation: "The four A tasks create three cooldown gaps. B and C fill some slots, but one idle interval is still needed." },
    ],
    learningObjectives: [
      "Derive the idle-slot formula from the most frequent task count.",
      "Explain why the most frequent tasks determine the minimum schedule length.",
      "Handle ties among maximum-frequency tasks correctly.",
      "Compare the formula approach with a max-heap simulation.",
    ],
    intuitionMD:
      "**Greedy Insight:** The rare tasks are flexible; the most frequent tasks are the constraint. If task **A** appears the most, its copies must be spread out with at least **n** intervals between them. Those copies create a skeleton of cooling gaps that other tasks can fill.\n\nIf several tasks tie for maximum frequency, they occupy the same final layer of the skeleton. That is why the formula adds the number of maximum-frequency tasks at the end.\n\nThe wrong sort key trap is to schedule tasks alphabetically or by original order. The optimal structure is driven by frequency, not by labels. A heap simulation follows the same greedy idea by repeatedly choosing the currently most frequent available tasks, while the formula jumps straight to the length forced by the highest frequency.",
    commonMistakes: [
      "Forgetting to count how many task types share the maximum frequency.",
      "Returning the frame length even when there are enough other tasks to fill every idle slot, where the answer should be **tasks.length**.",
      "Using **maxFrequency * (n + 1)** instead of **(maxFrequency - 1) * (n + 1)** for the repeated gaps.",
      "Treating cooldown as a delay after the final copy of a task, which is unnecessary.",
    ],
    algorithmMD:
      "**Greedy strategy**\nCount task frequencies. Let **maxFrequency** be the largest count and **maxFrequencyTasks** be how many task types have that count. Build the shortest frame forced by those most frequent tasks, then take the larger of the frame length and the total number of tasks.\n\n**Why it works**\nThe most frequent tasks create **maxFrequency - 1** full gaps before their final occurrence. Each full gap must have length **n + 1** when including the anchor task at its start. The last block contains all task types tied at the maximum frequency. Other tasks can only fill idle slots inside this skeleton; they cannot reduce the skeleton itself.\n\n**Proof of correctness**\nAny valid schedule must place the **maxFrequency** copies of a most frequent task with at least **n** intervals between consecutive copies. Therefore the schedule length is at least **(maxFrequency - 1) * (n + 1) + 1** for one such task, and if **maxFrequencyTasks** tasks tie for that count, their final copies require **maxFrequencyTasks** positions in the last block. This gives the lower bound **(maxFrequency - 1) * (n + 1) + maxFrequencyTasks**.\n\nNow take a schedule built from that frame and fill its idle slots with all remaining tasks greedily. If remaining tasks fit, the frame length is achievable. If they do not fit, then there are enough tasks to occupy every idle position and extend the schedule with no idle time, so **tasks.length** is achievable and is also a lower bound because every task must run once. Thus **max(tasks.length, frameLength)** is both necessary and sufficient.\n\nAs an exchange argument, if a schedule leaves a frame anchor for a less frequent task while a maximum-frequency task is still waiting, swap the maximum-frequency task into that anchor. The swap cannot create more cooldown pressure than before because maximum-frequency tasks are the only ones that define the widest required spacing.\n\n**Algorithm**\n1. Count frequencies for the 26 uppercase letters.\n2. Find **maxFrequency**.\n3. Count how many letters have that frequency.\n4. Compute **frameLength = (maxFrequency - 1) * (n + 1) + maxFrequencyTasks**.\n5. Return **max(tasks.length, frameLength)**.",
    solutions: [
      {
        name: "Idle-slot frequency formula",
        approachMD:
          "The formula computes the shortest schedule forced by the most frequent task types. All other tasks are filler; they either occupy idle slots or, if there are enough of them, make the answer simply the number of tasks.",
        walkthroughMD:
          "1. Count how often each uppercase task appears.\n2. Track the largest frequency.\n3. Count task types whose frequency equals that maximum.\n4. Compute the forced frame length using the most frequent tasks.\n5. Return the larger of total tasks and forced frame length.",
        complexity: { time: "O(m + 26)", space: "O(26)", note: "Here **m** is tasks.length; the alphabet size is fixed." },
        filename: "Solution.java",
        code: `class Solution {

    public int leastInterval(char[] tasks, int n) {
        int[] counts = new int[26];
        int maxFrequency = 0;

        for (char task : tasks) {
            int index = task - 'A';
            counts[index]++;
            maxFrequency = Math.max(maxFrequency, counts[index]);
        }

        int maxFrequencyTasks = 0;
        for (int count : counts) {
            if (count == maxFrequency) {
                maxFrequencyTasks++;
            }
        }

        int frameLength = (maxFrequency - 1) * (n + 1) + maxFrequencyTasks;
        return Math.max(tasks.length, frameLength);
    }
}`,
      },
      {
        name: "Max-heap cycle simulation",
        whenToUseMD:
          "Use this when an interviewer asks for the actual scheduling process or wants to see the greedy choice operationally. The formula is shorter, but the heap makes cooldown cycles explicit.",
        approachMD:
          "Store remaining task counts in a max-heap. In each cycle of length **n + 1**, run up to that many distinct task types, decrement their counts, and push unfinished tasks back after the cycle.",
        walkthroughMD:
          "1. Count each task frequency and push positive counts into a max-heap.\n2. Repeatedly open a cycle of length **n + 1**.\n3. Pop and execute the largest remaining counts, storing any unfinished counts temporarily.\n4. Push unfinished counts back after the cycle so the same task is not reused inside its cooldown window.\n5. Add either the full cycle length or the number of used slots if the heap is empty.",
        complexity: { time: "O(answer log 26)", space: "O(26 + n)", note: "The heap has at most 26 task types; **answer** includes idle intervals produced by the simulation." },
        filename: "Solution.java",
        code: `import java.util.PriorityQueue;

class Solution {

    public int leastInterval(char[] tasks, int n) {
        int[] counts = new int[26];
        for (char task : tasks) {
            counts[task - 'A']++;
        }

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));
        for (int count : counts) {
            if (count > 0) {
                maxHeap.offer(count);
            }
        }

        int time = 0;
        while (!maxHeap.isEmpty()) {
            int cycleLength = n + 1;
            int[] remaining = new int[cycleLength];
            int used = 0;

            while (used < cycleLength && !maxHeap.isEmpty()) {
                int nextCount = maxHeap.poll() - 1;
                if (nextCount > 0) {
                    remaining[used] = nextCount;
                }
                used++;
            }

            for (int index = 0; index < used; index++) {
                if (remaining[index] > 0) {
                    maxHeap.offer(remaining[index]);
                }
            }

            time += maxHeap.isEmpty() ? used : cycleLength;
        }

        return time;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "tasks = [A,A,A,B,B,B], n = 2. Frequencies are **A = 3** and **B = 3**.",
      columns: ["calculation", "value", "reason", "running answer"],
      rows: [
        ["frequencies", "A = 3, B = 3", "two task types tie for most frequent", "unknown"],
        ["maxFrequency", "3", "three copies create two full cooldown gaps", "unknown"],
        ["maxFrequencyTasks", "2", "A and B both occupy the final block", "unknown"],
        ["frameLength", "8", "(3 - 1) * (2 + 1) + 2", "8"],
        ["tasks.length", "6", "six real tasks leave two unavoidable idle slots", "max(6, 8) = 8"],
      ],
      narrativeMD: "The forced frame has length **8**, matching the schedule A, B, idle, A, B, idle, A, B. Since the total task count is only **6**, the two idle intervals cannot be eliminated.",
    },
    interviewTipsMD:
      "Present the formula as a lower-bound argument, not as a memorised trick. Say that the most frequent tasks create the skeleton, ties widen the last block, and other tasks merely fill gaps. If asked to construct a schedule, switch to the max-heap cycle simulation and explain that it chooses the currently most frequent available tasks first.",
    followUps: [
      "How would you output one valid shortest schedule, not just its length?",
      "What changes if each task type has a different cooldown?",
      "How would the solution change with multiple identical CPUs?",
      "Can you derive the same answer using a priority queue simulation?",
    ],
    similarProblems: [
      { title: "Reorganize String", difficulty: "Medium", slug: "greedy-reorganize-string", note: "Also spaces out high-frequency symbols to avoid adjacency conflicts." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "greedy-meeting-rooms-ii", note: "Another scheduling problem where simultaneous demand determines a resource count." },
      { title: "Maximum Number of Events That Can Be Attended", difficulty: "Medium", slug: "greedy-maximum-events-attended", note: "Uses deadlines to decide which available job to perform next." },
      { title: "Rearrange String k Distance Apart", difficulty: "Hard", url: "https://leetcode.com/problems/rearrange-string-k-distance-apart/", note: "The constructive version with a distance constraint between equal characters." },
    ],
    keyTakeaways: [
      "The most frequent task type determines the cooldown skeleton.",
      "Ties among maximum-frequency tasks add width to the final block.",
      "The answer is the larger of the forced frame length and the number of tasks.",
      "A max-heap simulation is useful for construction, but the formula is the expected optimal solution.",
    ],
    pattern:
      "Frequency-constrained scheduling: identify the symbols that create the tightest spacing lower bound, then fill their idle slots with all remaining work.",
  },
  {
    kind: "problem",
    slug: "greedy-maximum-events-attended",
    moduleId: "greedy-scheduling",
    order: 14,
    title: "Maximum Number of Events That Can Be Attended",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended/",
    tags: ["Greedy", "Heap", "Sorting", "Scheduling", "Intervals"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "You are given an array **events** where **events[i] = [startDay_i, endDay_i]**. You may attend an event on any one day between its start and end day, inclusive, and you may attend at most one event per day.\n\nReturn the maximum number of events you can attend.",
    constraints: [
      "1 <= events.length <= 10^5",
      "events[i].length == 2",
      "1 <= startDay_i <= endDay_i <= 10^5",
    ],
    inputMD: "An array **events** of inclusive day ranges.",
    outputMD: "An integer: the maximum number of events that can be attended.",
    examples: [
      { input: "events = [[1,2],[2,3],[3,4]]", output: "3", explanation: "Attend the first event on day 1, the second on day 2, and the third on day 3." },
      { input: "events = [[1,2],[2,3],[3,4],[1,2]]", output: "4", explanation: "Attend the two events ending on day 2 during days 1 and 2, then attend the remaining events on days 3 and 4." },
      { input: "events = [[1,1],[1,2],[1,2],[2,2]]", output: "2", explanation: "Only days 1 and 2 are available across all events, so at most two events can be attended." },
    ],
    learningObjectives: [
      "Use a day pointer to simulate only relevant calendar days.",
      "Maintain available event deadlines in a min-heap.",
      "Explain why attending the earliest-ending available event is the safe greedy choice.",
      "Remove expired events before making each daily choice.",
    ],
    intuitionMD:
      "**Greedy Insight:** On any day, several events may be available. Attend the event that ends earliest, because it has the least flexibility. Events with later end days can still survive to future days.\n\nSorting by start day is only how events enter the available set. The actual choice among available events is by earliest end day, so a min-heap of end days is the right data structure. When the heap is empty, the day pointer jumps to the next event start to avoid scanning empty calendar days.\n\nThe wrong sort key trap is to simply attend events in earliest-start order. An early-start event with a late deadline may be safely delayed, while a later-start event with an earlier deadline may expire immediately. Greedy scheduling is about the tightest deadline among currently available choices.",
    commonMistakes: [
      "Sorting by start day and attending in that order without considering end days.",
      "Keeping expired events in the heap and accidentally attending them after their end day.",
      "Incrementing the day one by one through long empty ranges instead of jumping to the next start when no events are available.",
      "Choosing the event with the longest duration, which preserves the least urgent work and loses deadlines.",
    ],
    algorithmMD:
      "**Greedy strategy**\nSort events by start day. Sweep a day pointer forward. For each day, add all events that have started to a min-heap keyed by end day, discard expired events, then attend the available event with the smallest end day.\n\n**Why it works**\nAll events in the heap can be attended today. The one ending earliest has the fewest remaining chances. Taking it today cannot hurt events with later end days because they remain available for at least as long.\n\n**Proof of correctness**\nFix a day **d** and suppose the greedy algorithm attends event **g**, the available event with the earliest end day. Consider an optimal schedule that agrees with greedy before day **d** but attends a different available event **x** on day **d**. Since **g** ends no later than **x**, event **x** is at least as flexible as **g**.\n\nIf the optimal schedule never attends **g**, replace **x** with **g** on day **d** and keep the same number of attended events. If the optimal schedule attends **g** on a later day **d2**, swap them: attend **g** on day **d** and attend **x** on day **d2**. This is feasible because **x** had already started by day **d**, so it has started by **d2**, and **x** ends no earlier than **g**, so it is still valid on **d2**. The optimal count is unchanged and now matches greedy on day **d**.\n\nBy repeating this exchange day by day, there exists an optimal schedule that makes every greedy choice. Therefore the greedy algorithm attends the maximum possible number of events.\n\n**Algorithm**\n1. Sort **events** by start day.\n2. Maintain **day**, **eventIndex**, **attended**, and a min-heap of end days.\n3. If the heap is empty, jump **day** to the next event start.\n4. Add every event whose start day is at most **day**.\n5. Remove heap end days smaller than **day** because those events expired.\n6. If the heap is non-empty, attend the event with the smallest end day, increment **attended**, and move to the next day.\n7. Continue until all events are processed and the heap is empty.",
    solutions: [
      {
        name: "Sort by start day with earliest-deadline heap",
        approachMD:
          "The sorted array feeds newly available events into a min-heap. The heap always exposes the event whose deadline is most urgent, which is the event to attend on the current day.",
        walkthroughMD:
          "1. Sort events by start day.\n2. If there are no currently available events, jump the day pointer to the next event start.\n3. Push all events that have started by the current day into the min-heap of end days.\n4. Pop expired end days that are smaller than the current day.\n5. Attend the event with the smallest end day, increment the answer, and advance one day.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Events are sorted once and each end day is pushed and popped at most once." },
        filename: "Solution.java",
        code: `import java.util.Arrays;
import java.util.PriorityQueue;

class Solution {

    public int maxEvents(int[][] events) {
        Arrays.sort(events, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> endDays = new PriorityQueue<>();
        int eventIndex = 0;
        int attended = 0;
        int day = 0;

        while (eventIndex < events.length || !endDays.isEmpty()) {
            if (endDays.isEmpty()) {
                day = Math.max(day, events[eventIndex][0]);
            }

            while (eventIndex < events.length && events[eventIndex][0] <= day) {
                endDays.offer(events[eventIndex][1]);
                eventIndex++;
            }

            while (!endDays.isEmpty() && endDays.peek() < day) {
                endDays.poll();
            }

            if (!endDays.isEmpty()) {
                endDays.poll();
                attended++;
                day++;
            }
        }

        return attended;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "events = [[1,2],[2,3],[3,4],[1,2]]. Sorted by start day: [[1,2],[1,2],[2,3],[3,4]].",
      columns: ["day", "new events added", "heap before attend", "attend end day", "count after day"],
      rows: [
        ["1", "[1,2], [1,2]", "[2,2]", "2", "1"],
        ["2", "[2,3]", "[2,3]", "2", "2"],
        ["3", "[3,4]", "[3,4]", "3", "3"],
        ["4", "none", "[4]", "4", "4"],
      ],
      narrativeMD: "Each day chooses the available event with the earliest end day. The two events ending on day **2** are handled first, preserving later deadlines for days **3** and **4**.",
    },
    interviewTipsMD:
      "Emphasise the two separate orderings: sort by start to know when events become available, then choose by end day to protect urgent deadlines. The exchange argument is the key: if an optimal schedule attends a later-ending available event today, swap in the earliest-ending event and the later-ending one remains at least as feasible afterward.",
    followUps: [
      "How would the solution change if each event had a profit and you wanted maximum profit?",
      "What if attending an event took multiple consecutive days?",
      "How would you return the actual event indices selected?",
      "Can you optimise when day values are extremely large but the number of events is modest?",
    ],
    similarProblems: [
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "greedy-meeting-rooms-ii", note: "Also combines start-time ordering with an earliest-ending heap." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "greedy-task-scheduler", note: "Another scheduling problem where the most constrained choice should be handled first." },
      { title: "Course Schedule III", difficulty: "Hard", slug: "greedy-course-schedule-iii", note: "Schedules courses by deadline while replacing expensive choices." },
      { title: "IPO", difficulty: "Hard", slug: "greedy-ipo", note: "Uses a heap over available choices after sorting by availability." },
      { title: "Maximum Profit in Job Scheduling", difficulty: "Hard", url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling/", note: "A weighted scheduling variant where greedy is no longer sufficient." },
    ],
    keyTakeaways: [
      "Sort by start day to discover events as they become available.",
      "Among available events, attend the one with the earliest end day.",
      "A min-heap of deadlines supports the greedy choice efficiently.",
      "Jump the day pointer when no event is available to avoid wasted scanning.",
    ],
    pattern:
      "Earliest-deadline scheduling: add all jobs available by the current time, discard expired jobs, and execute the available job with the smallest deadline.",
  },
];
