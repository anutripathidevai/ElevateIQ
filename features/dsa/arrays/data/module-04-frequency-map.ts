import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "arr-two-sum",
    moduleId: "arr-frequency-map",
    order: 16,
    title: "Two Sum",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    tags: ["Array", "Hash Map", "Complement Lookup", "One Pass", "Interview Classic"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 14,
    statementMD:
      "Given an integer array **nums** and an integer **target**, return the indices of the two numbers such that they add up to **target**. You may assume exactly one valid answer exists, and you may not use the same array element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Exactly one valid answer exists",
    ],
    inputMD: "An integer array **nums** and an integer **target**.",
    outputMD: "An integer array containing the two indices whose values sum to **target**. Any valid order is acceptable.",
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", explanation: "**nums[0] + nums[1] = 2 + 7 = 9**, so the answer is **[0, 1]**." },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", explanation: "The value **2** at index 1 pairs with **4** at index 2." },
      { input: "nums = [3, 3], target = 6", output: "[0, 1]", explanation: "The two equal values are at different indices, so they form a valid pair." },
    ],
    learningObjectives: [
      "Recognise a pair-sum question as a complement lookup problem.",
      "Replace the nested-loop search with a one-pass hash map from value to index.",
      "Explain why checking before inserting prevents using the same index twice.",
      "Handle duplicate values without losing the valid earlier index.",
    ],
    intuitionMD:
      "**Pattern Recognition**\n\nThe signal is a question about two values that must combine to a target. The direct approach tries every pair, which costs **O(n^2)**. A hash map lets you ask the better question at each index: if the current value is **x**, have I already seen **target - x**?\n\nThis is not a frequency counting problem yet; it is a complement lookup problem. Store only values from the left side of the scan. Then every match uses one earlier index and the current index, so the same element is never reused.",
    commonMistakes: [
      "Inserting the current value before checking its complement, which can accidentally pair an element with itself when **target = 2 * nums[i]**.",
      "Using a set instead of a map and then having no way to return the earlier index.",
      "Overwriting duplicate values in a way that hides the index needed by the current complement.",
      "Continuing the scan after the answer is found even though the problem guarantees exactly one answer.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep a hash map from each value already seen to its index. At index **i**, compute **target - nums[i]**. If that complement is in the map, the earlier index and **i** are the answer. Otherwise, store the current value for future elements.\n\n**Walkthrough**\n\nFor **nums = [2, 7, 11, 15]** and **target = 9**, start with an empty map. At index 0, value **2** needs complement **7**, which is not present, so store **2 -> 0**. At index 1, value **7** needs complement **2**, which is already in the map at index 0. Return **[0, 1]** immediately.\n\n**Algorithm**\n\n1. Create an empty hash map **indexByValue**.\n2. Scan **nums** from left to right.\n3. For the current value, compute **complement = target - value**.\n4. If **complement** exists in the map, return its stored index and the current index.\n5. Otherwise store the current value with the current index.\n6. The loop should always return because the input guarantees one valid answer.",
    solutions: [
      {
        name: "One-pass complement map",
        approachMD:
          "Store only numbers that appear before the current index. That turns each candidate pair into one expected **O(1)** lookup while preserving the exact index needed for the answer.",
        walkthroughMD:
          "1. Initialise an empty **HashMap<Integer, Integer>** from value to index.\n2. For each index, compute the complement needed to reach **target**.\n3. If the complement is already in the map, return the previous index and the current index.\n4. If not, insert the current value and index for later numbers.\n5. Return an empty array only as a defensive fallback for invalid inputs.",
        complexity: { time: "O(n)", space: "O(n)", note: "Each value is inserted and looked up at most once; the map can hold up to n values." },
        filename: "Solution.java",
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {

    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> indexByValue = new HashMap<>();

        for (int index = 0; index < nums.length; index++) {
            int value = nums[index];
            int complement = target - value;

            if (indexByValue.containsKey(complement)) {
                return new int[] { indexByValue.get(complement), index };
            }

            indexByValue.put(value, index);
        }

        return new int[0];
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [2, 7, 11, 15], target = 9. Track the complement lookup before each insertion.",
      columns: ["step", "index", "value", "complement", "map before lookup", "action"],
      rows: [
        ["1", "0", "2", "7", "empty", "7 missing, store 2 -> 0"],
        ["2", "1", "7", "2", "2 -> 0", "2 found at index 0, return [0, 1]"],
      ],
      narrativeMD: "The answer appears as soon as the current value can pair with a value seen on its left.",
    },
    interviewTipsMD:
      "Lead with the complement question: for each value, what earlier value would finish the pair? Then explain the order of operations: check first, insert second. That small detail proves you never reuse the same element and handles duplicates like **[3, 3]** cleanly.",
    followUps: [
      "What changes if the input is sorted and you only need the values, not original indices?",
      "How would you return all unique pairs that sum to **target**?",
      "How would the approach change for Three Sum?",
      "What if numbers arrive as a stream and queries ask whether any pair sums to a target?",
    ],
    similarProblems: [
      { title: "Contains Duplicate", difficulty: "Easy", slug: "arr-contains-duplicate", note: "Also trades extra memory for expected O(1) membership checks." },
      { title: "Subarray Sum Equals K", difficulty: "Medium", slug: "arr-subarray-sum-equals-k", note: "Uses a related lookup idea with prefix sums instead of raw values." },
      { title: "Valid Anagram", difficulty: "Easy", slug: "arr-valid-anagram", note: "A frequency-array version of hash-based comparison." },
      { title: "3Sum", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/", note: "Extends pair reasoning to triplets, usually after sorting." },
    ],
    keyTakeaways: [
      "Two Sum is a complement lookup problem, not a nested-loop problem.",
      "The map stores values from the left side of the scan so indices stay distinct.",
      "Checking before inserting avoids pairing an element with itself.",
      "Hash maps often buy linear time by spending linear space.",
    ],
    pattern:
      "For pair-sum questions, scan once, look up the needed complement among previous values, then store the current value for future complements.",
  },
  {
    kind: "problem",
    slug: "arr-contains-duplicate",
    moduleId: "arr-frequency-map",
    order: 17,
    title: "Contains Duplicate",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    tags: ["Array", "Hash Set", "Membership", "Duplicate Detection", "Early Exit"],
    companies: ["Amazon", "Microsoft", "Google", "Apple", "Adobe"],
    estimatedReadingMin: 6,
    estimatedSolvingMin: 10,
    statementMD:
      "Given an integer array **nums**, return **true** if any value appears at least twice in the array. Return **false** if every element is distinct.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^9 <= nums[i] <= 10^9",
    ],
    inputMD: "An integer array **nums**.",
    outputMD: "A boolean: **true** when some value repeats, otherwise **false**.",
    examples: [
      { input: "nums = [1, 2, 3, 1]", output: "true", explanation: "The value **1** appears at indices 0 and 3." },
      { input: "nums = [1, 2, 3, 4]", output: "false", explanation: "Every value appears exactly once." },
      { input: "nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]", output: "true", explanation: "There are multiple repeated values, so the answer is **true** as soon as the first repeat is seen." },
    ],
    learningObjectives: [
      "Recognise duplicate detection as a hash-set membership problem.",
      "Short-circuit the scan when a repeated value is found.",
      "Compare the hash-set solution with sorting when discussing tradeoffs.",
    ],
    intuitionMD:
      "**Pattern Recognition**\n\nThe signal is a repeated membership question: have I seen this exact value before? A nested loop compares each element to all later elements, which costs **O(n^2)**. Sorting also reveals duplicates, but it changes the ordering and costs **O(n log n)**.\n\nA hash set represents the values already visited. When the current value is already in the set, we have proof of a duplicate and can return immediately. If the scan finishes without a repeat, all values were distinct.",
    commonMistakes: [
      "Counting all frequencies even though one repeat is enough to answer the question.",
      "Sorting the array without mentioning that it may mutate the input.",
      "Using a list for membership checks, which quietly returns to **O(n^2)** time.",
      "Forgetting that negative values and large values are fine because the set stores actual integers.",
    ],
    algorithmMD:
      "**Key idea**\n\nKeep a hash set of values seen so far. Before adding a value, check whether it is already present. Presence means the current value has appeared earlier, so the array contains a duplicate.\n\n**Walkthrough**\n\nFor **nums = [1, 2, 3, 1]**, the set starts empty. Add **1**, then **2**, then **3**. When the scan reaches the final **1**, the set already contains **1**, so return **true** without scanning anything else.\n\n**Algorithm**\n\n1. Create an empty hash set **seen**.\n2. For each value in **nums**, check whether **seen** already contains it.\n3. If yes, return **true** immediately.\n4. Otherwise add the value to **seen**.\n5. If the loop ends, return **false** because no value repeated.",
    solutions: [
      {
        name: "Hash set membership scan",
        approachMD:
          "The set stores exactly the distinct values encountered so far. A duplicate is detected the first time insertion would add a value that is already present.",
        walkthroughMD:
          "1. Allocate a **HashSet<Integer>** named **seen**.\n2. Scan the array from left to right.\n3. If the current value is in **seen**, return **true**.\n4. Otherwise add it to **seen** and continue.\n5. Return **false** after the scan when every membership check was new.",
        complexity: { time: "O(n)", space: "O(n)", note: "Expected linear time with a set that may store every distinct value." },
        filename: "Solution.java",
        code: `import java.util.HashSet;
import java.util.Set;

class Solution {

    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();

        for (int value : nums) {
            if (seen.contains(value)) {
                return true;
            }

            seen.add(value);
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1, 2, 3, 1]. Track each membership check and the set after new insertions.",
      columns: ["step", "value", "seen before", "membership result", "seen after", "answer"],
      rows: [
        ["1", "1", "empty", "missing", "{1}", "not decided"],
        ["2", "2", "{1}", "missing", "{1, 2}", "not decided"],
        ["3", "3", "{1, 2}", "missing", "{1, 2, 3}", "not decided"],
        ["4", "1", "{1, 2, 3}", "present", "unchanged", "true"],
      ],
      narrativeMD: "The first repeated membership check proves the answer, so there is no need to count the rest of the array.",
    },
    interviewTipsMD:
      "Explain the early exit. The moment a set membership check succeeds, you have found two indices with the same value. If the interviewer asks about lower space, mention sorting as a valid tradeoff only when mutating or copying the array is acceptable.",
    followUps: [
      "How would you solve it in **O(1)** extra space if you are allowed to sort the array?",
      "How would you return the duplicate value instead of a boolean?",
      "How would you detect whether any duplicate appears within distance **k**?",
      "How would you process values from a stream and stop on the first repeat?",
    ],
    similarProblems: [
      { title: "Two Sum", difficulty: "Easy", slug: "arr-two-sum", note: "Uses a map rather than a set because the answer needs indices." },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "arr-top-k-frequent-elements", note: "Moves from membership to full frequency counting." },
      { title: "Longest Consecutive Sequence", difficulty: "Medium", slug: "arr-longest-consecutive-sequence", note: "Uses a set to test whether sequence starts exist." },
      { title: "Contains Duplicate II", difficulty: "Easy", url: "https://leetcode.com/problems/contains-duplicate-ii/", note: "Adds a distance constraint to duplicate detection." },
    ],
    keyTakeaways: [
      "Use a set when the question is only whether a value has appeared before.",
      "Membership checks turn duplicate detection into expected **O(n)** time.",
      "Return as soon as the duplicate is found; full frequency counts are unnecessary.",
    ],
    pattern:
      "For duplicate detection, keep a set of seen values and return on the first value that is already present.",
  },
  {
    kind: "problem",
    slug: "arr-top-k-frequent-elements",
    moduleId: "arr-frequency-map",
    order: 18,
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/top-k-frequent-elements/",
    tags: ["Array", "Hash Map", "Frequency Counting", "Bucket Sort", "Heap"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given an integer array **nums** and an integer **k**, return the **k** most frequent elements. The answer may be returned in any order.",
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
      "1 <= k <= number of unique elements in nums",
      "The answer is guaranteed to be unique as a set of values",
    ],
    inputMD: "An integer array **nums** and an integer **k**.",
    outputMD: "An integer array containing the **k** values with the highest frequencies, in any order.",
    examples: [
      { input: "nums = [1, 1, 1, 2, 2, 3], k = 2", output: "[1, 2]", explanation: "The frequencies are **1 -> 3**, **2 -> 2**, and **3 -> 1**, so the top two values are **1** and **2**." },
      { input: "nums = [1], k = 1", output: "[1]", explanation: "There is only one unique value, so it must be returned." },
      { input: "nums = [-1, -1, -2, -2, -2, 3], k = 2", output: "[-2, -1]", explanation: "The value **-2** appears 3 times and **-1** appears 2 times." },
    ],
    learningObjectives: [
      "Separate the problem into counting frequencies and selecting the largest counts.",
      "Use bucket sort to exploit the fact that no frequency can exceed **n**.",
      "Use a size-**k** min-heap when the number of unique values is large or streaming-like.",
      "Explain why returning values in any order simplifies the final extraction.",
    ],
    intuitionMD:
      "**Pattern Recognition**\n\nThe signal is a frequency ranking question: values matter only through how often they appear. Sorting the full array does not directly answer the question, and sorting all unique values by frequency costs **O(u log u)** for **u** unique values.\n\nFirst build a hash map from value to count. Then choose a selection strategy. Bucket sort is linear because frequencies are integers from **1** to **n**. A size-**k** min-heap is useful when you want to keep only the current best **k** values while scanning the frequency map.",
    commonMistakes: [
      "Sorting the original array and assuming adjacent duplicates automatically produce the top k values without a selection step.",
      "Building buckets by value instead of by frequency.",
      "Using a max-heap of all unique values when a size-k min-heap is enough for the heap approach.",
      "Returning frequencies instead of the elements that have those frequencies.",
    ],
    algorithmMD:
      "**Key idea**\n\nCount each value with a hash map. For the linear approach, create buckets where bucket **f** contains all values that appear **f** times. Scan buckets from high frequency to low frequency and collect values until **k** elements have been selected.\n\n**Walkthrough**\n\nFor **nums = [1, 1, 1, 2, 2, 3]** and **k = 2**, the frequency map becomes **1 -> 3**, **2 -> 2**, **3 -> 1**. Put **1** in bucket 3, **2** in bucket 2, and **3** in bucket 1. Scanning from bucket 6 down, the first non-empty bucket gives **1**, the next gives **2**, and the answer is complete.\n\n**Algorithm**\n\n1. Count every value in **frequencyByValue**.\n2. Create an array of buckets with indices from **0** through **nums.length**.\n3. For each map entry, append the value to the bucket matching its frequency.\n4. Scan bucket indices from high to low.\n5. Add values from each non-empty bucket to the answer.\n6. Stop as soon as **k** values have been collected.",
    solutions: [
      {
        name: "Bucket sort by frequency",
        whenToUseMD:
          "Use this when the input array is available and you want the best asymptotic time. Frequencies are bounded by **n**, so buckets avoid comparing every unique value.",
        approachMD:
          "After counting, frequency becomes the sortable key. Because the maximum frequency is **nums.length**, an array of lists acts like a counting sort over frequencies.",
        walkthroughMD:
          "1. Build **frequencyByValue** with one pass over **nums**.\n2. Allocate **nums.length + 1** buckets, where bucket index means frequency.\n3. Place each unique value into the bucket for its count.\n4. Walk buckets from largest frequency down to 1.\n5. Copy values into the answer until exactly **k** values have been written.",
        complexity: { time: "O(n)", space: "O(n)", note: "Counting, bucketing, and scanning the bucket array are all linear in the input size." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {

    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> frequencyByValue = new HashMap<>();
        for (int value : nums) {
            frequencyByValue.put(value, frequencyByValue.getOrDefault(value, 0) + 1);
        }

        List<Integer>[] buckets = new ArrayList[nums.length + 1];
        for (Map.Entry<Integer, Integer> entry : frequencyByValue.entrySet()) {
            int value = entry.getKey();
            int frequency = entry.getValue();

            if (buckets[frequency] == null) {
                buckets[frequency] = new ArrayList<>();
            }

            buckets[frequency].add(value);
        }

        int[] answer = new int[k];
        int write = 0;

        for (int frequency = buckets.length - 1; frequency >= 1 && write < k; frequency--) {
            if (buckets[frequency] == null) {
                continue;
            }

            for (int value : buckets[frequency]) {
                answer[write] = value;
                write++;

                if (write == k) {
                    return answer;
                }
            }
        }

        return answer;
    }
}`,
      },
      {
        name: "Size-k min-heap",
        whenToUseMD:
          "Use this when you want to keep only the best **k** candidates after counting, especially when **k** is much smaller than the number of unique values.",
        approachMD:
          "Maintain a min-heap ordered by frequency. Each heap entry is a value and its count. If the heap grows beyond **k**, remove the least frequent entry, leaving only the top candidates.",
        walkthroughMD:
          "1. Count frequencies in a hash map.\n2. Push each unique value and frequency into a min-heap ordered by frequency.\n3. Whenever the heap size exceeds **k**, remove the smallest frequency.\n4. After all entries are processed, the heap contains the **k** most frequent values.\n5. Pop them into the answer array in any order.",
        complexity: { time: "O(n log k)", space: "O(n)", note: "The frequency map stores up to n unique values, while heap operations cost log k each." },
        filename: "Solution.java",
        code: `import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

class Solution {

    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> frequencyByValue = new HashMap<>();
        for (int value : nums) {
            frequencyByValue.put(value, frequencyByValue.getOrDefault(value, 0) + 1);
        }

        PriorityQueue<int[]> minHeap = new PriorityQueue<>((first, second) -> first[1] - second[1]);
        for (Map.Entry<Integer, Integer> entry : frequencyByValue.entrySet()) {
            minHeap.offer(new int[] { entry.getKey(), entry.getValue() });

            if (minHeap.size() > k) {
                minHeap.poll();
            }
        }

        int[] answer = new int[k];
        for (int index = 0; index < k; index++) {
            answer[index] = minHeap.poll()[0];
        }

        return answer;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "nums = [1, 1, 1, 2, 2, 3], k = 2. Track counting, bucket placement, and high-to-low extraction.",
      columns: ["step", "phase", "item", "frequency state", "selection state"],
      rows: [
        ["1", "count", "1", "1 -> 1", "no buckets yet"],
        ["2", "count", "1", "1 -> 2", "no buckets yet"],
        ["3", "count", "1", "1 -> 3", "no buckets yet"],
        ["4", "count", "2, 2, 3", "1 -> 3, 2 -> 2, 3 -> 1", "counting complete"],
        ["5", "bucket", "entries", "bucket 3: [1], bucket 2: [2], bucket 1: [3]", "answer empty"],
        ["6", "scan", "frequency 3", "bucket 3 has [1]", "answer [1]"],
        ["7", "scan", "frequency 2", "bucket 2 has [2]", "answer [1, 2]"],
      ],
      narrativeMD: "Scanning from the highest frequency down collects **1** and **2** before lower-frequency values can enter the answer.",
    },
    interviewTipsMD:
      "Name the two phases: count, then select. For the bucket solution, emphasize that frequencies are bounded by **n**, which is why the bucket array is linear. For the heap solution, emphasize the **k**-sized heap invariant: after processing any number of unique values, the heap keeps the best **k** seen so far.",
    followUps: [
      "How would you handle ties if the output had to be sorted by value within the same frequency?",
      "How would you solve this for a stream where the final array is not stored?",
      "What changes if **k** is close to the number of unique values?",
      "How would you return the top **k** frequent words with lexicographic tie-breaking?",
    ],
    similarProblems: [
      { title: "Group Anagrams", difficulty: "Medium", slug: "arr-group-anagrams", note: "Also starts by turning raw strings into frequency-based keys." },
      { title: "Contains Duplicate", difficulty: "Easy", slug: "arr-contains-duplicate", note: "The simplest membership version before full counts are needed." },
      { title: "Valid Anagram", difficulty: "Easy", slug: "arr-valid-anagram", note: "Uses fixed-size counting for lowercase strings." },
      { title: "Top K Frequent Words", difficulty: "Medium", url: "https://leetcode.com/problems/top-k-frequent-words/", note: "Adds lexicographic tie-breaking to the same top-k counting idea." },
    ],
    keyTakeaways: [
      "Frequency questions usually split into counting and selecting.",
      "Bucket sort is linear when the key range is the frequency range **0...n**.",
      "A size-k min-heap keeps only the best candidates and costs **O(n log k)**.",
      "The output order is flexible unless the prompt says otherwise.",
    ],
    pattern:
      "For top-k frequency problems, count with a map, then select by frequency using buckets for linear time or a bounded min-heap for memory-conscious selection.",
  },
  {
    kind: "problem",
    slug: "arr-group-anagrams",
    moduleId: "arr-frequency-map",
    order: 19,
    title: "Group Anagrams",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/group-anagrams/",
    tags: ["Array", "Hash Map", "String", "Frequency Signature", "Grouping"],
    companies: ["Amazon", "Google", "Meta", "Microsoft", "Uber"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 21,
    statementMD:
      "Given an array of strings **strs**, group the anagrams together. You may return the groups in any order, and the strings within each group may appear in any order.",
    constraints: [
      "1 <= strs.length <= 10^4",
      "0 <= strs[i].length <= 100",
      "strs[i] consists of lowercase English letters",
    ],
    inputMD: "An array of lowercase strings **strs**.",
    outputMD: "A list of groups, where each group contains strings that are anagrams of one another.",
    examples: [
      { input: "strs = [eat, tea, tan, ate, nat, bat]", output: "[[eat, tea, ate], [tan, nat], [bat]]", explanation: "The words **eat**, **tea**, and **ate** share the same letters; **tan** and **nat** share another signature; **bat** stands alone." },
      { input: "strs = [a]", output: "[[a]]", explanation: "A single string forms a group by itself." },
      { input: "strs = [empty string]", output: "[[empty string]]", explanation: "The empty string has the all-zero character signature, so it forms one valid group." },
    ],
    learningObjectives: [
      "Recognise anagram grouping as a canonical-key hash map problem.",
      "Build a collision-safe key from either sorted characters or a 26-count signature.",
      "Use a map from signature to list of words to collect groups incrementally.",
      "Compare sorted-key simplicity with count-signature performance.",
    ],
    intuitionMD:
      "**Pattern Recognition**\n\nThe signal is that order inside each word does not matter, only the multiset of characters. Comparing every pair of strings would be expensive, and sorting the entire input array does not directly reveal all groups.\n\nCreate a canonical representation for each word so all anagrams produce the same key. That key can be a sorted string or a 26-length count signature. Then a hash map from key to group lets each word go directly to its anagram bucket.",
    commonMistakes: [
      "Using the raw word as the key, which keeps **eat** and **tea** in separate groups.",
      "Building an ambiguous count key such as **111** without separators, which can collide for different count vectors.",
      "Forgetting to create a new list when a signature appears for the first time.",
      "Assuming the output group order must match a specific ordering when the problem allows any order.",
    ],
    algorithmMD:
      "**Key idea**\n\nMap each word to a canonical signature. For lowercase English letters, count the 26 letters and join the counts with a separator such as **#** so different count vectors cannot collapse into the same key. Every anagram has the same signature and therefore lands in the same list.\n\n**Walkthrough**\n\nFor **strs = [eat, tea, tan, ate, nat, bat]**, the words **eat**, **tea**, and **ate** all produce the same counts for **a**, **e**, and **t**, so they share one key and one group. The words **tan** and **nat** share counts for **a**, **n**, and **t**, so they form another group. **bat** has a different signature and remains alone.\n\n**Algorithm**\n\n1. Create a hash map from signature string to list of words.\n2. For each word, build its canonical key.\n3. If the key is not in the map, create a new empty list for it.\n4. Append the word to the list for that key.\n5. Return all map values as the final grouped result.",
    solutions: [
      {
        name: "Count signature grouping",
        whenToUseMD:
          "Use this when strings are lowercase English letters and you want to avoid sorting each word. The key length is fixed by the alphabet size.",
        approachMD:
          "For every word, count its 26 letters and serialize those counts with a plain separator character. The serialized count vector is identical for anagrams and different for non-anagrams.",
        walkthroughMD:
          "1. Create **groupsBySignature**, a map from signature to list of words.\n2. For each word, fill a 26-entry count array using **char - 'a'** indexing.\n3. Build a signature by appending each count followed by **#**.\n4. Add the word to the list stored for that signature.\n5. Return a new list containing every grouped value list from the map.",
        complexity: { time: "O(totalChars + 26 * m)", space: "O(totalChars + 26 * m)", note: "m is the number of strings; each word is scanned once and each signature has 26 counts." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {

    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groupsBySignature = new HashMap<>();

        for (String word : strs) {
            String signature = buildSignature(word);
            groupsBySignature.computeIfAbsent(signature, unused -> new ArrayList<>()).add(word);
        }

        return new ArrayList<>(groupsBySignature.values());
    }

    private String buildSignature(String word) {
        int[] counts = new int[26];
        for (int index = 0; index < word.length(); index++) {
            counts[word.charAt(index) - 'a']++;
        }

        StringBuilder builder = new StringBuilder();
        for (int count : counts) {
            builder.append(count).append('#');
        }

        return builder.toString();
    }
}`,
      },
      {
        name: "Sorted string key",
        whenToUseMD:
          "Use this when simplicity matters more than shaving the per-word sorting cost, or when the alphabet is not fixed to lowercase English letters.",
        approachMD:
          "Sorting the characters of a word produces a canonical key because anagrams become the same sorted string. The grouping map is then identical to the count-signature approach.",
        walkthroughMD:
          "1. Create a map from sorted-character key to list of words.\n2. Convert each word to a character array and sort it.\n3. Use the sorted string as the key.\n4. Append the original word to the group for that key.\n5. Return all grouped lists from the map.",
        complexity: { time: "O(totalChars log L)", space: "O(totalChars)", note: "L is the maximum word length; each word is sorted before insertion into the map." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {

    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groupsByKey = new HashMap<>();

        for (String word : strs) {
            char[] letters = word.toCharArray();
            Arrays.sort(letters);
            String key = new String(letters);

            groupsByKey.computeIfAbsent(key, unused -> new ArrayList<>()).add(word);
        }

        return new ArrayList<>(groupsByKey.values());
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "strs = [eat, tea, tan, ate, nat, bat]. Track the canonical count signature and the groups map.",
      columns: ["step", "word", "signature summary", "groups after insertion"],
      rows: [
        ["1", "eat", "a1 e1 t1", "a1 e1 t1: [eat]"],
        ["2", "tea", "a1 e1 t1", "a1 e1 t1: [eat, tea]"],
        ["3", "tan", "a1 n1 t1", "a1 e1 t1: [eat, tea]; a1 n1 t1: [tan]"],
        ["4", "ate", "a1 e1 t1", "a1 e1 t1: [eat, tea, ate]; a1 n1 t1: [tan]"],
        ["5", "nat", "a1 n1 t1", "a1 e1 t1: [eat, tea, ate]; a1 n1 t1: [tan, nat]"],
        ["6", "bat", "a1 b1 t1", "add a1 b1 t1: [bat]"],
      ],
      narrativeMD: "Every word is routed by signature, so anagrams meet in the same map entry without pairwise comparisons.",
    },
    interviewTipsMD:
      "State the canonical-key principle clearly: anagrams must produce the same key and non-anagrams should not collide. If you use count signatures, mention why separators like **#** matter. If you use sorted keys, mention the simpler code and the extra sorting factor.",
    followUps: [
      "How would the signature change for Unicode strings or mixed-case input?",
      "How would you return groups sorted by size or lexicographic order?",
      "How would you group anagrams from a stream without storing all input first?",
      "How would you reduce memory if the input contains many repeated identical words?",
    ],
    similarProblems: [
      { title: "Valid Anagram", difficulty: "Easy", slug: "arr-valid-anagram", note: "The two-string version of comparing character counts." },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "arr-top-k-frequent-elements", note: "Also uses a map from a derived key to accumulated values." },
      { title: "Find All Anagrams in a String", difficulty: "Medium", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", note: "Turns anagram detection into a sliding frequency window." },
      { title: "Group Shifted Strings", difficulty: "Medium", url: "https://leetcode.com/problems/group-shifted-strings/", note: "Another canonical-key grouping problem." },
    ],
    keyTakeaways: [
      "Grouping problems usually need a canonical key before the hash map becomes useful.",
      "For lowercase anagrams, a 26-count signature avoids sorting every word.",
      "Separators in count signatures prevent ambiguous keys.",
      "The output order is flexible unless the problem adds ordering requirements.",
    ],
    pattern:
      "For anagram grouping, convert each string into an order-independent signature and append it to the hash-map group for that signature.",
  },
  {
    kind: "problem",
    slug: "arr-valid-anagram",
    moduleId: "arr-frequency-map",
    order: 20,
    title: "Valid Anagram",
    difficulty: "Easy",
    leetcodeUrl: "https://leetcode.com/problems/valid-anagram/",
    tags: ["String", "Hash Map", "Frequency Counting", "Array", "Anagram"],
    companies: ["Amazon", "Microsoft", "Google", "Apple", "Bloomberg"],
    estimatedReadingMin: 6,
    estimatedSolvingMin: 12,
    statementMD:
      "Given two strings **s** and **t**, return **true** if **t** is an anagram of **s**, and **false** otherwise. An anagram uses exactly the same characters with exactly the same multiplicities, possibly in a different order.",
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters",
    ],
    inputMD: "Two lowercase strings **s** and **t**.",
    outputMD: "A boolean: **true** when the two strings have identical character counts, otherwise **false**.",
    examples: [
      { input: "s = anagram, t = nagaram", output: "true", explanation: "Both strings contain **a** three times and **n**, **g**, **r**, **m** once each." },
      { input: "s = rat, t = car", output: "false", explanation: "The counts differ: **r** appears in **s** but not in **t**, while **c** appears in **t** but not in **s**." },
      { input: "s = a, t = ab", output: "false", explanation: "Different lengths cannot contain exactly the same multiset of characters." },
    ],
    learningObjectives: [
      "Recognise anagram validation as equality of character frequencies.",
      "Use a fixed 26-entry array instead of a general map for lowercase English letters.",
      "Balance increments from one string with decrements from the other string.",
      "Short-circuit immediately when lengths differ.",
    ],
    intuitionMD:
      "**Pattern Recognition**\n\nThe signal is that order does not matter, but multiplicity does. Sorting both strings would work, but it costs **O(n log n)**. For lowercase English letters, a fixed-size count array compares the two multisets in linear time.\n\nThink of one array as a balance sheet. Each character in **s** adds one credit, and each character in **t** removes one credit. If the strings are anagrams, every letter balance returns to zero.",
    commonMistakes: [
      "Checking only whether both strings contain the same distinct characters and ignoring multiplicity.",
      "Forgetting the early length check, which can make partial balances look misleading.",
      "Using a 128-entry table without explaining the lowercase constraint or alphabet assumption.",
      "Returning true before verifying that every count is back to zero.",
    ],
    algorithmMD:
      "**Key idea**\n\nUse an array of 26 balances. For each index, increment the count for **s[index]** and decrement the count for **t[index]**. Equal final balances mean every letter appeared the same number of times in both strings.\n\n**Walkthrough**\n\nFor **s = anagram** and **t = nagaram**, both strings have length 7. As the scan progresses, letters from **s** add to the balance and letters from **t** subtract from it. The temporary balances may be non-zero during the scan, but after all characters are processed, every letter count is zero, so the strings are anagrams.\n\n**Algorithm**\n\n1. If the lengths differ, return **false**.\n2. Create an integer array **balance** of length 26.\n3. For each index, increment **balance[s[index] - 'a']**.\n4. In the same loop, decrement **balance[t[index] - 'a']**.\n5. Scan **balance** and return **false** if any count is non-zero.\n6. Return **true** when all balances are zero.",
    solutions: [
      {
        name: "Balanced character counts",
        approachMD:
          "The fixed alphabet lets us replace a hash map with an integer array. Incrementing for **s** and decrementing for **t** makes the final all-zero check a direct test for equal frequencies.",
        walkthroughMD:
          "1. Return **false** immediately if the strings have different lengths.\n2. Allocate a 26-entry **balance** array.\n3. For each index, add one for the character from **s** and subtract one for the character from **t**.\n4. After the scan, inspect all 26 balances.\n5. Return **true** only if every balance is zero.",
        complexity: { time: "O(n)", space: "O(1)", note: "The scan is linear and the 26-entry array is constant space." },
        filename: "Solution.java",
        code: `class Solution {

    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) {
            return false;
        }

        int[] balance = new int[26];
        for (int index = 0; index < s.length(); index++) {
            balance[s.charAt(index) - 'a']++;
            balance[t.charAt(index) - 'a']--;
        }

        for (int count : balance) {
            if (count != 0) {
                return false;
            }
        }

        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = anagram, t = nagaram. Track the balance changes for the letters touched at each index.",
      columns: ["step", "s char", "t char", "balance change", "non-zero balances after step"],
      rows: [
        ["1", "a", "n", "+a, -n", "a:+1, n:-1"],
        ["2", "n", "a", "+n, -a", "all zero"],
        ["3", "a", "g", "+a, -g", "a:+1, g:-1"],
        ["4", "g", "a", "+g, -a", "all zero"],
        ["5", "r", "r", "+r, -r", "all zero"],
        ["6", "a", "a", "+a, -a", "all zero"],
        ["7", "m", "m", "+m, -m", "all zero"],
      ],
      narrativeMD: "Every temporary imbalance is cancelled by the end, so the final all-zero balance array proves the strings are anagrams.",
    },
    interviewTipsMD:
      "Mention the alphabet assumption before choosing **int[26]**. The solution is linear because you never sort; you only count. If the interviewer expands the character set, switch from the fixed array to a hash map or a larger indexed table.",
    followUps: [
      "How would the solution change for Unicode strings?",
      "How would you find all anagram positions of **p** inside a larger string **s**?",
      "How would you validate anagrams while ignoring spaces, punctuation, and case?",
      "How would you compare many strings against the same base word efficiently?",
    ],
    similarProblems: [
      { title: "Group Anagrams", difficulty: "Medium", slug: "arr-group-anagrams", note: "Generalizes two-string comparison into grouping by a shared signature." },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "arr-top-k-frequent-elements", note: "Another problem where counts are the main data structure." },
      { title: "Contains Duplicate", difficulty: "Easy", slug: "arr-contains-duplicate", note: "Uses membership instead of full character counts." },
      { title: "Find All Anagrams in a String", difficulty: "Medium", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", note: "Uses a sliding window of character counts." },
    ],
    keyTakeaways: [
      "Anagrams are equal frequency vectors, not equal sorted positions.",
      "A 26-entry array is the simplest count structure for lowercase English letters.",
      "Increment and decrement in one pass to compare two strings cleanly.",
      "Always reject unequal lengths before counting.",
    ],
    pattern:
      "For anagram validation, compare character frequencies with a fixed-size count array or map instead of sorting when the alphabet is bounded.",
  },
];
