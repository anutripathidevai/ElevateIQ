"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthGuard } from "@/components/auth/guards";
import {
  LEARNING_TOPIC_OPTIONS,
  TARGET_ROLES,
  WEAK_AREA_OPTIONS,
} from "@/lib/types";

function toggle(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-primary bg-primary/15 text-foreground"
                : "border-border text-muted-foreground hover:bg-accent/60",
            )}
          >
            {active && <Check className="h-3.5 w-3.5 text-primary" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

function OnboardingForm() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const [targetRole, setTargetRole] = useState(
    user?.targetRole ?? TARGET_ROLES[1],
  );
  const [targetCompany, setTargetCompany] = useState(user?.targetCompany ?? "");
  const [interviewDate, setInterviewDate] = useState(user?.interviewDate ?? "");
  const [dailyStudyHours, setDailyStudyHours] = useState(
    String(user?.dailyStudyHours ?? 2),
  );
  const [weakAreas, setWeakAreas] = useState<string[]>(user?.weakAreas ?? []);
  const [learningTopics, setLearningTopics] = useState<string[]>(
    user?.learningTopics ?? [],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      targetRole,
      targetCompany: targetCompany.trim(),
      interviewDate: interviewDate || null,
      dailyStudyHours: Number(dailyStudyHours) || 1,
      weakAreas,
      learningTopics,
      onboarded: true,
    });
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold">
          Let&apos;s personalize your prep
        </h1>
        <p className="text-sm text-muted-foreground">
          A few details help us tailor your study plan and recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="targetRole">Target role</Label>
            <Select
              id="targetRole"
              className="w-full"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetCompany">Target company</Label>
            <Input
              id="targetCompany"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="Microsoft"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="interviewDate">Interview date</Label>
            <Input
              id="interviewDate"
              type="date"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dailyStudyHours">Daily study time (hours)</Label>
            <Input
              id="dailyStudyHours"
              type="number"
              min={1}
              max={12}
              value={dailyStudyHours}
              onChange={(e) => setDailyStudyHours(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Weak areas</Label>
          <ChipGroup
            options={WEAK_AREA_OPTIONS}
            selected={weakAreas}
            onToggle={(v) => setWeakAreas((s) => toggle(s, v))}
          />
        </div>

        <div className="space-y-2">
          <Label>Preferred learning topics</Label>
          <ChipGroup
            options={LEARNING_TOPIC_OPTIONS}
            selected={learningTopics}
            onToggle={(v) => setLearningTopics((s) => toggle(s, v))}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              updateProfile({ onboarded: true });
              router.push("/dashboard");
            }}
          >
            Skip for now
          </Button>
          <Button type="submit">Finish setup</Button>
        </div>
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <div className="flex justify-center">
        <OnboardingForm />
      </div>
    </AuthGuard>
  );
}
