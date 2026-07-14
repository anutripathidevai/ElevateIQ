/**
 * Authoritative source for the DSA judge specs.
 *
 * Each entry carries the JudgeSpec that ships to users (starter + tests) plus a
 * private reference `solution` used only to validate that the declared
 * `expected` values are correct — the same harness that runs in the browser is
 * used here, so if the data is wrong the check fails loudly.
 *
 *   npx tsx scripts/judge-specs.ts          # validate only
 *   npx tsx scripts/judge-specs.ts --write  # validate, then merge into content/dsa.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runSpec } from "../lib/judge/harness";
import type { JudgeSpec } from "../lib/judge/types";

interface Entry {
  slug: string;
  spec: JudgeSpec;
  /** Reference implementation — validation only, never shipped. */
  solution: string;
}

const LISTNODE_PREAMBLE =
  "/**\n * Definition for singly-linked list node (provided).\n * function ListNode(val, next) { this.val = val; this.next = next; }\n */\n";

const ENTRIES: Entry[] = [
  {
    slug: "two-sum",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "twoSum",
      compare: "unordered",
      starter:
        "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Write your solution here\n}\n",
      tests: [
        { name: "Example 1", input: [[2, 7, 11, 15], 9], expected: [0, 1] },
        { name: "Example 2", input: [[3, 2, 4], 6], expected: [1, 2] },
        { name: "Duplicates", input: [[3, 3], 6], expected: [0, 1] },
        { name: "Negatives", input: [[-3, 4, 3, 90], 0], expected: [0, 2] },
      ],
    },
    solution:
      "function twoSum(nums, target){const m=new Map();for(let i=0;i<nums.length;i++){const c=target-nums[i];if(m.has(c))return [m.get(c),i];m.set(nums[i],i);}return [];}",
  },
  {
    slug: "valid-parentheses",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "isValid",
      starter:
        "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Write your solution here\n}\n",
      tests: [
        { name: "Simple pair", input: ["()"], expected: true },
        { name: "All types", input: ["()[]{}"], expected: true },
        { name: "Mismatch", input: ["(]"], expected: false },
        { name: "Nested", input: ["([]{})"], expected: true },
        { name: "Unclosed", input: ["("], expected: false },
        { name: "Wrong order", input: ["([)]"], expected: false },
      ],
    },
    solution:
      "function isValid(s){const st=[];const pairs={')':'(',']':'[','}':'{'};for(const ch of s){if(ch==='('||ch==='['||ch==='{')st.push(ch);else{if(st.pop()!==pairs[ch])return false;}}return st.length===0;}",
  },
  {
    slug: "merge-two-sorted-lists",
    spec: {
      lang: "javascript",
      kind: "linkedlist",
      entry: "mergeTwoLists",
      listArgs: [0, 1],
      returnsList: true,
      starter:
        LISTNODE_PREAMBLE +
        "function ListNode(val, next) {\n  this.val = val === undefined ? 0 : val;\n  this.next = next === undefined ? null : next;\n}\n\n/**\n * @param {ListNode} l1\n * @param {ListNode} l2\n * @return {ListNode}\n */\nfunction mergeTwoLists(l1, l2) {\n  // Write your solution here\n}\n",
      tests: [
        {
          name: "Interleave",
          input: [
            [1, 2, 4],
            [1, 3, 4],
          ],
          expected: [1, 1, 2, 3, 4, 4],
        },
        { name: "Both empty", input: [[], []], expected: [] },
        { name: "One empty", input: [[], [0]], expected: [0] },
        {
          name: "Disjoint",
          input: [
            [1, 2, 3],
            [4, 5, 6],
          ],
          expected: [1, 2, 3, 4, 5, 6],
        },
      ],
    },
    solution:
      "function mergeTwoLists(l1,l2){const dummy={val:0,next:null};let tail=dummy;while(l1&&l2){if(l1.val<=l2.val){tail.next=l1;l1=l1.next;}else{tail.next=l2;l2=l2.next;}tail=tail.next;}tail.next=l1||l2;return dummy.next;}",
  },
  {
    slug: "best-time-to-buy-sell-stock",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "maxProfit",
      starter:
        "/**\n * @param {number[]} prices\n * @return {number}\n */\nfunction maxProfit(prices) {\n  // Write your solution here\n}\n",
      tests: [
        { name: "Buy low sell high", input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
        { name: "Monotonic drop", input: [[7, 6, 4, 3, 1]], expected: 0 },
        { name: "Two days", input: [[1, 2]], expected: 1 },
        { name: "Single day", input: [[3]], expected: 0 },
      ],
    },
    solution:
      "function maxProfit(prices){let min=Infinity,best=0;for(const p of prices){if(p<min)min=p;else if(p-min>best)best=p-min;}return best;}",
  },
  {
    slug: "maximum-subarray",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "maxSubArray",
      starter:
        "/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n  // Write your solution here\n}\n",
      tests: [
        { name: "Mixed", input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { name: "Single", input: [[1]], expected: 1 },
        { name: "All positive", input: [[5, 4, -1, 7, 8]], expected: 23 },
        { name: "All negative", input: [[-3, -1, -2]], expected: -1 },
      ],
    },
    solution:
      "function maxSubArray(nums){let best=nums[0],cur=nums[0];for(let i=1;i<nums.length;i++){cur=Math.max(nums[i],cur+nums[i]);best=Math.max(best,cur);}return best;}",
  },
  {
    slug: "product-of-array-except-self",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "productExceptSelf",
      starter:
        "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nfunction productExceptSelf(nums) {\n  // Write your solution here\n}\n",
      tests: [
        { name: "Basic", input: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
        {
          name: "With zero",
          input: [[-1, 1, 0, -3, 3]],
          expected: [0, 0, 9, 0, 0],
        },
        { name: "Pair", input: [[2, 3]], expected: [3, 2] },
      ],
    },
    solution:
      "function productExceptSelf(nums){const n=nums.length,res=new Array(n).fill(1);let pre=1;for(let i=0;i<n;i++){res[i]=pre;pre*=nums[i];}let post=1;for(let i=n-1;i>=0;i--){res[i]*=post;post*=nums[i];}return res;}",
  },
  {
    slug: "group-anagrams",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "groupAnagrams",
      compare: "anagram-groups",
      starter:
        "/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nfunction groupAnagrams(strs) {\n  // Write your solution here\n}\n",
      tests: [
        {
          name: "Example",
          input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
          expected: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]],
        },
        { name: "Empty string", input: [[""]], expected: [[""]] },
        { name: "Single", input: [["a"]], expected: [["a"]] },
      ],
    },
    solution:
      "function groupAnagrams(strs){const m=new Map();for(const s of strs){const k=s.split('').sort().join('');if(!m.has(k))m.set(k,[]);m.get(k).push(s);}return [...m.values()];}",
  },
  {
    slug: "number-of-islands",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "numIslands",
      starter:
        "/**\n * @param {string[][]} grid\n * @return {number}\n */\nfunction numIslands(grid) {\n  // Write your solution here\n}\n",
      tests: [
        {
          name: "Two islands",
          input: [
            [
              ["1", "1", "0"],
              ["1", "0", "0"],
              ["0", "0", "1"],
            ],
          ],
          expected: 2,
        },
        {
          name: "Connected H",
          input: [
            [
              ["1", "1", "1"],
              ["0", "1", "0"],
              ["1", "1", "1"],
            ],
          ],
          expected: 1,
        },
        { name: "All water", input: [[["0"]]], expected: 0 },
      ],
    },
    solution:
      "function numIslands(grid){if(!grid||!grid.length)return 0;const R=grid.length,C=grid[0].length;let count=0;function dfs(r,c){if(r<0||c<0||r>=R||c>=C||grid[r][c]!=='1')return;grid[r][c]='0';dfs(r+1,c);dfs(r-1,c);dfs(r,c+1);dfs(r,c-1);}for(let r=0;r<R;r++)for(let c=0;c<C;c++){if(grid[r][c]==='1'){count++;dfs(r,c);}}return count;}",
  },
  {
    slug: "course-schedule",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "canFinish",
      starter:
        "/**\n * @param {number} numCourses\n * @param {number[][]} prerequisites\n * @return {boolean}\n */\nfunction canFinish(numCourses, prerequisites) {\n  // Write your solution here\n}\n",
      tests: [
        { name: "Linear", input: [2, [[1, 0]]], expected: true },
        {
          name: "Cycle",
          input: [
            2,
            [
              [1, 0],
              [0, 1],
            ],
          ],
          expected: false,
        },
        { name: "No prereqs", input: [1, []], expected: true },
        {
          name: "Chain",
          input: [
            4,
            [
              [1, 0],
              [2, 1],
              [3, 2],
            ],
          ],
          expected: true,
        },
      ],
    },
    solution:
      "function canFinish(numCourses,prerequisites){const adj=Array.from({length:numCourses},()=>[]);const indeg=new Array(numCourses).fill(0);for(const [a,b] of prerequisites){adj[b].push(a);indeg[a]++;}const q=[];for(let i=0;i<numCourses;i++)if(indeg[i]===0)q.push(i);let seen=0;while(q.length){const u=q.shift();seen++;for(const v of adj[u]){if(--indeg[v]===0)q.push(v);}}return seen===numCourses;}",
  },
  {
    slug: "lru-cache",
    spec: {
      lang: "javascript",
      kind: "design",
      entry: "LRUCache",
      starter:
        "/**\n * @param {number} capacity\n */\nclass LRUCache {\n  constructor(capacity) {\n    // Initialize your data structures here\n  }\n\n  /** @param {number} key @return {number} */\n  get(key) {\n    // Write your solution here\n  }\n\n  /** @param {number} key @param {number} value @return {void} */\n  put(key, value) {\n    // Write your solution here\n  }\n}\n",
      tests: [
        {
          name: "LeetCode example",
          ops: [
            "LRUCache",
            "put",
            "put",
            "get",
            "put",
            "get",
            "put",
            "get",
            "get",
            "get",
          ],
          args: [
            [2],
            [1, 1],
            [2, 2],
            [1],
            [3, 3],
            [2],
            [4, 4],
            [1],
            [3],
            [4],
          ],
          expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
        },
        {
          name: "Update existing key",
          ops: ["LRUCache", "put", "put", "put", "get", "get"],
          args: [[2], [1, 1], [2, 2], [1, 10], [1], [2]],
          expected: [null, null, null, null, 10, 2],
        },
      ],
    },
    solution:
      "class LRUCache{constructor(capacity){this.cap=capacity;this.map=new Map();}get(key){if(!this.map.has(key))return -1;const v=this.map.get(key);this.map.delete(key);this.map.set(key,v);return v;}put(key,value){if(this.map.has(key))this.map.delete(key);this.map.set(key,value);if(this.map.size>this.cap){const first=this.map.keys().next().value;this.map.delete(first);}}}",
  },
  {
    slug: "trapping-rain-water",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "trap",
      starter:
        "/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n  // Write your solution here\n}\n",
      tests: [
        {
          name: "Example 1",
          input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]],
          expected: 6,
        },
        { name: "Example 2", input: [[4, 2, 0, 3, 2, 5]], expected: 9 },
        { name: "Empty", input: [[]], expected: 0 },
        { name: "No traps", input: [[1, 2, 3]], expected: 0 },
      ],
    },
    solution:
      "function trap(height){let l=0,r=height.length-1,lm=0,rm=0,res=0;while(l<r){if(height[l]<height[r]){lm=Math.max(lm,height[l]);res+=lm-height[l];l++;}else{rm=Math.max(rm,height[r]);res+=rm-height[r];r--;}}return res;}",
  },
  {
    slug: "word-ladder",
    spec: {
      lang: "javascript",
      kind: "function",
      entry: "ladderLength",
      starter:
        "/**\n * @param {string} beginWord\n * @param {string} endWord\n * @param {string[]} wordList\n * @return {number}\n */\nfunction ladderLength(beginWord, endWord, wordList) {\n  // Write your solution here\n}\n",
      tests: [
        {
          name: "Reachable",
          input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
          expected: 5,
        },
        {
          name: "Unreachable",
          input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]],
          expected: 0,
        },
        { name: "One step", input: ["a", "c", ["a", "b", "c"]], expected: 2 },
      ],
    },
    solution:
      "function ladderLength(beginWord,endWord,wordList){const words=new Set(wordList);if(!words.has(endWord))return 0;let q=[beginWord];let steps=1;const seen=new Set([beginWord]);while(q.length){const next=[];for(const w of q){if(w===endWord)return steps;for(let i=0;i<w.length;i++){for(let c=97;c<=122;c++){const nw=w.slice(0,i)+String.fromCharCode(c)+w.slice(i+1);if(words.has(nw)&&!seen.has(nw)){seen.add(nw);next.push(nw);}}}}q=next;steps++;}return 0;}",
  },
];

function validate(): boolean {
  let ok = true;
  for (const { slug, spec, solution } of ENTRIES) {
    const outcome = runSpec(solution, spec);
    if (outcome.compileError) {
      console.error(`x ${slug}: compile error - ${outcome.compileError}`);
      ok = false;
      continue;
    }
    if (!outcome.allPassed) {
      ok = false;
      console.error(`x ${slug}: ${outcome.passedCount}/${outcome.total} passed`);
      for (const f of outcome.results.filter((r) => !r.passed)) {
        console.error(
          `    - ${f.name}: expected ${JSON.stringify(
            f.expected,
          )}, got ${JSON.stringify(f.actual)}${f.error ? ` (${f.error})` : ""}`,
        );
      }
      continue;
    }
    console.log(`ok ${slug}: ${outcome.passedCount}/${outcome.total}`);
  }
  return ok;
}

function write() {
  const file = join(process.cwd(), "content", "dsa.json");
  const problems = JSON.parse(readFileSync(file, "utf8")) as Array<
    Record<string, unknown> & { slug: string }
  >;
  const bySlug = new Map(ENTRIES.map((e) => [e.slug, e.spec]));
  let merged = 0;
  for (const p of problems) {
    const spec = bySlug.get(p.slug);
    if (spec) {
      p.judge = spec;
      merged++;
    }
  }
  writeFileSync(file, JSON.stringify(problems, null, 2) + "\n", "utf8");
  console.log(`\nMerged judge specs into ${merged} problems -> ${file}`);
}

const ok = validate();
if (!ok) {
  console.error("\nValidation failed - not writing.");
  process.exit(1);
}
if (process.argv.includes("--write")) write();
