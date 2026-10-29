/* oxlint-disable react/set-state-in-effect */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { mockPersonas, type UserRoleType, type MockUserDetail } from '@/mocks/users'
import { RoleContext } from './role-context-def'
import { apiClient } from '@/lib/api-client'

const personaCredentials: Record<UserRoleType, { email: string; pass: string }> = {
  SUPER_ADMIN: { email: 'superadmin@englishflow.vn', pass: '123456' },
  CENTER_MANAGER: { email: 'manager.hn@englishflow.vn', pass: '123456' },
  TEACHER: { email: 'teacher.david@englishflow.vn', pass: '123456' },
  STUDENT: { email: 'student.nam@englishflow.vn', pass: '123456' },
}

const getRoleLabel = (r: string): string => {
  switch (r) {
    case 'SUPER_ADMIN':
      return 'Tổng Giám đốc Nền tảng (Super Admin)'
    case 'CENTER_MANAGER':
      return 'Giám đốc Cơ sở (Center Manager)'
    case 'TEACHER':
      return 'Giảng viên Chuyên ngữ (Teacher)'
    case 'STUDENT':
      return 'Học viên (Student)'
    default:
      return 'Thành viên EnglishFlow'
  }
}

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRoleType>(() => {
    const saved = localStorage.getItem('ef_active_role') as UserRoleType
    if (saved && mockPersonas[saved]) return saved
    return 'CENTER_MANAGER'
  })

  const [realUser, setRealUser] = useState<any | null>(() => {
    try {
      const savedProfile = localStorage.getItem('ef_user_profile')
      return savedProfile ? JSON.parse(savedProfile) : null
    } catch {
      return null
    }
  })

  const refreshUser = useCallback(async () => {
    try {
      const meRes = await apiClient.get('/auth/me')
      if (meRes.data?.data?.user) {
        const u = meRes.data.data.user
        setRealUser(u)
        localStorage.setItem('ef_user_profile', JSON.stringify(u))
      }
    } catch (err) {
      console.debug('Could not refresh user profile via /auth/me:', err)
    }
  }, [])

  const syncAuthToken = useCallback(
    async (targetRole: UserRoleType) => {
      const creds = personaCredentials[targetRole]
      if (!creds) return

      try {
        const res = await apiClient.post('/auth/login', {
          email: creds.email,
          password: creds.pass,
        })
        const data = res.data?.data
        if (data?.tokens?.accessToken) {
          localStorage.setItem('ef_access_token', data.tokens.accessToken)
          localStorage.setItem('token', data.tokens.accessToken)
          if (data.user?.tenantId) {
            localStorage.setItem('ef_tenant_id', data.user.tenantId)
          }
          if (data.user) {
            setRealUser(data.user)
            localStorage.setItem('ef_user_profile', JSON.stringify(data.user))
          }
        }

        // Fetch complete user profile with tenant info from database
        await refreshUser()
      } catch (err) {
        console.debug('Could not auto-sync persona token:', err)
      }
    },
    [refreshUser]
  )

  const setRole = (newRole: UserRoleType) => {
    setRoleState(newRole)
    localStorage.setItem('ef_active_role', newRole)
    void syncAuthToken(newRole)
  }

  // Derive dynamic user representation from real database profile with fallback to persona
  const user: MockUserDetail = useMemo(() => {
    const fallback = mockPersonas[role]
    if (!realUser || realUser.role !== role) {
      return fallback
    }

    return {
      id: realUser.id || fallback.id,
      name: realUser.fullName || fallback.name,
      email: realUser.email || fallback.email,
      role: (realUser.role as UserRoleType) || role,
      avatar: realUser.avatar || fallback.avatar,
      roleLabel: getRoleLabel(realUser.role || role),
      phone: realUser.phone || fallback.phone,
      centerName: realUser.tenant?.name || fallback.centerName,
      centerCode: realUser.tenant?.code || fallback.centerCode,
      cefrLevel: realUser.cefrLevel || fallback.cefrLevel,
      streakDays: realUser.streakDays ?? fallback.streakDays,
      badge: realUser.role === 'SUPER_ADMIN' ? 'Platform Architect' : 'Verified Member',
      bio: `Tài khoản chính thức xác thực từ cơ sở dữ liệu: ${realUser.fullName} (${realUser.email}).`,
    }
  }, [role, realUser])

  useEffect(() => {
    localStorage.setItem('ef_active_role', role)
    void syncAuthToken(role)
  }, [role, syncAuthToken])

  return (
    <RoleContext.Provider value={{ role, user, setRole, refreshUser }}>
      {children}
    </RoleContext.Provider>
  )
}
