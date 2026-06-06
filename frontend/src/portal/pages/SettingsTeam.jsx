import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PermissionDenied } from '../components/PermissionDenied'
import { usePermission } from '../lib/portalPermissions'
import { useAuthStore } from '../stores/authStore'

const MOCK_TEAM = [
  { id: '1', name: 'Emily Hill', email: 'emily@northlandlaw.co.nz', role: 'admin', status: 'active' },
  { id: '2', name: 'Alex Smith', email: 'alex@northlandlaw.co.nz', role: 'viewer', status: 'active' },
]

export default function SettingsTeam() {
  const canManage = usePermission('manage_team')
  const user = useAuthStore(s => s.user)

  if (!canManage) return <PermissionDenied />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Team members</h1>

      {/* Current members */}
      <Card className="divide-y divide-frame p-0">
        {MOCK_TEAM.map(member => (
          <div key={member.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-ink">{member.name}</p>
              <p className="text-xs text-ink-soft">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                {member.role === 'admin' ? 'Admin' : 'Viewer'}
              </Badge>
              {member.id !== user?.id && (
                <button className="text-xs text-ink-soft hover:text-warn transition-colors">
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Invite form */}
      <Card className="max-w-md p-6">
        <h2 className="mb-4 text-sm font-semibold text-ink">Invite a team member</h2>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input id="invite-email" type="email" placeholder="name@organisation.co.nz" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select id="invite-role" defaultValue="viewer">
              <option value="admin">Admin — full access</option>
              <option value="viewer">Viewer — read only</option>
            </Select>
          </div>
          <Button type="submit">Send invite</Button>
        </form>
      </Card>
    </div>
  )
}
