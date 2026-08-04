import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important disclaimers about Compile Ready: educational use, AI-generated content, and third-party company names and trademarks.",
  alternates: { canonical: "/disclaimer" },
};

const EMAIL = "hello@compileready.com";

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      updated="August 4, 2026"
      intro="Compile Ready is an educational resource. The disclaimers below explain the limits of the content and tools we provide."
    >
      <h2>Educational purpose only</h2>
      <p>
        All content on Compile Ready — including explanations, questions, sample
        answers, and reference solutions — is provided for general educational
        and informational purposes. It does not constitute professional,
        career, legal, or financial advice.
      </p>

      <h2>AI-generated content</h2>
      <p>
        Compile Ready includes content and feedback produced by artificial
        intelligence, such as AI mock interviews, code and design review,
        generated explanations, and STAR stories. AI-generated content may
        contain inaccuracies, omissions, or outdated information. Always verify
        important information independently and use your own judgment. AI
        feedback is a study aid, not an authoritative evaluation.
      </p>

      <h2>No guarantee of results</h2>
      <p>
        We do not guarantee any specific outcome, including passing an interview,
        receiving a job offer, or achieving a particular skill level. Your
        results depend on many factors outside our control.
      </p>

      <h2>Company names and trademarks</h2>
      <p>
        Company names, product names, logos, and trademarks referenced on
        Compile Ready are the property of their respective owners and are used
        for identification and informational purposes only.{" "}
        <strong>
          Compile Ready is not affiliated with, authorized by, or endorsed by any
          of these companies unless explicitly stated.
        </strong>{" "}
        References to a company&apos;s interview process reflect general,
        community-informed preparation guidance and do not represent official
        materials of, or confidential information from, those companies.
      </p>

      <h2>Third-party content and links</h2>
      <p>
        The platform may reference or link to third-party resources. We are not
        responsible for the accuracy, availability, or content of external
        sites, and inclusion does not imply endorsement.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this disclaimer? Email{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
