import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/marketing";
import { Reveal } from "@/components/marketing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free and go deep when you're ready. Compile Ready gives you learning paths, coding practice, and AI mock interviews to get interview-ready.",
  alternates: { canonical: "/pricing" },
};

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
  badge?: string;
};

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    description: "Everything you need to start building interview skills.",
    features: [
      "Full DSA, System Design & LLD learning tracks",
      "Company question bank access",
      "Coding practice with patterns",
      "Progress tracking & bookmarks",
    ],
    cta: { label: "Get Started", href: "/signup" },
  },
  {
    name: "Pro",
    price: "$0",
    cadence: "early access",
    description: "The complete interview command center. Free while in beta.",
    features: [
      "Everything in Starter",
      "Unlimited AI mock interviews",
      "Mock panel interviews (3 personas)",
      "Readiness analytics & improvement plans",
      "Interview history & timeline",
    ],
    cta: { label: "Start Preparing", href: "/signup" },
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Teams",
    price: "Custom",
    description: "For bootcamps, universities, and engineering teams.",
    features: [
      "Everything in Pro",
      "Cohort management & shared paths",
      "Team readiness reporting",
      "Priority support",
    ],
    cta: { label: "Contact Us", href: "/contact" },
  },
];

export default function PricingPage() {
  return (
    <div className="py-20 sm:py-24">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing. Start free."
          subtitle="Compile Ready is free while we're in early access. Learn, practice, and get interview-ready without a paywall."
        />

        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal
              key={tier.name}
              delay={i * 80}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8",
                tier.highlighted
                  ? "border-primary/60 bg-card shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                  : "border-border bg-card",
              )}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {tier.badge}
                </span>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {tier.price}
                </span>
                {tier.cadence && (
                  <span className="text-sm text-muted-foreground">
                    /{tier.cadence}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {tier.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.cta.href}
                className={cn(
                  buttonVariants({
                    size: "lg",
                    variant: tier.highlighted ? "default" : "outline",
                  }),
                  "group mt-8 w-full",
                )}
              >
                {tier.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted-foreground">
          Questions about pricing or team plans?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
