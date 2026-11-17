import type { Metadata } from "next";
import { LegalPageShell, LEGAL_LAST_UPDATED, type LegalTocItem } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for TVET Hub (operated by Clarix Innovators) under the Kenya Data Protection Act, 2019.",
  alternates: {
    canonical: "/privacy",
  },
};

const TOC: LegalTocItem[] = [
  { id: "who-we-are", label: "Who We Are & Contact" },
  { id: "data-we-collect", label: "Data We Collect" },
  { id: "how-we-use-data", label: "How We Use Your Data" },
  { id: "google-user-data", label: "Google Sign-In & User Data" },
  { id: "third-party-processors", label: "Third-Party Processors" },
  { id: "legal-basis-rights", label: "Legal Basis & Your Rights (Kenya DPA)" },
  { id: "retention-security", label: "Retention, Security & Transfers" },
  { id: "children-cookies", label: "Children & Cookies" },
  { id: "changes-complaints", label: "Changes & Complaints (ODPC)" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      badge="Kenya Data Protection Act, 2019"
      lastUpdated={LEGAL_LAST_UPDATED}
      toc={TOC}
    >
      <p>
        This Privacy Policy explains how <strong>Clarix Innovators</strong> (registered in the
        Republic of Kenya under Business Registration No. <strong>BN-36SMPL5P</strong>, trading as{" "}
        <strong>TVET Hub</strong> at <strong>https://www.tvethub.co.ke</strong>) collects, uses,
        stores, and protects your personal data in compliance with the{" "}
        <strong>Data Protection Act, 2019 (No. 24 of 2019)</strong> and the{" "}
        <strong>Data Protection (General) Regulations, 2021</strong> of Kenya.
      </p>

      <section id="who-we-are" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          1. Who We Are &amp; Contact Details
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Data Controller:</strong> Clarix Innovators (trading as TVET Hub)
          </li>
          <li>
            <strong>Business Registration No.:</strong> BN-36SMPL5P (Registration of Business Names Act, Cap. 499, Laws of Kenya)
          </li>
          <li>
            <strong>Location:</strong> Nairobi, Kenya
          </li>
          <li>
            <strong>Email:</strong>{" "}
            <a href="mailto:codepro.source@gmail.com" className="font-semibold text-[#092B68] hover:underline">
              codepro.source@gmail.com
            </a>
          </li>
        </ul>
      </section>

      <section id="data-we-collect" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          2. Data We Collect
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account information:</strong> Your full name, email address, role (student,
            trainer/supervisor, or administrator), and optional admission number or institution code.
          </li>
          <li>
            <strong>Google profile basics:</strong> When you sign in with Google, we receive your
            name, email address, and profile picture from Google.
          </li>
          <li>
            <strong>Purchase and workspace history:</strong> Records of study materials you
            purchase, download counts, reviews, and Project Studio drafts or personalization
            details you save.
          </li>
          <li>
            <strong>Payment confirmation details:</strong> Transaction references and payment
            status returned by Paystack. We do <strong>not</strong> store your card numbers, CVV,
            or mobile money (M-Pesa) PINs—payments are processed directly by Paystack.
          </li>
          <li>
            <strong>Device, usage, and cookie data:</strong> Essential session cookies and basic
            server logs (such as IP address and browser user-agent) needed to keep you signed in
            and protect the platform.
          </li>
        </ul>
      </section>

      <section id="how-we-use-data" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          3. How We Use Your Data
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Create, verify, and secure your TVET Hub account.</li>
          <li>Deliver purchased PDF/Word study materials and lifetime Library access.</li>
          <li>Send account confirmation, password, and purchase receipt emails.</li>
          <li>Prevent fraud, unauthorized downloads, and abuse of the platform.</li>
          <li>Improve site reliability, study tools, and customer support.</li>
          <li>Comply with applicable legal and tax obligations in Kenya.</li>
        </ul>
      </section>

      <section id="google-user-data" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          4. Google Sign-In &amp; Google User Data
        </h2>
        <p>
          When you use <strong>Continue with Google</strong>, TVET Hub accesses your Google
          account solely to authenticate you and read your basic profile (name, email address, and
          profile picture). We do not sell Google user data, use it for third-party advertising, or
          share it with data brokers.
        </p>
        <p>
          Our use and transfer of information received from Google APIs adheres to the{" "}
          <strong>Google API Services User Data Policy</strong>, including the{" "}
          <strong>Limited Use</strong> requirements.
        </p>
      </section>

      <section id="third-party-processors" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          5. Third-Party Service Providers
        </h2>
        <p>We share data only with trusted processors required to operate TVET Hub:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase:</strong> Authentication, PostgreSQL database, and file storage.
          </li>
          <li>
            <strong>Paystack:</strong> Checkout and payment confirmation in Kenyan Shillings (KES).
          </li>
          <li>
            <strong>Resend:</strong> Transactional account confirmation and notification emails.
          </li>
          <li>
            <strong>Google:</strong> OAuth sign-in authentication (when you choose Google login).
          </li>
          <li>
            <strong>Groq &amp; Google Gemini:</strong> Optional AI-assisted drafting and document
            review inside Project Studio (only text submitted in Studio is processed).
          </li>
          <li>
            <strong>Vercel / Cloudflare:</strong> Web hosting, edge routing, and DDoS protection.
          </li>
        </ul>
      </section>

      <section id="legal-basis-rights" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          6. Legal Basis &amp; Your Rights Under the Data Protection Act, 2019
        </h2>
        <p>
          Under Section 30 of the Data Protection Act, 2019, we process your personal data based on
          contract performance (delivering your account and purchased downloads), your consent (such
          as optional Google sign-in), our legitimate interests (platform security and fraud
          prevention), and compliance with Kenyan statutory obligations.
        </p>
        <p>Under Section 26 of the Act, you have the right to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Be informed of the use to which your personal data is to be put.</li>
          <li>Request access to the personal data we hold about you.</li>
          <li>Request correction or deletion of false, inaccurate, or misleading data.</li>
          <li>Object to the processing of all or part of your personal data.</li>
          <li>Request data portability in a structured, commonly used electronic format.</li>
        </ul>
        <p>
          To exercise any of these rights, email{" "}
          <a href="mailto:codepro.source@gmail.com" className="font-semibold text-[#092B68] hover:underline">
            codepro.source@gmail.com
          </a>
          . We will verify your identity and respond within the timelines prescribed under the Data
          Protection (General) Regulations, 2021.
        </p>
      </section>

      <section id="retention-security" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          7. Data Retention, Security &amp; International Transfers
        </h2>
        <p>
          We keep your account and purchase records for as long as your account remains active so
          you can maintain lifetime access to purchased materials, or as required for accounting
          and tax compliance.
        </p>
        <p>
          All traffic is encrypted via HTTPS, passwords are never stored in plain text, and
          database access is enforced via Row-Level Security (RLS). Some service providers (such as
          Supabase, Resend, Vercel, and Google) may process or store data on servers outside Kenya
          with appropriate contractual and technical safeguards.
        </p>
      </section>

      <section id="children-cookies" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          8. Children &amp; Cookies
        </h2>
        <p>
          TVET Hub is intended for post-secondary, TVET, and diploma learners. Persons under 18
          years of age may only use the platform with the consent and supervision of a parent or
          legal guardian.
        </p>
        <p>
          We use strictly necessary cookies to manage authentication sessions and remember local
          document personalization preferences. We do not use third-party advertising cookies.
        </p>
      </section>

      <section id="changes-complaints" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          9. Changes &amp; How to Complain
        </h2>
        <p>
          We may update this Privacy Policy from time to time and will update the &ldquo;Last
          updated&rdquo; date at the top of this page.
        </p>
        <p>
          If you have a concern about how your data is handled, please contact us first at{" "}
          <a href="mailto:codepro.source@gmail.com" className="font-semibold text-[#092B68] hover:underline">
            codepro.source@gmail.com
          </a>
          . Under Section 56 of the Data Protection Act, 2019, you also have the right to lodge a
          complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong>,
          Nairobi, Kenya.
        </p>
      </section>
    </LegalPageShell>
  );
}
