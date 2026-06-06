import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronDown, ChevronUp, FileText, Download,
  ChevronLeft, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { usePermission } from '../lib/portalPermissions'
import { primaryActionForStatus } from '../lib/statusTransitions'
import { MOCK_DOCUMENTS, MOCK_ACTIVITY, formatDate, formatFileSize } from '../lib/mockData'

const CONFIRMATION_CONFIG = {
  approve: {
    title: 'Approve this document?',
    body: 'By approving, you confirm this file has been reviewed and is ready to be published.',
    confirmLabel: 'Approve document',
    confirmVariant: 'primary',
    requiresNote: true,
    noteLabel: 'Approval note (optional)',
    noteRequired: false,
  },
  publish: {
    title: 'Publish this document?',
    body: 'This document will be added to your active list and become visible to your users.',
    confirmLabel: 'Publish document',
    confirmVariant: 'primary',
    requiresNote: false,
    noteLabel: '',
    noteRequired: false,
  },
  deactivate: {
    title: 'Deactivate this document?',
    body: 'This document will no longer be visible to your users. It will not be deleted. Deactivation keeps this document available for audit under your Rulebook.',
    confirmLabel: 'Deactivate document',
    confirmVariant: 'danger',
    requiresNote: true,
    noteLabel: 'Reason for deactivation',
    noteRequired: true,
  },
  republish: {
    title: 'Republish this document?',
    body: 'This document will be added back to your active list and become visible to your users.',
    confirmLabel: 'Republish',
    confirmVariant: 'primary',
    requiresNote: false,
    noteLabel: '',
    noteRequired: false,
  },
  replace_file: {
    title: 'Replace this file?',
    body: 'Replacing the file will reset this document to Draft status. It will need to be reviewed and approved again before users can see it. This replacement and the previous version are recorded in your activity log under your Rulebook.',
    confirmLabel: 'Replace file',
    confirmVariant: 'primary',
    requiresNote: false,
    noteLabel: '',
    noteRequired: false,
  },
}

function DetailRow({ label, value }) {
  return (
    <div className="flex gap-4 py-3 border-b border-frame last:border-0">
      <span className="w-40 flex-shrink-0 text-sm text-ink-soft">{label}</span>
      <span className="text-sm text-ink">{value || '—'}</span>
    </div>
  )
}

export default function DocumentDetail() {
  const { documentId } = useParams()
  const navigate = useNavigate()
  const canAct = usePermission('approve') // any admin action

  const [pendingAction, setPendingAction] = useState(null)
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [doc, setDoc] = useState(() =>
    MOCK_DOCUMENTS.find(d => d.id === documentId)
  )
  const [actionBanner, setActionBanner] = useState(null)

  const activity = MOCK_ACTIVITY.filter(a => a.document_id === documentId)

  if (!doc) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-ink-mid">Document not found.</p>
        <Link to="/portal/documents" className="mt-2 block text-sm text-accent hover:underline">
          ← Back to documents
        </Link>
      </div>
    )
  }

  const primaryAction = primaryActionForStatus(doc.status)

  function handleConfirm(note) {
    // Mock status transitions — replace with API mutations when backend is ready
    const transitions = {
      approve:    'approved',
      publish:    'active',
      deactivate: 'inactive',
      republish:  'active',
    }
    const newStatus = transitions[pendingAction]
    setDoc(prev => ({ ...prev, status: newStatus, updated_at: new Date().toISOString() }))
    setActionBanner(`Document ${pendingAction === 'approve' ? 'approved' : pendingAction === 'publish' ? 'published' : pendingAction === 'deactivate' ? 'deactivated' : 'republished'} successfully.`)
    setPendingAction(null)
    setTimeout(() => setActionBanner(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/portal/documents')}
        className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to documents
      </button>

      {/* Banner */}
      {actionBanner && (
        <div className="rounded-md border border-safe/20 bg-safe-light px-4 py-3 text-sm text-safe">
          {actionBanner}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">{doc.display_name}</h1>
            <StatusBadge status={doc.status} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">{doc.category}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {canAct && primaryAction && (
            <Button
              variant={primaryAction.action === 'deactivate' ? 'secondary' : 'default'}
              className={primaryAction.action === 'deactivate' ? 'text-warn border-warn/30 hover:bg-warn-light' : ''}
              onClick={() => setPendingAction(primaryAction.action)}
            >
              {primaryAction.label}
            </Button>
          )}
          <Button variant="secondary" onClick={() => window.open(doc.file_url, '_blank')}>
            <Download className="h-4 w-4" />
            View file
          </Button>
        </div>
      </div>

      {/* Secondary actions */}
      {canAct && (
        <div className="flex gap-3 border-t border-frame pt-4">
          <button className="text-sm text-accent hover:underline" onClick={() => setPendingAction('replace_file')}>Replace file</button>
          <span className="text-frame-frame">·</span>
          <button className="text-sm text-accent hover:underline">Edit details</button>
        </div>
      )}

      {/* Document details */}
      <Card className="p-0">
        <div className="border-b border-frame px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Document details</h2>
        </div>
        <div className="px-5">
          <DetailRow label="Display name" value={doc.display_name} />
          <DetailRow label="Internal reference" value={doc.internal_ref} />
          <DetailRow label="Category" value={doc.category} />
          <DetailRow label="Description" value={doc.description} />
        </div>
      </Card>

      {/* Current version */}
      <Card className="p-0">
        <div className="border-b border-frame px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Current version</h2>
        </div>
        <div className="px-5">
          <DetailRow label="File" value={
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-ink-faint" />
              {doc.file_name}
            </span>
          } />
          <DetailRow label="Size" value={formatFileSize(doc.file_size)} />
          <DetailRow label="Version" value={`v${doc.version_number}`} />
          <DetailRow label="Uploaded by" value={`${doc.uploaded_by.name} on ${formatDate(doc.uploaded_at)}`} />
          {doc.approved_by && (
            <DetailRow label="Approved by" value={`${doc.approved_by.name} on ${formatDate(doc.approved_at)}${doc.approval_note ? ` — "${doc.approval_note}"` : ''}`} />
          )}
          {doc.published_by && (
            <DetailRow label="Published by" value={`${doc.published_by.name} on ${formatDate(doc.published_at)}`} />
          )}
          {doc.deactivated_by && (
            <DetailRow label="Deactivated by" value={`${doc.deactivated_by.name} on ${formatDate(doc.deactivated_at)} — "${doc.deactivation_reason}"`} />
          )}
        </div>
      </Card>

      {/* Version history (collapsed) */}
      <Card className="p-0">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <h2 className="text-sm font-semibold text-ink">Version history</h2>
          {historyExpanded
            ? <ChevronUp className="h-4 w-4 text-ink-soft" />
            : <ChevronDown className="h-4 w-4 text-ink-soft" />
          }
        </button>
        {historyExpanded && (
          <div className="border-t border-frame px-5 py-4">
            <p className="text-sm text-ink-soft">
              {doc.version_number === 1
                ? 'No previous versions. This is the first version of this document.'
                : 'Previous versions would appear here.'
              }
            </p>
          </div>
        )}
      </Card>

      {/* Activity */}
      <Card className="p-0">
        <div className="border-b border-frame px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Activity</h2>
        </div>
        {activity.length === 0 ? (
          <div className="px-5 py-4">
            <p className="text-sm text-ink-soft">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-frame">
            {activity.map(entry => (
              <div key={entry.id} className="px-5 py-3">
                <p className="text-sm text-ink-mid">{entry.action}</p>
                {entry.detail && (
                  <p className="text-xs text-ink-soft mt-0.5">{entry.detail}</p>
                )}
                <p className="text-xs text-ink-faint mt-1">
                  {formatDate(entry.timestamp)} · {entry.user.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmation modal */}
      {pendingAction && (
        <ConfirmationModal
          isOpen={true}
          {...CONFIRMATION_CONFIG[pendingAction]}
          documentName={doc.display_name}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
          isSubmitting={false}
        />
      )}
    </div>
  )
}
