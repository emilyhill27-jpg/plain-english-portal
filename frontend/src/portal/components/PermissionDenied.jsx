import { ShieldOff } from 'lucide-react'

export function PermissionDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-frame-light">
        <ShieldOff className="h-5 w-5 text-ink-soft" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink">
        You don't have permission to view this page.
      </h2>
      <p className="mt-2 text-sm text-ink-mid">
        Contact your organisation admin if you think this is wrong.
      </p>
    </div>
  )
}
