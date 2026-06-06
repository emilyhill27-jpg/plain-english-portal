export const DOCUMENT_STATUS = {
  DRAFT:    'draft',
  APPROVED: 'approved',
  ACTIVE:   'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
}

const MANUAL_TRANSITIONS = {
  draft:    ['approved'],
  approved: ['active'],
  active:   ['inactive'],
  inactive: ['active'],   // republish
  archived: [],
}

export function canTransition(fromStatus, toStatus) {
  return MANUAL_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false
}

export function primaryActionForStatus(status) {
  const map = {
    draft:    { action: 'approve',    label: 'Mark as approved' },
    approved: { action: 'publish',    label: 'Publish to active list' },
    active:   { action: 'deactivate', label: 'Deactivate' },
    inactive: { action: 'republish',  label: 'Republish' },
    archived: null,
  }
  return map[status] ?? null
}

export const STATUS_LABELS = {
  draft:    'Draft',
  approved: 'Approved',
  active:   'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

export const STATUS_STYLES = {
  draft:    'bg-frame-light text-ink-mid border-frame',
  approved: 'bg-accent-light text-accent border-accent/20',
  active:   'bg-safe-light text-safe border-safe/20',
  inactive: 'bg-warn-light text-warn border-warn/20',
  archived: 'bg-frame-light text-ink-faint border-frame',
}
