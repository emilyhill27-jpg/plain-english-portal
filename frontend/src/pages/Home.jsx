import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileCheck, Building2, Layers, Shield, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "1",
    title: "Organisation approves documents",
    desc: "You choose which document types Plainly can explain. Only approved documents enter the system.",
    Icon: FileCheck,
  },
  {
    step: "2",
    title: "Users select from the approved list",
    desc: "End users pick a document from the list your organisation defined. No uploads, no surprises.",
    Icon: Building2,
  },
  {
    step: "3",
    title: "Plainly explains, governed by the rulebook",
    desc: "Every explanation follows a four-layer rulebook: non-negotiable rules, domain vocabulary, sector guardrails, and compliance validation.",
    Icon: Layers,
  },
  {
    step: "4",
    title: "Organisation stays in control",
    desc: "Full audit trail. Update documents, adjust the approved list, review usage. You set the boundaries.",
    Icon: Shield,
  },
];

const RULEBOOK = [
  {
    layer: "L1",
    title: "Non-negotiable rules",
    desc: "Loaded into every prompt. No advice, no speculation, no guessing. Preserve meaning, define terms, name the actor.",
  },
  {
    layer: "L2",
    title: "Domain vocabulary",
    desc: "Sector-specific terms and governing legislation. An MSD letter uses different rules than an insurance policy.",
  },
  {
    layer: "L3",
    title: "Sector guardrails",
    desc: "Per-sector output format, vocabulary constraints, and explicit no-advice boundaries.",
  },
  {
    layer: "L4",
    title: "Compliance validation",
    desc: "Automated checks before anything reaches the reader. Missing information, added information, order, and language quality.",
  },
];

const SECTORS = [
  { name: "Schools", docs: "Enrolment forms, consent forms, school reports" },
  { name: "Community law", docs: "Legal summaries, rights notices, process guides" },
  { name: "Citizens Advice", docs: "Benefit letters, tenancy agreements, complaints forms" },
  { name: "Insurance brokers", docs: "Policy documents, claim forms, disclosure statements" },
  { name: "GP practices", docs: "Patient letters, consent forms, referral notices" },
  { name: "Councils", docs: "Rate notices, consent applications, bylaw summaries" },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4">Governed plain language for organisations</Badge>
            <h1 className="text-4xl font-bold leading-tight text-ink md:text-5xl">
              Important documents, written for the people who need them
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-mid">
              Tenancy agreements, benefit letters, insurance policies, school notices
              — written for the system, not the reader. Plainly gives organisations
              a governed way to explain these documents in plain language.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild>
                <Link to="/request-pilot">
                  Request a pilot
                  <ArrowRight />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works summary ── */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-ink md:text-3xl">
              How Plainly works
            </h2>
            <p className="mt-4 text-ink-mid">
              A governed loop — not an open prompt. Your organisation stays in control
              at every step.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            {STEPS.map((item) => (
              <Card key={item.step} className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-accent-light text-accent">
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      Step {item.step}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-mid">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="link" asChild>
              <Link to="/how-it-works">
                Read the full rulebook <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Rulebook summary ── */}
      <section className="border-y border-frame bg-frame-bg section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-ink md:text-3xl">
              A four-layer rulebook, not an open prompt
            </h2>
            <p className="mt-4 text-ink-mid">
              Every explanation Plainly produces passes through four governance layers
              before it reaches the reader.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {RULEBOOK.map((item) => (
              <div
                key={item.layer}
                className="flex items-start gap-4 rounded-lg border border-frame bg-white p-5"
              >
                <Badge className="mt-0.5 flex-shrink-0 font-bold">
                  {item.layer}
                </Badge>
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-mid">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}

            <p className="mt-6 text-center text-sm text-ink-soft">
              If the system is not confident, it returns a safe fallback —
              "we can't confidently explain this part" —
              instead of guessing.
            </p>
          </div>
        </div>
      </section>

      {/* ── For organisations teaser ── */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-ink md:text-3xl">
              Built for organisations that send complex documents
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-mid">
              Defined audience. Defined document set. Real consequences when people
              don't understand.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((sector) => (
              <Card key={sector.name} className="p-5">
                <h3 className="text-sm font-semibold text-ink">
                  {sector.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mid">
                  {sector.docs}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="link" asChild>
              <Link to="/for-organisations">
                See how it works for your organisation <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Pilot CTA ── */}
      <section className="border-t border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-ink md:text-3xl">
              Start with a pilot
            </h2>
            <p className="mt-4 text-ink-mid">
              A short, scoped engagement — 6 to 8 weeks, 5 to 20 approved
              documents, one sector layer. We review together and give you a written
              report. A real person replies.
            </p>
            <div className="mt-8">
              <Button asChild>
                <Link to="/request-pilot">
                  Request a pilot
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
