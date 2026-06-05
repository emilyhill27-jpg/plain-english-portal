import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <>
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">About Plainly</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              A governed plain-language system for organisations, built in
              Aotearoa New Zealand.
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl space-y-6 text-ink-mid leading-relaxed">
            <p>
              Important documents — benefit letters, tenancy agreements,
              insurance policies, school notices — are written for the
              system, not for the people who need to understand them. The
              consequences of that gap are real: missed deadlines, lost rights,
              unnecessary stress.
            </p>
            <p>
              Plainly helps organisations bridge that gap. We give them a
              governed way to offer plain-language explanations of the documents
              they already send — without replacing the documents themselves.
            </p>
            <p>
              The system is built around constraint. A closed input surface.
              A four-layer rulebook. Validation before display. Organisations
              approve the document set, and Plainly works within those
              boundaries.
            </p>
            <p>
              We are based in the Far North of New Zealand, and we build for
              the communities that live with complex paperwork every day.
            </p>
            <div className="pt-4">
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
