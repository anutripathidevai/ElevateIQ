"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { GuestGuard } from "@/components/auth/guards";
import {
  EXPERIENCE_LEVELS,
  TARGET_ROLES,
  type ExperienceLevel,
} from "@/lib/types";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  targetRole: string;
  targetCompany: string;
  experienceLevel: ExperienceLevel;
  dailyStudyHours: string;
}

const INITIAL: FormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  targetRole: TARGET_ROLES[1],
  targetCompany: "",
  experienceLevel: "Intermediate",
  dailyStudyHours: "2",
};

function SignupForm() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    if (!form.password) next.password = "Password is required.";
    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    if (!form.targetCompany.trim()) next.targetCompany = "Target company is required.";
    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    signup({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      targetRole: form.targetRole,
      targetCompany: form.targetCompany.trim(),
      experienceLevel: form.experienceLevel,
      dailyStudyHours: Number(form.dailyStudyHours) || 1,
    });
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start your personalized interview prep journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" error={errors.password}>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>
          <Field
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
          >
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Target role" htmlFor="targetRole">
            <Select
              id="targetRole"
              className="w-full"
              value={form.targetRole}
              onChange={(e) => set("targetRole", e.target.value)}
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Target company"
            htmlFor="targetCompany"
            error={errors.targetCompany}
          >
            <Input
              id="targetCompany"
              value={form.targetCompany}
              onChange={(e) => set("targetCompany", e.target.value)}
              placeholder="Microsoft"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Experience level" htmlFor="experienceLevel">
            <Select
              id="experienceLevel"
              className="w-full"
              value={form.experienceLevel}
              onChange={(e) =>
                set("experienceLevel", e.target.value as ExperienceLevel)
              }
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Study time / day (hours)" htmlFor="dailyStudyHours">
            <Input
              id="dailyStudyHours"
              type="number"
              min={1}
              max={12}
              value={form.dailyStudyHours}
              onChange={(e) => set("dailyStudyHours", e.target.value)}
            />
          </Field>
        </div>

        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupForm />
    </GuestGuard>
  );
}
