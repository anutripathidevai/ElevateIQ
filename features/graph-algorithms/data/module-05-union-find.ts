import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-accounts-merge",
    moduleId: "union-find",
    order: 15,
    title: "Accounts Merge",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/accounts-merge/",
    tags: ["Graph", "Union Find", "DSU", "Hash Table", "Sorting"],
    companies: ["Amazon", "Google", "Facebook/Meta", "Microsoft"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 25,
    statementMD:
      "Given a list of accounts, each account is shaped as **[name, email1, email2, ...]**. Two accounts belong to the same person if they share **at least one email address**. The same person may appear in multiple accounts, and two different people may have the same name.\n\nMerge all accounts that belong to the same person. Each merged account should contain the person's name followed by that person's **unique emails in lexicographic order**. The merged accounts themselves may be returned in any order.",
    constraints: [
      "1 <= accounts.length <= 1000",
      "2 <= accounts[i].length <= 10",
      "1 <= name.length, email.length <= 30",
      "accounts[i][0] is a name and the remaining values are emails",
      "Each email consists of lowercase English letters, digits, dots, plus signs, or at signs",
    ],
    inputMD:
      "A list **accounts** where the first value in each row is a name and every later value is an email address owned by that account.",
    outputMD:
      "A list of merged accounts. Each account starts with the owner name, followed by the sorted unique emails in that connected email group.",
    examples: [
      {
        input:
          "accounts = [\n  [\"John\",\"johnsmith@mail.com\",\"john_newyork@mail.com\"],\n  [\"John\",\"johnsmith@mail.com\",\"john00@mail.com\"],\n  [\"Mary\",\"mary@mail.com\"],\n  [\"John\",\"johnnybravo@mail.com\"]\n]",
        output:
          "[\n  [\"John\",\"john00@mail.com\",\"john_newyork@mail.com\",\"johnsmith@mail.com\"],\n  [\"Mary\",\"mary@mail.com\"],\n  [\"John\",\"johnnybravo@mail.com\"]\n]",
        explanation:
          "The first two John accounts share johnsmith@mail.com, so all three of their emails become one sorted group. Mary and johnnybravo@mail.com are isolated groups.",
      },
      {
        input:
          "accounts = [\n  [\"Alex\",\"a@mail.com\",\"b@mail.com\"],\n  [\"Alex\",\"c@mail.com\",\"b@mail.com\"],\n  [\"Alex\",\"d@mail.com\",\"c@mail.com\"]\n]",
        output:
          "[[\"Alex\",\"a@mail.com\",\"b@mail.com\",\"c@mail.com\",\"d@mail.com\"]]",
        explanation:
          "Sharing is transitive: a is connected to b, b to c, and c to d, so every email belongs to one person.",
      },
    ],
    learningObjectives: [
      "Model emails as graph nodes and shared accounts as edges that connect those emails.",
      "Use Union-Find to merge connected components without building an explicit adjacency list.",
      "Separate identity discovery from output formatting: first group by root, then sort emails and prepend the name.",
    ],
    intuitionMD:
      "The important mental shift is that accounts are not the real components; **emails** are. If two emails appear in the same account, they must belong to the same person, so we can connect them. If an email later appears in another account, that account's emails are pulled into the same component too. This is exactly the transitive merging behavior Union-Find is designed for.\n\nTreat every unique email as a node. For each account, union the first email with every other email in that row. After all unions, every root represents one real person. The final pass is just bookkeeping: collect all emails under their root, sort each group, and use any email in the group to look up the owner's name.\n\nWhy not merge account rows directly? Because a person can be spread across several rows, and the bridge might be any email, not necessarily the first row you saw. Union-Find lets every shared email collapse the right components no matter what order the rows arrive in.",
    commonMistakes: [
      "Unioning account indices but then losing the unique email set; unioning emails directly makes grouping and sorting cleaner.",
      "Forgetting transitivity: if account A shares with B and B shares with C, all three must merge even if A and C share no direct email.",
      "Returning emails in discovery order instead of lexicographic order.",
      "Using the account name as an identity key. Different people may share the same name; emails determine identity.",
      "Looking up the output name from an arbitrary account index after grouping by email root. Store email to name while scanning.",
    ],
    algorithmMD:
      "1. Scan every account and assign each unique email a compact integer id. Also store **email → name**.\n2. Create a Union-Find with one node per unique email.\n3. For each account, union the id of its first email with the id of every other email in the same account. This makes all emails in that account part of one component.\n4. Iterate over every unique email, find its root, and append the email to the list for that root.\n5. Sort each root's email list, create an output row with the owner name followed by the sorted emails, and return all rows.",
    solutions: [
      {
        name: "Union-Find over emails",
        whenToUseMD:
          "Use this when the problem asks for transitive merging of identities. It is more direct than graph traversal because every shared email immediately collapses two sets, and the final grouping is by root.",
        approachMD:
          "Map each unique email to an id, union all emails that appear in the same account, then group emails by their representative root. Sorting is done only after the components are known.",
        walkthroughMD:
          "1. Build **emailToId** and **emailToName** in one scan.\n2. In a second scan, take the first email of each account as the anchor and union it with every later email in that account.\n3. Create **rootToEmails** by finding each email's compressed root.\n4. For every component, sort the emails, prepend **emailToName** from any email in that component, and add the row to the answer.",
        complexity: {
          time: "O(E · α(U) + U log U)",
          space: "O(U)",
          note: "E is the number of email mentions and U is the number of unique emails. Sorting all groups is bounded by sorting U emails overall.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Solution {

    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        Map<String, Integer> emailToId = new HashMap<>();
        Map<String, String> emailToName = new HashMap<>();

        int nextId = 0;
        for (List<String> account : accounts) {
            String name = account.get(0);
            for (int i = 1; i < account.size(); i++) {
                String email = account.get(i);
                if (!emailToId.containsKey(email)) {
                    emailToId.put(email, nextId);
                    nextId++;
                }
                emailToName.put(email, name);
            }
        }

        UnionFind unionFind = new UnionFind(nextId);
        for (List<String> account : accounts) {
            int firstEmailId = emailToId.get(account.get(1));
            for (int i = 2; i < account.size(); i++) {
                int currentEmailId = emailToId.get(account.get(i));
                unionFind.union(firstEmailId, currentEmailId);
            }
        }

        Map<Integer, List<String>> rootToEmails = new HashMap<>();
        for (String email : emailToId.keySet()) {
            int root = unionFind.find(emailToId.get(email));
            rootToEmails.computeIfAbsent(root, key -> new ArrayList<>()).add(email);
        }

        List<List<String>> mergedAccounts = new ArrayList<>();
        for (List<String> emails : rootToEmails.values()) {
            Collections.sort(emails);
            List<String> merged = new ArrayList<>();
            merged.add(emailToName.get(emails.get(0)));
            merged.addAll(emails);
            mergedAccounts.add(merged);
        }
        return mergedAccounts;
    }

    private static class UnionFind {
        private final int[] parent;
        private final int[] size;

        UnionFind(int n) {
            parent = new int[n];
            size = new int[n];
            for (int i = 0; i < n; i++) {
                parent[i] = i;
                size[i] = 1;
            }
        }

        int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
        }

        void union(int a, int b) {
            int rootA = find(a);
            int rootB = find(b);
            if (rootA == rootB) {
                return;
            }
            if (size[rootA] < size[rootB]) {
                int temp = rootA;
                rootA = rootB;
                rootB = temp;
            }
            parent[rootB] = rootA;
            size[rootA] += size[rootB];
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "accounts = [[John, johnsmith@mail.com, john_newyork@mail.com], [John, johnsmith@mail.com, john00@mail.com], [Mary, mary@mail.com]]",
      columns: ["Step", "Operation", "Components", "Output effect"],
      rows: [
        ["1", "Assign ids to four unique emails", "each email is alone", "No output yet"],
        ["2", "Union johnsmith with john_newyork", "{johnsmith, john_newyork}", "First John component formed"],
        ["3", "Union johnsmith with john00", "{johnsmith, john_newyork, john00}", "Second John row joins same root"],
        ["4", "Mary has one email", "{mary} remains separate", "Mary will be its own row"],
        ["5", "Group by root and sort", "John group plus Mary group", "Return sorted emails under each name"],
      ],
      narrativeMD:
        "The shared email johnsmith@mail.com is the bridge between the two John rows. Once both rows point into the same DSU root, grouping by root naturally produces one sorted John account and one Mary account.",
    },
    interviewTipsMD:
      "Lead with the graph model: emails are nodes, and co-occurrence in an account is an edge. Then immediately say Union-Find is ideal because the problem asks for connected components, not paths. Be explicit that names are labels, not keys. When you describe output construction, mention sorting each component and using any email in the component to recover the name.",
    followUps: [
      "What changes if accounts arrive in a stream and you must merge online? Keep the email id map and Union-Find alive across inserts.",
      "What if an email can be reassigned to a different person later? DSU does not support efficient splits; you would need a different data model.",
      "How would you make output deterministic across runs? Sort the final list of merged accounts by name and then first email.",
      "Can you solve it with DFS? Yes, build an email adjacency list from each account and traverse components.",
    ],
    similarProblems: [
      {
        title: "Number of Connected Components",
        difficulty: "Medium",
        slug: "graph-number-of-connected-components",
        note: "Same component grouping idea on integer vertices.",
      },
      {
        title: "Most Stones Removed with Same Row or Column",
        difficulty: "Medium",
        slug: "graph-most-stones-removed",
        note: "Union different entity types, then count components.",
      },
      {
        title: "Satisfiability of Equality Equations",
        difficulty: "Medium",
        slug: "graph-satisfiability-of-equality-equations",
        note: "Unions equality classes, then checks contradictions.",
      },
      {
        title: "Similar String Groups",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/similar-string-groups/",
      },
    ],
    keyTakeaways: [
      "Identity merge problems usually hide connected components over identifiers.",
      "Union all evidence first; format and sort output only after components are stable.",
      "Names are metadata here. Emails define connectivity.",
      "Path compression plus union by size makes repeated merges effectively constant time.",
    ],
    pattern:
      "Entity merge with DSU: map identifiers to ids, union identifiers that appear together, group original values by root, then format each component.",
  },
  {
    slug: "graph-most-stones-removed",
    moduleId: "union-find",
    order: 16,
    title: "Most Stones Removed with Same Row or Column",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/",
    tags: ["Graph", "Union Find", "DSU", "Hash Table"],
    companies: ["Amazon", "Google", "Facebook/Meta", "Microsoft"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 22,
    statementMD:
      "You are given **n** stones on a 2D grid. Each stone has integer coordinates **[row, col]**, and no two stones share the same coordinate.\n\nYou may remove a stone if there is another stone still remaining in the same row or the same column. Return the **maximum number of stones** you can remove.",
    constraints: [
      "1 <= stones.length <= 1000",
      "0 <= row, col <= 10000",
      "No two stones have the same coordinate",
    ],
    inputMD: "An array **stones** where each entry is a row and column coordinate.",
    outputMD: "An integer: the maximum number of stones that can be removed while following the row or column rule.",
    examples: [
      {
        input: "stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]",
        output: "5",
        explanation:
          "All six stones are connected through shared rows and columns. You can keep one stone as the final anchor and remove the other five.",
      },
      {
        input: "stones = [[0,0],[0,2],[1,1],[2,0],[2,2]]",
        output: "3",
        explanation:
          "The four corner stones form one connected component, so three of them can be removed. The center stone shares no row or column and must remain.",
      },
    ],
    learningObjectives: [
      "Convert a removal process into a connected-components counting problem.",
      "Use DSU over rows and columns as separate node types instead of comparing every pair of stones.",
      "Prove the formula **answer = stones - components** for this class of problems.",
    ],
    intuitionMD:
      "A stone is removable as long as it is not the last stone in its connected cluster. In a cluster where stones are linked by shared rows or columns, you can always keep one stone as the anchor and remove the rest. Therefore a component with **k** stones contributes **k - 1** removals, and summing over components gives **n - number of components**.\n\nThe trick is how to build components efficiently. Instead of creating an edge between every pair of stones in the same row or column, create nodes for rows and nodes for columns. A stone at **(r, c)** connects row **r** to column **c**. If two stones share a row, they touch the same row node; if they share a column, they touch the same column node. Unioning row nodes with column nodes captures the same connectivity with one union per stone.\n\nBecause row ids and column ids live in different namespaces, shift columns by an offset such as **10001**. Then row 5 and column 5 do not collide.",
    commonMistakes: [
      "Counting roots for every possible row and column id. Only roots touched by actual stones matter.",
      "Forgetting to offset columns, causing row 7 and column 7 to be treated as the same node.",
      "Returning the number of components instead of **n - components**.",
      "Pairwise comparing all stones by row and column. That works for small inputs but misses the intended DSU pattern.",
      "Thinking each component must have a cycle. A tree-shaped connected component of stones can still be reduced to one remaining stone.",
    ],
    algorithmMD:
      "1. Allocate a Union-Find for row ids **0..10000** and column ids **10001..20001**.\n2. For each stone **[r, c]**, union **r** with **c + 10001**. This joins every stone that shares a row or column into the same connected component.\n3. After all unions, create a set of roots by calling find on each stone's row id. Each stone contributes one touched root, and equal roots mean the stones belong to the same component.\n4. Return **stones.length - rootCount**.",
    solutions: [
      {
        name: "Union-Find over row and column nodes",
        whenToUseMD:
          "Use this when grid coordinates define relationships but the grid itself is sparse. DSU avoids building a huge matrix or comparing every pair of stones.",
        approachMD:
          "Represent each row and each column as a DSU node. A stone connects its row node to its shifted column node. Connected components among touched nodes correspond exactly to connected components among stones.",
        walkthroughMD:
          "1. Choose **OFFSET = 10001** because rows and columns are at most 10000.\n2. Union **row** with **col + OFFSET** for every stone.\n3. Count distinct roots among the row ids of the stones. Counting row ids is enough because every stone's row and column have already been unioned.\n4. Subtract the component count from the number of stones.",
        complexity: {
          time: "O(n · α(C))",
          space: "O(C)",
          note: "C is the fixed coordinate universe of 20002 row and shifted-column nodes. With coordinate compression, space becomes O(n).",
        },
        filename: "Solution.java",
        code: `import java.util.HashSet;
import java.util.Set;

class Solution {

    private static final int OFFSET = 10001;
    private static final int LIMIT = 20002;

    public int removeStones(int[][] stones) {
        UnionFind unionFind = new UnionFind(LIMIT);
        for (int[] stone : stones) {
            int rowId = stone[0];
            int colId = stone[1] + OFFSET;
            unionFind.union(rowId, colId);
        }

        Set<Integer> componentRoots = new HashSet<>();
        for (int[] stone : stones) {
            componentRoots.add(unionFind.find(stone[0]));
        }
        return stones.length - componentRoots.size();
    }

    private static class UnionFind {
        private final int[] parent;
        private final int[] size;

        UnionFind(int n) {
            parent = new int[n];
            size = new int[n];
            for (int i = 0; i < n; i++) {
                parent[i] = i;
                size[i] = 1;
            }
        }

        int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
        }

        void union(int a, int b) {
            int rootA = find(a);
            int rootB = find(b);
            if (rootA == rootB) {
                return;
            }
            if (size[rootA] < size[rootB]) {
                int temp = rootA;
                rootA = rootB;
                rootB = temp;
            }
            parent[rootB] = rootA;
            size[rootA] += size[rootB];
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "stones = [[0,0],[0,1],[1,0],[2,2]]. Columns are shifted by 10001, so column 0 is node 10001.",
      columns: ["Step", "Stone", "Union", "Components among stones", "Formula"],
      rows: [
        ["1", "[0,0]", "union row 0 with col 10001", "{[0,0]}", "4 - ?"],
        ["2", "[0,1]", "union row 0 with col 10002", "{[0,0],[0,1]}", "same row connects them"],
        ["3", "[1,0]", "union row 1 with col 10001", "{[0,0],[0,1],[1,0]}", "same column joins row 1"],
        ["4", "[2,2]", "union row 2 with col 10003", "plus isolated {[2,2]}", "two components total"],
        ["5", "Count roots", "roots for rows 0,0,1 are same; row 2 differs", "2 components", "4 - 2 = 2"],
      ],
      narrativeMD:
        "The first three stones form one connected component through row 0 and column 0. The last stone has no shared row or column, so it is the second component. Each component must leave one stone behind, so the maximum removals are **4 - 2 = 2**.",
    },
    interviewTipsMD:
      "State the invariant before writing code: in each connected component, all but one stone can be removed, so the answer is **n - components**. Then explain the row-column DSU trick. This is the part interviewers are looking for: a stone is an edge between a row node and a column node, not just a point in a matrix.",
    followUps: [
      "What if row and column coordinates are up to one billion? Coordinate-compress rows and shifted columns with a HashMap instead of allocating a fixed array.",
      "Return one valid removal order. Build component memberships and repeatedly remove a stone that still shares a row or column inside its component.",
      "How would the answer change if diagonal sharing also allowed removal? Add diagonal families as additional node types.",
      "Can you solve it with DFS? Yes, build a graph of stones connected by shared row or column, but DSU is cleaner for sparse coordinates.",
    ],
    similarProblems: [
      {
        title: "Accounts Merge",
        difficulty: "Medium",
        slug: "graph-accounts-merge",
        note: "Both problems union identifiers and then count or emit components.",
      },
      {
        title: "Number of Provinces",
        difficulty: "Medium",
        slug: "graph-number-of-provinces",
        note: "Classic component counting with DSU or DFS.",
      },
      {
        title: "Redundant Connection",
        difficulty: "Medium",
        slug: "graph-redundant-connection",
        note: "Uses DSU roots to detect when an edge joins nodes already connected.",
      },
      {
        title: "Regions Cut By Slashes",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/regions-cut-by-slashes/",
      },
    ],
    keyTakeaways: [
      "Maximum removable stones equals total stones minus connected components.",
      "Rows and columns are separate node types; offset one namespace to avoid collisions.",
      "A stone can be viewed as an edge connecting its row node to its column node.",
      "Count roots only among nodes touched by stones, not the entire coordinate universe.",
    ],
    pattern:
      "Sparse grid DSU: model each item as a connection between coordinate-feature nodes, union those features, then compute n minus touched components.",
  },
  {
    slug: "graph-satisfiability-of-equality-equations",
    moduleId: "union-find",
    order: 17,
    title: "Satisfiability of Equality Equations",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/satisfiability-of-equality-equations/",
    tags: ["Graph", "Union Find", "DSU", "String"],
    companies: ["Amazon", "Google", "Facebook/Meta", "Apple"],
    estimatedReadingMin: 7,
    estimatedSolvingMin: 16,
    statementMD:
      "You are given an array of equations over lowercase variables **a** through **z**. Each equation has the form **x==y** or **x!=y**.\n\nReturn **true** if it is possible to assign values to the variables so that every equation is satisfied. Otherwise return **false**.",
    constraints: [
      "1 <= equations.length <= 500",
      "equations[i].length == 4",
      "equations[i][0] and equations[i][3] are lowercase English letters",
      "equations[i][1] is '=' or '!'",
      "equations[i][2] is '='",
    ],
    inputMD:
      "An array **equations** of equality and inequality strings over 26 lowercase variables.",
    outputMD:
      "A boolean: **true** if all equations can be satisfied at the same time, otherwise **false**.",
    examples: [
      {
        input: "equations = [\"a==b\",\"b!=c\",\"c==a\"]",
        output: "false",
        explanation:
          "The equalities force a, b, and c into the same group. Then b!=c contradicts that group.",
      },
      {
        input: "equations = [\"a==b\",\"b==c\",\"a==c\",\"x!=y\"]",
        output: "true",
        explanation:
          "The a, b, c equalities are consistent, and x and y are never forced to be equal.",
      },
    ],
    learningObjectives: [
      "Use DSU to represent equivalence classes created by equality constraints.",
      "Separate positive constraints from negative constraints with a two-pass algorithm.",
      "Recognise contradictions by checking whether an inequality falls inside one DSU component.",
    ],
    intuitionMD:
      "Equality is transitive. If **a==b** and **b==c**, then **a**, **b**, and **c** must all live in the same equivalence class. Union-Find is a natural fit because it maintains exactly those classes.\n\nInequality is different: **a!=b** does not tell us where either variable belongs; it only forbids them from ending up in the same class. That is why the order matters. First process every equality so all forced classes are complete. Then scan inequalities and reject any one whose two variables now share a root.\n\nThis two-pass structure is the whole problem. If you check inequalities too early, you may miss a later equality that creates the contradiction.",
    commonMistakes: [
      "Processing equations in input order and accepting an inequality before all equalities have been unioned.",
      "Checking the wrong character for the operator. The operator is determined by index 1.",
      "Forgetting that x!=x is immediately impossible because both sides have the same root.",
      "Using 500 DSU nodes for equations instead of 26 nodes for variables.",
      "Treating inequality as a union operation. Inequality is a check, not a merge.",
    ],
    algorithmMD:
      "1. Create a Union-Find of size 26, one node for each lowercase variable.\n2. First pass: for every equation whose operator is equality, union the two variables.\n3. Second pass: for every inequality, compare the roots of its two variables. If the roots are equal, the constraints contradict each other, so return false.\n4. If no inequality is violated, return true.",
    solutions: [
      {
        name: "Two-pass Union-Find",
        whenToUseMD:
          "Use this for equality and inequality constraint systems where positive constraints form equivalence classes and negative constraints only need contradiction checks.",
        approachMD:
          "Union every equality first, then verify each inequality against the finished DSU. With only 26 variables, the implementation is small, but the pattern scales to larger symbolic constraint problems.",
        walkthroughMD:
          "1. Convert a variable to an id by subtracting **a**.\n2. In the equality pass, union the ids at positions 0 and 3 whenever position 1 is equality.\n3. In the inequality pass, if those same two ids have the same root, return false immediately.\n4. Reaching the end means no forbidden pair was forced equal.",
        complexity: {
          time: "O(m · α(26))",
          space: "O(26)",
          note: "m is the number of equations. Because there are only 26 variables, this is effectively linear time and constant space.",
        },
        filename: "Solution.java",
        code: `class Solution {

    public boolean equationsPossible(String[] equations) {
        UnionFind unionFind = new UnionFind(26);

        for (String equation : equations) {
            if (equation.charAt(1) == '=') {
                int left = equation.charAt(0) - 'a';
                int right = equation.charAt(3) - 'a';
                unionFind.union(left, right);
            }
        }

        for (String equation : equations) {
            if (equation.charAt(1) == '!') {
                int left = equation.charAt(0) - 'a';
                int right = equation.charAt(3) - 'a';
                if (unionFind.find(left) == unionFind.find(right)) {
                    return false;
                }
            }
        }

        return true;
    }

    private static class UnionFind {
        private final int[] parent;
        private final int[] size;

        UnionFind(int n) {
            parent = new int[n];
            size = new int[n];
            for (int i = 0; i < n; i++) {
                parent[i] = i;
                size[i] = 1;
            }
        }

        int find(int node) {
            if (parent[node] != node) {
                parent[node] = find(parent[node]);
            }
            return parent[node];
        }

        void union(int a, int b) {
            int rootA = find(a);
            int rootB = find(b);
            if (rootA == rootB) {
                return;
            }
            if (size[rootA] < size[rootB]) {
                int temp = rootA;
                rootA = rootB;
                rootB = temp;
            }
            parent[rootB] = rootA;
            size[rootA] += size[rootB];
        }
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "equations = [a==b, b!=c, c==a]. First finish all equality unions, then check inequalities.",
      columns: ["Pass", "Equation", "DSU state", "Decision"],
      rows: [
        ["Equality", "a==b", "{a,b} plus other singletons", "merge a and b"],
        ["Equality", "b!=c", "unchanged", "skip until inequality pass"],
        ["Equality", "c==a", "{a,b,c} plus other singletons", "merge c into a's set"],
        ["Inequality", "b!=c", "b and c have same root", "contradiction, return false"],
      ],
      narrativeMD:
        "The inequality looks harmless before c==a is processed, but after all equalities are complete, b and c are in the same equivalence class. That makes **b!=c** impossible.",
    },
    interviewTipsMD:
      "Emphasise the two-pass reason, not just the mechanics. Equalities create facts; inequalities validate against the final facts. This framing prevents the common input-order bug and makes the proof simple: after pass one, DSU contains exactly the forced equality classes; pass two checks that no forbidden pair lies inside a class.",
    followUps: [
      "What if variables are arbitrary strings instead of 26 lowercase letters? Map each string to an id as in Accounts Merge.",
      "What if equations include less-than constraints? DSU alone is not enough; you need ordering constraints and cycle detection.",
      "Return one concrete assignment of integer values. Give each DSU component a distinct value, then verify inequalities.",
      "Support online additions and report when a contradiction first appears. Union equalities as they arrive, but store inequalities for rechecking or use a richer dynamic structure.",
    ],
    similarProblems: [
      {
        title: "Accounts Merge",
        difficulty: "Medium",
        slug: "graph-accounts-merge",
        note: "A larger identity-merging version of equality classes.",
      },
      {
        title: "Number of Provinces",
        difficulty: "Medium",
        slug: "graph-number-of-provinces",
        note: "Union all direct connections, then count classes.",
      },
      {
        title: "Redundant Connection",
        difficulty: "Medium",
        slug: "graph-redundant-connection",
        note: "Checks whether a new equality-style edge joins nodes already in one class.",
      },
      {
        title: "Evaluate Division",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/evaluate-division/",
      },
    ],
    keyTakeaways: [
      "Union-Find models equality as connected components or equivalence classes.",
      "Negative constraints are checked after all positive constraints are known.",
      "Inequality never unions nodes; it rejects two nodes that already share a root.",
      "Small fixed alphabets still benefit from the DSU pattern because the reasoning is clear and scalable.",
    ],
    pattern:
      "Constraint DSU: union all equality constraints first, then reject any inequality whose endpoints resolve to the same root.",
  },
];