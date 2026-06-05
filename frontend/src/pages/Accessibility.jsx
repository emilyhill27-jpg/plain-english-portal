export default function Accessibility() {
  return (
    <>
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">Accessibility</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              Plainly is designed for neuroinclusive accessibility from the
              ground up &mdash; not as an afterthought.
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-ink">Standards we build to</h2>
              <div className="mt-4 space-y-4">
                <div className="card">
                  <h3 className="font-semibold text-ink">WCAG 2.2 AA</h3>
                  <p className="mt-2 text-sm text-ink-mid leading-relaxed">
                    The international standard for web accessibility. Level AA is the
                    legally recognised benchmark. We meet requirements for colour contrast,
                    text resizing, keyboard access, clear labels, and page structure.
                  </p>
                </div>
                <div className="card">
                  <h3 className="font-semibold text-ink">COGA cognitive accessibility</h3>
                  <p className="mt-2 text-sm text-ink-mid leading-relaxed">
                    W3C guidelines specifically for people with cognitive and learning
                    disabilities: ADHD, dyslexia, autism, low literacy. Clear navigation,
                    plain content, familiar patterns, personalisation, and low cognitive load.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">What this means in practice</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink-mid">
                {[
                  "Lexend typeface throughout — designed to reduce visual stress for dyslexic readers",
                  "User-controlled text size, line spacing, font choice, and background tint",
                  "Audio playback with speed control and word-by-word highlighting",
                  "Minimum line height of 1.6 throughout — no tight text",
                  "Colour contrast meeting 4.5:1 for all text",
                  "Predictable, consistent layout — no surprise interactions or motion",
                  "All functions usable by keyboard",
                  "Clean, low-stimulation design — no pop-ups, no dark patterns, no ads",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-safe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">Reporting issues</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                If you find an accessibility barrier on this site, please
                contact us at{" "}
                <a href="mailto:hello@tryplainly.co.nz" className="text-accent no-underline hover:underline">
                  hello@tryplainly.co.nz
                </a>.
                We take every report seriously and will work to resolve it.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
