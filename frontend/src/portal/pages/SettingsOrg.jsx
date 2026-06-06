import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { PermissionDenied } from '../components/PermissionDenied'
import { usePermission } from '../lib/portalPermissions'
import { useAuthStore } from '../stores/authStore'

export default function SettingsOrg() {
  const canManage = usePermission('manage_settings')
  const organisation = useAuthStore(s => s.organisation)

  if (!canManage) return <PermissionDenied />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Organisation</h1>

      <Card className="max-w-lg p-6">
        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organisation name</Label>
            <Input id="org-name" defaultValue={organisation?.name ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-email">Primary contact email</Label>
            <Input id="org-email" type="email" placeholder="contact@organisation.co.nz" />
          </div>
          <div className="space-y-2">
            <Label>Plainly account ID</Label>
            <Input value={organisation?.id ?? ''} readOnly className="bg-frame-bg text-ink-faint" />
            <p className="text-xs text-ink-faint">Read-only. Use this when contacting support.</p>
          </div>
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  )
}
