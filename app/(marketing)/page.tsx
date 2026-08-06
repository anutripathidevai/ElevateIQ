import type { Metadata } from "next";
import {
  Faq,
  FAQS,
  FinalCta,
  FounderSection,
  Hero,
  LearningSection,
  SectionHeading,
  WhySection,
} from "@/components/marketing";
import { JsonLd } from "@/components/seo/json-ld";
import {
  faqJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/structured-data";

export const metadata: Metadata = {
  title: {
    absolute: "Compile Ready — AI-Powered Interview Preparation",
  },
  description:
    "The best way to prepare for your next software engineering interview. Exclusive content, company questions, guides, and AI mock interviews.",
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd
        data={[websiteJsonLd(), organizationJsonLd(), faqJsonLd(FAQS)]}
      />

      <Hero />
      <LearningSection />
      <WhySection />
      <FounderSection />

      <section id="faq" className="border-t border-border py-20 sm:py-24">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about getting interview-ready with Compile Ready."
          />
          <div className="mt-12">
            <Faq />
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
