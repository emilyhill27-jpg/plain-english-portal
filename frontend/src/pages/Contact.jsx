export default function Contact() {
  return (
    <>
      <section className="border-b border-frame bg-frame-bg">
        <div className="page-container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-ink md:text-4xl">Contact</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-mid">
              A real person reads every message.
            </p>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="page-container">
          <div className="mx-auto max-w-md text-center">
            <div className="card space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-ink">Email</h2>
                <a
                  href="mailto:hello@tryplainly.co.nz"
                  className="mt-1 block text-accent no-underline hover:underline"
                >
                  hello@tryplainly.co.nz
                </a>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Phone</h2>
                <a
                  href="tel:+64214468719"
                  className="mt-1 block text-ink-mid no-underline hover:text-ink"
                >
                  021 468 719
                </a>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Location</h2>
                <p className="mt-1 text-ink-mid">Far North, New Zealand</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
