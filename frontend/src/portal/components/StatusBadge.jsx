import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_STYLES } from '../lib/statusTransitions'

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] ?? 'bg-frame-light text-ink-mid border-frame',
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
