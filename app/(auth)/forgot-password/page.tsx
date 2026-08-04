"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"email" | "unavailable" | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        delivery?: "email" | "unavailable";
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setResult(data.delivery ?? "unavailable");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to start resetting your password.
        </p>
      </div>

      {result === "email" ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-success" />
          <p className="text-sm text-foreground">
            If an account exists for this email, password reset instructions
            will be sent.
          </p>
        </div>
      ) : result === "unavailable" ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-center">
          <Mail className="h-6 w-6 text-warning" />
          <p className="text-sm text-foreground">
            Self-service password reset by email isn&apos;t available yet. Please
            email{" "}
            <a
              href="mailto:support@compileready.com"
              className="font-medium text-primary hover:underline"
            >
              support@compileready.com
            </a>{" "}
            and we&apos;ll help you regain access.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-9"
                aria-invalid={Boolean(error)}
              />
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait…" : "Continue"}
          </Button>
        </form>
      )}

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
}
