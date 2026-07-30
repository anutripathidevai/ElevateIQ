"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Eraser,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { CodeEditor } from "@/components/practice/code-editor";
import { useCopyToClipboard } from "@/features/shared/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { PlaygroundExample } from "../types";

type LogLevel = "log" | "info" | "warn" | "error";
interface LogLine {
  level: LogLevel;
  text: string;
}

/**
 * Worker sandbox source. Runs user JavaScript off the main thread so an
 * accidental infinite loop can be terminated without freezing the page. It
 * captures console.* output (with a small value serialiser) and posts it back,
 * plus uncaught errors and unhandled promise rejections. Language-focused
 * examples (closures, promises, event-loop ordering) work here; DOM APIs do
 * not, which is by design for an isolated sandbox.
 *
 * NOTE: kept free of backticks and ${} so it can live inside this template
 * literal.
 */
const WORKER_SRC = `
self.onmessage = function (e) {
  var code = e.data && e.data.code;
  function ser(v, seen) {
    seen = seen || [];
    try {
      if (v === null) return 'null';
      if (v === undefined) return 'undefined';
      var t = typeof v;
      if (t === 'string') return v;
      if (t === 'bigint') return String(v) + 'n';
      if (t === 'number' || t === 'boolean') return String(v);
      if (t === 'symbol') return v.toString();
      if (t === 'function') return '[Function' + (v.name ? ': ' + v.name : ' (anonymous)') + ']';
      if (seen.indexOf(v) !== -1) return '[Circular]';
      seen.push(v);
      if (Array.isArray(v)) return '[ ' + v.map(function (x) { return ser(x, seen); }).join(', ') + ' ]';
      if (v instanceof Error) return v.name + ': ' + v.message;
      var pairs = [];
      for (var k in v) { if (Object.prototype.hasOwnProperty.call(v, k)) pairs.push(k + ': ' + ser(v[k], seen)); }
      return '{ ' + pairs.join(', ') + ' }';
    } catch (err) { return String(v); }
  }
  function emit(level, args) {
    var parts = [];
    for (var i = 0; i < args.length; i++) parts.push(ser(args[i]));
    self.postMessage({ type: 'log', level: level, text: parts.join(' ') });
  }
  console.log = function () { emit('log', arguments); };
  console.info = function () { emit('info', arguments); };
  console.warn = function () { emit('warn', arguments); };
  console.error = function () { emit('error', arguments); };
  console.debug = function () { emit('log', arguments); };
  self.onerror = function (msg) {
    self.postMessage({ type: 'log', level: 'error', text: String(msg) });
    return true;
  };
  self.addEventListener('unhandledrejection', function (ev) {
    var reason = ev && ev.reason;
    self.postMessage({ type: 'log', level: 'error', text: 'Uncaught (in promise) ' + ser(reason) });
  });
  try {
    (0, eval)(code);
  } catch (err) {
    self.postMessage({ type: 'log', level: 'error', text: (err && err.name ? err.name + ': ' + err.message : String(err)) });
  }
  self.postMessage({ type: 'sync-complete' });
};
`;

const HARD_TIMEOUT_MS = 3000; // no sync-complete by now => treat as infinite loop
const QUIET_MS = 700; // idle window after activity before we consider async work done
const ABSOLUTE_MS = 6000; // absolute cap on a run

const LEVEL_CLASS: Record<LogLevel, string> = {
  log: "text-foreground",
  info: "text-blue-400",
  warn: "text-orange-400",
  error: "text-rose-400",
};

export function Playground({ examples }: { examples: PlaygroundExample[] }) {
  const [active, setActive] = useState(0);
  const example = examples[active] ?? examples[0];
  const [code, setCode] = useState(example?.code ?? "");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, copy] = useCopyToClipboard();

  const workerRef = useRef<Worker | null>(null);
  const urlRef = useRef<string | null>(null);
  const hardTimer = useRef<number | null>(null);
  const quietTimer = useRef<number | null>(null);
  const absoluteTimer = useRef<number | null>(null);

  const teardown = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    for (const ref of [hardTimer, quietTimer, absoluteTimer]) {
      if (ref.current) {
        window.clearTimeout(ref.current);
        ref.current = null;
      }
    }
  }, []);

  // Reset editor + console when the selected example changes.
  useEffect(() => {
    teardown();
    setCode(example?.code ?? "");
    setLogs([]);
    setRunning(false);
    setRan(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Clean up on unmount.
  useEffect(() => teardown, [teardown]);

  const finish = useCallback(() => {
    teardown();
    setRunning(false);
  }, [teardown]);

  const bumpQuietTimer = useCallback(() => {
    if (quietTimer.current) window.clearTimeout(quietTimer.current);
    quietTimer.current = window.setTimeout(finish, QUIET_MS);
  }, [finish]);

  const run = useCallback(() => {
    teardown();
    setLogs([]);
    setRunning(true);
    setRan(true);

    let worker: Worker;
    try {
      const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      worker = new Worker(url);
    } catch {
      setLogs([
        {
          level: "error",
          text: "The playground could not start in this browser.",
        },
      ]);
      setRunning(false);
      return;
    }
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data as
        | { type: "log"; level: LogLevel; text: string }
        | { type: "sync-complete" };
      if (data?.type === "log") {
        setLogs((prev) => [...prev, { level: data.level, text: data.text }]);
        if (quietTimer.current) bumpQuietTimer();
      } else if (data?.type === "sync-complete") {
        if (hardTimer.current) {
          window.clearTimeout(hardTimer.current);
          hardTimer.current = null;
        }
        // Give async work (microtasks, timers) a quiet window to complete.
        bumpQuietTimer();
      }
    };
    worker.onerror = (e) => {
      setLogs((prev) => [
        ...prev,
        { level: "error", text: e.message || "Worker error" },
      ]);
      finish();
    };

    worker.postMessage({ code });

    hardTimer.current = window.setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          level: "error",
          text: "Execution timed out (possible infinite loop). Stopped.",
        },
      ]);
      finish();
    }, HARD_TIMEOUT_MS);
    absoluteTimer.current = window.setTimeout(finish, ABSOLUTE_MS);
  }, [code, teardown, finish, bumpQuietTimer]);

  const reset = useCallback(() => {
    teardown();
    setCode(example?.code ?? "");
    setLogs([]);
    setRunning(false);
    setRan(false);
  }, [example?.code, teardown]);

  const body = (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-1.5">
        {examples.length > 1 &&
          examples.map((ex, i) => (
            <button
              key={ex.title}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "rounded px-2.5 py-1 text-xs transition-colors",
                i === active
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {ex.title}
            </button>
          ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-60"
          >
            <Play className="h-3.5 w-3.5" /> {running ? "Running…" : "Run"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={() => copy(code)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {fullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Editor + console */}
      <div
        className={cn(
          "grid gap-px bg-border",
          fullscreen ? "flex-1 md:grid-cols-2" : "md:grid-cols-2",
        )}
      >
        <div className="bg-card">
          <CodeEditor value={code} onChange={setCode} language="javascript" />
        </div>
        <div className="flex min-h-[240px] flex-col bg-[#1e1e1e]">
          <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" /> Console
            </span>
            <button
              type="button"
              onClick={() => setLogs([])}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Eraser className="h-3 w-3" /> Clear
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">
                {ran
                  ? "No console output."
                  : "Press Run to execute the code and see output here."}
              </p>
            ) : (
              logs.map((line, i) => (
                <div
                  key={i}
                  className={cn("whitespace-pre-wrap", LEVEL_CLASS[line.level])}
                >
                  {line.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background/95 p-4 backdrop-blur">
        {body}
      </div>
    );
  }
  return body;
}
