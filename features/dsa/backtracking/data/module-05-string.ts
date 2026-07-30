import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "bt-letter-combinations-of-a-phone-number",
    moduleId: "bt-string",
    order: 17,
    title: "Letter Combinations of a Phone Number",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    tags: ["Backtracking", "String", "Recursion", "DFS", "Mapping"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 16,
    statementMD:
      "Given a string **digits** containing digits from **2** through **9**, return all possible letter combinations that the number could represent. Return the answer in any order. If **digits** is empty, return an empty list.",
    constraints: [
      "0 <= digits.length <= 4",
      "digits[i] is a digit from 2 through 9",
    ],
    inputMD: "A digit string **digits** where each character maps to letters on a phone keypad.",
    outputMD: "A list of strings containing every possible letter combination in any order.",
    examples: [
      {
        input: "digits = 23",
        output: "[ad,ae,af,bd,be,bf,cd,ce,cf]",
        explanation: "Digit **2** offers **a**, **b**, **c**, and digit **3** offers **d**, **e**, **f**. Pairing each first choice with each second choice creates 9 combinations.",
      },
      {
        input: "digits = empty string",
        output: "[]",
        explanation: "There are no digit positions to assign, so the expected LeetCode output is an empty list rather than a list containing an empty string.",
      },
      {
        input: "digits = 7",
        output: "[p,q,r,s]",
        explanation: "A single digit produces one-character combinations from its keypad letters.",
      },
    ],
    learningObjectives: [
      "Recognise digit expansion as a **map each position to several choices** backtracking problem.",
      "Carry the current digit index and the partially built string as recursion state.",
      "Use a digit-indexed **String[]** table so each frame can list its candidate letters directly.",
      "Explain why the output size dominates the runtime for combination generation.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is a map positions to choices problem. Every digit position must be assigned exactly one letter, and the choices for one position are independent of the choices for the other positions. That is a perfect backtracking tree: choose a letter for the current digit, recurse to the next digit, then unchoose so the next sibling letter can be tried.\n\nThe state is small: **index** tells which digit we are filling, and **path** stores the letters chosen so far. Once **index == digits.length**, the path has one letter for every digit and is a complete answer. The empty input is the only special case because the platform expects no combinations when there are no positions to fill.",
    commonMistakes: [
      "Returning a list containing an empty string for empty input instead of an empty list.",
      "Using nested loops hard-coded for two or three digits, which fails for variable length input.",
      "Converting digit characters incorrectly by forgetting to subtract **0** before indexing the keypad table.",
      "Appending to a shared builder without deleting the last character after the recursive call.",
    ],
    algorithmMD:
      "**State**\n\nEach recursion frame carries **index**, the next digit position to fill, and **path**, the letters chosen for earlier positions. The keypad mapping is a **String[]** table where the digit character converts to an integer index. The result stores completed copies of **path** when all positions are filled.\n\n**Recursion tree**\n\nFor **digits = 23**, the root is **index = 0** with an empty path. Digit **2** branches to **a**, **b**, and **c**. Under the **a** branch, digit **3** branches to **d**, **e**, and **f**, producing **ad**, **ae**, and **af** at the leaves. The **b** branch produces **bd**, **be**, **bf**, and the **c** branch produces **cd**, **ce**, **cf**. Each level corresponds to one digit position, and every root-to-leaf path is one output string.\n\n**Pruning**\n\nThere is no value-based pruning because every letter choice for a valid digit can lead to an answer. The structural pruning is the base case: stop exactly when **index == digits.length** and copy the current path. For empty input, return immediately before starting DFS so the result is **[]**.\n\n**Algorithm**\n\n1. Build a keypad table whose entries for digits **2** through **9** contain their letters.\n2. If **digits** is empty, return an empty result list.\n3. Start DFS at **index = 0** with an empty **StringBuilder** path.\n4. Read the letters for **digits[index]**.\n5. For each candidate letter, append it to **path** and recurse with **index + 1**.\n6. When the recursive call returns, delete the last character to unchoose that letter.\n7. When **index == digits.length**, add **path.toString()** to the result.",
    solutions: [
      {
        name: "Digit-index DFS with keypad table",
        approachMD:
          "Use a digit-indexed table to fetch the candidate letters in O(1). The DFS fills one position at a time, so the recursion depth equals the number of digits and each leaf contributes one output string.",
        walkthroughMD:
          "1. Create the result list and return it immediately for empty **digits**.\n2. Store keypad letters in a **String[]** table indexed by the numeric digit value.\n3. In the helper, if **index** has reached the input length, append the built string to the result.\n4. Otherwise, iterate through the letters for the current digit.\n5. Append one letter, recurse to the next digit, then delete that letter before trying the next candidate.",
        complexity: { time: "O(4^n * n)", space: "O(n)", note: "There are at most 4 choices per digit and copying each completed string costs up to n. Auxiliary recursion and builder space are O(n), excluding output." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {
    private static final String[] LETTERS = {
        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
    };

    public List<String> letterCombinations(String digits) {
        List<String> result = new ArrayList<>();
        if (digits.length() == 0) {
            return result;
        }

        backtrack(digits, 0, new StringBuilder(), result);
        return result;
    }

    private void backtrack(String digits, int index, StringBuilder path, List<String> result) {
        if (index == digits.length()) {
            result.add(path.toString());
            return;
        }

        int digit = digits.charAt(index) - '0';
        String letters = LETTERS[digit];
        for (int choice = 0; choice < letters.length(); choice++) {
            path.append(letters.charAt(choice));
            backtrack(digits, index + 1, path, result);
            path.deleteCharAt(path.length() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "digits = 23. Track the digit index, the letter choice, and the mutable path as DFS moves down and back up the tree.",
      columns: ["depth", "start", "choice", "path", "action"],
      rows: [
        ["0", "0", "digit 2 -> a", "a", "choose a and recurse to index 1"],
        ["1", "1", "digit 3 -> d", "ad", "choose d, next index reaches the base case"],
        ["2", "2", "complete", "ad", "copy ad to result"],
        ["1", "1", "unchoose d, choose e", "ae", "copy ae after the base case"],
        ["1", "1", "unchoose e, choose f", "af", "copy af after the base case"],
        ["0", "0", "unchoose a, choose b", "b", "explore the b branch against digit 3"],
        ["1", "1", "digit 3 -> d", "bd", "copy bd after the base case"],
        ["0", "0", "unchoose b, choose c", "c", "explore the c branch against digit 3"],
        ["1", "1", "digit 3 -> f", "cf", "last leaf in this sample branch"],
      ],
      narrativeMD: "The full DFS produces 3 branches for digit **2** and 3 branches under each of them for digit **3**, giving **3 * 3 = 9** combinations.",
    },
    interviewTipsMD:
      "Lead with the position-to-choices model: one digit position is filled per recursion level. Mention that a **StringBuilder** avoids creating a new string at every internal node, but completed answers still must be copied into result strings. Be explicit about the empty input behavior because it is a common edge case in this problem.",
    followUps: [
      "How would the solution change if digits **0** and **1** had custom letter mappings?",
      "How would you stream combinations one at a time instead of storing them all?",
      "How would you count combinations without materializing the strings?",
      "How would you support a keypad where each digit has a variable number of letters loaded at runtime?",
    ],
    similarProblems: [
      { title: "Palindrome Partitioning", difficulty: "Medium", slug: "bt-palindrome-partitioning", note: "Also builds strings by choosing the next piece and recursing on the remainder." },
      { title: "Restore IP Addresses", difficulty: "Medium", slug: "bt-restore-ip-addresses", note: "Uses the same position advancement idea with stronger segment pruning." },
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "Another DFS that enumerates all choices at the current frame." },
      { title: "Generate Parentheses", difficulty: "Medium", url: "https://leetcode.com/problems/generate-parentheses/", note: "Another string-building DFS where each position has constrained choices." },
    ],
    keyTakeaways: [
      "When each input position maps to a small set of choices, use one recursion level per position.",
      "A keypad table keeps digit-to-letter lookup simple and avoids conditional chains.",
      "The base case records a string only after every digit has been assigned.",
      "The exponential runtime is unavoidable because the output itself is exponential.",
    ],
    pattern:
      "Map-position DFS: choose one candidate for the current position, recurse to the next position, then unchoose before trying the next candidate.",
  },
  {
    kind: "problem",
    slug: "bt-palindrome-partitioning",
    moduleId: "bt-string",
    order: 18,
    title: "Palindrome Partitioning",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/palindrome-partitioning/",
    tags: ["Backtracking", "String", "Partitioning", "Palindrome", "DFS", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Adobe"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 22,
    statementMD:
      "Given a string **s**, partition **s** so that every substring in the partition is a palindrome. Return all possible palindrome partitionings of **s**.",
    constraints: [
      "1 <= s.length <= 16",
      "s contains only lowercase English letters",
    ],
    inputMD: "A lowercase string **s** that must be split into contiguous substrings.",
    outputMD: "A list of partitions, where each partition is a list of palindromic substrings whose concatenation equals **s**.",
    examples: [
      {
        input: "s = aab",
        output: "[[a,a,b],[aa,b]]",
        explanation: "Both **a | a | b** and **aa | b** use only palindrome pieces. The cut **a | ab** is rejected because **ab** is not a palindrome.",
      },
      {
        input: "s = a",
        output: "[[a]]",
        explanation: "The whole one-character string is a palindrome, so there is exactly one partition.",
      },
      {
        input: "s = efe",
        output: "[[e,f,e],[efe]]",
        explanation: "Single characters are always palindromes, and the entire string **efe** is also a palindrome.",
      },
    ],
    learningObjectives: [
      "Recognise palindrome partitioning as a **choose a prefix cut, recurse on the suffix** problem.",
      "Use the current **start** index and current list of pieces as the recursion state.",
      "Prune immediately when a candidate prefix is not a palindrome.",
      "Compare on-demand palindrome checks with a precomputed palindrome table.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is the cut and partition string pattern. At any **start** index, the next decision is where to cut the next prefix: **s[start...end]**. If that prefix is a palindrome, it can be appended to the current partition and the rest of the problem is exactly the suffix starting at **end + 1**.\n\nThe key is to avoid thinking about all dot placements first. Backtracking naturally builds one valid piece at a time. Invalid prefixes are pruned before recursion, so every recursive call represents a path whose pieces are all palindromes so far. When **start == s.length**, every character has been consumed and the current path is one complete partition.",
    commonMistakes: [
      "Recursing on non-palindrome prefixes and filtering only at the end, which creates unnecessary branches.",
      "Recording the mutable path directly instead of adding a copy to the result.",
      "Using **substring(start, end)** as if the end index were inclusive in Java.",
      "Stopping after finding the first valid partition even though the problem asks for all partitions.",
    ],
    algorithmMD:
      "**State**\n\nEach frame carries **start**, the first unpartitioned index, and **path**, the palindrome pieces selected so far. A candidate choice is an inclusive cut **end** from **start** to the final index. Choosing the prefix **s[start...end]** moves the next frame to **end + 1**.\n\n**Recursion tree**\n\nFor **s = aab**, the root starts at index 0. The cut **a** is a palindrome, so the path becomes **[a]** and recursion starts at index 1. From there, cut **a** is valid, then cut **b** is valid, recording **[a,a,b]**. Still under **[a]**, the cut **ab** is not a palindrome and is pruned. Back at the root, cut **aa** is valid, then **b** completes **[aa,b]**. The root cut **aab** is not a palindrome and is pruned.\n\n**Pruning**\n\nThe main pruning rule is the palindrome test: if **s[start...end]** is not a palindrome, skip that cut and do not recurse. A precomputed palindrome table can make this check O(1), but the search tree is the same. Single-character prefixes always pass, which guarantees progress.\n\n**Algorithm**\n\n1. Create an empty result list and an empty **path**.\n2. Start DFS with **start = 0**.\n3. If **start == s.length**, copy **path** into the result.\n4. For every **end** from **start** through the last index, test whether **s[start...end]** is a palindrome.\n5. If it is not a palindrome, continue to the next cut.\n6. Choose the prefix by appending it to **path**, then recurse from **end + 1**.\n7. Unchoose by removing the last piece before trying the next cut.",
    solutions: [      {
        name: "Backtracking with on-demand palindrome checks",
        approachMD:
          "Try every possible next cut, but recurse only when the chosen prefix is a palindrome. This is the cleanest interview implementation because the palindrome check is local and the recursion mirrors the definition of a valid partition.",
        walkthroughMD:
          "1. Start from index **0** with an empty path.\n2. In each frame, scan all end positions for the next prefix.\n3. Use a two-pointer check to reject non-palindrome prefixes immediately.\n4. Append each valid prefix, recurse on the suffix after it, and remove the prefix afterward.\n5. When the start index reaches the string length, copy the current path into the result.",
        complexity: { time: "O(n^2 * 2^n)", space: "O(n)", note: "There are exponentially many cut patterns, and each on-demand palindrome check can scan O(n) characters. Auxiliary recursion and path space are O(n), excluding output." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<List<String>> partition(String s) {
        List<List<String>> result = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(String s, int start, List<String> path, List<List<String>> result) {
        if (start == s.length()) {
            result.add(new ArrayList<>(path));
            return;
        }

        for (int end = start; end < s.length(); end++) {
            if (!isPalindrome(s, start, end)) {
                continue;
            }

            path.add(s.substring(start, end + 1));
            backtrack(s, end + 1, path, result);
            path.remove(path.size() - 1);
        }
    }

    private boolean isPalindrome(String s, int left, int right) {
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}`,
      },
      {
        name: "Backtracking with precomputed palindrome table",
        approachMD:
          "When the interviewer cares about repeated palindrome checks, precompute whether every substring is a palindrome. The DFS is unchanged, but each candidate prefix can be accepted or rejected in O(1).",
        walkthroughMD:
          "1. Build a boolean table where **palindrome[start][end]** says whether **s[start...end]** is a palindrome.\n2. Fill the table by increasing substring length so inner substrings are known first.\n3. Run the same start-index DFS as the on-demand version.\n4. For each cut, consult the table instead of scanning with two pointers.\n5. Copy the path when the start index reaches the end of the string.",
        complexity: { time: "O(n^2 + n * 2^n)", space: "O(n^2)", note: "The table costs O(n^2). DFS still has exponentially many outputs, and copying a completed partition can cost O(n)." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<List<String>> partition(String s) {
        boolean[][] palindrome = buildPalindromeTable(s);
        List<List<String>> result = new ArrayList<>();
        backtrack(s, 0, palindrome, new ArrayList<>(), result);
        return result;
    }

    private boolean[][] buildPalindromeTable(String s) {
        int n = s.length();
        boolean[][] palindrome = new boolean[n][n];

        for (int length = 1; length <= n; length++) {
            for (int start = 0; start + length <= n; start++) {
                int end = start + length - 1;
                boolean endsMatch = s.charAt(start) == s.charAt(end);
                boolean middleIsPalindrome = length <= 2 || palindrome[start + 1][end - 1];
                palindrome[start][end] = endsMatch && middleIsPalindrome;
            }
        }

        return palindrome;
    }

    private void backtrack(String s, int start, boolean[][] palindrome, List<String> path, List<List<String>> result) {
        if (start == s.length()) {
            result.add(new ArrayList<>(path));
            return;
        }

        for (int end = start; end < s.length(); end++) {
            if (!palindrome[start][end]) {
                continue;
            }

            path.add(s.substring(start, end + 1));
            backtrack(s, end + 1, palindrome, path, result);
            path.remove(path.size() - 1);
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = aab. Track each candidate cut from the current start index and whether it becomes part of the current partition.",
      columns: ["depth", "start", "choice", "path", "action"],
      rows: [
        ["0", "0", "a", "[a]", "palindrome prefix, recurse from 1"],
        ["1", "1", "a", "[a,a]", "palindrome prefix, recurse from 2"],
        ["2", "2", "b", "[a,a,b]", "start reaches 3 after this, record partition"],
        ["1", "1", "ab", "[a]", "not a palindrome, prune"],
        ["0", "0", "aa", "[aa]", "palindrome prefix, recurse from 2"],
        ["1", "2", "b", "[aa,b]", "start reaches 3 after this, record partition"],
        ["0", "0", "aab", "[]", "not a palindrome, prune"],
      ],
      narrativeMD: "Only two root-to-leaf paths survive the palindrome pruning: **[a,a,b]** and **[aa,b]**.",
    },
    interviewTipsMD:
      "Explain the problem as choosing the next cut, not as rearranging characters. Then the invariant is simple: every piece already in **path** is a palindrome. Start with the on-demand palindrome check unless the interviewer asks about repeated work; then offer the O(1) lookup table as a clean optimization.",
    followUps: [
      "How would you return only the minimum number of cuts needed to partition the string into palindromes?",
      "How would you count the partitions without storing every partition?",
      "How would the solution change if palindrome checks were case-insensitive?",
      "How would you stream partitions lazily for a very large output?",
    ],
    similarProblems: [
      { title: "Restore IP Addresses", difficulty: "Medium", slug: "bt-restore-ip-addresses", note: "Also chooses the next string segment and recurses on the remaining suffix." },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "bt-letter-combinations-of-a-phone-number", note: "Another string DFS where each level commits one piece of the output." },
      { title: "Combination Sum", difficulty: "Medium", slug: "bt-combination-sum", note: "Shares the choose, recurse, unchoose structure with pruning." },
      { title: "Palindrome Partitioning II", difficulty: "Hard", url: "https://leetcode.com/problems/palindrome-partitioning-ii/", note: "Turns the same palindrome cuts into a minimum-cut dynamic programming problem." },
    ],
    keyTakeaways: [
      "String partitioning backtracking chooses a prefix and recurses on the suffix.",
      "The palindrome check is the pruning gate that prevents invalid branches from entering DFS.",
      "Copy the path only when the start index has consumed the entire string.",
      "Precomputing palindrome truth trades O(n^2) memory for faster repeated cut checks.",
    ],
    pattern:
      "Cut-point DFS: from a start index, try every valid prefix, append it to the path, recurse on the suffix, and remove it before the next cut.",
  },
  {
    kind: "problem",
    slug: "bt-restore-ip-addresses",
    moduleId: "bt-string",
    order: 19,
    title: "Restore IP Addresses",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/restore-ip-addresses/",
    tags: ["Backtracking", "String", "Partitioning", "DFS", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "Given a string **s** containing only digits, return all possible valid IP addresses that can be formed by inserting exactly three dots. A valid IP address has exactly four integer segments, each segment is between **0** and **255**, and a segment cannot have leading zeroes unless it is exactly **0**.",
    constraints: [
      "1 <= s.length <= 20",
      "s consists of digits only",
    ],
    inputMD: "A digit string **s** with no dots already placed.",
    outputMD: "A list of valid IP address strings in any order.",
    examples: [
      {
        input: "s = 25525511135",
        output: "[255.255.11.135,255.255.111.35]",
        explanation: "Both addresses split the digits into four valid 0 through 255 segments with no leading zeroes.",
      },
      {
        input: "s = 0000",
        output: "[0.0.0.0]",
        explanation: "Each segment must be the single digit **0**. Longer segments such as **00** are rejected because of leading zeroes.",
      },
      {
        input: "s = 101023",
        output: "[1.0.10.23,1.0.102.3,10.1.0.23,10.10.2.3,101.0.2.3]",
        explanation: "The valid outputs are exactly the four-segment splits that consume all digits and obey the length, value, and leading-zero rules.",
      },
    ],
    learningObjectives: [
      "Recognise IP restoration as a constrained **choose a segment, recurse on the suffix** problem.",
      "Use segment count and start index as the recursion state.",
      "Prune by remaining length before trying segment values.",
      "Validate each segment with length, leading-zero, and numeric range checks.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is another cut and partition string problem, but the partition must have exactly four pieces. At each frame, choose the next segment length: 1, 2, or 3 digits. If that segment is valid, append it and recurse on the remaining suffix.\n\nThe constraints make pruning especially important. With **k** segments left, the remaining character count must be at least **k** and at most **3k**. A segment like **01** is invalid before numeric parsing because of the leading zero rule, and a segment like **256** is invalid because it exceeds 255. The base case succeeds only when exactly four segments have been chosen and the entire string has been consumed.",
    commonMistakes: [
      "Accepting segments with leading zeroes such as **01** or **00**.",
      "Recording an address after four segments even when some input digits remain unused.",
      "Trying segment lengths beyond three digits and then relying on numeric checks alone.",
      "Forgetting to remove the last chosen segment before trying the next sibling cut.",
    ],
    algorithmMD:
      "**State**\n\nEach frame carries **start**, the next unconsumed character index, and **segments**, the list of chosen IP pieces so far. The number of remaining segments is **4 - segments.size()**. A valid branch must eventually consume every character exactly once.\n\n**Recursion tree**\n\nFor **s = 101023**, the root may choose **1**, **10**, or **101** as the first segment. Under first segment **1**, the next character is **0**, so the only valid second segment starting there is **0**; candidates **01** and **010** are pruned by the leading-zero rule. From **[1,0]**, choices **1**, **10**, and **102** lead to different suffixes. The branch **[1,0,10,23]** consumes the string and records **1.0.10.23**, while a branch such as **[1,0,1,0]** has characters left after four segments and is rejected.\n\n**Pruning**\n\nBefore trying a segment, compare the remaining characters with the remaining segment slots. If there are too few characters to give every slot one digit, or too many characters to fit into three digits per slot, return immediately. For each candidate segment, reject lengths greater than 3, multi-character segments starting with **0**, and numeric values above **255**.\n\n**Algorithm**\n\n1. Start DFS with **start = 0** and an empty segment list.\n2. Compute remaining characters and remaining segment slots; return if the length bounds cannot be satisfied.\n3. If four segments have been chosen, record an address only when **start == s.length**.\n4. Try segment lengths **1**, **2**, and **3** while staying inside the string.\n5. Reject a segment if it has a leading zero or if **Integer.parseInt** gives a value above **255**.\n6. Append the valid segment, recurse from the next start index, then remove it.\n7. Build an address from four segments by joining them with the plain **.** character.",
    solutions: [      {
        name: "Four-segment DFS with validity pruning",
        approachMD:
          "The DFS places one IP segment at a time. Because an IP address always has four segments and each segment has length 1 through 3, the branching factor is tiny; correctness comes from strict pruning of invalid segment shapes and from accepting only branches that consume the whole string.",
        walkthroughMD:
          "1. Track the current index and the list of chosen segments.\n2. Use remaining-character bounds to stop branches that cannot possibly fill the remaining slots.\n3. If four segments are chosen, add an address only when the index is at the end of the string.\n4. Try segment lengths from **1** through **3**.\n5. Validate leading zeroes and the numeric value **0 <= value <= 255**.\n6. Choose the segment, recurse, and unchoose it before trying the next length.",
        complexity: { time: "O(3^4)", space: "O(1)", note: "There are at most 3 length choices for each of 4 segments. Auxiliary space is constant because recursion depth and path size are bounded by 4, excluding output." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<String> restoreIpAddresses(String s) {
        List<String> result = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(String s, int start, List<String> segments, List<String> result) {
        int remainingChars = s.length() - start;
        int remainingSegments = 4 - segments.size();
        if (remainingChars < remainingSegments || remainingChars > remainingSegments * 3) {
            return;
        }

        if (segments.size() == 4) {
            if (start == s.length()) {
                result.add(buildAddress(segments));
            }
            return;
        }

        for (int length = 1; length <= 3 && start + length <= s.length(); length++) {
            String segment = s.substring(start, start + length);
            if (!isValid(segment)) {
                continue;
            }

            segments.add(segment);
            backtrack(s, start + length, segments, result);
            segments.remove(segments.size() - 1);
        }
    }

    private boolean isValid(String segment) {
        if (segment.length() > 1 && segment.charAt(0) == '0') {
            return false;
        }
        int value = Integer.parseInt(segment);
        return value <= 255;
    }

    private String buildAddress(List<String> segments) {
        StringBuilder builder = new StringBuilder();
        for (int index = 0; index < segments.size(); index++) {
            if (index > 0) {
                builder.append('.');
            }
            builder.append(segments.get(index));
        }
        return builder.toString();
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = 101023. Track segment choices, leading-zero pruning, and the requirement that four segments must consume the whole string.",
      columns: ["depth", "start", "segment", "path", "action"],
      rows: [
        ["0", "0", "1", "[1]", "valid first segment, recurse from 1"],
        ["1", "1", "0", "[1,0]", "single zero is allowed, recurse from 2"],
        ["2", "2", "1", "[1,0,1]", "valid third segment, recurse from 3"],
        ["3", "3", "0", "[1,0,1,0]", "four segments chosen but characters remain, prune"],
        ["3", "3", "02", "[1,0,1]", "leading zero, prune"],
        ["2", "2", "10", "[1,0,10]", "valid third segment, recurse from 4"],
        ["3", "4", "23", "[1,0,10,23]", "consumed whole string, record 1.0.10.23"],
        ["2", "2", "102", "[1,0,102]", "valid third segment, recurse from 5"],
        ["3", "5", "3", "[1,0,102,3]", "consumed whole string, record 1.0.102.3"],
        ["1", "1", "01", "[1]", "leading zero, prune sibling segment"],
        ["0", "0", "10", "[10]", "valid first segment, explore another branch"],
        ["0", "0", "101", "[101]", "valid first segment, explore another branch"],
      ],
      narrativeMD: "The DFS records only branches with four valid segments and no leftover characters. Leading-zero pruning removes many tempting but invalid cuts after a **0** digit.",
    },
    interviewTipsMD:
      "Name all three validity rules before coding: length at most three, numeric value at most **255**, and no leading zero unless the segment is exactly **0**. Then add the remaining-length bound because it demonstrates pruning maturity and prevents exploring branches that cannot fill exactly four segments.",
    followUps: [
      "How would you adapt the method for IPv6-style groups with hexadecimal characters?",
      "How would you return only the count of valid addresses?",
      "How would the pruning change if the number of required segments were a parameter?",
      "How would you validate a string that already contains dots instead of inserting them?",
    ],
    similarProblems: [
      { title: "Palindrome Partitioning", difficulty: "Medium", slug: "bt-palindrome-partitioning", note: "Also chooses a valid prefix segment and recurses on the remaining suffix." },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", slug: "bt-letter-combinations-of-a-phone-number", note: "Another bounded-depth string generation problem." },
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "Shares fixed-depth selection with choose, recurse, and unchoose steps." },
      { title: "Split String Into Descending Consecutive Values", difficulty: "Medium", slug: "bt-split-string-into-descending-consecutive-values", note: "An advanced string-splitting problem with numeric validation and pruning." },
      { title: "Expression Add Operators", difficulty: "Hard", url: "https://leetcode.com/problems/expression-add-operators/", note: "Also cuts a digit string into numeric pieces before applying extra constraints." },
    ],
    keyTakeaways: [
      "Restore IP Addresses is fixed-depth string partitioning with aggressive validity pruning.",
      "The base case requires both four segments and full input consumption.",
      "Leading zeroes must be rejected before accepting a multi-character segment.",
      "Remaining-length bounds are a simple way to cut impossible branches early.",
    ],
    pattern:
      "Constrained segment DFS: choose a short valid prefix, recurse on the suffix with one fewer slot, and accept only when all slots are filled and the input is consumed.",
  },
];