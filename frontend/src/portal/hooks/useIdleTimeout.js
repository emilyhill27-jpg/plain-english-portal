import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

const TIMEOUT_MS = 60 * 60 * 1000 // 60 minutes

export function useIdleTimeout() {
  const signOut = useAuthStore(s => s.signOut)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let timer

    function reset() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        signOut()
        navigate(
          `/portal/sign-in?reason=timeout&returnTo=${encodeURIComponent(location.pathname)}`
        )
      }, TIMEOUT_MS)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
