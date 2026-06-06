import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export function ConfirmationModal({
  isOpen,
  title,
  body,
  documentName,
  confirmLabel,
  confirmVariant = 'primary',
  requiresNote = false,
  noteLabel = 'Note',
  noteRequired = false,
  onConfirm,
  onCancel,
  isSubmitting = false,
}) {
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')

  if (!isOpen) return null

  function handleConfirm() {
    if (noteRequired && !note.trim()) {
      setNoteError(`${noteLabel} is required.`)
      return
    }
    setNoteError('')
    onConfirm(note.trim() || undefined)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-frame bg-white p-6 shadow-elevated">
        <h2 className="text-base font-semibold text-ink">{title}</h2>

        {documentName && (
          <p className="mt-1 text-sm font-medium text-accent">{documentName}</p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-ink-mid">{body}</p>

        {requiresNote && (
          <div className="mt-4 space-y-2">
            <Label htmlFor="modal-note">
              {noteLabel}
              {noteRequired && <span className="ml-1 text-warn">*</span>}
            </Label>
            <Textarea
              id="modal-note"
              value={note}
              onChange={e => { setNote(e.target.value); setNoteError('') }}
              rows={3}
              maxLength={200}
              placeholder="Add a note…"
              className={cn(noteError && 'border-warn')}
            />
            {noteError && (
              <p className="text-xs text-warn">{noteError}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={cn(
              confirmVariant === 'danger' &&
              'bg-red-600 hover:bg-red-700 text-white'
            )}
          >
            {isSubmitting ? 'Saving…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
