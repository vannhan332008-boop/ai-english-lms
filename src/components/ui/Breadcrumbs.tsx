import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  className?: string
  customItems?: { label: string; href?: string }[]
}

const routeNameMap: Record<string, string> = {
  admin: 'Center Admin',
  dashboard: 'Dashboard',
  analytics: 'Analytics & KPIs',
  centers: 'Centers & Branches',
  classes: 'Classes & Cohorts',
  courses: 'Curriculum & Courses',
  teachers: 'Teachers & Tutors',
  students: 'Student Directory',
  staff: 'Staff & Roles',
  subscriptions: 'Subscriptions',
  billing: 'Billing & Invoices',
  'ai-studio': 'AI Assistant Studio',
  settings: 'Settings & Security',
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className, customItems }) => {
  const location = useLocation()

  const items = customItems || (() => {
    const paths = location.pathname.split('/').filter(Boolean)
    return paths.map((path, idx) => {
      const href = '/' + paths.slice(0, idx + 1).join('/')
      const label = routeNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
      return {
        label,
        href: idx === paths.length - 1 ? undefined : href,
      }
    })
  })()

  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs text-muted-foreground', className)}>
      <ol className="flex items-center space-x-1.5 overflow-hidden">
        <li className="flex items-center">
          <Link
            to="/admin/dashboard"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center space-x-1.5">
              <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-xs"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

