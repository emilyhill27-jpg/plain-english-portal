import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePermission } from '../lib/portalPermissions'
import { MOCK_ACTIVITY, formatDate } from '../lib/mockData'

export default function ActivityLog() {
  const canExport = usePermission('export_activity')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Activity log</h1>
          <p className="mt-1 text-sm text-ink-mid">
            A complete record of all actions taken in this portal.
            Use this activity log as part of your governance evidence under the{' '}
            <Link to="/portal/settings/rulebook" className="text-accent hover:underline">Plainly Rulebook</Link>.
          </p>
        </div>
        {canExport && (
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      <Card className="divide-y divide-frame p-0">
        {MOCK_ACTIVITY.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-ink-soft">No activity recorded yet.</p>
          </div>
        ) : (
          MOCK_ACTIVITY.map(entry => (
            <div key={entry.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-ink">{entry.action}</p>
                  {entry.detail && (
                    <p className="mt-0.5 text-xs text-ink-soft">{entry.detail}</p>
                  )}
                  <p className="mt-1 text-xs text-ink-faint">
                    {formatDate(entry.timestamp)} · {entry.user.name}
                  </p>
                </div>
                {entry.document_id && (
                  <Link
                    to={`/portal/documents/${entry.document_id}`}
                    className="text-xs text-accent no-underline hover:underline whitespace-nowrap flex-shrink-0"
                  >
                    View document →
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
