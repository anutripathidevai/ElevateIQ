import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "greedy-queue-reconstruction-by-height",
    moduleId: "greedy-advanced",
    order: 25,
    title: "Queue Reconstruction by Height",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/queue-reconstruction-by-height/",
    tags: ["Greedy", "Sorting", "Array", "Insertion", "Order Reconstruction"],
    companies: ["Google", "Meta", "Amazon", "Microsoft", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "You are given an array **people**, where each person is represented as **[height, k]**. The value **k** means there must be exactly **k** people in front of this person whose height is greater than or equal to **height**.\n\nReturn the queue reconstructed so every person satisfies their **k** value. The input is guaranteed to have at least one valid reconstruction.",
    constraints: [
      "1 <= people.length <= 2000",
      "0 <= height <= 10^6",
      "0 <= k < people.length",
      "The queue can be reconstructed from the given people",
    ],
    inputMD: "A two-dimensional integer array **people**, where **people[i] = [height, k]**.",
    outputMD: "A two-dimensional integer array representing a valid reconstructed queue.",
    examples: [
      {
        input: "people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]",
        output: "[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]",
        explanation: "Every person has exactly **k** people of height at least their own in front. For example, **[5,2]** has **[5,0]** and **[7,0]** before it, and **[4,4]** has four people of height at least 4 before it.",
      },
      {
        input: "people = [[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]]",
        output: "[[4,0],[5,0],[2,2],[3,2],[1,4],[6,0]]",
        explanation: "After reconstruction, each pair sees exactly its required number of taller-or-equal people before it.",
      },
    ],
    learningObjectives: [
      "Discover why sorting taller people first makes each **k** value immediately usable.",
      "Explain the exchange argument behind inserting each person at index **k**.",
      "Recognise greedy problems where the right sort key turns a global constraint into a local action.",
      "Implement index-based insertion cleanly with a linked list style structure.",
    ],
    intuitionMD:
      "The hard part is choosing which people can be placed without being disturbed later. If you place short people first, every taller person inserted later can change the short person count in front, so their **k** values are unstable.\n\nReverse the perspective: place taller people first. Once all already-placed people are at least as tall as the current person, inserting the current person at position **k** creates exactly **k** taller-or-equal people before them. Later insertions are shorter, so they never increase anyone's taller-or-equal count. The non-obvious greedy insight is the sort key: height descending, and for equal height, **k** ascending.",
    commonMistakes: [
      "Sorting by **k** first and then trying to adjust heights afterward.",
      "Sorting height ascending, which lets later taller insertions invalidate earlier placements.",
      "Forgetting the equal-height tie-breaker by **k** ascending.",
      "Appending instead of inserting at index **k** after the descending-height sort.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nSort people by height descending. When two people have the same height, sort by **k** ascending. Then scan this order and insert each person into the current queue at index **k**.\n\n**Why it works**\n\nAt the moment we insert a person, everyone already in the partial queue is at least as tall. Therefore the number of qualifying people before that person is exactly their insertion index. People inserted later are shorter, so they may stand before this person physically, but they do not count toward this person's **k** requirement.\n\n**Proof of correctness**\n\nConsider the first person in the sorted order where a valid optimal queue differs from the greedy placement. All earlier people are taller, or the same height with smaller **k**, and are placed consistently. The current person needs exactly **k** qualifying people before them, and among already-placed people all qualify. Moving this current person to index **k** among the placed taller-or-equal people satisfies their requirement. This move does not harm earlier people because the current person is no taller than them and, for equal height, has no smaller **k** than those already placed. It also cannot harm later people because they have not been placed yet and are no taller. Thus any optimal queue can be transformed to match the greedy choice step by step.\n\n**Algorithm**\n\n1. Sort **people** by height descending.\n2. For equal heights, sort by **k** ascending.\n3. Create an initially empty list for the queue.\n4. For each sorted person, insert them into the list at index **k**.\n5. Convert the list back to a two-dimensional array and return it.",
    solutions: [
      {
        name: "Descending height sort with indexed insertion",
        approachMD:
          "Sort so every already-placed person is tall enough to matter for the current person's **k** value. Then the local action is direct: insert the current pair at index **k**.",
        walkthroughMD:
          "1. Sort the array using height descending and **k** ascending as the tie-breaker.\n2. Maintain a list representing the reconstructed prefix.\n3. For each person in sorted order, insert the pair at position **person[1]**.\n4. Return the list as an array once all people have been inserted.",
        complexity: {
          time: "O(n^2)",
          space: "O(n)",
          note: "Sorting costs O(n log n), but indexed insertion in a linked list still shifts or traverses positions, giving O(n^2) overall.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

class Solution {

    public int[][] reconstructQueue(int[][] people) {
        Arrays.sort(people, (first, second) -> {
            if (first[0] != second[0]) {
                return Integer.compare(second[0], first[0]);
            }
            return Integer.compare(first[1], second[1]);
        });

        List<int[]> queue = new LinkedList<>();
        for (int[] person : people) {
            queue.add(person[1], person);
        }

        return queue.toArray(new int[people.length][]);
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "people = [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]. Sort by height descending, then by **k** ascending.",
      columns: ["step", "person inserted", "insert index", "queue before", "queue after"],
      rows: [
        ["1", "[7,0]", "0", "[]", "[[7,0]]"],
        ["2", "[7,1]", "1", "[[7,0]]", "[[7,0],[7,1]]"],
        ["3", "[6,1]", "1", "[[7,0],[7,1]]", "[[7,0],[6,1],[7,1]]"],
        ["4", "[5,0]", "0", "[[7,0],[6,1],[7,1]]", "[[5,0],[7,0],[6,1],[7,1]]"],
        ["5", "[5,2]", "2", "[[5,0],[7,0],[6,1],[7,1]]", "[[5,0],[7,0],[5,2],[6,1],[7,1]]"],
        ["6", "[4,4]", "4", "[[5,0],[7,0],[5,2],[6,1],[7,1]]", "[[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]]"],
      ],
      narrativeMD:
        "The final queue is valid because each insertion counted only people already present, all of whom were tall enough to contribute. Later shorter insertions do not change those counts.",
    },
    interviewTipsMD:
      "Lead with the instability of placing short people first, then introduce the descending-height sort as the stabilising move. Interviewers care less about the data structure and more about whether you can justify why **k** becomes an insertion index after the sort. If asked about performance, mention that an order-statistics tree can improve indexed placement in languages or libraries that support it, but the standard interview solution is the clear O(n^2) insertion method.",
    followUps: [
      "How would you reconstruct the queue if **n** were very large and O(n^2) insertion was too slow?",
      "What changes if **k** counted strictly taller people instead of taller-or-equal people?",
      "Can you validate whether a proposed reconstructed queue satisfies all constraints?",
      "How would duplicate people with identical **height** and **k** be handled?",
    ],
    similarProblems: [
      {
        title: "Hand of Straights",
        difficulty: "Medium",
        slug: "greedy-hand-of-straights",
        note: "Also relies on processing sorted structure in the only order that keeps the greedy choice safe.",
      },
      {
        title: "Non-overlapping Intervals",
        difficulty: "Medium",
        slug: "greedy-non-overlapping-intervals",
        note: "Another problem where the sort key is the main insight.",
      },
      {
        title: "Maximum Number of Events That Can Be Attended",
        difficulty: "Medium",
        slug: "greedy-maximum-events-attended",
        note: "Greedy ordering turns a global schedule into local choices.",
      },
      {
        title: "Car Fleet",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/car-fleet/",
        note: "Sort by position and reason about what later objects can or cannot change.",
      },
    ],
    keyTakeaways: [
      "When later elements can invalidate earlier decisions, process the elements that cannot be affected first.",
      "For this problem, height descending makes **k** equal to an insertion index.",
      "The tie-breaker **k** ascending is necessary for equal-height people.",
      "A strong greedy proof often shows later work cannot break an earlier invariant.",
    ],
    pattern:
      "Sort by the constraint that makes previous placements permanent, then insert each item at the position implied by its remaining local requirement.",
  },
  {
    kind: "problem",
    slug: "greedy-hand-of-straights",
    moduleId: "greedy-advanced",
    order: 26,
    title: "Hand of Straights",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/hand-of-straights/",
    tags: ["Greedy", "Sorting", "TreeMap", "Hash Map", "Counting"],
    companies: ["Google", "Amazon", "Microsoft", "Uber", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an integer array **hand**, where **hand[i]** is a card value, and an integer **groupSize**. Return whether the cards can be rearranged into groups of size **groupSize** such that each group contains **groupSize** consecutive card values.",
    constraints: [
      "1 <= hand.length <= 10^4",
      "0 <= hand[i] <= 10^9",
      "1 <= groupSize <= hand.length",
    ],
    inputMD: "An integer array **hand** and an integer **groupSize**.",
    outputMD: "A boolean: **true** if the hand can be partitioned into consecutive groups of size **groupSize**, otherwise **false**.",
    examples: [
      {
        input: "hand = [1,2,3,6,2,3,4,7,8], groupSize = 3",
        output: "true",
        explanation: "The cards can form consecutive groups **[1,2,3]**, **[2,3,4]**, and **[6,7,8]**.",
      },
      {
        input: "hand = [1,2,3,4,5], groupSize = 4",
        output: "false",
        explanation: "The hand length is not divisible by 4, so it cannot be partitioned into equal-size groups.",
      },
      {
        input: "hand = [1,2,3,4,5,6], groupSize = 2",
        output: "true",
        explanation: "One valid grouping is **[1,2]**, **[3,4]**, and **[5,6]**.",
      },
    ],
    learningObjectives: [
      "Use the smallest remaining card to force the start of the next consecutive group.",
      "Maintain sorted counts with a **TreeMap** or equivalent ordered map.",
      "Explain why delaying the minimum remaining card is impossible in any valid grouping.",
      "Implement count consumption without accidentally reusing cards.",
    ],
    intuitionMD:
      "The smallest remaining card has no smaller card available to appear before it. Therefore, if it belongs to any consecutive group of size **groupSize**, it must be the first card of that group. That removes all choice: once you see the current minimum, you must consume that value and the next **groupSize - 1** values.\n\nThis is the greedy insight. Do not try to assemble arbitrary groups or pick from the middle. Always start from the smallest remaining card and force the only possible run beginning there. A sorted count map gives both pieces you need: the current minimum and the remaining multiplicities.",
    commonMistakes: [
      "Starting groups from an arbitrary card instead of the smallest remaining card.",
      "Using a normal hash map without also processing keys in sorted order.",
      "Forgetting the early divisibility check for **hand.length % groupSize**.",
      "Removing a key too early or allowing a count to go negative.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nCount all cards in sorted order. While cards remain, take the smallest remaining value **start** and try to consume **start, start + 1, ... start + groupSize - 1** once each.\n\n**Why it works**\n\nThe smallest remaining card cannot be placed anywhere except the beginning of a consecutive group, because there is no smaller card left to precede it. Once that group starts, all following values in the run are forced. If any required value is missing, no valid grouping can exist.\n\n**Proof of correctness**\n\nTake any valid partition of the current remaining cards. Let **x** be the smallest remaining card. In that partition, **x** must be in some consecutive group. Since no value smaller than **x** remains, **x** must be the first value of that group, so the group must contain **x, x + 1, ... x + groupSize - 1**. The greedy algorithm removes exactly this forced group. Removing a forced group from a valid partition leaves a valid partition of the remaining cards. Repeating the argument proves that if the greedy process never fails, it builds a valid partition, and if it fails, no valid partition could have existed at that step.\n\n**Algorithm**\n\n1. If **hand.length** is not divisible by **groupSize**, return **false**.\n2. Build a sorted count map from card value to frequency.\n3. While the map is not empty, read the smallest key as **start**.\n4. For each value from **start** through **start + groupSize - 1**, require a positive count.\n5. Decrement each required count and remove the key when the count reaches zero.\n6. If every forced run is consumed, return **true**.",
    solutions: [
      {
        name: "TreeMap counts from smallest card",
        approachMD:
          "Use a sorted frequency map so the smallest remaining card is always available. Each iteration starts a forced run at that smallest card and consumes **groupSize** consecutive counts.",
        walkthroughMD:
          "1. Return **false** immediately if the number of cards cannot split evenly into groups.\n2. Count every card value in a **TreeMap**.\n3. While counts remain, let **start** be the smallest key.\n4. For each consecutive value in the required run, check that the count exists.\n5. Decrement the count, removing the value when its count becomes zero.\n6. If all runs are consumed, return **true**.",
        complexity: {
          time: "O(n log n)",
          space: "O(n)",
          note: "Each card is consumed once, and every ordered-map operation costs O(log n) in the number of distinct values.",
        },
        filename: "Solution.java",
        code: `import java.util.TreeMap;

class Solution {

    public boolean isNStraightHand(int[] hand, int groupSize) {
        if (hand.length % groupSize != 0) {
            return false;
        }

        TreeMap<Integer, Integer> counts = new TreeMap<>();
        for (int card : hand) {
            counts.put(card, counts.getOrDefault(card, 0) + 1);
        }

        while (!counts.isEmpty()) {
            int start = counts.firstKey();
            for (int card = start; card < start + groupSize; card++) {
                Integer count = counts.get(card);
                if (count == null) {
                    return false;
                }

                if (count == 1) {
                    counts.remove(card);
                } else {
                    counts.put(card, count - 1);
                }
            }
        }

        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "hand = [1,2,3,6,2,3,4,7,8], groupSize = 3. Initial counts are **1:1, 2:2, 3:2, 4:1, 6:1, 7:1, 8:1**.",
      columns: ["run", "card consumed", "count before", "action", "smallest remaining after action"],
      rows: [
        ["start at 1", "1", "1", "remove 1", "2"],
        ["start at 1", "2", "2", "decrement to 1", "2"],
        ["start at 1", "3", "2", "decrement to 1", "2"],
        ["start at 2", "2", "1", "remove 2", "3"],
        ["start at 2", "3", "1", "remove 3", "4"],
        ["start at 2", "4", "1", "remove 4", "6"],
        ["start at 6", "6", "1", "remove 6", "7"],
        ["start at 6", "7", "1", "remove 7", "8"],
        ["start at 6", "8", "1", "remove 8", "none"],
      ],
      narrativeMD:
        "Every smallest remaining card successfully starts a full consecutive run. After the final removal, no cards remain, so the hand can be partitioned.",
    },
    interviewTipsMD:
      "State the forced-choice argument clearly: the minimum remaining card must start a group. That single sentence is usually the proof interviewers want to hear. Also mention that the data structure can be a **TreeMap**, or a sorted array plus counts, as long as you repeatedly process values from smallest to largest.",
    followUps: [
      "How would you solve the same problem with sorting plus a hash map instead of a **TreeMap**?",
      "What if each group could have size at least **groupSize** instead of exactly **groupSize**?",
      "How would you return the actual groups, not just whether they exist?",
      "What changes if card values arrive as a stream and you cannot sort all of them upfront?",
    ],
    similarProblems: [
      {
        title: "Queue Reconstruction by Height",
        difficulty: "Medium",
        slug: "greedy-queue-reconstruction-by-height",
        note: "Both problems become simple after processing elements in the right sorted order.",
      },
      {
        title: "Task Scheduler",
        difficulty: "Medium",
        slug: "greedy-task-scheduler",
        note: "Uses counts to decide whether a schedule can be arranged under constraints.",
      },
      {
        title: "Maximum Number of Events That Can Be Attended",
        difficulty: "Medium",
        slug: "greedy-maximum-events-attended",
        note: "Another sorted greedy process that repeatedly chooses the earliest forced option.",
      },
      {
        title: "Divide Array in Sets of K Consecutive Numbers",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/divide-array-in-sets-of-k-consecutive-numbers/",
        note: "Nearly identical consecutive grouping requirement with different naming.",
      },
    ],
    keyTakeaways: [
      "The smallest remaining card is forced to start a group.",
      "A sorted count map turns that forced choice into a simple loop.",
      "If any required consecutive value is missing, the failure is final, not local.",
      "Greedy grouping proofs often remove one forced group and recurse on the remainder.",
    ],
    pattern:
      "Repeatedly take the smallest remaining item; if its role is forced, consume the entire structure it forces and continue.",
  },
  {
    kind: "problem",
    slug: "greedy-boats-to-save-people",
    moduleId: "greedy-advanced",
    order: 27,
    title: "Boats to Save People",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/boats-to-save-people/",
    tags: ["Greedy", "Sorting", "Two Pointers", "Array", "Pairing"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 15,
    statementMD:
      "You are given an array **people**, where **people[i]** is the weight of one person, and an integer **limit**. Each boat can carry at most two people at the same time, as long as their combined weight is at most **limit**.\n\nReturn the minimum number of boats needed to carry everyone. Every person's weight is at most **limit**, so each person can always ride alone if necessary.",
    constraints: [
      "1 <= people.length <= 5 * 10^4",
      "1 <= people[i] <= limit <= 3 * 10^4",
      "Each boat carries at most two people",
    ],
    inputMD: "An integer array **people** of weights and an integer **limit**.",
    outputMD: "An integer: the minimum number of boats required to rescue everyone.",
    examples: [
      {
        input: "people = [1,2], limit = 3",
        output: "1",
        explanation: "The two people fit together in one boat because 1 + 2 <= 3.",
      },
      {
        input: "people = [3,2,2,1], limit = 3",
        output: "3",
        explanation: "One 3-weight person rides alone, and the remaining people can be rescued as **[1,2]** and **[2]**.",
      },
      {
        input: "people = [3,5,3,4], limit = 5",
        output: "4",
        explanation: "No pair with the 5-weight or 4-weight people fits, and the two 3-weight people also exceed the limit together.",
      },
    ],
    learningObjectives: [
      "Use sorting to expose the lightest and heaviest remaining people.",
      "Explain why the heaviest remaining person should be assigned a boat immediately.",
      "Prove the safe pairing of the heaviest person with the lightest possible partner.",
      "Implement a two-pointer greedy loop without off-by-one errors.",
    ],
    intuitionMD:
      "Focus on the heaviest remaining person. They must leave on the next boat in some optimal solution, either alone or with one partner. If even the lightest remaining person cannot fit with them, no one can, so sending the heaviest alone is forced.\n\nIf the lightest can fit with the heaviest, pairing them is safe. The lightest is the easiest person to pair with anyone else, but using them with the heaviest does not block a better pairing for the heaviest because every other possible partner is heavier. This gives the classic sorted two-pointer greedy: try to pair the extremes, always consume the heaviest, and use one boat per step.",
    commonMistakes: [
      "Trying to pair the two lightest people first, which can strand heavy people unnecessarily.",
      "Moving both pointers even when the lightest does not fit with the heaviest.",
      "Forgetting that each boat can carry at most two people, not any number under the limit.",
      "Returning the number of successful pairs instead of the total number of boats.",
    ],
    algorithmMD:
      "**Greedy strategy**\n\nSort the weights. Keep **left** at the lightest remaining person and **right** at the heaviest remaining person. Use one boat for the heaviest person every iteration. If the lightest and heaviest fit together, put them together and move both pointers; otherwise, the heaviest rides alone and only **right** moves.\n\n**Why it works**\n\nThe heaviest remaining person must be placed in some boat. If they cannot fit with the lightest remaining person, they cannot fit with anyone, so a solo boat is forced. If they can fit with the lightest, pairing them is safe because the lightest is the least restrictive possible partner, and the heaviest could not get a better partner that saves more than one boat.\n\n**Proof of correctness**\n\nConsider an optimal solution for the remaining people and let **H** be the heaviest person. If **H** cannot fit with the lightest person **L**, then **H** cannot fit with any remaining person, so every optimal solution gives **H** a solo boat, matching the greedy choice. If **H** can fit with **L**, take any optimal solution. If **H** already rides with **L**, it matches greedy. Otherwise, suppose **H** rides with **P** or alone, and **L** rides with **Q** or alone. Put **H** with **L**. If **H** was alone, the old boat containing **L** can still carry its other passenger alone if needed. If **H** rode with **P** and **L** was alone, then **P** can ride alone in **L**'s old boat. If **H** rode with **P** and **L** rode with **Q**, then **P + Q <= H + P <= limit** because **H** is the heaviest person and **H + P** was valid, so **P** can take **L**'s old place. In every case the boat count does not increase, creating an optimal solution matching the greedy choice. Repeating the argument proves the algorithm is optimal.\n\n**Algorithm**\n\n1. Sort **people** in nondecreasing order.\n2. Set **left = 0**, **right = people.length - 1**, and **boats = 0**.\n3. While **left <= right**, reserve one boat for **people[right]**.\n4. If **people[left] + people[right] <= limit**, increment **left** to include the lightest person in that boat.\n5. Always decrement **right** because the heaviest person has been assigned.\n6. Increment **boats** and continue until everyone is assigned.",
    solutions: [
      {
        name: "Sorted two pointers",
        approachMD:
          "After sorting, each step decides the fate of the heaviest remaining person. Pair them with the lightest remaining person if possible; otherwise send the heaviest alone.",
        walkthroughMD:
          "1. Sort the weights in ascending order.\n2. Place **left** at the smallest weight and **right** at the largest weight.\n3. If the two weights fit within **limit**, move **left** because the lightest person shares the boat.\n4. Move **right** every iteration because the heaviest person is always assigned.\n5. Count one boat for each iteration and return the count.",
        complexity: {
          time: "O(n log n)",
          space: "O(log n)",
          note: "Sorting dominates the runtime; the two-pointer scan is linear and Java's primitive array sort uses logarithmic stack space.",
        },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public int numRescueBoats(int[] people, int limit) {
        Arrays.sort(people);

        int left = 0;
        int right = people.length - 1;
        int boats = 0;

        while (left <= right) {
            if (people[left] + people[right] <= limit) {
                left++;
            }
            right--;
            boats++;
        }

        return boats;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "people = [3,2,2,1], limit = 3. After sorting, weights are **[1,2,2,3]**.",
      columns: ["step", "left index and weight", "right index and weight", "decision", "boats used"],
      rows: [
        ["1", "0 -> 1", "3 -> 3", "1 + 3 > 3, send 3 alone", "1"],
        ["2", "0 -> 1", "2 -> 2", "1 + 2 <= 3, pair them", "2"],
        ["3", "1 -> 2", "1 -> 2", "only one 2 remains, send alone", "3"],
      ],
      narrativeMD:
        "Each row assigns the heaviest remaining person. The algorithm uses three boats, which is optimal for this input.",
    },
    interviewTipsMD:
      "Explain why the algorithm reasons about the heaviest remaining person, not the lightest. The heaviest has the fewest pairing options, so their boat should be decided now. If a pair with the lightest fails, the solo decision is forced; if it succeeds, pairing them cannot reduce future options in a way that costs an extra boat.",
    followUps: [
      "What changes if each boat could carry up to **k** people instead of two?",
      "How would you solve it if the weights were already sorted?",
      "How would you return the actual boat assignments?",
      "What if there were different boat limits instead of one shared **limit**?",
    ],
    similarProblems: [
      {
        title: "Two Sum II - Input Array Is Sorted",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
        note: "Uses the same sorted two-pointer movement over light and heavy ends.",
      },
      {
        title: "Assign Cookies",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/assign-cookies/",
        note: "Another sorted pairing problem where the least demanding available item is used carefully.",
      },
      {
        title: "Non-overlapping Intervals",
        difficulty: "Medium",
        slug: "greedy-non-overlapping-intervals",
        note: "A different greedy proof style, but also built around a safe local choice after sorting.",
      },
      {
        title: "Queue Reconstruction by Height",
        difficulty: "Medium",
        slug: "greedy-queue-reconstruction-by-height",
        note: "Another advanced sorted greedy where the order makes local placement safe.",
      },
    ],
    keyTakeaways: [
      "The heaviest remaining person is the constrained item and should be assigned immediately.",
      "If the lightest cannot pair with the heaviest, nobody can.",
      "If the lightest can pair with the heaviest, that pairing is safe by exchange.",
      "One two-pointer iteration always consumes the heaviest person and exactly one boat.",
    ],
    pattern:
      "Sort, then repeatedly decide the most constrained remaining item by pairing it with the least costly compatible partner when possible.",
  },
];
