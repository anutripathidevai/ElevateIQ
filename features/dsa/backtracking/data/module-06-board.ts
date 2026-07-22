import type { DsaProblemLesson } from "../../types";

export const PROBLEMS: DsaProblemLesson[] = [
  {
    kind: "problem",
    slug: "bt-word-search",
    moduleId: "bt-board",
    order: 20,
    title: "Word Search",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/word-search/",
    tags: ["Backtracking", "DFS", "Matrix", "Recursion", "Pruning", "In-place Marking"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "Given an **m x n** board of characters and a string **word**, return whether **word** exists in the grid. The word must be formed by sequentially adjacent cells, where adjacent means horizontally or vertically neighboring. The same board cell may not be used more than once in a single word path.",
    constraints: [
      "1 <= m, n <= 6",
      "1 <= word.length <= 15",
      "board and word consist of lowercase and uppercase English letters",
      "The same cell cannot be reused within one path",
    ],
    inputMD: "A character grid **board** and a target string **word**.",
    outputMD: "A boolean: **true** if some valid path spells the whole word, otherwise **false**.",
    examples: [
      {
        input: "board = [[A,B,C,E],[S,F,C,S],[A,D,E,E]], word = ABCCED",
        output: "true",
        explanation: "A valid path is **A** at row 0 column 0, **B** at row 0 column 1, **C** at row 0 column 2, **C** at row 1 column 2, **E** at row 2 column 2, and **D** at row 2 column 1.",
      },
      {
        input: "board = [[A,B,C,E],[S,F,C,S],[A,D,E,E]], word = SEE",
        output: "true",
        explanation: "Starting at **S** in row 1 column 3, move down to **E** and then left to another **E**.",
      },
      {
        input: "board = [[A,B,C,E],[S,F,C,S],[A,D,E,E]], word = ABCB",
        output: "false",
        explanation: "The only obvious prefix **ABC** would need to reuse the **B** cell, which is not allowed.",
      },
    ],
    learningObjectives: [
      "Recognise grid word search as board backtracking with a moving cell and a word index.",
      "Mark a cell as visited before exploring neighbors and restore it afterward.",
      "Prune immediately on bounds, character mismatch, or revisiting the current path.",
      "Use a returned boolean to stop the search as soon as one complete path is found.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nThis is a board-search backtracking problem: build one path through a grid while obeying local constraints. The state is the current cell and the next index of **word** to match. The choices are the four neighboring cells. The base case is matching every character.\n\nThe place, validate, recurse, undo pattern appears as a visited marker. Once a cell matches **word[index]**, mark that cell so the same path cannot use it again, recurse into four directions for **index + 1**, then restore the original character before returning. The in-place trick uses a plain placeholder character such as **#** instead of a separate visited matrix; because the cell is restored, sibling branches see the board exactly as it was.\n\nThis is a single-solution search, not an enumeration problem. Returning **true** from the DFS lets the first completed word path short-circuit all remaining branches.",
    commonMistakes: [
      "Forgetting to restore the marked cell, which corrupts sibling searches from other starting cells.",
      "Allowing diagonal moves even though the problem only permits horizontal and vertical adjacency.",
      "Checking visited after overwriting the cell in a way that loses the original character.",
      "Continuing to explore after the word is already matched instead of returning **true** immediately.",
    ],
    algorithmMD:
      "**State**\n\nEach DFS frame carries **row**, **col**, and **index**. The board itself stores the current path by temporarily replacing visited cells with **#**. A frame is valid only when the position is inside the board and **board[row][col]** equals **word[index]**.\n\n**Recursion tree**\n\nFor **word = ABCCED**, the search tries each board cell as a possible starting **A**. From the **A** at row 0 column 0, the next level branches to up, down, left, and right for **B**. Three branches are cut by bounds or mismatch, while the right branch reaches **B**. The same pattern repeats: from **B**, only the right **C** survives; from that **C**, the downward **C** survives; then **E** and **D** complete the word.\n\n**Pruning**\n\nCut a branch if the cell is out of bounds, if the board character does not match the current word character, or if the cell is already marked **#** by the current path. The character mismatch check is the main pruning. The returned boolean also prunes the rest of the search once a full word is found.\n\n**Algorithm**\n\n1. Iterate over every cell as a possible start for **word[0]**.\n2. In DFS, return **true** when **index == word.length**.\n3. Reject the frame if the cell is outside the board or does not match **word[index]**.\n4. Save the original character and place the visited marker **#** in the cell.\n5. Recurse to the four neighboring cells with **index + 1**.\n6. Undo by restoring the saved character before returning.\n7. If any start returns **true**, return **true**; otherwise return **false**.",
    solutions: [
      {
        name: "In-place DFS with mark and restore",
        approachMD:
          "Treat each cell as a possible first character. The DFS validates the current character, places a temporary visited marker, explores four neighbors, and then restores the cell. This keeps auxiliary space to the recursion stack while preserving the board for other starting points.",
        walkthroughMD:
          "1. Scan every **row** and **col** in the board.\n2. Call DFS from that cell with **index = 0**.\n3. In DFS, finish successfully when **index** reaches **word.length**.\n4. Reject out-of-bounds cells and cells whose character does not equal **word[index]**.\n5. Save the current character, write **#** into the board, and recurse up, down, left, and right.\n6. Restore the saved character before returning the boolean result.",
        complexity: { time: "O(m * n * 3^L)", space: "O(L)", note: "There are m * n starts. After the first step, each path has at most 3 useful directions because it should not immediately return to the marked previous cell. L is word.length." },
        filename: "Solution.java",
        code: `class Solution {

    public boolean exist(char[][] board, String word) {
        for (int row = 0; row < board.length; row++) {
            for (int col = 0; col < board[0].length; col++) {
                if (dfs(board, word, row, col, 0)) {
                    return true;
                }
            }
        }

        return false;
    }

    private boolean dfs(char[][] board, String word, int row, int col, int index) {
        if (index == word.length()) {
            return true;
        }
        if (row < 0 || row == board.length || col < 0 || col == board[0].length) {
            return false;
        }
        if (board[row][col] != word.charAt(index)) {
            return false;
        }

        char saved = board[row][col];
        board[row][col] = '#';

        boolean found = dfs(board, word, row + 1, col, index + 1)
            || dfs(board, word, row - 1, col, index + 1)
            || dfs(board, word, row, col + 1, index + 1)
            || dfs(board, word, row, col - 1, index + 1);

        board[row][col] = saved;
        return found;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "board = [[A,B,C,E],[S,F,C,S],[A,D,E,E]], word = ABCCED. Track one successful path and the pruned branches around it.",
      columns: ["step", "cell", "choice", "action (place/undo)", "state"],
      rows: [
        ["1", "(0,0)", "match A", "place #", "path A, index moves to 1"],
        ["2", "(0,1)", "move right to B", "place #", "path A -> B"],
        ["3", "(0,2)", "move right to C", "place #", "path A -> B -> C"],
        ["4", "(0,3)", "try E for next C", "prune", "mismatch, return to (0,2)"],
        ["5", "(1,2)", "move down to C", "place #", "path A -> B -> C -> C"],
        ["6", "(2,2)", "move down to E", "place #", "path A -> B -> C -> C -> E"],
        ["7", "(2,1)", "move left to D", "place #", "word complete"],
        ["8", "return stack", "found true", "undo restore cells", "all markers are restored as true propagates"],
      ],
      narrativeMD: "The placeholder prevents reusing cells already in the path. Even though the search returns **true**, every active frame restores its cell before unwinding, so the board is left unchanged.",
    },
    complexityNote:
      "The search is exponential in the word length, but strong local pruning usually cuts most directions after one character check.",
    interviewTipsMD:
      "Lead with the invariant: every active path has unique cells because chosen cells are marked and later restored. Mention both implementation options, in-place **#** marking or a **visited** matrix, then prefer in-place marking when mutation is allowed. Also say why the boolean return matters: Word Search asks whether one path exists, so the first full match should stop the recursion.",
    followUps: [
      "How would you return the actual path of coordinates instead of only **true** or **false**?",
      "How would the solution change if diagonal moves were allowed?",
      "How would you search for many words on the same board efficiently?",
      "How would you handle a board where **#** could appear as a normal character?",
    ],
    similarProblems: [
      { title: "N-Queens", difficulty: "Hard", slug: "bt-n-queens", note: "Another board problem where marking constraints controls the search." },
      { title: "Sudoku Solver", difficulty: "Hard", slug: "bt-sudoku-solver", note: "Uses the same place, validate, recurse, undo structure with richer constraints." },
      { title: "Palindrome Partitioning", difficulty: "Medium", slug: "bt-palindrome-partitioning", note: "A different DFS where invalid choices are pruned before recursion." },
      { title: "Word Search II", difficulty: "Hard", url: "https://leetcode.com/problems/word-search-ii/", note: "Extends board DFS to many words using trie pruning." },
    ],
    keyTakeaways: [
      "Grid search becomes backtracking when a path cannot reuse cells.",
      "Mark before exploring neighbors and restore before returning to keep sibling branches independent.",
      "Bounds and character mismatch checks are powerful pruning gates.",
      "Use a boolean return for existence problems so one found path stops the search.",
    ],
    pattern:
      "Board path DFS: validate the current cell, mark it as used, recurse into allowed neighbors for the next symbol, restore the cell, and return early when a full path is found.",
  },
  {
    kind: "problem",
    slug: "bt-n-queens",
    moduleId: "bt-board",
    order: 21,
    title: "N-Queens",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/n-queens/",
    tags: ["Backtracking", "Board Search", "Recursion", "Constraint Tracking", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 30,
    statementMD:
      "Place **n** queens on an **n x n** chessboard so that no two queens attack each other. Return all distinct board configurations. A queen attacks along its row, column, and both diagonals.",
    constraints: ["1 <= n <= 9"],
    inputMD: "A single integer **n**, the board size and the number of queens to place.",
    outputMD: "A list of boards. Each board has **n** strings of length **n**, using **Q** for a queen and **.** for an empty cell.",
    examples: [
      {
        input: "n = 4",
        output: "[[.Q..,...Q,Q...,..Q.],[..Q.,Q...,...Q,.Q..]]",
        explanation: "There are exactly two ways to place 4 queens so none share a column or diagonal.",
      },
      {
        input: "n = 1",
        output: "[[Q]]",
        explanation: "A single queen on a single cell is already valid.",
      },
    ],
    learningObjectives: [
      "Recognise one-queen-per-row as the natural state compression for N-Queens.",
      "Track attacked columns and both diagonal families in O(1) per safety check.",
      "Use diagonal indices **r + c** and **r - c + (n - 1)** to avoid scanning the board.",
      "Build immutable board strings only when a full valid placement is reached.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nN-Queens is board placement backtracking. We construct a configuration row by row, placing exactly one queen in each row. That removes row conflicts by design, so each recursive frame only chooses a column for the current row.\n\nThe important insight is that safety can be checked without scanning the board. A queen attacks its column, its down-right diagonal where **r - c** is constant, and its down-left diagonal where **r + c** is constant. Use **r + c** directly for one diagonal array, and use **r - c + (n - 1)** for the other so the index is non-negative.\n\nThe template is place, validate, recurse, undo the cell. If a column or diagonal is already used, prune that column immediately. When row **n** is reached, every row has one safe queen, so convert the board into strings and record one solution.",
    commonMistakes: [
      "Scanning every previous queen for each candidate instead of tracking columns and diagonals.",
      "Forgetting the **n - 1** offset for **r - c**, causing negative diagonal indices.",
      "Placing multiple queens in the same row by recursing over cells instead of rows.",
      "Adding the mutable board directly to the result instead of creating fresh strings for each solution.",
    ],
    algorithmMD:
      "**State**\n\nEach frame carries the current **row**. The board records placed queens, while three boolean arrays record occupied columns, occupied **r + c** diagonals, and occupied **r - c + (n - 1)** diagonals. Since rows are processed in order, all rows before **row** contain exactly one safe queen.\n\n**Recursion tree**\n\nFor **n = 4**, the root represents row 0 with four column choices. If row 0 chooses column 0, many branches die by row 2 because every column is attacked by an existing queen. After undoing that branch, row 0 chooses column 1. Then row 1 column 3, row 2 column 0, and row 3 column 2 form one complete board. The second solution appears from the symmetric root choice at row 0 column 2.\n\n**Pruning**\n\nA candidate cell **(r, c)** is pruned if **columns[c]**, **diagSum[r + c]**, or **diagDiff[r - c + (n - 1)]** is already true. Those checks remove attacked squares before any recursive call. The search is still factorial because each row tends to choose among remaining columns, but diagonal pruning cuts most permutations early.\n\n**Algorithm**\n\n1. Create an **n x n** board filled with **.**.\n2. Create boolean arrays for columns, **r + c** diagonals, and **r - c + (n - 1)** diagonals.\n3. Recurse on **row = 0**.\n4. For each column in the current row, compute the two diagonal indices.\n5. If any constraint is already used, skip the cell.\n6. Place **Q**, mark the column and diagonals, and recurse to **row + 1**.\n7. Undo the placement and marks before trying the next column.\n8. When **row == n**, convert the board to strings and add it to the answer.",
    solutions: [
      {
        name: "Row-by-row DFS with column and diagonal sets",
        approachMD:
          "Place one queen per row and maintain three constraint arrays. This makes each safety test O(1): the candidate is legal exactly when its column and both diagonal indices are unused.",
        walkthroughMD:
          "1. Fill a character board with **.** and create the three boolean constraint arrays.\n2. Start DFS at row **0**.\n3. For every column, compute **sumDiagonal = row + col** and **diffDiagonal = row - col + n - 1**.\n4. Skip the column if any corresponding constraint is already true.\n5. Place **Q**, mark all three constraints, and recurse to the next row.\n6. After recursion, reset the cell to **.** and unmark the constraints.\n7. When every row has a queen, copy the board into a list of strings.",
        complexity: { time: "O(n!)", space: "O(n^2)", note: "Rows are fixed and columns cannot repeat, so the search is bounded by permutations of columns. The board uses O(n^2) space, while constraints and recursion use O(n). Output storage is excluded." },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

class Solution {

    public List<List<String>> solveNQueens(int n) {
        List<List<String>> result = new ArrayList<>();
        char[][] board = new char[n][n];
        for (char[] row : board) {
            Arrays.fill(row, '.');
        }

        boolean[] columns = new boolean[n];
        boolean[] diagSum = new boolean[2 * n - 1];
        boolean[] diagDiff = new boolean[2 * n - 1];

        backtrack(0, n, board, columns, diagSum, diagDiff, result);
        return result;
    }

    private void backtrack(int row, int n, char[][] board, boolean[] columns, boolean[] diagSum, boolean[] diagDiff, List<List<String>> result) {
        if (row == n) {
            addBoard(board, result);
            return;
        }

        for (int col = 0; col < n; col++) {
            int sumIndex = row + col;
            int diffIndex = row - col + n - 1;
            if (columns[col] || diagSum[sumIndex] || diagDiff[diffIndex]) {
                continue;
            }

            board[row][col] = 'Q';
            columns[col] = true;
            diagSum[sumIndex] = true;
            diagDiff[diffIndex] = true;

            backtrack(row + 1, n, board, columns, diagSum, diagDiff, result);

            board[row][col] = '.';
            columns[col] = false;
            diagSum[sumIndex] = false;
            diagDiff[diffIndex] = false;
        }
    }

    private void addBoard(char[][] board, List<List<String>> result) {
        List<String> layout = new ArrayList<>();
        for (char[] row : board) {
            layout.add(new String(row));
        }
        result.add(layout);
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "n = 4. Track row-by-row placements until the first valid board is recorded.",
      columns: ["step", "cell", "choice", "action (place/undo)", "state"],
      rows: [
        ["1", "row 0 col 0", "try first column", "place Q", "columns 0, sum 0, diff 3 marked"],
        ["2", "row 1 col 2", "candidate seems open", "place Q", "columns 0 and 2 marked"],
        ["3", "row 2", "no safe column", "undo row 1 col 2", "backtrack to row 1"],
        ["4", "row 1 col 3", "next safe candidate", "place Q", "continue branch from row 0 col 0"],
        ["5", "row 2 col 1", "only possible column", "place Q", "row 3 has no safe column"],
        ["6", "row 0 col 0", "branch exhausted", "undo row 0 col 0", "try next root column"],
        ["7", "row 0 col 1", "new root choice", "place Q", "columns 1, sum 1, diff 2 marked"],
        ["8", "row 1 col 3", "safe", "place Q", "queens at (0,1) and (1,3)"],
        ["9", "row 2 col 0", "safe", "place Q", "three rows filled"],
        ["10", "row 3 col 2", "safe", "place Q", "record .Q.. | ...Q | Q... | ..Q."],
      ],
      narrativeMD: "The first root branch fails because later rows have no legal square. Undoing all marks returns the board to empty, allowing the successful branch starting at row 0 column 1.",
    },
    complexityNote:
      "The diagonal arrays do not change the factorial worst case, but they make each safety check constant time and prune invalid partial boards before deeper recursion.",
    interviewTipsMD:
      "Start by saying one queen per row. That single design choice removes row conflicts and turns the problem into choosing a safe column at each depth. Then write the two diagonal formulas clearly: **r + c** and **r - c + (n - 1)**. Interviewers often look for that non-negative offset because it proves you understand the board geometry.",
    followUps: [
      "How would you count the number of solutions without storing the boards?",
      "How would you optimize the constraint tracking with bit masks?",
      "How would the solution change if some cells were blocked?",
      "How would you return only the first valid board instead of all boards?",
    ],
    similarProblems: [
      { title: "Sudoku Solver", difficulty: "Hard", slug: "bt-sudoku-solver", note: "Another board-placement search where constraint checks dominate performance." },
      { title: "Word Search", difficulty: "Medium", slug: "bt-word-search", note: "Contrasts row placement with path movement through neighboring cells." },
      { title: "Permutations", difficulty: "Medium", slug: "bt-permutations", note: "Choosing one unused column per row resembles choosing unused values for positions." },
      { title: "Combinations", difficulty: "Medium", slug: "bt-combinations", note: "Another depth-controlled search where each level makes one placement choice." },
      { title: "N-Queens II", difficulty: "Hard", url: "https://leetcode.com/problems/n-queens-ii/", note: "The counting-only version of the same search tree." },
    ],
    keyTakeaways: [
      "Placing one queen per row removes an entire class of conflicts from the state.",
      "Columns and diagonals can be tracked with boolean arrays for O(1) safety checks.",
      "Use **r - c + (n - 1)** to map difference diagonals into non-negative indices.",
      "Build board strings only at complete valid leaves.",
    ],
    pattern:
      "Row-placement backtracking: choose one column for the current row, validate column and diagonal constraints, place the queen, recurse to the next row, then undo every mark.",
  },
  {
    kind: "problem",
    slug: "bt-sudoku-solver",
    moduleId: "bt-board",
    order: 22,
    title: "Sudoku Solver",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/sudoku-solver/",
    tags: ["Backtracking", "Constraint Propagation", "Matrix", "Recursion", "DFS", "Pruning"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Oracle"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 35,
    statementMD:
      "Write a program to solve a Sudoku puzzle by filling the empty cells. Empty cells are marked with **.**. A valid solution must place digits **1** through **9** so that each row, each column, and each **3x3** box contains every digit exactly once. The board should be modified in place.",
    constraints: [
      "board.length == 9",
      "board[i].length == 9",
      "board[i][j] is a digit 1 through 9 or .",
      "The input puzzle has exactly one solution",
    ],
    inputMD: "A **9 x 9** character board containing digits and **.** for empty cells.",
    outputMD: "No separate return value. Mutate **board** so every empty cell is filled with the unique valid Sudoku solution.",
    examples: [
      {
        input: "board rows = [5,3,.,.,7,.,.,.,.], [6,.,.,1,9,5,.,.,.], [.,9,8,.,.,.,.,6,.], [8,.,.,.,6,.,.,.,3], [4,.,.,8,.,3,.,.,1], [7,.,.,.,2,.,.,.,6], [.,6,.,.,.,.,2,8,.], [.,.,.,4,1,9,.,.,5], [.,.,.,.,8,.,.,7,9]",
        output: "solved rows = [5,3,4,6,7,8,9,1,2], [6,7,2,1,9,5,3,4,8], [1,9,8,3,4,2,5,6,7], [8,5,9,7,6,1,4,2,3], [4,2,6,8,5,3,7,9,1], [7,1,3,9,2,4,8,5,6], [9,6,1,5,3,7,2,8,4], [2,8,7,4,1,9,6,3,5], [3,4,5,2,8,6,1,7,9]",
        explanation: "Every dot is filled so each row, column, and 3x3 box contains digits **1** through **9** exactly once.",
      },
      {
        input: "board has only one empty cell at row 8 column 8, and digit 9 is the only missing value in its row, column, and box",
        output: "the empty cell becomes 9",
        explanation: "The solver still uses the same validation rule; only **9** passes all three constraints for that cell.",
      },
    ],
    learningObjectives: [
      "Recognise Sudoku as board backtracking with row, column, and box constraints.",
      "Return a boolean from recursion so the first full valid board stops the search.",
      "Validate a digit against its row, column, and 3x3 box before placing it.",
      "Undo failed placements by resetting the cell to **.** before trying the next digit.",
    ],
    intuitionMD:
      "Pattern Recognition\n\nSudoku is a constraint-satisfaction board problem. Each empty cell must receive one digit, but a digit is legal only if it does not already appear in the same row, column, or **3x3** box. That is exactly place, validate, recurse, undo.\n\nThe state is the partially filled board. The next choice is the next empty cell and one of digits **1** through **9**. Before placing, validate the digit locally. If it is valid, write it into the cell and recurse. If the deeper call cannot finish the puzzle, reset the cell to **.** and try the next digit.\n\nThe key control-flow detail is the returned boolean. Sudoku asks for one complete solution and guarantees uniqueness, so once the recursion fills every cell, **true** bubbles back up and prevents any more undoing or sibling exploration.",
    commonMistakes: [
      "Returning after the first invalid digit instead of trying the remaining digits for that empty cell.",
      "Forgetting to reset a failed cell to **.**, leaving stale digits that poison later branches.",
      "Checking the row and column but forgetting the 3x3 box.",
      "Continuing to search after a full solution is found, which can undo the solved board.",
    ],
    algorithmMD:
      "**State**\n\nEach recursion frame works on the same mutable **9 x 9** board. The frame finds the next cell containing **.**. If no empty cell exists, the board is complete and the frame returns **true**.\n\n**Recursion tree**\n\nFor the classic puzzle, the first empty cell is row 0 column 2. The tree branches over digits **1** through **9**, but most digits are cut immediately by the row, column, or box. Suppose **1** is placed there; the solver continues to the next empty cell and may go many levels deeper before discovering a later cell with no valid digit. That failure returns **false**, causing each tentative placement in that branch to be reset to **.**. Eventually the branch with **4** at row 0 column 2 survives and the puzzle completes.\n\n**Pruning**\n\nA digit is pruned if it already appears in the target row, target column, or the **3x3** box whose top-left corner is **(row / 3) * 3, (col / 3) * 3**. These checks are constraint propagation: every placed digit immediately restricts future cells, and any cell with no legal digit forces the branch to backtrack.\n\n**Algorithm**\n\n1. Search the board for the next **.** cell.\n2. If no empty cell exists, return **true** because the board is solved.\n3. For digits **1** through **9**, test whether the digit is valid in the row, column, and box.\n4. Place the first valid candidate in the empty cell.\n5. Recurse to solve the rest of the board.\n6. If recursion returns **true**, return **true** immediately.\n7. Otherwise undo by resetting the cell to **.** and try the next digit.\n8. If no digit works, return **false** to force the previous cell to backtrack.",
    solutions: [
      {
        name: "Boolean backtracking with row, column, and box validation",
        approachMD:
          "Always solve the next empty cell. Try digits **1** through **9**, place only digits that pass all three Sudoku constraints, and return **true** once the board is complete. Failed branches restore the cell to **.** before trying another digit.",
        walkthroughMD:
          "1. The public method calls a boolean helper on the board.\n2. The helper scans for the next empty cell marked **.**.\n3. If no empty cell is found, return **true** because the board is solved.\n4. For that cell, try each digit from **1** through **9**.\n5. A digit is valid only if it is absent from the row, absent from the column, and absent from the corresponding **3x3** box.\n6. Place a valid digit and recurse. If the recursive call succeeds, return **true** immediately.\n7. If it fails, reset the cell to **.** and try the next digit.\n8. Return **false** when no digit can solve the current cell.",
        complexity: { time: "O(9^m)", space: "O(m)", note: "m is the number of empty cells. Each empty cell may branch over up to 9 digits, and the recursion stack can contain one frame per empty cell." },
        filename: "Solution.java",
        code: `class Solution {

    public void solveSudoku(char[][] board) {
        solve(board);
    }

    private boolean solve(char[][] board) {
        for (int row = 0; row < 9; row++) {
            for (int col = 0; col < 9; col++) {
                if (board[row][col] == '.') {
                    for (char digit = '1'; digit <= '9'; digit++) {
                        if (isValid(board, row, col, digit)) {
                            board[row][col] = digit;
                            if (solve(board)) {
                                return true;
                            }
                            board[row][col] = '.';
                        }
                    }
                    return false;
                }
            }
        }

        return true;
    }

    private boolean isValid(char[][] board, int row, int col, char digit) {
        for (int index = 0; index < 9; index++) {
            if (board[row][index] == digit || board[index][col] == digit) {
                return false;
            }
        }

        int boxRow = (row / 3) * 3;
        int boxCol = (col / 3) * 3;
        for (int r = boxRow; r < boxRow + 3; r++) {
            for (int c = boxCol; c < boxCol + 3; c++) {
                if (board[r][c] == digit) {
                    return false;
                }
            }
        }

        return true;
    }
}`,
      },
    ],
    dryRun: {
      inputMD: "Classic Sudoku sample. Track the first empty cell and how failed guesses are undone before the successful branch continues.",
      columns: ["step", "cell", "choice", "action (place/undo)", "state"],
      rows: [
        ["1", "(0,2)", "try 1", "place 1", "tentative row 0 is 5 3 1 . 7 . . . ."],
        ["2", "deeper branch", "later cell has no digit", "prune", "branch with (0,2)=1 fails"],
        ["3", "(0,2)", "1", "undo to .", "cell is empty again"],
        ["4", "(0,2)", "try 2", "place 2", "another tentative branch begins"],
        ["5", "deeper branch", "conflict appears", "undo to .", "return to (0,2) choices"],
        ["6", "(0,2)", "try 4", "place 4", "row 0 becomes 5 3 4 . 7 . . . ."],
        ["7", "(0,3)", "try 6", "place 6", "row 0 becomes 5 3 4 6 7 . . . ."],
        ["8", "final empty cell", "only valid digit", "place and stop", "full board solved, true propagates"],
      ],
      narrativeMD: "The solver does not know that **4** is correct immediately. It learns by trying candidates, letting constraints propagate, and undoing any branch that makes a future cell impossible.",
    },
    complexityNote:
      "The theoretical search is exponential in the number of empty cells, but row, column, and box validation remove most candidates in real puzzles.",
    interviewTipsMD:
      "Make the boolean return explicit. Without it, a valid solved board can be undone as recursion unwinds. Also keep validation simple and correct before optimizing: scan the row, column, and box with plain character comparisons, then reset to **.** on failure. If asked for speed, you can add row, column, and box bit masks, but the backtracking control flow stays the same.",
    followUps: [
      "How would you speed up validation with row, column, and box bit masks?",
      "How would you choose the next cell with the fewest candidates instead of the first empty cell?",
      "How would you detect whether a puzzle has more than one solution?",
      "How would you generate a valid Sudoku puzzle rather than solve one?",
    ],
    similarProblems: [
      { title: "N-Queens", difficulty: "Hard", slug: "bt-n-queens", note: "Both problems place symbols on a board while tracking attack or validity constraints." },
      { title: "Word Search", difficulty: "Medium", slug: "bt-word-search", note: "Uses in-place board mutation and restoration for a path search." },
      { title: "Combination Sum", difficulty: "Medium", slug: "bt-combination-sum", note: "Another try-candidate, recurse, undo template where invalid candidates are pruned." },
      { title: "Valid Sudoku", difficulty: "Medium", url: "https://leetcode.com/problems/valid-sudoku/", note: "Checks the same row, column, and box constraints without filling empty cells." },
      { title: "Unique Paths III", difficulty: "Hard", url: "https://leetcode.com/problems/unique-paths-iii/", note: "Another grid backtracking problem with visited cells and exhaustive paths." },
    ],
    keyTakeaways: [
      "Sudoku is a constraint-satisfaction search over empty cells.",
      "Validate before placing so illegal digits never enter the deeper board state.",
      "Reset failed placements to **.** to keep sibling digit choices clean.",
      "Return **true** from the first complete solution to preserve the solved board.",
    ],
    pattern:
      "Constraint-board backtracking: find an empty cell, try each locally valid symbol, place it, recurse for a complete solution, and undo only when that branch fails.",
  },
];
