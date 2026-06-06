import { useAuthStore } from '../stores/authStore'

const ADMIN_ACTIONS = [
  'upload', 'edit_details', 'replace_file',
  'approve', 'publish', 'deactivate', 'republish',
  'reorder', 'export_activity',
  'manage_settings', 'manage_team',
]

export function can(role, action) {
  if (role === 'admin') return ADMIN_ACTIONS.includes(action)
  return false
}

export function usePermission(action) {
  const role = useAuthStore(s => s.user?.role)
  return can(role, action)
}

export function useRole() {
  return useAuthStore(s => s.user?.role)
}
