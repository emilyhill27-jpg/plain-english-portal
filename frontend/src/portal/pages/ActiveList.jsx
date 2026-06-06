import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GripVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '../components/StatusBadge'
import { usePermission } from '../lib/portalPermissions'
import { MOCK_DOCUMENTS } from '../lib/mockData'

export default function ActiveList() {
  const canReorder = usePermission('reorder')
  const [docs, setDocs] = useState(
    MOCK_DOCUMENTS
      .filter(d => d.status === 'active')
      .sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
  )

  function moveUp(index) {
    if (index === 0) return
    const next = [...docs]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setDocs(next)
  }

  function moveDown(index) {
    if (index === docs.length - 1) return
    const next = [...docs]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setDocs(next)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Active list</h1>
        <p className="mt-1 text-sm text-ink-mid">
          {canReorder
            ? 'Use the arrow buttons to control the order your users see documents.'
            : 'The order in which documents appear to your users.'}
        </p>
      </div>

      {docs.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-ink-mid">No documents are active yet.</p>
          <Link to="/portal/documents" className="mt-2 block text-sm text-accent hover:underline">
            Go to documents →
          </Link>
        </Card>
      ) : (
        <Card className="divide-y divide-frame p-0">
          {docs.map((doc, i) => (
            <div key={doc.id} className="flex items-center gap-4 px-5 py-4">
              {canReorder && (
                <GripVertical className="h-4 w-4 flex-shrink-0 text-ink-faint cursor-grab" />
              )}
              <span className="w-6 flex-shrink-0 text-sm font-medium text-ink-faint text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/portal/documents/${doc.id}`}
                  className="text-sm font-medium text-ink no-underline hover:text-accent"
                >
                  {doc.display_name}
                </Link>
                <p className="text-xs text-ink-faint mt-0.5">{doc.category}</p>
              </div>
              <StatusBadge status={doc.status} />
              {canReorder && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="rounded p-1 text-ink-faint hover:bg-frame-light hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(i)}
                    disabled={i === docs.length - 1}
                    className="rounded p-1 text-ink-faint hover:bg-frame-light hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
