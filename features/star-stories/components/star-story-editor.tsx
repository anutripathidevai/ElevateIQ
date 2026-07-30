"use client";

import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STAR_SECTIONS, type StarStoryInput } from "../types";

const csv = (list: string[]) => list.join(", ");
const lines = (list: string[]) => list.join("\n");
const fromCsv = (value: string) =>
  value.split(",").map((v) => v.trim()).filter(Boolean);
const fromLines = (value: string) =>
  value.split("\n").map((v) => v.trim()).filter(Boolean);

export interface StarStoryEditorProps {
  initial: StarStoryInput;
  heading: string;
  submitLabel: string;
  onSubmit: (
    input: StarStoryInput,
  ) => Promise<{ ok: boolean; error?: string }>;
  onCancel: () => void;
}

/**
 * Controlled form for creating or editing a STAR story. Array fields are edited
 * as comma-separated (skills, principles, tags) or line-separated (questions)
 * text and normalized on submit.
 */
export function StarStoryEditor({
  initial,
  heading,
  submitLabel,
  onSubmit,
  onCancel,
}: StarStoryEditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [situation, setSituation] = useState(initial.situation);
  const [task, setTask] = useState(initial.task);
  const [action, setAction] = useState(initial.action);
  const [result, setResult] = useState(initial.result);
  const [skills, setSkills] = useState(csv(initial.skills));
  const [principles, setPrinciples] = useState(csv(initial.leadershipPrinciples));
  const [questions, setQuestions] = useState(lines(initial.suggestedQuestions));
  const [tags, setTags] = useState(csv(initial.tags));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const starValues: Record<string, [string, (v: string) => void]> = {
    situation: [situation, setSituation],
    task: [task, setTask],
    action: [action, setAction],
    result: [result, setResult],
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const input: StarStoryInput = {
      title: title.trim(),
      situation: situation.trim(),
      task: task.trim(),
      action: action.trim(),
      result: result.trim(),
      skills: fromCsv(skills),
      leadershipPrinciples: fromCsv(principles),
      suggestedQuestions: fromLines(questions),
      tags: fromCsv(tags),
      sourceProject: initial.sourceProject,
    };
    const res = await onSubmit(input);
    setSaving(false);
    if (!res.ok) setError(res.error ?? "Could not save the story.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
      aria-label={heading}
    >
      <h3 className="text-base font-semibold">{heading}</h3>

      <div className="space-y-1.5">
        <Label htmlFor="story-title">Title</Label>
        <Input
          id="story-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Cut checkout latency by 40%"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STAR_SECTIONS.map(({ key, label }) => {
          const [value, setValue] = starValues[key];
          return (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`story-${key}`}>{label}</Label>
              <Textarea
                id={`story-${key}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="min-h-[96px]"
                required
              />
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="story-skills">Skills (comma-separated)</Label>
          <Input
            id="story-skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="distributed systems, profiling, mentoring"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="story-principles">
            Leadership principles (comma-separated)
          </Label>
          <Input
            id="story-principles"
            value={principles}
            onChange={(e) => setPrinciples(e.target.value)}
            placeholder="Ownership, Bias for Action"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="story-questions">
          Suggested behavioral questions (one per line)
        </Label>
        <Textarea
          id="story-questions"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          className="min-h-[80px]"
          placeholder={"Tell me about a time you improved performance.\nDescribe a difficult technical trade-off."}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="story-tags">Tags (comma-separated)</Label>
        <Input
          id="story-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="performance, leadership"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
