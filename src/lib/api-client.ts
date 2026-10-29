import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token from localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ef_access_token') || localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Attach active tenant context if available
    const activeTenantId = localStorage.getItem('ef_tenant_id')
    if (activeTenantId && config.headers && !config.headers['X-Tenant-ID']) {
      config.headers['X-Tenant-ID'] = activeTenantId
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Unauthorized & Token Expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear expired auth session
      localStorage.removeItem('ef_access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('ef_user_profile')

      // Avoid infinite redirect loops if already on login page
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        console.warn('🔒 [API] Session expired or unauthorized. Redirecting to login...')
        window.location.href = '/login?expired=true'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
