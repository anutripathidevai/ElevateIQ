import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "iv-interval-representation",
    moduleId: "intervals-fundamentals",
    order: 1,
    title: "Interval Representation",
    estimatedReadingMin: 7,
    tags: ["Intervals", "Representation", "Endpoints"],
    summaryMD:
      "An interval is a compact promise about a continuous range, and most interview bugs come from not deciding exactly what its two endpoints mean.",
    sections: [
      {
        heading: "The Pair Is the Contract",
        bodyMD:
          "An interval is usually modeled as **[start, end]**: one number names where the range begins, and the other names where it stops. In Java interview problems, that almost always becomes either one **int[]** of length two or an **int[][]** collection where each row is one interval.\n\nThat representation is deliberately small. It keeps the algorithm focused on comparisons between boundaries rather than object design. For **[[1,3],[2,6],[8,10]]**, the row **[1,3]** means **start = 1** and **end = 3**. The outer array is just the list of ranges to sort, merge, select, or compare.",
      },
      {
        heading: "Closed vs Half-Open Ranges",
        bodyMD:
          "A closed interval **[1,3]** includes both endpoints: **1**, **2**, and **3** are inside the range if the domain is integer. A half-open interval **[1,3)** includes **1** and **2**, but not **3**. Many scheduling APIs prefer half-open ranges because a meeting from **10** to **11** and a meeting from **11** to **12** do not conflict.\n\nMost LeetCode interval array problems use closed-looking notation unless the prompt explicitly says otherwise. Calendar booking problems often use half-open language, even when they still display arrays. The notation changes the overlap test, so do not treat endpoint convention as cosmetic.",
      },
      {
        heading: "Endpoint Convention Changes Overlap",
        bodyMD:
          "For closed intervals, touching endpoints count as shared coverage. **[1,3]** and **[3,5]** overlap because the value **3** belongs to both. The overlap condition is **a <= d && c <= b** for intervals **[a,b]** and **[c,d]**.\n\nFor half-open intervals, touching endpoints usually do not conflict. **[1,3)** and **[3,5)** are adjacent, not overlapping, because the first interval has already ended when the second starts. The strict version becomes **a < d && c < b**. That one-character difference is the source of many accepted or rejected edge cases.",
      },
      {
        heading: "Why Arrays Dominate Interview Encoding",
        bodyMD:
          "The plain **int[][]** representation is fast to scan, easy to sort with **Arrays.sort**, and close to the way test cases are written. It also makes the core invariant visible: every decision is about **interval[0]** as the start and **interval[1]** as the end.\n\nCustom classes can improve readability in production, but they add ceremony in an interview unless the problem already provides an **Interval** type. The safest habit is to translate the prompt into two names immediately: **start** and **end**. Once those names are clear, sorting, overlap checks, and merge logic become local boundary comparisons.",
      },
    ],
    codeExamples: [
      {
        title: "Closed and half-open overlap tests",
        language: "java",
        code: `class Solution {
    boolean overlapsClosed(int[] first, int[] second) {
        return first[0] <= second[1] && second[0] <= first[1];
    }

    boolean overlapsHalfOpen(int[] first, int[] second) {
        return first[0] < second[1] && second[0] < first[1];
    }
}`,
        captionMD:
          "The representation is identical, but the endpoint convention changes **<=** to **<** when touching boundaries should be allowed.",
      },
    ],
    keyTakeaways: [
      "An interval pair stores start at index 0 and end at index 1.",
      "Closed intervals include both endpoints, while half-open intervals exclude the right endpoint.",
      "Touching endpoints overlap for closed intervals but not for half-open scheduling ranges.",
      "Decide endpoint semantics before writing the comparison logic.",
    ],
  },
  {
    kind: "concept",
    slug: "iv-sorting-intervals",
    moduleId: "intervals-fundamentals",
    order: 2,
    title: "Sorting Intervals",
    estimatedReadingMin: 8,
    tags: ["Intervals", "Sorting", "Comparator", "Greedy"],
    summaryMD:
      "Sorting intervals turns a global geometry problem into a left-to-right sequence of local boundary decisions.",
    sections: [
      {
        heading: "Why Sorting Is Almost Always First",
        bodyMD:
          "Unsorted intervals hide the nearest competitor. If **[8,10]** appears before **[1,3]** and **[2,6]**, a merge algorithm cannot know whether the current interval is final. Sorting establishes a direction so the next interval is the only new boundary that can affect the current decision.\n\nAfter sorting, many interval problems become sweeps. You carry a current merged range, a chosen end boundary, or a room count, then update it with the next interval. The cost is usually **O(n log n)** for sorting, followed by an **O(n)** scan.",
      },
      {
        heading: "Sort by Start for Building Ranges",
        bodyMD:
          "When the task is to merge, insert, or produce actual combined intervals, sort by **start**. This makes intervals arrive in the order they begin on the number line. For **[1,3]**, **[2,6]**, **[8,10]**, the carried interval can only be extended by a later start; no unseen interval begins before **1** after the sort.\n\nThis is why Merge Intervals and Insert Interval use start order. The algorithm needs to know whether the next interval begins before the current carried interval ends. Sorting by end would lose the clean left boundary needed to emit merged ranges in order.",
      },
      {
        heading: "Sort by End for Greedy Selection",
        bodyMD:
          "When the task is to keep as many non-overlapping intervals as possible, remove the fewest, or place the minimum number of arrows, sort by **end**. The greedy choice is usually to commit to the interval that finishes earliest because it leaves the most room for future intervals.\n\nFor example, with **[1,10]**, **[2,3]**, and **[4,5]**, choosing the long interval first blocks two smaller compatible choices. Sorting by end considers **[2,3]** before **[4,5]**, which is the structure behind Non-overlapping Intervals and Minimum Arrows to Burst Balloons.",
      },
      {
        heading: "Comparator Discipline in Java",
        bodyMD:
          "You will often see **Arrays.sort(intervals, (a, b) -> a[0] - b[0])** in examples. It is compact and works for small endpoint ranges, but subtraction can overflow when values are near integer limits. Overflow can reverse the ordering and make the sweep silently wrong.\n\nPrefer **Integer.compare(a[0], b[0])** for start order and **Integer.compare(a[1], b[1])** for end order. If ties matter, add a secondary comparison deliberately, such as sorting by start then end. A comparator is not just syntax; it defines the geometry your algorithm will see.",
      },
    ],
    codeExamples: [
      {
        title: "Overflow-safe interval comparators",
        language: "java",
        code: `import java.util.Arrays;

class Solution {
    void sortByStart(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> {
            int byStart = Integer.compare(a[0], b[0]);
            if (byStart != 0) {
                return byStart;
            }
            return Integer.compare(a[1], b[1]);
        });
    }

    void sortByEnd(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> {
            int byEnd = Integer.compare(a[1], b[1]);
            if (byEnd != 0) {
                return byEnd;
            }
            return Integer.compare(a[0], b[0]);
        });
    }
}`,
        captionMD:
          "Use start order when constructing merged ranges, and end order when the greedy proof depends on finishing as early as possible.",
      },
    ],
    keyTakeaways: [
      "Sorting makes interval decisions local by imposing a number-line order.",
      "Use start order for merge, insert, and output construction problems.",
      "Use end order for greedy selection problems that keep or hit intervals.",
      "Prefer Integer.compare over subtraction when endpoint values may be large.",
    ],
  },
  {
    kind: "concept",
    slug: "iv-overlapping-intervals",
    moduleId: "intervals-fundamentals",
    order: 3,
    title: "Overlapping Intervals",
    estimatedReadingMin: 8,
    tags: ["Intervals", "Overlap", "Sorting"],
    summaryMD:
      "Overlap is a two-sided boundary relationship: each interval must start before the other one has already ended.",
    sections: [
      {
        heading: "The Exact Closed-Interval Test",
        bodyMD:
          "For two closed intervals **[a,b]** and **[c,d]**, they overlap iff **a <= d** and **c <= b**. The first condition says the first interval starts no later than the second interval ends. The second says the second interval starts no later than the first interval ends. Both must be true.\n\nThis symmetric test is safer than relying on intuition from pictures. **[1,3]** and **[2,6]** overlap because **1 <= 6** and **2 <= 3**. **[1,3]** and **[4,6]** do not overlap because **4 <= 3** is false.",
      },
      {
        heading: "Touching Endpoints Are a Convention",
        bodyMD:
          "In closed interval problems, **[1,3]** and **[3,5]** overlap at the point **3**. That means merge logic should use **next.start <= current.end**. If the prompt says intervals are half-open, then **[1,3)** and **[3,5)** are compatible, so the check becomes **next.start < current.end**.\n\nBefore solving, translate the problem statement into one sentence: do intervals that touch conflict? Meeting rooms often say no because one meeting can end exactly when another starts. Merge Intervals often says yes because the endpoint belongs to both ranges.",
      },
      {
        heading: "Sorting Reduces the Test",
        bodyMD:
          "After sorting by **start**, adjacent comparison becomes enough for many tasks. If **current.start <= next.start**, then the condition **current.start <= next.end** is usually already true for valid intervals. The only remaining question is whether **next.start <= current.end**.\n\nThat is the local comparison behind merge sweeps. Carry **[1,6]**, see **[5,7]**, and overlap because **5 <= 6**. Carry **[1,6]**, see **[8,10]**, and stop because **8 <= 6** is false. The sort turns the symmetric formula into a one-sided neighbor test.",
      },
      {
        heading: "Common Failure Modes",
        bodyMD:
          "The first mistake is using **<** when the problem expects closed intervals, which leaves **[1,3]** and **[3,5]** separated incorrectly. The second is using **<=** for half-open calendar bookings, which rejects valid back-to-back meetings.\n\nThe third mistake is comparing the next interval with the wrong end. In a merge, the carried end may have grown from **3** to **6** after seeing **[2,6]**. Later intervals must compare against the updated carried end, not the end of the original first interval.",
      },
    ],
    codeExamples: [
      {
        title: "Overlap checks before and after sorting",
        language: "java",
        code: `import java.util.Arrays;

class Solution {
    boolean overlapsClosed(int[] first, int[] second) {
        return first[0] <= second[1] && second[0] <= first[1];
    }

    boolean hasAnyOverlapAfterSorting(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        for (int i = 1; i < intervals.length; i++) {
            int[] previous = intervals[i - 1];
            int[] current = intervals[i];
            if (current[0] <= previous[1]) {
                return true;
            }
        }
        return false;
    }
}`,
        captionMD:
          "The full test is symmetric, but start-sorted neighbors only need to ask whether the next start crosses the previous end.",
      },
    ],
    keyTakeaways: [
      "Closed intervals overlap when a <= d and c <= b.",
      "For start-sorted valid intervals, the local overlap check becomes next start <= current end.",
      "Endpoint equality is overlap for closed ranges and compatibility for half-open ranges.",
      "Always compare against the updated carried end when a range has already been extended.",
    ],
  },
  {
    kind: "concept",
    slug: "iv-merge-strategy",
    moduleId: "intervals-fundamentals",
    order: 4,
    title: "Merge Strategy",
    estimatedReadingMin: 8,
    tags: ["Intervals", "Merge", "Sweep", "Template"],
    summaryMD:
      "The core merge strategy is a carry-and-extend sweep: sort by start, keep one active interval, and emit it only when the next interval begins after it ends.",
    sections: [
      {
        heading: "Carry One Active Interval",
        bodyMD:
          "Merging is not about comparing every pair. Once intervals are sorted by **start**, you only need one active range called the current interval. It represents everything seen so far that belongs to the same connected block on the number line.\n\nStart with the first interval as current. When the next interval overlaps it, the block is still connected, so extend the current end. When the next interval starts after current ends, the block is complete. Emit current, then begin a new block.",
      },
      {
        heading: "The Extend-or-Emit Decision",
        bodyMD:
          "The closed-interval merge condition is **next.start <= current.end**. If true, the two ranges touch or overlap, so the merged block ends at **max(current.end, next.end)**. For **[1,3]** followed by **[2,6]**, carry **[1,3]**, see **2 <= 3**, and extend to **[1,6]**.\n\nIf the condition is false, the next interval begins strictly after the carried range. For **[1,6]** followed by **[8,10]**, **8 <= 6** is false, so **[1,6]** can never be affected by later intervals. Sorting guarantees every later start is at least **8**, so it is safe to emit.",
      },
      {
        heading: "Why the Sweep Is Correct",
        bodyMD:
          "The invariant is that current is the merged result of all processed intervals that have not yet been emitted. Its **start** is the earliest start in that block, and its **end** is the farthest end seen among overlapping intervals in that block.\n\nWhen the next interval overlaps, extending preserves the invariant because the block remains connected. When it does not overlap, no future interval can bridge the gap because starts are sorted. That gap proves the current block is final, which is why emitting is safe.",
      },
      {
        heading: "The Template Behind the Merge Module",
        bodyMD:
          "This exact structure powers more than the basic Merge Intervals problem. Insert Interval adds one new interval and then performs the same coalescing logic. Meeting-room variants use the same sorted boundaries but count conflicts instead of emitting merged ranges. Covered-interval and intersection problems also depend on tracking an active boundary correctly.\n\nThe reusable mental template is: sort by the boundary that makes the next decision local, carry the state that summarizes processed intervals, then either extend that state or finalize it. For module two, the boundary is usually **start**, and the carried state is the active merged interval.",
      },
    ],
    codeExamples: [
      {
        title: "Carry-and-extend merge loop",
        language: "java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length == 0) {
            return new int[0][2];
        }

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> merged = new ArrayList<>();
        int[] current = new int[] { intervals[0][0], intervals[0][1] };

        for (int i = 1; i < intervals.length; i++) {
            int[] next = intervals[i];
            if (next[0] <= current[1]) {
                current[1] = Math.max(current[1], next[1]);
            } else {
                merged.add(current);
                current = new int[] { next[0], next[1] };
            }
        }

        merged.add(current);
        return merged.toArray(new int[merged.size()][]);
    }
}`,
        captionMD:
          "The loop emits an interval only after the sorted order proves that no later start can merge into the carried range.",
      },
    ],
    keyTakeaways: [
      "Merge sweeps sort by start and carry one active interval.",
      "If the next start is <= the current end, extend the current end with the maximum end.",
      "If the next start is greater than the current end, emit the current interval and start a new one.",
      "The same carry-and-extend invariant underlies insert, merge, and many scheduling variants.",
    ],
  },
];
