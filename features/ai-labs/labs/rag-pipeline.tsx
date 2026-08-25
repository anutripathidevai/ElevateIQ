"use client";

import { useState } from "react";
import { FileText, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LabDemoProps } from "../components/demo-types";
import {
  ClientTrace,
  chunkText,
  estimateTokens,
  liveTrace,
  rankBySimilarity,
  sleep,
  toyEmbed,
  type Chunk,
} from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, RangeControl, ScoreBar, SimNotice } from "./_shared/demo-kit";

interface RetrievedChunk {
  item: Chunk;
  score: number;
}

const DEFAULT_DOC = `Photon is a fictional HTTP cache designed for API teams that want fast responses without losing control of freshness. When a cacheable GET request succeeds, Photon stores the response body, selected headers, the cache key, and the time the response should expire. The time to live, or TTL, can come from Cache-Control headers or from a route policy defined by the service owner.

When a client asks for the same resource before the TTL expires, Photon serves the stored response immediately and marks it as a fresh cache hit. If the entry is expired but still inside the stale-while-revalidate window, Photon can return the stale response right away while a background worker refreshes the cache from origin. That keeps latency low during brief origin slowdowns.

Invalidation is explicit. Services can purge by cache key, by URL prefix, or by tag after a deploy or data change. Photon records every invalidation event so teams can debug why an entry disappeared. If the origin returns an error during refresh, Photon keeps the last stale response only until the stale window ends, then falls back to a normal origin request.`;

const DEFAULT_QUESTION = "How does the cache handle stale data?";

function leadingSentence(text: string): string {
  const sentence = text.match(/[^.!?]+[.!?]+/)?.[0] ?? text;
  return sentence.trim();
}

function makeAnswer(chunks: RetrievedChunk[]): string {
  return chunks
    .map(({ item }, index) => `${leadingSentence(item.text)} [${index + 1}]`)
    .join(" ");
}

export function RagPipeline({ onTrace }: LabDemoProps) {
  const [doc, setDoc] = useState(DEFAULT_DOC);
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const [chunkSize, setChunkSize] = useState(40);
  const [overlap, setOverlap] = useState(8);
  const [topK, setTopK] = useState(3);
  const [running, setRunning] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [retrieved, setRetrieved] = useState<RetrievedChunk[]>([]);
  const [error, setError] = useState<string | null>(null);

  function clear() {
    setAnswer(null);
    setRetrieved([]);
    setError(null);
    onTrace(null);
  }

  async function run() {
    if (running) return;
    setRunning(true);
    setAnswer(null);
    setRetrieved([]);
    setError(null);
    onTrace(null);

    const source = doc.trim();
    const q = question.trim();
    if (!source || !q) {
      setError("Add both a source document and a question before running RAG.");
      setRunning(false);
      return;
    }

    const trace = new ClientTrace();
    const push = (label: string, detail?: string) => {
      trace.step(label, detail);
      onTrace(liveTrace(trace));
    };

    const chunks = chunkText(source, chunkSize, overlap);
    push("Chunk document", `${chunks.length} chunks`);
    await sleep(140);

    const vectors = chunks.map((chunk) => ({ item: chunk, vector: toyEmbed(chunk.text) }));
    push("Embed chunks", `${vectors.length} vectors`);
    await sleep(140);

    const questionVector = toyEmbed(q);
    push("Embed question", `${estimateTokens(q)} estimated input tokens`);
    await sleep(140);

    const ranked = rankBySimilarity(questionVector, vectors, Math.min(topK, chunks.length));
    push("Retrieve top-K", `${ranked.length} chunks`);
    await sleep(160);

    const synthesized = makeAnswer(ranked);
    push("Synthesize grounded answer", `${ranked.length} citations`);
    await sleep(140);

    const retrievedContext = ranked.map(({ item }) => item.text).join(" ");
    setRetrieved(ranked);
    setAnswer(synthesized);
    setRunning(false);
    onTrace(
      liveTrace(trace, {
        inputTokens: estimateTokens(`${q} ${retrievedContext}`),
        outputTokens: estimateTokens(synthesized),
      }),
    );
  }

  return (
    <div className="space-y-4">
      <SimNotice>
        Retrieval and citations are real in this browser demo. The final answer is stitched extractively from retrieved text as a deterministic stand-in for a generative model.
      </SimNotice>

      <DemoColumns>
        <div className="space-y-4">
          <div>
            <Label htmlFor="rag-doc">Source document</Label>
            <Textarea
              id="rag-doc"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              className="mt-1.5 min-h-[210px]"
              placeholder="Paste the document the answer must be grounded in…"
            />
          </div>

          <div>
            <Label htmlFor="rag-question">Question</Label>
            <Input
              id="rag-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1.5"
              placeholder="Ask a question about the document…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <RangeControl
              id="rag-chunk-size"
              label="Chunk size"
              value={chunkSize}
              min={20}
              max={80}
              step={5}
              onChange={setChunkSize}
              hint="Words per chunk"
              format={(value) => `${value}w`}
            />
            <RangeControl
              id="rag-overlap"
              label="Overlap"
              value={overlap}
              min={0}
              max={20}
              step={1}
              onChange={setOverlap}
              hint="Repeated words"
              format={(value) => `${value}w`}
            />
            <RangeControl
              id="rag-top-k"
              label="Top-K"
              value={topK}
              min={1}
              max={5}
              step={1}
              onChange={setTopK}
              hint="Chunks retrieved"
              format={(value) => `${value}`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={running}>
              {running ? <><Loader2 className="h-4 w-4 animate-spin" /> Retrieving…</> : <><Play className="h-4 w-4" /> Run RAG</>}
            </Button>
            <Button onClick={clear} disabled={running}>
              Clear
            </Button>
          </div>
        </div>

        <OutputPanel title="Grounded answer" chip={<FileText className="h-3.5 w-3.5" />}>
          {error ? (
            <DemoError>{error}</DemoError>
          ) : answer ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm leading-relaxed">
                {answer}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Retrieved context</p>
                <ol className="mt-2 space-y-3">
                  {retrieved.map(({ item, score }, index) => (
                    <li key={item.id} className="rounded-lg border border-border bg-background/60 p-3">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium">[{index + 1}] Chunk {item.id + 1}</span>
                        <span className="font-mono text-muted-foreground">{score.toFixed(3)}</span>
                      </div>
                      <ScoreBar score={score} className="mt-2" />
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <EmptyHint running={running}>
              {running ? "Chunking, retrieving, and stitching cited context…" : "Run the pipeline to see a grounded answer and its retrieved chunks."}
            </EmptyHint>
          )}

        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
