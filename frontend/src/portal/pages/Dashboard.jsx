import { Link } from 'react-router-dom'
import { Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '../components/StatusBadge'
import { useAuthStore } from '../stores/authStore'
import { usePermission } from '../lib/portalPermissions'
import { MOCK_DOCUMENTS, MOCK_ACTIVITY, formatDate } from '../lib/mockData'
import { DOCUMENT_STATUS } from '../lib/statusTransitions'

function StatusSummaryCard({ label, count, status }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-mid">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ink">{count}</p>
      <div className="mt-2">
        <StatusBadge status={status} />
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const user = useAuthStore(s => s.user)
  const canUpload = usePermission('upload')

  const docs = MOCK_DOCUMENTS
  const counts = {
    draft:    docs.filter(d => d.status === DOCUMENT_STATUS.DRAFT).length,
    approved: docs.filter(d => d.status === DOCUMENT_STATUS.APPROVED).length,
    active:   docs.filter(d => d.status === DOCUMENT_STATUS.ACTIVE).length,
    inactive: docs.filter(d => d.status === DOCUMENT_STATUS.INACTIVE).length,
  }

  const needsAttention = docs.filter(d => d.status === DOCUMENT_STATUS.DRAFT)

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-ink-mid">
            Here's your document set at a glance.
          </p>
        </div>
        {canUpload && (
          <Button asChild>
            <Link to="/portal/documents/new">
              <Plus className="h-4 w-4" />
              Upload document
            </Link>
          </Button>
        )}
      </div>

      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusSummaryCard label="Draft" count={counts.draft} status="draft" />
        <StatusSummaryCard label="Approved" count={counts.approved} status="approved" />
        <StatusSummaryCard label="Active" count={counts.active} status="active" />
        <StatusSummaryCard label="Inactive" count={counts.inactive} status="inactive" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Needs attention */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">
            Needs attention
          </h2>
          {needsAttention.length === 0 ? (
            <Card className="p-5">
              <p className="text-sm text-ink-soft">Nothing needs attention right now.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {needsAttention.map(doc => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warn" />
                      <div>
                        <p className="text-sm font-medium text-ink">{doc.display_name}</p>
                        <p className="text-xs text-ink-soft mt-0.5">
                          Uploaded {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/portal/documents/${doc.id}`}
                      className="text-xs font-medium text-accent no-underline hover:underline whitespace-nowrap"
                    >
                      Review →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
            <Link
              to="/portal/activity"
              className="text-xs text-accent no-underline hover:underline"
            >
              View all →
            </Link>
          </div>
          <Card className="divide-y divide-frame">
            {MOCK_ACTIVITY.slice(0, 5).map(entry => (
              <div key={entry.id} className="px-4 py-3">
                <p className="text-sm text-ink-mid">{entry.action}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {formatDate(entry.timestamp)} · {entry.user.name}
                </p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
