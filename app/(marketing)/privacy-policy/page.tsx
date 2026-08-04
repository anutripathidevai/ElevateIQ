import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalPlaceholder } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Compile Ready handles your data: what we store, why, and your choices. We don't sell your data.",
  alternates: { canonical: "/privacy-policy" },
};

const EMAIL = "hello@compileready.com";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="August 4, 2026"
      intro="This Privacy Policy explains what information Compile Ready collects, how it is used, and the choices you have. It is written to be clear rather than exhaustive and is not a substitute for legal advice."
    >
      <h2>Who we are</h2>
      <p>
        Compile Ready (&quot;we&quot;, &quot;us&quot;) operates the website at{" "}
        <Link href="/">compileready.com</Link>, an educational platform that
        helps software engineers prepare for technical interviews. The legal
        entity responsible for this site is{" "}
        <LegalPlaceholder>[COMPANY LEGAL NAME]</LegalPlaceholder>, located at{" "}
        <LegalPlaceholder>[BUSINESS ADDRESS]</LegalPlaceholder>.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information.</strong> If you create an account, we
          store the details you provide, such as your name and email address, to
          identify you and personalize your experience.
        </li>
        <li>
          <strong>Learning activity.</strong> We store your progress —
          completed lessons, bookmarks, practice attempts, and interview
          results — so you can pick up where you left off and see your growth.
        </li>
        <li>
          <strong>Local storage.</strong> Some preferences (such as theme and
          layout settings) and, in the current version, your session are stored
          in your browser&apos;s local storage on your own device.
        </li>
        <li>
          <strong>Content you submit to AI features.</strong> When you use AI
          tools (mock interviews, code review, STAR stories), the text you
          provide is processed to generate feedback.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To provide, maintain, and improve the platform and its features.</li>
        <li>To save and display your learning progress and preferences.</li>
        <li>To generate AI-powered feedback that you explicitly request.</li>
        <li>To respond to your questions and support requests.</li>
      </ul>

      <h2>Cookies and local storage</h2>
      <p>
        Compile Ready uses your browser&apos;s local storage to keep you signed
        in and to remember preferences. We do not use third-party advertising
        cookies. If we introduce analytics or additional cookies in the future,
        this policy will be updated and, where required, we will ask for your
        consent.
      </p>

      <h2>How we share information</h2>
      <p>
        <strong>We do not sell your personal data.</strong> We may share
        information with service providers that help us operate the platform
        (for example, hosting and AI processing providers) strictly to perform
        services on our behalf, or where required by law.
      </p>

      <h2>Third-party AI processing</h2>
      <p>
        AI features may send the content you submit to third-party model
        providers to generate responses. Do not submit confidential or sensitive
        personal information to AI features.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your information for as long as your account is active or as
        needed to provide the service. You can request deletion of your data at
        any time (see below).
      </p>

      <h2>Your choices and rights</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, or
        delete your personal data, or to object to certain processing. To
        exercise any of these rights, email us at{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. You can also clear locally
        stored data by signing out and clearing your browser storage.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        Compile Ready is intended for users who are at least 16 years old and is
        not directed at children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be
        reflected by the &quot;Last updated&quot; date above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or visit our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
