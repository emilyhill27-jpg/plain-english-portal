import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE = import.meta.env.VITE_API_BASE || ''

export const apiClient = axios.create({
  baseURL: `${API_BASE}/portal`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — session expired
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut()
      window.location.href = '/portal/sign-in?reason=timeout'
    }
    return Promise.reject(error)
  }
)

export default apiClient
