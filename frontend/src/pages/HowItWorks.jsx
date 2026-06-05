import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GOVERNED_LOOP = [
  {
    step: "1",
    title: "Organisation approves the document set",
    desc: "Before anything enters Plainly, your organisation decides which documents it should handle. Tenancy agreements, benefit letters, enrolment forms, insurance policies — you choose. Only approved document types are available to users. Nothing else gets in.",
  },
  {
    step: "2",
    title: "Users select from the approved list",
    desc: "End users see a list of the documents your organisation has approved. They pick the one they need. There is no upload button, no free-text input, no way to submit arbitrary content. The input surface is closed by design.",
  },
  {
    step: "3",
    title: "Plainly explains, governed by the rulebook",
    desc: "Every explanation follows a four-layer rulebook. Non-negotiable rules, domain vocabulary, sector guardrails, and compliance validation — all applied before the explanation reaches the reader. If the system is not confident about any part, it says so instead of guessing.",
  },
  {
    step: "4",
    title: "Organisation stays in control",
    desc: "Full audit trail of what was explained and when. Update the approved document list at any time. Review usage patterns to see which documents people need help with most. You set the boundaries — Plainly works within them.",
  },
];

const RULEBOOK = [
  {
    layer: "L1",
    title: "Non-negotiable rules",
    desc: "Loaded into every single prompt. These rules cannot be overridden by any other layer.",
    details: [
      "Never give legal, medical, or financial advice",
      "Never speculate or add information not in the source",
      "Preserve the meaning and structure of the original",
      "Define terms inline, name the actor, be explicit",
      "If not confident, say so instead of guessing",
    ],
  },
  {
    layer: "L2",
    title: "Domain vocabulary",
    desc: "Sector-specific terms, definitions, and governing NZ legislation. An MSD benefit letter uses different domain rules than a tenancy agreement or insurance policy.",
    details: [
      "Currently covering 11 sector categories",
      "MSD/Benefits, Health, Legal/Tribunal, Criminal, H&S, Employment, IRD/Tax, Insurance, Property/Tenancy, General Government, and a catch-all",
    ],
  },
  {
    layer: "L3",
    title: "Sector guardrails",
    desc: "Per-sector output format rules, vocabulary constraints, and explicit no-advice boundaries. Each sector category has its own guardrail file loaded at prompt time.",
  },
  {
    layer: "L4",
    title: "Compliance validation",
    desc: "Automated checks run on every explanation before it reaches the reader. Catches: missing information, added information, order changes, and language quality issues. If validation fails, the explanation is flagged — not silently passed through.",
  },
];

export default function HowItWorks() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">
              How Plainly works
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              A governed loop that keeps your organisation in control.
              Not an open prompt — a closed, auditable system.
            </p>
          </div>
        </div>
      </section>

      {/* Four-step governed loop */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold text-ink">
              The governed loop
            </h2>
            <p className="mt-3 text-center text-ink-mid">
              Four steps. Your organisation controls all of them.
            </p>

            <div className="mt-14 space-y-10">
              {GOVERNED_LOOP.map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-ink-mid">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rulebook detail */}
      <section id="rulebook" className="scroll-mt-20 border-y border-frame bg-frame-bg section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold text-ink">
              The rulebook
            </h2>
            <p className="mt-3 text-center text-ink-mid">
              Every explanation passes through four layers of governance before
              it reaches the reader.
            </p>

            <div className="mt-12 space-y-6">
              {RULEBOOK.map((item) => (
                <div key={item.layer} className="rounded-lg border border-frame bg-white p-6">
                  <div className="flex items-center gap-3">
                    <Badge className="font-bold">{item.layer}</Badge>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-mid">
                    {item.desc}
                  </p>
                  {item.details && (
                    <ul className="mt-4 space-y-2 text-sm text-ink-mid">
                      {item.details.map((d) => (
                        <li key={d} className="flex gap-2">
                          <span className="mt-0.5 text-accent">&#8226;</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-ink">
              See it in practice
            </h2>
            <p className="mt-4 text-ink-mid">
              A pilot gives you a working system with your own documents
              in 6 to 8 weeks.
            </p>
            <div className="mt-8">
              <Button asChild>
                <Link to="/request-pilot">Request a pilot</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
