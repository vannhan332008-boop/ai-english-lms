import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'danger' | 'warning' | 'info' | 'outline' | 'success'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-primary/10 text-primary hover:bg-primary/20',
    primary: 'border-transparent bg-primary/15 text-primary hover:bg-primary/25',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive/15 text-destructive',
    danger: 'border-transparent bg-rose-500/15 text-rose-600 dark:text-rose-400',
    warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
    info: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400',
    outline: 'text-foreground border-border',
    success: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
export default Badge
