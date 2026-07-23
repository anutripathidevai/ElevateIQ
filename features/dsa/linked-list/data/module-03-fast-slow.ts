import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "ll-linked-list-cycle",
    moduleId: "ll-fast-slow",
    order: 10,
    title: "Linked List Cycle",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
    tags: ["Linked List", "Two Pointers", "Fast Slow", "Cycle Detection", "Hash Set"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 12,
    statementMD:
      "Given the head of a linked list, determine whether the list contains a cycle. A cycle exists when some node can be reached again by continuously following **next** pointers.\n\nThe input may describe **pos**, the index where the tail connects back, but **pos** is not passed to the function. Your method receives only **head** and must detect the structure from pointers.",
    constraints: [
      "The number of nodes is in the range 0 to 10^4",
      "-10^5 <= Node.val <= 10^5",
      "pos is -1 or a valid node index in the list",
    ],
    inputMD: "The **head** pointer of a singly linked list. The test harness may connect the tail back to an earlier node.",
    outputMD: "A boolean: **true** if the linked list contains a cycle, otherwise **false**.",
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "The tail node with value -4 points back to the node with value 2, so following **next** pointers eventually repeats a node." },
      { input: "head = [1,2], pos = 0", output: "true", explanation: "The tail node with value 2 points back to the head, forming **1 -> 2 -> 1 ...**." },
      { input: "head = [1], pos = -1", output: "false", explanation: "The only node points to null, so no node is visited twice." },
    ],
    learningObjectives: [
      "Recognise the fast and slow pointer signal for cycle detection.",
      "Explain why a fast pointer must eventually catch a slow pointer inside a cycle.",
      "Contrast Floyd's O(1)-space approach with the O(n)-space visited-set approach.",
      "Guard pointer movement so **fast.next.next** is never evaluated after null.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nA cycle question asks whether following **next** pointers can continue forever. That is the fast and slow pointer signal: use two walkers on the same path, one moving one step and the other moving two steps.\n\nIf the list has no cycle, **fast** reaches null first because it consumes the list faster. If the list has a cycle, both pointers eventually enter the loop. Once inside, **fast** gains one node on **slow** every move, so the distance between them around the cycle closes until they meet.\n\nA visited set is also valid: record every node reference and return true when a node appears again. It is easier to reason about, but it spends O(n) extra space. Floyd's method keeps the same detection power with O(1) space.",
    commonMistakes: [
      "Checking node values instead of node references; duplicate values do not imply a cycle.",
      "Moving **fast.next.next** without first verifying both **fast** and **fast.next** are not null.",
      "Starting two pointers but moving both one step, which preserves their distance forever.",
      "Using a set as the only solution without mentioning the O(1)-space Floyd tradeoff.",
    ],
    algorithmMD:
      "**Key idea**\n\nRun **slow** one step at a time and **fast** two steps at a time. Null means the list ends, so there is no cycle. Pointer equality means both references point to the same node, so a cycle exists.\n\n**Pointer walkthrough**\n\nFor **3 -> 2 -> 0 -> -4 -> 2 ...**, start both pointers at **3**. After one move, **slow** is at **2** and **fast** is at **0**. After two moves, **slow** is at **0** and **fast** has wrapped to **2**. After three moves, **slow** reaches **-4** and **fast** also reaches **-4**. The catch proves the loop.\n\nWithout the cycle, the same two-step movement would eventually push **fast** to null, which proves the list is finite.\n\n**Algorithm**\n\n1. Set **slow = head** and **fast = head**.\n2. While **fast** and **fast.next** are both not null, move **slow** one step and **fast** two steps.\n3. If the two pointers ever reference the same node, return **true**.\n4. If the loop ends because **fast** reached the tail, return **false**.",
    solutions: [
      {
        name: "Floyd tortoise and hare",
        whenToUseMD:
          "Use this in interviews as the expected optimal solution when the list must be inspected in O(1) extra space.",
        approachMD:
          "The fast pointer moves twice as quickly as the slow pointer. In an acyclic list, fast reaches null. In a cyclic list, fast eventually laps slow inside the cycle, so pointer equality detects the loop.",
        walkthroughMD:
          "1. Initialise **slow** and **fast** at **head**.\n2. Continue only while **fast** and **fast.next** are safe to advance.\n3. Move **slow** by one node and **fast** by two nodes.\n4. Return **true** as soon as the two references match.\n5. Return **false** if **fast** reaches the end of the list.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each pointer makes at most a linear number of moves before null or a meeting occurs." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public boolean hasCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;

            if (slow == fast) {
                return true;
            }
        }

        return false;
    }
}`,
      },
      {
        name: "Visited node set",
        whenToUseMD:
          "Use this when you want the simplest correctness story and O(n) extra space is acceptable.",
        approachMD:
          "Store every node reference as it is visited. If traversal reaches a node already in the set, the list has looped back. If traversal reaches null, the list is acyclic.",
        walkthroughMD:
          "1. Create an empty set of visited node references.\n2. Walk through the list with **current**.\n3. If **current** is already in the set, return **true**.\n4. Otherwise add **current** and advance to **current.next**.\n5. Return **false** if traversal reaches null.",
        complexity: { time: "O(n)", space: "O(n)", note: "Each reachable node is visited once, and up to n node references are stored." },
        filename: "Solution.java",
        code: `import java.util.HashSet;
import java.util.Set;

class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public boolean hasCycle(ListNode head) {
        Set<ListNode> seen = new HashSet<>();
        ListNode current = head;

        while (current != null) {
            if (seen.contains(current)) {
                return true;
            }
            seen.add(current);
            current = current.next;
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = **3 -> 2 -> 0 -> -4**, with the tail pointing back to the node **2**.",
      columns: ["move", "slow", "fast", "result"],
      rows: [
        ["start", "3", "3", "no decision yet"],
        ["1", "2", "0", "different nodes"],
        ["2", "0", "2", "different nodes after fast wraps"],
        ["3", "-4", "-4", "same node, cycle found"],
      ],
      narrativeMD: "The fast pointer catches the slow pointer at **-4**, so the method returns **true** before any pointer reaches null.",
    },
    interviewTipsMD:
      "Lead with the invariant: if there is a cycle, relative speed inside the loop is one node per move, so a catch is inevitable. Say explicitly that equality compares node references, not values. Then mention the hash-set alternative as a clear O(n)-space tradeoff, not as a brute-force method.",
    followUps: [
      "How would you return the node where the cycle begins?",
      "How would you compute the length of the cycle after detecting it?",
      "What changes if the list is circular by design and every node is expected to have a next pointer?",
      "How would you detect a cycle in an implicit state machine instead of a materialized list?",
    ],
    similarProblems: [
      { title: "Linked List Cycle II", difficulty: "Medium", slug: "ll-linked-list-cycle-ii", note: "Extends detection to finding the entry node." },
      { title: "Middle of the Linked List", difficulty: "Easy", slug: "ll-middle-of-linked-list", note: "Uses the same one-step and two-step pointer rhythm." },
      { title: "Happy Number", difficulty: "Easy", slug: "ll-happy-number", note: "Applies cycle detection to an implicit numeric list." },
      { title: "Find the Duplicate Number", difficulty: "Medium", slug: "ll-find-duplicate-number", note: "Uses Floyd on an array-defined functional graph." },
    ],
    keyTakeaways: [
      "Fast and slow pointers detect whether a linked structure loops forever.",
      "In a cycle, the fast pointer gains one node per move and must eventually meet slow.",
      "A hash set gives a simpler O(n)-space alternative, while Floyd uses O(1) space.",
      "Always guard **fast** and **fast.next** before moving two steps.",
    ],
    pattern:
      "To detect a cycle in a one-next structure, move slow by one and fast by two; null means no cycle, equality means a cycle.",
  },
  {
    kind: "problem",
    slug: "ll-linked-list-cycle-ii",
    moduleId: "ll-fast-slow",
    order: 11,
    title: "Linked List Cycle II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle-ii/",
    tags: ["Linked List", "Two Pointers", "Fast Slow", "Cycle Detection", "Math"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 18,
    statementMD:
      "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.\n\nThe input may describe **pos**, the index where the tail connects back, but **pos** is not passed to the function. You must identify the entrance using pointers only.",
    constraints: [
      "The number of nodes is in the range 0 to 10^4",
      "-10^5 <= Node.val <= 10^5",
      "pos is -1 or a valid node index in the list",
      "Do not modify the linked list",
    ],
    inputMD: "The **head** pointer of a singly linked list that may or may not contain a cycle.",
    outputMD: "The node where the cycle begins, or **null** when the list has no cycle.",
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "node with value 2", explanation: "The tail node with value -4 connects back to the node at index 1, whose value is 2." },
      { input: "head = [1,2], pos = 0", output: "node with value 1", explanation: "The tail connects to the head, so the entrance is the first node." },
      { input: "head = [1], pos = -1", output: "null", explanation: "There is no repeated node, so there is no entrance to return." },
    ],
    learningObjectives: [
      "Use Floyd's first meeting point to prove a cycle exists.",
      "Derive why resetting one pointer to head finds the cycle entrance.",
      "Move both pointers one step at a time after the meeting point.",
      "Return null cleanly when the detection phase reaches the tail.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is the same fast and slow signal as cycle detection, but the ask is stronger: find the first repeated node, not just whether repetition exists. The important clue is that once **slow** and **fast** meet inside the cycle, the meeting point carries enough distance information to locate the entrance.\n\nThe pointer trap is stopping too early. The meeting node is not necessarily the entrance. After the catch, reset one pointer to **head**, keep the other at the meeting node, and move both one step at a time. Their next meeting is exactly the cycle entry.",
    commonMistakes: [
      "Returning the first meeting node even though it may be deeper inside the cycle.",
      "Resetting both pointers to head, which loses the useful meeting position.",
      "Moving one pointer two steps during the second phase instead of moving both one step.",
      "Forgetting to return **null** when the first phase reaches the end of an acyclic list.",
    ],
    algorithmMD:
      "**Key idea**\n\nFirst use Floyd's tortoise and hare to get any meeting point inside the cycle. Then place one pointer at **head** and leave the other at the meeting point. Moving both one step at a time makes them meet at the entrance.\n\n**Pointer walkthrough**\n\nFor **3 -> 2 -> 0 -> -4 -> 2 ...**, Floyd's first phase can meet at **-4**. Now put **finder** at **3** and keep **slow** at **-4**. Move both one step: **finder** goes to **2**, and **slow** follows the cycle from **-4** to **2**. They meet at **2**, the cycle entrance.\n\nThe informal proof is distance based. Let **a** be the distance from head to entry, **b** the distance from entry to the meeting point, and **c** the cycle length. At the first meeting, fast has traveled exactly one or more full cycles more than slow, so **a + b** is a multiple of **c**. Therefore **a** equals **c - b** modulo the cycle length. In words, the head-to-entry distance is the same as the meeting-to-entry distance modulo the cycle length. That is why resetting one pointer to head and advancing both by one lands them together at the entry.\n\n**Algorithm**\n\n1. Start **slow = head** and **fast = head**.\n2. Move **slow** one step and **fast** two steps while both fast moves are safe.\n3. If **slow == fast**, a cycle exists; stop the detection phase.\n4. If the loop ends because **fast** reaches null, return **null**.\n5. Set **finder = head** while **slow** stays at the meeting node.\n6. Move **finder** and **slow** one step at a time until they meet.\n7. Return the meeting node as the cycle entrance.",
    solutions: [
      {
        name: "Floyd entry-point reset",
        approachMD:
          "The first phase detects a cycle and captures a meeting node. The second phase uses the distance relationship between head, entry, and meeting: one pointer starts at head, the other at the meeting node, and equal-speed movement converges at the entrance.",
        walkthroughMD:
          "1. Run the normal Floyd loop with **slow** and **fast**.\n2. If **fast** reaches null, return **null** because the list is acyclic.\n3. When **slow** and **fast** meet, initialise **finder** at **head**.\n4. Move **finder** and **slow** one node per iteration.\n5. Return the node where they meet; it is the cycle entrance.",
        complexity: { time: "O(n)", space: "O(1)", note: "Detection and entry search each take at most linear pointer moves with no extra data structure." },
        filename: "Solution.java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int x) {
        val = x;
    }
}

class Solution {

    public ListNode detectCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;

            if (slow == fast) {
                ListNode finder = head;
                while (finder != slow) {
                    finder = finder.next;
                    slow = slow.next;
                }
                return finder;
            }
        }

        return null;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "head = **3 -> 2 -> 0 -> -4**, with the tail pointing back to **2**.",
      columns: ["phase", "slow", "fast or finder", "action", "meaning"],
      rows: [
        ["detect start", "3", "3", "both begin at head", "no cycle proof yet"],
        ["detect move 1", "2", "0", "slow moves one, fast moves two", "not equal"],
        ["detect move 2", "0", "2", "fast wraps through the cycle", "not equal"],
        ["detect move 3", "-4", "-4", "pointers meet", "cycle confirmed"],
        ["entry move 0", "-4", "3", "finder resets to head", "prepare equal-speed walk"],
        ["entry move 1", "2", "2", "both move one step", "entry found"],
      ],
      narrativeMD: "The first meeting at **-4** proves a cycle. The reset phase then meets at **2**, so the returned node is the entrance.",
    },
    interviewTipsMD:
      "Do not hand-wave the reset step. A concise proof using **a**, **b**, and cycle length **c** is often what separates a memorized solution from an interview-ready explanation. Also clarify that the list is not modified and that the node reference, not the value, is returned.",
    followUps: [
      "How would you compute the length of the cycle after finding the entrance?",
      "How would you remove the cycle safely once the entrance is known?",
      "Can you solve the problem with a hash set, and what space tradeoff does it make?",
      "How does this reset idea appear in Find the Duplicate Number?",
    ],
    similarProblems: [
      { title: "Linked List Cycle", difficulty: "Easy", slug: "ll-linked-list-cycle", note: "The first phase is exactly the detection problem." },
      { title: "Find the Duplicate Number", difficulty: "Medium", slug: "ll-find-duplicate-number", note: "Uses the same entrance-finding reset on an implicit graph." },
      { title: "Happy Number", difficulty: "Easy", slug: "ll-happy-number", note: "A numeric state sequence can also be treated as a cycle problem." },
      { title: "Middle of the Linked List", difficulty: "Easy", slug: "ll-middle-of-linked-list", note: "Uses the same fast and slow pointer pacing without a cycle." },
    ],
    keyTakeaways: [
      "The first Floyd meeting is proof of a cycle, not necessarily the cycle entrance.",
      "After a meeting, head-to-entry distance equals meeting-to-entry distance modulo the cycle length.",
      "Reset one pointer to head and move both one step to find the entrance.",
      "Return **null** when the detection phase reaches the list end.",
    ],
    pattern:
      "To find a cycle entrance, detect a Floyd meeting, reset one pointer to head, then advance both one step until they meet at the entry.",
  },
  {
    kind: "problem",
    slug: "ll-happy-number",
    moduleId: "ll-fast-slow",
    order: 12,
    title: "Happy Number",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/happy-number/",
    tags: ["Linked List", "Two Pointers", "Fast Slow", "Math", "Cycle Detection"],
    companies: ["Amazon", "Google", "Microsoft", "Adobe", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "Write an algorithm to determine whether a positive integer **n** is a happy number.\n\nStarting with **n**, replace the number by the sum of the squares of its digits. Repeat the process. If the sequence eventually reaches **1**, the number is happy. If it loops forever without reaching **1**, the number is not happy.",
    constraints: [
      "1 <= n <= 2^31 - 1",
    ],
    inputMD: "A positive integer **n**.",
    outputMD: "A boolean: **true** if repeated digit-square-sum transformation reaches **1**, otherwise **false**.",
    examples: [
      { input: "n = 19", output: "true", explanation: "The sequence is **19 -> 82 -> 68 -> 100 -> 1**, so it reaches 1." },
      { input: "n = 2", output: "false", explanation: "The sequence enters **4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4**, so it cycles without reaching 1." },
    ],
    learningObjectives: [
      "Reframe a numeric sequence as an implicit linked list.",
      "Apply fast and slow cycle detection without materializing nodes.",
      "Distinguish the success terminal state **1** from a non-happy cycle.",
      "Implement the digit-square-sum transition safely for positive integers.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis belongs in a linked-list module because the repeated transformation creates an implicit linked list. Each number is a node, and its **next** pointer is the sum of the squares of its digits. The list is not stored in memory, but the one-next structure is real.\n\nFrom any starting number, the sequence either reaches **1** or eventually repeats a previous number. A repeat means the implicit list has a cycle. Instead of keeping a set of seen numbers, run **slow** through one transformation and **fast** through two transformations. If **fast** reaches **1**, the number is happy. If **slow** and **fast** meet somewhere else, the sequence is trapped in a cycle.",
    commonMistakes: [
      "Treating the problem as pure math and missing the implicit linked-list cycle pattern.",
      "Returning false as soon as a value decreases or increases; the sequence is not monotonic.",
      "Checking only whether **slow** reaches 1 while **fast** may have already reached 1.",
      "Writing digit extraction that accidentally ignores the final digit.",
    ],
    algorithmMD:
      "**Key idea**\n\nDefine **next(number)** as the sum of squared digits. This gives every positive integer exactly one outgoing edge, just like a linked-list node has one **next** pointer. Floyd's algorithm can detect whether the generated path reaches **1** or falls into a cycle.\n\n**Pointer walkthrough**\n\nFor **19**, the implicit list is **19 -> 82 -> 68 -> 100 -> 1**. Start **slow** at **19** and **fast** at **82**. After one loop, **slow** moves to **82** while **fast** jumps from **82** to **100**. After another loop, **slow** moves to **68** while **fast** reaches **1**. The terminal value wins, so **19** is happy.\n\nFor **2**, the path eventually becomes **4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4**. In that loop, **fast** eventually catches **slow**, proving the sequence will never reach **1**.\n\n**Algorithm**\n\n1. Set **slow = n** and **fast = next(n)**.\n2. While **fast** is not **1** and **slow** is not equal to **fast**, move **slow** once and **fast** twice.\n3. If **fast** becomes **1**, return **true**.\n4. If **slow** equals **fast**, return **false** because a non-1 cycle was found.\n5. Implement **next** by repeatedly taking the last digit, adding its square, and removing that digit.",
    solutions: [
      {
        name: "Floyd cycle detection on digit sums",
        approachMD:
          "Model each generated number as a node in an implicit linked list. The helper computes the next node. Floyd's two-speed traversal distinguishes reaching the terminal node **1** from entering a repeated cycle.",
        walkthroughMD:
          "1. Initialise **slow** at **n** and **fast** at the first transformed value.\n2. Repeat while **fast** is not **1** and the pointers have not met.\n3. Advance **slow** by one digit-square-sum transformation.\n4. Advance **fast** by two transformations.\n5. Return whether **fast** reached **1**.",
        complexity: { time: "O(log n)", space: "O(1)", note: "Each transformation processes the digits of the current number, and the sequence quickly enters a bounded set of values." },
        filename: "Solution.java",
        code: `class Solution {

    public boolean isHappy(int n) {
        int slow = n;
        int fast = nextNumber(n);

        while (fast != 1 && slow != fast) {
            slow = nextNumber(slow);
            fast = nextNumber(nextNumber(fast));
        }

        return fast == 1;
    }

    private int nextNumber(int number) {
        int sum = 0;

        while (number > 0) {
            int digit = number % 10;
            sum += digit * digit;
            number = number / 10;
        }

        return sum;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 2. Track the generated implicit list until the two pointers meet inside the non-happy cycle.",
      columns: ["step", "slow", "fast", "signal"],
      rows: [
        ["start", "2", "4", "fast is not 1 and pointers differ"],
        ["1", "4", "37", "continue"],
        ["2", "16", "89", "continue"],
        ["3", "37", "42", "continue"],
        ["4", "58", "4", "continue"],
        ["5", "89", "37", "continue"],
        ["6", "145", "89", "continue"],
        ["7", "42", "42", "pointers meet in a cycle"],
      ],
      narrativeMD: "The meeting at **42** is not the terminal value **1**, so the implicit list cycles and **2** is not happy.",
    },
    interviewTipsMD:
      "Make the implicit-list framing explicit before coding. Interviewers like this problem because it tests pattern transfer: there are no ListNode objects, but every state has exactly one next state. Mention that a hash set is also possible, then explain that fast and slow gives the same cycle detection with constant space.",
    followUps: [
      "How would you solve the same problem with a set of seen numbers?",
      "Why does the sequence eventually enter a bounded range even when **n** is large?",
      "How would the transformation change for another base, such as base 2 or base 16?",
      "How would you return the actual cycle values for a non-happy number?",
    ],
    similarProblems: [
      { title: "Linked List Cycle", difficulty: "Easy", slug: "ll-linked-list-cycle", note: "The same cycle test on explicit nodes." },
      { title: "Linked List Cycle II", difficulty: "Medium", slug: "ll-linked-list-cycle-ii", note: "Finds the entrance of a cycle once a meeting occurs." },
      { title: "Find the Duplicate Number", difficulty: "Medium", slug: "ll-find-duplicate-number", note: "Another implicit linked list built from values." },
      { title: "Ugly Number", difficulty: "Easy", url: "https://leetcode.com/problems/ugly-number/", note: "Another integer process where repeated transformations define the solution." },
    ],
    keyTakeaways: [
      "An implicit linked list can be defined by a deterministic next-state function.",
      "Happy Number reaches **1**; non-happy numbers enter a cycle that excludes **1**.",
      "Fast and slow pointers work even when nodes are generated on demand.",
      "The helper function is the pointer movement for this problem.",
    ],
    pattern:
      "For deterministic repeated transformations, treat each value as a node and run fast and slow on the next-state function to detect a terminal value or cycle.",
  },
  {
    kind: "problem",
    slug: "ll-find-duplicate-number",
    moduleId: "ll-fast-slow",
    order: 13,
    title: "Find the Duplicate Number",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/find-the-duplicate-number/",
    tags: ["Linked List", "Array", "Two Pointers", "Fast Slow", "Cycle Detection"],
    companies: ["Amazon", "Microsoft", "Google", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "Given an integer array **nums** containing **n + 1** integers where each integer is in the range **1** to **n**, return the repeated number.\n\nThere is exactly one repeated number, but it may appear more than twice. You must not modify the array and must use only constant extra space.",
    constraints: [
      "1 <= n <= 10^5",
      "nums.length == n + 1",
      "1 <= nums[i] <= n",
      "All integers in nums appear only once except for one integer that appears two or more times",
      "Do not modify nums and use only O(1) extra space",
    ],
    inputMD: "An integer array **nums** of length **n + 1**, with values constrained to valid indices from **1** through **n**.",
    outputMD: "The duplicated integer.",
    examples: [
      { input: "nums = [1,3,4,2,2]", output: "2", explanation: "Following index to value gives **0 -> 1 -> 3 -> 2 -> 4 -> 2 ...**, whose cycle entrance is value 2." },
      { input: "nums = [3,1,3,4,2]", output: "3", explanation: "The path **0 -> 3 -> 4 -> 2 -> 3 ...** enters a cycle at 3, the duplicated value." },
      { input: "nums = [1,1]", output: "1", explanation: "Both index 0 and index 1 point to value 1, so the duplicate and cycle entrance are 1." },
    ],
    learningObjectives: [
      "Model an array as a functional graph where each index has one outgoing edge.",
      "Explain why the duplicate value is the entrance to an implicit cycle.",
      "Apply Floyd's detection and reset phases without modifying the array.",
      "Respect the O(1)-space constraint that rules out sorting or hash sets.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe constraints are the signal: values are between **1** and **n**, while the array has **n + 1** positions. Treat each index as a node and **nums[index]** as the next index. That creates a one-next graph, the same shape as a linked list with a cycle.\n\nThe index-to-value-to-index mapping is what makes the trick legal. From index **i**, move to index **nums[i]**. Because every value is a valid index from **1** to **n**, the walk never leaves the array after the first move. Two different indices pointing to the same value create the merge that becomes a cycle, and the cycle entrance is exactly the duplicate value.\n\nSorting would modify the array, and a hash set would use O(n) space. Floyd's algorithm satisfies both constraints: no mutation and O(1) extra space.",
    commonMistakes: [
      "Treating values as counts instead of next indices, which misses the functional graph.",
      "Starting from every index instead of following one deterministic path from index 0.",
      "Using sorting or sign marking even though the problem forbids modifying the array.",
      "Returning the first Floyd meeting immediately instead of running the entrance reset phase.",
    ],
    algorithmMD:
      "**Key idea**\n\nBuild an implicit linked list where node **i** points to node **nums[i]**. Since there are more nodes than possible next values, the path from **0** must enter a cycle. The duplicate value is the first node in that cycle because it has multiple incoming edges.\n\n**Pointer walkthrough**\n\nFor **nums = [1,3,4,2,2]**, the path is **0 -> 1 -> 3 -> 2 -> 4 -> 2 ...**. Start **slow = nums[0] = 1** and **fast = nums[0] = 1**. First move: **slow** goes to **3**, while **fast** goes from **1** to **3** to **2**. Second move: **slow** goes from **3** to **2**, and **fast** goes from **2** to **4** to **2**, so they meet at **2**.\n\nNow reset **slow** to **nums[0] = 1** and keep **fast** at **2**. Move both one step through the index-to-value mapping: **slow** goes **1 -> 3 -> 2**, while **fast** goes **2 -> 4 -> 2**. They meet at **2**, the cycle entrance and duplicate number.\n\n**Algorithm**\n\n1. Initialise **slow = nums[0]** and **fast = nums[0]**.\n2. Repeatedly move **slow = nums[slow]** and **fast = nums[nums[fast]]** until they meet.\n3. Reset **slow = nums[0]** while **fast** remains at the meeting value.\n4. Move both one step with **nums[pointer]** until they meet again.\n5. Return the meeting value; it is the duplicate.",
    solutions: [
      {
        name: "Floyd cycle detection on indices",
        approachMD:
          "Interpret the array as a deterministic next-pointer graph. The first Floyd phase finds a meeting point inside the cycle, and the reset phase finds the cycle entrance. The entrance value is the duplicated number because multiple indices point to it.",
        walkthroughMD:
          "1. Start both pointers at **nums[0]** so the walk immediately enters the value-index domain.\n2. Use a do-while style detection phase: move **slow** once and **fast** twice until they meet.\n3. Reset **slow** to **nums[0]** and leave **fast** at the meeting value.\n4. Move both pointers one step at a time by reading **nums[pointer]**.\n5. Return the value where they meet; that value is the duplicate.",
        complexity: { time: "O(n)", space: "O(1)", note: "Floyd's two phases make a linear number of array reads and store only two pointers." },
        filename: "Solution.java",
        code: `class Solution {

    public int findDuplicate(int[] nums) {
        int slow = nums[0];
        int fast = nums[0];

        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);

        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }

        return slow;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,3,4,2,2]. Interpret each step as following **index -> nums[index]**.",
      columns: ["phase", "slow", "fast", "movement", "meaning"],
      rows: [
        ["detect start", "1", "1", "both start at nums[0]", "inside valid value indices"],
        ["detect move 1", "3", "2", "slow one read, fast two reads", "not equal"],
        ["detect move 2", "2", "2", "slow reaches 2, fast wraps to 2", "meeting inside cycle"],
        ["entry start", "1", "2", "reset slow to nums[0]", "prepare entrance search"],
        ["entry move 1", "3", "4", "both move one read", "not equal"],
        ["entry move 2", "2", "2", "both move one read", "duplicate found"],
      ],
      narrativeMD: "The second meeting is **2**. In the functional graph, that value is the cycle entrance, so it is the repeated number.",
    },
    interviewTipsMD:
      "This problem is really Linked List Cycle II wearing array clothing. Say the mapping clearly: index **i** points to index **nums[i]**. Then explain why the duplicate creates a cycle entrance rather than just a repeated edge. Also state why common alternatives are disallowed: sorting mutates the array, and a set breaks the O(1)-space requirement.",
    followUps: [
      "How would you solve it if modifying the array were allowed?",
      "How would you solve it if O(n) extra space were allowed?",
      "What changes if there can be multiple distinct duplicated values?",
      "Can you use binary search on value ranges to solve it without modifying the array?",
    ],
    similarProblems: [
      { title: "Linked List Cycle II", difficulty: "Medium", slug: "ll-linked-list-cycle-ii", note: "The reset phase is the same entrance-finding argument." },
      { title: "Linked List Cycle", difficulty: "Easy", slug: "ll-linked-list-cycle", note: "The detection phase is Floyd's cycle test." },
      { title: "Happy Number", difficulty: "Easy", slug: "ll-happy-number", note: "Another problem where next pointers are generated implicitly." },
      { title: "Find All Duplicates in an Array", difficulty: "Medium", url: "https://leetcode.com/problems/find-all-duplicates-in-an-array/", note: "A related duplicate-finding problem where in-place marking is usually allowed." },
    ],
    keyTakeaways: [
      "Array values can act as next pointers when every value is a valid index.",
      "The duplicate is the cycle entrance because it has more than one incoming edge.",
      "Floyd's algorithm satisfies both constraints: no array modification and O(1) extra space.",
      "Do not return the first meeting until the reset phase finds the entrance.",
    ],
    pattern:
      "When an array defines a one-next mapping under tight space constraints, follow values as pointers and use Floyd's detect-then-reset cycle entrance template.",
  },
];
