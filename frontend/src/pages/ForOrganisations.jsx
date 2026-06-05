import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const SECTORS = [
  {
    name: "Schools",
    audience: "Students, parents, caregivers",
    docs: "Enrolment forms, consent forms, school reports, NCEA notices, behaviour agreements",
  },
  {
    name: "Community law centres",
    audience: "Community members seeking legal help",
    docs: "Legal summaries, rights notices, process guides, tribunal documents",
  },
  {
    name: "Citizens Advice Bureau",
    audience: "People navigating government and services",
    docs: "Benefit letters, tenancy agreements, complaints forms, entitlement guides",
  },
  {
    name: "Insurance brokers",
    audience: "Policyholders and claimants",
    docs: "Policy documents, claim forms, disclosure statements, renewal notices",
  },
  {
    name: "GP practices",
    audience: "Patients and their families",
    docs: "Patient letters, consent forms, referral notices, treatment plans",
  },
  {
    name: "Councils",
    audience: "Ratepayers and residents",
    docs: "Rate notices, resource consent applications, bylaw summaries, consultation documents",
  },
];

export default function ForOrganisations() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">
              For organisations
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              You send documents that matter. Your readers need to understand them.
              Plainly bridges that gap — governed, auditable, and under your control.
            </p>
          </div>
        </div>
      </section>

      {/* The pattern */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold text-ink">
              The pattern Plainly solves
            </h2>
            <p className="mt-4 text-center text-ink-mid">
              Your organisation sends documents to a defined audience. Those
              documents use language written for the system, not the reader. The
              consequences of misunderstanding are real — missed deadlines,
              wrong payments, lost rights, unnecessary stress.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Defined audience",
                  desc: "You know who reads these documents. Students, patients, tenants, claimants.",
                },
                {
                  label: "Defined document set",
                  desc: "You control which document types enter the system. No uploads, no surprises.",
                },
                {
                  label: "Real consequences",
                  desc: "When people don't understand, they miss deadlines, lose money, or give up.",
                },
              ].map((item) => (
                <Card key={item.label} className="p-5 text-center">
                  <h3 className="text-sm font-semibold text-ink">{item.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-mid">
                    {item.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="border-y border-frame bg-frame-bg section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-ink">
              Sectors we work with
            </h2>
            <p className="mt-4 text-ink-mid">
              Plainly is for organisations that send complex documents to people
              who need to act on them. Here are the sectors we support today.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SECTORS.map((sector) => (
              <Card key={sector.name} className="p-5">
                <h3 className="text-base font-semibold text-ink">
                  {sector.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-ink-faint uppercase tracking-wide">
                  {sector.audience}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-mid">
                  {sector.docs}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for orgs */}
      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold text-ink">
              What working with Plainly looks like
            </h2>

            <div className="mt-12 space-y-8">
              {[
                {
                  step: "1",
                  title: "You choose the documents",
                  desc: "Tell us which document types your audience needs help with. We configure Plainly to handle those documents using the right domain rules and vocabulary.",
                },
                {
                  step: "2",
                  title: "Plainly-branded by default",
                  desc: "The tool carries the Plainly brand. Co-branding is available if appropriate for your context. You don't need to build or maintain anything.",
                },
                {
                  step: "3",
                  title: "We handle support",
                  desc: "Your team doesn't field software questions. Plainly handles product support directly. Your team focuses on the work they already do.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent text-sm font-bold text-accent">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="mt-1 leading-relaxed text-ink-mid">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold text-ink">
              Interested?
            </h2>
            <p className="mt-4 text-ink-mid">
              Start with a short pilot — 6 to 8 weeks, your documents,
              your sector. A real person replies.
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
