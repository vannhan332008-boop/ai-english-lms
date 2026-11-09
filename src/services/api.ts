import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const getNormalizedBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
  const trimmed = envUrl.replace(/\/+$/, '')
  if (trimmed.endsWith('/api/v1')) return trimmed
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`
  return `${trimmed}/api/v1`
}

const API_BASE_URL = getNormalizedBaseUrl()

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token & Tenant ID
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ef_access_token') || localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const tenantId = localStorage.getItem('ef_tenant_id')
    if (tenantId && config.headers && !config.headers['X-Tenant-ID']) {
      config.headers['X-Tenant-ID'] = tenantId
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ef_access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('ef_user_profile')

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/auth/login') &&
        !window.location.pathname.includes('/auth/register')
      ) {
        console.warn('🔒 [API] Session expired or invalid. Redirecting to login...')
      }
    }
    return Promise.reject(error)
  }
)

export default api

