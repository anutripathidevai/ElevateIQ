import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "heap-kth-largest-element",
    moduleId: "heap-top-k",
    order: 6,
    title: "Kth Largest Element in an Array",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    tags: ["Heap", "Priority Queue", "Top K", "Quickselect", "Array"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return the **k-th largest** element in the array. The answer is based on sorted order, not on distinct values.",
    constraints: [
      "1 <= k <= nums.length <= 100000",
      "-10000 <= nums[i] <= 10000",
    ],
    inputMD: "An integer array **nums** and an integer **k** asking for the k-th largest value by position.",
    outputMD: "A single integer: the value that would appear at index **nums.length - k** if the array were sorted ascending.",
    examples: [
      {
        input: "nums = [3,2,1,5,6,4], k = 2",
        output: "5",
        explanation: "Sorted ascending gives [1,2,3,4,5,6], so the 2nd largest value is 5.",
      },
      {
        input: "nums = [3,2,3,1,2,4,5,5,6], k = 4",
        output: "4",
        explanation: "Sorted ascending gives [1,2,2,3,3,4,5,5,6]. Counting from the largest side, 4 is the 4th largest.",
      },
    ],
    learningObjectives: [
      "Recognise k-th largest as a fixed-size top-k heap problem.",
      "Explain why the efficient heap is a size-k min-heap, not a max-heap of all values.",
      "Use the heap root as the boundary between the current top k and everything smaller.",
      "Compare the heap solution with average-linear quickselect.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **k-th largest**, **top k largest**, or **return the boundary value after keeping only the best k elements**. You do not need to sort the whole array. You only need the k largest values seen so far, and among those k values the smallest one is exactly the current k-th largest candidate.\n\nThe classic trap is reaching for a max-heap because the word largest appears. A max-heap of all n values works, but it pays O(n log n) or O(n + k log n). The interview pattern is the opposite: keep a size-k **min-heap**. The root is the smallest among the retained largest values, so after the scan it is the k-th largest.",
    commonMistakes: [
      "Using a max-heap of every value and losing the O(n log k) bound.",
      "Letting the heap grow beyond k, so the root no longer represents the k-th largest candidate.",
      "Thinking duplicates should be removed even though this problem counts positions, not distinct values.",
      "Writing subtraction-based comparators that can overflow on wider integer ranges.",
    ],
    algorithmMD:
      "**Key idea**\n\nMaintain a min-heap containing the largest **k** values seen so far. Whenever a new number enters, push it into the heap. If the heap grows to **k + 1**, remove the root, which is the smallest value among the candidates and therefore not part of the current top k. After all numbers are processed, the heap contains exactly the k largest values, and the root is the k-th largest.\n\n**Heap walkthrough**\n\nUse **nums = [3,2,1,5,6,4]** and **k = 2**. Start with an empty min-heap. See **3**, heap becomes **[3]**. See **2**, heap becomes **[2,3]**; the root **2** is the 2nd largest among values seen so far. See **1**, push to get **[1,3,2]**, then pop **1** because the heap is too large, returning to **[2,3]**. See **5**, push to get **[2,3,5]**, pop **2**, and keep **[3,5]**. See **6**, push to get **[3,5,6]**, pop **3**, and keep **[5,6]**. See **4**, push to get **[4,6,5]**, pop **4**, and finish with **[5,6]**. The root **5** is the 2nd largest.\n\n**Algorithm**\n\n1. Create a min-heap of integers.\n2. Scan every value in **nums**.\n3. Push the current value into the heap.\n4. If the heap size exceeds **k**, pop the root.\n5. After the scan, return the root because it is the smallest value inside the top-k set.",
    solutions: [
      {
        name: "Size-k min-heap",
        whenToUseMD:
          "Use this when you want deterministic O(n log k) time, especially when **k** is much smaller than **n** or when values arrive as a stream.",
        approachMD:
          "Keep only the best **k** values in a min-heap. The heap root is the weakest value still retained, so removing the root whenever the heap becomes too large preserves exactly the largest **k** values.",
        walkthroughMD:
          "1. Create an empty **PriorityQueue** using Java's natural min-heap ordering.\n2. Add each number from **nums**.\n3. If the heap size becomes greater than **k**, remove the smallest retained number.\n4. When the loop ends, return **peek()** because it is the smallest among the k largest values.",
        complexity: { time: "O(n log k)", space: "O(k)", note: "Each of n values may perform a heap push and sometimes a pop, while the heap size never exceeds k + 1." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();

        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }

        return minHeap.peek();
    }
}`,
      },
      {
        name: "Quickselect by target index",
        whenToUseMD:
          "Use this when the interviewer asks for average O(n) selection and the input can be rearranged in place.",
        approachMD:
          "The k-th largest value is the element that would land at index **n - k** in ascending order. Quickselect partitions the array around a pivot and continues only on the side that contains that target index.",
        walkthroughMD:
          "1. Convert the request to target index **nums.length - k**.\n2. Partition the current range into values smaller than the pivot, equal to the pivot, and larger than the pivot.\n3. If the target index falls inside the equal band, return that value.\n4. If the target index is left of the equal band, search the left range; otherwise search the right range.\n5. Randomising the pivot keeps the expected running time linear, and the equal band handles duplicates cleanly.",
        complexity: { time: "O(n) average, O(n^2) worst case", space: "O(1)", note: "Each partition keeps only one side on average; the implementation mutates the input array in place." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {
    private final Random random = new Random();

    public int findKthLargest(int[] nums, int k) {
        int target = nums.length - k;
        int left = 0;
        int right = nums.length - 1;

        while (left <= right) {
            int[] equalRange = partition(nums, left, right);
            if (target < equalRange[0]) {
                right = equalRange[0] - 1;
            } else if (target > equalRange[1]) {
                left = equalRange[1] + 1;
            } else {
                return nums[target];
            }
        }

        return -1;
    }

    private int[] partition(int[] nums, int left, int right) {
        int pivotIndex = left + random.nextInt(right - left + 1);
        int pivotValue = nums[pivotIndex];

        int smaller = left;
        int index = left;
        int larger = right;

        while (index <= larger) {
            if (nums[index] < pivotValue) {
                swap(nums, smaller, index);
                smaller++;
                index++;
            } else if (nums[index] > pivotValue) {
                swap(nums, index, larger);
                larger--;
            } else {
                index++;
            }
        }

        return new int[] { smaller, larger };
    }

    private void swap(int[] nums, int first, int second) {
        int temp = nums[first];
        nums[first] = nums[second];
        nums[second] = temp;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [3,2,1,5,6,4], k = 2. Track the size-k min-heap during the scan.",
      columns: ["step", "value", "heap after push", "action", "heap after trim"],
      rows: [
        ["1", "3", "[3]", "size <= k, keep it", "[3]"],
        ["2", "2", "[2,3]", "size <= k, keep it", "[2,3]"],
        ["3", "1", "[1,3,2]", "pop 1", "[2,3]"],
        ["4", "5", "[2,3,5]", "pop 2", "[3,5]"],
        ["5", "6", "[3,5,6]", "pop 3", "[5,6]"],
        ["6", "4", "[4,6,5]", "pop 4", "[5,6]"],
      ],
      narrativeMD: "The heap finishes with the two largest values **5** and **6**. Its root is **5**, so the answer is **5**.",
    },
    complexityNote:
      "The heap solution is deterministic O(n log k) with O(k) space. Quickselect improves expected time to O(n) when in-place mutation and average-case analysis are acceptable.",
    interviewTipsMD:
      "Say the confusion out loud: for k-th largest, the efficient fixed-size heap is a **min-heap**, because the smallest value among the retained top k is the answer. If the interviewer asks about faster average time, transition cleanly to quickselect and mention its worst-case risk unless pivot choice is controlled.",
    followUps: [
      "How would the solution change for the k-th smallest element?",
      "What if numbers arrive in an infinite stream and you need to query the k-th largest repeatedly?",
      "How would you make quickselect deterministic in worst-case linear time?",
      "What changes if the problem asks for the k-th distinct largest value?",
    ],
    similarProblems: [
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "heap-top-k-frequent-elements", note: "Also keeps only k winners, but orders candidates by frequency." },
      { title: "K Closest Points to Origin", difficulty: "Medium", slug: "heap-k-closest-points", note: "Uses a fixed-size heap and evicts the worst candidate." },
      { title: "Find K Closest Elements", difficulty: "Medium", slug: "heap-k-closest-elements", note: "Another top-k boundary problem with a tie-break rule." },
      { title: "Find Median from Data Stream", difficulty: "Hard", slug: "heap-find-median-data-stream", note: "A streaming selection problem that maintains heap roots as boundaries." },
    ],
    keyTakeaways: [
      "A size-k min-heap is the standard heap pattern for k-th largest.",
      "The heap root represents the weakest retained top-k candidate.",
      "Duplicates count as separate positions unless the statement says distinct.",
      "Quickselect is the average O(n) alternative when input mutation is allowed.",
    ],
    pattern:
      "For k-th largest, scan once with a size-k min-heap; push each value, evict the smallest when over capacity, then return the root.",
  },
  {
    kind: "problem",
    slug: "heap-top-k-frequent-elements",
    moduleId: "heap-top-k",
    order: 7,
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
    tags: ["Heap", "Priority Queue", "Hash Map", "Bucket Sort", "Top K"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 22,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return the **k** most frequent elements. The answer may be returned in any order.",
    constraints: [
      "1 <= nums.length <= 100000",
      "-10000 <= nums[i] <= 10000",
      "1 <= k <= number of unique values in nums",
    ],
    inputMD: "An integer array **nums** and an integer **k** asking for the k values with highest frequency.",
    outputMD: "An integer array containing the **k** most frequent values, in any order.",
    examples: [
      {
        input: "nums = [1,1,1,2,2,3], k = 2",
        output: "[1,2]",
        explanation: "Value 1 appears three times, value 2 appears twice, and value 3 appears once, so the top two are 1 and 2.",
      },
      {
        input: "nums = [1], k = 1",
        output: "[1]",
        explanation: "There is only one unique value, so it must be returned.",
      },
    ],
    learningObjectives: [
      "Separate frequency counting from top-k selection.",
      "Order heap candidates by frequency rather than by numeric value.",
      "Use a size-k min-heap to evict the least frequent retained value.",
      "Compare heap selection with bucket sort when frequencies are bounded by n.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **top k frequent**, which is a two-stage problem: first compress the array into counts, then select the k highest counts. Once each unique value has a frequency, the problem becomes the same fixed-size top-k pattern as k-th largest, except the priority is frequency.\n\nThe trap is ordering by the element value instead of its count. A value like **100** is not better than **1** unless it appears more often. Another common trap is sorting every unique value by frequency; that is simple, but a size-k min-heap avoids full sorting when k is small.",
    commonMistakes: [
      "Building a heap over raw array values before counting frequencies.",
      "Comparing numbers by value rather than by their frequency in the map.",
      "Keeping a max-heap of all unique values and paying more than O(m log k), where m is the number of unique values.",
      "Forgetting that the output order is irrelevant unless the platform asks otherwise.",
    ],
    algorithmMD:
      "**Key idea**\n\nCount every value with a hash map. Then scan the unique values with a min-heap ordered by frequency. The heap stores the current k most frequent values; its root is the least frequent among the retained winners. When a new candidate makes the heap too large, popping the root removes the weakest retained frequency.\n\n**Heap walkthrough**\n\nUse **nums = [1,1,1,2,2,3]** and **k = 2**. Counting gives **1 -> 3**, **2 -> 2**, and **3 -> 1**. Process value **1** first; the heap becomes **[1:3]**. Process **2**; the heap becomes **[2:2,1:3]**, with **2** at the root because it has the smaller frequency. Process **3**; push to get **[3:1,1:3,2:2]**, then pop **3** because the heap has size three. The heap returns to **[2:2,1:3]**, so the retained values are **1** and **2**.\n\n**Algorithm**\n\n1. Build a hash map from value to frequency.\n2. Create a min-heap of values, comparing two values by their map frequencies.\n3. Push each unique value into the heap.\n4. If the heap size exceeds **k**, pop the least frequent retained value.\n5. Poll the remaining heap values into the result array.",
    solutions: [
      {
        name: "Frequency map with size-k min-heap",
        whenToUseMD:
          "Use this when **k** is smaller than the number of unique values and you want the heap pattern that generalises to streaming or large domains.",
        approachMD:
          "Count values first, then keep only the k highest-frequency keys in a min-heap. The root is the least frequent retained key, so it is the one to discard when the heap grows too large.",
        walkthroughMD:
          "1. Count each value in a **HashMap**.\n2. Create a **PriorityQueue** whose comparator reads frequencies from the map.\n3. Offer every unique value into the heap.\n4. Whenever the heap size exceeds **k**, poll the lowest-frequency key.\n5. Move the remaining heap keys into an answer array and return it.",
        complexity: { time: "O(n log k)", space: "O(n)", note: "Counting stores up to n unique values, while heap operations keep at most k + 1 keys and cost O(log k)." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> frequency = new HashMap<>();
        for (int num : nums) {
            frequency.put(num, frequency.getOrDefault(num, 0) + 1);
        }

        PriorityQueue<Integer> minHeap = new PriorityQueue<>((a, b) -> Integer.compare(frequency.get(a), frequency.get(b)));
        for (int value : frequency.keySet()) {
            minHeap.offer(value);
            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }

        int[] result = new int[k];
        for (int index = 0; index < k; index++) {
            result[index] = minHeap.poll();
        }
        return result;
    }
}`,
      },
      {
        name: "Bucket sort by frequency",
        whenToUseMD:
          "Use this when you want O(n) time and can allocate buckets for frequencies from 0 through n.",
        approachMD:
          "A value can appear at most **n** times, so frequencies are bounded. Place each value into the bucket for its frequency, then scan buckets from high frequency down until k values have been collected.",
        walkthroughMD:
          "1. Count every value in a hash map.\n2. Create **n + 1** buckets, where bucket **f** stores values that appear **f** times.\n3. Put each unique value into its frequency bucket.\n4. Scan buckets from **n** down to **1**.\n5. Add values to the answer until exactly **k** values have been collected.",
        complexity: { time: "O(n)", space: "O(n)", note: "The map, buckets, and result together use linear space; scanning all buckets is linear." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> frequency = new HashMap<>();
        for (int num : nums) {
            frequency.put(num, frequency.getOrDefault(num, 0) + 1);
        }

        List<List<Integer>> buckets = new ArrayList<>();
        for (int index = 0; index <= nums.length; index++) {
            buckets.add(new ArrayList<>());
        }

        for (Map.Entry<Integer, Integer> entry : frequency.entrySet()) {
            buckets.get(entry.getValue()).add(entry.getKey());
        }

        int[] result = new int[k];
        int resultIndex = 0;
        for (int count = nums.length; count >= 0 && resultIndex < k; count--) {
            for (int value : buckets.get(count)) {
                result[resultIndex] = value;
                resultIndex++;
                if (resultIndex == k) {
                    break;
                }
            }
        }

        return result;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1,1,1,2,2,3], k = 2. First count frequencies, then track the frequency-ordered min-heap.",
      columns: ["candidate", "frequency", "heap after push", "action", "retained values"],
      rows: [
        ["1", "3", "[1:3]", "size <= k, keep it", "[1]"],
        ["2", "2", "[2:2,1:3]", "size <= k, keep it", "[2,1]"],
        ["3", "1", "[3:1,1:3,2:2]", "pop 3", "[2,1]"],
      ],
      narrativeMD: "The heap keeps the two highest frequencies: **1** with count **3** and **2** with count **2**. The output can be **[1,2]** or **[2,1]**.",
    },
    complexityNote:
      "The heap approach is O(n log k) after counting because the heap size is bounded by k. Bucket sort is O(n) when frequency buckets are acceptable.",
    interviewTipsMD:
      "Make the priority explicit: the heap is ordered by **frequency**, not by value. If k is close to the number of unique values, full sorting is acceptable but not as pattern-focused. If asked for linear time, use the bounded frequency range to introduce bucket sort.",
    followUps: [
      "How would you handle a stream where values arrive continuously and top k is queried repeatedly?",
      "How would you break ties if the output had to be sorted by value?",
      "What changes if the input is too large to fit in memory?",
      "How would you return the top k words instead of integers?",
    ],
    similarProblems: [
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "The same size-k min-heap pattern with numeric value as the priority." },
      { title: "K Closest Points to Origin", difficulty: "Medium", slug: "heap-k-closest-points", note: "Uses distance as the priority instead of frequency." },
      { title: "Find K Closest Elements", difficulty: "Medium", slug: "heap-k-closest-elements", note: "Another top-k selection problem with a custom comparator." },
      { title: "Task Scheduler", difficulty: "Medium", slug: "heap-task-scheduler", note: "Also starts by counting task frequencies, then uses priority to schedule work." },
    ],
    keyTakeaways: [
      "Top K Frequent is count first, select second.",
      "The heap comparator must read frequency, not numeric value.",
      "A size-k min-heap gives O(n log k) selection after the counts are built.",
      "Bucket sort reaches O(n) by using frequency as a bounded index.",
    ],
    pattern:
      "When top-k priority is derived from counts, build a frequency map, then keep a size-k heap ordered by that derived priority.",
  },
  {
    kind: "problem",
    slug: "heap-k-closest-points",
    moduleId: "heap-top-k",
    order: 8,
    title: "K Closest Points to Origin",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/k-closest-points-to-origin/",
    tags: ["Heap", "Priority Queue", "Geometry", "Top K", "Sorting"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an array **points**, where **points[i] = [xi, yi]**, and an integer **k**, return the **k** points closest to the origin **[0,0]**. The answer may be returned in any order.",
    constraints: [
      "1 <= k <= points.length <= 10000",
      "-10000 <= xi, yi <= 10000",
    ],
    inputMD: "A list of 2D points **points** and an integer **k**.",
    outputMD: "A list of **k** points with the smallest distances to the origin, in any order.",
    examples: [
      {
        input: "points = [[1,3],[-2,2]], k = 1",
        output: "[[-2,2]]",
        explanation: "Point [1,3] has squared distance 10, while [-2,2] has squared distance 8, so [-2,2] is closer.",
      },
      {
        input: "points = [[3,3],[5,-1],[-2,4]], k = 2",
        output: "[[3,3],[-2,4]]",
        explanation: "The squared distances are 18, 26, and 20, so the closest two are [3,3] and [-2,4].",
      },
    ],
    learningObjectives: [
      "Recognise closest k as a top-k problem where smaller distance is better.",
      "Use squared distance to avoid unnecessary square roots.",
      "Choose a size-k max-heap so the farthest retained point is easy to evict.",
      "Explain why output order is irrelevant for this problem.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **k closest**, which means we are selecting the best k candidates by a scoring function. Here the score is distance to the origin, and smaller is better. For fixed-size top-k where smaller scores win, keep a size-k **max-heap** so the root is the worst retained candidate.\n\nThe trap is computing actual Euclidean distance with a square root. Square root preserves ordering, so comparing **x^2 + y^2** is enough. Another trap is using a min-heap and popping the closest points too early; for a fixed-size heap you want the farthest retained point at the root so it can be evicted.",
    commonMistakes: [
      "Calling square root for every point even though squared distance preserves the same ordering.",
      "Using a min-heap of size k and accidentally removing the closest retained point.",
      "Sorting all points when a size-k heap gives O(n log k).",
      "Returning only distances instead of the original point coordinates.",
    ],
    algorithmMD:
      "**Key idea**\n\nOrder points by squared distance **x^2 + y^2**. Keep a max-heap of at most **k** points, where the root is the farthest point currently retained. After pushing each point, if the heap is too large, pop the root. That removes the worst retained point and leaves the k closest candidates seen so far.\n\n**Heap walkthrough**\n\nUse **points = [[1,3],[-2,2],[5,8],[0,1]]** and **k = 2**. Squared distances are **10**, **8**, **89**, and **1**. See **[1,3]**, heap becomes **[10:[1,3]]**. See **[-2,2]**, heap becomes **[10:[1,3],8:[-2,2]]**, with distance **10** at the root because this is a max-heap. See **[5,8]**, push to get **[89:[5,8],8:[-2,2],10:[1,3]]**, then pop **[5,8]** because it is farthest. See **[0,1]**, push to get **[10:[1,3],8:[-2,2],1:[0,1]]**, then pop **[1,3]**. The retained points are **[-2,2]** and **[0,1]**.\n\n**Algorithm**\n\n1. Create a max-heap of points ordered by squared distance.\n2. For each point, compute priority as **x^2 + y^2** through the comparator.\n3. Push the point into the heap.\n4. If the heap size exceeds **k**, pop the farthest retained point.\n5. Poll the remaining points into the answer array.",
    solutions: [
      {
        name: "Size-k max-heap by squared distance",
        whenToUseMD:
          "Use this when **k** may be much smaller than **n** and you want to avoid sorting all points.",
        approachMD:
          "A smaller distance is better, so the fixed-size heap should expose the largest distance among retained points. Push each point, and when the heap exceeds k, evict the farthest root.",
        walkthroughMD:
          "1. Build a **PriorityQueue** whose comparator makes larger squared distance come first.\n2. Offer each point from **points**.\n3. If the heap grows beyond **k**, poll the farthest retained point.\n4. After the scan, the heap contains exactly the k closest points.\n5. Poll them into a result matrix and return it.",
        complexity: { time: "O(n log k)", space: "O(k)", note: "Each point performs heap work against a heap capped at k + 1 points." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public int[][] kClosest(int[][] points, int k) {
        PriorityQueue<int[]> maxHeap = new PriorityQueue<>((a, b) -> Long.compare(squaredDistance(b), squaredDistance(a)));

        for (int[] point : points) {
            maxHeap.offer(point);
            if (maxHeap.size() > k) {
                maxHeap.poll();
            }
        }

        int[][] result = new int[k][2];
        for (int index = 0; index < k; index++) {
            result[index] = maxHeap.poll();
        }
        return result;
    }

    private long squaredDistance(int[] point) {
        return (long) point[0] * point[0] + (long) point[1] * point[1];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "points = [[1,3],[-2,2],[5,8],[0,1]], k = 2. Track the max-heap by squared distance.",
      columns: ["step", "point", "squared distance", "heap after push", "heap after trim"],
      rows: [
        ["1", "[1,3]", "10", "[10:[1,3]]", "[10:[1,3]]"],
        ["2", "[-2,2]", "8", "[10:[1,3],8:[-2,2]]", "[10:[1,3],8:[-2,2]]"],
        ["3", "[5,8]", "89", "[89:[5,8],8:[-2,2],10:[1,3]]", "[10:[1,3],8:[-2,2]]"],
        ["4", "[0,1]", "1", "[10:[1,3],8:[-2,2],1:[0,1]]", "[8:[-2,2],1:[0,1]]"],
      ],
      narrativeMD: "After all points are scanned, the heap contains the two smallest squared distances, **8** and **1**, so the answer can be **[[-2,2],[0,1]]**.",
    },
    complexityNote:
      "The heap solution runs in O(n log k) time and O(k) space because only k closest candidates are retained.",
    interviewTipsMD:
      "Emphasise the direction of the heap: because smaller distance is better, the fixed-size heap is a **max-heap** that exposes the farthest retained point. Also say that squared distance is enough; avoiding square root is both faster and less error-prone.",
    followUps: [
      "How would you solve it with quickselect for average O(n) time?",
      "What if the points arrive as a stream and k closest must be maintained online?",
      "How would you break ties deterministically by x coordinate and then y coordinate?",
      "How would the distance function change for Manhattan distance?",
    ],
    similarProblems: [
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "Uses the same fixed-size heap idea with the opposite heap direction." },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "heap-top-k-frequent-elements", note: "Selects top k by frequency instead of by distance." },
      { title: "Find K Closest Elements", difficulty: "Medium", slug: "heap-k-closest-elements", note: "Also selects k closest items but adds sorted-array tie rules." },
      { title: "Sliding Window Median", difficulty: "Hard", slug: "heap-sliding-window-median", note: "Another problem where heap roots represent important boundaries." },
    ],
    keyTakeaways: [
      "For k closest with smaller score better, use a size-k max-heap.",
      "Squared distance preserves ordering and avoids square root.",
      "The heap root is the farthest retained point, so it is the candidate to evict.",
      "Output order does not matter unless the statement requires it.",
    ],
    pattern:
      "For top k smallest scores, keep a size-k max-heap and evict the largest score whenever the heap exceeds k.",
  },
  {
    kind: "problem",
    slug: "heap-k-closest-elements",
    moduleId: "heap-top-k",
    order: 9,
    title: "Find K Closest Elements",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/find-k-closest-elements/",
    tags: ["Heap", "Priority Queue", "Binary Search", "Sliding Window", "Sorting"],
    companies: ["Microsoft", "Amazon", "Google", "Meta", "Apple", "Bloomberg"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 25,
    statementMD:
      "Given a sorted integer array **arr**, two integers **k** and **x**, return the **k** closest integers to **x** in the array. The result must be sorted in ascending order. If two values are equally close, the smaller value is preferred.",
    constraints: [
      "1 <= k <= arr.length <= 10000",
      "arr is sorted in ascending order",
      "-10000 <= arr[i], x <= 10000",
    ],
    inputMD: "A sorted integer array **arr**, a window size **k**, and a target value **x**.",
    outputMD: "A list of **k** values closest to **x**, sorted ascending.",
    examples: [
      {
        input: "arr = [1,2,3,4,5], k = 4, x = 3",
        output: "[1,2,3,4]",
        explanation: "The four closest values to 3 are 1, 2, 3, and 4. Value 5 is farther than 1 after the tie rules are applied.",
      },
      {
        input: "arr = [1,2,3,4,5], k = 4, x = -1",
        output: "[1,2,3,4]",
        explanation: "All values are to the right of x, so the first four array values are closest and already sorted.",
      },
    ],
    learningObjectives: [
      "Use sorted input to reduce the primary solution to a binary search over window starts.",
      "Explain why the answer is always one contiguous length-k window in the sorted array.",
      "Implement the heap alternative with distance and smaller-value tie-breaks.",
      "Remember that the final result must be sorted ascending.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThe signal is **k closest elements** plus a sorted array. This still looks like a top-k selection problem, but sorted order gives a stronger structure: the final answer must be a contiguous window of length k. So the primary interview solution is to binary search the left boundary of that window.\n\nThe heap-course trap is forgetting the tie-break and the final order. If you use a heap, compare by distance to **x**, and when distances tie, treat the larger value as worse because the smaller value should win. After selecting k values with the heap, sort them ascending before returning.",
    commonMistakes: [
      "Using a heap and returning values in heap order instead of sorted ascending order.",
      "Breaking ties toward the larger value even though the problem prefers the smaller value.",
      "Ignoring the sorted-array property and missing the O(log(n - k) + k) window solution.",
      "Binary searching individual values instead of binary searching the left boundary of a length-k window.",
    ],
    algorithmMD:
      "**Key idea**\n\nBecause **arr** is sorted, the best k elements form one contiguous window. Compare two neighbouring candidate windows by looking at **arr[mid]** on the left edge and **arr[mid + k]** just outside the right edge. If **arr[mid]** is farther from **x** than **arr[mid + k]**, the optimal window starts to the right; otherwise it starts at **mid** or earlier. The heap alternative keeps a size-k max-heap where the root is the worst retained value by distance, with larger value worse on ties.\n\n**Heap walkthrough**\n\nUse **arr = [1,2,3,4,5]**, **k = 4**, and **x = 3**. The heap alternative stores the best four values, but exposes the worst retained value at the root. See **1**, distance **2**, heap becomes **[1:d2]**. See **2**, distance **1**, heap becomes **[1:d2,2:d1]**. See **3**, distance **0**, heap becomes **[1:d2,2:d1,3:d0]**. See **4**, distance **1**, heap becomes **[1:d2,4:d1,3:d0,2:d1]**. See **5**, distance **2**, push it; between **1** and **5**, both have distance **2**, but **5** is worse because ties prefer the smaller value. Pop **5** and keep **[1,2,3,4]**. Sorting the retained values gives **[1,2,3,4]**.\n\n**Algorithm**\n\n1. For the primary solution, set **left = 0** and **right = arr.length - k**.\n2. While **left < right**, let **mid** be the middle possible window start.\n3. Compare distance from **x** to **arr[mid]** with distance from **x** to **arr[mid + k]**.\n4. If the left edge is farther, move **left** to **mid + 1**; otherwise move **right** to **mid**.\n5. Return the k values from **left** through **left + k - 1**.\n6. For the heap alternative, push each value into a max-heap by distance, pop when size exceeds k, then sort the retained values ascending.",
    solutions: [
      {
        name: "Binary search the window start",
        whenToUseMD:
          "Use this as the primary interview solution because the input array is already sorted and the answer is a contiguous window.",
        approachMD:
          "There are **n - k + 1** possible windows of length k. Binary search the left boundary by comparing the value just inside the left edge with the value just outside the right edge. The comparison tells which side has the better window.",
        walkthroughMD:
          "1. Search possible window starts from **0** to **arr.length - k**.\n2. For a middle start **mid**, compare **x - arr[mid]** with **arr[mid + k] - x**.\n3. If the left value is farther, discard starts up to **mid**.\n4. Otherwise keep **mid** and the starts to its left.\n5. Copy the k values beginning at the final **left** index into the answer list.",
        complexity: { time: "O(log(n - k) + k)", space: "O(k)", note: "Binary search finds the window start, then k sorted values are copied to the returned list; extra workspace besides output is O(1)." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public List<Integer> findClosestElements(int[] arr, int k, int x) {
        int left = 0;
        int right = arr.length - k;

        while (left < right) {
            int mid = left + (right - left) / 2;
            long leftDistance = (long) x - arr[mid];
            long rightDistance = (long) arr[mid + k] - x;

            if (leftDistance > rightDistance) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }

        List<Integer> result = new ArrayList<>();
        for (int index = left; index < left + k; index++) {
            result.add(arr[index]);
        }
        return result;
    }
}`,
      },
      {
        name: "Size-k max-heap by distance with sorted output",
        whenToUseMD:
          "Use this to practise the heap top-k pattern, or when the input is not sorted and you still need k closest values by a comparator.",
        approachMD:
          "Keep a size-k heap whose root is the worst retained value: larger distance is worse, and for equal distance the larger value is worse. After the scan, sort the retained values because the problem requires ascending output.",
        walkthroughMD:
          "1. Create a **PriorityQueue** that places the worst retained value at the root.\n2. Offer each value from **arr** into the heap.\n3. If the heap size exceeds **k**, poll the root to remove the worst candidate.\n4. Convert the heap to a list after all values are scanned.\n5. Sort the list ascending before returning it.",
        complexity: { time: "O(n log k + k log k)", space: "O(k)", note: "The heap is capped at k + 1 elements, and the final k retained values are sorted for the required ascending output." },
        filename: "Solution.java",
        code: `import java.util.*;

class Solution {

    public List<Integer> findClosestElements(int[] arr, int k, int x) {
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> {
            long distanceA = Math.abs((long) a - x);
            long distanceB = Math.abs((long) b - x);
            int distanceCompare = Long.compare(distanceB, distanceA);
            if (distanceCompare != 0) {
                return distanceCompare;
            }
            return Integer.compare(b, a);
        });

        for (int value : arr) {
            maxHeap.offer(value);
            if (maxHeap.size() > k) {
                maxHeap.poll();
            }
        }

        List<Integer> result = new ArrayList<>(maxHeap);
        Collections.sort(result);
        return result;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "arr = [1,2,3,4,5], k = 4, x = 3. Track the primary binary search over possible window starts.",
      columns: ["left", "right", "mid", "compare", "decision"],
      rows: [
        ["0", "1", "0", "x - arr[0] = 2, arr[4] - x = 2", "left edge is not farther, set right = 0"],
      ],
      narrativeMD: "The search stops with **left = 0**, so copy four values starting at index 0. The sorted result is **[1,2,3,4]**.",
    },
    complexityNote:
      "The sorted-array solution is O(log(n - k) + k), which is better than heap selection here. The heap alternative remains useful for practising top-k comparators or when sorted-window structure is unavailable.",
    interviewTipsMD:
      "Lead with the binary-search window because the input is sorted. Then, for a heap course or a follow-up, present the max-heap comparator carefully: worse means larger distance, and if distances tie, the larger value is worse. Always finish by sorting the selected values ascending.",
    followUps: [
      "How would the solution change if the input array were not sorted?",
      "Can you return the elements in their original input order instead of sorted order?",
      "How would you support repeated queries with different x values on the same sorted array?",
      "What if ties should prefer the larger value instead of the smaller value?",
    ],
    similarProblems: [
      { title: "K Closest Points to Origin", difficulty: "Medium", slug: "heap-k-closest-points", note: "Also selects closest candidates by a distance metric." },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", slug: "heap-kth-largest-element", note: "Uses a fixed-size heap to keep a top-k boundary." },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "heap-top-k-frequent-elements", note: "Another custom-priority top-k selection problem." },
      { title: "Sliding Window Median", difficulty: "Hard", slug: "heap-sliding-window-median", note: "Requires careful ordering and heap maintenance over a sorted boundary concept." },
    ],
    keyTakeaways: [
      "Sorted input makes the closest k elements a contiguous window problem.",
      "Binary search over window starts gives O(log(n - k) + k) time.",
      "A heap alternative must evict larger distance first and larger value first on ties.",
      "The final answer must be sorted ascending, regardless of heap order.",
    ],
    pattern:
      "When closest elements come from a sorted array, binary search the length-k window; otherwise use a size-k max-heap with an exact distance and tie comparator.",
  },
];
