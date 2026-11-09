import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const getNormalizedBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
  const trimmed = envUrl.replace(/\/+$/, '')
  if (trimmed.endsWith('/api/v1')) return trimmed
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`
  return `${trimmed}/api/v1`
}

const API_BASE_URL = getNormalizedBaseUrl()

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

export interface ExecuteMutationOptions<TData> {
  onSuccess?: (data: TData) => void | Promise<void>
  onError?: (error: any) => void | Promise<void>
  onToastSuccess?: (message: string) => void
  onToastError?: (message: string) => void
  successMessage?: string
  errorMessage?: string
}

/**
 * Imperative mutation runner following pessimistic update rules
 */
export async function executeMutation<TData>(
  mutationFn: () => Promise<TData>,
  options: ExecuteMutationOptions<TData> = {}
): Promise<TData | null> {
  try {
    const data = await mutationFn()
    if (options.successMessage && options.onToastSuccess) {
      options.onToastSuccess(options.successMessage)
    }
    if (options.onSuccess) {
      await options.onSuccess(data)
    }
    return data
  } catch (err: any) {
    const rawMsg =
      err.response?.data?.message ||
      err.message ||
      options.errorMessage ||
      'Thao tác thất bại'
    if (options.onToastError) {
      options.onToastError(rawMsg)
    }
    if (options.onError) {
      await options.onError(err)
    }
    return null
  }
}

export default apiClient
