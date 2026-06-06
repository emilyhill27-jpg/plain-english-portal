import { cn } from '@/lib/utils'

/**
 * CategoryChip — accessible category label with icon, colour, and text.
 *
 * Three cues per category (never colour alone):
 *   1. Icon shape
 *   2. Colour tint + left border
 *   3. Text label
 *
 * Props:
 *  - category: object from CATEGORIES (must have Icon, label, bg, border)
 *  - size:     'sm' | 'md' (default 'md')
 *  - className: optional extra classes
 */
export function CategoryChip({ category, size = 'md', className }) {
  if (!category) return null

  const { Icon, label, bg, border } = category

  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-2 text-sm gap-2',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border-l-[3px] font-medium',
        sizes[size],
        className
      )}
      style={{
        backgroundColor: bg,
        borderLeftColor: border,
      }}
    >
      <Icon
        className={cn('flex-shrink-0', iconSizes[size])}
        style={{ color: border }}
        aria-hidden="true"
      />
      <span className="text-ink">{label}</span>
    </span>
  )
}
