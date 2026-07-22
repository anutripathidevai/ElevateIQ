import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "bt-expression-add-operators",
    moduleId: "bt-advanced",
    order: 23,
    title: "Expression Add Operators",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/expression-add-operators/",
    tags: ["Backtracking", "DFS", "String", "Expression Evaluation", "Pruning"],
    companies: ["Google", "Meta", "Amazon", "Microsoft", "Uber", "Bloomberg"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 35,
    statementMD:
      "Given a string **num** that contains only digits and an integer **target**, return all strings that can be formed by inserting addition, subtraction, or multiplication operators between some digits so the expression evaluates to **target**. You may also choose not to insert an operator between adjacent digits, which extends the current number. Operands cannot have leading zeroes unless the operand is exactly **0**.",
    constraints: [
      "1 <= num.length <= 10",
      "num consists only of digits",
      "-2^31 <= target <= 2^31 - 1",
      "The answer expressions may be returned in any order",
    ],
    inputMD: "A digit string **num** and an integer **target**.",
    outputMD: "A list of valid expression strings whose evaluated value equals **target**.",
    examples: [
      { input: "num = 123, target = 6", output: "[1+2+3, 1*2*3]", explanation: "Both expressions consume every digit in order and evaluate to 6." },
      { input: "num = 232, target = 8", output: "[2*3+2, 2+3*2]", explanation: "Multiplication has precedence, so both listed expressions evaluate to 8." },
      { input: "num = 105, target = 5", output: "[1*0+5, 10-5]", explanation: "The split **1,0,5** can use multiplication and addition, while **10,5** can use subtraction. The operand **05** is not allowed." },
    ],
    learningObjectives: [
      "Recognise expression generation as a wide ordered decision tree over digit gaps.",
      "Track the evaluated prefix without reparsing the whole expression at every leaf.",
      "Use the previous operand to repair multiplication precedence after a prior addition or subtraction.",
      "Prune invalid operands with leading zeroes and compute with **long** values to avoid intermediate overflow.",
    ],
    intuitionMD:
      "Pattern Recognition + Intuition\n\nThis is backtracking because every gap between digits asks the same question: insert addition, subtraction, multiplication, or insert nothing and keep growing the current operand. The choices are ordered and every final expression must preserve the original digit order, so a recursion tree naturally enumerates all candidates. Naive search explodes because each gap can branch several ways, and then each leaf would need expression evaluation.\n\nThe interview trick is to evaluate as you build. Addition and subtraction are easy: append the operand to the running **value**. Multiplication is harder because it has higher precedence than the operator that came before it. Carry **previousOperand**, the signed operand that was most recently added into **value**. When choosing multiplication by **current**, replace that previous contribution with the product: **value - previousOperand + previousOperand * current**. For **1+2*3**, the prefix **1+2** has **value = 3** and **previousOperand = 2**. Multiplying by 3 changes the value to **3 - 2 + 2 * 3 = 7**, which matches normal precedence without reparsing the expression.",
    commonMistakes: [
      "Evaluating the expression left to right and getting multiplication precedence wrong.",
      "Forgetting that **previousOperand** must be signed, so a subtraction stores the operand as negative.",
      "Allowing operands like **05**, which creates duplicate and invalid interpretations.",
      "Using **int** for intermediate values even though multiplication can exceed the target range during search.",
    ],
    algorithmMD:
      "**State**\n\nEach recursion frame carries **index**, the next digit to consume; **expression**, the characters chosen so far; **value**, the evaluated value of the expression prefix; and **previousOperand**, the signed final operand currently included in **value**. From **index**, choose a substring **num[index...end]** as the next operand, unless it has a leading zero.\n\n**Recursion tree**\n\nFor **num = 123**, the first level chooses **1**, **12**, or **123** as the first operand. From **1**, the next operand can be **2** or **23**. If it chooses **2**, the operator branches create **1+2**, **1-2**, and **1*2**. From **1+2**, choosing **3** makes **1+2+3**, **1+2-3**, and **1+2*3**. The multiplication branch does not use the visible left-to-right value 3 then multiply by 3; it rewrites the last contribution so the value becomes **1 + 2 * 3**. For **num = 105**, after choosing **1**, the substring **05** is pruned because an operand cannot start with zero.\n\n**Pruning**\n\nSkip any candidate number whose first digit is **0** and whose length is greater than one. Use **long** for **value**, **previousOperand**, and **current** so multiplication does not overflow ordinary integer arithmetic. Stop only at leaves: a candidate is valid when all digits are consumed and **value == target**. Non-leaf prefixes are not rejected merely because they are far from the target, since later subtraction or multiplication can change the value sharply.\n\n**Algorithm**\n\n1. Start DFS at **index = 0** with an empty expression, **value = 0**, and **previousOperand = 0**.\n2. At each frame, extend **end** from **index** to the end of the string to choose the next operand substring.\n3. Break the operand loop if the substring would have a leading zero.\n4. If this is the first operand, append it without an operator and recurse.\n5. Otherwise choose addition, recurse with **value + current** and **previousOperand = current**, then undo the expression.\n6. Choose subtraction, recurse with **value - current** and **previousOperand = -current**, then undo.\n7. Choose multiplication, recurse with **value - previousOperand + previousOperand * current** and **previousOperand * current**, then undo.\n8. When **index** reaches the end, add the expression only if the evaluated value equals **target**.",
    solutions: [
      {
        name: "DFS with previous operand rollback",
        approachMD:
          "Build the expression left to right and carry enough evaluation state to avoid reparsing it. The running **value** represents the expression after applying normal precedence for the prefix. The signed **previousOperand** is the last additive contribution. Multiplication removes that contribution and replaces it with the product, which handles precedence in constant time per choice.",
        walkthroughMD:
          "1. Use a **StringBuilder** so each branch can append an operator and operand, recurse, then restore the previous length.\n2. Loop over every possible next operand substring starting at the current index.\n3. Stop the loop when a multi-digit operand would start with **0**.\n4. For the first operand, append only the number and seed both **value** and **previousOperand**.\n5. For later operands, try addition, subtraction, and multiplication with the correct value updates.\n6. At the end of the digit string, record the expression if the accumulated value equals the target.",
        complexity: { time: "O(4^n * n)", space: "O(n)", note: "There are roughly four decisions per gap when counting concatenation and the three operators. Copying a successful expression costs up to n characters, while recursion depth and the builder length are linear." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public List<String> addOperators(String num, int target) {
        List<String> result = new ArrayList<>();
        StringBuilder expression = new StringBuilder();
        backtrack(num, target, 0, 0, 0, expression, result);
        return result;
    }

    private void backtrack(String num, long target, int index, long value, long previousOperand, StringBuilder expression, List<String> result) {
        if (index == num.length()) {
            if (value == target) {
                result.add(expression.toString());
            }
            return;
        }

        int lengthBeforeChoice = expression.length();
        for (int end = index; end < num.length(); end++) {
            if (end > index && num.charAt(index) == '0') {
                break;
            }

            long current = Long.parseLong(num.substring(index, end + 1));
            if (index == 0) {
                expression.append(current);
                backtrack(num, target, end + 1, current, current, expression, result);
                expression.setLength(lengthBeforeChoice);
            } else {
                expression.append('+').append(current);
                backtrack(num, target, end + 1, value + current, current, expression, result);
                expression.setLength(lengthBeforeChoice);

                expression.append('-').append(current);
                backtrack(num, target, end + 1, value - current, -current, expression, result);
                expression.setLength(lengthBeforeChoice);

                expression.append('*').append(current);
                long multiplied = previousOperand * current;
                backtrack(num, target, end + 1, value - previousOperand + multiplied, multiplied, expression, result);
                expression.setLength(lengthBeforeChoice);
            }
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "num = 105, target = 5. Track the running value and signed previous operand while important branches are explored.",
      columns: ["step", "index", "choice", "expression", "value", "previous operand", "result"],
      rows: [
        ["1", "0", "start with 1", "1", "1", "1", "continue"],
        ["2", "1", "operator + and number 0", "1+0", "1", "0", "continue"],
        ["3", "2", "operator + and number 5", "1+0+5", "6", "5", "leaf fails target 5"],
        ["4", "2", "operator * and number 5", "1+0*5", "1", "0", "leaf fails target 5"],
        ["5", "1", "operator * and number 0", "1*0", "0", "0", "continue"],
        ["6", "2", "operator + and number 5", "1*0+5", "5", "5", "leaf succeeds"],
        ["7", "0", "start with 10", "10", "10", "10", "continue"],
        ["8", "2", "operator - and number 5", "10-5", "5", "-5", "leaf succeeds"],
        ["9", "1", "try number 05", "blocked", "n/a", "n/a", "leading zero prune"],
      ],
      narrativeMD: "The valid expressions are **1*0+5** and **10-5**. The branch containing **05** is never explored, and multiplication uses the previous-operand rollback rather than a separate evaluator.",
    },
    interviewTipsMD:
      "Spend most of your explanation on multiplication. Say that **value** already includes the last operand, so multiplication must remove it and add the product. Also make the leading-zero rule explicit before coding; it is the most common source of extra invalid answers. Avoid target-based pruning unless you can prove it, because subtraction and multiplication can reverse apparent progress.",
    followUps: [
      "How would you add division while preserving integer truncation rules?",
      "How would you return only the count of expressions instead of the expressions themselves?",
      "How would you support parentheses as another choice in the expression tree?",
      "How would you avoid storing all answers if the output could be extremely large?",
    ],
    similarProblems: [
      { title: "Splitting a String Into Descending Consecutive Values", difficulty: "Medium", slug: "bt-split-string-into-descending-consecutive-values", note: "Also partitions a digit string and prunes with numeric constraints." },
      { title: "Restore IP Addresses", difficulty: "Medium", slug: "bt-restore-ip-addresses", note: "Another digit-string partitioning problem with strict validity pruning." },
      { title: "Palindrome Partitioning", difficulty: "Medium", slug: "bt-palindrome-partitioning", note: "Uses the same choose a cut, recurse, undo partition template." },
      { title: "Different Ways to Add Parentheses", difficulty: "Medium", url: "https://leetcode.com/problems/different-ways-to-add-parentheses/", note: "A related expression problem focused on grouping rather than operator insertion." },
    ],
    keyTakeaways: [
      "Expression generation is an ordered gap-decision tree over digits.",
      "Carry **value** and signed **previousOperand** to handle multiplication precedence online.",
      "Leading-zero operands are invalid except for the single digit **0**.",
      "Use **long** for intermediate arithmetic even when the target is an integer.",
    ],
    pattern:
      "For expression-building backtracking, choose the next operand substring, try each operator, carry an evaluated prefix plus the last signed operand, and undo the builder after each branch.",
  },
  {
    kind: "problem",
    slug: "bt-matchsticks-to-square",
    moduleId: "bt-advanced",
    order: 24,
    title: "Matchsticks to Square",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/matchsticks-to-square/",
    tags: ["Backtracking", "DFS", "Pruning", "Sorting", "Partitioning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "You are given an integer array **matchsticks**, where each value is the length of one matchstick. Use every matchstick exactly once to form a square. You cannot break sticks, but you may connect them end to end. Return **true** if the sticks can form four sides of equal length, otherwise return **false**.",
    constraints: [
      "1 <= matchsticks.length <= 15",
      "1 <= matchsticks[i] <= 10^8",
      "All matchsticks must be used exactly once",
    ],
    inputMD: "An integer array **matchsticks** containing the length of each stick.",
    outputMD: "A boolean indicating whether all sticks can be partitioned into four groups with the same sum.",
    examples: [
      { input: "matchsticks = [1,1,2,2,2]", output: "true", explanation: "The square side length is 2. The sides can be **[2]**, **[2]**, **[2]**, and **[1,1]**." },
      { input: "matchsticks = [3,3,3,3,4]", output: "false", explanation: "The total length is 16, so each side would need length 4, but the stick of length 4 cannot be combined with any 3 and the four 3s cannot each reach 4." },
      { input: "matchsticks = [5,5,5,5,4,4,4,4,3,3,3,3]", output: "true", explanation: "The total is 48, so each side is 12. Each side can use one 5, one 4, and one 3." },
    ],
    learningObjectives: [
      "Reframe square construction as partitioning all sticks into four equal-sum buckets.",
      "Sort larger sticks first so impossible placements fail early.",
      "Use bucket bounds and empty-bucket symmetry to prune equivalent branches.",
      "Explain why choose, recurse, and undo over buckets is complete despite aggressive pruning.",
    ],
    intuitionMD:
      "Pattern Recognition + Intuition\n\nThis is a constrained partitioning backtracking problem. Every matchstick must be assigned to exactly one of four side buckets, and every bucket must end at **total / 4**. The naive tree tries four buckets for every stick, which is **4^n** branches before pruning. The whole game is making bad assignments fail immediately.\n\nTwo observations make the search interview-ready. First, if **total % 4 != 0**, no square exists. Second, placing longer sticks first creates stronger failures: a long stick that does not fit a side will be rejected before many small sticks create noisy partial sums. The buckets themselves are interchangeable, so trying the same stick in a second empty bucket after it failed in the first empty bucket is symmetric and cannot reveal a new solution.",
    commonMistakes: [
      "Checking only whether the total is divisible by four and forgetting that every stick must be assigned.",
      "Processing sticks in arbitrary order, which leaves the largest conflicts until the recursion tree is already huge.",
      "Trying all empty sides even though empty buckets are indistinguishable.",
      "Forgetting to subtract a stick from a bucket when backtracking returns false.",
    ],
    algorithmMD:
      "**State**\n\nEach frame chooses which sorted stick to place next. The state contains **index**, the current stick position, **sides**, an array of four partial side sums, and **sideLength**, the required target for every bucket. The invariant is that all sticks after **index** have already been placed and no side exceeds **sideLength**.\n\n**Recursion tree**\n\nFor **[1,1,2,2,2]**, sort descending conceptually as **2,2,2,1,1**. Place the first 2 into side 0. The next 2 cannot go into side 0 because it would exceed 2, so it goes into side 1. The third 2 similarly goes into side 2. The first 1 cannot fit sides 0, 1, or 2, so it goes into side 3. The final 1 completes side 3. If an early placement puts a stick into an empty side and the recursive search fails, trying the same stick in another empty side would only rename the sides, so that branch is skipped.\n\n**Pruning**\n\nReturn **false** immediately when the total length is not divisible by four or the largest stick is longer than the side length. During DFS, skip any bucket where **sides[bucket] + stick > sideLength**. Place longer sticks first to make this bound useful. After trying a stick in an empty bucket and failing, break out of the bucket loop because all other empty buckets are equivalent.\n\n**Algorithm**\n\n1. Sum all matchsticks and return **false** if the total is not divisible by four.\n2. Compute **sideLength = total / 4**.\n3. Sort the sticks and process them from largest to smallest.\n4. If the largest stick is greater than **sideLength**, return **false**.\n5. For the current stick, try each of the four side buckets.\n6. Skip a bucket if the stick would make that side exceed **sideLength**.\n7. Choose the bucket by adding the stick, recurse to the next stick, then unchoose by subtracting it.\n8. If the recursive call succeeds, return **true** immediately.\n9. If the bucket was empty before this failed placement, break to avoid symmetric empty-bucket trials.\n10. When all sticks are placed, return **true** because the total and bucket bounds force all four sides to equal **sideLength**.",
    solutions: [
      {
        name: "Descending bucket DFS with symmetry pruning",
        approachMD:
          "Assign one stick at a time to one of four side buckets. Sorting makes the largest sticks constrain the search first. The capacity check prevents impossible partial sides, and the empty-bucket symmetry break removes equivalent permutations of the same square sides.",
        walkthroughMD:
          "1. Compute the total length and reject totals that are not divisible by four.\n2. Sort the array and process from the largest value down to the smallest.\n3. Keep four side sums. For each stick, try placing it into each side that has enough remaining capacity.\n4. Recurse after a placement, then subtract the stick if that branch fails.\n5. If the failed placement was into an empty side, stop trying other empty sides because they are indistinguishable.\n6. Return **true** when every stick has been placed.",
        complexity: { time: "O(4^n)", space: "O(n)", note: "The worst case still branches into four buckets per stick, but sorting, capacity checks, and symmetry pruning cut most practical cases. The recursion depth is n." },
        filename: "Solution.java",
        code: `import java.util.Arrays;

class Solution {

    public boolean makesquare(int[] matchsticks) {
        if (matchsticks.length < 4) {
            return false;
        }

        int total = 0;
        for (int stick : matchsticks) {
            total += stick;
        }

        if (total % 4 != 0) {
            return false;
        }

        int sideLength = total / 4;
        Arrays.sort(matchsticks);
        if (matchsticks[matchsticks.length - 1] > sideLength) {
            return false;
        }

        int[] sides = new int[4];
        return place(matchsticks, matchsticks.length - 1, sides, sideLength);
    }

    private boolean place(int[] matchsticks, int index, int[] sides, int sideLength) {
        if (index < 0) {
            return true;
        }

        int stick = matchsticks[index];
        for (int bucket = 0; bucket < 4; bucket++) {
            if (sides[bucket] + stick > sideLength) {
                continue;
            }

            sides[bucket] += stick;
            if (place(matchsticks, index - 1, sides, sideLength)) {
                return true;
            }
            sides[bucket] -= stick;

            if (sides[bucket] == 0) {
                break;
            }
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "matchsticks = [1,1,2,2,2]. The target side length is 2, and the sticks are processed from largest to smallest.",
      columns: ["step", "stick", "sides before", "bucket tried", "action", "sides after"],
      rows: [
        ["1", "2", "[0,0,0,0]", "0", "place", "[2,0,0,0]"],
        ["2", "2", "[2,0,0,0]", "0", "prune because 2 + 2 exceeds 2", "[2,0,0,0]"],
        ["3", "2", "[2,0,0,0]", "1", "place", "[2,2,0,0]"],
        ["4", "2", "[2,2,0,0]", "2", "place after full buckets are skipped", "[2,2,2,0]"],
        ["5", "1", "[2,2,2,0]", "3", "place after buckets 0 through 2 exceed", "[2,2,2,1]"],
        ["6", "1", "[2,2,2,1]", "3", "place", "[2,2,2,2]"],
        ["7", "none", "[2,2,2,2]", "all", "all sticks placed", "success"],
      ],
      narrativeMD: "The search succeeds because every bucket reaches side length **2**. In failing branches, a placement into one empty bucket represents all empty buckets, so the algorithm breaks instead of replaying symmetric work.",
    },
    interviewTipsMD:
      "Open with the reduction to four equal-sum buckets. Then explain why sorting descending is not required for correctness but is crucial for speed. The symmetry break is the premium detail: if a stick fails in an empty side, moving that same stick to another empty side only renames the sides, so it cannot produce a distinct outcome.",
    followUps: [
      "How would the solution change for partitioning into **k** equal-sum groups?",
      "How would you return the actual four groups of matchsticks?",
      "Can you solve the same constraints with bitmask dynamic programming?",
      "What additional pruning would you add when many sticks have the same length?",
    ],
    similarProblems: [
      { title: "Combination Sum", difficulty: "Medium", slug: "bt-combination-sum", note: "Also uses bounded search with choose, recurse, and undo." },
      { title: "N-Queens", difficulty: "Hard", slug: "bt-n-queens", note: "Another placement problem where pruning invalid positions is the core skill." },
      { title: "Partition to K Equal Sum Subsets", difficulty: "Medium", url: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/", note: "The direct generalisation from four square sides to k equal buckets." },
      { title: "Fair Distribution of Cookies", difficulty: "Medium", url: "https://leetcode.com/problems/fair-distribution-of-cookies/", note: "Another bucket-assignment DFS with symmetry and load pruning." },
    ],
    keyTakeaways: [
      "Square formation is equal-sum partitioning into four buckets.",
      "Sorting larger sticks first makes capacity pruning much stronger.",
      "Do not try equivalent empty buckets after a failed placement.",
      "Always undo the bucket sum before testing the next branch.",
    ],
    pattern:
      "For equal-bucket backtracking, sort candidates descending, place each item into a bounded bucket, recurse, undo, and skip symmetric empty buckets.",
  },
  {
    kind: "problem",
    slug: "bt-split-string-into-descending-consecutive-values",
    moduleId: "bt-advanced",
    order: 25,
    title: "Splitting a String Into Descending Consecutive Values",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/splitting-a-string-into-descending-consecutive-values/",
    tags: ["Backtracking", "DFS", "String", "Number Parsing", "Pruning"],
    companies: ["Google", "Amazon", "Microsoft", "Meta"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 22,
    statementMD:
      "Given a digit string **s**, determine whether it can be split into two or more non-empty substrings such that the numeric values are strictly descending by exactly one from left to right. Substrings may contain leading zeroes, so **004** represents the value 4.",
    constraints: [
      "1 <= s.length <= 20",
      "s consists only of digits",
      "The split must contain at least two numbers",
      "Leading zeroes are allowed when parsing each number",
    ],
    inputMD: "A digit string **s**.",
    outputMD: "A boolean indicating whether **s** can be partitioned into at least two descending consecutive values.",
    examples: [
      { input: "s = 1234", output: "false", explanation: "No split creates values where each next value is exactly one less than the previous value." },
      { input: "s = 050043", output: "true", explanation: "The split **05 | 004 | 3** gives values **5, 4, 3**." },
      { input: "s = 10009998", output: "true", explanation: "The split **100 | 099 | 98** gives values **100, 99, 98**." },
    ],
    learningObjectives: [
      "Recognise digit-string splitting as a partition backtracking problem.",
      "Choose the first number freely, then force every later number to equal the previous value minus one.",
      "Allow leading zeroes during parsing while still comparing numeric values.",
      "Prune candidates as soon as their parsed value exceeds the required next value.",
    ],
    intuitionMD:
      "Pattern Recognition + Intuition\n\nThis is a partition and cut backtracking problem over a digit string. The first cut is open-ended: it chooses the starting value. After that, the branching collapses into a much tighter rule. If the previous value is **x**, the next substring must parse to exactly **x - 1**.\n\nThat requirement is the main pruning power. A naive splitter would try every possible sequence of cuts, but here each frame has a known target value. Leading zeroes mean a candidate can start small and become equal later, as **004** becomes 4, so values below the target should keep extending. Once a candidate parses above **previous - 1**, extending it can only keep it too large, so the rest of that loop is impossible.",
    commonMistakes: [
      "Rejecting substrings with leading zeroes even though this problem allows them.",
      "Returning true after consuming the whole string with only one piece.",
      "Checking only that values are decreasing, instead of decreasing by exactly one.",
      "Breaking when a candidate is below the expected value, which misses cases like **004** becoming 4.",
    ],
    algorithmMD:
      "**State**\n\nThe first DFS layer chooses the initial prefix value. Every later frame carries **index**, the next digit position; **previous**, the numeric value of the last chosen substring; and **pieces**, the number of chosen substrings. The required next value is always **previous - 1**.\n\n**Recursion tree**\n\nFor **s = 050043**, choosing first prefix **0** fails because the next required value would be **-1** while substrings are non-negative. Choosing **05** gives previous value 5, so the next value must be 4. At index 2, candidate **0** parses to 0 and is too small, so extend. Candidate **00** is still 0, so extend. Candidate **004** parses to 4 and is chosen. Now the required value is 3, and the final substring **3** consumes the string with three pieces.\n\n**Pruning**\n\nUse **long** parsing because prefixes can exceed integer range. If **previous - 1** is negative and digits remain, the branch cannot continue. At a frame, extend the candidate substring while its value is below the expected value. If it equals the expected value, recurse. If it exceeds the expected value, break because adding more digits cannot bring the numeric value back down. Parse overflow also means the candidate is too large for any useful comparison, so that loop can stop.\n\n**Algorithm**\n\n1. Try every non-empty proper prefix as the first number so at least one digit remains for another piece.\n2. Parse the prefix as a **long** and start DFS at the next index with **pieces = 1**.\n3. In DFS, return **true** only when the whole string is consumed and at least two pieces were chosen.\n4. Compute **expected = previous - 1**. If it is negative, return **false** unless the string was already consumed.\n5. Extend the next substring one digit at a time and parse its value.\n6. Continue extending while the value is less than **expected**.\n7. Recurse only when the value equals **expected**.\n8. Break the loop when the value exceeds **expected** or parsing overflows.",
    solutions: [
      {
        name: "DFS with required next value",
        approachMD:
          "Choose the first number as a prefix. After that, every recursive frame knows the only acceptable numeric value for the next piece: **previous - 1**. The search tries longer substrings until it reaches that value, exceeds it, or runs out of digits.",
        walkthroughMD:
          "1. Iterate over all first prefixes that leave at least one digit for a second number.\n2. Parse the first prefix with **Long.parseLong** and call DFS.\n3. If DFS reaches the end, accept only when at least two pieces were selected.\n4. For the next piece, compute the required value **previous - 1**.\n5. Grow the candidate substring from the current index. Values below the requirement keep extending, equality recurses, and values above the requirement stop the loop.\n6. Return **true** immediately when any branch consumes the full string correctly.",
        complexity: { time: "O(n^3)", space: "O(n)", note: "There are O(n^2) candidate substrings across all first-prefix attempts, and parsing substrings can cost O(n). The recursion depth is at most n." },
        filename: "Solution.java",
        code: `class Solution {

    public boolean splitString(String s) {
        for (int end = 1; end < s.length(); end++) {
            long first;
            try {
                first = Long.parseLong(s.substring(0, end));
            } catch (NumberFormatException ex) {
                break;
            }

            if (search(s, end, first, 1)) {
                return true;
            }
        }

        return false;
    }

    private boolean search(String s, int index, long previous, int pieces) {
        if (index == s.length()) {
            return pieces >= 2;
        }

        long expected = previous - 1;
        if (expected < 0) {
            return false;
        }

        for (int end = index + 1; end <= s.length(); end++) {
            long current;
            try {
                current = Long.parseLong(s.substring(index, end));
            } catch (NumberFormatException ex) {
                break;
            }

            if (current > expected) {
                break;
            }

            if (current == expected && search(s, end, current, pieces + 1)) {
                return true;
            }
        }

        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "s = 050043. The successful split is found by choosing a first prefix whose value is 5, then requiring 4 and 3.",
      columns: ["step", "index", "previous", "candidate substring", "parsed value", "action"],
      rows: [
        ["1", "0", "none", "0", "0", "first prefix leads to expected -1, branch fails"],
        ["2", "0", "none", "05", "5", "choose first value, next must be 4"],
        ["3", "2", "5", "0", "0", "below 4, extend"],
        ["4", "2", "5", "00", "0", "below 4, extend"],
        ["5", "2", "5", "004", "4", "matches expected, recurse"],
        ["6", "5", "4", "3", "3", "matches expected and consumes string"],
      ],
      narrativeMD: "The split **05 | 004 | 3** succeeds with values **5, 4, 3**. The important detail is that leading zeroes are allowed, so candidates smaller than the expected value must be extended rather than rejected.",
    },
    interviewTipsMD:
      "State the turning point clearly: after the first number, this is no longer arbitrary partitioning because every next value is forced. Mention leading zeroes before coding, since this problem differs from many digit-partition questions. The safe pruning rule is one-sided: values above the expected next value can stop, but values below it may become equal by appending more digits.",
    followUps: [
      "How would you return one valid split instead of only a boolean?",
      "How would the algorithm change if leading zeroes were forbidden?",
      "How would you check ascending consecutive values instead?",
      "How would you avoid substring allocation by parsing incrementally?",
    ],
    similarProblems: [
      { title: "Expression Add Operators", difficulty: "Hard", slug: "bt-expression-add-operators", note: "Also explores digit-string partitions while carrying numeric state." },
      { title: "Restore IP Addresses", difficulty: "Medium", slug: "bt-restore-ip-addresses", note: "A digit-string splitting problem with strong validity bounds." },
      { title: "Palindrome Partitioning", difficulty: "Medium", slug: "bt-palindrome-partitioning", note: "The same cut-and-recurse pattern with a different validity predicate." },
      { title: "Split Array into Fibonacci Sequence", difficulty: "Medium", url: "https://leetcode.com/problems/split-array-into-fibonacci-sequence/", note: "Another numeric string split where previous values force the next value." },
      { title: "Additive Number", difficulty: "Medium", url: "https://leetcode.com/problems/additive-number/", note: "Uses two previous numeric pieces to constrain the next substring." },
    ],
    keyTakeaways: [
      "The first number is flexible; every later number is forced to be **previous - 1**.",
      "Leading zeroes are allowed, so small candidates may need to keep growing.",
      "Break only when a parsed candidate exceeds the required next value or overflows.",
      "A valid answer must consume the whole string and contain at least two pieces.",
    ],
    pattern:
      "For constrained string splitting, choose the first cut, carry the required next numeric value, extend candidates until they match or exceed it, and accept only full consumption with enough pieces.",
  },
];
