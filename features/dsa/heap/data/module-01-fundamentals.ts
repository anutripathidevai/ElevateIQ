import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "heap-min-heap",
    moduleId: "heap-fundamentals",
    order: 1,
    title: "Min Heap",
    estimatedReadingMin: 8,
    tags: ["Heap", "Min Heap", "Array Layout"],
    summaryMD:
      "A min heap is a complete binary tree stored compactly in an array, with the smallest value always available at the root.",
    sections: [
      {
        heading: "The Shape and the Property",
        bodyMD:
          "A min heap combines two separate guarantees. The shape guarantee is that the tree is **complete**: every level is full except possibly the last, and the last level is filled from left to right. The ordering guarantee is the **min-heap property**: every parent value is less than or equal to each of its children.\n\nTogether, these guarantees make the minimum easy to find. Because every edge points from a smaller or equal parent to a larger or equal child, no descendant can be smaller than the root. The root is therefore the minimum element, so **peek()** is **O(1)**.",
      },
      {
        heading: "Array Layout",
        bodyMD:
          "Heaps are usually stored in an array rather than pointer nodes. For zero-based index **i**, the left child lives at **2i+1**, the right child at **2i+2**, and the parent at **(i-1)/2** using integer division. A heap such as **[1,3,5,4]** represents root **1**, children **3** and **5**, and **4** as the left child of **3**.\n\nThis layout works because the tree is complete. There are no interior gaps, so level-order positions map directly to contiguous array indices. That is why heaps have excellent memory locality and why operations can move through the tree with index arithmetic instead of object references.",
      },
      {
        heading: "Insert With Sift-Up",
        bodyMD:
          "To insert into a min heap, append the new value at the end of the array. This preserves the complete-tree shape immediately, but it may violate the min-heap property with its parent. The repair is **sift-up**: while the new value is smaller than its parent, swap it with the parent and continue upward.\n\nOnly one root-to-leaf path can be affected. A complete binary tree with **n** nodes has height **O(log n)**, so insertion is **O(log n)** time. The array may occasionally resize, but the heap-order work remains logarithmic.",
      },
      {
        heading: "Extract-Min With Sift-Down",
        bodyMD:
          "To remove the minimum, take the root value, move the last array element into the root position, shrink the heap size, and repair downward. The shape remains complete because the removed physical slot was the last level-order position.\n\nThe repair is **sift-down**: compare the moved value with its smaller child, swap with that child if needed, and continue until both children are no smaller or the node becomes a leaf. Like insertion, extract-min touches one downward path, so it is **O(log n)** time.",
      },
    ],
    codeExamples: [
      {
        title: "Min-heap sift-up in an array",
        language: "java",
        code: `import java.util.Arrays;

class Solution {
    private int[] heap = new int[8];
    private int size = 0;

    void offer(int value) {
        ensureCapacity();
        heap[size] = value;
        siftUp(size);
        size++;
    }

    int peek() {
        if (size == 0) {
            throw new IllegalStateException("empty heap");
        }
        return heap[0];
    }

    int[] snapshot() {
        return Arrays.copyOf(heap, size);
    }

    private void siftUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (heap[parent] <= heap[index]) {
                break;
            }
            swap(parent, index);
            index = parent;
        }
    }

    private void ensureCapacity() {
        if (size == heap.length) {
            heap = Arrays.copyOf(heap, heap.length * 2);
        }
    }

    private void swap(int a, int b) {
        int temp = heap[a];
        heap[a] = heap[b];
        heap[b] = temp;
    }
}`,
        captionMD:
          "Appending preserves the complete-tree shape; **siftUp** restores the min-heap property by walking through parent indices **(i-1)/2**.",
      },
    ],
    keyTakeaways: [
      "A min heap is a complete binary tree where every parent is less than or equal to its children.",
      "The array layout maps index **i** to children **2i+1** and **2i+2**, with parent **(i-1)/2**.",
      "The root stores the minimum, so **peek()** is **O(1)**.",
      "Insert uses **sift-up** and extract-min uses **sift-down**, each costing **O(log n)**.",
    ],
  },
  {
    kind: "concept",
    slug: "heap-max-heap",
    moduleId: "heap-fundamentals",
    order: 2,
    title: "Max Heap",
    estimatedReadingMin: 7,
    tags: ["Heap", "Max Heap", "Comparator", "Java"],
    summaryMD:
      "A max heap mirrors a min heap by keeping every parent greater than or equal to its children, so the maximum value is always at the root.",
    sections: [
      {
        heading: "The Mirror Invariant",
        bodyMD:
          "A max heap has the same complete-tree shape as a min heap, but the comparison is reversed. Every parent must be greater than or equal to each child, so values get no larger as you move downward. The root is therefore the maximum element.\n\nThe array layout is unchanged: index **i** has children **2i+1** and **2i+2**, and parent **(i-1)/2**. Only the direction of comparison changes. For example, **[9,7,8,2,6]** is a valid max heap because each parent dominates its children, even though the array is not globally sorted.",
      },
      {
        heading: "Operations Are Symmetric",
        bodyMD:
          "Insertion appends the new value and then **sift-up** swaps while the child is larger than the parent. Removing the maximum swaps the root with the last element, shrinks the heap, and **sift-down** swaps with the larger child until the property is restored.\n\nThe height argument is the same as for a min heap. A complete tree with **n** elements has height **O(log n)**, so **offer()** and **poll()** are **O(log n)**, while **peek()** remains **O(1)**.",
      },
      {
        heading: "Java PriorityQueue as a Max Heap",
        bodyMD:
          "Java's **PriorityQueue** is a min heap by default, so the smallest item according to the comparator is returned first. To model a max heap, reverse the natural order with **Collections.reverseOrder()** or provide a comparator that treats larger values as higher priority.\n\nAvoid subtraction comparators such as **b - a** when values can be large. Integer overflow can reverse the ordering and silently corrupt the heap. Prefer **Integer.compare(b, a)** for descending integer order or a comparator built from safe comparison helpers.",
      },
      {
        heading: "When Max Heaps Appear",
        bodyMD:
          "Max heaps are useful when the largest remaining item should be served next, such as repeatedly taking the most frequent task, the largest profit, or the current upper half boundary in a median structure. They are also used as the opposite half of a two-heap design.\n\nIn top-k interviews, be careful with direction. To keep the **k** largest items efficiently, a size-**k** min heap is often better than a max heap because the root is the smallest kept item. A max heap is right when you truly need to remove the largest next.",
      },
    ],
    codeExamples: [
      {
        title: "PriorityQueue configured as a max heap",
        language: "java",
        code: `import java.util.PriorityQueue;

class Demo {
    int[] drainLargestFirst(int[] values) {
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));
        for (int value : values) {
            maxHeap.offer(value);
        }

        int[] result = new int[values.length];
        int index = 0;
        while (!maxHeap.isEmpty()) {
            result[index] = maxHeap.poll();
            index++;
        }
        return result;
    }
}`,
        captionMD:
          "The comparator uses **Integer.compare(b, a)** instead of subtraction, so large positive and negative values cannot overflow the ordering logic.",
      },
    ],
    keyTakeaways: [
      "A max heap keeps every parent greater than or equal to its children, putting the maximum at the root.",
      "The same array formulas apply: children **2i+1**, **2i+2**, and parent **(i-1)/2**.",
      "Java **PriorityQueue** becomes a max heap with **Collections.reverseOrder()** or a safe reversed comparator.",
      "Use **Integer.compare** instead of subtraction when writing comparators that may see large values.",
    ],
  },
  {
    kind: "concept",
    slug: "heap-priority-queue",
    moduleId: "heap-fundamentals",
    order: 3,
    title: "Priority Queue",
    estimatedReadingMin: 8,
    tags: ["Priority Queue", "Heap", "Java", "Comparator"],
    summaryMD:
      "A priority queue is an abstract data type for serving the highest-priority item first, while a heap is the most common implementation behind that behavior.",
    sections: [
      {
        heading: "ADT First, Heap Second",
        bodyMD:
          "A priority queue describes behavior, not a specific representation. It supports adding an item with **offer()**, inspecting the next item with **peek()**, and removing the next item with **poll()** according to priority. The user of the data type should think in priorities, not tree rotations or array indices.\n\nA binary heap is the usual implementation because it gives the right trade-off for interviews: **O(log n)** insertion, **O(log n)** removal of the next priority item, and **O(1)** peek. Other implementations exist, but the heap is the default mental model unless a prompt asks for something more specialized.",
      },
      {
        heading: "Java PriorityQueue Defaults",
        bodyMD:
          "Java's **java.util.PriorityQueue** is a binary min heap by default. For numbers, **peek()** and **poll()** return the smallest number first. For custom objects, the queue uses either the objects' natural ordering or a comparator passed to the constructor.\n\nThis default matters because many interview phrases are written from the opposite direction. For **k** largest elements, a min heap of kept candidates is often intentional; for repeatedly serving the largest value, you must reverse the comparator.",
      },
      {
        heading: "Priority Is Defined by the Comparator",
        bodyMD:
          "The comparator is the contract that defines which item should come first. A lower comparison result means the first argument has higher queue priority in Java's min-heap implementation. You can prioritize smaller numbers, larger numbers, earlier deadlines, shorter processing times, or compound keys such as frequency first and value second.\n\nComparator consistency is not optional. If the comparator is unstable, overflows, or ignores tie-breakers needed by the problem, the queue can still run but return the wrong item for equal-looking priorities.",
      },
      {
        heading: "Iteration Is Not Sorted Order",
        bodyMD:
          "A **PriorityQueue** only promises that the next **peek()** or **poll()** is the highest-priority item. It does not promise that iterating through the internal array visits items in sorted order. A heap array such as **[1,3,2,9,7]** satisfies local parent-child rules without being globally sorted.\n\nIf you need sorted output, repeatedly call **poll()** until the queue is empty, or copy the items into a separate collection and sort them. Do not write logic that depends on the enhanced for-loop order of a priority queue.",
      },
    ],
    codeExamples: [
      {
        title: "Basic offer, peek, and poll usage",
        language: "java",
        code: `import java.util.PriorityQueue;

class Demo {
    int[] drainAscending(int[] values) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int value : values) {
            pq.offer(value);
        }

        Integer first = pq.peek();
        int[] result = new int[values.length];
        int index = 0;
        while (!pq.isEmpty()) {
            result[index] = pq.poll();
            index++;
        }

        if (first != null && result.length > 0 && result[0] != first) {
            throw new IllegalStateException("peek changed the queue");
        }
        return result;
    }
}`,
        captionMD:
          "The default queue returns smaller integers first. **peek()** observes the current root, while **poll()** removes it and restores the heap internally.",
      },
    ],
    keyTakeaways: [
      "A priority queue is an abstract behavior; a heap is a common implementation of that behavior.",
      "Java **PriorityQueue** is a min heap by default, so the smallest item by comparator comes out first.",
      "Use comparators to encode custom priority, including tie-breakers required by the prompt.",
      "Priority queue iteration is not sorted; drain with **poll()** when sorted priority order is required.",
    ],
  },
  {
    kind: "concept",
    slug: "heap-heapify",
    moduleId: "heap-fundamentals",
    order: 4,
    title: "Heapify",
    estimatedReadingMin: 8,
    tags: ["Heap", "Heapify", "Sift Down", "Invariant"],
    summaryMD:
      "Heapify is the local sift-down repair that restores the heap property at one index when its child subtrees are already valid heaps.",
    sections: [
      {
        heading: "The Local Repair Problem",
        bodyMD:
          "In most interview discussions, **heapify** means **sift-down** from one node. The situation is local: the left and right child subtrees are already heaps, but the value at the current index may be too large for a min heap or too small for a max heap.\n\nBecause the child subtrees are valid, the only possible violation lies on a downward path. Fix the current node against the better child, then repeat in the child position where the moved value landed.",
      },
      {
        heading: "Choosing the Child",
        bodyMD:
          "For a min heap, compare the current value with the smaller child. If the current value is less than or equal to both children, the min-heap property holds and the repair stops. Otherwise, swap with the smaller child, because that child is the only one that can safely become the parent of both child positions.\n\nFor a max heap, reverse the comparison and swap with the larger child. The shape never changes during heapify; only values move within the same array positions such as **[7,3,5,4]** becoming **[3,4,5,7]** after repeated downward swaps.",
      },
      {
        heading: "Why It Is O(log n)",
        bodyMD:
          "Each swap moves the candidate value down exactly one level. A complete binary tree with **n** elements has height **O(log n)**, so a single sift-down can perform at most **O(log n)** swaps and comparisons.\n\nThis bound is used by **poll()** after the last element is moved to the root. It is also the primitive used by build-heap, where the same local repair is applied to many internal nodes in a carefully chosen order.",
      },
      {
        heading: "Invariant to State in Interviews",
        bodyMD:
          "A strong explanation says what is already true before heapify starts: both child subtrees satisfy the heap property. After each swap, the parent position is fixed, and any remaining violation moves down into exactly one child subtree. When the loop stops, no violation remains.\n\nThat invariant prevents a common mistake: trying to sort the whole array during heapify. Heapify does not make the array sorted. It restores local heap order, which is enough for priority queue operations.",
      },
    ],
    codeExamples: [
      {
        title: "Sift-down heapify for a min heap",
        language: "java",
        code: `class Solution {
    void siftDown(int[] heap, int index, int size) {
        while (true) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int smallest = index;

            if (left < size && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < size && heap[right] < heap[smallest]) {
                smallest = right;
            }
            if (smallest == index) {
                break;
            }

            swap(heap, index, smallest);
            index = smallest;
        }
    }

    private void swap(int[] heap, int a, int b) {
        int temp = heap[a];
        heap[a] = heap[b];
        heap[b] = temp;
    }
}`,
        captionMD:
          "The helper assumes the child subtrees are already heaps. It repeatedly swaps with the smaller child until the current index satisfies the min-heap property.",
      },
    ],
    keyTakeaways: [
      "Heapify usually means a local **sift-down** repair from one array index.",
      "For a min heap, swap with the smaller child; for a max heap, swap with the larger child.",
      "A single heapify is **O(log n)** because it moves down at most one tree height.",
      "Heapify restores heap order, not sorted array order.",
    ],
  },
  {
    kind: "concept",
    slug: "heap-build-heap",
    moduleId: "heap-fundamentals",
    order: 5,
    title: "Build Heap",
    estimatedReadingMin: 9,
    tags: ["Heap", "Build Heap", "Heapify", "Complexity"],
    summaryMD:
      "Build heap turns an unordered array into a heap in linear time by sift-down repairs from the last internal node back to the root.",
    sections: [
      {
        heading: "Bottom-Up Construction",
        bodyMD:
          "Given an unordered array, build-heap treats it as the level-order layout of a complete binary tree and repairs it bottom-up. All leaves are already valid heaps of size one, so the first useful repair starts at the last internal node: index **n/2 - 1**.\n\nFrom there, apply **sift-down** at each index moving backward to **0**. By the time a node is repaired, both of its child subtrees have already been repaired. That is exactly the precondition heapify needs.",
      },
      {
        heading: "Why Start at n/2 - 1",
        bodyMD:
          "In a zero-based heap array, any index greater than or equal to **n/2** has no left child because **2i+1 >= n**. Those positions are leaves. Calling heapify on leaves would do nothing, so build-heap begins at **n/2 - 1**, the parent of the last element or near it.\n\nFor **[9,4,7,1,3,6]**, indices **3**, **4**, and **5** are leaves. The loop starts at index **2**, then **1**, then **0**, gradually turning the whole array into a valid min heap such as **[1,3,6,4,9,7]** depending on equal-choice details.",
      },
      {
        heading: "Why It Is O(n), Not O(n log n)",
        bodyMD:
          "A loose argument says there are **n** nodes and each heapify is **O(log n)**, but that overcounts. Most nodes are near the bottom and can move only a few levels. About half the nodes are leaves with height **0**, about a quarter have height **1**, about an eighth have height **2**, and so on.\n\nThe total work is proportional to **n/2 * 0 + n/4 * 1 + n/8 * 2 + n/16 * 3 + ...**, which sums to **O(n)**. The small number of tall nodes cannot dominate the many short repairs. This is the key build-heap proof interviewers expect.",
      },
      {
        heading: "Build Heap vs Repeated Insert",
        bodyMD:
          "Repeatedly inserting **n** elements into an empty heap costs **O(n log n)** because every insertion may climb a logarithmic path. Bottom-up build-heap is better when all elements are already available because it exploits the existing complete-tree layout and the fact that leaves need no work.\n\nUse repeated **offer()** when data arrives online. Use build-heap when the array is known upfront, such as heap sort initialization, converting a batch into a priority queue, or implementing a custom heap from raw input.",
      },
    ],
    codeExamples: [
      {
        title: "Bottom-up build heap loop",
        language: "java",
        code: `class Solution {
    void buildMinHeap(int[] values) {
        for (int index = values.length / 2 - 1; index >= 0; index--) {
            siftDown(values, index, values.length);
        }
    }

    private void siftDown(int[] heap, int index, int size) {
        while (true) {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int smallest = index;

            if (left < size && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < size && heap[right] < heap[smallest]) {
                smallest = right;
            }
            if (smallest == index) {
                break;
            }

            swap(heap, index, smallest);
            index = smallest;
        }
    }

    private void swap(int[] heap, int a, int b) {
        int temp = heap[a];
        heap[a] = heap[b];
        heap[b] = temp;
    }
}`,
        captionMD:
          "The loop visits only internal nodes, from the last parent back to the root, so each **siftDown** sees already-heapified child subtrees.",
      },
    ],
    keyTakeaways: [
      "Build heap starts at **n/2 - 1** because indices **n/2** through **n - 1** are leaves.",
      "Processing backward guarantees each node's child subtrees are valid heaps before it is heapified.",
      "Bottom-up build-heap is **O(n)** because most nodes have very small height.",
      "Use build-heap for batch construction and repeated **offer()** for online arrivals.",
    ],
  },
];