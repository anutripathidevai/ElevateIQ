import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "ll-singly-linked-list",
    moduleId: "ll-fundamentals",
    order: 1,
    title: "Singly Linked List",
    estimatedReadingMin: 7,
    tags: ["Linked List", "Pointers", "Memory"],
    summaryMD:
      "A singly linked list is a chain of nodes where each node stores a value and one pointer to the next node, trading random access for cheap local rewiring.",
    sections: [
      {
        heading: "The Core Shape",
        bodyMD:
          "A singly linked list is built from nodes shaped like **{val, next}**. The **val** stores the payload, and **next** points to the following node or **null** at the end. The entire structure is reached through a **head** pointer, so losing **head** means losing access to the list.\n\nThink of the list as **head -> 1 -> 2 -> 3 -> null**. The arrows are not positions inside one block of memory. They are references from one object to another, which means traversal follows links instead of doing address arithmetic.",
      },
      {
        heading: "Traversal Replaces Indexing",
        bodyMD:
          "A singly linked list has no random access. To reach the third real node in **1 -> 2 -> 3 -> null**, you must start at **head**, follow **next** to **2**, then follow **next** again to **3**. Access by position is therefore **O(n)**, not **O(1)**.\n\nThis is the most important contrast with arrays. An array can jump to **arr[i]** because indices map to addresses. A linked list can only move from the current node to the next node it references. That makes sequential scans natural and repeated index lookups expensive.",
      },
      {
        heading: "Cheap Local Rewiring",
        bodyMD:
          "The reward for giving up random access is cheap pointer rewiring. If you already have the previous node, inserting after it is **O(1)**: point the new node at the old successor, then point the previous node at the new node. Deleting after a previous node is also **O(1)**: skip the removed node by assigning **prev.next** to **prev.next.next**.\n\nThe phrase given the node or previous node matters. Finding that location may still cost **O(n)**. Interviews often test whether you separate the traversal cost from the local mutation cost.",
      },
      {
        heading: "Arrays vs Linked Lists",
        bodyMD:
          "Arrays are strong when you need random access, binary search over sorted data, compact memory, and cache-friendly scans. Linked lists are strong when the algorithm already holds the node to change and needs many local insertions or deletions without shifting a suffix of elements.\n\nIn practice, linked lists are less common than arrays for raw storage because pointer chasing has overhead. Interviewers reach for them because they reveal whether you can reason about object identity, aliasing, **null**, and pointer update order without losing part of the structure.",
      },
    ],
    codeExamples: [
      {
        title: "Minimal singly linked list node",
        language: "java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
    }

    ListNode(int val, ListNode next) {
        this.val = val;
        this.next = next;
    }
}`,
        captionMD:
          "This is the LeetCode-style shape most linked list problems assume: a value, a **next** pointer, and **null** marking the end.",
      },
    ],
    keyTakeaways: [
      "A singly linked list is reached through **head** and each node points only to **next**.",
      "Position-based access is **O(n)** because traversal must follow links from the front.",
      "Insertion or deletion is **O(1)** only after the relevant node or previous node is already known.",
      "Linked lists are interview favorites because pointer order and **null** handling expose reasoning mistakes quickly.",
    ],
  },
  {
    kind: "concept",
    slug: "ll-doubly-linked-list",
    moduleId: "ll-fundamentals",
    order: 2,
    title: "Doubly Linked List",
    estimatedReadingMin: 7,
    tags: ["Linked List", "Doubly Linked List", "Design"],
    summaryMD:
      "A doubly linked list gives each node both **prev** and **next**, enabling constant-time removal from the middle when the node itself is already known.",
    sections: [
      {
        heading: "Two Directions Per Node",
        bodyMD:
          "A doubly linked list node is shaped like **{val, prev, next}**. The **next** pointer moves forward, and the **prev** pointer moves backward. Drawn in the forward direction, the list is **head -> 1 -> 2 -> 3 -> null**, while the **prev** pointers point back from **3** to **2**, **2** to **1**, and **1** to **null**.\n\nThis two-way structure makes traversal flexible. From a middle node, you can move to its successor or predecessor without returning to **head**. That extra reach is exactly what many design problems need.",
      },
      {
        heading: "Why Deletion Becomes Easier",
        bodyMD:
          "In a singly linked list, deleting a known node usually requires the previous node so you can reconnect around it. In a doubly linked list, the node carries that previous pointer itself. Given only the node, you can connect **node.prev.next** to **node.next** and connect **node.next.prev** back to **node.prev**.\n\nThat makes deletion **O(1)** when the node is already known. The operation is local, but it has two sides. Forgetting either side leaves a broken chain that may still appear correct in one traversal direction and fail in the other.",
      },
      {
        heading: "Where Interviews Use It",
        bodyMD:
          "Doubly linked lists appear in cache and navigation designs. In an LRU cache, the list stores items from most recently used to least recently used, while a HashMap stores key to node. Access moves a node to the front in **O(1)**, and eviction removes the tail in **O(1)**. LFU designs often combine frequency buckets with doubly linked lists for the same reason.\n\nBrowser history is another natural example. Moving back follows **prev**; moving forward follows **next**. The structure models bidirectional navigation directly instead of forcing a stack-only view.",
      },
      {
        heading: "The Cost of Extra Power",
        bodyMD:
          "The trade-off is memory and bookkeeping. Every node stores one extra pointer, and every insert or delete must maintain more relationships. For insertion between **a** and **b**, the new node must point to both neighbors, **a.next** must point forward to the new node, and **b.prev** must point back to it.\n\nThat extra complexity is worthwhile when nodes are frequently moved or removed from the middle. If the task only scans forward and rarely mutates local nodes, a singly linked list is simpler and usually enough.",
      },
    ],
    codeExamples: [
      {
        title: "Minimal doubly linked list node",
        language: "java",
        code: `class Node {
    int val;
    Node prev;
    Node next;

    Node(int val) {
        this.val = val;
    }
}`,
        captionMD:
          "A doubly linked node stores both directions, which is what allows **O(1)** removal after a cache or history map hands you the node.",
      },
    ],
    keyTakeaways: [
      "A doubly linked list node has **val**, **prev**, and **next** fields.",
      "Given only the node, middle deletion can be **O(1)** because the predecessor is stored on the node.",
      "LRU, LFU, and browser-history designs use doubly linked lists to move or remove known nodes quickly.",
      "The extra pointer improves flexibility but increases memory use and mutation bookkeeping.",
    ],
  },
  {
    kind: "concept",
    slug: "ll-circular-linked-list",
    moduleId: "ll-fundamentals",
    order: 3,
    title: "Circular Linked List",
    estimatedReadingMin: 7,
    tags: ["Linked List", "Circular List", "Traversal"],
    summaryMD:
      "A circular linked list connects the tail back to the head, turning a linear chain into a ring where traversal ends by returning to the start rather than reaching **null**.",
    sections: [
      {
        heading: "A Ring Instead of a Line",
        bodyMD:
          "In a circular linked list, the last node does not point to **null**. Its **next** pointer points back to **head**, so the shape is **1 -> 2 -> 3 -> 1**. The same idea can be applied to singly linked lists or doubly linked lists, where the tail and head are connected in both directions.\n\nThis changes the meaning of the boundary. There is no natural **null** at the end of a non-empty ring. A pointer can keep moving forever unless the algorithm remembers where it started or how many nodes it has processed.",
      },
      {
        heading: "Traversal Termination",
        bodyMD:
          "The key rule is stop when you return to **head**, not when you see **null**. A common traversal starts at **head**, processes the current node, moves to **current.next**, and continues while **current != head**. Empty-list handling still checks whether **head** is **null** before entering the ring.\n\nThis termination rule is also the source of many bugs. If the loop condition checks **current != null**, the loop never ends. If it checks **current != head** before processing the first node, it may skip the entire list. Decide whether your loop is do-first or check-first and keep it consistent.",
      },
      {
        heading: "Where Rings Are Useful",
        bodyMD:
          "Circular lists model repeated turns. Round-robin scheduling can keep a pointer to the current process and advance to the next process after each time slice. Ring buffers use a circular idea over array indices, wrapping the write or read position back to the beginning when capacity is reached.\n\nThey also appear in Josephus-style problems: people stand in a circle, every **k**-th person is removed, and counting continues from the next person. Even if you solve Josephus with math or arrays, the circular-list framing explains why the pointer never falls off an end.",
      },
      {
        heading: "Tail Pointers and Insertions",
        bodyMD:
          "Many circular-list implementations keep a **tail** pointer instead of only **head**. When **tail.next** is **head**, appending after **tail** is local: set the new node's **next** to **head**, set **tail.next** to the new node, then move **tail** to the new node.\n\nWith only **head**, finding the tail still requires a full loop. As with ordinary linked lists, the asymptotic win depends on which pointer the algorithm already maintains.",
      },
    ],
    keyTakeaways: [
      "A circular linked list has **tail.next** point back to **head** instead of **null**.",
      "Traversal must stop after returning to the start or after a known number of nodes.",
      "Round-robin scheduling, ring buffers, and Josephus-style counting all match the circular mental model.",
      "Keeping a **tail** pointer makes end insertions local because **tail.next** already identifies **head**.",
    ],
  },
  {
    kind: "concept",
    slug: "ll-fast-slow-pointer",
    moduleId: "ll-fundamentals",
    order: 4,
    title: "Fast & Slow Pointer",
    estimatedReadingMin: 8,
    tags: ["Linked List", "Two Pointers", "Cycle Detection", "Middle"],
    summaryMD:
      "Fast and slow pointers solve linked-list position problems by letting two references move at different speeds through the same chain.",
    sections: [
      {
        heading: "The Pattern",
        bodyMD:
          "Fast and slow pointer is a two-pointer pattern for structures that are easy to traverse but expensive to index. The usual setup starts **slow** and **fast** at **head**. On each iteration, **slow** advances one step and **fast** advances two steps, as long as **fast** can safely move.\n\nBecause **fast** covers distance twice as quickly, the relationship between the two pointers reveals structure. When **fast** hits the end of **1 -> 2 -> 3 -> 4 -> 5 -> null**, **slow** is at the middle. If **fast** ever catches **slow** inside a list, the list contains a cycle.",
      },
      {
        heading: "Finding the Middle in One Pass",
        bodyMD:
          "The middle-node template moves **slow** by one and **fast** by two while **fast != null** and **fast.next != null**. When the loop ends, **slow** is at the middle. For odd length, it lands on the exact middle. For even length, this common version lands on the second middle.\n\nThe invariant is distance. After **t** loop iterations, **slow** has moved **t** steps and **fast** has moved **2t** steps. When **fast** has consumed the list, **slow** has consumed about half of it without a separate length pass.",
      },
      {
        heading: "Detecting Cycles with Floyd",
        bodyMD:
          "Floyd's cycle detection uses the same speed difference. In an acyclic list, **fast** eventually reaches **null**. In a cyclic list, **fast** keeps looping and gains one node per iteration on **slow** inside the cycle, so the two pointers must eventually meet.\n\nThe meeting point proves a cycle exists; a second phase can find the cycle entry by moving one pointer back to **head** and then advancing both one step at a time. They meet at the first node in the cycle because the distances align modulo the cycle length.",
      },
      {
        heading: "K-th From End as a Gap",
        bodyMD:
          "A related two-pointer version finds the **k**-th node from the end. Move **fast** exactly **k** steps ahead, then move **slow** and **fast** together until **fast** reaches **null**. The fixed gap means **slow** is now **k** nodes from the end.\n\nThis is the same idea in a different form: encode position information as a distance between pointers rather than as an index. It is especially useful when the list length is unknown or when a one-pass solution is required.",
      },
    ],
    codeExamples: [
      {
        title: "Reusable fast and slow pointer template",
        language: "java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
    }
}

class FastSlowPointerTemplate {
    ListNode middleNode(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        return slow;
    }

    boolean hasCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                return true;
            }
        }

        return false;
    }

    ListNode kthFromEnd(ListNode head, int k) {
        ListNode slow = head;
        ListNode fast = head;

        for (int i = 0; i < k; i++) {
            if (fast == null) {
                return null;
            }
            fast = fast.next;
        }

        while (fast != null) {
            slow = slow.next;
            fast = fast.next;
        }

        return slow;
    }
}`,
        captionMD:
          "The template uses speed or a fixed gap to turn missing index information into pointer distance.",
      },
    ],
    keyTakeaways: [
      "Fast and slow pointers advance through one list at different speeds or with a fixed gap.",
      "When **fast** reaches the end, **slow** can identify the middle in one pass.",
      "If **fast** catches **slow**, Floyd's algorithm proves that a cycle exists.",
      "For **k**-th from end, create a **k**-node gap and then move both pointers together.",
    ],
  },
  {
    kind: "concept",
    slug: "ll-dummy-node-pattern",
    moduleId: "ll-fundamentals",
    order: 5,
    title: "Dummy Node Pattern",
    estimatedReadingMin: 8,
    tags: ["Linked List", "Dummy Node", "Sentinel", "Splice"],
    summaryMD:
      "The dummy node pattern places a sentinel before the real head so insertions and deletions at the front use the same pointer logic as middle mutations.",
    sections: [
      {
        heading: "The Sentinel Before Head",
        bodyMD:
          "A dummy node is an extra node placed before the real list: **dummy -> head -> 1 -> 2 -> 3 -> null**. Its value is irrelevant. Its job is to guarantee that every real node has a previous pointer available, even if the real node is currently the head.\n\nThis turns head mutations into ordinary middle mutations. Instead of asking whether the node to delete is **head**, you keep **prev** at the node before **curr**. At the front, that node is simply **dummy**.",
      },
      {
        heading: "Why It Removes Special Cases",
        bodyMD:
          "Without a dummy node, deleting the first real node often requires a separate branch that updates **head** directly. Deleting later nodes updates **prev.next**. Two branches mean more code and more chances to forget one path.\n\nWith a dummy node, the deletion rule is always the same: when **curr** should be removed, set **prev.next = curr.next**. If **curr** was the original head, this updates **dummy.next**. Returning **dummy.next** gives the possibly changed head.",
      },
      {
        heading: "Where It Shows Up",
        bodyMD:
          "The dummy pattern is common in merge, remove-elements, partition, and k-group problems. Merge builds a result list by appending to a moving tail that starts at **dummy**. Remove-elements scans with **prev** and **curr**. Partition appends nodes into before and after chains that each start with a sentinel.\n\nReverse-nodes-in-k-group also benefits from a dummy because each reversed group may begin at the current head of the remaining list. The group can be reattached through a stable predecessor instead of constantly checking whether the overall head changed.",
      },
      {
        heading: "Pointer Discipline",
        bodyMD:
          "The dummy node does not remove the need for careful pointer order. When splicing, preserve the next node before moving **curr** if the later code still needs it. When appending to a result list, advance the tail after linking the chosen node. When partitioning, terminate the final chain so an old **next** pointer does not create a hidden cycle.\n\nThe benefit is uniformity. Once **dummy** exists, your algorithm can focus on one invariant: **prev** always points to the node before the part being examined or rewritten.",
      },
    ],
    codeExamples: [
      {
        title: "Tiny dummy-node splice",
        language: "java",
        code: `class ListNode {
    int val;
    ListNode next;

    ListNode(int val) {
        this.val = val;
    }
}

class DummySpliceExample {
    ListNode removeValue(ListNode head, int target) {
        ListNode dummy = new ListNode(0);
        dummy.next = head;

        ListNode prev = dummy;
        ListNode curr = head;

        while (curr != null) {
            if (curr.val == target) {
                prev.next = curr.next;
            } else {
                prev = curr;
            }
            curr = curr.next;
        }

        return dummy.next;
    }
}`,
        captionMD:
          "The same splice deletes the original head or any later node, and the final answer is always **dummy.next**.",
      },
    ],
    keyTakeaways: [
      "A dummy node is a sentinel before **head** that gives the first real node a stable predecessor.",
      "Return **dummy.next** because the real head may change during deletion, merge, or partition.",
      "The pattern removes separate head-case branches by making front mutations look like middle mutations.",
      "Use it in merge, remove-elements, partition, and k-group rewiring where head changes are common.",
    ],
  },
];
