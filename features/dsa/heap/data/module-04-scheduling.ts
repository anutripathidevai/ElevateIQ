import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "heap-meeting-rooms-ii",
    moduleId: "heap-scheduling",
    order: 12,
    title: "Meeting Rooms II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/meeting-rooms-ii/",
    tags: ["Heap", "Priority Queue", "Greedy", "Sorting", "Intervals"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an array of meeting time intervals where each interval has a start and end time, return the minimum number of conference rooms required so every meeting can happen without overlap.",
    constraints: [
      "1 <= intervals.length <= 10^4",
      "0 <= starti < endi <= 10^6",
    ],
    inputMD: "An integer matrix **intervals**, where **intervals[i] = [starti, endi]** represents one meeting.",
    outputMD: "An integer: the minimum number of rooms needed to host all meetings.",
    examples: [
      {
        input: "intervals = [[0,30],[5,10],[15,20]]",
        output: "2",
        explanation: "The meeting from 0 to 30 overlaps both shorter meetings, but the meetings from 5 to 10 and 15 to 20 can reuse the same second room.",
      },
      {
        input: "intervals = [[7,10],[2,4]]",
        output: "1",
        explanation: "After sorting by start time, the meeting ending at 4 finishes before the meeting starting at 7, so one room is enough.",
      },
    ],
    learningObjectives: [
      "Recognise interval scheduling as a resource-reuse problem.",
      "Use a min-heap of end times to find the room that frees earliest.",
      "Explain why sorting by start time makes a single left-to-right scan valid.",
      "Connect heap size with the number of rooms allocated so far.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **meetings**, **rooms**, **intervals**, or any schedule where a resource can be reused only after its current job ends. We do not need to compare the new meeting against every room. We only need the room that frees earliest, because if even that room is still busy, every other allocated room is also busy.\n\nA min-heap gives exactly that earliest end time at the root. Sort meetings by start time, then let the heap represent rooms already allocated. If the root end time is at most the current start time, reuse that room by polling it. Otherwise allocate a new room by pushing another end time.",
    commonMistakes: [
      "Sorting by end time instead of start time, which loses the chronological order of room requests.",
      "Using a max-heap, which hides the room that becomes free first.",
      "Checking only strict inequality and failing to reuse a room when one meeting ends exactly when another starts.",
      "Forgetting that the answer is the maximum number of allocated rooms, not the length of the input.",
    ],
    algorithmMD:
      "**Key idea**\n\nSort meetings by start time. Store the end time of each allocated room in a min-heap. The root is the room that becomes available first. For the next meeting, if the root end time is less than or equal to the meeting start, poll it and reuse that room. Then push the current meeting end time. The largest heap size seen is the number of rooms required.\n\n**Heap walkthrough**\n\nUse **intervals = [[0,30],[5,10],[15,20]]**. After sorting, the order is unchanged. Meeting **[0,30]** starts first, so push end **30** and the heap is **[30]**. Meeting **[5,10]** starts while **30** is still busy, so allocate another room and push **10**; the heap is shown as **[10,30]**. Meeting **[15,20]** sees root **10**, which is free before **15**. Poll **10**, push **20**, and the heap becomes **[20,30]**. The largest heap size was **2**, so two rooms are required.\n\n**Algorithm**\n\n1. Sort **intervals** by start time.\n2. Create a min-heap of meeting end times.\n3. For each meeting in sorted order, compare its start time with the smallest end time in the heap.\n4. If the smallest end time is less than or equal to the current start, poll it because that room can be reused.\n5. Push the current meeting end time into the heap.\n6. Track the maximum heap size seen during the scan.\n7. Return that maximum as the room count.",
    solutions: [
      {
        name: "Min-heap of room end times",
        whenToUseMD:
          "Use this as the standard interview solution when intervals arrive as an array and can be sorted first.",
        approachMD:
          "Sort meetings by start time, then maintain a min-heap of room end times. The heap root is the only room that matters for reuse: if it has not ended yet, no allocated room has ended.",
        walkthroughMD:
          "1. Return **0** for an empty input if the platform allows it.\n2. Sort all intervals by their start time.\n3. Create a min-heap ordered by end time.\n4. For each interval, poll the root when it is less than or equal to the current start.\n5. Push the current end time because the meeting now occupies a room.\n6. Update the answer with the heap size after the push.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting dominates the scan; the heap can hold one end time for every allocated room in the worst case." },
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
    ],
    dryRun: {
      inputMD: "intervals = **[[0,30],[5,10],[15,20]]**. Heap values are room end times, shown in sorted order for readability.",
      columns: ["meeting", "earliest end before", "action", "heap after", "rooms needed"],
      rows: [
        ["[0,30]", "none", "allocate first room", "[30]", "1"],
        ["[5,10]", "30", "30 is after 5, allocate another room", "[10,30]", "2"],
        ["[15,20]", "10", "10 is before 15, reuse that room", "[20,30]", "2"],
      ],
      narrativeMD: "The heap reaches size **2** and never needs a third room. The root comparison captures the only room that could possibly be reused first.",
    },
    complexityNote:
      "The expected solution is O(n log n) time for sorting plus heap operations and O(n) space for overlapping rooms.",
    interviewTipsMD:
      "Say the heap stores **end times**, not intervals. That immediately explains the comparator and the reuse check. Be explicit that **end <= start** means the room is free. A common follow-up asks for Meeting Rooms I; that problem only asks whether any overlap exists, so sorting and comparing adjacent intervals is enough.",
    followUps: [
      "How would you solve the easier Meeting Rooms problem that only asks if one person can attend all meetings?",
      "How would the answer change if intervals were streamed online and could not be sorted first?",
      "Can you solve this with two sorted arrays of starts and ends instead of a heap?",
      "How would you return the actual room assignment for each meeting?",
    ],
    similarProblems: [
      { title: "Meeting Rooms", difficulty: "Easy", url: "https://leetcode.com/problems/meeting-rooms/", note: "The boolean version only checks whether any intervals overlap." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "heap-task-scheduler", note: "Also uses a heap to manage scheduling pressure over time." },
      { title: "Single-Threaded CPU", difficulty: "Medium", slug: "heap-single-threaded-cpu", note: "Chooses the next available job with a priority queue after sorting by time." },
      { title: "Merge k Sorted Lists", difficulty: "Hard", slug: "heap-merge-k-sorted-lists", note: "Another pattern where the heap root is the next candidate to process." },
    ],
    keyTakeaways: [
      "Sort by start time so meetings are considered in the order rooms are requested.",
      "A min-heap of end times exposes the room that frees first.",
      "If the earliest room is still busy, all allocated rooms are busy.",
      "The maximum heap size is the minimum number of rooms needed.",
    ],
    pattern:
      "Greedy resource scheduling: sort events by start time, keep resource release times in a min-heap, and reuse the earliest-free resource whenever possible.",
  },
  {
    kind: "problem",
    slug: "heap-task-scheduler",
    moduleId: "heap-scheduling",
    order: 13,
    title: "Task Scheduler",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/task-scheduler/",
    tags: ["Heap", "Priority Queue", "Greedy", "Counting", "Scheduling"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "You are given an array of CPU tasks represented by uppercase letters and a non-negative cooldown **n**. Each interval can run one task or stay idle. The same task type must be separated by at least **n** intervals. Return the least number of intervals needed to finish all tasks.",
    constraints: [
      "1 <= tasks.length <= 10^4",
      "tasks[i] is an uppercase English letter",
      "0 <= n <= 100",
    ],
    inputMD: "A character array **tasks** and an integer cooldown **n**.",
    outputMD: "An integer: the minimum total number of CPU intervals, including idle intervals if they are unavoidable.",
    examples: [
      {
        input: "tasks = [A,A,A,B,B,B], n = 2",
        output: "8",
        explanation: "One optimal schedule is **A, B, idle, A, B, idle, A, B**. The two idle slots are needed because both task types have three copies.",
      },
      {
        input: "tasks = [A,C,A,B,D,B], n = 1",
        output: "6",
        explanation: "A valid schedule such as **A, B, C, D, A, B** uses every interval for work, so no idle time is required.",
      },
    ],
    learningObjectives: [
      "Recognise cooldown scheduling as a most-frequent-task-first greedy problem.",
      "Use a max-heap of remaining counts to choose the task type with the largest backlog.",
      "Explain why tasks used in the same cooldown cycle are requeued only after the cycle ends.",
      "Compare the heap simulation with the constant-space counting formula.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **cooldown**, **least intervals**, and repeated task types. The hardest task type is the one with the most remaining copies, because it creates the most separation requirements. A max-heap lets us repeatedly pick the task type with the largest remaining count.\n\nThink in cycles of length **n + 1**. Within one cycle, we can run at most one copy of the same task type. So we pop up to **n + 1** largest counts, run each once, decrement them, and hold them aside until the cycle ends. If work remains but fewer than **n + 1** distinct tasks were available, the empty positions in that cycle are forced idle intervals.",
    commonMistakes: [
      "Reinserting a task into the heap immediately after running it, which violates cooldown inside the same cycle.",
      "Adding idle time after the final cycle even though all tasks are already complete.",
      "Using alphabetical order instead of remaining frequency as the priority.",
      "Forgetting that when **n = 0**, the answer is simply the number of tasks.",
    ],
    algorithmMD:
      "**Key idea**\n\nCount task frequencies and put the positive counts in a max-heap. The root is the task type with the largest backlog. Process one cooldown cycle at a time, where each cycle has length **n + 1**. Pop up to **n + 1** counts, decrement each because one task ran, then requeue only the counts that remain positive after the cycle.\n\n**Heap walkthrough**\n\nUse **tasks = [A,A,A,B,B,B]** and **n = 2**. The heap starts as **[3,3]**, representing three **A** tasks and three **B** tasks. Cycle one has three slots: run **A**, run **B**, then idle because no third distinct task is available; requeue counts **[2,2]** and time becomes **3**. Cycle two repeats: run **A**, run **B**, idle, then requeue **[1,1]** and time becomes **6**. Cycle three runs **A** and **B** with no idle afterward because the heap becomes empty. Total time is **8**.\n\n**Algorithm**\n\n1. Count how many times each task type appears.\n2. Push every positive count into a max-heap.\n3. While the heap is not empty, start a cycle of length **n + 1**.\n4. Pop up to **n + 1** counts, run each task once, and store decremented positive counts in a temporary list.\n5. Requeue all temporary counts after the cycle choices are made.\n6. If the heap still has work, add the full cycle length to time; otherwise add only the number of tasks actually run in the final cycle.\n7. Return the accumulated time.",
    solutions: [
      {
        name: "Max-heap cooldown simulation",
        whenToUseMD:
          "Use this when you want an interview-friendly simulation that directly explains cooldown cycles before mentioning the formula.",
        approachMD:
          "Use a max-heap of remaining task counts. In each cycle of length **n + 1**, run the most frequent available task types once, hold their decremented counts aside, then requeue them after the cycle.",
        walkthroughMD:
          "1. Count frequencies for all task letters.\n2. Push every positive count into a max-heap.\n3. While work remains, create an empty temporary list and run up to **n + 1** tasks from the heap.\n4. Decrement each popped count and keep it in the temporary list if it is still positive.\n5. Reinsert the temporary counts only after the cycle finishes.\n6. Add a full cycle to time if more work remains, otherwise add only the tasks run in the final partial cycle.",
        complexity: { time: "O(m log u)", space: "O(u)", note: "Here **m** is the number of tasks and **u** is the number of distinct task types. For uppercase English letters, **u <= 26**, so this is effectively O(m) time and O(1) extra space." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int leastInterval(char[] tasks, int n) {
        int[] frequencies = new int[26];
        for (char task : tasks) {
            frequencies[task - 'A']++;
        }

        PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
        for (int count : frequencies) {
            if (count > 0) {
                maxHeap.offer(count);
            }
        }

        int time = 0;
        int cycleLength = n + 1;

        while (!maxHeap.isEmpty()) {
            List<Integer> nextCycle = new ArrayList<>();
            int tasksRun = 0;

            for (int slot = 0; slot < cycleLength && !maxHeap.isEmpty(); slot++) {
                int remaining = maxHeap.poll() - 1;
                if (remaining > 0) {
                    nextCycle.add(remaining);
                }
                tasksRun++;
            }

            for (int remaining : nextCycle) {
                maxHeap.offer(remaining);
            }

            if (maxHeap.isEmpty()) {
                time += tasksRun;
            } else {
                time += cycleLength;
            }
        }

        return time;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "tasks = **[A,A,A,B,B,B]**, n = **2**. Heap entries are remaining counts, not task letters.",
      columns: ["cycle", "heap before", "tasks run", "idle slots", "time after"],
      rows: [
        ["1", "[3,3]", "A and B", "1", "3"],
        ["2", "[2,2]", "A and B", "1", "6"],
        ["3", "[1,1]", "A and B", "0", "8"],
      ],
      narrativeMD: "The first two cycles need one idle slot because only two task types are available for three cooldown positions. The final cycle does not add trailing idle time.",
    },
    complexityNote:
      "The heap simulation is O(m log u) time and O(u) space, with **u <= 26** for the LeetCode constraints.",
    interviewTipsMD:
      "Lead with the heap simulation because it is easy to reason about and less error-prone than memorising a formula. Then mention the O(1) counting formula: **max(tasks.length, (maxFreq - 1) * (n + 1) + tiedMaxFreq)**, where **tiedMaxFreq** is the number of task types that share the maximum frequency. The formula counts the frame forced by the most frequent tasks.",
    followUps: [
      "Can you derive the O(1) counting formula from the most frequent task type?",
      "How would the solution change if task types were arbitrary strings instead of uppercase letters?",
      "How would you output one actual optimal schedule, not just its length?",
      "What if every task type had a different cooldown?",
    ],
    similarProblems: [
      { title: "Reorganize String", difficulty: "Medium", url: "https://leetcode.com/problems/reorganize-string/", note: "Also repeatedly chooses the most frequent remaining character while avoiding immediate conflicts." },
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "heap-meeting-rooms-ii", note: "Another scheduling problem where a heap tracks time pressure." },
      { title: "Single-Threaded CPU", difficulty: "Medium", slug: "heap-single-threaded-cpu", note: "Schedules jobs by the next available priority after time advances." },
      { title: "IPO", difficulty: "Hard", slug: "heap-ipo", note: "Uses a max-heap to repeatedly choose the best currently available option." },
    ],
    keyTakeaways: [
      "The most frequent remaining task type creates the tightest cooldown constraint.",
      "A cooldown cycle has length **n + 1** and can contain each task type at most once.",
      "Tasks run in a cycle are requeued only after that cycle finishes.",
      "Do not add idle intervals after all work is complete.",
    ],
    pattern:
      "Greedy cooldown scheduling: repeatedly fill cycles with the highest remaining counts, delay requeue until the cycle ends, and charge idle time only while work remains.",
  },
  {
    kind: "problem",
    slug: "heap-single-threaded-cpu",
    moduleId: "heap-scheduling",
    order: 14,
    title: "Single-Threaded CPU",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/single-threaded-cpu/",
    tags: ["Heap", "Priority Queue", "Greedy", "Sorting", "Simulation"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "You are given **tasks**, where **tasks[i] = [enqueueTimei, processingTimei]**. A single-threaded CPU can process one task at a time. When multiple tasks are available, it chooses the one with the shortest processing time, breaking ties by the smallest original index. Return the order of task indices processed by the CPU.",
    constraints: [
      "1 <= tasks.length <= 10^5",
      "1 <= enqueueTimei, processingTimei <= 10^9",
    ],
    inputMD: "An integer matrix **tasks**, where each row contains an enqueue time and a processing time. The original row position is the task index.",
    outputMD: "An integer array containing the original indices in the order the CPU processes them.",
    examples: [
      {
        input: "tasks = [[1,2],[2,4],[3,2],[4,1]]",
        output: "[0,2,3,1]",
        explanation: "Task 0 is the only task at time 1. At time 3, tasks 1 and 2 are available, so task 2 wins by shorter processing time. Then task 3 wins before task 1.",
      },
      {
        input: "tasks = [[7,10],[7,12],[7,5],[7,4],[7,2]]",
        output: "[4,3,2,0,1]",
        explanation: "All tasks arrive at time 7, so the CPU processes them by processing time, using original index only to break ties.",
      },
    ],
    learningObjectives: [
      "Sort jobs by enqueue time while preserving original indices for the answer.",
      "Use a min-heap of currently available tasks ordered by processing time and index.",
      "Advance the simulation clock correctly when the CPU is idle.",
      "Explain why unavailable future tasks must not enter the heap early.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **available jobs**, **single CPU**, **shortest processing time**, and **original index tie-breaker**. This is not a global sort by processing time, because a short task cannot be chosen before it arrives. The heap should contain only tasks whose enqueue time is less than or equal to the current clock.\n\nSort by enqueue time so future tasks can be revealed in order. Then a min-heap over available tasks chooses the next job by **processing time, original index**. If the heap is empty, the CPU has no work it can legally run, so jump the clock directly to the next enqueue time instead of incrementing one unit at a time.",
    commonMistakes: [
      "Sorting only by processing time and accidentally running tasks before their enqueue time.",
      "Losing the original index after sorting the task array.",
      "Incrementing the clock one unit at a time through idle gaps, which is too slow for large times.",
      "Breaking ties by enqueue time instead of original index once tasks are available.",
    ],
    algorithmMD:
      "**Key idea**\n\nAttach each task original index, then sort by enqueue time. Maintain a min-heap of tasks that have already arrived, ordered by **processing time** and then **original index**. The heap root is exactly the task the CPU must run next. A long clock value is safest because total processing time can exceed integer range.\n\n**Heap walkthrough**\n\nUse **tasks = [[1,2],[2,4],[3,2],[4,1]]**. Start at time **1** and add task **0**, so the heap is **[(2,0)]** by **(processing,index)**. Pop task **0**, finish at time **3**, and output **[0]**. Now tasks **1** and **2** have arrived; the heap is **[(2,2),(4,1)]**, so pop task **2** and finish at time **5**, output **[0,2]**. Add task **3**, making the heap **[(1,3),(4,1)]**. Pop task **3**, finish at time **6**, then pop task **1** and finish at time **10**. The final order is **[0,2,3,1]**.\n\n**Algorithm**\n\n1. Build an array of triples **[enqueueTime, processingTime, originalIndex]**.\n2. Sort the triples by enqueue time.\n3. Keep a pointer to the next not-yet-added task and a clock value.\n4. If the heap is empty and the next task has not arrived, jump the clock to that task enqueue time.\n5. Push every task whose enqueue time is less than or equal to the clock into the min-heap.\n6. Poll the heap root, append its original index to the answer, and advance the clock by its processing time.\n7. Repeat until every task index has been output.",
    solutions: [
      {
        name: "Sorted enqueue scan with available-task heap",
        whenToUseMD:
          "Use this for the canonical solution. It separates time eligibility from CPU priority, which is the core interview insight.",
        approachMD:
          "Sort tasks by enqueue time, but choose the next task from a min-heap of only currently available tasks. The heap comparator is **processing time first, original index second**.",
        walkthroughMD:
          "1. Convert every task into **[enqueueTime, processingTime, originalIndex]**.\n2. Sort the converted tasks by enqueue time.\n3. Maintain a pointer into the sorted array, a long clock, and a min-heap of available tasks.\n4. When the heap is empty, jump the clock to the next enqueue time.\n5. Add all tasks whose enqueue time is now reachable.\n6. Poll the shortest available task, append its original index, and add its processing time to the clock.\n7. Continue until the answer contains every index.",
        complexity: { time: "O(n log n)", space: "O(n)", note: "Sorting takes O(n log n), and each task is pushed and popped from the heap once. The heap can hold O(n) available tasks." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int[] getOrder(int[][] tasks) {
        int n = tasks.length;
        int[][] indexedTasks = new int[n][3];

        for (int index = 0; index < n; index++) {
            indexedTasks[index][0] = tasks[index][0];
            indexedTasks[index][1] = tasks[index][1];
            indexedTasks[index][2] = index;
        }

        Arrays.sort(indexedTasks, (a, b) -> {
            if (a[0] != b[0]) {
                return Integer.compare(a[0], b[0]);
            }
            return Integer.compare(a[2], b[2]);
        });

        PriorityQueue<int[]> availableTasks = new PriorityQueue<>((a, b) -> {
            if (a[1] != b[1]) {
                return Integer.compare(a[1], b[1]);
            }
            return Integer.compare(a[2], b[2]);
        });

        int[] order = new int[n];
        int nextTask = 0;
        int outputIndex = 0;
        long time = 0;

        while (outputIndex < n) {
            if (availableTasks.isEmpty() && nextTask < n && time < indexedTasks[nextTask][0]) {
                time = indexedTasks[nextTask][0];
            }

            while (nextTask < n && indexedTasks[nextTask][0] <= time) {
                availableTasks.offer(indexedTasks[nextTask]);
                nextTask++;
            }

            int[] current = availableTasks.poll();
            order[outputIndex] = current[2];
            outputIndex++;
            time += current[1];
        }

        return order;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "tasks = **[[1,2],[2,4],[3,2],[4,1]]**. Heap entries are **(processing,index)** for tasks that have already arrived.",
      columns: ["clock", "tasks added", "heap before pop", "chosen task", "order"],
      rows: [
        ["1", "0", "[(2,0)]", "0", "[0]"],
        ["3", "1 and 2", "[(2,2),(4,1)]", "2", "[0,2]"],
        ["5", "3", "[(1,3),(4,1)]", "3", "[0,2,3]"],
        ["6", "none", "[(4,1)]", "1", "[0,2,3,1]"],
      ],
      narrativeMD: "The CPU never considers task **3** at time **3** because it has not arrived yet. Once it arrives by time **5**, its short processing time makes it the next heap root.",
    },
    complexityNote:
      "The optimal simulation is O(n log n) time and O(n) space because every task enters and leaves the available-task heap exactly once.",
    interviewTipsMD:
      "Separate the two orders out loud: sort by **enqueue time** to reveal tasks, then heap by **processing time and original index** to choose among available tasks. Use a long clock and jump idle gaps directly. The original index must travel with the task from the moment you sort.",
    followUps: [
      "How would the result change if ties used enqueue time before original index?",
      "How would you support multiple identical CPUs?",
      "How would you compute average waiting time in addition to order?",
      "What if tasks could be preempted when a shorter task arrives?",
    ],
    similarProblems: [
      { title: "Meeting Rooms II", difficulty: "Medium", slug: "heap-meeting-rooms-ii", note: "Both sort by time and use a heap to manage active scheduling state." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "heap-task-scheduler", note: "Another CPU scheduling problem where heap priority drives the next action." },
      { title: "IPO", difficulty: "Hard", slug: "heap-ipo", note: "Also separates eligibility from best-choice priority using sorting and a heap." },
      { title: "Process Tasks Using Servers", difficulty: "Medium", url: "https://leetcode.com/problems/process-tasks-using-servers/", note: "A richer server scheduling simulation with available and busy heaps." },
    ],
    keyTakeaways: [
      "The heap contains only tasks that have already arrived.",
      "CPU priority is **processing time**, then **original index**.",
      "Jump the clock over idle gaps instead of simulating every time unit.",
      "Preserve original indices before sorting so the answer can be emitted correctly.",
    ],
    pattern:
      "Time-gated greedy scheduling: sort future events by availability, push eligible jobs into a priority heap, and pop the best available job while advancing the clock.",
  },
];
