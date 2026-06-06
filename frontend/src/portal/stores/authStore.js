import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,           // { id, name, email, role: 'admin' | 'viewer' }
      organisation: null,   // { id, name, sector }
      token: null,
      isAuthenticated: false,

      signIn: (user, organisation, token) =>
        set({ user, organisation, token, isAuthenticated: true }),

      signOut: () =>
        set({ user: null, organisation: null, token: null, isAuthenticated: false }),

      setUser: (user) => set({ user }),
    }),
    { name: 'plainly-portal-auth' }
  )
)
