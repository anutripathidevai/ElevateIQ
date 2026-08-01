import type { Metadata } from "next";
import {
  AiMockSection,
  CareerLevelsSection,
  CommandCenterSection,
  CompanySection,
  Faq,
  FAQS,
  FinalCta,
  FounderSection,
  Hero,
  JourneySection,
  LearningSection,
  PracticeSection,
  ReadinessSection,
  SectionHeading,
} from "@/components/marketing";

export const metadata: Metadata = {
  title: "Compile Ready | Software Engineering Interview Prep",
  description:
    "Learn, practice, and get interview-ready with DSA, System Design, LLD, coding practice, AI mock interviews, and structured learning paths.",
  alternates: { canonical: "/" },
};

/** FAQPage structured data — only the questions/answers actually shown below. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Hero />
      <JourneySection />
      <CommandCenterSection />
      <AiMockSection />
      <LearningSection />
      <PracticeSection />
      <CompanySection />
      <CareerLevelsSection />
      <ReadinessSection />
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
