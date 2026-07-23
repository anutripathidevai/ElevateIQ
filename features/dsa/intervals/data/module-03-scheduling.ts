import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "iv-meeting-rooms",
    moduleId: "intervals-scheduling",
    order: 8,
    title: "Meeting Rooms",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/meeting-rooms/",
    tags: ["Intervals", "Sorting", "Greedy", "Scheduling", "Overlap"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 12,
    statementMD:
      "Given an array of meeting time intervals, determine whether one person can attend every meeting. If one meeting ends exactly when another begins, the person can attend both because there is no time overlap.",
    constraints: [
      "0 <= intervals.length <= 10^4",
      "0 <= starti < endi <= 10^6",
    ],
    inputMD: "An integer matrix **intervals**, where **intervals[i] = [starti, endi]** represents one meeting.",
    outputMD: "A boolean: **true** if all meetings can be attended, otherwise **false**.",
    examples: [
      {
        input: "intervals = [[0,30],[5,10],[15,20]]",
        output: "false",
        explanation: "The meeting **[5,10]** starts before **[0,30]** ends, so one person cannot attend both.",
      },
      {
        input: "intervals = [[7,10],[2,4]]",
        output: "true",
        explanation: "After sorting, **[2,4]** ends before **[7,10]** starts, so there is no overlap.",
      },
    ],
    learningObjectives: [
      "Recognise meeting attendance as a pure overlap-detection problem.",
      "Sort intervals by start time so any conflict appears between adjacent intervals.",
      "Apply the correct half-open meeting rule where **end <= start** is safe.",
      "Explain why a boolean scheduling question does not need a heap or room count.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **can attend all meetings**, which means the question is not asking for a schedule or a room count. It only asks whether any two intervals overlap. The trap is comparing every pair or treating a meeting that ends at time **t** as conflicting with one that starts at time **t**.\n\nSort by start time and the calendar becomes a left-to-right scan. If the current meeting starts before the previous meeting ends, those two meetings overlap and the answer is immediately **false**. If every adjacent pair is compatible, then no hidden non-adjacent conflict can survive the sorted order without creating an adjacent conflict on the way.",
    commonMistakes: [
      "Using **current start <= previous end**, which incorrectly rejects back-to-back meetings.",
      "Sorting by end time and then comparing neighbours, which does not preserve the order meetings are requested.",
      "Building a heap even though the problem only asks whether one person can attend all meetings.",
      "Continuing the scan after finding an overlap instead of returning **false** immediately.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort intervals by start time. In that order, the only meeting that can first expose a conflict with the current meeting is the one immediately before it. The overlap rule is **current start < previous end**. Equality is allowed because the previous meeting has already ended.\n\n**Interval walkthrough**\n\nUse **intervals = [[0,30],[5,10],[15,20]]**. On the number line, **[0,30]** stretches across the entire window. The next meeting **[5,10]** begins inside that occupied span because **5 < 30**. That single adjacent comparison proves the person is double-booked. For **[[2,4],[7,10]]**, the carried previous end is **4**, and the next start **7** is to the right of it, so the meetings are compatible.\n\n**Algorithm**\n\n1. Sort **intervals** by increasing start time.\n2. Start at the second interval because the first interval has no previous neighbour.\n3. Compare the current start with the previous end.\n4. If **current start < previous end**, return **false** because the meetings overlap.\n5. If the scan finishes without finding an overlap, return **true**.",
    solutions: [
      {
        name: "Sort by start and check adjacent intervals",
        whenToUseMD:
          "Use this as the canonical solution when all intervals are available up front and the question is only whether one attendee has a conflict.",
        approachMD:
          "Sort meetings by start time, then compare each meeting with the meeting immediately before it. Once starts are ordered, any overlap must be visible as an adjacent pair where the later start is still before the earlier end.",
        walkthroughMD:
          "1. Sort **intervals** by the first coordinate.\n2. Iterate from index **1** to the end.\n3. Let the previous meeting be **intervals[index - 1]** and the current meeting be **intervals[index]**.\n4. If the current start is less than the previous end, return **false**.\n5. Return **true** after all adjacent pairs pass the check.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting dominates the runtime. In Java, sorting an array with a comparator may use auxiliary storage; the scan itself uses constant extra space." },
        filename: "Solution.java",
        code: `import java.util.*;

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
      inputMD: "intervals = **[[0,30],[5,10],[15,20]]**. After sorting, the order is unchanged.",
      columns: ["step", "previous meeting", "current meeting", "decision"],
      rows: [
        ["1", "[0,30]", "[5,10]", "5 starts before 30, so return false"],
      ],
      narrativeMD: "The first adjacent comparison already finds a conflict. There is no need to inspect the remaining meeting because one overlap makes the answer **false**.",
    },
    complexityNote:
      "The expected solution is O(n log n) time for sorting and a single linear pass afterward.",
    interviewTipsMD:
      "Lead with the distinction between Meeting Rooms I and II. This problem is a boolean conflict check, so sorting plus adjacent comparisons is enough. Say the overlap rule precisely: **start < previous end** conflicts, while **start >= previous end** is safe. That equality detail is a common interviewer edge case.",
    followUps: [
      "How would you return the first conflicting pair instead of a boolean?",
      "How would the solution change if the meetings arrived one at a time online?",
      "How would you count the minimum number of rooms instead of checking one attendee?",
      "How would you handle meetings with inclusive end times where touching endpoints do overlap?",
    ],
    similarProblems: [
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "iv-meeting-rooms-ii", note: "Extends the same overlap idea from one attendee to many rooms." },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "iv-non-overlapping-intervals", note: "Also reasons about conflicts after sorting intervals." },
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "Uses the same sorted adjacency idea but merges instead of returning a boolean." },
      { title: "My Calendar I", difficulty: "Medium", slug: "iv-my-calendar-i", note: "The online booking version of detecting whether a new interval overlaps existing intervals." },
    ],
    keyTakeaways: [
      "Sort by start time before checking interval conflicts.",
      "Adjacent comparisons are enough for a boolean overlap question.",
      "**end == start** means two meetings can be attended back to back.",
      "Meeting Rooms I does not require tracking active rooms.",
    ],
    pattern:
      "Sorted adjacent-overlap check: order intervals by start time, then reject as soon as a later start falls before the previous end.",
  },
  {
    kind: "problem",
    slug: "iv-meeting-rooms-ii",
    moduleId: "intervals-scheduling",
    order: 9,
    title: "Meeting Rooms II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/meeting-rooms-ii/",
    tags: ["Intervals", "Sorting", "Greedy", "Heap", "Two Pointers"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 24,
    statementMD:
      "Given an array of meeting time intervals, return the minimum number of conference rooms required so every meeting can be held without overlap.",
    constraints: [
      "0 <= intervals.length <= 10^4",
      "0 <= starti < endi <= 10^6",
    ],
    inputMD: "An integer matrix **intervals**, where **intervals[i] = [starti, endi]** represents one meeting.",
    outputMD: "An integer: the minimum number of rooms needed to host all meetings.",
    examples: [
      {
        input: "intervals = [[0,30],[5,10],[15,20]]",
        output: "2",
        explanation: "The long meeting **[0,30]** overlaps both shorter meetings, but **[5,10]** and **[15,20]** can reuse the same second room.",
      },
      {
        input: "intervals = [[7,10],[2,4]]",
        output: "1",
        explanation: "The first meeting ends at **4**, before the next starts at **7**, so one room can be reused.",
      },
    ],
    learningObjectives: [
      "Recognise room allocation as a maximum-overlap scheduling problem.",
      "Use a min-heap of end times to find the room that becomes free earliest.",
      "Explain why sorting by start time makes room requests chronological.",
      "Compare the heap solution with the sorted starts and ends sweep.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **minimum number of rooms**, which means we need the maximum number of meetings active at the same time. The trap is checking only the last meeting assigned to a room, because the reusable room is the one that ends earliest, not necessarily the most recently seen one.\n\nSort meetings by start time so they request rooms in chronological order. A min-heap of end times keeps the earliest available room at the top. If that earliest end is still after the current start, every allocated room is busy and a new room is required. If it is at or before the current start, reuse that room by replacing its end time.",
    commonMistakes: [
      "Using a max-heap and hiding the room that frees first.",
      "Forgetting that **end <= start** allows room reuse.",
      "Returning the number of intervals instead of the maximum simultaneous overlap.",
      "Sorting by end time for the heap solution, which loses the order in which meetings request rooms.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort meetings by start time. Store one end time per allocated room in a min-heap. The heap root is the room that becomes free first. For each meeting, reuse that room when **earliest end <= current start**; otherwise allocate a new room. The largest heap size seen is the minimum number of rooms.\n\n**Interval walkthrough**\n\nUse **intervals = [[0,30],[5,10],[15,20]]**. On the number line, **[0,30]** occupies room 1, so the heap is **[30]**. Meeting **[5,10]** starts while **30** is still active, so allocate room 2 and the heap becomes **[10,30]**. Meeting **[15,20]** sees earliest end **10**, which lies before **15**. Poll **10**, reuse that room, and push **20**, leaving **[20,30]**. The heap never grows beyond **2**.\n\n**Algorithm**\n\n1. Return **0** for an empty interval list.\n2. Sort **intervals** by increasing start time.\n3. Create a min-heap of room end times.\n4. For each meeting, compare its start with the smallest end time in the heap.\n5. If the smallest end time is less than or equal to the current start, poll it because that room is free.\n6. Push the current meeting end time.\n7. Track and return the maximum heap size seen during the scan.",
    solutions: [
      {
        name: "Min-heap of room end times",
        whenToUseMD:
          "Use this as the standard interview solution because it directly models rooms becoming available over time.",
        approachMD:
          "After sorting by start time, keep a min-heap of room end times. The root is the only room that matters for reuse: if the earliest-ending room is still busy, every allocated room is busy.",
        walkthroughMD:
          "1. Handle an empty input by returning **0**.\n2. Sort meetings by start time.\n3. Maintain a min-heap containing the end time of each allocated room.\n4. Before placing the current meeting, poll the root if it ends at or before the current start.\n5. Push the current end time because the meeting now occupies a room.\n6. Update the answer with the heap size after the push.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting and heap operations dominate the runtime. The heap can hold one end time for every room in the worst case." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int minMeetingRooms(int[][] intervals) {
        if (intervals.length == 0) {
            return 0;
        }

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> endTimes = new PriorityQueue<>();
        int roomsNeeded = 0;

        for (int[] meeting : intervals) {
            if (!endTimes.isEmpty() && endTimes.peek() <= meeting[0]) {
                endTimes.poll();
            }

            endTimes.offer(meeting[1]);
            roomsNeeded = Math.max(roomsNeeded, endTimes.size());
        }

        return roomsNeeded;
    }
}`,
      },
      {
        name: "Separate sorted starts and ends sweep",
        whenToUseMD:
          "Use this when you want the cleanest maximum-overlap view and do not need to model individual rooms.",
        approachMD:
          "Sort all start times and all end times independently. Sweep starts from left to right while advancing the end pointer past meetings that have already finished. The number of active meetings after each start is the number of rooms currently needed.",
        walkthroughMD:
          "1. Copy all starts into **starts** and all ends into **ends**.\n2. Sort both arrays.\n3. Keep **endIndex** at the earliest meeting end not yet released.\n4. Before counting a new start, advance **endIndex** while **ends[endIndex] <= current start** because those rooms are free.\n5. Count the current meeting as active and update the maximum active count.\n6. Return the maximum active count as the room requirement.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "The two arrays take O(n) space. Sorting dominates; the sweep itself is linear." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int minMeetingRooms(int[][] intervals) {
        int n = intervals.length;
        if (n == 0) {
            return 0;
        }

        int[] starts = new int[n];
        int[] ends = new int[n];

        for (int index = 0; index < n; index++) {
            starts[index] = intervals[index][0];
            ends[index] = intervals[index][1];
        }

        Arrays.sort(starts);
        Arrays.sort(ends);

        int activeMeetings = 0;
        int maxRooms = 0;
        int endIndex = 0;

        for (int startIndex = 0; startIndex < n; startIndex++) {
            while (endIndex < n && ends[endIndex] <= starts[startIndex]) {
                activeMeetings--;
                endIndex++;
            }

            activeMeetings++;
            maxRooms = Math.max(maxRooms, activeMeetings);
        }

        return maxRooms;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "intervals = **[[0,30],[5,10],[15,20]]**. Heap values are room end times, shown in sorted order for readability.",
      columns: ["meeting", "heap before", "reuse check", "heap after", "rooms needed"],
      rows: [
        ["[0,30]", "[]", "no room exists", "[30]", "1"],
        ["[5,10]", "[30]", "30 > 5, allocate a new room", "[10,30]", "2"],
        ["[15,20]", "[10,30]", "10 <= 15, reuse the earliest room", "[20,30]", "2"],
      ],
      narrativeMD: "The heap reaches size **2** and never needs a third room. The root comparison captures the only room that can possibly be reused first.",
    },
    complexityNote:
      "Both optimal approaches run in O(n log n) time because sorting is required; the heap version uses O(n) room state and the sweep version uses O(n) arrays.",
    interviewTipsMD:
      "Say that the heap stores **end times**, not full intervals. That makes the comparator and reuse check obvious. Then connect the answer to maximum overlap: each time the heap grows, another room is simultaneously needed. If asked for an alternative, present the sorted starts and ends sweep as the same overlap count without explicit room objects.",
    followUps: [
      "How would you return the actual room assignment for each meeting?",
      "How would the solution change if meetings arrived online and could not be sorted first?",
      "Can you solve the boolean Meeting Rooms problem as a simpler version?",
      "How would you support cancellations after rooms have been assigned?",
    ],
    similarProblems: [
      { title: "Meeting Rooms", difficulty: "Easy", slug: "iv-meeting-rooms", note: "The boolean version only checks whether any overlap exists." },
      { title: "Employee Free Time", difficulty: "Hard", slug: "iv-employee-free-time", note: "Also turns schedules into a global view of busy and free time." },
      { title: "My Calendar II", difficulty: "Medium", slug: "iv-my-calendar-ii", note: "An online booking variant that must avoid triple overlaps." },
      { title: "Task Scheduler", difficulty: "Medium", url: "https://leetcode.com/problems/task-scheduler/", note: "Another scheduling problem where the active resource pressure determines the answer." },
    ],
    keyTakeaways: [
      "The answer is the maximum number of overlapping meetings.",
      "A min-heap exposes the room that frees earliest.",
      "If the earliest room is still busy, all allocated rooms are busy.",
      "Separate sorted starts and ends provide a second optimal overlap-counting view.",
    ],
    pattern:
      "Greedy resource scheduling: process intervals by start time, release resources whose end time has passed, and track the maximum simultaneous resources in use.",
  },
  {
    kind: "problem",
    slug: "iv-employee-free-time",
    moduleId: "intervals-scheduling",
    order: 10,
    title: "Employee Free Time",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/employee-free-time/",
    tags: ["Intervals", "Sorting", "Merge", "Greedy", "Scheduling"],
    companies: ["Airbnb", "Amazon", "Google", "Microsoft", "Meta"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 32,
    statementMD:
      "You are given each employee's schedule as a list of non-overlapping busy intervals. Return all finite intervals during which every employee is free.",
    constraints: [
      "1 <= schedule.length <= 50",
      "1 <= schedule[i].length <= 50",
      "0 <= interval.start < interval.end <= 10^8",
      "Each employee schedule is sorted and non-overlapping",
    ],
    inputMD: "A list **schedule**, where **schedule[i]** is the sorted busy schedule for employee **i**.",
    outputMD: "A list of finite intervals where all employees are free.",
    examples: [
      {
        input: "schedule = [[[1,2],[5,6]],[[1,3]],[[4,10]]]",
        output: "[[3,4]]",
        explanation: "The merged busy time is **[1,3]** and **[4,10]**. The only finite gap between those busy blocks is **[3,4]**.",
      },
      {
        input: "schedule = [[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]]",
        output: "[[5,6],[7,9]]",
        explanation: "Flattening and merging all busy intervals gives **[1,5]**, **[6,7]**, and **[9,12]**. The gaps are **[5,6]** and **[7,9]**.",
      },
    ],
    learningObjectives: [
      "Invert the question from common free time to the union of busy time.",
      "Flatten multiple employee schedules into one global interval list.",
      "Merge overlapping busy intervals before looking for free gaps.",
      "Exclude unbounded time before the first busy block and after the last busy block.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **free for every employee**. The tempting but messy route is to compute each person's free intervals and intersect them. The cleaner route is the inverse: if anyone is busy, the group is not free. So first build the global union of all busy intervals.\n\nOnce all busy intervals are flattened and sorted by start time, the problem becomes Merge Intervals with one extra observation. Every gap between two merged busy blocks is common free time. Touching blocks such as **[1,3]** and **[3,5]** do not create free time because the gap length is zero.",
    commonMistakes: [
      "Returning free time for one employee instead of time free for every employee.",
      "Looking for gaps before merging busy intervals, which creates false free windows inside someone else's meeting.",
      "Treating touching busy intervals as a positive-length free interval.",
      "Adding time before the first busy interval or after the last busy interval even though the problem asks for finite common free time.",
    ],
    algorithmMD:
      "**Key idea**\n\nFlatten every employee's busy intervals into one list, sort that list by start time, and merge it as the union of busy time. Whenever the next busy interval starts after the current merged busy end, the gap **[current end, next start]** is free for everyone. Then begin a new busy block from that next interval.\n\n**Interval walkthrough**\n\nUse **schedule = [[[1,2],[5,6]],[[1,3]],[[4,10]]]**. Flattened and sorted, the busy intervals are **[1,2]**, **[1,3]**, **[4,10]**, **[5,6]**. Carry busy block **[1,2]**. Seeing **[1,3]** overlaps it, so extend the block to **[1,3]**. Seeing **[4,10]** starts after **3**, so the number line has a free gap **[3,4]**. Start the next busy block as **[4,10]**. Finally **[5,6]** lies inside that block, so no new gap appears.\n\n**Algorithm**\n\n1. Create an empty list of all busy intervals.\n2. Append every employee interval into that list.\n3. Sort the flattened list by start time.\n4. Track the end of the current merged busy block.\n5. For each next interval, if its start is greater than the current busy end, record **[current end, next start]** as free time and reset the busy end to that interval's end.\n6. Otherwise, merge by extending the busy end to the larger end.\n7. Return all recorded gaps.",
    solutions: [
      {
        name: "Flatten, sort, and merge busy time",
        whenToUseMD:
          "Use this when schedules are available as lists and you only need the common finite free intervals, not an online data structure.",
        approachMD:
          "Turn all employee schedules into one global busy list. After sorting by start time, merge overlapping busy intervals and emit the gaps between merged blocks as the common free time.",
        walkthroughMD:
          "1. Add every employee interval into **busyIntervals**.\n2. Sort **busyIntervals** by **start**.\n3. Initialise **currentEnd** from the first busy interval.\n4. For each next interval, compare its start with **currentEnd**.\n5. If **start > currentEnd**, append a new free interval **[currentEnd, start]** and move **currentEnd** to that interval's end.\n6. Otherwise, merge by setting **currentEnd** to the larger of the two ends.\n7. Return the list of free intervals.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Here **n** is the total number of busy intervals across all employees. Flattening takes O(n), sorting dominates, and the output list can also hold O(n) gaps." },
        filename: "Solution.java",
        code: `import java.util.*;

class Interval {
    int start;
    int end;

    Interval(int s, int e) {
        start = s;
        end = e;
    }
}

class Solution {

    public List<Interval> employeeFreeTime(List<List<Interval>> schedule) {
        List<Interval> busyIntervals = new ArrayList<>();

        for (List<Interval> employee : schedule) {
            busyIntervals.addAll(employee);
        }

        busyIntervals.sort((a, b) -> Integer.compare(a.start, b.start));

        List<Interval> freeTimes = new ArrayList<>();
        if (busyIntervals.isEmpty()) {
            return freeTimes;
        }

        int currentEnd = busyIntervals.get(0).end;

        for (int index = 1; index < busyIntervals.size(); index++) {
            Interval interval = busyIntervals.get(index);

            if (interval.start > currentEnd) {
                freeTimes.add(new Interval(currentEnd, interval.start));
                currentEnd = interval.end;
            } else {
                currentEnd = Math.max(currentEnd, interval.end);
            }
        }

        return freeTimes;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "schedule = **[[[1,2],[5,6]],[[1,3]],[[4,10]]]**. After flattening and sorting, scan **[1,2]**, **[1,3]**, **[4,10]**, **[5,6]**.",
      columns: ["next busy interval", "current busy end before", "action", "free time so far"],
      rows: [
        ["[1,3]", "2", "overlaps the current busy block, extend end to 3", "[]"],
        ["[4,10]", "3", "start is after 3, record [3,4]", "[[3,4]]"],
        ["[5,6]", "10", "covered by current busy block, keep end 10", "[[3,4]]"],
      ],
      narrativeMD: "Only gaps between merged busy blocks are returned. The interval **[5,6]** is one employee's busy time inside **[4,10]**, so it cannot create common free time.",
    },
    complexityNote:
      "The flatten-and-merge solution is O(n log n) time and O(n) space for **n** total busy intervals.",
    interviewTipsMD:
      "Frame the problem as an inversion: common free time is the complement of the union of all busy time. That one sentence usually unlocks the solution. Be explicit that only finite gaps between merged busy blocks are returned, and that **start == currentEnd** is not a free interval.",
    followUps: [
      "How would you solve this with a min-heap over each employee's next interval instead of flattening first?",
      "How would you return only free intervals of at least a given duration?",
      "How would you handle streaming schedule updates during the day?",
      "How would the output change if the workday had fixed boundaries such as 9 to 17?",
    ],
    similarProblems: [
      { title: "Merge Intervals", difficulty: "Medium", slug: "iv-merge-intervals", note: "Employee Free Time first builds the same union of overlapping intervals." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "iv-meeting-rooms-ii", note: "Both reason about global busy time after sorting schedules." },
      { title: "Interval List Intersections", difficulty: "Medium", slug: "iv-interval-list-intersections", note: "The dual view: intersections of available windows instead of gaps between busy blocks." },
      { title: "Data Stream as Disjoint Intervals", difficulty: "Hard", slug: "iv-data-stream-disjoint-intervals", note: "Also maintains a union of disjoint intervals after repeated insertions." },
    ],
    keyTakeaways: [
      "Common free time is found by merging everyone else's busy time first.",
      "A gap appears only when the next busy start is greater than the merged busy end.",
      "Touching busy intervals do not produce a positive-length free interval.",
      "Do not include unbounded time before the first busy block or after the last busy block.",
    ],
    pattern:
      "Busy-union inversion: flatten all occupied intervals, merge them into disjoint busy blocks, and return the finite gaps between those blocks.",
  },
];
