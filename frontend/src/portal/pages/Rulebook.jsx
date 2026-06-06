import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Rulebook() {
  return (
    <div className="max-w-2xl space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-semibold text-ink">Rulebook & guidance</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-mid">
          Your organisation portal follows a governed workflow.
          Every document goes through clear stages before your users see it.
          The approved document is always the source of truth.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-mid">
          Every action taken in this portal is recorded automatically.
          Nothing can be edited or removed from the activity log.
          This gives you a complete audit trail at all times.
        </p>
      </div>

      {/* Key rules */}
      <Card className="p-0">
        <div className="border-b border-frame px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Key rules</h2>
        </div>
        <ul className="space-y-3 px-5 py-4">
          <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-mid">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            Documents move through set stages: Draft → Approved → Active → Inactive.
            Each step needs a deliberate action — nothing happens automatically.
          </li>
          <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-mid">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            Documents cannot be deleted. If a document is no longer needed, it is deactivated.
            Deactivated documents stay in the system for your records.
          </li>
          <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-mid">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            When you replace a file or change key details, the document resets to Draft.
            This makes sure any updated content goes through review again before users see it.
          </li>
          <li className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-mid">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            Every action is logged — uploads, approvals, status changes, file replacements.
            Logs are append-only. No one can edit or remove entries.
          </li>
        </ul>
      </Card>

      {/* Status flow */}
      <Card className="p-0">
        <div className="border-b border-frame px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Status flow</h2>
        </div>
        <div className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md border border-frame bg-frame-light px-3 py-1.5 font-medium text-ink-mid">Draft</span>
            <span className="text-ink-faint">→</span>
            <span className="rounded-md border border-accent/20 bg-accent-light px-3 py-1.5 font-medium text-accent">Approved</span>
            <span className="text-ink-faint">→</span>
            <span className="rounded-md border border-safe/20 bg-safe-light px-3 py-1.5 font-medium text-safe">Active</span>
            <span className="text-ink-faint">→</span>
            <span className="rounded-md border border-warn/20 bg-warn-light px-3 py-1.5 font-medium text-warn">Inactive</span>
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Inactive documents can be republished back to Active.
            Replacing a file or changing key details resets the document to Draft.
          </p>
        </div>
      </Card>

      {/* Full rulebook link */}
      <div>
        <a
          href="https://tryplainly.co.nz/how-it-works"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent no-underline hover:underline"
        >
          View full Rulebook on the Plainly site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
