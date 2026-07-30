import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "arr-array-basics",
    moduleId: "arr-fundamentals",
    order: 1,
    title: "Array Basics",
    estimatedReadingMin: 7,
    tags: ["Array", "Memory", "Indexing"],
    summaryMD:
      "Arrays store same-typed elements in index order, giving constant-time access because each position has a predictable address.",
    sections: [
      {
        heading: "The Mental Model",
        bodyMD:
          "An array is a sequence of elements laid out by index: position **0**, position **1**, position **2**, and so on. In the ideal machine model used for interviews, those elements occupy consecutive memory slots, so moving from one index to the next means moving by exactly one element size.\n\nThis is why arrays are the default structure for ordered data. They do not store links between elements. The index itself is the navigation system, and that makes array operations feel simple until insertion, deletion, or resizing forces many elements to move.",
      },
      {
        heading: "Why Indexing Is O(1)",
        bodyMD:
          "The key formula is **address = base + index * elementSize**. If the machine knows where the array begins, how large each element is, and which index you want, it can compute the target location directly. It does not need to scan earlier elements.\n\nThat direct-address calculation is the reason **arr[i]** is **O(1)**. It is also why arrays require a fixed element type or fixed-size references: without a predictable element size, the formula would not work cleanly.",
      },
      {
        heading: "Cache Friendliness",
        bodyMD:
          "Modern CPUs read memory in chunks called cache lines. Because adjacent array elements are near each other, a left-to-right scan often benefits from data that has already been pulled into cache. This is one reason simple array loops can beat pointer-heavy structures even when both have the same big-O complexity.\n\nInterviewers usually do not expect hardware details, but they do expect engineering judgment. When you can solve a problem with a linear scan over an array, it is often both asymptotically good and practically fast.",
      },
      {
        heading: "Two-Dimensional Arrays and Row-Major Order",
        bodyMD:
          "A matrix is usually discussed as rows and columns. In row-major order, cells from row **0** come first, then row **1**, then row **2**. The conceptual address for cell **row, col** is **base + (row * columns + col) * elementSize**.\n\nThis matters for matrix problems because scanning row by row follows the stored order in many languages and in the interview memory model. Java represents **int[][]** as an array of row arrays, so each row is its own array, but the row-major mental model still explains why nested loops over rows then columns are natural and efficient.",
      },
    ],
    keyTakeaways: [
      "Arrays are index-ordered sequences with predictable element positions.",
      "Constant-time indexing comes from computing **base + index * elementSize**.",
      "Same-typed elements or fixed-size references make address calculation possible.",
      "Sequential array scans are cache-friendly, and matrix scans usually follow row-major order.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-static-vs-dynamic",
    moduleId: "arr-fundamentals",
    order: 2,
    title: "Static vs Dynamic Arrays",
    estimatedReadingMin: 8,
    tags: ["Array", "ArrayList", "Amortized Analysis", "Resizing"],
    summaryMD:
      "Static arrays have fixed capacity, while dynamic arrays such as ArrayList or vector grow by occasionally allocating a larger backing array and copying elements.",
    sections: [
      {
        heading: "Capacity Is Not Length",
        bodyMD:
          "A static array has a fixed capacity chosen at creation time. If you create space for **10** integers, there are exactly **10** integer slots. The array may represent fewer meaningful values, but the allocated storage does not grow by itself.\n\nA dynamic array separates **size** from **capacity**. Size is the number of meaningful elements. Capacity is the length of the hidden backing array. Java ArrayList, C++ vector, and similar structures expose the dynamic behavior while still relying on an ordinary array underneath.",
      },
      {
        heading: "Why Append Is Amortized O(1)",
        bodyMD:
          "Appending is cheap while there is unused capacity: write the new value at **size**, then increment **size**. That is **O(1)**. The expensive case happens when the backing array is full. The structure allocates a larger array, usually about double the old capacity, copies all existing elements, and then appends the new one.\n\nThat resize costs **O(n)** for that single operation, but it does not happen often. After doubling, there is a long run of cheap appends before the next resize. Spread the copying cost across those future appends and the average cost per append is still **O(1)** amortized.",
      },
      {
        heading: "Middle Operations Still Shift",
        bodyMD:
          "Dynamic resizing solves capacity growth, not arbitrary insertion. Inserting at the front or middle requires shifting every later element one step to make room. Deleting from the front or middle requires shifting every later element left to close the gap.\n\nThat movement is why middle insertion and deletion are **O(n)** even for ArrayList or vector. The backing array gives fast indexing and append, but it cannot make elements teleport around gaps.",
      },
      {
        heading: "Choosing the Right Tool",
        bodyMD:
          "Use a static array when the size is known, memory predictability matters, or primitive storage is important. Use a dynamic array when you need indexed access plus growth at the end. Most interview solutions in Java use arrays for fixed-size helper state and ArrayList when the output size is not known in advance.\n\nIf your algorithm performs many front insertions or deletions, a dynamic array is usually the wrong structure. Consider a deque, linked structure, heap, or a different algorithmic pattern depending on the access requirements.",
      },
    ],
    keyTakeaways: [
      "Static arrays have fixed capacity; dynamic arrays manage a larger backing array internally.",
      "Appending to a dynamic array is amortized **O(1)** because expensive resizes are rare.",
      "A resize is **O(n)** because existing elements must be copied into new storage.",
      "Insertion or deletion at the front or middle remains **O(n)** because elements shift.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-time-complexities",
    moduleId: "arr-fundamentals",
    order: 3,
    title: "Array Time Complexities",
    estimatedReadingMin: 7,
    tags: ["Array", "Complexity", "Big-O"],
    summaryMD:
      "Array performance is dominated by direct indexing, linear shifting, and whether the data is sorted enough to support binary search.",
    sections: [
      {
        heading: "The Cost Table",
        bodyMD:
          "Keep this compact table in your head during interviews:\n\nOperation | Typical cost | Reason\nAccess by index | **O(1)** | compute the address directly\nSearch unsorted | **O(n)** | may need to inspect every element\nSearch sorted | **O(log n)** | binary search halves the remaining range\nAppend or insert at end | amortized **O(1)** | write at the next free slot, occasional resize\nDelete at end | amortized **O(1)** | decrement size, occasional shrink in some implementations\nInsert at front or middle | **O(n)** | shift later elements right\nDelete at front or middle | **O(n)** | shift later elements left\n\nThe table is simple, but it explains many problem constraints. If **n** is large and the input is unsorted, repeated searching inside a loop is a warning sign for **O(n^2)**.",
      },
      {
        heading: "Access and Search Are Different",
        bodyMD:
          "Array access means you already know the index. That is **O(1)**. Array search means you know a value or condition and need to find where it occurs. If the array is unsorted, there is no safe shortcut; the target could be anywhere, including the last position.\n\nIf the array is sorted, search can become **O(log n)** with binary search. Sorting is not free, though. Paying **O(n log n)** upfront only makes sense when it unlocks simpler scanning, many future searches, or a stronger pattern such as two pointers.",
      },
      {
        heading: "End Operations vs Middle Operations",
        bodyMD:
          "Adding at the end is cheap because it does not disturb existing indices. A dynamic array may occasionally resize, but amortized analysis keeps the long-run append cost at **O(1)**. Removing the last element is also **O(1)** when no shrinking copy is required.\n\nAdding or removing near the front is different. Every shifted element changes index, so the cost grows with the number of elements after the operation. When a problem suggests repeated front removals from an array, look for a pointer boundary instead of physically deleting.",
      },
      {
        heading: "Use Complexity to Choose Patterns",
        bodyMD:
          "The most common array optimization is replacing repeated work with remembered structure. A prefix sum remembers cumulative totals. A hash map remembers where values have appeared. Two pointers remember that sorted order eliminates impossible pairs. Sliding windows remember a contiguous region instead of recomputing it from scratch.\n\nBefore coding, ask what the expensive operation is. If it is repeated search, add indexing or hashing. If it is repeated range summation, add prefix sums. If it is repeated shifting, keep logical boundaries rather than mutating the array.",
      },
    ],
    keyTakeaways: [
      "Index access is **O(1)**, but searching an unsorted array is **O(n)**.",
      "Sorted arrays support **O(log n)** binary search but may require an upfront sort.",
      "Appending at the end is amortized **O(1)** for dynamic arrays; middle changes are **O(n)**.",
      "Many interview patterns exist to avoid repeated scans, repeated sums, or repeated shifts.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-common-patterns",
    moduleId: "arr-fundamentals",
    order: 4,
    title: "Common Array Interview Patterns",
    estimatedReadingMin: 8,
    tags: ["Array", "Patterns", "Interview Framework"],
    summaryMD:
      "Most array problems become manageable once you identify whether order, contiguity, frequency, or index range is the real structure.",
    sections: [
      {
        heading: "Pattern Recognition Beats Memorization",
        bodyMD:
          "Array questions often look different on the surface: pairs, subarrays, missing numbers, duplicates, intervals, products, or matrix updates. Underneath, the same few patterns repeat. The interview skill is to name the pattern from the constraint signal before writing code.\n\nA good signal connects the problem statement to a cost you want to avoid. If brute force checks all pairs, two pointers or hashing may remove one loop. If brute force recomputes every range, prefix sums may summarize the repeated work. If extra space is restricted and values lie in a narrow range, the array itself may be usable as storage.",
      },
      {
        heading: "Order and Boundary Patterns",
        bodyMD:
          "**Two pointers** is the signal when the array is sorted, can be sorted without losing meaning, or asks for a pair, partition, reversal, or merge. One pointer often starts left, the other right, and each comparison proves which side can move.\n\n**Sliding window** is the signal when the answer is a contiguous subarray or substring and the window can grow and shrink while maintaining a constraint. It is strongest for positive numbers, counts, distinctness, or at most **k** conditions where moving a boundary has predictable effects.",
      },
      {
        heading: "Summaries and Marks",
        bodyMD:
          "**Prefix sums** are the signal for repeated range sums, subarray sum targets, balance between counts, or anything where subtracting two cumulative totals gives a range answer. The question often says many queries or asks for subarray totals.\n\n**In-place marking** is the signal when values are in a tight index range such as **1..n** and the problem asks for missing, duplicate, or first positive information with **O(1)** extra space. Negating values, swapping into home positions, or using sign bits can turn the array into a visited structure.",
      },
      {
        heading: "Sorting and Index-as-Hash",
        bodyMD:
          "**Sorting then scanning** is the signal when relative order in the original input is not important and adjacency after sorting exposes the answer. Duplicates, intervals, closest pairs, and greedy grouping often become simple after sorting.\n\n**Index-as-hash** is the signal when values naturally map to array indices, such as lowercase letters, ASCII characters, small integers, or numbers from **0** to **n - 1**. A plain array count can beat a HashMap in speed and memory when the value range is bounded.",
      },
      {
        heading: "How to Explain the Choice",
        bodyMD:
          "In interviews, do not just announce a technique. Say what the brute force repeats and what the pattern remembers. For two pointers, explain the elimination rule. For sliding window, explain the invariant. For prefix sums, explain which range quantity becomes subtraction. For in-place marking, explain why values can safely point back into indices.\n\nThis framing makes the solution feel derived rather than memorized, and it helps you adapt when the interviewer changes constraints.",
      },
    ],
    keyTakeaways: [
      "Two pointers usually needs sorted order, pair logic, partitioning, reversal, or merging.",
      "Sliding window targets contiguous ranges with a maintainable constraint.",
      "Prefix sums replace repeated range work with cumulative summaries.",
      "In-place marking, sorting-then-scanning, and index-as-hash exploit value range or order structure.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-prefix-sum",
    moduleId: "arr-fundamentals",
    order: 5,
    title: "Prefix Sum",
    estimatedReadingMin: 8,
    tags: ["Array", "Prefix Sum", "Range Query", "Subarray"],
    summaryMD:
      "A prefix sum stores cumulative totals so any later range sum can be answered by subtracting two precomputed boundaries.",
    sections: [
      {
        heading: "Definition",
        bodyMD:
          "Define **prefix[i]** as the sum of the first **i** elements. That means **prefix[0] = 0**, **prefix[1] = nums[0]**, and **prefix[n]** is the total sum of the whole array. The extra leading zero represents the empty prefix and makes boundary math clean.\n\nWith this definition, the sum of **nums[l..r]** is **prefix[r + 1] - prefix[l]**. The right boundary includes elements through **r**, and the left boundary removes everything before **l**.",
      },
      {
        heading: "Why It Helps",
        bodyMD:
          "Without prefix sums, each range query may scan the requested range, costing **O(length)** or **O(n)** in the worst case. If there are many queries, that repeated scanning dominates the runtime.\n\nBuilding the prefix array costs **O(n)** once. After that, every range sum is **O(1)**. The trade-off is **O(n)** extra space, which is usually worth it when the number of queries is large or when subarray sums are checked repeatedly.",
      },
      {
        heading: "Interview Signals",
        bodyMD:
          "Look for words like range sum, subarray sum, balance, cumulative, number of queries, or sum between indices. Prefix sums also appear when the problem asks for equal numbers of two categories: convert one category to **+1**, the other to **-1**, and equal balance becomes repeated prefix value.\n\nFor subarray sum equals **k**, the range formula becomes **currentPrefix - earlierPrefix = k**. Rearranged, you need to know how many earlier prefixes equal **currentPrefix - k**, which is why prefix sums often pair with a HashMap.",
      },
      {
        heading: "Extending to 2D",
        bodyMD:
          "For matrices, a two-dimensional prefix sum stores the total rectangle from the top-left corner through each cell. A query rectangle can then be answered by adding the large rectangle, subtracting the areas above and left, and adding back the overlapped corner.\n\nThe same principle applies: precompute cumulative structure once, then answer many rectangle queries quickly. The main risk is off-by-one indexing, so many implementations allocate one extra row and one extra column for empty boundaries.",
      },
    ],
    codeExamples: [
      {
        title: "Build prefix sums and answer a range query",
        language: "java",
        code: `class PrefixSumExample {
    public int[] buildPrefix(int[] nums) {
        int[] prefix = new int[nums.length + 1];

        for (int i = 0; i < nums.length; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }

        return prefix;
    }

    public int rangeSum(int[] prefix, int left, int right) {
        return prefix[right + 1] - prefix[left];
    }
}`,
        captionMD:
          "The prefix array has one extra empty prefix, so a closed range **left..right** becomes a simple subtraction.",
      },
    ],
    keyTakeaways: [
      "**prefix[i]** is the sum of the first **i** elements, with **prefix[0] = 0**.",
      "A range sum **l..r** is **prefix[r + 1] - prefix[l]**.",
      "Prefix sums turn repeated range queries from **O(n)** each into **O(1)** after **O(n)** preprocessing.",
      "The same idea extends to two-dimensional rectangle sums with extra boundary rows and columns.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-difference-array",
    moduleId: "arr-fundamentals",
    order: 6,
    title: "Difference Array",
    estimatedReadingMin: 8,
    tags: ["Array", "Difference Array", "Range Update", "Prefix Sum"],
    summaryMD:
      "A difference array records where range updates start and stop, then uses one prefix pass to materialize the final values.",
    sections: [
      {
        heading: "The Core Trick",
        bodyMD:
          "Suppose many operations add **val** to every index in range **l..r**. Updating each element directly costs **O(r - l + 1)** per operation, which can become too slow when both the array and update list are large.\n\nA difference array stores changes between neighboring positions instead of final values. To add **val** on **l..r**, do **diff[l] += val** and **diff[r + 1] -= val** if **r + 1** is inside the array. The first mark starts the increase; the second mark cancels it after the range ends.",
      },
      {
        heading: "Reconstructing the Array",
        bodyMD:
          "After all updates are marked, run a prefix sum over **diff**. The running total at index **i** is exactly the net value that should apply to **arr[i]**. Every active update has started but not yet been canceled, so it contributes to the running total.\n\nThis turns each update into **O(1)** work and performs the actual propagation once. The final reconstruction costs **O(n)**, so the total cost is **O(n + q)** for **q** range updates.",
      },
      {
        heading: "When to Use It",
        bodyMD:
          "Difference arrays are the range-update counterpart to prefix sums. Prefix sums answer many range queries quickly after fixed data. Difference arrays apply many range updates quickly before final data is needed.\n\nLook for phrases like apply many increments, bookings over intervals, range addition, brightness changes, or timeline deltas. If no query asks for intermediate states between updates, a difference array is often the simplest optimal approach.",
      },
      {
        heading: "Boundary Discipline",
        bodyMD:
          "The cancellation at **r + 1** is the main source of bugs. If **r** is the last valid index, there is no later element where the increase should stop, so skip the cancellation or allocate **n + 1** difference slots and ignore the sentinel during reconstruction.\n\nAlso keep the interval convention consistent. The common formula above is for closed ranges **l..r**. Half-open ranges use different boundaries, and mixing conventions causes off-by-one errors.",
      },
    ],
    codeExamples: [
      {
        title: "Apply range additions with a difference array",
        language: "java",
        code: `class DifferenceArrayExample {
    public int[] applyUpdates(int n, int[][] updates) {
        int[] diff = new int[n + 1];

        for (int[] update : updates) {
            int left = update[0];
            int right = update[1];
            int value = update[2];

            diff[left] += value;
            diff[right + 1] -= value;
        }

        int[] result = new int[n];
        int running = 0;
        for (int i = 0; i < n; i++) {
            running += diff[i];
            result[i] = running;
        }

        return result;
    }
}`,
        captionMD:
          "The extra slot lets the code mark **right + 1** even when the update reaches the last real index.",
      },
    ],
    keyTakeaways: [
      "For range add **l..r**, mark **diff[l] += val** and **diff[r + 1] -= val**.",
      "A prefix pass over the difference array reconstructs the final values.",
      "Each range update is **O(1)**, and all final values appear after one **O(n)** pass.",
      "Difference arrays are ideal when many updates happen before final point values are needed.",
    ],
  },
  {
    kind: "concept",
    slug: "arr-frequency-counting",
    moduleId: "arr-fundamentals",
    order: 7,
    title: "Frequency Counting",
    estimatedReadingMin: 8,
    tags: ["Array", "Hash Map", "Frequency", "Counting"],
    summaryMD:
      "Frequency counting replaces repeated searches with occurrence totals, forming the backbone of anagrams, duplicates, and top-K problems.",
    sections: [
      {
        heading: "Count What Matters",
        bodyMD:
          "A frequency count records how many times each value appears. Instead of asking whether a value has appeared by scanning the array again, you update a counter during one pass. The stored count becomes the evidence for duplicates, matches, missing values, or majority behavior.\n\nThis is one of the most common upgrades from brute force. If the naive solution compares every item to every other item, ask whether counts would let you answer the same question in one or two passes.",
      },
      {
        heading: "Array Counter or HashMap",
        bodyMD:
          "Use an array counter when the key range is small and known. Lowercase English letters fit in **int[26]**. ASCII characters fit in **int[128]**. Small bounded integers can often be shifted into a zero-based index.\n\nUse a HashMap when keys are large, sparse, negative, strings, or otherwise not easy to map into a compact array. The big-O is still usually **O(n)** expected time, but the constants and memory overhead are higher than a primitive array counter.",
      },
      {
        heading: "Canonical Interview Uses",
        bodyMD:
          "Anagrams compare character counts. Duplicates check whether a count becomes greater than one. Top-K frequent elements counts values first, then extracts the largest counts with a heap, bucket array, or quickselect-style approach. Sliding-window frequency problems maintain counts as characters enter and leave the window.\n\nThe pattern is not limited to equality. Counts can represent inventory, deficits, balances, or how many active intervals share a label. The key is choosing exactly what identity should be counted.",
      },
      {
        heading: "Common Mistakes",
        bodyMD:
          "The first mistake is using a fixed array counter when the input range is not actually bounded. The second is forgetting to decrement counts when a sliding window shrinks. The third is comparing maps too often instead of tracking how many keys currently match.\n\nFor character problems, be explicit about the alphabet. Lowercase-only, case-sensitive, Unicode, and ASCII constraints lead to different counter choices. Do not assume **int[26]** unless the problem guarantees lowercase English letters.",
      },
    ],
    codeExamples: [
      {
        title: "Count letters with an array and values with a HashMap",
        language: "java",
        code: `import java.util.HashMap;
import java.util.Map;

class FrequencyCountingExample {
    public boolean isAnagram(String first, String second) {
        if (first.length() != second.length()) {
            return false;
        }

        int[] counts = new int[26];
        for (int i = 0; i < first.length(); i++) {
            counts[first.charAt(i) - 'a']++;
            counts[second.charAt(i) - 'a']--;
        }

        for (int count : counts) {
            if (count != 0) {
                return false;
            }
        }

        return true;
    }

    public int mostFrequent(int[] nums) {
        Map<Integer, Integer> counts = new HashMap<>();
        int answer = nums[0];

        for (int num : nums) {
            int nextCount = counts.getOrDefault(num, 0) + 1;
            counts.put(num, nextCount);

            if (nextCount > counts.get(answer)) {
                answer = num;
            }
        }

        return answer;
    }
}`,
        captionMD:
          "Use a primitive counter for a tiny alphabet and a HashMap when values are not compact enough for direct indexing.",
      },
    ],
    keyTakeaways: [
      "Frequency counting stores occurrence totals so later checks do not rescan the input.",
      "Use **int[26]** or **int[128]** when the alphabet is fixed and small.",
      "Use a HashMap for sparse, large, negative, or non-integer keys.",
      "Anagrams, duplicates, sliding-window counts, and top-K frequency all build on this pattern.",
    ],
  },
];
