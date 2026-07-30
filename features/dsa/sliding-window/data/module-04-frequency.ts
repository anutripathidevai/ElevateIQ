import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "sw-permutation-in-string",
    moduleId: "sw-frequency",
    order: 15,
    title: "Permutation in String",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/permutation-in-string/",
    tags: ["Sliding Window", "Frequency Array", "String", "Two Pointers", "Anagram Matching"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given two strings **s1** and **s2**, return **true** if **s2** contains a permutation of **s1**. In other words, some contiguous substring of **s2** must contain exactly the same character counts as **s1**.",
    constraints: [
      "1 <= s1.length, s2.length <= 10^4",
      "s1 and s2 consist of lowercase English letters",
    ],
    inputMD: "Two lowercase strings **s1** and **s2**. The target permutation length is **s1.length**.",
    outputMD: "A boolean: **true** if any length-**s1.length** substring of **s2** is an anagram of **s1**, otherwise **false**.",
    examples: [
      { input: "s1 = ab, s2 = eidbaooo", output: "true", explanation: "The substring **ba** in **s2** is a permutation of **ab**." },
      { input: "s1 = ab, s2 = eidboaoo", output: "false", explanation: "Every length-2 window misses either **a** or **b**, so no permutation appears." },
      { input: "s1 = adc, s2 = dcda", output: "true", explanation: "The substring **cda** has counts **a:1, c:1, d:1**, matching **adc**." },
    ],
    learningObjectives: [
      "Recognise permutation-in-string as fixed-window anagram matching.",
      "Maintain character frequencies incrementally instead of rebuilding each substring.",
      "Use a match counter to compare two frequency arrays in O(1) per slide.",
      "Handle the impossible case where the target is longer than the search string.",
    ],
    intuitionMD:
      "This is a Pattern Identification problem: the answer must be a contiguous substring of **s2**, and its length is fixed at **s1.length**. Any permutation of **s1** has exactly the same frequency count for every lowercase letter, so order inside the window does not matter; counts do.\n\nThe tempting slow approach is to sort every candidate substring or rebuild a fresh frequency table for every start index. The sliding-window insight is that adjacent windows differ by only two characters: one leaves on the left and one enters on the right. Update those two counts, then test whether the window frequency equals the target frequency.",
    commonMistakes: [
      "Checking only whether the same set of letters appears, which ignores duplicate counts.",
      "Sorting every window and turning a linear scan into extra logarithmic work.",
      "Forgetting to remove the leftmost character when the fixed window moves.",
      "Not returning **false** immediately when **s1.length > s2.length**.",
    ],
    algorithmMD:
      "**Window setup**\n\nUse two length-26 arrays: **targetCount** for **s1** and **windowCount** for the current length-**s1.length** window in **s2**. Keep **matches**, the number of character slots where the two arrays currently agree. When **matches == 26**, the current window is a permutation.\n\n**Window visualization**\n\nFor **s1 = ab** and **s2 = eidbaooo**, the target has **a:1** and **b:1**. The first window **ei** has **e:1** and **i:1**, so the important counts do not match. Slide to **id**, then **db**. At **db**, **b** matches but **a** is still missing. When the window becomes **ba** at indices **3..4**, the window has **a:1** and **b:1**, so every character slot matches the target.\n\n**Algorithm**\n\n1. If **s1** is longer than **s2**, return **false**.\n2. Build frequency arrays for **s1** and for the first **s1.length** characters of **s2**.\n3. Count how many of the 26 character positions currently match.\n4. If all 26 match, return **true**.\n5. Slide the fixed-size window one character at a time: add the entering character and remove the leaving character, adjusting **matches** before and after each count change.\n6. Return **true** as soon as **matches == 26**; otherwise return **false** after the scan.",
    solutions: [
      {
        name: "Fixed window with a character match counter",
        approachMD:
          "The frequency arrays represent the target and the current window. Instead of comparing all 26 entries after every slide, maintain **matches**, the number of positions already equal. Updating one character count can only affect that character position, so each slide stays O(1).",
        walkthroughMD:
          "1. Reject the case where **s1** is longer than **s2**.\n2. Fill **targetCount** from **s1** and **windowCount** from the first window of **s2**.\n3. Initialise **matches** by comparing all 26 slots once.\n4. For each new right index, add the entering character and update **matches** around that count change.\n5. Remove the character that fell out of the fixed window and update **matches** around that count change.\n6. If **matches** reaches 26 at any point, the current window is a permutation.",
        complexity: { time: "O(n + 26)", space: "O(1)", note: "The scan touches each character of s2 once, and the arrays have fixed alphabet size 26." },
        filename: "Solution.java",
        code: `class Solution {

    public boolean checkInclusion(String s1, String s2) {
        int targetLength = s1.length();
        int searchLength = s2.length();
        if (targetLength > searchLength) {
            return false;
        }

        int[] targetCount = new int[26];
        int[] windowCount = new int[26];

        for (int index = 0; index < targetLength; index++) {
            targetCount[s1.charAt(index) - 'a']++;
            windowCount[s2.charAt(index) - 'a']++;
        }

        int matches = 0;
        for (int letter = 0; letter < 26; letter++) {
            if (targetCount[letter] == windowCount[letter]) {
                matches++;
            }
        }

        if (matches == 26) {
            return true;
        }

        for (int right = targetLength; right < searchLength; right++) {
            int entering = s2.charAt(right) - 'a';
            if (windowCount[entering] == targetCount[entering]) {
                matches--;
            }
            windowCount[entering]++;
            if (windowCount[entering] == targetCount[entering]) {
                matches++;
            }

            int leaving = s2.charAt(right - targetLength) - 'a';
            if (windowCount[leaving] == targetCount[leaving]) {
                matches--;
            }
            windowCount[leaving]--;
            if (windowCount[leaving] == targetCount[leaving]) {
                matches++;
            }

            if (matches == 26) {
                return true;
            }
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s1 = ab, s2 = eidbaooo. The window size is 2 and the target counts are **a:1, b:1**.",
      columns: ["step", "window bounds", "entering", "leaving", "important window counts", "matches", "decision"],
      rows: [
        ["initial", "0..1", "none", "none", "e:1, i:1", "22", "Not a match."],
        ["slide 1", "1..2", "d", "e", "d:1, i:1", "22", "Still missing both a and b."],
        ["slide 2", "2..3", "b", "i", "b:1, d:1", "24", "b matches, but a is missing."],
        ["slide 3", "3..4", "a", "d", "a:1, b:1", "26", "All counts match, return true."],
      ],
      narrativeMD: "The first time **matches** reaches 26 is the window **ba**, which is a valid permutation of **ab**.",
    },
    complexityNote:
      "The match-counter version is the expected optimal solution because it performs constant work per slide over a fixed alphabet.",
    interviewTipsMD:
      "Name the pattern early: this is fixed-window anagram matching. Emphasise that permutations are about counts, not order. A strong answer either compares 26-count arrays at each step or maintains a match counter; the match counter is a nice senior-level refinement because it makes the per-slide equality check explicit and constant time.",
    followUps: [
      "How would you adapt this if the alphabet were full Unicode instead of lowercase English letters?",
      "How would you return the first matching index instead of a boolean?",
      "What changes if **s1** can contain uppercase and lowercase letters separately?",
      "Could you solve it with a single balance array instead of two arrays?",
    ],
    similarProblems: [
      { title: "Find All Anagrams in a String", difficulty: "Medium", slug: "sw-find-all-anagrams-in-a-string", note: "Uses the same fixed-size frequency window but records every matching start." },
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "Uses frequencies too, but the window size is variable and must be minimized." },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "sw-longest-substring-without-repeating-characters", note: "Another character-frequency window, with uniqueness as the invariant." },
      { title: "Valid Anagram", difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/", note: "The static version of comparing character counts." },
    ],
    keyTakeaways: [
      "Permutation matching over a string is fixed-window anagram matching.",
      "A length-26 frequency array captures all lowercase character counts.",
      "Adjacent windows differ by one entering and one leaving character.",
      "A match counter avoids rescanning the whole frequency array after every slide.",
    ],
    pattern:
      "For fixed-length anagram matching, build target counts once, slide a same-size window, update the entering and leaving counts, and test frequency equality.",
  },
  {
    kind: "problem",
    slug: "sw-find-all-anagrams-in-a-string",
    moduleId: "sw-frequency",
    order: 16,
    title: "Find All Anagrams in a String",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
    tags: ["Sliding Window", "Frequency Array", "String", "Two Pointers", "Anagram Matching"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 18,
    statementMD:
      "Given two strings **s** and **p**, return all start indices of substrings in **s** that are anagrams of **p**. The answer may be returned in any order.",
    constraints: [
      "1 <= s.length, p.length <= 3 * 10^4",
      "s and p consist of lowercase English letters",
    ],
    inputMD: "Two lowercase strings: **s**, the search string, and **p**, the anagram pattern.",
    outputMD: "A list of integers containing every start index where the length-**p.length** window in **s** has the same character counts as **p**.",
    examples: [
      { input: "s = cbaebabacd, p = abc", output: "[0,6]", explanation: "The windows **cba** at index 0 and **bac** at index 6 are anagrams of **abc**." },
      { input: "s = abab, p = ab", output: "[0,1,2]", explanation: "The windows **ab**, **ba**, and **ab** all have one **a** and one **b**." },
      { input: "s = baa, p = aa", output: "[1]", explanation: "Only the window starting at index 1 has two **a** characters." },
    ],
    learningObjectives: [
      "Reuse the fixed-window frequency equality pattern to find every match, not just one.",
      "Convert a successful window position into the correct start index.",
      "Maintain a match counter safely while adding and removing characters.",
      "Understand why the window size must remain exactly **p.length**.",
    ],
    intuitionMD:
      "This is the same Pattern Identification signal as permutation matching: an anagram of **p** must be contiguous in **s** and must have fixed length **p.length**. The only difference is the output. Instead of stopping at the first matching window, collect every start index whose frequency array equals the target frequency array.\n\nThe sliding window is powerful because every neighboring candidate shares almost all characters with the previous one. Once the first window is counted, each move changes exactly two counts. That lets us scan **s** once while preserving a precise anagram test.",
    commonMistakes: [
      "Returning after the first anagram even though the problem asks for all starting indices.",
      "Recording **right - patternLength** instead of **right - patternLength + 1** after a slide.",
      "Letting the window grow beyond **p.length** and comparing counts of different-sized substrings.",
      "Treating anagrams as unique-letter matches and missing repeated characters in **p**.",
    ],
    algorithmMD:
      "**Window setup**\n\nUse **targetCount** for **p** and **windowCount** for the current fixed-size window in **s**. Maintain **matches**, the number of lowercase letters whose target and window counts are equal. Whenever **matches == 26**, append the window start index to the answer.\n\n**Window visualization**\n\nFor **s = cbaebabacd** and **p = abc**, the target counts are **a:1, b:1, c:1**. The first window **cba** already matches, so record **0**. Sliding to **bae** loses **c** and gains **e**, so the counts no longer match. The same update continues until the window **bac** at indices **6..8**, where **a**, **b**, and **c** all return to count 1. Record **6**.\n\n**Algorithm**\n\n1. Create an empty result list.\n2. If **p.length > s.length**, return the empty list.\n3. Build the target counts from **p** and the first window counts from **s**.\n4. Compute the initial **matches** value across all 26 characters.\n5. Record index **0** if the initial window matches.\n6. Slide one position at a time by adding **s[right]** and removing **s[right - p.length]**, updating **matches** around both count changes.\n7. After each slide, if **matches == 26**, append **right - p.length + 1**.",
    solutions: [
      {
        name: "Fixed window frequency matching",
        approachMD:
          "Every candidate anagram has the same length as **p**, so the window never needs to expand or shrink conditionally. We slide a fixed-size window and use the same match-counter frequency comparison as Permutation in String, appending each successful start index.",
        walkthroughMD:
          "1. Prepare an empty list for answers and return it immediately if **p** is longer than **s**.\n2. Count characters in **p** and in the first window of **s**.\n3. Count how many of the 26 slots are equal.\n4. Add **0** when the first window matches.\n5. For every later right index, update the entering character, then the leaving character, preserving a fixed window length.\n6. Whenever all 26 slots match, add the current start index to the result.",
        complexity: { time: "O(n + 26)", space: "O(1)", note: "Each character enters and leaves the fixed window at most once; the result list is output space." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> result = new ArrayList<>();
        int patternLength = p.length();
        int textLength = s.length();
        if (patternLength > textLength) {
            return result;
        }

        int[] targetCount = new int[26];
        int[] windowCount = new int[26];

        for (int index = 0; index < patternLength; index++) {
            targetCount[p.charAt(index) - 'a']++;
            windowCount[s.charAt(index) - 'a']++;
        }

        int matches = 0;
        for (int letter = 0; letter < 26; letter++) {
            if (targetCount[letter] == windowCount[letter]) {
                matches++;
            }
        }

        if (matches == 26) {
            result.add(0);
        }

        for (int right = patternLength; right < textLength; right++) {
            int entering = s.charAt(right) - 'a';
            if (windowCount[entering] == targetCount[entering]) {
                matches--;
            }
            windowCount[entering]++;
            if (windowCount[entering] == targetCount[entering]) {
                matches++;
            }

            int leaving = s.charAt(right - patternLength) - 'a';
            if (windowCount[leaving] == targetCount[leaving]) {
                matches--;
            }
            windowCount[leaving]--;
            if (windowCount[leaving] == targetCount[leaving]) {
                matches++;
            }

            if (matches == 26) {
                result.add(right - patternLength + 1);
            }
        }

        return result;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = cbaebabacd, p = abc. The target counts are **a:1, b:1, c:1**, and the fixed window size is 3.",
      columns: ["right after slide", "window bounds", "window", "important window counts", "matches", "result"],
      rows: [
        ["initial", "0..2", "cba", "a:1, b:1, c:1", "26", "[0]"],
        ["3", "1..3", "bae", "a:1, b:1, e:1", "24", "[0]"],
        ["4", "2..4", "aeb", "a:1, b:1, e:1", "24", "[0]"],
        ["5", "3..5", "eba", "a:1, b:1, e:1", "24", "[0]"],
        ["6", "4..6", "bab", "a:1, b:2", "24", "[0]"],
        ["7", "5..7", "aba", "a:2, b:1", "24", "[0]"],
        ["8", "6..8", "bac", "a:1, b:1, c:1", "26", "[0,6]"],
        ["9", "7..9", "acd", "a:1, c:1, d:1", "24", "[0,6]"],
      ],
      narrativeMD: "Only windows **cba** and **bac** make all 26 frequency slots match the target, so the answer is **[0,6]**.",
    },
    complexityNote:
      "The result list can grow to O(n), but the working memory for frequency comparison stays constant because the alphabet is fixed.",
    interviewTipsMD:
      "Make the connection to Permutation in String explicit. The core check is identical; the interview difference is collecting starts accurately. State the formula for the current start after sliding as **right - p.length + 1**, because off-by-one errors are common here.",
    followUps: [
      "How would you count the number of anagram windows without storing their indices?",
      "How would the solution change for a large alphabet where 26 arrays are not enough?",
      "Can you reuse the same helper for both this problem and Permutation in String?",
      "How would you stream **s** one character at a time and emit matching starts online?",
    ],
    similarProblems: [
      { title: "Permutation in String", difficulty: "Medium", slug: "sw-permutation-in-string", note: "The boolean version of the same fixed-window frequency equality check." },
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "Also tracks target counts, but searches for the smallest valid variable window." },
      { title: "Subarrays with K Different Integers", difficulty: "Hard", slug: "sw-subarrays-with-k-different-integers", note: "Another frequency-window problem where valid starts are counted rather than listed." },
      { title: "Group Anagrams", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/", note: "Uses frequency signatures to identify anagrams outside a sliding window." },
    ],
    keyTakeaways: [
      "All anagram windows have fixed length equal to the pattern length.",
      "Frequency equality is the correct anagram test, especially when duplicates exist.",
      "A match counter turns repeated array comparison into constant-time slide updates.",
      "After processing right, the current start is **right - p.length + 1**.",
    ],
    pattern:
      "For every fixed-size anagram query, slide a window of pattern length, maintain character counts incrementally, and record each start where the counts match.",
  },
  {
    kind: "problem",
    slug: "sw-fruit-into-baskets",
    moduleId: "sw-frequency",
    order: 17,
    title: "Fruit Into Baskets",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/fruit-into-baskets/",
    tags: ["Sliding Window", "Hash Map", "Two Pointers", "Variable Window", "Array"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "You are given an integer array **fruits**, where **fruits[i]** is the type of fruit on tree **i**. Starting from any tree, you must move right one tree at a time and pick exactly one fruit from each tree until you stop. You have two baskets, and each basket can hold only one fruit type. Return the maximum number of fruits you can collect.",
    constraints: [
      "1 <= fruits.length <= 10^5",
      "0 <= fruits[i] < fruits.length",
    ],
    inputMD: "An integer array **fruits**, where each value represents a fruit type along a line of trees.",
    outputMD: "An integer: the length of the longest contiguous subarray containing at most two distinct fruit types.",
    examples: [
      { input: "fruits = [1,2,1]", output: "3", explanation: "The whole array contains only two fruit types, so all three fruits can be collected." },
      { input: "fruits = [0,1,2,2]", output: "3", explanation: "Starting at index 1 collects **[1,2,2]**, which uses two baskets and has length 3." },
      { input: "fruits = [1,2,3,2,2]", output: "4", explanation: "The longest valid window is **[2,3,2,2]**, containing fruit types 2 and 3." },
    ],
    learningObjectives: [
      "Recognise the basket rule as longest subarray with at most two distinct values.",
      "Maintain a variable window whose frequency map represents the active baskets.",
      "Shrink from the left only while the distinct-type invariant is violated.",
      "Use amortised analysis to explain why nested shrink loops still run in O(n).",
    ],
    intuitionMD:
      "This is a Pattern Identification problem for an at-most-K-distinct variable window, with **K = 2**. The picked fruits must form one contiguous run because you start somewhere and move only right. The two baskets mean the current run is valid exactly when it contains at most two distinct fruit types.\n\nThe feasibility condition is monotone with respect to moving **left** forward: removing fruits can never create a new distinct type. That gives the standard expand-and-shrink template. Expand **right** to try a larger run; when a third type appears, shrink **left** until only two types remain again. Every valid window after shrinking is a candidate answer.",
    commonMistakes: [
      "Treating the problem as choosing any two fruit types globally instead of requiring one contiguous run.",
      "Clearing the whole map when a third type appears rather than shrinking one tree at a time.",
      "Updating the best length before restoring the at-most-two-types invariant.",
      "Forgetting to remove a fruit type from the map when its count becomes zero.",
    ],
    algorithmMD:
      "**Window setup**\n\nMaintain two pointers **left** and **right**, plus a frequency map **basketCounts** from fruit type to count inside the current window. The invariant after shrinking is **basketCounts.size <= 2**. Track **best** as the maximum valid window length seen.\n\n**Window visualization**\n\nFor **fruits = [1,2,3,2,2]**, expand through **[1,2]** and the map has two types. Adding **3** gives counts **1:1, 2:1, 3:1**, which violates the two-basket rule. Shrink from the left by removing **1**, leaving **[2,3]** with counts **2:1, 3:1**. Now the window is valid again. Continuing right grows **[2,3,2,2]**, the best length 4.\n\n**Algorithm**\n\n1. Initialise **left = 0**, **best = 0**, and an empty frequency map.\n2. Move **right** from left to right across **fruits**.\n3. Add **fruits[right]** to the map.\n4. While the map has more than two distinct fruit types, decrement the count of **fruits[left]**, remove it if the count becomes zero, and increment **left**.\n5. After the window is valid, update **best** with **right - left + 1**.\n6. Return **best**.",
    solutions: [
      {
        name: "Variable window with at most two fruit types",
        approachMD:
          "The two baskets are exactly a two-distinct-type constraint. A frequency map tells us how many distinct types are currently inside the window and lets us shrink correctly when a third type appears.",
        walkthroughMD:
          "1. Keep **left** at the start of the current candidate window and store counts in **basketCounts**.\n2. For each **right**, add the new fruit type to the map.\n3. If the map now contains three types, repeatedly remove **fruits[left]** and advance **left** until only two types remain.\n4. Once valid, compute the current window length.\n5. Keep the maximum length over the scan.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each index enters once and leaves once. The map holds at most three fruit types during repair, so auxiliary space is constant." },
        filename: "Solution.java",
        code: `import java.util.HashMap;
import java.util.Map;

class Solution {

    public int totalFruit(int[] fruits) {
        Map<Integer, Integer> basketCounts = new HashMap<>();
        int left = 0;
        int best = 0;

        for (int right = 0; right < fruits.length; right++) {
            int fruit = fruits[right];
            basketCounts.put(fruit, basketCounts.getOrDefault(fruit, 0) + 1);

            while (basketCounts.size() > 2) {
                int leftFruit = fruits[left];
                int remaining = basketCounts.get(leftFruit) - 1;
                if (remaining == 0) {
                    basketCounts.remove(leftFruit);
                } else {
                    basketCounts.put(leftFruit, remaining);
                }
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
      inputMD: "fruits = [1,2,3,2,2]. Track the current window, basket counts, and best valid length after each right expansion.",
      columns: ["right", "fruit", "left before shrink", "basket counts after add", "shrink action", "valid window", "best"],
      rows: [
        ["0", "1", "0", "1:1", "No shrink needed.", "0..0 => [1]", "1"],
        ["1", "2", "0", "1:1, 2:1", "No shrink needed.", "0..1 => [1,2]", "2"],
        ["2", "3", "0", "1:1, 2:1, 3:1", "Remove fruit 1 at left 0.", "1..2 => [2,3]", "2"],
        ["3", "2", "1", "2:2, 3:1", "No shrink needed.", "1..3 => [2,3,2]", "3"],
        ["4", "2", "1", "2:3, 3:1", "No shrink needed.", "1..4 => [2,3,2,2]", "4"],
      ],
      narrativeMD: "The maximum valid window is indices **1..4**, containing **[2,3,2,2]** with exactly two fruit types and length 4.",
    },
    complexityNote:
      "The inner shrink loop is amortised O(n), not O(n^2), because **left** only moves forward across the array once.",
    interviewTipsMD:
      "Translate the story into the invariant immediately: longest contiguous subarray with at most two distinct values. Once stated that way, the template is straightforward: expand right, shrink left while distinct types exceed two, then score the valid window. Interviewers often ask about amortised complexity, so mention that each tree is added once and removed at most once.",
    followUps: [
      "How would you generalise this to **k** baskets instead of two?",
      "How would you return the start and end indices of the best fruit segment?",
      "What if each basket had a capacity limit as well as a fruit-type restriction?",
      "How would the answer change if you were allowed to skip trees while moving right?",
    ],
    similarProblems: [
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "sw-longest-substring-without-repeating-characters", note: "Another variable window where the map enforces a distinctness invariant." },
      { title: "Subarrays with K Different Integers", difficulty: "Hard", slug: "sw-subarrays-with-k-different-integers", note: "Generalises bounded distinct types and counts exact-K windows." },
      { title: "Minimum Window Substring", difficulty: "Hard", slug: "sw-minimum-window-substring", note: "Uses a frequency map with a different validity condition and minimisation objective." },
      { title: "Max Consecutive Ones III", difficulty: "Medium", slug: "sw-max-consecutive-ones-iii", note: "Another at-most-K variable window where the violation count controls shrinking." },
      { title: "Longest Substring with At Most Two Distinct Characters", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/", note: "The direct string analogue of the fruit basket constraint." },
    ],
    keyTakeaways: [
      "Fruit Into Baskets is longest subarray with at most two distinct values.",
      "A frequency map gives both counts and the current number of distinct types.",
      "Shrink only while the invariant is broken, then score the restored valid window.",
      "The expand-shrink loop is linear because both pointers move in one direction.",
    ],
    pattern:
      "For longest at-most-K-distinct windows, expand right into a frequency map, shrink left while distinct count exceeds K, and update the best valid length after repair.",
  },
];
