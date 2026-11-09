import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { TenantThemeService } from '@/services/tenantThemeService'
import type { TenantTheme, UpdateTenantBrandPayload } from '@/services/tenantThemeService'
import { useToast } from '@/hooks/useToast'

interface TenantThemeContextType {
  theme: TenantTheme
  isLoading: boolean
  updateTheme: (payload: UpdateTenantBrandPayload, targetTenantId?: string) => Promise<TenantTheme>
  refreshTheme: () => Promise<void>
}

const defaultTheme: TenantTheme = {
  id: null,
  name: 'EnglishFlow LMS',
  code: 'DEFAULT',
  domain: null,
  customDomain: null,
  logoUrl: null,
  primaryColor: '#4f46e5',
  secondaryColor: '#06b6d4',
  faviconUrl: null,
}

const TenantThemeContext = createContext<TenantThemeContextType | undefined>(undefined)

/**
 * Convert Hex Color (#RRGGBB) to HSL representation ("H S% L%")
 * For Tailwind CSS variables compatibility
 */
function hexToHsl(hex: string): string {
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('')
  }
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      case b:
        h = ((r - g) / d + 4) * 60
        break
    }
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Apply tenant branding styles to root document
 */
function applyThemeToDocument(theme: TenantTheme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const primaryHsl = hexToHsl(theme.primaryColor || '#4f46e5')
  const secondaryHsl = hexToHsl(theme.secondaryColor || '#06b6d4')

  // Set Tailwind HSL variables
  root.style.setProperty('--primary', primaryHsl)
  root.style.setProperty('--sidebar-primary', primaryHsl)
  root.style.setProperty('--ring', primaryHsl)
  root.style.setProperty('--accent', secondaryHsl)

  // Set direct hex variables
  root.style.setProperty('--tenant-primary', theme.primaryColor || '#4f46e5')
  root.style.setProperty('--tenant-secondary', theme.secondaryColor || '#06b6d4')
  root.style.setProperty('--primary-color', theme.primaryColor || '#4f46e5')
  root.style.setProperty('--secondary-color', theme.secondaryColor || '#06b6d4')

  // Update dynamic favicon if present
  if (theme.faviconUrl) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = theme.faviconUrl
  }
}

export const TenantThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<TenantTheme>(defaultTheme)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { success, error: toastError } = useToast()

  const refreshTheme = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await TenantThemeService.getTheme()
      if (data) {
        setTheme(data)
        applyThemeToDocument(data)
      }
    } catch (error) {
      console.warn('⚠️ [TenantThemeProvider] Could not load tenant theme, using default:', error)
      applyThemeToDocument(defaultTheme)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshTheme()
  }, [refreshTheme])

  /**
   * Pessimistic Update:
   * 1. Await API response 200/201
   * 2. Only on success, update state and reapply CSS variables
   * 3. Show Toast notification
   */
  const updateTheme = async (payload: UpdateTenantBrandPayload, targetTenantId?: string): Promise<TenantTheme> => {
    try {
      const updated = await TenantThemeService.updateTheme(payload, targetTenantId)
      setTheme(updated)
      applyThemeToDocument(updated)
      success('Cập nhật thương hiệu thành công', 'Cấu hình giao diện đã được đồng bộ toàn hệ thống.')
      return updated
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể lưu thương hiệu'
      toastError('Lỗi cập nhật', msg)
      throw err
    }
  }

  return (
    <TenantThemeContext.Provider value={{ theme, isLoading, updateTheme, refreshTheme }}>
      {children}
    </TenantThemeContext.Provider>
  )
}

export const useTenantTheme = (): TenantThemeContextType => {
  const context = useContext(TenantThemeContext)
  if (!context) {
    throw new Error('useTenantTheme must be used within a TenantThemeProvider')
  }
  return context
}
