import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReaderProvider } from '@/components/ReaderSupport'
import PortalLayout from './PortalLayout'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import DocumentList from './pages/DocumentList'
import DocumentDetail from './pages/DocumentDetail'
import ActiveList from './pages/ActiveList'
import ActivityLog from './pages/ActivityLog'
import SettingsOrg from './pages/SettingsOrg'
import SettingsTeam from './pages/SettingsTeam'
import Rulebook from './pages/Rulebook'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
})

export default function PortalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReaderProvider>
        <Routes>
          {/* Public */}
          <Route path="sign-in" element={<SignIn />} />

          {/* Protected — all inside PortalLayout */}
          <Route element={<PortalLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<DocumentList />} />
            <Route path="documents/new" element={<DocumentList />} />
            <Route path="documents/:documentId" element={<DocumentDetail />} />
            <Route path="active-list" element={<ActiveList />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path="settings/organisation" element={<SettingsOrg />} />
            <Route path="settings/team" element={<SettingsTeam />} />
            <Route path="settings/rulebook" element={<Rulebook />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </ReaderProvider>
    </QueryClientProvider>
  )
}
