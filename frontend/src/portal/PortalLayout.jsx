import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, ListOrdered,
  Activity, Settings, LogOut, ChevronRight, BookOpen
} from 'lucide-react'
import { useAuthStore } from './stores/authStore'
import { useIdleTimeout } from './hooks/useIdleTimeout'
import { ReaderToggle, ReaderBar } from '@/components/ReaderSupport'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/portal/dashboard',              label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/portal/documents',             label: 'Documents',    Icon: FileText },
  { to: '/portal/active-list',           label: 'Active list',  Icon: ListOrdered },
  { to: '/portal/activity',              label: 'Activity log', Icon: Activity },
]

const SETTINGS_ITEMS = [
  { to: '/portal/settings/organisation', label: 'Organisation', Icon: Settings },
  { to: '/portal/settings/team',         label: 'Team',         Icon: Settings },
  { to: '/portal/settings/rulebook',     label: 'Rulebook',     Icon: BookOpen },
]

function PortalSidebar() {
  const { user, organisation, signOut } = useAuthStore()

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-frame bg-frame-bg">
      {/* Org name */}
      <div className="border-b border-frame px-5 py-4">
        <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">Organisation</p>
        <p className="mt-0.5 text-sm font-semibold text-ink truncate">
          {organisation?.name ?? '—'}
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors',
              isActive
                ? 'bg-accent-light text-accent'
                : 'text-ink-mid hover:bg-frame-light hover:text-ink'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        <div className="pt-4 pb-1">
          <p className="px-3 text-xs font-medium text-ink-faint uppercase tracking-wide">Settings</p>
        </div>

        {SETTINGS_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors',
              isActive
                ? 'bg-accent-light text-accent'
                : 'text-ink-mid hover:bg-frame-light hover:text-ink'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-frame px-4 py-4">
        <p className="text-xs font-medium text-ink truncate">{user?.name}</p>
        <p className="text-xs text-ink-faint capitalize">{user?.role}</p>
        <button
          onClick={signOut}
          className="mt-3 flex items-center gap-2 text-xs text-ink-soft hover:text-ink transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function PortalTopBar() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-frame bg-white px-6">
      <div className="flex items-center gap-2">
        <img src="/logo-plainly.png" alt="Plainly" className="h-8" />
        <span className="text-xs font-medium text-ink-faint">Admin portal</span>
      </div>
      <ReaderToggle />
    </div>
  )
}

export default function PortalLayout() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  useIdleTimeout()

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/portal/sign-in?returnTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky: top bar + reader bar */}
      <div className="sticky top-0 z-50">
        <PortalTopBar />
        <ReaderBar />
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <PortalSidebar />
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto max-w-5xl px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
