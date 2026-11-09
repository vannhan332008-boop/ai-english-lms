import api from './api'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName?: string
  name?: string
  email: string
  password: string
  phone?: string
  tenantCode?: string
  tenantId?: string
  role?: 'SUPER_ADMIN' | 'CENTER_MANAGER' | 'TEACHER' | 'STUDENT'
}

export interface RegisterTenantPayload {
  centerName: string
  adminName: string
  email: string
  password: string
  phone?: string
  plan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  city?: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'SUPER_ADMIN' | 'CENTER_MANAGER' | 'TEACHER' | 'STUDENT'
  tenantId?: string
  avatar?: string
  phone?: string
  cefrLevel?: string
  streakDays?: number
  tenant?: {
    id: string
    name: string
    code: string
    city?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

export interface AuthResponse {
  user: AuthUser
  tokens: {
    accessToken: string
    refreshToken?: string
    expiresIn?: string
  }
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/login', payload)
    return res.data?.data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', payload)
    return res.data?.data
  },

  registerTenant: async (payload: RegisterTenantPayload): Promise<AuthResponse> => {
    const res = await api.post('/tenants/register', payload)
    return res.data?.data
  },

  getProfile: async (): Promise<AuthUser> => {
    const res = await api.get('/auth/me')
    return res.data?.data?.user
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Quiet fail if offline
    } finally {
      localStorage.removeItem('ef_access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('ef_user_profile')
      localStorage.removeItem('ef_tenant_id')
    }
  },
}

export default authService
