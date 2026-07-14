"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { StarGenerationInput } from "../ai/schemas";

export interface StarStoryFormProps {
  onGenerate: (input: StarGenerationInput) => void;
  generating: boolean;
  aiEnabled: boolean;
  defaultProject?: string;
}

const MIN_PROJECT = 40;

/** Collects the inputs for AI STAR-story generation. */
export function StarStoryForm({
  onGenerate,
  generating,
  aiEnabled,
  defaultProject = "",
}: StarStoryFormProps) {
  const [project, setProject] = useState(defaultProject);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [count, setCount] = useState(3);
  const [focus, setFocus] = useState("");

  // Prefill when the parent asks to "reuse" a story's source project.
  useEffect(() => {
    if (defaultProject) setProject(defaultProject);
  }, [defaultProject]);

  const tooShort = project.trim().length < MIN_PROJECT;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tooShort || generating || !aiEnabled) return;
    onGenerate({
      project: project.trim(),
      role: role.trim() || undefined,
      company: company.trim() || undefined,
      count,
      focus: focus.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
      aria-label="Generate STAR stories"
    >
      <div className="space-y-1.5">
        <Label htmlFor="gen-project">Project or accomplishment</Label>
        <Textarea
          id="gen-project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="Describe what you built, the problem, your role, the constraints, and the outcome. The more detail, the better the stories."
          className="min-h-[160px]"
          aria-describedby="gen-project-hint"
        />
        <p id="gen-project-hint" className="text-xs text-muted-foreground">
          {tooShort
            ? `Add at least ${MIN_PROJECT} characters (${project.trim().length}/${MIN_PROJECT}).`
            : "Tip: include metrics, scope, and your specific contribution."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="gen-role">Target role (optional)</Label>
          <Input
            id="gen-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Senior Backend Engineer"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gen-company">Target company (optional)</Label>
          <Input
            id="gen-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Amazon"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gen-count">Number of stories</Label>
          <Select
            id="gen-count"
            value={String(count)}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gen-focus">Emphasize (optional)</Label>
          <Input
            id="gen-focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Ownership, mentoring"
          />
        </div>
      </div>

      {!aiEnabled && (
        <p className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
          AI generation isn&apos;t configured in this environment. You can still
          add stories manually below.
        </p>
      )}

      <Button type="submit" disabled={tooShort || generating || !aiEnabled}>
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {generating ? "Generating…" : "Generate stories"}
      </Button>
    </form>
  );
}
