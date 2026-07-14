"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInterviewAction } from "../actions";

/** Configure and start a new panel interview. */
export function PanelSetup({ aiEnabled }: { aiEnabled: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [focus, setFocus] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim() || starting) return;
    setStarting(true);
    setError(null);
    const res = await createInterviewAction({
      role: role.trim(),
      focus: focus.trim() || undefined,
    });
    if (res.ok && res.id) {
      router.push(`/panel/${res.id}`);
      return;
    }
    setStarting(false);
    setError(res.error ?? "Could not start the interview.");
  }

  return (
    <form
      onSubmit={handleStart}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
      aria-label="Start a panel interview"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="panel-role">Target role</Label>
          <Input
            id="panel-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Senior Software Engineer at a fintech"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="panel-focus">Focus (optional)</Label>
          <Input
            id="panel-focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Distributed systems, leadership"
          />
        </div>
      </div>

      {!aiEnabled && (
        <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
          AI isn&apos;t configured here, so interviewers will ask from a fixed
          question bank and scoring uses a heuristic estimate. The full flow
          still works end-to-end.
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!role.trim() || starting}>
        {starting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {starting ? "Starting…" : "Start panel interview"}
      </Button>
    </form>
  );
}
