import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Check, Shield, Layers, Eye, Lock, Users, Database } from "lucide-react";

const SECURITY_ITEMS = [
  {
    title: "Closed input surface",
    desc: "Users select from a pre-approved document list. There is no upload button, no free-text input, and no way to submit arbitrary content. The system only processes what your organisation has approved.",
    Icon: Lock,
  },
  {
    title: "Layered rulebook",
    desc: "Every explanation passes through four governance layers: non-negotiable rules, domain vocabulary, sector guardrails, and compliance validation. No layer can override the one above it.",
    Icon: Layers,
  },
  {
    title: "Validation before display",
    desc: "Automated compliance checks run on every explanation before it reaches the reader. Missing information, added information, order changes, and language quality are all checked. Failed checks are flagged, not silently passed.",
    Icon: Shield,
  },
  {
    title: "Role-based access",
    desc: "Organisation administrators control the document set, review audit logs, and manage configuration. End users see only the approved documents relevant to them.",
    Icon: Users,
  },
  {
    title: "Audit visibility",
    desc: "Full audit trail of what was explained, when, and for which document. Organisations can review usage patterns and identify which documents people need help with most.",
    Icon: Eye,
  },
  {
    title: "Data minimisation",
    desc: "Plainly processes documents in-session. We minimise what is stored and do not retain document content beyond what is needed to produce the explanation. Secure transport throughout.",
    Icon: Database,
  },
];

const FAQS = [
  {
    q: "Can users upload their own documents?",
    a: "No. Users select from a list of documents that your organisation has approved. There is no upload function and no free-text input. The input surface is closed by design.",
  },
  {
    q: "Does Plainly give legal, medical, or financial advice?",
    a: "No. Plainly explains what a document says in plain language. It never tells someone what to do, recommends a course of action, or interprets legal, medical, or financial implications. This boundary is enforced at the rulebook level.",
  },
  {
    q: "What happens when the system isn't confident?",
    a: "It says so. If Plainly cannot confidently explain a part of the document, it returns a safe fallback — \"we can't confidently explain this part\" — instead of guessing. This is a non-negotiable rule.",
  },
  {
    q: "Where is data processed and stored?",
    a: "Documents are processed in-session via the Anthropic API (Claude). We minimise storage and do not retain document content beyond what is needed for the explanation. Secure transport (HTTPS/TLS) throughout.",
  },
  {
    q: "Can we co-brand the tool?",
    a: "Plainly is Plainly-branded by default. Co-branding is available where appropriate for your context — talk to us during the pilot.",
  },
];

const ACCESSIBILITY = [
  "WCAG 2.2 AA compliance throughout",
  "COGA cognitive accessibility guidelines",
  "Lexend typeface — designed to reduce visual stress",
  "Reader controls: text size, line spacing, font, background tint",
  "Audio playback with speed and voice controls",
  "Predictable layout — no surprise interactions or motion",
];

export default function Security() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">
              Security &amp; trust
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              Plainly is designed around constraint, not capability.
              A closed input surface, layered governance, and validation
              before display.
            </p>
          </div>
        </div>
      </section>

      {/* Security model */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold text-ink">
              Security by design
            </h2>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {SECURITY_ITEMS.map((item) => (
                <Card key={item.title} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-accent-light">
                      <item.Icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-sm">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-mid">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="border-y border-frame bg-frame-bg section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold text-ink">
              Accessibility commitments
            </h2>
            <p className="mt-4 text-center text-ink-mid">
              Plainly is designed for neuroinclusive accessibility from the ground up
              — not as an afterthought.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {ACCESSIBILITY.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-frame bg-white p-4">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-safe" />
                  <span className="text-sm text-ink-mid">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm text-ink-soft">
              For full details, see our{" "}
              <Link to="/accessibility" className="text-accent no-underline hover:underline">
                Accessibility page
              </Link>.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ — Accordion */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold text-ink">
              Questions evaluators ask
            </h2>

            <div className="mt-12">
              <Accordion type="single">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger value={`faq-${i}`}>
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent value={`faq-${i}`}>
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-ink">
              Ready to evaluate?
            </h2>
            <p className="mt-4 text-ink-mid">
              Start with a pilot and see the governance model working with your
              own documents.
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
