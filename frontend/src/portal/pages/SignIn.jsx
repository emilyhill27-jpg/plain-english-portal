import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '../stores/authStore'

// Phase A: mock sign-in. Replace with API call when backend is ready.
const MOCK_USERS = {
  'admin@example.com': {
    user: { id: '1', name: 'Emily Hill', email: 'admin@example.com', role: 'admin' },
    organisation: { id: 'org1', name: 'Northland Community Law', sector: 'community_law' },
    token: 'mock-admin-token',
  },
  'viewer@example.com': {
    user: { id: '2', name: 'Alex Smith', email: 'viewer@example.com', role: 'viewer' },
    organisation: { id: 'org1', name: 'Northland Community Law', sector: 'community_law' },
    token: 'mock-viewer-token',
  },
}

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const signIn = useAuthStore(s => s.signIn)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const returnTo = searchParams.get('returnTo') || '/portal/dashboard'
  const reason = searchParams.get('reason')

  // Already signed in — redirect via effect (not during render)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true })
    }
  }, [isAuthenticated, returnTo, navigate])

  if (isAuthenticated) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Simulate network delay
    await new Promise(r => setTimeout(r, 600))

    const match = MOCK_USERS[email.toLowerCase()]
    if (!match || password.length < 1) {
      setError("We couldn't sign you in. Check your email and password and try again.")
      setIsSubmitting(false)
      return
    }

    signIn(match.user, match.organisation, match.token)
    navigate(returnTo, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-frame-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo-plainly.png" alt="Plainly" className="mx-auto h-10" />
          <h1 className="mt-6 text-xl font-semibold text-ink">
            Sign in to your organisation portal
          </h1>
        </div>

        {reason === 'timeout' && (
          <div className="mb-5 rounded-md border border-warn/20 bg-warn-light px-4 py-3 text-sm text-warn">
            Your session has expired. Sign in again to continue.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-md border border-frame bg-white px-4 py-3 text-sm text-ink-mid">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@organisation.co.nz"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-ink-faint">
          Forgot your password?{' '}
          <a href="mailto:hello@tryplainly.co.nz" className="text-accent hover:underline">
            Contact support
          </a>
        </p>

        {/* Dev helper — remove before launch */}
        <div className="mt-8 rounded-md border border-frame bg-frame-bg p-3 text-xs text-ink-faint">
          <p className="font-medium text-ink-soft mb-1">Dev sign-in (remove before launch)</p>
          <p>Admin: admin@example.com / anypassword</p>
          <p>Viewer: viewer@example.com / anypassword</p>
        </div>
      </div>
    </div>
  )
}
