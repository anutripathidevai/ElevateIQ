"use client";

import { useState } from "react";
import { ListChecks, Loader2, PenTool, Play, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LabDemoProps } from "../components/demo-types";
import { ClientTrace, estimateTokens, liveTrace, sleep } from "./_shared/lab-engine";
import { DemoColumns, DemoError, EmptyHint, OutputPanel, SimNotice } from "./_shared/demo-kit";

type Role = "planner" | "worker" | "critic";

interface RoleEvent {
  id: string;
  role: Role;
  title: string;
  body?: string;
  bullets?: string[];
}

const DEFAULT_TASK = "Write a 2-sentence launch announcement for our new AI Labs feature.";

function shortTask(task: string): string {
  return task.trim().replace(/\s+/g, " ").replace(/[.?!]+$/, "");
}

function subjectFromTask(task: string): string {
  const normalized = shortTask(task);
  const match = normalized.match(/\bfor\s+(.+)$/i) ?? normalized.match(/\babout\s+(.+)$/i);
  return (match?.[1] ?? "the requested artifact").replace(/^(a|an|the)\s+/i, "");
}

function buildPlan(task: string, criticEnabled: boolean): string[] {
  const lower = task.toLowerCase();
  const plan = [`Anchor the artifact on: "${shortTask(task)}".`];
  if (lower.includes("2-sentence") || lower.includes("two-sentence")) {
    plan.push("Keep the final answer to two clear sentences.");
  } else {
    plan.push("Keep the artifact concise and easy to scan.");
  }
  if (lower.includes("launch")) {
    plan.push("Include a concrete launch value, not generic excitement.");
  }
  plan.push(
    criticEnabled
      ? "Send the draft to the critic for specificity, format, and call-to-action checks."
      : "Skip critique and ship the first worker draft as the final artifact.",
  );
  return plan.slice(0, 4);
}

function buildDraft(task: string): string {
  const subject = subjectFromTask(task);
  return `Introducing ${subject}. It helps teams learn AI faster and get excited about what they can build next.`;
}

function buildCritique(task: string, draft: string): string[] {
  const issues = [
    "The draft is generic; it does not say what learners can actually run or inspect.",
    "It misses a concrete next step, so the announcement has no useful call to action.",
  ];
  if (/2-sentence|two-sentence/i.test(task) && draft.split(/[.!?]+/).filter(Boolean).length !== 2) {
    issues.push("The requested two-sentence format is not clearly satisfied.");
  } else {
    issues.push("It should name execution traces or tool/agent loops to make the value specific.");
  }
  return issues;
}

function buildRevision(task: string): string {
  const subject = subjectFromTask(task);
  return `Introducing ${subject}: hands-on labs that let you run prompts, tool calls, agent loops, and execution traces in the browser. Start with the playground, then follow each guided demo to turn AI concepts into production-ready patterns.`;
}

function roleVariant(role: Role): "default" | "outline" | "success" | "warning" | "danger" {
  if (role === "planner") return "default";
  if (role === "critic") return "warning";
  return "success";
}

function RoleIcon({ role }: { role: Role }) {
  if (role === "planner") return <ListChecks className="h-4 w-4 text-violet-500" />;
  if (role === "critic") return <ShieldCheck className="h-4 w-4 text-amber-500" />;
  return <PenTool className="h-4 w-4 text-emerald-500" />;
}

export function MultiAgent({ onTrace }: LabDemoProps) {
  const [task, setTask] = useState(DEFAULT_TASK);
  const [criticEnabled, setCriticEnabled] = useState(true);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<RoleEvent[]>([]);
  const [finalArtifact, setFinalArtifact] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function clear() {
    setEvents([]);
    setFinalArtifact(null);
    setError(null);
    onTrace(null);
  }

  async function run() {
    if (running) return;
    const trimmedTask = task.trim();
    clear();
    if (!trimmedTask) {
      setError("Enter a task before running the orchestration.");
      return;
    }

    setRunning(true);
    const trace = new ClientTrace();
    const local: RoleEvent[] = [];
    const addEvent = (event: RoleEvent) => {
      local.push(event);
      setEvents([...local]);
    };
    const record = (label: string, detail: string) => {
      trace.step(label, detail);
      onTrace(liveTrace(trace));
    };

    const plan = buildPlan(trimmedTask, criticEnabled);
    addEvent({ id: "planner", role: "planner", title: "Planner", bullets: plan });
    record("Planner", `${plan.length} subtasks created`);
    await sleep(180);

    const draft = buildDraft(trimmedTask);
    addEvent({ id: "worker-draft", role: "worker", title: "Worker: draft", body: draft });
    record("Worker: draft", "Initial artifact produced");
    await sleep(180);

    let final = draft;
    if (criticEnabled) {
      const critique = buildCritique(trimmedTask, draft);
      addEvent({ id: "critic", role: "critic", title: "Critic: review", bullets: critique });
      record("Critic: review", `${critique.length} concrete issues found`);
      await sleep(180);

      final = buildRevision(trimmedTask);
      addEvent({ id: "worker-revise", role: "worker", title: "Worker: revise", body: final });
      record("Worker: revise", "Critic feedback incorporated");
      await sleep(180);
    } else {
      record("Stop: critic loop disabled", "Final artifact is the first draft");
    }

    setFinalArtifact(final);
    setRunning(false);
    onTrace(
      liveTrace(trace, {
        inputTokens: estimateTokens(trimmedTask),
        outputTokens: estimateTokens(
          local
            .map((event) => [event.title, event.body, ...(event.bullets ?? [])].filter(Boolean).join(" "))
            .join("\n") + final,
        ),
      }),
    );
  }

  return (
    <div className="space-y-4">
      <SimNotice>
        Role outputs are deterministic stand-ins. The real lesson is the orchestration pattern: distinct roles, handoffs, and a bounded critic loop.
      </SimNotice>
      <DemoColumns>
        <div className="space-y-4">
          <div>
            <Label htmlFor="multi-task">Task</Label>
            <Textarea
              id="multi-task"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              className="mt-1.5 min-h-[130px]"
              placeholder="Describe the artifact the agents should produce…"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={criticEnabled}
              onChange={(event) => setCriticEnabled(event.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            Enable critic loop
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={running || !task.trim()}>
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Orchestrating…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Run agents
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={clear} disabled={running}>
              Clear
            </Button>
          </div>
        </div>

        <OutputPanel title="Role timeline" chip={criticEnabled ? "critic loop on" : "critic loop off"}>
          {error && <DemoError>{error}</DemoError>}
          {events.length === 0 ? (
            <EmptyHint running={running}>
              {running ? "The planner is starting…" : "Run the workflow to see each role hand off to the next."}
            </EmptyHint>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {events.map((event) => (
                <section key={event.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <RoleIcon role={event.role} /> {event.title}
                    </span>
                    <Badge variant={roleVariant(event.role)}>{event.role}</Badge>
                  </div>
                  {event.body && <p className="text-sm text-muted-foreground">{event.body}</p>}
                  {event.bullets && (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {event.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}

          {finalArtifact && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" /> Final artifact
              </div>
              <p className="text-sm">{finalArtifact}</p>
              {!criticEnabled && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Critic loop disabled: this is the unrevised worker draft, so it remains intentionally generic.
                </p>
              )}
            </div>
          )}
        </OutputPanel>
      </DemoColumns>
    </div>
  );
}
