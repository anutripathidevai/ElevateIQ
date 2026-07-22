import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "greedy-partition-labels",
    moduleId: "greedy-string",
    order: 19,
    title: "Partition Labels",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/partition-labels/",
    tags: ["Greedy", "String", "Last Occurrence", "Two Pointers", "Intervals"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 15,
    statementMD:
      "You are given a lowercase string **s**. Split it into as many parts as possible so that each letter appears in at most one part. Return a list of the sizes of those parts in order.",
    constraints: [
      "1 <= s.length <= 500",
      "s consists of lowercase English letters",
    ],
    inputMD: "A lowercase string **s**.",
    outputMD: "A list of integers, where each integer is the length of one partition and every character appears in at most one partition.",
    examples: [
      { input: "s = ababcbacadefegdehijhklij", output: "[9,7,8]", explanation: "The partitions are ababcbaca, defegde, and hijhklij. No letter crosses partition boundaries." },
      { input: "s = eccbbbbdec", output: "[10]", explanation: "The early e must stay with the final e, and that span also contains all occurrences of c, b, and d, so the whole string is one partition." },
    ],
    learningObjectives: [
      "Convert character last occurrences into greedy boundary constraints.",
      "Recognise when a partition can safely close as soon as all seen letters are contained.",
      "Explain why cutting at the first safe boundary maximises the number of partitions.",
      "Implement a linear scan with constant extra character metadata.",
    ],
    intuitionMD:
      "**Greedy Insight:** When a partition starts, every character you see creates an obligation: the partition must extend at least to that character's last occurrence. So keep a running **end** equal to the farthest last occurrence among characters in the current partition.\n\nThe moment the scan index reaches **end**, all obligations created inside the partition have been satisfied. Closing immediately is safe and best, because delaying the cut can only make this partition larger and reduce the number of remaining partitions.",
    commonMistakes: [
      "Cutting when the current character reaches its own last occurrence, instead of checking the farthest last occurrence of every character seen in the partition.",
      "Trying every possible split, which misses the fact that each character gives a direct boundary requirement.",
      "Forgetting to reset the partition start after closing a partition.",
      "Building maps of character positions when only the last occurrence is needed.",
    ],
    algorithmMD:
      "**Greedy strategy**\nPrecompute the last index of every character. Sweep from left to right, extending the current partition end to the farthest last occurrence of any character seen so far. When the current index equals that end, close the partition immediately.\n\n**Why it works**\nBefore index **end**, at least one character inside the current partition still appears later, so any earlier cut would violate the rule. At index **end**, every character seen since **start** has its final occurrence inside **start...end**, so the cut is valid.\n\n**Proof of correctness**\nConsider an optimal solution. The first partition cannot end before the greedy **end**, because some character from the first partition would appear outside it. If the optimal first partition ends after the greedy **end**, exchange that longer first partition for the greedy shorter valid partition. This does not make any later partition invalid, because no character inside the greedy partition appears later. The remaining suffix is at least as long to partition as before, so the number of partitions is no worse. Repeating this exchange for each suffix shows the greedy cuts are optimal.\n\n**Algorithm**\n1. Record **last[c]**, the final index of each lowercase character.\n2. Initialise **start = 0** and **end = 0**.\n3. For each index **i**, update **end = max(end, last[s[i]])**.\n4. If **i == end**, append **end - start + 1** to the answer and set **start = i + 1**.\n5. Return all partition lengths.",
    solutions: [
      {
        name: "Last occurrence sweep",
        approachMD:
          "The last occurrence array turns each character into an interval from its first appearance in the active partition to its final appearance. The greedy scan keeps the union of those intervals and cuts as soon as the union closes.",
        walkthroughMD:
          "1. Fill an array **last** of size 26 so **last[c]** stores the final index of character **c**.\n2. Sweep the string while maintaining the current partition **start** and required **end**.\n3. For every character, extend **end** to the character's final index if needed.\n4. When the scan reaches **end**, append the partition length and start a new partition at the next index.",
        complexity: { time: "O(n)", space: "O(1)", note: "The string is scanned twice and the last-occurrence array has 26 entries. The returned list is not counted as auxiliary space." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int index = 0; index < s.length(); index++) {
            last[s.charAt(index) - 'a'] = index;
        }

        List<Integer> partitions = new ArrayList<>();
        int start = 0;
        int end = 0;

        for (int index = 0; index < s.length(); index++) {
            int character = s.charAt(index) - 'a';
            end = Math.max(end, last[character]);

            if (index == end) {
                partitions.add(end - start + 1);
                start = index + 1;
            }
        }

        return partitions;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = ababcbacadefegdehijhklij. Important last occurrences include **a:8**, **b:5**, **c:7**, **d:14**, **e:15**, **f:11**, **g:13**, **h:19**, **i:22**, **j:23**, **k:20**, **l:21**.",
      columns: ["i", "char", "last[char]", "partition start", "current end after update", "action"],
      rows: [
        ["0", "a", "8", "0", "8", "Extend first partition to index 8"],
        ["1", "b", "5", "0", "8", "Stay inside current boundary"],
        ["2", "a", "8", "0", "8", "Stay inside current boundary"],
        ["3", "b", "5", "0", "8", "Stay inside current boundary"],
        ["4", "c", "7", "0", "8", "Stay inside current boundary"],
        ["5", "b", "5", "0", "8", "Stay inside current boundary"],
        ["6", "a", "8", "0", "8", "Stay inside current boundary"],
        ["7", "c", "7", "0", "8", "Stay inside current boundary"],
        ["8", "a", "8", "0", "8", "Cut length 9"],
        ["9", "d", "14", "9", "14", "Start second partition"],
        ["10", "e", "15", "9", "15", "Extend second partition to index 15"],
        ["11", "f", "11", "9", "15", "Stay inside current boundary"],
        ["12", "e", "15", "9", "15", "Stay inside current boundary"],
        ["13", "g", "13", "9", "15", "Stay inside current boundary"],
        ["14", "d", "14", "9", "15", "Stay inside current boundary"],
        ["15", "e", "15", "9", "15", "Cut length 7"],
        ["16", "h", "19", "16", "19", "Start third partition"],
        ["17", "i", "22", "16", "22", "Extend third partition to index 22"],
        ["18", "j", "23", "16", "23", "Extend third partition to index 23"],
        ["19", "h", "19", "16", "23", "Stay inside current boundary"],
        ["20", "k", "20", "16", "23", "Stay inside current boundary"],
        ["21", "l", "21", "16", "23", "Stay inside current boundary"],
        ["22", "i", "22", "16", "23", "Stay inside current boundary"],
        ["23", "j", "23", "16", "23", "Cut length 8"],
      ],
      narrativeMD: "The greedy cut points are indices **8**, **15**, and **23**, producing partition lengths **9**, **7**, and **8**.",
    },
    interviewTipsMD:
      "Start the explanation from the constraint each seen character creates: once a character appears, the current partition must include its last occurrence. Interviewers usually want to hear that cutting earlier is impossible and cutting later is wasteful, which is exactly the greedy-choice proof.",
    followUps: [
      "How would the solution change if the alphabet were arbitrary Unicode characters?",
      "Can you return the actual substrings instead of their lengths?",
      "What if each character may appear in at most two partitions?",
      "How would you stream the string if last occurrences were not known in advance?",
    ],
    similarProblems: [
      { title: "Remove Duplicate Letters", difficulty: "Medium", slug: "greedy-remove-duplicate-letters", note: "Also uses future character knowledge to make a safe greedy decision." },
      { title: "Reorganize String", difficulty: "Medium", slug: "greedy-reorganize-string", note: "Another string greedy problem driven by character frequency metadata." },
      { title: "Merge Intervals", difficulty: "Medium", slug: "greedy-merge-intervals", note: "Partition Labels behaves like merging character intervals and cutting when the merged interval ends." },
      { title: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", slug: "greedy-minimum-arrows-burst-balloons", note: "Another interval-boundary greedy where the chosen cut point must satisfy all active intervals." },
    ],
    keyTakeaways: [
      "A character's last occurrence is a hard boundary for the partition that first contains it.",
      "The first valid cut is optimal because delaying it cannot create more partitions.",
      "The running end represents the merged interval of all characters seen in the current partition.",
      "Two linear scans are enough: one to learn future constraints and one to cut greedily.",
    ],
    pattern:
      "Last-occurrence partitioning: precompute each symbol's final position, sweep while maintaining the farthest required boundary, and cut at the first index where all active symbols are contained.",
  },
  {
    kind: "problem",
    slug: "greedy-remove-duplicate-letters",
    moduleId: "greedy-string",
    order: 20,
    title: "Remove Duplicate Letters",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/remove-duplicate-letters/",
    tags: ["Greedy", "String", "Monotonic Stack", "Lexicographic Order", "Hashing"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given a lowercase string **s**, remove duplicate letters so that every distinct letter appears exactly once. Among all valid results, return the lexicographically smallest one.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of lowercase English letters",
    ],
    inputMD: "A lowercase string **s**.",
    outputMD: "The lexicographically smallest string that contains each distinct character from **s** exactly once.",
    examples: [
      { input: "s = bcabc", output: "abc", explanation: "The result must contain a, b, and c once. Choosing a before b and c gives the smallest valid order." },
      { input: "s = cbacdcbc", output: "acdb", explanation: "The tempting prefix cadb is valid, but acdb is smaller. The character d cannot be moved after b because d has no later copy." },
    ],
    learningObjectives: [
      "Use remaining occurrence counts to decide whether a chosen character can be safely removed.",
      "Maintain a monotonic increasing stack for lexicographic minimisation under subsequence constraints.",
      "Distinguish between a character that is larger and removable and one that is larger but mandatory now.",
      "Prove stack pops with an exchange argument based on a later replacement copy.",
    ],
    intuitionMD:
      "**Greedy Insight:** Build the answer left to right with a monotonic increasing stack. When a smaller character arrives, it should move as far left as possible. You may pop a larger top character only if that larger character appears again later, because then it can be reinserted without losing required coverage.\n\nThe key is the future count. A larger top with no remaining copy is locked in place. A larger top with a remaining copy is safe to postpone, and postponing it makes the prefix smaller immediately, which is exactly what lexicographic order rewards.",
    commonMistakes: [
      "Popping a larger character without checking whether it appears again later, which can remove a required letter permanently.",
      "Sorting the distinct characters, which ignores the subsequence order constraint imposed by the original string.",
      "Forgetting to mark a popped character as not currently in the stack.",
      "Skipping duplicate characters before decrementing their remaining count, which makes future-availability decisions wrong.",
    ],
    algorithmMD:
      "**Greedy strategy**\nScan left to right while maintaining a stack that is as lexicographically small as possible. Before deciding on the current character, decrement its remaining count. If it is already in the stack, skip it. Otherwise, while the stack top is larger than the current character and the top appears later again, pop the top. Then push the current character.\n\n**Why it works**\nLexicographic order is decided by the earliest position where two answers differ. If a smaller current character can replace a larger stack top while the larger character can still be placed later, the replacement strictly improves the answer without sacrificing feasibility.\n\n**Proof of correctness**\nAssume an optimal valid subsequence differs from the greedy stack at the first position where greedy chose a smaller character **x** after popping a larger character **y**. Since **y** has another occurrence later, exchange the earlier **y** with **x** and place **y** at that later occurrence. The result still contains every character once and respects original order, but its first differing character is smaller, so it is lexicographically no worse. Repeating this exchange justifies every pop the greedy stack performs. Characters with no later occurrence are never popped, preserving feasibility.\n\n**Algorithm**\n1. Count remaining occurrences of each character.\n2. Keep a stack-like **StringBuilder** and a boolean array **inStack**.\n3. For each character, decrement its remaining count.\n4. If it is already present, skip it.\n5. While the stack top is larger and has remaining copies, pop it and clear its presence flag.\n6. Push the current character and mark it present.\n7. Return the stack as the final string.",
    solutions: [
      {
        name: "Monotonic stack with remaining counts",
        approachMD:
          "The stack stores the current best answer prefix. Remaining counts answer the only safety question: if a larger top is popped, can it still appear later? This gives a single-pass greedy algorithm.",
        walkthroughMD:
          "1. Count all characters so future availability is known during the scan.\n2. For each character, first reduce its remaining count because the current copy is being consumed.\n3. If the character is already in the stack, ignore this copy.\n4. Otherwise, pop larger stack-top characters while they still have future copies.\n5. Append the current character and mark it as present.\n6. Convert the stack builder to the answer string.",
        complexity: { time: "O(n)", space: "O(1)", note: "Each character is pushed and popped at most once. The count and presence arrays have 26 entries." },
        filename: "Solution.java",
        code: `class Solution {

    public String removeDuplicateLetters(String s) {
        int[] remaining = new int[26];
        for (int index = 0; index < s.length(); index++) {
            remaining[s.charAt(index) - 'a']++;
        }

        boolean[] inStack = new boolean[26];
        StringBuilder stack = new StringBuilder();

        for (int index = 0; index < s.length(); index++) {
            char current = s.charAt(index);
            int currentIndex = current - 'a';
            remaining[currentIndex]--;

            if (inStack[currentIndex]) {
                continue;
            }

            while (stack.length() > 0) {
                char top = stack.charAt(stack.length() - 1);
                int topIndex = top - 'a';
                if (top <= current || remaining[topIndex] == 0) {
                    break;
                }

                stack.deleteCharAt(stack.length() - 1);
                inStack[topIndex] = false;
            }

            stack.append(current);
            inStack[currentIndex] = true;
        }

        return stack.toString();
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = cbacdcbc. Initial counts are **c:4**, **b:2**, **a:1**, and **d:1**.",
      columns: ["index", "char", "remaining after decrement", "stack before", "decision", "stack after"],
      rows: [
        ["0", "c", "c:3", "empty", "Push c", "c"],
        ["1", "b", "b:1", "c", "Pop c because c is larger and appears later, then push b", "b"],
        ["2", "a", "a:0", "b", "Pop b because b is larger and appears later, then push a", "a"],
        ["3", "c", "c:2", "a", "Push c after a", "ac"],
        ["4", "d", "d:0", "ac", "Push d because stack remains increasing enough", "acd"],
        ["5", "c", "c:1", "acd", "Skip c because it is already in the stack", "acd"],
        ["6", "b", "b:0", "acd", "Cannot pop d because d has no later copy, so push b", "acdb"],
        ["7", "c", "c:0", "acdb", "Skip c because it is already in the stack", "acdb"],
      ],
      narrativeMD: "The final stack is **acdb**. The important locked decision is keeping **d** before **b**, because **d** has no remaining copy when **b** arrives.",
    },
    interviewTipsMD:
      "Name both conditions in the while loop out loud: the top must be lexicographically larger, and it must appear again later. Many candidates remember the monotonic stack but forget the feasibility condition. A strong proof says that every pop improves the earliest possible character while preserving a later copy of the popped letter.",
    followUps: [
      "How would the algorithm change for the related problem Smallest Subsequence of Distinct Characters?",
      "What if the input alphabet is not limited to lowercase English letters?",
      "How would you return the largest lexicographic valid result instead?",
      "What if each character must appear at most twice rather than exactly once?",
    ],
    similarProblems: [
      { title: "Partition Labels", difficulty: "Medium", slug: "greedy-partition-labels", note: "Both rely on knowing whether a character appears later." },
      { title: "Reorganize String", difficulty: "Medium", slug: "greedy-reorganize-string", note: "Both use character counts to make a safe local choice." },
      { title: "Smallest Subsequence of Distinct Characters", difficulty: "Medium", url: "https://leetcode.com/problems/smallest-subsequence-of-distinct-characters/", note: "The same monotonic-stack problem under a different title." },
      { title: "Remove K Digits", difficulty: "Medium", url: "https://leetcode.com/problems/remove-k-digits/", note: "Another lexicographic minimisation problem solved by popping a monotonic stack." },
    ],
    keyTakeaways: [
      "Lexicographic minimisation is about improving the earliest possible position.",
      "A larger stack top can be removed only when a future copy preserves feasibility.",
      "The stack is monotonic only as far as the remaining-count constraint allows.",
      "Each character enters and leaves the stack at most once, giving a linear solution.",
    ],
    pattern:
      "Lexicographic greedy stack: scan left to right, pop larger previous choices only when they can be restored later, then push the smallest feasible prefix character.",
  },
  {
    kind: "problem",
    slug: "greedy-reorganize-string",
    moduleId: "greedy-string",
    order: 21,
    title: "Reorganize String",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/reorganize-string/",
    tags: ["Greedy", "String", "Counting", "Heap", "Construction"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "Given a lowercase string **s**, rearrange its characters so that no two adjacent characters are the same. Return any valid rearrangement, or return an empty string if no such rearrangement exists.",
    constraints: [
      "1 <= s.length <= 500",
      "s consists of lowercase English letters",
    ],
    inputMD: "A lowercase string **s**.",
    outputMD: "Any rearranged string with no equal adjacent characters, or an empty string when no valid rearrangement exists.",
    examples: [
      { input: "s = aab", output: "aba", explanation: "The two a characters are separated by b, so no adjacent characters match." },
      { input: "s = aaab", output: "empty string", explanation: "The character a appears 3 times in a string of length 4, but only 2 separated slots are available, so a valid arrangement is impossible." },
      { input: "s = aaabbc", output: "ababac", explanation: "One valid construction places the most frequent character a in even positions first, then fills the remaining gaps with b and c." },
    ],
    learningObjectives: [
      "Detect the frequency threshold that makes adjacent separation impossible.",
      "Use the most frequent character as the limiting resource in a constructive greedy proof.",
      "Implement the count and even-then-odd placement technique in linear time.",
      "Relate the array-fill construction to the max-heap strategy of always choosing a different most frequent character.",
    ],
    intuitionMD:
      "**Greedy Insight:** The only way to fail is for one character to be too frequent to separate from itself. In a string of length **n**, a character can occupy at most **ceil(n / 2)** non-adjacent slots. If the maximum count is larger, return an empty string.\n\nWhen the maximum count is feasible, place that most frequent character into even indices first: **0, 2, 4, ...**. This spreads the hardest character as far apart as possible. Then fill the remaining even slots and odd slots with the other characters. This count-and-fill construction is the array version of always choosing a most frequent remaining character that differs from the previous one.",
    commonMistakes: [
      "Checking the impossibility condition as **maxCount > n / 2**, which rejects valid odd-length cases like aaabb.",
      "Filling positions from left to right without separating the most frequent character first.",
      "Returning a sorted string, which clusters identical letters and often violates adjacency.",
      "Forgetting that any valid rearrangement is acceptable, not necessarily the lexicographically smallest one.",
    ],
    algorithmMD:
      "**Greedy strategy**\nCount character frequencies. If the largest frequency exceeds **(n + 1) / 2**, no arrangement can separate that character. Otherwise, place the most frequent character at even indices first, then place all remaining characters into the next available even indices and finally odd indices.\n\n**Why it works**\nEven indices are mutually non-adjacent. They provide exactly **ceil(n / 2)** slots, the maximum number of copies any one character can safely occupy. By assigning the most constrained character to those separated slots first, the rest of the characters can fill gaps without forcing equal neighbours.\n\n**Proof of correctness**\nIf **maxCount > ceil(n / 2)**, pigeonhole principle proves impossibility: more copies exist than non-adjacent slots. Otherwise, consider any valid arrangement. The most frequent character can be exchanged into the even slots used by the greedy construction because those slots are pairwise separated and there are enough of them. This exchange does not create equal adjacent copies of that character. After those placements, every remaining empty slot is adjacent only to separated maximum-character slots or to positions filled later by lower-frequency characters. Filling the remaining characters in count order preserves feasibility because no remaining character has more copies than the gaps can absorb. Thus the greedy construction produces a valid arrangement whenever one exists.\n\n**Algorithm**\n1. Count all characters and find the character with maximum frequency.\n2. If the maximum frequency is greater than **(n + 1) / 2**, return an empty string.\n3. Create a result character array of length **n**.\n4. Place all copies of the maximum-frequency character at indices **0, 2, 4, ...**.\n5. For every other character, continue placing copies at the current index, jumping by **2** each time.\n6. When the index passes the end of the array, reset it to **1** and continue filling odd positions.\n7. Return the completed string.",
    solutions: [
      {
        name: "Count and fill even then odd positions",
        approachMD:
          "The most frequent character is the bottleneck. Place it first into the separated even positions, then fill all remaining positions with the other characters. The feasibility check guarantees the first character fits without adjacency and the remaining characters can occupy the gaps.",
        walkthroughMD:
          "1. Count the 26 lowercase characters and identify the character with the largest count.\n2. If that count exceeds **(n + 1) / 2**, return an empty string because separation is impossible.\n3. Fill a result array by placing the most frequent character at index **0**, then **2**, then **4**, and so on.\n4. Set that character's remaining count to **0**.\n5. Place every other character using the same step of **2**. When the index moves past the end, wrap to index **1**.\n6. Convert the filled character array to a string.",
        complexity: { time: "O(n)", space: "O(n)", note: "Counting uses 26 entries and the result array stores the rearranged string." },
        filename: "Solution.java",
        code: `class Solution {

    public String reorganizeString(String s) {
        int n = s.length();
        int[] counts = new int[26];

        for (int index = 0; index < n; index++) {
            counts[s.charAt(index) - 'a']++;
        }

        int maxIndex = 0;
        for (int index = 1; index < 26; index++) {
            if (counts[index] > counts[maxIndex]) {
                maxIndex = index;
            }
        }

        if (counts[maxIndex] > (n + 1) / 2) {
            return "";
        }

        char[] result = new char[n];
        int position = 0;

        while (counts[maxIndex] > 0) {
            result[position] = (char) ('a' + maxIndex);
            position += 2;
            counts[maxIndex]--;
        }

        for (int character = 0; character < 26; character++) {
            while (counts[character] > 0) {
                if (position >= n) {
                    position = 1;
                }
                result[position] = (char) ('a' + character);
                position += 2;
                counts[character]--;
            }
        }

        return new String(result);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = aaabbc. Counts are **a:3**, **b:2**, and **c:1**. Since **3 <= (6 + 1) / 2**, a valid rearrangement exists.",
      columns: ["phase", "char", "count before", "positions filled", "next index", "partial result"],
      rows: [
        ["feasibility", "a", "3", "Maximum count fits in separated slots", "0", "......"],
        ["place maximum", "a", "3", "0, 2, 4", "1", "a.a.a."],
        ["fill remaining", "b", "2", "1, 3", "5", "ababa."],
        ["fill remaining", "c", "1", "5", "7", "ababac"],
      ],
      narrativeMD: "The final arrangement **ababac** has no equal adjacent characters. The key move was placing all three **a** characters into non-adjacent even slots before filling the gaps.",
    },
    interviewTipsMD:
      "Lead with the impossibility condition: no character may appear more than **ceil(n / 2)** times. Then choose one implementation strategy. The even-odd fill is compact for lowercase strings; the max-heap version is more general and repeatedly chooses the most frequent character that is not equal to the previous output character.",
    followUps: [
      "How would you implement the same greedy idea with a max heap?",
      "What changes if the alphabet is large or not known in advance?",
      "How would you rearrange so identical characters are at least distance **k** apart?",
      "Can you produce the lexicographically smallest valid rearrangement among all valid answers?",
    ],
    similarProblems: [
      { title: "Task Scheduler", difficulty: "Medium", slug: "greedy-task-scheduler", note: "Uses the same maximum-frequency bottleneck idea with cooldown slots." },
      { title: "Remove Duplicate Letters", difficulty: "Medium", slug: "greedy-remove-duplicate-letters", note: "Another string greedy where counts determine whether a local choice is safe." },
      { title: "Partition Labels", difficulty: "Medium", slug: "greedy-partition-labels", note: "Also uses character metadata to make one-pass greedy decisions." },
      { title: "Distant Barcodes", difficulty: "Medium", url: "https://leetcode.com/problems/distant-barcodes/", note: "The same rearrangement pattern applied to integer values." },
      { title: "Rearrange String k Distance Apart", difficulty: "Hard", url: "https://leetcode.com/problems/rearrange-string-k-distance-apart/", note: "Generalises adjacent separation to a cooldown distance." },
    ],
    keyTakeaways: [
      "The maximum frequency controls whether reorganisation is possible.",
      "Even indices provide the largest set of mutually non-adjacent slots.",
      "Place the hardest character first, then fill the remaining gaps.",
      "The heap approach and the even-odd fill are two views of the same greedy principle: avoid using the previous character while consuming high counts early.",
    ],
    pattern:
      "Frequency-constrained construction: verify the most frequent item fits into separated slots, place it first, then fill the remaining gaps without creating adjacent duplicates.",
  },
];
