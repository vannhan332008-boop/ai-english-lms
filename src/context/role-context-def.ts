import { createContext } from 'react'
import type { MockUserDetail, UserRoleType } from '@/mocks/users'

export interface RoleContextType {
  role: UserRoleType
  user: MockUserDetail
  setRole: (role: UserRoleType) => void
  refreshUser?: () => Promise<void>
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined)

