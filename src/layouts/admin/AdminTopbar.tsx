import React from 'react'
import {
  Menu,
  Search,
  Bell,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserDropdown } from '@/components/ui/UserDropdown'
import { RoleSwitcher } from '@/components/common/RoleSwitcher'
import { Button } from '@/components/ui/Button'

interface AdminTopbarProps {
  onOpenMobile: () => void
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onOpenMobile }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/85 px-4 sm:px-6 backdrop-blur-md gap-4">
      {/* Left section: Mobile menu & Breadcrumbs */}
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobile}
          className="lg:hidden text-muted-foreground hover:text-foreground"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Middle section: Role Switcher Bar */}
      <div className="flex items-center justify-center flex-1 max-w-xl">
        <RoleSwitcher />
      </div>

      {/* Right section: System actions & User profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Quick Search Trigger */}
        <div className="hidden 2xl:flex items-center w-48 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm nhanh... (⌘K)"
            className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-input bg-muted/40 focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-all placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border px-1 rounded">
            ⌘K
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
            title="Thông báo hệ thống"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </div>

        {/* Theme mode toggle */}
        <ThemeToggle className="h-8 w-8" />

        <div className="h-4 w-px bg-border mx-1" />

        {/* User profile menu */}
        <UserDropdown />
      </div>
    </header>
  )
}
