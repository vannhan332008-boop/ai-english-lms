import React from 'react'
import { Outlet } from 'react-router-dom'
import { ClientHeader } from '@/components/layout/ClientHeader'
import { ClientFooter } from '@/components/layout/ClientFooter'

export interface MainLayoutProps {
  children?: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Client Header with dynamic frosted scroll effect */}
      <ClientHeader />

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        {children || <Outlet />}
      </main>

      {/* Client Footer */}
      <ClientFooter />
    </div>
  )
}

export default MainLayout

