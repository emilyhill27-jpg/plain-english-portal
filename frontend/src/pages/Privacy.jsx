export default function Privacy() {
  return (
    <>
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">Privacy</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              How Plainly handles your information.
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-ink">Overview</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                Plainly is designed around data minimisation. We process
                documents in-session and do not retain document content beyond
                what is needed to produce the explanation. We do not sell,
                share, or use your data for any purpose other than providing
                the Plainly service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">What we collect</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-mid">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">&bull;</span>
                  <span><strong>Pilot enquiry form:</strong> Organisation name, contact name, role, email, sector, region, approximate users, documents in scope, and free-text notes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">&bull;</span>
                  <span><strong>Usage metadata:</strong> Document type, timestamp, and sector category. No document content is stored.</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">AI processing</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                Plainly uses the Anthropic API (Claude) to produce
                plain-language explanations. Document content is sent to
                Anthropic for processing and is subject to Anthropic&rsquo;s
                data handling practices. Anthropic does not train on data sent
                via their API.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">Your rights</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                Under the New Zealand Privacy Act 2020, you have the right to
                access, correct, and request deletion of your personal
                information. Contact us at{" "}
                <a href="mailto:hello@tryplainly.co.nz" className="text-accent no-underline hover:underline">
                  hello@tryplainly.co.nz
                </a>.
              </p>
            </div>

            <p className="text-xs text-ink-faint">
              Last updated: June 2026
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
