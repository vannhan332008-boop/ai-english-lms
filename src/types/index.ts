export type UserRole = 'super_admin' | 'center_manager' | 'teacher' | 'student'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  centerName?: string
  badge?: string
}

export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: string
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

