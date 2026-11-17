import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell, LEGAL_LAST_UPDATED, type LegalTocItem } from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for TVET Hub (operated by Clarix Innovators), governing marketplace purchases, Project Studio, and author uploads.",
  alternates: {
    canonical: "/terms",
  },
};

const TOC: LegalTocItem[] = [
  { id: "acceptance", label: "Acceptance & Eligibility" },
  { id: "the-service", label: "The Service & Lifetime Access" },
  { id: "licence-integrity", label: "Licence, Restrictions & Academic Integrity" },
  { id: "author-terms", label: "Seller & Author Terms" },
  { id: "refund-policy", label: "Refund Policy" },
  { id: "ip-takedown", label: "Intellectual Property & Takedowns" },
  { id: "disclaimers-liability", label: "Disclaimers & Limitation of Liability" },
  { id: "governing-law", label: "Termination, Governing Law & Contact" },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      badge="Terms & Conditions"
      lastUpdated={LEGAL_LAST_UPDATED}
      toc={TOC}
    >
      <p>
        These Terms of Service govern your use of <strong>TVET Hub</strong>{" "}
        (<strong>https://www.tvethub.co.ke</strong>), operated by{" "}
        <strong>Clarix Innovators</strong> (Business Registration No.{" "}
        <strong>BN-36SMPL5P</strong>, Nairobi, Kenya). By creating an account, browsing, or
        purchasing materials, you form a binding electronic agreement under the{" "}
        <strong>Kenya Information and Communications Act (Cap. 411A)</strong> and agree to these
        terms and our{" "}
        <Link href="/privacy" className="font-semibold text-[#092B68] hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <section id="acceptance" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          1. Acceptance, Eligibility &amp; Account Security
        </h2>
        <p>
          You must provide accurate information when registering and keep your login credentials
          secure. You are responsible for all activity under your account. Users under 18 may only
          use TVET Hub with a parent or guardian&apos;s consent. Trainer/supervisor accounts require
          administrator approval before access is enabled.
        </p>
      </section>

      <section id="the-service" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          2. The Service, Payments &amp; Lifetime Access
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            TVET Hub is an online marketplace and study workspace where TVET and diploma students
            can purchase and instantly download verified study materials (research projects,
            business plans, past papers, and lecture notes) as Word (.docx) or PDF files.
          </li>
          <li>
            All prices are listed in <strong>Kenyan Shillings (KES)</strong> and processed
            securely through <strong>Paystack</strong>.
          </li>
          <li>
            Once payment is confirmed, you receive instant digital delivery in your Library with{" "}
            <strong>lifetime access</strong> to re-download the purchased material for your personal
            study use, provided your account remains in good standing.
          </li>
        </ul>
      </section>

      <section id="licence-integrity" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          3. Licence, Restrictions &amp; Academic Integrity
        </h2>
        <p>
          Purchasing a resource grants you a personal, non-exclusive, non-transferable,
          non-commercial licence for your own study and reference. You must <strong>not</strong>:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Resell, redistribute, upload, or share purchased files publicly or with others.</li>
          <li>Share your account login with other users.</li>
          <li>
            Submit purchased reference projects or business plans word-for-word as your own
            original examination work.
          </li>
        </ul>
        <p>
          <strong>Academic Integrity Warning:</strong> All projects and guides are provided strictly
          as study references and structural examples. You are solely responsible for conducting
          your own original work and following your institution&apos;s and examining body&apos;s rules
          on plagiarism.
        </p>
      </section>

      <section id="author-terms" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          4. Seller &amp; Author Terms
        </h2>
        <p>
          Authors or trainers who upload or publish materials to TVET Hub confirm that:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>They own or hold all necessary rights to publish the uploaded content.</li>
          <li>The material is original, lawful, and not plagiarised or infringing.</li>
          <li>
            TVET Hub may review, edit metadata, reject, or remove any listing at its discretion.
          </li>
          <li>
            <strong>Revenue &amp; Payouts:</strong> Approved authors and trainers earn their
            applicable share of net sales (after payment-processing fees) as communicated during
            author onboarding or in their trainer agreement, subject to verification of completed
            orders.
          </li>
        </ul>
      </section>

      <section id="refund-policy" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          5. Refund Policy
        </h2>
        <p>
          Because products are instant digital downloads, all completed sales are generally final.
          However, we will consider a full refund or replacement if:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>You were charged twice (duplicate charge) for the same item.</li>
          <li>Payment succeeded on Paystack but the item failed to unlock in your Library.</li>
          <li>The downloaded file is corrupted, unreadable, or materially different from its listing.</li>
        </ul>
        <p>
          Refund requests must be emailed to{" "}
          <a href="mailto:codepro.source@gmail.com" className="font-semibold text-[#092B68] hover:underline">
            codepro.source@gmail.com
          </a>{" "}
          within <strong>7 days</strong> of purchase, including your email address and Paystack
          transaction reference, in line with applicable provisions of the{" "}
          <strong>Consumer Protection Act, 2012 (No. 46 of 2012)</strong>.
        </p>
      </section>

      <section id="ip-takedown" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          6. Intellectual Property &amp; Copyright Takedowns
        </h2>
        <p>
          All platform branding, software, and original TVET Hub content are protected under the{" "}
          <strong>Copyright Act (Cap. 130, Laws of Kenya)</strong> and belong to Clarix Innovators
          or their respective authors. If you believe a listing infringes your copyright, send a
          takedown notice under the Copyright Act to{" "}
          <a href="mailto:codepro.source@gmail.com" className="font-semibold text-[#092B68] hover:underline">
            codepro.source@gmail.com
          </a>{" "}
          with the listing URL, proof of ownership, and your contact details so we can investigate
          and remove infringing material promptly.
        </p>
      </section>

      <section id="disclaimers-liability" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          7. Disclaimers &amp; Limitation of Liability
        </h2>
        <p>
          Study materials are provided &ldquo;as is&rdquo; for educational assistance. TVET Hub
          does not guarantee specific examination grades, assessment scores, or KNEC outcomes, and is{" "}
          <strong>
            not affiliated with or endorsed by the Kenya National Examinations Council (KNEC)
          </strong>{" "}
          established under the Kenya National Examinations Council Act, 2012.
        </p>
        <p>
          To the maximum extent permitted by Kenyan law, Clarix Innovators is not liable for
          indirect or consequential damages, and our total liability for any claim related to a
          purchase is limited to the amount you paid for that item.
        </p>
      </section>

      <section id="governing-law" className="space-y-2 scroll-mt-20">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          8. Suspension, Governing Law &amp; Contact
        </h2>
        <p>
          We may suspend or terminate accounts that violate these terms (such as file
          redistribution or payment fraud). We may update these Terms of Service by posting a new
          &ldquo;Last updated&rdquo; date on this page.
        </p>
        <p>
          These terms are governed by the laws of the <strong>Republic of Kenya</strong>, and any
          disputes shall be resolved in the courts of Kenya in Nairobi after good-faith efforts to
          resolve the matter amicably.
        </p>
        <p>
          <strong>Contact:</strong> Clarix Innovators (trading as TVET Hub) · Reg. No. BN-36SMPL5P ·
          Nairobi, Kenya ·{" "}
          <a href="mailto:codepro.source@gmail.com" className="font-semibold text-[#092B68] hover:underline">
            codepro.source@gmail.com
          </a>
        </p>
      </section>
    </LegalPageShell>
  );
}
