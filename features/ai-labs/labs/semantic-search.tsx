"use client";

import { useState } from "react";
import { Loader2, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LabDemoProps } from "../components/demo-types";
import {
  ClientTrace,
  estimateTokens,
  liveTrace,
  rankBySimilarity,
  sleep,
  tokenize,
  toyEmbed,
} from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, RangeControl, ScoreBar, SimNotice } from "./_shared/demo-kit";

interface CorpusDoc {
  id: string;
  title: string;
  text: string;
}

interface SearchResult {
  item: CorpusDoc;
  score: number;
}

interface KeywordResult {
  doc: CorpusDoc;
  score: number;
}

const DEFAULT_QUERY = "how do I make my database reads faster?";

const CORPUS: CorpusDoc[] = [
  { id: "database-indexing", title: "Database indexing", text: "B-tree and hash indexes help a database find matching rows without scanning an entire table. Good indexes make filtered reads, joins, and sorted queries much faster." },
  { id: "caching", title: "Caching", text: "A cache stores expensive responses or computations close to the application. It reduces repeated database reads but needs expiration, invalidation, and freshness rules." },
  { id: "load-balancing", title: "Load balancing", text: "Load balancers spread incoming traffic across multiple servers so no single instance becomes a bottleneck. Health checks keep failed nodes out of rotation." },
  { id: "message-queues", title: "Message queues", text: "Queues decouple producers from workers. They smooth traffic spikes, retry failed jobs, and let slow background work happen outside the request path." },
  { id: "oauth", title: "OAuth", text: "OAuth lets users grant an application limited access to an account without sharing a password. Access tokens, scopes, and redirect URIs define the trust boundary." },
  { id: "pagination", title: "Pagination", text: "Pagination splits large result sets into pages. Cursor pagination is stable for changing feeds, while offset pagination is simpler but slower at deep pages." },
  { id: "rate-limiting", title: "Rate limiting", text: "Rate limits protect APIs from abuse and accidental overload. Token buckets and sliding windows cap requests while preserving bursts for healthy clients." },
  { id: "sharding", title: "Sharding", text: "Sharding partitions data across multiple database nodes. It increases write and storage capacity, but cross-shard queries and rebalancing become harder." },
  { id: "cdns", title: "Content delivery networks", text: "CDNs cache static assets and edge responses near users around the world. They lower latency, absorb traffic spikes, and reduce origin server load." },
  { id: "connection-pooling", title: "Connection pooling", text: "Connection pools reuse database connections instead of opening a new one per request. They reduce handshake overhead and prevent the database from being flooded." },
];

function keywordScore(query: string, doc: CorpusDoc): number {
  const docTokens = new Set(tokenize(`${doc.title} ${doc.text}`));
  return tokenize(query).filter((token) => docTokens.has(token)).length;
}

function snippet(text: string): string {
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}

export function SemanticSearch({ onTrace }: LabDemoProps) {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [topK, setTopK] = useState(5);
  const [compareKeyword, setCompareKeyword] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [keywordResults, setKeywordResults] = useState<KeywordResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  function clear() {
    setResults([]);
    setKeywordResults([]);
    setError(null);
    onTrace(null);
  }

  async function run() {
    if (running) return;
    setRunning(true);
    setResults([]);
    setKeywordResults([]);
    setError(null);
    onTrace(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setError("Enter a search question before running semantic search.");
      setRunning(false);
      return;
    }

    const trace = new ClientTrace();
    const push = (label: string, detail?: string) => {
      trace.step(label, detail);
      onTrace(liveTrace(trace));
    };

    const vectors = CORPUS.map((doc) => ({
      item: doc,
      vector: toyEmbed(`${doc.title} ${doc.text}`),
    }));
    push("Embed corpus", `${CORPUS.length} documents`);
    await sleep(140);

    const queryVector = toyEmbed(trimmed);
    push("Embed query", `${estimateTokens(trimmed)} estimated input tokens`);
    await sleep(140);

    const ranked = rankBySimilarity(queryVector, vectors, topK);
    push("Score & rank (cosine)", `top ${topK}`);
    await sleep(160);

    let keywordRanked: KeywordResult[] = [];
    if (compareKeyword) {
      keywordRanked = CORPUS.map((doc) => ({ doc, score: keywordScore(trimmed, doc) }))
        .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
        .slice(0, topK);
      push("Compare keyword ranking", "exact query-token hits");
      await sleep(120);
    }

    setResults(ranked);
    setKeywordResults(keywordRanked);
    setRunning(false);
    onTrace(liveTrace(trace, { inputTokens: estimateTokens(trimmed), outputTokens: 0 }));
  }

  return (
    <div className="space-y-4">
      <SimNotice>
        This demo uses a deterministic local trigram-hash embedding, not a neural model, but the vector math is real: documents and the query are embedded and ranked with cosine similarity in your browser.
      </SimNotice>

      <DemoColumns>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ss-query">Search query</Label>
            <Textarea
              id="ss-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1.5 min-h-[110px]"
              placeholder="Ask a software-engineering question…"
            />
          </div>

          <RangeControl
            id="ss-top-k"
            label="Results to retrieve"
            value={topK}
            min={1}
            max={8}
            step={1}
            onChange={setTopK}
            hint="Top-K controls how many nearest neighbours are returned."
            format={(value) => `${value} docs`}
          />

          <label htmlFor="ss-compare" className="flex items-center gap-2 text-sm">
            <input
              id="ss-compare"
              type="checkbox"
              checked={compareKeyword}
              onChange={(e) => setCompareKeyword(e.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            Compare with keyword search
          </label>

          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={running}>
              {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching…</> : <><Play className="h-4 w-4" /> Run search</>}
            </Button>
            <Button onClick={clear} disabled={running}>
              Clear
            </Button>
          </div>
        </div>

        <OutputPanel title="Semantic ranking" chip={<Search className="h-3.5 w-3.5" />}>
          {error ? (
            <DemoError>{error}</DemoError>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <ol className="space-y-3">
                {results.map(({ item, score }, index) => (
                  <li key={item.id} className="rounded-lg border border-border bg-background/60 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          #{index + 1} {item.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{snippet(item.text)}</p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{score.toFixed(3)}</span>
                    </div>
                    <ScoreBar score={score} className="mt-3" />
                  </li>
                ))}
              </ol>

              {compareKeyword && keywordResults.length > 0 && (
                <div className="rounded-lg border border-dashed border-border p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Keyword ranking</p>
                  <ol className="mt-2 space-y-1.5 text-xs">
                    {keywordResults.map(({ doc, score }, index) => (
                      <li key={doc.id} className="flex items-center justify-between gap-3">
                        <span>
                          #{index + 1} {doc.title}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {score} {score === 1 ? "hit" : "hits"}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ) : (
            <EmptyHint running={running}>
              {running ? "Embedding and ranking the corpus…" : "Run the search to see nearest-neighbour results and cosine scores."}
            </EmptyHint>
          )}

        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
