import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "sw-longest-substring-without-repeating-characters",
    moduleId: "sw-variable",
    order: 11,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    tags: ["Sliding Window", "Two Pointers", "Hash Map", "String", "Variable Window"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given a string **s**, return the length of the longest substring that contains no repeated characters. A substring must be contiguous, so you may only move a window over adjacent characters.",
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols, and spaces",
    ],
    inputMD: "A string **s**.",
    outputMD: "An integer: the maximum length of a contiguous substring with all unique characters.",
    examples: [
      { input: "s = abcabcbb", output: "3", explanation: "The longest valid substrings include **abc**, **bca**, and **cab**, each with length 3." },
      { input: "s = bbbbb", output: "1", explanation: "Every repeated **b** forces the window to keep only one character." },
      { input: "s = pwwkew", output: "3", explanation: "The answer is **wke** with length 3. **pwke** is not allowed because it is not contiguous." },
    ],
    learningObjectives: [
      "Identify a longest-valid variable window where the condition is all characters are unique.",
      "Maintain the left boundary so every window considered after shrinking is duplicate-free.",
      "Use last-seen indices to jump left directly past the previous duplicate.",
      "Explain why each character enters and leaves the window at most once.",
    ],
    intuitionMD:
      "Pattern Identification\n\nThis is a longest-valid variable-window problem: among all contiguous substrings, we want the largest one that satisfies a local condition. The condition is monotone with respect to shrinking: if a window has a duplicate, moving **left** rightward can only remove characters and eventually restore uniqueness.\n\nThe expand and shrink invariant is: after processing each **right** index, the active window **s[left...right]** contains no repeated characters. When a duplicate enters, do not restart the search. Move **left** just beyond the previous occurrence if that occurrence is still inside the current window, then keep expanding from there.",
    commonMistakes: [
      "Resetting the whole window to **right + 1** after a duplicate, which discards valid characters after the previous duplicate.",
      "Moving **left** backward when the last seen duplicate is outside the current window.",
      "Using a set but removing only one character when the duplicate may require multiple removals.",
      "Returning the substring itself when the problem asks for only its length.",
    ],
    algorithmMD:
      "**Window setup**\n\nKeep two boundaries, **left** and **right**, representing the current substring. Store the most recent index of each character. The invariant is that every character inside **left...right** appears once.\n\n**Window visualization**\n\nFor **s = abcabcbb**, the window grows through **abc** with **left = 0** and **right = 2**, so the best length becomes 3. When **right** reaches the second **a** at index 3, the previous **a** is at index 0 inside the window, so **left** jumps to 1 and the window becomes **bca**. The same idea repeats for the second **b** and second **c**: the window does not restart, it slides past the old copy and keeps the longest valid suffix.\n\n**Algorithm**\n\n1. Create a last-seen table where each character maps to the index after its latest occurrence.\n2. Start **left = 0** and **best = 0**.\n3. For each **right** index, read the current character.\n4. Move **left** to **max(left, lastSeenPlusOne[current])** so the previous copy is excluded only if it is inside the window.\n5. Update **best** with **right - left + 1**.\n6. Store **right + 1** as the latest position for the current character.\n7. Return **best**.",
    solutions: [
      {
        name: "Last seen index sliding window",
        approachMD:
          "The last-seen table lets the left boundary jump over a duplicate in one step. Because **left** never moves backward, the window remains unique and the scan is linear.",
        walkthroughMD:
          "1. Allocate an ASCII table where each entry stores one plus the last seen index, with **0** meaning unseen.\n2. Scan **s** from left to right with **right**.\n3. Before measuring the window, move **left** past the previous copy of the current character if that copy lies inside the active window.\n4. Update the best length using the current unique window.\n5. Record the current character position as **right + 1** and continue.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each character is processed once, and the ASCII table has fixed size 128." },
        filename: "Solution.java",
        code: `class Solution {

    public int lengthOfLongestSubstring(String s) {
        int[] lastSeenPlusOne = new int[128];
        int left = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            char current = s.charAt(right);
            left = Math.max(left, lastSeenPlusOne[current]);
            best = Math.max(best, right - left + 1);
            lastSeenPlusOne[current] = right + 1;
        }

        return best;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = abcabcbb. Track **left**, **right**, the active unique window, and the best length.",
      columns: ["step", "right char", "left before", "left after", "window after update", "best"],
      rows: [
        ["1", "a at 0", "0", "0", "a", "1"],
        ["2", "b at 1", "0", "0", "ab", "2"],
        ["3", "c at 2", "0", "0", "abc", "3"],
        ["4", "a at 3", "0", "1", "bca", "3"],
        ["5", "b at 4", "1", "2", "cab", "3"],
        ["6", "c at 5", "2", "3", "abc", "3"],
        ["7", "b at 6", "3", "5", "cb", "3"],
        ["8", "b at 7", "5", "7", "b", "3"],
      ],
      narrativeMD: "The best unique window length reaches **3** at **abc** and never improves afterward.",
    },
    interviewTipsMD:
      "Say that the key invariant is a duplicate-free window after every iteration. If using last indices, emphasize the **max** with the current **left**; without it, an old duplicate outside the window can incorrectly move **left** backward. If using a set, explain that the while loop removes characters until the duplicate is gone.",
    followUps: [
      "How would you return the actual longest substring instead of only the length?",
      "How would the solution change for full Unicode input instead of ASCII?",
      "How would you find the longest substring with at most **k** distinct characters?",
      "How would you process a stream where characters arrive one at a time?",
    ],
    similarProblems: [
      { title: "Longest Repeating Character Replacement", difficulty: "Medium", slug: "sw-longest-repeating-character-replacement", note: "Another longest-valid window with a different validity condition." },
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "Uses the opposite shortest-valid template with character counts." },
      { title: "Permutation in String", difficulty: "Medium", slug: "sw-permutation-in-string", note: "Builds frequency windows over substrings." },
      { title: "Find All Anagrams in a String", difficulty: "Medium", slug: "sw-find-all-anagrams-in-a-string", note: "Maintains character counts while sliding through a string." },
    ],
    keyTakeaways: [
      "Longest-valid windows expand right and repair invalidity by moving left.",
      "The invariant after each step is a window with no duplicate characters.",
      "Last-seen positions can jump **left** directly instead of shrinking one character at a time.",
      "**left** must never move backward.",
    ],
    pattern:
      "For longest substring with a uniqueness constraint, expand right, move left past the previous conflicting character, and update the answer after restoring validity.",
  },
  {
    kind: "problem",
    slug: "sw-longest-repeating-character-replacement",
    moduleId: "sw-variable",
    order: 12,
    title: "Longest Repeating Character Replacement",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/longest-repeating-character-replacement/",
    tags: ["Sliding Window", "Two Pointers", "Frequency Counting", "String", "Variable Window"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Uber"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "Given a string **s** containing only uppercase English letters and an integer **k**, return the length of the longest substring that can be transformed into a substring with the same repeated character by replacing at most **k** characters.",
    constraints: [
      "1 <= s.length <= 10^5",
      "s consists of only uppercase English letters",
      "0 <= k <= s.length",
    ],
    inputMD: "A string **s** of uppercase letters and an integer **k**, the maximum number of replacements allowed.",
    outputMD: "An integer: the maximum length of a contiguous substring that can become all one character using at most **k** replacements.",
    examples: [
      { input: "s = ABAB, k = 2", output: "4", explanation: "Replace both **A** characters or both **B** characters to make the entire string equal." },
      { input: "s = AABABBA, k = 1", output: "4", explanation: "The substring **AABA** can become **AAAA** by replacing one **B**, and no length 5 window is valid." },
      { input: "s = AAAA, k = 0", output: "4", explanation: "The full string already consists of one repeated character." },
    ],
    learningObjectives: [
      "Translate replacement budget into the validity test **window length - max frequency <= k**.",
      "Maintain frequency counts while expanding and shrinking a variable window.",
      "Understand why the tracked maximum frequency does not need to decrease during shrinking.",
      "Use the longest-valid template without checking every target character separately.",
    ],
    intuitionMD:
      "Pattern Identification\n\nThis is a longest-valid variable-window problem. For any fixed window, the best target character is the character that already appears most often. Every other character must be replaced, so the window is valid exactly when **window length - max frequency in window <= k**.\n\nThe expand and shrink invariant is budget feasibility. Expand **right** to try a larger answer. If the number of needed replacements exceeds **k**, shrink **left** until the window size is no longer beyond what the current best frequency can support. The subtle greedy insight is that **max frequency** can be kept as the largest value ever seen while expanding; an overestimated value may delay shrinking, but it never causes the final best length to exceed a length that was supported when that maximum frequency was achieved.",
    commonMistakes: [
      "Counting replacements against the first character in the window instead of the most frequent character.",
      "Recomputing the maximum frequency from scratch on every shrink for no benefit.",
      "Shrinking when **window length - max frequency == k** even though the window is still valid.",
      "Trying all 26 target letters separately when one frequency table is enough.",
    ],
    algorithmMD:
      "**Window setup**\n\nKeep **left**, **right**, a frequency table for the 26 uppercase letters, and **maxFrequency**, the largest count of any letter observed in the current expansion history. A window of length **L** is valid when **L - maxFrequency <= k**.\n\n**Window visualization**\n\nFor **s = AABABBA** and **k = 1**, the window grows through **AABA**. Its length is 4 and the highest frequency is 3 for **A**, so only one replacement is needed and **best = 4**. When **right** reaches the next **B**, the window **AABAB** has length 5 and max frequency 3, so it would need 2 replacements. Shrink **left** once to keep the search focused on windows that can match the current budget.\n\n**Algorithm**\n\n1. Initialise **left = 0**, **best = 0**, **maxFrequency = 0**, and a 26-entry frequency table.\n2. For each **right**, add **s[right]** to the table and update **maxFrequency**.\n3. If **right - left + 1 - maxFrequency > k**, remove **s[left]** and increment **left**.\n4. Update **best** with the current window length.\n5. Return **best** after the scan.",
    solutions: [
      {
        name: "Frequency window with replacement budget",
        approachMD:
          "The frequency table tells us the cheapest character to make the whole window equal to: keep the majority letter and replace the rest. The window only shrinks when the number of non-majority characters exceeds **k**.",
        walkthroughMD:
          "1. Count letters as the right boundary expands.\n2. Keep **maxFrequency** as the largest count reached by any letter during expansion.\n3. When the window would need more than **k** replacements, remove the leftmost letter and move **left** forward.\n4. Record the largest window length seen after the budget check.\n5. Return that length.",
        complexity: { time: "O(n)", space: "O(1)", note: "The scan is linear and the frequency table always has 26 entries." },
        filename: "Solution.java",
        code: `class Solution {

    public int characterReplacement(String s, int k) {
        int[] frequency = new int[26];
        int left = 0;
        int maxFrequency = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {
            int addIndex = s.charAt(right) - 'A';
            frequency[addIndex]++;
            maxFrequency = Math.max(maxFrequency, frequency[addIndex]);

            while (right - left + 1 - maxFrequency > k) {
                int removeIndex = s.charAt(left) - 'A';
                frequency[removeIndex]--;
                left++;
            }

            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = AABABBA, k = 1. Track the window length, the best majority count, replacements needed, and the best answer.",
      columns: ["step", "right char", "left", "window", "maxFrequency", "needed replacements", "best"],
      rows: [
        ["1", "A at 0", "0", "A", "1", "0", "1"],
        ["2", "A at 1", "0", "AA", "2", "0", "2"],
        ["3", "B at 2", "0", "AAB", "2", "1", "3"],
        ["4", "A at 3", "0", "AABA", "3", "1", "4"],
        ["5", "B at 4", "1", "ABAB", "3", "1 after shrinking", "4"],
        ["6", "B at 5", "2", "BABB", "3", "1 after shrinking", "4"],
        ["7", "A at 6", "3", "ABBA", "3", "1 after shrinking", "4"],
      ],
      narrativeMD: "The longest valid window length is **4**. The table keeps **maxFrequency = 3**, which is enough to preserve the correct best length.",
    },
    interviewTipsMD:
      "Lead with the formula **window length - max frequency** because it explains the whole problem. Be ready to justify stale **maxFrequency**: it may make the current window look better than it is, but the answer length was achievable when that frequency was originally present, and the window only grows one step at a time.",
    followUps: [
      "What if the alphabet were much larger than 26 characters?",
      "How would you return the substring bounds as well as the length?",
      "How would the solution change if different characters had different replacement costs?",
      "How would you solve the binary version where you may flip at most **k** zeroes?",
    ],
    similarProblems: [
      { title: "Max Consecutive Ones III", difficulty: "Medium", slug: "sw-max-consecutive-ones-iii", note: "The binary version of replacing at most k non-target values." },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "sw-longest-substring-without-repeating-characters", note: "Another longest-valid variable window." },
      { title: "Fruit Into Baskets", difficulty: "Medium", slug: "sw-fruit-into-baskets", note: "Tracks frequencies while maintaining a bounded number of distinct values." },
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "Uses counts and shrinking, but optimizes for shortest valid coverage." },
    ],
    keyTakeaways: [
      "The best replacement target inside a window is its most frequent character.",
      "A window is valid when non-majority characters fit inside the replacement budget.",
      "For this longest-window problem, **maxFrequency** does not need to decrease while shrinking.",
      "Shrink only when the budget is exceeded, not when it is exactly used.",
    ],
    pattern:
      "For longest replacement windows, track the majority frequency, treat the rest as required edits, and shrink only while required edits exceed the allowed budget.",
  },
  {
    kind: "problem",
    slug: "sw-minimum-size-subarray-sum",
    moduleId: "sw-variable",
    order: 13,
    title: "Minimum Size Subarray Sum",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/minimum-size-subarray-sum/",
    tags: ["Sliding Window", "Two Pointers", "Array", "Prefix Sum", "Variable Window"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 16,
    statementMD:
      "Given an array of positive integers **nums** and a positive integer **target**, return the minimal length of a contiguous subarray whose sum is at least **target**. If no such subarray exists, return **0**.",
    constraints: [
      "1 <= target <= 10^9",
      "1 <= nums.length <= 10^5",
      "1 <= nums[i] <= 10^4",
    ],
    inputMD: "A positive integer **target** and an array of positive integers **nums**.",
    outputMD: "An integer: the length of the shortest contiguous subarray with sum at least **target**, or **0** if none exists.",
    examples: [
      { input: "target = 7, nums = [2,3,1,2,4,3]", output: "2", explanation: "The shortest valid subarray is **[4,3]**, whose sum is 7." },
      { input: "target = 4, nums = [1,4,4]", output: "1", explanation: "The single element **4** already reaches the target." },
      { input: "target = 11, nums = [1,1,1,1,1,1,1,1]", output: "0", explanation: "Even the full array sums to only 8, so no valid subarray exists." },
    ],
    learningObjectives: [
      "Recognise a shortest-valid variable window over positive numbers.",
      "Use positivity to justify shrinking while the current sum remains at least the target.",
      "Record the answer before removing the leftmost element from a valid window.",
      "Distinguish this linear window from prefix-sum binary search alternatives.",
    ],
    intuitionMD:
      "Pattern Identification\n\nThis is a shortest-valid variable-window problem. The window condition is **sum >= target**, and all numbers are positive. That positivity is what makes the window monotone: expanding **right** never decreases the sum, and shrinking **left** never increases it.\n\nThe expand and shrink invariant is: expand until the window is valid, then shrink as much as possible while it stays valid. Every time the sum reaches the target, the current window is a candidate answer. Shrinking immediately tests whether a shorter candidate with the same **right** boundary exists.",
    commonMistakes: [
      "Using a sliding window when negative numbers are allowed; the monotone sum property would break.",
      "Updating the best length only after shrinking, which can miss the current valid window.",
      "Stopping after finding the first valid window instead of continuing to find a shorter one.",
      "Returning the sentinel length instead of **0** when no valid subarray exists.",
    ],
    algorithmMD:
      "**Window setup**\n\nKeep **left**, **right**, the current **window sum**, and **bestLength**. The window contains positive numbers from **left** through **right**. Because every value is positive, moving **left** rightward makes the sum smaller in a predictable way.\n\n**Window visualization**\n\nFor **target = 7** and **nums = [2,3,1,2,4,3]**, expand until the sum first reaches 8 at window **[2,3,1,2]**. Record length 4, then shrink from the left: removing 2 leaves sum 6, so this right boundary cannot produce a shorter valid window. Continue expanding to include 4, which gives sum 10 over **[3,1,2,4]**. Now repeated shrinking finds **[2,4]** with length 2 before the sum drops below 7. The final 3 confirms another length 2 window **[4,3]**.\n\n**Algorithm**\n\n1. Set **left = 0**, **sum = 0**, and **bestLength** to a sentinel larger than the array length.\n2. For each **right** index, add **nums[right]** to **sum**.\n3. While **sum >= target**, update **bestLength** with the current length.\n4. Subtract **nums[left]** and increment **left** to search for a shorter valid window.\n5. After the scan, return **0** if the sentinel was never changed; otherwise return **bestLength**.",
    solutions: [
      {
        name: "Shortest valid positive-sum window",
        approachMD:
          "Since every element is positive, once a window reaches the target we can safely remove elements from the left until it becomes invalid. That finds the shortest valid window ending at each **right** index.",
        walkthroughMD:
          "1. Expand the right boundary and add each number to the running sum.\n2. Whenever the sum is at least **target**, record the current window length.\n3. Remove **nums[left]** and move **left** forward to test a shorter window with the same right boundary.\n4. Repeat the shrink step until the sum falls below **target**.\n5. Return the best recorded length, or **0** if no valid window was recorded.",
        complexity: { time: "O(n)", space: "O(1)", note: "Both pointers move from left to right at most once." },
        filename: "Solution.java",
        code: `class Solution {

    public int minSubArrayLen(int target, int[] nums) {
        int left = 0;
        int sum = 0;
        int bestLength = nums.length + 1;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];

            while (sum >= target) {
                bestLength = Math.min(bestLength, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }

        if (bestLength == nums.length + 1) {
            return 0;
        }
        return bestLength;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "target = 7, nums = [2,3,1,2,4,3]. Track the positive-sum window and update the best length before each shrink.",
      columns: ["step", "right value", "left before shrinking", "sum after expand", "shrink actions", "best length"],
      rows: [
        ["1", "2 at 0", "0", "2", "sum < 7, keep expanding", "none"],
        ["2", "3 at 1", "0", "5", "sum < 7, keep expanding", "none"],
        ["3", "1 at 2", "0", "6", "sum < 7, keep expanding", "none"],
        ["4", "2 at 3", "0", "8", "record 4, remove 2, sum becomes 6", "4"],
        ["5", "4 at 4", "1", "10", "record 4, remove 3; record 3, remove 1; record 2, remove 2", "2"],
        ["6", "3 at 5", "4", "7", "record 2, remove 4, sum becomes 3", "2"],
      ],
      narrativeMD: "The shortest valid window has length **2**, achieved by **[2,4]** and **[4,3]**.",
    },
    interviewTipsMD:
      "Call out that positivity is the reason the two-pointer window works. If the interviewer allows negative numbers, this exact shrink rule is no longer safe and you need a prefix-sum plus monotonic deque style approach for related variants. In this problem, record the length before subtracting from the left because the current window is valid at that moment.",
    followUps: [
      "What changes if **nums** can contain negative values?",
      "How would you return the start and end indices of the shortest valid subarray?",
      "How would you solve many target queries over the same positive array?",
      "Can you solve it with prefix sums and binary search, and when would that be useful?",
    ],
    similarProblems: [
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "The string version of expanding until valid and shrinking to minimum." },
      { title: "Minimum Operations to Reduce X to Zero", difficulty: "Medium", slug: "sw-minimum-operations-to-reduce-x-to-zero", note: "Transforms into finding a longest positive-sum middle window." },
      { title: "Subarray Product Less Than K", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-product-less-than-k/", note: "Another positive-array window where multiplication is monotone while expanding and shrinking." },
      { title: "Max Consecutive Ones III", difficulty: "Medium", slug: "sw-max-consecutive-ones-iii", note: "Uses the same expand and shrink mechanics with a budget condition." },
    ],
    keyTakeaways: [
      "Shortest-valid windows record an answer as soon as the window becomes valid.",
      "Positive numbers make sum-based shrinking safe and monotone.",
      "The inner while loop finds the shortest valid window for the current **right** boundary.",
      "Return **0** when no window ever reaches the target.",
    ],
    pattern:
      "For shortest positive-sum windows, expand until the sum reaches the target, then repeatedly record and shrink left until the window becomes invalid.",
  },
  {
    kind: "problem",
    slug: "sw-minimum-window-substring",
    moduleId: "sw-variable",
    order: 14,
    title: "Minimum Window Substring",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/minimum-window-substring/",
    tags: ["Sliding Window", "Two Pointers", "Hash Map", "String", "Frequency Counting"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Netflix", "Oracle"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "Given two strings **s** and **t**, return the minimum-length substring of **s** that contains every character of **t**, including duplicate requirements. If no such substring exists, return an empty string.",
    constraints: [
      "1 <= s.length, t.length <= 10^5",
      "s and t consist of uppercase and lowercase English letters",
      "The answer is unique when it exists",
    ],
    inputMD: "Two strings: **s**, the search text, and **t**, the multiset of required characters.",
    outputMD: "The shortest contiguous substring of **s** that contains all characters from **t** with the required multiplicities, or an empty string if no such window exists.",
    examples: [
      { input: "s = ADOBECODEBANC, t = ABC", output: "BANC", explanation: "**BANC** contains **A**, **B**, and **C**, and no shorter substring of **s** contains all three." },
      { input: "s = a, t = a", output: "a", explanation: "The single character window satisfies the requirement." },
      { input: "s = a, t = aa", output: "", explanation: "**s** contains only one **a**, but **t** requires two." },
    ],
    learningObjectives: [
      "Model **t** as required character frequencies rather than a set.",
      "Track how many distinct required characters are fully satisfied by the current window.",
      "Use the shortest-valid template: expand until all requirements are met, then shrink to minimize.",
      "Handle duplicate requirements and irrelevant characters without special cases.",
    ],
    intuitionMD:
      "Pattern Identification\n\nThis is a shortest-valid variable-window problem. A window is valid when it covers the required multiset from **t**. Expanding **right** can only add coverage, while shrinking **left** may remove coverage. That creates the classic two-phase loop: grow until valid, then shrink while still valid to expose the minimum window.\n\nThe expand and shrink invariant is based on matched requirements. Maintain **need** counts from **t**, **window** counts from the current substring, and **formed**, the number of distinct required characters whose window count has reached the needed count. When **formed** equals the number of required distinct characters, the window is valid and should be minimized immediately.",
    commonMistakes: [
      "Treating **t** as a set and ignoring duplicate characters like **AA**.",
      "Incrementing the matched count every time a required character appears, even after its needed count is already satisfied.",
      "Shrinking before recording the current valid window.",
      "Removing irrelevant characters incorrectly even though they should not affect **formed**.",
    ],
    algorithmMD:
      "**Window setup**\n\nBuild **need** counts for **t** using an ASCII table. Track **required**, the number of distinct characters with positive need. As the window moves over **s**, update **window** counts and maintain **formed**, the number of required characters whose current count is at least exactly satisfied.\n\n**Window visualization**\n\nFor **s = ADOBECODEBANC** and **t = ABC**, the window first becomes valid at **ADOBEC** when it has **A**, **B**, and **C**. Record that length, then shrink from the left. Removing **A** breaks validity, so expansion resumes. Later, when the window reaches **CODEBANC**, all requirements are satisfied again. Shrinking removes irrelevant and extra characters until the compact valid window **BANC** remains. Removing **B** would break validity, so **BANC** is the minimum for that right boundary and becomes the final answer.\n\n**Algorithm**\n\n1. Count required characters from **t** in **need** and compute **required**.\n2. Initialise **left = 0**, **formed = 0**, and best window metadata.\n3. Expand **right** through **s**, adding each character to **window**.\n4. When a required character count becomes exactly satisfied, increment **formed**.\n5. While **formed == required**, record the current window if it is shorter than the best.\n6. Remove **s[left]**, decrement **formed** if that removal makes a required count fall below its need, then increment **left**.\n7. Return the best substring if one was recorded; otherwise return an empty string.",
    solutions: [
      {
        name: "Matched frequency sliding window",
        approachMD:
          "The window carries two count tables: what is needed from **t** and what is currently present. A distinct required character contributes to **formed** only when its count reaches the needed frequency, which handles duplicates naturally.",
        walkthroughMD:
          "1. Build the **need** table and count how many distinct required characters exist.\n2. Expand the right boundary, updating the current window count.\n3. When a character reaches its required count, increment **formed**.\n4. While all requirements are formed, update the best answer and remove characters from the left.\n5. If removing a character drops it below its required count, the window becomes invalid and expansion resumes.\n6. Return the saved best substring, or an empty string if no valid window was found.",
        complexity: { time: "O(n + m)", space: "O(1)", note: "Here n is s.length and m is t.length. The two ASCII count tables have fixed size 128." },
        filename: "Solution.java",
        code: `class Solution {

    public String minWindow(String s, String t) {
        if (t.length() > s.length()) {
            return "";
        }

        int[] need = new int[128];
        int required = 0;
        for (int index = 0; index < t.length(); index++) {
            char current = t.charAt(index);
            if (need[current] == 0) {
                required++;
            }
            need[current]++;
        }

        int[] window = new int[128];
        int formed = 0;
        int left = 0;
        int bestStart = 0;
        int bestLength = s.length() + 1;

        for (int right = 0; right < s.length(); right++) {
            char add = s.charAt(right);
            window[add]++;
            if (need[add] > 0 && window[add] == need[add]) {
                formed++;
            }

            while (formed == required) {
                int length = right - left + 1;
                if (length < bestLength) {
                    bestLength = length;
                    bestStart = left;
                }

                char remove = s.charAt(left);
                window[remove]--;
                if (need[remove] > 0 && window[remove] < need[remove]) {
                    formed--;
                }
                left++;
            }
        }

        if (bestLength == s.length() + 1) {
            return "";
        }
        return s.substring(bestStart, bestStart + bestLength);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = ADOBECODEBANC, t = ABC. Track distinct requirements satisfied and the best window after each important expansion or shrink.",
      columns: ["step", "right char", "left", "window state", "formed of required", "best window"],
      rows: [
        ["1", "A at 0", "0", "A count satisfied", "1 of 3", "none"],
        ["2", "B at 3", "0", "A and B satisfied", "2 of 3", "none"],
        ["3", "C at 5", "0", "A, B, C satisfied in ADOBEC", "3 of 3", "ADOBEC"],
        ["4", "shrink past A", "1", "A no longer satisfied", "2 of 3", "ADOBEC"],
        ["5", "A at 10", "1", "all requirements satisfied again in DOBECODEBA", "3 of 3", "ADOBEC"],
        ["6", "shrink to C", "5", "CODEBA still valid before removing C", "3 of 3", "CODEBA"],
        ["7", "C at 12", "6", "ODEBANC valid, then shrink irrelevant chars", "3 of 3", "CODEBA"],
        ["8", "shrink to BANC", "9", "BANC is valid and length 4", "3 of 3", "BANC"],
      ],
      narrativeMD: "The shortest valid window found is **BANC**. Shrinking stops there because removing **B** would make the window miss a required character.",
    },
    interviewTipsMD:
      "Emphasize that this is a multiset coverage problem, not a set membership problem. The clean explanation is **required distinct characters** versus **formed distinct characters**. Record the best window before each left removal, because the window is valid at the top of the shrink loop. Use arrays for ASCII constraints or maps for a larger character set.",
    followUps: [
      "How would the solution change for full Unicode strings?",
      "How would you return all minimum windows if multiple answers had the same length?",
      "How would you handle a stream of characters where **s** is not fully stored?",
      "How would you adapt the approach if each required character had a weight instead of a count?",
    ],
    similarProblems: [
      { title: "Permutation in String", difficulty: "Medium", slug: "sw-permutation-in-string", note: "Also compares required and window frequencies over a string." },
      { title: "Find All Anagrams in a String", difficulty: "Medium", slug: "sw-find-all-anagrams-in-a-string", note: "A fixed-size frequency-window version of multiset matching." },
      { title: "Minimum Size Subarray Sum", difficulty: "Medium", slug: "sw-minimum-size-subarray-sum", note: "The numeric shortest-valid window template." },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "sw-longest-substring-without-repeating-characters", note: "Contrasts shortest-valid coverage with longest-valid uniqueness." },
      { title: "Smallest Range Covering Elements from K Lists", difficulty: "Hard", url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/", note: "Another minimum coverage problem, solved with a different ordered-data structure." },
    ],
    keyTakeaways: [
      "Minimum Window Substring is shortest-valid sliding window over required counts.",
      "Use frequency counts, not sets, because duplicates in **t** matter.",
      "**formed == required** is the signal to shrink and minimize.",
      "Record the answer before removing from the left side of a valid window.",
    ],
    pattern:
      "For minimum coverage windows, expand until every requirement is satisfied, then repeatedly record and shrink left until one requirement breaks.",
  },
];
