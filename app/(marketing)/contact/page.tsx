import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/marketing";
import { Reveal } from "@/components/marketing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Compile Ready — questions, feedback, team plans, or just to say hello.",
  alternates: { canonical: "/contact" },
};

const EMAIL = "hello@compileready.com";

export default function ContactPage() {
  return (
    <div className="py-20 sm:py-24">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title="Let's talk."
          subtitle="Questions, feedback, partnership ideas, or team plans — we'd love to hear from you."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2">
          <Reveal className="flex flex-col rounded-2xl border border-border bg-card p-8">
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">Email us</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              The fastest way to reach us. We read every message and usually
              reply within a couple of days.
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
            >
              {EMAIL}
            </a>
          </Reveal>

          <Reveal
            delay={80}
            className="flex flex-col rounded-2xl border border-border bg-card p-8"
          >
            <MessageSquare className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">Product feedback</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              Found a bug or have a feature idea? Compile Ready is built in the
              open and shaped by learners like you.
            </p>
            <a
              href={`mailto:${EMAIL}?subject=Compile%20Ready%20feedback`}
              className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
            >
              Share feedback
            </a>
          </Reveal>
        </div>

        <section
          id="support"
          className="mx-auto mt-16 max-w-4xl scroll-mt-24 rounded-2xl border border-border bg-card p-8 sm:p-10"
        >
          <div className="flex items-center gap-3">
            <Coffee className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Support the Builder</h2>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Compile Ready is an independent project built to help engineers
            prepare for interviews without a paywall. If it helped you, the best
            way to support it is to share it with a friend who&apos;s job
            hunting, or send a note about what you&apos;d like to see next.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${EMAIL}?subject=Supporting%20Compile%20Ready`}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Say hello
            </a>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Start Preparing
            </Link>
          </div>
        </section>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          <section
            id="privacy"
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-8"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Privacy</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your learning progress and preferences are stored to power your
              experience. We don&apos;t sell your data. For any privacy question
              or a data-deletion request, email{" "}
              <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                {EMAIL}
              </a>
              .
            </p>
          </section>

          <section
            id="terms"
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-8"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Terms</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Compile Ready is provided as-is during early access to help you
              prepare for technical interviews. Content is for educational
              purposes. Reach out at{" "}
              <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">
                {EMAIL}
              </a>{" "}
              with any questions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
