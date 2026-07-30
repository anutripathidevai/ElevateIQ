import type { GraphProblem } from "../types";

export const PROBLEMS: GraphProblem[] = [
  {
    slug: "graph-course-schedule",
    moduleId: "topological-sort",
    order: 11,
    title: "Course Schedule",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/course-schedule/",
    tags: ["Graph", "Topological Sort", "BFS", "DFS"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple"],
    estimatedReadingMin: 9,
    estimatedSolvingMin: 20,
    statementMD:
      "There are **numCourses** courses labelled **0..numCourses - 1**. You are given an array **prerequisites** where prerequisites[i] = [course, prerequisite] means you must take **prerequisite** before **course**.\n\nReturn **true** if it is possible to finish all courses, otherwise return **false**. In graph terms, courses are nodes and prerequisites are directed edges from prerequisite to course. You can finish all courses exactly when this directed graph has **no cycle**.",
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
      "0 <= course, prerequisite < numCourses",
      "All prerequisite pairs are unique",
    ],
    inputMD:
      "An integer **numCourses** and a directed edge list **prerequisites**, where each pair [course, prerequisite] points from prerequisite to course.",
    outputMD:
      "A boolean: **true** if every course can be completed, **false** if some cycle makes completion impossible.",
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
        explanation:
          "Take course 0 first, then course 1. The graph is 0 → 1, which is acyclic.",
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "false",
        explanation:
          "Course 0 needs 1 and course 1 needs 0. Neither can be started, so the cycle blocks completion.",
      },
      {
        input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
        output: "true",
        explanation:
          "One valid plan is 0, then 1 and 2 in either order, then 3. There is no directed cycle.",
      },
    ],
    learningObjectives: [
      "Model prerequisites as a directed graph and connect feasibility to acyclicity.",
      "Use Kahn's algorithm to repeatedly remove zero-indegree nodes and detect leftover cycle nodes.",
      "Use DFS 3-color marking to recognise a back edge into the current recursion path.",
      "Explain why topological-sort problems are about dependencies, not shortest paths or connected components.",
    ],
    intuitionMD:
      "A course can be taken only after all incoming edges into it have been satisfied. So the clean mental model is: keep taking courses with **zero remaining prerequisites**. Each time you take one, it removes an outgoing edge from that course to every dependent course. If that makes another course's prerequisite count drop to zero, it becomes available next.\n\nIf the graph is a DAG, this peeling process eventually removes every node. If a cycle exists, every node in the cycle waits for another node in the same cycle, so none of them ever becomes zero-indegree. That is why the processed-count check is a cycle detector.\n\nDFS gives the same answer from the opposite angle: while exploring a dependency chain, seeing a node already on the current recursion path means the chain loops back on itself. A finished node is safe; an in-progress node proves a cycle.",
    commonMistakes: [
      "Reversing the edge direction. For [course, prerequisite], add prerequisite → course and increment indegree of course.",
      "Checking only whether the initial queue is empty. Some graphs start with zero-indegree nodes but still contain a separate cycle.",
      "Marking DFS nodes as fully processed before their descendants are complete, which hides back edges.",
      "Assuming the graph must be connected. Course graphs can have many independent components; scan every course.",
      "Returning true after processing one chain instead of verifying processed count equals numCourses.",
    ],
    algorithmMD:
      "**Kahn's BFS:**\n1. Build adjacency lists from each prerequisite to the courses that depend on it.\n2. Count indegree for every course.\n3. Put all zero-indegree courses in a queue.\n4. Pop a course, count it as processed, and decrement indegree for each dependent course. Any dependent course that reaches zero joins the queue.\n5. If processed == numCourses, every node was peeled away, so no cycle exists; otherwise the leftover nodes are trapped in a cycle.\n\n**DFS 3-color:**\n1. Use 0 = unvisited, 1 = visiting, 2 = done.\n2. Start DFS from every unvisited course.\n3. Entering a node marks it visiting. Reaching another visiting node is a back edge and therefore a cycle.\n4. After all descendants are safe, mark the node done. If no DFS finds a back edge, all courses can be finished.",
    solutions: [
      {
        name: "Kahn's algorithm (BFS indegrees)",
        whenToUseMD:
          "Best default when you may also need a course ordering later. It exposes the available courses layer by layer and detects cycles by leftover unprocessed nodes.",
        approachMD:
          "Treat each zero-indegree course as immediately available. Remove available courses one by one, update the indegrees of dependent courses, and count how many courses were successfully removed.",
        walkthroughMD:
          "1. Allocate an adjacency list for every course.\n2. For each [course, prerequisite], append course to prerequisite's outgoing list and increment indegree[course].\n3. Enqueue every course with indegree 0.\n4. Pop from the queue, increment processed, and relax outgoing edges by decrementing neighbours' indegrees.\n5. Return processed == numCourses; a smaller count means a cycle kept some courses locked.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "V is numCourses and E is prerequisites.length; adjacency, indegree, and queue dominate space.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

class Solution {

    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int course = 0; course < numCourses; course++) {
            graph.add(new ArrayList<>());
        }

        int[] indegree = new int[numCourses];
        for (int[] prerequisite : prerequisites) {
            int course = prerequisite[0];
            int before = prerequisite[1];
            graph.get(before).add(course);
            indegree[course]++;
        }

        Queue<Integer> queue = new ArrayDeque<>();
        for (int course = 0; course < numCourses; course++) {
            if (indegree[course] == 0) {
                queue.offer(course);
            }
        }

        int processed = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            processed++;
            for (int next : graph.get(course)) {
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue.offer(next);
                }
            }
        }
        return processed == numCourses;
    }
}`,
      },
      {
        name: "DFS 3-color cycle detection",
        whenToUseMD:
          "Elegant when the question is only cycle detection. It avoids maintaining indegrees and expresses the invariant directly: a gray node on the call stack means a cycle.",
        approachMD:
          "Run DFS over the prerequisite graph with colors for unvisited, visiting, and done. A directed edge to a visiting node is a back edge, which makes finishing impossible.",
        walkthroughMD:
          "1. Build the same prerequisite → course adjacency list.\n2. For each unvisited course, start DFS.\n3. Mark the course visiting before exploring neighbours.\n4. If any neighbour is visiting, return cycle found. If a neighbour is unvisited, recursively check it.\n5. Mark the course done after all outgoing edges are safe.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "Adjacency is O(V + E); color and recursion stack are O(V).",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int course = 0; course < numCourses; course++) {
            graph.add(new ArrayList<>());
        }
        for (int[] prerequisite : prerequisites) {
            int course = prerequisite[0];
            int before = prerequisite[1];
            graph.get(before).add(course);
        }

        int[] color = new int[numCourses];
        for (int course = 0; course < numCourses; course++) {
            if (color[course] == 0 && hasCycle(course, graph, color)) {
                return false;
            }
        }
        return true;
    }

    private boolean hasCycle(int course, List<List<Integer>> graph, int[] color) {
        color[course] = 1;
        for (int next : graph.get(course)) {
            if (color[next] == 1) {
                return true;
            }
            if (color[next] == 0 && hasCycle(next, graph, color)) {
                return true;
            }
        }
        color[course] = 2;
        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Kahn trace for numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]. Edges are 0 → 1, 0 → 2, 1 → 3, 2 → 3.",
      columns: ["Step", "Queue before pop", "Popped", "Indegrees after updates", "Processed count"],
      rows: [
        ["Init", "[0]", "-", "[0,1,1,2]", "0"],
        ["1", "[0]", "0", "[0,0,0,2]; enqueue 1 and 2", "1"],
        ["2", "[1,2]", "1", "[0,0,0,1]", "2"],
        ["3", "[2]", "2", "[0,0,0,0]; enqueue 3", "3"],
        ["4", "[3]", "3", "[0,0,0,0]", "4"],
      ],
      narrativeMD:
        "All four courses are processed, so every dependency chain eventually unlocked. A cycle would leave at least one course unprocessed with positive indegree.",
    },
    interviewTipsMD:
      "Say the graph invariant first: finishing all courses is possible iff the prerequisite graph is a DAG. Then choose Kahn's algorithm as the practical default because it naturally produces a topological order and gives a clear cycle test. If asked for a lighter pure-cycle solution, pivot to DFS colors. Be precise with edge direction; most wrong solutions fail before the algorithm even starts.",
    followUps: [
      "Return one valid course order instead of only true or false.",
      "Return all courses involved in a cycle.",
      "What if prerequisites are added one at a time and you must keep answering whether the plan is valid?",
      "How would you schedule courses by semester when all currently available courses can be taken in parallel?",
    ],
    similarProblems: [
      {
        title: "Course Schedule II",
        difficulty: "Medium",
        slug: "graph-course-schedule-ii",
        note: "Same DAG check, but return the topological order.",
      },
      {
        title: "Alien Dictionary",
        difficulty: "Hard",
        slug: "graph-alien-dictionary",
        note: "Infer a character dependency graph, then topologically sort it.",
      },
      {
        title: "Parallel Courses",
        difficulty: "Medium",
        slug: "graph-parallel-courses",
        note: "Kahn's BFS by levels instead of by individual nodes.",
      },
      {
        title: "Find Eventual Safe States",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/find-eventual-safe-states/",
      },
    ],
    keyTakeaways: [
      "Prerequisite feasibility is directed cycle detection.",
      "Kahn's algorithm removes zero-indegree nodes; leftover nodes imply a cycle.",
      "DFS 3-color marking detects cycles when an edge points to a node still on the recursion stack.",
      "Always build edges from prerequisite to course for this problem family.",
    ],
    pattern:
      "Topological feasibility: build directed edges prereq → dependent, peel zero-indegree nodes, and verify every node was processed.",
  },
  {
    slug: "graph-course-schedule-ii",
    moduleId: "topological-sort",
    order: 12,
    title: "Course Schedule II",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/course-schedule-ii/",
    tags: ["Graph", "Topological Sort", "BFS", "DFS"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 10,
    estimatedSolvingMin: 25,
    statementMD:
      "There are **numCourses** courses labelled **0..numCourses - 1** and a prerequisite list where prerequisites[i] = [course, prerequisite] means prerequisite must be completed before course.\n\nReturn **any valid order** in which all courses can be taken. If no ordering exists because the prerequisite graph has a cycle, return an empty array.",
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= numCourses * (numCourses - 1)",
      "prerequisites[i].length == 2",
      "0 <= course, prerequisite < numCourses",
      "All prerequisite pairs are unique",
    ],
    inputMD:
      "An integer **numCourses** and directed prerequisite pairs [course, prerequisite]. Each pair means prerequisite must appear before course in the answer.",
    outputMD:
      "An int array containing one valid topological ordering, or an empty array if the graph is cyclic.",
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "[0,1]",
        explanation:
          "Course 0 has no prerequisites, so it must come before course 1.",
      },
      {
        input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
        output: "[0,1,2,3]",
        explanation:
          "Course 0 unlocks 1 and 2; both must come before 3. [0,2,1,3] is also valid.",
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "[]",
        explanation:
          "The two courses depend on each other, so no course can appear first in a valid order.",
      },
    ],
    learningObjectives: [
      "Turn the Course Schedule feasibility check into an actual topological ordering.",
      "Understand why Kahn's pop order is already a valid schedule.",
      "Use DFS postorder and reversal to place prerequisites before dependents.",
      "Detect cycles while still returning an order only for DAGs.",
    ],
    intuitionMD:
      "A valid schedule is just a topological ordering: every directed edge points forward in the returned array. If course 0 must precede course 1, then 0 must be placed earlier than 1.\n\nKahn's algorithm constructs that ordering in the most literal way. At any moment, the zero-indegree courses have no remaining prerequisites, so placing one next cannot violate any dependency. Once it is placed, it may unlock more courses. The order in which courses leave the queue is therefore a valid schedule.\n\nDFS builds the order backward. When DFS finishes a course, it has already finished every course reachable from it, meaning all dependents are already in postorder. Reversing postorder moves prerequisites in front of the courses they unlock. The only blocker is a cycle, which must return an empty array rather than a partial order.",
    commonMistakes: [
      "Returning the list from DFS postorder without reversing it when edges point prerequisite → course.",
      "Returning a partial Kahn order even when processed < numCourses. A partial schedule is not a valid answer.",
      "Treating multiple valid orders as wrong. Any topological order is acceptable.",
      "Forgetting isolated courses. Courses with no edges still belong in the returned order.",
      "Using [course, prerequisite] as course → prerequisite and then wondering why the returned order is reversed.",
    ],
    algorithmMD:
      "**Kahn's BFS order:**\n1. Build graph prerequisite → course and indegree counts.\n2. Enqueue all zero-indegree courses.\n3. Each popped course is appended to the answer immediately because all its prerequisites are already placed.\n4. Decrement dependents' indegrees and enqueue any that reach zero.\n5. If the answer length is numCourses, return it; otherwise return an empty array.\n\n**DFS postorder:**\n1. Use color states to detect cycles.\n2. DFS every unvisited course.\n3. After exploring all outgoing edges from a course, append the course to postorder.\n4. Reverse postorder to get prerequisites before dependents.\n5. If any DFS sees a gray node, return an empty array.",
    solutions: [
      {
        name: "Kahn's BFS collecting pop order",
        whenToUseMD:
          "Best practical answer for interviews. It is iterative, easy to dry-run, and the queue pop sequence is the topological order itself.",
        approachMD:
          "Run the same zero-indegree peeling used in Course Schedule, but write each popped course into the result array. If all courses are popped, the result is a valid ordering.",
        walkthroughMD:
          "1. Build adjacency and indegree arrays from prerequisites.\n2. Seed a queue with courses whose indegree is 0, including isolated courses.\n3. Pop a course and place it at the next result index.\n4. For each dependent course, decrement indegree and enqueue it when it becomes available.\n5. Return the filled result only if every course was placed.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "The result, indegree array, queue, and adjacency list are linear in the graph size.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

class Solution {

    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int course = 0; course < numCourses; course++) {
            graph.add(new ArrayList<>());
        }

        int[] indegree = new int[numCourses];
        for (int[] prerequisite : prerequisites) {
            int course = prerequisite[0];
            int before = prerequisite[1];
            graph.get(before).add(course);
            indegree[course]++;
        }

        Queue<Integer> queue = new ArrayDeque<>();
        for (int course = 0; course < numCourses; course++) {
            if (indegree[course] == 0) {
                queue.offer(course);
            }
        }

        int[] order = new int[numCourses];
        int index = 0;
        while (!queue.isEmpty()) {
            int course = queue.poll();
            order[index++] = course;
            for (int next : graph.get(course)) {
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue.offer(next);
                }
            }
        }
        return index == numCourses ? order : new int[0];
    }
}`,
      },
      {
        name: "DFS postorder then reverse",
        whenToUseMD:
          "Useful when you prefer recursive dependency reasoning or are already doing DFS cycle detection. It produces the same topological-order guarantee after reversing postorder.",
        approachMD:
          "DFS the prerequisite graph with 3-color cycle detection. Append a course after all dependents reachable from it are explored, then read that postorder list backward.",
        walkthroughMD:
          "1. Build prerequisite → course adjacency.\n2. DFS every unvisited course with colors 0, 1, and 2.\n3. If DFS reaches color 1, a cycle exists and the answer is empty.\n4. Append each course when it turns color 2.\n5. Fill the result array by reading postorder from the end to the beginning.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "Postorder and color are O(V); recursion stack can also reach O(V).",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayList;
import java.util.List;

class Solution {

    public int[] findOrder(int numCourses, int[][] prerequisites) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int course = 0; course < numCourses; course++) {
            graph.add(new ArrayList<>());
        }
        for (int[] prerequisite : prerequisites) {
            int course = prerequisite[0];
            int before = prerequisite[1];
            graph.get(before).add(course);
        }

        int[] color = new int[numCourses];
        List<Integer> postorder = new ArrayList<>();
        for (int course = 0; course < numCourses; course++) {
            if (color[course] == 0 && hasCycle(course, graph, color, postorder)) {
                return new int[0];
            }
        }

        int[] order = new int[numCourses];
        for (int i = 0; i < numCourses; i++) {
            order[i] = postorder.get(numCourses - 1 - i);
        }
        return order;
    }

    private boolean hasCycle(int course, List<List<Integer>> graph, int[] color, List<Integer> postorder) {
        color[course] = 1;
        for (int next : graph.get(course)) {
            if (color[next] == 1) {
                return true;
            }
            if (color[next] == 0 && hasCycle(next, graph, color, postorder)) {
                return true;
            }
        }
        color[course] = 2;
        postorder.add(course);
        return false;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "Kahn trace for numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]].",
      columns: ["Step", "Queue", "Placed course", "Order so far", "Unlocked courses"],
      rows: [
        ["Init", "[0]", "-", "[]", "Course 0 has no prerequisites"],
        ["1", "[0]", "0", "[0]", "1 and 2 drop to indegree 0"],
        ["2", "[1,2]", "1", "[0,1]", "3 still waits for 2"],
        ["3", "[2]", "2", "[0,1,2]", "3 drops to indegree 0"],
        ["4", "[3]", "3", "[0,1,2,3]", "All courses placed"],
      ],
      narrativeMD:
        "Every placed course had all prerequisites already placed. The final order length is 4, so [0,1,2,3] is a valid topological order.",
    },
    interviewTipsMD:
      "Clarify that the answer is not unique; this prevents unnecessary sorting or overfitting to one sample output. Kahn's BFS is usually the clearest because the result is exactly the pop order. If presenting DFS, explicitly mention that postorder must be reversed for prerequisite → course edges. Always finish with the cycle condition: return an empty array if you cannot place every course.",
    followUps: [
      "Return the lexicographically smallest valid order by using a min-heap instead of a queue.",
      "Return all valid course orders, or count how many exist.",
      "Group courses into semesters where each semester contains all currently available courses.",
      "Detect and return one concrete cycle when no order exists.",
    ],
    similarProblems: [
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Same graph; only asks whether an order exists.",
      },
      {
        title: "Alien Dictionary",
        difficulty: "Hard",
        slug: "graph-alien-dictionary",
        note: "Topological ordering over inferred character constraints.",
      },
      {
        title: "Parallel Courses",
        difficulty: "Medium",
        slug: "graph-parallel-courses",
        note: "Topological sort counted by BFS layers.",
      },
      {
        title: "Sequence Reconstruction",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/sequence-reconstruction/",
        note: "Topological sort with uniqueness constraints.",
      },
    ],
    keyTakeaways: [
      "A valid schedule is a topological order of the prerequisite graph.",
      "Kahn's pop order is valid because every popped node has no remaining incoming edges.",
      "DFS postorder places dependents first, so reverse it to put prerequisites first.",
      "Never return a partial order when a cycle blocks the remaining nodes.",
    ],
    pattern:
      "Topological ordering: repeatedly output zero-indegree nodes, or DFS postorder then reverse; reject the graph if a cycle is found.",
  },
  {
    slug: "graph-alien-dictionary",
    moduleId: "topological-sort",
    order: 13,
    title: "Alien Dictionary",
    difficulty: "Hard",
    leetcodeUrl: "https://leetcode.com/problems/alien-dictionary/",
    tags: ["Graph", "Topological Sort", "BFS", "String"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Airbnb"],
    estimatedReadingMin: 11,
    estimatedSolvingMin: 30,
    statementMD:
      "You are given a list of words sorted lexicographically according to an unknown alien alphabet. Return **any valid ordering** of the distinct letters that appear in the words. If the sorted list is inconsistent and no valid alphabet exists, return the empty string.\n\nThe only ordering evidence comes from adjacent words: at the first position where two neighbouring words differ, the letter from the first word must come before the letter from the second word. If the earlier word is longer and the later word is its prefix, such as **abc** before **ab**, the input is invalid immediately.",
    constraints: [
      "1 <= words.length <= 100",
      "1 <= words[i].length <= 100",
      "words[i] consists of lowercase English letters",
      "All words are sorted according to the alien language if a valid order exists",
    ],
    inputMD:
      "An array **words** that is claimed to be sorted by an unknown alphabet. Only letters that appear in the words should appear in the output.",
    outputMD:
      "A string containing one valid ordering of the seen letters, or the empty string if the constraints are contradictory.",
    examples: [
      {
        input: "words = ['wrt','wrf','er','ett','rftt']",
        output: "wertf",
        explanation:
          "Comparisons imply w → e, r → t, t → f, and e → r. One valid order satisfying all edges is wertf.",
      },
      {
        input: "words = ['z','x']",
        output: "zx",
        explanation:
          "The first differing characters give z → x, so z must come before x.",
      },
      {
        input: "words = ['z','x','z']",
        output: "empty string",
        explanation:
          "The first pair implies z → x, while the second pair implies x → z. That cycle makes every alphabet invalid.",
      },
      {
        input: "words = ['abc','ab']",
        output: "empty string",
        explanation:
          "The later word is a prefix of the earlier longer word, which can never happen in a valid lexicographic ordering.",
      },
    ],
    learningObjectives: [
      "Derive graph edges from the first differing character in each adjacent word pair.",
      "Handle the invalid prefix case before topological sorting.",
      "Topologically sort only the letters that actually appear in the input.",
      "Avoid duplicate edges so indegrees remain accurate.",
    ],
    intuitionMD:
      "The words are already sorted, so every adjacent pair is a clue about the alien alphabet. Compare two neighbouring words from left to right. As soon as their characters differ, lexicographic order says the first word's character must be smaller than the second word's character. That single comparison creates one directed edge. Characters after the first difference tell you nothing, because lexicographic order was decided earlier.\n\nThe prefix case is the trap. In any lexicographic system, a shorter word must come before its longer extension. Therefore **ab** can appear before **abc**, but **abc** before **ab** is impossible no matter how letters are ordered. You must reject that before building a misleading graph.\n\nAfter all edges are collected, the problem becomes Course Schedule II over letters instead of courses. Kahn's algorithm emits letters with no remaining prerequisites. If a cycle remains, the queue dries up too early and the output length is smaller than the number of distinct seen letters.",
    commonMistakes: [
      "Adding edges from every differing character position. Only the first difference matters.",
      "Missing the invalid prefix case where the first word is longer and the second word is its exact prefix.",
      "Including all 26 letters in the result instead of only letters that appear in the input.",
      "Counting duplicate edges multiple times, which inflates indegree and falsely creates a cycle.",
      "Assuming there is a unique answer. Many valid alphabets can satisfy the same constraints.",
    ],
    algorithmMD:
      "1. Create graph storage for 26 lowercase letters, plus a seen array. Mark every character that appears and count distinct seen letters.\n2. For each adjacent pair of words, scan until the first differing index or until one word ends.\n3. If no difference exists and the first word is longer, return the empty string because the prefix order is invalid.\n4. If a first difference exists, add an edge firstChar → secondChar. Only increment indegree the first time that edge is added.\n5. Enqueue every seen letter with indegree 0.\n6. Run Kahn's algorithm, appending each popped letter to the answer and decrementing its outgoing neighbours.\n7. Return the answer only if its length equals the number of seen letters; otherwise a cycle made the dictionary invalid.",
    solutions: [
      {
        name: "Kahn's topological sort over seen letters",
        approachMD:
          "Extract precedence edges from adjacent word pairs, reject invalid prefixes immediately, then run Kahn's algorithm on the distinct letters that actually appear.",
        walkthroughMD:
          "1. Initialise 26 adjacency sets so duplicate edges are naturally ignored.\n2. Mark all letters seen while scanning all words.\n3. Compare words[i] and words[i + 1]. The first different characters form an edge; if there is no difference and the first word is longer, return empty.\n4. Seed the queue with seen letters whose indegree is 0.\n5. Pop letters into a StringBuilder and relax outgoing edges.\n6. If the StringBuilder length is smaller than the number of seen letters, a cycle exists, so return empty.",
        complexity: {
          time: "O(C + A)",
          space: "O(A)",
          note: "C is the total number of characters scanned; A is bounded by 26 letters and their edges.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Queue;
import java.util.Set;

class Solution {

    public String alienOrder(String[] words) {
        List<Set<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < 26; i++) {
            graph.add(new HashSet<>());
        }

        boolean[] seen = new boolean[26];
        int seenCount = 0;
        for (String word : words) {
            for (int i = 0; i < word.length(); i++) {
                int letter = word.charAt(i) - 'a';
                if (!seen[letter]) {
                    seen[letter] = true;
                    seenCount++;
                }
            }
        }

        int[] indegree = new int[26];
        for (int i = 0; i < words.length - 1; i++) {
            String before = words[i];
            String after = words[i + 1];
            int limit = Math.min(before.length(), after.length());
            int index = 0;
            while (index < limit && before.charAt(index) == after.charAt(index)) {
                index++;
            }

            if (index == limit) {
                if (before.length() > after.length()) {
                    return "";
                }
                continue;
            }

            int from = before.charAt(index) - 'a';
            int to = after.charAt(index) - 'a';
            if (graph.get(from).add(to)) {
                indegree[to]++;
            }
        }

        Queue<Integer> queue = new ArrayDeque<>();
        for (int letter = 0; letter < 26; letter++) {
            if (seen[letter] && indegree[letter] == 0) {
                queue.offer(letter);
            }
        }

        StringBuilder order = new StringBuilder();
        while (!queue.isEmpty()) {
            int letter = queue.poll();
            order.append((char) (letter + 'a'));
            for (int next : graph.get(letter)) {
                indegree[next]--;
                if (indegree[next] == 0) {
                    queue.offer(next);
                }
            }
        }
        return order.length() == seenCount ? order.toString() : "";
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "words = ['wrt','wrf','er','ett','rftt']. Compare adjacent pairs and then run Kahn's algorithm on the seen letters {w,r,t,f,e}.",
      columns: ["Step", "Evidence", "Edge added", "Zero-indegree queue", "Order so far"],
      rows: [
        ["Compare 1", "wrt vs wrf first differs at t/f", "t → f", "-", "-"],
        ["Compare 2", "wrf vs er first differs at w/e", "w → e", "-", "-"],
        ["Compare 3", "er vs ett first differs at r/t", "r → t", "-", "-"],
        ["Compare 4", "ett vs rftt first differs at e/r", "e → r", "[w]", ""],
        ["Kahn 1", "pop w", "decrement e", "[e]", "w"],
        ["Kahn 2", "pop e", "decrement r", "[r]", "we"],
        ["Kahn 3", "pop r", "decrement t", "[t]", "wer"],
        ["Kahn 4", "pop t", "decrement f", "[f]", "wert"],
        ["Kahn 5", "pop f", "none", "[]", "wertf"],
      ],
      narrativeMD:
        "The output length is 5, which matches the five seen letters, so there is no cycle. The inferred chain w → e → r → t → f yields **wertf**.",
    },
    interviewTipsMD:
      "Lead with the edge-extraction rule, not with topological sort. Interviewers are testing whether you know what evidence a sorted dictionary actually provides. State the prefix invalid case explicitly before coding; it is the most common missed edge case. Use sets for adjacency so duplicate constraints do not corrupt indegrees, and remind the interviewer that any valid character order is acceptable.",
    followUps: [
      "Return the lexicographically smallest valid alien order by using a min-heap for zero-indegree letters.",
      "Detect whether the alien order is unique or whether multiple answers are possible.",
      "Support arbitrary Unicode symbols instead of only lowercase English letters.",
      "Given a proposed alphabet, verify whether the word list is sorted under it.",
    ],
    similarProblems: [
      {
        title: "Course Schedule II",
        difficulty: "Medium",
        slug: "graph-course-schedule-ii",
        note: "Same topological sort once letter constraints are extracted.",
      },
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Cycle detection in the dependency graph.",
      },
      {
        title: "Parallel Courses",
        difficulty: "Medium",
        slug: "graph-parallel-courses",
      },
      {
        title: "Verifying an Alien Dictionary",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/verifying-an-alien-dictionary/",
        note: "Checks a known order instead of inferring one.",
      },
    ],
    keyTakeaways: [
      "Adjacent sorted words reveal one edge from their first differing character only.",
      "A longer word before its own prefix is impossible and must return empty immediately.",
      "Topologically sort only characters that appear in the input.",
      "Duplicate edges must not increment indegree more than once.",
      "A shorter-than-seen output means a cycle in the inferred alphabet.",
    ],
    pattern:
      "Infer precedence edges from first differences, reject invalid prefixes, then Kahn-sort the seen characters and validate output length.",
  },
  {
    slug: "graph-parallel-courses",
    moduleId: "topological-sort",
    order: 14,
    title: "Parallel Courses",
    difficulty: "Medium",
    leetcodeUrl: "https://leetcode.com/problems/parallel-courses/",
    tags: ["Graph", "Topological Sort", "BFS"],
    companies: ["Google", "Amazon", "Microsoft", "Meta", "Bloomberg"],
    estimatedReadingMin: 8,
    estimatedSolvingMin: 20,
    statementMD:
      "There are **n** courses labelled **1..n** and a list **relations** where relations[i] = [prevCourse, nextCourse] means prevCourse must be completed before nextCourse.\n\nIn one semester, you may take **all** courses whose prerequisites have already been completed. Return the minimum number of semesters needed to complete every course, or **-1** if it is impossible because the prerequisite graph contains a cycle.",
    constraints: [
      "1 <= n <= 5000",
      "1 <= relations.length <= 5000",
      "relations[i].length == 2",
      "1 <= prevCourse, nextCourse <= n",
      "prevCourse != nextCourse",
      "All relation pairs are unique",
    ],
    inputMD:
      "An integer **n** and directed edges **relations** from prerequisite course to dependent course. Course labels are 1-based.",
    outputMD:
      "An integer: the minimum number of semesters to finish all courses, or -1 if a cycle makes completion impossible.",
    examples: [
      {
        input: "n = 3, relations = [[1,3],[2,3]]",
        output: "2",
        explanation:
          "Take courses 1 and 2 together in semester 1, then course 3 in semester 2.",
      },
      {
        input: "n = 3, relations = [[1,2],[2,3],[3,1]]",
        output: "-1",
        explanation:
          "The courses form a cycle, so none of the cycle can ever be completed first.",
      },
      {
        input: "n = 5, relations = [[1,5],[2,5],[3,5],[3,4],[4,5]]",
        output: "3",
        explanation:
          "Semester 1: 1,2,3. Semester 2: 4. Semester 3: 5, after all its prerequisites are done.",
      },
    ],
    learningObjectives: [
      "Interpret each layer of Kahn's BFS as one semester of parallel work.",
      "Minimise time by taking every currently available course immediately.",
      "Detect cycles with the same processed-count check used in Course Schedule.",
      "Handle 1-based course labels cleanly without off-by-one errors.",
    ],
    intuitionMD:
      "This is Course Schedule with a clock. The courses with zero remaining prerequisites are exactly the courses you can take **now**. Since there is no limit on how many available courses you can take in a semester, the greedy move is forced: take all of them immediately. Waiting cannot help, because delaying an available course can only delay courses that depend on it.\n\nThat turns Kahn's algorithm into a level-order BFS. The initial zero-indegree queue is semester 1. After processing the entire current queue, newly unlocked courses form the next semester. Counting BFS layers gives the minimum number of semesters.\n\nIf a cycle exists, the queue eventually empties before all courses are processed. The remaining courses are waiting on each other, so the correct answer is -1.",
    commonMistakes: [
      "Incrementing semesters for every course instead of every BFS layer.",
      "Processing newly unlocked courses in the same semester. A course unlocked by work this semester can only be taken next semester.",
      "Forgetting that course labels are 1..n, not 0..n - 1.",
      "Returning the semester count without checking whether all courses were processed.",
      "Taking only one zero-indegree course per semester, which misses the parallelism and overestimates the answer.",
    ],
    algorithmMD:
      "1. Build adjacency lists from each prerequisite course to the courses it unlocks, and count indegrees.\n2. Enqueue every course with indegree 0. These courses can all be taken in semester 1.\n3. While the queue is not empty, record its current size. That fixed-size batch is one semester.\n4. Process exactly that many courses, decrementing indegrees of dependent courses. Any course that becomes zero-indegree is enqueued for the next semester.\n5. Increment the semester count after each batch and track how many courses were processed.\n6. Return semesters if processed == n; otherwise return -1 because a cycle prevented completion.",
    solutions: [
      {
        name: "Level-order Kahn's BFS",
        approachMD:
          "Run Kahn's algorithm by layers instead of individual nodes. Each layer contains all courses currently available, so each layer corresponds to one semester.",
        walkthroughMD:
          "1. Allocate graph for labels 1..n and indegree for the same range.\n2. Add every relation prev → next and increment indegree[next].\n3. Queue all courses with indegree 0.\n4. For each semester, process the queue's current size only. Those courses are taken together.\n5. Newly zero-indegree courses are enqueued but not processed until the next outer loop iteration.\n6. After BFS, return the number of layers if all n courses were processed; otherwise return -1.",
        complexity: {
          time: "O(V + E)",
          space: "O(V + E)",
          note: "V is n and E is relations.length; adjacency, indegree, and queue are linear.",
        },
        filename: "Solution.java",
        code: `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

class Solution {

    public int minimumSemesters(int n, int[][] relations) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int course = 0; course <= n; course++) {
            graph.add(new ArrayList<>());
        }

        int[] indegree = new int[n + 1];
        for (int[] relation : relations) {
            int before = relation[0];
            int next = relation[1];
            graph.get(before).add(next);
            indegree[next]++;
        }

        Queue<Integer> queue = new ArrayDeque<>();
        for (int course = 1; course <= n; course++) {
            if (indegree[course] == 0) {
                queue.offer(course);
            }
        }

        int semesters = 0;
        int completed = 0;
        while (!queue.isEmpty()) {
            int coursesThisSemester = queue.size();
            semesters++;
            for (int i = 0; i < coursesThisSemester; i++) {
                int course = queue.poll();
                completed++;
                for (int next : graph.get(course)) {
                    indegree[next]--;
                    if (indegree[next] == 0) {
                        queue.offer(next);
                    }
                }
            }
        }
        return completed == n ? semesters : -1;
    }
}`,
      },
    ],
    dryRun: {
      inputMD:
        "n = 5, relations = [[1,5],[2,5],[3,5],[3,4],[4,5]]. Indegree: 1=0, 2=0, 3=0, 4=1, 5=4.",
      columns: ["Semester", "Courses taken", "Edges relaxed", "New queue", "Completed total"],
      rows: [
        ["1", "[1,2,3]", "1→5, 2→5, 3→5, 3→4", "[4]", "3"],
        ["2", "[4]", "4→5", "[5]", "4"],
        ["3", "[5]", "none", "[]", "5"],
      ],
      narrativeMD:
        "The BFS has three layers, so three semesters are necessary and sufficient. Course 5 cannot be taken until semester 3 because course 4 is one of its prerequisites and only unlocks after semester 1.",
    },
    interviewTipsMD:
      "Emphasise the greedy proof: because unlimited available courses can be taken together, there is never a reason to postpone a zero-indegree course. The implementation detail interviewers watch for is the fixed queue size per semester; without that boundary, you accidentally take newly unlocked courses too early. End with the processed-count cycle check, exactly like Course Schedule.",
    followUps: [
      "What if each semester can contain at most k courses? The problem becomes harder and may need bitmask DP for small n.",
      "What if each course has a duration and you want the earliest completion time? Use longest path DP on a DAG.",
      "Return the actual list of courses taken in each semester.",
      "How would you update the answer if a new prerequisite relation is added?",
    ],
    similarProblems: [
      {
        title: "Course Schedule",
        difficulty: "Medium",
        slug: "graph-course-schedule",
        note: "Same cycle detection without semester counting.",
      },
      {
        title: "Course Schedule II",
        difficulty: "Medium",
        slug: "graph-course-schedule-ii",
        note: "Returns one topological order rather than layer count.",
      },
      {
        title: "Alien Dictionary",
        difficulty: "Hard",
        slug: "graph-alien-dictionary",
      },
      {
        title: "Parallel Courses II",
        difficulty: "Hard",
        url: "https://leetcode.com/problems/parallel-courses-ii/",
        note: "Adds a cap on courses per semester, changing the strategy.",
      },
    ],
    keyTakeaways: [
      "When all available courses can be taken together, each Kahn BFS layer is one semester.",
      "Process a fixed queue size per layer so newly unlocked courses wait for the next semester.",
      "Taking all zero-indegree courses immediately is optimal because delaying cannot unlock anything earlier.",
      "If processed courses are fewer than n, a cycle makes completion impossible.",
    ],
    pattern:
      "Layered topological sort: process all current zero-indegree nodes as one time step, enqueue newly unlocked nodes for the next step, and verify all nodes finish.",
  },
];
