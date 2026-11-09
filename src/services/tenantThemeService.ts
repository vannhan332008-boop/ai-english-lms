import { api } from './api'

export interface TenantTheme {
  id: string | null
  name: string
  code: string
  domain?: string | null
  customDomain?: string | null
  logoUrl?: string | null
  primaryColor: string
  secondaryColor: string
  faviconUrl?: string | null
}

export interface UpdateTenantBrandPayload {
  name?: string
  logoUrl?: string | null
  primaryColor?: string
  secondaryColor?: string
  faviconUrl?: string | null
  customDomain?: string | null
}

export class TenantThemeService {
  /**
   * Fetch current active tenant theme / branding configuration
   */
  static async getTheme(tenantId?: string): Promise<TenantTheme> {
    const response = await api.get('/tenants/theme', {
      params: tenantId ? { tenantId } : undefined,
    })
    return response.data.data
  }

  /**
   * Update center theme & branding (Pessimistic Update pattern)
   */
  static async updateTheme(payload: UpdateTenantBrandPayload, targetTenantId?: string): Promise<TenantTheme> {
    const endpoint = targetTenantId ? `/tenants/${targetTenantId}/brand` : '/tenants/theme'
    const method = targetTenantId ? 'put' : 'patch'
    const response = await api[method](endpoint, payload)
    return response.data.data
  }
}

