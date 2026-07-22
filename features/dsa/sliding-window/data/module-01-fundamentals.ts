import type { DsaConceptLesson } from "../../types";

export const CONCEPTS: DsaConceptLesson[] = [
  {
    kind: "concept",
    slug: "sw-fixed-window",
    moduleId: "sw-fundamentals",
    order: 1,
    title: "Fixed Window",
    estimatedReadingMin: 7,
    tags: ["Sliding Window", "Fixed Size", "Arrays", "Java"],
    summaryMD:
      "A fixed window keeps exactly **k** contiguous elements in scope and updates its state by adding the entering element and removing the leaving element.",
    sections: [
      {
        heading: "What Fixed Means",
        bodyMD:
          "A fixed window problem gives you a constant size **k** and asks for something over every contiguous block of that size. The block may be a subarray of numbers or a substring of characters, but its length does not change while the algorithm runs. That single fact removes a lot of complexity: once the window has length **k**, every move right must be paired with one move left.\n\nThis is the cleanest version of sliding window because validity is automatic. You do not ask whether the window is too long, too short, or constraint-satisfying after each step. You only maintain the aggregate for the current block and compare it with the best answer seen so far.",
      },
      {
        heading: "The Slide Operation",
        bodyMD:
          "The slide is an exchange. When **right** moves to include a new element, the element at **right - k** is no longer inside the newest length-**k** window. Add the entering value first, then remove the leaving value once the window would become too large. The active window becomes the last **k** elements ending at **right**.\n\nThis is why fixed-window code often has one loop over **right** and a condition like **right >= k** for removal. The left boundary can be stored explicitly, but for a pure fixed-size window, **right - k + 1** already tells you where the window begins once it is full.",
      },
      {
        heading: "Why Updates Are O(1)",
        bodyMD:
          "A fixed window is powerful because the transition from one block to the next changes only two elements. A sum drops the leaving value and adds the entering value. A frequency array decrements one character and increments another. A count of vowels changes by checking only those two positions.\n\nThe mistake to avoid is recomputing the full block every time. Recomputing a length-**k** sum for each start index costs **O(nk)**. Maintaining the running state costs **O(n)** because each element enters once and leaves once.",
      },
      {
        heading: "Interview Signals",
        bodyMD:
          "Look for phrases like **size k**, **length k**, **every substring of length k**, **maximum average over k elements**, or **contains nearby duplicate within k indices**. These signals usually mean the window size is fixed and the main design question is which aggregate to maintain.\n\nFixed windows also appear inside harder problems. Permutation in String uses a fixed-length character window equal to the pattern length. Sliding Window Maximum uses a fixed-size window but needs a monotonic deque instead of a simple sum. The size is fixed, while the maintained data structure changes with the query.",
      },
    ],
    codeExamples: [
      {
        title: "Add entering, remove leaving",
        language: "java",
        code: `class Solution {
    public int maxSumOfSizeK(int[] nums, int k) {
        if (nums.length < k) {
            return 0;
        }

        int windowSum = 0;
        int best = Integer.MIN_VALUE;

        for (int right = 0; right < nums.length; right++) {
            windowSum += nums[right];

            if (right >= k) {
                windowSum -= nums[right - k];
            }

            if (right >= k - 1) {
                best = Math.max(best, windowSum);
            }
        }

        return best;
    }
}`,
        captionMD:
          "The window sum changes in constant time. After index **right** is processed, the current full window is exactly the **k** elements ending at **right**.",
      },
    ],
    keyTakeaways: [
      "Fixed-window problems keep the length exactly **k** after the first full window is formed.",
      "Each slide adds the entering element and removes the element that fell off the left side.",
      "The maintained state should update in **O(1)** whenever possible.",
      "The window size is fixed, but the aggregate may be a sum, count, frequency table, deque, or set.",
    ],
  },
  {
    kind: "concept",
    slug: "sw-variable-window",
    moduleId: "sw-fundamentals",
    order: 2,
    title: "Variable Window",
    estimatedReadingMin: 8,
    tags: ["Sliding Window", "Variable Size", "Invariants", "Two Pointers"],
    summaryMD:
      "A variable window changes size so the current contiguous range satisfies an invariant that can be restored by moving **left** forward.",
    sections: [
      {
        heading: "Window Size Is an Outcome",
        bodyMD:
          "In a variable-window problem, the size is not given. The algorithm discovers useful sizes while enforcing a condition. You may be asked for the longest substring with no repeated characters, the shortest subarray with sum at least a target, or the number of subarrays with at most **k** distinct values. In all of these, the window length is an output of the process, not an input.\n\nThe key question becomes: what makes the current window valid? Once that condition is clear, the algorithm alternates between expanding to discover more candidates and shrinking to repair or tighten the window.",
      },
      {
        heading: "The Invariant",
        bodyMD:
          "The invariant is the promise your window keeps at the point where you update the answer. Examples include **sum <= target**, **distinct count <= k**, **no character appears twice**, or **replacement cost <= k**. The invariant should be specific enough that the answer update becomes obvious.\n\nA strong variable-window explanation names the invariant in plain English before code. For longest-valid problems, update the best length after the repair loop has restored validity. For shortest-valid problems, update while the window is valid and shrink to see whether an even tighter answer exists.",
      },
      {
        heading: "Expand Then Repair",
        bodyMD:
          "Most variable-window templates move **right** exactly once per outer-loop iteration. That expansion includes a new element and may break the invariant. If the window becomes invalid, move **left** forward while undoing the leaving elements until validity returns.\n\nThis works when removing from the left cannot make the violation worse for the chosen condition. With positive numbers, removing values can reduce a too-large sum. With distinct counts, removing values can reduce the number of distinct keys. With duplicate-free substrings, removing characters can eliminate the extra copy.",
      },
      {
        heading: "Choosing What to Track",
        bodyMD:
          "The window state should answer validity quickly. A running sum handles positive-number sum limits. A set or frequency array handles uniqueness. A map from value to count handles distinct values. A maximum frequency can support replacement-style substring problems.\n\nDo not track the entire window if a compact summary is enough. Sliding window is valuable because it turns a contiguous range into a maintained state. The best state is small, cheap to update when endpoints move, and directly tied to the invariant.",
      },
    ],
    codeExamples: [
      {
        title: "Variable window with a repair loop",
        language: "java",
        code: `class Solution {
    public int longestAtMostTarget(int[] nums, int target) {
        int left = 0;
        int sum = 0;
        int best = 0;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];

            while (sum > target) {
                sum -= nums[left];
                left++;
            }

            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}`,
        captionMD:
          "For positive numbers, the invariant is **sum <= target**. The answer is updated only after the repair loop has made the window valid again.",
      },
    ],
    keyTakeaways: [
      "Variable windows let length change so the algorithm can search over many candidate ranges.",
      "The invariant defines when the current range is usable for the answer.",
      "The standard flow is expand with **right**, repair with **left**, then update the answer at the correct moment.",
      "Choose window state that makes validity checks and endpoint updates cheap.",
    ],
  },
  {
    kind: "concept",
    slug: "sw-expanding-window",
    moduleId: "sw-fundamentals",
    order: 3,
    title: "Expanding the Window",
    estimatedReadingMin: 7,
    tags: ["Sliding Window", "Expansion", "Right Pointer"],
    summaryMD:
      "Expanding the window means advancing **right** to include new information before deciding whether the current state needs repair or can produce answers.",
    sections: [
      {
        heading: "Right Pointer Does the Discovery",
        bodyMD:
          "The **right** pointer is the discovery pointer. Every time it moves, the algorithm learns what happens when one more element joins the current contiguous range. That new element can improve an aggregate, create a violation, satisfy a missing requirement, or unlock many windows ending at the same position.\n\nA reliable mental model is to process the array as a stream. At each step, the next item arrives on the right. You update the window state immediately, then decide whether the current range is valid, invalid, complete, or worth shrinking.",
      },
      {
        heading: "When to Grow",
        bodyMD:
          "You grow when you still need more information. For longest-valid problems, every position should be tried as a possible right end because a later element may produce a longer range. For shortest-covering problems, you grow until the window finally satisfies all required conditions. For counting-at-most problems, each expansion creates a batch of valid suffixes after repair.\n\nGrowth should be monotonic. Do not reset **right** back to **left + 1** for every start index. That recreates the quadratic brute force. Sliding window earns linear time by letting each right endpoint enter exactly once.",
      },
      {
        heading: "What Expansion Changes",
        bodyMD:
          "Expansion must update every piece of state that depends on membership. Add to the sum, increment the character count, insert into the map, update the number of distinct keys, or push into the deque. If a later shrink removes the element, the inverse update should be equally clear.\n\nThis symmetry is important for correctness. If entering a value increments **distinct** when its count becomes one, leaving a value must decrement **distinct** when its count becomes zero. A broken inverse update usually causes windows to appear valid or invalid long after the boundaries have moved.",
      },
      {
        heading: "Expansion Mistakes",
        bodyMD:
          "The most common mistake is updating the answer too early. If expansion can make the window invalid, wait until after the shrink loop before recording a longest-valid length. Another mistake is expanding only while the current window is valid; that can skip right endpoints that become valid again after shrinking.\n\nA third mistake is assuming growth always improves the answer. For shortest-window problems, growth is necessary to reach validity, but the answer is usually improved by shrinking after the requirement is met.",
      },
    ],
    codeExamples: [
      {
        title: "Every right endpoint enters once",
        language: "java",
        code: `class Solution {
    public long countSubarraysAtMostTarget(int[] nums, int target) {
        int left = 0;
        int sum = 0;
        long count = 0;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];

            while (sum > target) {
                sum -= nums[left];
                left++;
            }

            count += right - left + 1;
        }

        return count;
    }
}`,
        captionMD:
          "After expanding to **right** and repairing the sum, every start from **left** through **right** forms a valid subarray ending at **right** for positive inputs.",
      },
    ],
    keyTakeaways: [
      "Expansion is the act of including the next right endpoint and updating window state.",
      "The **right** pointer should move forward monotonically, usually once per outer-loop iteration.",
      "Expansion may create a violation, complete a requirement, or generate many valid windows ending at **right**.",
      "Answer updates must happen after the state reflects the newly included element and any necessary repair.",
    ],
  },
  {
    kind: "concept",
    slug: "sw-shrinking-window",
    moduleId: "sw-fundamentals",
    order: 4,
    title: "Shrinking the Window",
    estimatedReadingMin: 8,
    tags: ["Sliding Window", "Shrinking", "Left Pointer", "Invariants"],
    summaryMD:
      "Shrinking the window advances **left** to restore validity, remove unnecessary elements, or minimize a valid range.",
    sections: [
      {
        heading: "Left Pointer Restores the Contract",
        bodyMD:
          "The **left** pointer is the repair pointer. When expansion breaks the invariant, **left** moves forward and the algorithm removes elements from the maintained state until the invariant is true again. Each removal must undo exactly what the earlier expansion did for that element.\n\nThis repair loop is what makes a variable window safe. You can be aggressive about expanding because you know every invalid state has a local repair operation: advance **left**, update the state, and recheck the invariant.",
      },
      {
        heading: "Shrink While Invalid vs Shrink While Useful",
        bodyMD:
          "For longest-valid problems, shrink while the window is invalid. Once the loop ends, the window is valid and as far left as it can be under that right endpoint, so its length is a candidate. This is the pattern for longest subarray with sum at most target or longest substring with at most **k** distinct characters.\n\nFor shortest-valid problems, shrink while the window is already valid enough to answer. Record the current length, remove the left element, and see whether the window still satisfies the requirement. This is the pattern for minimum size subarray sum and minimum window substring.",
      },
      {
        heading: "Minimization and Tight Windows",
        bodyMD:
          "A tight window is one where removing the leftmost element would break the property you care about. In minimization problems, tightness is the goal because every extra element makes the window longer than necessary. In longest-valid problems, tightness after repair prevents a hidden invalid prefix from polluting the answer.\n\nDo not confuse tightness with fixed size. A variable window may have many different tight sizes depending on the right endpoint. The invariant decides how far left can move, not a predetermined length.",
      },
      {
        heading: "Off-by-One Discipline",
        bodyMD:
          "When **left** moves, compute any answer that needs the old window before removing the left element. For a shortest valid window, record **right - left + 1** first, then subtract the leaving value and increment **left**. For a longest valid window, repair first, then record length.\n\nBoundary mistakes usually come from mixing those two timings. Ask whether the current window should be counted before or after the left element leaves. The answer follows from the invariant and from whether you are maximizing valid windows or minimizing sufficient ones.",
      },
    ],
    codeExamples: [
      {
        title: "Two reasons to shrink",
        language: "java",
        code: `class Solution {
    public int longestAtMostTarget(int[] nums, int target) {
        int left = 0;
        int sum = 0;
        int best = 0;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum > target) {
                sum -= nums[left];
                left++;
            }
            best = Math.max(best, right - left + 1);
        }

        return best;
    }

    public int minLengthAtLeastTarget(int[] nums, int target) {
        int left = 0;
        int sum = 0;
        int best = nums.length + 1;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum >= target) {
                best = Math.min(best, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }

        return best == nums.length + 1 ? 0 : best;
    }
}`,
        captionMD:
          "The first method shrinks to restore validity. The second shrinks while the window is useful so it can find the shortest sufficient range.",
      },
    ],
    keyTakeaways: [
      "Shrinking removes the leftmost element and advances **left** while updating window state.",
      "Longest-valid problems usually shrink while invalid, then update the best length.",
      "Shortest-valid problems usually update first, then shrink while the requirement still holds.",
      "The timing of answer updates depends on whether the current window should be counted before or after removal.",
    ],
  },
  {
    kind: "concept",
    slug: "sw-two-pointer-relationship",
    moduleId: "sw-fundamentals",
    order: 5,
    title: "The Two-Pointer Relationship",
    estimatedReadingMin: 7,
    tags: ["Sliding Window", "Two Pointers", "Amortized Analysis"],
    summaryMD:
      "Sliding window is a specialized two-pointer technique where **left** and **right** both move forward monotonically around one contiguous range.",
    sections: [
      {
        heading: "Sliding Window Is a Special Case",
        bodyMD:
          "Two-pointer is a broad family of techniques. One pointer might start at each end of a sorted array, both pointers might scan two lists, or one pointer might chase another in a linked list. Sliding window is the version where the two pointers are boundaries of one contiguous subarray or substring.\n\nThat distinction matters because the window has state. A generic two-pointer solution may only compare two values. A sliding-window solution usually maintains a sum, counts, a deque, or another summary of everything between **left** and **right**.",
      },
      {
        heading: "Both Pointers Move Forward",
        bodyMD:
          "The defining performance property is monotonic movement. **Right** moves from the start to the end, adding each element once. **Left** also moves from the start to the end, removing each element at most once. Neither pointer needs to move backward because the invariant is designed so forward repair is enough.\n\nThis is the reason sliding window is not just prettier brute force. The algorithm may contain a nested **while** loop, but the inner loop cannot run **n** times for each right endpoint. Across the whole execution, **left** increments at most **n** times.",
      },
      {
        heading: "Amortized O(n)",
        bodyMD:
          "Amortized analysis counts total pointer movement, not the apparent nesting. Every element enters the window once when **right** passes it and leaves the window once when **left** passes it. If each enter and leave update is constant time, the scan is **O(n)**.\n\nThis is one of the strongest interview explanations you can give. When an interviewer sees a **for** loop with a nested **while**, they may ask why it is linear. The answer is that the inner loop advances **left**, and **left** never retreats.",
      },
      {
        heading: "Contrast With Other Two-Pointer Patterns",
        bodyMD:
          "In a sorted two-sum pattern, one pointer starts at the beginning and one starts at the end. The search space shrinks because sorted order tells you which side to move. In merge-style scanning, two pointers may move through different arrays. In fast-slow pointer patterns, the pointers move at different speeds through a linked structure.\n\nSliding window is different: the pointers bound a contiguous range in the same sequence, and the algorithm maintains state for the whole range. Use the term **sliding window** when contiguity and window state are central; use **two pointers** when the main idea is endpoint movement without a maintained range aggregate.",
      },
    ],
    keyTakeaways: [
      "Sliding window is a two-pointer pattern where the pointers form one contiguous active range.",
      "Both **left** and **right** move forward monotonically, which enables amortized linear time.",
      "Nested repair loops are still **O(n)** when each left movement happens at most once overall.",
      "Generic two-pointer patterns may not maintain a full window state; sliding window usually does.",
    ],
  },
  {
    kind: "concept",
    slug: "sw-frequency-maps",
    moduleId: "sw-fundamentals",
    order: 6,
    title: "Frequency Maps in Windows",
    estimatedReadingMin: 8,
    tags: ["Sliding Window", "Frequency Map", "Hash Map", "Strings"],
    summaryMD:
      "Frequency maps let a window reason about duplicates, distinct counts, anagrams, and coverage by updating character or value counts at the endpoints.",
    sections: [
      {
        heading: "Why Counts Matter",
        bodyMD:
          "Many sliding-window problems are not about numeric sums. They ask whether the current substring has repeated characters, whether it contains all required letters, whether two windows are anagrams, or how many distinct values are present. In those cases, the window state is a set of counts.\n\nCounts preserve information that a boolean set loses. If a character appears three times and one copy leaves, the character is still present. Frequency maps make endpoint updates exact instead of guessing from membership alone.",
      },
      {
        heading: "Array vs HashMap",
        bodyMD:
          "For lowercase English letters, **int[26]** is fast, compact, and easy to update with **c - 'a'**. For ASCII strings, **int[128]** is common. For arbitrary integers, Unicode characters, or values with a large range, use a **HashMap** from value to count.\n\nThe trade-off is fixed universe versus flexibility. Arrays have excellent constants when the alphabet is known. Hash maps handle broader inputs but require careful zero-count removal when distinct-key size matters.",
      },
      {
        heading: "Need and Match Counters",
        bodyMD:
          "A full frequency comparison on every window is often too slow. Instead, maintain a small counter that summarizes how close the window is to meeting the target. For anagrams, a **missing** counter can track how many required characters still need to be matched. For minimum window substring, **formed** can track how many required character types currently meet their needed counts.\n\nThis turns validation into **O(1)** after each endpoint move. The frequency structure stores detailed counts, while the match counter answers the yes-or-no question quickly.",
      },
      {
        heading: "Shrinking With Counts",
        bodyMD:
          "When **left** moves, decrement the count for the leaving element or increment the remaining need, depending on how you model the state. If a count drops to zero in a hash map, remove the key when the number of distinct values matters. If a required count stops being satisfied, update the match counter immediately.\n\nMost bugs in frequency windows come from one-sided updates. If entering a character can make a requirement satisfied, leaving that character can make it unsatisfied. Treat the two endpoint operations as inverse transactions.",
      },
    ],
    codeExamples: [
      {
        title: "Fixed-length frequency window",
        language: "java",
        code: `class Solution {
    public boolean containsPermutation(String text, String pattern) {
        if (pattern.length() > text.length()) {
            return false;
        }

        int[] need = new int[128];
        for (int i = 0; i < pattern.length(); i++) {
            need[pattern.charAt(i)]++;
        }

        int missing = pattern.length();

        for (int right = 0; right < text.length(); right++) {
            char entering = text.charAt(right);
            if (need[entering] > 0) {
                missing--;
            }
            need[entering]--;

            if (right >= pattern.length()) {
                char leaving = text.charAt(right - pattern.length());
                need[leaving]++;
                if (need[leaving] > 0) {
                    missing++;
                }
            }

            if (right >= pattern.length() - 1 && missing == 0) {
                return true;
            }
        }

        return false;
    }
}`,
        captionMD:
          "The array stores remaining needs for the current fixed-length window, while **missing** is the compact counter that tells whether all required characters are covered.",
      },
    ],
    keyTakeaways: [
      "Use frequency state when the window must reason about duplicates, distinct values, anagrams, or coverage.",
      "Choose **int[26]**, **int[128]**, or **HashMap** based on the input universe.",
      "A match or need counter avoids comparing entire frequency structures on every move.",
      "Endpoint updates must be symmetric: every entering update needs a correct leaving inverse.",
    ],
  },
  {
    kind: "concept",
    slug: "sw-common-interview-patterns",
    moduleId: "sw-fundamentals",
    order: 7,
    title: "Common Sliding Window Patterns",
    estimatedReadingMin: 9,
    tags: ["Sliding Window", "Interview Patterns", "Templates", "Deque"],
    summaryMD:
      "Most sliding-window interview problems reduce to a small set of templates selected by window size, validity condition, and the answer being maximized, minimized, counted, or queried.",
    sections: [
      {
        heading: "Pattern Recognition Signals",
        bodyMD:
          "The strongest signal is contiguity. If the problem asks about a subarray, substring, consecutive segment, or range of nearby indices, consider sliding window before dynamic programming or general recursion. The second signal is an updateable condition: sum, count, distinct values, maximum, minimum, replacement budget, or required characters.\n\nThe third signal is monotonic repair. After expanding right, can moving left forward restore or improve the condition without needing to revisit earlier right endpoints? If yes, a sliding-window template is likely available.",
      },
      {
        heading: "Five Templates to Memorize",
        bodyMD:
          "Common templates include:\n\n- **Longest valid window**: expand right, shrink while invalid, then maximize **right - left + 1**. Signal: longest substring or subarray satisfying at most, no repeats, or budget constraints.\n- **Shortest valid window**: expand right until sufficient, update answer, then shrink while still sufficient. Signal: minimum length, smallest substring, or cover all requirements.\n- **Fixed-k aggregate**: keep exactly **k** elements and update by adding entering plus removing leaving. Signal: length **k**, average of **k**, maximum sum of size **k**, or nearby within **k**.\n- **Count with exactly K**: compute **atMost(K) - atMost(K - 1)** when direct exact counting is hard. Signal: exactly **k** distinct, exactly **k** odds, or exact binary sum variants.\n- **Monotonic-deque max or min**: maintain candidates in decreasing or increasing order while endpoints slide. Signal: maximum or minimum inside every window of size **k** or inside a bounded range.",
      },
      {
        heading: "Choosing the Invariant",
        bodyMD:
          "The invariant chooses the template. If the statement says at most, no more than, or budget not exceeded, the invariant is usually a validity ceiling and the answer may be longest or counted. If the statement says at least, contains all, or covers target, the invariant is usually a sufficiency condition and the answer may be shortest.\n\nFor exact constraints, ask whether exact is easier as a difference of two at-most counts. This is especially useful when every window counted by **atMost(K)** contains all windows with fewer than **K**, so subtracting removes the smaller cases and leaves exactly **K**.",
      },
      {
        heading: "How to Explain in Interviews",
        bodyMD:
          "Start by naming the contiguous range and the state it carries. Then state the invariant and explain why moving **left** forward repairs or tightens it. Finally, justify linear time by saying each element enters once through **right** and leaves once through **left**.\n\nThis explanation is more valuable than memorizing syntax. Senior interviews often combine patterns, such as a variable window with a frequency map or a fixed window with a deque. If you can name the invariant and the endpoint updates, you can adapt the template under pressure.",
      },
    ],
    codeExamples: [
      {
        title: "Compact longest and exactly-k templates",
        language: "java",
        code: `import java.util.HashMap;

class Solution {
    public int longestAtMostSum(int[] nums, int limit) {
        int left = 0;
        int sum = 0;
        int best = 0;

        for (int right = 0; right < nums.length; right++) {
            sum += nums[right];
            while (sum > limit) {
                sum -= nums[left];
                left++;
            }
            best = Math.max(best, right - left + 1);
        }

        return best;
    }

    public int subarraysWithExactlyKDistinct(int[] nums, int k) {
        return atMostKDistinct(nums, k) - atMostKDistinct(nums, k - 1);
    }

    private int atMostKDistinct(int[] nums, int k) {
        if (k < 0) {
            return 0;
        }

        HashMap<Integer, Integer> count = new HashMap<>();
        int left = 0;
        int answer = 0;

        for (int right = 0; right < nums.length; right++) {
            int value = nums[right];
            count.put(value, count.getOrDefault(value, 0) + 1);

            while (count.size() > k) {
                int leaving = nums[left];
                int next = count.get(leaving) - 1;
                if (next == 0) {
                    count.remove(leaving);
                } else {
                    count.put(leaving, next);
                }
                left++;
            }

            answer += right - left + 1;
        }

        return answer;
    }
}`,
        captionMD:
          "The first method is the longest-valid repair template. The second shows the at-most subtraction trick for exact distinct-count questions.",
      },
    ],
    keyTakeaways: [
      "Start with the signal: fixed size, longest valid, shortest sufficient, exact count, or window max or min.",
      "The invariant determines when to shrink and when to update the answer.",
      "Exactly-**K** counting is often easier as **atMost(K) - atMost(K - 1)**.",
      "Deque windows are still sliding windows; the maintained state is an ordered candidate structure instead of a simple count or sum.",
    ],
  },
];
