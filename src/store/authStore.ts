import { create } from 'zustand'
import {
  authService,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
  type RegisterTenantPayload,
} from '@/services/authService'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (payloadOrEmail: LoginPayload | string, password?: string) => Promise<boolean>
  register: (payload: RegisterPayload) => Promise<boolean>
  registerCenter: (payload: RegisterTenantPayload) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('ef_user_profile')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  token: localStorage.getItem('ef_access_token') || localStorage.getItem('token') || null,
  isAuthenticated: !!(localStorage.getItem('ef_access_token') || localStorage.getItem('token')),
  isLoading: false,
  error: null,

  login: async (payloadOrEmail: LoginPayload | string, password?: string) => {
    set({ isLoading: true, error: null })
    const payload: LoginPayload = typeof payloadOrEmail === 'string'
      ? { email: payloadOrEmail, password: password || '' }
      : payloadOrEmail
    try {
      const data = await authService.login(payload)
      if (data?.tokens?.accessToken && data?.user) {
        localStorage.setItem('ef_access_token', data.tokens.accessToken)
        localStorage.setItem('token', data.tokens.accessToken)
        localStorage.setItem('ef_user_profile', JSON.stringify(data.user))
        localStorage.setItem('ef_active_role', data.user.role)
        if (data.user.tenantId) {
          localStorage.setItem('ef_tenant_id', data.user.tenantId)
        }

        set({
          user: data.user,
          token: data.tokens.accessToken,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }
      throw new Error('Đăng nhập không thành công, vui lòng kiểm tra lại thông tin.')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi đăng nhập'
      set({ error: msg, isLoading: false })
      return false
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.register(payload)
      if (data?.tokens?.accessToken && data?.user) {
        localStorage.setItem('ef_access_token', data.tokens.accessToken)
        localStorage.setItem('token', data.tokens.accessToken)
        localStorage.setItem('ef_user_profile', JSON.stringify(data.user))
        localStorage.setItem('ef_active_role', data.user.role)

        set({
          user: data.user,
          token: data.tokens.accessToken,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }
      throw new Error('Đăng ký không thành công.')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi đăng ký'
      set({ error: msg, isLoading: false })
      return false
    }
  },

  registerCenter: async (payload: RegisterTenantPayload) => {
    set({ isLoading: true, error: null })
    try {
      const data = await authService.registerTenant(payload)
      if (data?.tokens?.accessToken && data?.user) {
        localStorage.setItem('ef_access_token', data.tokens.accessToken)
        localStorage.setItem('token', data.tokens.accessToken)
        localStorage.setItem('ef_user_profile', JSON.stringify(data.user))
        localStorage.setItem('ef_active_role', data.user.role)
        if (data.user.tenantId) {
          localStorage.setItem('ef_tenant_id', data.user.tenantId)
        }

        set({
          user: data.user,
          token: data.tokens.accessToken,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      }
      throw new Error('Đăng ký trung tâm thất bại, vui lòng kiểm tra lại thông tin.')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi đăng ký trung tâm'
      set({ error: msg, isLoading: false })
      throw new Error(msg)
    }
  },

  logout: async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('ef_access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('ef_user_profile')
      localStorage.removeItem('ef_active_role')
      localStorage.removeItem('ef_tenant_id')

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      })
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('ef_access_token') || localStorage.getItem('token')
    if (!token) {
      set({ isAuthenticated: false, user: null })
      return
    }

    try {
      const user = await authService.getProfile()
      if (user) {
        set({ user, isAuthenticated: true })
      } else {
        set({ user: null, isAuthenticated: false })
      }
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },

  setUser: (user: AuthUser | null) => set({ user, isAuthenticated: !!user }),
}))
