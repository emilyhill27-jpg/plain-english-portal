export default function Terms() {
  return (
    <>
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">Terms of use</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              The rules for using the Plainly service.
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-2xl space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-ink">What Plainly does</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                Plainly produces plain-language explanations of documents that
                have been approved by the sending organisation. It does not
                replace the original document and is not a substitute for
                professional advice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">What Plainly does not do</h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-mid">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">&bull;</span>
                  <span>Plainly does not give legal, medical, or financial advice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">&bull;</span>
                  <span>Plainly does not replace the need to read and act on the original document.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">&bull;</span>
                  <span>Plainly does not guarantee that every explanation is complete or error-free. If the system is not confident, it says so.</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">Access</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                End-user access to Plainly is provided through organisations
                that hold a licence. There is no public sign-up for end users.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">Acceptable use</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                Use Plainly for its intended purpose: understanding documents
                your organisation has approved. Do not attempt to submit
                documents outside the approved list, interfere with the
                system, or use Plainly for any unlawful purpose.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-ink">Changes</h2>
              <p className="mt-3 text-sm text-ink-mid leading-relaxed">
                We may update these terms from time to time. Material changes
                will be communicated to organisations with active licences.
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
